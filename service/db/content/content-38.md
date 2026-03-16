# 事务并发控制实战

## 概述

事务并发控制是数据库应用开发中最具挑战性的部分之一。本章通过实际案例，介绍常见的并发问题、解决方案和最佳实践，帮助开发者在生产环境中正确处理并发事务。

**核心内容**：
- **高并发场景**：秒杀、抢购、库存扣减
- **并发问题诊断**：识别和分析并发问题
- **解决方案**：悲观锁、乐观锁、分布式锁
- **性能优化**：减少锁竞争、提升并发度
- **监控告警**：实时监控并发指标

---

## 高并发场景案例

### 1. 秒杀系统

**场景描述**：
```
商品数量：100件
参与用户：10万人
时间：10秒内完成

挑战：
- 超高并发（QPS > 10000）
- 库存准确性
- 防止超卖
- 系统稳定性
```

**方案1：数据库悲观锁**：
```sql
-- 下单时锁定库存
BEGIN;

-- FOR UPDATE 锁定行
SELECT stock INTO @stock
FROM products
WHERE id = @product_id
FOR UPDATE;

-- 检查库存
IF @stock > 0 THEN
    -- 扣减库存
    UPDATE products
    SET stock = stock - 1
    WHERE id = @product_id;
    
    -- 创建订单
    INSERT INTO orders (user_id, product_id, quantity)
    VALUES (@user_id, @product_id, 1);
    
    COMMIT;
ELSE
    ROLLBACK;
END IF;
```

**问题**：
```
✗ 锁竞争严重
✗ 吞吐量低
✗ 数据库压力大
✗ 响应时间长
```

**方案2：Redis 预扣库存**：
```python
import redis

def seckill_order(user_id, product_id):
    """秒杀下单"""
    r = redis.Redis()
    
    # 1. Redis 原子扣减库存
    stock_key = f"seckill:stock:{product_id}"
    remaining = r.decr(stock_key)
    
    if remaining < 0:
        # 库存不足，回滚
        r.incr(stock_key)
        return False, "库存不足"
    
    # 2. 创建订单（异步）
    order_data = {
        'user_id': user_id,
        'product_id': product_id,
        'quantity': 1
    }
    
    # 发送到消息队列
    mq_client.publish('seckill_orders', json.dumps(order_data))
    
    return True, "下单成功"

# 订单处理（异步消费）
def process_seckill_order(order_data):
    """处理秒杀订单"""
    try:
        # 创建订单
        create_order(order_data)
        
        # 异步扣减数据库库存
        deduct_db_stock(order_data['product_id'], 1)
    
    except Exception as e:
        # 失败，返还 Redis 库存
        r.incr(f"seckill:stock:{order_data['product_id']}")
        logger.error(f"Order creation failed: {e}")
```

**优化**：
```
✓ Redis 内存操作，速度快
✓ 原子操作，防止超卖
✓ 异步处理，降低数据库压力
✓ 高吞吐量
```

**方案3：令牌桶限流 + 队列**：
```python
import time
from collections import deque

class TokenBucket:
    """令牌桶限流"""
    def __init__(self, rate, capacity):
        self.rate = rate  # 每秒生成令牌数
        self.capacity = capacity  # 桶容量
        self.tokens = capacity
        self.last_time = time.time()
    
    def acquire(self):
        """获取令牌"""
        now = time.time()
        # 生成新令牌
        elapsed = now - self.last_time
        new_tokens = elapsed * self.rate
        self.tokens = min(self.capacity, self.tokens + new_tokens)
        self.last_time = now
        
        # 消费令牌
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

# 全局限流器
limiter = TokenBucket(rate=1000, capacity=1000)  # 1000 QPS

def seckill_with_limiter(user_id, product_id):
    """限流 + 队列"""
    # 1. 限流
    if not limiter.acquire():
        return False, "系统繁忙，请稍后重试"
    
    # 2. 加入队列
    queue_key = f"seckill:queue:{product_id}"
    position = redis_client.rpush(queue_key, user_id)
    
    if position > 100:  # 超过库存数量
        redis_client.rpop(queue_key)
        return False, "库存不足"
    
    return True, f"排队成功，位置：{position}"

# 异步处理队列
def process_seckill_queue(product_id):
    """处理秒杀队列"""
    queue_key = f"seckill:queue:{product_id}"
    
    while True:
        user_id = redis_client.lpop(queue_key)
        if not user_id:
            break
        
        # 创建订单
        create_order(user_id, product_id, 1)
```

### 2. 库存扣减

**场景描述**：
```
电商下单，扣减库存
并发度：中等（QPS 100-1000）
要求：不能超卖
```

**方案1：悲观锁（低并发）**：
```sql
BEGIN;

-- 锁定库存
SELECT stock FROM products WHERE id = @product_id FOR UPDATE;

-- 检查并扣减
IF stock >= @quantity THEN
    UPDATE products SET stock = stock - @quantity WHERE id = @product_id;
    INSERT INTO orders (...) VALUES (...);
    COMMIT;
ELSE
    ROLLBACK;
END IF;
```

**方案2：乐观锁（高并发）**：
```python
def deduct_stock_optimistic(product_id, quantity, max_retries=3):
    """乐观锁扣库存"""
    for attempt in range(max_retries):
        # 1. 读取库存和版本号
        product = db.query("""
            SELECT stock, version FROM products WHERE id = %s
        """, product_id)
        
        if product['stock'] < quantity:
            return False, "库存不足"
        
        # 2. 更新库存（检查版本号）
        affected = db.execute("""
            UPDATE products
            SET stock = stock - %s, version = version + 1
            WHERE id = %s AND version = %s AND stock >= %s
        """, quantity, product_id, product['version'], quantity)
        
        if affected == 1:
            return True, "扣减成功"
        
        # 版本冲突，重试
        if attempt < max_retries - 1:
            time.sleep(0.01 * (attempt + 1))  # 指数退避
        else:
            return False, "并发冲突，请重试"
```

**方案3：Redis + 数据库双写**：
```python
def deduct_stock_redis(product_id, quantity):
    """Redis 预扣库存 + 异步扣减数据库"""
    # 1. Redis 原子扣减
    stock_key = f"stock:{product_id}"
    
    # Lua 脚本（原子操作）
    lua_script = """
    local stock = tonumber(redis.call('get', KEYS[1]) or 0)
    if stock >= tonumber(ARGV[1]) then
        redis.call('decrby', KEYS[1], ARGV[1])
        return 1
    else
        return 0
    end
    """
    
    result = redis_client.eval(lua_script, 1, stock_key, quantity)
    
    if result == 1:
        # 2. 异步扣减数据库库存
        async_deduct_db_stock(product_id, quantity)
        return True, "扣减成功"
    else:
        return False, "库存不足"

def async_deduct_db_stock(product_id, quantity):
    """异步扣减数据库库存"""
    # 发送到消息队列
    mq_client.publish('stock_deduct', {
        'product_id': product_id,
        'quantity': quantity,
        'timestamp': time.time()
    })

# 消费者：扣减数据库库存
def consume_stock_deduct(message):
    try:
        db.execute("""
            UPDATE products
            SET stock = stock - %s
            WHERE id = %s
        """, message['quantity'], message['product_id'])
    except Exception as e:
        # 失败，返还 Redis 库存
        redis_client.incrby(f"stock:{message['product_id']}", message['quantity'])
        logger.error(f"DB stock deduct failed: {e}")
```

### 3. 账户余额更新

**场景描述**：
```
用户充值、消费、转账
并发度：中等
要求：余额准确，不能透支
```

**方案1：数据库行锁**：
```sql
-- 转账
BEGIN;

-- 锁定转出账户
SELECT balance FROM accounts WHERE user_id = @from_user FOR UPDATE;

IF balance >= @amount THEN
    -- 扣款
    UPDATE accounts SET balance = balance - @amount WHERE user_id = @from_user;
    
    -- 加款（锁定转入账户）
    UPDATE accounts SET balance = balance + @amount WHERE user_id = @to_user;
    
    COMMIT;
ELSE
    ROLLBACK;
END IF;
```

**方案2：乐观锁 + 重试**：
```python
def transfer_optimistic(from_user, to_user, amount):
    """乐观锁转账"""
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            # 读取账户信息
            from_account = get_account(from_user)
            to_account = get_account(to_user)
            
            # 检查余额
            if from_account['balance'] < amount:
                return False, "余额不足"
            
            # 更新转出账户
            success1 = update_balance(
                from_user,
                from_account['balance'] - amount,
                from_account['version']
            )
            
            if not success1:
                # 冲突，重试
                if attempt < max_retries - 1:
                    time.sleep(0.01 * (2 ** attempt))
                    continue
                else:
                    return False, "并发冲突"
            
            # 更新转入账户
            success2 = update_balance(
                to_user,
                to_account['balance'] + amount,
                to_account['version']
            )
            
            if not success2:
                # 回滚转出账户
                rollback_balance(from_user, from_account)
                # 重试
                if attempt < max_retries - 1:
                    time.sleep(0.01 * (2 ** attempt))
                    continue
                else:
                    return False, "并发冲突"
            
            return True, "转账成功"
        
        except Exception as e:
            logger.error(f"Transfer failed: {e}")
            continue
    
    return False, "转账失败"
```

---

## 并发问题诊断

### 1. 识别死锁

**查看死锁日志**：
```sql
-- MySQL
SHOW ENGINE INNODB STATUS\G

-- 查找 LATEST DETECTED DEADLOCK 部分
-- 分析涉及的事务、等待的锁
```

**死锁案例分析**：
```
*** (1) TRANSACTION:
TRANSACTION 421, ACTIVE 10 sec starting index read
UPDATE orders SET status='shipped' WHERE id=100

*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS on `orders`, index `PRIMARY` (id=200)

*** (2) TRANSACTION:
TRANSACTION 422, ACTIVE 5 sec updating
UPDATE orders SET status='shipped' WHERE id=200

*** (2) HOLDS THE LOCK(S):
RECORD LOCKS on `orders`, index `PRIMARY` (id=200)

*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS on `orders`, index `PRIMARY` (id=100)

*** WE ROLL BACK TRANSACTION (2)

分析：
- 事务1 持有 id=100 的锁，等待 id=200
- 事务2 持有 id=200 的锁，等待 id=100
- 形成死锁
- 数据库回滚事务2

解决：
- 统一加锁顺序（按 id 升序）
```

### 2. 识别锁等待

**查看锁等待**：
```sql
-- MySQL 8.0+
SELECT 
    waiting_pid,
    waiting_query,
    blocking_pid,
    blocking_query,
    wait_age
FROM sys.innodb_lock_waits;

-- 或
SELECT * FROM performance_schema.data_lock_waits;
```

**分析锁等待**：
```sql
-- 示例输出
waiting_pid: 123
waiting_query: UPDATE products SET stock=10 WHERE id=1
blocking_pid: 456
blocking_query: UPDATE products SET stock=20 WHERE id=1
wait_age: 00:00:05

问题：
- 进程 123 等待进程 456 释放锁
- 已等待 5 秒

解决：
- 检查进程 456 的事务是否异常
- 是否是长事务
- 考虑 KILL QUERY 456
```

### 3. 识别长事务

**查询长事务**：
```sql
-- MySQL
SELECT 
    trx_id,
    trx_state,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS duration_sec,
    trx_rows_locked,
    trx_rows_modified,
    trx_query
FROM information_schema.innodb_trx
WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 60
ORDER BY trx_started;

-- duration_sec > 60：运行超过 1 分钟
-- trx_rows_locked：锁定的行数
```

**处理长事务**：
```sql
-- 杀死长事务
KILL QUERY <trx_mysql_thread_id>;

-- 或杀死连接
KILL <trx_mysql_thread_id>;
```

---

## 性能优化

### 1. 减少锁粒度

**拆分热点行**：
```sql
-- 不好：单一计数器（热点行）
UPDATE counters SET count = count + 1 WHERE id = 1;
-- 高并发下竞争严重

-- 好：分片计数器
-- 创建多个计数器
INSERT INTO counters (id, count) VALUES (1, 0), (2, 0), ..., (10, 0);

-- 随机选择一个分片
import random
shard_id = random.randint(1, 10)
UPDATE counters SET count = count + 1 WHERE id = shard_id;

-- 查询时汇总
SELECT SUM(count) FROM counters WHERE id BETWEEN 1 AND 10;
```

**分离读写**：
```sql
-- 读写分离
-- 写操作：主库
-- 读操作：从库

-- 降低主库锁竞争
```

### 2. 缩短事务时间

**优化事务范围**：
```python
# 不好：事务范围过大
def process_order(order_id):
    conn.start_transaction()
    
    # 查询订单
    order = get_order(order_id)
    
    # 外部 API 调用（耗时）
    result = call_external_api(order)
    
    # 更新订单
    update_order(order_id, result)
    
    conn.commit()
    # 事务时间长，持有锁时间长

# 好：缩小事务范围
def process_order(order_id):
    # 查询订单（无事务）
    order = get_order(order_id)
    
    # 外部 API 调用（无事务）
    result = call_external_api(order)
    
    # 只在更新时开启事务
    conn.start_transaction()
    update_order(order_id, result)
    conn.commit()
    # 事务时间短
```

### 3. 批量操作

**批量插入**：
```sql
-- 不好：逐条插入
FOR i IN 1..1000 LOOP
    INSERT INTO logs VALUES (...);
END LOOP;
-- 1000 次事务

-- 好：批量插入
INSERT INTO logs VALUES
    (...),
    (...),
    ...
    (...);
-- 1 次事务
```

**批量更新**：
```sql
-- 使用 CASE WHEN
UPDATE products
SET stock = CASE id
    WHEN 1 THEN 100
    WHEN 2 THEN 200
    WHEN 3 THEN 300
END
WHERE id IN (1, 2, 3);
```

---

## 分布式锁

### 1. Redis 分布式锁

**基础实现**：
```python
import redis
import uuid
import time

class RedisLock:
    def __init__(self, redis_client, key, timeout=10):
        self.redis = redis_client
        self.key = f"lock:{key}"
        self.timeout = timeout
        self.identifier = str(uuid.uuid4())
    
    def acquire(self):
        """获取锁"""
        end_time = time.time() + self.timeout
        
        while time.time() < end_time:
            # SET NX：只在键不存在时设置
            if self.redis.set(self.key, self.identifier, nx=True, ex=self.timeout):
                return True
            
            time.sleep(0.001)
        
        return False
    
    def release(self):
        """释放锁"""
        # Lua 脚本（原子操作）
        lua_script = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
            return redis.call('del', KEYS[1])
        else
            return 0
        end
        """
        
        self.redis.eval(lua_script, 1, self.key, self.identifier)

# 使用
lock = RedisLock(redis_client, 'product:100')
if lock.acquire():
    try:
        # 业务逻辑
        deduct_stock(100, 1)
    finally:
        lock.release()
else:
    print("获取锁失败")
```

**Redlock 算法（多节点）**：
```python
from redlock import Redlock

# 多个 Redis 节点
redis_nodes = [
    {'host': 'redis1', 'port': 6379},
    {'host': 'redis2', 'port': 6379},
    {'host': 'redis3', 'port': 6379},
]

dlm = Redlock(redis_nodes)

# 获取锁
lock = dlm.lock("resource_name", 1000)  # 1000ms 超时

if lock:
    try:
        # 业务逻辑
        pass
    finally:
        dlm.unlock(lock)
```

### 2. ZooKeeper 分布式锁

```python
from kazoo.client import KazooClient

class ZKLock:
    def __init__(self, hosts, path):
        self.zk = KazooClient(hosts=hosts)
        self.zk.start()
        self.path = path
        self.lock = self.zk.Lock(path)
    
    def acquire(self, timeout=10):
        return self.lock.acquire(timeout=timeout)
    
    def release(self):
        self.lock.release()
    
    def __enter__(self):
        self.acquire()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()

# 使用
with ZKLock('localhost:2181', '/locks/product_100'):
    # 业务逻辑
    deduct_stock(100, 1)
```

---

## 监控告警

### 1. 监控指标

**事务指标**：
```
- 事务执行时间
- 长事务数量
- 事务回滚率
- 锁等待时间
- 死锁次数
```

**监控脚本**：
```python
def monitor_transactions():
    """监控事务指标"""
    # 长事务
    long_trx = db.query("""
        SELECT COUNT(*) FROM information_schema.innodb_trx
        WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 60
    """)
    
    # 锁等待
    lock_waits = db.query("""
        SELECT COUNT(*) FROM performance_schema.data_lock_waits
    """)
    
    # History list length
    status = db.query("SHOW ENGINE INNODB STATUS")
    history_list_length = parse_history_list_length(status)
    
    # 告警
    if long_trx > 5:
        alert("Long transactions", f"Count: {long_trx}")
    
    if lock_waits > 10:
        alert("Lock waits", f"Count: {lock_waits}")
    
    if history_list_length > 10000:
        alert("High history list length", f"Value: {history_list_length}")
```

### 2. 告警规则

```
Critical（紧急）：
- 死锁频繁（> 10次/分钟）
- 大量锁等待（> 100）
- 长事务数量（> 10）

Warning（警告）：
- History list length > 10000
- 锁等待时间 > 30秒
- 事务回滚率 > 5%

Info（信息）：
- 事务平均执行时间增加
- 并发度变化
```

---

## 最佳实践总结

### 1. 设计原则

```
□ 尽量避免长事务
□ 减少事务范围
□ 统一加锁顺序
□ 合理选择隔离级别
□ 使用合适的锁策略
□ 考虑使用缓存减少数据库访问
```

### 2. 编码规范

```
□ 显式开启事务
□ 正确处理异常和回滚
□ 及时提交或回滚
□ 实现重试机制
□ 保证操作幂等性
□ 记录详细日志
```

### 3. 性能优化

```
□ 使用索引减少锁范围
□ 批量操作代替逐条操作
□ 异步处理非核心流程
□ 读写分离
□ 缓存热点数据
□ 分库分表
```

### 4. 监控运维

```
□ 监控事务指标
□ 设置合理告警
□ 定期分析慢查询
□ 审查死锁日志
□ 测试并发场景
□ 制定应急预案
```

---

## 参考资料

1. **推荐书籍**：
   - 《高性能MySQL》
   - 《数据库系统实现》
   - 《大规模分布式存储系统》

2. **工具推荐**：
   - pt-deadlock-logger（Percona Toolkit）
   - Prometheus + Grafana
   - Apache JMeter（压测）

3. **最佳实践**：
   - 充分理解并发控制机制
   - 根据场景选择合适方案
   - 测试高并发场景
   - 监控和优化
   - 持续改进
