# 第 35 节：API 差异

## 概述

Vue 3 引入了 Composition API，同时对 Options API 进行了调整，并新增了多个 API。本节详细对比 Vue 2 和 Vue 3 的 API 差异。

## 一、Options API vs Composition API

### 1.1 Options API（Vue 2/3）

```javascript
export default {
  data() {
    return {
      count: 0,
      name: 'Vue'
    }
  },
  
  computed: {
    double() {
      return this.count * 2
    }
  },
  
  watch: {
    count(newVal, oldVal) {
      console.log('count changed')
    }
  },
  
  methods: {
    increment() {
      this.count++
    }
  },
  
  mounted() {
    console.log('mounted')
  }
}
```

### 1.2 Composition API（Vue 3）

```javascript
import { ref, computed, watch, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const name = ref('Vue')
    
    const double = computed(() => count.value * 2)
    
    watch(count, (newVal, oldVal) => {
      console.log('count changed')
    })
    
    function increment() {
      count.value++
    }
    
    onMounted(() => {
      console.log('mounted')
    })
    
    return { count, name, double, increment }
  }
}
```

### 1.3 script setup（Vue 3.2+）

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const count = ref(0)
const name = ref('Vue')

const double = computed(() => count.value * 2)

watch(count, (newVal, oldVal) => {
  console.log('count changed')
})

function increment() {
  count.value++
}

onMounted(() => {
  console.log('mounted')
})
</script>
```

## 二、响应式 API

### 2.1 Vue 2

```javascript
// 创建响应式对象
Vue.observable({ count: 0 })

// 响应式方法
Vue.set(obj, 'key', value)
Vue.delete(obj, 'key')
this.$set(obj, 'key', value)
this.$delete(obj, 'key')
```

### 2.2 Vue 3

```javascript
import {
  ref,
  reactive,
  readonly,
  shallowRef,
  shallowReactive,
  shallowReadonly,
  toRef,
  toRefs,
  toRaw,
  markRaw,
  isRef,
  isReactive,
  isReadonly,
  isProxy
} from 'vue'

const count = ref(0)
const state = reactive({ count: 0 })
const readonlyState = readonly(state)
```

### 2.3 对比表

| 功能 | Vue 2 | Vue 3 |
|------|-------|-------|
| 基本类型响应式 | ❌ | ref() |
| 对象响应式 | Vue.observable | reactive() |
| 只读 | ❌ | readonly() |
| 浅响应式 | ❌ | shallowRef/shallowReactive |
| 解包 | ❌ | toRef/toRefs |
| 原始值 | ❌ | toRaw() |
| 跳过代理 | ❌ | markRaw() |

## 三、计算属性与侦听器

### 3.1 computed

```javascript
// Vue 2
computed: {
  double() {
    return this.count * 2
  },
  // getter/setter
  fullName: {
    get() { return this.first + this.last },
    set(val) { [this.first, this.last] = val.split(' ') }
  }
}

// Vue 3
import { computed } from 'vue'

const double = computed(() => count.value * 2)

const fullName = computed({
  get: () => first.value + last.value,
  set: (val) => { [first.value, last.value] = val.split(' ') }
})
```

### 3.2 watch

```javascript
// Vue 2
watch: {
  count(newVal, oldVal) { },
  'obj.deep.prop': { handler() {}, deep: true, immediate: true }
}
this.$watch('count', callback)

// Vue 3
import { watch, watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

// 监听单个
watch(count, (newVal, oldVal) => { })

// 监听多个
watch([a, b], ([newA, newB], [oldA, oldB]) => { })

// 监听 reactive 属性
watch(() => state.count, (newVal) => { })

// 立即执行
watch(count, callback, { immediate: true })

// 深度监听
watch(state, callback, { deep: true })

// watchEffect 自动追踪依赖
watchEffect(() => {
  console.log(count.value)
})
```

## 四、生命周期

### 4.1 对比表

| Vue 2 | Vue 3 Options | Vue 3 Composition |
|-------|---------------|-------------------|
| beforeCreate | beforeCreate | - (setup 本身) |
| created | created | - (setup 本身) |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | beforeUnmount | onBeforeUnmount |
| destroyed | unmounted | onUnmounted |
| activated | activated | onActivated |
| deactivated | deactivated | onDeactivated |
| errorCaptured | errorCaptured | onErrorCaptured |
| - | renderTracked | onRenderTracked |
| - | renderTriggered | onRenderTriggered |
| - | serverPrefetch | onServerPrefetch |

### 4.2 代码对比

```javascript
// Vue 2
export default {
  mounted() {
    console.log('mounted')
  },
  beforeDestroy() {
    console.log('beforeDestroy')
  }
}

// Vue 3
import { onMounted, onBeforeUnmount } from 'vue'

setup() {
  onMounted(() => {
    console.log('mounted')
  })
  onBeforeUnmount(() => {
    console.log('beforeUnmount')
  })
}
```

## 五、组件通信

### 5.1 Props

```javascript
// Vue 2
props: {
  title: {
    type: String,
    required: true
  }
}

// Vue 3 Options
props: {
  title: {
    type: String,
    required: true
  }
}

// Vue 3 Composition
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

// Vue 3 TypeScript
const props = defineProps<{
  title: string
  count?: number
}>()
```

### 5.2 Emit

```javascript
// Vue 2
this.$emit('update', value)

// Vue 3 Options
emits: ['update'],
methods: {
  handleClick() {
    this.$emit('update', value)
  }
}

// Vue 3 Composition
const emit = defineEmits(['update'])
emit('update', value)

// Vue 3 TypeScript
const emit = defineEmits<{
  (e: 'update', value: string): void
}>()
```

### 5.3 v-model

```vue
<!-- Vue 2 -->
<CustomInput v-model="value" />
<!-- 等价于 -->
<CustomInput :value="value" @input="value = $event" />

<!-- Vue 3 -->
<CustomInput v-model="value" />
<!-- 等价于 -->
<CustomInput :modelValue="value" @update:modelValue="value = $event" />

<!-- Vue 3 多个 v-model -->
<UserForm v-model:first="firstName" v-model:last="lastName" />

<!-- Vue 3 自定义修饰符 -->
<CustomInput v-model.capitalize="value" />
```

### 5.4 Provide/Inject

```javascript
// Vue 2
provide() {
  return { theme: this.theme }
},
inject: ['theme']

// Vue 3 Options
provide() {
  return { theme: this.theme }
},
inject: ['theme']

// Vue 3 Composition
import { provide, inject } from 'vue'

provide('theme', ref('dark'))
const theme = inject('theme')
```

## 六、模板语法

### 6.1 v-if 与 v-for

```vue
<!-- Vue 2: v-for 优先级高于 v-if -->
<li v-for="item in items" v-if="item.active">

<!-- Vue 3: v-if 优先级高于 v-for -->
<!-- 需要用 template 包裹 -->
<template v-for="item in items">
  <li v-if="item.active">
</template>
```

### 6.2 key

```vue
<!-- Vue 2: 需要 key 在 v-if 分支 -->
<div v-if="show" key="a">A</div>
<div v-else key="b">B</div>

<!-- Vue 3: 自动生成唯一 key -->
<div v-if="show">A</div>
<div v-else>B</div>
```

### 6.3 Fragments

```vue
<!-- Vue 2: 必须单根节点 -->
<template>
  <div>
    <header></header>
    <main></main>
  </div>
</template>

<!-- Vue 3: 支持多根节点 -->
<template>
  <header></header>
  <main></main>
</template>
```

## 七、新增 API

### 7.1 Teleport

```vue
<template>
  <Teleport to="body">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>
```

### 7.2 Suspense

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>
```

### 7.3 defineAsyncComponent

```javascript
// Vue 2
const AsyncComp = () => import('./Comp.vue')

// Vue 3
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => import('./Comp.vue'))

const AsyncCompWithOptions = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 200,
  timeout: 3000
})
```

### 7.4 其他新 API

```javascript
// getCurrentInstance
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()

// nextTick
import { nextTick } from 'vue'
await nextTick()

// defineExpose
defineExpose({ method })

// defineOptions (3.3+)
defineOptions({ name: 'MyComp' })

// defineSlots (3.3+)
const slots = defineSlots<{
  default(props: { item: string }): any
}>()

// defineModel (3.4+)
const modelValue = defineModel<string>()
```

## 八、移除的 API

| API | Vue 2 | Vue 3 替代方案 |
|-----|-------|---------------|
| $on/$off/$once | ✅ | mitt/tiny-emitter |
| $children | ✅ | $refs 或 provide/inject |
| $listeners | ✅ | $attrs |
| $scopedSlots | ✅ | $slots |
| filters | ✅ | computed 或方法 |
| .sync | ✅ | v-model:propName |
| 事件.native | ✅ | 在 emits 中声明 |

## 九、总结

| 类别 | 主要变化 |
|------|----------|
| 响应式 | ref/reactive 替代 Vue.observable |
| 生命周期 | beforeDestroy → beforeUnmount |
| v-model | value/input → modelValue/update:modelValue |
| 多根节点 | 支持 Fragments |
| 新组件 | Teleport、Suspense |
| 移除 | filters、$on/$off、.sync |

## 参考资料

- [Vue 3 迁移指南 - 破坏性变更](https://v3-migration.vuejs.org/breaking-changes/)
- [Vue 3 API 参考](https://vuejs.org/api/)

---

**下一节** → [第 36 节：迁移指南](./36-migration-guide.md)
