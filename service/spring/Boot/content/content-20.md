# 第 20 章：容器定制化与扩展

## 本章概述

深入讲解如何定制和扩展嵌入式容器，包括端口配置、SSL 配置、压缩配置、连接器定制等。

**学习目标：**
- 掌握容器定制化的方法
- 学会配置 SSL、压缩等高级特性
- 理解 WebServerFactoryCustomizer 的使用

---

## 20.1 端口配置

### 基本配置

```properties
server.port=8080
```

### 动态端口

```properties
server.port=0
# 使用随机端口
```

### 获取实际端口

```java
@Component
public class PortLogger implements ApplicationListener<ServletWebServerInitializedEvent> {
    
    @Override
    public void onApplicationEvent(ServletWebServerInitializedEvent event) {
        int port = event.getWebServer().getPort();
        System.out.println("Server started on port: " + port);
    }
}
```

---

## 20.2 SSL 配置

### 配置文件

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

### 生成证书

```bash
keytool -genkeypair -alias tomcat -keyalg RSA -keysize 2048 \
  -storetype PKCS12 -keystore keystore.p12 -validity 3650
```

### 代码配置

```java
@Bean
public WebServerFactoryCustomizer<TomcatServletWebServerFactory> sslCustomizer() {
    return factory -> {
        Ssl ssl = new Ssl();
        ssl.setEnabled(true);
        ssl.setKeyStore("classpath:keystore.p12");
        ssl.setKeyStorePassword("changeit");
        ssl.setKeyStoreType("PKCS12");
        factory.setSsl(ssl);
    };
}
```

---

## 20.3 压缩配置

### 启用压缩

```yaml
server:
  compression:
    enabled: true
    mime-types: text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json
    min-response-size: 1024
```

---

## 20.4 连接器定制

### 自定义 Connector

```java
@Bean
public WebServerFactoryCustomizer<TomcatServletWebServerFactory> connectorCustomizer() {
    return factory -> factory.addConnectorCustomizers(connector -> {
        connector.setPort(8080);
        connector.setMaxPostSize(10485760); // 10MB
        connector.setAttribute("maxThreads", 200);
        connector.setAttribute("minSpareThreads", 10);
    });
}
```

---

## 20.5 Context 定制

### 自定义 Context

```java
@Bean
public WebServerFactoryCustomizer<TomcatServletWebServerFactory> contextCustomizer() {
    return factory -> factory.addContextCustomizers(context -> {
        context.setSessionTimeout(30);
        context.addWelcomeFile("index.html");
    });
}
```

---

## 20.6 切换容器

### 从 Tomcat 切换到 Jetty

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

### 定制 Jetty

```java
@Bean
public WebServerFactoryCustomizer<JettyServletWebServerFactory> jettyCustomizer() {
    return factory -> {
        factory.setPort(8080);
        factory.addServerCustomizers(server -> {
            // 定制 Jetty Server
        });
    };
}
```

---

## 20.7 本章小结

**核心要点：**
1. 可以通过配置文件或代码定制容器
2. 支持 SSL、压缩等高级特性
3. WebServerFactoryCustomizer 提供统一的定制入口
4. 可以轻松切换不同的容器实现

**相关章节：**
- [第 19 章：容器自动配置源码](./content-19.md)
- [第 21 章：SpringApplication.run() 完整流程](./content-21.md)
