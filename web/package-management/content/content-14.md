# workspace 模式

## npm workspaces 基本概念

### 什么是 Workspace？

**定义**：在单个代码仓库中管理多个相关的包（Monorepo）。

**典型结构**：
```
my-monorepo/
├── package.json          # 根 package.json
├── packages/
│   ├── core/
│   │   └── package.json
│   ├── utils/
│   │   └── package.json
│   └── app/
│       └── package.json
└── node_modules/         # 共享的依赖
```

**根 package.json 配置**：
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

### 核心优势

**1. 依赖共享**：
```
传统多仓库：
repo-a/node_modules/lodash  (50 MB)
repo-b/node_modules/lodash  (50 MB)
repo-c/node_modules/lodash  (50 MB)
总计：150 MB

Workspace：
my-monorepo/node_modules/lodash  (50 MB)
总计：50 MB
```

**2. 本地依赖链接**：
```json
// packages/app/package.json
{
  "dependencies": {
    "@my-org/core": "1.0.0"
  }
}
```

**自动链接**：
```
node_modules/@my-org/core → packages/core
无需 npm link
```

**3. 统一命令执行**：
```bash
# 在所有包中运行测试
npm run test --workspaces

# 在特定包中运行
npm run build --workspace=packages/core
```

---

## 多包项目的依赖管理

### 依赖类型

**1. 共享依赖**（提升到根目录）：
```json
// 根 package.json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  }
}
```

**效果**：
```
node_modules/
├── typescript/  (所有子包共享)
└── jest/
```

**2. 包特定依赖**：
```json
// packages/app/package.json
{
  "dependencies": {
    "react": "^18.0.0"  // 只有 app 需要
  }
}
```

**效果**：
```
node_modules/
└── react/  (提升到根目录)
```

**3. 内部依赖**：
```json
// packages/app/package.json
{
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}
```

**workspace: 协议**：
- npm/Yarn：引用本地包
- 发布时自动替换为实际版本号

### 依赖解析顺序

**查找路径**：
```javascript
// packages/app/src/index.js
require('lodash');

查找顺序：
1. packages/app/node_modules/lodash
2. node_modules/lodash  ← 找到（提升）
```

**内部包查找**：
```javascript
require('@my-org/core');

查找顺序：
1. packages/app/node_modules/@my-org/core
2. node_modules/@my-org/core
   → 符号链接到 packages/core
```

---

## 工作区间的依赖链接

### 自动链接机制

**配置**：
```json
// 根 package.json
{
  "workspaces": [
    "packages/*"
  ]
}
```

**执行**：
```bash
npm install
```

**结果**：
```
node_modules/
├── @my-org/
│   ├── core → ../../packages/core
│   └── utils → ../../packages/utils
└── lodash/
```

**验证**：
```bash
ls -la node_modules/@my-org/core
# lrwxr-xr-x ... core -> ../../packages/core
```

### 版本一致性

**问题**：不同包依赖不同版本
```json
// packages/app/package.json
{
  "dependencies": {
    "@my-org/core": "^1.0.0"
  }
}

// packages/core/package.json
{
  "version": "1.2.0"
}
```

**npm 行为**：
```bash
npm install
# 链接到本地 packages/core（1.2.0）
# 忽略 ^1.0.0 的约束
```

**发布时替换**：
```json
// 发布前
{
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}

// 发布后（自动替换）
{
  "dependencies": {
    "@my-org/core": "1.2.0"
  }
}
```

### 循环依赖检测

**场景**：
```
packages/a → packages/b
packages/b → packages/a
```

**npm 处理**：
```bash
npm install
# 创建符号链接，允许循环依赖（运行时处理）
```

**风险**：
```javascript
// packages/a/index.js
const b = require('@my-org/b');

// packages/b/index.js
const a = require('@my-org/a');  // 可能导致初始化问题
```

---

## workspace 命令详解

### 基本命令

**安装依赖**：
```bash
# 安装所有 workspace 的依赖
npm install

# 只安装根目录依赖
npm install --ignore-scripts

# 为特定 workspace 添加依赖
npm install lodash --workspace=packages/app
```

**运行脚本**：
```bash
# 在所有 workspace 运行
npm run build --workspaces

# 在特定 workspace 运行
npm run test --workspace=packages/core

# 在多个 workspace 运行
npm run lint --workspace=packages/core --workspace=packages/utils
```

**过滤执行**：
```bash
# 只在有 build 脚本的 workspace 运行
npm run build --workspaces --if-present

# 并行执行（实验性）
npm run test --workspaces --parallel
```

### 高级用法

**依赖管理**：
```bash
# 查看所有 workspace
npm ls --workspaces

# 查看特定包的依赖树
npm ls lodash --workspace=packages/app

# 更新所有 workspace 的依赖
npm update --workspaces
```

**发布**：
```bash
# 发布单个 workspace
npm publish --workspace=packages/core

# 发布所有 workspace（需要工具）
lerna publish
```

**清理**：
```bash
# 删除所有 node_modules
npm run clean --workspaces --if-present

# 重新安装
npm install
```

---

## 常见误区

### 误区 1：workspace 自动提升所有依赖

**真相**：只提升兼容的依赖

**示例**：
```json
// packages/app/package.json
{
  "dependencies": {
    "lodash": "^4.17.0"
  }
}

// packages/api/package.json
{
  "dependencies": {
    "lodash": "^3.10.0"  // 不兼容
  }
}
```

**结果**：
```
node_modules/
├── lodash@4.17.21  (提升)
└── packages/api/node_modules/
    └── lodash@3.10.1  (嵌套)
```

### 误区 2：workspace 协议在所有场景都有效

**仅 npm 7+/Yarn/pnpm 支持**：
```json
{
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}
```

**npm 6 及更早版本**：
```
Error: Invalid version: "workspace:*"
```

**兼容方案**：
```json
{
  "dependencies": {
    "@my-org/core": "file:../core"  // npm 6 支持
  }
}
```

### 误区 3：可以随意修改 workspace 包的版本

**危险操作**：
```bash
cd packages/core
npm version patch  # 1.0.0 → 1.0.1
```

**问题**：
- 其他 workspace 的依赖声明可能过时
- 发布时版本不一致

**正确做法**：
```bash
# 使用工具统一管理版本
lerna version patch

# 或手动同步所有引用
```

---

## 工程实践

### 场景 1：标准 Monorepo 结构

**目录结构**：
```
my-monorepo/
├── package.json
├── packages/
│   ├── core/
│   │   ├── src/
│   │   ├── test/
│   │   └── package.json
│   ├── utils/
│   │   ├── src/
│   │   ├── test/
│   │   └── package.json
│   └── app/
│       ├── src/
│       ├── public/
│       └── package.json
├── .gitignore
├── tsconfig.json
└── jest.config.js
```

**根 package.json**：
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces",
    "lint": "eslint packages/*/src",
    "clean": "rm -rf packages/*/dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```

### 场景 2：依赖版本统一

**问题**：多个包依赖同一个库的不同版本

**解决方案 1**：根目录统一声明
```json
// 根 package.json
{
  "dependencies": {
    "react": "18.2.0"
  }
}
```

**解决方案 2**：使用 resolutions/overrides
```json
{
  "overrides": {
    "react": "18.2.0"
  }
}
```

**验证**：
```bash
npm ls react
# 检查是否所有 workspace 使用同一版本
```

### 场景 3：增量构建

**脚本**：
```json
{
  "scripts": {
    "build:core": "npm run build --workspace=packages/core",
    "build:utils": "npm run build --workspace=packages/utils",
    "build:app": "npm run build:core && npm run build:utils && npm run build --workspace=packages/app"
  }
}
```

**使用工具**：
```bash
# Turborepo
npx turbo run build

# Nx
npx nx run-many --target=build --all
```

---

## 深入一点

### workspace 的实现原理

**符号链接创建**：
```javascript
// npm 简化实现
function setupWorkspaces(root, workspaces) {
  for (const ws of workspaces) {
    const pkgJson = readPackageJson(ws);
    const linkPath = path.join(root, 'node_modules', pkgJson.name);
    
    // 创建符号链接
    fs.symlinkSync(ws, linkPath, 'dir');
  }
}
```

**依赖提升算法**：
```javascript
function hoistDependencies(workspaces) {
  const allDeps = new Map();
  
  for (const ws of workspaces) {
    for (const [name, version] of Object.entries(ws.dependencies)) {
      if (!allDeps.has(name)) {
        allDeps.set(name, version);  // 提升
      } else if (allDeps.get(name) !== version) {
        // 版本冲突，保持嵌套
        ws.nested.set(name, version);
      }
    }
  }
}
```

### npm vs Yarn vs pnpm workspace 对比

| 特性 | npm | Yarn | pnpm |
|------|-----|------|------|
| 基本支持 | npm 7+ | ✅ | ✅ |
| workspace: 协议 | ✅ | ✅ | ✅ |
| 并行执行 | 实验性 | ✅ | ✅ |
| 依赖隔离 | ❌ | ❌ | ✅ |
| 过滤器语法 | 基础 | 高级 | 最强大 |

**pnpm 的优势**：
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - '!packages/legacy'  # 排除特定包
```

**过滤器**：
```bash
# 只构建受影响的包
pnpm run build --filter=...[@my-org/core]

# 构建依赖链
pnpm run build --filter=@my-org/app...
```

### workspace 的性能影响

**安装时间对比**：
```
单仓库（10 个包）：
npm install → 5 分钟

Monorepo（10 个包）：
npm install → 2 分钟（依赖共享）

pnpm workspace：
pnpm install → 30 秒（硬链接 + 并行）
```

**磁盘占用**：
```
单仓库：10 × 500 MB = 5 GB
npm workspace：1 GB（共享依赖）
pnpm workspace：500 MB（全局 store）
```

---

## 参考资料

- [npm workspaces 文档](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/)
- [pnpm workspace](https://pnpm.io/workspaces)
