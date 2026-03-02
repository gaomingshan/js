# Spring Web 源码指引

> spring-web 提供 Web 应用的基础支持，包括 Web 应用上下文、文件上传、HTTP 消息转换等。

---

## 1. Web 应用上下文（WebApplicationContext）

### 核心接口
- **WebApplicationContext** - Web 应用上下文接口
- **ConfigurableWebApplicationContext** - 可配置 Web 应用上下文

### 核心实现
- **GenericWebApplicationContext** - 通用 Web 应用上下文
- **AnnotationConfigWebApplicationContext** - 注解配置 Web 应用上下文
- **XmlWebApplicationContext** - XML 配置 Web 应用上下文

### Servlet 属性
- **ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE** - 根上下文在 ServletContext 中的属性名

### 设计目的
扩展 ApplicationContext，提供 Web 环境特定功能（ServletContext、ServletConfig 访问等）。

### 使用限制与风险
- WebApplicationContext 与 Servlet 容器生命周期绑定
- 根上下文通常由 ContextLoaderListener 创建
- DispatcherServlet 创建子上下文

---

## 2. 文件上传（MultipartResolver）

### 核心接口
- **MultipartResolver** - 文件上传解析器接口
- **MultipartFile** - 上传文件接口
- **MultipartHttpServletRequest** - 文件上传请求接口

### 核心实现
- **StandardServletMultipartResolver** - 标准 Servlet 3.0 文件上传解析器（推荐）
- **CommonsMultipartResolver** - Apache Commons FileUpload 解析器（已废弃）

### 配置示例（Servlet 3.0+）
```java
@Bean
public MultipartResolver multipartResolver() {
    return new StandardServletMultipartResolver();
}

@Bean
public ServletRegistrationBean<DispatcherServlet> dispatcherServlet() {
    ServletRegistrationBean<DispatcherServlet> registration = new ServletRegistrationBean<>(new DispatcherServlet());
    registration.setMultipartConfig(new MultipartConfigElement("/tmp", 10485760, 20971520, 0));
    return registration;
}
```

或 Spring Boot application.properties：
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=20MB
```

### 设计目的
统一文件上传处理，支持多种上传方式。

### 使用限制与风险
- StandardServletMultipartResolver 需 Servlet 3.0+
- 需配置临时目录和文件大小限制
- 大文件上传需注意内存和磁盘空间

---

## 3. 请求参数绑定（WebDataBinder）

### 核心类
- **WebDataBinder** - Web 数据绑定器
- **ServletRequestDataBinder** - Servlet 请求数据绑定器
- **ExtendedServletRequestDataBinder** - 扩展 Servlet 请求数据绑定器

### 数据绑定注解
- **@InitBinder** - 初始化绑定器
- **@ModelAttribute** - 模型属性绑定

### 使用示例
```java
@InitBinder
public void initBinder(WebDataBinder binder) {
    binder.registerCustomEditor(Date.class, new CustomDateEditor(new SimpleDateFormat("yyyy-MM-dd"), true));
    binder.setAllowedFields("name", "age"); // 白名单
    binder.setDisallowedFields("id"); // 黑名单
}
```

### 设计目的
将 HTTP 请求参数绑定到 Java 对象，支持类型转换和校验。

### 使用限制与风险
- 数据绑定可能导致安全问题（批量赋值攻击）
- 建议使用白名单限制可绑定字段
- 类型转换失败会抛异常

---

## 4. 类型转换与校验

### 类型转换集成
- WebDataBinder 集成 ConversionService
- 支持自定义 Converter、Formatter

### 校验集成
- 集成 Bean Validation（JSR-303/JSR-380）
- 支持 @Valid、@Validated 注解

### 校验示例
```java
@PostMapping("/users")
public User createUser(@Valid @RequestBody User user, BindingResult result) {
    if (result.hasErrors()) {
        // 处理校验错误
    }
    return userService.save(user);
}
```

### 设计目的
统一类型转换和数据校验，确保数据有效性。

### 使用限制与风险
- 校验失败默认抛异常（需全局异常处理）
- BindingResult 必须紧跟 @Valid 参数

---

## 5. Web 工具类（WebUtils）

### 核心类
- **WebUtils** - Web 工具类
- **ServletRequestUtils** - Servlet 请求工具类
- **UriUtils** - URI 工具类
- **UriComponentsBuilder** - URI 组件构建器

### 常用方法
- `WebUtils.getCookie()` - 获取 Cookie
- `WebUtils.setSessionAttribute()` - 设置 Session 属性
- `ServletRequestUtils.getIntParameter()` - 获取整型参数
- `UriComponentsBuilder.fromPath()` - 构建 URI

### 设计目的
简化常见 Web 操作，提升开发效率。

### 使用限制与风险
- 工具类方法不是万能的
- 复杂逻辑仍需自定义实现

---

## 6. 过滤器支持（Filter 集成）

### 核心过滤器
- **CharacterEncodingFilter** - 字符编码过滤器
- **HiddenHttpMethodFilter** - 隐藏 HTTP 方法过滤器（支持 PUT/DELETE）
- **FormContentFilter** - 表单内容过滤器（解析 PUT/PATCH 请求体）
- **RequestContextFilter** - 请求上下文过滤器（绑定 RequestAttributes）
- **CorsFilter** - CORS 过滤器
- **OncePerRequestFilter** - 每请求只执行一次的过滤器基类

### 配置示例
```java
@Bean
public FilterRegistrationBean<CharacterEncodingFilter> characterEncodingFilter() {
    FilterRegistrationBean<CharacterEncodingFilter> registration = new FilterRegistrationBean<>();
    registration.setFilter(new CharacterEncodingFilter("UTF-8", true));
    registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
    return registration;
}
```

### 设计目的
提供常用的 Servlet Filter 实现，简化配置。

### 使用限制与风险
- Filter 执行顺序很重要（通过 Order 控制）
- CharacterEncodingFilter 需最早执行

---

## 7. Session 与 Cookie 管理

### Session 管理
- `HttpSession` - Servlet 标准 API
- `SessionRegistry` - Session 注册表（Spring Security）

### Cookie 管理
- `Cookie` - Servlet 标准 API
- `CookieGenerator` - Cookie 生成器
- `@CookieValue` - Cookie 值注入

### 使用示例
```java
@GetMapping("/profile")
public String profile(@CookieValue(value = "sessionId", required = false) String sessionId) {
    // 使用 Cookie 值
}
```

### 设计目的
简化 Session 和 Cookie 操作。

### 使用限制与风险
- Session 默认存储在内存，集群需共享 Session
- Cookie 有大小限制（4KB）
- Cookie 安全需设置 HttpOnly、Secure、SameSite

---

## 8. 静态资源处理（ResourceHandler）

### 资源处理器
- **ResourceHttpRequestHandler** - 资源 HTTP 请求处理器
- **ResourceResolver** - 资源解析器
- **ResourceTransformer** - 资源转换器

### 配置示例
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/")
            .setCachePeriod(3600);
    }
}
```

### 设计目的
高效处理静态资源（CSS、JS、图片等）。

### 使用限制与风险
- 静态资源建议使用 CDN 或 Nginx
- 缓存策略需合理配置
- 资源版本化避免缓存问题（Spring Boot 支持自动版本化）

---

## 9. 国际化与本地化（LocaleResolver）

### 核心接口
- **LocaleResolver** - 本地化解析器接口
- **LocaleContextResolver** - 本地化上下文解析器

### 核心实现
- **AcceptHeaderLocaleResolver** - 基于 Accept-Language 头（默认）
- **FixedLocaleResolver** - 固定本地化
- **SessionLocaleResolver** - 基于 Session
- **CookieLocaleResolver** - 基于 Cookie

### 配置示例
```java
@Bean
public LocaleResolver localeResolver() {
    SessionLocaleResolver resolver = new SessionLocaleResolver();
    resolver.setDefaultLocale(Locale.US);
    return resolver;
}

@Bean
public LocaleChangeInterceptor localeChangeInterceptor() {
    LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
    interceptor.setParamName("lang");
    return interceptor;
}
```

### 设计目的
根据用户偏好自动切换语言。

### 使用限制与风险
- AcceptHeaderLocaleResolver 无法在运行时切换语言
- SessionLocaleResolver 支持运行时切换但需 Session
- 需配合 MessageSource 使用

---

## 10. CORS 支持（CorsConfiguration）

### 核心类
- **CorsConfiguration** - CORS 配置
- **CorsConfigurationSource** - CORS 配置源
- **CorsFilter** - CORS 过滤器

### 配置示例
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://example.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

或注解方式：
```java
@CrossOrigin(origins = "https://example.com")
@RestController
public class UserController {
}
```

### 设计目的
解决跨域请求问题，支持跨域资源共享。

### 使用限制与风险
- CORS 配置需谨慎（避免安全风险）
- allowCredentials=true 时，allowedOrigins 不能为 `*`
- 预检请求（OPTIONS）会增加延迟

---

## 11. Web 环境感知

### 环境接口
- **WebApplicationContext** - 提供 ServletContext 访问
- **ServletContextAware** - Servlet 上下文感知接口
- **ServletConfigAware** - Servlet 配置感知接口

### 设计目的
允许 Bean 访问 Web 环境资源。

### 使用限制与风险
- 增加了与 Web 环境的耦合
- 非 Web 环境无法使用

---

## 12. Servlet API 集成

### 注入 Servlet API
```java
@RestController
public class UserController {
    @GetMapping("/user")
    public User getUser(HttpServletRequest request, HttpServletResponse response, HttpSession session) {
        // 直接使用 Servlet API
    }
}
```

### 设计目的
支持在 Spring MVC 中直接使用 Servlet API。

### 使用限制与风险
- 降低了可测试性（需 Mock Servlet API）
- 增加了与 Servlet 规范的耦合

---

## 13. HTTP 消息转换器（HttpMessageConverter）

### 核心接口
- **HttpMessageConverter<T>** - HTTP 消息转换器接口
  - `canRead()` - 是否可读
  - `canWrite()` - 是否可写
  - `read()` - 读取请求体
  - `write()` - 写入响应体

### 核心实现
- **MappingJackson2HttpMessageConverter** - JSON 转换器（Jackson）
- **MappingJackson2XmlHttpMessageConverter** - XML 转换器（Jackson XML）
- **Jaxb2RootElementHttpMessageConverter** - XML 转换器（JAXB）
- **StringHttpMessageConverter** - 字符串转换器
- **ByteArrayHttpMessageConverter** - 字节数组转换器
- **ResourceHttpMessageConverter** - 资源转换器
- **FormHttpMessageConverter** - 表单转换器

### 设计目的
自动转换 HTTP 请求体和响应体，支持多种格式（JSON、XML、表单等）。

### 使用限制与风险
- 转换器根据 Content-Type 和 Accept 头选择
- 需正确配置 MediaType
- Jackson 默认忽略未知属性（可配置）

---

## 14. 多部分文件解析

### MultipartFile 接口
```java
@PostMapping("/upload")
public String upload(@RequestParam("file") MultipartFile file) {
    if (!file.isEmpty()) {
        file.transferTo(new File("/uploads/" + file.getOriginalFilename()));
    }
    return "success";
}
```

### 设计目的
简化文件上传处理。

### 使用限制与风险
- 需配置 MultipartResolver
- 文件大小限制需配置
- 文件存储路径需注意安全

---

## 📚 总结

spring-web 提供了 Web 应用的基础支持：
- **WebApplicationContext**：Web 应用上下文
- **MultipartResolver**：文件上传处理
- **WebDataBinder**：请求参数绑定和校验
- **过滤器**：CharacterEncodingFilter、CorsFilter 等
- **Session/Cookie**：会话和 Cookie 管理
- **静态资源**：ResourceHttpRequestHandler
- **国际化**：LocaleResolver
- **CORS**：跨域资源共享
- **HttpMessageConverter**：HTTP 消息转换

spring-web 是 spring-webmvc 和 spring-webflux 的基础，提供了通用的 Web 功能。
