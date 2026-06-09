# Nacos 部署指南

> 版本：2.4.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| JDK | JDK 8+（推荐 JDK 17） |
| MySQL | 5.7+（集群必需；单机可选，可用内嵌 Derby） |
| 内存 | 单机 ≥ 2G，集群 ≥ 4G/节点 |
| 端口 | 8848（主端口）、9848（gRPC）、9849（gRPC） |

## 2. 裸机安装（通用）

```bash
wget https://github.com/alibaba/nacos/releases/download/2.4.0/nacos-server-2.4.0.tar.gz
tar xzf nacos-server-2.4.0.tar.gz && cd nacos
```

## 3. 单机部署

**适用场景**：开发测试、小规模（实例数 < 500）

### 3.1 配置（内嵌 Derby）

```bash
cat > conf/application.properties << 'EOF'
server.port=8848
nacos.standalone=true
EOF
```

### 3.2 启动

```bash
sh bin/startup.sh -m standalone
```

### 3.3 验证

```bash
curl -s http://127.0.0.1:8848/nacos/v1/ns/operator/leader | jq
# 输出中 solo 字段为 true 表示单机模式
```

### 3.4 Docker Compose

```yaml
services:
  nacos:
    image: nacos/nacos-server:v2.4.0
    container_name: nacos
    restart: unless-stopped
    ports:
      - "8848:8848"
      - "9848:9848"
    environment:
      MODE: standalone
      NACOS_AUTH_ENABLE: "true"
      NACOS_AUTH_TOKEN: "SecretKey012345678901234567890123456789012345678901234567890123456789"
    volumes:
      - nacos-logs:/home/nacos/logs

volumes:
  nacos-logs:
```

## 4. 集群部署

**适用场景**：生产环境，高可用，服务实例数 ≥ 500

### 4.1 节点规划

| 节点 | IP | 端口 |
|------|-----|------|
| nacos-1 | 10.0.0.1 | 8848 |
| nacos-2 | 10.0.0.2 | 8848 |
| nacos-3 | 10.0.0.3 | 8848 |

### 4.2 配置（MySQL 持久化）

**Step 1：初始化数据库**

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE nacos DEFAULT CHARACTER SET utf8mb4;"

# 导入 Nacos 官方 DDL
mysql -u root -p nacos < conf/mysql-schema.sql
```

**Step 2：配置 application.properties**

```bash
cat > conf/application.properties << 'EOF'
server.port=8848
nacos.standalone=false

spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://10.0.0.10:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useSSL=false
db.user=nacos
db.password=NacosUser!Pass

nacos.core.auth.enabled=true
nacos.core.auth.plugin.nacos.token.secret.key=SecretKey012345678901234567890123456789012345678901234567890123456789
nacos.core.auth.server.identity.key=serverIdentity
nacos.core.auth.server.identity.value=security
EOF
```

**Step 3：配置 cluster.conf**

```bash
cat > conf/cluster.conf << 'EOF'
10.0.0.1:8848
10.0.0.2:8848
10.0.0.3:8848
EOF
```

### 4.3 启动

```bash
# 每个节点依次执行
sh bin/startup.sh
```

### 4.4 验证

```bash
# 查看集群节点列表
curl -s http://10.0.0.1:8848/nacos/v1/ns/operator/servers | jq
# 预期看到 3 个节点

# 查看 Leader
curl -s http://10.0.0.1:8848/nacos/v1/ns/operator/leader | jq
```

### 4.5 Docker Compose

```yaml
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

  nacos-1: &nacos-node
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
    <<: *nacos-node
    container_name: nacos-2
    hostname: nacos-2

  nacos-3:
    <<: *nacos-node
    container_name: nacos-3
    hostname: nacos-3

volumes:
  mysql-data:

networks:
  nacos-net:
    driver: bridge
```

## 5. 运维速查

```bash
# 服务列表
curl -s "http://nacos:8848/nacos/v1/ns/service/list?pageNo=1&pageSize=100"

# 实例列表
curl -s "http://nacos:8848/nacos/v1/ns/instance/list?serviceName=order-service"

# 配置查询
curl -s "http://nacos:8848/nacos/v1/cs/configs?dataId=application.yml&group=DEFAULT_GROUP"

# 配置发布
curl -X POST "http://nacos:8848/nacos/v1/cs/configs" \
  -d "dataId=app.yml&group=DEFAULT_GROUP&content=key: value"

# 配置导出
curl "http://nacos:8848/nacos/v1/cs/configs?export=true&tenant=prod" -o config.zip

# 配置导入
curl -X POST "http://nacos:8848/nacos/v1/cs/configs?import=true" -F "file=@config.zip"

# 查看日志
tail -f logs/nacos.log
```

## 6. 常见故障

**服务注册不上**：检查网络连通 → 检查命名空间 → 检查认证配置 → 查看日志

**配置不生效**：检查 dataId/group/tenant 匹配 → 检查客户端日志 → 检查灰度发布状态

**集群 Leader 选举失败**：检查 `cluster.conf` 中节点 IP 和端口 → 检查节点间 8848/9848 端口连通性 → 检查 MySQL 连通性

**Derby 切换 MySQL 后数据丢失**：Derby 是内嵌数据库，数据不共享；切换 MySQL 需先导入 schema 再手动迁移业务数据
