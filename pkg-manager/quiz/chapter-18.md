# 第 18 章：Yarn Plug'n'Play 深度解析 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** PnP基础

### 题目

Yarn PnP 的全称是什么？

**选项：**
- A. Plug and Play
- B. Plug'n'Play
- C. Package and Play
- D. Parallel and Performance

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Plug'n'Play（即插即用）**

#### 概念

```bash
# Yarn 2+ 的创新特性
# 移除 node_modules
# 直接从缓存运行包
```

**目标：**
- 更快的安装
- 更小的磁盘占用
- 更严格的依赖管理

#### 启用 PnP

```yaml
# .yarnrc.yml
nodeLinker: pnp
```

```bash
yarn install

# 生成：
.pnp.cjs  # 依赖映射文件
.yarn/cache/  # 压缩包缓存
```

**无 node_modules 目录！**

#### 运行应用

```bash
# 传统方式
node index.js  # ❌ 找不到模块

# PnP 方式
yarn node index.js  # ✅ 通过 PnP 加载

# 或配置
NODE_OPTIONS="--require ./.pnp.cjs" node index.js
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** PnP文件

### 题目

`.pnp.cjs` 文件应该提交到版本控制系统。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**PnP 文件管理**

#### .pnp.cjs 必须提交

```bash
# ✅ 提交
git add .pnp.cjs
git commit -m "chore: update dependencies"
```

**原因：**
1. 包含依赖映射信息
2. 确保团队环境一致
3. 允许 Zero-Installs

#### .gitignore 配置

```
# ✅ 保留
# .pnp.cjs  # 不忽略

# ✅ 提交缓存（Zero-Installs）
# .yarn/cache/

# ❌ 忽略
.pnp.loader.mjs
.yarn/unplugged/
.yarn/build-state.yml
.yarn/install-state.gz
```

#### 与 Zero-Installs

```bash
# 提交所有必要文件
git add .pnp.cjs .yarn/cache

# clone 后立即可用
git clone repo
cd repo
yarn  # 秒级完成！
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** PnP兼容性

### 题目

如果某个包不兼容 PnP，应该怎么办？

**选项：**
- A. 放弃使用 PnP
- B. 使用 packageExtensions 修复
- C. 切换回 node-modules 模式
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**PnP 兼容性处理**

#### 方案 B：packageExtensions ✅

**.yarnrc.yml：**
```yaml
packageExtensions:
  "legacy-package@*":
    peerDependencies:
      react: "*"
    dependencies:
      missing-dep: "^1.0.0"
```

**修复包的元数据**

#### 方案 C：切换模式 ✅

```yaml
# .yarnrc.yml
nodeLinker: node-modules  # 回退到传统模式
```

```bash
yarn install
# 生成 node_modules/
```

**完全兼容**

#### 混合模式

```yaml
# .yarnrc.yml
nodeLinker: pnp

# 特定包使用 node-modules
pnpUnpluggedFolder: .yarn/unplugged

packageExtensions:
  "incompatible-package@*":
    unplugged: true
```

**大部分包用 PnP，少数不兼容包解压**

#### 检查兼容性

```bash
# 安装并测试
yarn install
yarn node index.js

# 如果报错
Error: Cannot find module 'some-package'

# 添加到 packageExtensions
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** PnP优势

### 题目

Yarn PnP 相比传统 node_modules 有哪些优势？

**选项：**
- A. 安装速度更快
- B. 磁盘占用更小
- C. 依赖管理更严格
- D. 完美兼容所有包

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C

### 📖 解析

**PnP 优势分析**

#### A. 安装速度更快 ✅

```bash
# node-modules
yarn install  # 45s
# 需要解压到 node_modules

# PnP
yarn install  # 5s ⚡⚡⚡⚡⚡
# 只生成 .pnp.cjs 映射文件
```

**快 9 倍！**

#### B. 磁盘占用更小 ✅

```bash
# node-modules
node_modules/  # 500MB（重复依赖）

# PnP
.yarn/cache/  # 100MB（Zip 压缩，去重）
.pnp.cjs      # 1MB
```

**节省 80% 空间！**

#### C. 依赖管理更严格 ✅

**node-modules（宽松）：**
```javascript
// 未声明的依赖也能访问
const pkg = require('undeclared-package');
// ✅ 可能成功（幽灵依赖）
```

**PnP（严格）：**
```javascript
const pkg = require('undeclared-package');
// ❌ Error: Package not found
```

**消除幽灵依赖问题**

#### D. 完美兼容 ❌

**部分包可能不兼容：**
- 使用 `__dirname` 查找模块
- 直接读取 node_modules
- Native 模块
- 某些构建工具

**需要配置或回退**

#### 性能对比表

| 特性 | node-modules | PnP |
|------|--------------|-----|
| **安装速度** | ⚡⚡ | ⚡⚡⚡⚡⚡ |
| **磁盘占用** | 💾💾💾 | 💾 |
| **严格性** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **兼容性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **启动速度** | ⚡⚡⚡ | ⚡⚡⚡⚡⚡ |

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** .pnp.cjs结构

### 题目

`.pnp.cjs` 文件包含什么内容？

**选项：**
- A. 包的源代码
- B. 依赖映射表
- C. 包的配置
- D. 编译后的代码

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**.pnp.cjs 内容**

#### 依赖映射表

```javascript
// .pnp.cjs（简化示例）
const packageRegistry = new Map([
  ["lodash", [
    ["npm:4.17.21", {
      packageLocation: "./.yarn/cache/lodash-npm-4.17.21-xxx.zip/node_modules/lodash/",
      packageDependencies: new Map([
        ["lodash", "npm:4.17.21"]
      ])
    }]
  ]],
  
  ["react", [
    ["npm:18.2.0", {
      packageLocation: "./.yarn/cache/react-npm-18.2.0-xxx.zip/node_modules/react/",
      packageDependencies: new Map([
        ["react", "npm:18.2.0"],
        ["loose-envify", "npm:1.4.0"]
      ])
    }]
  ]]
]);

// Module resolver
function resolveToUnqualified(request, issuer) {
  // 查找逻辑
}

module.exports = {
  packageRegistry,
  resolveToUnqualified,
  // ...
};
```

#### 主要部分

**1. Package Registry（包注册表）：**
```javascript
{
  "packageName": {
    "version": {
      location: "path/to/package",
      dependencies: {...}
    }
  }
}
```

**2. Resolution Logic（解析逻辑）：**
```javascript
// 拦截 require/import
// 根据映射表查找包位置
// 从 Zip 中加载模块
```

**3. Fallback Handlers（回退处理）：**
```javascript
// 处理边缘情况
// 错误提示
```

#### 工作流程

```javascript
// 代码
const lodash = require('lodash');

// PnP 拦截
// 1. 查询 packageRegistry
// 2. 找到 lodash@4.17.21
// 3. 获取 location
// 4. 从 .yarn/cache/*.zip 读取
// 5. 返回模块
```

**全程无需解压！**

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** PnP Loader

### 题目

如何让 Node.js 识别 PnP？

**选项：**
- A. 自动识别
- B. 使用 `yarn node`
- C. 设置 NODE_OPTIONS
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**PnP 加载方式**

#### 方法 1：yarn node ✅

```bash
# 直接运行
yarn node index.js

# Yarn 自动注入 PnP loader
```

**脚本中：**
```json
{
  "scripts": {
    "start": "yarn node server.js",
    "dev": "yarn node --watch index.js"
  }
}
```

#### 方法 2：NODE_OPTIONS ✅

```bash
# 环境变量
NODE_OPTIONS="--require $(pwd)/.pnp.cjs" node index.js
```

**package.json：**
```json
{
  "scripts": {
    "start": "NODE_OPTIONS='--require ./.pnp.cjs' node server.js"
  }
}
```

#### 方法 3：入口文件

```javascript
// index.js
require('./.pnp.cjs').setup();

// 应用代码
const express = require('express');
```

#### IDE 集成

**VSCode：**
```bash
# 安装 SDK
yarn sdks vscode

# 生成 .vscode/settings.json
```

```json
{
  "typescript.tsdk": ".yarn/sdks/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

**Webstorm/IDEA：**
```bash
yarn sdks idea
```

#### Docker 中使用

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 PnP 文件
COPY .pnp.cjs ./
COPY .yarn/cache ./. yarn/cache

# 使用 yarn node
CMD ["yarn", "node", "server.js"]
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 严格模式

### 题目

PnP 严格模式如何防止幽灵依赖？

```json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

```javascript
const lodash = require('lodash');  // express 依赖 lodash
```

**选项：**
- A. 正常运行
- B. 警告但运行
- C. 报错拒绝运行
- D. 自动安装 lodash

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**PnP 严格依赖检查**

#### 传统 node_modules（宽松）

```
node_modules/
├── express/
└── lodash/  ← express 的依赖，被提升
```

```javascript
const lodash = require('lodash');
// ✅ 成功（幽灵依赖）
```

**问题：** 未声明的依赖可以访问

#### PnP（严格）

```javascript
const lodash = require('lodash');

// ❌ Error:
// lodash@npm:4.17.21 is not listed as a dependency
// Required by: my-app@workspace:.
```

**强制声明所有依赖**

#### 正确做法

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"  // ✅ 显式声明
  }
}
```

```javascript
const lodash = require('lodash');
// ✅ 成功
```

#### 优势

**消除隐患：**
```bash
# 场景：升级 express
yarn upgrade express

# 新版 express 不再依赖 lodash

# node_modules（幽灵依赖问题）
# lodash 消失，代码崩溃 ❌

# PnP（早已报错，提前发现）
# 已显式声明 lodash，正常运行 ✅
```

#### 迁移到 PnP

```bash
# 1. 启用 PnP
yarn set version berry

# 2. 安装
yarn install

# 3. 运行测试
yarn test

# 4. 修复报错
# Error: package-x not declared
# → 添加到 dependencies

# 5. 提交
git add .pnp.cjs .yarnrc.yml
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** PnP性能

### 题目

为什么 PnP 比 node_modules 快？

**选项：**
- A. 跳过解压步骤
- B. 更好的缓存策略
- C. 直接从 Zip 读取
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**PnP 性能优化原理**

#### A. 跳过解压 ✅

**node_modules：**
```bash
yarn install

# 1. 下载 tar.gz
# 2. 解压到 node_modules/
# 3. 创建目录结构
# 4. 写入大量文件

# 耗时：30s（I/O 密集）
```

**PnP：**
```bash
yarn install

# 1. 下载 tar.gz
# 2. 转换为 Zip
# 3. 存储到 .yarn/cache/
# 4. 生成 .pnp.cjs

# 耗时：5s ⚡
```

**节省 25s！**

#### B. 更好的缓存 ✅

**全局共享缓存：**
```
~/.yarn/berry/cache/
├── lodash-npm-4.17.21-xxx.zip
└── react-npm-18.2.0-xxx.zip
```

**项目缓存（Zero-Installs）：**
```
project/.yarn/cache/
├── lodash-npm-4.17.21-xxx.zip
└── react-npm-18.2.0-xxx.zip
```

**提交到 Git，clone 后秒装**

#### C. 直接从 Zip 读取 ✅

```javascript
// 传统方式
require('lodash');
// → 读取 node_modules/lodash/index.js
// → 磁盘 I/O

// PnP 方式
require('lodash');
// → 查询 .pnp.cjs 映射
// → 从 .yarn/cache/*.zip 读取
// → Zip 文件系统，更快
```

**减少磁盘碎片**

#### 性能对比

**安装时间：**
```bash
# 首次安装
node_modules: 45s
PnP:          5s  ⚡⚡⚡⚡⚡

# 二次安装（有缓存）
node_modules: 15s
PnP:          2s  ⚡⚡⚡⚡⚡

# CI（Zero-Installs）
node_modules: 45s
PnP:          0s  ⚡⚡⚡⚡⚡（直接使用）
```

**启动时间：**
```bash
# require() 性能
node_modules: 100ms
PnP:          50ms  ⚡⚡

# 原因：更好的局部性，减少文件系统调用
```

**磁盘占用：**
```bash
# 单项目
node_modules: 500MB
PnP:          100MB  ⚡⚡⚡⚡⚡

# 多项目（3个）
node_modules: 1.5GB（3x500MB）
PnP:          100MB（共享缓存）⚡⚡⚡⚡⚡
```

#### 架构优势

**node_modules 问题：**
```
问题 1：大量小文件
- 500,000+ 文件
- 文件系统元数据开销大

问题 2：重复依赖
- 同一包在多处重复
- 磁盘浪费

问题 3：深层嵌套
- 路径过长（Windows）
- 访问慢
```

**PnP 解决方案：**
```
优势 1：Zip 存储
- 单个压缩文件
- 减少元数据

优势 2：内容寻址
- 同一包只存一份
- 去重

优势 3：扁平映射
- .pnp.cjs 查找表
- O(1) 查找
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** PnP迁移

### 题目

如何将现有项目迁移到 Yarn PnP？

<details>
<summary>查看答案</summary>

### ✅ 答案

**PnP 迁移步骤**

#### 1. 升级到 Yarn Berry

```bash
# 在项目根目录
yarn set version berry

# 检查版本
yarn --version
# 3.6.0
```

#### 2. 配置 PnP

**.yarnrc.yml：**
```yaml
nodeLinker: pnp

# 可选：启用 SDK
yarnPath: .yarn/releases/yarn-3.6.0.cjs
```

#### 3. 重新安装

```bash
# 删除旧的
rm -rf node_modules package-lock.json

# 安装
yarn install

# 生成 .pnp.cjs
```

#### 4. 测试运行

```bash
# 运行测试
yarn test

# 如果失败，查看错误
```

#### 5. 处理不兼容包

**错误示例：**
```
Error: Cannot find module 'some-package'
```

**解决方案 A：packageExtensions**
```yaml
# .yarnrc.yml
packageExtensions:
  "problematic-package@*":
    dependencies:
      missing-dep: "^1.0.0"
```

**解决方案 B：Unplug**
```yaml
packageExtensions:
  "native-package@*":
    unplugged: true
```

**解决方案 C：回退**
```yaml
nodeLinker: node-modules
```

#### 6. IDE 集成

```bash
# VSCode
yarn sdks vscode

# TypeScript
yarn add -D typescript
yarn sdks typescript
```

#### 7. 更新 CI/CD

```yaml
# .github/workflows/ci.yml
- uses: actions/setup-node@v3

- name: Enable Corepack
  run: corepack enable

- name: Install dependencies
  run: yarn install --immutable

- name: Run tests
  run: yarn test
```

#### 8. 更新脚本

**package.json：**
```json
{
  "scripts": {
    "start": "yarn node server.js",
    "dev": "yarn node --watch index.js",
    "test": "yarn node --experimental-vm-modules node_modules/jest/bin/jest.js"
  }
}
```

### 📖 解析

**迁移检查清单**

**✅ 必须：**
- [ ] 升级到 Yarn Berry
- [ ] 配置 .yarnrc.yml
- [ ] 重新安装依赖
- [ ] 测试所有功能
- [ ] 更新 CI/CD

**✅ 推荐：**
- [ ] 启用 Zero-Installs
- [ ] 配置 IDE SDK
- [ ] 文档化变更
- [ ] 培训团队

**⚠️ 常见问题：**

**问题 1：包找不到**
```
解决：检查 dependencies 是否完整
```

**问题 2：Native 模块**
```yaml
packageExtensions:
  "native-module@*":
    unplugged: true
```

**问题 3：TypeScript 不识别**
```bash
yarn sdks vscode
```

**回滚方案：**
```bash
# 如果遇到无法解决的问题
yarn set version 1.22.19
rm .yarnrc.yml .pnp.cjs
yarn install
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** PnP最佳实践

### 题目

如何配置生产级别的 Yarn PnP 项目？

<details>
<summary>查看答案</summary>

### ✅ 答案

**生产级 PnP 配置**

#### 1. .yarnrc.yml

```yaml
# Yarn 版本
yarnPath: .yarn/releases/yarn-3.6.0.cjs

# PnP 模式
nodeLinker: pnp

# 启用插件
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
    spec: "@yarnpkg/plugin-interactive-tools"
  - path: .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
    spec: "@yarnpkg/plugin-workspace-tools"

# 包扩展（修复问题包）
packageExtensions:
  # 修复缺失的 peerDependencies
  "react-redux@*":
    peerDependencies:
      react: "*"
  
  # Unplug native 模块
  "better-sqlite3@*":
    unplugged: true

# 性能优化
enableGlobalCache: false
compressionLevel: 9

# 网络配置
httpRetry: 3
networkTimeout: 60000

# NPM registry
npmRegistryServer: "https://registry.npmjs.org"
```

#### 2. .gitignore

```
# Yarn
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# PnP
.pnp.*
!.pnp.cjs

# 依赖
node_modules/

# 构建
dist/
build/

# 环境
.env.local
.env.*.local
```

#### 3. .gitattributes

```
# Yarn
/.yarn/**/* linguist-vendored
/.yarn/releases/* binary
/.yarn/plugins/**/* binary

# PnP
.pnp.* binary linguist-generated

# Lock file
yarn.lock -diff linguist-generated
```

#### 4. package.json

```json
{
  "name": "production-app",
  "packageManager": "yarn@3.6.0",
  
  "scripts": {
    "postinstall": "husky install",
    "start": "yarn node dist/server.js",
    "dev": "yarn node --watch src/server.ts",
    "build": "tsc && yarn node esbuild.config.js",
    "test": "yarn node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "lint": "eslint src",
    "type-check": "tsc --noEmit",
    "prepare": "husky install",
    "prepush": "yarn lint && yarn test"
  },
  
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0"
  },
  
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^18.0.0",
    "esbuild": "^0.19.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### 5. Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

# 启用 Corepack
RUN corepack enable

WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY .pnp.cjs ./

# 安装（Zero-Installs 秒装）
RUN yarn install --immutable

# 复制源码
COPY . .

# 构建
RUN yarn build

# 生产阶段
FROM node:18-alpine AS runner

RUN corepack enable

WORKDIR /app

# 只复制必要文件
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/.pnp.cjs ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.yarnrc.yml ./

# 非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 启动
CMD ["yarn", "node", "dist/server.js"]
```

#### 6. CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Enable Corepack
        run: corepack enable
      
      # Zero-Installs（缓存已提交）
      - name: Install dependencies
        run: yarn install --immutable --immutable-cache
      
      - name: Type check
        run: yarn type-check
      
      - name: Lint
        run: yarn lint
      
      - name: Test
        run: yarn test
      
      - name: Build
        run: yarn build
      
      - name: Build Docker
        run: docker build -t app .
```

### 📖 解析

**最佳实践总结**

**✅ 性能：**
- 启用 Zero-Installs
- 压缩级别 9
- 全局缓存禁用（项目级）

**✅ 安全：**
- 严格依赖检查
- 锁定 Yarn 版本
- 审计依赖

**✅ 可维护：**
- 完善的文档
- IDE 集成
- CI/CD 自动化

**✅ 兼容性：**
- packageExtensions 修复
- Unplug 处理 native
- 回退方案

</details>

---

**导航**  
[上一章：第 17 章面试题](./chapter-17.md) | [返回目录](../README.md) | [下一章：第 19 章面试题](./chapter-19.md)
