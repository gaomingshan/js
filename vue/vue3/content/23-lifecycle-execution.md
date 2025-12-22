# 第 23 节：生命周期执行

## 概述

Vue 组件的生命周期钩子在特定时机被调用。理解各钩子的执行时机和顺序，有助于在正确的位置执行正确的操作。

## 一、执行时机详解

### 1.1 创建阶段

```
┌─────────────────────────────────────────────────────────────┐
│                   创建阶段                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   组件实例创建                                               │
│        │                                                    │
│        ↓                                                    │
│   setup() 执行                                              │
│   • 初始化 props、emit                                      │
│   • 执行组合式 API                                          │
│   • 返回渲染上下文                                          │
│        │                                                    │
│        ↓                                                    │
│   beforeCreate（选项式 API）                                │
│   • 实例已创建                                              │
│   • data/computed 还未初始化                                │
│        │                                                    │
│        ↓                                                    │
│   created / 选项式数据初始化                                │
│   • data、computed、methods 已可用                          │
│   • DOM 还未创建                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 挂载阶段

```
┌─────────────────────────────────────────────────────────────┐
│                   挂载阶段                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   onBeforeMount / beforeMount                               │
│   • 渲染函数首次调用前                                      │
│   • DOM 还未创建                                            │
│        │                                                    │
│        ↓                                                    │
│   执行渲染函数                                               │
│   生成 VNode                                                │
│        │                                                    │
│        ↓                                                    │
│   创建真实 DOM                                              │
│        │                                                    │
│        ↓                                                    │
│   onMounted / mounted                                       │
│   • DOM 已创建并插入页面                                    │
│   • 可以访问 $el 和 ref                                     │
│   • 子组件也已挂载                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 更新阶段

```
┌─────────────────────────────────────────────────────────────┐
│                   更新阶段                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   响应式数据变化                                             │
│        │                                                    │
│        ↓                                                    │
│   onBeforeUpdate / beforeUpdate                             │
│   • 数据已更新                                              │
│   • DOM 还未更新                                            │
│   • 可以访问更新前的 DOM                                    │
│        │                                                    │
│        ↓                                                    │
│   重新执行渲染函数                                           │
│   Diff + Patch                                              │
│        │                                                    │
│        ↓                                                    │
│   onUpdated / updated                                       │
│   • DOM 已更新                                              │
│   • 避免在此修改数据（可能死循环）                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 卸载阶段

```
┌─────────────────────────────────────────────────────────────┐
│                   卸载阶段                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   组件即将卸载                                               │
│        │                                                    │
│        ↓                                                    │
│   onBeforeUnmount / beforeUnmount                           │
│   • 组件实例还完全可用                                      │
│   • 适合清理定时器、取消订阅                                │
│        │                                                    │
│        ↓                                                    │
│   子组件卸载                                                │
│        │                                                    │
│        ↓                                                    │
│   onUnmounted / unmounted                                   │
│   • 组件已从 DOM 移除                                       │
│   • 所有响应式 effect 已停止                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、父子组件执行顺序

### 2.1 挂载顺序

```
父 setup
父 onBeforeMount
│
├── 子 setup
├── 子 onBeforeMount
├── 子 onMounted          ← 子先完成
│
父 onMounted              ← 父后完成
```

```javascript
// 验证代码
// Parent.vue
<script setup>
import { onBeforeMount, onMounted } from 'vue'
import Child from './Child.vue'

console.log('Parent setup')
onBeforeMount(() => console.log('Parent beforeMount'))
onMounted(() => console.log('Parent mounted'))
</script>

// Child.vue
<script setup>
import { onBeforeMount, onMounted } from 'vue'

console.log('Child setup')
onBeforeMount(() => console.log('Child beforeMount'))
onMounted(() => console.log('Child mounted'))
</script>

// 输出顺序：
// Parent setup
// Parent beforeMount
// Child setup
// Child beforeMount
// Child mounted
// Parent mounted
```

### 2.2 更新顺序

```
父数据变化
父 onBeforeUpdate
│
├── 子 onBeforeUpdate（如果子组件也需要更新）
├── 子 onUpdated
│
父 onUpdated
```

### 2.3 卸载顺序

```
父 onBeforeUnmount
│
├── 子 onBeforeUnmount
├── 子 onUnmounted        ← 子先完成
│
父 onUnmounted            ← 父后完成
```

## 三、钩子执行原理

### 3.1 钩子注册

```javascript
// 组合式 API 钩子实现原理（简化）
let currentInstance = null

function setCurrentInstance(instance) {
  currentInstance = instance
}

function onMounted(fn) {
  if (currentInstance) {
    // 将钩子添加到实例的 mounted 数组
    currentInstance.mounted.push(fn)
  }
}

// setup 执行时
function setupComponent(instance) {
  setCurrentInstance(instance)
  
  // 执行 setup，此时 onMounted 等会注册到 instance
  const setupResult = instance.type.setup()
  
  setCurrentInstance(null)
  return setupResult
}
```

### 3.2 钩子调用

```javascript
// 挂载时调用 mounted 钩子
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  
  // setup
  setupComponent(instance)
  
  // 渲染
  const subTree = instance.render()
  patch(null, subTree, container)
  
  // 调用 mounted 钩子
  if (instance.mounted) {
    instance.mounted.forEach(fn => fn())
  }
}
```

## 四、异步组件的生命周期

### 4.1 Suspense 下的异步组件

```vue
<template>
  <Suspense>
    <AsyncComponent />
    <template #fallback>Loading...</template>
  </Suspense>
</template>

<!-- AsyncComponent.vue -->
<script setup>
import { onMounted } from 'vue'

// async setup
const data = await fetchData()

// 数据加载完成后才会挂载
onMounted(() => {
  console.log('组件已挂载，数据:', data)
})
</script>
```

### 4.2 异步组件加载时机

```
Suspense 显示 fallback
        │
        ↓
异步组件加载中
        │
        ↓
async setup 执行
        │
        ↓
await 完成
        │
        ↓
onMounted 调用
        │
        ↓
Suspense 切换到 default
```

## 五、KeepAlive 的生命周期

### 5.1 激活/停用钩子

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

// 组件被激活时（从缓存恢复）
onActivated(() => {
  console.log('组件被激活')
  // 重新获取数据
  fetchLatestData()
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('组件被缓存')
  // 暂停轮询等
  stopPolling()
})
</script>
```

### 5.2 KeepAlive 生命周期流程

```
首次挂载：
setup → onBeforeMount → onMounted → onActivated

离开（进入缓存）：
onDeactivated（不触发 unmount）

再次进入：
onActivated（不触发 mount）

真正卸载（被 KeepAlive 移除）：
onDeactivated → onBeforeUnmount → onUnmounted
```

## 六、错误处理钩子

### 6.1 onErrorCaptured

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('捕获错误:', err)
  console.log('错误组件:', instance)
  console.log('错误信息:', info)
  
  // 返回 false 阻止错误继续向上传播
  return false
})
</script>
```

### 6.2 错误传播

```
子组件抛出错误
        │
        ↓
子组件 onErrorCaptured（如果有）
        │
        │ 未阻止
        ↓
父组件 onErrorCaptured
        │
        │ 未阻止
        ↓
祖先组件 onErrorCaptured
        │
        │ 未阻止
        ↓
全局 app.config.errorHandler
```

## 七、调试钩子

### 7.1 renderTracked / renderTriggered

```vue
<script setup>
import { onRenderTracked, onRenderTriggered } from 'vue'

// 渲染函数追踪到依赖时
onRenderTracked((event) => {
  console.log('追踪依赖:', event)
  // { effect, target, type, key }
})

// 依赖变化触发重新渲染时
onRenderTriggered((event) => {
  console.log('触发更新:', event)
  // { effect, target, type, key, newValue, oldValue }
})
</script>
```

## 八、最佳实践

| 钩子 | 适合做什么 |
|------|------------|
| setup | 初始化响应式数据、注册侦听器 |
| onBeforeMount | 访问响应式数据、最后的数据准备 |
| onMounted | DOM 操作、第三方库初始化、数据请求 |
| onBeforeUpdate | 访问更新前的 DOM |
| onUpdated | 访问更新后的 DOM（避免修改数据） |
| onBeforeUnmount | 清理定时器、取消订阅、移除事件监听 |
| onUnmounted | 最终清理 |
| onActivated | KeepAlive 激活时刷新数据 |
| onDeactivated | KeepAlive 缓存时暂停操作 |

## 九、总结

| 阶段 | 钩子 | DOM 状态 |
|------|------|----------|
| 创建 | setup | 无 |
| 挂载前 | onBeforeMount | 无 |
| 挂载后 | onMounted | 已创建 |
| 更新前 | onBeforeUpdate | 旧 DOM |
| 更新后 | onUpdated | 新 DOM |
| 卸载前 | onBeforeUnmount | 存在 |
| 卸载后 | onUnmounted | 已移除 |

## 参考资料

- [生命周期钩子](https://vuejs.org/guide/essentials/lifecycle.html)
- [组合式 API 生命周期](https://vuejs.org/api/composition-api-lifecycle.html)

---

**下一节** → [第 24 节：组件挂载流程](./24-mount-process.md)
