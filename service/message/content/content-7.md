# 容器化与云原生部署

## 概述

容器化部署已成为现代应用的标准方式，Kubernetes 是容器编排的事实标准。本章将介绍如何使用 Docker、Docker Compose 和 Kubernetes 部署三大消息队列，包括持久化存储、服务发现、负载均衡等关键配置，帮助你构建云原生的消息队列集群。

---

## 1. Docker 部署

### 1.1 Kafka Docker 部署

**单节点部署（Docker Compose）**：

创建 `docker-compose.yml`：
```yaml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
      - zookeeper-logs:/var/lib/zookeeper/log

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_LOG_RETENTION_HOURS: 168
      KAFKA_LOG_SEGMENT_BYTES: 1073741824
    volumes:
      - kafka-data:/var/lib/kafka/data

volumes:
  zookeeper-data:
  zookeeper-logs:
  kafka-data:
```

**启动集群**：
```bash
docker-compose up -d

# 查看日志
docker-compose logs -f kafka

# 进入容器测试
docker exec -it kafka bash
kafka-topics --create --topic test --bootstrap-server localhost:9092
kafka-console-producer --topic test --bootstrap-server localhost:9092
kafka-console-consumer --topic test --bootstrap-server localhost:9092 --from-beginning
```

**多节点集群部署**：

```yaml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka1:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka1
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka1:9092
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3

  kafka2:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka2
    depends_on:
      - zookeeper
    ports:
      - "9093:9092"
    environment:
      KAFKA_BROKER_ID: 2
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka2:9092
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092

  kafka3:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka3
    depends_on:
      - zookeeper
    ports:
      - "9094:9092"
    environment:
      KAFKA_BROKER_ID: 3
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka3:9092
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
```

### 1.2 RocketMQ Docker 部署

**单节点部署**：

```yaml
version: '3.8'

services:
  namesrv:
    image: apache/rocketmq:5.1.4
    container_name: rmqnamesrv
    ports:
      - "9876:9876"
    command: sh mqnamesrv
    environment:
      JAVA_OPT_EXT: "-Xms512m -Xmx512m"
    volumes:
      - namesrv-logs:/home/rocketmq/logs

  broker:
    image: apache/rocketmq:5.1.4
    container_name: rmqbroker
    depends_on:
      - namesrv
    ports:
      - "10909:10909"
      - "10911:10911"
    command: sh mqbroker -n namesrv:9876
    environment:
      NAMESRV_ADDR: namesrv:9876
      JAVA_OPT_EXT: "-Xms1g -Xmx1g"
    volumes:
      - broker-logs:/home/rocketmq/logs
      - broker-store:/home/rocketmq/store

  # RocketMQ Dashboard（可选）
  dashboard:
    image: apacherocketmq/rocketmq-dashboard:latest
    container_name: rmqdashboard
    depends_on:
      - namesrv
    ports:
      - "8080:8080"
    environment:
      JAVA_OPTS: "-Xms256m -Xmx256m -Drocketmq.namesrv.addr=namesrv:9876"

volumes:
  namesrv-logs:
  broker-logs:
  broker-store:
```

**自定义 Broker 配置**：

创建 `broker.conf`：
```properties
brokerName=broker-a
brokerId=0
deleteWhen=04
fileReservedTime=48
brokerRole=ASYNC_MASTER
flushDiskType=ASYNC_FLUSH
```

修改 `docker-compose.yml`：
```yaml
broker:
  image: apache/rocketmq:5.1.4
  command: sh mqbroker -n namesrv:9876 -c /home/rocketmq/broker.conf
  volumes:
    - ./broker.conf:/home/rocketmq/broker.conf
    - broker-store:/home/rocketmq/store
```

### 1.3 RabbitMQ Docker 部署

**单节点部署**：

```bash
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -v rabbitmq-data:/var/lib/rabbitmq \
  rabbitmq:3.12-management
```

**Docker Compose 部署**：

```yaml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3.12-management
    container_name: rabbitmq
    hostname: rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
      RABBITMQ_VM_MEMORY_HIGH_WATERMARK: 512MB
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
      - ./rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf

volumes:
  rabbitmq-data:
```

**集群部署**：

```yaml
version: '3.8'

services:
  rabbitmq1:
    image: rabbitmq:3.12-management
    container_name: rabbitmq1
    hostname: rabbitmq1
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret_cookie'
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq1-data:/var/lib/rabbitmq

  rabbitmq2:
    image: rabbitmq:3.12-management
    container_name: rabbitmq2
    hostname: rabbitmq2
    depends_on:
      - rabbitmq1
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret_cookie'
    volumes:
      - rabbitmq2-data:/var/lib/rabbitmq
    entrypoint: |
      bash -c "
      rabbitmq-server -detached &&
      sleep 10 &&
      rabbitmqctl stop_app &&
      rabbitmqctl join_cluster rabbit@rabbitmq1 &&
      rabbitmqctl start_app &&
      tail -f /dev/null
      "

  rabbitmq3:
    image: rabbitmq:3.12-management
    container_name: rabbitmq3
    hostname: rabbitmq3
    depends_on:
      - rabbitmq1
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret_cookie'
    volumes:
      - rabbitmq3-data:/var/lib/rabbitmq
    entrypoint: |
      bash -c "
      rabbitmq-server -detached &&
      sleep 10 &&
      rabbitmqctl stop_app &&
      rabbitmqctl join_cluster rabbit@rabbitmq1 &&
      rabbitmqctl start_app &&
      tail -f /dev/null
      "

volumes:
  rabbitmq1-data:
  rabbitmq2-data:
  rabbitmq3-data:
```

---

## 2. Kubernetes 部署

### 2.1 Kafka Kubernetes 部署

**使用 StatefulSet 部署 Zookeeper**：

创建 `zookeeper-statefulset.yaml`：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: zookeeper-headless
spec:
  clusterIP: None
  selector:
    app: zookeeper
  ports:
    - name: client
      port: 2181
    - name: server
      port: 2888
    - name: leader-election
      port: 3888
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: zookeeper
spec:
  serviceName: zookeeper-headless
  replicas: 3
  selector:
    matchLabels:
      app: zookeeper
  template:
    metadata:
      labels:
        app: zookeeper
    spec:
      containers:
      - name: zookeeper
        image: confluentinc/cp-zookeeper:7.5.0
        ports:
        - containerPort: 2181
          name: client
        - containerPort: 2888
          name: server
        - containerPort: 3888
          name: leader-election
        env:
        - name: ZOOKEEPER_SERVER_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['statefulset.kubernetes.io/pod-name']
        - name: ZOOKEEPER_CLIENT_PORT
          value: "2181"
        - name: ZOOKEEPER_TICK_TIME
          value: "2000"
        - name: ZOOKEEPER_SERVERS
          value: "zookeeper-0.zookeeper-headless:2888:3888;zookeeper-1.zookeeper-headless:2888:3888;zookeeper-2.zookeeper-headless:2888:3888"
        volumeMounts:
        - name: data
          mountPath: /var/lib/zookeeper
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

**使用 StatefulSet 部署 Kafka**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kafka-headless
spec:
  clusterIP: None
  selector:
    app: kafka
  ports:
    - name: broker
      port: 9092
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: kafka
spec:
  serviceName: kafka-headless
  replicas: 3
  selector:
    matchLabels:
      app: kafka
  template:
    metadata:
      labels:
        app: kafka
    spec:
      containers:
      - name: kafka
        image: confluentinc/cp-kafka:7.5.0
        ports:
        - containerPort: 9092
          name: broker
        env:
        - name: KAFKA_BROKER_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['statefulset.kubernetes.io/pod-name']
        - name: KAFKA_ZOOKEEPER_CONNECT
          value: "zookeeper-0.zookeeper-headless:2181,zookeeper-1.zookeeper-headless:2181,zookeeper-2.zookeeper-headless:2181"
        - name: KAFKA_ADVERTISED_LISTENERS
          value: "PLAINTEXT://$(POD_NAME).kafka-headless:9092"
        - name: KAFKA_LISTENERS
          value: "PLAINTEXT://0.0.0.0:9092"
        - name: KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR
          value: "3"
        - name: KAFKA_TRANSACTION_STATE_LOG_MIN_ISR
          value: "2"
        - name: KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR
          value: "3"
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        volumeMounts:
        - name: data
          mountPath: /var/lib/kafka
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

**部署**：
```bash
kubectl apply -f zookeeper-statefulset.yaml
kubectl apply -f kafka-statefulset.yaml

# 查看状态
kubectl get pods
kubectl get pvc

# 测试
kubectl exec -it kafka-0 -- bash
kafka-topics --create --topic test --bootstrap-server kafka-0.kafka-headless:9092 --partitions 3 --replication-factor 3
```

### 2.2 RocketMQ Kubernetes 部署

**部署 NameServer**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: rocketmq-namesrv
spec:
  selector:
    app: rocketmq-namesrv
  ports:
    - port: 9876
      targetPort: 9876
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rocketmq-namesrv
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rocketmq-namesrv
  template:
    metadata:
      labels:
        app: rocketmq-namesrv
    spec:
      containers:
      - name: namesrv
        image: apache/rocketmq:5.1.4
        command: ["sh", "mqnamesrv"]
        ports:
        - containerPort: 9876
        env:
        - name: JAVA_OPT_EXT
          value: "-Xms512m -Xmx512m"
```

**部署 Broker（StatefulSet）**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: rocketmq-broker
spec:
  clusterIP: None
  selector:
    app: rocketmq-broker
  ports:
    - name: main
      port: 10911
    - name: ha
      port: 10912
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: rocketmq-broker
spec:
  serviceName: rocketmq-broker
  replicas: 2
  selector:
    matchLabels:
      app: rocketmq-broker
  template:
    metadata:
      labels:
        app: rocketmq-broker
    spec:
      containers:
      - name: broker
        image: apache/rocketmq:5.1.4
        command: 
          - sh
          - mqbroker
          - -n
          - rocketmq-namesrv:9876
        ports:
        - containerPort: 10909
        - containerPort: 10911
        - containerPort: 10912
        env:
        - name: NAMESRV_ADDR
          value: "rocketmq-namesrv:9876"
        - name: JAVA_OPT_EXT
          value: "-Xms1g -Xmx1g"
        volumeMounts:
        - name: broker-storage
          mountPath: /home/rocketmq/store
  volumeClaimTemplates:
  - metadata:
      name: broker-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

### 2.3 RabbitMQ Kubernetes 部署

**使用 Operator 部署（推荐）**：

```bash
# 安装 RabbitMQ Cluster Operator
kubectl apply -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml

# 创建 RabbitMQ 集群
cat <<EOF | kubectl apply -f -
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: rabbitmq-cluster
spec:
  replicas: 3
  resources:
    requests:
      cpu: 1000m
      memory: 2Gi
    limits:
      cpu: 2000m
      memory: 2Gi
  persistence:
    storage: 10Gi
  rabbitmq:
    additionalConfig: |
      cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s
      cluster_formation.k8s.host = kubernetes.default.svc.cluster.local
      cluster_formation.k8s.address_type = hostname
EOF

# 查看状态
kubectl get rabbitmqclusters
kubectl get pods -l app.kubernetes.io/name=rabbitmq-cluster

# 获取管理员密码
kubectl get secret rabbitmq-cluster-default-user -o jsonpath='{.data.password}' | base64 --decode

# 端口转发访问管理界面
kubectl port-forward svc/rabbitmq-cluster 15672:15672
```

**手动 StatefulSet 部署**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq-headless
spec:
  clusterIP: None
  selector:
    app: rabbitmq
  ports:
    - name: amqp
      port: 5672
    - name: management
      port: 15672
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: rabbitmq
spec:
  serviceName: rabbitmq-headless
  replicas: 3
  selector:
    matchLabels:
      app: rabbitmq
  template:
    metadata:
      labels:
        app: rabbitmq
    spec:
      containers:
      - name: rabbitmq
        image: rabbitmq:3.12-management
        ports:
        - containerPort: 5672
          name: amqp
        - containerPort: 15672
          name: management
        env:
        - name: RABBITMQ_ERLANG_COOKIE
          value: "secret_cookie_change_me"
        - name: RABBITMQ_DEFAULT_USER
          value: "admin"
        - name: RABBITMQ_DEFAULT_PASS
          value: "admin123"
        - name: RABBITMQ_USE_LONGNAME
          value: "true"
        volumeMounts:
        - name: data
          mountPath: /var/lib/rabbitmq
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

---

## 3. Helm Chart 部署

### 3.1 Kafka Helm Chart

**使用 Bitnami Helm Chart**：

```bash
# 添加 Bitnami 仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 安装 Kafka
helm install kafka bitnami/kafka \
  --set replicaCount=3 \
  --set zookeeper.replicaCount=3 \
  --set defaultReplicationFactor=3 \
  --set minInsyncReplicas=2 \
  --set persistence.size=100Gi

# 查看状态
kubectl get pods -l app.kubernetes.io/name=kafka

# 获取连接信息
kubectl get svc kafka
```

**自定义配置**：

创建 `kafka-values.yaml`：
```yaml
replicaCount: 3

persistence:
  enabled: true
  size: 100Gi
  storageClass: "fast-ssd"

metrics:
  kafka:
    enabled: true
  jmx:
    enabled: true

zookeeper:
  replicaCount: 3
  persistence:
    enabled: true
    size: 10Gi

resources:
  limits:
    cpu: 2000m
    memory: 4Gi
  requests:
    cpu: 1000m
    memory: 2Gi

heapOpts: "-Xmx2g -Xms2g"

defaultReplicationFactor: 3
minInsyncReplicas: 2
autoCreateTopicsEnable: false
```

安装：
```bash
helm install kafka bitnami/kafka -f kafka-values.yaml
```

### 3.2 RocketMQ Helm Chart

```bash
# 添加仓库
helm repo add rocketmq https://helm-charts.itboon.top/rocketmq
helm repo update

# 安装 RocketMQ
helm install rocketmq rocketmq/rocketmq-cluster \
  --set nameserver.replicaCount=3 \
  --set broker.replicaCount=2 \
  --set broker.master.brokerRole=ASYNC_MASTER

# 查看状态
kubectl get pods -l app.kubernetes.io/name=rocketmq
```

**自定义配置**：

```yaml
nameserver:
  replicaCount: 3
  resources:
    limits:
      cpu: 1000m
      memory: 2Gi
    requests:
      cpu: 500m
      memory: 1Gi

broker:
  replicaCount: 2
  master:
    brokerRole: ASYNC_MASTER
    jvmMemory: "-Xms2g -Xmx2g"
  persistence:
    enabled: true
    size: 100Gi

dashboard:
  enabled: true
  service:
    type: LoadBalancer
```

### 3.3 RabbitMQ Helm Chart

```bash
# 添加 Bitnami 仓库
helm repo add bitnami https://charts.bitnami.com/bitnami

# 安装 RabbitMQ
helm install rabbitmq bitnami/rabbitmq \
  --set replicaCount=3 \
  --set auth.username=admin \
  --set auth.password=admin123 \
  --set clustering.enabled=true \
  --set persistence.size=10Gi

# 获取管理员密码
kubectl get secret rabbitmq -o jsonpath="{.data.rabbitmq-password}" | base64 -d
```

---

## 4. 持久化存储配置

### 4.1 StorageClass 配置

**本地存储（Local PV）**：

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```

**创建 PersistentVolume**：

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: kafka-pv-0
spec:
  capacity:
    storage: 100Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: local-storage
  local:
    path: /mnt/disks/kafka0
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - node1
```

**网络存储（NFS）**：

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-storage
provisioner: nfs-client
parameters:
  archiveOnDelete: "false"
```

**云存储（AWS EBS）**：

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iopsPerGB: "50"
  encrypted: "true"
```

### 4.2 备份与恢复

**Kafka 数据备份**：

```bash
# 使用 Velero 备份
velero backup create kafka-backup --include-namespaces kafka

# 恢复
velero restore create --from-backup kafka-backup
```

**RocketMQ 数据备份**：

```bash
# 备份 CommitLog 和 ConsumeQueue
kubectl exec -it rocketmq-broker-0 -- tar -czf /tmp/backup.tar.gz /home/rocketmq/store

# 复制备份文件
kubectl cp rocketmq-broker-0:/tmp/backup.tar.gz ./backup.tar.gz
```

---

## 5. 服务发现与负载均衡

### 5.1 Headless Service

用于 StatefulSet Pod 间通信：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kafka-headless
spec:
  clusterIP: None  # Headless Service
  selector:
    app: kafka
  ports:
    - port: 9092
```

访问方式：
- `kafka-0.kafka-headless:9092`
- `kafka-1.kafka-headless:9092`
- `kafka-2.kafka-headless:9092`

### 5.2 LoadBalancer Service

对外暴露服务：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kafka-external
spec:
  type: LoadBalancer
  selector:
    app: kafka
  ports:
    - port: 9092
      targetPort: 9092
```

### 5.3 Ingress

使用 Ingress 暴露管理界面：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rabbitmq-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: rabbitmq.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: rabbitmq
            port:
              number: 15672
```

---

## 6. 监控与日志收集

### 6.1 Prometheus 监控

**Kafka Exporter**：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka-exporter
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kafka-exporter
  template:
    metadata:
      labels:
        app: kafka-exporter
    spec:
      containers:
      - name: kafka-exporter
        image: danielqsj/kafka-exporter:latest
        args:
          - --kafka.server=kafka-0.kafka-headless:9092
          - --kafka.server=kafka-1.kafka-headless:9092
          - --kafka.server=kafka-2.kafka-headless:9092
        ports:
        - containerPort: 9308
```

**ServiceMonitor**：

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kafka-metrics
spec:
  selector:
    matchLabels:
      app: kafka-exporter
  endpoints:
  - port: metrics
    interval: 30s
```

### 6.2 日志收集

**使用 Fluent Bit**：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
data:
  fluent-bit.conf: |
    [INPUT]
        Name tail
        Path /var/log/kafka/*.log
        Parser kafka
        
    [OUTPUT]
        Name es
        Match *
        Host elasticsearch:9200
```

---

## 关键要点

1. **StatefulSet**：消息队列必须使用 StatefulSet，保证 Pod 名称和存储稳定
2. **持久化存储**：使用 PVC 持久化数据，推荐 SSD 存储提升性能
3. **Headless Service**：用于 Pod 间通信，提供稳定的 DNS 记录
4. **资源限制**：合理配置 CPU 和内存资源，避免 OOM
5. **Helm Chart**：推荐使用官方 Helm Chart，简化部署和升级
6. **监控告警**：集成 Prometheus 监控，及时发现问题

---

## 深入一点

### StatefulSet vs Deployment

**为什么消息队列必须用 StatefulSet？**

1. **稳定的网络标识**：
   - StatefulSet：Pod 名称固定（kafka-0、kafka-1、kafka-2）
   - Deployment：Pod 名称随机（kafka-6d5f7b8c9-x7k2p）

2. **稳定的存储**：
   - StatefulSet：每个 Pod 绑定独立的 PVC
   - Deployment：共享存储或随机绑定

3. **有序部署和扩缩容**：
   - StatefulSet：按顺序启动（0→1→2），按顺序停止（2→1→0）
   - Deployment：并发启动和停止

4. **服务发现**：
   - StatefulSet：通过 Headless Service 提供稳定 DNS
   - Deployment：通过 Service 提供负载均衡

### Kubernetes 中的 Kafka 配置挑战

**ADVERTISED_LISTENERS 配置**：

Kafka 需要客户端能够直接连接到每个 Broker，在 Kubernetes 中有两种方案：

**方案 1：使用 Headless Service（集群内访问）**：
```yaml
KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://$(POD_NAME).kafka-headless:9092
```

**方案 2：使用 LoadBalancer（外部访问）**：
```yaml
KAFKA_ADVERTISED_LISTENERS: EXTERNAL://kafka-external:9092,INTERNAL://$(POD_NAME).kafka-headless:9092
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: EXTERNAL:PLAINTEXT,INTERNAL:PLAINTEXT
KAFKA_INTER_BROKER_LISTENER_NAME: INTERNAL
```

---

## 参考资料

1. [Kubernetes StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
2. [Bitnami Kafka Helm Chart](https://github.com/bitnami/charts/tree/main/bitnami/kafka)
3. [RabbitMQ Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview.html)
4. [Strimzi Kafka Operator](https://strimzi.io/)
5. [Kubernetes Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
