# 性能监控体系

## 概述

完善的监控体系是保障数据库稳定运行的基础。通过实时监控关键指标、设置合理告警、快速定位问题，可以提前发现和解决性能问题，避免系统故障。

**监控体系组成**：
- **指标采集**：收集系统和数据库指标
- **数据存储**：时序数据库存储
- **可视化**：Dashboard 展示
- **告警**：异常告警通知
- **日志分析**：慢查询、错误日志

---

## 监控架构

### 1. 监控方案

**Prometheus + Grafana**：
```
架构：
MySQL
  ↓ 暴露指标
mysqld_exporter
  ↓ 抓取
Prometheus（时序数据库）
  ↓ 查询
Grafana（可视化）
  ↓ 告警
Alertmanager
  ↓ 通知
Email/钉钉/企业微信
```

**部署**：
```yaml
# docker-compose.yml
version: '3'
services:
  mysqld-exporter:
    image: prom/mysqld-exporter
    environment:
      - DATA_SOURCE_NAME=exporter:password@(mysql:3306)/
    ports:
      - "9104:9104"
    restart: always

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    restart: always

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    restart: always

volumes:
  prometheus-data:
  grafana-data:
```

**Prometheus 配置**：
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysqld-exporter:9104']
        labels:
          instance: 'mysql-prod-01'
```

### 2. PMM（Percona Monitoring and Management）

**特点**：
```
✓ 专为 MySQL 设计
✓ 开箱即用
✓ 丰富的 Dashboard
✓ Query Analytics
✓ 慢查询分析

组件：
- PMM Server：监控服务端
- PMM Client：客户端采集器
```

**安装**：
```bash
# 安装 PMM Server（Docker）
docker run -d \
  -p 80:80 \
  -p 443:443 \
  --name pmm-server \
  -e METRICS_RETENTION=720h \
  -v pmm-data:/srv \
  percona/pmm-server:latest

# 安装 PMM Client
wget https://downloads.percona.com/downloads/pmm2/2.x.x/binary/tarball/pmm2-client-2.x.x.tar.gz
tar -xzf pmm2-client-2.x.x.tar.gz
cd pmm2-client-2.x.x
./install

# 配置客户端
pmm-admin config --server-url=https://admin:admin@pmm-server:443

# 添加 MySQL 监控
pmm-admin add mysql \
  --username=pmm \
  --password=password \
  --query-source=perfschema \
  mysql-prod-01
```

---

## 核心监控指标

### 1. 系统层面

**CPU**：
```
指标：
- CPU 使用率（User、System、Wait）
- 负载（Load Average）
- 上下文切换

告警阈值：
- CPU 使用率 > 80%
- Load Average > CPU 核数 × 0.7
```

**内存**：
```
指标：
- 内存使用率
- Swap 使用
- Buffer/Cache

告警阈值：
- 内存使用率 > 90%
- Swap 使用 > 0
```

**磁盘**：
```
指标：
- 磁盘使用率
- IOPS
- 吞吐量（MB/s）
- I/O 延迟
- I/O 队列长度

告警阈值：
- 磁盘使用率 > 85%
- I/O 延迟 > 50ms（HDD）
- I/O 延迟 > 10ms（SSD）
- I/O 队列长度 > 10
```

**网络**：
```
指标：
- 网络流量（入/出）
- 网络错误
- 网络丢包

告警阈值：
- 网络使用率 > 80%
- 丢包率 > 0.1%
```

### 2. MySQL 层面

**连接**：
```sql
-- 当前连接数
Threads_connected

-- 历史最大连接数
Max_used_connections

-- 连接使用率
Threads_connected / max_connections

-- 新建连接数
Connections

-- 中止连接数
Aborted_connects

-- 告警阈值：
-- 连接使用率 > 80%
-- 中止连接数持续增长
```

**查询**：
```sql
-- QPS（每秒查询数）
Questions

-- TPS（每秒事务数）
Com_commit + Com_rollback

-- 慢查询数
Slow_queries

-- SELECT 查询数
Com_select

-- INSERT/UPDATE/DELETE 数
Com_insert, Com_update, Com_delete

-- 告警阈值：
-- 慢查询 > 100/分钟
-- TPS 突降 > 50%
```

**InnoDB**：
```sql
-- Buffer Pool 命中率
(Innodb_buffer_pool_read_requests - Innodb_buffer_pool_reads) 
/ Innodb_buffer_pool_read_requests

-- 脏页比例
Innodb_buffer_pool_pages_dirty 
/ Innodb_buffer_pool_pages_total

-- 数据读写
Innodb_data_reads
Innodb_data_writes

-- 行操作
Innodb_rows_read
Innodb_rows_inserted
Innodb_rows_updated
Innodb_rows_deleted

-- 锁等待
Innodb_row_lock_waits
Innodb_row_lock_time_avg

-- 告警阈值：
-- Buffer Pool 命中率 < 95%
-- 脏页比例 > 75%
-- 锁等待时间 > 1秒
```

**复制**：
```sql
-- 主从延迟（秒）
Seconds_Behind_Master

-- I/O 线程状态
Slave_IO_Running

-- SQL 线程状态
Slave_SQL_Running

-- 告警阈值：
-- 主从延迟 > 60秒
-- I/O 或 SQL 线程停止
```

### 3. 业务层面

**核心业务指标**：
```
- 订单量
- 支付成功率
- 用户活跃度
- 接口响应时间
- 接口错误率

告警阈值：
- 核心业务指标突降 > 30%
- 接口错误率 > 1%
```

---

## 监控 Dashboard

### 1. 系统概览

**Grafana Dashboard**：
```json
{
  "dashboard": {
    "title": "MySQL Overview",
    "panels": [
      {
        "title": "QPS/TPS",
        "targets": [
          {
            "expr": "rate(mysql_global_status_questions[1m])"
          }
        ]
      },
      {
        "title": "Connections",
        "targets": [
          {
            "expr": "mysql_global_status_threads_connected"
          }
        ]
      },
      {
        "title": "Buffer Pool Hit Rate",
        "targets": [
          {
            "expr": "(rate(mysql_global_status_innodb_buffer_pool_read_requests[5m]) - rate(mysql_global_status_innodb_buffer_pool_reads[5m])) / rate(mysql_global_status_innodb_buffer_pool_read_requests[5m])"
          }
        ]
      }
    ]
  }
}
```

**导入 Dashboard**：
```
Grafana 官方 Dashboard：
- MySQL Overview (ID: 7362)
- MySQL InnoDB Metrics (ID: 7371)
- MySQL Replication (ID: 7371)

导入方法：
1. Grafana → Dashboards → Import
2. 输入 Dashboard ID
3. 选择数据源
4. 导入
```

### 2. 关键 Panel

**QPS/TPS**：
```promql
# QPS
rate(mysql_global_status_questions[1m])

# TPS
rate(mysql_global_status_com_commit[1m]) + 
rate(mysql_global_status_com_rollback[1m])
```

**Buffer Pool 命中率**：
```promql
(rate(mysql_global_status_innodb_buffer_pool_read_requests[5m]) - 
 rate(mysql_global_status_innodb_buffer_pool_reads[5m])) / 
rate(mysql_global_status_innodb_buffer_pool_read_requests[5m])
```

**慢查询**：
```promql
rate(mysql_global_status_slow_queries[1m])
```

**主从延迟**：
```promql
mysql_slave_status_seconds_behind_master
```

---

## 告警规则

### 1. Prometheus 告警

**告警规则配置**：
```yaml
# alerts.yml
groups:
  - name: mysql_alerts
    interval: 30s
    rules:
      # CPU 告警
      - alert: HighCPU
        expr: (100 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}%"

      # 内存告警
      - alert: HighMemory
        expr: (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}%"

      # 磁盘告警
      - alert: HighDiskUsage
        expr: (1 - node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage on {{ $labels.instance }}"
          description: "Disk usage is {{ $value }}%"

      # MySQL 连接数告警
      - alert: HighConnections
        expr: mysql_global_status_threads_connected / mysql_global_variables_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High MySQL connections on {{ $labels.instance }}"
          description: "Connection usage is {{ $value | humanizePercentage }}"

      # 慢查询告警
      - alert: HighSlowQueries
        expr: rate(mysql_global_status_slow_queries[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High slow queries on {{ $labels.instance }}"
          description: "Slow queries rate is {{ $value }}/s"

      # Buffer Pool 命中率告警
      - alert: LowBufferPoolHitRate
        expr: (rate(mysql_global_status_innodb_buffer_pool_read_requests[5m]) - rate(mysql_global_status_innodb_buffer_pool_reads[5m])) / rate(mysql_global_status_innodb_buffer_pool_read_requests[5m]) < 0.95
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low buffer pool hit rate on {{ $labels.instance }}"
          description: "Hit rate is {{ $value | humanizePercentage }}"

      # 主从延迟告警
      - alert: ReplicationLag
        expr: mysql_slave_status_seconds_behind_master > 60
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Replication lag on {{ $labels.instance }}"
          description: "Replication lag is {{ $value }} seconds"

      # 主从同步停止告警
      - alert: ReplicationStopped
        expr: mysql_slave_status_slave_io_running == 0 or mysql_slave_status_slave_sql_running == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Replication stopped on {{ $labels.instance }}"
          description: "IO or SQL thread is not running"
```

### 2. Alertmanager 配置

**通知配置**：
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'instance']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'

receivers:
  - name: 'default'
    email_configs:
      - to: 'team@example.com'
        from: 'alert@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alert@example.com'
        auth_password: 'password'

  - name: 'critical'
    email_configs:
      - to: 'oncall@example.com'
    webhook_configs:
      - url: 'https://oapi.dingtalk.com/robot/send?access_token=xxx'
```

**钉钉通知**：
```python
# 钉钉 Webhook
import requests
import json

def send_dingtalk_alert(title, text):
    webhook_url = "https://oapi.dingtalk.com/robot/send?access_token=xxx"
    
    data = {
        "msgtype": "markdown",
        "markdown": {
            "title": title,
            "text": text
        }
    }
    
    headers = {'Content-Type': 'application/json'}
    response = requests.post(webhook_url, data=json.dumps(data), headers=headers)
    return response.json()

# 使用
send_dingtalk_alert(
    "MySQL 告警",
    "## MySQL 慢查询告警\n\n"
    "**实例**: mysql-prod-01\n\n"
    "**告警内容**: 慢查询率 > 10/s\n\n"
    "**当前值**: 15/s\n\n"
    "**时间**: 2024-03-16 10:00:00"
)
```

---

## 慢查询分析

### 1. 慢查询日志

**配置**：
```ini
[mysqld]
slow_query_log = 1
slow_query_log_file = /data/mysql/log/slow.log
long_query_time = 1
log_queries_not_using_indexes = 1
```

**分析工具**：
```bash
# mysqldumpslow
mysqldumpslow -s t -t 10 /data/mysql/log/slow.log
# -s t: 按查询时间排序
# -t 10: 显示前 10 条

# pt-query-digest（推荐）
pt-query-digest /data/mysql/log/slow.log > slow_report.txt

# 输出包括：
# - 查询摘要
# - 执行时间统计
# - 锁等待时间
# - 返回行数
# - 扫描行数
# - 执行次数
```

### 2. Performance Schema

**慢查询统计**：
```sql
-- Top 10 慢查询
SELECT 
    DIGEST_TEXT,
    COUNT_STAR AS exec_count,
    ROUND(AVG_TIMER_WAIT / 1000000000000, 3) AS avg_sec,
    ROUND(MAX_TIMER_WAIT / 1000000000000, 3) AS max_sec,
    ROUND(SUM_TIMER_WAIT / 1000000000000, 3) AS total_sec
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = 'mydb'
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;
```

---

## 监控自动化

### 1. 监控脚本

**健康检查脚本**：
```bash
#!/bin/bash

# MySQL 健康检查

HOST="localhost"
USER="monitor"
PASS="password"

# 检查连接
if ! mysql -h$HOST -u$USER -p$PASS -e "SELECT 1" &>/dev/null; then
    echo "ERROR: Cannot connect to MySQL"
    exit 1
fi

# 检查主从状态
SLAVE_STATUS=$(mysql -h$HOST -u$USER -p$PASS -e "SHOW SLAVE STATUS\G")

if echo "$SLAVE_STATUS" | grep -q "Slave_IO_Running: No"; then
    echo "ERROR: Slave IO thread is not running"
    exit 1
fi

if echo "$SLAVE_STATUS" | grep -q "Slave_SQL_Running: No"; then
    echo "ERROR: Slave SQL thread is not running"
    exit 1
fi

LAG=$(echo "$SLAVE_STATUS" | grep "Seconds_Behind_Master" | awk '{print $2}')
if [ "$LAG" -gt 60 ]; then
    echo "WARNING: Replication lag is $LAG seconds"
fi

echo "OK: MySQL is healthy"
exit 0
```

**定时任务**：
```bash
# crontab -e

# 每分钟检查一次
* * * * * /opt/scripts/mysql_health_check.sh || /opt/scripts/send_alert.sh "MySQL Health Check Failed"

# 每小时收集慢查询
0 * * * * /usr/bin/pt-query-digest /data/mysql/log/slow.log > /data/reports/slow_$(date +\%Y\%m\%d_\%H).txt
```

### 2. 自动化告警

**Python 监控脚本**：
```python
#!/usr/bin/env python3
import mysql.connector
import time
import requests

def check_mysql_metrics():
    """检查 MySQL 指标"""
    conn = mysql.connector.connect(
        host='localhost',
        user='monitor',
        password='password'
    )
    cursor = conn.cursor()
    
    metrics = {}
    
    # 连接数
    cursor.execute("SHOW STATUS LIKE 'Threads_connected'")
    metrics['connections'] = int(cursor.fetchone()[1])
    
    # 慢查询
    cursor.execute("SHOW STATUS LIKE 'Slow_queries'")
    metrics['slow_queries'] = int(cursor.fetchone()[1])
    
    # Buffer Pool 命中率
    cursor.execute("SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests'")
    read_requests = int(cursor.fetchone()[1])
    
    cursor.execute("SHOW STATUS LIKE 'Innodb_buffer_pool_reads'")
    reads = int(cursor.fetchone()[1])
    
    metrics['buffer_pool_hit_rate'] = (read_requests - reads) / read_requests if read_requests > 0 else 0
    
    cursor.close()
    conn.close()
    
    return metrics

def check_and_alert():
    """检查并告警"""
    metrics = check_mysql_metrics()
    
    # 检查连接数
    if metrics['connections'] > 800:  # 假设 max_connections = 1000
        send_alert(f"High connections: {metrics['connections']}")
    
    # 检查 Buffer Pool 命中率
    if metrics['buffer_pool_hit_rate'] < 0.95:
        send_alert(f"Low buffer pool hit rate: {metrics['buffer_pool_hit_rate']:.2%}")

def send_alert(message):
    """发送告警"""
    # 发送到钉钉/邮件等
    print(f"ALERT: {message}")

if __name__ == '__main__':
    while True:
        check_and_alert()
        time.sleep(60)  # 每分钟检查一次
```

---

## 最佳实践

### 1. 监控清单

```
系统层面：
□ CPU 使用率
□ 内存使用率
□ Swap 使用
□ 磁盘使用率
□ 磁盘 IOPS
□ 网络流量

MySQL 层面：
□ QPS/TPS
□ 连接数
□ Buffer Pool 命中率
□ 慢查询数
□ 锁等待
□ 主从延迟

业务层面：
□ 核心业务指标
□ 接口响应时间
□ 错误率
```

### 2. 告警策略

```
告警级别：
- P0（紧急）：数据库宕机、主从停止
- P1（重要）：性能严重下降、磁盘快满
- P2（警告）：慢查询增多、连接数高
- P3（提示）：性能轻微下降

告警通知：
- P0：电话 + 短信 + 钉钉
- P1：短信 + 钉钉
- P2：钉钉 + 邮件
- P3：邮件

告警策略：
□ 设置合理阈值
□ 避免告警风暴
□ 告警去重
□ 告警聚合
□ 自动恢复通知
```

### 3. 运维规范

```
□ 建立性能基线
□ 定期审查监控数据
□ 优化告警规则
□ 定期测试告警
□ 文档化监控体系
□ 培训团队成员
□ 建立应急预案
```

---

## 参考资料

1. **监控工具**：
   - Prometheus: https://prometheus.io/
   - Grafana: https://grafana.com/
   - PMM: https://www.percona.com/software/database-tools/percona-monitoring-and-management

2. **推荐 Dashboard**：
   - MySQL Overview (Grafana ID: 7362)
   - MySQL InnoDB Metrics (Grafana ID: 7371)

3. **分析工具**：
   - pt-query-digest
   - mysqldumpslow
   - mysqltuner

4. **最佳实践**：
   - 全面监控（系统+数据库+业务）
   - 合理设置告警阈值
   - 自动化监控和告警
   - 定期审查和优化
   - 建立应急响应机制
   - 持续改进
