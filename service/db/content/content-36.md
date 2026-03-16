# Undo 与 Redo 日志

## 概述

Undo 日志和 Redo 日志是数据库实现 ACID 特性的核心机制。Undo 日志用于事务回滚和 MVCC，Redo 日志用于崩溃恢复和持久性保证。理解这两种日志的工作原理，对于深入理解数据库内部机制至关重要。

**核心作用**：
- **Undo Log**：回滚事务、实现 MVCC
- **Redo Log**：崩溃恢复、保证持久性
- **WAL**：Write-Ahead Logging，先写日志再写数据
- **Checkpoint**：刷新脏页到磁盘

---

## Undo 日志

### 1. 作用

**事务回滚**：
```
事务执行过程中记录修改前的数据
如果事务失败或回滚：
- 使用 Undo Log 恢复原始数据
- 撤销所有修改
```

**MVCC 实现**：
```
保存数据的旧版本
支持一致性非锁定读
事务读取特定版本的快照
```

**崩溃恢复**：
```
回滚未提交的事务
恢复数据一致性
```

### 2. MySQL InnoDB Undo Log

**Undo Log 记录类型**：
```
TRX_UNDO_INSERT_REC：
- INSERT 操作的 Undo 记录
- 记录主键值
- 回滚时删除此记录

TRX_UNDO_UPD_EXIST_REC：
- UPDATE 操作的 Undo 记录
- 记录修改前的列值
- 回滚时恢复旧值

TRX_UNDO_DEL_MARK_REC：
- DELETE 操作的 Undo 记录
- 只标记删除，不物理删除
- 回滚时取消删除标记
```

**Undo Log 存储**：
```
MySQL 5.7+：
- 独立的 Undo 表空间
- innodb_undo_tablespaces：Undo 表空间数量
- innodb_undo_directory：Undo 文件目录

MySQL 8.0+：
- 支持动态 Undo 表空间
- 可在线添加/删除 Undo 表空间
```

**查看 Undo 配置**：
```sql
-- 查看 Undo 相关参数
SHOW VARIABLES LIKE 'innodb_undo%';

-- innodb_undo_tablespaces：Undo 表空间数量（默认2）
-- innodb_undo_directory：Undo 目录
-- innodb_undo_log_truncate：是否自动截断
-- innodb_max_undo_log_size：最大 Undo 表空间大小

-- 查看 Undo 使用情况
SHOW ENGINE INNODB STATUS\G

-- History list length：Undo Log 链表长度
-- 正常：< 1000
-- 告警：> 10000（说明有长事务）
```

### 3. Undo Log 版本链

**示例**：
```
当前行（最新版本）：
| id | name  | DB_TRX_ID | DB_ROLL_PTR |
|----|-------|-----------|-------------|
| 1  | Alice | 100       | ptr -> v2   |

Undo Log 版本链：
v2: id=1, name='Bob',   trx_id=80, roll_ptr -> v1
v1: id=1, name='Charlie', trx_id=60, roll_ptr -> NULL

版本链：当前 -> v2 -> v1 -> NULL
```

**MVCC 读取**：
```sql
-- 事务开始时创建 Read View
-- 根据 Read View 判断版本可见性
-- 如果当前版本不可见，沿着版本链查找可见版本

BEGIN;  -- TRX_ID = 90

SELECT * FROM users WHERE id = 1;
-- 当前版本 trx_id = 100（不可见，在活跃事务中）
-- 查找 Undo Log：
--   v2: trx_id = 80（可见，已提交）
-- 返回 v2 版本：name = 'Bob'

COMMIT;
```

### 4. Undo Log 清理（Purge）

**Purge 线程**：
```
作用：
- 清理不再需要的 Undo Log
- 物理删除标记删除的记录
- 回收空间

触发条件：
- 所有事务都不再需要此版本
- 没有任何 Read View 可见此版本
```

**配置 Purge**：
```sql
-- Purge 线程数量
SHOW VARIABLES LIKE 'innodb_purge_threads';
-- 默认：4

-- 设置 Purge 线程
SET GLOBAL innodb_purge_threads = 4;

-- Purge 批处理大小
SHOW VARIABLES LIKE 'innodb_purge_batch_size';
-- 默认：300
```

**监控 Purge**：
```sql
SHOW ENGINE INNODB STATUS\G

-- History list length：待清理的 Undo Log 数量
-- Purge done for trx's：已清理的事务 ID
```

**长事务影响**：
```sql
-- 长事务阻止 Undo Log 清理
BEGIN;

SELECT * FROM users WHERE id = 1;
-- 创建 Read View

-- 事务长时间不提交（几小时）
-- 问题：
-- - Undo Log 无法清理（事务可能需要读取旧版本）
-- - History list length 持续增长
-- - 表空间膨胀

COMMIT;
-- 释放 Read View，允许清理
```

### 5. Undo 表空间管理

**MySQL 8.0 动态管理**：
```sql
-- 查看 Undo 表空间
SELECT 
    TABLESPACE_NAME,
    FILE_NAME,
    FILE_SIZE / 1024 / 1024 AS SIZE_MB,
    STATE
FROM information_schema.FILES
WHERE TABLESPACE_NAME LIKE 'innodb_undo%';

-- 添加 Undo 表空间
CREATE UNDO TABLESPACE undo_003 ADD DATAFILE 'undo_003.ibu';

-- 删除 Undo 表空间（需先设为 INACTIVE）
ALTER UNDO TABLESPACE undo_003 SET INACTIVE;
-- 等待清空
DROP UNDO TABLESPACE undo_003;
```

**自动截断**：
```sql
-- 启用 Undo 表空间自动截断
SET GLOBAL innodb_undo_log_truncate = ON;

-- 截断阈值（默认 1GB）
SET GLOBAL innodb_max_undo_log_size = 1073741824;

-- 当 Undo 表空间超过阈值：
-- 1. 标记为截断候选
-- 2. 等待 Purge 清理
-- 3. 截断并重新初始化
```

---

## Redo 日志

### 1. 作用

**持久性保证**：
```
事务提交时：
- 修改先写入 Redo Log
- Redo Log 刷盘（fsync）
- 返回提交成功
- 异步将脏页刷盘

崩溃恢复：
- 重放 Redo Log
- 恢复已提交事务的修改
```

**提升性能**：
```
顺序写 Redo Log：
- 顺序 I/O，快速
- 批量写入

延迟刷脏页：
- 随机 I/O，较慢
- 后台异步刷新
```

### 2. MySQL InnoDB Redo Log

**Redo Log 文件**：
```
MySQL 5.7：
- ib_logfile0, ib_logfile1, ...
- 循环使用（环形结构）

MySQL 8.0+：
- #ib_redo0, #ib_redo1, ...
- 支持动态调整
```

**配置 Redo Log**：
```sql
-- 查看 Redo Log 配置
SHOW VARIABLES LIKE 'innodb_log%';

-- innodb_log_file_size：单个 Redo Log 文件大小（默认 48MB）
-- innodb_log_files_in_group：Redo Log 文件数量（默认 2）
-- innodb_log_buffer_size：Redo Log 缓冲区大小（默认 16MB）

-- 总大小 = innodb_log_file_size × innodb_log_files_in_group
-- 示例：48MB × 2 = 96MB
```

**调整 Redo Log 大小**：
```sql
-- MySQL 5.7：
-- 1. 停止 MySQL
-- 2. 删除旧的 ib_logfile*
-- 3. 修改 my.cnf：innodb_log_file_size = 256M
-- 4. 启动 MySQL（自动创建新文件）

-- MySQL 8.0+：
-- 在线调整
SET GLOBAL innodb_redo_log_capacity = 512M;
-- 自动调整文件大小
```

### 3. WAL（Write-Ahead Logging）

**原理**：
```
先写日志，再写数据

步骤：
1. 事务修改数据（内存中）
2. 将修改记录到 Redo Log Buffer
3. 提交时，Redo Log Buffer 刷盘
4. 返回事务提交成功
5. 后台异步将脏页刷盘

优点：
- Redo Log 顺序写，快速
- 脏页随机写，延迟批量刷新
- 提升性能
```

**示例**：
```
事务1：UPDATE users SET balance = 900 WHERE id = 1;

步骤：
1. 读取数据页到 Buffer Pool
2. 修改 Buffer Pool 中的数据（balance = 900）
3. 生成 Redo Log 记录：
   space_id=1, page_no=100, offset=200, old=1000, new=900
4. 将 Redo Log 写入 Redo Log Buffer
5. 事务提交：
   - Redo Log Buffer 刷盘（fsync）
   - 返回提交成功
6. 后台线程异步刷脏页：
   - 将 Buffer Pool 中的脏页写入磁盘
```

### 4. Redo Log 刷盘策略

**innodb_flush_log_at_trx_commit**：
```sql
SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit';

-- 0：每秒刷盘一次（性能最好，可能丢失1秒数据）
-- 1：每次提交都刷盘（最安全，性能最差）【默认】
-- 2：每次提交写入文件系统缓存，每秒刷盘（折中）
```

**对比**：
```
=== 0：每秒刷盘 ===
提交事务：
1. 写入 Redo Log Buffer
2. 返回提交成功（不刷盘）
3. 后台每秒一次：
   - Redo Log Buffer -> OS Cache
   - OS Cache -> 磁盘（fsync）

风险：
- MySQL 崩溃：丢失 1 秒内的事务
- 服务器崩溃：丢失 1 秒内的事务

性能：最好

=== 1：每次提交刷盘 ===
提交事务：
1. 写入 Redo Log Buffer
2. Redo Log Buffer -> OS Cache
3. OS Cache -> 磁盘（fsync）
4. 返回提交成功

风险：
- MySQL 崩溃：不丢失
- 服务器崩溃：不丢失

性能：最差（每次提交都 fsync）

=== 2：每次提交写入文件系统缓存 ===
提交事务：
1. 写入 Redo Log Buffer
2. Redo Log Buffer -> OS Cache
3. 返回提交成功（不 fsync）
4. 后台每秒一次：OS Cache -> 磁盘（fsync）

风险：
- MySQL 崩溃：不丢失（OS Cache 中有）
- 服务器崩溃：丢失 1 秒内的事务

性能：折中
```

**选择建议**：
```
生产环境（OLTP）：
- 使用 1（最安全）
- 或使用 2（折中）

非关键数据：
- 使用 2 或 0

测试环境：
- 使用 0（最快）
```

### 5. Redo Log 循环写入

**环形结构**：
```
Redo Log 文件组成环形结构：

[ib_logfile0] -> [ib_logfile1] -> [ib_logfile0] ...

写入指针（LSN）：
- write pos：当前写入位置
- checkpoint：已刷盘的脏页对应的位置

可用空间 = checkpoint 到 write pos

当 write pos 追上 checkpoint：
- 必须等待刷脏页
- 推进 checkpoint
- 才能继续写入
```

**LSN（Log Sequence Number）**：
```
日志序列号：
- 全局递增
- 每个 Redo Log 记录都有唯一 LSN
- 用于崩溃恢复定位

查看 LSN：
SHOW ENGINE INNODB STATUS\G

-- Log sequence number：当前 LSN
-- Log flushed up to：已刷盘的 LSN
-- Pages flushed up to：已刷脏页的 LSN
-- Last checkpoint at：最后 Checkpoint 的 LSN
```

### 6. Checkpoint

**作用**：
```
定期将脏页刷盘：
- 推进 checkpoint
- 释放 Redo Log 空间
- 减少崩溃恢复时间
```

**Checkpoint 类型**：
```
Sharp Checkpoint：
- 关闭数据库时
- 刷新所有脏页

Fuzzy Checkpoint：
- 运行时定期刷脏页
- 包括：
  - Master Thread Checkpoint：每秒/每10秒
  - Flush_LRU_List Checkpoint：LRU 列表清理
  - Async/Sync Flush Checkpoint：Redo Log 空间不足
  - Dirty Page Too Much Checkpoint：脏页过多
```

**配置**：
```sql
-- 脏页比例阈值
SHOW VARIABLES LIKE 'innodb_max_dirty_pages_pct';
-- 默认：75%（当脏页超过 75% 触发刷新）

-- Checkpoint 相关
SHOW VARIABLES LIKE 'innodb_adaptive_flushing';
-- 自适应刷新
```

---

## 崩溃恢复

### 1. 恢复流程

**启动恢复**：
```
MySQL 启动时：
1. 检查 Redo Log
2. 从 Checkpoint 开始重放
3. 恢复已提交事务
4. 回滚未提交事务（使用 Undo Log）
5. 完成恢复
```

**示例**：
```
崩溃前：
- 事务1：已提交，Redo Log 已刷盘，脏页未刷盘
- 事务2：未提交，Redo Log 已刷盘

恢复过程：
1. 重放 Redo Log：
   - 恢复事务1 的修改
   - 恢复事务2 的修改
2. 回滚未提交事务：
   - 使用 Undo Log 回滚事务2

最终：
- 事务1：已提交，数据恢复
- 事务2：已回滚，数据撤销
```

### 2. 监控恢复进度

**启动日志**：
```
# MySQL 错误日志
[Note] InnoDB: Starting crash recovery.
[Note] InnoDB: Starting recovery from log sequence number 123456789
[Note] InnoDB: Doing recovery: scanned up to log sequence number 123467890
[Note] InnoDB: Apply batch completed
[Note] InnoDB: Rollback of non-prepared transactions completed
[Note] InnoDB: Crash recovery finished.
```

---

## PostgreSQL WAL

### 1. WAL 原理

**WAL（Write-Ahead Log）**：
```
PostgreSQL 的 Redo Log 称为 WAL

位置：
- 数据目录/pg_wal/

文件：
- 16MB 的段文件
- 循环使用
```

**配置**：
```sql
-- 查看 WAL 配置
SHOW wal_level;  -- minimal, replica, logical

SHOW fsync;  -- on/off

SHOW synchronous_commit;  -- on, off, remote_write, remote_apply, local

SHOW wal_buffers;  -- WAL 缓冲区大小

SHOW checkpoint_timeout;  -- Checkpoint 间隔

SHOW max_wal_size;  -- WAL 最大大小
```

### 2. WAL 刷盘策略

**synchronous_commit**：
```sql
-- on：同步提交（最安全）
-- 提交时等待 WAL 刷盘

-- off：异步提交（最快）
-- 提交后异步刷盘
-- 可能丢失最后几个事务

-- local：本地刷盘
-- remote_write：复制到从库 OS 缓存
-- remote_apply：复制到从库并应用
```

### 3. Checkpoint

```sql
-- 手动触发 Checkpoint
CHECKPOINT;

-- 查看 Checkpoint 信息
SELECT * FROM pg_stat_bgwriter;

-- checkpoints_timed：定时 Checkpoint 数量
-- checkpoints_req：请求的 Checkpoint 数量
-- checkpoint_write_time：写入时间
-- checkpoint_sync_time：同步时间
```

---

## 性能优化

### 1. Redo Log 优化

**调整大小**：
```sql
-- 增大 Redo Log 文件大小
-- 减少 Checkpoint 频率
-- 提升写入性能

-- MySQL 5.7
innodb_log_file_size = 512M  -- 从 48MB 增加到 512MB
innodb_log_files_in_group = 2
-- 总大小：1GB

-- MySQL 8.0+
innodb_redo_log_capacity = 1G
```

**调整刷盘策略**：
```sql
-- 性能优先（可容忍少量数据丢失）
innodb_flush_log_at_trx_commit = 2

-- 安全优先
innodb_flush_log_at_trx_commit = 1
```

### 2. Undo Log 优化

**控制长事务**：
```sql
-- 监控长事务
SELECT 
    trx_id,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS duration_sec,
    trx_query
FROM information_schema.innodb_trx
WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 60;

-- 杀死长事务
KILL QUERY <trx_id>;
```

**增加 Purge 线程**：
```sql
-- 加快 Undo Log 清理
SET GLOBAL innodb_purge_threads = 8;
```

**启用自动截断**：
```sql
-- Undo 表空间自动截断
SET GLOBAL innodb_undo_log_truncate = ON;
SET GLOBAL innodb_max_undo_log_size = 2G;
```

### 3. 监控与诊断

**Redo Log 监控**：
```sql
SHOW ENGINE INNODB STATUS\G

-- Log sequence number：当前 LSN
-- Log flushed up to：已刷盘 LSN
-- Last checkpoint at：Checkpoint LSN

-- 如果 Log sequence number 和 Last checkpoint at 差距很大：
-- 说明有大量未刷盘的脏页
```

**Undo Log 监控**：
```sql
SHOW ENGINE INNODB STATUS\G

-- History list length：Undo Log 链表长度
-- 正常：< 1000
-- 警告：> 10000

-- Purge done for trx's：已清理的事务 ID
```

---

## 最佳实践

### 1. 配置建议

```ini
# my.cnf

# Redo Log
innodb_log_file_size = 512M  # 根据写入量调整
innodb_log_files_in_group = 2
innodb_log_buffer_size = 32M
innodb_flush_log_at_trx_commit = 1  # 生产环境使用 1

# Undo Log
innodb_undo_tablespaces = 2
innodb_undo_log_truncate = ON
innodb_max_undo_log_size = 1G
innodb_purge_threads = 4  # 根据 CPU 核数调整
```

### 2. 监控清单

```
Redo Log：
□ Log sequence number
□ Checkpoint 位置
□ 刷盘延迟
□ 文件大小是否合适

Undo Log：
□ History list length
□ Undo 表空间大小
□ Purge 速度
□ 长事务

告警阈值：
□ History list length > 10000
□ Checkpoint lag > 80%
□ Undo 表空间 > 设定阈值
```

### 3. 故障处理

```
Redo Log 满：
- 增大 innodb_log_file_size
- 提升脏页刷新速度

Undo Log 膨胀：
- 查找并终止长事务
- 增加 Purge 线程
- 启用自动截断

崩溃恢复慢：
- 减小 Redo Log 大小
- 增加 Checkpoint 频率
```

---

## 参考资料

1. **MySQL 官方文档**：
   - InnoDB Redo Log: https://dev.mysql.com/doc/refman/8.0/en/innodb-redo-log.html
   - InnoDB Undo Log: https://dev.mysql.com/doc/refman/8.0/en/innodb-undo-logs.html

2. **PostgreSQL 官方文档**：
   - WAL: https://www.postgresql.org/docs/current/wal.html

3. **推荐书籍**：
   - 《MySQL技术内幕：InnoDB存储引擎》
   - 《数据库系统实现》

4. **最佳实践**：
   - 合理配置日志大小
   - 选择合适的刷盘策略
   - 监控日志使用情况
   - 避免长事务
   - 定期检查和优化
   - 测试崩溃恢复流程
