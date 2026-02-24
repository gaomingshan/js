# HMR 实现原理

## 概述

模块热替换（HMR）是 Vite 的核心特性，通过 WebSocket 实现浏览器与服务器的实时通信。本章深入解析 HMR 通信协议、模块依赖追踪、更新边界计算、状态保持机制等底层实现。

## HMR 通信协议

### WebSocket 连接

Vite 在开发服务器启动时建立 WebSocket 连接：

```javascript
// 客户端（浏览器）
const socket = new WebSocket('ws://localhost:5173')

socket.addEventListener('message', (event) => {
  const payload = JSON.parse(event.data)
  handleHMRMessage(payload)
})

// 服务端（Vite）
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 5173 })

wss.on('connection', (ws) => {
  console.log('客户端已连接')
  
  ws.on('message', (data) => {
    console.log('收到消息:', data)
  })
})
```

### 消息类型

**1. connected - 连接建立**：
```json
{
  "type": "connected"
}
```

**2. update - 模块更新**：
```json
{
  "type": "update",
  "updates": [
    {
      "type": "js-update",
      "path": "/src/App.vue",
      "acceptedPath": "/src/App.vue",
      "timestamp": 1234567890
    }
  ]
}
```

**3. full-reload - 完全重载**：
```json
{
  "type": "full-reload",
  "path": "/src/main.js"
}
```

**4. prune - 清理模块**：
```json
{
  "type": "prune",
  "paths": ["/src/unused.js"]
}
```

**5. error - 错误信息**：
```json
{
  "type": "error",
  "err": {
    "message": "Transform failed",
    "stack": "..."
  }
}
```

### 心跳机制

```javascript
// 服务端发送心跳
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'ping' }))
    }
  })
}, 30000)

// 客户端响应
socket.addEventListener('message', (event) => {
  const payload = JSON.parse(event.data)
  
  if (payload.type === 'ping') {
    socket.send(JSON.stringify({ type: 'pong' }))
  }
})
```

## 模块依赖追踪

### ModuleGraph 结构

```javascript
class ModuleGraph {
  // URL → ModuleNode
  urlToModuleMap = new Map()
  
  // 文件路径 → Set<ModuleNode>
  fileToModulesMap = new Map()
  
  // 模块 ID → ModuleNode
  idToModuleMap = new Map()
  
  // 获取模块
  getModuleById(id) {
    return this.idToModuleMap.get(id)
  }
  
  // 根据文件获取所有相关模块
  getModulesByFile(file) {
    return this.fileToModulesMap.get(file)
  }
}
```

### ModuleNode 结构

```javascript
class ModuleNode {
  url: string                        // 模块 URL
  id: string | null                  // 解析后的 ID
  file: string | null                // 文件系统路径
  
  importers = new Set<ModuleNode>()  // 谁导入了这个模块
  importedModules = new Set<ModuleNode>()  // 这个模块导入了谁
  
  transformResult: {
    code: string
    map: SourceMap | null
  } | null = null
  
  lastHMRTimestamp = 0               // 最后 HMR 时间
  isSelfAccepting = false            // 是否接受自身更新
  acceptedHmrDeps = new Set<ModuleNode>()  // 接受哪些依赖的更新
}
```

### 依赖图构建

```javascript
// 文件修改时
function onFileChange(file: string) {
  // 1. 获取受影响的模块
  const modules = moduleGraph.getModulesByFile(file)
  
  if (!modules) return
  
  // 2. 使模块失效
  modules.forEach(mod => {
    moduleGraph.invalidateModule(mod)
  })
  
  // 3. 计算更新边界
  const hmrContext = []
  modules.forEach(mod => {
    const boundaries = propagateUpdate(mod)
    hmrContext.push(...boundaries)
  })
  
  // 4. 发送 HMR 更新
  sendHMRUpdate(hmrContext)
}
```

### 依赖收集

```javascript
// transform 阶段收集导入
function transform(code: string, id: string) {
  const imports = []
  
  // 解析 import 语句
  code.replace(/import\s+.*?\s+from\s+['"](.+?)['"]/g, (_, path) => {
    imports.push(path)
  })
  
  // 解析动态 import
  code.replace(/import\(['"](.+?)['"]\)/g, (_, path) => {
    imports.push(path)
  })
  
  // 记录依赖关系
  const mod = moduleGraph.getModuleById(id)
  imports.forEach(imp => {
    const depMod = moduleGraph.resolveUrl(imp, id)
    mod.importedModules.add(depMod)
    depMod.importers.add(mod)
  })
  
  return { code, imports }
}
```

## 更新边界计算

### 边界定义

HMR 边界是能够接受更新的模块：

```javascript
// 1. 自接受（self-accepting）
if (import.meta.hot) {
  import.meta.hot.accept()  // 接受自身更新
}

// 2. 接受依赖更新
if (import.meta.hot) {
  import.meta.hot.accept('./dep.js', (newDep) => {
    // 处理依赖更新
  })
}

// 3. 无边界（propagate）
// 没有 HMR API，更新向上传播
```

### 边界查找算法

```javascript
function propagateUpdate(mod: ModuleNode, boundaries = new Set(), visited = new Set()) {
  // 避免循环
  if (visited.has(mod)) return boundaries
  visited.add(mod)
  
  // 1. 检查是否为 HMR 边界
  if (mod.isSelfAccepting) {
    boundaries.add({
      boundary: mod,
      acceptedVia: mod
    })
    return boundaries
  }
  
  // 2. 检查是否有父模块接受此更新
  for (const importer of mod.importers) {
    if (importer.acceptedHmrDeps.has(mod)) {
      boundaries.add({
        boundary: importer,
        acceptedVia: mod
      })
      continue
    }
    
    // 3. 继续向上传播
    propagateUpdate(importer, boundaries, visited)
  }
  
  // 4. 如果到达根模块仍无边界，触发完全重载
  if (boundaries.size === 0 && mod.importers.size === 0) {
    return 'full-reload'
  }
  
  return boundaries
}
```

### 更新类型判断

```javascript
function determineUpdateType(mod: ModuleNode) {
  const file = mod.file
  
  // 1. CSS 更新
  if (file.endsWith('.css')) {
    return {
      type: 'css-update',
      path: mod.url,
      timestamp: Date.now()
    }
  }
  
  // 2. Vue SFC 更新
  if (file.endsWith('.vue')) {
    // 检查是否仅样式变化
    const prevDescriptor = cache.get(file)
    const newDescriptor = parseVue(file)
    
    if (onlyStyleChanged(prevDescriptor, newDescriptor)) {
      return {
        type: 'css-update',
        path: mod.url + '?type=style',
        timestamp: Date.now()
      }
    }
    
    // 模板或脚本变化
    return {
      type: 'js-update',
      path: mod.url,
      timestamp: Date.now()
    }
  }
  
  // 3. JavaScript 更新
  return {
    type: 'js-update',
    path: mod.url,
    timestamp: Date.now()
  }
}
```

## 热更新应用流程

### 客户端处理

```javascript
// @vite/client 简化实现
async function handleHMRUpdate(payload) {
  const { type, updates } = payload
  
  if (type === 'update') {
    for (const update of updates) {
      if (update.type === 'js-update') {
        await handleJSUpdate(update)
      } else if (update.type === 'css-update') {
        await handleCSSUpdate(update)
      }
    }
  } else if (type === 'full-reload') {
    location.reload()
  }
}

// JavaScript 模块更新
async function handleJSUpdate(update) {
  const { path, acceptedPath, timestamp } = update
  
  // 1. 获取模块
  const mod = hotModulesMap.get(path)
  if (!mod) return
  
  // 2. 清除旧模块缓存
  moduleCache.delete(path)
  
  // 3. 导入新模块
  const newMod = await import(`${path}?t=${timestamp}`)
  
  // 4. 执行 HMR 回调
  if (mod.callbacks) {
    mod.callbacks.forEach(cb => cb(newMod))
  }
  
  // 5. 触发更新事件
  mod.dispatchEvent(new CustomEvent('vite:beforeUpdate'))
  
  // 应用更新...
  
  mod.dispatchEvent(new CustomEvent('vite:afterUpdate'))
}

// CSS 更新
async function handleCSSUpdate(update) {
  const { path, timestamp } = update
  
  // 查找对应的 link 或 style 标签
  const el = document.querySelector(`link[href*="${path}"]`) ||
             document.querySelector(`style[data-vite-dev-id*="${path}"]`)
  
  if (el) {
    if (el.tagName === 'LINK') {
      // 更新 link href
      const newPath = `${path}?t=${timestamp}`
      const newEl = el.cloneNode()
      newEl.href = newPath
      el.after(newEl)
      
      newEl.addEventListener('load', () => {
        el.remove()
      })
    } else {
      // 更新 style 内容
      const response = await fetch(`${path}?t=${timestamp}`)
      const css = await response.text()
      el.textContent = css
    }
  }
}
```

### Vue HMR 集成

```javascript
// @vitejs/plugin-vue 简化实现
if (import.meta.hot) {
  // 创建 HMR 记录
  const __VUE_HMR_RUNTIME__ = {
    createRecord(id, initialDef) {
      this.map.set(id, initialDef)
    },
    
    rerender(id, render) {
      const record = this.map.get(id)
      record.instances.forEach(instance => {
        instance.$forceUpdate()
      })
    },
    
    reload(id, newDef) {
      const record = this.map.get(id)
      record.instances.forEach(instance => {
        instance.$options = newDef
        instance.$forceUpdate()
      })
    }
  }
  
  // 接受自身更新
  import.meta.hot.accept((newModule) => {
    if (!newModule) return
    
    const { render, __hmrId } = newModule
    
    // 仅模板变化 → rerender
    if (render) {
      __VUE_HMR_RUNTIME__.rerender(__hmrId, render)
    }
    // 脚本变化 → reload
    else {
      __VUE_HMR_RUNTIME__.reload(__hmrId, newModule)
    }
  })
}
```

## 状态保持机制

### 数据共享

```javascript
// 在更新间共享数据
if (import.meta.hot) {
  // 获取旧数据
  const oldData = import.meta.hot.data
  
  // 当前状态
  const currentState = {
    count: 100,
    user: { name: 'John' }
  }
  
  // 应用更新
  import.meta.hot.accept((newModule) => {
    // 使用旧数据
    if (oldData.state) {
      Object.assign(currentState, oldData.state)
    }
    
    // 应用新逻辑
    newModule.init(currentState)
  })
  
  // 保存数据供下次使用
  import.meta.hot.dispose((data) => {
    data.state = currentState
  })
}
```

### Vue 组件状态保持

```javascript
// Vue 组件自动保持状态
<script setup>
// 这个 ref 在热更新时会保持值
const count = ref(0)

// 模板或其他代码更新时，count 的值不会丢失
</script>
```

**实现原理**：
```javascript
// Vue HMR Runtime
class VueComponentRecord {
  instances = new Set()
  
  rerender(newRender) {
    this.instances.forEach(instance => {
      // 保持实例状态
      // 只更新渲染函数
      instance.render = newRender
      instance.$forceUpdate()
    })
  }
}
```

### Pinia Store 状态保持

```javascript
// store.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'John',
    age: 30
  })
})

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Pinia 自动处理 store 热更新
    // 状态会被保持
  })
}
```

## HMR 性能瓶颈分析

### 性能指标

```javascript
// 测量 HMR 性能
const hmrStats = {
  updateCount: 0,
  totalTime: 0,
  avgTime: 0
}

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    hmrStats.start = performance.now()
  })
  
  import.meta.hot.on('vite:afterUpdate', () => {
    const duration = performance.now() - hmrStats.start
    hmrStats.updateCount++
    hmrStats.totalTime += duration
    hmrStats.avgTime = hmrStats.totalTime / hmrStats.updateCount
    
    console.log(`HMR: ${duration.toFixed(2)}ms (平均: ${hmrStats.avgTime.toFixed(2)}ms)`)
  })
}
```

### 常见瓶颈

**1. 大文件转换**：
```javascript
// 500KB 的文件转换可能需要 100-200ms
// 解决方案：拆分大文件
```

**2. 依赖链过长**：
```javascript
// A → B → C → D → E → F (深层依赖)
// 修改 F 需要传播到 A
// 解决方案：减少依赖层级
```

**3. 重复转换**：
```javascript
// 多个模块导入同一个模块
// 可能触发多次转换
// 解决方案：使用缓存
```

### 优化策略

```javascript
// 1. 缓存转换结果
const transformCache = new Map()

function transform(code, id) {
  const cached = transformCache.get(id)
  if (cached && cached.timestamp > lastModified) {
    return cached.result
  }
  
  const result = actualTransform(code)
  transformCache.set(id, {
    result,
    timestamp: Date.now()
  })
  
  return result
}

// 2. 批量更新
const pendingUpdates = []
let updateTimer = null

function queueUpdate(update) {
  pendingUpdates.push(update)
  
  if (!updateTimer) {
    updateTimer = setTimeout(() => {
      sendBatchUpdate(pendingUpdates)
      pendingUpdates.length = 0
      updateTimer = null
    }, 50)  // 50ms 内的更新合并
  }
}
```

## 调试技巧

### 1. 启用 HMR 日志

```javascript
// 客户端
localStorage.setItem('vite:hmr', 'true')

// 查看详细日志
```

### 2. 监听 HMR 事件

```javascript
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    console.log('即将更新:', payload)
  })
  
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    console.log('更新完成:', payload)
  })
  
  import.meta.hot.on('vite:error', (payload) => {
    console.error('HMR 错误:', payload)
  })
}
```

### 3. 查看模块图

```javascript
// 服务端插件
export default {
  name: 'debug-hmr',
  
  handleHotUpdate({ file, server, modules }) {
    console.log('文件变化:', file)
    console.log('受影响模块:', modules.length)
    
    modules.forEach(mod => {
      console.log('  -', mod.url)
      console.log('    导入者:', mod.importers.size)
    })
    
    return modules
  }
}
```

## 实战案例

### 案例：大型组件库 HMR 优化

**问题**：组件修改后 HMR 需要 2-3 秒

**分析**：
```javascript
// 组件库结构
components/
  ├── index.js         # 导出所有组件（问题所在）
  ├── Button/
  ├── Input/
  └── Dialog/

// index.js
export * from './Button'
export * from './Input'
export * from './Dialog'
// ... 100+ 个组件
```

**优化方案**：
```javascript
// 1. 按需导入，不使用 index.js
// ❌ 避免
import { Button } from 'my-ui'

// ✅ 推荐
import Button from 'my-ui/Button'

// 2. 组件独立注册 HMR
// Button/index.vue
if (import.meta.hot) {
  import.meta.hot.accept()  // 独立边界
}
```

**效果**：HMR 时间从 2-3s 降至 100-200ms

## 参考资料

- [Vite HMR API](https://cn.vitejs.dev/guide/api-hmr.html)
- [Webpack HMR](https://webpack.js.org/concepts/hot-module-replacement/)
- [ES Module HMR Spec](https://github.com/FredKSchott/esm-hmr)
