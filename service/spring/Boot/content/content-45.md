# 第 45 章：常见问题排查与优化

总结 Spring Boot 开发中的常见问题及解决方案，提供性能优化建议。

**学习目标：**
- 掌握常见问题的排查方法
- 学会应用性能优化技巧
- 提升问题解决能力

---

## 45.1 启动问题

### 端口占用

**问题**：`Port 8080 was already in use`

**解决方案**：
```properties
server.port=8081
```

或查找并关闭占用进程：
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Bean 循环依赖

**问题**：`BeanCurrentlyInCreationException`

**解决方案**：
1. 使用 @Lazy 注解
2. 使用 setter 注入替代构造器注入
3. 重新设计类结构

---

## 45.2 自动配置问题

### 自动配置不生效

**排查步骤**：
1. 启用 debug 模式：`debug=true`
2. 检查条件注解是否满足
3. 检查依赖是否正确引入
4. 查看 `/actuator/conditions` 端点

---

## 45.3 性能优化

### 启动速度优化

1. **懒加载**
```properties
spring.main.lazy-initialization=true
```

2. **排除不需要的自动配置**
```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
```

3. **使用 Lite 模式**
```java
@Configuration(proxyBeanMethods = false)
```

### 内存优化

1. **调整 JVM 参数**
```bash
java -Xms512m -Xmx1024m -jar app.jar
```

2. **使用连接池**
3. **合理配置缓存**

---

## 45.4 本章小结

**核心要点：**
1. 掌握常见问题的排查方法
2. 合理应用性能优化技巧
3. 善用 debug 模式和 Actuator

**相关章节：**
- [第 44 章：Spring Boot 核心扩展点汇总](./content-44.md)
- [第 46 章：综合面试题汇总](./content-46.md)
