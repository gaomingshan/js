# node_modules 目录结构与查找机制

## 概述

node_modules 是 npm 存放项目依赖的目录，理解其内部结构和模块查找机制，对于排查依赖问题、优化性能至关重要。npm 经历了从嵌套安装到扁平化安装的演变，每种方式都有其优缺点。

## node_modules 目录结构

### npm v2 时代：嵌套结构

**目录示例：**
```
node_modules/
├── A@1.0.0/
│   ├── package.json
│   ├── index.js
│   └── node_modules/
│       └── C@1.0.0/
│           ├── package.json
│           └── index.js
└── B@1.0.0/
    ├── package.json
    ├── index.js
    └── node_modules/
        └── C@1.0.0/  # 重复安装
            ├── package.json
            └── index.js
```

**特点：**
- 严格按照依赖树结构嵌套
- 每个包的依赖安装在自己的 node_modules 下
- 依赖关系清晰明确

**问题：**
1. **重复安装**：同一个包可能被安装多次
2. **路径过长**：Windows 系统 260 字符路径限制
3. **磁盘浪费**：大量重复文件
4. **安装缓慢**：需要解压多次

**实际案例：**
```bash
# 深度嵌套导致的路径
node_modules/A/node_modules/B/node_modules/C/node_modules/D/...
# Windows 报错：路径过长
```

### npm v3+ 时代：扁平化结构

**目录示例：**
```
node_modules/
├── A@1.0.0/
│   ├── package.json
│   └── index.js
├── B@1.0.0/
│   ├── package.json
│   └── index.js
└── C@1.0.0/  # 提升到顶层，A 和 B 共享
    ├── package.json
    └── index.js
```

**扁平化算法：**
1. 解析依赖树
2. 按广度优先遍历
3. 尽可能将依赖提升到顶层
4. 冲突版本保留嵌套

**版本冲突处理：**
```
项目依赖：
- A@1.0.0 → 依赖 C@1.0.0
- B@1.0.0 → 依赖 C@2.0.0

结果目录结构：
node_modules/
├── A@1.0.0/
├── B@1.0.0/
│   └── node_modules/
│       └── C@2.0.0/  # 版本冲突，保留嵌套
└── C@1.0.0/  # 先安装的版本提升
```

**提升规则：**
- 先遇到的版本提升到顶层
- 后续冲突版本嵌套在依赖包内
- 安装顺序影响最终结构（不确定性）

## Node.js 模块解析算法

### require() 查找流程

**示例代码：**
```javascript
// 在 /project/src/utils/helper.js 中
const lodash = require('lodash');
```

**查找顺序：**
```
1. /project/src/utils/node_modules/lodash
2. /project/src/node_modules/lodash
3. /project/node_modules/lodash
4. /node_modules/lodash
5. 报错：Cannot find module 'lodash'
```

**完整算法：**
```
NODE_MODULES_PATHS(START)
1. 从 START 目录开始
2. 拼接 /node_modules 并检查
3. 移动到父目录
4. 重复 2-3，直到文件系统根目录
5. 检查全局 node_modules
   - Unix: /usr/local/lib/node_modules
   - Windows: %APPDATA%\npm\node_modules
```

### 模块类型判断

**核心模块（Core Modules）：**
```javascript
require('fs');     // Node.js 内置模块，优先级最高
require('path');
require('http');
```

**文件模块（File Modules）：**
```javascript
require('./utils');           // 相对路径
require('/absolute/path');    // 绝对路径
require('../config/db');      // 父目录
```

**第三方模块（Package Modules）：**
```javascript
require('lodash');            // 从 node_modules 查找
require('express');
require('@babel/core');       // 作用域包
```

### 文件查找优先级

**require('lodash') 查找细节：**
```
1. 检查 node_modules/lodash 是否为文件
   - 是：加载该文件
   - 否：进入步骤 2

2. 检查 node_modules/lodash 是否为目录
   - 是：读取 package.json 的 main 字段
   - 否：进入步骤 3

3. 按顺序尝试加载：
   - node_modules/lodash/index.js
   - node_modules/lodash/index.json
   - node_modules/lodash/index.node

4. 都不存在则报错
```

**扩展名解析：**
```javascript
require('./module');

// 尝试顺序：
1. ./module.js
2. ./module.json
3. ./module.node
4. ./module/index.js
5. ./module/index.json
6. ./module/index.node
```

## 扁平化安装的副作用

### 1. 幽灵依赖（Phantom Dependencies）

**定义：**
项目可以访问未在 package.json 中声明的依赖。

**产生原因：**
```
项目 package.json：
{
  "dependencies": {
    "A": "1.0.0"
  }
}

A 的 package.json：
{
  "dependencies": {
    "B": "1.0.0"
  }
}

扁平化后：
node_modules/
├── A@1.0.0/
└── B@1.0.0/  # B 被提升到顶层
```

**问题代码：**
```javascript
// 项目代码中直接使用 B
import B from 'B';  // ⚠️ 可以工作，但不应该！

// package.json 中未声明 B
// 如果 A 移除对 B 的依赖，项目会崩溃
```

**风险：**
- 依赖关系不明确
- 升级依赖可能导致意外错误
- 难以排查问题根源

**解决方案：**
```bash
# 使用 pnpm（严格依赖隔离）
pnpm install

# 或手动检查
npx depcheck  # 检测未声明的依赖
```

### 2. 依赖分身（Doppelgangers）

**定义：**
同一个包的不同版本被多次安装。

**示例：**
```
依赖关系：
- A@1.0.0 → C@1.0.0
- B@1.0.0 → C@2.0.0
- D@1.0.0 → C@1.0.0

扁平化结果：
node_modules/
├── A@1.0.0/
├── B@1.0.0/
│   └── node_modules/
│       └── C@2.0.0/
├── C@1.0.0/  # A 和 D 共享
└── D@1.0.0/

问题：C 被安装了两次（1.0.0 和 2.0.0）
```

**影响：**
- 增加包体积
- 可能导致单例模式失效
- 内存占用增加

**检测：**
```bash
# 查看依赖树
npm ls lodash

# 输出示例
├─┬ A@1.0.0
│ └── lodash@4.17.20
└─┬ B@1.0.0
  └── lodash@4.17.21  # 两个版本
```

### 3. 安装顺序不确定性

**问题：**
扁平化结果取决于安装顺序，可能导致团队成员的 node_modules 结构不一致。

**示例：**
```json
{
  "dependencies": {
    "A": "^1.0.0",  // 依赖 C@1.0.0
    "B": "^1.0.0"   // 依赖 C@2.0.0
  }
}
```

**场景 1：先安装 A**
```
node_modules/
├── C@1.0.0/  # A 的依赖先提升
└── B/
    └── node_modules/
        └── C@2.0.0/
```

**场景 2：先安装 B**
```
node_modules/
├── C@2.0.0/  # B 的依赖先提升
└── A/
    └── node_modules/
        └── C@1.0.0/
```

**解决方案：**
- 使用 package-lock.json 锁定结构
- 团队统一使用 `npm ci` 安装

## 特殊目录和文件

### .bin 目录

**作用：**
存放依赖包提供的可执行文件。

**结构：**
```
node_modules/.bin/
├── webpack       # Unix 符号链接或脚本
├── webpack.cmd   # Windows 批处理文件
└── webpack.ps1   # Windows PowerShell 脚本
```

**工作原理：**
```bash
# 执行 npm run build
npm run build

# 实际执行
./node_modules/.bin/webpack build

# 原始文件位置
./node_modules/webpack/bin/webpack.js
```

**直接调用：**
```bash
# 使用 npx
npx webpack build

# 或直接调用
./node_modules/.bin/webpack build
```

### .package-lock.json

**作用：**
隐藏的锁文件，npm 内部使用。

**特点：**
- npm v7+ 引入
- 用于优化性能
- 普通用户无需关注

### .cache 目录

某些包会在 node_modules 下创建缓存目录：

```
node_modules/
└── .cache/
    ├── babel-loader/
    ├── terser-webpack-plugin/
    └── eslint/
```

**建议：**
添加到 .gitignore：
```gitignore
node_modules/.cache
```

## pnpm 的非扁平化方案

### 符号链接结构

**pnpm 目录：**
```
node_modules/
├── .pnpm/  # 真实文件存储
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash/  # 实际文件
│   └── express@4.18.0/
│       └── node_modules/
│           ├── express/
│           └── body-parser/  # express 的依赖
├── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash
└── express -> .pnpm/express@4.18.0/node_modules/express
```

**优势：**
1. **严格依赖隔离**：避免幽灵依赖
2. **磁盘高效**：硬链接共享文件
3. **确定性结构**：与安装顺序无关

**示例：**
```javascript
// 项目代码
import lodash from 'lodash';  // ✅ 声明了，可以用

import express from 'express';  // ✅ 声明了，可以用
import bodyParser from 'body-parser';  // ❌ 未声明，报错！
// 即使 express 依赖 body-parser，也无法直接访问
```

## 深入一点：模块缓存机制

### require.cache

**模块缓存：**
```javascript
// 第一次 require
const moduleA = require('./moduleA');  // 执行 moduleA.js

// 第二次 require
const moduleA2 = require('./moduleA');  // 从缓存读取，不重新执行

console.log(moduleA === moduleA2);  // true，同一个对象
```

**查看缓存：**
```javascript
console.log(require.cache);
// {
//   '/path/to/module.js': Module { exports: {...}, ... },
//   ...
// }
```

**清除缓存：**
```javascript
// 删除特定模块缓存
delete require.cache[require.resolve('./module')];

// 清空所有缓存
Object.keys(require.cache).forEach(key => {
  delete require.cache[key];
});
```

**使用场景：**
- 热更新（HMR）
- 测试中重新加载模块
- 配置文件动态刷新

### 单例模式陷阱

**问题代码：**
```javascript
// database.js（单例模式）
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    Database.instance = this;
    this.connection = createConnection();
  }
}

module.exports = new Database();
```

**依赖分身问题：**
```
node_modules/
├── packageA/
│   └── node_modules/
│       └── database@1.0.0/  # 实例 1
└── database@1.0.1/  # 实例 2

// packageA 中的代码
const db1 = require('database');  // 加载 1.0.0

// 项目代码
const db2 = require('database');  // 加载 1.0.1

// db1 !== db2，单例失效！
```

## 最佳实践

### 1. 显式声明所有依赖

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "body-parser": "^1.20.0"  // ✅ 即使 express 依赖它，也要显式声明
  }
}
```

### 2. 使用 npm ls 检查依赖树

```bash
# 查看完整依赖树
npm ls

# 查看特定包
npm ls lodash

# 查看依赖深度
npm ls --depth=0  # 只显示直接依赖
npm ls --depth=1  # 显示一级依赖
```

### 3. 定期清理 node_modules

```bash
# 删除并重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用 npm ci（推荐）
npm ci  # 基于 lock 文件全新安装
```

### 4. 检测未使用的依赖

```bash
# 安装 depcheck
npm install -g depcheck

# 检测
depcheck

# 输出示例
Unused dependencies
* lodash
* moment

Missing dependencies
* axios
```

### 5. 避免嵌套过深的依赖

**检查依赖深度：**
```bash
npm ls --depth=5
```

**优化建议：**
- 选择依赖较少的包
- 定期更新依赖
- 使用 pnpm 减少重复

## 常见问题排查

### 问题 1：找不到模块

```bash
Error: Cannot find module 'lodash'
```

**排查步骤：**
```bash
# 1. 检查 package.json
cat package.json | grep lodash

# 2. 检查 node_modules
ls node_modules | grep lodash

# 3. 重新安装
npm install lodash

# 4. 清理缓存重装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题 2：版本冲突

```bash
npm WARN peerDependencies react@^16.0.0 required by react-router@5.0.0
```

**解决：**
```bash
# 查看冲突详情
npm ls react

# 选项 1：升级到兼容版本
npm install react@^16.0.0

# 选项 2：使用 --legacy-peer-deps
npm install --legacy-peer-deps

# 选项 3：使用 overrides（npm 8.3+）
{
  "overrides": {
    "react": "^16.0.0"
  }
}
```

### 问题 3：幽灵依赖导致的错误

```bash
# 本地开发正常，CI/CD 失败
Error: Cannot find module 'some-package'
```

**排查：**
```bash
# 检测幽灵依赖
npx depcheck

# 添加缺失的依赖
npm install some-package
```

### 问题 4：node_modules 过大

```bash
# 分析 node_modules 大小
npx disk-usage node_modules

# 查找重复包
npx npm-check-updates -g

# 使用 pnpm 优化
pnpm install  # 自动去重
```

## 工程化建议

### 使用 .npmrc 配置

```ini
# 扁平化安装
legacy-peer-deps=false

# 严格引擎检查
engine-strict=true

# 镜像源
registry=https://registry.npmmirror.com
```

### Monorepo 依赖提升

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

**效果：**
```
node_modules/  # 共享依赖提升到根目录
├── react
├── lodash
└── ...

packages/
├── pkg-a/
│   └── node_modules/  # 仅包含特殊版本
└── pkg-b/
    └── node_modules/
```

## 参考资料

- [Node.js 模块解析算法](https://nodejs.org/api/modules.html#modules_all_together)
- [npm 扁平化安装](https://docs.npmjs.com/cli/v9/configuring-npm/install)
- [pnpm 非扁平化结构](https://pnpm.io/motivation)
- [幽灵依赖问题](https://rushjs.io/pages/advanced/phantom_deps/)

---

**上一章：**[package.json 完全指南](./content-2.md)  
**下一章：**[依赖类型与使用场景](./content-4.md)
