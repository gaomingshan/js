# 幽灵依赖问题

## 幽灵依赖（Phantom Dependencies）的成因

### 什么是幽灵依赖？

**定义**：代码中使用了未在 package.json 中声明的依赖，但程序能正常运行。

**示例**：
```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

```javascript
// 你的代码
const express = require('express');
const bodyParser = require('body-parser');  // ← 幽灵依赖

// 能正常运行，因为 express 依赖了 body-parser
```

### 根本原因：扁平化安装

**npm v2（嵌套结构）**：
```
node_modules/
└── express/
    └── node_modules/
        └── body-parser/  # 无法访问
```
无法引用 `require('body-parser')`

**npm v3+（扁平化）**：
```
node_modules/
├── express/
└── body-parser/  # 提升到顶层，可以访问
```
可以引用 `require('body-parser')`，但这是副作用

---

## 扁平化安装的隐患

### 隐患 1：不可预测的可用性

**场景**：
```json
// 项目初始状态
{
  "dependencies": {
    "pkg-a": "1.0.0"  // 依赖 lodash@4.17.0
  }
}
```

```
node_modules/
├── pkg-a/
└── lodash@4.17.21  (提升)
```

```javascript
// 你的代码
const _ = require('lodash');  // 能用
```

**某天 pkg-a 升级**：
```json
{
  "dependencies": {
    "pkg-a": "2.0.0"  // 移除了对 lodash 的依赖
  }
}
```

```bash
npm install
# Error: Cannot find module 'lodash'
```

### 隐患 2：版本不确定性

**问题**：
```
项目 A 安装顺序：pkg-a → pkg-b → pkg-c
项目 B 安装顺序：pkg-c → pkg-b → pkg-a

可能导致不同的 node_modules 结构
```

**示例**：
```json
// pkg-a 和 pkg-b 都依赖 lodash，但版本范围不同
{
  "pkg-a": { "lodash": "^4.17.0" },
  "pkg-b": { "lodash": "^4.16.0" }
}
```

**可能结果 1**：
```
node_modules/
├── lodash@4.17.21  (pkg-a 先提升)
└── pkg-b/
    └── node_modules/
        └── lodash@4.16.6
```

**可能结果 2**：
```
node_modules/
├── lodash@4.16.6  (pkg-b 先提升)
└── pkg-a/
    └── node_modules/
        └── lodash@4.17.21
```

**你的代码**：
```javascript
const _ = require('lodash');
// 实际使用的版本取决于安装顺序
```

### 隐患 3：跨包版本冲突

**场景**：
```javascript
// 你的代码使用顶层的 React 18
import React from 'react';

// 某个老库使用嵌套的 React 17
// node_modules/old-lib/node_modules/react@17.0.0

// 导致两个 React 实例共存，Context/Hooks 失效
```

---

## 真实案例与排查方法

### 案例 1：线上构建失败

**背景**：
```
开发环境：正常运行 ✅
CI 环境：构建失败 ❌
```

**根因**：
```javascript
// 代码中使用了 moment
const moment = require('moment');
```

```json
// package.json（未声明 moment）
{
  "dependencies": {
    "date-fns": "^2.0.0",
    "some-plugin": "^1.0.0"  // 依赖 moment
  }
}
```

**本地环境**：
```
node_modules/
├── moment/  (some-plugin 提升的)
└── some-plugin/
```

**CI 环境**（不同安装顺序）：
```
node_modules/
└── some-plugin/
    └── node_modules/
        └── moment/  (未提升)

# require('moment') 失败
```

### 案例 2：Webpack 打包异常

**问题**：
```javascript
// 使用了未声明的 webpack-dev-server
const DevServer = require('webpack-dev-server');
```

**排查**：
```bash
# 检查依赖树
npm ls webpack-dev-server

# 发现是 webpack-cli 的依赖
webpack-dev-server@4.11.0
└── webpack-cli@5.0.0
    └── webpack-dev-server@4.11.0
```

**解决**：
```json
{
  "devDependencies": {
    "webpack-dev-server": "^4.11.0"  // 显式声明
  }
}
```

### 排查工具

**depcheck**：
```bash
npm install -g depcheck
depcheck

# 输出：
# Unused dependencies:
#   * express
# Missing dependencies:
#   * body-parser  ← 幽灵依赖
```

**npm ls（查看依赖树）**：
```bash
npm ls body-parser

body-parser@1.20.0
└── express@4.18.0
    └── body-parser@1.20.0

# 提示：不是直接依赖
```

**eslint-plugin-import**：
```javascript
// .eslintrc.js
module.exports = {
  plugins: ['import'],
  rules: {
    'import/no-extraneous-dependencies': 'error'
  }
};

// 会报错：'body-parser' should be listed in dependencies
```

---

## 解决方案：严格依赖声明

### 方案 1：显式声明所有依赖

**原则**：代码中 import/require 的所有包都必须在 package.json 中声明

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "body-parser": "^1.20.0"  // 显式声明
  }
}
```

**优点**：
- 依赖关系明确
- 版本可控

**缺点**：
- 可能与 express 的依赖版本冲突
- 维护成本增加

### 方案 2：使用 pnpm

**pnpm 的严格模式**：
```
node_modules/
├── .pnpm/
│   └── express@4.18.0/
│       └── node_modules/
│           ├── express/  (实际文件)
│           └── body-parser/  (仅 express 可访问)
└── express/  (符号链接 → .pnpm/express@4.18.0/node_modules/express)
```

**效果**：
```javascript
require('body-parser');
// Error: Cannot find module 'body-parser'
// 必须在 package.json 中声明才能使用
```

### 方案 3：Yarn PnP 模式

**完全移除 node_modules**：
```javascript
// .pnp.cjs
{
  "packageRegistryData": [
    ["express", [...]],
    ["body-parser", [...]]  // 只有 express 能访问
  ]
}
```

**加载逻辑**：
```javascript
require('body-parser');
// PnP 检查：body-parser 不在你的 package.json 中
// Error: Package 'body-parser' is not listed in dependencies
```

---

## 常见误区

### 误区 1：幽灵依赖没有危害

**错误观点**："反正能用就行"

**真实危害**：
```
1. 隐性耦合（依赖别人的依赖）
2. 升级风险（间接依赖变化导致代码崩溃）
3. 打包不确定性（CI 环境可能失败）
4. 版本锁定失效（无法精确控制版本）
```

### 误区 2：锁文件能解决幽灵依赖

**真相**：锁文件只保证安装一致性，不保证可访问性

**示例**：
```json
// package-lock.json 记录了 body-parser@1.20.0
{
  "body-parser": {
    "version": "1.20.0",
    "resolved": "..."
  }
}
```

**但如果安装顺序改变**：
```
body-parser 可能未被提升到顶层
→ require('body-parser') 仍然失败
```

### 误区 3：只在开发环境测试就够了

**危险**：
```bash
# 开发环境（node_modules 完整）
npm install
npm start  # ✅ 正常运行

# 生产环境（--production）
npm install --production
npm start  # ❌ 缺少 devDependencies 中的幽灵依赖
```

---

## 工程实践

### 场景 1：团队规范

**预提交检查**：
```json
// package.json
{
  "scripts": {
    "check-deps": "depcheck",
    "precommit": "npm run check-deps"
  },
  "devDependencies": {
    "depcheck": "^1.4.3",
    "husky": "^8.0.0"
  }
}
```

```bash
# .husky/pre-commit
npm run check-deps
```

**CI 验证**：
```yaml
# .github/workflows/ci.yml
- name: Check dependencies
  run: |
    npx depcheck
    if [ $? -ne 0 ]; then
      echo "Found phantom dependencies!"
      exit 1
    fi
```

### 场景 2：迁移到 pnpm

**步骤**：
```bash
# 1. 安装 pnpm
npm install -g pnpm

# 2. 删除现有依赖
rm -rf node_modules package-lock.json

# 3. 安装依赖（会暴露幽灵依赖）
pnpm install
# Error: Module not found: body-parser

# 4. 修复：显式声明
# package.json 添加缺失的依赖

# 5. 重新安装
pnpm install
```

### 场景 3：审计现有项目

**工具组合**：
```bash
# 1. 检测未声明依赖
npx depcheck

# 2. 检测未使用依赖
npx depcheck --unused

# 3. 检测版本不一致
npx npm-check

# 4. 生成依赖报告
npx license-checker --summary
```

---

## 深入一点

### Node.js 模块解析算法

**require('module') 的查找路径**：
```javascript
// 当前文件：/projects/app/src/index.js

require('body-parser')

查找顺序：
1. /projects/app/src/node_modules/body-parser
2. /projects/app/node_modules/body-parser  ← 找到！
3. /projects/node_modules/body-parser
4. /node_modules/body-parser
```

**扁平化导致的副作用**：
```
所有提升到顶层的包都在查找路径上
→ 即使未声明也能找到
```

### pnpm 的隔离机制

**符号链接结构**：
```
node_modules/
├── .pnpm/
│   └── express@4.18.0/
│       └── node_modules/
│           ├── express/  (真实文件)
│           └── body-parser@ -> ../../body-parser@1.20.0/...
└── express@ -> .pnpm/express@4.18.0/node_modules/express
```

**查找逻辑**：
```javascript
require('body-parser')

1. node_modules/body-parser  (不存在)
2. 失败 ❌

require('body-parser')  // 在 express 内部
1. .pnpm/express@4.18.0/node_modules/body-parser  (存在)
2. 成功 ✅
```

### Yarn PnP 的解析器

**自定义解析器**：
```javascript
// .pnp.cjs
module.exports = {
  resolveRequest(request, issuer) {
    // issuer: 调用者的路径
    // request: 请求的模块名
    
    const issuerPkg = findPackage(issuer);
    const allowedDeps = issuerPkg.dependencies;
    
    if (!allowedDeps.includes(request)) {
      throw new Error(`Package '${request}' is not listed in dependencies`);
    }
    
    return resolvePath(request);
  }
};
```

---

## 参考资料

- [Phantom Dependencies](https://rushjs.io/pages/advanced/phantom_deps/)
- [pnpm: 非扁平的 node_modules 目录](https://pnpm.io/zh/motivation#%E9%9D%9E%E6%89%81%E5%B9%B3%E7%9A%84-node_modules-%E7%9B%AE%E5%BD%95)
- [depcheck](https://github.com/depcheck/depcheck)
