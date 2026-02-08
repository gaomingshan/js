# webpack 项目配置实战

## 概述

webpack 的“难”通常不是难在某个选项，而是难在：

- 你要把一个真实项目拆成**可维护的配置结构**
- 你要把 Dev/Prod 的差异放在正确的位置
- 你要让产物策略可控（拆包/缓存/资源路径）

这篇给出一个**可用于生产**的配置范式：

- 多环境配置分层（common/dev/prod）
- React/TS/CSS/静态资源的主流处理方式
- 与部署相关的关键点（hash、publicPath、env 注入）

---

## 一、推荐配置结构（真实项目可维护）

```text
project/
├── package.json
├── src/
│   └── main.tsx
├── public/
│   └── index.html
├── config/
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   └── webpack.prod.js
└── scripts/
    └── build.mjs
```

### 1.1 为什么要拆分 common/dev/prod

- **common**：不随环境变化的“工程规则”（入口、alias、资源规则）
- **dev**：开发体验（devServer、source map、HMR）
- **prod**：产物策略（hash、压缩、拆包、提取 CSS）

> **关键点**
>
> 如果把所有配置堆在一个文件里，后期最常见的结果是“没人敢改”。

---

## 二、common：描述你的工程长什么样

### 2.1 入口与输出（核心点：hash 与路径）

```js
// config/webpack.common.js
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, '../src/main.tsx'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'assets/js/[name].[contenthash:8].js',
    chunkFilename: 'assets/js/[name].[contenthash:8].chunk.js',
    publicPath: '/' // 部署在子路径时要改
  }
};
```

- `contenthash`：内容变才变名（长期缓存基础）
- `publicPath`：决定运行时 chunk 从哪里加载（最容易导致线上 404）

### 2.2 模块规则：TS/JSX、CSS、静态资源

webpack 5 推荐使用 Asset Modules（减少 url-loader/file-loader 依赖）：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 8 * 1024 } }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: { '@': path.resolve(__dirname, '../src') }
  }
};
```

> **关键点**
>
> `type: 'asset'` 会在“内联 base64”与“输出文件”之间做阈值切换。

### 2.3 HTML 入口（应用级必备）

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html')
    })
  ]
};
```

---

## 三、dev：开发体验（HMR/代理/Source Map）

```js
// config/webpack.dev.js
module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    port: 5173,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true }
    }
  }
};
```

### 3.1 为什么 devtool 不能乱选

- 开发阶段要兼顾“构建速度”和“可调试性”
- 最慢的是 `source-map`，但定位最准确
- 很多团队用 `eval-cheap-module-source-map` 作为折中

---

## 四、prod：产物策略（提取 CSS、拆包、压缩）

### 4.1 CSS 抽取（生产常用）

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  module: {
    rules: [
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }
    ]
  },
  plugins: [new MiniCssExtractPlugin({ filename: 'assets/css/[name].[contenthash:8].css' })]
};
```

### 4.2 拆包策略（长期缓存关键）

```js
module.exports = {
  optimization: {
    splitChunks: { chunks: 'all' },
    runtimeChunk: 'single'
  }
};
```

- `splitChunks`：抽离公共依赖与第三方
- `runtimeChunk`：让 runtime 更稳定，提升缓存命中率

---

## 五、环境变量：DefinePlugin 与“客户端可见性”

webpack 常用 DefinePlugin 注入常量：

```js
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      __APP_VERSION__: JSON.stringify('1.0.0'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
};
```

> **关键点**
>
> 这是“编译期替换”，不是运行时读取。注入到客户端的变量等同于公开，不能放敏感信息。

---

## 六、把它组装起来：webpack-merge

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const dev = require('./webpack.dev');
const prod = require('./webpack.prod');

module.exports = (env) => (env.production ? merge(common, prod) : merge(common, dev));
```

---

## 参考资料

- [webpack - Configuration](https://webpack.js.org/configuration/)
- [webpack - Asset Modules](https://webpack.js.org/guides/asset-modules/)
- [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)
- [MiniCssExtractPlugin](https://webpack.js.org/plugins/mini-css-extract-plugin/)
