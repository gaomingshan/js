# Spring WebMVC 源码指引

> spring-webmvc 是 Spring MVC 框架的实现，提供基于注解的 Web 开发支持。

---

## 1. 前端控制器（DispatcherServlet）

### 核心类
- **DispatcherServlet** - 前端控制器（核心）
- **FrameworkServlet** - 框架 Servlet 基类
- **HttpServletBean** - HTTP Servlet Bean 基类

### 请求处理流程
1. DispatcherServlet 接收请求
2. HandlerMapping 查找 Handler
3. HandlerAdapter 执行 Handler
4. ModelAndView 返回
5. ViewResolver 解析视图
6. View 渲染响应

### 设计目的
实现前端控制器模式，统一请求处理流程。

### 使用限制与风险
- DispatcherServlet 是 Servlet，需在 web.xml 或 Java 配置中注册
- 单个应用可配置多个 DispatcherServlet（不同 URL 映射）
- 初始化过程创建 WebApplicationContext（子上下文）

---

## 2. 控制器与请求映射（@Controller、@RequestMapping）

### 核心注解
- **@Controller** - 控制器注解
- **@RestController** - REST 控制器（@Controller + @ResponseBody）
- **@RequestMapping** - 请求映射注解
- **@GetMapping** - GET 请求映射
- **@PostMapping** - POST 请求映射
- **@PutMapping** - PUT 请求映射
- **@DeleteMapping** - DELETE 请求映射
- **@PatchMapping** - PATCH 请求映射

### 请求映射属性
- **path/value** - URL 路径（支持 Ant 风格、正则、路径变量）
- **method** - HTTP 方法
- **params** - 请求参数条件
- **headers** - 请求头条件
- **consumes** - 请求 Content-Type
- **produces** - 响应 Content-Type

### 路径变量与请求参数
```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id, @RequestParam(required = false) String name) {
    return userService.getUser(id);
}
```

### 设计目的
通过注解声明控制器和请求映射，简化配置。

### 使用限制与风险
- @RequestMapping 可用于类和方法级别（组合路径）
- 路径变量不能包含 `/`
- 多个映射匹配时，选择最具体的映射

---

## 3. 处理器映射（HandlerMapping）

### 核心接口
- **HandlerMapping** - 处理器映射接口
- **HandlerExecutionChain** - 处理器执行链

### 核心实现
- **RequestMappingHandlerMapping** - 基于 @RequestMapping 的映射（默认）
- **BeanNameUrlHandlerMapping** - 基于 Bean 名称的映射
- **SimpleUrlHandlerMapping** - 简单 URL 映射
- **RouterFunctionMapping** - 函数式路由映射（WebFlux 风格）

### 设计目的
根据请求查找对应的处理器（Controller 方法）。

### 使用限制与风险
- RequestMappingHandlerMapping 优先级最高
- 多个 HandlerMapping 可共存
- HandlerMapping 的 order 决定优先级

---

## 4. 处理器适配（HandlerAdapter）

### 核心接口
- **HandlerAdapter** - 处理器适配器接口

### 核心实现
- **RequestMappingHandlerAdapter** - 基于 @RequestMapping 的适配器（默认）
- **HttpRequestHandlerAdapter** - HttpRequestHandler 适配器
- **SimpleControllerHandlerAdapter** - Controller 接口适配器
- **HandlerFunctionAdapter** - 函数式处理器适配器

### 设计目的
适配不同类型的处理器，执行处理逻辑。

### 使用限制与风险
- RequestMappingHandlerAdapter 处理 @RequestMapping 方法
- 支持参数解析、返回值处理、数据绑定、校验等

---

## 5. 视图解析（ViewResolver）

### 核心接口
- **ViewResolver** - 视图解析器接口
- **View** - 视图接口

### 核心实现
- **InternalResourceViewResolver** - 内部资源视图解析器（JSP）
- **ThymeleafViewResolver** - Thymeleaf 视图解析器
- **FreeMarkerViewResolver** - FreeMarker 视图解析器
- **ContentNegotiatingViewResolver** - 内容协商视图解析器
- **BeanNameViewResolver** - Bean 名称视图解析器

### 配置示例
```java
@Bean
public InternalResourceViewResolver viewResolver() {
    InternalResourceViewResolver resolver = new InternalResourceViewResolver();
    resolver.setPrefix("/WEB-INF/views/");
    resolver.setSuffix(".jsp");
    return resolver;
}
```

### 设计目的
根据视图名称解析为具体的视图对象，渲染响应。

### 使用限制与风险
- 多个 ViewResolver 可共存（优先级）
- InternalResourceViewResolver 应优先级最低（兜底）
- 现代应用更多使用前后端分离（不需要视图解析）

---

## 6. 拦截器（HandlerInterceptor）

### 核心接口
- **HandlerInterceptor** - 拦截器接口
  - `preHandle()` - 前置处理（返回 false 中断请求）
  - `postHandle()` - 后置处理（Handler 执行后，视图渲染前）
  - `afterCompletion()` - 完成后处理（视图渲染后）

### 核心实现
- **LocaleChangeInterceptor** - 本地化切换拦截器
- **ThemeChangeInterceptor** - 主题切换拦截器
- **UserRoleAuthorizationInterceptor** - 用户角色授权拦截器

### 配置示例
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoggingInterceptor())
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/public/**")
            .order(1);
    }
}
```

### 设计目的
在请求处理的不同阶段插入自定义逻辑（日志、鉴权、性能监控等）。

### 使用限制与风险
- preHandle 返回 false 会中断后续拦截器和 Handler
- 异常发生时，仅已执行 preHandle 的拦截器会执行 afterCompletion
- 拦截器顺序很重要

---

## 7. 数据绑定与校验（@Valid、BindingResult）

### 数据绑定
```java
@PostMapping("/users")
public String createUser(@ModelAttribute User user, BindingResult result) {
    if (result.hasErrors()) {
        return "userForm";
    }
    userService.save(user);
    return "redirect:/users";
}
```

### 校验注解（JSR-303/JSR-380）
- **@NotNull** - 不能为 null
- **@NotEmpty** - 不能为空（集合、字符串）
- **@NotBlank** - 不能为空白（字符串）
- **@Size** - 大小限制
- **@Min/@Max** - 数值范围
- **@Email** - 邮箱格式
- **@Pattern** - 正则表达式

### 分组校验
```java
public interface Create {}
public interface Update {}

@PostMapping("/users")
public User createUser(@Validated(Create.class) @RequestBody User user) {
    return userService.save(user);
}
```

### 设计目的
自动绑定请求参数到对象，并进行校验。

### 使用限制与风险
- BindingResult 必须紧跟 @Valid/@Validated 参数
- @Valid 校验嵌套对象
- 校验失败默认返回 400（可自定义异常处理）

---

## 8. 全局异常处理（@ControllerAdvice、@ExceptionHandler）

### 核心注解
- **@ControllerAdvice** - 控制器增强（全局）
- **@RestControllerAdvice** - REST 控制器增强（@ControllerAdvice + @ResponseBody）
- **@ExceptionHandler** - 异常处理器

### 使用示例
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(NotFoundException ex) {
        return new ErrorResponse(404, ex.getMessage());
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneral(Exception ex) {
        return new ErrorResponse(500, "Internal Server Error");
    }
}
```

### 设计目的
统一处理异常，避免在每个 Controller 中重复异常处理逻辑。

### 使用限制与风险
- @ControllerAdvice 默认作用于所有 Controller
- 可通过 basePackages、annotations 等限制范围
- @ExceptionHandler 优先级：Controller 内 > @ControllerAdvice

---

## 9. 内容协商（ContentNegotiationManager）

### 核心类
- **ContentNegotiationManager** - 内容协商管理器
- **ContentNegotiationStrategy** - 内容协商策略

### 协商策略
- **HeaderContentNegotiationStrategy** - 基于 Accept 头（默认）
- **PathExtensionContentNegotiationStrategy** - 基于路径扩展名（已废弃）
- **ParameterContentNegotiationStrategy** - 基于请求参数

### 配置示例
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
            .defaultContentType(MediaType.APPLICATION_JSON)
            .mediaType("json", MediaType.APPLICATION_JSON)
            .mediaType("xml", MediaType.APPLICATION_XML);
    }
}
```

### 设计目的
根据客户端需求自动选择响应格式（JSON、XML 等）。

### 使用限制与风险
- 需配置对应的 HttpMessageConverter
- PathExtensionContentNegotiationStrategy 存在安全风险（已废弃）

---

## 10. 文件上传（MultipartFile）

### 使用示例
```java
@PostMapping("/upload")
public String handleFileUpload(@RequestParam("file") MultipartFile file, 
                               @RequestParam("files") MultipartFile[] files) {
    if (!file.isEmpty()) {
        file.transferTo(new File("/uploads/" + file.getOriginalFilename()));
    }
    for (MultipartFile f : files) {
        // 批量上传
    }
    return "success";
}
```

### 设计目的
简化文件上传处理。

### 使用限制与风险
- 需配置 MultipartResolver
- 文件大小限制需配置
- transferTo() 移动文件（非复制）

---

## 11. 会话属性管理（@SessionAttributes）

### 核心注解
- **@SessionAttributes** - 会话属性注解
- **@SessionAttribute** - 会话属性注入

### 使用示例
```java
@Controller
@SessionAttributes("user")
public class UserController {
    @ModelAttribute("user")
    public User createUser() {
        return new User();
    }
    
    @GetMapping("/profile")
    public String profile(@SessionAttribute("user") User user, Model model) {
        model.addAttribute("user", user);
        return "profile";
    }
    
    @PostMapping("/update")
    public String update(@ModelAttribute("user") User user, SessionStatus status) {
        userService.save(user);
        status.setComplete(); // 清除 Session 属性
        return "redirect:/profile";
    }
}
```

### 设计目的
在多次请求间共享模型属性（存储在 Session）。

### 使用限制与风险
- @SessionAttributes 仅作用于 @ModelAttribute
- 需显式调用 SessionStatus.setComplete() 清除
- Session 属性占用内存

---

## 12. 异步请求处理（DeferredResult、Callable）

### Callable 示例
```java
@GetMapping("/async-callable")
public Callable<String> asyncCallable() {
    return () -> {
        Thread.sleep(1000);
        return "Async result";
    };
}
```

### DeferredResult 示例
```java
@GetMapping("/async-deferred")
public DeferredResult<String> asyncDeferred() {
    DeferredResult<String> result = new DeferredResult<>(5000L);
    CompletableFuture.runAsync(() -> {
        try {
            Thread.sleep(1000);
            result.setResult("Async result");
        } catch (Exception e) {
            result.setErrorResult(e);
        }
    });
    return result;
}
```

### 设计目的
支持异步请求处理，释放 Servlet 容器线程，提升并发性能。

### 使用限制与风险
- Callable 在 Spring 管理的线程池执行
- DeferredResult 更灵活，可在任意线程设置结果
- 需 Servlet 3.0+ 异步支持
- 超时需配置

---

## 13. RESTful API 支持（@RestController、@ResponseBody）

### 核心注解
- **@RestController** - REST 控制器（@Controller + @ResponseBody）
- **@ResponseBody** - 响应体注解
- **@RequestBody** - 请求体注解
- **@ResponseStatus** - 响应状态注解

### RESTful 示例
```java
@RestController
@RequestMapping("/api/users")
public class UserRestController {
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
    
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.update(id, user);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

### 设计目的
简化 RESTful API 开发，自动序列化为 JSON/XML。

### 使用限制与风险
- 需配置 HttpMessageConverter（默认 Jackson）
- @RequestBody 反序列化可能失败（需校验）
- REST API 需规范设计（HTTP 方法、状态码）

---

## 14. Flash 属性支持（RedirectAttributes）

### 核心类
- **RedirectAttributes** - 重定向属性接口
- **FlashMap** - Flash 属性 Map

### 使用示例
```java
@PostMapping("/users")
public String createUser(@ModelAttribute User user, RedirectAttributes attributes) {
    userService.save(user);
    attributes.addFlashAttribute("message", "User created successfully");
    return "redirect:/users";
}

@GetMapping("/users")
public String listUsers(Model model, @ModelAttribute("message") String message) {
    // message 仅在重定向后的第一次请求可用
    model.addAttribute("users", userService.findAll());
    return "userList";
}
```

### 设计目的
在重定向后传递临时数据（PRG 模式：Post-Redirect-Get）。

### 使用限制与风险
- Flash 属性存储在 Session，仅在下次请求可用
- 重定向后自动清除
- 适合传递成功/失败消息

---

## 15. 模型属性绑定（@ModelAttribute）

### 使用场景
1. **方法参数绑定**：从请求参数绑定到对象
2. **方法级 @ModelAttribute**：为所有请求方法准备模型属性
3. **返回值绑定**：将返回值添加到 Model

### 使用示例
```java
@Controller
public class UserController {
    // 为所有请求方法准备数据
    @ModelAttribute("countries")
    public List<String> populateCountries() {
        return Arrays.asList("USA", "China", "UK");
    }
    
    @GetMapping("/form")
    public String showForm(@ModelAttribute("user") User user) {
        // user 自动添加到 Model
        return "userForm";
    }
    
    @PostMapping("/submit")
    public String submit(@ModelAttribute("user") User user) {
        userService.save(user);
        return "redirect:/success";
    }
}
```

### 设计目的
简化模型属性管理，自动绑定和传递数据。

### 使用限制与风险
- @ModelAttribute 方法在每次请求前执行
- 参数绑定可能失败（类型转换）
- 需注意性能（避免在 @ModelAttribute 方法中执行重操作）

---

## 16. 请求与响应体处理（@RequestBody、@ResponseBody）

### @RequestBody
- 将 HTTP 请求体反序列化为对象
- 需 HttpMessageConverter 支持

### @ResponseBody
- 将返回值序列化为 HTTP 响应体
- 需 HttpMessageConverter 支持

### 设计目的
简化 HTTP 消息体的处理。

### 使用限制与风险
- Content-Type 和 Accept 需正确设置
- 序列化/反序列化可能失败
- @RestController 默认所有方法都有 @ResponseBody

---

## 17. 参数解析与类型转换（HandlerMethodArgumentResolver）

### 核心接口
- **HandlerMethodArgumentResolver** - 方法参数解析器
- **HandlerMethodReturnValueHandler** - 返回值处理器

### 内置参数解析器
- **RequestParamMethodArgumentResolver** - @RequestParam
- **PathVariableMethodArgumentResolver** - @PathVariable
- **RequestBodyMethodProcessor** - @RequestBody
- **ModelAttributeMethodProcessor** - @ModelAttribute
- **SessionAttributeMethodArgumentResolver** - @SessionAttribute
- **RequestHeaderMethodArgumentResolver** - @RequestHeader
- **CookieValueMethodArgumentResolver** - @CookieValue

### 设计目的
自动解析控制器方法参数，支持多种参数类型。

### 使用限制与风险
- 自定义参数解析器需实现接口并注册
- 解析器优先级影响匹配结果

---

## 18. 视图模板集成

### JSP
- InternalResourceViewResolver
- JSTL 标签库

### Thymeleaf
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

### FreeMarker
```java
@Bean
public FreeMarkerConfigurer freeMarkerConfigurer() {
    FreeMarkerConfigurer configurer = new FreeMarkerConfigurer();
    configurer.setTemplateLoaderPath("classpath:/templates/");
    return configurer;
}
```

### 设计目的
集成主流模板引擎，渲染动态页面。

### 使用限制与风险
- JSP 性能较差，已逐渐淘汰
- Thymeleaf 功能强大，Spring Boot 默认集成
- 前后端分离模式下不需要模板引擎

---

## 📚 总结

spring-webmvc 提供了完整的 MVC 框架：
- **DispatcherServlet**：前端控制器，统一请求处理
- **@Controller/@RestController**：控制器注解
- **@RequestMapping**：请求映射
- **HandlerMapping/HandlerAdapter**：处理器映射和适配
- **ViewResolver**：视图解析
- **HandlerInterceptor**：拦截器
- **数据绑定与校验**：@Valid、BindingResult
- **异常处理**：@ControllerAdvice、@ExceptionHandler
- **内容协商**：自动选择响应格式
- **异步支持**：Callable、DeferredResult
- **RESTful API**：@RestController、@RequestBody/@ResponseBody
- **Flash 属性**：RedirectAttributes

Spring MVC 是 Java Web 开发的主流框架，适合传统 Web 应用和 RESTful API 开发。
