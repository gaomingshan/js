# 依赖注入：Provide / Inject

> Provide 和 Inject 提供了跨层级组件通信的能力，避免了 props 逐层传递的繁琐。

## 核心概念

依赖注入允许祖先组件向所有后代组件提供数据，无论层级多深，后代组件都可以直接注入使用。

### 基础用法

```vue
<!-- 祖先组件 App.vue -->
<script setup>
import { provide } from 'vue'

const theme = ref('light')
const user = reactive({
  name: 'Alice',
  role: 'admin'
})

// 提供数据
provide('theme', theme)
provide('user', user)
</script>

<template>
  <Child />
</template>

<!-- 后代组件（任意层级）-->
<script setup>
import { inject } from 'vue'

// 注入数据
const theme = inject('theme')
const user = inject('user')
</script>

<template>
  <div :class="`theme-${theme}`">
    <p>当前用户：{{ user.name }}</p>
  </div>
</template>
```

---

## Provide

### 提供响应式数据

```vue
<script setup>
import { provide, ref, readonly } from 'vue'

const count = ref(0)

// 提供响应式数据
provide('count', count)

// 提供只读数据（防止后代修改）
provide('readonlyCount', readonly(count))

// 提供方法
provide('increment', () => {
  count.value++
})
</script>
```

### 应用层 Provide

在整个应用范围内提供数据。

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 应用层 provide
app.provide('globalConfig', {
  apiUrl: 'https://api.example.com',
  timeout: 5000
})

app.mount('#app')
```

```vue
<!-- 任意组件中注入 -->
<script setup>
const config = inject('globalConfig')
console.log(config.apiUrl)
</script>
```

---

## Inject

### 注入默认值

```vue
<script setup>
import { inject } from 'vue'

// 如果没有提供，使用默认值
const theme = inject('theme', 'light')

// 工厂函数作为默认值
const user = inject('user', () => ({ name: 'Guest' }))

// 强制要求提供（不设置默认值，会在未提供时警告）
const requiredValue = inject('requiredKey')
</script>
```

### 注入类型定义

```typescript
// types.ts
export interface User {
  name: string
  age: number
}

export const UserKey: InjectionKey<User> = Symbol('user')
```

```vue
<!-- 祖先组件 -->
<script setup lang="ts">
import { provide } from 'vue'
import { UserKey } from './types'

const user: User = {
  name: 'Alice',
  age: 25
}

provide(UserKey, user)
</script>

<!-- 后代组件 -->
<script setup lang="ts">
import { inject } from 'vue'
import { UserKey } from './types'

// 类型安全的注入
const user = inject(UserKey)
// user 的类型是 User | undefined
</script>
```

---

## 响应式注入

### 保持响应性

```vue
<!-- 提供方 -->
<script setup>
import { provide, ref } from 'vue'

const count = ref(0)
const message = ref('Hello')

// ✅ 提供响应式引用
provide('count', count)
provide('message', message)

// ❌ 提供值（失去响应性）
provide('countValue', count.value)
</script>

<!-- 注入方 -->
<script setup>
import { inject } from 'vue'

const count = inject('count')
const message = inject('message')

// ✅ 响应式更新
watch(count, (newValue) => {
  console.log('Count changed:', newValue)
})
</script>
```

### 修改注入的数据

```vue
<!-- 提供方 -->
<script setup>
import { provide, ref } from 'vue'

const count = ref(0)

// 提供数据和修改方法
provide('count', readonly(count))
provide('increment', () => count.value++)
provide('decrement', () => count.value--)
</script>

<!-- 注入方 -->
<script setup>
import { inject } from 'vue'

const count = inject('count')
const increment = inject('increment')
const decrement = inject('decrement')
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>
```

---

## 符号键与类型安全

### 使用 Symbol 作为键

```typescript
// keys.ts
import type { InjectionKey, Ref } from 'vue'

export interface AppConfig {
  apiUrl: string
  timeout: number
}

// 使用 Symbol 避免键名冲突
export const ConfigKey: InjectionKey<AppConfig> = Symbol('config')
export const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme')
```

```vue
<!-- 提供方 -->
<script setup lang="ts">
import { provide } from 'vue'
import { ConfigKey, ThemeKey } from './keys'

const config: AppConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
}

const theme = ref('light')

provide(ConfigKey, config)
provide(ThemeKey, theme)
</script>

<!-- 注入方 -->
<script setup lang="ts">
import { inject } from 'vue'
import { ConfigKey, ThemeKey } from './keys'

// 类型安全
const config = inject(ConfigKey)  // AppConfig | undefined
const theme = inject(ThemeKey)    // Ref<string> | undefined

// 提供默认值
const configWithDefault = inject(ConfigKey, {
  apiUrl: 'https://default.com',
  timeout: 3000
})
</script>
```

---

## 使用场景

### 1. 主题系统

```vue
<!-- App.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

provide('theme', readonly(theme))
provide('toggleTheme', toggleTheme)
</script>

<template>
  <div :class="`theme-${theme}`">
    <Header />
    <Main />
    <Footer />
  </div>
</template>

<!-- 任意组件 -->
<script setup lang="ts">
import { inject } from 'vue'

const theme = inject<Ref<Theme>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
</script>

<template>
  <button @click="toggleTheme">
    切换到{{ theme === 'light' ? '深色' : '浅色' }}模式
  </button>
</template>
```

### 2. 用户信息

```vue
<!-- App.vue -->
<script setup lang="ts">
import { provide, reactive } from 'vue'

interface User {
  id: number
  name: string
  role: 'admin' | 'user'
}

const currentUser = reactive<User | null>(null)

async function login(username: string, password: string) {
  const user = await api.login(username, password)
  Object.assign(currentUser, user)
}

function logout() {
  Object.assign(currentUser, null)
}

provide('currentUser', readonly(currentUser))
provide('login', login)
provide('logout', logout)
</script>

<!-- 任意组件 -->
<script setup>
const user = inject('currentUser')
const logout = inject('logout')
</script>

<template>
  <div v-if="user">
    <p>欢迎，{{ user.name }}</p>
    <button @click="logout">退出</button>
  </div>
</template>
```

### 3. 国际化

```vue
<!-- App.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'

type Locale = 'zh-CN' | 'en-US'

const locale = ref<Locale>('zh-CN')

const messages = {
  'zh-CN': {
    hello: '你好',
    goodbye: '再见'
  },
  'en-US': {
    hello: 'Hello',
    goodbye: 'Goodbye'
  }
}

function t(key: string) {
  return messages[locale.value][key] || key
}

function setLocale(newLocale: Locale) {
  locale.value = newLocale
}

provide('locale', readonly(locale))
provide('t', t)
provide('setLocale', setLocale)
</script>

<!-- 任意组件 -->
<script setup>
const t = inject('t')
const setLocale = inject('setLocale')
</script>

<template>
  <div>
    <p>{{ t('hello') }}</p>
    <button @click="setLocale('en-US')">English</button>
    <button @click="setLocale('zh-CN')">中文</button>
  </div>
</template>
```

---

## 易错点与边界情况

### 1. 注入时机

```vue
<script setup>
// ✅ 在 setup 中同步调用
const value = inject('key')

// ❌ 异步调用会失败
setTimeout(() => {
  const value = inject('key') // 错误！
}, 1000)

// ❌ 在生命周期钩子外调用
onMounted(() => {
  const value = inject('key') // 错误！
})
</script>
```

### 2. 响应式丢失

```vue
<!-- 提供方 -->
<script setup>
const state = reactive({ count: 0 })

// ❌ 提供属性值（丢失响应性）
provide('count', state.count)

// ✅ 提供整个对象
provide('state', state)

// ✅ 或使用 toRef
provide('count', toRef(state, 'count'))
</script>
```

### 3. 默认值的类型

```typescript
// ❌ 类型推断可能不正确
const value = inject('key', 'default')
// value 类型是 string | undefined

// ✅ 明确指定类型
const value = inject<string>('key', 'default')
// value 类型是 string

// ✅ 使用 InjectionKey
const value = inject(KeySymbol, 'default')
// 基于 InjectionKey 的类型推断
```

### 4. 键名冲突

```vue
<!-- ❌ 使用字符串键可能冲突 -->
<script setup>
// 祖先组件 A
provide('user', userA)

// 祖先组件 B（更上层）
provide('user', userB)

// 后代组件会注入到最近的 'user'
const user = inject('user') // 得到 userA
</script>

<!-- ✅ 使用 Symbol 避免冲突 -->
<script setup>
const UserKeyA = Symbol('userA')
const UserKeyB = Symbol('userB')

provide(UserKeyA, userA)
provide(UserKeyB, userB)
</script>
```

---

## 前端工程实践

### 示例 1：状态管理

```typescript
// useStore.ts
import { reactive, readonly, provide, inject, InjectionKey } from 'vue'

interface State {
  count: number
  user: User | null
}

interface Store {
  state: Readonly<State>
  increment: () => void
  decrement: () => void
  setUser: (user: User) => void
}

const StoreKey: InjectionKey<Store> = Symbol('store')

export function createStore() {
  const state = reactive<State>({
    count: 0,
    user: null
  })

  const store: Store = {
    state: readonly(state),
    
    increment() {
      state.count++
    },
    
    decrement() {
      state.count--
    },
    
    setUser(user: User) {
      state.user = user
    }
  }

  return {
    install(app: App) {
      app.provide(StoreKey, store)
    }
  }
}

export function useStore() {
  const store = inject(StoreKey)
  if (!store) {
    throw new Error('Store not provided')
  }
  return store
}

// main.ts
import { createApp } from 'vue'
import { createStore } from './useStore'

const app = createApp(App)
app.use(createStore())
app.mount('#app')

// 组件中使用
const store = useStore()
console.log(store.state.count)
store.increment()
```

### 示例 2：表单上下文

```vue
<!-- Form.vue -->
<script setup lang="ts">
import { provide, reactive } from 'vue'

interface FormContext {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  setFieldValue: (name: string, value: any) => void
  setFieldError: (name: string, error: string) => void
  setFieldTouched: (name: string, touched: boolean) => void
}

const formContext: FormContext = reactive({
  values: {},
  errors: {},
  touched: {},
  
  setFieldValue(name, value) {
    this.values[name] = value
  },
  
  setFieldError(name, error) {
    this.errors[name] = error
  },
  
  setFieldTouched(name, touched) {
    this.touched[name] = touched
  }
})

provide('formContext', formContext)

function handleSubmit() {
  console.log('提交表单:', formContext.values)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <slot></slot>
  </form>
</template>

<!-- FormField.vue -->
<script setup lang="ts">
import { inject, computed } from 'vue'

const props = defineProps<{
  name: string
  label: string
}>()

const formContext = inject<FormContext>('formContext')

const value = computed({
  get: () => formContext?.values[props.name] || '',
  set: (val) => formContext?.setFieldValue(props.name, val)
})

const error = computed(() => {
  return formContext?.touched[props.name] && formContext?.errors[props.name]
})

function handleBlur() {
  formContext?.setFieldTouched(props.name, true)
}
</script>

<template>
  <div class="form-field">
    <label>{{ label }}</label>
    <input
      v-model="value"
      @blur="handleBlur"
    >
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<!-- 使用 -->
<template>
  <Form>
    <FormField name="username" label="用户名" />
    <FormField name="email" label="邮箱" />
    <button type="submit">提交</button>
  </Form>
</template>
```

### 示例 3：配置提供者

```typescript
// config.ts
import { App, InjectionKey } from 'vue'

export interface AppConfig {
  apiUrl: string
  timeout: number
  theme: {
    primaryColor: string
    borderRadius: string
  }
}

const ConfigKey: InjectionKey<AppConfig> = Symbol('config')

export function createConfig(config: AppConfig) {
  return {
    install(app: App) {
      app.provide(ConfigKey, config)
    }
  }
}

export function useConfig() {
  const config = inject(ConfigKey)
  if (!config) {
    throw new Error('Config not provided')
  }
  return config
}

// main.ts
const app = createApp(App)

app.use(createConfig({
  apiUrl: import.meta.env.VITE_API_URL,
  timeout: 5000,
  theme: {
    primaryColor: '#42b983',
    borderRadius: '4px'
  }
}))

// 组件中使用
const config = useConfig()
```

### 示例 4：插件系统

```typescript
// plugins/modal.ts
import { App, InjectionKey, Ref, ref } from 'vue'

interface ModalOptions {
  title: string
  content: string
  onConfirm?: () => void
  onCancel?: () => void
}

interface ModalPlugin {
  show: (options: ModalOptions) => void
  hide: () => void
  visible: Ref<boolean>
  options: Ref<ModalOptions | null>
}

const ModalKey: InjectionKey<ModalPlugin> = Symbol('modal')

export function createModal() {
  const visible = ref(false)
  const options = ref<ModalOptions | null>(null)

  const modal: ModalPlugin = {
    show(opts) {
      options.value = opts
      visible.value = true
    },
    
    hide() {
      visible.value = false
      setTimeout(() => {
        options.value = null
      }, 300)
    },
    
    visible,
    options
  }

  return {
    install(app: App) {
      app.provide(ModalKey, modal)
    }
  }
}

export function useModal() {
  const modal = inject(ModalKey)
  if (!modal) {
    throw new Error('Modal plugin not installed')
  }
  return modal
}

// 全局组件
// ModalContainer.vue
<script setup>
const modal = useModal()
</script>

<template>
  <Teleport to="body">
    <div v-if="modal.visible.value" class="modal">
      <div class="modal-content">
        <h2>{{ modal.options.value?.title }}</h2>
        <p>{{ modal.options.value?.content }}</p>
        <button @click="modal.options.value?.onConfirm?.(); modal.hide()">
          确定
        </button>
        <button @click="modal.options.value?.onCancel?.(); modal.hide()">
          取消
        </button>
      </div>
    </div>
  </Teleport>
</template>

// 使用
const modal = useModal()

modal.show({
  title: '确认删除',
  content: '确定要删除这条记录吗？',
  onConfirm: () => {
    console.log('已删除')
  }
})
```

---

## Provide/Inject vs Props vs Event Bus

| 特性 | Props | Provide/Inject | Event Bus |
|------|-------|----------------|-----------|
| 数据流向 | 父→子 | 祖先→后代 | 任意组件 |
| 层级限制 | 直接父子 | 无限制 | 无限制 |
| 类型安全 | ✅ | ✅（Symbol + InjectionKey） | ❌ |
| 响应式 | ✅ | ✅ | ❌（需手动处理） |
| 依赖追踪 | ✅ 清晰 | ⚠️ 隐式 | ❌ 难追踪 |
| 适用场景 | 简单父子通信 | 跨层级状态共享 | 全局事件（不推荐） |

---

## 最佳实践

1. **使用 Symbol 键**：避免命名冲突
2. **提供类型定义**：使用 InjectionKey 确保类型安全
3. **只读数据**：使用 readonly() 防止意外修改
4. **提供修改方法**：而非直接暴露可写数据
5. **合理的粒度**：不要过度使用 provide/inject
6. **提供默认值**：增强健壮性
7. **文档化依赖**：注释说明需要注入的数据
8. **错误处理**：注入失败时提供友好提示

---

## 参考资料

- [依赖注入](https://cn.vuejs.org/guide/components/provide-inject.html)
- [Provide / Inject API](https://cn.vuejs.org/api/composition-api-dependency-injection.html)
- [InjectionKey](https://cn.vuejs.org/api/utility-types.html#injectionkey)
