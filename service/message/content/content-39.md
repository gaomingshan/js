# RabbitMQ 命令行工具

## 概述

RabbitMQ提供rabbitmqctl和rabbitmq-plugins等命令行工具用于集群管理和运维。本章系统介绍RabbitMQ命令行工具的使用方法。

---

## 1. rabbitmqctl：节点管理

### 1.1 启动和停止

```bash
# 启动应用
rabbitmqctl start_app

# 停止应用（保留Erlang节点）
rabbitmqctl stop_app

# 停止节点
rabbitmqctl stop

# 重置节点（清空所有数据）
rabbitmqctl reset

# 强制重置
rabbitmqctl force_reset
```

### 1.2 查看状态

```bash
# 查看节点状态
rabbitmqctl status

# 查看环境信息
rabbitmqctl environment

# 查看报告
rabbitmqctl report
```

---

## 2. rabbitmqctl list_*：资源查询

### 2.1 队列管理

```bash
# 列出所有队列
rabbitmqctl list_queues

# 列出详细信息
rabbitmqctl list_queues name messages consumers memory

# 列出特定vhost的队列
rabbitmqctl list_queues -p /my-vhost

# 常用字段：
# - name: 队列名称
# - messages: 总消息数
# - messages_ready: 就绪消息数
# - messages_unacknowledged: 未确认消息数
# - consumers: 消费者数
# - memory: 内存占用
```

### 2.2 Exchange管理

```bash
# 列出所有Exchange
rabbitmqctl list_exchanges

# 列出详细信息
rabbitmqctl list_exchanges name type durable auto_delete

# 字段说明：
# - name: Exchange名称
# - type: 类型（direct/fanout/topic/headers）
# - durable: 是否持久化
# - auto_delete: 是否自动删除
```

### 2.3 绑定管理

```bash
# 列出所有绑定
rabbitmqctl list_bindings

# 列出详细信息
rabbitmqctl list_bindings source_name source_kind destination_name destination_kind routing_key
```

---

## 3. rabbitmqctl add_user/set_permissions：权限管理

### 3.1 用户管理

```bash
# 添加用户
rabbitmqctl add_user admin admin123

# 删除用户
rabbitmqctl delete_user guest

# 修改密码
rabbitmqctl change_password admin newpassword

# 列出所有用户
rabbitmqctl list_users

# 设置用户标签（角色）
rabbitmqctl set_user_tags admin administrator

# 角色：
# - administrator: 管理员
# - monitoring: 监控
# - policymaker: 策略制定者
# - management: 管理
```

### 3.2 权限管理

```bash
# 设置权限
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
# 格式：set_permissions [-p vhost] user configure write read

# 列出权限
rabbitmqctl list_permissions -p /

# 列出用户权限
rabbitmqctl list_user_permissions admin

# 清除权限
rabbitmqctl clear_permissions -p / admin
```

---

## 4. rabbitmqctl set_policy：策略管理

### 4.1 设置策略

```bash
# 设置HA策略（镜像队列）
rabbitmqctl set_policy ha-all \
  "^ha\." \
  '{"ha-mode":"all","ha-sync-mode":"automatic"}' \
  --priority 1 \
  --apply-to queues

# 设置TTL策略
rabbitmqctl set_policy ttl-policy \
  "^ttl\." \
  '{"message-ttl":86400000}' \
  --apply-to queues

# 设置最大长度策略
rabbitmqctl set_policy max-length-policy \
  "^limited\." \
  '{"max-length":10000}' \
  --apply-to queues
```

### 4.2 查看和删除策略

```bash
# 列出所有策略
rabbitmqctl list_policies

# 列出特定vhost的策略
rabbitmqctl list_policies -p /

# 删除策略
rabbitmqctl clear_policy ha-all
```

---

## 5. rabbitmq-diagnostics：诊断工具

### 5.1 健康检查

```bash
# 节点健康检查
rabbitmq-diagnostics node_health_check

# 检查是否运行
rabbitmq-diagnostics ping

# 检查监听端口
rabbitmq-diagnostics listeners

# 检查Erlang cookie
rabbitmq-diagnostics erlang_cookie_hash
```

### 5.2 内存检查

```bash
# 内存使用情况
rabbitmq-diagnostics memory_breakdown

# 磁盘使用情况
rabbitmq-diagnostics disk_usage
```

### 5.3 网络诊断

```bash
# 检查端口监听
rabbitmq-diagnostics check_port_listener 5672

# 检查协议监听
rabbitmq-diagnostics check_protocol_listener amqp
```

---

## 6. rabbitmq-plugins：插件管理

### 6.1 启用插件

```bash
# 启用管理插件
rabbitmq-plugins enable rabbitmq_management

# 启用多个插件
rabbitmq-plugins enable rabbitmq_management rabbitmq_prometheus

# 常用插件：
# - rabbitmq_management: Web管理界面
# - rabbitmq_management_agent: 管理代理
# - rabbitmq_prometheus: Prometheus监控
# - rabbitmq_shovel: 消息转发
# - rabbitmq_federation: 联邦
# - rabbitmq_tracing: 消息追踪
```

### 6.2 禁用插件

```bash
# 禁用插件
rabbitmq-plugins disable rabbitmq_tracing

# 列出所有插件
rabbitmq-plugins list
```

---

## 7. rabbitmqadmin：HTTP API管理工具

### 7.1 安装

```bash
# 下载rabbitmqadmin
wget http://localhost:15672/cli/rabbitmqadmin
chmod +x rabbitmqadmin

# 或使用pip安装
pip install rabbitmqadmin
```

### 7.2 队列操作

```bash
# 列出队列
rabbitmqadmin list queues

# 创建队列
rabbitmqadmin declare queue name=my-queue durable=true

# 删除队列
rabbitmqadmin delete queue name=my-queue

# 发布消息
rabbitmqadmin publish routing_key=my-queue payload="Hello"

# 获取消息
rabbitmqadmin get queue=my-queue ackmode=ack_requeue_false
```

### 7.3 导入导出

```bash
# 导出所有定义（队列、Exchange、绑定等）
rabbitmqadmin export backup.json

# 导入定义
rabbitmqadmin import backup.json
```

---

## 8. 集群管理

### 8.1 集群状态

```bash
# 查看集群状态
rabbitmqctl cluster_status

# 输出示例：
# Cluster status of node rabbit@node1
# Nodes: [rabbit@node1, rabbit@node2, rabbit@node3]
# Running nodes: [rabbit@node1, rabbit@node2, rabbit@node3]
```

### 8.2 加入集群

```bash
# 节点2加入集群
rabbitmqctl stop_app
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app
```

### 8.3 移除节点

```bash
# 从集群中移除节点
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl start_app

# 强制移除离线节点
rabbitmqctl forget_cluster_node rabbit@node2
```

---

## 9. 运维脚本

### 9.1 健康检查脚本

```bash
#!/bin/bash
# health-check.sh

# 检查节点状态
if rabbitmqctl node_health_check > /dev/null 2>&1; then
  echo "Node OK"
else
  echo "Node ERROR"
  exit 1
fi

# 检查队列堆积
THRESHOLD=10000
rabbitmqctl list_queues name messages | \
  awk -v th=$THRESHOLD '$2>th {print "Queue "$1" has "$2" messages"}'
```

### 9.2 自动备份脚本

```bash
#!/bin/bash
# backup-definitions.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/rabbitmq"

# 导出定义
rabbitmqadmin export "$BACKUP_DIR/definitions-$DATE.json"

# 压缩
gzip "$BACKUP_DIR/definitions-$DATE.json"

# 删除7天前的备份
find $BACKUP_DIR -name "definitions-*.json.gz" -mtime +7 -delete
```

---

## 关键要点

1. **rabbitmqctl**：节点管理、资源查询、权限管理
2. **rabbitmq-plugins**：插件启用和禁用
3. **rabbitmqadmin**：HTTP API管理工具
4. **策略管理**：镜像队列、TTL、最大长度
5. **运维脚本**：健康检查和自动备份

---

## 深入一点

**队列监控关键指标**：

```bash
rabbitmqctl list_queues name messages consumers memory

关键字段：
- messages: 总消息数（Ready + Unacked）
- messages_ready: 等待消费的消息数
- messages_unacknowledged: 未确认的消息数
- consumers: 消费者数量
- memory: 内存占用（字节）

告警规则：
- messages > 100000: 消息堆积
- consumers = 0 && messages > 0: 无消费者
- memory > 100MB: 内存占用过高
```

**镜像队列策略**：

```bash
# 所有节点镜像
rabbitmqctl set_policy ha-all "^ha\." '{"ha-mode":"all"}'

# 指定节点数镜像
rabbitmqctl set_policy ha-two "^two\." '{"ha-mode":"exactly","ha-params":2}'

# 指定节点名称镜像
rabbitmqctl set_policy ha-nodes "^nodes\." \
  '{"ha-mode":"nodes","ha-params":["rabbit@node1","rabbit@node2"]}'

同步模式：
- automatic: 自动同步（推荐）
- manual: 手动同步
```

---

## 参考资料

1. [RabbitMQ CLI Tools](https://www.rabbitmq.com/cli.html)
2. [rabbitmqctl Man Page](https://www.rabbitmq.com/rabbitmqctl.8.html)
3. [rabbitmqadmin](https://www.rabbitmq.com/management-cli.html)
