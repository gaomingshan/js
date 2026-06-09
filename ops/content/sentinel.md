# Sentinel 部署指南

> 版本：1.8.7 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| JDK | JDK 8+ |
| 端口 | 8080（Dashboard）、8719（客户端 API） |
| 内存 | Dashboard ≥ 512M |

## 2. 裸机安装（通用）

```bash
wget https://github.com/alibaba/Sentinel/releases/download/1.8.7/sentinel-dashboard-1.8.7.jar
```

## 3. 单机部署

**适用场景**：Dashboard 监控 + 规则管理

### 3.1 配置

启动参数全部通过命令行 `--key=value` 或环境变量传递。

### 3.2 启动

```bash
java -jar sentinel-dashboard-1.8.7.jar \
  --server.port=8080 \
  --sentinel.dashboard.auth.username=sentinel \
  --sentinel.dashboard.auth.password=Sentinel!Pass
```

### 3.3 验证

```bash
# 访问 Dashboard
curl -s http://127.0.0.1:8080/ -o /dev/null -w "%{http_code}"
# 预期 302（跳转登录页）
```

### 3.4 Docker Compose

```yaml
services:
  sentinel-dashboard:
    image: bladex/sentinel-dashboard:1.8.7
    container_name: sentinel-dashboard
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      SENTINEL_DASHBOARD_AUTH_USERNAME: sentinel
      SENTINEL_DASHBOARD_AUTH_PASSWORD: Sentinel!Pass
      JVM_OPTS: "-Xms256m -Xmx512m"
```

## 4. 生产部署

**适用场景**：生产环境，规则 Nacos 持久化

### 4.1 配置（Nacos 持久化 + 认证）

```bash
java -jar sentinel-dashboard-1.8.7.jar \
  --server.port=8080 \
  --auth.enabled=true \
  --sentinel.dashboard.auth.username=sentinel \
  --sentinel.dashboard.auth.password=Sentinel!Pass \
  --nacos.server-addr=nacos:8848 \
  --nacos.namespace=prod \
  --nacos.groupId=SENTINEL_GROUP
```

> 参数说明：
> - `--auth.enabled=true`：启用认证
> - `--sentinel.dashboard.auth.username/password`：登录用户名/密码
> - `--nacos.server-addr`：Nacos 地址
> - `--nacos.namespace`：Nacos 命名空间
> - `--nacos.groupId`：规则配置分组
>
> 规则持久化使用客户端 `sentinel-datasource-nacos` 扩展，Dashboard 只做展示和推送触发，规则实际存储在 Nacos 中。

### 4.2 客户端接入

**Maven 依赖：**

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
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
    <version>1.8.7</version>
</dependency>
```

**启动参数：**

```bash
-Dcsp.sentinel.dashboard.server=dashboard:8080
-Dcsp.sentinel.api.port=8719
-Dproject.name=order-service
```

### 4.3 Nacos 规则配置示例

```json
// dataId: order-service-flow-rules
// group: SENTINEL_GROUP
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
```

### 4.4 验证

```bash
curl -s http://127.0.0.1:8080/ -o /dev/null -w "%{http_code}"
# 浏览器访问 :8080，使用 sentinel/Sentinel!Pass 登录

# 查看客户端规则
curl http://service:8719/getRules?type=flow
```

## 5. 运维速查

```bash
# 查看流控规则
curl http://service:8719/getRules?type=flow

# 查看熔断规则
curl http://service:8719/getRules?type=degrade

# 查看热点规则
curl http://service:8719/getRules?type=param-flow

# 查看系统规则
curl http://service:8719/getRules?type=system

# 查看日志
tail -f ~/logs/csp/sentinel-record.log

# Dashboard 无状态，无需备份；规则备份请导出 Nacos 中 SENTINEL_GROUP 的配置
```

## 6. 常见故障

**Dashboard 看不到服务**：检查客户端 `csp.sentinel.dashboard.server` 配置 → 检查 8719 端口连通性 → 检查心跳日志

**规则不生效**：检查资源名是否匹配 → 检查规则推送是否成功（Nacos 侧） → 检查客户端 `sentinel-datasource-nacos` 依赖是否存在

**登录失败**：检查 `auth.enabled=true` 是否设置 → 检查 `sentinel.dashboard.auth.username/password` 参数格式（全小写，下划线分隔）
