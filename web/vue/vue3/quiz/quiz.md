# Vue 3 面试题汇总

> 精选 50 道 Vue 3 面试题，覆盖核心概念到实战应用。

## 基础篇（1-15题）

### 1. Vue 3 相比 Vue 2 有哪些重要改进？

**答案要点**：
- 性能提升：重写虚拟 DOM、编译优化、Tree-shaking
- Composition API：更好的逻辑复用和代码组织
- TypeScript 支持：完全用 TS 重写
- 新特性：Teleport、Suspense、Fragments
- 更小的包体积：13.5KB vs 22.5KB
- 更好的响应式系统：基于 Proxy

### 2. ref 和 reactive 有什么区别？如何选择？

**答案要点**：
- `ref`：用于基本类型，通过 `.value` 访问，自动解包
- `reactive`：用于对象，直接访问属性，深层响应式
- 选择：基本类型用 `ref`，对象用 `reactive`
- `ref` 可以重新赋值，`reactive` 不能
- `ref` 在模板中自动解包

**代码示例**：
```typescript
// ref
const count = ref(0)
count.value++ // 需要 .value

// reactive
const state = reactive({ count: 0 })
state.count++ // 直接访问
```

### 3. computed 和 watch 的区别和使用场景？

**答案要点**：
- `computed`：计算属性，有缓存，依赖变化才重新计算
- `watch`：侦听器，执行副作用，无缓存
- 使用场景：
  - `computed`：基于响应式数据计算新值
  - `watch`：响应式数据变化时执行异步或开销大的操作

**代码示例**：
```typescript
// computed - 计算属性
const double = computed(() => count.value * 2)

// watch - 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`)
})
```

### 4. 什么是 Composition API？解决了什么问题？

**答案要点**：
- 一组基于函数的 API，用于组织组件逻辑
- 解决的问题：
  - Options API 逻辑分散
  - Mixins 命名冲突、来源不清
  - 更好的 TypeScript 支持
  - 更灵活的代码复用
- 核心 API：`ref`、`reactive`、`computed`、`watch`、生命周期钩子

### 5. script setup 有什么优势？

**答案要点**：
- 更少的样板代码
- 更好的运行时性能
- 更好的 TypeScript 推断
- 顶层绑定自动暴露给模板
- 自动注册导入的组件
- 支持顶层 await

### 6. Vue 3 的响应式原理是什么？

**答案要点**：
- 基于 ES6 Proxy 实现
- 拦截对象的读取、设置、删除等操作
- 依赖收集：getter 中收集依赖
- 触发更新：setter 中触发更新
- 优势：可以监听属性的添加和删除、数组索引和长度变化

### 7. 生命周期钩子在 Composition API 中如何使用？

**答案要点**：
- `setup` 相当于 `beforeCreate` 和 `created`
- 其他钩子需要导入：`onMounted`、`onUpdated` 等
- 命名规则：`on` + 钩子名（首字母大写）
- `beforeDestroy` → `onBeforeUnmount`
- `destroyed` → `onUnmounted`

**代码示例**：
```typescript
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  console.log('mounted')
})

onUnmounted(() => {
  console.log('unmounted')
})
```

### 8. 如何在 Vue 3 中定义和使用 Props？

**答案要点**：
- 运行时声明：使用对象语法
- 类型声明（推荐）：使用 TypeScript 接口
- `withDefaults` 设置默认值
- 单向数据流：不要直接修改 props
- 使用 `toRefs` 保持响应性

**代码示例**：
```typescript
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
```

### 9. defineEmits 如何使用？

**答案要点**：
- 定义组件可以触发的事件
- 类型安全的事件定义
- 支持事件验证
- 替代 `$emit`

**代码示例**：
```typescript
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [id: number]
}>()

emit('update:modelValue', 'new value')
emit('change', 123)
```

### 10. v-model 在 Vue 3 中有什么变化？

**答案要点**：
- 默认 prop 从 `value` 改为 `modelValue`
- 默认事件从 `input` 改为 `update:modelValue`
- 支持多个 `v-model`
- 支持自定义修饰符
- 组件上可以绑定任意 prop

**代码示例**：
```vue
<!-- 父组件 -->
<MyComponent 
  v-model="value"
  v-model:title="title"
/>

<!-- 子组件 -->
<script setup>
defineProps<{
  modelValue: string
  title: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:title': [value: string]
}>()
</script>
```

### 11. 什么是 Composables？如何设计？

**答案要点**：
- 封装可复用的状态逻辑的函数
- 命名规范：use 开头
- 返回响应式数据和方法
- 可以使用其他 composables
- 类似 React Hooks

**代码示例**：
```typescript
export function useCounter(initial = 0) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, double, increment }
}
```

### 12. Provide/Inject 的作用和使用场景？

**答案要点**：
- 跨层级组件通信
- 避免 prop 逐层传递
- 适合插件和组件库
- 使用 `InjectionKey` 提供类型安全
- 可以提供响应式数据

**代码示例**：
```typescript
// 提供
const count = ref(0)
provide('count', count)

// 注入
const count = inject('count', 0)
```

### 13. Teleport 组件的作用？

**答案要点**：
- 将组件渲染到 DOM 的其他位置
- 解决 CSS 层级问题
- 适用于 Modal、Toast、Dropdown
- 不影响组件的逻辑关系
- `to` 属性指定目标元素

**代码示例**：
```vue
<Teleport to="body">
  <div class="modal">Modal Content</div>
</Teleport>
```

### 14. 如何在 setup 中访问路由和状态管理？

**答案要点**：
- 路由：`useRoute()`、`useRouter()`
- Pinia：`useStore()`
- 不能使用 `this`
- 需要导入相应的 composable

**代码示例**：
```typescript
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
```

### 15. Vue 3 中如何进行性能优化？

**答案要点**：
- 组件懒加载：`defineAsyncComponent`
- v-once：只渲染一次
- v-memo：缓存子树
- KeepAlive：缓存组件
- 虚拟滚动：大列表优化
- 计算属性：避免重复计算
- shallowRef/shallowReactive：浅层响应式

---

## 组件篇（16-25题）

### 16. 插槽（Slots）的类型和使用场景？

**答案要点**：
- 默认插槽：基础内容分发
- 具名插槽：多个插槽位置
- 作用域插槽：向插槽传递数据
- 动态插槽名：`v-slot:[name]`
- 简写：`#default`、`#header`

### 17. 如何实现组件间通信？

**答案要点**：
- Props / Emits：父子通信
- Provide / Inject：跨层级通信
- Pinia：全局状态管理
- EventBus（第三方）：兄弟组件
- Ref：父组件访问子组件实例

### 18. 异步组件如何使用？

**答案要点**：
- `defineAsyncComponent`
- 配合 Suspense 使用
- 加载状态处理
- 错误处理
- 延迟和超时配置

**代码示例**：
```typescript
const AsyncComp = defineAsyncComponent({
  loader: () => import('./Component.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 19. 自定义指令的生命周期钩子？

**答案要点**：
- created：元素创建后
- beforeMount：挂载前
- mounted：挂载后
- beforeUpdate：更新前
- updated：更新后
- beforeUnmount：卸载前
- unmounted：卸载后

### 20. KeepAlive 的作用和配置？

**答案要点**：
- 缓存组件状态
- `include`/`exclude`：控制缓存
- `max`：最大缓存数
- `activated`/`deactivated` 生命周期
- 适用于标签页、路由切换

### 21. 动态组件如何使用？

**答案要点**：
- `<component :is="componentName">`
- 可以是组件名、组件对象、HTML 标签
- 配合 KeepAlive 缓存状态
- 适用于标签页、条件渲染

### 22. 如何实现递归组件？

**答案要点**：
- 组件引用自身
- 需要设置终止条件
- 适用于树形结构、菜单
- 注意性能问题

**代码示例**：
```vue
<template>
  <div>
    {{ node.name }}
    <TreeNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
    />
  </div>
</template>

<script setup>
defineProps<{ node: TreeNode }>()
</script>
```

### 23. Transition 组件的使用？

**答案要点**：
- 进入/离开过渡
- 6个过渡类名
- CSS 过渡和动画
- JavaScript 钩子
- 过渡模式：`out-in`、`in-out`

### 24. TransitionGroup 的特点？

**答案要点**：
- 列表过渡
- 必须提供 key
- 支持移动过渡
- `tag` 属性指定包裹元素
- 使用 v-move 类名

### 25. 如何优雅地处理组件错误？

**答案要点**：
- `onErrorCaptured` 生命周期
- ErrorBoundary 组件
- 全局错误处理：`app.config.errorHandler`
- try-catch 包裹异步操作
- 错误监控服务集成

---

## 进阶篇（26-40题）

### 26. Vue Router 4 的主要变化？

**答案要点**：
- 使用 `createRouter` 替代 `new VueRouter`
- `history` 选项：`createWebHistory`、`createWebHashHistory`
- 动态路由改进
- 导航守卫支持 Promise
- 移除 `*` 通配符，使用 `/:pathMatch(.*)*`

### 27. 路由懒加载如何实现？

**答案要点**：
- 使用动态导入：`() => import('./Component.vue')`
- Webpack 魔法注释命名 chunk
- 按需加载，减小首屏体积
- 配合 Suspense 显示加载状态

### 28. 导航守卫的执行顺序？

**答案要点**：
1. 组件内 beforeRouteLeave
2. 全局 beforeEach
3. 重用组件 beforeRouteUpdate
4. 路由配置 beforeEnter
5. 组件内 beforeRouteEnter
6. 全局 beforeResolve
7. 全局 afterEach

### 29. Pinia 相比 Vuex 的优势？

**答案要点**：
- 更简单的 API，无需 mutations
- 完整的 TypeScript 支持
- 模块化设计，自动代码分割
- 更轻量：~1KB
- 支持组合式 API 和选项式 API
- DevTools 支持

### 30. 如何设计一个 Store？

**答案要点**：
- State：定义状态
- Getters：计算属性
- Actions：异步操作和业务逻辑
- 组合式 API 风格（推荐）
- 模块化拆分
- TypeScript 类型定义

### 31. 如何实现 SSR？

**答案要点**：
- 使用 `@vue/server-renderer`
- 区分客户端和服务端入口
- 数据预取
- 状态同步
- Hydration
- 或使用 Nuxt 3

### 32. 什么时候使用 shallowRef/shallowReactive？

**答案要点**：
- 大型对象或数组
- 只需要顶层响应式
- 性能优化
- 外部库的对象
- 配合 triggerRef 手动触发更新

### 33. watchEffect 和 watch 的区别？

**答案要点**：
- `watchEffect`：自动追踪依赖，立即执行
- `watch`：显式指定依赖，惰性执行
- `watchEffect` 无法获取旧值
- `watch` 可以设置 deep、immediate

### 34. 如何处理大列表渲染？

**答案要点**：
- 虚拟滚动
- 分页加载
- 懒加载
- v-memo 缓存
- KeepAlive 缓存
- Object.freeze 冻结数据

### 35. 自定义 v-model 如何实现？

**答案要点**：
- 接收 `modelValue` prop
- 触发 `update:modelValue` 事件
- 支持多个 v-model
- 自定义修饰符

**代码示例**：
```vue
<script setup>
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function update(value: string) {
  emit('update:modelValue', value)
}
</script>
```

### 36. 如何实现全局状态持久化？

**答案要点**：
- Pinia 插件：pinia-plugin-persistedstate
- localStorage/sessionStorage
- IndexedDB
- 自定义插件
- 选择性持久化

### 37. 如何优化首屏加载速度？

**答案要点**：
- 路由懒加载
- 组件按需加载
- 图片懒加载
- 代码分割
- Tree Shaking
- Gzip 压缩
- CDN 加速
- SSR/SSG

### 38. Vite 相比 Webpack 的优势？

**答案要点**：
- 极速的服务器启动
- 快速的热更新（HMR）
- 按需编译
- 原生 ESM
- 开箱即用
- 更好的开发体验

### 39. 如何进行单元测试？

**答案要点**：
- 使用 Vitest
- `@vue/test-utils` 挂载组件
- 测试 props、emits、slots
- Mock 依赖
- 测试 composables
- 覆盖率报告

### 40. 如何实现权限控制？

**答案要点**：
- 路由守卫验证
- 动态路由加载
- 自定义指令控制按钮
- Store 管理权限
- 后端接口验证
- Token 机制

---

## 实战篇（41-50题）

### 41. 如何设计一个大型应用的目录结构？

**答案要点**：
- 按功能模块划分
- API 层、Store 层、View 层分离
- 公共组件和业务组件分离
- 工具函数统一管理
- 类型定义独立
- 路由模块化

### 42. 如何处理跨域问题？

**答案要点**：
- 开发环境：Vite/Webpack 代理
- 生产环境：CORS 配置
- Nginx 反向代理
- JSONP（不推荐）

### 43. 如何实现图片上传预览？

**答案要点**：
- FileReader API
- URL.createObjectURL
- 图片压缩
- 多图上传
- 拖拽上传
- 进度显示

### 44. 如何实现国际化（i18n）？

**答案要点**：
- 使用 vue-i18n
- 语言文件管理
- 动态切换语言
- 日期、数字格式化
- 复数规则
- 懒加载语言包

### 45. 如何处理移动端适配？

**答案要点**：
- rem/vw 单位
- viewport 设置
- 媒体查询
- flexible.js
- postcss-pxtorem
- 1px 问题解决

### 46. 如何实现主题切换？

**答案要点**：
- CSS 变量
- 动态类名
- 预处理器变量
- ElementPlus 主题定制
- 持久化主题设置
- 暗黑模式

### 47. 如何进行错误监控？

**答案要点**：
- Sentry 集成
- 全局错误处理
- Promise 错误捕获
- 资源加载错误
- 性能监控
- 用户行为追踪

### 48. 如何实现骨架屏？

**答案要点**：
- 占位组件
- 骨架屏生成工具
- Suspense 配合
- CSS 动画
- 按需显示
- 提升用户体验

### 49. 如何优化打包体积？

**答案要点**：
- Tree Shaking
- 按需导入
- 代码分割
- 压缩混淆
- 图片优化
- 移除 console.log
- 分析打包体积

### 50. Vue 3 项目如何从 0 到 1 搭建？

**答案要点**：
1. **技术选型**：Vite + Vue 3 + TypeScript + Pinia + Vue Router
2. **项目初始化**：`npm create vite@latest`
3. **目录结构设计**：模块化、分层架构
4. **配置工具链**：ESLint、Prettier、husky、lint-staged
5. **封装基础库**：axios、常用工具函数
6. **搭建布局**：Layout 组件、路由配置
7. **状态管理**：Pinia store 设计
8. **组件库选择**：Element Plus / Ant Design Vue
9. **权限系统**：路由守卫、动态路由
10. **持续集成**：CI/CD 配置

---

## 总结

这50道面试题覆盖了 Vue 3 的核心概念、组件开发、状态管理、路由、工程化和实战应用。建议：

1. **理解原理**：不仅知道怎么用，还要知道为什么
2. **动手实践**：每个知识点都写代码验证
3. **查看源码**：理解 Vue 3 的实现细节
4. **总结归纳**：整理成自己的知识体系
5. **持续学习**：关注 Vue 3 最新动态

**推荐学习路径**：
- 基础 → 组件 → 进阶 → 实战
- 官方文档 → 源码阅读 → 项目实践
- 理论学习 → 代码练习 → 面试准备

祝你面试顺利！🎉
