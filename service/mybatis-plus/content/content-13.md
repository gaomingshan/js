# 6.2 企业级代码生成实践

## 概述

在企业级项目中，代码生成器不仅要能生成基础代码，还需要考虑代码规范、团队协作、版本管理等因素。本节介绍企业级代码生成的最佳实践。

**核心内容：**
- 统一代码风格与规范
- 自定义字段类型映射
- 多模块项目生成
- 增量生成与版本管理

---

## 统一代码风格与规范

### 基础实体类设计

```java
/**
 * 基础实体类
 */
@Data
public abstract class BaseEntity implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    /**
     * 创建人ID
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;
    
    /**
     * 更新人ID
     */
    @TableField(fill = FieldFill.UPDATE)
    private Long updateBy;
    
    /**
     * 逻辑删除标记
     */
    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;
}
```

### 代码生成配置

```java
public class EnterpriseCodeGenerator {
    
    public static void main(String[] args) {
        // 数据源配置
        DataSourceConfig dataSourceConfig = buildDataSourceConfig();
        
        // 全局配置
        GlobalConfig globalConfig = buildGlobalConfig();
        
        // 包配置
        PackageConfig packageConfig = buildPackageConfig();
        
        // 策略配置
        StrategyConfig strategyConfig = buildStrategyConfig();
        
        // 模板配置
        TemplateConfig templateConfig = buildTemplateConfig();
        
        // 执行生成
        AutoGenerator autoGenerator = new AutoGenerator(dataSourceConfig);
        autoGenerator.global(globalConfig);
        autoGenerator.packageInfo(packageConfig);
        autoGenerator.strategy(strategyConfig);
        autoGenerator.template(templateConfig);
        autoGenerator.execute();
    }
    
    private static StrategyConfig buildStrategyConfig() {
        return new StrategyConfig.Builder()
            .addInclude(getTables())
            .addTablePrefix("t_", "sys_")
            
            // Entity 策略
            .entityBuilder()
                .superClass(BaseEntity.class)  // 继承基础实体类
                .addSuperEntityColumns(
                    "id", 
                    "create_time", 
                    "update_time", 
                    "create_by", 
                    "update_by", 
                    "deleted"
                )
                .enableLombok()
                .enableChainModel()              // 启用链式模型
                .enableTableFieldAnnotation()
                .logicDeleteColumnName("deleted")
                .addTableFills(
                    new Column("create_time", FieldFill.INSERT),
                    new Column("update_time", FieldFill.INSERT_UPDATE),
                    new Column("create_by", FieldFill.INSERT),
                    new Column("update_by", FieldFill.UPDATE),
                    new Column("deleted", FieldFill.INSERT)
                )
                .idType(IdType.ASSIGN_ID)
                .formatFileName("%s")
            
            // Mapper 策略
            .mapperBuilder()
                .enableMapperAnnotation()
                .enableBaseResultMap()
                .enableBaseColumnList()
                .formatMapperFileName("%sMapper")
                .formatXmlFileName("%sMapper")
            
            // Service 策略
            .serviceBuilder()
                .formatServiceFileName("I%sService")  // 接口名前缀 I
                .formatServiceImplFileName("%sServiceImpl")
            
            // Controller 策略
            .controllerBuilder()
                .superClass(BaseController.class)  // 继承基础控制器
                .enableRestStyle()
                .enableHyphenStyle()
                .formatFileName("%sController")
            
            .build();
    }
    
    private static String[] getTables() {
        // 从配置文件或命令行参数获取表名
        return new String[]{"user", "role", "dept"};
    }
}
```

### 基础控制器

```java
/**
 * 基础控制器
 */
public abstract class BaseController {
    
    /**
     * 成功响应
     */
    protected <T> Result<T> success(T data) {
        return Result.success(data);
    }
    
    /**
     * 失败响应
     */
    protected <T> Result<T> fail(String message) {
        return Result.fail(message);
    }
    
    /**
     * 获取当前用户ID
     */
    protected Long getCurrentUserId() {
        // 从 Security Context 或 Session 获取
        return SecurityUtils.getUserId();
    }
    
    /**
     * 分页参数校验
     */
    protected void validatePageParams(Integer current, Integer size) {
        if (current == null || current < 1) {
            throw new BusinessException("页码不能小于1");
        }
        if (size == null || size < 1 || size > 500) {
            throw new BusinessException("每页条数必须在1-500之间");
        }
    }
}
```

---

## 自定义字段类型映射

### 类型转换器

```java
/**
 * 自定义类型转换器
 */
public class CustomTypeConvert implements ITypeConvert {
    
    @Override
    public IColumnType processTypeConvert(GlobalConfig config, String fieldType) {
        String lowerFieldType = fieldType.toLowerCase();
        
        // tinyint(1) 映射为 Boolean
        if (lowerFieldType.contains("tinyint(1)")) {
            return DbColumnType.BOOLEAN;
        }
        
        // decimal 映射为 BigDecimal
        if (lowerFieldType.contains("decimal")) {
            return DbColumnType.BIG_DECIMAL;
        }
        
        // datetime 映射为 LocalDateTime
        if (lowerFieldType.contains("datetime")) {
            return DbColumnType.LOCAL_DATE_TIME;
        }
        
        // date 映射为 LocalDate
        if (lowerFieldType.contains("date")) {
            return DbColumnType.LOCAL_DATE;
        }
        
        // time 映射为 LocalTime
        if (lowerFieldType.contains("time")) {
            return DbColumnType.LOCAL_TIME;
        }
        
        // json 类型映射为 String（或自定义类型）
        if (lowerFieldType.contains("json")) {
            return DbColumnType.STRING;
        }
        
        // 默认处理
        return getDefaultTypeConvert().processTypeConvert(config, fieldType);
    }
    
    private ITypeConvert getDefaultTypeConvert() {
        return new MySqlTypeConvert();
    }
}
```

### 使用自定义类型转换器

```java
DataSourceConfig dataSourceConfig = new DataSourceConfig.Builder(URL, USERNAME, PASSWORD)
    .typeConvert(new CustomTypeConvert())
    .build();
```

### JSON 字段处理

```java
/**
 * JSON 类型字段的 TypeHandler
 */
public class JsonTypeHandler extends BaseTypeHandler<Object> {
    
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, 
                                     Object parameter, JdbcType jdbcType) 
            throws SQLException {
        ps.setString(i, JSON.toJSONString(parameter));
    }
    
    @Override
    public Object getNullableResult(ResultSet rs, String columnName) 
            throws SQLException {
        String json = rs.getString(columnName);
        return StringUtils.isBlank(json) ? null : JSON.parse(json);
    }
    
    @Override
    public Object getNullableResult(ResultSet rs, int columnIndex) 
            throws SQLException {
        String json = rs.getString(columnIndex);
        return StringUtils.isBlank(json) ? null : JSON.parse(json);
    }
    
    @Override
    public Object getNullableResult(CallableStatement cs, int columnIndex) 
            throws SQLException {
        String json = cs.getString(columnIndex);
        return StringUtils.isBlank(json) ? null : JSON.parse(json);
    }
}

// 在实体类中使用
@TableField(typeHandler = JsonTypeHandler.class)
private Map<String, Object> extraData;
```

---

## 多模块项目生成

### 项目结构

```
project-root/
├── project-entity/      # 实体模块
├── project-mapper/      # Mapper 模块
├── project-service/     # Service 模块
├── project-controller/  # Controller 模块
└── project-generator/   # 代码生成器模块
```

### 多模块生成配置

```java
public class MultiModuleCodeGenerator {
    
    private static final String PROJECT_ROOT = System.getProperty("user.dir");
    
    public static void main(String[] args) {
        String[] tables = {"user", "role", "dept"};
        generate(tables);
    }
    
    private static void generate(String[] tables) {
        // 数据源配置
        DataSourceConfig dataSourceConfig = buildDataSourceConfig();
        
        // 全局配置
        GlobalConfig globalConfig = new GlobalConfig.Builder()
            .outputDir(PROJECT_ROOT + "/project-entity/src/main/java")
            .author("Your Name")
            .enableSwagger()
            .disableOpenDir()
            .build();
        
        // 包配置（多模块路径）
        Map<OutputFile, String> pathInfo = new HashMap<>();
        pathInfo.put(OutputFile.entity, 
            PROJECT_ROOT + "/project-entity/src/main/java/com/example/entity");
        pathInfo.put(OutputFile.mapper, 
            PROJECT_ROOT + "/project-mapper/src/main/java/com/example/mapper");
        pathInfo.put(OutputFile.xml, 
            PROJECT_ROOT + "/project-mapper/src/main/resources/mapper");
        pathInfo.put(OutputFile.service, 
            PROJECT_ROOT + "/project-service/src/main/java/com/example/service");
        pathInfo.put(OutputFile.serviceImpl, 
            PROJECT_ROOT + "/project-service/src/main/java/com/example/service/impl");
        pathInfo.put(OutputFile.controller, 
            PROJECT_ROOT + "/project-controller/src/main/java/com/example/controller");
        
        PackageConfig packageConfig = new PackageConfig.Builder()
            .parent("com.example")
            .entity("entity")
            .mapper("mapper")
            .service("service")
            .serviceImpl("service.impl")
            .controller("controller")
            .pathInfo(pathInfo)
            .build();
        
        // 策略配置
        StrategyConfig strategyConfig = buildStrategyConfig(tables);
        
        // 执行生成
        AutoGenerator autoGenerator = new AutoGenerator(dataSourceConfig);
        autoGenerator.global(globalConfig);
        autoGenerator.packageInfo(packageConfig);
        autoGenerator.strategy(strategyConfig);
        autoGenerator.execute();
        
        System.out.println("多模块代码生成完成！");
    }
}
```

---

## 增量生成与版本管理

### 增量生成策略

```java
public class IncrementalCodeGenerator {
    
    /**
     * 增量生成：只生成新增的表
     */
    public static void incrementalGenerate() {
        // 1. 获取所有数据库表
        Set<String> allTables = getAllTablesFromDatabase();
        
        // 2. 获取已生成的表（从文件或配置读取）
        Set<String> generatedTables = getGeneratedTables();
        
        // 3. 计算差异（新增的表）
        allTables.removeAll(generatedTables);
        
        if (allTables.isEmpty()) {
            System.out.println("没有新增的表需要生成");
            return;
        }
        
        System.out.println("新增的表：" + allTables);
        
        // 4. 生成新增的表
        generate(allTables.toArray(new String[0]));
        
        // 5. 记录已生成的表
        saveGeneratedTables(allTables);
    }
    
    /**
     * 获取数据库所有表
     */
    private static Set<String> getAllTablesFromDatabase() {
        Set<String> tables = new HashSet<>();
        try (Connection conn = DriverManager.getConnection(URL, USERNAME, PASSWORD)) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"});
            
            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                // 过滤系统表
                if (!tableName.startsWith("sys_") && !tableName.startsWith("qrtz_")) {
                    tables.add(tableName);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("获取数据库表失败", e);
        }
        return tables;
    }
    
    /**
     * 获取已生成的表（从配置文件读取）
     */
    private static Set<String> getGeneratedTables() {
        File file = new File("generated-tables.txt");
        if (!file.exists()) {
            return new HashSet<>();
        }
        
        try {
            return new HashSet<>(Files.readAllLines(file.toPath()));
        } catch (IOException e) {
            return new HashSet<>();
        }
    }
    
    /**
     * 保存已生成的表
     */
    private static void saveGeneratedTables(Set<String> newTables) {
        Set<String> allGenerated = getGeneratedTables();
        allGenerated.addAll(newTables);
        
        try {
            Files.write(
                Paths.get("generated-tables.txt"), 
                allGenerated, 
                StandardOpenOption.CREATE, 
                StandardOpenOption.TRUNCATE_EXISTING
            );
        } catch (IOException e) {
            System.err.println("保存生成记录失败：" + e.getMessage());
        }
    }
}
```

### 版本控制集成

```java
/**
 * 集成 Git 版本控制
 */
public class VersionedCodeGenerator {
    
    /**
     * 生成代码前检查 Git 状态
     */
    public static void generateWithGitCheck(String[] tables) {
        // 1. 检查是否有未提交的更改
        if (hasUncommittedChanges()) {
            System.out.println("警告：工作目录有未提交的更改");
            System.out.println("建议先提交或暂存更改，避免生成的代码覆盖现有修改");
            
            Scanner scanner = new Scanner(System.in);
            System.out.print("是否继续生成？(y/n): ");
            String input = scanner.nextLine();
            
            if (!"y".equalsIgnoreCase(input)) {
                System.out.println("已取消生成");
                return;
            }
        }
        
        // 2. 生成代码
        generate(tables);
        
        // 3. 自动创建 Git 分支
        String branchName = "feature/codegen-" + 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        
        System.out.println("建议创建新分支：" + branchName);
        System.out.print("是否创建并切换到新分支？(y/n): ");
        
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        
        if ("y".equalsIgnoreCase(input)) {
            createAndCheckoutBranch(branchName);
            System.out.println("已切换到分支：" + branchName);
        }
    }
    
    private static boolean hasUncommittedChanges() {
        try {
            Process process = Runtime.getRuntime().exec("git status --porcelain");
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );
            return reader.readLine() != null;
        } catch (IOException e) {
            return false;
        }
    }
    
    private static void createAndCheckoutBranch(String branchName) {
        try {
            Runtime.getRuntime().exec("git checkout -b " + branchName).waitFor();
        } catch (Exception e) {
            System.err.println("创建分支失败：" + e.getMessage());
        }
    }
}
```

---

## 自定义字段注释增强

### 从数据库注释生成详细文档

```java
/**
 * 自定义注入配置
 */
public class CustomInjectionConfig {
    
    public static InjectionConfig build() {
        return new InjectionConfig.Builder()
            .customMap(buildCustomMap())
            .customFile(buildCustomFiles())
            .build();
    }
    
    /**
     * 自定义参数
     */
    private static Map<String, Object> buildCustomMap() {
        Map<String, Object> customMap = new HashMap<>();
        customMap.put("projectName", "企业管理系统");
        customMap.put("version", "1.0.0");
        customMap.put("copyright", "Copyright © 2024");
        return customMap;
    }
    
    /**
     * 自定义文件（生成 DTO、VO 等）
     */
    private static Map<String, String> buildCustomFiles() {
        Map<String, String> customFiles = new HashMap<>();
        
        // DTO 模板
        customFiles.put("DTO.java", "/templates/dto.java.vm");
        
        // VO 模板
        customFiles.put("VO.java", "/templates/vo.java.vm");
        
        // Query DTO 模板
        customFiles.put("QueryDTO.java", "/templates/queryDto.java.vm");
        
        return customFiles;
    }
}
```

### DTO 模板示例

```velocity
## dto.java.vm
package ${package.Parent}.dto;

import lombok.Data;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import javax.validation.constraints.*;
import java.io.Serializable;
#foreach($pkg in ${table.importPackages})
import ${pkg};
#end

/**
 * ${table.comment!} DTO
 *
 * @author ${author}
 * @since ${date}
 */
@Data
@ApiModel(value = "${entity}DTO", description = "${table.comment!}数据传输对象")
public class ${entity}DTO implements Serializable {

    private static final long serialVersionUID = 1L;

#foreach($field in ${table.fields})
#if(!${field.keyFlag} && !${field.name}.equals("create_time") && !${field.name}.equals("update_time") && !${field.name}.equals("deleted"))
    /**
     * ${field.comment}
     */
    @ApiModelProperty(value = "${field.comment}")
#if(${field.propertyType} == "String")
    @NotBlank(message = "${field.comment}不能为空")
    @Length(max = 255, message = "${field.comment}长度不能超过255")
#elseif(${field.propertyType} == "Integer" || ${field.propertyType} == "Long")
    @NotNull(message = "${field.comment}不能为空")
#end
    private ${field.propertyType} ${field.propertyName};

#end
#end
}
```

---

## 配置文件化管理

### generator-config.yaml

```yaml
# 代码生成器配置
generator:
  # 数据源配置
  datasource:
    url: jdbc:mysql://localhost:3306/test_db
    username: root
    password: password
    driver: com.mysql.cj.jdbc.Driver
  
  # 全局配置
  global:
    output-dir: src/main/java
    author: Your Name
    enable-swagger: true
    date-type: TIME_PACK
  
  # 包配置
  package:
    parent: com.example
    module-name: system
    entity: entity
    mapper: mapper
    service: service
    service-impl: service.impl
    controller: controller
  
  # 策略配置
  strategy:
    # 表配置
    table:
      include:
        - user
        - role
        - dept
      prefix:
        - t_
        - sys_
    
    # Entity 配置
    entity:
      super-class: com.example.common.BaseEntity
      super-columns:
        - id
        - create_time
        - update_time
        - deleted
      enable-lombok: true
      enable-chain-model: true
      logic-delete-column: deleted
      id-type: ASSIGN_ID
    
    # Mapper 配置
    mapper:
      enable-mapper-annotation: true
      enable-base-result-map: true
    
    # Service 配置
    service:
      service-name-prefix: I
      service-impl-suffix: ServiceImpl
    
    # Controller 配置
    controller:
      super-class: com.example.common.BaseController
      enable-rest-style: true
```

### 读取配置文件

```java
/**
 * 从配置文件读取配置
 */
public class ConfigFileCodeGenerator {
    
    public static void generate() {
        // 读取配置文件
        GeneratorConfig config = loadConfig("generator-config.yaml");
        
        // 构建配置
        DataSourceConfig dataSourceConfig = buildDataSourceConfig(config);
        GlobalConfig globalConfig = buildGlobalConfig(config);
        PackageConfig packageConfig = buildPackageConfig(config);
        StrategyConfig strategyConfig = buildStrategyConfig(config);
        
        // 执行生成
        AutoGenerator autoGenerator = new AutoGenerator(dataSourceConfig);
        autoGenerator.global(globalConfig);
        autoGenerator.packageInfo(packageConfig);
        autoGenerator.strategy(strategyConfig);
        autoGenerator.execute();
    }
    
    private static GeneratorConfig loadConfig(String configFile) {
        try {
            Yaml yaml = new Yaml();
            InputStream inputStream = ConfigFileCodeGenerator.class
                .getClassLoader()
                .getResourceAsStream(configFile);
            
            return yaml.loadAs(inputStream, GeneratorConfig.class);
        } catch (Exception e) {
            throw new RuntimeException("加载配置文件失败", e);
        }
    }
}
```

---

## 关键点总结

1. **统一规范**：使用基础实体类和基础控制器，保证代码风格一致
2. **类型映射**：自定义类型转换器，处理特殊字段类型
3. **多模块支持**：配置不同模块的输出路径
4. **增量生成**：记录已生成的表，避免重复生成
5. **版本控制**：集成 Git，生成前检查状态
6. **配置化**：使用配置文件管理生成器配置
7. **扩展生成**：生成 DTO、VO 等扩展类

---

## 参考资料

- [企业级开发规范](https://alibaba.github.io/p3c/)
- [代码生成器最佳实践](https://baomidou.com/pages/981406/)
