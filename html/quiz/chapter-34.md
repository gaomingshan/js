# 第 34 章：构建工具 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 构建工具作用
### 题目
前端构建工具的作用？**（多选）**

**A.** 代码压缩 | **B.** 模块打包 | **C.** 代码转换 | **D.** 热更新

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
**来源：** 构建工具概念
</details>

---

## 第 2 题 🟢 | 常见工具
### 题目
常见的构建工具？**（多选）**

**A.** Webpack | **B.** Vite | **C.** Rollup | **D.** Parcel

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
**来源：** 构建工具对比
</details>

---

## 第 3 题 🟢 | npm scripts
### 题目
使用 npm scripts 构建。

<details><summary>查看答案</summary>
### ✅ 答案
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "test": "jest"
  }
}
```
```bash
npm run dev
npm run build
```
**来源：** npm scripts
</details>

---

## 第 4 题 🟡 | Webpack 配置
### 题目
基础 Webpack 配置。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  
  devServer: {
    port: 3000,
    hot: true
  }
};
```
**来源：** Webpack
</details>

---

## 第 5 题 🟡 | Vite
### 题目
Vite 的优势？

<details><summary>查看答案</summary>
### ✅ 答案
- **快速冷启动**：ESM 原生支持
- **即时热更新**：精准 HMR
- **按需编译**：只编译当前页面
- **生产优化**：Rollup 打包

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  }
});
```
**来源：** Vite
</details>

---

## 第 6 题 🟡 | 代码分割
### 题目
实现代码分割。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// Webpack
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
          name: 'common',
          priority: 5
        }
      }
    }
  }
};

// 动态导入
const module = await import('./module.js');
```
**来源：** Code Splitting
</details>

---

## 第 7 题 🟡 | Tree Shaking
### 题目
什么是 Tree Shaking？

<details><summary>查看答案</summary>
### ✅ 答案
移除未使用的代码

```javascript
// utils.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// main.js
import { add } from './utils.js';
console.log(add(1, 2));

// 打包后：subtract 被移除
```

**配置：**
```json
{
  "sideEffects": false
}
```
**来源：** Tree Shaking
</details>

---

## 第 8 题 🔴 | 优化配置
### 题目
生产环境优化配置。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// webpack.prod.js
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
    
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    },
    
    runtimeChunk: 'single'
  },
  
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip'
    })
  ],
  
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 250000,
    hints: 'warning'
  }
};
```
**来源：** Webpack 优化
</details>

---

## 第 9 题 🔴 | 自定义 Plugin
### 题目
编写 Webpack Plugin。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
class FileListPlugin {
  constructor(options) {
    this.filename = options.filename || 'filelist.md';
  }
  
  apply(compiler) {
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      let filelist = '# 构建文件列表\n\n';
      
      for (let filename in compilation.assets) {
        filelist += `- ${filename}\n`;
      }
      
      compilation.assets[this.filename] = {
        source: () => filelist,
        size: () => filelist.length
      };
      
      callback();
    });
  }
}

module.exports = FileListPlugin;

// 使用
plugins: [
  new FileListPlugin({ filename: 'files.md' })
]
```
**来源：** Webpack Plugin
</details>

---

## 第 10 题 🔴 | Monorepo
### 题目
Monorepo 的构建方案？

<details><summary>查看答案</summary>
### ✅ 答案

**结构：**
```
monorepo/
├── packages/
│   ├── app1/
│   ├── app2/
│   └── shared/
├── package.json
└── pnpm-workspace.yaml
```

**pnpm-workspace.yaml：**
```yaml
packages:
  - 'packages/*'
```

**package.json：**
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

**turbo.json：**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

**来源：** Monorepo
</details>

---

**📌 本章总结**
- 构建工具：Webpack, Vite, Rollup, Parcel
- 功能：压缩、打包、转换、热更新
- 代码分割：提升性能
- Tree Shaking：移除未使用代码
- 生产优化：压缩、分包、缓存
- 自定义：Loader, Plugin
- Monorepo：多包管理

**上一章** ← [第 33 章：HTML模板引擎](./chapter-33.md)  
**下一章** → [第 35 章：测试](./chapter-35.md)
