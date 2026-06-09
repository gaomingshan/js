# Redis 部署指南

> 版本：7.2+ | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|---------|---------|------|
| 单机 | 2 核 4G | 4 核 8G | 50G SSD |
| 主从 | 2 核 4G × 2 | 4 核 8G × 3 | 100G SSD |
| 哨兵高可用 | 2 核 4G × 3 | 4 核 8G × 3 | 100G SSD |
| Cluster 分片 | 4 核 8G × 6 | 8 核 16G × 6 | 200G SSD × 6 |

---

## 2. 裸机安装（通用）

以下安装过程在所有节点执行一次即可，后续各模式只需替换配置文件和启动命令。

```bash
# ===== 安装依赖 =====
yum install -y gcc make tcl

# ===== 下载编译 =====
wget https://download.redis.io/releases/redis-7.2.4.tar.gz
tar xzf redis-7.2.4.tar.gz && cd redis-7.2.4
make -j$(nproc) && make install

# ===== 创建目录 =====
mkdir -p /etc/redis /var/lib/redis /var/log/redis /var/run/redis
```

---

## 3. 单机部署

**适用场景**：开发测试、QPS < 1 万

### 配置文件 `/etc/redis/redis.conf`

```ini
bind 0.0.0.0
port 6379
protected-mode yes
requirepass RedisDev!Pass

maxmemory 4gb
maxmemory-policy allkeys-lru

save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

rename-command FLUSHDB ""
rename-command FLUSHALL ""
lazyfree-lazy-eviction yes

slowlog-log-slower-than 10000
slowlog-max-len 1024
maxclients 500
timeout 300
```

### 启动

```bash
redis-server /etc/redis/redis.conf
```

### 验证

```bash
redis-cli -a RedisDev!Pass ping
# PONG
```

### Docker Compose

```yaml
services:
  redis:
    image: redis:7.2
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf

volumes:
  redis-data:
```

---

## 4. 主从部署（1 Master + 2 Slave）

**适用场景**：QPS 1-5 万，读写分离

### 节点规划

| 主机名 | IP | 角色 |
|--------|-----|------|
| redis-m | 10.0.0.10 | Master |
| redis-s1 | 10.0.0.11 | Slave |
| redis-s2 | 10.0.0.12 | Slave |

### Master 配置文件 `/etc/redis/redis.conf`

```ini
bind 10.0.0.10
port 6379
protected-mode yes
requirepass RedisProd!Pass
masterauth RedisProd!Pass

maxmemory 4gb
maxmemory-policy allkeys-lru

save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

rename-command FLUSHDB ""
rename-command FLUSHALL ""
lazyfree-lazy-eviction yes

slowlog-log-slower-than 10000
slowlog-max-len 1024
maxclients 1000
timeout 300
```

### Slave 配置文件 `/etc/redis/redis.conf`

```ini
bind 10.0.0.11
port 6379
protected-mode yes
requirepass RedisProd!Pass
masterauth RedisProd!Pass

replicaof 10.0.0.10 6379
replica-read-only yes

maxmemory 4gb
maxmemory-policy allkeys-lru

save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

rename-command FLUSHDB ""
rename-command FLUSHALL ""
lazyfree-lazy-eviction yes

slowlog-log-slower-than 10000
slowlog-max-len 1024
maxclients 1000
timeout 300
```

### 启动

```bash
# 先启动 Master（10.0.0.10）
redis-server /etc/redis/redis.conf

# 再启动 Slave（10.0.0.11、10.0.0.12）
redis-server /etc/redis/redis.conf
```

### 验证

```bash
redis-cli -h 10.0.0.10 -a RedisProd!Pass info replication
# role:master, connected_slaves:2

redis-cli -h 10.0.0.10 -a RedisProd!Pass set test hello
redis-cli -h 10.0.0.11 -a RedisProd!Pass get test
# "hello"
```

### Docker Compose

```yaml
services:
  redis-m:
    image: redis:7.2
    container_name: redis-m
    restart: unless-stopped
    ports: ["6379:6379"]
    volumes:
      - m-data:/data
      - ./conf/master.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks: [redis-net]

  redis-s1:
    image: redis:7.2
    container_name: redis-s1
    restart: unless-stopped
    ports: ["6380:6379"]
    volumes:
      - s1-data:/data
      - ./conf/slave.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    depends_on: [redis-m]
    networks: [redis-net]

  redis-s2:
    image: redis:7.2
    container_name: redis-s2
    restart: unless-stopped
    ports: ["6381:6379"]
    volumes:
      - s2-data:/data
      - ./conf/slave.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    depends_on: [redis-m]
    networks: [redis-net]

volumes: { m-data:, s1-data:, s2-data: }
networks: { redis-net: { driver: bridge } }
```

---

## 5. 哨兵高可用（1 Master + 2 Slave + 3 Sentinel）

**适用场景**：生产关键缓存，自动故障转移

### 节点规划

| 主机名 | IP | Redis 角色 | Sentinel |
|--------|-----|-----------|----------|
| redis-m | 10.0.0.10 | Master | ✅ |
| redis-s1 | 10.0.0.11 | Slave | ✅ |
| redis-s2 | 10.0.0.12 | Slave | ✅ |

### Redis 配置（Master）

`/etc/redis/redis.conf`：

```ini
bind 10.0.0.10
port 6379
protected-mode yes
requirepass RedisProd!Pass
masterauth RedisProd!Pass

maxmemory 8gb
maxmemory-policy allkeys-lru

appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000

rename-command FLUSHDB ""
rename-command FLUSHALL ""
lazyfree-lazy-eviction yes

slowlog-log-slower-than 10000
slowlog-max-len 1024
maxclients 2000
timeout 300
tcp-keepalive 60
hz 10
```

### Redis 配置（Slave）

`/etc/redis/redis.conf`：

```ini
bind 10.0.0.11
port 6379
protected-mode yes
requirepass RedisProd!Pass
masterauth RedisProd!Pass

replicaof 10.0.0.10 6379
replica-read-only yes

maxmemory 8gb
maxmemory-policy allkeys-lru

appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000

rename-command FLUSHDB ""
rename-command FLUSHALL ""
lazyfree-lazy-eviction yes

slowlog-log-slower-than 10000
slowlog-max-len 1024
maxclients 2000
timeout 300
tcp-keepalive 60
hz 10
```

### Sentinel 配置

三台节点 `sentinel.conf` 相同，仅 `announce-ip` 不同：

```ini
port 26379
daemonize no
logfile /var/log/redis/sentinel.log

sentinel monitor mymaster 10.0.0.10 6379 2
sentinel auth-pass mymaster RedisProd!Pass
sentinel down-after-milliseconds mymaster 30000
sentinel failover-timeout mymaster 180000
sentinel parallel-syncs mymaster 1
sentinel announce-ip 10.0.0.10     # 每台改为自己的 IP
```

### 启动

```bash
# 三台节点均执行（先 Redis 再 Sentinel）
redis-server /etc/redis/redis.conf
redis-sentinel /etc/redis/sentinel.conf
```

### 验证

```bash
redis-cli -p 26379 sentinel master mymaster
# 显示当前 Master IP

redis-cli -p 26379 sentinel get-master-addr-by-name mymaster
# 1) "10.0.0.10"
# 2) "6379"

# 故障转移测试
redis-cli -h 10.0.0.10 -a RedisProd!Pass DEBUG SLEEP 30
sleep 35
redis-cli -p 26379 sentinel get-master-addr-by-name mymaster
# Master 已被自动切换
```

### Docker Compose

```yaml
services:
  redis-m:
    image: redis:7.2
    container_name: redis-m
    restart: unless-stopped
    ports: ["6379:6379", "26379:26379"]
    volumes:
      - m-data:/data
      - ./conf/master.conf:/usr/local/etc/redis/redis.conf
      - ./conf/sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: sh -c "redis-server /usr/local/etc/redis/redis.conf && redis-sentinel /usr/local/etc/redis/sentinel.conf"
    networks: { redis-net: { ipv4_address: 10.0.0.10 } }

  redis-s1:
    image: redis:7.2
    container_name: redis-s1
    restart: unless-stopped
    ports: ["6380:6379", "26380:26379"]
    volumes:
      - s1-data:/data
      - ./conf/slave.conf:/usr/local/etc/redis/redis.conf
      - ./conf/sentinel-s1.conf:/usr/local/etc/redis/sentinel.conf
    command: sh -c "redis-server /usr/local/etc/redis/redis.conf && redis-sentinel /usr/local/etc/redis/sentinel.conf"
    depends_on: [redis-m]
    networks: { redis-net: { ipv4_address: 10.0.0.11 } }

  redis-s2:
    image: redis:7.2
    container_name: redis-s2
    restart: unless-stopped
    ports: ["6381:6379", "26381:26379"]
    volumes:
      - s2-data:/data
      - ./conf/slave.conf:/usr/local/etc/redis/redis.conf
      - ./conf/sentinel-s2.conf:/usr/local/etc/redis/sentinel.conf
    command: sh -c "redis-server /usr/local/etc/redis/redis.conf && redis-sentinel /usr/local/etc/redis/sentinel.conf"
    depends_on: [redis-m]
    networks: { redis-net: { ipv4_address: 10.0.0.12 } }

volumes: { m-data:, s1-data:, s2-data: }
networks:
  redis-net:
    driver: bridge
    ipam:
      config: [{ subnet: 10.0.0.0/24 }]
```

---

## 6. Cluster 分片集群（3 Master + 3 Slave）

**适用场景**：数据量 > 100G、QPS > 10 万、需水平扩展

### 节点规划

| 主机名 | IP | 角色 |
|--------|-----|------|
| redis-c1 | 10.0.0.21 | Master |
| redis-c2 | 10.0.0.22 | Master |
| redis-c3 | 10.0.0.23 | Master |
| redis-c4 | 10.0.0.24 | Slave |
| redis-c5 | 10.0.0.25 | Slave |
| redis-c6 | 10.0.0.26 | Slave |

### 配置文件

所有节点 `/etc/redis/redis.conf` 相同，仅 `cluster-announce-ip` 不同：

```ini
bind 10.0.0.21
port 6379
protected-mode yes
requirepass RedisCluster!Pass
masterauth RedisCluster!Pass

maxmemory 8gb
maxmemory-policy allkeys-lru

appendonly yes
appendfsync everysec

cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
cluster-announce-ip 10.0.0.21        # 每台改为自己 IP
cluster-announce-port 6379
cluster-announce-bus-port 16379

rename-command FLUSHDB ""
rename-command FLUSHALL ""
lazyfree-lazy-eviction yes

slowlog-log-slower-than 10000
slowlog-max-len 1024
maxclients 2000
timeout 300
```

### 启动与创建集群

```bash
# 六台节点各自启动
redis-server /etc/redis/redis.conf

# 在任意一台执行创建集群
redis-cli --cluster create \
  10.0.0.21:6379 10.0.0.22:6379 10.0.0.23:6379 \
  10.0.0.24:6379 10.0.0.25:6379 10.0.0.26:6379 \
  --cluster-replicas 1 -a RedisCluster!Pass
```

### 验证

```bash
redis-cli -c -h 10.0.0.21 -a RedisCluster!Pass cluster info
# cluster_state:ok, cluster_slots_assigned:16384

redis-cli -c -h 10.0.0.21 -a RedisCluster!Pass cluster nodes
# 列出所有节点和槽分布

# 跨节点读写
redis-cli -c -h 10.0.0.21 -a RedisCluster!Pass set mykey hello
redis-cli -c -h 10.0.0.22 -a RedisCluster!Pass get mykey
# "hello"
```

### Docker Compose

```yaml
services:
  redis-c1:
    image: redis:7.2
    container_name: redis-c1
    restart: unless-stopped
    ports: ["6381:6379", "16381:16379"]
    volumes:
      - c1-data:/data
      - ./conf/cluster.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks: { cluster-net: { ipv4_address: 10.0.0.21 } }

  # ... c2~c6 类似，IP 递增 ...

volumes: { c1-data:, c2-data:, c3-data:, c4-data:, c5-data:, c6-data: }
networks:
  cluster-net:
    driver: bridge
    ipam:
      config: [{ subnet: 10.0.0.0/24 }]
```

---

## 7. 运维速查

### 常用命令

```bash
redis-cli -h <host> -p 6379 -a <password>

info server          # 服务器信息
info memory          # 内存使用
info replication     # 复制状态
info stats           # 统计信息
slowlog get 10       # 慢查询

# 热更新
config set maxmemory 8gb
config rewrite
```

### 关键告警指标

| 指标 | 阈值 |
|------|------|
| 内存使用率 `used_memory / maxmemory` | > 80% |
| 碎片率 `mem_fragmentation_ratio` | > 1.5 或 < 1.0 |
| 连接数 `connected_clients` | > 80% maxclients |
| fork 耗时 `latest_fork_usec` | > 1000000 (1s) |
| Cluster 状态 `cluster_state` | != ok |

---

## 8. 常见故障

### 内存满拒绝写入

```bash
redis-cli -a <password> info memory
config set maxmemory-policy allkeys-lru  # 改为淘汰策略
config set maxmemory 12gb                # 或增大上限
```

### 主线程阻塞

```bash
redis-cli -a <password> info stats | grep fork_usec
echo never > /sys/kernel/mm/transparent_hugepage/enabled
```

### Sentinel 误切换

```bash
# 增大判断阈值
sentinel down-after-milliseconds mymaster 30000
sentinel failover-timeout mymaster 180000
```
