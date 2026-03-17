# 告警策略设计

合理的告警策略避免告警疲劳和漏报。本章介绍告警策略设计方法。

## 1. 告警分级

| 级别 | 响应时间 | 通知方式 | 示例 |
|------|---------|---------|------|
| P0 | 5分钟 | 电话+短信+钉钉 | 集群不可用、大量消息丢失 |
| P1 | 15分钟 | 短信+钉钉 | Broker宕机、磁盘满 |
| P2 | 1小时 | 钉钉+邮件 | 消费Lag过高、磁盘使用率>80% |
| P3 | 次日 | 邮件 | 性能波动、配置变更 |

## 2. Prometheus 告警规则

```yaml
# kafka-alerts.yml
groups:
  - name: kafka_alerts
    interval: 30s
    rules:
      # P0：集群不可用
      - alert: KafkaClusterDown
        expr: up{job="kafka"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Kafka集群不可用"
          description: "Kafka Broker {{ $labels.instance }} 已宕机超过1分钟"
      
      # P1：消息堆积严重
      - alert: KafkaConsumerLagCritical
        expr: kafka_consumergroup_lag > 100000
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "消费Lag严重"
          description: "消费组 {{ $labels.consumergroup }} Topic {{ $labels.topic }} Lag超过10万"
      
      # P2：消费Lag较高
      - alert: KafkaConsumerLagHigh
        expr: kafka_consumergroup_lag > 10000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "消费Lag较高"
          description: "消费组 {{ $labels.consumergroup }} Lag超过1万"
      
      # P1：磁盘使用率高
      - alert: KafkaDiskUsageHigh
        expr: (kafka_log_log_size / disk_total) > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "磁盘使用率超过90%"
      
      # P1：未充分复制的分区
      - alert: KafkaUnderReplicatedPartitions
        expr: kafka_server_replicamanager_underreplicatedpartitions > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "存在未充分复制的分区"
          description: "Broker {{ $labels.instance }} 有 {{ $value }} 个未充分复制的分区"
```

## 3. AlertManager 配置

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      continue: true
    
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://alertmanager-webhook:8060/dingtalk'
  
  - name: 'critical'
    webhook_configs:
      - url: 'http://alertmanager-webhook:8060/dingtalk'
    email_configs:
      - to: 'oncall@example.com'
        headers:
          Subject: '[P0告警] {{ .GroupLabels.alertname }}'
  
  - name: 'warning'
    webhook_configs:
      - url: 'http://alertmanager-webhook:8060/dingtalk'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

## 4. 钉钉机器人告警

```python
# dingtalk_webhook.py
import requests
import json

def send_dingtalk(alert):
    webhook_url = "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN"
    
    message = {
        "msgtype": "markdown",
        "markdown": {
            "title": f"[{alert['labels']['severity']}] {alert['labels']['alertname']}",
            "text": f"""
### {alert['labels']['alertname']}
- **级别**: {alert['labels']['severity']}
- **实例**: {alert['labels']['instance']}
- **描述**: {alert['annotations']['description']}
- **时间**: {alert['startsAt']}
            """
        }
    }
    
    response = requests.post(webhook_url, json=message)
    return response.status_code == 200
```

## 5. 告警收敛

**时间收敛**：
```yaml
# 同一告警12小时内只发送一次
repeat_interval: 12h
```

**分组收敛**：
```yaml
# 相同cluster的告警聚合
group_by: ['alertname', 'cluster']
group_wait: 10s
group_interval: 10s
```

**抑制规则**：
```yaml
# P0告警触发时，抑制P2告警
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
```

## 6. 告警处理流程

```
告警触发
    ↓
自动通知（钉钉/短信/电话）
    ↓
值班人员确认
    ↓
执行预案
    ↓
问题解决
    ↓
告警恢复
    ↓
复盘总结
```

## 关键要点
1. **分级告警**：P0-P3，不同级别不同处理
2. **告警收敛**：避免告警风暴
3. **多渠道通知**：钉钉+短信+电话
4. **自动化**：Prometheus + AlertManager
5. **定期review**：调整告警阈值

## 参考资料
1. [Prometheus Alerting](https://prometheus.io/docs/alerting/latest/overview/)
2. [AlertManager Configuration](https://prometheus.io/docs/alerting/latest/configuration/)
