# 第 15 章：Babel + core-js 最佳配置

## 概述

本章提供现代前端项目中 Babel 和 core-js 的推荐配置，涵盖应用项目和库开发两种场景。

## 一、应用项目配置

### 1.1 依赖安装

```bash
# Babel 核心
npm install -D @babel/core @babel/preset-env

# Polyfill
npm install core-js

# 辅助函数复用（可选但推荐）
npm install -D @babel/plugin-transform-runtime
npm install @babel/runtime
```

### 1.2 推荐配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      // 自动从 browserslist 读取目标浏览器
      // 或显式指定：targets: '> 0.25%, not dead'
      
      useBuiltIns: 'usage',  // 按使用自动添加 polyfill
      corejs: '3.30',        // 指定具体版本
      modules: false,        // 保留 ESM，支持 Tree Shaking
      bugfixes: true         // 使用更优化的转换
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,      // 复用辅助函数
      regenerator: false  // 由 preset-env 处理
    }]
  ]
};
```

### 1.3 browserslist 配置

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

### 1.4 环境区分

```json
// package.json
{
  "browserslist": {
    "production": [
      "> 0.5%",
      "last 2 versions",
      "not dead"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version"
    ]
  }
}
```

## 二、库/SDK 配置

### 2.1 依赖安装

```bash
npm install -D @babel/core @babel/preset-env
npm install -D @babel/plugin-transform-runtime

# 使用带 corejs 的 runtime
npm install @babel/runtime-corejs3
```

### 2.2 推荐配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      bugfixes: true
      // 不使用 useBuiltIns，由 transform-runtime 处理
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true,
      corejs: 3  // 不污染全局的 polyfill
    }]
  ]
};
```

### 2.3 为什么库不应污染全局

```javascript
// ❌ 库使用全局 polyfill
// 问题：可能与用户项目的 polyfill 版本冲突

// ✅ 库使用 runtime polyfill
// 好处：polyfill 是私有的，不影响全局
```

## 三、React 项目配置

### 3.1 依赖安装

```bash
npm install -D @babel/core @babel/preset-env @babel/preset-react
npm install -D @babel/plugin-transform-runtime
npm install core-js @babel/runtime
```

### 3.2 配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: '3.30',
      modules: false
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'  // React 17+ 不需要 import React
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true
    }]
  ]
};
```

## 四、TypeScript 项目配置

### 4.1 方案一：Babel 处理一切

```bash
npm install -D @babel/preset-typescript
```

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: '3.30'
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { helpers: true }]
  ]
};
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",      // 让 Babel 处理转换
    "module": "ESNext",
    "noEmit": true,          // 只做类型检查
    "isolatedModules": true
  }
}
```

### 4.2 方案二：tsc 转换 + Babel polyfill

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "outDir": "./dist"
  }
}
```

```javascript
// babel.config.js - 只处理 polyfill
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: '3.30',
      targets: '> 0.25%, not dead'
    }]
  ]
};
```

## 五、Vite 项目配置

### 5.1 开发环境

Vite 开发时不需要 Babel（使用 esbuild），但生产构建可能需要。

### 5.2 使用 @vitejs/plugin-legacy

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      // 自动处理 polyfill
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ]
});
```

### 5.3 手动配置 Babel

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: false,  // 禁用 esbuild
  build: {
    // 使用 Babel
  }
});
```

## 六、webpack 集成

### 6.1 配置 babel-loader

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                useBuiltIns: 'usage',
                corejs: '3.30'
              }]
            ]
          }
        }
      }
    ]
  }
};
```

### 6.2 处理 node_modules

```javascript
// 某些库需要被 Babel 处理
{
  test: /\.js$/,
  include: [
    path.resolve('src'),
    path.resolve('node_modules/some-modern-library')
  ],
  use: 'babel-loader'
}
```

## 七、调试配置

### 7.1 查看使用的插件

```javascript
// babel.config.js
{
  presets: [
    ['@babel/preset-env', {
      debug: true  // 输出使用的插件和 polyfill
    }]
  ]
}
```

### 7.2 查看完整配置

```bash
BABEL_SHOW_CONFIG_FOR=./src/index.js npx babel src/index.js
```

### 7.3 测试单个文件

```bash
npx babel src/index.js --out-file dist/index.js
```

## 八、常见问题解决

### 8.1 Polyfill 未添加

```javascript
// 检查：
// 1. corejs 版本是否正确
// 2. browserslist 是否需要该 polyfill
// 3. useBuiltIns 是否正确配置

// 强制添加特定 polyfill
{
  useBuiltIns: 'usage',
  corejs: '3.30',
  include: ['es.promise', 'es.array.includes']
}
```

### 8.2 重复的 Polyfill

```javascript
// 问题：多个入口都添加了 polyfill
// 解决：确保 polyfill 只添加一次

// webpack 配置
optimization: {
  splitChunks: {
    cacheGroups: {
      polyfills: {
        test: /[\\/]node_modules[\\/](core-js)[\\/]/,
        name: 'polyfills',
        chunks: 'all'
      }
    }
  }
}
```

### 8.3 体积过大

```javascript
// 1. 检查 browserslist 是否过宽
// 2. 使用 usage 而非 entry
// 3. 分析打包产物

// 排除不需要的 polyfill
{
  exclude: ['es.promise', 'es.array.includes']
}
```

## 九、配置模板汇总

### 9.1 现代应用（不支持 IE）

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: '3.30',
      modules: false,
      bugfixes: true
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { helpers: true }]
  ]
};
```

```json
// browserslist
["defaults", "not IE 11"]
```

### 9.2 需要兼容旧浏览器

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'entry',  // 更可靠
      corejs: '3.30',
      modules: false
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { helpers: true }]
  ]
};
```

```javascript
// 入口文件
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### 9.3 库开发

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: true,
      corejs: 3
    }]
  ]
};
```

## 十、最佳实践

| 实践 | 说明 |
|------|------|
| 统一用 browserslist | 多工具共享配置 |
| 指定 corejs 具体版本 | 确保 Babel 知道可用的 polyfill |
| 应用用 useBuiltIns | 库用 transform-runtime |
| 开启 debug 检查 | 确认添加了正确的 polyfill |
| 定期更新依赖 | 获取最新的转换和 polyfill |

## 参考资料

- [@babel/preset-env 文档](https://babeljs.io/docs/babel-preset-env)
- [@babel/plugin-transform-runtime 文档](https://babeljs.io/docs/babel-plugin-transform-runtime)
- [core-js 文档](https://github.com/zloirock/core-js)

---

**下一章** → [第 16 章：PostCSS 工程配置](./16-postcss-setup.md)
