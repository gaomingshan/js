# 18.2 集成测试

## 概述

集成测试验证多个模块协同工作的正确性。本节介绍 MyBatis Plus 项目的集成测试策略。

**核心内容：**
- 数据库集成测试
- API 接口测试
- 测试容器
- 测试数据管理

---

## 数据库集成测试

```java
@SpringBootTest
@Transactional
@Rollback
class UserIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserMapper userMapper;
    
    @Test
    void testUserLifecycle() {
        // 创建
        User user = new User();
        user.setName("集成测试");
        userService.save(user);
        
        // 查询
        User saved = userMapper.selectById(user.getId());
        assertNotNull(saved);
        
        // 更新
        saved.setAge(20);
        userService.updateById(saved);
        
        // 删除
        userService.removeById(saved.getId());
        
        // 验证删除
        User deleted = userMapper.selectById(saved.getId());
        assertNull(deleted);
    }
}
```

---

## REST API 测试

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetUser() throws Exception {
        mockMvc.perform(get("/user/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.name").value("张三"));
    }
    
    @Test
    void testCreateUser() throws Exception {
        String json = "{\"name\":\"测试\",\"age\":18}";
        
        mockMvc.perform(post("/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
}
```

---

## 关键点总结

1. **@SpringBootTest**：完整的应用上下文
2. **@Transactional**：测试后回滚数据
3. **MockMvc**：模拟 HTTP 请求
4. **测试容器**：使用 Testcontainers
5. **数据隔离**：每个测试独立数据
6. **端到端测试**：完整业务流程测试
7. **自动化**：集成到 CI/CD

---

## 参考资料

- [Spring Boot Integration Testing](https://spring.io/guides/gs/testing-web/)
- [Testcontainers](https://www.testcontainers.org/)
