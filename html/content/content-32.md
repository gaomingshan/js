# HTML 的构建与优化工具

## 核心概念

现代前端工程离不开构建工具对 HTML 的处理、优化和转换。

## Webpack 对 HTML 的处理

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
      },
      inject: 'body'
    }),
    
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
};
```

**功能**：
- 自动注入资源引用
- HTML 压缩
- 多页面生成
- 模板变量替换

## Vite 的 HTML 处理

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Vite App</title>
</head>
<body>
  <div id="app"></div>
  
  <!-- Vite 自动处理模块导入 -->
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      }
    }
  }
});
```

## HTML 的代码分割

```html
<!-- 主页面 -->
<!DOCTYPE html>
<html>
<head>
  <link rel="prefetch" href="/chunk-vendors.js">
  <link rel="prefetch" href="/chunk-page2.js">
</head>
<body>
  <div id="app"></div>
  <script src="/chunk-runtime.js"></script>
  <script src="/chunk-vendors.js"></script>
  <script src="/chunk-main.js"></script>
</body>
</html>
```

## 缓存策略

```javascript
// 使用 contenthash
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      // 自动注入带 hash 的资源
    })
  ]
};
```

```html
<!-- 生成的 HTML -->
<script src="/main.a1b2c3d4.js"></script>
<link href="/main.a1b2c3d4.css" rel="stylesheet">
```

**缓存策略**：
```
HTML: 不缓存（Cache-Control: no-cache）
JS/CSS: 长期缓存（Cache-Control: max-age=31536000）
```

**后端类比**：构建工具 ≈ 编译器 + 打包工具。

## 参考资源

- [Webpack - HTML Plugin](https://webpack.js.org/plugins/html-webpack-plugin/)
- [Vite - HTML](https://vitejs.dev/guide/features.html#html)
