# 自定义插件开发

## 概述

开发自定义 Vite 插件可以扩展构建功能，满足特定需求。本章介绍插件开发基础、常用钩子实现、虚拟模块、以及开发最佳实践。

## 插件基本结构

### 最简插件

```javascript
// plugins/my-plugin.js
export default function myPlugin() {
  return {
    name: 'my-plugin',  // 必需，唯一标识
    
    // 插件钩子
    configResolved(config) {
      console.log('插件已加载:', config.command)
    }
  }
}

// vite.config.js
import myPlugin from './plugins/my-plugin'

export default {
  plugins: [myPlugin()]
}
```

### 带选项的插件

```javascript
export default function myPlugin(options = {}) {
  const {
    enabled = true,
    include = /\.txt$/,
    transform: customTransform
  } = options
  
  return {
    name: 'my-plugin',
    
    // 使用选项
    transform(code, id) {
      if (!enabled || !include.test(id)) {
        return
      }
      
      return customTransform ? customTransform(code) : code
    }
  }
}

// 使用
myPlugin({
  enabled: true,
  include: /\.custom$/,
  transform: (code) => code.toUpperCase()
})
```

### TypeScript 插件

```typescript
// plugins/my-plugin.ts
import type { Plugin } from 'vite'

interface MyPluginOptions {
  enabled?: boolean
  include?: RegExp
}

export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  return {
    name: 'my-plugin',
    
    transform(code, id) {
      // 实现
      return code
    }
  }
}
```

## 常用钩子实现

### transform - 转换代码

```javascript
export default function transformPlugin() {
  return {
    name: 'transform-plugin',
    
    transform(code, id) {
      // 1. 过滤文件
      if (!id.endsWith('.custom')) {
        return
      }
      
      // 2. 转换代码
      const transformedCode = code.replace(/OLD/g, 'NEW')
      
      // 3. 返回结果
      return {
        code: transformedCode,
        map: null  // sourcemap（可选）
      }
    }
  }
}
```

**实战示例 - JSON5 支持**：
```javascript
import JSON5 from 'json5'

export default function json5Plugin() {
  return {
    name: 'json5',
    
    transform(code, id) {
      if (!id.endsWith('.json5')) {
        return
      }
      
      try {
        const parsed = JSON5.parse(code)
        return {
          code: `export default ${JSON.stringify(parsed)}`,
          map: null
        }
      } catch (error) {
        this.error(`JSON5 解析失败: ${error.message}`)
      }
    }
  }
}

// 使用
import config from './config.json5'
```

### resolveId - 模块解析

```javascript
export default function resolvePlugin() {
  return {
    name: 'resolve-plugin',
    
    resolveId(source, importer) {
      // 1. 处理特殊前缀
      if (source.startsWith('~@/')) {
        return source.replace('~@/', '/src/')
      }
      
      // 2. 重定向模块
      if (source === 'old-package') {
        return 'new-package'
      }
      
      // 3. 返回 null 继续默认解析
      return null
    }
  }
}
```

**实战示例 - 别名增强**：
```javascript
import path from 'path'

export default function aliasPlugin(aliases = {}) {
  return {
    name: 'alias-plugin',
    
    resolveId(source) {
      for (const [alias, replacement] of Object.entries(aliases)) {
        if (source.startsWith(alias)) {
          return source.replace(alias, replacement)
        }
      }
      return null
    }
  }
}

// 使用
aliasPlugin({
  '$lib': path.resolve(__dirname, 'lib'),
  '$utils': path.resolve(__dirname, 'src/utils')
})
```

### load - 加载模块

```javascript
export default function loadPlugin() {
  return {
    name: 'load-plugin',
    
    load(id) {
      // 1. 加载特定文件
      if (id.endsWith('.data')) {
        return `export default ${JSON.stringify(loadData(id))}`
      }
      
      // 2. 返回 null 使用默认加载
      return null
    }
  }
}
```

**实战示例 - YAML 支持**：
```javascript
import yaml from 'js-yaml'
import fs from 'fs'

export default function yamlPlugin() {
  return {
    name: 'yaml',
    
    load(id) {
      if (!id.endsWith('.yaml') && !id.endsWith('.yml')) {
        return
      }
      
      const yamlContent = fs.readFileSync(id, 'utf-8')
      const data = yaml.load(yamlContent)
      
      return `export default ${JSON.stringify(data)}`
    }
  }
}

// 使用
import config from './config.yaml'
console.log(config)
```

### config - 修改配置

```javascript
export default function configPlugin() {
  return {
    name: 'config-plugin',
    
    config(config, { command, mode }) {
      // 返回部分配置，会与现有配置合并
      return {
        resolve: {
          alias: {
            '@': '/src'
          }
        },
        
        // 根据命令修改配置
        build: command === 'build' ? {
          minify: 'terser'
        } : {}
      }
    }
  }
}
```

### configResolved - 配置确认

```javascript
export default function configResolvedPlugin() {
  let config
  
  return {
    name: 'config-resolved-plugin',
    
    configResolved(resolvedConfig) {
      // 保存最终配置
      config = resolvedConfig
    },
    
    transform(code, id) {
      // 使用保存的配置
      if (config.command === 'build') {
        // 构建时的特殊处理
      }
      return code
    }
  }
}
```

### configureServer - 开发服务器

```javascript
export default function serverPlugin() {
  return {
    name: 'server-plugin',
    
    configureServer(server) {
      // 1. 添加中间件
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/health') {
          res.end('OK')
          return
        }
        next()
      })
      
      // 2. 监听事件
      server.watcher.on('add', (file) => {
        console.log('文件添加:', file)
      })
      
      // 3. 访问 HMR
      server.ws.on('connection', () => {
        console.log('WebSocket 连接')
      })
    }
  }
}
```

### transformIndexHtml - HTML 转换

```javascript
export default function htmlPlugin() {
  return {
    name: 'html-plugin',
    
    transformIndexHtml(html) {
      // 1. 字符串替换
      return html.replace(
        '<head>',
        '<head>\n  <meta name="description" content="My App">'
      )
      
      // 2. 返回标签数组
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: { src: 'https://cdn.example.com/analytics.js' },
            injectTo: 'head'
          }
        ]
      }
    }
  }
}
```

**实战示例 - 环境变量注入 HTML**：
```javascript
export default function envInjectHtml(env = {}) {
  return {
    name: 'env-inject-html',
    
    transformIndexHtml(html) {
      return html.replace(
        /%(\w+)%/g,
        (match, key) => env[key] || match
      )
    }
  }
}

// index.html
// <title>%APP_TITLE%</title>
// 构建后 → <title>My Application</title>
```

### handleHotUpdate - 热更新

```javascript
export default function hmrPlugin() {
  return {
    name: 'hmr-plugin',
    
    handleHotUpdate({ file, server, modules }) {
      // 1. 处理特定文件
      if (file.endsWith('.data')) {
        console.log('数据文件更新:', file)
        
        // 2. 通知客户端
        server.ws.send({
          type: 'custom',
          event: 'data-update',
          data: { file }
        })
        
        // 3. 返回空数组阻止默认 HMR
        return []
      }
      
      // 4. 返回 modules 使用默认 HMR
      return modules
    }
  }
}
```

## 虚拟模块

### 创建虚拟模块

```javascript
export default function virtualModule() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  
  return {
    name: 'virtual-module',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "Hello from virtual module"`
      }
    }
  }
}

// 使用
import { msg } from 'virtual:my-module'
console.log(msg)
```

### 动态虚拟模块

```javascript
export default function dynamicVirtualModule() {
  const virtualId = 'virtual:env'
  const resolvedId = '\0' + virtualId
  
  return {
    name: 'dynamic-virtual',
    
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    
    load(id) {
      if (id === resolvedId) {
        // 动态生成内容
        return `
          export const buildTime = "${new Date().toISOString()}"
          export const nodeEnv = "${process.env.NODE_ENV}"
          export const isDev = ${process.env.NODE_ENV === 'development'}
        `
      }
    }
  }
}

// 使用
import { buildTime, isDev } from 'virtual:env'
```

### 实战示例 - 路由自动生成

```javascript
import fs from 'fs'
import path from 'path'

export default function autoRoutes(options = {}) {
  const { dir = 'src/views' } = options
  const virtualId = 'virtual:routes'
  const resolvedId = '\0' + virtualId
  
  return {
    name: 'auto-routes',
    
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    
    load(id) {
      if (id === resolvedId) {
        // 扫描目录生成路由
        const routes = scanRoutes(dir)
        return `export default ${JSON.stringify(routes)}`
      }
    },
    
    // 监听文件变化
    configureServer(server) {
      server.watcher.add(dir)
      server.watcher.on('add', () => {
        // 触发虚拟模块重新加载
        const module = server.moduleGraph.getModuleById(resolvedId)
        if (module) {
          server.moduleGraph.invalidateModule(module)
          server.ws.send({ type: 'full-reload' })
        }
      })
    }
  }
}

function scanRoutes(dir) {
  // 实现路由扫描逻辑
  const files = fs.readdirSync(dir)
  return files.map(file => ({
    path: `/${file.replace('.vue', '')}`,
    component: `./${file}`
  }))
}
```

## 开发服务器增强

### 添加 API 端点

```javascript
export default function apiPlugin() {
  return {
    name: 'api-plugin',
    
    configureServer(server) {
      server.middlewares.use('/api/user', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          id: 1,
          name: 'John Doe'
        }))
      })
    }
  }
}
```

### Mock 数据

```javascript
import express from 'express'

export default function mockPlugin(mockData = {}) {
  return {
    name: 'mock',
    
    configureServer(server) {
      const app = express()
      
      Object.entries(mockData).forEach(([path, handler]) => {
        app.use(path, (req, res) => {
          const data = typeof handler === 'function' 
            ? handler(req) 
            : handler
          res.json(data)
        })
      })
      
      server.middlewares.use(app)
    }
  }
}

// 使用
mockPlugin({
  '/api/users': [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ],
  '/api/user/:id': (req) => ({
    id: req.params.id,
    name: 'Dynamic User'
  })
})
```

### WebSocket 通信

```javascript
export default function wsPlugin() {
  return {
    name: 'ws-plugin',
    
    configureServer(server) {
      // 监听自定义事件
      server.ws.on('my-event', (data, client) => {
        console.log('收到消息:', data)
        
        // 响应客户端
        client.send('my-response', { result: 'ok' })
      })
      
      // 广播消息
      setInterval(() => {
        server.ws.send('heartbeat', { time: Date.now() })
      }, 30000)
    }
  }
}

// 客户端
if (import.meta.hot) {
  import.meta.hot.on('my-response', (data) => {
    console.log('收到响应:', data)
  })
}
```

## 构建产物处理

### 修改生成的文件

```javascript
export default function buildPlugin() {
  return {
    name: 'build-plugin',
    
    generateBundle(options, bundle) {
      // 遍历所有输出文件
      for (const fileName in bundle) {
        const chunk = bundle[fileName]
        
        // 修改 chunk
        if (chunk.type === 'chunk' && chunk.isEntry) {
          // 在入口文件顶部添加注释
          chunk.code = `/* Built at ${new Date().toISOString()} */\n${chunk.code}`
        }
        
        // 修改资源
        if (chunk.type === 'asset' && fileName.endsWith('.html')) {
          chunk.source = chunk.source.replace(
            '</body>',
            '<script>console.log("App loaded")</script></body>'
          )
        }
      }
    }
  }
}
```

### 生成额外文件

```javascript
export default function extraFilePlugin() {
  return {
    name: 'extra-file',
    
    generateBundle() {
      // 生成版本信息文件
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({
          version: '1.0.0',
          buildTime: new Date().toISOString()
        })
      })
    }
  }
}
```

## 插件开发最佳实践

### 1. 使用过滤器

```javascript
import { createFilter } from '@rollup/pluginutils'

export default function(options = {}) {
  const filter = createFilter(
    options.include || /\.(js|ts)$/,
    options.exclude || /node_modules/
  )
  
  return {
    name: 'filtered-plugin',
    transform(code, id) {
      if (!filter(id)) return
      return transformCode(code)
    }
  }
}
```

### 2. 错误处理

```javascript
export default function() {
  return {
    name: 'safe-plugin',
    
    transform(code, id) {
      try {
        return transformCode(code)
      } catch (error) {
        // 使用 this.error 报告错误
        this.error({
          message: `转换失败: ${id}`,
          cause: error,
          loc: { line: 1, column: 0 }
        })
      }
    }
  }
}
```

### 3. 性能优化

```javascript
export default function() {
  const cache = new Map()
  
  return {
    name: 'cached-plugin',
    
    transform(code, id) {
      // 使用缓存
      if (cache.has(id)) {
        return cache.get(id)
      }
      
      const result = expensiveTransform(code)
      cache.set(id, result)
      return result
    },
    
    buildEnd() {
      // 清理缓存
      cache.clear()
    }
  }
}
```

### 4. 调试支持

```javascript
import createDebugger from 'debug'

const debug = createDebugger('vite:my-plugin')

export default function() {
  return {
    name: 'debug-plugin',
    
    transform(code, id) {
      debug('转换文件: %s (%d bytes)', id, code.length)
      return code
    }
  }
}

// 启用: DEBUG=vite:my-plugin vite
```

### 5. TypeScript 类型

```typescript
import type { Plugin, ResolvedConfig } from 'vite'

interface Options {
  include?: RegExp
}

export default function myPlugin(options: Options = {}): Plugin {
  let config: ResolvedConfig
  
  return {
    name: 'my-plugin',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    
    transform(code, id) {
      // 有完整类型提示
      return code
    }
  }
}
```

## 参考资料

- [Vite 插件 API](https://cn.vitejs.dev/guide/api-plugin.html)
- [Rollup 插件开发](https://rollupjs.org/plugin-development/)
- [@rollup/pluginutils](https://github.com/rollup/plugins/tree/master/packages/pluginutils)
