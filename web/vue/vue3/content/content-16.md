# setup 函数与 script setup

> 深入理解 setup 的执行时机和 script setup 语法糖的优势，掌握组合式 API 的核心用法。

## 核心概念

`setup` 是 Vue 3 组合式 API 的入口点，`<script setup>` 是它的语法糖，提供更简洁的写法。

### setup 函数

```vue
<script>
import { ref, computed } from 'vue'

export default {
  props: {
    title: String
  },
  
  emits: ['update'],
  
  setup(props, context) {
    // props: 响应式的 props 对象
    console.log(props.title)
    
    // context: { attrs, slots, emit, expose }
    console.log(context.attrs)
    console.log(context.slots)
    context.emit('update', 123)
    
    // 响应式数据
    const count = ref(0)
    
    // 计算属性
    const double = computed(() => count.value * 2)
    
    // 方法
    function increment() {
      count.value++
    }
    
    // 返回暴露给模板的内容
    return {
      count,
      double,
      increment
    }
  }
}
</script>

<template>
  <div>
    <p>{{ count }} × 2 = {{ double }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

### script setup 语法糖

```vue
<script setup>
import { ref, computed } from 'vue'

// 自动接收 props
const props = defineProps<{
  title: string
}>()

// 自动定义 emits
const emit = defineEmits<{
  update: [value: number]
}>()

// 响应式数据
const count = ref(0)

// 计算属性
const double = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
  emit('update', count.value)
}

// 所有顶层绑定自动暴露给模板
</script>

<template>
  <div>
    <p>{{ count }} × 2 = {{ double }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

---

## setup 函数详解

### 执行时机

`setup` 在以下时机执行：
1. **在 `beforeCreate` 钩子之前**
2. **在组件实例创建之前**
3. **props 解析完成后**
4. **只执行一次**

```vue
<script>
export default {
  setup() {
    console.log('1. setup')
  },
  
  beforeCreate() {
    console.log('2. beforeCreate')
  },
  
  created() {
    console.log('3. created')
  },
  
  mounted() {
    console.log('4. mounted')
  }
}
</script>

<!-- 输出顺序：setup → beforeCreate → created → mounted -->
```

### setup 参数

#### props

第一个参数是响应式的 props 对象。

```vue
<script>
export default {
  props: {
    title: String,
    count: Number
  },
  
  setup(props) {
    // ✅ 响应式访问
    console.log(props.title)
    
    // ✅ 可以监听
    watch(() => props.count, (newVal) => {
      console.log('count changed:', newVal)
    })
    
    // ❌ 不要解构（会失去响应性）
    const { title } = props
    
    // ✅ 使用 toRefs 保持响应性
    const { title, count } = toRefs(props)
  }
}
</script>
```

#### context

第二个参数是上下文对象，包含：

```vue
<script>
export default {
  setup(props, context) {
    // attrs: 非 props 的 attributes
    console.log(context.attrs)
    
    // slots: 插槽对象
    console.log(context.slots)
    
    // emit: 触发事件的函数
    context.emit('custom-event', data)
    
    // expose: 暴露公共方法/属性
    context.expose({
      publicMethod() {
        console.log('Public method')
      }
    })
    
    // 可以解构（非响应式）
    const { attrs, slots, emit, expose } = context
  }
}
</script>
```

### setup 返回值

```vue
<script>
export default {
  setup() {
    const count = ref(0)
    
    function increment() {
      count.value++
    }
    
    // 返回对象：暴露给模板
    return {
      count,
      increment
    }
    
    // 返回渲染函数（高级用法）
    // return () => h('div', count.value)
  }
}
</script>
```

---

## script setup 详解

`<script setup>` 是在单文件组件中使用组合式 API 的编译时语法糖。

### 优势

1. **更少的样板代码**：无需 return
2. **更好的 TypeScript 推断**：类型推导更准确
3. **更好的运行时性能**：编译优化
4. **顶层 await 支持**：可以直接使用 await

```vue
<!-- 传统 setup -->
<script>
export default {
  setup() {
    const count = ref(0)
    function increment() {
      count.value++
    }
    return { count, increment }
  }
}
</script>

<!-- script setup -->
<script setup>
const count = ref(0)
function increment() {
  count.value++
}
// 自动返回
</script>
```

### 顶层绑定自动暴露

```vue
<script setup>
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

// 变量
const msg = 'Hello'

// 响应式数据
const count = ref(0)

// 函数
function greet() {
  console.log(msg)
}

// 类
class User {
  constructor(name) {
    this.name = name
  }
}

// 解构导入
import { foo } from './utils'

// 所有这些都自动暴露给模板
</script>

<template>
  <div>
    <p>{{ msg }}</p>
    <p>{{ count }}</p>
    <button @click="greet">打招呼</button>
    <MyComponent />
  </div>
</template>
```

---

## 编译器宏

`<script setup>` 中可以使用的编译器宏，无需导入。

### defineProps

```vue
<script setup lang="ts">
// 运行时声明
const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0
  }
})

// 类型声明（推荐）
const props = defineProps<{
  title: string
  count?: number
}>()

// 带默认值的类型声明
const props = withDefaults(
  defineProps<{
    title: string
    count?: number
  }>(),
  {
    count: 0
  }
)
</script>
```

### defineEmits

```vue
<script setup lang="ts">
// 运行时声明
const emit = defineEmits(['change', 'update'])

// 类型声明（推荐）
const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
}>()

// 使用
emit('change', 123)
emit('update', 'hello')
</script>
```

### defineExpose

默认情况下，`<script setup>` 的组件是封闭的，父组件无法访问其内部。

```vue
<!-- Child.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

// 暴露给父组件
defineExpose({
  count,
  increment
})
</script>

<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const childRef = ref()

function callChildMethod() {
  // 访问子组件暴露的内容
  console.log(childRef.value.count)
  childRef.value.increment()
}
</script>

<template>
  <Child ref="childRef" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>
```

### defineOptions

设置组件选项（Vue 3.3+）。

```vue
<script setup>
// 设置组件名称、inheritAttrs 等
defineOptions({
  name: 'CustomName',
  inheritAttrs: false,
  customOptions: {
    // 自定义选项
  }
})
</script>
```

### defineSlots

仅用于类型提示，不运行时功能（Vue 3.3+）。

```vue
<script setup lang="ts">
const slots = defineSlots<{
  default(props: { msg: string }): any
  header(props: { title: string }): any
}>()

// 使用
console.log(slots.default)
</script>
```

### defineModel

简化 v-model 实现（Vue 3.4+）。

```vue
<script setup>
// 自动生成 props 和 emit
const modelValue = defineModel()

// 等价于
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 具名 model
const title = defineModel('title')
const count = defineModel('count', { type: Number })
</script>

<template>
  <input v-model="modelValue">
</template>
```

---

## 顶层 await 支持

`<script setup>` 支持顶层 await，组件会自动变成异步组件。

```vue
<script setup>
// 顶层 await
const data = await fetchData()

// 等价于
const data = await fetch('/api/data').then(res => res.json())

// 可以与其他代码混用
const localData = ref([])

const remoteData = await fetchRemoteData()

function processData() {
  // 使用 await 获取的数据
  console.log(remoteData)
}
</script>

<template>
  <div>{{ data }}</div>
</template>

<!-- 父组件需要使用 Suspense -->
<template>
  <Suspense>
    <AsyncComponent />
  </Suspense>
</template>
```

---

## 与 Options API 结合使用

可以在 Options API 中使用 setup，但不建议混用。

```vue
<script>
import { ref } from 'vue'

export default {
  // Options API
  data() {
    return {
      optionsCount: 0
    }
  },
  
  methods: {
    optionsIncrement() {
      this.optionsCount++
    }
  },
  
  // Composition API
  setup() {
    const setupCount = ref(0)
    
    function setupIncrement() {
      setupCount.value++
    }
    
    return {
      setupCount,
      setupIncrement
    }
  }
}
</script>

<template>
  <div>
    <!-- 两者都可以访问 -->
    <p>Options: {{ optionsCount }}</p>
    <p>Setup: {{ setupCount }}</p>
    
    <button @click="optionsIncrement">Options +1</button>
    <button @click="setupIncrement">Setup +1</button>
  </div>
</template>
```

**注意**：
- setup 中无法访问 `this`
- Options API 可以访问 setup 返回的内容
- 不建议在同一组件中混用两种 API

---

## 易错点与边界情况

### 1. setup 中的 this

```vue
<script>
export default {
  setup() {
    // ❌ this 是 undefined
    console.log(this) // undefined
    
    // ✅ 使用 getCurrentInstance
    import { getCurrentInstance } from 'vue'
    const instance = getCurrentInstance()
    console.log(instance?.proxy)
  }
}
</script>
```

### 2. props 解构

```vue
<script setup>
const props = defineProps<{ count: number }>()

// ❌ 失去响应性
const { count } = props

watch(count, () => {
  // 不会触发
})

// ✅ 使用 toRefs
const { count } = toRefs(props)

watch(count, () => {
  // 正常触发
})

// ✅ 或使用 getter
watch(() => props.count, () => {
  // 正常触发
})
</script>
```

### 3. 顶层 await 的影响

```vue
<script setup>
// 使用顶层 await 后，组件变成异步组件
const data = await fetchData()

// 后续代码在 await 完成后才执行
console.log('数据加载完成')

// 生命周期钩子仍然正常工作
onMounted(() => {
  console.log('组件已挂载')
})
</script>

<!-- 父组件必须使用 Suspense -->
<template>
  <Suspense>
    <template #default>
      <AsyncChild />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

### 4. defineExpose 的必要性

```vue
<!-- 子组件 -->
<script setup>
const count = ref(0)

// ❌ 不暴露，父组件无法访问
</script>

<!-- 父组件 -->
<script setup>
const childRef = ref()

onMounted(() => {
  console.log(childRef.value) // {}（空对象）
  console.log(childRef.value.count) // undefined
})
</script>

<!-- 子组件（正确） -->
<script setup>
const count = ref(0)

// ✅ 显式暴露
defineExpose({ count })
</script>
```

---

## 前端工程实践

### 示例 1：通用 setup 模式

```vue
<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

// 1. Props 和 Emits
const props = defineProps<{
  id: number
}>()

const emit = defineEmits<{
  save: [data: Data]
  cancel: []
}>()

// 2. 响应式状态
const loading = ref(false)
const error = ref<Error | null>(null)
const data = reactive({
  name: '',
  email: ''
})

// 3. 计算属性
const isValid = computed(() => {
  return data.name && data.email
})

// 4. 方法
async function save() {
  if (!isValid.value) return
  
  loading.value = true
  try {
    await api.save(data)
    emit('save', data)
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

// 5. 监听器
watch(() => props.id, async (newId) => {
  await fetchData(newId)
})

// 6. 生命周期
onMounted(() => {
  fetchData(props.id)
})

// 7. 工具函数
async function fetchData(id: number) {
  // ...
}

// 8. 暴露（如果需要）
defineExpose({
  save,
  data
})
</script>
```

### 示例 2：组合多个 Composables

```vue
<script setup lang="ts">
import { useUser } from '@/composables/useUser'
import { usePermission } from '@/composables/usePermission'
import { useTheme } from '@/composables/useTheme'

// 组合多个 composables
const { user, login, logout } = useUser()
const { hasPermission } = usePermission()
const { theme, toggleTheme } = useTheme()

// 基于多个 composables 的逻辑
const canEdit = computed(() => {
  return user.value && hasPermission('edit')
})
</script>

<template>
  <div :class="`theme-${theme}`">
    <p v-if="user">欢迎，{{ user.name }}</p>
    <button v-if="canEdit" @click="handleEdit">编辑</button>
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>
```

### 示例 3：混合 script 和 script setup

```vue
<!-- 某些场景下需要同时使用 -->
<script lang="ts">
// 普通 script：定义组件选项
export default {
  name: 'CustomComponent',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
// script setup：组合式 API 逻辑
import { ref } from 'vue'

const count = ref(0)
</script>

<!-- Vue 3.3+ 推荐使用 defineOptions -->
<script setup lang="ts">
defineOptions({
  name: 'CustomComponent',
  inheritAttrs: false
})

const count = ref(0)
</script>
```

### 示例 4：条件渲染与异步加载

```vue
<script setup lang="ts">
const route = useRoute()

// 根据路由参数条件加载数据
const data = ref(null)

if (route.params.id) {
  // 顶层 await
  data.value = await fetchData(route.params.id)
}

// 条件性初始化
const editor = ref(null)

if (hasPermission('edit')) {
  onMounted(async () => {
    const EditorModule = await import('./Editor.vue')
    editor.value = EditorModule.default
  })
}
</script>

<template>
  <div>
    <div v-if="data">{{ data }}</div>
    <component :is="editor" v-if="editor" />
  </div>
</template>
```

### 示例 5：TypeScript 泛型组件

```vue
<script setup lang="ts" generic="T extends { id: number }">
// 泛型组件定义
interface Props {
  items: T[]
  modelValue?: T
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

function selectItem(item: T) {
  emit('update:modelValue', item)
}
</script>

<template>
  <div>
    <div
      v-for="item in items"
      :key="item.id"
      @click="selectItem(item)"
    >
      <slot :item="item"></slot>
    </div>
  </div>
</template>

<!-- 使用 -->
<script setup>
interface User {
  id: number
  name: string
}

const users: User[] = [...]
const selected = ref<User>()
</script>

<template>
  <GenericList
    v-model="selected"
    :items="users"
  >
    <template #default="{ item }">
      {{ item.name }}
    </template>
  </GenericList>
</template>
```

---

## setup vs script setup 对比

| 特性 | setup() | `<script setup>` |
|------|---------|-----------------|
| 样板代码 | 较多 | 更少 |
| return 语句 | 需要 | 不需要 |
| TypeScript 支持 | 好 | 更好 |
| 性能 | 好 | 更好（编译优化） |
| 顶层 await | ❌ | ✅ |
| 默认暴露 | 需要 return | 自动暴露 |
| 访问组件实例 | context | defineExpose |
| 学习曲线 | 较陡 | 更平缓 |

---

## 最佳实践

1. **优先使用 script setup**：更简洁、性能更好
2. **Props 使用 TypeScript**：类型安全
3. **合理使用 defineExpose**：只暴露必要的 API
4. **代码组织**：按逻辑功能分组，而非按类型
5. **避免混用 Options API**：保持一致性
6. **顶层 await 谨慎使用**：考虑对父组件的影响
7. **使用 Composables**：提取可复用逻辑
8. **TypeScript 泛型**：提升组件的类型灵活性

---

## 参考资料

- [setup 函数](https://cn.vuejs.org/api/composition-api-setup.html)
- [script setup](https://cn.vuejs.org/api/sfc-script-setup.html)
- [编译器宏](https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)
