# 第 25 节：reactive 实现

## 概述

`reactive()` 是 Vue 3 响应式系统的核心 API，使用 Proxy 将普通对象转换为响应式对象。本节深入分析其实现原理。

## 一、基本实现

### 1.1 最简实现

```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      // 依赖收集
      track(target, key)
      return res
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key)
      }
      return result
    }
  })
}
```

### 1.2 为什么用 Reflect

```javascript
// Reflect 可以正确处理 this 指向
const obj = {
  _name: 'Vue',
  get name() {
    return this._name
  }
}

const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    // 使用 Reflect.get 传入 receiver
    // 保证 getter 中的 this 指向 proxy
    return Reflect.get(target, key, receiver)
  }
})

proxy.name  // 正确访问 _name
```

## 二、完整实现

### 2.1 reactive 函数

```javascript
// 存储已创建的代理
const reactiveMap = new WeakMap()

function reactive(target) {
  // 只能代理对象
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${target}`)
    return target
  }
  
  // 如果已经是响应式对象，直接返回
  if (isReactive(target)) {
    return target
  }
  
  // 如果已有缓存的代理，返回缓存
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  
  // 创建代理
  const proxy = new Proxy(target, mutableHandlers)
  
  // 缓存代理
  reactiveMap.set(target, proxy)
  
  return proxy
}

function isObject(val) {
  return val !== null && typeof val === 'object'
}
```

### 2.2 代理处理器

```javascript
const mutableHandlers = {
  get(target, key, receiver) {
    // 特殊 key 处理
    if (key === '__v_isReactive') {
      return true
    }
    if (key === '__v_raw') {
      return target
    }
    
    const res = Reflect.get(target, key, receiver)
    
    // 依赖收集
    track(target, key)
    
    // 嵌套对象递归代理（惰性）
    if (isObject(res)) {
      return reactive(res)
    }
    
    return res
  },
  
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const hadKey = hasOwn(target, key)
    
    const result = Reflect.set(target, key, value, receiver)
    
    // 只在值真正变化时触发更新
    if (!hadKey) {
      // 新增属性
      trigger(target, 'add', key)
    } else if (hasChanged(value, oldValue)) {
      // 修改属性
      trigger(target, 'set', key)
    }
    
    return result
  },
  
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key)
    const result = Reflect.deleteProperty(target, key)
    
    if (hadKey && result) {
      trigger(target, 'delete', key)
    }
    
    return result
  },
  
  has(target, key) {
    const result = Reflect.has(target, key)
    track(target, key)
    return result
  },
  
  ownKeys(target) {
    // 遍历操作的依赖收集
    track(target, Array.isArray(target) ? 'length' : Symbol('iterate'))
    return Reflect.ownKeys(target)
  }
}

function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue)
}
```

## 三、依赖收集（track）

### 3.1 数据结构

```
targetMap: WeakMap<target, Map<key, Set<effect>>>

targetMap
└── target (原始对象)
    └── depsMap: Map
        └── key (属性名)
            └── dep: Set<effect>
```

### 3.2 track 实现

```javascript
const targetMap = new WeakMap()
let activeEffect = null

function track(target, key) {
  // 没有活动的 effect，不需要收集
  if (!activeEffect) return
  
  // 获取 target 对应的 depsMap
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  // 获取 key 对应的 dep
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  // 添加当前 effect
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    // 双向记录，用于清理
    activeEffect.deps.push(dep)
  }
}
```

## 四、触发更新（trigger）

### 4.1 trigger 实现

```javascript
function trigger(target, type, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  // 收集需要执行的 effect
  const effects = new Set()
  
  const add = (dep) => {
    if (dep) {
      dep.forEach(effect => {
        // 避免无限循环
        if (effect !== activeEffect) {
          effects.add(effect)
        }
      })
    }
  }
  
  // 根据操作类型收集 effect
  if (key !== undefined) {
    add(depsMap.get(key))
  }
  
  // 数组长度变化
  if (type === 'add' && Array.isArray(target)) {
    add(depsMap.get('length'))
  }
  
  // 执行所有 effect
  effects.forEach(effect => {
    if (effect.scheduler) {
      // 有调度器，交给调度器处理
      effect.scheduler(effect)
    } else {
      // 直接执行
      effect.run()
    }
  })
}
```

## 五、嵌套对象处理

### 5.1 惰性代理

```javascript
// Vue 3 采用惰性代理
// 只有访问时才递归代理嵌套对象

const obj = reactive({
  nested: {
    deep: {
      value: 1
    }
  }
})

// 此时 nested 和 deep 还不是代理
// 访问时才会代理
obj.nested.deep.value  // 触发代理
```

### 5.2 实现细节

```javascript
get(target, key, receiver) {
  const res = Reflect.get(target, key, receiver)
  
  track(target, key)
  
  // 如果是对象，递归代理
  if (isObject(res)) {
    // 惰性：只在访问时代理
    return reactive(res)
  }
  
  return res
}
```

## 六、数组处理

### 6.1 数组方法重写

```javascript
const arrayInstrumentations = {}

// 查找类方法需要特殊处理
['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  arrayInstrumentations[method] = function(...args) {
    // 先在代理对象上查找
    const res = Array.prototype[method].apply(this, args)
    
    if (res === -1 || res === false) {
      // 找不到，用原始数组再找一次
      return Array.prototype[method].apply(toRaw(this), args)
    }
    
    return res
  }
})

// 修改长度的方法需要暂停追踪
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  arrayInstrumentations[method] = function(...args) {
    // 暂停追踪，避免无限循环
    pauseTracking()
    const res = Array.prototype[method].apply(this, args)
    resetTracking()
    return res
  }
})
```

### 6.2 在 get 中应用

```javascript
get(target, key, receiver) {
  // 数组方法特殊处理
  if (Array.isArray(target) && hasOwn(arrayInstrumentations, key)) {
    return Reflect.get(arrayInstrumentations, key, receiver)
  }
  
  // 正常处理...
}
```

## 七、只读代理

### 7.1 readonly 实现

```javascript
function readonly(target) {
  return new Proxy(target, readonlyHandlers)
}

const readonlyHandlers = {
  get(target, key, receiver) {
    if (key === '__v_isReadonly') {
      return true
    }
    
    const res = Reflect.get(target, key, receiver)
    
    // 只读不需要收集依赖
    // track(target, key)
    
    // 嵌套对象也是只读
    if (isObject(res)) {
      return readonly(res)
    }
    
    return res
  },
  
  set(target, key) {
    console.warn(`Set operation on key "${key}" failed: target is readonly.`)
    return true
  },
  
  deleteProperty(target, key) {
    console.warn(`Delete operation on key "${key}" failed: target is readonly.`)
    return true
  }
}
```

### 7.2 shallowReadonly

```javascript
// 浅只读：只有第一层只读
function shallowReadonly(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      if (key === '__v_isReadonly') return true
      // 不递归代理嵌套对象
      return Reflect.get(target, key, receiver)
    },
    set() {
      console.warn('target is readonly')
      return true
    }
  })
}
```

## 八、工具函数

### 8.1 判断函数

```javascript
function isReactive(value) {
  return !!(value && value.__v_isReactive)
}

function isReadonly(value) {
  return !!(value && value.__v_isReadonly)
}

function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}
```

### 8.2 toRaw

```javascript
function toRaw(observed) {
  const raw = observed && observed.__v_raw
  return raw ? toRaw(raw) : observed
}
```

### 8.3 markRaw

```javascript
function markRaw(value) {
  // 标记对象不应被代理
  Object.defineProperty(value, '__v_skip', { value: true })
  return value
}

// 在 reactive 中检查
function reactive(target) {
  if (target.__v_skip) {
    return target
  }
  // ...
}
```

## 九、总结

| 概念 | 说明 |
|------|------|
| Proxy | 拦截对象操作 |
| Reflect | 正确处理 this |
| track | 依赖收集 |
| trigger | 触发更新 |
| 惰性代理 | 访问时才代理嵌套对象 |
| readonly | 只读代理 |

## 参考资料

- [Vue 3 reactivity 源码](https://github.com/vuejs/core/tree/main/packages/reactivity)

---

**下一节** → [第 26 节：ref 实现](./26-ref-impl.md)
