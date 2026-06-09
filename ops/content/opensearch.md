# OpenSearch 部署运维指南

> **定位**：Elasticsearch 开源分支，AWS 主导，社区驱动
> **适用场景**：全文搜索、日志分析、可观测性、安全分析
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

OpenSearch 是 Elasticsearch 7.10 的开源分支（AWS 主导），核心 API 兼容 ES 7.x，新增安全分析、SQL/PPL 查询、通知插件等特性。

### 1.2 与 Elasticsearch 对比

| 维度 | OpenSearch | Elasticsearch |
|------|-----------|---------------|
| **许可证** | Apache 2.0 | Elastic License / SSPL |
| **安全插件** | 内置免费 | 需付费（基本版有限） |
| **SQL** | 内置 | 需付费 |
| **PPL** | 内置 | 无 |
| **API 兼容** | 兼容 ES 7.x | 8.x 不兼容 |
| **社区** | AWS + 社区 | Elastic 公司 |

### 1.3 适用场景

**最佳适用**：需要开源许可的场景、AWS 生态、日志分析、安全分析、可观测性

**不适用**：需要 ES 8.x 新特性（向量搜索增强）、已有 ES 8.x 集群

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name opensearch \
  -p 9200:9200 \
  -p 9600:9600 \
  -e discovery.type=single-node \
  -e OPENSEARCH_JAVA_OPTS="-Xms1g -Xmx1g" \
  -e DISABLE_SECURITY_PLUGIN=true \
  -v os-data:/usr/share/opensearch/data \
  --restart unless-stopped \
  opensearchproject/opensearch:2.15
```

### 2.2 Docker Compose 部署（3 节点 + Dashboard）

```yaml
# docker-compose.yml
version: '3.8'

services:
  os-1:
    image: opensearchproject/opensearch:2.15
    container_name: os-1
    hostname: os-1
    restart: unless-stopped
    ports:
      - "9200:9200"
    environment:
      cluster.name: prod-cluster
      node.name: os-1
      discovery.seed_hosts: os-1,os-2,os-3
      cluster.initial_cluster_manager_nodes: os-1,os-2,os-3
      OPENSEARCH_JAVA_OPTS: "-Xms2g -Xmx2g"
      DISABLE_SECURITY_PLUGIN: "false"
    volumes:
      - os-1-data:/usr/share/opensearch/data
    networks:
      - os-net

  os-2:
    image: opensearchproject/opensearch:2.15
    container_name: os-2
    hostname: os-2
    restart: unless-stopped
    environment:
      cluster.name: prod-cluster
      node.name: os-2
      discovery.seed_hosts: os-1,os-2,os-3
      cluster.initial_cluster_manager_nodes: os-1,os-2,os-3
      OPENSEARCH_JAVA_OPTS: "-Xms2g -Xmx2g"
      DISABLE_SECURITY_PLUGIN: "false"
    volumes:
      - os-2-data:/usr/share/opensearch/data
    networks:
      - os-net

  os-3:
    image: opensearchproject/opensearch:2.15
    container_name: os-3
    hostname: os-3
    restart: unless-stopped
    environment:
      cluster.name: prod-cluster
      node.name: os-3
      discovery.seed_hosts: os-1,os-2,os-3
      cluster.initial_cluster_manager_nodes: os-1,os-2,os-3
      OPENSEARCH_JAVA_OPTS: "-Xms2g -Xmx2g"
      DISABLE_SECURITY_PLUGIN: "false"
    volumes:
      - os-3-data:/usr/share/opensearch/data
    networks:
      - os-net

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

## 3. 配置文件

### 3.2 开发环境配置

```yaml
# opensearch.yml — 开发环境
cluster.name: dev-cluster
node.name: os-1
discovery.type: single-node
plugins.security.disabled: true
```

### 3.3 生产环境配置

```yaml
# opensearch.yml — 生产环境

cluster.name: prod-cluster
node.name: os-data-1
path.data: /data/opensearch
path.logs: /var/log/opensearch

# === 节点角色 ===
node.roles: [data, data_hot, data_content]

# === 集群发现 ===
discovery.seed_hosts: ["os-master-1","os-master-2","os-master-3"]
cluster.initial_cluster_manager_nodes: ["os-master-1","os-master-2","os-master-3"]

# === 网络 ===
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# === 安全（内置）===
plugins.security.ssl.http.enabled: true
plugins.security.ssl.transport.enabled: true
plugins.security.ssl.http.pemcert_filepath: certs/node.pem
plugins.security.ssl.http.pemkey_filepath: certs/node-key.pem
plugins.security.ssl.http.pemtrusted_filepath: certs/ca.pem
# 安全：仅首次初始化时用 true；初始化后必须改为 false，防止安全配置被篡改
plugins.security.allow_default_init_securityindex: false

# === 快照仓库 ===
path.repo: /data/opensearch/snapshots
# 逻辑：不配置 path.repo 则无法使用快照备份

# === 内存 ===
# OPENSEARCH_JAVA_OPTS: "-Xms16g -Xmx16g"
# 同 ES：堆设 50% 物理内存，不超过 31G
```

---

## 4. 调优

调优逻辑与 Elasticsearch 基本一致，核心参数相同：

- JVM 堆 ≤ 31G，留 50% 给 OS 文件系统缓存
- 分片大小 30-50GB
- `refresh_interval` 批量写入时增大
- Fielddata 缓存设上限

详见 [Elasticsearch 调优](elasticsearch.md#4-调优)

---

## 5. 运维

```bash
# 集群状态
curl https://localhost:9200/_cluster/health -u admin:Admin!Pass -k

# SQL 查询
curl https://localhost:9200/_sql -u admin:Admin!Pass -k \
  -H 'Content-Type: application/json' \
  -d '{"query": "SELECT * FROM orders WHERE amount > 100"}'

# PPL 查询
curl https://localhost:9200/_plugins/_ppl -u admin:Admin!Pass -k \
  -H 'Content-Type: application/json' \
  -d '{"query": "source=orders | where amount > 100 | stats avg(amount)"}'
```

---

## 6. 故障排查

与 Elasticsearch 故障排查方法一致，详见 [Elasticsearch 故障排查](elasticsearch.md#6-故障排查)

---

## 7. 参考资料

- [OpenSearch Documentation](https://opensearch.org/docs/)
- [OpenSearch Security Plugin](https://opensearch.org/docs/latest/security-plugin/)
- [OpenSearch SQL/PPL](https://opensearch.org/docs/latest/query-dsl/sql/)
