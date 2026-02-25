# TypeScript 集成

> 深入理解 Vue 3 与 TypeScript 的集成，掌握类型安全的开发方式。

## 核心概念

Vue 3 从零开始使用 TypeScript 重写，提供了一流的 TypeScript 支持。

### 项目配置

```bash
# 创建 TypeScript 项目
npm create vite@latest my-app -- --template vue-ts
```

---

## 组件类型

### defineComponent

为组件添加类型推导。

```typescript
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyComponent',
  props: {
    title: String,
    count: Number
  },
  setup(props) {
    // props 有完整的类型推导
    console.log(props.title) // string | undefined
    console.log(props.count) // number | undefined
  }
})
```

### script setup（推荐）

```vue
<script setup lang="ts">
// 自动类型推导
const count = ref(0) // Ref<number>
const message = ref('hello') // Ref<string>
</script>
```

---

## Props 类型

### 运行时声明

```vue
<script setup lang="ts">
const props = defineProps({
  title: String,
  count: {
    type: Number,
    required: true,
    default: 0
  },
  items: {
    type: Array as PropType<string[]>,
    required: true
  },
  user: {
    type: Object as PropType<User>,
    required: true
  }
})
</script>
```

### 类型声明（推荐）

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

interface Props {
  title: string
  count?: number
  items: string[]
  user: User
}

const props = defineProps<Props>()

// 或内联定义
const props = defineProps<{
  title: string
  count?: number
  items: string[]
  user: User
}>()
</script>
```

### 默认值

```vue
<script setup lang="ts">
interface Props {
  title?: string
  count?: number
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Default Title',
  count: 0,
  enabled: true
})
</script>
```

### 复杂类型

```vue
<script setup lang="ts">
import type { PropType } from 'vue'

interface Product {
  id: number
  name: string
  price: number
}

// 数组
const props = defineProps<{
  products: Product[]
}>()

// 联合类型
const props = defineProps<{
  status: 'pending' | 'success' | 'error'
}>()

// 函数类型
const props = defineProps<{
  onClick: (id: number) => void
  formatter: (value: number) => string
}>()

// 可选链
const props = defineProps<{
  user?: {
    name: string
    age?: number
  }
}>()
</script>
```

---

## Emits 类型

### 类型声明

```vue
<script setup lang="ts">
// 基础定义
const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
  submit: []
}>()

// 使用
emit('change', 123)
emit('update', 'hello')
emit('submit')

// 带返回值（实际不会有返回值，只是类型定义）
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
  (e: 'submit'): void
}>()
</script>
```

### 复杂事件

```vue
<script setup lang="ts">
interface FormData {
  username: string
  password: string
}

interface ValidationError {
  field: string
  message: string
}

const emit = defineEmits<{
  'submit': [data: FormData]
  'error': [errors: ValidationError[]]
  'update:modelValue': [value: string]
  'change': [event: Event, value: string]
}>()
</script>
```

---

## Ref 类型

### 基础类型

```typescript
import { ref, Ref } from 'vue'

// 自动推导
const count = ref(0) // Ref<number>
const message = ref('hello') // Ref<string>
const flag = ref(true) // Ref<boolean>

// 显式指定类型
const count = ref<number>(0)
const message = ref<string>('hello')

// 可能为 null/undefined
const user = ref<User | null>(null)
const data = ref<Data>() // Ref<Data | undefined>
```

### 复杂类型

```typescript
interface User {
  id: number
  name: string
  email: string
}

// 对象
const user = ref<User>({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
})

// 数组
const users = ref<User[]>([])

// 嵌套
const state = ref<{
  loading: boolean
  data: User[]
  error: Error | null
}>({
  loading: false,
  data: [],
  error: null
})
```

### DOM 元素

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const inputRef = ref<HTMLInputElement>()
const divRef = ref<HTMLDivElement>()

onMounted(() => {
  // 需要可选链或类型守卫
  inputRef.value?.focus()
  
  if (divRef.value) {
    console.log(divRef.value.clientHeight)
  }
})
</script>

<template>
  <input ref="inputRef">
  <div ref="divRef">Content</div>
</template>
```

### 组件 Ref

```vue
<script setup lang="ts">
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

const componentRef = ref<InstanceType<typeof MyComponent>>()

function callComponentMethod() {
  componentRef.value?.someMethod()
}
</script>

<template>
  <MyComponent ref="componentRef" />
</template>
```

---

## Reactive 类型

### 基础用法

```typescript
import { reactive } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

// 自动推导
const user = reactive({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
})

// 显式类型
const user = reactive<User>({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
})
```

### 复杂类型

```typescript
interface State {
  loading: boolean
  data: User[]
  error: Error | null
  filters: {
    search: string
    status: 'all' | 'active' | 'inactive'
  }
}

const state = reactive<State>({
  loading: false,
  data: [],
  error: null,
  filters: {
    search: '',
    status: 'all'
  }
})
```

---

## Computed 类型

### 基础用法

```typescript
import { ref, computed } from 'vue'

const count = ref(0)

// 自动推导
const double = computed(() => count.value * 2) // ComputedRef<number>

// 显式类型
const double = computed<number>(() => count.value * 2)
```

### 复杂类型

```typescript
interface User {
  firstName: string
  lastName: string
}

const user = reactive<User>({
  firstName: 'John',
  lastName: 'Doe'
})

// 自动推导
const fullName = computed(() => `${user.firstName} ${user.lastName}`)

// 可写计算属性
const fullName = computed<string>({
  get() {
    return `${user.firstName} ${user.lastName}`
  },
  set(value: string) {
    const parts = value.split(' ')
    user.firstName = parts[0]
    user.lastName = parts[1]
  }
})
```

---

## 事件处理器类型

### 原生事件

```vue
<script setup lang="ts">
function handleClick(event: MouseEvent) {
  console.log(event.clientX, event.clientY)
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  console.log(target.value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    console.log('Enter pressed')
  }
}
</script>

<template>
  <button @click="handleClick">Click</button>
  <input @input="handleInput">
  <input @keydown="handleKeydown">
</template>
```

### 自定义事件

```vue
<script setup lang="ts">
interface CustomEvent {
  id: number
  data: string
}

function handleCustom(event: CustomEvent) {
  console.log(event.id, event.data)
}
</script>

<template>
  <MyComponent @custom="handleCustom" />
</template>
```

---

## Provide / Inject 类型

### 使用 InjectionKey

```typescript
// keys.ts
import type { InjectionKey, Ref } from 'vue'

export interface User {
  id: number
  name: string
}

export const UserKey: InjectionKey<Ref<User>> = Symbol('user')
export const ThemeKey: InjectionKey<string> = Symbol('theme')
```

```vue
<!-- 提供方 -->
<script setup lang="ts">
import { provide, ref } from 'vue'
import { UserKey, ThemeKey, type User } from './keys'

const user = ref<User>({
  id: 1,
  name: 'Alice'
})

provide(UserKey, user)
provide(ThemeKey, 'dark')
</script>

<!-- 注入方 -->
<script setup lang="ts">
import { inject } from 'vue'
import { UserKey, ThemeKey } from './keys'

// 类型安全
const user = inject(UserKey) // Ref<User> | undefined
const theme = inject(ThemeKey) // string | undefined

// 带默认值
const theme = inject(ThemeKey, 'light') // string
</script>
```

---

## 组合式函数类型

### 基础 Composable

```typescript
// useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,
    double,
    increment,
    decrement
  }
}

// 使用
const { count, double, increment } = useCounter(10)
```

### 泛型 Composable

```typescript
// useFetch.ts
import { ref, Ref } from 'vue'

export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  
  async function execute() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }
  
  return {
    data,
    error,
    loading,
    execute
  }
}

// 使用
interface User {
  id: number
  name: string
}

const { data, error, loading, execute } = useFetch<User>('/api/user')
```

### 返回类型推导

```typescript
// useAsync.ts
import { ref, Ref, UnwrapRef } from 'vue'

export function useAsync<T>(
  asyncFn: () => Promise<T>
): {
  data: Ref<UnwrapRef<T> | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  execute: () => Promise<void>
} {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  
  async function execute() {
    loading.value = true
    try {
      data.value = await asyncFn()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }
  
  return { data, error, loading, execute }
}
```

---

## 全局属性类型

### 扩展 ComponentCustomProperties

```typescript
// types/global.d.ts
import { Router } from 'vue-router'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router
    $http: AxiosInstance
    $message: {
      success: (msg: string) => void
      error: (msg: string) => void
    }
  }
}

export {}
```

使用：

```vue
<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
instance?.proxy?.$router.push('/')
instance?.proxy?.$message.success('Success!')
</script>
```

---

## 工具类型

### Vue 提供的工具类型

```typescript
import type {
  PropType,
  ComponentPublicInstance,
  ExtractPropTypes,
  ExtractDefaultPropTypes
} from 'vue'

// PropType: 定义 prop 类型
const props = {
  items: {
    type: Array as PropType<string[]>,
    required: true
  }
}

// ExtractPropTypes: 提取 props 类型
type Props = ExtractPropTypes<typeof props>

// ComponentPublicInstance: 组件实例类型
const componentRef = ref<ComponentPublicInstance>()
```

### 自定义工具类型

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P]
}

// 深度部分
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

// 提取 ref 内部类型
type UnwrapRef<T> = T extends Ref<infer U> ? U : T
```

---

## JSX/TSX 支持

### 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ]
})
```

### 使用

```tsx
// MyComponent.tsx
import { defineComponent, ref } from 'vue'

interface Props {
  title: string
  count?: number
}

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    count: Number
  },
  
  setup(props: Props) {
    const localCount = ref(props.count || 0)
    
    return () => (
      <div class="container">
        <h1>{props.title}</h1>
        <p>Count: {localCount.value}</p>
        <button onClick={() => localCount.value++}>
          Increment
        </button>
      </div>
    )
  }
})
```

---

## 常见问题

### 1. Ref 类型推导

```typescript
// ❌ 类型推导为 Ref<number>，不能赋值为 null
const count = ref(0)
count.value = null // 错误

// ✅ 明确指定可能为 null
const count = ref<number | null>(0)
count.value = null // 正确
```

### 2. Reactive 类型限制

```typescript
// ❌ reactive 不支持原始类型
const count = reactive(0) // 错误

// ✅ 使用 ref
const count = ref(0) // 正确

// ✅ 或使用对象
const state = reactive({ count: 0 }) // 正确
```

### 3. Props 解构

```vue
<script setup lang="ts">
const props = defineProps<{ count: number }>()

// ❌ 失去响应性
const { count } = props

// ✅ 使用 toRefs
const { count } = toRefs(props)

// ✅ 或使用 getter
const getCount = () => props.count
</script>
```

### 4. 模板 Ref 类型

```vue
<script setup lang="ts">
// ❌ 类型不正确
const inputRef = ref<HTMLInputElement>(null)

// ✅ 正确类型
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  inputRef.value?.focus()
})
</script>
```

---

## 最佳实践

1. **优先使用类型声明**：而非运行时声明
2. **使用 InjectionKey**：provide/inject 类型安全
3. **泛型 Composables**：提高复用性
4. **严格模式**：tsconfig.json 开启 strict
5. **类型导入**：使用 `import type`
6. **避免 any**：尽量使用具体类型
7. **工具类型**：善用 Vue 和 TS 的工具类型
8. **类型守卫**：处理可能为 undefined 的情况

---

## TypeScript 配置建议

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true,
    
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

---

## 参考资料

- [TypeScript 与组合式 API](https://cn.vuejs.org/guide/typescript/composition-api.html)
- [TypeScript 与选项式 API](https://cn.vuejs.org/guide/typescript/options-api.html)
- [TypeScript 工具类型](https://cn.vuejs.org/api/utility-types.html)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
