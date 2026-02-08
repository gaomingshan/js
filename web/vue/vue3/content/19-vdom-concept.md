# 第 19 节：虚拟 DOM 概念

## 概述

虚拟 DOM（Virtual DOM）是一种用 JavaScript 对象描述真实 DOM 的技术。Vue 通过比较新旧虚拟 DOM 的差异，最小化真实 DOM 操作，提升性能。

## 一、为什么需要虚拟 DOM

### 1.1 直接操作 DOM 的问题

```javascript
// 直接操作 DOM 的问题
// 1. 性能开销大：DOM 操作是浏览器中最昂贵的操作之一
// 2. 频繁重排重绘：多次操作会触发多次布局计算
// 3. 难以优化：难以追踪哪些部分真正需要更新

// 例：更新列表
function updateList(items) {
  const ul = document.getElementById('list')
  ul.innerHTML = ''  // 清空
  items.forEach(item => {
    const li = document.createElement('li')
    li.textContent = item
    ul.appendChild(li)  // 每次 appendChild 都可能触发重排
  })
}
```

### 1.2 虚拟 DOM 的解决方案

```
┌─────────────────────────────────────────────────────────────┐
│                   虚拟 DOM 工作流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   数据变化                                                   │
│       ↓                                                     │
│   生成新的虚拟 DOM 树                                        │
│       ↓                                                     │
│   与旧的虚拟 DOM 树对比 (Diff)                               │
│       ↓                                                     │
│   计算出最小变更                                             │
│       ↓                                                     │
│   批量更新真实 DOM (Patch)                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、什么是虚拟 DOM

### 2.1 用 JS 对象描述 DOM

```javascript
// 真实 DOM
<div id="app" class="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// 虚拟 DOM（VNode）
const vnode = {
  type: 'div',
  props: {
    id: 'app',
    class: 'container'
  },
  children: [
    {
      type: 'h1',
      props: null,
      children: 'Hello'
    },
    {
      type: 'p',
      props: null,
      children: 'World'
    }
  ]
}
```

### 2.2 VNode 结构

```typescript
interface VNode {
  type: string | Component    // 标签名或组件
  props: object | null        // 属性
  children: VNode[] | string  // 子节点或文本
  key: string | number        // 用于 diff 的唯一标识
  el: Element | null          // 对应的真实 DOM
  // ... 其他内部属性
}
```

## 三、虚拟 DOM 的优势

### 3.1 性能优化

```javascript
// 场景：100 个列表项，只有第 50 项变化

// 不用虚拟 DOM：可能重新渲染全部
ul.innerHTML = generateHTML(items)  // 重建 100 个 DOM 节点

// 使用虚拟 DOM：只更新变化的部分
// diff 发现只有第 50 项不同
// 只更新这一个 DOM 节点
```

### 3.2 跨平台

```javascript
// 虚拟 DOM 是平台无关的 JS 对象
// 可以渲染到不同平台

// 浏览器
render(vnode, document.body)

// 服务端（SSR）
renderToString(vnode)

// 原生应用（如 weex）
renderToNative(vnode)
```

### 3.3 声明式编程

```javascript
// 命令式：告诉计算机怎么做
const el = document.createElement('div')
el.id = 'app'
el.textContent = 'Hello'
document.body.appendChild(el)

// 声明式：告诉计算机要什么
const vnode = h('div', { id: 'app' }, 'Hello')
render(vnode, document.body)
```

## 四、创建虚拟 DOM

### 4.1 h 函数

```javascript
import { h } from 'vue'

// h(type, props, children)
const vnode = h('div', { class: 'container' }, [
  h('h1', null, 'Hello'),
  h('p', null, 'World')
])

// 等价于
<div class="container">
  <h1>Hello</h1>
  <p>World</p>
</div>
```

### 4.2 渲染函数

```javascript
import { h } from 'vue'

export default {
  render() {
    return h('div', { class: 'greeting' }, [
      h('h1', null, this.title),
      h('p', null, this.content)
    ])
  }
}

// 使用 <script setup> 时
<script setup>
import { h } from 'vue'

const render = () => h('div', null, 'Hello')
</script>

<template>
  <render />
</template>
```

## 五、虚拟 DOM 的工作流程

### 5.1 首次渲染（Mount）

```
模板/渲染函数
      ↓
  生成 VNode
      ↓
  创建真实 DOM
      ↓
  挂载到页面
```

```javascript
// 简化示意
function mount(vnode, container) {
  // 创建 DOM 元素
  const el = document.createElement(vnode.type)
  
  // 设置属性
  for (const key in vnode.props) {
    el.setAttribute(key, vnode.props[key])
  }
  
  // 处理子节点
  if (typeof vnode.children === 'string') {
    el.textContent = vnode.children
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => {
      mount(child, el)
    })
  }
  
  // 挂载
  container.appendChild(el)
  vnode.el = el
}
```

### 5.2 更新（Patch）

```
数据变化
    ↓
生成新 VNode
    ↓
与旧 VNode 对比 (Diff)
    ↓
计算差异
    ↓
更新真实 DOM (Patch)
```

```javascript
// 简化示意
function patch(oldVNode, newVNode) {
  // 类型不同，直接替换
  if (oldVNode.type !== newVNode.type) {
    const parent = oldVNode.el.parentNode
    parent.removeChild(oldVNode.el)
    mount(newVNode, parent)
    return
  }
  
  const el = (newVNode.el = oldVNode.el)
  
  // 更新属性
  patchProps(el, oldVNode.props, newVNode.props)
  
  // 更新子节点
  patchChildren(oldVNode, newVNode)
}
```

## 六、模板与虚拟 DOM

### 6.1 模板编译

```
模板
  ↓ 编译
渲染函数
  ↓ 执行
VNode
  ↓ patch
真实 DOM
```

```vue
<!-- 模板 -->
<template>
  <div class="container">
    <h1>{{ title }}</h1>
  </div>
</template>

<!-- 编译为渲染函数 -->
function render() {
  return h('div', { class: 'container' }, [
    h('h1', null, this.title)
  ])
}
```

### 6.2 编译时优化

Vue 3 在编译时会进行优化：

```javascript
// 静态提升
// 静态节点只创建一次，后续复用
const _hoisted_1 = h('p', null, '静态文本')

function render() {
  return h('div', null, [
    _hoisted_1,  // 复用
    h('p', null, this.dynamicText)
  ])
}

// PatchFlags
// 标记动态内容的类型，跳过静态对比
h('p', null, this.text, PatchFlags.TEXT)
```

## 七、虚拟 DOM 的代价

### 7.1 内存开销

```javascript
// 每个节点都需要创建 JS 对象
// 大型应用可能有成千上万个 VNode
const vnode = {
  type: 'div',
  props: { /* ... */ },
  children: [ /* ... */ ],
  key: null,
  el: null,
  // ... 更多内部属性
}
```

### 7.2 Diff 开销

```javascript
// Diff 算法需要遍历树结构
// 时间复杂度 O(n)
// 节点越多，对比越慢
```

### 7.3 何时虚拟 DOM 更慢

```javascript
// 简单更新，虚拟 DOM 可能更慢
// 直接操作：1 步
document.getElementById('text').textContent = 'new'

// 虚拟 DOM：多步
// 1. 生成新 VNode
// 2. Diff 对比
// 3. 更新 DOM
```

## 八、与其他方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| 虚拟 DOM | 声明式、跨平台、可优化 | 内存开销、Diff 开销 |
| 直接操作 DOM | 简单场景快 | 复杂场景难优化 |
| 响应式细粒度更新（Solid.js） | 精准更新、无 Diff | 实现复杂 |
| 脏检查（Angular 1） | 实现简单 | 性能问题 |

## 九、总结

| 概念 | 说明 |
|------|------|
| 虚拟 DOM | 用 JS 对象描述 DOM |
| VNode | 虚拟节点对象 |
| Diff | 对比新旧 VNode 差异 |
| Patch | 将差异应用到真实 DOM |
| 优势 | 声明式、跨平台、批量更新 |
| 代价 | 内存、Diff 开销 |

## 参考资料

- [渲染机制](https://vuejs.org/guide/extras/rendering-mechanism.html)
- [渲染函数 & JSX](https://vuejs.org/guide/extras/render-function.html)

---

**下一节** → [第 20 节：渲染流程](./20-render-process.md)
