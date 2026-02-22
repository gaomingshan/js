# 双亲委派模型

## 概述

双亲委派模型（Parents Delegation Model）是 Java 类加载器的核心机制，定义了类加载器之间的层次关系和委派规则。理解双亲委派模型，是掌握类加载顺序、避免类冲突、实现热部署的基础。

本章聚焦：
- **类加载器的层次结构**
- **双亲委派的工作流程**
- **破坏双亲委派的场景**
- **自定义类加载器**

---

## 1. 类加载器的层次结构

### 三层类加载器

```
启动类加载器（Bootstrap ClassLoader）
    ↓
扩展类加载器（Extension ClassLoader）
    ↓
应用程序类加载器（Application ClassLoader）
    ↓
自定义类加载器（User ClassLoader）
```

### 启动类加载器（Bootstrap ClassLoader）

**实现**：C++ 实现，JVM 的一部分

**加载路径**：

```
$JAVA_HOME/jre/lib
-Xbootclasspath 指定的路径
```

**加载的类**：

- `java.lang.*`
- `java.util.*`
- `java.io.*`

**查看**：

```java
ClassLoader loader = String.class.getClassLoader();
System.out.println(loader);  // null（Bootstrap ClassLoader）
```

**为什么返回 null？**

- Bootstrap ClassLoader 不是 Java 对象
- 无法在 Java 层面获取引用

### 扩展类加载器（Extension ClassLoader）

**实现**：`sun.misc.Launcher$ExtClassLoader`

**加载路径**：

```
$JAVA_HOME/jre/lib/ext
java.ext.dirs 系统属性指定的路径
```

**加载的类**：

- `javax.*` 扩展类
- 第三方扩展库

**查看**：

```java
ClassLoader loader = javax.swing.JFrame.class.getClassLoader();
System.out.println(loader);  // sun.misc.Launcher$ExtClassLoader
```

### 应用程序类加载器（Application ClassLoader）

**实现**：`sun.misc.Launcher$AppClassLoader`

**加载路径**：

```
classpath
-cp / -classpath 指定的路径
```

**加载的类**：

- 用户自定义类
- 第三方库（JAR 包）

**查看**：

```java
ClassLoader loader = Demo.class.getClassLoader();
System.out.println(loader);  // sun.misc.Launcher$AppClassLoader
```

**默认类加载器**：

```java
ClassLoader.getSystemClassLoader();  // Application ClassLoader
```

---

## 2. 双亲委派模型的工作流程

### 委派流程

**步骤**：

1. 收到类加载请求
2. **先委派给父加载器**
3. 父加载器无法加载，才自己尝试加载

**示意图**：

```
Application ClassLoader 收到加载 java.lang.String 的请求
    ↓ 委派
Extension ClassLoader
    ↓ 委派
Bootstrap ClassLoader
    ↓ 加载成功，返回 Class 对象
```

### 源码实现

**ClassLoader.loadClass()**：

```java
protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
    synchronized (getClassLoadingLock(name)) {
        // 1. 检查类是否已加载
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            try {
                // 2. 委派给父加载器
                if (parent != null) {
                    c = parent.loadClass(name, false);
                } else {
                    // 父加载器为 null，委派给 Bootstrap ClassLoader
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // 父加载器无法加载
            }
            
            if (c == null) {
                // 3. 父加载器无法加载，自己尝试加载
                c = findClass(name);
            }
        }
        
        if (resolve) {
            resolveClass(c);
        }
        return c;
    }
}
```

**关键点**：

- **synchronized**：确保类加载的线程安全
- **先检查已加载**：避免重复加载
- **先委派父加载器**：核心机制
- **父加载器失败，自己加载**：兜底策略

---

## 3. 双亲委派的优势

### 1. 避免类的重复加载

**问题**：

如果没有双亲委派，多个类加载器可能加载同一个类：

```
Application ClassLoader 加载 java.lang.String
Extension ClassLoader 也加载 java.lang.String
```

**结果**：内存中有多个 `java.lang.String` 类。

**双亲委派**：

- 委派给 Bootstrap ClassLoader
- Bootstrap ClassLoader 加载一次
- 所有加载器共用同一个 Class 对象

### 2. 保护核心类库

**恶意代码**：

```java
package java.lang;

public class String {
    public static void main(String[] args) {
        System.out.println("Fake String");
    }
}
```

**双亲委派**：

1. Application ClassLoader 收到加载 `java.lang.String` 的请求
2. 委派给 Bootstrap ClassLoader
3. Bootstrap ClassLoader 从 `rt.jar` 加载真正的 `String` 类
4. 恶意 `String` 类永远不会被加载

**结果**：核心类库受保护。

### 3. 避免类的冲突

**场景**：

```
应用程序依赖 A.jar（包含 com.example.Demo 1.0）
应用程序依赖 B.jar（包含 com.example.Demo 2.0）
```

**双亲委派**：

- Application ClassLoader 先加载 A.jar 中的 `Demo`
- 后续请求直接返回已加载的 `Demo`
- B.jar 中的 `Demo` 不会被加载

**问题**：如果需要两个版本共存，需要**打破双亲委派**。

---

## 4. 破坏双亲委派的场景

### 1. JNDI（Java Naming and Directory Interface）

**问题**：

- JNDI 接口在 `rt.jar` 中（Bootstrap ClassLoader 加载）
- JNDI 实现由第三方提供（Application ClassLoader 加载）
- Bootstrap ClassLoader 无法加载第三方实现

**解决方案**：**线程上下文类加载器（Thread Context ClassLoader）**

```java
Thread.currentThread().setContextClassLoader(classLoader);
```

**工作流程**：

```java
// JNDI 代码（Bootstrap ClassLoader）
ClassLoader cl = Thread.currentThread().getContextClassLoader();
Class<?> impl = cl.loadClass("com.example.JndiImpl");  // Application ClassLoader
```

**逆向委派**：父加载器请求子加载器加载类。

### 2. OSGi（模块化系统）

**特点**：

- 每个模块有独立的类加载器
- 模块之间可以相互依赖
- 支持同一个类的多个版本共存

**类加载策略**：

```
1. 检查是否由父加载器加载（java.* 包）
2. 检查是否由 Import-Package 导入
3. 检查是否在本模块中
4. 委派给父加载器
```

**打破双亲委派**：不是先委派父加载器，而是优先在模块内加载。

### 3. 热部署（Hot Deployment）

**需求**：

- 应用运行时，更新类定义
- 无需重启应用

**实现**：

1. 自定义类加载器 `HotSwapClassLoader`
2. 每次更新，创建新的类加载器
3. 加载新版本的类
4. 替换旧类加载器

**示例**：

```java
class HotSwapClassLoader extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] classData = loadClassData(name);
        return defineClass(name, classData, 0, classData.length);
    }
    
    private byte[] loadClassData(String name) {
        // 从文件系统加载 .class 文件
        String path = name.replace('.', '/') + ".class";
        return Files.readAllBytes(Paths.get(path));
    }
}

// 热部署
HotSwapClassLoader loader1 = new HotSwapClassLoader();
Class<?> clazz1 = loader1.loadClass("com.example.Demo");

// 更新类文件后
HotSwapClassLoader loader2 = new HotSwapClassLoader();
Class<?> clazz2 = loader2.loadClass("com.example.Demo");

System.out.println(clazz1 == clazz2);  // false（不同的 Class 对象）
```

---

## 5. 自定义类加载器

### 实现步骤

**1. 继承 ClassLoader**：

```java
class MyClassLoader extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        // 实现类加载逻辑
    }
}
```

**2. 重写 findClass() 方法**：

```java
@Override
protected Class<?> findClass(String name) throws ClassNotFoundException {
    // 1. 获取类的二进制数据
    byte[] classData = loadClassData(name);
    
    // 2. 将字节数组转换为 Class 对象
    return defineClass(name, classData, 0, classData.length);
}
```

**3. 实现 loadClassData() 方法**：

```java
private byte[] loadClassData(String name) throws ClassNotFoundException {
    String path = name.replace('.', '/') + ".class";
    try (InputStream is = getResourceAsStream(path)) {
        if (is == null) {
            throw new ClassNotFoundException(name);
        }
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int len;
        while ((len = is.read(buffer)) != -1) {
            baos.write(buffer, 0, len);
        }
        return baos.toByteArray();
    } catch (IOException e) {
        throw new ClassNotFoundException(name, e);
    }
}
```

### 完整示例

```java
class FileSystemClassLoader extends ClassLoader {
    private String classPath;
    
    public FileSystemClassLoader(String classPath) {
        this.classPath = classPath;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] classData = loadClassData(name);
        if (classData == null) {
            throw new ClassNotFoundException(name);
        }
        return defineClass(name, classData, 0, classData.length);
    }
    
    private byte[] loadClassData(String name) {
        String path = classPath + File.separator + name.replace('.', File.separatorChar) + ".class";
        try {
            return Files.readAllBytes(Paths.get(path));
        } catch (IOException e) {
            return null;
        }
    }
}

// 使用
FileSystemClassLoader loader = new FileSystemClassLoader("/path/to/classes");
Class<?> clazz = loader.loadClass("com.example.Demo");
Object instance = clazz.getDeclaredConstructor().newInstance();
```

---

## 易错点与边界行为

### 1. 类的唯一性

**问题**：

```java
ClassLoader loader1 = new MyClassLoader();
ClassLoader loader2 = new MyClassLoader();

Class<?> clazz1 = loader1.loadClass("Demo");
Class<?> clazz2 = loader2.loadClass("Demo");

System.out.println(clazz1 == clazz2);  // false
```

**原因**：

- 类的唯一性由"类加载器 + 全限定名"共同决定
- 不同类加载器加载的同名类，是不同的类

**影响**：

```java
Demo obj1 = (Demo) clazz1.newInstance();
Demo obj2 = (Demo) clazz2.newInstance();

obj1.getClass() == obj2.getClass();  // false
obj1 instanceof Demo;  // true（编译期的 Demo）
obj2 instanceof Demo;  // true
obj1.getClass().isInstance(obj2);  // false
```

### 2. ClassNotFoundException vs NoClassDefFoundError

**ClassNotFoundException**：

- **检查异常**
- 调用 `Class.forName()` 或 `ClassLoader.loadClass()` 时抛出
- 类不存在

**NoClassDefFoundError**：

- **错误（Error）**
- 类加载时依赖的类不存在
- 或类初始化失败

**示例**：

```java
class A {
    static {
        throw new RuntimeException("Init failed");
    }
}

// 首次使用 A
new A();  // ExceptionInInitializerError

// 再次使用 A
new A();  // NoClassDefFoundError
```

### 3. 父加载器不是继承关系

**误解**：

```java
ExtClassLoader extends AppClassLoader  // 错误
```

**正确**：

```java
class ClassLoader {
    private final ClassLoader parent;  // 组合关系
}
```

**父加载器**通过 `parent` 字段指定，而非继承。

### 4. 不能重写 loadClass()

**错误**：

```java
class MyClassLoader extends ClassLoader {
    @Override
    public Class<?> loadClass(String name) {
        // 自定义逻辑
        // 打破双亲委派
    }
}
```

**正确**：

```java
class MyClassLoader extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) {
        // 自定义加载逻辑
        // 保持双亲委派
    }
}
```

**原因**：

- `loadClass()` 实现了双亲委派逻辑
- 重写会破坏双亲委派
- 应重写 `findClass()`

---

## 实际推导案例

### 案例：Tomcat 的类加载器架构

**问题**：

- 多个 Web 应用部署在同一个 Tomcat
- 每个应用依赖不同版本的库
- 如何隔离类？

**Tomcat 类加载器层次**：

```
Bootstrap ClassLoader
    ↓
Extension ClassLoader
    ↓
Application ClassLoader
    ↓
Common ClassLoader（Tomcat 公共类）
    ↓
Catalina ClassLoader（Tomcat 服务器类）
    ↓
Shared ClassLoader（应用共享类）
    ↓
WebApp ClassLoader（Web 应用类，每个应用一个）
```

**WebApp ClassLoader 的加载顺序**：

1. 检查是否已加载
2. **先尝试自己加载**（打破双亲委派）
3. 委派给父加载器
4. 父加载器失败，抛出异常

**优势**：

- 应用之间类隔离
- 同一个类的不同版本可以共存
- 应用可以覆盖 Tomcat 提供的类

### 案例：Spring Boot 的类加载

**问题**：

- Spring Boot 应用打包为 JAR
- JAR 中包含依赖的 JAR（JAR in JAR）
- 标准类加载器无法加载

**解决方案**：`LaunchedURLClassLoader`

```java
java -jar app.jar
```

**启动流程**：

1. `JarLauncher` 启动
2. 创建 `LaunchedURLClassLoader`
3. 加载 `BOOT-INF/classes` 和 `BOOT-INF/lib/*.jar`
4. 调用主类的 `main()` 方法

**LaunchedURLClassLoader**：

- 能够加载嵌套 JAR
- 保持双亲委派模型

---

## 关键点总结

1. **三层类加载器**：Bootstrap、Extension、Application
2. **双亲委派**：先委派父加载器，父加载器失败才自己加载
3. **优势**：避免重复加载、保护核心类库、避免类冲突
4. **破坏场景**：JNDI、OSGi、热部署
5. **自定义类加载器**：继承 ClassLoader，重写 findClass()
6. **类的唯一性**：类加载器 + 全限定名

---

## 深入一点

### 查看类加载器层次

**代码**：

```java
ClassLoader loader = Demo.class.getClassLoader();
while (loader != null) {
    System.out.println(loader);
    loader = loader.getParent();
}
System.out.println(loader);  // Bootstrap ClassLoader（null）
```

**输出**：

```
sun.misc.Launcher$AppClassLoader@18b4aac2
sun.misc.Launcher$ExtClassLoader@1540e19d
null
```

### 使用 -verbose:class 查看类加载

**启用日志**：

```bash
java -verbose:class MyApp
```

**输出**：

```
[Loaded java.lang.Object from /Library/Java/JavaVirtualMachines/jdk1.8.0_281.jdk/Contents/Home/jre/lib/rt.jar]
[Loaded java.io.Serializable from /Library/Java/JavaVirtualMachines/jdk1.8.0_281.jdk/Contents/Home/jre/lib/rt.jar]
[Loaded com.example.Demo from file:/path/to/classes/]
```

### ClassLoader 的关键方法

**loadClass()**：

- 实现双亲委派逻辑
- 不应重写

**findClass()**：

- 查找并加载类
- 应由子类实现

**defineClass()**：

- 将字节数组转换为 Class 对象
- protected 方法，由子类调用

**resolveClass()**：

- 链接类（验证、准备、解析）
- 可选调用

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 7.4 节类加载器
- 《Effective Java（第3版）》- Item 80：优先使用 Executor、Task 和 Stream
- Oracle 官方文档：[ClassLoader](https://docs.oracle.com/javase/8/docs/api/java/lang/ClassLoader.html)
- Tomcat 类加载器文档：[Class Loader HOW-TO](https://tomcat.apache.org/tomcat-9.0-doc/class-loader-howto.html)
