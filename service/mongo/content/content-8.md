# MongoDB Atlas 云服务入门

## 概述

MongoDB Atlas 是官方全托管云数据库服务，支持 AWS、Azure、GCP。它将副本集部署、扩容、备份、监控全部托管，让团队专注业务逻辑。

---

## 集群层级选择

| 层级 | 存储 | 适用场景 |
|------|------|----------|
| Free（M0）| 512MB | 学习、Demo |
| Shared（M2/M5）| 2-5GB | 开发测试 |
| Dedicated（M10+）| 按需 | 生产环境 |
| Serverless | 按请求计费 | 流量不稳定 |

---

## 快速开始

```bash
# 1. 注册：https://www.mongodb.com/cloud/atlas
# 2. 创建免费集群（选择离用户近的区域）
# 3. Network Access → 添加 IP 白名单
# 4. Database Access → 创建用户
# 5. Connect → 获取连接字符串
```

### 连接字符串格式

```bash
# SRV 格式（Atlas 推荐，自动处理副本集路由）
mongodb+srv://app_user:password@mycluster.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority

# 标准格式（自建集群）
mongodb://user:pass@host1:27017,host2:27017,host3:27017/dbname?replicaSet=rs0&authSource=admin
```

---

## Atlas Search 快速体验

```js
// 在 Atlas UI 创建 Search Index 后，使用 $search 聚合
db.products.aggregate([
  {
    $search: {
      index: "default",
      text: {
        query: "苹果手机",
        path: ["name", "description"],
        fuzzy: { maxEdits: 1 }
      }
    }
  },
  { $limit: 10 },
  {
    $project: {
      name: 1, price: 1,
      score: { $meta: "searchScore" }
    }
  }
])
```

---

## Atlas 自动备份与 PITR

```
备份能力：
  - 每日快照（M10+ 保留 7 天）
  - PITR：恢复到秒级任意时间点（M10+ 支持）
  - 跨区域备份（Dedicated 支持）

恢复操作：
  Backup → Restore → 选择时间点 → 恢复到新集群
```

---

## Atlas vs 自建集群

| 维度 | Atlas | 自建 |
|------|-------|------|
| 运维成本 | 极低（全托管）| 高（需 DBA）|
| 费用 | 较高 | 低（资源复用）|
| 定制化 | 受限 | 完全自由 |
| 数据主权 | 需确认区域 | 自主控制 |
| 上线速度 | 分钟级 | 小时~天级 |
| 推荐 | 初创/SaaS | 大型企业 |

---

## 总结

- Atlas Free Tier 是学习 MongoDB 的最快起点
- 生产环境选 M10+ Dedicated，开启 PITR
- Atlas Search 提供全文搜索能力，无需单独部署 ES
- 关注数据合规要求，选择合适的云区域

**下一步**：安全初始化与访问控制。
