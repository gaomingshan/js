# 6.1 代码生成器使用

## 概述

MyBatis Plus 提供了强大的代码生成器 `AutoGenerator`，可以一键生成 Entity、Mapper、Service、Controller 等代码，大幅提升开发效率。支持自定义模板、灵活配置，适应各种项目需求。

**核心功能：**
- 自动生成实体类、Mapper、Service、Controller
- 支持多种模板引擎（Velocity、Freemarker、Beetl）
- 自定义代码模板
- 灵活的生成策略配置

---

## 引入依赖

### Maven 依赖

```xml
<dependencies>
    <!-- MyBatis Plus 代码生成器 -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-generator</artifactId>
        <version>3.5.3.2</version>
    </dependency>
    
    <!-- 模板引擎：Velocity（默认） -->
    <dependency>
        <groupId>org.apache.velocity</groupId>
        <artifactId>velocity-engine-core</artifactId>
        <version>2.3</version>
    </dependency>
    
    <!-- 或使用 Freemarker -->
    <!--
    <dependency>
        <groupId>org.freemarker</groupId>
        <artifactId>freemarker</artifactId>
        <version>2.3.32</version>
    </dependency>
    -->
</dependencies>
```

---

## AutoGenerator 配置详解

### 基本配置示例

```java
public class CodeGenerator {
    
    public static void main(String[] args) {
        // 1. 数据源配置
        DataSourceConfig dataSourceConfig = new DataSourceConfig.Builder(
            "jdbc:mysql://localhost:3306/test_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai",
            "root",
            "password"
        ).build();
        
        // 2. 全局配置
        GlobalConfig globalConfig = new GlobalConfig.Builder()
            .outputDir(System.getProperty("user.dir") + "/src/main/java")  // 输出目录
            .author("Your Name")                // 作者
            .enableSwagger()                    // 开启 Swagger 注解
            .disableOpenDir()                   // 禁止打开输出目录
            .commentDate("yyyy-MM-dd")          // 注释日期格式
            .build();
        
        // 3. 包配置
        PackageConfig packageConfig = new PackageConfig.Builder()
            .parent("com.example")              // 父包名
            .moduleName("system")               // 模块名
            .entity("entity")                   // Entity 包名
            .mapper("mapper")                   // Mapper 包名
            .service("service")                 // Service 包名
            .serviceImpl("service.impl")        // Service Impl 包名
            .controller("controller")           // Controller 包名
            .pathInfo(Collections.singletonMap(OutputFile.xml, 
                System.getProperty("user.dir") + "/src/main/resources/mapper"))  // XML 路径
            .build();
        
        // 4. 策略配置
        StrategyConfig strategyConfig = new StrategyConfig.Builder()
            .addInclude("user", "role", "dept")  // 需要生成的表名
            .addTablePrefix("t_", "sys_")        // 表前缀（生成时会去除）
            // Entity 策略
            .entityBuilder()
                .enableLombok()                  // 启用 Lombok
                .enableTableFieldAnnotation()    // 启用字段注解
                .logicDeleteColumnName("deleted")  // 逻辑删除字段
                .versionColumnName("version")    // 乐观锁字段
                .addTableFills(
                    new Column("create_time", FieldFill.INSERT),
                    new Column("update_time", FieldFill.INSERT_UPDATE)
                )
            // Mapper 策略
            .mapperBuilder()
                .enableMapperAnnotation()        // 启用 @Mapper 注解
                .enableBaseResultMap()           // 启用 BaseResultMap
                .enableBaseColumnList()          // 启用 BaseColumnList
            // Service 策略
            .serviceBuilder()
                .formatServiceFileName("%sService")      // Service 接口名格式
                .formatServiceImplFileName("%sServiceImpl")  // Service 实现类名格式
            // Controller 策略
            .controllerBuilder()
                .enableRestStyle()               // 启用 REST 风格
                .enableHyphenStyle()             // 启用驼峰转连字符
            .build();
        
        // 5. 模板配置
        TemplateConfig templateConfig = new TemplateConfig.Builder()
            .entity("/templates/entity.java")    // 自定义实体类模板
            // 或禁用某些模板
            // .controller(null)  // 不生成 Controller
            .build();
        
        // 6. 注入配置（自定义参数）
        InjectionConfig injectionConfig = new InjectionConfig.Builder()
            .customMap(Collections.singletonMap("dto", "DTO"))
            .build();
        
        // 7. 执行生成
        AutoGenerator autoGenerator = new AutoGenerator(dataSourceConfig);
        autoGenerator.global(globalConfig);
        autoGenerator.packageInfo(packageConfig);
        autoGenerator.strategy(strategyConfig);
        autoGenerator.template(templateConfig);
        autoGenerator.injection(injectionConfig);
        
        autoGenerator.execute();
        
        System.out.println("代码生成完成！");
    }
}
```

---

## 配置项详解

### 1. 数据源配置（DataSourceConfig）

```java
DataSourceConfig dataSourceConfig = new DataSourceConfig.Builder(
    "jdbc:mysql://localhost:3306/test_db",
    "root",
    "password"
)
.schema("test_db")              // 指定 schema（某些数据库需要）
.typeConvert(new MySqlTypeConvert() {
    @Override
    public IColumnType processTypeConvert(GlobalConfig config, String fieldType) {
        // 自定义类型转换
        if (fieldType.toLowerCase().contains("tinyint")) {
            return DbColumnType.INTEGER;
        }
        return super.processTypeConvert(config, fieldType);
    }
})
.build();
```

### 2. 全局配置（GlobalConfig）

```java
GlobalConfig globalConfig = new GlobalConfig.Builder()
    .outputDir(outputDir)               // 输出目录
    .author("Your Name")                // 作者
    .enableSwagger()                    // 开启 Swagger 注解
    .enableKotlin()                     // 开启 Kotlin 模式
    .dateType(DateType.TIME_PACK)       // 时间类型（LocalDateTime）
    .commentDate("yyyy-MM-dd HH:mm:ss") // 注释日期格式
    .disableOpenDir()                   // 禁止打开输出目录
    .build();

// DateType 枚举
public enum DateType {
    ONLY_DATE,      // java.util.Date
    SQL_PACK,       // java.sql.*
    TIME_PACK       // java.time.* (推荐)
}
```

### 3. 包配置（PackageConfig）

```java
PackageConfig packageConfig = new PackageConfig.Builder()
    .parent("com.example")              // 父包名
    .moduleName("system")               // 模块名
    .entity("entity")                   // Entity 包名
    .mapper("mapper")                   // Mapper 包名
    .xml("mapper.xml")                  // XML 包名
    .service("service")                 // Service 包名
    .serviceImpl("service.impl")        // Service Impl 包名
    .controller("controller")           // Controller 包名
    .pathInfo(Map.of(
        OutputFile.entity, "/path/to/entity",
        OutputFile.mapper, "/path/to/mapper",
        OutputFile.xml, "/path/to/xml",
        OutputFile.service, "/path/to/service",
        OutputFile.serviceImpl, "/path/to/service/impl",
        OutputFile.controller, "/path/to/controller"
    ))
    .build();
```

### 4. 策略配置（StrategyConfig）

```java
StrategyConfig strategyConfig = new StrategyConfig.Builder()
    // 表相关
    .addInclude("user", "role")          // 包含的表名
    .addExclude("log", "config")         // 排除的表名
    .addTablePrefix("t_", "sys_")        // 表前缀过滤
    .addFieldPrefix("f_")                // 字段前缀过滤
    
    // Entity 策略
    .entityBuilder()
        .superClass(BaseEntity.class)    // 设置父类
        .addSuperEntityColumns("id", "create_time", "update_time", "deleted")  // 排除父类字段
        .enableLombok()                  // 启用 Lombok
        .enableChainModel()              // 启用链式模型
        .enableTableFieldAnnotation()    // 启用字段注解
        .enableActiveRecord()            // 启用 ActiveRecord 模式
        .versionColumnName("version")    // 乐观锁字段
        .versionPropertyName("version")  // 乐观锁属性名
        .logicDeleteColumnName("deleted")  // 逻辑删除字段
        .logicDeletePropertyName("deleted")  // 逻辑删除属性名
        .naming(NamingStrategy.underline_to_camel)  // 数据库表映射到实体的命名策略
        .columnNaming(NamingStrategy.underline_to_camel)  // 字段映射策略
        .addTableFills(
            new Column("create_time", FieldFill.INSERT),
            new Column("update_time", FieldFill.INSERT_UPDATE)
        )
        .idType(IdType.ASSIGN_ID)        // 主键类型
        .formatFileName("%s")            // 实体类名格式
    
    // Mapper 策略
    .mapperBuilder()
        .superClass(BaseMapper.class)    // 设置父类
        .enableMapperAnnotation()        // 启用 @Mapper 注解
        .enableBaseResultMap()           // 启用 BaseResultMap
        .enableBaseColumnList()          // 启用 BaseColumnList
        .cache(MyMapperCache.class)      // 设置缓存实现类
        .formatMapperFileName("%sMapper")  // Mapper 接口名格式
        .formatXmlFileName("%sMapper")   // XML 文件名格式
    
    // Service 策略
    .serviceBuilder()
        .superServiceClass(IService.class)       // Service 接口父类
        .superServiceImplClass(ServiceImpl.class)  // Service 实现类父类
        .formatServiceFileName("%sService")      // Service 接口名格式
        .formatServiceImplFileName("%sServiceImpl")  // Service 实现类名格式
    
    // Controller 策略
    .controllerBuilder()
        .superClass(BaseController.class)  // 设置父类
        .enableRestStyle()               // 启用 REST 风格
        .enableHyphenStyle()             // 启用驼峰转连字符
        .formatFileName("%sController")  // Controller 类名格式
    
    .build();
```

---

## 模板引擎选择

### Velocity（默认）

```xml
<dependency>
    <groupId>org.apache.velocity</groupId>
    <artifactId>velocity-engine-core</artifactId>
    <version>2.3</version>
</dependency>
```

### Freemarker

```xml
<dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
    <version>2.3.32</version>
</dependency>
```

```java
// 使用 Freemarker
TemplateConfig templateConfig = new TemplateConfig.Builder()
    .entity("/templates/entity.java.ftl")
    .build();

AutoGenerator autoGenerator = new AutoGenerator(dataSourceConfig);
autoGenerator.template(templateConfig);
```

### Beetl

```xml
<dependency>
    <groupId>com.ibeetl</groupId>
    <artifactId>beetl</artifactId>
    <version>3.15.0.RELEASE</version>
</dependency>
```

---

## 自定义生成模板

### 获取默认模板

MyBatis Plus 提供的默认模板位于 JAR 包中的 `/templates` 目录：

- `entity.java.vm` - 实体类模板
- `mapper.java.vm` - Mapper 接口模板
- `mapper.xml.vm` - XML 映射文件模板
- `service.java.vm` - Service 接口模板
- `serviceImpl.java.vm` - Service 实现类模板
- `controller.java.vm` - Controller 类模板

### 自定义 Entity 模板示例

```velocity
## entity.java.vm
package ${package.Entity};

#foreach($pkg in ${table.importPackages})
import ${pkg};
#end
#if(${swagger})
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
#end
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.io.Serializable;

/**
 * ${table.comment!}实体类
 *
 * @author ${author}
 * @since ${date}
 */
#if(${table.convert})
@TableName("${schemaName}${table.name}")
#end
#if(${swagger})
@ApiModel(value = "${entity}对象", description = "${table.comment!}")
#end
@Data
@EqualsAndHashCode(callSuper = false)
public class ${entity} implements Serializable {

    private static final long serialVersionUID = 1L;

#foreach($field in ${table.fields})
#if(${field.comment})
    /**
     * ${field.comment}
     */
#end
#if(${swagger})
    @ApiModelProperty(value = "${field.comment}")
#end
#if(${field.keyFlag})
    @TableId(value = "${field.annotationColumnName}", type = IdType.${idType})
#end
#if(!${field.keyFlag})
#if(${field.fill})
    @TableField(value = "${field.annotationColumnName}", fill = FieldFill.${field.fill})
#else
    @TableField("${field.annotationColumnName}")
#end
#end
    private ${field.propertyType} ${field.propertyName};

#end
}
```

### 使用自定义模板

```java
TemplateConfig templateConfig = new TemplateConfig.Builder()
    .entity("/templates/myEntity.java.vm")       // 自定义实体类模板
    .mapper("/templates/myMapper.java.vm")       // 自定义 Mapper 模板
    .xml("/templates/myMapper.xml.vm")           // 自定义 XML 模板
    .service("/templates/myService.java.vm")     // 自定义 Service 模板
    .serviceImpl("/templates/myServiceImpl.java.vm")  // 自定义 Service 实现模板
    .controller("/templates/myController.java.vm")    // 自定义 Controller 模板
    .build();
```

---

## 生成策略配置

### 按表名生成

```java
StrategyConfig strategyConfig = new StrategyConfig.Builder()
    .addInclude("user", "role", "dept")  // 指定表名
    .build();
```

### 按表前缀生成

```java
StrategyConfig strategyConfig = new StrategyConfig.Builder()
    .addInclude(getTables("sys_"))  // 生成所有 sys_ 开头的表
    .addTablePrefix("sys_")         // 去除 sys_ 前缀
    .build();

// 获取所有指定前缀的表
private static String[] getTables(String prefix) {
    Connection conn = null;
    try {
        conn = DriverManager.getConnection(url, username, password);
        DatabaseMetaData metaData = conn.getMetaData();
        ResultSet tables = metaData.getTables(null, null, prefix + "%", new String[]{"TABLE"});
        
        List<String> tableNames = new ArrayList<>();
        while (tables.next()) {
            tableNames.add(tables.getString("TABLE_NAME"));
        }
        return tableNames.toArray(new String[0]);
    } catch (Exception e) {
        throw new RuntimeException(e);
    } finally {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```

### 排除指定表

```java
StrategyConfig strategyConfig = new StrategyConfig.Builder()
    .addExclude("log", "config", "temp")  // 排除这些表
    .build();
```

---

## 实战案例

### 完整的代码生成器示例

```java
public class CodeGenerator {
    
    // 数据库配置
    private static final String URL = "jdbc:mysql://localhost:3306/test_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "password";
    
    // 项目配置
    private static final String PROJECT_PATH = System.getProperty("user.dir");
    private static final String PARENT_PACKAGE = "com.example";
    private static final String MODULE_NAME = "system";
    private static final String AUTHOR = "Your Name";
    
    public static void main(String[] args) {
        // 需要生成的表
        String[] tables = {"user", "role", "dept", "menu"};
        
        // 执行生成
        generate(tables);
    }
    
    private static void generate(String[] tables) {
        // 1. 数据源配置
        DataSourceConfig dataSourceConfig = new DataSourceConfig.Builder(URL, USERNAME, PASSWORD)
            .build();
        
        // 2. 全局配置
        GlobalConfig globalConfig = new GlobalConfig.Builder()
            .outputDir(PROJECT_PATH + "/src/main/java")
            .author(AUTHOR)
            .enableSwagger()
            .disableOpenDir()
            .dateType(DateType.TIME_PACK)
            .commentDate("yyyy-MM-dd")
            .build();
        
        // 3. 包配置
        Map<OutputFile, String> pathInfo = new HashMap<>();
        pathInfo.put(OutputFile.xml, PROJECT_PATH + "/src/main/resources/mapper/" + MODULE_NAME);
        
        PackageConfig packageConfig = new PackageConfig.Builder()
            .parent(PARENT_PACKAGE)
            .moduleName(MODULE_NAME)
            .entity("entity")
            .mapper("mapper")
            .service("service")
            .serviceImpl("service.impl")
            .controller("controller")
            .pathInfo(pathInfo)
            .build();
        
        // 4. 策略配置
        StrategyConfig strategyConfig = new StrategyConfig.Builder()
            .addInclude(tables)
            .addTablePrefix("t_", "sys_")
            // Entity 策略
            .entityBuilder()
                .superClass(BaseEntity.class)
                .addSuperEntityColumns("id", "create_time", "update_time", "deleted")
                .enableLombok()
                .enableTableFieldAnnotation()
                .logicDeleteColumnName("deleted")
                .addTableFills(
                    new Column("create_time", FieldFill.INSERT),
                    new Column("update_time", FieldFill.INSERT_UPDATE)
                )
                .idType(IdType.ASSIGN_ID)
            // Mapper 策略
            .mapperBuilder()
                .enableMapperAnnotation()
                .enableBaseResultMap()
                .enableBaseColumnList()
            // Service 策略
            .serviceBuilder()
                .formatServiceFileName("%sService")
                .formatServiceImplFileName("%sServiceImpl")
            // Controller 策略
            .controllerBuilder()
                .enableRestStyle()
                .enableHyphenStyle()
            .build();
        
        // 5. 执行生成
        AutoGenerator autoGenerator = new AutoGenerator(dataSourceConfig);
        autoGenerator.global(globalConfig);
        autoGenerator.packageInfo(packageConfig);
        autoGenerator.strategy(strategyConfig);
        autoGenerator.execute();
        
        System.out.println("代码生成完成！");
    }
}
```

---

## 常见问题

### 1. 生成的代码覆盖问题

```java
// 默认情况下，再次生成会覆盖已有文件
// 解决方案：使用版本控制（Git）或手动备份

// 或者自定义判断逻辑
GlobalConfig globalConfig = new GlobalConfig.Builder()
    .fileOverride()  // 覆盖已有文件（默认）
    .build();
```

### 2. 自定义类型转换

```java
DataSourceConfig dataSourceConfig = new DataSourceConfig.Builder(URL, USERNAME, PASSWORD)
    .typeConvert((globalConfig, typeRegistry, fieldType) -> {
        // tinyint(1) 映射为 Boolean
        if (fieldType.toLowerCase().contains("tinyint(1)")) {
            return DbColumnType.BOOLEAN;
        }
        return typeRegistry.getColumnType(fieldType);
    })
    .build();
```

### 3. 生成的文件路径问题

```java
// 确保路径正确
String outputDir = System.getProperty("user.dir") + "/src/main/java";
System.out.println("输出目录：" + outputDir);

GlobalConfig globalConfig = new GlobalConfig.Builder()
    .outputDir(outputDir)
    .build();
```

---

## 关键点总结

1. **依赖引入**：需要代码生成器和模板引擎依赖
2. **配置完整**：数据源、全局、包、策略配置缺一不可
3. **模板选择**：Velocity、Freemarker、Beetl 三选一
4. **自定义模板**：复制默认模板修改，满足个性化需求
5. **策略灵活**：支持按表名、前缀、排除等多种策略
6. **父类继承**：配置父类可减少重复代码
7. **版本控制**：使用 Git 管理生成的代码，避免覆盖丢失

---

## 参考资料

- [代码生成器配置](https://baomidou.com/pages/981406/)
- [自定义模板](https://baomidou.com/pages/a2f92d/)
