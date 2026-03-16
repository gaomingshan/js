# 存储过程与函数

## 概述

存储过程（Stored Procedure）和函数（Function）是存储在数据库中的可执行程序代码。它们将业务逻辑封装在数据库层，可以减少网络开销、提高代码复用性、增强安全性。

**核心概念**：
- **存储过程**：执行一系列 SQL 语句，可以有输入输出参数
- **函数**：计算并返回单个值，可以在 SQL 语句中使用
- **触发器**：自动执行的特殊存储过程
- **优势**：性能提升、代码复用、安全控制
- **劣势**：调试困难、数据库依赖、版本管理复杂

---

## 存储过程

### 1. MySQL 存储过程

**创建存储过程**：
```sql
-- 修改分隔符（避免与过程内的分号冲突）
DELIMITER //

CREATE PROCEDURE sp_get_user_orders(
    IN p_user_id BIGINT,
    OUT p_order_count INT,
    OUT p_total_amount DECIMAL(10,2)
)
BEGIN
    -- 查询订单数量
    SELECT COUNT(*) INTO p_order_count
    FROM orders
    WHERE user_id = p_user_id;
    
    -- 查询订单总金额
    SELECT COALESCE(SUM(amount), 0) INTO p_total_amount
    FROM orders
    WHERE user_id = p_user_id;
END //

DELIMITER ;

-- 调用存储过程
CALL sp_get_user_orders(100, @count, @amount);
SELECT @count AS order_count, @amount AS total_amount;
```

**参数类型**：
```sql
-- IN：输入参数（默认）
-- OUT：输出参数
-- INOUT：输入输出参数

DELIMITER //

CREATE PROCEDURE sp_update_price(
    INOUT p_price DECIMAL(10,2),
    IN p_discount DECIMAL(5,2)
)
BEGIN
    SET p_price = p_price * (1 - p_discount / 100);
END //

DELIMITER ;

-- 调用
SET @price = 100.00;
CALL sp_update_price(@price, 10);  -- 10% 折扣
SELECT @price;  -- 90.00
```

**控制流程**：
```sql
DELIMITER //

CREATE PROCEDURE sp_process_order(
    IN p_order_id BIGINT,
    OUT p_status VARCHAR(20)
)
BEGIN
    DECLARE v_amount DECIMAL(10,2);
    DECLARE v_user_balance DECIMAL(10,2);
    
    -- 查询订单金额
    SELECT amount INTO v_amount
    FROM orders
    WHERE id = p_order_id;
    
    -- 查询用户余额
    SELECT balance INTO v_user_balance
    FROM users
    WHERE id = (SELECT user_id FROM orders WHERE id = p_order_id);
    
    -- 判断余额是否充足
    IF v_user_balance >= v_amount THEN
        -- 扣除余额
        UPDATE users
        SET balance = balance - v_amount
        WHERE id = (SELECT user_id FROM orders WHERE id = p_order_id);
        
        -- 更新订单状态
        UPDATE orders
        SET status = 'paid'
        WHERE id = p_order_id;
        
        SET p_status = 'success';
    ELSE
        SET p_status = 'insufficient_balance';
    END IF;
END //

DELIMITER ;
```

**循环语句**：
```sql
DELIMITER //

CREATE PROCEDURE sp_generate_dates(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    DECLARE v_current_date DATE;
    
    -- 创建临时表
    DROP TEMPORARY TABLE IF EXISTS temp_dates;
    CREATE TEMPORARY TABLE temp_dates (date_value DATE);
    
    SET v_current_date = p_start_date;
    
    -- WHILE 循环
    WHILE v_current_date <= p_end_date DO
        INSERT INTO temp_dates VALUES (v_current_date);
        SET v_current_date = DATE_ADD(v_current_date, INTERVAL 1 DAY);
    END WHILE;
    
    SELECT * FROM temp_dates;
END //

DELIMITER ;

-- 调用
CALL sp_generate_dates('2024-01-01', '2024-01-10');
```

**游标（Cursor）**：
```sql
DELIMITER //

CREATE PROCEDURE sp_update_user_levels()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user_id BIGINT;
    DECLARE v_total_amount DECIMAL(10,2);
    
    -- 声明游标
    DECLARE cur_users CURSOR FOR
        SELECT 
            u.id,
            COALESCE(SUM(o.amount), 0) AS total
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id;
    
    -- 声明 NOT FOUND 处理器
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- 打开游标
    OPEN cur_users;
    
    -- 循环读取
    read_loop: LOOP
        FETCH cur_users INTO v_user_id, v_total_amount;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 根据消费金额更新用户等级
        IF v_total_amount >= 10000 THEN
            UPDATE users SET vip_level = 3 WHERE id = v_user_id;
        ELSEIF v_total_amount >= 5000 THEN
            UPDATE users SET vip_level = 2 WHERE id = v_user_id;
        ELSEIF v_total_amount >= 1000 THEN
            UPDATE users SET vip_level = 1 WHERE id = v_user_id;
        ELSE
            UPDATE users SET vip_level = 0 WHERE id = v_user_id;
        END IF;
    END LOOP;
    
    -- 关闭游标
    CLOSE cur_users;
END //

DELIMITER ;
```

**异常处理**：
```sql
DELIMITER //

CREATE PROCEDURE sp_transfer_money(
    IN p_from_user BIGINT,
    IN p_to_user BIGINT,
    IN p_amount DECIMAL(10,2),
    OUT p_result VARCHAR(50)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- 回滚事务
        ROLLBACK;
        SET p_result = 'error';
    END;
    
    -- 开始事务
    START TRANSACTION;
    
    -- 扣除转出账户
    UPDATE users
    SET balance = balance - p_amount
    WHERE id = p_from_user AND balance >= p_amount;
    
    -- 检查是否成功扣除
    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SET p_result = 'insufficient_balance';
    ELSE
        -- 增加转入账户
        UPDATE users
        SET balance = balance + p_amount
        WHERE id = p_to_user;
        
        -- 提交事务
        COMMIT;
        SET p_result = 'success';
    END IF;
END //

DELIMITER ;
```

### 2. Oracle 存储过程

**基础语法**：
```sql
-- 创建存储过程
CREATE OR REPLACE PROCEDURE sp_get_user_orders(
    p_user_id IN NUMBER,
    p_order_count OUT NUMBER,
    p_total_amount OUT NUMBER
) AS
BEGIN
    SELECT COUNT(*) INTO p_order_count
    FROM orders
    WHERE user_id = p_user_id;
    
    SELECT NVL(SUM(amount), 0) INTO p_total_amount
    FROM orders
    WHERE user_id = p_user_id;
END;
/

-- 调用
DECLARE
    v_count NUMBER;
    v_amount NUMBER;
BEGIN
    sp_get_user_orders(100, v_count, v_amount);
    DBMS_OUTPUT.PUT_LINE('Count: ' || v_count);
    DBMS_OUTPUT.PUT_LINE('Amount: ' || v_amount);
END;
/
```

**批量处理**：
```sql
CREATE OR REPLACE PROCEDURE sp_batch_update_status AS
    TYPE t_order_ids IS TABLE OF NUMBER INDEX BY BINARY_INTEGER;
    v_order_ids t_order_ids;
BEGIN
    -- 批量获取需要更新的订单ID
    SELECT id BULK COLLECT INTO v_order_ids
    FROM orders
    WHERE status = 'pending' AND created_at < SYSDATE - 7;
    
    -- 批量更新
    FORALL i IN 1..v_order_ids.COUNT
        UPDATE orders
        SET status = 'cancelled'
        WHERE id = v_order_ids(i);
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Updated ' || v_order_ids.COUNT || ' orders');
END;
/
```

**动态 SQL**：
```sql
CREATE OR REPLACE PROCEDURE sp_dynamic_query(
    p_table_name IN VARCHAR2,
    p_column_name IN VARCHAR2,
    p_value IN VARCHAR2
) AS
    v_sql VARCHAR2(1000);
    v_count NUMBER;
BEGIN
    v_sql := 'SELECT COUNT(*) FROM ' || p_table_name || 
             ' WHERE ' || p_column_name || ' = :1';
    
    EXECUTE IMMEDIATE v_sql INTO v_count USING p_value;
    
    DBMS_OUTPUT.PUT_LINE('Count: ' || v_count);
END;
/
```

### 3. PostgreSQL 存储过程

**PL/pgSQL 语法**：
```sql
-- 创建存储过程（PostgreSQL 11+）
CREATE OR REPLACE PROCEDURE sp_update_user_stats(
    p_user_id BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_count INT;
    v_total_amount NUMERIC;
BEGIN
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO v_order_count, v_total_amount
    FROM orders
    WHERE user_id = p_user_id;
    
    UPDATE users
    SET 
        order_count = v_order_count,
        total_spent = v_total_amount
    WHERE id = p_user_id;
    
    COMMIT;
END;
$$;

-- 调用
CALL sp_update_user_stats(100);
```

**函数（PostgreSQL 早期版本用函数替代存储过程）**：
```sql
CREATE OR REPLACE FUNCTION fn_get_user_orders(
    p_user_id BIGINT,
    OUT p_order_count INT,
    OUT p_total_amount NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO p_order_count, p_total_amount
    FROM orders
    WHERE user_id = p_user_id;
END;
$$;

-- 调用
SELECT * FROM fn_get_user_orders(100);
```

---

## 函数

### 1. MySQL 函数

**标量函数**：
```sql
DELIMITER //

CREATE FUNCTION fn_calculate_discount(
    p_amount DECIMAL(10,2),
    p_vip_level INT
) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE v_discount DECIMAL(5,2);
    
    CASE p_vip_level
        WHEN 3 THEN SET v_discount = 0.20;  -- 20% 折扣
        WHEN 2 THEN SET v_discount = 0.15;  -- 15% 折扣
        WHEN 1 THEN SET v_discount = 0.10;  -- 10% 折扣
        ELSE SET v_discount = 0;
    END CASE;
    
    RETURN p_amount * (1 - v_discount);
END //

DELIMITER ;

-- 在 SQL 中使用
SELECT 
    id,
    amount,
    vip_level,
    fn_calculate_discount(amount, vip_level) AS final_amount
FROM orders o
JOIN users u ON o.user_id = u.id;
```

**函数特性**：
```sql
-- DETERMINISTIC：相同输入总是返回相同输出
-- NO SQL：不包含 SQL 语句
-- READS SQL DATA：包含读取 SQL 语句
-- MODIFIES SQL DATA：包含修改 SQL 语句

CREATE FUNCTION fn_add(a INT, b INT)
RETURNS INT
DETERMINISTIC
NO SQL
BEGIN
    RETURN a + b;
END;
```

### 2. Oracle 函数

```sql
-- 创建函数
CREATE OR REPLACE FUNCTION fn_get_user_level(
    p_user_id IN NUMBER
) RETURN VARCHAR2 AS
    v_total_amount NUMBER;
BEGIN
    SELECT NVL(SUM(amount), 0) INTO v_total_amount
    FROM orders
    WHERE user_id = p_user_id;
    
    IF v_total_amount >= 10000 THEN
        RETURN 'VIP';
    ELSIF v_total_amount >= 5000 THEN
        RETURN 'Gold';
    ELSIF v_total_amount >= 1000 THEN
        RETURN 'Silver';
    ELSE
        RETURN 'Bronze';
    END IF;
END;
/

-- 使用
SELECT 
    id,
    username,
    fn_get_user_level(id) AS user_level
FROM users;
```

**表函数（返回结果集）**：
```sql
-- 管道表函数
CREATE OR REPLACE TYPE t_user_row AS OBJECT (
    user_id NUMBER,
    username VARCHAR2(50),
    order_count NUMBER
);
/

CREATE OR REPLACE TYPE t_user_table AS TABLE OF t_user_row;
/

CREATE OR REPLACE FUNCTION fn_get_active_users
RETURN t_user_table PIPELINED AS
BEGIN
    FOR rec IN (
        SELECT 
            u.id,
            u.username,
            COUNT(o.id) AS order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.username
        HAVING COUNT(o.id) > 0
    ) LOOP
        PIPE ROW(t_user_row(rec.id, rec.username, rec.order_count));
    END LOOP;
    
    RETURN;
END;
/

-- 使用
SELECT * FROM TABLE(fn_get_active_users());
```

### 3. PostgreSQL 函数

**返回单值**：
```sql
CREATE OR REPLACE FUNCTION fn_calculate_tax(
    p_amount NUMERIC,
    p_tax_rate NUMERIC DEFAULT 0.13
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN p_amount * p_tax_rate;
END;
$$;

-- 使用
SELECT fn_calculate_tax(100);  -- 13.00
SELECT fn_calculate_tax(100, 0.20);  -- 20.00
```

**返回表**：
```sql
CREATE OR REPLACE FUNCTION fn_get_user_summary(p_user_id BIGINT)
RETURNS TABLE (
    order_count BIGINT,
    total_amount NUMERIC,
    avg_amount NUMERIC,
    first_order_date TIMESTAMP,
    last_order_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        COALESCE(SUM(amount), 0),
        COALESCE(AVG(amount), 0),
        MIN(created_at),
        MAX(created_at)
    FROM orders
    WHERE user_id = p_user_id;
END;
$$;

-- 使用
SELECT * FROM fn_get_user_summary(100);
```

---

## 触发器

### 1. MySQL 触发器

**BEFORE 触发器**：
```sql
-- 插入前触发
CREATE TRIGGER trg_before_insert_user
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    -- 自动设置创建时间
    SET NEW.created_at = NOW();
    
    -- 验证邮箱格式
    IF NEW.email NOT LIKE '%@%' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid email format';
    END IF;
    
    -- 自动生成用户名（如果未提供）
    IF NEW.username IS NULL OR NEW.username = '' THEN
        SET NEW.username = CONCAT('user_', NEW.id);
    END IF;
END;
```

**AFTER 触发器**：
```sql
-- 订单插入后，更新用户统计
CREATE TRIGGER trg_after_insert_order
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    UPDATE users
    SET 
        order_count = order_count + 1,
        total_spent = total_spent + NEW.amount
    WHERE id = NEW.user_id;
END;

-- 订单更新后，记录日志
CREATE TRIGGER trg_after_update_order
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO order_status_log (order_id, old_status, new_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
    END IF;
END;
```

**DELETE 触发器**：
```sql
-- 删除订单前，记录到归档表
CREATE TRIGGER trg_before_delete_order
BEFORE DELETE ON orders
FOR EACH ROW
BEGIN
    INSERT INTO orders_archive
    SELECT * FROM orders WHERE id = OLD.id;
END;
```

### 2. Oracle 触发器

**行级触发器**：
```sql
CREATE OR REPLACE TRIGGER trg_update_user_stats
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE users
        SET order_count = order_count + 1,
            total_spent = total_spent + :NEW.amount
        WHERE id = :NEW.user_id;
    ELSIF UPDATING THEN
        UPDATE users
        SET total_spent = total_spent - :OLD.amount + :NEW.amount
        WHERE id = :NEW.user_id;
    ELSIF DELETING THEN
        UPDATE users
        SET order_count = order_count - 1,
            total_spent = total_spent - :OLD.amount
        WHERE id = :OLD.user_id;
    END IF;
END;
/
```

**语句级触发器**：
```sql
CREATE OR REPLACE TRIGGER trg_log_table_changes
AFTER INSERT OR UPDATE OR DELETE ON users
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        operation_time,
        user_name
    ) VALUES (
        'users',
        CASE 
            WHEN INSERTING THEN 'INSERT'
            WHEN UPDATING THEN 'UPDATE'
            WHEN DELETING THEN 'DELETE'
        END,
        SYSDATE,
        USER
    );
END;
/
```

### 3. PostgreSQL 触发器

**触发器函数**：
```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 创建触发器
CREATE TRIGGER trg_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();
```

**审计日志触发器**：
```sql
-- 创建审计日志表
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    operation VARCHAR(10),
    old_data JSONB,
    new_data JSONB,
    changed_by VARCHAR(50),
    changed_at TIMESTAMP DEFAULT NOW()
);

-- 创建触发器函数
CREATE OR REPLACE FUNCTION fn_audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        current_user
    );
    
    RETURN NEW;
END;
$$;

-- 为表添加审计触发器
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_audit_changes();
```

---

## 优势与劣势

### 1. 优势

**性能提升**：
```sql
-- 应用层代码（多次网络往返）
$user_id = 100;
$result1 = query("SELECT COUNT(*) FROM orders WHERE user_id = ?", $user_id);
$result2 = query("SELECT SUM(amount) FROM orders WHERE user_id = ?", $user_id);
$result3 = query("UPDATE users SET order_count = ?, total_spent = ? WHERE id = ?", 
    $result1, $result2, $user_id);

-- 存储过程（一次网络往返）
CALL sp_update_user_stats(100);
```

**代码复用**：
```sql
-- 多个应用可以调用同一个存储过程
-- Java 应用
CallableStatement stmt = conn.prepareCall("{call sp_process_order(?)}");

-- Python 应用
cursor.callproc('sp_process_order', [order_id])

-- PHP 应用
$stmt = $pdo->prepare("CALL sp_process_order(?)");
```

**安全控制**：
```sql
-- 用户只能执行存储过程，不能直接访问表
GRANT EXECUTE ON PROCEDURE sp_get_user_info TO 'app_user'@'%';
REVOKE SELECT ON users FROM 'app_user'@'%';

-- 防止 SQL 注入
-- 存储过程内部使用参数绑定，安全
```

### 2. 劣势

**调试困难**：
```sql
-- 存储过程调试工具有限
-- 错误信息不够详细
-- 难以单步调试
```

**数据库依赖**：
```sql
-- 不同数据库语法差异大
-- MySQL、Oracle、PostgreSQL 语法不兼容
-- 迁移数据库需要重写所有存储过程
```

**版本管理复杂**：
```sql
-- 存储过程存储在数据库中
-- 不在代码仓库中
-- 版本控制困难
-- 需要额外的工具管理
```

**性能问题**：
```sql
-- 复杂的存储过程可能比应用层代码更慢
-- 游标性能差
-- 大量循环影响性能
```

---

## 最佳实践

### 1. 何时使用存储过程

**适用场景**：
```sql
-- 1. 复杂的业务逻辑
-- 多表更新，需要事务保证一致性
CREATE PROCEDURE sp_complete_order(...)

-- 2. 数据批量处理
-- 定期任务，批量更新数据
CREATE PROCEDURE sp_daily_aggregation(...)

-- 3. 数据验证和转换
-- 数据导入前的验证和清洗
CREATE PROCEDURE sp_import_data(...)

-- 4. 审计和日志
-- 自动记录数据变更
CREATE TRIGGER trg_audit_log ...
```

**不适用场景**：
```sql
-- 1. 简单查询
-- 直接在应用层查询更灵活
SELECT * FROM users WHERE id = ?

-- 2. 需要频繁修改的逻辑
-- 应用层代码更容易修改和部署

-- 3. 复杂的计算
-- 应用层有更丰富的库和工具

-- 4. 需要跨数据库兼容
-- 存储过程语法不兼容
```

### 2. 编码规范

```sql
-- 1. 命名规范
-- 存储过程：sp_xxx
-- 函数：fn_xxx
-- 触发器：trg_xxx

-- 2. 参数命名
-- 输入参数：p_xxx
-- 输出参数：p_xxx
-- 变量：v_xxx

-- 3. 注释
CREATE PROCEDURE sp_process_order(
    IN p_order_id BIGINT,  -- 订单ID
    OUT p_result VARCHAR(20)  -- 处理结果
)
BEGIN
    -- 1. 验证订单状态
    -- 2. 检查库存
    -- 3. 更新订单
    -- 4. 扣减库存
END;

-- 4. 异常处理
-- 添加适当的异常处理逻辑
```

### 3. 性能优化

```sql
-- 1. 避免使用游标
-- 使用 SET 操作代替游标循环

-- 不好：游标
DECLARE cur CURSOR FOR SELECT id FROM users;
OPEN cur;
LOOP
    FETCH cur INTO v_id;
    UPDATE users SET status = 1 WHERE id = v_id;
END LOOP;

-- 好：批量更新
UPDATE users SET status = 1;

-- 2. 使用批量操作
-- Oracle FORALL，减少上下文切换

-- 3. 合理使用索引
-- 存储过程中的查询也需要索引支持

-- 4. 避免在循环中查询数据库
-- 尽量在循环外完成数据查询
```

---

## 生产环境示例

### 1. 订单处理存储过程

```sql
DELIMITER //

CREATE PROCEDURE sp_create_order(
    IN p_user_id BIGINT,
    IN p_product_id BIGINT,
    IN p_quantity INT,
    OUT p_order_id BIGINT,
    OUT p_result VARCHAR(50)
)
BEGIN
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_stock INT;
    DECLARE v_amount DECIMAL(10,2);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'error';
    END;
    
    START TRANSACTION;
    
    -- 1. 检查商品库存
    SELECT price, stock INTO v_price, v_stock
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;
    
    IF v_stock < p_quantity THEN
        ROLLBACK;
        SET p_result = 'out_of_stock';
    ELSE
        -- 2. 计算订单金额
        SET v_amount = v_price * p_quantity;
        
        -- 3. 创建订单
        INSERT INTO orders (user_id, product_id, quantity, amount, status, created_at)
        VALUES (p_user_id, p_product_id, p_quantity, v_amount, 'pending', NOW());
        
        SET p_order_id = LAST_INSERT_ID();
        
        -- 4. 扣减库存
        UPDATE products
        SET stock = stock - p_quantity
        WHERE id = p_product_id;
        
        COMMIT;
        SET p_result = 'success';
    END IF;
END //

DELIMITER ;
```

### 2. 数据同步触发器

```sql
-- 订单表变更时，同步更新用户统计
DELIMITER //

CREATE TRIGGER trg_sync_user_stats
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO user_stats (user_id, order_count, total_amount, last_order_at)
    VALUES (NEW.user_id, 1, NEW.amount, NEW.created_at)
    ON DUPLICATE KEY UPDATE
        order_count = order_count + 1,
        total_amount = total_amount + NEW.amount,
        last_order_at = NEW.created_at;
END //

DELIMITER ;
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Stored Procedures: https://dev.mysql.com/doc/refman/8.0/en/stored-routines.html
   - Triggers: https://dev.mysql.com/doc/refman/8.0/en/triggers.html

2. **Oracle 官方文档**：
   - PL/SQL: https://docs.oracle.com/en/database/oracle/oracle-database/19/lnpls/

3. **PostgreSQL 官方文档**：
   - PL/pgSQL: https://www.postgresql.org/docs/current/plpgsql.html

4. **最佳实践**：
   - 简单逻辑用应用层代码
   - 复杂事务用存储过程
   - 避免过度使用游标
   - 添加异常处理
   - 定期审查和优化
