# 读写分离与负载均衡

## 概述

读写分离是提升数据库系统吞吐量和可用性的重要架构模式。通过将读操作和写操作分离到不同的数据库实例，可以有效分散数据库压力，提升系统性能。

**核心概念**：
- **主库（Master）**：处理写操作
- **从库（Slave/Replica）**：处理读操作
- **主从复制**：数据同步机制
- **负载均衡**：分发读请求
- **读写分离中间件**：路由层

---

## 主从复制

### 1. 复制原理

**MySQL 主从复制流程**：
```
主库（Master）：
1. 执行 SQL 语句
2. 记录到 Binlog
3. Binlog Dump 线程发送到从库

从库（Slave）：
1. I/O 线程接收 Binlog
2. 写入 Relay Log
3. SQL 线程重放 Relay Log
4. 应用到从库
```

**三个线程**：
```
主库：
- Binlog Dump Thread：发送 Binlog

从库：
- I/O Thread：接收并写入 Relay Log
- SQL Thread：读取 Relay Log 并执行
```

### 2. 配置主从复制

**主库配置**：
```ini
# my.cnf
[mysqld]
# 服务器 ID（唯一）
server-id = 1

# 启用 Binlog
log-bin = /data/mysql/binlog/mysql-bin

# Binlog 格式
binlog-format = ROW

# 要复制的数据库（可选）
binlog-do-db = mydb

# 不复制的数据库（可选）
binlog-ignore-db = mysql
binlog-ignore-db = information_schema
```

**创建复制用户**：
```sql
-- 创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'password';

-- 授予复制权限
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看主库状态
SHOW MASTER STATUS;
-- 记录 File 和 Position
```

**从库配置**：
```ini
# my.cnf
[mysqld]
# 服务器 ID（唯一，不同于主库）
server-id = 2

# 只读模式（防止写入）
read-only = 1

# Relay Log
relay-log = /data/mysql/relay/mysql-relay

# 从库信息持久化（MySQL 8.0+）
master-info-repository = TABLE
relay-log-info-repository = TABLE
```

**启动复制**：
```sql
-- 配置主库信息
CHANGE MASTER TO
    MASTER_HOST = '192.168.1.100',
    MASTER_PORT = 3306,
    MASTER_USER = 'repl',
    MASTER_PASSWORD = 'password',
    MASTER_LOG_FILE = 'mysql-bin.000001',
    MASTER_LOG_POS = 154;

-- 启动复制
START SLAVE;

-- 查看从库状态
SHOW SLAVE STATUS\G

-- 关键字段：
-- Slave_IO_Running: Yes
-- Slave_SQL_Running: Yes
-- Seconds_Behind_Master: 0
```

### 3. 复制模式

**异步复制（默认）**：
```
主库：
1. 执行事务
2. 写入 Binlog
3. 返回客户端（不等待从库）

特点：
- 性能最好
- 可能丢失数据（主库故障时）
- 主从延迟
```

**半同步复制**：
```sql
-- 安装插件（主库）
INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';

-- 启用半同步
SET GLOBAL rpl_semi_sync_master_enabled = 1;

-- 超时时间（毫秒）
SET GLOBAL rpl_semi_sync_master_timeout = 1000;

-- 从库
INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';
SET GLOBAL rpl_semi_sync_slave_enabled = 1;

流程：
1. 主库执行事务
2. 写入 Binlog
3. 至少一个从库确认接收
4. 返回客户端

特点：
- 数据更安全
- 性能略降
- 超时降级为异步
```

**组复制（Group Replication）**：
```
MySQL 8.0+ 原生支持

特点：
- 多主模式
- 自动故障转移
- 强一致性
- 适合高可用场景
```

---

## 读写分离架构

### 1. 架构模式

**单主多从**：
```
        ┌─────────┐
        │  应用   │
        └────┬────┘
             │
        ┌────┴────┐
        │ 中间件  │
        └─┬─┬─┬─┬─┘
          │ │ │ │
    ┌─────┘ │ │ └─────┐
    │       │ │       │
┌───┴──┐ ┌──┴─┴──┐ ┌──┴───┐
│ 主库 │ │ 从库1 │ │ 从库2│
└──────┘ └───────┘ └──────┘
  (写)      (读)     (读)
```

**双主架构**：
```
┌─────────┐     ┌─────────┐
│  主库1  │ ←→  │  主库2  │
└────┬────┘     └────┬────┘
     │               │
  ┌──┴──┐         ┌──┴──┐
  │从库1│         │从库2│
  └─────┘         └─────┘

特点：
- 互为主从
- 高可用
- 需要解决写冲突
```

### 2. 读写分离中间件

**ProxySQL**：
```sql
-- 安装 ProxySQL
yum install proxysql

-- 配置文件 /etc/proxysql.cnf
datadir="/var/lib/proxysql"

admin_variables=
{
    admin_credentials="admin:admin"
    mysql_ifaces="0.0.0.0:6032"
}

mysql_variables=
{
    threads=4
    max_connections=2048
    default_query_delay=0
    default_query_timeout=36000000
    interfaces="0.0.0.0:6033"
}

-- 配置后端服务器
INSERT INTO mysql_servers(hostgroup_id, hostname, port) VALUES (1, '192.168.1.100', 3306);  -- 写组
INSERT INTO mysql_servers(hostgroup_id, hostname, port) VALUES (2, '192.168.1.101', 3306);  -- 读组
INSERT INTO mysql_servers(hostgroup_id, hostname, port) VALUES (2, '192.168.1.102', 3306);  -- 读组

LOAD MYSQL SERVERS TO RUNTIME;
SAVE MYSQL SERVERS TO DISK;

-- 配置用户
INSERT INTO mysql_users(username, password, default_hostgroup) VALUES ('app', 'password', 1);
LOAD MYSQL USERS TO RUNTIME;
SAVE MYSQL USERS TO DISK;

-- 配置查询规则
INSERT INTO mysql_query_rules(rule_id, active, match_pattern, destination_hostgroup, apply)
VALUES (1, 1, '^SELECT.*FOR UPDATE$', 1, 1);  -- 写库

INSERT INTO mysql_query_rules(rule_id, active, match_pattern, destination_hostgroup, apply)
VALUES (2, 1, '^SELECT', 2, 1);  -- 读库

LOAD MYSQL QUERY RULES TO RUNTIME;
SAVE MYSQL QUERY RULES TO DISK;

-- 应用连接 ProxySQL
mysql -h 127.0.0.1 -P 6033 -u app -p
```

**MaxScale**：
```
MariaDB 提供的数据库代理

配置文件 /etc/maxscale.cnf:
[maxscale]
threads=auto

[server1]
type=server
address=192.168.1.100
port=3306
protocol=MySQLBackend

[server2]
type=server
address=192.168.1.101
port=3306
protocol=MySQLBackend

[Read-Write-Service]
type=service
router=readwritesplit
servers=server1,server2
user=maxscale
password=password

[Read-Write-Listener]
type=listener
service=Read-Write-Service
protocol=MySQLClient
port=4006
```

**MyCat**：
```xml
<!-- schema.xml -->
<?xml version="1.0"?>
<!DOCTYPE mycat:schema SYSTEM "schema.dtd">
<mycat:schema xmlns:mycat="http://io.mycat/">
    <schema name="TESTDB" checkSQLschema="false" sqlMaxLimit="100" dataNode="dn1">
    </schema>
    
    <dataNode name="dn1" dataHost="localhost1" database="testdb" />
    
    <dataHost name="localhost1" maxCon="1000" minCon="10" balance="1"
              writeType="0" dbType="mysql" dbDriver="native" switchType="1">
        <heartbeat>select user()</heartbeat>
        <!-- 写主机 -->
        <writeHost host="hostM1" url="192.168.1.100:3306" user="root" password="password">
            <!-- 读主机 -->
            <readHost host="hostS1" url="192.168.1.101:3306" user="root" password="password" />
            <readHost host="hostS2" url="192.168.1.102:3306" user="root" password="password" />
        </writeHost>
    </dataHost>
</mycat:schema>
```

### 3. 应用层读写分离

**Spring Boot 示例**：
```java
// 数据源配置
@Configuration
public class DataSourceConfig {
    
    @Bean
    @ConfigurationProperties("spring.datasource.master")
    public DataSource masterDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @ConfigurationProperties("spring.datasource.slave")
    public DataSource slaveDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    public DataSource routingDataSource() {
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("master", masterDataSource());
        targetDataSources.put("slave", slaveDataSource());
        
        DynamicRoutingDataSource dataSource = new DynamicRoutingDataSource();
        dataSource.setTargetDataSources(targetDataSources);
        dataSource.setDefaultTargetDataSource(masterDataSource());
        return dataSource;
    }
}

// 动态数据源
public class DynamicRoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return DataSourceContextHolder.getDataSourceType();
    }
}

// 上下文持有者
public class DataSourceContextHolder {
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();
    
    public static void setDataSourceType(String dataSourceType) {
        contextHolder.set(dataSourceType);
    }
    
    public static String getDataSourceType() {
        return contextHolder.get();
    }
    
    public static void clearDataSourceType() {
        contextHolder.remove();
    }
}

// 注解
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ReadOnly {
}

// AOP 拦截
@Aspect
@Component
public class DataSourceAspect {
    
    @Before("@annotation(readOnly)")
    public void setReadDataSource(ReadOnly readOnly) {
        DataSourceContextHolder.setDataSourceType("slave");
    }
    
    @After("@annotation(readOnly)")
    public void clearDataSource(ReadOnly readOnly) {
        DataSourceContextHolder.clearDataSourceType();
    }
}

// 使用
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    // 写操作（默认走主库）
    public void createUser(User user) {
        userMapper.insert(user);
    }
    
    // 读操作（走从库）
    @ReadOnly
    public User getUser(Long id) {
        return userMapper.selectById(id);
    }
}
```

---

## 负载均衡策略

### 1. 轮询（Round Robin）

**原理**：
```
请求依次分配到各个从库

示例：
请求1 -> 从库1
请求2 -> 从库2
请求3 -> 从库3
请求4 -> 从库1
...

优点：
- 简单
- 均衡

缺点：
- 不考虑服务器性能差异
- 不考虑服务器负载
```

### 2. 加权轮询

**原理**：
```
根据服务器性能分配权重

示例：
从库1：权重 3
从库2：权重 2
从库3：权重 1

分配：
从库1, 从库1, 从库1, 从库2, 从库2, 从库3
```

### 3. 最少连接

**原理**：
```
选择当前连接数最少的服务器

优点：
- 动态均衡
- 考虑实时负载

缺点：
- 实现复杂
- 需要维护连接数
```

### 4. 一致性哈希

**原理**：
```
根据请求 Key 计算哈希值，路由到固定服务器

示例：
hash(user_id) % server_count

优点：
- 相同 Key 路由到相同服务器
- 有利于缓存

缺点：
- 可能不均衡
```

---

## 主从延迟问题

### 1. 延迟原因

**产生原因**：
```
1. 网络延迟
   - 主从之间网络不稳定
   - 跨机房复制

2. 从库性能不足
   - CPU、I/O 瓶颈
   - 硬件配置低于主库

3. 主库写入过快
   - 高并发写入
   - 大事务

4. 从库单线程回放
   - SQL Thread 单线程
   - 无法并行回放（MySQL 5.6 之前）

5. 锁冲突
   - 从库有长查询
   - 阻塞 SQL Thread
```

### 2. 监控延迟

**查看延迟**：
```sql
-- 从库执行
SHOW SLAVE STATUS\G

-- 关键字段：
-- Seconds_Behind_Master：延迟秒数（NULL 表示复制停止）

-- 告警阈值：
-- < 1秒：正常
-- 1-10秒：轻微延迟
-- > 10秒：严重延迟
```

**监控脚本**：
```python
import mysql.connector
import time

def check_replication_lag():
    conn = mysql.connector.connect(
        host='slave_host',
        user='monitor',
        password='password'
    )
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SHOW SLAVE STATUS")
    status = cursor.fetchone()
    
    if status:
        lag = status['Seconds_Behind_Master']
        io_running = status['Slave_IO_Running']
        sql_running = status['Slave_SQL_Running']
        
        if io_running != 'Yes' or sql_running != 'Yes':
            print("ERROR: Replication stopped")
            send_alert("Replication stopped")
        elif lag is None:
            print("ERROR: Lag is NULL")
        elif lag > 60:
            print(f"WARNING: Lag is {lag} seconds")
            send_alert(f"Replication lag: {lag}s")
        else:
            print(f"OK: Lag is {lag} seconds")
    
    cursor.close()
    conn.close()

# 每分钟检查一次
while True:
    check_replication_lag()
    time.sleep(60)
```

### 3. 减少延迟

**并行复制**：
```sql
-- MySQL 5.6+
-- 基于库并行
SET GLOBAL slave_parallel_type = 'DATABASE';
SET GLOBAL slave_parallel_workers = 4;

-- MySQL 5.7+
-- 基于逻辑时钟并行（推荐）
SET GLOBAL slave_parallel_type = 'LOGICAL_CLOCK';
SET GLOBAL slave_parallel_workers = 8;

-- MySQL 8.0+
-- 基于 WRITESET 并行
SET GLOBAL binlog_transaction_dependency_tracking = 'WRITESET';
SET GLOBAL slave_parallel_workers = 8;

-- 重启复制
STOP SLAVE;
START SLAVE;
```

**优化配置**：
```ini
# 从库 my.cnf
[mysqld]
# 并行复制
slave_parallel_type = LOGICAL_CLOCK
slave_parallel_workers = 8

# 从库信息持久化
master_info_repository = TABLE
relay_log_info_repository = TABLE

# Relay Log
relay_log = mysql-relay
relay_log_recovery = 1

# 从库 Binlog（如果不需要，可以关闭）
skip-log-bin
```

**从库优化**：
```
1. 升级硬件
   - 使用与主库相同或更好的硬件
   - SSD 存储

2. 减少从库负载
   - 只读查询走从库
   - 减少慢查询

3. 避免大事务
   - 拆分大事务
   - 批量操作分批执行

4. 优化网络
   - 同机房部署
   - 使用专用网络
```

### 4. 应对延迟

**强制读主库**：
```java
// 写后读，强制读主库
public class UserService {
    
    public void updateUser(User user) {
        // 写操作
        userMapper.update(user);
        
        // 标记强制读主库
        DataSourceContextHolder.setDataSourceType("master");
    }
    
    public User getUser(Long id) {
        String dataSource = DataSourceContextHolder.getDataSourceType();
        if ("master".equals(dataSource)) {
            // 读主库
            return userMapper.selectById(id);
        } else {
            // 读从库
            return userMapper.selectById(id);
        }
    }
}
```

**延迟容忍**：
```
对于不需要实时一致性的场景：
- 允许短时间延迟
- 异步通知
- 最终一致性

示例：
- 统计数据（可以有延迟）
- 历史订单查询
- 用户列表展示
```

---

## 高可用方案

### 1. 主从切换

**手动切换**：
```sql
-- 1. 停止从库复制
STOP SLAVE;

-- 2. 确保从库数据完整
SHOW SLAVE STATUS\G
-- 检查 Relay_Log_File 和 Relay_Log_Pos

-- 3. 提升从库为主库
SET GLOBAL read_only = 0;

-- 4. 更新应用配置，指向新主库

-- 5. 配置其他从库指向新主库
CHANGE MASTER TO
    MASTER_HOST = 'new_master_ip',
    MASTER_LOG_FILE = 'mysql-bin.000010',
    MASTER_LOG_POS = 12345;

START SLAVE;
```

**自动故障转移（MHA）**：
```bash
# 安装 MHA
yum install mha4mysql-node mha4mysql-manager

# 配置文件 /etc/mha/app1.cnf
[server default]
manager_log=/var/log/mha/app1/manager.log
manager_workdir=/var/log/mha/app1
master_binlog_dir=/data/mysql/binlog
user=mha
password=password
ping_interval=3
repl_user=repl
repl_password=password
ssh_user=root

[server1]
hostname=192.168.1.100
port=3306
candidate_master=1

[server2]
hostname=192.168.1.101
port=3306
candidate_master=1

[server3]
hostname=192.168.1.102
port=3306
no_master=1

# 检查配置
masterha_check_ssh --conf=/etc/mha/app1.cnf
masterha_check_repl --conf=/etc/mha/app1.cnf

# 启动 MHA Manager
nohup masterha_manager --conf=/etc/mha/app1.cnf &

# 主库故障时，MHA 自动：
# 1. 检测主库故障
# 2. 选择最优从库
# 3. 提升为新主库
# 4. 配置其他从库
# 5. 发送通知
```

---

## 最佳实践

### 1. 架构设计

```
□ 一主多从（读多写少）
□ 双主互备（高可用）
□ 使用中间件（ProxySQL、MyCat）
□ 应用层分离（灵活控制）
□ 合理的负载均衡策略
```

### 2. 性能优化

```
□ 从库硬件与主库相当
□ 启用并行复制
□ 优化网络（同机房）
□ 减少大事务
□ 监控主从延迟
```

### 3. 高可用

```
□ 主从监控
□ 自动故障转移（MHA）
□ 定期演练切换
□ 备份策略
□ 快速恢复方案
```

### 4. 应用层

```
□ 区分读写操作
□ 写后读走主库
□ 容忍短时延迟
□ 重试机制
□ 降级方案
```

---

## 参考资料

1. **MySQL 复制**：
   - 官方文档：https://dev.mysql.com/doc/refman/8.0/en/replication.html
   - 组复制：https://dev.mysql.com/doc/refman/8.0/en/group-replication.html

2. **中间件**：
   - ProxySQL：https://proxysql.com/
   - MaxScale：https://mariadb.com/kb/en/maxscale/
   - MyCat：http://www.mycat.org.cn/

3. **高可用工具**：
   - MHA：https://github.com/yoshinorim/mha4mysql-manager

4. **最佳实践**：
   - 合理架构设计
   - 选择合适中间件
   - 监控主从延迟
   - 优化并行复制
   - 自动故障转移
   - 定期演练
