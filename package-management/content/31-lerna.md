# Lerna 与 Monorepo 管理

## 概述

Lerna 是老牌的 Monorepo 管理工具，专注于版本管理和发布流程。虽然较重，但在某些场景仍然有用。

## 一、Lerna 简介

### 1.1 什么是 Lerna

**定位：** Monorepo 版本管理和发布工具

**核心功能：**
- 版本管理（Fixed/Independent）
- 发布工作流
- 依赖管理（已弃用，推荐使用包管理器）

### 1.2 安装

```bash
npm install -g lerna
# 或
npx lerna init
```

## 二、初始化项目

### 2.1 基础配置

```bash
# 初始化
lerna init

# 生成文件
my-monorepo/
├── lerna.json
├── package.json
└── packages/
```

**lerna.json：**
```json
{
  "version": "0.0.0",
  "packages": ["packages/*"],
  "npmClient": "pnpm",
  "useWorkspaces": true
}
```

**package.json：**
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["packages/*"],
  "devDependencies": {
    "lerna": "^7.0.0"
  }
}
```

## 三、版本策略

### 3.1 Fixed Mode（固定模式）

```json
// lerna.json
{
  "version": "1.0.0"
}
```

**特点：**
- 所有包使用相同版本号
- 一起发布
- 简单但可能浪费版本号

**适用：**
- 紧密耦合的包
- 统一发布节奏

### 3.2 Independent Mode（独立模式）

```json
// lerna.json
{
  "version": "independent"
}
```

**特点：**
- 每个包独立版本号
- 按需发布
- 灵活但管理复杂

**适用：**
- 松耦合的包
- 不同发布节奏

## 四、核心命令

### 4.1 lerna bootstrap（已弃用）

**推荐：** 使用包管理器的 workspace

```bash
# 不要用
lerna bootstrap

# 使用
pnpm install
```

### 4.2 lerna version

```bash
# 交互式选择版本
lerna version

# 指定版本类型
lerna version patch
lerna version minor
lerna version major

# 预发布版本
lerna version prerelease --preid beta
```

**流程：**
```
1. 检查改动
2. 选择版本号
3. 更新 package.json
4. 创建 git commit
5. 创建 git tag
6. 推送到远程
```

### 4.3 lerna publish

```bash
# 发布已打 tag 的版本
lerna publish from-git

# 发布本地更改
lerna publish from-package

# 发布 beta 版本
lerna publish --dist-tag beta
```

### 4.4 lerna run

```bash
# 在所有包中运行脚本
lerna run build

# 在特定包中运行
lerna run test --scope=@company/ui

# 并行运行
lerna run build --parallel
```

### 4.5 lerna exec

```bash
# 在所有包中执行命令
lerna exec -- rm -rf dist

# 在特定包中执行
lerna exec --scope=@company/ui -- npm test
```

## 五、配置详解

### 5.1 完整配置

```json
// lerna.json
{
  "version": "independent",
  "npmClient": "pnpm",
  "useWorkspaces": true,
  "packages": ["packages/*"],
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish %s",
      "ignoreChanges": ["*.md"]
    },
    "version": {
      "allowBranch": ["main", "master"],
      "message": "chore(release): version %s"
    }
  }
}
```

### 5.2 常用选项

```json
{
  "command": {
    "publish": {
      "conventionalCommits": true,  // 使用 Conventional Commits
      "message": "chore: publish",   // commit 消息
      "registry": "https://registry.npmjs.org"
    }
  }
}
```

## 六、实际工作流

### 6.1 开发流程

```bash
# 1. 创建分支
git checkout -b feature/new-component

# 2. 开发
cd packages/ui
# 修改代码

# 3. 测试
lerna run test

# 4. 提交
git commit -am "feat: add new component"

# 5. 推送
git push origin feature/new-component
```

### 6.2 发布流程

```bash
# 1. 确保在主分支
git checkout main
git pull

# 2. 更新版本
lerna version

# 3. 发布
lerna publish from-git

# 或一步到位
lerna publish
```

### 6.3 Conventional Commits

```bash
# 启用 Conventional Commits
{
  "command": {
    "version": {
      "conventionalCommits": true
    }
  }
}

# commit 格式
feat: add new feature      # minor
fix: fix bug               # patch
feat!: breaking change     # major
```

**自动生成 CHANGELOG：**
```bash
lerna version --conventional-commits
```

## 七、与包管理器集成

### 7.1 使用 pnpm（推荐）

```json
// lerna.json
{
  "npmClient": "pnpm",
  "useWorkspaces": true
}
```

```bash
# 安装依赖
pnpm install

# Lerna 只负责版本和发布
lerna version
lerna publish
```

### 7.2 使用 Yarn

```json
{
  "npmClient": "yarn",
  "useWorkspaces": true
}
```

## 八、替代方案

### 8.1 Changesets（推荐）

```bash
npm install @changesets/cli

# 初始化
npx changeset init
```

**优势：**
- 更现代
- 更灵活
- 更好的 PR 工作流

### 8.2 pnpm publish

```bash
# pnpm 原生支持发布
pnpm -r publish
```

### 8.3 nx release

```bash
# Nx 内置发布工具
nx release
```

## 九、最佳实践

### 9.1 推荐配置

```json
{
  "version": "independent",
  "npmClient": "pnpm",
  "useWorkspaces": true,
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish"
    }
  }
}
```

### 9.2 CI/CD 集成

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: lerna publish from-git --yes
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 9.3 何时使用 Lerna

**推荐：**
- 需要统一版本管理
- 需要自动化发布流程
- 已有 Lerna 项目

**不推荐：**
- 新项目（考虑 Changesets）
- 只需要 Workspaces（用包管理器）

## 参考资料

- [Lerna 官方文档](https://lerna.js.org/)
- [Changesets](https://github.com/changesets/changesets)

---

**导航**  
[上一章：Monorepo概念与实践](./30-monorepo-concept.md) | [返回目录](../README.md) | [下一章：私有npm registry](./32-private-registry.md)
