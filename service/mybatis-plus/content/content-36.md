# 17.1 异常处理规范

## 概述

完善的异常处理机制是企业级应用的重要组成部分。本节介绍 MyBatis Plus 项目中的异常处理规范和最佳实践。

**核心内容：**
- 异常分类与设计
- 全局异常处理
- 业务异常处理
- 统一响应格式

---

## 异常分类设计

### 异常体系

```java
/**
 * 基础异常
 */
public class BaseException extends RuntimeException {
    private Integer code;
    private String message;
    
    public BaseException(Integer code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

/**
 * 业务异常
 */
public class BusinessException extends BaseException {
    public BusinessException(String message) {
        super(40000, message);
    }
}

/**
 * 系统异常
 */
public class SystemException extends BaseException {
    public SystemException(String message) {
        super(50000, message);
    }
}

/**
 * 参数异常
 */
public class ParamException extends BaseException {
    public ParamException(String message) {
        super(40001, message);
    }
}
```

---

## 全局异常处理

### @ControllerAdvice

```java
/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常：{}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }
    
    /**
     * 参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidException(MethodArgumentNotValidException e) {
        BindingResult result = e.getBindingResult();
        String message = result.getAllErrors().stream()
            .map(DefaultMessageSourceResolvable::getDefaultMessage)
            .collect(Collectors.joining(", "));
        
        log.warn("参数校验失败：{}", message);
        return Result.fail(40001, message);
    }
    
    /**
     * 数据库异常
     */
    @ExceptionHandler(DataAccessException.class)
    public Result<Void> handleDataAccessException(DataAccessException e) {
        log.error("数据库异常", e);
        return Result.fail(50001, "数据库操作失败");
    }
    
    /**
     * 未知异常
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail(50000, "系统繁忙，请稍后重试");
    }
}
```

---

## 统一响应格式

```java
/**
 * 统一响应对象
 */
@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;
    
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }
    
    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }
}
```

---

## 关键点总结

1. **异常分类**：业务异常、系统异常、参数异常
2. **全局处理**：@ControllerAdvice 统一处理
3. **日志记录**：记录异常堆栈信息
4. **响应格式**：统一的响应结构
5. **用户友好**：返回易于理解的错误信息
6. **安全性**：不暴露系统内部信息
7. **监控告警**：关键异常及时告警

---

## 参考资料

- [Spring 异常处理](https://spring.io/blog/2013/11/01/exception-handling-in-spring-mvc)
