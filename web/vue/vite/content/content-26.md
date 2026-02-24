# 项目迁移指南

## 概述

本章提供从 Webpack、Vue CLI、Create React App 等工具迁移到 Vite 的完整指南，包括配置映射、插件替代、常见问题等内容。

## 从 Webpack 迁移

### 迁移步骤

**1. 安装 Vite**：
```bash
npm install -D vite @vitejs/plugin-vue
# 或
npm install -D vite @vitejs/plugin-react
```

**2. 创建 vite.config.js**：
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

**3. 修改 HTML 入口**：
```html
<!-- Webpack -->
<!-- public/index.html -->
<div id="app"></div>
<!-- 脚本由 Webpack 自动注入 -->

<!-- Vite -->
<!-- index.html（移到根目录） -->
<!DOCTYPE html>
<html>
  <head>
    <title>App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**4. 更新 package.json**：
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 配置映射对照表

| Webpack | Vite |
|---------|------|
| `entry` | `build.rollupOptions.input` |
| `output.path` | `build.outDir` |
| `output.publicPath` | `base` |
| `resolve.alias` | `resolve.alias` |
| `devServer.port` | `server.port` |
| `devServer.proxy` | `server.proxy` |
| `module.rules` (loader) | 插件或内置支持 |
| `plugins` | `plugins` |
| `optimization.splitChunks` | `build.rollupOptions.output.manualChunks` |

### Webpack Loader 替代

**1. babel-loader**：
```javascript
// Webpack
module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader'
      }
    ]
  }
}

// Vite - 内置支持，无需配置
// 或自定义
export default {
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
}
```

**2. css-loader + style-loader**：
```javascript
// Webpack
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader']
}

// Vite - 内置支持
// 直接 import './style.css'
```

**3. sass-loader**：
```bash
# Webpack
npm install -D sass-loader sass

# Vite
npm install -D sass
# 直接使用，无需配置
```

**4. file-loader / url-loader**：
```javascript
// Webpack
{
  test: /\.(png|jpg|gif)$/,
  use: 'file-loader'
}

// Vite - 内置支持
import logo from './logo.png'  // 自动处理
```

**5. vue-loader**：
```javascript
// Webpack
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  module: {
    rules: [{ test: /\.vue$/, use: 'vue-loader' }]
  },
  plugins: [new VueLoaderPlugin()]
}

// Vite
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vue()]
}
```

### Webpack Plugin 替代

**1. HtmlWebpackPlugin**：
```javascript
// Webpack
new HtmlWebpackPlugin({
  template: 'public/index.html'
})

// Vite - 内置支持
// index.html 作为入口
```

**2. DefinePlugin**：
```javascript
// Webpack
new webpack.DefinePlugin({
  'process.env.API_URL': JSON.stringify('https://api.example.com')
})

// Vite
export default {
  define: {
    'process.env.API_URL': JSON.stringify('https://api.example.com')
  }
}
```

**3. CopyWebpackPlugin**：
```javascript
// Webpack
new CopyWebpackPlugin({
  patterns: [{ from: 'public', to: 'dist' }]
})

// Vite - 使用 public 目录
// public/ 中的文件自动复制到输出目录
```

**4. MiniCssExtractPlugin**：
```javascript
// Webpack
new MiniCssExtractPlugin({
  filename: 'css/[name].[contenthash].css'
})

// Vite - 内置支持
export default {
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'css/[name].[hash][extname]'
      }
    }
  }
}
```

## 从 Vue CLI 迁移

### 快速迁移

**1. 安装依赖**：
```bash
npm install -D vite @vitejs/plugin-vue
```

**2. 移动 index.html**：
```bash
# 从 public/index.html 移到根目录
mv public/index.html ./

# 修改脚本引用
<script type="module" src="/src/main.js"></script>
```

**3. 创建 vite.config.js**：
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  server: {
    port: 8080
  }
})
```

**4. 更新 package.json**：
```json
{
  "scripts": {
    "serve": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### vue.config.js 映射

```javascript
// vue.config.js → vite.config.js

// Vue CLI
module.exports = {
  publicPath: '/my-app/',
  outputDir: 'dist',
  assetsDir: 'static',
  
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000'
      }
    }
  },
  
  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve(__dirname, 'src'))
  }
}

// Vite
export default {
  base: '/my-app/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'static'
  },
  
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000'
      }
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

### 环境变量

```bash
# Vue CLI (.env)
VUE_APP_API_URL=https://api.example.com
VUE_APP_TITLE=My App

# Vite (.env)
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

```javascript
// Vue CLI
process.env.VUE_APP_API_URL

// Vite
import.meta.env.VITE_API_URL
```

## 从 CRA 迁移

### 迁移步骤

**1. 安装 Vite**：
```bash
npm install -D vite @vitejs/plugin-react
```

**2. 创建 vite.config.js**：
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    open: true
  }
})
```

**3. 移动 index.html**：
```bash
# 从 public/index.html 移到根目录
mv public/index.html ./
```

修改 HTML：
```html
<!-- CRA -->
<div id="root"></div>

<!-- Vite -->
<div id="root"></div>
<script type="module" src="/src/index.jsx"></script>
```

**4. 更新 import**：
```javascript
// CRA - 支持绝对路径
import App from 'components/App'

// Vite - 需要配置别名或使用相对路径
import App from './components/App'

// 或配置别名
// vite.config.js
export default {
  resolve: {
    alias: {
      components: '/src/components'
    }
  }
}
```

### 环境变量

```bash
# CRA (.env)
REACT_APP_API_URL=https://api.example.com

# Vite (.env)
VITE_API_URL=https://api.example.com
```

```javascript
// CRA
process.env.REACT_APP_API_URL

// Vite
import.meta.env.VITE_API_URL
```

### public 目录

```javascript
// CRA - 使用 %PUBLIC_URL%
<img src="%PUBLIC_URL%/logo.png" />

// Vite - 使用绝对路径
<img src="/logo.png" />
```

## 插件替代方案

### 常用 Webpack 插件

| Webpack 插件 | Vite 替代 |
|-------------|----------|
| `HtmlWebpackPlugin` | 内置（index.html） |
| `DefinePlugin` | `define` 配置 |
| `ProvidePlugin` | 插件或手动导入 |
| `MiniCssExtractPlugin` | 内置 |
| `CopyWebpackPlugin` | `public` 目录 |
| `CleanWebpackPlugin` | `build.emptyOutDir` |
| `CompressionPlugin` | `vite-plugin-compression` |
| `BundleAnalyzerPlugin` | `rollup-plugin-visualizer` |

### 社区插件

```bash
# 自动导入
npm install -D unplugin-auto-import

# 组件自动导入
npm install -D unplugin-vue-components

# SVG 组件
npm install -D vite-svg-loader

# 压缩
npm install -D vite-plugin-compression

# PWA
npm install -D vite-plugin-pwa
```

## 迁移常见问题

### 1. require() 不支持

```javascript
// ❌ Webpack
const config = require('./config.json')

// ✅ Vite
import config from './config.json'
```

### 2. 动态 require

```javascript
// ❌ Webpack
const component = require(`./components/${name}.vue`)

// ✅ Vite - 使用 import.meta.glob
const modules = import.meta.glob('./components/*.vue')
const component = await modules[`./components/${name}.vue`]()
```

### 3. process.env

```javascript
// ❌ Webpack
if (process.env.NODE_ENV === 'production') { }

// ✅ Vite
if (import.meta.env.PROD) { }
// 或
if (import.meta.env.MODE === 'production') { }
```

### 4. 别名配置

```javascript
// 确保 vite.config.js 和 tsconfig.json 一致

// vite.config.js
export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 5. CSS Module

```javascript
// Webpack - .module.css 或配置
import styles from './style.css'

// Vite - 必须 .module.css
import styles from './style.module.css'
```

### 6. 图片导入

```javascript
// ❌ Webpack - 可能需要 require
<img src={require('./logo.png')} />

// ✅ Vite
import logo from './logo.png'
<img src={logo} />
```

## 性能对比

### 开发环境

```
冷启动：
Webpack (Vue CLI): 15-30s
Vite:              1-3s
提升：             10-20x

热更新：
Webpack:           2-5s
Vite:              50-200ms
提升：             10-50x
```

### 生产构建

```
构建时间：
Webpack:           30-60s
Vite:              20-40s
提升：             1.5-2x

产物大小：
相近（都使用压缩和 Tree Shaking）
```

## 迁移检查清单

✅ **准备阶段**：
- [ ] 备份项目
- [ ] 了解项目依赖
- [ ] 检查 Webpack 特殊配置

✅ **迁移阶段**：
- [ ] 安装 Vite 和相关插件
- [ ] 创建 vite.config.js
- [ ] 移动并修改 index.html
- [ ] 更新 package.json scripts
- [ ] 修改环境变量（VUE_APP_ → VITE_）
- [ ] 替换 require 为 import
- [ ] 配置路径别名

✅ **测试阶段**：
- [ ] 开发环境测试
- [ ] 生产构建测试
- [ ] 功能回归测试
- [ ] 性能测试

✅ **优化阶段**：
- [ ] 配置代码分割
- [ ] 优化依赖预构建
- [ ] 配置生产环境优化

## 逐步迁移策略

### 方案1：新项目使用 Vite

```
1. 保持现有项目使用 Webpack
2. 新功能/模块使用 Vite 开发
3. 逐步将旧代码迁移到 Vite
```

### 方案2：创建并行分支

```
1. 创建 vite 分支
2. 在分支中完成迁移
3. 充分测试后合并
```

### 方案3：Monorepo 迁移

```
packages/
├── legacy-app/      # Webpack 旧应用
├── new-app/         # Vite 新应用
└── shared/          # 共享代码
```

## 回滚方案

如果迁移遇到问题：

```bash
# 1. 保留原 package.json 备份
cp package.json package.json.backup

# 2. 保留 Webpack 配置
# 不删除 webpack.config.js

# 3. 快速回滚
git checkout package.json
npm install
npm run serve  # 使用原来的命令
```

## 参考资料

- [Vite 迁移指南](https://cn.vitejs.dev/guide/migration.html)
- [从 Webpack 迁移](https://cn.vitejs.dev/guide/migration-from-v2.html)
- [Vue CLI 迁移](https://cli.vuejs.org/)
