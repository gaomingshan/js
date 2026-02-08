# 第 18 节：Vue2 vs Vue3 响应式

## 概述

Vue 2 使用 `Object.defineProperty`，Vue 3 使用 `Proxy` 实现响应式。这是 Vue 3 最重要的底层改变之一，带来了更好的性能和更少的限制。

## 一、实现方式对比

### 1.1 Vue 2：Object.defineProperty

```javascript
// Vue 2 响应式原理
function defineReactive(obj, key) {
  let value = obj[key]
  const dep = []  // 存储依赖
  
  Object.defineProperty(obj, key, {
    get() {
      // 收集依赖
      if (currentEffect) dep.push(currentEffect)
      return value
    },
    set(newValue) {
      value = newValue
      // 触发更新
      dep.forEach(effect => effect())
    }
  })
}

// 需要遍历所有属性
function observe(obj) {
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key)
  })
}
```

### 1.2 Vue 3：Proxy

```javascript
// Vue 3 响应式原理
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      // 触发更新
      trigger(target, key)
      return result
    }
  })
}
```

## 二、核心差异

### 2.1 对比表

| 特性 | Vue 2 (defineProperty) | Vue 3 (Proxy) |
|------|------------------------|---------------|
| 监听新增属性 | ❌ 不支持 | ✅ 支持 |
| 监听删除属性 | ❌ 不支持 | ✅ 支持 |
| 监听数组索引 | ❌ 不支持 | ✅ 支持 |
| 监听数组长度 | ❌ 不支持 | ✅ 支持 |
| 初始化性能 | 遍历所有属性 | 惰性代理 |
| 内存占用 | 每个属性一个闭包 | 整个对象一个代理 |
| 浏览器支持 | IE9+ | 不支持 IE |

### 2.2 API 差异

```javascript
// Vue 2
import Vue from 'vue'

export default {
  data() {
    return { user: { name: 'Vue' } }
  },
  methods: {
    addAge() {
      // ❌ 直接添加不是响应式的
      this.user.age = 18
      
      // ✅ 需要使用 Vue.set
      Vue.set(this.user, 'age', 18)
      // 或 this.$set(this.user, 'age', 18)
    }
  }
}

// Vue 3
import { reactive } from 'vue'

const user = reactive({ name: 'Vue' })

// ✅ 直接添加就是响应式的
user.age = 18
```

## 三、Vue 2 的限制

### 3.1 对象属性

```javascript
// Vue 2
const state = Vue.observable({ count: 0 })

// ❌ 新增属性不是响应式
state.newProp = 'value'  // 视图不会更新

// ❌ 删除属性不会触发更新
delete state.count  // 视图不会更新

// ✅ 必须使用特殊 API
Vue.set(state, 'newProp', 'value')
Vue.delete(state, 'count')
```

### 3.2 数组操作

```javascript
// Vue 2
const state = Vue.observable({ items: ['a', 'b', 'c'] })

// ❌ 通过索引修改不是响应式
state.items[0] = 'x'  // 视图不会更新

// ❌ 修改长度不是响应式
state.items.length = 0  // 视图不会更新

// ✅ 必须使用特殊方法
Vue.set(state.items, 0, 'x')
state.items.splice(0)

// ✅ 这些数组方法被重写了，可以触发更新
state.items.push('d')
state.items.pop()
state.items.shift()
state.items.unshift('z')
state.items.splice(1, 1)
state.items.sort()
state.items.reverse()
```

### 3.3 根级响应式属性

```javascript
// Vue 2
export default {
  data() {
    return { user: null }
  },
  methods: {
    // ❌ 直接替换整个对象，新对象的属性不是预先定义的
    fetchUser() {
      // 这里获取的 user 对象，其属性是响应式的
      // 因为 Vue 会递归处理 data 返回的对象
      this.user = { name: 'Vue', age: 3 }
    }
  }
}
```

## 四、Vue 3 的改进

### 4.1 对象操作

```javascript
// Vue 3
import { reactive } from 'vue'

const state = reactive({ count: 0 })

// ✅ 新增属性自动是响应式
state.newProp = 'value'  // 视图自动更新

// ✅ 删除属性自动触发更新
delete state.count  // 视图自动更新
```

### 4.2 数组操作

```javascript
// Vue 3
import { reactive } from 'vue'

const state = reactive({ items: ['a', 'b', 'c'] })

// ✅ 通过索引修改
state.items[0] = 'x'  // 视图自动更新

// ✅ 修改长度
state.items.length = 0  // 视图自动更新

// ✅ 所有数组方法都能正常触发更新
state.items.push('d')
```

### 4.3 Map/Set 支持

```javascript
// Vue 3 支持 Map 和 Set
import { reactive } from 'vue'

const map = reactive(new Map())
map.set('key', 'value')  // 响应式

const set = reactive(new Set())
set.add('item')  // 响应式
```

## 五、性能对比

### 5.1 初始化性能

```javascript
// Vue 2：必须遍历所有属性
// 对于大对象，初始化开销大
function observe(obj) {
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key)
    if (typeof obj[key] === 'object') {
      observe(obj[key])  // 递归处理嵌套对象
    }
  })
}

// Vue 3：惰性代理
// 只有访问时才会代理嵌套对象
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const value = target[key]
      // 访问时才递归代理
      if (typeof value === 'object') {
        return reactive(value)
      }
      return value
    }
  })
}
```

### 5.2 内存占用

```
Vue 2:
每个响应式属性 = 一个闭包（存储 value 和 dep）
大对象 = 很多闭包 = 内存占用高

Vue 3:
整个对象 = 一个 Proxy
嵌套对象 = 按需创建 Proxy
内存占用更低
```

## 六、Proxy 的优势

### 6.1 拦截更多操作

```javascript
const handler = {
  get(target, key) { },           // 读取属性
  set(target, key, value) { },    // 设置属性
  deleteProperty(target, key) { }, // 删除属性
  has(target, key) { },           // in 操作符
  ownKeys(target) { },            // Object.keys 等
  // ... 还有更多
}
```

### 6.2 代理整个对象

```javascript
// defineProperty 需要逐个属性定义
Object.keys(obj).forEach(key => {
  Object.defineProperty(obj, key, { /* ... */ })
})

// Proxy 一次代理整个对象
new Proxy(obj, handler)
```

## 七、兼容性考虑

### 7.1 浏览器支持

```
Proxy 支持：
✅ Chrome 49+
✅ Firefox 18+
✅ Safari 10+
✅ Edge 12+
❌ IE（所有版本）

defineProperty 支持：
✅ Chrome 5+
✅ Firefox 4+
✅ Safari 5.1+
✅ IE 9+
```

### 7.2 如果需要支持 IE

```javascript
// 方案 1：使用 Vue 2
// 方案 2：使用 Vue 2.7（包含 Composition API）
// 方案 3：放弃 IE 支持（推荐）
```

## 八、迁移注意事项

### 8.1 移除的 API

```javascript
// Vue 2
Vue.set(obj, key, value)
Vue.delete(obj, key)
this.$set(obj, key, value)
this.$delete(obj, key)

// Vue 3：不再需要，直接操作即可
obj.key = value
delete obj.key
```

### 8.2 行为变化

```javascript
// Vue 2：data 中未声明的属性不是响应式
// Vue 3：reactive() 包装的对象，新增属性自动响应式

// Vue 2：数组索引赋值不触发更新
// Vue 3：数组索引赋值正常触发更新
```

## 九、总结

| 方面 | Vue 2 | Vue 3 |
|------|-------|-------|
| 实现 | defineProperty | Proxy |
| 新增属性 | 需要 Vue.set | 自动响应 |
| 数组索引 | 不支持 | 支持 |
| 性能 | 初始化遍历 | 惰性代理 |
| IE 支持 | 支持 | 不支持 |
| API | Vue.set/delete | 直接操作 |

## 参考资料

- [Vue 3 迁移指南 - 响应式](https://v3-migration.vuejs.org/breaking-changes/reactivity.html)
- [MDN - Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

---

**下一节** → [第 19 节：虚拟 DOM 概念](./19-vdom-concept.md)
