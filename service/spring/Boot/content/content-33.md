# 第 33 章：JDK 动态代理实现

深入讲解 JDK 动态代理的原理和实现，为开发高级组件打下基础。

**学习目标：**
- 理解 JDK 动态代理原理
- 掌握 Proxy 和 InvocationHandler
- 学会实现动态代理

---

## 33.1 JDK 动态代理原理

### 核心类

- `java.lang.reflect.Proxy`
- `java.lang.reflect.InvocationHandler`

### 代理流程

```
1. 定义接口
    ↓
2. 实现 InvocationHandler
    ↓
3. 通过 Proxy.newProxyInstance() 创建代理对象
    ↓
4. 调用代理对象方法时，实际调用 InvocationHandler.invoke()
```

---

## 33.2 实现示例

### 接口定义

```java
public interface UserService {
    User findById(Long id);
    void save(User user);
}
```

### InvocationHandler 实现

```java
public class ServiceInvocationHandler implements InvocationHandler {
    
    private final Object target;
    
    public ServiceInvocationHandler(Object target) {
        this.target = target;
    }
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("Before: " + method.getName());
        
        Object result = method.invoke(target, args);
        
        System.out.println("After: " + method.getName());
        
        return result;
    }
}
```

### 创建代理对象

```java
UserService target = new UserServiceImpl();

UserService proxy = (UserService) Proxy.newProxyInstance(
    target.getClass().getClassLoader(),
    new Class[] { UserService.class },
    new ServiceInvocationHandler(target)
);

proxy.findById(1L);  // 会调用 InvocationHandler.invoke()
```

---

## 33.3 高级应用

### 动态代理工厂

```java
public class ProxyFactory {
    
    public static <T> T createProxy(Class<T> interfaceClass, InvocationHandler handler) {
        return (T) Proxy.newProxyInstance(
            interfaceClass.getClassLoader(),
            new Class[] { interfaceClass },
            handler
        );
    }
}
```

### 方法拦截器

```java
public class MethodInterceptor implements InvocationHandler {
    
    private final Object target;
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 前置处理
        before(method, args);
        
        // 执行目标方法
        Object result = method.invoke(target, args);
        
        // 后置处理
        after(method, result);
        
        return result;
    }
    
    private void before(Method method, Object[] args) {
        System.out.println("Before: " + method.getName());
    }
    
    private void after(Method method, Object result) {
        System.out.println("After: " + method.getName());
    }
}
```

---

## 33.4 本章小结

**核心要点：**
1. JDK 动态代理基于接口
2. InvocationHandler 定义代理逻辑
3. Proxy.newProxyInstance() 创建代理对象
4. 适用于接口代理场景

**相关章节：**
- [第 32 章：FactoryBean 原理与应用](./content-32.md)
- [第 34 章：CGLIB 动态代理实现](./content-34.md)
- [第 35 章：基于 FactoryBean 实现代理](./content-35.md)
