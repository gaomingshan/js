# ClickHouse 部署指南

> 版本：24.8 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 最低 | 推荐 |
|------|------|------|
| CPU | 4 核 | 16 核+ |
| 内存 | 8G | 64G+ |
| 磁盘 | 100G SSD | 2T+ NVMe |
| 系统 | CentOS 7.9+ / Ubuntu 22.04+ | |

**系统参数**：
```bash
cat >> /etc/security/limits.conf << 'EOF'
clickhouse  soft  nofile  262144
clickhouse  hard  nofile  262144
clickhouse  soft  nproc   32768
clickhouse  hard  nproc   32768
EOF
```

---

## 2. 裸机安装（通用）

```bash
# CentOS
yum install -y clickhouse-server clickhouse-client
systemctl start clickhouse-server && systemctl enable clickhouse-server

# Ubuntu
apt install -y clickhouse-server clickhouse-client
systemctl start clickhouse-server && systemctl enable clickhouse-server

# 关键路径
# /etc/clickhouse-server/config.xml      主配置
# /etc/clickhouse-server/users.xml       用户配置
# /var/lib/clickhouse/                   数据目录
# /var/log/clickhouse-server/            日志目录

# 验证
clickhouse-client --query "SELECT version()"
```

---

## 3. 单机部署

### 适用场景

开发测试、OLAP 查询分析、日志存储查询（数据量 < 1TB）。

### 配置

```bash
cat > /etc/clickhouse-server/config.xml << 'EOF'
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
    <max_server_memory_usage>30064771072</max_server_memory_usage>
    <max_concurrent_queries>100</max_concurrent_queries>
    <max_connections>4096</max_connections>
    <merge_tree>
        <max_suspicious_part_size_bytes>10737418240</max_suspicious_part_size_bytes>
        <parts_to_delay_insert>1500</parts_to_delay_insert>
        <max_parts_in_total>100000</max_parts_in_total>
    </merge_tree>
</clickhouse>
EOF
```

> **注意**：`max_server_memory_usage` 单位是字节。28G = 28 × 1024³ = 30064771072。

**用户配置**：
```bash
cat > /etc/clickhouse-server/users.xml << 'EOF'
<clickhouse>
    <profiles>
        <default>
            <max_memory_usage>10000000000</max_memory_usage>
            <max_execution_time>60</max_execution_time>
            <max_insert_block_size>1048576</max_insert_block_size>
        </default>
        <readonly>
            <readonly>1</readonly>
            <max_memory_usage>5000000000</max_memory_usage>
        </readonly>
    </profiles>
    <users>
        <default>
            <password></password>
            <networks><ip>::/0</ip></networks>
            <profile>default</profile>
            <quota>default</quota>
        </default>
        <analyst>
            <password_sha256_hex>...</password_sha256_hex>
            <profile>readonly</profile>
        </analyst>
    </users>
</clickhouse>
EOF
```

### 启动

```bash
systemctl restart clickhouse-server
```

### 验证

```bash
clickhouse-client --query "SELECT 1"
# 创建测试表
clickhouse-client --query "
CREATE TABLE test.orders (id UInt64, amount Float64, ts DateTime) ENGINE = MergeTree()
ORDER BY ts;
INSERT INTO test.orders VALUES (1, 99.9, now());
SELECT * FROM test.orders;
"
```

### Docker Compose

```yaml
services:
  clickhouse:
    image: clickhouse/clickhouse-server:24.8
    container_name: clickhouse
    restart: unless-stopped
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - ch-data:/var/lib/clickhouse
      - ./config.xml:/etc/clickhouse-server/config.xml
      - ./users.xml:/etc/clickhouse-server/users.xml

volumes:
  ch-data:
```

---

## 4. 集群部署（3 节点）

### 适用场景

生产高可用，数据量 1TB+，查询高并发，需要分布式表。

### 节点规划

| 节点 | 主机名 | IP | Shard | 角色 |
|------|--------|-----|-------|------|
| 1 | ch-01 | 10.0.0.1 | shard-01 | replica-1 |
| 2 | ch-02 | 10.0.0.2 | shard-01 | replica-2 |
| 3 | ch-03 | 10.0.0.3 | shard-02 | replica-1 |

ZooKeeper：3 节点（zk-1/2/3:2181），用于副本同步。

### 配置

**集群配置** `config.xml`（各节点通用部分）：
```bash
cat > /etc/clickhouse-server/config.xml << 'EOF'
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
    <max_server_memory_usage>30064771072</max_server_memory_usage>
    <max_concurrent_queries>100</max_concurrent_queries>
    <max_connections>4096</max_connections>

    <zookeeper>
        <node><host>zk-1</host><port>2181</port></node>
        <node><host>zk-2</host><port>2181</port></node>
        <node><host>zk-3</host><port>2181</port></node>
    </zookeeper>

    <remote_servers>
        <prod_cluster>
            <shard>
                <replica><host>ch-01</host><port>9000</port></replica>
                <replica><host>ch-02</host><port>9000</port></replica>
            </shard>
            <shard>
                <replica><host>ch-03</host><port>9000</port></replica>
            </shard>
        </prod_cluster>
    </remote_servers>

    <merge_tree>
        <max_suspicious_part_size_bytes>10737418240</max_suspicious_part_size_bytes>
        <parts_to_delay_insert>1500</parts_to_delay_insert>
        <max_parts_in_total>100000</max_parts_in_total>
    </merge_tree>
</clickhouse>
EOF
```

**Macros 配置**（每个节点不同，用于 ReplicatedMergeTree 标识）：

`ch-01`：
```xml
    <macros>
        <shard>shard-01</shard>
        <replica>ch-01</replica>
    </macros>
```

`ch-02`：
```xml
    <macros>
        <shard>shard-01</shard>
        <replica>ch-02</replica>
    </macros>
```

`ch-03`：
```xml
    <macros>
        <shard>shard-02</shard>
        <replica>ch-03</replica>
    </macros>
```

将各自 macros 块插入 `<clickhouse>` 根节点内（放在 `zookeeper` 之后即可）。

### 启动

```bash
# 各节点执行
systemctl restart clickhouse-server
```

### 验证

```bash
clickhouse-client --query "SELECT * FROM system.clusters"
# 创建分布式表测试
clickhouse-client --query "
CREATE TABLE logs_local ON CLUSTER prod_cluster (
  id UInt64, message String, ts DateTime
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/logs_local', '{replica}')
ORDER BY ts;

CREATE TABLE logs_all ON CLUSTER prod_cluster
ENGINE = Distributed(prod_cluster, default, logs_local, rand());

INSERT INTO logs_all VALUES (1, 'hello', now());
SELECT * FROM logs_all;
"
```

### Docker Compose

```yaml
services:
  zk-1:
    image: zookeeper:3.9
    container_name: zk-1
    hostname: zk-1
  zk-2:
    image: zookeeper:3.9
    container_name: zk-2
    hostname: zk-2
  zk-3:
    image: zookeeper:3.9
    container_name: zk-3
    hostname: zk-3

  ch-01:
    image: clickhouse/clickhouse-server:24.8
    container_name: ch-01
    hostname: ch-01
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - ch-01-data:/var/lib/clickhouse
      - ./config-ch-01.xml:/etc/clickhouse-server/config.xml
      - ./users.xml:/etc/clickhouse-server/users.xml

  ch-02:
    image: clickhouse/clickhouse-server:24.8
    container_name: ch-02
    hostname: ch-02
    volumes:
      - ch-02-data:/var/lib/clickhouse
      - ./config-ch-02.xml:/etc/clickhouse-server/config.xml
      - ./users.xml:/etc/clickhouse-server/users.xml

  ch-03:
    image: clickhouse/clickhouse-server:24.8
    container_name: ch-03
    hostname: ch-03
    volumes:
      - ch-03-data:/var/lib/clickhouse
      - ./config-ch-03.xml:/etc/clickhouse-server/config.xml
      - ./users.xml:/etc/clickhouse-server/users.xml

volumes:
  ch-01-data:  ch-02-data:  ch-03-data:
```

---

## 5. 运维速查

```sql
-- 集群状态
SELECT * FROM system.clusters;
SELECT * FROM system.macros;

-- 节点指标
SELECT * FROM system.metrics;
SELECT database, table, count() AS parts, sum(rows) AS total_rows
FROM system.parts WHERE active GROUP BY database, table ORDER BY parts DESC;

-- 慢查询
SELECT query_id, query, query_duration_ms, memory_usage, read_rows
FROM system.query_log
WHERE query_duration_ms > 5000 AND event_time > now() - INTERVAL 1 HOUR
ORDER BY query_duration_ms DESC LIMIT 10;

-- 合并状态
SELECT database, table, count() FROM system.merges GROUP BY database, table;

-- 副本状态
SELECT database, table, is_readonly, absolute_delay FROM system.replicas;

-- 强制合并
OPTIMIZE TABLE db.table FINAL;

-- 查询终止
KILL QUERY WHERE query_id = 'xxx';
```

**Prometheus 指标**：`http://ch-host:9363/metrics`

**备份**：
```bash
clickhouse-backup create backup_$(date +%Y%m%d)
clickhouse-backup restore backup_20240101
```

---

## 6. 常见故障

### 故障 1：Part 过多写入变慢

```sql
-- 检查
SELECT database, table, count() FROM system.parts WHERE active GROUP BY database, table;
-- 解决
OPTIMIZE TABLE db.table FINAL;
-- 预防：增大 min_insert_block_size，减少小批量写入
```

### 故障 2：查询 OOM

```sql
-- 检查
SELECT query_id, query, memory_usage, query_duration_ms
FROM system.query_log WHERE query_duration_ms > 5000 ORDER BY memory_usage DESC LIMIT 10;
-- 解决
-- 设置 max_memory_usage、启用外部 GROUP BY（max_bytes_before_external_group_by）
```

### 故障 3：副本不同步

```sql
SELECT database, table, is_readonly, absolute_delay FROM system.replicas;
-- 解决
-- 检查 ZooKeeper 连接 → SYSTEM RESTART REPLICA table;
```
