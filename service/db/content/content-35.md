# 乐观锁与悲观锁

## 概述

乐观锁和悲观锁是两种不同的并发控制策略。悲观锁假设冲突会频繁发生，主动加锁防止冲突；乐观锁假设冲突很少发生，不加锁，只在提交时检查冲突。选择合适的锁策略对系统性能有重要影响。

**核心区别**：
- **悲观锁**：先加锁再操作，防止冲突
- **乐观锁**：先操作再检查，发现冲突时重试

**适用场景**：
- **悲观锁**：写多读少，冲突频繁
- **乐观锁**：读多写少，冲突很少

---

## 悲观锁（Pessimistic Locking）

### 1. 基本原理

**定义**：
```
假设并发冲突一定会发生
在读取数据时就加锁
阻止其他事务修改
直到当前事务完成
```

**实现方式**：
```
数据库锁机制：
- SELECT ... FOR UPDATE
- SELECT ... LOCK IN SHARE MODE
- 表锁、行锁
```

### 2. MySQL 悲观锁

**排他锁（写锁）**：
```sql
-- 读取时加排他锁
BEGIN;

SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- 其他事务无法读取（FOR UPDATE）或修改此行

-- 检查余额
IF balance >= 100 THEN
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
END IF;

COMMIT;
-- 释放锁
```

**共享锁（读锁）**：
```sql
-- 读取时加共享锁
BEGIN;

SELECT * FROM products WHERE id = 1 FOR SHARE;
-- 其他事务可以读取（FOR SHARE）
-- 但无法修改（UPDATE 会阻塞）

-- 基于读取的数据进行计算
-- ...

COMMIT;
```

**实际案例：库存扣减**：
```sql
-- 电商下单扣库存
BEGIN;

-- 加锁读取库存
SELECT stock INTO @stock
FROM products
WHERE id = 100
FOR UPDATE;

-- 检查库存
IF @stock >= 5 THEN
    -- 扣减库存
    UPDATE products
    SET stock = stock - 5
    WHERE id = 100;
    
    -- 创建订单
    INSERT INTO orders (product_id, quantity) VALUES (100, 5);
    
    COMMIT;
ELSE
    -- 库存不足
    ROLLBACK;
END IF;
```

### 3. PostgreSQL 悲观锁

**FOR UPDATE**：
```sql
BEGIN;

SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- 排他锁

-- 更新数据
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

COMMIT;
```

**FOR SHARE**：
```sql
BEGIN;

SELECT * FROM accounts WHERE id = 1 FOR SHARE;
-- 共享锁，允许其他事务 FOR SHARE，阻止 FOR UPDATE

COMMIT;
```

**FOR NO KEY UPDATE / FOR KEY SHARE**：
```sql
-- FOR NO KEY UPDATE：允许其他事务 FOR KEY SHARE
BEGIN;
SELECT * FROM users WHERE id = 1 FOR NO KEY UPDATE;
-- 允许其他事务引用此行（外键）
COMMIT;

-- FOR KEY SHARE：允许其他事务 UPDATE（不包括键列）
BEGIN;
SELECT * FROM users WHERE id = 1 FOR KEY SHARE;
-- 允许更新非键列
COMMIT;
```

**SKIP LOCKED**：
```sql
-- 跳过已锁定的行（队列处理）
SELECT * FROM tasks
WHERE status = 'pending'
ORDER BY created_at
LIMIT 10
FOR UPDATE SKIP LOCKED;

-- 多个工作进程并发处理，不会互相阻塞
```

### 4. Oracle 悲观锁

```sql
-- FOR UPDATE
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;

-- FOR UPDATE NOWAIT：不等待，立即返回错误
SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;

-- FOR UPDATE WAIT n：等待 n 秒
SELECT * FROM accounts WHERE id = 1 FOR UPDATE WAIT 5;
```

### 5. 悲观锁的优缺点

**优点**：
```
✓ 防止冲突，数据安全
✓ 适合高冲突场景
✓ 实现简单
✓ 不需要重试逻辑
```

**缺点**：
```
✗ 性能开销大（加锁、解锁）
✗ 可能死锁
✗ 降低并发度
✗ 长事务持有锁，阻塞其他事务
```

---

## 乐观锁（Optimistic Locking）

### 1. 基本原理

**定义**：
```
假设并发冲突很少发生
读取数据时不加锁
提交更新时检查数据是否被修改
如果被修改，则更新失败，重试
```

**实现方式**：
```
1. 版本号（Version）
2. 时间戳（Timestamp）
3. CAS（Compare And Swap）
```

### 2. 版本号方式

**表结构**：
```sql
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY,
    balance DECIMAL(10,2) NOT NULL,
    version INT NOT NULL DEFAULT 0  -- 版本号
);
```

**实现**：
```sql
-- 1. 读取数据和版本号
SELECT id, balance, version FROM accounts WHERE id = 1;
-- id=1, balance=1000, version=5

-- 2. 应用层处理（计算新余额）
-- new_balance = 1000 - 100 = 900

-- 3. 更新时检查版本号
UPDATE accounts
SET balance = 900, version = 6
WHERE id = 1 AND version = 5;

-- 4. 检查更新结果
IF ROW_COUNT() = 0 THEN
    -- 版本号不匹配，数据已被其他事务修改
    -- 重试或返回错误
ELSE
    -- 更新成功
END IF;
```

**完整示例**：
```python
import mysql.connector

def withdraw_optimistic(user_id, amount, max_retries=3):
    """乐观锁扣款"""
    conn = mysql.connector.connect(...)
    cursor = conn.cursor()
    
    for attempt in range(max_retries):
        # 1. 读取当前余额和版本号
        cursor.execute("""
            SELECT balance, version FROM accounts WHERE id = %s
        """, (user_id,))
        row = cursor.fetchone()
        if not row:
            return False, "账户不存在"
        
        balance, version = row
        
        # 2. 检查余额
        if balance < amount:
            return False, "余额不足"
        
        # 3. 计算新余额
        new_balance = balance - amount
        
        # 4. 更新（检查版本号）
        cursor.execute("""
            UPDATE accounts
            SET balance = %s, version = %s
            WHERE id = %s AND version = %s
        """, (new_balance, version + 1, user_id, version))
        
        # 5. 检查是否更新成功
        if cursor.rowcount == 1:
            conn.commit()
            return True, "扣款成功"
        else:
            # 版本冲突，重试
            if attempt < max_retries - 1:
                time.sleep(0.01 * (attempt + 1))  # 指数退避
                continue
            else:
                return False, "并发冲突，请重试"
    
    cursor.close()
    conn.close()
```

### 3. 时间戳方式

**表结构**：
```sql
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY,
    balance DECIMAL(10,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**实现**：
```sql
-- 1. 读取数据和时间戳
SELECT id, balance, updated_at FROM accounts WHERE id = 1;
-- updated_at = '2024-03-16 10:00:00'

-- 2. 更新时检查时间戳
UPDATE accounts
SET balance = 900
WHERE id = 1 AND updated_at = '2024-03-16 10:00:00';

-- 3. 检查更新结果
IF ROW_COUNT() = 0 THEN
    -- 时间戳不匹配，数据已被修改
    -- 重试
ELSE
    -- 更新成功
END IF;
```

**问题**：
```
时间戳精度问题：
- 如果两个事务在同一微秒内修改，可能冲突检测失败
- 版本号更可靠

时区问题：
- 不同服务器时区可能不同
```

### 4. CAS 方式

**原子操作**：
```sql
-- Compare And Swap
-- 直接在 UPDATE 中检查旧值

UPDATE accounts
SET balance = balance - 100
WHERE id = 1 AND balance >= 100;

IF ROW_COUNT() = 0 THEN
    -- 余额不足或数据已被修改
    -- 重试
ELSE
    -- 更新成功
END IF;
```

**Redis CAS**：
```python
import redis

def withdraw_redis_cas(user_id, amount):
    """Redis 乐观锁"""
    r = redis.Redis()
    key = f"balance:{user_id}"
    
    # WATCH 监控键
    with r.pipeline() as pipe:
        while True:
            try:
                pipe.watch(key)
                
                # 读取余额
                balance = float(pipe.get(key) or 0)
                
                # 检查余额
                if balance < amount:
                    pipe.unwatch()
                    return False, "余额不足"
                
                # 计算新余额
                new_balance = balance - amount
                
                # 开始事务
                pipe.multi()
                pipe.set(key, new_balance)
                
                # 执行（如果 key 被修改，会抛出 WatchError）
                pipe.execute()
                return True, "扣款成功"
            
            except redis.WatchError:
                # 冲突，重试
                continue
```

### 5. 乐观锁的优缺点

**优点**：
```
✓ 无锁，并发度高
✓ 不会死锁
✓ 适合低冲突场景
✓ 性能好
```

**缺点**：
```
✗ 冲突时需要重试
✗ 重试逻辑复杂
✗ 高冲突场景性能差
✗ 可能饥饿（一直重试失败）
```

---

## 乐观锁 vs 悲观锁

### 1. 对比

| 特性 | 悲观锁 | 乐观锁 |
|------|--------|--------|
| 加锁时机 | 读取时 | 提交时（检查） |
| 冲突处理 | 阻塞等待 | 重试 |
| 并发度 | 低 | 高 |
| 死锁风险 | 有 | 无 |
| 实现复杂度 | 简单 | 复杂（重试逻辑） |
| 适用场景 | 写多读少 | 读多写少 |
| 数据库支持 | 原生 | 应用层 |

### 2. 选择策略

**使用悲观锁**：
```
场景：
- 写操作频繁
- 冲突概率高（>10%）
- 必须保证操作成功
- 不能容忍重试

示例：
- 热门商品秒杀（高并发抢购）
- 银行转账（必须成功）
- 核心库存扣减
```

**使用乐观锁**：
```
场景：
- 读操作频繁
- 冲突概率低（<5%）
- 可以接受重试
- 追求高并发

示例：
- 普通商品库存
- 用户资料更新
- 文章点赞数
- 统计计数器
```

**混合使用**：
```sql
-- 先乐观锁，冲突多时降级为悲观锁

-- 尝试乐观锁
UPDATE accounts
SET balance = balance - 100, version = version + 1
WHERE id = 1 AND version = 5 AND balance >= 100;

IF ROW_COUNT() = 0 THEN
    -- 乐观锁失败，使用悲观锁
    BEGIN;
    SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
    UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;
    COMMIT;
END IF;
```

---

## 实战案例

### 1. 电商库存扣减

**场景**：
```
- 日常：并发度中等，使用乐观锁
- 秒杀：并发度极高，使用悲观锁
```

**乐观锁实现**：
```sql
-- 下单扣库存
UPDATE products
SET stock = stock - @quantity,
    version = version + 1
WHERE id = @product_id
    AND version = @current_version
    AND stock >= @quantity;

IF ROW_COUNT() = 0 THEN
    -- 库存不足或版本冲突
    -- 重新查询库存
    SELECT stock, version FROM products WHERE id = @product_id;
    -- 重试（最多3次）
END IF;
```

**悲观锁实现（秒杀）**：
```sql
BEGIN;

-- 锁定商品
SELECT stock FROM products WHERE id = @product_id FOR UPDATE;

-- 检查库存
IF stock >= @quantity THEN
    -- 扣减库存
    UPDATE products
    SET stock = stock - @quantity
    WHERE id = @product_id;
    
    -- 创建订单
    INSERT INTO orders (...) VALUES (...);
    
    COMMIT;
ELSE
    ROLLBACK;
END IF;
```

**Redis 预扣库存**：
```python
import redis

def pre_deduct_stock(product_id, quantity):
    """Redis 预扣库存（乐观锁）"""
    r = redis.Redis()
    key = f"stock:{product_id}"
    
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
    
    result = r.eval(lua_script, 1, key, quantity)
    
    if result == 1:
        # 扣减成功，创建订单
        create_order(product_id, quantity)
        # 异步扣减数据库库存
        async_deduct_db_stock(product_id, quantity)
        return True
    else:
        return False  # 库存不足
```

### 2. 账户余额更新

**场景**：
```
- 查询频繁，更新较少
- 使用乐观锁
```

**实现**：
```python
def transfer_money_optimistic(from_id, to_id, amount):
    """转账（乐观锁）"""
    max_retries = 3
    
    for attempt in range(max_retries):
        # 读取账户信息
        from_account = get_account(from_id)
        to_account = get_account(to_id)
        
        # 检查余额
        if from_account['balance'] < amount:
            return False, "余额不足"
        
        # 更新转出账户
        success1 = update_balance(
            from_id,
            from_account['balance'] - amount,
            from_account['version']
        )
        
        if not success1:
            # 版本冲突，重试
            if attempt < max_retries - 1:
                time.sleep(0.01 * (attempt + 1))
                continue
            else:
                return False, "并发冲突"
        
        # 更新转入账户
        success2 = update_balance(
            to_id,
            to_account['balance'] + amount,
            to_account['version']
        )
        
        if not success2:
            # 回滚转出账户
            update_balance(
                from_id,
                from_account['balance'],
                from_account['version'] + 1
            )
            # 重试
            if attempt < max_retries - 1:
                time.sleep(0.01 * (attempt + 1))
                continue
            else:
                return False, "并发冲突"
        
        return True, "转账成功"
    
    return False, "转账失败"

def update_balance(account_id, new_balance, expected_version):
    """更新余额（检查版本号）"""
    cursor.execute("""
        UPDATE accounts
        SET balance = %s, version = %s
        WHERE id = %s AND version = %s
    """, (new_balance, expected_version + 1, account_id, expected_version))
    
    return cursor.rowcount == 1
```

### 3. 分布式锁

**Redis 分布式锁（悲观锁思想）**：
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
            
            time.sleep(0.001)  # 1ms 后重试
        
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
```

---

## 性能优化

### 1. 减少冲突

**分片减少竞争**：
```python
# 不好：单一计数器
UPDATE counters SET count = count + 1 WHERE id = 1;
# 高并发下冲突严重

# 好：分片计数器
import random

shard_id = random.randint(1, 10)
UPDATE counters SET count = count + 1 WHERE id = shard_id;

# 查询时汇总
SELECT SUM(count) FROM counters WHERE id BETWEEN 1 AND 10;
```

**降低锁粒度**：
```sql
-- 不好：锁整行
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 好：只锁需要的字段（如果可能）
-- 或使用细粒度的业务ID
```

### 2. 优化重试策略

**指数退避**：
```python
def retry_with_backoff(func, max_retries=3):
    """指数退避重试"""
    for attempt in range(max_retries):
        try:
            return func()
        except ConflictError:
            if attempt < max_retries - 1:
                # 指数退避：10ms, 20ms, 40ms
                time.sleep(0.01 * (2 ** attempt))
                continue
            else:
                raise
```

**随机抖动**：
```python
import random

# 避免惊群效应
wait_time = 0.01 * (2 ** attempt) + random.uniform(0, 0.01)
time.sleep(wait_time)
```

### 3. 监控冲突率

```python
# 记录冲突率
conflict_count = 0
total_count = 0

def update_with_monitoring():
    global conflict_count, total_count
    
    total_count += 1
    
    for attempt in range(max_retries):
        try:
            # 尝试更新
            if update_optimistic():
                if attempt > 0:
                    conflict_count += 1
                return True
        except:
            continue
    
    return False

# 定期报告
conflict_rate = conflict_count / total_count
if conflict_rate > 0.1:  # 冲突率 > 10%
    print("WARNING: High conflict rate, consider using pessimistic lock")
```

---

## 最佳实践

### 1. 锁策略选择

```
评估指标：
□ 并发读写比例
□ 冲突概率
□ 重试成本
□ 业务重要性

选择建议：
□ 冲突率 < 5%：乐观锁
□ 冲突率 5%-10%：混合策略
□ 冲突率 > 10%：悲观锁
□ 核心业务：悲观锁
```

### 2. 实现规范

```
乐观锁：
□ 使用版本号而非时间戳
□ 实现重试逻辑
□ 设置最大重试次数
□ 指数退避
□ 监控冲突率

悲观锁：
□ 减少锁持有时间
□ 避免长事务
□ 统一加锁顺序
□ 监控锁等待
□ 处理死锁
```

### 3. 性能优化

```
□ 选择合适的锁粒度
□ 使用索引减少锁范围
□ 分片减少竞争
□ 缓存减少数据库访问
□ 异步处理非核心操作
□ 监控和调优
```

---

## 参考资料

1. **理论基础**：
   - "Optimistic vs. Pessimistic Locking" (Martin Fowler)

2. **数据库文档**：
   - MySQL Locking Reads: https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html
   - PostgreSQL Locking: https://www.postgresql.org/docs/current/explicit-locking.html

3. **推荐书籍**：
   - 《高性能MySQL》
   - 《数据库系统实现》

4. **最佳实践**：
   - 根据冲突率选择锁策略
   - 乐观锁实现重试逻辑
   - 悲观锁减少锁时间
   - 监控锁性能
   - 测试并发场景
   - 优化热点数据访问
