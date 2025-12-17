# npm Workspaces

## 概述

npm Workspaces 是 npm 7+ 的内置 Monorepo 管理功能，允许在单个仓库中管理多个包。

## 一、基础配置

### 1.1 初始化 Workspace

**目录结构：**
```
my-monorepo/
├── package.json          # 根 package.json
├── packages/
│   ├── package-a/
│   │   └── package.json
│   └── package-b/
│       └── package.json
└── apps/
    └── my-app/
        └── package.json
```

**根 package.json：**
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

### 1.2 安装依赖

```bash
# 安装所有 workspace 的依赖
npm install

# 自动提升公共依赖到根目录
```

**结果：**
```
my-monorepo/
├── node_modules/         # 提升的公共依赖
│   ├── react/
│   └── lodash/
└── packages/
    └── package-a/
        └── node_modules/ # 仅包含特殊版本依赖
```

## 二、workspace 间依赖

### 2.1 声明依赖

```json
// packages/package-b/package.json
{
  "name": "package-b",
  "dependencies": {
    "package-a": "^1.0.0"  // 依赖同 workspace 的包
  }
}
```

### 2.2 自动链接

```bash
npm install
# 自动将 package-a 链接到 package-b
```

**等同于：**
```bash
cd packages/package-a && npm link
cd packages/package-b && npm link package-a
```

## 三、workspace 命令

### 3.1 安装依赖到特定 workspace

```bash
# 为 package-a 安装依赖
npm install lodash --workspace=package-a
npm install lodash -w package-a  # 简写
```

### 3.2 运行脚本

```bash
# 在特定 workspace 运行
npm run build --workspace=package-a

# 在所有 workspace 运行
npm run build --workspaces

# 并行运行（如果脚本支持）
npm run test --workspaces --if-present
```

### 3.3 列出 workspaces

```bash
npm ls --workspaces
```

## 四、依赖管理

### 4.1 依赖提升

**自动提升：**
```
根目录 node_modules/
├── react@18.2.0         # 提升（所有包都用这个版本）
└── lodash@4.17.21       # 提升

packages/package-a/node_modules/
└── axios@1.4.0          # 未提升（只有 package-a 使用）
```

### 4.2 安装根依赖

```bash
# 安装到根 package.json
npm install -D typescript -w root
```

### 4.3 查看依赖树

```bash
# 查看某个 workspace 的依赖
npm ls --workspace=package-a

# 查看所有 workspaces 的依赖
npm ls --workspaces
```

## 五、实际应用

### 5.1 共享配置

```
my-monorepo/
├── package.json
├── tsconfig.base.json    # 共享 TS 配置
├── .eslintrc.js          # 共享 ESLint 配置
└── packages/
    ├── package-a/
    │   └── tsconfig.json # 继承 base
    └── package-b/
        └── tsconfig.json
```

**tsconfig.json：**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

### 5.2 统一脚本

**根 package.json：**
```json
{
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "clean": "npm run clean --workspaces --if-present",
    "dev": "npm run dev --workspace=apps/my-app"
  }
}
```

### 5.3 版本管理

```bash
# 更新所有 workspace 版本
npm version minor --workspaces

# 更新特定 workspace
npm version patch --workspace=package-a
```

## 六、与其他工具对比

| 特性 | npm Workspaces | Yarn Workspaces | pnpm Workspaces |
|------|----------------|-----------------|-----------------|
| **安装** | 内置 | 内置 | 内置 |
| **链接** | 自动 | 自动 | 自动 |
| **提升** | ✅ | ✅ | 可配置 |
| **性能** | 中 | 中 | ⭐ 快 |
| **复杂度** | 低 | 低 | 低 |

## 七、常见问题

### 7.1 依赖版本冲突

**问题：** 不同 workspace 需要不同版本

**解决：** npm 自动处理，冲突版本不提升

```
node_modules/
├── lodash@4.17.21       # package-a 使用
└── packages/
    └── package-b/
        └── node_modules/
            └── lodash@4.17.20  # package-b 使用旧版本
```

### 7.2 清理和重装

```bash
# 删除所有 node_modules
rm -rf node_modules packages/*/node_modules apps/*/node_modules

# 重新安装
npm install
```

### 7.3 发布独立包

```bash
# 发布单个 workspace
cd packages/package-a
npm publish

# 或从根目录
npm publish --workspace=package-a
```

## 八、最佳实践

### 8.1 推荐目录结构

```
my-monorepo/
├── package.json
├── packages/          # 可复用的库
│   ├── ui/
│   ├── utils/
│   └── shared/
├── apps/              # 应用
│   ├── web/
│   └── admin/
└── tools/             # 内部工具
    └── scripts/
```

### 8.2 根 package.json 配置

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=apps/web",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces --if-present",
    "clean": "rimraf packages/*/dist apps/*/dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "rimraf": "^5.0.0"
  }
}
```

## 参考资料

- [npm Workspaces 文档](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [Monorepo 最佳实践](https://monorepo.tools/)

---

**导航**  
[上一章：npm安全](./14-npm-security.md) | [返回目录](../README.md) | [下一章：Yarn简介与特性](./16-yarn-intro.md)
