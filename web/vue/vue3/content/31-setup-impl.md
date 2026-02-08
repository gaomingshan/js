# 第 31 节：setup 函数

## 概述

`setup` 是 Vue 3 组合式 API 的入口函数，在组件创建时执行，用于初始化响应式状态、计算属性、侦听器等。

## 一、setup 执行时机

```
组件实例创建
      ↓
初始化 props
      ↓
执行 setup()  ← 此时 data/computed 还未初始化
      ↓
处理 setup 返回值
      ↓
编译模板/设置渲染函数
      ↓
beforeMount
      ↓
挂载
```

## 二、setup 实现

### 2.1 setupComponent

```javascript
function setupComponent(instance) {
  const { props, children } = instance.vnode
  
  // 初始化 props
  initProps(instance, props)
  
  // 初始化 slots
  initSlots(instance, children)
  
  // 执行 setup
  const setupResult = setupStatefulComponent(instance)
  
  return setupResult
}
```

### 2.2 setupStatefulComponent

```javascript
function setupStatefulComponent(instance) {
  const Component = instance.type
  
  // 创建渲染代理
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
  
  const { setup } = Component
  
  if (setup) {
    // 创建 setup 上下文
    const setupContext = createSetupContext(instance)
    
    // 设置当前实例（让 onMounted 等能注册到正确实例）
    setCurrentInstance(instance)
    
    // 暂停依赖收集
    pauseTracking()
    
    // 执行 setup
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      [instance.props, setupContext]
    )
    
    // 恢复依赖收集
    resetTracking()
    
    // 清除当前实例
    setCurrentInstance(null)
    
    // 处理返回值
    if (isPromise(setupResult)) {
      // async setup
      return setupResult.then(
        result => handleSetupResult(instance, result)
      )
    } else {
      handleSetupResult(instance, setupResult)
    }
  } else {
    // 没有 setup，完成组件设置
    finishComponentSetup(instance)
  }
}
```

### 2.3 createSetupContext

```javascript
function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
    expose: (exposed) => {
      instance.exposed = exposed || {}
    }
  }
}
```

## 三、setup 参数

### 3.1 props

```javascript
// setup 第一个参数是 props
// 是响应式的，但不能解构

setup(props) {
  // ✅ 响应式访问
  console.log(props.title)
  
  // ❌ 解构会丢失响应式
  const { title } = props
  
  // ✅ 用 toRefs 解构
  const { title } = toRefs(props)
  
  // ✅ 用 toRef 获取单个
  const titleRef = toRef(props, 'title')
}
```

### 3.2 context

```javascript
setup(props, context) {
  // attrs: 非 props 的属性
  console.log(context.attrs)
  
  // slots: 插槽
  console.log(context.slots.default?.())
  
  // emit: 触发事件
  context.emit('update', value)
  
  // expose: 暴露给父组件
  context.expose({ method })
}

// 可以解构 context
setup(props, { attrs, slots, emit, expose }) {
  // ...
}
```

## 四、setup 返回值

### 4.1 返回对象

```javascript
// 返回对象：暴露给模板使用
setup() {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  // 返回的属性可在模板中使用
  return {
    count,
    double,
    increment
  }
}
```

### 4.2 返回渲染函数

```javascript
// 返回函数：作为渲染函数
setup() {
  const count = ref(0)
  
  return () => h('div', count.value)
}
```

### 4.3 handleSetupResult

```javascript
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'function') {
    // 返回的是渲染函数
    instance.render = setupResult
  } else if (typeof setupResult === 'object') {
    // 返回的是状态对象
    // proxyRefs 自动解包 ref
    instance.setupState = proxyRefs(setupResult)
  }
  
  finishComponentSetup(instance)
}
```

## 五、script setup

### 5.1 编译转换

```vue
<!-- script setup 写法 -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>

<!-- 编译后 -->
<script>
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++
    
    return { count, increment }
  }
}
</script>
```

### 5.2 defineProps / defineEmits

```vue
<script setup>
// 编译器宏，无需导入

// defineProps
const props = defineProps({
  title: String,
  count: Number
})

// defineEmits
const emit = defineEmits(['update', 'delete'])

// defineExpose
defineExpose({
  publicMethod
})

// defineOptions (Vue 3.3+)
defineOptions({
  name: 'MyComponent',
  inheritAttrs: false
})
</script>
```

## 六、currentInstance

### 6.1 实现

```javascript
let currentInstance = null

function setCurrentInstance(instance) {
  currentInstance = instance
}

function getCurrentInstance() {
  return currentInstance
}

// 在 setup 中使用
setup() {
  const instance = getCurrentInstance()
  // instance 包含组件内部状态
}
```

### 6.2 生命周期钩子注册

```javascript
function onMounted(hook) {
  // 获取当前实例
  const instance = currentInstance
  
  if (instance) {
    // 将钩子添加到实例
    ;(instance.m || (instance.m = [])).push(hook)
  } else {
    console.warn('onMounted must be called inside setup()')
  }
}

// 其他钩子类似
function onBeforeMount(hook) {
  injectHook('bm', hook)
}

function injectHook(type, hook) {
  const instance = currentInstance
  if (instance) {
    const hooks = instance[type] || (instance[type] = [])
    hooks.push(hook)
  }
}
```

## 七、async setup

### 7.1 使用方式

```vue
<script setup>
// 顶层 await
const data = await fetchData()
</script>

<!-- 或 -->
<script>
export default {
  async setup() {
    const data = await fetchData()
    return { data }
  }
}
</script>
```

### 7.2 需要 Suspense

```vue
<template>
  <Suspense>
    <AsyncComponent />
    <template #fallback>Loading...</template>
  </Suspense>
</template>
```

### 7.3 实现原理

```javascript
function setupStatefulComponent(instance) {
  const setupResult = setup(props, context)
  
  if (isPromise(setupResult)) {
    // async setup 返回 Promise
    setupResult.then(
      result => {
        handleSetupResult(instance, result)
        // 通知 Suspense 已解析
        instance.asyncResolved = true
      },
      error => {
        handleError(error, instance)
      }
    )
    
    // 返回 Promise 给 Suspense
    return setupResult
  }
}
```

## 八、与 Options API 对比

### 8.1 执行顺序

```javascript
// Options API
export default {
  beforeCreate() {
    // 1. 实例创建，data 未初始化
  },
  setup() {
    // 2. setup 执行
  },
  created() {
    // 3. data/computed 已初始化
  }
}

// Composition API (script setup)
// setup 相当于 beforeCreate + created
```

### 8.2 混合使用

```javascript
export default {
  props: ['title'],
  
  setup(props) {
    const count = ref(0)
    return { count }
  },
  
  data() {
    return { name: 'Vue' }
  },
  
  computed: {
    // 可以访问 setup 返回的值
    double() {
      return this.count * 2
    }
  },
  
  methods: {
    // 可以访问 setup 返回的值
    increment() {
      this.count++
    }
  }
}
```

## 九、总结

| 概念 | 说明 |
|------|------|
| 执行时机 | 组件创建时，beforeCreate 和 created 之间 |
| 参数 | props（响应式）, context（attrs/slots/emit/expose） |
| 返回值 | 对象（暴露给模板）或函数（渲染函数） |
| currentInstance | 当前组件实例，用于注册钩子 |
| script setup | 编译器语法糖，自动返回顶层绑定 |

## 参考资料

- [组合式 API setup()](https://vuejs.org/api/composition-api-setup.html)
- [script setup](https://vuejs.org/api/sfc-script-setup.html)

---

**下一节** → [第 32 节：Provide/Inject 实现](./32-provide-inject-impl.md)
