# 第 17 节：依赖追踪

## 概述

依赖追踪是响应式系统的核心机制：在读取数据时收集依赖（track），在修改数据时触发更新（trigger）。理解这个过程是理解 Vue 响应式的关键。

## 一、依赖追踪流程

### 1.1 整体流程

```
┌─────────────────────────────────────────────────────────────┐
│                   依赖追踪流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 执行 effect（如渲染函数）                               │
│      └── 设置当前活动 effect                                │
│                                                             │
│   2. effect 读取响应式数据                                   │
│      └── 触发 getter                                        │
│      └── track：将当前 effect 记录为依赖                    │
│                                                             │
│   3. 数据被修改                                              │
│      └── 触发 setter                                        │
│      └── trigger：通知所有依赖的 effect                     │
│                                                             │
│   4. effect 重新执行                                        │
│      └── 回到步骤 1，重新收集依赖                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 示意图

```
        读取 state.count
              ↓
    ┌─────────────────┐
    │     getter      │
    │   track(dep)    │ ← 收集依赖
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │   依赖存储       │
    │  deps: [effect] │
    └────────┬────────┘
             │
        修改 state.count
              ↓
    ┌─────────────────┐
    │     setter      │
    │  trigger(dep)   │ ← 触发更新
    └────────┬────────┘
             │
             ▼
    effect 重新执行
```

## 二、核心概念

### 2.1 Effect（副作用函数）

```javascript
// effect 是使用响应式数据的函数
// Vue 内部的渲染函数就是一个 effect

// 简化示意
let activeEffect = null

function effect(fn) {
  activeEffect = fn
  fn()  // 执行时会读取响应式数据，触发依赖收集
  activeEffect = null
}

// 使用
effect(() => {
  // 这个函数就是一个 effect
  document.body.textContent = state.count
})
```

### 2.2 依赖收集（Track）

```javascript
// 简化的依赖收集
const targetMap = new WeakMap()  // 存储所有依赖关系

function track(target, key) {
  if (!activeEffect) return
  
  // 获取 target 的依赖 map
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  // 获取 key 的依赖集合
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  // 将当前 effect 添加到依赖集合
  dep.add(activeEffect)
}
```

### 2.3 触发更新（Trigger）

```javascript
// 简化的触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  if (!dep) return
  
  // 执行所有依赖的 effect
  dep.forEach(effect => effect())
}
```

## 三、依赖存储结构

### 3.1 数据结构

```
targetMap: WeakMap
└── target (响应式对象)
    └── depsMap: Map
        └── key (属性名)
            └── dep: Set
                └── effect1
                └── effect2
                └── ...
```

### 3.2 示例

```javascript
const state = reactive({ count: 0, name: 'Vue' })

// effect1 使用了 count
effect(() => console.log(state.count))

// effect2 使用了 count 和 name
effect(() => console.log(state.count, state.name))

// 依赖结构：
// targetMap
// └── state
//     └── 'count' → [effect1, effect2]
//     └── 'name' → [effect2]
```

## 四、完整示例

### 4.1 简化的响应式实现

```javascript
// 存储当前活动的 effect
let activeEffect = null
const targetMap = new WeakMap()

// 创建响应式对象
function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      trigger(target, key)
      return true
    }
  })
}

// 依赖收集
function track(target, key) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  dep.add(activeEffect)
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => effect())
  }
}

// 注册 effect
function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}

// 使用
const state = reactive({ count: 0 })

effect(() => {
  console.log('count is:', state.count)
})

state.count = 1  // 自动输出：count is: 1
state.count = 2  // 自动输出：count is: 2
```

## 五、Vue 中的应用

### 5.1 渲染函数作为 effect

```javascript
// Vue 组件的渲染函数就是一个 effect
// 简化示意
function mountComponent(component) {
  const instance = createComponentInstance(component)
  
  // 渲染函数作为 effect
  effect(() => {
    // 执行渲染函数，生成 VNode
    const vnode = instance.render()
    // 更新 DOM
    patch(instance.subTree, vnode)
    instance.subTree = vnode
  })
}
```

### 5.2 computed 的依赖追踪

```javascript
// computed 也是基于 effect 实现
function computed(getter) {
  let value
  let dirty = true  // 是否需要重新计算
  
  const effect = () => {
    value = getter()
    dirty = false
  }
  
  return {
    get value() {
      if (dirty) {
        effect()
      }
      return value
    }
  }
}
```

### 5.3 watch 的依赖追踪

```javascript
// watch 监听特定数据
function watch(source, callback) {
  let oldValue
  
  effect(() => {
    const newValue = source()
    if (newValue !== oldValue) {
      callback(newValue, oldValue)
      oldValue = newValue
    }
  })
}
```

## 六、依赖清理

### 6.1 为什么需要清理

```javascript
const state = reactive({ show: true, count: 0 })

effect(() => {
  if (state.show) {
    console.log(state.count)
  }
})

// 当 show 变为 false 后
// count 的变化不应该再触发 effect
// 需要清理旧的依赖关系
```

### 6.2 清理机制

```javascript
// Vue 3 的做法：每次执行 effect 前，先清理旧依赖
function effect(fn) {
  const effectFn = () => {
    // 清理旧依赖
    cleanup(effectFn)
    
    activeEffect = effectFn
    fn()
    activeEffect = null
  }
  
  effectFn.deps = []  // 存储关联的依赖集合
  effectFn()
}

function cleanup(effectFn) {
  effectFn.deps.forEach(dep => {
    dep.delete(effectFn)
  })
  effectFn.deps.length = 0
}
```

## 七、调度器

### 7.1 问题：频繁更新

```javascript
const state = reactive({ count: 0 })

effect(() => {
  console.log(state.count)
})

// 连续修改会触发多次
state.count = 1
state.count = 2
state.count = 3
// 输出 3 次？太浪费了！
```

### 7.2 解决：批量更新

```javascript
// Vue 使用调度器来批量更新
const queue = new Set()
let isFlushing = false

function queueJob(job) {
  queue.add(job)
  
  if (!isFlushing) {
    isFlushing = true
    Promise.resolve().then(flushJobs)
  }
}

function flushJobs() {
  queue.forEach(job => job())
  queue.clear()
  isFlushing = false
}
```

## 八、总结

| 概念 | 说明 |
|------|------|
| Effect | 使用响应式数据的函数 |
| Track | 读取数据时收集依赖 |
| Trigger | 修改数据时触发更新 |
| 依赖清理 | 避免过期依赖 |
| 调度器 | 批量执行更新 |

## 参考资料

- [响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue 3 源码 - reactivity](https://github.com/vuejs/core/tree/main/packages/reactivity)

---

**下一节** → [第 18 节：Vue2 vs Vue3 响应式](./18-reactivity-compare.md)
