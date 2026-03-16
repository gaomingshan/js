# 索引维护与优化

## 概述

索引并非一劳永逸，随着数据的增删改，索引会产生碎片、统计信息会过期、性能会下降。定期维护索引、识别并清理无用索引、优化索引设计是保持数据库高性能的关键。

**核心内容**：
- **索引碎片**：产生原因与影响
- **索引重建**：REBUILD vs REORGANIZE
- **统计信息维护**：保持优化器准确性
- **无用索引识别**：清理浪费资源的索引
- **索引监控**：跟踪索引使用情况
- **在线索引操作**：不影响业务的维护

---

## 索引碎片

### 1. 碎片产生原因

**页分裂**：
```
随机插入导致页分裂：
1. 页已满，插入新记录
2. 分配新页
3. 将部分记录移到新页
4. 原页和新页都只有一半满

结果：
- 空间利用率降低
- 增加 I/O 次数
- 查询性能下降
```

**删除操作**：
```
删除记录后：
1. 记录被标记为删除
2. 空间未立即回收
3. 页中产生空洞

结果：
- 页填充率降低
- 索引膨胀
```

**更新操作**：
```
更新索引列：
1. 删除旧索引项
2. 插入新索引项
3. 可能导致页分裂

结果：
- 索引碎片增加
```

### 2. 查看索引碎片

**MySQL**：
```sql
-- 查看表碎片
SELECT 
    table_schema,
    table_name,
    data_free,
    data_length,
    index_length,
    ROUND(data_free / (data_length + index_length) * 100, 2) AS fragmentation_pct
FROM information_schema.tables
WHERE table_schema = 'mydb'
    AND data_free > 0
ORDER BY fragmentation_pct DESC;

-- data_free：可用空间（碎片）
-- fragmentation_pct：碎片率

-- 建议：碎片率 > 30% 时考虑重建
```

**Oracle**：
```sql
-- 查看索引碎片
SELECT 
    index_name,
    blevel,
    leaf_blocks,
    distinct_keys,
    clustering_factor,
    ROUND((1 - (leaf_blocks / distinct_keys)) * 100, 2) AS fragmentation_pct
FROM user_indexes
WHERE table_name = 'USERS';

-- blevel：索引高度 - 1
-- leaf_blocks：叶子块数量
-- clustering_factor：聚集因子（越小越好）
```

**PostgreSQL**：
```sql
-- 安装 pgstattuple 扩展
CREATE EXTENSION pgstattuple;

-- 查看索引碎片
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    (pgstatindex(indexrelid)).avg_leaf_density AS leaf_density,
    (pgstatindex(indexrelid)).leaf_fragmentation AS fragmentation
FROM pg_stat_user_indexes
WHERE schemaname = 'public';

-- leaf_density：叶子节点填充率（越高越好）
-- fragmentation：碎片率（越低越好）
```

### 3. 碎片的影响

**性能影响**：
```
1. I/O 增加
   - 页填充率低，需要读取更多页
   - 范围查询效率降低

2. 空间浪费
   - 索引占用更多磁盘空间
   - 内存缓存效率降低

3. 查询变慢
   - 索引扫描需要访问更多页
   - B+Tree 高度可能增加
```

**示例**：
```
无碎片索引：
- 1000 万条记录
- 索引大小：200 MB
- 页填充率：90%
- 范围查询：1000 次 I/O

有碎片索引（碎片率 50%）：
- 1000 万条记录
- 索引大小：400 MB
- 页填充率：45%
- 范围查询：2000 次 I/O

性能下降 50%
```

---

## 索引重建与重组

### 1. REBUILD（重建）

完全重建索引，创建全新的索引结构。

**MySQL**：
```sql
-- 重建表和所有索引
ALTER TABLE users ENGINE=InnoDB;

-- 或使用 OPTIMIZE TABLE
OPTIMIZE TABLE users;

-- OPTIMIZE TABLE 做了什么：
-- 1. 创建新表
-- 2. 复制数据到新表
-- 3. 重建所有索引
-- 4. 删除旧表
-- 5. 重命名新表

-- 注意：会锁表
```

**Oracle**：
```sql
-- 在线重建索引
ALTER INDEX idx_username REBUILD ONLINE;

-- 离线重建（更快，但锁表）
ALTER INDEX idx_username REBUILD;

-- 重建并压缩
ALTER INDEX idx_username REBUILD COMPRESS;

-- 重建到不同表空间
ALTER INDEX idx_username REBUILD TABLESPACE new_tablespace;
```

**PostgreSQL**：
```sql
-- 重建索引
REINDEX INDEX idx_username;

-- 重建表的所有索引
REINDEX TABLE users;

-- 并发重建（不锁表）
CREATE INDEX CONCURRENTLY idx_username_new ON users(username);
DROP INDEX CONCURRENTLY idx_username;
ALTER INDEX idx_username_new RENAME TO idx_username;
```

### 2. REORGANIZE（重组）

整理索引，但不完全重建。

**MySQL**（InnoDB）：
```sql
-- InnoDB 没有单独的 REORGANIZE
-- 使用 OPTIMIZE TABLE 重建

OPTIMIZE TABLE users;
```

**Oracle**：
```sql
-- 合并索引
ALTER INDEX idx_username COALESCE;

-- 与 REBUILD 的区别：
-- COALESCE：合并现有块，不分配新空间，较快
-- REBUILD：完全重建，分配新空间，较慢但更彻底
```

**SQL Server**（参考）：
```sql
-- 重组（碎片 < 30%）
ALTER INDEX idx_username ON users REORGANIZE;

-- 重建（碎片 >= 30%）
ALTER INDEX idx_username ON users REBUILD;
```

### 3. REBUILD vs REORGANIZE 选择

| 特性 | REBUILD | REORGANIZE |
|------|---------|------------|
| 碎片清理 | 完全清理 | 部分清理 |
| 性能提升 | 显著 | 一般 |
| 执行时间 | 长 | 短 |
| 空间需求 | 需要额外空间 | 原地操作 |
| 锁表 | 可能锁表 | 通常不锁 |
| 适用场景 | 碎片严重（>30%） | 碎片轻微（<30%） |

**选择建议**：
```sql
-- 碎片率 < 10%：不需要维护
-- 碎片率 10%-30%：使用 REORGANIZE
-- 碎片率 > 30%：使用 REBUILD
```

---

## 在线索引操作

### 1. 在线重建索引

**Oracle**：
```sql
-- 在线重建
ALTER INDEX idx_username REBUILD ONLINE;

-- 原理：
-- 1. 创建新索引
-- 2. 复制数据时，同时记录对原表的修改
-- 3. 新索引创建完成后，应用记录的修改
-- 4. 切换索引
-- 5. 删除旧索引

-- 优点：不阻塞 DML 操作
-- 缺点：需要更多空间和时间
```

**PostgreSQL**：
```sql
-- 并发创建索引
CREATE INDEX CONCURRENTLY idx_username ON users(username);

-- 原理：
-- 1. 创建索引定义
-- 2. 等待所有事务完成
-- 3. 构建索引
-- 4. 等待所有事务完成
-- 5. 标记索引为有效

-- 注意：
-- - 时间较长
-- - 如果失败，索引标记为 INVALID
-- - 需要手动删除失败的索引
```

**MySQL**：
```sql
-- MySQL 8.0+ Online DDL
ALTER TABLE users 
ADD INDEX idx_username (username),
ALGORITHM=INPLACE,
LOCK=NONE;

-- ALGORITHM：
-- - COPY：创建临时表，锁表
-- - INPLACE：原地修改，较快
-- - INSTANT：即时完成（8.0+）

-- LOCK：
-- - NONE：不锁表
-- - SHARED：允许读，不允许写
-- - EXCLUSIVE：完全锁表
```

### 2. 在线删除索引

```sql
-- MySQL
DROP INDEX idx_username ON users;
-- 默认在线操作（8.0+）

-- PostgreSQL
DROP INDEX CONCURRENTLY idx_username;

-- Oracle
DROP INDEX idx_username ONLINE;
```

---

## 统计信息维护

### 1. 统计信息的重要性

```
优化器依赖统计信息：
- 表的行数
- 列的基数
- 数据分布
- 索引选择性

统计信息过期导致：
- 选择错误的索引
- 选择错误的 JOIN 顺序
- 估算错误的成本
- 查询性能下降
```

### 2. 更新统计信息

**MySQL**：
```sql
-- 分析表
ANALYZE TABLE users;

-- 分析多个表
ANALYZE TABLE users, orders, products;

-- 持久化统计信息（InnoDB）
SET GLOBAL innodb_stats_persistent = ON;

-- 统计信息采样
SET GLOBAL innodb_stats_sample_pages = 20;
```

**Oracle**：
```sql
-- 收集表统计信息
EXEC DBMS_STATS.GATHER_TABLE_STATS('SCHEMA_NAME', 'USERS');

-- 收集索引统计信息
EXEC DBMS_STATS.GATHER_INDEX_STATS('SCHEMA_NAME', 'IDX_USERNAME');

-- 收集 Schema 所有对象统计
EXEC DBMS_STATS.GATHER_SCHEMA_STATS('SCHEMA_NAME');

-- 设置自动收集
BEGIN
    DBMS_STATS.SET_GLOBAL_PREFS('AUTO_STATS_LEVEL', 'AUTO');
END;
```

**PostgreSQL**：
```sql
-- 分析表
ANALYZE users;

-- 分析所有表
ANALYZE;

-- 自动 ANALYZE（默认启用）
SHOW autovacuum;

-- 配置自动 ANALYZE
ALTER TABLE users SET (autovacuum_analyze_scale_factor = 0.1);
```

### 3. 统计信息更新频率

**建议策略**：
```
小表（< 1万行）：
- 每天更新

中表（1万 - 100万行）：
- 每周更新
- 数据变化大时手动更新

大表（> 100万行）：
- 每月更新
- 增量更新
- 监控数据变化，变化超过 20% 时更新

高频写入表：
- 启用自动统计收集
- 配置合理的触发阈值
```

---

## 无用索引识别与清理

### 1. 识别未使用的索引

**MySQL**：
```sql
-- 查看索引使用情况
SELECT 
    object_schema,
    object_name,
    index_name,
    count_read,
    count_fetch,
    count_insert,
    count_update,
    count_delete
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'mydb'
    AND index_name IS NOT NULL
ORDER BY count_read DESC;

-- 查找从未使用的索引
SELECT 
    object_schema,
    object_name,
    index_name
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'mydb'
    AND index_name IS NOT NULL
    AND index_name != 'PRIMARY'
    AND count_star = 0;
```

**Oracle**：
```sql
-- 启用索引监控
ALTER INDEX idx_username MONITORING USAGE;

-- 查看使用情况
SELECT * FROM v$object_usage;

-- 停止监控
ALTER INDEX idx_username NOMONITORING USAGE;
```

**PostgreSQL**：
```sql
-- 查看索引使用统计
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan;

-- 查找未使用的索引
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexrelname NOT LIKE 'pg_toast%'
    AND schemaname = 'public';
```

### 2. 识别重复索引

**MySQL**：
```sql
-- 查找重复索引
SELECT 
    t1.table_schema,
    t1.table_name,
    t1.index_name AS index1,
    t2.index_name AS index2,
    t1.column_name
FROM information_schema.statistics t1
JOIN information_schema.statistics t2
    ON t1.table_schema = t2.table_schema
    AND t1.table_name = t2.table_name
    AND t1.column_name = t2.column_name
    AND t1.seq_in_index = t2.seq_in_index
    AND t1.index_name < t2.index_name
WHERE t1.table_schema = 'mydb'
ORDER BY t1.table_schema, t1.table_name, t1.index_name;
```

**示例**：
```sql
-- 重复索引
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_username_2 ON users(username);
-- idx_username_2 是冗余的

-- 冗余索引
CREATE INDEX idx_city ON users(city);
CREATE INDEX idx_city_age ON users(city, age);
-- idx_city 是冗余的（idx_city_age 可以覆盖 city 的查询）
```

### 3. 清理无用索引

**清理策略**：
```sql
-- 步骤1：监控索引使用情况（至少1个月）
-- 步骤2：识别未使用的索引
-- 步骤3：在测试环境删除测试
-- 步骤4：在生产环境低峰期删除

-- 删除索引
DROP INDEX idx_unused ON users;

-- 注意：
-- - 删除前备份索引定义
-- - 删除后监控查询性能
-- - 如有问题，快速回滚（重建索引）
```

**备份索引定义**：
```sql
-- MySQL：导出索引定义
SHOW CREATE TABLE users;

-- 保存索引创建语句
-- CREATE INDEX idx_username ON users(username);
```

---

## 索引监控与诊断

### 1. 监控索引大小

**MySQL**：
```sql
SELECT 
    table_schema,
    table_name,
    table_rows,
    ROUND(data_length / 1024 / 1024, 2) AS data_mb,
    ROUND(index_length / 1024 / 1024, 2) AS index_mb,
    ROUND(index_length / data_length * 100, 2) AS index_ratio
FROM information_schema.tables
WHERE table_schema = 'mydb'
ORDER BY index_length DESC;

-- index_ratio：索引占数据的比例
-- 正常：50%-100%
-- 过高：可能有冗余索引
```

**PostgreSQL**：
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS data_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. 监控索引膨胀

**PostgreSQL**：
```sql
-- 查看表和索引膨胀
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(relid)) AS size,
    n_dead_tup,
    n_live_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_dead_tup > 1000
ORDER BY dead_ratio DESC;

-- dead_ratio > 20%：需要 VACUUM
```

### 3. 监控索引扫描效率

```sql
-- 查看索引扫描与表扫描比例
SELECT 
    schemaname,
    tablename,
    idx_scan,
    seq_scan,
    ROUND(idx_scan::numeric / NULLIF(idx_scan + seq_scan, 0) * 100, 2) AS idx_scan_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;

-- idx_scan_ratio < 50%：可能需要优化索引
```

---

## 索引维护最佳实践

### 1. 定期维护计划

**每日任务**：
```sql
-- 收集统计信息（小表）
ANALYZE TABLE small_table1, small_table2;
```

**每周任务**：
```sql
-- 收集统计信息（中表）
ANALYZE TABLE medium_table;

-- 检查索引碎片
-- 如果碎片率 > 30%，计划重建
```

**每月任务**：
```sql
-- 收集统计信息（大表）
ANALYZE TABLE large_table;

-- 重建高碎片索引
OPTIMIZE TABLE high_fragment_table;

-- 清理无用索引
-- 审查监控数据，删除未使用的索引
```

**每季度任务**：
```sql
-- 全面索引审查
-- - 识别冗余索引
-- - 识别缺失索引
-- - 评估索引效率
-- - 调整索引策略
```

### 2. 自动化维护

**MySQL 事件调度器**：
```sql
-- 启用事件调度器
SET GLOBAL event_scheduler = ON;

-- 创建定期维护事件
CREATE EVENT evt_daily_analyze
ON SCHEDULE EVERY 1 DAY
STARTS '2024-01-01 02:00:00'
DO
BEGIN
    ANALYZE TABLE users, orders, products;
END;

-- 每周优化事件
CREATE EVENT evt_weekly_optimize
ON SCHEDULE EVERY 1 WEEK
STARTS '2024-01-07 03:00:00'
DO
BEGIN
    OPTIMIZE TABLE large_table;
END;
```

**PostgreSQL Cron**：
```sql
-- 安装 pg_cron 扩展
CREATE EXTENSION pg_cron;

-- 定期 ANALYZE
SELECT cron.schedule('daily-analyze', '0 2 * * *', 'ANALYZE;');

-- 定期 VACUUM
SELECT cron.schedule('daily-vacuum', '0 3 * * *', 'VACUUM ANALYZE;');
```

### 3. 维护窗口选择

```
选择低峰期执行维护：
- 凌晨 2:00 - 5:00
- 避开业务高峰
- 避开备份时间

维护前：
- 通知相关人员
- 准备回滚方案
- 监控系统负载

维护后：
- 验证性能
- 检查日志
- 监控告警
```

---

## 易错点与注意事项

### 1. OPTIMIZE TABLE 锁表

```sql
-- 注意：OPTIMIZE TABLE 会锁表

-- 错误：在业务高峰期执行
OPTIMIZE TABLE users;  -- 可能导致业务中断

-- 正确：在低峰期执行
-- 或使用 pt-online-schema-change 工具
```

### 2. 统计信息过时

```sql
-- 问题：大量数据变化后未更新统计

-- 初始：100 万行
ANALYZE TABLE orders;

-- 新增 900 万行
-- 但未更新统计信息

-- 优化器仍认为只有 100 万行
-- 可能选择错误的执行计划

-- 解决：及时更新
ANALYZE TABLE orders;
```

### 3. 删除索引前未备份

```sql
-- 危险：直接删除索引
DROP INDEX idx_rarely_used ON users;

-- 安全：先备份定义
SHOW CREATE TABLE users;
-- 保存 CREATE INDEX 语句

-- 然后删除
DROP INDEX idx_rarely_used ON users;

-- 如有问题，快速回滚
CREATE INDEX idx_rarely_used ON users(rarely_used);
```

---

## 生产环境维护案例

### 1. 索引碎片优化

**问题**：
```sql
-- 查询性能下降
SELECT * FROM orders WHERE created_at > '2024-01-01';
-- 执行时间从 1s 增加到 5s

-- 检查碎片
SELECT data_free, data_length, index_length
FROM information_schema.tables
WHERE table_name = 'orders';
-- 碎片率：45%
```

**解决**：
```sql
-- 低峰期重建索引
OPTIMIZE TABLE orders;

-- 重建后
-- 碎片率：5%
-- 查询时间：1s

-- 结果：性能恢复
```

### 2. 清理无用索引

**分析**：
```sql
-- 发现大量未使用索引
SELECT 
    index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size,
    idx_scan
FROM pg_stat_user_indexes
WHERE tablename = 'users' AND idx_scan = 0;

-- 结果：
-- idx_old_1  | 500 MB | 0
-- idx_old_2  | 300 MB | 0
-- idx_test   | 200 MB | 0
```

**清理**：
```sql
-- 测试环境验证
DROP INDEX idx_old_1;
DROP INDEX idx_old_2;
DROP INDEX idx_test;
-- 测试查询性能：无影响

-- 生产环境执行
DROP INDEX CONCURRENTLY idx_old_1;
DROP INDEX CONCURRENTLY idx_old_2;
DROP INDEX CONCURRENTLY idx_test;

-- 结果：
-- 释放 1 GB 空间
-- 插入性能提升 15%
```

---

## 参考资料

1. **MySQL 官方文档**：
   - OPTIMIZE TABLE: https://dev.mysql.com/doc/refman/8.0/en/optimize-table.html
   - ANALYZE TABLE: https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html

2. **PostgreSQL 官方文档**：
   - REINDEX: https://www.postgresql.org/docs/current/sql-reindex.html
   - VACUUM: https://www.postgresql.org/docs/current/sql-vacuum.html

3. **Oracle 官方文档**：
   - Index Maintenance: https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/managing-indexes.html

4. **工具推荐**：
   - pt-online-schema-change：Percona Toolkit
   - pg_repack：PostgreSQL 在线表重组
   - pgstattuple：PostgreSQL 碎片分析

5. **最佳实践**：
   - 定期检查索引碎片
   - 及时更新统计信息
   - 监控索引使用情况
   - 清理无用索引
   - 选择合适的维护窗口
