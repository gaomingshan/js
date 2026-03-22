# 索引构建策略与生命周期管理

## 概述

在生产环境对大集合建立索引，若操作不当会造成严重阻塞。本章讲解如何安全构建索引，以及如何对索引进行全生命周期管理。

---

## MongoDB 4.4+ 索引构建机制

### 并发索引构建（Hybrid Index Build）

MongoDB 4.4 引入混合索引构建，解决了历史版本的阻塞问题：

```
旧版本（4.2-）：
  前台构建：持有独占写锁，完全阻塞读写
  后台构建：不阻塞，但构建慢，索引不完整

4.4+ 混合构建：
  ├── 开始阶段：短暂独占锁（毫秒级）
  ├── 扫描阶段：允许并发读写（bulk 阶段扫描现有文档）
  │   同时记录构建期间的写操作
  ├── 处理增量：应用构建期间的写操作
  └── 完成阶段：短暂独占锁（毫秒级）
```

**结论**：4.4+ 版本直接 `createIndex()` 即可，对业务影响很小，但大集合构建期间仍有 CPU 和 I/O 压力。

---

## 副本集上的索引构建影响

```
Primary 构建索引 → 写入 Oplog → Secondary 回放 Oplog 构建索引

影响：
  1. Secondary 在构建索引期间，Oplog 回放可能延迟
  2. 大集合索引构建可能导致复制延迟（Replication Lag）
  3. 监控：rs.printSecondaryReplicationInfo()
```

---

## 滚动索引构建（Rolling Index Build）

对超大集合（数亿文档），推荐滚动构建，逐个节点构建，避免影响整体可用性。

```
步骤：
1. 将一个 Secondary 从副本集移除（或降优先级）
2. 在该 Secondary 上单独构建索引（standalone 模式）
3. 重新加入副本集，等待同步
4. 对每个 Secondary 重复步骤 1-3
5. 最后对 Primary 执行：rs.stepDown() → 降为 Secondary → 构建索引
```

```bash
# 步骤2：以 standalone 模式重启（临时，去掉 replSet 配置）
# mongod.conf 临时注释 replication 节
# 构建索引
mongosh --port 27018 --eval '
db.largeCollection.createIndex({ field: 1 }, { name: "idx_field" })
'
# 构建完成后恢复 replication 配置，重新加入副本集
```

**注意**：滚动构建期间该节点不接受读请求，需确认 Read Preference 不路由到该节点。

---

## 监控索引构建进度

```js
// 查看当前正在进行的操作（包括索引构建）
db.currentOp({ "command.createIndexes": { $exists: true } })

// 输出关键字段
{
  opid: 12345,
  secs_running: 120,
  "msg": "Index Build: scanning collection",
  "progress": { "done": 5000000, "total": 20000000 }  // 25% 完成
}

// 终止索引构建（紧急情况）
db.killOp(12345)
```

---

## 索引冗余检测与治理

### 什么是冗余索引？

```js
// 冗余索引示例
db.orders.createIndex({ userId: 1 })                    // 索引 A
db.orders.createIndex({ userId: 1, status: 1 })         // 索引 B

// 索引 A 是索引 B 的前缀，所有能走 A 的查询都能走 B
// 索引 A 是冗余的，可以删除
```

### 用 $indexStats 发现未使用的索引

```js
// 查看索引使用统计（建议运行 1~2 周后分析）
db.orders.aggregate([
  { $indexStats: {} },
  {
    $project: {
      name: 1,
      key: 1,
      "accesses.ops": 1,
      "accesses.since": 1
    }
  },
  { $sort: { "accesses.ops": 1 } }  // 按使用次数升序，最少用的在前
])

// ops: 0 且 since 已经很久 → 强烈建议删除
// ops 很少 → 先隐藏观察，再决定
```

### 索引治理流程

```
1. 收集：运行 $indexStats 至少 1 周
2. 分析：
   - ops: 0 → 候选删除
   - 前缀冗余 → 候选删除
   - 相似索引合并 → 候选合并
3. 验证：隐藏索引（hidden）观察 24~48 小时
4. 执行：确认无影响后 dropIndex
5. 记录：记录删除原因，防止误解
```

---

## 索引命名规范

```js
// 自动命名（字段名_方向）
db.users.createIndex({ email: 1 })
// → 自动命名为 "email_1"（复杂字段名会很长）

// 自定义命名（推荐）
db.orders.createIndex(
  { userId: 1, status: 1, createdAt: -1 },
  { name: "idx_orders_user_status_created" }
)

// 命名规范建议：idx_{集合}_{字段组合}
// 便于 explain 输出时快速识别
```

---

## 大批量写入前的索引策略

```js
// 场景：初始化导入 1 亿条数据

// ✅ 推荐方案：先导入，后建索引
// 1. 仅保留 _id 索引，删除其他索引
// 2. 执行大批量导入（速度快 3~5 倍）
// 3. 导入完成后建立索引

// ❌ 错误方案：带着所有索引导入
// 每条记录都要更新 N 个索引，极慢

// 实操
db.orders.dropIndexes()  // 先删非 _id 索引
// ... 执行导入 ...
db.orders.createIndex({ userId: 1, status: 1 })  // 导入后重建
```

---

## 易错点

```
❌ 在 Primary 直接对亿级集合建索引
   → CPU/IO 飙升，影响业务
   → 使用滚动构建或在业务低峰期执行

❌ 不设置索引名就创建，导致自动名称过长
   → MongoDB 索引名有 127 字节限制
   → 复杂复合索引必须自定义 name

❌ 从不清理冗余索引
   → 写入性能持续下降
   → 每季度至少审查一次索引使用情况
```

---

## 总结

- MongoDB 4.4+ 混合索引构建对业务影响小，但仍有资源压力
- 超大集合使用滚动构建，逐节点操作
- `$indexStats` 定期审查，配合隐藏索引安全清理
- 大批量导入前先删索引，导入后重建
- 自定义索引名，便于运维识别

**下一步**：查询执行计划（explain）详解。
