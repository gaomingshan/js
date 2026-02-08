# 第 15 节：Vue 生态

## 概述

Vue 拥有丰富的生态系统，包括路由、状态管理、构建工具、服务端渲染等。本节概览 Vue 生态中的核心工具和库。

## 一、Vue Router

### 1.1 基本用法

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: () => import('@/views/User.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

### 1.2 导航与路由信息

```vue
<template>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
  </nav>
  
  <RouterView />
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 编程式导航
router.push('/about')
router.push({ name: 'user', params: { id: 1 } })
router.replace('/home')
router.go(-1)

// 当前路由信息
console.log(route.path)
console.log(route.params)
console.log(route.query)
</script>
```

### 1.3 路由守卫

```javascript
// 全局守卫
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }
})

// 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      if (!isAdmin) return '/403'
    }
  }
]

// 组件内守卫
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges) {
    return confirm('确定离开？')
  }
})
```

## 二、Pinia 状态管理

### 2.1 定义 Store

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Vue'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    },
    async fetchData() {
      const data = await api.get('/data')
      this.name = data.name
    }
  }
})
```

### 2.2 Setup Store 写法

```javascript
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, doubleCount, increment }
})
```

### 2.3 使用 Store

```vue
<template>
  <p>{{ counter.count }}</p>
  <p>{{ counter.doubleCount }}</p>
  <button @click="counter.increment()">+1</button>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const counter = useCounterStore()

// 解构时保持响应式
const { count, doubleCount } = storeToRefs(counter)
const { increment } = counter
</script>
```

## 三、Vite 构建工具

### 3.1 创建项目

```bash
npm create vue@latest my-project
cd my-project
npm install
npm run dev
```

### 3.2 配置文件

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

## 四、服务端渲染 (SSR)

### 4.1 Nuxt 3

```bash
npx nuxi init my-nuxt-app
cd my-nuxt-app
npm install
npm run dev
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>{{ data.title }}</h1>
  </div>
</template>

<script setup>
// 服务端获取数据
const { data } = await useFetch('/api/data')
</script>
```

### 4.2 SSR 的优势

| 特性 | CSR | SSR |
|------|-----|-----|
| 首屏加载 | 慢 | 快 |
| SEO | 差 | 好 |
| 服务器压力 | 低 | 高 |
| 交互性 | 即时 | 需要 hydration |

## 五、测试

### 5.1 单元测试 (Vitest)

```javascript
// counter.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

describe('Counter', () => {
  it('increments count when button is clicked', async () => {
    const wrapper = mount(Counter)
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.text()).toContain('1')
  })
})
```

### 5.2 组件测试

```javascript
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

const wrapper = mount(MyComponent, {
  props: { msg: 'Hello' },
  global: {
    plugins: [router, pinia],
    stubs: ['RouterLink']
  }
})

// 断言
expect(wrapper.text()).toContain('Hello')
expect(wrapper.find('.title').exists()).toBe(true)

// 事件
await wrapper.find('button').trigger('click')
expect(wrapper.emitted('update')).toBeTruthy()
```

### 5.3 E2E 测试 (Cypress/Playwright)

```javascript
// e2e/home.spec.js
import { test, expect } from '@playwright/test'

test('home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Welcome')
  
  await page.click('button.login')
  await expect(page).toHaveURL('/login')
})
```

## 六、TypeScript 支持

### 6.1 组件类型

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
}

const props = defineProps<{
  title: string
  user?: User
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}>()

const count = ref<number>(0)
const users = ref<User[]>([])
</script>
```

### 6.2 带默认值的 Props

```vue
<script setup lang="ts">
interface Props {
  title?: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '默认标题',
  count: 0
})
</script>
```

## 七、开发工具

### 7.1 Vue DevTools

- Chrome/Firefox 扩展
- 组件树查看
- 状态检查
- 路由/Pinia 调试
- 性能分析

### 7.2 VS Code 扩展

| 扩展 | 用途 |
|------|------|
| Volar | Vue 3 官方扩展 |
| Vue VSCode Snippets | 代码片段 |
| ESLint | 代码检查 |
| Prettier | 代码格式化 |

## 八、UI 组件库

| 库 | 特点 |
|-----|------|
| Element Plus | 企业级、功能完整 |
| Ant Design Vue | Ant Design 风格 |
| Vuetify | Material Design |
| Naive UI | TypeScript、高性能 |
| Quasar | 跨平台 |
| PrimeVue | 丰富组件 |

## 九、生态总览

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue 生态系统                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   核心                                                       │
│   ├── Vue 3 (核心框架)                                      │
│   ├── Vue Router (路由)                                     │
│   └── Pinia (状态管理)                                      │
│                                                             │
│   构建                                                       │
│   ├── Vite (开发构建)                                       │
│   ├── Vue CLI (旧项目)                                      │
│   └── Nuxt (SSR/SSG)                                       │
│                                                             │
│   工具                                                       │
│   ├── Vue DevTools (调试)                                   │
│   ├── Volar (VS Code)                                      │
│   └── VueUse (组合式函数)                                   │
│                                                             │
│   测试                                                       │
│   ├── Vitest (单元测试)                                     │
│   ├── Vue Test Utils (组件测试)                             │
│   └── Cypress/Playwright (E2E)                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 参考资料

- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Nuxt](https://nuxt.com/)
- [VueUse](https://vueuse.org/)
- [Vitest](https://vitest.dev/)

---

**下一节** → [第 16 节：响应式概念](./16-reactivity-concept.md)
