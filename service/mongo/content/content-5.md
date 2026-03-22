# 单机安装与基础配置

## 概述

本章覆盖 MongoDB 在各主流操作系统的安装方式，重点讲解 `mongod.conf` 核心配置项、mongosh 基础操作和安全初始化。正确的安装与配置是生产环境稳定运行的基础。

---

## 版本选择

| 版本类型 | 说明 | 建议 |
|----------|------|------|
| 社区版（Community）| 免费，开源 | 开发/测试/中小规模生产 |
| 企业版（Enterprise）| 付费，增加审计、LDAP、加密等 | 大型企业生产环境 |
| Atlas（云服务）| 全托管，按用量计费 | 快速上线，无运维负担 |

**推荐版本**：生产环境优先选择最新稳定版（当前为 7.x/8.x）。

---

## Linux 安装（Ubuntu 22.04）

```bash
# 1. 导入 GPG 公钥
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# 2. 添加软件源
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
  https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. 安装
sudo apt-get update && sudo apt-get install -y mongodb-org

# 4. 启动并设置开机自启
sudo systemctl start mongod
sudo systemctl enable mongod

# 5. 验证
sudo systemctl status mongod
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

---

## macOS 安装（Homebrew）

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
mongosh
```

---

## Windows 安装

1. 下载 MSI：https://www.mongodb.com/try/download/community
2. 安装时勾选「Install MongoDB as a Service」
3. 默认配置：`C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

---

## mongod.conf 核心配置详解

```yaml
# /etc/mongod.conf

storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
    commitIntervalMs: 100
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: zstd
    indexConfig:
      prefixCompression: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1
  maxIncomingConnections: 65536

processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid

security:
  authorization: enabled

operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp

# 副本集（需要时开启）
# replication:
#   replSetName: rs0
#   oplogSizeMB: 10240
```

---

## mongosh 基础操作

```js
// 连接本地
mongosh

// 连接远程（带认证）
mongosh "mongodb://admin:password@10.0.0.1:27017/admin"

// 数据库操作
use ecommerce
show dbs
db.dropDatabase()

// 集合操作
show collections
db.createCollection("users")
db.users.drop()

// 基本 CRUD
db.users.insertOne({ name: "张三", age: 28, city: "深圳" })
db.users.find({ city: "深圳" }).pretty()
db.users.updateOne({ name: "张三" }, { $set: { age: 29 } })
db.users.deleteOne({ name: "张三" })

// 查看集合统计
db.users.stats()
db.users.countDocuments()
```

---

## 用户创建与认证初始化

```js
// 首次启动后（未开启认证前）创建管理员
use admin
db.createUser({
  user: "admin",
  pwd: "StrongPassword123!",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase",  db: "admin" },
    { role: "clusterAdmin",          db: "admin" }
  ]
})

// 重启 mongod 并开启 security.authorization: enabled
// 之后以认证方式连接
mongosh -u admin -p StrongPassword123! --authenticationDatabase admin

// 为业务数据库创建专用用户
use ecommerce
db.createUser({
  user: "app_user",
  pwd: "AppPassword456!",
  roles: [{ role: "readWrite", db: "ecommerce" }]
})
```

---

## MongoDB Compass 使用要点

- 下载地址：https://www.mongodb.com/products/compass
- 连接字符串：`mongodb://admin:password@localhost:27017`
- 核心功能：
  - Schema 可视化分析
  - 查询构建器（无需写代码）
  - 执行计划可视化（explain）
  - 实时性能监控
  - 索引管理

---

## 常见启动问题排查

### 问题1：端口被占用

```bash
# 查找占用 27017 端口的进程
lsof -i :27017
kill -9 <PID>
```

### 问题2：数据目录权限问题

```bash
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /var/log/mongodb/mongod.log
```

### 问题3：ulimit 系统限制

```bash
# 查看当前限制
ulimit -a

# /etc/security/limits.conf 添加
mongodb soft nofile 64000
mongodb hard nofile 64000
mongodb soft nproc  64000
mongodb hard nproc  64000
```

### 问题4：日志中出现 WiredTiger 错误

```bash
# 检查磁盘空间
df -h

# 检查 mongod 日志
tail -100 /var/log/mongodb/mongod.log
```

---

## 生产环境系统参数优化

```bash
# 关闭透明大页（THP）—— MongoDB 强烈建议
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/defrag

# 设置 vm.swappiness
echo "vm.swappiness=1" | sudo tee -a /etc/sysctl.conf

# 磁盘调度算法（SSD 用 noop 或 deadline）
echo noop | sudo tee /sys/block/sda/queue/scheduler
```

---

## 总结

- 生产环境必须开启 `security.authorization: enabled`
- `cacheSizeGB` 是最重要的性能配置项，建议设为 `(总内存 × 0.4 ~ 0.5)`
- 数据目录和日志目录建议分别挂载独立磁盘
- 生产环境关闭 THP，设置合适的 ulimit
- 使用 mongosh 或 Compass 验证安装是否成功

**下一步**：使用 Docker Compose 快速搭建开发测试环境。
