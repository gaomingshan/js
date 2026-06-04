# Flowable 部署运维指南

> **定位**：开源 BPM 工作流引擎，BPMN 2.0 实现
> **适用场景**：审批流程、业务流程自动化、BPMN/CMMN/DMN 建模
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Flowable 是开源的 BPM 工作流引擎，完整实现 BPMN 2.0（业务流程）、CMMN（案例管理）、DMN（决策表）规范，从 Activiti 分支而来。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **BPMN 2.0** | 完整业务流程建模与执行 |
| **CMMN** | 案例管理模型 |
| **DMN** | 决策表引擎 |
| **Flowable UI** | 流程建模器/任务管理/管理控制台 |
| **REST API** | 完整的 REST 接口 |
| **Spring Boot** | 原生集成 |

### 1.3 适用场景

**最佳适用**：审批流程、业务流程自动化、OA 系统、合规流程

**不适用**：简单定时任务（→ XXL-JOB）、实时事件流（→ Flink）

---

## 2. 部署

### 2.1 Spring Boot 集成（推荐）

```xml
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter</artifactId>
    <version>7.1.0</version>
</dependency>
```

```yaml
# application.yml
flowable:
  database-schema-update: true
  async-executor-activate: true
  history-level: full
  # 数据源（共享应用数据库）
  # spring.datasource.*
```

### 2.2 Docker Compose 部署（Flowable UI）

```yaml
# docker-compose.yml
version: '3.8'

services:
  flowable:
    image: flowable/all-in-one:7.1.0
    container_name: flowable
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      FLOWABLE_DATASOURCE_URL: jdbc:mysql://flowable-mysql:3306/flowable?useSSL=false
      FLOWABLE_DATASOURCE_USERNAME: flowable
      FLOWABLE_DATASOURCE_PASSWORD: Flowable!Pass
      FLOWABLE_ASYNC_EXECUTOR_ENABLE: "true"
    depends_on:
      - flowable-mysql
    networks:
      - flow-net

  flowable-mysql:
    image: mysql:8.0
    container_name: flowable-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: FlowableMySQL!Pass
      MYSQL_DATABASE: flowable
      MYSQL_USER: flowable
      MYSQL_PASSWORD: Flowable!Pass
    volumes:
      - flow-mysql-data:/var/lib/mysql
    networks:
      - flow-net

volumes:
  flow-mysql-data:

networks:
  flow-net:
    driver: bridge
```

---

## 3. 配置

### 3.2 生产环境配置

```yaml
# application.yml — 生产环境

flowable:
  # === 数据库 ===
  database-schema-update: false    # 生产禁止自动更新 Schema
  # 逻辑：自动更新可能导致 Schema 不一致
  # 生产应使用 Flyway/Liquibase 管理 Schema

  # === 异步执行器 ===
  async-executor-activate: true
  async-executor-core-pool-size: 8
  async-executor-max-pool-size: 32
  async-executor-queue-size: 100
  # 逻辑：异步任务（定时器/异步服务任务）由线程池执行
  # 核心线程 = CPU 核数，最大线程 = CPU × 4

  # === 历史级别 ===
  history-level: full              # audit/full
  # 逻辑：full 记录所有活动实例和表单属性
  # audit 记录较少但存储量小
  # none 不记录历史（不推荐）

  # === 引擎配置 ===
  process-definition-cache-limit: 256
  # 逻辑：缓存已部署的流程定义，减少数据库查询

spring:
  datasource:
    url: jdbc:mysql://mysql:3306/flowable
    username: flowable
    password: Flowable!Pass
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `async-executor-core-pool-size` | 异步线程核心 | 8 | 处理定时器和异步任务的线程数 |
| `history-level` | 历史级别 | full | full 最全但存储大；audit 折中 |
| `process-definition-cache-limit` | 流程定义缓存 | 256 | 减少数据库查询 |

---

## 5. 运维

```bash
# 备份
mysqldump -u flowable -p flowable > flowable_backup.sql

# 流程部署
# Flowable UI → Modeler → 建模 → 部署
# 或 REST API: POST /repository/deployments
```

---

## 7. 参考资料

- [Flowable Documentation](https://www.flowable.com/open-source/docs/)
- [Flowable Spring Boot](https://www.flowable.com/open-source/docs/bpmn/ch05a-Spring-Boot)
- [Flowable GitHub](https://github.com/flowable/flowable-engine)
