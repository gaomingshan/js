# SSL 证书与安全

> HTTPS/证书管理 | OpenSSL/Let's Encrypt/SSH 加固 | 保障通信安全

---

## OpenSSL 常用操作

### 密钥生成

```bash
# RSA 2048 位
openssl genrsa -out key.pem 2048

# ECC（更高效，推荐）
openssl ecparam -genkey -name prime256v1 -out key.pem
```

### CSR 生成

```bash
openssl req -new -key key.pem -out csr.pem \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=Example/CN=example.com"

# 交互式输入
openssl req -new -key key.pem -out csr.pem
```

### 自签名证书

```bash
# 一步生成私钥+自签证书（最适合测试）
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 \
  -days 365 -keyout key.pem -out cert.pem \
  -subj "/CN=example.com"

# 已有私钥生成自签
openssl req -x509 -key key.pem -out cert.pem -days 365 -subj "/CN=example.com"
```

### 查看证书

```bash
openssl x509 -in cert.pem -text -noout          # 完整内容
openssl x509 -in cert.pem -subject -issuer -dates -noout  # 精简
openssl x509 -in cert.pem -noout -fingerprint   # SHA1 指纹
```

### 格式转换

```bash
# PEM ↔ DER
openssl x509 -in cert.pem -outform der -out cert.der
openssl x509 -in cert.der -inform der -out cert.pem

# PKCS#12（含私钥，Nginx 不用，IIS/Tomcat 常用）
openssl pkcs12 -export -in cert.pem -inkey key.pem -out cert.p12 \
  -name "example" -passout pass:

# 从 p12 提取
openssl pkcs12 -in cert.p12 -nocerts -out key.pem -nodes
openssl pkcs12 -in cert.p12 -clcerts -nokeys -out cert.pem
```

| 格式 | 说明 | 是否含私钥 |
|------|------|-----------|
| `.pem` | Base64 文本 | 否（单独文件） |
| `.crt` / `.cer` | 证书（通常 PEM 编码） | 否 |
| `.key` | 私钥（PEM 格式） | 是 |
| `.p12` / `.pfx` | PKCS#12 容器 | 是 |
| `.der` | 二进制编码 | 否 |

## 证书链

```
fullchain.pem = 服务器证书 + 中间证书（Nginx 用这个）
chain.pem     = 中间证书
cert.pem      = 服务器证书
privkey.pem   = 私钥

Nginx 配置：
  ssl_certificate     /etc/ssl/fullchain.pem;
  ssl_certificate_key /etc/ssl/privkey.pem;
```

### 验证证书链

```bash
openssl verify -CAfile ca.crt fullchain.pem
openssl s_client -connect example.com:443 -showcerts
```

## Let's Encrypt（免费证书）

### acme.sh（推荐）

```bash
curl https://get.acme.sh | sh -s email=admin@example.com

# HTTP 验证
acme.sh --issue -d example.com -w /var/www/html

# DNS 验证（泛域名 *.example.com 必须用这个）
acme.sh --issue -d example.com -d '*.example.com' --dns dns_cf

# 安装证书
acme.sh --install-cert -d example.com \
  --key-file /etc/ssl/privkey.pem \
  --fullchain-file /etc/ssl/fullchain.pem \
  --reloadcmd "systemctl reload nginx"
```

### certbot（官方）

```bash
# Nginx 自动配置
certbot --nginx -d example.com

# 仅获取证书，手动配置
certbot certonly --nginx -d example.com

# 证书位置
ls /etc/letsencrypt/live/example.com/
# cert.pem  chain.pem  fullchain.pem  privkey.pem

# 续期
certbot renew --dry-run
```

## SSH 密钥对

### 生成

```bash
ssh-keygen -t ed25519 -C "server-key"        # 推荐 ed25519（快、安全）
ssh-keygen -t rsa -b 4096                    # 兼容旧系统
```

### 部署

```bash
ssh-copy-id user@host                         # 一键传公钥
cat ~/.ssh/id_ed25519.pub | ssh user@host "cat >> ~/.ssh/authorized_keys"
```

### SSH Agent

```bash
eval "$(ssh-agent -s)"                        # 启动 agent
ssh-add ~/.ssh/id_ed25519                     # 添加私钥
ssh-add -l                                    # 查看已添加
ssh -A user@host                              # 转发 agent（跳板机用）
```

### SSHD 加固（/etc/ssh/sshd_config）

```
Port 2222                      # 改端口，避扫描
PermitRootLogin no             # 禁止 root 直连
PasswordAuthentication no      # 禁用密码（密钥登录后才改）
PubkeyAuthentication yes       # 密钥登录
MaxAuthTries 3                 # 最大尝试次数
AllowUsers alice bob           # 白名单用户
ClientAliveInterval 300        # 客户端超时检测
ClientAliveCountMax 0          # 超时踢出
```

```bash
# 改完重启
sshd -t                        # 测试配置语法
systemctl reload sshd
```

## 实践场景

### 场景 1：Nginx HTTPS 完整配置

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate     /etc/ssl/fullchain.pem;
    ssl_certificate_key /etc/ssl/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS（强制浏览器用 HTTPS）
    add_header Strict-Transport-Security "max-age=63072000" always;

    # OCSP Stapling（提升握手性能）
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/ssl/chain.pem;
    resolver 8.8.8.8 1.1.1.1 valid=300s;
    resolver_timeout 5s;
}
```

### 场景 2：自动续签+重启

```bash
# acme.sh 自动续签（已自带 cron，无需额外配置）
crontab -l | grep acme.sh

# certbot 续签
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

### 场景 3：SSH 跳板机

```bash
# ~/.ssh/config
Host jump
    HostName jump.example.com
    User admin
    Port 2222

Host target
    HostName 10.0.1.100
    User app
    ProxyJump jump                # 经过跳板机

# 用法
ssh target                        # 自动走跳板
```

### 场景 4：密钥轮换

```bash
# 1. 生成新密钥对
ssh-keygen -t ed25519 -f ~/.ssh/new_key -C "rotated-2026-06"

# 2. 部署公钥到所有服务器
ssh-copy-id -i ~/.ssh/new_key.pub user@host

# 3. 确认能登录后删除旧公钥
# 从 authorized_keys 删掉旧公钥

# 4. 切换本地默认密钥
mv ~/.ssh/id_ed25519 ~/.ssh/old_key
mv ~/.ssh/new_key ~/.ssh/id_ed25519
```
