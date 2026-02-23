# 第 8 章：自动配置类编写规范

## 本章概述

掌握如何编写符合 Spring Boot 规范的自动配置类，包括命名规范、结构设计、排序控制等最佳实践。

**学习目标：**
- 掌握自动配置类的标准结构
- 理解 @AutoConfigureAfter/@Before 的作用
- 掌握 @AutoConfigureOrder 排序规则
- 学会编写高质量的自动配置类

---

## 8.1 自动配置类结构

### 标准模板

```java
@AutoConfiguration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
@EnableConfigurationProperties(DataSourceProperties.class)
@Import({DataSourcePoolMetadataProvidersConfiguration.class})
@AutoConfigureBefore(HibernateJpaAutoConfiguration.class)
@AutoConfigureAfter(JndiDataSourceAutoConfiguration.class)
public class DataSourceAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
```

**核心注解：**
1. `@AutoConfiguration` (Spring Boot 3.x) 或 `@Configuration` (2.x)
2. `@ConditionalOnClass` - 类路径条件
3. `@ConditionalOnMissingBean` - Bean 缺失条件
4. `@EnableConfigurationProperties` - 启用配置属性
5. `@AutoConfigureBefore/After` - 排序控制

---

## 8.2 命名规范

### 类名规范

```
功能名 + AutoConfiguration
```

**示例：**
- `DataSourceAutoConfiguration`
- `RedisAutoConfiguration`
- `RabbitAutoConfiguration`

### 包结构规范

```
org.springframework.boot.autoconfigure.{功能模块}
```

**示例：**
- `org.springframework.boot.autoconfigure.jdbc`
- `org.springframework.boot.autoconfigure.data.redis`
- `org.springframework.boot.autoconfigure.amqp`

---

## 8.3 配置类排序

### @AutoConfigureOrder

```java
@AutoConfiguration
@AutoConfigureOrder(100)  // 数字越小优先级越高
public class MyAutoConfiguration {
}
```

### @AutoConfigureBefore

```java
@AutoConfiguration
@AutoConfigureBefore(JpaRepositoriesAutoConfiguration.class)
public class DataSourceAutoConfiguration {
    // 在 JPA 配置之前执行
}
```

### @AutoConfigureAfter

```java
@AutoConfiguration
@AutoConfigureAfter(DataSourceAutoConfiguration.class)
public class HibernateJpaAutoConfiguration {
    // 在 DataSource 配置之后执行
}
```

### 排序规则

```
1. @AutoConfigureOrder 指定的顺序
2. @AutoConfigureBefore 指定在某配置之前
3. @AutoConfigureAfter 指定在某配置之后
4. 类名字母顺序（默认）
```

---

## 8.4 配置属性绑定

### 创建 Properties 类

```java
@ConfigurationProperties(prefix = "spring.datasource")
public class DataSourceProperties {
    
    private String url;
    private String username;
    private String password;
    private String driverClassName;
    
    // Getters and Setters
    
    public DataSourceBuilder<?> initializeDataSourceBuilder() {
        return DataSourceBuilder.create()
                .url(this.url)
                .username(this.username)
                .password(this.password)
                .driverClassName(this.driverClassName);
    }
}
```

### 在自动配置中启用

```java
@AutoConfiguration
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    
    @Bean
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
```

---

## 8.5 条件注解使用

### 常用条件注解

```java
@AutoConfiguration
@ConditionalOnClass(RedisOperations.class)              // 类存在
@ConditionalOnMissingBean(RedisTemplate.class)          // Bean 不存在
@ConditionalOnProperty(name = "spring.redis.enabled",   // 属性匹配
                       havingValue = "true", 
                       matchIfMissing = true)
@ConditionalOnWebApplication(type = Type.SERVLET)       // Web 应用
public class RedisAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean(name = "redisTemplate")
    public RedisTemplate<Object, Object> redisTemplate(
            RedisConnectionFactory factory) {
        // ...
    }
}
```

---

## 8.6 最佳实践

### 1. 优先使用 @ConditionalOnMissingBean

```java
@Bean
@ConditionalOnMissingBean  // 用户可以覆盖
public DataSource dataSource() {
    return new HikariDataSource();
}
```

### 2. 合理使用 @Import

```java
@AutoConfiguration
@Import({
    DataSourcePoolMetadataProvidersConfiguration.class,
    DataSourceInitializationConfiguration.class
})
public class DataSourceAutoConfiguration {
}
```

### 3. 提供默认值

```java
@ConfigurationProperties(prefix = "my.config")
public class MyProperties {
    
    private int timeout = 3000;  // 默认值
    private String charset = "UTF-8";
    
    // Getters and Setters
}
```

### 4. 使用内部配置类

```java
@AutoConfiguration
public class DataSourceAutoConfiguration {
    
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(HikariDataSource.class)
    static class HikariConfiguration {
        
        @Bean
        @ConditionalOnMissingBean
        DataSource dataSource() {
            return new HikariDataSource();
        }
    }
}
```

---

## 8.7 配置元数据

### spring-configuration-metadata.json

```json
{
  "groups": [
    {
      "name": "spring.datasource",
      "type": "org.springframework.boot.autoconfigure.jdbc.DataSourceProperties",
      "sourceType": "org.springframework.boot.autoconfigure.jdbc.DataSourceProperties"
    }
  ],
  "properties": [
    {
      "name": "spring.datasource.url",
      "type": "java.lang.String",
      "description": "JDBC URL of the database.",
      "sourceType": "org.springframework.boot.autoconfigure.jdbc.DataSourceProperties"
    },
    {
      "name": "spring.datasource.username",
      "type": "java.lang.String",
      "description": "Login username of the database.",
      "sourceType": "org.springframework.boot.autoconfigure.jdbc.DataSourceProperties"
    }
  ]
}
```

**作用：** IDE 中提供配置提示。

---

## 8.8 本章小结

**自动配置类规范：**
1. 使用 `@AutoConfiguration` 标记
2. 合理使用条件注解
3. 提供配置属性绑定
4. 控制加载顺序
5. 提供默认值
6. 用户配置优先

**相关章节：**
- [第 7 章：AutoConfigurationImportSelector 源码](./content-7.md)
- [第 9 章：@Conditional 条件注解体系](./content-9.md)
