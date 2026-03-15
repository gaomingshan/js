# 21.2 与其他框架集成

## 概述

MyBatis Plus 可与主流框架无缝集成，提升开发效率。

**常见集成：**
- Spring Boot
- Spring Cloud
- Shiro/Spring Security
- Swagger/Knife4j
- Redis

---

## Spring Cloud 集成

```yaml
# 服务注册与发现
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848

# MyBatis Plus 配置
mybatis-plus:
  mapper-locations: classpath*:mapper/**/*Mapper.xml
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

---

## Spring Security 集成

```java
/**
 * 获取当前登录用户
 */
public class SecurityUtils {
    
    public static Long getUserId() {
        Authentication authentication = 
            SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof LoginUser) {
                return ((LoginUser) principal).getUserId();
            }
        }
        
        return null;
    }
}

/**
 * 自动填充集成
 */
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createBy", Long.class, 
                             SecurityUtils.getUserId());
    }
}
```

---

## Swagger 集成

```java
/**
 * Swagger 配置
 */
@Configuration
@EnableSwagger2
public class SwaggerConfig {
    
    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2)
            .apiInfo(apiInfo())
            .select()
            .apis(RequestHandlerSelectors.basePackage("com.example.controller"))
            .build();
    }
}

/**
 * 实体类文档
 */
@Data
@ApiModel("用户")
public class User extends Model<User> {
    
    @ApiModelProperty("用户ID")
    private Long id;
    
    @ApiModelProperty("用户名")
    private String username;
}
```

---

## 关键点总结

1. **Spring Boot**：自动配置，开箱即用
2. **Spring Cloud**：微服务架构支持
3. **Security**：权限集成
4. **Swagger**：API 文档生成
5. **Redis**：缓存集成
6. **配置统一**：统一配置管理
7. **最佳实践**：遵循各框架最佳实践

---

## 参考资料

- [Spring Boot](https://spring.io/projects/spring-boot)
- [Spring Cloud](https://spring.io/projects/spring-cloud)
