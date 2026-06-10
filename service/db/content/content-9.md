# 附录 — 概念速查

前面八部分是"理解"，这部分是"忘了回来翻一下"。

---

## ACID 速查

| 特性 | 含义 | 实现机制 |
|------|------|---------|
| 原子性（Atomicity） | 事务全成功或全失败 | Undo Log |
| 一致性（Consistency） | 事务前后数据满足所有约束 | 原子性 + 隔离性 + 持久性 + 约束 |
| 隔离性（Isolation） | 并发事务互不干扰 | MVCC + 锁 |
| 持久性（Durability） | 提交后数据不丢失 | Redo Log + WAL |

---

## 事务隔离级别

| 级别 | 脏读 | 不可重复读 | 幻读 | 默认使用 |
|------|------|-----------|------|---------|
| 读未提交（RU） | ✅ 可能 | ✅ 可能 | ✅ 可能 | 几乎不用 |
| 读已提交（RC） | ❌ | ✅ 可能 | ✅ 可能 | Oracle、PostgreSQL |
| 可重复读（RR） | ❌ | ❌ | ✅ 可能（MySQL InnoDB 用间隙锁防止） | MySQL |
| 串行化（S） | ❌ | ❌ | ❌ | 性能最差，紧急场景用 |

---

## 锁类型

### 按粒度

| 锁粒度 | 说明 | 场景 |
|--------|------|------|
| 行锁 | 锁住单行（实际锁索引） | InnoDB 默认 |
| 间隙锁 | 锁住一个范围，不锁具体行 | RR 级别防幻读 |
| 临键锁 | 行锁 + 间隙锁 | InnoDB RR 默认锁算法 |
| 表锁 | 锁住整张表 | MyISAM、DDL 操作 |
| 意向锁 | 表示"事务打算给行加锁"的表级标记 | 快速判断表上有没有行锁 |

### 按模式

| 锁模式 | 说明 |
|--------|------|
| 共享锁（S） | 允许其他事务读，不允许写 |
| 排他锁（X） | 不允许其他事务读或写 |

### 如何查看锁

```sql
-- MySQL
SHOW ENGINE INNODB STATUS\G
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;

-- PostgreSQL
SELECT * FROM pg_locks;

-- Oracle
SELECT blocking_session, sid FROM v$session
WHERE blocking_session IS NOT NULL;
```

---

## 索引类型

| 索引类型 | 特点 | 适用场景 | 支持数据库 |
|---------|------|---------|----------|
| B+Tree | 支持范围、排序、等值 | 通用 | 所有 |
| Hash | 等值查询 O(1) | 纯等值匹配 | Memory(PG可建) |
| Bitmap | 位图存储、空间小 | 低基数 OLAP | Oracle |
| Full-Text | 文本搜索 | 搜索 | MySQL/PG/Oracle |
| Spatial (GIST) | 空间数据 | GIS | MySQL/PG |
| 函数索引 | 对表达式建索引 | 函数查询、大小写不敏感 | MySQL8+/PG/Oracle |
| 部分索引 | 只索引部分行 | 只查活跃数据 | PostgreSQL |
| 覆盖索引 | 索引包含查询的所有字段 | 避免回表 | 所有（联合索引实现） |

---

## 执行计划 type 含义

| type | 含义 | 好坏 |
|------|------|------|
| const | 主键或唯一索引等值查询，最多一行 | ✅ 最优 |
| eq_ref | JOIN 时被驱动表用主键/唯一索引匹配 | ✅ |
| ref | 普通索引等值查询 | ✅ |
| range | 索引范围查询（> < BETWEEN IN） | ✅ |
| index | 遍历索引树（全索引扫描） | 🟡 比全表好一点 |
| ALL | 全表扫描 | ❌ 最差 |

---

## Extra 关键信息

| Extra 信息 | 含义 |
|-----------|------|
| Using index | 覆盖索引，不需要回表 ✅ |
| Using index condition | ICP 索引下推，减少回表 ✅ |
| Using where | 读数据后在 Server 层过滤 |
| Using filesort | 需要额外排序（没用到索引排序）❌ |
| Using temporary | 需要临时表（GROUP BY / DISTINCT）❌ |

---

## 三大数据库默认值速查

| 对比项 | MySQL | PostgreSQL | Oracle |
|--------|-------|-----------|--------|
| 默认隔离级别 | Repeatable Read | Read Committed | Read Committed |
| 默认端口 | 3306 | 5432 | 1521 |
| 自增语法 | AUTO_INCREMENT | SERIAL / IDENTITY | SEQUENCE |
| 字符串类型 | VARCHAR | VARCHAR / TEXT | VARCHAR2 |
| DDL 事务 | 隐式提交 | 支持回滚 | 隐式提交 |
| 存储过程 | 基础支持 | PL/pgSQL | PL/SQL |
| MVCC 实现 | Undo Log 版本链 | 行版本 + VACUUM | Undo 表空间 |
| 连接模式 | 线程模型 | 进程模型 | 进程模型 |

---

## 常见问题排查路径

### SQL 突然变慢了

```
检查步骤：
1. SHOW FULL PROCESSLIST / pg_stat_activity
   → 有没有长时间未提交的事务在阻塞？
   → 有没有大量连接堆积？
2. EXPLAIN 执行计划
   → type 是不是 ALL？（全表扫描）
   → 是不是没走预期的索引？
   → rows 是不是远大于实际返回行数？
3. 检查统计信息
   → ANALYZE TABLE / 收集统计信息
4. 看机器资源
   → CPU 高？IO 高？内存不足？
```

### 事务锁等待/死锁

```
1. 查当前锁
   → MySQL: SHOW ENGINE INNODB STATUS
   → PG: SELECT * FROM pg_locks
   → Oracle: v$session + v$lock
2. 找阻塞源头
   → 谁在持有锁不释放？
   → 那个会话在做什么 SQL？
3. 处理
   → KILL / pg_terminate_backend 终止阻塞会话
4. 预防
   → 检查事务范围（是否太大？）
   → 检查锁顺序是否一致
   → 检查 WHERE 条件是否有索引
```

### INSERT 很慢

```
1. 表有多少索引？每多一个索引 INSERT 就多维护一棵 B+Tree
2. 主键是自增还是 UUID？UUID 会频繁页分裂
3. 磁盘 IO 有没有瓶颈？
4. 有没有外键约束要检查？
```

### 数据库连不上了

```
1. 服务在运行吗？
   → systemctl status mysqld / pg_isready
2. 连接数满了吗？
   → MySQL: Too many connections → 检查连接池配置
3. 网络通吗？
   → telnet host port
4. 防火墙拦了吗？
   → iptables / ufw 规则
5. 认证对吗？
   → 用户、密码、host 匹配的 host 权限
```
