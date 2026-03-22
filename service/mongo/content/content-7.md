# Kubernetes 部署思路

## 概述

Kubernetes 是运行有状态 MongoDB 集群的主流云原生方案。与无状态应用不同，MongoDB 需要稳定的网络标识、持久化存储和有序启动，这些都需要特殊的 K8s 资源配合。

---

## StatefulSet vs Deployment

| 特性 | StatefulSet | Deployment |
|------|-------------|------------|
| Pod 名称 | 固定（mongo-0, mongo-1）| 随机 |
| 网络标识 | 稳定 DNS（mongo-0.mongo-svc）| 变化 |
| 存储 | 每 Pod 独立 PVC | 共享或无 |
| 启动顺序 | 有序（0→1→2）| 并行 |
| 适用场景 | **MongoDB 必须用此** | 无状态服务 |

**结论**：MongoDB 副本集必须使用 StatefulSet。

---

## 完整部署示例（三节点副本集）

### 1. StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs   # 根据云厂商修改
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
reclaimPolicy: Retain                # 重要：防止误删数据
volumeBindingMode: WaitForFirstConsumer
```

### 2. Headless Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: database
spec:
  clusterIP: None         # Headless：不分配 ClusterIP
  selector:
    app: mongodb
  ports:
    - port: 27017
      name: mongodb
```

### 3. StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: database
spec:
  serviceName: mongodb    # 必须与 Headless Service 名称一致
  replicas: 3
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: mongodb
          image: mongo:7.0
          command:
            - mongod
            - "--replSet=rs0"
            - "--bind_ip_all"
            - "--keyFile=/etc/mongodb/keyfile"
          ports:
            - containerPort: 27017
          resources:
            requests:
              cpu: "1"
              memory: "4Gi"
            limits:
              cpu: "2"
              memory: "8Gi"
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: username
            - name: MONGO_INITDB_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: password
          volumeMounts:
            - name: data
              mountPath: /data/db
            - name: keyfile
              mountPath: /etc/mongodb/keyfile
              subPath: keyfile
          readinessProbe:
            exec:
              command: ["mongosh", "--eval", "db.adminCommand('ping')"]
            initialDelaySeconds: 30
            periodSeconds: 10
          livenessProbe:
            exec:
              command: ["mongosh", "--eval", "db.adminCommand('ping')"]
            initialDelaySeconds: 60
            periodSeconds: 30
      volumes:
        - name: keyfile
          secret:
            secretName: mongodb-keyfile
            defaultMode: 0400
  volumeClaimTemplates:   # 每个 Pod 独立 PVC
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: fast-ssd
        resources:
          requests:
            storage: 100Gi
```

### 4. PodDisruptionBudget（保障滚动更新时可用性）

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: mongodb-pdb
  namespace: database
spec:
  minAvailable: 2         # 三节点集群，最少保留 2 个可用
  selector:
    matchLabels:
      app: mongodb
```

### 5. Secret

```bash
# 创建认证 Secret
kubectl create secret generic mongodb-secret \
  --from-literal=username=admin \
  --from-literal=password=StrongPass123 \
  -n database

# 创建 keyfile Secret
openssl rand -base64 756 > keyfile
kubectl create secret generic mongodb-keyfile \
  --from-file=keyfile=keyfile \
  -n database
```

---

## 初始化副本集

```bash
# 等待所有 Pod 就绪
kubectl wait --for=condition=Ready pod -l app=mongodb -n database --timeout=300s

# 在 mongo-0 上初始化副本集
kubectl exec -it mongodb-0 -n database -- mongosh --eval '
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb-0.mongodb.database.svc.cluster.local:27017", priority: 2 },
    { _id: 1, host: "mongodb-1.mongodb.database.svc.cluster.local:27017", priority: 1 },
    { _id: 2, host: "mongodb-2.mongodb.database.svc.cluster.local:27017", priority: 1 }
  ]
})
'
```

---

## MongoDB Operator（推荐方式）

手动管理 StatefulSet 复杂度高，**推荐使用 Community Operator** 简化运维：

```bash
# 安装 Community Operator
helm repo add mongodb https://mongodb.github.io/helm-charts
helm install community-operator mongodb/community-operator -n mongodb-operator --create-namespace
```

```yaml
# 声明式创建 MongoDB 副本集
apiVersion: mongodbcommunity.mongodb.com/v1
kind: MongoDBCommunity
metadata:
  name: mongodb-rs
spec:
  members: 3
  type: ReplicaSet
  version: "7.0.0"
  security:
    authentication:
      modes: ["SCRAM"]
  users:
    - name: admin
      db: admin
      passwordSecretRef:
        name: mongodb-password
      roles:
        - name: clusterAdmin
          db: admin
        - name: userAdminAnyDatabase
          db: admin
  statefulSet:
    spec:
      volumeClaimTemplates:
        - metadata:
            name: data-volume
          spec:
            storageClassName: fast-ssd
            resources:
              requests:
                storage: 100Gi
```

---

## 易错点

- **不要用 Deployment**：Pod 重启后名称和 IP 变化，副本集无法稳定工作
- **reclaimPolicy 设为 Retain**：防止 Pod 删除时 PVC 被自动删除导致数据丢失
- **资源 Limits 必须设置**：防止 MongoDB 占用过多内存触发 OOM Kill
- **wiredTigerCacheSizeGB 显式配置**：默认按节点总内存计算，容器环境下可能过大

---

## 总结

- K8s 上运行 MongoDB 必须使用 StatefulSet + Headless Service + PVC
- 生产环境推荐 MongoDB Community Operator，简化副本集管理
- PodDisruptionBudget 防止维护操作导致集群不可用
- 数据卷使用 `reclaimPolicy: Retain` 防止误删

**下一步**：MongoDB Atlas 云服务入门。
