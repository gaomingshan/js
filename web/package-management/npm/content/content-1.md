# npm 是什么：包管理器的核心职责

## 概述

npm（Node Package Manager）是 JavaScript 生态系统中最重要的包管理工具之一，它不仅是一个命令行工具，更是连接开发者、包和项目的核心枢纽。理解 npm 的定位与职责，是掌握现代前端工程化的基础。

## npm 的三个核心组成

### 1. npm CLI（命令行工具）

npm CLI 是我们日常使用的命令行界面，安装在本地计算机上，提供包管理的各种功能。

**主要职责：**
- 安装、更新、卸载依赖包
- 管理项目配置（package.json、package-lock.json）
- 运行脚本和生命周期钩子
- 发布和管理包到 registry

**安装位置：**
```bash
# 查看 npm 安装路径
which npm  # Unix/Linux/macOS
where npm  # Windows

# 查看 npm 版本
npm -v
```

### 2. npm Registry（包仓库）

npm registry 是一个巨大的公共数据库，存储着数百万个 JavaScript 包。

**官方 Registry：**
- 地址：https://registry.npmjs.org
- 全球最大的 JavaScript 包仓库
- 免费使用，支持公共包和私有包（需付费）

**Registry 职责：**
- 存储包的源代码和元数据
- 提供包的搜索和下载服务
- 管理包的版本信息
- 处理包的权限和访问控制

### 3. Package（包）

Package 是可复用的代码模块，是 npm 生态的基本单元。

**包的特征：**
- 包含 package.json 描述文件
- 遵循特定的目录结构
- 可以被其他项目引用和使用
- 支持版本管理和依赖声明

## npm 与 Node.js 的关系

### 历史渊源

- **2009 年**：Node.js 发布
- **2010 年**：npm 作为独立项目发布
- **2020 年**：GitHub（微软）收购 npm

### 依赖关系

```
Node.js 安装 → 自动包含 npm CLI
```

**版本对应：**
```bash
# Node.js 和 npm 通常配套安装
node -v  # v18.17.0
npm -v   # 9.6.7

# 不同 Node.js 版本对应不同 npm 版本
# Node.js 14.x → npm 6.x
# Node.js 16.x → npm 8.x  
# Node.js 18.x → npm 9.x
# Node.js 20.x → npm 10.x
```

### 相互独立性

虽然 npm 随 Node.js 一起安装，但它们是独立的项目：

```bash
# 可以单独升级 npm
npm install -g npm@latest

# 升级后 npm 版本可能高于 Node.js 默认版本
```

## npm 的核心职责

### 1. 依赖管理

**自动化依赖安装：**
```bash
# 根据 package.json 安装所有依赖
npm install

# 添加新依赖并自动更新 package.json
npm install lodash
```

**依赖树解析：**
- 分析依赖关系
- 解决版本冲突
- 扁平化安装（减少重复）

### 2. 版本控制

**语义化版本管理：**
```json
{
  "dependencies": {
    "react": "^18.2.0",      // 允许次版本更新
    "lodash": "~4.17.21",    // 允许补丁更新
    "axios": "1.4.0"         // 精确版本
  }
}
```

**锁文件机制：**
- `package-lock.json` 锁定依赖树
- 确保团队成员安装相同版本
- 提高安装稳定性和可重现性

### 3. 脚本执行

**npm scripts 系统：**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint ."
  }
}
```

```bash
# 运行脚本
npm run dev
npm run build
npm test  # npm run test 的简写
```

### 4. 包发布与分发

**发布流程：**
```bash
# 登录 npm
npm login

# 发布包
npm publish

# 更新版本并发布
npm version patch  # 1.0.0 → 1.0.1
npm publish
```

### 5. 安全审计

**漏洞检测：**
```bash
# 检查依赖中的安全漏洞
npm audit

# 自动修复漏洞
npm audit fix

# 强制修复（可能引入破坏性更新）
npm audit fix --force
```

## npm vs yarn vs pnpm 对比

### 历史背景

- **npm**（2010）：最早的 Node.js 包管理器
- **yarn**（2016）：Facebook 开发，解决 npm v3-v5 的性能和确定性问题
- **pnpm**（2017）：通过硬链接和符号链接节省磁盘空间

### 核心差异对比

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| **安装速度** | 中等 | 快（有缓存时） | 最快 |
| **磁盘使用** | 高（重复安装） | 高 | 低（内容寻址存储） |
| **依赖结构** | 扁平化 | 扁平化 | 严格（非扁平化） |
| **锁文件** | package-lock.json | yarn.lock | pnpm-lock.yaml |
| **工作区** | npm workspaces | yarn workspaces | pnpm workspaces |
| **幽灵依赖** | 存在 | 存在 | 不存在 |
| **生态兼容** | 最好 | 很好 | 良好 |

### 安装速度对比（相同项目）

```
初次安装（无缓存）:
pnpm: 12s
yarn: 15s
npm:  20s

有缓存时:
pnpm: 3s
yarn: 5s
npm:  8s
```

### 磁盘空间对比

```
同一个包安装在 10 个项目中:

npm:  10 * 包大小 (完全重复)
yarn: 10 * 包大小 (完全重复)
pnpm: 1 * 包大小 (硬链接共享)
```

### 幽灵依赖问题

**npm/yarn 存在幽灵依赖：**
```javascript
// 项目未声明依赖 lodash，但因为某个依赖使用了 lodash
// npm/yarn 扁平化后，可以直接使用
import _ from 'lodash';  // 可以工作，但不应该！
```

**pnpm 严格隔离：**
```javascript
// pnpm 使用符号链接，只能访问声明的依赖
import _ from 'lodash';  // 报错：Cannot find module 'lodash'
```

### 选型建议

**选择 npm：**
- 项目较小，不追求极致性能
- 需要最好的生态兼容性
- 团队对 npm 熟悉，不想切换

**选择 yarn：**
- 需要更好的性能和确定性
- 使用 yarn v2+ 的 PnP 模式
- 团队已习惯 yarn 工作流

**选择 pnpm：**
- Monorepo 项目
- 磁盘空间受限（CI/CD 环境）
- 需要严格的依赖隔离
- 追求最快的安装速度

### 迁移成本

```bash
# npm → yarn
yarn import  # 从 package-lock.json 生成 yarn.lock

# npm → pnpm
pnpm import  # 从 package-lock.json 生成 pnpm-lock.yaml

# 通常只需修改 CI/CD 配置
# package.json 无需修改
```

## 深入一点

### npm 的架构演变

**npm v2（嵌套安装）：**
```
node_modules/
├── A/
│   └── node_modules/
│       └── C@1.0.0/
└── B/
    └── node_modules/
        └── C@1.0.0/  # 重复安装
```

**npm v3+（扁平化安装）：**
```
node_modules/
├── A/
├── B/
└── C@1.0.0/  # 提升到顶层，共享
```

**带来的问题：**
- 幽灵依赖：未声明的依赖可以使用
- 不确定性：安装顺序影响目录结构
- 磁盘浪费：冲突版本仍会重复

### npm CLI 的工作流程

```
npm install 命令执行流程：

1. 读取 package.json
2. 读取 package-lock.json（如果存在）
3. 构建依赖树
4. 检查缓存（~/.npm/_cacache/）
5. 下载缺失的包
6. 解压到 node_modules
7. 执行安装钩子（preinstall, postinstall）
8. 更新 package-lock.json
```

### npm registry 的分发网络

```
npmjs.org (官方) 
    ↓
CDN (Cloudflare, Fastly)
    ↓
国内镜像 (淘宝、华为、腾讯)
    ↓
本地缓存 (~/.npm/)
    ↓
项目 node_modules
```

## 最佳实践

### 1. 始终提交 lock 文件

```bash
# .gitignore 不应包含
# ❌ package-lock.json
# ✅ 应该提交 lock 文件到版本控制
```

**原因：**
- 确保团队安装相同版本
- 防止依赖更新引入 bug
- 加快 CI/CD 安装速度

### 2. 定期更新 npm 版本

```bash
# 查看当前版本
npm -v

# 更新到最新版
npm install -g npm@latest

# 更新到特定版本
npm install -g npm@9
```

### 3. 使用国内镜像加速

```bash
# 临时使用
npm install --registry=https://registry.npmmirror.com

# 永久配置
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry
```

### 4. 区分全局安装和本地安装

```bash
# 全局安装：CLI 工具
npm install -g typescript

# 本地安装：项目依赖
npm install typescript --save-dev
```

### 5. 理解 npm 命令简写

```bash
npm install = npm i
npm install --save-dev = npm i -D
npm install --save = npm i -S (npm 5+ 默认行为)
npm test = npm t
npm run = npm r
```

## 常见误区

### 误区 1：npm 就是 Node.js

❌ **错误理解**：npm 是 Node.js 的一部分

✅ **正确理解**：npm 是独立项目，恰好随 Node.js 一起分发

### 误区 2：必须使用 npm

❌ **错误理解**：Node.js 项目必须用 npm

✅ **正确理解**：可以用 yarn、pnpm 或其他包管理器

### 误区 3：全局安装更方便

❌ **错误理解**：所有工具都全局安装

✅ **正确理解**：
- CLI 工具：全局安装（如 vue-cli、create-react-app）
- 项目依赖：本地安装（如 webpack、babel）

### 误区 4：lock 文件不重要

❌ **错误理解**：package-lock.json 可以删除或不提交

✅ **正确理解**：lock 文件保证安装一致性，必须提交

## 参考资料

- [npm 官方文档](https://docs.npmjs.com/)
- [package.json 字段说明](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [yarn vs npm vs pnpm 对比](https://dev.to/andreychernykh/yarn-npm-pnpm-which-one-to-choose-1hkd)
- [pnpm 官方文档](https://pnpm.io/)
- [npm CLI 命令参考](https://docs.npmjs.com/cli/v9/commands)

---

**下一章：**[package.json 完全指南](./content-2.md)
