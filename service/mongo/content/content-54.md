# Schema Validation 与数据治理

## 概述

MongoDB 文档模型天生灵活，但生产环境需要对数据质量进行约束。Schema Validation 通过 `$jsonSchema` 在数据库层面强制字段类型、必填项和枚举值，是文档数据库数据治理的核心机制。

---

## 为什么需要 Schema Validation

```
没有 Schema Validation 的风险：
  - 应用 Bug 写入错误类型（price 写成字符串 "99"）
  - 必填字段缺失（orderId 为 null）
  - 枚举值越界（status = 'unknwon'，拼写错误）
  - 不同版本应用写入结构不一致

Schema Validation 的作用：
  - 数据库层面的最后一道防线
  - 不依赖应用层校验，防止多应用/多版本写入脏数据
  - 与应用层校验互补，各司其职
```

---

## 创建带验证规则的集合

```js
db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      title:    '订单文档验证规则',
      required: ['orderId', 'userId', 'status', 'totalAmount', 'createdAt'],
      properties: {
        orderId: {
          bsonType:    'string',
          description: '订单号，必填，唯一'
        },
        userId: {
          bsonType:    'string',
          description: '用户ID，必填'
        },
        status: {
          bsonType: 'string',
          enum:     ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
          description: '订单状态，必须是枚举值之一'
        },
        totalAmount: {
          bsonType:    ['double', 'decimal'],
          minimum:     0,
          description: '订单金额，必须 >= 0'
        },
        items: {
          bsonType:     'array',
          minItems:     1,
          description:  '订单行，至少一个商品',
          items: {
            bsonType: 'object',
            required: ['sku', 'qty', 'price'],
            properties: {
              sku:   { bsonType: 'string' },
              qty:   { bsonType: 'int', minimum: 1 },
              price: { bsonType: ['double', 'decimal'], minimum: 0 }
            }
          }
        },
        createdAt: {
          bsonType:    'date',
          description: '创建时间，必填'
        }
      },
      // 不允许额外字段（严格模式）
      additionalProperties: false
    }
  },
  validationLevel:  'strict',   // strict（所有写操作）/ moderate（已有文档宽松）
  validationAction: 'error'     // error（拒绝写入）/ warn（记录日志但允许写入）
})
```

---

## validationLevel 与 validationAction

```
validationLevel：
  strict   → 插入和更新都必须通过验证（默认，推荐生产使用）
  moderate → 插入必须验证；更新只验证已满足规则的文档
               （适合：对存量脏数据宽松，对新增数据严格）
  off      → 关闭验证

validationAction：
  error → 验证失败拒绝写入，返回错误（默认）
  warn  → 验证失败仍写入，但在日志中记录警告
           （适合：新规则灰度上线阶段，先观察影响再切 error）
```

---

## 为已有集合添加验证规则

```js
// 用 collMod 为已有集合添加或更新验证规则
db.runCommand({
  collMod: 'orders',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['orderId', 'userId', 'status'],
      properties: {
        orderId: { bsonType: 'string' },
        userId:  { bsonType: 'string' },
        status:  {
          bsonType: 'string',
          enum: ['pending', 'paid', 'cancelled']
        }
      }
    }
  },
  validationLevel:  'moderate',  // 先用 moderate 避免存量数据问题
  validationAction: 'warn'       // 先用 warn 观察违规情况
})

// 确认无违规后收紧
db.runCommand({
  collMod: 'orders',
  validationLevel:  'strict',
  validationAction: 'error'
})
```

---

## $jsonSchema 常用约束

### 类型约束

```js
properties: {
  age:     { bsonType: 'int',               minimum: 0, maximum: 150 },
  price:   { bsonType: ['double','decimal'], minimum: 0 },
  name:    { bsonType: 'string',            minLength: 1, maxLength: 100 },
  tags:    { bsonType: 'array',             maxItems: 20 },
  address: { bsonType: 'object' },
  active:  { bsonType: 'bool' },
  date:    { bsonType: 'date' }
}
```

### 正则表达式约束

```js
properties: {
  phone: {
    bsonType: 'string',
    pattern:  '^1[3-9]\\d{9}$',  // 中国手机号格式
    description: '手机号格式：1开头的11位数字'
  },
  email: {
    bsonType: 'string',
    pattern:  '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$'
  },
  orderId: {
    bsonType: 'string',
    pattern:  '^ORD-\\d{8}-\\d{6}$',  // ORD-20240115-000001
    description: '订单号格式：ORD-日期-序号'
  }
}
```

### 条件约束（if/then/else）

```js
// 企业用户必须填 companyName；个人用户必须填 idNumber
{
  bsonType: 'object',
  if:   { properties: { type: { enum: ['enterprise'] } } },
  then: { required: ['companyName', 'taxId'] },
  else: { required: ['idNumber'] }  // 个人用户
}
```

---

## 查看和测试验证规则

```js
// 查看集合验证规则
db.getCollectionInfos({ name: 'orders' })[0].options.validator

// 测试：写入不合规文档
try {
  db.orders.insertOne({
    orderId: 'ORD-001',
    userId:  'u001',
    status:  'invalid_status',  // 不在枚举列表中
    totalAmount: 999,
    createdAt: new Date()
  })
} catch (e) {
  print('验证失败:', e.message)
  // Document failed validation
  // details: { operatorName: '$jsonSchema', schemaRulesNotSatisfied: [...] }
}

// 查找不满足新规则的存量文档
db.orders.find({
  $nor: [{
    $jsonSchema: {
      bsonType: 'object',
      required: ['orderId', 'userId', 'status']
    }
  }]
})
```

---

## Schema 版本演进策略

```
策略一：向前兼容（推荐，最小影响）
  - 只新增可选字段，不删除、不修改现有字段类型
  - 新字段不加入 required 列表
  - 新旧版本应用可同时运行

策略二：双写过渡（字段重命名）
  阶段1：新代码同时写旧字段和新字段，验证规则允许两者
  阶段2：批量迁移存量数据
  阶段3：验证规则切换到只要求新字段，删除旧字段

策略三：文档版本号
  每个文档加 schemaVersion 字段
  应用层根据版本号选择不同的读取/解析逻辑
  → 适合：复杂 Schema 演进，多版本长期共存
```

```js
// 文档版本号示例
{
  schemaVersion: 2,
  orderId: 'ORD-001',
  // v2 新增字段
  fulfillmentMethod: 'express'
}

// 应用层按版本处理
function parseOrder(doc) {
  if (doc.schemaVersion < 2) {
    // 兼容旧版本
    doc.fulfillmentMethod = 'standard'
  }
  return doc
}
```

---

## 企业案例：订单数据质量治理

```js
// Step 1：先用 warn 模式收集违规情况
db.runCommand({
  collMod: 'orders',
  validator: { $jsonSchema: orderSchema },
  validationLevel: 'moderate',
  validationAction: 'warn'
})

// Step 2：统计违规文档
// 在 mongod 日志中搜索 WRITE 警告
// 或用 $nor 查询存量违规
const violating = db.orders.find({
  $nor: [{ $jsonSchema: orderSchema }]
}).count()
print('违规文档数:', violating)

// Step 3：修复存量违规数据
db.orders.find({ status: { $exists: false } })
  .forEach(doc => {
    db.orders.updateOne(
      { _id: doc._id },
      { $set: { status: 'unknown' } }  // 补填缺失字段
    )
  })

// Step 4：确认无违规后切换为 strict + error
db.runCommand({
  collMod: 'orders',
  validationLevel:  'strict',
  validationAction: 'error'
})
```

---

## Spring Boot 集成

```java
// 应用启动时检查并创建集合验证规则
@Component
public class SchemaValidationInitializer implements ApplicationRunner {

  @Autowired
  private MongoTemplate mongoTemplate;

  @Override
  public void run(ApplicationArguments args) {
    String schema = """
      {
        bsonType: "object",
        required: ["orderId","userId","status"],
        properties: {
          orderId: { bsonType: "string" },
          userId:  { bsonType: "string" },
          status:  { bsonType: "string",
                     enum: ["pending","paid","cancelled"] }
        }
      }
    """;

    mongoTemplate.getDb().runCommand(new Document()
      .append("collMod",         "orders")
      .append("validator",       new Document("$jsonSchema",
                                   Document.parse(schema)))
      .append("validationLevel",  "strict")
      .append("validationAction", "error")
    );
    log.info("订单集合 Schema 验证规则已更新");
  }
}
```

---

## 总结

- `$jsonSchema` 是 MongoDB Schema Validation 的核心，支持类型、必填、枚举、正则、范围、条件约束
- `validationAction: warn` 用于新规则灰度上线，观察违规情况后切换为 `error`
- `validationLevel: moderate` 对存量脏数据宽松，只约束新写入
- 上线前用 `$nor + $jsonSchema` 统计存量违规文档，修复后再收紧规则
- Schema 演进优先向前兼容（只加可选字段）；复杂演进用文档版本号字段
- Schema Validation 是应用层校验的补充，不是替代；两者各有职责

---

> 至此，MongoDB 系列 54 个章节全部完成。
> 涵盖：基础架构 → 环境搭建 → 写入存储 → 索引 → 查询 → 分布式架构 → 调优监控 → 原生API → Spring集成 → Spring Cloud → 企业实践 → 高级特性。
> 配合 `quiz.md` 面试题进行查漏补缺，祝学习顺利！
