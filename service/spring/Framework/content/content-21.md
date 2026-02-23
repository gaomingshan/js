# 第 21 章：Resource 资源抽象

> **学习目标**：掌握 Spring 资源访问抽象机制  
> **预计时长**：1.5 小时  
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

Spring 提供了统一的**资源访问接口**，屏蔽底层资源访问的差异。

**资源类型**：
- 类路径资源（ClassPath）
- 文件系统资源（File）
- URL资源（HTTP/FTP）
- ServletContext资源（Web）

---

## 2. Resource 接口

```java
public interface Resource extends InputStreamSource {
    boolean exists();
    boolean isReadable();
    boolean isOpen();
    boolean isFile();
    URL getURL() throws IOException;
    URI getURI() throws IOException;
    File getFile() throws IOException;
    ReadableByteChannel readableChannel() throws IOException;
    long contentLength() throws IOException;
    long lastModified() throws IOException;
    Resource createRelative(String relativePath) throws IOException;
    String getFilename();
    String getDescription();
}
```

---

## 3. Resource 实现类

### 3.1 ClassPathResource

```java
// 加载类路径资源
Resource resource = new ClassPathResource("config/application.properties");
InputStream is = resource.getInputStream();
```

### 3.2 FileSystemResource

```java
// 加载文件系统资源
Resource resource = new FileSystemResource("/data/config.xml");
```

### 3.3 UrlResource

```java
// 加载 URL 资源
Resource resource = new UrlResource("https://example.com/data.json");
```

---

## 4. ResourceLoader

```java
public interface ResourceLoader {
    Resource getResource(String location);
    ClassLoader getClassLoader();
}

// 使用
@Autowired
private ResourceLoader resourceLoader;

public void loadResource() {
    Resource resource = resourceLoader.getResource("classpath:config.properties");
    // 或
    Resource resource = resourceLoader.getResource("file:/data/config.xml");
    // 或
    Resource resource = resourceLoader.getResource("https://example.com/data.json");
}
```

---

## 5. 应用场景

### 场景 1：加载配置文件

```java
@Component
public class ConfigLoader {
    @Autowired
    private ResourceLoader resourceLoader;
    
    public Properties loadConfig() throws IOException {
        Resource resource = resourceLoader.getResource("classpath:application.properties");
        Properties props = new Properties();
        props.load(resource.getInputStream());
        return props;
    }
}
```

### 场景 2：模板加载

```java
@Service
public class TemplateService {
    @Autowired
    private ResourceLoader resourceLoader;
    
    public String loadTemplate(String templateName) throws IOException {
        Resource resource = resourceLoader.getResource("classpath:templates/" + templateName);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }
}
```

---

**上一章** ← [第 20 章：视图解析与渲染](./content-20.md)  
**下一章** → [第 22 章：Environment 环境抽象](./content-22.md)  
**返回目录** → [学习大纲](../content-outline.md)
