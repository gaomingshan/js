# Vue 2 迁移指南

> 从 Vue 2 平滑迁移到 Vue 3。

## 主要变化

### 破坏性变更

1. **全局 API**：从 `Vue` 改为 `createApp`
2. **v-model**：语法变化
3. **插槽**：`$scopedSlots` 移除
4. **过滤器**：移除
5. **事件 API**：`$on`、`$off`、`$once` 移除
6. **内联模板**：移除
7. **key**：在 `<template>` 上使用
8. **VNode 生命周期**：重命名

---

## 应用实例

### Vue 2

```javascript
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
```

### Vue 3

```typescript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

---

## 组件定义

### Vue 2

```javascript
export default {
  name: 'MyComponent',
  props: {
    title: String
  },
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
```

### Vue 3

```vue
<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()
const count = ref(0)

function increment() {
  count.value++
}
</script>
```

---

## v-model

### Vue 2

```vue
<!-- 父组件 -->
<MyComponent v-model="value" />

<!-- 子组件 -->
<script>
export default {
  props: ['value'],
  methods: {
    handleChange(val) {
      this.$emit('input', val)
    }
  }
}
</script>
```

### Vue 3

```vue
<!-- 父组件 -->
<MyComponent v-model="value" />

<!-- 子组件 -->
<script setup>
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleChange(val: string) {
  emit('update:modelValue', val)
}
</script>
```

---

## 生命周期

### Vue 2

```javascript
export default {
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {}
}
```

### Vue 3

```typescript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

// setup 执行时相当于 beforeCreate 和 created

onBeforeMount(() => {})
onMounted(() => {})
onBeforeUpdate(() => {})
onUpdated(() => {})
onBeforeUnmount(() => {})
onUnmounted(() => {})
```

---

## 响应式

### Vue 2

```javascript
export default {
  data() {
    return {
      user: {
        name: 'Alice',
        age: 25
      }
    }
  },
  methods: {
    updateUser() {
      // 需要使用 $set
      this.$set(this.user, 'email', 'alice@example.com')
    }
  }
}
```

### Vue 3

```typescript
const user = reactive({
  name: 'Alice',
  age: 25
})

function updateUser() {
  // 直接赋值即可
  user.email = 'alice@example.com'
}
```

---

## 过滤器

### Vue 2

```vue
<template>
  <div>{{ price | formatMoney }}</div>
</template>

<script>
export default {
  filters: {
    formatMoney(value) {
      return `¥${value.toFixed(2)}`
    }
  }
}
</script>
```

### Vue 3

```vue
<template>
  <div>{{ formatMoney(price) }}</div>
</template>

<script setup>
function formatMoney(value: number) {
  return `¥${value.toFixed(2)}`
}
</script>
```

---

## 事件总线

### Vue 2

```javascript
// event-bus.js
export const EventBus = new Vue()

// 发送事件
EventBus.$emit('event-name', data)

// 监听事件
EventBus.$on('event-name', handler)

// 移除监听
EventBus.$off('event-name', handler)
```

### Vue 3

```typescript
// 使用第三方库
import mitt from 'mitt'

export const emitter = mitt()

// 发送事件
emitter.emit('event-name', data)

// 监听事件
emitter.on('event-name', handler)

// 移除监听
emitter.off('event-name', handler)

// 或使用 Provide/Inject
```

---

## 插槽

### Vue 2

```vue
<!-- 子组件 -->
<template>
  <div>
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</template>

<!-- 父组件 -->
<template>
  <MyComponent>
    <template v-slot:header>Header</template>
    <template v-slot:default>Content</template>
    <template v-slot:footer>Footer</template>
  </MyComponent>
</template>
```

### Vue 3

```vue
<!-- 语法相同，但 $scopedSlots 已移除 -->
<!-- 统一使用 $slots -->
```

---

## Vuex 迁移到 Pinia

### Vuex

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    }
  },
  getters: {
    double: state => state.count * 2
  }
})
```

### Pinia

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  async function incrementAsync() {
    await new Promise(resolve => setTimeout(resolve, 1000))
    increment()
  }
  
  return { count, double, increment, incrementAsync }
})
```

---

## Vue Router 迁移

### Vue Router 3

```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Home
    }
  ]
})
```

### Vue Router 4

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    }
  ]
})
```

---

## 渲染函数

### Vue 2

```javascript
export default {
  render(h) {
    return h('div', {
      class: 'container',
      on: {
        click: this.handleClick
      }
    }, [
      h('h1', 'Title'),
      h('p', 'Content')
    ])
  }
}
```

### Vue 3

```typescript
import { h } from 'vue'

export default {
  setup() {
    function handleClick() {
      console.log('clicked')
    }
    
    return () => h('div', {
      class: 'container',
      onClick: handleClick
    }, [
      h('h1', 'Title'),
      h('p', 'Content')
    ])
  }
}
```

---

## 自定义指令

### Vue 2

```javascript
Vue.directive('focus', {
  inserted(el) {
    el.focus()
  }
})
```

### Vue 3

```typescript
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})
```

---

## 迁移策略

### 1. 评估项目

- 项目规模
- 依赖的库是否支持 Vue 3
- 团队技术储备
- 迁移收益

### 2. 准备工作

```bash
# 安装迁移构建版本
npm install vue@^3.1.0
```

```javascript
// main.js
import { createApp } from 'vue'
import { configureCompat } from '@vue/compat'
import App from './App.vue'

const app = createApp(App)

// 配置兼容性
configureCompat({
  GLOBAL_MOUNT: false,
  GLOBAL_EXTEND: false,
  GLOBAL_PROTOTYPE: false
})

app.mount('#app')
```

### 3. 渐进式迁移

1. **第一步**：升级到 Vue 2.7（过渡版本）
2. **第二步**：使用 `@vue/compat` 兼容构建
3. **第三步**：逐步修复警告
4. **第四步**：移除兼容构建
5. **第五步**：优化代码使用 Vue 3 特性

### 4. 使用迁移工具

```bash
# ESLint 插件
npm install -D eslint-plugin-vue@latest

# TypeScript 支持
npm install -D @vue/tsconfig
```

---

## 常见问题

### 1. 全局属性

```javascript
// Vue 2
Vue.prototype.$http = axios

// Vue 3
app.config.globalProperties.$http = axios
```

### 2. 异步组件

```javascript
// Vue 2
const AsyncComponent = () => import('./Component.vue')

// Vue 3
import { defineAsyncComponent } from 'vue'
const AsyncComponent = defineAsyncComponent(() => 
  import('./Component.vue')
)
```

### 3. 函数式组件

```javascript
// Vue 2
export default {
  functional: true,
  render(h, context) {
    return h('div', context.props.msg)
  }
}

// Vue 3
export default (props) => {
  return h('div', props.msg)
}
```

---

## 性能对比

| 指标 | Vue 2 | Vue 3 | 提升 |
|------|-------|-------|------|
| 打包大小 | 22.5 KB | 13.5 KB | 40% |
| 初始渲染 | 基准 | 1.3-2x | 30-100% |
| 更新渲染 | 基准 | 1.3-2x | 30-100% |
| 内存使用 | 基准 | 0.5x | 50% |

---

## 迁移检查清单

- [ ] 升级 Vue 到 3.x
- [ ] 升级 Vue Router 到 4.x
- [ ] 升级状态管理到 Pinia
- [ ] 移除 `Vue.use()`
- [ ] 修改 `new Vue()` 为 `createApp()`
- [ ] 更新全局 API
- [ ] 移除过滤器
- [ ] 更新 v-model 语法
- [ ] 更新生命周期钩子
- [ ] 移除 `$on`、`$off`、`$once`
- [ ] 更新自定义指令钩子
- [ ] 更新渲染函数语法
- [ ] 更新 TypeScript 类型
- [ ] 测试所有功能
- [ ] 性能测试

---

## 参考资料

- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [@vue/compat](https://v3-migration.vuejs.org/migration-build.html)
- [Vue 2.7 发布说明](https://blog.vuejs.org/posts/vue-2-7-naruto.html)
- [Breaking Changes](https://v3-migration.vuejs.org/breaking-changes/)
