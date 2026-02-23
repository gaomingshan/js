# 第 32 章：FactoryBean 原理与应用

深入讲解 FactoryBean 接口的工作原理，理解如何通过 FactoryBean 创建复杂对象。

**学习目标：**
- 理解 FactoryBean 与普通 Bean 的区别
- 掌握 FactoryBean 的使用方法
- 学会在实际项目中应用 FactoryBean

---

## 32.1 FactoryBean 接口

### 接口定义

```java
public interface FactoryBean<T> {
    
    T getObject() throws Exception;
    
    Class<?> getObjectType();
    
    default boolean isSingleton() {
        return true;
    }
}
```

---

## 32.2 使用示例

### 创建 FactoryBean

```java
public class MyServiceFactoryBean implements FactoryBean<MyService> {
    
    private String serviceName;
    private int timeout;
    
    @Override
    public MyService getObject() throws Exception {
        MyService service = new MyService();
        service.setName(serviceName);
        service.setTimeout(timeout);
        service.init();
        return service;
    }
    
    @Override
    public Class<?> getObjectType() {
        return MyService.class;
    }
    
    @Override
    public boolean isSingleton() {
        return true;
    }
    
    // Setters
    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }
    
    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }
}
```

### 注册 FactoryBean

```java
@Configuration
public class AppConfig {
    
    @Bean
    public MyServiceFactoryBean myService() {
        MyServiceFactoryBean factory = new MyServiceFactoryBean();
        factory.setServiceName("demo");
        factory.setTimeout(3000);
        return factory;
    }
}
```

### 获取 Bean

```java
// 获取 FactoryBean 创建的对象
MyService service = context.getBean("myService", MyService.class);

// 获取 FactoryBean 本身
MyServiceFactoryBean factory = context.getBean("&myService", MyServiceFactoryBean.class);
```

---

## 32.3 FactoryBean vs 普通 Bean

| 对比项 | FactoryBean | 普通 Bean |
|--------|-------------|----------|
| **创建方式** | 通过 getObject() | 通过构造方法或工厂方法 |
| **灵活性** | 高，可自定义创建逻辑 | 低 |
| **适用场景** | 复杂对象创建 | 简单对象 |
| **获取方式** | 直接获取或加 & 前缀 | 直接获取 |

---

## 32.4 实际应用场景

### 1. 代理对象创建

```java
public class ProxyFactoryBean implements FactoryBean<MyInterface> {
    
    private Class<?> targetClass;
    
    @Override
    public MyInterface getObject() throws Exception {
        return (MyInterface) Proxy.newProxyInstance(
            targetClass.getClassLoader(),
            new Class[] { MyInterface.class },
            new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    System.out.println("Before method: " + method.getName());
                    Object result = method.invoke(createTarget(), args);
                    System.out.println("After method: " + method.getName());
                    return result;
                }
            }
        );
    }
    
    @Override
    public Class<?> getObjectType() {
        return MyInterface.class;
    }
    
    private Object createTarget() {
        // 创建目标对象
        return new MyInterfaceImpl();
    }
}
```

### 2. 连接池创建

```java
public class DataSourceFactoryBean implements FactoryBean<DataSource> {
    
    private String url;
    private String username;
    private String password;
    
    @Override
    public DataSource getObject() throws Exception {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(5);
        return new HikariDataSource(config);
    }
    
    @Override
    public Class<?> getObjectType() {
        return DataSource.class;
    }
    
    // Setters
}
```

---

## 32.5 本章小结

**核心要点：**
1. FactoryBean 用于创建复杂对象
2. getObject() 返回实际的 Bean 对象
3. 通过 & 前缀可获取 FactoryBean 本身
4. 常用于代理对象、连接池等复杂对象的创建

**相关章节：**
- [第 31 章：@Import 与 ImportSelector 深入](./content-31.md)
- [第 33 章：JDK 动态代理实现](./content-33.md)
- [第 34 章：CGLIB 动态代理实现](./content-34.md)
