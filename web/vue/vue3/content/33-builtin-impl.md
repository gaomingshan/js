# 第 33 节：内置组件实现

## 概述

Vue 的内置组件（KeepAlive、Transition、Teleport、Suspense）都有特殊的实现机制。本节分析它们的核心实现原理。

## 一、KeepAlive 实现

### 1.1 核心原理

```javascript
// KeepAlive 缓存组件实例，而非销毁
// 切换时：deactivate → activate
// 而不是：unmount → mount

const KeepAlive = {
  __isKeepAlive: true,
  
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number]
  },
  
  setup(props, { slots }) {
    // 缓存 Map
    const cache = new Map()
    // 缓存的 key 集合（LRU 顺序）
    const keys = new Set()
    // 当前激活的 VNode
    let current = null
    
    const instance = getCurrentInstance()
    const parentSuspense = instance.suspense
    
    // 获取渲染器的内部方法
    const {
      renderer: {
        p: patch,
        m: move,
        um: _unmount,
        o: { createElement }
      }
    } = instance.ctx
    
    // 隐藏容器（用于存放失活的组件）
    const storageContainer = createElement('div')
    
    // 激活组件
    instance.ctx.activate = (vnode, container, anchor) => {
      move(vnode, container, anchor)
      // 触发 activated 钩子
      queuePostFlushCb(() => {
        vnode.component.isDeactivated = false
        invokeArrayFns(vnode.component.a)  // activated hooks
      })
    }
    
    // 失活组件
    instance.ctx.deactivate = (vnode) => {
      move(vnode, storageContainer, null)
      // 触发 deactivated 钩子
      queuePostFlushCb(() => {
        invokeArrayFns(vnode.component.da)  // deactivated hooks
        vnode.component.isDeactivated = true
      })
    }
    
    return () => {
      // 获取默认插槽内容
      const children = slots.default()
      const rawVNode = children[0]
      
      // 检查是否应该缓存
      const name = getComponentName(rawVNode.type)
      if (!matches(props.include, name) || matches(props.exclude, name)) {
        return rawVNode
      }
      
      const key = rawVNode.key ?? rawVNode.type
      const cachedVNode = cache.get(key)
      
      if (cachedVNode) {
        // 有缓存，复用组件实例
        rawVNode.component = cachedVNode.component
        // 标记为 KeepAlive
        rawVNode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE
        
        // LRU：移到最后
        keys.delete(key)
        keys.add(key)
      } else {
        // 无缓存，添加到缓存
        cache.set(key, rawVNode)
        keys.add(key)
        
        // 超出 max，删除最旧的
        if (props.max && keys.size > parseInt(props.max)) {
          const oldestKey = keys.values().next().value
          pruneCacheEntry(oldestKey)
        }
      }
      
      // 标记应该被 KeepAlive
      rawVNode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
      
      return rawVNode
    }
  }
}
```

### 1.2 渲染器中的处理

```javascript
function processComponent(n1, n2, container, anchor) {
  if (n1 == null) {
    // 检查是否是 KeepAlive 缓存的组件
    if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
      // 激活而非挂载
      parentComponent.ctx.activate(n2, container, anchor)
    } else {
      mountComponent(n2, container, anchor)
    }
  } else {
    updateComponent(n1, n2)
  }
}

function unmount(vnode) {
  // 检查是否应该被 KeepAlive
  if (vnode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    // 失活而非卸载
    parentComponent.ctx.deactivate(vnode)
  } else {
    // 正常卸载
  }
}
```

## 二、Transition 实现

### 2.1 核心原理

```javascript
const Transition = {
  props: {
    name: String,
    mode: String,  // 'in-out' | 'out-in'
    appear: Boolean,
    // CSS 类名
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String,
    // 钩子
    onBeforeEnter: Function,
    onEnter: Function,
    onAfterEnter: Function,
    onBeforeLeave: Function,
    onLeave: Function,
    onAfterLeave: Function
  },
  
  setup(props, { slots }) {
    return () => {
      const children = slots.default()
      const child = children[0]
      
      // 将过渡钩子注入到 VNode
      const enterHooks = resolveTransitionHooks(child, props, 'enter')
      const leaveHooks = resolveTransitionHooks(child, props, 'leave')
      
      child.transition = {
        ...enterHooks,
        ...leaveHooks
      }
      
      return child
    }
  }
}
```

### 2.2 过渡钩子

```javascript
function resolveTransitionHooks(vnode, props, type) {
  const {
    name = 'v',
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`
  } = props
  
  return {
    beforeEnter(el) {
      addTransitionClass(el, enterFromClass)
      addTransitionClass(el, enterActiveClass)
    },
    enter(el, done) {
      nextFrame(() => {
        removeTransitionClass(el, enterFromClass)
        addTransitionClass(el, enterToClass)
        
        // 监听过渡结束
        whenTransitionEnds(el, () => {
          removeTransitionClass(el, enterActiveClass)
          removeTransitionClass(el, enterToClass)
          done()
        })
      })
    },
    leave(el, done) {
      addTransitionClass(el, leaveFromClass)
      addTransitionClass(el, leaveActiveClass)
      
      nextFrame(() => {
        removeTransitionClass(el, leaveFromClass)
        addTransitionClass(el, leaveToClass)
        
        whenTransitionEnds(el, () => {
          removeTransitionClass(el, leaveActiveClass)
          removeTransitionClass(el, leaveToClass)
          done()
        })
      })
    }
  }
}
```

### 2.3 渲染器中的处理

```javascript
function mountElement(vnode, container, anchor) {
  const el = createElement(vnode.type)
  // ...
  
  // 执行进入过渡
  const { transition } = vnode
  if (transition) {
    transition.beforeEnter(el)
  }
  
  insert(el, container, anchor)
  
  if (transition) {
    transition.enter(el, () => {
      // 过渡完成回调
    })
  }
}

function unmount(vnode) {
  const { transition } = vnode
  
  if (transition) {
    transition.leave(vnode.el, () => {
      // 过渡完成后真正移除
      remove(vnode.el)
    })
  } else {
    remove(vnode.el)
  }
}
```

## 三、Teleport 实现

### 3.1 核心原理

```javascript
const Teleport = {
  __isTeleport: true,
  
  process(n1, n2, container, anchor, internals) {
    const { to, disabled } = n2.props
    const targetSelector = to
    
    if (n1 == null) {
      // 挂载
      const target = disabled
        ? container
        : document.querySelector(targetSelector)
      
      // 将子节点挂载到目标容器
      mountChildren(n2.children, target)
    } else {
      // 更新
      if (disabled !== n1.props.disabled) {
        // disabled 状态变化，移动节点
        if (disabled) {
          // 移回原容器
          moveTeleport(n2, container)
        } else {
          // 移到目标容器
          moveTeleport(n2, document.querySelector(targetSelector))
        }
      } else {
        // 正常更新子节点
        patchChildren(n1, n2, target)
      }
    }
  }
}
```

### 3.2 渲染器中的处理

```javascript
function patch(n1, n2, container, anchor) {
  const { type, shapeFlag } = n2
  
  switch (type) {
    case Text:
      // ...
      break
    case Fragment:
      // ...
      break
    default:
      if (shapeFlag & ShapeFlags.TELEPORT) {
        // 调用 Teleport 的 process 方法
        type.process(n1, n2, container, anchor, internals)
      }
  }
}
```

## 四、Suspense 实现

### 4.1 核心原理

```javascript
const Suspense = {
  __isSuspense: true,
  
  process(n1, n2, container, anchor, internals) {
    if (n1 == null) {
      // 挂载
      mountSuspense(n2, container, anchor, internals)
    } else {
      // 更新
      patchSuspense(n1, n2, container, anchor, internals)
    }
  }
}

function mountSuspense(vnode, container, anchor, internals) {
  const suspense = {
    vnode,
    parent: null,
    container,
    // 挂起状态
    isResolved: false,
    isUnmounted: false,
    // 异步依赖
    asyncDeps: 0,
    asyncResolvedDeps: 0
  }
  
  vnode.suspense = suspense
  
  // 挂载 fallback
  const fallback = vnode.children[1]
  mountChildren([fallback], container)
  
  // 注册异步依赖
  const default = vnode.children[0]
  registerAsyncDep(suspense, default, () => {
    // 所有异步依赖解决后
    suspense.isResolved = true
    // 卸载 fallback，挂载 default
    unmount(fallback)
    mount(default, container)
  })
}
```

### 4.2 异步组件协作

```javascript
// 组件 setup 返回 Promise 时
function setupComponent(instance) {
  const setupResult = setup(props, context)
  
  if (isPromise(setupResult)) {
    // 查找父级 Suspense
    const suspense = instance.suspense
    
    if (suspense) {
      // 注册为异步依赖
      suspense.asyncDeps++
      
      setupResult.then(
        result => {
          handleSetupResult(instance, result)
          suspense.asyncResolvedDeps++
          
          // 检查是否所有依赖都解决了
          if (suspense.asyncResolvedDeps >= suspense.asyncDeps) {
            suspense.resolve()
          }
        },
        error => {
          suspense.error(error)
        }
      )
    }
    
    return setupResult
  }
}
```

## 五、Fragment 实现

### 5.1 无根节点

```javascript
// Fragment 表示多个根节点
const Fragment = Symbol('Fragment')

// 模板编译
<template>
  <p>a</p>
  <p>b</p>
</template>

// 编译为
h(Fragment, null, [
  h('p', null, 'a'),
  h('p', null, 'b')
])
```

### 5.2 渲染处理

```javascript
function processFragment(n1, n2, container, anchor) {
  // Fragment 使用开始和结束锚点标记位置
  const fragmentStartAnchor = (n2.el = n1 ? n1.el : createText(''))
  const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : createText(''))
  
  if (n1 == null) {
    insert(fragmentStartAnchor, container, anchor)
    insert(fragmentEndAnchor, container, anchor)
    // 挂载子节点
    mountChildren(n2.children, container, fragmentEndAnchor)
  } else {
    // 更新子节点
    patchChildren(n1, n2, container, fragmentEndAnchor)
  }
}
```

## 六、总结

| 组件 | 核心机制 | 关键点 |
|------|----------|--------|
| KeepAlive | 缓存实例、激活/失活 | LRU 缓存、move 代替 mount/unmount |
| Transition | CSS 类名切换 | 钩子注入、过渡监听 |
| Teleport | DOM 移动 | 渲染到指定容器 |
| Suspense | 异步依赖管理 | 等待 async setup |
| Fragment | 多根节点 | 锚点标记 |

## 参考资料

- [Vue 3 KeepAlive 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/KeepAlive.ts)
- [Vue 3 Transition 源码](https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/components/Transition.ts)

---

**下一节** → [第 34 节：架构差异](./34-arch-diff.md)
