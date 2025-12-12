# 模块化与依赖管理

## 概述

模块化是现代JavaScript开发的基石。理解模块系统和依赖管理，是掌握包管理器的前提。

## 一、JavaScript 模块化演进

### 1.1 无模块化时代

```html
<!-- 全局变量污染 -->
<script src="utils.js"></script>
<script src="app.js"></script>

<script>
// utils.js
var name = 'Utils';
function helper() { }

// app.js
var name = 'App';  // 覆盖了 utils.js 的 name
</script>
```

**问题：**
- ❌ 全局作用域污染
- ❌ 命名冲突
- ❌ 依赖关系不明确
- ❌ 加载顺序问题

### 1.2 IIFE 模式（立即执行函数）

```javascript
// 创建独立作用域
var myModule = (function() {
  var privateVar = 'private';
  
  return {
    publicMethod: function() {
      return privateVar;
    }
  };
})();
```

### 1.3 CommonJS（Node.js）

**核心概念：**
- 同步加载
- 运行时加载
- 值拷贝

```javascript
// math.js - 导出
module.exports = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b
};

// 或单个导出
module.exports.subtract = (a, b) => a - b;

// app.js - 导入
const math = require('./math');
console.log(math.add(1, 2));  // 3

// 解构导入
const { add, multiply } = require('./math');
```

**特点：**
- ✅ 模块作用域隔离
- ✅ 显式依赖关系
- ⚠️ 同步加载（适合服务端）
- ⚠️ 不适合浏览器

### 1.4 ES Modules（ESM）

**核心概念：**
- 静态分析
- 编译时加载
- 引用绑定（Live Binding）

```javascript
// math.mjs - 导出
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;

// 默认导出
export default function subtract(a, b) {
  return a - b;
}

// app.mjs - 导入
import subtract, { add, multiply } from './math.mjs';

console.log(add(1, 2));       // 3
console.log(subtract(5, 3));  // 2
```

**特点：**
- ✅ 静态分析（Tree Shaking）
- ✅ 异步加载
- ✅ 浏览器原生支持
- ✅ 引用绑定

### 1.5 CommonJS vs ES Modules

| 特性 | CommonJS | ES Modules |
|------|----------|------------|
| **加载时机** | 运行时 | 编译时 |
| **加载方式** | 同步 | 异步 |
| **导出** | `module.exports` | `export` |
| **导入** | `require()` | `import` |
| **导入值** | 值拷贝 | 引用绑定 |
| **Tree Shaking** | ❌ 不支持 | ✅ 支持 |
| **循环依赖** | ⚠️ 可能问题 | ✅ 更好处理 |
| **浏览器** | ❌ 需打包 | ✅ 原生支持 |

**值拷贝 vs 引用绑定：**

```javascript
// CommonJS - 值拷贝
// counter.js
let count = 0;
module.exports = {
  count,
  increment: () => count++
};

// app.js
const counter = require('./counter');
console.log(counter.count);      // 0
counter.increment();
console.log(counter.count);      // 0（还是0！）

// -------------------

// ES Modules - 引用绑定
// counter.mjs
export let count = 0;
export function increment() {
  count++;
}

// app.mjs
import { count, increment } from './counter.mjs';
console.log(count);     // 0
increment();
console.log(count);     // 1（更新了！）
```

## 二、依赖树（Dependency Tree）

### 2.1 什么是依赖树

依赖树描述了包之间的依赖关系：

```
my-app
├── react@18.2.0
│   └── loose-envify@1.4.0
│       └── js-tokens@4.0.0
├── lodash@4.17.21
└── axios@1.4.0
    └── follow-redirects@1.15.2
```

### 2.2 依赖类型

**package.json 中的依赖类型：**

```json
{
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^4.3.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  }
}
```

**1. dependencies（生产依赖）**

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

**2. devDependencies（开发依赖）**

开发和构建时使用，不会打包到生产代码：

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

**3. peerDependencies（同伴依赖）**

要求宿主环境提供的依赖（插件开发常用）：

```json
// react-router 的 package.json
{
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

**含义：** react-router 需要 react，但不自己安装，要求使用者提供。

**4. optionalDependencies（可选依赖）**

可以失败的依赖，安装失败不会导致整体失败：

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2"  // macOS 文件监听，其他系统可以跳过
  }
}
```

### 2.3 直接依赖 vs 间接依赖

```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0"  // 直接依赖
  }
}
```

```
node_modules/
├── react/              # 直接依赖
│   └── package.json
└── loose-envify/       # 间接依赖（react 的依赖）
    └── package.json
```

## 三、语义化版本（Semver）

### 3.1 版本号格式

```
主版本号.次版本号.修订号
  MAJOR . MINOR . PATCH
```

**示例：** `1.2.3`

- **MAJOR（1）**：不兼容的 API 变更
- **MINOR（2）**：向后兼容的功能新增
- **PATCH（3）**：向后兼容的问题修复

### 3.2 版本范围语法

```json
{
  "dependencies": {
    "lodash": "4.17.21",      // 精确版本
    "react": "^18.2.0",       // 兼容版本（最常用）
    "axios": "~1.4.0",        // 近似版本
    "vue": ">=3.0.0 <4.0.0",  // 范围
    "webpack": "*",           // 任意版本（不推荐）
    "typescript": "latest"    // 最新版本
  }
}
```

**1. 精确版本（Exact）**

```json
"lodash": "4.17.21"
```
- 只安装 `4.17.21`

**2. 插入符号（Caret ^）⭐ 最常用**

```json
"react": "^18.2.0"
```
- 允许 **MINOR** 和 **PATCH** 更新
- 匹配：`18.2.0`、`18.3.0`、`18.99.99`
- 不匹配：`19.0.0`

**规则：**
```
^1.2.3  →  >=1.2.3 <2.0.0
^0.2.3  →  >=0.2.3 <0.3.0  (0.x 版本特殊处理)
^0.0.3  →  >=0.0.3 <0.0.4  (0.0.x 精确到 PATCH)
```

**3. 波浪号（Tilde ~）**

```json
"axios": "~1.4.0"
```
- 只允许 **PATCH** 更新
- 匹配：`1.4.0`、`1.4.1`、`1.4.99`
- 不匹配：`1.5.0`

**规则：**
```
~1.2.3  →  >=1.2.3 <1.3.0
~1.2    →  >=1.2.0 <1.3.0
~1      →  >=1.0.0 <2.0.0
```

**4. 范围（Range）**

```json
"vue": ">=3.0.0 <4.0.0"
```

**5. 通配符（x / * / X）**

```json
"express": "4.x"     // >=4.0.0 <5.0.0
"lodash": "4.17.*"   // >=4.17.0 <4.18.0
```

### 3.3 版本选择建议

**推荐：**
```json
{
  "dependencies": {
    "react": "^18.2.0"       // ✅ 允许小版本更新
  },
  "devDependencies": {
    "typescript": "~5.0.0"   // ✅ 开发工具更保守
  }
}
```

**不推荐：**
```json
{
  "dependencies": {
    "lodash": "*",           // ❌ 太宽泛，可能破坏性变更
    "react": ">=16.0.0"      // ❌ 跨度太大
  }
}
```

## 四、依赖解析算法

### 4.1 npm 的依赖解析

**步骤：**

1. **读取 package.json**
2. **解析版本范围**
3. **检查 lock 文件**（如果存在）
4. **查询 registry**
5. **构建依赖树**
6. **扁平化处理**

**示例：**

```json
// package.json
{
  "dependencies": {
    "A": "^1.0.0",
    "B": "^1.0.0"
  }
}

// A 的依赖
{
  "dependencies": {
    "C": "^1.0.0"
  }
}

// B 的依赖
{
  "dependencies": {
    "C": "^2.0.0"
  }
}
```

**解析结果（扁平化）：**

```
node_modules/
├── A@1.0.0/
├── B@1.0.0/
│   └── node_modules/
│       └── C@2.0.0/  # 版本冲突，保持嵌套
└── C@1.0.0/          # A 的 C 提升到顶层
```

### 4.2 依赖提升（Hoisting）

**提升规则：**
- 遇到的第一个版本提升到顶层
- 后续冲突版本保持嵌套

**不确定性问题：**

```bash
# 安装顺序不同，结果不同
npm install A B  # C@1.0.0 提升
npm install B A  # C@2.0.0 提升
```

**解决：** 使用 lock 文件锁定版本。

## 五、package.json 核心字段

### 5.1 基础字段

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "A sample package",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### 5.2 依赖字段（已讲解）

- `dependencies`
- `devDependencies`
- `peerDependencies`
- `optionalDependencies`

## 参考资料

- [CommonJS 规范](http://www.commonjs.org/)
- [ES Modules 规范](https://tc39.es/ecma262/#sec-modules)
- [Semver 语义化版本](https://semver.org/lang/zh-CN/)
- [npm package.json 文档](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

---

**导航**  
[上一章：包管理器简介](./01-pkg-manager-intro.md) | [返回目录](../README.md) | [下一章：包管理器工作原理](./03-working-principle.md)
