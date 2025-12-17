# 第 10 章：npm link 本地开发 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** npm link基础

### 题目

`npm link` 创建的是什么类型的链接？

**选项：**
- A. 硬链接（Hard Link）
- B. 符号链接（Symbolic Link）
- C. 副本（Copy）
- D. 引用（Reference）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm link 机制**

#### 符号链接（Symlink）

```bash
# 在包目录执行
cd /path/to/my-package
npm link

# 创建全局符号链接
~/.npm-global/lib/node_modules/my-package
    ↓ (符号链接)
/path/to/my-package
```

#### 在项目中使用

```bash
cd /path/to/my-app
npm link my-package

# 创建本地符号链接
/path/to/my-app/node_modules/my-package
    ↓ (符号链接)
~/.npm-global/lib/node_modules/my-package
    ↓ (符号链接)
/path/to/my-package
```

**双重符号链接**

#### 验证链接

```bash
ls -la node_modules/my-package
# lrwxr-xr-x  ... my-package -> /path/to/my-package
```

**`l` 开头表示符号链接**

#### 硬链接 vs 符号链接

| 特性 | 硬链接 | 符号链接 |
|------|--------|---------|
| 跨文件系统 | ❌ | ✅ |
| 链接目录 | ❌ | ✅ |
| 删除源文件 | 不影响 | 变成悬空链接 |
| npm link | ❌ | ✅ |
| pnpm store | ✅ | ❌ |

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** link生命周期

### 题目

执行 `npm link` 会自动运行包的 `prepare` 脚本。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**npm link 生命周期**

```json
{
  "scripts": {
    "prepare": "npm run build"
  }
}
```

```bash
npm link

# 执行顺序：
# 1. preinstall
# 2. install
# 3. postinstall
# 4. prepare  ✅ 自动执行
```

#### prepare 钩子

**执行时机：**
- `npm install`（无参数）
- `npm publish`
- `npm pack`
- `npm link`  ✅

**用途：** 确保构建产物存在

**示例：**

```json
{
  "name": "my-package",
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "prepare": "npm run build"
  }
}
```

```bash
npm link
# 自动执行 build
# 确保 dist/ 目录存在
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 取消链接

### 题目

如何取消 npm link 创建的链接？

**选项：**
- A. npm remove package-name
- B. npm unlink package-name
- C. npm uninstall package-name
- D. rm node_modules/package-name

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**取消 npm link**

#### 在项目中取消链接

```bash
cd /path/to/my-app

# 方法 1
npm unlink my-package

# 方法 2
npm unlink --no-save my-package

# 方法 3
npm uninstall my-package
```

**移除符号链接**

#### 在包目录取消全局链接

```bash
cd /path/to/my-package

npm unlink
# 或
npm unlink -g
```

**从全局移除**

#### 完整流程

```bash
# 1. 取消项目中的链接
cd /path/to/my-app
npm unlink my-package

# 2. 取消全局链接
cd /path/to/my-package
npm unlink -g

# 3. 重新安装正常版本
cd /path/to/my-app
npm install my-package
```

#### 批量取消链接

```bash
# 查看所有链接
npm ls -g --depth=0 --link=true

# 取消所有链接
npm unlink -g package1 package2 package3
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** link问题

### 题目

使用 npm link 可能遇到哪些问题？

**选项：**
- A. 模块找不到错误
- B. TypeScript 类型定义不生效
- C. 代码修改后不自动更新
- D. 依赖版本冲突

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**npm link 常见问题**

#### A. 模块找不到 ✅

**问题：**

```bash
npm link my-package
node app.js

# Error: Cannot find module 'my-package'
```

**原因：** link 未正确创建

**解决：**

```bash
# 1. 检查链接
ls -la node_modules/my-package

# 2. 重新链接
npm unlink my-package
cd /path/to/my-package
npm link
cd /path/to/my-app
npm link my-package
```

#### B. TypeScript 类型不生效 ✅

**问题：**

```typescript
import { func } from 'my-package';
// TS2307: Cannot find module 'my-package'
```

**原因：** 类型定义文件未构建

**解决：**

```json
// my-package/package.json
{
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepare": "npm run build",  // ✅ 自动构建
    "watch": "tsc --watch"       // 开发时使用
  }
}
```

```bash
# 开发模式
cd /path/to/my-package
npm run watch  # 监听变化

# 或手动构建
npm run build
```

#### C. 代码修改不更新 ✅

**问题：** 修改包代码后，项目中不生效

**原因：** 需要重新构建

**解决方案 1：监听模式**

```json
{
  "scripts": {
    "watch": "tsc --watch"
  }
}
```

```bash
cd /path/to/my-package
npm run watch  # 保持运行
```

**解决方案 2：nodemon**

```bash
cd /path/to/my-app
npm install -D nodemon

npx nodemon --watch node_modules/my-package app.js
```

#### D. 依赖版本冲突 ✅

**问题：**

```
my-app
├── react@18.0.0
└── my-package (link)
    └── node_modules
        └── react@17.0.0  ← 冲突
```

**解决：** 使用 peerDependencies

```json
// my-package/package.json
{
  "peerDependencies": {
    "react": "^17.0.0 || ^18.0.0"
  },
  "devDependencies": {
    "react": "^18.0.0"  // 只用于开发
  }
}
```

#### 调试技巧

```bash
# 1. 查看链接状态
npm ls --link

# 2. 查看全局链接
npm ls -g --depth=0 --link=true

# 3. 查看符号链接
ls -la node_modules/ | grep ^l
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 多包联调

### 题目

如何同时 link 多个相互依赖的包？

**场景：**
- pkg-a 依赖 pkg-b
- my-app 依赖 pkg-a 和 pkg-b

**选项：**
- A. 无法实现
- B. 按依赖顺序 link
- C. 使用 lerna bootstrap
- D. 使用 Workspaces

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B、C、D

### 📖 解析

**多包联调**

#### B. 按依赖顺序 link ✅

```bash
# 1. link pkg-b（无依赖，先 link）
cd /path/to/pkg-b
npm link

# 2. link pkg-a（依赖 pkg-b）
cd /path/to/pkg-a
npm link pkg-b  # 使用 pkg-b 的 link
npm link        # 将 pkg-a 暴露为 link

# 3. 在项目中使用
cd /path/to/my-app
npm link pkg-a pkg-b
```

**依赖关系：**

```
my-app/node_modules/
├── pkg-a → /path/to/pkg-a
│   └── node_modules/
│       └── pkg-b → /path/to/pkg-b
└── pkg-b → /path/to/pkg-b
```

#### C. 使用 Lerna ✅

```bash
# 安装 lerna
npm install -g lerna

# 初始化
lerna init

# 目录结构
my-monorepo/
├── lerna.json
├── package.json
└── packages/
    ├── pkg-a/
    ├── pkg-b/
    └── my-app/

# link 所有包
lerna bootstrap --force-local
```

**自动处理依赖关系**

#### D. 使用 Workspaces ✅（推荐）

**npm/yarn/pnpm Workspaces：**

```json
// package.json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

```
my-monorepo/
├── package.json
├── packages/
│   ├── pkg-a/
│   ├── pkg-b/
│   └── my-app/
```

```bash
# 一次安装，自动 link
npm install
```

**自动链接，无需手动 link**

#### 完整示例

**手动 link 脚本：**

```bash
#!/bin/bash

# link-all.sh

# 1. link pkg-b
cd packages/pkg-b
npm link

# 2. link pkg-a
cd ../pkg-a
npm link pkg-b
npm link

# 3. link 到 my-app
cd ../my-app
npm link pkg-a pkg-b

echo "All packages linked!"
```

**Workspaces（推荐）：**

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "setup": "npm install"
  }
}
```

```bash
npm run setup
# 自动完成所有链接
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** link替代方案

### 题目

pnpm link 和 npm link 的主要区别是什么？

**选项：**
- A. pnpm link 使用硬链接
- B. pnpm link 更快
- C. pnpm link 需要全局安装
- D. 没有区别

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**pnpm link 机制**

#### npm link

```bash
cd /path/to/pkg
npm link  # 创建到全局

cd /path/to/app
npm link pkg  # 从全局链接
```

#### pnpm link

**方法 1：全局 link**

```bash
cd /path/to/pkg
pnpm link --global  # 必须指定 --global

cd /path/to/app
pnpm link --global pkg
```

**方法 2：直接 link**

```bash
cd /path/to/app
pnpm link /path/to/pkg  # 直接指定路径
```

#### 主要区别

**A. 链接类型：** 都使用符号链接

**B. 速度：** 相似

**C. 全局安装要求：** ✅ 关键区别

```bash
# npm link
npm link  # 自动全局

# pnpm link
pnpm link --global  # 必须指定
```

#### 推荐方式

**pnpm 推荐直接指定路径：**

```bash
pnpm link ../pkg-a ../pkg-b
```

**或使用 Workspaces：**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

```bash
pnpm install
# 自动链接
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** link与安装

### 题目

执行以下操作后，my-package 来自哪里？

```bash
cd /path/to/my-app
npm link my-package
npm install
```

**选项：**
- A. 本地 link
- B. npm registry
- C. 两者都有（冲突）
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm install 覆盖 link**

#### 执行流程

**1. 初始状态：**

```bash
npm link my-package

node_modules/
└── my-package → /path/to/my-package  # 符号链接
```

**2. 执行 npm install：**

```bash
npm install

# 读取 package.json
# 安装所有依赖
# 覆盖 my-package 符号链接
```

**3. 最终结果：**

```
node_modules/
└── my-package/  # 普通安装（来自 registry）
```

**link 被覆盖！**

#### 保持 link

**方法 1：不运行 npm install**

```bash
npm ci  # 严格模式，不覆盖 link
```

**方法 2：install 后重新 link**

```bash
npm install
npm link my-package  # 重新创建 link
```

**方法 3：使用 file: 协议**

```json
{
  "dependencies": {
    "my-package": "file:../my-package"
  }
}
```

```bash
npm install
# 复制而不是 link
```

**方法 4：使用 Workspaces**

```json
{
  "workspaces": [
    "../my-package"
  ]
}
```

```bash
npm install
# 自动 link，不会被覆盖
```

#### 最佳实践

**开发时：**

```bash
# 使用 Workspaces
{
  "workspaces": ["packages/*"]
}
```

**或使用 link 但注意：**

```bash
# 1. 初始安装
npm install

# 2. 链接开发包
npm link my-package

# 3. 之后避免运行 npm install
# 使用 npm ci 或指定包名
npm install lodash  # ✅ 不影响 link
npm install         # ❌ 覆盖 link
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** link最佳实践

### 题目

为什么生产环境不推荐使用 npm link？

**选项：**
- A. 性能问题
- B. 符号链接在部署时不可靠
- C. 违反安全规范
- D. npm 禁止使用

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm link 不适合生产环境**

#### 问题分析

**1. 符号链接依赖本地路径**

```bash
# 开发环境
node_modules/my-package → /Users/dev/projects/my-package

# 部署到服务器
node_modules/my-package → /Users/dev/projects/my-package
                          ↑ 路径不存在！❌
```

**2. Docker 镜像问题**

```dockerfile
# Dockerfile
COPY package*.json ./
RUN npm ci  # ✅ 正常安装

# 如果有 link
COPY node_modules ./  # ❌ 符号链接失效
```

**3. CI/CD 环境**

```yaml
# GitHub Actions
- name: Install
  run: npm ci

# 无法访问开发机器的路径
# link 失效
```

#### 正确做法

**开发环境：**

```bash
# 使用 npm link
npm link my-package

# 或 Workspaces
{
  "workspaces": ["packages/*"]
}
```

**生产环境：**

```bash
# 方法 1：发布到 npm
npm publish
npm install my-package

# 方法 2：私有 registry
npm publish --registry https://npm.company.com
npm install my-package --registry https://npm.company.com

# 方法 3：Git 依赖
{
  "dependencies": {
    "my-package": "git+https://github.com/user/my-package.git#v1.0.0"
  }
}
```

#### 部署流程

**开发阶段：**

```bash
# Monorepo + Workspaces
my-project/
├── packages/
│   ├── lib/
│   └── app/
```

```json
{
  "workspaces": ["packages/*"]
}
```

**构建阶段：**

```bash
# 构建所有包
npm run build

# 生成产物
packages/
├── lib/dist/
└── app/dist/
```

**部署阶段：**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 只复制构建产物和 package.json
COPY package.json ./
COPY dist ./dist

# 正常安装依赖（从 registry）
RUN npm ci --production

CMD ["node", "dist/server.js"]
```

**不包含 link，只用正式安装的包**

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** link调试

### 题目

npm link 后代码修改不生效，如何调试？

<details>
<summary>查看答案</summary>

### ✅ 答案

**调试步骤**

#### 1. 验证链接是否存在

```bash
cd /path/to/my-app

# 检查符号链接
ls -la node_modules/my-package

# 输出应该显示：
# lrwxr-xr-x ... my-package -> /path/to/my-package

# 如果不是符号链接，重新 link
npm link my-package
```

#### 2. 检查包是否需要构建

```bash
cd /path/to/my-package

# 查看 package.json
cat package.json
```

```json
{
  "main": "./dist/index.js",  // 入口是构建产物
  "scripts": {
    "build": "tsc"
  }
}
```

**需要构建才能生效！**

```bash
# 手动构建
npm run build

# 或监听模式
npm run build -- --watch
```

#### 3. 检查 Node.js 缓存

```bash
# 清除 require 缓存
node --eval "delete require.cache[require.resolve('my-package')]"

# 或重启应用
# Ctrl+C 然后重新运行
```

#### 4. 使用 nodemon 自动重启

```bash
npm install -D nodemon

# 监听 link 的包
nodemon --watch node_modules/my-package/dist app.js
```

#### 5. 检查 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,  // 增量编译
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

```bash
# 清除构建缓存
rm .tsbuildinfo
npm run build
```

### 📖 解析

**完整开发工作流**

#### 包的配置（my-package）

```json
{
  "name": "my-package",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "prepare": "npm run build"
  },
  "files": ["dist"]
}
```

**tsconfig.json：**

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

#### 开发流程

**终端 1（包的监听）：**

```bash
cd /path/to/my-package
npm run watch  # 保持运行，监听变化
```

**终端 2（应用的运行）：**

```bash
cd /path/to/my-app
nodemon --watch node_modules/my-package app.js
```

**修改代码 → 自动构建 → 自动重启 → 生效！**

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 替代方案

### 题目

除了 npm link，还有哪些本地包开发的替代方案？

<details>
<summary>查看答案</summary>

### ✅ 答案

**npm link 替代方案**

#### 1. file: 协议

```json
{
  "dependencies": {
    "my-package": "file:../my-package"
  }
}
```

```bash
npm install
```

**特点：**
- 复制而不是链接
- 修改需要重新安装
- 适合不常改动的包

#### 2. yalc

```bash
# 安装
npm install -g yalc

# 在包目录
cd /path/to/my-package
yalc publish

# 在项目中
cd /path/to/my-app
yalc add my-package

# 更新
cd /path/to/my-package
yalc push  # 自动更新所有使用方
```

**优势：**
- 类似 npm link 但更可靠
- 支持推送更新
- 不依赖符号链接

#### 3. pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

**目录结构：**

```
my-monorepo/
├── pnpm-workspace.yaml
├── packages/
│   ├── my-package/
│   └── my-app/
```

```bash
pnpm install
```

**优势：**
- 自动链接
- 严格依赖管理
- 性能最好

#### 4. Lerna + Yarn Workspaces

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

```bash
lerna bootstrap
```

**优势：**
- 版本管理
- 统一发布
- 成熟稳定

#### 5. Verdaccio（本地 registry）

```bash
# 安装运行 Verdaccio
npm install -g verdaccio
verdaccio

# 发布到本地
npm publish --registry http://localhost:4873

# 使用
npm install my-package --registry http://localhost:4873
```

**优势：**
- 模拟真实 npm 环境
- 适合测试发布流程

### 📖 解析

**方案对比**

| 方案 | 安装速度 | 热更新 | 可靠性 | 适用场景 |
|------|---------|--------|--------|----------|
| **npm link** | ⚡⚡⚡ | ✅ | ⭐⭐ | 临时调试 |
| **file:** | ⚡ | ❌ | ⭐⭐⭐ | 稳定包 |
| **yalc** | ⚡⚡ | ✅ | ⭐⭐⭐⭐ | 推荐 |
| **Workspaces** | ⚡⚡⚡ | ✅ | ⭐⭐⭐⭐⭐ | Monorepo |
| **Verdaccio** | ⚡ | ❌ | ⭐⭐⭐⭐⭐ | 发布测试 |

**推荐选择：**

- 🏅 **Monorepo**：pnpm Workspaces
- 🥈 **单包调试**：yalc
- 🥉 **临时测试**：npm link

</details>

---

**导航**  
[上一章：第 9 章面试题](./chapter-09.md) | [返回目录](../README.md) | [下一章：第 11 章面试题](./chapter-11.md)
