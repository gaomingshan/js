# 高并发订单与库存场景建模

## 概述

电商订单与库存是 MongoDB 最经典的高并发场景。本章通过完整的企业级案例，讲解文档模型设计、并发控制、超卖防护和亿级订单架构。

---

## 订单文档模型设计

```js
// 订单文档（订单头 + 订单行嵌入）
{
  "_id": ObjectId("..."),
  "orderId": "ORD-20240115-000001",     // 业务主键（唯一索引）
  "userId": "user_001",
  "status": "pending",                  // pending/paid/shipped/delivered/cancelled
  "version": 1,                         // 乐观锁版本号

  // 嵌入订单行（避免 JOIN）
  "items": [
    {
      "sku": "PHONE-001",
      "name": "iPhone 15 Pro",           // 冗余商品名（快照）
      "qty": 1,
      "unitPrice": 9999.00,
      "subtotal": 9999.00
    }
  ],

  // 嵌入收货地址（快照，与地址簿解耦）
  "shippingAddress": {
    "name": "张三",
    "phone": "138xxx",
    "province": "广东省",
    "city": "深圳市",
    "detail": "南山区科技园xxx"
  },

  // 嵌入支付信息
  "payment": {
    "method": "alipay",
    "transactionId": "TX20240115001",
    "paidAt": ISODate("2024-01-15T10:30:00Z")
  },

  "totalAmount": 9999.00,
  "discountAmount": 0,
  "payableAmount": 9999.00,

  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### 索引设计

```js
// 按用户查询订单列表（最高频）
db.orders.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_user_created" })

// 按订单号查询（唯一）
db.orders.createIndex({ orderId: 1 }, { unique: true, name: "idx_orderid" })

// 按状态+时间查询（运营/客服）
db.orders.createIndex({ status: 1, createdAt: -1 }, { name: "idx_status_created" })

// 分片键（亿级订单）
sh.shardCollection("ecommerce.orders", { userId: "hashed" })
```

---

## 库存文档模型

```js
// 库存文档
{
  "_id": "PHONE-001",                 // sku 作为 _id
  "sku": "PHONE-001",
  "name": "iPhone 15 Pro",
  "qty": 1000,                        // 可用库存
  "reservedQty": 50,                  // 已锁定库存
  "version": 1                        // 乐观锁
}
```

---

## 库存扣减的原子性保证

### 方案1：原子操作（推荐，无锁）

```js
// 使用 $inc + 条件更新，原子性扣减
db.inventory.updateOne(
  {
    sku: "PHONE-001",
    qty: { $gte: 1 }    // 库存检查 + 扣减原子完成
  },
  {
    $inc: { qty: -1, reservedQty: 1 }
  }
)

// 若 modifiedCount === 0 → 库存不足
// 无需显式锁，单文档原子操作天然线程安全
```

### 方案2：乐观锁（高并发冲突场景）

```js
// 读取当前版本
const inventory = db.inventory.findOne({ sku: "PHONE-001" })
const currentVersion = inventory.version

// 带版本号更新（仅当版本匹配时才更新）
const result = db.inventory.updateOne(
  { sku: "PHONE-001", version: currentVersion, qty: { $gte: 1 } },
  { $inc: { qty: -1 }, $set: { version: currentVersion + 1 } }
)

if (result.modifiedCount === 0) {
  // 版本冲突，重试
  throw new Error("并发冲突，请重试")
}
```

### Java 实现（Spring Data MongoDB）

```java
@Service
public class InventoryService {

    @Autowired
    private MongoTemplate mongoTemplate;

    public boolean deductStock(String sku, int qty) {
        UpdateResult result = mongoTemplate.updateFirst(
            new Query(
                Criteria.where("sku").is(sku)
                        .and("qty").gte(qty)  // 库存足够才更新
            ),
            new Update()
                .inc("qty", -qty)
                .inc("reservedQty", qty),
            Inventory.class
        );
        return result.getModifiedCount() > 0;
    }

    // 释放库存（取消订单时）
    public void releaseStock(String sku, int qty) {
        mongoTemplate.updateFirst(
            new Query(Criteria.where("sku").is(sku)),
            new Update()
                .inc("qty", qty)
                .inc("reservedQty", -qty),
            Inventory.class
        );
    }
}
```

---

## 超卖防护

```
超卖防护层次：

1. 应用层：库存缓存（Redis）预检
   → Redis DECRBY 快速拦截大部分无效请求
   → 实际扣减前先查 Redis

2. 数据库层：条件更新（qty >= deductQty）
   → 原子操作，最终保障

3. 兜底层：定时对账
   → 对比 Redis 库存与 MongoDB 库存
   → 发现不一致时修复
```

```java
// Redis + MongoDB 双重防护
public boolean deductStockSafe(String sku, int qty) {
    // 1. Redis 预扣（快速，高并发）
    Long remaining = redisTemplate.opsForValue()
        .decrement("stock:" + sku, qty);

    if (remaining < 0) {
        // Redis 库存不足，回滚 Redis
        redisTemplate.opsForValue().increment("stock:" + sku, qty);
        return false;
    }

    // 2. MongoDB 原子扣减（持久化）
    boolean dbSuccess = inventoryService.deductStock(sku, qty);

    if (!dbSuccess) {
        // DB 扣减失败，回滚 Redis
        redisTemplate.opsForValue().increment("stock:" + sku, qty);
        return false;
    }

    return true;
}
```

---

## 高峰写入削峰方案

```
双十一场景：1000万 QPS 抢购

削峰架构：
  用户请求
     ↓
  Nginx 限流（令牌桶，防穿透）
     ↓
  Redis 预扣库存（毫秒级响应）
     ↓
  MQ 异步队列（削峰填谷）
     ↓
  Consumer 批量写入 MongoDB（有序消费，可控速率）
     ↓
  MongoDB 订单集合
```

---

## 订单状态机与 Change Streams

```js
// 订单状态机
pending → paid → processing → shipped → delivered
       ↘ cancelled（任意非终态可取消）

// Change Streams 驱动状态变更通知
db.orders.watch([
  { $match: { operationType: "update" } }
], { fullDocument: "updateLookup" })
  .on('change', async (change) => {
    const status = change.updateDescription?.updatedFields?.status
    if (status === 'paid') {
      await triggerFulfillment(change.fullDocument)
    }
  })
```

---

## 亿级订单分片策略

```js
// 分片键设计：userId 哈希
// 保证同一用户订单在同一 Shard（查询效率）
// 哈希确保写入均匀（无热点）
sh.shardCollection("ecommerce.orders", { userId: "hashed" })

// 查询：按 userId 查询走单 Shard（高效）
db.orders.find({ userId: "u001" }).sort({ createdAt: -1 }).limit(20)

// 跨 Shard 查询（尽量避免）
db.orders.find({ status: "pending" })  // 广播查询，性能差
// 解决：建立单独的 pending_orders 集合存未处理订单
```

---

## 总结

- 订单文档嵌入订单行和地址，单次读取获取完整订单
- 库存扣减用 `$inc` + 条件更新，原子操作无需显式锁
- 乐观锁（版本号）用于高并发冲突场景的重试控制
- Redis 预扣 + MongoDB 持久化双重防超卖
- 亿级订单：userId 哈希分片，Change Streams 驱动状态机

**下一步**：用户画像与内容推荐场景。
