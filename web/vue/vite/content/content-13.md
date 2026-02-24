# 常用官方插件

## 概述

Vite 官方提供了一系列高质量插件，覆盖主流框架和常见需求。本章介绍官方插件的使用、配置以及社区优秀插件推荐。

## @vitejs/plugin-vue

### 安装与配置

```bash
npm install -D @vitejs/plugin-vue
```

```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      // 配置选项
      include: [/\.vue$/],
      
      // 自定义块
      customElement: /\.ce\.vue$/,
      
      // 模板编译选项
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('my-')
        }
      },
      
      // 脚本选项
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ]
}
```

### 主要功能

**1. Vue SFC 编译**：
```vue
<template>
  <div>{{ msg }}</div>
</template>

<script setup>
import { ref } from 'vue'
const msg = ref('Hello')
</script>

<style scoped>
div { color: red; }
</style>
```

**2. 自定义块支持**：
```vue
<template>
  <div>{{ t('hello') }}</div>
</template>

<i18n>
{
  "en": { "hello": "Hello" },
  "zh": { "hello": "你好" }
}
</i18n>
```

**3. defineModel 支持**（Vue 3.4+）：
```vue
<script setup>
const modelValue = defineModel()
</script>
```

## @vitejs/plugin-react

### 安装与配置

```bash
npm install -D @vitejs/plugin-react
```

```javascript
import react from '@vitejs/plugin-react'

export default {
  plugins: [
    react({
      // Fast Refresh
      fastRefresh: true,
      
      // Babel 配置
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ]
      },
      
      // JSX 运行时
      jsxRuntime: 'automatic',  // React 17+
      
      // 开发环境注入
      jsxImportSource: '@emotion/react'
    })
  ]
}
```

### 主要功能

**1. Fast Refresh**：
```jsx
// 修改组件时保持状态
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**2. 自动 JSX 转换**：
```jsx
// 无需手动导入 React
export default function App() {
  return <h1>Hello</h1>
}
```

### @vitejs/plugin-react-swc

更快的 React 插件（使用 SWC 替代 Babel）：

```bash
npm install -D @vitejs/plugin-react-swc
```

```javascript
import react from '@vitejs/plugin-react-swc'

export default {
  plugins: [react()]
}
```

**性能对比**：
```
Babel：   编译时间 100%
SWC：     编译时间 20-30%
速度提升：3-5倍
```

## @vitejs/plugin-legacy

### 浏览器兼容性

支持旧浏览器（IE11 等）：

```bash
npm install -D @vitejs/plugin-legacy
```

```javascript
import legacy from '@vitejs/plugin-legacy'

export default {
  plugins: [
    legacy({
      // 目标浏览器
      targets: ['defaults', 'not IE 11'],
      
      // 额外的 polyfills
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      
      // 现代浏览器 polyfills
      modernPolyfills: true,
      
      // 渲染 legacy chunk
      renderLegacyChunks: true,
      
      // polyfills 模式
      polyfills: [
        'es.promise',
        'es.array.iterator'
      ]
    })
  ]
}
```

### 工作原理

生成两套代码：

```html
<!-- 现代浏览器 -->
<script type="module" src="/assets/index.js"></script>

<!-- 旧浏览器 -->
<script nomodule src="/assets/index-legacy.js"></script>
<script nomodule src="/assets/polyfills-legacy.js"></script>
```

### 自定义 Polyfills

```javascript
legacy({
  polyfills: [
    'es.promise',
    'es.symbol',
    'es.array.iterator',
    'es.object.assign'
  ],
  
  // 自定义检测
  modernPolyfills: [
    'es.global-this'
  ]
})
```

## vite-plugin-pwa

### PWA 支持

```bash
npm install -D vite-plugin-pwa
```

```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      // 注册类型
      registerType: 'autoUpdate',
      
      // Service Worker 策略
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      
      // Manifest
      manifest: {
        name: 'My App',
        short_name: 'App',
        description: 'My awesome app',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
}
```

### 功能特性

**1. 自动更新**：
```javascript
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // 提示用户更新
    if (confirm('有新版本可用，是否刷新？')) {
      updateSW()
    }
  },
  onOfflineReady() {
    console.log('应用可离线使用')
  }
})
```

**2. 离线缓存**：
```javascript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
}
```

## 社区优秀插件推荐

### 1. unplugin-auto-import

自动导入 API：

```bash
npm install -D unplugin-auto-import
```

```javascript
import AutoImport from 'unplugin-auto-import/vite'

export default {
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      }
    })
  ]
}
```

**效果**：
```javascript
// 无需手动导入
const count = ref(0)
const user = reactive({})
const router = useRouter()
```

### 2. unplugin-vue-components

组件自动导入：

```bash
npm install -D unplugin-vue-components
```

```javascript
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default {
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ]
}
```

**效果**：
```vue
<template>
  <!-- 自动导入 Element Plus 组件 -->
  <el-button>Button</el-button>
  
  <!-- 自动导入本地组件 -->
  <MyComponent />
</template>
```

### 3. vite-plugin-compression

资源压缩：

```bash
npm install -D vite-plugin-compression
```

```javascript
import compression from 'vite-plugin-compression'

export default {
  plugins: [
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,  // 10KB
      deleteOriginFile: false
    })
  ]
}
```

### 4. vite-plugin-svg-icons

SVG 雪碧图：

```bash
npm install -D vite-plugin-svg-icons
```

```javascript
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default {
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]'
    })
  ]
}
```

### 5. vite-plugin-mock

Mock 数据：

```bash
npm install -D vite-plugin-mock
```

```javascript
import { viteMockServe } from 'vite-plugin-mock'

export default {
  plugins: [
    viteMockServe({
      mockPath: 'mock',
      enable: true
    })
  ]
}
```

### 6. rollup-plugin-visualizer

构建分析：

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html'
    })
  ]
}
```

### 7. vite-plugin-imagemin

图片优化：

```bash
npm install -D vite-plugin-imagemin
```

```javascript
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false }
        ]
      }
    })
  ]
}
```

### 8. vite-plugin-html

HTML 模板：

```bash
npm install -D vite-plugin-html
```

```javascript
import { createHtmlPlugin } from 'vite-plugin-html'

export default {
  plugins: [
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'My App',
          injectScript: '<script src="./analytics.js"></script>'
        }
      }
    })
  ]
}
```

## 插件选型原则

### 1. 必要性评估

```javascript
// ✅ 需要：解决实际问题
- 自动导入（提升开发效率）
- PWA（离线支持）
- 压缩（优化性能）

// ❌ 不需要：过度使用
- 功能重复的插件
- 只使用一次的功能
- 性能开销大的插件
```

### 2. 性能影响

```javascript
// 检查插件对构建速度的影响
console.time('build')
// 构建
console.timeEnd('build')

// 逐个添加插件，测试影响
```

### 3. 维护状态

检查插件：
- ✅ 活跃维护（最近 3 个月有更新）
- ✅ 有文档和示例
- ✅ 有测试覆盖
- ⚠️ 长期未更新
- ❌ 已废弃

### 4. 社区支持

- GitHub Stars
- NPM 下载量
- Issue 响应速度
- 社区讨论活跃度

## 实战插件组合

### Vue 3 项目完整配置

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { VitePWA } from 'vite-plugin-pwa'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    
    // 自动导入
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts'
    }),
    
    // 组件自动导入
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    }),
    
    // PWA
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My Vue App',
        short_name: 'VueApp',
        theme_color: '#ffffff'
      }
    }),
    
    // Gzip 压缩
    compression({
      algorithm: 'gzip'
    })
  ]
})
```

### React 项目完整配置

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    
    // 构建分析
    visualizer({
      open: true,
      filename: 'stats.html'
    })
  ]
})
```

## 参考资料

- [Vite 官方插件](https://github.com/vitejs/vite/tree/main/packages)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)
- [Rollup 插件](https://github.com/rollup/awesome)
