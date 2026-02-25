# 响应式基础：ref 与 reactive

> 响应式系统是 Vue 3 的核心，理解 ref 和 reactive 是掌握组合式 API 的第一步。

## 核心概念

Vue 3 使用 **Proxy** 实现响应式系统，提供两个主要 API 来创建响应式数据：

### ref - 包装原始值

```typescript
import { ref } from 'vue'

const count = ref(0)
const message = ref('Hello')

// 访问和修改需要 .value
console.log(count.value) // 0
count.value++
```

**特点**：
- 用于包装**原始类型**（string、number、boolean）
- 也可以包装对象，但不推荐
- 在 JS 中访问/修改需要 `.value`
- 在模板中自动解包，无需 `.value`

### reactive - 响应式对象

```typescript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

// 直接访问属性
console.log(state.count) // 0
state.count++
```

**特点**：
- 用于包装**对象类型**（对象、数组、Map、Set）
- 深层响应式，嵌套属性也是响应式
- 不需要 `.value`
- **不能解构或替换**，会丢失响应性

---

## 响应式原理：Proxy vs Object.defineProperty

### Vue 2 的局限（Object.defineProperty）

```javascript
// Vue 2 无法检测以下操作
const obj = { count: 0 }
obj.newProp = 1 // ❌ 新增属性不响应式
delete obj.count // ❌ 删除属性不响应式
arr[0] = 1       // ❌ 直接索引修改不响应式
```

### Vue 3 的优势（Proxy）

```javascript
// Vue 3 使用 Proxy 拦截所有操作
const state = reactive({
  count: 0
})

state.newProp = 1  // ✅ 新增属性响应式
delete state.count // ✅ 删除属性响应式

const arr = reactive([1, 2, 3])
arr[0] = 10       // ✅ 索引修改响应式
arr.length = 0    // ✅ 修改长度响应式
```

**Proxy 拦截的操作**：
- 属性读取（get）
- 属性设置（set）
- 属性删除（deleteProperty）
- 枚举（ownKeys）
- 原型链查找（has）

---

## 使用场景与选择策略

### 何时使用 ref

```typescript
// ✅ 原始值
const count = ref(0)
const isVisible = ref(true)

// ✅ 可能需要整体替换的对象
const user = ref({ name: 'Alice' })
user.value = { name: 'Bob' } // 替换整个对象

// ✅ 需要与模板引用区分
const inputEl = ref<HTMLInputElement>()
```

### 何时使用 reactive

```typescript
// ✅ 固定结构的状态对象
const state = reactive({
  count: 0,
  user: { name: 'Alice', age: 25 },
  items: []
})

// ✅ 表单数据
const form = reactive({
  username: '',
  password: '',
  remember: false
})
```

---

## 响应式解包与注意事项

### 模板中的自动解包

```vue
<script setup>
const count = ref(0)
const state = reactive({ count: ref(1) })
</script>

<template>
  <!-- ✅ ref 在模板中自动解包 -->
  <div>{{ count }}</div>
  
  <!-- ⚠️ reactive 中的 ref 也会解包 -->
  <div>{{ state.count }}</div>
</template>
```

### reactive 中的 ref 解包

```typescript
const count = ref(0)
const state = reactive({
  count  // ref 会自动解包
})

console.log(state.count) // 0（不是 ref 对象）
state.count++ // 直接修改，不需要 .value
```

### 数组和集合中的 ref 不解包

```typescript
const count = ref(0)
const arr = reactive([count])

console.log(arr[0]) // Ref 对象
console.log(arr[0].value) // 0

const map = reactive(new Map([['count', count]]))
console.log(map.get('count').value) // 需要 .value
```

---

## 易错点与边界情况

### 1. reactive 解构丢失响应性

```typescript
const state = reactive({ count: 0, name: 'Vue' })

// ❌ 解构后丢失响应性
const { count, name } = state
count++ // 不会触发更新

// ✅ 使用 toRefs 保持响应性
import { toRefs } from 'vue'
const { count, name } = toRefs(state)
count.value++ // ✅ 响应式
```

### 2. reactive 替换整个对象

```typescript
let state = reactive({ count: 0 })

// ❌ 不要直接替换（会丢失响应性）
state = reactive({ count: 1 })

// ✅ 方案1：使用 ref 包装对象
const state = ref({ count: 0 })
state.value = { count: 1 }

// ✅ 方案2：修改属性而非替换
Object.assign(state, { count: 1 })
```

### 3. ref 在 reactive 中的陷阱

```typescript
const count = ref(0)
const state = reactive({
  count,
  nested: { count }
})

console.log(state.count)         // 0（已解包）
console.log(state.nested.count)  // 0（已解包）

// 修改原始 ref
count.value = 10

console.log(state.count)         // 10（同步更新）
console.log(state.nested.count)  // 10（同步更新）
```

### 4. 原始值 vs 引用关系

```typescript
const original = { count: 0 }
const state = reactive(original)

console.log(state === original) // false（Proxy 对象）

// 修改 state 会影响 original
state.count = 1
console.log(original.count) // 1

// 反之亦然
original.count = 2
console.log(state.count) // 2
```

---

## toRef 与 toRefs 工具函数

### toRef - 创建单个属性的 ref

```typescript
import { reactive, toRef } from 'vue'

const state = reactive({ count: 0, name: 'Vue' })

// 创建与 state.count 关联的 ref
const countRef = toRef(state, 'count')

countRef.value++ // state.count 也会更新
console.log(state.count) // 1
```

**使用场景**：
- 将响应式对象的某个属性传递给子组件
- 保持与原对象的响应式关联

### toRefs - 转换整个对象

```typescript
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue'
})

// 将所有属性转换为 ref
const { count, name } = toRefs(state)

count.value++ // state.count 也会更新
console.log(state.count) // 1
```

**典型用法**：
```typescript
// Composable 返回值
function useCounter() {
  const state = reactive({
    count: 0,
    double: computed(() => state.count * 2)
  })
  
  // 解构友好的返回
  return toRefs(state)
}

// 使用时可以解构
const { count, double } = useCounter()
```

---

## 前端工程实践

### 示例 1：状态管理

```typescript
// useUserStore.ts
import { reactive, toRefs } from 'vue'

export function useUserStore() {
  const state = reactive({
    user: null as User | null,
    loading: false,
    error: null as Error | null
  })
  
  async function fetchUser(id: string) {
    state.loading = true
    state.error = null
    try {
      state.user = await api.getUser(id)
    } catch (err) {
      state.error = err
    } finally {
      state.loading = false
    }
  }
  
  return {
    ...toRefs(state),
    fetchUser
  }
}
```

### 示例 2：表单处理

```vue
<script setup lang="ts">
import { reactive } from 'vue'

interface Form {
  username: string
  password: string
  remember: boolean
}

const form = reactive<Form>({
  username: '',
  password: '',
  remember: false
})

const errors = reactive({
  username: '',
  password: ''
})

function validate() {
  errors.username = form.username ? '' : '用户名不能为空'
  errors.password = form.password.length < 6 ? '密码至少6位' : ''
  return !errors.username && !errors.password
}

async function handleSubmit() {
  if (validate()) {
    await login(form)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.username" placeholder="用户名">
    <span v-if="errors.username">{{ errors.username }}</span>
    
    <input v-model="form.password" type="password" placeholder="密码">
    <span v-if="errors.password">{{ errors.password }}</span>
    
    <label>
      <input v-model="form.remember" type="checkbox">
      记住我
    </label>
    
    <button type="submit">登录</button>
  </form>
</template>
```

### 示例 3：响应式数据转换

```typescript
import { ref, computed } from 'vue'

// API 返回的数据
const rawData = ref([
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 }
])

// 转换为响应式的计算属性
const users = computed(() => {
  return rawData.value.map(user => ({
    ...user,
    displayName: `${user.name} (${user.age}岁)`
  }))
})

// 筛选逻辑
const searchText = ref('')
const filteredUsers = computed(() => {
  return users.value.filter(user => 
    user.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})
```

---

## 最佳实践

1. **优先使用 ref**：除非明确需要 reactive 的特性
2. **避免混用**：一个数据结构使用一种方式
3. **Composable 返回 toRefs**：方便解构使用
4. **不要解构 reactive**：会丢失响应性
5. **大对象优先 reactive**：避免嵌套过多 ref

---

## 参考资料

- [Vue 3 官方文档 - 响应式基础](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)
- [响应式 API：核心](https://cn.vuejs.org/api/reactivity-core.html)
