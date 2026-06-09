# Seata 部署运维指南

> **定位**：阿里开源的分布式事务解决方案
> **适用场景**：跨服务分布式事务、TCC/Saga/AT 模式
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Seata 是阿里开源的分布式事务框架，支持 AT（自动补偿）、TCC（手动补偿）、Saga（长事务）、XA 四种事务模式，通过 TC（事务协调者）统一管理全局事务。

### 1.2 核心架构

```
TM (事务管理器) → TC (事务协调者) ← RM (资源管理器)
     |                    |                    |
  开启/提交全局事务    协调分支事务         分支事务注册/上报
```

| 模式 | 原理 | 侵入性 | 适用 |
|------|------|--------|------|
| **AT** | 自动拦截 SQL + 回滚日志 | 低（仅注解） | 大多数场景 |
| **TCC** | Try/Confirm/Cancel 三步 | 高（需写三接口） | 强一致性 |
| **Saga** | 正向+补偿 | 中 | 长事务 |
| **XA** | XA 协议 | 低 | 支持XA的数据源 |

### 1.3 适用场景

**最佳适用**：微服务分布式事务、跨库事务、订单+库存+支付一致性

**不适用**：最终一致性可接受（→ 消息事务）、单库事务（→ 数据库本地事务）

---

## 2. 部署

### 2.1 裸机部署

```bash
wget https://github.com/seata/seata/releases/download/v2.2.0/seata-server-2.2.0.tar.gz
tar xzf seata-server-2.2.0.tar.gz && cd seata

# 启动（file 模式，单机）
sh bin/seata-server.sh -p 8091 -h 0.0.0.0 -m file
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name seata \
  -p 8091:8091 \
  -p 7091:7091 \
  -v ./conf/application.yml:/seata-server/resources/application.yml \
  --restart unless-stopped \
  seataio/seata-server:2.2.0
```

### 2.3 Docker Compose 部署（TC 集群 + Nacos 注册）

```yaml
# docker-compose.yml
version: '3.8'

services:
  seata-1:
    image: seataio/seata-server:2.2.0
    container_name: seata-1
    restart: unless-stopped
    ports:
      - "8091:8091"
      - "7091:7091"
    environment:
      # 如果微服务在同一个 middleware-net，可以用别名；否则请填宿主机真实 IP
      - SEATA_IP=seata-1
    volumes:
      - ./conf/application.yml:/seata-server/resources/application.yml
    networks:
      - middleware-net

  seata-2:
    image: seataio/seata-server:2.2.0
    container_name: seata-2
    restart: unless-stopped
    ports:
      - "8092:8091"
      - "7092:7091"
    environment:
      - SEATA_IP=seata-2
    volumes:
      - ./conf/application.yml:/seata-server/resources/application.yml
    networks:
      - middleware-net

networks:
  middleware-net:
    external: true # 确保这个网络存在，且你的微服务也在这个网络里
```

> **数据库初始化**：使用 DB 模式前，需先在数据库中创建 Seata 所需的四张表：`global_table`、`branch_table`、`lock_table`、`distributed_lock`。SQL 脚本位于 Seata 官方仓库 `script/server/db/` 目录下，根据数据库类型选择对应的 SQL 文件执行。

---

## 3. 配置文件

### 3.2 开发环境配置

```yaml
# conf/application.yml — 开发环境（file 模式）
server:
  port: 7091

seata:
  config:
    type: file
  registry:
    type: file
  store:
    mode: file
  security:
    secretKey: SeataSecretKey012345678901234567890123456789012345678901234567890123456789
    tokenValidityInMilliseconds: 1800000
```

### 3.3 生产环境配置

```yaml
# conf/application.yml — 生产环境（Nacos + MySQL）

server:
  port: 7091

seata:
  # === 注册中心 ===
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: nacos:8848
      namespace: prod
      group: SEATA_GROUP
      cluster: default
  # 逻辑：TC 注册到 Nacos，微服务通过 Nacos 发现 TC

  # === 配置中心 ===
  config:
    type: nacos
    nacos:
      server-addr: nacos:8848
      namespace: prod
      group: SEATA_GROUP
  # 逻辑：事务配置存 Nacos，动态推送，无需重启 TC

  # === 存储 ===
  store:
    mode: db
    db:
      datasource: druid
      db-type: mysql
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://mysql:3306/seata?rewriteBatchedStatements=true
      user: seata
      password: SeataUser!Pass
      min-conn: 10
      max-conn: 100
      global-table: global_table
      branch-table: branch_table
      lock-table: lock_table
      distributed-lock-table: distributed_lock
      query-limit: 1000
  # 逻辑：file 模式不适合集群（数据不共享）
  # db 模式所有 TC 共享 MySQL，保证全局事务状态一致

  # === 安全 ===
  security:
    secretKey: SeataSecretKey012345678901234567890123456789012345678901234567890123456789
    tokenValidityInMilliseconds: 1800000
    ignore:
      urls: /,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.ico,/console-fe/public/**,/api/v1/auth/login
```

---

## 4. 调优

### 4.1 TC 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `store.mode` | 存储模式 | db（集群必须） | file 单机；db 集群共享；redis 高性能但需 Redis |
| `store.db.max-conn` | 数据库连接池 | 100 | 全局事务数多时需增大 |
| `store.db.min-conn` | 最小连接 | 10 | 保持最小连接避免频繁创建 |

### 4.2 事务子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| 全局事务超时 | 全局事务最大时长 | 60s | 超时自动回滚。太短 → 正常事务被误杀；太长 → 资源占用 |
| 分支事务重试 | 分支提交/回滚重试 | 3 次 | 网络抖动时重试，过多重试影响性能 |

### 4.3 容量规划

| 规模 | TC 节点 | CPU | 内存 | TPS |
|------|---------|-----|------|------|
| 小型 | 1 | 2 核 | 4G | < 500 |
| 中型 | 2 | 4 核 | 8G | 500-2000 |
| 大型 | 3+ | 8 核 | 16G | 2000+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 全局事务查询
curl http://tc:7091/api/v1/global/list?pageSize=100

# 全局事务强制回滚
curl -X DELETE http://tc:7091/api/v1/global/forceRollback/{xid}
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **活跃全局事务** | API | 异常堆积 |
| **分支事务失败** | 日志 | > 0 |
| **TC 连接数** | Prometheus | 接近上限 |

### 5.3 备份与恢复

```bash
# 备份 global_table / branch_table / lock_table
mysqldump -u seata -p seata global_table branch_table lock_table > seata_backup.sql
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：全局事务超时回滚

**排查**：检查业务处理耗时 → 增大全局事务超时 → 优化慢查询

#### 故障 2：分支事务悬挂

**排查**：检查 RM 日志 → 手动补偿 → 检查 undo_log 表

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| Seata Console | `:7091` |
| API | `/api/v1/` |
| undo_log 表 | AT 模式回滚日志 |

---

## 7. 参考资料

- [Seata Documentation](https://seata.io/docs/)
- [Seata Server Configuration](https://seata.io/docs/user/configuration/)
- [Seata AT Mode](https://seata.io/docs/dev/mode/at/)
