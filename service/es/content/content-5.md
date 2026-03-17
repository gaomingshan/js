# 单节点安装与配置

## 概述

本章介绍如何在单机环境快速搭建 Elasticsearch 开发环境，涵盖 Linux、Windows、macOS 和 Docker 四种安装方式，以及核心配置文件的详解和常见问题排查。

## 环境准备

### JDK 版本要求

Elasticsearch 内置了 OpenJDK，但如果需要使用系统 JDK，版本要求如下：

| ES 版本 | JDK 版本 |
|---------|---------|
| 7.x | JDK 11+ |
| 8.x | JDK 17+ |

**检查 Java 版本**：

```bash
java -version

# 输出示例
openjdk version "17.0.1" 2021-10-19
OpenJDK Runtime Environment (build 17.0.1+12-39)
OpenJDK 64-Bit Server VM (build 17.0.1+12-39, mixed mode, sharing)
```

### 系统要求

**最小配置**（开发环境）：
- CPU：2 核
- 内存：2 GB
- 磁盘：10 GB

**推荐配置**（生产环境）：
- CPU：4 核+
- 内存：16 GB+
- 磁盘：SSD，容量根据数据量规划

## Linux 安装

### 1. 下载 Elasticsearch

```bash
# 下载 8.x 版本（示例）
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.12.0-linux-x86_64.tar.gz

# 解压
tar -xzf elasticsearch-8.12.0-linux-x86_64.tar.gz
cd elasticsearch-8.12.0
```

### 2. 创建用户（非 root 运行）

**安全要求**：Elasticsearch 不能以 root 用户运行。

```bash
# 创建 elasticsearch 用户
sudo useradd elasticsearch

# 授权目录
sudo chown -R elasticsearch:elasticsearch /path/to/elasticsearch-8.12.0

# 切换用户
su - elasticsearch
```

### 3. 配置文件修改

编辑 `config/elasticsearch.yml`：

```yaml
# 集群名称
cluster.name: my-dev-cluster

# 节点名称
node.name: node-1

# 数据存储路径
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# 网络配置
network.host: 0.0.0.0         # 监听所有网络接口
http.port: 9200               # HTTP API 端口
transport.port: 9300          # 节点通信端口

# 单节点模式（开发环境）
discovery.type: single-node

# 安全配置（8.x 默认开启）
xpack.security.enabled: false  # 开发环境可关闭
```

### 4. JVM 配置

编辑 `config/jvm.options`：

```
# 堆内存配置（根据可用内存调整）
-Xms2g
-Xmx2g

# GC 配置（默认 G1GC）
-XX:+UseG1GC
```

**堆内存配置原则**：
- 设置 Xms = Xmx，避免运行时调整
- 不超过物理内存的 50%（留给文件系统缓存）
- 不超过 32GB（压缩指针限制）

### 5. 系统参数调整

编辑 `/etc/security/limits.conf`：

```bash
# 文件描述符限制
elasticsearch soft nofile 65536
elasticsearch hard nofile 65536

# 进程数限制
elasticsearch soft nproc 4096
elasticsearch hard nproc 4096
```

编辑 `/etc/sysctl.conf`：

```bash
# 虚拟内存区域限制
vm.max_map_count=262144
```

应用配置：

```bash
sudo sysctl -p
```

### 6. 启动 Elasticsearch

```bash
# 前台启动（查看日志）
./bin/elasticsearch

# 后台启动
./bin/elasticsearch -d -p pid

# 查看日志
tail -f logs/my-dev-cluster.log
```

### 7. 验证安装

```bash
# 检查健康状态
curl http://localhost:9200

# 输出示例
{
  "name" : "node-1",
  "cluster_name" : "my-dev-cluster",
  "cluster_uuid" : "abc123...",
  "version" : {
    "number" : "8.12.0",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "...",
    "build_date" : "2024-01-15T...",
    "build_snapshot" : false,
    "lucene_version" : "9.9.1",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}

# 检查集群健康
curl http://localhost:9200/_cluster/health?pretty

{
  "cluster_name" : "my-dev-cluster",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  "active_primary_shards" : 0,
  "active_shards" : 0,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 100.0
}
```

## Windows 安装

### 1. 下载解压

下载 Windows 版本的 zip 包并解压到目标目录。

### 2. 修改配置

编辑 `config\elasticsearch.yml`（同 Linux）。

### 3. 启动

```cmd
# 双击启动
bin\elasticsearch.bat

# 或命令行启动
cd elasticsearch-8.12.0
bin\elasticsearch.bat
```

### 4. 安装为 Windows 服务（可选）

```cmd
# 安装服务
bin\elasticsearch-service.bat install

# 启动服务
bin\elasticsearch-service.bat start

# 停止服务
bin\elasticsearch-service.bat stop
```

## macOS 安装

### 使用 Homebrew

```bash
# 安装
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full

# 启动
brew services start elastic/tap/elasticsearch-full

# 停止
brew services stop elastic/tap/elasticsearch-full
```

### 手动安装

与 Linux 安装步骤相同。

## Docker 安装

### 单节点开发环境

```bash
# 拉取镜像
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.12.0

# 运行容器
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0

# 查看日志
docker logs -f elasticsearch

# 验证
curl http://localhost:9200
```

### 持久化数据

```bash
# 创建数据卷
docker volume create es-data

# 运行容器并挂载数据卷
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -v es-data:/usr/share/elasticsearch/data \
  docker.elastic.co/elasticsearch/elasticsearch:8.12.0
```

### Docker Compose

```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - es-data:/usr/share/elasticsearch/data
    networks:
      - elastic

volumes:
  es-data:

networks:
  elastic:
    driver: bridge
```

启动：

```bash
docker-compose up -d
```

## 核心配置文件详解

### elasticsearch.yml

**集群配置**：

```yaml
# 集群名称（同名节点才能加入集群）
cluster.name: my-application

# 节点名称（集群内唯一）
node.name: node-1

# 节点角色
node.roles: [ master, data, ingest ]
```

**路径配置**：

```yaml
# 数据目录（可配置多个路径）
path.data: /var/lib/elasticsearch
# path.data: ["/path/data1", "/path/data2"]

# 日志目录
path.logs: /var/log/elasticsearch
```

**网络配置**：

```yaml
# 绑定地址（0.0.0.0 监听所有接口）
network.host: 0.0.0.0

# HTTP 端口
http.port: 9200

# 节点通信端口
transport.port: 9300

# CORS 配置（开发环境）
http.cors.enabled: true
http.cors.allow-origin: "*"
```

**发现配置**：

```yaml
# 单节点模式
discovery.type: single-node

# 多节点模式（集群环境）
discovery.seed_hosts: ["192.168.1.100", "192.168.1.101"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]
```

**安全配置**：

```yaml
# X-Pack Security（8.x 默认开启）
xpack.security.enabled: false

# TLS/SSL
xpack.security.transport.ssl.enabled: false
xpack.security.http.ssl.enabled: false
```

### jvm.options

**堆内存**：

```
# 设置相同的最小和最大堆内存
-Xms2g
-Xmx2g
```

**GC 配置**：

```
# 使用 G1GC（默认）
-XX:+UseG1GC

# GC 日志
-Xlog:gc*,gc+age=trace,safepoint:file=logs/gc.log:utctime,pid,tags:filecount=32,filesize=64m
```

**其他 JVM 参数**：

```
# 禁用 Swap
-XX:+AlwaysPreTouch

# OOM 时生成 Heap Dump
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=data
```

### log4j2.properties

**日志级别配置**：

```properties
# Root 日志级别
rootLogger.level = info

# 慢查询日志
logger.index_search_slowlog_rolling.name = index.search.slowlog
logger.index_search_slowlog_rolling.level = trace

# 慢索引日志
logger.index_indexing_slowlog.name = index.indexing.slowlog
logger.index_indexing_slowlog.level = trace
```

## 启动与验证

### Health Check API

```bash
# 集群健康状态
curl -X GET "localhost:9200/_cluster/health?pretty"

# 节点信息
curl -X GET "localhost:9200/_nodes?pretty"

# 查看所有索引
curl -X GET "localhost:9200/_cat/indices?v"
```

### 测试索引与查询

```bash
# 创建索引
curl -X PUT "localhost:9200/test"

# 索引文档
curl -X POST "localhost:9200/test/_doc/1" -H 'Content-Type: application/json' -d'
{
  "title": "Elasticsearch Tutorial",
  "content": "This is a test document"
}
'

# 查询文档
curl -X GET "localhost:9200/test/_doc/1?pretty"

# 搜索
curl -X GET "localhost:9200/test/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "title": "elasticsearch"
    }
  }
}
'
```

## Kibana 安装与 Dev Tools

### 安装 Kibana

**Linux / macOS**：

```bash
# 下载
wget https://artifacts.elastic.co/downloads/kibana/kibana-8.12.0-linux-x86_64.tar.gz

# 解压
tar -xzf kibana-8.12.0-linux-x86_64.tar.gz
cd kibana-8.12.0
```

**配置**（`config/kibana.yml`）：

```yaml
# Kibana 端口
server.port: 5601

# 绑定地址
server.host: "0.0.0.0"

# Elasticsearch 地址
elasticsearch.hosts: ["http://localhost:9200"]
```

**启动**：

```bash
./bin/kibana
```

**访问**：`http://localhost:5601`

### Docker 安装 Kibana

```bash
docker run -d \
  --name kibana \
  --link elasticsearch:elasticsearch \
  -p 5601:5601 \
  docker.elastic.co/kibana/kibana:8.12.0
```

### 使用 Dev Tools

访问 Kibana → Management → Dev Tools

```
# 在 Console 中执行命令（无需 curl）
GET /_cluster/health

PUT /products
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "price": { "type": "double" }
    }
  }
}

POST /products/_doc
{
  "name": "iPhone 14",
  "price": 7999
}

GET /products/_search
{
  "query": {
    "match_all": {}
  }
}
```

## 常见启动问题排查

### 1. 内存不足

**错误信息**：

```
Java HotSpot(TM) 64-Bit Server VM warning: INFO: os::commit_memory(0x..., failed; error='Cannot allocate memory'
```

**解决方案**：

```
# 降低堆内存配置
-Xms512m
-Xmx512m
```

### 2. 文件描述符限制

**错误信息**：

```
max file descriptors [4096] for elasticsearch process is too low, increase to at least [65535]
```

**解决方案**：

```bash
# 编辑 /etc/security/limits.conf
elasticsearch soft nofile 65536
elasticsearch hard nofile 65536

# 重新登录或重启
```

### 3. 虚拟内存限制

**错误信息**：

```
max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
```

**解决方案**：

```bash
# 临时设置
sudo sysctl -w vm.max_map_count=262144

# 永久设置（/etc/sysctl.conf）
vm.max_map_count=262144
```

### 4. 端口占用

**错误信息**：

```
Failed to bind to [9200]
```

**解决方案**：

```bash
# 检查端口占用
netstat -tuln | grep 9200

# 修改端口或停止占用进程
```

### 5. 权限问题

**错误信息**：

```
java.nio.file.AccessDeniedException: /path/to/data
```

**解决方案**：

```bash
# 授权目录
sudo chown -R elasticsearch:elasticsearch /path/to/elasticsearch
```

### 6. ES 8.x 安全特性

**问题**：8.x 默认开启安全特性，需要认证。

**临时方案**（开发环境）：

```yaml
# elasticsearch.yml
xpack.security.enabled: false
```

**生产方案**：配置用户认证和 TLS。

## 停止与重启

### 停止 Elasticsearch

```bash
# 前台运行：Ctrl + C

# 后台运行：通过 PID 停止
kill $(cat pid)

# 或查找进程
ps aux | grep elasticsearch
kill <PID>

# Docker
docker stop elasticsearch
```

### 重启

```bash
# Linux
./bin/elasticsearch -d -p pid

# Docker
docker restart elasticsearch

# 服务方式（systemd）
sudo systemctl restart elasticsearch
```

## 配置为系统服务（systemd）

### 创建服务文件

编辑 `/etc/systemd/system/elasticsearch.service`：

```ini
[Unit]
Description=Elasticsearch
Documentation=https://www.elastic.co
Wants=network-online.target
After=network-online.target

[Service]
Type=notify
RuntimeDirectory=elasticsearch
PrivateTmp=true
Environment=ES_HOME=/path/to/elasticsearch
Environment=ES_PATH_CONF=/path/to/elasticsearch/config
Environment=PID_DIR=/var/run/elasticsearch
WorkingDirectory=/path/to/elasticsearch

User=elasticsearch
Group=elasticsearch

ExecStart=/path/to/elasticsearch/bin/elasticsearch

StandardOutput=journal
StandardError=inherit

LimitNOFILE=65535
LimitNPROC=4096
LimitAS=infinity
LimitFSIZE=infinity

TimeoutStopSec=0
KillSignal=SIGTERM
KillMode=process
SendSIGKILL=no
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

### 启用服务

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启用开机自启
sudo systemctl enable elasticsearch

# 启动服务
sudo systemctl start elasticsearch

# 查看状态
sudo systemctl status elasticsearch

# 查看日志
sudo journalctl -u elasticsearch -f
```

## 总结

**安装方式选择**：
- **开发环境**：Docker（快速、隔离）
- **生产环境**：二进制包（性能、可控）
- **快速测试**：Homebrew（macOS）

**核心配置**：
- **elasticsearch.yml**：集群名、节点名、网络、路径
- **jvm.options**：堆内存（Xms = Xmx，不超过32GB）
- **系统参数**：文件描述符、虚拟内存

**验证步骤**：
- Health Check API
- 创建索引并测试查询
- 安装 Kibana 使用 Dev Tools

**常见问题**：
- 内存不足：降低堆内存配置
- 权限问题：以非 root 用户运行
- 系统限制：调整文件描述符和虚拟内存

**下一步**：学习集群搭建与高可用架构，从单节点扩展到分布式集群。
