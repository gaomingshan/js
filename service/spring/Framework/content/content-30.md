# 第 30 章：SpEL 表达式语言

> **学习目标**：掌握 Spring Expression Language 的使用  
> **预计时长**：1.5 小时  
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

**SpEL（Spring Expression Language）** 是 Spring 提供的强大的表达式语言。

---

## 2. 基本语法

```java
// 1. 字面量
@Value("#{100}")  // 整数
@Value("#{3.14}")  // 小数
@Value("#{'Hello'}")  // 字符串
@Value("#{true}")  // 布尔值

// 2. 引用 Bean
@Value("#{userService}")
private UserService userService;

// 3. 调用方法
@Value("#{userService.getCount()}")
private int userCount;

// 4. 访问属性
@Value("#{systemProperties['user.dir']}")
private String userDir;

// 5. 运算符
@Value("#{1 + 2}")  // 3
@Value("#{'Hello' + ' World'}")  // Hello World
@Value("#{10 > 5}")  // true

// 6. 三元运算符
@Value("#{userCount > 0 ? '有用户' : '无用户'}")
private String message;

// 7. Elvis 运算符
@Value("#{user.name ?: 'Unknown'}")  // 如果 name 为 null 则使用 'Unknown'
private String userName;

// 8. 安全导航运算符
@Value("#{user?.address?.city}")  // 避免 NullPointerException
private String city;
```

---

## 3. 集合操作

```java
// 1. 列表
@Value("#{{'A', 'B', 'C'}}")
private List<String> list;

// 2. Map
@Value("#{{key1: 'value1', key2: 'value2'}}")
private Map<String, String> map;

// 3. 过滤
@Value("#{users.?[age > 18]}")  // 过滤年龄大于18的用户
private List<User> adults;

// 4. 映射
@Value("#{users.![name]}")  // 提取所有用户的名字
private List<String> names;

// 5. 选择
@Value("#{users.^[age > 18]}")  // 第一个年龄大于18的用户
private User firstAdult;

@Value("#{users.$[age > 18]}")  // 最后一个年龄大于18的用户
private User lastAdult;
```

---

## 4. 使用示例

### 4.1 配置类中使用

```java
@Configuration
public class AppConfig {
    
    @Value("#{systemProperties['java.home']}")
    private String javaHome;
    
    @Bean
    public DataSource dataSource(
            @Value("#{environment['db.url']}") String url,
            @Value("#{environment['db.username']}") String username) {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(url);
        ds.setUsername(username);
        return ds;
    }
}
```

### 4.2 条件判断

```java
@Component
public class FeatureService {
    
    @Value("#{systemProperties['feature.enabled'] == 'true'}")
    private boolean featureEnabled;
    
    public void doSomething() {
        if (featureEnabled) {
            // 功能启用
        }
    }
}
```

---

## 5. 编程式使用

```java
public class SpELDemo {
    
    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();
        
        // 1. 解析表达式
        Expression exp = parser.parseExpression("'Hello World'");
        String message = (String) exp.getValue();
        System.out.println(message);  // Hello World
        
        // 2. 访问对象属性
        User user = new User("张三", 25);
        exp = parser.parseExpression("name");
        String name = (String) exp.getValue(user);
        System.out.println(name);  // 张三
        
        // 3. 调用方法
        exp = parser.parseExpression("name.length()");
        int length = (Integer) exp.getValue(user);
        System.out.println(length);  // 2
        
        // 4. 使用上下文
        StandardEvaluationContext context = new StandardEvaluationContext(user);
        context.setVariable("bonus", 1000);
        exp = parser.parseExpression("#bonus * 2");
        int result = (Integer) exp.getValue(context);
        System.out.println(result);  // 2000
    }
}
```

---

**上一章** ← [第 29 章：BeanPostProcessor 扩展](./content-29.md)  
**下一章** → [第 31 章：性能优化实战](./content-31.md)  
**返回目录** → [学习大纲](../content-outline.md)
