# PowerJob 部署指南

> 版本：4.3.9 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| JDK | 11+ | 运行环境 |
| MySQL | 5.7+ / 8.0 | 核心存储（必选） |
| MongoDB | 4.4+ | 扩展存储（可选，容器运行为止不强制） |

> **注意**：PowerJob 配置文件使用 `oms.datasource.*` 前缀，而非 `spring.datasource.*`

## 2. 裸机安装（通用）

```bash
# 1) 下载
git clone https://github.com/PowerJob/PowerJob.git
cd PowerJob
mvn clean package -DskipTests

# 2) 初始化数据库
mysql -u root -p -e "CREATE DATABASE powerjob DEFAULT CHARSET utf8mb4;"
mysql -u root -p powerjob < powerjob-server/powerjob-server-starter/src/main/resources/sql/ddl-POWERJOB.sql

# 3) 获取 Server jar
# powerjob-server/powerjob-server-starter/target/powerjob-server-starter-4.3.9.jar
```

## 3. 单机部署

### 适用场景

开发测试、小型任务调度

### Server 配置

```bash
cat > application-server.yml << 'EOF'
server:
  port: 7700

oms:
  datasource:
    core:
      jdbc-url: jdbc:mysql://localhost:3306/powerjob?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
      username: powerjob
      password: PowerJob!Pass
      hikari:
        maximum-pool-size: 20
        minimum-idle: 5
  akka:
    port: 10086
  instance:
    status-check-interval: 3000
EOF
```

### Server 启动

```bash
java -jar powerjob-server-starter-4.3.9.jar --spring.config.additional-location=application-server.yml
```

### Worker 示例配置

```yaml
# application-worker.yml
server:
  port: 27777

spring:
  application:
    name: order-worker

oms:
  akka:
    port: 27778
  datasource:
    core:
      jdbc-url: jdbc:mysql://localhost:3306/powerjob?useSSL=false&serverTimezone=Asia/Shanghai
      username: powerjob
      password: PowerJob!Pass
  server-address: localhost:7700
```

```bash
java -jar powerjob-worker.jar --spring.config.additional-location=application-worker.yml
```

Maven 依赖：

```xml
<dependency>
    <groupId>com.github.kfcfans</groupId>
    <artifactId>powerjob-worker-spring-boot-starter</artifactId>
    <version>4.3.9</version>
</dependency>
```

### 验证

```
访问 http://localhost:7700  默认 admin/123456
查看"应用管理"可看到注册的 Worker 在线
创建并运行一个简单任务验证调度
```

### Docker Compose

```yaml
services:
  powerjob-server:
    image: tjqq/powerjob-server:4.3.9
    ports: ["7700:7700", "10086:10086"]
    environment:
      PARAMS: "--oms.datasource.core.jdbc-url=jdbc:mysql://mysql:3306/powerjob?useSSL=false&serverTimezone=Asia/Shanghai --oms.datasource.core.username=powerjob --oms.datasource.core.password=PowerJob!Pass --oms.akka.port=10086"
    depends_on: [mysql]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: PowerJobMySQL!Pass
      MYSQL_DATABASE: powerjob
      MYSQL_USER: powerjob
      MYSQL_PASSWORD: PowerJob!Pass
    volumes: ["pj-mysql-data:/var/lib/mysql"]

volumes: {pj-mysql-data:}
```

## 4. 集群部署

### 适用场景

生产环境高可用，支持 MapReduce 和 DAG 工作流

### 节点规划

| 节点 | 角色 | 地址 |
|------|------|------|
| node1 | Server | 192.168.1.10:7700 |
| node2 | Server | 192.168.1.11:7700 |
| node3 | Server | 192.168.1.12:7700 |

后端共享 MySQL + MongoDB（可选，用于扩展存储）。

### Server 配置

```bash
cat > application-cluster.yml << 'EOF'
server:
  port: 7700

oms:
  datasource:
    core:
      jdbc-url: jdbc:mysql://<db-host>:3306/powerjob?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
      username: powerjob
      password: PowerJob!Pass
      hikari:
        maximum-pool-size: 20
        minimum-idle: 5
  mongodb:
    uri: mongodb://<mongo-host>:27017/powerjob     # MongoDB 可选
  akka:
    port: 10086
  server:
    address: 192.168.1.10:7700,192.168.1.11:7700,192.168.1.12:7700
  instance:
    status-check-interval: 3000
EOF
```

### 启动

```bash
# 三个节点依次启动，配置相同（server.address 本机地址不同）
java -jar powerjob-server-starter-4.3.9.jar --spring.config.additional-location=application-cluster.yml
```

### 验证

```
访问任意 Server 节点 Web UI
查看集群信息，多个 Server 在线
Worker 注册到多个 Server 地址
```

### Docker Compose

```yaml
services:
  powerjob-server-1:
    image: tjqq/powerjob-server:4.3.9
    ports: ["7700:7700", "10086:10086"]
    environment:
      PARAMS: "--oms.datasource.core.jdbc-url=jdbc:mysql://mysql:3306/powerjob?useSSL=false --oms.datasource.core.username=powerjob --oms.datasource.core.password=PowerJob!Pass --oms.akka.port=10086"
    depends_on: [mysql]

  powerjob-server-2:
    image: tjqq/powerjob-server:4.3.9
    ports: ["7701:7700", "10087:10086"]
    environment:
      PARAMS: "--oms.datasource.core.jdbc-url=jdbc:mysql://mysql:3306/powerjob?useSSL=false --oms.datasource.core.username=powerjob --oms.datasource.core.password=PowerJob!Pass --oms.akka.port=10086"
    depends_on: [mysql]

  powerjob-server-3:
    image: tjqq/powerjob-server:4.3.9
    ports: ["7702:7700", "10088:10086"]
    environment:
      PARAMS: "--oms.datasource.core.jdbc-url=jdbc:mysql://mysql:3306/powerjob?useSSL=false --oms.datasource.core.username=powerjob --oms.datasource.core.password=PowerJob!Pass --oms.akka.port=10086"
    depends_on: [mysql]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: PowerJobMySQL!Pass
      MYSQL_DATABASE: powerjob
      MYSQL_USER: powerjob
      MYSQL_PASSWORD: PowerJob!Pass
    volumes: ["pj-mysql-data:/var/lib/mysql"]

volumes: {pj-mysql-data:}
```

## 5. 运维速查

```bash
# 查看 Server 日志
tail -f /data/logs/powerjob-server/*.log

# 备份数据库
mysqldump -u powerjob -p powerjob | gzip > powerjob_$(date +%F).sql.gz

# Server 健康检查
curl http://localhost:7700/actuator/health

# Worker 状态（需在 Web UI 中查看执行器应用列表）
```

## 6. 常见故障

**故障 1：Server 启动报 "oms.datasource" 配置无效**

- 确认使用了 `oms.datasource.core.jdbc-url` 而非 `spring.datasource.url`
- PowerJob 不走 Spring Boot 默认数据源

**故障 2：Worker 连不上 Server**

- 检查 `oms.server-address` 指向的端口是否正确（默认 7700）
- 检查防火墙，Akka 端口（10086）需互通

**故障 3：任务调度成功但执行失败**

- 查看 Worker 端日志 `/data/logs/powerjob-worker/`
- 检查任务处理器类是否在 Worker classpath 中
