# Props 与单向数据流

> Props 是父组件向子组件传递数据的机制，单向数据流确保数据的可追踪性。

## 核心概念

Props（properties）是组件的自定义属性，用于接收来自父组件的数据。

### 定义 Props

```vue
<!-- Child.vue -->
<script setup lang="ts">
// 方式1：数组形式（仅接收）
const props = defineProps(['title', 'likes', 'isPublished'])

// 方式2：对象形式（带类型）
const props = defineProps({
  title: String,
  likes: Number,
  isPublished: Boolean
})

// 方式3：TypeScript 类型（推荐）
interface Props {
  title: string
  likes: number
  isPublished: boolean
  author?: {
    name: string
    age: number
  }
}

const props = defineProps<Props>()

// 方式4：带默认值的 TypeScript
interface Props {
  title: string
  likes?: number
  isPublished?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  likes: 0,
  isPublished: false
})
</script>

<template>
  <div>
    <h3>{{ title }}</h3>
    <p>Likes: {{ likes }}</p>
    <p>Published: {{ isPublished }}</p>
  </div>
</template>
```

### 传递 Props

```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const post = ref({
  id: 1,
  title: 'Vue 3 教程',
  likes: 100,
  isPublished: true
})
</script>

<template>
  <!-- 静态传递 -->
  <Child title="静态标题" />
  
  <!-- 动态传递 -->
  <Child :title="post.title" />
  
  <!-- 传递数字 -->
  <Child :likes="42" />
  
  <!-- 传递布尔值 -->
  <Child :isPublished="true" />
  
  <!-- 传递对象 -->
  <Child :author="{ name: 'Alice', age: 25 }" />
  
  <!-- 传递整个对象的所有属性 -->
  <Child v-bind="post" />
  <!-- 等价于 -->
  <Child
    :id="post.id"
    :title="post.title"
    :likes="post.likes"
    :isPublished="post.isPublished"
  />
</template>
```

---

## Props 类型验证

### 基础类型

```typescript
const props = defineProps({
  // 基础类型检查
  propA: String,
  propB: Number,
  propC: Boolean,
  propD: Array,
  propE: Object,
  propF: Date,
  propG: Function,
  propH: Symbol,
  
  // 多种可能的类型
  propI: [String, Number],
  
  // 必填的字符串
  propJ: {
    type: String,
    required: true
  },
  
  // 带默认值的数字
  propK: {
    type: Number,
    default: 100
  },
  
  // 对象/数组的默认值必须从工厂函数返回
  propL: {
    type: Array,
    default: () => []
  },
  
  propM: {
    type: Object,
    default: () => ({ message: 'hello' })
  },
  
  // 自定义验证函数
  propN: {
    validator(value: number) {
      // 值必须是这些字符串中的一个
      return value >= 0 && value <= 100
    }
  }
})
```

### TypeScript 类型验证

```typescript
import type { PropType } from 'vue'

interface User {
  name: string
  age: number
}

const props = defineProps({
  // 对象类型
  user: {
    type: Object as PropType<User>,
    required: true
  },
  
  // 数组类型
  tags: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  
  // 函数类型
  callback: {
    type: Function as PropType<(id: number) => void>,
    required: true
  },
  
  // 联合类型
  status: {
    type: String as PropType<'success' | 'error' | 'warning'>,
    validator: (value: string) => ['success', 'error', 'warning'].includes(value)
  }
})
```

---

## 单向数据流

Props 遵循**单向数据流**：父组件的 props 更新会向下流动到子组件，反之则不行。

### 为什么需要单向数据流

```vue
<!-- ❌ 错误示范 -->
<script setup>
const props = defineProps<{ count: number }>()

// ❌ 不要直接修改 prop
function increment() {
  props.count++ // 运行时警告
}
</script>

<!-- ✅ 正确方式1：使用本地状态 -->
<script setup>
const props = defineProps<{ initialCount: number }>()

// 使用 prop 初始化本地状态
const count = ref(props.initialCount)

function increment() {
  count.value++
}
</script>

<!-- ✅ 正确方式2：触发事件让父组件修改 -->
<script setup>
const props = defineProps<{ count: number }>()

const emit = defineEmits<{
  'update:count': [value: number]
}>()

function increment() {
  emit('update:count', props.count + 1)
}
</script>
```

### Props 的响应式

```vue
<script setup>
const props = defineProps<{
  user: { name: string }
}>()

// ✅ 可以监听 prop 的变化
watch(() => props.user, (newUser) => {
  console.log('User changed:', newUser)
})

// ✅ 可以在计算属性中使用
const userName = computed(() => props.user.name.toUpperCase())

// ❌ 不要解构 props（会丢失响应性）
const { user } = props
watch(user, () => {}) // 不会响应

// ✅ 使用 toRefs 保持响应性
import { toRefs } from 'vue'
const { user } = toRefs(props)
watch(user, () => {}) // 正常响应
</script>
```

---

## Props 默认值与必填项

### 简单默认值

```typescript
interface Props {
  title?: string
  count?: number
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '默认标题',
  count: 0,
  isActive: true
})
```

### 对象/数组默认值

```typescript
interface Props {
  tags?: string[]
  user?: User
  config?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  // 必须使用箭头函数
  tags: () => [],
  user: () => ({ name: 'Guest', age: 0 }),
  config: () => ({
    theme: 'light',
    language: 'zh-CN'
  })
})
```

### 必填 Props

```typescript
// 不带 ? 的属性自动成为必填
interface Props {
  id: string          // 必填
  title: string       // 必填
  count?: number      // 可选
}

const props = defineProps<Props>()
```

---

## Boolean 类型转换

Boolean 类型的 props 有特殊的转换规则。

```vue
<!-- 父组件 -->
<template>
  <!-- 没有值，会被转换为 true -->
  <Child isPublished />
  <!-- 等价于 -->
  <Child :isPublished="true" />
  
  <!-- 空字符串，会被转换为 true -->
  <Child isPublished="" />
  
  <!-- 明确传递 false -->
  <Child :isPublished="false" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps<{
  isPublished: boolean
}>()
</script>
```

**多类型的优先级**：

```typescript
defineProps({
  // Boolean 优先于 String
  disabled: [Boolean, String]
})

// <Child disabled /> → true
// <Child disabled="" /> → true
// <Child disabled="false" /> → "false"（字符串）
```

---

## Props 解构与响应式丢失

### 问题

```vue
<script setup>
const props = defineProps<{ count: number }>()

// ❌ 解构会丢失响应性
const { count } = props

watch(count, () => {
  // 不会触发
})
</script>
```

### 解决方案

```vue
<script setup>
import { toRefs } from 'vue'

const props = defineProps<{ count: number }>()

// ✅ 使用 toRefs
const { count } = toRefs(props)

watch(count, () => {
  // 正常触发
})

// ✅ 或者直接使用 props
watch(() => props.count, () => {
  // 正常触发
})
</script>
```

---

## Prop 命名规范

### camelCase vs kebab-case

```vue
<!-- 子组件定义：使用 camelCase -->
<script setup>
const props = defineProps<{
  greetingMessage: string
  userId: number
}>()
</script>

<!-- 父组件传递：两种方式都可以 -->
<template>
  <!-- 推荐：kebab-case -->
  <Child greeting-message="Hello" :user-id="123" />
  
  <!-- 也支持：camelCase -->
  <Child greetingMessage="Hello" :userId="123" />
</template>
```

**建议**：
- **定义时**：使用 camelCase
- **模板中**：使用 kebab-case
- **与 HTML attribute 保持一致**

---

## 易错点与边界情况

### 1. Prop 的大小写敏感

```vue
<!-- HTML 不区分大小写 -->
<div myProp="value"></div>
<!-- 会被解析为 -->
<div myprop="value"></div>

<!-- ✅ 在 Vue SFC 中正常工作 -->
<Child myProp="value" />

<!-- ✅ 使用 kebab-case 更安全 -->
<Child my-prop="value" />
```

### 2. 对象和数组的引用问题

```vue
<!-- 父组件 -->
<script setup>
const user = reactive({ name: 'Alice' })
</script>

<template>
  <!-- 传递的是引用 -->
  <Child :user="user" />
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps<{ user: User }>()

// ❌ 不要修改对象内部属性（虽然技术上可行）
function changeName() {
  props.user.name = 'Bob' // 会影响父组件
}

// ✅ 触发事件让父组件修改
const emit = defineEmits<{
  'update-user': [user: User]
}>()

function changeName() {
  emit('update-user', { ...props.user, name: 'Bob' })
}
</script>
```

### 3. Prop 验证时机

```typescript
// 验证在开发模式下执行，生产模式会被移除
const props = defineProps({
  count: {
    type: Number,
    validator(value) {
      console.log('验证:', value)
      return value >= 0
    }
  }
})

// 传递无效值时：
// 开发模式：控制台警告
// 生产模式：静默失败
```

### 4. Props 与 Attrs 的区别

```vue
<!-- 父组件 -->
<template>
  <Child
    title="标题"
    class="custom"
    @click="handleClick"
  />
</template>

<!-- 子组件 -->
<script setup>
// 只声明了 title
defineProps<{ title: string }>()

// class 和 @click 成为 $attrs
</script>

<template>
  <div>
    <!-- title 是 prop -->
    {{ title }}
    
    <!-- class 和 @click 会自动继承到根元素 -->
  </div>
</template>
```

---

## 前端工程实践

### 示例 1：表单组件

```vue
<!-- FormInput.vue -->
<script setup lang="ts">
interface Props {
  modelValue: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="form-input">
    <label>
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="handleInput"
    >
    
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<!-- 使用 -->
<script setup>
const email = ref('')
const emailError = ref('')
</script>

<template>
  <FormInput
    v-model="email"
    label="邮箱"
    type="email"
    placeholder="请输入邮箱"
    required
    :error="emailError"
  />
</template>
```

### 示例 2：配置驱动组件

```vue
<!-- DataTable.vue -->
<script setup lang="ts">
interface Column {
  key: string
  label: string
  width?: string
  sortable?: boolean
  formatter?: (value: any) => string
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  loading?: boolean
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: '暂无数据'
})

const emit = defineEmits<{
  'sort': [column: Column, order: 'asc' | 'desc']
  'row-click': [row: Record<string, any>]
}>()
</script>

<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width }"
            @click="col.sortable && emit('sort', col, 'asc')"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      
      <tbody v-if="!loading && data.length">
        <tr
          v-for="(row, index) in data"
          :key="index"
          @click="emit('row-click', row)"
        >
          <td v-for="col in columns" :key="col.key">
            {{
              col.formatter
                ? col.formatter(row[col.key])
                : row[col.key]
            }}
          </td>
        </tr>
      </tbody>
      
      <tbody v-else-if="loading">
        <tr>
          <td :colspan="columns.length">加载中...</td>
        </tr>
      </tbody>
      
      <tbody v-else>
        <tr>
          <td :colspan="columns.length">{{ emptyText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

### 示例 3：Props 校验工具

```typescript
// validators.ts
export function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validateUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function validateRange(min: number, max: number) {
  return (value: number): boolean => {
    return value >= min && value <= max
  }
}

// Component.vue
import { validateEmail, validateRange } from './validators'

const props = defineProps({
  email: {
    type: String,
    required: true,
    validator: validateEmail
  },
  
  age: {
    type: Number,
    validator: validateRange(0, 120)
  }
})
```

---

## 最佳实践

1. **优先使用 TypeScript 类型**：类型安全且支持 IDE 提示
2. **Props 应该是只读的**：不要修改 prop 值
3. **使用计算属性处理 Props**：需要转换时
4. **合理设置默认值**：提升组件易用性
5. **Props 命名语义化**：清晰表达用途
6. **避免过多 Props**：超过 5 个考虑重构
7. **使用对象传递复杂数据**：而非多个独立 prop
8. **添加验证器**：确保数据有效性

---

## 参考资料

- [Props](https://cn.vuejs.org/guide/components/props.html)
- [Props 验证](https://cn.vuejs.org/guide/components/props.html#prop-validation)
- [单向数据流](https://cn.vuejs.org/guide/components/props.html#one-way-data-flow)
