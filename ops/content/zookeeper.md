# ZooKeeper 部署指南

> 版本：3.9.2 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| JDK | JDK 11+（推荐 JDK 17） |
| 内存 | 单机 ≥ 1G，集群 ≥ 2G/节点 |
| 端口 | **2181**（客户端）、2888（Peer 通信）、3888（选举） |
| 磁盘 | 事务日志建议独立 SSD |

> 客户端连接端口为 **2181**，非 2185。

## 2. 裸机安装（通用）

```bash
wget https://archive.apache.org/dist/zookeeper/zookeeper-3.9.2/apache-zookeeper-3.9.2-bin.tar.gz
tar xzf apache-zookeeper-3.9.2-bin.tar.gz && cd apache-zookeeper-3.9.2-bin
```

## 3. 单机部署

**适用场景**：开发测试

### 3.1 配置

```bash
cat > conf/zoo.cfg << 'EOF'
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper/data
dataLogDir=/tmp/zookeeper/logs
clientPort=2181
maxClientCnxns=60
EOF
```

### 3.2 启动

```bash
bin/zkServer.sh start
```

### 3.3 验证

```bash
bin/zkServer.sh status
# 预期输出 Mode: standalone

echo ruok | nc localhost 2181
# 预期输出 imok
```

### 3.4 Docker Compose

```yaml
services:
  zookeeper:
    image: zookeeper:3.9.2
    container_name: zookeeper
    restart: unless-stopped
    ports:
      - "2181:2181"
    environment:
      ZOO_MY_ID: 1
      ZOO_SERVERS: server.1=0.0.0.0:2888:3888;2181
    volumes:
      - zk-data:/data
      - zk-datalog:/datalog

volumes:
  zk-data:
  zk-datalog:
```

## 4. 集群部署

**适用场景**：生产环境高可用

### 4.1 节点规划

| 节点 | 角色 | IP | 端口 |
|------|------|-----|------|
| zk-1 | Leader/Follower | 10.0.0.1 | 2181 |
| zk-2 | Follower/Leader | 10.0.0.2 | 2181 |
| zk-3 | Follower/Leader | 10.0.0.3 | 2181 |

### 4.2 配置

**Step 1：zoo.cfg（每节点相同）**

```bash
cat > conf/zoo.cfg << 'EOF'
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/data/zookeeper/data
dataLogDir=/data/zookeeper/logs
clientPort=2181
maxClientCnxns=60

server.1=10.0.0.1:2888:3888
server.2=10.0.0.2:2888:3888
server.3=10.0.0.3:2888:3888

autopurge.snapRetainCount=10
autopurge.purgeInterval=1
4lw.commands.whitelist=mntr,conf,ruok,srvr
EOF
```

**Step 2：myid 文件（每节点不同）**

```bash
# zk-1（10.0.0.1）
echo "1" > /data/zookeeper/data/myid

# zk-2（10.0.0.2）
echo "2" > /data/zookeeper/data/myid

# zk-3（10.0.0.3）
echo "3" > /data/zookeeper/data/myid
```

### 4.3 启动

```bash
# 每个节点依次启动
bin/zkServer.sh start
```

### 4.4 验证

```bash
bin/zkServer.sh status
# 预期 1 个 leader + 2 个 follower

echo mntr | nc localhost 2181 | grep zk_server_state
# leader 输出 zk_server_state leader
# follower 输出 zk_server_state follower
```

### 4.5 Docker Compose

```yaml
services:
  zk-1:
    image: zookeeper:3.9.2
    container_name: zk-1
    hostname: zk-1
    restart: unless-stopped
    ports:
      - "2181:2181"
    environment:
      ZOO_MY_ID: 1
      ZOO_SERVERS: server.1=zk-1:2888:3888;2181 server.2=zk-2:2888:3888;2181 server.3=zk-3:2888:3888;2181
    volumes:
      - zk-1-data:/data
      - zk-1-datalog:/datalog
    networks:
      - zk-net

  zk-2:
    image: zookeeper:3.9.2
    container_name: zk-2
    hostname: zk-2
    restart: unless-stopped
    environment:
      ZOO_MY_ID: 2
      ZOO_SERVERS: server.1=zk-1:2888:3888;2181 server.2=zk-2:2888:3888;2181 server.3=zk-3:2888:3888;2181
    volumes:
      - zk-2-data:/data
      - zk-2-datalog:/datalog
    networks:
      - zk-net

  zk-3:
    image: zookeeper:3.9.2
    container_name: zk-3
    hostname: zk-3
    restart: unless-stopped
    environment:
      ZOO_MY_ID: 3
      ZOO_SERVERS: server.1=zk-1:2888:3888;2181 server.2=zk-2:2888:3888;2181 server.3=zk-3:2888:3888;2181
    volumes:
      - zk-3-data:/data
      - zk-3-datalog:/datalog
    networks:
      - zk-net

volumes:
  zk-1-data:
  zk-2-data:
  zk-3-data:
  zk-1-datalog:
  zk-2-datalog:
  zk-3-datalog:

networks:
  zk-net:
    driver: bridge
```

## 5. 运维速查

```bash
# 服务状态
bin/zkServer.sh status

# 客户端连接
bin/zkCli.sh -server localhost:2181

# 四字命令
echo mntr | nc localhost 2181    # 监控指标
echo ruok | nc localhost 2181    # 是否正常 imok
echo cons | nc localhost 2181    # 连接信息
echo srvr | nc localhost 2181    # 服务器信息

# 查看日志
tail -f logs/zookeeper.out

# 快照备份
cp /data/zookeeper/data/version-2/snapshot.* /backup/
cp /data/zookeeper/logs/version-2/log.* /backup/
```

## 6. 常见故障

**集群无 Leader**：检查 `myid` 文件是否正确 → 检查节点间 2888/3888 端口连通性 → 检查 `server.N` 配置与 IP 是否匹配

**Follower 频繁断连**：增大 `syncLimit`（当前 `5` → `10`） → 检查网络延迟 → 检查磁盘 IO 是否过高

**客户端连不上**：确认端口为 **2181**（非 2185） → 检查防火墙 → 检查 `maxClientCnxns` 是否被耗尽
