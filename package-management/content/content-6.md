# package.json 深度解析

## 核心字段详解

### dependencies vs devDependencies

**dependencies**：生产环境依赖
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "express": "^4.18.0"
  }
}
```

**使用场景**：
- 库项目：其他项目依赖你时会安装
- 应用项目：运行时必需的依赖

**devDependencies**：开发环境依赖
```json
{
  "devDependencies": {
    "webpack": "^5.75.0",
    "eslint": "^8.30.0",
    "jest": "^29.3.0"
  }
}
```

**使用场景**：
- 构建工具（webpack, rollup）
- 测试框架（jest, mocha）
- 代码检查（eslint, prettier）

**安装差异**：
```bash
# 安装所有依赖
npm install

# 只安装 dependencies（生产环境）
npm install --production
```

### peerDependencies：插件依赖模型

**设计目的**：声明宿主依赖要求

**示例**：React 插件
```json
// react-router 的 package.json
{
  "name": "react-router",
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

**含义**：
- react-router 需要 React 环境
- 但不自己安装 React
- 由使用者提供 React

**npm 行为差异**：

**npm 3-6**：
```bash
npm install react-router
# 警告：UNMET PEER DEPENDENCY react@>=16.8.0
# 需要手动安装：npm install react
```

**npm 7+**：
```bash
npm install react-router
# 自动安装 react@latest（满足 >=16.8.0）
```

**peerDependenciesMeta**（npm 7+）：
```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react-dom": {
      "optional": true  // 可选的 peer dependency
    }
  }
}
```

---

## 特殊依赖字段

### optionalDependencies

**用途**：安装失败不影响整体

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2"  // macOS 文件监听，其他平台不需要
  }
}
```

**行为**：
```bash
npm install
# fsevents 安装失败（Linux）
# 不会导致整个 npm install 失败
```

**代码中的防御性检查**：
```javascript
let fsevents;
try {
  fsevents = require('fsevents');
} catch (e) {
  // 降级到 chokidar
  fsevents = null;
}
```

### bundledDependencies

**用途**：打包时包含指定依赖

```json
{
  "bundledDependencies": [
    "internal-module"
  ]
}
```

**效果**：
```bash
npm pack
# 生成的 .tgz 文件包含 internal-module
```

**使用场景**：
- 私有模块（无法从 registry 获取）
- 确保特定版本（不信任语义化版本）

---

## scripts 生命周期钩子

### 标准钩子

**安装相关**：
```json
{
  "scripts": {
    "preinstall": "echo 'Before install'",
    "install": "node-gyp rebuild",
    "postinstall": "echo 'After install'",
    "prepublish": "npm run build",
    "preprepare": "echo 'Before prepare'",
    "prepare": "husky install",
    "postprepare": "echo 'After prepare'"
  }
}
```

**执行顺序**：
```
npm install
├─ preinstall
├─ install
├─ postinstall
├─ prepublish (deprecated)
├─ preprepare
├─ prepare
└─ postprepare
```

**常用场景**：
```json
{
  "scripts": {
    "prepare": "husky install",     // Git hooks 设置
    "postinstall": "patch-package"  // 修补依赖包
  }
}
```

### 自定义钩子

**pre/post 自动前缀**：
```json
{
  "scripts": {
    "prebuild": "rm -rf dist",
    "build": "webpack",
    "postbuild": "echo 'Build complete'"
  }
}
```

**执行**：
```bash
npm run build
# 自动依次执行：prebuild → build → postbuild
```

---

## exports/imports 字段与条件导出

### exports 字段（Node.js 12.7+）

**基本用法**：
```json
{
  "exports": {
    ".": "./dist/index.js"
  }
}
```

**限制导入路径**：
```json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  }
}
```

```javascript
// ✅ 允许
import pkg from 'my-package';
import utils from 'my-package/utils';

// ❌ 禁止（未导出）
import internal from 'my-package/src/internal';
```

### 条件导出

**根据环境选择入口**：
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",    // ES Modules
      "require": "./dist/index.cjs.js",   // CommonJS
      "types": "./dist/index.d.ts"        // TypeScript
    }
  }
}
```

**多条件组合**：
```json
{
  "exports": {
    ".": {
      "node": {
        "import": "./dist/node.esm.js",
        "require": "./dist/node.cjs.js"
      },
      "browser": {
        "import": "./dist/browser.esm.js",
        "require": "./dist/browser.cjs.js"
      },
      "default": "./dist/index.js"
    }
  }
}
```

### imports 字段（内部映射）

**用途**：定义包内部的别名

```json
{
  "imports": {
    "#utils/*": "./src/utils/*.js",
    "#config": "./src/config/index.js"
  }
}
```

**使用**：
```javascript
// 包内部代码
import { debounce } from '#utils/debounce';
import config from '#config';
```

**优势**：
- 避免相对路径混乱
- 重构时修改成本低

---

## 常见误区

### 误区 1：dependencies 和 devDependencies 可以随意放置

**错误示例**（库项目）：
```json
{
  "dependencies": {
    "webpack": "^5.0.0"  // ❌ 构建工具不应在 dependencies
  }
}
```

**后果**：
- 使用你的库的项目会安装 webpack
- 增加不必要的依赖体积

**正确做法**：
```json
{
  "devDependencies": {
    "webpack": "^5.0.0"  // ✅ 构建工具放在 devDependencies
  }
}
```

### 误区 2：忽略 peerDependencies 警告

**警告信息**：
```
npm WARN react-router@6.4.0 requires a peer of react@>=16.8 but none is installed.
```

**忽略后果**：
- 运行时错误
- 版本冲突
- 功能异常

**正确处理**：
```bash
# 查看所有 peer dependencies
npm ls --depth=0

# 安装缺失的 peer dependencies
npm install react@18.2.0
```

### 误区 3：main/module/exports 字段混淆

**优先级**：
```
exports > module > main
```

**示例**：
```json
{
  "main": "./dist/index.cjs.js",      // CommonJS 入口
  "module": "./dist/index.esm.js",    // ES Module 入口
  "exports": {                         // 最优先
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js"
    }
  }
}
```

**Node.js 解析逻辑**：
```javascript
// 优先使用 exports
if (pkg.exports) {
  return resolveExports(pkg.exports, conditions);
}

// 其次使用 module（仅支持 ESM 的工具）
if (pkg.module && isESM) {
  return pkg.module;
}

// 最后使用 main
return pkg.main || 'index.js';
```

---

## 工程实践

### 场景 1：库项目的 package.json 最佳实践

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js"
    }
  },
  "files": [
    "dist"
  ],
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^18.2.0",
    "typescript": "^4.9.0",
    "rollup": "^3.0.0"
  }
}
```

### 场景 2：Monorepo 中的 package.json

**根目录**：
```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "lerna": "^6.0.0",
    "jest": "^29.0.0"
  }
}
```

**子包**：
```json
{
  "name": "@my-org/core",
  "version": "1.0.0",
  "dependencies": {
    "@my-org/utils": "workspace:*"  // 内部依赖
  }
}
```

### 场景 3：scripts 最佳实践

**任务分层**：
```json
{
  "scripts": {
    "dev": "webpack serve",
    "build": "webpack --mode production",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write src",
    "typecheck": "tsc --noEmit",
    "validate": "npm run lint && npm run typecheck && npm run test",
    "prepare": "husky install",
    "prepublishOnly": "npm run validate && npm run build"
  }
}
```

**并行执行**：
```json
{
  "scripts": {
    "check": "npm-run-all --parallel lint typecheck test"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
```

---

## 深入一点

### package.json 的完整字段列表

**核心字段**：
```json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "A package",
  "keywords": ["keyword1", "keyword2"],
  "homepage": "https://...",
  "bugs": "https://github.com/user/repo/issues",
  "license": "MIT",
  "author": "Your Name <email@example.com>",
  "contributors": ["..."],
  "funding": "https://...",
  "files": ["dist", "README.md"],
  "main": "./dist/index.js",
  "browser": "./dist/browser.js",
  "bin": {
    "my-cli": "./bin/cli.js"
  },
  "man": "./man/doc.1",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "os": ["!win32"],
  "cpu": ["x64", "arm64"]
}
```

### publishConfig

**发布时的配置覆盖**：
```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  }
}
```

### overrides（npm 8.3+）

**强制统一依赖版本**：
```json
{
  "overrides": {
    "lodash": "4.17.21",
    "axios": {
      ".": "^1.0.0",
      "follow-redirects": "^1.15.0"
    }
  }
}
```

---

## 参考资料

- [package.json 字段详解](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [Node.js Conditional Exports](https://nodejs.org/api/packages.html#conditional-exports)
- [npm scripts 生命周期](https://docs.npmjs.com/cli/v9/using-npm/scripts)
