# 第 22 章：pnpm Workspaces 与 Monorepo - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Workspace配置

### 题目

pnpm Workspaces 的配置文件是什么？

**选项：**
- A. package.json
- B. pnpm-workspace.yaml
- C. workspace.config.js
- D. .pnpmrc

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm-workspace.yaml 配置**

#### 基本配置

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**指定 workspace 包的位置**

#### 完整示例

```yaml
packages:
  # 包含
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'
  
  # 排除
  - '!**/test/**'
  - '!**/__tests__/**'
```

#### 目录结构

```
my-monorepo/
├── pnpm-workspace.yaml  ← 配置文件
├── package.json
├── pnpm-lock.yaml
├── packages/
│   ├── ui/
│   └── utils/
└── apps/
    └── web/
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 跨包依赖

### 题目

pnpm Workspaces 会自动链接本地包。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**自动链接本地包**

#### 示例

**packages/app/package.json：**
```json
{
  "name": "@myorg/app",
  "dependencies": {
    "@myorg/ui": "^1.0.0"
  }
}
```

**packages/ui/package.json：**
```json
{
  "name": "@myorg/ui",
  "version": "1.0.0"
}
```

**安装后：**
```bash
pnpm install

# 自动链接
node_modules/
└── @myorg/
    └── ui → ../../packages/ui
```

#### 工作原理

```bash
# pnpm 识别本地包
# 1. 检查 pnpm-workspace.yaml
# 2. 查找匹配的包
# 3. 创建符号链接
# 4. 跳过从 registry 下载
```

**修改立即生效，无需重新安装**

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 递归命令

### 题目

在所有 workspace 中运行脚本的命令是？

**选项：**
- A. pnpm run --all
- B. pnpm -r run
- C. pnpm foreach
- D. pnpm workspaces run

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm 递归命令**

#### 基本用法

```bash
# -r 或 --recursive
pnpm -r run build
pnpm --recursive run test
```

**在所有 workspace 中运行**

#### 常用选项

```bash
# 并行运行
pnpm -r --parallel run build

# 过滤特定包
pnpm -r --filter "@myorg/ui" run build

# 拓扑排序（按依赖顺序）
pnpm -r run build
# 默认按拓扑顺序
```

#### 完整示例

```json
{
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "dev": "pnpm -r --parallel run dev"
  }
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** filter选项

### 题目

pnpm --filter 支持哪些过滤方式？

**选项：**
- A. 包名
- B. 目录路径
- C. 依赖关系
- D. Git 变更

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**pnpm filter 过滤器**

#### A. 包名 ✅

```bash
# 精确匹配
pnpm --filter "@myorg/ui" build

# 通配符
pnpm --filter "@myorg/*" build

# 排除
pnpm --filter "!@myorg/legacy" build
```

#### B. 目录路径 ✅

```bash
# 按目录
pnpm --filter "./packages/ui" build

# 通配符
pnpm --filter "./packages/*" build
```

#### C. 依赖关系 ✅

```bash
# 包及其依赖
pnpm --filter "@myorg/app..." build

# 包及其依赖者
pnpm --filter "...@myorg/ui" build

# 两者都包括
pnpm --filter "...@myorg/ui..." build
```

#### D. Git 变更 ✅

```bash
# 变更的包
pnpm --filter "[origin/main]" build

# 变更的包及其依赖者
pnpm --filter "...[origin/main]" build
```

#### 组合使用

```bash
# 多个过滤器
pnpm --filter "@myorg/ui" --filter "@myorg/app" build

# 复杂条件
pnpm --filter "...@myorg/ui" --filter "!@myorg/legacy" test
```

#### 实际场景

**CI 优化（只测试变更）：**
```yaml
- name: Test changed packages
  run: pnpm --filter "...[origin/main]" test
```

**开发特定功能：**
```bash
# 只启动相关包
pnpm --filter "@myorg/app..." dev
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** workspace协议

### 题目

pnpm 的 `workspace:*` 协议是什么意思？

**选项：**
- A. 从 npm 安装
- B. 从本地 workspace 使用
- C. 通配符版本
- D. 工作区配置

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**workspace 协议**

#### 基本用法

```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

**使用本地 workspace 的任意版本**

#### 协议变体

**workspace:*** - 任意版本：**
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

**workspace:^** - 兼容版本：**
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:^"
    // 解析为 ^1.0.0（如果 ui 是 1.0.0）
  }
}
```

**workspace:~** - 近似版本：**
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:~"
    // 解析为 ~1.0.0
  }
}
```

**精确版本：**
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:1.0.0"
  }
}
```

#### 发布时转换

**开发时：**
```json
{
  "name": "@myorg/app",
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

**发布时自动转换：**
```json
{
  "name": "@myorg/app",
  "dependencies": {
    "@myorg/ui": "^1.2.3"  // 真实版本
  }
}
```

**pnpm 自动替换**

#### 对比

| 写法 | 含义 | 发布后 |
|------|------|--------|
| `workspace:*` | 任意版本 | `^1.2.3` |
| `workspace:^` | 兼容版本 | `^1.2.3` |
| `workspace:~` | 近似版本 | `~1.2.3` |
| `^1.0.0` | npm 版本 | `^1.0.0`（可能不是本地）|

**推荐使用 workspace 协议**

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** catalog功能

### 题目

pnpm 8.6+ 的 catalog 功能是什么？

**选项：**
- A. 包目录
- B. 统一管理依赖版本
- C. 缓存目录
- D. 包分类

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm catalog 功能**

#### 配置

**pnpm-workspace.yaml：**
```yaml
packages:
  - 'packages/*'

catalog:
  react: ^18.2.0
  typescript: ^5.0.0
  vite: ^4.0.0
```

**统一定义依赖版本**

#### 使用

**packages/ui/package.json：**
```json
{
  "dependencies": {
    "react": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "vite": "catalog:"
  }
}
```

**自动使用 catalog 中定义的版本**

#### 优势

**1. 版本统一：**
```yaml
# pnpm-workspace.yaml
catalog:
  react: ^18.2.0

# 所有包自动使用 ^18.2.0
```

**2. 集中管理：**
```bash
# 只需在一处更新版本
# 所有使用 catalog: 的包自动更新
```

**3. 避免版本不一致：**
```bash
# 不再需要 syncpack
# 不再需要手动检查
```

#### 多 catalog

```yaml
catalog:
  react: ^18.2.0
  
catalog:build:
  typescript: ^5.0.0
  vite: ^4.0.0
  
catalog:test:
  vitest: ^0.34.0
  '@testing-library/react': ^14.0.0
```

**使用：**
```json
{
  "devDependencies": {
    "typescript": "catalog:build",
    "vitest": "catalog:test"
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 依赖提升

### 题目

pnpm Workspaces 如何处理依赖提升？

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

**选项：**
- A. 默认不提升
- B. 提升到根 node_modules
- C. 提升到 .pnpm 目录
- D. 可配置

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**pnpm 依赖提升策略**

#### 默认行为

```bash
# 默认：不提升（严格模式）
pnpm install

node_modules/
└── .pnpm/
    └── lodash@4.17.21/
```

**每个包独立的 node_modules**

#### 配置提升

**.npmrc：**
```ini
# 提升到根（兼容模式）
shamefully-hoist=true

# 公共提升模式
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
```

**提升后：**
```
node_modules/
├── eslint/  ← 提升
├── prettier/  ← 提升
└── .pnpm/
```

#### Workspace 中的提升

**场景：**
```
packages/
├── ui/
│   └── node_modules/
│       └── lodash@4.17.21
└── app/
    └── node_modules/
        └── lodash@4.17.21
```

**提升选项：**

**1. hoist=true（默认）：**
```ini
hoist=true
```

```
node_modules/
├── lodash@4.17.21  ← 提升到根
├── packages/
│   ├── ui/
│   └── app/
```

**2. hoist=false：**
```ini
hoist=false
```

```
packages/
├── ui/
│   └── node_modules/
│       └── lodash@4.17.21
└── app/
    └── node_modules/
        └── lodash@4.17.21
```

**每个包独立**

#### 推荐配置

```ini
# .npmrc
# 严格模式（推荐）
shamefully-hoist=false
hoist=true

# 只提升工具
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*typescript*
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** Monorepo最佳实践

### 题目

如何在 pnpm Monorepo 中管理共同依赖？

**选项：**
- A. 每个包独立安装
- B. 提升到根 package.json
- C. 使用 catalog
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**共同依赖管理策略**

#### 方案 B：提升到根 ✅

**根 package.json：**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "vitest": "^0.34.0"
  }
}
```

**优势：**
- 版本统一
- 减少安装时间
- 适合开发工具

**子包使用：**
```bash
# 子包可以直接使用根依赖
cd packages/ui
pnpm run lint  # 使用根的 eslint
```

#### 方案 C：使用 catalog ✅

**pnpm-workspace.yaml：**
```yaml
packages:
  - 'packages/*'

catalog:
  typescript: ^5.0.0
  eslint: ^8.0.0
  prettier: ^3.0.0
```

**子包：**
```json
{
  "devDependencies": {
    "typescript": "catalog:",
    "eslint": "catalog:"
  }
}
```

**优势：**
- 显式声明
- 类型提示
- 更清晰

#### 对比

| 方案 | 优势 | 劣势 |
|------|------|------|
| **根依赖** | 简单、快速 | 不够显式 |
| **catalog** | 清晰、类型安全 | 需 pnpm 8.6+ |
| **每包独立** | 灵活 | 版本不一致 |

#### 完整方案

**1. 根 package.json（开发工具）：**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "@changesets/cli": "^2.26.0"
  }
}
```

**2. catalog（运行时库）：**
```yaml
catalog:
  react: ^18.2.0
  react-dom: ^18.2.0
  '@types/react': ^18.2.0
```

**3. 子包（具体依赖）：**
```json
{
  "dependencies": {
    "react": "catalog:",
    "lodash": "^4.17.21"  // 特殊需求
  }
}
```

#### 迁移建议

**从独立依赖迁移：**
```bash
# 1. 收集所有依赖
pnpm list --depth=0 --json > deps.json

# 2. 分析共同依赖
# 3. 提升到根或 catalog
# 4. 更新子包
# 5. 重新安装
pnpm install
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 发布流程

### 题目

如何在 pnpm Monorepo 中发布包？

<details>
<summary>查看答案</summary>

### ✅ 答案

**pnpm Monorepo 发布策略**

#### 方案 1：使用 Changesets（推荐）

**1. 安装：**
```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

**2. 配置：**
```json
// .changeset/config.json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

**3. 添加变更：**
```bash
pnpm changeset

# 交互式选择：
# ? 哪些包变更了？ @myorg/ui, @myorg/app
# ? 变更类型？ patch
# ? 变更描述？ Fix button styles
```

**4. 版本递增：**
```bash
pnpm changeset version

# 自动：
# - 更新 package.json 版本
# - 生成 CHANGELOG.md
# - 更新依赖版本
```

**5. 发布：**
```bash
pnpm changeset publish

# 发布到 npm
# 创建 Git tags
```

#### 方案 2：pnpm publish

**单个包：**
```bash
cd packages/ui
pnpm publish
```

**所有包：**
```bash
pnpm -r publish
```

#### CI/CD 集成

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - name: Create Release PR
        uses: changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 📖 解析

**完整发布流程**

**开发阶段：**
```bash
# 1. 开发功能
git checkout -b feature/new-feature

# 2. 添加 changeset
pnpm changeset

# 3. 提交
git commit -m "feat: new feature"

# 4. 推送
git push
```

**CI 自动处理：**
```
1. 检测到推送
2. 运行测试
3. 创建 Release PR
4. PR 包含：
   - 版本号更新
   - CHANGELOG 更新
5. 合并 PR
6. 自动发布到 npm
7. 创建 Git tags
```

**零手动操作！**

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** Workspace配置

### 题目

配置一个完整的 pnpm Monorepo 项目。

<details>
<summary>查看答案</summary>

### ✅ 答案

**完整 pnpm Monorepo 配置**

#### 1. 目录结构

```
my-monorepo/
├── .npmrc
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── package.json
├── packages/
│   ├── ui/
│   │   └── package.json
│   └── utils/
│       └── package.json
└── apps/
    └── web/
        └── package.json
```

#### 2. pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'apps/*'

# Catalog（pnpm 8.6+）
catalog:
  # React 生态
  react: ^18.2.0
  react-dom: ^18.2.0
  '@types/react': ^18.2.0
  
  # 工具
  typescript: ^5.0.0
  vite: ^4.0.0
```

#### 3. .npmrc

```ini
# Registry
registry=https://registry.npmmirror.com

# 严格模式
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=false

# 公共提升（工具）
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*typescript*

# 覆盖
# resolution-mode=highest  # 使用最高版本
```

#### 4. package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@8.6.0",
  
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint",
    "dev": "pnpm -r --parallel run dev",
    "clean": "pnpm -r run clean && rm -rf node_modules",
    
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish",
    
    "type-check": "pnpm -r run type-check"
  },
  
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21"
    },
    "peerDependencyRules": {
      "ignoreMissing": ["react"],
      "allowedVersions": {
        "react": "18"
      }
    }
  }
}
```

#### 5. packages/ui/package.json

```json
{
  "name": "@myorg/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  
  "peerDependencies": {
    "react": "catalog:"
  },
  
  "devDependencies": {
    "react": "catalog:",
    "tsup": "^7.0.0",
    "typescript": "catalog:"
  }
}
```

#### 6. apps/web/package.json

```json
{
  "name": "@myorg/web",
  "version": "1.0.0",
  "private": true,
  
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:*",
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  
  "devDependencies": {
    "@types/react": "catalog:",
    "typescript": "catalog:",
    "vite": "catalog:",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

### 📖 解析

**配置说明**

**workspace 协议：**
- `workspace:*` - 本地包（自动链接）
- `catalog:` - 使用 catalog 版本

**scripts 模式：**
- `-r` - 递归所有包
- `--parallel` - 并行执行
- `--filter` - 过滤特定包

**最佳实践：**
1. 使用 catalog 统一版本
2. 严格模式（shamefully-hoist=false）
3. Changesets 管理发布
4. 类型检查
5. CI/CD 自动化

</details>

---

**导航**  
[上一章：第 21 章面试题](./chapter-21.md) | [返回目录](../README.md) | [下一章：第 23 章面试题](./chapter-23.md)
