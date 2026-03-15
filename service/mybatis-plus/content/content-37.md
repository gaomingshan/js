# 17.2 SQL 日志管理

## 概述

SQL 日志是排查问题和性能优化的重要依据。本节介绍 SQL 日志的配置、管理和分析方法。

**核心内容：**
- 日志配置
- SQL 日志输出
- 慢查询日志
- 日志分析

---

## 日志配置

### Logback 配置

```xml
<!-- logback-spring.xml -->
<configuration>
    <!-- SQL 日志 -->
    <logger name="com.example.mapper" level="DEBUG"/>
    
    <!-- MyBatis Plus 日志 -->
    <logger name="com.baomidou.mybatisplus" level="DEBUG"/>
    
    <!-- 数据库连接池日志 -->
    <logger name="com.zaxxer.hikari" level="DEBUG"/>
</configuration>
```

### MyBatis Plus 配置

```yaml
mybatis-plus:
  configuration:
    # SQL 日志输出
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

---

## 使用 p6spy

```properties
# spy.properties
appender=com.p6spy.engine.spy.appender.Slf4JLogger
logMessageFormat=com.baomidou.mybatisplus.extension.p6spy.P6SpyLogger
excludecategories=info,debug,result,commit,resultset
dateformat=yyyy-MM-dd HH:mm:ss
outagedetection=true
outagedetectioninterval=2
```

---

## 关键点总结

1. **日志级别**：开发环境 DEBUG，生产环境 WARN
2. **p6spy**：美化 SQL 输出，显示执行时间
3. **慢查询**：记录超过阈值的 SQL
4. **日志分析**：定期分析慢查询日志
5. **性能监控**：监控 SQL 执行时间
6. **安全性**：脱敏敏感数据
7. **归档清理**：定期清理历史日志

---

## 参考资料

- [p6spy](https://github.com/p6spy/p6spy)
- [Logback](http://logback.qos.ch/)
