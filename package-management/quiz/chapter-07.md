# 第 7 章：npm 常用命令 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** install vs ci

### 题目

`npm ci` 和 `npm install` 的主要区别是什么？

**选项：**
- A. npm ci 更快，但功能相同
- B. npm ci 会删除 node_modules 重装，严格按 lock 文件
- C. npm ci 只安装生产依赖
- D. npm ci 会更新 package.json

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm ci (Clean Install)**

#### 主要区别

| 特性 | npm install | npm ci |
|------|-------------|--------|
| **删除 node_modules** | ❌ 增量安装 | ✅ 完全删除重装 |
| **使用 lock 文件** | 参考但可更新 | 严格遵守 |
| **更新 package.json** | 可能 | ❌ 不会 |
| **速度** | 较慢 | ⚡ 更快 |
| **适用场景** | 开发环境 | CI/CD |

#### npm ci 特点

```bash
npm ci

# 1. 删除现有 node_modules
# 2. 严格按 package-lock.json 安装
# 3. 如果 lock 文件与 package.json 不一致，报错
# 4. 不会修改 package.json 或 lock 文件
```

**要求：**
- ✅ 必须有 package-lock.json
- ✅ lock 文件必须与 package.json 一致

#### 使用场景

**开发环境：**
```bash
npm install  # 可能更新依赖
```

**CI/CD：**
```bash
npm ci  # 确定性安装，更快
```

#### 速度对比

```bash
# 有 node_modules 的情况
time npm install  # 10s
time npm ci       # 8s（删除+重装仍更快）

# CI 环境（无 node_modules）
time npm install  # 45s
time npm ci       # 35s
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** update命令

### 题目

`npm update` 会更新所有依赖到最新版本。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**npm update 的行为**

#### 遵循 semver 范围

```json
{
  "dependencies": {
    "lodash": "^4.17.0"  // 允许 4.x.x
  }
}
```

```bash
# 当前版本：lodash@4.17.0
# 最新版本：lodash@4.17.21

npm update
# ✅ 更新到 4.17.21（在范围内）

# 假设最新版本是 5.0.0
npm update
# ❌ 不会更新到 5.0.0（超出 ^ 范围）
```

#### 更新规则

**只更新到 package.json 允许的范围内的最新版本**

```bash
# ^4.17.0 → 更新到 4.x 的最新版
npm update lodash  # 4.17.21

# ~4.17.0 → 更新到 4.17.x 的最新版
npm update lodash  # 4.17.21

# 4.17.0 → 精确版本，不更新
npm update lodash  # 仍是 4.17.0
```

#### 更新到最新版本

```bash
# 方法 1：安装 latest
npm install lodash@latest

# 方法 2：使用 ncu
npx npm-check-updates -u
npm install

# 方法 3：手动修改 package.json
{
  "dependencies": {
    "lodash": "^5.0.0"  // 修改版本
  }
}
npm install
```

#### 查看过期包

```bash
npm outdated

# 输出：
Package  Current  Wanted  Latest
lodash   4.17.0   4.17.21 5.0.0
```

- **Current**: 当前安装版本
- **Wanted**: package.json 范围内的最新版（npm update 会更新到这）
- **Latest**: 最新发布版本

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** view命令

### 题目

如何查看 npm 包的所有历史版本？

**选项：**
- A. npm list package-name
- B. npm view package-name versions
- C. npm search package-name
- D. npm info package-name

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm view 命令**

#### 查看版本列表

```bash
npm view lodash versions

# 输出：
[
  '0.1.0',
  '0.2.0',
  ...
  '4.17.20',
  '4.17.21'
]
```

**别名：**
```bash
npm view lodash versions
npm info lodash versions
npm show lodash versions
# 三个命令等价
```

#### 查看最新版本

```bash
npm view lodash version
# 4.17.21
```

#### 查看所有信息

```bash
npm view lodash

# 输出：
lodash@4.17.21 | MIT | deps: none | versions: 114
Lodash modular utilities.
https://lodash.com/

keywords: modules, stdlib, util

dist
.tarball: https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz
.shasum: 679591c564c3bffaae8454cf0b3df370c3d6911c
.integrity: sha512-v2kDEe...

dependencies:
(无依赖)

maintainers:
- mathias <mathias@qiwi.be>
- jdalton <john.david.dalton@gmail.com>

dist-tags:
latest: 4.17.21

published a year ago by mathias <mathias@qiwi.be>
```

#### 查看特定字段

```bash
# 查看 dist-tags
npm view lodash dist-tags
# { latest: '4.17.21' }

# 查看 dependencies
npm view react dependencies

# 查看 repository
npm view react repository
```

#### 其他命令对比

**A. npm list（查看本地安装）：**
```bash
npm list lodash
# 显示项目中安装的版本
```

**C. npm search（搜索包）：**
```bash
npm search lodash
# 搜索包名
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 依赖管理

### 题目

以下哪些命令会修改 package.json？

**选项：**
- A. npm install lodash
- B. npm uninstall lodash
- C. npm update
- D. npm ci

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B

### 📖 解析

**package.json 修改行为**

#### A. npm install package ✅

```bash
npm install lodash

# 修改 package.json
{
  "dependencies": {
    "lodash": "^4.17.21"  // ← 新增
  }
}
```

**例外：**
```bash
npm install lodash --no-save  # 不修改 package.json
```

#### B. npm uninstall ✅

```bash
npm uninstall lodash

# 从 package.json 移除
{
  "dependencies": {
    // lodash 被删除
  }
}
```

#### C. npm update ❌

```bash
npm update

# 更新 package-lock.json
# 但不修改 package.json
```

**package.json 保持不变：**
```json
{
  "dependencies": {
    "lodash": "^4.17.0"  // 不变
  }
}
```

**package-lock.json 更新：**
```json
{
  "dependencies": {
    "lodash": {
      "version": "4.17.21"  // 更新
    }
  }
}
```

#### D. npm ci ❌

```bash
npm ci

# 严格模式
# 不会修改任何文件
# 只读取 package-lock.json
```

#### 完整对比

| 命令 | 修改 package.json | 修改 lock 文件 |
|------|------------------|---------------|
| **npm install pkg** | ✅ | ✅ |
| **npm uninstall pkg** | ✅ | ✅ |
| **npm update** | ❌ | ✅ |
| **npm ci** | ❌ | ❌ |
| **npm install** | ❌ | ✅ |

#### --save 参数

```bash
# npm 5+ 默认保存
npm install lodash  # 自动保存到 package.json

# 不保存
npm install lodash --no-save

# 保存为 dev 依赖
npm install lodash --save-dev
npm install lodash -D
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** dedupe命令

### 题目

以下依赖树执行 `npm dedupe` 后会变成什么？

```
node_modules/
├── pkg-a/
│   └── node_modules/
│       └── lodash@4.17.21
└── lodash@4.17.20
```

**选项：**
- A. 保持不变
- B. 只有一个 lodash@4.17.21
- C. 只有一个 lodash@4.17.20
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（保持不变）

### 📖 解析

**npm dedupe 工作原理**

#### 去重条件

**只有版本兼容时才去重**

```bash
# 场景 1：版本兼容
pkg-a 依赖 lodash@^4.17.0  # 兼容 4.17.21
顶层有 lodash@4.17.21

# npm dedupe 后
node_modules/
├── pkg-a/  # 移除嵌套的 lodash
└── lodash@4.17.21  # 共用顶层版本
```

#### 本题分析

```
pkg-a 依赖 lodash@4.17.21
顶层有 lodash@4.17.20

4.17.20 ≠ 4.17.21  # 不同版本
```

**如果 pkg-a 声明：**
```json
{
  "dependencies": {
    "lodash": "4.17.21"  // 精确版本
  }
}
```

**4.17.20 不满足要求**，必须保留两个版本。

#### 可以去重的情况

```
# 场景 1
pkg-a 依赖 lodash@^4.17.0
顶层 lodash@4.17.21
→ 去重 ✅

# 场景 2
pkg-a 依赖 lodash@4.17.21
pkg-b 依赖 lodash@4.17.21
→ 去重 ✅

# 场景 3（本题）
pkg-a 依赖 lodash@4.17.21（精确）
顶层 lodash@4.17.20
→ 无法去重 ❌
```

#### 实际使用

```bash
# 1. 查看重复依赖
npm ls lodash

my-app
├─┬ pkg-a
│ └── lodash@4.17.21
└── lodash@4.17.20

# 2. 尝试去重
npm dedupe

# 3. 再次查看
npm ls lodash
# 如果版本兼容，重复会被移除
```

#### 强制统一版本

**使用 overrides：**
```json
{
  "overrides": {
    "lodash": "4.17.21"
  }
}
```

```bash
npm install
# 所有 lodash 强制使用 4.17.21
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** cache命令

### 题目

如何验证 npm 缓存的完整性？

**选项：**
- A. npm cache clean
- B. npm cache verify
- C. npm cache check
- D. npm cache validate

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm cache 命令**

#### npm cache verify

```bash
npm cache verify

# 输出：
Cache verified and compressed (~/.npm/_cacache)
Content verified: 1234 (12.3 MB)
Index entries: 1234
Finished in 2.5s
```

**作用：**
- 验证缓存完整性
- 清理无效缓存
- 压缩缓存

#### npm cache clean

```bash
# 清空缓存
npm cache clean --force

# 不加 --force 会报错
npm cache clean
# npm ERR! As of npm@5, the npm cache self-heals
```

**npm 5+ 不推荐手动清理缓存**

#### 缓存相关命令

```bash
# 查看缓存目录
npm config get cache
# ~/.npm

# 查看缓存大小
du -sh ~/.npm
# 2.5GB

# 缓存操作
npm cache verify   # ✅ 验证
npm cache clean --force  # 清空
```

#### 缓存机制

**安装流程：**
```bash
npm install lodash

1. 检查缓存
   ~/.npm/_cacache/index-v5/

2. 命中缓存
   → 从缓存复制（快）

3. 未命中
   → 下载
   → 缓存
   → 安装
```

**缓存结构：**
```
~/.npm/
├── _cacache/
│   ├── content-v2/  # 包内容
│   ├── index-v5/    # 索引
│   └── tmp/         # 临时文件
└── _logs/           # 日志
```

#### 缓存问题排查

```bash
# 1. 缓存损坏
npm cache verify

# 2. 仍有问题，清空缓存
npm cache clean --force

# 3. 重新安装
rm -rf node_modules package-lock.json
npm install
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** prune命令

### 题目

执行以下操作后，node_modules 中还剩哪些包？

```json
// package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

```bash
npm install express  # 临时安装，未保存
npm prune
```

**选项：**
- A. lodash 和 express
- B. 只有 lodash
- C. 只有 express
- D. 都没有

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm prune 命令**

#### 作用

**删除 package.json 中未声明的包**

```bash
npm prune

# 删除：
# - 不在 dependencies 中的包
# - 不在 devDependencies 中的包
```

#### 本题分析

**1. 初始状态：**
```json
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

**2. 临时安装 express：**
```bash
npm install express --no-save

# node_modules/
# ├── lodash/
# └── express/
```

**package.json 未变**

**3. 执行 prune：**
```bash
npm prune

# 检查 package.json
# - lodash ✅ 声明了，保留
# - express ❌ 未声明，删除
```

**4. 最终结果：**
```
node_modules/
└── lodash/  # 只剩 lodash
```

#### 实际使用场景

**场景 1：清理测试包**
```bash
# 测试时安装
npm install debug --no-save

# 测试完成后清理
npm prune
```

**场景 2：切换到生产依赖**
```bash
# 开发环境（有 devDependencies）
npm install

# 切换到生产环境
npm prune --production
# 删除所有 devDependencies
```

**场景 3：手动删除 package.json 中的依赖后**
```json
{
  "dependencies": {
    // 删除了某些包
  }
}
```

```bash
npm prune
# 自动删除 node_modules 中对应的包
```

#### prune 选项

```bash
# 删除 devDependencies
npm prune --production

# 只删除顶层包（不删除依赖的依赖）
npm prune --depth=0

# 查看将被删除的包（dry-run）
npm prune --dry-run
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** audit命令

### 题目

`npm audit fix` 和 `npm audit fix --force` 的区别是什么？

**选项：**
- A. --force 修复更多漏洞
- B. --force 可能安装不兼容的破坏性更新
- C. 没有区别
- D. --force 跳过审计直接安装

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm audit 命令详解**

#### npm audit（扫描）

```bash
npm audit

# 输出：
found 3 vulnerabilities (1 moderate, 2 high)
  run `npm audit fix` to fix them
```

**漏洞等级：**
- Low（低）
- Moderate（中）
- High（高）
- Critical（严重）

#### npm audit fix（安全修复）

```bash
npm audit fix

# 只修复不会破坏兼容性的漏洞
# - 更新到 semver 范围内的安全版本
# - 不会安装 major 版本更新
```

**示例：**
```
当前：lodash@4.17.0（有漏洞）
可用：lodash@4.17.21（安全）
范围：^4.17.0

npm audit fix
→ 更新到 4.17.21 ✅（minor 更新，安全）
```

#### npm audit fix --force（强制修复）

```bash
npm audit fix --force

# 可能安装破坏性更新
# - 包括 major 版本更新
# - 可能破坏代码兼容性
```

**示例：**
```
当前：axios@0.19.0（有严重漏洞）
可用：axios@1.0.0（安全）
范围：^0.19.0

npm audit fix
→ 不更新（超出 semver 范围）

npm audit fix --force
→ 强制更新到 1.0.0 ⚠️（可能破坏兼容性）
```

#### 风险对比

| 命令 | 安全性 | 兼容性风险 | 推荐度 |
|------|--------|-----------|--------|
| **audit fix** | ✅ 修复部分漏洞 | ✅ 低 | ⭐⭐⭐⭐⭐ |
| **audit fix --force** | ✅ 修复更多漏洞 | ⚠️ 高 | ⭐⭐⭐ |

#### 实际工作流

**步骤 1：查看漏洞**
```bash
npm audit

# 分析漏洞严重程度和影响
```

**步骤 2：安全修复**
```bash
npm audit fix

# 修复不破坏兼容性的漏洞
```

**步骤 3：检查剩余漏洞**
```bash
npm audit

# 查看无法自动修复的漏洞
```

**步骤 4：手动处理**
```bash
# 方案 1：手动更新
npm install axios@latest

# 方案 2：使用 overrides
{
  "overrides": {
    "axios": "^1.0.0"
  }
}

# 方案 3：等待上游修复
```

**步骤 5：最后手段**
```bash
# 确认理解风险后
npm audit fix --force

# 立即测试
npm test
```

#### audit 其他选项

```bash
# 只显示生产依赖的漏洞
npm audit --production

# 只修复生产依赖
npm audit fix --production

# 查看 JSON 格式
npm audit --json

# 设置严重级别阈值
npm audit --audit-level=moderate
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 命令组合

### 题目

在 CI 环境中，以下哪种安装方式最合适？

**选项：**
- A. npm install
- B. npm install --production
- C. npm ci
- D. npm ci --production

<details>
<summary>查看答案</summary>

### ✅ 正确答案：取决于需求（C 或 D）

### 📖 解析

**CI/CD 环境的安装策略**

#### 场景分析

**构建阶段（需要 devDependencies）：**
```yaml
# .github/workflows/build.yml
- name: Install dependencies
  run: npm ci  # ✅ 选项 C
  
- name: Build
  run: npm run build  # 需要 webpack、typescript 等
```

**生产部署（只需 dependencies）：**
```yaml
# Dockerfile
FROM node:18-alpine
COPY package*.json ./
RUN npm ci --production  # ✅ 选项 D
COPY . .
CMD ["node", "server.js"]
```

#### 各选项对比

**A. npm install ❌**
```bash
npm install

# 问题：
# - 可能更新 lock 文件（不确定性）
# - 较慢
# - 不适合 CI
```

**B. npm install --production ❌**
```bash
npm install --production

# 问题：
# - 仍可能更新 lock 文件
# - 不是最佳实践
```

**C. npm ci ✅（构建环境）**
```bash
npm ci

# 优势：
# - 快速
# - 确定性（严格按 lock 文件）
# - 删除 node_modules 确保干净环境
# - 包含 devDependencies（用于构建）
```

**D. npm ci --production ✅（生产环境）**
```bash
npm ci --production

# 优势：
# - npm ci 的所有优势
# - 只安装生产依赖
# - 减小镜像体积
```

#### 完整 CI/CD 流程

**GitHub Actions：**
```yaml
name: CI/CD

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install
        run: npm ci  # ✅ 包含 dev 依赖
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t app .
        # Dockerfile 中使用 npm ci --production
```

**Dockerfile：**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci  # 构建阶段需要 dev 依赖

COPY . .
RUN npm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production  # 只要生产依赖

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/server.js"]
```

#### 性能优化

**缓存策略：**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

- run: npm ci
```

**分层构建（Docker）：**
```dockerfile
# 先复制 package.json
COPY package*.json ./
RUN npm ci --production

# 再复制代码（利用缓存）
COPY . .
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 命令速查

### 题目

如何一条命令安装包并同时运行测试？

<details>
<summary>查看答案</summary>

### ✅ 答案

```bash
# 方法 1：使用 &&
npm install && npm test

# 方法 2：使用 npm-run-all
npm install -g npm-run-all
npm-run-all install test

# 方法 3：npm scripts
{
  "scripts": {
    "setup": "npm install && npm test"
  }
}
npm run setup
```

### 📖 解析

**命令串联**

#### && 操作符

```bash
# 前一个命令成功才执行下一个
npm install && npm test

# 如果 install 失败，test 不会执行
```

#### ; 操作符

```bash
# 无论成功失败都执行
npm install; npm test

# install 失败，test 仍会执行
```

#### || 操作符

```bash
# 前一个失败才执行下一个
npm test || echo "Tests failed"
```

#### 复杂组合

```bash
# 完整 CI 流程
npm ci && \
npm run lint && \
npm test && \
npm run build && \
npm run deploy
```

**任何步骤失败都会停止**

#### npm scripts

```json
{
  "scripts": {
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "npm run coverage",
    
    "ci": "npm ci && npm run lint && npm test && npm run build"
  }
}
```

```bash
npm test
# 自动执行：pretest → test → posttest

npm run ci
# 执行完整流程
```

#### npm-run-all

```bash
npm install -D npm-run-all
```

```json
{
  "scripts": {
    "lint:js": "eslint .",
    "lint:css": "stylelint **/*.css",
    "lint": "npm-run-all --parallel lint:*",
    
    "test:unit": "jest",
    "test:e2e": "playwright test",
    "test": "npm-run-all test:*"
  }
}
```

**串行：**
```bash
npm-run-all clean build test
```

**并行：**
```bash
npm-run-all --parallel watch:*
```

#### 常用命令组合

```bash
# 重装
rm -rf node_modules package-lock.json && npm install

# 清理+构建
npm run clean && npm run build

# 格式化+提交
npm run format && git add . && git commit

# 发布流程
npm test && npm run build && npm publish
```

</details>

---

**导航**  
[上一章：第 6 章面试题](./chapter-06.md) | [返回目录](../README.md) | [下一章：第 8 章面试题](./chapter-08.md)
