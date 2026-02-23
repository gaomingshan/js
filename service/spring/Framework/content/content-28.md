# 第 28 章：FactoryBean 工厂Bean

> **学习目标**：理解 FactoryBean 的作用和使用场景  
> **预计时长**：1.5 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

**FactoryBean** 是创建复杂对象的工厂 Bean。

**普通 Bean vs FactoryBean**：
- 普通 Bean：getBean() 返回 Bean 本身
- FactoryBean：getBean() 返回 FactoryBean.getObject() 的结果

---

## 2. FactoryBean 接口

```java
public interface FactoryBean<T> {
    
    /**
     * 返回创建的对象
     */
    @Nullable
    T getObject() throws Exception;
    
    /**
     * 返回对象类型
     */
    @Nullable
    Class<?> getObjectType();
    
    /**
     * 是否单例
     */
    default boolean isSingleton() {
        return true;
    }
}
```

---

## 3. 实现示例

```java
@Component
public class UserFactoryBean implements FactoryBean<User> {
    
    @Override
    public User getObject() throws Exception {
        // 创建复杂对象
        User user = new User();
        user.setUsername("admin");
        user.setPassword(encrypt("password"));
        user.setRoles(loadRoles());
        return user;
    }
    
    @Override
    public Class<?> getObjectType() {
        return User.class;
    }
    
    @Override
    public boolean isSingleton() {
        return true;
    }
}

// 使用
@Autowired
private User user;  // 注入的是 FactoryBean.getObject() 返回的 User

@Autowired
private UserFactoryBean userFactoryBean;  // 注入 FactoryBean 本身，需要加 &
```

---

## 4. 获取 FactoryBean 本身

```java
// 方式1：通过 BeanFactory
UserFactoryBean factoryBean = (UserFactoryBean) context.getBean("&userFactoryBean");

// 方式2：直接注入（需要类型匹配）
@Autowired
private FactoryBean<User> userFactoryBean;
```

---

## 5. 应用场景

### 场景 1：MyBatis Mapper 代理

```java
public class MapperFactoryBean<T> implements FactoryBean<T> {
    
    private Class<T> mapperInterface;
    private SqlSessionFactory sqlSessionFactory;
    
    @Override
    public T getObject() throws Exception {
        // 创建 Mapper 代理对象
        SqlSession sqlSession = sqlSessionFactory.openSession();
        return sqlSession.getMapper(mapperInterface);
    }
    
    @Override
    public Class<?> getObjectType() {
        return mapperInterface;
    }
}
```

### 场景 2：数据源代理

```java
public class DataSourceFactoryBean implements FactoryBean<DataSource> {
    
    private String driverClassName;
    private String url;
    private String username;
    private String password;
    
    @Override
    public DataSource getObject() throws Exception {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName(driverClassName);
        dataSource.setJdbcUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        
        // 设置连接池参数
        dataSource.setMaximumPoolSize(10);
        dataSource.setMinimumIdle(2);
        
        return dataSource;
    }
    
    @Override
    public Class<?> getObjectType() {
        return DataSource.class;
    }
}
```

---

**上一章** ← [第 27 章：@Conditional 条件装配](./content-27.md)  
**下一章** → [第 29 章：BeanPostProcessor 扩展](./content-29.md)  
**返回目录** → [学习大纲](../content-outline.md)
