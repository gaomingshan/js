# 第 21 章：pnpm 基础与特性 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** pnpm基础

### 题目

pnpm 相比 npm 和 Yarn 的最大特点是什么？

**选项：**
- A. 速度更快
- B. 使用硬链接节省磁盘空间
- C. 配置更简单
- D. 生态更完善

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm 核心特性：硬链接**

#### 传统方式（npm/Yarn）

```
项目A/node_modules/
└── lodash/  # 1.4MB

项目B/node_modules/
└── lodash/  # 1.4MB（重复）

项目C/node_modules/
└── lodash/  # 1.4MB（重复）

总计：4.2MB
```

#### pnpm 方式

```
~/.pnpm-store/
└── lodash@4.17.21/  # 1.4MB（唯一副本）

项目A/node_modules/
└── lodash → 硬链接到 store

项目B/node_modules/
└── lodash → 硬链接到 store

项目C/node_modules/
└── lodash → 硬链接到 store

总计：1.4MB ⚡
```

**节省 67% 磁盘空间！**

#### 硬链接原理

```bash
# 同一文件的多个入口
inode: 12345  # 文件实际数据
  ↑
  ├─ ~/.pnpm-store/lodash@4.17.21
  ├─ project-a/node_modules/lodash
  └─ project-b/node_modules/lodash

# 只有一份数据，多个引用
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** pnpm安装

### 题目

pnpm 需要全局安装才能使用。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm 安装方式**

#### 方法 1：全局安装（推荐）

```bash
npm install -g pnpm
```

#### 方法 2：使用 Corepack（Node.js 16.13+）

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**无需全局安装**

#### 方法 3：npx 临时使用

```bash
npx pnpm install
npx pnpm add lodash
```

#### 方法 4：独立脚本

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**所以不是必须全局安装**

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** pnpm命令

### 题目

pnpm 安装依赖的命令是？

**选项：**
- A. pnpm i
- B. pnpm install
- C. pnpm add
- D. A 和 B 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**pnpm 命令**

#### 安装所有依赖

```bash
pnpm install
# 或简写
pnpm i
```

#### 添加新依赖

```bash
pnpm add lodash
pnpm add -D typescript
pnpm add -g pnpm
```

#### 常用命令对照

| 操作 | npm | pnpm |
|------|-----|------|
| **安装所有** | npm install | pnpm install / pnpm i |
| **添加依赖** | npm install pkg | pnpm add pkg |
| **添加 dev** | npm install -D pkg | pnpm add -D pkg |
| **移除依赖** | npm uninstall pkg | pnpm remove pkg |
| **更新依赖** | npm update | pnpm update |
| **运行脚本** | npm run build | pnpm run build / pnpm build |

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** pnpm优势

### 题目

pnpm 有哪些核心优势？

**选项：**
- A. 节省磁盘空间
- B. 安装速度快
- C. 严格的依赖管理
- D. 支持 Monorepo

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**pnpm 核心优势**

#### A. 节省磁盘空间 ✅

```bash
# 10个项目，每个项目 500MB
npm:  5GB（重复存储）
pnpm: 500MB（硬链接共享）⚡⚡⚡⚡⚡
```

#### B. 安装速度快 ✅

```bash
# 首次安装
npm:  60s
pnpm: 20s ⚡⚡⚡

# 有缓存
npm:  30s
pnpm: 5s  ⚡⚡⚡⚡⚡
```

#### C. 严格的依赖管理 ✅

```
node_modules/
├── .pnpm/  # 实际包存储
│   ├── lodash@4.17.21/
│   └── react@18.2.0/
└── lodash → .pnpm/lodash@4.17.21/node_modules/lodash

# 只能访问声明的依赖
# 消除幽灵依赖
```

**代码验证：**
```javascript
// 未声明的依赖
const pkg = require('undeclared-package');
// ❌ Error: Cannot find module
```

#### D. 支持 Monorepo ✅

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```bash
pnpm install
# 自动处理跨包依赖
```

#### 性能对比

| 指标 | npm | Yarn | pnpm |
|------|-----|------|------|
| **磁盘占用** | 💾💾💾 | 💾💾 | 💾 |
| **安装速度** | ⚡⚡ | ⚡⚡⚡ | ⚡⚡⚡⚡⚡ |
| **严格性** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Monorepo** | v7+ | ✅ | ✅✅ |

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** node_modules结构

### 题目

pnpm 的 node_modules 结构有何特殊之处？

**选项：**
- A. 完全扁平
- B. 使用 .pnpm 目录
- C. 符号链接结构
- D. B 和 C 都对

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**pnpm node_modules 结构**

#### 目录结构

```
node_modules/
├── .pnpm/
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash/  ← 硬链接到 store
│   └── react@18.2.0/
│       └── node_modules/
│           ├── react/  ← 硬链接到 store
│           └── loose-envify/  ← 依赖
├── lodash → .pnpm/lodash@4.17.21/node_modules/lodash
└── react → .pnpm/react@18.2.0/node_modules/react
```

#### 结构特点

**1. .pnpm 目录（实际存储）：**
```bash
.pnpm/
└── <package>@<version>/
    └── node_modules/
        ├── <package>/  # 硬链接
        └── <dep>/      # 依赖也在这里
```

**2. 顶层符号链接：**
```bash
node_modules/
└── lodash → .pnpm/lodash@4.17.21/node_modules/lodash
```

#### 与传统对比

**npm（扁平）：**
```
node_modules/
├── lodash/
├── react/
└── loose-envify/  # 可能被意外访问
```

**pnpm（隔离）：**
```
node_modules/
├── .pnpm/
│   └── react@18.2.0/
│       └── node_modules/
│           └── loose-envify/  # 隔离，不可直接访问
├── lodash/  ← 符号链接
└── react/   ← 符号链接
```

**只能访问声明的依赖！**

#### 验证

```bash
cd node_modules

ls -la
# lodash -> .pnpm/lodash@4.17.21/node_modules/lodash

cd .pnpm/react@18.2.0/node_modules
ls
# loose-envify  react
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** pnpm-lock.yaml

### 题目

pnpm-lock.yaml 的作用是什么？

**选项：**
- A. 配置文件
- B. 锁定依赖版本
- C. 缓存索引
- D. 工作区配置

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pnpm-lock.yaml**

#### 作用

```yaml
lockfileVersion: '6.0'

dependencies:
  lodash:
    specifier: ^4.17.0
    version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution:
      integrity: sha512-v2kDEe...
    dev: false
```

**锁定精确版本，确保一致性**

#### 与其他 lock 文件对比

**package-lock.json (npm)：**
```json
{
  "lockfileVersion": 3,
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21"
    }
  }
}
```

**yarn.lock：**
```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://..."
```

**pnpm-lock.yaml：**
```yaml
dependencies:
  lodash:
    specifier: ^4.17.0
    version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution: {...}
```

#### 特点

**1. 人类可读：**
- YAML 格式
- 清晰的结构

**2. 完整性：**
- integrity 校验
- 依赖关系图

**3. 性能：**
- 快速解析
- 确定性安装

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 存储位置

### 题目

pnpm 的全局存储位置在哪里？

```bash
pnpm store path
```

**选项：**
- A. ~/.pnpm
- B. ~/.pnpm-store
- C. 取决于操作系统
- D. 项目目录下

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**pnpm store 位置**

#### 默认位置（因 OS 而异）

**macOS/Linux：**
```bash
pnpm store path
# ~/.local/share/pnpm/store/v3
```

**Windows：**
```bash
pnpm store path
# %LOCALAPPDATA%\pnpm\store\v3
```

#### 自定义位置

```bash
# 设置环境变量
export PNPM_HOME=/custom/path

# 或配置文件
pnpm config set store-dir /custom/path
```

**.npmrc：**
```ini
store-dir=/custom/pnpm-store
```

#### Store 结构

```
~/.local/share/pnpm/store/v3/
├── files/
│   └── 00/
│       └── abcd1234...  # 内容寻址
└── tmp/
```

**内容寻址存储（Content-Addressable Storage）**

#### 查看 Store

```bash
# 查看路径
pnpm store path

# 查看状态
pnpm store status

# 清理无用包
pnpm store prune
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 硬链接原理

### 题目

pnpm 的硬链接机制是如何工作的？

**选项：**
- A. 复制文件
- B. 创建文件系统级别的引用
- C. 使用符号链接
- D. 压缩存储

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**硬链接机制**

#### 文件系统原理

**普通文件（npm）：**
```
inode 12345: lodash@4.17.21 的数据（1.4MB）
  ↑
  project-a/node_modules/lodash/

inode 67890: lodash@4.17.21 的数据（1.4MB）← 重复
  ↑
  project-b/node_modules/lodash/

总计：2.8MB
```

**硬链接（pnpm）：**
```
inode 12345: lodash@4.17.21 的数据（1.4MB）
  ↑
  ├─ ~/.pnpm-store/v3/files/00/abcd...
  ├─ project-a/node_modules/.pnpm/lodash@4.17.21/...
  └─ project-b/node_modules/.pnpm/lodash@4.17.21/...

总计：1.4MB（只有一份数据）
```

**多个目录项指向同一 inode**

#### 硬链接 vs 符号链接

**硬链接：**
```bash
ln source target

# 特点：
# - 指向相同 inode
# - 删除源文件不影响
# - 必须在同一文件系统
# - 不能链接目录
```

**符号链接：**
```bash
ln -s source target

# 特点：
# - 创建新 inode，存储路径
# - 删除源文件会断链
# - 可跨文件系统
# - 可以链接目录
```

#### pnpm 双层链接

**1. 硬链接（store → .pnpm）：**
```bash
# Store 到项目
~/.pnpm-store/v3/files/00/abcd...
  ↓ 硬链接
node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/index.js
```

**2. 符号链接（.pnpm → 顶层）：**
```bash
# .pnpm 到顶层
node_modules/.pnpm/lodash@4.17.21/node_modules/lodash
  ↓ 符号链接
node_modules/lodash
```

**为什么这样设计？**
- 硬链接节省空间
- 符号链接方便访问

#### 内容寻址

```bash
# 文件内容的哈希
echo "console.log('hello')" | sha1sum
# a1b2c3d4...

# Store 中的路径
~/.pnpm-store/v3/files/a1/b2c3d4...
```

**相同内容只存一份**

#### 验证

```bash
# 查看 inode
ls -i ~/.pnpm-store/v3/files/00/abcd...
# 12345 abcd...

ls -i node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/index.js
# 12345 index.js  ← 相同的 inode

# 查看链接数
ls -l ~/.pnpm-store/v3/files/00/abcd...
# -rw-r--r-- 3  ← 3 个硬链接
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** 幽灵依赖

### 题目

pnpm 如何解决幽灵依赖问题？

<details>
<summary>查看答案</summary>

### ✅ 答案

**幽灵依赖（Phantom Dependencies）问题**

#### 问题示例

**package.json：**
```json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

**npm/Yarn 扁平结构：**
```
node_modules/
├── express/
├── body-parser/  ← express 的依赖，被提升
└── cookie-parser/
```

**代码中：**
```javascript
// 未声明 body-parser，但能用
const bodyParser = require('body-parser');
// ✅ 成功（幽灵依赖）
```

**问题：**
- 未声明的依赖可以访问
- 升级 express 可能移除 body-parser
- 代码突然崩溃

#### pnpm 解决方案

**pnpm 结构：**
```
node_modules/
├── .pnpm/
│   └── express@4.18.0/
│       └── node_modules/
│           ├── express/
│           ├── body-parser/  ← 隔离在这里
│           └── cookie-parser/
└── express → .pnpm/express@4.18.0/node_modules/express
```

**代码中：**
```javascript
const bodyParser = require('body-parser');
// ❌ Error: Cannot find module 'body-parser'
```

**强制声明依赖**

#### 修复方法

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "body-parser": "^1.20.0"  // ✅ 显式声明
  }
}
```

```javascript
const bodyParser = require('body-parser');
// ✅ 成功
```

### 📖 解析

**pnpm 严格性优势**

**对比：**
```bash
# npm/Yarn（宽松）
项目可以访问：
- 声明的依赖 ✅
- 依赖的依赖 ✅（幽灵依赖）
- 其他提升的包 ✅

# pnpm（严格）
项目只能访问：
- 声明的依赖 ✅
- 依赖的依赖 ❌
- 其他包 ❌
```

**迁移到 pnpm 的好处：**
- 暴露隐藏的依赖问题
- 强制规范化
- 避免未来崩溃

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** pnpm配置

### 题目

如何配置 pnpm 项目？

<details>
<summary>查看答案</summary>

### ✅ 答案

**完整 pnpm 项目配置**

#### 1. .npmrc

```ini
# Registry
registry=https://registry.npmmirror.com

# pnpm 配置
shamefully-hoist=false  # 不提升（严格模式）
strict-peer-dependencies=true  # 严格检查 peer
auto-install-peers=false  # 不自动安装 peer

# Store
# store-dir=/custom/path  # 自定义 store 位置

# 公共 hoist 模式（可选）
# public-hoist-pattern[]=*eslint*
# public-hoist-pattern[]=*prettier*

# 私有源
# @mycompany:registry=https://npm.mycompany.com
```

#### 2. pnpm-workspace.yaml

```yaml
packages:
  # 包目录
  - 'packages/*'
  - 'apps/*'
  
  # 排除
  - '!**/test/**'
```

#### 3. package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@8.6.0",
  
  "scripts": {
    "install": "pnpm install",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "clean": "pnpm -r run clean",
    "dev": "pnpm --parallel -r run dev"
  },
  
  "devDependencies": {
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

#### 4. .gitignore

```
# 依赖
node_modules/

# pnpm
.pnpm-debug.log

# Store（通常不提交）
.pnpm-store/

# 构建
dist/
```

#### 5. CI/CD 配置

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
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm run build
      - run: pnpm run test
```

### 📖 解析

**配置说明**

**shamefully-hoist：**
```ini
shamefully-hoist=false  # 推荐（严格）
# false: 严格隔离，消除幽灵依赖
# true: 提升到顶层（兼容模式）
```

**strict-peer-dependencies：**
```ini
strict-peer-dependencies=true  # 推荐
# 严格检查 peerDependencies 版本
```

**public-hoist-pattern：**
```ini
public-hoist-pattern[]=*eslint*
# 提升特定包到顶层（如工具）
```

**完整示例项目结构：**
```
my-monorepo/
├── .npmrc
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── package.json
├── packages/
│   ├── ui/
│   └── utils/
└── apps/
    └── web/
```

</details>

---

**导航**  
[上一章：第 20 章面试题](./chapter-20.md) | [返回目录](../README.md) | [下一章：第 22 章面试题](./chapter-22.md)
