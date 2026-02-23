# 第 34 章：CGLIB 动态代理实现

深入讲解 CGLIB 动态代理的原理和实现，理解基于子类的代理机制。

**学习目标：**
- 理解 CGLIB 代理原理
- 掌握 Enhancer 和 MethodInterceptor
- 对比 JDK 动态代理和 CGLIB

---

## 34.1 CGLIB 代理原理

### 核心概念

CGLIB（Code Generation Library）通过**字节码技术**为类创建子类，并重写方法实现代理。

### 与 JDK 动态代理的区别

| 对比项 | JDK 动态代理 | CGLIB 代理 |
|--------|-------------|-----------|
| **代理方式** | 基于接口 | 基于子类 |
| **要求** | 必须有接口 | 无需接口 |
| **原理** | 反射 | 字节码生成 |
| **性能** | 稍慢 | 稍快 |
| **限制** | 只能代理接口方法 | 无法代理 final 类和方法 |

---

## 34.2 使用示例

### 引入依赖

```xml
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.3.0</version>
</dependency>
```

### 目标类

```java
public class UserService {
    
    public User findById(Long id) {
        System.out.println("Finding user: " + id);
        return new User(id, "User" + id);
    }
    
    public void save(User user) {
        System.out.println("Saving user: " + user.getName());
    }
}
```

### MethodInterceptor 实现

```java
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

public class ServiceMethodInterceptor implements MethodInterceptor {
    
    @Override
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) 
            throws Throwable {
        System.out.println("Before: " + method.getName());
        
        // 调用原方法
        Object result = proxy.invokeSuper(obj, args);
        
        System.out.println("After: " + method.getName());
        
        return result;
    }
}
```

### 创建代理对象

```java
import net.sf.cglib.proxy.Enhancer;

public class CglibProxyFactory {
    
    public static <T> T createProxy(Class<T> targetClass, MethodInterceptor interceptor) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(targetClass);
        enhancer.setCallback(interceptor);
        return (T) enhancer.create();
    }
}

// 使用
UserService proxy = CglibProxyFactory.createProxy(
    UserService.class, 
    new ServiceMethodInterceptor()
);

proxy.findById(1L);
```

---

## 34.3 高级应用

### 回调过滤器

```java
import net.sf.cglib.proxy.CallbackFilter;

public class CustomCallbackFilter implements CallbackFilter {
    
    @Override
    public int accept(Method method) {
        if (method.getName().startsWith("find")) {
            return 0;  // 使用第一个拦截器
        } else if (method.getName().startsWith("save")) {
            return 1;  // 使用第二个拦截器
        }
        return 2;  // 使用 NoOp 拦截器
    }
}

// 使用多个拦截器
Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(UserService.class);
enhancer.setCallbacks(new Callback[] {
    new FindMethodInterceptor(),
    new SaveMethodInterceptor(),
    NoOp.INSTANCE
});
enhancer.setCallbackFilter(new CustomCallbackFilter());
UserService proxy = (UserService) enhancer.create();
```

---

## 34.4 Spring 中的应用

Spring AOP 默认使用：
- 有接口：JDK 动态代理
- 无接口：CGLIB 代理

### 强制使用 CGLIB

```java
@EnableAspectJAutoProxy(proxyTargetClass = true)
@Configuration
public class AppConfig {
}
```

或配置文件：
```properties
spring.aop.proxy-target-class=true
```

---

## 34.5 本章小结

**核心要点：**
1. CGLIB 基于子类实现代理
2. 无需接口，但无法代理 final 类和方法
3. 性能优于 JDK 动态代理
4. Spring AOP 同时支持两种代理方式

**相关章节：**
- [第 33 章：JDK 动态代理实现](./content-33.md)
- [第 35 章：基于 FactoryBean 实现代理](./content-35.md)
- [第 36 章：MyBatis @MapperScan 原理分析](./content-36.md)
