# 组件基础与注册

> 组件是 Vue 应用的基础构建块，理解组件的定义、注册和使用是组件化开发的第一步。

## 核心概念

组件允许我们将 UI 划分为独立、可复用的部分，每个组件都有自己的逻辑和样式。

### 定义组件

```vue
<!-- MyComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">
    Count: {{ count }}
  </button>
</template>

<style scoped>
button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
```

### 使用组件

```vue
<!-- App.vue -->
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <div>
    <h1>应用标题</h1>
    <MyComponent />
    <MyComponent />
  </template>
</template>
```

---

## 组件注册

### 全局注册

全局注册的组件可以在应用的任何地方使用。

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import MyComponent from './components/MyComponent.vue'

const app = createApp(App)

// 全局注册
app.component('MyComponent', MyComponent)

app.mount('#app')
```

```vue
<!-- 任何组件中都可以直接使用，无需 import -->
<template>
  <MyComponent />
</template>
```

**全局注册的缺点**：
1. 无法进行 Tree-shaking（未使用的组件也会被打包）
2. 依赖关系不明确
3. 可能导致命名冲突

### 局部注册

只在需要的组件中导入和使用，推荐方式。

```vue
<script setup>
import MyComponent from './MyComponent.vue'
import AnotherComponent from './AnotherComponent.vue'
</script>

<template>
  <MyComponent />
  <AnotherComponent />
</template>
```

**优点**：
1. 支持 Tree-shaking
2. 依赖关系清晰
3. 避免命名冲突

### 批量注册

```typescript
// components/index.ts
import Button from './Button.vue'
import Input from './Input.vue'
import Card from './Card.vue'

export const components = {
  Button,
  Input,
  Card
}

// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { components } from './components'

const app = createApp(App)

// 批量全局注册
Object.entries(components).forEach(([name, component]) => {
  app.component(name, component)
})

app.mount('#app')
```

### 自动注册（Vite + Unplugin）

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      // 自动导入 src/components 下的组件
      dirs: ['src/components'],
      // 自动导入第三方库组件
      resolvers: []
    })
  ]
})
```

---

## 组件命名规范

### PascalCase vs kebab-case

```vue
<script setup>
// 导入时使用 PascalCase
import MyComponent from './MyComponent.vue'
import UserProfile from './UserProfile.vue'
</script>

<template>
  <!-- 推荐：PascalCase（与 JSX 一致） -->
  <MyComponent />
  <UserProfile />
  
  <!-- 也支持：kebab-case -->
  <my-component />
  <user-profile />
</template>
```

**命名建议**：
- **文件名**：PascalCase（`MyComponent.vue`）
- **模板中**：PascalCase（`<MyComponent />`）
- **全局注册**：PascalCase（`app.component('MyComponent', ...)`）

### 组件名称约定

```typescript
// ✅ 好的命名
AppHeader.vue
UserProfile.vue
TodoList.vue
SearchInput.vue

// ❌ 不好的命名
Header.vue        // 太通用，容易冲突
profile.vue       // 不符合 PascalCase
Todo-List.vue     // 混合风格
searchinput.vue   // 难以阅读
```

### 基础组件前缀

```typescript
// 基础 UI 组件使用统一前缀
BaseButton.vue
BaseInput.vue
BaseCard.vue

// 或
AppButton.vue
AppInput.vue
AppCard.vue

// 或
VButton.vue
VInput.vue
VCard.vue
```

---

## 递归组件

组件可以在自己的模板中引用自己。

```vue
<!-- TreeNode.vue -->
<script setup lang="ts">
interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

defineProps<{
  node: TreeNode
}>()
</script>

<template>
  <li>
    {{ node.label }}
    <ul v-if="node.children">
      <!-- 递归调用自己 -->
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      />
    </ul>
  </li>
</template>
```

### script setup 中的递归

在 `<script setup>` 中，组件会自动以文件名作为引用名。

```vue
<!-- TreeNode.vue -->
<script setup>
// 自动可以使用 TreeNode 引用自己
defineProps<{ node: TreeNode }>()
</script>

<template>
  <div>
    {{ node.label }}
    <!-- 直接使用 TreeNode -->
    <TreeNode v-if="node.child" :node="node.child" />
  </div>
</template>
```

---

## 动态组件

使用 `<component :is>` 动态切换组件。

```vue
<script setup>
import { ref } from 'vue'
import Home from './Home.vue'
import About from './About.vue'
import Contact from './Contact.vue'

const tabs = {
  Home,
  About,
  Contact
}

const currentTab = ref('Home')
</script>

<template>
  <div>
    <button
      v-for="(_, tab) in tabs"
      :key="tab"
      @click="currentTab = tab"
    >
      {{ tab }}
    </button>
    
    <!-- 动态组件 -->
    <component :is="tabs[currentTab]" />
  </div>
</template>
```

### :is 的多种用法

```vue
<script setup>
import MyComponent from './MyComponent.vue'

const componentName = ref('MyComponent')
const componentInstance = ref(MyComponent)
</script>

<template>
  <!-- 1. 组件名字符串（全局注册的组件） -->
  <component :is="componentName" />
  
  <!-- 2. 组件对象 -->
  <component :is="componentInstance" />
  
  <!-- 3. 原生 HTML 元素 -->
  <component :is="'div'">内容</component>
</template>
```

---

## 循环引用问题

### 场景：两个组件互相引用

```vue
<!-- TreeFolder.vue -->
<script setup>
import TreeFile from './TreeFile.vue' // ⚠️ 循环引用
</script>

<template>
  <div>
    <TreeFile />
  </div>
</template>

<!-- TreeFile.vue -->
<script setup>
import TreeFolder from './TreeFolder.vue' // ⚠️ 循环引用
</script>

<template>
  <div>
    <TreeFolder />
  </div>
</template>
```

### 解决方案：异步导入

```vue
<!-- TreeFolder.vue -->
<script setup>
import { defineAsyncComponent } from 'vue'

// 异步导入打破循环
const TreeFile = defineAsyncComponent(() => import('./TreeFile.vue'))
</script>

<template>
  <div>
    <TreeFile />
  </div>
</template>
```

---

## 组件实例

### 访问组件实例

```vue
<script setup>
import { ref, onMounted } from 'vue'

const childRef = ref()

onMounted(() => {
  // 访问子组件实例
  console.log(childRef.value)
})
</script>

<template>
  <ChildComponent ref="childRef" />
</template>
```

### 暴露组件方法

```vue
<!-- Child.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

// 使用 defineExpose 暴露给父组件
defineExpose({
  count,
  increment
})
</script>

<template>
  <div>Count: {{ count }}</div>
</template>

<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const childRef = ref()

function handleClick() {
  // 调用子组件方法
  childRef.value.increment()
  console.log(childRef.value.count)
}
</script>

<template>
  <Child ref="childRef" />
  <button @click="handleClick">父组件调用</button>
</template>
```

---

## 易错点与边界情况

### 1. 组件名称大小写

```vue
<!-- ❌ 错误：HTML 不区分大小写 -->
<MyComponent />
<!-- 在 DOM 模板中会被解析为 <mycomponent /> -->

<!-- ✅ 在 SFC 中正常工作 -->
<MyComponent />

<!-- ✅ DOM 模板中使用 kebab-case -->
<my-component></my-component>
```

### 2. 自闭合标签

```vue
<!-- ✅ SFC 中可以使用自闭合 -->
<MyComponent />

<!-- ❌ DOM 模板中必须明确闭合 -->
<my-component></my-component>
```

### 3. 组件注册时机

```typescript
// ❌ 错误：在 mount 之后注册无效
app.mount('#app')
app.component('MyComponent', MyComponent)

// ✅ 正确：在 mount 之前注册
app.component('MyComponent', MyComponent)
app.mount('#app')
```

---

## 前端工程实践

### 示例 1：基础 UI 库

```typescript
// components/base/index.ts
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import BaseCard from './BaseCard.vue'
import BaseModal from './BaseModal.vue'

export const baseComponents = {
  BaseButton,
  BaseInput,
  BaseCard,
  BaseModal
}

// 提供安装方法
export default {
  install(app: App) {
    Object.entries(baseComponents).forEach(([name, component]) => {
      app.component(name, component)
    })
  }
}

// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import BaseComponents from './components/base'

const app = createApp(App)
app.use(BaseComponents)
app.mount('#app')
```

### 示例 2：条件渲染组件

```vue
<script setup lang="ts">
import { computed } from 'vue'
import AdminPanel from './AdminPanel.vue'
import UserPanel from './UserPanel.vue'
import GuestPanel from './GuestPanel.vue'

interface User {
  role: 'admin' | 'user' | 'guest'
}

const props = defineProps<{
  user: User
}>()

const componentMap = {
  admin: AdminPanel,
  user: UserPanel,
  guest: GuestPanel
}

const currentComponent = computed(() => {
  return componentMap[props.user.role]
})
</script>

<template>
  <component :is="currentComponent" />
</template>
```

### 示例 3：组件库封装

```typescript
// my-ui/index.ts
import type { App } from 'vue'
import Button from './Button.vue'
import Input from './Input.vue'
import * as components from './components'

// 支持按需导入
export { Button, Input }

// 支持完整导入
export default {
  install(app: App, options?: { prefix?: string }) {
    const prefix = options?.prefix || 'My'
    
    Object.entries(components).forEach(([name, component]) => {
      app.component(`${prefix}${name}`, component)
    })
  }
}

// 使用方式1：完整导入
import MyUI from 'my-ui'
app.use(MyUI, { prefix: 'V' })

// 使用方式2：按需导入
import { Button, Input } from 'my-ui'
```

### 示例 4：布局组件

```vue
<!-- Layout.vue -->
<script setup lang="ts">
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Footer from './Footer.vue'
</script>

<template>
  <div class="layout">
    <Header class="header" />
    
    <div class="main">
      <Sidebar class="sidebar" />
      <main class="content">
        <!-- 插槽用于放置页面内容 -->
        <slot />
      </main>
    </div>
    
    <Footer class="footer" />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 200px;
}

.content {
  flex: 1;
}
</style>

<!-- 使用 -->
<template>
  <Layout>
    <h1>页面内容</h1>
    <p>这里是具体页面</p>
  </Layout>
</template>
```

---

## 最佳实践

1. **优先局部注册**：更好的 Tree-shaking
2. **统一命名规范**：PascalCase，有意义的名称
3. **基础组件加前缀**：Base、App 或自定义前缀
4. **单一职责**：每个组件只负责一个功能
5. **合理划分粒度**：不要过度拆分或过度集中
6. **使用 TypeScript**：提供类型安全
7. **组件文档化**：添加注释说明 props 和用法

---

## 参考资料

- [组件基础](https://cn.vuejs.org/guide/essentials/component-basics.html)
- [组件注册](https://cn.vuejs.org/guide/components/registration.html)
- [风格指南](https://cn.vuejs.org/style-guide/)
