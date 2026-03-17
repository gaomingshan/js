# Logstash 数据处理

Logstash 已在第41章详细介绍。本章补充高级特性和最佳实践。

## Logstash 架构

```
Input → Filter → Output

Input 插件：
- file、beats、kafka、redis、http、jdbc

Filter 插件：
- grok、mutate、date、json、csv、geoip

Output 插件：
- elasticsearch、file、kafka、redis
```

## 高级过滤器

### dissect 解析器

```ruby
filter {
  dissect {
    mapping => {
      "message" => "%{timestamp} %{+timestamp} [%{thread}] %{level} %{logger} - %{msg}"
    }
  }
}
```

### kv 键值对

```ruby
filter {
  kv {
    source => "message"
    field_split => "&"
    value_split => "="
  }
}
```

### ruby 脚本

```ruby
filter {
  ruby {
    code => "event.set('total', event.get('price') * event.get('quantity'))"
  }
}
```

## 多管道配置

```yaml
# pipelines.yml
- pipeline.id: logs
  path.config: "/etc/logstash/conf.d/logs.conf"
  pipeline.workers: 2
  
- pipeline.id: metrics
  path.config: "/etc/logstash/conf.d/metrics.conf"
  pipeline.workers: 1
```

## Logstash vs Ingest Pipeline

```
使用 Logstash：
✓ 复杂数据处理
✓ 多数据源聚合
✓ 外部服务调用
✓ 需要缓冲队列

使用 Ingest Pipeline：
✓ 简单字段处理
✓ 无需额外组件
✓ 性能要求高
```

## 总结

Logstash 是强大的数据处理引擎：
- 丰富的插件生态
- 灵活的数据转换
- 可靠的数据传输

详细配置见第41章。
