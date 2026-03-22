# 生产变更规范与故障演练

## 概述

生产数据库变更是高风险操作，规范的变更流程和定期故障演练是保障系统稳定的核心实践。

---

## 生产变更原则

```
核心原则：
1. 可回滚（Rollback First）：每个变更都有回滚方案
2. 可验证（Verify）：变更前后都有验证步骤
3. 最小影响（Minimal Impact）：选择业务低峰期执行
4. 分步执行（Incremental）：大变更拆分为多个小步骤
5. 留存记录（Audit Trail）：所有变更记录到变更日志
```

---

## Schema 变更规范

### 向前兼容原则

```
MongoDB 无 Schema 限制，但文档结构变更需要应用代码兼容

安全变更（向前兼容）：
  ✅ 新增字段（旧代码读到 null，不报错）
  ✅ 废弃字段（新代码忽略旧字段）
  ✅ 字段重命名（需双写过渡期）

危险变更（需要迁移）：
  ❌ 修改字段类型（String → Number）
  ❌ 删除必填字段
  ❌ 修改嵌套文档结构
```

### 字段重命名迁移流程

```
场景：将 user_name 重命名为 userName

步骤：
  阶段1（双写）：
    新代码同时写 user_name 和 userName
    读取时优先读 userName，fallback 到 user_name

  阶段2（迁移）：
    批量迁移存量数据（低峰期）
    db.users.updateMany(
      { user_name: { $exists: true } },
      [{ $set: { userName: "$user_name" } }]
    )

  阶段3（清理）：
    确认所有文档有 userName 后，移除旧代码和旧字段
    db.users.updateMany(
      { user_name: { $exists: true } },
      { $unset: { user_name: "" } }
    )
```

### 大批量数据迁移

```js
// 分批迁移，避免长时间占用资源
async function batchMigrate() {
  const batchSize = 1000
  let lastId = null
  let migrated = 0

  while (true) {
    const query = lastId
      ? { _id: { $gt: lastId }, user_name: { $exists: true } }
      : { user_name: { $exists: true } }

    const batch = await db.users.find(query)
      .sort({ _id: 1 }).limit(batchSize).toArray()

    if (batch.length === 0) break

    // 批量更新
    const ops = batch.map(doc => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { userName: doc.user_name }, $unset: { user_name: "" } }
      }
    }))
    await db.users.bulkWrite(ops, { ordered: false })

    lastId = batch[batch.length - 1]._id
    migrated += batch.length
    console.log(`已迁移: ${migrated}`)

    // 限速：避免压垮 MongoDB
    await sleep(100)
  }
  console.log('迁移完成')
}
```

---

## 索引变更规范

```js
// 1. 新增索引（生产安全操作）
// MongoDB 4.4+ 并发构建，不完全阻塞
db.orders.createIndex(
  { userId: 1, status: 1 },
  { name: "idx_user_status", background: true }
)

// 2. 删除索引（高风险！）
// 步骤：先隐藏 → 观察 24-48h → 无异常再删除
db.runCommand({
  collMod: "orders",
  index: { name: "idx_old_field", hidden: true }
})
// 观察期无问题后:
db.orders.dropIndex("idx_old_field")

// 3. 监控索引构建进度
db.currentOp({ "command.createIndexes": { $exists: true } })
```

---

## 变更管理流程

```
变更流程：

1. 变更申请
   - 变更内容描述
   - 影响评估（数据量、业务影响）
   - 回滚方案
   - 验证方法

2. 预发/测试环境验证
   - 在与生产规格相近的环境验证
   - 测量执行时间（估算生产耗时）

3. 变更审批
   - DBA 审核 SQL/命令
   - 技术负责人审批

4. 变更执行（维护窗口）
   - 执行前备份（快照）
   - 分步执行，每步验证
   - 异常立即回滚

5. 变更验证
   - 验证数据正确性
   - 监控系统指标 15 分钟
   - 确认业务正常

6. 变更记录
   - 执行时间、操作人、变更内容
   - 存入变更日志系统（CMDB）
```

---

## 故障演练（Chaos Engineering）

### 演练类型

```
1. Primary 节点宕机演练
   目标：验证自动选主和应用恢复时间
   步骤：
     a. 通知相关人员
     b. rs.stepDown(60)（主动降级，最小影响）
     c. 记录切换时间（目标 < 30 秒）
     d. 验证应用写入恢复
     e. 检查写入期间是否丢数据

2. Secondary 节点宕机演练
   目标：验证读请求降级和复制恢复
   步骤：
     a. systemctl stop mongod（模拟宕机）
     b. 验证 readPreference 降级到 Primary
     c. 恢复节点，验证数据同步

3. 网络分区演练
   目标：验证脑裂防护
   步骤：
     a. iptables 隔离部分节点
     b. 验证少数派节点不接受写入
     c. 验证多数派正常服务
```

### 演练执行

```bash
# 演练1：主节点降级
mongosh --eval "rs.stepDown(60)"

# 记录切换时间
time mongosh --eval "db.isMaster().ismaster"

# 演练2：模拟节点宕机
systemctl stop mongod

# 观察副本集状态
watch -n 2 mongosh --eval "rs.status().members.map(m => ({name:m.name, state:m.stateStr}))"

# 恢复
systemctl start mongod
```

---

## 应急响应手册

```
故障级别定义：
  P1：数据库不可写，业务完全中断
  P2：性能严重下降，部分功能不可用
  P3：慢查询增多，影响用户体验

P1 响应流程（< 5 分钟）：
  1. 告警接收（On-call 人员）
  2. 确认副本集状态：rs.status()
  3. 若无 Primary：检查网络，手动触发选举
     rs.initiate() 或 rs.reconfig()
  4. 若有 Primary 但写入失败：检查磁盘、内存
  5. 实在不行：从最近备份恢复（RTO 确认）

常用应急命令：
  rs.status()              # 副本集状态
  db.currentOp()           # 当前运行操作
  db.killOp(opid)          # 终止阻塞操作
  rs.stepDown(60)          # 主动降级
  rs.freeze(60)            # 禁止节点参与选举
```

---

## 总结

- Schema 变更遵循向前兼容，字段重命名走双写-迁移-清理三阶段
- 大批量迁移分批执行并限速，避免压垮生产 MongoDB
- 索引删除：隐藏 → 观察 → 确认无影响 → 删除
- 定期故障演练（至少每季度一次）验证系统真实容灾能力
- 应急响应手册常备，关键命令随手可查

**下一步**：多文档事务深入解析。
