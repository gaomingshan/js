# 第 26 节：ref 实现

## 概述

`ref()` 用于创建基本类型的响应式引用。由于 Proxy 只能代理对象，Vue 通过对象包装的方式实现基本类型的响应式。

## 一、为什么需要 ref

### 1.1 问题：基本类型无法代理

```javascript
// Proxy 只能代理对象
new Proxy(0, {})  // 报错

// JavaScript 基本类型是按值传递
let count = 0
let copy = count
copy = 1  // count 不变，无法追踪
```

### 1.2 解决：用对象包装

```javascript
// 将基本类型包装成对象
const ref = { value: 0 }

// 现在可以追踪 .value 的读写
ref.value      // 可以触发 getter
ref.value = 1  // 可以触发 setter
```

## 二、基本实现

### 2.1 最简实现

```javascript
function ref(value) {
  return {
    get value() {
      track(this, 'value')
      return value
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue
        trigger(this, 'value')
      }
    }
  }
}
```

### 2.2 使用 class 实现

```javascript
class RefImpl {
  private _value
  public dep = new Set()
  public __v_isRef = true
  
  constructor(value) {
    this._value = value
  }
  
  get value() {
    trackRefValue(this)
    return this._value
  }
  
  set value(newValue) {
    if (hasChanged(newValue, this._value)) {
      this._value = newValue
      triggerRefValue(this)
    }
  }
}

function ref(value) {
  return new RefImpl(value)
}
```

## 三、完整实现

### 3.1 RefImpl 类

```javascript
class RefImpl {
  private _value
  private _rawValue
  public dep = undefined
  public __v_isRef = true
  
  constructor(value, isShallow = false) {
    // 保存原始值（用于对比）
    this._rawValue = isShallow ? value : toRaw(value)
    // 如果是对象，转换为 reactive
    this._value = isShallow ? value : toReactive(value)
    this.__v_isShallow = isShallow
  }
  
  get value() {
    // 依赖收集
    trackRefValue(this)
    return this._value
  }
  
  set value(newValue) {
    // 使用原始值对比
    const useDirectValue = this.__v_isShallow || isShallow(newValue) || isReadonly(newValue)
    newValue = useDirectValue ? newValue : toRaw(newValue)
    
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = useDirectValue ? newValue : toReactive(newValue)
      // 触发更新
      triggerRefValue(this)
    }
  }
}

function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
```

### 3.2 依赖收集与触发

```javascript
function trackRefValue(ref) {
  if (activeEffect) {
    // ref 直接使用 dep 属性存储依赖
    // 不需要像 reactive 那样用 targetMap
    if (!ref.dep) {
      ref.dep = new Set()
    }
    
    trackEffects(ref.dep)
  }
}

function trackEffects(dep) {
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

function triggerEffects(dep) {
  const effects = [...dep]
  effects.forEach(effect => {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  })
}
```

## 四、ref vs reactive

### 4.1 对象类型的 ref

```javascript
const objRef = ref({ count: 0 })

// ref 内部会将对象转换为 reactive
// objRef._value 是一个 reactive 代理

objRef.value.count++  // 响应式
objRef.value = { count: 1 }  // 替换整个对象也是响应式
```

### 4.2 对比

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 任意 | 仅对象 |
| 访问方式 | .value | 直接访问 |
| 替换整体 | ✅ 可以 | ❌ 丢失响应式 |
| 解构 | 保持响应式 | 丢失响应式 |

## 五、shallowRef

### 5.1 实现

```javascript
function shallowRef(value) {
  return new RefImpl(value, true)  // isShallow = true
}

// shallowRef 不会递归转换嵌套对象
const state = shallowRef({ nested: { count: 0 } })

state.value.nested.count++  // 不会触发更新
state.value = { nested: { count: 1 } }  // 会触发更新
```

### 5.2 使用场景

```javascript
// 大型不可变数据结构
const data = shallowRef(largeImmutableObject)

// 更新时替换整个对象
data.value = newLargeObject  // 触发更新
```

## 六、triggerRef

### 6.1 实现

```javascript
function triggerRef(ref) {
  triggerRefValue(ref)
}
```

### 6.2 使用场景

```javascript
const shallow = shallowRef({ count: 0 })

// 直接修改不会触发更新
shallow.value.count++

// 手动触发更新
triggerRef(shallow)
```

## 七、自动解包

### 7.1 在模板中

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <!-- 模板中自动解包，不需要 .value -->
  <p>{{ count }}</p>
</template>
```

### 7.2 在 reactive 中

```javascript
const count = ref(0)
const state = reactive({ count })

// ref 在 reactive 中自动解包
state.count++  // 不需要 state.count.value++
console.log(state.count)  // 1

// 注意：数组中不会解包
const arr = reactive([ref(0)])
arr[0].value  // 需要 .value
```

### 7.3 proxyRefs 实现

```javascript
// setup 返回值会用 proxyRefs 包装
function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      // 自动解包 ref
      return isRef(value) ? value.value : value
    },
    set(target, key, newValue, receiver) {
      const oldValue = target[key]
      if (isRef(oldValue) && !isRef(newValue)) {
        // 如果旧值是 ref，直接设置 .value
        oldValue.value = newValue
        return true
      }
      return Reflect.set(target, key, newValue, receiver)
    }
  })
}
```

## 八、toRef 和 toRefs

### 8.1 toRef 实现

```javascript
// 将 reactive 对象的属性转换为 ref
function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

class ObjectRefImpl {
  public __v_isRef = true
  
  constructor(private _object, private _key) {}
  
  get value() {
    return this._object[this._key]
  }
  
  set value(newValue) {
    this._object[this._key] = newValue
  }
}

// 使用
const state = reactive({ count: 0 })
const countRef = toRef(state, 'count')

countRef.value++  // state.count 也会变
```

### 8.2 toRefs 实现

```javascript
// 将 reactive 对象的所有属性转换为 ref
function toRefs(object) {
  const ret = Array.isArray(object) ? new Array(object.length) : {}
  
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  
  return ret
}

// 使用：解构时保持响应式
const state = reactive({ count: 0, name: 'Vue' })
const { count, name } = toRefs(state)

count.value++  // state.count 也会变
```

## 九、customRef

### 9.1 实现

```javascript
function customRef(factory) {
  return new CustomRefImpl(factory)
}

class CustomRefImpl {
  private _value
  private _get
  private _set
  public dep
  public __v_isRef = true
  
  constructor(factory) {
    const { get, set } = factory(
      () => trackRefValue(this),  // track
      () => triggerRefValue(this) // trigger
    )
    this._get = get
    this._set = set
  }
  
  get value() {
    return this._get()
  }
  
  set value(newValue) {
    this._set(newValue)
  }
}
```

### 9.2 使用示例：防抖 ref

```javascript
function useDebouncedRef(value, delay = 200) {
  let timeout
  
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}

// 使用
const text = useDebouncedRef('hello', 500)
```

## 十、工具函数

### 10.1 isRef

```javascript
function isRef(value) {
  return !!(value && value.__v_isRef === true)
}
```

### 10.2 unref

```javascript
function unref(ref) {
  return isRef(ref) ? ref.value : ref
}
```

## 十一、总结

| API | 说明 |
|-----|------|
| ref | 创建响应式引用 |
| shallowRef | 浅响应式引用 |
| triggerRef | 手动触发更新 |
| toRef | 属性转 ref |
| toRefs | 所有属性转 ref |
| customRef | 自定义 ref |
| unref | 解包 ref |
| isRef | 判断是否 ref |

## 参考资料

- [Vue 3 ref 源码](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts)

---

**下一节** → [第 27 节：effect 与调度](./27-effect-scheduler.md)
