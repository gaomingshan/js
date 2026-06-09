# XXL-JOB 部署指南

> 版本：2.4.2 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| JDK | 8+ | 运行环境 |
| MySQL | 5.7+ / 8.0 | 调度中心依赖数据库 |
| Maven | 3.6+ | 源码编译（可选） |

默认调度账号：`admin` / `123456`

## 2. 裸机安装（通用）

```bash
# 1) 下载源码编译或下载 Release jar
git clone https://github.com/xuxueli/xxl-job.git
cd xxl-job
mvn clean package -DskipTests

# 2) 初始化数据库
mysql -u root -p -e "CREATE DATABASE xxl_job DEFAULT CHARSET utf8mb4;"
mysql -u root -p xxl_job < xxl-job-admin/src/main/resources/tables_xxl_job.sql

# 3) 获取启动包
# xxl-job-admin/target/xxl-job-admin-2.4.2.jar
```

## 3. 单机部署

### 适用场景

开发测试、小规模任务调度（< 1000 任务/天）

### 配置

```bash
cat > application-single.yml << 'EOF'
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/xxl_job?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: xxljob
    password: XxlJob!Pass
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

xxl:
  job:
    accessToken: XXLJobAccessToken2024
    i18n: zh_CN
    logretentiondays: 30
EOF
```

### 启动

```bash
java -jar xxl-job-admin-2.4.2.jar --spring.config.additional-location=application-single.yml
```

### 验证

```
访问 http://localhost:8080/xxl-job-admin  默认 admin/123456
查看"执行器管理"和"任务管理"页面正常
```

### Docker Compose

```yaml
services:
  xxl-job-admin:
    image: xuxueli/xxl-job-admin:2.4.2
    ports: ["8080:8080"]
    environment:
      PARAMS: "--spring.datasource.url=jdbc:mysql://mysql:3306/xxl_job?useSSL=false --spring.datasource.username=xxljob --spring.datasource.password=XxlJob!Pass --xxl.job.accessToken=XXLJobAccessToken2024"
    depends_on: [mysql]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: XxlJobMySQL!Pass
      MYSQL_DATABASE: xxl_job
      MYSQL_USER: xxljob
      MYSQL_PASSWORD: XxlJob!Pass
    volumes: ["xxl-mysql-data:/var/lib/mysql"]

volumes: {xxl-mysql-data:}
```

## 4. 集群部署

### 适用场景

生产环境高可用，任务量 1000+/天

### 节点规划

| 节点 | 角色 | 地址 |
|------|------|------|
| node1 | Admin | 192.168.1.10:8080 |
| node2 | Admin | 192.168.1.11:8080 |

DB 共享同一 MySQL 实例（需额外部署）。

### 配置

两节点配置完全一致，均连接同一数据库。

```bash
cat > application-cluster.yml << 'EOF'
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://<db-host>:3306/xxl_job?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: xxljob
    password: XxlJob!Pass
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10

xxl:
  job:
    accessToken: XXLJobAccessToken2024
    i18n: zh_CN
    logretentiondays: 30
    triggerpool:
      fast:
        max: 200
      slow:
        max: 100
EOF
```

### 启动

```bash
# node1
java -jar xxl-job-admin-2.4.2.jar --spring.config.additional-location=application-cluster.yml --server.port=8080

# node2
java -jar xxl-job-admin-2.4.2.jar --spring.config.additional-location=application-cluster.yml --server.port=8080
```

### 验证

```
分别访问 http://192.168.1.10:8080/xxl-job-admin 和 http://192.168.1.11:8080/xxl-job-admin
两端数据一致（任务、执行器、调度日志互通）
```

### Docker Compose

```yaml
services:
  xxl-job-admin-1:
    image: xuxueli/xxl-job-admin:2.4.2
    ports: ["8080:8080"]
    environment:
      PARAMS: "--spring.datasource.url=jdbc:mysql://mysql:3306/xxl_job?useSSL=false --spring.datasource.username=xxljob --spring.datasource.password=XxlJob!Pass --xxl.job.accessToken=XXLJobAccessToken2024"
    depends_on: [mysql]

  xxl-job-admin-2:
    image: xuxueli/xxl-job-admin:2.4.2
    ports: ["8081:8080"]
    environment:
      PARAMS: "--spring.datasource.url=jdbc:mysql://mysql:3306/xxl_job?useSSL=false --spring.datasource.username=xxljob --spring.datasource.password=XxlJob!Pass --xxl.job.accessToken=XXLJobAccessToken2024"
    depends_on: [mysql]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: XxlJobMySQL!Pass
      MYSQL_DATABASE: xxl_job
      MYSQL_USER: xxljob
      MYSQL_PASSWORD: XxlJob!Pass
    volumes: ["xxl-mysql-data:/var/lib/mysql"]

volumes: {xxl-mysql-data:}
```

### Executor 配置

```yaml
xxl:
  job:
    admin:
      addresses: http://192.168.1.10:8080/xxl-job-admin,http://192.168.1.11:8080/xxl-job-admin
    accessToken: XXLJobAccessToken2024
    executor:
      appname: order-executor
      port: 9999
      logpath: /data/logs/xxl-job
      logretentiondays: 30
```

Maven 依赖：

```xml
<dependency>
    <groupId>com.xuxueli</groupId>
    <artifactId>xxl-job-core</artifactId>
    <version>2.4.2</version>
</dependency>
```

## 5. 运维速查

```bash
# 查看日志
tail -f /data/applogs/xxl-job/xxl-job-admin.log

# 备份数据库
mysqldump -u xxljob -p xxl_job | gzip > xxl_job_$(date +%F).sql.gz

# 查看调度中心健康状态
curl http://localhost:8080/xxl-job-admin/health

# 执行器日志目录
ls -lh /data/logs/xxl-job/
```

## 6. 常见故障

**故障 1：执行器注册不上**

- 检查 `accessToken` 是否一致
- 检查执行器能否访问调度中心地址
- 检查防火墙端口

**故障 2：任务调度失败 "Task not found"**

- 确认执行器 AppName 是否匹配
- 检查执行器是否为在线状态
- 检查任务是否被自动禁用

**故障 3：调度中心启动报 DB 连接失败**

- 检查 MySQL 是否可达
- 检查 `spring.datasource` 连接串参数
- 确认数据库 `xxl_job` 已初始化表结构
