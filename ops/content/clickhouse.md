# ClickHouse 部署运维指南

> **定位**：开源列式 OLAP 数据库，实时分析性能之王
> **适用场景**：实时 OLAP、日志分析、BI 报表、时序分析、用户行为分析
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

ClickHouse 是开源的列式 OLAP 数据库，以向量化执行 + 稀疏索引实现亚秒级百亿行查询，支持 MergeTree 引擎族、分布式表、物化视图。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **列式存储** | 只读查询列，IO 极小 |
| **向量化执行** | SIMD 指令批量处理 |
| **MergeTree 引擎** | 按主键排序 + 稀疏索引 + 后台合并 |
| **分布式表** | Distributed 引擎跨节点查询 |
| **物化视图** | 自动预聚合，查询加速 |
| **实时写入** | 支持 INSERT 批量写入 |

### 1.3 适用场景

**最佳适用**：实时 OLAP、日志分析、BI 报表、时序分析、用户行为分析、漏斗分析

**不适用**：OLTP 事务（→ MySQL/PG）、全文搜索（→ ES）、高并发点查（→ Redis）

---

## 2. 部署

### 2.1 裸机部署

```bash
# CentOS
sudo yum install -y clickhouse-server clickhouse-client
sudo systemctl start clickhouse-server && sudo systemctl enable clickhouse-server
clickhouse-client

# 关键目录
# /etc/clickhouse-server/config.xml     主配置
# /var/lib/clickhouse/                   数据目录
# /var/log/clickhouse-server/            日志目录
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name clickhouse \
  -p 8123:8123 \
  -p 9000:9000 \
  -v ch-data:/var/lib/clickhouse \
  -v ch-logs:/var/log/clickhouse-server \
  -v ./conf/config.xml:/etc/clickhouse-server/config.xml \
  -v ./conf/users.xml:/etc/clickhouse-server/users.xml \
  --restart unless-stopped \
  clickhouse/clickhouse-server:24.8
```

### 2.3 Docker Compose 部署（2 分片 × 2 副本集群）

```yaml
# docker-compose.yml
version: '3.8'

services:
  ch-01:
    image: clickhouse/clickhouse-server:24.8
    container_name: ch-01
    hostname: ch-01
    restart: unless-stopped
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - ch-01-data:/var/lib/clickhouse
      - ./conf/config.xml:/etc/clickhouse-server/config.xml
      - ./conf/users.xml:/etc/clickhouse-server/users.xml
    networks:
      - ch-net

  ch-02:
    image: clickhouse/clickhouse-server:24.8
    container_name: ch-02
    hostname: ch-02
    restart: unless-stopped
    volumes:
      - ch-02-data:/var/lib/clickhouse
      - ./conf/config.xml:/etc/clickhouse-server/config.xml
      - ./conf/users.xml:/etc/clickhouse-server/users.xml
    networks:
      - ch-net

  ch-03:
    image: clickhouse/clickhouse-server:24.8
    container_name: ch-03
    hostname: ch-03
    restart: unless-stopped
    volumes:
      - ch-03-data:/var/lib/clickhouse
      - ./conf/config.xml:/etc/clickhouse-server/config.xml
      - ./conf/users.xml:/etc/clickhouse-server/users.xml
    networks:
      - ch-net

  ch-04:
    image: clickhouse/clickhouse-server:24.8
    container_name: ch-04
    hostname: ch-04
    restart: unless-stopped
    volumes:
      - ch-04-data:/var/lib/clickhouse
      - ./conf/config.xml:/etc/clickhouse-server/config.xml
      - ./conf/users.xml:/etc/clickhouse-server/users.xml
    networks:
      - ch-net

volumes:
  ch-01-data:
  ch-02-data:
  ch-03-data:
  ch-04-data:

networks:
  ch-net:
    driver: bridge
```

### 2.4 生产环境部署要点

**集群拓扑**：2 分片 × 2 副本 = 4 节点（最小高可用）。ZooKeeper 用于副本同步。

**安全清单**：用户密码（SHA256）、网络限制、TLS、RBAC（22.3+）

---

## 3. 配置文件

### 3.2 开发环境配置

```xml
<!-- config.xml — 开发环境 -->
<clickhouse>
    <logger>
        <level>debug</level>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### 3.3 生产环境配置

```xml
<!-- config.xml — 生产环境 -->
<clickhouse>
    <logger>
        <level>warning</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/error.log</errorlog>
        <size>100M</size>
        <count>10</count>
    </logger>

    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <interserver_http_port>9009</interserver_http_port>

    <!-- === 内存 === -->
    <!-- 逻辑：ClickHouse 可用内存 = 物理内存 - OS 保留 -->
    <!-- max_memory_usage 限制单查询内存，防止单查询 OOM -->
    <!-- 注意：max_server_memory_usage 单位是字节，不能填百分比 -->
    <!-- 正确方式：使用 max_server_memory_usage_to_ram_ratio 设置比例 -->
    <max_server_memory_usage_to_ram_ratio>0.9</max_server_memory_usage_to_ram_ratio>
    <!-- 服务器最大使用 90% 物理内存 -->

    <!-- === 并发 === -->
    <max_concurrent_queries>100</max_concurrent_queries>
    <max_connections>4096</max_connections>

    <!-- === ZooKeeper（副本同步必须） === -->
    <zookeeper>
        <node>
            <host>zk-1</host>
            <port>2181</port>
        </node>
        <node>
            <host>zk-2</host>
            <port>2181</port>
        </node>
        <node>
            <host>zk-3</host>
            <port>2181</port>
        </node>
    </zookeeper>

    <!-- === Macros（每个节点需不同配置，用于 ReplicatedMergeTree 标识） === -->
    <macros>
        <shard>01</shard>
        <replica>ch-01</replica>
    </macros>

    <!-- === 集群定义 === -->
    <remote_servers>
        <prod_cluster>
            <shard>
                <replica>
                    <host>ch-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>ch-02</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <replica>
                    <host>ch-03</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>ch-04</host>
                    <port>9000</port>
                </replica>
            </shard>
        </prod_cluster>
    </remote_servers>

    <!-- === Macros（每个节点配置不同）=== -->
    <!-- 逻辑：macros 用于分布式表区分分片/副本，每个节点必须唯一 -->
    <!-- ch-01: <macros><shard>01</shard><replica>ch-01</replica></macros> -->
    <!-- ch-02: <macros><shard>01</shard><replica>ch-02</replica></macros> -->
    <!-- ch-03: <macros><shard>02</shard><replica>ch-03</replica></macros> -->
    <!-- ch-04: <macros><shard>02</shard><replica>ch-04</replica></macros> -->
    <macros>
        <shard>01</shard>
        <replica>ch-01</replica>
    </macros>

    <!-- === MergeTree 设置 === -->
    <merge_tree>
        <max_suspicious_part_size_bytes>10G</max_suspicious_part_size_bytes>
        <parts_to_delay_insert>1500</parts_to_delay_insert>
        <max_parts_in_total>100000</max_parts_in_total>
    </merge_tree>

    <!-- === 安全 === -->
    <tls_server>
        <certificateFile>/etc/clickhouse-server/certs/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/certs/server.key</privateKeyFile>
        <caConfig>/etc/clickhouse-server/certs/ca.crt</caConfig>
    </tls_server>
</clickhouse>
```

**用户配置** `users.xml`：

```xml
<clickhouse>
    <profiles>
        <default>
            <max_memory_usage>10000000000</max_memory_usage>
            <!-- 单查询最大 10GB -->
            <max_execution_time>60</max_execution_time>
            <!-- 单查询最大 60 秒 -->
            <max_insert_block_size>1048576</max_insert_block_size>
            <!-- 此参数应放在 merge_tree 配置块中 -->
            <!-- 注意：insert_quorum 属于 MergeTree 设置，应放在 <merge_tree> 配置块中 -->
            <!-- <insert_quorum>2</insert_quorum> -->
            <!-- 写入仲裁：2 副本确认 -->
        </default>
        <readonly>
            <readonly>1</readonly>
            <max_memory_usage>5000000000</max_memory_usage>
        </readonly>
    </profiles>
    <users>
        <default>
            <password_sha256_hex>...</password_sha256_hex>
            <networks>
                <ip>::/0</ip>
            </networks>
            <profile>default</profile>
            <quota>default</quota>
        </default>
        <analyst>
            <password_sha256_hex>...</password_sha256_hex>
            <profile>readonly</profile>
        </analyst>
    </users>
</clickhouse>
```

---

## 4. 调优

### 4.1 内存子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_memory_usage` | 单查询内存 | 10G | 超过则查询被杀。设太小 → 大查询失败；设太大 → OOM |
| `max_server_memory_usage` | 服务器总内存 | 物理内存 90% | 限制 ClickHouse 总内存使用 |
| `max_bytes_before_external_group_by` | 外部 GROUP BY 阈值 | max_memory_usage 的 50% | 超过则溢写到磁盘，避免 OOM 但性能下降 |

### 4.2 IO 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `min_insert_block_size` | 最小写入块 | 1048576（默认） | 小批量写入合并压力大。建议批量 ≥ 10 万行 |
| `insert_quorum` | 写入仲裁 | 2 | 2 副本确认才返回成功。1 更快但可能丢数据 |
| `parts_to_delay_insert` | 延迟写入的 Part 数 | 1500 | Part 太多 → 合并跟不上 → 延迟新写入 |

### 4.3 查询子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_execution_time` | 查询超时 | 60s | 防止慢查询占资源。BI 查询可放宽 |
| `max_threads` | 单查询线程 | CPU 核数 | 增大可加速但占更多资源 |
| `priority` | 查询优先级 | 1（默认） | 低优先级查询在高负载时让出资源 |

### 4.4 容量规划

| 规模 | 节点 | CPU | 内存 | 磁盘 | 数据量 |
|------|------|-----|------|------|--------|
| 小型 | 1 | 8 核 | 32G | 500G SSD | < 1TB |
| 中型 | 4（2×2） | 16 核 | 64G | 2T SSD | 1-10TB |
| 大型 | 8+（4×2） | 32 核 | 128G | 10T NVMe | 10TB+ |

---

## 5. 运维

### 5.1 日常运维操作

```sql
-- 集群状态
SELECT * FROM system.clusters;

-- 节点状态
SELECT * FROM system.metrics;

-- 慢查询
SELECT query_id, query, query_duration_ms, memory_usage
FROM system.query_log
WHERE query_duration_ms > 5000
ORDER BY event_time DESC
LIMIT 10;

-- Part 合并状态
SELECT database, table, count() AS parts, sum(rows) AS total_rows
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY parts DESC;

-- 强制合并
OPTIMIZE TABLE orders FINAL;
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **Part 数** | `system.parts` | 单表 > 1000 |
| **合并队列** | `system.merges` | 积压 |
| **查询延迟** | `system.query_log` | P99 > 10s |
| **磁盘使用** | `system.disks` | > 80% |
| **ZK 连接** | `system.zookeeper_connection` | 断连 |

**Prometheus**：`http://ch-host:9363/metrics`

### 5.3 备份与恢复

```bash
# clickhouse-backup
clickhouse-backup create backup_$(date +%Y%m%d)
clickhouse-backup restore backup_20240101

# 或使用 freeze + 硬链接
clickhouse-client -q "ALTER TABLE orders FREEZE"
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：Part 过多导致写入变慢

**排查**：`system.parts` 查看 Part 数 → `system.merges` 查看合并状态

**解决**：增大 `min_insert_block_size` → 减少小批量写入 → 手动 `OPTIMIZE TABLE`

#### 故障 2：查询 OOM

**排查**：`system.query_log` 查看 `memory_usage`

**解决**：设 `max_memory_usage` → 优化查询（减少 GROUP BY 维度）→ 使用 `max_bytes_before_external_group_by`

#### 故障 3：副本不同步

**排查**：`system.replicas` 查看 `is_readonly` 和 `absolute_delay`

**解决**：检查 ZooKeeper 连接 → 重启落后节点 → `SYSTEM RESTART REPLICA`

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `system.query_log` | 慢查询分析 |
| `system.parts` | Part 状态 |
| `system.merges` | 合并状态 |
| `system.replicas` | 副本状态 |
| `system.metrics` | 实时指标 |
| `/metrics` | Prometheus |

---

## 7. 参考资料

- [ClickHouse Documentation](https://clickhouse.com/docs/)
- [ClickHouse Settings](https://clickhouse.com/docs/en/operations/settings/settings/)
- [ClickHouse Cluster](https://clickhouse.com/docs/en/architecture/replication/)
- [clickhouse-backup](https://github.com/Altinity/clickhouse-backup)
