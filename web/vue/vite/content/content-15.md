# 多页面应用（MPA）

## 概述

Vite 原生支持多页面应用（Multi-Page Application），可以轻松构建包含多个独立页面的项目。本章介绍 MPA 配置、入口管理、共享模块优化等内容。

## MPA 配置方式

### 基础配置

```javascript
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html')
      }
    }
  }
})
```

### 项目结构

```
project/
├── index.html              # 主页
├── admin/
│   └── index.html          # 管理后台
├── mobile/
│   └── index.html          # 移动端
├── src/
│   ├── main.js             # 主页入口
│   ├── admin/
│   │   └── main.js         # 管理后台入口
│   └── mobile/
│       └── main.js         # 移动端入口
└── vite.config.js
```

### HTML 入口文件

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>主页</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>

<!-- admin/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>管理后台</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/admin/main.js"></script>
  </body>
</html>
```

## 入口文件管理

### 动态入口配置

```javascript
import { resolve } from 'path'
import { readdirSync } from 'fs'

// 自动扫描 pages 目录
function getPagesEntry() {
  const pagesDir = resolve(__dirname, 'pages')
  const pages = readdirSync(pagesDir)
  
  const entries = {}
  pages.forEach(page => {
    entries[page] = resolve(pagesDir, page, 'index.html')
  })
  
  return entries
}

export default {
  build: {
    rollupOptions: {
      input: getPagesEntry()
    }
  }
}
```

### 嵌套目录结构

```
pages/
├── main/
│   ├── index.html
│   └── main.js
├── admin/
│   ├── index.html
│   └── admin.js
└── docs/
    ├── guide/
    │   └── index.html
    └── api/
        └── index.html
```

```javascript
import { resolve } from 'path'
import glob from 'fast-glob'

export default {
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        glob.sync('pages/**/index.html').map(file => [
          file.slice(0, file.length - '/index.html'.length),
          resolve(__dirname, file)
        ])
      )
    }
  }
}
```

## 共享模块优化

### 提取公共依赖

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 所有页面共享的核心库
          'vendor-core': ['vue', 'vue-router'],
          
          // UI 组件库
          'vendor-ui': ['element-plus'],
          
          // 工具库
          'vendor-utils': ['axios', 'dayjs', 'lodash-es']
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
          // node_modules 中的包
          if (id.includes('node_modules')) {
            // 提取大型库
            if (id.includes('echarts')) {
              return 'vendor-echarts'
            }
            // 其他库合并
            return 'vendor'
          }
          
          // 共享组件
          if (id.includes('/src/components/')) {
            return 'shared-components'
          }
          
          // 共享工具
          if (id.includes('/src/utils/')) {
            return 'shared-utils'
          }
        }
      }
    }
  }
}
```

### 共享样式

```css
/* src/styles/common.css */
/* 所有页面共享的样式 */
:root {
  --primary-color: #409eff;
  --font-size: 14px;
}

body {
  margin: 0;
  font-size: var(--font-size);
}
```

```javascript
// 每个入口引入共享样式
import '../styles/common.css'
```

## 页面间路由与通信

### 页面跳转

```html
<!-- 静态链接 -->
<a href="/admin/">前往管理后台</a>
<a href="/mobile/">前往移动端</a>

<!-- JavaScript 跳转 -->
<script>
  function goToAdmin() {
    window.location.href = '/admin/'
  }
</script>
```

### 新窗口打开

```javascript
// 在新标签页打开
window.open('/admin/', '_blank')

// 带参数跳转
window.open('/admin/?userId=123', '_blank')
```

### LocalStorage 通信

```javascript
// 页面 A：写入数据
localStorage.setItem('sharedData', JSON.stringify({
  userId: 123,
  token: 'abc...'
}))
window.location.href = '/admin/'

// 页面 B：读取数据
const data = JSON.parse(localStorage.getItem('sharedData'))
console.log('用户ID:', data.userId)
```

### BroadcastChannel 通信

```javascript
// 页面 A
const channel = new BroadcastChannel('app-channel')
channel.postMessage({ type: 'user-login', userId: 123 })

// 页面 B
const channel = new BroadcastChannel('app-channel')
channel.onmessage = (event) => {
  if (event.data.type === 'user-login') {
    console.log('用户登录:', event.data.userId)
  }
}
```

### SharedWorker 通信

```javascript
// shared-worker.js
const connections = []

self.onconnect = (event) => {
  const port = event.ports[0]
  connections.push(port)
  
  port.onmessage = (e) => {
    // 广播给所有页面
    connections.forEach(conn => {
      if (conn !== port) {
        conn.postMessage(e.data)
      }
    })
  }
}

// 页面使用
const worker = new SharedWorker('/shared-worker.js')
worker.port.onmessage = (e) => {
  console.log('收到消息:', e.data)
}
worker.port.postMessage({ type: 'hello' })
```

## 构建产物结构

### 默认输出

```
dist/
├── index.html
├── admin/
│   └── index.html
├── mobile/
│   └── index.html
└── assets/
    ├── main.abc123.js
    ├── admin.def456.js
    ├── mobile.ghi789.js
    ├── vendor.jkl012.js         # 共享依赖
    └── shared-components.mno345.js
```

### 自定义输出结构

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name]/[name].[hash].js',
        chunkFileNames: 'js/chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        }
      }
    }
  }
}
```

**产物结构**：
```
dist/
├── index.html
├── admin/
│   └── index.html
├── js/
│   ├── main/
│   │   └── main.abc.js
│   ├── admin/
│   │   └── admin.def.js
│   └── chunks/
│       └── vendor.ghi.js
└── css/
    ├── main.jkl.css
    └── admin.mno.css
```

## MPA 性能优化

### 1. 预加载关键资源

```html
<!-- index.html -->
<head>
  <!-- 预加载共享 chunk -->
  <link rel="modulepreload" href="/assets/vendor.js">
  <link rel="modulepreload" href="/assets/shared-components.js">
</head>
```

### 2. 代码分割优化

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 提取所有页面都用的库
          if (id.includes('node_modules')) {
            const match = id.match(/node_modules\/([^/]+)/)
            if (match) {
              const packageName = match[1]
              // 大库单独分割
              if (['vue', 'element-plus', 'echarts'].includes(packageName)) {
                return `vendor-${packageName}`
              }
            }
            return 'vendor-common'
          }
        }
      }
    }
  }
}
```

### 3. CSS 代码分割

```javascript
export default {
  build: {
    cssCodeSplit: true,  // 每个页面独立的 CSS
    
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // CSS 按页面分组
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        }
      }
    }
  }
}
```

### 4. 按需加载

```javascript
// 动态导入减少初始加载
const HeavyComponent = () => import('./HeavyComponent.vue')

// 路由懒加载
const routes = [
  {
    path: '/heavy',
    component: () => import('./views/Heavy.vue')
  }
]
```

## 实战示例

### 示例：企业级 MPA 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import glob from 'fast-glob'

// 扫描所有页面入口
const entries = Object.fromEntries(
  glob.sync('src/pages/*/index.html').map(file => {
    const name = file.match(/pages\/(.+?)\/index\.html/)[1]
    return [name, resolve(__dirname, file)]
  })
)

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  },
  
  build: {
    rollupOptions: {
      input: entries,
      
      output: {
        entryFileNames: 'js/[name]/index.[hash].js',
        chunkFileNames: 'js/chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (/\.(css)$/.test(assetInfo.name)) {
            return 'css/[name].[hash][extname]'
          }
          if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
            return 'images/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        },
        
        manualChunks: {
          // 核心框架
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          
          // UI 库
          'vendor-ui': ['element-plus'],
          
          // 工具库
          'vendor-utils': ['axios', 'dayjs', 'lodash-es'],
          
          // 共享组件
          'shared-components': [
            resolve(__dirname, 'src/shared/components')
          ]
        }
      }
    },
    
    // 优化配置
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  
  // 开发服务器
  server: {
    open: '/src/pages/main/index.html'
  }
})
```

### 项目结构

```
project/
├── src/
│   ├── pages/
│   │   ├── main/              # 主应用
│   │   │   ├── index.html
│   │   │   ├── main.js
│   │   │   └── App.vue
│   │   ├── admin/             # 管理后台
│   │   │   ├── index.html
│   │   │   ├── main.js
│   │   │   └── App.vue
│   │   └── mobile/            # 移动端
│   │       ├── index.html
│   │       ├── main.js
│   │       └── App.vue
│   └── shared/
│       ├── components/        # 共享组件
│       ├── utils/             # 共享工具
│       ├── styles/            # 共享样式
│       └── api/               # 共享 API
└── vite.config.js
```

## 常见问题

### 1. 页面之间样式冲突

使用 CSS Modules 或 Scoped CSS：
```vue
<style scoped>
/* 页面独立样式 */
</style>
```

### 2. 共享状态管理

使用 LocalStorage 或 Pinia 持久化：
```javascript
// 使用 pinia-plugin-persistedstate
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

### 3. 开发环境访问特定页面

```json
{
  "scripts": {
    "dev": "vite",
    "dev:admin": "vite --open /admin/",
    "dev:mobile": "vite --open /mobile/"
  }
}
```

## 参考资料

- [Vite 多页面应用](https://cn.vitejs.dev/guide/build.html#multi-page-app)
- [Rollup 多入口](https://rollupjs.org/configuration-options/#input)
