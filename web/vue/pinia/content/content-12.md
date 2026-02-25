# 4.1 在组件中使用 Store

## 概述

本节介绍如何在 Vue 组件中使用 Pinia Store，包括在 Options API 和 Composition API 中的使用方式，以及解构 Store 时需要注意的响应式问题。

## Options API 中使用

### 基本用法

在 Options API 中，可以在 `computed` 中获取 Store 实例：

```vue
<template>
  <div>
    <h2>{{ user.name }}</h2>
    <p>Count: {{ counter.count }}</p>
    <button @click="handleIncrement">+1</button>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { useCounterStore } from '@/stores/counter'

export default {
  computed: {
    user() {
      return useUserStore()
    },
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
```

### mapStores 辅助函数

Pinia 提供了 `mapStores` 辅助函数简化使用：

```vue
<script>
import { mapStores } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useCounterStore } from '@/stores/counter'

export default {
  computed: {
    // 映射多个 Store
    ...mapStores(useUserStore, useCounterStore)
    // 生成: userStore, counterStore
  },
  
  methods: {
    handleClick() {
      console.log(this.userStore.name)
      this.counterStore.increment()
    }
  }
}
</script>
```

### mapState 辅助函数

映射 State 和 Getters 为组件的计算属性：

```vue
<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  computed: {
    // 映射 state
    ...mapState(useUserStore, ['name', 'age']),
    
    // 映射 getters
    ...mapState(useUserStore, ['greeting', 'isAdult']),
    
    // 自定义名称
    ...mapState(useUserStore, {
      userName: 'name',
      userAge: 'age'
    })
  }
}
</script>

<template>
  <div>
    <p>姓名: {{ name }}</p>
    <p>年龄: {{ age }}</p>
    <p>{{ greeting }}</p>
    <p>成年: {{ isAdult }}</p>
    
    <!-- 自定义名称 -->
    <p>{{ userName }} - {{ userAge }}</p>
  </div>
</template>
```

### mapActions 辅助函数

映射 Actions 为组件方法：

```vue
<script>
import { mapActions } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  methods: {
    // 映射 actions
    ...mapActions(useUserStore, ['fetchUser', 'updateName']),
    
    // 自定义名称
    ...mapActions(useUserStore, {
      loadUser: 'fetchUser',
      changeName: 'updateName'
    }),
    
    async handleLoad() {
      await this.fetchUser(123)
      // 或使用自定义名称
      await this.loadUser(123)
    }
  }
}
</script>
```

### mapWritableState

映射可写的 State（不推荐直接修改）：

```vue
<script>
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  computed: {
    // 可读写的 state
    ...mapWritableState(useUserStore, ['name', 'age'])
  },
  
  methods: {
    updateUser() {
      // 可以直接修改
      this.name = 'Alice'
      this.age = 25
    }
  }
}
</script>
```

## Composition API 中使用

### 基本用法（script setup）

在 Composition API 中使用 Store 更加直观：

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { useCounterStore } from '@/stores/counter'

// 获取 Store 实例
const userStore = useUserStore()
const counterStore = useCounterStore()

// 直接访问 state
console.log(userStore.name)
console.log(counterStore.count)

// 调用 actions
function handleClick() {
  counterStore.increment()
  userStore.updateName('Alice')
}
</script>

<template>
  <div>
    <h2>{{ userStore.name }}</h2>
    <p>Count: {{ counterStore.count }}</p>
    <p>Double: {{ counterStore.doubleCount }}</p>
    <button @click="handleClick">更新</button>
  </div>
</template>
```

### 使用 computed

结合 Vue 的 `computed` 使用：

```vue
<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

// 基于 store 创建计算属性
const itemCount = computed(() => cart.items.length)
const isEmpty = computed(() => cart.items.length === 0)
const totalPrice = computed(() => cart.total)

// 组合多个 store
const summary = computed(() => ({
  items: itemCount.value,
  total: totalPrice.value,
  isEmpty: isEmpty.value
}))
</script>

<template>
  <div>
    <p v-if="isEmpty">购物车为空</p>
    <p v-else>共 {{ itemCount }} 件商品，总价 ¥{{ totalPrice }}</p>
  </div>
</template>
```

### 使用 watch 监听

```vue
<script setup>
import { watch } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 监听 store 的特定属性
watch(
  () => userStore.name,
  (newName, oldName) => {
    console.log(`Name changed from ${oldName} to ${newName}`)
  }
)

// 监听多个属性
watch(
  () => [userStore.name, userStore.age],
  ([newName, newAge], [oldName, oldAge]) => {
    console.log('User info changed')
  }
)

// 深度监听整个 store
watch(
  () => userStore.$state,
  (state) => {
    console.log('Store state changed:', state)
  },
  { deep: true }
)
</script>
```

## 解构 Store 的注意事项

### 响应式丢失问题

直接解构 Store 会丢失响应式：

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ❌ 错误：解构后失去响应式
const { name, age } = userStore

console.log(name) // 'Alice'
userStore.name = 'Bob'
console.log(name) // 仍然是 'Alice'，未更新！
</script>

<template>
  <div>
    <!-- ❌ 不会响应更新 -->
    <p>{{ name }}</p>
  </div>
</template>
```

### storeToRefs 解决方案

使用 `storeToRefs` 保持响应式：

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ✅ 正确：使用 storeToRefs 解构
const { name, age, greeting } = storeToRefs(userStore)

// name 和 age 现在是 ref，保持响应式
console.log(name.value) // 'Alice'
userStore.name = 'Bob'
console.log(name.value) // 'Bob'，已更新！
</script>

<template>
  <div>
    <!-- ✅ 会响应更新，模板中自动解包 -->
    <p>{{ name }}</p>
    <p>{{ age }}</p>
    <p>{{ greeting }}</p>
  </div>
</template>
```

### 解构 Actions

Actions 可以直接解构，不需要 `storeToRefs`：

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// State 和 Getters：使用 storeToRefs
const { name, age, greeting } = storeToRefs(userStore)

// Actions：直接解构（函数不需要响应式）
const { fetchUser, updateName, logout } = userStore

// 使用
async function handleLoad() {
  await fetchUser(123)
}

function handleUpdate() {
  updateName('Alice')
}
</script>
```

### 完整示例

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

// 解构 state 和 getters（响应式）
const { items, total, itemCount } = storeToRefs(cartStore)

// 解构 actions（非响应式，无需 storeToRefs）
const { addItem, removeItem, clearCart } = cartStore

function handleAdd() {
  addItem({ id: 1, name: 'Product', price: 100 })
}

function handleClear() {
  clearCart()
}
</script>

<template>
  <div>
    <p>商品数量: {{ itemCount }}</p>
    <p>总价: ¥{{ total }}</p>
    
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }} - ¥{{ item.price }}
        <button @click="removeItem(item.id)">删除</button>
      </li>
    </ul>
    
    <button @click="handleAdd">添加商品</button>
    <button @click="handleClear">清空购物车</button>
  </div>
</template>
```

## 组件外使用 Store

### 在路由守卫中使用

```javascript
// router/index.js
import { createRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  // ...
})

router.beforeEach((to, from) => {
  // ✅ 在路由守卫中使用
  const auth = useAuthStore()
  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
})

export default router
```

### 在 API 模块中使用

```javascript
// api/request.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const instance = axios.create({
  baseURL: '/api'
})

// 请求拦截器
instance.interceptors.request.use(config => {
  const auth = useAuthStore()
  
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  
  return config
})

export default instance
```

### 在工具函数中使用

```javascript
// utils/notification.js
import { useNotificationStore } from '@/stores/notification'

export function notify(message, type = 'info') {
  const notification = useNotificationStore()
  notification.add({ message, type, timestamp: Date.now() })
}

// 使用
import { notify } from '@/utils/notification'

notify('操作成功', 'success')
```

### 注意事项

⚠️ 只能在应用挂载后使用 Store：

```javascript
// ❌ 错误：在应用挂载前使用
import { useUserStore } from '@/stores/user'
const userStore = useUserStore() // 错误！Pinia 还未注册

import { createApp } from 'vue'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

// ✅ 正确：在应用挂载后使用
app.mount('#app')

// 现在可以使用
const userStore = useUserStore()
```

## 关键点总结

1. **Options API**：使用 mapStores、mapState、mapActions 辅助函数
2. **Composition API**：直接调用 `useXxxStore()` 获取实例
3. **解构响应式**：State/Getters 用 `storeToRefs`，Actions 直接解构
4. **组件外使用**：确保在 Pinia 注册后使用
5. **推荐方式**：Composition API + storeToRefs

## 深入一点

### 多个组件共享 Store

```vue
<!-- ComponentA.vue -->
<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
const { count } = storeToRefs(counter)
const { increment } = counter
</script>

<template>
  <div>
    <p>ComponentA: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<!-- ComponentB.vue -->
<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
const { count } = storeToRefs(counter)
</script>

<template>
  <div>
    <p>ComponentB: {{ count }}</p>
    <!-- count 会自动同步 -->
  </div>
</template>
```

### 条件使用 Store

```vue
<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGuestStore } from '@/stores/guest'

const userStore = useUserStore()
const guestStore = useGuestStore()

// 根据条件使用不同的 Store
const currentStore = computed(() => {
  return userStore.isLoggedIn ? userStore : guestStore
})
</script>

<template>
  <div>
    <p>{{ currentStore.name }}</p>
  </div>
</template>
```

### Provide/Inject 模式

```vue
<!-- 父组件 -->
<script setup>
import { provide } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
provide('userStore', userStore)
</script>

<!-- 子组件 -->
<script setup>
import { inject } from 'vue'
import { storeToRefs } from 'pinia'

const userStore = inject('userStore')
const { name } = storeToRefs(userStore)
</script>
```

### 组合式函数封装

```javascript
// composables/useAuth.js
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  
  const { user, token, isAuthenticated } = storeToRefs(authStore)
  const { login, logout } = authStore
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout: handleLogout
  }
}

// 在组件中使用
import { useAuth } from '@/composables/useAuth'

const { user, isAuthenticated, logout } = useAuth()
```

## 参考资料

- [Pinia 在组件中使用](https://pinia.vuejs.org/core-concepts/#using-the-store)
- [storeToRefs API](https://pinia.vuejs.org/api/modules/pinia.html#storetorefs)
- [Vue 3 Composition API](https://vuejs.org/api/composition-api-setup.html)
