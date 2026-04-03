# 第 16 章：Feign 动态代理原理

> **学习目标**：理解 Feign 动态代理原理、掌握 Feign 核心源码、能够调试 Feign 调用流程  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. @FeignClient 注解处理

### 1.1 @FeignClient 注解定义

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FeignClient {
    
    // 服务名称
    @AliasFor("name")
    String value() default "";
    
    String name() default "";
    
    // 完整URL（可选）
    String url() default "";
    
    // 路径前缀
    String path() default "";
    
    // 自定义配置类
    Class<?>[] configuration() default {};
    
    // 降级处理类
    Class<?> fallback() default void.class;
    
    // 降级工厂
    Class<?> fallbackFactory() default void.class;
    
    // 是否作为主Bean
    boolean primary() default true;
    
    // Bean名称
    String qualifier() default "";
}
```

### 1.2 注解扫描与注册

**FeignClientsRegistrar**（核心类）：

```java
class FeignClientsRegistrar implements ImportBeanDefinitionRegistrar, 
        ResourceLoaderAware, EnvironmentAware {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, 
                                         BeanDefinitionRegistry registry) {
        // 1. 注册默认配置
        registerDefaultConfiguration(metadata, registry);
        
        // 2. 注册FeignClient
        registerFeignClients(metadata, registry);
    }
    
    private void registerFeignClients(AnnotationMetadata metadata, 
                                        BeanDefinitionRegistry registry) {
        
        // 1. 获取@EnableFeignClients注解属性
        Map<String, Object> attrs = metadata.getAnnotationAttributes(
            EnableFeignClients.class.getName());
        
        // 2. 扫描@FeignClient接口
        ClassPathScanningCandidateComponentProvider scanner = getScanner();
        scanner.addIncludeFilter(new AnnotationTypeFilter(FeignClient.class));
        
        Set<String> basePackages = getBasePackages(metadata);
        
        for (String basePackage : basePackages) {
            Set<BeanDefinition> candidateComponents = 
                scanner.findCandidateComponents(basePackage);
            
            for (BeanDefinition candidateComponent : candidateComponents) {
                if (candidateComponent instanceof AnnotatedBeanDefinition) {
                    // 3. 注册FeignClient Bean
                    registerFeignClient(registry, 
                        (AnnotatedBeanDefinition) candidateComponent);
                }
            }
        }
    }
    
    private void registerFeignClient(BeanDefinitionRegistry registry,
                                       AnnotatedBeanDefinition annotationMetadata) {
        
        String className = annotationMetadata.getBeanClassName();
        Class<?> clazz = ClassUtils.resolveClassName(className, null);
        
        // 获取@FeignClient注解属性
        Map<String, Object> attributes = annotationMetadata.getMetadata()
            .getAnnotationAttributes(FeignClient.class.getCanonicalName());
        
        String name = getClientName(attributes);
        
        // 创建BeanDefinition
        BeanDefinitionBuilder definition = BeanDefinitionBuilder
            .genericBeanDefinition(FeignClientFactoryBean.class);
        
        definition.addPropertyValue("url", getUrl(attributes));
        definition.addPropertyValue("path", getPath(attributes));
        definition.addPropertyValue("name", name);
        definition.addPropertyValue("type", className);
        definition.addPropertyValue("decode404", attributes.get("decode404"));
        definition.addPropertyValue("fallback", attributes.get("fallback"));
        definition.addPropertyValue("fallbackFactory", 
            attributes.get("fallbackFactory"));
        
        definition.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE);
        
        // 注册到Spring容器
        BeanDefinitionHolder holder = new BeanDefinitionHolder(
            definition.getBeanDefinition(), 
            className, 
            new String[] { name }
        );
        
        BeanDefinitionReaderUtils.registerBeanDefinition(holder, registry);
    }
}
```

**启动流程**：

```
1. @EnableFeignClients 触发
   ↓
2. FeignClientsRegistrar 注册
   ↓
3. 扫描 @FeignClient 接口
   ↓
4. 为每个接口创建 FeignClientFactoryBean
   ↓
5. 注册到 Spring 容器
```

---

## 2. FeignClientFactoryBean 源码

### 2.1 FactoryBean 模式

```java
class FeignClientFactoryBean implements FactoryBean<Object>, 
        InitializingBean, ApplicationContextAware {
    
    private Class<?> type;              // FeignClient接口类型
    private String name;                // 服务名称
    private String url;                 // URL
    private String path;                // 路径
    private boolean decode404;          // 是否解码404
    private Class<?> fallback;          // 降级类
    private Class<?> fallbackFactory;   // 降级工厂
    
    private ApplicationContext applicationContext;
    
    @Override
    public Object getObject() throws Exception {
        return getTarget();
    }
    
    @Override
    public Class<?> getObjectType() {
        return this.type;
    }
    
    @Override
    public boolean isSingleton() {
        return true;
    }
    
    <T> T getTarget() {
        // 1. 获取FeignContext
        FeignContext context = applicationContext.getBean(FeignContext.class);
        
        // 2. 构建Feign.Builder
        Feign.Builder builder = feign(context);
        
        // 3. 处理URL
        if (!StringUtils.hasText(this.url)) {
            // 使用服务发现
            if (!this.name.startsWith("http")) {
                this.url = "http://" + this.name;
            } else {
                this.url = this.name;
            }
            
            // 使用LoadBalancer
            return (T) loadBalance(builder, context, 
                new HardCodedTarget<>(this.type, this.name, this.url));
        }
        
        // 指定URL，不使用LoadBalancer
        if (StringUtils.hasText(this.url) && !this.url.startsWith("http")) {
            this.url = "http://" + this.url;
        }
        
        String url = this.url + cleanPath();
        Client client = getOptional(context, Client.class);
        
        if (client != null) {
            if (client instanceof LoadBalancerFeignClient) {
                client = ((LoadBalancerFeignClient) client).getDelegate();
            }
            builder.client(client);
        }
        
        // 4. 创建代理对象
        Targeter targeter = get(context, Targeter.class);
        return (T) targeter.target(this, builder, context, 
            new HardCodedTarget<>(this.type, this.name, url));
    }
    
    protected Feign.Builder feign(FeignContext context) {
        // 从FeignContext获取配置
        FeignLoggerFactory loggerFactory = get(context, FeignLoggerFactory.class);
        Logger logger = loggerFactory.create(this.type);
        
        Feign.Builder builder = get(context, Feign.Builder.class)
            .logger(logger)
            .encoder(get(context, Encoder.class))
            .decoder(get(context, Decoder.class))
            .contract(get(context, Contract.class));
        
        // 应用配置
        configureFeign(context, builder);
        
        return builder;
    }
}
```

### 2.2 配置加载

```java
protected void configureFeign(FeignContext context, Feign.Builder builder) {
    FeignClientProperties properties = applicationContext
        .getBean(FeignClientProperties.class);
    
    // 1. 加载默认配置
    if (properties != null && properties.isDefaultToProperties()) {
        configureUsingConfiguration(context, builder);
        configureUsingProperties(
            properties.getConfig().get(properties.getDefaultConfig()), 
            builder);
        configureUsingProperties(properties.getConfig().get(this.name), 
            builder);
    } else {
        configureUsingProperties(
            properties.getConfig().get(properties.getDefaultConfig()), 
            builder);
        configureUsingProperties(properties.getConfig().get(this.name), 
            builder);
        configureUsingConfiguration(context, builder);
    }
}
```

---

## 3. 动态代理生成原理（JDK Proxy）

### 3.1 Feign.Builder.build()

```java
public abstract class Feign {
    
    public static class Builder {
        
        private final List<RequestInterceptor> requestInterceptors = 
            new ArrayList<>();
        private Logger.Level logLevel = Logger.Level.NONE;
        private Contract contract = new Contract.Default();
        private Client client = new Client.Default(null, null);
        private Retryer retryer = new Retryer.Default();
        private Logger logger = new NoOpLogger();
        private Encoder encoder = new Encoder.Default();
        private Decoder decoder = new Decoder.Default();
        private QueryMapEncoder queryMapEncoder = new QueryMapEncoder.Default();
        private ErrorDecoder errorDecoder = new ErrorDecoder.Default();
        private Options options = new Options();
        private InvocationHandlerFactory invocationHandlerFactory = 
            new InvocationHandlerFactory.Default();
        
        public <T> T target(Target<T> target) {
            return build().newInstance(target);
        }
        
        public Feign build() {
            // 创建SynchronousMethodHandler工厂
            SynchronousMethodHandler.Factory synchronousMethodHandlerFactory =
                new SynchronousMethodHandler.Factory(client, retryer, 
                    requestInterceptors, logger, logLevel, decode404, 
                    closeAfterDecode, propagationPolicy);
            
            // 创建解析处理器工厂
            ParseHandlersByName handlersByName =
                new ParseHandlersByName(contract, options, encoder, decoder, 
                    queryMapEncoder, errorDecoder, synchronousMethodHandlerFactory);
            
            // 创建ReflectiveFeign
            return new ReflectiveFeign(handlersByName, invocationHandlerFactory, 
                queryMapEncoder);
        }
    }
}
```

### 3.2 ReflectiveFeign.newInstance()

```java
public class ReflectiveFeign extends Feign {
    
    private final ParseHandlersByName targetToHandlersByName;
    private final InvocationHandlerFactory factory;
    private final QueryMapEncoder queryMapEncoder;
    
    @Override
    public <T> T newInstance(Target<T> target) {
        // 1. 解析接口方法，生成MethodHandler映射
        Map<String, MethodHandler> nameToHandler = 
            targetToHandlersByName.apply(target);
        
        Map<Method, MethodHandler> methodToHandler = new LinkedHashMap<>();
        List<DefaultMethodHandler> defaultMethodHandlers = new LinkedList<>();
        
        // 2. 遍历接口所有方法
        for (Method method : target.type().getMethods()) {
            if (method.getDeclaringClass() == Object.class) {
                continue;
            } else if (Util.isDefault(method)) {
                // 处理default方法
                DefaultMethodHandler handler = new DefaultMethodHandler(method);
                defaultMethodHandlers.add(handler);
                methodToHandler.put(method, handler);
            } else {
                // 处理普通方法
                methodToHandler.put(method, 
                    nameToHandler.get(Feign.configKey(target.type(), method)));
            }
        }
        
        // 3. 创建InvocationHandler
        InvocationHandler handler = factory.create(target, methodToHandler);
        
        // 4. 创建JDK动态代理
        T proxy = (T) Proxy.newProxyInstance(
            target.type().getClassLoader(),
            new Class<?>[] {target.type()},
            handler
        );
        
        // 5. 绑定default方法
        for (DefaultMethodHandler defaultMethodHandler : defaultMethodHandlers) {
            defaultMethodHandler.bindTo(proxy);
        }
        
        return proxy;
    }
}
```

**动态代理创建流程**：

```
1. 解析接口方法
   ↓
2. 为每个方法创建MethodHandler
   ↓
3. 创建InvocationHandler
   ↓
4. JDK Proxy.newProxyInstance创建代理
   ↓
5. 返回代理对象
```

---

## 4. RequestTemplate 构建

### 4.1 Contract 接口解析

```java
public interface Contract {
    
    /**
     * 解析接口方法，生成MethodMetadata
     */
    List<MethodMetadata> parseAndValidateMetadata(Class<?> targetType);
}
```

**SpringMvcContract 实现**：

```java
public class SpringMvcContract extends Contract.BaseContract {
    
    @Override
    public MethodMetadata parseAndValidateMetadata(Class<?> targetType, 
                                                     Method method) {
        // 1. 创建MethodMetadata
        MethodMetadata md = super.parseAndValidateMetadata(targetType, method);
        
        // 2. 解析类级别的@RequestMapping
        RequestMapping classAnnotation = 
            findMergedAnnotation(targetType, RequestMapping.class);
        
        if (classAnnotation != null) {
            if (!md.template().headers().containsKey(ACCEPT)) {
                parseProduces(md, method, classAnnotation);
            }
            if (!md.template().headers().containsKey(CONTENT_TYPE)) {
                parseConsumes(md, method, classAnnotation);
            }
            parseHeaders(md, method, classAnnotation);
        }
        
        // 3. 解析方法级别的@RequestMapping/@GetMapping等
        RequestMapping methodAnnotation = 
            findMergedAnnotation(method, RequestMapping.class);
        
        if (methodAnnotation != null) {
            // 解析HTTP方法
            RequestMethod[] methods = methodAnnotation.method();
            if (methods.length == 0) {
                methods = new RequestMethod[] { RequestMethod.GET };
            }
            checkOne(method, methods, "method");
            md.template().method(Request.HttpMethod.valueOf(methods[0].name()));
            
            // 解析路径
            checkAtMostOne(method, methodAnnotation.value(), "value");
            if (methodAnnotation.value().length > 0) {
                String pathValue = emptyToNull(methodAnnotation.value()[0]);
                if (pathValue != null) {
                    pathValue = resolve(pathValue);
                    if (!pathValue.startsWith("/") && 
                        !md.template().path().endsWith("/")) {
                        pathValue = "/" + pathValue;
                    }
                    md.template().uri(pathValue, true);
                }
            }
            
            // 解析produces/consumes
            parseProduces(md, method, methodAnnotation);
            parseConsumes(md, method, methodAnnotation);
            parseHeaders(md, method, methodAnnotation);
        }
        
        // 4. 解析方法参数
        Class<?>[] parameterTypes = method.getParameterTypes();
        Type[] genericParameterTypes = method.getGenericParameterTypes();
        Annotation[][] parameterAnnotations = method.getParameterAnnotations();
        
        for (int i = 0; i < parameterTypes.length; i++) {
            for (Annotation annotation : parameterAnnotations[i]) {
                // @PathVariable
                if (annotation instanceof PathVariable) {
                    PathVariable pathVariable = (PathVariable) annotation;
                    String name = pathVariable.value();
                    checkState(emptyToNull(name) != null,
                        "PathVariable.value() was empty on parameter %s", i);
                    nameParam(md, name, i);
                }
                // @RequestParam
                else if (annotation instanceof RequestParam) {
                    RequestParam requestParam = (RequestParam) annotation;
                    String name = requestParam.value();
                    checkState(emptyToNull(name) != null,
                        "RequestParam.value() was empty on parameter %s", i);
                    
                    Collection<String> query = addTemplateParameter(
                        name, md.template().queries().get(name));
                    md.template().query(name, query);
                    nameParam(md, name, i);
                }
                // @RequestHeader
                else if (annotation instanceof RequestHeader) {
                    RequestHeader requestHeader = (RequestHeader) annotation;
                    String name = requestHeader.value();
                    checkState(emptyToNull(name) != null,
                        "RequestHeader.value() was empty on parameter %s", i);
                    
                    Collection<String> header = addTemplateParameter(
                        name, md.template().headers().get(name));
                    md.template().header(name, header);
                    nameParam(md, name, i);
                }
                // @RequestBody
                else if (annotation instanceof RequestBody) {
                    md.bodyIndex(i);
                    md.bodyType(Types.resolve(targetType, targetType, 
                        genericParameterTypes[i]));
                }
            }
        }
        
        return md;
    }
}
```

### 4.2 BuildTemplateByResolvingArgs

```java
private class BuildTemplateByResolvingArgs implements RequestTemplate.Factory {
    
    private final MethodMetadata metadata;
    private final Map<Integer, Expander> indexToExpander = new LinkedHashMap<>();
    
    @Override
    public RequestTemplate create(Object[] argv) {
        // 1. 复制模板
        RequestTemplate mutable = RequestTemplate.from(metadata.template());
        
        // 2. 填充路径参数
        if (metadata.urlIndex() != null) {
            int urlIndex = metadata.urlIndex();
            checkArgument(argv[urlIndex] != null, 
                "URI parameter %s was null", urlIndex);
            mutable.target(String.valueOf(argv[urlIndex]));
        }
        
        // 3. 填充模板变量
        Map<String, Object> varBuilder = new LinkedHashMap<>();
        
        for (Entry<Integer, Collection<String>> entry : 
                metadata.indexToName().entrySet()) {
            
            int i = entry.getKey();
            Object value = argv[i];
            
            if (value != null) {
                if (indexToExpander.containsKey(i)) {
                    value = expandElements(indexToExpander.get(i), value);
                }
                
                for (String name : entry.getValue()) {
                    varBuilder.put(name, value);
                }
            }
        }
        
        // 4. 解析模板
        RequestTemplate template = resolve(argv, mutable, varBuilder);
        
        // 5. 编码请求体
        if (metadata.bodyIndex() != null) {
            template.body(argv[metadata.bodyIndex()], 
                StandardCharsets.UTF_8);
        } else if (metadata.bodyIndex() == null && 
                   !metadata.formParams().isEmpty()) {
            // Form参数
            template.body(encodeFormParams(argv, metadata), 
                StandardCharsets.UTF_8);
        }
        
        return template;
    }
}
```

---

## 5. MethodHandler 调用链

### 5.1 FeignInvocationHandler

```java
static class FeignInvocationHandler implements InvocationHandler {
    
    private final Target target;
    private final Map<Method, MethodHandler> dispatch;
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) 
            throws Throwable {
        
        // 1. Object方法直接调用
        if ("equals".equals(method.getName())) {
            try {
                Object otherHandler = 
                    args.length > 0 && args[0] != null 
                        ? Proxy.getInvocationHandler(args[0]) 
                        : null;
                return equals(otherHandler);
            } catch (IllegalArgumentException e) {
                return false;
            }
        } else if ("hashCode".equals(method.getName())) {
            return hashCode();
        } else if ("toString".equals(method.getName())) {
            return toString();
        }
        
        // 2. 获取MethodHandler并调用
        return dispatch.get(method).invoke(args);
    }
}
```

### 5.2 SynchronousMethodHandler

```java
final class SynchronousMethodHandler implements MethodHandler {
    
    private final MethodMetadata metadata;
    private final Target<?> target;
    private final Client client;
    private final Retryer retryer;
    private final List<RequestInterceptor> requestInterceptors;
    private final Logger logger;
    private final Logger.Level logLevel;
    private final RequestTemplate.Factory buildTemplateFromArgs;
    private final Options options;
    private final Decoder decoder;
    private final ErrorDecoder errorDecoder;
    
    @Override
    public Object invoke(Object[] argv) throws Throwable {
        // 1. 构建RequestTemplate
        RequestTemplate template = buildTemplateFromArgs.create(argv);
        
        // 2. 应用请求拦截器
        for (RequestInterceptor interceptor : requestInterceptors) {
            interceptor.apply(template);
        }
        
        // 3. 构建Request
        Request request = targetRequest(template);
        
        // 4. 日志记录
        if (logLevel != Logger.Level.NONE) {
            logger.logRequest(metadata.configKey(), logLevel, request);
        }
        
        Response response;
        long start = System.nanoTime();
        
        try {
            // 5. 执行HTTP请求（支持重试）
            response = executeAndDecode(template);
        } catch (RetryableException e) {
            // 6. 重试逻辑
            try {
                retryer.continueOrPropagate(e);
            } catch (RetryableException th) {
                Throwable cause = th.getCause();
                if (propagationPolicy == UNWRAP && cause != null) {
                    throw cause;
                } else {
                    throw th;
                }
            }
            
            if (logLevel != Logger.Level.NONE) {
                logger.logRetry(metadata.configKey(), logLevel);
            }
            
            continue;
        }
        
        long elapsedTime = TimeUnit.NANOSECONDS.toMillis(
            System.nanoTime() - start);
        
        // 7. 解码响应
        if (logLevel != Logger.Level.NONE) {
            response = logger.logAndRebufferResponse(metadata.configKey(), 
                logLevel, response, elapsedTime);
        }
        
        // 8. 处理响应
        if (decoder != null) {
            return decode(response);
        } else {
            return response;
        }
    }
    
    Object executeAndDecode(RequestTemplate template) throws Throwable {
        Request request = targetRequest(template);
        
        // 执行请求
        Response response = client.execute(request, options);
        
        try {
            // 检查响应状态
            if (response.status() >= 200 && response.status() < 300) {
                // 成功响应，解码
                if (void.class == metadata.returnType()) {
                    return null;
                } else {
                    Object result = decode(response);
                    return result;
                }
            } else {
                // 错误响应
                throw errorDecoder.decode(metadata.configKey(), response);
            }
        } catch (IOException e) {
            if (logLevel != Logger.Level.NONE) {
                logger.logIOException(metadata.configKey(), logLevel, e, 
                    elapsedTime(start));
            }
            throw errorReading(request, response, e);
        } finally {
            ensureClosed(response.body());
        }
    }
}
```

---

## 6. Feign + LoadBalancer 协作流程

### 6.1 FeignBlockingLoadBalancerClient

```java
public class FeignBlockingLoadBalancerClient implements Client {
    
    private final Client delegate;
    private final LoadBalancerClient loadBalancerClient;
    private final LoadBalancerProperties properties;
    
    @Override
    public Response execute(Request request, Request.Options options) 
            throws IOException {
        
        final URI originalUri = URI.create(request.url());
        String serviceId = originalUri.getHost();
        
        // 1. 从LoadBalancer选择服务实例
        ServiceInstance instance = loadBalancerClient.choose(serviceId);
        
        if (instance == null) {
            String message = "Load balancer does not contain an instance for the service " + serviceId;
            if (LOG.isWarnEnabled()) {
                LOG.warn(message);
            }
            throw new IllegalStateException(message);
        }
        
        // 2. 重构URL（替换服务名为实例地址）
        String reconstructedUrl = loadBalancerClient.reconstructURI(
            instance, originalUri).toString();
        
        // 3. 创建新的Request
        Request newRequest = Request.create(
            request.httpMethod(),
            reconstructedUrl,
            request.headers(),
            request.body(),
            request.charset(),
            request.requestTemplate()
        );
        
        // 4. 执行请求
        return delegate.execute(newRequest, options);
    }
}
```

**协作流程**：

```
1. Feign代理拦截方法调用
   ↓
2. SynchronousMethodHandler构建Request
   ↓
3. FeignBlockingLoadBalancerClient拦截
   ↓
4. LoadBalancerClient选择服务实例
   ↓
5. 替换URL（http://user-service → http://192.168.1.1:8081）
   ↓
6. 执行HTTP请求
   ↓
7. 返回响应并解码
```

---

## 7. 编解码流程

### 7.1 请求编码

```java
public interface Encoder {
    
    /**
     * 将对象编码为HTTP请求体
     */
    void encode(Object object, Type bodyType, RequestTemplate template) 
        throws EncodeException;
    
    // JacksonEncoder实现
    class JacksonEncoder implements Encoder {
        private final ObjectMapper mapper;
        
        @Override
        public void encode(Object object, Type bodyType, RequestTemplate template) 
                throws EncodeException {
            try {
                String json = mapper.writeValueAsString(object);
                template.body(json, StandardCharsets.UTF_8);
                template.header("Content-Type", "application/json;charset=UTF-8");
            } catch (JsonProcessingException e) {
                throw new EncodeException(e.getMessage(), e);
            }
        }
    }
}
```

### 7.2 响应解码

```java
public interface Decoder {
    
    /**
     * 将HTTP响应解码为对象
     */
    Object decode(Response response, Type type) 
        throws IOException, DecodeException, FeignException;
    
    // JacksonDecoder实现
    class JacksonDecoder implements Decoder {
        private final ObjectMapper mapper;
        
        @Override
        public Object decode(Response response, Type type) 
                throws IOException, FeignException {
            
            if (response.body() == null) {
                return null;
            }
            
            Reader reader = response.body().asReader(StandardCharsets.UTF_8);
            String json = Util.toString(reader);
            
            try {
                return mapper.readValue(json, mapper.constructType(type));
            } catch (IOException e) {
                throw new DecodeException(response.status(), 
                    "Error decoding response body: " + json, response.request(), e);
            }
        }
    }
}
```

---

## 8. Contract 接口解析

### 8.1 Contract 工作流程

```
1. Contract解析@FeignClient接口
   ↓
2. 遍历接口所有方法
   ↓
3. 解析方法注解（@GetMapping/@PostMapping等）
   ↓
4. 解析参数注解（@PathVariable/@RequestParam等）
   ↓
5. 生成MethodMetadata
   ↓
6. 创建RequestTemplate.Factory
   ↓
7. 创建SynchronousMethodHandler
```

### 8.2 MethodMetadata

```java
public final class MethodMetadata implements Serializable {
    
    private String configKey;           // 方法唯一标识
    private transient Type returnType;  // 返回类型
    private Integer urlIndex;           // URL参数索引
    private Integer bodyIndex;          // Body参数索引
    private Integer headerMapIndex;     // HeaderMap参数索引
    private Integer queryMapIndex;      // QueryMap参数索引
    private boolean alwaysEncodeBody;   // 是否总是编码Body
    private RequestTemplate template;   // 请求模板
    private List<String> formParams;    // Form参数
    private Map<Integer, Collection<String>> indexToName;  // 参数索引到名称映射
    private Map<Integer, Class<? extends Expander>> indexToExpanderClass;
    private Map<Integer, Boolean> indexToEncoded;
    private transient Type bodyType;    // Body类型
}
```

---

## 9. 完整调用流程图

```
用户调用
    ↓
JDK代理拦截（FeignInvocationHandler）
    ↓
获取MethodHandler
    ↓
SynchronousMethodHandler.invoke()
    ├─ 1. 构建RequestTemplate
    │   └─ BuildTemplateByResolvingArgs.create()
    │       ├─ 复制模板
    │       ├─ 填充路径参数
    │       ├─ 填充查询参数
    │       └─ 编码请求体
    │
    ├─ 2. 应用RequestInterceptor
    │   └─ 添加认证头/RequestId等
    │
    ├─ 3. 构建Request
    │   └─ targetRequest(template)
    │
    ├─ 4. 执行HTTP请求
    │   └─ FeignBlockingLoadBalancerClient.execute()
    │       ├─ LoadBalancer选择实例
    │       ├─ 重构URL
    │       └─ delegate.execute()（真实HTTP请求）
    │
    └─ 5. 解码响应
        └─ Decoder.decode()
            └─ 返回结果对象
```

---

## 10. 面试要点

### 10.1 基础问题

**Q1：Feign 是如何工作的？**

1. 启动时扫描 @FeignClient 接口
2. 为每个接口创建 FeignClientFactoryBean
3. 使用 JDK 动态代理创建代理对象
4. 调用时拦截方法，构建 HTTP 请求
5. 通过 LoadBalancer 选择实例
6. 执行请求并解码响应

**Q2：Feign 使用的是什么代理方式？**

- JDK 动态代理（基于接口）
- Proxy.newProxyInstance() 创建代理
- FeignInvocationHandler 拦截方法调用

### 10.2 进阶问题

**Q3：Feign 如何实现负载均衡？**

1. FeignBlockingLoadBalancerClient 拦截请求
2. 从 LoadBalancerClient 获取服务实例
3. 重构 URL（服务名→实例地址）
4. 执行真实 HTTP 请求

**Q4：Contract 的作用是什么？**

- 解析接口方法注解
- 生成 MethodMetadata
- 创建 RequestTemplate 模板
- 支持多种注解规范（Spring MVC/JAX-RS/Feign 原生）

### 10.3 架构问题

**Q5：如何调试 Feign 调用流程？**

**断点位置**：
1. FeignInvocationHandler.invoke()
2. SynchronousMethodHandler.invoke()
3. FeignBlockingLoadBalancerClient.execute()
4. Encoder.encode() / Decoder.decode()

**Q6：Feign 的扩展点有哪些？**

- RequestInterceptor（请求拦截）
- Encoder/Decoder（编解码）
- Contract（注解解析）
- ErrorDecoder（错误解码）
- Retryer（重试策略）
- Client（HTTP 客户端）

---

## 11. 参考资料

**源码分析**：
- [OpenFeign GitHub](https://github.com/OpenFeign/feign)
- [Spring Cloud OpenFeign](https://github.com/spring-cloud/spring-cloud-openfeign)

**推荐阅读**：
- 《Spring Cloud 微服务实战》
- 《深入理解 Spring Cloud 与实战》

---

**下一章预告**：第 17 章将学习 Feign 超时重试与性能优化，包括超时配置最佳实践、重试机制深入、HTTP 客户端选择、连接池配置优化等内容。
