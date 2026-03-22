# 安全初始化与访问控制

## 概述

MongoDB 默认安装不开启认证，任何本地连接都可以直接访问。生产环境必须完成安全初始化，建立认证、授权、传输加密三道防线。

---

## 认证机制

### SCRAM-SHA-256（默认）

MongoDB 4.0+ 默认使用 SCRAM-SHA-256，基于用户名/密码的挑战-响应认证。

```js
// 创建管理员用户（首次，需在未开启认证时执行）
use admin
db.createUser({
  user: "admin",
  pwd: "StrongPassword123!",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase",  db: "admin" },
    { role: "clusterAdmin",          db: "admin" }
  ]
})

// 之后在 mongod.conf 开启认证
// security:
//   authorization: enabled
```

### x.509 证书认证

```bash
# 生成 CA 证书
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
  -subj "/CN=MongoDB-CA/O=MyOrg"

# 生成服务端证书
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \
  -subj "/CN=mongodb-server/O=MyOrg"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out server.crt -days 3650

# 合并为 PEM（MongoDB 要求）
cat server.crt server.key > server.pem
```

```yaml
# mongod.conf TLS 配置
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/ssl/mongodb/server.pem
    CAFile: /etc/ssl/mongodb/ca.crt
    allowConnectionsWithoutCertificates: false
```

---

## 内置角色体系

### 数据库级别角色

| 角色 | 权限 | 适用场景 |
|------|------|----------|
| `read` | 只读 | 报表服务、BI 工具 |
| `readWrite` | 读写 | 业务应用 |
| `dbAdmin` | Schema 管理、索引 | DBA 操作 |
| `dbOwner` | 数据库完全控制 | 数据库管理员 |

### 集群级别角色

| 角色 | 权限 |
|------|------|
| `clusterMonitor` | 只读监控 |
| `clusterAdmin` | 集群完全控制 |
| `backup` | 备份操作 |
| `restore` | 恢复操作 |

### 超级角色

| 角色 | 权限 |
|------|------|
| `root` | 所有操作（慎用）|
| `userAdminAnyDatabase` | 管理所有数据库的用户 |
| `readWriteAnyDatabase` | 读写所有数据库 |

---

## 自定义角色（Custom Roles）

```js
// 创建只允许查询订单的只读角色
use admin
db.createRole({
  role: "orderReadOnly",
  privileges: [
    {
      resource: { db: "ecommerce", collection: "orders" },
      actions: ["find"]
    },
    {
      resource: { db: "ecommerce", collection: "orderItems" },
      actions: ["find"]
    }
  ],
  roles: []  // 不继承其他角色
})

// 创建具有该角色的用户
use ecommerce
db.createUser({
  user: "order_reader",
  pwd: "ReadPass789!",
  roles: [{ role: "orderReadOnly", db: "admin" }]
})
```

---

## 副本集内部认证（keyFile）

副本集成员间通信需要认证，防止未授权节点加入。

```bash
# 生成 keyfile
openssl rand -base64 756 > /etc/mongodb/keyfile
chmod 400 /etc/mongodb/keyfile
chown mongodb:mongodb /etc/mongodb/keyfile
```

```yaml
# mongod.conf
security:
  authorization: enabled
  keyFile: /etc/mongodb/keyfile   # 副本集内部认证
```

---

## IP 白名单与网络隔离

```yaml
# mongod.conf：只绑定内网 IP
net:
  bindIp: 127.0.0.1,10.0.0.10  # 不要绑定 0.0.0.0
  port: 27017
```

```bash
# 防火墙规则（仅允许应用服务器访问）
iptables -A INPUT -p tcp --dport 27017 -s 10.0.0.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 27017 -j DROP
```

---

## 审计日志（Enterprise / Atlas）

```yaml
# mongod.conf（Enterprise 版）
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.log
  filter: |
    {
      atype: {
        $in: ["authenticate", "createCollection", "dropCollection",
               "createIndex", "dropIndex", "insert", "delete", "update"]
      }
    }
```

---

## 安全配置检查清单

```
✅ 开启 security.authorization: enabled
✅ 删除或禁用默认的 test 数据库访问
✅ 为每个应用创建最小权限用户
✅ 生产环境开启 TLS（requireTLS）
✅ bindIp 绑定内网 IP，不暴露公网
✅ 防火墙限制 27017 端口访问来源
✅ 副本集开启 keyFile 内部认证
✅ 定期审计用户权限（db.getUsers()）
✅ 开启审计日志（Enterprise/Atlas）
✅ 定期轮换密码和证书
```

---

## 总结

- 生产环境三要素：认证（Authorization）+ 传输加密（TLS）+ 网络隔离
- 遵循最小权限原则，每个应用使用独立的数据库用户
- 副本集成员间必须开启 keyFile 认证
- 优先使用 SCRAM-SHA-256，高安全场景使用 x.509 证书

**下一步**：深入理解 MongoDB 的写入路径与存储机制。
