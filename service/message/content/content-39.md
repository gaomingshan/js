# RabbitMQ 命令行工具

## 概述

rabbitmqctl 和 rabbitmq-plugins 是 RabbitMQ 主要管理工具。本章介绍常用命令。

---

## 1. 队列管理

```bash
# 查看队列列表
rabbitmqctl list_queues

# 查看队列详情
rabbitmqctl list_queues name messages consumers

# 清空队列
rabbitmqctl purge_queue my-queue

# 删除队列
rabbitmqctl delete_queue my-queue
```

---

## 2. 用户管理

```bash
# 添加用户
rabbitmqctl add_user admin admin123

# 设置用户标签
rabbitmqctl set_user_tags admin administrator

# 设置权限
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# 查看用户列表
rabbitmqctl list_users

# 删除用户
rabbitmqctl delete_user guest
```

---

## 3. 虚拟主机管理

```bash
# 添加虚拟主机
rabbitmqctl add_vhost /dev

# 查看虚拟主机
rabbitmqctl list_vhosts

# 删除虚拟主机
rabbitmqctl delete_vhost /dev
```

---

## 4. 连接管理

```bash
# 查看连接
rabbitmqctl list_connections

# 关闭连接
rabbitmqctl close_connection "<connection_name>" "Closed by admin"

# 查看通道
rabbitmqctl list_channels
```

---

## 5. 集群管理

```bash
# 查看集群状态
rabbitmqctl cluster_status

# 加入集群
rabbitmqctl stop_app
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app

# 移除节点
rabbitmqctl forget_cluster_node rabbit@node2
```

---

## 6. 插件管理

```bash
# 启用管理插件
rabbitmq-plugins enable rabbitmq_management

# 查看插件列表
rabbitmq-plugins list

# 禁用插件
rabbitmq-plugins disable rabbitmq_tracing
```

---

## 7. 策略管理

```bash
# 设置镜像队列策略
rabbitmqctl set_policy ha-all "^ha\." '{"ha-mode":"all"}' --priority 1 --apply-to queues

# 查看策略
rabbitmqctl list_policies

# 删除策略
rabbitmqctl clear_policy ha-all
```

---

## 关键要点

1. **rabbitmqctl**：核心管理工具
2. **用户权限**：configure、write、read
3. **虚拟主机**：资源隔离
4. **插件管理**：management、tracing
5. **策略配置**：镜像队列、TTL

---

## 参考资料

1. [RabbitMQ CLI Tools](https://www.rabbitmq.com/cli.html)
