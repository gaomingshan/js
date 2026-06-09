# TLS 安全传输层协议

> 应用层安全 | 加密 | 认证 | 完整性 | 443 端口 | 记录层封装

---

## 报文结构

TLS 所有数据都通过记录层（Record Layer）封装，其上是握手/警报/应用数据子协议。

### Record Layer 头部

```
 0                   1                   2                   3
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  ContentType  |    Version    |            Length            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                          Fragment                             +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| ContentType | 8bit | 20=ChangeCipherSpec, 21=Alert, 22=Handshake, 23=Application Data |
| Version | 16bit | 记录层版本（0x0303=TLS 1.2，TLS 1.3 为兼容填 0x0303） |
| Length | 16bit | 载荷长度（明文最大 16384，AEAD 加 16B 标签等） |
| Fragment | 可变 | 加密或未加密的内容 |

### Handshake 类型表

| 值 | 类型 | 说明 |
|----|------|------|
| 1 | ClientHello | 握手起始，携带随机数 / 密码套件 / 扩展 |
| 2 | ServerHello | 服务端选密码套件 / 随机数 |
| 11 | Certificate | 证书链（TLS 1.3 加密传输） |
| 12 | ServerKeyExchange | DHE/ECDHE 参数+签名（TLS 1.2） |
| 14 | ServerHelloDone | 服务器结束第一轮（TLS 1.2） |
| 16 | ClientKeyExchange | 客户端密钥交换参数（TLS 1.2） |
| 15 | CertificateVerify | 客户端证书签名验证（双向认证） |
| 20 | Finished | 握手完整性校验（加密+MAC） |

---

## 核心能力

### 1. TLS 1.2 握手 —— 2-RTT

每次建立连接需要两次往返协商密钥和验证身份，后一个 RTT 的 ChangeCipherSpec 和 Finished 是单独的消息。

```
Client                                   Server
  |                                         |
  |─── ClientHello ─────────────────────→|  随机数C，密码套件列表，扩展(SNI)
  |                                         |
  |←── ServerHello ─────────────────────|  随机数S，选定套件
  |←── Certificate ─────────────────────|  服务器证书链
  |←── ServerKeyExchange ───────────────|  ECDHE 参数 + 签名
  |←── ServerHelloDone ────────────────|
  |                                         |
  |─── ClientKeyExchange ───────────────→|  ECDHE 公钥
  |─── ChangeCipherSpec ────────────────→|  切换加密
  |─── Finished(加密) ───────────────────→|
  |                                         |
  |←── ChangeCipherSpec ────────────────|
  |←── Finished(加密) ───────────────────|
  |                                         |
  |          应用数据加密传输                |
  |                                         |
```

- Full Handshake 需要 2-RTT 才能发应用数据
- 会话恢复（Session ID / Session Ticket）可降到 1-RTT
- 密码套件组合多：`TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`
- 密钥推导：Pre-Master Secret → Master Secret → Key Block（6 个密钥）

### 2. TLS 1.3 握手 —— 1-RTT / 0-RTT

将握手压缩到 1 个往返，删除了 ChangeCipherSpec 和 ServerKeyExchange 等冗余消息。服务端发完 ServerHello 后的所有消息（含证书）都已加密。

```
1-RTT 首次连接：
Client                                   Server
  |                                         |
  |─── ClientHello ─────────────────────→|  密码套件 + key_share(ECDHE) + supported_versions=1.3
  |                                         |  立即算出手会话密钥
  |←── ServerHello ─────────────────────|  key_share + 选定套件
  |←── EncryptedExtensions ─────────────|  ← 已加密
  |←── Certificate(加密) ───────────────|
  |←── CertificateVerify(加密) ─────────|
  |←── Finished(加密) ───────────────────|
  |                                         |
  |─── Finished(加密) ───────────────────→|  ← 此时可以发应用数据
  |←── 应用数据(加密) ───────────────────|
  |                                         |

0-RTT 恢复（PSK）：
Client                                   Server
  |                                         |
  |─── ClientHello(PSK) + Early Data ───→|  第一次报文就带应用数据
  |←── ServerHello + 应用数据 ───────────|
  |                                         |
```

- 首次连接 1-RTT，恢复连接 0-RTT（Early Data 随 ClientHello 发出）
- 所有握手消息（除 ClientHello/ServerHello 外）全程加密
- 强制前向保密（仅保留 ECDHE / DHE）

### 3. 密码套件协商 —— 收发双方选一个都支持的

ClientHello 列出所有支持的密码套件（优先级高→低），ServerHello 选一个它也支持且最安全的。

```
ClientHello:                              ServerHello:
  TLS_AES_128_GCM_SHA256       (首选)     选：TLS_AES_128_GCM_SHA256
  TLS_AES_256_GCM_SHA384                  (TLS 1.3 列表固定)
  TLS_CHACHA20_POLY1305_SHA256
  TLS_AES_128_CCM_SHA256
```

**为什么需要协商**：
- 不同设备能力不同（移动端无 AES-NI 爱用 ChaCha20）
- 不同安全基准：政府要求 AES-256，互联网偏好 AES-128（更快）
- TLS 1.3 简化：密码套件只定对称加密+哈希，密钥交换固定为 ECDHE

| TLS 1.3 套件 | 对称加密 | AEAD | 哈希 |
|--------------|---------|------|------|
| TLS_AES_128_GCM_SHA256 | AES-128-GCM | ✓ | SHA-256 |
| TLS_AES_256_GCM_SHA384 | AES-256-GCM | ✓ | SHA-384 |
| TLS_CHACHA20_POLY1305_SHA256 | ChaCha20-Poly1305 | ✓ | SHA-256 |

### 4. 证书链验证 —— 确认你连的是对的服务器

```
根 CA（信任锚，预置在 OS/浏览器）← 自签名
  └── 中间 CA                          ← 根 CA 签发
        └── 服务器证书                  ← 中间 CA 签发
```

**为什么需要证书链**：
- 不使用证书 → 无法确认对方公钥属于对方（MITM 风险）
- 不信任服务端公钥 → ECDHE 交换的密钥可能发给攻击者

**验证流程**：
1. 服务端发送证书链（自下而上：服务器证书 → 中间 CA → 根 CA）
2. 客户端逐级向上验证签名（子证书的签名用父证书公钥验）
3. 最终遇到信任锚（预置入系统的根 CA）
4. 额外检查：有效期、CRL/OCSP 吊销状态、域名匹配

### 5. AEAD 加密 —— 一次完成加密+认证

TLS 1.3 仅允许 AEAD 模式，不再使用"加密+独立 MAC"的旧模式。

```
AES-128-GCM：
  输入：密钥 + nonce(12B) + 明文 + 附加数据
  输出：密文 + 认证标签(16B)
  附加数据 = TLS 记录层头部 (ContentType + Version + Length)
  nonce   = sequence_number XOR write_IV

ChaCha20-Poly1305：
  流加密 + Poly1305 一次性 MAC
  无硬件加速需求，移动端性能好
```

**为什么 AEAD**：
- 加密+认证同时完成，少一次数据遍历（性能）
- 防止先解密后 MAC 的时序侧信道攻击（TLS 1.0/1.1 CBC 的历史教训）
- TLS 1.3 的 Record Layer 自动追加 Tag，不增加 RTT

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 TLS 1.3 删除 RSA 密钥交换 | RSA 无前向保密——私钥泄露后历史会话全部可解密。ECDHE 每次握手持临时密钥，私钥泄露影响不了过去会话 |
| 为什么 0-RTT 有重放风险 | Early Data 随 ClientHello 发出，服务器收到相同的 ClientHello 和 Early Data 可能被重放（如"转账"请求）。解法：只对幂等操作（GET）做 0-RTT |
| 为什么 TLS 1.3 不兼容 1.2 的密码套件 | 删除 CBC、RC4、SHA-1、RSA 等数十个弱套件，仅保留 5 个 AEAD 套件，避免协商复杂度 |
| 为什么 Certificate 在 TLS 1.3 中加密 | 防指纹——隐藏证书中的域名、组织信息，防止中间人顺带看到发了什么证书 |
| 为什么需要 ChangeCipherSpec | 历史遗留。TLS 1.2 中区分"还在握手"和"已加密"。TLS 1.3 中已移除，仅存在兼容性空包 |
| 为什么 TLS 需要 SNI 扩展 | 单个 IP 可托管多个 HTTPS 域名（虚拟主机），SNI 告诉服务器要哪个证书 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| 证书过期 | 浏览器提示 NET::ERR_CERT_DATE_INVALID | `openssl x509 -in cert.pem -text \| grep -A2 Validity` | 忘了续期 |
| 证书域名错误 | NET::ERR_CERT_COMMON_NAME_INVALID | `openssl x509 -in cert.pem -text \| grep -A1 Subject` | CN/SAN 不匹配请求域名 |
| TLS 版本不兼容 | curl 报 SSL_ERROR_UNSUPPORTED_VERSION | `openssl s_client -connect host:443 -tls1_2` 逐个版本试 | 服务端只支持旧版 / 客户端只支持新版 |
| 密码套件不匹配 | 握手失败 | `openssl s_client -connect host:443 -cipher 'ECDHE'` | 服务端只配了不安全套件，客户端禁用了 |
| 证书链不完整 | curl 报 SSL certificate problem | `openssl s_client -showcerts -connect host:443` | 缺少中间 CA 证书 |
| OCSP 不可达 | 证书验证卡住 | 检查服务端能否访问 OCSP Responder | 防火墙阻断 OCSP 端口 |
| SNI 未发送 | 拿到默认证书（通常是第一个虚拟主机） | `openssl s_client -servername example.com -connect 1.2.3.4:443` | 客户端不支持 SNI（罕见） |
| 0-RTT 重放 | 重复的交易请求 | 服务端看重复的 Early Data nonce | 应用未做幂等校验 |

---

## 常用工具

```bash
# OpenSSL —— 调试 TLS 连接
openssl s_client -connect example.com:443 -tls1_3           # TLS 1.3 握手详情
openssl s_client -connect example.com:443 -servername a.com  # 指定 SNI
openssl s_client -showcerts -connect example.com:443         # 打印完整证书链
openssl s_time -connect example.com:443 -new                 # 性能测试（新建连接数/秒）

# 查看证书
openssl x509 -in cert.pem -text -noout                       # 证书全部信息
openssl x509 -in cert.pem -dates -noout                      # 有效期
openssl verify -CAfile ca.pem cert.pem                       # 验证证书链

# 密码套件
openssl ciphers -v 'TLSv1.3'                                 # TLS 1.3 套件列表
openssl ciphers -v 'ECDHE+AESGCM'                            # 筛选特定套件

# tcpdump —— 抓 TLS 握手
tcpdump -i eth0 -X 'tcp port 443 and tcp[0] & 0x0f = 5'     # 只抓 TLS Record Layer（数据偏移=5 表示无 TCP 选项）
tcpdump -i eth0 -nn 'tcp port 443' and 'len > 60'           # 有载荷的 TLS 报文
tcpdump -i eth0 -X 'tcp[20]=22 and tcp[21]=1'               # 抓 ClientHello（ContentType=22, Handshake=1）

# ss / curl
ss -tanp 'sport = :443'                                      # 看 HTTPS 连接队列
curl -v --tls-max 1.3 https://example.com                    # 强制 TLS 1.3
curl -v --ciphers 'ECDHE-AES128-GCM-SHA256' https://...     # 指定密码套件

# 调试
openssl s_client -debug -connect host:443                    # 打印所有握手字节
```
