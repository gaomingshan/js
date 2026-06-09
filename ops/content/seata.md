# Seata 部署指南

> 版本：2.2.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| JDK | JDK 8+（推荐 JDK 17） |
| MySQL | 5.7+（集群必需；单机可选 file 模式） |
| Nacos | 1.4+（集群模式注册中心） |
| 端口 | 8091（TC 服务）、7091（HTTP Console） |

## 2. 裸机安装（通用）

```bash
wget https://github.com/seata/seata/releases/download/v2.2.0/seata-server-2.2.0.tar.gz
tar xzf seata-server-2.2.0.tar.gz && cd seata
```

## 3. 单机部署

**适用场景**：开发测试，file 模式

### 3.1 配置（file 模式）

```bash
cat > conf/application.yml << 'EOF'
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
EOF
```

### 3.2 启动

```bash
sh bin/seata-server.sh -p 8091 -h 0.0.0.0 -m file
```

### 3.3 验证

```bash
curl -s http://127.0.0.1:7091/api/v1/global/list
# 预期返回空列表（无活跃全局事务）
```

### 3.4 Docker Compose（file 模式）

```yaml
services:
  seata:
    image: seataio/seata-server:2.2.0
    container_name: seata
    restart: unless-stopped
    ports:
      - "8091:8091"
      - "7091:7091"
    environment:
      SEATA_IP: seata
      SEATA_PORT: 8091
    volumes:
      - ./conf/application.yml:/seata-server/resources/application.yml
```

## 4. 集群部署

**适用场景**：生产环境高可用，TC 集群 + DB 模式 + Nacos 注册

### 4.1 节点规划

| 节点 | IP | 端口 |
|------|-----|------|
| seata-1 | 10.0.0.1 | 8091 |
| seata-2 | 10.0.0.2 | 8091 |

### 4.2 配置（DB 模式 + Nacos 注册）

**Step 1：初始化 MySQL 表（必须优先执行）**

```bash
# 创建 Seata 数据库
mysql -u root -p -e "CREATE DATABASE seata DEFAULT CHARACTER SET utf8mb4;"

# 导入 Seata 事务表（脚本来自官方仓库 script/server/db/）
mysql -u root -p seata < script/server/db/mysql.sql

# 确认四张表已创建
mysql -u root -p seata -e "SHOW TABLES;"
# 预期：global_table, branch_table, lock_table, distributed_lock
```

**Step 2：配置 application.yml**

```bash
cat > conf/application.yml << 'EOF'
server:
  port: 7091

seata:
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: nacos:8848
      namespace: prod
      group: SEATA_GROUP
      cluster: default

  config:
    type: nacos
    nacos:
      server-addr: nacos:8848
      namespace: prod
      group: SEATA_GROUP

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

  security:
    secretKey: SeataSecretKey012345678901234567890123456789012345678901234567890123456789
EOF
```

### 4.3 启动

```bash
sh bin/seata-server.sh -p 8091 -h 10.0.0.1 -m db
```

### 4.4 验证

```bash
# 查看 Nacos 服务列表，确认 seata-server 已注册
curl -s "http://nacos:8848/nacos/v1/ns/instance/list?serviceName=seata-server" | jq

curl -s http://10.0.0.1:7091/api/v1/global/list
```

### 4.5 Docker Compose（TC 集群 + Nacos + MySQL）

```yaml
services:
  seata-mysql:
    image: mysql:8.0
    container_name: seata-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: SeataMySQL!Pass
      MYSQL_DATABASE: seata
      MYSQL_USER: seata
      MYSQL_PASSWORD: SeataUser!Pass
    volumes:
      - seata-mysql-data:/var/lib/mysql
      - ./init-sql:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
    networks:
      - seata-net

  seata-1:
    image: seataio/seata-server:2.2.0
    container_name: seata-1
    restart: unless-stopped
    ports:
      - "8091:8091"
      - "7091:7091"
    environment:
      SEATA_IP: seata-1
      SEATA_PORT: 8091
    volumes:
      - ./conf/application.yml:/seata-server/resources/application.yml
    depends_on:
      seata-mysql:
        condition: service_healthy
    networks:
      - seata-net

  seata-2:
    image: seataio/seata-server:2.2.0
    container_name: seata-2
    restart: unless-stopped
    ports:
      - "8092:8091"
      - "7092:7091"
    environment:
      SEATA_IP: seata-2
      SEATA_PORT: 8091
    volumes:
      - ./conf/application.yml:/seata-server/resources/application.yml
    depends_on:
      seata-mysql:
        condition: service_healthy
    networks:
      - seata-net

volumes:
  seata-mysql-data:

networks:
  seata-net:
    driver: bridge
```

> Docker Compose 启动前必须先将 `mysql.sql` 放入 `./init-sql/` 目录，确保 MySQL 初始化时自动建表。Seata 容器需等待 MySQL 健康检查通过后再启动。

## 5. 运维速查

```bash
# 全局事务查询
curl http://tc:7091/api/v1/global/list?pageSize=100

# 全局事务强制回滚
curl -X DELETE http://tc:7091/api/v1/global/forceRollback/{xid}

# 查看日志
tail -f logs/seata-server.log

# 备份 DB 事务表
mysqldump -u seata -p seata global_table branch_table lock_table > seata_backup.sql
```

## 6. 常见故障

**全局事务超时回滚**：检查业务处理耗时 → 增大全局事务超时时间 → 优化慢查询

**分支事务悬挂**：检查 RM 日志 → 手动补偿 → 检查 `undo_log` 表

**TC 注册不到 Nacos**：检查 `registry.nacos.server-addr` 配置 → 检查 Nacos 联通性 → 检查 `SEATA_GROUP` 与客户端配置是否一致

**MySQL 表不存在**：确认已执行 `script/server/db/mysql.sql` 初始化脚本；Docker Compose 需确保 init SQL 已挂载
