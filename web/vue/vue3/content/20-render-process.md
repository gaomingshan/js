# 第 20 节：渲染流程

## 概述

Vue 的渲染流程是：模板 → 渲染函数 → VNode → 真实 DOM。理解这个流程，是深入理解 Vue 工作原理的关键。

## 一、渲染流程概览

```
┌─────────────────────────────────────────────────────────────┐
│                   Vue 渲染流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   模板 (Template)                                           │
│   <div>{{ msg }}</div>                                      │
│        │                                                    │
│        │ 编译（Compile）                                    │
│        ↓                                                    │
│   渲染函数 (Render Function)                                │
│   function render() { return h('div', null, ctx.msg) }     │
│        │                                                    │
│        │ 执行                                               │
│        ↓                                                    │
│   虚拟 DOM (VNode)                                          │
│   { type: 'div', children: 'Hello' }                       │
│        │                                                    │
│        │ 挂载/更新（Mount/Patch）                           │
│        ↓                                                    │
│   真实 DOM                                                  │
│   <div>Hello</div>                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、模板编译

### 2.1 编译时机

```javascript
// 方式一：构建时编译（推荐）
// .vue 文件在构建时被编译
// 打包后只有渲染函数，没有模板字符串

// 方式二：运行时编译
// 需要引入完整版 Vue（包含编译器）
// 在浏览器中编译模板
import { createApp } from 'vue'  // 运行时版本
import { createApp } from 'vue/dist/vue.esm-bundler.js'  // 完整版
```

### 2.2 编译过程

```
模板字符串
    ↓ parse
AST (抽象语法树)
    ↓ transform
优化后的 AST
    ↓ generate
渲染函数代码
```

### 2.3 编译示例

```vue
<!-- 模板 -->
<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <p v-if="show">{{ content }}</p>
  </div>
</template>

<!-- 编译后的渲染函数（简化） -->
function render(_ctx) {
  return h('div', { class: 'container' }, [
    h('h1', null, _ctx.title),
    _ctx.show
      ? h('p', null, _ctx.content)
      : null
  ])
}
```

## 三、渲染函数

### 3.1 h 函数

```javascript
import { h } from 'vue'

// h(type, props, children)
// type: 字符串（标签名）或组件
// props: 属性对象
// children: 子节点

const vnode = h('div', { id: 'app', class: 'container' }, [
  h('h1', null, 'Hello'),
  h('p', null, 'World')
])
```

### 3.2 手写渲染函数

```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    return () => h('div', null, [
      h('p', null, `Count: ${count.value}`),
      h('button', { onClick: () => count.value++ }, '+1')
    ])
  }
}
```

### 3.3 渲染函数 vs 模板

| 特性 | 模板 | 渲染函数 |
|------|------|----------|
| 可读性 | 高 | 较低 |
| 灵活性 | 有限 | 完全灵活 |
| 编译优化 | 自动 | 手动 |
| 适用场景 | 大多数情况 | 高度动态组件 |

## 四、VNode 生成

### 4.1 VNode 结构

```javascript
// 渲染函数执行后生成 VNode
const vnode = {
  type: 'div',
  props: { class: 'container' },
  children: [
    { type: 'h1', props: null, children: 'Hello' },
    { type: 'p', props: null, children: 'World' }
  ],
  key: null,
  el: null,        // 对应的真实 DOM
  shapeFlag: 17,   // 节点类型标记
  patchFlag: 0,    // 更新类型标记
  // ...
}
```

### 4.2 组件 VNode

```javascript
import MyComponent from './MyComponent.vue'

// 组件的 VNode
const vnode = h(MyComponent, { title: 'Hello' })

// type 是组件对象
{
  type: MyComponent,  // 组件定义
  props: { title: 'Hello' },
  children: null,
  // ...
}
```

## 五、挂载过程（Mount）

### 5.1 首次渲染流程

```javascript
// 简化的挂载过程
function mount(vnode, container) {
  // 1. 创建 DOM 元素
  const el = document.createElement(vnode.type)
  
  // 2. 处理 props
  if (vnode.props) {
    for (const key in vnode.props) {
      if (key.startsWith('on')) {
        // 事件处理
        el.addEventListener(key.slice(2).toLowerCase(), vnode.props[key])
      } else {
        // 属性设置
        el.setAttribute(key, vnode.props[key])
      }
    }
  }
  
  // 3. 处理子节点
  if (typeof vnode.children === 'string') {
    el.textContent = vnode.children
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => mount(child, el))
  }
  
  // 4. 挂载到容器
  container.appendChild(el)
  
  // 5. 保存 DOM 引用
  vnode.el = el
}
```

### 5.2 组件挂载

```javascript
function mountComponent(vnode, container) {
  // 1. 创建组件实例
  const instance = {
    vnode,
    type: vnode.type,
    props: vnode.props,
    setupState: null,
    render: null,
    subTree: null
  }
  
  // 2. 执行 setup
  const { setup } = vnode.type
  if (setup) {
    instance.setupState = setup(instance.props)
  }
  
  // 3. 设置渲染函数
  instance.render = vnode.type.render || instance.setupState
  
  // 4. 创建响应式 effect
  effect(() => {
    // 执行渲染函数获取 VNode 树
    const subTree = instance.render()
    
    // 挂载或更新
    if (!instance.subTree) {
      mount(subTree, container)
    } else {
      patch(instance.subTree, subTree)
    }
    
    instance.subTree = subTree
  })
}
```

## 六、更新过程（Patch）

### 6.1 更新触发

```javascript
// 响应式数据变化
const count = ref(0)
count.value++  // 触发更新

// 更新流程
// 1. 触发依赖（trigger）
// 2. 重新执行渲染函数
// 3. 生成新 VNode
// 4. Diff 对比
// 5. Patch 更新 DOM
```

### 6.2 Patch 过程

```javascript
function patch(oldVNode, newVNode) {
  // 类型不同，卸载旧节点，挂载新节点
  if (oldVNode.type !== newVNode.type) {
    unmount(oldVNode)
    mount(newVNode, oldVNode.el.parentNode)
    return
  }
  
  // 复用 DOM 元素
  const el = (newVNode.el = oldVNode.el)
  
  // 更新 props
  patchProps(el, oldVNode.props, newVNode.props)
  
  // 更新子节点
  patchChildren(oldVNode, newVNode, el)
}
```

## 七、编译优化

### 7.1 静态提升

```javascript
// 编译前
<template>
  <div>
    <p>静态文本</p>
    <p>{{ dynamic }}</p>
  </div>
</template>

// 编译后（静态节点被提升）
const _hoisted_1 = h('p', null, '静态文本')

function render(_ctx) {
  return h('div', null, [
    _hoisted_1,  // 复用，不重新创建
    h('p', null, _ctx.dynamic)
  ])
}
```

### 7.2 PatchFlags

```javascript
// 标记动态内容类型
const PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,          // 动态 class
  STYLE: 4,          // 动态 style
  PROPS: 8,          // 动态 props
  FULL_PROPS: 16,    // 需要完整 props diff
  // ...
}

// 编译时添加标记
h('p', null, _ctx.text, PatchFlags.TEXT)

// 更新时只检查文本，跳过其他对比
```

### 7.3 Block Tree

```javascript
// 将动态节点收集到 Block 中
// 更新时直接遍历 Block，跳过静态节点

// 编译后
function render() {
  return (openBlock(), createBlock('div', null, [
    createVNode('p', null, '静态'),
    createVNode('p', null, ctx.dynamic, PatchFlags.TEXT)
  ]))
}
```

## 八、渲染器架构

### 8.1 平台无关设计

```javascript
// 自定义渲染器
import { createRenderer } from '@vue/runtime-core'

const renderer = createRenderer({
  createElement(type) {
    // 自定义创建元素
  },
  setElementText(el, text) {
    // 自定义设置文本
  },
  insert(el, parent) {
    // 自定义插入
  },
  // ...
})

// 可以渲染到任意平台
```

### 8.2 内置渲染器

```javascript
// DOM 渲染器（浏览器）
import { createApp } from 'vue'

// SSR 渲染器（服务端）
import { renderToString } from 'vue/server-renderer'
```

## 九、总结

| 阶段 | 说明 |
|------|------|
| 编译 | 模板 → 渲染函数 |
| 渲染 | 渲染函数 → VNode |
| 挂载 | VNode → 真实 DOM |
| 更新 | Diff + Patch |
| 优化 | 静态提升、PatchFlags |

## 参考资料

- [渲染机制](https://vuejs.org/guide/extras/rendering-mechanism.html)
- [渲染函数](https://vuejs.org/guide/extras/render-function.html)

---

**下一节** → [第 21 节：Diff 算法基础](./21-diff-basics.md)
