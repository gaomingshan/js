# Field Level Encryption（FLE）

## 概述

Field Level Encryption（字段级加密，FLE）允许在客户端对特定敏感字段加密后再存储到 MongoDB，服务端始终只看到密文。即使数据库被攻破，敏感数据也无法被直接读取。MongoDB 6.0 进一步引入可查询加密（Queryable Encryption，QE），支持对加密字段进行等值查询。

---

## FLE 架构原理

```
客户端（应用层）
  ├── 明文数据
  ├── 加密密钥（DEK，Data Encryption Key）
  └── 主密钥（CMK，Customer Master Key）→ 存储在 KMS
         ↓ 加密
  密文数据 → MongoDB Atlas / 自建 mongod

数据流：
  写入：应用获取 DEK → 加密字段 → 写入密文到 MongoDB
  读取：MongoDB 返回密文 → 应用从 KMS 获取 DEK → 解密 → 明文

特点：
  - 服务端（mongod）始终只存储密文
  - DBA 和 MongoDB 管理员无法看到明文
  - 密钥由客户方掌控（KMS）
```

---

## CSFLE（客户端字段级加密）

### 加密算法类型

```
确定性加密（Deterministic）：
  - 相同明文 → 相同密文
  - 支持等值查询（$eq）
  - 安全性略低（频率分析攻击风险）
  - 适用：需要查询的字段，如身份证号（等值查找）

随机加密（Random）：
  - 相同明文 → 不同密文（含随机 IV）
  - 不支持查询，只能解密后使用
  - 安全性更高
  - 适用：不需要查询的字段，如银行卡号、医疗记录
```

### Node.js CSFLE 示例

```js
const { ClientEncryption } = require('mongodb-client-encryption')

// 1. 配置 KMS（本地文件密钥，仅用于开发）
const kmsProviders = {
  local: {
    key: Buffer.alloc(96)  // 生产使用 AWS KMS / Azure Key Vault
  }
}

// 2. 创建 Data Encryption Key（DEK）
const keyVaultNamespace = 'encryption.__keyVault'
const clientEncryption = new ClientEncryption(client, {
  keyVaultNamespace,
  kmsProviders
})

const dataKeyId = await clientEncryption.createDataKey('local', {
  keyAltNames: ['user-sensitive-key']
})

// 3. 定义加密 Schema
const encryptedFieldsMap = {
  'mydb.users': {
    fields: [
      {
        path:     'idNumber',   // 身份证号：确定性加密（支持等值查询）
        bsonType: 'string',
        keyId:    dataKeyId,
        queries:  { queryType: 'equality' }
      },
      {
        path:     'bankCard',   // 银行卡号：随机加密（不可查询）
        bsonType: 'string',
        keyId:    dataKeyId
        // 不配置 queries → 随机加密
      }
    ]
  }
}

// 4. 使用加密客户端
const secureClient = new MongoClient(uri, {
  autoEncryption: {
    keyVaultNamespace,
    kmsProviders,
    encryptedFieldsMap
  }
})

// 写入时自动加密
await secureClient.db('mydb').collection('users').insertOne({
  name:     '张三',
  idNumber: '440301199001011234',  // 自动加密存储
  bankCard: '6222000012345678'     // 自动加密存储
})

// 读取时自动解密（返回明文）
const user = await secureClient.db('mydb').collection('users')
  .findOne({ idNumber: '440301199001011234' })  // 等值查询（确定性加密支持）
console.log(user.idNumber)  // 明文：440301199001011234
console.log(user.bankCard)  // 明文：6222000012345678
```

---

## 可查询加密（Queryable Encryption，6.0+）

```
QE 是 CSFLE 的升级版：
  - 支持对加密字段进行等值查询和范围查询
  - 使用更先进的加密方案（结构化加密）
  - 即使是确定性加密也更安全（防频率分析）
  - 仅 MongoDB Atlas 和 Enterprise 支持
```

```js
// QE 配置示例
const encryptedFieldsMap = {
  'mydb.patients': {
    fields: [
      {
        path:     'ssn',
        bsonType: 'string',
        queries:  [{ queryType: 'equality' }]  // 支持等值查询
      },
      {
        path:     'age',
        bsonType: 'int',
        queries:  [{ queryType: 'range',     // 支持范围查询
                     min: 0, max: 150 }]
      }
    ]
  }
}
```

---

## KMS 集成

```js
// AWS KMS 集成（生产推荐）
const kmsProviders = {
  aws: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
}

// 使用 AWS KMS 创建 DEK
const dataKeyId = await clientEncryption.createDataKey('aws', {
  masterKey: {
    key:    'arn:aws:kms:us-east-1:123456789:key/xxx',  // CMK ARN
    region: 'us-east-1'
  },
  keyAltNames: ['prod-user-key']
})

// Azure Key Vault
const kmsProviders = {
  azure: {
    tenantId:     process.env.AZURE_TENANT_ID,
    clientId:     process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  }
}

// GCP KMS
const kmsProviders = {
  gcp: {
    email:      process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GCP_PRIVATE_KEY
  }
}
```

---

## Java 集成示例

```java
// Java CSFLE 配置
@Configuration
public class MongoFleConfig {

  @Bean
  public MongoClient secureMongoClient() {
    Map<String, Map<String, Object>> kmsProviders = new HashMap<>();
    // 开发环境：本地密钥
    byte[] localKey = new byte[96];
    new SecureRandom().nextBytes(localKey);
    kmsProviders.put("local", Map.of("key", localKey));

    AutoEncryptionSettings autoEncryptionSettings =
      AutoEncryptionSettings.builder()
        .keyVaultNamespace("encryption.__keyVault")
        .kmsProviders(kmsProviders)
        .build();

    return MongoClients.create(
      MongoClientSettings.builder()
        .applyConnectionString(new ConnectionString(mongoUri))
        .autoEncryptionSettings(autoEncryptionSettings)
        .build()
    );
  }
}
```

---

## 应用层手动加密（社区版方案）

```java
// 非 Atlas/Enterprise 环境：应用层手动加密敏感字段
@Component
public class FieldEncryptionService {

  private final AESEncryptor aes;  // AES-256-GCM

  // 存储前加密
  public UserDocument encrypt(User user) {
    return UserDocument.builder()
      .userId(user.getUserId())
      .name(user.getName())                          // 非敏感：明文
      .idNumberEnc(aes.encrypt(user.getIdNumber()))  // 加密身份证
      .phoneEnc(aes.encrypt(user.getPhone()))        // 加密手机号
      .phoneMasked(maskPhone(user.getPhone()))        // 明文脱敏展示
      .build();
  }

  // 读取后解密
  public User decrypt(UserDocument doc) {
    return User.builder()
      .userId(doc.getUserId())
      .name(doc.getName())
      .idNumber(aes.decrypt(doc.getIdNumberEnc()))
      .phone(aes.decrypt(doc.getPhoneEnc()))
      .build();
  }

  private String maskPhone(String phone) {
    return phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
  }
}
```

---

## 性能影响与限制

```
性能影响：
  - 每次写入：加密操作（毫秒级）+ KMS 密钥获取（可缓存）
  - 每次读取：解密操作（毫秒级）
  - 首次 KMS 调用有网络延迟，后续可缓存 DEK

使用限制：
  - 加密字段不能作为分片键
  - 随机加密字段不支持范围查询（只能解密后过滤）
  - 加密字段不能建立普通索引（QE 有特殊索引）
  - $lookup 不支持加密字段
  - 聚合管道中加密字段不可直接操作

适用场景（高价值敏感数据）：
  ✅ 身份证号、护照号
  ✅ 银行卡号、信用卡信息
  ✅ 医疗健康数据
  ✅ 密码（应使用哈希，不是加密）
```

---

## 企业案例：身份证与银行卡加密存储

```
合规要求（PCI DSS / 等保三级）：
  - 持卡人数据必须加密存储
  - 密钥不能与加密数据存在同一位置
  - 必须定期轮换加密密钥

实施方案：
  1. 银行卡号：随机加密（不需要直接查询，通过业务ID查）
  2. 身份证号：确定性加密（需要等值查询验证身份）
  3. 手机号：应用层 AES + 明文脱敏字段（用于展示）
  4. 密钥存储：AWS KMS / 阿里云 KMS
  5. DEK 缓存：应用内存缓存 1 小时，定期刷新

密钥轮换流程：
  1. 生成新 DEK
  2. 批量读取旧密文 → 解密 → 用新 DEK 加密 → 写回
  3. 旧 DEK 撤销
  4. 需在业务低峰期执行，分批处理
```

---

## 总结

- FLE 在客户端加密，服务端只存密文，DBA 无法看到明文数据
- 确定性加密支持等值查询，随机加密安全性更高但不可查询
- Queryable Encryption（6.0+）支持对加密字段范围查询，仅 Atlas/Enterprise
- KMS（AWS/Azure/GCP）管理主密钥，DEK 存储在 MongoDB，两者分离
- 非 Atlas 环境可用应用层 AES 加密（手动实现，灵活但无驱动级支持）
- 加密字段有明确限制：不可作分片键、不支持普通索引、不参与聚合

**下一步**：Schema Validation 与数据治理。
