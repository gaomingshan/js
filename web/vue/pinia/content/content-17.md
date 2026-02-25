# 5.2 常见踩坑与解决方案

## 概述

本节总结在使用 Pinia 过程中常见的错误和陷阱，以及相应的解决方案，帮助开发者避免这些问题。

## 解构响应式丢失问题

### 问题描述

直接解构 Store 会导致响应式丢失：

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ❌ 错误：解构后失去响应式
const { name, age } = userStore

console.log(name) // 'Alice'
userStore.name = 'Bob'
console.log(name) // 仍然是 'Alice'！
</script>

<template>
  <!-- ❌ 不会更新 -->
  <div>{{ name }}</div>
</template>
```

### 解决方案

使用 `storeToRefs` 保持响应式：

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ✅ 正确：使用 storeToRefs
const { name, age } = storeToRefs(userStore)

// name 和 age 现在是 ref，保持响应式
console.log(name.value) // 'Alice'
userStore.name = 'Bob'
console.log(name.value) // 'Bob' ✅

// Actions 可以直接解构
const { updateName, fetchUser } = userStore
</script>

<template>
  <!-- ✅ 会响应更新 -->
  <div>{{ name }}</div>
</template>
```

### 关键点

- **State 和 Getters**：必须用 `storeToRefs`
- **Actions**：可以直接解构（函数不需要响应式）

```javascript
const { state1, state2, getter1 } = storeToRefs(store)  // ✅
const { action1, action2 } = store                       // ✅
```

## 循环依赖陷阱

### 问题描述

两个 Store 相互引用导致循环依赖：

```javascript
// ❌ stores/a.js
import { useBStore } from './b'

export const useAStore = defineStore('a', {
  actions: {
    doSomething() {
      const b = useBStore()
      b.doOther()
    }
  }
})

// ❌ stores/b.js
import { useAStore } from './a'

export const useBStore = defineStore('b', {
  actions: {
    doOther() {
      const a = useAStore()
      a.doSomething() // 循环依赖！
    }
  }
})
```

### 解决方案 1：重构依赖关系

提取共享逻辑到第三个 Store：

```javascript
// stores/shared.js
export const useSharedStore = defineStore('shared', {
  actions: {
    commonLogic() {
      // 共享逻辑
    }
  }
})

// stores/a.js
import { useSharedStore } from './shared'

export const useAStore = defineStore('a', {
  actions: {
    doSomething() {
      const shared = useSharedStore()
      shared.commonLogic()
    }
  }
})

// stores/b.js
import { useSharedStore } from './shared'

export const useBStore = defineStore('b', {
  actions: {
    doOther() {
      const shared = useSharedStore()
      shared.commonLogic()
    }
  }
})
```

### 解决方案 2：延迟导入

```javascript
// stores/a.js
export const useAStore = defineStore('a', {
  actions: {
    async doSomething() {
      // 在函数内部动态导入
      const { useBStore } = await import('./b')
      const b = useBStore()
      b.doOther()
    }
  }
})
```

### 解决方案 3：使用事件总线

```javascript
// utils/eventBus.js
export const eventBus = {
  events: {},
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  },
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data))
    }
  }
}

// stores/a.js
import { eventBus } from '@/utils/eventBus'

export const useAStore = defineStore('a', {
  actions: {
    doSomething() {
      // 发送事件而不是直接调用
      eventBus.emit('a:something', { data: 'xxx' })
    }
  }
})

// stores/b.js
import { eventBus } from '@/utils/eventBus'

export const useBStore = defineStore('b', () => {
  // 监听事件
  eventBus.on('a:something', (data) => {
    console.log('收到事件:', data)
  })
  
  return {}
})
```

## HMR 热更新问题

### 问题描述

开发时修改 Store 后，状态没有正确更新或丢失：

```javascript
// ❌ 热更新时状态会重置
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  })
})
```

### 解决方案

使用 Vite 的 HMR API：

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  })
})

// 开发环境支持热更新
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 保留当前状态
    const currentState = useUserStore().$state
    
    // 更新 Store 定义
    newModule.useUserStore()
    
    // 恢复状态
    useUserStore().$patch(currentState)
  })
}
```

### Pinia 插件方案

```javascript
// plugins/hmr.js
export function hmrPlugin({ store }) {
  if (import.meta.hot) {
    // 保存状态
    import.meta.hot.dispose(() => {
      import.meta.hot.data[store.$id] = store.$state
    })
    
    // 恢复状态
    const savedState = import.meta.hot.data[store.$id]
    if (savedState) {
      store.$patch(savedState)
    }
  }
}
```

## Actions 中 this 指向

### 问题描述

箭头函数中 `this` 不指向 Store：

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  actions: {
    // ❌ 错误：箭头函数，this 不指向 Store
    increment: () => {
      this.count++ // undefined!
    }
  }
})
```

### 解决方案

使用普通函数：

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  actions: {
    // ✅ 正确：普通函数
    increment() {
      this.count++ // 正确
    },
    
    // ✅ 正确：async 函数
    async fetchData() {
      const data = await api.get()
      this.data = data // 正确
    }
  }
})
```

### Setup Store 中的处理

```javascript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  
  // ✅ 箭头函数和普通函数都可以
  const increment = () => {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,
    increment,
    decrement
  }
})
```

## 在 Pinia 注册前使用 Store

### 问题描述

在应用挂载前使用 Store 会报错：

```javascript
// ❌ 错误
import { useUserStore } from '@/stores/user'

const userStore = useUserStore() // 错误！Pinia 未注册

import { createApp } from 'vue'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

### 解决方案

确保在 Pinia 注册后使用：

```javascript
// ✅ 正确
import { createApp } from 'vue'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')

// 现在可以使用
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
```

### 在组件中使用

```vue
<script setup>
// ✅ 在组件中使用始终是安全的
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
```

## Setup Store 缺少 $reset

### 问题描述

Setup 语法定义的 Store 不支持 `$reset()`：

```javascript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  return { count }
})

const store = useCounterStore()
store.$reset() // ❌ 错误！undefined
```

### 解决方案

手动实现 $reset：

```javascript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Counter')
  
  // 保存初始值
  const initialState = {
    count: 0,
    name: 'Counter'
  }
  
  // 手动实现 $reset
  function $reset() {
    count.value = initialState.count
    name.value = initialState.name
  }
  
  return {
    count,
    name,
    $reset
  }
})

// 使用
const store = useCounterStore()
store.$reset() // ✅ 正确
```

### 使用插件统一处理

```javascript
// plugins/reset.js
export function resetPlugin({ store, options }) {
  // 保存初始状态
  const initialState = options.state ? options.state() : {}
  
  // 为 Setup Store 添加 $reset
  if (!store.$reset) {
    store.$reset = function() {
      this.$patch(($state) => {
        Object.assign($state, initialState)
      })
    }
  }
}
```

## 异步初始化问题

### 问题描述

Store 初始化需要异步数据，但访问时数据未就绪：

```javascript
// ❌ 问题代码
export const useConfigStore = defineStore('config', {
  state: () => ({
    config: null
  }),
  
  actions: {
    async init() {
      this.config = await fetch('/api/config').then(r => r.json())
    }
  }
})

// 使用时
const config = useConfigStore()
console.log(config.config) // null！还未初始化
```

### 解决方案 1：应用启动时初始化

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useConfigStore } from '@/stores/config'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

// 初始化关键 Store
const configStore = useConfigStore()
await configStore.init()

// 初始化完成后挂载应用
app.mount('#app')
```

### 解决方案 2：使用加载状态

```javascript
export const useConfigStore = defineStore('config', {
  state: () => ({
    config: null,
    loading: false,
    initialized: false
  }),
  
  actions: {
    async init() {
      if (this.initialized) return
      
      this.loading = true
      try {
        this.config = await fetch('/api/config').then(r => r.json())
        this.initialized = true
      } finally {
        this.loading = false
      }
    },
    
    async ensureInitialized() {
      if (!this.initialized) {
        await this.init()
      }
    }
  }
})

// 使用
const config = useConfigStore()
await config.ensureInitialized()
console.log(config.config) // ✅ 已初始化
```

## 其他常见错误与调试技巧

### 错误 1：修改 Getter 返回的引用

```javascript
// ❌ 错误
getters: {
  todos: (state) => state.todos
}

// 组件中
const store = useTodoStore()
store.todos.push(item) // 直接修改 getter 返回的数组
```

**解决**：在 Action 中修改

```javascript
// ✅ 正确
actions: {
  addTodo(item) {
    this.todos.push(item)
  }
}
```

### 错误 2：忘记返回 Setup Store 的内容

```javascript
// ❌ 错误
export const useStore = defineStore('store', () => {
  const count = ref(0)
  // 忘记返回！
})

// ✅ 正确
export const useStore = defineStore('store', () => {
  const count = ref(0)
  return { count } // 必须返回
})
```

### 错误 3：在插件中修改所有 Store

```javascript
// ❌ 不好：影响所有 Store
pinia.use(({ store }) => {
  store.commonProperty = 'value' // 所有 Store 都会有这个属性
})

// ✅ 好：选择性添加
pinia.use(({ store }) => {
  if (store.$id === 'specific') {
    store.specialProperty = 'value'
  }
})
```

### 调试技巧

```javascript
// 1. 监控所有 Store 的变化
pinia.use(({ store }) => {
  store.$subscribe((mutation, state) => {
    console.log(`[${store.$id}] State changed:`, mutation.type)
    console.log('New state:', state)
  })
  
  store.$onAction(({ name, args }) => {
    console.log(`[${store.$id}] Action ${name}`, args)
  })
})

// 2. 在 DevTools 中查看
// Vue DevTools 自动集成 Pinia

// 3. 导出当前状态
const currentState = pinia.state.value
console.log(JSON.stringify(currentState, null, 2))
```

## 关键点总结

1. **解构问题**：State/Getters 使用 `storeToRefs`
2. **循环依赖**：重构依赖、延迟导入、事件总线
3. **HMR 问题**：保存和恢复状态
4. **this 指向**：使用普通函数，避免箭头函数
5. **$reset 缺失**：Setup Store 需手动实现

## 深入一点

### 完整的错误处理

```javascript
export const useApiStore = defineStore('api', {
  state: () => ({
    errors: []
  }),
  
  actions: {
    async request(url, options) {
      try {
        const response = await fetch(url, options)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        // 记录错误
        this.errors.push({
          message: error.message,
          url,
          timestamp: Date.now()
        })
        
        // 通知用户
        console.error('API 请求失败:', error)
        
        // 重新抛出让调用者处理
        throw error
      }
    }
  }
})
```

### 类型安全的陷阱

```typescript
// ❌ TypeScript 陷阱
const { name } = storeToRefs(store)
name = 'Alice' // 类型错误：不能重新赋值

// ✅ 正确
name.value = 'Alice'
```

## 参考资料

- [Pinia 常见问题](https://pinia.vuejs.org/cookbook/)
- [Vue DevTools](https://devtools.vuejs.org/)
- [JavaScript 模块循环依赖](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#cyclic_imports)
