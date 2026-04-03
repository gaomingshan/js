# 第 10 章：Nacos Config 高级特性

> **学习目标**：掌握配置加密、配置灰度发布、权限控制、配置审计等高级特性  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. 配置加密

### 1.1 为什么需要配置加密

**安全风险**：
- ❌ 数据库密码明文存储
- ❌ Redis 密码明文
- ❌ 第三方 API 密钥暴露
- ❌ 敏感业务数据泄露

**加密方案对比**：

| 方案 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| Jasypt | 简单易用 | 密钥管理风险 | ⭐⭐⭐⭐ |
| Nacos 配置加密插件 | 集中管理 | 需要部署 | ⭐⭐⭐⭐⭐ |
| 外部密钥管理服务 | 安全性高 | 复杂度高 | ⭐⭐⭐ |

### 1.2 Jasypt 加密实战

**添加依赖**：

```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

**配置密钥**：

```yaml
# application.yml
jasypt:
  encryptor:
    password: ${JASYPT_ENCRYPTOR_PASSWORD}
    algorithm: PBEWITHHMACSHA512ANDAES_256
    iv-generator-classname: org.jasypt.iv.RandomIvGenerator
```

**加密工具类**：

```java
@Component
@RequiredArgsConstructor
public class JasyptEncryptorUtil {
    
    private final StringEncryptor stringEncryptor;
    
    /**
     * 加密
     */
    public String encrypt(String plainText) {
        return stringEncryptor.encrypt(plainText);
    }
    
    /**
     * 解密
     */
    public String decrypt(String encryptedText) {
        return stringEncryptor.decrypt(encryptedText);
    }
}
```

**命令行加密工具**：

```java
@SpringBootApplication
public class JasyptEncryptorCLI implements CommandLineRunner {
    
    @Autowired
    private JasyptEncryptorUtil encryptorUtil;
    
    @Override
    public void run(String... args) {
        if (args.length < 2) {
            System.out.println("用法: java -jar app.jar encrypt <明文>");
            return;
        }
        
        String command = args[0];
        String text = args[1];
        
        if ("encrypt".equals(command)) {
            String encrypted = encryptorUtil.encrypt(text);
            System.out.println("加密结果: ENC(" + encrypted + ")");
        } else if ("decrypt".equals(command)) {
            String decrypted = encryptorUtil.decrypt(text);
            System.out.println("解密结果: " + decrypted);
        }
    }
    
    public static void main(String[] args) {
        SpringApplication.run(JasyptEncryptorCLI.class, args);
    }
}
```

**使用加密**：

```bash
# 加密数据库密码
java -jar app.jar encrypt "mysql_password_123"
# 输出: ENC(k8V9K3mN2pL5qR7s)

# Nacos 配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/user_db
    username: root
    password: ENC(k8V9K3mN2pL5qR7s)

# 启动应用
java -jar -DJASYPT_ENCRYPTOR_PASSWORD=my-secret-key user-service.jar
```

### 1.3 Nacos 配置加密插件

**插件安装**：

```bash
# 1. 下载插件
wget https://github.com/nacos-group/nacos-plugin/releases/download/0.1.0/nacos-config-encryption-plugin.jar

# 2. 放到 Nacos plugins 目录
cp nacos-config-encryption-plugin.jar $NACOS_HOME/plugins/

# 3. 配置加密密钥
# conf/application.properties
nacos.plugin.encryption.key=your-encryption-key

# 4. 重启 Nacos Server
sh bin/shutdown.sh
sh bin/startup.sh -m standalone
```

**使用加密配置**：

```yaml
# Nacos 控制台创建配置时自动加密
spring:
  datasource:
    password: [CIPHER]AES:encrypted_value_here

# 客户端自动解密，无需额外配置
```

### 1.4 敏感配置加密与密钥管理

**密钥管理最佳实践**：

```yaml
# ❌ 错误：密钥硬编码
jasypt:
  encryptor:
    password: my-secret-key

# ✅ 正确：环境变量
jasypt:
  encryptor:
    password: ${JASYPT_PASSWORD}

# ✅ 正确：外部密钥管理服务
jasypt:
  encryptor:
    password: ${vault:secret/jasypt-key}
```

**密钥轮换**：

```java
@Component
@Slf4j
public class EncryptionKeyRotation {
    
    @Scheduled(cron = "0 0 0 1 * ?")  // 每月1号执行
    public void rotateKey() {
        log.info("开始轮换加密密钥");
        
        // 1. 生成新密钥
        String newKey = generateNewKey();
        
        // 2. 使用旧密钥解密所有配置
        List<String> decryptedConfigs = decryptAllConfigs();
        
        // 3. 使用新密钥重新加密
        List<String> reEncryptedConfigs = reEncryptWithNewKey(decryptedConfigs, newKey);
        
        // 4. 更新配置
        updateConfigs(reEncryptedConfigs);
        
        // 5. 更新密钥存储
        updateKeyStorage(newKey);
        
        log.info("密钥轮换完成");
    }
}
```

---

## 2. 配置灰度发布与逐步放量

### 2.1 灰度发布策略

**Beta 发布流程**：

```
1. 创建配置新版本
   ↓
2. 选择灰度实例（IP 白名单）
   ↓
3. Beta 发布到灰度实例
   ↓
4. 监控灰度实例指标
   ↓
5. 验证无问题后全量发布
   或
   发现问题立即回滚
```

### 2.2 Nacos Beta 发布实战

**控制台操作**：

```
1. 配置列表 → 选择配置 → 更多 → Beta 发布

2. 填写灰度配置：
   - Beta IPs: 192.168.1.100,192.168.1.101
   - 配置内容: <修改后的配置>

3. 点击 Beta 发布

4. 验证灰度效果：
   - 访问灰度实例，验证新配置
   - 访问其他实例，确认使用旧配置

5. 确认无误后：
   - 点击"停止 Beta"
   - 点击"发布"全量上线
```

**OpenAPI 灰度发布**：

```bash
# Beta 发布
curl -X POST 'http://localhost:8848/nacos/v1/cs/configs' \
  -d 'dataId=user-service-dev.yaml' \
  -d 'group=DEFAULT_GROUP' \
  -d 'content=<配置内容>' \
  -d 'betaIps=192.168.1.100,192.168.1.101'

# 停止 Beta
curl -X DELETE 'http://localhost:8848/nacos/v1/cs/configs?beta=true' \
  -d 'dataId=user-service-dev.yaml' \
  -d 'group=DEFAULT_GROUP'

# 全量发布
curl -X POST 'http://localhost:8848/nacos/v1/cs/configs' \
  -d 'dataId=user-service-dev.yaml' \
  -d 'group=DEFAULT_GROUP' \
  -d 'content=<配置内容>'
```

### 2.3 自动化灰度发布

**灰度发布脚本**：

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class GrayReleaseService {
    
    private final NacosConfigService nacosConfigService;
    
    /**
     * 灰度发布
     * 
     * @param dataId 配置ID
     * @param group 分组
     * @param content 新配置内容
     * @param percentage 灰度百分比（1-100）
     */
    public void grayRelease(String dataId, String group, 
                            String content, int percentage) throws Exception {
        
        // 1. 获取所有实例
        List<Instance> instances = getAllInstances();
        
        // 2. 计算灰度实例数量
        int grayCount = (int) Math.ceil(instances.size() * percentage / 100.0);
        
        // 3. 随机选择灰度实例
        List<String> grayIps = selectGrayInstances(instances, grayCount);
        
        log.info("灰度发布 {}%，共 {} 个实例，灰度 {} 个", 
            percentage, instances.size(), grayCount);
        
        // 4. Beta 发布
        betaPublish(dataId, group, content, grayIps);
        
        // 5. 等待验证期（5分钟）
        Thread.sleep(5 * 60 * 1000);
        
        // 6. 检查灰度实例健康状况
        if (checkGrayInstancesHealth(grayIps)) {
            log.info("灰度验证通过，准备全量发布");
            
            // 7. 全量发布
            stopBeta(dataId, group);
            publish(dataId, group, content);
            
            log.info("全量发布完成");
        } else {
            log.error("灰度验证失败，执行回滚");
            
            // 8. 回滚
            stopBeta(dataId, group);
            
            log.info("回滚完成");
        }
    }
    
    private List<String> selectGrayInstances(List<Instance> instances, int count) {
        Collections.shuffle(instances);
        return instances.stream()
            .limit(count)
            .map(Instance::getIp)
            .collect(Collectors.toList());
    }
    
    private boolean checkGrayInstancesHealth(List<String> grayIps) {
        // 检查错误率、响应时间等指标
        for (String ip : grayIps) {
            if (!isHealthy(ip)) {
                return false;
            }
        }
        return true;
    }
}
```

**使用示例**：

```java
@RestController
@RequiredArgsConstructor
public class GrayReleaseController {
    
    private final GrayReleaseService grayReleaseService;
    
    @PostMapping("/config/gray-release")
    public String grayRelease(@RequestBody GrayReleaseRequest request) {
        try {
            grayReleaseService.grayRelease(
                request.getDataId(),
                request.getGroup(),
                request.getContent(),
                request.getPercentage()
            );
            return "灰度发布成功";
        } catch (Exception e) {
            return "灰度发布失败: " + e.getMessage();
        }
    }
}
```

---

## 3. RBAC 权限模型

### 3.1 Nacos 权限控制

**启用权限控制**：

```properties
# conf/application.properties
nacos.core.auth.enabled=true
nacos.core.auth.server.identity.key=your-identity-key
nacos.core.auth.server.identity.value=your-identity-value
nacos.core.auth.plugin.nacos.token.secret.key=your-secret-key
```

**创建用户**：

```bash
# 1. 登录 Nacos 控制台（默认 nacos/nacos）

# 2. 权限控制 → 用户列表 → 创建用户
   - 用户名: developer
   - 密码: dev123
   - 角色: ROLE_DEVELOPER

# 3. 创建角色
   - 角色名: ROLE_DEVELOPER
   - 权限: READ, WRITE
   - 资源: user-service-*

# 4. 绑定用户与角色
   - 用户: developer
   - 角色: ROLE_DEVELOPER
```

**客户端配置**：

```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        username: developer
        password: dev123
        namespace: dev
```

### 3.2 自定义权限插件

**权限插件接口**：

```java
public interface AuthPlugin {
    
    /**
     * 认证
     */
    IdentityContext login(Map<String, String> credentials);
    
    /**
     * 鉴权
     */
    boolean check(IdentityContext identityContext, Resource resource, String action);
}
```

**LDAP 认证插件示例**：

```java
@Service
public class LdapAuthPlugin implements AuthPlugin {
    
    @Autowired
    private LdapTemplate ldapTemplate;
    
    @Override
    public IdentityContext login(Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        // LDAP 认证
        try {
            ldapTemplate.authenticate(
                "ou=users",
                "(uid=" + username + ")",
                password
            );
            
            // 查询用户角色
            List<String> roles = getUserRoles(username);
            
            return IdentityContext.builder()
                .principal(username)
                .roles(roles)
                .build();
                
        } catch (Exception e) {
            throw new AuthenticationException("认证失败", e);
        }
    }
    
    @Override
    public boolean check(IdentityContext context, Resource resource, String action) {
        // 检查权限
        for (String role : context.getRoles()) {
            if (hasPermission(role, resource, action)) {
                return true;
            }
        }
        return false;
    }
}
```

---

## 4. 配置变更审计与追踪

### 4.1 配置历史记录

**Nacos 配置历史**：

```
配置管理 → 配置列表 → 详情 → 历史版本

显示信息：
- 版本号
- 修改时间
- 操作人
- 配置内容对比
- 回滚操作
```

**OpenAPI 查询历史**：

```bash
# 查询配置历史
curl -X GET 'http://localhost:8848/nacos/v1/cs/history?search=accurate' \
  -d 'dataId=user-service-dev.yaml' \
  -d 'group=DEFAULT_GROUP' \
  -d 'pageNo=1' \
  -d 'pageSize=10'

# 响应
{
  "totalCount": 5,
  "pageItems": [
    {
      "id": 100,
      "dataId": "user-service-dev.yaml",
      "group": "DEFAULT_GROUP",
      "content": "<配置内容>",
      "md5": "xxx",
      "srcUser": "admin",
      "srcIp": "192.168.1.1",
      "opType": "U",
      "createdTime": "2024-01-01 10:00:00",
      "lastModifiedTime": "2024-01-01 10:00:00"
    }
  ]
}
```

### 4.2 配置变更通知

**Webhook 通知**：

```java
@Component
@Slf4j
public class ConfigChangeNotifier 
    implements ApplicationListener<EnvironmentChangeEvent> {
    
    @Value("${notification.webhook.url}")
    private String webhookUrl;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Override
    public void onApplicationEvent(EnvironmentChangeEvent event) {
        Set<String> keys = event.getKeys();
        
        // 构建通知消息
        Map<String, Object> message = new HashMap<>();
        message.put("type", "CONFIG_CHANGE");
        message.put("service", "user-service");
        message.put("changedKeys", keys);
        message.put("timestamp", System.currentTimeMillis());
        message.put("environment", environment.getActiveProfiles());
        
        // 发送 Webhook
        try {
            restTemplate.postForObject(webhookUrl, message, String.class);
            log.info("配置变更通知已发送");
        } catch (Exception e) {
            log.error("发送配置变更通知失败", e);
        }
    }
}
```

**企业微信/钉钉通知**：

```java
@Component
@Slf4j
public class WeChatNotifier {
    
    @Value("${wechat.webhook.url}")
    private String webhookUrl;
    
    public void notifyConfigChange(Set<String> changedKeys) {
        // 构建企业微信消息
        Map<String, Object> message = new HashMap<>();
        message.put("msgtype", "markdown");
        
        Map<String, String> markdown = new HashMap<>();
        markdown.put("content", buildMarkdown(changedKeys));
        message.put("markdown", markdown);
        
        // 发送通知
        restTemplate.postForObject(webhookUrl, message, String.class);
    }
    
    private String buildMarkdown(Set<String> keys) {
        StringBuilder sb = new StringBuilder();
        sb.append("## 配置变更通知\n");
        sb.append("**服务**: user-service\n");
        sb.append("**环境**: " + environment.getActiveProfiles()[0] + "\n");
        sb.append("**变更配置项**:\n");
        
        for (String key : keys) {
            sb.append("- ").append(key).append("\n");
        }
        
        sb.append("**变更时间**: ").append(LocalDateTime.now()).append("\n");
        
        return sb.toString();
    }
}
```

### 4.3 配置审计日志

**审计日志记录**：

```java
@Aspect
@Component
@Slf4j
public class ConfigAuditAspect {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Around("@annotation(com.example.annotation.ConfigAudit)")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        // 1. 记录操作前状态
        AuditLog auditLog = new AuditLog();
        auditLog.setOperator(getCurrentUser());
        auditLog.setOperation(pjp.getSignature().getName());
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setIp(getClientIp());
        
        Object result = null;
        try {
            // 2. 执行操作
            result = pjp.proceed();
            
            // 3. 记录成功
            auditLog.setStatus("SUCCESS");
            auditLog.setResult(result.toString());
            
        } catch (Exception e) {
            // 4. 记录失败
            auditLog.setStatus("FAILED");
            auditLog.setError(e.getMessage());
            throw e;
            
        } finally {
            // 5. 保存审计日志
            auditLogRepository.save(auditLog);
        }
        
        return result;
    }
}
```

**审计日志查询**：

```java
@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditLogController {
    
    private final AuditLogRepository auditLogRepository;
    
    @GetMapping("/logs")
    public Page<AuditLog> queryLogs(
            @RequestParam(required = false) String operator,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime,
            Pageable pageable) {
        
        return auditLogRepository.findByConditions(
            operator, operation, startTime, endTime, pageable);
    }
}
```

---

## 5. 配置备份与恢复

### 5.1 自动备份

**定时备份脚本**：

```java
@Component
@Slf4j
public class ConfigBackupScheduler {
    
    @Autowired
    private NacosConfigService nacosConfigService;
    
    @Value("${backup.path}")
    private String backupPath;
    
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点备份
    public void backupConfigs() {
        log.info("开始备份配置");
        
        try {
            // 1. 获取所有配置
            ConfigPage configPage = nacosConfigService.getConfigList(1, 10000);
            List<ConfigInfo> configs = configPage.getPageItems();
            
            // 2. 创建备份目录
            String backupDir = backupPath + "/" + LocalDate.now();
            Files.createDirectories(Paths.get(backupDir));
            
            // 3. 备份每个配置
            for (ConfigInfo config : configs) {
                String fileName = config.getDataId() + "." + config.getGroup();
                Path filePath = Paths.get(backupDir, fileName);
                Files.write(filePath, config.getContent().getBytes());
            }
            
            log.info("配置备份完成，共备份 {} 个配置", configs.size());
            
            // 4. 清理30天前的备份
            cleanOldBackups();
            
        } catch (Exception e) {
            log.error("配置备份失败", e);
        }
    }
    
    private void cleanOldBackups() throws IOException {
        LocalDate threshold = LocalDate.now().minusDays(30);
        
        Files.list(Paths.get(backupPath))
            .filter(path -> {
                String dirName = path.getFileName().toString();
                LocalDate date = LocalDate.parse(dirName);
                return date.isBefore(threshold);
            })
            .forEach(path -> {
                try {
                    Files.walk(path)
                        .sorted(Comparator.reverseOrder())
                        .forEach(file -> {
                            try {
                                Files.delete(file);
                            } catch (IOException e) {
                                log.error("删除文件失败: {}", file, e);
                            }
                        });
                } catch (IOException e) {
                    log.error("清理备份失败: {}", path, e);
                }
            });
    }
}
```

### 5.2 配置恢复

**恢复工具**：

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class ConfigRestoreService {
    
    private final NacosConfigService nacosConfigService;
    
    /**
     * 恢复指定日期的配置
     */
    public void restoreFromBackup(LocalDate backupDate) throws Exception {
        log.info("开始恢复配置，备份日期: {}", backupDate);
        
        String backupDir = backupPath + "/" + backupDate;
        
        // 1. 读取备份文件
        List<Path> backupFiles = Files.list(Paths.get(backupDir))
            .collect(Collectors.toList());
        
        // 2. 恢复每个配置
        for (Path file : backupFiles) {
            String fileName = file.getFileName().toString();
            String[] parts = fileName.split("\\.");
            String dataId = parts[0];
            String group = parts[1];
            
            String content = Files.readString(file);
            
            // 3. 发布配置
            boolean success = nacosConfigService.publishConfig(dataId, group, content);
            
            if (success) {
                log.info("配置恢复成功: {}/{}", dataId, group);
            } else {
                log.error("配置恢复失败: {}/{}", dataId, group);
            }
        }
        
        log.info("配置恢复完成");
    }
}
```

---

## 6. 实战案例

### 6.1 配置全生命周期管理

**完整流程**：

```
1. 配置创建
   ↓
2. 权限分配
   ↓
3. 配置加密（敏感信息）
   ↓
4. 灰度发布（逐步放量）
   ↓
5. 监控变更
   ↓
6. 审计记录
   ↓
7. 定期备份
```

**管理平台实现**：

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class ConfigLifecycleManager {
    
    private final NacosConfigService nacosConfigService;
    private final EncryptionService encryptionService;
    private final AuditService auditService;
    private final NotificationService notificationService;
    
    /**
     * 创建并发布配置
     */
    @Transactional
    public void createAndPublish(ConfigRequest request) {
        try {
            // 1. 验证权限
            checkPermission(request.getOperator(), request.getNamespace());
            
            // 2. 加密敏感配置
            String content = encryptSensitiveConfig(request.getContent());
            
            // 3. 灰度发布
            grayRelease(request.getDataId(), request.getGroup(), content);
            
            // 4. 记录审计日志
            auditService.log(request.getOperator(), "CREATE_CONFIG", request);
            
            // 5. 发送通知
            notificationService.notify("配置创建成功", request);
            
        } catch (Exception e) {
            log.error("配置创建失败", e);
            auditService.log(request.getOperator(), "CREATE_CONFIG_FAILED", e.getMessage());
            throw e;
        }
    }
}
```

---

## 7. 面试要点

### 7.1 基础问题

**Q1：如何保证配置的安全性？**

**方案**：
1. 配置加密（Jasypt）
2. 权限控制（RBAC）
3. 审计日志
4. 网络隔离

**Q2：配置灰度发布的流程是什么？**

**流程**：
1. Beta 发布到灰度实例
2. 监控灰度指标
3. 验证通过后全量发布
4. 出现问题立即回滚

### 7.2 进阶问题

**Q3：如何实现配置的权限控制？**

**方案**：
- Nacos 内置 RBAC
- 自定义认证插件（LDAP/OAuth2）
- 资源级权限控制

**Q4：配置变更如何追踪？**

**方案**：
1. 配置历史记录
2. 审计日志
3. Webhook 通知
4. 监控告警

### 7.3 架构问题

**Q5：如何设计配置管理体系？**

**关键点**：
1. 分层管理
2. 权限控制
3. 灰度发布
4. 审计追踪
5. 备份恢复

---

## 8. 参考资料

**官方文档**：
- [Nacos 权限控制](https://nacos.io/zh-cn/docs/auth.html)
- [配置加密](https://nacos.io/zh-cn/docs/config-encryption.html)

**工具**：
- [Jasypt](http://www.jasypt.org/)
- [Vault](https://www.vaultproject.io/)

---

**下一章预告**：第 11 章将总结配置中心生产最佳实践，包括配置分层管理策略、配置版本管理与回滚、配置权限控制、敏感信息加密、配置变更审计、多环境配置隔离、配置中心选型建议、常见问题排查等内容。
