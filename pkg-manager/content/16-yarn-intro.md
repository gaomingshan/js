# Yarn 简介与特性

## 概述

Yarn 是 Facebook 等公司联合开发的包管理器，旨在解决 npm 的性能和安全问题。现在有 Yarn Classic（v1）和 Yarn Berry（v2+）两个版本。

## 一、Yarn 的诞生

### 1.1 为什么需要 Yarn

**2016 年 npm 的问题：**
- 🐌 安装速度慢
- ❌ 不确定性安装（无 lock 文件）
- 🔒 安全性问题
- 📦 离线安装不支持

**Yarn 的改进：**
- ⚡ 并行下载，速度快
- 🔒 yarn.lock 确定性安装
- 💾 离线缓存
- 🎯 更好的输出信息

### 1.2 Yarn Classic vs Yarn Berry

| 特性 | Yarn Classic (v1) | Yarn Berry (v2+) |
|------|-------------------|------------------|
| **发布时间** | 2016 | 2020 |
| **node_modules** | ✅ 使用 | 🚫 可选（PnP） |
| **兼容性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **性能** | ⚡⚡ | ⚡⚡⚡ |
| **创新** | 锁文件、缓存 | PnP、零安装 |
| **学习成本** | 低 | 中高 |

## 二、安装 Yarn

### 2.1 安装 Yarn Classic

```bash
# 使用 npm 安装
npm install -g yarn

# 验证
yarn --version
# 1.22.19
```

### 2.2 安装 Yarn Berry

```bash
# 安装 Yarn Classic 后升级
yarn set version stable

# 或直接启用
corepack enable
yarn set version stable
```

### 2.3 Corepack（推荐）

**Node.js 16+ 内置：**

```bash
# 启用 corepack
corepack enable

# 自动使用项目指定的 Yarn 版本
# package.json 中声明：
{
  "packageManager": "yarn@3.6.0"
}
```

## 三、Yarn Classic 核心特性

### 3.1 确定性安装

**yarn.lock 文件：**

```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#679591c564c3bffaae8454cf0b3df370c3d6911c"
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==
```

**特点：**
- 锁定精确版本
- 包含完整性哈希
- 团队成员安装一致

### 3.2 并行安装

```bash
yarn install

# 输出：
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...    ⚡ 并行下载
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
```

**性能提升：**
```
npm install:  45s
yarn install: 28s  ⚡ 快 40%
```

### 3.3 离线缓存

**缓存位置：**
```bash
~/.yarn/cache/
└── npm-lodash-4.17.21-6382451519-b0b0c7b24a.zip
```

**离线安装：**
```bash
# 第一次安装（联网）
yarn install

# 第二次安装（离线）
yarn install --offline
# ✅ 完全不需要网络
```

### 3.4 工作区（Workspaces）

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

**自动链接：**
```
my-monorepo/
├── package.json
└── packages/
    ├── package-a/
    └── package-b/  (依赖 package-a)
```

```bash
yarn install
# 自动链接 package-a → package-b
```

## 四、Yarn Berry 核心特性

### 4.1 Plug'n'Play (PnP)

**传统 node_modules：**
```
node_modules/
├── package-a/
├── package-b/
└── ...（数万个文件）
```

**PnP 模式：**
```
.yarn/
├── cache/
│   └── lodash-npm-4.17.21.zip
└── unplugged/
.pnp.cjs  # 依赖映射文件
```

**优势：**
- ⚡ 安装速度极快（无需解压）
- 💾 节省磁盘空间
- 🚀 启动速度快（无需遍历 node_modules）
- 🔒 严格的依赖管理

### 4.2 零安装（Zero-Install）

```bash
# 提交 .yarn/cache 到 git
git add .yarn/cache
git commit -m "Zero-install"

# 团队成员拉取代码后
git clone repo
yarn  # 几乎瞬间完成
```

**原理：**
- 缓存文件已在 git 仓库中
- 无需下载依赖
- 只需生成 .pnp.cjs

### 4.3 现代化特性

**Constraints（约束）：**
```javascript
// .yarn/constraints.pro
gen_enforced_field(WorkspaceCwd, 'license', 'MIT').
```

**Protocols（协议）：**
```json
{
  "dependencies": {
    "pkg": "patch:pkg@^1.0.0#./patches/pkg.patch",
    "local": "portal:../local-pkg"
  }
}
```

## 五、命令对比

### 5.1 基础命令

| 操作 | npm | Yarn Classic | Yarn Berry |
|------|-----|--------------|------------|
| **安装依赖** | `npm install` | `yarn` | `yarn` |
| **添加依赖** | `npm install pkg` | `yarn add pkg` | `yarn add pkg` |
| **移除依赖** | `npm uninstall pkg` | `yarn remove pkg` | `yarn remove pkg` |
| **全局安装** | `npm install -g` | `yarn global add` | ❌ 不推荐 |
| **运行脚本** | `npm run dev` | `yarn dev` | `yarn dev` |

### 5.2 特殊命令

```bash
# Yarn 独有
yarn why lodash              # 为什么安装了 lodash
yarn upgrade-interactive     # 交互式更新
yarn check                   # 验证完整性
yarn autoclean              # 清理无用文件
```

## 六、配置文件

### 6.1 .yarnrc.yml（Yarn Berry）

```yaml
# .yarnrc.yml
nodeLinker: pnp              # PnP 模式
yarnPath: .yarn/releases/yarn-3.6.0.cjs

# 镜像源
npmRegistryServer: "https://registry.npmmirror.com"

# 插件
plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-typescript.cjs
```

### 6.2 .yarnrc（Yarn Classic）

```
# .yarnrc
registry "https://registry.npmmirror.com"
sass_binary_site "https://npmmirror.com/mirrors/node-sass/"
```

## 七、迁移到 Yarn

### 7.1 从 npm 迁移

```bash
# 1. 安装 Yarn
npm install -g yarn

# 2. 导入 package-lock.json
yarn import

# 3. 删除 npm 文件
rm package-lock.json

# 4. 安装依赖
yarn install
```

### 7.2 从 Yarn Classic 迁移到 Berry

```bash
# 1. 升级到 Berry
yarn set version stable

# 2. 更新依赖
yarn install

# 3. 启用 PnP（可选）
yarn config set nodeLinker pnp

# 4. 重新安装
rm -rf node_modules
yarn install
```

## 八、何时选择 Yarn

### 8.1 推荐使用 Yarn Classic

- ✅ 需要更快的安装速度
- ✅ 需要离线安装
- ✅ Monorepo 项目
- ✅ 团队已熟悉 Yarn

### 8.2 推荐使用 Yarn Berry

- ✅ 追求极致性能
- ✅ 零安装需求
- ✅ 愿意适配 PnP
- ⚠️ 需要额外配置 IDE 和工具

### 8.3 继续使用 npm

- ✅ 小型项目
- ✅ 团队已习惯 npm
- ✅ 兼容性第一

## 参考资料

- [Yarn 官方文档](https://yarnpkg.com/)
- [Yarn Berry 文档](https://yarnpkg.com/getting-started)
- [PnP 原理](https://yarnpkg.com/features/pnp)

---

**导航**  
[上一章：npm Workspaces](./15-npm-workspaces.md) | [返回目录](../README.md) | [下一章：Yarn基础命令](./17-yarn-commands.md)
