# Beats 数据采集

Beats 数据采集已在第41章详细介绍了 Filebeat。本章补充其他 Beats 组件的使用。

## Beats 家族

```
Filebeat：日志文件采集（详见第41章）
Metricbeat：系统和服务指标
Packetbeat：网络数据包
Heartbeat：服务可用性监控
Auditbeat：审计数据
Winlogbeat：Windows 事件日志
Functionbeat：无服务器数据采集
```

## Metricbeat 系统指标

### 安装配置

```yaml
# metricbeat.yml
metricbeat.config.modules:
  path: ${path.config}/modules.d/*.yml
  reload.enabled: true

metricbeat.modules:
  - module: system
    period: 10s
    metricsets:
      - cpu
      - memory
      - network
      - filesystem
    
  - module: docker
    period: 10s
    hosts: ["unix:///var/run/docker.sock"]
    
  - module: redis
    period: 10s
    hosts: ["localhost:6379"]

output.elasticsearch:
  hosts: ["localhost:9200"]
```

### 常用模块

```
system：系统指标（CPU、内存、磁盘）
docker：容器指标
kubernetes：K8s 指标
redis：Redis 指标
mysql：MySQL 指标
nginx：Nginx 指标
elasticsearch：ES 指标
```

## Packetbeat 网络采集

### 配置

```yaml
# packetbeat.yml
packetbeat.interfaces.device: any

packetbeat.protocols:
  - type: http
    ports: [80, 8080, 8000, 5000, 8002]
  
  - type: mysql
    ports: [3306]
  
  - type: redis
    ports: [6379]

output.elasticsearch:
  hosts: ["localhost:9200"]
```

## Heartbeat 可用性监控

### 配置

```yaml
# heartbeat.yml
heartbeat.monitors:
  - type: http
    schedule: '@every 10s'
    urls: ["http://example.com"]
    
  - type: tcp
    schedule: '@every 10s'
    hosts: ["localhost:9200"]
    
  - type: icmp
    schedule: '@every 10s'
    hosts: ["8.8.8.8"]

output.elasticsearch:
  hosts: ["localhost:9200"]
```

## Auditbeat 审计采集

### 配置

```yaml
# auditbeat.yml
auditbeat.modules:
  - module: file_integrity
    paths:
      - /bin
      - /usr/bin
      - /etc
    
  - module: system
    datasets:
      - host
      - login
      - package
      - process
      - socket
      - user

output.elasticsearch:
  hosts: ["localhost:9200"]
```

## Beats 优化

### 性能优化

```yaml
queue.mem:
  events: 4096
  flush.min_events: 512
  flush.timeout: 1s

output.elasticsearch:
  hosts: ["localhost:9200"]
  bulk_max_size: 1000
  worker: 2
```

## 总结

Beats 提供了完整的数据采集方案：
- Filebeat：日志（详见第41章）
- Metricbeat：指标
- Packetbeat：网络
- Heartbeat：监控
- Auditbeat：审计

配置简单，性能优秀，与 ELK Stack 无缝集成。
