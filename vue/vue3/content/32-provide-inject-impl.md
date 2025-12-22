# 第 32 节：Provide/Inject 实现

## 概述

Provide/Inject 是 Vue 的依赖注入机制，允许祖先组件向后代组件传递数据。本节分析其内部实现原理。

## 一、实现原理

### 1.1 数据结构

```javascript
// 组件实例上的 provides 对象
instance.provides = {
  theme: 'dark',
  user: { name: 'Vue' }
}

// 子组件的 provides 原型链指向父组件
childInstance.provides = Object.create(parentInstance.provides)
```

### 1.2 原型链查找

```
┌─────────────────────────────────────────────────────────────┐
│                   Provide/Inject 原型链                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   App (provides: { theme: 'dark' })                         │
│        ↓ __proto__                                          │
│   Parent (provides: { user: {...} })                        │
│        ↓ __proto__                                          │
│   Child (inject: theme, user)                               │
│                                                             │
│   inject('theme') → 沿原型链向上查找                        │
│   inject('user')  → 沿原型链向上查找                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、provide 实现

### 2.1 provide 函数

```javascript
function provide(key, value) {
  const currentInstance = getCurrentInstance()
  
  if (currentInstance) {
    let provides = currentInstance.provides
    const parentProvides = currentInstance.parent?.provides
    
    // 首次 provide 时，创建新对象
    // 原型指向父组件的 provides
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    
    provides[key] = value
  }
}
```

### 2.2 为什么用原型链

```javascript
// 方案 1：复制父组件的 provides（问题：每次都复制）
provides = { ...parentProvides }

// 方案 2：原型链（高效）
provides = Object.create(parentProvides)
// 只在需要时创建新对象
// 查找时自动沿原型链向上
```

## 三、inject 实现

### 3.1 inject 函数

```javascript
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const currentInstance = getCurrentInstance()
  
  if (currentInstance) {
    // 从父组件的 provides 中查找
    const provides = currentInstance.parent?.provides
    
    if (provides && key in provides) {
      return provides[key]
    } else if (arguments.length > 1) {
      // 有默认值
      return treatDefaultAsFactory && typeof defaultValue === 'function'
        ? defaultValue()
        : defaultValue
    } else {
      console.warn(`injection "${key}" not found.`)
    }
  }
}
```

### 3.2 默认值处理

```javascript
// 普通默认值
const theme = inject('theme', 'light')

// 工厂函数默认值
const config = inject('config', () => ({
  debug: false
}), true)  // 第三个参数表示默认值是工厂函数
```

## 四、应用级 Provide

### 4.1 app.provide

```javascript
function createAppAPI(render) {
  return function createApp(rootComponent) {
    const context = createAppContext()
    
    const app = {
      _context: context,
      
      provide(key, value) {
        // 应用级 provide 存储在 context 中
        context.provides[key] = value
        return app
      },
      
      // ...
    }
    
    return app
  }
}
```

### 4.2 根组件继承

```javascript
// 创建根组件实例时
function createComponentInstance(vnode, parent) {
  const instance = {
    // ...
    provides: parent
      ? parent.provides
      : Object.create(appContext.provides),  // 继承应用级 provides
    // ...
  }
  
  return instance
}
```

## 五、响应式 Provide

### 5.1 提供响应式值

```javascript
// 祖先组件
setup() {
  const theme = ref('dark')
  
  // 提供响应式值
  provide('theme', theme)
  
  // 或提供只读
  provide('theme', readonly(theme))
  
  // 提供修改方法
  provide('toggleTheme', () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  })
}
```

### 5.2 注入后保持响应式

```javascript
// 后代组件
setup() {
  const theme = inject('theme')
  
  // theme 是响应式的
  watchEffect(() => {
    console.log('theme changed:', theme.value)
  })
}
```

## 六、Symbol 作为 Key

### 6.1 避免命名冲突

```javascript
// keys.js
export const ThemeKey = Symbol('theme')
export const UserKey = Symbol('user')

// 祖先组件
import { ThemeKey } from './keys'
provide(ThemeKey, ref('dark'))

// 后代组件
import { ThemeKey } from './keys'
const theme = inject(ThemeKey)
```

### 6.2 TypeScript 类型支持

```typescript
// keys.ts
import type { InjectionKey, Ref } from 'vue'

export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
}

export const ThemeKey: InjectionKey<Ref<ThemeConfig>> = Symbol('theme')

// 使用时自动推断类型
const theme = inject(ThemeKey)  // Ref<ThemeConfig> | undefined
```

## 七、源码分析

### 7.1 createComponentInstance

```javascript
function createComponentInstance(vnode, parent) {
  const instance = {
    vnode,
    type: vnode.type,
    parent,
    
    // provides 继承自父组件或应用上下文
    provides: parent
      ? parent.provides
      : Object.create(appContext.provides),
    
    // ...
  }
  
  return instance
}
```

### 7.2 完整的 provide 源码

```javascript
function provide(key, value) {
  if (!currentInstance) {
    if (__DEV__) {
      warn(`provide() can only be used inside setup().`)
    }
  } else {
    let provides = currentInstance.provides
    
    // 默认情况下，组件实例继承父组件的 provides
    // 但当需要提供自己的值时，需要创建新对象
    // 使用 Object.create 使得可以用 `in` 检查
    const parentProvides = currentInstance.parent && currentInstance.parent.provides
    
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    
    provides[key] = value
  }
}
```

### 7.3 完整的 inject 源码

```javascript
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  // 获取当前实例
  const currentInstance = getCurrentInstance()
  
  if (currentInstance) {
    // 如果在根组件中，从 appContext 获取
    // 否则从父组件的 provides 获取
    const provides = currentInstance.parent == null
      ? currentInstance.vnode.appContext && currentInstance.vnode.appContext.provides
      : currentInstance.parent.provides
    
    if (provides && key in provides) {
      return provides[key]
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue)
        ? defaultValue.call(currentInstance.proxy)
        : defaultValue
    } else if (__DEV__) {
      warn(`injection "${String(key)}" not found.`)
    }
  } else if (__DEV__) {
    warn(`inject() can only be used inside setup() or functional components.`)
  }
}
```

## 八、hasInjectionContext

```javascript
// Vue 3.3+ 新增
function hasInjectionContext() {
  return !!(currentInstance || currentRenderingInstance || currentApp)
}

// 用于库开发，检查是否在组件上下文中
if (hasInjectionContext()) {
  const theme = inject(ThemeKey)
}
```

## 九、总结

| 概念 | 说明 |
|------|------|
| 原型链 | provides 通过原型链实现继承 |
| provide | 在 provides 上设置值 |
| inject | 沿原型链查找值 |
| Symbol key | 避免命名冲突 |
| 响应式 | 可以 provide ref/reactive |
| 应用级 | app.provide 全局提供 |

## 参考资料

- [Vue 3 provide/inject 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/apiInject.ts)

---

**下一节** → [第 33 节：内置组件实现](./33-builtin-impl.md)
