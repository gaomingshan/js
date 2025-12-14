# 第 24 章：模块加载机制 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 模块系统

### 题目

ES6 模块和 CommonJS 模块的主要区别是什么？

**选项：**
- A. 语法不同
- B. 加载时机不同
- C. 导出值的特性不同
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**主要区别**

| 特性 | CommonJS | ES6 Module |
|------|----------|------------|
| 语法 | `require`/`module.exports` | `import`/`export` |
| 加载时机 | 运行时 | 编译时 |
| 导出值 | 值的拷贝 | 值的引用 |
| this | 指向模块 | undefined |
| 动态导入 | 支持 | 需要 `import()` |

**1. 语法差异**
```javascript
// CommonJS
const fs = require('fs');
module.exports = { fn };

// ES6 Module
import fs from 'fs';
export { fn };
```

**2. 加载时机**
```javascript
// CommonJS：运行时加载
if (condition) {
  const module = require('./module');  // ✅ 可以
}

// ES6 Module：编译时加载
if (condition) {
  import module from './module';  // ❌ 错误
}
// 必须使用动态导入
if (condition) {
  const module = await import('./module');  // ✅
}
```

**3. 导出值的特性**
```javascript
// CommonJS：值的拷贝
// module.js
let count = 0;
function increment() {
  count++;
}
module.exports = { count, increment };

// main.js
const { count, increment } = require('./module');
console.log(count);  // 0
increment();
console.log(count);  // 0（拷贝的值不会变）

// ES6 Module：值的引用
// module.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './module';
console.log(count);  // 0
increment();
console.log(count);  // 1（引用会更新）
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 模块解析

### 题目

Node.js 如何解析模块路径？

**选项：**
- A. 只查找当前目录
- B. 只查找 node_modules
- C. 按特定顺序查找多个位置
- D. 随机查找

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**模块解析顺序**

```
1. 核心模块（如 fs、path）
2. 相对路径（./、../）
3. 绝对路径（/）
4. node_modules（从当前目录向上查找）
```

**详细解析过程：**

```javascript
// require('module-name')

// 1. 核心模块
require('fs');  // 直接加载 Node.js 核心模块

// 2. 相对路径
require('./module');
// 查找顺序：
// - ./module.js
// - ./module.json
// - ./module.node
// - ./module/package.json (main 字段)
// - ./module/index.js

// 3. node_modules
require('lodash');
// 查找顺序：
// - /current/node_modules/lodash
// - /current/../node_modules/lodash
// - /../../node_modules/lodash
// - ... 直到根目录
```

**package.json 字段优先级：**
```json
{
  "exports": "./dist/index.js",  // 最高优先级（Node 12+）
  "main": "./lib/index.js",      // 传统入口
  "module": "./es/index.js",     // ES Module 入口
  "browser": "./browser.js"      // 浏览器环境
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 循环依赖

### 题目

ES6 模块可以处理循环依赖。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**ES6 模块的循环依赖处理**

```javascript
// a.js
import { b } from './b.js';
export const a = 'a';
console.log('a.js:', b);

// b.js
import { a } from './a.js';
export const b = 'b';
console.log('b.js:', a);

// main.js
import { a } from './a.js';
import { b } from './b.js';

// 输出：
// b.js: undefined（a 还未初始化）
// a.js: b
```

**原理：**
ES6 模块采用动态引用，在执行时才去取值，因此可以处理循环依赖。

**CommonJS 的循环依赖：**
```javascript
// a.js
const { b } = require('./b');
exports.a = 'a';
console.log('a.js:', b);

// b.js
const { a } = require('./a');
exports.b = 'b';
console.log('b.js:', a);

// main.js
require('./a');

// 输出：
// b.js: undefined（a 还未赋值）
// a.js: b
```

**最佳实践：避免循环依赖**
```javascript
// ❌ 避免
// moduleA → moduleB → moduleA

// ✅ 重构
// moduleA ↘
//          moduleC
// moduleB ↗
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 动态导入

### 题目

以下代码的执行顺序是什么？

```javascript
console.log('1');

import('./module.js').then(() => {
  console.log('2');
});

console.log('3');
```

**选项：**
- A. `1, 2, 3`
- B. `1, 3, 2`
- C. `2, 1, 3`
- D. `3, 2, 1`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**动态导入是异步的**

```javascript
console.log('1');  // 同步

import('./module.js').then(() => {
  console.log('2');  // 异步（微任务）
});

console.log('3');  // 同步

// 输出：1, 3, 2
```

**动态导入的特点：**

**1. 返回 Promise**
```javascript
import('./module.js')
  .then(module => {
    module.fn();
  })
  .catch(error => {
    console.error('加载失败:', error);
  });
```

**2. 支持变量**
```javascript
const moduleName = './module.js';
const module = await import(moduleName);
```

**3. 按需加载**
```javascript
button.addEventListener('click', async () => {
  const { heavyFunction } = await import('./heavy.js');
  heavyFunction();
});
```

**4. 条件加载**
```javascript
if (condition) {
  const module = await import('./moduleA.js');
} else {
  const module = await import('./moduleB.js');
}
```

**实际应用：路由懒加载**
```javascript
const routes = [
  {
    path: '/home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
];
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** Tree Shaking

### 题目

什么是 Tree Shaking？如何编写对 Tree Shaking 友好的代码？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Tree Shaking**

移除未使用的代码，减小打包体积。

**前提条件：**
1. 使用 ES6 模块
2. 生产模式构建
3. 没有副作用

**示例：**
```javascript
// utils.js
export function used() {
  return 'used';
}

export function unused() {
  return 'unused';
}

// main.js
import { used } from './utils';
console.log(used());

// 打包后只包含 used 函数
```

**编写友好的代码：**

**1. 使用具名导出**
```javascript
// ✅ 好
export function fn1() {}
export function fn2() {}

// ❌ 差
export default {
  fn1() {},
  fn2() {}
};
```

**2. 避免副作用**
```javascript
// ❌ 有副作用
export function fn() {
  console.log('side effect');  // 副作用
}

// ✅ 无副作用
export function fn() {
  return 'pure';
}
```

**3. 配置 sideEffects**
```json
{
  "sideEffects": false
}

// 或指定有副作用的文件
{
  "sideEffects": [
    "*.css",
    "./src/polyfills.js"
  ]
}
```

**4. 使用 /*#__PURE__*/ 注释**
```javascript
const obj = /*#__PURE__*/ createObject();
export { obj };
```

**实际效果：**
```javascript
// 源码
import { map, filter, reduce } from 'lodash-es';

const result = map([1, 2, 3], x => x * 2);

// Tree Shaking 后只包含 map 函数
// filter 和 reduce 被移除
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** 模块依赖图

### 题目

如何分析和优化模块依赖关系？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**模块依赖图分析**

**1. 使用工具分析**
```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer

# webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

**2. 手动分析依赖**
```javascript
// analyze-deps.js
const fs = require('fs');
const path = require('path');

function analyzeDependencies(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const imports = [];
  
  // 匹配 import 语句
  const importRegex = /import .* from ['"](.+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

function buildDependencyGraph(entry) {
  const graph = new Map();
  const visited = new Set();
  
  function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    
    const deps = analyzeDependencies(file);
    graph.set(file, deps);
    
    deps.forEach(dep => {
      const resolved = path.resolve(path.dirname(file), dep);
      visit(resolved + '.js');
    });
  }
  
  visit(entry);
  return graph;
}
```

**3. 优化策略**

**拆分大模块**
```javascript
// ❌ 大模块
export * from './moduleA';
export * from './moduleB';
export * from './moduleC';

// ✅ 按需导入
import { fnA } from './moduleA';
import { fnB } from './moduleB';
```

**代码分割**
```javascript
// 路由级分割
const Home = () => import('./views/Home.vue');
const About = () => import('./views/About.vue');

// 组件级分割
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

**提取公共依赖**
```javascript
// webpack.config.js
optimization: {
  splitChunks: {
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      },
      common: {
        minChunks: 2,
        priority: 5,
        reuseExistingChunk: true
      }
    }
  }
}
```

**循环依赖检测**
```javascript
function detectCircularDeps(graph) {
  const cycles = [];
  
  function visit(node, path = []) {
    if (path.includes(node)) {
      cycles.push([...path, node]);
      return;
    }
    
    const deps = graph.get(node) || [];
    deps.forEach(dep => {
      visit(dep, [...path, node]);
    });
  }
  
  graph.forEach((_, node) => visit(node));
  return cycles;
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 模块化最佳实践

### 题目

模块化开发的最佳实践包括？

**选项：**
- A. 单一职责原则
- B. 避免循环依赖
- C. 使用具名导出
- D. 合理的模块粒度

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**A. 单一职责原则**
```javascript
// ❌ 职责混乱
// utils.js
export function fetchData() {}
export function renderUI() {}
export function validateForm() {}

// ✅ 职责清晰
// api.js
export function fetchData() {}

// ui.js
export function renderUI() {}

// validation.js
export function validateForm() {}
```

**B. 避免循环依赖**
```javascript
// ❌ 循环依赖
// moduleA.js
import { b } from './moduleB';
export const a = 1;

// moduleB.js
import { a } from './moduleA';
export const b = 2;

// ✅ 重构
// shared.js
export const shared = {};

// moduleA.js
import { shared } from './shared';
export const a = 1;

// moduleB.js
import { shared } from './shared';
export const b = 2;
```

**C. 使用具名导出**
```javascript
// ✅ 具名导出（利于 Tree Shaking）
export function fn1() {}
export function fn2() {}

// 按需导入
import { fn1 } from './module';

// ❌ 默认导出
export default {
  fn1() {},
  fn2() {}
};

// 全量导入
import module from './module';
```

**D. 合理的模块粒度**
```javascript
// ❌ 粒度太大
// utils.js (1000+ 行)
export function fn1() {}
export function fn2() {}
// ... 100 个函数

// ✅ 粒度合理
// string-utils.js
export function capitalize() {}
export function trim() {}

// array-utils.js
export function unique() {}
export function flatten() {}

// number-utils.js
export function round() {}
export function random() {}
```

**其他最佳实践：**

**1. 模块命名规范**
```
utils/
  string.js
  array.js
  number.js
components/
  Button/
    index.js
    styles.css
    test.js
```

**2. 导出接口设计**
```javascript
// ✅ 清晰的导出
export { default as Button } from './Button';
export { default as Input } from './Input';

// ✅ 类型导出
export type { User, Post } from './types';
```

**3. 文档注释**
```javascript
/**
 * 获取用户信息
 * @param {string} id - 用户ID
 * @returns {Promise<User>} 用户对象
 */
export async function getUser(id) {
  // ...
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 模块加载器

### 题目

实现一个简单的模块加载器。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class ModuleLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }
  
  async load(url) {
    // 检查缓存
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    // 检查是否正在加载
    if (this.loading.has(url)) {
      return this.loading.get(url);
    }
    
    // 开始加载
    const promise = this._loadModule(url);
    this.loading.set(url, promise);
    
    try {
      const module = await promise;
      this.cache.set(url, module);
      return module;
    } finally {
      this.loading.delete(url);
    }
  }
  
  async _loadModule(url) {
    // 1. 获取模块代码
    const code = await this._fetch(url);
    
    // 2. 解析依赖
    const deps = this._parseDependencies(code);
    
    // 3. 递归加载依赖
    const loadedDeps = await Promise.all(
      deps.map(dep => this.load(this._resolve(url, dep)))
    );
    
    // 4. 创建模块对象
    const module = { exports: {} };
    
    // 5. 执行模块代码
    const require = (dep) => {
      const index = deps.indexOf(dep);
      return loadedDeps[index];
    };
    
    const moduleFunction = new Function(
      'module',
      'exports',
      'require',
      code
    );
    
    moduleFunction(module, module.exports, require);
    
    return module.exports;
  }
  
  async _fetch(url) {
    const response = await fetch(url);
    return response.text();
  }
  
  _parseDependencies(code) {
    const deps = [];
    const regex = /require\(['"](.+?)['"]\)/g;
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      deps.push(match[1]);
    }
    
    return deps;
  }
  
  _resolve(base, relative) {
    // 简化的路径解析
    const baseParts = base.split('/');
    baseParts.pop();
    
    const relativeParts = relative.split('/');
    
    relativeParts.forEach(part => {
      if (part === '..') {
        baseParts.pop();
      } else if (part !== '.') {
        baseParts.push(part);
      }
    });
    
    return baseParts.join('/');
  }
}

// 使用
const loader = new ModuleLoader();

loader.load('/modules/main.js')
  .then(module => {
    console.log('模块加载完成:', module);
  })
  .catch(error => {
    console.error('加载失败:', error);
  });
```

**完整版（支持 ES6 模块）：**

```javascript
class ESModuleLoader {
  constructor() {
    this.cache = new Map();
    this.moduleMap = new Map();
  }
  
  async import(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    // 1. 获取模块源码
    const source = await this._fetch(url);
    
    // 2. 解析模块
    const moduleRecord = this._parse(source, url);
    
    // 3. 加载依赖
    await this._instantiate(moduleRecord);
    
    // 4. 执行模块
    const moduleNamespace = await this._evaluate(moduleRecord);
    
    this.cache.set(url, moduleNamespace);
    return moduleNamespace;
  }
  
  _parse(source, url) {
    // 解析 import/export 语句
    const imports = [];
    const exports = [];
    
    // 简化的正则匹配
    const importRegex = /import .* from ['"](.+?)['"]/g;
    const exportRegex = /export (function|const|let|var) (\w+)/g;
    
    let match;
    while ((match = importRegex.exec(source)) !== null) {
      imports.push(match[1]);
    }
    
    while ((match = exportRegex.exec(source)) !== null) {
      exports.push(match[2]);
    }
    
    return {
      url,
      source,
      imports,
      exports,
      dependencies: new Map(),
      executed: false
    };
  }
  
  async _instantiate(moduleRecord) {
    // 递归加载所有依赖
    const promises = moduleRecord.imports.map(async (importUrl) => {
      const resolvedUrl = this._resolve(moduleRecord.url, importUrl);
      const depModule = await this.import(resolvedUrl);
      moduleRecord.dependencies.set(importUrl, depModule);
    });
    
    await Promise.all(promises);
  }
  
  async _evaluate(moduleRecord) {
    if (moduleRecord.executed) {
      return this.moduleMap.get(moduleRecord.url);
    }
    
    moduleRecord.executed = true;
    
    // 创建模块命名空间
    const moduleNamespace = {};
    
    // 创建导入函数
    const importFn = (specifier) => {
      return moduleRecord.dependencies.get(specifier);
    };
    
    // 执行模块代码
    const moduleFunction = new Function(
      'import',
      'export',
      moduleRecord.source
    );
    
    const exportObj = {};
    moduleFunction(importFn, exportObj);
    
    // 填充命名空间
    Object.assign(moduleNamespace, exportObj);
    
    this.moduleMap.set(moduleRecord.url, moduleNamespace);
    return moduleNamespace;
  }
  
  async _fetch(url) {
    const response = await fetch(url);
    return response.text();
  }
  
  _resolve(base, relative) {
    return new URL(relative, base).href;
  }
}

// 使用
const loader = new ESModuleLoader();

loader.import('/modules/app.js')
  .then(module => {
    module.main();
  });
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** 模块打包原理

### 题目

Webpack 是如何打包模块的？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Webpack 打包流程**

```
1. 入口（Entry）
   ↓
2. 依赖解析（Resolve）
   ↓
3. 加载（Load）
   ↓
4. 转换（Transform）
   ↓
5. 生成（Generate）
   ↓
6. 输出（Output）
```

**简化的打包实现：**

```javascript
class SimpleBundler {
  constructor(entry) {
    this.entry = entry;
    this.modules = [];
  }
  
  // 1. 构建模块图
  buildModuleGraph() {
    const entryModule = this.createModule(this.entry);
    const queue = [entryModule];
    
    for (const module of queue) {
      module.dependencies.forEach(dep => {
        const depModule = this.createModule(dep);
        queue.push(depModule);
      });
    }
    
    this.modules = queue;
  }
  
  // 2. 创建模块对象
  createModule(filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    
    // 解析 AST
    const ast = this.parse(content);
    
    // 提取依赖
    const dependencies = [];
    traverse(ast, {
      ImportDeclaration({ node }) {
        dependencies.push(node.source.value);
      }
    });
    
    // 转换代码
    const { code } = transformFromAst(ast);
    
    return {
      filename,
      dependencies,
      code
    };
  }
  
  // 3. 生成 bundle
  generate() {
    const modules = this.modules.map(module => 
      `'${module.filename}': function(require, module, exports) {
        ${module.code}
      }`
    ).join(',\n');
    
    return `
      (function(modules) {
        const installedModules = {};
        
        function require(filename) {
          if (installedModules[filename]) {
            return installedModules[filename].exports;
          }
          
          const module = installedModules[filename] = {
            exports: {}
          };
          
          modules[filename](require, module, module.exports);
          
          return module.exports;
        }
        
        require('${this.entry}');
      })({
        ${modules}
      });
    `;
  }
  
  // 4. 输出文件
  output(filename) {
    const bundle = this.generate();
    fs.writeFileSync(filename, bundle);
  }
}

// 使用
const bundler = new SimpleBundler('./src/index.js');
bundler.buildModuleGraph();
bundler.output('./dist/bundle.js');
```

**打包后的代码结构：**

```javascript
// bundle.js
(function(modules) {
  // 模块缓存
  const installedModules = {};
  
  // require 函数
  function __webpack_require__(moduleId) {
    // 检查缓存
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    
    // 创建模块
    const module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    
    // 执行模块函数
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    
    // 标记为已加载
    module.l = true;
    
    return module.exports;
  }
  
  // 加载入口模块
  return __webpack_require__('./src/index.js');
})({
  './src/index.js': function(module, exports, __webpack_require__) {
    const utils = __webpack_require__('./src/utils.js');
    console.log(utils.add(1, 2));
  },
  './src/utils.js': function(module, exports) {
    exports.add = function(a, b) {
      return a + b;
    };
  }
});
```

**代码分割实现：**

```javascript
// 动态导入
__webpack_require__.e = function(chunkId) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `/chunks/${chunkId}.js`;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// chunk 加载
window.webpackJsonp = function(chunkId, modules) {
  for (const moduleId in modules) {
    __webpack_modules__[moduleId] = modules[moduleId];
  }
  resolveChunk(chunkId);
};
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 模块化总结

### 题目

总结 JavaScript 模块化的演进和最佳实践。

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**模块化演进**

**1. 无模块化（早期）**
```html
<script src="lib1.js"></script>
<script src="lib2.js"></script>
<script src="app.js"></script>
<!-- 全局变量污染、依赖管理困难 -->
```

**2. IIFE（立即执行函数）**
```javascript
const module = (function() {
  const private = 'private';
  
  return {
    public: 'public'
  };
})();
```

**3. CommonJS（Node.js）**
```javascript
// module.js
module.exports = { fn };

// main.js
const module = require('./module');
```

**4. AMD（异步模块定义）**
```javascript
define(['dependency'], function(dep) {
  return {
    fn() {}
  };
});
```

**5. UMD（通用模块定义）**
```javascript
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['dep'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('dep'));
  } else {
    root.module = factory(root.dep);
  }
})(this, function(dep) {
  return { fn() {} };
});
```

**6. ES6 Module（现代）**
```javascript
import { fn } from './module.js';
export { fn };
```

**最佳实践总结：**

**1. 模块设计原则**
- 单一职责
- 高内聚低耦合
- 接口最小化
- 避免循环依赖

**2. 导出策略**
```javascript
// ✅ 具名导出
export function fn1() {}
export function fn2() {}

// ✅ 按需导入
import { fn1 } from './module';

// ✅ 重导出
export { fn1, fn2 } from './utils';
```

**3. 文件组织**
```
src/
  components/
    Button/
      index.js
      styles.css
      test.js
  utils/
    string.js
    array.js
  services/
    api.js
  index.js
```

**4. 性能优化**
```javascript
// 代码分割
const Heavy = React.lazy(() => import('./Heavy'));

// 预加载
const link = document.createElement('link');
link.rel = 'modulepreload';
link.href = '/module.js';

// Tree Shaking
// 使用 ES6 模块 + 具名导出
```

**5. 工具配置**
```javascript
// package.json
{
  "type": "module",  // 使用 ES 模块
  "main": "./lib/index.js",
  "module": "./es/index.js",
  "exports": {
    ".": {
      "import": "./es/index.js",
      "require": "./lib/index.js"
    }
  },
  "sideEffects": false
}
```

</details>

---

**本章总结：**
- ✅ 模块系统对比
- ✅ 模块解析机制
- ✅ 循环依赖处理
- ✅ 动态导入
- ✅ Tree Shaking
- ✅ 依赖图分析
- ✅ 模块化最佳实践
- ✅ 模块加载器实现
- ✅ 打包原理
- ✅ 模块化演进

**下一章：** [第 25 章：高级类型特性](./chapter-25.md)
