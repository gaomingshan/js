# 字段类型 — 每个选择都有代价

表结构设计的第一步就是选字段类型。大部分新手的做法是"字符串用 VARCHAR、数字用 INT、时间用 DATETIME"——都这么写，没出过事，也不觉得有什么问题。

但字段类型选错的代价是**隐性**的：
- 不会报错
- 不会让功能出 bug
- 但会悄悄拉低查询性能、膨胀存储空间、甚至导致索引失效

这一节不讲类型大全（你随时可以查文档），只讲**选型决策**背后的逻辑。

---

## 数值类型

### INT(11) 的 11 是什么？

你见过这样的建表语句：

```sql
CREATE TABLE users (
    id INT(11) PRIMARY KEY AUTO_INCREMENT
);
```

很多人以为 INT(11) 表示"最大 11 位数"或"占用 11 字节"。

其实 (11) 只是**显示宽度**，只跟 `ZEROFILL` 配合使用才有意义：

```sql
INT(4) ZEROFILL  -- 存 42 显示为 0042
```

如果不加 ZEROFILL，括号里的数字完全没有影响。INT 永远是 4 字节，范围永远是 -2^31 到 2^31-1。

所以这个写法只是历史遗留的习惯。**不要被 (11) 误导，你只需要关心类型本身。**

### 各数值类型的存储与范围

| 类型 | 字节 | 最小值 | 最大值 |
|------|------|--------|--------|
| TINYINT | 1 | -128 | 127 |
| SMALLINT | 2 | -32768 | 32767 |
| INT | 4 | -21亿 | 21亿 |
| BIGINT | 8 | -9.22e18 | 9.22e18 |

关键决策点：**你的值最大可能到多少？**

- 用户 ID：最多几十万 → INT 够了
- 订单号：几年后可能到几十亿 → BIGINT
- 年龄：0-150 → TINYINT UNSIGNED

用 BIGINT 存 INT 就够了的值，不报错，但每个字段浪费 4 字节，一张 1000 万行的表就是 40MB。更重要的是，索引的 B+Tree 节点里 BIGINT 比 INT 占空间更大，同样的页能存的关键字更少，树高更高，IO 更多。

### DECIMAL 的精度陷阱

金融场景必须用 DECIMAL：

```sql
price DECIMAL(10, 2)  -- 总共 10 位，小数 2 位，整数 8 位
```

DECIMAL 是精确存储的（以字符串方式编码），不会丢失精度。

而 FLOAT/DOUBLE 是近似存储的：

```sql
-- 这个看似人畜无害的操作
SELECT 0.1 + 0.2;  -- 结果是 0.30000000000000004
```

DOUBLE 的精度问题在于浮点数的二进制表示无法精确表达 0.1。如果你用 DOUBLE 存金额，长期累积的误差会导致对不上账。

原则很简单：**跟钱有关的，用 DECIMAL。做统计计算的，用 DOUBLE。**

### 自增 ID 用完了会怎样？

INT 最大 21 亿，BIGINT 最大 922 亿亿。你的业务能达到什么量级？

以订单表为例：
- 如果每天产生 100 万订单，INT 能用 2000 天（约 5 年半）
- BIGINT 能用 922 亿天（这个不用算了，用不完）

如果 INT 真的用完了，INSERT 会报错：`Duplicate entry '2147483647' for key 'PRIMARY'`。

**设计阶段就把 BIGINT 选好**，不要在量上来之后再改主键类型——那涉及重建整张表，代价极高。

还有一个相关经验：**不要在分布式系统里用自增 ID 做主键**。自增 ID 在多数据库/分库分表场景下会重复，需要用雪花算法或号段模式。这一点在"分布式 ID"部分会细讲。

---

## 字符类型

### VARCHAR vs CHAR

- VARCHAR：变长，额外占用 1-2 字节记录长度
- CHAR：定长，不够用空格补齐

```sql
name VARCHAR(200)  -- 存 "alice" 只占 5 字节 + 1 字节长度
code CHAR(6)       -- 存 "ABC123" 固定占 6 字节
```

VARCHAR 的括号 (200) 表示**最多 200 个字符**，不是 200 个字节。在 utf8mb4 下，一个中文字符占 4 字节，所以存满 200 个中文最多需要 800 字节。

CHAR 适合定长值：手机号（11 位）、身份证号（18 位）、固定编码。但实际使用中，绝大部分场景用 VARCHAR 就够了。

### VARCHAR(255) 为什么这么常见？

很多表都这么写：

```sql
username VARCHAR(255)
```

这不是随便选的。MySQL 里：

- 行格式的变长字段长度列表用 1 字节（8 位）存储长度信息
- 1 字节最大能表示 255
- 所以 VARCHAR(255) 刚好在 1 字节能表示的范围内
- VARCHAR(256) 就需要额外 1 字节来存（总共 2 字节）

所以 VARCHAR(255) 成了 MySQL 里的"默认习惯"。如果你确定字段不会超过某个值（比如昵称最多 50 字），可以给更小的最大值——限制也在提醒使用者这个字段的预期长度。

### TEXT 的隐藏代价

TEXT 类型看着很方便——不限长度、可以存大文本。但它有几个你可能不知道的代价：

**1. TEXT 不能建前缀索引**

MySQL 只允许对 TEXT 列建前缀索引（指定前 N 个字符）：

```sql
CREATE INDEX idx_content ON articles(content(100));  -- 只索引前 100 字符
```

这意味着如果你搜索的文本不在前 100 字符内，这个索引失效。

**2. TEXT 在临时表中使用磁盘**

如果查询需要创建临时表（比如 GROUP BY 用到 TEXT 列），MySQL 会直接在磁盘上创建临时表，而不是在内存里。这会让查询慢一个数量级。

**3. TEXT 不能有默认值**

```sql
description TEXT DEFAULT ''  -- ❌ MySQL 里不允许
```

所以能用 VARCHAR 的地方尽量不要用 TEXT。大文本用 TEXT，但要知道它的代价。

### PostgreSQL 的字符类型差异

PostgreSQL 里 `VARCHAR(50)` 和 `TEXT` 本质上是**同一种类型**，性能完全一样。`VARCHAR(n)` 的限制只是约束条件，不影响存储结构。

所以当你在 PostgreSQL 看到别人用 VARCHAR 或 TEXT，选哪个都可以，不需要像 MySQL 那样纠结。

---

## 时间类型

### DATETIME vs TIMESTAMP

这是最常见的混淆点。两个时间类型长得很像，但底层完全不同。

| 特性 | DATETIME | TIMESTAMP |
|------|----------|-----------|
| 存储字节 | 8 字节 | 4 字节 |
| 范围 | 1000-01-01 到 9999-12-31 | 1970-01-01 到 2038-01-19 |
| 时区处理 | 不处理，存什么就是什么 | 自动转 UTC 存，读时转回当前时区 |
| 空间 | 更大 | 更小 |

TIMESTAMP 的范围只到 2038 年——如果你的系统要用到 2038 年以后，用 DATETIME。

还有一个实际差别：**TIMESTAMP 的后几位精度不同数据库实现不同**。

```sql
CREATE TABLE events (
    created_at TIMESTAMP(6)  -- MySQL，6 位微秒精度
);
```

如果你不需要微秒精度，不用写括号。

### 存时间戳还是存可读时间？

这是一个设计选择：

- 存 `unix_timestamp`（INT/BIGINT）：排序快、时区无关、空间小
- 存 `DATETIME`：可读性好、日志直接看不用转换

如果是日志流水场景，推荐存时间戳或者 TIMESTAMP（自带时区处理）。如果是面向用户的 UI 层（订单创建时间、文章发布时间），存 DATETIME 更方便。

### PostgreSQL 的时间类型更丰富

PostgreSQL 除了 DATE、TIME、TIMESTAMP 外，还有：

- `TIMESTAMPTZ`：带时区的时间戳（跟 MySQL 的 TIMESTAMP 不同，它存的是带时区信息的值，不是转 UTC）
- `INTERVAL`：时间间隔，可以计算 `'2024-03-15'::date - '2024-01-01'::date` 得到天数
- `DATE` + `TIME` 可以分开存，查询时组合

---

## JSON 类型

### 什么时候用 JSON？

JSON 类型适合存储**结构灵活但不需要被查询作为主要筛选条件的嵌套数据**。

```sql
-- MySQL
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(200),
    properties JSON  -- 不同产品有不同的属性
);

-- 插入
INSERT INTO products VALUES (
    1,
    '手机',
    '{"color": "黑色", "storage": "256GB", "network": ["5G", "4G"]}'
);

-- 查询
SELECT name FROM products
WHERE JSON_EXTRACT(properties, '$.color') = '黑色';
```

优点：
- 列不需要频繁变更（加属性不用 ALTER TABLE）
- 结构灵活（不同行可以有不同的字段）
- 对不固定的属性特别好用

### 什么时候别用 JSON？

**1. 需要频繁按 JSON 字段做 WHERE 条件**

```sql
SELECT * FROM products
WHERE JSON_EXTRACT(properties, '$.color') = '黑色';
```

这种查询无法使用常规索引（MySQL 的 JSON 列可以用虚拟列间接建索引，但成本高）。如果有大量这种查询，不如把 color 独立成列。

**2. 数据关系明确且固定**

如果属性的列表是确定的，建独立列。JSON 只适合"不确定有哪些字段"的场景。

### MySQL JSON vs PostgreSQL JSONB

MySQL 的 JSON 类型本质上是用字符串存的，每次查询时解析。虽然性能已经优化过（MySQL 8.0 有 JSON 的二进制格式），但写入时还是存字符串。

PostgreSQL 的 JSONB 是二进制格式存储的，支持 GIN 索引，可以做高效的 JSON 路径查询：

```sql
-- PostgreSQL
CREATE INDEX ON products USING GIN (properties);

SELECT name FROM products
WHERE properties @> '{"color": "黑色"}';  -- GIN 索引加速
```

**一句话：PG 的 JSONB 比 MySQL 的 JSON 强，如果你有大量 JSON 查询需求，PG 更适合。**

---

## 这一节的核心思维

选择字段类型不是一个简单的技术决策，它涉及：

- **存储空间**：INT 就够用就不要用 BIGINT
- **查询性能**：类型越宽，B+Tree 的每层能存的关键字越少，IO 越多
- **索引兼容性**：TEXT 不能建完整索引、FLOAT 不适合做索引列（比较有精度问题）
- **业务语义**：金额用 DECIMAL，不用 DOUBLE；JSON 存非结构化数据，不用来存结构化字段

一个经验法则：**字段类型选小了，以后要 ALTER TABLE（重建整张表）。字段类型选大了，每行多占几个字节，不会出功能问题，但设计原则上值得做得更好。**

如果你不确定，默认方案基本是：有意义的枚举值用 `TINYINT`、数值主键用 `BIGINT`、短文本用 `VARCHAR(255)`、时间用 `DATETIME`、大文本用 `TEXT`。这个组合在 90% 的场景下都是合理的。
