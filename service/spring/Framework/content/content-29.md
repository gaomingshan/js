# 第 29 章：BeanPostProcessor 扩展

> **学习目标**：深入理解 BeanPostProcessor 扩展机制  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

**BeanPostProcessor** 是 Spring 最重要的扩展点之一，用于在 Bean 初始化前后进行自定义处理。

---

## 2. BeanPostProcessor 接口

```java
public interface BeanPostProcessor {
    
    /**
     * 初始化前处理
     */
    @Nullable
    default Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }
    
    /**
     * 初始化后处理（AOP 代理在这里创建）
     */
    @Nullable
    default Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }
}
```

---

## 3. 实现示例

```java
@Component
public class CustomBeanPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof UserService) {
            System.out.println("初始化前: " + beanName);
        }
        return bean;
    }
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof UserService) {
            System.out.println("初始化后: " + beanName);
            // 可以返回代理对象
            return createProxy(bean);
        }
        return bean;
    }
}
```

---

## 4. 常见 BeanPostProcessor

### 4.1 AutowiredAnnotationBeanPostProcessor

处理 @Autowired、@Value、@Inject 注解

### 4.2 CommonAnnotationBeanPostProcessor

处理 @Resource、@PostConstruct、@PreDestroy 注解

### 4.3 AbstractAutoProxyCreator

创建 AOP 代理

### 4.4 ApplicationContextAwareProcessor

处理 Aware 接口回调

---

## 5. 应用场景

### 场景 1：自定义注解处理

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Monitored {
}

@Component
public class MonitoredBeanPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean.getClass().isAnnotationPresent(Monitored.class)) {
            return createMonitorProxy(bean);
        }
        return bean;
    }
    
    private Object createMonitorProxy(Object bean) {
        return Proxy.newProxyInstance(
            bean.getClass().getClassLoader(),
            bean.getClass().getInterfaces(),
            (proxy, method, args) -> {
                long start = System.currentTimeMillis();
                Object result = method.invoke(bean, args);
                long cost = System.currentTimeMillis() - start;
                System.out.println(method.getName() + " 耗时: " + cost + "ms");
                return result;
            }
        );
    }
}
```

### 场景 2：Bean 验证

```java
@Component
public class ValidationBeanPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        Field[] fields = bean.getClass().getDeclaredFields();
        for (Field field : fields) {
            if (field.isAnnotationPresent(NotNull.class)) {
                field.setAccessible(true);
                try {
                    if (field.get(bean) == null) {
                        throw new IllegalStateException(
                            field.getName() + " 不能为 null in " + beanName);
                    }
                } catch (IllegalAccessException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        return bean;
    }
}
```

---

**上一章** ← [第 28 章：FactoryBean 工厂Bean](./content-28.md)  
**下一章** → [第 30 章：SpEL 表达式语言](./content-30.md)  
**返回目录** → [学习大纲](../content-outline.md)
