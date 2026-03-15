# 15.1 多租户方案实战

## 概述

多租户架构允许单个应用实例服务多个租户，每个租户的数据完全隔离。本节介绍基于 MyBatis Plus 的多租户完整解决方案。

**核心内容：**
- 多租户架构设计
- 租户数据隔离
- 租户切换机制
- 租户管理系统

---

## 多租户架构设计

### 方案对比

| 方案 | 隔离级别 | 成本 | 扩展性 | 适用场景 |
|------|---------|------|--------|---------|
| 独立数据库 | 最高 | 高 | 低 | 大型企业客户 |
| 独立Schema | 高 | 中 | 中 | 中型企业客户 |
| 共享数据库+tenant_id | 中 | 低 | 高 | SaaS平台（推荐） |

### 共享数据库方案设计

```sql
-- 租户表
CREATE TABLE `tenant` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `tenant_code` VARCHAR(50) NOT NULL COMMENT '租户编码',
  `tenant_name` VARCHAR(100) NOT NULL COMMENT '租户名称',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态(0:禁用,1:启用)',
  `expire_time` DATETIME COMMENT '到期时间',
  `max_users` INT(11) DEFAULT 100 COMMENT '最大用户数',
  `create_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_code` (`tenant_code`)
) ENGINE=InnoDB COMMENT='租户表';

-- 业务表（包含tenant_id）
CREATE TABLE `user` (
  `id` BIGINT(20) NOT NULL,
  `tenant_id` BIGINT(20) NOT NULL COMMENT '租户ID',
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `create_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  UNIQUE KEY `uk_tenant_username` (`tenant_id`, `username`)
) ENGINE=InnoDB COMMENT='用户表';
```

---

## 租户数据隔离实现

### 配置多租户插件

```java
/**
 * 多租户配置
 */
@Configuration
public class TenantConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 多租户插件
        TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor();
        tenantInterceptor.setTenantLineHandler(new TenantLineHandler() {
            
            @Override
            public Expression getTenantId() {
                Long tenantId = TenantContextHolder.getTenantId();
                if (tenantId == null) {
                    throw new TenantException("租户ID不能为空");
                }
                return new LongValue(tenantId);
            }
            
            @Override
            public String getTenantIdColumn() {
                return "tenant_id";
            }
            
            @Override
            public boolean ignoreTable(String tableName) {
                // 系统表不需要租户隔离
                List<String> ignoreTables = Arrays.asList(
                    "tenant", "sys_config", "sys_dict"
                );
                return ignoreTables.contains(tableName);
            }
        });
        
        interceptor.addInnerInterceptor(tenantInterceptor);
        
        return interceptor;
    }
}
```

### 租户上下文管理

```java
/**
 * 租户上下文
 */
public class TenantContextHolder {
    
    private static final ThreadLocal<Long> TENANT_ID = new ThreadLocal<>();
    
    public static void setTenantId(Long tenantId) {
        TENANT_ID.set(tenantId);
    }
    
    public static Long getTenantId() {
        return TENANT_ID.get();
    }
    
    public static void clear() {
        TENANT_ID.remove();
    }
}

/**
 * 租户拦截器
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        // 1. 从JWT获取租户ID
        Long tenantId = getTenantIdFromToken(request);
        
        if (tenantId == null) {
            // 2. 从请求头获取
            String tenantIdStr = request.getHeader("X-Tenant-Id");
            if (StringUtils.isNotBlank(tenantIdStr)) {
                tenantId = Long.parseLong(tenantIdStr);
            }
        }
        
        if (tenantId != null) {
            TenantContextHolder.setTenantId(tenantId);
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) {
        TenantContextHolder.clear();
    }
    
    private Long getTenantIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (StringUtils.isNotBlank(token)) {
            return JwtUtils.getTenantId(token);
        }
        return null;
    }
}
```

---

## 租户管理系统

### 租户注册

```java
/**
 * 租户注册服务
 */
@Service
public class TenantRegisterService {
    
    @Autowired
    private TenantService tenantService;
    
    @Autowired
    private UserService userService;
    
    /**
     * 租户注册
     */
    @Transactional(rollbackFor = Exception.class)
    public TenantRegisterVO register(TenantRegisterDTO dto) {
        // 1. 验证租户编码唯一性
        Long count = tenantService.lambdaQuery()
            .eq(Tenant::getTenantCode, dto.getTenantCode())
            .count();
        
        if (count > 0) {
            throw new BusinessException("租户编码已存在");
        }
        
        // 2. 创建租户
        Tenant tenant = new Tenant();
        tenant.setTenantCode(dto.getTenantCode());
        tenant.setTenantName(dto.getTenantName());
        tenant.setStatus(1);
        tenant.setMaxUsers(dto.getMaxUsers());
        tenant.setExpireTime(LocalDateTime.now().plusYears(1));
        
        tenantService.save(tenant);
        
        // 3. 创建管理员账号（需要设置租户ID）
        TenantContextHolder.setTenantId(tenant.getId());
        try {
            User admin = new User();
            admin.setTenantId(tenant.getId());
            admin.setUsername(dto.getAdminUsername());
            admin.setPassword(passwordEncoder.encode(dto.getAdminPassword()));
            admin.setNickname("系统管理员");
            admin.setIsAdmin(true);
            
            userService.save(admin);
        } finally {
            TenantContextHolder.clear();
        }
        
        // 4. 初始化租户数据（菜单、角色等）
        initTenantData(tenant.getId());
        
        // 5. 返回结果
        TenantRegisterVO vo = new TenantRegisterVO();
        vo.setTenantId(tenant.getId());
        vo.setTenantCode(tenant.getTenantCode());
        vo.setAdminUsername(dto.getAdminUsername());
        
        return vo;
    }
    
    /**
     * 初始化租户数据
     */
    private void initTenantData(Long tenantId) {
        TenantContextHolder.setTenantId(tenantId);
        try {
            // 初始化菜单
            menuService.initDefaultMenus();
            
            // 初始化角色
            roleService.initDefaultRoles();
            
            // 初始化配置
            configService.initDefaultConfigs();
        } finally {
            TenantContextHolder.clear();
        }
    }
}
```

### 租户隔离验证

```java
/**
 * 租户隔离测试
 */
@SpringBootTest
public class TenantIsolationTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    public void testTenantIsolation() {
        // 租户1
        TenantContextHolder.setTenantId(1L);
        
        User user1 = new User();
        user1.setUsername("user1");
        user1.setPassword("password");
        userService.save(user1);
        
        List<User> tenant1Users = userService.list();
        System.out.println("租户1用户数：" + tenant1Users.size());
        
        TenantContextHolder.clear();
        
        // 租户2
        TenantContextHolder.setTenantId(2L);
        
        List<User> tenant2Users = userService.list();
        System.out.println("租户2用户数：" + tenant2Users.size());
        
        // 验证：租户2看不到租户1的数据
        assertEquals(0, tenant2Users.size());
        
        TenantContextHolder.clear();
    }
}
```

---

## 租户计费与限制

### 租户配额管理

```java
/**
 * 租户配额服务
 */
@Service
public class TenantQuotaService {
    
    @Autowired
    private TenantService tenantService;
    
    @Autowired
    private UserService userService;
    
    /**
     * 检查用户数配额
     */
    public boolean checkUserQuota(Long tenantId) {
        Tenant tenant = tenantService.getById(tenantId);
        
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }
        
        // 查询当前用户数
        TenantContextHolder.setTenantId(tenantId);
        try {
            Long currentUserCount = userService.count();
            
            // 检查是否超过限制
            if (currentUserCount >= tenant.getMaxUsers()) {
                return false;
            }
            
            return true;
        } finally {
            TenantContextHolder.clear();
        }
    }
    
    /**
     * 检查租户是否过期
     */
    public boolean checkExpire(Long tenantId) {
        Tenant tenant = tenantService.getById(tenantId);
        
        if (tenant == null || tenant.getStatus() == 0) {
            return true;
        }
        
        if (tenant.getExpireTime() != null && 
            LocalDateTime.now().isAfter(tenant.getExpireTime())) {
            return true;
        }
        
        return false;
    }
}

/**
 * 配额检查拦截器
 */
@Component
public class QuotaCheckInterceptor implements HandlerInterceptor {
    
    @Autowired
    private TenantQuotaService quotaService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        Long tenantId = TenantContextHolder.getTenantId();
        
        if (tenantId == null) {
            return true;
        }
        
        // 检查租户是否过期
        if (quotaService.checkExpire(tenantId)) {
            throw new BusinessException("租户已过期，请续费");
        }
        
        return true;
    }
}
```

---

## 关键点总结

1. **数据隔离**：通过 tenant_id 字段实现数据隔离
2. **租户上下文**：使用 ThreadLocal 管理当前租户
3. **自动填充**：租户ID自动填充到所有业务表
4. **系统表**：租户表等系统表不参与租户隔离
5. **配额管理**：限制用户数、存储空间等
6. **过期检查**：定期检查租户是否过期
7. **数据初始化**：新租户自动初始化基础数据

---

## 参考资料

- [多租户插件](https://baomidou.com/pages/aef2f2/)
- [多租户架构设计](https://martinfowler.com/articles/multi-tenant.html)
