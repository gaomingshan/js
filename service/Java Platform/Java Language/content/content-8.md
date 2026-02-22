# 反射机制与动态代理

## 概述

反射（Reflection）是 Java 的元编程能力，允许程序在运行时检查和操作类、方法、字段等元素。动态代理是反射的高级应用，在框架设计（Spring AOP、MyBatis、Hibernate）中广泛使用。

理解反射的本质，需要掌握：
- **Class 对象**：类的运行时表示
- **反射 API**：访问字段、方法、构造器
- **性能开销**：反射的代价与优化
- **动态代理**：JDK 动态代理与 CGLIB 的实现原理

---

## 1. Class 对象的获取与加载

### 三种获取 Class 对象的方式

**1. 类名.class（编译期确定）**

```java
Class<String> clazz = String.class;
```

**2. 对象.getClass()（运行时获取）**

```java
String s = "hello";
Class<?> clazz = s.getClass();
```

**3. Class.forName()（动态加载）**

```java
Class<?> clazz = Class.forName("java.lang.String");
```

### 三种方式的区别

| 方式                 | 类加载时机 | 初始化      | 用途                   |
| -------------------- | ---------- | ----------- | ---------------------- |
| `类名.class`         | 编译期引用 | 不触发初始化 | 类型字面量、泛型       |
| `对象.getClass()`    | 对象已存在 | 已完成初始化 | 获取实际类型           |
| `Class.forName()`    | 动态加载   | **触发初始化** | JDBC 驱动加载、插件化 |

### Class.forName 触发类初始化

```java
class Demo {
    static {
        System.out.println("Demo 初始化");
    }
}

Class<?> clazz1 = Demo.class; // 不输出（不触发初始化）
Class<?> clazz2 = Class.forName("Demo"); // 输出 "Demo 初始化"
```

**原因**：`Class.forName(String name)` 默认 `initialize = true`。

**避免初始化**：

```java
Class<?> clazz = Class.forName("Demo", false, ClassLoader.getSystemClassLoader());
```

### Class 对象的唯一性

同一类加载器加载的类，Class 对象唯一：

```java
Class<?> c1 = String.class;
Class<?> c2 = "hello".getClass();
Class<?> c3 = Class.forName("java.lang.String");

System.out.println(c1 == c2); // true
System.out.println(c2 == c3); // true
```

---

## 2. 反射访问字段、方法、构造器

### 访问字段

```java
class Person {
    private String name;
    public int age;
}

// 获取所有公共字段
Field[] publicFields = Person.class.getFields();

// 获取所有声明字段（包括私有）
Field[] allFields = Person.class.getDeclaredFields();

// 获取特定字段
Field nameField = Person.class.getDeclaredField("name");
nameField.setAccessible(true); // 突破私有访问限制

Person p = new Person();
nameField.set(p, "Alice"); // 设置字段值
String name = (String) nameField.get(p); // 读取字段值
```

### 访问方法

```java
class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    private int subtract(int a, int b) {
        return a - b;
    }
}

// 获取公共方法
Method addMethod = Calculator.class.getMethod("add", int.class, int.class);

// 获取声明方法（包括私有）
Method subtractMethod = Calculator.class.getDeclaredMethod("subtract", int.class, int.class);
subtractMethod.setAccessible(true);

// 调用方法
Calculator calc = new Calculator();
int result1 = (int) addMethod.invoke(calc, 10, 5); // 15
int result2 = (int) subtractMethod.invoke(calc, 10, 5); // 5
```

### 访问构造器

```java
class Person {
    private String name;
    
    private Person(String name) {
        this.name = name;
    }
}

// 获取私有构造器
Constructor<Person> constructor = Person.class.getDeclaredConstructor(String.class);
constructor.setAccessible(true);

// 创建实例
Person p = constructor.newInstance("Alice");
```

### getDeclaredXxx vs getXxx

| 方法                | 范围                       | 继承        |
| ------------------- | -------------------------- | ----------- |
| `getDeclaredFields` | 本类所有字段（含私有）     | 不包含父类  |
| `getFields`         | 本类及父类的公共字段       | 包含父类    |
| `getDeclaredMethods`| 本类所有方法（含私有）     | 不包含父类  |
| `getMethods`        | 本类及父类的公共方法       | 包含父类    |

---

## 3. 反射的性能开销

### 性能测试

```java
class PerformanceTest {
    public void test() { }
    
    public static void main(String[] args) throws Exception {
        PerformanceTest obj = new PerformanceTest();
        Method method = PerformanceTest.class.getMethod("test");
        
        // 直接调用
        long start1 = System.nanoTime();
        for (int i = 0; i < 1000000; i++) {
            obj.test();
        }
        long time1 = System.nanoTime() - start1;
        
        // 反射调用
        long start2 = System.nanoTime();
        for (int i = 0; i < 1000000; i++) {
            method.invoke(obj);
        }
        long time2 = System.nanoTime() - start2;
        
        System.out.println("直接调用: " + time1 + " ns");
        System.out.println("反射调用: " + time2 + " ns");
        System.out.println("倍数: " + (time2 / time1));
    }
}
```

**结果**：反射调用慢约 **50-100 倍**（JDK 版本和优化程度不同）。

### 性能开销的来源

**1. 方法查找**

反射需要遍历方法表查找目标方法：

```java
Method method = clazz.getMethod("methodName", paramTypes);
```

**2. 参数装箱**

```java
method.invoke(obj, 1, 2); // int 装箱为 Integer
```

**3. 权限检查**

每次调用 `invoke` 都执行访问权限检查（除非 `setAccessible(true)`）。

**4. 异常包装**

反射调用的异常被包装为 `InvocationTargetException`。

**5. JIT 优化困难**

JIT 难以内联反射调用，无法进行激进优化。

### 性能优化技巧

**1. 缓存 Method/Field 对象**

```java
// 不推荐：每次都查找
for (int i = 0; i < 1000; i++) {
    Method method = clazz.getMethod("test");
    method.invoke(obj);
}

// 推荐：缓存 Method
Method method = clazz.getMethod("test");
for (int i = 0; i < 1000; i++) {
    method.invoke(obj);
}
```

**2. 使用 setAccessible(true)**

```java
method.setAccessible(true); // 跳过权限检查
```

**3. MethodHandle（Java 7+）**

```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findVirtual(Calculator.class, "add", 
    MethodType.methodType(int.class, int.class, int.class));

int result = (int) mh.invoke(calc, 10, 5);
```

MethodHandle 性能优于反射，接近直接调用。

---

## 4. 动态代理的实现原理

### JDK 动态代理

**使用场景**：为接口创建代理对象。

```java
interface HelloService {
    void sayHello(String name);
}

class HelloServiceImpl implements HelloService {
    public void sayHello(String name) {
        System.out.println("Hello, " + name);
    }
}

// 创建代理
HelloService proxy = (HelloService) Proxy.newProxyInstance(
    HelloService.class.getClassLoader(),
    new Class[]{HelloService.class},
    new InvocationHandler() {
        private HelloService target = new HelloServiceImpl();
        
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("Before method");
            Object result = method.invoke(target, args);
            System.out.println("After method");
            return result;
        }
    }
);

proxy.sayHello("Alice");
```

**输出**：

```
Before method
Hello, Alice
After method
```

### 代理类的生成

JDK 动态生成字节码，等价于：

```java
class $Proxy0 implements HelloService {
    private InvocationHandler h;
    
    public $Proxy0(InvocationHandler h) {
        this.h = h;
    }
    
    public void sayHello(String name) {
        try {
            Method method = HelloService.class.getMethod("sayHello", String.class);
            h.invoke(this, method, new Object[]{name});
        } catch (Throwable t) {
            throw new UndeclaredThrowableException(t);
        }
    }
}
```

### 查看生成的代理类

```java
// JDK 8
System.setProperty("sun.misc.ProxyGenerator.saveGeneratedFiles", "true");

// JDK 11+
System.setProperty("jdk.proxy.ProxyGenerator.saveGeneratedFiles", "true");
```

运行后生成 `$Proxy0.class` 文件，可用 `javap` 查看。

### JDK 动态代理的限制

**只能代理接口**：

```java
class ConcreteClass {
    public void method() { }
}

// 无法为 ConcreteClass 创建代理
// Proxy.newProxyInstance(...); // 抛出异常
```

**原因**：代理类继承 `java.lang.reflect.Proxy`，Java 不支持多重继承。

### CGLIB 代理（第三方库）

**使用场景**：为类创建代理（通过继承）。

```java
class UserService {
    public void save() {
        System.out.println("Saving user");
    }
}

Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(UserService.class);
enhancer.setCallback(new MethodInterceptor() {
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        System.out.println("Before save");
        Object result = proxy.invokeSuper(obj, args);
        System.out.println("After save");
        return result;
    }
});

UserService proxy = (UserService) enhancer.create();
proxy.save();
```

**CGLIB 原理**：

- 动态生成目标类的子类
- 重写所有非 final 方法
- 方法调用通过 `MethodInterceptor` 拦截

---

## 5. 反射与泛型擦除的交互

### 运行时无法获取泛型类型

```java
List<String> list = new ArrayList<>();
Class<?> clazz = list.getClass(); // ArrayList.class
// 无法得知泛型参数是 String
```

### 通过 Signature 获取泛型信息

```java
class Box<T> {
    private T value;
}

Field field = Box.class.getDeclaredField("value");
Type genericType = field.getGenericType(); // 返回 TypeVariable<T>
Type type = field.getType(); // 返回 Object（擦除后）

if (genericType instanceof TypeVariable) {
    TypeVariable<?> tv = (TypeVariable<?>) genericType;
    System.out.println("Type variable: " + tv.getName()); // T
}
```

### 反射实例化泛型数组

```java
<T> T[] createArray(Class<T> componentType, int length) {
    return (T[]) Array.newInstance(componentType, length);
}

String[] arr = createArray(String.class, 10);
```

---

## 易错点与边界行为

### 1. setAccessible 的安全风险

```java
Field field = String.class.getDeclaredField("value");
field.setAccessible(true); // 突破 final 限制

String s = "hello";
field.set(s, new char[]{'w', 'o', 'r', 'l', 'd'});
System.out.println(s); // 可能仍输出 "hello"（字符串常量池）
```

### 2. 反射调用的异常处理

```java
Method method = clazz.getMethod("test");
try {
    method.invoke(obj);
} catch (InvocationTargetException e) {
    Throwable cause = e.getCause(); // 真正的异常
}
```

### 3. 基本类型与包装类型的匹配

```java
// 错误
Method method = clazz.getMethod("add", Integer.class, Integer.class);

// 正确
Method method = clazz.getMethod("add", int.class, int.class);
```

### 4. 代理类的 equals/hashCode

```java
HelloService proxy1 = (HelloService) Proxy.newProxyInstance(...);
HelloService proxy2 = (HelloService) Proxy.newProxyInstance(...);

proxy1.equals(proxy2); // 调用 InvocationHandler.invoke
```

代理对象的 `equals`/`hashCode`/`toString` 也会被拦截。

---

## 实际推导案例

### 案例：Spring AOP 如何选择代理方式？

```java
// Spring AOP 代理选择逻辑（简化）
Object createProxy(Object target) {
    if (target instanceof SomeInterface) {
        // 实现了接口，使用 JDK 动态代理
        return Proxy.newProxyInstance(...);
    } else {
        // 没有接口，使用 CGLIB
        return createCglibProxy(target);
    }
}
```

**配置强制 CGLIB**：

```xml
<aop:config proxy-target-class="true">
    <!-- 强制使用 CGLIB -->
</aop:config>
```

### 案例：MyBatis Mapper 接口的动态代理

```java
interface UserMapper {
    User findById(int id);
}

// MyBatis 通过反射创建代理
UserMapper mapper = (UserMapper) Proxy.newProxyInstance(
    UserMapper.class.getClassLoader(),
    new Class[]{UserMapper.class},
    new MapperProxy(sqlSession)
);

User user = mapper.findById(1); // 代理拦截，执行 SQL
```

**MapperProxy 的实现**：

```java
class MapperProxy implements InvocationHandler {
    private SqlSession sqlSession;
    
    public Object invoke(Object proxy, Method method, Object[] args) {
        // 解析方法名和注解
        String sql = parseSql(method);
        // 执行 SQL
        return sqlSession.selectOne(sql, args);
    }
}
```

---

## 关键点总结

1. **Class 对象获取**：`类名.class`、`对象.getClass()`、`Class.forName()`
2. **反射 API**：`getDeclaredXxx` 获取本类，`getXxx` 获取公共成员
3. **性能开销**：反射慢 50-100 倍，需缓存 Method/Field 对象
4. **JDK 动态代理**：只能代理接口，生成 `$Proxy` 类
5. **CGLIB 代理**：可代理类，通过继承实现
6. **泛型擦除**：运行时无法获取泛型类型，通过 Signature 部分获取

---

## 深入一点

### 反射的字节码实现

**获取 Method 对象**：

```java
Method method = String.class.getMethod("length");
```

字节码：

```
ldc String.class
ldc "length"
iconst_0
anewarray Class
invokevirtual Class.getMethod
```

**invoke 的本质**：

```java
method.invoke(obj, args);
```

底层调用 native 方法 `invoke0`：

```cpp
JNIEXPORT jobject JNICALL
Java_sun_reflect_NativeMethodAccessorImpl_invoke0(
    JNIEnv *env, jobject this, jobject m, jobject obj, jobjectArray args)
{
    // 解析方法签名
    // 转换参数类型
    // 调用目标方法
    // 包装返回值
}
```

### MethodHandle 的优势

```java
MethodHandle mh = lookup.findVirtual(Calculator.class, "add", ...);
int result = (int) mh.invokeExact(calc, 10, 5);
```

**与反射的区别**：

| 特性       | Reflection          | MethodHandle           |
| ---------- | ------------------- | ---------------------- |
| 类型检查   | 运行时              | 编译期 + 运行时        |
| 性能       | 慢                  | 接近直接调用           |
| JIT 优化   | 困难                | 可内联                 |
| 权限检查   | 每次检查            | 创建时检查一次         |

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 8.3.2 节方法调用的字节码指令
- 《Java 核心技术（卷I）》- 第5章反射
- 《Effective Java（第3版）》- Item 65：接口优于反射
- Oracle 官方文档：[Trail: The Reflection API](https://docs.oracle.com/javase/tutorial/reflect/)
- JSR 292：Supporting Dynamically Typed Languages on the Java Platform（MethodHandle）
