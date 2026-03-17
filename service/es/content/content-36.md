# Repository 模式与基本 CRUD

## 概述

ElasticsearchRepository 是 Spring Data 提供的数据访问接口，遵循 Repository 设计模式，提供了简洁的 CRUD 操作和查询方法。

## ElasticsearchRepository 接口

### 接口继承关系

```
ElasticsearchRepository<T, ID>
    ↓
PagingAndSortingRepository<T, ID>
    ↓
CrudRepository<T, ID>
    ↓
Repository<T, ID>
```

### 核心方法

```java
public interface ElasticsearchRepository<T, ID> 
    extends PagingAndSortingRepository<T, ID> {
    
    // 保存操作
    <S extends T> S save(S entity);
    <S extends T> Iterable<S> saveAll(Iterable<S> entities);
    
    // 查询操作
    Optional<T> findById(ID id);
    boolean existsById(ID id);
    Iterable<T> findAll();
    Iterable<T> findAllById(Iterable<ID> ids);
    long count();
    
    // 删除操作
    void deleteById(ID id);
    void delete(T entity);
    void deleteAllById(Iterable<? extends ID> ids);
    void deleteAll(Iterable<? extends T> entities);
    void deleteAll();
    
    // 分页和排序
    Page<T> findAll(Pageable pageable);
    Iterable<T> findAll(Sort sort);
    
    // 搜索操作
    <S extends T> S index(S entity);
    Iterable<T> search(Query query);
    Page<T> search(Query query, Pageable pageable);
    
    // 刷新
    void refresh();
}
```

## 实体映射注解

### @Document 注解

```java
@Data
@Document(indexName = "products", createIndex = true)
public class Product {
    
    @Id
    private String id;
    
    private String name;
    private Double price;
    private String category;
    private Date createdAt;
}
```

**@Document 参数**：
- **indexName**：索引名称
- **createIndex**：是否自动创建索引（默认 true）
- **versionType**：版本类型
- **shards**：主分片数（默认 1）
- **replicas**：副本数（默认 1）
- **refreshInterval**：刷新间隔（默认 "1s"）
- **dynamic**：动态映射（默认 TRUE）

### @Id 注解

```java
@Data
@Document(indexName = "products")
public class Product {
    
    @Id
    private String id;  // 对应 ES 的 _id
    
    private String name;
}
```

**特点**：
- 标识文档 ID
- 类型可以是 String、Long、Integer
- 保存时如果为空，ES 自动生成

### @Field 注解

```java
@Data
@Document(indexName = "products")
public class Product {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String name;
    
    @Field(type = FieldType.Keyword)
    private String category;
    
    @Field(type = FieldType.Double)
    private Double price;
    
    @Field(type = FieldType.Integer)
    private Integer stock;
    
    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private Date createdAt;
    
    @Field(type = FieldType.Boolean)
    private Boolean active;
    
    @Field(type = FieldType.Nested)
    private List<Tag> tags;
}
```

**@Field 参数**：
- **type**：字段类型（Text、Keyword、Date、Integer、Double、Boolean、Nested、Object）
- **analyzer**：分词器（index 时使用）
- **searchAnalyzer**：搜索分词器
- **format**：日期格式
- **store**：是否存储
- **index**：是否索引
- **name**：字段名（默认使用属性名）

### 多字段映射

```java
@Data
@Document(indexName = "products")
public class Product {
    
    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "ik_max_word"),
        otherFields = {
            @InnerField(suffix = "keyword", type = FieldType.Keyword),
            @InnerField(suffix = "pinyin", type = FieldType.Text, analyzer = "pinyin")
        }
    )
    private String name;
}

// 查询时使用
// name -> 全文搜索
// name.keyword -> 精确匹配
// name.pinyin -> 拼音搜索
```

### 嵌套对象

```java
@Data
@Document(indexName = "products")
public class Product {
    
    @Id
    private String id;
    
    private String name;
    
    @Field(type = FieldType.Nested)
    private List<Comment> comments;
}

@Data
public class Comment {
    
    @Field(type = FieldType.Text)
    private String content;
    
    @Field(type = FieldType.Keyword)
    private String author;
    
    @Field(type = FieldType.Date)
    private Date createdAt;
}
```

## 基本 CRUD 操作

### 创建 Repository

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
}
```

### 保存文档

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    // 保存单个文档
    public Product save(Product product) {
        product.setCreatedAt(new Date());
        return repository.save(product);
    }
    
    // 批量保存
    public List<Product> saveAll(List<Product> products) {
        return (List<Product>) repository.saveAll(products);
    }
    
    // 保存或更新
    public Product saveOrUpdate(Product product) {
        if (product.getId() != null) {
            // 更新
            Optional<Product> existing = repository.findById(product.getId());
            if (existing.isPresent()) {
                Product updated = existing.get();
                updated.setName(product.getName());
                updated.setPrice(product.getPrice());
                return repository.save(updated);
            }
        }
        // 新建
        return repository.save(product);
    }
}
```

### 查询文档

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    // 根据 ID 查询
    public Product findById(String id) {
        return repository.findById(id).orElse(null);
    }
    
    // 查询所有
    public List<Product> findAll() {
        return (List<Product>) repository.findAll();
    }
    
    // 批量查询
    public List<Product> findByIds(List<String> ids) {
        return (List<Product>) repository.findAllById(ids);
    }
    
    // 检查存在
    public boolean exists(String id) {
        return repository.existsById(id);
    }
    
    // 统计数量
    public long count() {
        return repository.count();
    }
}
```

### 更新文档

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    // 更新单个字段
    public Product updatePrice(String id, Double newPrice) {
        Optional<Product> optional = repository.findById(id);
        if (optional.isPresent()) {
            Product product = optional.get();
            product.setPrice(newPrice);
            return repository.save(product);
        }
        return null;
    }
    
    // 更新多个字段
    public Product update(String id, ProductUpdateDTO dto) {
        Optional<Product> optional = repository.findById(id);
        if (optional.isPresent()) {
            Product product = optional.get();
            if (dto.getName() != null) {
                product.setName(dto.getName());
            }
            if (dto.getPrice() != null) {
                product.setPrice(dto.getPrice());
            }
            if (dto.getStock() != null) {
                product.setStock(dto.getStock());
            }
            return repository.save(product);
        }
        return null;
    }
}
```

### 删除文档

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    // 根据 ID 删除
    public void deleteById(String id) {
        repository.deleteById(id);
    }
    
    // 删除对象
    public void delete(Product product) {
        repository.delete(product);
    }
    
    // 批量删除
    public void deleteByIds(List<String> ids) {
        repository.deleteAllById(ids);
    }
    
    // 删除所有
    public void deleteAll() {
        repository.deleteAll();
    }
}
```

## 方法命名查询

### 命名规则

```
findBy + 字段名 + 操作符

支持的操作符：
- 无操作符：相等（findByName）
- Is/Equals：相等
- Between：范围
- LessThan/LessThanEqual：小于/小于等于
- GreaterThan/GreaterThanEqual：大于/大于等于
- Before/After：日期比较
- IsNull/IsNotNull：空值判断
- Like/StartingWith/EndingWith/Containing：模糊查询
- In/NotIn：包含/不包含
- True/False：布尔值
- OrderBy：排序
```

### 基本查询

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
    
    // 精确查询
    List<Product> findByName(String name);
    List<Product> findByCategory(String category);
    
    // 范围查询
    List<Product> findByPriceBetween(Double min, Double max);
    List<Product> findByPriceGreaterThan(Double price);
    List<Product> findByPriceLessThanEqual(Double price);
    
    // 模糊查询
    List<Product> findByNameLike(String name);
    List<Product> findByNameContaining(String keyword);
    List<Product> findByNameStartingWith(String prefix);
    
    // 布尔查询
    List<Product> findByActiveTrue();
    List<Product> findByActiveFalse();
    
    // IN 查询
    List<Product> findByCategoryIn(List<String> categories);
    
    // 排序
    List<Product> findByCategoryOrderByPriceDesc(String category);
    List<Product> findByActiveTrueOrderByCreatedAtDesc();
}
```

### 组合查询

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
    
    // AND 查询
    List<Product> findByNameAndCategory(String name, String category);
    List<Product> findByCategoryAndPriceBetween(
        String category, Double min, Double max
    );
    
    // OR 查询
    List<Product> findByNameOrCategory(String name, String category);
    
    // 复杂组合
    List<Product> findByCategoryAndPriceGreaterThanAndActiveTrue(
        String category, Double price
    );
    
    // 排序组合
    List<Product> findByCategoryAndActiveTrueOrderByPriceAsc(String category);
}
```

### 查询示例

```java
@Service
public class ProductSearchService {
    
    @Autowired
    private ProductRepository repository;
    
    // 按名称查询
    public List<Product> searchByName(String name) {
        return repository.findByName(name);
    }
    
    // 价格范围查询
    public List<Product> searchByPriceRange(Double min, Double max) {
        return repository.findByPriceBetween(min, max);
    }
    
    // 分类查询（排序）
    public List<Product> searchByCategory(String category) {
        return repository.findByCategoryOrderByPriceDesc(category);
    }
    
    // 多条件查询
    public List<Product> searchByCategoryAndPrice(
            String category, Double minPrice) {
        return repository.findByCategoryAndPriceGreaterThanAndActiveTrue(
            category, minPrice
        );
    }
}
```

## 分页与排序

### Pageable 分页

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    // 基本分页
    public Page<Product> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findAll(pageable);
    }
    
    // 分页 + 排序
    public Page<Product> findAllSorted(int page, int size) {
        Pageable pageable = PageRequest.of(
            page, 
            size, 
            Sort.by(Sort.Direction.DESC, "createdAt")
        );
        return repository.findAll(pageable);
    }
    
    // 多字段排序
    public Page<Product> findAllMultiSort(int page, int size) {
        Sort sort = Sort.by(
            Sort.Order.desc("price"),
            Sort.Order.asc("name")
        );
        Pageable pageable = PageRequest.of(page, size, sort);
        return repository.findAll(pageable);
    }
}
```

### Repository 方法分页

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
    
    // 分页查询
    Page<Product> findByCategory(String category, Pageable pageable);
    
    Page<Product> findByPriceBetween(
        Double min, Double max, Pageable pageable
    );
    
    Page<Product> findByActiveTrue(Pageable pageable);
}

// 使用示例
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    public Page<Product> searchByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findByCategory(category, pageable);
    }
}
```

### Sort 排序

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    // 单字段排序
    public List<Product> findAllSorted() {
        Sort sort = Sort.by(Sort.Direction.DESC, "price");
        return (List<Product>) repository.findAll(sort);
    }
    
    // 多字段排序
    public List<Product> findAllMultiSort() {
        Sort sort = Sort.by(
            Sort.Order.desc("price"),
            Sort.Order.asc("name"),
            Sort.Order.desc("createdAt")
        );
        return (List<Product>) repository.findAll(sort);
    }
}
```

## 批量操作优化

### Bulk 保存

```java
@Service
public class ProductBulkService {
    
    @Autowired
    private ProductRepository repository;
    
    // 批量保存（推荐）
    public List<Product> bulkSave(List<Product> products) {
        return (List<Product>) repository.saveAll(products);
    }
    
    // 分批保存（大数据量）
    public void bulkSaveInBatches(List<Product> products, int batchSize) {
        for (int i = 0; i < products.size(); i += batchSize) {
            int end = Math.min(i + batchSize, products.size());
            List<Product> batch = products.subList(i, end);
            repository.saveAll(batch);
        }
    }
}
```

### 使用 ElasticsearchRestTemplate 批量操作

```java
@Service
public class ProductBulkService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    public void bulkIndex(List<Product> products) {
        List<IndexQuery> queries = products.stream()
            .map(product -> new IndexQueryBuilder()
                .withId(product.getId())
                .withObject(product)
                .build())
            .collect(Collectors.toList());
        
        template.bulkIndex(queries, IndexCoordinates.of("products"));
    }
}
```

## 实战：构建完整的数据访问层

### 实体定义

```java
@Data
@Document(indexName = "products", shards = 3, replicas = 1)
public class Product {
    
    @Id
    private String id;
    
    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "ik_max_word"),
        otherFields = {
            @InnerField(suffix = "keyword", type = FieldType.Keyword)
        }
    )
    private String name;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String description;
    
    @Field(type = FieldType.Keyword)
    private String category;
    
    @Field(type = FieldType.Double)
    private Double price;
    
    @Field(type = FieldType.Integer)
    private Integer stock;
    
    @Field(type = FieldType.Boolean)
    private Boolean active;
    
    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private Date createdAt;
    
    @Field(type = FieldType.Keyword)
    private List<String> tags;
}
```

### Repository 接口

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
    
    // 基本查询
    List<Product> findByName(String name);
    List<Product> findByCategory(String category);
    
    // 价格查询
    List<Product> findByPriceBetween(Double min, Double max);
    List<Product> findByPriceGreaterThan(Double price);
    
    // 组合查询
    List<Product> findByCategoryAndPriceBetween(
        String category, Double min, Double max
    );
    
    Page<Product> findByActiveTrue(Pageable pageable);
    
    // 排序查询
    List<Product> findByCategoryOrderByPriceDesc(String category);
    
    // 模糊查询
    List<Product> findByNameContaining(String keyword);
}
```

### Service 层

```java
@Service
@Slf4j
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    // 创建产品
    public Product create(Product product) {
        product.setCreatedAt(new Date());
        product.setActive(true);
        return repository.save(product);
    }
    
    // 更新产品
    public Product update(String id, ProductUpdateDTO dto) {
        Optional<Product> optional = repository.findById(id);
        if (!optional.isPresent()) {
            throw new NotFoundException("Product not found: " + id);
        }
        
        Product product = optional.get();
        BeanUtils.copyProperties(dto, product, getNullPropertyNames(dto));
        return repository.save(product);
    }
    
    // 删除产品
    public void delete(String id) {
        repository.deleteById(id);
    }
    
    // 分页查询
    public Page<Product> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(
            page, size, Sort.by(Sort.Direction.DESC, "createdAt")
        );
        return repository.findAll(pageable);
    }
    
    // 搜索产品
    public List<Product> search(ProductSearchDTO dto) {
        if (dto.getCategory() != null && dto.getMinPrice() != null) {
            return repository.findByCategoryAndPriceGreaterThan(
                dto.getCategory(), dto.getMinPrice()
            );
        }
        if (dto.getKeyword() != null) {
            return repository.findByNameContaining(dto.getKeyword());
        }
        return (List<Product>) repository.findAll();
    }
    
    // 批量导入
    public List<Product> bulkImport(List<Product> products) {
        products.forEach(p -> {
            p.setCreatedAt(new Date());
            p.setActive(true);
        });
        return (List<Product>) repository.saveAll(products);
    }
    
    private String[] getNullPropertyNames(Object source) {
        // 获取空属性名称，用于部分更新
        BeanWrapper src = new BeanWrapperImpl(source);
        PropertyDescriptor[] pds = src.getPropertyDescriptors();
        Set<String> emptyNames = new HashSet<>();
        for (PropertyDescriptor pd : pds) {
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) {
                emptyNames.add(pd.getName());
            }
        }
        return emptyNames.toArray(new String[0]);
    }
}
```

### Controller 层

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @Autowired
    private ProductService service;
    
    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product) {
        return ResponseEntity.ok(service.create(product));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(
            @PathVariable String id,
            @RequestBody ProductUpdateDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping
    public ResponseEntity<Page<Product>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.findAll(page, size));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(ProductSearchDTO dto) {
        return ResponseEntity.ok(service.search(dto));
    }
    
    @PostMapping("/bulk")
    public ResponseEntity<List<Product>> bulkImport(
            @RequestBody List<Product> products) {
        return ResponseEntity.ok(service.bulkImport(products));
    }
}
```

## 总结

**ElasticsearchRepository**：
- 继承 PagingAndSortingRepository
- 提供完整 CRUD 方法
- 支持分页和排序

**实体映射**：
- @Document：索引配置
- @Id：文档 ID
- @Field：字段映射
- 支持嵌套对象

**CRUD 操作**：
- save/saveAll：保存
- findById/findAll：查询
- deleteById/delete：删除
- count/existsById：统计

**方法命名查询**：
- findByXxx：按字段查询
- 支持多种操作符
- 支持组合查询

**分页排序**：
- Pageable：分页参数
- Sort：排序参数
- Page：分页结果

**批量操作**：
- saveAll：批量保存
- 分批处理大数据量
- 使用 Template 优化

**最佳实践**：
- 合理使用注解
- 方法命名规范
- 分页避免深度分页
- 批量操作优化

**下一步**：学习自定义查询与 NativeSearchQuery。
