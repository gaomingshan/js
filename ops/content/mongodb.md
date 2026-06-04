# MongoDB 部署运维指南

> **定位**：最流行的开源文档型 NoSQL 数据库，灵活 Schema + 水平扩展
> **适用场景**：文档型数据、内容管理、IoT 时序、实时分析、灵活 Schema 需求
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

MongoDB 是开源的文档型 NoSQL 数据库，数据以 BSON（Binary JSON）格式存储，支持灵活 Schema、二级索引、聚合管道、分片集群水平扩展。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **文档模型** | BSON 格式，嵌套文档/数组，灵活 Schema |
| **丰富索引** | 单键、复合、多键（数组）、文本、地理空间、TTL、哈希 |
| **聚合管道** | 类 SQL 的多阶段数据处理 |
| **分片集群** | 基于片键的水平扩展，自动数据分布 |
| **副本集** | 自动故障转移，默认 3 节点（Primary + 2 Secondary） |
| **Change Stream** | 实时数据变更监听 |
| **事务** | 4.0+ 多文档事务，4.2+ 分布式事务 |

### 1.3 适用场景

**最佳适用**：文档型灵活 Schema、内容管理/CMS、IoT 设备数据、实时分析、原型快速迭代

**不适用**：强关系型数据（→ PostgreSQL）、金融核心交易（事务能力弱于 RDBMS）、超大规模 OLAP（→ ClickHouse）

---

## 2. 部署

### 2.1 裸机部署

**CentOS（MongoDB 7.0）**：

```bash
# 添加仓库
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

sudo yum install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod
```

**Ubuntu**：

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod
```

**关键目录**：

| 路径 | 用途 |
|------|------|
| `/etc/mongod.conf` | 主配置文件（YAML 格式） |
| `/var/lib/mongo/` | 数据目录 |
| `/var/log/mongodb/` | 日志目录 |

### 2.2 Docker 部署

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=Str0ngMongo!Pass \
  -v mongo-data:/data/db \
  -v mongo-config:/data/configdb \
  -v ./conf/mongod.conf:/etc/mongod.conf \
  --restart unless-stopped \
  mongo:7.0 --config /etc/mongod.conf
```

### 2.3 Docker Compose 部署（副本集）

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongo-1:
    image: mongo:7.0
    container_name: mongo-1
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: Str0ngMongo!Pass
    volumes:
      - mongo-1-data:/data/db
      - mongo-1-config:/data/configdb
      - ./conf/mongod-repl.conf:/etc/mongod.conf
      - ./init/rs-init.js:/docker-entrypoint-initdb.d/rs-init.js
    command: mongod --config /etc/mongod.conf
    networks:
      - mongo-net

  mongo-2:
    image: mongo:7.0
    container_name: mongo-2
    restart: unless-stopped
    ports:
      - "27018:27017"
    volumes:
      - mongo-2-data:/data/db
      - mongo-2-config:/data/configdb
      - ./conf/mongod-repl.conf:/etc/mongod.conf
    command: mongod --config /etc/mongod.conf
    networks:
      - mongo-net

  mongo-3:
    image: mongo:7.0
    container_name: mongo-3
    restart: unless-stopped
    ports:
      - "27019:27017"
    volumes:
      - mongo-3-data:/data/db
      - mongo-3-config:/data/configdb
      - ./conf/mongod-repl.conf:/etc/mongod.conf
    command: mongod --config /etc/mongod.conf
    networks:
      - mongo-net

volumes:
  mongo-1-data:
  mongo-2-data:
  mongo-3-data:
  mongo-1-config:
  mongo-2-config:
  mongo-3-config:

networks:
  mongo-net:
    driver: bridge
```

**初始化副本集** `init/rs-init.js`：

```javascript
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-1:27017", priority: 2 },
    { _id: 1, host: "mongo-2:27017", priority: 1 },
    { _id: 2, host: "mongo-3:27017", priority: 1, arbiterOnly: true }
  ]
});
```

### 2.4 生产环境部署要点

**副本集架构**：

| 角色 | 职责 | 数量 |
|------|------|------|
| **Primary** | 读写操作 | 1 |
| **Secondary** | 复制数据，可读 | 1-2 |
| **Arbiter** | 投票，不存数据 | 0-1 |

**分片集群架构**（大型部署）：

| 组件 | 职责 | 数量 |
|------|------|------|
| **mongos** | 路由查询 | ≥ 2 |
| **Config Server** | 存集群元数据 | 3（副本集） |
| **Shard** | 存数据 | ≥ 2（每个是副本集） |

**安全清单**：启用认证（`--auth`）、内部认证（keyFile）、TLS 加密、网络隔离、角色最小权限、审计日志

---

## 3. 配置文件

> **核心原则**：MongoDB 使用 YAML 格式配置文件，以下按场景提供完整可用配置。

### 3.1 配置文件加载机制

```
MongoDB 启动时读取配置：
  命令行参数 → --config /etc/mongod.conf → 默认值
配置文件为 YAML 格式，修改后需重启
```

### 3.2 开发环境配置

> **目标**：单机、宽松、快速启动

```yaml
# conf/mongod-dev.conf — MongoDB 开发环境配置
# 适用：本地开发机，2-4G 内存

storage:
  dbPath: /data/db
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 0.5          # 开发机只给 512M 缓存

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  verbosity: 1                  # 开发环境详细日志

net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: disabled       # 开发环境不启用认证

setParameter:
  enableLocalhostAuthBypass: true
```

### 3.3 测试环境配置

> **目标**：模拟生产行为，启用认证和副本集

```yaml
# conf/mongod-test.conf — MongoDB 测试环境配置
# 适用：CI/CD、QA 环境，4-8G 内存

storage:
  dbPath: /data/db
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
    collectionConfig:
      blockCompressor: snappy

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  verbosity: 0
  component:
    query:
      verbosity: 1              # 记录慢查询详情

net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled
  keyFile: /etc/mongodb/keyfile  # 副本集内部认证

replication:
  replSetName: rs0

operationProfiling:
  mode: all                      # 测试环境记录所有操作
  slowOpThresholdMs: 100
```

### 3.4 生产环境配置 — 小型（8G 内存）

> **目标**：单机或 3 节点副本集，QPS < 2000

```yaml
# conf/mongod-prod-small.conf — MongoDB 生产小型配置
# 适用：4 核 8G 内存，100G SSD

# === 存储引擎 ===
# WiredTiger 是默认引擎，核心参数是 cacheSizeGB
# 逻辑：WiredTiger 缓存 = 物理内存的 50%-60%（减去 OS 和连接开销）
#   与 MySQL InnoDB 不同，WT 缓存不含 OS 页缓存，需自己管理
storage:
  dbPath: /data/db
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4             # 8G × 50% = 4G
      journalCompressor: snappy   # 压缩 journal，减少 IO
    collectionConfig:
      blockCompressor: snappy     # 压缩数据块，节省 30%-50% 空间
    indexConfig:
      prefixCompression: true     # 索引前缀压缩，节省索引空间

# === 日志 ===
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  verbosity: 0
  component:
    query:
      verbosity: 0

# === 网络 ===
net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 500

# === 安全 ===
security:
  authorization: enabled
  keyFile: /etc/mongodb/keyfile

# === 副本集 ===
replication:
  replSetName: rs0
  enableMajorityReadConcern: true

# === 慢查询 ===
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100         # 超过 100ms 记录
  slowOpSampleRate: 1.0          # 100% 采样
```

### 3.5 生产环境配置 — 中型（32G 内存）

> **目标**：副本集 + 分片，QPS 2000-8000

```yaml
# conf/mongod-prod-medium.conf — MongoDB 生产中型配置
# 适用：8 核 32G 内存，500G SSD

storage:
  dbPath: /data/db
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 18            # 32G × 56% ≈ 18G
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  verbosity: 0

net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 2000

security:
  authorization: enabled
  keyFile: /etc/mongodb/keyfile

replication:
  replSetName: rs0
  enableMajorityReadConcern: true

# === 分片（如需）===
sharding:
  clusterRole: shardsvr          # 分片节点角色

operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 50          # 中型库阈值更严格
  slowOpSampleRate: 1.0

# === 进程 ===
processManagement:
  fork: false                    # Docker 中不 fork

setParameter:
  cursorTimeoutMillis: 600000    # 游标超时 10 分钟
  maxIndexBuildMemoryUsageMegabytes: 500  # 索引构建内存限制
```

### 3.6 生产环境配置 — 大型（64G 内存）

```yaml
# conf/mongod-prod-large.conf — MongoDB 生产大型配置
# 适用：16 核 64G 内存，1T NVMe

storage:
  dbPath: /data/db
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 38            # 64G × 60% ≈ 38G
      journalCompressor: zstd    # 更高压缩比
    collectionConfig:
      blockCompressor: zstd
    indexConfig:
      prefixCompression: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  verbosity: 0

net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 5000

security:
  authorization: enabled
  keyFile: /etc/mongodb/keyfile

replication:
  replSetName: rs0
  enableMajorityReadConcern: true

sharding:
  clusterRole: shardsvr

operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 30
  slowOpSampleRate: 0.5          # 50% 采样，减少开销

processManagement:
  fork: false

setParameter:
  cursorTimeoutMillis: 600000
  maxIndexBuildMemoryUsageMegabytes: 800
```

---

## 4. 调优

### 4.1 调优方法论

```
1. 定位瓶颈 → mongotop / mongostat / 慢查询 / WT 统计
2. 分层调优 → 缓存层 → IO 层 → 索引层 → 连接层
3. 量化验证 → 修改前后对比 QPS/延迟
4. 持续观察 → 参数变更后观察 24-48 小时
```

### 4.2 WiredTiger 缓存子系统

**核心逻辑**：WiredTiger 缓存是 MongoDB 性能的基石。缓存不够 → 频繁 evict → IO 飙升。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `cacheSizeGB` | WT 缓存大小 | 物理内存 50%-60% | **最重要的参数**。设太大 → OS OOM；设太小 → evict 压力大。注意：WT 缓存之外还需为 OS 留内存做文件缓存 |
| `blockCompressor` | 数据块压缩 | snappy/zstd | snappy 压缩快但比低；zstd 压缩比高但 CPU 开销大。CPU 充足选 zstd，IO 瓶颈选 snappy |
| `journalCompressor` | Journal 压缩 | snappy | 减少 journal IO |
| `prefixCompression` | 索引前缀压缩 | true | 节省 30%-50% 索引空间，几乎无性能损失 |

**缓存命中率诊断**：

```javascript
db.serverStatus().wiredTiger.cache
// 关键指标：
// "bytes currently in the cache" → 当前缓存使用量
// "tracked dirty bytes in the cache" → 脏数据量
// "eviction: pages evicted by application threads" → 应用线程被迫 evict（说明缓存不够）
// 目标：application thread evictions ≈ 0
```

### 4.3 IO 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `journalCommitIntervalMs` | Journal 刷盘间隔 | 100-300ms | 默认 100ms。增大可减少 IO 但崩溃丢数据窗口变大 |
| `directoryForDBfiles` | 数据文件独立目录 | 按需 | 数据和 journal 分不同磁盘，减少 IO 争用 |

### 4.4 索引子系统

**核心逻辑**：MongoDB 索引策略直接影响查询性能。缺少索引 → COLLSCAN（全集合扫描）。

**索引类型选择**：

| 类型 | 适用场景 | 示例 |
|------|----------|------|
| **单键索引** | 等值查询 | `{userId: 1}` |
| **复合索引** | 多条件查询 | `{userId: 1, createdAt: -1}` |
| **多键索引** | 数组字段查询 | `{tags: 1}` |
| **文本索引** | 全文搜索 | `{content: "text"}` |
| **TTL 索引** | 自动过期删除 | `{createdAt: 1}` + expireAfterSeconds |
| **哈希索引** | 分片片键 | `{_id: "hashed"}` |
| **地理空间** | LBS 查询 | `{location: "2dsphere"}` |

**ESR 原则**（复合索引排序规则）：
- **E**quality → 等值条件放最前
- **S**ort → 排序字段放中间
- **R**ange → 范围条件放最后

```javascript
// 查询：{userId: "u1", status: "active"} + sort: {createdAt: -1}
// 最优索引：
db.orders.createIndex({userId: 1, status: 1, createdAt: -1})
// E: userId, status → S: createdAt
```

### 4.5 连接子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `maxIncomingConnections` | 最大入站连接 | 500-5000 | 每连接约 1M 栈内存。公式：应用实例数 × 每实例池大小 + 预留 |
| `cursorTimeoutMillis` | 游标超时 | 600000（10min） | 防止游标泄漏。过长 → 资源泄漏；过短 → 长查询中断 |

### 4.6 容量规划

| 规模 | CPU | 内存 | cacheSizeGB | 磁盘 |
|------|-----|------|-------------|------|
| 小型 | 4 核 | 8G | 4G | 100G SSD |
| 中型 | 8 核 | 32G | 18G | 500G SSD |
| 大型 | 16 核 | 64G | 38G | 1T NVMe |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 连接
mongosh "mongodb://admin:Str0ngMongo!Pass@localhost:27017/admin"

# 副本集状态
rs.status()
rs.conf()

# 查看当前操作
db.currentOp()
db.currentOp({"secs_running": {$gt: 5}})  # 运行超过 5 秒的操作

# 杀掉操作
db.killOp(opid)
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **QPS** | `db.serverStatus().opcounters` | 持续 > 80% 容量 |
| **连接数** | `db.serverStatus().connections.current` | > 80% maxIncomingConnections |
| **缓存使用率** | `wiredTiger.cache "bytes currently in the cache"` | > 80% cacheSizeGB |
| **脏数据比** | `wiredTiger.cache "tracked dirty bytes"` / cacheSizeGB | > 20% |
| **复制延迟** | `rs.status().members[opt].lag` | > 10s |
| **慢查询** | `db.system.profile.find()` | 增长速率异常 |

**Prometheus 采集（mongodb_exporter）**：

```bash
docker run -d \
  --name mongodb-exporter \
  -p 9216:9216 \
  -e MONGODB_URI="mongodb://exporter:Exp0rt!Pass@mongo-host:27017/admin" \
  percona/mongodb_exporter:0.40
```

### 5.3 备份与恢复

**mongodump/mongorestore**：

```bash
# 全库备份
mongodump --uri="mongodb://admin:Str0ngMongo!Pass@localhost:27017" --out=/backup/$(date +%Y%m%d)

# 单库备份
mongodump --uri="mongodb://admin:Str0ngMongo!Pass@localhost:27017" --db=appdb --out=/backup/appdb

# 恢复
mongorestore --uri="mongodb://admin:Str0ngMongo!Pass@localhost:27017" /backup/20240101
```

**文件系统快照**（推荐生产）：

```bash
# 1. 锁定写入（Primary）
db.fsyncLock()

# 2. LVM/存储快照
lvcreate -L 10G -s -n mongo-snap /dev/vg0/mongodb

# 3. 解锁
db.fsyncUnlock()
```

**备份策略**：

| 策略 | 频率 | 保留 | 适用 |
|------|------|------|------|
| mongodump | 每日 02:00 | 7 天 | 小型库 |
| 文件系统快照 | 每日 03:00 | 7 天 | 中大型库 |
| Oplog 归档 | 持续 | 7 天 | PITR 恢复 |

### 5.4 版本升级

**滚动升级步骤**（副本集零停机）：
1. 升级 Secondary 节点（逐个）
2. `rs.stepDown()` 让 Primary 切换
3. 升级原 Primary（现为 Secondary）

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：连接数耗尽

**排查**：

```javascript
db.serverStatus().connections
// current > 80% maxIncomingConnections → 需排查

// 按来源统计
db.currentOp(true).inprog.reduce((acc, op) => {
  acc[op.client || 'local'] = (acc[op.client || 'local'] || 0) + 1;
  return acc;
}, {})
```

**解决**：检查应用连接池 → 增大 `maxIncomingConnections` → 引入连接池代理

#### 故障 2：副本集无 Primary

**排查**：

```javascript
rs.status()
// 所有成员 stateStr 不是 PRIMARY
// 原因：多数节点不可用、网络分区、优先级配置错误
```

**解决**：
1. 检查节点连通性
2. 强制重配置：`rs.reconfig(cfg, {force: true})`
3. 紧急单节点模式：`rs.reconfig({_id: "rs0", members: [{_id: 0, host: "mongo-1:27017"}]}, {force: true})`

#### 故障 3：慢查询（COLLSCAN）

**排查**：

```javascript
// 开启 profiling
db.setProfilingLevel(1, {slowms: 100})

// 查看慢查询
db.system.profile.find({ns: "appdb.orders"}).sort({ts: -1}).limit(10)

// 检查是否全表扫描
db.system.profile.find({planSummary: "COLLSCAN"}).sort({ts: -1}).limit(5)
```

**解决**：添加索引 → 使用 ESR 原则 → `explain("executionStats")` 验证

#### 故障 4：缓存压力过大

**排查**：

```javascript
db.serverStatus().wiredTiger.cache
// "application threads page evicted" > 0 → 缓存不够
// "tracked dirty bytes in the cache" > 20% cacheSizeGB → 脏数据太多
```

**解决**：增大 `cacheSizeGB` → 优化查询减少扫描 → 减小单文档大小

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `mongostat` | 实时状态监控（insert/query/update/delete/conn/net） |
| `mongotop` | 集合级读写耗时 |
| `db.explain("executionStats")` | 执行计划分析 |
| `db.serverStatus()` | 服务器完整状态 |
| `db.profile` | 慢查询分析 |
| `$indexStats` | 索引使用统计 |

### 6.3 应急处理

```javascript
// 只读模式（设置 Secondary 只读标签）
// 在连接字符串中加 readPreference=secondary

// 禁用写入（紧急）
db.adminCommand({setParameter: 1, failpoint: "disableWriteOperations", mode: "alwaysOn"})
// 恢复
db.adminCommand({setParameter: 1, failpoint: "disableWriteOperations", mode: "off"})
```

---

## 7. 参考资料

- [MongoDB 7.0 Manual](https://www.mongodb.com/docs/v7.0/)
- [MongoDB Performance Best Practices](https://www.mongodb.com/docs/v7.0/administration/analyzing-mongodb-performance/)
- [WiredTiger Storage Engine](https://www.mongodb.com/docs/v7.0/core/wiredtiger/)
- [mongodb_exporter](https://github.com/percona/mongodb_exporter)
