# 性能优化与按需引入

## 概述

本章介绍 Element Plus 的性能优化方案，包括按需引入、Tree Shaking、代码分割等技术，减少打包体积，提升应用性能。

## 核心优化方案

### 1. 按需引入

只引入使用的组件，减少打包体积。

### 2. 自动按需引入

使用 `unplugin-vue-components` 和 `unplugin-auto-import` 自动按需引入。

### 3. CDN 引入

生产环境使用 CDN 加速加载。

### 4. 组件懒加载

路由级别的组件懒加载。

## 完整实战方案

### 方案 1：自动按需引入（推荐）

使用插件实现零配置按需引入。

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      // 自动导入 Vue 相关函数
      imports: ['vue', 'vue-router', 'pinia'],
      // 生成类型声明文件
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          // 自动引入修改主题色所需的样式
          importStyle: 'sass'
        })
      ],
      // 生成类型声明文件
      dts: 'src/components.d.ts'
    })
  ]
})
```

```ts
// webpack.config.js（Webpack 用户）
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  // ...
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
}
```

**使用示例：**

```vue
<template>
  <div>
    <!-- 无需手动导入，自动按需引入 -->
    <el-button type="primary">按钮</el-button>
    <el-input v-model="input" />
  </div>
</template>

<script setup lang="ts">
// 无需手动导入，自动按需引入
const input = ref('')
const message = ElMessage

const handleClick = () => {
  ElMessage.success('操作成功')
}
</script>
```

---

### 方案 2：手动按需引入

精确控制引入的组件。

```ts
// main.ts
import { createApp } from 'vue'
import {
  ElButton,
  ElInput,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-input.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'

import App from './App.vue'

const app = createApp(App)

app.component('ElButton', ElButton)
app.component('ElInput', ElInput)

// 挂载到全局
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$messageBox = ElMessageBox

app.mount('#app')
```

---

### 方案 3：CDN 引入

生产环境使用 CDN，减少打包体积。

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
    <!-- Element Plus CSS -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/element-plus/dist/index.css"
    />
  </head>
  <body>
    <div id="app"></div>
    <!-- Vue -->
    <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
    <!-- Element Plus -->
    <script src="https://cdn.jsdelivr.net/npm/element-plus"></script>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        }
      }
    }
  }
})
```

---

### 方案 4：组件懒加载

路由级别组件懒加载，减少首屏加载时间。

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/user',
    component: () => import('@/views/User.vue')
  },
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

**组件内懒加载：**

```vue
<template>
  <div>
    <el-button @click="showDialog = true">打开对话框</el-button>
    
    <!-- 条件渲染，只有打开时才加载 -->
    <template v-if="showDialog">
      <HeavyDialog v-model="showDialog" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'

const showDialog = ref(false)

// 异步组件，按需加载
const HeavyDialog = defineAsyncComponent(() =>
  import('@/components/HeavyDialog.vue')
)
</script>
```

---

### 方案 5：图标按需引入

只引入使用的图标，减少体积。

```vue
<template>
  <div>
    <el-icon><Edit /></el-icon>
    <el-icon><Delete /></el-icon>
  </div>
</template>

<script setup lang="ts">
// 只引入需要的图标
import { Edit, Delete } from '@element-plus/icons-vue'
</script>
```

**全局注册常用图标：**

```ts
// main.ts
import { createApp } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'

const app = createApp(App)

// 注册所有图标（不推荐，体积大）
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component)
// }

// 只注册常用图标（推荐）
const commonIcons = [
  'Edit',
  'Delete',
  'Search',
  'Plus',
  'Close',
  'Check'
]

commonIcons.forEach(name => {
  app.component(name, ElementPlusIconsVue[name])
})

app.mount('#app')
```

---

## 性能监控与分析

### 1. 打包体积分析

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ]
})
```

### 2. 构建性能分析

```bash
# 使用 speed-measure-webpack-plugin (Webpack)
npm install -D speed-measure-webpack-plugin

# 使用 vite-plugin-inspect (Vite)
npm install -D vite-plugin-inspect
```

```ts
// vite.config.ts
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    Inspect()
  ]
})
```

### 3. 运行时性能监控

```ts
// utils/performance.ts
export const measureComponentRender = (componentName: string) => {
  const start = performance.now()
  
  return () => {
    const end = performance.now()
    console.log(`${componentName} 渲染耗时: ${end - start}ms`)
  }
}
```

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { measureComponentRender } from '@/utils/performance'

const endMeasure = measureComponentRender('UserList')

onMounted(() => {
  endMeasure()
})
</script>
```

---

## 优化最佳实践

### 1. 生产环境优化配置

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'

export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    },
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 资源内联限制
    assetsInlineLimit: 4096,
    // CSS 代码分割
    cssCodeSplit: true,
    // 生成 sourcemap
    sourcemap: false
  },
  plugins: [
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    // Brotli 压缩
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
})
```

### 2. 图片优化

```bash
npm install -D vite-plugin-imagemin
```

```ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
})
```

### 3. 预加载关键资源

```html
<!-- index.html -->
<head>
  <!-- 预加载关键 CSS -->
  <link rel="preload" href="/assets/main.css" as="style">
  
  <!-- 预连接到 CDN -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
</head>
```

### 4. 使用 Web Workers

```ts
// workers/heavy-task.worker.ts
self.addEventListener('message', (e) => {
  const result = performHeavyCalculation(e.data)
  self.postMessage(result)
})

function performHeavyCalculation(data: any) {
  // 耗时计算
  return data
}
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import HeavyTaskWorker from '@/workers/heavy-task.worker?worker'

const result = ref(null)

const runHeavyTask = () => {
  const worker = new HeavyTaskWorker()
  
  worker.postMessage({ /* 数据 */ })
  
  worker.onmessage = (e) => {
    result.value = e.data
    worker.terminate()
  }
}
</script>
```

---

## 常见性能问题

### 1. 首屏加载慢

**原因：** 打包体积过大、未进行代码分割。

**解决方案：**
- 使用按需引入
- 路由懒加载
- CDN 加速
- 启用 Gzip/Brotli 压缩

### 2. 组件渲染卡顿

**原因：** 大数据量渲染、频繁重渲染。

**解决方案：**
- 使用虚拟列表
- `v-memo` 优化
- `computed` 缓存计算结果
- 防抖节流

### 3. 打包体积过大

**原因：** 全量引入、未 Tree Shaking。

**解决方案：**
- 自动按需引入
- 检查依赖关系
- 移除未使用的代码
- 使用打包分析工具

---

## 性能检查清单

### 开发阶段
- [ ] 使用自动按需引入插件
- [ ] 只引入需要的图标
- [ ] 合理使用 `computed` 和 `watch`
- [ ] 避免在模板中使用复杂表达式
- [ ] 使用 `v-show` 替代频繁切换的 `v-if`

### 构建阶段
- [ ] 配置代码分割
- [ ] 启用压缩（JS/CSS/图片）
- [ ] 生成 Gzip/Brotli 文件
- [ ] 分析打包体积
- [ ] 检查 sourcemap 配置

### 部署阶段
- [ ] 使用 CDN 加速
- [ ] 配置资源缓存策略
- [ ] 启用 HTTP/2 或 HTTP/3
- [ ] 配置服务端压缩
- [ ] 监控性能指标

---

## 参考资料

- [Vite 性能优化](https://vitejs.dev/guide/features.html#build-optimizations)
- [Element Plus 按需引入](https://element-plus.org/zh-CN/guide/quickstart.html#on-demand-import)
- [Web Performance 最佳实践](https://web.dev/performance/)
