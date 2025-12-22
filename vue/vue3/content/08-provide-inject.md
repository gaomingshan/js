# 第 8 节：依赖注入

## 概述

Provide/Inject 是 Vue 的依赖注入机制，允许祖先组件向所有后代组件传递数据，无论层级多深。适用于跨多层组件传递数据的场景。

## 一、基本用法

### 1.1 Provide 提供数据

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
const user = ref({ name: 'Vue', role: 'admin' })

// 提供静态值
provide('appName', 'My App')

// 提供响应式值
provide('theme', theme)
provide('user', user)
</script>
```

### 1.2 Inject 注入数据

```vue
<!-- 后代组件（任意层级） -->
<script setup>
import { inject } from 'vue'

// 注入数据
const appName = inject('appName')
const theme = inject('theme')
const user = inject('user')

console.log(appName)      // 'My App'
console.log(theme.value)  // 'dark'
</script>
```

## 二、工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                   Provide / Inject                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   App (provide: theme, user)                                │
│   ├── Header                                                │
│   │   └── UserMenu (inject: user) ✓                        │
│   ├── Sidebar                                               │
│   │   └── NavItem (inject: theme) ✓                        │
│   └── Main                                                  │
│       └── Content                                           │
│           └── Card (inject: theme, user) ✓                 │
│                                                             │
│   所有后代组件都可以 inject，无需层层传递 Props              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 三、默认值

### 3.1 提供默认值

```vue
<script setup>
import { inject } from 'vue'

// 如果没有提供 'theme'，使用默认值
const theme = inject('theme', 'light')

// 工厂函数默认值（避免不必要的计算）
const config = inject('config', () => ({
  debug: false,
  version: '1.0'
}), true)  // 第三个参数表示默认值是工厂函数
</script>
```

### 3.2 必需的注入

```vue
<script setup>
import { inject } from 'vue'

// 没有默认值时，如果未提供会警告
const theme = inject('theme')

// 明确标记为可选
const optional = inject('optional', undefined)
</script>
```

## 四、响应式

### 4.1 保持响应式

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref, readonly } from 'vue'

const count = ref(0)

// 提供响应式值
provide('count', count)

// 提供只读响应式值（防止后代修改）
provide('readonlyCount', readonly(count))
</script>

<!-- 后代组件 -->
<script setup>
import { inject, watch } from 'vue'

const count = inject('count')

// 响应式：值变化时会更新
watch(count, (newVal) => {
  console.log('count changed:', newVal)
})
</script>
```

### 4.2 提供修改方法

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref, readonly } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

// 提供只读值 + 修改方法
provide('counter', {
  count: readonly(count),
  increment
})
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

const { count, increment } = inject('counter')

// 不能直接修改 count（只读）
// count.value++  // 警告

// 通过方法修改
increment()
</script>
```

## 五、Symbol 作为 Key

### 5.1 避免命名冲突

```javascript
// keys.js - 集中定义 injection keys
export const ThemeKey = Symbol('theme')
export const UserKey = Symbol('user')
export const ConfigKey = Symbol('config')
```

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'
import { ThemeKey, UserKey } from './keys'

provide(ThemeKey, ref('dark'))
provide(UserKey, ref({ name: 'Vue' }))
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'
import { ThemeKey, UserKey } from './keys'

const theme = inject(ThemeKey)
const user = inject(UserKey)
</script>
```

### 5.2 TypeScript 类型支持

```typescript
// keys.ts
import type { InjectionKey, Ref } from 'vue'

export interface User {
  name: string
  role: string
}

export const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme')
export const UserKey: InjectionKey<Ref<User>> = Symbol('user')
```

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { ThemeKey, UserKey } from './keys'

// 自动推断类型
const theme = inject(ThemeKey)  // Ref<string> | undefined
const user = inject(UserKey)    // Ref<User> | undefined

// 带默认值
const theme2 = inject(ThemeKey, ref('light'))  // Ref<string>
</script>
```

## 六、应用级 Provide

### 6.1 在 main.js 中提供

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 应用级 provide，所有组件可用
app.provide('globalConfig', {
  apiUrl: 'https://api.example.com',
  debug: true
})

app.mount('#app')
```

## 七、实用示例

### 7.1 主题系统

```vue
<!-- App.vue -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

provide('theme', {
  current: theme,
  toggle: toggleTheme
})
</script>

<!-- 任意后代组件 -->
<script setup>
import { inject } from 'vue'

const { current: theme, toggle } = inject('theme')
</script>

<template>
  <div :class="theme">
    <button @click="toggle">切换主题</button>
  </div>
</template>
```

### 7.2 用户认证

```vue
<!-- AuthProvider.vue -->
<script setup>
import { provide, ref, readonly } from 'vue'

const user = ref(null)
const isLoggedIn = computed(() => !!user.value)

async function login(credentials) {
  user.value = await authService.login(credentials)
}

function logout() {
  user.value = null
}

provide('auth', {
  user: readonly(user),
  isLoggedIn,
  login,
  logout
})
</script>

<template>
  <slot />
</template>

<!-- 使用 -->
<template>
  <AuthProvider>
    <App />
  </AuthProvider>
</template>
```

### 7.3 表单上下文

```vue
<!-- Form.vue -->
<script setup>
import { provide, reactive } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const formContext = reactive({
  values: props.modelValue,
  errors: {},
  setFieldValue(name, value) {
    emit('update:modelValue', {
      ...props.modelValue,
      [name]: value
    })
  },
  setFieldError(name, error) {
    this.errors[name] = error
  }
})

provide('formContext', formContext)
</script>

<!-- FormItem.vue -->
<script setup>
import { inject, computed } from 'vue'

const props = defineProps(['name'])
const form = inject('formContext')

const value = computed({
  get: () => form.values[props.name],
  set: (val) => form.setFieldValue(props.name, val)
})

const error = computed(() => form.errors[props.name])
</script>
```

## 八、Provide/Inject vs 其他方案

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| Props | 父子组件 | 类型安全、明确 | 层级深时繁琐 |
| Provide/Inject | 跨层级 | 避免 prop drilling | 来源不明确 |
| Pinia | 全局状态 | 功能完整、DevTools | 引入额外依赖 |
| EventBus | 任意组件 | 灵活 | 难追踪、易混乱 |

## 九、最佳实践

| 实践 | 说明 |
|------|------|
| 使用 Symbol key | 避免命名冲突 |
| 提供 readonly | 防止后代意外修改 |
| 提供修改方法 | 数据流向清晰 |
| 集中定义 keys | 便于维护和类型推断 |
| 适度使用 | 简单场景用 Props |

## 参考资料

- [依赖注入](https://vuejs.org/guide/components/provide-inject.html)

---

**下一节** → [第 9 节：生命周期](./09-lifecycle.md)
