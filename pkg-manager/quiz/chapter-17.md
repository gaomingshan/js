# 第 17 章：Yarn Workspaces 深度应用 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Workspaces基础

### 题目

Yarn Workspaces 的主要作用是什么？

**选项：**
- A. 加速单个项目的安装
- B. 管理 Monorepo 中的多个包
- C. 压缩代码体积
- D. 自动发布包

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Yarn Workspaces - Monorepo 管理**

#### 基本概念

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

**管理多个相关的包**

#### 目录结构

```
my-monorepo/
├── package.json  ← 根配置
├── packages/
│   ├── ui/       ← workspace 1
│   ├── utils/    ← workspace 2
│   └── app/      ← workspace 3
```

#### 优势

**1. 依赖共享：**
```
node_modules/
├── react  ← 所有包共享
└── @myorg/
    ├── ui → packages/ui
    ├── utils → packages/utils
    └── app → packages/app
```

**2. 跨包引用：**
```json
// packages/app/package.json
{
  "dependencies": {
    "@myorg/ui": "^1.0.0",  // 自动链接本地
    "@myorg/utils": "^1.0.0"
  }
}
```

**3. 统一管理：**
```bash
# 一次安装所有依赖
yarn install

# 在所有包中运行命令
yarn workspaces foreach run build
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** private字段

### 题目

使用 Yarn Workspaces 时，根 package.json 必须设置 `"private": true`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**private 字段要求**

#### 必须设置

```json
{
  "private": true,  // ✅ 必需
  "workspaces": [
    "packages/*"
  ]
}
```

**原因：**
- 防止意外发布根包到 npm
- 根包通常只是容器，不应发布

#### 错误示例

```json
{
  "name": "my-monorepo",
  // ❌ 缺少 private: true
  "workspaces": [
    "packages/*"
  ]
}
```

```bash
yarn install
# Warning: workspaces can only be enabled in private projects
```

#### 子包可以发布

```json
// packages/ui/package.json
{
  "name": "@myorg/ui",
  // private 字段可选
  // 默认 false，可以发布
}
```

```bash
cd packages/ui
yarn publish  # ✅ 可以发布
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** workspace命令

### 题目

如何在特定的 workspace 中运行命令？

**选项：**
- A. yarn run --workspace=pkg-name
- B. yarn workspace pkg-name run
- C. yarn --filter pkg-name run
- D. cd packages/pkg-name && yarn run

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Workspace 命令**

#### 在特定包中运行

```bash
# Yarn 1.x / 2+
yarn workspace @myorg/ui build

# 等价于
cd packages/ui
yarn build
cd ../..
```

#### 在所有包中运行

```bash
# Yarn 1.x
yarn workspaces run build

# Yarn 2+
yarn workspaces foreach run build
```

#### 常用模式

**构建：**
```bash
yarn workspace @myorg/ui build
```

**测试：**
```bash
yarn workspace @myorg/utils test
```

**添加依赖：**
```bash
yarn workspace @myorg/ui add react
```

**运行脚本：**
```bash
yarn workspace @myorg/app dev
```

#### Yarn 2+ 增强

```bash
# 并行运行
yarn workspaces foreach -p run test

# 拓扑排序（依赖顺序）
yarn workspaces foreach -pt run build

# 只运行变更的包
yarn workspaces foreach --since origin/main run test
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 依赖提升

### 题目

Yarn Workspaces 如何处理依赖提升？

**选项：**
- A. 相同版本提升到根 node_modules
- B. 不同版本保留在各自的 node_modules
- C. 所有依赖都提升
- D. 可以配置 nohoist 阻止提升

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、D

### 📖 解析

**依赖提升机制**

#### A. 相同版本提升 ✅

```json
// packages/ui/package.json
{ "dependencies": { "react": "^18.2.0" } }

// packages/app/package.json
{ "dependencies": { "react": "^18.2.0" } }
```

**结果：**
```
node_modules/
└── react@18.2.0  ← 提升到根
```

#### B. 不同版本保留 ✅

```json
// packages/ui/package.json
{ "dependencies": { "lodash": "^4.17.0" } }

// packages/legacy/package.json
{ "dependencies": { "lodash": "^3.10.0" } }
```

**结果：**
```
node_modules/
├── lodash@4.17.21  ← 提升（较新版本）
└── packages/
    └── legacy/
        └── node_modules/
            └── lodash@3.10.1  ← 保留
```

#### C. 所有依赖都提升 ❌

**只有兼容版本才提升**

#### D. nohoist 配置 ✅

**Yarn 1.x：**
```json
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": [
      "**/react-native",
      "**/react-native/**"
    ]
  }
}
```

**Yarn 2+：**
```yaml
# .yarnrc.yml
nmHoistingLimits: workspaces
```

#### 提升规则示例

**场景：**
```json
// packages/a/package.json
{ "dependencies": { "lib": "^1.0.0" } }

// packages/b/package.json
{ "dependencies": { "lib": "^1.2.0" } }

// packages/c/package.json
{ "dependencies": { "lib": "^2.0.0" } }
```

**结果：**
```
node_modules/
├── lib@1.2.0  ← 提升（满足 ^1.0.0 和 ^1.2.0）
└── packages/
    └── c/
        └── node_modules/
            └── lib@2.0.0  ← 不兼容，保留
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 跨包开发

### 题目

如何实现跨包的实时开发体验？

**选项：**
- A. 每次修改后重新安装
- B. 使用符号链接自动生效
- C. 使用 yarn link
- D. 使用 watch 模式

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B、D

### 📖 解析

**跨包实时开发**

#### B. 符号链接自动生效 ✅

```bash
yarn install

# Yarn 自动创建符号链接
node_modules/
└── @myorg/
    └── ui → ../../packages/ui
```

**修改 packages/ui 立即生效**

#### 问题：需要构建

```javascript
// packages/ui/src/Button.tsx
export const Button = () => <button>Click</button>;
```

**使用方：**
```javascript
// packages/app/src/App.tsx
import { Button } from '@myorg/ui';  // ❌ 找不到
```

**原因：** 引用的是 `dist/`，未构建

#### D. Watch 模式 ✅

**packages/ui/package.json：**
```json
{
  "scripts": {
    "dev": "tsc --watch"
  }
}
```

**终端 1：**
```bash
yarn workspace @myorg/ui dev
# 监听 src/ 变化，自动构建到 dist/
```

**终端 2：**
```bash
yarn workspace @myorg/app dev
# 使用 @myorg/ui 的最新构建
```

**修改立即生效！**

#### 完整开发工作流

**package.json：**
```json
{
  "scripts": {
    "dev": "yarn workspaces foreach -pi run dev"
  }
}
```

**子包 scripts：**
```json
{
  "scripts": {
    "dev": "tsc --watch"  // 库包
  }
}
```

```json
{
  "scripts": {
    "dev": "vite"  // 应用包
  }
}
```

**一条命令启动所有：**
```bash
yarn dev
```

#### 使用 Turborepo

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel"
  }
}
```

**turbo.json：**
```json
{
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**智能依赖顺序，自动重启**

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** workspace协议

### 题目

Yarn 2+ 的 `workspace:*` 协议是什么意思？

**选项：**
- A. 从 npm 安装最新版本
- B. 从本地 workspace 使用任意版本
- C. 安装所有 workspace
- D. 通配符版本范围

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Workspace 协议**

#### 基本用法

```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

**含义：** 使用本地 workspace，任意版本

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
    "@myorg/ui": "workspace:^"  // ^1.0.0
  }
}
```

**workspace:~** - 近似版本：**
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:~"  // ~1.0.0
  }
}
```

#### 发布时转换

**开发时：**
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

**发布时自动转换：**
```json
{
  "dependencies": {
    "@myorg/ui": "^1.2.3"  // 真实版本
  }
}
```

#### 对比传统方式

**传统：**
```json
{
  "dependencies": {
    "@myorg/ui": "^1.0.0"
  }
}
```

**问题：** 版本可能不匹配

**workspace:***：**
```json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
```

**优势：** 始终使用本地版本

#### 实际示例

```json
// packages/app/package.json
{
  "name": "@myorg/app",
  "version": "2.0.0",
  "dependencies": {
    "@myorg/ui": "workspace:^",      // ^1.0.0
    "@myorg/utils": "workspace:*"    // 任意版本
  }
}
```

**发布后：**
```json
{
  "name": "@myorg/app",
  "version": "2.0.0",
  "dependencies": {
    "@myorg/ui": "^1.5.0",      // 自动填入
    "@myorg/utils": "^2.3.1"    // 自动填入
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** foreach命令

### 题目

以下命令的 `-pt` 参数是什么意思？

```bash
yarn workspaces foreach -pt run build
```

**选项：**
- A. -p 并行，-t 测试模式
- B. -p 并行，-t 拓扑排序
- C. -p 生产模式，-t 类型检查
- D. -p 私有包，-t 标签

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Yarn 2+ foreach 参数**

#### -p (parallel) - 并行

```bash
yarn workspaces foreach -p run build

# 所有包并行构建
```

**加速构建！**

#### -t (topological) - 拓扑排序

```bash
yarn workspaces foreach -t run build

# 按依赖顺序串行构建
# 1. @myorg/utils（无依赖）
# 2. @myorg/ui（依赖 utils）
# 3. @myorg/app（依赖 ui）
```

**确保依赖已构建**

#### -pt 组合

```bash
yarn workspaces foreach -pt run build

# 拓扑排序 + 并行
# - 同一层级的包并行
# - 不同层级按顺序
```

**示例：**
```
层级 1（并行）:
  @myorg/utils
  @myorg/icons

层级 2（并行，等待层级1）:
  @myorg/ui

层级 3（等待层级2）:
  @myorg/app
```

**最优构建策略！**

#### 其他参数

```bash
# -i (interlaced) - 交错输出
yarn workspaces foreach -pi run test

# -v (verbose) - 详细日志
yarn workspaces foreach -v run build

# --since - 只运行变更的包
yarn workspaces foreach --since origin/main run test

# --include - 只包含特定包
yarn workspaces foreach --include '@myorg/ui' run build

# --exclude - 排除特定包
yarn workspaces foreach --exclude '@myorg/legacy' run build
```

#### 性能对比

```bash
# 串行（慢）
yarn workspaces foreach run build
# 5分钟

# 并行（快，但可能失败）
yarn workspaces foreach -p run build
# 1分钟，但可能因依赖未构建失败

# 拓扑+并行（最优）
yarn workspaces foreach -pt run build
# 1.5分钟，保证正确性
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 依赖管理策略

### 题目

Monorepo 中如何统一管理依赖版本？

**选项：**
- A. 手动保持一致
- B. 使用 resolutions 强制版本
- C. 使用 syncpack 工具
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**统一依赖版本策略**

#### B. 使用 resolutions ✅

**根 package.json：**
```json
{
  "resolutions": {
    "lodash": "4.17.21",
    "react": "^18.2.0"
  }
}
```

**强制所有包使用指定版本**

**示例：**
```json
// packages/ui/package.json
{ "dependencies": { "lodash": "^4.17.0" } }

// packages/app/package.json
{ "dependencies": { "lodash": "^4.15.0" } }

// 根 package.json
{
  "resolutions": {
    "lodash": "4.17.21"  // 强制使用此版本
  }
}
```

**yarn install 后：**
```
所有包都使用 lodash@4.17.21
```

#### C. 使用 syncpack ✅

```bash
npm install -g syncpack
```

**检查版本不一致：**
```bash
syncpack list-mismatches

# 输出：
lodash
  ^4.17.20 packages/ui
  ^4.17.21 packages/app

react
  ^17.0.0 packages/ui
  ^18.2.0 packages/app
```

**自动修复：**
```bash
syncpack fix-mismatches

# 自动统一为最新版本
```

**配置文件 .syncpackrc.json：**
```json
{
  "source": [
    "package.json",
    "packages/*/package.json"
  ],
  "versionGroups": [
    {
      "label": "Use workspace protocol for local packages",
      "dependencies": ["$LOCAL"],
      "dependencyTypes": ["dev", "prod"],
      "pinVersion": "workspace:*"
    }
  ],
  "semverGroups": [
    {
      "range": "^",
      "dependencies": ["**"],
      "packages": ["**"]
    }
  ]
}
```

#### 完整策略

**1. 共同依赖提升到根：**
```json
// 根 package.json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

**2. resolutions 强制版本：**
```json
{
  "resolutions": {
    "typescript": "5.1.6",
    "@types/react": "^18.2.0"
  }
}
```

**3. 定期检查：**
```bash
# package.json
{
  "scripts": {
    "check:versions": "syncpack list-mismatches",
    "fix:versions": "syncpack fix-mismatches"
  }
}
```

**4. CI 验证：**
```yaml
# .github/workflows/ci.yml
- name: Check version consistency
  run: |
    npx syncpack list-mismatches
    if [ $? -ne 0 ]; then
      echo "Version mismatch detected!"
      exit 1
    fi
```

#### Yarn 2+ constraints

**.yarn/constraints.pro：**
```prolog
% 强制所有包使用相同的 React 版本
gen_enforced_dependency(WorkspaceCwd, 'react', '18.2.0', DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, 'react', _, DependencyType).

% 验证
yarn constraints
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 发布流程

### 题目

如何在 Monorepo 中管理版本号和发布？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Monorepo 版本管理方案**

#### 方案 1：Changesets（推荐）

**1. 安装：**
```bash
yarn add -D @changesets/cli
yarn changeset init
```

**2. 添加变更：**
```bash
yarn changeset

# 交互式选择：
# ? 哪些包变更了？ @myorg/ui, @myorg/utils
# ? 变更类型？ patch
# ? 变更描述？ Fix button styling
```

**生成 .changeset/xxx.md：**
```md
---
"@myorg/ui": patch
"@myorg/utils": patch
---

Fix button styling
```

**3. 版本递增：**
```bash
yarn changeset version

# 自动：
# - 更新 package.json 版本
# - 生成 CHANGELOG.md
# - 删除 changeset 文件
```

**4. 发布：**
```bash
yarn changeset publish

# 自动：
# - 构建所有变更的包
# - 发布到 npm
# - 创建 Git tags
```

#### 方案 2：Lerna

```bash
yarn add -D lerna
lerna init
```

**lerna.json：**
```json
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "command": {
    "version": {
      "conventionalCommits": true,
      "message": "chore: release"
    }
  }
}
```

**发布：**
```bash
# 版本递增
lerna version

# 发布
lerna publish from-package
```

#### 方案 3：手动管理

```bash
# 1. 修改版本
cd packages/ui
yarn version patch

# 2. 构建
yarn build

# 3. 发布
yarn publish

# 4. 标签
git tag @myorg/ui@1.0.1
git push --tags
```

### 📖 解析

**完整 CI/CD 流程**

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
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v3
      
      - run: yarn install
      
      - name: Create Release PR
        uses: changesets/action@v1
        with:
          version: yarn changeset version
          publish: yarn changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**工作流程：**
1. 开发完成，提交代码
2. 添加 changeset
3. 推送到 main
4. CI 自动创建 Release PR
5. 合并 PR → 自动发布

**零手动操作！**

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** Workspace配置

### 题目

如何配置高级的 Yarn Workspace 项目？

<details>
<summary>查看答案</summary>

### ✅ 答案

**高级 Workspace 配置**

#### 1. 根 package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "yarn@3.6.0",
  
  "workspaces": [
    "packages/*",
    "apps/*",
    "tools/*"
  ],
  
  "scripts": {
    "build": "yarn workspaces foreach -pt run build",
    "test": "yarn workspaces foreach -p run test",
    "lint": "eslint .",
    "type-check": "tsc --build",
    "clean": "yarn workspaces foreach -p run clean && rimraf node_modules",
    
    "dev": "turbo run dev --parallel",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "yarn build && changeset publish"
  },
  
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.0",
    "syncpack": "^11.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  
  "resolutions": {
    "@types/react": "^18.2.0",
    "@types/node": "^18.0.0",
    "typescript": "5.1.6"
  }
}
```

#### 2. .yarnrc.yml

```yaml
# Node.js 链接模式
nodeLinker: node-modules  # 或 pnp

# 启用插件
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
  - path: .yarn/plugins/@yarnpkg/plugin-version.cjs

# NPM registry
npmRegistryServer: "https://registry.npmjs.org"

# NPM scopes
npmScopes:
  mycompany:
    npmRegistryServer: "https://npm.mycompany.com"
    npmAlwaysAuth: true

# 依赖提升
nmHoistingLimits: workspaces

# 启用 Yarn 3 特性
enableGlobalCache: false
enableTelemetry: false

# 压缩
compressionLevel: 9
```

#### 3. turbo.json

```json
{
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
      "cache": false,
      "persistent": true
    }
  }
}
```

#### 4. 包结构示例

**packages/ui/package.json：**
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
    "clean": "rimraf dist",
    "test": "vitest"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "react": "^18.2.0",
    "tsup": "^7.0.0",
    "vitest": "^0.34.0"
  }
}
```

**apps/web/package.json：**
```json
{
  "name": "@myorg/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:*",
    "next": "^13.0.0",
    "react": "^18.2.0"
  }
}
```

#### 5. 目录结构

```
my-monorepo/
├── .yarn/
│   ├── plugins/
│   └── releases/
├── .yarnrc.yml
├── turbo.json
├── package.json
├── packages/
│   ├── ui/
│   ├── utils/
│   └── icons/
├── apps/
│   ├── web/
│   └── admin/
└── tools/
    └── scripts/
```

### 📖 解析

**最佳实践总结**

1. **使用 Turborepo 加速**
2. **使用 Changesets 管理版本**
3. **使用 syncpack 统一依赖**
4. **配置 resolutions 强制版本**
5. **使用 workspace 协议**
6. **拓扑排序构建**
7. **CI/CD 自动化**

</details>

---

**导航**  
[上一章：第 16 章面试题](./chapter-16.md) | [返回目录](../README.md) | [下一章：第 18 章面试题](./chapter-18.md)
