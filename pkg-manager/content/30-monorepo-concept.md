# Monorepo 概念与实践

## 概述

Monorepo 是在单个仓库中管理多个项目的策略。理解 Monorepo 的优劣势和工具选型，是构建大型项目的关键。

## 一、Monorepo vs Multirepo

### 1.1 Multirepo（多仓库）

```
company/
├── repo-ui/
├── repo-utils/
├── repo-app/
└── repo-admin/
```

**特点：**
- 每个项目独立仓库
- 独立版本管理
- 独立 CI/CD

### 1.2 Monorepo（单仓库）

```
company-monorepo/
├── packages/
│   ├── ui/
│   └── utils/
└── apps/
    ├── app/
    └── admin/
```

**特点：**
- 单一仓库
- 共享代码
- 统一工具链

## 二、Monorepo 优势

### 2.1 代码共享

```javascript
// packages/utils/index.js
export function formatDate() {}

// apps/web/src/App.jsx
import { formatDate } from '@company/utils';  // ✅ 直接使用
```

**优势：**
- ✅ 无需发布即可使用
- ✅ 实时同步
- ✅ 统一版本

### 2.2 原子化提交

```bash
# 一次 commit 更新多个包
git commit -m "feat: add new API across all packages"
```

**场景：**
- 修改共享接口
- 跨包重构
- 统一升级依赖

### 2.3 统一工具链

```json
// 根目录配置
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

**优势：**
- 配置复用
- 版本统一
- 降低维护成本

### 2.4 更好的协作

```
团队成员可以：
- 查看所有代码
- 理解依赖关系
- 统一代码规范
```

## 三、Monorepo 劣势

### 3.1 仓库体积大

```bash
# 克隆时间长
git clone company-monorepo  # 可能几百 MB
```

**解决：** Git sparse-checkout

### 3.2 CI/CD 复杂

```yaml
# 需要智能判断哪些包需要构建
if: changed('packages/ui/**')
```

**解决：** Turborepo、Nx 等工具

### 3.3 权限管理困难

```
不同团队可能需要：
- 不同的访问权限
- 独立的发布流程
```

**解决：** CODEOWNERS、protected paths

## 四、Monorepo 工具选型

### 4.1 包管理器 Workspaces

**npm Workspaces：**
```json
{
  "workspaces": ["packages/*"]
}
```

**Yarn Workspaces：**
```json
{
  "workspaces": ["packages/*"]
}
```

**pnpm Workspaces：** ⭐ 推荐
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### 4.2 构建工具

**Turborepo：** ⭐ 推荐
- 增量构建
- 远程缓存
- 并行执行

**Nx：**
- 依赖图分析
- 受影响的项目
- 生成器

**Lerna：**
- 版本管理
- 发布工具
- 较重

### 4.3 对比表

| 工具 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| **pnpm** | 快速、节省空间 | - | ⭐⭐⭐⭐⭐ |
| **Turborepo** | 简单、快速 | 功能较少 | ⭐⭐⭐⭐⭐ |
| **Nx** | 功能强大 | 学习成本高 | ⭐⭐⭐⭐ |
| **Lerna** | 成熟 | 性能一般 | ⭐⭐⭐ |

## 五、包拆分原则

### 5.1 按功能拆分

```
packages/
├── ui/           # UI 组件
├── utils/        # 工具函数
├── hooks/        # React Hooks
└── config/       # 配置
```

### 5.2 按业务拆分

```
packages/
├── core/         # 核心业务
├── auth/         # 认证模块
├── payment/      # 支付模块
└── analytics/    # 分析模块
```

### 5.3 按层次拆分

```
packages/
├── data-access/  # 数据层
├── business/     # 业务层
└── presentation/ # 展示层
```

## 六、Monorepo 最佳实践

### 6.1 推荐目录结构

```
my-monorepo/
├── packages/          # 可复用的库
│   ├── ui/
│   ├── utils/
│   └── shared/
├── apps/              # 应用
│   ├── web/
│   ├── admin/
│   └── mobile/
├── tools/             # 内部工具
│   ├── scripts/
│   └── generators/
├── configs/           # 共享配置
│   ├── eslint/
│   ├── typescript/
│   └── jest/
└── docs/              # 文档
```

### 6.2 命名规范

```json
{
  "name": "@company/ui",      // 作用域包
  "name": "@company/utils",
  "name": "@company/web-app"
}
```

### 6.3 版本策略

**固定版本（Fixed）：**
```
所有包使用相同版本号
1.0.0 → 1.1.0（一起升级）
```

**独立版本（Independent）：**
```
每个包独立版本号
ui: 1.0.0 → 1.1.0
utils: 2.3.0（不变）
```

## 七、实战示例

### 7.1 使用 pnpm + Turborepo

**初始化：**
```bash
# 创建项目
mkdir my-monorepo && cd my-monorepo

# 初始化
pnpm init

# 安装 Turborepo
pnpm add -D turbo
```

**配置：**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

**package.json：**
```json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "dev": "turbo run dev --parallel"
  }
}
```

### 7.2 创建包

```bash
# 创建 UI 包
mkdir -p packages/ui
cd packages/ui
pnpm init

# package.json
{
  "name": "@mycompany/ui",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

### 7.3 使用内部包

```json
// apps/web/package.json
{
  "dependencies": {
    "@mycompany/ui": "workspace:*"
  }
}
```

```javascript
// apps/web/src/App.jsx
import { Button } from '@mycompany/ui';
```

## 八、常见问题

### 8.1 依赖版本不一致

**解决：** 使用 syncpack
```bash
pnpm add -D -w syncpack
pnpm syncpack fix-mismatches
```

### 8.2 构建顺序

**解决：** Turborepo 自动处理依赖顺序

### 8.3 CI 时间长

**解决：** 只构建改动的包
```bash
turbo run build --filter ...[HEAD^1]
```

## 参考资料

- [Monorepo.tools](https://monorepo.tools/)
- [Turborepo 文档](https://turbo.build/repo)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

**导航**  
[上一章：幽灵依赖与依赖提升](./29-phantom-dependencies.md) | [返回目录](../README.md) | [下一章：Lerna与Monorepo管理](./31-lerna.md)
