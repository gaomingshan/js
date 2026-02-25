# 计算属性与侦听器

> 计算属性提供缓存机制优化性能，侦听器用于响应数据变化执行副作用。

## 核心概念

### computed - 计算属性

计算属性是基于响应式依赖进行**缓存**的。只有依赖的响应式数据发生变化时才会重新计算。

```typescript
import { ref, computed } from 'vue'

const count = ref(1)

// 只读计算属性
const double = computed(() => {
  console.log('计算 double')
  return count.value * 2
})

console.log(double.value) // 计算 double → 2
console.log(double.value) // 2（使用缓存，不重新计算）

count.value = 2
console.log(double.value) // 计算 double → 4
```

**可写计算属性**：

```typescript
const firstName = ref('Zhang')
const lastName = ref('San')

const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value) {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last
  }
})

console.log(fullName.value) // "Zhang San"
fullName.value = 'Li Si'     // 触发 setter
console.log(firstName.value) // "Li"
console.log(lastName.value)  // "Si"
```

---

## computed vs methods 性能对比

### 计算属性的优势

```vue
<script setup>
const items = ref([1, 2, 3, 4, 5])

// 计算属性：有缓存
const sum = computed(() => {
  console.log('计算 sum')
  return items.value.reduce((a, b) => a + b, 0)
})

// 方法：无缓存
function getSum() {
  console.log('调用 getSum')
  return items.value.reduce((a, b) => a + b, 0)
}
</script>

<template>
  <div>
    <!-- 多次访问只计算一次 -->
    <p>{{ sum }}</p>
    <p>{{ sum }}</p>
    <p>{{ sum }}</p>
    
    <!-- 每次访问都会重新计算 -->
    <p>{{ getSum() }}</p>
    <p>{{ getSum() }}</p>
    <p>{{ getSum() }}</p>
  </div>
</template>
```

**输出**：
```
计算 sum          // 只输出一次
调用 getSum       // 输出三次
调用 getSum
调用 getSum
```

### 何时使用 methods

```typescript
// ✅ 使用 computed：依赖响应式数据
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})

// ✅ 使用 methods：需要传参或无需缓存
function filterList(status: string) {
  return list.value.filter(item => item.status === status)
}

// ✅ 使用 methods：每次都要执行（如获取当前时间）
function getCurrentTime() {
  return new Date().toLocaleString()
}
```

---

## watch - 侦听器

监听响应式数据的变化，执行副作用（异步请求、DOM 操作等）。

### 基本用法

```typescript
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`count 从 ${oldValue} 变为 ${newValue}`)
})

// 侦听多个源
const x = ref(0)
const y = ref(0)

watch([x, y], ([newX, newY], [oldX, oldY]) => {
  console.log(`坐标从 (${oldX}, ${oldY}) 变为 (${newX}, ${newY})`)
})
```

### 侦听 reactive 对象

```typescript
const state = reactive({ count: 0, name: 'Vue' })

// ❌ 错误：直接传递 reactive 对象无法获取旧值
watch(state, (newValue, oldValue) => {
  // oldValue === newValue（同一个对象）
})

// ✅ 方案1：使用 getter 函数
watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log(`count 从 ${oldValue} 变为 ${newValue}`)
  }
)

// ✅ 方案2：侦听整个对象（深度监听）
watch(
  () => ({ ...state }),
  (newValue, oldValue) => {
    // newValue 和 oldValue 是不同的对象
  }
)
```

### 深度监听

```typescript
const state = reactive({
  user: {
    profile: {
      name: 'Alice'
    }
  }
})

// 默认浅层监听（对于 getter）
watch(
  () => state.user,
  () => {
    console.log('user 变化')
  }
)

state.user.profile.name = 'Bob' // ❌ 不会触发

// 深度监听
watch(
  () => state.user,
  () => {
    console.log('user 深层变化')
  },
  { deep: true }
)

state.user.profile.name = 'Bob' // ✅ 会触发

// reactive 对象默认深度监听
watch(state, () => {
  console.log('state 变化')
}) // 任何嵌套属性变化都会触发
```

---

## watchEffect - 自动追踪依赖

自动收集响应式依赖，无需手动指定监听源。

```typescript
import { ref, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Vue')

watchEffect(() => {
  // 自动追踪 count 和 name
  console.log(`${name.value}: ${count.value}`)
})

count.value++ // 触发
name.value = 'React' // 触发
```

### watch vs watchEffect

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 懒执行 | ✅ 默认懒执行 | ❌ 立即执行 |
| 访问旧值 | ✅ 可以访问 | ❌ 不能访问 |
| 明确依赖 | ✅ 需要指定 | ❌ 自动收集 |
| 执行时机 | 依赖变化时 | 立即+依赖变化时 |

**选择策略**：
- 需要访问旧值 → `watch`
- 需要懒执行 → `watch`
- 简单的副作用跟踪 → `watchEffect`

```typescript
// ✅ 使用 watch：需要对比新旧值
watch(userId, (newId, oldId) => {
  if (newId !== oldId) {
    fetchUserData(newId)
  }
})

// ✅ 使用 watchEffect：简单的数据获取
watchEffect(() => {
  fetchUserData(userId.value)
})
```

---

## 副作用清理与停止监听

### 清理副作用

```typescript
import { ref, watchEffect } from 'vue'

const id = ref(1)

watchEffect((onCleanup) => {
  const controller = new AbortController()
  
  fetch(`/api/user/${id.value}`, {
    signal: controller.signal
  })
  
  // 在副作用重新执行前或侦听器停止时调用
  onCleanup(() => {
    controller.abort()
  })
})
```

**使用场景**：
- 取消网络请求
- 清除定时器
- 移除事件监听器
- 取消订阅

### 停止侦听

```typescript
const count = ref(0)

// watch 和 watchEffect 都返回停止函数
const stop = watchEffect(() => {
  console.log(count.value)
})

// 手动停止
stop()

count.value++ // 不会触发侦听器
```

**自动停止**：

```vue
<script setup>
// 在 setup 或 <script setup> 中创建的侦听器
// 会在组件卸载时自动停止
watchEffect(() => {
  console.log('自动停止')
})
</script>
```

**异步创建的侦听器需要手动停止**：

```typescript
<script setup>
let stop: (() => void) | null = null

setTimeout(() => {
  // 异步创建的侦听器不会自动停止
  stop = watchEffect(() => {
    console.log('需要手动停止')
  })
}, 1000)

onUnmounted(() => {
  stop?.()
})
</script>
```

---

## 侦听器的执行时机

### flush 选项

```typescript
const count = ref(0)

// 'pre'：默认，组件更新前执行
watch(count, () => {
  console.log('DOM 未更新')
}, { flush: 'pre' })

// 'post'：组件更新后执行
watch(count, () => {
  console.log('DOM 已更新')
}, { flush: 'post' })

// 'sync'：同步执行（不推荐，会导致性能问题）
watch(count, () => {
  console.log('同步执行')
}, { flush: 'sync' })
```

**watchPostEffect**：

```typescript
import { watchPostEffect } from 'vue'

// 等价于 watchEffect(() => {}, { flush: 'post' })
watchPostEffect(() => {
  // DOM 已更新
  console.log(document.querySelector('#el')?.textContent)
})
```

---

## 易错点与边界情况

### 1. immediate 选项

```typescript
const userId = ref(1)

// ❌ 不会立即执行
watch(userId, (id) => {
  fetchUser(id)
})

// ✅ 立即执行一次
watch(userId, (id) => {
  fetchUser(id)
}, { immediate: true })

// ✅ 或使用 watchEffect（默认立即执行）
watchEffect(() => {
  fetchUser(userId.value)
})
```

### 2. 计算属性中的副作用

```typescript
// ❌ 不要在计算属性中执行副作用
const userInfo = computed(() => {
  fetch('/api/user') // 不好的做法
  return user.value
})

// ✅ 使用 watchEffect
watchEffect(() => {
  if (userId.value) {
    fetchUser(userId.value)
  }
})
```

### 3. 侦听 reactive 属性

```typescript
const state = reactive({
  count: 0,
  nested: { value: 1 }
})

// ❌ 无法侦听（不是响应式引用）
watch(state.count, (val) => {
  console.log(val)
})

// ✅ 使用 getter 函数
watch(() => state.count, (val) => {
  console.log(val)
})

// ✅ 或使用 toRef
import { toRef } from 'vue'
const countRef = toRef(state, 'count')
watch(countRef, (val) => {
  console.log(val)
})
```

### 4. 计算属性的调试

```typescript
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
}, {
  onTrack(e) {
    // 依赖被追踪时触发
    console.log('追踪:', e)
  },
  onTrigger(e) {
    // 依赖变化触发重新计算时触发
    console.log('触发:', e)
  }
})
```

---

## 前端工程实践

### 示例 1：表单验证

```typescript
import { ref, computed, watch } from 'vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// 计算属性：实时验证
const emailError = computed(() => {
  if (!email.value) return ''
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.value) ? '' : '邮箱格式不正确'
})

const passwordError = computed(() => {
  if (!password.value) return ''
  if (password.value.length < 6) return '密码至少6位'
  if (!/[A-Z]/.test(password.value)) return '密码需包含大写字母'
  return ''
})

const confirmError = computed(() => {
  if (!confirmPassword.value) return ''
  return confirmPassword.value === password.value ? '' : '两次密码不一致'
})

// 侦听器：密码变化时清空确认密码
watch(password, () => {
  if (confirmPassword.value) {
    confirmPassword.value = ''
  }
})
```

### 示例 2：搜索防抖

```typescript
import { ref, watch } from 'vue'

const searchText = ref('')
const results = ref([])
const loading = ref(false)

// 防抖搜索
watch(searchText, async (newValue) => {
  if (!newValue) {
    results.value = []
    return
  }
  
  loading.value = true
  
  // 使用 onCleanup 取消上一次请求
  const controller = new AbortController()
  
  try {
    const response = await fetch(`/api/search?q=${newValue}`, {
      signal: controller.signal
    })
    results.value = await response.json()
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}, {
  // 延迟 300ms 执行
  flush: 'post'
})

// 或使用第三方库如 @vueuse/core
import { watchDebounced } from '@vueuse/core'

watchDebounced(
  searchText,
  () => {
    performSearch(searchText.value)
  },
  { debounce: 300 }
)
```

### 示例 3：数据同步到 localStorage

```typescript
import { ref, watch } from 'vue'

function useLocalStorage<T>(key: string, defaultValue: T) {
  // 从 localStorage 读取初始值
  const data = ref<T>(
    JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue))
  )
  
  // 监听变化并同步到 localStorage
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
const userPreferences = useLocalStorage('preferences', {
  theme: 'light',
  language: 'zh-CN'
})

userPreferences.value.theme = 'dark' // 自动保存到 localStorage
```

### 示例 4：依赖其他计算属性

```typescript
const items = ref([
  { name: 'Apple', price: 10, quantity: 2 },
  { name: 'Banana', price: 5, quantity: 3 }
])

// 第一层计算：总价
const subtotal = computed(() => {
  return items.value.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
})

// 第二层计算：折扣
const discount = ref(0.1) // 10% 折扣
const discountAmount = computed(() => {
  return subtotal.value * discount.value
})

// 第三层计算：最终价格
const total = computed(() => {
  return subtotal.value - discountAmount.value
})

// 计算属性会自动管理依赖链
console.log(total.value) // 自动重新计算
```

---

## 最佳实践

1. **优先使用计算属性**：有缓存，性能更好
2. **避免修改计算属性的依赖**：在 getter 中应该是纯函数
3. **watchEffect 适合简单场景**：不需要旧值时使用
4. **深度监听谨慎使用**：性能开销大
5. **清理副作用**：避免内存泄漏
6. **使用 immediate**：需要初始化执行时

---

## 参考资料

- [Vue 3 计算属性](https://cn.vuejs.org/guide/essentials/computed.html)
- [侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)
- [深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)
