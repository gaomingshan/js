# 1.2 快速开始

## 概述

本节将从零开始搭建一个 Spring Boot + MyBatis Plus 项目，完成第一个 CRUD 示例。通过实践快速掌握 MyBatis Plus 的基本使用。

**学习目标：**
- 掌握 MyBatis Plus 依赖引入和配置
- 理解实体类、Mapper、Service 的基本结构
- 完成第一个完整的 CRUD 操作
- 了解常用配置项的含义

---

## 依赖引入与版本选择

### Maven 依赖

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>2.7.14</version>
    </dependency>
    
    <!-- MyBatis Plus Starter -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.3.2</version>
    </dependency>
    
    <!-- 数据库驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
    
    <!-- 连接池（可选，推荐） -->
    <dependency>
        <groupId>com.zaxxer</groupId>
        <artifactId>HikariCP</artifactId>
    </dependency>
    
    <!-- Lombok（可选，简化代码） -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### Gradle 依赖

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web:2.7.14'
    implementation 'com.baomidou:mybatis-plus-boot-starter:3.5.3.2'
    implementation 'mysql:mysql-connector-java:8.0.33'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

### 版本选择建议

| MyBatis Plus 版本 | Spring Boot 版本 | JDK 版本 | 说明 |
|-------------------|-----------------|----------|------|
| 3.5.x | 2.7.x / 3.0.x | JDK 8+ | 当前稳定版本，推荐使用 |
| 3.4.x | 2.3.x ~ 2.7.x | JDK 8+ | 旧版本，功能稳定 |
| 3.3.x 及以下 | 2.x | JDK 8+ | 不推荐，已停止维护 |

**关键点：**
- `mybatis-plus-boot-starter` 已包含 MyBatis 和 MyBatis Spring，无需额外引入
- 建议使用 Spring Boot 2.7.x + MyBatis Plus 3.5.x 组合
- 生产环境建议使用稳定的小版本号（如 3.5.3.2 而非 3.5.3）

---

## Spring Boot 集成配置

### 数据源配置

```yaml
# application.yml
spring:
  # 数据源配置
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/test_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: root
    
    # Hikari 连接池配置（可选）
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

# MyBatis Plus 配置
mybatis-plus:
  # Mapper XML 文件位置（如果有自定义 XML）
  mapper-locations: classpath:mapper/**/*.xml
  
  # 实体类别名包路径
  type-aliases-package: com.example.entity
  
  # MyBatis 原生配置
  configuration:
    # 驼峰转下划线
    map-underscore-to-camel-case: true
    # 日志实现
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    # 缓存
    cache-enabled: false
  
  # 全局配置
  global-config:
    # 关闭 banner
    banner: false
    
    db-config:
      # 表名前缀（可选）
      # table-prefix: t_
      
      # 主键策略：自增
      id-type: auto
      
      # 逻辑删除配置
      logic-delete-field: deleted  # 实体字段名
      logic-delete-value: 1         # 删除值
      logic-not-delete-value: 0     # 未删除值
```

### 配置类（可选）

```java
package com.example.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MybatisPlusConfig {
    
    /**
     * 分页插件
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 添加分页插件
        PaginationInnerInterceptor paginationInterceptor = 
            new PaginationInnerInterceptor(DbType.MYSQL);
        
        // 设置单页最大限制（防止恶意查询）
        paginationInterceptor.setMaxLimit(500L);
        
        interceptor.addInnerInterceptor(paginationInterceptor);
        return interceptor;
    }
}
```

### 启动类配置

```java
package com.example;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.mapper")  // 扫描 Mapper 接口
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

## 第一个 CRUD 示例

### 1. 创建数据表

```sql
CREATE TABLE `user` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(30) DEFAULT NULL COMMENT '姓名',
  `age` INT(11) DEFAULT NULL COMMENT '年龄',
  `email` VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除标记',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 插入测试数据
INSERT INTO user (name, age, email) VALUES
('张三', 18, 'zhangsan@example.com'),
('李四', 20, 'lisi@example.com'),
('王五', 28, 'wangwu@example.com');
```

### 2. 创建实体类

```java
package com.example.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user")  // 表名（如果类名与表名一致可省略）
public class User {
    
    /**
     * 主键ID
     * IdType.AUTO：数据库自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 姓名
     */
    private String name;
    
    /**
     * 年龄
     */
    private Integer age;
    
    /**
     * 邮箱
     */
    private String email;
    
    /**
     * 创建时间
     * 自动填充创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     * 自动填充更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    /**
     * 逻辑删除标记
     * 0：未删除，1：已删除
     */
    @TableLogic
    private Integer deleted;
}
```

**注解说明：**
- `@TableName`：指定表名，类名与表名一致时可省略
- `@TableId`：标记主键字段，指定主键生成策略
- `@TableField`：字段映射，配置自动填充、是否存在等
- `@TableLogic`：逻辑删除标记字段

### 3. 创建 Mapper 接口

```java
package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 无需任何代码，已经拥有 CRUD 方法
    // 如需自定义方法，可以在这里添加
}
```

**关键点：**
- 继承 `BaseMapper<T>`，泛型为实体类类型
- 自动拥有 `insert`、`deleteById`、`updateById`、`selectById`、`selectList` 等方法
- 可以混合自定义方法

### 4. 创建 Service 接口和实现（可选但推荐）

```java
package com.example.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.entity.User;

public interface UserService extends IService<User> {
    // 继承 IService，获得更多方法
}
```

```java
package com.example.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.entity.User;
import com.example.mapper.UserMapper;
import com.example.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    // 无需任何代码，已经拥有丰富的 CRUD 方法
}
```

### 5. 创建 Controller 测试

```java
package com.example.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.entity.User;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 新增用户
     */
    @PostMapping
    public boolean save(@RequestBody User user) {
        return userService.save(user);
    }
    
    /**
     * 根据 ID 删除
     */
    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Long id) {
        return userService.removeById(id);
    }
    
    /**
     * 更新用户
     */
    @PutMapping
    public boolean update(@RequestBody User user) {
        return userService.updateById(user);
    }
    
    /**
     * 根据 ID 查询
     */
    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getById(id);
    }
    
    /**
     * 查询所有
     */
    @GetMapping("/list")
    public List<User> list() {
        return userService.list();
    }
    
    /**
     * 条件查询
     */
    @GetMapping("/query")
    public List<User> query(@RequestParam String name) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(User::getName, name);
        return userService.list(wrapper);
    }
    
    /**
     * 分页查询
     */
    @GetMapping("/page")
    public Page<User> page(@RequestParam(defaultValue = "1") Integer current,
                           @RequestParam(defaultValue = "10") Integer size) {
        Page<User> page = new Page<>(current, size);
        return userService.page(page);
    }
}
```

### 6. 测试运行

启动项目后，使用 Postman 或 curl 测试：

```bash
# 查询所有用户
curl http://localhost:8080/user/list

# 根据 ID 查询
curl http://localhost:8080/user/1

# 新增用户
curl -X POST http://localhost:8080/user \
  -H "Content-Type: application/json" \
  -d '{"name":"赵六","age":25,"email":"zhaoliu@example.com"}'

# 更新用户
curl -X PUT http://localhost:8080/user \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"张三丰","age":19,"email":"zhangsanfeng@example.com"}'

# 删除用户（逻辑删除）
curl -X DELETE http://localhost:8080/user/1

# 分页查询
curl http://localhost:8080/user/page?current=1&size=2
```

---

## 配置文件详解

### 核心配置项说明

```yaml
mybatis-plus:
  # ===== Mapper XML 配置 =====
  mapper-locations: classpath:mapper/**/*.xml
  # 说明：指定 Mapper XML 文件位置
  # 支持通配符，多个路径用逗号分隔
  
  # ===== 实体类配置 =====
  type-aliases-package: com.example.entity
  # 说明：实体类别名包路径，XML 中可以直接使用类名
  
  # ===== MyBatis 原生配置 =====
  configuration:
    map-underscore-to-camel-case: true
    # 说明：开启驼峰命名转换（user_name -> userName）
    
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    # 说明：日志实现类
    # 可选值：
    # - org.apache.ibatis.logging.stdout.StdOutImpl（控制台输出）
    # - org.apache.ibatis.logging.slf4j.Slf4jImpl（SLF4J）
    # - org.apache.ibatis.logging.log4j2.Log4j2Impl（Log4j2）
    
    cache-enabled: false
    # 说明：是否开启二级缓存，默认 true
    # 建议：分布式系统建议关闭，使用 Redis 等外部缓存
    
    lazy-loading-enabled: false
    # 说明：是否开启延迟加载，默认 false
    
    default-executor-type: simple
    # 说明：执行器类型
    # - SIMPLE：普通执行器
    # - REUSE：复用 PreparedStatement
    # - BATCH：批量执行器
  
  # ===== 全局配置 =====
  global-config:
    banner: false
    # 说明：是否显示 MyBatis Plus Banner，建议关闭
    
    db-config:
      # 表名前缀
      table-prefix: t_
      # 说明：所有表名自动添加前缀，实体类 User -> 表名 t_user
      
      # 表名策略
      table-underline: true
      # 说明：表名使用下划线命名，默认 true
      
      # 主键类型
      id-type: auto
      # 说明：全局默认主键类型
      # 可选值：
      # - AUTO：数据库自增
      # - ASSIGN_ID：雪花算法（Long 或 String）
      # - ASSIGN_UUID：UUID（String）
      # - INPUT：手动输入
      
      # 字段策略
      insert-strategy: not_null
      update-strategy: not_null
      select-strategy: not_null
      # 说明：字段验证策略
      # - IGNORED：忽略判断（包含 null）
      # - NOT_NULL：非 NULL 判断
      # - NOT_EMPTY：非空判断（针对字符串）
      # - DEFAULT：默认策略，与 NOT_NULL 一致
      
      # 逻辑删除
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
      # 说明：全局逻辑删除配置
```

### 开发环境与生产环境配置差异

**开发环境（application-dev.yml）：**
```yaml
mybatis-plus:
  configuration:
    # 控制台打印 SQL
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  
  global-config:
    # 显示 Banner
    banner: true
    
    db-config:
      # 严格字段策略，暴露问题
      insert-strategy: not_empty
      update-strategy: not_empty
```

**生产环境（application-prod.yml）：**
```yaml
mybatis-plus:
  configuration:
    # 使用 SLF4J，配合 Logback
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
  
  global-config:
    # 关闭 Banner
    banner: false
    
    db-config:
      # 合理的字段策略
      insert-strategy: not_null
      update-strategy: not_null
```

---

## 易错点与注意事项

### 1. 依赖冲突

**问题：** 同时引入 `mybatis-spring-boot-starter` 和 `mybatis-plus-boot-starter`

```xml
<!-- ❌ 错误：重复依赖 -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
</dependency>
```

**解决：** 只需引入 MyBatis Plus Starter

```xml
<!-- ✅ 正确：只引入 MP -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
</dependency>
```

### 2. @MapperScan 扫描路径错误

```java
// ❌ 错误：包路径写错
@MapperScan("com.example.dao")  // 实际是 com.example.mapper

// ✅ 正确
@MapperScan("com.example.mapper")
```

### 3. 实体类与表名映射问题

```java
// 数据库表名：t_user
// 如果全局配置了 table-prefix: t_

// ❌ 错误：会映射到 t_t_user
@TableName("t_user")
public class User {}

// ✅ 正确：只写 user
@TableName("user")
public class User {}

// ✅ 更好：省略注解，让 MP 自动处理
public class User {}
```

### 4. 日志不显示 SQL

检查日志配置：
```yaml
# 开启 MyBatis 日志
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# 或使用 Logback
logging:
  level:
    com.example.mapper: debug
```

---

## 关键点总结

1. **依赖引入**：只需引入 `mybatis-plus-boot-starter`，已包含 MyBatis 依赖
2. **配置要点**：数据源配置 + @MapperScan 扫描 + 分页插件（可选）
3. **核心三件套**：Entity（实体类）+ Mapper（继承 BaseMapper）+ Service（继承 IService）
4. **零代码 CRUD**：继承 BaseMapper 后无需任何代码即可使用基础 CRUD
5. **配置分离**：开发环境和生产环境使用不同配置文件
6. **逐步增强**：先掌握基础用法，再学习高级特性（Wrapper、分页、插件等）

---

## 下一步学习

完成快速开始后，建议按以下顺序深入学习：
1. **BaseMapper 接口**：了解所有内置方法
2. **IService 接口**：掌握服务层增强功能
3. **条件构造器 Wrapper**：复杂查询的利器
4. **分页插件**：处理大数据量查询
5. **代码生成器**：提高开发效率

---

## 参考资料

- [MyBatis Plus 快速开始](https://baomidou.com/pages/226c21/)
- [Spring Boot 集成配置](https://baomidou.com/pages/56bac0/)
- [配置项说明](https://baomidou.com/pages/56bac0/#%E5%9F%BA%E6%9C%AC%E9%85%8D%E7%BD%AE)
