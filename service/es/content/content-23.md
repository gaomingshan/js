# 跨集群搜索与集群间通信

## 概述

跨集群搜索（Cross-Cluster Search, CCS）允许在一个集群中查询其他集群的数据，实现数据联邦查询。跨集群复制（Cross-Cluster Replication, CCR）实现集群间的数据同步，用于容灾和就近访问。

## 跨集群搜索（CCS）

### 配置远程集群

**在本地集群配置远程集群连接**：

```bash
# 方式1：通过 API 配置
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.cluster_one.seeds": [
      "192.168.1.101:9300",
      "192.168.1.102:9300"
    ],
    "cluster.remote.cluster_two.seeds": [
      "192.168.1.201:9300"
    ]
  }
}

# 方式2：通过 elasticsearch.yml 配置
cluster.remote.cluster_one.seeds: ["192.168.1.101:9300"]
cluster.remote.cluster_two.seeds: ["192.168.1.201:9300"]
```

**参数说明**：
- **cluster.remote.[集群名].seeds**：远程集群的种子节点
- **集群名**：自定义，用于跨集群查询时引用

### 查看远程集群

```bash
GET /_remote/info

# 响应
{
  "cluster_one": {
    "seeds": ["192.168.1.101:9300"],
    "connected": true,
    "num_nodes_connected": 3,
    "max_connections_per_cluster": 3,
    "initial_connect_timeout": "30s",
    "skip_unavailable": false
  },
  "cluster_two": {
    "seeds": ["192.168.1.201:9300"],
    "connected": true,
    "num_nodes_connected": 2
  }
}
```

### 跨集群查询

**基本语法**：

```bash
# 查询远程集群
GET /cluster_one:products/_search
{
  "query": {
    "match": {
      "name": "iPhone"
    }
  }
}

# 查询多个远程集群
GET /cluster_one:products,cluster_two:products/_search
{
  "query": {
    "match": {
      "name": "iPhone"
    }
  }
}

# 查询本地和远程集群
GET /products,cluster_one:products/_search
{
  "query": {
    "match": {
      "name": "iPhone"
    }
  }
}

# 使用通配符
GET /cluster_*:products/_search
{
  "query": {
    "match_all": {}
  }
}
```

### skip_unavailable 参数

**处理不可用的远程集群**：

```bash
# 配置跳过不可用集群
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.cluster_one.skip_unavailable": true
  }
}

# 查询时，如果 cluster_one 不可用，仅返回其他集群结果
GET /cluster_one:products,cluster_two:products/_search
{
  "query": { "match_all": {} }
}
```

**默认行为**（`skip_unavailable=false`）：

```
远程集群不可用 → 整个查询失败
```

**设置 `skip_unavailable=true`**：

```
远程集群不可用 → 跳过该集群，返回其他集群结果
```

### CCS 查询流程

```
本地集群（协调节点）
  ↓ 1. 解析查询
  ↓ 2. 识别远程集群
  ↓ 3. 并发发送查询到各集群
远程集群
  ↓ 4. 执行查询（Query Then Fetch）
  ↓ 5. 返回结果（文档ID + 得分）
本地集群
  ↓ 6. 合并所有集群结果
  ↓ 7. 全局排序
  ↓ 8. 取回完整文档（Fetch）
  ↓ 9. 返回给客户端
```

### CCS 性能优化

**1. 减少网络传输**：

```bash
# 仅返回需要的字段
GET /cluster_one:products/_search
{
  "query": { "match_all": {} },
  "_source": ["name", "price"],
  "size": 10
}
```

**2. 使用过滤器**：

```bash
# 在远程集群过滤数据
GET /cluster_one:products/_search
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "price": { "gte": 1000 } } }
      ]
    }
  }
}
```

**3. 控制远程集群数量**：

```
- 远程集群越多，网络开销越大
- 推荐：< 5 个远程集群
```

## 跨集群复制（CCR）

### CCR 概念

**主动-被动复制模式**：

```
Leader Index（主索引）：源集群
  ↓ 复制
Follower Index（从索引）：目标集群
```

**特点**：
- 单向复制（Leader → Follower）
- Follower 只读
- 异步复制

### 配置 CCR

**1. 配置远程集群**（同 CCS）：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.leader_cluster.seeds": [
      "192.168.1.101:9300"
    ]
  }
}
```

**2. 创建 Follower 索引**：

```bash
PUT /follower_products/_ccr/follow
{
  "remote_cluster": "leader_cluster",
  "leader_index": "products"
}

# 响应
{
  "follow_index_created": true,
  "follow_index_shards_acked": true,
  "index_following_started": true
}
```

### 自动跟随模式（Auto-Follow）

**自动复制匹配的索引**：

```bash
PUT /_ccr/auto_follow/my_auto_follow_pattern
{
  "remote_cluster": "leader_cluster",
  "leader_index_patterns": ["logs-*", "metrics-*"],
  "follow_index_pattern": "{{leader_index}}_replica"
}

# 效果：
# leader_cluster 中的 logs-2024.01.15
#   → 自动创建 logs-2024.01.15_replica
```

### 管理 Follower 索引

**暂停跟随**：

```bash
POST /follower_products/_ccr/pause_follow
```

**恢复跟随**：

```bash
POST /follower_products/_ccr/resume_follow
```

**停止跟随**（转为普通索引）：

```bash
POST /follower_products/_ccr/unfollow
```

### CCR 监控

```bash
# 查看 CCR 状态
GET /follower_products/_ccr/stats

{
  "follower_index": "follower_products",
  "leader_index": "products",
  "leader_cluster": "leader_cluster",
  "follower_stats": {
    "operations_read": 10000,
    "operations_written": 9998,
    "failed_read_requests": 0,
    "failed_write_requests": 2,
    "follower_checkpoint": 9998,
    "leader_checkpoint": 10000
  }
}

# 查看自动跟随模式
GET /_ccr/auto_follow
```

## 集群间通信

### 传输层（Transport Layer）

**节点间通信协议**：

```
协议：TCP
端口：9300（默认）
压缩：可选
加密：TLS/SSL
```

**配置**：

```yaml
# elasticsearch.yml
transport.port: 9300
transport.compress: true
transport.tcp.keep_alive: true
```

### 节点发现

**单播发现**：

```yaml
# elasticsearch.yml
discovery.seed_hosts:
  - 192.168.1.101
  - 192.168.1.102
  - 192.168.1.103
```

**跨集群发现**：

```yaml
# 本地集群节点
discovery.seed_hosts: ["192.168.1.101"]

# 远程集群连接
cluster.remote.cluster_one.seeds: ["192.168.2.101"]
```

### 网络配置

```yaml
# elasticsearch.yml

# HTTP 层
http.port: 9200
http.cors.enabled: true
http.cors.allow-origin: "*"

# 传输层
transport.port: 9300
transport.compress: true

# 网络绑定
network.host: 192.168.1.101
network.publish_host: 192.168.1.101
```

## 使用场景

### 场景1：多数据中心查询

**需求**：查询全球多个数据中心的数据

```
架构：
  US 集群：用户数据（美国）
  EU 集群：用户数据（欧洲）
  APAC 集群：用户数据（亚太）

查询：
  GET /us_cluster:users,eu_cluster:users,apac_cluster:users/_search
  {
    "query": {
      "match": {
        "email": "user@example.com"
      }
    }
  }
```

### 场景2：容灾备份

**需求**：主集群故障时，切换到备集群

```
架构：
  主集群（Primary）：生产数据
  备集群（Standby）：CCR 复制

配置：
  # 备集群配置 CCR
  PUT /_ccr/auto_follow/disaster_recovery
  {
    "remote_cluster": "primary_cluster",
    "leader_index_patterns": ["*"],
    "follow_index_pattern": "{{leader_index}}"
  }

故障切换：
  1. 检测主集群故障
  2. 停止 CCR 跟随（unfollow）
  3. 将备集群 Follower 索引转为可写
  4. 应用切换到备集群
```

### 场景3：就近访问

**需求**：用户访问最近的数据中心

```
架构：
  CN 集群：中国用户数据
  US 集群：美国用户数据

策略：
  - 中国用户 → 查询 CN 集群
  - 跨区域查询 → CCS
  - 数据同步 → CCR

查询：
  # 中国用户查询全球订单
  GET /orders,us_cluster:orders/_search
  {
    "query": {
      "term": { "user_id": "cn_user_123" }
    }
  }
```

### 场景4：读写分离

**需求**：写入主集群，读取从集群

```
架构：
  主集群：接收写入
  从集群1、2、3：CCR 复制，处理查询

配置：
  # 从集群配置 CCR
  PUT /orders/_ccr/follow
  {
    "remote_cluster": "primary_cluster",
    "leader_index": "orders"
  }

查询：
  - 写入 → 主集群
  - 查询 → 从集群（负载均衡）
```

## 安全配置

### TLS/SSL 加密

```yaml
# elasticsearch.yml

# 传输层加密
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: certs/elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: certs/elastic-certificates.p12

# HTTP 层加密
xpack.security.http.ssl.enabled: true
xpack.security.http.ssl.keystore.path: certs/http.p12
```

### 跨集群认证

```yaml
# 配置跨集群 API 密钥
PUT /_security/api_key
{
  "name": "cross-cluster-key",
  "role_descriptors": {
    "cross_cluster": {
      "cluster": ["all"],
      "indices": [
        {
          "names": ["*"],
          "privileges": ["read"]
        }
      ]
    }
  }
}

# 使用 API 密钥连接远程集群
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.remote_cluster.mode": "sniff",
    "cluster.remote.remote_cluster.seeds": ["192.168.1.101:9300"],
    "cluster.remote.remote_cluster.api_key": "encoded_api_key"
  }
}
```

## 监控与故障排查

### 监控远程集群连接

```bash
# 查看连接状态
GET /_remote/info

# 检查连接健康
GET /_cluster/health?wait_for_nodes=3&timeout=30s
```

### 常见问题

**问题1：远程集群连接失败**

```
原因：
  - 网络不通
  - 端口未开放（9300）
  - 集群名称错误

排查：
  telnet 192.168.1.101 9300
  GET /_remote/info
```

**问题2：CCS 查询超时**

```
原因：
  - 远程集群响应慢
  - 网络延迟高

解决：
  # 增加超时时间
  GET /remote:index/_search?timeout=60s
  {
    "query": { "match_all": {} }
  }
```

**问题3：CCR 复制延迟**

```
原因：
  - 网络带宽不足
  - Leader 集群写入量大

排查：
  GET /follower_index/_ccr/stats
  
优化：
  - 增加网络带宽
  - 调整 CCR 参数（max_read_request_size）
```

## 性能优化

### CCS 优化

```
1. 减少远程集群数量
2. 使用过滤器预过滤数据
3. 限制返回字段和文档数
4. 设置合理的超时时间
5. 考虑网络延迟
```

### CCR 优化

```bash
# 调整复制参数
PUT /follower_index/_ccr/follow
{
  "remote_cluster": "leader_cluster",
  "leader_index": "products",
  "max_read_request_size": "32mb",
  "max_outstanding_read_requests": 12,
  "max_write_buffer_count": 512
}
```

## 总结

**跨集群搜索（CCS）**：
- 配置远程集群（seeds）
- 查询语法：`cluster_name:index_name`
- skip_unavailable 处理不可用集群

**跨集群复制（CCR）**：
- Leader → Follower 单向复制
- Auto-Follow 自动复制
- 用于容灾和读写分离

**使用场景**：
- 多数据中心查询
- 容灾备份
- 就近访问
- 读写分离

**集群间通信**：
- 传输层：TCP 9300
- 节点发现：单播
- 安全：TLS/SSL + API 密钥

**性能优化**：
- 减少远程集群数量
- 过滤器预过滤
- 调整 CCR 参数

**监控与故障排查**：
- 监控连接状态
- 检查 CCR 复制延迟
- 排查网络问题

**下一步**：学习 JVM 配置与内存管理，优化 Elasticsearch 性能。
