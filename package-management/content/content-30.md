# Monorepo 架构设计

## Monorepo 的优势与挑战

### 优势

**1. 代码共享**：
```
传统多仓库：
repo-utils/       (独立仓库)
repo-core/        (复制 utils 代码)
repo-app/         (复制 utils 代码)

Monorepo：
monorepo/
├── packages/utils/   (唯一副本)
├── packages/core/    (引用 utils)
└── packages/app/     (引用 utils)
```

**2. 原子提交**：
```bash
# 同时修改多个包
git commit -m "feat: add new API to core and update app"

# 一个 PR 包含所有变更
# 避免版本同步问题
```

**3. 统一工具链**：
```
monorepo/
├── .eslintrc.js      (共享配置)
├── tsconfig.json     (共享配置)
├── jest.config.js    (共享配置)
└── packages/
    ├── core/
    ├── utils/
    └── app/
```

**4. 简化依赖管理**：
```json
// 根目录 package.json
{
  "devDependencies": {
    "typescript": "5.0.0",    // 所有包共享
    "jest": "29.0.0",
    "eslint": "8.0.0"
  }
}
```

### 挑战

**1. 构建时间增长**：
```bash
# 小项目
npm run build  # 10 秒

# Monorepo (10 个包)
npm run build  # 100 秒

# 解决：增量构建
```

**2. Git 仓库体积膨胀**：
```
代码：1 GB
历史：5 GB
依赖：2 GB (node_modules)
总计：8 GB

# 克隆慢、Git 操作慢
```

**3. 权限管理复杂**：
```
传统：每个仓库独立权限
Monorepo：需要子目录级别权限（Git 不原生支持）
```

**4. CI 时间长**：
```
变更 1 个包 → 测试所有包？
或
只测试变更包？（复杂度增加）
```

---

## 多包依赖拓扑

### 依赖图表示

**示例项目**：
```
packages/
├── utils/        (基础工具)
├── core/         (依赖 utils)
├── ui/           (依赖 core)
└── app/          (依赖 ui, core)
```

**依赖图**：
```
app → ui → core → utils
  ↘____↗
```

**拓扑排序**：
```
构建顺序：
1. utils
2. core
3. ui
4. app
```

### 依赖声明

**workspace: 协议**：
```json
// packages/core/package.json
{
  "name": "@my-org/core",
  "dependencies": {
    "@my-org/utils": "workspace:*"
  }
}

// packages/app/package.json
{
  "name": "@my-org/app",
  "dependencies": {
    "@my-org/core": "workspace:^1.0.0",
    "@my-org/ui": "workspace:*"
  }
}
```

### 循环依赖检测

**问题场景**：
```
core → ui
ui → core  ← 循环
```

**检测工具**：
```bash
# madge
npm install -g madge
madge --circular packages/

# 输出：
# Circular dependency found:
# @my-org/core → @my-org/ui → @my-org/core
```

**解决方案**：
```
1. 提取共享代码到新包
   core → shared ← ui

2. 依赖注入
   core 不直接依赖 ui，而是通过接口
```

---

## 版本管理策略

### 固定版本模式（Fixed Version）

**Babel / Jest 风格**：

```json
// lerna.json
{
  "version": "7.0.0",
  "packages": ["packages/*"]
}
```

**所有包使用相同版本**：
```
@babel/core@7.20.0
@babel/cli@7.20.0
@babel/preset-env@7.20.0
```

**发布**：
```bash
lerna version patch
# 所有包：7.20.0 → 7.20.1

lerna publish
# 发布所有包
```

**优点**：
- 版本管理简单
- 用户理解成本低
- 兼容性保证

**缺点**：
- 未变更的包也升版本
- 版本号"浪费"

### 独立版本模式（Independent）

**Yarn Workspaces 风格**：

```json
// lerna.json
{
  "version": "independent",
  "packages": ["packages/*"]
}
```

**每个包独立版本**：
```
@my-org/core@2.1.0
@my-org/utils@1.5.3
@my-org/app@3.0.1
```

**发布**：
```bash
lerna version
# ? Select a new version for @my-org/core (currently 2.1.0)
#   Patch (2.1.1)
#   Minor (2.2.0)
#   Major (3.0.0)
```

**优点**：
- 版本号语义化
- 避免不必要升级

**缺点**：
- 版本管理复杂
- 用户需要理解依赖关系

### Changesets 工作流

**安装**：
```bash
npm install -D @changesets/cli
npx changeset init
```

**创建 changeset**：
```bash
npx changeset

# 交互式界面：
# ? Which packages would you like to include?
#   ✔ @my-org/core
#   ✔ @my-org/utils
# ? What kind of change is this for @my-org/core?
#   Patch
# ? Please enter a summary
#   Fix memory leak in event handlers
```

**生成文件**：
```markdown
<!-- .changeset/cool-panda-123.md -->
---
"@my-org/core": patch
"@my-org/utils": patch
---

Fix memory leak in event handlers
```

**发布流程**：
```bash
# 1. 版本号更新和生成 CHANGELOG
npx changeset version

# 2. 构建
npm run build

# 3. 发布
npx changeset publish

# 4. 推送 Git 标签
git push --follow-tags
```

---

## 代码共享与边界控制

### 共享策略

**Level 1：工具函数**：
```
packages/utils/
├── src/
│   ├── date.ts
│   ├── string.ts
│   └── array.ts
└── package.json

所有包可引用
```

**Level 2：业务逻辑**：
```
packages/core/
├── src/
│   ├── auth/
│   ├── api/
│   └── state/
└── package.json

只有 app 层可引用
```

**Level 3：应用**：
```
packages/app/
├── src/
│   └── pages/
└── package.json

不被其他包引用
```

### 边界控制

**问题**：防止不合理的依赖
```
utils → core  ❌ (utils 不应依赖 core)
app → utils   ❌ (app 应通过 core 引用)
```

**工具**：dependency-cruiser

**配置**（.dependency-cruiser.js）：
```javascript
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true }
    },
    {
      name: 'utils-no-deps',
      severity: 'error',
      from: { path: '^packages/utils' },
      to: { path: '^packages/(core|app)' }
    },
    {
      name: 'app-through-core',
      severity: 'warn',
      from: { path: '^packages/app' },
      to: { path: '^packages/utils' }
    }
  ]
};
```

**检查**：
```bash
npx depcruise packages --config .dependency-cruiser.js

# 输出：
# error: utils-no-deps
#   packages/utils/src/index.ts → packages/core/src/api.ts
```

### 导出控制

**barrel 文件**：
```typescript
// packages/core/src/index.ts
export { Auth } from './auth';
export { API } from './api';

// 不导出内部实现
// export { InternalHelper } from './internal';
```

**TypeScript 路径映射**：
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@my-org/core": ["packages/core/src/index.ts"],
      "@my-org/core/*": ["packages/core/src/*"]
    }
  }
}
```

**引用限制**：
```typescript
// ✅ 允许
import { Auth } from '@my-org/core';

// ❌ 禁止（绕过 barrel）
import { InternalHelper } from '@my-org/core/internal';
```

---

## 常见误区

### 误区 1：Monorepo 适合所有项目

**不适合的场景**：
```
1. 多个独立产品（无代码共享）
2. 不同技术栈（Java + Node.js）
3. 不同团队（无协作需求）
4. 超大规模（Google 级别需要自建工具）
```

**适合的场景**：
```
1. 多个相关包（React 生态）
2. 前后端分离项目（共享类型定义）
3. 微前端架构
4. 组件库 + 文档 + 示例
```

### 误区 2：Monorepo = Lerna

**真相**：Lerna 只是工具之一

**完整工具链**：
```
包管理：npm/Yarn/pnpm workspaces
版本管理：Lerna/Changesets
任务编排：Turborepo/Nx
构建：Rollup/Webpack/Vite
```

### 误区 3：所有包都必须一起发布

**真相**：可以选择性发布

**Lerna 选择性发布**：
```bash
# 只发布变更的包
lerna publish --conventional-commits

# 只发布特定包
lerna publish --scope=@my-org/core
```

---

## 工程实践

### 场景 1：标准 Monorepo 结构

**目录结构**：
```
my-monorepo/
├── .github/
│   └── workflows/
│       └── ci.yml
├── packages/
│   ├── utils/
│   ├── core/
│   ├── ui/
│   └── app/
├── tools/
│   └── scripts/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
└── README.md
```

**根 package.json**：
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "dev": "turbo run dev --parallel",
    "changeset": "changeset",
    "version": "changeset version",
    "publish": "changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  }
}
```

### 场景 2：增量构建配置

**Turborepo 配置**（turbo.json）：
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false
    }
  }
}
```

**效果**：
```bash
# 第一次构建
turbo run build
# ✓ utils build (2.5s)
# ✓ core build (3.1s)
# ✓ ui build (4.2s)
# ✓ app build (5.8s)
# Total: 15.6s

# 再次构建（无变更）
turbo run build
# ✓ utils build (0.1s) CACHED
# ✓ core build (0.1s) CACHED
# ✓ ui build (0.1s) CACHED
# ✓ app build (0.1s) CACHED
# Total: 0.4s
```

### 场景 3：CI 优化

**只测试变更的包**：
```yaml
# .github/workflows/ci.yml
- name: Get changed packages
  id: changed
  run: |
    CHANGED=$(pnpm list --depth -1 --json --filter="[origin/main]" | jq -r '.[].name')
    echo "packages=$CHANGED" >> $GITHUB_OUTPUT

- name: Build affected
  run: pnpm --filter="[origin/main]..." run build

- name: Test affected
  run: pnpm --filter="[origin/main]..." run test
```

**缓存策略**：
```yaml
- name: Cache Turbo
  uses: actions/cache@v3
  with:
    path: .turbo
    key: turbo-${{ github.sha }}
    restore-keys: turbo-

- name: Build with cache
  run: turbo run build
```

---

## 深入一点

### Monorepo 的扩展性

**Google Monorepo**：
```
代码量：20 亿行
文件数：9 百万
变更数：每天 4 万次提交
开发者：2.5 万人

工具：Bazel（自研构建系统）
```

**扩展挑战**：
```
1. Git 性能（→ Git LFS, Sparse Checkout）
2. CI 时间（→ 分布式构建）
3. 依赖图复杂（→ 自动化分析工具）
4. 权限管理（→ CODEOWNERS）
```

### 依赖图的数学模型

**图论表示**：
```
G = (V, E)
V = {包1, 包2, ..., 包n}
E = {(包i, 包j) | 包i 依赖 包j}

拓扑排序：
找到一个顺序，使得所有边 (u, v) 满足 u 在 v 之前
```

**复杂度**：
```
拓扑排序：O(V + E)
循环检测：O(V + E)

示例：
100 个包，平均 3 个依赖
V = 100, E = 300
复杂度 = O(400)
```

### Monorepo vs Polyrepo

**对比**：
| 维度 | Monorepo | Polyrepo |
|------|----------|----------|
| 代码共享 | 容易 | 困难 |
| 版本管理 | 复杂 | 简单 |
| CI 时间 | 长 | 短 |
| 工具链 | 统一 | 独立 |
| 权限管理 | 困难 | 容易 |
| 原子变更 | 支持 | 不支持 |

**选择建议**：
```
Monorepo:
- 多个相关包
- 团队紧密协作
- 代码共享频繁

Polyrepo:
- 独立产品
- 团队分散
- 不同技术栈
```

---

## 参考资料

- [Monorepo 工具对比](https://monorepo.tools/)
- [Turborepo 文档](https://turbo.build/)
- [Changesets](https://github.com/changesets/changesets)
- [Google 的 Monorepo](https://cacm.acm.org/magazines/2016/7/204032-why-google-stores-billions-of-lines-of-code-in-a-single-repository/)
