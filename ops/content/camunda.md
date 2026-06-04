# Camunda 部署运维指南

> **定位**：开源 BPM 工作流引擎，BPMN 2.0 + DMN 实现
> **适用场景**：业务流程自动化、微服务编排、审批流程、决策引擎
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Camunda 是开源的 BPM 工作流引擎，实现 BPMN 2.0（流程）和 DMN（决策表），以"开发者友好"著称，提供强大的 REST API 和外部任务模式。

### 1.2 与 Flowable 对比

| 维度 | Camunda | Flowable |
|------|---------|----------|
| **定位** | 开发者友好 | 全功能 BPM |
| **CMMN** | 不支持 | 支持 |
| **外部任务** | 原生支持 | 不支持 |
| **决策引擎** | DMN 1.1/1.2 | DMN 1.1 |
| **社区** | 活跃 | 活跃 |

### 1.3 适用场景

**最佳适用**：微服务编排、外部任务模式、开发者友好的工作流

**不适用**：全功能 BPM 平台（→ Flowable）、简单定时任务（→ XXL-JOB）

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name camunda \
  -p 8080:8080 \
  -e CAMUNDA_BPM_ADMIN_PASSWORD=Camunda!Pass \
  -v camunda-data:/camunda \
  --restart unless-stopped \
  camunda/camunda-bpm-platform:run-7.21
```

### 2.2 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  camunda:
    image: camunda/camunda-bpm-platform:run-7.21
    container_name: camunda
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      CAMUNDA_BPM_DATABASE_TYPE: mysql
      SPRING_DATASOURCE_URL: jdbc:mysql://camunda-mysql:3306/camunda?useSSL=false
      SPRING_DATASOURCE_USERNAME: camunda
      SPRING_DATASOURCE_PASSWORD: Camunda!Pass
      CAMUNDA_BPM_ADMIN_PASSWORD: Camunda!Pass
    depends_on:
      - camunda-mysql
    networks:
      - camunda-net

  camunda-mysql:
    image: mysql:8.0
    container_name: camunda-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: CamundaMySQL!Pass
      MYSQL_DATABASE: camunda
      MYSQL_USER: camunda
      MYSQL_PASSWORD: Camunda!Pass
    volumes:
      - camunda-mysql-data:/var/lib/mysql
    networks:
      - camunda-net

volumes:
  camunda-mysql-data:

networks:
  camunda-net:
    driver: bridge
```

---

## 3. 配置

### 3.2 生产环境配置

```yaml
# application.yml — 生产环境（Spring Boot 集成）

camunda.bpm:
  admin-user:
    id: admin
    password: Camunda!Pass
  filter:
    create: All
  # === 历史级别 ===
  history-level: full
  # 逻辑：full 记录完整历史，audit 折中，none 不记录

  # === 作业执行器 ===
  job-execution:
    enabled: true
    core-pool-size: 8
    max-pool-size: 32
    queue-capacity: 100
  # 逻辑：异步任务由线程池执行
  # 外部任务模式不需要大线程池

spring:
  datasource:
    url: jdbc:mysql://mysql:3306/camunda
    username: camunda
    password: Camunda!Pass
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `history-level` | 历史级别 | full | full 最全但存储大 |
| `core-pool-size` | 作业线程 | 8 | 异步任务执行线程 |
| 外部任务锁时长 | 外部任务锁定 | PT5M | 防止任务被重复领取 |

---

## 5. 运维

```bash
# REST API
# 部署流程: POST /engine/default/process-definition
# 启动实例: POST /engine/default/process-definition/key/{key}/start
# 查询任务: GET /engine/default/task
# 完成任务: POST /engine/default/task/{id}/complete

# 备份
mysqldump -u camunda -p camunda > camunda_backup.sql
```

---

## 7. 参考资料

- [Camunda Documentation](https://docs.camunda.org/)
- [Camunda REST API](https://docs.camunda.org/rest/camunda/7.21/)
- [Camunda GitHub](https://github.com/camunda/camunda-bpm-platform)
