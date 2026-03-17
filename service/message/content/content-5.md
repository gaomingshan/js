# 单机快速部署

## 概述

单机部署是学习消息队列的第一步，可以快速搭建开发和测试环境。本章将详细介绍 Kafka、RocketMQ、RabbitMQ 的单机部署流程、基础配置、快速验证方法及常见问题排查，帮助你快速上手三大消息队列。

---

## 1. Kafka 单机部署

### 1.1 环境准备

**系统要求**：
- 操作系统：Linux / macOS / Windows
- JDK：8+ （推荐 JDK 11 或 JDK 17）
- 磁盘空间：至少 10GB
- 内存：至少 4GB

**检查 Java 环境**：
```bash
java -version
# 输出示例：
# openjdk version "11.0.12" 2021-07-20
```

### 1.2 下载与解压

```bash
# 下载 Kafka（包含 Zookeeper）
wget https://downloads.apache.org/kafka/3.6.0/kafka_2.13-3.6.0.tgz

# 解压
tar -xzf kafka_2.13-3.6.0.tgz
cd kafka_2.13-3.6.0

# 或使用镜像加速
wget https://mirrors.tuna.tsinghua.edu.cn/apache/kafka/3.6.0/kafka_2.13-3.6.0.tgz
```

### 1.3 启动方式一：Zookeeper 模式（传统）

**Step 1：启动 Zookeeper**
```bash
# 启动 Zookeeper（前台运行）
bin/zookeeper-server-start.sh config/zookeeper.properties

# 后台运行
bin/zookeeper-server-start.sh -daemon config/zookeeper.properties

# 检查 Zookeeper 是否启动
echo stat | nc localhost 2181
# 输出包含 Mode: standalone 表示成功
```

**Step 2：启动 Kafka Broker**
```bash
# 启动 Kafka Broker
bin/kafka-server-start.sh config/server.properties

# 后台运行
bin/kafka-server-start.sh -daemon config/server.properties

# 检查日志
tail -f logs/server.log
# 看到 "started (kafka.server.KafkaServer)" 表示成功
```

### 1.4 启动方式二：KRaft 模式（Kafka 2.8+，无 Zookeeper）

**Step 1：生成集群 ID**
```bash
KAFKA_CLUSTER_ID="$(bin/kafka-storage.sh random-uuid)"
echo $KAFKA_CLUSTER_ID
```

**Step 2：格式化存储目录**
```bash
bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c config/kraft/server.properties
```

**Step 3：启动 Kafka**
```bash
# 启动 Kafka（KRaft 模式）
bin/kafka-server-start.sh config/kraft/server.properties

# 后台运行
bin/kafka-server-start.sh -daemon config/kraft/server.properties
```

**KRaft 配置说明**（`config/kraft/server.properties`）：
```properties
# Broker ID
node.id=1

# Controller 角色（combined 表示既是 Broker 又是 Controller）
process.roles=broker,controller

# Controller 集群配置
controller.quorum.voters=1@localhost:9093

# 监听地址
listeners=PLAINTEXT://:9092,CONTROLLER://:9093

# 日志目录
log.dirs=/tmp/kafka-logs
```

### 1.5 基础配置

**核心配置**（`config/server.properties`）：
```properties
# Broker ID（集群内唯一）
broker.id=0

# 监听地址
listeners=PLAINTEXT://localhost:9092

# 日志目录
log.dirs=/var/kafka-logs

# Zookeeper 连接（Zookeeper 模式）
zookeeper.connect=localhost:2181

# 日志保留时间（小时）
log.retention.hours=168

# 日志段大小（1GB）
log.segment.bytes=1073741824

# 副本数（单机设为 1）
default.replication.factor=1

# 分区数
num.partitions=3
```

### 1.6 快速验证

**创建 Topic**：
```bash
bin/kafka-topics.sh --create \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

# 查看 Topic 列表
bin/kafka-topics.sh --list --bootstrap-server localhost:9092

# 查看 Topic 详情
bin/kafka-topics.sh --describe \
  --topic test-topic \
  --bootstrap-server localhost:9092
```

**生产消息**：
```bash
bin/kafka-console-producer.sh \
  --topic test-topic \
  --bootstrap-server localhost:9092

# 输入消息（每行一条）
> Hello Kafka
> Message 1
> Message 2
# Ctrl+C 退出
```

**消费消息**：
```bash
# 从最新位置消费
bin/kafka-console-consumer.sh \
  --topic test-topic \
  --bootstrap-server localhost:9092

# 从头开始消费
bin/kafka-console-consumer.sh \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --from-beginning

# 指定消费者组
bin/kafka-console-consumer.sh \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --group my-consumer-group
```

### 1.7 停止服务

```bash
# 停止 Kafka
bin/kafka-server-stop.sh

# 停止 Zookeeper（Zookeeper 模式）
bin/zookeeper-server-stop.sh

# 强制停止
ps aux | grep kafka
kill -9 <PID>
```

---

## 2. RocketMQ 单机部署

### 2.1 环境准备

**系统要求**：
- 操作系统：Linux / macOS / Windows
- JDK：8+（推荐 JDK 11）
- Maven：3.2+（源码编译需要）
- 磁盘空间：至少 10GB
- 内存：至少 4GB

### 2.2 下载与解压

```bash
# 下载 RocketMQ 二进制包
wget https://archive.apache.org/dist/rocketmq/5.1.4/rocketmq-all-5.1.4-bin-release.zip

# 解压
unzip rocketmq-all-5.1.4-bin-release.zip
cd rocketmq-5.1.4

# 或使用镜像
wget https://mirrors.tuna.tsinghua.edu.cn/apache/rocketmq/5.1.4/rocketmq-all-5.1.4-bin-release.zip
```

### 2.3 启动 NameServer

**修改 JVM 参数**（可选，适用于内存较小的机器）：
```bash
# 编辑 bin/runserver.sh
vi bin/runserver.sh

# 修改 JVM 参数（默认 4g 改为 512m）
JAVA_OPT="${JAVA_OPT} -server -Xms512m -Xmx512m -Xmn256m"
```

**启动 NameServer**：
```bash
# 启动 NameServer
nohup sh bin/mqnamesrv &

# 查看日志
tail -f ~/logs/rocketmqlogs/namesrv.log

# 看到 "The Name Server boot success" 表示成功
```

### 2.4 启动 Broker

**修改 JVM 参数**（可选）：
```bash
# 编辑 bin/runbroker.sh
vi bin/runbroker.sh

# 修改 JVM 参数（默认 8g 改为 1g）
JAVA_OPT="${JAVA_OPT} -server -Xms1g -Xmx1g -Xmn512m"
```

**启动 Broker**：
```bash
# 启动 Broker（指定 NameServer 地址）
nohup sh bin/mqbroker -n localhost:9876 &

# 查看日志
tail -f ~/logs/rocketmqlogs/broker.log

# 看到 "The broker[...] boot success" 表示成功
```

**配置文件**（可选，`conf/broker.conf`）：
```properties
# Broker 名称
brokerName=broker-a

# Broker 角色（ASYNC_MASTER, SYNC_MASTER, SLAVE）
brokerRole=ASYNC_MASTER

# 刷盘策略（ASYNC_FLUSH, SYNC_FLUSH）
flushDiskType=ASYNC_FLUSH

# NameServer 地址
namesrvAddr=localhost:9876

# 存储路径
storePathRootDir=/tmp/rocketmq/store
storePathCommitLog=/tmp/rocketmq/store/commitlog

# 是否自动创建 Topic（生产环境建议关闭）
autoCreateTopicEnable=true
```

**使用配置文件启动**：
```bash
nohup sh bin/mqbroker -n localhost:9876 -c conf/broker.conf &
```

### 2.5 快速验证

**设置环境变量**：
```bash
export NAMESRV_ADDR=localhost:9876
```

**发送消息**：
```bash
# 使用自带的生产者工具
sh bin/tools.sh org.apache.rocketmq.example.quickstart.Producer

# 输出示例：
# SendResult [sendStatus=SEND_OK, msgId=...]
```

**消费消息**：
```bash
# 使用自带的消费者工具
sh bin/tools.sh org.apache.rocketmq.example.quickstart.Consumer

# 输出示例：
# ConsumeMessageThread_1 Receive New Messages: [MessageExt...]
```

**使用命令行工具**：
```bash
# 创建 Topic
sh bin/mqadmin updateTopic -n localhost:9876 -t TestTopic -c DefaultCluster

# 查看 Topic 列表
sh bin/mqadmin topicList -n localhost:9876

# 发送测试消息
sh bin/mqadmin sendMessage -n localhost:9876 -t TestTopic -p "Hello RocketMQ"

# 查询消息
sh bin/mqadmin queryMsgById -n localhost:9876 -i <msgId>
```

### 2.6 安装管理控制台（可选）

```bash
# 下载 RocketMQ Dashboard
git clone https://github.com/apache/rocketmq-dashboard.git
cd rocketmq-dashboard

# 修改配置
vi src/main/resources/application.properties
# rocketmq.config.namesrvAddr=localhost:9876

# 编译运行
mvn clean package -Dmaven.test.skip=true
java -jar target/rocketmq-dashboard-1.0.0.jar

# 访问控制台
# http://localhost:8080
```

### 2.7 停止服务

```bash
# 停止 Broker
sh bin/mqshutdown broker

# 停止 NameServer
sh bin/mqshutdown namesrv

# 强制停止
ps aux | grep rocketmq
kill -9 <PID>
```

---

## 3. RabbitMQ 单机部署

### 3.1 环境准备

**系统要求**：
- 操作系统：Linux / macOS / Windows
- Erlang：23.2+（RabbitMQ 依赖 Erlang）
- 磁盘空间：至少 5GB
- 内存：至少 2GB

### 3.2 安装 Erlang

**Ubuntu/Debian**：
```bash
# 添加 Erlang 仓库
sudo apt-get update
sudo apt-get install -y erlang

# 验证安装
erl -version
```

**CentOS/RHEL**：
```bash
# 安装 EPEL 仓库
sudo yum install -y epel-release

# 安装 Erlang
sudo yum install -y erlang

# 验证安装
erl -version
```

**macOS**：
```bash
# 使用 Homebrew
brew install erlang
```

### 3.3 安装 RabbitMQ

**Ubuntu/Debian**：
```bash
# 添加 RabbitMQ 仓库
curl -s https://packagecloud.io/install/repositories/rabbitmq/rabbitmq-server/script.deb.sh | sudo bash

# 安装 RabbitMQ
sudo apt-get install -y rabbitmq-server

# 启动服务
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server

# 查看状态
sudo systemctl status rabbitmq-server
```

**CentOS/RHEL**：
```bash
# 添加 RabbitMQ 仓库
curl -s https://packagecloud.io/install/repositories/rabbitmq/rabbitmq-server/script.rpm.sh | sudo bash

# 安装 RabbitMQ
sudo yum install -y rabbitmq-server

# 启动服务
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server
```

**macOS**：
```bash
# 使用 Homebrew
brew install rabbitmq

# 启动服务
brew services start rabbitmq

# 或手动启动
/usr/local/sbin/rabbitmq-server
```

**Docker 安装**（推荐）：
```bash
# 拉取镜像（包含管理插件）
docker pull rabbitmq:3.12-management

# 启动容器
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin \
  rabbitmq:3.12-management

# 查看日志
docker logs -f rabbitmq
```

### 3.4 启用管理插件

```bash
# 启用管理插件
sudo rabbitmq-plugins enable rabbitmq_management

# 重启服务
sudo systemctl restart rabbitmq-server

# 访问管理界面
# http://localhost:15672
# 默认用户名/密码：guest/guest（仅限 localhost）
```

### 3.5 创建管理员用户

```bash
# 添加用户
sudo rabbitmqctl add_user admin admin123

# 设置用户为管理员
sudo rabbitmqctl set_user_tags admin administrator

# 设置权限（vhost / 的所有权限）
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# 删除 guest 用户（生产环境建议）
sudo rabbitmqctl delete_user guest

# 查看用户列表
sudo rabbitmqctl list_users
```

### 3.6 快速验证

**使用管理界面**：
1. 访问 `http://localhost:15672`
2. 登录（admin/admin123）
3. 在 "Queues" 页面创建队列
4. 在 "Exchanges" 页面发布消息
5. 在队列页面查看并消费消息

**使用命令行**：
```bash
# 声明队列
sudo rabbitmqctl eval 'rabbit_amqqueue:declare({resource, <<"/">>, queue, <<"test-queue">>}, true, false, [], none, <<"admin">>).'

# 查看队列列表
sudo rabbitmqctl list_queues

# 发送消息（需要使用客户端库）
```

**使用 Python 客户端**：
```bash
# 安装 pika 库
pip install pika

# 编写生产者
cat > producer.py << 'EOF'
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='test-queue')
channel.basic_publish(exchange='', routing_key='test-queue', body='Hello RabbitMQ')
print("Message sent")
connection.close()
EOF

# 编写消费者
cat > consumer.py << 'EOF'
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='test-queue')

def callback(ch, method, properties, body):
    print(f"Received: {body.decode()}")

channel.basic_consume(queue='test-queue', on_message_callback=callback, auto_ack=True)
print('Waiting for messages...')
channel.start_consuming()
EOF

# 运行
python producer.py
python consumer.py
```

### 3.7 基础配置

**配置文件位置**：
- Linux: `/etc/rabbitmq/rabbitmq.conf`
- macOS: `/usr/local/etc/rabbitmq/rabbitmq.conf`

**核心配置**：
```conf
# 监听地址
listeners.tcp.default = 5672

# 管理界面端口
management.tcp.port = 15672

# 虚拟主机
# default_vhost = /

# 默认用户
# default_user = guest
# default_pass = guest

# 日志级别
log.console.level = info

# 内存阈值（40% 的系统内存）
vm_memory_high_watermark.relative = 0.4

# 磁盘空间阈值（50GB）
disk_free_limit.absolute = 50GB
```

### 3.8 停止服务

```bash
# 停止服务
sudo systemctl stop rabbitmq-server

# 或使用 rabbitmqctl
sudo rabbitmqctl stop

# Docker 停止
docker stop rabbitmq
docker rm rabbitmq
```

---

## 4. 常见问题排查

### 4.1 Kafka 常见问题

**问题 1：端口占用**
```bash
# 检查端口占用
netstat -tuln | grep 9092
lsof -i :9092

# 解决：杀死占用进程或修改配置端口
```

**问题 2：磁盘空间不足**
```bash
# 检查磁盘空间
df -h

# 清理旧日志
bin/kafka-log-dirs.sh --describe --bootstrap-server localhost:9092
```

**问题 3：Zookeeper 连接失败**
```bash
# 检查 Zookeeper 是否运行
echo stat | nc localhost 2181

# 检查配置
grep zookeeper.connect config/server.properties
```

### 4.2 RocketMQ 常见问题

**问题 1：内存不足（Cannot allocate memory）**
```bash
# 修改 JVM 参数
vi bin/runserver.sh
vi bin/runbroker.sh

# 减小内存分配
JAVA_OPT="${JAVA_OPT} -server -Xms512m -Xmx512m"
```

**问题 2：NameServer 连接失败**
```bash
# 检查 NameServer 是否运行
ps aux | grep namesrv

# 检查环境变量
echo $NAMESRV_ADDR

# 检查网络连接
telnet localhost 9876
```

**问题 3：磁盘空间不足**
```bash
# 检查磁盘空间
df -h

# 修改存储路径
vi conf/broker.conf
# storePathRootDir=/path/to/large/disk
```

### 4.3 RabbitMQ 常见问题

**问题 1：Erlang 版本不兼容**
```bash
# 检查 Erlang 版本
erl -version

# 升级 Erlang
sudo apt-get update
sudo apt-get install -y erlang
```

**问题 2：无法访问管理界面**
```bash
# 检查插件是否启用
sudo rabbitmq-plugins list

# 启用管理插件
sudo rabbitmq-plugins enable rabbitmq_management

# 检查端口
netstat -tuln | grep 15672
```

**问题 3：内存告警**
```bash
# 查看内存使用
sudo rabbitmqctl status

# 修改内存阈值
vi /etc/rabbitmq/rabbitmq.conf
# vm_memory_high_watermark.relative = 0.6

# 重启服务
sudo systemctl restart rabbitmq-server
```

---

## 5. 性能测试

### 5.1 Kafka 性能测试

```bash
# 生产者性能测试
bin/kafka-producer-perf-test.sh \
  --topic test-topic \
  --num-records 1000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=localhost:9092

# 消费者性能测试
bin/kafka-consumer-perf-test.sh \
  --topic test-topic \
  --messages 1000000 \
  --threads 1 \
  --bootstrap-server localhost:9092
```

### 5.2 RocketMQ 性能测试

```bash
# 生产者性能测试
sh bin/benchmark.sh -n localhost:9876 -t TestTopic -s 1024 -c 10

# 消费者性能测试
sh bin/benchmark.sh -n localhost:9876 -t TestTopic -g test-group -c 10
```

### 5.3 RabbitMQ 性能测试

```bash
# 使用 rabbitmq-perf-test 工具
# 下载工具
wget https://github.com/rabbitmq/rabbitmq-perf-test/releases/download/v2.19.0/perf-test-2.19.0.jar

# 运行测试
java -jar perf-test-2.19.0.jar \
  --uri amqp://admin:admin123@localhost:5672 \
  --producers 10 \
  --consumers 10 \
  --queue test-queue \
  --rate 1000
```

---

## 关键要点

1. **Kafka**：支持 Zookeeper 和 KRaft 两种模式，KRaft 是未来方向
2. **RocketMQ**：需要先启动 NameServer，再启动 Broker
3. **RabbitMQ**：依赖 Erlang，Docker 部署最简单
4. **快速验证**：三大 MQ 都提供命令行工具进行快速测试
5. **JVM 调优**：Kafka 和 RocketMQ 需要根据机器内存调整 JVM 参数
6. **管理界面**：RabbitMQ 和 RocketMQ 提供 Web 管理界面

---

## 深入一点

### Kafka KRaft 模式 vs Zookeeper 模式

**Zookeeper 模式的问题**：
- 额外依赖：需要维护 Zookeeper 集群
- 运维复杂：两套系统，双倍运维成本
- 性能瓶颈：元数据操作需要通过 Zookeeper
- 扩展限制：Partition 数量受限于 Zookeeper 性能

**KRaft 模式的优势**：
- 无外部依赖：Kafka 自管理元数据
- 简化运维：只需维护 Kafka 集群
- 性能提升：元数据操作更快
- 更好扩展：支持百万级 Partition

**迁移建议**：
- 新项目：直接使用 KRaft 模式
- 老项目：Kafka 3.6+ 支持从 Zookeeper 迁移到 KRaft

---

## 参考资料

1. [Kafka Quickstart](https://kafka.apache.org/quickstart)
2. [RocketMQ Quick Start](https://rocketmq.apache.org/docs/quick-start/)
3. [RabbitMQ Installation](https://www.rabbitmq.com/download.html)
4. [Kafka KRaft](https://kafka.apache.org/documentation/#kraft)
5. [RocketMQ Dashboard](https://github.com/apache/rocketmq-dashboard)
