# Babel 配置实战

## 核心概念

Babel 配置决定了**如何转换代码**、**转换哪些代码**、**是否注入 Polyfill**。合理配置直接影响包体积和兼容性范围。

---

## 配置文件选择

### 1. .babelrc（项目级配置）

**特点**：
- 只作用于当前项目
- 不会影响 `node_modules`
- 适合简单项目

**示例**：
```json
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

---

### 2. babel.config.js（根配置）✅ 推荐

**特点**：
- 作用于整个项目（包括 `node_modules`）
- 支持动态配置
- 适合 Monorepo 和复杂项目

**示例**：
```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true); // 启用缓存
  
  const presets = [
    ['@babel/preset-env', {
      targets: {
        browsers: ['> 0.5%', 'last 2 versions', 'not dead']
      },
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ];
  
  const plugins = [];
  
  // 生产环境移除 console
  if (process.env.NODE_ENV === 'production') {
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }
  
  return { presets, plugins };
};
```

---

### 3. package.json（嵌入配置）

**特点**：
- 配置写在 `package.json` 的 `babel` 字段
- 适合极简配置

**示例**：
```json
{
  "name": "my-app",
  "babel": {
    "presets": ["@babel/preset-env"]
  }
}
```

---

### 配置文件优先级

```
babel.config.js
  ↓（优先级高）
.babelrc / .babelrc.js
  ↓
package.json
```

---

## @babel/preset-env：智能语法转换

### 核心配置项

```javascript
{
  "presets": [
    ["@babel/preset-env", {
      // 目标环境
      "targets": "> 0.5%, last 2 versions, not dead",
      
      // Polyfill 策略
      "useBuiltIns": "usage",
      
      // core-js 版本
      "corejs": 3,
      
      // 模块转换
      "modules": false,
      
      // 调试输出
      "debug": false
    }]
  ]
}
```

---

## targets：指定目标环境

### 配置方式 1：browserslist 字符串

```javascript
{
  "targets": "> 0.5%, last 2 versions, not dead"
}
```

---

### 配置方式 2：对象形式

```javascript
{
  "targets": {
    "chrome": "80",
    "firefox": "75",
    "safari": "13",
    "edge": "18"
  }
}
```

---

### 配置方式 3：读取 browserslist

```javascript
// package.json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ]
}

// babel.config.js 自动读取
{
  "presets": ["@babel/preset-env"]
}
```

---

### targets 的影响

**示例：不同 targets 的转换结果**

**源码**：
```javascript
const add = (a, b) => a + b;
```

**targets: "chrome >= 80"**（现代浏览器）：
```javascript
const add = (a, b) => a + b; // 不转换，原生支持
```

**targets: "ie 11"**（旧浏览器）：
```javascript
var add = function(a, b) { return a + b; }; // 转换为 ES5
```

---

## useBuiltIns：Polyfill 策略

### 1. useBuiltIns: false（默认）

**行为**：不自动注入 Polyfill

**适用**：
- 不需要 Polyfill
- 手动管理 Polyfill

**示例**：
```javascript
// 源码
Promise.resolve(42);

// 输出（无变化）
Promise.resolve(42);
```

---

### 2. useBuiltIns: 'entry'

**行为**：根据 `targets` 全量导入 Polyfill

**配置**：
```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "entry",
      "corejs": 3
    }]
  ]
}
```

**源码**（需手动导入）：
```javascript
import 'core-js';
import 'regenerator-runtime/runtime';

Promise.resolve(42);
```

**输出**：
```javascript
import "core-js/modules/es.symbol.js";
import "core-js/modules/es.array.filter.js";
import "core-js/modules/es.array.map.js";
// ... 数十个 Polyfill

import "regenerator-runtime/runtime";

Promise.resolve(42);
```

**缺点**：全量导入，体积大（~50-100KB）

---

### 3. useBuiltIns: 'usage' ✅ 推荐

**行为**：根据代码实际使用情况按需注入 Polyfill

**配置**：
```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}
```

**源码**（无需手动导入）：
```javascript
Promise.resolve(42);
[1, 2, 3].includes(2);
```

**输出**：
```javascript
import "core-js/modules/es.promise.js";
import "core-js/modules/es.array.includes.js";

Promise.resolve(42);
[1, 2, 3].includes(2);
```

**优势**：
- ✅ 自动按需导入
- ✅ 体积最小（仅导入使用的 Polyfill）
- ✅ 无需手动管理

---

### useBuiltIns 对比

| 配置 | 导入方式 | 体积 | 推荐度 |
|------|----------|------|--------|
| `false` | 不导入 | 0 KB | 不需要 Polyfill 时 |
| `entry` | 全量导入 | 50-100 KB | ❌ 不推荐 |
| `usage` | 按需导入 | 5-20 KB | ✅ 推荐 |

---

## corejs：核心库版本

### core-js@2 vs core-js@3

**core-js@2**（已停止维护）：
- 不支持新特性（如 `Promise.allSettled`）
- 不推荐使用

**core-js@3**（推荐）：
- 支持最新 ECMAScript 特性
- 持续更新

**配置**：
```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3 // 或 { version: 3, proposals: true }
    }]
  ]
}
```

**安装**：
```bash
npm install --save core-js@3
```

---

## modules：模块转换

### 配置选项

```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "modules": false // 保持 ESM
      // 可选值：false, "auto", "commonjs", "amd", "umd", "systemjs"
    }]
  ]
}
```

---

### modules: false（Webpack/Vite 推荐）

**行为**：保持 ES Module 语法

**源码**：
```javascript
import { foo } from './utils';
export const bar = 42;
```

**输出**：
```javascript
import { foo } from './utils';
export const bar = 42; // 保持不变
```

**优势**：
- ✅ Webpack/Vite 可以 Tree Shaking
- ✅ 动态导入保持原样

---

### modules: 'commonjs'（Node.js 推荐）

**行为**：转换为 CommonJS

**源码**：
```javascript
import { foo } from './utils';
export const bar = 42;
```

**输出**：
```javascript
const { foo } = require('./utils');
exports.bar = 42;
```

---

## 常见配置陷阱

### ❌ 陷阱 1：未安装 core-js

```javascript
{
  "useBuiltIns": "usage",
  "corejs": 3
}
```

**报错**：
```
Cannot find module 'core-js'
```

**解决**：
```bash
npm install --save core-js@3
```

---

### ❌ 陷阱 2：useBuiltIns: 'entry' 忘记导入

```javascript
// ❌ 未导入 core-js
Promise.resolve(42);

// ✅ 正确
import 'core-js';
Promise.resolve(42);
```

---

### ❌ 陷阱 3：targets 配置过宽

```javascript
// ❌ 包含已停止维护的浏览器
{
  "targets": "> 0.1%" // 可能包含 IE6、IE7
}

// ✅ 排除停止维护的浏览器
{
  "targets": "> 0.5%, not dead"
}
```

---

## 工程实践：多环境配置

### 场景：开发环境 vs 生产环境

```javascript
// babel.config.js
module.exports = function(api) {
  const isDev = api.env('development');
  const isProd = api.env('production');
  
  return {
    presets: [
      ['@babel/preset-env', {
        // 开发环境：快速编译
        targets: isDev ? 'last 1 chrome version' : '> 0.5%, not dead',
        
        useBuiltIns: 'usage',
        corejs: 3,
        
        // 开发环境：保留模块语法（HMR）
        modules: isDev ? false : 'auto'
      }]
    ],
    
    plugins: [
      // 生产环境：移除 console
      isProd && ['transform-remove-console', { exclude: ['error', 'warn'] }]
    ].filter(Boolean)
  };
};
```

---

## 完整配置示例

### 现代前端项目（React + Webpack）

```javascript
// babel.config.js
module.exports = {
  presets: [
    // 转换 ES6+ 语法
    ['@babel/preset-env', {
      targets: '> 0.5%, last 2 versions, not dead',
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false // Webpack Tree Shaking
    }],
    
    // 转换 React JSX
    ['@babel/preset-react', {
      runtime: 'automatic' // React 17+ 新 JSX 转换
    }]
  ],
  
  plugins: [
    // 装饰器支持
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    
    // Class 属性
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    
    // 运行时辅助函数复用
    ['@babel/plugin-transform-runtime', {
      corejs: false,
      helpers: true,
      regenerator: true
    }]
  ],
  
  // 环境特定配置
  env: {
    production: {
      plugins: [
        ['transform-remove-console', { exclude: ['error', 'warn'] }]
      ]
    },
    
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ]
    }
  }
};
```

---

## 性能优化

### 1. 启用缓存

```javascript
module.exports = function(api) {
  api.cache.using(() => process.env.NODE_ENV);
  
  return {
    // 配置
  };
};
```

**效果**：
- 首次编译：10 秒
- 二次编译：2 秒

---

### 2. 缩小转换范围

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/, // 排除第三方库
        use: 'babel-loader'
      }
    ]
  }
};
```

---

### 3. 使用 thread-loader（大型项目）

```bash
npm install --save-dev thread-loader
```

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'thread-loader', // 多线程编译
          'babel-loader'
        ]
      }
    ]
  }
};
```

---

## 调试配置

### 查看实际转换的 Plugin

```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "debug": true // 输出详细信息
    }]
  ]
}
```

**输出示例**：
```
@babel/preset-env: `DEBUG` option

Using targets:
{
  "chrome": "80",
  "firefox": "75"
}

Using plugins:
  transform-arrow-functions { "chrome":"80", "firefox":"75" }
  transform-classes { "chrome":"80", "firefox":"75" }
```

---

## 关键要点

1. **配置文件**：推荐使用 `babel.config.js`，支持动态配置
2. **targets**：指定目标环境，决定转换范围
3. **useBuiltIns: 'usage'**：按需注入 Polyfill，体积最优
4. **corejs: 3**：使用最新版本，支持新特性
5. **modules: false**：Webpack/Vite 保持 ESM，支持 Tree Shaking

---

## 下一步

下一章节将深入学习 **@babel/preset-env 工作原理**，理解按需转换机制。
