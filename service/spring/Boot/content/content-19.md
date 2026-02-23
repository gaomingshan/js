# 第 19 章：容器自动配置源码

## 本章概述

深入分析 ServletWebServerFactoryAutoConfiguration 的源码实现，理解容器的自动配置机制。

**学习目标：**
- 掌握容器自动配置的实现原理
- 理解容器选型机制
- 了解条件装配在容器配置中的应用

---

## 19.1 ServletWebServerFactoryAutoConfiguration

### 自动配置类

```java
@AutoConfiguration
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnClass(ServletRequest.class)
@ConditionalOnWebApplication(type = Type.SERVLET)
@EnableConfigurationProperties(ServerProperties.class)
@Import({ ServletWebServerFactoryAutoConfiguration.BeanPostProcessorsRegistrar.class,
		ServletWebServerFactoryConfiguration.EmbeddedTomcat.class,
		ServletWebServerFactoryConfiguration.EmbeddedJetty.class,
		ServletWebServerFactoryConfiguration.EmbeddedUndertow.class })
public class ServletWebServerFactoryAutoConfiguration {
    
    @Bean
    public ServletWebServerFactoryCustomizer servletWebServerFactoryCustomizer(
            ServerProperties serverProperties) {
        return new ServletWebServerFactoryCustomizer(serverProperties);
    }
    
    @Bean
    @ConditionalOnClass(name = "org.apache.catalina.startup.Tomcat")
    public TomcatServletWebServerFactoryCustomizer tomcatServletWebServerFactoryCustomizer(
            ServerProperties serverProperties) {
        return new TomcatServletWebServerFactoryCustomizer(serverProperties);
    }
}
```

---

## 19.2 容器选型机制

### EmbeddedTomcat 配置

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass({ Servlet.class, Tomcat.class, UpgradeProtocol.class })
@ConditionalOnMissingBean(value = ServletWebServerFactory.class, search = SearchStrategy.CURRENT)
static class EmbeddedTomcat {
    
    @Bean
    TomcatServletWebServerFactory tomcatServletWebServerFactory(
            ObjectProvider<TomcatConnectorCustomizer> connectorCustomizers,
            ObjectProvider<TomcatContextCustomizer> contextCustomizers,
            ObjectProvider<TomcatProtocolHandlerCustomizer<?>> protocolHandlerCustomizers) {
        
        TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
        factory.getTomcatConnectorCustomizers()
               .addAll(connectorCustomizers.orderedStream().collect(Collectors.toList()));
        factory.getTomcatContextCustomizers()
               .addAll(contextCustomizers.orderedStream().collect(Collectors.toList()));
        factory.getTomcatProtocolHandlerCustomizers()
               .addAll(protocolHandlerCustomizers.orderedStream().collect(Collectors.toList()));
        return factory;
    }
}
```

### 选型条件

```
1. Tomcat: @ConditionalOnClass(Tomcat.class)
2. Jetty: @ConditionalOnClass(Server.class)
3. Undertow: @ConditionalOnClass(Undertow.class)
```

**优先级：** Tomcat > Jetty > Undertow

---

## 19.3 ServerProperties

### 配置属性类

```java
@ConfigurationProperties(prefix = "server", ignoreUnknownFields = true)
public class ServerProperties {
    
    private Integer port;
    
    private InetAddress address;
    
    @NestedConfigurationProperty
    private ErrorProperties error = new ErrorProperties();
    
    private Servlet servlet = new Servlet();
    
    private Tomcat tomcat = new Tomcat();
    
    private Jetty jetty = new Jetty();
    
    private Undertow undertow = new Undertow();
    
    // Getters and Setters
    
    public static class Servlet {
        private String contextPath;
        private String applicationDisplayName = "application";
        // Getters and Setters
    }
    
    public static class Tomcat {
        private int maxThreads = 200;
        private int minSpareThreads = 10;
        private DataSize maxHttpHeaderSize = DataSize.ofKilobytes(8);
        // Getters and Setters
    }
}
```

---

## 19.4 WebServerFactoryCustomizer

### 定制器接口

```java
@FunctionalInterface
public interface WebServerFactoryCustomizer<T extends WebServerFactory> {
    
    void customize(T factory);
}
```

### ServletWebServerFactoryCustomizer

```java
public class ServletWebServerFactoryCustomizer
		implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory>, Ordered {
    
    private final ServerProperties serverProperties;
    
    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        PropertyMapper map = PropertyMapper.get().alwaysApplyingWhenNonNull();
        map.from(this.serverProperties::getPort).to(factory::setPort);
        map.from(this.serverProperties::getAddress).to(factory::setAddress);
        map.from(this.serverProperties.getServlet()::getContextPath).to(factory::setContextPath);
        map.from(this.serverProperties.getServlet()::getApplicationDisplayName).to(factory::setDisplayName);
        map.from(this.serverProperties.getServlet()::getSession).to(factory::setSession);
        map.from(this.serverProperties::getSsl).to(factory::setSsl);
        map.from(this.serverProperties.getServlet()::getJsp).to(factory::setJsp);
        map.from(this.serverProperties::getCompression).to(factory::setCompression);
        map.from(this.serverProperties::getHttp2).to(factory::setHttp2);
        map.from(this.serverProperties::getServerHeader).to(factory::setServerHeader);
        map.from(this.serverProperties.getServlet()::getContextParameters).to(factory::setInitParameters);
        map.from(this.serverProperties.getShutdown()).to(factory::setShutdown);
    }
    
    @Override
    public int getOrder() {
        return 0;
    }
}
```

---

## 19.5 本章小结

**核心要点：**
1. ServletWebServerFactoryAutoConfiguration 负责容器自动配置
2. 根据 classpath 中的类自动选择容器类型
3. ServerProperties 提供配置属性绑定
4. WebServerFactoryCustomizer 用于定制容器

**相关章节：**
- [第 18 章：ServletWebServerFactory 机制](./content-18.md)
- [第 20 章：容器定制化与扩展](./content-20.md)
