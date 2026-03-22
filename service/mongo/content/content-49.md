# 多文档事务与一致性边界

## 概述

MongoDB 4.0 引入副本集多文档事务，4.2 扩展至分片集群。事务提供跨文档、跨集合的 ACID 保证，但有明确的性能代价与适用边界。本章深入解析事务机制、使用模式与性能影响。

---

## 单文档原子性 vs 多文档事务

```
单文档原子性（无需事务，推荐优先使用）：
  - MongoDB 对单文档的读-改-写天然原子
  - $inc、$set、$push 等更新操作在单文档内原子执行
  - 嵌入子文档的更新也是原子的

  示例：库存扣减（单文档，无需事务）
  db.inventory.updateOne(
    { sku: 'PHONE-001', qty: { $gte: 1 } },
    { $inc: { qty: -1 } }
  )
  // modifiedCount === 0 表示库存不足

多文档事务（跨文档/跨集合才需要）：
  - 创建订单 + 扣减库存（两个集合）
  - 转账：账户 A 扣款 + 账户 B 入账
  - 订单 + 流水记录同步写入
```

---

## 事务 ACID 保证

```
Atomicity（原子性）：事务内所有操作要么全部提交，要么全部回滚
Consistency（一致性）：事务前后数据满足约束
Isolation（隔离性）：快照隔离，事务读取开始时的一致性快照
Durability（持久性）：提交后写入 Oplog + Journal，崩溃安全
```

---

## 基础用法

### Node.js

```js
const session = client.startSession()
try {
  session.startTransaction({
    readConcern:  { level: 'snapshot' },
    writeConcern: { w: 'majority' }
  })

  // 1. 扣减库存
  const inv = await db.collection('inventory').updateOne(
    { sku: 'PHONE-001', qty: { $gte: 1 } },
    { $inc: { qty: -1 } },
    { session }
  )
  if (inv.modifiedCount === 0) {
    await session.abortTransaction()
    return { ok: false, reason: '库存不足' }
  }

  // 2. 创建订单
  await db.collection('orders').insertOne(
    { orderId: 'ORD-001', userId: 'u001', status: 'paid', amount: 9999 },
    { session }
  )

  await session.commitTransaction()
  return { ok: true }
} catch (err) {
  await session.abortTransaction()
  throw err
} finally {
  await session.endSession()
}
```

### Java：手动管理

```java
@Service
public class OrderTxService {

  @Autowired
  private MongoClient mongoClient;

  @Autowired
  private MongoTemplate mongoTemplate;

  public boolean placeOrder(Order order, String sku, int qty) {
    try (ClientSession session = mongoClient.startSession()) {
      session.startTransaction(
        TransactionOptions.builder()
          .readConcern(ReadConcern.SNAPSHOT)
          .writeConcern(WriteConcern.MAJORITY)
          .build()
      );
      try {
        // 扣库存
        UpdateResult r = mongoTemplate.updateFirst(
          new Query(Criteria.where("sku").is(sku).and("qty").gte(qty)),
          new Update().inc("qty", -qty),
          Inventory.class
        );
        if (r.getModifiedCount() == 0) {
          session.abortTransaction();
          return false;
        }
        // 建订单
        mongoTemplate.insert(order);
        session.commitTransaction();
        return true;
      } catch (Exception e) {
        session.abortTransaction();
        throw e;
      }
    }
  }
}
```

### Java：@Transactional（推荐）

```java
// 配置事务管理器
@Bean
public MongoTransactionManager transactionManager(MongoDatabaseFactory f) {
  return new MongoTransactionManager(f);
}

@Service
public class OrderService {

  @Transactional  // 自动开启/提交/回滚
  public void placeOrder(Order order, String sku, int qty) {
    boolean ok = inventoryService.deductStock(sku, qty);
    if (!ok) throw new InsufficientStockException("库存不足");
    orderRepository.save(order);
    ledgerService.record(order);  // 任意异常 → 自动回滚
  }
}
```

---

## 隔离级别与写冲突

```
快照隔离（Snapshot Isolation）：
  - 事务开始时创建数据快照
  - 读操作始终读快照版本，不受并发写入影响
  - 提交时检测写冲突（Write Conflict）

写冲突（WriteConflict）：
  - 两个并发事务同时修改同一文档
  - 后提交的事务抛出 WriteConflict 错误（错误码 112）
  - 必须在应用层捕获并重试
```

```java
// 事务重试模式（官方推荐）
public void runWithRetry(Runnable txnFunc) {
  while (true) {
    try {
      txnFunc.run();
      break;
    } catch (MongoException e) {
      if (e.hasErrorLabel(MongoException.TRANSIENT_TRANSACTION_ERROR_LABEL)) {
        log.warn("事务冲突，重试...");
        continue;  // WriteConflict、网络抖动等可重试错误
      }
      throw e;
    }
  }
}
```

---

## 事务超时与限制

```js
// 调整事务最大存活时间（默认 60 秒）
db.adminCommand({
  setParameter: 1,
  transactionLifetimeLimitSeconds: 120
})

// 调整锁等待超时
db.adminCommand({
  setParameter: 1,
  maxTransactionLockRequestTimeoutMillis: 20
})
```

```
硬性限制：
  - 事务内操作的文档数：推荐 < 1000
  - 事务持续时间：默认上限 60 秒（超时自动回滚）
  - 分片集群跨分片事务：两阶段提交，性能明显低于单分片
```

---

## 事务性能开销

```
事务代价（与普通操作相比）：

  1. 锁开销：持有修改文档的排他锁直到提交
  2. 快照开销：WiredTiger 保留事务期间的旧版本数据
  3. Oplog 体积：提交时写入完整操作日志
  4. 提交延迟：w: majority 等待多数节点确认

性能参考（同等操作）：
  单文档原子操作 ≈ 1x（基准）
  短事务（2-3 文档）≈ 3-5x 延迟
  长事务（10+ 文档）≈ 10x+ 延迟

使用原则：
  ✅ 必须跨集合/跨文档原子时才用
  ✅ 事务内操作尽量少（< 5 个）
  ✅ 事务尽量短（< 1 秒）
  ❌ 事务内不做网络请求、复杂计算
  ❌ 不要用事务替代可用单文档原子操作解决的场景
```

---

## 跨分片事务（Distributed Transaction）

```js
// 分片集群事务（4.2+）：驱动透明处理两阶段提交
// 应用层无感知，但性能显著低于单分片事务

// 优化：通过分片键设计让关联数据落同一 Shard
sh.shardCollection('ecommerce.orders',    { userId: 'hashed' })
sh.shardCollection('ecommerce.inventory', { userId: 'hashed' })
// 相同 userId 路由到同一 Shard → 事务无需跨分片
```

---

## 企业案例：转账场景

```java
@Transactional
public void transfer(String fromId, String toId, BigDecimal amount) {
  // 1. 扣款方余额检查 + 扣减
  UpdateResult debit = mongoTemplate.updateFirst(
    new Query(Criteria.where("accountId").is(fromId)
                      .and("balance").gte(amount)),
    new Update().inc("balance", amount.negate()),
    Account.class
  );
  if (debit.getModifiedCount() == 0) {
    throw new InsufficientBalanceException("余额不足");
  }

  // 2. 收款方入账
  mongoTemplate.updateFirst(
    new Query(Criteria.where("accountId").is(toId)),
    new Update().inc("balance", amount),
    Account.class
  );

  // 3. 记录流水
  mongoTemplate.insert(new TransferRecord(fromId, toId, amount));
  // 任意步骤异常 → @Transactional 自动回滚三个操作
}
```

---

## 何时不需要事务

```
嵌入文档代替事务（推荐优先考虑）：

  场景：订单 + 订单行需要原子写入
  反模式（需要事务）：
    orders 集合 + order_items 集合分开存，需跨集合事务

  推荐（无需事务）：
    订单行嵌入订单文档，单文档原子操作
    { orderId: 'ORD-001', items: [...], status: 'paid' }

原则：能嵌入就嵌入，避免跨集合事务
```

---

## 总结

- 优先单文档原子操作（`$inc` + 条件更新），性能最优
- 必须跨集合/跨文档原子时使用事务；`@Transactional` 是 Spring 最简方案
- 快照隔离保证读一致性；写冲突（WriteConflict）必须应用层重试
- 事务代价明显：短、小、快是核心原则，避免长事务
- 分片集群：设计分片键让关联数据在同一 Shard，规避跨分片事务
- 嵌入文档是天然事务替代：能嵌入就嵌入

**下一步**：Change Streams 事件驱动架构。
