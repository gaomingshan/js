# Nginx 部署指南

> 版本：1.26 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|---------|---------|------|
| 基础 Web 服务器 | 1C / 1G | 2C / 2G | 10G |
| 反向代理 + 负载均衡 | 2C / 2G | 4C / 4G | 20G |
| HTTPS + 限流 | 2C / 2G | 4C / 8G | 20G |

## 2. 裸机安装（通用）

```bash
# CentOS
sudo yum install -y nginx

# Ubuntu
sudo apt install -y nginx

# 源码编译
wget https://nginx.org/download/nginx-1.26.1.tar.gz
tar xzf nginx-1.26.1.tar.gz && cd nginx-1.26.1
./configure --prefix=/usr/local/nginx \
  --with-http_ssl_module --with-http_v2_module \
  --with-http_realip_module --with-http_gzip_static_module \
  --with-stream --with-stream_ssl_module
make -j$(nproc) && sudo make install

# 目录创建
sudo mkdir -p /etc/nginx/conf.d /etc/nginx/certs /var/log/nginx
```

## 3. 基础部署

**适用场景**：静态资源 Web 服务器，单站点反向代理

### 配置文件

```bash
cat > /etc/nginx/nginx.conf << 'EOF'
worker_processes auto;
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    tcp_nopush    on;
    keepalive_timeout 65;

    access_log /var/log/nginx/access.log;
    error_log  /var/log/nginx/error.log warn;

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html;
        }

        location /static/ {
            root /usr/share/nginx/html;
            expires 30d;
        }
    }
}
EOF
```

### 启动

```bash
nginx -t                     # 验证配置
sudo systemctl start nginx   # 启动
sudo systemctl enable nginx  # 开机自启
```

### 验证

```bash
curl http://localhost
curl http://localhost/static/
```

### Docker Compose

```yaml
services:
  nginx:
    image: nginx:1.26
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./html:/usr/share/nginx/html
```

## 4. 生产部署

**适用场景**：反向代理 + 负载均衡 + HTTPS 终结 + 限流

### 配置文件

```bash
cat > /etc/nginx/nginx.conf << 'EOF'
worker_processes auto;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time';

    access_log /var/log/nginx/access.log main buffer=32k flush=5s;
    error_log  /var/log/nginx/error.log warn;

    sendfile          on;
    tcp_nopush        on;
    tcp_nodelay       on;
    keepalive_timeout 65;
    client_max_body_size 20m;

    # Gzip
    gzip on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_comp_level 4;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_conn_zone $binary_remote_addr zone=conn:10m;
    limit_req_status 429;

    # Upstream
    upstream app_backend {
        least_conn;
        server app-1:8080 weight=1 max_fails=3 fail_timeout=30s;
        server app-2:8080 weight=1 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP -> HTTPS redirect
    server {
        listen 80;
        server_name example.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name example.com;

        ssl_certificate     /etc/nginx/certs/server.crt;
        ssl_certificate_key /etc/nginx/certs/server.key;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers on;
        ssl_session_cache   shared:SSL:10m;
        ssl_session_timeout 10m;

        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        limit_req zone=api burst=50 nodelay;
        limit_conn conn 100;

        location /api/ {
            proxy_pass http://app_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 5s;
            proxy_send_timeout 30s;
            proxy_read_timeout 60s;
            proxy_next_upstream error timeout;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
        }

        location /static/ {
            root /usr/share/nginx/html;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF
```

### 启动

```bash
nginx -t
sudo systemctl restart nginx
```

### 验证

```bash
curl -k https://localhost/api/
curl -k https://localhost/static/
```

### Docker Compose

```yaml
services:
  nginx:
    image: nginx:1.26
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./certs:/etc/nginx/certs:ro
      - ./html:/usr/share/nginx/html
      - ./logs:/var/log/nginx

  app-1:
    image: myapp:latest
    networks:
      - app-net

  app-2:
    image: myapp:latest
    networks:
      - app-net

networks:
  app-net:
    driver: bridge
```

## 5. 运维速查

```bash
nginx -t                    # 验证配置
nginx -s reload             # 重载配置（不断连）
nginx -s quit               # 优雅停止
nginx -s reopen             # 重新打开日志文件

# 日志切割
mv /var/log/nginx/access.log /var/log/nginx/access.log.$(date +%Y%m%d)
nginx -s reopen
```

### stub_status

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 10.0.0.0/8;
    deny all;
}
```

### 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| 活跃连接 | stub_status | 接近 worker_connections |
| 请求速率 | stub_status | 异常增长 |
| 5xx 比例 | access.log 统计 | > 1% |
| 后端延迟 | `$upstream_response_time` | P99 > 1s |

### 备份

```bash
tar czf nginx-config-$(date +%Y%m%d).tar.gz /etc/nginx/
```

## 6. 常见故障

| 故障 | 原因 | 解决 |
|------|------|------|
| 502 Bad Gateway | 后端不可达或异常 | 检查后端进程；查看 error.log；增大 proxy_connect_timeout |
| 504 Gateway Timeout | 后端响应超时 | 增大 proxy_read_timeout；优化后端性能 |
| 413 Request Entity Too Large | 请求体超限 | 调大 client_max_body_size |
| 429 Too Many Requests | 触发限流 | 检查 limit_req / limit_conn 配置；是否遭受攻击 |
