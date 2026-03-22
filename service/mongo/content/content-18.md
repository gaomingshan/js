# 查询执行计划（explain）

## 概述

`explain()` 是 MongoDB 性能调优最重要的工具，用于分析查询如何执行、是否走了索引、扫描了多少文档。读懂执行计划是定位慢查询的核心技能。

---

## explain 的三种模式

```js
// 1. queryPlanner（默认）：只分析计划，不实际执行
db.orders.find({ userId: "u001" }).explain("queryPlanner")

// 2. executionStats（推荐）：实际执行并返回统计数据
db.orders.find({ userId: "u001" }).explain("executionStats")

// 3. allPlansExecution：执行所有候选计划，用于诊断计划选择问题
db.orders.find({ userId: "u001" }).explain("allPlansExecution")
```

**日常调优用 `executionStats`，它既分析计划又返回实际执行数据。**

---

## 关键指标解读

### executionStats 核心字段

```js
// 典型输出（已简化）
{
  "queryPlanner": {
    "winningPlan": {
      "stage": "FETCH",           // 阶段：获取文档
      "inputStage": {
        "stage": "IXSCAN",        // 走了索引扫描 ✅
        "keyPattern": { "userId": 1, "status": 1 },
        "indexName": "idx_user_status",
        "direction": "forward"
      }
    }
  },
  "executionStats": {
    "nReturned": 10,             // 返回文档数
    "executionTimeMillis": 2,    // 执行时间（ms）
    "totalKeysExamined": 10,     // 扫描的索引键数
    "totalDocsExamined": 10,     // 扫描的文档数
    "executionStages": {
      "stage": "FETCH",
      "nReturned": 10,
      "docsExamined": 10,
      "inputStage": {
        "stage": "IXSCAN",
        "nReturned": 10,
        "keysExamined": 10
      }
    }
  }
}
```

### 关键指标说明

| 指标 | 含义 | 健康标准 |
|------|------|----------|
| `nReturned` | 实际返回文档数 | - |
| `totalKeysExamined` | 扫描索引键数 | ≈ nReturned（越接近越好）|
| `totalDocsExamined` | 扫描文档数 | ≈ nReturned（越接近越好）|
| `executionTimeMillis` | 执行耗时 | 业务 < 100ms，报表 < 5s |

**黄金规则**：`totalDocsExamined / nReturned` 比值越接近 1 越好，若比值 > 100 说明索引效率低。

---

## IXSCAN vs COLLSCAN

```js
// ❌ COLLSCAN（全集合扫描）
{
  "stage": "COLLSCAN",
  "nReturned": 10,
  "totalDocsExamined": 1000000  // 扫描了 100 万条！
}
// → 需要添加索引

// ✅ IXSCAN（索引扫描）
{
  "stage": "IXSCAN",
  "nReturned": 10,
  "totalKeysExamined": 10       // 只扫描 10 条索引键
}
```

---

## 常见执行阶段说明

| Stage | 含义 |
|-------|------|
| `COLLSCAN` | 全集合扫描（无索引）|
| `IXSCAN` | 索引扫描 |
| `FETCH` | 根据索引指针读取文档 |
| `SORT` | 内存排序（无法利用索引排序）|
| `SORT_KEY_GENERATOR` | 提取排序键 |
| `LIMIT` | 限制结果数量 |
| `SKIP` | 跳过文档 |
| `PROJECTION_COVERED` | 覆盖查询（无需 FETCH）|
| `COUNT_SCAN` | 利用索引计数 |

**SORT 阶段是重要警告**：说明查询无法利用索引排序，对大数据量会有内存排序开销（超过 100MB 会报错，需 `allowDiskUse`）。

---

## 典型问题诊断

### 1. 发现全表扫描

```js
db.orders.find({ amount: { $gt: 1000 } }).explain("executionStats")
// winningPlan.stage: "COLLSCAN" → 需要建索引

// 解决：建立索引
db.orders.createIndex({ amount: 1 })
```

### 2. 发现内存排序

```js
db.orders.find({ userId: "u1" }).sort({ createdAt: -1 }).explain()
// 出现 SORT 阶段 → 索引未覆盖排序字段

// 解决：将排序字段加入索引
db.orders.createIndex({ userId: 1, createdAt: -1 })
```

### 3. 索引扫描比例过高

```js
// nReturned: 10, totalKeysExamined: 50000
// → 索引选择性差（大量键扫描只返回少量文档）

// 解决：添加更多等值条件字段到复合索引前缀
```

### 4. 确认覆盖查询

```js
db.orders.find(
  { userId: "u1", status: "paid" },
  { status: 1, amount: 1, _id: 0 }
).explain("executionStats")

// 覆盖查询成功标志：
// totalDocsExamined: 0   ← 零文档读取
// stage: "PROJECTION_COVERED"  ← 或 IXSCAN 直接返回
```

---

## Hint 强制指定索引

```js
// Query Planner 选错索引时，强制指定
db.orders.find({ userId: "u1", status: "paid" })
  .hint({ userId: 1, status: 1 })  // 指定索引键
  .explain("executionStats")

// 或按索引名指定
db.orders.find({ userId: "u1" })
  .hint("idx_user_status")

// 强制全表扫描（测试用）
db.orders.find({ userId: "u1" }).hint({ $natural: 1 })
```

---

## 慢查询日志与 Profiler

```js
// 开启 Profiler（记录超过 100ms 的操作）
db.setProfilingLevel(1, { slowms: 100 })

// 查看慢查询记录
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty()

// 关键字段
{
  op: "query",
  ns: "ecommerce.orders",
  millis: 3500,                    // 执行耗时
  keysExamined: 0,                 // 索引键扫描数（0=全表）
  docsExamined: 1000000,           // 文档扫描数
  nreturned: 5,
  planSummary: "COLLSCAN",         // 执行计划摘要
  ts: ISODate("2024-01-15T10:30:00Z")
}

// 关闭 Profiler
db.setProfilingLevel(0)
```

---

## 聚合管道的 explain

```js
// 聚合管道也支持 explain
db.orders.explain("executionStats").aggregate([
  { $match: { userId: "u001" } },
  { $group: { _id: "$status", total: { $sum: "$amount" } } }
])

// 关注：$match 阶段是否走了索引（IXSCAN）
// $match 放在管道最前面，才能利用索引
```

---

## 总结

- 日常用 `executionStats` 模式分析查询
- `COLLSCAN` 是建索引的信号，`SORT` 是优化排序索引的信号
- 黄金比例：`totalDocsExamined / nReturned ≈ 1`
- `totalDocsExamined: 0` 是覆盖查询的标志
- Profiler 记录生产慢查询，定期分析 `system.profile`

**下一步**：查询语法与操作符完整指南。
