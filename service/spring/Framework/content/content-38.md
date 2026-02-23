# 第 38 章：事务和 MVC 面试题

> **学习目标**：掌握事务管理和 Spring MVC 的面试题  
> **预计时长**：1.5 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 事务管理面试题

### 1.1 什么情况下会发生脏读、不可重复读、幻读？

**答案**：

**脏读（Dirty Read）**：
```
事务A：UPDATE balance = 100
事务B：SELECT balance  → 读到 100（未提交数据）
事务A：ROLLBACK
事务B：使用了错误的数据
```

**不可重复读（Non-Repeatable Read）**：
```
事务A：SELECT balance  → 100
事务B：UPDATE balance = 200 + COMMIT
事务A：SELECT balance  → 200（同一事务内读到不同值）
```

**幻读（Phantom Read）**：
```
事务A：SELECT COUNT(*)  → 5 行
事务B：INSERT + COMMIT
事务A：SELECT COUNT(*)  → 6 行（行数变化）
```

### 1.2 如何选择事务隔离级别？

**答案**：

| 场景 | 推荐隔离级别 |
|------|------------|
| 普通查询 | READ_COMMITTED |
| 报表统计 | REPEATABLE_READ |
| 账户转账 | READ_COMMITTED + 悲观锁 |
| 库存扣减 | READ_COMMITTED + 乐观锁 |
| 批量导入 | READ_UNCOMMITTED（性能优先） |

### 1.3 如何解决超卖问题？

**答案**：

**方案对比**：

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| SERIALIZABLE | 完全隔离 | 性能极差 | 不推荐 |
| 悲观锁（SELECT FOR UPDATE） | 可靠 | 并发低 | 低并发 |
| 乐观锁（版本号） | 并发高 | 可能失败 | 高并发（推荐） |
| Redis 分布式锁 | 性能好 | 复杂 | 分布式场景 |

**乐观锁实现**：
```sql
UPDATE inventory 
SET stock = stock - #{quantity}, version = version + 1
WHERE product_id = #{productId} 
  AND stock >= #{quantity} 
  AND version = #{version}
```

---

## 2. Spring MVC 面试题

### 2.1 SpringMVC 的核心组件有哪些？

**答案**：
1. **DispatcherServlet**：前端控制器
2. **HandlerMapping**：处理器映射器
3. **HandlerAdapter**：处理器适配器
4. **ViewResolver**：视图解析器
5. **HandlerInterceptor**：拦截器
6. **HandlerExceptionResolver**：异常处理器

### 2.2 SpringMVC 的请求处理流程？

**答案**：
```
1. 请求 → DispatcherServlet
2. HandlerMapping 查找 Handler → HandlerExecutionChain
3. HandlerAdapter 适配 Handler
4. 执行拦截器 preHandle()
5. Handler 执行（Controller 方法） → ModelAndView
6. 执行拦截器 postHandle()
7. ViewResolver 解析视图 → View
8. View 渲染
9. 执行拦截器 afterCompletion()
10. 返回响应
```

### 2.3 如何统一处理异常？

**答案**：

**@ControllerAdvice + @ExceptionHandler**：
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        return Result.error(e.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidationException(MethodArgumentNotValidException e) {
        String errors = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return Result.error(errors);
    }
    
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("Unexpected error", e);
        return Result.error("系统错误");
    }
}
```

### 2.4 RESTful API 设计规范？

**答案**：

**资源命名**：
- 使用名词，不使用动词
- 使用复数形式
- 小写字母，单词间用连字符

**HTTP 方法**：
```
GET    /users       - 查询列表
GET    /users/123   - 查询详情
POST   /users       - 创建
PUT    /users/123   - 完整更新
PATCH  /users/123   - 部分更新
DELETE /users/123   - 删除
```

**状态码**：
```
200 OK               - 成功
201 Created          - 创建成功
204 No Content       - 删除成功
400 Bad Request      - 参数错误
401 Unauthorized     - 未认证
403 Forbidden        - 无权限
404 Not Found        - 资源不存在
500 Internal Error   - 服务器错误
```

**响应格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "张三"
  }
}
```

---

## 3. 参数绑定和校验

### 3.1 常用参数绑定注解？

**答案**：

| 注解 | 用途 | 示例 |
|------|------|------|
| @RequestParam | URL 参数 | /users?name=张三 |
| @PathVariable | 路径变量 | /users/{id} |
| @RequestBody | JSON 请求体 | POST body |
| @RequestHeader | 请求头 | Authorization |
| @CookieValue | Cookie | session_id |
| @ModelAttribute | 表单绑定 | form data |

### 3.2 如何进行参数校验？

**答案**：

**使用 JSR-303/Bean Validation**：
```java
// DTO
public class UserDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20)
    private String username;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Min(value = 18, message = "年龄不能小于18")
    private Integer age;
}

// Controller
@PostMapping("/users")
public Result<?> create(@Valid @RequestBody UserDTO userDTO) {
    return Result.success(userService.create(userDTO));
}
```

**自定义校验器**：
```java
// 注解
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 校验器
public class PhoneValidator implements ConstraintValidator<Phone, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value != null && value.matches("^1[3-9]\\d{9}$");
    }
}
```

---

## 4. 文件上传和下载

### 4.1 如何实现文件上传？

**答案**：
```java
@PostMapping("/upload")
public Result<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty()) {
        return Result.error("文件为空");
    }
    
    // 获取文件名
    String filename = file.getOriginalFilename();
    
    // 保存文件
    Path path = Paths.get("/upload/" + filename);
    Files.copy(file.getInputStream(), path);
    
    return Result.success(filename);
}
```

### 4.2 如何实现文件下载？

**答案**：
```java
@GetMapping("/download")
public void download(HttpServletResponse response) throws IOException {
    File file = new File("/data/file.pdf");
    
    response.setContentType("application/octet-stream");
    response.setHeader("Content-Disposition", 
        "attachment; filename=" + URLEncoder.encode(file.getName(), "UTF-8"));
    
    try (InputStream is = new FileInputStream(file);
         OutputStream os = response.getOutputStream()) {
        byte[] buffer = new byte[1024];
        int len;
        while ((len = is.read(buffer)) != -1) {
            os.write(buffer, 0, len);
        }
    }
}
```

---

## 5. 跨域处理

### 5.1 什么是跨域？如何解决？

**答案**：

**跨域**：浏览器同源策略限制，协议、域名、端口任一不同即为跨域

**解决方案**：

**1. @CrossOrigin 注解**：
```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
}
```

**2. 全局配置**：
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

**3. Filter 过滤器**：
```java
@Component
public class CorsFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) 
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        chain.doFilter(req, res);
    }
}
```

---

## 6. 性能优化

### 6.1 SpringMVC 性能优化建议？

**答案**：
1. **使用 @ResponseBody**：避免视图解析
2. **启用 HTTP 缓存**：Last-Modified、ETag
3. **GZIP 压缩**：压缩响应内容
4. **异步处理**：@Async、DeferredResult
5. **连接池优化**：Tomcat 线程池配置
6. **静态资源分离**：CDN
7. **数据库优化**：索引、SQL 优化、连接池

### 6.2 如何实现接口限流？

**答案**：

**使用 Guava RateLimiter**：
```java
@Aspect
@Component
public class RateLimiterAspect {
    private final RateLimiter rateLimiter = RateLimiter.create(10.0); // 每秒10个请求
    
    @Around("@annotation(rateLimiter)")
    public Object around(ProceedingJoinPoint pjp, RateLimiter rateLimiter) throws Throwable {
        if (this.rateLimiter.tryAcquire()) {
            return pjp.proceed();
        } else {
            throw new RateLimitException("请求过于频繁");
        }
    }
}
```

---

**上一章** ← [第 37 章：IoC 和 AOP 深度面试题](./content-37.md)  
**下一章** → [第 39 章：Spring Boot 和微服务面试题](./content-39.md)  
**返回目录** → [学习大纲](../content-outline.md)
