# SNMP 简单网络管理协议

> 应用层 | UDP 161/162 | Manager-Agent | MIB/OID | v1/v2c/v3

---

## 报文结构

SNMP 报文由 Version + Community + PDU 三层嵌套构成，BER 编码。

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Version (INTEGER)  |  Community (OCTET STRING)  |    PDU    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

PDU 内部结构：
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Request ID (INTEGER)  |  Error Status (INTEGER)              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Error Index (INTEGER)  |  VarBind List (SEQUENCE OF)          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

VarBind：
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  OID (OBJECT IDENTIFIER)  |  Value (任意类型)                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 编码 | 含义 |
|------|------|------|
| Version | INTEGER (0=v1, 1=v2c, 3=v3) | 协议版本 |
| Community | OCTET STRING | 明文密码 "public"/"private"（v1/v2c） |
| Request ID | INTEGER | 请求标识，匹配请求和响应 |
| Error Status | INTEGER | 0=无错误，1~5=各类错误 |
| Error Index | INTEGER | 出错变量在 VarBind 列表中的位置 |
| OID | OBJECT IDENTIFIER | 管理对象的节点路径（如 1.3.6.1.2.1.1.1.0） |
| Value | 任意 ASN.1 类型 | 请求时=NULL，响应时为实际值 |

### v3 报文结构（增加安全头部）

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Version=3  |  msgGlobalData  |  msgSecurityParameters         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  scopedPDU (encrypted)                                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

msgGlobalData:
|  msgID (INT)  |  msgMaxSize (INT)  |  msgFlags (OCTET)  |  msgSecurityModel (INT)  |

msgSecurityParameters (USM):
|  AuthoritativeEngineID  |  AuthoritativeEngineBoots  |
|  AuthoritativeEngineTime  |  UserName  |  authParameters  |  privParameters  |
```

| v3 字段 | 含义 |
|---------|------|
| msgID | 消息标识，防重放 |
| msgFlags | 控制位：authFlag / privFlag / reportableFlag |
| AuthoritativeEngineID | 引擎标识，用于本地化密钥派生 |
| authParameters | 认证摘要（HMAC 输出） |
| privParameters | 解密初始向量（IV） |

---

## 核心能力

### 1. Get / GetNext / GetBulk / Set / Trap

Manager 发起请求，Agent 返回响应或主动上报事件。

```
GetRequest（精确获取）：
Manager → GetRequest OID=1.3.6.1.2.1.1.1.0         sysDescr.0
Agent  → Response        Value="Linux 5.15"

GetNextRequest（遍历，获取下一个 OID）：
Manager → GetNextRequest OID=1.3.6.1.2.1.2.2.1.1      ifIndex
Agent  → Response        OID=1.3.6.1.2.1.2.2.1.1.1  Value=1
Manager → GetNextRequest OID=1.3.6.1.2.1.2.2.1.1.1
Agent  → Response        OID=1.3.6.1.2.1.2.2.1.1.2  Value=2
... 逐个遍历整张表

GetBulkRequest（v2c/v3，批量获取）：
Manager → GetBulkRequest non-repeaters=0 max-repetitions=10
Agent  → Response        10 个连续变量
→ 一次请求替代多次 GetNext，大幅减少交互次数

SetRequest（修改配置）：
Manager → SetRequest OID=1.3.6.1.2.1.1.5.0 Value="new-hostname"
Agent  → Response        (成功 / 失败 + ErrorIndex)

Trap（Agent 主动上报）：
Agent  → Trap OID=1.3.6.1.6.3.1.1.5.3 (linkDown)
         ifIndex=2, ifAdminStatus=down
→ Manager 无需轮询，Agent 在事件发生时主动通知
```

- Get/GetNext/GetBulk 是轮询模式，Manager 决定采集频率
- Trap 是事件驱动模式，Agent 在异常时主动推送
- Set 是可写操作，应通过 ACL 严格控制

---

### 2. MIB 与 OID —— 统一管理模型

为什么需要：不同厂商设备功能不同，需要一套标准化的命名体系让 Manager 无需了解设备细节就能统一管理。

```
OID 树（ISO/ITU 分配的层次命名空间）：

1.3.6.1 (iso.org.dod.internet)
  ├── 1.3.6.1.2.1 (mgmt.mib-2)     ← 标准 MIB-II
  │     ├── 1.3.6.1.2.1.1 (system)
  │     │     ├── .1 sysDescr      系统描述
  │     │     ├── .3 sysUpTime     运行时间
  │     │     ├── .5 sysName       主机名
  │     │     └── .6 sysLocation   位置
  │     ├── 1.3.6.1.2.1.2 (interfaces)
  │     │     ├── .1 ifNumber      接口数
  │     │     └── .2 ifTable       接口表
  │     └── 1.3.6.1.2.1.4 (ip)    IP 统计
  └── 1.3.6.1.4.1 (enterprises)   ← 厂商私有
        ├── .9       Cisco
        ├── .2636    Juniper
        └── .8072    Net-SNMP
```

- MIB 是 OID 的文本描述文件（.my 格式），将数字 OID 翻译为可读名称
- 标准 MIB-II (RFC 1213) 定义所有设备必须支持的基本变量
- 厂商私有 MIB 扩展专有功能（如 Cisco 的 CDP、Juniper 的 JUNOS 统计）
- OID 遍历是最核心的操作模式：先 Get ifNumber，再 GetNext 遍历 ifTable

---

### 3. v1/v2c/v3 安全差异

为什么 v3 更安全：v1/v2c 的 Community 是明文密码，无认证无加密，监听网络即可获取全部数据。

| 特性 | v1 | v2c | v3 (USM) |
|------|-----|------|----------|
| 认证 | Community 明文 | Community 明文 | USM（用户名+密码，HMAC 摘要） |
| 加密 | 无 | 无 | AES-128/256（authPriv） |
| 防重放 | 无 | 无 | EngineBoots + EngineTime |
| 批量获取 | ❌ | ✅ GetBulk | ✅ GetBulk |
| 确认通知 | ❌ | ✅ Inform | ✅ Inform |
| 密钥分发 | 无 | 无 | 本地化密钥（密码+EngineID 哈希） |

**v3 安全级别**：

| 级别 | 认证 | 加密 | 适用场景 |
|------|------|------|---------|
| noAuthNoPriv | ❌ | ❌ | 只读监控，内网隔离 |
| authNoPriv | ✅ | ❌ | 需确认身份，数据不敏感 |
| authPriv | ✅ | ✅ | 生产环境，修改配置 |

**v3 密钥派生（本地化密钥）**：

```
Key = HMAC_SHA(Password, EngineID)
→ 同一密码在不同设备上产生不同密钥
→ 即使一台设备密钥泄露，不影响其他设备
→ 首次通信需先 Discovery 获取 EngineID
```

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 Community 是明文密码 | v1/v2c 设计于 1980s，网络环境可信，简单胜于安全。现在看是重大设计缺陷 |
| 为什么基于 UDP 而非 TCP | 监控场景不能因 TCP 拥塞导致管理中断；Agent 不需维持连接状态 |
| 为什么 Trap 不可靠 | Trap 用 UDP 且无 ACK，Manager 可能收不到。v2c Inform 增加确认机制 |
| 为什么 OID 树不从 0 开始 | 1.3.6.1 是 iso(1).org(3).dod(6).internet(1)，ISO 分配的根 |
| 为什么需要 EngineBoots + EngineTime | 防重放攻击：即使抓到加密报文，旧报文也无法重放 |
| 为什么 SNMP 不做大规模采集 | 轮询模式 N 个设备 × M 个 OID，采集周期随规模线性增长。改用 Telemetry 推送 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| No Response | `snmpset/gets` 超时 | `snmpget -v2c -c public target 1.3.6.1.2.1.1.1.0` | Agent 不可达 / 端口未开 / Community 错误 |
| Timeout | 部分设备超时 | `snmpwalk -t 5 -r 2` 加超时 | Agent 负载高 / 网络丢包 |
| Wrong Community | `SNMP: Unknown user name` | 检查 Community 大小写 | public/private 被修改或禁用 |
| v3 Auth Failure | `Authentication failure` | 检查用户名和密码 | USM 密码错误 / EngineID 变化 |
| 遍历中断 | GetNext 返回 endOfMibView | 检查 OID 路径 | 无此节点 / 权限不足 |
| 响应 OID 不连续 | VarBind 列表中部分失败 | 查看 ErrorStatus + ErrorIndex | 某 OID 不存在或只读 |
| SNMP 数据异常 | 值跳变/为 0 | 对比 ifHCInOctets（64bit）和 ifInOctets（32bit） | 32bit 计数器溢出 |

```bash
# 一键检查
echo "=== SNMPv2c Get ==="
snmpget -v2c -c public 192.168.1.1 1.3.6.1.2.1.1.1.0
echo "=== SNMPv2c Walk ==="
snmpwalk -v2c -c public 192.168.1.1 1.3.6.1.2.1.2
echo "=== SNMPv3 ==="
snmpget -v3 -u admin -l authPriv -a SHA -A authpwd -x AES -X privpwd 192.168.1.1 sysName.0
```

---

## 常用工具

```bash
# snmpget —— 精确获取
snmpget -v2c -c public 192.168.1.1 sysName.0

# snmpwalk —— 遍历子树
snmpwalk -v2c -c public 192.168.1.1 system
snmpwalk -v2c -c public 192.168.1.1 .1.3.6.1.2.1.2.2  # ifTable

# snmpbulkget —— 批量获取（v2c/v3）
snmpbulkget -v2c -c public -Cn0 -Cr10 192.168.1.1 ifTable

# snmpset —— 配置修改
snmpset -v2c -c private 192.168.1.1 sysName.0 s new-hostname

# snmptrapd —— 接收 Trap
snmptrapd -f -Lo -c /etc/snmp/snmptrapd.conf

# snmpstatus —— 设备概览
snmpstatus -v2c -c public 192.168.1.1

# netstat/ss —— 检查 SNMP 端口
netstat -anu | grep ':161 '
ss -uan 'sport = :161'

# tcpdump —— 抓 SNMP 报文
tcpdump -i eth0 -nn -s0 'port 161' -X                     # 看具体 BER 字节
tcpdump -i eth0 -nn -s0 'port 162'                         # 抓 Trap

# 常用 MIB 浏览器
# net-snmp 命令行：snmptranslate
snmptranslate -Tp -IR system                               # 可视化 OID 树
snmptranslate -On -IR sysName.0                            # 名称→OID
snmptranslate -Td -IR sysName.0                            # 查看变量定义
```
