# 第 13 节：组合式函数

## 概述

组合式函数（Composables）是利用 Vue 组合式 API 封装和复用有状态逻辑的函数。它是 Vue 3 推荐的逻辑复用方式，替代了 Vue 2 的 Mixins。

## 一、什么是组合式函数

### 1.1 基本概念

```javascript
// useCounter.js - 一个简单的组合式函数
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = initialValue
  }
  
  return {
    count,
    increment,
    decrement,
    reset
  }
}
```

```vue
<!-- 使用 -->
<template>
  <p>{{ count }}</p>
  <button @click="increment">+</button>
  <button @click="decrement">-</button>
</template>

<script setup>
import { useCounter } from './useCounter'

const { count, increment, decrement } = useCounter(10)
</script>
```

### 1.2 命名约定

```javascript
// 以 use 开头
useCounter()
useMouse()
useFetch()
useLocalStorage()
```

## 二、常用组合式函数

### 2.1 useMouse - 鼠标位置

```javascript
// useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }
  
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))
  
  return { x, y }
}
```

```vue
<template>
  <p>鼠标位置: {{ x }}, {{ y }}</p>
</template>

<script setup>
import { useMouse } from './useMouse'
const { x, y } = useMouse()
</script>
```

### 2.2 useFetch - 数据请求

```javascript
// useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(true)
  
  async function fetchData() {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(toValue(url))
      data.value = await res.json()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  
  watchEffect(() => {
    fetchData()
  })
  
  return { data, error, loading, refetch: fetchData }
}
```

```vue
<script setup>
import { useFetch } from './useFetch'

const { data, error, loading } = useFetch('/api/users')
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误: {{ error.message }}</div>
  <ul v-else>
    <li v-for="user in data" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

### 2.3 useLocalStorage - 本地存储

```javascript
// useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const data = ref(stored ? JSON.parse(stored) : defaultValue)
  
  watch(data, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })
  
  return data
}
```

```vue
<script setup>
import { useLocalStorage } from './useLocalStorage'

const theme = useLocalStorage('theme', 'light')
const settings = useLocalStorage('settings', { notifications: true })
</script>
```

### 2.4 useDebounce - 防抖

```javascript
// useDebounce.js
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  let timer = null
  
  watch(value, (newValue) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })
  
  return debouncedValue
}
```

```vue
<script setup>
import { ref, watch } from 'vue'
import { useDebounce } from './useDebounce'

const searchText = ref('')
const debouncedSearch = useDebounce(searchText, 500)

watch(debouncedSearch, (value) => {
  // 只在用户停止输入 500ms 后执行搜索
  console.log('搜索:', value)
})
</script>
```

### 2.5 useToggle - 开关

```javascript
// useToggle.js
import { ref } from 'vue'

export function useToggle(initialValue = false) {
  const state = ref(initialValue)
  
  function toggle() {
    state.value = !state.value
  }
  
  function setTrue() {
    state.value = true
  }
  
  function setFalse() {
    state.value = false
  }
  
  return {
    state,
    toggle,
    setTrue,
    setFalse
  }
}
```

### 2.6 useEventListener - 事件监听

```javascript
// useEventListener.js
import { onMounted, onUnmounted, unref } from 'vue'

export function useEventListener(target, event, callback) {
  onMounted(() => {
    unref(target).addEventListener(event, callback)
  })
  
  onUnmounted(() => {
    unref(target).removeEventListener(event, callback)
  })
}
```

```vue
<script setup>
import { useEventListener } from './useEventListener'

useEventListener(window, 'resize', () => {
  console.log('窗口大小改变')
})

useEventListener(document, 'keydown', (e) => {
  if (e.key === 'Escape') {
    console.log('按下 Escape')
  }
})
</script>
```

## 三、接收响应式参数

### 3.1 支持 ref 参数

```javascript
// useFetch.js - 支持响应式 URL
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  
  watchEffect(async () => {
    // toValue 解包 ref 或返回原始值
    const response = await fetch(toValue(url))
    data.value = await response.json()
  })
  
  return { data }
}
```

```vue
<script setup>
import { ref, computed } from 'vue'
import { useFetch } from './useFetch'

const userId = ref(1)
const url = computed(() => `/api/users/${userId.value}`)

// url 变化时自动重新请求
const { data } = useFetch(url)
</script>
```

### 3.2 使用 getter 函数

```javascript
// 也可以传递 getter 函数
const { data } = useFetch(() => `/api/users/${userId.value}`)
```

## 四、组合式函数 vs Mixins

### 4.1 Mixins 的问题

```javascript
// Vue 2 Mixins
const counterMixin = {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  }
}

// 问题：
// 1. 来源不清晰 - count 从哪来？
// 2. 命名冲突 - 多个 mixin 可能有同名属性
// 3. 隐式依赖 - mixin 之间可能相互依赖
```

### 4.2 组合式函数的优势

```javascript
// Vue 3 Composables
import { useCounter } from './useCounter'
import { useMouse } from './useMouse'

// 优势：
// 1. 来源清晰 - 明确知道 count 来自 useCounter
const { count } = useCounter()
const { x, y } = useMouse()

// 2. 无命名冲突 - 可以重命名
const { count: counter1 } = useCounter()
const { count: counter2 } = useCounter()

// 3. 显式依赖 - 函数调用，依赖清晰
```

## 五、最佳实践

### 5.1 返回值约定

```javascript
// 返回对象，包含响应式状态和方法
export function useFeature() {
  const state = ref()
  const computed = computed(() => {})
  
  function method() {}
  
  return {
    // 响应式状态
    state,
    computed,
    // 方法
    method
  }
}
```

### 5.2 清理副作用

```javascript
export function useInterval(callback, delay) {
  const timer = ref(null)
  
  onMounted(() => {
    timer.value = setInterval(callback, delay)
  })
  
  // 组件卸载时自动清理
  onUnmounted(() => {
    clearInterval(timer.value)
  })
  
  // 也提供手动清理方法
  function stop() {
    clearInterval(timer.value)
  }
  
  return { stop }
}
```

### 5.3 使用 TypeScript

```typescript
// useCounter.ts
import { ref, Ref } from 'vue'

interface UseCounterReturn {
  count: Ref<number>
  increment: () => void
  decrement: () => void
}

export function useCounter(initial = 0): UseCounterReturn {
  const count = ref(initial)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return { count, increment, decrement }
}
```

### 5.4 组合多个 Composables

```javascript
// useUserData.js
import { useFetch } from './useFetch'
import { useLocalStorage } from './useLocalStorage'

export function useUserData(userId) {
  const { data: user, loading, error } = useFetch(
    () => `/api/users/${userId.value}`
  )
  
  const preferences = useLocalStorage(`user-${userId.value}-prefs`, {})
  
  return {
    user,
    loading,
    error,
    preferences
  }
}
```

## 六、VueUse 库

### 6.1 常用函数

```bash
npm install @vueuse/core
```

```javascript
import {
  useMouse,
  useLocalStorage,
  useDark,
  useToggle,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useWindowSize,
  useClipboard,
  useOnline
} from '@vueuse/core'

// 鼠标位置
const { x, y } = useMouse()

// 深色模式
const isDark = useDark()
const toggleDark = useToggle(isDark)

// 在线状态
const isOnline = useOnline()

// 剪贴板
const { copy, copied } = useClipboard()
```

## 七、总结

| 特性 | 说明 |
|------|------|
| 命名 | 以 `use` 开头 |
| 返回值 | 返回响应式状态和方法 |
| 清理 | 在 onUnmounted 中清理副作用 |
| 参数 | 支持响应式参数 |
| 组合 | 可以相互组合 |

## 参考资料

- [组合式函数](https://vuejs.org/guide/reusability/composables.html)
- [VueUse](https://vueuse.org/)

---

**下一节** → [第 14 节：插件机制](./14-plugins.md)
