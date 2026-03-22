# 备份恢复与容量规划

## 概述

数据安全是 MongoDB 生产运维的底线。本章覆盖逻辑备份、快照备份、PITR 三种方案，以及容量规划和冷热数据分层策略。

---

## 逻辑备份：mongodump / mongorestore

### mongodump

```bash
# 备份整个实例
mongodump \
  --host localhost:27017 \
  --username admin \
  --password StrongPass \
  --authenticationDatabase admin \
  --out /backup/mongodb/$(date +%Y%m%d)

# 备份指定数据库
mongodump \
  --uri "mongodb://admin:pass@localhost:27017/?authSource=admin" \
  --db ecommerce \
  --out /backup/mongodb/ecommerce-$(date +%Y%m%d)

# 备份指定集合
mongodump \
  --uri "mongodb://admin:pass@localhost:27017" \
  --db ecommerce \
  --collection orders \
  --query '{"createdAt":{"$gte":{"$date":"2024-01-01T00:00:00Z"}}}' \
  --out /backup/

# 副本集：从 Secondary 备份（不影响 Primary）
mongodump \
  --host "rs0/mongo1:27017,mongo2:27017,mongo3:27017" \
  --readPreference secondary \
  --out /backup/

# 压缩备份
mongodump --uri "..." --gzip --archive=/backup/mongo-$(date +%Y%m%d).gz
```

### mongorestore

```bash
# 恢复整个备份
mongorestore \
  --uri "mongodb://admin:pass@localhost:27017/?authSource=admin" \
  --dir /backup/mongodb/20240115

# 恢复单个数据库（--drop 先清空目标）
mongorestore \
  --uri "..." \
  --db ecommerce \
  --drop \
  /backup/mongodb/20240115/ecommerce

# 从压缩归档恢复
mongorestore \
  --uri "..." \
  --gzip \
  --archive=/backup/mongo-20240115.gz

# 并行恢复（加速大数据量）
mongorestore \
  --uri "..." \
  --numParallelCollections 4 \
  --numInsertionWorkersPerCollection 4 \
  /backup/
```

**mongodump 的局限**：
- 大数据量耗时长（TB 级需数小时）
- 备份期间数据库可能写入，存在一致性窗口
- 不支持时间点恢复（PITR）

---

## 文件系统快照备份

### LVM 快照（Linux）

```bash
# 前提：MongoDB 数据目录在 LVM 卷上

# 1. 刷新并锁定写入（最短时间）
mongosh --eval "db.fsyncLock()"

# 2. 创建 LVM 快照（秒级完成）
lvcreate -L 10G -s -n mongodb-snap /dev/vg0/mongodb-data

# 3. 解锁
mongosh --eval "db.fsyncUnlock()"

# 4. 挂载快照并备份
mount -o ro /dev/vg0/mongodb-snap /mnt/snapshot
tar -czf /backup/mongodb-$(date +%Y%m%d).tar.gz /mnt/snapshot

# 5. 删除快照
umount /mnt/snapshot
lvremove -f /dev/vg0/mongodb-snap
```

### AWS EBS 快照（云环境推荐）

```bash
# 使用 AWS CLI 创建 EBS 快照
VOLUME_ID=$(aws ec2 describe-instances \
  --instance-ids i-xxxx \
  --query 'Reservations[].Instances[].BlockDeviceMappings[?DeviceName=="/dev/xvdb"].Ebs.VolumeId' \
  --output text)

aws ec2 create-snapshot \
  --volume-id $VOLUME_ID \
  --description "MongoDB backup $(date +%Y%m%d)"
```

**快照备份优势**：
- 秒级完成（LVM/EBS 快照），不阻塞业务
- 备份数据一致性好
- 适合大数据量（TB 级）

---

## PITR（时间点恢复）

### 原理

```
PITR = 全量备份 + Oplog 重放

恢复到任意时间点 T：
  1. 恢复 T 之前最近的全量备份
  2. 重放备份时间点到 T 之间的 Oplog
```

### 实现方案

```bash
# 1. 定期全量备份（每天）
mongodump --oplog --out /backup/full-$(date +%Y%m%d)
# --oplog：备份期间的 Oplog 也一起备份，保证一致性

# 2. 持续归档 Oplog
# 使用 mongo-oplog-backup 或自定义脚本持续备份 Oplog

# 3. 恢复到指定时间点（如 2024-01-15 14:30:00）
mongorestore \
  --oplogReplay \
  --oplogLimit "1705330200:1" \
  /backup/full-20240115
# oplogLimit 格式：Unix时间戳:序号
```

### Atlas PITR

```
Atlas M10+ 自动支持 PITR：
  1. 每天自动快照
  2. 持续备份 Oplog
  3. 可恢复到最近 24 小时内任意秒
  4. 操作路径：Atlas → Backup → Restore → Point in Time
```

---

## 备份策略设计

```
推荐备份策略（生产环境）：

全量备份：
  频率：每天凌晨 2:00（业务低峰）
  保留：最近 7 天
  存储：压缩后上传到对象存储（S3/OSS）

增量备份（Oplog）：
  频率：每 15 分钟归档一次 Oplog
  保留：最近 48 小时
  目标：支持 PITR

快照备份（云环境）：
  频率：每天一次 EBS 快照
  保留：7 天
  跨区域复制：异地容灾
```

---

## 备份恢复演练规范

```
必须定期演练，验证备份可用性！

演练频率：至少每季度一次
演练内容：
  1. 从备份恢复到隔离测试环境
  2. 验证数据完整性（文档数、关键业务数据抽查）
  3. 测量恢复时间（RTO 验证）
  4. 记录演练结果，更新恢复手册

RTO（恢复时间目标）参考：
  核心业务：RTO < 1 小时
  一般业务：RTO < 4 小时
```

---

## 容量规划

### 数据增长预测

```js
// 当前数据量
db.stats()
// dataSize：实际数据大小
// storageSize：磁盘占用（含压缩）
// indexes：索引大小

// 各集合统计
db.orders.stats()

// 预测增长（基于历史数据）
// 如每月增长 50GB，预留 12 个月 = 600GB
// 加上索引（约数据量的 30%）= 780GB
// 加上 Oplog（约 50GB）
// 总需求 ≈ 830GB
// 建议预留 50% 余量 → 采购 1.5TB 存储
```

### 分片扩容时机

```
扩容信号：
  - 单 Shard 数据量 > 2TB
  - 写入 QPS 持续 > 80% 单节点上限
  - CPU 持续 > 70%
  - 响应时间 P99 持续上升

扩容方式：
  1. 添加新 Shard（sh.addShard(...)）
  2. 均衡器自动迁移 Chunk
  3. 无需停机
```

---

## 总结

- 小数据量用 mongodump，大数据量用快照备份
- PITR = 全量备份 + Oplog 归档，支持秒级恢复
- 备份必须定期演练，未验证的备份等于没有备份
- 容量规划预留 50% 余量，提前规划扩容

**下一步**：mongosh 常用操作速查。
