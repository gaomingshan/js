# 查询缓存与结果集缓存

## 概述

查询缓存是数据库性能优化的重要手段，通过缓存查询结果避免重复计算，减少数据库负载，提升响应速度。本章介绍数据库内置缓存机制和应用层缓存策略。

**核心概念**：
- **查询缓存**：缓存 SQL 查询结果
- **缓存命中**：直接返回缓存结果
- **缓存失效**：表数据变化导致缓存失效
- **应用层缓存**：使用 Redis/Memcached
- **缓存策略**：Cache-Aside、Read-Through、Write-Through

**注意**：MySQL 8.0 已移除查询缓存功能，建议使用应用层缓存。

---

## MySQL 查询缓存（已废弃）

### 1. 查询缓存原理

**工作流程**：
```
1. 收到 SQL 查询
2. 计算查询的 hash 值
3. 检查缓存是否存在
4. 如果命中：直接返回缓存结果
5. 如果未命中：执行查询，缓存结果
```

**配置（MySQL 5.7）**：
```ini
# my.cnf
[mysqld]
# 启用查询缓存
query_cache_type = 1  # 0:关闭 1:开启 2:按需开启

# 查询缓存大小（字节）
query_cache_size = 64M

# 单个查询结果最大缓存大小
query_cache_limit = 2M

# 查询缓存最小块大小
query_cache_min_res_unit = 4K
```

### 2. 查询缓存的问题

**失效问题**：
```sql
-- 任何表的写操作都会清空该表的所有缓存
INSERT INTO users VALUES (...);
-- users 表的所有缓存失效

UPDATE users SET status = 1 WHERE id = 100;
-- users 表的所有缓存失效

-- 问题：
-- 高并发写入场景下，缓存频繁失效
-- 缓存命中率极低
-- 反而增加维护缓存的开销
```

**命中率低**：
```sql
-- 查询必须完全相同才能命中缓存
SELECT * FROM users WHERE id = 1;  -- 缓存1
SELECT * FROM users WHERE id = 2;  -- 缓存2（不同）
SELECT * FROM users WHERE id=1;    -- 缓存3（空格不同）

-- 问题：
-- SQL 文本必须完全一致
-- 大小写敏感
-- 空格敏感
-- 很难命中
```

**锁竞争**：
```
全局锁保护缓存
高并发下锁竞争严重
性能不升反降
```

### 3. MySQL 8.0 移除原因

**官方说明**：
```
1. 实际使用中命中率低
2. 维护成本高
3. 锁竞争严重
4. 应用层缓存更灵活
5. 现代硬件（SSD）性能提升
```

---

## 应用层缓存策略

### 1. Cache-Aside（旁路缓存）

**最常用的缓存模式**。

**读取流程**：
```python
def get_user(user_id):
    # 1. 先查缓存
    cache_key = f"user:{user_id}"
    user = redis.get(cache_key)
    
    if user:
        # 缓存命中
        return json.loads(user)
    
    # 2. 缓存未命中，查数据库
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    
    if user:
        # 3. 写入缓存
        redis.setex(cache_key, 3600, json.dumps(user))
    
    return user
```

**更新流程**：
```python
def update_user(user_id, data):
    # 1. 更新数据库
    db.execute("UPDATE users SET ... WHERE id = ?", user_id)
    
    # 2. 删除缓存
    cache_key = f"user:{user_id}"
    redis.delete(cache_key)
    
    # 下次读取时会重新加载到缓存
```

**优点**：
- 实现简单
- 缓存和数据库独立
- 适用于读多写少

**缺点**：
- 缓存穿透风险
- 缓存雪崩风险
- 缓存击穿风险

### 2. Read-Through（读穿透）

**缓存层自动加载数据**。

```python
# 伪代码
class CacheLayer:
    def get(self, key):
        # 先查缓存
        value = self.cache.get(key)
        if value:
            return value
        
        # 缓存未命中，从数据库加载
        value = self.database.load(key)
        
        # 写入缓存
        self.cache.set(key, value)
        
        return value

# 应用层只需调用缓存层
user = cache_layer.get(f"user:{user_id}")
```

**优点**：
- 应用层代码简化
- 缓存逻辑封装

**缺点**：
- 需要实现缓存层
- 冷启动慢

### 3. Write-Through（写穿透）

**同时写缓存和数据库**。

```python
class CacheLayer:
    def set(self, key, value):
        # 1. 写数据库
        self.database.save(key, value)
        
        # 2. 写缓存
        self.cache.set(key, value)
```

**优点**：
- 缓存和数据库一致性好

**缺点**：
- 写操作变慢
- 可能写入不需要的数据

### 4. Write-Behind（写回）

**先写缓存，异步写数据库**。

```python
class CacheLayer:
    def set(self, key, value):
        # 1. 写缓存
        self.cache.set(key, value)
        
        # 2. 异步写数据库
        self.queue.enqueue(lambda: self.database.save(key, value))
```

**优点**：
- 写操作快

**缺点**：
- 数据可能丢失
- 实现复杂

---

## 缓存问题与解决方案

### 1. 缓存穿透

**问题**：
```
查询不存在的数据
缓存和数据库都没有
每次都查数据库
```

**示例**：
```python
def get_user(user_id):
    cache_key = f"user:{user_id}"
    user = redis.get(cache_key)
    if user:
        return json.loads(user)
    
    # 查询不存在的用户
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    # user = None
    
    # 不缓存 None，下次仍然查数据库
    return user
```

**解决方案1：缓存空值**：
```python
def get_user(user_id):
    cache_key = f"user:{user_id}"
    user = redis.get(cache_key)
    
    if user is not None:
        # 空字符串表示不存在
        if user == '':
            return None
        return json.loads(user)
    
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    
    if user:
        redis.setex(cache_key, 3600, json.dumps(user))
    else:
        # 缓存空值，短时间过期
        redis.setex(cache_key, 60, '')
    
    return user
```

**解决方案2：布隆过滤器**：
```python
from pybloom_live import BloomFilter

# 初始化布隆过滤器
bloom = BloomFilter(capacity=1000000, error_rate=0.001)

# 加载所有存在的 user_id
for user_id in db.query("SELECT id FROM users"):
    bloom.add(user_id)

def get_user(user_id):
    # 先检查布隆过滤器
    if user_id not in bloom:
        # 确定不存在，直接返回
        return None
    
    # 可能存在，正常查询
    cache_key = f"user:{user_id}"
    user = redis.get(cache_key)
    if user:
        return json.loads(user)
    
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    if user:
        redis.setex(cache_key, 3600, json.dumps(user))
    
    return user
```

### 2. 缓存雪崩

**问题**：
```
大量缓存同时失效
所有请求打到数据库
数据库压力剧增，可能崩溃
```

**原因**：
```
- 缓存服务器宕机
- 大量 key 同时过期
```

**解决方案1：过期时间加随机值**：
```python
import random

def set_cache(key, value, ttl=3600):
    # 过期时间加随机偏移（±10%）
    random_ttl = ttl + random.randint(-int(ttl*0.1), int(ttl*0.1))
    redis.setex(key, random_ttl, value)
```

**解决方案2：缓存永不过期（后台更新）**：
```python
def get_user(user_id):
    cache_key = f"user:{user_id}"
    cached = redis.get(cache_key)
    
    if cached:
        data = json.loads(cached)
        
        # 检查是否快过期（最后10分钟）
        if data.get('cache_time', 0) + 3600 - time.time() < 600:
            # 异步更新缓存
            async_refresh_cache(user_id)
        
        return data['user']
    
    # 缓存未命中
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    if user:
        cache_data = {
            'user': user,
            'cache_time': time.time()
        }
        redis.set(cache_key, json.dumps(cache_data))
    
    return user
```

**解决方案3：多级缓存**：
```python
# L1: 本地缓存（进程内）
# L2: Redis 缓存
# L3: 数据库

def get_user(user_id):
    # L1: 本地缓存
    user = local_cache.get(user_id)
    if user:
        return user
    
    # L2: Redis
    cache_key = f"user:{user_id}"
    user = redis.get(cache_key)
    if user:
        user = json.loads(user)
        local_cache.set(user_id, user, ttl=60)
        return user
    
    # L3: 数据库
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    if user:
        redis.setex(cache_key, 3600, json.dumps(user))
        local_cache.set(user_id, user, ttl=60)
    
    return user
```

### 3. 缓存击穿

**问题**：
```
热点 key 过期瞬间
大量并发请求同时查数据库
数据库压力突增
```

**解决方案1：互斥锁**：
```python
import threading

locks = {}

def get_user(user_id):
    cache_key = f"user:{user_id}"
    user = redis.get(cache_key)
    if user:
        return json.loads(user)
    
    # 获取锁
    lock_key = f"lock:{user_id}"
    if lock_key not in locks:
        locks[lock_key] = threading.Lock()
    
    with locks[lock_key]:
        # 双重检查
        user = redis.get(cache_key)
        if user:
            return json.loads(user)
        
        # 查询数据库
        user = db.query("SELECT * FROM users WHERE id = ?", user_id)
        if user:
            redis.setex(cache_key, 3600, json.dumps(user))
        
        return user
```

**解决方案2：热点数据永不过期**：
```python
def get_hot_user(user_id):
    cache_key = f"hot_user:{user_id}"
    user = redis.get(cache_key)
    
    if user:
        return json.loads(user)
    
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    if user:
        # 永不过期
        redis.set(cache_key, json.dumps(user))
    
    return user

# 定期后台更新
def refresh_hot_users():
    hot_user_ids = get_hot_user_ids()
    for user_id in hot_user_ids:
        user = db.query("SELECT * FROM users WHERE id = ?", user_id)
        cache_key = f"hot_user:{user_id}"
        redis.set(cache_key, json.dumps(user))
```

### 4. 缓存一致性

**问题**：
```
更新数据库后，缓存未及时更新
读到旧数据
```

**延迟双删策略**：
```python
def update_user(user_id, data):
    cache_key = f"user:{user_id}"
    
    # 1. 删除缓存
    redis.delete(cache_key)
    
    # 2. 更新数据库
    db.execute("UPDATE users SET ... WHERE id = ?", user_id)
    
    # 3. 延迟删除（防止读操作写入旧缓存）
    time.sleep(0.5)  # 或异步延迟
    redis.delete(cache_key)
```

**订阅 binlog 更新缓存**：
```python
# 使用 Canal 等工具订阅 MySQL binlog
# 数据变更时自动更新/删除缓存

def on_binlog_event(event):
    if event.table == 'users':
        if event.type == 'UPDATE' or event.type == 'DELETE':
            user_id = event.row['id']
            cache_key = f"user:{user_id}"
            redis.delete(cache_key)
```

---

## 缓存设计最佳实践

### 1. 缓存粒度

**细粒度缓存**：
```python
# 缓存单个对象
def get_user(user_id):
    cache_key = f"user:{user_id}"
    # ...

# 优点：
# - 更新精确
# - 节省空间
# 缺点：
# - 缓存 key 多
# - 批量查询需要多次访问
```

**粗粒度缓存**：
```python
# 缓存列表
def get_user_list(city):
    cache_key = f"users:city:{city}"
    # ...

# 优点：
# - 减少缓存 key 数量
# - 批量查询快
# 缺点：
# - 单条更新需要重建整个列表
# - 占用空间大
```

**选择建议**：
- 读多写少：粗粒度
- 写多读少：细粒度
- 根据业务场景权衡

### 2. 缓存 Key 设计

**命名规范**：
```python
# 格式：业务模块:对象类型:ID[:属性]

# 好的命名
user:info:123           # 用户123的信息
user:orders:123         # 用户123的订单列表
product:detail:456      # 商品456的详情
article:view_count:789  # 文章789的浏览数

# 不好的命名
u123          # 不清晰
user_info_123 # 不符合规范
```

**Key 过期策略**：
```python
# 不同数据设置不同过期时间

# 热点数据：长时间或永不过期
redis.set('hot:user:123', data)  # 不设置过期

# 普通数据：适中过期时间
redis.setex('user:123', 3600, data)  # 1小时

# 临时数据：短时间过期
redis.setex('captcha:123', 300, code)  # 5分钟
```

### 3. 缓存预热

**启动时预加载热点数据**：
```python
def cache_warm_up():
    # 加载热门商品
    hot_products = db.query("""
        SELECT * FROM products 
        ORDER BY sales DESC 
        LIMIT 100
    """)
    
    for product in hot_products:
        cache_key = f"product:{product['id']}"
        redis.setex(cache_key, 7200, json.dumps(product))
    
    # 加载热门文章
    hot_articles = db.query("""
        SELECT * FROM articles 
        ORDER BY views DESC 
        LIMIT 100
    """)
    
    for article in hot_articles:
        cache_key = f"article:{article['id']}"
        redis.setex(cache_key, 7200, json.dumps(article))

# 应用启动时执行
cache_warm_up()
```

### 4. 缓存监控

**监控指标**：
```python
# 命中率
def calculate_hit_rate():
    hits = redis.info()['keyspace_hits']
    misses = redis.info()['keyspace_misses']
    hit_rate = hits / (hits + misses) if (hits + misses) > 0 else 0
    return hit_rate

# 内存使用
def get_memory_usage():
    info = redis.info('memory')
    return {
        'used_memory': info['used_memory'],
        'used_memory_human': info['used_memory_human'],
        'used_memory_peak': info['used_memory_peak'],
        'maxmemory': info['maxmemory']
    }

# 慢查询
def get_slow_logs():
    return redis.slowlog_get(10)
```

**告警阈值**：
```
- 命中率 < 80%
- 内存使用 > 90%
- 慢查询增多
- 连接数异常
```

---

## 计数器缓存

### 1. 简单计数器

```python
# 浏览数
def increment_view_count(article_id):
    cache_key = f"article:view_count:{article_id}"
    redis.incr(cache_key)

def get_view_count(article_id):
    cache_key = f"article:view_count:{article_id}"
    count = redis.get(cache_key)
    return int(count) if count else 0
```

### 2. 定时持久化

```python
# 定时将计数器写回数据库
def sync_counters_to_db():
    pattern = 'article:view_count:*'
    for key in redis.scan_iter(pattern):
        article_id = key.split(':')[-1]
        count = redis.get(key)
        
        db.execute("""
            UPDATE articles 
            SET view_count = view_count + ? 
            WHERE id = ?
        """, int(count), article_id)
        
        # 重置计数器
        redis.delete(key)

# 每小时执行一次
schedule.every().hour.do(sync_counters_to_db)
```

### 3. HyperLogLog 去重计数

```python
# 统计独立访客（UV）
def add_visitor(page_id, user_id):
    cache_key = f"page:uv:{page_id}"
    redis.pfadd(cache_key, user_id)

def get_uv(page_id):
    cache_key = f"page:uv:{page_id}"
    return redis.pfcount(cache_key)
```

---

## 生产环境实践

### 1. 缓存架构

```
应用服务器
    ↓
本地缓存（L1）- 进程内缓存，超快但容量小
    ↓ 未命中
Redis 集群（L2）- 分布式缓存，快速且容量大
    ↓ 未命中
MySQL 主从（L3）- 持久化存储
```

### 2. Redis 配置优化

```ini
# redis.conf

# 最大内存
maxmemory 4gb

# 淘汰策略
maxmemory-policy allkeys-lru  # LRU 淘汰

# 持久化（根据需求选择）
save ""  # 禁用 RDB
appendonly yes  # 启用 AOF
appendfsync everysec  # 每秒同步

# 慢查询
slowlog-log-slower-than 10000  # 10ms
slowlog-max-len 128
```

### 3. 缓存使用场景

**适合缓存**：
- 读多写少的数据
- 计算复杂的结果
- 热点数据
- 不经常变化的配置

**不适合缓存**：
- 强一致性要求的数据
- 频繁变化的数据
- 个性化数据（缓存命中率低）

---

## 参考资料

1. **Redis 官方文档**：
   - Redis Documentation: https://redis.io/documentation

2. **推荐书籍**：
   - 《Redis 设计与实现》
   - 《缓存技术：原理与实战》

3. **最佳实践**：
   - 合理设置过期时间
   - 监控缓存命中率
   - 防止缓存穿透/雪崩/击穿
   - 定期清理过期 key
   - 多级缓存提升性能
   - 使用连接池管理连接
