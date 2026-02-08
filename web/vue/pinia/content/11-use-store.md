# 第 11 节：使用 Store

## 概述

定义好 Store 后，需要在组件中正确使用它。本节将介绍在 Vue 组件中使用 Pinia Store 的各种方法，包括响应式解构、状态访问、方法调用等核心用法。

## 一、基本用法

### 1.1 在组件中获取 Store

```vue
<template>
  <div>
    <h1>{{ store.count }}</h1>
    <button @click="store.increment">+1</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'

// 获取 store 实例
const store = useCounterStore()

// store 是响应式的，可以直接在模板中使用
console.log(store.count) // 访问状态
console.log(store.doubleCount) // 访问 getter
store.increment() // 调用 action
</script>
```

### 1.2 Options API 中使用

```vue
<template>
  <div>
    <h1>{{ count }}</h1>
    <p>{{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { useCounterStore } from '@/stores/counter'

export default {
  setup() {
    const counterStore = useCounterStore()
    
    return {
      // 直接返回 store 实例
      store: counterStore,
      
      // 或者解构返回需要的属性和方法
      count: counterStore.count,
      doubleCount: counterStore.doubleCount,
      increment: counterStore.increment
    }
  },
  
  // 也可以在其他生命周期中使用
  mounted() {
    const store = useCounterStore()
    console.log('Current count:', store.count)
  }
}
</script>
```

## 二、响应式解构

### 2.1 storeToRefs 的使用

```vue
<template>
  <div>
    <!-- 可以直接使用解构的响应式变量 -->
    <h1>用户：{{ name }}</h1>
    <p>邮箱：{{ email }}</p>
    <p>状态：{{ isLoggedIn ? '已登录' : '未登录' }}</p>
    
    <button @click="updateProfile">更新资料</button>
    <button @click="logout">退出登录</button>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ❌ 错误：直接解构会失去响应性
// const { name, email, isLoggedIn } = userStore

// ✅ 正确：使用 storeToRefs 保持响应性
const { name, email, isLoggedIn } = storeToRefs(userStore)

// ✅ 方法可以直接解构（不需要 storeToRefs）
const { updateProfile, logout } = userStore
</script>
```

### 2.2 选择性解构

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 只解构需要的状态
const { name, isLoggedIn } = storeToRefs(userStore)

// 只解构需要的方法
const { login, logout } = userStore

// 其他状态仍然通过 store 访问
// userStore.profile, userStore.settings 等
</script>
```

## 三、状态访问模式

### 3.1 直接访问

```vue
<template>
  <div>
    <!-- 直接通过 store 访问 -->
    <h1>{{ userStore.profile?.name }}</h1>
    <p>加载中：{{ userStore.loading }}</p>
    
    <div v-if="userStore.error" class="error">
      {{ userStore.error }}
    </div>
    
    <UserList :users="userStore.users" />
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import UserList from '@/components/UserList.vue'

const userStore = useUserStore()

// 直接访问模式的优点：
// - 代码简洁
// - 无需额外解构
// - 适合少量状态访问
</script>
```

### 3.2 响应式解构访问

```vue
<template>
  <div>
    <!-- 使用解构的变量 -->
    <h1>{{ name }}</h1>
    <p>{{ loading ? '加载中...' : `共 ${users.length} 个用户` }}</p>
    
    <div v-if="error" class="error">{{ error }}</div>
    
    <UserList :users="users" />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import UserList from '@/components/UserList.vue'

const userStore = useUserStore()

// 解构所有需要的响应式状态
const { 
  name, 
  users, 
  loading, 
  error 
} = storeToRefs(userStore)

// 响应式解构的优点：
// - 模板更简洁
// - 更好的代码提示
// - 适合大量状态访问
</script>
```

### 3.3 计算属性包装

```vue
<template>
  <div>
    <h1>{{ userDisplayName }}</h1>
    <p>权限级别：{{ userLevel }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { profile } = storeToRefs(userStore)

// 基于 store 状态的本地计算属性
const userDisplayName = computed(() => {
  if (!profile.value) return '未登录用户'
  
  return `${profile.value.firstName} ${profile.value.lastName}`
})

const userLevel = computed(() => {
  if (!profile.value?.permissions) return '普通用户'
  
  const permCount = profile.value.permissions.length
  if (permCount > 10) return '超级管理员'
  if (permCount > 5) return '管理员'
  return '普通用户'
})
</script>
```

## 四、方法调用

### 4.1 基本方法调用

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit" :disabled="userStore.loading">
        {{ userStore.loading ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const username = ref('')
const password = ref('')

const handleSubmit = async () => {
  try {
    const result = await userStore.login({
      username: username.value,
      password: password.value
    })
    
    if (result.success) {
      // 登录成功处理
      console.log('登录成功')
    } else {
      // 登录失败处理
      alert(result.error)
    }
  } catch (error) {
    console.error('登录异常:', error)
  }
}
</script>
```

### 4.2 带错误处理的方法调用

```vue
<template>
  <div>
    <button 
      @click="handleFetchUsers"
      :disabled="loading"
    >
      {{ loading ? '加载中...' : '获取用户列表' }}
    </button>
    
    <div v-if="error" class="error">
      {{ error }}
      <button @click="retry">重试</button>
    </div>
    
    <UserList v-if="users.length" :users="users" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { users, loading, error } = storeToRefs(userStore)

const handleFetchUsers = async () => {
  try {
    await userStore.fetchUsers()
    // 成功后的处理
  } catch (err) {
    // 额外的错误处理逻辑
    console.error('Failed to fetch users:', err)
  }
}

const retry = () => {
  userStore.$reset() // 重置错误状态
  handleFetchUsers()
}
</script>
```

## 五、生命周期集成

### 5.1 组件生命周期中使用 Store

```vue
<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)

// 组件挂载时初始化数据
onMounted(async () => {
  if (!currentUser.value) {
    await userStore.fetchCurrentUser()
  }
})

// 监听用户状态变化
watch(currentUser, (newUser, oldUser) => {
  if (newUser && !oldUser) {
    console.log('用户已登录')
    // 可以触发其他初始化逻辑
  } else if (!newUser && oldUser) {
    console.log('用户已退出')
    // 清理相关数据
  }
})

// 组件卸载时清理
onUnmounted(() => {
  // 如果需要，可以清理一些状态
  // userStore.clearTemporaryData()
})
</script>
```

### 5.2 路由守卫中使用 Store

```javascript
// router/index.js
import { useUserStore } from '@/stores/user'

const router = createRouter({
  // ...
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  
  // 检查登录状态
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'Login' }
  }
  
  // 检查权限
  if (to.meta.requiredPermission) {
    const hasPermission = userStore.hasPermission(to.meta.requiredPermission)
    if (!hasPermission) {
      return { name: 'Forbidden' }
    }
  }
  
  return true
})

export default router
```

## 六、Store 状态监听

### 6.1 $subscribe 监听状态变化

```vue
<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 监听所有状态变化
  const unsubscribe = userStore.$subscribe((mutation, state) => {
    console.log('State changed:', { mutation, state })
    
    // 可以根据变化类型执行不同逻辑
    if (mutation.type === 'direct') {
      console.log('Direct state mutation:', mutation.events)
    }
  })
  
  // 在组件卸载时取消订阅
  onUnmounted(unsubscribe)
})

// 持久化订阅（组件卸载后仍然保持）
userStore.$subscribe(
  (mutation, state) => {
    // 保存到本地存储
    localStorage.setItem('user-state', JSON.stringify(state))
  },
  { detached: true }
)
</script>
```

### 6.2 $onAction 监听动作执行

```vue
<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 监听所有 action 执行
  const unsubscribe = userStore.$onAction(({
    name, // action 名称
    store, // store 实例
    args, // 传递的参数
    after, // action 执行后的钩子
    onError // action 出错时的钩子
  }) => {
    console.log(`Action ${name} started with args:`, args)
    
    // action 执行后
    after((result) => {
      console.log(`Action ${name} finished with result:`, result)
    })
    
    // action 出错时
    onError((error) => {
      console.error(`Action ${name} failed:`, error)
    })
  })
  
  onUnmounted(unsubscribe)
})
</script>
```

## 七、条件渲染与Store状态

### 7.1 基于状态的条件渲染

```vue
<template>
  <div class="app">
    <!-- 加载状态 -->
    <LoadingSpinner v-if="userStore.loading" />
    
    <!-- 错误状态 -->
    <ErrorMessage 
      v-else-if="userStore.error"
      :message="userStore.error"
      @retry="userStore.fetchUsers"
    />
    
    <!-- 空状态 -->
    <EmptyState 
      v-else-if="userStore.users.length === 0"
      message="暂无用户数据"
    />
    
    <!-- 正常内容 -->
    <div v-else>
      <UserList :users="userStore.users" />
      <Pagination 
        :page="userStore.pagination.page"
        :total="userStore.pagination.total"
        @change="userStore.changePage"
      />
    </div>
    
    <!-- 权限控制 -->
    <AdminPanel v-if="userStore.hasPermission('admin')" />
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
```

### 7.2 动态样式和类名

```vue
<template>
  <div 
    class="user-profile"
    :class="{
      'loading': userStore.loading,
      'error': userStore.error,
      'premium': userStore.isPremiumUser
    }"
  >
    <div 
      class="status-indicator"
      :style="{ 
        backgroundColor: userStore.isOnline ? '#4CAF50' : '#f44336' 
      }"
    >
      {{ userStore.isOnline ? '在线' : '离线' }}
    </div>
    
    <h1 :class="userStore.userLevel">
      {{ userStore.displayName }}
    </h1>
  </div>
</template>

<style scoped>
.user-profile.loading {
  opacity: 0.6;
  pointer-events: none;
}

.user-profile.error {
  border: 2px solid #f44336;
}

.user-profile.premium {
  background: linear-gradient(45deg, #FFD700, #FFA500);
}

.admin { color: #e91e63; }
.moderator { color: #2196F3; }
.user { color: #4CAF50; }
</style>
```

## 八、性能优化技巧

### 8.1 避免不必要的响应式

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 只解构需要在模板中使用的响应式状态
const { name, avatar } = storeToRefs(userStore)

// 只在需要时访问其他状态
const handleClick = () => {
  // 临时访问，不需要响应式
  console.log(userStore.fullProfile)
}

// 对于静态配置，避免响应式解构
const config = userStore.config // 直接引用，不使用 storeToRefs
</script>
```

### 8.2 计算属性优化

```vue
<template>
  <div>
    <!-- 避免在模板中进行复杂计算 -->
    <h1>{{ expensiveComputedValue }}</h1>
    
    <!-- 缓存计算结果 -->
    <UserCard 
      v-for="user in cachedFilteredUsers"
      :key="user.id"
      :user="user"
    />
  </div>
</template>

<script setup>
import { computed, useMemoize } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { users, filters } = storeToRefs(userStore)

// 使用计算属性缓存复杂计算
const expensiveComputedValue = computed(() => {
  // 复杂的计算逻辑
  return users.value.reduce((acc, user) => {
    return acc + calculateUserValue(user)
  }, 0)
})

// 缓存过滤结果
const cachedFilteredUsers = computed(() => {
  return users.value.filter(user => {
    // 复杂过滤逻辑
    return matchesFilters(user, filters.value)
  })
})
</script>
```

## 九、调试技巧

### 9.1 开发环境调试

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 开发环境下暴露 store 到全局
if (process.env.NODE_ENV === 'development') {
  window.userStore = userStore
  
  // 添加调试日志
  userStore.$subscribe((mutation, state) => {
    console.group('🔄 Store Mutation')
    console.log('Type:', mutation.type)
    console.log('Payload:', mutation.payload)
    console.log('New State:', state)
    console.groupEnd()
  })
  
  userStore.$onAction(({ name, args }) => {
    console.log(`🎬 Action "${name}" called with:`, args)
  })
}
</script>
```

### 9.2 错误边界处理

```vue
<template>
  <div>
    <Suspense>
      <AsyncUserComponent />
      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { onErrorCaptured } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 捕获组件错误
onErrorCaptured((error, instance, errorInfo) => {
  console.error('Component error:', error)
  
  // 记录错误到 store
  userStore.logError({
    error: error.message,
    component: instance?.$options.name,
    info: errorInfo
  })
  
  return false // 阻止错误继续传播
})
</script>
```

## 参考资料

- [Using a Store](https://pinia.vuejs.org/core-concepts/using-stores.html)
- [storeToRefs API](https://pinia.vuejs.org/api/modules/pinia.html#storetorefs)
- [Vue Composition API](https://vuejs.org/api/composition-api-setup.html)

**下一节** → [第 12 节：State 状态](./12-pinia-state.md)
