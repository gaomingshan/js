# Docker / Docker Compose 部署

## 概述

Docker 是快速搭建 MongoDB 开发测试环境的最佳方式，Docker Compose 则能一键启动 MongoDB + 管理界面的完整环境。

---

## 单节点 Docker 部署

```bash
# 带认证和数据持久化（推荐）
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=StrongPass123 \
  -v /data/mongodb:/data/db \
  --restart unless-stopped \
  mongo:7.0

# 连接测试
docker exec -it mongodb mongosh \
  -u admin -p StrongPass123 --authenticationDatabase admin
```

---

## Docker Compose 编排（MongoDB + Mongo Express）

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: StrongPass123
      MONGO_INITDB_DATABASE: ecommerce
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - mongo-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  mongo-express:
    image: mongo-express:1.0
    container_name: mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_URL: mongodb://admin:StrongPass123@mongodb:27017/
      ME_CONFIG_BASICAUTH: "false"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - mongo-network

volumes:
  mongodb_data:

networks:
  mongo-network:
    driver: bridge
```

```js
// mongo-init.js：容器首次启动时执行
db = db.getSiblingDB('ecommerce');
db.createUser({
  user: 'app_user',
  pwd: 'AppPass456',
  roles: [{ role: 'readWrite', db: 'ecommerce' }]
});
db.createCollection('users');
db.createCollection('orders');
```

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f mongodb

# 停止（保留数据）
docker-compose down

# 停止并删除数据（慎用）
docker-compose down -v
```

---

## Docker Compose 副本集（开发用三节点）

```bash
# 1. 生成 keyfile（副本集内部认证）
openssl rand -base64 756 > keyfile
chmod 400 keyfile
```

```yaml
# docker-compose-replicaset.yml
version: '3.8'

services:
  mongo1:
    image: mongo:7.0
    container_name: mongo1
    ports: ["27017:27017"]
    command: ["--replSet", "rs0", "--keyFile", "/etc/mongodb/keyfile"]
    volumes:
      - mongo1_data:/data/db
      - ./keyfile:/etc/mongodb/keyfile:ro
    networks: [mongo-rs]

  mongo2:
    image: mongo:7.0
    container_name: mongo2
    ports: ["27018:27017"]
    command: ["--replSet", "rs0", "--keyFile", "/etc/mongodb/keyfile"]
    volumes:
      - mongo2_data:/data/db
      - ./keyfile:/etc/mongodb/keyfile:ro
    networks: [mongo-rs]

  mongo3:
    image: mongo:7.0
    container_name: mongo3
    ports: ["27019:27017"]
    command: ["--replSet", "rs0", "--keyFile", "/etc/mongodb/keyfile"]
    volumes:
      - mongo3_data:/data/db
      - ./keyfile:/etc/mongodb/keyfile:ro
    networks: [mongo-rs]

volumes:
  mongo1_data:
  mongo2_data:
  mongo3_data:

networks:
  mongo-rs:
    driver: bridge
```

```bash
# 启动
docker-compose -f docker-compose-replicaset.yml up -d

# 初始化副本集
docker exec -it mongo1 mongosh --eval '
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 },
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 1 }
  ]
})
'

# 验证副本集状态
docker exec -it mongo1 mongosh --eval 'rs.status()'
```

---

## 容器内存配置（重要）

WiredTiger 默认按**宿主机总内存**计算 Cache，容器内必须显式设置：

```yaml
services:
  mongodb:
    image: mongo:7.0
    command: ["--wiredTigerCacheSizeGB", "2"]  # 显式限制 Cache 大小
    deploy:
      resources:
        limits:
          memory: 4G      # 容器内存上限
```

---

## 数据持久化最佳实践

```bash
# ✅ 使用具名 Volume（推荐）
volumes:
  - mongodb_data:/data/db

# ✅ 绑定挂载到宿主机（便于备份）
volumes:
  - /data/mongodb:/data/db

# ❌ 不挂载 Volume（容器删除数据丢失，仅临时测试用）
```

---

## 容器化部署的限制与注意事项

| 问题 | 说明 | 解决方案 |
|------|------|----------|
| 网络性能 | 容器网络有额外开销 | 高性能场景用 `--network host` 或宿主机部署 |
| 内存计算 | WiredTiger 按宿主机内存计算 | 显式设置 `--wiredTigerCacheSizeGB` |
| 时区问题 | 容器默认 UTC | 添加 `-e TZ=Asia/Shanghai` |
| 文件描述符 | 容器默认限制较低 | `ulimits: nofile: 64000` |
| 透明大页 | THP 影响性能 | 宿主机关闭 THP |

---

## 总结

- 开发测试首选 Docker Compose，一键启动，一键销毁
- **生产环境慎用容器**，存储性能和网络延迟需充分评估
- 始终挂载 Volume，确保数据持久化
- 显式配置 `--wiredTigerCacheSizeGB`，避免 Cache 超出容器内存限制
- 副本集容器化需要 keyfile 认证，确保节点间通信安全

**下一步**：Kubernetes 有状态部署方案。
