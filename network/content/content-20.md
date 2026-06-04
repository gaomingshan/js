# 第 20 章：SNMP 协议

> **学习目标**：理解网络管理的协议体系与安全演进
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 SNMP 概述

SNMP（Simple Network Management Protocol）是网络管理的标准协议，用于监控和管理网络设备。采用 Manager-Agent 模型。

**SNMP 核心概念**：

```
Manager (NMS)                    Agent (被管设备)
    │                                │
    ├── GET/SET/GETNEXT ────────→   │  操作 MIB 变量
    │←─────── Response ───────────┤
    │←─────── Trap (主动上报) ───┤
    │                                │
    └── MIB (管理信息库)            └── MIB
        └── OID (对象标识符)           └── OID
```

**SNMP 核心特性**：
- 简单的请求-响应模式 + 主动上报（Trap）
- 基于 UDP：Manager 端口 162（接收 Trap），Agent 端口 161（接收请求）
- 使用 ASN.1/BER 编码
- 三个版本：SNMPv1、SNMPv2c、SNMPv3

---

## 2. 报文结构

### 2.1 SNMP 报文格式

**SNMPv1/v2c 报文**：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Version (Integer)  |  Community (Octet String)  |   PDU    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**SNMPv3 报文**：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Version=3  |  Header Data  |  Security Parameters  |  PDU  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.2 PDU 类型

| PDU | v1 | v2c | v3 | 说明 |
|-----|-----|------|-----|------|
| GetRequest | ✅ | ✅ | ✅ | 获取单个变量 |
| GetNextRequest | ✅ | ✅ | ✅ | 获取下一个变量 |
| GetResponse | ✅ | ✅ | ✅ | 响应 |
| SetRequest | ✅ | ✅ | ✅ | 设置变量值 |
| Trap | ✅ | - | - | v1 主动上报 |
| GetBulkRequest | - | ✅ | ✅ | 批量获取（高效遍历） |
| InformRequest | - | ✅ | ✅ | 确认型通知 |
| SNMPv2-Trap | - | ✅ | ✅ | v2c/v3 主动上报 |
| Report | - | - | ✅ | v3 报告 |

### 2.3 PDU 结构

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Request ID  |  Error Status  |  Error Index  | VarBind List |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

VarBind:
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  OID (Name)  |  Value                                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## 3. 具体能力

### 3.1 MIB 与 OID

MIB（Management Information Base）是管理对象的层次化数据库，用 OID（Object Identifier）标识：

```
OID 树结构:
1.3.6.1 (iso.org.dod.internet)
  ├── 1.3.6.1.2.1 (mgmt.mib-2) - 标准 MIB
  │     ├── 1.3.6.1.2.1.1 (system)
  │     │     ├── 1.3.6.1.2.1.1.1 (sysDescr) - 系统描述
  │     │     ├── 1.3.6.1.2.1.1.3 (sysUpTime) - 运行时间
  │     │     ├── 1.3.6.1.2.1.1.5 (sysName) - 系统名称
  │     │     └── 1.3.6.1.2.1.1.6 (sysLocation) - 位置
  │     ├── 1.3.6.1.2.1.2 (interfaces)
  │     │     ├── 1.3.6.1.2.1.2.1 (ifNumber) - 接口数量
  │     │     └── 1.3.6.1.2.1.2.2 (ifTable) - 接口表
  │     └── 1.3.6.1.2.1.4 (ip) - IP 统计
  └── 1.3.6.1.4.1 (enterprises) - 厂商私有 MIB
        ├── 1.3.6.1.4.1.9 (cisco)
        └── 1.3.6.1.4.1.2636 (juniper)
```

### 3.2 SNMP 操作

**Get**：获取指定 OID 的值

```
Manager → GetRequest OID=1.3.6.1.2.1.1.1.0
Agent  → Response Value="Linux server 5.15.0"
```

**GetNext**：获取指定 OID 的下一个变量（用于遍历表）

```
Manager → GetNextRequest OID=1.3.6.1.2.1.2.2.1.1
Agent  → Response OID=1.3.6.1.2.1.2.2.1.1.1, Value=1
Manager → GetNextRequest OID=1.3.6.1.2.1.2.2.1.1.1
Agent  → Response OID=1.3.6.1.2.1.2.2.1.1.2, Value=2
```

**GetBulk**（v2c/v3）：一次请求获取多个后续变量

```
Manager → GetBulkRequest non-repeaters=0, max-repetitions=10
Agent  → Response 10 个连续变量
→ 高效替代多次 GetNext
```

**Set**：修改可写变量

```
Manager → SetRequest OID=1.3.6.1.2.1.1.5.0, Value="new-hostname"
Agent  → Response (成功/失败)
```

**Trap**：Agent 主动上报事件

```
Agent → Trap OID=1.3.6.1.6.3.1.1.5.3 (linkDown)
        Variable: ifIndex=2, ifAdminStatus=down
```

### 3.3 版本差异

| 特性 | SNMPv1 | SNMPv2c | SNMPv3 |
|------|--------|---------|--------|
| 认证 | Community（明文） | Community（明文） | USM（加密认证） |
| 批量获取 | ❌ | ✅ GetBulk | ✅ GetBulk |
| 确认通知 | ❌ | ✅ Inform | ✅ Inform |
| 安全性 | 无 | 无 | 认证+加密 |
| Community | "public"/"private" | 同 v1 | 不使用 |

### 3.4 SNMPv3 安全模型（USM）

USM（User-based Security Model）提供认证和加密：

**认证**：
- HMAC-MD5-96（不推荐）
- HMAC-SHA-96（推荐）
- HMAC-SHA-256/512（更强）

**加密**：
- DES-CBC（不推荐）
- AES-128/192/256（推荐）

**SNMPv3 安全级别**：

| 级别 | 认证 | 加密 | 说明 |
|------|------|------|------|
| noAuthNoPriv | ❌ | ❌ | 无安全 |
| authNoPriv | ✅ | ❌ | 认证但不加密 |
| authPriv | ✅ | ✅ | 认证+加密 |

### 3.5 SNMPv3 引擎

```
snmpEngineID         → 引擎唯一标识
snmpEngineBoots      → 引擎启动次数
snmpEngineTime       → 引擎运行时间
snmpEngineMaxMessageSize → 最大消息大小

本地化密钥:
Key = Hash(AuthPassword + EngineID)
→ 每个设备的密钥不同，即使密码相同
```

---

## 4. 报文样例

### 4.1 SNMPv1 GetRequest（BER 编码）

```
30 29
  02 01 00                    → Version=0 (SNMPv1)
  04 06 70 75 62 6c 69 63    → Community="public"
  a0 1c                       → PDU=GetRequest (Tag=0xa0)
    02 01 01                  → Request ID=1
    02 01 00                  → Error Status=0
    02 01 00                  → Error Index=0
    30 0e                     → VarBindList
      30 0c                   → VarBind
        06 08 2b 06 01 02 01 01 01 00  → OID=1.3.6.1.2.1.1.1.0 (sysDescr)
        05 00                 → Value=NULL (请求时为空)
```

**BER 编码规则**：
- `30` = SEQUENCE, `02` = INTEGER, `04` = OCTET STRING
- `06` = OID, `05` = NULL, `a0-a3` = Context-specific PDU
- OID 编码：前两个组件合并 `1.3` → `2b`（1×40+3=43），其余直接编码

### 4.2 SNMPv1 GetResponse

```
30 3e
  02 01 00                    → Version=0
  04 06 70 75 62 6c 69 63    → Community="public"
  a2 31                       → PDU=GetResponse (Tag=0xa2)
    02 01 01                  → Request ID=1
    02 01 00                  → Error Status=0 (no error)
    02 01 00                  → Error Index=0
    30 24                     → VarBindList
      30 22                   → VarBind
        06 08 2b 06 01 02 01 01 01 00  → OID=1.3.6.1.2.1.1.1.0
        04 16 4c 69 6e 75 78 20 73 65 72 76 65 72 20 35 2e 31 35 2e 30
                  → Value="Linux server 5.15.0"
```

### 4.3 SNMPv2c GetBulkRequest

```
30 2a
  02 01 01                    → Version=1 (SNMPv2c)
  04 06 70 75 62 6c 69 63    → Community="public"
  a5 1d                       → PDU=GetBulkRequest (Tag=0xa5)
    02 01 02                  → Request ID=2
    02 01 00                  → Non-repeaters=0
    02 01 0a                  → Max-repetitions=10
    30 0e                     → VarBindList
      30 0c                   → VarBind
        06 08 2b 06 01 02 01 02 02 01 01  → OID=ifIndex
        05 00                 → Value=NULL
```

---

## 5. 深入一点

### SNMP 与监控系统集成

现代监控系统的 SNMP 集成：

```
网络设备 → SNMP Agent → SNMP Collector (Prometheus/Telegraf/Zabbix)
                                    ↓
                              时序数据库
                                    ↓
                              可视化/告警
```

### SNMP 安全最佳实践

- **禁用 SNMPv1/v2c**，使用 SNMPv3
- **修改默认 Community**："public"/"private" 是最常见攻击入口
- **ACL 限制**：仅允许 Manager IP 访问 Agent
- **只读 Community**：避免使用读写 Community
- **v3 authPriv**：生产环境必须使用认证+加密

---

## 参考资料

- [RFC 1157 - SNMPv1](https://datatracker.ietf.org/doc/html/rfc1157)
- [RFC 1901-1908 - SNMPv2c](https://datatracker.ietf.org/doc/html/rfc1901)
- [RFC 3411-3418 - SNMPv3](https://datatracker.ietf.org/doc/html/rfc3411)
- [RFC 2578 - SMIv2 (Structure of Management Information)](https://datatracker.ietf.org/doc/html/rfc2578)
