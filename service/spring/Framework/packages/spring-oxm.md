# Spring OXM 源码指引

> spring-oxm 提供对象-XML 映射（Object-XML Mapping）抽象，支持多种 OXM 框架。

---

## 1. 对象-XML 映射（Marshaller、Unmarshaller）

### 核心接口
- **Marshaller** - 编组器接口（对象 -> XML）
  - `marshal()` - 编组对象到 XML
- **Unmarshaller** - 解组器接口（XML -> 对象）
  - `unmarshal()` - 解组 XML 到对象
- **MimeMarshaller** - MIME 类型编组器
- **MimeUnmarshaller** - MIME 类型解组器

### 设计目的
提供统一的对象-XML 映射抽象，屏蔽不同 OXM 框架的差异。

### 使用限制与风险
- 不同 OXM 框架配置和注解不同
- 性能差异较大（JAXB > Castor > XStream）

---

## 2. 编组与解组

### 编组（Marshal）
将 Java 对象序列化为 XML：
```java
Marshaller marshaller = jaxb2Marshaller;
StringWriter writer = new StringWriter();
marshaller.marshal(object, new StreamResult(writer));
String xml = writer.toString();
```

### 解组（Unmarshal）
将 XML 反序列化为 Java 对象：
```java
Unmarshaller unmarshaller = jaxb2Marshaller;
Object object = unmarshaller.unmarshal(new StreamSource(new StringReader(xml)));
```

### 设计目的
简化 XML 序列化和反序列化操作。

### 使用限制与风险
- 编组和解组需配对使用（同一框架）
- 需处理 XML 解析异常
- 大 XML 文档可能内存溢出

---

## 3. JAXB 集成

### 核心类
- **Jaxb2Marshaller** - JAXB 2.x 编组器/解组器

### 配置示例
```java
@Bean
public Jaxb2Marshaller jaxb2Marshaller() {
    Jaxb2Marshaller marshaller = new Jaxb2Marshaller();
    marshaller.setPackagesToScan("com.example.domain");
    // 或指定类
    marshaller.setClassesToBeBound(User.class, Order.class);
    return marshaller;
}
```

### JAXB 注解
- **@XmlRootElement** - 根元素
- **@XmlElement** - 元素映射
- **@XmlAttribute** - 属性映射
- **@XmlAccessorType** - 访问类型（字段或属性）
- **@XmlType** - 类型定义

### 设计目的
集成 JDK 内置的 JAXB 框架，提供标准化的 XML 映射。

### 使用限制与风险
- JAXB 在 JDK 9+ 需额外依赖（javax.xml.bind:jaxb-api）
- JDK 11+ 完全移除 JAXB，需引入 Jakarta XML Binding
- 注解配置较繁琐

---

## 4. Castor 集成

### 核心类
- **CastorMarshaller** - Castor 编组器/解组器

### 配置示例
```java
@Bean
public CastorMarshaller castorMarshaller() {
    CastorMarshaller marshaller = new CastorMarshaller();
    marshaller.setMappingLocation(new ClassPathResource("mapping.xml"));
    return marshaller;
}
```

### 设计目的
集成 Castor XML 数据绑定框架。

### 使用限制与风险
- Castor 已较少使用，社区不活跃
- 需配置 XML 映射文件

---

## 5. XStream 集成

### 核心类
- **XStreamMarshaller** - XStream 编组器/解组器

### 配置示例
```java
@Bean
public XStreamMarshaller xStreamMarshaller() {
    XStreamMarshaller marshaller = new XStreamMarshaller();
    marshaller.setAliases(Collections.singletonMap("user", User.class));
    marshaller.setAnnotatedClasses(User.class, Order.class);
    return marshaller;
}
```

### XStream 注解
- **@XStreamAlias** - 别名
- **@XStreamImplicit** - 隐式集合
- **@XStreamOmitField** - 忽略字段

### 设计目的
集成 XStream 框架，提供简洁的 XML 映射（无需配置文件）。

### 使用限制与风险
- XStream 默认配置存在安全风险（反序列化漏洞）
- 需配置白名单：`marshaller.setTypePermissions(XStream.NO_REFERENCES)`
- 性能略低于 JAXB

---

## 6. JiBX 集成

### 核心类
- **JibxMarshaller** - JiBX 编组器/解组器

### 设计目的
集成 JiBX 框架（高性能 XML 绑定）。

### 使用限制与风险
- JiBX 需编译时绑定，配置复杂
- 社区不活跃，已较少使用

---

## 7. XMLBeans 集成

### 核心类
- **XmlBeansMarshaller** - XMLBeans 编组器/解组器

### 设计目的
集成 Apache XMLBeans 框架（基于 XML Schema）。

### 使用限制与风险
- 需从 XML Schema 生成 Java 类
- 生成的类较笨重

---

## 8. XML Schema 支持

### Schema 验证
```java
jaxb2Marshaller.setSchema(new ClassPathResource("schema.xsd"));
jaxb2Marshaller.setValidationEventHandler(event -> {
    System.err.println("Validation error: " + event.getMessage());
    return true;
});
```

### 设计目的
在编组/解组时验证 XML 是否符合 Schema 定义。

### 使用限制与风险
- Schema 验证有性能开销
- 验证失败会抛异常
- 需提供正确的 XSD 文件

---

## 9. XML 流处理

### StAX 支持
```java
XMLEventReader reader = XMLInputFactory.newInstance().createXMLEventReader(inputStream);
Object object = unmarshaller.unmarshal(new StaxSource(reader));
```

### 设计目的
支持流式 XML 处理，避免加载整个 XML 文档到内存。

### 使用限制与风险
- 流式处理适合大 XML 文档
- 不支持随机访问
- 代码复杂度较高

---

## 10. XML 校验与转换

### 校验
- 通过 Schema 验证
- 自定义 ValidationEventHandler

### 转换
- XSLT 转换（通过其他工具）
- 对象图转换（自定义 Converter）

### 设计目的
确保 XML 格式正确，支持 XML 转换。

### 使用限制与风险
- 校验失败需妥善处理
- XSLT 转换性能开销大

---

## 11. 使用场景

### Web 服务
- SOAP Web Services（XML 消息体）
- RESTful API（XML 响应）

### 配置文件
- Spring XML 配置
- Maven POM

### 数据交换
- 系统间数据交换（EDI）
- 遗留系统集成

### 设计目的
提供统一的 XML 处理方式，适配不同场景。

### 使用限制与风险
- 现代应用更多使用 JSON
- XML 冗长，传输效率低

---

## 12. 性能优化

### 缓存 Marshaller
- Marshaller 是线程安全的，可单例使用
- 避免频繁创建

### 流式处理
- 大 XML 使用 StAX
- 避免 DOM 解析（内存消耗大）

### Schema 缓存
- 缓存编译后的 Schema

### 设计目的
提升 XML 处理性能，减少资源消耗。

### 使用限制与风险
- 性能优化需根据实际场景调整
- 过度优化可能增加复杂度

---

## 13. 与 Spring MVC 集成

### HttpMessageConverter
```java
@Bean
public MarshallingHttpMessageConverter marshallingHttpMessageConverter(Marshaller marshaller) {
    return new MarshallingHttpMessageConverter(marshaller);
}
```

### Controller 使用
```java
@PostMapping(value = "/users", consumes = "application/xml", produces = "application/xml")
public User createUser(@RequestBody User user) {
    return userService.save(user);
}
```

### 设计目的
在 Spring MVC 中自动处理 XML 请求和响应。

### 使用限制与风险
- 需配置 Accept 和 Content-Type 头
- JSON 已成为主流，XML 使用减少

---

## 📚 总结

spring-oxm 提供了统一的对象-XML 映射抽象：
- **Marshaller/Unmarshaller**：编组和解组接口
- **JAXB 集成**：JDK 标准 XML 绑定（推荐）
- **Castor 集成**：Castor XML 框架
- **XStream 集成**：简洁的 XML 映射
- **JiBX 集成**：高性能 XML 绑定
- **XMLBeans 集成**：基于 Schema 的绑定
- **Schema 验证**：确保 XML 格式正确
- **流式处理**：支持大 XML 文档
- **Spring MVC 集成**：自动处理 XML 请求/响应

虽然 XML 已逐渐被 JSON 替代，但在 SOAP Web Services、配置文件、遗留系统集成等场景仍有应用。
