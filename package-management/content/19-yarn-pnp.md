# Yarn Plug'n'Play (PnP)

## 概述

Plug'n'Play (PnP) 是 Yarn Berry 的核心创新，彻底改变了依赖管理方式，不再使用 node_modules。

## 一、什么是 PnP

### 1.1 传统 node_modules 的问题

```
node_modules/
├── package-a/
├── package-b/
├── ...
└── package-n/  # 数万个文件
```

**问题：**
- 🐌 安装慢（需要解压大量文件）
- 💾 占用空间大
- 🔍 查找慢（遍历目录）
- 📦 幽灵依赖

### 1.2 PnP 方案

**不再生成 node_modules，而是生成 .pnp.cjs：**

```javascript
// .pnp.cjs
module.exports = {
  packageRegistryData: [
    ["lodash", [
      ["4.17.21", {
        packageLocation: "./.yarn/cache/lodash-npm-4.17.21.zip/node_modules/lodash/",
        packageDependencies: new Map([...])
      }]
    ]]
  ]
};
```

## 二、启用 PnP

### 2.1 新项目

```bash
# 使用 Yarn Berry
corepack enable
yarn init -2

# PnP 默认启用
```

### 2.2 现有项目

```bash
# 升级到 Berry
yarn set version stable

# 启用 PnP
yarn config set nodeLinker pnp

# 重新安装
rm -rf node_modules
yarn install
```

**生成文件：**
```
.yarn/
├── cache/
│   └── lodash-npm-4.17.21.zip
└── unplugged/
.pnp.cjs
.pnp.loader.mjs
```

## 三、零安装（Zero-Install）

### 3.1 原理

```bash
# 提交缓存到 git
git add .yarn/cache .pnp.cjs
git commit -m "Enable zero-install"

# 团队成员克隆后
git clone repo
yarn  # 几乎瞬间完成（无需下载）
```

**优势：**
- ⚡ 极速安装
- 🔒 完全确定性
- 📦 离线可用
- 🚀 CI/CD 加速

### 3.2 配置

```yaml
# .yarnrc.yml
enableGlobalCache: false  # 使用本地缓存
nodeLinker: pnp
```

**.gitignore：**
```
# 不忽略 .yarn/cache
!.yarn/cache
!.yarn/unplugged
!.yarn/releases
!.pnp.cjs
!.pnp.loader.mjs
```

## 四、IDE 支持

### 4.1 VS Code

```bash
# 安装 SDK
yarn dlx @yarnpkg/sdks vscode

# 生成 .vscode/settings.json
```

**配置：**
```json
{
  "typescript.tsdk": ".yarn/sdks/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### 4.2 其他编辑器

```bash
# WebStorm
yarn dlx @yarnpkg/sdks webstorm

# Vim/Neovim
yarn dlx @yarnpkg/sdks vim
```

## 五、兼容性

### 5.1 loose 模式

**严格模式问题：**
某些包可能不兼容 PnP

**解决：启用 loose 模式**
```yaml
# .yarnrc.yml
pnpMode: loose
```

**效果：**
- 允许访问未声明的依赖
- 更好的兼容性
- 牺牲部分严格性

### 5.2 回退到 node_modules

```yaml
# .yarnrc.yml
nodeLinker: node-modules
```

```bash
rm -rf .yarn .pnp.cjs
yarn install
```

## 六、性能对比

### 6.1 安装速度

```bash
# 冷安装（无缓存）
npm install:     45s
yarn classic:    28s
yarn pnp:        12s  ⚡⚡

# 热安装（有缓存）
npm install:     10s
yarn classic:    5s
yarn pnp:        0.3s ⚡⚡⚡
```

### 6.2 磁盘占用

```bash
# 10个项目，相同依赖
node_modules:  5.2 GB
yarn cache:    1.5 GB  # 压缩格式
```

## 七、实际应用

### 7.1 开发环境

```json
{
  "scripts": {
    "dev": "node --require ./.pnp.cjs server.js",
    "build": "yarn build"
  }
}
```

### 7.2 CI/CD

```yaml
# .github/workflows/ci.yml
- name: Checkout
  uses: actions/checkout@v3

- name: Setup Node
  uses: actions/setup-node@v3

- name: Enable Corepack
  run: corepack enable

- name: Install
  run: yarn install --immutable

# ✅ 零安装：直接使用 .yarn/cache
```

## 八、常见问题

### 8.1 无法找到模块

**问题：**
```javascript
Error: Cannot find module 'lodash'
```

**解决：**
```bash
# 确保依赖已声明
yarn add lodash

# 或使用 --require
node --require ./.pnp.cjs app.js
```

### 8.2 某些工具不兼容

**解决：使用 unplugged**

```yaml
# .yarnrc.yml
pnpUnpluggedFolder: .yarn/unplugged
```

```json
{
  "dependenciesMeta": {
    "problematic-package": {
      "unplugged": true
    }
  }
}
```

## 九、PnP vs node_modules

| 特性 | PnP | node_modules |
|------|-----|--------------|
| **安装速度** | ⚡⚡⚡ | ⭐⭐ |
| **磁盘占用** | 💾 小 | 💾💾 大 |
| **启动速度** | 🚀 快 | 🐌 慢 |
| **兼容性** | ⚠️ 一般 | ✅ 好 |
| **学习成本** | 高 | 低 |

## 参考资料

- [PnP 官方文档](https://yarnpkg.com/features/pnp)
- [零安装指南](https://yarnpkg.com/features/zero-installs)

---

**导航**  
[上一章：Yarn Workspaces](./18-yarn-workspaces.md) | [返回目录](../README.md) | [下一章：Yarn Berry高级特性](./20-yarn-berry.md)
