# 第 27 节：effect 与调度

## 概述

`effect` 是 Vue 响应式系统的核心，负责执行副作用函数并自动追踪依赖。调度器（scheduler）控制更新时机，实现批量更新和异步更新。

## 一、effect 基本实现

### 1.1 最简实现

```javascript
let activeEffect = null

function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn
    fn()
    activeEffect = null
  }
  
  effectFn()
  return effectFn
}

// 使用
const state = reactive({ count: 0 })

effect(() => {
  console.log(state.count)  // 自动追踪依赖
})

state.count++  // 自动重新执行 effect
```

### 1.2 ReactiveEffect 类

```javascript
class ReactiveEffect {
  active = true
  deps = []
  parent = undefined
  
  constructor(fn, scheduler = null) {
    this.fn = fn
    this.scheduler = scheduler
  }
  
  run() {
    if (!this.active) {
      return this.fn()
    }
    
    // 设置当前活动 effect
    let parent = activeEffect
    activeEffect = this
    this.parent = parent
    
    // 清理旧依赖
    cleanupEffect(this)
    
    try {
      // 执行副作用函数
      return this.fn()
    } finally {
      // 恢复上一个 effect
      activeEffect = this.parent
      this.parent = undefined
    }
  }
  
  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  const { deps } = effect
  for (const dep of deps) {
    dep.delete(effect)
  }
  deps.length = 0
}
```

## 二、依赖清理

### 2.1 为什么需要清理

```javascript
const state = reactive({ show: true, name: 'Vue' })

effect(() => {
  if (state.show) {
    console.log(state.name)
  }
})

// 当 show 变为 false 后
state.show = false
// name 的变化不应该再触发 effect
// 需要清理旧的依赖关系
```

### 2.2 双向记录

```javascript
// effect 记录它依赖的 dep
effect.deps = [dep1, dep2, ...]

// dep 记录依赖它的 effect
dep = Set([effect1, effect2, ...])

// 清理时：遍历 effect.deps，从每个 dep 中删除 effect
function cleanupEffect(effect) {
  for (const dep of effect.deps) {
    dep.delete(effect)  // 从 dep 中移除 effect
  }
  effect.deps.length = 0  // 清空 deps 数组
}
```

## 三、嵌套 effect

### 3.1 问题

```javascript
effect(() => {
  console.log('outer')
  
  effect(() => {
    console.log('inner')
  })
  
  // 内层 effect 执行后，activeEffect 被清空
  // 外层 effect 的后续代码无法正确收集依赖
})
```

### 3.2 解决：effect 栈

```javascript
class ReactiveEffect {
  run() {
    // 保存父级 effect
    let parent = activeEffect
    activeEffect = this
    this.parent = parent
    
    try {
      return this.fn()
    } finally {
      // 恢复父级 effect
      activeEffect = this.parent
    }
  }
}
```

## 四、调度器

### 4.1 基本概念

```javascript
// 没有调度器：数据变化立即执行 effect
state.count = 1  // 立即执行
state.count = 2  // 立即执行
state.count = 3  // 立即执行
// 执行了 3 次

// 有调度器：控制执行时机
const effect = new ReactiveEffect(fn, scheduler)
// 数据变化时调用 scheduler，由 scheduler 决定何时执行
```

### 4.2 调度器实现

```javascript
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  
  // 立即执行
  if (!options.lazy) {
    _effect.run()
  }
  
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

// 触发更新时
function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      // 有调度器，交给调度器处理
      effect.scheduler()
    } else {
      // 没有调度器，直接执行
      effect.run()
    }
  }
}
```

## 五、Vue 的任务调度

### 5.1 任务队列

```javascript
const queue = []
let isFlushing = false
let isFlushPending = false
const resolvedPromise = Promise.resolve()

function queueJob(job) {
  // 避免重复添加
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    // 在微任务中执行
    resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  isFlushing = true
  
  // 按 id 排序（父组件先于子组件）
  queue.sort((a, b) => getId(a) - getId(b))
  
  try {
    for (const job of queue) {
      job()
    }
  } finally {
    queue.length = 0
    isFlushing = false
  }
}
```

### 5.2 组件更新调度

```javascript
// 组件更新使用调度器
function setupRenderEffect(instance) {
  const componentUpdateFn = () => {
    // 渲染逻辑
  }
  
  const effect = new ReactiveEffect(componentUpdateFn, () => {
    // 调度器：将更新任务加入队列
    queueJob(instance.update)
  })
  
  instance.update = effect.run.bind(effect)
}
```

### 5.3 批量更新效果

```javascript
const state = reactive({ count: 0 })

// 组件的渲染 effect
effect(() => {
  console.log('render:', state.count)
}, {
  scheduler: () => queueJob(effect.run)
})

// 同步修改多次
state.count = 1
state.count = 2
state.count = 3

// 只渲染一次（在微任务中）
// 输出：render: 3
```

## 六、Pre/Post 队列

### 6.1 不同时机的任务

```javascript
const pendingPreFlushCbs = []   // DOM 更新前
const pendingPostFlushCbs = []  // DOM 更新后

function queuePreFlushCb(cb) {
  pendingPreFlushCbs.push(cb)
  queueFlush()
}

function queuePostFlushCb(cb) {
  pendingPostFlushCbs.push(cb)
  queueFlush()
}

function flushJobs() {
  // 1. 执行 pre 队列（如 watch 的 flush: 'pre'）
  flushPreFlushCbs()
  
  // 2. 执行主队列（组件更新）
  for (const job of queue) {
    job()
  }
  
  // 3. 执行 post 队列（如 mounted、updated 钩子）
  flushPostFlushCbs()
}
```

### 6.2 watch 的 flush 选项

```javascript
watch(source, callback, {
  flush: 'pre'   // 组件更新前执行（默认）
  // flush: 'post'  // 组件更新后执行
  // flush: 'sync'  // 同步执行
})

// 实现
function doWatch(source, cb, { flush }) {
  let scheduler
  
  if (flush === 'sync') {
    // 同步：直接执行
    scheduler = () => cb()
  } else if (flush === 'post') {
    // post：加入 post 队列
    scheduler = () => queuePostFlushCb(cb)
  } else {
    // pre：加入 pre 队列
    scheduler = () => queuePreFlushCb(cb)
  }
  
  const effect = new ReactiveEffect(getter, scheduler)
}
```

## 七、nextTick

### 7.1 实现

```javascript
const resolvedPromise = Promise.resolve()
let currentFlushPromise = null

function nextTick(fn) {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(fn) : p
}

// 在 queueFlush 中设置 promise
function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}
```

### 7.2 使用

```javascript
import { nextTick } from 'vue'

async function update() {
  state.count++
  
  // DOM 还没更新
  console.log(el.textContent)  // 旧值
  
  await nextTick()
  
  // DOM 已更新
  console.log(el.textContent)  // 新值
}
```

## 八、computed 的调度

### 8.1 lazy effect

```javascript
function computed(getter) {
  let value
  let dirty = true
  
  const effect = new ReactiveEffect(getter, () => {
    // 调度器：标记为脏，而不是立即执行
    if (!dirty) {
      dirty = true
      // 触发依赖 computed 的 effect
      triggerRefValue(cRef)
    }
  })
  
  const cRef = {
    get value() {
      if (dirty) {
        value = effect.run()
        dirty = false
      }
      trackRefValue(cRef)
      return value
    }
  }
  
  return cRef
}
```

### 8.2 computed 缓存机制

```
依赖变化
    ↓
调度器执行，dirty = true（不执行 getter）
    ↓
访问 computed.value
    ↓
dirty 为 true，执行 getter
    ↓
返回新值，dirty = false
```

## 九、effect 选项

### 9.1 完整选项

```javascript
effect(fn, {
  lazy: false,      // 是否延迟执行
  scheduler: null,  // 调度器函数
  onStop: null,     // 停止时回调
  onTrack: null,    // 追踪依赖时回调（调试）
  onTrigger: null   // 触发更新时回调（调试）
})
```

### 9.2 停止 effect

```javascript
const runner = effect(() => {
  console.log(state.count)
})

// 停止响应
runner.effect.stop()

state.count++  // 不再触发
```

## 十、总结

| 概念 | 说明 |
|------|------|
| effect | 副作用函数，自动追踪依赖 |
| scheduler | 调度器，控制更新时机 |
| queueJob | 任务队列，批量更新 |
| nextTick | 等待 DOM 更新完成 |
| flush | watch 执行时机 |

## 参考资料

- [Vue 3 effect 源码](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts)
- [Vue 3 scheduler 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts)

---

**下一节** → [第 28 节：渲染器架构](./28-renderer-arch.md)
