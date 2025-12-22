# 第 24 节：组件挂载流程

## 概述

组件挂载是 Vue 将组件定义转换为真实 DOM 的过程。本节详解从 `createApp().mount()` 到页面渲染的完整流程。

## 一、挂载流程概览

```
┌─────────────────────────────────────────────────────────────┐
│                   组件挂载流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   createApp(App)                                            │
│        │                                                    │
│        ↓                                                    │
│   app.mount('#app')                                         │
│        │                                                    │
│        ↓                                                    │
│   创建根组件 VNode                                           │
│        │                                                    │
│        ↓                                                    │
│   render(vnode, container)                                  │
│        │                                                    │
│        ↓                                                    │
│   patch(null, vnode, container)                             │
│        │                                                    │
│        ↓                                                    │
│   processComponent → mountComponent                         │
│        │                                                    │
│        ↓                                                    │
│   创建组件实例 → setup → 渲染 → 递归挂载                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、createApp 阶段

### 2.1 创建应用实例

```javascript
// 简化的 createApp 实现
function createApp(rootComponent) {
  const app = {
    _component: rootComponent,
    _container: null,
    
    // 全局配置
    config: {
      errorHandler: null,
      globalProperties: {}
    },
    
    // 注册全局组件
    component(name, component) {
      // ...
    },
    
    // 注册全局指令
    directive(name, directive) {
      // ...
    },
    
    // 挂载应用
    mount(containerOrSelector) {
      const container = typeof containerOrSelector === 'string'
        ? document.querySelector(containerOrSelector)
        : containerOrSelector
      
      // 创建根组件 VNode
      const vnode = createVNode(rootComponent)
      
      // 渲染
      render(vnode, container)
      
      app._container = container
      return vnode.component.proxy
    }
  }
  
  return app
}
```

### 2.2 使用示例

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局配置
app.config.errorHandler = (err) => console.error(err)

// 全局组件
app.component('GlobalButton', Button)

// 挂载
app.mount('#app')
```

## 三、render 阶段

### 3.1 渲染入口

```javascript
// 渲染器的 render 函数
function render(vnode, container) {
  if (vnode == null) {
    // 卸载
    if (container._vnode) {
      unmount(container._vnode)
    }
  } else {
    // 挂载或更新
    patch(container._vnode || null, vnode, container)
  }
  
  // 保存当前 VNode
  container._vnode = vnode
}
```

### 3.2 patch 分发

```javascript
function patch(n1, n2, container, anchor = null) {
  // n1: 旧 VNode，n2: 新 VNode
  
  // 类型不同，卸载旧节点
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }
  
  const { type, shapeFlag } = n2
  
  switch (type) {
    case Text:
      processText(n1, n2, container)
      break
    case Fragment:
      processFragment(n1, n2, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 普通元素
        processElement(n1, n2, container, anchor)
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        // 组件
        processComponent(n1, n2, container, anchor)
      }
  }
}
```

## 四、组件挂载详解

### 4.1 processComponent

```javascript
function processComponent(n1, n2, container, anchor) {
  if (n1 == null) {
    // 挂载组件
    mountComponent(n2, container, anchor)
  } else {
    // 更新组件
    updateComponent(n1, n2)
  }
}
```

### 4.2 mountComponent

```javascript
function mountComponent(vnode, container, anchor) {
  // 1. 创建组件实例
  const instance = (vnode.component = createComponentInstance(vnode))
  
  // 2. 设置组件（执行 setup、编译模板等）
  setupComponent(instance)
  
  // 3. 设置渲染 effect
  setupRenderEffect(instance, vnode, container, anchor)
}
```

### 4.3 createComponentInstance

```javascript
function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,
    
    // 组件状态
    props: {},
    attrs: {},
    slots: {},
    
    // setup 返回值
    setupState: null,
    
    // 渲染相关
    render: null,
    subTree: null,
    
    // 生命周期
    isMounted: false,
    isUnmounted: false,
    
    // 生命周期钩子数组
    bm: null,  // beforeMount
    m: null,   // mounted
    bu: null,  // beforeUpdate
    u: null,   // updated
    um: null,  // unmounted
    bum: null, // beforeUnmount
    
    // 父子关系
    parent: null,
    
    // 代理
    proxy: null,
    
    // 上下文
    ctx: {}
  }
  
  // 创建公共实例代理
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
  
  return instance
}
```

### 4.4 setupComponent

```javascript
function setupComponent(instance) {
  const { props, children } = instance.vnode
  
  // 初始化 props
  initProps(instance, props)
  
  // 初始化 slots
  initSlots(instance, children)
  
  // 执行 setup
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  
  if (setup) {
    // 设置当前实例（让 onMounted 等能注册到正确的实例）
    setCurrentInstance(instance)
    
    // 执行 setup
    const setupResult = setup(instance.props, {
      attrs: instance.attrs,
      slots: instance.slots,
      emit: instance.emit
    })
    
    setCurrentInstance(null)
    
    // 处理 setup 返回值
    handleSetupResult(instance, setupResult)
  }
  
  // 完成设置
  finishComponentSetup(instance)
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'function') {
    // setup 返回渲染函数
    instance.render = setupResult
  } else if (typeof setupResult === 'object') {
    // setup 返回状态对象
    instance.setupState = proxyRefs(setupResult)
  }
}

function finishComponentSetup(instance) {
  const Component = instance.type
  
  // 如果没有 render 函数，编译模板
  if (!instance.render) {
    if (Component.template) {
      instance.render = compile(Component.template)
    }
  }
}
```

### 4.5 setupRenderEffect

```javascript
function setupRenderEffect(instance, vnode, container, anchor) {
  // 创建响应式 effect
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      // ===== 首次挂载 =====
      
      // 调用 beforeMount 钩子
      if (instance.bm) {
        invokeArrayFns(instance.bm)
      }
      
      // 执行渲染函数，生成子树 VNode
      const subTree = (instance.subTree = renderComponentRoot(instance))
      
      // 递归挂载子树
      patch(null, subTree, container, anchor)
      
      // 设置组件根元素
      vnode.el = subTree.el
      
      // 调用 mounted 钩子
      if (instance.m) {
        // 使用 queuePostFlushCb 确保在 DOM 更新后执行
        queuePostFlushCb(instance.m)
      }
      
      instance.isMounted = true
    } else {
      // ===== 更新 =====
      
      // 调用 beforeUpdate 钩子
      if (instance.bu) {
        invokeArrayFns(instance.bu)
      }
      
      // 获取新子树
      const nextTree = renderComponentRoot(instance)
      const prevTree = instance.subTree
      instance.subTree = nextTree
      
      // Diff + Patch
      patch(prevTree, nextTree, container, anchor)
      
      // 调用 updated 钩子
      if (instance.u) {
        queuePostFlushCb(instance.u)
      }
    }
  }
  
  // 创建 effect 并立即执行
  const effect = new ReactiveEffect(componentUpdateFn, () => {
    // 调度器：将更新任务放入队列
    queueJob(instance.update)
  })
  
  instance.update = effect.run.bind(effect)
  instance.update()
}
```

## 五、元素挂载

### 5.1 processElement

```javascript
function processElement(n1, n2, container, anchor) {
  if (n1 == null) {
    // 挂载元素
    mountElement(n2, container, anchor)
  } else {
    // 更新元素
    patchElement(n1, n2)
  }
}
```

### 5.2 mountElement

```javascript
function mountElement(vnode, container, anchor) {
  // 1. 创建 DOM 元素
  const el = (vnode.el = document.createElement(vnode.type))
  
  // 2. 设置属性
  const { props } = vnode
  if (props) {
    for (const key in props) {
      patchProp(el, key, null, props[key])
    }
  }
  
  // 3. 处理子节点
  const { children, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 文本子节点
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 数组子节点
    mountChildren(children, el)
  }
  
  // 4. 插入 DOM
  container.insertBefore(el, anchor)
}

function mountChildren(children, container) {
  children.forEach(child => {
    patch(null, child, container)
  })
}
```

## 六、完整流程示例

```javascript
// App.vue
<template>
  <div class="app">
    <h1>{{ title }}</h1>
    <Child :msg="message" />
  </div>
</template>

// 挂载流程：
// 1. createApp(App).mount('#app')
// 2. 创建 App 的 VNode
// 3. patch(null, appVNode, container)
// 4. processComponent → mountComponent
// 5. 创建 App 实例，执行 setup
// 6. setupRenderEffect，执行渲染函数
// 7. 生成子树 VNode: { type: 'div', children: [h1, Child] }
// 8. patch 子树到 container
// 9. mountElement(div)
//    - 创建 div 元素
//    - mountChildren([h1, Child])
//      - patch h1 → mountElement
//      - patch Child → mountComponent（递归）
// 10. 调用 mounted 钩子
```

## 七、调度与批量更新

### 7.1 任务队列

```javascript
const queue = []
let isFlushing = false
let isFlushPending = false

function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    Promise.resolve().then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  isFlushing = true
  
  // 按组件层级排序（父组件先更新）
  queue.sort((a, b) => a.id - b.id)
  
  // 执行所有任务
  for (const job of queue) {
    job()
  }
  
  queue.length = 0
  isFlushing = false
}
```

## 八、总结

| 阶段 | 关键函数 | 作用 |
|------|----------|------|
| 创建应用 | createApp | 创建应用实例 |
| 挂载入口 | mount | 启动挂载流程 |
| 渲染 | render | 调用 patch |
| Patch | patch | 分发到 Element/Component |
| 组件挂载 | mountComponent | 创建实例、setup、effect |
| 元素挂载 | mountElement | 创建 DOM、递归子节点 |

## 参考资料

- [Vue 3 runtime-core 源码](https://github.com/vuejs/core/tree/main/packages/runtime-core)

---

**下一节** → [第 25 节：reactive 实现](./25-reactive-impl.md)
