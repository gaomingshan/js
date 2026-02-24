# 开发配置

## 概述

Vite 的开发服务器配置决定了开发体验的质量。本章介绍 server 配置选项、开发环境优化、跨域处理、HTTPS 配置等实用技巧。

## server 配置

### 基础配置

```javascript
// vite.config.js
export default {
  server: {
    // 端口号
    port: 3000,
    
    // 严格端口（true: 端口被占用时报错；false: 尝试下一个）
    strictPort: false,
    
    // 主机名（true: 监听所有地址；'0.0.0.0': 局域网访问）
    host: 'localhost',
    
    // 自动打开浏览器
    open: true,
    
    // 启用 CORS
    cors: true,
    
    // 强制预构建依赖
    force: false,
  }
}
```

### 端口配置详解

```javascript
export default {
  server: {
    // 指定端口
    port: 3000,
    
    // 端口被占用时的行为
    strictPort: false,  // 自动尝试 3001, 3002...
    // strictPort: true,  // 报错退出
  }
}
```

**命令行覆盖**：
```bash
# 指定端口
vite --port 4000

# 严格端口模式
vite --port 3000 --strictPort
```

### 主机配置

```javascript
export default {
  server: {
    // 局域网访问
    host: '0.0.0.0',
    // 或
    host: true,
    
    // 仅本地访问
    // host: 'localhost',  // 默认
  }
}
```

**终端输出**：
```
VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  Network: http://192.168.1.101:3000/
```

### 自动打开浏览器

```javascript
export default {
  server: {
    // 简单配置
    open: true,
    
    // 指定路径
    open: '/docs/index.html',
    
    // 指定浏览器
    open: 'chrome',
    
    // 完整配置
    open: {
      app: {
        name: 'chrome',
        arguments: ['--incognito']  // 无痕模式
      }
    }
  }
}
```

## 代理配置（proxy）

### 基础代理

```javascript
export default {
  server: {
    proxy: {
      // 简写形式
      '/api': 'http://localhost:8080',
      
      // 完整配置
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

**工作原理**：
```
浏览器请求: http://localhost:3000/api/users
              ↓
Vite 代理: http://localhost:8080/api/users
              ↓
后端服务器返回数据
```

### 路径重写

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

**示例**：
```
请求: /api/users
重写后: /users
实际请求: http://localhost:8080/users
```

### 多个代理规则

```javascript
export default {
  server: {
    proxy: {
      // API 代理
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1')
      },
      
      // WebSocket 代理
      '/socket': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true
      },
      
      // 正则匹配
      '^/fallback/.*': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      }
    }
  }
}
```

### 代理选项

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        
        // 改变请求头中的 origin
        changeOrigin: true,
        
        // 路径重写
        rewrite: (path) => path.replace(/^\/api/, ''),
        
        // 配置代理日志
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url)
          })
        },
        
        // 绕过代理
        bypass: (req, res, options) => {
          if (req.headers.accept?.includes('html')) {
            return '/index.html'
          }
        }
      }
    }
  }
}
```

## CORS 与跨域处理

### 启用 CORS

```javascript
export default {
  server: {
    // 启用 CORS（所有源）
    cors: true,
    
    // 自定义 CORS 配置
    cors: {
      origin: ['http://localhost:3001', 'http://example.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }
  }
}
```

### 处理预检请求

```javascript
export default {
  server: {
    cors: {
      // 预检请求缓存时间（秒）
      maxAge: 86400,
      
      // 允许凭证
      credentials: true,
      
      // 允许的请求头
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
      
      // 暴露的响应头
      exposedHeaders: ['X-Total-Count']
    }
  }
}
```

### 代理方式解决跨域

```javascript
// 开发环境使用代理
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true  // 关键配置
      }
    }
  }
}

// 生产环境配置 Nginx
// nginx.conf
location /api {
    proxy_pass http://api.example.com;
    proxy_set_header Host $host;
}
```

## HTTPS 配置

### 方式1：自动生成证书

```javascript
export default {
  server: {
    https: true  // 自动生成自签名证书
  }
}
```

### 方式2：自定义证书

```javascript
import fs from 'fs'

export default {
  server: {
    https: {
      key: fs.readFileSync('path/to/server.key'),
      cert: fs.readFileSync('path/to/server.crt')
    }
  }
}
```

### 方式3：使用 mkcert

```bash
# 安装 mkcert
brew install mkcert  # macOS
# choco install mkcert  # Windows

# 生成本地 CA
mkcert -install

# 生成证书
mkcert localhost 127.0.0.1 ::1
```

```javascript
import fs from 'fs'

export default {
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem')
    }
  }
}
```

### 方式4：使用插件

```bash
npm install -D @vitejs/plugin-basic-ssl
```

```javascript
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()],
  server: {
    https: true
  }
}
```

## 自定义中间件

### 添加中间件

```javascript
export default {
  server: {
    middlewareMode: false,  // 不使用中间件模式
    
    // 配置中间件
    configureServer(server) {
      // 在内部中间件之前执行
      server.middlewares.use((req, res, next) => {
        console.log('请求:', req.url)
        next()
      })
      
      // 自定义路由
      server.middlewares.use('/api/custom', (req, res) => {
        res.end(JSON.stringify({ message: 'Custom API' }))
      })
    }
  }
}
```

### 使用 Express

```javascript
import express from 'express'

export default {
  server: {
    configureServer(server) {
      const app = express()
      
      // Mock API
      app.get('/api/users', (req, res) => {
        res.json([
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' }
        ])
      })
      
      server.middlewares.use(app)
    }
  }
}
```

### 请求日志

```javascript
export default {
  server: {
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const start = Date.now()
        
        res.on('finish', () => {
          const duration = Date.now() - start
          console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`)
        })
        
        next()
      })
    }
  }
}
```

## WebSocket 配置

### 基础配置

```javascript
export default {
  server: {
    hmr: {
      // WebSocket 协议
      protocol: 'ws',  // 或 'wss'（HTTPS）
      
      // WebSocket 主机
      host: 'localhost',
      
      // WebSocket 端口（默认与 server.port 相同）
      port: 3000,
      
      // WebSocket 路径
      path: '/__vite_hmr',
      
      // 超时时间
      timeout: 30000,
      
      // 覆盖 URL
      clientPort: 3000,
    }
  }
}
```

### 自定义 WebSocket 服务器

```javascript
export default {
  server: {
    hmr: {
      server: customWebSocketServer  // 自定义 WS 服务器
    }
  }
}
```

### 云开发环境配置

```javascript
// 适用于 Gitpod、CodeSandbox 等
export default {
  server: {
    hmr: {
      clientPort: 443,  // 云环境端口
      protocol: 'wss'   // 使用 WSS
    }
  }
}
```

## 开发环境优化

### 预构建优化

```javascript
export default {
  optimizeDeps: {
    // 手动指定预构建依赖
    include: ['vue', 'vue-router', 'pinia'],
    
    // 排除依赖
    exclude: ['your-local-package'],
    
    // 强制预构建
    force: false
  }
}
```

### 文件监听优化

```javascript
export default {
  server: {
    watch: {
      // 忽略监听文件
      ignored: ['**/node_modules/**', '**/.git/**'],
      
      // 使用轮询（某些环境需要）
      usePolling: false,
      
      // 轮询间隔
      interval: 100
    }
  }
}
```

### 预热常用文件

```javascript
export default {
  server: {
    warmup: {
      clientFiles: [
        './src/components/Header.vue',
        './src/components/Footer.vue',
        './src/views/Home.vue'
      ]
    }
  }
}
```

## 实战配置模板

### Vue 项目开发配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  server: {
    port: 3000,
    open: true,
    host: true,
    
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    
    hmr: {
      overlay: true
    },
    
    warmup: {
      clientFiles: ['./src/views/**/*.vue']
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia']
  }
})
```

### React 项目开发配置

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    open: true,
    
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
  
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

## 常见问题

### 1. 端口被占用

```bash
# 查看占用端口的进程
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# 结束进程或更改端口
```

### 2. 局域网无法访问

```javascript
export default {
  server: {
    host: '0.0.0.0',  // 或 true
  }
}
```

### 3. 代理不生效

检查代理配置：
```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,  // 确保添加
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('代理请求:', req.url)
          })
        }
      }
    }
  }
}
```

## 参考资料

- [Vite 服务器选项](https://cn.vitejs.dev/config/server-options.html)
- [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
