# Java 语言本质与 JVM 执行机制 - 学习大纲

> **学习定位**：深入 Java 语言设计本质、编译期行为、字节码机制、JVM 执行模型与内存管理  
> **严格边界**：不涉及 API 使用、集合框架、IO、网络、数据库、框架内容

---

## 第一部分：Java 语言设计哲学

### 1. [Java 语言设计思想与核心原则](./content/content-1.md)
- 单继承 + 多接口的设计动机
- Object 作为根类的意义
- 平台无关性与字节码设计
- 强类型与类型安全
- 自动内存管理的代价与收益

### 2. [final 关键字的多层语义](./content/content-2.md)
- final 变量、final 方法、final 类
- final 字段的内存语义（JMM 保证）
- 编译期常量 vs 运行期 final
- final 与优化（内联、逃逸分析）

### 3. [接口的设计哲学与演化](./content/content-3.md)
- 接口字段为什么必须是 public static final
- 接口作为契约的设计思想
- 默认方法与多继承冲突解决
- 函数式接口与 lambda 的关系
- 接口 vs 抽象类的使用边界

---

## 第二部分：类型系统与对象机制

### 4. [Object 根类的核心方法](./content/content-4.md)
- equals 与 hashCode 的设计契约
- toString 的重写与调试
- clone 方法与深浅拷贝
- finalize 的废弃与替代方案
- getClass 与反射的关系

### 5. [Java 泛型的本质与擦除机制](./content/content-5.md)
- 泛型擦除的设计动机（兼容性）
- 原始类型与边界类型
- 桥方法的生成与作用
- 泛型数组限制的原因
- 类型擦除导致的边界行为

### 6. [泛型的高级特性](./content/content-6.md)
- 上界通配符（<? extends T>）与协变
- 下界通配符（<? super T>）与逆变
- 无界通配符（<?>）的使用场景
- PECS 原则（Producer Extends Consumer Super）
- 递归泛型与自限定类型
- 类型推导与菱形语法

### 7. [自动装箱与拆箱机制](./content/content-7.md)
- 编译期的语法糖展开
- Integer 缓存池机制（-128 ~ 127）
- 装箱拆箱的性能影响
- == vs equals 的陷阱
- null 与拆箱的 NPE 风险

---

## 第三部分：编译期机制与字节码

### 8. [反射机制与动态代理](./content/content-8.md)
- Class 对象的获取与加载
- 反射访问字段、方法、构造器
- 反射的性能开销
- 动态代理的实现原理
- 反射与泛型擦除的交互

### 9. [语法糖与编译期展开](./content/content-9.md)
- 增强 for 循环的字节码展开
- try-with-resources 的实现
- 字符串拼接的优化（StringBuilder）
- switch-case 对字符串的支持
- 三目运算符的边界行为

### 10. [内部类与闭包捕获机制](./content/content-10.md)
- 匿名内部类的字节码结构
- 捕获外部变量的 final 要求
- 内部类访问外部类的桥接
- 静态内部类 vs 非静态内部类
- 局部变量捕获的拷贝机制

### 11. [lambda 表达式与 invokedynamic](./content/content-11.md)
- lambda 的字节码实现
- invokedynamic 指令的作用
- lambda 与匿名内部类的区别
- 方法引用的四种形式
- lambda 捕获变量的限制

### 12. [枚举类的底层实现](./content/content-12.md)
- 枚举的编译期展开
- 枚举实例的单例保证
- values() 与 valueOf() 的生成
- 枚举 switch 的字节码
- 枚举的序列化安全性

### 13. [注解的底层机制](./content/content-13.md)
- 注解的字节码存储
- 运行时注解与反射
- 注解处理器（APT）的编译期处理
- 元注解的作用
- 注解继承与重复注解

---

## 第四部分：字节码与对象模型

### 14. [字节码结构与常量池](./content/content-14.md)
- class 文件结构
- 常量池的作用与类型
- 符号引用 vs 直接引用
- 字节码指令分类
- javap 工具的使用

### 15. [对象的内存布局](./content/content-15.md)
- 对象头（Mark Word + 类型指针）
- 实例数据的对齐填充
- 数组对象的长度字段
- 压缩指针（CompressedOops）
- 对象大小计算

### 16. [虚方法调用与多态实现](./content/content-16.md)
- invokevirtual vs invokespecial
- 虚方法表（vtable）的构建
- 接口方法表（itable）
- 动态分派的性能
- 内联优化对多态的影响

---

## 第五部分：JVM 执行模型

### 17. [JVM 运行时数据区](./content/content-17.md)
- 程序计数器（PC Register）
- 虚拟机栈与栈帧结构
- 本地方法栈
- 堆的分区（新生代/老年代）
- 方法区与元空间（Metaspace）

### 18. [栈帧与方法调用](./content/content-18.md)
- 栈帧的组成（局部变量表、操作数栈、动态链接、返回地址）
- 方法调用的压栈与出栈
- 递归调用与栈溢出
- 尾调用优化的缺失

### 19. [异常处理机制](./content/content-19.md)
- 异常表的字节码结构
- try-catch-finally 的执行顺序
- finally 的字节码复制
- 异常与返回值的优先级
- 异常对性能的影响

---

## 第六部分：垃圾回收机制

### 20. [GC 的基本原理与算法](./content/content-20.md)
- 引用计数 vs 可达性分析
- GC Roots 的类型
- 标记-清除算法
- 标记-整理算法
- 复制算法

### 21. [分代收集理论](./content/content-21.md)
- 弱分代假说
- 新生代（Eden + Survivor）
- 老年代
- 对象晋升机制
- 分代收集的优势

### 22. [垃圾收集器对比](./content/content-22.md)
- Serial / Parallel / CMS 的设计思想
- Stop-The-World 的影响
- 并发标记与三色标记
- G1 收集器的 Region 设计
- ZGC / Shenandoah 的低延迟特性

### 23. [引用类型与内存泄漏](./content/content-23.md)
- 强引用、软引用、弱引用、虚引用
- 引用队列的作用
- 常见内存泄漏场景
- ThreadLocal 的内存泄漏风险

---

## 第七部分：类加载机制

### 24. [类加载的五个阶段](./content/content-24.md)
- 加载、验证、准备、解析、初始化
- 类加载的时机（主动引用 vs 被动引用）
- 接口加载与类加载的区别
- 数组类的特殊加载

### 25. [双亲委派模型](./content/content-25.md)
- 双亲委派的设计动机
- 类加载器层次（Bootstrap / Extension / Application）
- 破坏双亲委派的场景（JDBC、JNDI、OSGi）
- 自定义类加载器

### 26. [类初始化顺序](./content/content-26.md)
- 静态变量与静态代码块
- 实例变量与构造代码块
- 构造方法
- 父类与子类的初始化顺序
- 接口的初始化特殊性

### 27. [常量池与字符串常量池](./content/content-27.md)
- 运行时常量池 vs 字符串常量池
- String.intern() 的实现
- 字面量的常量池存储
- 编译期常量折叠

---

## 第八部分：Java 内存模型（JMM）

### 28. [Java 内存模型基础](./content/content-28.md)
- 主内存与工作内存
- 内存可见性问题
- 指令重排序
- happens-before 规则
- as-if-serial 语义

### 29. [volatile 关键字](./content/content-29.md)
- volatile 的可见性保证
- volatile 的有序性保证（禁止重排序）
- volatile 的非原子性
- volatile 的使用场景
- volatile 的内存屏障实现

### 30. [synchronized 的实现原理](./content/content-30.md)
- monitorenter / monitorexit 指令
- 对象监视器（Monitor）
- 锁的膨胀过程（偏向锁 → 轻量级锁 → 重量级锁）
- 锁消除与锁粗化
- synchronized 的内存语义

### 31. [final 字段的内存语义](./content/content-31.md)
- final 字段的初始化安全
- final 字段的重排序规则
- final 引用对象的发布
- final 与双重检查锁定（DCL）

---

## 第九部分：JIT 与运行期优化

### 32. [即时编译（JIT）原理](./content/content-32.md)
- 解释执行 vs 编译执行
- C1（Client Compiler）vs C2（Server Compiler）
- 分层编译（Tiered Compilation）
- 热点代码检测
- OSR（On-Stack Replacement）

### 33. [方法内联](./content/content-33.md)
- 内联的触发条件
- 虚方法的去虚化
- 内联对性能的影响
- 内联失败的原因

### 34. [逃逸分析与优化](./content/content-34.md)
- 逃逸分析的原理
- 栈上分配（标量替换）
- 同步消除
- 逃逸分析的局限性

### 35. [其他运行期优化](./content/content-35.md)
- 公共子表达式消除
- 数组边界检查消除
- 空值检查消除
- 循环展开
- 窥孔优化

---

## 第十部分：语言边界行为与特殊案例

### 36. [编译期常量折叠](./content/content-36.md)
- 常量表达式的折叠
- final 变量的常量化
- 字符串拼接的优化
- 编译期 vs 运行期的边界

### 37. [类型转换与边界行为](./content/content-37.md)
- 基本类型的自动转换规则
- 强制类型转换的陷阱
- 三目运算符的类型提升
- 泛型擦除的强制转换
- 数组的协变性与反变性

### 38. [方法重载的选择规则](./content/content-38.md)
- 编译期重载解析
- 可变参数与重载
- 自动装箱与重载的交互
- 重载与继承的组合
- 重载陷阱与最佳实践

### 39. [特殊语法推导案例](./content/content-39.md)
- 复杂的初始化顺序推导
- 异常与 finally 的执行顺序
- 隐式类型转换的优先级
- 综合边界行为分析

---

## 第十一部分：综合与实战

### 40. [从源码到字节码的完整流程](./content/content-40.md)
- 编译期处理流程
- 字节码生成与优化
- 运行期加载与链接
- JIT 编译与执行

### 41. [常见误解与最佳实践](./content/content-41.md)
- String 的不可变性
- 对象池的使用与误区
- 异常处理的性能代价
- 并发编程的常见错误

### 42. [面试高频问题与综合分析](./content/content-42.md)
- 语言设计类问题
- 内存与 GC 类问题
- 并发与 JMM 类问题
- 字节码与优化类问题

---

## 附录

- [术语表](./content/appendix-glossary.md)
- [学习资源](./content/appendix-resources.md)
- [面试题汇总](./quiz/quiz.md)

---

**总计**：42 个核心章节 + 附录 + 约 100 道精选面试题

**学习路径**：语言哲学 → 对象机制与类型系统 → 反射 → 编译期机制 → 对象模型 → JVM 执行 → GC 机制 → 类加载 → JMM → JIT 优化 → 边界行为 → 综合实战

---

## 主要优化点

✅ **Object 根类方法独立成章**：包含 equals/hashCode/clone/toString/finalize  
✅ **泛型拆分为两章**：基础擦除机制 + 高级特性（上下界、协变逆变、PECS、递归泛型）  
✅ **新增反射机制章节**：反射原理、动态代理、性能开销  
✅ **接口章节增强**：明确说明接口字段为什么必须是 public static final  
✅ **三目运算符合并**：不再独立成章，归入类型转换与边界行为  
✅ **方法重载独立成章**：深入讲解重载解析规则与陷阱  
✅ **章节编号更新**：从 40 章增至 42 章，逻辑更连贯
