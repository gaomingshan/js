# package.json 详解

## 概述

`package.json` 是项目的元数据文件，描述项目信息、依赖关系、脚本命令等。理解每个字段的作用是包管理的基础。

## 一、基础字段

### 1.1 必需字段

```json
{
  "name": "my-package",
  "version": "1.0.0"
}
```

**name（包名）：**
- 小写字母、数字、`-`、`_`
- 不能以 `.` 或 `_` 开头
- 作用域包：`@scope/name`

```json
{
  "name": "lodash",           // 普通包
  "name": "@babel/core"       // 作用域包
}
```

**version（版本号）：**
- 遵循 Semver 规范：`MAJOR.MINOR.PATCH`

### 1.2 描述字段

```json
{
  "description": "A utility library",
  "keywords": ["util", "helper", "lodash"],
  "homepage": "https://lodash.com",
  "bugs": {
    "url": "https://github.com/lodash/lodash/issues",
    "email": "project@example.com"
  },
  "license": "MIT",
  "author": "John Doe <john@example.com> (https://johndoe.com)",
  "contributors": [
    "Jane Doe <jane@example.com>"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/lodash/lodash.git"
  }
}
```

## 二、依赖管理

### 2.1 dependencies（生产依赖）

运行时必需的依赖：

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.4.0",
    "lodash": "^4.17.21"
  }
}
```

### 2.2 devDependencies（开发依赖）

开发和构建时使用：

```json
{
  "devDependencies": {
    "vite": "^4.3.0",
    "typescript": "^5.0.0",
    "eslint": "^8.40.0",
    "@types/react": "^18.2.0"
  }
}
```

### 2.3 peerDependencies（同伴依赖）

插件/库要求宿主提供的依赖：

```json
// react-router 的 package.json
{
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": false
    }
  }
}
```

### 2.4 optionalDependencies（可选依赖）

安装失败不影响整体：

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2"  // macOS 特有
  }
}
```

### 2.5 bundleDependencies（打包依赖）

发布时打包在一起的依赖：

```json
{
  "bundleDependencies": [
    "render-core",
    "render-utils"
  ]
}
```

## 三、入口文件配置

### 3.1 main（CommonJS 入口）

```json
{
  "main": "./dist/index.js"
}
```

```javascript
// 使用
const lib = require('my-package');  // 加载 dist/index.js
```

### 3.2 module（ES Module 入口）

```json
{
  "module": "./dist/index.mjs"
}
```

### 3.3 exports（现代导出配置）⭐

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",     // ESM
      "require": "./dist/index.cjs"     // CommonJS
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    },
    "./package.json": "./package.json"
  }
}
```

**使用：**

```javascript
import lib from 'my-package';           // → dist/index.mjs
import { helper } from 'my-package/utils';  // → dist/utils.mjs
```

**条件导出：**

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",      // TypeScript
      "browser": "./dist/browser.js",    // 浏览器
      "node": "./dist/node.js",          // Node.js
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  }
}
```

### 3.4 types（TypeScript 类型）

```json
{
  "types": "./dist/index.d.ts",
  "typings": "./dist/index.d.ts"  // 别名
}
```

### 3.5 bin（可执行文件）

```json
{
  "bin": {
    "my-cli": "./bin/cli.js"
  }
}
```

安装后创建符号链接：
```
node_modules/.bin/my-cli -> node_modules/my-package/bin/cli.js
```

**单个命令简写：**

```json
{
  "name": "my-cli",
  "bin": "./bin/cli.js"
}
```

## 四、scripts 脚本

### 4.1 基本脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

**运行：**

```bash
npm run dev
npm run build
npm test      # npm run test 的简写
```

### 4.2 生命周期钩子

```json
{
  "scripts": {
    "preinstall": "node scripts/check-env.js",
    "install": "node-gyp rebuild",
    "postinstall": "patch-package",
    
    "prebuild": "npm run clean",
    "build": "tsc",
    "postbuild": "npm run copy-assets",
    
    "pretest": "npm run lint",
    "test": "vitest",
    "posttest": "npm run coverage"
  }
}
```

**执行顺序：**

```bash
npm run build
# → prebuild → build → postbuild
```

### 4.3 内置变量

```json
{
  "scripts": {
    "info": "echo $npm_package_name@$npm_package_version"
  }
}
```

**可用变量：**
- `$npm_package_name`
- `$npm_package_version`
- `$npm_config_registry`
- `$npm_lifecycle_event`

## 五、文件配置

### 5.1 files（发布文件）

```json
{
  "files": [
    "dist",
    "lib",
    "README.md"
  ]
}
```

**默认包含：**
- `package.json`
- `README.md`
- `LICENSE`

**始终排除：**
- `node_modules`
- `.git`

### 5.2 .npmignore（发布忽略）

```
# .npmignore
src/
tests/
*.test.js
.github/
```

**优先级：** `.npmignore` > `files` > `.gitignore`

## 六、引擎和平台限制

### 6.1 engines（环境要求）

```json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

**严格检查：**

```bash
npm config set engine-strict true
```

### 6.2 os 和 cpu 限制

```json
{
  "os": ["linux", "darwin", "!win32"],
  "cpu": ["x64", "arm64"]
}
```

## 七、私有包配置

### 7.1 private（防止误发布）

```json
{
  "private": true
}
```

尝试发布会报错：
```bash
npm publish
# Error: This package is marked as private.
```

### 7.2 publishConfig（发布配置）

```json
{
  "publishConfig": {
    "registry": "https://npm.mycompany.com",
    "access": "public"  // 或 "restricted"
  }
}
```

## 八、Workspaces（Monorepo）

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

**目录结构：**

```
my-monorepo/
├── package.json  (workspaces 配置)
├── packages/
│   ├── package-a/
│   │   └── package.json
│   └── package-b/
│       └── package.json
└── apps/
    └── app/
        └── package.json
```

## 九、其他重要字段

### 9.1 sideEffects（副作用）

**用于 Tree Shaking：**

```json
{
  "sideEffects": false
}
```

**标记有副作用的文件：**

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### 9.2 browserslist（浏览器兼容）

```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

### 9.3 config（自定义配置）

```json
{
  "config": {
    "port": 3000
  },
  "scripts": {
    "start": "server.js"
  }
}
```

**访问：** `process.env.npm_package_config_port`

## 十、完整示例

### 10.1 库项目示例

```json
{
  "name": "@mycompany/ui-components",
  "version": "1.2.3",
  "description": "React UI component library",
  "keywords": ["react", "ui", "components"],
  "license": "MIT",
  "author": "Company Name",
  "repository": {
    "type": "git",
    "url": "https://github.com/mycompany/ui-components.git"
  },
  
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  
  "files": [
    "dist",
    "README.md"
  ],
  
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint src",
    "prepublishOnly": "npm run build"
  },
  
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  
  "devDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.3.0"
  },
  
  "engines": {
    "node": ">=16.0.0"
  },
  
  "sideEffects": false
}
```

### 10.2 应用项目示例

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0"
  },
  
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.3.0",
    "vitest": "^0.31.0"
  },
  
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

## 参考资料

- [package.json 官方文档](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [Node.js package.json exports](https://nodejs.org/api/packages.html#exports)

---

**导航**  
[上一章：npm安装与配置](./05-npm-installation.md) | [返回目录](../README.md) | [下一章：npm常用命令](./07-npm-commands.md)
