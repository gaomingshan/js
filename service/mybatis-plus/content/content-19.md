# 9.2 逻辑删除实践问题

## 概述

虽然逻辑删除功能强大，但在实际使用中会遇到一些问题。本节介绍逻辑删除的常见问题及解决方案，包括唯一索引冲突、统计查询、物理删除场景等。

**核心问题：**
- 唯一索引冲突
- 统计与报表查询
- 物理删除场景
- 软删除数据的清理策略

---

## 唯一索引冲突问题

### 问题描述

```sql
-- 用户表有唯一索引
CREATE TABLE `user` (
  `id` BIGINT(20) NOT NULL,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),  -- 唯一索引
  UNIQUE KEY `uk_email` (`email`)         -- 唯一索引
) ENGINE=InnoDB;
```

**冲突场景：**
```java
// 1. 创建用户
User user = new User();
user.setUsername("zhangsan");
user.setEmail("zhangsan@example.com");
userService.save(user);  // 成功

// 2. 删除用户（逻辑删除）
userService.removeById(user.getId());
// UPDATE user SET deleted = 1 WHERE id = ?

// 3. 再次创建同用户名的用户
User newUser = new User();
newUser.setUsername("zhangsan");  // 相同用户名
newUser.setEmail("zhangsan@example.com");
userService.save(newUser);
// ❌ 失败：Duplicate entry 'zhangsan' for key 'uk_username'
```

### 解决方案1：唯一索引包含 deleted 字段

```sql
-- 修改唯一索引，包含 deleted 字段
ALTER TABLE `user` DROP INDEX `uk_username`;
ALTER TABLE `user` DROP INDEX `uk_email`;

CREATE UNIQUE INDEX `uk_username_deleted` ON `user`(`username`, `deleted`);
CREATE UNIQUE INDEX `uk_email_deleted` ON `user`(`email`, `deleted`);
```

**优点：** 简单有效
**缺点：** 同一用户名可以有多条已删除记录

### 解决方案2：删除时修改唯一字段

```java
/**
 * 删除时修改唯一字段值
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean removeById(Serializable id) {
        User user = getById(id);
        if (user == null) {
            return false;
        }
        
        // 修改唯一字段，添加删除标记
        String deletedSuffix = "_deleted_" + System.currentTimeMillis();
        user.setUsername(user.getUsername() + deletedSuffix);
        user.setEmail(user.getEmail() + deletedSuffix);
        user.setDeleted(1);
        user.setDeleteTime(LocalDateTime.now());
        
        return updateById(user);
    }
}
```

**执行结果：**
```sql
-- 原始数据：username='zhangsan', email='zhangsan@example.com'
-- 删除后：username='zhangsan_deleted_1704096000000', email='zhangsan@example.com_deleted_1704096000000'
```

**优点：** 解决唯一索引冲突
**缺点：** 修改了原始数据，恢复时需要还原

### 解决方案3：使用删除时间戳

```sql
-- 使用 deleted 字段存储删除时间戳
ALTER TABLE `user` MODIFY COLUMN `deleted` BIGINT NOT NULL DEFAULT 0 COMMENT '逻辑删除(0:未删除, >0:删除时间戳)';

-- 唯一索引包含 deleted 字段
CREATE UNIQUE INDEX `uk_username_deleted` ON `user`(`username`, `deleted`);
```

```java
@TableLogic(value = "0", delval = "#{T(System).currentTimeMillis()}")
private Long deleted;  // 0:未删除, >0:删除时间戳
```

**优点：** 每次删除的 deleted 值都不同，不会冲突
**缺点：** 查询时需要判断 `deleted = 0`

### 解决方案4：软删除表分离

```sql
-- 活跃用户表（只存未删除数据）
CREATE TABLE `user_active` (
  `id` BIGINT(20) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB;

-- 删除用户表（存已删除数据）
CREATE TABLE `user_deleted` (
  `id` BIGINT(20) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `delete_time` DATETIME NOT NULL,
  `delete_by` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

```java
/**
 * 删除时移动数据到删除表
 */
@Override
@Transactional(rollbackFor = Exception.class)
public boolean removeById(Serializable id) {
    // 1. 查询原数据
    User user = getById(id);
    if (user == null) {
        return false;
    }
    
    // 2. 插入到删除表
    UserDeleted deleted = new UserDeleted();
    BeanUtils.copyProperties(user, deleted);
    deleted.setDeleteTime(LocalDateTime.now());
    deleted.setDeleteBy(SecurityUtils.getUserId());
    userDeletedService.save(deleted);
    
    // 3. 从活跃表删除
    return baseMapper.deleteById(id) > 0;
}
```

**优点：** 彻底解决唯一索引问题，活跃表性能更好
**缺点：** 需要维护两张表，复杂度增加

---

## 统计与报表查询

### 问题：逻辑删除影响统计

```java
// 统计用户总数
Long totalCount = userMapper.selectCount(null);
// SQL: SELECT COUNT(*) FROM user WHERE deleted = 0
// 结果：只统计未删除的用户

// 实际需求：统计所有用户（包括已删除）
```

### 解决方案1：自定义统计方法

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 统计所有用户（包括已删除）
     */
    @Select("SELECT COUNT(*) FROM user")
    Long countAll();
    
    /**
     * 统计已删除用户
     */
    @Select("SELECT COUNT(*) FROM user WHERE deleted = 1")
    Long countDeleted();
    
    /**
     * 按部门统计（包括已删除）
     */
    @Select("SELECT dept_id, COUNT(*) as count, " +
            "SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_count, " +
            "SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_count " +
            "FROM user GROUP BY dept_id")
    List<Map<String, Object>> countByDept();
}
```

### 解决方案2：报表专用视图

```sql
-- 创建报表视图（包含所有数据）
CREATE VIEW `v_user_statistics` AS
SELECT 
    dept_id,
    COUNT(*) as total_count,
    SUM(CASE WHEN deleted = 0 THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted_count,
    MAX(create_time) as last_create_time
FROM user
GROUP BY dept_id;

-- 查询视图
SELECT * FROM v_user_statistics;
```

---

## 物理删除场景

### 场景1：敏感数据清理

```java
/**
 * 物理删除敏感数据（如用户申请注销账号）
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 用户注销（物理删除）
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean cancel(Long userId) {
        // 1. 检查是否可以注销
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 2. 检查是否有未完成订单
        long pendingOrderCount = orderService.countPendingByUser(userId);
        if (pendingOrderCount > 0) {
            throw new BusinessException("存在未完成订单，无法注销");
        }
        
        // 3. 匿名化处理（保留订单关联，但清除个人信息）
        user.setUsername("已注销用户_" + userId);
        user.setPhone(null);
        user.setEmail(null);
        user.setIdCard(null);
        updateById(user);
        
        // 4. 逻辑删除
        removeById(userId);
        
        // 5. 记录注销日志
        logCancellation(userId);
        
        return true;
    }
    
    /**
     * 定期清理已注销超过180天的数据
     */
    @Scheduled(cron = "0 0 3 * * ?")  // 每天凌晨3点
    public void cleanCancelledUsers() {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(180);
        
        // 物理删除已注销超过180天的用户
        int count = baseMapper.physicalDeleteCancelledUsers(beforeDate);
        log.info("清理已注销用户数据：{}条", count);
    }
}
```

### 场景2：测试数据清理

```java
/**
 * 清理测试数据
 */
@Service
public class TestDataCleanService {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 清理测试用户（物理删除）
     */
    @Transactional(rollbackFor = Exception.class)
    public int cleanTestUsers() {
        // 只在开发/测试环境执行
        if (!"dev".equals(environment) && !"test".equals(environment)) {
            throw new BusinessException("生产环境禁止执行此操作");
        }
        
        // 物理删除测试用户
        return userMapper.physicalDeleteTestUsers();
    }
}

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    @Delete("DELETE FROM user WHERE username LIKE 'test_%'")
    int physicalDeleteTestUsers();
}
```

---

## 软删除数据的清理策略

### 策略1：定期归档

```java
/**
 * 归档服务
 */
@Service
public class ArchiveService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private UserArchiveMapper userArchiveMapper;
    
    /**
     * 归档已删除超过30天的数据
     */
    @Scheduled(cron = "0 0 1 * * ?")  // 每天凌晨1点
    @Transactional(rollbackFor = Exception.class)
    public void archiveDeletedUsers() {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(30);
        
        // 1. 查询需要归档的数据
        List<User> deletedUsers = userMapper.selectDeletedBeforeDate(beforeDate);
        
        if (CollectionUtils.isEmpty(deletedUsers)) {
            log.info("没有需要归档的数据");
            return;
        }
        
        // 2. 转换为归档对象
        List<UserArchive> archives = deletedUsers.stream()
            .map(this::toArchive)
            .collect(Collectors.toList());
        
        // 3. 保存到归档表
        userArchiveMapper.insertBatch(archives);
        
        // 4. 物理删除原数据
        List<Long> ids = deletedUsers.stream()
            .map(User::getId)
            .collect(Collectors.toList());
        userMapper.physicalDeleteByIds(ids);
        
        log.info("归档已删除用户：{}条", deletedUsers.size());
    }
    
    private UserArchive toArchive(User user) {
        UserArchive archive = new UserArchive();
        BeanUtils.copyProperties(user, archive);
        archive.setArchiveTime(LocalDateTime.now());
        return archive;
    }
}
```

### 策略2：分批物理删除

```java
/**
 * 分批清理已删除数据
 */
@Service
public class DataCleanService {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 清理已删除超过90天的数据（分批执行，避免长事务）
     */
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点
    public void cleanOldDeletedData() {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(90);
        int batchSize = 1000;
        int totalCount = 0;
        
        while (true) {
            // 每批删除1000条
            int count = cleanBatch(beforeDate, batchSize);
            totalCount += count;
            
            if (count < batchSize) {
                // 已经清理完成
                break;
            }
            
            // 休眠1秒，避免对数据库造成过大压力
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        log.info("清理历史删除数据：{}条", totalCount);
    }
    
    @Transactional(rollbackFor = Exception.class)
    public int cleanBatch(LocalDateTime beforeDate, int batchSize) {
        return userMapper.physicalDeleteBatch(beforeDate, batchSize);
    }
}

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    @Delete("DELETE FROM user " +
            "WHERE deleted = 1 AND delete_time < #{beforeDate} " +
            "LIMIT #{batchSize}")
    int physicalDeleteBatch(@Param("beforeDate") LocalDateTime beforeDate,
                            @Param("batchSize") int batchSize);
}
```

### 策略3：冷热数据分离

```java
/**
 * 冷热数据分离
 */
@Service
public class DataSeparationService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private UserColdMapper userColdMapper;
    
    /**
     * 将已删除超过7天的数据移动到冷表
     */
    @Scheduled(cron = "0 0 4 * * ?")  // 每天凌晨4点
    @Transactional(rollbackFor = Exception.class)
    public void moveToColumnTable() {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(7);
        
        // 1. 查询需要移动的数据
        List<User> users = userMapper.selectDeletedBeforeDate(beforeDate);
        
        if (CollectionUtils.isEmpty(users)) {
            return;
        }
        
        // 2. 插入到冷表
        List<UserCold> coldUsers = users.stream()
            .map(this::toColdUser)
            .collect(Collectors.toList());
        userColdMapper.insertBatch(coldUsers);
        
        // 3. 从热表删除
        List<Long> ids = users.stream()
            .map(User::getId)
            .collect(Collectors.toList());
        userMapper.physicalDeleteByIds(ids);
        
        log.info("移动到冷表：{}条", users.size());
    }
}
```

---

## 最佳实践建议

### 1. 选择合适的逻辑删除方案

```java
/**
 * 根据业务场景选择方案
 */
public class LogicDeleteStrategy {
    
    /**
     * 方案1：简单场景
     * - 无唯一索引或唯一索引包含 deleted 字段
     * - 不需要精确的删除时间
     */
    @TableLogic
    private Integer deleted;  // 0/1
    
    /**
     * 方案2：需要删除时间
     * - 审计要求
     * - 数据恢复需要
     */
    @TableLogic
    private LocalDateTime deleteTime;  // null/时间
    
    /**
     * 方案3：唯一索引场景
     * - 有唯一索引且需要重复使用
     */
    @TableLogic(value = "0", delval = "#{T(System).currentTimeMillis()}")
    private Long deleted;  // 0/时间戳
    
    /**
     * 方案4：高性能要求
     * - 活跃数据和删除数据分表存储
     */
    // 两张表：user_active 和 user_deleted
}
```

### 2. 监控与告警

```java
/**
 * 监控逻辑删除数据量
 */
@Service
public class LogicDeleteMonitorService {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 检查逻辑删除数据比例
     */
    @Scheduled(cron = "0 0 * * * ?")  // 每小时执行
    public void checkDeletedRatio() {
        long totalCount = userMapper.countAll();
        long deletedCount = userMapper.countDeleted();
        
        if (totalCount == 0) {
            return;
        }
        
        double ratio = (double) deletedCount / totalCount;
        
        // 删除数据超过50%，发出告警
        if (ratio > 0.5) {
            log.warn("逻辑删除数据比例过高：{}/{} = {:.2f}%", 
                     deletedCount, totalCount, ratio * 100);
            
            // 发送告警通知
            alertService.send("逻辑删除数据比例过高，请及时清理");
        }
    }
}
```

### 3. 数据恢复流程

```java
/**
 * 数据恢复审批流程
 */
@Service
public class DataRecoveryService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ApprovalService approvalService;
    
    /**
     * 申请恢复数据
     */
    @Transactional(rollbackFor = Exception.class)
    public String applyRecovery(Long userId, String reason) {
        // 1. 检查数据是否已删除
        User user = userService.getById(userId);
        if (user == null || user.getDeleted() == 0) {
            throw new BusinessException("数据不存在或未被删除");
        }
        
        // 2. 创建审批申请
        RecoveryApproval approval = new RecoveryApproval();
        approval.setUserId(userId);
        approval.setReason(reason);
        approval.setApplicant(SecurityUtils.getUserId());
        approval.setStatus(ApprovalStatus.PENDING);
        
        approvalService.save(approval);
        
        return approval.getId();
    }
    
    /**
     * 审批通过后恢复数据
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean recover(String approvalId) {
        // 1. 检查审批状态
        RecoveryApproval approval = approvalService.getById(approvalId);
        if (approval.getStatus() != ApprovalStatus.APPROVED) {
            throw new BusinessException("审批未通过");
        }
        
        // 2. 恢复数据
        boolean success = userService.recover(approval.getUserId());
        
        // 3. 更新审批状态
        if (success) {
            approval.setStatus(ApprovalStatus.COMPLETED);
            approvalService.updateById(approval);
        }
        
        return success;
    }
}
```

---

## 关键点总结

1. **唯一索引冲突**：索引包含 deleted 字段、删除时修改唯一字段、使用时间戳、分表存储
2. **统计查询**：自定义统计方法、使用视图、区分活跃数据和全量数据
3. **物理删除**：敏感数据清理、测试数据清理、用户注销处理
4. **清理策略**：定期归档、分批删除、冷热分离
5. **监控告警**：监控删除数据比例、及时清理
6. **数据恢复**：建立审批流程、记录恢复日志
7. **方案选择**：根据业务场景选择合适的逻辑删除方案

---

## 参考资料

- [逻辑删除](https://baomidou.com/pages/6b03c5/)
- [MySQL 唯一索引](https://dev.mysql.com/doc/refman/8.0/en/create-index.html)
