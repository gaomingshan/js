# 版本演进与迁移

## 概述

Elasticsearch 持续演进，本章介绍版本历史、重大变化和升级迁移策略。

## 版本历史

### 主要版本

```
1.x（2014）：初代版本
2.x（2015）：性能优化
5.x（2016）：Lucene 6、Ingest Pipeline
6.x（2017）：去除 Type、改进安全
7.x（2019）：完全移除 Type、性能提升
8.x（2022）：新特性、Cloud 优先
```

## 6.x、7.x、8.x 重大变化

### 7.0 重大变化

```
Type 完全移除：
- 6.x：_doc 作为默认 type
- 7.x：移除 type 概念
- 8.x：完全不支持 type

示例：
6.x: PUT /index/type/id
7.x: PUT /index/_doc/id
8.x: PUT /index/_doc/id
```

### 8.0 重大变化

```
安全默认启用：
- xpack.security.enabled: true（默认）
- 必须配置 TLS

REST API 变化：
- 移除部分废弃 API
- 统一响应格式
```

## Type 的移除

### 背景

```
Type 设计缺陷：
- 不同 type 共享 mapping
- 性能问题
- 概念混淆
```

### 迁移方案

**方案一：索引分离**

```
迁移前：
/my_index/user/1
/my_index/post/1

迁移后：
/users/_doc/1
/posts/_doc/1
```

**方案二：添加类型字段**

```
迁移前：
PUT /my_index/user/1 {...}
PUT /my_index/post/1 {...}

迁移后：
PUT /my_index/_doc/user_1 
{
  "type": "user",
  ...
}

PUT /my_index/_doc/post_1
{
  "type": "post",
  ...
}
```

## 滚动升级（Rolling Upgrade）

### 升级步骤

```
1. 禁用分片分配
2. 停止一个节点
3. 升级节点
4. 启动节点
5. 等待节点加入集群
6. 启用分片分配
7. 等待集群恢复
8. 重复 2-7 直到所有节点完成
```

### 详细流程

```bash
# 1. 禁用分片分配
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}

# 2. 停止节点
systemctl stop elasticsearch

# 3. 升级（安装新版本）
rpm -Uvh elasticsearch-7.17.9.rpm

# 4. 启动节点
systemctl start elasticsearch

# 5. 等待节点加入
GET /_cat/nodes

# 6. 启用分片分配
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}

# 7. 等待集群恢复
GET /_cat/health

# 8. 重复直到完成所有节点
```

### 注意事项

```
✓ 先升级 Master 节点
✓ 再升级 Data 节点
✓ 最后升级 Coordinating 节点
✓ 确保集群健康后再升级下一个
✓ 备份数据
```

## 重建索引迁移

### 场景

```
需要重建索引的情况：
- 跨大版本升级（5.x → 7.x）
- Mapping 变更
- 分片数调整
- 索引设置优化
```

### Reindex API

```bash
# 基本 Reindex
POST /_reindex
{
  "source": {
    "index": "old_index"
  },
  "dest": {
    "index": "new_index"
  }
}

# 带查询的 Reindex
POST /_reindex
{
  "source": {
    "index": "old_index",
    "query": {
      "range": {
        "date": {
          "gte": "2024-01-01"
        }
      }
    }
  },
  "dest": {
    "index": "new_index"
  }
}

# 脚本转换
POST /_reindex
{
  "source": {
    "index": "old_index"
  },
  "dest": {
    "index": "new_index"
  },
  "script": {
    "source": "ctx._source.new_field = ctx._source.old_field * 2"
  }
}
```

### 远程 Reindex

```bash
POST /_reindex
{
  "source": {
    "remote": {
      "host": "http://old-cluster:9200",
      "username": "elastic",
      "password": "changeme"
    },
    "index": "old_index"
  },
  "dest": {
    "index": "new_index"
  }
}
```

## 兼容性问题

### API 兼容性

```bash
# 使用兼容模式
GET /my_index/_search?rest_total_hits_as_int=true

# 7.x 风格响应
{
  "hits": {
    "total": 100
  }
}

# 8.x 风格响应
{
  "hits": {
    "total": {
      "value": 100,
      "relation": "eq"
    }
  }
}
```

### 废弃特性处理

```
检查废弃日志：
GET /_migration/deprecations

响应示例：
{
  "cluster_settings": [],
  "node_settings": [],
  "index_settings": {
    "old_index": [
      {
        "level": "warning",
        "message": "index.max_result_window is deprecated"
      }
    ]
  }
}
```

## 版本升级最佳实践

### 准备阶段

```
1. 阅读发布说明
2. 检查兼容性
3. 测试环境验证
4. 备份数据
5. 制定回滚计划
```

### 执行阶段

```
1. 选择低峰期
2. 监控集群状态
3. 逐个节点升级
4. 验证功能正常
5. 监控性能指标
```

### 验证阶段

```
1. 检查集群健康
2. 验证索引完整性
3. 测试关键功能
4. 性能对比测试
5. 监控告警确认
```

### 回滚计划

```
如果升级失败：
1. 停止升级
2. 恢复快照
3. 分析问题
4. 修复后重试
```

## 跨大版本升级

### 5.x → 6.x → 7.x

```
不能直接跨大版本：
5.x → 7.x ❌
5.x → 6.x → 7.x ✓

步骤：
1. 5.x 升级到 5.6.x（最新）
2. 5.6.x 升级到 6.8.x
3. 6.8.x 升级到 7.17.x
```

### 升级工具

```bash
# 使用 Elasticsearch Migration Helper
# 1. 检查集群兼容性
GET /_xpack/migration/assistance

# 2. 升级索引
POST /_xpack/migration/upgrade/my_index

# 3. 验证
GET /_xpack/migration/assistance
```

## 总结

**版本演进**：
- 持续优化性能
- 移除历史包袱
- 增强安全性

**重大变化**：
- Type 移除
- 安全默认启用
- API 调整

**升级策略**：
- 滚动升级
- 重建索引
- 远程迁移

**兼容性**：
- 检查废弃特性
- 测试验证
- 逐步迁移

**最佳实践**：
- 充分准备
- 测试环境验证
- 监控告警
- 回滚预案

**下一步**：学习性能基准测试。
