# 第 18 章：ServletWebServerFactory 机制

## 本章概述

深入分析 ServletWebServerFactory 接口和 TomcatServletWebServerFactory 的实现原理，理解容器创建流程。

**学习目标：**
- 掌握 ServletWebServerFactory 接口体系
- 理解 TomcatServletWebServerFactory 实现
- 了解容器创建的完整流程

---

## 18.1 ServletWebServerFactory 接口

### 核心接口

```java
@FunctionalInterface
public interface ServletWebServerFactory {
    
    WebServer getWebServer(ServletContextInitializer... initializers);
}
```

### 实现类

```
ServletWebServerFactory (接口)
    ↓
├── TomcatServletWebServerFactory
├── JettyServletWebServerFactory
└── UndertowServletWebServerFactory
```

---

## 18.2 TomcatServletWebServerFactory

### 核心方法

```java
@Override
public WebServer getWebServer(ServletContextInitializer... initializers) {
    // 1. 创建 Tomcat 实例
    Tomcat tomcat = new Tomcat();
    
    // 2. 配置基础目录
    File baseDir = (this.baseDirectory != null) ? 
        this.baseDirectory : createTempDir("tomcat");
    tomcat.setBaseDir(baseDir.getAbsolutePath());
    
    // 3. 创建 Connector
    Connector connector = new Connector(this.protocol);
    connector.setPort(getPort());
    tomcat.getService().addConnector(connector);
    
    // 4. 配置 Context
    prepareContext(tomcat.getHost(), initializers);
    
    // 5. 返回 TomcatWebServer
    return getTomcatWebServer(tomcat);
}
```

### 容器创建流程

```
1. 创建 Tomcat 实例
    ↓
2. 配置基础目录
    ↓
3. 创建并配置 Connector
    ↓
4. 创建 Context
    ↓
5. 添加 ServletContextInitializer
    ↓
6. 包装为 TomcatWebServer
    ↓
7. 启动容器
```

---

## 18.3 WebServer 接口

### 接口定义

```java
public interface WebServer {
    
    void start() throws WebServerException;
    
    void stop() throws WebServerException;
    
    int getPort();
}
```

### TomcatWebServer 实现

```java
public class TomcatWebServer implements WebServer {
    
    private final Tomcat tomcat;
    private final Map<Service, Connector[]> serviceConnectors = new HashMap<>();
    
    @Override
    public void start() throws WebServerException {
        synchronized (this.monitor) {
            try {
                // 启动 Tomcat
                this.tomcat.start();
                
                // 等待启动完成
                rethrowDeferredStartupExceptions();
                
                // 注册 JMX
                registerServiceConnectors();
                
            } catch (Exception ex) {
                throw new WebServerException("Unable to start embedded Tomcat", ex);
            }
        }
    }
    
    @Override
    public void stop() throws WebServerException {
        synchronized (this.monitor) {
            try {
                this.tomcat.stop();
                this.tomcat.destroy();
            } catch (Exception ex) {
                throw new WebServerException("Unable to stop embedded Tomcat", ex);
            }
        }
    }
    
    @Override
    public int getPort() {
        Connector connector = this.tomcat.getConnector();
        if (connector != null) {
            return connector.getLocalPort();
        }
        return -1;
    }
}
```

---

## 18.4 ServletContextInitializer

### 接口定义

```java
@FunctionalInterface
public interface ServletContextInitializer {
    
    void onStartup(ServletContext servletContext) throws ServletException;
}
```

### 注册 Servlet

```java
@Bean
public ServletRegistrationBean<MyServlet> myServlet() {
    return new ServletRegistrationBean<>(new MyServlet(), "/myservlet/*");
}
```

### 注册 Filter

```java
@Bean
public FilterRegistrationBean<MyFilter> myFilter() {
    FilterRegistrationBean<MyFilter> registration = new FilterRegistrationBean<>();
    registration.setFilter(new MyFilter());
    registration.addUrlPatterns("/*");
    return registration;
}
```

---

## 18.5 本章小结

**核心要点：**
1. ServletWebServerFactory 负责创建 WebServer
2. TomcatServletWebServerFactory 创建嵌入式 Tomcat
3. WebServer 接口定义容器的启动和停止
4. ServletContextInitializer 用于初始化 ServletContext

**相关章节：**
- [第 17 章：嵌入式容器架构设计](./content-17.md)
- [第 19 章：容器自动配置源码](./content-19.md)
- [第 20 章：容器定制化与扩展](./content-20.md)
