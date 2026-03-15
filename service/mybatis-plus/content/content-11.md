# 5.2 分页性能优化

## 概述

虽然 MyBatis Plus 分页插件使用简单，但在处理大数据量时仍可能遇到性能瓶颈。本节介绍分页查询的性能优化技巧，帮助开发者应对各种复杂场景。

**核心问题：**
- count 查询性能优化
- 深分页问题
- 游标分页方案
- 缓存策略

---

## count 查询优化

### count 查询的性能问题

```java
// 典型的分页查询
Page<User> page = new Page<>(1, 10);
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getStatus, 1);

Page<User> result = userMapper.selectPage(page, wrapper);

// 实际执行的 SQL：
// 1. SELECT COUNT(*) FROM user WHERE status = 1
// 2. SELECT * FROM user WHERE status = 1 LIMIT 0, 10
```

**问题：** 在大表中，`COUNT(*)` 查询可能非常慢，特别是带有复杂条件时。

### 优化方案1：非首页不查询 count

```java
/**
 * 首页查询 count，后续页不查询
 */
public Page<User> pageQuery(UserQueryDTO dto) {
    Page<User> page = new Page<>(dto.getCurrent(), dto.getSize());
    
    // 非首页不查询 count
    if (dto.getCurrent() > 1) {
        page.setSearchCount(false);
        
        // 从缓存或前端获取总数
        Long total = getCachedTotal(dto);
        if (total != null) {
            page.setTotal(total);
        }
    }
    
    LambdaQueryWrapper<User> wrapper = buildWrapper(dto);
    return userMapper.selectPage(page, wrapper);
}
```

### 优化方案2：使用近似值

```java
/**
 * 大数据量场景：使用近似总数
 */
public Page<User> pageQueryApproximate(UserQueryDTO dto) {
    Page<User> page = new Page<>(dto.getCurrent(), dto.getSize());
    
    if (dto.getCurrent() == 1) {
        // 首页：查询近似值（如只统计前 10000 条）
        LambdaQueryWrapper<User> countWrapper = buildWrapper(dto);
        countWrapper.last("LIMIT 10000");
        
        Long approximateCount = Math.min(
            userMapper.selectCount(countWrapper), 
            10000L
        );
        page.setTotal(approximateCount);
    } else {
        page.setSearchCount(false);
    }
    
    return userMapper.selectPage(page, buildWrapper(dto));
}
```

### 优化方案3：优化 count SQL

```java
/**
 * 自定义 count 查询（去除不必要的 JOIN）
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 自定义分页查询
     */
    @Select("SELECT u.*, d.dept_name FROM user u " +
            "LEFT JOIN dept d ON u.dept_id = d.id " +
            "WHERE u.status = #{status}")
    Page<UserVO> selectUserPage(Page<?> page, @Param("status") Integer status);
    
    /**
     * 对应的 count 查询（去除 JOIN）
     */
    @Select("SELECT COUNT(*) FROM user u WHERE u.status = #{status}")
    Long selectUserCount(@Param("status") Integer status);
}

// Service 层
public Page<UserVO> pageQuery(Integer current, Integer size, Integer status) {
    Page<UserVO> page = new Page<>(current, size);
    
    // 手动查询 count（优化后的 SQL）
    if (current == 1) {
        Long count = baseMapper.selectUserCount(status);
        page.setTotal(count);
    } else {
        page.setSearchCount(false);
    }
    
    return baseMapper.selectUserPage(page, status);
}
```

### 优化方案4：使用 Redis 缓存 count

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String COUNT_CACHE_KEY = "user:count:";
    private static final int COUNT_CACHE_EXPIRE = 300; // 5分钟
    
    public Page<User> pageQuery(UserQueryDTO dto) {
        Page<User> page = new Page<>(dto.getCurrent(), dto.getSize());
        
        if (dto.getCurrent() == 1) {
            // 尝试从缓存获取
            String cacheKey = COUNT_CACHE_KEY + buildCacheKey(dto);
            Long cachedCount = (Long) redisTemplate.opsForValue().get(cacheKey);
            
            if (cachedCount != null) {
                page.setTotal(cachedCount);
                page.setSearchCount(false);
            } else {
                // 缓存不存在，查询数据库
                page.setSearchCount(true);
            }
        } else {
            page.setSearchCount(false);
        }
        
        LambdaQueryWrapper<User> wrapper = buildWrapper(dto);
        Page<User> result = page(page, wrapper);
        
        // 缓存 count 结果
        if (result.isSearchCount() && dto.getCurrent() == 1) {
            String cacheKey = COUNT_CACHE_KEY + buildCacheKey(dto);
            redisTemplate.opsForValue().set(
                cacheKey, 
                result.getTotal(), 
                COUNT_CACHE_EXPIRE, 
                TimeUnit.SECONDS
            );
        }
        
        return result;
    }
    
    private String buildCacheKey(UserQueryDTO dto) {
        return DigestUtils.md5DigestAsHex(
            JSON.toJSONString(dto).getBytes()
        );
    }
}
```

---

## 大数据量分页问题（深分页）

### 深分页的性能问题

```sql
-- 查询第 1 页：很快
SELECT * FROM user LIMIT 0, 10;

-- 查询第 10000 页：很慢
SELECT * FROM user LIMIT 100000, 10;

-- 原因：MySQL 需要扫描前 100010 条记录，然后丢弃前 100000 条
```

**测试数据：**
- 表数据量：100 万条
- 查询第 1 页：10ms
- 查询第 1000 页：50ms
- 查询第 10000 页：500ms
- 查询第 100000 页：5000ms（5秒）

### 优化方案1：限制分页深度

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    
    PaginationInnerInterceptor paginationInterceptor = 
        new PaginationInnerInterceptor(DbType.MYSQL);
    
    // 限制最大页码（如最多查询前 5000 页）
    paginationInterceptor.setMaxLimit(500L);
    
    // 溢出时跳转到第一页
    paginationInterceptor.setOverflow(true);
    
    interceptor.addInnerInterceptor(paginationInterceptor);
    return interceptor;
}

// Service 层额外校验
public Page<User> pageQuery(Integer current, Integer size) {
    int maxPage = 5000;
    if (current > maxPage) {
        throw new BusinessException("最多只能查询前 " + maxPage + " 页");
    }
    
    Page<User> page = new Page<>(current, size);
    return page(page);
}
```

### 优化方案2：使用子查询优化

```sql
-- ❌ 慢查询
SELECT * FROM user LIMIT 100000, 10;

-- ✅ 优化：先查询 ID，再关联
SELECT * FROM user 
WHERE id >= (SELECT id FROM user LIMIT 100000, 1)
LIMIT 10;
```

```java
/**
 * 使用子查询优化深分页
 */
@Select("<script>" +
        "SELECT * FROM user " +
        "WHERE id >= (" +
        "  SELECT id FROM user " +
        "  <where>" +
        "    <if test='status != null'>AND status = #{status}</if>" +
        "  </where>" +
        "  ORDER BY id " +
        "  LIMIT #{offset}, 1" +
        ") " +
        "<where>" +
        "  <if test='status != null'>AND status = #{status}</if>" +
        "</where>" +
        "ORDER BY id " +
        "LIMIT #{size}" +
        "</script>")
List<User> selectPageOptimized(@Param("offset") Long offset,
                                @Param("size") Integer size,
                                @Param("status") Integer status);

// Service 层
public Page<User> pageQueryOptimized(UserQueryDTO dto) {
    Page<User> page = new Page<>(dto.getCurrent(), dto.getSize());
    
    // 计算 offset
    long offset = (dto.getCurrent() - 1) * dto.getSize();
    
    // 查询数据（优化后的 SQL）
    List<User> records = baseMapper.selectPageOptimized(
        offset, dto.getSize(), dto.getStatus()
    );
    page.setRecords(records);
    
    // count 查询（带缓存）
    if (dto.getCurrent() == 1) {
        Long count = count(new LambdaQueryWrapper<User>()
            .eq(dto.getStatus() != null, User::getStatus, dto.getStatus()));
        page.setTotal(count);
    }
    
    return page;
}
```

### 优化方案3：记录上次查询的最后一条 ID

```java
/**
 * 基于 ID 的分页（适合只有"下一页"的场景）
 */
public List<User> pageByLastId(Long lastId, Integer size) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    
    if (lastId != null) {
        wrapper.gt(User::getId, lastId);  // id > lastId
    }
    
    wrapper.orderByAsc(User::getId)
           .last("LIMIT " + size);
    
    return list(wrapper);
}

// 使用示例
Long lastId = null;  // 首次查询
List<User> page1 = userService.pageByLastId(lastId, 10);
// 记录最后一条 ID
lastId = page1.get(page1.size() - 1).getId();

// 下一页
List<User> page2 = userService.pageByLastId(lastId, 10);
```

---

## 游标分页方案

### 什么是游标分页

游标分页不使用 `OFFSET`，而是基于上次查询的最后一条记录的某个字段（通常是主键或创建时间）来获取下一页数据。

**优点：**
- 性能稳定，不受页码深度影响
- 适合实时数据流（如消息、动态）

**缺点：**
- 无法跳页（只能上一页/下一页）
- 需要有序字段（ID、创建时间等）

### 实现游标分页

```java
/**
 * 游标分页请求 DTO
 */
@Data
public class CursorPageRequest {
    // 游标（上次查询的最后一条记录的 ID）
    private Long cursor;
    
    // 每页条数
    @Min(1)
    @Max(100)
    private Integer size = 10;
    
    // 查询方向（true: 下一页, false: 上一页）
    private Boolean forward = true;
}

/**
 * 游标分页响应 DTO
 */
@Data
public class CursorPageResult<T> {
    // 数据列表
    private List<T> records;
    
    // 下一页游标
    private Long nextCursor;
    
    // 上一页游标
    private Long prevCursor;
    
    // 是否有下一页
    private Boolean hasNext;
    
    // 是否有上一页
    private Boolean hasPrev;
}

/**
 * 游标分页实现
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    public CursorPageResult<User> cursorPage(CursorPageRequest request) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        
        if (request.getCursor() != null) {
            if (request.getForward()) {
                // 下一页：id > cursor
                wrapper.gt(User::getId, request.getCursor());
            } else {
                // 上一页：id < cursor
                wrapper.lt(User::getId, request.getCursor());
            }
        }
        
        // 排序
        if (request.getForward()) {
            wrapper.orderByAsc(User::getId);
        } else {
            wrapper.orderByDesc(User::getId);
        }
        
        // 多查询 1 条，用于判断是否有下一页
        wrapper.last("LIMIT " + (request.getSize() + 1));
        
        List<User> list = list(wrapper);
        
        // 构建响应
        CursorPageResult<User> result = new CursorPageResult<>();
        
        boolean hasMore = list.size() > request.getSize();
        if (hasMore) {
            list = list.subList(0, request.getSize());
        }
        
        if (!request.getForward()) {
            // 上一页需要反转列表
            Collections.reverse(list);
        }
        
        result.setRecords(list);
        
        if (!list.isEmpty()) {
            result.setNextCursor(list.get(list.size() - 1).getId());
            result.setPrevCursor(list.get(0).getId());
            result.setHasNext(hasMore);
            result.setHasPrev(request.getCursor() != null);
        }
        
        return result;
    }
}
```

### 前端使用游标分页

```javascript
// Vue 3 示例
<template>
  <div>
    <div v-for="user in users" :key="user.id">
      {{ user.name }}
    </div>
    
    <button @click="loadPrev" :disabled="!hasPrev">上一页</button>
    <button @click="loadNext" :disabled="!hasNext">下一页</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const users = ref([]);
const cursor = ref(null);
const hasNext = ref(false);
const hasPrev = ref(false);

const loadData = async (forward = true) => {
  const { data } = await getCursorPage({
    cursor: cursor.value,
    size: 10,
    forward
  });
  
  users.value = data.records;
  cursor.value = forward ? data.nextCursor : data.prevCursor;
  hasNext.value = data.hasNext;
  hasPrev.value = data.hasPrev;
};

const loadNext = () => loadData(true);
const loadPrev = () => loadData(false);
</script>
```

---

## 缓存策略

### 分页结果缓存

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String PAGE_CACHE_KEY = "user:page:";
    private static final int PAGE_CACHE_EXPIRE = 60; // 1分钟
    
    /**
     * 带缓存的分页查询
     */
    public Page<User> pageQueryWithCache(UserQueryDTO dto) {
        // 构建缓存 key
        String cacheKey = buildPageCacheKey(dto);
        
        // 尝试从缓存获取
        Page<User> cachedPage = (Page<User>) redisTemplate.opsForValue()
            .get(cacheKey);
        
        if (cachedPage != null) {
            return cachedPage;
        }
        
        // 缓存未命中，查询数据库
        Page<User> page = pageQuery(dto);
        
        // 存入缓存
        redisTemplate.opsForValue().set(
            cacheKey, 
            page, 
            PAGE_CACHE_EXPIRE, 
            TimeUnit.SECONDS
        );
        
        return page;
    }
    
    private String buildPageCacheKey(UserQueryDTO dto) {
        return PAGE_CACHE_KEY + DigestUtils.md5DigestAsHex(
            JSON.toJSONString(dto).getBytes()
        );
    }
    
    /**
     * 数据变更时清除缓存
     */
    @Override
    @CacheEvict(value = "user:page:", allEntries = true)
    public boolean save(User entity) {
        return super.save(entity);
    }
    
    @Override
    @CacheEvict(value = "user:page:", allEntries = true)
    public boolean updateById(User entity) {
        return super.updateById(entity);
    }
}
```

### 智能缓存策略

```java
/**
 * 分级缓存策略
 */
public Page<User> pageQuerySmartCache(UserQueryDTO dto) {
    // 1. 热点数据（前 3 页）：缓存 5 分钟
    if (dto.getCurrent() <= 3) {
        return pageQueryWithCache(dto, 300);
    }
    
    // 2. 温数据（4-10 页）：缓存 1 分钟
    if (dto.getCurrent() <= 10) {
        return pageQueryWithCache(dto, 60);
    }
    
    // 3. 冷数据（10 页以后）：不缓存
    return pageQuery(dto);
}
```

---

## 实战案例：电商订单列表优化

```java
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 订单列表查询（综合优化）
     */
    public Page<OrderVO> pageQuery(OrderQueryDTO dto) {
        Page<OrderVO> page = new Page<>(dto.getCurrent(), dto.getSize());
        
        // 1. 限制最大页码
        if (dto.getCurrent() > 1000) {
            throw new BusinessException("最多只能查询前 1000 页");
        }
        
        // 2. 首页查询 count 并缓存
        if (dto.getCurrent() == 1) {
            Long cachedCount = getCachedCount(dto);
            if (cachedCount != null) {
                page.setTotal(cachedCount);
                page.setSearchCount(false);
            }
        } else {
            page.setSearchCount(false);
        }
        
        // 3. 构建查询条件
        LambdaQueryWrapper<Order> wrapper = buildWrapper(dto);
        
        // 4. 执行分页查询
        Page<Order> orderPage = baseMapper.selectPage(page, wrapper);
        
        // 5. 缓存 count
        if (orderPage.isSearchCount() && dto.getCurrent() == 1) {
            cacheCount(dto, orderPage.getTotal());
        }
        
        // 6. 转换为 VO（批量查询关联数据，避免 N+1）
        return convertToVO(orderPage);
    }
    
    private Long getCachedCount(OrderQueryDTO dto) {
        String key = "order:count:" + buildCacheKey(dto);
        return (Long) redisTemplate.opsForValue().get(key);
    }
    
    private void cacheCount(OrderQueryDTO dto, Long count) {
        String key = "order:count:" + buildCacheKey(dto);
        redisTemplate.opsForValue().set(key, count, 5, TimeUnit.MINUTES);
    }
    
    private Page<OrderVO> convertToVO(Page<Order> orderPage) {
        List<Order> orders = orderPage.getRecords();
        
        if (CollectionUtils.isEmpty(orders)) {
            return new Page<>();
        }
        
        // 批量查询用户信息（避免 N+1）
        List<Long> userIds = orders.stream()
            .map(Order::getUserId)
            .distinct()
            .collect(Collectors.toList());
        
        Map<Long, User> userMap = userService.listByIds(userIds)
            .stream()
            .collect(Collectors.toMap(User::getId, u -> u));
        
        // 转换
        List<OrderVO> voList = orders.stream()
            .map(order -> {
                OrderVO vo = new OrderVO();
                BeanUtils.copyProperties(order, vo);
                vo.setUser(userMap.get(order.getUserId()));
                return vo;
            })
            .collect(Collectors.toList());
        
        Page<OrderVO> voPage = new Page<>(orderPage.getCurrent(), orderPage.getSize());
        voPage.setTotal(orderPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }
}
```

---

## 关键点总结

1. **count 优化**：非首页不查询、使用缓存、优化 SQL
2. **深分页问题**：限制页码深度、使用子查询、基于 ID 分页
3. **游标分页**：适合实时数据流，性能稳定
4. **缓存策略**：分级缓存、智能失效
5. **综合优化**：限制页码 + count缓存 + 避免N+1
6. **业务取舍**：评估是否真的需要跳页功能
7. **监控告警**：监控慢查询，及时优化

---

## 参考资料

- [分页优化最佳实践](https://tech.meituan.com/2017/04/21/mysql-index.html)
- [MySQL LIMIT 优化](https://dev.mysql.com/doc/refman/8.0/en/limit-optimization.html)
