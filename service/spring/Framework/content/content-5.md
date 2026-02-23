# 第 5 章：依赖注入实现机制

> **学习目标**：深入理解 Spring 依赖注入的底层实现原理，掌握三种注入方式的源码机制  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐ 进阶  
> **源码入口**：`AutowiredAnnotationBeanPostProcessor.postProcessProperties()`

---

## 1. 核心概念

### 1.1 什么是依赖注入

**依赖注入（Dependency Injection，DI）** 是 IoC 的一种实现方式，由容器负责将依赖关系注入到对象中。

**传统方式 vs 依赖注入**：

```java
// 传统方式：主动创建依赖
public class UserService {
    private UserDao userDao = new UserDaoImpl(); // 硬编码
    
    public void save(User user) {
        userDao.save(user);
    }
}

// 依赖注入：被动接收依赖
public class UserService {
    private UserDao userDao; // 容器注入
    
    public void save(User user) {
        userDao.save(user);
    }
}
```

### 1.2 三种注入方式

Spring 支持三种依赖注入方式：

1. **构造器注入**（推荐）
2. **Setter 注入**
3. **字段注入**

---

## 2. 三种注入方式对比

### 2.1 构造器注入

```java
@Service
public class UserService {
    private final UserDao userDao;
    private final EmailService emailService;
    
    @Autowired
    public UserService(UserDao userDao, EmailService emailService) {
        this.userDao = userDao;
        this.emailService = emailService;
    }
}
```

**优点**：
- ✅ 依赖不可变（final 修饰）
- ✅ 确保依赖完整（对象创建后立即可用）
- ✅ 利于单元测试（可直接 new 对象）
- ✅ 避免循环依赖（编译期发现）

**缺点**：
- ❌ 依赖较多时构造器参数过多

### 2.2 Setter 注入

```java
@Service
public class UserService {
    private UserDao userDao;
    private EmailService emailService;
    
    @Autowired
    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
    
    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```

**优点**：
- ✅ 可选依赖（`@Autowired(required = false)`）
- ✅ 支持重新配置

**缺点**：
- ❌ 依赖可变
- ❌ 对象创建后可能不完整

### 2.3 字段注入

```java
@Service
public class UserService {
    @Autowired
    private UserDao userDao;
    
    @Autowired
    private EmailService emailService;
}
```

**优点**：
- ✅ 代码简洁

**缺点**：
- ❌ 无法使用 final
- ❌ 难以单元测试（需要反射）
- ❌ 违反单一职责（隐藏依赖）
- ❌ 不推荐使用

### 2.4 注入方式对比表

| 特性 | 构造器注入 | Setter 注入 | 字段注入 |
|------|-----------|------------|----------|
| **不可变性** | ✅ final | ❌ | ❌ |
| **完整性保证** | ✅ | ❌ | ❌ |
| **单元测试** | ✅ 易 | ⚠️ 一般 | ❌ 难 |
| **循环依赖** | ❌ 不支持 | ✅ 支持 | ✅ 支持 |
| **可选依赖** | ❌ | ✅ | ✅ |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

**Spring 官方推荐**：
- 必需依赖：构造器注入
- 可选依赖：Setter 注入
- 避免使用：字段注入

---

## 3. @Autowired 注解处理原理

### 3.1 AutowiredAnnotationBeanPostProcessor

`AutowiredAnnotationBeanPostProcessor` 是处理 `@Autowired`、`@Value`、`@Inject` 注解的核心类。

**类图**：

```
    BeanPostProcessor
           │
           ├─ InstantiationAwareBeanPostProcessor
           │        │
           │        └─ SmartInstantiationAwareBeanPostProcessor
           │                    │
           │                    └─ AutowiredAnnotationBeanPostProcessor
           │
           └─ MergedBeanDefinitionPostProcessor
```

**核心方法**：

```java
public class AutowiredAnnotationBeanPostProcessor extends InstantiationAwareBeanPostProcessorAdapter
        implements MergedBeanDefinitionPostProcessor, PriorityOrdered, BeanFactoryAware {
    
    // 处理的注解类型
    private final Set<Class<? extends Annotation>> autowiredAnnotationTypes = new LinkedHashSet<>(4);
    
    public AutowiredAnnotationBeanPostProcessor() {
        this.autowiredAnnotationTypes.add(Autowired.class);
        this.autowiredAnnotationTypes.add(Value.class);
        try {
            this.autowiredAnnotationTypes.add((Class<? extends Annotation>)
                ClassUtils.forName("javax.inject.Inject", AutowiredAnnotationBeanPostProcessor.class.getClassLoader()));
        } catch (ClassNotFoundException ex) {
            // JSR-330 API 不存在
        }
    }
    
    // 1. 收集注入元数据
    @Override
    public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
        InjectionMetadata metadata = findAutowiringMetadata(beanName, beanType, null);
        metadata.checkConfigMembers(beanDefinition);
    }
    
    // 2. 执行属性注入
    @Override
    public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) {
        InjectionMetadata metadata = findAutowiringMetadata(beanName, bean.getClass(), pvs);
        try {
            metadata.inject(bean, beanName, pvs);
        } catch (BeanCreationException ex) {
            throw ex;
        } catch (Throwable ex) {
            throw new BeanCreationException(beanName, "Injection of autowired dependencies failed", ex);
        }
        return pvs;
    }
}
```

### 3.2 注入元数据收集

```java
private InjectionMetadata findAutowiringMetadata(String beanName, Class<?> clazz, PropertyValues pvs) {
    // 1. 从缓存获取
    String cacheKey = (StringUtils.hasLength(beanName) ? beanName : clazz.getName());
    InjectionMetadata metadata = this.injectionMetadataCache.get(cacheKey);
    
    if (InjectionMetadata.needsRefresh(metadata, clazz)) {
        synchronized (this.injectionMetadataCache) {
            metadata = this.injectionMetadataCache.get(cacheKey);
            if (InjectionMetadata.needsRefresh(metadata, clazz)) {
                if (metadata != null) {
                    metadata.clear(pvs);
                }
                // 2. 构建注入元数据
                metadata = buildAutowiringMetadata(clazz);
                this.injectionMetadataCache.put(cacheKey, metadata);
            }
        }
    }
    return metadata;
}

private InjectionMetadata buildAutowiringMetadata(final Class<?> clazz) {
    List<InjectionMetadata.InjectedElement> elements = new ArrayList<>();
    Class<?> targetClass = clazz;
    
    do {
        final List<InjectionMetadata.InjectedElement> currElements = new ArrayList<>();
        
        // 1. 处理字段注入
        ReflectionUtils.doWithLocalFields(targetClass, field -> {
            AnnotationAttributes ann = findAutowiredAnnotation(field);
            if (ann != null) {
                if (Modifier.isStatic(field.getModifiers())) {
                    return; // 跳过静态字段
                }
                boolean required = determineRequiredStatus(ann);
                currElements.add(new AutowiredFieldElement(field, required));
            }
        });
        
        // 2. 处理方法注入（包括 Setter 和构造器）
        ReflectionUtils.doWithLocalMethods(targetClass, method -> {
            Method bridgedMethod = BridgeMethodResolver.findBridgedMethod(method);
            if (!BridgeMethodResolver.isVisibilityBridgeMethodPair(method, bridgedMethod)) {
                return;
            }
            AnnotationAttributes ann = findAutowiredAnnotation(bridgedMethod);
            if (ann != null && method.equals(ClassUtils.getMostSpecificMethod(method, clazz))) {
                if (Modifier.isStatic(method.getModifiers())) {
                    return; // 跳过静态方法
                }
                boolean required = determineRequiredStatus(ann);
                PropertyDescriptor pd = BeanUtils.findPropertyForMethod(bridgedMethod, clazz);
                currElements.add(new AutowiredMethodElement(method, required, pd));
            }
        });
        
        elements.addAll(0, currElements);
        targetClass = targetClass.getSuperclass();
    }
    while (targetClass != null && targetClass != Object.class);
    
    return new InjectionMetadata(clazz, elements);
}
```

### 3.3 字段注入实现

```java
private class AutowiredFieldElement extends InjectionMetadata.InjectedElement {
    private final boolean required;
    
    public AutowiredFieldElement(Field field, boolean required) {
        super(field, null);
        this.required = required;
    }
    
    @Override
    protected void inject(Object bean, String beanName, PropertyValues pvs) throws Throwable {
        Field field = (Field) this.member;
        Object value;
        
        // 1. 解析依赖
        if (this.cached) {
            value = resolvedCachedArgument(beanName, this.cachedFieldValue);
        } else {
            DependencyDescriptor desc = new DependencyDescriptor(field, this.required);
            desc.setContainingClass(bean.getClass());
            Set<String> autowiredBeanNames = new LinkedHashSet<>(1);
            TypeConverter typeConverter = beanFactory.getTypeConverter();
            try {
                // 2. 从容器获取依赖对象
                value = beanFactory.resolveDependency(desc, beanName, autowiredBeanNames, typeConverter);
            } catch (BeansException ex) {
                throw new UnsatisfiedDependencyException(null, beanName, new InjectionPoint(field), ex);
            }
            
            // 3. 缓存解析结果
            synchronized (this) {
                if (!this.cached) {
                    if (value != null || this.required) {
                        this.cachedFieldValue = desc;
                        registerDependentBeans(beanName, autowiredBeanNames);
                        if (autowiredBeanNames.size() == 1) {
                            String autowiredBeanName = autowiredBeanNames.iterator().next();
                            if (beanFactory.containsBean(autowiredBeanName) &&
                                    beanFactory.isTypeMatch(autowiredBeanName, field.getType())) {
                                this.cachedFieldValue = new ShortcutDependencyDescriptor(
                                    desc, autowiredBeanName, field.getType());
                            }
                        }
                    } else {
                        this.cachedFieldValue = null;
                    }
                    this.cached = true;
                }
            }
        }
        
        // 4. 反射设置字段值
        if (value != null) {
            ReflectionUtils.makeAccessible(field);
            field.set(bean, value);
        }
    }
}
```

### 3.4 方法注入实现（Setter/构造器）

```java
private class AutowiredMethodElement extends InjectionMetadata.InjectedElement {
    private final boolean required;
    
    public AutowiredMethodElement(Method method, boolean required, PropertyDescriptor pd) {
        super(method, pd);
        this.required = required;
    }
    
    @Override
    protected void inject(Object bean, String beanName, PropertyValues pvs) throws Throwable {
        if (checkPropertySkipping(pvs)) {
            return;
        }
        
        Method method = (Method) this.member;
        Object[] arguments;
        
        // 1. 解析方法参数
        if (this.cached) {
            arguments = resolveCachedArguments(beanName);
        } else {
            Class<?>[] paramTypes = method.getParameterTypes();
            arguments = new Object[paramTypes.length];
            DependencyDescriptor[] descriptors = new DependencyDescriptor[paramTypes.length];
            Set<String> autowiredBeans = new LinkedHashSet<>(paramTypes.length);
            TypeConverter typeConverter = beanFactory.getTypeConverter();
            
            for (int i = 0; i < arguments.length; i++) {
                MethodParameter methodParam = new MethodParameter(method, i);
                DependencyDescriptor currDesc = new DependencyDescriptor(methodParam, this.required);
                currDesc.setContainingClass(bean.getClass());
                descriptors[i] = currDesc;
                
                try {
                    // 2. 从容器获取依赖对象
                    Object arg = beanFactory.resolveDependency(currDesc, beanName, autowiredBeans, typeConverter);
                    if (arg == null && !this.required) {
                        arguments = null;
                        break;
                    }
                    arguments[i] = arg;
                } catch (BeansException ex) {
                    throw new UnsatisfiedDependencyException(null, beanName, new InjectionPoint(methodParam), ex);
                }
            }
            
            // 3. 缓存解析结果
            synchronized (this) {
                if (!this.cached) {
                    if (arguments != null) {
                        this.cachedMethodArguments = descriptors;
                        registerDependentBeans(beanName, autowiredBeans);
                    } else {
                        this.cachedMethodArguments = null;
                    }
                    this.cached = true;
                }
            }
        }
        
        // 4. 反射调用方法
        if (arguments != null) {
            try {
                ReflectionUtils.makeAccessible(method);
                method.invoke(bean, arguments);
            } catch (InvocationTargetException ex) {
                throw ex.getTargetException();
            }
        }
    }
}
```

---

## 4. 依赖解析核心流程

### 4.1 resolveDependency() - 依赖解析入口

```java
// DefaultListableBeanFactory
@Override
public Object resolveDependency(DependencyDescriptor descriptor, String requestingBeanName,
        Set<String> autowiredBeanNames, TypeConverter typeConverter) throws BeansException {
    
    descriptor.initParameterNameDiscovery(getParameterNameDiscoverer());
    
    // 1. 特殊类型处理
    if (Optional.class == descriptor.getDependencyType()) {
        return createOptionalDependency(descriptor, requestingBeanName);
    } else if (ObjectFactory.class == descriptor.getDependencyType() ||
            ObjectProvider.class == descriptor.getDependencyType()) {
        return new DependencyObjectProvider(descriptor, requestingBeanName);
    } else if (javaxInjectProviderClass == descriptor.getDependencyType()) {
        return new Jsr330Factory().createDependencyProvider(descriptor, requestingBeanName);
    } else {
        // 2. 懒加载代理
        Object result = getAutowireCandidateResolver().getLazyResolutionProxyIfNecessary(
            descriptor, requestingBeanName);
        if (result == null) {
            // 3. 真正的依赖解析
            result = doResolveDependency(descriptor, requestingBeanName, autowiredBeanNames, typeConverter);
        }
        return result;
    }
}
```

### 4.2 doResolveDependency() - 核心解析逻辑

```java
public Object doResolveDependency(DependencyDescriptor descriptor, String beanName,
        Set<String> autowiredBeanNames, TypeConverter typeConverter) throws BeansException {
    
    InjectionPoint previousInjectionPoint = ConstructorResolver.setCurrentInjectionPoint(descriptor);
    try {
        // 1. 尝试快捷方式（缓存）
        Object shortcut = descriptor.resolveShortcut(this);
        if (shortcut != null) {
            return shortcut;
        }
        
        Class<?> type = descriptor.getDependencyType();
        
        // 2. 处理 @Value 注解
        Object value = getAutowireCandidateResolver().getSuggestedValue(descriptor);
        if (value != null) {
            if (value instanceof String) {
                String strVal = resolveEmbeddedValue((String) value);
                BeanDefinition bd = (beanName != null && containsBean(beanName) ?
                    getMergedBeanDefinition(beanName) : null);
                value = evaluateBeanDefinitionString(strVal, bd);
            }
            TypeConverter converter = (typeConverter != null ? typeConverter : getTypeConverter());
            return converter.convertIfNecessary(value, type, descriptor.getTypeDescriptor());
        }
        
        // 3. 处理集合类型依赖（Array、Collection、Map）
        Object multipleBeans = resolveMultipleBeans(descriptor, beanName, autowiredBeanNames, typeConverter);
        if (multipleBeans != null) {
            return multipleBeans;
        }
        
        // 4. 查找匹配的 Bean
        Map<String, Object> matchingBeans = findAutowireCandidates(beanName, type, descriptor);
        if (matchingBeans.isEmpty()) {
            if (isRequired(descriptor)) {
                raiseNoMatchingBeanFound(type, descriptor.getResolvableType(), descriptor);
            }
            return null;
        }
        
        String autowiredBeanName;
        Object instanceCandidate;
        
        // 5. 多个候选 Bean，确定唯一
        if (matchingBeans.size() > 1) {
            autowiredBeanName = determineAutowireCandidate(matchingBeans, descriptor);
            if (autowiredBeanName == null) {
                if (isRequired(descriptor) || !indicatesMultipleBeans(type)) {
                    return descriptor.resolveNotUnique(descriptor.getResolvableType(), matchingBeans);
                } else {
                    return null;
                }
            }
            instanceCandidate = matchingBeans.get(autowiredBeanName);
        } else {
            // 6. 只有一个候选 Bean
            Map.Entry<String, Object> entry = matchingBeans.entrySet().iterator().next();
            autowiredBeanName = entry.getKey();
            instanceCandidate = entry.getValue();
        }
        
        if (autowiredBeanNames != null) {
            autowiredBeanNames.add(autowiredBeanName);
        }
        
        // 7. 实例化候选 Bean
        if (instanceCandidate instanceof Class) {
            instanceCandidate = descriptor.resolveCandidate(autowiredBeanName, type, this);
        }
        
        Object result = instanceCandidate;
        if (result instanceof NullBean) {
            if (isRequired(descriptor)) {
                raiseNoMatchingBeanFound(type, descriptor.getResolvableType(), descriptor);
            }
            result = null;
        }
        if (!ClassUtils.isAssignableValue(type, result)) {
            throw new BeanNotOfRequiredTypeException(autowiredBeanName, type, instanceCandidate.getClass());
        }
        return result;
    } finally {
        ConstructorResolver.setCurrentInjectionPoint(previousInjectionPoint);
    }
}
```

### 4.3 查找候选 Bean

```java
protected Map<String, Object> findAutowireCandidates(
        String beanName, Class<?> requiredType, DependencyDescriptor descriptor) {
    
    // 1. 获取指定类型的所有 Bean 名称
    String[] candidateNames = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(
        this, requiredType, true, descriptor.isEager());
    
    Map<String, Object> result = new LinkedHashMap<>(candidateNames.length);
    
    // 2. 检查预解析的依赖
    for (Map.Entry<Class<?>, Object> classObjectEntry : this.resolvableDependencies.entrySet()) {
        Class<?> autowiringType = classObjectEntry.getKey();
        if (autowiringType.isAssignableFrom(requiredType)) {
            Object autowiringValue = classObjectEntry.getValue();
            autowiringValue = AutowireUtils.resolveAutowiringValue(autowiringValue, requiredType);
            if (requiredType.isInstance(autowiringValue)) {
                result.put(ObjectUtils.identityToString(autowiringValue), autowiringValue);
                break;
            }
        }
    }
    
    // 3. 遍历候选 Bean
    for (String candidate : candidateNames) {
        if (!isSelfReference(beanName, candidate) && isAutowireCandidate(candidate, descriptor)) {
            addCandidateEntry(result, candidate, descriptor, requiredType);
        }
    }
    
    // 4. 检查回退匹配
    if (result.isEmpty()) {
        boolean multiple = indicatesMultipleBeans(requiredType);
        DependencyDescriptor fallbackDescriptor = descriptor.forFallbackMatch();
        for (String candidate : candidateNames) {
            if (!isSelfReference(beanName, candidate) && isAutowireCandidate(candidate, fallbackDescriptor) &&
                    (!multiple || getAutowireCandidateResolver().hasQualifier(descriptor))) {
                addCandidateEntry(result, candidate, descriptor, requiredType);
            }
        }
        
        // 5. 允许自引用作为回退
        if (result.isEmpty() && !multiple) {
            for (String candidate : candidateNames) {
                if (isSelfReference(beanName, candidate) &&
                        (!(descriptor instanceof MultiElementDescriptor) || !beanName.equals(candidate)) &&
                        isAutowireCandidate(candidate, fallbackDescriptor)) {
                    addCandidateEntry(result, candidate, descriptor, requiredType);
                }
            }
        }
    }
    
    return result;
}
```

### 4.4 确定唯一候选 Bean

```java
protected String determineAutowireCandidate(Map<String, Object> candidates, DependencyDescriptor descriptor) {
    Class<?> requiredType = descriptor.getDependencyType();
    
    // 1. 查找 @Primary Bean
    String primaryCandidate = determinePrimaryCandidate(candidates, requiredType);
    if (primaryCandidate != null) {
        return primaryCandidate;
    }
    
    // 2. 查找优先级最高的 Bean（@Priority）
    String priorityCandidate = determineHighestPriorityCandidate(candidates, requiredType);
    if (priorityCandidate != null) {
        return priorityCandidate;
    }
    
    // 3. 按名称匹配
    for (Map.Entry<String, Object> entry : candidates.entrySet()) {
        String candidateName = entry.getKey();
        Object beanInstance = entry.getValue();
        if ((beanInstance != null && this.resolvableDependencies.containsValue(beanInstance)) ||
                matchesBeanName(candidateName, descriptor.getDependencyName())) {
            return candidateName;
        }
    }
    
    return null;
}
```

**候选 Bean 确定策略**：

```
多个候选Bean
    ↓
1. 查找 @Primary 标注的Bean
    ↓ 未找到
2. 查找 @Priority 优先级最高的Bean
    ↓ 未找到
3. 按字段名/参数名匹配Bean名称
    ↓ 未找到
4. 抛出 NoUniqueBeanDefinitionException
```

---

## 5. 类型匹配与转换

### 5.1 类型匹配

```java
// 判断 Bean 是否匹配指定类型
public boolean isTypeMatch(String name, ResolvableType typeToMatch) throws NoSuchBeanDefinitionException {
    String beanName = transformedBeanName(name);
    
    // 1. 检查单例缓存
    Object beanInstance = getSingleton(beanName, false);
    if (beanInstance != null && beanInstance.getClass() != NullBean.class) {
        if (beanInstance instanceof FactoryBean) {
            if (!BeanFactoryUtils.isFactoryDereference(name)) {
                Class<?> type = getTypeForFactoryBean((FactoryBean<?>) beanInstance);
                return (type != null && typeToMatch.isAssignableFrom(type));
            } else {
                return typeToMatch.isInstance(beanInstance);
            }
        } else if (!BeanFactoryUtils.isFactoryDereference(name)) {
            return typeToMatch.isInstance(beanInstance);
        } else {
            return false;
        }
    }
    
    // 2. 检查 Bean 定义
    BeanFactory parentBeanFactory = getParentBeanFactory();
    if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
        return parentBeanFactory.isTypeMatch(originalBeanName(name), typeToMatch);
    }
    
    RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
    
    // 3. 检查 Bean Class
    Class<?> classToMatch = typeToMatch.resolve();
    if (classToMatch == null) {
        classToMatch = FactoryBean.class;
    }
    
    Class<?>[] typesToMatch = (FactoryBean.class == classToMatch ?
        new Class<?>[] {classToMatch} : new Class<?>[] {FactoryBean.class, classToMatch});
    
    // 4. 预测 Bean 类型
    Class<?> beanType = predictBeanType(beanName, mbd, typesToMatch);
    if (beanType == null) {
        return false;
    }
    
    // 5. 处理 FactoryBean
    if (FactoryBean.class.isAssignableFrom(beanType)) {
        if (!BeanFactoryUtils.isFactoryDereference(name) && beanInstance == null) {
            beanType = getTypeForFactoryBean(beanName, mbd);
            if (beanType == null) {
                return false;
            }
        }
    } else if (BeanFactoryUtils.isFactoryDereference(name)) {
        return false;
    }
    
    ResolvableType resolvableType = mbd.targetType;
    if (resolvableType == null) {
        resolvableType = mbd.factoryMethodReturnType;
    }
    if (resolvableType != null && resolvableType.resolve() == beanType) {
        return typeToMatch.isAssignableFrom(resolvableType);
    }
    return typeToMatch.isAssignableFrom(beanType);
}
```

### 5.2 类型转换

```java
// 类型转换服务
public interface ConversionService {
    boolean canConvert(Class<?> sourceType, Class<?> targetType);
    <T> T convert(Object source, Class<T> targetType);
    boolean canConvert(TypeDescriptor sourceType, TypeDescriptor targetType);
    Object convert(Object source, TypeDescriptor sourceType, TypeDescriptor targetType);
}

// 默认实现
public class DefaultConversionService extends GenericConversionService {
    public DefaultConversionService() {
        addDefaultConverters(this);
    }
    
    public static void addDefaultConverters(ConverterRegistry converterRegistry) {
        addScalarConverters(converterRegistry);
        addCollectionConverters(converterRegistry);
        
        converterRegistry.addConverter(new ByteBufferConverter((ConversionService) converterRegistry));
        converterRegistry.addConverter(new StringToTimeZoneConverter());
        converterRegistry.addConverter(new ZoneIdToTimeZoneConverter());
        converterRegistry.addConverter(new ZonedDateTimeToCalendarConverter());
        
        converterRegistry.addConverter(new ObjectToObjectConverter());
        converterRegistry.addConverter(new IdToEntityConverter((ConversionService) converterRegistry));
        converterRegistry.addConverter(new FallbackObjectToStringConverter());
        converterRegistry.addConverter(new ObjectToOptionalConverter((ConversionService) converterRegistry));
    }
}
```

---

## 6. 构造器注入特殊处理

### 6.1 构造器选择

```java
// ConstructorResolver.autowireConstructor()
public BeanWrapper autowireConstructor(String beanName, RootBeanDefinition mbd,
        Constructor<?>[] chosenCtors, Object[] explicitArgs) {
    
    BeanWrapperImpl bw = new BeanWrapperImpl();
    this.beanFactory.initBeanWrapper(bw);
    
    Constructor<?> constructorToUse = null;
    ArgumentsHolder argsHolderToUse = null;
    Object[] argsToUse = null;
    
    // 1. 确定构造器参数
    if (explicitArgs != null) {
        argsToUse = explicitArgs;
    } else {
        Object[] argsToResolve = null;
        synchronized (mbd.constructorArgumentLock) {
            constructorToUse = (Constructor<?>) mbd.resolvedConstructorOrFactoryMethod;
            if (constructorToUse != null && mbd.constructorArgumentsResolved) {
                argsToUse = mbd.resolvedConstructorArguments;
                if (argsToUse == null) {
                    argsToResolve = mbd.preparedConstructorArguments;
                }
            }
        }
        if (argsToResolve != null) {
            argsToUse = resolvePreparedArguments(beanName, mbd, bw, constructorToUse, argsToResolve);
        }
    }
    
    // 2. 选择构造器
    if (constructorToUse == null || argsToUse == null) {
        Constructor<?>[] candidates = chosenCtors;
        if (candidates == null) {
            Class<?> beanClass = mbd.getBeanClass();
            try {
                candidates = (mbd.isNonPublicAccessAllowed() ?
                    beanClass.getDeclaredConstructors() : beanClass.getConstructors());
            } catch (Throwable ex) {
                throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Resolution of declared constructors on bean Class [" + beanClass.getName() +
                    "] from ClassLoader [" + beanClass.getClassLoader() + "] failed", ex);
            }
        }
        
        if (candidates.length == 1 && explicitArgs == null && !mbd.hasConstructorArgumentValues()) {
            Constructor<?> uniqueCandidate = candidates[0];
            if (uniqueCandidate.getParameterCount() == 0) {
                synchronized (mbd.constructorArgumentLock) {
                    mbd.resolvedConstructorOrFactoryMethod = uniqueCandidate;
                    mbd.constructorArgumentsResolved = true;
                    mbd.resolvedConstructorArguments = EMPTY_ARGS;
                }
                bw.setBeanInstance(instantiate(beanName, mbd, uniqueCandidate, EMPTY_ARGS));
                return bw;
            }
        }
        
        // 3. 需要自动装配
        boolean autowiring = (chosenCtors != null ||
            mbd.getResolvedAutowireMode() == AutowireCapableBeanFactory.AUTOWIRE_CONSTRUCTOR);
        
        ConstructorArgumentValues resolvedValues = null;
        int minNrOfArgs;
        if (explicitArgs != null) {
            minNrOfArgs = explicitArgs.length;
        } else {
            ConstructorArgumentValues cargs = mbd.getConstructorArgumentValues();
            resolvedValues = new ConstructorArgumentValues();
            minNrOfArgs = resolveConstructorArguments(beanName, mbd, bw, cargs, resolvedValues);
        }
        
        // 4. 排序构造器（public 优先，参数多的优先）
        AutowireUtils.sortConstructors(candidates);
        
        int minTypeDiffWeight = Integer.MAX_VALUE;
        Set<Constructor<?>> ambiguousConstructors = null;
        LinkedList<UnsatisfiedDependencyException> causes = null;
        
        // 5. 遍历构造器，查找最匹配的
        for (Constructor<?> candidate : candidates) {
            Class<?>[] paramTypes = candidate.getParameterTypes();
            
            if (constructorToUse != null && argsToUse != null && argsToUse.length > paramTypes.length) {
                break;
            }
            if (paramTypes.length < minNrOfArgs) {
                continue;
            }
            
            ArgumentsHolder argsHolder;
            if (resolvedValues != null) {
                try {
                    // 解析参数名
                    String[] paramNames = ConstructorPropertiesChecker.evaluate(candidate, paramTypes.length);
                    if (paramNames == null) {
                        ParameterNameDiscoverer pnd = this.beanFactory.getParameterNameDiscoverer();
                        if (pnd != null) {
                            paramNames = pnd.getParameterNames(candidate);
                        }
                    }
                    // 创建参数数组
                    argsHolder = createArgumentArray(beanName, mbd, resolvedValues, bw, paramTypes, paramNames,
                        getUserDeclaredConstructor(candidate), autowiring, candidates.length == 1);
                } catch (UnsatisfiedDependencyException ex) {
                    if (causes == null) {
                        causes = new LinkedList<>();
                    }
                    causes.add(ex);
                    continue;
                }
            } else {
                if (paramTypes.length != explicitArgs.length) {
                    continue;
                }
                argsHolder = new ArgumentsHolder(explicitArgs);
            }
            
            // 6. 计算类型差异权重
            int typeDiffWeight = (mbd.isLenientConstructorResolution() ?
                argsHolder.getTypeDifferenceWeight(paramTypes) : argsHolder.getAssignabilityWeight(paramTypes));
            
            if (typeDiffWeight < minTypeDiffWeight) {
                constructorToUse = candidate;
                argsHolderToUse = argsHolder;
                argsToUse = argsHolder.arguments;
                minTypeDiffWeight = typeDiffWeight;
                ambiguousConstructors = null;
            } else if (constructorToUse != null && typeDiffWeight == minTypeDiffWeight) {
                if (ambiguousConstructors == null) {
                    ambiguousConstructors = new LinkedHashSet<>();
                    ambiguousConstructors.add(constructorToUse);
                }
                ambiguousConstructors.add(candidate);
            }
        }
        
        // 7. 检查是否有歧义
        if (constructorToUse == null) {
            if (causes != null) {
                UnsatisfiedDependencyException ex = causes.removeLast();
                for (Exception cause : causes) {
                    this.beanFactory.onSuppressedException(cause);
                }
                throw ex;
            }
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                "Could not resolve matching constructor " +
                "(hint: specify index/type/name arguments for simple parameters to avoid type ambiguities)");
        } else if (ambiguousConstructors != null && !mbd.isLenientConstructorResolution()) {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                "Ambiguous constructor matches found in bean '" + beanName + "' " +
                "(hint: specify index/type/name arguments for simple parameters to avoid type ambiguities): " +
                ambiguousConstructors);
        }
        
        // 8. 缓存解析结果
        if (explicitArgs == null && argsHolderToUse != null) {
            argsHolderToUse.storeCache(mbd, constructorToUse);
        }
    }
    
    // 9. 实例化Bean
    bw.setBeanInstance(instantiate(beanName, mbd, constructorToUse, argsToUse));
    return bw;
}
```

**构造器选择规则**：
1. 优先选择 public 构造器
2. 参数多的优先
3. 参数类型匹配度最高的
4. 如果有歧义，抛出异常

---

## 7. 实际落地场景（工作实战）

### 场景 1：循环依赖问题

**故障现象**：
```java
@Service
public class ServiceA {
    private final ServiceB serviceB;
    
    public ServiceA(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

@Service
public class ServiceB {
    private final ServiceA serviceA;
    
    public ServiceB(ServiceA serviceA) {
        this.serviceA = serviceA;
    }
}

// 启动报错：
// BeanCurrentlyInCreationException: Error creating bean with name 'serviceA': 
// Requested bean is currently in creation: Is there an unresolvable circular reference?
```

**解决方案**：

```java
// 方案1：改用Setter注入
@Service
public class ServiceA {
    private ServiceB serviceB;
    
    @Autowired
    public void setServiceB(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

// 方案2：使用@Lazy
@Service
public class ServiceA {
    private final ServiceB serviceB;
    
    public ServiceA(@Lazy ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

// 方案3：重构代码
@Service
public class CommonService {
    // 提取公共逻辑
}

@Service
public class ServiceA {
    @Autowired
    private CommonService commonService;
}

@Service
public class ServiceB {
    @Autowired
    private CommonService commonService;
}
```

### 场景 2：多个候选 Bean 问题

**故障现象**：

```java
public interface UserDao {
    void save(User user);
}

@Repository
public class UserDaoJdbcImpl implements UserDao {
    @Override
    public void save(User user) { /* JDBC实现 */ }
}

@Repository
public class UserDaoJpaImpl implements UserDao {
    @Override
    public void save(User user) { /* JPA实现 */ }
}

@Service
public class UserService {
    @Autowired
    private UserDao userDao; // 报错：有2个候选Bean
}

// NoUniqueBeanDefinitionException: 
// No qualifying bean of type 'UserDao' available: 
// expected single matching bean but found 2: userDaoJdbcImpl,userDaoJpaImpl
```

**解决方案**：

```java
// 方案1：使用@Primary
@Repository
@Primary
public class UserDaoJdbcImpl implements UserDao {
    // ...
}

// 方案2：使用@Qualifier
@Service
public class UserService {
    @Autowired
    @Qualifier("userDaoJdbcImpl")
    private UserDao userDao;
}

// 方案3：按名称注入
@Service
public class UserService {
    @Autowired
    private UserDao userDaoJdbcImpl; // 字段名匹配Bean名称
}

// 方案4：使用@Resource（JSR-250）
@Service
public class UserService {
    @Resource(name = "userDaoJdbcImpl")
    private UserDao userDao;
}
```

### 场景 3：构造器注入最佳实践

**推荐写法**：

```java
@Service
public class UserService {
    private final UserDao userDao;
    private final EmailService emailService;
    private final CacheManager cacheManager;
    
    // 推荐：单个构造器，@Autowired可省略
    public UserService(UserDao userDao, 
                      EmailService emailService,
                      CacheManager cacheManager) {
        this.userDao = userDao;
        this.emailService = emailService;
        this.cacheManager = cacheManager;
    }
}

// 配合Lombok简化
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserDao userDao;
    private final EmailService emailService;
    private final CacheManager cacheManager;
}
```

**优势**：
- ✅ 依赖不可变（final）
- ✅ 易于单元测试
- ✅ 避免空指针
- ✅ 利于发现设计问题（依赖过多）

---

## 8. 学习自检清单

- [ ] 能够说出三种注入方式及其优缺点
- [ ] 能够解释 AutowiredAnnotationBeanPostProcessor 的工作原理
- [ ] 能够说明依赖解析的完整流程
- [ ] 能够解决循环依赖问题
- [ ] 能够处理多个候选 Bean 的情况
- [ ] 能够说明构造器选择的规则

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：依赖解析流程、构造器选择、类型匹配
- **前置知识**：反射、泛型
- **实践建议**：
  - 调试 @Autowired 注解处理过程
  - 实现自定义注入注解
  - 分析循环依赖场景

---

## 9. 参考资料

**Spring 官方文档**：
- [Dependency Injection](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-dependencies)

**源码位置**：
- `org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor`
- `org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency()`
- `org.springframework.beans.factory.support.ConstructorResolver`

---

**上一章** ← [第 4 章：容器启动流程详解](./content-4.md)  
**下一章** → [第 6 章：Bean 完整生命周期](./content-6.md)  
**返回目录** → [学习大纲](../content-outline.md)
