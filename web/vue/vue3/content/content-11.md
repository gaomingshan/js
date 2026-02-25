# 组件 v-model 原理

> 深入理解组件 v-model 的工作机制，掌握自定义组件的双向绑定实现。

## 核心概念

组件上的 `v-model` 是一个语法糖，用于实现父子组件间的双向数据绑定。

### 基础原理

```vue
<!-- 父组件 -->
<script setup>
const searchText = ref('')
</script>

<template>
  <!-- v-model -->
  <CustomInput v-model="searchText" />
  
  <!-- 等价于 -->
  <CustomInput
    :modelValue="searchText"
    @update:modelValue="searchText = $event"
  />
</template>

<!-- CustomInput.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  >
</template>
```

**核心机制**：
1. 父组件通过 `:modelValue` 传递数据
2. 子组件通过 `@update:modelValue` 事件通知父组件更新
3. Vue 自动完成这两个步骤的绑定

---

## 多个 v-model 绑定

Vue 3 支持在一个组件上使用多个 v-model。

```vue
<!-- UserForm.vue -->
<script setup lang="ts">
const props = defineProps<{
  firstName: string
  lastName: string
  email: string
}>()

const emit = defineEmits<{
  'update:firstName': [value: string]
  'update:lastName': [value: string]
  'update:email': [value: string]
}>()
</script>

<template>
  <div class="user-form">
    <input
      :value="firstName"
      @input="emit('update:firstName', $event.target.value)"
      placeholder="First Name"
    >
    
    <input
      :value="lastName"
      @input="emit('update:lastName', $event.target.value)"
      placeholder="Last Name"
    >
    
    <input
      :value="email"
      @input="emit('update:email', $event.target.value)"
      placeholder="Email"
    >
  </div>
</template>

<!-- 使用 -->
<script setup>
const firstName = ref('John')
const lastName = ref('Doe')
const email = ref('john@example.com')
</script>

<template>
  <UserForm
    v-model:first-name="firstName"
    v-model:last-name="lastName"
    v-model:email="email"
  />
  
  <!-- 等价于 -->
  <UserForm
    :first-name="firstName"
    :last-name="lastName"
    :email="email"
    @update:first-name="firstName = $event"
    @update:last-name="lastName = $event"
    @update:email="email = $event"
  />
</template>
```

---

## 自定义 v-model 修饰符

### 内置修饰符回顾

```vue
<template>
  <!-- .lazy: change 事件时同步 -->
  <input v-model.lazy="text">
  
  <!-- .number: 转换为数字 -->
  <input v-model.number="age">
  
  <!-- .trim: 去除首尾空格 -->
  <input v-model.trim="message">
</template>
```

### 自定义修饰符实现

```vue
<!-- CustomInput.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  modelModifiers?: {
    capitalize?: boolean
    uppercase?: boolean
    lowercase?: boolean
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function emitValue(e: Event) {
  let value = (e.target as HTMLInputElement).value
  
  // 应用修饰符
  if (props.modelModifiers?.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  } else if (props.modelModifiers?.uppercase) {
    value = value.toUpperCase()
  } else if (props.modelModifiers?.lowercase) {
    value = value.toLowerCase()
  }
  
  emit('update:modelValue', value)
}
</script>

<template>
  <input
    :value="modelValue"
    @input="emitValue"
  >
</template>

<!-- 使用 -->
<template>
  <!-- 首字母大写 -->
  <CustomInput v-model.capitalize="name" />
  
  <!-- 全部大写 -->
  <CustomInput v-model.uppercase="code" />
  
  <!-- 全部小写 -->
  <CustomInput v-model.lowercase="email" />
  
  <!-- 组合使用（会按顺序应用） -->
  <CustomInput v-model.capitalize.trim="title" />
</template>
```

### 具名 v-model 的修饰符

```vue
<!-- RangeInput.vue -->
<script setup lang="ts">
const props = defineProps<{
  min: number
  max: number
  minModifiers?: { round?: boolean }
  maxModifiers?: { round?: boolean }
}>()

const emit = defineEmits<{
  'update:min': [value: number]
  'update:max': [value: number]
}>()

function updateMin(e: Event) {
  let value = Number((e.target as HTMLInputElement).value)
  
  if (props.minModifiers?.round) {
    value = Math.round(value)
  }
  
  emit('update:min', value)
}

function updateMax(e: Event) {
  let value = Number((e.target as HTMLInputElement).value)
  
  if (props.maxModifiers?.round) {
    value = Math.round(value)
  }
  
  emit('update:max', value)
}
</script>

<template>
  <div class="range-input">
    <input
      type="number"
      :value="min"
      @input="updateMin"
    >
    <span>-</span>
    <input
      type="number"
      :value="max"
      @input="updateMax"
    >
  </div>
</template>

<!-- 使用 -->
<template>
  <RangeInput
    v-model:min.round="minValue"
    v-model:max.round="maxValue"
  />
</template>
```

---

## v-model 与 computed

使用计算属性简化 v-model 实现。

```vue
<!-- Child.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 使用计算属性
const value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
</script>

<template>
  <!-- 可以直接绑定计算属性 -->
  <input v-model="value">
</template>
```

### 带转换的 v-model

```vue
<!-- NumberInput.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = computed({
  get() {
    // 显示时格式化
    return props.modelValue.toFixed(2)
  },
  set(val: string) {
    // 输入时解析
    const num = parseFloat(val)
    if (!isNaN(num)) {
      emit('update:modelValue', num)
    }
  }
})
</script>

<template>
  <input v-model="displayValue" type="number">
</template>
```

---

## v-model 的类型安全

### 类型定义

```typescript
// 定义 v-model 的类型
interface ModelValue {
  name: string
  age: number
}

const props = defineProps<{
  modelValue: ModelValue
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue]
}>()

// 使用
const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
```

### 泛型组件

```vue
<!-- GenericInput.vue -->
<script setup lang="ts" generic="T">
const props = defineProps<{
  modelValue: T
  parser?: (value: string) => T
  formatter?: (value: T) => string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const displayValue = computed({
  get() {
    return props.formatter
      ? props.formatter(props.modelValue)
      : String(props.modelValue)
  },
  set(val: string) {
    const parsed = props.parser
      ? props.parser(val)
      : val as T
    emit('update:modelValue', parsed)
  }
})
</script>

<template>
  <input v-model="displayValue">
</template>

<!-- 使用 -->
<script setup>
const count = ref(0)
const date = ref(new Date())
</script>

<template>
  <!-- 数字输入 -->
  <GenericInput
    v-model="count"
    :parser="(v) => parseInt(v)"
    :formatter="(v) => String(v)"
  />
  
  <!-- 日期输入 -->
  <GenericInput
    v-model="date"
    :parser="(v) => new Date(v)"
    :formatter="(v) => v.toISOString().split('T')[0]"
  />
</template>
```

---

## 易错点与边界情况

### 1. 命名约定

```vue
<!-- ❌ 错误：不遵循约定 -->
<script setup>
defineProps<{ value: string }>()
defineEmits<{ 'change': [value: string] }>()
</script>

<!-- ✅ 正确：遵循 v-model 约定 -->
<script setup>
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<!-- ✅ 或使用自定义名称 -->
<script setup>
defineProps<{ value: string }>()
defineEmits<{ 'update:value': [value: string] }>()
</script>

<!-- 父组件 -->
<template>
  <Child v-model:value="data" />
</template>
```

### 2. 修饰符的默认值

```vue
<script setup>
const props = defineProps<{
  modelValue: string
  modelModifiers?: Record<string, boolean>
}>()

// ⚠️ modelModifiers 可能是 undefined
if (props.modelModifiers?.capitalize) {
  // 安全访问
}

// ✅ 提供默认值
const props = withDefaults(
  defineProps<{
    modelValue: string
    modelModifiers?: Record<string, boolean>
  }>(),
  {
    modelModifiers: () => ({})
  }
)
</script>
```

### 3. 对象类型的 v-model

```vue
<!-- 子组件 -->
<script setup>
interface User {
  name: string
  age: number
}

const props = defineProps<{
  modelValue: User
}>()

const emit = defineEmits<{
  'update:modelValue': [value: User]
}>()

// ❌ 不要直接修改对象属性
function updateName(name: string) {
  props.modelValue.name = name // 违反单向数据流
}

// ✅ 发出新对象
function updateName(name: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    name
  })
}
</script>
```

### 4. v-model 与 watch

```vue
<script setup>
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ⚠️ 避免在 watch 中直接 emit
watch(() => props.modelValue, (newVal) => {
  // 这会导致无限循环
  emit('update:modelValue', newVal.toUpperCase())
})

// ✅ 使用本地状态
const localValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal.toUpperCase())
})
</script>
```

---

## 前端工程实践

### 示例 1：表单字段封装

```vue
<!-- FormField.vue -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: any
  type?: 'text' | 'number' | 'email' | 'password'
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rules?: Array<(value: any) => boolean | string>
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const error = ref('')

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    validateValue(val)
    emit('update:modelValue', val)
  }
})

function validateValue(val: any) {
  if (props.rules) {
    for (const rule of props.rules) {
      const result = rule(val)
      if (result !== true) {
        error.value = typeof result === 'string' ? result : '验证失败'
        return
      }
    }
  }
  error.value = ''
}
</script>

<template>
  <div class="form-field">
    <label v-if="label">
      {{ label }}
      <span v-if="required">*</span>
    </label>
    
    <input
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
    >
    
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<!-- 使用 -->
<script setup>
const email = ref('')

const emailRules = [
  (v: string) => !!v || '邮箱不能为空',
  (v: string) => /.+@.+\..+/.test(v) || '邮箱格式不正确'
]
</script>

<template>
  <FormField
    v-model="email"
    type="email"
    label="邮箱"
    required
    :rules="emailRules"
  />
</template>
```

### 示例 2：颜色选择器

```vue
<!-- ColorPicker.vue -->
<script setup lang="ts">
interface RGB {
  r: number
  g: number
  b: number
}

const props = defineProps<{
  modelValue: string // HEX color
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 将 HEX 转换为 RGB
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// 将 RGB 转换为 HEX
function rgbToHex(rgb: RGB): string {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
}

const rgb = computed({
  get: () => hexToRgb(props.modelValue),
  set: (val) => emit('update:modelValue', rgbToHex(val))
})

const r = computed({
  get: () => rgb.value.r,
  set: (val) => rgb.value = { ...rgb.value, r: val }
})

const g = computed({
  get: () => rgb.value.g,
  set: (val) => rgb.value = { ...rgb.value, g: val }
})

const b = computed({
  get: () => rgb.value.b,
  set: (val) => rgb.value = { ...rgb.value, b: val }
})
</script>

<template>
  <div class="color-picker">
    <div class="preview" :style="{ backgroundColor: modelValue }"></div>
    
    <div class="sliders">
      <label>
        R: <input v-model.number="r" type="range" min="0" max="255">
        {{ r }}
      </label>
      
      <label>
        G: <input v-model.number="g" type="range" min="0" max="255">
        {{ g }}
      </label>
      
      <label>
        B: <input v-model.number="b" type="range" min="0" max="255">
        {{ b }}
      </label>
    </div>
    
    <input v-model="modelValue" type="text" pattern="^#[0-9A-Fa-f]{6}$">
  </div>
</template>

<!-- 使用 -->
<script setup>
const color = ref('#ff0000')
</script>

<template>
  <ColorPicker v-model="color" />
  <p>选中的颜色：{{ color }}</p>
</template>
```

### 示例 3：复杂对象编辑器

```vue
<!-- AddressEditor.vue -->
<script setup lang="ts">
interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

const props = defineProps<{
  modelValue: Address
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Address]
}>()

// 为每个字段创建计算属性
function createFieldComputed<K extends keyof Address>(key: K) {
  return computed({
    get: () => props.modelValue[key],
    set: (val: Address[K]) => {
      emit('update:modelValue', {
        ...props.modelValue,
        [key]: val
      })
    }
  })
}

const street = createFieldComputed('street')
const city = createFieldComputed('city')
const state = createFieldComputed('state')
const zipCode = createFieldComputed('zipCode')
const country = createFieldComputed('country')
</script>

<template>
  <div class="address-editor">
    <input v-model="street" placeholder="街道地址">
    <input v-model="city" placeholder="城市">
    <input v-model="state" placeholder="省/州">
    <input v-model="zipCode" placeholder="邮编">
    <input v-model="country" placeholder="国家">
  </div>
</template>

<!-- 使用 -->
<script setup>
const address = ref<Address>({
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: ''
})
</script>

<template>
  <AddressEditor v-model="address" />
  <pre>{{ address }}</pre>
</template>
```

### 示例 4：搜索组件

```vue
<!-- SearchInput.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  suggestions?: string[]
  debounce?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const showSuggestions = ref(false)
let debounceTimer: number | null = null

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    
    // 防抖搜索
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    if (props.debounce) {
      debounceTimer = setTimeout(() => {
        emit('search', val)
      }, props.debounce) as unknown as number
    } else {
      emit('search', val)
    }
  }
})

function selectSuggestion(suggestion: string) {
  value.value = suggestion
  showSuggestions.value = false
}

function handleFocus() {
  showSuggestions.value = true
}

function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}
</script>

<template>
  <div class="search-input">
    <input
      v-model="value"
      @focus="handleFocus"
      @blur="handleBlur"
      placeholder="搜索..."
    >
    
    <ul v-if="showSuggestions && suggestions?.length" class="suggestions">
      <li
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>

<!-- 使用 -->
<script setup>
const searchQuery = ref('')
const suggestions = ref<string[]>([])

async function handleSearch(query: string) {
  if (!query) {
    suggestions.value = []
    return
  }
  
  // 模拟 API 调用
  suggestions.value = await fetchSuggestions(query)
}
</script>

<template>
  <SearchInput
    v-model="searchQuery"
    :suggestions="suggestions"
    :debounce="300"
    @search="handleSearch"
  />
</template>
```

---

## 最佳实践

1. **遵循命名约定**：`modelValue` 和 `update:modelValue`
2. **不要修改 props**：始终通过事件更新
3. **使用计算属性**：简化 v-model 实现
4. **提供类型定义**：TypeScript 类型安全
5. **合理使用修饰符**：提供便利的数据转换
6. **验证输入数据**：在 emit 前进行验证
7. **文档化 v-model**：说明绑定的数据类型和行为
8. **考虑性能**：大对象使用浅拷贝或 immutable

---

## 参考资料

- [组件 v-model](https://cn.vuejs.org/guide/components/v-model.html)
- [v-model 修饰符](https://cn.vuejs.org/guide/components/v-model.html#handling-v-model-modifiers)
- [表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)
