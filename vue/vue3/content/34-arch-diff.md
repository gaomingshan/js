# 第 34 节：架构差异

## 概述

Vue 3 对 Vue 2 进行了全面重构，包括响应式系统、编译器、运行时等核心模块。本节对比两个版本的架构差异。

## 一、整体架构

### 1.1 Vue 2 架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue 2 架构                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   vue (单一包)                                              │
│   ├── compiler (编译器)                                     │
│   ├── core (核心)                                           │
│   │   ├── observer (响应式)                                 │
│   │   ├── vdom (虚拟 DOM)                                   │
│   │   └── instance (实例)                                   │
│   ├── platforms                                             │
│   │   ├── web                                               │
│   │   └── weex                                              │
│   └── shared (工具函数)                                     │
│                                                             │
│   特点：单仓库、耦合度高                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Vue 3 架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue 3 架构                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   @vue/reactivity (响应式，独立包)                          │
│        ↓                                                    │
│   @vue/runtime-core (运行时核心，平台无关)                  │
│        ↓                                                    │
│   @vue/runtime-dom (浏览器运行时)                           │
│                                                             │
│   @vue/compiler-core (编译器核心)                           │
│        ↓                                                    │
│   @vue/compiler-dom (浏览器编译器)                          │
│        ↓                                                    │
│   @vue/compiler-sfc (SFC 编译器)                            │
│                                                             │
│   vue (整合包)                                              │
│                                                             │
│   特点：Monorepo、模块化、可独立使用                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、响应式系统

### 2.1 实现方式

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 核心 API | Object.defineProperty | Proxy |
| 新增属性 | 需要 Vue.set | 自动响应 |
| 数组索引 | 不支持 | 支持 |
| Map/Set | 不支持 | 支持 |
| 性能 | 初始化遍历 | 惰性代理 |

### 2.2 代码对比

```javascript
// Vue 2
const state = Vue.observable({ count: 0 })
// 新增属性需要 Vue.set
Vue.set(state, 'newProp', 'value')

// Vue 3
const state = reactive({ count: 0 })
// 直接新增
state.newProp = 'value'
```

### 2.3 独立使用

```javascript
// Vue 3 的 @vue/reactivity 可独立使用
import { ref, reactive, computed, watch } from '@vue/reactivity'

// 不需要 Vue 框架也能使用响应式
const count = ref(0)
const double = computed(() => count.value * 2)
```

## 三、编译器

### 3.1 编译优化

| 优化 | Vue 2 | Vue 3 |
|------|-------|-------|
| 静态提升 | ❌ | ✅ |
| PatchFlags | ❌ | ✅ |
| Block Tree | ❌ | ✅ |
| 缓存事件 | ❌ | ✅ |

### 3.2 编译产物对比

```vue
<template>
  <div>
    <p>静态文本</p>
    <p>{{ dynamic }}</p>
  </div>
</template>
```

```javascript
// Vue 2 编译产物
function render() {
  return h('div', [
    h('p', '静态文本'),
    h('p', this.dynamic)
  ])
}

// Vue 3 编译产物
const _hoisted_1 = h('p', '静态文本')  // 静态提升

function render(_ctx) {
  return (openBlock(), createBlock('div', null, [
    _hoisted_1,  // 复用
    createVNode('p', null, _ctx.dynamic, 1 /* TEXT */)
  ]))
}
```

## 四、虚拟 DOM

### 4.1 Diff 算法

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 算法 | 双端 Diff | 快速 Diff |
| 优化 | 静态标记 | PatchFlags + LIS |
| 性能 | 良好 | 更好 |

### 4.2 VNode 结构

```javascript
// Vue 2 VNode
{
  tag: 'div',
  data: { attrs: {}, on: {} },
  children: [],
  text: undefined,
  elm: undefined,
  key: undefined
}

// Vue 3 VNode
{
  type: 'div',
  props: { onClick: fn },
  children: [],
  shapeFlag: 17,
  patchFlag: 1,
  dynamicChildren: [],
  el: null,
  key: null
}
```

## 五、组件系统

### 5.1 组件实例

```javascript
// Vue 2
{
  _uid: 1,
  _data: {},
  _props: {},
  $options: {},
  $parent: null,
  $root: null,
  $refs: {},
  $slots: {}
}

// Vue 3
{
  uid: 1,
  type: Component,
  props: {},
  setupState: {},
  ctx: {},
  proxy: Proxy,
  parent: null,
  provides: {}
}
```

### 5.2 生命周期

| Vue 2 | Vue 3 Options | Vue 3 Composition |
|-------|---------------|-------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | beforeUnmount | onBeforeUnmount |
| destroyed | unmounted | onUnmounted |

## 六、TypeScript 支持

### 6.1 Vue 2

```typescript
// Vue 2 需要 vue-class-component 或 vue-property-decorator
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop() readonly title!: string
  
  count = 0
  
  get double() {
    return this.count * 2
  }
}
```

### 6.2 Vue 3

```typescript
// Vue 3 原生支持 TypeScript
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  (e: 'update', value: number): void
}>()
</script>
```

## 七、Tree-shaking

### 7.1 Vue 2

```javascript
// Vue 2 全量导入
import Vue from 'vue'

// 所有功能都会打包，即使未使用
// 无法 tree-shake
```

### 7.2 Vue 3

```javascript
// Vue 3 按需导入
import { ref, computed, watch } from 'vue'

// 未使用的功能不会打包
// 如：Transition、Teleport、Suspense
// 只有使用时才会打包
```

### 7.3 体积对比

| 版本 | 全量 | 最小 |
|------|------|------|
| Vue 2.6 | ~23KB | ~23KB |
| Vue 3.x | ~22KB | ~10KB |

## 八、其他差异

### 8.1 全局 API

```javascript
// Vue 2
Vue.component('MyComp', {})
Vue.directive('focus', {})
Vue.mixin({})
Vue.use(plugin)
Vue.prototype.$http = axios

// Vue 3
const app = createApp(App)
app.component('MyComp', {})
app.directive('focus', {})
app.mixin({})
app.use(plugin)
app.config.globalProperties.$http = axios
```

### 8.2 v-model

```vue
<!-- Vue 2 -->
<input v-model="value">
<!-- 等价于 -->
<input :value="value" @input="value = $event.target.value">

<!-- Vue 3 -->
<input v-model="value">
<!-- 等价于 -->
<input :modelValue="value" @update:modelValue="value = $event">

<!-- Vue 3 支持多个 v-model -->
<UserForm v-model:firstName="first" v-model:lastName="last" />
```

### 8.3 渲染函数

```javascript
// Vue 2
render(h) {
  return h('div', { attrs: { id: 'app' }, on: { click: fn } }, children)
}

// Vue 3
import { h } from 'vue'
render() {
  return h('div', { id: 'app', onClick: fn }, children)
}
```

### 8.4 移除的功能

| 功能 | Vue 2 | Vue 3 |
|------|-------|-------|
| $on/$off/$once | ✅ | ❌ |
| 过滤器 | ✅ | ❌ |
| .sync 修饰符 | ✅ | ❌ (用 v-model) |
| $children | ✅ | ❌ |
| 函数式组件 functional | ✅ | 改为普通函数 |

## 九、总结

| 方面 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式 | defineProperty | Proxy |
| 架构 | 单包 | Monorepo |
| API 风格 | Options | Composition |
| TypeScript | 需要装饰器 | 原生支持 |
| 性能 | 良好 | 更好 |
| Tree-shaking | 不支持 | 支持 |
| 浏览器 | IE9+ | 不支持 IE |

## 参考资料

- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Vue 3 RFC](https://github.com/vuejs/rfcs)

---

**下一节** → [第 35 节：API 差异](./35-api-diff.md)
