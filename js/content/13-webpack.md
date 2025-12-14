# Webpack 构建流程

## 概述

Webpack 是模块打包工具：把项目中的 JS/CSS/图片等资源都视为模块，构建依赖图并输出可部署的资源文件。

理解 Webpack 的关键不是背配置，而是：

- 它如何从入口构建**依赖图**
- Loader 与 Plugin 的分工
- 如何通过拆包、缓存与压缩控制体积与性能

---

## 一、核心概念

### 1.1 Entry（入口）

```js
module.exports = {
  entry: './src/index.js'
};
```

多入口：

```js
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  }
};
```

### 1.2 Output（输出）

```js
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    path: require('path').resolve(__dirname, 'dist'),
    clean: true
  }
};
```

### 1.3 Loader（加载器）

Loader 负责“把某种资源转换成 Webpack 能理解的模块”。

```js
module.exports = {
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
};
```

> **执行顺序**
>
> `use: ['style-loader', 'css-loader', 'sass-loader']` 的执行顺序是从右到左。

### 1.4 Plugin（插件）

Plugin 负责“介入构建生命周期，在特定时机做事”（例如生成 HTML、提取 CSS、压缩）。

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })]
};
```

---

## 二、构建流程（宏观）

```text
1. 初始化参数
2. 创建 Compiler
3. 从 entry 开始解析依赖
4. 递归构建模块依赖图（Compilation）
5. 调用 loader 转换模块内容
6. 生成 chunk / asset
7. emit 输出到文件系统
```

关键词：

- **Compiler**：整个构建的总控制器
- **Compilation**：单次构建过程的上下文（模块、chunk、asset 都在这里）

---

## 三、Loader 详解

### 3.1 Loader 是什么

一个 loader 本质是一个函数：

- 输入：源代码字符串
- 输出：转换后的代码字符串（或通过回调异步输出）

### 3.2 自定义 Loader（示意）

```js
// my-loader.js
module.exports = function (source) {
  return source.replace(/console\.log/g, 'console.info');
};
```

---

## 四、Plugin 详解

### 4.1 Plugin 介入生命周期

Plugin 通过 hooks 注册回调：

```js
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('MyPlugin', (compilation) => {
      for (const filename in compilation.assets) {
        console.log('asset:', filename);
      }
    });
  }
}

module.exports = MyPlugin;
```

---

## 五、优化策略（体积与速度）

### 5.1 代码分割（Code Splitting）

- 动态导入：`import('./x')`
- SplitChunks：提取公共代码与第三方依赖

```js
module.exports = {
  optimization: {
    splitChunks: { chunks: 'all' }
  }
};
```

### 5.2 Tree Shaking

- 依赖 ESM 静态结构
- `production` 模式通常自动启用

并在 `package.json` 标注副作用：

```json
{ "sideEffects": false }
```

### 5.3 缓存优化

- `contenthash`：内容变化才变更文件名
- `cache: { type: 'filesystem' }`：构建缓存

### 5.4 并行构建

- `thread-loader`
- 压缩器的 `parallel: true`

---

## 六、开发配置

### 6.1 devServer（开发服务器）

```js
module.exports = {
  devServer: {
    port: 8080,
    hot: true,
    historyApiFallback: true,
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } }
  }
};
```

### 6.2 Source Map

开发环境更快：`eval-source-map`

生产环境更稳：`source-map`

---

## 七、生产配置

- `mode: 'production'`
- `optimization.minimize`
- 压缩 JS/CSS（Terser/CssMinimizer）
- DefinePlugin 注入环境变量

---

## 八、最佳实践

1. **开发/生产配置分离**：可维护性更好。
2. **先做分包，再做压缩**：拆包策略决定长期缓存命中率。
3. **明确 sideEffects**：否则 Tree Shaking 效果有限。
4. **用分析工具定位体积问题**：例如 bundle analyzer。

---

## 参考资料

- [Webpack 官网](https://webpack.js.org/)
- [Webpack Concepts](https://webpack.js.org/concepts/)
- [Webpack Configuration](https://webpack.js.org/configuration/)
