# Repository 模式与 MongoTemplate

## 概述

Spring Data MongoDB 提供两种主要数据访问方式：Repository 接口（声明式，自动实现）和 MongoTemplate（命令式，灵活控制）。本章详解两种方式的用法与选择原则。

---

## Repository 模式

### 基础 Repository

```java
// 实体类
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String city;
    private Integer age;
    private UserStatus status;
    private LocalDateTime createdAt;
    // getters/setters...
}

// Repository 接口（Spring 自动实现）
public interface UserRepository extends MongoRepository<User, String> {
    // 继承的 CRUD 方法：
    // save(), findById(), findAll(), deleteById(), count(), existsById() ...
}

// 使用
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User create(User user) {
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public void delete(String id) {
        userRepository.deleteById(id);
    }
}
```

### 方法名查询（Query Derivation）

```java
public interface UserRepository extends MongoRepository<User, String> {

    // 等值查询
    List<User> findByCity(String city);
    Optional<User> findByEmail(String email);

    // 条件查询
    List<User> findByAgeGreaterThan(int age);
    List<User> findByAgeBetween(int min, int max);
    List<User> findByCityIn(List<String> cities);
    List<User> findByCityNotIn(List<String> cities);

    // 多条件组合
    List<User> findByCityAndStatus(String city, UserStatus status);
    List<User> findByCityOrStatus(String city, UserStatus status);

    // 排序
    List<User> findByCityOrderByAgeDesc(String city);

    // 存在检查
    boolean existsByEmail(String email);

    // 计数
    long countByCity(String city);

    // 删除
    void deleteByStatus(UserStatus status);
    long deleteByCreatedAtBefore(LocalDateTime date);

    // 分页
    Page<User> findByCity(String city, Pageable pageable);

    // 嵌套字段
    List<User> findByAddressCity(String city);  // address.city
}
```

### @Query 注解（自定义查询）

```java
public interface OrderRepository extends MongoRepository<Order, String> {

    // 自定义 JSON 查询
    @Query("{ 'userId': ?0, 'status': { $in: ?1 } }")
    List<Order> findByUserIdAndStatusIn(String userId, List<String> statuses);

    // 带投影
    @Query(value = "{ 'status': ?0 }",
           fields = "{ 'orderId': 1, 'amount': 1, 'createdAt': 1 }")
    List<Order> findSummaryByStatus(String status);

    // 带排序
    @Query(value = "{ 'userId': ?0 }",
           sort = "{ 'createdAt': -1 }")
    List<Order> findByUserIdSorted(String userId);

    // 使用 SpEL
    @Query("{ 'amount': { $gte: ?0, $lte: ?1 }, 'createdAt': { $gte: ?2 } }")
    Page<Order> findByAmountRangeAndDate(BigDecimal min, BigDecimal max,
                                         LocalDateTime from, Pageable pageable);
}
```

### 分页与排序

```java
// 分页
Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
Page<User> page = userRepository.findByCity("深圳", pageable)

System.out.println("总数: " + page.getTotalElements())
System.out.println("总页数: " + page.getTotalPages())
System.out.println("当前页数据: " + page.getContent())
System.out.println("是否有下一页: " + page.hasNext())

// Slice（不查总数，性能更好）
Slice<User> slice = userRepository.findByCity("深圳",
    PageRequest.of(0, 20, Sort.by("createdAt").descending()))
```

---

## MongoTemplate

### 基础查询

```java
@Service
public class OrderService {

    @Autowired
    private MongoTemplate mongoTemplate;

    // 条件查询
    public List<Order> findPaidOrders(String userId) {
        Query query = new Query()
            .addCriteria(Criteria.where("userId").is(userId)
                .and("status").is("paid")
                .and("amount").gt(100))
            .with(Sort.by(Sort.Direction.DESC, "createdAt"))
            .limit(20)
            .skip(0);

        // 只返回部分字段
        query.fields().include("orderId", "status", "amount", "createdAt").exclude("_id");

        return mongoTemplate.find(query, Order.class);
    }

    // findOne
    public Order findOrder(String orderId) {
        Query query = new Query(Criteria.where("orderId").is(orderId));
        return mongoTemplate.findOne(query, Order.class);
    }

    // 计数
    public long countByStatus(String status) {
        return mongoTemplate.count(
            new Query(Criteria.where("status").is(status)),
            Order.class
        );
    }
}
```

### 更新操作

```java
// updateFirst（更新第一条）
UpdateResult result = mongoTemplate.updateFirst(
    new Query(Criteria.where("orderId").is("ORD001")),
    new Update()
        .set("status", "processing")
        .set("updatedAt", LocalDateTime.now())
        .inc("retryCount", 1),
    Order.class
);

// updateMulti（更新多条）
mongoTemplate.updateMulti(
    new Query(Criteria.where("status").is("pending")
              .and("createdAt").lt(LocalDateTime.now().minusDays(1))),
    new Update().set("status", "expired"),
    Order.class
);

// upsert
mongoTemplate.upsert(
    new Query(Criteria.where("userId").is(userId).and("sku").is(sku)),
    new Update().inc("qty", 1).setOnInsert("createdAt", LocalDateTime.now()),
    Cart.class
);

// findAndModify（原子更新并返回）
Order updated = mongoTemplate.findAndModify(
    new Query(Criteria.where("_id").is(orderId)),
    new Update().set("status", "shipped"),
    FindAndModifyOptions.options().returnNew(true),  // 返回更新后
    Order.class
);
```

### 删除操作

```java
// 删除单条
mongoTemplate.remove(
    new Query(Criteria.where("_id").is(id)),
    Order.class
);

// 删除多条
DeleteResult result = mongoTemplate.remove(
    new Query(Criteria.where("status").is("cancelled")
              .and("createdAt").lt(LocalDateTime.now().minusDays(30))),
    Order.class
);
log.info("删除了 {} 条记录", result.getDeletedCount());
```

---

## Repository vs MongoTemplate 选择原则

```
选择 Repository：
  ✅ 标准 CRUD
  ✅ 简单条件查询（方法名查询）
  ✅ 分页和排序
  ✅ 代码量少，维护成本低

选择 MongoTemplate：
  ✅ 复杂的 Criteria 组合
  ✅ 聚合管道
  ✅ 批量操作
  ✅ 需要精细控制（投影、sort、hint）
  ✅ 动态查询条件

混合使用（推荐）：
  - Repository 处理 80% 的标准查询
  - MongoTemplate 处理 20% 的复杂查询
```

---

## 总结

- Repository 接口方法名自动转换为 MongoDB 查询，零样板代码
- `@Query` 注解支持原生 MongoDB JSON 查询语法
- `Page` 返回总数，`Slice` 不查总数（性能更好）
- MongoTemplate `Criteria` 构建复杂查询，`Update` 构建更新操作
- 生产项目推荐两者混合使用

**下一步**：聚合查询封装与事务支持。
