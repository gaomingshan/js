# 第 9 章：依赖版本管理 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Semver基础

### 题目

版本号 `3.5.2` 中，`5` 代表什么？

**选项：**
- A. MAJOR（主版本）
- B. MINOR（次版本）
- C. PATCH（修订号）
- D. BUILD（构建号）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**语义化版本（Semver）**

格式：`MAJOR.MINOR.PATCH`

```
3.5.2
│ │ └─ PATCH = 2（bug修复）
│ └─── MINOR = 5（新功能）✅
└───── MAJOR = 3（破坏性变更）
```

**升级规则：**

```bash
# PATCH：向后兼容的bug修复
3.5.2 → 3.5.3

# MINOR：向后兼容的新功能
3.5.2 → 3.6.0

# MAJOR：不兼容的API变更
3.5.2 → 4.0.0
```

**版本比较：**

```
1.0.0 < 1.0.1  # PATCH 升级
1.0.1 < 1.1.0  # MINOR 升级
1.1.0 < 2.0.0  # MAJOR 升级
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 版本范围

### 题目

`^1.2.3` 和 `~1.2.3` 允许的更新范围相同。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**版本范围符号**

#### ^ (Caret) - 兼容的版本

```
^1.2.3  →  >=1.2.3 <2.0.0

✅ 1.2.3
✅ 1.2.4  # PATCH
✅ 1.3.0  # MINOR
✅ 1.9.9
❌ 2.0.0  # MAJOR变更
```

**允许 MINOR 和 PATCH 更新**

#### ~ (Tilde) - 近似的版本

```
~1.2.3  →  >=1.2.3 <1.3.0

✅ 1.2.3
✅ 1.2.4  # PATCH
✅ 1.2.99
❌ 1.3.0  # MINOR变更
```

**只允许 PATCH 更新**

#### 对比

| 版本 | ^1.2.3 | ~1.2.3 |
|------|--------|--------|
| 1.2.3 | ✅ | ✅ |
| 1.2.4 | ✅ | ✅ |
| 1.3.0 | ✅ | ❌ |
| 2.0.0 | ❌ | ❌ |

**^ 更宽松，~ 更严格**

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** package-lock.json

### 题目

package-lock.json 的主要作用是什么？

**选项：**
- A. 加速安装
- B. 锁定确切的依赖版本
- C. 压缩node_modules
- D. 管理脚本

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**package-lock.json 的作用**

#### 锁定版本

```json
// package.json
{
  "dependencies": {
    "lodash": "^4.17.0"  // 范围：4.17.0 - 4.x.x
  }
}
```

**问题：** 不同时间安装可能得到不同版本

```bash
# 2021年
npm install  # lodash@4.17.20

# 2023年
npm install  # lodash@4.17.21  ❌ 不一致
```

#### package-lock.json

```json
{
  "dependencies": {
    "lodash": {
      "version": "4.17.20",  // 精确版本
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.20.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

**确保所有人安装相同版本**

#### 完整性校验

```json
{
  "integrity": "sha512-PlhdFcillOINfeV7Ni6oF1TAEayyZBoZ8bcshTHqOYJYlrqzRK5hagpagky5o4HfCzzd1TRkXPMFq6cKk9rGmA=="
}
```

**验证包未被篡改**

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 版本冲突

### 题目

以下哪些情况会导致 lock 文件冲突？

**选项：**
- A. 两个分支分别添加不同的依赖
- B. 两个分支更新同一个依赖到不同版本
- C. 一个分支删除依赖，另一个分支更新它
- D. 同时运行 npm install

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C

### 📖 解析

**lock 文件冲突场景**

#### A. 添加不同依赖 ✅

```bash
# 分支 A
npm install axios
# lock 文件：+ axios

# 分支 B
npm install lodash
# lock 文件：+ lodash

# 合并时冲突
```

#### B. 更新到不同版本 ✅

```bash
# 分支 A
npm install react@17.0.0
# lock: react@17.0.0

# 分支 B
npm install react@18.0.0
# lock: react@18.0.0

# 合并时冲突
```

#### C. 删除 vs 更新 ✅

```bash
# 分支 A
npm uninstall lodash
# lock: 删除 lodash

# 分支 B
npm update lodash
# lock: lodash@4.17.21

# 合并时冲突
```

#### D. 同时运行 install ❌

```bash
# 进程 A 和 B 同时运行
npm install

# 不会冲突（文件锁机制）
# 但可能导致性能问题
```

**lock 文件有文件锁保护**

#### 冲突解决

**方法 1：重新生成**

```bash
# 删除 lock 文件
rm package-lock.json

# 合并 package.json
git merge feature-branch

# 重新生成 lock
npm install

# 提交
git add package-lock.json
git commit
```

**方法 2：使用工具**

```bash
npm install -g npm-merge-driver

# 自动合并 lock 文件
npm-merge-driver install -g
```

**方法 3：接受一方**

```bash
# 使用当前分支
git checkout --ours package-lock.json
npm install

# 使用合并分支
git checkout --theirs package-lock.json
npm install
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 版本范围

### 题目

哪个版本范围最严格？

**选项：**
- A. `*`
- B. `^1.2.3`
- C. `~1.2.3`
- D. `1.2.3`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**版本范围严格程度**

#### A. `*` - 最宽松

```
*  →  任意版本

✅ 0.0.1
✅ 1.0.0
✅ 999.999.999
```

#### B. `^1.2.3` - 较宽松

```
^1.2.3  →  >=1.2.3 <2.0.0

✅ 1.2.3
✅ 1.9.9
❌ 2.0.0
```

#### C. `~1.2.3` - 较严格

```
~1.2.3  →  >=1.2.3 <1.3.0

✅ 1.2.3
✅ 1.2.99
❌ 1.3.0
```

#### D. `1.2.3` - 最严格 ✅

```
1.2.3  →  精确 1.2.3

✅ 1.2.3
❌ 1.2.4
❌ 其他任何版本
```

#### 严格程度排序

```
最宽松 ← → 最严格
* > >= > ^ > ~ > 精确版本
```

#### 实际使用建议

```json
{
  "dependencies": {
    "react": "^18.2.0",        // 常规依赖：^
    "lodash": "~4.17.21",      // 稳定包：~
    "critical-lib": "1.2.3",   // 关键依赖：精确
    "plugin": "*"              // 不推荐
  }
}
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 预发布版本

### 题目

`1.0.0-alpha.1` 和 `1.0.0` 的关系是？

**选项：**
- A. alpha 版本更新
- B. alpha 版本更旧（预发布）
- C. 版本相同
- D. 无法比较

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**预发布版本**

#### 版本比较

```
1.0.0-alpha.1 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

**预发布版本在正式版本之前**

#### 发布流程

```
开发 → alpha → beta → rc → 正式版

1.0.0-alpha.1  # 内部测试
1.0.0-alpha.2
1.0.0-beta.1   # 公开测试
1.0.0-beta.2
1.0.0-rc.1     # 候选版本
1.0.0          # 正式发布 ✅
```

#### 安装预发布版本

```bash
# 安装 latest（不包含预发布）
npm install react
# react@18.2.0

# 安装指定预发布版本
npm install react@19.0.0-beta.1

# 安装 beta 标签
npm install react@beta
```

#### 发布预发布版本

```bash
# 发布 alpha
npm version prerelease --preid=alpha
npm publish --tag alpha

# 发布 beta
npm version prerelease --preid=beta
npm publish --tag beta

# 发布正式版
npm version minor
npm publish
```

#### dist-tags

```json
{
  "dist-tags": {
    "latest": "18.2.0",
    "beta": "19.0.0-beta.1",
    "alpha": "19.0.0-alpha.5"
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 版本解析

### 题目

以下依赖最终会安装什么版本？

```json
{
  "dependencies": {
    "pkg-a": "^1.0.0",
    "pkg-b": "^1.0.0"
  }
}
```

其中：
- pkg-a 依赖 lodash@^4.17.0
- pkg-b 依赖 lodash@^4.15.0
- registry 上最新版本：lodash@4.17.21

**选项：**
- A. 两个不同版本的 lodash
- B. lodash@4.17.0
- C. lodash@4.17.21
- D. lodash@4.15.0

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**依赖版本解析**

#### 版本兼容性分析

```
pkg-a: ^4.17.0  →  >=4.17.0 <5.0.0
pkg-b: ^4.15.0  →  >=4.15.0 <5.0.0

交集: >=4.17.0 <5.0.0
```

**两个范围兼容**

#### npm 解析策略

```bash
# 1. 计算兼容范围
范围: >=4.17.0 <5.0.0

# 2. 选择最新的兼容版本
最新: 4.17.21  ✅

# 3. 提升到顶层
node_modules/
├── pkg-a/
├── pkg-b/
└── lodash@4.17.21  ← 共享
```

#### 不兼容的情况

```json
{
  "dependencies": {
    "pkg-a": "^1.0.0",  // 依赖 lodash@^4.17.0
    "pkg-b": "^2.0.0"   // 依赖 lodash@^3.10.0
  }
}
```

```
^4.17.0 和 ^3.10.0 不兼容

node_modules/
├── pkg-a/
├── pkg-b/
│   └── node_modules/
│       └── lodash@3.10.1  ← 嵌套
└── lodash@4.17.21  ← 提升
```

**安装两个版本**

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 锁文件对比

### 题目

yarn.lock 和 package-lock.json 的主要区别是什么？

**选项：**
- A. 功能完全相同，只是格式不同
- B. yarn.lock 更简洁，package-lock.json 更详细
- C. 只能选择其中一个使用
- D. package-lock.json 是压缩的

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**三种 lock 文件对比**

#### package-lock.json (npm)

```json
{
  "name": "my-app",
  "lockfileVersion": 3,
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

**特点：** 详细、JSON格式、包含所有元数据

#### yarn.lock (Yarn)

```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#679591c564c3bffaae8454cf0b3df370c3d6911c"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
```

**特点：** 简洁、YAML-like格式、人类可读

#### pnpm-lock.yaml (pnpm)

```yaml
lockfileVersion: '6.0'

dependencies:
  lodash:
    specifier: ^4.17.21
    version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-v2kDEe...}
    dev: false
```

**特点：** 最简洁、包含 specifier

#### 对比表

| 特性 | package-lock.json | yarn.lock | pnpm-lock.yaml |
|------|------------------|-----------|----------------|
| **格式** | JSON | YAML-like | YAML |
| **体积** | 💾💾💾 | 💾💾 | 💾 |
| **可读性** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **详细程度** | 最详细 | 适中 | 适中 |

#### 兼容性

```bash
# 不要混用
❌ package-lock.json + yarn.lock
❌ package-lock.json + pnpm-lock.yaml

# 选择一个
✅ 只用 package-lock.json（npm）
✅ 只用 yarn.lock（Yarn）
✅ 只用 pnpm-lock.yaml（pnpm）
```

**.gitignore：**

```
# 如果使用 pnpm
package-lock.json
yarn.lock

# 如果使用 Yarn
package-lock.json
pnpm-lock.yaml

# 如果使用 npm
yarn.lock
pnpm-lock.yaml
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 版本更新策略

### 题目

项目中有100个依赖，如何安全地更新所有依赖？

**选项：**
- A. 直接 npm update
- B. 使用 npm-check-updates 批量更新
- C. 分批更新并测试
- D. 删除 node_modules 重装

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**安全的依赖更新流程**

#### 方案 C：分批更新 ✅ 推荐

**步骤 1：检查过期包**

```bash
npm outdated

# 输出：
Package    Current  Wanted  Latest
lodash     4.17.0   4.17.21 4.17.21
react      17.0.0   17.0.2  18.2.0
axios      0.21.0   0.21.4  1.4.0
```

**步骤 2：按优先级分类**

```
1. 安全更新（高优先级）
   - 有已知漏洞的包
   npm audit

2. PATCH 更新（低风险）
   - Current → Wanted
   npm update

3. MINOR 更新（中风险）
   - 新功能，向后兼容
   分组测试

4. MAJOR 更新（高风险）
   - 破坏性变更
   逐个更新，充分测试
```

**步骤 3：安全更新**

```bash
npm audit fix
npm test
```

**步骤 4：PATCH 更新**

```bash
npm update
npm test
```

**步骤 5：MINOR 更新（分组）**

```bash
# 第一组：工具库
npm install lodash@latest moment@latest
npm test

# 第二组：UI库
npm install @mui/material@latest
npm test
```

**步骤 6：MAJOR 更新（逐个）**

```bash
# React 18 升级
npm install react@18 react-dom@18
npm test
npm run build
# 测试功能

# axios 1.x 升级
npm install axios@1
npm test
# 检查 breaking changes
```

#### 方案 A：npm update ❌ 不够

```bash
npm update

# 只更新到 Wanted 版本
# 不会更新 MAJOR 版本
# 可能遗漏重要更新
```

#### 方案 B：批量更新 ⚠️ 风险高

```bash
npm install -g npm-check-updates

ncu -u  # 更新所有到 Latest
npm install

# 问题：
# - 可能破坏兼容性
# - 难以定位问题
# - 回滚困难
```

#### 方案 D：重装 ❌ 无意义

```bash
rm -rf node_modules
npm install

# 仍然按 package.json 安装
# 不会更新版本
```

#### 完整流程脚本

```json
{
  "scripts": {
    "check:outdated": "npm outdated",
    "check:security": "npm audit",
    "update:patch": "npm update",
    "update:interactive": "npm-check -u",
    "test:all": "npm run lint && npm test && npm run build"
  }
}
```

```bash
# 1. 检查
npm run check:outdated
npm run check:security

# 2. 安全修复
npm audit fix

# 3. PATCH 更新
npm run update:patch
npm run test:all

# 4. 交互式更新其他
npm run update:interactive

# 5. 提交
git commit -am "chore: update dependencies"
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 版本管理最佳实践

### 题目

如何在 Monorepo 中统一所有子包的依赖版本？

<details>
<summary>查看答案</summary>

### ✅ 答案

**使用 syncpack**

#### 1. 安装工具

```bash
npm install -g syncpack
```

#### 2. 检查版本不一致

```bash
syncpack list-mismatches

# 输出：
lodash
  ^4.17.20 packages/pkg-a
  ^4.17.21 packages/pkg-b

react
  ^17.0.0 packages/web
  ^18.0.0 packages/admin
```

#### 3. 修复不一致

```bash
# 自动修复（使用最新版本）
syncpack fix-mismatches

# 或指定版本
syncpack set-semver-ranges
```

#### 4. 验证

```bash
syncpack list
```

### 📖 解析

**Monorepo 版本管理策略**

#### 方案 1：syncpack（推荐）

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

**使用：**

```bash
# 检查
syncpack list-mismatches

# 修复
syncpack fix-mismatches

# 格式化
syncpack format
```

#### 方案 2：pnpm workspace

**pnpm-workspace.yaml：**

```yaml
packages:
  - 'packages/*'
```

**根 package.json：**

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

**子包：**

```json
{
  "dependencies": {
    "@myorg/utils": "workspace:*",
    "react": "^18.2.0"
  }
}
```

**特点：**
- 开发依赖提升到根
- workspace 协议引用本地包

#### 方案 3：Lerna + Yarn Workspaces

**lerna.json：**

```json
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "command": {
    "version": {
      "conventionalCommits": true,
      "exact": true
    }
  }
}
```

**完整示例**

```
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
├── .syncpackrc.json
├── packages/
│   ├── ui/
│   │   └── package.json
│   └── utils/
│       └── package.json
```

**根 package.json：**

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "check:versions": "syncpack list-mismatches",
    "fix:versions": "syncpack fix-mismatches",
    "update:all": "pnpm -r update"
  },
  "devDependencies": {
    "syncpack": "^11.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

</details>

---

**导航**  
[上一章：第 8 章面试题](./chapter-08.md) | [返回目录](../README.md) | [下一章：第 10 章面试题](./chapter-10.md)
