# Elasticsearch 部署指南

> 版本：8.15 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|----------|----------|------|
| 单机（开发） | 4C 8G | 4C 16G | 100G SSD |
| 生产集群（3 Master + 3 Data） | Master: 2C 4G / Data: 4C 16G | Master: 4C 8G / Data: 8C 32G | 500G+ SSD/节点 |

---

## 2. 裸机安装（通用）

**注意：ES 不能用 root 运行，安装后会自动创建 elasticsearch 用户，所有操作在该用户下运行。**

```bash
# CentOS
sudo rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
cat > /etc/yum.repos.d/elasticsearch.repo << 'EOF'
[elasticsearch]
name=Elasticsearch repository
baseurl=https://artifacts.elastic.co/packages/8.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
EOF
sudo yum install -y elasticsearch-8.15.0

# Ubuntu
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update && sudo apt install -y elasticsearch=8.15.0

# 关键目录
# /etc/elasticsearch/elasticsearch.yml  配置
# /var/lib/elasticsearch/               数据
# /var/log/elasticsearch/               日志
# /usr/share/elasticsearch/             安装目录
```

---

## 3. 单机部署

**适用场景**：开发测试、本地验证、功能评估

### 配置文件（完整）

```bash
cat > /etc/elasticsearch/elasticsearch.yml << 'EOF'
cluster.name: dev-cluster
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node
xpack.security.enabled: false

# 内存锁定（必须，禁止 swap）
bootstrap.memory_lock: true

# 索引缓冲
indices.memory.index_buffer_size: 10%

# Fielddata 缓存（不超过 20%，防 OOM）
indices.fielddata.cache.size: 20%
EOF
```

```bash
# JVM 配置（/etc/elasticsearch/jvm.options.d/jvm.options）
-Xms1g
-Xmx1g
```

```bash
# 系统限制配置
cat >> /etc/security/limits.conf << 'EOF'
elasticsearch soft nofile 65535
elasticsearch hard nofile 65535
elasticsearch soft memlock unlimited
elasticsearch hard memlock unlimited
EOF
```

### 启动

```bash
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch
sudo journalctl -u elasticsearch -f
```

### 验证

```bash
curl http://localhost:9200
curl http://localhost:9200/_cluster/health?pretty
```

### Docker Compose

```yaml
services:
  es:
    image: elasticsearch:8.15.0
    container_name: es
    restart: unless-stopped
    ports:
      - "9200:9200"
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: "-Xms1g -Xmx1g"
      bootstrap.memory_lock: "true"
    volumes:
      - es-data:/usr/share/elasticsearch/data

volumes:
  es-data:
```

---

## 4. 集群部署

**适用场景**：生产环境、高可用、数据量 > 100G

### 节点规划

| 主机名 | IP | 角色 |
|--------|----|------|
| es-master-1 | 192.168.1.10 | master |
| es-master-2 | 192.168.1.11 | master |
| es-master-3 | 192.168.1.12 | master |
| es-data-1 | 192.168.1.20 | data_hot, data_content |
| es-data-2 | 192.168.1.21 | data_hot, data_content |
| es-data-3 | 192.168.1.22 | data_hot, data_content |

### 配置文件

**Data 节点配置**（`/etc/elasticsearch/elasticsearch.yml`）：

```bash
cat > /etc/elasticsearch/elasticsearch.yml << 'EOF'
cluster.name: prod-cluster
node.name: es-data-1          # 各节点按实际名称修改
path.data: /data/elasticsearch
path.logs: /var/log/elasticsearch

# === 节点角色 ===
node.roles: [data_hot, data_content]

# === 集群发现 ===
discovery.seed_hosts: ["es-master-1:9300", "es-master-2:9300", "es-master-3:9300"]
cluster.initial_master_nodes: ["es-master-1", "es-master-2", "es-master-3"]

# === 网络 ===
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# === 内存锁定（必须）===
bootstrap.memory_lock: true

# === 索引缓冲 ===
indices.memory.index_buffer_size: 10%

# === Fielddata 缓存（不超过 20%）===
indices.fielddata.cache.size: 20%

# === 安全 ===
xpack.security.enabled: true
xpack.security.http.ssl.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.authc.api_key.enabled: true
EOF
```

**Master 节点配置**（`/etc/elasticsearch/elasticsearch.yml`）：

```bash
cat > /etc/elasticsearch/elasticsearch.yml << 'EOF'
cluster.name: prod-cluster
node.name: es-master-1        # 各节点按实际名称修改
path.data: /data/elasticsearch
path.logs: /var/log/elasticsearch

# === 节点角色 ===
node.roles: [master]

# === 集群发现 ===
discovery.seed_hosts: ["es-master-1:9300", "es-master-2:9300", "es-master-3:9300"]
cluster.initial_master_nodes: ["es-master-1", "es-master-2", "es-master-3"]
cluster.election.strategy: stable

# === 网络 ===
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# === 内存锁定（必须）===
bootstrap.memory_lock: true

# === 安全 ===
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
EOF
```

```bash
# JVM 配置 — Master 节点堆可小一些
# /etc/elasticsearch/jvm.options.d/jvm.options
-Xms4g
-Xmx4g
```

```bash
# 系统限制（所有节点）
cat >> /etc/security/limits.conf << 'EOF'
elasticsearch soft nofile 65535
elasticsearch hard nofile 65535
elasticsearch soft memlock unlimited
elasticsearch hard memlock unlimited
EOF
```

### 启动

```bash
# 所有节点依次执行
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch

# 首次启动后建议移除 cluster.initial_master_nodes
# 编辑配置注释掉该行后重启，避免后续节点加入干扰
```

### 验证

```bash
curl -k https://localhost:9200/_cluster/health?pretty
curl -k https://localhost:9200/_cat/nodes?v
curl -k https://localhost:9200/_cat/shards?v
```

### Docker Compose

```yaml
services:
  es-master-1: &es-master
    image: elasticsearch:8.15.0
    container_name: es-master-1
    restart: unless-stopped
    environment:
      cluster.name: prod-cluster
      node.name: es-master-1
      node.roles: '["master"]'
      discovery.seed_hosts: es-master-1,es-master-2,es-master-3
      cluster.initial_master_nodes: es-master-1,es-master-2,es-master-3
      ES_JAVA_OPTS: "-Xms4g -Xmx4g"
      bootstrap.memory_lock: "true"
    volumes:
      - master-1-data:/usr/share/elasticsearch/data
    networks:
      - es-net

  es-master-2:
    <<: *es-master
    container_name: es-master-2
    environment:
      node.name: es-master-2
    volumes:
      - master-2-data:/usr/share/elasticsearch/data

  es-master-3:
    <<: *es-master
    container_name: es-master-3
    environment:
      node.name: es-master-3
    volumes:
      - master-3-data:/usr/share/elasticsearch/data

  es-data-1: &es-data
    image: elasticsearch:8.15.0
    container_name: es-data-1
    restart: unless-stopped
    environment:
      cluster.name: prod-cluster
      node.name: es-data-1
      node.roles: '["data_hot","data_content"]'
      discovery.seed_hosts: es-master-1,es-master-2,es-master-3
      cluster.initial_master_nodes: es-master-1,es-master-2,es-master-3
      ES_JAVA_OPTS: "-Xms16g -Xmx16g"
      bootstrap.memory_lock: "true"
    volumes:
      - data-1-data:/usr/share/elasticsearch/data
    networks:
      - es-net

  es-data-2:
    <<: *es-data
    container_name: es-data-2
    environment:
      node.name: es-data-2
    volumes:
      - data-2-data:/usr/share/elasticsearch/data

  es-data-3:
    <<: *es-data
    container_name: es-data-3
    environment:
      node.name: es-data-3
    volumes:
      - data-3-data:/usr/share/elasticsearch/data

volumes:
  master-1-data:
  master-2-data:
  master-3-data:
  data-1-data:
  data-2-data:
  data-3-data:

networks:
  es-net:
    driver: bridge
```

---

## 5. 运维速查

```bash
# 集群状态
curl -k https://localhost:9200/_cluster/health?pretty
curl -k https://localhost:9200/_cat/nodes?v
curl -k https://localhost:9200/_cat/shards?v

# 节点统计
curl -k https://localhost:9200/_nodes/stats?pretty

# 创建索引
curl -k -X PUT "https://localhost:9200/orders" -H 'Content-Type: application/json' -d '{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "orderId":  { "type": "keyword" },
      "amount":   { "type": "double" },
      "createdAt":{ "type": "date" }
    }
  }
}'

# 快照仓库 & 快照
curl -k -X PUT "https://localhost:9200/_snapshot/backup" -H 'Content-Type: application/json' -d '{
  "type": "fs",
  "settings": { "location": "/data/es-backup" }
}'
curl -k -X PUT "https://localhost:9200/_snapshot/backup/snap_$(date +%Y%m%d)?wait_for_completion=true"

# 滚动重启（无停机）
curl -k -X PUT "https://localhost:9200/_cluster/settings" -H 'Content-Type: application/json' -d '{
  "transient": { "cluster.routing.allocation.enable": "none" }
}'
# → 重启节点 → 恢复分配
curl -k -X PUT "https://localhost:9200/_cluster/settings" -H 'Content-Type: application/json' -d '{
  "transient": { "cluster.routing.allocation.enable": "all" }
}'
```

### 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| 集群状态 | `_cluster/health` | RED |
| JVM 堆使用率 | `_nodes/stats` | > 85% |
| 磁盘水位 | `_cat/allocation` | > 85% |
| 分片未分配 | `_cluster/health` | > 0 |

---

## 6. 常见故障

### 故障 1：集群 RED

**排查链路**：
```
RED → 有主分片未分配
  → _cluster/health?pretty
    → _cat/shards?v&h=index,shard,state,unassigned.reason
      → 节点故障 / 磁盘满 / 分片数超限 → 对症处理
```

### 故障 2：JVM 堆 OOM

**排查**：`_nodes/stats?filter_path=nodes.*.jvm` → 检查 heap_percent → 检查 Fielddata 缓存

**解决**：增大堆（≤ 31G）→ 限制 Fielddata 缓存 → 优化查询减少聚合

### 故障 3：磁盘水位超限

**排查**：`_cat/allocation?v`

**解决**：删除旧索引 → 增大磁盘 → 调整水位线（`cluster.routing.allocation.disk.watermark.*`）
