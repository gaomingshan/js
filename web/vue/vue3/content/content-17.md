# 组合式函数（Composables）

> Composables 是 Vue 3 组合式 API 的核心模式，用于提取和复用有状态的逻辑。

## 核心概念

**Composables** 是利用 Vue 组合式 API 封装和复用**有状态逻辑**的函数。类似于 React Hooks，但基于 Vue 的响应式系统。

### 基础示例

```typescript
// useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  // 状态
  const count = ref(initialValue)
  
  // 计算属性
  const double = computed(() => count.value * 2)
  
  // 方法
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = initialValue
  }
  
  // 返回要暴露的内容
  return {
    count,
    double,
    increment,
    decrement,
    reset
  }
}

// 使用
<script setup>
import { useCounter } from './composables/useCounter'

const { count, double, increment, decrement } = useCounter(10)
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ double }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>
```

---

## 命名约定

### 函数命名

- **前缀 `use`**：表明这是一个 composable
- **驼峰命名**：`useMouse`、`useFetch`、`useLocalStorage`
- **语义化**：清晰表达功能

```typescript
// ✅ 好的命名
export function useMouse() { }
export function useFetch() { }
export function useLocalStorage() { }
export function useEventListener() { }

// ❌ 不好的命名
export function mouse() { }
export function getData() { }
export function helper() { }
```

### 文件组织

```
src/
├── composables/
│   ├── useMouse.ts
│   ├── useFetch.ts
│   ├── useLocalStorage.ts
│   └── index.ts
```

```typescript
// composables/index.ts
export { useMouse } from './useMouse'
export { useFetch } from './useFetch'
export { useLocalStorage } from './useLocalStorage'

// 使用
import { useMouse, useFetch } from '@/composables'
```

---

## 常见 Composables 模式

### 1. 鼠标追踪

```typescript
// useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  
  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }
  
  onMounted(() => {
    window.addEventListener('mousemove', update)
  })
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })
  
  return { x, y }
}

// 使用
<script setup>
const { x, y } = useMouse()
</script>

<template>
  <p>鼠标位置：{{ x }}, {{ y }}</p>
</template>
```

### 2. 数据获取

```typescript
// useFetch.ts
import { ref, watchEffect, toValue } from 'vue'
import type { Ref } from 'vue'

export function useFetch<T>(url: string | Ref<string>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  
  async function doFetch() {
    loading.value = true
    error.value = null
    data.value = null
    
    try {
      const response = await fetch(toValue(url))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }
  
  // 自动执行
  watchEffect(() => {
    doFetch()
  })
  
  return { data, error, loading, refetch: doFetch }
}

// 使用
<script setup>
const userId = ref(1)
const url = computed(() => `/api/users/${userId.value}`)

const { data, error, loading, refetch } = useFetch(url)
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误：{{ error.message }}</div>
  <div v-else>{{ data }}</div>
  <button @click="refetch">刷新</button>
</template>
```

### 3. 本地存储

```typescript
// useLocalStorage.ts
import { ref, watch } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
) {
  // 读取初始值
  const data = ref<T>(() => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  })
  
  // 监听变化并保存
  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )
  
  return data
}

// 使用
<script setup>
const userPreferences = useLocalStorage('preferences', {
  theme: 'light',
  language: 'zh-CN'
})

function toggleTheme() {
  userPreferences.value.theme =
    userPreferences.value.theme === 'light' ? 'dark' : 'light'
}
</script>
```

### 4. 事件监听

```typescript
// useEventListener.ts
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener
) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })
  
  onUnmounted(() => {
    target.removeEventListener(event, handler)
  })
}

// 使用
<script setup>
function handleResize() {
  console.log('窗口大小改变')
}

useEventListener(window, 'resize', handleResize)
</script>
```

### 5. 防抖与节流

```typescript
// useDebounce.ts
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useDebounce<T>(
  value: Ref<T>,
  delay = 300
) {
  const debouncedValue = ref(value.value) as Ref<T>
  
  let timeoutId: number | null = null
  
  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay) as unknown as number
  })
  
  return debouncedValue
}

// 使用
<script setup>
const searchText = ref('')
const debouncedSearch = useDebounce(searchText, 500)

watch(debouncedSearch, (newValue) => {
  performSearch(newValue)
})
</script>

<template>
  <input v-model="searchText" placeholder="搜索...">
</template>
```

---

## 响应式状态提取

### 提取表单逻辑

```typescript
// useForm.ts
import { reactive, computed } from 'vue'

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Record<keyof T, (value: any) => string | true>
) {
  const values = reactive({ ...initialValues })
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  
  function validateField(field: keyof T) {
    if (!validationRules?.[field]) return true
    
    const result = validationRules[field](values[field])
    
    if (result === true) {
      errors[field as string] = ''
      return true
    } else {
      errors[field as string] = result
      return false
    }
  }
  
  function validateAll() {
    let isValid = true
    
    for (const field in validationRules) {
      if (!validateField(field)) {
        isValid = false
      }
    }
    
    return isValid
  }
  
  function setFieldValue<K extends keyof T>(field: K, value: T[K]) {
    values[field] = value
  }
  
  function setFieldTouched(field: keyof T, isTouched = true) {
    touched[field as string] = isTouched
  }
  
  function resetForm() {
    Object.assign(values, initialValues)
    Object.keys(errors).forEach(key => errors[key] = '')
    Object.keys(touched).forEach(key => touched[key] = false)
  }
  
  const isValid = computed(() => {
    return Object.values(errors).every(error => !error)
  })
  
  return {
    values,
    errors,
    touched,
    isValid,
    validateField,
    validateAll,
    setFieldValue,
    setFieldTouched,
    resetForm
  }
}

// 使用
<script setup>
const { values, errors, touched, isValid, validateField, validateAll, setFieldTouched, resetForm } = useForm(
  {
    email: '',
    password: ''
  },
  {
    email: (value) => {
      if (!value) return '邮箱不能为空'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '邮箱格式不正确'
      return true
    },
    password: (value) => {
      if (!value) return '密码不能为空'
      if (value.length < 6) return '密码至少6位'
      return true
    }
  }
)

function handleSubmit() {
  if (validateAll()) {
    console.log('提交表单:', values)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="values.email"
      @blur="validateField('email'); setFieldTouched('email')"
    >
    <span v-if="touched.email && errors.email">{{ errors.email }}</span>
    
    <input
      v-model="values.password"
      type="password"
      @blur="validateField('password'); setFieldTouched('password')"
    >
    <span v-if="touched.password && errors.password">{{ errors.password }}</span>
    
    <button type="submit" :disabled="!isValid">提交</button>
    <button type="button" @click="resetForm">重置</button>
  </form>
</template>
```

---

## 生命周期钩子复用

### 定时器管理

```typescript
// useInterval.ts
import { onMounted, onUnmounted } from 'vue'

export function useInterval(
  callback: () => void,
  interval: number
) {
  let timerId: number | null = null
  
  onMounted(() => {
    timerId = setInterval(callback, interval) as unknown as number
  })
  
  onUnmounted(() => {
    if (timerId) {
      clearInterval(timerId)
    }
  })
  
  function pause() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }
  
  function resume() {
    if (!timerId) {
      timerId = setInterval(callback, interval) as unknown as number
    }
  }
  
  return { pause, resume }
}

// 使用
<script setup>
const count = ref(0)

const { pause, resume } = useInterval(() => {
  count.value++
}, 1000)
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="pause">暂停</button>
    <button @click="resume">继续</button>
  </div>
</template>
```

---

## Composables vs Mixins

### Mixins 的问题

```javascript
// Mixins（Vue 2）
export const counterMixin = {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

export default {
  mixins: [counterMixin, otherMixin],
  
  // 问题：
  // 1. 命名冲突：count 来自哪里？
  // 2. 隐式依赖：mixins 之间可能互相依赖
  // 3. 难以追溯：不知道属性/方法从哪来
}
```

### Composables 的优势

```typescript
// Composables（Vue 3）
<script setup>
import { useCounter } from './composables/useCounter'
import { useOther } from './composables/useOther'

// ✅ 明确的来源
const { count: counterCount, increment: counterIncrement } = useCounter()
const { count: otherCount } = useOther()

// ✅ 可以重命名避免冲突
// ✅ 清晰的依赖关系
// ✅ 更好的类型推断
</script>
```

| 特性 | Mixins | Composables |
|------|--------|-------------|
| 命名冲突 | ❌ 容易冲突 | ✅ 可以重命名 |
| 来源追溯 | ❌ 不明确 | ✅ 明确导入 |
| 类型推断 | ❌ 较差 | ✅ 优秀 |
| 依赖关系 | ❌ 隐式 | ✅ 显式 |
| 组合灵活性 | ❌ 受限 | ✅ 灵活 |

---

## 高级模式

### 接受响应式参数

```typescript
// useAsync.ts
import { ref, watchEffect, toValue } from 'vue'
import type { Ref } from 'vue'

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  // 接受 Ref 或普通值
  immediate: Ref<boolean> | boolean = true
) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  
  async function execute() {
    loading.value = true
    error.value = null
    
    try {
      data.value = await asyncFn()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }
  
  watchEffect(() => {
    // toValue: 统一处理 Ref 和普通值
    if (toValue(immediate)) {
      execute()
    }
  })
  
  return { data, error, loading, execute }
}

// 使用
<script setup>
const shouldFetch = ref(false)

const { data, loading } = useAsync(
  () => fetch('/api/data').then(r => r.json()),
  shouldFetch  // 可以是 Ref
)
</script>
```

### 返回响应式对象

```typescript
// useCounter.ts（返回响应式对象）
import { reactive, toRefs } from 'vue'

export function useCounter(initial = 0) {
  const state = reactive({
    count: initial,
    double: computed(() => state.count * 2)
  })
  
  function increment() {
    state.count++
  }
  
  // toRefs: 保持响应性的同时支持解构
  return {
    ...toRefs(state),
    increment
  }
}

// 使用
<script setup>
// 可以解构
const { count, double, increment } = useCounter()

// count 和 double 仍然是响应式的
</script>
```

### 组合多个 Composables

```typescript
// useUserManagement.ts
import { useFetch } from './useFetch'
import { useLocalStorage } from './useLocalStorage'
import { usePermission } from './usePermission'

export function useUserManagement() {
  // 组合多个 composables
  const currentUserId = useLocalStorage('currentUserId', null)
  
  const { data: user, loading, error, refetch } = useFetch(
    computed(() => `/api/users/${currentUserId.value}`)
  )
  
  const { hasPermission } = usePermission()
  
  const canEdit = computed(() => {
    return user.value && hasPermission('edit')
  })
  
  function login(userId: string) {
    currentUserId.value = userId
  }
  
  function logout() {
    currentUserId.value = null
  }
  
  return {
    user,
    loading,
    error,
    canEdit,
    login,
    logout,
    refetch
  }
}
```

---

## 前端工程实践

### 示例 1：分页列表

```typescript
// usePagination.ts
import { ref, computed } from 'vue'

export function usePagination<T>(
  items: Ref<T[]>,
  pageSize = 10
) {
  const currentPage = ref(1)
  
  const totalPages = computed(() => {
    return Math.ceil(items.value.length / pageSize)
  })
  
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return items.value.slice(start, end)
  })
  
  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }
  
  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  return {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage
  }
}

// 使用
<script setup>
const allItems = ref([...]) // 100 items

const {
  currentPage,
  totalPages,
  paginatedItems,
  nextPage,
  prevPage
} = usePagination(allItems, 10)
</script>

<template>
  <div v-for="item in paginatedItems" :key="item.id">
    {{ item }}
  </div>
  
  <div>
    <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
    <span>{{ currentPage }} / {{ totalPages }}</span>
    <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
  </div>
</template>
```

### 示例 2：异步状态管理

```typescript
// useAsyncState.ts
import { ref, shallowRef } from 'vue'

export function useAsyncState<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  initialValue: T
) {
  const state = shallowRef<T>(initialValue)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  async function execute(...args: Args) {
    loading.value = true
    error.value = null
    
    try {
      const result = await asyncFn(...args)
      state.value = result
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }
  
  return {
    state,
    loading,
    error,
    execute
  }
}

// 使用
<script setup>
interface User {
  id: number
  name: string
}

const { state: user, loading, error, execute: fetchUser } = useAsyncState(
  async (id: number) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json() as Promise<User>
  },
  null as User | null
)

onMounted(() => {
  fetchUser(1)
})
</script>
```

### 示例 3：权限管理

```typescript
// usePermission.ts
import { computed } from 'vue'
import { useUser } from './useUser'

type Permission = 'read' | 'write' | 'delete' | 'admin'

export function usePermission() {
  const { user } = useUser()
  
  const userPermissions = computed<Permission[]>(() => {
    return user.value?.permissions || []
  })
  
  function hasPermission(permission: Permission | Permission[]) {
    if (Array.isArray(permission)) {
      return permission.every(p => userPermissions.value.includes(p))
    }
    return userPermissions.value.includes(permission)
  }
  
  function hasAnyPermission(permissions: Permission[]) {
    return permissions.some(p => userPermissions.value.includes(p))
  }
  
  const isAdmin = computed(() => {
    return userPermissions.value.includes('admin')
  })
  
  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    isAdmin
  }
}

// 使用
<script setup>
const { hasPermission, isAdmin } = usePermission()
</script>

<template>
  <button v-if="hasPermission('write')">编辑</button>
  <button v-if="hasPermission('delete')">删除</button>
  <div v-if="isAdmin">管理员面板</div>
</template>
```

---

## 最佳实践

1. **命名以 `use` 开头**：遵循约定
2. **单一职责**：每个 composable 只做一件事
3. **返回对象而非数组**：更灵活的解构
4. **使用 toRefs**：支持解构的同时保持响应性
5. **接受响应式参数**：使用 `toValue()` 统一处理
6. **清理副作用**：在 `onUnmounted` 中清理
7. **类型安全**：使用 TypeScript
8. **文档化**：添加注释说明用法和参数

---

## 参考资料

- [组合式函数](https://cn.vuejs.org/guide/reusability/composables.html)
- [VueUse](https://vueuse.org/)：Vue Composables 工具库
- [组合式 API FAQ](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
