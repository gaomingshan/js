# 缓存策略

## 概述

合理的缓存策略可以显著提升应用性能和用户体验。本章介绍文件名 hash 策略、依赖预构建缓存、浏览器缓存配置、长期缓存方案等内容。

## 文件名 hash 策略

### Hash 类型

Vite 默认使用基于内容的 hash：

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        // [hash] - 基于内容的 hash（推荐）
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
}
```

**输出示例**：
```
js/main.abc123de.js
js/vendor.def456gh.js
assets/logo.xyz789ab.png
```

### Hash 长度配置

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // 自定义 hash 长度（默认 8 位）
        entryFileNames: 'js/[name].[hash:16].js',
        chunkFileNames: 'js/[name].[hash:12].js'
      }
    }
  }
}
```

### 无 Hash 配置（不推荐）

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',  // 无 hash
        chunkFileNames: 'js/[name].js'
      }
    }
  }
}
```

**问题**：无法利用浏览器缓存，每次都需要重新下载。

## 依赖预构建缓存

### 缓存位置

```
node_modules/.vite/
├── deps/                  # 预构建的依赖
│   ├── vue.js
│   ├── vue-router.js
│   └── axios.js
├── deps_temp/             # 临时目录
└── _metadata.json         # 缓存元数据
```

### 缓存元数据

```json
{
  "hash": "abc123...",
  "browserHash": "def456...",
  "optimized": {
    "vue": {
      "src": "../../vue/dist/vue.runtime.esm-bundler.js",
      "file": "vue.js",
      "fileHash": "xyz789...",
      "needsInterop": false
    }
  },
  "chunks": {}
}
```

### 缓存失效条件

Vite 会在以下情况重新预构建：

1. **package.json 依赖变化**
2. **lock 文件变化**
3. **vite.config.js 配置变化**
4. **NODE_ENV 环境变量变化**
5. **手动清除缓存**

### 手动控制缓存

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 强制重新预构建
    force: true,
    
    // 或使用命令行
    // vite --force
  }
}
```

### 清除缓存

```bash
# 删除预构建缓存
rm -rf node_modules/.vite

# 或使用 npm script
{
  "scripts": {
    "clean": "rm -rf node_modules/.vite",
    "dev:clean": "npm run clean && vite"
  }
}
```

## 浏览器缓存配置

### Cache-Control 策略

```javascript
// server.js (生产环境服务器)
import express from 'express'

const app = express()

// 静态资源缓存策略
app.use('/assets', express.static('dist/assets', {
  maxAge: '1y',  // 带 hash 的文件，长期缓存
  immutable: true
}))

// HTML 文件不缓存
app.use(express.static('dist', {
  maxAge: 0,
  etag: true
}))
```

### Nginx 配置

```nginx
# nginx.conf
server {
  listen 80;
  
  root /var/www/app/dist;
  
  # HTML 文件 - 不缓存
  location ~ \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
  }
  
  # 静态资源 - 长期缓存（带 hash）
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
  
  # API 请求不缓存
  location /api {
    add_header Cache-Control "no-cache";
    proxy_pass http://backend;
  }
}
```

### Apache 配置

```apache
# .htaccess
<IfModule mod_expires.c>
  ExpiresActive On
  
  # HTML 不缓存
  ExpiresByType text/html "access plus 0 seconds"
  
  # 静态资源长期缓存
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  # HTML 不缓存
  <FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
  
  # 静态资源 immutable
  <FilesMatch "\.(js|css|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
```

## 长期缓存方案

### 1. 内容 Hash 命名

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // 基于内容生成 hash
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
}
```

**优势**：
- 内容不变，hash 不变
- 充分利用浏览器缓存
- 内容更新，自动失效缓存

### 2. Vendor Chunk 稳定性

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 稳定的 vendor chunk
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['element-plus'],
          'vendor-utils': ['axios', 'lodash-es']
        }
      }
    }
  }
}
```

**效果**：
- 业务代码变化不影响 vendor hash
- Vendor 可以长期缓存

### 3. 避免 Module ID 变化

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        // 使用稳定的 chunk 命名
        chunkFileNames: (chunkInfo) => {
          // 根据模块路径生成稳定名称
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            return 'js/[name].[hash].js'
          }
          return 'js/chunk-[hash].js'
        }
      }
    }
  }
}
```

### 4. 分离 Runtime Chunk

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Webpack runtime 相关逻辑分离
          if (id.includes('vite/preload-helper')) {
            return 'runtime'
          }
          
          // 其他代码分割逻辑
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
}
```

## 缓存失效处理

### HTML 元信息

```html
<!-- index.html -->
<head>
  <!-- 防止 HTML 缓存 -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  
  <!-- 版本信息（可选） -->
  <meta name="version" content="1.0.0">
  <meta name="build-time" content="2024-01-01T00:00:00Z">
</head>
```

### 版本检测

```javascript
// version-check.js
const currentVersion = '1.0.0'

async function checkVersion() {
  try {
    const res = await fetch('/version.json?' + Date.now())
    const data = await res.json()
    
    if (data.version !== currentVersion) {
      // 提示用户更新
      if (confirm('发现新版本，是否刷新？')) {
        location.reload(true)  // 强制刷新
      }
    }
  } catch (error) {
    console.error('版本检测失败:', error)
  }
}

// 定期检测
setInterval(checkVersion, 5 * 60 * 1000)  // 每 5 分钟
```

### Service Worker 更新

```javascript
// service-worker.js
const CACHE_VERSION = 'v1.0.0'

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      )
    })
  )
})

// 使用
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    // 检测更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 有新版本
          if (confirm('发现新版本，是否更新？')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' })
            window.location.reload()
          }
        }
      })
    })
  })
}
```

## Service Worker 缓存

### 基础缓存策略

```javascript
// service-worker.js
const CACHE_NAME = 'app-v1'

// 安装时缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/main.js',
        '/assets/main.css'
      ])
    })
  )
})

// 请求拦截
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 缓存命中
      if (response) {
        return response
      }
      
      // 网络请求
      return fetch(event.request).then((response) => {
        // 缓存新资源
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
    })
  )
})
```

### 缓存策略

**1. Cache First（缓存优先）**：
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

**2. Network First（网络优先）**：
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  )
})
```

**3. Stale While Revalidate（后台更新）**：
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone())
          return networkResponse
        })
        
        return response || fetchPromise
      })
    })
  )
})
```

### 使用 Workbox

```bash
npm install -D workbox-build
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60  // 5 分钟
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60  // 30 天
              }
            }
          }
        ]
      }
    })
  ]
})
```

## 实战缓存方案

### 方案1：标准 SPA 应用

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['element-plus'],
          'vendor-utils': ['axios', 'lodash-es']
        }
      }
    }
  }
}
```

**Nginx 配置**：
```nginx
location / {
  try_files $uri $uri/ /index.html;
}

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

location = /index.html {
  add_header Cache-Control "no-cache";
}
```

### 方案2：PWA 应用

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ]
}
```

## 缓存性能监控

### 1. 缓存命中率

```javascript
// 统计缓存性能
const cacheStats = {
  hits: 0,
  misses: 0
}

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        cacheStats.hits++
      } else {
        cacheStats.misses++
      }
      
      // 定期上报
      if ((cacheStats.hits + cacheStats.misses) % 100 === 0) {
        const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses)
        console.log('缓存命中率:', (hitRate * 100).toFixed(2) + '%')
      }
      
      return response || fetch(event.request)
    })
  )
})
```

### 2. 缓存大小监控

```javascript
async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    console.log('缓存使用:', (estimate.usage / 1024 / 1024).toFixed(2) + ' MB')
    console.log('可用空间:', (estimate.quota / 1024 / 1024).toFixed(2) + ' MB')
  }
}
```

## 常见问题

### 1. 缓存过时

**解决方案**：
- 使用内容 hash
- HTML 不缓存
- 定期清理旧缓存

### 2. Service Worker 不更新

```javascript
// 强制更新
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.update()
    })
  })
}
```

### 3. 缓存空间不足

```javascript
// 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('old-'))
          .map((name) => caches.delete(name))
      )
    })
  )
})
```

## 参考资料

- [HTTP 缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching)
- [Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [Workbox](https://developer.chrome.com/docs/workbox/)
