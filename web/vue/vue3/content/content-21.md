# 插件系统

> Vue 插件用于扩展 Vue 应用的全局功能，提供可复用的功能模块。

## 核心概念

插件是一个包含 `install` 方法的对象，或者一个函数。插件可以为应用添加全局功能。

### 基础定义

```typescript
// myPlugin.ts
import type { App } from 'vue'

export default {
  install(app: App, options?: any) {
    // 插件逻辑
  }
}

// 或函数形式
export default function(app: App, options?: any) {
  // 插件逻辑
}
```

### 使用插件

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import MyPlugin from './plugins/myPlugin'

const app = createApp(App)

// 安装插件
app.use(MyPlugin, {
  // 选项
})

app.mount('#app')
```

---

## app.use() 原理

### 执行机制

```typescript
// Vue 内部实现（简化版）
class App {
  private _installedPlugins = new Set()
  
  use(plugin: Plugin, ...options: any[]) {
    // 避免重复安装
    if (this._installedPlugins.has(plugin)) {
      return this
    }
    
    this._installedPlugins.add(plugin)
    
    // 调用 install 方法
    if (typeof plugin.install === 'function') {
      plugin.install(this, ...options)
    } else if (typeof plugin === 'function') {
      plugin(this, ...options)
    }
    
    return this
  }
}
```

**特性**：
- 自动防止重复安装
- 支持链式调用
- 传递应用实例和选项

---

## 插件能做什么

### 1. 全局组件注册

```typescript
import type { App } from 'vue'
import MyButton from './components/MyButton.vue'
import MyInput from './components/MyInput.vue'

export default {
  install(app: App) {
    app.component('MyButton', MyButton)
    app.component('MyInput', MyInput)
  }
}
```

### 2. 全局指令注册

```typescript
export default {
  install(app: App) {
    app.directive('focus', {
      mounted(el) {
        el.focus()
      }
    })
    
    app.directive('permission', {
      mounted(el, binding) {
        if (!hasPermission(binding.value)) {
          el.parentNode?.removeChild(el)
        }
      }
    })
  }
}
```

### 3. 全局属性注入

```typescript
export default {
  install(app: App, options) {
    // 添加全局属性
    app.config.globalProperties.$http = axios
    app.config.globalProperties.$message = message
    
    // 在组件中使用
    // this.$http.get('/api/data')
    // this.$message.success('操作成功')
  }
}
```

### 4. Provide / Inject

```typescript
import { InjectionKey } from 'vue'

interface Config {
  apiUrl: string
  timeout: number
}

export const configKey: InjectionKey<Config> = Symbol('config')

export default {
  install(app: App, options: Config) {
    // 应用级 provide
    app.provide(configKey, options)
  }
}

// 组件中使用
<script setup>
import { inject } from 'vue'
import { configKey } from './plugins/config'

const config = inject(configKey)
console.log(config.apiUrl)
</script>
```

---

## 插件开发最佳实践

### 完整插件结构

```typescript
// plugins/myPlugin.ts
import type { App, Plugin } from 'vue'

interface MyPluginOptions {
  apiUrl: string
  debug?: boolean
}

class MyPlugin {
  private app: App | null = null
  private options: MyPluginOptions
  
  constructor(options: MyPluginOptions) {
    this.options = {
      debug: false,
      ...options
    }
  }
  
  install(app: App) {
    this.app = app
    
    // 1. 全局组件
    app.component('MyComponent', MyComponent)
    
    // 2. 全局指令
    app.directive('my-directive', {
      // ...
    })
    
    // 3. 全局属性
    app.config.globalProperties.$myPlugin = this
    
    // 4. Provide
    app.provide('myPlugin', this)
    
    // 5. 全局混入（不推荐）
    // app.mixin({
    //   created() {
    //     console.log('全局混入')
    //   }
    // })
  }
  
  // 插件方法
  doSomething() {
    if (this.options.debug) {
      console.log('Debug mode')
    }
  }
}

// 创建插件工厂函数
export function createMyPlugin(options: MyPluginOptions): Plugin {
  return new MyPlugin(options)
}

// main.ts
import { createMyPlugin } from './plugins/myPlugin'

app.use(createMyPlugin({
  apiUrl: 'https://api.example.com',
  debug: true
}))
```

---

## 实用插件示例

### 1. 消息提示插件

```typescript
// plugins/message.ts
import type { App, Plugin } from 'vue'
import MessageComponent from './MessageComponent.vue'

type MessageType = 'success' | 'error' | 'warning' | 'info'

interface MessageOptions {
  message: string
  type?: MessageType
  duration?: number
}

class Message {
  private container: HTMLElement | null = null
  
  show(options: MessageOptions) {
    const { message, type = 'info', duration = 3000 } = options
    
    // 创建容器
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.className = 'message-container'
      document.body.appendChild(this.container)
    }
    
    // 创建消息元素
    const messageEl = document.createElement('div')
    messageEl.className = `message message-${type}`
    messageEl.textContent = message
    
    this.container.appendChild(messageEl)
    
    // 动画进入
    setTimeout(() => {
      messageEl.classList.add('show')
    }, 10)
    
    // 自动移除
    setTimeout(() => {
      messageEl.classList.remove('show')
      setTimeout(() => {
        this.container?.removeChild(messageEl)
      }, 300)
    }, duration)
  }
  
  success(message: string) {
    this.show({ message, type: 'success' })
  }
  
  error(message: string) {
    this.show({ message, type: 'error' })
  }
  
  warning(message: string) {
    this.show({ message, type: 'warning' })
  }
  
  info(message: string) {
    this.show({ message, type: 'info' })
  }
}

const message = new Message()

export default {
  install(app: App) {
    app.config.globalProperties.$message = message
    app.provide('message', message)
  }
} as Plugin

// 使用
<script setup>
import { inject } from 'vue'

const message = inject('message')

function handleClick() {
  message.success('操作成功')
}
</script>
```

### 2. 加载指示器插件

```typescript
// plugins/loading.ts
import type { App, Plugin } from 'vue'
import { createApp } from 'vue'
import LoadingComponent from './LoadingComponent.vue'

class Loading {
  private instance: any = null
  private container: HTMLElement | null = null
  
  show(text = '加载中...') {
    if (this.instance) return
    
    // 创建容器
    this.container = document.createElement('div')
    document.body.appendChild(this.container)
    
    // 创建 Vue 实例
    this.instance = createApp(LoadingComponent, {
      text,
      visible: true
    })
    
    this.instance.mount(this.container)
  }
  
  hide() {
    if (this.instance) {
      this.instance.unmount()
      this.instance = null
      
      if (this.container) {
        document.body.removeChild(this.container)
        this.container = null
      }
    }
  }
}

const loading = new Loading()

export default {
  install(app: App) {
    app.config.globalProperties.$loading = loading
    app.provide('loading', loading)
  }
} as Plugin

// 使用
<script setup>
import { inject } from 'vue'

const loading = inject('loading')

async function fetchData() {
  loading.show()
  try {
    await api.getData()
  } finally {
    loading.hide()
  }
}
</script>
```

### 3. 路由权限插件

```typescript
// plugins/permission.ts
import type { App, Plugin } from 'vue'
import type { Router } from 'vue-router'

interface PermissionOptions {
  router: Router
  getPermissions: () => string[]
  onDenied?: () => void
}

export default {
  install(app: App, options: PermissionOptions) {
    const { router, getPermissions, onDenied } = options
    
    // 添加路由守卫
    router.beforeEach((to, from, next) => {
      const requiredPermissions = to.meta.permissions as string[] | undefined
      
      if (!requiredPermissions || requiredPermissions.length === 0) {
        next()
        return
      }
      
      const userPermissions = getPermissions()
      const hasPermission = requiredPermissions.every(p =>
        userPermissions.includes(p)
      )
      
      if (hasPermission) {
        next()
      } else {
        onDenied?.()
        next('/403')
      }
    })
    
    // 添加权限检查函数
    app.config.globalProperties.$hasPermission = (permission: string) => {
      return getPermissions().includes(permission)
    }
  }
} as Plugin

// 使用
import { createRouter } from 'vue-router'
import PermissionPlugin from './plugins/permission'

const router = createRouter({
  routes: [
    {
      path: '/admin',
      component: Admin,
      meta: {
        permissions: ['admin']
      }
    }
  ]
})

app.use(PermissionPlugin, {
  router,
  getPermissions: () => store.state.user.permissions,
  onDenied: () => {
    message.error('没有权限访问')
  }
})
```

### 4. 国际化插件

```typescript
// plugins/i18n.ts
import type { App, Plugin } from 'vue'
import { ref, computed } from 'vue'

type Locale = 'zh-CN' | 'en-US'

interface Messages {
  [key: string]: {
    [key: string]: string
  }
}

class I18n {
  private locale = ref<Locale>('zh-CN')
  private messages: Messages
  
  constructor(messages: Messages, defaultLocale: Locale = 'zh-CN') {
    this.messages = messages
    this.locale.value = defaultLocale
  }
  
  t(key: string): string {
    const keys = key.split('.')
    let value: any = this.messages[this.locale.value]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
  
  setLocale(locale: Locale) {
    this.locale.value = locale
  }
  
  getLocale() {
    return this.locale.value
  }
}

export function createI18n(messages: Messages, defaultLocale?: Locale): Plugin {
  const i18n = new I18n(messages, defaultLocale)
  
  return {
    install(app: App) {
      app.config.globalProperties.$t = i18n.t.bind(i18n)
      app.config.globalProperties.$i18n = i18n
      app.provide('i18n', i18n)
    }
  }
}

// 使用
const messages = {
  'zh-CN': {
    common: {
      save: '保存',
      cancel: '取消'
    }
  },
  'en-US': {
    common: {
      save: 'Save',
      cancel: 'Cancel'
    }
  }
}

app.use(createI18n(messages, 'zh-CN'))

// 组件中
<script setup>
import { inject } from 'vue'

const i18n = inject('i18n')
</script>

<template>
  <button>{{ $t('common.save') }}</button>
</template>
```

### 5. 表单验证插件

```typescript
// plugins/validator.ts
import type { App, Plugin } from 'vue'

type Rule = (value: any) => string | true

interface ValidationRules {
  [key: string]: Rule[]
}

class Validator {
  validate(value: any, rules: Rule[]): string | true {
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        return result
      }
    }
    return true
  }
  
  // 内置规则
  required(message = '此字段必填'): Rule {
    return (value) => {
      return value ? true : message
    }
  }
  
  min(length: number, message?: string): Rule {
    return (value) => {
      return value.length >= length ? true : (message || `最少${length}个字符`)
    }
  }
  
  max(length: number, message?: string): Rule {
    return (value) => {
      return value.length <= length ? true : (message || `最多${length}个字符`)
    }
  }
  
  email(message = '邮箱格式不正确'): Rule {
    return (value) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? true : message
    }
  }
  
  pattern(regex: RegExp, message = '格式不正确'): Rule {
    return (value) => {
      return regex.test(value) ? true : message
    }
  }
}

const validator = new Validator()

export default {
  install(app: App) {
    app.config.globalProperties.$validator = validator
    app.provide('validator', validator)
  }
} as Plugin

// 使用
<script setup>
import { inject } from 'vue'

const validator = inject('validator')

const rules = {
  email: [
    validator.required(),
    validator.email()
  ],
  password: [
    validator.required(),
    validator.min(6)
  ]
}
</script>
```

---

## TypeScript 支持

### 类型扩展

```typescript
// types/global.d.ts
import { Message } from '@/plugins/message'
import { Loading } from '@/plugins/loading'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $message: Message
    $loading: Loading
    $http: AxiosInstance
  }
}

export {}
```

### 插件类型定义

```typescript
import type { Plugin } from 'vue'

export interface MyPluginOptions {
  apiUrl: string
  debug?: boolean
}

export interface MyPlugin {
  install: Plugin['install']
  doSomething: () => void
}

export function createMyPlugin(options: MyPluginOptions): MyPlugin
```

---

## 插件组合

```typescript
// plugins/index.ts
import type { App } from 'vue'
import MessagePlugin from './message'
import LoadingPlugin from './loading'
import I18nPlugin from './i18n'

export function setupPlugins(app: App) {
  app.use(MessagePlugin)
  app.use(LoadingPlugin)
  app.use(I18nPlugin, {
    locale: 'zh-CN',
    messages: {}
  })
}

// main.ts
import { setupPlugins } from './plugins'

const app = createApp(App)
setupPlugins(app)
app.mount('#app')
```

---

## 易错点与注意事项

### 1. 避免污染全局

```typescript
// ❌ 不好：污染全局
export default {
  install(app) {
    window.$myPlugin = {}
  }
}

// ✅ 好：使用 Vue 的机制
export default {
  install(app) {
    app.provide('myPlugin', {})
  }
}
```

### 2. 插件初始化顺序

```typescript
// main.ts
const app = createApp(App)

// ⚠️ 注意顺序：先安装依赖的插件
app.use(Router)      // Router 先安装
app.use(Permission, { router }) // Permission 依赖 Router

app.mount('#app')
```

### 3. 避免重复安装

```typescript
// Vue 会自动防止重复安装
app.use(MyPlugin)
app.use(MyPlugin) // 不会重复执行
```

### 4. 清理资源

```typescript
export default {
  install(app: App) {
    const cleanup = () => {
      // 清理逻辑
    }
    
    // ⚠️ 插件没有卸载钩子
    // 需要在应用卸载时手动清理
    app.config.globalProperties._cleanup = cleanup
  }
}
```

---

## 最佳实践

1. **命名规范**：使用 `createXxx` 工厂函数
2. **类型安全**：提供完整的 TypeScript 类型
3. **选项默认值**：提供合理的默认配置
4. **错误处理**：捕获并处理错误
5. **文档完善**：提供使用文档和示例
6. **避免全局污染**：使用 Vue 的 provide/inject
7. **性能优化**：避免不必要的全局混入
8. **可测试性**：设计易于测试的 API

---

## 插件开发检查清单

- [ ] 提供清晰的安装方法
- [ ] 支持选项配置
- [ ] 提供 TypeScript 类型
- [ ] 避免命名冲突
- [ ] 文档和示例
- [ ] 错误处理
- [ ] 测试覆盖
- [ ] 性能优化
- [ ] 版本兼容性

---

## 参考资料

- [插件](https://cn.vuejs.org/guide/reusability/plugins.html)
- [app.use()](https://cn.vuejs.org/api/application.html#app-use)
- [全局 API](https://cn.vuejs.org/api/application.html)
