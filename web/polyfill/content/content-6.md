# @babel/preset-env 深入

## 核心概念

`@babel/preset-env` 是 Babel 最重要的 Preset，能够**根据目标环境智能选择需要转换的语法和需要注入的 Polyfill**。

核心优势：**按需转换**，避免不必要的代码转换和 Polyfill 注入。

---

## preset-env 的工作原理

### 1. 读取目标环境

**配置方式**：
```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.5%, last 2 versions, not dead"
    }]
  ]
}
```

**解析流程**：
1. 读取 `targets` 配置
2. 通过 `browserslist` 解析查询语句
3. 获得目标浏览器列表及版本

**示例结果**：
```
chrome 108
chrome 107
edge 108
firefox 107
safari 16.1
```

---

### 2. 查询特性支持情况

**数据来源**：`compat-table`（兼容性表格）

**示例**：箭头函数支持情况
```
Chrome 45+    ✅ 支持
Firefox 22+   ✅ 支持
Safari 10+    ✅ 支持
IE 11         ❌ 不支持
```

---

### 3. 决定是否转换

**规则**：如果**所有目标浏览器都支持**某个特性，则不转换

**示例 1**：目标环境支持箭头函数
```javascript
// targets: "chrome >= 80"
// 输入
const add = (a, b) => a + b;

// 输出（不转换）
const add = (a, b) => a + b;
```

**示例 2**：目标环境不支持箭头函数
```javascript
// targets: "ie 11"
// 输入
const add = (a, b) => a + b;

// 输出（转换）
var add = function(a, b) { return a + b; };
```

---

## browserslist 集成

### 自动读取 browserslist 配置

**优先级**：
1. `targets` 字段（Babel 配置中）
2. `.browserslistrc` 文件
3. `package.json` 中的 `browserslist` 字段

---

### 示例：package.json 配置

```json
{
  "name": "my-app",
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ]
}
```

**Babel 自动读取**：
```javascript
// babel.config.js
{
  "presets": ["@babel/preset-env"] // 自动读取 browserslist
}
```

---

### 多环境配置

```json
{
  "browserslist": {
    "production": [
      "> 0.5%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version"
    ]
  }
}
```

**使用**：
```bash
NODE_ENV=production npm run build  # 使用 production 配置
NODE_ENV=development npm start     # 使用 development 配置
```

---

## corejs 版本选择

### core-js@2 vs core-js@3

| 特性 | core-js@2 | core-js@3 |
|------|-----------|-----------|
| **维护状态** | ❌ 已停止维护 | ✅ 持续更新 |
| **新特性支持** | 不支持 ES2019+ | ✅ 支持最新特性 |
| **包大小** | 较小 | 略大（+10KB） |
| **推荐度** | ❌ 不推荐 | ✅ 推荐 |

---

### 新特性对比

**core-js@2 不支持的特性**：
```javascript
// Promise.allSettled（ES2020）
Promise.allSettled([p1, p2, p3]); // ❌ core-js@2 不支持

// String.prototype.matchAll（ES2020）
'abc'.matchAll(/a/g); // ❌ core-js@2 不支持

// globalThis（ES2020）
globalThis.setTimeout(() => {}); // ❌ core-js@2 不支持
```

**core-js@3 完整支持**：
```javascript
// 配置
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}

// 自动注入 Polyfill
import "core-js/modules/es.promise.all-settled.js";
Promise.allSettled([p1, p2, p3]);
```

---

### 启用提案特性

```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "corejs": {
        "version": 3,
        "proposals": true // 启用提案阶段的特性
      }
    }]
  ]
}
```

**效果**：支持 Stage 3 提案特性

---

## useBuiltIns: 'usage' 的智能注入

### 工作流程

1. **扫描代码**：分析使用了哪些 API
2. **查询支持**：检查目标环境是否支持
3. **注入 Polyfill**：仅注入缺失的 Polyfill

---

### 示例：智能注入

**源码**：
```javascript
Promise.resolve(42);
[1, 2, 3].map(x => x * 2);
[1, 2, 3].includes(2);
```

**targets: "chrome >= 80"**（现代浏览器）：
```javascript
// 输出（无 Polyfill）
Promise.resolve(42);
[1, 2, 3].map(x => x * 2);
[1, 2, 3].includes(2);
```

**targets: "ie 11"**（旧浏览器）：
```javascript
// 输出（注入 Polyfill）
import "core-js/modules/es.promise.js";
import "core-js/modules/es.array.includes.js";

Promise.resolve(42);
[1, 2, 3].map(x => x * 2); // map 原生支持，不注入
[1, 2, 3].includes(2);
```

---

### 优势：精准按需

**对比 useBuiltIns: 'entry'**：

| 配置 | 注入策略 | 包体积 |
|------|----------|--------|
| `'entry'` | 全量注入 | ~100 KB |
| `'usage'` | 按需注入 | ~10 KB |

**结论**：`'usage'` 体积优化 90%

---

## 转换结果分析

### 查看编译后代码

**方法 1**：Babel REPL
- 访问：https://babeljs.io/repl
- 选择 preset-env
- 配置 targets

**方法 2**：CLI 编译
```bash
npx babel src/index.js --out-file dist/index.js
```

**方法 3**：Webpack 输出
```bash
npm run build
# 查看 dist/main.js
```

---

### 分析转换内容

**源码**：
```javascript
class User {
  constructor(name) {
    this.name = name;
  }
  
  async greet() {
    const greeting = await fetchGreeting();
    return `Hello, ${this.name}`;
  }
}
```

**targets: "ie 11" 转换结果**：
```javascript
// 1. 引入 regenerator-runtime（支持 async/await）
import "regenerator-runtime/runtime.js";

// 2. 引入 Promise Polyfill
import "core-js/modules/es.promise.js";

// 3. Class 转换为函数
var User = /*#__PURE__*/ function() {
  function User(name) {
    this.name = name;
  }
  
  // 4. async 方法转换为 generator
  User.prototype.greet = /*#__PURE__*/ _asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
      var greeting;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        // generator 实现
      }, _callee, this);
    })
  );
  
  return User;
}();
```

**关键点**：
- Class → 构造函数
- async/await → generator + regenerator-runtime
- 模板字符串 → 字符串拼接
- Polyfill 自动注入

---

## 性能优化：避免过度转换

### 问题：转换所有代码

```javascript
// ❌ 未配置 targets
{
  "presets": ["@babel/preset-env"]
}
```

**结果**：
- 所有语法都被转换
- 包体积增大 3-5 倍
- 运行时性能下降

---

### 解决：精确配置 targets

```javascript
// ✅ 配置目标环境
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.5%, last 2 versions, not dead"
    }]
  ]
}
```

**效果**：
- 仅转换必要的语法
- 包体积减小 60-80%
- 性能接近原生

---

### 对比实验

**源码**：1000 行 ES6+ 代码

| 配置 | 输出大小 | 性能 |
|------|----------|------|
| 无 targets | 250 KB | 基准 |
| targets: "last 2 versions" | 100 KB | +30% |
| targets: "chrome >= 80" | 60 KB | +50% |

---

## 实战案例：分析包体积

### 工具：webpack-bundle-analyzer

```bash
npm install --save-dev webpack-bundle-analyzer
```

**配置**：
```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

**运行**：
```bash
npm run build
# 自动打开可视化报告
```

---

### 分析 Polyfill 占比

**典型结果**：
```
总包体积：500 KB

- 业务代码：200 KB (40%)
- core-js Polyfill：150 KB (30%)
- Babel 辅助函数：50 KB (10%)
- 其他依赖：100 KB (20%)
```

**优化方向**：
1. 调整 targets，减少 Polyfill
2. 使用 `@babel/plugin-transform-runtime` 减少辅助函数
3. Tree Shaking 优化依赖

---

## 常见陷阱

### ❌ 陷阱 1：忘记安装 core-js

```javascript
{
  "useBuiltIns": "usage",
  "corejs": 3
}
```

**报错**：
```
Cannot find module 'core-js/modules/es.promise.js'
```

**解决**：
```bash
npm install --save core-js@3
```

---

### ❌ 陷阱 2：targets 配置错误

```javascript
// ❌ 语法错误
{
  "targets": "chrome 80" // 缺少比较符
}

// ✅ 正确
{
  "targets": "chrome >= 80"
}
```

---

### ❌ 陷阱 3：useBuiltIns: 'usage' 漏检测

**问题**：动态导入的代码可能漏检测

```javascript
// 主文件
import('./dynamic-module.js');

// dynamic-module.js（动态加载）
Promise.resolve(42); // 可能不会自动注入 Polyfill
```

**解决**：
- 确保所有入口文件都经过 Babel 处理
- 或使用 `useBuiltIns: 'entry'` 全量导入

---

## 高级配置：shippedProposals

### 启用已实现的提案特性

```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "shippedProposals": true
    }]
  ]
}
```

**效果**：支持已在部分浏览器实现但未正式纳入标准的特性

---

## debug 选项：查看转换详情

```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "debug": true
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
  "firefox": "75",
  "safari": "13"
}

Using modules transform: false

Using plugins:
  transform-template-literals { "chrome":"80" }
  transform-arrow-functions { "safari":"13" }

Using polyfills with `usage` option:
  es.promise { "ie":"11" }
  es.array.includes { "ie":"11" }
```

---

## 实战配置模板

### 现代浏览器项目

```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "last 2 Chrome versions, last 2 Firefox versions, last 2 Safari versions",
      "useBuiltIns": "usage",
      "corejs": 3,
      "modules": false
    }]
  ]
}
```

---

### 兼容 IE11 项目

```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.5%, ie 11",
      "useBuiltIns": "usage",
      "corejs": 3,
      "modules": "auto"
    }]
  ],
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      "corejs": false,
      "helpers": true,
      "regenerator": true
    }]
  ]
}
```

---

## 关键要点

1. **智能转换**：preset-env 根据目标环境按需转换
2. **browserslist 集成**：统一目标环境配置
3. **core-js@3**：使用最新版本，支持新特性
4. **useBuiltIns: 'usage'**：智能注入 Polyfill，体积最优
5. **debug 选项**：查看详细转换信息，便于优化

---

## 下一步

下一章节将学习 **Polyfill 的本质与实现**，理解运行时 API 填充机制。
