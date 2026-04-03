# 第 8 章：Nacos Config 自定义配置详解

> **学习目标**：掌握 Nacos Config 高级配置、配置优先级、共享配置、扩展配置  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. 核心配置项详解

### 1.1 完整配置示例

```yaml
spring:
  application:
    name: user-service
  profiles:
    active: dev
  
  cloud:
    nacos:
      config:
        # ========== 服务器配置 ==========
        server-addr: localhost:8848
        username: nacos
        password: nacos
        context-path: /nacos
        
        # ========== 命名空间与分组 ==========
        namespace: e3c5d1a0-1234-5678-90ab-cdef12345678
        group: DEFAULT_GROUP
        
        # ========== Data ID 配置 ==========
        prefix: ${spring.application.name}
        file-extension: yaml
        
        # ========== 共享配置 ==========
        shared-configs:
          - data-id: common-database.yaml
            group: COMMON_GROUP
            refresh: true
          
          - data-id: common-redis.yaml
            group: COMMON_GROUP
            refresh: true
        
        # ========== 扩展配置 ==========
        extension-configs:
          - data-id: user-service-ext.yaml
            group: EXT_GROUP
            refresh: true
        
        # ========== 刷新配置 ==========
        refresh-enabled: true
        
        # ========== 超时配置 ==========
        timeout: 3000
        config-long-poll-timeout: 46000
        config-retry-time: 2000
        max-retry: 3
        enable-remote-sync-config: true
```

### 1.2 配置项说明

**namespace**：
```yaml
# 使用命名空间 ID（不是名称）
namespace: dev

# 获取命名空间 ID
# 1. 登录 Nacos 控制台
# 2. 命名空间页面查看命名空间 ID
```

**group**：
```yaml
# 默认分组
group: DEFAULT_GROUP

# 自定义分组
group: ECOMMERCE_GROUP
```

**prefix**：
```yaml
# 默认：服务名
prefix: ${spring.application.name}

# 自定义
prefix: my-custom-prefix
```

**file-extension**：
```yaml
# YAML 格式
file-extension: yaml

# Properties 格式
file-extension: properties

# JSON 格式
file-extension: json
```

---

## 2. 配置文件格式详解

### 2.1 YAML 格式（推荐）

**Data ID**: `user-service-dev.yaml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/user_db
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      connection-timeout: 30000

  redis:
    host: localhost
    port: 6379
    password: redis123
    lettuce:
      pool:
        max-active: 8
        max-idle: 8

user:
  name: zhangsan
  age: 25
  hobbies:
    - reading
    - coding
    - gaming
  address:
    city: beijing
    district: chaoyang

app:
  features:
    payment: true
    notification: false
  limits:
    max-connections: 100
    timeout: 30000
```

**读取配置**：

```java
@Data
@Component
@ConfigurationProperties(prefix = "user")
public class UserConfig {
    private String name;
    private Integer age;
    private List<String> hobbies;
    private Address address;
    
    @Data
    public static class Address {
        private String city;
        private String district;
    }
}
```

### 2.2 Properties 格式

**Data ID**: `user-service-dev.properties`

```properties
# 数据源配置
spring.datasource.url=jdbc:mysql://localhost:3306/user_db
spring.datasource.username=root
spring.datasource.password=root

# 用户配置
user.name=zhangsan
user.age=25
user.hobbies[0]=reading
user.hobbies[1]=coding
user.address.city=beijing
user.address.district=chaoyang

# 应用特性
app.features.payment=true
app.features.notification=false
```

### 2.3 JSON 格式

**Data ID**: `user-service-dev.json`

```json
{
  "spring": {
    "datasource": {
      "url": "jdbc:mysql://localhost:3306/user_db",
      "username": "root",
      "password": "root"
    }
  },
  "user": {
    "name": "zhangsan",
    "age": 25,
    "hobbies": ["reading", "coding"]
  }
}
```

---

## 3. 共享配置与扩展配置

### 3.1 共享配置（shared-configs）

**使用场景**：多个服务共享的配置

**配置方式**：

```yaml
spring:
  cloud:
    nacos:
      config:
        shared-configs:
          - data-id: common-database.yaml
            group: COMMON_GROUP
            refresh: true
          
          - data-id: common-redis.yaml
            group: COMMON_GROUP
            refresh: true
          
          - data-id: common-mq.yaml
            group: COMMON_GROUP
            refresh: true
```

**Nacos 中创建共享配置**：

```yaml
# Data ID: common-database.yaml
# Group: COMMON_GROUP
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      idle-timeout: 600000
      max-lifetime: 1800000
```

```yaml
# Data ID: common-redis.yaml
# Group: COMMON_GROUP
spring:
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    database: 0
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: -1ms
```

**优势**：
- ✅ 配置统一管理
- ✅ 修改一处，所有服务生效
- ✅ 减少配置冗余

### 3.2 扩展配置（extension-configs）

**使用场景**：服务特定的额外配置

```yaml
spring:
  cloud:
    nacos:
      config:
        extension-configs:
          - data-id: user-service-ext.yaml
            group: EXT_GROUP
            refresh: true
          
          - data-id: user-service-feature.yaml
            group: FEATURE_GROUP
            refresh: true
```

**示例**：

```yaml
# Data ID: user-service-ext.yaml
# Group: EXT_GROUP
user:
  feature:
    payment:
      enabled: true
      timeout: 30000
    notification:
      enabled: false
    export:
      enabled: true
      max-rows: 10000
```

### 3.3 shared-configs vs extension-configs

| 特性 | shared-configs | extension-configs |
|------|----------------|-------------------|
| **用途** | 多服务共享 | 单服务扩展 |
| **优先级** | 低 | 中 |
| **适用场景** | 数据库、Redis、MQ | 服务特性开关 |
| **推荐使用** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 4. 配置优先级规则

### 4.1 加载顺序

**配置加载顺序**（后加载覆盖先加载）：

```
1. shared-configs[0]
   ↓
2. shared-configs[1]
   ↓
3. shared-configs[n]
   ↓
4. extension-configs[0]
   ↓
5. extension-configs[1]
   ↓
6. ${prefix}.${file-extension}
   ↓
7. ${prefix}-${spring.profiles.active}.${file-extension}
```

**优先级规则**：

```
优先级（高 → 低）：
1. ${prefix}-${spring.profiles.active}.${file-extension}  ⭐⭐⭐⭐⭐
2. ${prefix}.${file-extension}                            ⭐⭐⭐⭐
3. extension-configs[n]                                   ⭐⭐⭐
4. extension-configs[0]                                   ⭐⭐
5. shared-configs[n]                                      ⭐
6. shared-configs[0]
```

### 4.2 实战示例

**配置文件**：

```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  profiles:
    active: dev
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        
        shared-configs:
          - data-id: common-config.yaml
            refresh: true
        
        extension-configs:
          - data-id: user-service-ext.yaml
            refresh: true
```

**Nacos 配置内容**：

```yaml
# common-config.yaml（优先级最低）
user:
  name: common-user
  age: 20

# user-service-ext.yaml（优先级中）
user:
  name: ext-user
  age: 25

# user-service.yaml（优先级高）
user:
  name: base-user

# user-service-dev.yaml（优先级最高）
user:
  name: dev-user
  age: 30
```

**最终生效**：

```java
@Value("${user.name}")
private String userName;  // dev-user

@Value("${user.age}")
private Integer userAge;  // 30
```

**覆盖关系**：

```
common-config.yaml:
  user.name = common-user
  user.age = 20

user-service-ext.yaml 覆盖：
  user.name = ext-user
  user.age = 25

user-service.yaml 覆盖：
  user.name = base-user
  user.age = 25（未覆盖，保持）

user-service-dev.yaml 覆盖：
  user.name = dev-user
  user.age = 30

最终结果：
  user.name = dev-user
  user.age = 30
```

### 4.3 配置合并策略

**基本类型覆盖**：

```yaml
# shared-configs
user:
  name: zhangsan
  age: 25

# user-service-dev.yaml
user:
  name: lisi

# 最终结果
user:
  name: lisi  # 覆盖
  age: 25     # 保留
```

**复杂类型合并**：

```yaml
# shared-configs
user:
  hobbies:
    - reading
    - coding

# user-service-dev.yaml
user:
  hobbies:
    - gaming

# 最终结果
user:
  hobbies:
    - gaming  # ❌ 完全覆盖，不是合并
```

---

## 5. 配置监听器原理

### 5.1 长轮询机制

**工作原理**：

```
1. 客户端发起长轮询请求
   ↓
2. 服务端hold住请求（默认 30 秒）
   ↓
3. 配置变更 → 立即返回
   或
   超时 → 返回空
   ↓
4. 客户端收到响应
   ↓
5. 更新本地配置
   ↓
6. 立即发起下一次长轮询
```

**配置参数**：

```yaml
spring:
  cloud:
    nacos:
      config:
        # 长轮询超时时间（毫秒）
        config-long-poll-timeout: 46000
        
        # 重试时间（毫秒）
        config-retry-time: 2000
        
        # 最大重试次数
        max-retry: 3
```

### 5.2 监听器源码分析

**ConfigService**：

```java
public class NacosConfigService implements ConfigService {
    
    private final ClientWorker worker;
    
    @Override
    public void addListener(String dataId, String group, Listener listener) {
        worker.addTenantListeners(dataId, group, Arrays.asList(listener));
    }
}
```

**ClientWorker**：

```java
public class ClientWorker {
    
    public void addTenantListeners(String dataId, String group, List<? extends Listener> listeners) {
        // 添加监听器
        CacheData cache = addCacheDataIfAbsent(dataId, group);
        for (Listener listener : listeners) {
            cache.addListener(listener);
        }
    }
    
    // 启动长轮询任务
    public ClientWorker() {
        this.executor.scheduleWithFixedDelay(() -> {
            try {
                checkConfigInfo();
            } catch (Throwable e) {
                LOGGER.error("longPolling error", e);
            }
        }, 1L, 10L, TimeUnit.MILLISECONDS);
    }
    
    private void checkConfigInfo() {
        // 1. 获取需要监听的配置列表
        List<CacheData> cacheDatas = getCacheDataList();
        
        // 2. 发起长轮询请求
        List<String> changedGroupKeys = checkUpdateDataIds(cacheDatas);
        
        // 3. 处理变更的配置
        for (String groupKey : changedGroupKeys) {
            String[] key = GroupKey.parseKey(groupKey);
            String dataId = key[0];
            String group = key[1];
            
            // 4. 拉取最新配置
            String content = getServerConfig(dataId, group);
            
            // 5. 触发监听器
            CacheData cache = getCacheData(dataId, group);
            cache.setContent(content);
            cache.checkListenerMd5();
        }
    }
}
```

**配置变更通知**：

```java
public class CacheData {
    
    private volatile String content;
    private volatile String md5;
    private final CopyOnWriteArrayList<ManagerListenerWrap> listeners;
    
    void checkListenerMd5() {
        for (ManagerListenerWrap wrap : listeners) {
            if (!md5.equals(wrap.lastCallMd5)) {
                // MD5 变化，触发监听器
                safeNotifyListener(wrap.listener);
                wrap.lastCallMd5 = md5;
            }
        }
    }
    
    private void safeNotifyListener(Listener listener) {
        try {
            // 回调监听器
            listener.receiveConfigInfo(content);
        } catch (Throwable t) {
            LOGGER.error("notify listener error", t);
        }
    }
}
```

### 5.3 自定义监听器

**实现 Listener 接口**：

```java
@Component
@Slf4j
public class CustomConfigListener implements ApplicationListener<EnvironmentChangeEvent> {
    
    @Override
    public void onApplicationEvent(EnvironmentChangeEvent event) {
        Set<String> keys = event.getKeys();
        log.info("配置变更：{}", keys);
        
        for (String key : keys) {
            log.info("配置项：{} = {}", key, environment.getProperty(key));
        }
    }
}
```

**使用 @NacosConfigListener**（Spring Cloud Alibaba）：

```java
@Component
@Slf4j
public class UserConfigListener {
    
    @NacosConfigListener(dataId = "user-service-dev.yaml", timeout = 5000)
    public void onConfigChange(String newContent) {
        log.info("配置内容变更：{}", newContent);
        
        // 解析新配置
        YamlPropertiesFactoryBean yaml = new YamlPropertiesFactoryBean();
        yaml.setResources(new ByteArrayResource(newContent.getBytes()));
        Properties properties = yaml.getObject();
        
        // 处理业务逻辑
        String userName = properties.getProperty("user.name");
        log.info("新用户名：{}", userName);
    }
}
```

---

## 6. 配置加密方案

### 6.1 Nacos 配置加密

**方式一：Jasypt 加密**

**引入依赖**：

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
    password: ${JASYPT_PASSWORD:my-secret-key}
    algorithm: PBEWithMD5AndDES
    iv-generator-classname: org.jasypt.iv.NoIvGenerator
```

**加密工具**：

```java
@Component
@RequiredArgsConstructor
public class JasyptUtils {
    
    private final StringEncryptor encryptor;
    
    public String encrypt(String plainText) {
        return encryptor.encrypt(plainText);
    }
    
    public String decrypt(String encryptedText) {
        return encryptor.decrypt(encryptedText);
    }
}

// 使用
String encrypted = jasyptUtils.encrypt("mysql_password_123");
System.out.println("加密后：" + encrypted);
// 输出：加密后：k8V9K3mN2pL5qR7s
```

**Nacos 配置**：

```yaml
# user-service-dev.yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/user_db
    username: root
    password: ENC(k8V9K3mN2pL5qR7s)  # 使用 ENC() 包裹加密文本
```

**启动应用**：

```bash
java -jar -Djasypt.encryptor.password=my-secret-key user-service.jar
```

### 6.2 配置脱敏显示

**配置类**：

```java
@Configuration
public class ConfigMaskConfig {
    
    @Bean
    public EnvironmentPostProcessor configMaskProcessor() {
        return (environment, application) -> {
            MutablePropertySources sources = 
                ((ConfigurableEnvironment) environment).getPropertySources();
            
            sources.addLast(new PropertySource<Object>("maskedProperties") {
                @Override
                public Object getProperty(String name) {
                    if (name.contains("password")) {
                        return "******";
                    }
                    return null;
                }
            });
        };
    }
}
```

**Actuator 端点脱敏**：

```yaml
management:
  endpoint:
    env:
      show-values: WHEN_AUTHORIZED  # 仅授权时显示
      keys-to-sanitize:
        - password
        - secret
        - key
        - token
        - credential
```

---

## 7. 配置灰度发布

### 7.1 灰度发布流程

**步骤**：

```
1. 创建新配置版本（不发布）
   ↓
2. 选择灰度实例（IP 白名单）
   ↓
3. 发布到灰度实例
   ↓
4. 验证灰度环境
   ↓
5. 逐步扩大灰度范围
   ↓
6. 全量发布
```

### 7.2 配置 Beta 发布

**Nacos 控制台操作**：

1. 配置列表 → 选择配置 → 更多 → Beta 发布
2. 填写灰度 IP：
   ```
   192.168.1.100
   192.168.1.101
   ```
3. 修改配置内容
4. 点击 Beta 发布

**效果**：

```
192.168.1.100：使用 Beta 配置
192.168.1.101：使用 Beta 配置
其他实例：使用正式配置
```

### 7.3 代码实现灰度

**配置灰度标识**：

```yaml
# user-service-dev.yaml（正式版本）
app:
  version: 1.0.0
  features:
    payment: false

# user-service-dev-beta.yaml（灰度版本）
app:
  version: 1.1.0
  features:
    payment: true
```

**动态切换**：

```java
@Component
@Slf4j
public class GrayConfigLoader implements ApplicationRunner {
    
    @Value("${POD_IP:localhost}")
    private String podIp;
    
    @Autowired
    private NacosConfigManager nacosConfigManager;
    
    @Override
    public void run(ApplicationArguments args) {
        // 判断是否为灰度实例
        if (isGrayInstance(podIp)) {
            log.info("当前实例为灰度实例，加载灰度配置");
            loadGrayConfig();
        }
    }
    
    private boolean isGrayInstance(String ip) {
        // 从 Nacos 或配置中心获取灰度 IP 列表
        List<String> grayIps = Arrays.asList("192.168.1.100", "192.168.1.101");
        return grayIps.contains(ip);
    }
    
    private void loadGrayConfig() {
        // 加载灰度配置
        String grayConfig = nacosConfigManager.getConfigService()
            .getConfig("user-service-dev-beta.yaml", "DEFAULT_GROUP", 3000);
        
        log.info("灰度配置：{}", grayConfig);
    }
}
```

---

## 8. 实战案例

### 8.1 多环境配置完整示例

**项目结构**：

```
src/main/resources/
├── bootstrap.yml
├── bootstrap-dev.yml
├── bootstrap-test.yml
├── bootstrap-prod.yml
├── application.yml
└── logback-spring.xml
```

**bootstrap.yml**（公共配置）：

```yaml
spring:
  application:
    name: user-service
  
  cloud:
    nacos:
      config:
        server-addr: ${NACOS_ADDR:localhost:8848}
        username: ${NACOS_USERNAME:nacos}
        password: ${NACOS_PASSWORD:nacos}
        file-extension: yaml
        
        # 共享配置
        shared-configs:
          - data-id: common-database.yaml
            group: COMMON_GROUP
            refresh: true
          
          - data-id: common-redis.yaml
            group: COMMON_GROUP
            refresh: true
```

**bootstrap-dev.yml**：

```yaml
spring:
  cloud:
    nacos:
      config:
        namespace: dev
        group: DEV_GROUP
```

**bootstrap-test.yml**：

```yaml
spring:
  cloud:
    nacos:
      config:
        namespace: test
        group: TEST_GROUP
```

**bootstrap-prod.yml**：

```yaml
spring:
  cloud:
    nacos:
      config:
        namespace: prod
        group: PROD_GROUP
```

**部署脚本**：

```bash
#!/bin/bash

ENV=$1  # dev/test/prod

java -jar \
  -Dspring.profiles.active=$ENV \
  -DNACOS_ADDR=nacos.example.com:8848 \
  -DNACOS_USERNAME=admin \
  -DNACOS_PASSWORD=admin123 \
  user-service.jar
```

### 8.2 配置分层管理

**配置分层**：

```
1. 公共配置层（shared-configs）
   └─ common-database.yaml
   └─ common-redis.yaml
   └─ common-mq.yaml

2. 应用配置层（${prefix}.yaml）
   └─ user-service.yaml

3. 环境配置层（${prefix}-${profile}.yaml）
   └─ user-service-dev.yaml
   └─ user-service-test.yaml
   └─ user-service-prod.yaml

4. 扩展配置层（extension-configs）
   └─ user-service-feature.yaml
```

**Nacos 配置示例**：

```yaml
# common-database.yaml（公共层）
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20

# user-service.yaml（应用层）
user:
  default-role: USER
  max-login-attempts: 3

# user-service-dev.yaml（环境层）
spring:
  datasource:
    url: jdbc:mysql://dev-db:3306/user_db
    username: dev_user
    password: ENC(xxx)

# user-service-feature.yaml（扩展层）
user:
  features:
    payment: true
    export: false
```

---

## 9. 面试要点

### 9.1 基础问题

**Q1：Nacos Config 的配置文件加载顺序是什么？**

**顺序**（后加载覆盖先加载）：
1. shared-configs
2. extension-configs
3. ${prefix}.${file-extension}
4. ${prefix}-${active}.${file-extension}

**Q2：shared-configs 和 extension-configs 的区别？**

| 维度 | shared-configs | extension-configs |
|------|----------------|-------------------|
| 用途 | 多服务共享 | 单服务扩展 |
| 优先级 | 低 | 中 |
| 场景 | 数据库、Redis | 特性开关 |

### 9.2 进阶问题

**Q3：Nacos Config 如何实现配置动态刷新？**

**原理**：
1. 客户端发起长轮询请求
2. 服务端hold住请求（30秒）
3. 配置变更立即返回
4. 客户端更新本地配置
5. 触发 @RefreshScope Bean 刷新

**Q4：如何保证配置的安全性？**

**方案**：
1. 使用 Jasypt 加密敏感配置
2. Nacos 控制台权限控制
3. Actuator 端点脱敏
4. 网络隔离

### 9.3 架构问题

**Q5：如何设计配置管理体系？**

**原则**：
1. **分层管理**：公共/应用/环境/扩展
2. **权限控制**：不同环境不同权限
3. **版本管理**：配置变更可回滚
4. **加密存储**：敏感信息加密

**Q6：配置灰度发布如何实现？**

**方案**：
1. Nacos Beta 发布（IP 白名单）
2. 多配置文件（beta 后缀）
3. 动态路由（元数据标识）

---

## 10. 参考资料

**官方文档**：
- [Nacos Config 配置管理](https://nacos.io/zh-cn/docs/config.html)
- [配置加密](https://nacos.io/zh-cn/docs/auth.html)

**工具**：
- [Jasypt 加密工具](http://www.jasypt.org/)
- [在线 YAML 转换](https://www.bejson.com/validators/yaml_editor/)

---

**下一章预告**：第 9 章将深入学习配置动态刷新原理，包括 @RefreshScope 注解原理、@ConfigurationProperties 动态绑定、配置变更监听机制、配置刷新源码分析等内容。
