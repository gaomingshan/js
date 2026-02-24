# 生产构建优化

## 概述

生产构建优化直接影响应用性能和用户体验。本章介绍代码分割、Tree Shaking、资源压缩、懒加载、CDN 部署等优化技术。

## 代码分割策略

### 手动代码分割

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue 核心
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          
          // UI 库
          'ui-vendor': ['element-plus'],
          
          // 工具库
          'utils-vendor': ['axios', 'dayjs', 'lodash-es'],
          
          // 图表库
          'chart-vendor': ['echarts']
        }
      }
    }
  }
}
```

### 函数式分割

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 按包大小分割
          if (id.includes('node_modules')) {
            const match = id.match(/node_modules\/([^/]+)/)
            if (match) {
              const packageName = match[1]
              
              // 大型库单独打包
              const largePackages = ['echarts', 'monaco-editor', '@antv/g6']
              if (largePackages.some(pkg => packageName.includes(pkg))) {
                return `vendor-${packageName.replace('@', '')}`
              }
              
              // 小库合并
              return 'vendor-common'
            }
          }
          
          // 按功能模块分割
          if (id.includes('/src/views/')) {
            return 'views'
          }
          
          if (id.includes('/src/components/')) {
            return 'components'
          }
        }
      }
    }
  }
}
```

### 自动代码分割

```javascript
// 动态导入自动分割
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')

// 路由懒加载
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]
```

### 分割策略对比

```javascript
// 策略1：按类型分割（推荐）
manualChunks: {
  'vue-vendor': ['vue', 'vue-router', 'pinia'],
  'ui-vendor': ['element-plus'],
  'utils': ['axios', 'lodash-es']
}

// 策略2：按大小分割
manualChunks(id) {
  if (id.includes('echarts')) return 'large-echarts'
  if (id.includes('monaco')) return 'large-monaco'
  return 'vendor'
}

// 策略3：按路由分割
manualChunks(id) {
  if (id.includes('/admin/')) return 'admin-chunk'
  if (id.includes('/user/')) return 'user-chunk'
}
```

## Tree Shaking 优化

### 确保包支持 Tree Shaking

```json
// package.json
{
  "sideEffects": false  // 标记无副作用，支持 Tree Shaking
  
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### 使用 ES Module 导入

```javascript
// ✅ 支持 Tree Shaking
import { debounce } from 'lodash-es'

// ❌ 不支持（CommonJS）
const { debounce } = require('lodash')

// ❌ 不支持（整体导入）
import _ from 'lodash'
```

### 避免副作用导入

```javascript
// ❌ 副作用导入（整个模块被打包）
import 'library'

// ✅ 具名导入
import { function1 } from 'library'
```

### 配置优化

```javascript
export default {
  build: {
    // 启用 Tree Shaking（默认）
    minify: 'terser',
    
    terserOptions: {
      compress: {
        // 移除未使用代码
        dead_code: true,
        // 移除未使用的函数
        unused: true
      }
    }
  }
}
```

## 资源压缩配置

### JavaScript 压缩

```javascript
export default {
  build: {
    // 压缩器选择
    minify: 'terser',  // 或 'esbuild'
    
    terserOptions: {
      compress: {
        // 移除 console
        drop_console: true,
        // 移除 debugger
        drop_debugger: true,
        // 移除纯函数调用
        pure_funcs: ['console.log', 'console.info'],
        // 计算常量表达式
        evaluate: true,
        // 内联函数
        inline: 2
      },
      
      mangle: {
        // 混淆变量名
        toplevel: true,
        // 保留特定变量名
        reserved: ['$', 'exports', 'require']
      },
      
      format: {
        // 移除注释
        comments: false,
        // 美化代码（生产环境设为 false）
        beautify: false
      }
    }
  }
}
```

### CSS 压缩

```javascript
export default {
  build: {
    cssMinify: true,  // 默认启用
    
    // 或使用 lightningcss
    cssMinify: 'lightningcss'
  }
}
```

### 图片压缩

```bash
npm install -D vite-plugin-imagemin
```

```javascript
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    viteImagemin({
      // PNG 压缩
      optipng: {
        optimizationLevel: 7
      },
      
      // JPEG 压缩
      mozjpeg: {
        quality: 80
      },
      
      // SVG 压缩
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
}
```

### Gzip/Brotli 压缩

```bash
npm install -D vite-plugin-compression
```

```javascript
import compression from 'vite-plugin-compression'

export default {
  plugins: [
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,  // 10KB 以上才压缩
      deleteOriginFile: false
    }),
    
    // Brotli 压缩（更高压缩率）
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240
    })
  ]
}
```

## 懒加载与预加载

### 路由懒加载

```javascript
// router/index.js
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
]
```

### 组件懒加载

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 异步组件
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<template>
  <Suspense>
    <template #default>
      <HeavyComponent />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

### 预加载关键资源

```html
<!-- index.html -->
<head>
  <!-- 预加载关键 chunk -->
  <link rel="modulepreload" href="/assets/vendor.js">
  
  <!-- 预加载字体 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
  
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="https://api.example.com">
</head>
```

### 代码中的预加载

```javascript
// 鼠标悬停时预加载
function onMouseEnter() {
  import('./HeavyModule.js')
}

// 空闲时预加载
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    import('./LowPriorityModule.js')
  })
}
```

### 预取策略

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        // 为动态导入生成 prefetch
        inlineDynamicImports: false
      }
    }
  }
}
```

## CDN 资源处理

### 外部化大型依赖

```javascript
export default {
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
}
```

```html
<!-- index.html -->
<head>
  <!-- 从 CDN 加载 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-plus/dist/index.css">
  <script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/element-plus"></script>
</head>
```

### 配置 CDN 路径

```javascript
export default {
  build: {
    // CDN 基础路径
    base: 'https://cdn.example.com/',
    
    rollupOptions: {
      output: {
        // 文件名配置
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
}
```

### 动态 CDN 切换

```javascript
// vite.config.js
export default ({ command, mode }) => {
  const useCDN = mode === 'production'
  
  return {
    build: {
      rollupOptions: {
        external: useCDN ? ['vue', 'vue-router'] : [],
        output: {
          globals: useCDN ? {
            vue: 'Vue',
            'vue-router': 'VueRouter'
          } : {}
        }
      }
    }
  }
}
```

## 产物体积分析

### 使用 visualizer

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,              // 构建后自动打开
      gzipSize: true,          // 显示 gzip 大小
      brotliSize: true,        // 显示 brotli 大小
      filename: 'stats.html'   // 输出文件名
    })
  ]
}
```

### 分析报告解读

```
Total Size: 2.5 MB
├── vendor-vue.js (500 KB)      # Vue 核心
├── vendor-ui.js (800 KB)       # UI 库
├── vendor-utils.js (300 KB)    # 工具库
├── main.js (400 KB)            # 主代码
└── views.js (500 KB)           # 页面代码
```

**优化目标**：
- 首屏加载 < 200KB (gzip)
- 单个 chunk < 500KB
- 总体积 < 2MB

### 体积优化建议

```javascript
// 1. 找出大型依赖
// 2. 考虑替代方案
// 3. 按需加载
// 4. CDN 外部化
```

## 构建速度优化

### 1. 使用 esbuild 压缩

```javascript
export default {
  build: {
    minify: 'esbuild',  // 比 terser 快 20-40 倍
    
    // 权衡：terser 压缩率更高，esbuild 速度更快
  }
}
```

### 2. 禁用 sourcemap

```javascript
export default {
  build: {
    sourcemap: false  // 生产环境禁用
  }
}
```

### 3. 减少转译

```javascript
export default {
  build: {
    target: 'es2020',  // 现代浏览器，减少转译
    
    // 旧浏览器使用 @vitejs/plugin-legacy
  }
}
```

### 4. 并行构建

```bash
# 使用多核 CPU
vite build --parallel
```

## 实战优化方案

### Vue 3 项目完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    
    // 体积分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    
    // Gzip 压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240
    }),
    
    // Brotli 压缩
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240
    })
  ],
  
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Rollup 配置
    rollupOptions: {
      output: {
        // 文件名
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        
        // 代码分割
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'utils': ['axios', 'dayjs', 'lodash-es']
        }
      }
    },
    
    // chunk 大小警告
    chunkSizeWarningLimit: 1000,
    
    // 禁用 CSS 代码分割（小项目）
    // cssCodeSplit: false
  }
})
```

### 优化效果对比

**优化前**：
```
总体积：3.5 MB
首屏加载：1.2 MB
FCP：2.5s
TTI：4.0s
```

**优化后**：
```
总体积：1.8 MB（减少 49%）
首屏加载：400 KB（减少 67%）
FCP：1.0s（提升 60%）
TTI：1.8s（提升 55%）
```

## 优化检查清单

✅ **代码分割**：
- [ ] 配置 manualChunks
- [ ] 使用路由懒加载
- [ ] 异步组件

✅ **资源优化**：
- [ ] 启用压缩（terser/esbuild）
- [ ] 图片压缩
- [ ] Gzip/Brotli 压缩

✅ **加载优化**：
- [ ] 预加载关键资源
- [ ] CDN 外部化大型依赖
- [ ] 懒加载非关键模块

✅ **体积优化**：
- [ ] Tree Shaking
- [ ] 移除未使用代码
- [ ] 替换大型依赖

✅ **性能监控**：
- [ ] 使用 visualizer 分析
- [ ] 设置体积警告阈值
- [ ] 定期检查产物大小

## 参考资料

- [Vite 构建优化](https://cn.vitejs.dev/guide/build.html)
- [Rollup 代码分割](https://rollupjs.org/configuration-options/#output-manualchunks)
- [Web Vitals](https://web.dev/vitals/)
