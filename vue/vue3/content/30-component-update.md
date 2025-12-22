# 第 30 节：组件更新机制

## 概述

组件更新是 Vue 响应式系统的最终目标。当响应式数据变化时，Vue 通过调度器批量执行组件更新，最小化 DOM 操作。

## 一、更新触发流程

```
响应式数据变化
      ↓
trigger 触发依赖
      ↓
组件的渲染 effect 被调度
      ↓
queueJob 加入更新队列
      ↓
微任务中批量执行
      ↓
重新执行渲染函数
      ↓
Diff + Patch
      ↓
DOM 更新
```

## 二、组件更新实现

### 2.1 setupRenderEffect

```javascript
function setupRenderEffect(instance, vnode, container, anchor) {
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      // 首次挂载...
    } else {
      // ===== 更新 =====
      
      // 调用 beforeUpdate 钩子
      const { bu, u } = instance
      if (bu) {
        invokeArrayFns(bu)
      }
      
      // 获取新的子树
      const nextTree = renderComponentRoot(instance)
      const prevTree = instance.subTree
      instance.subTree = nextTree
      
      // Diff + Patch
      patch(
        prevTree,
        nextTree,
        hostParentNode(prevTree.el),
        getNextHostNode(prevTree),
        instance
      )
      
      // 更新组件根元素引用
      vnode.el = nextTree.el
      
      // 调用 updated 钩子
      if (u) {
        queuePostFlushCb(u)
      }
    }
  }
  
  // 创建响应式 effect
  const effect = new ReactiveEffect(
    componentUpdateFn,
    // 调度器：不立即执行，加入队列
    () => queueJob(instance.update)
  )
  
  // 绑定更新函数
  const update = (instance.update = effect.run.bind(effect))
  update.id = instance.uid
  
  // 首次执行
  update()
}
```

### 2.2 批量更新

```javascript
const state = reactive({ count: 0 })

// 同步修改多次
state.count = 1  // 调度 update
state.count = 2  // 调度 update（已在队列中，不重复添加）
state.count = 3  // 调度 update（已在队列中，不重复添加）

// 微任务中只执行一次更新
// 渲染结果：count = 3
```

## 三、Props 更新

### 3.1 父组件触发子组件更新

```javascript
// 父组件数据变化
// 重新渲染，生成新的子组件 VNode
// 子组件 VNode 的 props 变化

function updateComponent(n1, n2) {
  const instance = (n2.component = n1.component)
  
  // 检查是否需要更新
  if (shouldUpdateComponent(n1, n2)) {
    // 保存新的 VNode
    instance.next = n2
    // 触发子组件更新
    instance.update()
  } else {
    // 不需要更新，复用
    n2.el = n1.el
    instance.vnode = n2
  }
}

function shouldUpdateComponent(n1, n2) {
  const { props: prevProps, children: prevChildren } = n1
  const { props: nextProps, children: nextChildren } = n2
  
  // 有插槽子节点，需要更新
  if (prevChildren || nextChildren) {
    return true
  }
  
  // props 没变，不需要更新
  if (prevProps === nextProps) {
    return false
  }
  
  // 检查 props 是否变化
  return hasPropsChanged(prevProps, nextProps)
}
```

### 3.2 Props 更新处理

```javascript
function updateComponentPreRender(instance, nextVNode) {
  // 更新 VNode
  instance.vnode = nextVNode
  instance.next = null
  
  // 更新 props
  updateProps(instance, nextVNode.props)
  
  // 更新 slots
  updateSlots(instance, nextVNode.children)
}

// 在组件更新函数中
const componentUpdateFn = () => {
  if (!instance.isMounted) {
    // 挂载...
  } else {
    let { next, vnode } = instance
    
    if (next) {
      // 有新的 VNode，先更新 props
      updateComponentPreRender(instance, next)
    }
    
    // 然后重新渲染
    const nextTree = renderComponentRoot(instance)
    // ...
  }
}
```

## 四、强制更新

### 4.1 $forceUpdate

```javascript
// 组件实例上的 $forceUpdate
instance.proxy.$forceUpdate = () => {
  if (instance.update) {
    instance.update()
  }
}
```

### 4.2 使用场景

```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()

// 非响应式数据变化后强制更新
let nonReactiveData = { value: 0 }

function updateNonReactive() {
  nonReactiveData.value++
  instance.proxy.$forceUpdate()
}
</script>
```

## 五、异步更新队列

### 5.1 队列实现

```javascript
const queue = []
let isFlushing = false
let isFlushPending = false

function queueJob(job) {
  // 去重
  if (!queue.includes(job)) {
    // 按 id 排序插入（保证父组件先更新）
    if (job.id == null) {
      queue.push(job)
    } else {
      const i = findInsertionIndex(job.id)
      queue.splice(i, 0, job)
    }
    
    queueFlush()
  }
}

function findInsertionIndex(id) {
  let start = 0
  let end = queue.length
  
  while (start < end) {
    const middle = (start + end) >>> 1
    const middleJobId = getId(queue[middle])
    middleJobId < id ? (start = middle + 1) : (end = middle)
  }
  
  return start
}
```

### 5.2 执行队列

```javascript
function flushJobs() {
  isFlushPending = false
  isFlushing = true
  
  // 排序确保：
  // 1. 父组件先于子组件更新
  // 2. 组件卸载先于更新
  queue.sort((a, b) => getId(a) - getId(b))
  
  try {
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i]
      if (job && job.active !== false) {
        job()
      }
    }
  } finally {
    queue.length = 0
    isFlushing = false
    
    // 执行 post 队列（mounted、updated 等）
    flushPostFlushCbs()
  }
}
```

## 六、更新优化

### 6.1 PatchFlags 优化

```javascript
// 编译时标记动态内容
const vnode = createVNode('div', { id: 'app' }, [
  createVNode('p', null, ctx.text, PatchFlags.TEXT),
  createVNode('p', { class: ctx.cls }, 'static', PatchFlags.CLASS)
])

// 更新时只检查标记的内容
function patchElement(n1, n2) {
  const patchFlag = n2.patchFlag
  
  if (patchFlag > 0) {
    if (patchFlag & PatchFlags.TEXT) {
      // 只更新文本
      if (n1.children !== n2.children) {
        hostSetElementText(el, n2.children)
      }
    }
    if (patchFlag & PatchFlags.CLASS) {
      // 只更新 class
      if (n1.props.class !== n2.props.class) {
        hostPatchProp(el, 'class', null, n2.props.class)
      }
    }
    // ...
  } else {
    // 没有标记，完整对比
    patchProps(el, n1.props, n2.props)
  }
}
```

### 6.2 Block 优化

```javascript
// Block 收集动态节点
// 更新时只遍历动态节点，跳过静态节点

function patchBlockChildren(oldChildren, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    const oldVNode = oldChildren[i]
    const newVNode = newChildren[i]
    
    // 直接 patch 动态节点，不需要遍历整棵树
    patch(oldVNode, newVNode, ...)
  }
}
```

## 七、组件更新边界

### 7.1 shouldComponentUpdate

```javascript
// Vue 3 中没有 shouldComponentUpdate
// 但可以通过 memo 或手动控制实现类似效果

import { defineComponent, h } from 'vue'

const MemoComponent = defineComponent({
  props: ['value'],
  
  setup(props) {
    let prevValue = props.value
    let cachedVNode = null
    
    return () => {
      // 手动判断是否需要更新
      if (props.value === prevValue && cachedVNode) {
        return cachedVNode
      }
      
      prevValue = props.value
      cachedVNode = h('div', props.value)
      return cachedVNode
    }
  }
})
```

### 7.2 v-memo 指令

```vue
<template>
  <!-- 只有当 id 或 selected 变化时才更新 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, selected === item.id]">
    <p>ID: {{ item.id }} - selected: {{ selected === item.id }}</p>
  </div>
</template>
```

## 八、更新调试

### 8.1 onRenderTriggered

```vue
<script setup>
import { onRenderTriggered } from 'vue'

onRenderTriggered((event) => {
  console.log('触发更新:', event)
  // { effect, target, type, key, newValue, oldValue }
})
</script>
```

### 8.2 性能分析

```javascript
// Vue Devtools 中查看组件更新
// 或使用 Performance API

const start = performance.now()
state.count++
await nextTick()
const end = performance.now()
console.log(`更新耗时: ${end - start}ms`)
```

## 九、总结

| 概念 | 说明 |
|------|------|
| 触发更新 | 响应式数据变化 → trigger |
| 调度 | queueJob 批量处理 |
| 执行顺序 | 父组件先于子组件 |
| 优化 | PatchFlags、Block、v-memo |
| 钩子 | beforeUpdate、updated |

## 参考资料

- [Vue 3 renderer 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)
- [Vue 3 scheduler 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts)

---

**下一节** → [第 31 节：setup 函数](./31-setup-impl.md)
