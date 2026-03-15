# 18.1 单元测试

## 概述

单元测试是保证代码质量的重要手段。本节介绍 MyBatis Plus 项目的单元测试最佳实践。

**核心内容：**
- JUnit 5 配置
- Service 层测试
- Mapper 层测试
- 测试数据准备

---

## JUnit 5 配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

---

## Service 层测试

```java
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testSave() {
        User user = new User();
        user.setName("测试用户");
        
        boolean result = userService.save(user);
        
        assertTrue(result);
        assertNotNull(user.getId());
    }
    
    @Test
    void testGetById() {
        User user = userService.getById(1L);
        
        assertNotNull(user);
        assertEquals("张三", user.getName());
    }
}
```

---

## Mock 测试

```java
@SpringBootTest
class OrderServiceTest {
    
    @Autowired
    private OrderService orderService;
    
    @MockBean
    private ProductService productService;
    
    @Test
    void testCreateOrder() {
        // Mock 商品服务
        when(productService.getById(1L))
            .thenReturn(mockProduct());
        
        OrderDTO dto = new OrderDTO();
        dto.setProductId(1L);
        dto.setQuantity(1);
        
        boolean result = orderService.createOrder(dto);
        
        assertTrue(result);
        verify(productService).reduceStock(1L, 1);
    }
}
```

---

## 关键点总结

1. **@SpringBootTest**：加载完整 Spring 上下文
2. **@Transactional**：测试后自动回滚
3. **@MockBean**：Mock 依赖服务
4. **断言**：验证测试结果
5. **测试数据**：使用 H2 内存数据库
6. **覆盖率**：保证代码覆盖率 > 80%
7. **持续集成**：集成到 CI/CD 流程

---

## 参考资料

- [JUnit 5](https://junit.org/junit5/)
- [Spring Boot Test](https://spring.io/guides/gs/testing-web/)
