# 模块热替换（HMR）

## 概述

模块热替换（Hot Module Replacement，HMR）是 Vite 的核心特性之一，允许在运行时更新模块而无需刷新整个页面。Vite 的 HMR 基于 ESM，实现了极速的模块更新体验。

## HMR 工作原理

### 传统热更新（Webpack）

```
1. 文件改动
2. 重新编译模块 + 依赖链（可能很大）
3. 通过 WebSocket 推送更新
4. 浏览器接收并应用更新
时间：2-5秒
```

### Vite HMR 流程

```
1. 文件改动（如 Button.vue）
2. Vite 检测到文件变化
3. 仅重新转换 Button.vue
4. 通过 WebSocket 推送更新信息
5. 浏览器接收并替换模块
6. 触发模块的 HMR 回调
时间：50-200ms
```

**关键优势**：
- 只更新改动的模块
- 无需重新构建依赖图
- 基于 ESM 的精确更新

### HMR 边界

```javascript
// 更新传播链
Button.vue (修改)
    ↓
父组件接受更新 → HMR 边界
    ↓
其他组件不受影响
```

如果组件没有接受更新，HMR 会向上传播直到遇到边界或刷新整个页面。

## Vite HMR API

### 基础 API

```javascript
// 接受自身更新
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 使用新模块更新
    console.log('模块已更新', newModule)
  })
}
```

### 接受依赖更新

```javascript
// main.js
import { config } from './config.js'

if (import.meta.hot) {
  // 接受 config.js 的更新
  import.meta.hot.accept('./config.js', (newConfig) => {
    // 应用新配置
    applyConfig(newConfig)
  })
}
```

### 处理多个依赖

```javascript
if (import.meta.hot) {
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFoo, newBar]) => {
      // 更新 foo 和 bar
    }
  )
}
```

### 数据共享

```javascript
// 在更新间共享数据
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 从旧模块获取数据
    const oldData = import.meta.hot.data.state
    
    // 应用到新模块
    newModule.setState(oldData)
  })
  
  // 存储数据供下次更新使用
  import.meta.hot.dispose((data) => {
    data.state = currentState
  })
}
```

### 完全重载

```javascript
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 如果无法热更新，触发完全重载
    if (!isCompatible(newModule)) {
      import.meta.hot.invalidate()
    }
  })
}
```

## 框架集成

### Vue HMR

Vue 3 通过 `@vitejs/plugin-vue` 自动支持 HMR：

```vue
<!-- Button.vue -->
<template>
  <button>{{ text }}</button>
</template>

<script setup>
import { ref } from 'vue'
const text = ref('Click me')
</script>

<style scoped>
button { color: red; }
</style>
```

**更新行为**：
- 修改 `<template>`：仅更新渲染函数
- 修改 `<script>`：重新执行逻辑但保持状态
- 修改 `<style>`：仅更新样式

**状态保持**：
```vue
<script setup>
// 计数器状态在热更新时保持
const count = ref(0)
</script>

<!-- 修改模板后，count 的值不会丢失 -->
```

### React HMR

React 使用 `@vitejs/plugin-react` 支持 Fast Refresh：

```jsx
// Button.jsx
import { useState } from 'react'

export default function Button() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

**Fast Refresh 规则**：
- 组件必须是默认导出或命名导出
- 修改组件时保持 state
- 修改 hooks 时重新挂载

**注意事项**：
```jsx
// ✅ 支持 Fast Refresh
export default function App() { ... }

// ✅ 支持
export function Button() { ... }

// ❌ 不支持（匿名函数）
export default () => { ... }
```

## HMR 边界与失效场景

### HMR 边界

```javascript
// App.vue（HMR 边界）
import Button from './Button.vue'

// Button.vue 修改时：
// 1. Button.vue 接受更新
// 2. 不影响 App.vue
// 3. 组件状态保持
```

### 失效场景

**1. 修改非 HMR 支持的文件**：
```javascript
// vite.config.js 修改
// → 需要重启服务器

// .env 文件修改
// → 需要重启服务器
```

**2. 更新传播失败**：
```javascript
// store.js
export const state = { count: 0 }

// main.js
import { state } from './store.js'

// 修改 store.js 时：
// main.js 没有接受更新 → 触发整页刷新
```

**解决方案**：
```javascript
// main.js
if (import.meta.hot) {
  import.meta.hot.accept('./store.js', (newStore) => {
    Object.assign(state, newStore.state)
  })
}
```

**3. 循环依赖**：
```javascript
// A.js
import B from './B.js'

// B.js
import A from './A.js'

// 可能导致 HMR 失效
```

## 自定义 HMR 逻辑

### 配置文件热更新

```javascript
// config.js
export const apiUrl = 'https://api.example.com'

// main.js
import { apiUrl } from './config.js'

if (import.meta.hot) {
  import.meta.hot.accept('./config.js', (newConfig) => {
    // 更新 API URL
    window.API_URL = newConfig.apiUrl
    console.log('API URL 已更新:', newConfig.apiUrl)
  })
}
```

### 状态管理 HMR

```javascript
// store.js
class Store {
  constructor() {
    this.state = { count: 0 }
  }
  
  increment() {
    this.state.count++
  }
}

export const store = new Store()

// HMR 支持
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 保持旧状态
    const oldState = store.state
    // 使用新代码
    Object.setPrototypeOf(store, newModule.Store.prototype)
    // 恢复状态
    store.state = oldState
  })
}
```

### 样式热更新

```javascript
// theme.js
export const theme = {
  primaryColor: '#409eff',
  fontSize: '14px',
}

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 应用新主题
    document.documentElement.style.setProperty(
      '--primary-color',
      newModule.theme.primaryColor
    )
  })
}
```

## HMR 性能优化

### 1. 精确的更新边界

```javascript
// ✅ 好的实践
// Button.vue 独立，修改不影响父组件
<template>
  <button @click="handleClick">
    {{ text }}
  </button>
</template>

// ❌ 不好的实践
// 所有逻辑都在 App.vue 中，任何修改都要重新加载整个应用
```

### 2. 避免副作用

```javascript
// ❌ 避免模块级副作用
// utils.js
console.log('模块加载')  // 每次 HMR 都会执行

// ✅ 将副作用放在函数中
export function init() {
  console.log('初始化')
}
```

### 3. 使用 accept 而非 invalidate

```javascript
// ✅ 接受更新（快速）
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 应用更新
  })
}

// ❌ 使页面失效（需要完全重载）
if (import.meta.hot) {
  import.meta.hot.invalidate()
}
```

### 4. 优化大型组件

```javascript
// 将大组件拆分为小组件
// App.vue
import Header from './Header.vue'
import Content from './Content.vue'
import Footer from './Footer.vue'

// 修改 Content 时，Header 和 Footer 不会更新
```

## 常见问题

### 1. HMR 不生效

**检查清单**：
```javascript
// 1. 确认浏览器支持 ESM
// 2. 检查是否有语法错误
// 3. 查看控制台是否有 HMR 错误
// 4. 确认文件在 HMR 边界内
```

### 2. 状态丢失

```javascript
// 原因：组件被完全重新加载
// 解决：使用 HMR API 保持状态

if (import.meta.hot) {
  let state = {}
  
  import.meta.hot.dispose((data) => {
    data.state = state
  })
  
  import.meta.hot.accept((newModule) => {
    state = import.meta.hot.data.state
  })
}
```

### 3. 样式闪烁

```javascript
// 原因：CSS 完全替换
// 解决：使用 CSS Modules 或 scoped
```

## 工程实践建议

### HMR 开发配置

```javascript
// vite.config.js
export default {
  server: {
    hmr: {
      // HMR 端口（默认与 server.port 相同）
      port: 3000,
      
      // HMR 主机
      host: 'localhost',
      
      // 协议
      protocol: 'ws',
      
      // 覆盖路径
      path: '/__vite_hmr',
      
      // 超时时间
      timeout: 30000,
      
      // 自定义 overlay
      overlay: true,
    }
  }
}
```

### 调试 HMR

```javascript
// 开启 HMR 调试日志
localStorage.setItem('vite:hmr', 'true')

// 查看 HMR 更新信息
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    console.log('准备更新:', payload)
  })
  
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    console.log('更新完成:', payload)
  })
}
```

## 参考资料

- [Vite HMR API](https://cn.vitejs.dev/guide/api-hmr.html)
- [Vue HMR](https://cn.vitejs.dev/guide/features.html#hot-module-replacement)
- [React Fast Refresh](https://github.com/facebook/react/tree/main/packages/react-refresh)
