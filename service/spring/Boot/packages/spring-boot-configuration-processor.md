# Spring Boot Configuration Processor 源码指引

> spring-boot-configuration-processor 是一个注解处理器，用于生成配置元数据文件，为 IDE 提供自动完成和文档提示支持。

---

## 1. 注解处理器（ConfigurationMetadataAnnotationProcessor）

### 核心类
- **ConfigurationMetadataAnnotationProcessor** - 配置元数据注解处理器（核心）
- 继承 AbstractProcessor（JSR 269 注解处理器）
- 在编译时扫描 @ConfigurationProperties 注解

### 处理流程
1. 扫描源代码中的 @ConfigurationProperties 注解类
2. 提取属性信息（名称、类型、默认值、描述）
3. 生成 spring-configuration-metadata.json 文件
4. 输出到 META-INF/ 目录

### 设计目的
在编译时自动生成配置元数据，为 IDE（IntelliJ IDEA、Eclipse、VS Code）提供配置属性的自动完成、类型检查、文档提示。

### 使用限制与风险
- 仅在编译时生效
- 需在 pom.xml 或 build.gradle 中添加依赖
- 动态属性无法识别

---

## 2. 元数据结构（ConfigurationMetadata）

### 核心类
- **ConfigurationMetadata** - 配置元数据容器
- **ItemMetadata** - 元数据项（属性或组）
- **ItemHint** - 元数据提示
- **ItemDeprecation** - 废弃信息
- **ValueHint** - 值提示
- **ValueProvider** - 值提供者

### 元数据项类型
- **group** - 属性组（对应 @ConfigurationProperties 类）
- **property** - 单个属性

### 元数据文件格式
```json
{
  "groups": [
    {
      "name": "server",
      "type": "org.springframework.boot.autoconfigure.web.ServerProperties",
      "sourceType": "org.springframework.boot.autoconfigure.web.ServerProperties"
    }
  ],
  "properties": [
    {
      "name": "server.port",
      "type": "java.lang.Integer",
      "description": "Server HTTP port.",
      "sourceType": "org.springframework.boot.autoconfigure.web.ServerProperties",
      "defaultValue": 8080
    }
  ],
  "hints": [
    {
      "name": "server.port",
      "values": [
        {
          "value": 8080,
          "description": "Default HTTP port."
        }
      ]
    }
  ]
}
```

### 设计目的
定义统一的元数据格式，描述配置属性的完整信息。

### 使用限制与风险
- JSON 格式必须符合规范
- 手动编辑容易出错

---

## 3. 属性提取（PropertyDescriptor）

### 核心类
- **PropertyDescriptor** - 属性描述符
- **JavaBeanPropertyDescriptor** - JavaBean 属性描述符
- **TypeUtils** - 类型工具类
- **FieldUtils** - 字段工具类

### 提取信息
- **属性名称** - 从字段名或 getter/setter 推断
- **属性类型** - 字段类型或方法返回类型
- **默认值** - 从字段初始值或 @DefaultValue 提取
- **描述信息** - 从 Javadoc 提取
- **废弃信息** - 从 @Deprecated 或 @DeprecatedConfigurationProperty 提取

### 嵌套属性处理
- 递归处理嵌套对象
- 生成点号分隔的属性名（如 server.ssl.key-store）

### 设计目的
自动提取配置类的属性信息，减少手动维护元数据的工作量。

### 使用限制与风险
- Javadoc 必须规范编写
- 泛型信息可能丢失
- 复杂类型需特殊处理

---

## 4. 类型处理（TypeUtils）

### 核心功能
- **类型解析** - 解析字段和方法的类型
- **泛型处理** - 提取泛型参数信息
- **集合类型识别** - 识别 List、Set、Map 等集合
- **枚举值提取** - 提取枚举的所有可能值

### 支持的类型
- 基本类型（int、long、boolean 等）
- 包装类型（Integer、Long、Boolean 等）
- 字符串（String）
- 枚举（Enum）
- 日期时间（Date、Duration、Period、LocalDate 等）
- 数据大小（DataSize）
- 集合（List、Set、Map）
- 嵌套对象

### 设计目的
正确识别和处理各种 Java 类型，生成准确的元数据。

### 使用限制与风险
- 复杂泛型可能无法完全解析
- 自定义类型需正确标注

---

## 5. 额外元数据（additional-spring-configuration-metadata.json）

### 手动元数据文件
- **位置** - src/main/resources/META-INF/additional-spring-configuration-metadata.json
- **用途** - 补充自动生成的元数据

### 使用场景
- 添加属性描述
- 添加默认值
- 添加值提示（枚举值、可选值）
- 添加废弃信息
- 添加动态属性（无法通过注解处理器识别的）

### 示例
```json
{
  "properties": [
    {
      "name": "my.property",
      "type": "java.lang.String",
      "description": "My custom property description.",
      "defaultValue": "default-value"
    }
  ],
  "hints": [
    {
      "name": "my.property",
      "values": [
        {"value": "option1", "description": "First option"},
        {"value": "option2", "description": "Second option"}
      ]
    }
  ]
}
```

### 设计目的
允许开发者手动补充和覆盖自动生成的元数据。

### 使用限制与风险
- 需手动维护，容易过时
- 与自动生成的元数据合并，可能冲突

---

## 6. 值提示（Hints）

### 提示类型
- **values** - 枚举值列表
- **providers** - 值提供者

### 值提供者
- **any** - 任意值
- **class-reference** - 类引用
- **handle-as** - 类型转换
- **logger-name** - 日志名称
- **spring-bean-reference** - Spring Bean 引用
- **spring-profile-name** - Spring Profile 名称

### 示例
```json
{
  "hints": [
    {
      "name": "logging.level",
      "providers": [
        {
          "name": "logger-name"
        }
      ]
    },
    {
      "name": "spring.jpa.hibernate.ddl-auto",
      "values": [
        {"value": "none"},
        {"value": "validate"},
        {"value": "update"},
        {"value": "create"},
        {"value": "create-drop"}
      ]
    }
  ]
}
```

### 设计目的
为 IDE 提供智能提示，改善开发体验。

### 使用限制与风险
- 提示信息需手动维护
- 动态值无法完全覆盖

---

## 7. 废弃属性处理

### 废弃注解
- **@Deprecated** - Java 标准废弃注解
- **@DeprecatedConfigurationProperty** - Spring Boot 废弃配置属性注解

### 废弃信息
- **reason** - 废弃原因
- **replacement** - 替代属性
- **level** - 废弃级别（WARNING、ERROR）

### 示例
```java
@ConfigurationProperties("old")
public class OldProperties {
    @DeprecatedConfigurationProperty(
        reason = "Use new.property instead",
        replacement = "new.property"
    )
    public String getOldProperty() {
        return this.oldProperty;
    }
}
```

### 元数据输出
```json
{
  "properties": [
    {
      "name": "old.old-property",
      "type": "java.lang.String",
      "deprecated": true,
      "deprecation": {
        "reason": "Use new.property instead",
        "replacement": "new.property",
        "level": "warning"
      }
    }
  ]
}
```

### 设计目的
标记废弃属性，引导开发者迁移到新属性。

### 使用限制与风险
- IDE 支持程度不同
- 需正确填写 replacement

---

## 8. IDE 集成

### IntelliJ IDEA
- 自动识别 spring-configuration-metadata.json
- 提供属性名自动完成
- 显示属性描述和默认值
- 类型检查和警告
- 废弃属性标记

### Eclipse / Spring Tools
- 通过 Spring Tools 插件支持
- 类似的自动完成和提示功能

### VS Code
- 通过 Spring Boot Extension Pack 支持
- 提供配置属性智能提示

### 设计目的
与主流 IDE 集成，提升配置编写体验，减少错误。

### 使用限制与风险
- 需安装对应插件
- 插件版本需兼容
- 大型项目加载可能较慢

---

## 9. Maven 配置

### 添加依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

### 注意事项
- **optional=true** - 标记为可选依赖，不会传递
- 仅在编译时需要，运行时不需要
- 生成的元数据文件会打包到最终 jar

### 排除打包
如果不想将 configuration-processor 打包到最终 jar：
```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <excludes>
            <exclude>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-configuration-processor</artifactId>
            </exclude>
        </excludes>
    </configuration>
</plugin>
```

### 设计目的
简化配置，自动集成到 Maven 构建流程。

### 使用限制与风险
- 增加编译时间
- 元数据文件会增加 jar 大小（通常很小）

---

## 10. Gradle 配置

### 添加依赖
```gradle
dependencies {
    annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
    // 或使用 Kotlin DSL
    // annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
}
```

### Kotlin 项目
```gradle
dependencies {
    kapt 'org.springframework.boot:spring-boot-configuration-processor'
}
```

### 设计目的
集成到 Gradle 构建流程，支持 Java 和 Kotlin 项目。

### 使用限制与风险
- Kotlin 需使用 kapt
- Gradle 版本需兼容

---

## 11. 最佳实践

### 1. 规范 Javadoc
```java
/**
 * Server properties.
 */
@ConfigurationProperties("server")
public class ServerProperties {
    /**
     * Server HTTP port.
     */
    private int port = 8080;
}
```

### 2. 使用 @DefaultValue
```java
@ConfigurationProperties("app")
@ConstructorBinding
public class AppProperties {
    private final String name;
    
    public AppProperties(@DefaultValue("My App") String name) {
        this.name = name;
    }
}
```

### 3. 标记废弃属性
```java
@DeprecatedConfigurationProperty(
    replacement = "new.property",
    reason = "Renamed for clarity"
)
@Deprecated
public String getOldProperty() {
    return this.oldProperty;
}
```

### 4. 提供值提示
在 additional-spring-configuration-metadata.json 中添加：
```json
{
  "hints": [
    {
      "name": "app.level",
      "values": [
        {"value": "debug"},
        {"value": "info"},
        {"value": "warn"},
        {"value": "error"}
      ]
    }
  ]
}
```

### 5. 嵌套属性分组
```java
@ConfigurationProperties("app")
public class AppProperties {
    private Security security = new Security();
    
    public static class Security {
        private boolean enabled = true;
        private String username;
        private String password;
    }
}
```

### 设计目的
生成高质量的元数据，最大化 IDE 支持效果。

### 使用限制与风险
- 需额外编写和维护文档
- 团队需统一规范

---

## 📚 总结

spring-boot-configuration-processor 提供了：
- **ConfigurationMetadataAnnotationProcessor**：编译时注解处理器
- **元数据生成**：自动生成 spring-configuration-metadata.json
- **属性提取**：从 @ConfigurationProperties 类提取属性信息
- **类型处理**：支持各种 Java 类型和泛型
- **额外元数据**：手动补充和覆盖
- **值提示**：为 IDE 提供智能提示
- **废弃处理**：标记和迁移废弃属性
- **IDE 集成**：支持 IntelliJ IDEA、Eclipse、VS Code

该模块是 Spring Boot 开发体验的重要组成部分，通过生成配置元数据，极大提升了配置属性的编写效率和正确性。
