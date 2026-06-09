# SeaweedFS 部署指南

> 版本：3.72 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 最低 | 推荐 |
|------|------|------|
| CPU | 2 核 | 8 核+ |
| 内存 | 4G | 16G+（Master 2G + Volume 按数据量） |
| 磁盘 | 50G | 1T+ NVMe（Volume 节点） |
| 系统 | CentOS 7.9+ / Ubuntu 22.04+ | |

---

## 2. 裸机安装（通用）

```bash
wget https://github.com/seaweedfs/seaweedfs/releases/download/3.72/linux_amd64.tar.gz
tar xzf linux_amd64.tar.gz
mv weed /usr/local/bin/
weed version
```

---

## 3. 单机部署（Master + Volume 合并）

### 适用场景

开发测试、小文件存储（< 1TB）、学习环境。

### 配置

```bash
mkdir -p /data/seaweedfs/{master,volume}
```

### 启动

```bash
# all-in-one（Master + Volume + Filer + S3 合并启动）
weed server \
  -master.dir=/data/seaweedfs/master \
  -volume.dir=/data/seaweedfs/volume \
  -volume.max=50 \
  -filer=true \
  -filer.dir=/data/seaweedfs/filer \
  -s3=true \
  -s3.port=8333 \
  -master.port=9333 \
  -volume.port=8080 \
  -filer.port=8888
```

### 验证

```bash
curl http://localhost:9333/cluster/status
curl http://localhost:9333/dir/assign
# 应返回 fid 和 volume server 地址
```

### Docker Compose

```yaml
services:
  seaweedfs:
    image: chrislusf/seaweedfs:3.72
    container_name: seaweedfs
    restart: unless-stopped
    ports:
      - "9333:9333"
      - "8080:8080"
      - "8888:8888"
      - "8333:8333"
    volumes:
      - sw-master:/data/master
      - sw-volume:/data/volume
    command: server -master.dir=/data/master -volume.dir=/data/volume -volume.max=50 -filer=true -filer.dir=/data/filer -s3=true -s3.port=8333

volumes:
  sw-master:
  sw-volume:
```

---

## 4. 生产部署（Master × 3 + Volume × 3 + Filer）

### 适用场景

生产高可用，海量小文件（图片/视频/CDN 源站），要求 POSIX/S3 兼容。

### 节点规划

| 组件 | 节点数 | 推荐配置 |
|------|--------|----------|
| **Master** | 3 | 4 核 8G，Raft 选举，至少 3 节点 |
| **Volume** | 3+ | 按容量扩展，每节点最大 500 Volume |
| **Filer** | 2+ | 无状态，前端 LB 负载均衡 |
| **S3 Gateway** | 2+ | 无状态，前端 LB |

副本策略：`replication=001`（单副本，同 Rack 存 1 份）/ `replication=011`（双副本，跨 Rack 存 2 份）。

### 配置

**Master** `/etc/seaweedfs/master.json`（各节点相同，peers 列表全量）：
```bash
cat > /etc/seaweedfs/master.json << 'EOF'
{
  "master": {
    "port": 9333,
    "mdir": "/data/seaweedfs/master",
    "peers": ["10.0.0.1:9333", "10.0.0.2:9333", "10.0.0.3:9333"],
    "defaultReplication": "011",
    "volumeSizeLimitMB": 30000,
    "garbageThreshold": 0.03,
    "pulseSeconds": 5
  }
}
EOF
```

**Volume** `/etc/seaweedfs/volume.json`：
```bash
cat > /etc/seaweedfs/volume.json << 'EOF'
{
  "volume": {
    "port": 8080,
    "dir": "/data/seaweedfs/volume",
    "max": 100,
    "mserver": "10.0.0.1:9333,10.0.0.2:9333,10.0.0.3:9333",
    "indexType": "memory",
    "dataCenter": "dc1",
    "rack": "rack1"
  }
}
EOF
```

**Filer** `/etc/seaweedfs/filer.json`（生产必须用持久化 Store）：
```bash
cat > /etc/seaweedfs/filer.json << 'EOF'
{
  "filer": {
    "port": 8888,
    "store": {
      "type": "mysql",
      "hostname": "mysql-host:3306",
      "database": "seaweedfs_filer",
      "username": "filer",
      "password": "FilerStr0ng!Pass"
    }
  }
}
EOF
```

### 启动

**Master 节点**（各节点启动，Raft 自动选举 Leader）：
```bash
cat > /etc/systemd/system/seaweedfs-master.service << 'EOF'
[Unit]
Description=SeaweedFS Master
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/weed master -mdir=/data/seaweedfs/master -port=9333 -peers=10.0.0.1:9333,10.0.0.2:9333,10.0.0.3:9333 -defaultReplication=011 -volumeSizeLimitMB=30000
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable seaweedfs-master && systemctl start seaweedfs-master
```

**Volume 节点**：
```bash
cat > /etc/systemd/system/seaweedfs-volume.service << 'EOF'
[Unit]
Description=SeaweedFS Volume
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/weed volume -dir=/data/seaweedfs/volume -max=100 -mserver=10.0.0.1:9333,10.0.0.2:9333,10.0.0.3:9333 -port=8080 -dataCenter=dc1 -rack=rack1
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable seaweedfs-volume && systemctl start seaweedfs-volume
```

**Filer 节点**：
```bash
cat > /etc/systemd/system/seaweedfs-filer.service << 'EOF'
[Unit]
Description=SeaweedFS Filer
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/weed filer -master=10.0.0.1:9333,10.0.0.2:9333,10.0.0.3:9333 -port=8888 -collection=default
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable seaweedfs-filer && systemctl start seaweedfs-filer
```

### 验证

```bash
# Master 状态
curl http://localhost:9333/cluster/status
# 应显示所有 Volume 节点在线

# 上传测试
weed upload -server=localhost:9333 /etc/hostname
# 返回 fid

# Filer 验证
curl http://localhost:8888/
```

### Docker Compose

```yaml
services:
  master-1:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-master-1
    hostname: sw-master-1
    restart: unless-stopped
    ports:
      - "9333:9333"
    volumes:
      - master-1-data:/data
    command: master -mdir=/data -port=9333 -peers=sw-master-1:9333,sw-master-2:9333,sw-master-3:9333 -defaultReplication=011

  master-2:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-master-2
    hostname: sw-master-2
    restart: unless-stopped
    volumes:
      - master-2-data:/data
    command: master -mdir=/data -port=9333 -peers=sw-master-1:9333,sw-master-2:9333,sw-master-3:9333 -defaultReplication=011

  master-3:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-master-3
    hostname: sw-master-3
    restart: unless-stopped
    volumes:
      - master-3-data:/data
    command: master -mdir=/data -port=9333 -peers=sw-master-1:9333,sw-master-2:9333,sw-master-3:9333 -defaultReplication=011

  volume-1:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-volume-1
    hostname: sw-volume-1
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - volume-1-data:/data
    command: volume -dir=/data -max=100 -mserver=sw-master-1:9333,sw-master-2:9333,sw-master-3:9333 -port=8080 -dataCenter=dc1 -rack=rack1

  volume-2:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-volume-2
    hostname: sw-volume-2
    restart: unless-stopped
    volumes:
      - volume-2-data:/data
    command: volume -dir=/data -max=100 -mserver=sw-master-1:9333,sw-master-2:9333,sw-master-3:9333 -port=8080 -dataCenter=dc1 -rack=rack1

  volume-3:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-volume-3
    hostname: sw-volume-3
    restart: unless-stopped
    volumes:
      - volume-3-data:/data
    command: volume -dir=/data -max=100 -mserver=sw-master-1:9333,sw-master-2:9333,sw-master-3:9333 -port=8080 -dataCenter=dc1 -rack=rack1

  filer:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-filer
    hostname: sw-filer
    restart: unless-stopped
    ports:
      - "8888:8888"
    command: filer -master=sw-master-1:9333,sw-master-2:9333,sw-master-3:9333 -port=8888

  s3:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-s3
    restart: unless-stopped
    ports:
      - "8333:8333"
    command: s3 -filer=sw-filer:8888 -port=8333

volumes:
  master-1-data:  master-2-data:  master-3-data:
  volume-1-data:  volume-2-data:  volume-3-data:
```

---

## 5. 运维速查

```bash
# 交互式管理
weed shell

# 集群状态
curl http://localhost:9333/cluster/status
curl http://localhost:9333/dir/status

# Volume 管理
weed volume.list -master=localhost:9333
weed volume.balance -master=localhost:9333 -force
weed volume.vacuum -master=localhost:9333

# 垃圾回收（压缩碎片）
weed volume.vacuum -master=localhost:9333 -garbageThreshold=0.03

# Filer 操作
weed filer.cat http://filer:8888/path/to/file
weed filer.copy /local/file http://filer:8888/remote/path

# POSIX 挂载
weed mount -filer=filer:8888 -dir=/mnt/seaweedfs

# 备份 Volume
weed volume.copy -source=http://volume:8080 -dir=/backup

# 备份 Filer 元数据
mysqldump -u filer -p seaweedfs_filer > /backup/filer-$(date +%Y%m%d).sql
```

**副本策略参考**：

| 策略 | 含义 | 适用场景 |
|------|------|----------|
| `000` | 无副本 | 开发测试 |
| `001` | 同 Rack 1 副本 | 单机架 |
| `011` | 跨 Rack 2 副本 | 生产高可用 |
| `100` | 跨 DC 1 副本 | 灾备 |

---

## 6. 常见故障

### 故障 1：Volume 只读

**现象**：写入返回 `read-only` 错误。

**解决**：
```bash
weed shell
# volume.configure -volumeId=<id> -writable
# 或分配新 Volume
```

### 故障 2：Master 无 Leader

**排查**：检查 Master 间网络连通性和 Raft 日志。
**解决**：确保多数 Master 节点可用，重启异常节点。

### 故障 3：Filer 元数据丢失

**排查**：检查 Filer Store 后端数据库连接。
**解决**：恢复数据库 → 重启 Filer。
