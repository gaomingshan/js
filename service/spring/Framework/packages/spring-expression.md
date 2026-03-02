# Spring Expression 源码指引

> spring-expression 提供 SpEL（Spring Expression Language）表达式引擎，支持运行时动态计算表达式。

---

## 1. 表达式解析与上下文

### 核心接口
- **ExpressionParser** - 表达式解析器接口
- **Expression** - 表达式接口
- **EvaluationContext** - 求值上下文接口
- **TemplateParserContext** - 模板解析上下文

### 核心实现
- **SpelExpressionParser** - SpEL 表达式解析器（默认）
- **SpelExpression** - SpEL 表达式实现
- **StandardEvaluationContext** - 标准求值上下文
- **SimpleEvaluationContext** - 简单求值上下文（受限，更安全）

### 设计目的
提供统一的表达式解析和求值 API，支持在配置、注解、模板等场景中动态计算值。

### 使用限制与风险
- StandardEvaluationContext 功能强大但存在安全风险（支持反射调用）
- SimpleEvaluationContext 限制了反射和类型引用，更安全
- 表达式解析有性能开销，建议缓存 Expression 对象

---

## 2. SpEL 表达式语法

### 字面量
- **字符串** - `'hello'`, `"world"`
- **数字** - `123`, `3.14`, `1e3`
- **布尔** - `true`, `false`
- **null** - `null`

### 属性访问
- **对象属性** - `user.name`
- **嵌套属性** - `user.address.city`
- **安全导航** - `user?.address?.city`（避免空指针）

### 方法调用
- **实例方法** - `'hello'.toUpperCase()`
- **静态方法** - `T(java.lang.Math).random()`

### 运算符
- **算术** - `+`, `-`, `*`, `/`, `%`, `^`
- **关系** - `==`, `!=`, `<`, `>`, `<=`, `>=`
- **逻辑** - `and`, `or`, `not`, `!`
- **三元** - `condition ? true : false`
- **Elvis** - `value ?: defaultValue`（类似 `value != null ? value : defaultValue`）
- **正则** - `'hello' matches '[a-z]+'`

### 集合操作
- **列表** - `{1, 2, 3}`
- **Map** - `{name:'John', age:30}`
- **数组** - `new int[]{1, 2, 3}`
- **索引访问** - `list[0]`, `map['key']`
- **投影** - `users.![name]`（提取所有 name 属性）
- **选择** - `users.?[age > 18]`（过滤）
- **选择第一个** - `users.^[age > 18]`
- **选择最后一个** - `users.$[age > 18]`

### 类型引用
- **Java 类** - `T(java.lang.String)`
- **静态字段** - `T(java.lang.Math).PI`

### 变量与函数
- **变量** - `#variableName`
- **根对象** - `#root`
- **当前对象** - `#this`
- **自定义函数** - `#customFunction(arg)`

### 设计目的
提供强大且灵活的表达式语法，支持属性访问、方法调用、集合操作等常见场景。

### 使用限制与风险
- 复杂表达式难以调试，建议保持简洁
- 安全导航运算符（`?.`）仅在 Spring 4.3+ 支持
- 集合投影和选择操作性能开销较大

---

## 3. 模板表达式（#{}）

### 模板语法
- **单个表达式** - `#{expression}`
- **混合文本** - `Hello #{user.name}!`
- **嵌套表达式** - `#{user.address.city ?: 'Unknown'}`

### 解析器配置
```java
ParserContext parserContext = new TemplateParserContext();
Expression expr = parser.parseExpression("Hello #{#name}!", parserContext);
```

### 设计目的
在字符串模板中嵌入表达式，实现动态字符串生成。

### 使用限制与风险
- 模板解析比普通表达式开销更大
- 嵌套层级过深影响可读性

---

## 4. 集成 BeanFactory、ApplicationContext

### 上下文集成
```java
StandardEvaluationContext context = new StandardEvaluationContext();
context.setBeanResolver(new BeanFactoryResolver(beanFactory));

// 表达式中引用 Bean
Expression expr = parser.parseExpression("@userService.getUser(123)");
```

### Bean 引用语法
- **@beanName** - 引用容器中的 Bean

### 设计目的
在表达式中访问 Spring 容器的 Bean，实现与 IoC 容器的深度集成。

### 使用限制与风险
- 需配置 BeanResolver
- Bean 引用增加了表达式与容器的耦合

---

## 5. 表达式缓存与性能优化

### 缓存策略
- **解析结果缓存** - 缓存 Expression 对象
- **编译表达式** - `SpelCompiler` 将表达式编译为字节码

### 编译模式
- **OFF** - 不编译（默认）
- **IMMEDIATE** - 立即编译
- **MIXED** - 混合模式（先解释执行，热点表达式编译）

### 编译配置
```java
SpelParserConfiguration config = new SpelParserConfiguration(SpelCompilerMode.IMMEDIATE, null);
SpelExpressionParser parser = new SpelExpressionParser(config);
```

### 设计目的
提升高频表达式的执行性能，通过编译为字节码避免反射开销。

### 使用限制与风险
- 编译需要字节码生成支持（依赖 ASM）
- 并非所有表达式都可编译（如动态类型、反射调用）
- 编译有内存开销，仅适用于高频表达式

---

## 6. 类型转换集成

### 类型转换器
- **TypeConverter** - 类型转换器接口
- **StandardTypeConverter** - 标准类型转换器（集成 ConversionService）

### 上下文配置
```java
StandardEvaluationContext context = new StandardEvaluationContext();
context.setTypeConverter(new StandardTypeConverter(conversionService));
```

### 设计目的
在表达式求值时自动进行类型转换，提升易用性。

### 使用限制与风险
- 类型转换失败会抛出 EvaluationException
- 需正确配置 ConversionService

---

## 7. 自定义函数与变量

### 注册变量
```java
StandardEvaluationContext context = new StandardEvaluationContext();
context.setVariable("discount", 0.1);
// 表达式中使用：price * (1 - #discount)
```

### 注册函数
```java
Method method = StringUtils.class.getDeclaredMethod("isEmpty", String.class);
context.registerFunction("isEmpty", method);
// 表达式中使用：#isEmpty(name)
```

### 设计目的
扩展 SpEL 功能，支持自定义变量和函数，满足特定业务需求。

### 使用限制与风险
- 函数必须是静态方法
- 变量名不能与保留字冲突（如 `#root`, `#this`）

---

## 8. 安全表达式求值

### 安全上下文
- **SimpleEvaluationContext** - 受限上下文（推荐）
  - 不支持 Java 类型引用（`T()`）
  - 不支持构造器调用
  - 不支持 Bean 引用
  - 仅支持属性访问和集合操作

### 构建安全上下文
```java
SimpleEvaluationContext context = SimpleEvaluationContext
    .forReadOnlyDataBinding()
    .withRootObject(user)
    .build();
```

### 设计目的
防止表达式注入攻击，限制危险操作（如反射调用、类加载）。

### 使用限制与风险
- StandardEvaluationContext 功能强大但不安全，用户输入的表达式必须使用 SimpleEvaluationContext
- 安全上下文功能受限，需权衡安全性与灵活性

---

## 9. 表达式编译（CompilableExpression）

### 核心接口
- **CompiledExpression** - 编译后的表达式
- **SpelCompiler** - SpEL 编译器

### 编译条件
- 表达式类型稳定（同一表达式多次求值类型一致）
- 不包含动态类型推断
- 不包含复杂控制流

### 设计目的
将解释执行的表达式编译为字节码，提升重复执行的性能。

### 使用限制与风险
- 编译失败会回退到解释执行
- 编译表达式占用更多内存
- 动态变化的表达式不适合编译

---

## 10. 属性访问器扩展（PropertyAccessor）

### 核心接口
- **PropertyAccessor** - 属性访问器接口
  - `canRead()` - 是否可读
  - `read()` - 读取属性
  - `canWrite()` - 是否可写
  - `write()` - 写入属性

### 内置实现
- **ReflectivePropertyAccessor** - 反射属性访问器（默认）
- **MapAccessor** - Map 访问器
- **BeanFactoryAccessor** - BeanFactory 访问器

### 自定义访问器
```java
context.addPropertyAccessor(new CustomPropertyAccessor());
```

### 设计目的
扩展属性访问逻辑，支持自定义数据源（如 JSON、XML、数据库等）。

### 使用限制与风险
- 访问器优先级按注册顺序决定
- 性能敏感，避免在访问器中执行重操作

---

## 11. 方法解析器扩展（MethodResolver）

### 核心接口
- **MethodResolver** - 方法解析器接口
- **ConstructorResolver** - 构造器解析器接口

### 内置实现
- **ReflectiveMethodResolver** - 反射方法解析器（默认）
- **ReflectiveConstructorResolver** - 反射构造器解析器

### 设计目的
扩展方法调用逻辑，支持自定义方法查找和调用策略。

### 使用限制与风险
- 方法解析涉及反射，性能开销较大
- 自定义解析器需处理方法重载

---

## 12. 操作符重载（OperatorOverloader）

### 核心接口
- **OperatorOverloader** - 操作符重载接口

### 设计目的
支持自定义操作符行为（如 BigDecimal 加法）。

### 使用限制与风险
- 操作符重载改变默认语义，需谨慎使用
- 仅 StandardEvaluationContext 支持

---

## 13. 比较器扩展（TypeComparator）

### 核心接口
- **TypeComparator** - 类型比较器接口

### 内置实现
- **StandardTypeComparator** - 标准类型比较器

### 设计目的
自定义类型比较逻辑，支持特殊类型的比较（如自定义排序规则）。

### 使用限制与风险
- 比较器影响所有比较操作（`<`, `>`, `<=`, `>=`）
- 需保证比较逻辑一致性

---

## 14. 表达式异常处理

### 核心异常
- **EvaluationException** - 求值异常（基类）
- **ParseException** - 解析异常
- **SpelEvaluationException** - SpEL 求值异常
- **ExpressionException** - 表达式异常（基类）

### 常见异常
- **PropertyAccessException** - 属性访问异常
- **MethodNotFoundException** - 方法未找到异常
- **TypeConversionException** - 类型转换异常

### 设计目的
提供详细的异常信息，帮助定位表达式错误。

### 使用限制与风险
- 异常消息包含表达式内容，注意日志安全
- 用户输入的表达式需捕获异常，避免泄露系统信息

---

## 15. SpEL 在 Spring 中的应用

### @Value 注解
```java
@Value("#{systemProperties['user.home']}")
private String userHome;

@Value("#{user.name ?: 'Anonymous'}")
private String userName;
```

### @Cacheable 注解
```java
@Cacheable(value = "users", key = "#id")
public User getUser(Long id) { ... }
```

### @PreAuthorize 注解（Spring Security）
```java
@PreAuthorize("hasRole('ADMIN') and #user.id == authentication.principal.id")
public void updateUser(User user) { ... }
```

### @ConditionalOnExpression
```java
@ConditionalOnExpression("${feature.enabled:false}")
public class FeatureConfig { ... }
```

### 设计目的
在 Spring 注解中嵌入表达式，实现动态配置和条件化逻辑。

### 使用限制与风险
- 表达式错误会导致启动失败或运行时异常
- 复杂表达式降低可读性和可维护性

---

## 📚 总结

spring-expression 提供了强大的表达式引擎：
- **灵活的语法**：支持属性访问、方法调用、集合操作、类型引用等
- **模板支持**：在字符串中嵌入表达式
- **Spring 集成**：与 IoC 容器、ConversionService 深度集成
- **性能优化**：表达式编译、缓存机制
- **安全性**：SimpleEvaluationContext 限制危险操作
- **可扩展性**：支持自定义属性访问器、方法解析器、操作符重载等

SpEL 广泛应用于 Spring 的注解配置、安全控制、缓存、条件化配置等场景，是 Spring 生态的重要组成部分。
