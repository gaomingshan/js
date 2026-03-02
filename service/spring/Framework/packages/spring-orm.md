# Spring ORM 源码指引

> spring-orm 提供与主流 ORM 框架（JPA、Hibernate、MyBatis）的集成支持。

---

## 1. ORM 框架集成

### 支持的 ORM 框架
- **JPA（Java Persistence API）** - JPA 2.x 标准
- **Hibernate** - Hibernate 5.x/6.x
- **MyBatis** - 通过 mybatis-spring 集成
- **JDO（Java Data Objects）** - 已较少使用

### 设计目的
统一不同 ORM 框架的集成方式，提供事务管理、异常转换、资源管理等基础设施。

### 使用限制与风险
- 不同 ORM 框架配置和使用方式差异大
- Spring Data JPA 进一步简化了 JPA 使用

---

## 2. JPA 集成

### 核心类
- **LocalContainerEntityManagerFactoryBean** - JPA EntityManagerFactory 工厂 Bean
- **LocalEntityManagerFactoryBean** - 简单 EntityManagerFactory 工厂 Bean
- **JpaTransactionManager** - JPA 事务管理器
- **JpaVendorAdapter** - JPA 厂商适配器接口

### JPA 厂商适配器
- **HibernateJpaVendorAdapter** - Hibernate 适配器
- **EclipseLinkJpaVendorAdapter** - EclipseLink 适配器
- **OpenJpaVendorAdapter** - OpenJPA 适配器

### 配置示例
```java
@Bean
public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
    LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
    factory.setDataSource(dataSource);
    factory.setPackagesToScan("com.example.entity");
    factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
    return factory;
}

@Bean
public JpaTransactionManager transactionManager(EntityManagerFactory emf) {
    return new JpaTransactionManager(emf);
}
```

### 设计目的
简化 JPA EntityManagerFactory 的配置和创建，集成 Spring 事务管理。

### 使用限制与风险
- LocalContainerEntityManagerFactoryBean 适合容器管理的 EntityManagerFactory
- LocalEntityManagerFactoryBean 适合简单场景，无需容器
- JpaVendorAdapter 配置 JPA 实现特定的属性

---

## 3. Hibernate 集成

### 核心类
- **LocalSessionFactoryBean** - Hibernate SessionFactory 工厂 Bean（Hibernate 5.2+）
- **HibernateTransactionManager** - Hibernate 事务管理器
- **HibernateTemplate** - Hibernate 模板（已不推荐）
- **HibernateExceptionTranslator** - Hibernate 异常转换器

### 配置示例
```java
@Bean
public LocalSessionFactoryBean sessionFactory(DataSource dataSource) {
    LocalSessionFactoryBean factory = new LocalSessionFactoryBean();
    factory.setDataSource(dataSource);
    factory.setPackagesToScan("com.example.entity");
    
    Properties props = new Properties();
    props.put("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect");
    props.put("hibernate.show_sql", "true");
    factory.setHibernateProperties(props);
    
    return factory;
}

@Bean
public HibernateTransactionManager transactionManager(SessionFactory sessionFactory) {
    return new HibernateTransactionManager(sessionFactory);
}
```

### 设计目的
简化 Hibernate SessionFactory 的配置，集成 Spring 事务管理。

### 使用限制与风险
- HibernateTemplate 已废弃，推荐直接使用 Hibernate API
- Hibernate 5+ 推荐使用 JPA 方式集成
- HibernateTransactionManager 仅支持 Hibernate 事务

---

## 4. ORM 操作模板

### HibernateTemplate（已废弃）
- 封装 Hibernate Session 操作
- 自动管理 Session 生命周期
- Spring 5+ 已移除，推荐直接使用 Hibernate API

### JpaTemplate（未提供）
- Spring 未提供 JpaTemplate
- 推荐直接使用 EntityManager API 或 Spring Data JPA

### 设计目的
简化 ORM 操作，自动管理资源和事务。

### 使用限制与风险
- 模板类已过时，现代 Spring 应用直接使用原生 API
- Spring Data JPA 提供了更高层的抽象

---

## 5. 统一异常转换（PersistenceExceptionTranslator）

### 核心接口
- **PersistenceExceptionTranslator** - 持久化异常转换器接口
- **PersistenceExceptionTranslationPostProcessor** - 异常转换后处理器

### 核心实现
- **HibernateExceptionTranslator** - Hibernate 异常转换器
- **JpaExceptionTranslator** - JPA 异常转换器

### 设计目的
将 ORM 框架特定的异常转换为 Spring 的 DataAccessException 体系。

### 使用限制与风险
- @Repository 注解的类自动应用异常转换
- 需配置 PersistenceExceptionTranslationPostProcessor（通常由 @EnableJpaRepositories 自动配置）

---

## 6. Session 生命周期管理

### SessionFactory 管理
- LocalSessionFactoryBean 负责创建和销毁 SessionFactory
- 与 Spring 容器生命周期绑定

### Session 管理
- **OpenSessionInViewFilter** - Open Session In View 过滤器
- **OpenSessionInViewInterceptor** - Open Session In View 拦截器

### 设计目的
统一管理 ORM 框架的 Session/EntityManager 生命周期。

### 使用限制与风险
- Session 通常由事务管理器自动管理
- Open Session In View 模式延长 Session 生命周期到 View 渲染完成，可能导致懒加载问题

---

## 7. OpenSessionInView 支持

### 核心类
- **OpenSessionInViewFilter** - Servlet Filter 方式
- **OpenSessionInViewInterceptor** - Spring MVC Interceptor 方式
- **OpenEntityManagerInViewFilter** - JPA 版本
- **OpenEntityManagerInViewInterceptor** - JPA Interceptor 版本

### 配置示例
```java
@Bean
public FilterRegistrationBean<OpenEntityManagerInViewFilter> openEntityManagerInViewFilter() {
    FilterRegistrationBean<OpenEntityManagerInViewFilter> registrationBean = new FilterRegistrationBean<>();
    registrationBean.setFilter(new OpenEntityManagerInViewFilter());
    registrationBean.setOrder(5);
    return registrationBean;
}
```

或 application.properties：
```properties
spring.jpa.open-in-view=true  # Spring Boot 默认启用
```

### 设计目的
解决懒加载异常（LazyInitializationException），允许在 View 层访问懒加载属性。

### 使用限制与风险
- 延长了数据库连接持有时间，可能影响并发性能
- 可能导致 N+1 查询问题
- 生产环境建议禁用，使用 DTO 或显式 JOIN FETCH

---

## 8. 实体扫描与注册

### JPA 实体扫描
- **packagesToScan** - 指定实体包路径
- LocalContainerEntityManagerFactoryBean 自动扫描 @Entity 类

### Hibernate 实体扫描
- LocalSessionFactoryBean 支持 packagesToScan
- 自动扫描 @Entity 或 Hibernate 特定注解

### 设计目的
自动发现和注册实体类，无需手动配置。

### 使用限制与风险
- 扫描范围越大，启动时间越长
- 需确保实体类在指定包路径下

---

## 9. 延迟加载代理

### Hibernate 延迟加载
- 使用 CGLIB 或 Javassist 动态代理
- 懒加载属性访问时触发 SQL 查询

### JPA 延迟加载
- 由 JPA 实现（如 Hibernate）提供
- @OneToMany、@ManyToMany 默认延迟加载
- @ManyToOne、@OneToOne 默认立即加载

### 设计目的
优化性能，仅在需要时加载关联数据。

### 使用限制与风险
- Session 关闭后访问懒加载属性会抛异常
- 可能导致 N+1 查询问题
- 需使用 JOIN FETCH 或 DTO 投影优化

---

## 10. JPA 查询方法

### EntityManager API
```java
@Repository
public class UserRepository {
    @PersistenceContext
    private EntityManager entityManager;
    
    public User findById(Long id) {
        return entityManager.find(User.class, id);
    }
    
    public List<User> findByName(String name) {
        return entityManager.createQuery(
            "SELECT u FROM User u WHERE u.name = :name", User.class)
            .setParameter("name", name)
            .getResultList();
    }
}
```

### JPQL（Java Persistence Query Language）
- 面向对象的查询语言
- 支持 SELECT、UPDATE、DELETE
- 参数绑定：位置参数（`?1`）或命名参数（`:name`）

### Criteria API
- 类型安全的查询构建
- 适合动态查询

### Native SQL
- 使用原生 SQL 查询
- `createNativeQuery()`

### 设计目的
提供多种查询方式，满足不同场景需求。

### 使用限制与风险
- JPQL 是 HQL 的标准化版本
- Native SQL 丧失数据库无关性
- Criteria API 代码量大，可读性差

---

## 11. 事务同步

### JPA/Hibernate 与 Spring 事务集成
- EntityManager/Session 与事务绑定
- TransactionSynchronizationManager 管理资源绑定

### 资源绑定
```java
EntityManager em = EntityManagerFactoryUtils.getTransactionalEntityManager(emf);
```

### 设计目的
确保 EntityManager/Session 与 Spring 事务同步，自动提交或回滚。

### 使用限制与风险
- 事务边界内获取的 EntityManager/Session 是同一个实例
- 非事务环境每次获取新实例

---

## 12. 二级缓存集成

### JPA 二级缓存
- 由 JPA 实现提供（如 Hibernate）
- 配置缓存提供者（EhCache、Hazelcast、Redis 等）

### Hibernate 二级缓存
```java
props.put("hibernate.cache.use_second_level_cache", "true");
props.put("hibernate.cache.region.factory_class", "org.hibernate.cache.jcache.JCacheRegionFactory");
props.put("hibernate.javax.cache.provider", "org.ehcache.jsr107.EhcacheCachingProvider");
```

### 设计目的
缓存实体数据，减少数据库查询。

### 使用限制与风险
- 需配置缓存提供者
- 缓存失效策略需谨慎设计
- 分布式环境需使用分布式缓存

---

## 13. MyBatis 集成

### mybatis-spring 依赖
```xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
</dependency>
```

### 核心类
- **SqlSessionFactoryBean** - MyBatis SqlSessionFactory 工厂 Bean
- **MapperScannerConfigurer** - Mapper 扫描配置器
- **SqlSessionTemplate** - MyBatis 模板

### 配置示例
```java
@Bean
public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
    SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
    factory.setDataSource(dataSource);
    factory.setMapperLocations(new PathMatchingResourcePatternResolver()
        .getResources("classpath:mapper/*.xml"));
    return factory.getObject();
}

@Bean
public MapperScannerConfigurer mapperScannerConfigurer() {
    MapperScannerConfigurer configurer = new MapperScannerConfigurer();
    configurer.setBasePackage("com.example.mapper");
    return configurer;
}
```

或使用 @MapperScan：
```java
@MapperScan("com.example.mapper")
@Configuration
public class MyBatisConfig {
}
```

### 设计目的
将 MyBatis 集成到 Spring 容器，自动管理 SqlSession 和事务。

### 使用限制与风险
- MyBatis 不是 spring-orm 模块的一部分，需单独依赖
- Mapper 接口会被代理为 Spring Bean
- 事务由 DataSourceTransactionManager 管理

---

## 📚 总结

spring-orm 提供了与主流 ORM 框架的集成：
- **JPA 集成**：LocalContainerEntityManagerFactoryBean、JpaTransactionManager
- **Hibernate 集成**：LocalSessionFactoryBean、HibernateTransactionManager
- **异常转换**：统一 ORM 异常到 DataAccessException
- **Session 管理**：OpenSessionInView 模式
- **实体扫描**：自动发现和注册实体类
- **延迟加载**：代理机制支持懒加载
- **事务同步**：与 Spring 事务深度集成

现代 Spring 应用推荐使用 Spring Data JPA，进一步简化数据访问层开发。
