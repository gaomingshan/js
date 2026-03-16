# 表结构设计

## 概述

表结构设计是数据库设计的核心，直接影响数据完整性、查询性能和系统可维护性。好的表结构设计需要在范式理论和实际需求之间找到平衡，既要保证数据一致性，又要考虑查询效率。

**核心要素**：
- **主键设计**：唯一标识每一行
- **外键约束**：维护表间关系
- **约束条件**：保证数据完整性
- **索引策略**：提升查询性能
- **范式与反范式**：权衡设计

---

## 主键设计

### 1. 主键类型选择

#### 自增整数主键（推荐）

**MySQL**：
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 优点：
-- - 占用空间小（8字节）
-- - 顺序插入，B+树性能好
-- - 简单易用
-- 缺点：
-- - 分布式环境可能冲突
-- - 暴露数据量
```

**Oracle**：
```sql
-- 使用序列
CREATE SEQUENCE user_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE users (
    id NUMBER(19) PRIMARY KEY,
    username VARCHAR2(50) NOT NULL
);

-- 插入时使用序列
INSERT INTO users (id, username) VALUES (user_id_seq.NEXTVAL, 'alice');

-- Oracle 12c+ 支持 IDENTITY
CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(50) NOT NULL
);
```

**PostgreSQL**：
```sql
-- 使用 SERIAL
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL
);

-- 或使用 IDENTITY（PostgreSQL 10+，推荐）
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL
);
```

#### UUID 主键

```sql
-- MySQL
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,  -- '550e8400-e29b-41d4-a716-446655440000'
    order_no VARCHAR(32) NOT NULL
);

-- 生成 UUID
INSERT INTO orders (id, order_no) VALUES (UUID(), 'ORD202403160001');

-- PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(32) NOT NULL
);

-- 优点：
-- - 全局唯一，分布式友好
-- - 不暴露数据量
-- 缺点：
-- - 占用空间大（36字节字符串或16字节二进制）
-- - 无序插入，B+树性能差
-- - 索引碎片化
```

#### 雪花算法 ID（Snowflake）

```sql
-- 64位长整数
-- 1位符号位 + 41位时间戳 + 10位机器ID + 12位序列号

CREATE TABLE orders (
    id BIGINT PRIMARY KEY,  -- 雪花算法生成
    order_no VARCHAR(32) NOT NULL
);

-- 应用层生成 ID
INSERT INTO orders (id, order_no) VALUES (1767089200123456789, 'ORD202403160001');

-- 优点：
-- - 全局唯一
-- - 趋势递增，B+树友好
-- - 包含时间信息
-- - 性能高
-- 缺点：
-- - 需要应用层实现
-- - 依赖时钟
```

#### 复合主键

```sql
-- 订单明细表
CREATE TABLE order_items (
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

-- 用户角色关联表
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 适用场景：多对多关系表
-- 优点：直接表达业务约束
-- 缺点：JOIN 时复杂度增加
```

### 2. 主键选择建议

| 场景 | 推荐主键 | 原因 |
|------|----------|------|
| 单机数据库 | 自增 BIGINT | 简单高效 |
| 分布式系统 | 雪花算法 | 全局唯一，趋势递增 |
| 需要保密数据量 | UUID | 不暴露记录数 |
| 多对多关系表 | 复合主键 | 直接表达约束 |
| 高并发插入 | 雪花算法或 UUID | 避免自增锁 |

---

## 外键约束

### 1. 创建外键

```sql
-- MySQL
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    order_no VARCHAR(32) NOT NULL,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 或在创建表后添加
ALTER TABLE orders
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Oracle
CREATE TABLE orders (
    id NUMBER(19) PRIMARY KEY,
    user_id NUMBER(19) NOT NULL,
    order_no VARCHAR2(32) NOT NULL,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id)
);

-- PostgreSQL
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_no VARCHAR(32) NOT NULL,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
```

### 2. 外键级联操作

#### ON DELETE 选项

```sql
-- RESTRICT / NO ACTION：拒绝删除（默认）
ON DELETE RESTRICT

-- CASCADE：级联删除
ON DELETE CASCADE

-- SET NULL：设置为 NULL
ON DELETE SET NULL

-- SET DEFAULT：设置为默认值
ON DELETE SET DEFAULT

-- 示例
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 删除用户时，该用户的所有订单也会被删除
DELETE FROM users WHERE id = 1;
```

#### ON UPDATE 选项

```sql
-- CASCADE：级联更新（常用）
ON UPDATE CASCADE

-- 示例
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
);

-- 更新用户 ID 时，订单中的 user_id 也会更新
UPDATE users SET id = 999 WHERE id = 1;
```

### 3. 外键的优缺点

**优点**：
- 保证数据一致性
- 防止孤儿记录
- 数据库级别约束

**缺点**：
- 影响插入/删除性能
- 增加锁竞争
- 限制数据迁移灵活性
- 分库分表困难

**生产实践**：
```sql
-- 互联网高并发场景：不使用外键
-- 原因：性能优先，应用层保证一致性

-- 企业管理系统：使用外键
-- 原因：数据一致性优先

-- 折中方案：添加索引但不创建外键
CREATE INDEX idx_user_id ON orders(user_id);
-- 应用层检查引用完整性
```

---

## 约束条件

### 1. NOT NULL 约束

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,      -- 不允许 NULL
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL      -- 允许 NULL
);

-- 修改列为 NOT NULL
ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NOT NULL;

-- 注意：修改前确保列中没有 NULL 值
UPDATE users SET phone = '' WHERE phone IS NULL;
ALTER TABLE users MODIFY COLUMN phone VARCHAR(20) NOT NULL;
```

### 2. UNIQUE 约束

```sql
-- 创建表时定义
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    CONSTRAINT uk_email UNIQUE (email)
);

-- 添加唯一约束
ALTER TABLE users ADD UNIQUE KEY uk_username (username);
ALTER TABLE users ADD CONSTRAINT uk_email UNIQUE (email);

-- 复合唯一约束
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    UNIQUE KEY uk_user_role (user_id, role_id)
);

-- 删除唯一约束
ALTER TABLE users DROP INDEX uk_username;  -- MySQL
ALTER TABLE users DROP CONSTRAINT uk_email;  -- Oracle/PostgreSQL
```

### 3. CHECK 约束

```sql
-- MySQL 8.0.16+ 支持 CHECK
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    CONSTRAINT chk_price CHECK (price >= 0),
    CONSTRAINT chk_stock CHECK (stock >= 0 AND stock <= 10000)
);

-- Oracle
CREATE TABLE products (
    id NUMBER(19) PRIMARY KEY,
    price NUMBER(10,2) NOT NULL,
    stock NUMBER(10) NOT NULL,
    CONSTRAINT chk_price CHECK (price >= 0),
    CONSTRAINT chk_stock CHECK (stock BETWEEN 0 AND 10000)
);

-- PostgreSQL
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL CHECK (stock >= 0 AND stock <= 10000),
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'deleted'))
);

-- 添加 CHECK 约束
ALTER TABLE products ADD CONSTRAINT chk_price CHECK (price >= 0);

-- 删除 CHECK 约束
ALTER TABLE products DROP CONSTRAINT chk_price;
```

### 4. DEFAULT 约束

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    vip_level TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 修改默认值
ALTER TABLE users ALTER COLUMN status SET DEFAULT 2;  -- MySQL
ALTER TABLE users MODIFY status DEFAULT 2;            -- Oracle
ALTER TABLE users ALTER COLUMN status SET DEFAULT 2;  -- PostgreSQL

-- 删除默认值
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
```

---

## 范式与反范式

### 1. 第一范式（1NF）

每个字段不可再分，必须是原子值。

**违反 1NF**：
```sql
-- 错误：地址字段包含多个信息
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    address VARCHAR(200)  -- '北京市朝阳区XXX街道XXX号'
);
```

**符合 1NF**：
```sql
-- 正确：拆分为多个字段
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    street VARCHAR(100)
);
```

### 2. 第二范式（2NF）

在 1NF 基础上，非主键字段完全依赖于主键。

**违反 2NF**：
```sql
-- 复合主键表
CREATE TABLE order_items (
    order_id BIGINT,
    product_id BIGINT,
    product_name VARCHAR(100),  -- 只依赖 product_id
    product_price DECIMAL(10,2), -- 只依赖 product_id
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

**符合 2NF**：
```sql
-- 拆分表
CREATE TABLE order_items (
    order_id BIGINT,
    product_id BIGINT,
    quantity INT,
    price DECIMAL(10,2),  -- 下单时的价格
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)  -- 当前价格
);
```

### 3. 第三范式（3NF）

在 2NF 基础上，非主键字段不依赖于其他非主键字段。

**违反 3NF**：
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(50),    -- 依赖于 user_id
    user_phone VARCHAR(20),   -- 依赖于 user_id
    total_amount DECIMAL(10,2)
);
```

**符合 3NF**：
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    total_amount DECIMAL(10,2)
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    phone VARCHAR(20)
);
```

### 4. 反范式设计

**冗余换性能**：
```sql
-- 范式设计（需要 JOIN）
SELECT o.id, u.name, u.phone, o.total_amount
FROM orders o
JOIN users u ON o.user_id = u.id;

-- 反范式设计（避免 JOIN）
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(50),     -- 冗余字段
    user_phone VARCHAR(20),    -- 冗余字段
    total_amount DECIMAL(10,2)
);

SELECT id, user_name, user_phone, total_amount FROM orders;
```

**适用场景**：
- 读多写少
- 查询性能要求高
- 可以接受数据冗余
- 能保证数据一致性（触发器或应用层）

---

## 表设计最佳实践

### 1. 电商订单表设计

```sql
-- 订单主表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单编号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) NOT NULL COMMENT '用户名（冗余）',
    -- 金额字段
    total_amount BIGINT NOT NULL COMMENT '商品总金额（分）',
    freight_amount BIGINT NOT NULL DEFAULT 0 COMMENT '运费（分）',
    discount_amount BIGINT NOT NULL DEFAULT 0 COMMENT '优惠金额（分）',
    final_amount BIGINT NOT NULL COMMENT '实付金额（分）',
    -- 状态与时间
    status TINYINT NOT NULL DEFAULT 0 COMMENT '订单状态',
    pay_method TINYINT DEFAULT NULL COMMENT '支付方式',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME DEFAULT NULL,
    shipped_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    -- 收货信息（快照）
    receiver_name VARCHAR(50) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address VARCHAR(200) NOT NULL,
    -- 备注与扩展
    remark VARCHAR(500) DEFAULT NULL,
    extra_info JSON DEFAULT NULL,
    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单明细表
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(100) NOT NULL COMMENT '商品名称（快照）',
    product_image VARCHAR(500) NOT NULL COMMENT '商品图片（快照）',
    sku_id BIGINT NOT NULL COMMENT 'SKU ID',
    sku_name VARCHAR(200) NOT NULL COMMENT 'SKU名称（快照）',
    price BIGINT NOT NULL COMMENT '单价（分）',
    quantity INT NOT NULL COMMENT '数量',
    total_amount BIGINT NOT NULL COMMENT '小计（分）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';
```

### 2. 用户表设计

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    -- 账号信息
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    phone CHAR(11) UNIQUE COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    -- 个人信息
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    gender TINYINT DEFAULT 0 COMMENT '性别：0未知,1男,2女',
    birthday DATE DEFAULT NULL COMMENT '生日',
    -- 状态与等级
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常,0禁用',
    vip_level TINYINT NOT NULL DEFAULT 0 COMMENT 'VIP等级',
    points INT NOT NULL DEFAULT 0 COMMENT '积分',
    balance BIGINT NOT NULL DEFAULT 0 COMMENT '余额（分）',
    -- 统计信息
    login_count INT NOT NULL DEFAULT 0 COMMENT '登录次数',
    order_count INT NOT NULL DEFAULT 0 COMMENT '订单数',
    total_spent BIGINT NOT NULL DEFAULT 0 COMMENT '累计消费（分）',
    -- 时间戳
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME DEFAULT NULL,
    -- 扩展字段
    profile JSON DEFAULT NULL COMMENT '扩展资料',
    settings JSON DEFAULT NULL COMMENT '用户设置',
    -- 索引
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 3. 软删除设计

```sql
CREATE TABLE articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1:正常,0:已删除',
    deleted_at DATETIME DEFAULT NULL COMMENT '删除时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_author_status (author_id, status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 软删除
UPDATE articles SET status = 0, deleted_at = NOW() WHERE id = 1;

-- 查询时过滤已删除
SELECT * FROM articles WHERE status = 1;

-- 恢复删除
UPDATE articles SET status = 1, deleted_at = NULL WHERE id = 1;

-- 物理删除（定期清理）
DELETE FROM articles WHERE status = 0 AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 易错点与边界

### 1. 主键选择错误

```sql
-- 错误：使用业务字段作为主键
CREATE TABLE users (
    email VARCHAR(100) PRIMARY KEY,  -- 业务字段可能变更
    username VARCHAR(50) NOT NULL
);

-- 正确：使用代理主键
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL
);
```

### 2. 过度范式化

```sql
-- 过度范式化：需要多次 JOIN
SELECT 
    o.order_no,
    u.username,
    u.email,
    a.province,
    a.city,
    a.street
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN addresses a ON o.address_id = a.id;

-- 适度冗余：提升查询性能
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(50),  -- 冗余
    address_text VARCHAR(200)  -- 冗余，快照
);
```

### 3. 缺少时间戳字段

```sql
-- 不推荐：缺少审计字段
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50)
);

-- 推荐：添加时间戳
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. 索引遗漏

```sql
-- 外键字段必须有索引
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,  -- 缺少索引
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 正确
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 参考资料

1. **数据库设计理论**：
   - 数据库范式：https://en.wikipedia.org/wiki/Database_normalization
   - 主键设计：选择合适的主键类型

2. **MySQL 官方文档**：
   - Table Design: https://dev.mysql.com/doc/refman/8.0/en/creating-tables.html
   - Constraints: https://dev.mysql.com/doc/refman/8.0/en/constraints.html

3. **最佳实践**：
   - 使用自增或雪花算法作为主键
   - 高并发场景慎用外键
   - 适度冗余，避免过度 JOIN
   - 所有表添加时间戳字段
   - 重要数据使用软删除
   - 外键字段必须有索引
