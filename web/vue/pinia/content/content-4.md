# 2.1 State 状态管理

## 概述

State 是 Pinia Store 的核心，存储应用的响应式数据。本节深入讲解 State 的定义、访问、修改方式，以及 Pinia 提供的便捷 API（`$reset`、`$patch`）和响应式原理。

## State 定义与初始化

### 基本定义

State 必须定义为返回对象的函数：

```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 基本类型
    id: null,
    name: '',
    age: 0,
    isActive: false,
    
    // 引用类型
    profile: {
      avatar: '',
      bio: ''
    },
    roles: [],
    permissions: new Set(),
    
    // 特殊值
    lastLogin: null,
    metadata: undefined
  })
})
```

### 复杂类型初始化

```javascript
state: () => ({
  // 数组
  items: [],
  tags: ['vue', 'pinia'],
  
  // 对象
  config: {
    theme: 'dark',
    locale: 'zh-CN'
  },
  
  // Map/Set
  cache: new Map(),
  selected: new Set(),
  
  // 日期
  createdAt: new Date(),
  
  // 类实例
  validator: new FormValidator()
})
```

### 从外部数据初始化

```javascript
// 从 localStorage 恢复
state: () => ({
  user: JSON.parse(localStorage.getItem('user') || '{}'),
  token: localStorage.getItem('token') || ''
})

// 从环境变量
state: () => ({
  apiUrl: import.meta.env.VITE_API_URL,
  isDev: import.meta.env.DEV
})
```

## 访问与修改 State

### 访问 State

```javascript
const store = useUserStore()

// 直接访问
console.log(store.name)
console.log(store.age)
console.log(store.profile.avatar)

// 解构访问（⚠️ 会丢失响应式）
const { name, age } = store // ❌ 不再响应式

// 使用 storeToRefs 解构（保持响应式）
import { storeToRefs } from 'pinia'
const { name, age } = storeToRefs(store) // ✅ 保持响应式
```

### 修改 State - 直接赋值

最简单的方式是直接修改：

```javascript
const store = useUserStore()

// 修改基本类型
store.name = 'Bob'
store.age = 30

// 修改引用类型
store.profile.avatar = 'avatar.jpg'
store.roles.push('admin')

// 替换整个对象
store.profile = {
  avatar: 'new-avatar.jpg',
  bio: 'New bio'
}
```

### 修改 State - 在 Actions 中

推荐在 Actions 中封装状态修改逻辑：

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    age: 0
  }),
  
  actions: {
    updateName(newName) {
      this.name = newName
    },
    
    incrementAge() {
      this.age++
    },
    
    updateProfile(profile) {
      this.name = profile.name
      this.age = profile.age
    }
  }
})

// 使用
const store = useUserStore()
store.updateName('Alice')
```

## 重置 State（$reset）

### 基本用法

`$reset()` 方法将 State 重置为初始值：

```javascript
const store = useUserStore()

// 修改状态
store.name = 'Bob'
store.age = 30

// 重置到初始值
store.$reset()

console.log(store.name) // ''
console.log(store.age) // 0
```

### 使用场景

```javascript
// 用户登出时重置
actions: {
  logout() {
    this.$reset()
    router.push('/login')
  }
}

// 表单重置
function resetForm() {
  formStore.$reset()
}

// 测试清理
afterEach(() => {
  testStore.$reset()
})
```

### Setup Store 中的 $reset

⚠️ Setup 语法定义的 Store 不支持 `$reset()`，需手动实现：

```javascript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('')
  
  // 手动实现 reset
  function $reset() {
    count.value = 0
    name.value = ''
  }
  
  return { count, name, $reset }
})
```

## 批量修改 State（$patch）

### 对象形式

`$patch()` 可以一次性修改多个属性：

```javascript
const store = useUserStore()

// ✅ 批量修改（只触发一次更新）
store.$patch({
  name: 'Alice',
  age: 25,
  isActive: true
})

// ❌ 逐个修改（触发多次更新）
store.name = 'Alice'
store.age = 25
store.isActive = true
```

### 函数形式

使用函数可以进行复杂的状态修改：

```javascript
store.$patch((state) => {
  state.name = 'Bob'
  state.age++
  state.roles.push('admin')
  state.items.splice(0, 1) // 删除第一个元素
})
```

### 性能优势

```javascript
// 场景：批量更新购物车
const cartStore = useCartStore()

// ❌ 性能较差：多次触发响应式更新
items.forEach(item => {
  cartStore.items.push(item)
  cartStore.total += item.price
  cartStore.count++
})

// ✅ 性能更好：只触发一次更新
cartStore.$patch((state) => {
  items.forEach(item => {
    state.items.push(item)
    state.total += item.price
    state.count++
  })
})

// ✅ 或使用对象形式
cartStore.$patch({
  items: [...cartStore.items, ...items],
  total: cartStore.total + totalPrice,
  count: cartStore.count + items.length
})
```

## State 的响应式原理

### Vue 3 响应式集成

Pinia 的 State 使用 Vue 3 的 `reactive()` 包装：

```javascript
// Pinia 内部实现（简化版）
import { reactive } from 'vue'

function createStore(options) {
  const state = reactive(options.state())
  return state
}
```

### 响应式追踪

State 的变化会自动触发依赖更新：

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const user = useUserStore()

// 模板会自动追踪 user.name 的变化
</script>

<template>
  <div>{{ user.name }}</div>  <!-- 响应式 -->
</template>
```

### 深层响应式

State 中的嵌套对象也是响应式的：

```javascript
const store = useUserStore()

// 深层属性也是响应式的
store.profile.avatar = 'new.jpg' // ✅ 触发更新
store.roles.push('admin') // ✅ 触发更新
store.cache.set('key', 'value') // ✅ 触发更新（Map/Set 也支持）
```

## 关键点总结

1. **State 必须是函数**：确保每个实例独立
2. **直接访问和修改**：像普通对象一样使用
3. **$reset()**：重置到初始状态（Setup Store 需手动实现）
4. **$patch()**：批量修改，提升性能
5. **完全响应式**：基于 Vue 3 的 `reactive()`

## 深入一点

### State 替换

可以完整替换整个 State 对象：

```javascript
const store = useUserStore()

// ⚠️ 不推荐：破坏响应式
store.$state = { name: 'Alice', age: 25 }

// ✅ 推荐：使用 $patch
store.$patch({ name: 'Alice', age: 25 })

// ✅ 或逐个赋值
store.name = 'Alice'
store.age = 25
```

### 订阅 State 变化

```javascript
const store = useUserStore()

// 监听 State 变化
store.$subscribe((mutation, state) => {
  console.log('State 变化了:', mutation.type)
  console.log('新状态:', state)
  
  // 持久化到 localStorage
  localStorage.setItem('user', JSON.stringify(state))
})
```

### 在非组件中使用

```javascript
// router/guards.js
import { useUserStore } from '@/stores/user'

export function setupGuards(router) {
  router.beforeEach((to, from) => {
    // ✅ 在路由守卫中使用
    const userStore = useUserStore()
    
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      return '/login'
    }
  })
}
```

### TypeScript 类型约束

```typescript
import { defineStore } from 'pinia'

interface UserState {
  id: number | null
  name: string
  email: string
  roles: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    name: '',
    email: '',
    roles: []
  }),
  
  actions: {
    updateUser(user: Partial<UserState>) {
      this.$patch(user)
    }
  }
})
```

### 常见陷阱

**陷阱 1：解构丢失响应式**
```javascript
// ❌ 错误
const { name, age } = store
name.value = 'Alice' // 报错：name 不是 ref

// ✅ 正确
import { storeToRefs } from 'pinia'
const { name, age } = storeToRefs(store)
name.value = 'Alice' // 正确
```

**陷阱 2：数组响应式陷阱**
```javascript
// ❌ 不会触发更新（直接修改长度）
store.items.length = 0

// ✅ 使用数组方法
store.items.splice(0, store.items.length)
store.items = []
```

**陷阱 3：Setup Store 无 $reset**
```javascript
// Setup Store
const useStore = defineStore('main', () => {
  const count = ref(0)
  return { count }
})

const store = useStore()
store.$reset() // ❌ 运行时错误
```

## 参考资料

- [Pinia State 文档](https://pinia.vuejs.org/core-concepts/state.html)
- [Vue 3 响应式 API](https://vuejs.org/api/reactivity-core.html)
- [storeToRefs API](https://pinia.vuejs.org/api/modules/pinia.html#storetorefs)
