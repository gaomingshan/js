# 第 16 节：响应式概念

## 概述

响应式是 Vue 的核心特性：当数据变化时，视图自动更新。理解响应式的概念和原理，是深入 Vue 的第一步。

## 一、什么是响应式

### 1.1 直觉理解

```
┌─────────────────────────────────────────────────────────────┐
│                     响应式的本质                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   传统方式：手动更新 DOM                                     │
│   ┌─────────────┐         ┌─────────────┐                  │
│   │   数据变化   │ ──手动──▶│  更新 DOM   │                  │
│   └─────────────┘         └─────────────┘                  │
│                                                             │
│   响应式：自动更新 DOM                                       │
│   ┌─────────────┐         ┌─────────────┐                  │
│   │   数据变化   │ ──自动──▶│  更新 DOM   │                  │
│   └─────────────┘         └─────────────┘                  │
│                                                             │
│   你只需关心数据，Vue 负责更新视图                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 对比示例

```javascript
// 传统方式：手动更新
let count = 0
document.getElementById('count').textContent = count

function increment() {
  count++
  // 必须手动更新 DOM
  document.getElementById('count').textContent = count
}

// Vue 响应式：自动更新
const count = ref(0)

function increment() {
  count.value++
  // DOM 自动更新，无需手动操作
}
```

## 二、响应式的核心问题

### 2.1 如何知道数据变了

```javascript
// 问题：JavaScript 无法直接监听变量变化
let count = 0
count = 1  // 如何知道 count 变了？

// 解决：用特殊的方式包装数据，拦截读写操作
```

### 2.2 Vue 的解决方案

```
┌─────────────────────────────────────────────────────────────┐
│                   拦截数据的读写                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   读取数据时 (getter)                                        │
│   └── 记录：谁在使用这个数据？（依赖收集）                    │
│                                                             │
│   修改数据时 (setter)                                        │
│   └── 通知：告诉所有使用者，数据变了！（触发更新）           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 三、实现响应式的方式

### 3.1 Vue 2：Object.defineProperty

```javascript
// Vue 2 的响应式原理（简化）
function reactive(obj) {
  Object.keys(obj).forEach(key => {
    let value = obj[key]
    
    Object.defineProperty(obj, key, {
      get() {
        console.log('读取', key)
        // 这里进行依赖收集
        return value
      },
      set(newValue) {
        console.log('修改', key, '为', newValue)
        value = newValue
        // 这里触发更新
      }
    })
  })
  return obj
}

const state = reactive({ count: 0 })
state.count      // 触发 getter
state.count = 1  // 触发 setter
```

### 3.2 Vue 3：Proxy

```javascript
// Vue 3 的响应式原理（简化）
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      console.log('读取', key)
      // 依赖收集
      return target[key]
    },
    set(target, key, value) {
      console.log('修改', key, '为', value)
      target[key] = value
      // 触发更新
      return true
    }
  })
}

const state = reactive({ count: 0 })
state.count      // 触发 get
state.count = 1  // 触发 set
```

## 四、Vue 2 vs Vue 3 响应式

### 4.1 对比表

| 特性 | Vue 2 (defineProperty) | Vue 3 (Proxy) |
|------|------------------------|---------------|
| 监听新增属性 | ❌ 需要 `Vue.set` | ✅ 自动监听 |
| 监听数组索引 | ❌ 需要特殊处理 | ✅ 自动监听 |
| 监听数组长度 | ❌ 不支持 | ✅ 支持 |
| 性能 | 初始化时遍历所有属性 | 惰性，访问时才处理 |
| 浏览器支持 | IE9+ | 不支持 IE |

### 4.2 Vue 2 的限制

```javascript
// Vue 2 的问题
const state = reactive({ items: [] })

// ❌ 无法检测：直接通过索引设置
state.items[0] = 'new'

// ❌ 无法检测：新增属性
state.newProp = 'value'

// ✅ 需要使用 Vue.set
Vue.set(state.items, 0, 'new')
Vue.set(state, 'newProp', 'value')
```

### 4.3 Vue 3 的改进

```javascript
// Vue 3 没有这些限制
const state = reactive({ items: [] })

// ✅ 可以检测
state.items[0] = 'new'
state.items.length = 0

// ✅ 可以检测
state.newProp = 'value'
```

## 五、响应式系统的组成

### 5.1 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                   响应式系统组成                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 响应式数据 (Reactive Data)                             │
│      └── ref() / reactive() 创建                           │
│                                                             │
│   2. 副作用函数 (Effect)                                    │
│      └── 使用响应式数据的函数                               │
│      └── 如：渲染函数、computed、watch                      │
│                                                             │
│   3. 依赖收集 (Track)                                       │
│      └── 记录哪些 effect 依赖了哪些数据                     │
│                                                             │
│   4. 触发更新 (Trigger)                                     │
│      └── 数据变化时，重新执行相关 effect                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 工作流程

```
用户读取 state.count
        ↓
    触发 getter
        ↓
    依赖收集（track）
    记录：当前 effect 依赖 state.count
        ↓
用户修改 state.count = 1
        ↓
    触发 setter
        ↓
    触发更新（trigger）
    通知所有依赖 state.count 的 effect
        ↓
    effect 重新执行
        ↓
    视图更新
```

## 六、为什么需要 ref

### 6.1 问题：基本类型无法代理

```javascript
// Proxy 只能代理对象
const proxy = new Proxy(0, { /* ... */ })  // ❌ 报错

// 基本类型是按值传递的
let count = 0
let copy = count
copy = 1  // count 不变
```

### 6.2 解决：用对象包装

```javascript
// ref 的原理：用对象包装基本类型
function ref(value) {
  return {
    get value() {
      // 依赖收集
      return value
    },
    set value(newValue) {
      value = newValue
      // 触发更新
    }
  }
}

const count = ref(0)
count.value  // 读取
count.value = 1  // 修改
```

## 七、响应式的边界

### 7.1 什么是响应式的

```javascript
import { ref, reactive, computed, watch } from 'vue'

// ✅ 响应式
const count = ref(0)
const state = reactive({ name: 'Vue' })
const double = computed(() => count.value * 2)

// ❌ 不是响应式（普通变量）
let normalVar = 0
```

### 7.2 响应式丢失的情况

```javascript
const state = reactive({ count: 0 })

// ❌ 解构会丢失响应式
const { count } = state
count++  // 不会触发更新

// ❌ 替换整个对象会丢失响应式
let state2 = reactive({ count: 0 })
state2 = reactive({ count: 1 })  // 原来的响应式丢失

// ✅ 使用 toRefs 保持响应式
const { count } = toRefs(state)
count.value++  // 正常工作
```

## 八、总结

| 概念 | 说明 |
|------|------|
| 响应式 | 数据变化自动触发更新 |
| 实现方式 | Vue 2 用 defineProperty，Vue 3 用 Proxy |
| ref | 包装基本类型为响应式 |
| reactive | 使对象变为响应式 |
| 依赖收集 | 记录谁使用了数据 |
| 触发更新 | 数据变化时通知使用者 |

## 参考资料

- [深入响应式系统](https://vuejs.org/guide/extras/reactivity-in-depth.html)

---

**下一节** → [第 17 节：依赖追踪](./17-dependency-tracking.md)
