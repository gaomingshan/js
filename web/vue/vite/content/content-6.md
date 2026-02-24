# 静态资源处理

## 概述

Vite 提供了强大的静态资源处理能力，支持多种导入方式和优化策略。本章介绍如何在 Vite 项目中处理 CSS、图片、字体、JSON 等各类静态资源。

## 资源导入方式

### 1. URL 导入（默认）

```javascript
// 导入为 URL
import imgUrl from './logo.png'

// imgUrl 的值：'/src/assets/logo.png'（开发环境）
// imgUrl 的值：'/assets/logo.abc123.png'（生产环境，带 hash）

// 使用
<img :src="imgUrl" alt="logo" />
```

### 2. 显式 URL 导入

```javascript
// 强制作为 URL 导入
import logoUrl from './logo.png?url'
```

### 3. 原始内容导入

```javascript
// 导入为字符串
import svgContent from './icon.svg?raw'

// svgContent 的值：'<svg>...</svg>'（SVG 源码）

// 使用
<div v-html="svgContent"></div>
```

### 4. 内联导入

```javascript
// 小文件内联为 base64
import logoBase64 from './logo.png?inline'

// logoBase64: 'data:image/png;base64,iVBORw0KG...'
```

## CSS 处理

### 基础 CSS

```javascript
// main.js
import './style.css'

// style.css
body {
  margin: 0;
  padding: 0;
}
```

**开发环境**：CSS 被注入为 `<style>` 标签  
**生产环境**：CSS 被提取为独立的 `.css` 文件

### CSS Modules

```css
/* button.module.css */
.button {
  background: blue;
  color: white;
}

.primary {
  background: green;
}
```

```javascript
// 导入 CSS Modules
import styles from './button.module.css'

// styles 对象：
// {
//   button: '_button_abc123',
//   primary: '_primary_def456'
// }

// Vue 使用
<template>
  <button :class="styles.button">按钮</button>
</template>

// React 使用
<button className={styles.button}>按钮</button>
```

### PostCSS

Vite 自动应用 PostCSS（如果有配置文件）：

```javascript
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    'postcss-nested': {},
  }
}
```

```css
/* 源码 */
.container {
  display: flex;
  
  .item {
    flex: 1;
  }
}

/* 编译后自动添加前缀和处理嵌套 */
.container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.container .item {
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
}
```

### CSS 预处理器

安装对应的预处理器即可直接使用：

```bash
# Sass
npm install -D sass

# Less
npm install -D less

# Stylus
npm install -D stylus
```

```vue
<style lang="scss">
$primary-color: #409eff;

.button {
  background: $primary-color;
  
  &:hover {
    background: darken($primary-color, 10%);
  }
}
</style>
```

### CSS 代码分割

Vite 会自动进行 CSS 代码分割：

```javascript
// 异步组件的 CSS 也会异步加载
const AsyncComponent = () => import('./AsyncComponent.vue')

// 生成的文件：
// AsyncComponent.xxx.js
// AsyncComponent.xxx.css（自动加载）
```

## 图片与字体资源

### 图片导入

```javascript
// 小于 4KB：内联为 base64
import smallIcon from './icon.png'  
// 'data:image/png;base64,...'

// 大于 4KB：生成独立文件
import largeLogo from './logo.png'  
// '/assets/logo.abc123.png'
```

**自定义阈值**：
```javascript
// vite.config.js
export default {
  build: {
    assetsInlineLimit: 8192  // 8KB（默认 4KB）
  }
}
```

### 图片优化

```javascript
// 使用查询参数控制
import logo from './logo.png?w=200'  // 宽度 200px
import thumb from './photo.jpg?format=webp'  // 转换为 webp
```

需要配合插件使用：
```bash
npm install -D vite-plugin-image-optimizer
```

```javascript
import imageOptimizer from 'vite-plugin-image-optimizer'

export default {
  plugins: [imageOptimizer()]
}
```

### 字体文件

```css
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/MyFont.woff2') format('woff2'),
       url('./fonts/MyFont.woff') format('woff');
}

body {
  font-family: 'MyFont', sans-serif;
}
```

字体文件会被复制到 `assets/` 目录，文件名带 hash。

### SVG 处理

```javascript
// 方式1：作为 URL
import svgUrl from './icon.svg'
<img :src="svgUrl" />

// 方式2：作为组件（需要插件）
import IconComponent from './icon.svg?component'
<IconComponent />

// 方式3：作为原始内容
import svgRaw from './icon.svg?raw'
<div v-html="svgRaw"></div>
```

安装 SVG 组件插件：
```bash
npm install -D vite-svg-loader
```

```javascript
import svgLoader from 'vite-svg-loader'

export default {
  plugins: [svgLoader()]
}
```

## JSON 与其他格式

### JSON 导入

```javascript
// 导入整个 JSON
import data from './data.json'

// 命名导入（Tree Shaking）
import { version } from './package.json'
```

### WebAssembly

```javascript
// 导入 .wasm 文件
import init from './module.wasm?init'

// 初始化
init().then((module) => {
  module.exports.add(1, 2)
})
```

### Worker

```javascript
// 导入为 Web Worker
import MyWorker from './worker?worker'

const worker = new MyWorker()
worker.postMessage('hello')
```

## public 目录处理

`public` 目录中的资源不会被构建处理：

```
public/
├── favicon.ico
├── robots.txt
└── static/
    └── data.json
```

**引用方式**：
```html
<!-- 使用绝对路径，不需要 import -->
<link rel="icon" href="/favicon.ico">
<img src="/static/logo.png">
```

**注意事项**：
- public 中的文件直接复制到输出目录根部
- 不会经过构建处理（无 hash、无压缩）
- 适合不需要处理的静态资源

## 资源优化配置

### 资源内联

```javascript
// vite.config.js
export default {
  build: {
    assetsInlineLimit: 4096,  // 小于 4KB 内联
    
    // 自定义内联逻辑
    assetsInlineLimit: (filePath, content) => {
      // SVG 总是内联
      if (filePath.endsWith('.svg')) {
        return true
      }
      // 其他文件按大小判断
      return content.length < 4096
    }
  }
}
```

### 资源输出目录

```javascript
export default {
  build: {
    assetsDir: 'static',  // 默认 'assets'
    
    // 自定义文件名
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 图片放到 images 目录
          if (/\.(png|jpe?g|gif|svg)$/i.test(assetInfo.name)) {
            return 'images/[name].[hash][extname]'
          }
          // 字体放到 fonts 目录
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'fonts/[name].[hash][extname]'
          }
          // 其他资源
          return 'assets/[name].[hash][extname]'
        }
      }
    }
  }
}
```

### CSS 代码分割

```javascript
export default {
  build: {
    cssCodeSplit: true,  // 启用 CSS 代码分割（默认）
    
    // 或全部打包到一个文件
    cssCodeSplit: false,
  }
}
```

### 资源压缩

```javascript
export default {
  build: {
    // 压缩选项
    minify: 'terser',  // 或 'esbuild'
    
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console
        drop_debugger: true,
      }
    }
  }
}
```

## 实战示例

### 示例1：响应式图片

```vue
<template>
  <picture>
    <source 
      :srcset="imageWebp" 
      type="image/webp"
    />
    <img 
      :src="imagePng" 
      alt="responsive"
    />
  </picture>
</template>

<script setup>
import imagePng from '@/assets/photo.png'
import imageWebp from '@/assets/photo.webp'
</script>
```

### 示例2：动态图片导入

```vue
<template>
  <img :src="getImageUrl(imageName)" />
</template>

<script setup>
const imageName = 'logo.png'

// 使用 import.meta.glob 批量导入
const images = import.meta.glob('@/assets/*.png', { 
  eager: true,
  import: 'default'
})

function getImageUrl(name) {
  return images[`/src/assets/${name}`]
}
</script>
```

### 示例3：字体优化

```css
/* 字体预加载 */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/MyFont.woff2') format('woff2');
  font-display: swap;  /* 字体加载时使用系统字体 */
}

/* 字体子集化（仅包含需要的字符） */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/MyFont-subset.woff2') format('woff2');
  unicode-range: U+0020-007F;  /* 基础拉丁字符 */
}
```

## 常见问题

### 1. 资源路径 404

```javascript
// ❌ 错误：使用字符串拼接
const imgUrl = '@/assets/' + imageName + '.png'

// ✅ 正确：使用 import.meta.glob
const images = import.meta.glob('@/assets/*.png', { eager: true })
```

### 2. public 资源找不到

```html
<!-- ❌ 错误：使用相对路径 -->
<img src="./favicon.ico">

<!-- ✅ 正确：使用绝对路径 -->
<img src="/favicon.ico">
```

### 3. CSS 未生效

检查导入顺序：
```javascript
// ✅ 正确顺序
import 'normalize.css'  // 第三方样式
import './global.css'   // 全局样式
import './component.css'  // 组件样式
```

## 参考资料

- [Vite 静态资源处理](https://cn.vitejs.dev/guide/assets.html)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [PostCSS](https://postcss.org/)
