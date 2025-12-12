# 第 16 章：Yarn 基础与特性 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Yarn基础

### 题目

Yarn 相比 npm 的主要优势是什么？

**选项：**
- A. 更好的生态系统
- B. 更快的安装速度和确定性
- C. 更小的包体积
- D. 更多的命令

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Yarn 的核心优势**

#### 1. 速度优化

```bash
# npm install
time npm install
# 45s

# yarn install
time yarn install
# 20s ⚡⚡
```

**并行安装 + 更好的缓存**

#### 2. 确定性（Deterministic）

```bash
# yarn.lock 确保：
# - 同一 lock 文件
# - 任何环境
# - 任何时间
# → 安装完全相同的依赖树
```

**package-lock.json 有时不够确定**

#### 3. 离线模式

```bash
# 无需网络（如果缓存存在）
yarn install --offline
```

#### 4. Workspaces

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

**原生 Monorepo 支持（npm 7 才加入）**

#### 对比

| 特性 | npm | Yarn |
|------|-----|------|
| **速度** | ⚡⚡ | ⚡⚡⚡⚡ |
| **确定性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **离线** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Workspaces** | v7+ | ✅ |

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** yarn.lock

### 题目

yarn.lock 文件应该提交到版本控制系统。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**yarn.lock 的作用**

#### 必须提交

```bash
# ✅ 提交到 Git
git add yarn.lock
git commit -m "chore: update dependencies"
```

**原因：**
1. 确保团队成员安装相同版本
2. 确保 CI/CD 环境一致
3. 可重现的构建

#### 不同类型项目

**应用项目（✅ 提交）：**
```
my-app/
├── package.json
├── yarn.lock  ← 提交
└── src/
```

**库项目（✅ 也提交）：**
```
my-library/
├── package.json
├── yarn.lock  ← 提交（用于开发）
└── src/
```

**Yarn 官方推荐：始终提交 yarn.lock**

#### .gitignore

```
# ❌ 不要忽略
# yarn.lock

# ✅ 忽略这些
node_modules/
.yarn/cache/  # Yarn 2+
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** Yarn命令

### 题目

Yarn 中等价于 `npm install` 的命令是？

**选项：**
- A. yarn add
- B. yarn install
- C. yarn
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Yarn 命令简写**

#### 安装所有依赖

```bash
# 完整命令
yarn install

# 简写
yarn  # ✅ 等价

# npm 对比
npm install
```

#### 添加依赖

```bash
# yarn
yarn add lodash

# npm
npm install lodash
```

#### 常用命令对比

| 操作 | npm | Yarn |
|------|-----|------|
| **安装所有** | npm install | yarn / yarn install |
| **添加依赖** | npm install pkg | yarn add pkg |
| **添加 dev** | npm install -D pkg | yarn add -D pkg |
| **全局安装** | npm install -g pkg | yarn global add pkg |
| **移除依赖** | npm uninstall pkg | yarn remove pkg |
| **更新依赖** | npm update | yarn upgrade |

#### Yarn 2+ 变化

```bash
# Yarn 1.x
yarn install

# Yarn 2+（Berry）
yarn install
# 或
yarn
# 行为相同
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** Yarn特性

### 题目

以下哪些是 Yarn 独有的特性？

**选项：**
- A. Plug'n'Play (PnP)
- B. Workspaces
- C. 并行安装
- D. Zero-Installs

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、D

### 📖 解析

**Yarn 独有特性**

#### A. Plug'n'Play (PnP) ✅ 独有

```bash
# 启用 PnP
yarn set version berry
```

**.yarnrc.yml：**
```yaml
nodeLinker: pnp
```

**特点：**
- 无 node_modules
- 直接从缓存运行
- 极快的安装速度

**npm 没有此特性**

#### B. Workspaces ❌ 非独有

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

**npm 7+ 也支持 Workspaces**

#### C. 并行安装 ❌ 非独有

```bash
# npm 也并行安装
npm install  # 并行下载

# yarn 也并行
yarn install  # 并行下载
```

**都支持并行**

#### D. Zero-Installs ✅ 独有

```bash
# Yarn 2+ 特性
# 提交 .yarn/cache 到 Git
```

**.gitignore：**
```
# 不忽略缓存
# .yarn/cache/  # 注释掉

# 提交缓存到 Git
git add .yarn/cache
```

**优势：**
- clone 后无需 yarn install
- 完全离线
- CI 极快

**npm/pnpm 不支持**

#### 独有特性总结

**Yarn 独有：**
1. Plug'n'Play
2. Zero-Installs
3. Constraints（约束）
4. Protocols（自定义协议）

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** yarn.lock格式

### 题目

yarn.lock 和 package-lock.json 的格式有何不同？

**选项：**
- A. 完全相同
- B. yarn.lock 是 YAML 格式
- C. yarn.lock 更简洁易读
- D. package-lock.json 是 JSON 格式

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C、D

### 📖 解析

**Lock 文件格式对比**

#### yarn.lock（类 YAML）

```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#679591c564c3bffaae8454cf0b3df370c3d6911c"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==

react@^18.0.0:
  version "18.2.0"
  resolved "https://registry.yarnpkg.com/react/-/react-18.2.0.tgz"
  integrity sha512-...
  dependencies:
    loose-envify "^1.1.0"
```

**特点：**
- 类似 YAML（但不是标准 YAML）
- 简洁
- 人类可读
- 体积较小

#### package-lock.json（JSON）

```json
{
  "name": "my-app",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==",
      "engines": {
        "node": ">=0.10.0"
      }
    }
  }
}
```

**特点：**
- 标准 JSON
- 详细完整
- 体积较大
- 机器友好

#### 对比

| 特性 | yarn.lock | package-lock.json |
|------|-----------|-------------------|
| **格式** | 类 YAML | JSON |
| **可读性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **体积** | 💾 | 💾💾💾 |
| **详细度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **合并冲突** | 较易处理 | 较难处理 |

#### 同一项目的体积对比

```bash
# yarn.lock
-rw-r--r--  1 user  staff   45K  yarn.lock

# package-lock.json
-rw-r--r--  1 user  staff  285K  package-lock.json
```

**yarn.lock 小 6 倍！**

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** Yarn版本

### 题目

Yarn 1.x 和 Yarn 2+ (Berry) 的主要区别是什么？

**选项：**
- A. 只是版本号不同
- B. Berry 完全重写，支持 PnP
- C. Berry 不兼容 Yarn 1
- D. Berry 只支持 Node.js 18+

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Yarn 版本演进**

#### Yarn 1.x（Classic）

```bash
# 安装
npm install -g yarn

# 检查版本
yarn --version
# 1.22.19
```

**特点：**
- 传统 node_modules
- 广泛使用
- 稳定可靠

#### Yarn 2+（Berry）

```bash
# 升级到 Berry
yarn set version berry

# 检查版本
yarn --version
# 3.6.0
```

**特点：**
- Plug'n'Play (PnP)
- Zero-Installs
- 插件系统
- 完全重写

#### 主要区别

**1. 架构重写：**
```bash
# Yarn 1
~/.yarn/  # 全局安装

# Yarn 2+
.yarn/releases/  # 项目级
```

**2. PnP 模式：**
```bash
# Yarn 1
node_modules/  # 传统

# Yarn 2+ (PnP)
.pnp.cjs  # 无 node_modules
.yarn/cache/
```

**3. 配置文件：**
```bash
# Yarn 1
.yarnrc

# Yarn 2+
.yarnrc.yml  # YAML 格式
```

#### 兼容性

```bash
# Berry 仍兼容
package.json  # ✅ 完全兼容
yarn.lock     # ✅ 兼容

# 可以降级
yarn set version 1.22.19
```

#### 迁移

```bash
# 1. 升级
yarn set version berry

# 2. 更新配置
cat > .yarnrc.yml << EOF
nodeLinker: node-modules  # 或 pnp
EOF

# 3. 重新安装
yarn install

# 4. 提交
git add .yarn .yarnrc.yml
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** Yarn缓存

### 题目

Yarn 的全局缓存在哪里？

```bash
yarn cache dir
```

**选项：**
- A. node_modules/.cache
- B. ~/.yarn/cache
- C. 因版本而异
- D. /tmp/yarn-cache

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**Yarn 缓存位置**

#### Yarn 1.x

```bash
yarn cache dir

# macOS/Linux
~/.yarn/cache

# Windows
%LOCALAPPDATA%\Yarn\Cache
```

#### Yarn 2+ (Berry)

```bash
yarn cache dir

# 项目级缓存
/path/to/project/.yarn/cache/
```

**项目级，不是全局！**

#### 缓存结构

**Yarn 1：**
```
~/.yarn/cache/
├── npm-lodash-4.17.21-6382451b0a/
└── npm-react-18.2.0-1b0a0e6d9a/
```

**Yarn 2+：**
```
.yarn/cache/
├── lodash-npm-4.17.21-6382451b0a-8.zip
└── react-npm-18.2.0-1b0a0e6d9a-10.zip
```

**Zip 格式，更紧凑**

#### 缓存管理

```bash
# 查看缓存大小
du -sh $(yarn cache dir)

# Yarn 1 清理缓存
yarn cache clean

# Yarn 2+ 清理
yarn cache clean --all
```

#### Zero-Installs

```bash
# Yarn 2+ 可以提交缓存
.yarn/cache/  # ✅ 提交到 Git

# clone 后无需安装
git clone repo
cd repo
yarn  # 秒级完成！
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** Plug'n'Play

### 题目

Yarn Plug'n'Play (PnP) 的工作原理是什么？

**选项：**
- A. 优化 node_modules 结构
- B. 完全移除 node_modules
- C. 使用符号链接
- D. 使用硬链接

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Plug'n'Play 原理**

#### 传统 node_modules 问题

```bash
# npm/yarn 1
npm install

node_modules/  # 500MB
├── pkg-a/
│   └── node_modules/
│       └── lodash/
└── lodash/

# 问题：
# - 磁盘占用大
# - 安装慢
# - I/O 密集
```

#### PnP 方案

```bash
# Yarn 2+ PnP
yarn install

# 无 node_modules！
.pnp.cjs  # 依赖映射表
.yarn/cache/  # Zip 包
```

**.pnp.cjs（简化）：**
```javascript
const packageMap = {
  "my-app": {
    "lodash": "npm:4.17.21"
  },
  "npm:4.17.21": {
    location: ".yarn/cache/lodash-npm-4.17.21-xxx.zip/node_modules/lodash/"
  }
};

module.exports = { packageMap };
```

#### 工作流程

```javascript
// 代码
const lodash = require('lodash');

// PnP 拦截 require
// 1. 查询 .pnp.cjs 映射表
// 2. 找到 lodash 的 zip 位置
// 3. 从 zip 中加载
// 4. 返回模块
```

**无需解压！直接从 Zip 读取**

#### 优势

**速度：**
```bash
# 传统
yarn install  # 45s（解压到 node_modules）

# PnP
yarn install  # 5s（只生成 .pnp.cjs）⚡⚡⚡⚡⚡
```

**磁盘：**
```bash
# 传统
node_modules/  # 500MB

# PnP
.yarn/cache/  # 100MB（Zip 压缩）
.pnp.cjs      # 1MB
```

**严格性：**
```javascript
// 传统（可能意外访问）
require('unlisted-package');  // ✅ 可能成功

// PnP（严格检查）
require('unlisted-package');  // ❌ 报错
```

#### 启用 PnP

```yaml
# .yarnrc.yml
nodeLinker: pnp  # 启用 PnP
```

```bash
yarn install
# 生成 .pnp.cjs
```

#### 兼容性问题

```javascript
// 某些包可能不兼容
// 需要使用 node-modules 模式

// .yarnrc.yml
nodeLinker: node-modules  # 回退
```

**大多数现代包已兼容**

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** Yarn Workspaces

### 题目

在 Yarn Workspaces 中如何管理跨包依赖？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Yarn Workspaces 跨包依赖**

#### 1. 项目结构

```
my-monorepo/
├── package.json
├── packages/
│   ├── pkg-a/
│   │   └── package.json
│   └── pkg-b/
│       └── package.json
```

#### 2. 根 package.json

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

#### 3. 跨包引用

**pkg-b/package.json：**
```json
{
  "name": "@myorg/pkg-b",
  "dependencies": {
    "@myorg/pkg-a": "^1.0.0"  // 引用本地包
  }
}
```

**Yarn 自动链接本地包！**

#### 4. 安装依赖

```bash
# 在根目录
yarn install

# Yarn 自动：
# 1. 识别本地包
# 2. 创建符号链接
# 3. 提升公共依赖
```

**结果：**
```
node_modules/
├── @myorg/
│   ├── pkg-a → ../packages/pkg-a
│   └── pkg-b → ../packages/pkg-b
├── lodash/  # 公共依赖提升
```

#### 5. 开发工作流

```bash
# 在 pkg-a 中修改代码
cd packages/pkg-a
# 编辑文件

# pkg-b 自动使用最新版本
cd ../pkg-b
yarn dev  # 立即生效
```

**无需重新安装！**

### 📖 解析

**高级用法**

#### Workspace 协议

```json
{
  "dependencies": {
    "@myorg/pkg-a": "workspace:*"  // Yarn 2+
  }
}
```

**优势：**
- 明确本地依赖
- 发布时自动替换为真实版本

#### 版本管理

```bash
# 更新所有包版本
yarn workspaces foreach version patch

# 发布所有包
yarn workspaces foreach npm publish
```

#### 依赖提升

**共同依赖：**
```json
// pkg-a
{ "dependencies": { "lodash": "^4.17.0" } }

// pkg-b
{ "dependencies": { "lodash": "^4.17.0" } }

// 提升到根 node_modules
node_modules/lodash  # 只有一份
```

**不同版本：**
```json
// pkg-a
{ "dependencies": { "lodash": "^4.17.0" } }

// pkg-b
{ "dependencies": { "lodash": "^3.10.0" } }

// 保留两份
packages/pkg-a/node_modules/lodash@4.17.21
packages/pkg-b/node_modules/lodash@3.10.1
```

#### 运行脚本

```bash
# 在所有包中运行
yarn workspaces foreach run build

# 在特定包中运行
yarn workspace @myorg/pkg-a build

# 并行运行
yarn workspaces foreach -p run test
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** Yarn配置

### 题目

如何配置 Yarn 2+ 的完整项目？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Yarn 2+ 完整配置**

#### 1. 初始化项目

```bash
# 创建项目
mkdir my-project
cd my-project

# 初始化
yarn init -2
```

#### 2. 配置文件

**.yarnrc.yml：**
```yaml
# Node.js 链接模式
nodeLinker: pnp  # 或 node-modules

# 启用插件
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs

# 包扩展（补丁）
packageExtensions:
  "react-redux@*":
    peerDependencies:
      react: "*"

# 启用 Zero-Installs
enableGlobalCache: false

# 压缩级别
compressionLevel: 9

# NPM registry
npmRegistryServer: "https://registry.npmjs.org"

# NPM scope
npmScopes:
  mycompany:
    npmRegistryServer: "https://npm.mycompany.com"
    npmAuthToken: "${NPM_TOKEN}"
```

#### 3. .gitignore

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

# 依赖
node_modules/

# 其他
.env
dist/
```

#### 4. .gitattributes

```
# Yarn
.yarn/releases/** binary
.yarn/plugins/** binary

# Lock file merge
yarn.lock merge=binary
```

#### 5. package.json

```json
{
  "name": "my-project",
  "packageManager": "yarn@3.6.0",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "postinstall": "husky install",
    "build": "yarn workspaces foreach -pt run build",
    "test": "yarn workspaces foreach -p run test",
    "lint": "eslint .",
    "upgrade": "yarn upgrade-interactive"
  },
  "devDependencies": {
    "@yarnpkg/sdks": "^3.0.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### 6. 安装插件

```bash
# Workspace 工具
yarn plugin import workspace-tools

# 交互式工具
yarn plugin import interactive-tools

# TypeScript 插件
yarn plugin import typescript

# 版本插件
yarn plugin import version
```

#### 7. VSCode 集成

```bash
# 生成 SDK
yarn sdks vscode
```

**生成 .vscode/settings.json**

#### 8. CI 配置

**.github/workflows/ci.yml：**
```yaml
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
      
      # 恢复缓存
      - name: Restore Yarn cache
        uses: actions/cache@v3
        with:
          path: |
            .yarn/cache
            .pnp.*
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
      
      # Zero-Installs 场景
      - run: yarn install --immutable
      
      - run: yarn build
      - run: yarn test
```

### 📖 解析

**完整项目结构**

```
my-project/
├── .yarn/
│   ├── cache/          # 依赖缓存（提交）
│   ├── plugins/        # 插件（提交）
│   ├── releases/       # Yarn 版本（提交）
│   └── sdks/           # IDE SDK
├── .yarnrc.yml         # Yarn 配置
├── .gitignore
├── .gitattributes
├── package.json
├── yarn.lock
├── .pnp.cjs            # PnP 映射
└── packages/
    ├── pkg-a/
    └── pkg-b/
```

**最佳实践：**
1. 提交 .yarn/cache（Zero-Installs）
2. 使用 PnP（性能最佳）
3. 配置 packageManager 字段
4. 使用 Workspace tools
5. 集成 CI/CD

</details>

---

**导航**  
[上一章：第 15 章面试题](./chapter-15.md) | [返回目录](../README.md) | [下一章：第 17 章面试题](./chapter-17.md)
