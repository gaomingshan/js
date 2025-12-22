# 第 36 节：迁移指南

## 概述

从 Vue 2 迁移到 Vue 3 需要关注破坏性变更、废弃 API 和新特性。本节提供完整的迁移策略和注意事项。

## 一、迁移策略

### 1.1 方案选择

```
┌─────────────────────────────────────────────────────────────┐
│                   迁移方案选择                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   小型项目（< 10 个组件）                                   │
│   └── 直接迁移，一次性完成                                  │
│                                                             │
│   中型项目（10-50 个组件）                                  │
│   └── 使用 @vue/compat 渐进迁移                            │
│                                                             │
│   大型项目（> 50 个组件）                                   │
│   └── 分阶段迁移，先升级到 Vue 2.7                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 迁移路径

```
Vue 2.6
   ↓
Vue 2.7（包含部分 Vue 3 特性）
   ↓
Vue 3 + @vue/compat（兼容模式）
   ↓
Vue 3（完整迁移）
```

## 二、使用 @vue/compat

### 2.1 安装配置

```bash
npm install vue@3
npm install @vue/compat
```

```javascript
// vue.config.js (Vue CLI)
module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat')
    
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2  // Vue 2 兼容模式
            }
          }
        }
      })
  }
}

// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2
          }
        }
      }
    })
  ],
  resolve: {
    alias: {
      vue: '@vue/compat'
    }
  }
})
```

### 2.2 逐步禁用兼容

```javascript
// main.js
import { configureCompat } from 'vue'

configureCompat({
  // 全局配置
  MODE: 2,
  
  // 逐步禁用特定兼容行为
  GLOBAL_MOUNT: false,
  INSTANCE_EVENT_EMITTER: false,
  // ...
})
```

### 2.3 组件级配置

```javascript
export default {
  compatConfig: {
    MODE: 3,  // 这个组件使用 Vue 3 行为
    INSTANCE_LISTENERS: false
  }
}
```

## 三、破坏性变更清单

### 3.1 全局 API

```javascript
// ❌ Vue 2
import Vue from 'vue'
Vue.component('MyComp', {})
Vue.directive('focus', {})
Vue.mixin({})
Vue.use(plugin)

// ✅ Vue 3
import { createApp } from 'vue'
const app = createApp(App)
app.component('MyComp', {})
app.directive('focus', {})
app.mixin({})
app.use(plugin)
```

### 3.2 全局原型

```javascript
// ❌ Vue 2
Vue.prototype.$http = axios

// ✅ Vue 3
const app = createApp(App)
app.config.globalProperties.$http = axios
```

### 3.3 v-model

```vue
<!-- ❌ Vue 2 -->
<CustomInput v-model="value" />
<!-- 子组件使用 value prop 和 input 事件 -->

<!-- ✅ Vue 3 -->
<CustomInput v-model="value" />
<!-- 子组件使用 modelValue prop 和 update:modelValue 事件 -->

<!-- Vue 3 子组件 -->
<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<template>
  <input 
    :value="modelValue" 
    @input="$emit('update:modelValue', $event.target.value)" 
  />
</template>
```

### 3.4 .sync 修饰符

```vue
<!-- ❌ Vue 2 -->
<MyComp :title.sync="title" />

<!-- ✅ Vue 3 -->
<MyComp v-model:title="title" />
```

### 3.5 v-if / v-for 优先级

```vue
<!-- ❌ Vue 2: v-for 优先级更高 -->
<li v-for="item in items" v-if="item.active">

<!-- ✅ Vue 3: v-if 优先级更高，需要调整 -->
<template v-for="item in items" :key="item.id">
  <li v-if="item.active">{{ item.name }}</li>
</template>
```

### 3.6 生命周期重命名

```javascript
// ❌ Vue 2
beforeDestroy() {}
destroyed() {}

// ✅ Vue 3
beforeUnmount() {}
unmounted() {}
```

### 3.7 $listeners 移除

```vue
<!-- ❌ Vue 2 -->
<template>
  <child v-on="$listeners" />
</template>

<!-- ✅ Vue 3: 合并到 $attrs -->
<template>
  <child v-bind="$attrs" />
</template>
```

### 3.8 $scopedSlots 移除

```javascript
// ❌ Vue 2
this.$scopedSlots.default({ item })

// ✅ Vue 3: 统一使用 $slots
this.$slots.default?.({ item })
```

## 四、移除的功能

### 4.1 过滤器

```vue
<!-- ❌ Vue 2 -->
<p>{{ price | currency }}</p>

<!-- ✅ Vue 3: 使用 computed 或方法 -->
<p>{{ formatCurrency(price) }}</p>

<script setup>
function formatCurrency(value) {
  return '$' + value.toFixed(2)
}
</script>
```

### 4.2 事件 API

```javascript
// ❌ Vue 2
this.$on('event', callback)
this.$off('event')
this.$once('event', callback)

// ✅ Vue 3: 使用外部库
import mitt from 'mitt'

const emitter = mitt()
emitter.on('event', callback)
emitter.off('event')
emitter.emit('event', data)
```

### 4.3 $children

```javascript
// ❌ Vue 2
this.$children[0].method()

// ✅ Vue 3: 使用 ref
<Child ref="childRef" />

const childRef = ref()
childRef.value.method()
```

### 4.4 .native 修饰符

```vue
<!-- ❌ Vue 2 -->
<MyButton @click.native="handleClick" />

<!-- ✅ Vue 3: 在子组件中声明 emits -->
<!-- 未声明的事件自动作为原生事件 -->
<MyButton @click="handleClick" />

<!-- 子组件 -->
<script setup>
// 不声明 click，它会作为原生事件传递
defineEmits(['custom-event'])
</script>
```

## 五、依赖库迁移

### 5.1 Vue Router

```javascript
// ❌ Vue Router 3 (for Vue 2)
import VueRouter from 'vue-router'
Vue.use(VueRouter)
const router = new VueRouter({ routes })

// ✅ Vue Router 4 (for Vue 3)
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(),
  routes
})
app.use(router)
```

### 5.2 Vuex → Pinia

```javascript
// ❌ Vuex 3 (for Vue 2)
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
  state: { count: 0 },
  mutations: { increment(state) { state.count++ } }
})

// ✅ Pinia (推荐)
import { createPinia, defineStore } from 'pinia'
const pinia = createPinia()
app.use(pinia)

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++ }
  }
})
```

### 5.3 UI 库

| Vue 2 | Vue 3 |
|-------|-------|
| Element UI | Element Plus |
| Vuetify 2 | Vuetify 3 |
| Ant Design Vue 1.x | Ant Design Vue 3.x |
| Vant 2 | Vant 4 |

## 六、构建工具迁移

### 6.1 Vue CLI → Vite

```bash
# 新建 Vite 项目
npm create vite@latest my-app -- --template vue

# 迁移步骤：
# 1. 复制 src 目录
# 2. 更新 package.json 依赖
# 3. 将 vue.config.js 转换为 vite.config.js
# 4. 更新环境变量前缀 VUE_APP_ → VITE_
```

### 6.2 配置转换

```javascript
// vue.config.js (Vue CLI)
module.exports = {
  publicPath: '/app/',
  devServer: {
    proxy: { '/api': 'http://localhost:3000' }
  }
}

// vite.config.js
export default {
  base: '/app/',
  server: {
    proxy: { '/api': 'http://localhost:3000' }
  }
}
```

## 七、TypeScript 迁移

### 7.1 Vue 2 (Class 风格)

```typescript
// ❌ Vue 2 with vue-class-component
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop() readonly title!: string
  
  count = 0
  
  get double() {
    return this.count * 2
  }
  
  increment() {
    this.count++
  }
}
```

### 7.2 Vue 3 (Composition API)

```vue
<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()

const count = ref(0)

const double = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>
```

## 八、迁移检查清单

```markdown
# Vue 3 迁移检查清单

## 准备工作
- [ ] 阅读官方迁移指南
- [ ] 评估项目规模，选择迁移策略
- [ ] 备份代码，创建迁移分支

## 依赖更新
- [ ] vue 2.x → 3.x
- [ ] vue-router 3.x → 4.x
- [ ] vuex → pinia（或 vuex 4.x）
- [ ] 更新 UI 库版本
- [ ] 更新其他 Vue 生态库

## 代码修改
- [ ] 全局 API 调用改为应用实例
- [ ] 生命周期钩子重命名
- [ ] v-model 语法更新
- [ ] 移除 .sync 修饰符
- [ ] 移除过滤器
- [ ] 移除 $on/$off/$once
- [ ] v-if/v-for 优先级问题
- [ ] $listeners 合并到 $attrs
- [ ] $scopedSlots 改为 $slots

## 测试验证
- [ ] 单元测试通过
- [ ] E2E 测试通过
- [ ] 手动功能测试
- [ ] 性能测试

## 完成
- [ ] 移除 @vue/compat
- [ ] 代码审查
- [ ] 更新文档
```

## 九、常见问题

### 9.1 组件未更新

```javascript
// 问题：reactive 对象被替换后不更新
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // ❌ 丢失响应式

// 解决：使用 ref 或修改属性
const state = ref({ count: 0 })
state.value = { count: 1 }  // ✅
```

### 9.2 this 无法访问

```javascript
// 问题：setup 中没有 this
setup() {
  console.log(this.title)  // ❌ undefined
}

// 解决：使用 props 参数
setup(props) {
  console.log(props.title)  // ✅
}
```

### 9.3 ref 解构丢失响应式

```javascript
// 问题：解构 reactive 丢失响应式
const state = reactive({ count: 0 })
const { count } = state  // ❌ count 不是响应式

// 解决：使用 toRefs
const { count } = toRefs(state)  // ✅
```

## 十、总结

| 阶段 | 关键任务 |
|------|----------|
| 准备 | 阅读指南、评估规模、选择策略 |
| 依赖 | 更新 Vue 及生态库版本 |
| 代码 | 处理破坏性变更、移除废弃 API |
| 测试 | 全面测试验证 |
| 完成 | 移除兼容层、更新文档 |

## 参考资料

- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [@vue/compat 文档](https://v3-migration.vuejs.org/migration-build.html)
- [Vue 2.7 发布说明](https://blog.vuejs.org/posts/vue-2-7-naruto.html)

---

**恭喜完成 Vue.js 完整学习指南！**

返回 → [目录](../README.md)
