# PowerJob 部署运维指南

> **定位**：新一代分布式任务调度与计算框架
> **适用场景**：定时调度、MapReduce 计算、工作流编排、容器部署
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

PowerJob 是开源的分布式任务调度与计算框架，支持定时调度、MapReduce 分布式计算、工作流（DAG）编排、容器部署，相比 XXL-JOB 功能更丰富。

### 1.2 与 XXL-JOB 对比

| 维度 | PowerJob | XXL-JOB |
|------|----------|---------|
| **工作流** | DAG 编排 | 无 |
| **MapReduce** | 原生支持 | 无 |
| **容器部署** | 支持 | 不支持 |
| **在线 IDE** | 支持 | GLUE 模式 |
| **处理器** | Java/Shell/HTTP | Java/Shell/Python |

### 1.3 适用场景

**最佳适用**：定时调度 + MapReduce 计算、DAG 工作流、容器化任务

**不适用**：实时流处理（→ Flink）、简单定时任务（→ XXL-JOB 更轻量）

---

## 2. 部署

### 2.1 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  powerjob-server:
    image: tjqq/powerjob-server:4.3.9
    container_name: powerjob-server
    restart: unless-stopped
    ports:
      - "7700:7700"
      - "10086:10086"
    environment:
      PARAMS: "--spring.datasource.core.url=jdbc:mysql://powerjob-mysql:3306/powerjob?useSSL=false --spring.datasource.core.username=powerjob --spring.datasource.core.password=PowerJob!Pass --oms.akka.port=10086"
    depends_on:
      - powerjob-mysql
    networks:
      - pj-net

  powerjob-mysql:
    image: mysql:8.0
    container_name: powerjob-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: PowerJobMySQL!Pass
      MYSQL_DATABASE: powerjob
      MYSQL_USER: powerjob
      MYSQL_PASSWORD: PowerJob!Pass
    volumes:
      - pj-mysql-data:/var/lib/mysql
    networks:
      - pj-net

volumes:
  pj-mysql-data:

networks:
  pj-net:
    driver: bridge
```

---

## 3. 配置

通过 Web UI 管理，关键配置：

| 配置 | 说明 |
|------|------|
| 应用 | 注册执行器应用 |
| 任务 | CRON + 处理器类型 + 参数 |
| 工作流 | DAG 编排多任务 |
| 容器 | 任务运行在独立容器 |

---

## 5. 运维

```bash
# 备份
mysqldump -u powerjob -p powerjob > powerjob_backup.sql
```

---

## 7. 参考资料

- [PowerJob Documentation](https://www.yuque.com/powerjob/guidence)
- [PowerJob GitHub](https://github.com/PowerJob/PowerJob)
