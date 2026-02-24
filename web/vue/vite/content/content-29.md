# 问题排查与调试

## 概述

在使用 Vite 过程中可能会遇到各种问题。本章提供系统化的问题排查方法、调试工具、常见错误速查表，帮助快速定位和解决问题。

## 开发服务器问题排查

### 1. 服务器无法启动

**问题现象**：
```bash
vite
# Error: listen EADDRINUSE: address already in use :::5173
```

**排查步骤**：
```bash
# 1. 检查端口占用
# Windows
netstat -ano | findstr :5173

# macOS/Linux
lsof -i :5173

# 2. 结束进程或更改端口
# vite.config.js
export default {
  server: {
    port: 3000
  }
}
```

### 2. 模块解析失败

**问题现象**：
```
Failed to resolve import "some-module" from "src/main.js"
```

**排查步骤**：
```javascript
// 1. 检查模块是否安装
npm list some-module

// 2. 检查导入路径
// ❌ 错误
import { foo } from 'some-module/sub-path'

// ✅ 正确
import { foo } from 'some-module'

// 3. 手动指定预构建
export default {
  optimizeDeps: {
    include: ['some-module']
  }
}

// 4. 清除缓存重试
rm -rf node_modules/.vite
vite --force
```

### 3. HMR 不生效

**排查清单**：
```javascript
// 1. 检查浏览器控制台
// 查看是否有 WebSocket 连接错误

// 2. 检查 HMR 配置
export default {
  server: {
    hmr: {
      overlay: true  // 显示错误覆盖层
    }
  }
}

// 3. 检查文件监听
export default {
  server: {
    watch: {
      usePolling: true  // 某些环境需要
    }
  }
}

// 4. 检查防火墙/代理设置
// WebSocket 连接可能被阻止
```

### 4. 依赖预构建问题

**问题现象**：
```
Error: The following dependencies are imported but could not be resolved
```

**解决方案**：
```javascript
// 1. 强制重新预构建
vite --force

// 2. 手动配置预构建
export default {
  optimizeDeps: {
    include: ['problematic-package'],
    
    // 或排除
    exclude: ['local-package']
  }
}

// 3. 检查 package.json
// 确保 "type": "module" 或依赖支持 ESM
```

## 构建失败诊断

### 1. 内存溢出

**问题现象**：
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**解决方案**：
```json
// package.json
{
  "scripts": {
    "build": "node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build"
  }
}
```

或优化构建配置：
```javascript
export default {
  build: {
    // 减少产物体积
    minify: 'esbuild',
    
    // 禁用 sourcemap
    sourcemap: false,
    
    // 合并小文件
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  }
}
```

### 2. 构建超时

**问题现象**：
```
Build timed out
```

**解决方案**：
```javascript
// 1. 减少文件数量
export default {
  build: {
    rollupOptions: {
      output: {
        // 合并更多文件
        inlineDynamicImports: true
      }
    }
  }
}

// 2. 使用更快的压缩器
export default {
  build: {
    minify: 'esbuild'  // 比 terser 快很多
  }
}

// 3. 排除不必要的文件
export default {
  build: {
    rollupOptions: {
      external: ['large-library']
    }
  }
}
```

### 3. 类型错误

**问题现象**：
```
TypeScript errors in production build
```

**解决方案**：
```bash
# 1. 单独运行类型检查
npm run type-check

# 2. 修复类型错误后再构建
npm run build

# 3. 或临时跳过类型检查（不推荐）
# vite.config.js
export default {
  build: {
    // Vite 默认不检查类型
  }
}
```

## HMR 失效分析

### 诊断工具

```javascript
// 启用 HMR 调试
if (import.meta.hot) {
  // 监听所有 HMR 事件
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    console.log('准备更新:', payload)
  })
  
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    console.log('更新完成:', payload)
  })
  
  import.meta.hot.on('vite:error', (payload) => {
    console.error('HMR 错误:', payload)
  })
  
  import.meta.hot.on('vite:invalidate', (payload) => {
    console.log('模块失效:', payload)
  })
}

// 浏览器控制台
localStorage.setItem('vite:hmr', 'true')
```

### 常见原因

**1. 没有 HMR 边界**：
```javascript
// ❌ 没有接受更新
// utils.js
export function helper() { }

// ✅ 接受自身更新
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

**2. 循环依赖**：
```javascript
// A.js
import B from './B.js'

// B.js
import A from './A.js'

// 可能导致 HMR 失效
// 解决：重构代码，消除循环依赖
```

**3. 副作用代码**：
```javascript
// ❌ 模块级副作用
console.log('模块加载')  // 每次 HMR 都执行

// ✅ 封装在函数中
export function init() {
  console.log('初始化')
}
```

## 性能问题定位

### 启动性能分析

```javascript
// vite.config.js
export default {
  plugins: [
    {
      name: 'startup-timer',
      configResolved() {
        this.startTime = Date.now()
      },
      buildStart() {
        console.log(`启动耗时: ${Date.now() - this.startTime}ms`)
      }
    }
  ]
}
```

### 依赖分析

```bash
# 查看依赖预构建日志
DEBUG=vite:deps vite

# 输出示例：
# vite:deps Crawling dependencies using entries: index.html
# vite:deps Found dependencies: vue, axios, lodash-es
# vite:deps Optimizing dependencies...
# vite:deps Dependencies optimized in 1234ms
```

### HMR 性能分析

```javascript
const hmrStats = {
  updates: [],
  avgTime: 0
}

if (import.meta.hot) {
  let startTime
  
  import.meta.hot.on('vite:beforeUpdate', () => {
    startTime = performance.now()
  })
  
  import.meta.hot.on('vite:afterUpdate', () => {
    const duration = performance.now() - startTime
    hmrStats.updates.push(duration)
    hmrStats.avgTime = hmrStats.updates.reduce((a, b) => a + b, 0) / hmrStats.updates.length
    
    console.log(`HMR: ${duration.toFixed(2)}ms (平均: ${hmrStats.avgTime.toFixed(2)}ms)`)
  })
}
```

## 日志与调试工具

### 启用详细日志

```bash
# Vite 日志
vite --debug

# 特定模块日志
DEBUG=vite:* vite
DEBUG=vite:deps vite
DEBUG=vite:resolve vite
DEBUG=vite:hmr vite
DEBUG=vite:transform vite
```

### 配置日志级别

```javascript
// vite.config.js
export default {
  logLevel: 'info',  // 'info' | 'warn' | 'error' | 'silent'
  
  // 自定义日志
  customLogger: {
    info(msg) {
      console.log('[INFO]', msg)
    },
    warn(msg) {
      console.warn('[WARN]', msg)
    },
    error(msg) {
      console.error('[ERROR]', msg)
    }
  }
}
```

### Chrome DevTools

**1. 网络分析**：
```
Network → 筛选 "JS"
查看模块加载时间和大小
```

**2. 性能分析**：
```
Performance → 录制
查看模块解析和执行时间
```

**3. 源码映射**：
```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true  // 启用 sourcemap
  }
}
```

### Vue DevTools

```javascript
// 安装
npm install -D @vue/devtools

// 启用
if (import.meta.env.DEV) {
  import('@vue/devtools')
}
```

## 常见错误速查表

### 1. "Failed to resolve import"

**原因**：模块未安装或路径错误

**解决**：
```bash
npm install missing-package
# 或
npm install --force
```

### 2. "Unexpected token 'export'"

**原因**：CommonJS 包未被预构建

**解决**：
```javascript
export default {
  optimizeDeps: {
    include: ['commonjs-package']
  }
}
```

### 3. "Cannot find module"

**原因**：TypeScript 路径别名未配置

**解决**：
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 4. "window is not defined"

**原因**：SSR 中使用了浏览器 API

**解决**：
```javascript
if (typeof window !== 'undefined') {
  // 浏览器代码
}

// 或
if (!import.meta.env.SSR) {
  // 浏览器代码
}
```

### 5. "Optimized dependency has changed"

**原因**：依赖更新后缓存未更新

**解决**：
```bash
rm -rf node_modules/.vite
vite --force
```

### 6. "The requested module does not provide an export named"

**原因**：导入的导出不存在

**解决**：
```javascript
// 检查导出
// module.js
export { foo }  // 有 foo

// main.js
import { foo, bar } from './module.js'  // bar 不存在
```

### 7. "This dependency should be excluded"

**原因**：本地包被错误预构建

**解决**：
```javascript
export default {
  optimizeDeps: {
    exclude: ['local-package']
  }
}
```

## 问题排查流程图

```
遇到问题
    ↓
【1. 收集信息】
  - 错误消息
  - 复现步骤
  - 环境信息
    ↓
【2. 查看日志】
  - 浏览器控制台
  - 终端输出
  - Network 面板
    ↓
【3. 尝试基础方案】
  - 清除缓存
  - 重装依赖
  - 重启服务器
    ↓
【4. 针对性排查】
  - 启用调试日志
  - 逐步排除
  - 隔离问题
    ↓
【5. 查阅文档】
  - 官方文档
  - GitHub Issues
  - 社区讨论
    ↓
【6. 寻求帮助】
  - 提 Issue
  - 社区求助
  - 降级版本
```

## 调试技巧集合

### 1. 插件调试

```javascript
export default {
  plugins: [
    {
      name: 'debug-plugin',
      
      // 打印所有钩子调用
      configResolved(config) {
        console.log('configResolved')
      },
      
      resolveId(id) {
        console.log('resolveId:', id)
        return null
      },
      
      load(id) {
        console.log('load:', id)
        return null
      },
      
      transform(code, id) {
        console.log('transform:', id)
        return null
      }
    }
  ]
}
```

### 2. 条件断点

```javascript
// 在特定模块上断点
if (import.meta.url.includes('debug-this')) {
  debugger
}
```

### 3. 性能标记

```javascript
console.time('module-load')
// 代码
console.timeEnd('module-load')
```

### 4. 网络请求分析

```javascript
// 拦截所有请求
if (import.meta.env.DEV) {
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    console.log('Fetch:', args[0])
    return originalFetch.apply(this, args)
  }
}
```

## 生产环境问题

### 1. 白屏问题

**排查步骤**：
```javascript
// 1. 检查路径配置
export default {
  base: '/my-app/',  // 确保与部署路径一致
}

// 2. 检查资源加载
// 浏览器控制台查看 404 错误

// 3. 检查浏览器兼容性
// 使用 @vitejs/plugin-legacy
```

### 2. 样式丢失

**原因**：
- CSS 未被正确提取
- 路径错误

**解决**：
```javascript
export default {
  build: {
    cssCodeSplit: true,
    
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  }
}
```

### 3. 功能异常

**排查**：
```bash
# 1. 本地预览生产构建
npm run build
npm run preview

# 2. 启用 sourcemap
export default {
  build: {
    sourcemap: true
  }
}

# 3. 检查环境变量
console.log(import.meta.env)
```

## 获取帮助

### 1. 准备信息

```markdown
## 问题描述
简洁描述问题

## 复现步骤
1. ...
2. ...

## 预期行为
期望发生什么

## 实际行为
实际发生了什么

## 环境信息
- Vite 版本：5.0.0
- Node 版本：18.0.0
- 操作系统：macOS 13.0
- 浏览器：Chrome 120

## 配置文件
\`\`\`javascript
// vite.config.js
export default { ... }
\`\`\`

## 错误日志
\`\`\`
错误堆栈...
\`\`\`
```

### 2. 提 Issue

- [Vite GitHub Issues](https://github.com/vitejs/vite/issues)
- 搜索现有 Issue
- 提供最小复现仓库

### 3. 社区求助

- [Vite Discord](https://chat.vitejs.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vite)
- [中文社区](https://github.com/vitejs/vite/discussions)

## 参考资料

- [Vite 故障排除](https://cn.vitejs.dev/guide/troubleshooting.html)
- [GitHub Issues](https://github.com/vitejs/vite/issues)
- [Vite Discord](https://chat.vitejs.dev/)
