# 第 13 章：工程化与构建 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Babel 基础

### 题目

Babel 的主要作用是什么？

**选项：**
- A. 压缩 JavaScript 代码
- B. 将 ES6+ 代码转换为向后兼容的 JavaScript
- C. 打包 JavaScript 模块
- D. 检查代码质量

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Babel 的作用**

Babel 是 JavaScript 编译器，主要用于将 ES6+ 语法转换为向后兼容的 JavaScript 代码。

```javascript
// ES6+ 代码
const greet = (name) => {
  console.log(`Hello, ${name}!`);
};

class Person {
  constructor(name) {
    this.name = name;
  }
}

// Babel 转换后（ES5）
"use strict";

var greet = function greet(name) {
  console.log("Hello, " + name + "!");
};

var Person = function Person(name) {
  _classCallCheck(this, Person);
  this.name = name;
};
```

**Babel 配置：**

**方式 1：babel.config.js**
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not dead']
      },
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining'
  ]
};
```

**方式 2：.babelrc**
```json
{
  "presets": ["@babel/preset-env"],
  "plugins": []
}
```

**常用 presets：**
- `@babel/preset-env` - 转换 ES6+
- `@babel/preset-react` - 转换 JSX
- `@babel/preset-typescript` - 转换 TypeScript

**常用 plugins：**
- `@babel/plugin-transform-runtime` - 优化帮助函数
- `@babel/plugin-proposal-decorators` - 装饰器
- `@babel/plugin-proposal-class-properties` - 类属性

**polyfill vs transform：**
```javascript
// transform：语法转换
// 箭头函数 → 普通函数
const fn = () => {};  // 转换为 function

// polyfill：API 补丁
// Promise、Array.from 等需要 polyfill
Promise.resolve();  // 需要注入 Promise 实现
Array.from([1, 2]); // 需要注入 Array.from 实现
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Webpack 概念

### 题目

Webpack 中的 Loader 和 Plugin 有什么区别？

**选项：**
- A. Loader 用于转换模块，Plugin 用于执行更广泛的任务
- B. Loader 用于打包，Plugin 用于压缩
- C. 没有区别，可以互换使用
- D. Loader 是插件的一种

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Loader vs Plugin**

| 特性 | Loader | Plugin |
|------|--------|--------|
| 作用 | 转换模块文件 | 执行更广泛的任务 |
| 执行时机 | 模块加载时 | 整个编译周期 |
| 配置位置 | `module.rules` | `plugins` |
| 类型 | 函数 | 类（带 apply 方法） |

**Loader 示例：**
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',  // 转换 JS
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']  // 处理 CSS
      },
      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource'  // 处理图片
      }
    ]
  }
};
```

**Plugin 示例：**
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
};
```

**常用 Loaders：**
- `babel-loader` - 转换 JS
- `css-loader` - 解析 CSS
- `style-loader` - 注入 CSS
- `sass-loader` - 编译 Sass
- `file-loader` - 处理文件
- `url-loader` - 转换为 Data URL

**常用 Plugins：**
- `HtmlWebpackPlugin` - 生成 HTML
- `MiniCssExtractPlugin` - 提取 CSS
- `CleanWebpackPlugin` - 清理输出目录
- `DefinePlugin` - 定义全局常量
- `TerserPlugin` - 压缩 JS
- `OptimizeCSSAssetsPlugin` - 压缩 CSS

**自定义 Loader：**
```javascript
// uppercase-loader.js
module.exports = function(source) {
  return source.toUpperCase();
};

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: './uppercase-loader.js'
      }
    ]
  }
};
```

**自定义 Plugin：**
```javascript
class MyPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('构建完成！');
    });
  }
}

module.exports = {
  plugins: [new MyPlugin()]
};
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 代码分割

### 题目

Webpack 的代码分割（Code Splitting）可以减少初始加载时间。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**代码分割的作用**

代码分割将代码拆分成多个 bundle，按需加载，减少初始加载时间。

**方式 1：入口分割**
```javascript
module.exports = {
  entry: {
    main: './src/index.js',
    admin: './src/admin.js'
  },
  output: {
    filename: '[name].bundle.js'
  }
};
```

**方式 2：动态导入**
```javascript
// 懒加载
button.addEventListener('click', () => {
  import('./module.js').then(module => {
    module.doSomething();
  });
});

// React 路由懒加载
const Home = React.lazy(() => import('./Home'));
const About = React.lazy(() => import('./About'));
```

**方式 3：SplitChunks**
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

**效果对比：**
```
❌ 不分割：
app.js (500KB) - 初始加载 500KB

✅ 代码分割：
main.js (100KB)     - 初始加载 100KB
vendor.js (300KB)   - 缓存
lazy-page.js (100KB) - 按需加载

初始加载时间大幅减少！
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** Tree Shaking

### 题目

以下代码经过 Tree Shaking 后，哪些会被保留？

```javascript
// utils.js
export function used() {
  console.log('used');
}

export function unused() {
  console.log('unused');
}

console.log('side effect');

// main.js
import { used } from './utils.js';
used();
```

**选项：**
- A. 只保留 `used` 函数
- B. 保留 `used` 函数和 `console.log('side effect')`
- C. 保留所有代码
- D. 只保留 `console.log('side effect')`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Tree Shaking 与副作用**

```javascript
// utils.js
export function used() {
  console.log('used');  // ✅ 保留（被使用）
}

export function unused() {
  console.log('unused');  // ❌ 删除（未使用）
}

console.log('side effect');  // ✅ 保留（副作用代码）

// 打包后
function used() {
  console.log('used');
}
console.log('side effect');
used();
```

**配置 sideEffects：**

**package.json：**
```json
{
  "sideEffects": false
}
```

```javascript
// 此时 console.log('side effect') 也会被删除
```

**标记特定文件有副作用：**
```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

**纯函数标记：**
```javascript
// 使用 /*#__PURE__*/ 注释
const obj = /*#__PURE__*/ createObj();
export { obj };  // 如果未使用，会被删除
```

**Tree Shaking 的条件：**
1. 使用 ES6 模块（import/export）
2. 生产模式（mode: 'production'）
3. 没有副作用或正确配置 sideEffects

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** HMR

### 题目

Webpack 的热模块替换（HMR）如何工作？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**HMR 工作原理**

**1. 启用 HMR：**
```javascript
// webpack.config.js
module.exports = {
  devServer: {
    hot: true
  }
};

// 或在代码中
if (module.hot) {
  module.hot.accept();
}
```

**2. HMR API：**
```javascript
// 接受自身更新
if (module.hot) {
  module.hot.accept('./module.js', () => {
    console.log('模块已更新');
    // 执行更新逻辑
  });
}

// 接受依赖更新
if (module.hot) {
  module.hot.accept(['./a.js', './b.js'], () => {
    console.log('依赖已更新');
  });
}

// 拒绝更新
if (module.hot) {
  module.hot.decline();  // 强制刷新页面
}

// 监听状态
if (module.hot) {
  module.hot.addStatusHandler(status => {
    console.log('HMR Status:', status);
  });
}
```

**3. HMR 流程：**
```
1. 修改文件
2. Webpack 重新编译
3. 服务器推送更新（WebSocket）
4. 客户端接收更新
5. 运行 HMR Runtime
6. 替换模块
7. 执行回调
```

**4. 实际应用：**

**React 应用：**
```javascript
// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const render = () => {
  ReactDOM.render(<App />, document.getElementById('root'));
};

render();

if (module.hot) {
  module.hot.accept('./App', () => {
    render();  // 重新渲染
  });
}
```

**Vue 应用：**
```javascript
// vue-loader 自动处理 HMR
import Vue from 'vue';
import App from './App.vue';

new Vue({
  render: h => h(App)
}).$mount('#app');

// vue-loader 会自动注入 HMR 代码
```

**CSS 模块：**
```javascript
// style-loader 自动支持 HMR
import './styles.css';

// CSS 修改会自动更新，无需刷新页面
```

**5. HMR 的优势：**
- 保持应用状态
- 只更新变化的模块
- 开发体验更好
- 调试更方便

**6. 注意事项：**
```javascript
// ❌ 状态可能丢失
let count = 0;
button.onclick = () => count++;
// HMR 后 count 重置

// ✅ 保持状态
if (module.hot) {
  module.hot.accept();
  // 恢复状态
  if (module.hot.data) {
    count = module.hot.data.count;
  }
  
  module.hot.dispose(data => {
    data.count = count;
  });
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** 构建优化

### 题目

以下哪些是 Webpack 构建优化的有效方法？

**选项：**
- A. 使用 DllPlugin 预编译依赖
- B. 开启缓存（cache）
- C. 使用 thread-loader 多线程构建
- D. 使用 resolve.alias 减少查找时间

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**Webpack 构建优化方法**

**A. DllPlugin（预编译）**
```javascript
// webpack.dll.js
module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'lodash']
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, 'dll'),
    library: '[name]_[hash]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_[hash]',
      path: path.resolve(__dirname, 'dll/[name].manifest.json')
    })
  ]
};

// webpack.config.js
module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendor.manifest.json')
    })
  ]
};
```

**B. 缓存**
```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true  // Babel 缓存
          }
        }
      }
    ]
  }
};
```

**C. 多线程构建**
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'thread-loader',  // 放在其他 loader 前面
          'babel-loader'
        ]
      }
    ]
  }
};

// 或使用 HappyPack
const HappyPack = require('happypack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'happypack/loader?id=babel'
      }
    ]
  },
  plugins: [
    new HappyPack({
      id: 'babel',
      loaders: ['babel-loader'],
      threads: 4
    })
  ]
};
```

**D. resolve.alias**
```javascript
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components'),
      'utils': path.resolve(__dirname, 'src/utils')
    },
    extensions: ['.js', '.jsx', '.json'],  // 减少尝试次数
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
};
```

**其他优化方法：**

**1. externals（外部依赖）**
```javascript
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};

// HTML 中使用 CDN
<script src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js"></script>
```

**2. IgnorePlugin**
```javascript
module.exports = {
  plugins: [
    // 忽略 moment 的语言包
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    })
  ]
};
```

**3. 按需引入**
```javascript
// ❌ 全量引入
import _ from 'lodash';

// ✅ 按需引入
import debounce from 'lodash/debounce';
```

**4. 压缩**
```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,  // 多线程压缩
        terserOptions: {
          compress: {
            drop_console: true  // 删除 console
          }
        }
      })
    ]
  }
};
```

**5. 分析工具**
```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 环境变量

### 题目

以下哪些方式可以在 JavaScript 中访问环境变量？

**选项：**
- A. `process.env.NODE_ENV`
- B. `import.meta.env.VITE_API_URL`
- C. `DefinePlugin` 定义的常量
- D. `.env` 文件配合 `dotenv`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**环境变量的使用**

**A. process.env（Node.js / Webpack）**
```javascript
// Node.js 环境
console.log(process.env.NODE_ENV);  // "development" 或 "production"

// Webpack 会在构建时替换
if (process.env.NODE_ENV === 'production') {
  console.log('生产环境');
}

// 打包后
if (true) {  // 直接替换为常量
  console.log('生产环境');
}
```

**B. import.meta.env（Vite）**
```javascript
// Vite 环境变量
console.log(import.meta.env.MODE);          // "development" 或 "production"
console.log(import.meta.env.VITE_API_URL);  // 自定义变量（必须 VITE_ 前缀）

// .env 文件
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

**C. DefinePlugin**
```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'API_URL': JSON.stringify('https://api.example.com'),
      'VERSION': JSON.stringify('1.0.0')
    })
  ]
};

// 代码中使用
console.log(API_URL);  // "https://api.example.com"
console.log(VERSION);  // "1.0.0"
```

**D. dotenv**
```javascript
// .env
NODE_ENV=development
API_URL=https://api.example.com
DB_HOST=localhost

// webpack.config.js
require('dotenv').config();

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL)
    })
  ]
};

// 或使用 dotenv-webpack
const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv()
  ]
};
```

**不同环境的配置：**
```
.env                # 所有环境
.env.local          # 本地覆盖（git 忽略）
.env.development    # 开发环境
.env.production     # 生产环境
```

**加载优先级：**
```
.env.production.local
.env.production
.env.local
.env
```

**React 中使用：**
```javascript
// Create React App
// .env
REACT_APP_API_URL=https://api.example.com

// 代码中
console.log(process.env.REACT_APP_API_URL);
```

**Vue 中使用：**
```javascript
// Vue CLI
// .env
VUE_APP_API_URL=https://api.example.com

// 代码中
console.log(process.env.VUE_APP_API_URL);
```

**安全注意：**
```javascript
// ❌ 不要在前端暴露敏感信息
PRIVATE_KEY=xxx        // 危险！
DATABASE_PASSWORD=xxx  // 危险！

// ✅ 只暴露公开信息
PUBLIC_API_URL=xxx     // 安全
APP_VERSION=xxx        // 安全
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** Webpack Plugin

### 题目

实现一个简单的 Webpack Plugin，在构建完成后输出打包信息。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**自定义 Webpack Plugin**

```javascript
class BuildInfoPlugin {
  constructor(options = {}) {
    this.options = options;
  }
  
  apply(compiler) {
    const pluginName = 'BuildInfoPlugin';
    
    // 编译开始
    compiler.hooks.compile.tap(pluginName, () => {
      console.log('🔨 开始编译...');
    });
    
    // 编译完成
    compiler.hooks.done.tap(pluginName, (stats) => {
      const { time, assets, errors, warnings } = stats.toJson({
        all: false,
        time: true,
        assets: true,
        errors: true,
        warnings: true
      });
      
      console.log('\n📦 构建完成！');
      console.log(`⏱️  耗时: ${time}ms`);
      console.log(`📄 文件数: ${Object.keys(assets).length}`);
      
      // 输出文件信息
      console.log('\n文件列表:');
      Object.entries(assets).forEach(([name, asset]) => {
        const size = this.formatSize(asset.size);
        console.log(`  ${name} - ${size}`);
      });
      
      // 错误和警告
      if (errors.length > 0) {
        console.log(`\n❌ 错误: ${errors.length}`);
        errors.forEach(err => console.error(err.message));
      }
      
      if (warnings.length > 0) {
        console.log(`\n⚠️  警告: ${warnings.length}`);
        warnings.forEach(warn => console.warn(warn.message));
      }
    });
    
    // 生成资源前
    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      // 在输出目录生成构建信息文件
      const buildInfo = {
        time: new Date().toISOString(),
        files: Object.keys(compilation.assets),
        hash: compilation.hash
      };
      
      const content = JSON.stringify(buildInfo, null, 2);
      
      // 添加到输出资源
      compilation.assets['build-info.json'] = {
        source: () => content,
        size: () => content.length
      };
      
      callback();
    });
  }
  
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = BuildInfoPlugin;

// 使用
// webpack.config.js
const BuildInfoPlugin = require('./BuildInfoPlugin');

module.exports = {
  plugins: [
    new BuildInfoPlugin()
  ]
};
```

**更多 Hook 示例：**

**1. 文件压缩 Plugin**
```javascript
const { RawSource } = require('webpack-sources');
const zlib = require('zlib');

class CompressionPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('CompressionPlugin', (compilation, callback) => {
      Object.keys(compilation.assets).forEach(filename => {
        if (/\.(js|css)$/.test(filename)) {
          const asset = compilation.assets[filename];
          const content = asset.source();
          
          // gzip 压缩
          const compressed = zlib.gzipSync(content);
          
          // 添加 .gz 文件
          compilation.assets[`${filename}.gz`] = new RawSource(compressed);
        }
      });
      
      callback();
    });
  }
}
```

**2. 清理注释 Plugin**
```javascript
class RemoveCommentsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('RemoveCommentsPlugin', (compilation) => {
      Object.keys(compilation.assets).forEach(filename => {
        if (/\.js$/.test(filename)) {
          const asset = compilation.assets[filename];
          const content = asset.source();
          
          // 移除注释
          const cleaned = content
            .replace(/\/\*[\s\S]*?\*\//g, '')  // 块注释
            .replace(/\/\/.*/g, '');            // 行注释
          
          compilation.assets[filename] = {
            source: () => cleaned,
            size: () => cleaned.length
          };
        }
      });
    });
  }
}
```

**3. 上传 CDN Plugin**
```javascript
class UploadCDNPlugin {
  constructor(options) {
    this.options = options;
  }
  
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('UploadCDNPlugin', async (compilation, callback) => {
      const assets = Object.keys(compilation.assets);
      
      console.log('📤 上传文件到 CDN...');
      
      for (const filename of assets) {
        const filePath = path.join(compilation.outputOptions.path, filename);
        await this.uploadFile(filePath, filename);
      }
      
      console.log('✅ 上传完成！');
      callback();
    });
  }
  
  async uploadFile(filePath, filename) {
    // 上传逻辑
    console.log(`  上传: ${filename}`);
  }
}
```

**常用 Hooks：**
```javascript
// 编译阶段
compiler.hooks.compile        // 编译开始前
compiler.hooks.compilation    // 创建 compilation 对象
compiler.hooks.make           // 完成一次编译

// 输出阶段
compiler.hooks.emit          // 生成资源到输出目录前
compiler.hooks.afterEmit     // 生成资源到输出目录后
compiler.hooks.done          // 完成编译

// 监听模式
compiler.hooks.watchRun      // 监听模式下，开始编译
compiler.hooks.watchClose    // 监听模式停止

// Compilation Hooks
compilation.hooks.buildModule      // 构建模块前
compilation.hooks.finishModules    // 所有模块构建完成
compilation.hooks.optimize         // 优化阶段开始
compilation.hooks.optimizeAssets   // 优化资源
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** Vite 原理

### 题目

Vite 在开发模式下为什么比 Webpack 快？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Vite vs Webpack 开发模式对比**

**Webpack（Bundle-based）：**
```
1. 启动开发服务器
2. 扫描所有依赖
3. 构建整个应用 bundle
4. 启动完成（慢）
5. 浏览器加载 bundle

每次修改：
1. 重新构建相关模块
2. HMR 更新
```

**Vite（No-bundle / ESM-based）：**
```
1. 启动开发服务器（立即）
2. 预构建依赖（esbuild，快）
3. 按需编译（只编译请求的文件）

每次修改：
1. 只编译修改的文件
2. HMR 更新（极快）
```

**关键技术：**

**1. 原生 ESM**
```html
<!-- Vite 开发模式 -->
<script type="module">
  import { createApp } from '/node_modules/vue/dist/vue.esm-browser.js'
  import App from '/src/App.vue'
  
  createApp(App).mount('#app')
</script>
```

**2. esbuild 预构建**
```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['vue', 'react'],  // 预构建依赖
    exclude: ['local-package']   // 排除
  }
};
```

**3. 按需编译**
```javascript
// 浏览器请求 /src/App.vue
// Vite 实时编译：
// 1. 解析 .vue 文件
// 2. 转换为 JS
// 3. 返回给浏览器

// 未请求的文件不会编译
```

**4. 智能缓存**
```javascript
// 依赖缓存（node_modules）
// 强缓存，几乎不会变化

// 源码缓存（src）
// 协商缓存，304 响应
```

**性能对比：**
```
项目启动：
Webpack: 30-60s
Vite:    1-2s

HMR 更新：
Webpack: 500-1000ms
Vite:    50-100ms
```

**Vite 的限制：**
```javascript
// ❌ 不支持 CommonJS
const module = require('./module');  // 错误

// ✅ 必须使用 ESM
import module from './module.js';

// ❌ 动态导入路径必须是静态的
const module = await import(variablePath);  // 可能失败

// ✅ 使用模式匹配
const modules = import.meta.glob('./modules/*.js');
```

**生产构建：**
```javascript
// Vite 生产模式使用 Rollup
// 不使用 esbuild，因为：
// 1. Rollup 的 Tree Shaking 更好
// 2. Rollup 的代码分割更灵活
// 3. Rollup 的插件生态更成熟

// vite build
// 使用 Rollup 打包
```

**配置示例：**
```javascript
// vite.config.js
export default {
  server: {
    port: 3000,
    hmr: true,
    fs: {
      strict: false  // 允许访问项目外文件
    }
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  },
  optimizeDeps: {
    entries: ['src/main.js'],
    include: ['vue']
  }
};
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 前端工程化

### 题目

一个完整的前端工程化方案应该包含哪些内容？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**前端工程化体系**

**1. 代码规范**
```json
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error'
  }
};

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}

// .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
```

**2. Git 工作流**
```bash
# Git Hooks（husky）
# .husky/pre-commit
npm run lint
npm run test

# .husky/commit-msg
npx commitlint --edit $1

# commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style',
      'refactor', 'test', 'chore'
    ]]
  }
};

# 提交格式
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复表单验证bug"
```

**3. 构建工具**
```javascript
// Webpack / Vite / Rollup
// 开发服务器、HMR、代码分割、压缩等

// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**4. 测试**
```javascript
// 单元测试（Jest / Vitest）
describe('utils', () => {
  test('add', () => {
    expect(add(1, 2)).toBe(3);
  });
});

// E2E 测试（Cypress / Playwright）
describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-test="username"]').type('admin');
    cy.get('[data-test="password"]').type('password');
    cy.get('[data-test="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

**5. CI/CD**
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**6. 监控与日志**
```javascript
// Sentry 错误监控
import * as Sentry from '@sentry/vue';

Sentry.init({
  dsn: 'your-dsn',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0
});

// 性能监控
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(entry.name, entry.duration);
  });
});

observer.observe({ entryTypes: ['navigation', 'resource'] });
```

**7. 文档**
```javascript
// VitePress / VuePress / Docusaurus
// docs/README.md
# 项目文档

## 快速开始
npm install
npm run dev

## 项目结构
src/
  components/  # 组件
  views/       # 页面
  utils/       # 工具函数
```

**8. 组件库**
```javascript
// Storybook
// Button.stories.js
export default {
  title: 'Components/Button',
  component: Button
};

export const Primary = () => ({
  components: { Button },
  template: '<Button type="primary">按钮</Button>'
});
```

**9. 包管理**
```json
// package.json
{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "dependencies": {},
  "devDependencies": {},
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}

// Monorepo（pnpm / Turborepo）
packages/
  ui/
  utils/
  app/
```

**10. 性能优化**
```javascript
// 代码分割
const Home = () => import('./views/Home.vue');

// 图片优化
import imageUrl from './image.png?w=200&format=webp';

// 预加载
<link rel="preload" href="/critical.css" as="style">
<link rel="prefetch" href="/lazy.js">

// CDN
externals: {
  vue: 'Vue',
  'vue-router': 'VueRouter'
}
```

**完整工作流：**
```
开发 → 提交 → 推送
  ↓      ↓      ↓
编码   Lint   CI/CD
  ↓    Check    ↓
测试    ↓     构建
  ↓   Commit   ↓
构建    Msg   部署
  ↓            ↓
预览         监控
```

</details>

---

**本章总结：**
- ✅ Babel 转译
- ✅ Loader vs Plugin
- ✅ 代码分割
- ✅ Tree Shaking
- ✅ HMR 原理
- ✅ 构建优化
- ✅ 环境变量
- ✅ 自定义 Plugin
- ✅ Vite 原理
- ✅ 工程化体系

**进阶篇完成！下一步：** [第 14 章：执行上下文与作用域链](./chapter-14.md)
