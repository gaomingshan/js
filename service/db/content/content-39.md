# 事务性能调优

## 概述

事务性能调优是提升数据库系统吞吐量和响应时间的关键。通过优化事务设计、调整配置参数、改进并发控制策略，可以显著提升系统性能。本章介绍事务性能调优的方法和最佳实践。

**核心内容**：
- **事务设计优化**：减少事务时间、缩小事务范围
- **锁优化**：降低锁竞争、选择合适锁粒度
- **隔离级别调优**：平衡一致性和性能
- **参数调优**：优化事务相关参数
- **监控分析**：识别性能瓶颈

---

## 事务设计优化

### 1. 缩短事务时间

**问题**：
```python
# 不好：事务时间长
def process_order(order_id):
    conn.start_transaction()
    
    # 1. 查询订单信息（数据库操作）
    order = db.query("SELECT * FROM orders WHERE id = %s", order_id)
    
    # 2. 调用外部API（网络I/O，耗时）
    shipping_info = call_shipping_api(order)
    
    # 3. 发送邮件（网络I/O，耗时）
    send_email(order['user_email'], shipping_info)
    
    # 4. 更新订单状态
    db.execute("UPDATE orders SET status = 'shipped' WHERE id = %s", order_id)
    
    conn.commit()
    # 事务持有锁时间过长
```

**优化**：
```python
# 好：只在必要时使用事务
def process_order(order_id):
    # 1. 查询订单（无事务）
    order = db.query("SELECT * FROM orders WHERE id = %s", order_id)
    
    # 2. 调用外部API（无事务）
    shipping_info = call_shipping_api(order)
    
    # 3. 发送邮件（无事务）
    send_email(order['user_email'], shipping_info)
    
    # 4. 只在更新时开启事务
    conn.start_transaction()
    db.execute("UPDATE orders SET status = 'shipped' WHERE id = %s", order_id)
    conn.commit()
    # 事务时间短，持有锁时间短
```

**原则**：
```
✓ 事务只包含必须的数据库操作
✗ 不在事务中执行外部API调用
✗ 不在事务中执行文件I/O
✗ 不在事务中执行复杂计算
✗ 不在事务中Sleep
```

### 2. 减小事务范围

**拆分大事务**：
```sql
-- 不好：一次更新百万行
BEGIN;
UPDATE large_table SET status = 1 WHERE created_at < '2023-01-01';
-- 可能更新百万行，持有锁时间长
COMMIT;

-- 好：分批更新
DELIMITER //
CREATE PROCEDURE batch_update()
BEGIN
    DECLARE affected INT DEFAULT 1;
    
    WHILE affected > 0 DO
        BEGIN;
        UPDATE large_table 
        SET status = 1 
        WHERE created_at < '2023-01-01' 
        LIMIT 10000;
        
        SET affected = ROW_COUNT();
        COMMIT;
        
        SELECT SLEEP(0.1);  -- 间隔，避免持续占用资源
    END WHILE;
END //
DELIMITER ;

CALL batch_update();
```

**避免跨多个业务模块的事务**：
```python
# 不好：跨多个服务的事务
def create_order(order_data):
    conn.start_transaction()
    
    # 订单服务
    create_order_record(order_data)
    
    # 库存服务
    deduct_stock(order_data['product_id'], order_data['quantity'])
    
    # 积分服务
    add_points(order_data['user_id'], order_data['amount'])
    
    # 优惠券服务
    mark_coupon_used(order_data['coupon_id'])
    
    conn.commit()

# 好：每个服务独立事务
def create_order(order_data):
    # 1. 创建订单（事务1）
    order_id = order_service.create(order_data)
    
    # 2. 异步处理其他操作
    event_bus.publish('OrderCreated', {
        'order_id': order_id,
        'product_id': order_data['product_id'],
        'quantity': order_data['quantity']
    })
    
    return order_id

# 事件处理（各自独立事务）
def on_order_created(event):
    # 库存服务（事务2）
    stock_service.deduct(event['product_id'], event['quantity'])
    
    # 积分服务（事务3）
    points_service.add(event['user_id'], event['amount'])
```

### 3. 只读事务优化

**声明只读事务**：
```sql
-- MySQL
START TRANSACTION READ ONLY;
SELECT * FROM users WHERE id = 1;
COMMIT;

-- 或
SET TRANSACTION READ ONLY;
BEGIN;
SELECT * FROM orders WHERE user_id = 100;
COMMIT;

-- 优化器可以跳过：
-- - 事务ID分配
-- - Undo Log记录
-- - 锁操作
```

**应用层**：
```python
# Django
from django.db import transaction

@transaction.non_atomic_requests
def read_only_view(request):
    # 不使用事务
    users = User.objects.all()
    return render(request, 'users.html', {'users': users})

# 或明确声明只读
with transaction.atomic():
    # 只读操作
    users = User.objects.filter(status=1)
```

---

## 锁优化

### 1. 降低锁粒度

**使用行锁代替表锁**：
```sql
-- 不好：表锁
LOCK TABLES products WRITE;
UPDATE products SET stock = stock - 1 WHERE id = 100;
UNLOCK TABLES;
-- 锁定整张表

-- 好：行锁（InnoDB默认）
BEGIN;
UPDATE products SET stock = stock - 1 WHERE id = 100;
COMMIT;
-- 只锁定id=100的行
```

**索引优化减少锁范围**：
```sql
-- 不好：无索引，锁定扫描的所有行
UPDATE users SET status = 1 WHERE email = 'alice@example.com';
-- 全表扫描，锁定大量行

-- 好：有索引，只锁定匹配的行
CREATE INDEX idx_email ON users(email);
UPDATE users SET status = 1 WHERE email = 'alice@example.com';
-- 索引扫描，只锁定匹配的行
```

**分片热点数据**：
```sql
-- 热点行拆分
-- 不好：单一计数器（热点）
CREATE TABLE counters (
    id INT PRIMARY KEY,
    count BIGINT
);

-- 高并发更新
UPDATE counters SET count = count + 1 WHERE id = 1;
-- 锁竞争严重

-- 好：分片计数器
CREATE TABLE counters (
    shard_id INT,
    count BIGINT,
    PRIMARY KEY (shard_id)
);

-- 插入多个分片
INSERT INTO counters VALUES (1, 0), (2, 0), ..., (10, 0);

-- 随机更新一个分片
UPDATE counters SET count = count + 1 WHERE shard_id = FLOOR(RAND() * 10) + 1;

-- 查询时汇总
SELECT SUM(count) FROM counters;
```

### 2. 统一加锁顺序

**避免死锁**：
```python
# 不好：加锁顺序不一致
def transfer_v1(from_id, to_id, amount):
    conn.start_transaction()
    
    # 锁定转出账户
    db.execute("SELECT * FROM accounts WHERE id = %s FOR UPDATE", from_id)
    
    # 锁定转入账户
    db.execute("SELECT * FROM accounts WHERE id = %s FOR UPDATE", to_id)
    
    # 转账
    db.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", amount, from_id)
    db.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", amount, to_id)
    
    conn.commit()

# 好：统一加锁顺序（按ID升序）
def transfer_v2(from_id, to_id, amount):
    conn.start_transaction()
    
    # 按ID排序
    ids = sorted([from_id, to_id])
    
    # 按顺序加锁
    db.execute("SELECT * FROM accounts WHERE id IN (%s, %s) ORDER BY id FOR UPDATE", ids[0], ids[1])
    
    # 转账
    db.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", amount, from_id)
    db.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", amount, to_id)
    
    conn.commit()
```

### 3. 选择合适的锁模式

**共享锁 vs 排他锁**：
```sql
-- 只读操作：共享锁
BEGIN;
SELECT * FROM products WHERE id = 100 FOR SHARE;
-- 允许其他事务也读取
COMMIT;

-- 写操作：排他锁
BEGIN;
SELECT * FROM products WHERE id = 100 FOR UPDATE;
-- 阻止其他事务读写
UPDATE products SET stock = stock - 1 WHERE id = 100;
COMMIT;
```

**跳过锁定的行（PostgreSQL）**：
```sql
-- 队列处理：跳过已被锁定的行
SELECT * FROM tasks
WHERE status = 'pending'
ORDER BY created_at
LIMIT 10
FOR UPDATE SKIP LOCKED;

-- 多个工作进程并发处理，不互相阻塞
```

---

## 隔离级别调优

### 1. 降低隔离级别

**性能对比**：
```
Serializable   ← 最慢，锁最多
    ↑
Repeatable Read
    ↑
Read Committed ← 推荐（平衡性能和一致性）
    ↑
Read Uncommitted ← 最快，但不安全
```

**调整隔离级别**：
```sql
-- 全局设置
SET GLOBAL transaction_isolation = 'READ-COMMITTED';

-- 会话级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 事务级别
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;
-- ...
COMMIT;
```

**场景选择**：
```
OLTP系统：
- 推荐 Read Committed
- 减少锁竞争
- 提升并发度

OLAP系统：
- 可以使用 Repeatable Read
- 保证查询一致性快照

金融系统：
- 核心交易使用 Repeatable Read 或 Serializable
- 非核心查询使用 Read Committed
```

### 2. 减少 Gap Lock

**Read Committed 无 Gap Lock**：
```sql
-- Repeatable Read（默认）
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;

SELECT * FROM users WHERE age > 18 FOR UPDATE;
-- 锁定：
-- - 符合条件的记录（Record Lock）
-- - 记录之间的间隙（Gap Lock）
-- - 阻止插入age > 18的新记录

COMMIT;

-- Read Committed（无Gap Lock）
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;

SELECT * FROM users WHERE age > 18 FOR UPDATE;
-- 只锁定：
-- - 符合条件的记录（Record Lock）
-- - 不锁定间隙
-- - 允许插入age > 18的新记录（可能幻读）

COMMIT;
```

---

## 参数调优

### 1. Undo Log 参数

**控制 Undo Log 大小**：
```sql
-- 查看 Undo 参数
SHOW VARIABLES LIKE 'innodb_undo%';

-- 自动截断
SET GLOBAL innodb_undo_log_truncate = ON;

-- 截断阈值
SET GLOBAL innodb_max_undo_log_size = 1073741824;  -- 1GB

-- Undo 表空间数量
SET GLOBAL innodb_undo_tablespaces = 2;

-- Purge 线程数
SET GLOBAL innodb_purge_threads = 4;
```

### 2. Redo Log 参数

**调整 Redo Log 大小**：
```sql
-- 查看 Redo Log 配置
SHOW VARIABLES LIKE 'innodb_log%';

-- MySQL 8.0+
SET GLOBAL innodb_redo_log_capacity = 1073741824;  -- 1GB

-- 或在 my.cnf
[mysqld]
innodb_redo_log_capacity = 1G
```

**刷盘策略**：
```sql
-- 查看刷盘策略
SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit';

-- 0：每秒刷盘（最快，可能丢1秒数据）
-- 1：每次提交刷盘（最安全，最慢）【默认】
-- 2：每次提交写OS缓存，每秒刷盘（折中）

-- 性能优化（可接受少量数据丢失）
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
```

### 3. Buffer Pool 参数

**调整缓冲池大小**：
```sql
-- 查看 Buffer Pool 大小
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- 设置为物理内存的 70-80%
SET GLOBAL innodb_buffer_pool_size = 8589934592;  -- 8GB

-- 配置文件
[mysqld]
innodb_buffer_pool_size = 8G
innodb_buffer_pool_instances = 8  -- 多个实例，减少竞争
```

### 4. 锁相关参数

**锁等待超时**：
```sql
-- 查看锁等待超时
SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';

-- 默认：50秒
-- 调整为更合理的值
SET GLOBAL innodb_lock_wait_timeout = 10;
```

**死锁检测**：
```sql
-- 死锁检测（默认开启）
SHOW VARIABLES LIKE 'innodb_deadlock_detect';

-- 高并发场景可能导致性能下降
-- 可以关闭死锁检测（谨慎）
SET GLOBAL innodb_deadlock_detect = OFF;

-- 依赖 innodb_lock_wait_timeout 超时回滚
```

---

## 批量操作优化

### 1. 批量插入

**优化方案**：
```python
# 不好：逐条插入
for data in dataset:
    db.execute("INSERT INTO logs VALUES (%s, %s, %s)", data)
# 1000条数据 = 1000次事务

# 好：批量插入
values = []
for data in dataset:
    values.append(f"({data[0]}, '{data[1]}', '{data[2]}')")

sql = f"INSERT INTO logs VALUES {','.join(values)}"
db.execute(sql)
# 1次事务

# 更好：使用executemany
db.executemany("INSERT INTO logs VALUES (%s, %s, %s)", dataset)
```

**LOAD DATA**：
```sql
-- 大批量数据导入
LOAD DATA INFILE '/path/to/data.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

-- 性能远超 INSERT
```

### 2. 批量更新

**使用 CASE WHEN**：
```sql
-- 不好：多次更新
UPDATE users SET vip_level = 3 WHERE id = 1;
UPDATE users SET vip_level = 2 WHERE id = 2;
UPDATE users SET vip_level = 1 WHERE id = 3;

-- 好：一次更新
UPDATE users
SET vip_level = CASE id
    WHEN 1 THEN 3
    WHEN 2 THEN 2
    WHEN 3 THEN 1
END
WHERE id IN (1, 2, 3);
```

### 3. 批量删除

**分批删除**：
```python
def batch_delete(table, condition, batch_size=10000):
    """分批删除"""
    while True:
        affected = db.execute(f"""
            DELETE FROM {table}
            WHERE {condition}
            LIMIT {batch_size}
        """)
        
        if affected == 0:
            break
        
        time.sleep(0.1)  -- 间隔，避免持续占用资源
```

---

## 读写分离

### 1. 主从分离

**配置**：
```python
# 配置主库和从库
DATABASES = {
    'default': {  # 主库（写）
        'ENGINE': 'django.db.backends.mysql',
        'HOST': 'master.db.com',
        'PORT': 3306,
    },
    'slave': {  # 从库（读）
        'ENGINE': 'django.db.backends.mysql',
        'HOST': 'slave.db.com',
        'PORT': 3306,
    }
}

# 路由
class DatabaseRouter:
    def db_for_read(self, model, **hints):
        return 'slave'
    
    def db_for_write(self, model, **hints):
        return 'default'
```

**优势**：
```
✓ 主库负责写操作
✓ 从库负责读操作
✓ 降低主库压力
✓ 提升读并发度
```

### 2. 应用层缓存

**缓存热点数据**：
```python
import redis

def get_user(user_id):
    """获取用户（带缓存）"""
    cache_key = f"user:{user_id}"
    
    # 1. 查缓存
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # 2. 查数据库
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    
    # 3. 写缓存
    if user:
        redis_client.setex(cache_key, 3600, json.dumps(user))
    
    return user
```

---

## 监控与诊断

### 1. 性能指标监控

**关键指标**：
```sql
-- TPS/QPS
SHOW GLOBAL STATUS LIKE 'Questions';
SHOW GLOBAL STATUS LIKE 'Com_commit';
SHOW GLOBAL STATUS LIKE 'Com_rollback';

-- 计算 TPS
TPS = (Com_commit + Com_rollback) / uptime

-- 锁等待
SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_waits';
SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_time';
SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_time_avg';

-- History list length
SHOW ENGINE INNODB STATUS\G
-- 查找 History list length

-- 死锁
SHOW GLOBAL STATUS LIKE 'Innodb_deadlocks';
```

### 2. 慢事务分析

**查询长事务**：
```sql
SELECT 
    trx_id,
    trx_state,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS duration_sec,
    trx_requested_lock_id,
    trx_wait_started,
    trx_weight,
    trx_rows_locked,
    trx_rows_modified,
    trx_query
FROM information_schema.innodb_trx
WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 10
ORDER BY trx_started;
```

### 3. 锁分析

**查看锁等待**：
```sql
-- MySQL 8.0+
SELECT 
    waiting_trx_id,
    waiting_pid,
    waiting_query,
    blocking_trx_id,
    blocking_pid,
    blocking_query,
    wait_age_secs
FROM sys.innodb_lock_waits;
```

---

## 性能测试

### 1. 压力测试

**使用 sysbench**：
```bash
# OLTP 读写测试
sysbench oltp_read_write \
  --mysql-host=localhost \
  --mysql-user=root \
  --mysql-password=password \
  --mysql-db=testdb \
  --tables=10 \
  --table-size=100000 \
  --threads=16 \
  --time=60 \
  --report-interval=10 \
  run

# 输出：
# - TPS
# - QPS
# - 延迟（95th、99th）
```

### 2. 并发测试

**模拟高并发场景**：
```python
import concurrent.futures
import time

def concurrent_transfer(thread_id):
    """并发转账测试"""
    for i in range(100):
        from_id = random.randint(1, 1000)
        to_id = random.randint(1, 1000)
        if from_id != to_id:
            transfer(from_id, to_id, 100)

# 100个线程并发
with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
    futures = [executor.submit(concurrent_transfer, i) for i in range(100)]
    concurrent.futures.wait(futures)

# 验证数据一致性
total_balance = db.query("SELECT SUM(balance) FROM accounts")
print(f"Total balance: {total_balance}")
# 应该与初始总额相等
```

---

## 最佳实践总结

### 1. 事务设计

```
□ 事务尽可能短
□ 只包含必须的数据库操作
□ 不在事务中执行外部调用
□ 拆分大事务
□ 声明只读事务
□ 避免跨服务事务
```

### 2. 锁优化

```
□ 降低锁粒度
□ 使用索引减少锁范围
□ 统一加锁顺序
□ 选择合适的锁模式
□ 分片热点数据
```

### 3. 参数调优

```
□ 调整 Buffer Pool 大小
□ 优化 Redo Log 配置
□ 合理设置刷盘策略
□ 增加 Purge 线程
□ 调整锁等待超时
```

### 4. 架构优化

```
□ 读写分离
□ 应用层缓存
□ 异步处理
□ 批量操作
□ 分库分表
```

### 5. 监控运维

```
□ 监控关键指标
□ 分析慢事务
□ 审查死锁日志
□ 定期压测
□ 持续优化
```

---

## 参考资料

1. **MySQL 官方文档**：
   - InnoDB Performance Tuning: https://dev.mysql.com/doc/refman/8.0/en/innodb-performance.html

2. **工具推荐**：
   - sysbench：性能测试工具
   - pt-query-digest：慢查询分析
   - Prometheus + Grafana：监控系统

3. **推荐书籍**：
   - 《高性能MySQL》
   - 《MySQL技术内幕：InnoDB存储引擎》

4. **最佳实践**：
   - 理解事务原理
   - 合理设计事务
   - 选择合适隔离级别
   - 优化锁使用
   - 调整配置参数
   - 监控和测试
   - 持续优化改进
