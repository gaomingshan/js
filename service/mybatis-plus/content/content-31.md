# 14.3 性能调优综合实践

## 概述

性能调优是一个系统工程，需要从数据库设计、SQL 优化、缓存策略、应用架构等多个维度综合考虑。本节通过实战案例，介绍 MyBatis Plus 项目的性能调优完整流程。

**核心内容：**
- 性能问题诊断
- 数据库优化
- 应用层优化
- 监控与持续优化

---

## 性能问题诊断

### 性能监控指标

```java
/**
 * 性能监控指标
 */
@Component
public class PerformanceMonitor {
    
    /**
     * 数据库指标
     */
    public DatabaseMetrics getDatabaseMetrics() {
        DatabaseMetrics metrics = new DatabaseMetrics();
        
        // QPS（每秒查询数）
        metrics.setQps(calculateQps());
        
        // TPS（每秒事务数）
        metrics.setTps(calculateTps());
        
        // 平均响应时间
        metrics.setAvgResponseTime(calculateAvgResponseTime());
        
        // 慢查询数量
        metrics.setSlowQueryCount(getSlowQueryCount());
        
        // 连接池使用率
        metrics.setConnectionPoolUsage(getConnectionPoolUsage());
        
        return metrics;
    }
    
    /**
     * 应用指标
     */
    public ApplicationMetrics getApplicationMetrics() {
        ApplicationMetrics metrics = new ApplicationMetrics();
        
        // JVM 内存使用
        metrics.setHeapUsage(getHeapUsage());
        
        // GC 频率
        metrics.setGcFrequency(getGcFrequency());
        
        // 线程池使用率
        metrics.setThreadPoolUsage(getThreadPoolUsage());
        
        // 缓存命中率
        metrics.setCacheHitRate(getCacheHitRate());
        
        return metrics;
    }
}
```

### 问题定位流程

```
性能问题定位流程：
1. 收集监控数据（QPS、响应时间、错误率）
2. 分析日志（慢查询日志、异常日志）
3. 定位瓶颈（数据库、网络、应用）
4. 制定优化方案
5. 验证优化效果
6. 持续监控
```

---

## 实战案例：电商订单系统优化

### 问题描述

```
场景：电商订单列表查询
问题：
- 高峰期响应时间超过5秒
- 数据库CPU使用率达到90%
- 部分用户反馈页面卡顿

初步分析：
- 订单表数据量：500万
- 关联查询：订单+用户+商品
- 分页查询深度大
```

### 优化前的代码

```java
/**
 * 优化前：订单列表查询
 */
@Service
public class OrderServiceBefore {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ProductService productService;
    
    /**
     * 分页查询订单列表
     */
    public Page<OrderVO> pageList(OrderQueryDTO dto) {
        // 1. 查询订单（SELECT *）
        Page<Order> orderPage = orderMapper.selectPage(
            new Page<>(dto.getCurrent(), dto.getSize()),
            new QueryWrapper<Order>()
                .eq(dto.getStatus() != null, "status", dto.getStatus())
                .like(dto.getOrderNo() != null, "order_no", dto.getOrderNo())
                .orderByDesc("create_time")
        );
        
        List<Order> orders = orderPage.getRecords();
        
        // 2. N+1 查询用户和商品信息
        List<OrderVO> voList = orders.stream()
            .map(order -> {
                OrderVO vo = new OrderVO();
                BeanUtils.copyProperties(order, vo);
                
                // 每次查询数据库
                User user = userService.getById(order.getUserId());
                vo.setUserName(user.getName());
                
                // 每次查询数据库
                Product product = productService.getById(order.getProductId());
                vo.setProductName(product.getName());
                
                return vo;
            })
            .collect(Collectors.toList());
        
        Page<OrderVO> result = new Page<>(dto.getCurrent(), dto.getSize());
        result.setTotal(orderPage.getTotal());
        result.setRecords(voList);
        
        return result;
    }
}

// 性能问题：
// 1. SELECT * 查询所有字段
// 2. N+1 查询（10条订单 = 1+10+10 = 21次查询）
// 3. 深分页性能差
// 4. 无缓存
```

### 优化步骤

#### 步骤1：数据库优化

```sql
-- 1. 添加索引
CREATE INDEX idx_status_create_time ON `order`(status, create_time);
CREATE INDEX idx_user_id ON `order`(user_id);
CREATE INDEX idx_product_id ON `order`(product_id);

-- 2. 优化表结构（冗余字段）
ALTER TABLE `order` 
ADD COLUMN user_name VARCHAR(50) COMMENT '用户名（冗余）',
ADD COLUMN product_name VARCHAR(100) COMMENT '商品名（冗余）';

-- 3. 定时同步冗余字段
```

#### 步骤2：SQL 优化

```java
/**
 * 优化：只查询需要的字段
 */
@Mapper
public interface OrderMapper extends BaseMapper<Order> {
    
    /**
     * 优化的分页查询
     */
    @Select("<script>" +
            "SELECT " +
            "  id, order_no, user_id, user_name, " +
            "  product_id, product_name, amount, status, create_time " +
            "FROM `order` " +
            "<where>" +
            "  <if test='query.status != null'>" +
            "    AND status = #{query.status}" +
            "  </if>" +
            "  <if test='query.orderNo != null'>" +
            "    AND order_no LIKE CONCAT('%', #{query.orderNo}, '%')" +
            "  </if>" +
            "</where>" +
            "ORDER BY create_time DESC" +
            "</script>")
    Page<OrderVO> selectPageOptimized(Page<?> page, @Param("query") OrderQueryDTO query);
}
```

#### 步骤3：避免 N+1 查询

```java
/**
 * 优化：批量查询关联数据
 */
@Service
public class OrderServiceOptimized {
    
    public Page<OrderVO> pageList(OrderQueryDTO dto) {
        // 1. 只查询必要字段
        Page<OrderVO> page = new Page<>(dto.getCurrent(), dto.getSize());
        Page<OrderVO> result = orderMapper.selectPageOptimized(page, dto);
        
        List<OrderVO> orders = result.getRecords();
        if (CollectionUtils.isEmpty(orders)) {
            return result;
        }
        
        // 2. 如果冗余字段为空，批量查询补充
        Set<Long> userIds = new HashSet<>();
        Set<Long> productIds = new HashSet<>();
        
        for (OrderVO order : orders) {
            if (StringUtils.isBlank(order.getUserName())) {
                userIds.add(order.getUserId());
            }
            if (StringUtils.isBlank(order.getProductName())) {
                productIds.add(order.getProductId());
            }
        }
        
        // 批量查询（2次查询代替N次）
        Map<Long, User> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            userMap = userService.listByIds(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        }
        
        Map<Long, Product> productMap = new HashMap<>();
        if (!productIds.isEmpty()) {
            productMap = productService.listByIds(productIds)
                .stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        }
        
        // 填充数据
        for (OrderVO order : orders) {
            if (StringUtils.isBlank(order.getUserName())) {
                User user = userMap.get(order.getUserId());
                order.setUserName(user != null ? user.getName() : null);
            }
            if (StringUtils.isBlank(order.getProductName())) {
                Product product = productMap.get(order.getProductId());
                order.setProductName(product != null ? product.getName() : null);
            }
        }
        
        return result;
    }
}
```

#### 步骤4：深分页优化

```java
/**
 * 优化：深分页处理
 */
@Service
public class OrderServiceOptimized {
    
    public Page<OrderVO> pageList(OrderQueryDTO dto) {
        // 限制最大页码
        int maxPage = 1000;
        if (dto.getCurrent() > maxPage) {
            throw new BusinessException("最多只能查询前1000页");
        }
        
        // 使用子查询优化深分页
        if (dto.getCurrent() > 100) {
            return pageListWithSubQuery(dto);
        }
        
        // 正常分页
        return pageListNormal(dto);
    }
    
    private Page<OrderVO> pageListWithSubQuery(OrderQueryDTO dto) {
        // 先查询 ID
        long offset = (dto.getCurrent() - 1) * dto.getSize();
        List<Long> ids = orderMapper.selectIdsByOffset(offset, dto.getSize(), dto);
        
        if (CollectionUtils.isEmpty(ids)) {
            return new Page<>();
        }
        
        // 再查询详情
        List<OrderVO> orders = orderMapper.selectByIds(ids);
        
        Page<OrderVO> page = new Page<>(dto.getCurrent(), dto.getSize());
        page.setRecords(orders);
        
        return page;
    }
}
```

#### 步骤5：添加缓存

```java
/**
 * 优化：添加 Redis 缓存
 */
@Service
@CacheConfig(cacheNames = "order")
public class OrderServiceOptimized {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 分页查询（带缓存）
     */
    public Page<OrderVO> pageList(OrderQueryDTO dto) {
        // 只缓存前3页
        if (dto.getCurrent() <= 3) {
            return pageListWithCache(dto);
        }
        
        return pageListNormal(dto);
    }
    
    private Page<OrderVO> pageListWithCache(OrderQueryDTO dto) {
        String cacheKey = "page:" + dto.hashCode();
        
        // 查询缓存
        Page<OrderVO> cachedPage = (Page<OrderVO>) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedPage != null) {
            log.info("缓存命中：{}", cacheKey);
            return cachedPage;
        }
        
        // 查询数据库
        Page<OrderVO> page = pageListNormal(dto);
        
        // 写入缓存（5分钟）
        redisTemplate.opsForValue().set(cacheKey, page, 5, TimeUnit.MINUTES);
        
        return page;
    }
}
```

### 优化效果

```java
/**
 * 性能对比测试
 */
@SpringBootTest
public class PerformanceComparisonTest {
    
    @Test
    public void comparePerformance() {
        OrderQueryDTO dto = new OrderQueryDTO();
        dto.setCurrent(1);
        dto.setSize(10);
        
        // 优化前
        long start1 = System.currentTimeMillis();
        Page<OrderVO> result1 = orderServiceBefore.pageList(dto);
        long end1 = System.currentTimeMillis();
        System.out.println("优化前：" + (end1 - start1) + "ms");  // 约5000ms
        
        // 优化后
        long start2 = System.currentTimeMillis();
        Page<OrderVO> result2 = orderServiceOptimized.pageList(dto);
        long end2 = System.currentTimeMillis();
        System.out.println("优化后：" + (end2 - start2) + "ms");  // 约50ms
        
        // 性能提升：100倍
    }
}
```

| 优化项 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 响应时间 | 5000ms | 50ms | 100倍 |
| 数据库查询次数 | 21次 | 1-3次 | 7-21倍 |
| CPU使用率 | 90% | 20% | 降低70% |
| 缓存命中率 | 0% | 80% | +80% |

---

## 性能优化检查清单

### 数据库层面

```markdown
数据库优化检查清单：

□ 索引设计
  - WHERE 条件字段是否有索引
  - ORDER BY 字段是否有索引
  - JOIN 关联字段是否有索引
  - 是否存在冗余索引

□ 表结构设计
  - 字段类型是否合理
  - 是否需要垂直拆分
  - 是否需要水平分表
  - 是否有合理的冗余字段

□ SQL 优化
  - 是否避免 SELECT *
  - 是否避免 N+1 查询
  - 是否合理使用 LIMIT
  - 是否避免函数索引失效

□ 连接池配置
  - 连接数是否合理
  - 超时时间是否合理
  - 连接验证是否开启
```

### 应用层面

```markdown
应用优化检查清单：

□ 缓存策略
  - 热点数据是否缓存
  - 缓存过期时间是否合理
  - 是否有缓存预热
  - 是否有缓存降级方案

□ 批量操作
  - 是否使用批量插入
  - 是否使用批量更新
  - 批量大小是否合理
  - 是否分批提交事务

□ 查询优化
  - 是否只查询需要的字段
  - 是否避免深分页
  - 是否有合理的查询条件
  - 是否使用分页查询

□ 代码优化
  - 是否避免循环查询数据库
  - 是否合理使用线程池
  - 是否有资源泄漏
  - 是否有死锁风险
```

---

## 持续优化

### 性能监控告警

```java
/**
 * 性能告警
 */
@Component
public class PerformanceAlert {
    
    @Scheduled(cron = "*/5 * * * * ?")  // 每5秒检查
    public void checkPerformance() {
        DatabaseMetrics metrics = performanceMonitor.getDatabaseMetrics();
        
        // 响应时间告警
        if (metrics.getAvgResponseTime() > 1000) {
            sendAlert("响应时间过长：" + metrics.getAvgResponseTime() + "ms");
        }
        
        // CPU 使用率告警
        if (metrics.getCpuUsage() > 80) {
            sendAlert("CPU使用率过高：" + metrics.getCpuUsage() + "%");
        }
        
        // 慢查询告警
        if (metrics.getSlowQueryCount() > 10) {
            sendAlert("慢查询数量过多：" + metrics.getSlowQueryCount());
        }
    }
    
    private void sendAlert(String message) {
        // 发送钉钉/邮件/短信告警
        log.error("性能告警：{}", message);
    }
}
```

### 性能测试

```java
/**
 * 性能压测
 */
@SpringBootTest
public class LoadTest {
    
    @Test
    public void loadTest() throws Exception {
        int threadCount = 100;
        int requestPerThread = 1000;
        
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicLong totalTime = new AtomicLong(0);
        AtomicInteger errorCount = new AtomicInteger(0);
        
        for (int i = 0; i < threadCount; i++) {
            new Thread(() -> {
                try {
                    for (int j = 0; j < requestPerThread; j++) {
                        long start = System.currentTimeMillis();
                        
                        try {
                            orderService.pageList(new OrderQueryDTO());
                        } catch (Exception e) {
                            errorCount.incrementAndGet();
                        }
                        
                        long end = System.currentTimeMillis();
                        totalTime.addAndGet(end - start);
                    }
                } finally {
                    latch.countDown();
                }
            }).start();
        }
        
        latch.await();
        
        int totalRequest = threadCount * requestPerThread;
        long avgTime = totalTime.get() / totalRequest;
        
        System.out.println("总请求数：" + totalRequest);
        System.out.println("平均响应时间：" + avgTime + "ms");
        System.out.println("错误数：" + errorCount.get());
        System.out.println("错误率：" + (errorCount.get() * 100.0 / totalRequest) + "%");
    }
}
```

---

## 关键点总结

1. **问题诊断**：收集监控数据，分析日志，定位瓶颈
2. **数据库优化**：索引、表结构、SQL优化
3. **应用优化**：避免N+1、批量操作、合理分页
4. **缓存策略**：热点数据缓存、合理过期时间
5. **深分页优化**：限制页码、子查询、游标分页
6. **持续监控**：性能指标监控、告警机制
7. **压力测试**：定期压测，验证优化效果

---

## 参考资料

- [MySQL 性能优化](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [MyBatis Plus 最佳实践](https://baomidou.com/pages/49cc81/)
