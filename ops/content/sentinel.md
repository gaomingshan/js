# Sentinel 部署运维指南

> **定位**：阿里开源的流量防护组件，面向分布式服务架构
> **适用场景**：限流、熔断、系统保护、热点参数限流
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Sentinel 是阿里开源的流量防护组件，以流量为切入点，提供限流、熔断降级、系统负载保护、热点限流等能力，支持 Dashboard 实时监控和规则动态推送。

### 1.2 核心概念

| 概念 | 说明 |
|------|------|
| **资源** | 被保护的对象（接口/方法/代码块） |
| **规则** | 流控/熔断/系统/热点规则 |
| **Slot Chain** | 责任链模式处理链（统计→限流→熔断→日志） |
| **Dashboard** | 可视化监控和规则管理 |

### 1.3 适用场景

**最佳适用**：接口限流、服务熔断降级、系统负载保护、热点参数限流

**不适用**：网关层限流（→ APISIX/Nginx）、全局限流（→ Redis + Lua）

---

## 2. 部署

### 2.1 Dashboard 部署

```bash
# 下载
wget https://github.com/alibaba/Sentinel/releases/download/1.8.7/sentinel-dashboard-1.8.7.jar

# 启动
java -jar sentinel-dashboard-1.8.7.jar \
  --server.port=8080 \
  --auth.username=sentinel \
  --auth.password=Sentinel!Pass
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name sentinel-dashboard \
  -p 8080:8080 \
  -e AUTH_USERNAME=sentinel \
  -e AUTH_PASSWORD=Sentinel!Pass \
  --restart unless-stopped \
  bladex/sentinel-dashboard:1.8.7
```

### 2.3 客户端接入

**Maven 依赖**：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-core</artifactId>
    <version>1.8.7</version>
</dependency>
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
    <version>1.8.7</version>
</dependency>
```

**启动参数**：

```bash
-Dcsp.sentinel.dashboard.server=dashboard:8080
-Dcsp.sentinel.api.port=8719
-Dproject.name=order-service
```

---

## 3. 配置文件

### 3.1 规则配置方式

| 方式 | 持久化 | 推送 | 适用 |
|------|--------|------|------|
| **原始模式** | 内存 | 无 | 开发测试 |
| **Pull 模式** | 文件/DB | 定时拉取 | 简单场景 |
| **Push 模式** | Nacos/ZooKeeper/Apollo | 实时推送 | **生产推荐** |

### 3.2 生产环境规则配置（Nacos 推送）

```yaml
# Nacos 中 Sentinel 规则配置示例
# dataId: ${appName}-flow-rules
# group: SENTINEL_GROUP

[
  {
    "resource": "GET:/api/orders",
    "limitApp": "default",
    "grade": 1,
    "count": 100,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
  }
]
# grade: 1=QPS限流 2=线程数限流
# count: 阈值
# controlBehavior: 0=直接拒绝 2=匀速排队 3=冷启动
```

### 3.3 Dashboard 配置

```properties
# application.properties — Dashboard 生产配置
server.port=8080

# 认证
auth.username=sentinel
auth.password=Sentinel!Pass

# 规则持久化（Nacos）
nacos.serverAddr=nacos:8848
nacos.namespace=prod
nacos.groupId=SENTINEL_GROUP
```

---

## 4. 调优

### 4.1 限流子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `grade` | 限流模式 | QPS（1） | QPS 限流适合读接口；线程数限流适合慢调用接口 |
| `count` | 阈值 | 按压测结果 | 设为压测峰值的 80%，留余量 |
| `controlBehavior` | 流控效果 | 直接拒绝（0） | 匀速排队（2）适合削峰填谷；冷启动（3）适合突发流量 |

### 4.2 熔断子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| 熔断策略 | 触发条件 | 慢调用比例 | 慢调用比例适合依赖外部服务；异常比例适合自身逻辑 |
| 慢调用 RT | 慢调用阈值 | 1s | 超过此时间视为慢调用 |
| 比例阈值 | 触发比例 | 50% | 慢调用/异常占比超过此值触发熔断 |
| 恢复超时 | 熔断恢复 | 5s | 熔断后等待 5s 尝试半开 |

### 4.3 容量规划

| 规模 | Dashboard | 规则数 | 接入服务数 |
|------|-----------|--------|-----------|
| 小型 | 1 | < 100 | < 10 |
| 中型 | 1（HA） | 100-1000 | 10-50 |
| 大型 | 2+ | 1000+ | 50+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 查看规则
curl http://service:8719/getRules?type=flow

# 修改规则（通过 Dashboard 或 Nacos）
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **通过 QPS** | Dashboard | 接近限流阈值 |
| **拒绝 QPS** | Dashboard | > 0（持续） |
| **熔断状态** | Dashboard | 有熔断 |
| **RT** | Dashboard | P99 > 阈值 |

### 5.3 备份与恢复

```bash
# 规则备份：导出 Nacos 中 SENTINEL_GROUP 的规则配置
# Dashboard 无需备份（无状态）
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：Dashboard 看不到服务

**排查**：检查客户端 `csp.sentinel.dashboard.server` 配置 → 检查 8719 端口连通 → 检查心跳

#### 故障 2：规则不生效

**排查**：检查资源名是否匹配 → 检查规则推送是否成功 → 检查客户端日志

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| Dashboard | `:8080` 可视化 |
| 客户端 API | `:8719` |
| 日志 | `~/logs/csp/` |

---

## 7. 参考资料

- [Sentinel Documentation](https://sentinelguard.io/zh-cn/docs/introduction.html)
- [Sentinel Dashboard](https://sentinelguard.io/zh-cn/docs/dashboard.html)
- [Sentinel 规则持久化](https://sentinelguard.io/zh-cn/docs/dynamic-rule-configuration.html)
