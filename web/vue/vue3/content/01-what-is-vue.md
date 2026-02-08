# 第 1 节：Vue 是什么

## 概述

Vue 是一个用于构建用户界面的**渐进式 JavaScript 框架**。"渐进式"意味着你可以根据需求逐步采用 Vue 的能力，从简单的页面增强到复杂的单页应用。

## 一、Vue 的定位

### 1.1 渐进式框架

```
┌─────────────────────────────────────────────────────────────┐
│                   Vue 渐进式采用                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Level 1: 声明式渲染                                        │
│   └── 在页面中引入 Vue，增强交互                             │
│                                                             │
│   Level 2: 组件系统                                          │
│   └── 将页面拆分为可复用组件                                 │
│                                                             │
│   Level 3: 客户端路由                                        │
│   └── 单页应用（Vue Router）                                │
│                                                             │
│   Level 4: 状态管理                                          │
│   └── 大型应用状态管理（Pinia）                             │
│                                                             │
│   Level 5: 构建工具                                          │
│   └── 工程化开发（Vite、单文件组件）                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **声明式渲染** | 用模板描述 UI，Vue 自动处理 DOM 更新 |
| **响应式** | 数据变化自动触发视图更新 |
| **组件化** | 将 UI 拆分为独立、可复用的组件 |
| **虚拟 DOM** | 高效的 DOM 更新策略 |

## 二、Vue 能做什么

### 2.1 适用场景

```javascript
// 1. 增强静态页面
// 在已有页面中添加交互
<script src="https://unpkg.com/vue@3"></script>
<div id="app">{{ message }}</div>

// 2. 单页应用（SPA）
// 完整的前端应用
Vue + Vue Router + Pinia

// 3. 服务端渲染（SSR）
// SEO 友好、首屏快
Nuxt.js

// 4. 静态站点生成（SSG）
// 博客、文档站
VitePress

// 5. 桌面/移动应用
// 跨平台开发
Electron + Vue / uni-app
```

### 2.2 最小示例

```html
<div id="app">
  <h1>{{ title }}</h1>
  <button @click="count++">点击次数: {{ count }}</button>
</div>

<script type="module">
import { createApp, ref } from 'vue'

createApp({
  setup() {
    const title = ref('Hello Vue!')
    const count = ref(0)
    return { title, count }
  }
}).mount('#app')
</script>
```

## 三、Vue 的设计理念

### 3.1 易学易用

```javascript
// 模板语法接近 HTML，学习成本低
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="handleClick">点击</button>
  </div>
</template>
```

### 3.2 灵活渐进

```javascript
// 可以只用响应式
import { ref, watchEffect } from 'vue'

const count = ref(0)
watchEffect(() => {
  console.log(count.value)  // 数据变化时自动执行
})

// 也可以构建完整应用
// Vue + Router + Pinia + TypeScript
```

### 3.3 高效性能

- **编译时优化**：模板编译时标记静态节点
- **响应式精准追踪**：只更新依赖的组件
- **虚拟 DOM**：最小化 DOM 操作

## 四、Vue 2 vs Vue 3

### 4.1 主要差异

| 方面 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式 | Object.defineProperty | Proxy |
| API 风格 | Options API | Composition API |
| 性能 | 较好 | 更好（体积更小、速度更快） |
| TypeScript | 支持有限 | 完整支持 |
| 组合逻辑 | Mixins | Composables |

### 4.2 推荐选择

```
新项目 → Vue 3（推荐）
维护老项目 → Vue 2（仍可用，但不再有新特性）
```

## 五、开发方式

### 5.1 CDN 引入（快速体验）

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```

### 5.2 构建工具（推荐）

```bash
# 使用 Vite 创建项目
npm create vue@latest

# 或使用 create-vue
npm init vue@latest my-project
```

### 5.3 单文件组件（SFC）

```vue
<!-- MyComponent.vue -->
<template>
  <div class="greeting">{{ message }}</div>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello!')
</script>

<style scoped>
.greeting { color: blue; }
</style>
```

## 六、与其他框架对比

| 框架 | 特点 | 适合场景 |
|------|------|----------|
| **Vue** | 渐进式、易学、灵活 | 中小型项目、快速开发 |
| **React** | 函数式、生态丰富 | 大型应用、复杂交互 |
| **Angular** | 全功能、强约束 | 企业级应用、大团队 |

> **💡 选择建议**  
> Vue 的学习曲线较平缓，适合快速上手和中小型项目。  
> 对于大型项目，Vue 3 的 Composition API 提供了足够的架构能力。

## 参考资料

- [Vue 官方文档](https://vuejs.org/)
- [Vue 设计理念](https://vuejs.org/guide/introduction.html)

---

**下一节** → [第 2 节：模板语法](./02-template-syntax.md)
