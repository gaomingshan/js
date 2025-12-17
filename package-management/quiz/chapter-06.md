# 第 6 章：package.json 详解 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 必需字段

### 题目

package.json 中哪些字段是必需的？

**选项：**
- A. name、version、main
- B. name、version
- C. name、version、description
- D. 所有字段都是可选的

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**package.json 必需字段**

只有两个字段是**必需**的：

```json
{
  "name": "my-package",
  "version": "1.0.0"
}
```

#### name 字段规则

```json
{
  "name": "lodash"  // ✅ 小写
}
```

**规则：**
- 必须小写
- 不能有空格
- 可以包含 `-` 和 `_`
- 最多 214 字符
- 不能以 `.` 或 `_` 开头

**作用域包：**
```json
{
  "name": "@mycompany/utils"  // ✅ 作用域包
}
```

#### version 字段

```json
{
  "version": "1.0.0"  // 必须符合 semver
}
```

**格式：** `MAJOR.MINOR.PATCH`

#### 其他常用但非必需字段

```json
{
  "description": "可选",
  "main": "可选（默认 index.js）",
  "scripts": "可选",
  "dependencies": "可选"
}
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** dependencies

### 题目

devDependencies 中的包在生产环境中永远不会被安装。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**devDependencies 的安装行为**

#### 默认安装（开发环境）

```bash
npm install
# 安装 dependencies + devDependencies
```

#### 生产环境安装

```bash
npm install --production
npm install --only=production
npm ci --production

# 只安装 dependencies，跳过 devDependencies
```

**但如果不加 `--production`，devDependencies 也会安装！**

#### 实际场景

**开发环境：**
```bash
# 本地开发
npm install
# ✅ 安装所有依赖
```

**Docker 生产环境：**
```dockerfile
# 生产镜像
RUN npm ci --production
# ✅ 只安装 dependencies
```

**错误的生产部署：**
```dockerfile
# ❌ 错误做法
RUN npm install
# 会安装 devDependencies，浪费空间
```

#### NODE_ENV 的影响

```bash
NODE_ENV=production npm install
# 仍会安装 devDependencies

# 必须显式指定
npm install --production
```

#### 正确分类

```json
{
  "dependencies": {
    "express": "^4.18.0"  // 运行时需要
  },
  "devDependencies": {
    "typescript": "^5.0.0",  // 只在开发时需要
    "jest": "^29.0.0"
  }
}
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** main字段

### 题目

package.json 中 `main` 字段的作用是什么？

**选项：**
- A. 指定项目的主页地址
- B. 指定包的入口文件
- C. 指定主要依赖
- D. 指定主要开发者

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**main 字段 - 包入口**

```json
{
  "name": "my-package",
  "main": "./dist/index.js"
}
```

**作用：** 当其他人 `require('my-package')` 时，加载的文件

#### 使用示例

**包的 package.json：**
```json
{
  "name": "calculator",
  "main": "./lib/index.js"
}
```

**用户代码：**
```javascript
const calc = require('calculator');
// 实际加载：node_modules/calculator/lib/index.js
```

#### 默认值

如果不指定 `main`，默认为：
```json
{
  "main": "index.js"  // 默认
}
```

#### 与 module 字段区别

```json
{
  "main": "./dist/index.cjs",      // CommonJS 入口
  "module": "./dist/index.esm.js"  // ESM 入口
}
```

**打包工具选择：**
- Webpack：优先 `module`，回退 `main`
- Rollup：使用 `module`

#### exports 字段（现代）

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",  // ESM
      "require": "./dist/index.cjs"     // CommonJS
    }
  }
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** scripts

### 题目

以下哪些是 npm scripts 的生命周期钩子？

**选项：**
- A. preinstall
- B. prepare
- C. postpublish
- D. prestart

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**npm 生命周期钩子**

#### install 生命周期

```json
{
  "scripts": {
    "preinstall": "echo 安装前",    // ✅ A
    "install": "node scripts/install.js",
    "postinstall": "echo 安装后"
  }
}
```

**顺序：** preinstall → install → postinstall

#### prepare 钩子（✅ B）

```json
{
  "scripts": {
    "prepare": "npm run build"
  }
}
```

**执行时机：**
- `npm install`（无参数）后
- `npm publish` 前
- `git clone` 后的本地 `npm install`

#### publish 生命周期

```json
{
  "scripts": {
    "prepublishOnly": "npm test",
    "prepare": "npm run build",
    "postpublish": "echo 发布成功"  // ✅ C
  }
}
```

**顺序：** prepublishOnly → prepare → publish → postpublish

#### 自定义脚本的 pre/post（✅ D）

```json
{
  "scripts": {
    "prestart": "echo 启动前",     // ✅ D
    "start": "node server.js",
    "poststart": "echo 启动后",
    
    "pretest": "echo 测试前",
    "test": "jest",
    "posttest": "echo 测试后"
  }
}
```

**规则：** 任何脚本都可以有 `pre*` 和 `post*` 钩子

#### 完整生命周期列表

**安装阶段：**
```
preinstall → install → postinstall → prepublish → prepare
```

**发布阶段：**
```
prepublishOnly → prepare → prepublish → publish → postpublish
```

**其他：**
- preversion / version / postversion
- pretest / test / posttest
- prestart / start / poststart
- 任何自定义脚本的 pre/post

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** exports字段

### 题目

以下 exports 配置的含义是什么？

```json
{
  "exports": {
    ".": "./index.js",
    "./utils": "./src/utils.js"
  }
}
```

**选项：**
- A. 只能导入 index.js
- B. 可以导入 index.js 和 utils.js
- C. 可以导入任意文件
- D. 配置错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**exports 字段 - 导出路径**

#### 配置解析

```json
{
  "name": "my-package",
  "exports": {
    ".": "./index.js",           // 主入口
    "./utils": "./src/utils.js"  // 子路径
  }
}
```

#### 允许的导入

```javascript
// ✅ 允许
import pkg from 'my-package';
// 加载 ./index.js

import utils from 'my-package/utils';
// 加载 ./src/utils.js

// ❌ 不允许（未导出）
import foo from 'my-package/src/foo.js';
// Error: Package subpath './src/foo.js' is not defined
```

#### 封装性

**未使用 exports：**
```javascript
// 可以访问任意文件
import internal from 'my-package/src/internal.js';  // ✅ 可以
```

**使用 exports：**
```javascript
// 只能访问导出的路径
import internal from 'my-package/src/internal.js';  // ❌ 报错
```

**优势：** 隐藏内部实现

#### 高级用法

**条件导出：**
```json
{
  "exports": {
    ".": {
      "import": "./index.esm.js",  // ESM
      "require": "./index.cjs"     // CommonJS
    },
    "./utils": {
      "import": "./utils.esm.js",
      "require": "./utils.cjs"
    }
  }
}
```

**通配符：**
```json
{
  "exports": {
    ".": "./index.js",
    "./features/*": "./src/features/*.js"
  }
}
```

```javascript
import feature from 'my-package/features/auth';
// 加载 ./src/features/auth.js
```

#### 与 main 的区别

```json
{
  "main": "./index.js",  // 旧方式
  "exports": {           // 新方式（优先）
    ".": "./index.js"
  }
}
```

**Node.js 12+ 优先使用 `exports`**

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** bin字段

### 题目

如何通过 package.json 提供全局命令？

**选项：**
- A. 使用 scripts 字段
- B. 使用 bin 字段
- C. 使用 main 字段
- D. 使用 exports 字段

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**bin 字段 - 可执行命令**

#### 单个命令

```json
{
  "name": "my-cli",
  "bin": "./bin/cli.js"
}
```

**安装后：**
```bash
npm install -g my-cli

# 可执行命令（命令名 = 包名）
my-cli --version
```

#### 自定义命令名

```json
{
  "name": "my-package",
  "bin": {
    "mycmd": "./bin/cli.js"
  }
}
```

**使用：**
```bash
npm install -g my-package

# 命令名为 mycmd
mycmd --help
```

#### 多个命令

```json
{
  "name": "my-tools",
  "bin": {
    "tool1": "./bin/tool1.js",
    "tool2": "./bin/tool2.js"
  }
}
```

#### 可执行文件头部

```javascript
#!/usr/bin/env node

console.log('Hello from CLI!');
```

**必需：** 文件开头的 shebang

**权限：**
```bash
chmod +x bin/cli.js
```

#### 本地使用

```bash
# 项目中安装
npm install my-cli

# 通过 npx 运行
npx my-cli

# 或在 scripts 中
{
  "scripts": {
    "cli": "my-cli"
  }
}
```

#### 链接到全局

```bash
# 开发中
cd my-cli
npm link

# 测试命令
my-cli --version

# 解除链接
npm unlink
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** files字段

### 题目

以下配置会将哪些文件包含在发布的 npm 包中？

```json
{
  "files": [
    "dist",
    "README.md"
  ]
}
```

**选项：**
- A. 只有 dist 目录和 README.md
- B. dist、README.md、package.json
- C. dist、README.md、package.json、LICENSE
- D. 所有文件

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**files 字段 - 发布白名单**

#### 自动包含的文件

**无论 `files` 如何配置，以下文件总是被包含：**

```
✅ package.json
✅ README.md / README
✅ LICENSE / LICENCE
✅ CHANGELOG.md
✅ main 字段指定的文件
```

#### 本题分析

```json
{
  "files": [
    "dist",        // 包含 dist 目录
    "README.md"    // 已自动包含，重复声明
  ]
}
```

**实际包含：**
- ✅ dist/（显式声明）
- ✅ README.md（自动包含）
- ✅ package.json（自动包含）
- ✅ LICENSE（如果存在，自动包含）

#### 示例配置

```json
{
  "files": [
    "dist",
    "lib",
    "bin",
    "types"
  ]
}
```

**包含：**
```
my-package/
├── dist/
├── lib/
├── bin/
├── types/
├── package.json  ← 自动
├── README.md     ← 自动
└── LICENSE       ← 自动
```

**排除：**
```
❌ src/
❌ tests/
❌ .git/
❌ node_modules/
```

#### 自动排除的文件

```
❌ node_modules/
❌ .git/
❌ .DS_Store
❌ .npmrc
❌ package-lock.json
```

#### .npmignore

```
# .npmignore（优先级高于 files）
tests/
*.test.js
.env
```

**发布前检查：**
```bash
npm pack --dry-run
# 显示将包含的文件
```

#### 最佳实践

```json
{
  "files": [
    "dist",
    "types",
    "!dist/**/*.test.js"  // 排除测试文件
  ]
}
```

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** peerDependencies

### 题目

为什么 React 组件库应该将 React 声明为 peerDependencies 而不是 dependencies？

**选项：**
- A. 节省安装时间
- B. 避免安装多个 React 版本
- C. React 是开发依赖
- D. npm 的强制要求

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**peerDependencies 的使用场景**

#### 问题场景

**错误做法（dependencies）：**

```json
// ui-library/package.json
{
  "dependencies": {
    "react": "^18.0.0"  // ❌ 错误
  }
}
```

**用户项目：**
```json
{
  "dependencies": {
    "react": "^18.2.0",      // 用户的 React
    "ui-library": "^1.0.0"   // 组件库的 React
  }
}
```

**结果：**
```
node_modules/
├── react@18.2.0           ← 用户的
├── ui-library/
│   └── node_modules/
│       └── react@18.0.0   ← 库的（重复！）
```

**问题：**
- ❌ 安装两个 React
- ❌ 占用双倍空间
- ❌ 可能导致 context 等功能失效
- ❌ 不同 React 实例无法共享状态

#### 正确做法（peerDependencies）

```json
// ui-library/package.json
{
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0"  // ✅ 正确
  }
}
```

**用户项目：**
```json
{
  "dependencies": {
    "react": "^18.2.0",      // 满足 peerDependencies
    "ui-library": "^1.0.0"
  }
}
```

**结果：**
```
node_modules/
├── react@18.2.0           ← 唯一的 React
└── ui-library/
```

**优势：**
- ✅ 只有一个 React
- ✅ 节省空间
- ✅ 功能正常

#### 其他需要 peerDependencies 的场景

**插件系统：**
```json
// webpack-plugin
{
  "peerDependencies": {
    "webpack": "^5.0.0"
  }
}

// eslint-plugin
{
  "peerDependencies": {
    "eslint": ">=7.0.0"
  }
}
```

**类型定义：**
```json
{
  "peerDependencies": {
    "typescript": ">=4.0.0"
  }
}
```

#### npm 7+ 自动安装

```bash
npm install ui-library

# npm 7+ 自动安装 peerDependencies
# npm install react@^16.8.0（如果未安装）
```

**npm 6 及以下：**
```bash
npm install ui-library
# WARN peerDependencies react@^16.8.0 required
# 需要手动安装
npm install react
```

#### 完整配置示例

```json
{
  "name": "my-ui-library",
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0"
  },
  "devDependencies": {
    "react": "^18.2.0",      // 开发时使用
    "react-dom": "^18.2.0"
  }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** engines字段

### 题目

如何强制用户使用特定版本的 Node.js？

**选项：**
- A. 在 README 中说明
- B. 使用 engines 字段
- C. 使用 engines 字段 + engine-strict=true
- D. 无法强制

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**engines 字段 + 严格模式**

#### 方案 B：只用 engines（不够）

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

**效果：**
```bash
# Node.js 16 环境
npm install
# ⚠️ 只是警告，仍会继续安装
```

**不会阻止安装！**

#### 方案 C：engines + engine-strict ✅

**package.json：**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

**.npmrc：**
```ini
engine-strict=true
```

**效果：**
```bash
# Node.js 16 环境
npm install

# ❌ 报错并停止
npm ERR! engine Unsupported engine
npm ERR! Required: {"node":">=18.0.0"}
npm ERR! Actual: {"node":"16.0.0","npm":"8.19.2"}
```

**成功阻止安装！**

#### 完整示例

**package.json：**
```json
{
  "name": "my-app",
  "engines": {
    "node": "18.16.0",  // 精确版本
    "npm": ">=9.0.0"
  },
  "scripts": {
    "preinstall": "node -e \"if (process.version !== 'v18.16.0') throw new Error('Node version must be 18.16.0')\""
  }
}
```

**.npmrc：**
```ini
engine-strict=true
```

**.nvmrc：**
```
18.16.0
```

#### 配合版本管理工具

**Volta：**
```json
{
  "volta": {
    "node": "18.16.0",
    "npm": "9.5.0"
  }
}
```

**自动切换版本，无需 engine-strict**

#### CI/CD 中的应用

```yaml
# .github/workflows/ci.yml
- uses: actions/setup-node@v3
  with:
    node-version-file: '.nvmrc'

- name: Check Node version
  run: |
    EXPECTED="v18.16.0"
    ACTUAL=$(node -v)
    if [ "$ACTUAL" != "$EXPECTED" ]; then
      echo "Node version mismatch: expected $EXPECTED, got $ACTUAL"
      exit 1
    fi
```

#### 范围语法

```json
{
  "engines": {
    "node": ">=16.0.0 <19.0.0",  // 16.x 或 18.x
    "npm": "^8.0.0 || ^9.0.0"    // 8.x 或 9.x
  }
}
```

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 完整配置

### 题目

为一个 TypeScript 库配置完整的 package.json，需要支持 ESM 和 CommonJS。

<details>
<summary>查看答案</summary>

### ✅ 答案

```json
{
  "name": "@mycompany/utils",
  "version": "1.0.0",
  "description": "Utility functions",
  "keywords": ["utils", "helpers"],
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/mycompany/utils.git"
  },
  "bugs": {
    "url": "https://github.com/mycompany/utils/issues"
  },
  "homepage": "https://github.com/mycompany/utils#readme",
  
  "type": "module",
  
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./package.json": "./package.json"
  },
  
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest",
    "lint": "eslint src",
    "prepublishOnly": "npm run test && npm run build"
  },
  
  "dependencies": {
    "lodash-es": "^4.17.21"
  },
  
  "devDependencies": {
    "@types/node": "^18.0.0",
    "eslint": "^8.0.0",
    "tsup": "^7.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  },
  
  "peerDependencies": {},
  
  "engines": {
    "node": ">=16.0.0"
  },
  
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  }
}
```

### 📖 解析

**关键配置说明**

#### 1. 双模块支持

```json
{
  "main": "./dist/index.cjs",    // CommonJS 入口
  "module": "./dist/index.js",   // ESM 入口
  "types": "./dist/index.d.ts"   // TypeScript 类型
}
```

#### 2. exports 字段

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",  // 类型优先
      "import": "./dist/index.js",   // ESM
      "require": "./dist/index.cjs"  // CommonJS
    }
  }
}
```

**导入行为：**
```javascript
// ESM
import { fn } from '@mycompany/utils';  // 使用 index.js

// CommonJS
const { fn } = require('@mycompany/utils');  // 使用 index.cjs
```

#### 3. 构建配置（tsup）

```bash
# 一条命令生成多种格式
tsup src/index.ts --format cjs,esm --dts

# 输出：
dist/
├── index.js      # ESM
├── index.cjs     # CommonJS
└── index.d.ts    # 类型定义
```

#### 4. 发布流程

```bash
# 1. 测试
npm test

# 2. 构建
npm run build

# 3. 发布（自动执行 prepublishOnly）
npm publish
```

#### 5. 文件包含

```json
{
  "files": ["dist"]  // 只包含构建产物
}
```

**排除源码，减小包体积**

#### 6. 作用域包

```json
{
  "name": "@mycompany/utils",  // 作用域包
  "publishConfig": {
    "access": "public"  // 公开发布
  }
}
```

</details>

---

**导航**  
[上一章：第 5 章面试题](./chapter-05.md) | [返回目录](../README.md) | [下一章：第 7 章面试题](./chapter-07.md)
