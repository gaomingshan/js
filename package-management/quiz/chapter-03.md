# 第 3 章：包管理器工作原理 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 安装流程

### 题目

`npm install` 的主要步骤顺序是什么？

**选项：**
- A. 解析依赖 → 下载包 → 解压 → 安装到 node_modules
- B. 下载包 → 解析依赖 → 解压 → 安装
- C. 解压 → 解析依赖 → 下载包 → 安装
- D. 安装 → 下载包 → 解析依赖 → 解压

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**npm install 完整流程**

#### 1️⃣ 检查配置

```bash
# 读取配置
.npmrc（项目）
.npmrc（用户）
.npmrc（全局）
```

#### 2️⃣ 解析依赖树

```javascript
// 读取 package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// 递归解析
express@4.18.0
├── body-parser@1.20.0
│   └── bytes@3.1.2
└── cookie@0.5.0
```

#### 3️⃣ 检查缓存

```bash
~/.npm/_cacache/  # npm 缓存目录
```

**命中缓存 → 跳过下载**

#### 4️⃣ 下载包

```bash
# 从 registry 下载 tarball
https://registry.npmjs.org/express/-/express-4.18.0.tgz
```

#### 5️⃣ 解压到临时目录

```bash
/tmp/npm-xxx/
```

#### 6️⃣ 扁平化处理

```bash
# 将依赖提升到顶层（如果不冲突）
node_modules/
├── express/
├── body-parser/
├── bytes/
└── cookie/
```

#### 7️⃣ 复制到 node_modules

#### 8️⃣ 执行生命周期脚本

```json
{
  "scripts": {
    "postinstall": "node scripts/build.js"
  }
}
```

#### 9️⃣ 生成 package-lock.json

**流程图：**

```
检查配置 → 解析依赖 → 检查缓存 → 下载包 
    ↓
解压 → 扁平化 → 安装 → 生命周期 → 锁文件
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** node_modules

### 题目

npm 3+ 的扁平化 node_modules 结构可以完全避免依赖重复安装。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**扁平化无法完全避免重复**

#### 版本冲突场景

```json
// package.json
{
  "dependencies": {
    "pkg-a": "^1.0.0",  // 依赖 lodash@^4.17.0
    "pkg-b": "^2.0.0"   // 依赖 lodash@^3.10.0
  }
}
```

**node_modules 结构：**

```
node_modules/
├── pkg-a/
├── pkg-b/
│   └── node_modules/
│       └── lodash@3.10.1  ← 必须嵌套
├── lodash@4.17.21  ← 提升到顶层
```

**仍会重复安装 lodash**

#### 提升规则

**可以提升：**
- 版本兼容（^4.17.0 和 ^4.17.21）
- 先安装的包优先提升

**必须嵌套：**
- 版本不兼容（v3 vs v4）
- 后安装的冲突包

#### pnpm 的优化

```
node_modules/
├── .pnpm/
│   ├── lodash@3.10.1/
│   └── lodash@4.17.21/
└── (符号链接)
```

**硬链接共享：**
- 物理上只存储一次
- 逻辑上可多次使用

#### 对比

| 方案 | 重复安装 | 磁盘占用 |
|------|---------|---------|
| npm 2（嵌套） | 很多 | 💾💾💾 |
| npm 3（扁平） | 部分 | 💾💾 |
| pnpm（链接） | 无 | 💾 |

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 缓存机制

### 题目

npm 缓存的默认位置在哪里？

**选项：**
- A. node_modules/.cache
- B. ~/.npm
- C. /tmp/npm-cache
- D. package.json 同级目录

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm 缓存机制**

#### 缓存位置

**默认路径：**

```bash
# macOS/Linux
~/.npm

# Windows
%AppData%\npm-cache
```

**查看缓存路径：**

```bash
npm config get cache
# /Users/username/.npm
```

**自定义缓存：**

```bash
npm config set cache /path/to/cache
```

#### 缓存结构

```
~/.npm/
├── _cacache/           # 缓存数据
│   ├── content-v2/    # 包内容
│   ├── index-v5/      # 索引
│   └── tmp/           # 临时文件
└── _logs/             # 日志
```

#### 缓存工作流程

```bash
# 1. 安装包
npm install lodash

# 2. 检查缓存
~/.npm/_cacache/index-v5/

# 3. 命中 → 从缓存复制
# 4. 未命中 → 下载并缓存
```

#### 缓存操作

**查看缓存大小：**

```bash
du -sh ~/.npm
# 2.5GB
```

**清理缓存：**

```bash
# 完全清理
npm cache clean --force

# 验证缓存
npm cache verify
```

#### 其他包管理器缓存

**Yarn：**

```bash
# 查看位置
yarn cache dir
# /Users/username/Library/Caches/Yarn

# 清理
yarn cache clean
```

**pnpm：**

```bash
# 查看 store
pnpm store path
# ~/.pnpm-store

# 清理
pnpm store prune
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 链接机制

### 题目

以下关于硬链接（Hard Link）和符号链接（Symbolic Link）的说法，哪些是正确的？

**选项：**
- A. 硬链接可以跨文件系统
- B. 符号链接删除不影响源文件
- C. pnpm 使用硬链接节省空间
- D. npm link 使用硬链接

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B、C

### 📖 解析

**链接机制对比**

#### 选项 A：硬链接跨文件系统 ❌

**硬链接限制：**
- ❌ 不能跨文件系统
- ❌ 不能链接目录
- ✅ 共享同一 inode
- ✅ 删除一个不影响其他

```bash
# 硬链接
ln source.txt hardlink.txt

# inode 相同
ls -li
# 12345 source.txt
# 12345 hardlink.txt
```

#### 选项 B：符号链接删除不影响源文件 ✅

**符号链接特性：**

```bash
# 创建符号链接
ln -s /path/to/source symlink

# 删除符号链接
rm symlink  # 源文件不受影响

# 删除源文件
rm source   # 符号链接变成悬空链接
```

#### 选项 C：pnpm 使用硬链接 ✅

**pnpm 的存储策略：**

```
.pnpm-store/
└── v3/
    └── files/
        └── 00/
            └── 1a2b3c...  ← 实际文件

node_modules/
└── .pnpm/
    └── lodash@4.17.21/
        └── node_modules/
            └── lodash/
                └── index.js  → 硬链接到 store
```

**优势：**
- 节省磁盘空间（同一文件只存储一次）
- 安装速度快

#### 选项 D：npm link 使用符号链接 ❌

**npm link 机制：**

```bash
# 在包目录
npm link
# 创建符号链接：全局 → 当前包

# 在项目中
npm link package-name
# 创建符号链接：项目 → 全局包
```

**符号链接，不是硬链接**

#### 链接类型总结

| 特性 | 硬链接 | 符号链接 |
|------|--------|---------|
| 跨文件系统 | ❌ | ✅ |
| 链接目录 | ❌ | ✅ |
| 删除源文件 | 不影响 | 悬空 |
| inode | 相同 | 不同 |
| pnpm | ✅ | ❌ |
| npm link | ❌ | ✅ |

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 依赖提升

### 题目

以下依赖树会形成什么样的 node_modules 结构？

```
app
├── pkg-a@1.0.0
│   └── lodash@4.17.0
└── pkg-b@2.0.0
    └── lodash@4.17.21
```

**选项：**
- A. 两个 lodash 都提升到顶层
- B. 一个提升，一个嵌套
- C. 两个都嵌套在各自的包中
- D. 合并为一个 lodash@4.17.21

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**扁平化提升规则**

#### 版本兼容性分析

```
lodash@4.17.0  和  lodash@4.17.21
```

**是否兼容？**
- 主版本号相同（4）
- 次版本号相同（17）
- 只有修订号不同
- ✅ 兼容（可以共用）

**但为什么不合并？**
- npm 3+ 不自动升级
- 安装顺序决定提升

#### 实际 node_modules 结构

**假设 pkg-a 先安装：**

```
node_modules/
├── pkg-a/
├── pkg-b/
│   └── node_modules/
│       └── lodash@4.17.21  ← 后安装的嵌套
├── lodash@4.17.0  ← 先安装的提升
```

**假设 pkg-b 先安装：**

```
node_modules/
├── pkg-a/
│   └── node_modules/
│       └── lodash@4.17.0  ← 后安装的嵌套
├── pkg-b/
├── lodash@4.17.21  ← 先安装的提升
```

**顺序不确定性问题！**

#### 解决方案

**1. package-lock.json 锁定**

```json
{
  "dependencies": {
    "lodash": {
      "version": "4.17.21",  // 锁定版本
      "resolved": "..."
    }
  }
}
```

**2. npm dedupe 去重**

```bash
npm dedupe

# 优化后
node_modules/
├── pkg-a/
├── pkg-b/
└── lodash@4.17.21  # 统一使用最新兼容版本
```

**3. 使用 pnpm**

```
node_modules/
├── .pnpm/
│   ├── lodash@4.17.0/
│   └── lodash@4.17.21/
└── (符号链接)

# 每个包精确使用声明的版本
```

#### 验证命令

```bash
# 查看实际结构
npm ls lodash

# 检查重复
npm ls lodash --depth=Infinity
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** Lock 文件

### 题目

package-lock.json 的主要作用是什么？

**选项：**
- A. 提高安装速度
- B. 锁定依赖版本，确保一致性
- C. 压缩 node_modules 大小
- D. 自动更新过期的包

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**package-lock.json 的作用**

#### 主要功能：确保一致性

**问题场景：**

```json
// package.json
{
  "dependencies": {
    "lodash": "^4.17.0"  // 允许 4.17.0 - 4.x.x
  }
}
```

**不同时间安装：**

```bash
# 2021 年安装
npm install  # lodash@4.17.20

# 2023 年安装
npm install  # lodash@4.17.21 ← 版本不同！
```

#### lock 文件锁定版本

```json
// package-lock.json
{
  "dependencies": {
    "lodash": {
      "version": "4.17.20",  // ← 精确版本
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.20.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

**所有人安装都是 4.17.20**

#### 完整性校验

**integrity 字段：**

```json
{
  "integrity": "sha512-PlhdFcillOINfeV7Ni6oF1TAEayyZBoZ8bcshTHqOYJYlrqzRK5hagpagky5o4HfCzzd1TRkXPMFq6cKk9rGmA=="
}
```

**作用：**
- 验证包未被篡改
- 确保安全性

#### 提升性能（次要作用）

```bash
# 使用 lock 文件
npm ci  # 快速安装

# 不使用（重新解析）
npm install --no-package-lock  # 慢
```

#### 其他 lock 文件

**yarn.lock：**

```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://..."
  integrity sha512...
```

**pnpm-lock.yaml：**

```yaml
dependencies:
  lodash:
    specifier: ^4.17.0
    version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512...}
```

#### 最佳实践

```bash
# ✅ 提交到版本控制
git add package-lock.json

# ✅ CI 使用 ci 命令
npm ci

# ❌ 不要忽略
# .gitignore
# package-lock.json  # 不要这样做！
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** npm link

### 题目

执行以下命令后，会发生什么？

```bash
cd /path/to/my-package
npm link

cd /path/to/my-app
npm link my-package
```

**选项：**
- A. 复制 my-package 到 my-app/node_modules
- B. 创建符号链接指向 my-package
- C. 硬链接 my-package 到全局
- D. 将 my-package 发布到 npm

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm link 工作原理**

#### 步骤 1：npm link（在包目录）

```bash
cd /path/to/my-package
npm link
```

**创建全局符号链接：**

```
~/.npm-global/lib/node_modules/my-package
    ↓ (符号链接)
/path/to/my-package
```

#### 步骤 2：npm link package-name（在项目中）

```bash
cd /path/to/my-app
npm link my-package
```

**创建本地符号链接：**

```
/path/to/my-app/node_modules/my-package
    ↓ (符号链接)
~/.npm-global/lib/node_modules/my-package
    ↓ (符号链接)
/path/to/my-package
```

#### 实际效果

**双重符号链接：**

```
项目 → 全局 → 源代码
```

**使用：**

```javascript
// my-app/index.js
const myPackage = require('my-package');
// 直接使用源代码，修改实时生效
```

#### 验证链接

```bash
# 查看链接
ls -la node_modules/my-package
# lrwxr-xr-x  ... my-package -> /path/to/my-package

# 查看全局链接
npm ls -g --depth=0
```

#### 解除链接

```bash
# 在项目中
npm unlink my-package

# 在包目录
npm unlink
```

#### 替代方案

**1. file: 协议**

```json
{
  "dependencies": {
    "my-package": "file:../my-package"
  }
}
```

**2. pnpm link**

```bash
cd /path/to/my-package
pnpm link --global

cd /path/to/my-app
pnpm link --global my-package
```

**3. Workspaces**

```json
{
  "workspaces": ["packages/*"]
}
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 依赖解析算法

### 题目

npm 使用什么算法解析依赖冲突？

**选项：**
- A. 深度优先搜索（DFS）
- B. 广度优先搜索（BFS）
- C. 拓扑排序
- D. 贪心算法

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**npm 依赖解析算法**

#### 广度优先搜索（BFS）

**为什么使用 BFS？**
- 优先处理直接依赖
- 层层展开，便于扁平化
- 同级依赖并行处理

#### 解析流程

**示例依赖树：**

```json
{
  "dependencies": {
    "A": "1.0.0",
    "B": "1.0.0"
  }
}
```

```
app
├── A@1.0.0
│   ├── C@1.0.0
│   └── D@1.0.0
└── B@1.0.0
    └── C@2.0.0
```

**BFS 访问顺序：**

```
Level 0: app
Level 1: A, B        ← 先处理
Level 2: C, D, C     ← 后处理
```

#### 扁平化策略

**1. 第一次遇到的包提升**

```bash
# 访问顺序
1. app
2. A (安装 C@1.0.0)  ← C 首次出现，提升
3. B (需要 C@2.0.0)  ← C 已存在，嵌套

# 结果
node_modules/
├── A/
├── B/
│   └── node_modules/
│       └── C@2.0.0  ← 嵌套
├── C@1.0.0  ← 提升
└── D/
```

**2. 先安装的优先提升**

```json
{
  "dependencies": {
    "B": "1.0.0",  // 改变顺序
    "A": "1.0.0"
  }
}
```

```bash
# 新的访问顺序
1. app
2. B (安装 C@2.0.0)  ← C 首次出现，提升
3. A (需要 C@1.0.0)  ← C 已存在，嵌套

# 结果改变
node_modules/
├── A/
│   └── node_modules/
│       └── C@1.0.0  ← 嵌套
├── B/
├── C@2.0.0  ← 提升（版本变了）
└── D/
```

#### 伪代码

```javascript
function resolveDependencies(pkg) {
  const queue = [pkg];  // BFS 队列
  const installed = new Map();
  
  while (queue.length > 0) {
    const current = queue.shift();  // FIFO
    
    for (const [name, version] of current.dependencies) {
      // 检查是否已安装
      if (!installed.has(name)) {
        // 提升到顶层
        installed.set(name, version);
        installToRoot(name, version);
      } else if (installed.get(name) !== version) {
        // 嵌套安装
        installNested(current, name, version);
      }
      
      // 添加子依赖到队列
      queue.push(getPackage(name, version));
    }
  }
}
```

#### pnpm 的改进

**确定性解析：**
- 不依赖安装顺序
- 严格按声明的版本
- 使用符号链接隔离

```javascript
// pnpm 策略
function pnpmResolve(pkg) {
  // 每个包获得独立的依赖空间
  for (const dep of pkg.dependencies) {
    createSymlink(pkg, dep, dep.version);  // 精确版本
  }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 幽灵依赖

### 题目

以下代码能正常运行吗？

```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

```javascript
// index.js
const bodyParser = require('body-parser');
```

**选项：**
- A. 能运行，body-parser 会自动安装
- B. 不能运行，未声明依赖
- C. 可能能运行（幽灵依赖）
- D. 能运行，body-parser 是内置模块

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**幽灵依赖问题**

#### 什么是幽灵依赖？

**定义：**
- 代码中使用了未在 package.json 中声明的依赖
- 因扁平化而能访问到其他包的依赖

#### 本题分析

**express 的依赖：**

```json
// express/package.json
{
  "dependencies": {
    "body-parser": "^1.20.0",
    "cookie": "^0.5.0",
    ...
  }
}
```

**扁平化后：**

```
node_modules/
├── express/
├── body-parser/  ← 被提升
├── cookie/
└── ...
```

**结果：**
- ✅ 代码能运行（当前）
- ⚠️ 隐患很大

#### 风险

**1. express 更新可能移除 body-parser**

```json
// express@5.0.0 (假设)
{
  "dependencies": {
    // body-parser 被移除
  }
}
```

```bash
npm update express
# 代码突然报错！
# Error: Cannot find module 'body-parser'
```

**2. 安装顺序影响**

```bash
# 场景 A
npm install express
# body-parser 提升 ✅

# 场景 B
npm install other-pkg express
# body-parser 可能不提升 ❌
```

**3. pnpm 直接报错**

```bash
pnpm install

# Error: Cannot find module 'body-parser'
# 严格依赖检查
```

#### 正确做法

**显式声明：**

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "body-parser": "^1.20.0"  // ✅ 明确声明
  }
}
```

#### 检测幽灵依赖

**1. 使用 depcheck**

```bash
npm install -g depcheck
depcheck

# Missing dependencies
# * body-parser
```

**2. 使用 pnpm**

```bash
pnpm install
# 自动检测未声明的依赖
```

**3. ESLint 规则**

```javascript
// .eslintrc.js
{
  "plugins": ["import"],
  "rules": {
    "import/no-extraneous-dependencies": "error"
  }
}
```

#### 实际案例

**常见幽灵依赖：**

```javascript
// 常见错误
import _ from 'lodash';  // 某个包依赖了 lodash
import axios from 'axios';  // 某个包依赖了 axios
import React from 'react';  // UI 库依赖了 React
```

**都需要明确声明！**

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 性能优化

### 题目

以下哪种方式安装依赖最快？

**选项：**
- A. npm install
- B. npm ci
- C. pnpm install
- D. yarn install

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**包管理器性能对比**

#### 测试环境

```
项目：200+ 依赖
硬件：MacBook Pro M1, SSD
网络：100Mbps
```

#### 冷安装（无缓存）

```bash
# 清空缓存
rm -rf node_modules ~/.npm ~/.pnpm-store

# 测试
time npm install        # 45s
time yarn install       # 28s
time pnpm install       # 14s  ⚡⚡
```

**pnpm 快一倍以上！**

#### 热安装（有缓存）

```bash
# 删除 node_modules，保留缓存
rm -rf node_modules

# 测试
time npm install        # 10s
time yarn install       # 5s
time pnpm install       # 1s   ⚡⚡⚡
```

**pnpm 快 5-10 倍！**

#### CI 环境（有缓存）

```bash
time npm ci             # 8s
time yarn install       # 5s
time pnpm install       # 3s   ⚡⚡
```

#### pnpm 为什么快？

**1. 硬链接机制**

```
.pnpm-store/
└── v3/files/
    └── lodash-4.17.21  ← 只存储一次

node_modules/
└── .pnpm/
    └── lodash@4.17.21/
        └── node_modules/
            └── lodash/
                └── index.js  → 硬链接
```

**复制 → 链接**
- npm/yarn：复制文件（慢）
- pnpm：创建硬链接（快）

**2. 并行下载**

```javascript
// pnpm 策略
const downloads = dependencies.map(dep => 
  downloadPackage(dep)  // 并行
);
await Promise.all(downloads);
```

**3. 内容寻址**

```bash
# 相同文件只下载一次
lodash@4.17.21 在多个项目中共享
```

#### npm ci 优化

**为什么 npm ci 比 npm install 快？**

```bash
npm ci
```

**特点：**
1. 删除 node_modules 重装
2. 严格按 lock 文件
3. 跳过某些检查
4. 不更新 package.json

**适用场景：**
- ✅ CI/CD 环境
- ❌ 本地开发

#### 性能总结

**速度排名：**

```
最快 ← → 最慢
pnpm > yarn > npm ci > npm install
```

**磁盘占用：**

```
最省 ← → 最多
pnpm > yarn > npm
```

#### 最佳实践

**本地开发：**
```bash
pnpm install  # 推荐
```

**CI/CD：**
```bash
# GitHub Actions
- run: pnpm install --frozen-lockfile

# 或 npm
- run: npm ci
```

**Docker：**
```dockerfile
FROM node:18-alpine
RUN corepack enable
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
```

</details>

---

**导航**  
[上一章：第 2 章面试题](./chapter-02.md) | [返回目录](../README.md) | [下一章：第 4 章面试题](./chapter-04.md)
