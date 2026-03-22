# 安全合规与数据生命周期管理

## 概述

企业级 MongoDB 需要满足 GDPR、等保、SOC2 等合规要求。本章覆盖数据加密、权限最小化、生命周期管理和合规审计四个维度。

---

## 传输加密（TLS）

```yaml
# mongod.conf
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/ssl/mongodb/server.pem
    CAFile: /etc/ssl/mongodb/ca.pem
    allowConnectionsWithoutCertificates: false
    disabledProtocols: TLS1_0,TLS1_1  # 禁用老旧协议
```

```bash
# 验证 TLS 连接
mongosh --tls \
  --tlsCertificateKeyFile /etc/ssl/client.pem \
  --tlsCAFile /etc/ssl/ca.pem \
  "mongodb://admin:pass@mongo1:27017/admin"
```

---

## 存储加密（Encryption at Rest）

### Enterprise/Atlas 加密

```yaml
# mongod.conf（Enterprise）
security:
  enableEncryption: true
  encryptionKeyFile: /etc/mongodb/encryption.key
  # 或使用 KMIP（密钥管理互操作协议）
  kmip:
    serverName: kmip-server.internal
    port: 5696
    clientCertificateFile: /etc/ssl/kmip-client.pem
    serverCAFile: /etc/ssl/kmip-ca.pem
```

### 社区版替代：文件系统加密

```bash
# Linux LUKS 加密数据目录
cryptsetup luksFormat /dev/sdb
cryptsetup luksOpen /dev/sdb mongo-data
mkfs.ext4 /dev/mapper/mongo-data
mount /dev/mapper/mongo-data /data/mongodb
```

---

## 字段级加密（FLE）

Atlas / MongoDB Enterprise 支持客户端字段级加密（CSFLE），敏感字段在离开应用前即加密。

```java
// 应用层加密（社区版方案：手动加密敏感字段）
@Component
public class FieldEncryptionService {

    private final AESEncryptor encryptor;  // AES-256-GCM

    // 存储时加密
    public UserDocument encryptSensitiveFields(User user) {
        return UserDocument.builder()
            .userId(user.getUserId())
            .name(user.getName())
            .idNumber(encryptor.encrypt(user.getIdNumber()))   // 加密身份证
            .phone(encryptor.encrypt(user.getPhone()))         // 加密手机号
            .phoneMasked(maskPhone(user.getPhone()))           // 明文脱敏展示
            .build();
    }

    // 查询时解密
    public User decryptSensitiveFields(UserDocument doc) {
        return User.builder()
            .userId(doc.getUserId())
            .name(doc.getName())
            .idNumber(encryptor.decrypt(doc.getIdNumber()))
            .phone(encryptor.decrypt(doc.getPhone()))
            .build();
    }

    private String maskPhone(String phone) {
        return phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
    }
}
```

---

## 权限最小化原则

```js
// 生产环境用户权限设计

// 1. 应用程序用户（只读写业务库）
db.createUser({
  user: "app_order_service",
  pwd: "StrongPass123!",
  roles: [{ role: "readWrite", db: "ecommerce" }]
})

// 2. 只读用户（报表/BI 工具）
db.createUser({
  user: "bi_reader",
  pwd: "ReadOnly456!",
  roles: [{ role: "read", db: "ecommerce" }]
})

// 3. DBA 用户（运维）
db.createUser({
  user: "dba_ops",
  pwd: "DbaPass789!",
  roles: [
    { role: "dbAdmin", db: "ecommerce" },
    { role: "clusterMonitor", db: "admin" }
  ]
})

// 4. 备份用户（最小备份权限）
db.createUser({
  user: "backup_agent",
  pwd: "BackupPass!",
  roles: [{ role: "backup", db: "admin" }]
})

// 5. 禁止超级用户直接连生产
// 生产环境不应直接使用 root 角色
```

---

## 数据生命周期管理

### TTL 索引自动过期

```js
// Session 数据：1小时后过期
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })

// 验证码：5分钟后过期
db.verification_codes.createIndex(
  { expireAt: 1 }, { expireAfterSeconds: 0 }
)

// 临时推荐数据：每天刷新
db.recommendations.createIndex(
  { generatedAt: 1 }, { expireAfterSeconds: 86400 }
)
```

### 冷热数据分层

```js
// 热数据（最近 3 个月订单）：高性能 SSD 集合
db.orders.find({ createdAt: { $gte: threeMonthsAgo } })

// 归档流程（批量迁移旧数据）
async function archiveOldOrders() {
  const cutoffDate = new Date(Date.now() - 90 * 86400000)
  const cursor = db.orders.find({ createdAt: { $lt: cutoffDate } })

  const batch = []
  for await (const doc of cursor) {
    batch.push(doc)
    if (batch.length === 1000) {
      await db.orders_archive.insertMany(batch, { ordered: false })
      const ids = batch.map(d => d._id)
      await db.orders.deleteMany({ _id: { $in: ids } })
      batch.length = 0
    }
  }
  // 处理剩余
  if (batch.length > 0) {
    await db.orders_archive.insertMany(batch, { ordered: false })
    const ids = batch.map(d => d._id)
    await db.orders.deleteMany({ _id: { $in: ids } })
  }
}
```

### 数据保留策略

```
数据分类与保留期限（参考等保/GDPR）：

| 数据类型 | 保留期限 | 处理方式 |
|----------|----------|----------|
| 用户行为日志 | 90 天 | TTL 索引自动删除 |
| 订单数据 | 7 年（税务要求）| 归档到冷存储 |
| 用户个人信息 | 用户注销后 30 天 | 匿名化处理 |
| 支付记录 | 5 年 | 加密归档 |
| 系统日志 | 180 天 | ELK 归档 |
```

---

## 用户注销与数据匿名化（GDPR 合规）

```java
@Service
public class DataDeletionService {

    @Autowired
    private MongoTemplate mongoTemplate;

    // GDPR 遗忘权：用户注销时匿名化个人数据
    @Transactional
    public void anonymizeUser(String userId) {
        String anonymousId = "deleted_" + UUID.randomUUID().toString().replace("-", "");

        // 1. 匿名化用户信息
        mongoTemplate.updateFirst(
            new Query(Criteria.where("userId").is(userId)),
            new Update()
                .set("name", "已注销用户")
                .set("email", anonymousId + "@deleted.invalid")
                .set("phone", "")
                .set("idNumber", "")
                .set("deleted", true)
                .set("deletedAt", LocalDateTime.now()),
            User.class
        );

        // 2. 订单保留（税务合规），脱敏收货人信息
        mongoTemplate.updateMulti(
            new Query(Criteria.where("userId").is(userId)),
            new Update()
                .set("shippingAddress.name", "已注销")
                .set("shippingAddress.phone", ""),
            Order.class
        );

        // 3. 删除行为日志
        mongoTemplate.remove(
            new Query(Criteria.where("userId").is(userId)),
            UserEvent.class
        );

        log.info("用户 {} 数据已匿名化处理", userId);
    }
}
```

---

## 合规检查清单

```
✅ 传输加密：requireTLS，禁用 TLS1.0/1.1
✅ 存储加密：Enterprise 加密 或 文件系统加密
✅ 字段级加密：敏感字段（身份证、手机、银行卡）应用层加密存储
✅ 权限最小化：每个应用使用独立用户，只赋予所需权限
✅ 审计日志：记录所有认证、数据变更、权限变更操作
✅ 数据保留：按法规要求设置保留期限和删除策略
✅ 用户注销：提供数据匿名化/删除能力（GDPR 遗忘权）
✅ 网络隔离：MongoDB 不暴露公网，内网 VPC 访问
✅ 密钥管理：使用 KMS（如 AWS KMS）管理加密密钥
✅ 定期审计：每季度审计用户权限，清理不活跃账号
```

---

## 总结

- 传输加密（TLS）+ 存储加密 + 字段加密，三层防御体系
- 权限最小化：不同角色不同用户，生产禁用超级权限
- TTL 索引自动清理临时数据，归档流程处理长期数据
- GDPR 合规：提供用户数据匿名化能力，而非物理删除（保留业务数据）
- 定期安全审计是合规的持续性要求

**下一步**：生产变更规范与故障演练。
