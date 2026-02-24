# 快速开始

## 概述

本章节将带你从零开始创建第一个 Vite 项目，理解项目结构，掌握基本的开发和构建流程。通过实践快速体验 Vite 的核心优势。

## 创建 Vite 项目

### 使用官方脚手架

Vite 提供了开箱即用的项目模板：

```bash
# npm 6.x
npm create vite@latest my-vue-app --template vue

# npm 7+（需要额外的双横线）
npm create vite@latest my-vue-app -- --template vue

# yarn
yarn create vite my-vue-app --template vue

# pnpm
pnpm create vite my-vue-app --template vue

# bun
bunx create-vite my-vue-app --template vue
```

### 官方模板列表

| 模板 | 说明 |
|------|------|
| `vanilla` | 原生 JavaScript |
| `vanilla-ts` | 原生 TypeScript |
| `vue` | Vue 3 + JavaScript |
| `vue-ts` | Vue 3 + TypeScript |
| `react` | React + JavaScript |
| `react-ts` | React + TypeScript |
| `react-swc` | React + SWC（更快的编译器） |
| `preact` | Preact |
| `preact-ts` | Preact + TypeScript |
| `lit` | Lit |
| `lit-ts` | Lit + TypeScript |
| `svelte` | Svelte |
| `svelte-ts` | Svelte + TypeScript |
| `solid` | Solid |
| `solid-ts` | Solid + TypeScript |
| `qwik` | Qwik |
| `qwik-ts` | Qwik + TypeScript |

### 交互式创建

不指定模板，进入交互式选择：

```bash
npm create vite@latest

# 输出：
? Project name: › my-app
? Select a framework: › 
  Vanilla
❯ Vue
  React
  Preact
  Lit
  Svelte
  Solid
  Qwik
  Others

? Select a variant: › 
  JavaScript
❯ TypeScript
  Customize with create-vue
```

## 项目结构解析

### 标准 Vue 项目结构

```
my-vue-app/
├── public/              # 静态资源目录（不会被构建处理）
│   └── favicon.ico
├── src/                 # 源代码目录
│   ├── assets/          # 资源文件（会被构建处理）
│   │   └── logo.png
│   ├── components/      # 组件目录
│   │   └── HelloWorld.vue
│   ├── App.vue          # 根组件
│   ├── main.js          # 应用入口
│   └── style.css        # 全局样式
├── index.html           # HTML 入口（重要！）
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置文件
└── .gitignore
```

### 关键文件说明

#### 1. `index.html` - 项目入口

**重要差异**：Vite 中，`index.html` 是入口文件，不在 `public` 目录下。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Vue</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- type="module" 是关键 -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**设计原因**：
- Vite 将 HTML 视为源码和模块图的一部分
- 可以在 HTML 中直接引用 JavaScript 模块
- 支持多入口（多页应用）

#### 2. `src/main.js` - 应用入口

```javascript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

#### 3. `vite.config.js` - Vite 配置

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
})
```

#### 4. `package.json` - npm 脚本

```json
{
  "name": "my-vue-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",                    // 启动开发服务器
    "build": "vite build",            // 构建生产版本
    "preview": "vite preview"         // 预览生产构建
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## 开发服务器启动与访问

### 1. 安装依赖

```bash
cd my-vue-app
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

**终端输出**：
```
VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**关键信息**：
- 启动时间：234ms（极快！）
- 本地地址：`http://localhost:5173/`
- 默认端口：5173

### 3. 访问应用

打开浏览器访问 `http://localhost:5173/`，可以看到 Vue 默认页面。

### 4. 体验热更新

修改 `src/components/HelloWorld.vue`：

```vue
<template>
  <h1>Hello Vite + Vue!</h1>
  <p>修改此文本，体验即时热更新</p>
</template>
```

**保存后立即看到效果**（无需刷新页面）：
- 更新速度：50-200ms
- 保持应用状态
- 不刷新整个页面

### 5. 查看网络请求

打开浏览器开发者工具，查看 Network 面板：

```
Name                          Type        Size
/src/main.js                  module      245B
/@vite/client                 module      1.2kB
/src/App.vue                  module      632B
/src/components/HelloWorld.vue module     1.1kB
/@modules/vue                 module      156kB (预构建)
```

**观察重点**：
- 每个 `.vue` 文件作为独立模块加载
- Vue 依赖被预构建为单个文件
- 没有大的 bundle 文件

## 构建生产版本

### 1. 执行构建

```bash
npm run build
```

**终端输出**：
```
vite v5.0.0 building for production...
✓ 34 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-BxS7fK8J.css    1.23 kB │ gzip:  0.68 kB
dist/assets/index-CoFyLKvM.js   143.42 kB │ gzip: 46.13 kB
✓ built in 456ms
```

**构建结果**：
- 构建时间：456ms
- 产物位置：`dist/` 目录
- 文件名包含 hash（用于缓存）

### 2. 构建产物结构

```
dist/
├── index.html                      # HTML 入口
├── favicon.ico                     # 从 public 复制的静态资源
└── assets/                         # 所有资源
    ├── index-BxS7fK8J.css         # CSS（带 hash）
    └── index-CoFyLKvM.js          # JavaScript（带 hash）
```

### 3. 产物特点

**CSS 文件**：
- 合并所有 CSS
- 压缩处理
- 自动添加浏览器前缀（PostCSS）

**JavaScript 文件**：
- Tree Shaking（移除未使用代码）
- 代码压缩混淆
- 作用域提升

**HTML 文件**：
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Vue</title>
    <!-- 自动注入 CSS -->
    <link rel="stylesheet" crossorigin href="/assets/index-BxS7fK8J.css">
  </head>
  <body>
    <div id="app"></div>
    <!-- 自动注入 JS -->
    <script type="module" crossorigin src="/assets/index-CoFyLKvM.js"></script>
  </body>
</html>
```

## 预览生产构建

### 本地预览

```bash
npm run preview
```

**终端输出**：
```
  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**用途**：
- 在本地预览生产构建结果
- 验证构建产物是否正常
- 测试生产环境特性

**注意**：
- preview 命令启动的是静态文件服务器
- 不用于生产环境部署
- 主要用于本地测试

## 基础配置文件

### 最简配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

### 常用配置扩展

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // 插件
  plugins: [vue()],
  
  // 路径解析
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  
  // 开发服务器
  server: {
    port: 3000,           // 自定义端口
    open: true,           // 自动打开浏览器
    cors: true,           // 允许跨域
  },
  
  // 构建选项
  build: {
    outDir: 'dist',       // 输出目录
    sourcemap: false,     // 是否生成 sourcemap
  },
})
```

### 配置智能提示

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 方式1：使用 defineConfig 获得类型提示
export default defineConfig({
  plugins: [vue()],
})

// 方式2：使用 JSDoc
/** @type {import('vite').UserConfig} */
export default {
  plugins: [vue()],
}

// 方式3：使用 TypeScript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

## 常见问题

### 1. 端口被占用

```bash
# 错误信息
Port 5173 is in use, trying another one...
```

**解决方案**：
```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3000,  // 自定义端口
  },
})
```

### 2. 导入路径问题

```javascript
// ❌ 错误：使用相对路径
import App from '../../../components/App.vue'

// ✅ 正确：使用别名
import App from '@/components/App.vue'
```

配置别名：
```javascript
// vite.config.js
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
```

### 3. 无法访问开发服务器

如果需要局域网访问：

```bash
npm run dev -- --host
```

或配置：
```javascript
// vite.config.js
export default defineConfig({
  server: {
    host: '0.0.0.0',  // 监听所有地址
  },
})
```

### 4. 构建后路径错误

部署到子路径时：

```javascript
// vite.config.js
export default defineConfig({
  base: '/my-app/',  // 部署路径
})
```

## 工程实践技巧

### 1. 快速创建项目脚本

```bash
# 创建 package.json scripts
{
  "scripts": {
    "create:vue": "npm create vite@latest -- --template vue",
    "create:react": "npm create vite@latest -- --template react"
  }
}
```

### 2. 项目初始化清单

✅ 创建项目后的必做事项：
- [ ] 配置路径别名（`@`）
- [ ] 设置自定义端口（如需要）
- [ ] 配置环境变量（`.env` 文件）
- [ ] 添加 ESLint、Prettier（代码规范）
- [ ] 配置 Git（`.gitignore`）

### 3. 推荐的开发流程

```bash
# 1. 创建项目
npm create vite@latest my-app -- --template vue-ts

# 2. 进入目录
cd my-app

# 3. 安装依赖
npm install

# 4. 启动开发
npm run dev

# 5. 开发完成后构建
npm run build

# 6. 本地预览
npm run preview
```

## 下一步学习

现在你已经掌握了 Vite 的基本使用，接下来可以：
- 深入理解开发服务器原理（→ content-3.md）
- 学习依赖预构建机制（→ content-4.md）
- 掌握模块热替换（HMR）（→ content-5.md）

## 参考资料

- [Vite 快速上手](https://cn.vitejs.dev/guide/)
- [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite)
- [官方模板列表](https://github.com/vitejs/vite/tree/main/packages/create-vite)
