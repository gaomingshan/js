# 第 34 章：构建工具

## 概述

现代前端开发离不开构建工具，它们处理代码转换、压缩、打包等任务。

## 一、常见构建工具

### 1.1 Webpack

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'html-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

### 1.2 Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: 'terser'
  }
})
```

### 1.3 Parcel

```bash
# 零配置
parcel index.html
```

## 二、HTML 处理

### 2.1 压缩

```javascript
// html-minifier
const minify = require('html-minifier').minify;

const result = minify(html, {
  collapseWhitespace: true,
  removeComments: true,
  minifyJS: true,
  minifyCSS: true
});
```

### 2.2 模板处理

```javascript
// html-webpack-plugin
new HtmlWebpackPlugin({
  template: './src/index.html',
  minify: {
    collapseWhitespace: true,
    removeComments: true
  }
})
```

## 三、开发服务器

```javascript
// webpack-dev-server
devServer: {
  static: './dist',
  hot: true,
  port: 3000
}

// vite
npm run dev
```

## 参考资料

- [Webpack](https://webpack.js.org/)
- [Vite](https://vitejs.dev/)
- [Parcel](https://parceljs.org/)

---

**上一章** ← [第 33 章：HTML 模板引擎](./33-template-engines.md)  
**下一章** → [第 35 章：测试](./35-testing.md)
