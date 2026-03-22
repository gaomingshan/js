# Change Streams 事件驱动架构

## 概述

Change Streams 是 MongoDB 3.6 引入的变更数据捕获（CDC）机制，基于 Oplog 实时订阅集合、数据库或集群的数据变更事件。它是构建事件驱动架构、数据同步管道、缓存失效和实时审计的核心基础设施。

---

## Change Streams 原理

```
写操作 → mongod → Oplog（local.oplog.rs）
                     ↓
            Change Streams 游标（持续监听）
                     ↓
            应用层事件处理器

前提条件：副本集或分片集群（依赖 Oplog，单机不支持）

事件类型：
  insert       → 新增文档
  update       → 部分字段更新
  replace      → 整体替换
  delete       → 删除文档
  drop         → 集合被删除
  invalidate   → Change Stream 失效（需重新打开）

交付语义：至少一次（at-least-once），消费者需实现幂等
```

---

## 支持级别：集合、数据库、集群

```js
// 集合级：只监听 orders 集合
db.collection('orders').watch(pipeline, options)

// 数据库级：监听 ecommerce 库所有集合
db.watch(pipeline, options)

// 集群级：监听所有数据库（需 admin 权限）
client.watch(pipeline, options)
```

---

## 基础用法

### Node.js

```js
// 过滤只监听支付成功的订单更新
const changeStream = db.collection('orders').watch(
  [{
    $match: {
      operationType: 'update',
      'updateDescription.updatedFields.status': 'paid'
    }
  }],
  { fullDocument: 'updateLookup' }  // 返回更新后的完整文档
)

changeStream.on('change', async (change) => {
  const order = change.fullDocument
  console.log('订单已支付:', order.orderId)
  await fulfillmentService.trigger(order)
})

changeStream.on('error', (err) => {
  console.error('Change Stream 错误:', err)
  // 重连逻辑
})
```

### Java（Spring Data MongoDB Reactive）

```java
@Component
public class OrderChangeListener implements ApplicationRunner {

  @Autowired
  private ReactiveMongoTemplate mongoTemplate;

  @Override
  public void run(ApplicationArguments args) {
    ChangeStreamOptions options = ChangeStreamOptions.builder()
      .filter(Aggregation.newAggregation(
        Aggregation.match(
          Criteria.where("operationType").in("insert", "update")
                  .and("fullDocument.status").is("paid")
        )
      ))
      .fullDocumentLookup(FullDocument.UPDATE_LOOKUP)
      .build();

    mongoTemplate.changeStream("orders", options, Order.class)
      .doOnNext(event -> {
        Order order = event.getBody();
        log.info("订单已支付: {}", order.getOrderId());
        fulfillmentService.trigger(order);
      })
      .doOnError(e -> log.error("Change Stream 异常", e))
      .retryWhen(Retry.backoff(Long.MAX_VALUE, Duration.ofSeconds(3)))
      .subscribe();
  }
}
```

---

## Resume Token 与断点续传

```js
// 每个变更事件携带 _id（Resume Token）
// 服务重启后从断点继续，不丢事件

let resumeToken = await loadResumeToken()  // 从 DB/Redis 加载

async function startWatch() {
  const opts = {
    fullDocument: 'updateLookup',
    ...(resumeToken ? { resumeAfter: resumeToken } : {})
  }

  const changeStream = db.collection('orders').watch([], opts)

  changeStream.on('change', async (change) => {
    try {
      await processChange(change)
      // 处理成功后持久化 Token
      resumeToken = change._id
      await saveResumeToken(resumeToken)
    } catch (err) {
      // 处理失败不更新 Token，重启后重新消费
      log.error('处理失败，待重试', err)
    }
  })

  changeStream.on('error', async () => {
    resumeToken = await loadResumeToken()
    setTimeout(startWatch, 3000)
  })
}
```

```java
// Java 断点续传
@Service
public class ChangeStreamService {

  public void startWatching() {
    ChangeStreamOptions.ChangeStreamOptionsBuilder builder =
      ChangeStreamOptions.builder()
        .fullDocumentLookup(FullDocument.UPDATE_LOOKUP);

    // 加载上次保存的 Token
    BsonDocument saved = resumeTokenRepo.load();
    if (saved != null) builder.resumeAfter(saved);

    mongoTemplate.changeStream("orders", builder.build(), Order.class)
      .doOnNext(event -> {
        processEvent(event.getBody());
        resumeTokenRepo.save(event.getResumeToken());
      })
      .retryWhen(Retry.backoff(Long.MAX_VALUE, Duration.ofSeconds(3)))
      .subscribe();
  }
}
```

---

## 全文档预镜像（Pre/Post Image，6.0+）

```js
// 开启集合级别 Pre/Post Image
db.runCommand({
  collMod: 'orders',
  changeStreamPreAndPostImages: { enabled: true }
})

// 同时获取变更前后的完整文档
const cs = db.collection('orders').watch([], {
  fullDocument:             'required',   // 变更后文档
  fullDocumentBeforeChange: 'required'    // 变更前文档
})

cs.on('change', (change) => {
  const before = change.fullDocumentBeforeChange
  const after  = change.fullDocument
  console.log(`状态: ${before.status} → ${after.status}`)
  // 适用场景：审计日志、差异对比、数据回滚
})
```

---

## 高可用消费模式

```
高可用消费要点：

1. 持久化 Resume Token
   每次成功处理后保存 Token 到 MongoDB/Redis
   → 服务重启从断点继续，不重复不丢失

2. 幂等消费
   至少一次语义可能重复投递
   → 消费者用 eventId/orderId 去重

3. 自动重连
   网络抖动、Primary 切换导致 Stream 中断
   → 捕获错误，加指数退避重连，使用 Resume Token

4. Oplog 窗口监控
   Resume Token 对应的 Oplog 被覆盖 → ChangeStreamHistoryLost
   → 增大 Oplog Size 或缩短 Token 持久化间隔

5. 多实例部署
   多个 Change Stream 消费者并行处理不同集合
   → 每个实例管理自己的 Resume Token
```

---

## 企业案例一：数据同步（MongoDB → Elasticsearch）

```js
db.collection('products').watch().on('change', async (change) => {
  const { operationType, documentKey, fullDocument } = change
  const id = documentKey._id.toString()

  switch (operationType) {
    case 'insert':
    case 'replace':
      await esClient.index({ index: 'products', id, document: fullDocument })
      break
    case 'update':
      await esClient.update({
        index: 'products', id,
        doc: change.updateDescription.updatedFields
      })
      break
    case 'delete':
      await esClient.delete({ index: 'products', id })
      break
  }
})
```

---

## 企业案例二：缓存失效

```java
// 监听商品变更，自动使 Redis 缓存失效
@Component
public class ProductCacheInvalidator implements ApplicationRunner {

  @Autowired ReactiveMongoTemplate mongoTemplate;
  @Autowired RedisTemplate<String, Object> redis;

  @Override
  public void run(ApplicationArguments args) {
    mongoTemplate.changeStream("products",
      ChangeStreamOptions.empty(), Product.class)
      .doOnNext(event -> {
        String productId = event.getBody().getProductId();
        redis.delete("product:" + productId);
        log.info("缓存已失效: product:{}", productId);
      })
      .retryWhen(Retry.backoff(Long.MAX_VALUE, Duration.ofSeconds(5)))
      .subscribe();
  }
}
```

---

## 企业案例三：Outbox Pattern（事务性消息）

```js
// 问题：如何保证 DB 写入和消息发送的原子性？
// 方案：在事务中写 outbox，Change Streams 监听并发消息

// Step 1：业务逻辑 + 写 outbox（同一事务）
async function placeOrder(order) {
  const session = client.startSession()
  session.startTransaction()
  await db.collection('orders').insertOne(order, { session })
  await db.collection('outbox').insertOne({
    eventType: 'ORDER_CREATED',
    payload:   order,
    createdAt: new Date()
  }, { session })
  await session.commitTransaction()
}

// Step 2：监听 outbox，发送到 MQ
db.collection('outbox').watch([{
  $match: { operationType: 'insert' }
}]).on('change', async (change) => {
  const event = change.fullDocument
  await mq.publish(event.eventType, event.payload)
  await db.collection('outbox').deleteOne({ _id: event._id })
})
// 保证：消息与数据库操作原子，不会双写不一致
```

---

## 企业案例四：实时审计日志

```java
// 监听所有集合写操作，记录审计日志
@Component
public class AuditLogger implements ApplicationRunner {

  @Autowired ReactiveMongoTemplate mongoTemplate;

  @Override
  public void run(ApplicationArguments args) {
    // 数据库级监听（所有集合）
    mongoTemplate.changeStream(ChangeStreamOptions.builder()
      .filter(Aggregation.newAggregation(
        Aggregation.match(
          Criteria.where("operationType").in("insert", "update", "delete")
        )
      ))
      .fullDocumentLookup(FullDocument.UPDATE_LOOKUP)
      .build(), Document.class)
      .doOnNext(event -> {
        AuditLog log = AuditLog.builder()
          .operation(event.getOperationType().getValue())
          .collection(event.getCollectionName())
          .documentId(event.getDocumentKey().get("_id").toString())
          .timestamp(LocalDateTime.now())
          .build();
        auditLogRepo.save(log);
      })
      .retryWhen(Retry.backoff(Long.MAX_VALUE, Duration.ofSeconds(3)))
      .subscribe();
  }
}
```

---

## 运维注意事项

```
1. Oplog 窗口：
   Resume Token 对应 Oplog 已被覆盖 → ChangeStreamHistoryLost
   → 增大 Oplog 大小（建议 > 24 小时写入量）

2. 连接占用：
   每个 Change Stream 持有一个 MongoDB 连接
   → 避免创建过多 Change Streams

3. 过滤前置：
   在 $match 阶段过滤不需要的事件
   → 减少网络传输和应用处理开销

4. 分片集群：
   mongos 聚合各 Shard 事件
   → 全局顺序不严格保证，需业务层处理乱序

5. 性能：
   Change Streams 有额外的 CPU 和内存开销
   → 生产环境监控 Oplog 追赶情况
```

---

## 总结

- Change Streams 基于 Oplog，需副本集/分片集群，支持集合/库/集群三级订阅
- Resume Token 实现断点续传，必须持久化以保证不丢事件
- MongoDB 6.0 Pre/Post Image 可同时获取变更前后完整文档
- 核心场景：数据同步（→ES/Kafka）、缓存失效、Outbox 事务性消息、审计日志
- 消费者必须实现幂等性；Oplog 窗口需监控，防 Token 失效

**下一步**：Time Series 与 IoT 场景。
