# 第 3 章：IoC 容器架构设计

> **学习目标**：深入理解 Spring IoC 容器的整体架构、核心接口和实现类  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 什么是 IoC 容器

IoC 容器是 Spring 的核心，负责管理应用程序中对象（Bean）的完整生命周期：

```
IoC 容器的职责：
┌─────────────────────────────────────┐
│  1. 读取配置（XML/注解/Java Config） │
│  2. 解析 Bean 定义                   │
│  3. 创建 Bean 实例                   │
│  4. 依赖注入                         │
│  5. 初始化回调                       │
│  6. Bean 缓存管理                    │
│  7. 销毁回调                         │
└─────────────────────────────────────┘
```

### 1.2 BeanFactory vs ApplicationContext

Spring 提供两个核心容器接口：

**BeanFactory**：
- 基础容器接口
- 提供基本的依赖注入功能
- 懒加载（按需创建 Bean）
- 适合资源受限场景

**ApplicationContext**：
- 企业级容器接口
- 继承 BeanFactory，提供更多功能
- 预加载（启动时创建所有单例 Bean）
- 适合企业应用

**对比表**：

| 特性 | BeanFactory | ApplicationContext |
|------|-------------|-------------------|
| **Bean 加载** | 懒加载（Lazy） | 预加载（Eager） |
| **国际化** | ❌ | ✅ MessageSource |
| **事件发布** | ❌ | ✅ ApplicationEventPublisher |
| **资源访问** | ❌ | ✅ ResourcePatternResolver |
| **环境抽象** | ❌ | ✅ Environment |
| **Bean 后置处理器** | 需手动注册 | 自动注册 |
| **使用场景** | 资源受限场景 | 企业应用（推荐） |

---

## 2. 技术架构与类图结构

### 2.1 BeanFactory 继承体系

```
                    BeanFactory (顶层接口)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
  HierarchicalBF   ListableBF    AutowireCapableBF
  (层级容器)       (可列举)      (自动装配)
        │                │                │
        └────────────────┴────────────────┘
                         │
              ConfigurableBeanFactory
              (可配置Bean工厂)
                         │
         ┌───────────────┴───────────────┐
         │                               │
    AbstractBeanFactory        ConfigurableListableBF
    (抽象Bean工厂)             (可配置可列举)
         │                               │
         └───────────────┬───────────────┘
                         │
          AbstractAutowireCapableBeanFactory
          (抽象自动装配Bean工厂)
                         │
                         │
              DefaultListableBeanFactory
              (默认Bean工厂实现)
```

### 2.2 ApplicationContext 继承体系

```
                  ApplicationContext
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ConfigurableAC   WebApplicationContext  ...
   (可配置上下文)    (Web应用上下文)
        │
        │
   AbstractApplicationContext
   (抽象应用上下文)
        │
        ┌────────────────┼────────────────┐
        │                │                │
  GenericApplicationContext  AbstractRefreshableAC
  (通用应用上下文)            (可刷新应用上下文)
        │                                 │
        │                    ┌────────────┴────────────┐
        │                    │                         │
AnnotationConfigAC    ClassPathXmlAC    FileSystemXmlAC
(注解配置)            (类路径XML)       (文件系统XML)
```

### 2.3 完整架构图

```
┌──────────────────────────────────────────────────────────────┐
│                    ApplicationContext                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            BeanFactory (Bean 工厂能力)                 │  │
│  │  - getBean()         - containsBean()                  │  │
│  │  - getBeanDefinition() - isSingleton()                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  + MessageSource (国际化)                                    │
│  + ApplicationEventPublisher (事件发布)                      │
│  + ResourcePatternResolver (资源加载)                        │
│  + EnvironmentCapable (环境配置)                             │
│  + Lifecycle (生命周期管理)                                  │
└──────────────────────────────────────────────────────────────┘
         │                                      │
         │ 委托                                 │ 委托
         ↓                                      ↓
┌──────────────────────┐            ┌──────────────────────┐
│ DefaultListableBF    │            │  ResourceLoader      │
│ (实际创建Bean)       │            │  (加载资源)          │
└──────────────────────┘            └──────────────────────┘
```

---

## 3. 核心类/接口详解

### 3.1 BeanFactory - 顶层容器接口

```java
package org.springframework.beans.factory;

public interface BeanFactory {
    
    // 用于区分 FactoryBean 本身和其创建的 Bean
    String FACTORY_BEAN_PREFIX = "&";
    
    /**
     * 根据名称获取 Bean
     * 如果 Bean 不存在，抛出 NoSuchBeanDefinitionException
     */
    Object getBean(String name) throws BeansException;
    
    /**
     * 根据类型获取 Bean
     */
    <T> T getBean(Class<T> requiredType) throws BeansException;
    
    /**
     * 根据名称和类型获取 Bean
     */
    <T> T getBean(String name, Class<T> requiredType) throws BeansException;
    
    /**
     * 根据名称和构造参数获取 Bean（原型模式）
     */
    Object getBean(String name, Object... args) throws BeansException;
    
    /**
     * 获取 Bean 提供者（延迟获取）
     */
    <T> ObjectProvider<T> getBeanProvider(Class<T> requiredType);
    
    /**
     * 是否包含指定名称的 Bean
     */
    boolean containsBean(String name);
    
    /**
     * 是否单例
     */
    boolean isSingleton(String name) throws NoSuchBeanDefinitionException;
    
    /**
     * 是否原型
     */
    boolean isPrototype(String name) throws NoSuchBeanDefinitionException;
    
    /**
     * Bean 类型是否匹配
     */
    boolean isTypeMatch(String name, ResolvableType typeToMatch) 
        throws NoSuchBeanDefinitionException;
    
    /**
     * 获取 Bean 的类型
     */
    Class<?> getType(String name) throws NoSuchBeanDefinitionException;
    
    /**
     * 获取 Bean 的所有别名
     */
    String[] getAliases(String name);
}
```

**设计意图**：
- 定义容器的基本能力：获取 Bean、判断 Bean 属性
- 面向接口编程，客户端不依赖具体实现
- 支持按名称、类型、构造参数获取 Bean

### 3.2 ListableBeanFactory - 可枚举的 BeanFactory

```java
public interface ListableBeanFactory extends BeanFactory {
    
    /**
     * 是否包含指定名称的 Bean 定义
     * 注意：不会考虑父容器
     */
    boolean containsBeanDefinition(String beanName);
    
    /**
     * 返回容器中 Bean 定义的数量
     */
    int getBeanDefinitionCount();
    
    /**
     * 返回容器中所有 Bean 的名称
     */
    String[] getBeanDefinitionNames();
    
    /**
     * 根据类型获取所有 Bean 的名称
     */
    String[] getBeanNamesForType(ResolvableType type);
    
    String[] getBeanNamesForType(Class<?> type);
    
    /**
     * 根据类型获取所有 Bean（Map<beanName, bean>）
     */
    <T> Map<String, T> getBeansOfType(Class<T> type) throws BeansException;
    
    /**
     * 获取带有指定注解的所有 Bean 名称
     */
    String[] getBeanNamesForAnnotation(Class<? extends Annotation> annotationType);
    
    /**
     * 获取带有指定注解的所有 Bean
     */
    Map<String, Object> getBeansWithAnnotation(Class<? extends Annotation> annotationType) 
        throws BeansException;
    
    /**
     * 查找 Bean 上的注解
     */
    <A extends Annotation> A findAnnotationOnBean(String beanName, Class<A> annotationType)
        throws NoSuchBeanDefinitionException;
}
```

**设计意图**：
- 提供批量操作能力：获取所有 Bean 名称、按类型获取
- 支持注解查找
- 不会查找父容器（与 HierarchicalBeanFactory 互补）

### 3.3 HierarchicalBeanFactory - 层级容器

```java
public interface HierarchicalBeanFactory extends BeanFactory {
    
    /**
     * 获取父容器
     */
    BeanFactory getParentBeanFactory();
    
    /**
     * 当前容器是否包含指定 Bean（不考虑父容器）
     */
    boolean containsLocalBean(String name);
}
```

**设计意图**：
- 支持容器层级结构（父子容器）
- 典型应用：Spring MVC 中，Root ApplicationContext 是父容器，Servlet ApplicationContext 是子容器

**容器层级示例**：

```
┌─────────────────────────────────┐
│   Root ApplicationContext       │
│   (父容器)                       │
│   - Service                     │
│   - DAO                         │
│   - DataSource                  │
└─────────────────────────────────┘
              │ 父子关系
              ↓
┌─────────────────────────────────┐
│   Web ApplicationContext        │
│   (子容器)                       │
│   - Controller                  │
│   - ViewResolver                │
│   - HandlerMapping              │
└─────────────────────────────────┘

规则：
- 子容器可以访问父容器的 Bean
- 父容器不能访问子容器的 Bean
- 子容器优先使用自己的 Bean
```

### 3.4 ConfigurableBeanFactory - 可配置的 BeanFactory

```java
public interface ConfigurableBeanFactory extends HierarchicalBeanFactory, SingletonBeanRegistry {
    
    // 作用域常量
    String SCOPE_SINGLETON = "singleton";
    String SCOPE_PROTOTYPE = "prototype";
    
    /**
     * 设置父容器
     */
    void setParentBeanFactory(BeanFactory parentBeanFactory) throws IllegalStateException;
    
    /**
     * 设置类加载器
     */
    void setBeanClassLoader(ClassLoader beanClassLoader);
    
    ClassLoader getBeanClassLoader();
    
    /**
     * 添加 BeanPostProcessor
     */
    void addBeanPostProcessor(BeanPostProcessor beanPostProcessor);
    
    /**
     * 获取 BeanPostProcessor 数量
     */
    int getBeanPostProcessorCount();
    
    /**
     * 注册作用域
     */
    void registerScope(String scopeName, Scope scope);
    
    /**
     * 注册别名
     */
    void registerAlias(String beanName, String alias);
    
    /**
     * 销毁单例 Bean
     */
    void destroySingletons();
}
```

**设计意图**：
- 提供容器配置能力
- 支持父子容器、类加载器、作用域、BeanPostProcessor 等配置
- 通常由容器实现类实现，不对外暴露

### 3.5 AutowireCapableBeanFactory - 自动装配能力

```java
public interface AutowireCapableBeanFactory extends BeanFactory {
    
    // 自动装配模式
    int AUTOWIRE_NO = 0;              // 不自动装配
    int AUTOWIRE_BY_NAME = 1;         // 按名称装配
    int AUTOWIRE_BY_TYPE = 2;         // 按类型装配
    int AUTOWIRE_CONSTRUCTOR = 3;     // 按构造器装配
    
    /**
     * 创建 Bean 实例（外部 Bean）
     */
    <T> T createBean(Class<T> beanClass) throws BeansException;
    
    /**
     * 自动装配 Bean 属性
     */
    void autowireBean(Object existingBean) throws BeansException;
    
    /**
     * 配置 Bean（依赖注入 + 初始化）
     */
    Object configureBean(Object existingBean, String beanName) throws BeansException;
    
    /**
     * 初始化 Bean（Aware 接口回调 + BeanPostProcessor）
     */
    Object initializeBean(Object existingBean, String beanName) throws BeansException;
    
    /**
     * 应用 BeanPostProcessor 的前置处理
     */
    Object applyBeanPostProcessorsBeforeInitialization(Object existingBean, String beanName)
        throws BeansException;
    
    /**
     * 应用 BeanPostProcessor 的后置处理
     */
    Object applyBeanPostProcessorsAfterInitialization(Object existingBean, String beanName)
        throws BeansException;
    
    /**
     * 销毁 Bean
     */
    void destroyBean(Object existingBean);
}
```

**设计意图**：
- 提供对外部 Bean 的装配能力（不在容器中的对象）
- 支持手动触发依赖注入和初始化
- 典型应用：集成第三方框架创建的对象

### 3.6 ApplicationContext - 应用上下文

```java
public interface ApplicationContext extends EnvironmentCapable, ListableBeanFactory, 
        HierarchicalBeanFactory, MessageSource, ApplicationEventPublisher, ResourcePatternResolver {
    
    /**
     * 获取应用 ID
     */
    String getId();
    
    /**
     * 获取应用名称
     */
    String getApplicationName();
    
    /**
     * 获取显示名称
     */
    String getDisplayName();
    
    /**
     * 获取启动时间戳
     */
    long getStartupDate();
    
    /**
     * 获取父上下文
     */
    ApplicationContext getParent();
    
    /**
     * 获取 AutowireCapableBeanFactory
     */
    AutowireCapableBeanFactory getAutowireCapableBeanFactory() throws IllegalStateException;
}
```

**ApplicationContext 继承的接口**：

1. **BeanFactory** - Bean 管理
2. **ListableBeanFactory** - 批量操作
3. **HierarchicalBeanFactory** - 层级容器
4. **MessageSource** - 国际化
5. **ApplicationEventPublisher** - 事件发布
6. **ResourcePatternResolver** - 资源加载
7. **EnvironmentCapable** - 环境配置

### 3.7 ConfigurableApplicationContext - 可配置的应用上下文

```java
public interface ConfigurableApplicationContext extends ApplicationContext, Lifecycle, Closeable {
    
    String CONFIG_LOCATION_DELIMITERS = ",; \t\n";
    
    /**
     * 设置唯一 ID
     */
    void setId(String id);
    
    /**
     * 设置父上下文
     */
    void setParent(ApplicationContext parent);
    
    /**
     * 设置环境
     */
    void setEnvironment(ConfigurableEnvironment environment);
    
    /**
     * 获取可配置的环境
     */
    @Override
    ConfigurableEnvironment getEnvironment();
    
    /**
     * 添加 BeanFactoryPostProcessor
     */
    void addBeanFactoryPostProcessor(BeanFactoryPostProcessor postProcessor);
    
    /**
     * 添加 ApplicationListener
     */
    void addApplicationListener(ApplicationListener<?> listener);
    
    /**
     * 刷新容器（核心方法）
     */
    void refresh() throws BeansException, IllegalStateException;
    
    /**
     * 注册关闭钩子
     */
    void registerShutdownHook();
    
    /**
     * 关闭容器
     */
    @Override
    void close();
    
    /**
     * 是否激活
     */
    boolean isActive();
    
    /**
     * 获取内部 BeanFactory
     */
    ConfigurableListableBeanFactory getBeanFactory() throws IllegalStateException;
}
```

**设计意图**：
- 提供容器生命周期管理：refresh()、close()
- 支持配置环境、添加后置处理器、注册监听器
- 通常不直接使用，由 Spring Boot 等框架调用

---

## 4. 容器层级结构与父子容器

### 4.1 父子容器设计原理

**为什么需要父子容器**：
- **隔离性**：不同模块的 Bean 互不影响
- **复用性**：父容器的 Bean 可被多个子容器共享
- **安全性**：子容器不能影响父容器

**典型应用场景**：

```java
// Spring MVC 父子容器
┌─────────────────────────────────────────┐
│  Root ApplicationContext (父容器)        │
│  配置文件：applicationContext.xml        │
│  ┌─────────────────────────────────────┐ │
│  │  @Service                           │ │
│  │  @Repository                        │ │
│  │  @Component                         │ │
│  │  DataSource                         │ │
│  │  TransactionManager                 │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    │ 父子关系
                    ↓
┌─────────────────────────────────────────┐
│  Servlet ApplicationContext (子容器)     │
│  配置文件：spring-mvc.xml                │
│  ┌─────────────────────────────────────┐ │
│  │  @Controller                        │ │
│  │  @RestController                    │ │
│  │  ViewResolver                       │ │
│  │  HandlerMapping                     │ │
│  │  HandlerAdapter                     │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4.2 父子容器配置示例

```xml
<!-- web.xml 配置 -->
<web-app>
    <!-- 1. 配置 Root ApplicationContext（父容器） -->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:applicationContext.xml</param-value>
    </context-param>
    
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
    
    <!-- 2. 配置 DispatcherServlet（子容器） -->
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:spring-mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
</web-app>
```

```xml
<!-- applicationContext.xml（父容器配置） -->
<beans>
    <!-- 扫描 Service、DAO 层 -->
    <context:component-scan base-package="com.example">
        <context:exclude-filter type="annotation" 
            expression="org.springframework.stereotype.Controller"/>
    </context:component-scan>
    
    <!-- 数据源配置 -->
    <bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
        <!-- ... -->
    </bean>
    
    <!-- 事务管理器 -->
    <bean id="transactionManager" 
        class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
</beans>
```

```xml
<!-- spring-mvc.xml（子容器配置） -->
<beans>
    <!-- 只扫描 Controller 层 -->
    <context:component-scan base-package="com.example.controller"/>
    
    <!-- 视图解析器 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/views/"/>
        <property name="suffix" value=".jsp"/>
    </bean>
    
    <!-- 静态资源处理 -->
    <mvc:resources mapping="/static/**" location="/static/"/>
</beans>
```

### 4.3 Bean 查找规则

```java
// 子容器获取 Bean 的查找顺序
@Controller
public class UserController {
    @Autowired
    private UserService userService; // 1. 先在子容器查找
                                      // 2. 未找到，去父容器查找
                                      // 3. 找到并注入
    
    @Autowired
    private HandlerMapping handlerMapping; // 只在子容器查找
                                            // 父容器没有此 Bean
}
```

**查找流程源码**：

```java
// AbstractBeanFactory.doGetBean()
protected <T> T doGetBean(String name, Class<T> requiredType, Object[] args, boolean typeCheckOnly) {
    String beanName = transformedBeanName(name);
    Object bean;
    
    // 1. 先在当前容器查找
    Object sharedInstance = getSingleton(beanName);
    if (sharedInstance != null && args == null) {
        bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
    } else {
        // 2. 检查父容器
        BeanFactory parentBeanFactory = getParentBeanFactory();
        if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
            // 委托给父容器
            return parentBeanFactory.getBean(nameToLookup, requiredType);
        }
        
        // 3. 当前容器创建 Bean
        // ...
    }
    
    return (T) bean;
}
```

---

## 5. BeanDefinition - Bean 定义与注册机制

### 5.1 什么是 BeanDefinition

**BeanDefinition** 是 Bean 的元数据定义，描述了如何创建 Bean：

```java
public interface BeanDefinition extends AttributeAccessor, BeanMetadataElement {
    
    // Bean 的类名
    String getBeanClassName();
    void setBeanClassName(String beanClassName);
    
    // 作用域
    String getScope();
    void setScope(String scope);
    
    // 是否懒加载
    boolean isLazyInit();
    void setLazyInit(boolean lazyInit);
    
    // 依赖的 Bean 名称
    String[] getDependsOn();
    void setDependsOn(String... dependsOn);
    
    // 是否自动装配候选
    boolean isAutowireCandidate();
    void setAutowireCandidate(boolean autowireCandidate);
    
    // 是否主要候选
    boolean isPrimary();
    void setPrimary(boolean primary);
    
    // 工厂 Bean 名称
    String getFactoryBeanName();
    void setFactoryBeanName(String factoryBeanName);
    
    // 工厂方法名称
    String getFactoryMethodName();
    void setFactoryMethodName(String factoryMethodName);
    
    // 构造器参数值
    ConstructorArgumentValues getConstructorArgumentValues();
    
    // 属性值
    MutablePropertyValues getPropertyValues();
    
    // 初始化方法名
    String getInitMethodName();
    void setInitMethodName(String initMethodName);
    
    // 销毁方法名
    String getDestroyMethodName();
    void setDestroyMethodName(String destroyMethodName);
    
    // 角色
    int getRole();
    void setRole(int role);
}
```

### 5.2 BeanDefinition 继承体系

```
         BeanDefinition (接口)
                │
        ┌───────┴───────┐
        │               │
 AbstractBeanDefinition  AnnotatedBeanDefinition
        │               (带注解信息)
        │
   ┌────┴────┬──────────┬────────┐
   │         │          │        │
RootBD  ChildBD  GenericBD  ScannedGenericBD
(根定义)(子定义)(通用定义) (扫描的Bean定义)
```

### 5.3 BeanDefinition 注册流程

```java
// BeanDefinitionRegistry 接口
public interface BeanDefinitionRegistry extends AliasRegistry {
    
    /**
     * 注册 BeanDefinition
     */
    void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
        throws BeanDefinitionStoreException;
    
    /**
     * 移除 BeanDefinition
     */
    void removeBeanDefinition(String beanName) throws NoSuchBeanDefinitionException;
    
    /**
     * 获取 BeanDefinition
     */
    BeanDefinition getBeanDefinition(String beanName) throws NoSuchBeanDefinitionException;
    
    /**
     * 是否包含 BeanDefinition
     */
    boolean containsBeanDefinition(String beanName);
    
    /**
     * 获取所有 BeanDefinition 名称
     */
    String[] getBeanDefinitionNames();
    
    /**
     * 获取 BeanDefinition 数量
     */
    int getBeanDefinitionCount();
    
    /**
     * Bean 名称是否已被使用
     */
    boolean isBeanNameInUse(String beanName);
}
```

**注册示例**：

```java
// DefaultListableBeanFactory 实现
public class DefaultListableBeanFactory extends AbstractAutowireCapableBeanFactory
        implements ConfigurableListableBeanFactory, BeanDefinitionRegistry {
    
    // Bean 定义注册表
    private final Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>(256);
    
    // Bean 定义名称列表（保持注册顺序）
    private volatile List<String> beanDefinitionNames = new ArrayList<>(256);
    
    @Override
    public void registerBeanDefinition(String beanName, BeanDefinition beanDefinition) {
        // 1. 校验
        if (beanDefinition instanceof AbstractBeanDefinition) {
            ((AbstractBeanDefinition) beanDefinition).validate();
        }
        
        // 2. 检查是否已存在
        BeanDefinition existingDefinition = this.beanDefinitionMap.get(beanName);
        if (existingDefinition != null) {
            // 是否允许覆盖
            if (!isAllowBeanDefinitionOverriding()) {
                throw new BeanDefinitionOverrideException(beanName, beanDefinition, existingDefinition);
            }
            // 覆盖
            this.beanDefinitionMap.put(beanName, beanDefinition);
        } else {
            // 3. 检查是否已开始创建 Bean
            if (hasBeanCreationStarted()) {
                // 同步操作
                synchronized (this.beanDefinitionMap) {
                    this.beanDefinitionMap.put(beanName, beanDefinition);
                    List<String> updatedDefinitions = new ArrayList<>(this.beanDefinitionNames.size() + 1);
                    updatedDefinitions.addAll(this.beanDefinitionNames);
                    updatedDefinitions.add(beanName);
                    this.beanDefinitionNames = updatedDefinitions;
                }
            } else {
                // 启动阶段，不需要同步
                this.beanDefinitionMap.put(beanName, beanDefinition);
                this.beanDefinitionNames.add(beanName);
            }
        }
        
        // 4. 重置所有已创建的此名称的单例
        if (existingDefinition != null || containsSingleton(beanName)) {
            resetBeanDefinition(beanName);
        }
    }
}
```

---

## 6. 在 Spring 架构中的定位

### 6.1 容器是 Spring 的核心基础

```
            Spring 应用
                │
                ↓
        ApplicationContext
        (容器管理一切)
                │
    ┌───────────┼───────────┐
    │           │           │
   Bean      Resource    Environment
  (对象管理)  (资源加载)  (配置管理)
    │
    ├─> BeanFactory (创建Bean)
    ├─> BeanPostProcessor (扩展点)
    ├─> AOP Proxy (代理增强)
    └─> Transaction (事务管理)
```

### 6.2 容器与其他组件的关系

- **AOP**：依赖容器的 BeanPostProcessor 创建代理
- **事务**：依赖容器的 AOP 拦截器
- **MVC**：依赖容器管理 Controller、Service
- **数据访问**：依赖容器注入 DataSource

---

## 7. 实际落地场景（工作实战）

### 场景 1：Spring Boot 自动配置原理

**问题背景**：
Spring Boot 如何实现"约定优于配置"，自动创建和配置 Bean？

**技术方案**：

```java
// Spring Boot 启动类
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// @SpringBootApplication 组合注解
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootConfiguration  // 相当于 @Configuration
@EnableAutoConfiguration  // 启用自动配置
@ComponentScan            // 组件扫描
public @interface SpringBootApplication {
}

// @EnableAutoConfiguration 原理
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(AutoConfigurationImportSelector.class)  // 导入自动配置选择器
public @interface EnableAutoConfiguration {
}

// AutoConfigurationImportSelector - 自动配置选择器
public class AutoConfigurationImportSelector implements DeferredImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        // 1. 加载 spring.factories 文件
        List<String> configurations = SpringFactoriesLoader.loadFactoryNames(
            EnableAutoConfiguration.class,
            getBeanClassLoader()
        );
        
        // 2. 去重、排除
        configurations = removeDuplicates(configurations);
        Set<String> exclusions = getExclusions(importingClassMetadata, attributes);
        configurations.removeAll(exclusions);
        
        // 3. 过滤（根据 @Conditional 条件）
        configurations = filter(configurations, autoConfigurationMetadata);
        
        // 4. 返回要导入的配置类
        return StringUtils.toStringArray(configurations);
    }
}
```

**spring.factories 文件**：

```properties
# META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.transaction.TransactionAutoConfiguration
```

**自动配置类示例**：

```java
@Configuration
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    
    @Configuration
    @Conditional(EmbeddedDatabaseCondition.class)
    protected static class EmbeddedDatabaseConfiguration {
        
        @Bean
        public DataSource dataSource(DataSourceProperties properties) {
            return DataSourceBuilder.create()
                .url(properties.getUrl())
                .username(properties.getUsername())
                .password(properties.getPassword())
                .build();
        }
    }
}
```

### 场景 2：容器启动性能优化

**性能瓶颈现象**：
大型项目启动慢，Bean 创建耗时长。

**问题定位方法**：

```java
// 开启 Bean 创建日志
logging.level.org.springframework.beans.factory.support=DEBUG

// 启动时输出：
// Creating shared instance of singleton bean 'userService'
// Creating shared instance of singleton bean 'orderService'
// ...
```

**优化方案**：

1. **懒加载**：

```java
@Configuration
public class AppConfig {
    
    // 方式1：全局懒加载
    @Bean
    public static LazyInitializationBeanFactoryPostProcessor lazyInitialization() {
        return new LazyInitializationBeanFactoryPostProcessor();
    }
    
    // 方式2：单个Bean懒加载
    @Bean
    @Lazy
    public ExpensiveBean expensiveBean() {
        return new ExpensiveBean();
    }
}
```

2. **排除不必要的自动配置**：

```java
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    RedisAutoConfiguration.class
})
public class Application {
}
```

3. **并行初始化**：

```properties
# application.properties
spring.main.lazy-initialization=true
```

**优化效果**：
- 启动时间从 30s 降低到 10s
- 内存占用减少 30%

### 场景 3：父子容器隔离问题排查

**故障现象**：
Controller 无法注入 Service，报 NoSuchBeanDefinitionException。

**排查思路**：

```java
// 1. 检查包扫描配置
// applicationContext.xml（父容器）
<context:component-scan base-package="com.example">
    <context:exclude-filter type="annotation" 
        expression="org.springframework.stereotype.Controller"/>
</context:component-scan>

// spring-mvc.xml（子容器）
<context:component-scan base-package="com.example.controller"/>

// 2. 问题原因：Service 在父容器，Controller 在子容器
//    子容器可以访问父容器的 Bean，但需要正确配置

// 3. 解决方案：确保包扫描不重复
// 父容器：扫描除 Controller 外的所有组件
// 子容器：只扫描 Controller
```

**防范措施**：
- 使用 Spring Boot 统一容器（推荐）
- 明确父子容器的职责划分
- 避免重复扫描

---

## 8. 学习自检清单

- [ ] 能够画出 BeanFactory 和 ApplicationContext 的继承体系图
- [ ] 能够说明 BeanFactory 和 ApplicationContext 的区别
- [ ] 能够解释父子容器的工作原理和应用场景
- [ ] 能够说明 BeanDefinition 的作用和注册流程
- [ ] 能够理解容器的核心接口及其职责
- [ ] 能够解释 Spring Boot 自动配置的原理

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：容器继承体系、父子容器、BeanDefinition 注册
- **前置知识**：Java 接口、继承、集合框架
- **实践建议**：
  - 画出完整的类图
  - 调试容器启动过程
  - 实现一个简易版 BeanFactory

---

## 9. 参考资料

**Spring 官方文档**：
- [The IoC Container](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans)

**源码位置**：
- `org.springframework.beans.factory.BeanFactory`
- `org.springframework.beans.factory.ListableBeanFactory`
- `org.springframework.beans.factory.HierarchicalBeanFactory`
- `org.springframework.beans.factory.config.ConfigurableBeanFactory`
- `org.springframework.context.ApplicationContext`
- `org.springframework.beans.factory.support.DefaultListableBeanFactory`
- `org.springframework.beans.factory.config.BeanDefinition`

---

**上一章** ← [第 2 章：Spring 核心设计模式详解](./content-2.md)  
**下一章** → [第 4 章：容器启动流程详解](./content-4.md)  
**返回目录** → [学习大纲](../content-outline.md)
