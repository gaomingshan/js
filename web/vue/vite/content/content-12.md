# Vite 插件系统

## 概述

Vite 插件系统基于 Rollup 插件接口，并扩展了 Vite 特有的钩子。通过插件可以扩展 Vite 的功能，实现自定义转换、优化等操作。本章介绍插件架构、钩子系统、执行顺序等核心概念。

## 插件架构

### Rollup 兼容

Vite 插件兼容 Rollup 插件接口：

```javascript
// 标准 Rollup 插件
export default function myPlugin() {
  return {
    name: 'my-plugin',
    
    // Rollup 钩子
    resolveId(id) { },
    load(id) { },
    transform(code, id) { }
  }
}
```

### Vite 扩展

Vite 在 Rollup 基础上添加了专有钩子：

```javascript
export default function myVitePlugin() {
  return {
    name: 'my-vite-plugin',
    
    // Vite 专有钩子
    config(config, env) { },
    configResolved(config) { },
    configureServer(server) { },
    transformIndexHtml(html) { },
    
    // Rollup 钩子
    transform(code, id) { }
  }
}
```

### 插件对象结构

```javascript
{
  name: 'plugin-name',          // 插件名称（必需）
  enforce: 'pre' | 'post',      // 执行顺序
  apply: 'build' | 'serve',     // 应用场景
  
  // 钩子函数
  config() { },
  configResolved() { },
  // ...更多钩子
}
```

## 插件钩子生命周期

### 服务器启动阶段

```
1. config              - 修改配置
2. configResolved      - 配置解析完成
3. options             - Rollup 选项处理
4. configureServer     - 配置开发服务器
5. buildStart          - 构建开始
```

### 请求处理阶段

```
每个模块请求：
1. resolveId           - 解析模块 ID
2. load                - 加载模块内容
3. transform           - 转换模块代码
```

### HTML 处理

```
transformIndexHtml     - 转换 HTML
```

### 服务器关闭

```
closeBundle            - 关闭 bundle
```

### 构建阶段

```
1. config
2. configResolved
3. options
4. buildStart
5. resolveId / load / transform（每个模块）
6. generateBundle      - 生成 bundle
7. writeBundle         - 写入磁盘
8. closeBundle         - 关闭
```

## 通用钩子 vs Vite 专有钩子

### Rollup 通用钩子

这些钩子在开发和构建时都会调用：

```javascript
export default function() {
  return {
    name: 'rollup-hooks',
    
    // 选项钩子
    options(options) {
      return options
    },
    
    // 构建钩子
    buildStart(options) {
      // 构建开始
    },
    
    resolveId(source, importer) {
      // 解析模块 ID
      if (source === 'virtual-module') {
        return source
      }
    },
    
    load(id) {
      // 加载模块
      if (id === 'virtual-module') {
        return 'export default "virtual"'
      }
    },
    
    transform(code, id) {
      // 转换代码
      if (id.endsWith('.txt')) {
        return `export default ${JSON.stringify(code)}`
      }
    },
    
    // 输出生成钩子
    generateBundle(options, bundle) {
      // 生成 bundle
    },
    
    writeBundle(options, bundle) {
      // 写入完成
    },
    
    closeBundle() {
      // 关闭
    }
  }
}
```

### Vite 专有钩子

这些钩子只在 Vite 中可用：

```javascript
export default function() {
  return {
    name: 'vite-hooks',
    
    // 配置钩子
    config(config, { command, mode }) {
      // 修改配置
      if (command === 'serve') {
        return {
          server: {
            port: 3000
          }
        }
      }
    },
    
    configResolved(config) {
      // 配置解析完成，此时配置已最终确定
      console.log('最终配置:', config)
    },
    
    // 服务器钩子
    configureServer(server) {
      // 配置开发服务器
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next()
      })
    },
    
    // HTML 转换
    transformIndexHtml(html) {
      // 转换 HTML
      return html.replace(
        '<head>',
        '<head>\n  <meta name="custom" content="value">'
      )
    },
    
    // HMR 钩子
    handleHotUpdate({ file, server }) {
      // 处理热更新
      if (file.endsWith('.custom')) {
        server.ws.send({
          type: 'custom',
          event: 'file-update',
          data: { file }
        })
        return []  // 阻止默认 HMR
      }
    }
  }
}
```

## 插件执行顺序与控制

### enforce 属性

```javascript
// pre: 在核心插件之前执行
export default {
  name: 'pre-plugin',
  enforce: 'pre',
  transform(code) { }
}

// 默认：与核心插件一起执行（按注册顺序）
export default {
  name: 'normal-plugin',
  transform(code) { }
}

// post: 在核心插件之后执行
export default {
  name: 'post-plugin',
  enforce: 'post',
  transform(code) { }
}
```

### 执行顺序

```
插件顺序：
1. Alias（路径别名）
2. enforce: 'pre' 用户插件
3. Vite 核心插件
4. 普通用户插件
5. Vite 构建插件
6. enforce: 'post' 用户插件
7. Vite 构建后置插件（压缩、manifest、报告）
```

### 条件应用

```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    
    // 只在构建时应用
    apply: 'build',
    
    // 或只在开发时应用
    // apply: 'serve',
    
    // 或使用函数判断
    apply(config, { command }) {
      return command === 'build' && config.mode === 'production'
    }
  }
}
```

## 插件配置与选项

### 带选项的插件

```javascript
// 插件定义
export default function myPlugin(options = {}) {
  const {
    include = /\.custom$/,
    exclude,
    transform: customTransform
  } = options
  
  return {
    name: 'my-plugin',
    
    transform(code, id) {
      // 使用过滤器
      if (!include.test(id)) return
      if (exclude && exclude.test(id)) return
      
      // 应用转换
      return customTransform ? customTransform(code) : code
    }
  }
}

// 使用插件
import myPlugin from './my-plugin'

export default {
  plugins: [
    myPlugin({
      include: /\.txt$/,
      exclude: /node_modules/,
      transform: (code) => code.toUpperCase()
    })
  ]
}
```

### TypeScript 类型定义

```typescript
// 插件选项接口
interface MyPluginOptions {
  include?: RegExp | RegExp[]
  exclude?: RegExp | RegExp[]
  transform?: (code: string) => string
}

// 插件函数
export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  return {
    name: 'my-plugin',
    // ...
  }
}
```

## 插件调试技巧

### 1. 日志输出

```javascript
export default function debugPlugin() {
  return {
    name: 'debug-plugin',
    
    transform(code, id) {
      console.log('转换文件:', id)
      console.log('代码长度:', code.length)
      return code
    }
  }
}
```

### 2. 使用 debug 包

```bash
npm install -D debug
```

```javascript
import createDebug from 'debug'

const debug = createDebug('vite:my-plugin')

export default function myPlugin() {
  return {
    name: 'my-plugin',
    
    transform(code, id) {
      debug('转换 %s', id)
      return code
    }
  }
}
```

启用调试：
```bash
DEBUG=vite:my-plugin vite
```

### 3. 性能分析

```javascript
export default function perfPlugin() {
  const times = new Map()
  
  return {
    name: 'perf-plugin',
    
    transform(code, id) {
      const start = Date.now()
      
      // 执行转换
      const result = doTransform(code)
      
      const duration = Date.now() - start
      times.set(id, duration)
      
      return result
    },
    
    closeBundle() {
      // 输出性能报告
      console.log('转换耗时统计:')
      times.forEach((time, file) => {
        console.log(`${file}: ${time}ms`)
      })
    }
  }
}
```

### 4. 条件调试

```javascript
export default function conditionalDebug() {
  const isDev = process.env.NODE_ENV === 'development'
  
  return {
    name: 'conditional-debug',
    
    transform(code, id) {
      if (isDev && id.includes('debug-this')) {
        console.log('调试文件:', id)
        console.log('代码:', code)
      }
      return code
    }
  }
}
```

## 实战示例

### 示例1：虚拟模块插件

```javascript
// plugins/virtual-module.js
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

### 示例2：自动导入插件

```javascript
// plugins/auto-import.js
export default function autoImport(options = {}) {
  const { imports = {} } = options
  
  return {
    name: 'auto-import',
    
    transform(code, id) {
      if (!id.endsWith('.js') && !id.endsWith('.vue')) {
        return
      }
      
      const usedImports = new Set()
      
      // 检测使用的函数
      Object.entries(imports).forEach(([name, path]) => {
        if (code.includes(name)) {
          usedImports.add({ name, path })
        }
      })
      
      if (usedImports.size === 0) {
        return
      }
      
      // 生成导入语句
      const importStatements = Array.from(usedImports)
        .map(({ name, path }) => `import { ${name} } from '${path}'`)
        .join('\n')
      
      return `${importStatements}\n${code}`
    }
  }
}

// vite.config.js
export default {
  plugins: [
    autoImport({
      imports: {
        ref: 'vue',
        reactive: 'vue',
        computed: 'vue'
      }
    })
  ]
}
```

### 示例3：Markdown 插件

```javascript
// plugins/markdown.js
import { marked } from 'marked'

export default function markdown() {
  return {
    name: 'markdown',
    
    transform(code, id) {
      if (!id.endsWith('.md')) {
        return
      }
      
      const html = marked(code)
      
      return {
        code: `export default ${JSON.stringify(html)}`,
        map: null
      }
    }
  }
}

// 使用
import content from './README.md'
document.getElementById('app').innerHTML = content
```

### 示例4：环境变量注入插件

```javascript
// plugins/env-inject.js
export default function envInject(envVars = {}) {
  return {
    name: 'env-inject',
    
    config() {
      return {
        define: Object.entries(envVars).reduce((acc, [key, value]) => {
          acc[`process.env.${key}`] = JSON.stringify(value)
          return acc
        }, {})
      }
    }
  }
}

// vite.config.js
export default {
  plugins: [
    envInject({
      API_URL: 'https://api.example.com',
      VERSION: '1.0.0'
    })
  ]
}
```

## 插件最佳实践

### 1. 命名规范

```javascript
// ✅ 好的命名
vite-plugin-vue
vite-plugin-react
@vitejs/plugin-legacy

// ❌ 避免
my-plugin
awesome-plugin
```

### 2. 错误处理

```javascript
export default function safePlugin() {
  return {
    name: 'safe-plugin',
    
    transform(code, id) {
      try {
        return transformCode(code)
      } catch (error) {
        this.error({
          message: `转换失败: ${id}`,
          cause: error
        })
      }
    }
  }
}
```

### 3. 过滤文件

```javascript
import { createFilter } from '@rollup/pluginutils'

export default function filterPlugin(options = {}) {
  const filter = createFilter(
    options.include || /\.js$/,
    options.exclude || /node_modules/
  )
  
  return {
    name: 'filter-plugin',
    
    transform(code, id) {
      if (!filter(id)) return
      
      return transformCode(code)
    }
  }
}
```

### 4. 插件组合

```javascript
// 创建插件工厂
export function createPlugins(options) {
  return [
    pluginA(options.a),
    pluginB(options.b),
    pluginC(options.c)
  ]
}

// 使用
export default {
  plugins: createPlugins({
    a: { /* ... */ },
    b: { /* ... */ },
    c: { /* ... */ }
  })
}
```

## 常见问题

### 1. 插件不生效

检查：
- 插件是否正确注册
- apply 条件是否匹配
- enforce 顺序是否正确

### 2. 热更新失效

```javascript
export default {
  name: 'my-plugin',
  
  handleHotUpdate({ file, server }) {
    if (file.endsWith('.custom')) {
      // 手动触发更新
      server.ws.send({
        type: 'full-reload'
      })
    }
  }
}
```

### 3. 虚拟模块找不到

确保使用 `\0` 前缀：
```javascript
resolveId(id) {
  if (id === 'virtual:module') {
    return '\0virtual:module'  // 添加 \0 前缀
  }
}
```

## 参考资料

- [Vite 插件 API](https://cn.vitejs.dev/guide/api-plugin.html)
- [Rollup 插件](https://rollupjs.org/plugin-development/)
- [插件示例](https://github.com/vitejs/awesome-vite#plugins)
