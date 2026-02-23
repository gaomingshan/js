# 第 44 章：Spring Boot 核心扩展点汇总

全面汇总 Spring Boot 的核心扩展点，帮助你在实际项目中灵活扩展 Spring Boot 功能。

**学习目标：**
- 掌握所有核心扩展点
- 理解扩展点的使用场景
- 学会选择合适的扩展点

---

## 44.1 启动阶段扩展点

### ApplicationContextInitializer

**时机**：ApplicationContext 刷新之前

```java
public class MyInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext context) {
        // 初始化逻辑
    }
}
```

### SpringApplicationRunListener

**时机**：启动过程的各个阶段

### CommandLineRunner / ApplicationRunner

**时机**：应用启动完成后

---

## 44.2 配置阶段扩展点

### EnvironmentPostProcessor

**时机**：Environment 准备完成后

### BeanDefinitionRegistryPostProcessor

**时机**：BeanDefinition 注册阶段

### BeanFactoryPostProcessor

**时机**：BeanFactory 准备完成后

---

## 44.3 Bean 生命周期扩展点

### BeanPostProcessor

**时机**：Bean 初始化前后

### InstantiationAwareBeanPostProcessor

**时机**：Bean 实例化前后

---

## 44.4 自动配置扩展点

### @Conditional 条件注解

### AutoConfigurationImportSelector

### ImportSelector / ImportBeanDefinitionRegistrar

---

## 44.5 Web 扩展点

### WebMvcConfigurer

### WebServerFactoryCustomizer

### FilterRegistrationBean / ServletRegistrationBean

---

## 44.6 本章小结

**核心要点：**
1. Spring Boot 提供丰富的扩展点
2. 不同扩展点适用于不同场景
3. 合理选择扩展点提升开发效率

**相关章节：**
- [第 3 章：Spring Boot 运行机制概览](./content-3.md)
- [第 45 章：常见问题排查与优化](./content-45.md)
