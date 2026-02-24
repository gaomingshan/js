# 第34章：微服务部署与运维

> **本章目标**：掌握微服务容器化部署、Kubernetes 编排、CI/CD 流程及运维最佳实践

---

## 1. Docker 容器化

### 1.1 为什么容器化

**传统部署痛点**：
- 环境不一致（开发、测试、生产）
- 依赖冲突
- 部署复杂
- 资源隔离差

**容器化优势**：
- ✅ 环境一致性
- ✅ 快速部署
- ✅ 资源隔离
- ✅ 易于扩展

---

### 1.2 编写 Dockerfile

**Spring Boot 多阶段构建**：
```dockerfile
# 构建阶段
FROM maven:3.8-openjdk-8 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:8-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# 添加时区
RUN apk add --no-cache tzdata
ENV TZ=Asia/Shanghai

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8001/actuator/health || exit 1

# JVM 参数
ENV JAVA_OPTS="-Xms512m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 暴露端口
EXPOSE 8001

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```

**优化技巧**：
```dockerfile
# 优化1：使用 .dockerignore
# .dockerignore
target/
.git/
.idea/
*.log

# 优化2：利用缓存层
FROM openjdk:8-jre-alpine
# 先复制依赖（变化少）
COPY target/lib /app/lib
# 再复制应用 JAR（变化多）
COPY target/*.jar /app/app.jar

# 优化3：使用精简基础镜像
FROM openjdk:8-jre-alpine  # 体积小
# FROM openjdk:8-jre  # 体积大
```

---

### 1.3 构建与运行

**构建镜像**：
```bash
# 构建镜像
docker build -t user-service:1.0.0 .

# 查看镜像
docker images

# 推送到仓库
docker tag user-service:1.0.0 registry.example.com/user-service:1.0.0
docker push registry.example.com/user-service:1.0.0
```

**运行容器**：
```bash
# 运行容器
docker run -d \
  --name user-service \
  -p 8001:8001 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e NACOS_SERVER=http://nacos:8848 \
  --memory=512m \
  --cpus=1 \
  user-service:1.0.0

# 查看日志
docker logs -f user-service

# 进入容器
docker exec -it user-service sh

# 停止容器
docker stop user-service

# 删除容器
docker rm user-service
```

---

### 1.4 Docker Compose

**docker-compose.yml**：
```yaml
version: '3.8'

services:
  # Nacos
  nacos:
    image: nacos/nacos-server:2.1.0
    container_name: nacos
    environment:
      - MODE=standalone
    ports:
      - "8848:8848"
    volumes:
      - ./nacos/logs:/home/nacos/logs
    networks:
      - microservice-network
  
  # MySQL
  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root123
      - MYSQL_DATABASE=cloud_db
    ports:
      - "3306:3306"
    volumes:
      - ./mysql/data:/var/lib/mysql
    networks:
      - microservice-network
  
  # Redis
  redis:
    image: redis:7.0
    container_name: redis
    ports:
      - "6379:6379"
    networks:
      - microservice-network
  
  # Gateway
  gateway:
    image: gateway:1.0.0
    container_name: gateway
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - NACOS_SERVER=http://nacos:8848
    ports:
      - "8000:8000"
    depends_on:
      - nacos
    networks:
      - microservice-network
  
  # User Service
  user-service:
    image: user-service:1.0.0
    container_name: user-service
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - NACOS_SERVER=http://nacos:8848
      - MYSQL_HOST=mysql
      - REDIS_HOST=redis
    ports:
      - "8001:8001"
    depends_on:
      - nacos
      - mysql
      - redis
    networks:
      - microservice-network
  
  # Order Service
  order-service:
    image: order-service:1.0.0
    container_name: order-service
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - NACOS_SERVER=http://nacos:8848
      - MYSQL_HOST=mysql
    ports:
      - "8002:8002"
    depends_on:
      - nacos
      - mysql
    networks:
      - microservice-network

networks:
  microservice-network:
    driver: bridge
```

**启动服务**：
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f user-service

# 停止服务
docker-compose down

# 重启服务
docker-compose restart user-service
```

---

## 2. Kubernetes 编排

### 2.1 Kubernetes 核心概念

**资源对象**：
- **Pod**：最小部署单元，包含一个或多个容器
- **Deployment**：管理 Pod 副本，支持滚动更新
- **Service**：服务发现和负载均衡
- **ConfigMap**：配置管理
- **Secret**：敏感数据管理
- **Ingress**：外部访问入口

**架构**：
```
Master（控制平面）
├─ API Server：API 入口
├─ Scheduler：调度 Pod
├─ Controller Manager：控制器管理
└─ etcd：分布式存储

Node（工作节点）
├─ kubelet：管理 Pod
├─ kube-proxy：网络代理
└─ Container Runtime：容器运行时（Docker/containerd）
```

---

### 2.2 部署微服务

**Deployment 配置**：
```yaml
# user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: microservice
  labels:
    app: user-service
spec:
  replicas: 3  # 副本数
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: registry.example.com/user-service:1.0.0
        ports:
        - containerPort: 8001
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: NACOS_SERVER
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: nacos.server
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8001
          initialDelaySeconds: 20
          periodSeconds: 5
```

**Service 配置**：
```yaml
# user-service-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: microservice
spec:
  selector:
    app: user-service
  ports:
  - protocol: TCP
    port: 8001
    targetPort: 8001
  type: ClusterIP  # ClusterIP/NodePort/LoadBalancer
```

**ConfigMap 配置**：
```yaml
# app-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: microservice
data:
  nacos.server: "http://nacos:8848"
  redis.host: "redis"
  mysql.host: "mysql"
```

**Secret 配置**：
```yaml
# mysql-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
  namespace: microservice
type: Opaque
data:
  username: cm9vdA==  # base64 编码的 "root"
  password: cm9vdDEyMw==  # base64 编码的 "root123"
```

**应用配置**：
```bash
# 创建命名空间
kubectl create namespace microservice

# 应用配置
kubectl apply -f app-configmap.yaml
kubectl apply -f mysql-secret.yaml
kubectl apply -f user-service-deployment.yaml
kubectl apply -f user-service-service.yaml

# 查看资源
kubectl get pods -n microservice
kubectl get deployments -n microservice
kubectl get services -n microservice

# 查看日志
kubectl logs -f user-service-xxx -n microservice

# 进入 Pod
kubectl exec -it user-service-xxx -n microservice -- sh

# 删除资源
kubectl delete -f user-service-deployment.yaml
```

---

### 2.3 滚动更新

**更新镜像**：
```bash
# 更新镜像版本
kubectl set image deployment/user-service \
  user-service=registry.example.com/user-service:1.0.1 \
  -n microservice

# 查看更新状态
kubectl rollout status deployment/user-service -n microservice

# 查看更新历史
kubectl rollout history deployment/user-service -n microservice
```

**回滚**：
```bash
# 回滚到上一个版本
kubectl rollout undo deployment/user-service -n microservice

# 回滚到指定版本
kubectl rollout undo deployment/user-service --to-revision=2 -n microservice
```

**滚动更新策略**：
```yaml
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1  # 最多额外创建1个Pod
      maxUnavailable: 1  # 最多1个Pod不可用
```

---

### 2.4 自动扩缩容（HPA）

**HPA 配置**：
```yaml
# user-service-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
  namespace: microservice
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # CPU 使用率 > 70% 扩容
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80  # 内存使用率 > 80% 扩容
```

**应用 HPA**：
```bash
kubectl apply -f user-service-hpa.yaml

# 查看 HPA 状态
kubectl get hpa -n microservice

# 查看扩缩容事件
kubectl describe hpa user-service-hpa -n microservice
```

---

### 2.5 Ingress 配置

**Ingress 配置**：
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microservice-ingress
  namespace: microservice
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /user
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 8001
      - path: /order
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 8002
  tls:
  - hosts:
    - api.example.com
    secretName: tls-secret
```

**访问**：
```
https://api.example.com/user/1
https://api.example.com/order/1
```

---

## 3. CI/CD 流程

### 3.1 GitLab CI/CD

**.gitlab-ci.yml**：
```yaml
stages:
  - build
  - test
  - package
  - deploy

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
  IMAGE_TAG: $CI_COMMIT_SHORT_SHA

# 构建
build:
  stage: build
  image: maven:3.8-openjdk-8
  script:
    - mvn clean compile
  cache:
    paths:
      - .m2/repository

# 测试
test:
  stage: test
  image: maven:3.8-openjdk-8
  script:
    - mvn test
  artifacts:
    reports:
      junit: target/surefire-reports/*.xml

# 打包镜像
package:
  stage: package
  image: docker:latest
  services:
    - docker:dind
  script:
    - mvn package -DskipTests
    - docker build -t registry.example.com/user-service:$IMAGE_TAG .
    - docker push registry.example.com/user-service:$IMAGE_TAG
  only:
    - master

# 部署到K8s
deploy:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/user-service user-service=registry.example.com/user-service:$IMAGE_TAG -n microservice
    - kubectl rollout status deployment/user-service -n microservice
  only:
    - master
  when: manual
```

---

### 3.2 Jenkins Pipeline

**Jenkinsfile**：
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'registry.example.com'
        IMAGE_NAME = 'user-service'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        K8S_NAMESPACE = 'microservice'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('Package') {
            steps {
                sh 'mvn package -DskipTests'
            }
        }
        
        stage('Docker Build') {
            steps {
                sh """
                    docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .
                    docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }
        
        stage('Deploy to K8s') {
            steps {
                sh """
                    kubectl set image deployment/${IMAGE_NAME} \
                        ${IMAGE_NAME}=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}
                    kubectl rollout status deployment/${IMAGE_NAME} -n ${K8S_NAMESPACE}
                """
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
            // 发送成功通知
        }
        failure {
            echo 'Pipeline failed!'
            // 发送失败通知
        }
    }
}
```

---

## 4. 日志收集（ELK）

### 4.1 架构

```
Spring Boot App → Logstash → Elasticsearch → Kibana
```

---

### 4.2 Logback 配置

**logback-spring.xml**：
```xml
<configuration>
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- Logstash 输出 -->
    <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <destination>logstash:5000</destination>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"application":"${spring.application.name}"}</customFields>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="LOGSTASH" />
    </root>
</configuration>
```

---

### 4.3 Logstash 配置

**logstash.conf**：
```
input {
  tcp {
    port => 5000
    codec => json_lines
  }
}

filter {
  # 解析日志
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{DATA:thread}\] %{LOGLEVEL:level} %{DATA:logger} - %{GREEDYDATA:msg}" }
  }
  
  # 添加字段
  mutate {
    add_field => { "[@metadata][index]" => "logs-%{application}-%{+YYYY.MM.dd}" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index]}"
  }
}
```

---

## 5. 生产环境配置

### 5.1 环境配置

**application-prod.yml**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos.prod:8848
        namespace: prod
      config:
        server-addr: nacos.prod:8848
        namespace: prod
  
  datasource:
    url: jdbc:mysql://mysql-master:3306/cloud_db?useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 50
      minimum-idle: 10
      connection-timeout: 30000
  
  redis:
    host: redis-cluster
    password: ${REDIS_PASSWORD}
    cluster:
      nodes:
        - redis-node1:6379
        - redis-node2:6379
        - redis-node3:6379

logging:
  level:
    root: INFO
    com.example: INFO
  file:
    name: /app/logs/app.log
    max-size: 100MB
    max-history: 30

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
```

---

### 5.2 JVM 参数

**启动脚本**：
```bash
#!/bin/bash

# JVM 参数
JAVA_OPTS="-server"
JAVA_OPTS="$JAVA_OPTS -Xms2g -Xmx2g"  # 堆内存
JAVA_OPTS="$JAVA_OPTS -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m"  # 元空间
JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"  # 使用 G1 GC
JAVA_OPTS="$JAVA_OPTS -XX:MaxGCPauseMillis=200"  # GC 停顿时间目标
JAVA_OPTS="$JAVA_OPTS -XX:+HeapDumpOnOutOfMemoryError"  # OOM 时导出堆
JAVA_OPTS="$JAVA_OPTS -XX:HeapDumpPath=/app/logs/heapdump.hprof"
JAVA_OPTS="$JAVA_OPTS -XX:+PrintGCDetails -XX:+PrintGCDateStamps"  # GC 日志
JAVA_OPTS="$JAVA_OPTS -Xloggc:/app/logs/gc.log"

# 启动应用
java $JAVA_OPTS -jar /app/app.jar
```

---

## 6. 灰度发布

### 6.1 金丝雀发布（Canary）

**Kubernetes 配置**：
```yaml
# 稳定版本
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service-stable
spec:
  replicas: 9  # 90% 流量
  template:
    metadata:
      labels:
        app: user-service
        version: v1
    spec:
      containers:
      - name: user-service
        image: user-service:1.0.0

---
# 金丝雀版本
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service-canary
spec:
  replicas: 1  # 10% 流量
  template:
    metadata:
      labels:
        app: user-service
        version: v2
    spec:
      containers:
      - name: user-service
        image: user-service:1.0.1

---
# Service（同时指向两个版本）
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service  # 不区分 version
  ports:
  - port: 8001
```

**灰度策略**：
```
1. 部署金丝雀版本（10% 流量）
2. 观察指标（错误率、延迟）
3. 如果正常，逐步增加流量（20% → 50% → 100%）
4. 如果异常，立即回滚
```

---

## 7. 学习自检清单

- [ ] 掌握 Docker 容器化
- [ ] 能够编写 Dockerfile
- [ ] 掌握 Docker Compose
- [ ] 理解 Kubernetes 核心概念
- [ ] 能够部署微服务到 K8s
- [ ] 掌握滚动更新和回滚
- [ ] 了解 HPA 自动扩缩容
- [ ] 掌握 CI/CD 流程
- [ ] 了解日志收集（ELK）
- [ ] 掌握灰度发布策略

---

## 8. 面试高频题

**Q1：容器 vs 虚拟机？**

| 维度 | 容器 | 虚拟机 |
|------|------|--------|
| 启动速度 | 秒级 | 分钟级 |
| 资源占用 | 低 | 高 |
| 隔离性 | 进程级 | 操作系统级 |
| 性能 | 接近原生 | 有损耗 |

**Q2：Kubernetes 如何实现服务发现？**

**参考答案**：
1. Service 创建时，自动分配 ClusterIP
2. kube-dns/CoreDNS 创建 DNS 记录
3. Pod 通过 Service 名称访问（如：http://user-service:8001）
4. kube-proxy 实现负载均衡（iptables/IPVS）

**Q3：如何实现零停机部署？**

**参考答案**：
1. 滚动更新（RollingUpdate）
2. 配置健康检查（livenessProbe、readinessProbe）
3. 优雅停机（preStop hook）
4. 合理设置 maxSurge 和 maxUnavailable

---

**本章小结**：
- Docker 容器化：Dockerfile、Docker Compose
- Kubernetes 编排：Pod、Deployment、Service、Ingress
- 滚动更新：kubectl set image、回滚
- 自动扩缩容：HPA 基于 CPU/内存
- CI/CD：GitLab CI、Jenkins Pipeline
- 日志收集：Logstash → Elasticsearch → Kibana
- 生产配置：环境变量、JVM 参数
- 灰度发布：金丝雀发布、流量控制

**下一章预告**：第35章 - Spring Cloud 综合面试题
