# 附录 B：字段类型完整参考表

> 纯参考性质。选字段类型时翻这里，看存储字节、范围、精度、索引影响。

---

## 一、数值类型

### 1.1 整数类型

| 类型 | 字节 | 有符号范围 | 无符号范围 | 适用场景 |
|------|------|-----------|-----------|---------|
| TINYINT | 1 | -128 ~ 127 | 0 ~ 255 | 状态、年龄、枚举值 |
| SMALLINT | 2 | -32,768 ~ 32,767 | 0 ~ 65,535 | 中低频计数器 |
| MEDIUMINT | 3 | -8,388,608 ~ 8,388,607 | 0 ~ 16,777,215 | MySQL 特有，较少用 |
| INT | 4 | -2,147,483,648 ~ 2,147,483,647 | 0 ~ 4,294,967,295 | 常用主键（适合千万级以内） |
| BIGINT | 8 | -9.22e18 ~ 9.22e18 | 0 ~ 1.84e19 | 主键首选（不用担心用完） |

**注意：**
- `INT(11)` 的 (11) 是显示宽度，不影响存储
- PostgreSQL 没有 `MEDIUMINT`，用 `SMALLINT` 或 `INT` 替代
- Oracle 用 `NUMBER(p)` 统一表示：`NUMBER(3)` ≈ TINYINT，`NUMBER(10)` ≈ INT，`NUMBER(19)` ≈ BIGINT
- 用 `UNSIGNED` 可以扩展正数范围一倍（MySQL 独有）

### 1.2 浮点与定点

| 类型 | 字节 | 精度 | 说明 |
|------|------|------|------|
| FLOAT | 4 | 约 7 位小数 | 近似存储，有精度误差 |
| DOUBLE | 8 | 约 15 位小数 | 近似存储，有精度误差 |
| DECIMAL(p,s) | 变长（约 p/2+1） | 精确 | 金融场景必用，p=总位数，s=小数位数 |
| NUMERIC(p,s) | 同 DECIMAL | 精确 | PostgreSQL/Oracle 用此别名 |

**选择原则：**
- **跟钱有关 → DECIMAL**（精度误差不可接受）
- **统计、科学计算 → DOUBLE**（范围大、计算快，可接受微小误差）
- **坐标、比率 → DOUBLE 或 DECIMAL** 视精度要求而定

**DECIMAL 精度示例：**
```sql
DECIMAL(10,2)  -- 整数 8 位 + 小数 2 位，范围: -99999999.99 ~ 99999999.99
DECIMAL(18,4)  -- 常见金额精度，整数 14 位 + 小数 4 位
DECIMAL(38,0)  -- 最大 38 位整数
```

DECIMAL 的存储空间不是固定的。MySQL 按每 9 位十进制数用 4 字节存储。

| 小数总位数 | 存储字节 |
|-----------|---------|
| 1-9 | 4 |
| 10-18 | 8 |
| 19-27 | 12 |
| 28-38 | 16 |

### 1.3 三大数据库差异

| 功能 | MySQL | PostgreSQL | Oracle |
|------|-------|-----------|--------|
| 整数 | TINYINT/MEDIUMINT/INT/BIGINT | SMALLINT/INT/BIGINT | NUMBER(p) |
| 自增 | `AUTO_INCREMENT`（整数类型） | `SERIAL`（INT）/ `BIGSERIAL` | `SEQUENCE` 或 IDENTITY |
| UNSIGNED | ✅ | ❌（用 CHECK 替代） | ❌ |
| BOOLEAN | `TINYINT(1)` 模拟 | 原生 `BOOLEAN`（实际存为 't'/'f'） | `NUMBER(1)` 模拟 |
| DECIMAL 别名 | DECIMAL / NUMERIC / DEC / FIXED | DECIMAL / NUMERIC | NUMBER(p,s) |

---

## 二、字符类型

### 2.1 字符串类型

| 类型 | MySQL | PostgreSQL | Oracle | 说明 |
|------|-------|-----------|--------|------|
| 定长字符串 | CHAR(n) | CHAR(n) | CHAR(n) | n ≤ 255，不足补空格，适合固定编码 |
| 变长字符串 | VARCHAR(n) | VARCHAR(n) | VARCHAR2(n) | MySQL: n=字符，Oracle: n=字节（默认） |
| 大文本 | TEXT (65K) | TEXT | CLOB | MySQL: TEXT/MEDIUMTEXT/LONGTEXT |
| 大文本（可变上限） | MEDIUMTEXT (16M) | - | NCLOB | |
| 大文本 | LONGTEXT (4GB) | - | - | |

### 2.2 VARCHAR(n) 的 n 的含义

| 数据库 | n 的单位 | 最长 n | 最大实际长度 |
|--------|---------|--------|------------|
| MySQL | 字符（CHARACTER） | 65535 | 受行大小限制（65,535 字节） |
| PostgreSQL | 字符 | 无硬上限 | 受页大小限制 |
| Oracle | 字节（默认）或字符 | 4000（12c-）/ 32767（12c+） | 取决于 `NLS_LENGTH_SEMANTICS` |

**实战建议：**
- MySQL 中常用 VARCHAR(255)，因为行格式中 1 字节存长度，255 是上限
- 如果确知字段不会超过某个值（如用户名最多 50 字），设 VARCHAR(50) 即可
- VARCHAR(255) 并不是最好的默认值，根据业务定更准确

### 2.3 TEXT 系列的存储上限

**MySQL：**
| 类型 | 最大长度 | 存储需求 |
|------|---------|---------|
| TINYTEXT | 255 字节 | L + 1 字节 |
| TEXT | 65,535 字节（64KB） | L + 2 字节 |
| MEDIUMTEXT | 16,777,215 字节（16MB） | L + 3 字节 |
| LONGTEXT | 4,294,967,295 字节（4GB） | L + 4 字节 |

**PostgreSQL：** `TEXT` 和 `VARCHAR(n)` 性能一致，无上限（受页大小 8KB 限制，大的自动走 TOAST）

**Oracle：** `CLOB` 最大 8TB（取决于块大小）

### 2.4 字符集影响

| 字符集 | 英文/数字（字节） | 中文（字节） | 说明 |
|--------|----------------|------------|------|
| latin1 | 1 | 1（不支持） | 只支持西欧字符 |
| utf8 | 1 | 3 | MySQL 的 utf8 不是真正的 4 字节 UTF-8 |
| utf8mb4 | 1 | 4 | ✅ 推荐的 MySQL 字符集（支持 emoji） |
| GBK | 1 | 2 | 中文友好，但国际兼容性差 |

**MySQL 字符集设置：**
```sql
CREATE TABLE t (
    name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) DEFAULT CHARSET=utf8mb4;
```

**字符集对存储的影响：**
以 utf8mb4 为例：
- VARCHAR(255) 最坏情况：255 × 4 = 1020 字节（全中文）
- VARCHAR(255) 最好情况：255 × 1 = 255 字节（全英文）
- 设计字段时考虑到最大值，避免行溢出

---

## 三、时间类型

### 3.1 时间类型一览

| 类型 | 字节 | 精度 | 范围 | 说明 |
|------|------|------|------|------|
| DATE | 3 | 日 | 1000 ~ 9999 年 | 只存日期，无时间 |
| TIME | 3(+fsp) | 微秒（可选） | -838:59:59 ~ 838:59:59 | 只存时间 |
| DATETIME | 8 | 微秒（可选） | 1000-01-01 ~ 9999-12-31 | 无时区信息 |
| TIMESTAMP | 4 | 微秒（可选） | 1970-01-01 ~ 2038-01-19 | 自动转 UTC 存储 |
| YEAR | 1 | 年 | 1901 ~ 2155 | MySQL 特有 |

**精度（fsp）示例：**
```sql
created_at DATETIME(0)  -- 秒级（默认）
created_at DATETIME(3)  -- 毫秒级
created_at DATETIME(6)  -- 微秒级（MySQL 5.6+）
```

精度越高，存储字节越多（MySQL：DATETIME 在 fsp>0 时额外加 1~3 字节）。

### 3.2 DATETIME vs TIMESTAMP 选择

| 对比 | DATETIME | TIMESTAMP |
|------|----------|-----------|
| 存储 | 8 字节 | 4 字节 |
| 范围 | 1000 ~ 9999 | 1970 ~ 2038 |
| 时区 | 不处理 | 自动转 UTC |
| 自动更新 | 需手动写 `DEFAULT` / `ON UPDATE` | 支持 `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

**选择建议：**
- 未来可能超过 2038 年 → DATETIME
- 需要时区自动转换 → TIMESTAMP
- 日志/事件时间 → DATETIME（更直观）
- 最后更新时间 → TIMESTAMP（自动更新方便）

### 3.3 PostgreSQL 时间类型差异

PostgreSQL 的时间类型比其他数据库丰富：

| 类型 | 说明 |
|------|------|
| DATE | 日，同 MySQL |
| TIME [WITHOUT TIME ZONE] | 无时区时间 |
| TIMESTAMP [WITHOUT TIME ZONE] | 无时区时间戳 |
| TIMESTAMPTZ | 带时区时间戳（存入时转 UTC 并记录时区） |
| INTERVAL | 时间间隔（如 `INTERVAL '1 day'`） |
| TIME WITH TIME ZONE | 带时区时间（很少用） |

```sql
-- PostgreSQL 时间计算
SELECT NOW() + INTERVAL '1 day';               -- 明天这个时间
SELECT NOW() - INTERVAL '7 days';              -- 一周前
SELECT generate_series(
  '2024-01-01'::date,
  '2024-01-31'::date,
  '1 day'
);                                              -- 生成整个月的日期序列
```

### 3.4 Oracle 时间类型

| 类型 | 说明 |
|------|------|
| DATE | 存到秒（年月日时分秒），占 7 字节 |
| TIMESTAMP(p) | 带小数秒，p 为精度（0-9） |
| TIMESTAMP WITH TIME ZONE | 带时区 |
| TIMESTAMP WITH LOCAL TIME ZONE | 自动转数据库时区 |
| INTERVAL YEAR TO MONTH | 年月至月间隔 |
| INTERVAL DAY TO SECOND | 天至秒间隔 |

```sql
-- Oracle 时间函数
SELECT SYSDATE FROM DUAL;                    -- 当前日期时间（DATE）
SELECT SYSTIMESTAMP FROM DUAL;               -- 当前时间戳（带时区）
SELECT TO_DATE('2024-03-15', 'YYYY-MM-DD') FROM DUAL;
```

---

## 四、MySQL 特有类型

### 4.1 整数简写别名

| 简写 | 等价类型 |
|------|---------|
| BOOL / BOOLEAN | TINYINT(1) |
| INTEGER | INT |
| DEC / FIXED | DECIMAL |

### 4.2 序列类型

| 类型 | 字节 | 范围 | 说明 |
|------|------|------|------|
| BIT(n) | 1~8 | 0 ~ 2^n-1 | 位域存储 |
| SET('a','b','c') | 1~8 | 64 种组合 | 多选枚举（不推荐，违反第一范式） |
| ENUM('a','b','c') | 1~2 | 最多 65535 个值 | 单选枚举（ALTER 麻烦，不推荐） |

### 4.3 JSON

MySQL 5.7+ 支持 JSON 类型，8.0+ 支持 JSON 部分更新优化。

```sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(200),
    attrs JSON
);

INSERT INTO products VALUES (1, '手机', '{"color": "黑", "storage": 256}');

-- 查询
SELECT name FROM products WHERE JSON_EXTRACT(attrs, '$.color') = '黑';
-- 或简写
SELECT name FROM products WHERE attrs->>'$.color' = '黑';

-- 虚拟列上建索引
ALTER TABLE products ADD COLUMN color VARCHAR(10) AS (attrs->>'$.color');
CREATE INDEX idx_color ON products(color);
```

### 4.4 空间类型

| 类型 | 说明 |
|------|------|
| GEOMETRY | 基类 |
| POINT | 点 |
| LINESTRING | 线 |
| POLYGON | 多边形 |
| GEOMETRYCOLLECTION | 集合 |

---

## 五、PostgreSQL 特有类型

### 5.1 JSONB

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    attrs JSONB
);

CREATE INDEX idx_attrs ON products USING GIN (attrs);

-- 查询
SELECT * FROM products WHERE attrs @> '{"color": "黑"}';
SELECT * FROM products WHERE attrs -> 'storage' > 128;
```

JSONB 是二进制格式，比 MySQL 的 JSON 更强——支持 GIN 索引、支持高效的部分更新和路径查询。

### 5.2 数组

```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    tags TEXT[]  -- 字符串数组
);

INSERT INTO articles (tags) VALUES ('{"数据库", "MySQL", "索引"}');
SELECT * FROM articles WHERE tags @> '{"索引"}';  -- 包含关系
```

### 5.3 区间类型

| 类型 | 说明 |
|------|------|
| INT4RANGE | 整数区间 |
| INT8RANGE | 大整数区间 |
| NUMRANGE | 数字区间 |
| TSRANGE | 时间戳区间（无时区） |
| TSTZRANGE | 时间戳区间（带时区） |
| DATERANGE | 日期区间 |

```sql
-- 查询"在某个时间范围内"的数据
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    duration TSRANGE
);
-- 区间重叠检查
SELECT * FROM events WHERE duration && '[2024-01-01, 2024-01-31]'::tsrange;
```

### 5.4 网络地址类型

| 类型 | 说明 |
|------|------|
| INET | IPv4/IPv6 地址 |
| CIDR | 网络段（含子网掩码） |
| MACADDR | MAC 地址 |

---

## 六、Oracle 特有类型

| 类型 | 说明 |
|------|------|
| VARCHAR2(n) | 推荐字符串类型（VARCHAR 别名，未来可能改语义） |
| NVARCHAR2(n) | Unicode 字符串（n 字符） |
| NCLOB | Unicode 大文本 |
| BLOB | 二进制大对象 |
| BFILE | 指向操作系统文件的外部二进制文件 |
| RAW(n) | 定长二进制 |
| LONG / LONG RAW | 已废弃，不推荐使用 |
| ROWID / UROWID | 行地址（物理位置标识） |

---

## 七、三大数据库类型对照表

| 概念 | MySQL | PostgreSQL | Oracle |
|------|-------|-----------|--------|
| 整数 | INT / BIGINT | INT / BIGINT | NUMBER(p) |
| 较大整数 | - | - | NUMBER(19) |
| 小数 | DECIMAL(p,s) | DECIMAL / NUMERIC | NUMBER(p,s) |
| 浮点 | FLOAT / DOUBLE | REAL / DOUBLE PRECISION | BINARY_FLOAT / BINARY_DOUBLE |
| 定长字符串 | CHAR(n) | CHAR(n) | CHAR(n) |
| 变长字符串 | VARCHAR(n) | VARCHAR(n) | VARCHAR2(n) |
| 大文本 | TEXT / LONGTEXT | TEXT | CLOB |
| 日期 | DATE | DATE | DATE（含时间） |
| 时间戳 | DATETIME / TIMESTAMP | TIMESTAMP / TIMESTAMPTZ | TIMESTAMP(p) |
| 二进制 | BLOB / VARBINARY | BYTEA | BLOB / RAW |
| JSON | JSON（5.7+） | JSON / JSONB | JSON（12c+） |
| 布尔 | TINYINT(1) | BOOLEAN | NUMBER(1) |
| 枚举 | ENUM | - | - |
| 数组 | - | TEXT[] / INT[].. | - |
| 区间 | - | INTRANGE / DATERANGE.. | - |
| 网络地址 | - | INET / CIDR | - |
| 空间 | GEOMETRY / POINT.. | PostGIS 扩展 | Oracle Spatial / Locator |

---

## 八、字段类型选择速查

### 常见字段的推荐类型

| 字段 | 推荐类型 | 原因 |
|------|---------|------|
| 主键（单表） | BIGINT | 用不完，不操心 |
| 主键（分布式） | BIGINT（雪花算法） | 全局唯一，趋势递增 |
| 用户 ID | INT / BIGINT | 看用户量级 |
| 用户名 | VARCHAR(50) | 最多 50 字够了 |
| 邮箱 | VARCHAR(100) | 最长邮箱约 80 字 |
| 手机号 | VARCHAR(20) | 存格式化的，不是数字运算 |
| 金额 | DECIMAL(18,4) / DECIMAL(10,2) | 精确，不能丢精度 |
| 订单号 | VARCHAR(32) 或 BIGINT | 字符串（带前缀）或数字 |
| 状态 | TINYINT / SMALLINT | 枚举值，空间小 |
| 年龄 | TINYINT UNSIGNED | 0-255，够用 |
| 描述/备注 | VARCHAR(500) 或 TEXT | 看长度 |
| 文章内容 | TEXT / MEDIUMTEXT / LONGTEXT | 不会作为 WHERE 条件 |
| JSON 配置 | JSON / JSONB | 灵活，不常作为查询条件 |
| 创建时间 | DATETIME / TIMESTAMP | 看要不要时区处理 |
| 更新时间 | TIMESTAMP（MySQL 方便） | 自动更新 |
| IP 地址 | VARCHAR(45) | IPv6 最长 45 字 |
| 坐标 | DECIMAL(11,8) 或 PostGIS | 看查询复杂度 |
| 哈希值 | CHAR(32) / CHAR(64) | 定长，适合 CHAR |

### 选型决策顺序

```
1. 业务含义 → 数值？字符？时间？
2. 范围/长度 → 最大值是多少？增长率？
3. 精度要求 → 要精确（DECIMAL）还是允许近似（DOUBLE）？
4. 索引需求 → 会不会出现在 WHERE/ORDER BY/GROUP BY 中？
   - 会 → 避免 TEXT/JSON/BLOB
   - 不会 → 可用大字段
5. 存储空间 → 1000 万行时，每个字节差 10MB
6. 兼容性 → 会不会迁数据库？
```
