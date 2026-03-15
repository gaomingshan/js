# 3.2 主键生成策略

## 概述

主键生成策略是数据库设计的重要环节，特别是在分布式系统中。MyBatis Plus 提供了多种主键生成策略，满足不同场景的需求。

**核心内容：**
- IdType 枚举详解
- 雪花算法原理与配置
- 自定义主键生成器
- 分布式 ID 方案选型

---

## IdType 枚举详解

### 所有类型概览

```java
public enum IdType {
    /**
     * 数据库自增
     */
    AUTO(0),
    
    /**
     * 未设置主键类型（跟随全局配置）
     */
    NONE(1),
    
    /**
     * 用户输入 ID
     * 该类型可以通过自己注册自动填充插件进行填充
     */
    INPUT(2),
    
    /**
     * 分配 ID（雪花算法）
     * 主键类型为 Long 或 String
     */
    ASSIGN_ID(3),
    
    /**
     * 分配 UUID
     * 主键类型为 String
     */
    ASSIGN_UUID(4);
}
```

### AUTO - 数据库自增

```java
@TableId(type = IdType.AUTO)
private Long id;
```

**使用场景：**
- 单体应用
- MySQL、PostgreSQL 等支持自增的数据库
- 对 ID 连续性有要求的场景

**优点：**
- 简单可靠，数据库原生支持
- ID 连续，便于理解
- 占用空间小（相比字符串）

**缺点：**
- 分布式系统需要额外处理（分段、步长）
- 数据迁移和合并困难
- 存在性能瓶颈（高并发时数据库压力大）

**示例：**
```java
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
}

// 使用
User user = new User();
user.setName("张三");
userMapper.insert(user);
// 插入后，id 自动回填
System.out.println("生成的ID：" + user.getId());
```

**数据库表设计：**
```sql
CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);
```

### ASSIGN_ID - 雪花算法

```java
@TableId(type = IdType.ASSIGN_ID)
private Long id;  // 或 String
```

**使用场景：**
- 分布式系统（推荐）
- 需要全局唯一 ID
- 高并发插入场景

**优点：**
- 全局唯一，无需中心化协调
- 趋势递增，对索引友好
- 生成效率高（本地生成，无网络开销）
- 包含时间戳信息，可以反推生成时间

**缺点：**
- ID 较长（19 位数字）
- 不连续，有间隙
- 依赖机器时钟（时钟回拨问题）

**示例：**
```java
public class Order {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;  // 生成如：1234567890123456789
    private String orderNo;
}

// 使用
Order order = new Order();
order.setOrderNo("ORDER20240101001");
orderMapper.insert(order);
System.out.println("雪花ID：" + order.getId());
// 输出：1234567890123456789
```

### ASSIGN_UUID - UUID

```java
@TableId(type = IdType.ASSIGN_UUID)
private String id;  // 必须是 String 类型
```

**使用场景：**
- 需要字符串主键
- 跨系统数据交换
- 无序 ID 需求

**优点：**
- 全局唯一性极强
- 无需依赖数据库或时钟
- 跨平台、跨语言统一

**缺点：**
- 占用空间大（32 位字符串）
- 无序，索引性能差
- 可读性差

**示例：**
```java
public class File {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;  // 生成如：8d8a9f5e6b7c4d3e2f1a0b9c8d7e6f5
    private String fileName;
}

// 使用
File file = new File();
file.setFileName("test.pdf");
fileMapper.insert(file);
System.out.println("UUID：" + file.getId());
// 输出：8d8a9f5e6b7c4d3e2f1a0b9c8d7e6f5
```

### INPUT - 手动输入

```java
@TableId(type = IdType.INPUT)
private String id;
```

**使用场景：**
- 业务主键（如订单号）
- 需要自定义 ID 格式
- 外部系统同步数据

**示例：**
```java
public class Order {
    @TableId(type = IdType.INPUT)
    private String id;
    private String orderNo;
}

// 使用：必须手动设置 ID
Order order = new Order();
order.setId(generateOrderId());  // 自定义生成逻辑
order.setOrderNo("ORDER20240101001");
orderMapper.insert(order);
```

---

## 雪花算法（Snowflake）原理与配置

### 算法原理

雪花算法生成的 ID 是一个 64 位的 Long 型数字，结构如下：

```
0 - 0000000000 0000000000 0000000000 0000000000 0 - 00000 - 00000 - 000000000000
|   |-------------------------------------------|   |-----|   |-----|   |----------|
符号  时间戳（41位）                               数据中心   机器ID   序列号（12位）
位    约69年                                       (5位)    (5位)
```

**各部分说明：**
1. **符号位（1位）**：固定为 0（正数）
2. **时间戳（41位）**：当前时间减去起始时间的毫秒数，可用约 69 年
3. **数据中心 ID（5位）**：最多支持 32 个数据中心
4. **机器 ID（5位）**：每个数据中心最多支持 32 台机器
5. **序列号（12位）**：同一毫秒内的序列号，最多 4096 个

**生成示例：**
```
时间戳：41位 = 2199023255551毫秒 ≈ 69年
数据中心：5位 = 0~31
机器ID：5位 = 0~31
序列号：12位 = 0~4095

同一台机器同一毫秒最多生成 4096 个 ID
理论 QPS = 4096 * 1000 = 409.6万/秒
```

### 默认配置

```java
// MyBatis Plus 默认使用的雪花算法实现
public class Sequence {
    // 起始时间戳（2019-01-01）
    private final long twepoch = 1546272000000L;
    
    // 机器ID所占的位数
    private final long workerIdBits = 5L;
    
    // 数据中心ID所占的位数
    private final long datacenterIdBits = 5L;
    
    // 序列号所占的位数
    private final long sequenceBits = 12L;
    
    // ... 其他配置
}
```

### 自定义配置

```java
@Configuration
public class IdGeneratorConfig {
    
    /**
     * 自定义 ID 生成器
     */
    @Bean
    public IdentifierGenerator identifierGenerator() {
        return new DefaultIdentifierGenerator(
            new Sequence(null, 1L, 1L)  // workerId=1, datacenterId=1
        );
    }
}
```

**从环境变量获取机器 ID：**
```java
@Bean
public IdentifierGenerator identifierGenerator() {
    // 从环境变量或配置中心获取
    long workerId = Long.parseLong(
        System.getenv("WORKER_ID") != null 
            ? System.getenv("WORKER_ID") 
            : "1"
    );
    
    long datacenterId = Long.parseLong(
        System.getenv("DATACENTER_ID") != null 
            ? System.getenv("DATACENTER_ID") 
            : "1"
    );
    
    return new DefaultIdentifierGenerator(
        new Sequence(null, workerId, datacenterId)
    );
}
```

### 时钟回拨问题

**问题：** NTP 时间同步或手动调整时钟导致时间回退

**解决方案：**

```java
public class ClockCallbackSequence extends Sequence {
    
    @Override
    public synchronized long nextId() {
        long currentMillis = timeGen();
        
        // 检测时钟回拨
        if (currentMillis < lastTimestamp) {
            long offset = lastTimestamp - currentMillis;
            
            if (offset <= 5) {
                // 小幅回拨（5ms内），等待追上
                try {
                    Thread.sleep(offset << 1);
                    currentMillis = timeGen();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            } else {
                // 大幅回拨，抛出异常
                throw new RuntimeException(
                    String.format("Clock moved backwards. Refusing to generate id for %d milliseconds", 
                                  offset)
                );
            }
        }
        
        return super.nextId();
    }
}
```

---

## 自定义主键生成器

### 实现 IdentifierGenerator 接口

```java
/**
 * 自定义主键生成器：业务订单号
 * 格式：yyyyMMddHHmmss + 机器ID(2位) + 序列号(4位)
 * 示例：20240101120000010001
 */
@Component
public class OrderIdGenerator implements IdentifierGenerator {
    
    private static final AtomicInteger SEQUENCE = new AtomicInteger(0);
    private static final int MAX_SEQUENCE = 9999;
    
    @Override
    public Number nextId(Object entity) {
        // 时间部分：yyyyMMddHHmmss
        String timestamp = LocalDateTime.now()
            .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        
        // 机器ID（从配置获取）
        String workerId = String.format("%02d", getWorkerId());
        
        // 序列号（循环递增）
        int seq = SEQUENCE.incrementAndGet();
        if (seq > MAX_SEQUENCE) {
            SEQUENCE.set(0);
            seq = SEQUENCE.incrementAndGet();
        }
        String sequence = String.format("%04d", seq);
        
        // 组合
        String id = timestamp + workerId + sequence;
        return Long.parseLong(id);
    }
    
    @Override
    public String nextUUID(Object entity) {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    private int getWorkerId() {
        // 从配置中心或环境变量获取
        return 1;
    }
}
```

### 使用自定义生成器

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public IdentifierGenerator identifierGenerator() {
        return new OrderIdGenerator();
    }
}

// 实体类
public class Order {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;  // 使用自定义生成器
}
```

### 基于 Redis 的分布式 ID

```java
/**
 * 基于 Redis 的分布式 ID 生成器
 */
@Component
public class RedisIdGenerator implements IdentifierGenerator {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String ID_KEY = "distributed:id:";
    
    @Override
    public Number nextId(Object entity) {
        String key = ID_KEY + entity.getClass().getSimpleName();
        
        // 日期部分
        String date = LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // Redis 自增
        Long increment = redisTemplate.opsForValue()
            .increment(key + ":" + date, 1);
        
        // 每天重置，设置过期时间
        redisTemplate.expire(key + ":" + date, 1, TimeUnit.DAYS);
        
        // 组合：日期(8位) + 序列号(8位)
        return Long.parseLong(date + String.format("%08d", increment));
    }
    
    @Override
    public String nextUUID(Object entity) {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
```

---

## 分布式 ID 方案选型

### 常见方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **数据库自增** | 简单可靠 | 分布式扩展困难 | 单体应用 |
| **UUID** | 全局唯一、简单 | 无序、占用空间大 | 对性能要求不高 |
| **雪花算法** | 高性能、趋势递增 | 依赖时钟 | 分布式系统（推荐） |
| **Redis 自增** | 简单、可控 | 依赖 Redis、网络开销 | 业务 ID、对连续性有要求 |
| **数据库号段模式** | 高性能、连续 | 复杂度高 | 高并发、需要连续 ID |
| **美团 Leaf** | 高可用、灵活 | 需要独立服务 | 大型分布式系统 |

### 选型建议

**1. 单体应用：**
```java
// 推荐：数据库自增
@TableId(type = IdType.AUTO)
private Long id;
```

**2. 分布式应用（通用）：**
```java
// 推荐：雪花算法
@TableId(type = IdType.ASSIGN_ID)
private Long id;
```

**3. 业务订单号：**
```java
// 自定义生成器
@TableId(type = IdType.INPUT)
private String orderNo;

// 生成逻辑
public String generateOrderNo() {
    // 日期 + 业务编码 + 序列号
    return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
           + "01"  // 业务编码
           + String.format("%08d", getSequence());
}
```

**4. 高并发、强一致性：**
- 考虑美团 Leaf、滴滴 TinyID 等成熟方案
- 或使用数据库号段模式

### 实战案例：电商订单号设计

```java
/**
 * 订单号生成器
 * 格式：日期(8) + 业务类型(2) + 机器ID(2) + 序列号(6)
 * 示例：20240101 01 01 000001
 */
@Component
public class OrderNoGenerator {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 生成订单号
     * @param orderType 订单类型（01:普通订单，02:秒杀订单）
     */
    public String generate(String orderType) {
        // 1. 日期部分
        String date = LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // 2. 业务类型
        String type = String.format("%02d", Integer.parseInt(orderType));
        
        // 3. 机器ID（从配置获取）
        String machineId = String.format("%02d", getMachineId());
        
        // 4. 序列号（Redis 自增，每天重置）
        String key = "order:no:" + date + ":" + orderType;
        Long seq = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        String sequence = String.format("%06d", seq);
        
        // 5. 组合
        return date + type + machineId + sequence;
    }
    
    private int getMachineId() {
        // 从配置中心或环境变量获取
        return 1;
    }
}

// 使用
@Service
public class OrderService {
    
    @Autowired
    private OrderNoGenerator orderNoGenerator;
    
    public void createOrder() {
        String orderNo = orderNoGenerator.generate("01");
        // orderNo: 20240101010100001
    }
}
```

---

## 关键点总结

1. **AUTO**：数据库自增，适合单体应用
2. **ASSIGN_ID**：雪花算法，分布式系统首选
3. **ASSIGN_UUID**：UUID，全局唯一但无序
4. **INPUT**：手动输入，适合业务主键
5. **雪花算法**：高性能、趋势递增，需注意时钟回拨
6. **自定义生成器**：实现 IdentifierGenerator 接口
7. **方案选型**：根据业务场景选择合适的策略

---

## 最佳实践

### 1. 全局配置 + 特殊覆盖

```yaml
# 全局使用雪花算法
mybatis-plus:
  global-config:
    db-config:
      id-type: assign_id
```

```java
// 大部分实体无需配置
public class User {
    private Long id;  // 使用全局配置
}

// 特殊表使用数据库自增
public class Config {
    @TableId(type = IdType.AUTO)
    private Integer id;
}
```

### 2. 分布式环境配置机器 ID

```java
@Configuration
public class IdConfig {
    
    @Bean
    public IdentifierGenerator identifierGenerator() {
        // 方案1：从配置中心获取
        long workerId = getWorkerIdFromConfig();
        
        // 方案2：从 IP 地址计算
        // long workerId = getWorkerIdFromIp();
        
        // 方案3：从 Redis 分配
        // long workerId = getWorkerIdFromRedis();
        
        return new DefaultIdentifierGenerator(
            new Sequence(null, workerId, 1L)
        );
    }
}
```

### 3. 业务 ID 与主键分离

```java
public class Order {
    // 主键：雪花算法
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    // 业务订单号：自定义生成
    private String orderNo;
}

// Service 层
@Service
public class OrderService {
    
    @Autowired
    private OrderNoGenerator orderNoGenerator;
    
    public void createOrder(Order order) {
        // 生成业务订单号
        order.setOrderNo(orderNoGenerator.generate("01"));
        
        // 保存（主键自动生成）
        save(order);
    }
}
```

---

## 参考资料

- [主键策略配置](https://baomidou.com/pages/223848/#tableid)
- [雪花算法详解](https://segmentfault.com/a/1190000011282426)
- [分布式 ID 生成器](https://tech.meituan.com/2017/04/21/mt-leaf.html)
