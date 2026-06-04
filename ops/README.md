# 中间件部署运维指南

> **目标**：系统化覆盖中间件的部署、运维、调优、故障排查  
> **部署环境**：裸机 / Docker / Docker Compose  
> **适合对象**：运维工程师、DevOps 工程师、后端开发工程师  
> **内容风格**：概述 → 部署 → 运维 → 调优 → 故障排查 → 参考资料

---

## 📚 中间件总览

```
数据库
├── [MySQL](./content/mysql.md)
├── [PostgreSQL](./content/postgresql.md)
├── [Oracle](./content/oracle.md)
├── [MongoDB](./content/mongodb.md)

缓存
├── [Redis](./content/redis.md)

对象存储
├── [MinIO](./content/minio.md)
├── [Ceph](./content/ceph.md)
├── [SeaweedFS](./content/seaweedfs.md)

消息队列
├── [RabbitMQ](./content/rabbitmq.md)
├── [Kafka](./content/kafka.md)
├── [RocketMQ](./content/rocketmq.md)
├── [EMQX](./content/emqx.md)
├── [Apache Pulsar](./content/pulsar.md)

微服务治理
├── [Nacos](./content/nacos.md)
├── [Consul](./content/consul.md)
├── [Zookeeper](./content/zookeeper.md)
├── [Seata](./content/seata.md)
├── [Sentinel](./content/sentinel.md)

流量入口 / 网关 / 代理
├── [Nginx](./content/nginx.md)
├── [APISIX](./content/apisix.md)
├── [Kong](./content/kong.md)
├── [Envoy](./content/envoy.md)

API 管理平台
├── [Torna](./content/torna.md)

可观测性（LGTM + Alloy）
├── [Grafana Alloy](./content/grafana-alloy.md)
├── [Prometheus](./content/prometheus.md)
├── [Loki](./content/loki.md)
├── [Tempo](./content/tempo.md)
├── [Grafana](./content/grafana.md)
├── [Mimir](./content/mimir.md)

搜索 / 分析
├── [Elasticsearch](./content/elasticsearch.md)
├── [OpenSearch](./content/opensearch.md)
├── [ClickHouse](./content/clickhouse.md)

调度系统
├── [XXL-JOB](./content/xxl-job.md)
├── [Quartz](./content/quartz.md)
├── [PowerJob](./content/powerjob.md)

工作流引擎
├── [Flowable](./content/flowable.md)
├── [Camunda](./content/camunda.md)

CI/CD & 制品仓库
├── [Jenkins](./content/jenkins.md)
├── [GitLab CI](./content/gitlab-ci.md)
├── [ArgoCD](./content/argocd.md)
├── [Harbor](./content/harbor.md)
├── [Nexus Repository](./content/nexus.md)
```

---

## 🗺️ 学习路线

```
数据库（MySQL/PG/Oracle/MongoDB）+ 缓存（Redis）
    ↓
对象存储（MinIO/Ceph/SeaweedFS）+ 消息队列（RabbitMQ/Kafka/RocketMQ/EMQX/Pulsar）
    ↓
微服务治理（Nacos/Consul/ZK/Seata/Sentinel）+ 流量入口（Nginx/APISIX/Kong/Envoy）
    ↓
可观测性（Alloy/Prometheus/Loki/Tempo/Grafana/Mimir）+ 搜索分析（ES/OpenSearch/ClickHouse）
    ↓
调度（XXL-JOB/Quartz/PowerJob）+ 工作流（Flowable/Camunda）+ CI/CD（Jenkins/GitLab CI/ArgoCD/Harbor/Nexus）
```

---

## 📋 每个文档统一结构

| 章节 | 内容 |
|------|------|
| **1. 概述** | 是什么、核心特性、适用场景、同类对比 |
| **2. 部署** | 裸机安装、Docker 部署、Docker Compose 部署、生产环境部署要点 |
| **3. 运维** | 日常操作、监控指标、备份恢复、版本升级 |
| **4. 调优** | 性能调优、容量规划、JVM 调优（如适用） |
| **5. 故障排查** | 常见故障、诊断工具、应急处理 |
| **6. 参考资料** | 官方文档、推荐阅读、社区资源 |

---

## ⚠️ 质量要求

- 部署命令和配置文件**可直接复制运行**
- 调优参数给出**具体数值建议**
- 故障排查给出**从现象到根因的完整链路**
- 不仅说怎么做，还说**为什么这么做**

---

**开始阅读** → [MySQL 部署运维指南](./content/mysql.md)
