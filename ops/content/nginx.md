# Nginx 部署运维指南

> **定位**：最流行的开源 Web 服务器和反向代理，流量入口事实标准
> **适用场景**：反向代理、负载均衡、静态资源、API 网关、SSL 终结
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Nginx 是开源的高性能 Web 服务器和反向代理，事件驱动（epoll）+ 非阻塞 IO 模型，单 Worker 进程处理数万并发连接。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **事件驱动** | epoll/kqueue，非阻塞 IO |
| **反向代理** | HTTP/TCP/UDP 代理 |
| **负载均衡** | Round Robin/Weighted/IP Hash/Least Conn |
| **SSL 终结** | TLS 卸载，后端 HTTP |
| **缓存** | 代理缓存，静态文件缓存 |
| **限流** | `limit_req` / `limit_conn` |

### 1.3 适用场景

**最佳适用**：Web 服务器、反向代理、负载均衡、SSL 终结、静态资源服务、API 网关

**不适用**：动态路由/插件化网关（→ APISIX/Kong）、服务网格 Sidecar（→ Envoy）

---

## 2. 部署

### 2.1 裸机部署

```bash
# CentOS
sudo yum install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx

# Ubuntu
sudo apt install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx

# 源码编译（推荐，获取最新版 + 自定义模块）
wget https://nginx.org/download/nginx-1.26.1.tar.gz
tar xzf nginx-1.26.1.tar.gz && cd nginx-1.26.1
./configure --prefix=/usr/local/nginx \
  --with-http_ssl_module --with-http_v2_module \
  --with-http_realip_module --with-http_gzip_static_module \
  --with-stream --with-stream_ssl_module \
  --add-module=/path/to/ngx_cache_purge  # 按需添加模块
make -j$(nproc) && sudo make install
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name nginx \
  -p 80:80 \
  -p 443:443 \
  -v ./conf/nginx.conf:/etc/nginx/nginx.conf \
  -v ./conf/conf.d:/etc/nginx/conf.d \
  -v ./html:/usr/share/nginx/html \
  -v ./certs:/etc/nginx/certs \
  --restart unless-stopped \
  nginx:1.26
```

### 2.3 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:1.26
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./conf/nginx.conf:/etc/nginx/nginx.conf
      - ./conf/conf.d:/etc/nginx/conf.d
      - ./html:/usr/share/nginx/html
      - ./certs:/etc/nginx/certs
      - ./logs:/var/log/nginx
    networks:
      - app-net

  app-1:
    image: myapp:latest
    container_name: app-1
    networks:
      - app-net

  app-2:
    image: myapp:latest
    container_name: app-2
    networks:
      - app-net

networks:
  app-net:
    driver: bridge
```

---

## 3. 配置文件

> **核心原则**：Nginx 配置是流量管理的灵魂。以下按场景提供完整可用配置。

### 3.1 配置文件加载机制

```
nginx.conf
  ├── main 上下文（events/http/stream）
  ├── http 上下文
  │   ├── upstream（后端集群）
  │   └── server（虚拟主机）
  │       └── location（路由规则）
  └── stream 上下文（TCP/UDP 代理）
```

### 3.2 开发环境配置

```nginx
# conf/nginx.conf — 开发环境
worker_processes auto;
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://app:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 静态资源
        location /static/ {
            root /usr/share/nginx/html;
        }
    }
}
```

### 3.3 生产环境配置 — 反向代理 + 负载均衡

```nginx
# conf/nginx.conf — 生产环境

# === Main ===
worker_processes auto;               # 自动匹配 CPU 核数
# worker_rlimit_nofile 65535;        # Worker 最大文件描述符
# 逻辑：worker_rlimit_nofile 必须 ≥ worker_connections
# 否则连接数受限于 OS 文件描述符

events {
    worker_connections 4096;         # 单 Worker 最大连接数
    # 逻辑：总并发 = worker_processes × worker_connections
    # 4 核 × 4096 = 16384 并发连接
    use epoll;                       # Linux 使用 epoll
    multi_accept on;                 # 一次接受所有新连接
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # === 日志格式 ===
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time';
    # $request_time → 总请求耗时
    # $upstream_response_time → 后端响应耗时
    # 逻辑：两者差值 = Nginx 自身处理时间 + 网络时间

    access_log /var/log/nginx/access.log main buffer=32k flush=5s;
    # buffer=32k → 日志缓冲 32KB 再写磁盘，减少 IO
    # flush=5s → 最多 5 秒刷一次，防止日志丢失过多
    error_log  /var/log/nginx/error.log warn;

    # === 性能 ===
    sendfile    on;                   # 零拷贝发送静态文件
    tcp_nopush  on;                   # 优化 sendfile 发送
    tcp_nodelay on;                   # 禁用 Nagle，低延迟
    keepalive_timeout 65;             # 长连接超时
    client_max_body_size 20m;         # 最大请求体 20MB

    # === Gzip ===
    gzip on;
    gzip_min_length 1024;             # 大于 1KB 才压缩
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_comp_level 4;                # 压缩级别 4（1-9，4 性价比最优）
    # 逻辑：级别越高压缩比越好但 CPU 开销越大
    # 4 是压缩比和 CPU 的最佳平衡点

    # === 限流 ===
    # 逻辑：limit_req_zone 基于 IP 限流，防止恶意请求
    # rate=100r/s → 每 IP 每秒 100 请求
    # burst=50 → 允许突发 50 个请求排队
    # nodelay → 突发请求不延迟处理，超过直接拒绝
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_conn_zone $binary_remote_addr zone=conn:10m;
    limit_req_status 429;            # 限流状态码（默认 503，429 更语义化）

    # === Upstream ===
    upstream app_backend {
        # 负载均衡策略选择逻辑：
        # round-robin（默认）→ 无状态服务，请求均匀分布
        # least_conn → 长连接/处理时间差异大的服务
        # ip_hash → 需要会话保持（不推荐，改用 Redis Session）
        least_conn;

        server app-1:8080 weight=1 max_fails=3 fail_timeout=30s;
        server app-2:8080 weight=1 max_fails=3 fail_timeout=30s;
        # max_fails=3 → 30s 内失败 3 次标记不可用
        # fail_timeout=30s → 30s 后重试

        keepalive 32;                 # 到后端的长连接池
        # 逻辑：减少到后端的 TCP 连接建立开销
    }

    # === HTTP → HTTPS 重定向 ===
    server {
        listen 80;
        server_name example.com;
        return 301 https://$server_name$request_uri;
    }

    # === HTTPS 主站 ===
    server {
        listen 443 ssl http2;
        server_name example.com;

        # SSL 配置
        ssl_certificate     /etc/nginx/certs/server.crt;
        ssl_certificate_key /etc/nginx/certs/server.key;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers on;
        ssl_session_cache   shared:SSL:10m;    # SSL 会话缓存 10MB
        ssl_session_timeout 10m;
        # 逻辑：ssl_session_cache 复用 SSL 握手，减少 CPU 开销
        # 10MB ≈ 40000 个会话

        # 安全头
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 限流
        limit_req zone=api burst=50 nodelay;
        limit_conn conn 100;           # 单 IP 最大 100 并发连接

        # API 代理
        location /api/ {
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # 超时
            proxy_connect_timeout 5s;   # 连接后端超时
            proxy_send_timeout 30s;     # 发送请求超时
            proxy_read_timeout 60s;     # 读取响应超时
            proxy_next_upstream error timeout;  # 后端失败时重试下一台
            proxy_buffering on;
            proxy_buffer_size 8k;
            proxy_buffers 8 16k;

            # 长连接
            proxy_http_version 1.1;
            proxy_set_header Connection "";
        }

        # 静态资源（缓存）
        location /static/ {
            root /usr/share/nginx/html;
            expires 30d;                # 浏览器缓存 30 天
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 3.4 TCP/UDP 代理配置

```nginx
# stream 上下文（与 http 平级）
stream {
    upstream mysql_backend {
        server mysql-1:3306;
        server mysql-2:3306 backup;
    }

    server {
        listen 13306;
        proxy_pass mysql_backend;
        proxy_connect_timeout 5s;
        proxy_timeout 300s;
    }
}
```

---

## 4. 调优

### 4.1 Worker 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `worker_processes` | Worker 进程数 | auto | auto = CPU 核数。每个 Worker 单线程事件循环 |
| `worker_connections` | 单 Worker 连接数 | 4096-65535 | 总并发 = worker_processes × worker_connections。需配合 `worker_rlimit_nofile` |
| `worker_rlimit_nofile` | Worker 文件描述符上限 | 65535 | 必须 ≥ worker_connections。OS 也需调 `fs.file-max` |
| `multi_accept` | 批量接受连接 | on | 一次 accept 所有待处理连接，减少事件循环次数 |

### 4.2 网络子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `sendfile` | 零拷贝 | on | 静态文件传输绕过用户空间，减少内存拷贝 |
| `tcp_nopush` | TCP_CORK | on | 配合 sendfile，合并小包为大包发送 |
| `tcp_nodelay` | 禁用 Nagle | on | 低延迟场景必须开启。与 tcp_nopush 不冲突（不同阶段） |
| `keepalive_timeout` | 长连接超时 | 65s | 过短 → 频繁建连；过长 → 空闲连接占资源 |
| `reset_timedout_connection` | 重置超时连接 | on | RST 替代 FIN 关闭，更快释放资源 |

### 4.3 缓冲子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `proxy_buffering` | 代理缓冲 | on | on → Nginx 缓存后端响应再发给客户端，保护慢客户端；off → 流式转发 |
| `proxy_buffer_size` | 响应头缓冲 | 8k | 存后端响应头。太小 → 502 |
| `proxy_buffers` | 响应体缓冲 | 8 16k | 8 个 16KB 缓冲区。总缓冲 = 8×16K = 128K |
| `client_max_body_size` | 最大请求体 | 20m | 超过返回 413。文件上传需调大 |

### 4.4 SSL 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `ssl_session_cache` | SSL 会话缓存 | shared:SSL:10m | 复用 SSL 握手，减少 CPU。1MB ≈ 4000 会话 |
| `ssl_session_timeout` | 会话超时 | 10m | 会话缓存有效期 |
| `ssl_protocols` | TLS 版本 | TLSv1.2 TLSv1.3 | 禁用 TLSv1.0/1.1（不安全） |
| `ssl_prefer_server_ciphers` | 优先服务端密码 | on | 防止客户端选择弱密码 |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 重载配置（不断连）
sudo nginx -s reload

# 验证配置
sudo nginx -t

# 停止
sudo nginx -s stop    # 立即停止
sudo nginx -s quit    # 优雅停止（等待请求完成）

# 日志切割
sudo mv /var/log/nginx/access.log /var/log/nginx/access.log.$(date +%Y%m%d)
sudo nginx -s reopen
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **活跃连接** | `stub_status` | 接近 worker_connections |
| **请求速率** | `stub_status` | 异常增长 |
| **5xx 比例** | access.log | > 1% |
| **后端延迟** | `$upstream_response_time` | P99 > 1s |
| **SSL 握手失败** | error.log | > 0 |

**stub_status 配置**：

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 10.0.0.0/8;
    deny all;
}
```

### 5.3 备份与恢复

```bash
# 备份配置
tar czf nginx-config-backup-$(date +%Y%m%d).tar.gz /etc/nginx/
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：502 Bad Gateway

**排查链路**：

```
502 → 后端不可达或返回异常
  → error.log 查看 upstream 错误
    → 后端进程是否存活？
      → 否 → 重启后端
      → 是 → proxy_connect_timeout 太小？后端响应太慢？
```

#### 故障 2：504 Gateway Timeout

**排查**：增大 `proxy_read_timeout` → 检查后端处理时间 → 优化后端性能

#### 故障 3：413 Request Entity Too Large

**解决**：`client_max_body_size 50m;`

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `nginx -t` | 配置验证 |
| `stub_status` | 连接统计 |
| error.log | 错误诊断 |
| `$upstream_response_time` | 后端延迟 |

---

## 7. 参考资料

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Nginx Reverse Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)
- [Nginx SSL](https://nginx.org/en/docs/http/configuring_https_servers.html)
