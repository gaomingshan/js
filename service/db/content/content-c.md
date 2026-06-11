# DDL 与实践 — 改表结构有什么后果

你迟早会遇到这个场景：生产环境一张表有几百万行数据，业务方说"加个字段"。你顺手敲了个 `ALTER TABLE`，然后——

数据库卡住了，查询超时了，主从延迟了，老板找你了。

这一节不讲怎么建表，讲**动表结构时数据库内部发生了什么**，以及怎么安全地做。

---

## MySQL Online DDL 的演变

### 5.6 之前：ALTER = 锁表

```sql
-- 5.6 之前的 ALTER TABLE
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

这条语句的执行过程：

1. 创建一张临时表（带新结构）
2. 对原表加锁（禁止读写）
3. 逐行把原表数据拷贝到临时表
4. 删除原表，重命名临时表
5. 释放锁

整个过程原表**完全不可用**。100 万行的表加个字段，锁表时间可能是几十秒到几分钟。

### 5.6：Online DDL 诞生

MySQL 5.6 引入了 Online DDL，核心改进是**大部分 DDL 操作不再完全锁表**。

```sql
-- 5.6+ 的 ALTER TABLE
ALTER TABLE users ADD COLUMN phone VARCHAR(20), ALGORITHM=INPLACE, LOCK=NONE;
```

- `ALGORITHM=INPLACE`：不需要拷贝整张表，在现有表结构上直接改
- `LOCK=NONE`：不阻塞 DML（读写）

### 8.0：INSTANT 算法

MySQL 8.0 引入了更快的 `INSTANT` 算法——**只修改元数据，不动数据文件**。

```sql
-- 8.0 新增字段可以秒级完成
ALTER TABLE users ADD COLUMN phone VARCHAR(20), ALGORITHM=INSTANT;
```

但 INSTANT 有严格限制：只能在表**末尾**加字段，不能修改中间列。

---

## DDL 算法速查表

| 算法 | 原理 | 是否动数据 | 是否锁表 | 适用操作 | MySQL 版本 |
|------|------|-----------|---------|---------|-----------|
| INSTANT | 只改元数据 | ❌ 不动数据 | ❌ 不锁 | 末尾加列 | 8.0.12+ |
| INPLACE | 原地重建 | ✅ 动数据 | 🟡 视操作 | 加索引/删列/改类型 | 5.6+ |
| COPY | 创建临时表拷贝 | ✅ 全量拷贝 | ✅ 锁写 | 部分类型变更 | 全版本 |

### 常见 DDL 操作的算法选择

| DDL 操作 | MySQL 8.0 算法 | 是否锁表 | 说明 |
|---------|---------------|---------|------|
| ADD COLUMN（末尾） | INSTANT | ❌ | 秒级完成 |
| ADD COLUMN（非末尾） | INPLACE | 🟡 锁元数据 | 需要重建表 |
| DROP COLUMN | INPLACE | 🟡 | 需要重建表 |
| ADD INDEX | INPLACE | ❌ | 不阻塞 DML |
| DROP INDEX | INPLACE | ❌ | 仅改元数据 |
| MODIFY COLUMN（改类型） | COPY | ✅ | 必须重建表 |
| RENAME COLUMN | INPLACE | ❌ | 仅改元数据 |
| ADD/DROP FOREIGN KEY | INPLACE | ❌ | 仅改元数据 |
| ADD/DROP PRIMARY KEY | INPLACE | ✅ | 需要重建表 |

```sql
-- 安全的大表 DDL（5.6+）
ALTER TABLE large_table
  ADD COLUMN phone VARCHAR(20),
  ALGORITHM=INPLACE,
  LOCK=NONE;
```

---

## DDL 没有表面上那么简单

### 1. 空间翻倍

`ALGORITHM=INPLACE` 不是不需要额外空间。InnoDB 在 DDL 过程中仍需要**临时日志**和**临时排序文件**。

```sql
-- 重建一张 100GB 的表
ALTER TABLE big_table ENGINE=InnoDB;
-- 执行期间临时文件可能占到 100GB+
```

**如果磁盘空间满了，DDL 会直接失败。**

实战建议：
- 执行大 DDL 前检查 `df -h`，确保有足够的剩余空间
- 低峰期执行，留 buffer

### 2. 主从延迟

DDL 在主库执行完成后，会写入 binlog。从库回放这条 DDL 时，**会阻塞从库上的所有查询**。

```sql
-- 主库执行（用时 2 秒）
ALTER TABLE users ADD COLUMN phone VARCHAR(20), ALGORITHM=INPLACE, LOCK=NONE;

-- 从库回放（同样用时 2 秒）
-- 但这 2 秒内，从库上的所有 SELECT 被阻塞
```

如果从库承载了读流量，大 DDL 会导致**读不可用**几秒到几分钟。

### 3. 长事务阻塞 DDL

```sql
-- 事务 A 长时间未提交
BEGIN;
SELECT * FROM users WHERE id = 1;
-- 一直不 COMMIT

-- 事务 B
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- ❌ 等待事务 A 释放元数据锁（MDL）
```

DDL 需要获取表的**元数据锁（MDL）**。如果有长事务持有 MDL 不释放，DDL 会等待，进而阻塞后续所有对该表的操作。

```sql
-- 查看 MDL 锁等待
SELECT * FROM performance_schema.metadata_locks
WHERE object_schema = 'mydb' AND object_name = 'users';
```

---

## 大表 DDL 的几种策略

### 策略一：业务低峰期直接跑

```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20), ALGORITHM=INPLACE, LOCK=NONE;
```

适合：表不大（< 1000 万行）、能接受短暂影响。

### 策略二：pt-online-schema-change

Percona Toolkit 的工具，在不锁表的情况下完成 DDL。

原理：

```
1. 创建一张跟原表结构相同的临时表（加好新字段）
2. 在原表上建触发器
   - INSERT 触发器：将新行插入临时表
   - UPDATE 触发器：将更新同步到临时表
   - DELETE 触发器：将删除同步到临时表
3. 分批拷贝原表数据到临时表（每次几千行）
4. 拷贝完成后，RENAME 切换表名
5. 删除触发器
```

```bash
pt-online-schema-change h=localhost,D=mydb,t=users \
  --alter "ADD COLUMN phone VARCHAR(20)" \
  --execute
```

特点：
- 全程不锁表，业务无感
- 通过 chunk 分批拷贝，不占满 IO
- 可以指定负载控制（`--chunk-size`、`--max-lag`）
- 但如果触发器过多，会影响原表写入性能

### 策略三：gh-ost

GitHub 开发的在线表变更工具，原理类似但更安全——**不需要触发器**。

原理：

```
1. 创建临时表
2. 伪装成从库，通过 binlog 同步数据
   → 所有写入变更都通过 binlog 同步到临时表
3. 分批拷贝存量数据到临时表
4. 切换表名
```

```bash
gh-ost --host=127.0.0.1 --database=mydb --table=users \
  --alter="ADD COLUMN phone VARCHAR(20)" \
  --execute
```

**gh-ost vs pt-osc：**

| 对比 | pt-osc | gh-ost |
|------|--------|--------|
| 数据同步方式 | 触发器 | binlog 伪装从库 |
| 对原表影响 | 有触发器开销 | 只读 binlog |
| 暂停/恢复 | 支持 | 支持（更灵活） |
| 主从切换适应 | 一般 | 好 |
| 停止切换 | 不能停（触发器一直运行） | 可随时清理 |

### 选择建议

| 场景 | 推荐方案 |
|------|---------|
| 表 < 1000 万，低峰期 | 直接 ALTER（ALGORITHM=INPLACE, LOCK=NONE） |
| 表大，能装 pt-osc | pt-online-schema-change |
| 表大，对触发器开销敏感 | gh-ost |
| 云数据库（RDS/Aurora） | 用云厂商提供的在线 DDL 功能 |

---

## PostgreSQL 的 DDL 差异

PostgreSQL 的一个显著优势：**DDL 是事务型的**。

```sql
BEGIN;
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN address TEXT;
-- 发现 address 不需要
ROLLBACK;
-- ✅ 两个 ALTER 全部回滚
```

这在 MySQL 里做不到——MySQL 的 DDL 会隐式提交当前事务，DDL 本身也不能回滚。

PostgreSQL 某些 DDL 操作也不阻塞读写：

```sql
-- 添加列（PostgreSQL 11+）
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- 不阻塞查询和写入

-- 添加默认值（PostgreSQL 11+）
ALTER TABLE users ALTER COLUMN status SET DEFAULT 1;
-- 秒级，只改元数据

-- 创建索引（不阻塞写入）
CREATE INDEX CONCURRENTLY idx_username ON users(username);
```

---

## Oracle 的 DDL 差异

Oracle 的 DDL 自动提交当前事务（类似 MySQL）。

Oracle 的在线重定义（DBMS_REDEFINITION）支持在表在线的情况下修改结构——原理类似 pt-osc，但不需要额外工具。

```sql
-- Oracle 在线重定义（简略示例）
BEGIN
  DBMS_REDEFINITION.START_REDEF_TABLE('mydb', 'users', 'users_temp');
  DBMS_REDEFINITION.COPY_TABLE_DEPENDENTS('mydb', 'users', 'users_temp');
  DBMS_REDEFINITION.FINISH_REDEF_TABLE('mydb', 'users', 'users_temp');
END;
/
```

---

## DDL 避坑清单

```
1. 执行前检查磁盘空间（df -h）
2. 检查有无长事务阻塞 MDL（SHOW PROCESSLIST）
3. 在测试环境先执行一遍，确认耗时
4. 业务低峰期执行
5. 表锁操作（LOCK=EXCLUSIVE）必须谨慎
6. 大表尽量用 pt-osc 或 gh-ost
7. 监控主从延迟（SHOW SLAVE STATUS\G）
8. 准备回滚方案（备份、切换脚本）
9. 不要在同一张表上同时跑多个 DDL
10. 不要在生产环境直接 DROP COLUMN（应用可能还在读）
```

---

## 这一节的核心思维

ALTER TABLE 不是"改个字段定义"这么简单。改一行元数据是秒级的，但**让数据文件的结构匹配新的元数据定义**可能需要几分钟甚至几小时。

这个"元数据定义变更 → 数据重组"之间的差距，就是所有 DDL 问题的根源。理解了这一点，你就知道什么时候可以直接 ALTER、什么时候需要用 pt-osc、什么时候该换个姿势做。
