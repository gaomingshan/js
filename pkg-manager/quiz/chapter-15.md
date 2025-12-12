# 第 15 章：npm 工具链生态 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** npx基础

### 题目

`npx` 的主要作用是什么？

**选项：**
- A. 安装 npm 包
- B. 执行 npm 包的命令
- C. 更新 npm 版本
- D. 发布 npm 包

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npx 命令**

#### 基本用法

```bash
# 执行本地安装的包
npx webpack

# 等价于
./node_modules/.bin/webpack
```

#### 临时执行（无需安装）

```bash
# 使用 create-react-app（不安装）
npx create-react-app my-app

# 1. 下载到临时目录
# 2. 执行
# 3. 删除
```

**一次性命令的最佳选择**

#### 指定版本

```bash
# 使用特定版本
npx webpack@4.46.0

# 使用最新版本
npx webpack@latest
```

#### 常见场景

```bash
# 初始化项目
npx create-next-app
npx create-vite

# 运行工具
npx eslint .
npx prettier --write .

# 执行脚本
npx ts-node script.ts
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** nvm

### 题目

nvm 可以在同一终端会话中切换 Node.js 版本。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**nvm 版本切换**

```bash
# 查看当前版本
node -v
# v18.16.0

# 切换到 16
nvm use 16
# Now using node v16.20.0

# 验证
node -v
# v16.20.0

# 同一终端，版本已切换 ✅
```

#### 工作原理

```bash
# nvm 修改 PATH 环境变量
echo $PATH

# Before: ~/.nvm/versions/node/v18.16.0/bin:...
# After:  ~/.nvm/versions/node/v16.20.0/bin:...
```

**动态更新 PATH，立即生效**

#### 项目级版本

```bash
# .nvmrc
18.16.0
```

```bash
cd my-project
nvm use  # 自动读取 .nvmrc
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** npm-check

### 题目

`npm-check` 工具的主要功能是什么？

**选项：**
- A. 检查代码质量
- B. 检查依赖更新和安全性
- C. 检查包大小
- D. 检查网络连接

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm-check 工具**

#### 安装使用

```bash
npm install -g npm-check

# 检查依赖
npm-check
```

**输出示例：**
```
lodash      😎  MAJOR  Update available 4.17.0 ❯ 5.0.0
react       🎉  MINOR  Update available 17.0.0 ❯ 17.0.2
webpack     ✔️  Up to date
unused-pkg  ❌  Unused dependency
```

#### 交互式更新

```bash
npm-check -u

# 交互界面：
# ❯ ◯ lodash  4.17.0 → 5.0.0 (MAJOR)
#   ◯ react   17.0.0 → 17.0.2 (MINOR)
#   ◉ webpack (skip)

# 空格选择，回车更新
```

#### 功能

**1. 检查更新：**
- 显示可用更新
- 区分 MAJOR/MINOR/PATCH

**2. 检查未使用的依赖：**
```bash
npm-check --skip-unused
```

**3. 检查安全漏洞：**
```bash
npm-check --production
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 包管理工具

### 题目

以下哪些是 npm 的替代品？

**选项：**
- A. Yarn
- B. pnpm
- C. Bun
- D. npm-check-updates

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C

### 📖 解析

**包管理器对比**

#### A. Yarn ✅

```bash
# 安装
npm install -g yarn

# 使用
yarn add lodash
yarn install
```

**特点：**
- 并行安装
- 离线模式
- Workspaces

#### B. pnpm ✅

```bash
# 安装
npm install -g pnpm

# 使用
pnpm add lodash
pnpm install
```

**特点：**
- 硬链接节省空间
- 严格依赖
- 最快的包管理器

#### C. Bun ✅

```bash
# 安装
curl -fsSL https://bun.sh/install | bash

# 使用
bun add lodash
bun install
```

**特点：**
- 极快（用 Zig 编写）
- 内置打包器
- Node.js 替代品

#### D. npm-check-updates ❌

```bash
# 这是更新工具，不是包管理器
npx npm-check-updates -u
```

**只是 npm 的辅助工具**

#### 性能对比

| 工具 | 安装速度 | 磁盘占用 | 生态 |
|------|---------|---------|------|
| **npm** | ⚡⚡ | 💾💾💾 | ⭐⭐⭐⭐⭐ |
| **Yarn** | ⚡⚡⚡ | 💾💾 | ⭐⭐⭐⭐⭐ |
| **pnpm** | ⚡⚡⚡⚡⚡ | 💾 | ⭐⭐⭐⭐ |
| **Bun** | ⚡⚡⚡⚡⚡ | 💾 | ⭐⭐⭐ |

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** ncu工具

### 题目

`npm-check-updates -u` 会做什么？

**选项：**
- A. 更新 package.json 但不安装
- B. 更新 package.json 并安装
- C. 只显示可更新的包
- D. 自动修复漏洞

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**npm-check-updates (ncu)**

#### 基础使用

```bash
# 查看可更新的包
npx npm-check-updates

# 输出：
lodash  ^4.17.0  →  ^4.17.21
react   ^17.0.0  →  ^18.2.0
```

#### -u 参数

```bash
npx npm-check-updates -u

# 更新 package.json
```

**Before：**
```json
{
  "dependencies": {
    "lodash": "^4.17.0",
    "react": "^17.0.0"
  }
}
```

**After：**
```json
{
  "dependencies": {
    "lodash": "^4.17.21",  // ✅ 已更新
    "react": "^18.2.0"     // ✅ 已更新
  }
}
```

**但依赖未安装！需要手动：**
```bash
npm install
```

#### 完整流程

```bash
# 1. 检查更新
npx ncu

# 2. 更新 package.json
npx ncu -u

# 3. 安装新版本
npm install

# 4. 测试
npm test
```

#### 高级用法

```bash
# 只更新 MINOR 和 PATCH
npx ncu --target minor

# 只更新特定包
npx ncu -u lodash react

# 排除某些包
npx ncu -u --reject webpack

# 交互式选择
npx ncu -i
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** ni工具

### 题目

`ni` 工具的作用是什么？

**选项：**
- A. Node.js 安装器
- B. 自动检测并使用正确的包管理器
- C. npm 初始化工具
- D. 网络诊断工具

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**@antfu/ni（智能包管理器代理）**

#### 自动检测

```bash
# 安装
npm install -g @antfu/ni

# 使用 ni（自动检测）
ni

# 在 npm 项目
ni  →  npm install

# 在 Yarn 项目
ni  →  yarn install

# 在 pnpm 项目
ni  →  pnpm install
```

**检测 lock 文件自动选择**

#### 命令映射

```bash
# ni - 安装依赖
ni             →  npm install / yarn / pnpm install
ni axios       →  npm install axios

# nr - 运行脚本
nr dev         →  npm run dev
nr             →  交互式选择脚本

# nlx - 执行命令
nlx vitest     →  npx vitest

# nu - 更新依赖
nu             →  npm update

# nun - 卸载
nun axios      →  npm uninstall axios

# nci - CI 安装
nci            →  npm ci
```

#### 检测逻辑

```
检查 lock 文件：
1. pnpm-lock.yaml  → pnpm
2. yarn.lock       → yarn
3. package-lock.json → npm
4. bun.lockb       → bun

没有 lock 文件 → 使用默认（通常是 npm）
```

#### 配置

```bash
# 设置默认包管理器
ni config set defaultAgent pnpm

# 或环境变量
export NI_DEFAULT_AGENT=pnpm
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** depcheck

### 题目

`depcheck` 工具可以检测什么？

**选项：**
- A. 未使用的依赖
- B. 缺失的依赖
- C. 过时的依赖
- D. A 和 B

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**depcheck 工具**

#### 基本使用

```bash
npx depcheck

# 输出：
Unused dependencies
* lodash
* moment

Missing dependencies
* axios (used in src/api.js)
```

#### 检测未使用的依赖

```json
{
  "dependencies": {
    "lodash": "^4.17.21",  // ❌ 代码中未使用
    "react": "^18.2.0"     // ✅ 使用中
  }
}
```

```javascript
// src/App.js
import React from 'react';  // ✅ react 被使用
// lodash 从未导入 ❌
```

**depcheck 发现：lodash 未使用**

#### 检测缺失的依赖

```javascript
// src/api.js
import axios from 'axios';  // ❌ package.json 中没有
```

```json
{
  "dependencies": {
    // axios 缺失
  }
}
```

**depcheck 发现：axios 缺失**

#### 配置

```json
{
  "scripts": {
    "check:deps": "depcheck"
  }
}
```

**package.json 或 .depcheckrc：**
```json
{
  "ignores": [
    "@types/*",
    "webpack"
  ],
  "skip-missing": false
}
```

#### CI 集成

```yaml
- name: Check Dependencies
  run: |
    npx depcheck
    if [ $? -ne 0 ]; then
      echo "Found unused or missing dependencies"
      exit 1
    fi
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 包分析工具

### 题目

如何分析和优化项目的依赖包？

**选项：**
- A. 使用 webpack-bundle-analyzer
- B. 使用 cost-of-modules
- C. 使用 npm ls
- D. 以上都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**依赖分析工具集**

#### A. webpack-bundle-analyzer ✅

```bash
npm install -D webpack-bundle-analyzer
```

**webpack.config.js：**
```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

```bash
npm run build
# 自动打开浏览器，显示可视化分析
```

**分析：**
- 打包后的文件大小
- 各模块占比
- 重复的依赖

#### B. cost-of-modules ✅

```bash
npx cost-of-modules

# 输出：
┌─────────────────┬──────────┬──────────┐
│ name            │ size     │ children │
├─────────────────┼──────────┼──────────┤
│ webpack         │ 12.5 MB  │ 542      │
│ @babel/core     │ 8.3 MB   │ 234      │
│ lodash          │ 1.4 MB   │ 0        │
└─────────────────┴──────────┴──────────┘
```

**分析：**
- node_modules 各包大小
- 依赖数量
- 找出最大的包

#### C. npm ls ✅

```bash
# 查看依赖树
npm ls

# 查看特定包
npm ls lodash

# 只看顶层
npm ls --depth=0

# JSON 格式
npm ls --json > deps.json
```

**分析：**
- 依赖关系
- 版本冲突
- 重复依赖

#### 综合分析方案

**package.json：**
```json
{
  "scripts": {
    "analyze:bundle": "webpack --profile --json > stats.json && webpack-bundle-analyzer stats.json",
    "analyze:modules": "cost-of-modules --less --no-install",
    "analyze:tree": "npm ls --all > dependency-tree.txt",
    "analyze:size": "du -sh node_modules/* | sort -hr | head -20",
    "analyze:duplicate": "npm-check-duplicates",
    "analyze": "npm-run-all analyze:*"
  }
}
```

#### 优化建议

**1. 替换大包：**
```json
{
  "dependencies": {
    "dayjs": "^1.11.0",        // 2KB ✅
    // "moment": "^2.29.0"     // 232KB ❌
    
    "lodash-es": "^4.17.21",   // Tree-shakable ✅
    // "lodash": "^4.17.21"    // 全量 ❌
  }
}
```

**2. 代码分割：**
```javascript
// 动态导入
const lodash = () => import('lodash');
```

**3. 移除未使用：**
```bash
npx depcheck
npm uninstall unused-package
```

**4. 更新依赖：**
```bash
npx npm-check-updates -u
npm install
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** Monorepo工具

### 题目

对比 Lerna、Nx 和 Turborepo 的特点。

<details>
<summary>查看答案</summary>

### ✅ 答案

**Monorepo 工具对比**

#### Lerna

```bash
npm install -g lerna
lerna init
```

**特点：**
- 🎯 专注于发布管理
- 📦 版本管理（Fixed/Independent）
- 🚀 发布流程自动化

**lerna.json：**
```json
{
  "version": "independent",
  "npmClient": "npm",
  "command": {
    "publish": {
      "conventionalCommits": true
    }
  }
}
```

**优势：**
- 成熟稳定
- 版本管理强大
- 社区庞大

**劣势：**
- 构建性能一般
- 缺少缓存机制

#### Nx

```bash
npx create-nx-workspace
```

**特点：**
- ⚡ 智能构建缓存
- 📊 依赖图分析
- 🎯 受影响的项目检测
- 🔌 插件生态

**nx.json：**
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test"],
        "parallel": 3
      }
    }
  }
}
```

**优势：**
- 性能最强
- 智能缓存
- 可视化工具

**劣势：**
- 学习曲线陡
- 配置复杂

#### Turborepo

```bash
npx create-turbo@latest
```

**特点：**
- 🚀 零配置缓存
- 📦 远程缓存
- ⚡ 增量构建
- 🎯 简单易用

**turbo.json：**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "cache": false
    }
  }
}
```

**优势：**
- 零配置
- 性能优秀
- 学习成本低

**劣势：**
- 生态较新
- 功能相对简单

### 📖 解析

**对比表格**

| 特性 | Lerna | Nx | Turborepo |
|------|-------|----|-----------| 
| **学习曲线** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **构建性能** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **缓存机制** | ❌ | ✅ 本地+云 | ✅ 本地+云 |
| **版本管理** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| **生态成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **推荐场景** | 发布管理 | 大型项目 | 快速开发 |

**选择建议：**

```
小型 Monorepo（< 5 包）
→ pnpm workspaces + Changesets

中型 Monorepo（5-20 包）
→ Turborepo

大型 Monorepo（> 20 包）
→ Nx

需要复杂版本管理
→ Lerna + Turborepo/Nx
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 工具链集成

### 题目

如何搭建完整的 npm 开发工具链？

<details>
<summary>查看答案</summary>

### ✅ 答案

**完整 npm 工具链配置**

#### 1. 包管理器选择

```bash
# 使用 pnpm（性能最佳）
npm install -g pnpm

# 或 ni（智能代理）
npm install -g @antfu/ni
```

#### 2. Node.js 版本管理

```bash
# 安装 fnm（最快）
curl -fsSL https://fnm.vercel.app/install | bash

# .nvmrc
echo "18.16.0" > .nvmrc

# 自动切换
fnm use
```

#### 3. 依赖管理工具

**package.json：**
```json
{
  "scripts": {
    "deps:check": "depcheck",
    "deps:update": "npm-check -u",
    "deps:audit": "npm audit",
    "deps:analyze": "cost-of-modules",
    "deps:unused": "npx unimported"
  },
  "devDependencies": {
    "depcheck": "^1.4.0",
    "npm-check": "^6.0.0"
  }
}
```

#### 4. 代码质量工具

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

#### 5. Git Hooks

```bash
# 安装 husky + lint-staged
pnpm add -D husky lint-staged

# 初始化
pnpm exec husky install
```

**package.json：**
```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,ts}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**.husky/pre-commit：**
```bash
#!/bin/sh
npx lint-staged
```

#### 6. 发布工具

```bash
pnpm add -D @changesets/cli

# 初始化
pnpm exec changeset init
```

**package.json：**
```json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

#### 7. CI/CD 配置

**.github/workflows/ci.yml：**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm run lint
      - run: pnpm run type-check
      - run: pnpm run test
      - run: pnpm run build
      
      - run: pnpm run deps:check
      - run: pnpm audit
```

#### 8. 完整 package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    
    "deps:check": "depcheck",
    "deps:update": "npm-check -u",
    "deps:audit": "npm audit",
    "deps:analyze": "cost-of-modules",
    
    "prepare": "husky install",
    "changeset": "changeset",
    "release": "pnpm build && changeset publish",
    
    "precommit": "lint-staged",
    "prepush": "pnpm run type-check && pnpm run test"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "depcheck": "^1.4.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "npm-check": "^6.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "vitest": "^0.34.0"
  }
}
```

### 📖 解析

**工具链架构**

```
开发工具链
├── 包管理器：pnpm + ni
├── 版本管理：fnm + .nvmrc
├── 依赖管理：depcheck + npm-check
├── 代码质量：ESLint + Prettier + TypeScript
├── Git Hooks：Husky + lint-staged
├── 发布管理：Changesets
├── CI/CD：GitHub Actions
└── 监控分析：cost-of-modules + webpack-bundle-analyzer
```

**工作流程：**

```
开发 → Git Hooks → CI → 发布
  ↓       ↓        ↓     ↓
编码    lint     测试  版本管理
       format    构建  自动发布
       类型检查   安全  变更日志
```

</details>

---

**导航**  
[上一章：第 14 章面试题](./chapter-14.md) | [返回目录](../README.md) | [下一章：第 16 章面试题](./chapter-16.md)
