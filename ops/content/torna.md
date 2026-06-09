# Torna 部署指南

> 版本：latest | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| JDK | JDK 8+（服务端） |
| MySQL | 5.7+ |
| 端口 | 7700（服务器）、8080（前端 UI） |

## 2. 裸机安装（通用）

```bash
# 下载 Torna 服务端
wget https://gitee.com/durcframework/torna/releases/download/v1.0.0/torna-server-1.0.0.jar
```

## 3. 单机部署

**适用场景**：企业 API 文档管理

### 3.1 配置（MySQL 后端）

```bash
# 初始化数据库
mysql -u root -p -e "CREATE DATABASE torna DEFAULT CHARACTER SET utf8mb4;"

# 导入 Torna 初始化 SQL（从源码或发行包获取 torna.sql）
mysql -u root -p torna < torna.sql
```

```bash
cat > application.properties << 'EOF'
server.port=7700

spring.datasource.url=jdbc:mysql://127.0.0.1:3306/torna?characterEncoding=utf8&useSSL=false
spring.datasource.username=root
spring.datasource.password=TornaMySQL!Pass
EOF
```

### 3.2 启动

```bash
java -jar torna-server-1.0.0.jar --spring.config.additional-location=application.properties
```

### 3.3 验证

```bash
curl -s http://127.0.0.1:7700/about
# 浏览器访问 http://127.0.0.1:7700，默认管理员账户 admin/admin123
```

### 3.4 Docker Compose（推荐）

```yaml
services:
  torna-mysql:
    image: mysql:8.0
    container_name: torna-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: TornaMySQL!Pass
      MYSQL_DATABASE: torna
      MYSQL_USER: torna
      MYSQL_PASSWORD: TornaUser!Pass
    volumes:
      - torna-mysql-data:/var/lib/mysql
      - ./sql:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
    networks:
      - torna-net

  torna-server:
    image: tanghc2020/torna-server:latest
    container_name: torna-server
    restart: unless-stopped
    ports:
      - "7700:7700"
    environment:
      MYSQL_HOST: torna-mysql
      MYSQL_PORT: 3306
      MYSQL_DATABASE: torna
      MYSQL_USERNAME: torna
      MYSQL_PASSWORD: TornaUser!Pass
    depends_on:
      torna-mysql:
        condition: service_healthy
    networks:
      - torna-net

  torna-ui:
    image: tanghc2020/torna-ui:latest
    container_name: torna-ui
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - torna-server
    networks:
      - torna-net

volumes:
  torna-mysql-data:

networks:
  torna-net:
    driver: bridge
```

### 3.5 Spring Boot 客户端集成

```xml
<dependency>
    <groupId>cn.torna</groupId>
    <artifactId>spring-doc-client</artifactId>
    <version>1.0.0</version>
</dependency>
```

```yaml
torna:
  url: http://torna-server:7700
  token: your-project-token
  run-env: prod
```

## 4. 运维速查

```bash
# 备份数据库
mysqldump -u torna -p torna > torna_backup.sql

# 查看日志
docker logs torna-server -f
docker logs torna-ui -f

# 默认管理员账户
# 用户名: admin
# 密码:   admin123

# Torna 配置主要通过 UI 管理
# 关键概念：空间 → 项目 → 模块 → 环境 → 推送 Token
```

## 5. 常见故障

**服务端无法启动**：检查 MySQL 连接配置 → 确认数据库已初始化 → 检查 `torna.sql` 是否导入成功

**前端报 502**：确认 torna-server 端口 7700 是否正常 → 检查 torna-ui 到 torna-server 的网络连通性 → 确认 `torna-ui` 环境变量中 API 地址配置

**文档推送失败**：检查项目的推送 Token 是否正确 → 检查 `torna.url` 是否可达 → 确认模块/环境配置匹配
