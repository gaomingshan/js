# SSH 安全外壳协议

> 应用层 | 加密远程登录 & 端口转发 | 端口 22

---

## 报文结构

SSH 传输层报文格式：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Packet Length        |   Padding Length  |   载荷     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          载荷（续）                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          随机填充                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          MAC                                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| Packet Length | 32bit | 包长度（不含自身和 MAC） |
| Padding Length | 8bit | 填充长度 |
| Payload | 可变 | 实际数据（含消息类型字节） |
| Random Padding | 可变 | 随机填充（防流量分析） |
| MAC | 可变 | 消息认证码 |

### 消息类型

| 类型 | 值 | 层次 | 说明 |
|------|-----|------|------|
| SSH_MSG_KEXINIT | 20 | Transport | 密钥交换初始化 |
| SSH_MSG_NEWKEYS | 21 | Transport | 启用新密钥 |
| SSH_MSG_KEXDH_INIT | 30 | Transport | DH 初始化 |
| SSH_MSG_KEXDH_REPLY | 31 | Transport | DH 响应 |
| SSH_MSG_USERAUTH_REQUEST | 50 | Auth | 认证请求 |
| SSH_MSG_USERAUTH_SUCCESS | 52 | Auth | 认证成功 |
| SSH_MSG_CHANNEL_OPEN | 90 | Connection | 打开通道 |
| SSH_MSG_CHANNEL_DATA | 94 | Connection | 通道数据 |

---

## 核心能力

### 1. 密钥交换 —— DH 握手建立加密隧道

明文 TCP 无任何保护，必须先协商加密参数，然后全部加密传输。

```
客户端                                    服务器

  ──── SSH_MSG_KEXINIT ────────────────→
     支持的算法列表（KEX/加密/MAC/压缩）

  ←─── SSH_MSG_KEXINIT ────────────────
     支持的算法列表

  [双方协商选定一组算法]

  ──── SSH_MSG_KEXDH_INIT ─────────────→
     DH 公钥 e

  ←─── SSH_MSG_KEXDH_REPLY ────────────
     DH 公钥 f + 服务器主机公钥 + 签名

  ──── SSH_MSG_NEWKEYS ────────────────→
  ←─── SSH_MSG_NEWKEYS ────────────────
    之后所有数据使用新密钥加密
```

- 共享密钥 K = DH(e, f)，前向安全（私钥泄露不影响历史会话）
- Session ID = H(版本串 || Cookie || K_S || e || f || K)
- 加密密钥、MAC 密钥、IV 均从 K + Session ID 推导
- 后续传输经过对称加密（AES / ChaCha20）+ MAC 保护

---

### 2. 用户认证 —— 口令 vs 公钥

明文下口令和密码都暴露，SSH 加密后保护认证过程。公钥比口令更安全：无密码爆破、无法钓鱼。

```
口令认证：
1. 客户端发送: 用户名 + 密码（已加密通道）
2. 服务器验证: 系统密码或 PAM
3. 返回: SUCCESS / FAILURE

公钥认证：
1. 客户端发送: 用户名 + 公钥类型 + 公钥签名
2. 服务器检查: authorized_keys 中是否有该公钥
3. 验证签名（用公钥解密签名，比对 session_id）
4. 返回: SUCCESS / FAILURE
```

- 公钥认证支持证书（`ssh-keygen -s CA_key` 签名用户证书）
- 推荐 Ed25519（更短更安全），不推荐 DSA

---

### 3. 端口转发 —— 本地 / 远程 / 动态

为什么需要：直接在两端建立 TCP 隧道，不需要单独配置 VPN 或暴露服务端口。

```
本地转发（Local Forward）：
ssh -L 8080:internal-server:80 jump-server
客户端:8080 → jump-server → internal-server:80

本地  → [SSH 客户端]  ==隧道==  [SSH 服务器] → 内部应用

场景：访问内网 Web 服务，不需要 VPN
```

```
远程转发（Remote Forward）：
ssh -R 9090:localhost:8080 remote-server
remote-server:9090 → SSH 隧道 → 客户端 localhost:8080

外部 → [SSH 服务器:9090]  ==隧道==  [SSH 客户端] → 本地服务

场景：内网服务暴露给外网（NAT 穿透）
```

```
动态转发（SOCKS 代理）：
ssh -D 1080 jump-server
客户端 → SOCKS5 localhost:1080 → jump-server → 任意目标

场景：浏览器代理上网，所有 TCP 流量经跳板机
```

---

### 4. SFTP vs SCP

为什么需要 SFTP：SCP 基于古老的 RCP 协议扩展，使用 SSH 仅限于传输层加密，但语义弱（不支持暂停/恢复/目录列表/权限保留）；SFTP 是 SSH 子系统，完整文件操作。

| 特性 | SCP | SFTP |
|------|-----|------|
| 协议基础 | RCP over SSH | SSH 子系统 |
| 恢复传输 | 不支持 | 支持 |
| 目录列表 | 不支持 | 支持 |
| 权限/时间戳 | 有限 | 完整 |
| 安全 | SSH 传输加密 | SSH 传输加密 + 操作审计 |

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么分层设计（Transport/Auth/Connection） | 每一层可替换：传输层只管加密，认证层可换 PubKey/Password/Cert 而不影响上下层 |
| 为什么用 DH 不用固定密钥 | 前向安全（PFS）：服务器私钥泄漏也只能解密当次握手，历史会话安全 |
| 为什么 auth 在 transport 之后 | 所有认证过程用加密通道保护，防止口令/公钥在明文暴露 |
| 为什么需要 MAC | 加密只隐藏内容，MAC 防篡改（CTR 模式下可比特翻转攻击） |
| 为什么需要随机填充 | 防流量分析：固定大小包暴露协议状态 |

---

## 排障速查

```
# 一键诊断
ssh -vvv user@host

# 输出解读：
# debug1: 普通信息
# debug2: 详细协议交互
# debug3: 算法协商、密钥交换细节
```

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| Permission denied | `Permission denied (publickey,password)` | `-vvv` 看最后尝试的方法 | 公钥未添加到 authorized_keys / 密码错误 |
| Connection refused | `Connection refused` | `telnet host 22` 看端口 | 服务端 SSH 未启动 / 防火墙拦截 |
| Host key mismatch | `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` | `ssh-keygen -R host` 清除旧指纹 | 目标主机重装 / 中间人攻击 |
| Connection timeout | 无响应 | `mtr host` 看路由丢包 | 网络中断 / 防火墙丢包 |
| No matching algo | `no matching cipher found` | `-oCiphers=+aes256-cbc` 或升级客户端 | 服务端老旧算法被禁用 |
| 密钥加载失败 | `Load key "xxx": bad permissions` | `chmod 600 ~/.ssh/id_ed25519` | 私钥权限太宽松 |

---

## 常用工具

```bash
# 客户端连接
ssh -p 2222 user@host                          # 指定端口
ssh -J jump1,jump2 target                       # ProxyJump 跳板
ssh -i ~/.ssh/work_rsa user@host                # 指定密钥

# 端口转发
ssh -L 8080:localhost:80 user@host              # 本地转发
ssh -R 9090:localhost:8080 user@host            # 远程转发
ssh -D 1080 user@host                           # 动态 SOCKS 代理

# 文件传输
scp file user@host:/remote/path/                # SCP
sftp user@host                                  # SFTP 交互式
rsync -avz -e "ssh -p 2222" ./src/ user@host:/dst/  # 增量同步

# 密钥管理
ssh-keygen -t ed25519 -C "my@email.com"         # 生成密钥
ssh-copy-id user@host                           # 复制公钥
ssh-keygen -l -f ~/.ssh/id_ed25519.pub           # 查看指纹
ssh-agent -s                                     # 启动 agent
ssh-add ~/.ssh/id_ed25519                        # 加载私钥到 agent

# 服务端配置检查
sshd -T                                         # 检查配置语法
grep -E 'PermitRootLogin|PasswordAuthentication|PubkeyAuthentication' /etc/ssh/sshd_config
```
