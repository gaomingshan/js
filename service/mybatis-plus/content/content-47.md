# 22.2 敏感数据保护

## 概述

保护敏感数据是企业应用的基本要求。本节介绍数据加密、脱敏等安全措施。

**核心内容：**
- 数据加密存储
- 数据脱敏展示
- 日志脱敏
- 传输加密

---

## 数据加密存储

```java
/**
 * 字段加密
 */
@Data
public class User {
    private Long id;
    
    private String username;
    
    /**
     * 加密字段（数据库存密文）
     */
    @TableField(typeHandler = EncryptTypeHandler.class)
    private String idCard;
    
    @TableField(typeHandler = EncryptTypeHandler.class)
    private String phone;
}

/**
 * 加密 TypeHandler
 */
public class EncryptTypeHandler extends BaseTypeHandler<String> {
    
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, 
                                    String parameter, JdbcType jdbcType) 
            throws SQLException {
        // 加密后存储
        String encrypted = AESUtil.encrypt(parameter);
        ps.setString(i, encrypted);
    }
    
    @Override
    public String getNullableResult(ResultSet rs, String columnName) 
            throws SQLException {
        String encrypted = rs.getString(columnName);
        // 解密后返回
        return AESUtil.decrypt(encrypted);
    }
}
```

---

## 数据脱敏展示

```java
/**
 * 脱敏工具
 */
public class DesensitizeUtil {
    
    /**
     * 手机号脱敏：138****1234
     */
    public static String phone(String phone) {
        if (StringUtils.isBlank(phone) || phone.length() != 11) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }
    
    /**
     * 身份证脱敏：110***********1234
     */
    public static String idCard(String idCard) {
        if (StringUtils.isBlank(idCard) || idCard.length() != 18) {
            return idCard;
        }
        return idCard.substring(0, 3) + "***********" + idCard.substring(14);
    }
}

/**
 * JSON 序列化脱敏
 */
@JsonSerialize(using = PhoneSerializer.class)
private String phone;

public class PhoneSerializer extends JsonSerializer<String> {
    @Override
    public void serialize(String value, JsonGenerator gen, 
                         SerializerProvider serializers) throws IOException {
        gen.writeString(DesensitizeUtil.phone(value));
    }
}
```

---

## 日志脱敏

```java
/**
 * 日志脱敏
 */
@Aspect
@Component
public class LogDesensitizeAspect {
    
    @Around("@annotation(org.springframework.web.bind.annotation.PostMapping)")
    public Object desensitize(ProceedingJoinPoint point) throws Throwable {
        Object[] args = point.getArgs();
        
        // 脱敏参数
        for (Object arg : args) {
            if (arg instanceof UserDTO) {
                UserDTO dto = (UserDTO) arg;
                log.info("用户请求，手机号：{}", DesensitizeUtil.phone(dto.getPhone()));
            }
        }
        
        return point.proceed();
    }
}
```

---

## 关键点总结

1. **加密存储**：敏感字段加密后存储
2. **展示脱敏**：前端展示时脱敏
3. **日志脱敏**：日志中不输出敏感信息
4. **传输加密**：HTTPS 传输
5. **权限控制**：敏感数据权限管理
6. **审计日志**：记录敏感操作
7. **合规要求**：符合数据安全法规

---

## 参考资料

- [数据安全法](http://www.npc.gov.cn/npc/c30834/202106/7c9af12f51334a73b56d7938f99a788a.shtml)
- [个人信息保护法](http://www.npc.gov.cn/npc/c30834/202108/a8c4e3672c74491a80b53a172bb753fe.shtml)
