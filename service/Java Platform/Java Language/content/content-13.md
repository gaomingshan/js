# 注解的底层机制

## 概述

Java 注解（Annotation）是一种元数据机制，用于为代码添加声明式配置。注解信息存储在 class 文件的特定属性中，运行时通过反射读取。

本章深入解析：
- **注解的字节码存储**
- **运行时注解与反射**
- **注解处理器（APT）的编译期处理**
- **元注解的作用**
- **注解继承与重复注解**

---

## 1. 注解的字节码存储

### 注解定义

**源码**：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAnnotation {
    String value();
    int count() default 1;
}
```

**编译后等价接口**：

```java
public interface MyAnnotation extends java.lang.annotation.Annotation {
    String value();
    int count();
}
```

**字节码结构**：

```
public interface MyAnnotation extends java.lang.annotation.Annotation
  flags: ACC_PUBLIC, ACC_INTERFACE, ACC_ABSTRACT, ACC_ANNOTATION
  
  RuntimeVisibleAnnotations:
    Retention(value=RUNTIME)
    Target(value=[METHOD])
  
  Methods:
    public abstract String value()
    public abstract int count()
      AnnotationDefault: I#1
```

### 注解使用

**源码**：

```java
@MyAnnotation(value = "test", count = 5)
public void method() { }
```

**字节码**：

```
Method method()V
  RuntimeVisibleAnnotations:
    MyAnnotation(value="test", count=5)
```

---

## 2. 运行时注解与反射

### 读取注解

**反射 API**：

```java
Method method = MyClass.class.getMethod("method");

// 判断是否存在注解
if (method.isAnnotationPresent(MyAnnotation.class)) {
    // 获取注解实例
    MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
    
    // 读取属性
    String value = annotation.value();
    int count = annotation.count();
    
    System.out.println("value: " + value + ", count: " + count);
}
```

### 注解的动态代理实现

**注解实例的本质**：

```java
MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
System.out.println(annotation.getClass()); // $Proxy1
```

**JDK 动态代理生成的类**：

```java
final class $Proxy1 extends Proxy implements MyAnnotation {
    private static Method m3; // value() 方法
    private static Method m4; // count() 方法
    
    public String value() {
        try {
            return (String) h.invoke(this, m3, null);
        } catch (Throwable t) {
            throw new UndeclaredThrowableException(t);
        }
    }
    
    public int count() {
        try {
            return (Integer) h.invoke(this, m4, null);
        } catch (Throwable t) {
            throw new UndeclaredThrowableException(t);
        }
    }
}
```

**InvocationHandler 的实现**：

```java
class AnnotationInvocationHandler implements InvocationHandler {
    private final Map<String, Object> memberValues;
    
    public Object invoke(Object proxy, Method method, Object[] args) {
        String member = method.getName();
        Object value = memberValues.get(member);
        return value;
    }
}
```

### 注解属性的默认值

**源码**：

```java
@MyAnnotation("test") // count 使用默认值 1
public void method() { }
```

**字节码**：

```
RuntimeVisibleAnnotations:
  MyAnnotation(value="test")
  // count 不出现在字节码中
```

**读取默认值**：

```java
MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
int count = annotation.count(); // 1（从注解定义的 AnnotationDefault 读取）
```

---

## 3. 注解处理器（APT）的编译期处理

### 编译期注解处理

**注解定义**：

```java
@Retention(RetentionPolicy.SOURCE) // 编译期注解
@Target(ElementType.TYPE)
public @interface GenerateBuilder {
}
```

**注解处理器**：

```java
@SupportedAnnotationTypes("GenerateBuilder")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class BuilderProcessor extends AbstractProcessor {
    
    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (Element element : roundEnv.getElementsAnnotatedWith(GenerateBuilder.class)) {
            TypeElement typeElement = (TypeElement) element;
            
            // 生成 Builder 类的源码
            String builderSource = generateBuilder(typeElement);
            
            // 写入文件
            JavaFileObject file = processingEnv.getFiler()
                .createSourceFile(typeElement.getSimpleName() + "Builder");
            try (Writer writer = file.openWriter()) {
                writer.write(builderSource);
            }
        }
        return true;
    }
}
```

### 注解处理的流程

**编译流程**：

```
1. javac 解析源码
2. 调用注解处理器的 process() 方法
3. 注解处理器生成新源码
4. javac 编译新生成的源码
5. 重复步骤 2-4，直到没有新源码生成
```

**常见应用**：

- Lombok：自动生成 getter/setter
- MapStruct：生成映射代码
- Dagger：依赖注入代码生成

### 编译期 vs 运行期注解

| 特性         | SOURCE                | CLASS                | RUNTIME              |
| ------------ | --------------------- | -------------------- | -------------------- |
| 保留策略     | RetentionPolicy.SOURCE| RetentionPolicy.CLASS| RetentionPolicy.RUNTIME |
| 存储位置     | 不保存到 class        | class 文件           | class 文件           |
| 反射可见     | 否                    | 否                   | 是                   |
| 用途         | 编译期检查/代码生成   | 字节码增强           | 运行时反射           |
| 典型应用     | @Override、Lombok     | ASM 字节码操作       | Spring、JUnit        |

---

## 4. 元注解的作用

### @Retention：保留策略

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation { }
```

**三种策略**：

```java
public enum RetentionPolicy {
    SOURCE,   // 源码期，编译后丢弃
    CLASS,    // 字节码期，运行时不可见（默认）
    RUNTIME   // 运行时，反射可见
}
```

### @Target：作用目标

```java
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface MyAnnotation { }
```

**目标类型**：

```java
public enum ElementType {
    TYPE,               // 类、接口、枚举
    FIELD,              // 字段
    METHOD,             // 方法
    PARAMETER,          // 参数
    CONSTRUCTOR,        // 构造方法
    LOCAL_VARIABLE,     // 局部变量
    ANNOTATION_TYPE,    // 注解
    PACKAGE,            // 包
    TYPE_PARAMETER,     // 类型参数（泛型）
    TYPE_USE            // 任意类型使用
}
```

### @Documented：生成文档

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation { }
```

**作用**：使用 javadoc 生成文档时，注解会出现在文档中。

### @Inherited：继承性

```java
@Inherited
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation { }

@MyAnnotation
class Parent { }

class Child extends Parent { }
```

**效果**：

```java
Child.class.isAnnotationPresent(MyAnnotation.class); // true
```

**限制**：只对类继承有效，接口和方法不继承。

### @Repeatable：重复注解（Java 8+）

```java
@Repeatable(MyAnnotations.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation {
    String value();
}

@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotations {
    MyAnnotation[] value();
}
```

**使用**：

```java
@MyAnnotation("A")
@MyAnnotation("B")
public class Demo { }
```

**字节码**：

```
RuntimeVisibleAnnotations:
  MyAnnotations(value=[
    MyAnnotation(value="A"),
    MyAnnotation(value="B")
  ])
```

---

## 5. 注解继承与重复注解

### 注解不继承方法

**父类方法**：

```java
class Parent {
    @MyAnnotation
    public void method() { }
}

class Child extends Parent {
    @Override
    public void method() { }
}
```

**读取注解**：

```java
Method method = Child.class.getMethod("method");
method.isAnnotationPresent(MyAnnotation.class); // false
```

**原因**：子类重写的方法是新方法，不继承父类的注解。

### 获取继承的注解

```java
// 获取本类的注解
method.getAnnotation(MyAnnotation.class);

// 获取包含父类的注解（如果注解标记了 @Inherited）
method.getDeclaredAnnotations();
```

### 重复注解的读取

**源码**：

```java
@MyAnnotation("A")
@MyAnnotation("B")
public class Demo { }
```

**读取**：

```java
MyAnnotation[] annotations = Demo.class.getAnnotationsByType(MyAnnotation.class);
// 返回 [MyAnnotation("A"), MyAnnotation("B")]
```

---

## 易错点与边界行为

### 1. 注解属性的类型限制

**允许的类型**：

- 基本类型
- String
- Class
- 枚举
- 注解
- 以上类型的数组

**不允许**：

```java
@interface Invalid {
    List<String> value(); // 编译错误
    Map<String, String> map(); // 编译错误
}
```

### 2. 注解属性不能为 null

```java
@MyAnnotation(value = null) // 编译错误
```

**解决方案**：使用空字符串或特殊值

```java
@MyAnnotation(value = "") // 允许
```

### 3. 注解的 equals 和 hashCode

**注解代理类实现了 equals**：

```java
MyAnnotation a1 = method1.getAnnotation(MyAnnotation.class);
MyAnnotation a2 = method2.getAnnotation(MyAnnotation.class);

a1.equals(a2); // 比较所有属性值
```

**实现**：

```java
public boolean equals(Object o) {
    if (!(o instanceof MyAnnotation)) return false;
    MyAnnotation that = (MyAnnotation) o;
    return value.equals(that.value()) && count == that.count();
}
```

### 4. @Inherited 的限制

**只对类有效**：

```java
@Inherited
@interface MyAnnotation { }

@MyAnnotation
interface Parent { }

class Child implements Parent { }

Child.class.isAnnotationPresent(MyAnnotation.class); // false（接口不继承）
```

### 5. 注解处理器的循环依赖

**问题**：

```java
// 注解处理器生成的类引用了被注解的类
@GenerateBuilder
class Person {
    PersonBuilder builder; // 循环依赖
}
```

**解决方案**：合理设计生成的代码结构。

---

## 实际推导案例

### 案例：Spring 的 @Autowired 实现

**注解定义**：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface Autowired {
    boolean required() default true;
}
```

**Spring 容器处理**：

```java
// 简化实现
class AutowiredAnnotationBeanPostProcessor {
    public void processInjection(Object bean) {
        Class<?> clazz = bean.getClass();
        
        // 处理字段注入
        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(Autowired.class)) {
                field.setAccessible(true);
                Object dependency = getBean(field.getType());
                field.set(bean, dependency);
            }
        }
    }
}
```

### 案例：Lombok 的 @Data 实现

**注解定义**：

```java
@Retention(RetentionPolicy.SOURCE)
@Target(ElementType.TYPE)
public @interface Data { }
```

**注解处理器**：

```java
@SupportedAnnotationTypes("lombok.Data")
public class DataProcessor extends AbstractProcessor {
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (Element element : roundEnv.getElementsAnnotatedWith(Data.class)) {
            // 生成 getter/setter/equals/hashCode/toString 方法
            generateMethods(element);
        }
        return true;
    }
}
```

**编译时生成代码**：

```java
@Data
class Person {
    private String name;
    private int age;
}

// Lombok 生成：
public String getName() { return name; }
public void setName(String name) { this.name = name; }
// ... 其他方法
```

---

## 关键点总结

1. **字节码存储**：注解存储在 class 文件的 RuntimeVisibleAnnotations 属性
2. **动态代理**：运行时注解通过 JDK 动态代理实现
3. **注解处理器**：编译期处理 SOURCE 注解，生成代码
4. **元注解**：@Retention、@Target、@Documented、@Inherited、@Repeatable
5. **继承限制**：@Inherited 只对类有效，方法和接口不继承
6. **类型限制**：注解属性只能是基本类型、String、Class、枚举、注解及其数组

---

## 深入一点

### 注解的内存占用

**class 文件增长**：

```java
// 无注解
class Person { } // 约 200 字节

// 大量注解
@Entity
@Table(name = "person")
class Person {
    @Id
    @GeneratedValue
    @Column(name = "id")
    private Long id;
    
    @Column(name = "name", length = 100)
    private String name;
}
// 约 800 字节（注解占用 600 字节）
```

### 注解的性能影响

**反射读取注解**：

```java
// 缓存注解实例
private static final MyAnnotation CACHED = MyClass.class.getAnnotation(MyAnnotation.class);

// 避免每次都反射
for (int i = 0; i < 1000000; i++) {
    // method.getAnnotation(MyAnnotation.class); // 慢
    // 使用缓存
}
```

### 字节码工具库处理注解

**ASM 读取注解**：

```java
class MyClassVisitor extends ClassVisitor {
    @Override
    public AnnotationVisitor visitAnnotation(String descriptor, boolean visible) {
        if (descriptor.equals("LMyAnnotation;")) {
            return new AnnotationVisitor(Opcodes.ASM9) {
                @Override
                public void visit(String name, Object value) {
                    System.out.println(name + " = " + value);
                }
            };
        }
        return super.visitAnnotation(descriptor, visible);
    }
}
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 6.3.7 节属性表集合
- 《Java 核心技术（卷I）》- 第5章继承，5.8 节注解
- Oracle 官方教程：[Annotations](https://docs.oracle.com/javase/tutorial/java/annotations/)
- JSR 269：Pluggable Annotation Processing API
- JSR 308：Annotations on Java Types
