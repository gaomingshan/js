# XXL-JOB 部署运维指南

> **定位**：大众点评开源的分布式任务调度平台
> **适用场景**：定时任务调度、分布式任务、任务编排、任务监控
> **难度级别**：⭐ 低

---

## 1. 概述

### 1.1 是什么

XXL-JOB 是开源的分布式任务调度平台，采用"调度中心 + 执行器"架构，调度中心负责任务管理和触发，执行器负责任务执行，支持 GLUE 模式在线编辑代码。

### 1.2 核心架构

```
调度中心（Admin）→ 触发任务 → 执行器（Executor）→ 执行 → 回调结果
      ↓
   MySQL（任务/日志存储）
```

### 1.3 适用场景

**最佳适用**：定时任务调度、分布式任务、任务编排、任务监控

**不适用**：实时流处理（→ Flink）、复杂 DAG 工作流（→ Airflow/DolphinScheduler）

---

## 2. 部署

### 2.1 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  xxl-job-admin:
    image: xuxueli/xxl-job-admin:2.4.2
    container_name: xxl-job-admin
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      PARAMS: "--spring.datasource.url=jdbc:mysql://xxl-job-mysql:3306/xxl_job?useSSL=false&characterEncoding=utf8 --spring.datasource.username=xxljob --spring.datasource.password=XxlJob!Pass --xxl.job.accessToken=XXLJobAccessToken2024"
    depends_on:
      - xxl-job-mysql
    networks:
      - xxl-net

  xxl-job-mysql:
    image: mysql:8.0
    container_name: xxl-job-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: XxlJobMySQL!Pass
      MYSQL_DATABASE: xxl_job
      MYSQL_USER: xxljob
      MYSQL_PASSWORD: XxlJob!Pass
    volumes:
      - xxl-mysql-data:/var/lib/mysql
    networks:
      - xxl-net

volumes:
  xxl-mysql-data:

networks:
  xxl-net:
    driver: bridge
```

### 2.2 执行器接入

```xml
<dependency>
    <groupId>com.xuxueli</groupId>
    <artifactId>xxl-job-core</artifactId>
    <version>2.4.2</version>
</dependency>
```

```yaml
# application.yml
xxl:
  job:
    admin:
      addresses: http://xxl-job-admin:8080/xxl-job-admin
    accessToken: XXLJobAccessToken2024
    executor:
      appname: order-executor
      port: 9999
      logpath: /data/logs/xxl-job
```

---

## 3. 配置

调度中心通过 Web UI 管理任务，关键配置项：

| 配置 | 说明 |
|------|------|
| 执行器 | 注册执行器 AppName 和地址 |
| 任务 | CRON 表达式 + 执行模式 + 失败策略 |
| GLUE 模式 | 在线编辑任务代码（Java/Shell/Python） |
| 阻塞策略 | 单机串行/丢弃后续/覆盖之前 |
| 路由策略 | 轮询/随机/一致性哈希/故障转移 |

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `accessToken` | 通信令牌 | 强密码 | 防止未授权执行器注册 |
| 阻塞策略 | 任务并发策略 | 单机串行 | 防止任务重叠执行 |
| 调度线程数 | 调度并发 | 30 | 调度中心触发任务的线程数 |

---

## 5. 运维

```bash
# 备份
mysqldump -u xxljob -p xxl_job > xxl_job_backup.sql

# 日志
# 执行器日志：/data/logs/xxl-job/
# 调度中心日志：容器日志
```

---

## 7. 参考资料

- [XXL-JOB Documentation](https://www.xuxueli.com/xxl-job/)
- [XXL-JOB GitHub](https://github.com/xuxueli/xxl-job)
