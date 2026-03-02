# Spring Test 源码指引

> spring-test 提供测试支持，包括单元测试、集成测试、Mock 环境等。

---

## 1. 单元测试支持（MockBean、SpyBean）

### 核心注解（Spring Boot）
- **@MockBean** - 创建 Mock Bean 并注入容器
- **@SpyBean** - 创建 Spy Bean（部分 Mock）

### 使用示例
```java
@SpringBootTest
class UserServiceTest {
    @MockBean
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    @Test
    void testGetUser() {
        User user = new User(1L, "John");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        User result = userService.getUser(1L);
        assertEquals("John", result.getName());
    }
}
```

### 设计目的
在测试中 Mock 依赖，隔离测试单元。

### 使用限制与风险
- @MockBean 会替换容器中的 Bean
- @SpyBean 部分 Mock，保留原对象
- 需 Mockito 依赖

---

## 2. 集成测试支持（@SpringBootTest、@WebMvcTest）

### 核心注解
- **@SpringBootTest** - 完整的 Spring Boot 集成测试
- **@WebMvcTest** - Web 层切片测试
- **@DataJpaTest** - JPA 层切片测试
- **@DataJdbcTest** - JDBC 层切片测试
- **@DataMongoTest** - MongoDB 层切片测试
- **@DataRedisTest** - Redis 层切片测试
- **@JsonTest** - JSON 序列化测试
- **@RestClientTest** - REST 客户端测试

### @SpringBootTest 示例
```java
@SpringBootTest
@AutoConfigureMockMvc
class ApplicationIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetUser() throws Exception {
        mockMvc.perform(get("/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("John"));
    }
}
```

### @WebMvcTest 示例
```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void testGetUser() throws Exception {
        User user = new User(1L, "John");
        when(userService.getUser(1L)).thenReturn(user);
        
        mockMvc.perform(get("/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("John"));
    }
}
```

### 设计目的
提供不同粒度的测试支持，从完整集成测试到切片测试。

### 使用限制与风险
- @SpringBootTest 启动完整容器，速度慢
- @WebMvcTest 仅加载 Web 层，速度快
- 切片测试需 Mock 其他层

---

## 3. Mock 环境（MockMvc、MockHttpServletRequest）

### MockMvc
```java
@Test
void testCreateUser() throws Exception {
    String userJson = "{\"name\":\"John\",\"age\":30}";
    
    mockMvc.perform(post("/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(userJson))
        .andExpect(status().isCreated())
        .andExpect(header().exists("Location"))
        .andExpect(jsonPath("$.id").exists());
}
```

### 请求构建器
- **get()** - GET 请求
- **post()** - POST 请求
- **put()** - PUT 请求
- **delete()** - DELETE 请求
- **patch()** - PATCH 请求

### 结果匹配器
- **status()** - 状态码匹配
- **content()** - 响应体匹配
- **jsonPath()** - JSON 路径匹配
- **header()** - 响应头匹配
- **model()** - 模型属性匹配
- **view()** - 视图名称匹配

### 设计目的
模拟 HTTP 请求和响应，无需启动真实服务器。

### 使用限制与风险
- MockMvc 不是真实的 HTTP 请求
- 某些场景需使用 TestRestTemplate 或 WebTestClient

---

## 4. MockMvc 测试

### 完整示例
```java
@WebMvcTest(UserController.class)
class UserControllerMockMvcTest {
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void testGetUser() throws Exception {
        User user = new User(1L, "John", 30);
        when(userService.getUser(1L)).thenReturn(user);
        
        mockMvc.perform(get("/users/{id}", 1L)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("John"))
            .andExpect(jsonPath("$.age").value(30));
    }
    
    @Test
    void testCreateUser() throws Exception {
        User user = new User(null, "Jane", 25);
        User savedUser = new User(2L, "Jane", 25);
        when(userService.save(any(User.class))).thenReturn(savedUser);
        
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Jane\",\"age\":25}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.name").value("Jane"));
    }
    
    @Test
    void testUpdateUser() throws Exception {
        User updatedUser = new User(1L, "John Updated", 31);
        when(userService.update(eq(1L), any(User.class))).thenReturn(updatedUser);
        
        mockMvc.perform(put("/users/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"John Updated\",\"age\":31}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("John Updated"));
    }
    
    @Test
    void testDeleteUser() throws Exception {
        doNothing().when(userService).delete(1L);
        
        mockMvc.perform(delete("/users/{id}", 1L))
            .andExpect(status().isNoContent());
    }
    
    @Test
    void testGetUserNotFound() throws Exception {
        when(userService.getUser(999L)).thenThrow(new NotFoundException("User not found"));
        
        mockMvc.perform(get("/users/{id}", 999L))
            .andExpect(status().isNotFound());
    }
}
```

### 设计目的
提供完整的 Web 层测试支持。

### 使用限制与风险
- 需正确配置 Content-Type 和 Accept
- JSON 断言使用 JsonPath
- 异常处理需配置 @ControllerAdvice

---

## 5. REST 测试（RestTemplate、TestRestTemplate）

### TestRestTemplate
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerIntegrationTest {
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testGetUser() {
        ResponseEntity<User> response = restTemplate.getForEntity("/users/1", User.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("John", response.getBody().getName());
    }
    
    @Test
    void testCreateUser() {
        User user = new User(null, "Jane", 25);
        ResponseEntity<User> response = restTemplate.postForEntity("/users", user, User.class);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().getId());
    }
}
```

### 设计目的
使用真实的 HTTP 客户端测试，更接近实际运行环境。

### 使用限制与风险
- 需启动真实服务器（速度慢）
- webEnvironment=RANDOM_PORT 避免端口冲突
- 适合端到端集成测试

---

## 6. 事务回滚（@Transactional 测试）

### 自动回滚
```java
@SpringBootTest
@Transactional
class UserServiceTransactionalTest {
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void testCreateUser() {
        User user = new User(null, "John", 30);
        User savedUser = userService.save(user);
        assertNotNull(savedUser.getId());
        
        // 测试结束后自动回滚
    }
}
```

### 禁用回滚
```java
@Test
@Commit // 或 @Rollback(false)
void testCreateUserCommit() {
    User user = new User(null, "John", 30);
    userService.save(user);
    // 测试结束后提交事务
}
```

### 设计目的
测试事务逻辑，自动回滚避免污染数据库。

### 使用限制与风险
- @Transactional 默认在测试方法结束后回滚
- 需真实数据库连接
- 嵌入式数据库（H2）适合测试

---

## 7. 测试注解（@ContextConfiguration、@TestPropertySource）

### @ContextConfiguration
```java
@SpringJUnitConfig
@ContextConfiguration(classes = TestConfig.class)
class UserServiceTest {
    @Autowired
    private UserService userService;
}
```

### @TestPropertySource
```java
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "logging.level.root=DEBUG"
})
class ApplicationTest {
}
```

或加载配置文件：
```java
@TestPropertySource(locations = "classpath:test.properties")
```

### 设计目的
自定义测试上下文配置和属性。

### 使用限制与风险
- @TestPropertySource 优先级高于 application.properties
- 测试配置与生产配置隔离

---

## 8. 上下文缓存（TestContext 框架）

### 上下文缓存机制
- Spring 会缓存测试上下文，相同配置的测试共享上下文
- 提升测试性能

### 清理上下文
```java
@Test
@DirtiesContext // 测试后清理上下文
void testThatDirtiesContext() {
    // 修改了上下文状态
}

@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class UserServiceTest {
    // 类中所有测试后清理上下文
}
```

### 设计目的
优化测试性能，避免重复创建上下文。

### 使用限制与风险
- @DirtiesContext 会降低测试性能
- 仅在必要时使用（如修改了 ApplicationContext）

---

## 9. Web 测试支持（@WebAppConfiguration）

### @WebAppConfiguration
```java
@SpringJUnitWebConfig
@ContextConfiguration(classes = WebConfig.class)
@WebAppConfiguration
class WebTest {
    @Autowired
    private WebApplicationContext wac;
    
    private MockMvc mockMvc;
    
    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
    }
}
```

### 设计目的
配置 Web 应用上下文，支持 Web 层测试。

### 使用限制与风险
- Spring Boot 测试通常不需要此注解
- 适用于传统 Spring MVC 测试

---

## 10. 测试扩展点（TestExecutionListener）

### 核心接口
- **TestExecutionListener** - 测试执行监听器
  - `beforeTestClass()` - 测试类执行前
  - `prepareTestInstance()` - 准备测试实例
  - `beforeTestMethod()` - 测试方法执行前
  - `afterTestMethod()` - 测试方法执行后
  - `afterTestClass()` - 测试类执行后

### 自定义监听器
```java
public class CustomTestExecutionListener implements TestExecutionListener {
    @Override
    public void beforeTestMethod(TestContext testContext) throws Exception {
        log.info("Before test method: {}", testContext.getTestMethod().getName());
    }
}

@SpringBootTest
@TestExecutionListeners(
    listeners = CustomTestExecutionListener.class,
    mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS
)
class UserServiceTest {
}
```

### 设计目的
在测试生命周期的不同阶段插入自定义逻辑。

### 使用限制与风险
- mergeMode 控制是否合并默认监听器
- 监听器执行顺序很重要

---

## 11. 测试数据准备与清理（@Sql、@BeforeEach）

### @Sql 注解
```java
@SpringBootTest
@Sql(scripts = "/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void testFindAll() {
        List<User> users = userRepository.findAll();
        assertEquals(10, users.size());
    }
}
```

### @BeforeEach/@AfterEach
```java
@SpringBootTest
class UserServiceTest {
    @Autowired
    private UserRepository userRepository;
    
    @BeforeEach
    void setup() {
        userRepository.deleteAll();
        userRepository.save(new User(null, "John", 30));
    }
    
    @AfterEach
    void cleanup() {
        userRepository.deleteAll();
    }
}
```

### 设计目的
准备测试数据和清理环境，确保测试独立性。

### 使用限制与风险
- @Sql 执行 SQL 脚本
- @BeforeEach 在每个测试方法前执行
- 测试数据应隔离，避免相互影响

---

## 12. 测试环境隔离（@DirtiesContext）

### 类级别隔离
```java
@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class UserServiceTest {
    // 所有测试执行后清理上下文
}
```

### 方法级别隔离
```java
@Test
@DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
void testThatModifiesContext() {
    // 测试后清理上下文
}
```

### 设计目的
隔离测试环境，避免测试间相互影响。

### 使用限制与风险
- 过度使用降低测试性能
- 仅在修改了共享状态时使用

---

## 13. 测试配置与属性注入（@TestConfiguration）

### @TestConfiguration
```java
@TestConfiguration
public class TestConfig {
    @Bean
    @Primary
    public UserService mockUserService() {
        return mock(UserService.class);
    }
}

@SpringBootTest
@Import(TestConfig.class)
class ApplicationTest {
    @Autowired
    private UserService userService; // Mock 版本
}
```

### 设计目的
提供测试专用配置，覆盖生产配置。

### 使用限制与风险
- @TestConfiguration 不会自动扫描，需 @Import
- @Primary 覆盖同类型 Bean

---

## 14. 响应式测试支持（WebTestClient）

### WebTestClient
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerWebFluxTest {
    @Autowired
    private WebTestClient webTestClient;
    
    @Test
    void testGetUser() {
        webTestClient.get().uri("/users/1")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.name").isEqualTo("John");
    }
    
    @Test
    void testCreateUser() {
        User user = new User(null, "Jane", 25);
        
        webTestClient.post().uri("/users")
            .bodyValue(user)
            .exchange()
            .expectStatus().isCreated()
            .expectBody()
            .jsonPath("$.id").exists();
    }
}
```

### 设计目的
测试响应式 Web 应用（WebFlux）。

### 使用限制与风险
- WebTestClient 支持响应式和非响应式应用
- 返回值是 Mono/Flux
- 需正确处理背压

---

## 15. 测试切片（Test Slicing）

### 切片测试注解
- **@WebMvcTest** - Web 层
- **@DataJpaTest** - JPA 层
- **@DataJdbcTest** - JDBC 层
- **@DataMongoTest** - MongoDB 层
- **@DataRedisTest** - Redis 层
- **@JsonTest** - JSON 序列化
- **@RestClientTest** - REST 客户端

### 设计目的
仅加载特定层的 Bean，提升测试速度。

### 使用限制与风险
- 切片测试不加载完整上下文
- 其他层需 Mock
- 适合单元测试

---

## 📚 总结

spring-test 提供了完整的测试支持：
- **单元测试**：@MockBean、@SpyBean
- **集成测试**：@SpringBootTest、切片测试
- **MockMvc**：模拟 HTTP 请求
- **TestRestTemplate**：真实 HTTP 测试
- **事务回滚**：@Transactional 自动回滚
- **测试配置**：@TestPropertySource、@TestConfiguration
- **上下文缓存**：TestContext 框架
- **测试数据**：@Sql、@BeforeEach
- **响应式测试**：WebTestClient
- **测试切片**：加速测试执行

Spring Test 简化了测试编写，提升了测试效率和质量。
