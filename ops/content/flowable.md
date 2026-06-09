# Flowable 部署指南

> 版本：7.1.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| JDK | 11+ | 运行环境 |
| MySQL | 5.7+ / 8.0 | 流程数据存储 |
| Tomcat | 9+ | WAR 部署模式（可选） |

> **关键**：`flowable.database-schema-update` 与 Flyway 两者只选其一，不要同时启用。

## 2. 裸机安装（通用）

```bash
# 1) 下载 Flowable all-in-one WAR 包
wget https://github.com/flowable/flowable-engine/releases/download/flowable-7.1.0/flowable-7.1.0.zip
unzip flowable-7.1.0.zip

# 2) 初始化数据库
mysql -u root -p -e "CREATE DATABASE flowable DEFAULT CHARSET utf8mb4;"
```

## 3. 单机部署

### 适用场景

开发测试、流程演示

### WAR 部署 + MySQL

```bash
# 将 WAR 复制到 Tomcat webapps
cp flowable-ui/flowable-ui.war $TOMCAT_HOME/webapps/flowable.war

# 配置数据源（在 $TOMCAT_HOME/conf/Catalina/localhost/flowable.xml 中添加）
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Context>
  <Resource name="jdbc/flowableDB" auth="Container"
            type="javax.sql.DataSource"
            driverClassName="com.mysql.cj.jdbc.Driver"
            url="jdbc:mysql://localhost:3306/flowable?useSSL=false&characterEncoding=utf8"
            username="flowable"
            password="Flowable!Pass"
            maxTotal="20" maxIdle="5" maxWaitMillis="30000"/>
</Context>
```

### Spring Boot 集成（推荐）

```xml
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter</artifactId>
    <version>7.1.0</version>
</dependency>
```

```yaml
flowable:
  database-schema-update: true
  async-executor-activate: true
  history-level: full

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/flowable?useSSL=false&characterEncoding=utf8
    username: flowable
    password: Flowable!Pass
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

### 启动

```bash
# WAR 模式：启动 Tomcat 即可
catalina.sh run

# Spring Boot 模式
mvn spring-boot:run
# 或
java -jar flowable-app.jar
```

### 验证

```
访问 http://localhost:8080/flowable-ui
默认 admin/test
可创建和部署 BPMN 流程
```

### Docker Compose

```yaml
services:
  flowable:
    image: flowable/all-in-one:7.1.0
    ports: ["8080:8080"]
    environment:
      FLOWABLE_DATASOURCE_URL: jdbc:mysql://mysql:3306/flowable?useSSL=false
      FLOWABLE_DATASOURCE_USERNAME: flowable
      FLOWABLE_DATASOURCE_PASSWORD: Flowable!Pass
      FLOWABLE_ASYNC_EXECUTOR_ENABLE: "true"
    depends_on: [mysql]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: FlowableMySQL!Pass
      MYSQL_DATABASE: flowable
      MYSQL_USER: flowable
      MYSQL_PASSWORD: Flowable!Pass
    volumes: ["flow-mysql-data:/var/lib/mysql"]

volumes: {flow-mysql-data:}
```

## 4. 集群部署

### 适用场景

生产环境，高可用工作流服务

### 节点规划

| 节点 | 角色 | 地址 |
|------|------|------|
| node1 | Tomcat | 192.168.1.10:8080 |
| node2 | Tomcat | 192.168.1.11:8080 |

前端需配置负载均衡（Nginx / HAProxy）。

### 配置

```yaml
flowable:
  database-schema-update: false
  async-executor-activate: true
  async-executor-core-pool-size: 8
  async-executor-max-pool-size: 32
  async-executor-queue-size: 100
  history-level: full
  process-definition-cache-limit: 256

spring:
  datasource:
    url: jdbc:mysql://<db-host>:3306/flowable?useSSL=false&characterEncoding=utf8
    username: flowable
    password: Flowable!Pass
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10
```

### schema-update 与 Flyway 集成说明

| 策略 | 配置 | 说明 |
|------|------|------|
| Flowable 自动 | `database-schema-update: true` | 开发用，自动建表/升级 |
| Flyway 管理 | `database-schema-update: false` + Flyway | 生产用，版本控制 |

```yaml
# Flyway 集成（production）
flowable:
  database-schema-update: false

spring:
  flyway:
    enabled: true
    locations: classpath:db/migration/flowable
    baseline-on-migrate: true
    table: FLYWAY_SCHEMA_HISTORY

flowable:
  flyway-enabled: true       # Flowable 7.0+ 原生支持 Flyway
```

> 两节点配置相同（除端口），共享同一数据库。`database-schema-update: false` 配合 Flyway 管理 Schema 版本，确保两个节点不会同时执行 DDL。

### 验证

```
通过负载均衡访问 Flowable UI，两节点均正常
多个节点共享流程实例和任务数据
```

### Docker Compose

```yaml
services:
  flowable-1:
    image: flowable/all-in-one:7.1.0
    ports: ["8080:8080"]
    environment:
      FLOWABLE_DATASOURCE_URL: jdbc:mysql://mysql:3306/flowable?useSSL=false
      FLOWABLE_DATASOURCE_USERNAME: flowable
      FLOWABLE_DATASOURCE_PASSWORD: Flowable!Pass
    depends_on: [mysql]

  flowable-2:
    image: flowable/all-in-one:7.1.0
    ports: ["8081:8080"]
    environment:
      FLOWABLE_DATASOURCE_URL: jdbc:mysql://mysql:3306/flowable?useSSL=false
      FLOWABLE_DATASOURCE_USERNAME: flowable
      FLOWABLE_DATASOURCE_PASSWORD: Flowable!Pass
    depends_on: [mysql]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: FlowableMySQL!Pass
      MYSQL_DATABASE: flowable
      MYSQL_USER: flowable
      MYSQL_PASSWORD: Flowable!Pass
    volumes: ["flow-mysql-data:/var/lib/mysql"]

volumes: {flow-mysql-data:}
```

## 5. 运维速查

```bash
# 查看流程引擎状态
curl http://localhost:8080/flowable-ui/app/rest/management/properties

# 备份数据库
mysqldump -u flowable -p flowable | gzip > flowable_$(date +%F).sql.gz

# 部署流程（REST API）
curl -X POST http://localhost:8080/flowable-ui/app/rest/repository/deployments \
  -F "file=@my-process.bpmn20.xml"

# 清理历史数据
# Flowable UI → Admin → History → Clean
```

## 6. 常见故障

**故障 1：database-schema-update 与 Flyway 冲突**

- 两个同时启用会导致重复执行 DDL
- 生产必须 `database-schema-update: false`，改用 Flyway

**故障 2：异步任务不执行**

- 检查 `async-executor-activate: true`
- 检查线程池配置是否正确

**故障 3：流程部署后找不到定义**

- 检查部署包正确性
- 检查租户 ID（TenantId）是否匹配
- 清空流程定义缓存并重启

**故障 4：Tomcat 集群 Session 不一致**

- 配置共享 Session（Redis / JDBC）
- 或使用负载均衡的 sticky session
