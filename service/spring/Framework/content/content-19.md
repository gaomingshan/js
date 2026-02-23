# 第 19 章：HandlerAdapter 适配机制

> **学习目标**：理解 HandlerAdapter 的适配器模式应用  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

**HandlerAdapter** 负责适配不同类型的处理器，统一调用处理器方法。

**适配器模式应用**：
```
不同类型的 Handler → HandlerAdapter → 统一的调用接口
```

---

## 2. HandlerAdapter 接口

```java
public interface HandlerAdapter {
    
    /**
     * 是否支持该处理器
     */
    boolean supports(Object handler);
    
    /**
     * 执行处理器，返回 ModelAndView
     */
    @Nullable
    ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler) 
        throws Exception;
    
    /**
     * 获取资源的最后修改时间
     */
    long getLastModified(HttpServletRequest request, Object handler);
}
```

---

## 3. RequestMappingHandlerAdapter

### 3.1 核心方法

```java
public class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter
        implements BeanFactoryAware, InitializingBean {
    
    @Override
    protected ModelAndView handleInternal(HttpServletRequest request,
            HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {
        
        ModelAndView mav;
        checkRequest(request);
        
        // 同步执行
        if (this.synchronizeOnSession) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                Object mutex = WebUtils.getSessionMutex(session);
                synchronized (mutex) {
                    mav = invokeHandlerMethod(request, response, handlerMethod);
                }
            } else {
                mav = invokeHandlerMethod(request, response, handlerMethod);
            }
        } else {
            mav = invokeHandlerMethod(request, response, handlerMethod);
        }
        
        // 处理缓存
        if (!response.containsHeader(HEADER_CACHE_CONTROL)) {
            if (getSessionAttributesHandler(handlerMethod).hasSessionAttributes()) {
                applyCacheSeconds(response, this.cacheSecondsForSessionAttributeHandlers);
            } else {
                prepareResponse(response);
            }
        }
        
        return mav;
    }
    
    @Nullable
    protected ModelAndView invokeHandlerMethod(HttpServletRequest request,
            HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {
        
        ServletWebRequest webRequest = new ServletWebRequest(request, response);
        try {
            WebDataBinderFactory binderFactory = getDataBinderFactory(handlerMethod);
            ModelFactory modelFactory = getModelFactory(handlerMethod, binderFactory);
            
            ServletInvocableHandlerMethod invocableMethod = createInvocableHandlerMethod(handlerMethod);
            if (this.argumentResolvers != null) {
                invocableMethod.setHandlerMethodArgumentResolvers(this.argumentResolvers);
            }
            if (this.returnValueHandlers != null) {
                invocableMethod.setHandlerMethodReturnValueHandlers(this.returnValueHandlers);
            }
            invocableMethod.setDataBinderFactory(binderFactory);
            invocableMethod.setParameterNameDiscoverer(this.parameterNameDiscoverer);
            
            ModelAndViewContainer mavContainer = new ModelAndViewContainer();
            mavContainer.addAllAttributes(RequestContextUtils.getInputFlashMap(request));
            modelFactory.initModel(webRequest, mavContainer, invocableMethod);
            mavContainer.setIgnoreDefaultModelOnRedirect(this.ignoreDefaultModelOnRedirect);
            
            AsyncWebRequest asyncWebRequest = WebAsyncUtils.createAsyncWebRequest(request, response);
            asyncWebRequest.setTimeout(this.asyncRequestTimeout);
            
            WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
            asyncManager.setTaskExecutor(this.taskExecutor);
            asyncManager.setAsyncWebRequest(asyncWebRequest);
            asyncManager.registerCallableInterceptors(this.callableInterceptors);
            asyncManager.registerDeferredResultInterceptors(this.deferredResultInterceptors);
            
            if (asyncManager.hasConcurrentResult()) {
                Object result = asyncManager.getConcurrentResult();
                mavContainer = (ModelAndViewContainer) asyncManager.getConcurrentResultContext()[0];
                asyncManager.clearConcurrentResult();
                invocableMethod = invocableMethod.wrapConcurrentResult(result);
            }
            
            // 执行处理器方法
            invocableMethod.invokeAndHandle(webRequest, mavContainer);
            if (asyncManager.isConcurrentHandlingStarted()) {
                return null;
            }
            
            return getModelAndView(mavContainer, modelFactory, webRequest);
        } finally {
            webRequest.requestCompleted();
        }
    }
}
```

---

## 4. 参数解析器

### 4.1 HandlerMethodArgumentResolver

```java
public interface HandlerMethodArgumentResolver {
    
    /**
     * 是否支持该参数
     */
    boolean supportsParameter(MethodParameter parameter);
    
    /**
     * 解析参数值
     */
    @Nullable
    Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception;
}
```

### 4.2 常用参数解析器

```java
// 1. @RequestParam
@GetMapping("/search")
public List<User> search(@RequestParam String keyword) {
    return userService.search(keyword);
}

// 2. @PathVariable
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userService.findById(id);
}

// 3. @RequestBody
@PostMapping("/users")
public User createUser(@RequestBody User user) {
    return userService.save(user);
}

// 4. @RequestHeader
@GetMapping("/info")
public String getInfo(@RequestHeader("User-Agent") String userAgent) {
    return userAgent;
}

// 5. HttpServletRequest
@GetMapping("/request")
public String getRequest(HttpServletRequest request) {
    return request.getRequestURI();
}

// 6. Model
@GetMapping("/page")
public String page(Model model) {
    model.addAttribute("message", "Hello");
    return "page";
}
```

---

## 5. 返回值处理器

### 5.1 HandlerMethodReturnValueHandler

```java
public interface HandlerMethodReturnValueHandler {
    
    /**
     * 是否支持该返回值类型
     */
    boolean supportsReturnType(MethodParameter returnType);
    
    /**
     * 处理返回值
     */
    void handleReturnValue(@Nullable Object returnValue, MethodParameter returnType,
            ModelAndViewContainer mavContainer, NativeWebRequest webRequest) throws Exception;
}
```

### 5.2 常用返回值类型

```java
// 1. String（视图名）
@GetMapping("/page")
public String page() {
    return "user/list";  // 视图名
}

// 2. ModelAndView
@GetMapping("/page")
public ModelAndView page() {
    ModelAndView mav = new ModelAndView("user/list");
    mav.addObject("users", userService.findAll());
    return mav;
}

// 3. @ResponseBody（JSON）
@GetMapping("/users")
@ResponseBody
public List<User> list() {
    return userService.findAll();
}

// 4. ResponseEntity
@GetMapping("/users/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.findById(id);
    if (user == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(user);
}

// 5. void
@GetMapping("/download")
public void download(HttpServletResponse response) throws IOException {
    // 直接操作 response
    response.getOutputStream().write(data);
}
```

---

## 6. 数据绑定

### 6.1 WebDataBinder

```java
@InitBinder
public void initBinder(WebDataBinder binder) {
    // 1. 注册自定义编辑器
    binder.registerCustomEditor(Date.class, new CustomDateEditor(
        new SimpleDateFormat("yyyy-MM-dd"), false));
    
    // 2. 设置允许的字段
    binder.setAllowedFields("username", "email");
    
    // 3. 设置禁止的字段
    binder.setDisallowedFields("id", "password");
    
    // 4. 添加验证器
    binder.addValidators(new UserValidator());
}
```

---

## 7. 实际落地场景（工作实战）

### 场景 1：统一异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        ErrorResponse error = new ErrorResponse(500, e.getMessage());
        return ResponseEntity.status(500).body(error);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException e) {
        ErrorResponse error = new ErrorResponse(400, e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
```

### 场景 2：参数校验

```java
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    
    @PostMapping
    public User createUser(@Valid @RequestBody UserDTO userDTO) {
        return userService.create(userDTO);
    }
}

public class UserDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在3-20之间")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Min(value = 18, message = "年龄不能小于18")
    private Integer age;
}
```

---

## 8. 学习自检清单

- [ ] 能够说出 HandlerAdapter 的作用
- [ ] 能够解释参数解析器的工作原理
- [ ] 能够使用常见的参数注解
- [ ] 能够处理不同类型的返回值
- [ ] 能够配置数据绑定和参数校验

---

## 9. 参考资料

**Spring 官方文档**：
- [Handler Methods](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-ann-methods)

**源码位置**：
- `org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter`
- `org.springframework.web.method.support.HandlerMethodArgumentResolver`
- `org.springframework.web.method.support.HandlerMethodReturnValueHandler`

---

**上一章** ← [第 18 章：HandlerMapping 映射机制](./content-18.md)  
**下一章** → [第 20 章：视图解析与渲染](./content-20.md)  
**返回目录** → [学习大纲](../content-outline.md)
