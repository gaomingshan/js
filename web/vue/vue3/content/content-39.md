# Vite 构建工具

> Vite 是 Vue 3 官方推荐的现代化前端构建工具。

## 核心概念

Vite 利用浏览器原生 ES 模块支持，实现了极速的开发服务器启动和热更新。

### 为什么选择 Vite

1. **极速的服务器启动**：无需打包，即时启动
2. **快速的热更新**：基于 ESM 的 HMR
3. **按需编译**：只编译当前页面的代码
4. **开箱即用**：内置常用功能
5. **优化的构建**：基于 Rollup 的生产构建

### 安装

```bash
# 创建项目
npm create vite@latest my-vue-app -- --template vue-ts

# 或使用 pnpm
pnpm create vite my-vue-app -- --template vue-ts

# 进入项目
cd my-vue-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

## 配置文件

### 基础配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'src')
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建配置
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 500
  }
})
```

### 环境变量配置

```typescript
export default defineConfig(({ mode }) => {
  // 加载 .env 文件
  const env = loadEnv(mode, process.cwd())
  
  return {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    },
    
    server: {
      port: Number(env.VITE_PORT) || 3000
    }
  }
})
```

---

## 插件系统

### Vue 插件

```typescript
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/],
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    vueJsx()
  ]
})
```

### 自动导入

```bash
npm install -D unplugin-auto-import unplugin-vue-components
```

```typescript
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    
    // 自动导入 Vue API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts'
    }),
    
    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ]
})
```

### SVG 图标

```bash
npm install -D vite-plugin-svg-icons
```

```typescript
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
      symbolId: 'icon-[dir]-[name]'
    })
  ]
})
```

### 压缩

```bash
npm install -D vite-plugin-compression
```

```typescript
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ]
})
```

---

## 开发服务器

### HMR 配置

```typescript
export default defineConfig({
  server: {
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost'
    }
  }
})
```

### 自定义 HMR

```typescript
// src/main.ts
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 自定义更新逻辑
  })
  
  import.meta.hot.dispose(() => {
    // 清理逻辑
  })
}
```

### 代理配置

```typescript
export default defineConfig({
  server: {
    proxy: {
      // 字符串简写
      '/foo': 'http://localhost:4567',
      
      // 选项写法
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      
      // 正则表达式
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      },
      
      // WebSocket
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
})
```

---

## 构建优化

### 代码分割

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 分离第三方库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          
          // 工具库
          'utils': ['axios', 'lodash-es']
        },
        
        // 自定义 chunk 文件名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
})
```

### 依赖预构建

```typescript
export default defineConfig({
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'lodash-es'
    ],
    exclude: ['your-package-name']
  }
})
```

### 生产构建优化

```typescript
export default defineConfig({
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    
    // 启用 source map
    sourcemap: false,
    
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // 资源内联限制
    assetsInlineLimit: 4096,
    
    // chunk 大小警告限制
    chunkSizeWarningLimit: 500,
    
    // Rollup 选项
    rollupOptions: {
      output: {
        // 分离样式
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash].css'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
```

---

## CSS 处理

### CSS 预处理器

```bash
npm install -D sass
npm install -D less
npm install -D stylus
```

```typescript
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      },
      less: {
        modifyVars: {
          '@primary-color': '#1890ff'
        },
        javascriptEnabled: true
      }
    }
  }
})
```

### PostCSS

```bash
npm install -D postcss autoprefixer
```

```typescript
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        'Android >= 4.0',
        'iOS >= 8'
      ]
    },
    'postcss-pxtorem': {
      rootValue: 16,
      propList: ['*']
    }
  }
}
```

### CSS Modules

```vue
<template>
  <div :class="$style.container">
    <h1 :class="$style.title">Title</h1>
  </div>
</template>

<style module>
.container {
  padding: 20px;
}

.title {
  color: #42b983;
}
</style>
```

---

## 静态资源处理

### 导入资源

```typescript
// 导入图片
import imgUrl from './img.png'

// 导入为 URL
import imgUrl from './img.png?url'

// 导入为字符串
import imgUrl from './img.png?raw'

// 导入为 base64
import imgUrl from './img.png?inline'
```

### public 目录

```
public/
├── favicon.ico
├── robots.txt
└── images/
    └── logo.png
```

```html
<!-- 直接使用绝对路径 -->
<img src="/images/logo.png" alt="Logo">
```

### JSON 导入

```typescript
// 导入整个 JSON
import json from './data.json'

// 具名导入
import { field } from './data.json'
```

---

## 环境变量

### .env 文件

```bash
# .env
VITE_APP_TITLE=My App

# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.example.com
```

### 使用环境变量

```typescript
// TypeScript 类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 使用
const apiUrl = import.meta.env.VITE_API_URL
const title = import.meta.env.VITE_APP_TITLE
```

---

## 多页面应用

```typescript
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
})
```

---

## 库模式

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

---

## 性能分析

### 构建分析

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

### 开发时性能

```typescript
export default defineConfig({
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/components/**/*.vue',
        './src/utils/**/*.ts'
      ]
    }
  }
})
```

---

## 常用插件推荐

```bash
# 自动导入
npm install -D unplugin-auto-import unplugin-vue-components

# SVG 图标
npm install -D vite-plugin-svg-icons

# 压缩
npm install -D vite-plugin-compression

# PWA
npm install -D vite-plugin-pwa

# 图片优化
npm install -D vite-plugin-imagemin

# Markdown
npm install -D vite-plugin-md

# Mock
npm install -D vite-plugin-mock
```

---

## 最佳实践

1. **合理配置别名**：简化导入路径
2. **代码分割**：按需加载，减小首屏体积
3. **预构建优化**：指定需要预构建的依赖
4. **环境变量**：区分开发和生产环境
5. **资源优化**：压缩图片、代码
6. **缓存策略**：合理的文件命名和缓存
7. **性能监控**：使用分析工具
8. **插件选择**：只安装必要的插件

---

## Vite vs Webpack

| 特性 | Vite | Webpack |
|------|------|---------|
| 启动速度 | 极快 | 较慢 |
| HMR | 极快 | 较快 |
| 构建速度 | 快 | 中等 |
| 配置复杂度 | 简单 | 复杂 |
| 生态 | 新兴 | 成熟 |
| 浏览器支持 | 现代浏览器 | 广泛 |

---

## 参考资料

- [Vite 官方文档](https://vitejs.dev/)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)
- [Vite 插件开发](https://vitejs.dev/guide/api-plugin.html)
