# Camunda 部署指南

> 版本：7.21 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| JDK | 11+ | 运行环境 |
| H2 | 内嵌 | 开发测试用 |
| MySQL | 8.0 | 单机生产可选 |
| PostgreSQL | 13+ | 集群生产推荐 |
| CockroachDB | 22.2+ | 集群高可用（PostgreSQL 协议兼容） |

默认账号：`admin` / `{adminPassword}`（首次启动需设置）

## 2. 裸机安装（通用）

```bash
# 下载 Camunda Run
wget https://downloads.camunda.cloud/release/camunda-bpm/run/7.21/camunda-bpm-run-7.21.0.zip
unzip camunda-bpm-run-7.21.0.zip
cd camunda-bpm-run-7.21.0

# 启动（内嵌 H2）
./start.sh
```

## 3. 单机部署

### 适用场景

开发测试、小规模工作流引擎

### jar 启动 + H2 数据库

```bash
# 直接启动使用内嵌 H2，无需额外配置
./start.sh
```

### jar 启动 + MySQL

```bash
cat > application-mysql.yml << 'EOF'
camunda.bpm:
  admin-user:
    id: admin
    password: Camunda!Pass
  filter:
    create: All
  database:
    type: mysql

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/camunda?useSSL=false&characterEncoding=utf8
    username: camunda
    password: Camunda!Pass
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
EOF
```

```bash
java -jar camunda-bpm-run-7.21.0.jar --spring.config.additional-location=application-mysql.yml
```

MySQL 初始化：

```bash
mysql -u root -p -e "CREATE DATABASE camunda DEFAULT CHARSET utf8mb4;"
mysql -u root -p -e "CREATE USER 'camunda'@'%' IDENTIFIED BY 'Camunda!Pass';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON camunda.* TO 'camunda'@'%';"
```

> Camunda 首次启动会自动建表（需 DB 连接有 CREATE 权限）

### 验证

```
访问 http://localhost:8080/camunda
默认 admin / Camunda!Pass
Cockpit / Tasklist / Admin 页面正常
```

### Docker Compose

```yaml
services:
  camunda:
    image: camunda/camunda-bpm-platform:run-7.21
    ports: ["8080:8080"]
    environment:
      CAMUNDA_BPM_DATABASE_TYPE: mysql
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/camunda?useSSL=false
      SPRING_DATASOURCE_USERNAME: camunda
      SPRING_DATASOURCE_PASSWORD: Camunda!Pass
      CAMUNDA_BPM_ADMIN_PASSWORD: Camunda!Pass
    depends_on: [mysql]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: CamundaMySQL!Pass
      MYSQL_DATABASE: camunda
      MYSQL_USER: camunda
      MYSQL_PASSWORD: Camunda!Pass
    volumes: ["camunda-mysql-data:/var/lib/mysql"]

volumes: {camunda-mysql-data:}
```

> **Volume 路径说明**：Camunda 数据文件存储在 `/camunda/data` 子目录，非 `/camunda` 根目录。挂载时务必使用 `-v volume-name:/camunda/data`。

## 4. 集群部署

### 适用场景

生产环境，工作流引擎高可用

### 节点规划

| 节点 | 角色 | 地址 |
|------|------|------|
| node1 | Camunda | 192.168.1.10:8080 |
| node2 | Camunda | 192.168.1.11:8080 |

| 数据库选择 | 适用场景 |
|-----------|----------|
| PostgreSQL | 通用生产，主从复制 |
| CockroachDB | 多 AZ 高可用，自动容灾 |

### 配置

#### PostgreSQL 后端

```yaml
camunda.bpm:
  admin-user:
    id: admin
    password: Camunda!Pass
  filter:
    create: All
  database:
    type: postgres
  history-level: full
  job-execution:
    enabled: true
    core-pool-size: 8
    max-pool-size: 32
    queue-capacity: 100

spring:
  datasource:
    url: jdbc:postgresql://<pg-host>:5432/camunda?characterEncoding=utf8
    username: camunda
    password: Camunda!Pass
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10
```

#### CockroachDB 后端

```yaml
camunda.bpm:
  admin-user:
    id: admin
    password: Camunda!Pass
  filter:
    create: All
  database:
    type: postgres
  history-level: full

spring:
  datasource:
    url: jdbc:postgresql://<cockroach-host>:26257/camunda?sslmode=disable
    username: root
    password: ""
    hikari:
      maximum-pool-size: 30
```

> Camunda 配置 `database.type: postgres` 即可对接 CockroachDB（PG 协议兼容）

### 启动

```bash
# 两节点使用相同配置，共享同一数据库
java -jar camunda-bpm-run-7.21.0.jar --spring.config.additional-location=application-cluster.yml
```

### 验证

```
访问两个节点，Cockpit 中流程实例和任务一致
关闭一个节点，任务仍可通过另一节点完成
```

### Docker Compose（PostgreSQL）

```yaml
services:
  camunda-1:
    image: camunda/camunda-bpm-platform:run-7.21
    ports: ["8080:8080"]
    environment:
      CAMUNDA_BPM_DATABASE_TYPE: postgres
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/camunda
      SPRING_DATASOURCE_USERNAME: camunda
      SPRING_DATASOURCE_PASSWORD: Camunda!Pass
      CAMUNDA_BPM_ADMIN_PASSWORD: Camunda!Pass
    depends_on: [postgres]

  camunda-2:
    image: camunda/camunda-bpm-platform:run-7.21
    ports: ["8081:8080"]
    environment:
      CAMUNDA_BPM_DATABASE_TYPE: postgres
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/camunda
      SPRING_DATASOURCE_USERNAME: camunda
      SPRING_DATASOURCE_PASSWORD: Camunda!Pass
      CAMUNDA_BPM_ADMIN_PASSWORD: Camunda!Pass
    depends_on: [postgres]

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: camunda
      POSTGRES_USER: camunda
      POSTGRES_PASSWORD: Camunda!Pass
    volumes: ["camunda-pg-data:/var/lib/postgresql/data"]

volumes: {camunda-pg-data:}
```

## 5. 运维速查

```bash
# REST API 示例
curl -X POST http://localhost:8080/engine/default/process-definition/key/order-process/start

# 查询待办任务
curl http://localhost:8080/engine/default/task?assignee=admin

# 完成任务
curl -X POST http://localhost:8080/engine/default/task/{task-id}/complete

# 备份数据库（PostgreSQL）
pg_dump -U camunda camunda | gzip > camunda_$(date +%F).sql.gz

# 查看 Camunda 日志
tail -f camunda-bpm-run-7.21.0/log/camunda-bpm-run.log
```

## 6. 常见故障

**故障 1：Docker Volume 挂载导致数据丢失**

- 正确挂载路径：`/camunda/data`，非 `/camunda`
- 使用具名 volume 而非 bind mount

**故障 2：Camunda 连接 CockroachDB 失败**

- 确认 Camunda `database.type` 设为 `postgres`
- CockroachDB 默认端口 26257，非 5432

**故障 3：作业执行器不触发**

- 检查 `job-execution.enabled: true`
- 检查数据库连接是否正常
- 检查历史级别是否过低
