# 第9章：Nacos Config 自定义配置详解

> **本章目标**：深入掌握 Nacos Config 核心配置项，理解配置优先级规则，能够实现配置分层管理和灰度发布

---

## 1. 核心配置项详解（namespace/group/data-id）

### 1.1 配置定位三要素

**Nacos 配置定位**：
```
namespace + group + data-id
```

**层次结构**：
```
Namespace（命名空间）
    ↓
Group（分组）
    ↓
Data ID（配置文件）
```

**示例**：
```
namespace: dev
group: DEFAULT_GROUP
data-id: user-service.yaml
```

---

### 1.2 Namespace（命名空间）

**作用**：环境隔离

**默认值**：public

**使用场景**：
- dev（开发环境）
- test（测试环境）
- pre（预发环境）
- prod（生产环境）

**创建命名空间**：
1. 登录 Nacos 控制台
2. 进入"命名空间"
3. 点击"新建命名空间"
4. 填写信息：
   - 命名空间 ID：dev
   - 命名空间名：开发环境
   - 描述：开发环境配置

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        namespace: dev  # 命名空间 ID（不是名称）
```

**注意事项**：
- namespace 填写的是命名空间 ID，不是名称
- 不同命名空间的配置完全隔离
- 默认 namespace 是 public（不推荐用于生产）

---

### 1.3 Group（分组）

**作用**：服务分组（同一命名空间内）

**默认值**：DEFAULT_GROUP

**使用场景**：
- 业务线分组（ORDER_GROUP、USER_GROUP）
- 版本分组（V1_GROUP、V2_GROUP）
- 环境分组（TEST_GROUP、PROD_GROUP）

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        group: ORDER_GROUP
```

**多分组配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        group: DEFAULT_GROUP  # 主配置分组
        
        extension-configs:
          - data-id: common.yaml
            group: COMMON_GROUP  # 公共配置分组
            refresh: true
          
          - data-id: db.yaml
            group: DB_GROUP  # 数据库配置分组
            refresh: false
```

---

### 1.4 Data ID（配置文件）

**命名规则**：
```
${prefix}-${spring.profiles.active}.${file-extension}
```

**参数说明**：
- **prefix**：默认为 `${spring.application.name}`
- **spring.profiles.active**：环境标识（可选）
- **file-extension**：配置文件格式

**完整配置**：
```yaml
spring:
  application:
    name: user-service  # prefix
  profiles:
    active: dev         # spring.profiles.active
  cloud:
    nacos:
      config:
        prefix: user-service  # 可选，默认为 spring.application.name
        file-extension: yaml   # 配置文件格式
```

**Data ID**：
```
user-service-dev.yaml
```

**自定义 prefix**：
```yaml
spring:
  cloud:
    nacos:
      config:
        prefix: my-service  # 自定义 prefix
        file-extension: yaml
```

**Data ID**：
```
my-service-dev.yaml
```

---

## 2. 配置文件格式（yaml/properties/json）

### 2.1 YAML 格式（推荐）

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        file-extension: yaml
```

**Nacos 配置内容**：
```yaml
server:
  port: 8001

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/user_db
    username: root
    password: root

logging:
  level:
    root: INFO
    com.demo: DEBUG
```

**优点**：
- 结构清晰，易读
- 支持复杂嵌套
- 支持注释

---

### 2.2 Properties 格式

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        file-extension: properties
```

**Nacos 配置内容**：
```properties
server.port=8001
spring.datasource.url=jdbc:mysql://localhost:3306/user_db
spring.datasource.username=root
spring.datasource.password=root
logging.level.root=INFO
logging.level.com.demo=DEBUG
```

**优点**：
- 简单直观
- 传统格式，兼容性好

**缺点**：
- 嵌套层次多时，键名冗长

---

### 2.3 JSON 格式

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        file-extension: json
```

**Nacos 配置内容**：
```json
{
  "server": {
    "port": 8001
  },
  "spring": {
    "datasource": {
      "url": "jdbc:mysql://localhost:3306/user_db",
      "username": "root",
      "password": "root"
    }
  },
  "logging": {
    "level": {
      "root": "INFO",
      "com.demo": "DEBUG"
    }
  }
}
```

**优点**：
- 结构化，易于程序解析
- 支持嵌套

**缺点**：
- 可读性不如 YAML
- 不支持注释

---

### 2.4 格式选择建议

| 格式 | 推荐场景 | 优点 | 缺点 |
|------|----------|------|------|
| **YAML** | 大部分场景（推荐） | 结构清晰、易读、支持注释 | 缩进敏感 |
| **Properties** | 简单配置 | 简单直观、兼容性好 | 嵌套层次多时冗长 |
| **JSON** | 程序化配置 | 结构化、易于程序解析 | 可读性差、不支持注释 |

---

## 3. 共享配置与扩展配置

### 3.1 扩展配置（extension-configs）

**场景**：
- 服务需要加载多个配置文件
- 配置文件分类管理（数据库配置、Redis 配置、公共配置）

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        
        # 扩展配置
        extension-configs:
          - data-id: common.yaml
            group: DEFAULT_GROUP
            refresh: true  # 支持动态刷新
          
          - data-id: db.yaml
            group: DEFAULT_GROUP
            refresh: false  # 不支持动态刷新（数据库配置）
          
          - data-id: redis.yaml
            group: DEFAULT_GROUP
            refresh: true
```

**配置说明**：
- **data-id**：配置文件 ID
- **group**：配置分组
- **refresh**：是否支持动态刷新

---

### 3.2 共享配置（shared-configs）

**场景**：
- 多个服务共享同一份配置

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        
        # 共享配置
        shared-configs:
          - data-id: common-shared.yaml
            group: DEFAULT_GROUP
            refresh: true
```

---

### 3.3 extension-configs vs shared-configs

**区别**：
- **extension-configs**：扩展配置，优先级高
- **shared-configs**：共享配置，优先级低

**优先级**（高到低）：
```
1. 主配置（user-service-dev.yaml）
2. extension-configs（后面的优先级高）
3. shared-configs（后面的优先级高）
4. application.yml
5. bootstrap.yml
```

**示例**：
```yaml
spring:
  cloud:
    nacos:
      config:
        extension-configs:
          - data-id: config1.yaml  # 优先级：低
          - data-id: config2.yaml  # 优先级：中
          - data-id: config3.yaml  # 优先级：高
```

**同一个配置项，后面的覆盖前面的**

---

### 3.4 配置加载顺序验证

**配置**：
```yaml
# bootstrap.yml
spring:
  cloud:
    nacos:
      config:
        extension-configs:
          - data-id: config1.yaml
          - data-id: config2.yaml
```

**Nacos 配置**：
```yaml
# config1.yaml
test:
  value: config1

# config2.yaml
test:
  value: config2

# user-service.yaml（主配置）
test:
  value: main
```

**测试**：
```java
@Value("${test.value}")
private String testValue;

@GetMapping("/test")
public String test() {
    return testValue;  // 返回：main（主配置优先级最高）
}
```

---

## 4. 配置优先级规则

### 4.1 完整优先级链路

**优先级**（高到低）：
```
1. Nacos 主配置（user-service-dev.yaml）
2. Nacos extension-configs（后面的优先级高）
3. Nacos shared-configs（后面的优先级高）
4. application.yml（本地配置）
5. bootstrap.yml（启动配置）
```

---

### 4.2 同一配置项的覆盖规则

**示例**：
```yaml
# bootstrap.yml
config:
  source: bootstrap

# application.yml
config:
  source: application

# Nacos 配置（user-service.yaml）
config:
  source: nacos

# 最终生效：nacos（Nacos 配置优先级最高）
```

---

### 4.3 配置优先级验证

**Actuator 端点**：
```bash
curl http://localhost:8001/actuator/env | jq .propertySources
```

**返回**：
```json
[
  {
    "name": "nacos:user-service.yaml",
    "properties": {
      "config.source": {
        "value": "nacos"
      }
    }
  },
  {
    "name": "applicationConfig: [classpath:/application.yml]",
    "properties": {
      "config.source": {
        "value": "application"
      }
    }
  },
  {
    "name": "applicationConfig: [classpath:/bootstrap.yml]",
    "properties": {
      "config.source": {
        "value": "bootstrap"
      }
    }
  }
]
```

**配置来源顺序**：
- 第一个：Nacos 配置（优先级最高）
- 第二个：application.yml
- 第三个：bootstrap.yml

---

## 5. 配置监听器原理

### 5.1 配置监听机制

**工作流程**：
```
1. 服务启动 → 拉取配置
    ↓
2. 注册配置监听器
    ↓
3. Nacos Server 配置变更
    ↓
4. Nacos Server 推送通知（UDP）
    ↓
5. Nacos Client 收到通知
    ↓
6. 触发监听器回调
    ↓
7. 刷新 Environment
    ↓
8. 重新创建 @RefreshScope Bean
```

---

### 5.2 自定义配置监听器

**实现**：
```java
package com.demo.user.listener;

import com.alibaba.nacos.api.config.ConfigService;
import com.alibaba.nacos.api.config.listener.Listener;
import com.alibaba.nacos.api.exception.NacosException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.concurrent.Executor;

@Component
public class NacosConfigListener {
    
    @Autowired
    private ConfigService configService;
    
    @Value("${spring.application.name}")
    private String applicationName;
    
    @Value("${spring.cloud.nacos.config.group:DEFAULT_GROUP}")
    private String group;
    
    @Value("${spring.cloud.nacos.config.file-extension:yaml}")
    private String fileExtension;
    
    @PostConstruct
    public void init() throws NacosException {
        String dataId = applicationName + "." + fileExtension;
        
        // 添加监听器
        configService.addListener(dataId, group, new Listener() {
            
            @Override
            public Executor getExecutor() {
                return null;  // 使用默认线程池
            }
            
            @Override
            public void receiveConfigInfo(String configInfo) {
                System.out.println("========== 配置变更通知 ==========");
                System.out.println("Data ID: " + dataId);
                System.out.println("Group: " + group);
                System.out.println("配置内容: " + configInfo);
                System.out.println("==================================");
                
                // 自定义处理逻辑
                handleConfigChange(configInfo);
            }
        });
        
        System.out.println("配置监听器注册成功：" + dataId);
    }
    
    private void handleConfigChange(String configInfo) {
        // 自定义处理逻辑
        // 例如：清除缓存、重新加载配置等
    }
}
```

**测试**：
1. 启动服务
2. 修改 Nacos 配置
3. 查看日志输出：
   ```
   ========== 配置变更通知 ==========
   Data ID: user-service.yaml
   Group: DEFAULT_GROUP
   配置内容: ...
   ==================================
   ```

---

### 5.3 监听器应用场景

**场景1：配置变更审计**
```java
private void handleConfigChange(String configInfo) {
    // 记录配置变更日志
    log.info("配置变更：{}", configInfo);
    
    // 发送告警通知
    alertService.sendAlert("配置已变更");
}
```

**场景2：缓存清除**
```java
private void handleConfigChange(String configInfo) {
    // 清除本地缓存
    cacheManager.clear();
    
    // 重新加载配置
    reloadConfig();
}
```

**场景3：动态调整限流阈值**
```java
private void handleConfigChange(String configInfo) {
    // 解析配置
    Map<String, Object> config = parseConfig(configInfo);
    
    // 更新限流阈值
    int rateLimit = (Integer) config.get("rateLimit");
    rateLimiter.setRate(rateLimit);
}
```

---

## 6. 配置加密方案

### 6.1 为什么需要配置加密？

**问题**：
- 数据库密码明文存储在配置中心
- 第三方 API Key 泄露风险
- 敏感信息被未授权人员查看

**解决方案**：
- 配置加密存储
- 服务启动时解密

---

### 6.2 Jasypt 加密方案

**引入依赖**：
```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

**配置**：
```yaml
# bootstrap.yml
jasypt:
  encryptor:
    password: ${JASYPT_PASSWORD:my-secret-key}  # 加密密钥（生产环境通过环境变量传入）
    algorithm: PBEWithMD5AndDES
```

**生成加密密码**：
```java
package com.demo.user.test;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

public class JasyptTest {
    
    public static void main(String[] args) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        encryptor.setPassword("my-secret-key");  // 加密密钥
        encryptor.setAlgorithm("PBEWithMD5AndDES");
        
        // 加密
        String password = "root123";
        String encrypted = encryptor.encrypt(password);
        System.out.println("明文: " + password);
        System.out.println("密文: " + encrypted);
        
        // 解密
        String decrypted = encryptor.decrypt(encrypted);
        System.out.println("解密: " + decrypted);
    }
}
```

**输出**：
```
明文: root123
密文: 8tK2L3mN5pQ7rS9tU1vW3xY5zA7bC9dE
解密: root123
```

**Nacos 配置**：
```yaml
spring:
  datasource:
    username: root
    password: ENC(8tK2L3mN5pQ7rS9tU1vW3xY5zA7bC9dE)  # 使用加密后的密码
```

**自动解密**：
- Jasypt 启动时自动解密 `ENC()` 包裹的内容
- 应用中使用的是解密后的密码

**生产环境启动**：
```bash
java -jar app.jar --JASYPT_PASSWORD=my-secret-key
```

---

### 6.3 自定义加密方案

**加密工具类**：
```java
package com.demo.common.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class ConfigEncryptor {
    
    private static final String ALGORITHM = "AES";
    private static final String SECRET_KEY = "my-16-byte-key!!";  // 16 字节密钥
    
    public static String encrypt(String plainText) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY.getBytes(), ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        byte[] encrypted = cipher.doFinal(plainText.getBytes());
        return Base64.getEncoder().encodeToString(encrypted);
    }
    
    public static String decrypt(String encryptedText) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY.getBytes(), ALGORITHM);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, keySpec);
        byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
        return new String(decrypted);
    }
    
    public static void main(String[] args) throws Exception {
        String password = "root123";
        String encrypted = encrypt(password);
        String decrypted = decrypt(encrypted);
        
        System.out.println("明文: " + password);
        System.out.println("密文: " + encrypted);
        System.out.println("解密: " + decrypted);
    }
}
```

**自定义配置处理器**：
```java
@Component
public class ConfigDecryptProcessor implements EnvironmentPostProcessor {
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // 遍历所有配置项
        for (PropertySource<?> propertySource : environment.getPropertySources()) {
            if (propertySource instanceof EnumerablePropertySource) {
                EnumerablePropertySource<?> eps = (EnumerablePropertySource<?>) propertySource;
                for (String name : eps.getPropertyNames()) {
                    Object value = eps.getProperty(name);
                    if (value instanceof String) {
                        String strValue = (String) value;
                        // 如果以 ENC( 开头，则解密
                        if (strValue.startsWith("ENC(") && strValue.endsWith(")")) {
                            String encryptedValue = strValue.substring(4, strValue.length() - 1);
                            try {
                                String decryptedValue = ConfigEncryptor.decrypt(encryptedValue);
                                // 替换为解密后的值
                                System.setProperty(name, decryptedValue);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }
                }
            }
        }
    }
}
```

---

## 7. 配置灰度发布

### 7.1 灰度发布场景

**问题**：
- 配置变更可能导致服务异常
- 需要先在部分实例验证

**灰度发布流程**：
```
1. 配置变更（仅推送到灰度实例）
2. 观察灰度实例运行情况
3. 如果正常，全量推送
4. 如果异常，回滚配置
```

---

### 7.2 实现方案

**方案1：通过 IP 灰度**

**Nacos 控制台操作**：
1. 进入"配置管理" → "配置列表"
2. 点击"编辑"
3. 填写"Beta 发布"：
   - Beta 配置内容：新配置
   - Beta IP：灰度实例的 IP（如 192.168.1.100）
4. 点击"Beta 发布"

**效果**：
- 192.168.1.100 实例收到新配置
- 其他实例仍使用旧配置

**验证无问题后，全量发布**：
- 点击"停止 Beta"
- 点击"发布"

---

**方案2：通过元数据灰度**

**配置元数据**：
```yaml
# 灰度实例
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          gray: true
```

**自定义配置监听器**：
```java
@Component
public class GrayConfigListener {
    
    @Value("${spring.cloud.nacos.discovery.metadata.gray:false}")
    private boolean isGray;
    
    @Autowired
    private ConfigService configService;
    
    @PostConstruct
    public void init() throws NacosException {
        String dataId = isGray ? "user-service-gray.yaml" : "user-service.yaml";
        
        configService.addListener(dataId, "DEFAULT_GROUP", new Listener() {
            @Override
            public Executor getExecutor() {
                return null;
            }
            
            @Override
            public void receiveConfigInfo(String configInfo) {
                System.out.println("收到配置变更（灰度=" + isGray + "）: " + configInfo);
            }
        });
    }
}
```

**Nacos 配置**：
```
user-service.yaml（正常配置）
user-service-gray.yaml（灰度配置）
```

**灰度实例使用 user-service-gray.yaml，其他实例使用 user-service.yaml**

---

## 8. 实际落地场景与最佳使用

### 8.1 场景1：配置分层管理

**分层策略**：
```
1. 公共配置（common.yaml）
   - 日志配置
   - 公共常量
   
2. 基础设施配置
   - db.yaml（数据库配置）
   - redis.yaml（Redis 配置）
   - mq.yaml（消息队列配置）
   
3. 业务配置
   - user-service.yaml（用户服务配置）
   - order-service.yaml（订单服务配置）
```

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        extension-configs:
          - data-id: common.yaml
            group: COMMON_GROUP
            refresh: true
          
          - data-id: db.yaml
            group: INFRA_GROUP
            refresh: false
          
          - data-id: redis.yaml
            group: INFRA_GROUP
            refresh: true
```

---

### 8.2 场景2：多环境配置管理

**目录结构**：
```
dev 命名空间：
├── common.yaml（开发环境公共配置）
├── db.yaml（开发数据库配置）
└── user-service-dev.yaml（用户服务开发配置）

test 命名空间：
├── common.yaml（测试环境公共配置）
├── db.yaml（测试数据库配置）
└── user-service-test.yaml（用户服务测试配置）

prod 命名空间：
├── common.yaml（生产环境公共配置）
├── db.yaml（生产数据库配置）
└── user-service-prod.yaml（用户服务生产配置）
```

**配置**：
```yaml
spring:
  profiles:
    active: ${ENV:dev}
  cloud:
    nacos:
      config:
        namespace: ${NACOS_NAMESPACE:dev}
        extension-configs:
          - data-id: common.yaml
          - data-id: db.yaml
```

**启动参数**：
```bash
# 开发环境
java -jar app.jar --ENV=dev --NACOS_NAMESPACE=dev

# 测试环境
java -jar app.jar --ENV=test --NACOS_NAMESPACE=test

# 生产环境
java -jar app.jar --ENV=prod --NACOS_NAMESPACE=prod
```

---

### 8.3 场景3：配置版本管理与回滚

**Nacos 控制台操作**：

**查看历史版本**：
1. 进入"配置管理" → "配置列表"
2. 点击配置的"详情"
3. 点击"历史版本"
4. 查看配置变更历史

**回滚配置**：
1. 在"历史版本"中选择目标版本
2. 点击"回滚"
3. 确认回滚

**配置自动推送到所有实例**

---

### 8.4 场景4：敏感配置加密

**数据库密码加密**：
```yaml
# Nacos 配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/user_db
    username: root
    password: ENC(8tK2L3mN5pQ7rS9tU1vW3xY5zA7bC9dE)  # 加密后的密码
```

**第三方 API Key 加密**：
```yaml
# Nacos 配置
third-party:
  api-key: ENC(xY1zA2bC3dD4eE5fF6gG7hH8iI9jJ0k)
  api-secret: ENC(pQ2rR3sS4tT5uU6vV7wW8xX9yY0zZ1a)
```

---

## 9. 常见问题与易错点

### 9.1 问题1：配置优先级混乱

**现象**：
- 修改了 Nacos 配置，但服务仍使用本地配置

**原因**：
- 配置优先级理解错误

**配置优先级**（高到低）：
```
1. Nacos 主配置
2. extension-configs
3. shared-configs
4. application.yml
5. bootstrap.yml
```

**验证**：
```bash
curl http://localhost:8001/actuator/env | jq .propertySources
```

---

### 9.2 问题2：配置加载失败

**现象**：
- 启动日志显示：Load config from Nacos fail

**原因**：
- Data ID 命名错误
- namespace/group 配置错误
- Nacos Server 未启动

**排查步骤**：
```bash
# 1. 检查 Data ID 命名
# 必须为：${spring.application.name}-${spring.profiles.active}.${file-extension}

# 2. 检查 namespace 和 group
# bootstrap.yml 中的 namespace 和 group 必须与 Nacos 控制台一致

# 3. 检查 Nacos Server
curl http://localhost:8848/nacos
```

---

### 9.3 问题3：配置动态刷新不生效

**现象**：
- 修改了 Nacos 配置，但服务未刷新

**原因**：
- 未添加 @RefreshScope 注解
- refresh 配置为 false

**解决方案**：
```java
@RefreshScope  // 必须添加
@RestController
public class ConfigController {
    @Value("${config.info}")
    private String configInfo;
}
```

```yaml
extension-configs:
  - data-id: common.yaml
    refresh: true  # 必须为 true
```

---

### 9.4 问题4：配置加密失败

**现象**：
- 启动时报错：Failed to decrypt

**原因**：
- 加密密钥错误
- 加密算法不匹配

**解决方案**：
```yaml
jasypt:
  encryptor:
    password: ${JASYPT_PASSWORD}  # 密钥必须正确
    algorithm: PBEWithMD5AndDES   # 算法必须一致
```

**启动参数**：
```bash
java -jar app.jar --JASYPT_PASSWORD=my-secret-key
```

---

## 10. 面试准备专项

### 高频面试题

**题目1：Nacos Config 的配置优先级是什么？**

**标准回答**：

**第一层（基础回答）**：
Nacos 远程配置优先级高于本地配置，主配置优先级高于扩展配置。

**第二层（深入原理）**：
- **完整优先级**（高到低）：
  1. Nacos 主配置（user-service-dev.yaml）
  2. Nacos extension-configs（后面的优先级高）
  3. Nacos shared-configs（后面的优先级高）
  4. application.yml（本地配置）
  5. bootstrap.yml（启动配置）
- **同一配置项**：优先级高的覆盖优先级低的
- **不同配置项**：合并

**第三层（扩展延伸）**：
- **extension-configs 内部优先级**：后面的配置覆盖前面的
- **验证方式**：通过 `/actuator/env` 端点查看配置来源
- **生产环境建议**：敏感配置（数据库密码）放在 Nacos，核心配置（端口号）放在本地

**加分项**：
- 提到配置加载的完整流程
- 提到如何通过 Actuator 验证配置优先级
- 提到实际生产环境的配置管理经验

---

**题目2：如何实现配置加密？**

**标准回答**：

**第一层（基础回答）**：
使用 Jasypt 加密工具，将敏感信息加密后存储在 Nacos，服务启动时自动解密。

**第二层（深入原理）**：
1. **引入依赖**：jasypt-spring-boot-starter
2. **配置加密密钥**：jasypt.encryptor.password（通过环境变量传入）
3. **生成密文**：使用 StandardPBEStringEncryptor 加密
4. **Nacos 配置**：password: ENC(密文)
5. **自动解密**：Jasypt 启动时自动解密 ENC() 包裹的内容

**第三层（扩展延伸）**：
- **加密算法**：PBEWithMD5AndDES（可自定义）
- **密钥管理**：生产环境通过环境变量传入，不能写在配置文件中
- **自定义加密方案**：可以使用 AES 等算法自定义加密

**加分项**：
- 提到加密密钥的安全管理（K8s Secret、环境变量）
- 提到哪些配置需要加密（数据库密码、API Key）
- 提到自定义加密方案的实现

---

**题目3：如何实现配置灰度发布？**

**标准回答**：

**第一层（基础回答）**：
通过 Nacos 的 Beta 发布功能，先将配置推送到指定 IP 的实例，验证无问题后再全量发布。

**第二层（深入原理）**：
- **方案1：IP 灰度**：
  1. Nacos 控制台配置 Beta 发布
  2. 填写 Beta IP（灰度实例）
  3. 灰度实例收到新配置，其他实例不变
  4. 验证无问题后，停止 Beta，全量发布
- **方案2：元数据灰度**：
  1. 灰度实例配置 `metadata.gray=true`
  2. 自定义配置监听器，灰度实例加载灰度配置
  3. 验证无问题后，切换配置

**第三层（扩展延伸）**：
- **回滚机制**：如果灰度验证失败，停止 Beta 发布，回滚到旧配置
- **监控告警**：灰度期间监控实例的错误率、响应时间
- **自动化**：可以通过 Nacos Open API 实现自动化灰度发布

**加分项**：
- 提到灰度发布的完整流程和监控
- 提到配置变更的风险控制
- 提到实际生产环境的灰度发布经验

---

## 11. 学习自检清单

- [ ] 理解 namespace、group、data-id 的作用
- [ ] 掌握配置文件格式的选择
- [ ] 掌握 extension-configs 和 shared-configs 的使用
- [ ] 理解配置优先级规则
- [ ] 掌握自定义配置监听器
- [ ] 掌握配置加密方案
- [ ] 掌握配置灰度发布
- [ ] 能够排查配置加载失败、优先级混乱等问题
- [ ] 能够流畅回答 Nacos Config 相关面试题

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：配置优先级、配置监听器、配置加密
- **前置知识**：第8章 Nacos Config 快速入门
- **实践建议**：搭建多层配置，验证配置优先级和灰度发布

---

## 12. 参考资料

- [Nacos Config 官方文档](https://nacos.io/zh-cn/docs/quick-start-spring-cloud.html)
- [Spring Cloud Alibaba 文档](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-config)
- [Jasypt 文档](http://www.jasypt.org/)
- [Nacos Open API](https://nacos.io/zh-cn/docs/open-api.html)

---

**本章小结**：
- Nacos Config 通过 namespace + group + data-id 三层定位配置
- 配置优先级：Nacos 主配置 > extension-configs > shared-configs > application.yml > bootstrap.yml
- 扩展配置（extension-configs）优先级高于共享配置（shared-configs）
- 配置监听器可以监听配置变更，触发自定义处理逻辑
- 敏感配置可以使用 Jasypt 加密存储
- 配置灰度发布可以通过 Beta 发布或元数据实现

**下一章预告**：第10章将详细讲解配置动态刷新原理，包括 @RefreshScope 注解原理、@ConfigurationProperties 动态绑定、ConfigurableEnvironment 扩展、配置变更监听机制、配置刷新源码分析、配置刷新最佳实践。
