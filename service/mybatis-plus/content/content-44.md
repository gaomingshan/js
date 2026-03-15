# 21.1 版本变更历史

## 概述

了解 MyBatis Plus 版本演进，有助于版本升级和新特性应用。

**主要版本：**
- 3.0.x：重大重构
- 3.1.x：性能优化
- 3.2.x：功能增强
- 3.3.x：稳定版本
- 3.4.x：Lambda 优化
- 3.5.x：最新稳定版

---

## 版本特性对比

### 3.0.x → 3.5.x 主要变化

| 版本 | 主要特性 | 重大变更 |
|------|---------|---------|
| 3.0 | 代码重构、新增 Wrapper | 不兼容 2.x |
| 3.1 | Lambda 支持、性能优化 | - |
| 3.2 | 废弃部分 API、新增插件 | PerformanceInterceptor 废弃 |
| 3.3 | 稳定性提升 | - |
| 3.4 | Lambda 增强、批量优化 | - |
| 3.5 | 最新功能、Spring Boot 3 支持 | JDK 8+ |

---

## 升级注意事项

### 从 3.4.x 升级到 3.5.x

```java
/**
 * 1. 依赖升级
 */
// 旧版本
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.3.4</version>
</dependency>

// 新版本
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.2</version>
</dependency>

/**
 * 2. 配置调整
 */
// 部分配置项名称变更
// 查看官方迁移指南

/**
 * 3. API 变更
 */
// 部分废弃的 API 需要替换
```

---

## 新特性应用

### 3.5.x 新特性

```java
/**
 * 1. 新增 selectMaps 支持
 */
List<Map<String, Object>> maps = userMapper.selectMaps(
    new QueryWrapper<User>().select("name", "age")
);

/**
 * 2. Lambda 链式优化
 */
List<User> users = lambdaQuery()
    .eq(User::getStatus, 1)
    .list();

/**
 * 3. 批量操作性能提升
 */
saveBatch(users, 1000);
```

---

## 关键点总结

1. **版本选择**：生产环境选择稳定版本
2. **升级测试**：充分测试后再升级
3. **兼容性**：关注 API 废弃和变更
4. **新特性**：及时应用新特性提升性能
5. **文档查阅**：升级前查看迁移指南
6. **回退方案**：准备版本回退方案
7. **持续关注**：关注官方更新动态

---

## 参考资料

- [更新日志](https://github.com/baomidou/mybatis-plus/blob/3.0/CHANGELOG.md)
- [迁移指南](https://baomidou.com/pages/24112f/)
