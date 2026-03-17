# 安全管理与权限控制

## 概述

Elasticsearch 的安全特性由 X-Pack Security 提供，包括认证、授权、加密通信、审计日志等。本章介绍如何保障集群和数据安全。

## X-Pack Security 配置

### 启用 Security

**elasticsearch.yml**：

```yaml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
```

### 初始化密码

```bash
# 自动生成密码
bin/elasticsearch-setup-passwords auto

# 交互式设置密码
bin/elasticsearch-setup-passwords interactive

# 输出示例
Changed password for user apm_system
PASSWORD apm_system = xxx

Changed password for user kibana_system
PASSWORD kibana_system = xxx

Changed password for user elastic
PASSWORD elastic = xxx
```

## TLS/SSL 加密通信

### 生成证书

```bash
# 生成 CA
bin/elasticsearch-certutil ca

# 生成节点证书
bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12

# 移动证书到配置目录
mv elastic-certificates.p12 config/
```

### Transport 层加密

**elasticsearch.yml**：

```yaml
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: elastic-certificates.p12
```

### HTTP 层加密

```yaml
xpack.security.http.ssl.enabled: true
xpack.security.http.ssl.keystore.path: http.p12
xpack.security.http.ssl.truststore.path: http.p12
```

**生成 HTTP 证书**：

```bash
bin/elasticsearch-certutil http
```

### 配置密码

```bash
# 添加 keystore 密码
bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password
bin/elasticsearch-keystore add xpack.security.transport.ssl.truststore.secure_password
bin/elasticsearch-keystore add xpack.security.http.ssl.keystore.secure_password
```

## 用户认证

### 内置用户

**创建用户**：

```bash
POST /_security/user/john
{
  "password" : "password",
  "roles" : [ "admin", "developer" ],
  "full_name" : "John Doe",
  "email" : "john@example.com",
  "metadata" : {
    "department" : "IT"
  }
}
```

**修改密码**：

```bash
POST /_security/user/john/_password
{
  "password" : "new_password"
}
```

**删除用户**：

```bash
DELETE /_security/user/john
```

### LDAP 集成

**elasticsearch.yml**：

```yaml
xpack.security.authc.realms.ldap.ldap1:
  order: 0
  url: "ldaps://ldap.example.com:636"
  bind_dn: "cn=admin,dc=example,dc=com"
  user_search:
    base_dn: "ou=users,dc=example,dc=com"
    filter: "(cn={0})"
  group_search:
    base_dn: "ou=groups,dc=example,dc=com"
  files:
    role_mapping: "ES_PATH_CONF/role_mapping.yml"
  unmapped_groups_as_roles: false
```

**role_mapping.yml**：

```yaml
admin:
  - "cn=admins,ou=groups,dc=example,dc=com"
  - "cn=elasticsearch-admins,ou=groups,dc=example,dc=com"

developer:
  - "cn=developers,ou=groups,dc=example,dc=com"

readonly:
  - "cn=users,ou=groups,dc=example,dc=com"
```

### SAML 单点登录

**elasticsearch.yml**：

```yaml
xpack.security.authc.realms.saml.saml1:
  order: 2
  idp.metadata.path: saml/idp-metadata.xml
  idp.entity_id: "https://sso.example.com"
  sp.entity_id: "https://elasticsearch.example.com"
  sp.acs: "https://elasticsearch.example.com/api/security/saml/callback"
  sp.logout: "https://elasticsearch.example.com/logout"
  attributes.principal: "nameid"
  attributes.groups: "groups"
```

## 基于角色的访问控制（RBAC）

### 内置角色

```
superuser：超级管理员
kibana_admin：Kibana 管理员
kibana_user：Kibana 用户
monitoring_user：监控用户
logstash_admin：Logstash 管理员
beats_admin：Beats 管理员
remote_monitoring_agent：远程监控代理
```

### 自定义角色

**创建角色**：

```bash
POST /_security/role/developer
{
  "cluster": ["monitor", "manage_index_templates"],
  "indices": [
    {
      "names": ["products*", "orders*"],
      "privileges": ["read", "write", "create_index", "delete_index"]
    }
  ],
  "applications": [],
  "run_as": []
}
```

**角色权限说明**：

```
集群权限（cluster）：
  - all：所有权限
  - monitor：监控权限
  - manage：管理权限
  - manage_security：安全管理

索引权限（indices.privileges）：
  - all：所有权限
  - read：读权限
  - write：写权限
  - create：创建文档
  - delete：删除文档
  - create_index：创建索引
  - delete_index：删除索引
  - manage：管理索引
```

### 复杂角色示例

```bash
POST /_security/role/data_analyst
{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["logs-*", "metrics-*"],
      "privileges": ["read", "view_index_metadata"]
    },
    {
      "names": ["reports-*"],
      "privileges": ["read", "write", "create_index"],
      "field_security": {
        "grant": ["*"],
        "except": ["sensitive_field"]
      },
      "query": {
        "term": {
          "department": "analytics"
        }
      }
    }
  ]
}
```

## 索引级别权限控制

### 限制访问索引

```bash
POST /_security/role/product_manager
{
  "indices": [
    {
      "names": ["products"],
      "privileges": ["all"]
    },
    {
      "names": ["orders"],
      "privileges": ["read"]
    }
  ]
}
```

### 通配符模式

```bash
POST /_security/role/log_viewer
{
  "indices": [
    {
      "names": ["logs-*", "metrics-*"],
      "privileges": ["read"]
    }
  ]
}
```

### 文档级别安全（DLS）

```bash
POST /_security/role/sales_cn
{
  "indices": [
    {
      "names": ["orders"],
      "privileges": ["read"],
      "query": {
        "term": {
          "region": "cn"
        }
      }
    }
  ]
}
```

**用户只能查看指定区域的订单**。

## 字段级别权限控制（FLS）

### 隐藏敏感字段

```bash
POST /_security/role/customer_support
{
  "indices": [
    {
      "names": ["customers"],
      "privileges": ["read"],
      "field_security": {
        "grant": ["name", "email", "phone", "address"],
        "except": ["ssn", "credit_card"]
      }
    }
  ]
}
```

**用户无法查看 SSN 和信用卡字段**。

### 组合 DLS 和 FLS

```bash
POST /_security/role/regional_manager
{
  "indices": [
    {
      "names": ["employees"],
      "privileges": ["read"],
      "query": {
        "term": {
          "department": "sales"
        }
      },
      "field_security": {
        "grant": ["name", "email", "department", "performance"],
        "except": ["salary", "bonus"]
      }
    }
  ]
}
```

**只能查看销售部门员工，且看不到薪资信息**。

## 审计日志

### 启用审计

**elasticsearch.yml**：

```yaml
xpack.security.audit.enabled: true
xpack.security.audit.logfile.events.include: 
  - access_granted
  - access_denied
  - anonymous_access_denied
  - authentication_failed
  - connection_denied
  - tampered_request
  - run_as_granted
  - run_as_denied
```

### 审计日志输出

**日志文件**：

```
logs/elasticsearch_audit.json
```

**日志示例**：

```json
{
  "type": "audit",
  "timestamp": "2024-01-15T10:00:00,123+0800",
  "node.name": "node-1",
  "cluster.name": "production",
  "action": "indices:data/read/search",
  "origin.type": "rest",
  "request.id": "abc123",
  "authentication": {
    "type": "realm",
    "realm": "native",
    "user": {
      "name": "john"
    }
  },
  "indices": ["products"],
  "result": "granted"
}
```

### 过滤审计事件

```yaml
xpack.security.audit.logfile.events.exclude:
  - access_granted

xpack.security.audit.logfile.events.emit_request_body: true
```

## API Key 认证

### 创建 API Key

```bash
POST /_security/api_key
{
  "name": "my-api-key",
  "role_descriptors": {
    "role-a": {
      "cluster": ["monitor"],
      "indices": [
        {
          "names": ["products"],
          "privileges": ["read"]
        }
      ]
    }
  },
  "expiration": "1d"
}

# 响应
{
  "id": "VuaCfGcBCdbkQm-e5aOx",
  "name": "my-api-key",
  "api_key": "ui2lp2axTNmsyakw9tvNnw"
}
```

### 使用 API Key

```bash
# Base64 编码
echo -n "VuaCfGcBCdbkQm-e5aOx:ui2lp2axTNmsyakw9tvNnw" | base64

# 使用 API Key
curl -H "Authorization: ApiKey VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHAyYXhUTm1zeWFrdzl0dk5udw==" \
  https://localhost:9200/_search
```

### 列出 API Keys

```bash
GET /_security/api_key?owner=true
```

### 删除 API Key

```bash
DELETE /_security/api_key
{
  "ids": ["VuaCfGcBCdbkQm-e5aOx"]
}
```

## Spring Boot 安全集成

### Basic 认证

```java
@Configuration
public class ElasticsearchSecurityConfig {
    
    @Bean
    public RestHighLevelClient secureClient() {
        CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(
            AuthScope.ANY,
            new UsernamePasswordCredentials("elastic", "password")
        );
        
        SSLContext sslContext = createSSLContext();
        
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "https")
        );
        
        builder.setHttpClientConfigCallback(httpClientBuilder ->
            httpClientBuilder
                .setDefaultCredentialsProvider(credentialsProvider)
                .setSSLContext(sslContext)
        );
        
        return new RestHighLevelClient(builder);
    }
    
    private SSLContext createSSLContext() {
        try {
            return SSLContexts.custom()
                .loadTrustMaterial(new File("path/to/ca.crt"), null)
                .build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

### API Key 认证

```java
@Configuration
public class ApiKeyConfig {
    
    @Value("${elasticsearch.api-key}")
    private String apiKey;
    
    @Bean
    public RestHighLevelClient apiKeyClient() {
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "https")
        );
        
        builder.setDefaultHeaders(new Header[]{
            new BasicHeader("Authorization", "ApiKey " + apiKey)
        });
        
        return new RestHighLevelClient(builder);
    }
}
```

## 安全最佳实践

### 密码策略

```yaml
xpack.security.authc.password_hashing.algorithm: bcrypt

# 密码强度要求
xpack.security.authc.password_policy.enabled: true
xpack.security.authc.password_policy.length.min: 8
xpack.security.authc.password_policy.length.max: 64
xpack.security.authc.password_policy.pattern: (?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])
```

### IP 过滤

```yaml
xpack.security.transport.filter.enabled: true
xpack.security.transport.filter.allow: ["192.168.1.0/24"]
xpack.security.transport.filter.deny: ["_all"]

xpack.security.http.filter.enabled: true
xpack.security.http.filter.allow: ["192.168.1.0/24", "10.0.0.0/8"]
```

### 最小权限原则

```
✓ 为每个用户分配最小必需权限
✓ 使用角色而非直接分配权限
✓ 定期审查权限
✓ 启用审计日志
✓ 使用 API Key 代替用户密码
```

### 网络安全

```
✓ 启用 TLS/SSL
✓ 使用防火墙限制访问
✓ 隔离集群网络
✓ 禁用不必要的插件
✓ 定期更新补丁
```

## 总结

**X-Pack Security**：
- 认证授权
- 加密通信
- 审计日志

**TLS/SSL**：
- Transport 层加密
- HTTP 层加密
- 证书管理

**用户认证**：
- 内置用户
- LDAP 集成
- SAML SSO
- API Key

**权限控制**：
- RBAC 角色
- 索引级权限
- 文档级安全（DLS）
- 字段级安全（FLS）

**审计日志**：
- 记录所有操作
- 安全事件追踪
- 合规要求

**最佳实践**：
- 最小权限原则
- 强密码策略
- IP 过滤
- 定期审查

**下一步**：学习备份恢复与容灾方案。
