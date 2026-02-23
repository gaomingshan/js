# 第 17 章：DispatcherServlet 核心流程

> **学习目标**：深入理解 Spring MVC 的核心分发器工作原理  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐⭐ 高级  
> **源码入口**：`DispatcherServlet.doDispatch()`

---

## 1. 核心概念

**DispatcherServlet** 是 Spring MVC 的前端控制器，负责请求分发和处理流程协调。

**核心职责**：
```
1. 请求接收
2. 处理器映射
3. 处理器适配
4. 视图解析
5. 视图渲染
6. 异常处理
```

---

## 2. Spring MVC 架构

### 2.1 核心组件

```
┌──────────────────────────────────────────────────┐
│              DispatcherServlet                    │
│              (前端控制器)                          │
└──────────────────────────────────────────────────┘
         │           │           │           │
         ↓           ↓           ↓           ↓
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│HandlerMapping│ │HandlerAdapter│ │ViewResolver │ │HandlerException│
│(处理器映射)  │ │(处理器适配器)│ │(视图解析器) │ │Resolver      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
         │                │
         ↓                ↓
┌─────────────┐   ┌─────────────┐
│  Controller  │   │    View     │
│  (控制器)    │   │   (视图)    │
└─────────────┘   └─────────────┘
```

### 2.2 请求处理流程

```
1. 客户端请求 → DispatcherServlet

2. HandlerMapping 查找处理器
   └─> 返回 HandlerExecutionChain (Handler + Interceptors)

3. HandlerAdapter 适配处理器
   └─> 执行 Handler（Controller 方法）
   └─> 返回 ModelAndView

4. ViewResolver 解析视图
   └─> 返回 View 对象

5. View 渲染
   └─> 将 Model 数据填充到视图
   └─> 返回响应给客户端
```

---

## 3. DispatcherServlet 初始化

### 3.1 Servlet 生命周期

```java
public class DispatcherServlet extends FrameworkServlet {
    
    /**
     * Servlet 初始化入口
     */
    @Override
    protected void onRefresh(ApplicationContext context) {
        initStrategies(context);
    }
    
    /**
     * 初始化各种策略组件
     */
    protected void initStrategies(ApplicationContext context) {
        // 1. 初始化文件上传解析器
        initMultipartResolver(context);
        
        // 2. 初始化国际化解析器
        initLocaleResolver(context);
        
        // 3. 初始化主题解析器
        initThemeResolver(context);
        
        // 4. 初始化处理器映射器
        initHandlerMappings(context);
        
        // 5. 初始化处理器适配器
        initHandlerAdapters(context);
        
        // 6. 初始化异常处理器
        initHandlerExceptionResolvers(context);
        
        // 7. 初始化请求到视图名转换器
        initRequestToViewNameTranslator(context);
        
        // 8. 初始化视图解析器
        initViewResolvers(context);
        
        // 9. 初始化 FlashMap 管理器
        initFlashMapManager(context);
    }
}
```

### 3.2 HandlerMapping 初始化

```java
private void initHandlerMappings(ApplicationContext context) {
    this.handlerMappings = null;
    
    if (this.detectAllHandlerMappings) {
        // 从容器获取所有 HandlerMapping
        Map<String, HandlerMapping> matchingBeans =
            BeanFactoryUtils.beansOfTypeIncludingAncestors(context, HandlerMapping.class, true, false);
        
        if (!matchingBeans.isEmpty()) {
            this.handlerMappings = new ArrayList<>(matchingBeans.values());
            // 排序
            AnnotationAwareOrderComparator.sort(this.handlerMappings);
        }
    } else {
        try {
            HandlerMapping hm = context.getBean(HANDLER_MAPPING_BEAN_NAME, HandlerMapping.class);
            this.handlerMappings = Collections.singletonList(hm);
        } catch (NoSuchBeanDefinitionException ex) {
            // Ignore
        }
    }
    
    // 默认策略
    if (this.handlerMappings == null) {
        this.handlerMappings = getDefaultStrategies(context, HandlerMapping.class);
    }
}
```

---

## 4. doDispatch() 核心流程

### 4.1 完整源码

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    HttpServletRequest processedRequest = request;
    HandlerExecutionChain mappedHandler = null;
    boolean multipartRequestParsed = false;
    
    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
    
    try {
        ModelAndView mv = null;
        Exception dispatchException = null;
        
        try {
            // 1. 检查是否文件上传请求
            processedRequest = checkMultipart(request);
            multipartRequestParsed = (processedRequest != request);
            
            // 2. 获取处理器执行链（Handler + Interceptors）
            mappedHandler = getHandler(processedRequest);
            if (mappedHandler == null) {
                noHandlerFound(processedRequest, response);
                return;
            }
            
            // 3. 获取处理器适配器
            HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());
            
            // 4. 处理 Last-Modified 缓存请求
            String method = request.getMethod();
            boolean isGet = "GET".equals(method);
            if (isGet || "HEAD".equals(method)) {
                long lastModified = ha.getLastModified(request, mappedHandler.getHandler());
                if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {
                    return;
                }
            }
            
            // 5. 执行拦截器的 preHandle 方法
            if (!mappedHandler.applyPreHandle(processedRequest, response)) {
                return;
            }
            
            // 6. 执行 Handler（Controller 方法）
            mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
            
            if (asyncManager.isConcurrentHandlingStarted()) {
                return;
            }
            
            // 7. 设置默认视图名
            applyDefaultViewName(processedRequest, mv);
            
            // 8. 执行拦截器的 postHandle 方法
            mappedHandler.applyPostHandle(processedRequest, response, mv);
        } catch (Exception ex) {
            dispatchException = ex;
        } catch (Throwable err) {
            dispatchException = new NestedServletException("Handler dispatch failed", err);
        }
        
        // 9. 处理结果（渲染视图或处理异常）
        processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
    } catch (Exception ex) {
        // 10. 执行拦截器的 afterCompletion 方法（异常情况）
        triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
    } catch (Throwable err) {
        triggerAfterCompletion(processedRequest, response, mappedHandler,
            new NestedServletException("Handler processing failed", err));
    } finally {
        if (asyncManager.isConcurrentHandlingStarted()) {
            if (mappedHandler != null) {
                mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
            }
        } else {
            // 11. 清理文件上传资源
            if (multipartRequestParsed) {
                cleanupMultipart(processedRequest);
            }
        }
    }
}
```

### 4.2 流程图

```
doDispatch() 执行流程：

1. checkMultipart()
   └─> 检查文件上传请求

2. getHandler()
   └─> 遍历 HandlerMapping
       └─> 返回 HandlerExecutionChain

3. getHandlerAdapter()
   └─> 选择合适的 HandlerAdapter

4. Last-Modified 缓存处理

5. mappedHandler.applyPreHandle()
   └─> 执行拦截器 preHandle()

6. ha.handle()
   └─> 执行 Controller 方法
       └─> 返回 ModelAndView

7. applyDefaultViewName()
   └─> 设置默认视图名

8. mappedHandler.applyPostHandle()
   └─> 执行拦截器 postHandle()

9. processDispatchResult()
   └─> 处理异常或渲染视图
       ├─> processHandlerException() (异常)
       └─> render() (正常)
              ├─> resolveViewName()
              │      └─> ViewResolver.resolveViewName()
              └─> view.render()

10. mappedHandler.triggerAfterCompletion()
    └─> 执行拦截器 afterCompletion()
```

---

## 5. 获取处理器：getHandler()

```java
@Nullable
protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
    if (this.handlerMappings != null) {
        // 遍历所有 HandlerMapping
        for (HandlerMapping mapping : this.handlerMappings) {
            HandlerExecutionChain handler = mapping.getHandler(request);
            if (handler != null) {
                return handler;
            }
        }
    }
    return null;
}
```

**HandlerMapping 类型**：
```java
// 1. RequestMappingHandlerMapping
//    处理 @RequestMapping 注解

// 2. BeanNameUrlHandlerMapping
//    根据 Bean 名称匹配 URL

// 3. SimpleUrlHandlerMapping
//    简单 URL 映射
```

---

## 6. 处理器适配：getHandlerAdapter()

```java
protected HandlerAdapter getHandlerAdapter(Object handler) throws ServletException {
    if (this.handlerAdapters != null) {
        // 遍历所有 HandlerAdapter
        for (HandlerAdapter adapter : this.handlerAdapters) {
            if (adapter.supports(handler)) {
                return adapter;
            }
        }
    }
    throw new ServletException("No adapter for handler [" + handler +
        "]: The DispatcherServlet configuration needs to include a HandlerAdapter that supports this handler");
}
```

**HandlerAdapter 类型**：
```java
// 1. RequestMappingHandlerAdapter
//    处理 @RequestMapping 标注的方法

// 2. HttpRequestHandlerAdapter
//    处理 HttpRequestHandler

// 3. SimpleControllerHandlerAdapter
//    处理 Controller 接口
```

---

## 7. 处理结果：processDispatchResult()

```java
private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,
        @Nullable HandlerExecutionChain mappedHandler, @Nullable ModelAndView mv,
        @Nullable Exception exception) throws Exception {
    
    boolean errorView = false;
    
    // 1. 处理异常
    if (exception != null) {
        if (exception instanceof ModelAndViewDefiningException) {
            mv = ((ModelAndViewDefiningException) exception).getModelAndView();
        } else {
            Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);
            mv = processHandlerException(request, response, handler, exception);
            errorView = (mv != null);
        }
    }
    
    // 2. 渲染视图
    if (mv != null && !mv.wasCleared()) {
        render(mv, request, response);
        if (errorView) {
            WebUtils.clearErrorRequestAttributes(request);
        }
    } else {
        if (logger.isTraceEnabled()) {
            logger.trace("No view rendering, null ModelAndView returned.");
        }
    }
    
    if (WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
        return;
    }
    
    // 3. 执行拦截器的 afterCompletion
    if (mappedHandler != null) {
        mappedHandler.triggerAfterCompletion(request, response, null);
    }
}
```

---

## 8. 视图渲染：render()

```java
protected void render(ModelAndView mv, HttpServletRequest request, HttpServletResponse response) 
        throws Exception {
    
    Locale locale = (this.localeResolver != null ? this.localeResolver.resolveLocale(request) : request.getLocale());
    response.setLocale(locale);
    
    View view;
    String viewName = mv.getViewName();
    
    if (viewName != null) {
        // 1. 解析视图名 → View 对象
        view = resolveViewName(viewName, mv.getModelInternal(), locale, request);
        if (view == null) {
            throw new ServletException("Could not resolve view with name '" + mv.getViewName() +
                "' in servlet with name '" + getServletName() + "'");
        }
    } else {
        view = mv.getView();
        if (view == null) {
            throw new ServletException("ModelAndView [" + mv + "] neither contains a view name nor a " +
                "View object in servlet with name '" + getServletName() + "'");
        }
    }
    
    try {
        if (mv.getStatus() != null) {
            response.setStatus(mv.getStatus().value());
        }
        // 2. 渲染视图
        view.render(mv.getModelInternal(), request, response);
    } catch (Exception ex) {
        throw ex;
    }
}

@Nullable
protected View resolveViewName(String viewName, @Nullable Map<String, Object> model,
        Locale locale, HttpServletRequest request) throws Exception {
    
    if (this.viewResolvers != null) {
        // 遍历所有 ViewResolver
        for (ViewResolver viewResolver : this.viewResolvers) {
            View view = viewResolver.resolveViewName(viewName, locale);
            if (view != null) {
                return view;
            }
        }
    }
    return null;
}
```

---

## 9. 拦截器执行

### 9.1 HandlerExecutionChain

```java
public class HandlerExecutionChain {
    
    private final Object handler;
    
    @Nullable
    private HandlerInterceptor[] interceptors;
    
    private int interceptorIndex = -1;
    
    /**
     * 执行拦截器的 preHandle
     */
    boolean applyPreHandle(HttpServletRequest request, HttpServletResponse response) throws Exception {
        HandlerInterceptor[] interceptors = getInterceptors();
        if (!ObjectUtils.isEmpty(interceptors)) {
            for (int i = 0; i < interceptors.length; i++) {
                HandlerInterceptor interceptor = interceptors[i];
                if (!interceptor.preHandle(request, response, this.handler)) {
                    // 如果返回 false，执行已执行拦截器的 afterCompletion
                    triggerAfterCompletion(request, response, null);
                    return false;
                }
                this.interceptorIndex = i;
            }
        }
        return true;
    }
    
    /**
     * 执行拦截器的 postHandle
     */
    void applyPostHandle(HttpServletRequest request, HttpServletResponse response, @Nullable ModelAndView mv)
            throws Exception {
        HandlerInterceptor[] interceptors = getInterceptors();
        if (!ObjectUtils.isEmpty(interceptors)) {
            // 逆序执行
            for (int i = interceptors.length - 1; i >= 0; i--) {
                HandlerInterceptor interceptor = interceptors[i];
                interceptor.postHandle(request, response, this.handler, mv);
            }
        }
    }
    
    /**
     * 执行拦截器的 afterCompletion
     */
    void triggerAfterCompletion(HttpServletRequest request, HttpServletResponse response, @Nullable Exception ex)
            throws Exception {
        HandlerInterceptor[] interceptors = getInterceptors();
        if (!ObjectUtils.isEmpty(interceptors)) {
            // 逆序执行，只执行已执行的拦截器
            for (int i = this.interceptorIndex; i >= 0; i--) {
                HandlerInterceptor interceptor = interceptors[i];
                try {
                    interceptor.afterCompletion(request, response, this.handler, ex);
                } catch (Throwable ex2) {
                    logger.error("HandlerInterceptor.afterCompletion threw exception", ex2);
                }
            }
        }
    }
}
```

### 9.2 拦截器执行顺序

```
假设有拦截器：Interceptor1, Interceptor2, Interceptor3

正常流程：
Interceptor1.preHandle()
Interceptor2.preHandle()
Interceptor3.preHandle()
    ↓
Controller 方法
    ↓
Interceptor3.postHandle()
Interceptor2.postHandle()
Interceptor1.postHandle()
    ↓
视图渲染
    ↓
Interceptor3.afterCompletion()
Interceptor2.afterCompletion()
Interceptor1.afterCompletion()

异常流程（Interceptor2.preHandle 返回 false）：
Interceptor1.preHandle()
Interceptor2.preHandle()  → false
    ↓
Interceptor1.afterCompletion()  (逆序，只执行已执行的)
```

---

## 10. 实际落地场景（工作实战）

### 场景 1：自定义拦截器

```java
@Component
public class LoginInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        // 检查登录状态
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect("/login");
            return false;
        }
        return true;
    }
    
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView modelAndView) throws Exception {
        // 可以修改 ModelAndView
        if (modelAndView != null) {
            modelAndView.addObject("currentTime", new Date());
        }
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, 
            Exception ex) throws Exception {
        // 清理资源
        if (ex != null) {
            logger.error("请求处理异常", ex);
        }
    }
}

// 注册拦截器
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Autowired
    private LoginInterceptor loginInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
            .addPathPatterns("/admin/**")
            .excludePathPatterns("/admin/login");
    }
}
```

### 场景 2：自定义视图解析器

```java
@Configuration
public class ViewResolverConfig {
    
    @Bean
    public ViewResolver viewResolver() {
        InternalResourceViewResolver resolver = new InternalResourceViewResolver();
        resolver.setPrefix("/WEB-INF/views/");
        resolver.setSuffix(".jsp");
        resolver.setViewClass(JstlView.class);
        resolver.setOrder(1);
        return resolver;
    }
    
    @Bean
    public ViewResolver jsonViewResolver() {
        return (viewName, locale) -> {
            if (viewName.startsWith("json:")) {
                return new MappingJackson2JsonView();
            }
            return null;
        };
    }
}
```

---

## 11. 面试准备专项

### 高频面试题：DispatcherServlet 的工作流程？

**完整回答**：

1. **请求到达**：DispatcherServlet 接收请求
2. **处理器映射**：通过 HandlerMapping 查找 Handler
3. **处理器适配**：通过 HandlerAdapter 执行 Handler
4. **拦截器前置**：执行 Interceptor.preHandle()
5. **处理器执行**：执行 Controller 方法
6. **拦截器后置**：执行 Interceptor.postHandle()
7. **视图解析**：通过 ViewResolver 解析视图
8. **视图渲染**：View.render() 填充模型数据
9. **拦截器完成**：执行 Interceptor.afterCompletion()
10. **返回响应**：将结果返回给客户端

---

## 12. 学习自检清单

- [ ] 能够说出 DispatcherServlet 的核心组件
- [ ] 能够画出请求处理流程图
- [ ] 能够解释 doDispatch() 的执行步骤
- [ ] 能够说出拦截器的执行顺序
- [ ] 能够自定义拦截器和视图解析器

---

## 13. 参考资料

**Spring 官方文档**：
- [DispatcherServlet](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-servlet)

**源码位置**：
- `org.springframework.web.servlet.DispatcherServlet`
- `org.springframework.web.servlet.HandlerExecutionChain`

---

**上一章** ← [第 16 章：事务隔离级别与并发问题](./content-16.md)  
**下一章** → [第 18 章：HandlerMapping 映射机制](./content-18.md)  
**返回目录** → [学习大纲](../content-outline.md)
