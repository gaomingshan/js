# 1.2 快速入门与安装配置

## 概述

本节介绍如何在 Vue 3 项目中安装和配置 Pinia，包括基本的使用方法和开发工具集成，让你快速上手 Pinia 状态管理。

## 安装与项目集成

### 1. 安装依赖

```bash
# npm
npm install pinia

# yarn
yarn add pinia

# pnpm
pnpm add pinia
```

### 2. 版本要求

- Vue 3.2+（推荐使用最新版本）
- TypeScript 4.5+（如果使用 TS）

### 3. 项目结构建议

```
src/
├── stores/           # Pinia Store 目录
│   ├── index.js     # 导出 Pinia 实例
│   ├── counter.js   # 计数器 Store
│   └── user.js      # 用户 Store
├── main.js          # 应用入口
└── App.vue
```

## 创建 Pinia 实例

### 基本创建

在 `src/stores/index.js` 中创建 Pinia 实例：

```javascript
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```

### 注册到 Vue 应用

在 `src/main.js` 中注册 Pinia：

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'

const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

### 完整示例

```javascript
// src/stores/index.js
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'

createApp(App)
  .use(pinia)
  .mount('#app')
```

## 创建第一个 Store

### 定义 Store

在 `src/stores/counter.js` 中定义一个计数器 Store：

```javascript
import { defineStore } from 'pinia'

// 参数1：Store ID（必须唯一）
// 参数2：Options 对象
export const useCounterStore = defineStore('counter', {
  // 状态
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  
  // 计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
    greeting: (state) => `Hello from ${state.name}`
  },
  
  // 方法
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    incrementBy(amount) {
      this.count += amount
    }
  }
})
```

### 在组件中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

// 获取 Store 实例
const counter = useCounterStore()
</script>

<template>
  <div>
    <h2>{{ counter.name }}</h2>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <p>{{ counter.greeting }}</p>
    
    <button @click="counter.increment">+1</button>
    <button @click="counter.decrement">-1</button>
    <button @click="counter.incrementBy(10)">+10</button>
  </div>
</template>
```

## Vue 应用中的注册与使用

### 选项式 API 中使用

```vue
<script>
import { useCounterStore } from '@/stores/counter'

export default {
  computed: {
    counter() {
      return useCounterStore()
    }
  },
  methods: {
    handleIncrement() {
      this.counter.increment()
    }
  }
}
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <button @click="handleIncrement">+1</button>
  </div>
</template>
```

### 组合式 API 中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

function handleClick() {
  counter.increment()
}
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <button @click="handleClick">+1</button>
  </div>
</template>
```

### 在非组件文件中使用

在路由守卫、工具函数等非组件文件中使用 Store：

```javascript
// router/index.js
import { createRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  // ...
})

router.beforeEach((to, from) => {
  // ⚠️ 确保在应用挂载后调用
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return '/login'
  }
})

export default router
```

## 开发工具配置（Vue DevTools）

### 1. 安装 Vue DevTools

确保安装了 [Vue DevTools](https://devtools.vuejs.org/) 浏览器扩展（Chrome/Firefox/Edge）。

### 2. Pinia DevTools 自动集成

Pinia 会自动集成到 Vue DevTools 中，无需额外配置：

- **查看所有 Store**：在 DevTools 的 Pinia 面板查看所有 Store 列表
- **实时状态监控**：查看 State、Getters 的实时值
- **时间旅行**：回溯状态变化历史
- **编辑状态**：直接在 DevTools 中修改 State 进行调试

### 3. 开发环境配置

```javascript
// src/stores/index.js
import { createPinia } from 'pinia'

const pinia = createPinia()

// 开发环境下启用额外的调试信息
if (import.meta.env.DEV) {
  pinia.use(({ store }) => {
    console.log(`Store ${store.$id} 已初始化`)
  })
}

export default pinia
```

### 4. DevTools 功能详解

**状态面板**：
- 查看当前所有 Store 的状态树
- 实时更新，无需刷新

**时间旅行**：
- 记录每次状态变更
- 点击历史记录可回到特定状态
- 对比不同时间点的状态差异

**导出/导入状态**：
```javascript
// 在 DevTools 控制台中
const state = $s('counter') // 获取 counter Store
console.log(state.count) // 查看状态
state.count = 100 // 直接修改状态（仅开发环境）
```

## 关键点总结

1. **安装简单**：`npm install pinia` 即可
2. **三步上手**：创建实例 → 注册到应用 → 定义 Store
3. **命名规范**：Store ID 使用小写短横线，Hook 使用 `useXxxStore`
4. **开发体验**：自动集成 Vue DevTools，支持时间旅行调试
5. **兼容性**：支持选项式和组合式两种 API 风格

## 深入一点

### 多个 Pinia 实例（高级场景）

某些场景下需要创建多个 Pinia 实例（如测试、SSR）：

```javascript
import { createPinia } from 'pinia'

// 应用实例 1
const pinia1 = createPinia()
app1.use(pinia1)

// 应用实例 2
const pinia2 = createPinia()
app2.use(pinia2)
```

### 插件系统预览

Pinia 支持插件扩展功能：

```javascript
import { createPinia } from 'pinia'

const pinia = createPinia()

// 添加持久化插件示例
pinia.use(({ store }) => {
  // 从 localStorage 恢复状态
  const saved = localStorage.getItem(store.$id)
  if (saved) {
    store.$patch(JSON.parse(saved))
  }
  
  // 监听变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
})

export default pinia
```

### TypeScript 项目配置

```typescript
// src/stores/counter.ts
import { defineStore } from 'pinia'

interface CounterState {
  count: number
  name: string
}

export const useCounterStore = defineStore('counter', {
  state: (): CounterState => ({
    count: 0,
    name: 'Counter'
  }),
  
  getters: {
    doubleCount: (state): number => state.count * 2
  },
  
  actions: {
    increment(): void {
      this.count++
    }
  }
})
```

### 常见错误与解决

**错误 1：在 Pinia 注册前使用 Store**
```javascript
// ❌ 错误
const counter = useCounterStore() // Pinia 还未注册
app.use(pinia)

// ✅ 正确
app.use(pinia)
const counter = useCounterStore()
```

**错误 2：重复的 Store ID**
```javascript
// ❌ 错误
defineStore('user', {}) // ID 重复
defineStore('user', {})

// ✅ 正确
defineStore('user', {})
defineStore('admin', {})
```

## 参考资料

- [Pinia 安装指南](https://pinia.vuejs.org/getting-started.html)
- [Vue DevTools](https://devtools.vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)（推荐的构建工具）
