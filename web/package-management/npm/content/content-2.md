# package.json 完全指南

## 概述

package.json 是 npm 项目的核心配置文件，它定义了项目的元数据、依赖关系、脚本命令等信息。理解 package.json 的各个字段及其用途，是掌握 npm 包管理的关键。

## 基本结构

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "项目描述",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "keywords": ["javascript", "npm"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}
}
```

## 必需字段

### name（包名）

包的唯一标识符，必须符合特定规则。

**命名规则：**
```json
{
  "name": "my-package"          // ✅ 正确
  "name": "@scope/my-package"   // ✅ 带作用域
  "name": "My-Package"          // ❌ 不能有大写
  "name": "my package"          // ❌ 不能有空格
  "name": "my_package"          // ✅ 可以用下划线
}
```

**作用域包（scoped package）：**
```json
{
  "name": "@company/project",  // 组织或个人作用域
  "name": "@username/package"  // 用户作用域
}
```

**限制：**
- 长度：1-214 个字符
- 不能以 `.` 或 `_` 开头
- 不能有大写字母
- URL 安全字符

### version（版本号）

遵循语义化版本规范（SemVer）。

**格式：**
```json
{
  "version": "1.2.3"  // 主版本.次版本.修订号
}
```

**SemVer 规则：**
- **主版本（Major）**：不兼容的 API 修改
- **次版本（Minor）**：向下兼容的功能新增
- **修订号（Patch）**：向下兼容的问题修正

**预发布版本：**
```json
{
  "version": "1.0.0-alpha.1",    // alpha 版本
  "version": "1.0.0-beta.2",     // beta 版本
  "version": "1.0.0-rc.1"        // 候选版本
}
```

## 入口字段

### main（主入口）

CommonJS 模块的默认入口文件。

```json
{
  "main": "dist/index.js"
}
```

**使用场景：**
```javascript
// 其他项目引用时
const myPackage = require('my-package');
// 实际加载 node_modules/my-package/dist/index.js
```

### module（ES Module 入口）

ES6 模块的入口文件（非官方标准，但广泛支持）。

```json
{
  "main": "dist/index.cjs",      // CommonJS 入口
  "module": "dist/index.esm.js"  // ES Module 入口
}
```

**打包工具优先级：**
```
Webpack/Rollup 等现代打包工具：
1. 优先使用 module 字段（支持 tree-shaking）
2. 降级使用 main 字段

Node.js require():
1. 使用 main 字段
```

### exports（导出映射）

Node.js 12+ 支持的官方导出定义，优先级最高。

**基础用法：**
```json
{
  "exports": "./dist/index.js"  // 简单导出
}
```

**条件导出：**
```json
{
  "exports": {
    "import": "./dist/index.esm.js",  // ES Module
    "require": "./dist/index.cjs"      // CommonJS
  }
}
```

**多入口导出：**
```json
{
  "exports": {
    ".": "./dist/index.js",           // 主入口
    "./utils": "./dist/utils.js",     // 子路径
    "./package.json": "./package.json" // 允许访问 package.json
  }
}
```

**使用示例：**
```javascript
import pkg from 'my-package';         // 使用 "."
import utils from 'my-package/utils'; // 使用 "./utils"
```

### browser（浏览器入口）

指定浏览器环境使用的入口文件。

```json
{
  "main": "index.js",      // Node.js 入口
  "browser": "browser.js"  // 浏览器入口
}
```

**模块替换：**
```json
{
  "browser": {
    "fs": false,                    // 禁用 fs 模块
    "./lib/server.js": "./lib/client.js"  // 替换为浏览器版本
  }
}
```

### types / typings（TypeScript 类型定义）

指定 TypeScript 类型定义文件。

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts"  // 或 "typings"
}
```

## 依赖字段

### dependencies（生产依赖）

项目运行时必需的依赖。

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "~1.4.0",
    "lodash": "4.17.21"
  }
}
```

**安装命令：**
```bash
npm install axios
# 自动添加到 dependencies
```

### devDependencies（开发依赖）

仅开发和构建时需要的依赖。

```json
{
  "devDependencies": {
    "webpack": "^5.88.0",
    "eslint": "^8.45.0",
    "jest": "^29.6.0"
  }
}
```

**安装命令：**
```bash
npm install -D webpack
# 添加到 devDependencies
```

**生产环境排除：**
```bash
npm install --production
# 或
npm ci --production
# 只安装 dependencies，跳过 devDependencies
```

### peerDependencies（同伴依赖）

声明宿主项目需要安装的依赖（插件模式）。

```json
{
  "name": "react-plugin",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

**使用场景：**
- React/Vue 组件库
- Webpack/Babel 插件
- 避免宿主项目安装多个版本

**npm 7+ 行为变化：**
```bash
# npm 6：只警告，不自动安装
npm WARN peerDependencies react@>=16.8.0 required

# npm 7+：自动安装 peer 依赖
npm install react-plugin
# 会同时安装 react 和 react-dom
```

### peerDependenciesMeta（同伴依赖元数据）

标记可选的 peer 依赖（npm 7+）。

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-native": ">=0.60.0"
  },
  "peerDependenciesMeta": {
    "react-native": {
      "optional": true  // 标记为可选
    }
  }
}
```

### optionalDependencies（可选依赖）

安装失败也不影响主流程的依赖。

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2"  // macOS 文件监听，其他平台忽略
  }
}
```

**代码中处理：**
```javascript
let fsevents;
try {
  fsevents = require('fsevents');
} catch (err) {
  // 可选依赖不存在，使用降级方案
}
```

### bundledDependencies（捆绑依赖）

发布时一起打包的依赖（数组形式）。

```json
{
  "bundledDependencies": [
    "private-module"
  ]
}
```

**使用场景：**
- 包含私有或未发布的模块
- 确保特定版本的依赖

## 脚本字段

### scripts（脚本命令）

定义可执行的脚本命令。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "jest",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

**执行：**
```bash
npm run dev
npm run build
npm test  # test 是预定义脚本，可省略 run
```

**生命周期钩子：**
```json
{
  "scripts": {
    "prebuild": "rm -rf dist",     // build 前执行
    "build": "webpack",
    "postbuild": "cp README.md dist",  // build 后执行
    
    "preinstall": "echo 'installing'",
    "postinstall": "node scripts/setup.js"
  }
}
```

### bin（可执行文件）

声明包提供的命令行工具。

```json
{
  "name": "my-cli",
  "bin": {
    "my-cli": "./bin/cli.js"
  }
}
```

**全局安装后：**
```bash
npm install -g my-cli
my-cli --help  # 可直接执行
```

**文件头部需要：**
```javascript
#!/usr/bin/env node
console.log('Hello from CLI!');
```

### files（发布文件）

指定发布到 npm 时包含的文件。

```json
{
  "files": [
    "dist",
    "lib",
    "README.md"
  ]
}
```

**默认包含（无需声明）：**
- package.json
- README / CHANGELOG / LICENSE
- main 字段指定的文件

**总是排除：**
- node_modules
- .git
- .DS_Store

**优先级：**
```
.npmignore > files 字段 > .gitignore
```

## 元数据字段

### description（描述）

项目的简短描述，显示在 npm 搜索结果中。

```json
{
  "description": "一个用于处理日期的轻量级 JavaScript 库"
}
```

### keywords（关键词）

帮助用户在 npm 网站搜索到包。

```json
{
  "keywords": [
    "date",
    "time",
    "format",
    "utility"
  ]
}
```

### author（作者）

包的作者信息。

```json
{
  "author": "Your Name <you@example.com> (https://yoursite.com)"
}
```

**对象形式：**
```json
{
  "author": {
    "name": "Your Name",
    "email": "you@example.com",
    "url": "https://yoursite.com"
  }
}
```

### contributors（贡献者）

多个贡献者信息（数组）。

```json
{
  "contributors": [
    "Alice <alice@example.com>",
    "Bob <bob@example.com>"
  ]
}
```

### license（许可证）

项目的开源许可证。

```json
{
  "license": "MIT"
}
```

**常见许可证：**
- `MIT`：最宽松
- `Apache-2.0`：专利保护
- `GPL-3.0`：开源传染性
- `ISC`：类似 MIT
- `UNLICENSED`：私有项目

### repository（代码仓库）

源代码仓库地址。

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  }
}
```

**简写：**
```json
{
  "repository": "github:username/repo"
}
```

### bugs（问题追踪）

提交 bug 的地址。

```json
{
  "bugs": {
    "url": "https://github.com/username/repo/issues",
    "email": "bugs@example.com"
  }
}
```

### homepage（主页）

项目主页或文档网站。

```json
{
  "homepage": "https://yourproject.com"
}
```

## 工程字段

### engines（引擎限制）

指定项目兼容的 Node.js 或 npm 版本。

```json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

**严格模式（需配合 .npmrc）：**
```ini
# .npmrc
engine-strict=true
```

```bash
# 版本不匹配时报错
npm install  # Error: The engine "node" is incompatible
```

### os（操作系统限制）

限制包可运行的操作系统。

```json
{
  "os": ["darwin", "linux"],  // 仅 macOS 和 Linux
  "os": ["!win32"]            // 排除 Windows
}
```

### cpu（CPU 架构限制）

限制包可运行的 CPU 架构。

```json
{
  "cpu": ["x64", "arm64"],
  "cpu": ["!ia32"]  // 排除 32 位
}
```

### private（私有标识）

防止意外发布到公共 registry。

```json
{
  "private": true  // npm publish 会报错
}
```

**使用场景：**
- 公司内部项目
- Monorepo 根项目
- 不打算发布的项目

## 工作区字段（Monorepo）

### workspaces（工作区）

npm 7+ 支持的 Monorepo 功能。

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

**目录结构：**
```
my-monorepo/
├── package.json
├── packages/
│   ├── pkg-a/
│   │   └── package.json
│   └── pkg-b/
│       └── package.json
└── apps/
    └── web/
        └── package.json
```

**特性：**
- 依赖提升到根 node_modules
- 符号链接本地包
- 统一安装依赖

## 其他重要字段

### publishConfig（发布配置）

发布时的特殊配置。

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",  // 私有仓库
    "access": "public"  // 作用域包默认私有，设为公开
  }
}
```

### config（配置参数）

在脚本中使用的配置变量。

```json
{
  "config": {
    "port": "8080"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

**访问：**
```javascript
// server.js
const port = process.env.npm_package_config_port;  // "8080"
```

### browserslist（浏览器兼容）

指定目标浏览器范围（Babel、PostCSS 等工具使用）。

```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

## 深入一点：字段优先级

### 模块入口优先级

不同工具的解析顺序：

**Webpack 5：**
```
1. exports（条件导出）
2. module
3. browser（如果 target 是 "web"）
4. main
```

**Node.js（require）：**
```
1. exports（require 条件）
2. main
```

**Node.js（import）：**
```
1. exports（import 条件）
2. module（非标准，部分支持）
3. main
```

**TypeScript：**
```
1. types / typings
2. exports（types 条件）
```

### 完整的条件导出示例

```json
{
  "name": "universal-package",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": {
        "node": "./dist/index.node.mjs",
        "default": "./dist/index.esm.js"
      },
      "require": {
        "node": "./dist/index.node.cjs",
        "default": "./dist/index.cjs"
      },
      "browser": "./dist/index.browser.js"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts"
}
```

## 最佳实践

### 1. 字段完整性检查

```json
{
  "name": "my-package",         // ✅ 必需
  "version": "1.0.0",           // ✅ 必需
  "description": "...",         // ✅ 推荐，利于搜索
  "keywords": [...],            // ✅ 推荐
  "license": "MIT",             // ✅ 推荐，明确许可
  "repository": {...},          // ✅ 推荐
  "author": "...",              // ✅ 推荐
  "main": "dist/index.js",      // ✅ 必需（库项目）
  "types": "dist/index.d.ts",   // ✅ 推荐（TS 项目）
  "files": ["dist"],            // ✅ 推荐，减小包体积
  "engines": {"node": ">=16"}   // ✅ 推荐，明确兼容性
}
```

### 2. 版本号管理

```bash
# 自动更新版本号
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0

# 预发布版本
npm version prerelease  # 1.0.0 → 1.0.1-0
npm version prepatch    # 1.0.0 → 1.0.1-0
npm version preminor    # 1.0.0 → 1.1.0-0
npm version premajor    # 1.0.0 → 2.0.0-0
```

### 3. 脚本命名规范

```json
{
  "scripts": {
    "dev": "...",           // 开发环境
    "build": "...",         // 构建
    "start": "...",         // 启动生产服务
    "test": "...",          // 测试
    "test:watch": "...",    // 监听测试
    "lint": "...",          // 代码检查
    "lint:fix": "...",      // 自动修复
    "format": "...",        // 格式化
    "clean": "...",         // 清理
    "release": "..."        // 发布
  }
}
```

### 4. 私有包配置

```json
{
  "name": "@company/internal-lib",
  "private": true,  // 防止意外发布
  "publishConfig": {
    "registry": "https://npm.company.com"
  }
}
```

### 5. 使用 files 而非 .npmignore

```json
{
  "files": [
    "dist",
    "lib",
    "*.md"
  ]
}
```

**优势：**
- 白名单更安全（默认排除所有）
- 避免意外包含敏感文件

## 常见错误

### 错误 1：忘记更新 version

```bash
npm publish
# Error: You cannot publish over the previously published version
```

**解决：**
```bash
npm version patch
npm publish
```

### 错误 2：main 文件路径错误

```json
{
  "main": "src/index.js"  // ❌ 源码路径
}
```

应该指向构建后的文件：
```json
{
  "main": "dist/index.js"  // ✅ 构建产物
}
```

### 错误 3：dependencies 和 devDependencies 混淆

```json
{
  "dependencies": {
    "webpack": "^5.0.0"  // ❌ 构建工具不应在这里
  }
}
```

应该：
```json
{
  "devDependencies": {
    "webpack": "^5.0.0"  // ✅ 开发依赖
  }
}
```

### 错误 4：peerDependencies 版本范围过严

```json
{
  "peerDependencies": {
    "react": "18.2.0"  // ❌ 过于严格
  }
}
```

应该：
```json
{
  "peerDependencies": {
    "react": ">=16.8.0"  // ✅ 合理范围
  }
}
```

## 参考资料

- [package.json 官方文档](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [Node.js Conditional Exports](https://nodejs.org/api/packages.html#conditional-exports)
- [SemVer 规范](https://semver.org/)
- [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)

---

**上一章：**[npm 是什么：包管理器的核心职责](./content-1.md)  
**下一章：**[node_modules 目录结构与查找机制](./content-3.md)
