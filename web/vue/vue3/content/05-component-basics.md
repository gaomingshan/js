# 第 5 节：组件基础

## 概述

组件是 Vue 的核心概念，允许将 UI 拆分为独立、可复用的单元。每个组件封装了自己的模板、逻辑和样式，可以像 HTML 元素一样使用。

## 一、定义组件

### 1.1 单文件组件（SFC）

```vue
<!-- MyButton.vue -->
<template>
  <button class="my-button" @click="handleClick">
    <slot>默认文本</slot>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

function handleClick() {
  count.value++
  console.log('clicked', count.value)
}
</script>

<style scoped>
.my-button {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

### 1.2 组件结构

```
┌─────────────────────────────────────────────────────────────┐
│                   单文件组件 (.vue)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   <template>                                                │
│   └── HTML 模板，描述组件的结构                              │
│                                                             │
│   <script setup>                                            │
│   └── JavaScript 逻辑，组件的行为                            │
│                                                             │
│   <style scoped>                                            │
│   └── CSS 样式，组件的外观（scoped 限制作用域）              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 非 SFC 方式

```javascript
// 选项式 API
export default {
  data() {
    return { count: 0 }
  },
  template: `
    <button @click="count++">{{ count }}</button>
  `
}

// 组合式 API
import { ref, h } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return () => h('button', { onClick: () => count.value++ }, count.value)
  }
}
```

## 二、注册组件

### 2.1 全局注册

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import MyButton from './components/MyButton.vue'

const app = createApp(App)

// 全局注册
app.component('MyButton', MyButton)

app.mount('#app')
```

```vue
<!-- 任意组件中直接使用 -->
<template>
  <MyButton>点击我</MyButton>
</template>
```

### 2.2 局部注册（推荐）

```vue
<template>
  <MyButton>点击我</MyButton>
</template>

<script setup>
// 导入即注册（setup 语法糖）
import MyButton from './MyButton.vue'
</script>
```

```vue
<!-- 非 setup 语法 -->
<script>
import MyButton from './MyButton.vue'

export default {
  components: {
    MyButton
  }
}
</script>
```

### 2.3 全局 vs 局部

| 注册方式 | 优点 | 缺点 |
|----------|------|------|
| 全局注册 | 使用方便，无需导入 | 无法 Tree-shaking，打包体积大 |
| 局部注册 | 按需导入，体积小 | 每次使用都需导入 |

> **💡 建议**  
> 推荐使用局部注册，配合 `<script setup>` 非常简洁。

## 三、组件命名

### 3.1 命名约定

```vue
<!-- PascalCase（推荐） -->
<MyComponent />

<!-- kebab-case -->
<my-component></my-component>

<!-- 两种在模板中都有效，但推荐 PascalCase -->
<!-- 因为可以与原生 HTML 元素区分 -->
```

### 3.2 文件命名

```
components/
├── MyButton.vue       # PascalCase（推荐）
├── UserProfile.vue
└── base/
    ├── BaseButton.vue   # 基础组件加 Base 前缀
    └── BaseInput.vue
```

## 四、组件组织

### 4.1 目录结构

```
src/
├── components/           # 通用组件
│   ├── common/           # 基础组件
│   │   ├── Button.vue
│   │   └── Input.vue
│   └── business/         # 业务组件
│       └── UserCard.vue
├── views/                # 页面组件
│   ├── Home.vue
│   └── About.vue
└── layouts/              # 布局组件
    └── DefaultLayout.vue
```

### 4.2 组件拆分原则

```
何时拆分组件：
1. 可复用：多处使用的 UI 片段
2. 复杂度：逻辑复杂需要隔离
3. 关注点：独立的功能模块
4. 可维护：方便测试和修改
```

## 五、组件实例

### 5.1 访问组件实例

```vue
<template>
  <ChildComponent ref="childRef" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

onMounted(() => {
  // 访问子组件实例
  console.log(childRef.value)
})

function callChildMethod() {
  childRef.value.someMethod()
}
</script>
```

### 5.2 暴露组件方法

```vue
<!-- ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

function someMethod() {
  console.log('called from parent')
}

function increment() {
  count.value++
}

// 使用 defineExpose 暴露给父组件
defineExpose({
  someMethod,
  increment,
  count
})
</script>
```

## 六、动态组件

### 6.1 component :is

```vue
<template>
  <button @click="currentTab = 'Home'">Home</button>
  <button @click="currentTab = 'Posts'">Posts</button>
  <button @click="currentTab = 'Archive'">Archive</button>
  
  <!-- 动态切换组件 -->
  <component :is="tabs[currentTab]" />
</template>

<script setup>
import { ref } from 'vue'
import Home from './Home.vue'
import Posts from './Posts.vue'
import Archive from './Archive.vue'

const currentTab = ref('Home')

const tabs = {
  Home,
  Posts,
  Archive
}
</script>
```

### 6.2 保持组件状态

```vue
<template>
  <!-- 使用 KeepAlive 缓存组件状态 -->
  <KeepAlive>
    <component :is="tabs[currentTab]" />
  </KeepAlive>
</template>
```

## 七、异步组件

### 7.1 defineAsyncComponent

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 基本用法
const AsyncComp = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

// 带选项
const AsyncCompWithOptions = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,      // 显示 loading 前的延迟
  timeout: 3000    // 超时时间
})
</script>

<template>
  <AsyncComp />
</template>
```

### 7.2 配合 Suspense

```vue
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中显示 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

## 八、组件通信概览

```
┌─────────────────────────────────────────────────────────────┐
│                    组件通信方式                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   父 → 子：Props                                            │
│   子 → 父：Emits / 自定义事件                                │
│   双向：v-model                                             │
│   跨层级：Provide / Inject                                  │
│   任意组件：状态管理（Pinia）                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 九、总结

| 概念 | 说明 |
|------|------|
| SFC | 单文件组件，.vue 文件 |
| 全局注册 | `app.component()`，全局可用 |
| 局部注册 | 导入使用，按需加载 |
| 动态组件 | `<component :is>` |
| 异步组件 | `defineAsyncComponent()` |

## 参考资料

- [组件基础](https://vuejs.org/guide/essentials/component-basics.html)
- [组件注册](https://vuejs.org/guide/components/registration.html)
- [异步组件](https://vuejs.org/guide/components/async.html)

---

**下一节** → [第 6 节：Props 与 Emits](./06-props-emits.md)
