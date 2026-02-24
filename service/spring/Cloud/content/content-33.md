# 第33章：微服务安全架构

> **本章目标**：掌握微服务安全体系，实现认证授权、数据加密、接口防护

---

## 1. 微服务安全挑战

### 1.1 安全威胁

**外部威胁**：
- SQL 注入
- XSS 攻击
- CSRF 攻击
- DDoS 攻击
- 暴力破解
- 数据窃取

**内部威胁**：
- 服务间未认证
- 敏感数据明文传输
- 日志泄露敏感信息
- 配置信息泄露

---

### 1.2 安全架构分层

**四层防护**：
```
┌─────────────────────────────────────┐
│  网络层：防火墙、VPN、IP白名单      │
├─────────────────────────────────────┤
│  网关层：认证、限流、防注入、防XSS  │
├─────────────────────────────────────┤
│  服务层：授权、加密、审计           │
├─────────────────────────────────────┤
│  数据层：加密存储、备份、权限控制   │
└─────────────────────────────────────┘
```

---

## 2. OAuth2 + JWT 认证授权

### 2.1 OAuth2 核心概念

**四种授权模式**：
1. **授权码模式**（Authorization Code）：最安全，适合有后端的应用
2. **简化模式**（Implicit）：适合纯前端应用
3. **密码模式**（Password）：用户名密码直接换 Token
4. **客户端模式**（Client Credentials）：服务间调用

**角色**：
- **Resource Owner**：资源所有者（用户）
- **Client**：客户端（应用）
- **Authorization Server**：认证服务器
- **Resource Server**：资源服务器（API）

---

### 2.2 搭建认证服务器

**引入依赖**：
```xml
<dependencies>
    <!-- Spring Security OAuth2 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-oauth2</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-jwt</artifactId>
    </dependency>
</dependencies>
```

**认证服务器配置**：
```java
@Configuration
@EnableAuthorizationServer
public class AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        clients.inMemory()
            .withClient("client-app")
            .secret(passwordEncoder().encode("secret"))
            .authorizedGrantTypes("authorization_code", "password", "refresh_token")
            .scopes("read", "write")
            .accessTokenValiditySeconds(3600)  // 1小时
            .refreshTokenValiditySeconds(86400);  // 1天
    }
    
    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) {
        endpoints
            .authenticationManager(authenticationManager)
            .userDetailsService(userDetailsService)
            .tokenStore(tokenStore())
            .accessTokenConverter(accessTokenConverter());
    }
    
    @Bean
    public TokenStore tokenStore() {
        return new JwtTokenStore(accessTokenConverter());
    }
    
    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
        JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
        converter.setSigningKey("jwt-secret-key");  // 签名密钥
        return converter;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**Security 配置**：
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
            .passwordEncoder(passwordEncoder());
    }
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
            .antMatchers("/oauth/**").permitAll()
            .anyRequest().authenticated()
            .and()
            .formLogin().permitAll();
    }
    
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**UserDetailsService 实现**：
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userMapper.findByUsername(username);
        
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password(user.getPassword())
            .authorities(getAuthorities(user))
            .build();
    }
    
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        user.getRoles().forEach(role -> {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
        });
        return authorities;
    }
}
```

---

### 2.3 获取 Token

**密码模式获取 Token**：
```bash
curl -X POST \
  http://localhost:8080/oauth/token \
  -H 'Authorization: Basic Y2xpZW50LWFwcDpzZWNyZXQ=' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&username=admin&password=123456'
```

**响应**：
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3599,
  "scope": "read write"
}
```

**刷新 Token**：
```bash
curl -X POST \
  http://localhost:8080/oauth/token \
  -H 'Authorization: Basic Y2xpZW50LWFwcDpzZWNyZXQ=' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=refresh_token&refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 2.4 资源服务器配置

**配置**：
```java
@Configuration
@EnableResourceServer
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {
    
    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .antMatchers("/public/**").permitAll()
            .antMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated();
    }
    
    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
        resources.tokenStore(tokenStore());
    }
    
    @Bean
    public TokenStore tokenStore() {
        return new JwtTokenStore(accessTokenConverter());
    }
    
    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
        JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
        converter.setSigningKey("jwt-secret-key");  // 与认证服务器相同
        return converter;
    }
}
```

**使用 Token 访问**：
```bash
curl -X GET \
  http://localhost:8001/user/info \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

### 2.5 自定义 JWT 内容

**自定义 TokenEnhancer**：
```java
@Component
public class CustomTokenEnhancer implements TokenEnhancer {
    
    @Override
    public OAuth2AccessToken enhance(OAuth2AccessToken accessToken, OAuth2Authentication authentication) {
        Map<String, Object> additionalInfo = new HashMap<>();
        
        User user = (User) authentication.getPrincipal();
        additionalInfo.put("userId", user.getId());
        additionalInfo.put("username", user.getUsername());
        additionalInfo.put("email", user.getEmail());
        
        ((DefaultOAuth2AccessToken) accessToken).setAdditionalInformation(additionalInfo);
        
        return accessToken;
    }
}
```

**配置 TokenEnhancer**：
```java
@Override
public void configure(AuthorizationServerEndpointsConfigurer endpoints) {
    TokenEnhancerChain tokenEnhancerChain = new TokenEnhancerChain();
    tokenEnhancerChain.setTokenEnhancers(Arrays.asList(
        customTokenEnhancer,
        accessTokenConverter()
    ));
    
    endpoints
        .authenticationManager(authenticationManager)
        .userDetailsService(userDetailsService)
        .tokenStore(tokenStore())
        .tokenEnhancer(tokenEnhancerChain);
}
```

---

## 3. Gateway 统一鉴权

### 3.1 JWT 验证过滤器

**全局过滤器**：
```java
@Component
@Order(-100)
public class AuthenticationFilter implements GlobalFilter {
    
    private static final String SECRET_KEY = "jwt-secret-key";
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        
        // 白名单放行
        if (isWhiteListed(path)) {
            return chain.filter(exchange);
        }
        
        // 获取 Token
        String token = extractToken(exchange.getRequest());
        
        if (token == null) {
            return unauthorized(exchange, "Missing token");
        }
        
        try {
            // 验证 JWT
            Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
            
            // 提取用户信息
            String userId = claims.get("userId", String.class);
            String username = claims.getSubject();
            
            // 传递给下游服务
            ServerHttpRequest request = exchange.getRequest().mutate()
                .header("X-User-Id", userId)
                .header("X-Username", username)
                .build();
            
            return chain.filter(exchange.mutate().request(request).build());
            
        } catch (ExpiredJwtException e) {
            return unauthorized(exchange, "Token expired");
        } catch (JwtException e) {
            return unauthorized(exchange, "Invalid token");
        }
    }
    
    private String extractToken(ServerHttpRequest request) {
        String authorization = request.getHeaders().getFirst("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
    
    private boolean isWhiteListed(String path) {
        return path.startsWith("/public/") || 
               path.equals("/oauth/token") ||
               path.equals("/login");
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        String body = "{\"error\":\"" + message + "\"}";
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(body.getBytes());
        
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}
```

---

### 3.2 权限验证

**RBAC（基于角色的访问控制）**：
```java
@Component
@Order(-99)
public class AuthorizationFilter implements GlobalFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethodValue();
        
        // 获取用户角色
        String roles = exchange.getRequest().getHeaders().getFirst("X-User-Roles");
        
        // 检查权限
        if (!hasPermission(path, method, roles)) {
            return forbidden(exchange, "Access denied");
        }
        
        return chain.filter(exchange);
    }
    
    private boolean hasPermission(String path, String method, String roles) {
        // 权限配置
        if (path.startsWith("/admin/")) {
            return roles != null && roles.contains("ROLE_ADMIN");
        }
        
        if (path.startsWith("/user/") && "DELETE".equals(method)) {
            return roles != null && roles.contains("ROLE_ADMIN");
        }
        
        return true;
    }
    
    private Mono<Void> forbidden(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        // ...
        return exchange.getResponse().setComplete();
    }
}
```

---

## 4. 数据加密

### 4.1 传输加密（HTTPS）

**配置 SSL**：
```yaml
server:
  port: 8443
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: changeit
    key-store-type: PKCS12
    key-alias: tomcat
```

**生成证书**：
```bash
keytool -genkeypair -alias tomcat -keyalg RSA -keysize 2048 \
  -storetype PKCS12 -keystore keystore.p12 -validity 3650
```

---

### 4.2 敏感数据加密

**Jasypt 加密配置**：
```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.4</version>
</dependency>
```

**配置密钥**：
```yaml
jasypt:
  encryptor:
    password: my-secret-key
    algorithm: PBEWithMD5AndDES
```

**加密配置**：
```yaml
spring:
  datasource:
    password: ENC(encrypted-password)
  
  redis:
    password: ENC(encrypted-redis-password)
```

**加密工具**：
```java
public class JasyptUtil {
    
    public static void main(String[] args) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        encryptor.setPassword("my-secret-key");
        encryptor.setAlgorithm("PBEWithMD5AndDES");
        
        String encrypted = encryptor.encrypt("my-password");
        System.out.println("Encrypted: " + encrypted);
        
        String decrypted = encryptor.decrypt(encrypted);
        System.out.println("Decrypted: " + decrypted);
    }
}
```

---

### 4.3 数据库字段加密

**自定义类型处理器**：
```java
@MappedTypes(String.class)
public class EncryptTypeHandler extends BaseTypeHandler<String> {
    
    private static final String SECRET_KEY = "AES-256-KEY";
    
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType) throws SQLException {
        // 加密
        String encrypted = AESUtil.encrypt(parameter, SECRET_KEY);
        ps.setString(i, encrypted);
    }
    
    @Override
    public String getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String encrypted = rs.getString(columnName);
        // 解密
        return AESUtil.decrypt(encrypted, SECRET_KEY);
    }
    
    // 省略其他方法...
}
```

**MyBatis 配置**：
```xml
<resultMap id="UserMap" type="User">
    <result property="phone" column="phone" typeHandler="com.example.EncryptTypeHandler"/>
    <result property="idCard" column="id_card" typeHandler="com.example.EncryptTypeHandler"/>
</resultMap>
```

---

## 5. 接口防护

### 5.1 防 SQL 注入

**参数验证**：
```java
@RestController
public class UserController {
    
    @GetMapping("/user/search")
    public List<User> search(@RequestParam String keyword) {
        // 验证参数
        if (!isValidKeyword(keyword)) {
            throw new IllegalArgumentException("Invalid keyword");
        }
        
        return userService.search(keyword);
    }
    
    private boolean isValidKeyword(String keyword) {
        // 禁止 SQL 关键字
        String[] sqlKeywords = {"'", "--", ";", "union", "select", "drop", "delete"};
        String lowerKeyword = keyword.toLowerCase();
        
        for (String sql : sqlKeywords) {
            if (lowerKeyword.contains(sql)) {
                return false;
            }
        }
        
        return true;
    }
}
```

**使用 PreparedStatement**：
```java
// ✅ 正确：使用参数化查询
@Select("SELECT * FROM user WHERE username = #{username}")
User findByUsername(String username);

// ❌ 错误：拼接 SQL
@Select("SELECT * FROM user WHERE username = '${username}'")
User findByUsername(String username);
```

---

### 5.2 防 XSS 攻击

**HTML 转义**：
```java
@Component
public class XssFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        XssHttpServletRequestWrapper wrapper = new XssHttpServletRequestWrapper((HttpServletRequest) request);
        chain.doFilter(wrapper, response);
    }
}

public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {
    
    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        return cleanXSS(value);
    }
    
    private String cleanXSS(String value) {
        if (value == null) {
            return null;
        }
        
        value = value.replaceAll("<", "&lt;")
                     .replaceAll(">", "&gt;")
                     .replaceAll("\"", "&quot;")
                     .replaceAll("'", "&#x27;")
                     .replaceAll("/", "&#x2F;");
        
        return value;
    }
}
```

---

### 5.3 接口签名

**请求签名**：
```java
@Component
@Order(-150)
public class SignatureFilter implements GlobalFilter {
    
    private static final String SECRET_KEY = "api-secret-key";
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 提取签名参数
        String timestamp = request.getHeaders().getFirst("X-Timestamp");
        String nonce = request.getHeaders().getFirst("X-Nonce");
        String signature = request.getHeaders().getFirst("X-Signature");
        
        // 验证时间戳（防重放攻击）
        long requestTime = Long.parseLong(timestamp);
        long currentTime = System.currentTimeMillis();
        if (Math.abs(currentTime - requestTime) > 300000) {  // 5分钟
            return unauthorized(exchange, "Request expired");
        }
        
        // 验证签名
        String path = request.getURI().getPath();
        String expectedSignature = generateSignature(path, timestamp, nonce);
        
        if (!expectedSignature.equals(signature)) {
            return unauthorized(exchange, "Invalid signature");
        }
        
        return chain.filter(exchange);
    }
    
    private String generateSignature(String path, String timestamp, String nonce) {
        String data = path + timestamp + nonce + SECRET_KEY;
        return DigestUtils.md5DigestAsHex(data.getBytes());
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}
```

**客户端生成签名**：
```java
public class ApiClient {
    
    private static final String SECRET_KEY = "api-secret-key";
    
    public String request(String path) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String nonce = UUID.randomUUID().toString();
        String signature = generateSignature(path, timestamp, nonce);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Timestamp", timestamp);
        headers.set("X-Nonce", nonce);
        headers.set("X-Signature", signature);
        
        // 发送请求...
        return "response";
    }
    
    private String generateSignature(String path, String timestamp, String nonce) {
        String data = path + timestamp + nonce + SECRET_KEY;
        return DigestUtils.md5DigestAsHex(data.getBytes());
    }
}
```

---

## 6. 审计日志

### 6.1 操作日志

**AOP 记录日志**：
```java
@Aspect
@Component
public class AuditLogAspect {
    
    @Autowired
    private AuditLogMapper auditLogMapper;
    
    @Around("@annotation(auditLog)")
    public Object log(ProceedingJoinPoint joinPoint, AuditLog auditLog) throws Throwable {
        // 获取当前用户
        String userId = getCurrentUserId();
        String username = getCurrentUsername();
        
        // 获取请求参数
        Object[] args = joinPoint.getArgs();
        String params = JSON.toJSONString(args);
        
        // 执行方法
        long start = System.currentTimeMillis();
        Object result = null;
        String status = "SUCCESS";
        String errorMsg = null;
        
        try {
            result = joinPoint.proceed();
        } catch (Exception e) {
            status = "FAILED";
            errorMsg = e.getMessage();
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - start;
            
            // 保存日志
            AuditLogEntity log = new AuditLogEntity();
            log.setUserId(userId);
            log.setUsername(username);
            log.setOperation(auditLog.value());
            log.setMethod(joinPoint.getSignature().getName());
            log.setParams(params);
            log.setStatus(status);
            log.setErrorMsg(errorMsg);
            log.setDuration(duration);
            log.setCreateTime(new Date());
            
            auditLogMapper.insert(log);
        }
        
        return result;
    }
}
```

**注解**：
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLog {
    String value();  // 操作描述
}
```

**使用**：
```java
@Service
public class UserService {
    
    @AuditLog("创建用户")
    public void createUser(UserDTO user) {
        userMapper.insert(user);
    }
    
    @AuditLog("删除用户")
    public void deleteUser(Long id) {
        userMapper.deleteById(id);
    }
}
```

---

## 7. 学习自检清单

- [ ] 理解微服务安全挑战
- [ ] 掌握 OAuth2 + JWT 认证授权
- [ ] 能够搭建认证服务器
- [ ] 掌握 Gateway 统一鉴权
- [ ] 掌握数据加密（传输、存储）
- [ ] 掌握接口防护（SQL注入、XSS、签名）
- [ ] 能够实现审计日志

---

## 8. 面试高频题

**Q1：JWT vs Session？**

| 维度 | JWT | Session |
|------|-----|---------|
| 存储 | 客户端 | 服务端 |
| 扩展性 | 好（无状态） | 差（需共享Session） |
| 安全性 | 一般 | 好 |
| 性能 | 好（无需查询） | 一般 |

**Q2：如何防止 Token 被盗用？**

**参考答案**：
1. HTTPS 传输
2. 设置较短过期时间
3. Refresh Token 机制
4. IP 白名单
5. 设备指纹
6. 异常登录检测

**Q3：微服务间如何认证？**

**参考答案**：
1. JWT Token 传递
2. API Key
3. 服务间证书认证（mTLS）
4. Service Mesh（Istio）自动认证

---

**本章小结**：
- 安全威胁：SQL注入、XSS、CSRF、数据窃取
- OAuth2 + JWT：认证服务器、资源服务器、Token
- Gateway 鉴权：JWT验证、权限控制
- 数据加密：HTTPS、Jasypt、字段加密
- 接口防护：防注入、防XSS、接口签名
- 审计日志：操作记录、AOP实现

**下一章预告**：第34章 - 微服务部署与运维
