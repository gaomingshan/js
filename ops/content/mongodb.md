# MongoDB 部署指南

> 版本：7.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 最低 | 推荐 |
|------|------|------|
| CPU | 2 核 | 8 核+ |
| 内存 | 4G | 32G+ |
| 磁盘 | 20G | 500G+ SSD |
| 系统 | CentOS 7.9+ / Ubuntu 22.04+ | |

**关闭 THP**（生产必须）：
```bash
cat > /etc/systemd/system/disable-thp.service << 'EOF'
[Unit]
Description=Disable Transparent Huge Pages
After=network.target

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/enabled'
ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/defrag'
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
EOF
systemctl enable disable-thp && systemctl start disable-thp
```

---

## 2. 裸机安装（通用）

```bash
# CentOS
cat > /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
yum install -y mongodb-org
systemctl start mongod && systemctl enable mongod

# Ubuntu
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update && apt install -y mongodb-org
systemctl start mongod && systemctl enable mongod

# 关键路径
# /etc/mongod.conf      配置文件
# /var/lib/mongo/       数据目录
# /var/log/mongodb/     日志目录
```

---

## 3. 单机部署

### 适用场景

开发测试、小型应用（QPS < 1000）、学习环境。

### 配置

```bash
cat > /etc/mongod.conf << 'EOF'
storage:
  dbPath: /var/lib/mongo
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 0.0.0.0
security:
  authorization: enabled
EOF
```

### 启动

```bash
# 生成 keyfile（副本集认证用，单机可选）
openssl rand -base64 756 > /etc/mongodb-keyfile
chmod 400 /etc/mongodb-keyfile
chown mongod:mongod /etc/mongodb-keyfile

systemctl restart mongod
```

### 验证

```bash
mongosh --eval "db.runCommand({ping: 1})"
# 创建管理员用户
mongosh admin --eval 'db.createUser({user:"admin",pwd:"Str0ngMongo!Pass",roles:["root"]})'
```

### Docker Compose

```yaml
services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: Str0ngMongo!Pass
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## 4. 副本集与分片集群部署

### 4.1 副本集（1 Primary + 2 Secondary）

#### 适用场景

生产高可用，自动故障转移，QPS < 5000。

#### 节点规划

| 节点 | 主机名 | IP | 角色 |
|------|--------|-----|------|
| 1 | mongo-1 | 10.0.0.1 | Primary（priority: 2） |
| 2 | mongo-2 | 10.0.0.2 | Secondary（priority: 1） |
| 3 | mongo-3 | 10.0.0.3 | Secondary（priority: 1） |

#### 配置

各节点 `/etc/mongod.conf`：
```bash
cat > /etc/mongod.conf << 'EOF'
storage:
  dbPath: /var/lib/mongo
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 0.0.0.0
security:
  authorization: enabled
  keyFile: /etc/mongodb-keyfile
replication:
  replSetName: rs0
EOF
```

生成 keyfile 并分发到所有节点：
```bash
openssl rand -base64 756 > /etc/mongodb-keyfile
chmod 400 /etc/mongodb-keyfile
chown mongod:mongod /etc/mongodb-keyfile
# scp 到其他节点
```

#### 启动

```bash
systemctl restart mongod
```

**初始化副本集**（在任一节点执行）：
```bash
mongosh --host mongo-1:27017 --eval 'rs.initiate({
  _id: "rs0",
  members: [
    {_id: 0, host: "mongo-1:27017", priority: 2},
    {_id: 1, host: "mongo-2:27017", priority: 1},
    {_id: 2, host: "mongo-3:27017", priority: 1}
  ]
})'
```

#### 验证

```bash
mongosh --eval "rs.status().members.forEach(m => printjson({name: m.name, stateStr: m.stateStr}))"
# 应看到 1 PRIMARY + 2 SECONDARY
```

#### Docker Compose

```yaml
services:
  mongo-1:
    image: mongo:7.0
    container_name: mongo-1
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-1-data:/data/db
    command: mongod --replSet rs0 --keyFile /etc/keyfile
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: Str0ngMongo!Pass

  mongo-2:
    image: mongo:7.0
    container_name: mongo-2
    restart: unless-stopped
    ports:
      - "27018:27017"
    volumes:
      - mongo-2-data:/data/db
    command: mongod --replSet rs0 --keyFile /etc/keyfile

  mongo-3:
    image: mongo:7.0
    container_name: mongo-3
    restart: unless-stopped
    ports:
      - "27019:27017"
    volumes:
      - mongo-3-data:/data/db
    command: mongod --replSet rs0 --keyFile /etc/keyfile

volumes:
  mongo-1-data:
  mongo-2-data:
  mongo-3-data:
```

> **注意**：除非添加仲裁节点（Arbiter），否则所有节点都需要 `/data/db`。仲裁节点**不需要** data 目录。

### 4.2 分片集群（2 Shard + 1 Config Replica Set + 1 Mongos）

#### 适用场景

海量数据（TB 级），数据分片水平扩展，高吞吐写入。

#### 节点规划

| 组件 | 主机 | 端口 |
|------|------|------|
| **Config Server**（副本集 3 节点） | cfg-1/2/3 | 27019 |
| **Shard 1**（副本集 3 节点） | shard1-1/2/3 | 27018 |
| **Shard 2**（副本集 3 节点） | shard2-1/2/3 | 27018 |
| **Mongos**（路由） | mongos-1/2 | 27017 |

#### 配置

**Config Server** `/etc/mongod-cfg.conf`：
```bash
cat > /etc/mongod-cfg.conf << 'EOF'
storage:
  dbPath: /var/lib/mongo
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27019
  bindIp: 0.0.0.0
replication:
  replSetName: cfg-rs
sharding:
  clusterRole: configsvr
EOF
```

**Shard 节点** `/etc/mongod-shard.conf`：
```bash
cat > /etc/mongod-shard.conf << 'EOF'
storage:
  dbPath: /var/lib/mongo
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27018
  bindIp: 0.0.0.0
replication:
  replSetName: shard1-rs    # shard2 改为 shard2-rs
sharding:
  clusterRole: shardsvr
EOF
```

**Mongos** `/etc/mongos.conf`：
```bash
cat > /etc/mongos.conf << 'EOF'
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongos.log
net:
  port: 27017
  bindIp: 0.0.0.0
sharding:
  configDB: cfg-rs/cfg-1:27019,cfg-2:27019,cfg-3:27019
EOF
```

#### 启动

```bash
# 1. 启动 Config Server 副本集
systemctl start mongod@cfg
mongosh --port 27019 --eval 'rs.initiate({
  _id: "cfg-rs",
  members: [{_id:0,host:"cfg-1:27019"},{_id:1,host:"cfg-2:27019"},{_id:2,host:"cfg-3:27019"}]
})'

# 2. 启动 Shard 副本集
systemctl start mongod@shard1
mongosh --port 27018 --host shard1-1 --eval 'rs.initiate({
  _id: "shard1-rs",
  members: [{_id:0,host:"shard1-1:27018"},{_id:1,host:"shard1-2:27018"},{_id:2,host:"shard1-3:27018"}]
})'
# shard2 同理

# 3. 启动 Mongos
mongos --config /etc/mongos.conf --fork

# 4. 添加分片
mongosh --port 27017 --eval '
sh.addShard("shard1-rs/shard1-1:27018,shard1-2:27018,shard1-3:27018")
sh.addShard("shard2-rs/shard2-1:27018,shard2-2:27018,shard2-3:27018")
'
```

#### 验证

```bash
mongosh --eval "sh.status()"
# 应看到 2 个 shard 在线
```

#### Docker Compose

```yaml
services:
  cfg-1:
    image: mongo:7.0
    container_name: cfg-1
    command: mongod --configsvr --replSet cfg-rs --port 27019
    volumes:
      - cfg-1-data:/data/db

  cfg-2:
    image: mongo:7.0
    container_name: cfg-2
    command: mongod --configsvr --replSet cfg-rs --port 27019
    volumes:
      - cfg-2-data:/data/db

  cfg-3:
    image: mongo:7.0
    container_name: cfg-3
    command: mongod --configsvr --replSet cfg-rs --port 27019
    volumes:
      - cfg-3-data:/data/db

  shard1-1:
    image: mongo:7.0
    container_name: shard1-1
    command: mongod --shardsvr --replSet shard1-rs --port 27018
    volumes:
      - shard1-1-data:/data/db

  shard1-2:
    image: mongo:7.0
    container_name: shard1-2
    command: mongod --shardsvr --replSet shard1-rs --port 27018
    volumes:
      - shard1-2-data:/data/db

  shard1-3:
    image: mongo:7.0
    container_name: shard1-3
    command: mongod --shardsvr --replSet shard1-rs --port 27018
    volumes:
      - shard1-3-data:/data/db

  shard2-1:
    image: mongo:7.0
    container_name: shard2-1
    command: mongod --shardsvr --replSet shard2-rs --port 27018
    volumes:
      - shard2-1-data:/data/db

  shard2-2:
    image: mongo:7.0
    container_name: shard2-2
    command: mongod --shardsvr --replSet shard2-rs --port 27018
    volumes:
      - shard2-2-data:/data/db

  shard2-3:
    image: mongo:7.0
    container_name: shard2-3
    command: mongod --shardsvr --replSet shard2-rs --port 27018
    volumes:
      - shard2-3-data:/data/db

  mongos:
    image: mongo:7.0
    container_name: mongos
    ports:
      - "27017:27017"
    command: mongos --configdb cfg-rs/cfg-1:27019,cfg-2:27019,cfg-3:27019 --port 27017
    depends_on:
      - cfg-1
      - cfg-2
      - cfg-3
      - shard1-1
      - shard2-1

volumes:
  cfg-1-data:  cfg-2-data:  cfg-3-data:
  shard1-1-data:  shard1-2-data:  shard1-3-data:
  shard2-1-data:  shard2-2-data:  shard2-3-data:
```

---

## 5. 运维速查

```bash
# 连接
mongosh "mongodb://admin:Str0ngMongo!Pass@localhost:27017/admin"

# 副本集
rs.status()
rs.conf()
rs.stepDown()                       # Primary 主动降级

# 分片
sh.status()
sh.addShard("rs/host:port")
sh.enableSharding("mydb")
sh.shardCollection("mydb.col", {_id: "hashed"})

# 监控
db.serverStatus().opcounters        # QPS
db.serverStatus().connections        # 连接数
db.serverStatus().wiredTiger.cache   # 缓存状态
db.currentOp({"secs_running": {$gt: 5}})
db.killOp(opid)

# 慢查询
db.setProfilingLevel(1, {slowms: 100})
db.system.profile.find().sort({ts: -1}).limit(10)

# 备份
mongodump --uri="mongodb://admin:Pass@localhost:27017" --out=/backup/$(date +%Y%m%d)
mongorestore --uri="mongodb://admin:Pass@localhost:27017" /backup/20240101
```

---

## 6. 常见故障

### 故障 1：副本集无 Primary

```bash
rs.status()
# 检查多数节点是否可达
rs.reconfig(cfg, {force: true})     # 强制重配置
```

### 故障 2：连接数耗尽

```bash
db.serverStatus().connections
# current > 80% max → 增大连接池或 maxIncomingConnections
```

### 故障 3：慢查询 COLLSCAN

```bash
db.system.profile.find({planSummary: "COLLSCAN"}).sort({ts: -1}).limit(5)
# 添加索引解决：db.col.createIndex({field: 1})
```

### 故障 4：缓存压力

```bash
db.serverStatus().wiredTiger.cache
# "application threads page evicted" > 0 → 缓存不够，增大 cacheSizeGB
```
