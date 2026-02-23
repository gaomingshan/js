# 第 34 章：Spring Boot 集成

> **学习目标**：掌握 Spring Boot 与 Spring Framework 的整合  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. Spring Boot 自动配置原理

### 1.1 @SpringBootApplication

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 等价于
@SpringBootConfiguration  // 标识为配置类
@EnableAutoConfiguration  // 启用自动配置
@ComponentScan           // 组件扫描
public class Application {
}
```

### 1.2 自动配置机制

```
1. @EnableAutoConfiguration
   ↓
2. AutoConfigurationImportSelector
   ↓
3. 加载 spring.factories
   ↓
4. 条件装配（@ConditionalOnXxx）
   ↓
5. 创建自动配置Bean
```

**spring.factories**：
```properties
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration,\
...
```

---

## 2. 自定义 Starter

### 2.1 创建 Starter 项目

```
my-spring-boot-starter/
├── pom.xml
└── src/main/java/
    └── com/example/autoconfigure/
        ├── MyProperties.java
        ├── MyAutoConfiguration.java
        └── MyService.java
└── src/main/resources/
    └── META-INF/
        └── spring.factories
```

### 2.2 配置类

```java
// 1. 配置属性
@ConfigurationProperties(prefix = "my.service")
@Data
public class MyProperties {
    private String name;
    private boolean enabled = true;
}

// 2. 服务类
public class MyService {
    private final String name;
    
    public MyService(String name) {
        this.name = name;
    }
    
    public void doSomething() {
        System.out.println("My Service: " + name);
    }
}

// 3. 自动配置类
@Configuration
@EnableConfigurationProperties(MyProperties.class)
@ConditionalOnProperty(prefix = "my.service", name = "enabled", havingValue = "true")
public class MyAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public MyService myService(MyProperties properties) {
        return new MyService(properties.getName());
    }
}
```

### 2.3 spring.factories

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.autoconfigure.MyAutoConfiguration
```

---

## 3. 配置文件

### 3.1 application.yml vs application.properties

```properties
# application.properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/db
spring.datasource.username=root
```

```yaml
# application.yml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/db
    username: root
```

### 3.2 多环境配置

```
application.yml              # 通用配置
application-dev.yml          # 开发环境
application-test.yml         # 测试环境
application-prod.yml         # 生产环境
```

```yaml
# application.yml
spring:
  profiles:
    active: @profileActive@  # Maven占位符

# application-dev.yml
server:
  port: 8080
logging:
  level:
    root: DEBUG

# application-prod.yml
server:
  port: 80
logging:
  level:
    root: WARN
```

---

## 4. 常用集成

### 4.1 MyBatis

```xml
<!-- 依赖 -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.2.0</version>
</dependency>
```

```yaml
# 配置
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.entity
  configuration:
    map-underscore-to-camel-case: true
```

```java
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM user WHERE id = #{id}")
    User findById(Long id);
    
    @Insert("INSERT INTO user (username, email) VALUES (#{username}, #{email})")
    int insert(User user);
}
```

### 4.2 Redis

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: 
    database: 0
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
```

```java
@Service
public class CacheService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }
    
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }
}
```

---

## 5. Actuator 监控

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"  # 暴露所有端点
  endpoint:
    health:
      show-details: always
  metrics:
    tags:
      application: ${spring.application.name}
```

**常用端点**：
- `/actuator/health` - 健康检查
- `/actuator/info` - 应用信息
- `/actuator/metrics` - 指标信息
- `/actuator/env` - 环境属性
- `/actuator/beans` - Bean列表

---

## 6. 打包部署

### 6.1 Maven 打包

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

```bash
# 打包
mvn clean package

# 运行
java -jar target/app.jar

# 指定环境
java -jar target/app.jar --spring.profiles.active=prod
```

### 6.2 Docker 部署

```dockerfile
FROM openjdk:11-jre-slim
COPY target/app.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

```bash
# 构建镜像
docker build -t my-app:1.0 .

# 运行容器
docker run -d -p 8080:8080 my-app:1.0
```

---

**上一章** ← [第 33 章：企业架构设计](./content-33.md)  
**下一章** → [第 35 章：微服务实战](./content-35.md)  
**返回目录** → [学习大纲](../content-outline.md)
