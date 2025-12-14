# 模块解析算法

## 概述

模块解析（Module Resolution）是模块系统的核心，决定了如何找到和加载模块文件。

理解模块解析的关键在于：

- **相对路径 vs 绝对路径 vs 裸导入**：不同的导入方式有不同的解析规则
- **Node.js 解析算法**：从当前目录向上查找 `node_modules`
- **package.json 字段**：`main`、`exports`、`module` 控制入口点

---

## 一、ESM 模块解析

### 1.1 相对路径

```js
// 相对导入
import { func } from './utils.js';      // 同目录
import { func } from '../utils.js';     // 父目录
import { func } from './lib/utils.js';  // 子目录

// ⚠️ 浏览器 ESM 必须包含文件扩展名
// import { func } from './utils';  // ❌ 浏览器中会报错

// Node.js ESM 可以省略 .js（需配置）
import { func } from './utils';  // ✓ Node.js 中可能工作
```

### 1.2 绝对路径

```js
// URL 导入（浏览器）
import { func } from 'https://cdn.example.com/module.js';
import { func } from '/static/utils.js';  // 相对于网站根目录

// 文件系统路径（Node.js）
import { func } from 'file:///path/to/module.js';
```

### 1.3 裸导入（Bare Import）

```js
// 包名导入
import React from 'react';
import { useState } from 'react';

// Node.js 解析流程：
// 1. 查找 node_modules/react
// 2. 读取 package.json
// 3. 找到 "main" 或 "exports" 字段
// 4. 加载对应文件
```

---

## 二、Node.js 解析算法

### 2.1 CommonJS 解析

```js
// require() 解析规则
const module = require('./module');

// 解析顺序：
// 1. ./module.js
// 2. ./module.json
// 3. ./module.node
// 4. ./module/package.json（"main" 字段）
// 5. ./module/index.js
// 6. ./module/index.json
// 7. ./module/index.node

// 查找 node_modules
const lodash = require('lodash');

// 查找路径（从当前目录向上）：
// ./node_modules/lodash
// ../node_modules/lodash
// ../../node_modules/lodash
// ...直到根目录
```

### 2.2 ESM 解析（Node.js）

```js
// package.json 配置
{
  "type": "module",  // 启用 ESM
  "main": "./index.js",
  "exports": {
    ".": "./index.js",
    "./utils": "./src/utils.js"
  }
}

// 导入
import pkg from 'my-package';           // 使用 exports["."]
import { func } from 'my-package/utils'; // 使用 exports["./utils"]
```

---

## 三、package.json 字段

### 3.1 main 字段

```js
// 旧式入口点
{
  "name": "my-package",
  "main": "./index.js"
}

// require('my-package') 加载 ./index.js
// import pkg from 'my-package' 也加载 ./index.js
```

### 3.2 exports 字段

```js
// 现代入口点（优先级高于 main）
{
  "exports": {
    ".": "./index.js",
    "./feature": "./src/feature.js",
    "./utils/*": "./src/utils/*.js"
  }
}

// 条件导出
{
  "exports": {
    ".": {
      "import": "./esm/index.js",    // ESM
      "require": "./cjs/index.js",   // CommonJS
      "browser": "./browser/index.js", // 浏览器
      "default": "./index.js"
    }
  }
}
```

### 3.3 module 字段

```js
// 指定 ESM 入口（非标准，工具支持）
{
  "main": "./cjs/index.js",    // CommonJS
  "module": "./esm/index.js"   // ESM
}

// 打包工具（Webpack、Rollup）优先使用 module
```

---

## 四、导入映射（Import Maps）

### 4.1 基本用法

```html
<!-- HTML 中定义导入映射 -->
<script type="importmap">
{
  "imports": {
    "react": "https://cdn.example.com/react@18.0.0/index.js",
    "lodash": "/node_modules/lodash-es/lodash.js",
    "app/": "/src/"
  }
}
</script>

<script type="module">
  // 裸导入现在可以工作
  import React from 'react';
  import _ from 'lodash';
  import { utils } from 'app/utils.js';
</script>
```

### 4.2 Scopes

```html
<script type="importmap">
{
  "imports": {
    "lodash": "/lib/lodash.js"
  },
  "scopes": {
    "/vendor/": {
      "lodash": "/vendor/lodash-custom.js"
    }
  }
}
</script>

<!-- /app.js 使用 /lib/lodash.js -->
<!-- /vendor/app.js 使用 /vendor/lodash-custom.js -->
```

---

## 五、循环依赖

### 5.1 ESM 循环依赖

```js
// a.js
import { b } from './b.js';
console.log('a:', b);
export const a = 'A';

// b.js
import { a } from './a.js';
console.log('b:', a);  // undefined（此时 a 还未初始化）
export const b = 'B';

// ESM 处理：
// 1. 解析模块图
// 2. 创建模块环境
// 3. 执行模块（按拓扑顺序）
// 4. 导入的绑定是活的（Live Binding）
```

### 5.2 CommonJS 循环依赖

```js
// a.js
const b = require('./b.js');
console.log('a:', b);
exports.a = 'A';

// b.js
const a = require('./a.js');
console.log('b:', a);  // { a: undefined }（部分导出）
exports.b = 'B';

// CommonJS 处理：
// 1. 缓存部分导出的对象
// 2. 继续执行模块
// 3. 可能得到未完全初始化的导出
```

---

## 六、最佳实践

1. **明确文件扩展名**：浏览器 ESM 必须包含 `.js`。
2. **使用 exports 字段**：提供更精确的导出控制。
3. **避免循环依赖**：重构代码或使用延迟导入。
4. **条件导出**：为不同环境提供不同版本。
5. **Import Maps**：简化浏览器中的裸导入。

---

## 参考资料

- [ECMAScript Modules](https://tc39.es/ecma262/#sec-modules)
- [Node.js Module Resolution](https://nodejs.org/api/esm.html#esm_resolution_algorithm)
- [Import Maps Specification](https://github.com/WICG/import-maps)
