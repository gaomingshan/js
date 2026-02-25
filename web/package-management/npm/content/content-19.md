# Monorepo 与 npm workspaces

## 概述

Monorepo 是在单个仓库中管理多个项目的策略。npm workspaces（npm 7+）提供了原生的 Monorepo 支持，简化了多包管理。

## npm workspaces 基础

### 配置

**根 package.json:**
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

**目录结构:**
```
my-monorepo/
├── package.json
├── node_modules/
├── package-lock.json
└── packages/
    ├── pkg-a/
    │   └── package.json
    └── pkg-b/
        └── package.json
```

### 依赖提升

```bash
# 根目录安装，所有包共享
npm install

# 依赖自动提升到根 node_modules
```

### workspace 命令

```bash
# 在所有 workspace 运行脚本
npm run build --workspaces

# 在特定 workspace 运行
npm run test --workspace=packages/pkg-a

# 为特定 workspace 安装依赖
npm install lodash --workspace=packages/pkg-b
```

## 内部依赖

### 声明依赖

**packages/pkg-b/package.json:**
```json
{
  "name": "@myorg/pkg-b",
  "dependencies": {
    "@myorg/pkg-a": "workspace:*"
  }
}
```

### 自动链接

```bash
npm install
# pkg-a 自动链接到 pkg-b 的 node_modules
```

## lerna 对比

### npm workspaces
- npm 原生支持
- 简单轻量
- 适合中小型 Monorepo

### lerna
- 更强大的功能
- 版本管理
- 发布工作流
- 适合大型 Monorepo

### 配合使用

```json
{
  "npmClient": "npm",
  "useWorkspaces": true
}
```

## 最佳实践

### 1. 统一依赖版本

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

### 2. 共享配置

```
monorepo/
├── tsconfig.base.json
├── .eslintrc.js
└── packages/
    ├── pkg-a/
    │   └── tsconfig.json  # extends ../tsconfig.base.json
    └── pkg-b/
        └── tsconfig.json
```

### 3. 并行构建

```json
{
  "scripts": {
    "build": "npm run build --workspaces --if-present"
  }
}
```

## 参考资料

- [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [lerna](https://lerna.js.org/)

---

**上一章：**[私有 npm 仓库方案](./content-18.md)  
**下一章：**[npm 性能优化实践](./content-20.md)
