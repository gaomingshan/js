# SQL 查询支持

## 概述

Elasticsearch SQL 提供了使用 SQL 语法查询 ES 的能力，降低了学习成本。本章介绍 SQL 功能、语法支持和实际应用。

## Elasticsearch SQL 功能

### 特性

```
支持：
✓ 标准 SQL 语法
✓ JDBC/ODBC 驱动
✓ REST API 访问
✓ 自动转换为 Query DSL
✓ 聚合函数
✓ JOIN 查询（有限）

限制：
✗ 不支持子查询（部分场景）
✗ 不支持复杂 JOIN
✗ 不支持事务
✗ 不支持 UPDATE/DELETE
```

## SQL REST API

### 基本查询

```bash
POST /_sql?format=txt
{
  "query": "SELECT * FROM products LIMIT 10"
}

# 格式化输出
POST /_sql?format=json
{
  "query": "SELECT name, price FROM products WHERE price > 1000"
}
```

### 支持的格式

```
format 参数：
- json：JSON 格式（默认）
- txt：表格文本格式
- csv：CSV 格式
- tsv：TSV 格式
- yaml：YAML 格式
```

## SQL 语法支持

### SELECT 查询

```sql
-- 基本查询
SELECT name, price FROM products;

-- WHERE 条件
SELECT * FROM products WHERE price > 1000;

-- LIKE 模糊查询
SELECT * FROM products WHERE name LIKE 'iPhone%';

-- IN 查询
SELECT * FROM products WHERE category IN ('electronics', 'phones');

-- BETWEEN 范围查询
SELECT * FROM products WHERE price BETWEEN 1000 AND 5000;

-- IS NULL
SELECT * FROM products WHERE discount IS NULL;

-- AND/OR 组合
SELECT * FROM products 
WHERE price > 1000 AND category = 'electronics';
```

### ORDER BY 排序

```sql
-- 单字段排序
SELECT * FROM products ORDER BY price DESC;

-- 多字段排序
SELECT * FROM products 
ORDER BY category ASC, price DESC;

-- LIMIT
SELECT * FROM products ORDER BY price DESC LIMIT 10;

-- OFFSET
SELECT * FROM products ORDER BY price DESC LIMIT 10 OFFSET 20;
```

### 聚合函数

```sql
-- COUNT
SELECT COUNT(*) FROM products;

-- SUM
SELECT SUM(amount) FROM orders;

-- AVG
SELECT AVG(price) FROM products;

-- MIN/MAX
SELECT MIN(price), MAX(price) FROM products;

-- GROUP BY
SELECT category, COUNT(*), AVG(price)
FROM products
GROUP BY category;

-- HAVING
SELECT category, AVG(price) as avg_price
FROM products
GROUP BY category
HAVING avg_price > 1000;
```

### JOIN 查询

```sql
-- INNER JOIN（有限支持）
SELECT o.order_id, p.name, o.quantity
FROM orders o
INNER JOIN products p ON o.product_id = p.id;

-- LEFT JOIN
SELECT u.name, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

### 日期函数

```sql
-- YEAR/MONTH/DAY
SELECT YEAR(order_date), COUNT(*)
FROM orders
GROUP BY YEAR(order_date);

-- DATE_TRUNC
SELECT DATE_TRUNC('day', order_date) as day, COUNT(*)
FROM orders
GROUP BY DATE_TRUNC('day', order_date);

-- NOW
SELECT * FROM orders WHERE order_date > NOW() - INTERVAL 7 DAY;
```

### 字符串函数

```sql
-- CONCAT
SELECT CONCAT(first_name, ' ', last_name) as full_name FROM users;

-- UPPER/LOWER
SELECT UPPER(name) FROM products;

-- LENGTH
SELECT name, LENGTH(name) FROM products;

-- SUBSTRING
SELECT SUBSTRING(name, 1, 10) FROM products;
```

## JDBC 驱动连接

### 依赖配置

```xml
<dependency>
    <groupId>org.elasticsearch.plugin</groupId>
    <artifactId>x-pack-sql-jdbc</artifactId>
    <version>7.17.9</version>
</dependency>
```

### JDBC 连接

```java
import java.sql.*;

public class ElasticsearchJDBCExample {
    
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:es://http://localhost:9200";
        Properties properties = new Properties();
        properties.put("user", "elastic");
        properties.put("password", "changeme");
        
        try (Connection connection = DriverManager.getConnection(url, properties)) {
            Statement statement = connection.createStatement();
            ResultSet results = statement.executeQuery(
                "SELECT name, price FROM products WHERE price > 1000"
            );
            
            while (results.next()) {
                System.out.println(results.getString("name") + 
                    ": " + results.getDouble("price"));
            }
        }
    }
}
```

### PreparedStatement

```java
public List<Product> searchProducts(String category, double minPrice) throws SQLException {
    String sql = "SELECT * FROM products WHERE category = ? AND price > ?";
    
    try (PreparedStatement stmt = connection.prepareStatement(sql)) {
        stmt.setString(1, category);
        stmt.setDouble(2, minPrice);
        
        ResultSet rs = stmt.executeQuery();
        List<Product> products = new ArrayList<>();
        
        while (rs.next()) {
            Product product = new Product();
            product.setName(rs.getString("name"));
            product.setPrice(rs.getDouble("price"));
            products.add(product);
        }
        
        return products;
    }
}
```

## SQL 与 Query DSL 转换

### TRANSLATE API

```bash
POST /_sql/translate
{
  "query": "SELECT * FROM products WHERE price > 1000 ORDER BY price DESC LIMIT 10"
}

# 响应：转换后的 Query DSL
{
  "size": 10,
  "query": {
    "range": {
      "price": {
        "gt": 1000
      }
    }
  },
  "sort": [
    {
      "price": {
        "order": "desc"
      }
    }
  ]
}
```

## SQL 性能考量

### 性能对比

```
SQL vs Query DSL：

优势：
✓ 语法简单，易于使用
✓ 适合数据分析场景
✓ 自动优化查询

劣势：
✗ 某些查询性能稍差
✗ 不支持所有 ES 特性
✗ 复杂查询转换开销
```

### 性能优化

```sql
-- ✅ 使用索引字段
SELECT * FROM products WHERE category = 'electronics';

-- ✅ 限制返回结果
SELECT * FROM products LIMIT 100;

-- ✅ 避免 SELECT *
SELECT name, price FROM products;

-- ❌ 避免深度分页
SELECT * FROM products LIMIT 10 OFFSET 10000;

-- ✅ 使用聚合而非应用层计算
SELECT category, AVG(price) FROM products GROUP BY category;
```

## 适用场景

### 适合场景

```
✓ 数据分析和报表
✓ 临时查询和探索
✓ BI 工具集成
✓ SQL 熟悉的团队
✓ 简单的 CRUD 操作
```

### 不适合场景

```
✗ 复杂的全文搜索
✗ 高级评分和排序
✗ 实时性要求极高
✗ 需要完整 SQL 特性
✗ 复杂的 JOIN 查询
```

## 实战示例

### 销售报表

```sql
-- 每日销售统计
SELECT 
  DATE_TRUNC('day', order_time) as date,
  COUNT(*) as order_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM orders
WHERE order_time >= NOW() - INTERVAL 30 DAY
GROUP BY DATE_TRUNC('day', order_time)
ORDER BY date DESC;
```

### TOP N 查询

```sql
-- 销量 TOP 10 商品
SELECT 
  name,
  SUM(quantity) as total_sales,
  SUM(amount) as total_revenue
FROM order_items
GROUP BY name
ORDER BY total_sales DESC
LIMIT 10;
```

### 复杂分析

```sql
-- 用户购买行为分析
SELECT 
  u.user_id,
  u.name,
  COUNT(o.order_id) as order_count,
  SUM(o.amount) as total_spent,
  AVG(o.amount) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_time >= '2024-01-01'
GROUP BY u.user_id, u.name
HAVING order_count > 5
ORDER BY total_spent DESC;
```

## 限制与注意事项

### 已知限制

```
1. 不支持复杂子查询
2. JOIN 性能有限
3. 不支持窗口函数
4. 不支持 CTE（Common Table Expression）
5. 分页有限制（max_result_window）
6. 不支持跨集群查询（部分场景）
```

### 解决方案

```
问题：复杂查询不支持
方案：拆分为多个简单查询或使用 Query DSL

问题：深度分页
方案：使用 Scroll API 或 Search After

问题：性能问题
方案：创建合适的映射，添加索引
```

## 总结

**SQL 功能**：
- 标准 SQL 语法
- JDBC/ODBC 支持
- REST API 访问

**语法支持**：
- SELECT 查询
- 聚合函数
- JOIN（有限）
- 日期函数

**JDBC 集成**：
- 驱动连接
- PreparedStatement
- 结果处理

**转换工具**：
- TRANSLATE API
- 查看转换后的 DSL
- 优化参考

**性能优化**：
- 限制结果集
- 使用索引字段
- 避免深度分页

**适用场景**：
- 数据分析
- BI 集成
- 简单查询

**限制**：
- 不支持全特性
- 性能略低
- JOIN 受限

**下一步**：学习 Machine Learning 特性。
