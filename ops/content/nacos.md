# Nacos 部署运维指南

> **定位**：阿里开源的服务发现与配置管理平台，微服务治理核心
> **适用场景**：服务注册发现、动态配置、服务网格、DNS 服务
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Nacos（Naming and Configuration Service）是阿里开源的微服务治理平台，集服务注册发现、动态配置管理、服务元数据管理于一体，支持 AP/CP 切换。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **服务注册发现** | AP（临时实例）/ CP（永久实例）模式切换 |
| **动态配置** | 实时推送配置变更，支持灰度发布 |
| **命名空间** | 多环境/多租户隔离 |
| **分组** | 同命名空间内逻辑分组 |
| **权限控制** | 1.2+ 支持 ACL |
| **集群** | Raft 选举 + 数据同步 |

### 1.3 适用场景

**最佳适用**：Spring Cloud / Dubbo 服务注册发现、动态配置中心、微服务治理

**不适用**：非 Java 生态（→ Consul）、纯 KV 存储（→ etcd）、服务网格（→ Istio + etcd）

---

## 2. 部署

### 2.1 裸机部署

```bash
# 下载
wget https://github.com/alibaba/nacos/releases/download/2.4.0/nacos-server-2.4.0.tar.gz
tar xzf nacos-server-2.4.0.tar.gz && cd nacos

# 单机模式（内嵌 Derby）
sh bin/startup.sh -m standalone

# 集群模式（需 MySQL）
# 1. 初始化数据库
mysql -u root -p < conf/mysql-schema.sql

# 2. 配置 conf/application.properties
# 3. 配置 conf/cluster.conf
# 4. 启动
sh bin/startup.sh
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name nacos \
  -p 8848:8848 \
  -p 9848:9848 \
  -e MODE=standalone \
  -e NACOS_AUTH_ENABLE=true \
  -e NACOS_AUTH_TOKEN=SecretKey012345678901234567890123456789012345678901234567890123456789 \
  -e NACOS_AUTH_IDENTITY_KEY=serverIdentity \
  -e NACOS_AUTH_IDENTITY_VALUE=security \
  -v nacos-logs:/home/nacos/logs \
  --restart unless-stopped \
  nacos/nacos-server:v2.4.0
```

### 2.3 Docker Compose 部署（集群 + MySQL）

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: nacos-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: NacosMySQL!Pass
      MYSQL_DATABASE: nacos
      MYSQL_USER: nacos
      MYSQL_PASSWORD: NacosUser!Pass
    volumes:
      - mysql-data:/var/lib/mysql
      - ./sql/mysql-schema.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - nacos-net

  nacos-1:
    image: nacos/nacos-server:v2.4.0
    container_name: nacos-1
    hostname: nacos-1
    restart: unless-stopped
    ports:
      - "8848:8848"
      - "9848:9848"
    environment:
      MODE: cluster
      NACOS_SERVERS: "nacos-1:8848 nacos-2:8848 nacos-3:8848"
      SPRING_DATASOURCE_PLATFORM: mysql
      MYSQL_SERVICE_HOST: mysql
      MYSQL_SERVICE_PORT: 3306
      MYSQL_SERVICE_DB_NAME: nacos
      MYSQL_SERVICE_USER: nacos
      MYSQL_SERVICE_PASSWORD: NacosUser!Pass
      NACOS_AUTH_ENABLE: "true"
      NACOS_AUTH_TOKEN: "SecretKey012345678901234567890123456789012345678901234567890123456789"
      JVM_XMS: 512m
      JVM_XMX: 512m
    depends_on:
      - mysql
    networks:
      - nacos-net

  nacos-2:
    image: nacos/nacos-server:v2.4.0
    container_name: nacos-2
    hostname: nacos-2
    restart: unless-stopped
    environment:
      MODE: cluster
      NACOS_SERVERS: "nacos-1:8848 nacos-2:8848 nacos-3:8848"
      SPRING_DATASOURCE_PLATFORM: mysql
      MYSQL_SERVICE_HOST: mysql
      MYSQL_SERVICE_PORT: 3306
      MYSQL_SERVICE_DB_NAME: nacos
      MYSQL_SERVICE_USER: nacos
      MYSQL_SERVICE_PASSWORD: NacosUser!Pass
      NACOS_AUTH_ENABLE: "true"
      NACOS_AUTH_TOKEN: "SecretKey012345678901234567890123456789012345678901234567890123456789"
      JVM_XMS: 512m
      JVM_XMX: 512m
    depends_on:
      - mysql
    networks:
      - nacos-net

  nacos-3:
    image: nacos/nacos-server:v2.4.0
    container_name: nacos-3
    hostname: nacos-3
    restart: unless-stopped
    environment:
      MODE: cluster
      NACOS_SERVERS: "nacos-1:8848 nacos-2:8848 nacos-3:8848"
      SPRING_DATASOURCE_PLATFORM: mysql
      MYSQL_SERVICE_HOST: mysql
      MYSQL_SERVICE_PORT: 3306
      MYSQL_SERVICE_DB_NAME: nacos
      MYSQL_SERVICE_USER: nacos
      MYSQL_SERVICE_PASSWORD: NacosUser!Pass
      NACOS_AUTH_ENABLE: "true"
      NACOS_AUTH_TOKEN: "SecretKey012345678901234567890123456789012345678901234567890123456789"
      JVM_XMS: 512m
      JVM_XMX: 512m
    depends_on:
      - mysql
    networks:
      - nacos-net

volumes:
  mysql-data:

networks:
  nacos-net:
    driver: bridge
```

### 2.4 生产环境部署要点

**集群要求**：≥ 3 节点（Raft 选举多数派）、MySQL 持久化（必须）、Nginx/LB 前置

**安全清单**：开启 `nacos.core.auth.enabled=true`、自定义 `token.secret.key`（≥ 32 字符）、配置权限控制

---

## 3. 配置文件

### 3.2 开发环境配置

```properties
# application.properties — 开发环境（standalone + 内嵌 Derby）
nacos.standalone=true
nacos.core.auth.enabled=false
server.port=8848
```

### 3.3 生产环境配置

```properties
# application.properties — 生产环境

# === 基础 ===
server.port=8848
nacos.standalone=false

# === 数据源（生产必须 MySQL）===
# 逻辑：Nacos 数据分两类：
#   配置数据 → MySQL（持久化，集群共享）
#   服务实例数据 → 内存 + 磁盘（临时实例在内存，永久实例在磁盘）
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://mysql:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useSSL=false
db.user=nacos
db.password=NacosUser!Pass
db.pool.config.connectionTimeout=30000
db.pool.config.validationTimeout=10000

# === 认证 ===
nacos.core.auth.enabled=true
nacos.core.auth.plugin.nacos.token.secret.key=SecretKey012345678901234567890123456789012345678901234567890123456789
nacos.core.auth.enable.userAgentAuth=true
nacos.core.auth.server.identity.key=serverIdentity
nacos.core.auth.server.identity.value=security

# === 集群 ===
# cluster.conf 文件内容：
# 10.0.0.1:8848
# 10.0.0.2:8848
# 10.0.0.3:8848

# === JVM（通过启动脚本）===
# JAVA_OPT="${JAVA_OPT} -Xms1g -Xmx1g -Xmn512m"

# === 网络 ===
nacos.core.auth.caching.enabled=true
nacos.core.auth.enable.userAgentAuth=true

# === 命名空间 ===
# 建议创建：dev / test / prod 命名空间隔离配置
# nacos.console.naming.data.capacity=50000

# === 日志 ===
logging.level.com.alibaba.nacos=warn
```

---

## 4. 调优

### 4.1 JVM 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `-Xms` / `-Xmx` | 堆大小 | 1G-4G | Nacos 是 Spring Boot 应用，堆不需太大。服务实例多时可增大 |
| `-Xmn` | 新生代 | 堆的 50% | 临时实例频繁注册/注销产生短生命周期对象，新生代需大 |

### 4.2 服务发现子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| 临时实例心跳间隔 | 客户端心跳 | 5s（默认） | 心跳间隔越长，故障检测越慢；越短，网络开销越大 |
| 永久实例 vs 临时实例 | 注册模式 | 临时（默认） | 临时实例：客户端心跳保活（AP）；永久实例：服务端探测（CP） |
| 命名空间隔离 | 环境隔离 | dev/test/prod | 不同环境用不同命名空间，避免误操作 |

### 4.3 配置管理子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| 配置格式 | 配置文件类型 | YAML | 支持 YAML/Properties/JSON/XML/Text |
| 灰度发布 | 配置变更策略 | Beta → 全量 | 先在部分实例验证，再全量发布 |
| 配置历史保留 | 历史版本数 | 30 天 | 支持回滚到任意历史版本 |

### 4.4 容量规划

| 规模 | 节点 | CPU | 内存 | 实例数 | 配置数 |
|------|------|-----|------|--------|--------|
| 小型 | 1（standalone） | 2 核 | 4G | < 500 | < 1000 |
| 中型 | 3 | 4 核 | 8G | 500-5000 | 1000-5000 |
| 大型 | 3+ | 8 核 | 16G | 5000+ | 5000+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 服务列表
curl -s "http://nacos:8848/nacos/v1/ns/service/list?pageNo=1&pageSize=100" | jq

# 实例列表
curl -s "http://nacos:8848/nacos/v1/ns/instance/list?serviceName=order-service" | jq

# 配置管理
curl -s "http://nacos:8848/nacos/v1/cs/configs?dataId=application.yml&group=DEFAULT_GROUP&tenant=prod" | jq

# 发布配置
curl -X POST "http://nacos:8848/nacos/v1/cs/configs" \
  -d "dataId=application.yml&group=DEFAULT_GROUP&tenant=prod&content=..."

# 集群状态
curl -s "http://nacos:8848/nacos/v1/ns/operator/leader"
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **服务实例数** | API | 异常减少 |
| **配置变更** | 审计日志 | 异常变更 |
| **Leader 状态** | API | 无 Leader |
| **JVM 内存** | Prometheus | > 80% |

### 5.3 备份与恢复

```bash
# 导出配置
curl "http://nacos:8848/nacos/v1/cs/configs?export=true&tenant=prod&groupName=DEFAULT_GROUP" -o config-export.zip

# 导入配置
curl -X POST "http://nacos:8848/nacos/v1/cs/configs?import=true&tenant=prod" \
  -F "file=@config-export.zip"
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：服务注册不上

**排查链路**：检查网络连通 → 检查命名空间 → 检查认证配置 → 查看 Nacos 日志

#### 故障 2：配置不生效

**排查**：检查 dataId/group/tenant 是否匹配 → 检查客户端日志 → 检查灰度发布状态

#### 故障 3：集群 Leader 选举失败

**排查**：`cluster.conf` 配置 → 节点间 8848/9848 端口连通 → Raft 日志

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| Dashboard | `:8848/nacos` |
| Open API | `/nacos/v1/` |
| 日志 | `logs/nacos.log` |

---

## 7. 参考资料

- [Nacos Documentation](https://nacos.io/docs/)
- [Nacos Cluster Deployment](https://nacos.io/docs/latest/guide/admin/cluster-mode-extended/)
- [Nacos Auth Guide](https://nacos.io/docs/latest/guide/user/auth/)
