# 后台线程与任务调度

## 概述

InnoDB 使用多个后台线程执行各种维护任务，如刷新脏页、清理 Undo Log、合并 Change Buffer 等。理解这些后台线程的工作机制，对于数据库性能优化和故障排查至关重要。

**核心后台线程**：
- **Master Thread**：主控制线程
- **IO Thread**：处理异步 I/O
- **Purge Thread**：清理 Undo Log
- **Page Cleaner Thread**：刷新脏页
- **其他辅助线程**

---

## Master Thread

### 1. 作用

**核心功能**：
```
协调各种后台任务：
- 刷新脏页
- 合并 Change Buffer
- 清理 Undo Log
- 刷新日志缓冲
- Checkpoint
```

**工作模式**：
```
主循环（Loop）：
- 每秒操作
- 每10秒操作

后台循环（Background Loop）：
- 服务器空闲时执行

暂停循环（Suspend Loop）：
- Master Thread 暂停时
```

### 2. 每秒操作

**任务列表**：
```
1. 刷新日志缓冲
   - 将 Redo Log Buffer 刷新到磁盘
   - 保证持久性

2. 合并 Change Buffer（可能）
   - 如果 I/O 压力不大
   - 合并最多 5 个页

3. 刷新脏页（可能）
   - 如果脏页比例过高
   - 刷新最多 100 个脏页

4. 删除 Undo 页（可能）
   - 如果 Undo 页过多
   - 删除最多 20 个 Undo 页
```

**代码逻辑（伪代码）**：
```
while (true) {
    // 每秒循环
    sleep(1);
    
    // 1. 刷新日志缓冲
    flush_log_buffer();
    
    // 2. 合并 Change Buffer
    if (io_capacity_ok()) {
        merge_insert_buffer(5);  // 最多 5 个页
    }
    
    // 3. 刷新脏页
    if (dirty_pages_pct > threshold) {
        flush_dirty_pages(100);  // 最多 100 个页
    }
    
    // 4. 删除 Undo 页
    if (undo_pages_too_many()) {
        purge_undo_pages(20);  // 最多 20 个页
    }
}
```

### 3. 每10秒操作

**任务列表**：
```
1. 刷新脏页
   - 根据脏页比例决定刷新数量
   - 可能刷新 100 或更多个页

2. 合并 Change Buffer
   - 合并最多 5 个页

3. 刷新日志缓冲
   - 确保日志持久化

4. 删除 Undo 页
   - 全力删除
   - 最多 20 个页

5. 产生 Checkpoint
   - 推进 Checkpoint LSN
   - 标记已刷盘的脏页
```

**代码逻辑（伪代码）**：
```
every_10_seconds() {
    // 1. 刷新脏页（根据过去 10 秒的 I/O）
    dirty_count = calculate_dirty_pages_to_flush();
    flush_dirty_pages(dirty_count);
    
    // 2. 合并 Change Buffer
    merge_insert_buffer(5);
    
    // 3. 刷新日志缓冲
    flush_log_buffer();
    
    // 4. 删除 Undo 页
    purge_undo_pages(20);
    
    // 5. Checkpoint
    checkpoint();
}
```

### 4. 后台循环

**触发条件**：
```
服务器空闲时：
- 当前没有用户活动
- 可以执行更多后台任务
```

**任务**：
```
1. 删除 Undo 页（全力）
   - 清理所有可以删除的 Undo 页

2. 合并 Change Buffer（全力）
   - 合并所有可以合并的页

3. 刷新脏页（全力）
   - 刷新大量脏页
   - 直到脏页比例低于阈值或 I/O 达到上限

4. 跳转回主循环或进入暂停循环
```

---

## IO Thread

### 1. 类型

**四种 IO Thread**：
```
Read Thread：
- 处理异步读取请求
- 预读操作

Write Thread：
- 处理异步写入请求
- 刷新脏页

Log Thread：
- 处理 Redo Log 的异步写入

Insert Buffer Thread：
- 处理 Change Buffer 的合并
```

### 2. 配置

**线程数量**：
```sql
-- 查看 I/O 线程配置
SHOW VARIABLES LIKE 'innodb_%io_threads';

-- innodb_read_io_threads：读线程数（默认 4）
-- innodb_write_io_threads：写线程数（默认 4）

-- 设置
[mysqld]
innodb_read_io_threads = 8
innodb_write_io_threads = 8

-- 建议：
-- HDD：4
-- SSD：8-16
-- 根据磁盘性能和并发度调整
```

### 3. 工作流程

**异步 I/O**：
```
1. 用户线程发起 I/O 请求
   - 读取数据页
   - 刷新脏页

2. 请求加入 I/O 队列
   - 不阻塞用户线程

3. IO Thread 处理请求
   - 从队列取出请求
   - 执行实际的磁盘 I/O

4. 完成回调
   - 通知用户线程
   - 或更新状态

优点：
- 用户线程不阻塞
- 提高并发度
- 批量 I/O
```

**批量 I/O**：
```
合并相邻的 I/O 请求：
- 减少磁盘寻道
- 提升 I/O 效率

示例：
请求1：读取页 100
请求2：读取页 101
请求3：读取页 102

合并：一次读取页 100-102
```

---

## Purge Thread

### 1. 作用

**清理 Undo Log**：
```
任务：
1. 清理已提交事务的 Undo Log
2. 物理删除标记删除的记录
3. 回收 Undo 页空间
4. 维护 MVCC 版本链
```

**为什么需要**：
```
Undo Log 不能立即删除：
- 可能有长事务需要读取旧版本
- 需要等待所有事务不再需要

Purge Thread：
- 后台异步清理
- 不阻塞前台事务
```

### 2. 配置

```sql
-- 查看 Purge 线程数
SHOW VARIABLES LIKE 'innodb_purge_threads';

-- 默认：4

-- 设置
[mysqld]
innodb_purge_threads = 8

-- 建议：
-- 4-8 个线程（根据 CPU 核数）
-- 写入密集型：增加线程数
```

**Purge 批处理大小**：
```sql
SHOW VARIABLES LIKE 'innodb_purge_batch_size';

-- 默认：300
-- 每次处理的 Undo 记录数

-- 调整
SET GLOBAL innodb_purge_batch_size = 500;
```

### 3. 工作流程

**Purge 流程**：
```
1. 从 History List 获取已提交事务
   - History List：待清理的 Undo Log 链表

2. 遍历 Undo Log
   - 找到已提交且所有事务都不再需要的记录

3. 清理操作
   - DELETE：物理删除记录
   - UPDATE：删除旧版本记录
   - 回收 Undo 页

4. 更新 Purge 进度
   - 推进 Purge LSN
```

**示例**：
```
事务1（已提交）：
- DELETE FROM users WHERE id = 1;
- Undo Log：插入旧记录到 Undo

事务2（未提交）：
- SELECT * FROM users WHERE id = 1;
- 使用 MVCC 读取旧版本

Purge 流程：
1. 检查是否有事务需要 id=1 的旧版本
2. 如果事务2已提交，没有其他事务需要
3. 物理删除 id=1 的记录
4. 清理 Undo Log
```

### 4. 监控

**History List Length**：
```sql
SHOW ENGINE INNODB STATUS\G

-- 查找 TRANSACTIONS 部分
-- History list length: 1234

-- 含义：待清理的 Undo Log 数量

-- 正常：< 1000
-- 警告：> 10000（有长事务或 Purge 落后）
```

**Purge 进度**：
```
SHOW ENGINE INNODB STATUS\G

-- Purge done for trx's n:o < 123456
-- 已清理到事务 ID 123456

-- 对比当前事务 ID
-- 差距过大说明 Purge 落后
```

---

## Page Cleaner Thread

### 1. 作用

**刷新脏页**：
```
任务：
1. 从 Flush List 获取脏页
2. 将脏页写入磁盘
3. 释放 Buffer Pool 空间
4. 推进 Checkpoint

目的：
- 减轻 Master Thread 负担
- 提高刷脏页效率
- 避免用户线程刷脏页
```

### 2. 配置

```sql
-- 查看 Page Cleaner 线程数
SHOW VARIABLES LIKE 'innodb_page_cleaners';

-- MySQL 5.7.4+：支持多个线程
-- 默认：4

-- 设置
[mysqld]
innodb_page_cleaners = 8

-- 建议：
-- 与 Buffer Pool 实例数相同
-- 或与 CPU 核数相关
```

**刷新策略**：
```sql
-- 自适应刷新
SHOW VARIABLES LIKE 'innodb_adaptive_flushing';
-- 默认：ON

-- 脏页比例阈值
SHOW VARIABLES LIKE 'innodb_max_dirty_pages_pct';
-- 默认：75%

-- I/O 容量
SHOW VARIABLES LIKE 'innodb_io_capacity';
-- 默认：200（HDD）
-- SSD：2000-5000
```

### 3. 工作流程

**刷新策略**：
```
1. 基于脏页比例
   - 脏页比例 > 阈值
   - 增加刷新速度

2. 基于 Redo Log 空间
   - Redo Log 快满
   - 加速刷新（推进 Checkpoint）

3. 基于 I/O 容量
   - 根据磁盘性能
   - 控制刷新速度

4. 自适应刷新
   - 根据系统负载
   - 动态调整刷新速度
```

**Checkpoint 流程**：
```
1. Page Cleaner 刷新脏页
   - 按 LSN 顺序刷新
   - 最早修改的页先刷新

2. 更新 Checkpoint LSN
   - 已刷盘的最大 LSN

3. 写入 Checkpoint 信息
   - 记录到 Redo Log

4. 释放 Redo Log 空间
   - Checkpoint 之前的日志可覆盖
```

---

## 其他后台线程

### 1. Lock Monitor Thread

**作用**：
```
监控锁等待和死锁：
- 检测死锁
- 记录锁等待信息
- 超时处理
```

### 2. Error Monitor Thread

**作用**：
```
监控错误和警告：
- 记录错误日志
- 处理异常情况
```

### 3. Dictionary Stats Thread

**作用**：
```
统计信息收集：
- 表统计信息
- 索引统计信息
- 用于查询优化器
```

---

## 监控后台线程

### 1. 查看线程状态

**SHOW PROCESSLIST**：
```sql
-- 查看所有线程
SHOW PROCESSLIST;

-- 后台线程通常显示为：
-- State: 'InnoDB master thread'
-- State: 'InnoDB purge worker'
-- State: 'InnoDB page cleaner'
```

**performance_schema**：
```sql
-- 查看后台线程
SELECT 
    thread_id,
    name,
    type,
    processlist_state
FROM performance_schema.threads
WHERE type = 'BACKGROUND'
    AND name LIKE 'thread/innodb%';
```

### 2. 监控指标

**Purge 监控**：
```sql
SHOW ENGINE INNODB STATUS\G

-- History list length：待清理的 Undo Log
-- Purge done for trx's：已清理的事务

-- 告警：
-- History list length > 10000
```

**Page Cleaner 监控**：
```sql
SHOW ENGINE INNODB STATUS\G

-- Pages flushed up to：已刷盘的页 LSN
-- Last checkpoint at：最后 Checkpoint LSN
-- Modified db pages：脏页数量

-- 告警：
-- 脏页比例 > 75%
-- Checkpoint lag 过大
```

**I/O 监控**：
```sql
SHOW STATUS LIKE 'Innodb_data%';

-- Innodb_data_reads：数据读取次数
-- Innodb_data_writes：数据写入次数
-- Innodb_data_fsyncs：fsync 调用次数

-- 计算 I/O 速率
```

---

## 性能优化

### 1. Purge 优化

**增加线程**：
```ini
[mysqld]
# 写入密集型场景
innodb_purge_threads = 8

# 增大批处理大小
innodb_purge_batch_size = 500
```

**监控长事务**：
```sql
-- 查找长事务（阻止 Purge）
SELECT 
    trx_id,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS duration_sec
FROM information_schema.innodb_trx
WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 60
ORDER BY trx_started;

-- 杀死长事务
KILL QUERY <trx_id>;
```

### 2. Page Cleaner 优化

**调整刷新参数**：
```ini
[mysqld]
# 增加 Page Cleaner 线程
innodb_page_cleaners = 8

# 降低脏页比例阈值（提前刷新）
innodb_max_dirty_pages_pct = 60

# 提高 I/O 容量（SSD）
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000

# 启用自适应刷新
innodb_adaptive_flushing = ON
```

### 3. I/O 优化

**调整 I/O 线程**：
```ini
[mysqld]
# SSD 场景
innodb_read_io_threads = 16
innodb_write_io_threads = 16

# HDD 场景
innodb_read_io_threads = 4
innodb_write_io_threads = 4
```

**使用 Native AIO**：
```ini
[mysqld]
# Linux 系统
innodb_use_native_aio = ON

# 优点：
# - 减少 CPU 开销
# - 提高 I/O 效率
# - 更好的并发性能
```

---

## 故障排查

### 1. Purge 落后

**症状**：
```
- History list length 持续增长
- Undo 表空间膨胀
- 查询性能下降
```

**排查**：
```sql
-- 1. 查看 Purge 线程数
SHOW VARIABLES LIKE 'innodb_purge_threads';

-- 2. 查找长事务
SELECT * FROM information_schema.innodb_trx
WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 300;

-- 3. 检查 Purge 批处理大小
SHOW VARIABLES LIKE 'innodb_purge_batch_size';
```

**解决**：
```
1. 杀死长事务
2. 增加 Purge 线程数
3. 增大批处理大小
4. 监控 History list length
```

### 2. 刷脏页慢

**症状**：
```
- 脏页比例持续高位
- 写入性能下降
- Checkpoint lag 过大
```

**排查**：
```sql
-- 1. 查看脏页比例
SHOW ENGINE INNODB STATUS\G
-- Modified db pages / Buffer pool size

-- 2. 查看 I/O 容量
SHOW VARIABLES LIKE 'innodb_io_capacity%';

-- 3. 查看 Page Cleaner 线程数
SHOW VARIABLES LIKE 'innodb_page_cleaners';
```

**解决**：
```
1. 增加 I/O 容量配置
2. 增加 Page Cleaner 线程
3. 降低脏页比例阈值
4. 使用 SSD
5. 优化写入负载
```

---

## 最佳实践

### 1. 配置建议

```ini
# my.cnf
[mysqld]
# Purge
innodb_purge_threads = 4
innodb_purge_batch_size = 300

# Page Cleaner
innodb_page_cleaners = 8
innodb_max_dirty_pages_pct = 75
innodb_adaptive_flushing = ON

# I/O
innodb_read_io_threads = 8
innodb_write_io_threads = 8
innodb_io_capacity = 2000  # SSD
innodb_io_capacity_max = 4000

# Native AIO
innodb_use_native_aio = ON
```

### 2. 监控清单

```
□ History list length
□ 脏页比例
□ Checkpoint lag
□ I/O 速率
□ 长事务
□ 后台线程状态
```

### 3. 运维建议

```
□ 定期检查后台线程状态
□ 监控关键指标
□ 及时处理长事务
□ 根据负载调整配置
□ 使用性能监控工具
□ 制定告警规则
```

---

## 参考资料

1. **MySQL 官方文档**：
   - InnoDB Background Threads: https://dev.mysql.com/doc/refman/8.0/en/innodb-background-threads.html

2. **推荐书籍**：
   - 《MySQL技术内幕：InnoDB存储引擎》

3. **监控工具**：
   - Percona Monitoring and Management (PMM)
   - MySQL Enterprise Monitor
   - Prometheus + Grafana

4. **最佳实践**：
   - 理解后台线程作用
   - 合理配置线程数
   - 监控关键指标
   - 及时处理异常
   - 根据负载优化
   - 持续改进
