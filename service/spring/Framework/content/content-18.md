# 第 18 章：HandlerMapping 映射机制

> **学习目标**：掌握 Spring MVC 请求映射的核心原理  
> **预计时长**：2.5 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

**HandlerMapping** 负责将请求映射到对应的处理器（Handler）。

**主要实现**：
- RequestMappingHandlerMapping（@RequestMapping）
- BeanNameUrlHandlerMapping（Bean名称）
- SimpleUrlHandlerMapping（URL配置）

---

## 2. RequestMappingHandlerMapping

### 2.1 初始化流程

```java
public class RequestMappingHandlerMapping extends RequestMappingInfoHandlerMapping
        implements MatchableHandlerMapping, EmbeddedValueResolverAware {
    
    @Override
    public void afterPropertiesSet() {
        this.config = new RequestMappingInfo.BuilderConfiguration();
        this.config.setUrlPathHelper(getUrlPathHelper());
        this.config.setPathMatcher(getPathMatcher());
        this.config.setSuffixPatternMatch(this.useSuffixPatternMatch);
        this.config.setTrailingSlashMatch(this.useTrailingSlashMatch);
        this.config.setRegisteredSuffixPatternMatch(this.useRegisteredSuffixPatternMatch);
        this.config.setContentNegotiationManager(getContentNegotiationManager());
        
        // 扫描并注册所有 @RequestMapping
        super.afterPropertiesSet();
    }
    
    @Override
    protected boolean isHandler(Class<?> beanType) {
        // 判断是否是处理器：有 @Controller 或 @RequestMapping
        return (AnnotatedElementUtils.hasAnnotation(beanType, Controller.class) ||
            AnnotatedElementUtils.hasAnnotation(beanType, RequestMapping.class));
    }
    
    @Override
    protected RequestMappingInfo getMappingForMethod(Method method, Class<?> handlerType) {
        // 解析方法上的 @RequestMapping
        RequestMappingInfo info = createRequestMappingInfo(method);
        if (info != null) {
            // 解析类上的 @RequestMapping
            RequestMappingInfo typeInfo = createRequestMappingInfo(handlerType);
            if (typeInfo != null) {
                // 合并类和方法的映射信息
                info = typeInfo.combine(info);
            }
        }
        return info;
    }
}
```

### 2.2 请求匹配

```java
public abstract class AbstractHandlerMethodMapping<T> extends AbstractHandlerMapping 
        implements InitializingBean {
    
    @Override
    protected HandlerMethod getHandlerInternal(HttpServletRequest request) throws Exception {
        String lookupPath = getUrlPathHelper().getLookupPathForRequest(request);
        this.mappingRegistry.acquireReadLock();
        try {
            // 查找最佳匹配的 HandlerMethod
            HandlerMethod handlerMethod = lookupHandlerMethod(lookupPath, request);
            return (handlerMethod != null ? handlerMethod.createWithResolvedBean() : null);
        } finally {
            this.mappingRegistry.releaseReadLock();
        }
    }
    
    @Nullable
    protected HandlerMethod lookupHandlerMethod(String lookupPath, HttpServletRequest request) {
        List<Match> matches = new ArrayList<>();
        
        // 直接匹配
        List<T> directPathMatches = this.mappingRegistry.getMappingsByUrl(lookupPath);
        if (directPathMatches != null) {
            addMatchingMappings(directPathMatches, matches, request);
        }
        
        // 模式匹配
        if (matches.isEmpty()) {
            addMatchingMappings(this.mappingRegistry.getMappings().keySet(), matches, request);
        }
        
        if (!matches.isEmpty()) {
            Comparator<Match> comparator = new MatchComparator(getMappingComparator(request));
            matches.sort(comparator);
            
            Match bestMatch = matches.get(0);
            if (matches.size() > 1) {
                Match secondBestMatch = matches.get(1);
                if (comparator.compare(bestMatch, secondBestMatch) == 0) {
                    // 多个匹配度相同的处理器，抛异常
                    throw new IllegalStateException(/* ... */);
                }
            }
            
            request.setAttribute(BEST_MATCHING_HANDLER_ATTRIBUTE, bestMatch.handlerMethod);
            handleMatch(bestMatch.mapping, lookupPath, request);
            return bestMatch.handlerMethod;
        } else {
            return handleNoMatch(this.mappingRegistry.getMappings().keySet(), lookupPath, request);
        }
    }
}
```

---

## 3. @RequestMapping 解析

### 3.1 注解定义

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Mapping
public @interface RequestMapping {
    String name() default "";
    
    @AliasFor("path")
    String[] value() default {};
    
    @AliasFor("value")
    String[] path() default {};
    
    RequestMethod[] method() default {};
    
    String[] params() default {};
    
    String[] headers() default {};
    
    String[] consumes() default {};
    
    String[] produces() default {};
}
```

### 3.2 使用示例

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    // 1. 基本映射
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    // 2. 多路径映射
    @RequestMapping(path = {"/create", "/add"}, method = RequestMethod.POST)
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
    
    // 3. 参数限定
    @GetMapping(value = "/search", params = "type=advanced")
    public List<User> advancedSearch() {
        // 只有请求参数包含 type=advanced 才匹配
        return userService.advancedSearch();
    }
    
    // 4. 请求头限定
    @GetMapping(value = "/list", headers = "X-API-VERSION=2")
    public List<User> listV2() {
        // 只有请求头包含 X-API-VERSION=2 才匹配
        return userService.listV2();
    }
    
    // 5. Content-Type 限定
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public String upload(@RequestParam("file") MultipartFile file) {
        // 只接受 multipart/form-data 类型
        return "success";
    }
    
    // 6. Accept 限定
    @GetMapping(value = "/{id}", produces = "application/json")
    public User getUserJson(@PathVariable Long id) {
        // 只返回 JSON 格式
        return userService.findById(id);
    }
}
```

---

## 4. 路径匹配规则

### 4.1 Ant 风格路径

```java
/**
 * ? : 匹配单个字符
 * * : 匹配 0 或多个字符
 * ** : 匹配 0 或多个目录
 */

// 示例
@GetMapping("/users/*/profile")     // 匹配 /users/123/profile
@GetMapping("/users/**/profile")    // 匹配 /users/123/profile, /users/a/b/profile
@GetMapping("/users/?.json")        // 匹配 /users/1.json
@GetMapping("/users/*.json")        // 匹配 /users/123.json
```

### 4.2 路径变量

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userService.findById(id);
}

// 正则表达式限定
@GetMapping("/users/{id:\\d+}")
public User getUserById(@PathVariable Long id) {
    // 只匹配数字ID
    return userService.findById(id);
}

// 多个路径变量
@GetMapping("/users/{userId}/orders/{orderId}")
public Order getOrder(@PathVariable Long userId, @PathVariable Long orderId) {
    return orderService.findByUserAndId(userId, orderId);
}
```

---

## 5. 匹配优先级

### 5.1 优先级规则

```
优先级（从高到低）：
1. 精确匹配 > 模式匹配
2. 路径变量数量少 > 路径变量数量多
3. 通配符少 > 通配符多
4. 路径长度长 > 路径长度短
```

### 5.2 示例

```java
@RestController
public class PriorityController {
    
    @GetMapping("/users/list")          // 优先级1（精确匹配）
    public String list() { return "list"; }
    
    @GetMapping("/users/{id}")          // 优先级2（路径变量）
    public String getUser() { return "user"; }
    
    @GetMapping("/users/*")             // 优先级3（单层通配符）
    public String wildcard() { return "wildcard"; }
    
    @GetMapping("/users/**")            // 优先级4（多层通配符）
    public String all() { return "all"; }
}

// 请求 /users/list → 匹配 list()
// 请求 /users/123 → 匹配 getUser()
// 请求 /users/abc → 匹配 wildcard()
// 请求 /users/a/b → 匹配 all()
```

---

## 6. 实际落地场景（工作实战）

### 场景 1：版本控制

```java
@RestController
@RequestMapping("/api")
public class UserController {
    
    // 版本1
    @GetMapping(value = "/users/{id}", headers = "API-Version=1")
    public UserV1 getUserV1(@PathVariable Long id) {
        return userService.findByIdV1(id);
    }
    
    // 版本2
    @GetMapping(value = "/users/{id}", headers = "API-Version=2")
    public UserV2 getUserV2(@PathVariable Long id) {
        return userService.findByIdV2(id);
    }
    
    // 或使用路径版本
    @GetMapping("/v1/users/{id}")
    public UserV1 getUserV1Path(@PathVariable Long id) {
        return userService.findByIdV1(id);
    }
    
    @GetMapping("/v2/users/{id}")
    public UserV2 getUserV2Path(@PathVariable Long id) {
        return userService.findByIdV2(id);
    }
}
```

### 场景 2：多格式支持

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping(value = "/{id}", produces = "application/json")
    public User getUserJson(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    @GetMapping(value = "/{id}", produces = "application/xml")
    public User getUserXml(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    // 或使用扩展名
    @GetMapping("/{id}.json")
    public User getUserJsonExt(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    @GetMapping("/{id}.xml")
    public User getUserXmlExt(@PathVariable Long id) {
        return userService.findById(id);
    }
}
```

### 场景 3：RESTful API 设计

```java
@RestController
@RequestMapping("/api/users")
public class UserRestController {
    
    @GetMapping                              // GET /api/users
    public List<User> list() {
        return userService.findAll();
    }
    
    @GetMapping("/{id}")                     // GET /api/users/123
    public User get(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    @PostMapping                             // POST /api/users
    public User create(@RequestBody User user) {
        return userService.save(user);
    }
    
    @PutMapping("/{id}")                     // PUT /api/users/123
    public User update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.update(user);
    }
    
    @DeleteMapping("/{id}")                  // DELETE /api/users/123
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

---

## 7. 面试准备专项

### 高频面试题：@RequestMapping 的匹配规则？

**完整回答**：

1. **路径匹配**：支持精确匹配、Ant风格通配符、路径变量
2. **请求方法匹配**：GET、POST、PUT、DELETE等
3. **参数匹配**：params属性限定请求参数
4. **请求头匹配**：headers属性限定请求头
5. **Content-Type匹配**：consumes属性限定请求类型
6. **Accept匹配**：produces属性限定响应类型

**优先级**：精确匹配 > 路径变量 > 单层通配符 > 多层通配符

---

## 8. 学习自检清单

- [ ] 能够说出 HandlerMapping 的作用
- [ ] 能够解释 @RequestMapping 的匹配规则
- [ ] 能够使用路径变量和通配符
- [ ] 能够配置请求方法、参数、请求头限定
- [ ] 能够设计 RESTful API

---

## 9. 参考资料

**Spring 官方文档**：
- [Request Mapping](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-ann-requestmapping)

**源码位置**：
- `org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping`
- `org.springframework.web.servlet.handler.AbstractHandlerMethodMapping`

---

**上一章** ← [第 17 章：DispatcherServlet 核心流程](./content-17.md)  
**下一章** → [第 19 章：HandlerAdapter 适配机制](./content-19.md)  
**返回目录** → [学习大纲](../content-outline.md)
