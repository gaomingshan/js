# 第 3 章：Babel 配置详解

## 概述

Babel 配置的核心是 `@babel/preset-env`，它能根据目标浏览器自动决定需要哪些转换。本章详解配置文件格式、preset-env 原理和最佳实践。

## 一、配置文件格式

### 1.1 配置文件类型

| 文件名 | 格式 | 适用场景 |
|--------|------|----------|
| `babel.config.js` | JS | 项目级配置（推荐） |
| `babel.config.json` | JSON | 简单配置 |
| `.babelrc.js` | JS | 目录级配置 |
| `.babelrc` | JSON | 目录级配置 |
| `package.json` 中的 `babel` 字段 | JSON | 简单项目 |

### 1.2 推荐：babel.config.js

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ],
  plugins: []
};
```

### 1.3 项目级 vs 目录级

```
project/
├── babel.config.js    ← 项目级：影响整个项目（包括 node_modules）
├── src/
│   └── .babelrc       ← 目录级：只影响 src/ 目录
└── node_modules/
```

> **💡 建议**  
> 普通项目使用 `babel.config.js`，Monorepo 可能需要目录级配置。

## 二、@babel/preset-env

### 2.1 为什么需要 preset-env

没有 preset-env 时：

```javascript
// 需要手动配置每个转换插件
plugins: [
  '@babel/plugin-transform-arrow-functions',
  '@babel/plugin-transform-classes',
  '@babel/plugin-transform-spread',
  // ... 几十个插件
]
```

有了 preset-env：

```javascript
// 一行搞定，自动按需加载插件
presets: ['@babel/preset-env']
```

### 2.2 preset-env 的工作原理

```
1. 读取 targets 配置（目标浏览器）
        ↓
2. 查询 compat-table 数据
   （哪些特性需要转换）
        ↓
3. 自动启用必要的插件
        ↓
4. 执行转换
```

### 2.3 targets 配置

```javascript
// 方式一：字符串查询语法
targets: '> 0.25%, not dead'

// 方式二：对象形式
targets: {
  chrome: '80',
  firefox: '78',
  safari: '14',
  edge: '88'
}

// 方式三：Node.js
targets: { node: 'current' }
targets: { node: '14' }
```

### 2.4 常用 targets 示例

| 场景 | targets 配置 |
|------|--------------|
| 现代浏览器 | `'defaults and supports es6-module'` |
| 兼容旧浏览器 | `'> 0.5%, last 2 versions, not dead'` |
| 只支持 Chrome | `{ chrome: '90' }` |
| 不支持 IE | `'defaults, not IE 11'` |

## 三、browserslist 集成

### 3.1 统一配置

推荐在 `package.json` 或 `.browserslistrc` 中统一配置：

```json
// package.json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead",
    "not IE 11"
  ]
}
```

```ini
# .browserslistrc
> 0.5%
last 2 versions
not dead
not IE 11
```

### 3.2 Babel 自动读取

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      // 不写 targets，自动读取 browserslist
    }]
  ]
};
```

> **📌 重要**  
> browserslist 是 Babel、PostCSS、ESLint 等工具的**共享配置**。

## 四、useBuiltIns 选项

### 4.1 三种模式对比

| 值 | 行为 | 体积 |
|----|------|------|
| `false` | 不处理 Polyfill | 最小 |
| `'entry'` | 根据 targets 替换入口导入 | 中等 |
| `'usage'` | 按代码实际使用自动添加 | 最小 |

### 4.2 entry 模式

```javascript
// babel.config.js
{
  useBuiltIns: 'entry',
  corejs: 3
}

// 源代码：需要手动导入
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 转换后：替换为按 targets 需要的 polyfill
import 'core-js/modules/es.promise';
import 'core-js/modules/es.array.includes';
// ...
```

### 4.3 usage 模式（推荐）

```javascript
// babel.config.js
{
  useBuiltIns: 'usage',
  corejs: 3
}

// 源代码：不需要手动导入
const p = Promise.resolve(1);
[1, 2].includes(1);

// 转换后：自动添加用到的 polyfill
import 'core-js/modules/es.promise';
import 'core-js/modules/es.array.includes';

const p = Promise.resolve(1);
[1, 2].includes(1);
```

### 4.4 corejs 版本

```javascript
// 指定 core-js 版本
{
  useBuiltIns: 'usage',
  corejs: 3  // 或 '3.30'（更精确）
}

// 安装对应版本
// npm install core-js@3
```

## 五、modules 选项

### 5.1 模块转换

```javascript
{
  modules: 'auto'      // 根据环境自动判断（推荐）
  // modules: 'commonjs' // 转换为 CommonJS
  // modules: false      // 保留 ES Modules
}
```

### 5.2 为什么要保留 ES Modules

```javascript
// modules: false 的好处
// 1. 支持 Tree Shaking
// 2. 让打包工具（webpack/Rollup）处理模块
```

## 六、完整配置示例

### 6.1 现代项目配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      // 自动从 browserslist 读取
      useBuiltIns: 'usage',
      corejs: '3.30',
      modules: false,  // 保留 ESM，支持 Tree Shaking
      bugfixes: true   // 使用更小的转换
    }]
  ]
};
```

### 6.2 React 项目配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'  // React 17+ 不需要 import React
    }]
  ]
};
```

### 6.3 TypeScript 项目配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }],
    '@babel/preset-typescript'
  ]
};
```

## 七、常用插件

### 7.1 运行时辅助插件

```javascript
// 减少重复的辅助代码
plugins: [
  ['@babel/plugin-transform-runtime', {
    corejs: false,    // 或 3（用 runtime 的 polyfill）
    helpers: true,    // 复用辅助函数
    regenerator: true // async/await 支持
  }]
]
```

### 7.2 实验性语法插件

```javascript
plugins: [
  '@babel/plugin-proposal-decorators',      // 装饰器
  '@babel/plugin-proposal-pipeline-operator' // 管道运算符
]
```

## 八、调试配置

### 8.1 查看实际使用的插件

```bash
# 设置环境变量
BABEL_SHOW_CONFIG_FOR=./src/index.js npx babel src/index.js
```

### 8.2 debug 选项

```javascript
{
  presets: [
    ['@babel/preset-env', {
      debug: true  // 输出使用的插件和 polyfill
    }]
  ]
}
```

输出示例：
```
@babel/preset-env: `DEBUG` option

Using targets:
{
  "chrome": "80",
  "edge": "88"
}

Using plugins:
  proposal-optional-chaining
  proposal-nullish-coalescing-operator
```

## 九、最佳实践

| 实践 | 说明 |
|------|------|
| 使用 browserslist | 统一管理目标浏览器 |
| useBuiltIns: usage | 按需加载 polyfill |
| modules: false | 保留 ESM 支持 Tree Shaking |
| 指定 corejs 版本 | 确保 polyfill 完整 |
| 配合 transform-runtime | 减少重复代码 |

## 参考资料

- [@babel/preset-env 文档](https://babeljs.io/docs/babel-preset-env)
- [browserslist 查询语法](https://github.com/browserslist/browserslist#queries)
- [Babel 配置文件](https://babeljs.io/docs/config-files)

---

**下一章** → [第 4 章：PostCSS 工作原理](./04-postcss-intro.md)
