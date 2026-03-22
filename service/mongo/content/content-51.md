# Time Series 与 IoT 场景

## 概述

MongoDB 5.0 引入原生时序集合（Time Series Collection），针对时序数据的高频写入做了深度优化：自动分桶压缩、高效时序查询、TTL 自动过期。本章覆盖时序集合原理、配置、查询性能与企业 IoT 场景实践。

---

## 时序数据特点与挑战

```
时序数据特点：
  - 高频写入（每秒数千到数万条）
  - 每条数据结构相似（设备ID + 时间戳 + 指标值）
  - 查询模式固定（按设备 + 时间范围）
  - 数据量极大（需要高效压缩）
  - 历史数据自动过期（无需手动清理）

普通集合的问题：
  - 每条传感器数据一个文档 → 文档数量巨大，索引膨胀
  - 压缩率低，存储成本高
  - 时序聚合查询性能差
```

---

## 创建时序集合

```js
// 创建时序集合
db.createCollection('sensor_readings', {
  timeseries: {
    timeField:   'timestamp',   // 必填：时间字段名
    metaField:   'metadata',    // 可选：元数据字段（设备ID等，用于分组）
    granularity: 'seconds'      // 时间粒度：seconds / minutes / hours
  },
  expireAfterSeconds: 86400 * 90  // 可选：90 天后自动过期
})

// 查看集合信息
db.runCommand({ listCollections: 1, filter: { name: 'sensor_readings' } })
```

### granularity 选择

```
granularity 影响内部分桶策略（桶时间跨度）：

  seconds → 每桶约 1 小时数据（适合：秒级传感器数据）
  minutes → 每桶约 1 天数据  （适合：分钟级监控指标）
  hours   → 每桶约 1 月数据  （适合：小时级业务统计）

选择原则：与实际数据写入频率匹配，压缩效果最佳
```

---

## 写入时序数据

```js
// 单条写入
db.sensor_readings.insertOne({
  timestamp: new Date(),
  metadata: {
    deviceId: 'sensor_001',
    location: '上海-机房A',
    type:     'temperature'
  },
  temperature: 23.5,
  humidity:    65.2,
  pressure:    1013.25
})

// 批量写入（推荐，提高吞吐）
const readings = Array.from({ length: 1000 }, (_, i) => ({
  timestamp: new Date(Date.now() - i * 1000),
  metadata:  { deviceId: 'sensor_001', type: 'temperature' },
  temperature: 20 + Math.random() * 10,
  humidity:    60 + Math.random() * 20
}))
db.sensor_readings.insertMany(readings, { ordered: false })
```

```java
// Java 批量写入时序数据
@Service
public class SensorDataService {

  @Autowired
  private MongoTemplate mongoTemplate;

  public void batchInsert(List<SensorReading> readings) {
    // ordered: false 最大化写入吞吐
    mongoTemplate.getCollection("sensor_readings")
      .insertMany(
        readings.stream()
          .map(r -> mongoTemplate.getConverter()
            .convertToMongoType(r, Document.class))
          .map(o -> (Document) o)
          .collect(Collectors.toList()),
        new InsertManyOptions().ordered(false)
      );
  }
}
```

---

## 时序查询

### 基础范围查询

```js
// 查询指定设备最近 1 小时数据
const oneHourAgo = new Date(Date.now() - 3600 * 1000)
db.sensor_readings.find({
  'metadata.deviceId': 'sensor_001',
  timestamp: { $gte: oneHourAgo }
}).sort({ timestamp: 1 })
```

### 聚合统计

```js
// 每小时温度统计（MIN/MAX/AVG）
db.sensor_readings.aggregate([
  { $match: {
    'metadata.deviceId': 'sensor_001',
    timestamp: { $gte: new Date('2024-01-15'), $lt: new Date('2024-01-16') }
  }},
  { $group: {
    _id: {
      hour: { $hour: '$timestamp' }
    },
    avgTemp: { $avg: '$temperature' },
    maxTemp: { $max: '$temperature' },
    minTemp: { $min: '$temperature' },
    count:   { $sum: 1 }
  }},
  { $sort: { '_id.hour': 1 } }
])

// 多设备对比（最近 24 小时平均温度）
db.sensor_readings.aggregate([
  { $match: {
    timestamp: { $gte: new Date(Date.now() - 86400000) }
  }},
  { $group: {
    _id: '$metadata.deviceId',
    avgTemp:   { $avg: '$temperature' },
    readCount: { $sum: 1 }
  }},
  { $sort: { avgTemp: -1 } }
])
```

### $densify 填充缺失时间点（5.1+）

```js
// 某些时间点可能没有数据，$densify 填充
db.sensor_readings.aggregate([
  { $match: { 'metadata.deviceId': 'sensor_001' } },
  { $densify: {
    field: 'timestamp',
    range: {
      step:     1,
      unit:     'hour',
      bounds:   [ new Date('2024-01-15'), new Date('2024-01-16') ]
    }
  }},
  { $fill: {
    output: {
      temperature: { method: 'linear' }  // 线性插值填充缺失值
    }
  }}
])
```

---

## 时序集合 vs 桶模式对比

```
                  | Time Series Collection | 桶模式（Bucket Pattern）
-----------------|------------------------|------------------------
实现方式          | MongoDB 原生支持        | 应用层手动管理
分桶逻辑          | 自动（按 granularity）  | 手动（按时间窗口）
压缩              | 自动列式压缩            | 普通 BSON 压缩
写入复杂度        | 简单（直接 insert）     | 复杂（需 upsert + $push）
TTL 过期          | 原生支持               | 需单独 TTL 索引
适用版本          | 5.0+                   | 全版本
推荐场景          | 5.0+ 首选             | 低版本兼容
```

### 桶模式（兼容低版本）

```js
// 每小时一个桶文档（5.0 以下环境）
db.sensor_buckets.updateOne(
  {
    deviceId:    'sensor_001',
    hourStart:   ISODate('2024-01-15T10:00:00Z'),
    count:       { $lt: 3600 }    // 每桶最多 3600 条
  },
  {
    $push: {
      readings: {
        ts:   new Date(),
        temp: 23.5,
        hum:  65
      }
    },
    $inc:  { count: 1 },
    $min:  { minTemp: 23.5 },
    $max:  { maxTemp: 23.5 },
    $set:  { updatedAt: new Date() }
  },
  { upsert: true }
)
```

---

## TTL 自动过期配置

```js
// 创建时指定（推荐）
db.createCollection('sensor_readings', {
  timeseries: { timeField: 'timestamp', metaField: 'metadata' },
  expireAfterSeconds: 86400 * 30  // 30 天
})

// 动态修改 TTL
db.runCommand({
  collMod: 'sensor_readings',
  expireAfterSeconds: 86400 * 90  // 改为 90 天
})

// 查看当前 TTL 设置
db.runCommand({ listCollections: 1, filter: { name: 'sensor_readings' } })
  .cursor.firstBatch[0].options
```

---

## 企业 IoT 架构案例

```
设备层
  ↓ MQTT / HTTP
消息中间件（Kafka / EMQX）
  ↓ 流式消费
数据接入服务
  ├── 实时写入 MongoDB Time Series Collection
  └── 实时指标推送 Redis（告警阈值检测）
         ↓
    MongoDB 时序集合
    ├── 查询层：按设备、时间范围查询
    ├── 聚合层：小时/天/月统计（离线）
    └── TTL：90 天自动清理
         ↓
    冷数据归档（对象存储 OSS/S3）
```

### Spring Boot 接入示例

```java
@Document(collection = "sensor_readings")
public class SensorReading {

  private Date timestamp;        // timeField

  private SensorMetadata metadata;  // metaField
  // { deviceId, location, type }

  private Double temperature;
  private Double humidity;
  private Double pressure;
}

// Repository
public interface SensorReadingRepository
    extends MongoRepository<SensorReading, String> {

  List<SensorReading> findByMetadataDeviceIdAndTimestampBetween(
      String deviceId, Date start, Date end
  );
}

// 高吞吐写入
@Service
public class IoTIngestionService {

  @Autowired SensorReadingRepository repo;

  // 批量写入（每 500 条或每 1 秒一次）
  @Scheduled(fixedDelay = 1000)
  public void flushBuffer() {
    List<SensorReading> batch = buffer.drain(500);
    if (!batch.isEmpty()) {
      repo.saveAll(batch);  // 底层 insertMany
    }
  }
}
```

---

## 性能优化建议

```
1. 批量写入：insertMany 替代逐条 insert
   → 单次批量 500-1000 条，吞吐量提升 10x+

2. metaField 选择：设备标识字段（高基数）作为 metaField
   → 同一设备数据被分到同一桶，压缩率最高

3. granularity 匹配写入频率
   → 秒级数据选 seconds，分钟级选 minutes

4. 查询必须带时间范围
   → 时序集合的时间字段是主要过滤维度
   → 不带时间范围的查询性能差

5. 聚合在 $match 后尽早过滤
   → $match 放最前，减少后续处理量
```

---

## 总结

- Time Series Collection（5.0+）是 IoT/时序场景的首选，自动分桶压缩，写入简单
- `timeField` + `metaField` + `granularity` 三参数配置决定存储效率
- `expireAfterSeconds` 原生 TTL，无需手动清理历史数据
- 5.0 以下版本用桶模式（Bucket Pattern）手动分桶，效果类似但复杂度高
- 批量写入（insertMany）+ metaField 高基数是时序性能的核心

**下一步**：Atlas Search 与向量检索。
