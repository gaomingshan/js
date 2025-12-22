# 第 14 节：插件机制

## 概述

插件是一种向 Vue 添加全局功能的方式。常见用途包括：添加全局组件、指令、注入全局属性、提供全局方法等。

## 一、使用插件

### 1.1 基本用法

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import myPlugin from './plugins/myPlugin'

const app = createApp(App)

// 使用插件
app.use(myPlugin)

// 传递选项
app.use(myPlugin, { option1: true, option2: 'value' })

app.mount('#app')
```

### 1.2 链式调用

```javascript
createApp(App)
  .use(router)
  .use(pinia)
  .use(i18n)
  .use(myPlugin)
  .mount('#app')
```

## 二、编写插件

### 2.1 插件结构

```javascript
// 插件可以是一个对象（包含 install 方法）
const myPlugin = {
  install(app, options) {
    // 配置 app
  }
}

// 或者是一个函数
function myPlugin(app, options) {
  // 配置 app
}

export default myPlugin
```

### 2.2 完整示例

```javascript
// plugins/myPlugin.js
export default {
  install(app, options = {}) {
    // 1. 添加全局组件
    app.component('MyGlobalComponent', {
      template: '<div>全局组件</div>'
    })
    
    // 2. 添加全局指令
    app.directive('focus', {
      mounted: (el) => el.focus()
    })
    
    // 3. 添加全局属性
    app.config.globalProperties.$appName = options.appName || 'My App'
    
    // 4. 提供全局注入
    app.provide('pluginOptions', options)
    
    // 5. 添加全局方法
    app.config.globalProperties.$formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }
  }
}
```

## 三、插件能力

### 3.1 注册全局组件

```javascript
// plugins/globalComponents.js
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import Modal from '@/components/Modal.vue'

export default {
  install(app) {
    app.component('AppButton', Button)
    app.component('AppCard', Card)
    app.component('AppModal', Modal)
  }
}
```

### 3.2 注册全局指令

```javascript
// plugins/directives.js
export default {
  install(app) {
    app.directive('click-outside', {
      mounted(el, binding) {
        el._clickOutside = (e) => {
          if (!el.contains(e.target)) binding.value(e)
        }
        document.addEventListener('click', el._clickOutside)
      },
      unmounted(el) {
        document.removeEventListener('click', el._clickOutside)
      }
    })
    
    app.directive('loading', {
      mounted(el, binding) {
        if (binding.value) {
          el.classList.add('is-loading')
        }
      },
      updated(el, binding) {
        el.classList.toggle('is-loading', binding.value)
      }
    })
  }
}
```

### 3.3 全局属性

```javascript
// plugins/utils.js
export default {
  install(app) {
    // 添加全局属性
    app.config.globalProperties.$http = axios
    app.config.globalProperties.$toast = (msg) => alert(msg)
    app.config.globalProperties.$config = {
      apiUrl: 'https://api.example.com'
    }
  }
}
```

```vue
<!-- 在选项式 API 中使用 -->
<script>
export default {
  methods: {
    async fetchData() {
      const data = await this.$http.get('/api/data')
      this.$toast('加载成功')
    }
  }
}
</script>

<!-- 在组合式 API 中使用 -->
<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
proxy.$toast('Hello')
</script>
```

### 3.4 Provide/Inject

```javascript
// plugins/theme.js
import { ref, readonly } from 'vue'

export default {
  install(app) {
    const theme = ref('light')
    
    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    }
    
    app.provide('theme', {
      current: readonly(theme),
      toggle: toggleTheme
    })
  }
}
```

```vue
<!-- 在组件中使用 -->
<script setup>
import { inject } from 'vue'

const { current: theme, toggle } = inject('theme')
</script>
```

## 四、实用插件示例

### 4.1 Toast 插件

```javascript
// plugins/toast.js
import { createApp, ref } from 'vue'
import ToastComponent from './Toast.vue'

export default {
  install(app) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    const toastApp = createApp(ToastComponent)
    const toastInstance = toastApp.mount(container)
    
    app.config.globalProperties.$toast = {
      show(message, type = 'info', duration = 3000) {
        toastInstance.show(message, type, duration)
      },
      success(message) {
        this.show(message, 'success')
      },
      error(message) {
        this.show(message, 'error')
      }
    }
    
    app.provide('toast', app.config.globalProperties.$toast)
  }
}
```

### 4.2 国际化插件（简化版）

```javascript
// plugins/i18n.js
import { ref, reactive } from 'vue'

export default {
  install(app, options = {}) {
    const locale = ref(options.locale || 'zh')
    const messages = reactive(options.messages || {})
    
    const t = (key) => {
      const keys = key.split('.')
      let result = messages[locale.value]
      for (const k of keys) {
        result = result?.[k]
      }
      return result || key
    }
    
    const setLocale = (newLocale) => {
      locale.value = newLocale
    }
    
    app.config.globalProperties.$t = t
    app.config.globalProperties.$locale = locale
    app.config.globalProperties.$setLocale = setLocale
    
    app.provide('i18n', { t, locale, setLocale })
  }
}

// 使用
app.use(i18nPlugin, {
  locale: 'zh',
  messages: {
    zh: { hello: '你好', welcome: '欢迎' },
    en: { hello: 'Hello', welcome: 'Welcome' }
  }
})
```

### 4.3 权限插件

```javascript
// plugins/permission.js
export default {
  install(app, options = {}) {
    const { permissions = [] } = options
    
    // 检查权限
    const hasPermission = (permission) => {
      return permissions.includes(permission)
    }
    
    // 全局方法
    app.config.globalProperties.$can = hasPermission
    
    // 自定义指令
    app.directive('permission', {
      mounted(el, binding) {
        if (!hasPermission(binding.value)) {
          el.parentNode?.removeChild(el)
        }
      }
    })
    
    // 提供注入
    app.provide('permission', { hasPermission, permissions })
  }
}
```

```vue
<template>
  <button v-permission="'admin:delete'">删除</button>
  <button v-if="$can('admin:edit')">编辑</button>
</template>
```

### 4.4 日志插件

```javascript
// plugins/logger.js
export default {
  install(app, options = {}) {
    const { prefix = '[App]', level = 'debug' } = options
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    const currentLevel = levels[level]
    
    const logger = {
      debug(...args) {
        if (currentLevel <= 0) console.debug(prefix, ...args)
      },
      info(...args) {
        if (currentLevel <= 1) console.info(prefix, ...args)
      },
      warn(...args) {
        if (currentLevel <= 2) console.warn(prefix, ...args)
      },
      error(...args) {
        if (currentLevel <= 3) console.error(prefix, ...args)
      }
    }
    
    app.config.globalProperties.$log = logger
    app.provide('logger', logger)
  }
}
```

## 五、TypeScript 支持

### 5.1 类型声明

```typescript
// types/global.d.ts
declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: {
      show(message: string, type?: string): void
      success(message: string): void
      error(message: string): void
    }
    $t: (key: string) => string
    $can: (permission: string) => boolean
  }
}

export {}
```

### 5.2 插件类型

```typescript
// plugins/myPlugin.ts
import type { App, Plugin } from 'vue'

interface MyPluginOptions {
  appName?: string
  debug?: boolean
}

const myPlugin: Plugin = {
  install(app: App, options: MyPluginOptions = {}) {
    // ...
  }
}

export default myPlugin
```

## 六、最佳实践

| 实践 | 说明 |
|------|------|
| 提供选项 | 让插件可配置 |
| 类型声明 | 为全局属性添加类型 |
| 命名空间 | 避免命名冲突 |
| 文档 | 提供使用说明 |
| 按需注册 | 不要注册不需要的功能 |

## 参考资料

- [插件](https://vuejs.org/guide/reusability/plugins.html)

---

**下一节** → [第 15 节：Vue 生态](./15-ecosystem.md)
