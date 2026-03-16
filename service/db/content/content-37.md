# 分布式事务

## 概述

分布式事务是指跨越多个数据库、多个服务或多个网络节点的事务。在微服务架构和分布式系统中，保证分布式事务的一致性是一个重要挑战。本章介绍常见的分布式事务解决方案。

**核心问题**：
- **CAP 定理**：一致性、可用性、分区容错性不可兼得
- **BASE 理论**：基本可用、软状态、最终一致性
- **两阶段提交（2PC）**：强一致性方案
- **TCC**：Try-Confirm-Cancel 补偿模式
- **Saga**：长事务补偿模式
- **最终一致性**：消息队列方案

---

## CAP 定理

### 1. CAP 三要素

**Consistency（一致性）**：
```
所有节点在同一时间看到相同的数据
所有读操作都能读到最新写入的数据
```

**Availability（可用性）**：
```
每个请求都能得到响应（成功或失败）
系统持续提供服务
无无限等待
```

**Partition Tolerance（分区容错性）**：
```
系统在网络分区时仍能继续运行
部分节点故障不影响整体系统
```

### 2. CAP 权衡

**CP：一致性 + 分区容错性**：
```
示例：
- HBase
- Redis Cluster（强一致性模式）
- ZooKeeper

特点：
- 牺牲可用性
- 网络分区时，部分节点不可用
- 保证数据一致性

适用场景：
- 金融系统
- 库存系统
- 强一致性要求的业务
```

**AP：可用性 + 分区容错性**：
```
示例：
- Cassandra
- DynamoDB
- CouchDB

特点：
- 牺牲一致性（最终一致性）
- 网络分区时，仍可读写
- 数据可能不一致

适用场景：
- 社交网络
- 内容分发
- 日志收集
```

**CA：一致性 + 可用性**：
```
示例：
- 单机数据库
- 传统 RDBMS

特点：
- 无法容忍网络分区
- 分布式系统中不存在真正的 CA

实际：
- 分布式系统必须支持 P
- 只能在 C 和 A 之间权衡
```

---

## BASE 理论

### 1. 概念

**Basically Available（基本可用）**：
```
系统在出现故障时，允许损失部分可用性
例如：
- 响应时间增加
- 功能降级
- 但核心功能仍可用
```

**Soft State（软状态）**：
```
允许系统中的数据存在中间状态
数据在不同节点间存在延迟
```

**Eventually Consistent（最终一致性）**：
```
系统不保证实时一致性
但保证最终所有节点数据一致
```

### 2. 最终一致性

**示例**：
```
场景：电商下单

1. 用户下单（订单服务）
   - 创建订单：status = pending

2. 扣减库存（库存服务）
   - 异步扣减库存
   - 可能暂时不一致

3. 扣减余额（账户服务）
   - 异步扣减余额

4. 最终一致
   - 所有服务处理完成
   - 订单、库存、余额都正确
   - 达到一致性状态
```

---

## 两阶段提交（2PC）

### 1. 原理

**角色**：
```
协调者（Coordinator）：
- 发起事务
- 协调参与者
- 决定提交或回滚

参与者（Participant）：
- 执行本地事务
- 响应协调者
- 根据协调者决策提交或回滚
```

**两个阶段**：
```
阶段1：准备阶段（Prepare）
1. 协调者向所有参与者发送 Prepare 请求
2. 参与者执行事务操作，但不提交
3. 参与者将 Undo/Redo 日志写入磁盘
4. 参与者响应 Yes（可以提交）或 No（回滚）

阶段2：提交阶段（Commit）
- 如果所有参与者都返回 Yes：
  1. 协调者发送 Commit 请求
  2. 参与者提交事务
  3. 参与者响应 ACK
  4. 协调者完成事务

- 如果任何参与者返回 No：
  1. 协调者发送 Rollback 请求
  2. 参与者回滚事务
  3. 参与者响应 ACK
  4. 协调者完成事务
```

### 2. 示例

**场景：跨库转账**：
```
数据库A（账户1）、数据库B（账户2）

阶段1：Prepare
协调者 -> 数据库A：Prepare（扣款100）
数据库A：执行 UPDATE accounts SET balance = balance - 100 WHERE id = 1
数据库A：写 Undo Log
数据库A -> 协调者：Yes

协调者 -> 数据库B：Prepare（加款100）
数据库B：执行 UPDATE accounts SET balance = balance + 100 WHERE id = 2
数据库B：写 Undo Log
数据库B -> 协调者：Yes

阶段2：Commit
协调者 -> 数据库A：Commit
数据库A：提交事务
数据库A -> 协调者：ACK

协调者 -> 数据库B：Commit
数据库B：提交事务
数据库B -> 协调者：ACK

协调者：事务完成
```

### 3. MySQL XA 事务

**示例**：
```sql
-- 参与者1（数据库A）
XA START 'trx1';
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
XA END 'trx1';
XA PREPARE 'trx1';
-- 等待协调者决策
XA COMMIT 'trx1';  -- 或 XA ROLLBACK 'trx1'

-- 参与者2（数据库B）
XA START 'trx1';
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
XA END 'trx1';
XA PREPARE 'trx1';
-- 等待协调者决策
XA COMMIT 'trx1';  -- 或 XA ROLLBACK 'trx1'
```

**查看 XA 事务**：
```sql
-- 查看 PREPARED 状态的 XA 事务
XA RECOVER;

-- 手动提交或回滚
XA COMMIT 'trx1';
XA ROLLBACK 'trx1';
```

### 4. 2PC 的问题

**同步阻塞**：
```
Prepare 阶段，参与者锁定资源
等待协调者决策
降低系统并发度
```

**单点故障**：
```
协调者故障：
- 参与者长时间阻塞
- 无法决定提交还是回滚

解决：
- 协调者备份
- 超时机制
```

**数据不一致**：
```
Commit 阶段，协调者发送 Commit 后崩溃
部分参与者收到 Commit，部分未收到
导致数据不一致

解决：
- 三阶段提交（3PC）
```

---

## 三阶段提交（3PC）

### 1. 原理

**三个阶段**：
```
阶段1：CanCommit
1. 协调者询问参与者是否可以提交
2. 参与者响应 Yes 或 No
3. 不执行事务，不锁定资源

阶段2：PreCommit
- 如果都返回 Yes：
  1. 协调者发送 PreCommit 请求
  2. 参与者执行事务，锁定资源
  3. 参与者响应 ACK

- 如果有 No 或超时：
  1. 协调者发送 Abort
  2. 中断事务

阶段3：DoCommit
- 如果 PreCommit 成功：
  1. 协调者发送 DoCommit
  2. 参与者提交事务
  3. 参与者响应 ACK

- 如果超时或失败：
  1. 参与者自动提交（或回滚）
```

### 2. 3PC vs 2PC

**改进**：
```
1. 增加 CanCommit 阶段
   - 降低阻塞时间
   - 提前发现问题

2. 超时自动提交
   - 减少阻塞
   - 降低单点故障影响

3. 引入超时机制
   - 参与者不会无限期等待
```

**问题**：
```
仍然无法完全避免数据不一致
网络分区时可能出现问题
实际应用较少
```

---

## TCC（Try-Confirm-Cancel）

### 1. 原理

**三个阶段**：
```
Try：
- 预留资源
- 检查业务规则
- 不提交

Confirm：
- 确认提交
- 使用预留的资源

Cancel：
- 取消操作
- 释放预留的资源
```

### 2. 示例

**场景：电商下单**：
```python
# Try 阶段
def try_place_order(order_id, user_id, product_id, quantity, amount):
    # 1. 冻结库存
    reserve_stock(product_id, quantity, order_id)
    
    # 2. 冻结余额
    freeze_balance(user_id, amount, order_id)
    
    # 3. 创建订单（预留状态）
    create_order(order_id, status='RESERVED')
    
    return True

# Confirm 阶段
def confirm_place_order(order_id):
    # 1. 扣减库存
    deduct_stock(order_id)
    
    # 2. 扣减余额
    deduct_balance(order_id)
    
    # 3. 确认订单
    update_order_status(order_id, 'CONFIRMED')
    
    return True

# Cancel 阶段
def cancel_place_order(order_id):
    # 1. 释放库存
    release_stock(order_id)
    
    # 2. 释放余额
    unfreeze_balance(order_id)
    
    # 3. 取消订单
    update_order_status(order_id, 'CANCELLED')
    
    return True
```

**数据库设计**：
```sql
-- 库存表
CREATE TABLE inventory (
    product_id BIGINT PRIMARY KEY,
    total_stock INT,
    available_stock INT,  -- 可用库存
    reserved_stock INT    -- 冻结库存
);

-- Try：冻结库存
UPDATE inventory
SET available_stock = available_stock - @quantity,
    reserved_stock = reserved_stock + @quantity
WHERE product_id = @product_id AND available_stock >= @quantity;

-- Confirm：扣减库存
UPDATE inventory
SET total_stock = total_stock - @quantity,
    reserved_stock = reserved_stock - @quantity
WHERE product_id = @product_id;

-- Cancel：释放库存
UPDATE inventory
SET available_stock = available_stock + @quantity,
    reserved_stock = reserved_stock - @quantity
WHERE product_id = @product_id;
```

### 3. TCC 优缺点

**优点**：
```
✓ 不长时间锁定资源
✓ 性能较好
✓ 业务灵活
✓ 可扩展性好
```

**缺点**：
```
✗ 需要实现 Try、Confirm、Cancel 三个接口
✗ 开发复杂度高
✗ 需要考虑幂等性
✗ 需要处理空回滚、悬挂等问题
```

---

## Saga 模式

### 1. 原理

**长事务分解**：
```
将长事务分解为多个本地短事务
每个本地事务有对应的补偿事务
如果某个事务失败，执行补偿事务回滚
```

**两种实现**：
```
协同式（Choreography）：
- 各服务监听事件
- 自主决定下一步操作

编排式（Orchestration）：
- 中央协调器
- 控制事务流程
```

### 2. 协同式 Saga

**示例：电商下单**：
```
服务流程：

1. 订单服务：
   - 创建订单
   - 发布事件：OrderCreated

2. 库存服务：
   - 监听 OrderCreated
   - 扣减库存
   - 发布事件：StockReserved 或 StockReserveFailed

3. 支付服务：
   - 监听 StockReserved
   - 扣款
   - 发布事件：PaymentCompleted 或 PaymentFailed

4. 订单服务：
   - 监听 PaymentCompleted
   - 更新订单状态：Completed

补偿流程（如果支付失败）：

1. 支付服务：
   - 发布事件：PaymentFailed

2. 库存服务：
   - 监听 PaymentFailed
   - 释放库存

3. 订单服务：
   - 监听 PaymentFailed
   - 取消订单
```

**实现**：
```python
# 订单服务
def create_order(order_data):
    # 创建订单
    order = save_order(order_data, status='PENDING')
    
    # 发布事件
    publish_event('OrderCreated', {
        'order_id': order.id,
        'user_id': order.user_id,
        'product_id': order.product_id,
        'quantity': order.quantity,
        'amount': order.amount
    })

def on_payment_completed(event):
    # 更新订单状态
    update_order_status(event['order_id'], 'COMPLETED')

def on_payment_failed(event):
    # 取消订单
    update_order_status(event['order_id'], 'CANCELLED')

# 库存服务
def on_order_created(event):
    try:
        # 扣减库存
        deduct_stock(event['product_id'], event['quantity'])
        
        # 发布成功事件
        publish_event('StockReserved', event)
    except InsufficientStockError:
        # 发布失败事件
        publish_event('StockReserveFailed', event)

def on_payment_failed(event):
    # 补偿：释放库存
    release_stock(event['product_id'], event['quantity'])

# 支付服务
def on_stock_reserved(event):
    try:
        # 扣款
        deduct_balance(event['user_id'], event['amount'])
        
        # 发布成功事件
        publish_event('PaymentCompleted', event)
    except InsufficientBalanceError:
        # 发布失败事件
        publish_event('PaymentFailed', event)
```

### 3. 编排式 Saga

**中央协调器**：
```python
class OrderSagaOrchestrator:
    def execute(self, order_data):
        order_id = None
        
        try:
            # 步骤1：创建订单
            order_id = self.create_order(order_data)
            
            # 步骤2：扣减库存
            self.reserve_stock(order_data)
            
            # 步骤3：扣款
            self.process_payment(order_data)
            
            # 步骤4：完成订单
            self.complete_order(order_id)
            
            return {'success': True, 'order_id': order_id}
        
        except Exception as e:
            # 执行补偿
            self.compensate(order_id, e)
            return {'success': False, 'error': str(e)}
    
    def compensate(self, order_id, error):
        # 补偿：按相反顺序执行
        
        # 如果支付失败，释放库存
        if isinstance(error, PaymentError):
            self.release_stock(order_id)
        
        # 取消订单
        if order_id:
            self.cancel_order(order_id)
```

### 4. Saga 注意事项

**幂等性**：
```python
# 每个操作必须幂等
def deduct_stock(product_id, quantity, idempotency_key):
    # 检查是否已执行
    if is_already_executed(idempotency_key):
        return
    
    # 执行操作
    update_stock(product_id, quantity)
    
    # 记录已执行
    mark_executed(idempotency_key)
```

**补偿顺序**：
```
补偿事务必须按相反顺序执行
确保数据一致性
```

**空补偿**：
```
如果 Try 阶段失败，不需要补偿
需要记录状态，避免空补偿
```

---

## 本地消息表

### 1. 原理

**实现步骤**：
```
1. 本地事务中：
   - 执行业务操作
   - 插入消息到本地消息表
   - 一起提交

2. 定时任务：
   - 扫描未发送的消息
   - 发送到消息队列
   - 标记已发送

3. 消费者：
   - 消费消息
   - 执行业务操作
   - 确认消费
```

### 2. 示例

**消息表**：
```sql
CREATE TABLE local_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(64) UNIQUE,
    topic VARCHAR(50),
    payload TEXT,
    status VARCHAR(20),  -- PENDING, SENT, CONFIRMED
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**发送消息**：
```python
def create_order(order_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        conn.start_transaction()
        
        # 1. 创建订单
        cursor.execute("""
            INSERT INTO orders (user_id, product_id, amount, status)
            VALUES (%s, %s, %s, 'PENDING')
        """, (order_data['user_id'], order_data['product_id'], order_data['amount']))
        
        order_id = cursor.lastrowid
        
        # 2. 插入消息到本地消息表
        message = {
            'order_id': order_id,
            'user_id': order_data['user_id'],
            'product_id': order_data['product_id'],
            'quantity': order_data['quantity']
        }
        
        cursor.execute("""
            INSERT INTO local_messages (message_id, topic, payload, status)
            VALUES (%s, %s, %s, 'PENDING')
        """, (str(uuid.uuid4()), 'order_created', json.dumps(message), 'PENDING'))
        
        # 3. 提交本地事务
        conn.commit()
        
        return order_id
    
    except Exception as e:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()
```

**定时发送**：
```python
def send_pending_messages():
    """定时任务：发送未发送的消息"""
    messages = get_pending_messages()
    
    for msg in messages:
        try:
            # 发送到消息队列
            send_to_mq(msg['topic'], msg['payload'])
            
            # 标记已发送
            mark_message_sent(msg['id'])
        
        except Exception as e:
            # 重试次数 + 1
            increment_retry_count(msg['id'])
            
            # 超过最大重试次数，标记失败
            if msg['retry_count'] >= MAX_RETRIES:
                mark_message_failed(msg['id'])
```

---

## 分布式事务框架

### 1. Seata

**AT 模式（自动补偿）**：
```
1. 一阶段：
   - 执行业务 SQL
   - 自动生成 Undo Log
   - 提交本地事务

2. 二阶段：
   - 提交：删除 Undo Log
   - 回滚：使用 Undo Log 回滚
```

**TCC 模式**：
```
需要实现 Try、Confirm、Cancel 三个方法
```

**Saga 模式**：
```
状态机引擎
编排式 Saga
```

### 2. Apache ShardingSphere

**分布式事务支持**：
```
XA 事务：
- 强一致性
- 性能较差

BASE 事务：
- 最终一致性
- 性能较好
```

---

## 最佳实践

### 1. 选择方案

```
强一致性要求：
□ 2PC / XA 事务
□ TCC

弱一致性要求：
□ Saga
□ 本地消息表
□ 最终一致性

选择依据：
□ 业务一致性要求
□ 性能要求
□ 开发复杂度
□ 运维成本
```

### 2. 设计原则

```
□ 尽量避免分布式事务
□ 拆分大事务为小事务
□ 异步化非核心流程
□ 保证幂等性
□ 实现补偿机制
□ 监控和告警
```

### 3. 实现建议

```
□ 使用成熟的分布式事务框架
□ 实现重试机制
□ 记录详细日志
□ 定期对账
□ 提供人工介入手段
□ 测试各种异常场景
```

---

## 参考资料

1. **理论基础**：
   - CAP 定理：Eric Brewer
   - BASE 理论：eBay 架构师 Dan Pritchett

2. **论文**：
   - "Saga" (Hector Garcia-Molina, 1987)

3. **框架文档**：
   - Seata: https://seata.io/
   - Apache ShardingSphere: https://shardingsphere.apache.org/

4. **推荐书籍**：
   - 《分布式系统原理与范型》
   - 《微服务架构设计模式》

5. **最佳实践**：
   - 理解 CAP 和 BASE
   - 选择合适的分布式事务方案
   - 保证操作幂等性
   - 实现补偿机制
   - 监控和对账
   - 充分测试
