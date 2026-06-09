# OpenSearch 部署指南

> 版本：2.15 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|----------|----------|------|
| 单机（开发） | 4C 8G | 4C 16G | 100G SSD |
| 生产集群（3 节点 + Dashboard） | 4C 16G | 8C 32G | 500G+ SSD/节点 |

---

## 2. 裸机安装（通用）

**注意：OpenSearch 不能用 root 运行，安装后会自动创建 opensearch 用户，所有操作在该用户下运行。**

```bash
# CentOS
cat > /etc/yum.repos.d/opensearch.repo << 'EOF'
[opensearch]
name=OpenSearch repository
baseurl=https://artifacts.opensearch.org/releases/bundle/opensearch/2.x/yum
gpgcheck=1
gpgkey=https://artifacts.opensearch.org/publickeys/opensearch.pgp
enabled=1
autorefresh=1
type=rpm-md
EOF
sudo yum install -y opensearch-2.15.0

# Ubuntu
curl -fsSL https://artifacts.opensearch.org/publickeys/opensearch.pgp | sudo gpg --dearmor -o /usr/share/keyrings/opensearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/opensearch-keyring.gpg] https://artifacts.opensearch.org/releases/bundle/opensearch/2.x/apt stable main" | sudo tee /etc/apt/sources.list.d/opensearch.list
sudo apt update && sudo apt install -y opensearch=2.15.0

# 关键目录
# /etc/opensearch/opensearch.yml        配置
# /var/lib/opensearch/                  数据
# /var/log/opensearch/                  日志
# /usr/share/opensearch/                安装目录
```

---

## 3. 单机部署

**适用场景**：开发测试、本地验证（关闭安全插件）

### 配置文件（完整）

```bash
cat > /etc/opensearch/opensearch.yml << 'EOF'
cluster.name: dev-cluster
node.name: node-1
path.data: /var/lib/opensearch
path.logs: /var/log/opensearch
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node

# 关闭安全插件（单机开发时）
plugins.security.disabled: true
EOF
```

```bash
# JVM 配置（/etc/opensearch/jvm.options.d/jvm.options）
-Xms1g
-Xmx1g
```

### 启动

```bash
sudo systemctl daemon-reload
sudo systemctl enable opensearch
sudo systemctl start opensearch
sudo journalctl -u opensearch -f
```

### 验证

```bash
curl http://localhost:9200
curl http://localhost:9200/_cluster/health?pretty
```

### Docker Compose

```yaml
services:
  os:
    image: opensearchproject/opensearch:2.15
    container_name: os
    restart: unless-stopped
    ports:
      - "9200:9200"
      - "9600:9600"
    environment:
      discovery.type: single-node
      DISABLE_SECURITY_PLUGIN: "true"
      OPENSEARCH_JAVA_OPTS: "-Xms1g -Xmx1g"
    volumes:
      - os-data:/usr/share/opensearch/data

volumes:
  os-data:
```

---

## 4. 集群部署

**适用场景**：生产环境、高可用、需要安全认证

**注意**：
- 所有节点的 `DISABLE_SECURITY_PLUGIN` 值**必须一致**（生产集群统一为 `false`），否则节点间无法通信
- `plugins.security.allow_default_init_securityindex: true` 仅首次初始化安全索引时使用，初始化后**必须改回 `false`**，防止安全配置被篡改

### 节点规划

| 主机名 | IP | 角色 |
|--------|----|------|
| os-1 | 192.168.1.10 | cluster_manager, data |
| os-2 | 192.168.1.11 | cluster_manager, data |
| os-3 | 192.168.1.12 | cluster_manager, data |
| os-dashboard | 192.168.1.30 | Dashboard |

### 配置文件

```bash
cat > /etc/opensearch/opensearch.yml << 'EOF'
cluster.name: prod-cluster
node.name: os-1                 # 各节点按实际名称修改
path.data: /var/lib/opensearch
path.logs: /var/log/opensearch
path.repo: /data/opensearch/snapshots

# === 节点角色 ===
node.roles: [cluster_manager, data]

# === 集群发现 ===
discovery.seed_hosts: ["os-1:9300", "os-2:9300", "os-3:9300"]
cluster.initial_cluster_manager_nodes: ["os-1", "os-2", "os-3"]

# === 网络 ===
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# === 安全（内置）===
plugins.security.ssl.http.enabled: true
plugins.security.ssl.transport.enabled: true
plugins.security.ssl.http.pemcert_filepath: /etc/opensearch/certs/node.pem
plugins.security.ssl.http.pemkey_filepath: /etc/opensearch/certs/node-key.pem
plugins.security.ssl.http.pemtrusted_filepath: /etc/opensearch/certs/ca.pem

# 安全索引初始化控制
# 首次部署：设置为 true → 重启 → 执行 securityadmin.sh
# 初始化完成后：必须改为 false（默认）
plugins.security.allow_default_init_securityindex: false
EOF
```

```bash
# JVM 配置
# /etc/opensearch/jvm.options.d/jvm.options
-Xms8g
-Xmx8g
```

```bash
# 首次部署安全索引初始化（仅在一个节点执行）
# securityadmin.sh 位于插件目录，需要配置好证书后运行
/usr/share/opensearch/plugins/opensearch-security/tools/securityadmin.sh \
  -cd /usr/share/opensearch/plugins/opensearch-security/securityconfig \
  -icl -nhnv \
  -cacert /etc/opensearch/certs/ca.pem \
  -cert /etc/opensearch/certs/admin.pem \
  -key /etc/opensearch/certs/admin-key.pem
```

### 启动

```bash
# 所有节点
sudo systemctl daemon-reload
sudo systemctl enable opensearch
sudo systemctl start opensearch
```

### 验证

```bash
# 集群健康
curl -k https://localhost:9200/_cluster/health?pretty -u admin:Admin!Pass

# 节点列表
curl -k https://localhost:9200/_cat/nodes?v -u admin:Admin!Pass

# 安全插件状态
curl -k https://localhost:9200/_plugins/_security/authinfo -u admin:Admin!Pass
```

### Docker Compose

```yaml
services:
  os-1: &os-node
    image: opensearchproject/opensearch:2.15
    container_name: os-1
    restart: unless-stopped
    environment:
      cluster.name: prod-cluster
      node.name: os-1
      node.roles: '["cluster_manager","data"]'
      discovery.seed_hosts: os-1,os-2,os-3
      cluster.initial_cluster_manager_nodes: os-1,os-2,os-3
      DISABLE_SECURITY_PLUGIN: "false"
      OPENSEARCH_JAVA_OPTS: "-Xms8g -Xmx8g"
      plugins.security.allow_default_init_securityindex: "false"
    volumes:
      - os-1-data:/usr/share/opensearch/data
    networks:
      - os-net

  os-2:
    <<: *os-node
    container_name: os-2
    environment:
      node.name: os-2
    volumes:
      - os-2-data:/usr/share/opensearch/data

  os-3:
    <<: *os-node
    container_name: os-3
    environment:
      node.name: os-3
    volumes:
      - os-3-data:/usr/share/opensearch/data

  dashboard:
    image: opensearchproject/opensearch-dashboards:2.15
    container_name: os-dashboard
    restart: unless-stopped
    ports:
      - "5601:5601"
    environment:
      OPENSEARCH_HOSTS: '["https://os-1:9200"]'
    depends_on:
      - os-1
    networks:
      - os-net

volumes:
  os-1-data:
  os-2-data:
  os-3-data:

networks:
  os-net:
    driver: bridge
```

---

## 5. 运维速查

```bash
# 集群状态（需认证）
curl -k https://localhost:9200/_cluster/health?pretty -u admin:Admin!Pass
curl -k https://localhost:9200/_cat/nodes?v -u admin:Admin!Pass
curl -k https://localhost:9200/_cat/shards?v -u admin:Admin!Pass

# SQL 查询
curl -k https://localhost:9200/_sql -u admin:Admin!Pass \
  -H 'Content-Type: application/json' \
  -d '{"query": "SELECT * FROM orders LIMIT 10"}'

# PPL 查询
curl -k https://localhost:9200/_plugins/_ppl -u admin:Admin!Pass \
  -H 'Content-Type: application/json' \
  -d '{"query": "source=orders | stats count()"}'

# 修改密码
curl -k -X PUT "https://localhost:9200/_plugins/_security/api/internalusers/admin" \
  -u admin:Admin!Pass \
  -H 'Content-Type: application/json' \
  -d '{"password": "New!Pass123"}'

# 快照仓库
curl -k -X PUT "https://localhost:9200/_snapshot/backup" -u admin:Admin!Pass \
  -H 'Content-Type: application/json' \
  -d '{"type": "fs", "settings": {"location": "/data/opensearch/snapshots"}}'
```

### 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| 集群状态 | `_cluster/health` | RED |
| JVM 堆使用率 | `_nodes/stats` | > 85% |
| 磁盘水位 | `_cat/allocation` | > 85% |
| 安全插件 | `_plugins/_security/health` | 异常 |

---

## 6. 常见故障

### 故障 1：安全索引未初始化

**现象**：连接被拒绝 / 认证失败

**解决**：
1. 设置 `plugins.security.allow_default_init_securityindex: true`
2. 重启该节点
3. 执行 `securityadmin.sh` 初始化安全索引
4. 改回 `false`，重启所有节点

### 故障 2：DISABLE_SECURITY_PLUGIN 不一致

**现象**：节点间无法通信，集群无法形成

**解决**：确保所有节点的 `DISABLE_SECURITY_PLUGIN` 值一致（全部 `false` 或全部 `true`）

### 故障 3：集群未形成

**排查**：检查 `discovery.seed_hosts` 和 `cluster.initial_cluster_manager_nodes` → 检查节点间网络连通性（9300 端口）→ 检查防火墙规则
