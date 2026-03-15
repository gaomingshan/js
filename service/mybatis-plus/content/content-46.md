# 22.1 SQL 注入防护

## 概述

SQL 注入是常见的安全漏洞。MyBatis Plus 提供了多层防护机制。

**防护措施：**
- 参数化查询
- Wrapper 防注入
- 自定义验证
- 安全配置

---

## 参数化查询

```java
/**
 * ✅ 安全：使用参数化查询
 */
@Select("SELECT * FROM user WHERE username = #{username}")
User selectByUsername(String username);

/**
 * ❌ 危险：字符串拼接
 */
@Select("SELECT * FROM user WHERE username = '${username}'")
User selectByUsernameDanger(String username);
// 输入：admin' OR '1'='1
// 结果：SELECT * FROM user WHERE username = 'admin' OR '1'='1'
```

---

## Wrapper 防注入

```java
/**
 * QueryWrapper 自动防注入
 */
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getUsername, userInput);  // 自动参数化

/**
 * 危险用法：apply
 */
wrapper.apply("username = '" + userInput + "'");  // ❌ 注入风险
```

---

## 输入验证

```java
/**
 * 输入验证
 */
@RestController
public class UserController {
    
    @PostMapping("/user")
    public Result<Void> create(@Validated @RequestBody UserDTO dto) {
        // @Validated 触发参数校验
        return Result.success();
    }
}

@Data
public class UserDTO {
    
    @NotBlank(message = "用户名不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9_]{3,20}$", message = "用户名格式不正确")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Length(min = 6, max = 20, message = "密码长度6-20位")
    private String password;
}
```

---

## 关键点总结

1. **参数化查询**：使用 #{} 而非 ${}
2. **Wrapper**：避免使用 apply 拼接
3. **输入验证**：校验所有用户输入
4. **权限控制**：最小权限原则
5. **日志审计**：记录敏感操作
6. **定期扫描**：使用安全扫描工具
7. **更新及时**：及时更新框架版本

---

## 参考资料

- [SQL 注入](https://owasp.org/www-community/attacks/SQL_Injection)
- [MyBatis 防注入](https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#Parameters)
