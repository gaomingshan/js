# 项目架构设计

> 构建可维护、可扩展的 Vue 3 项目架构。

## 目录结构

### 标准结构

```
src/
├── api/                  # API 接口
│   ├── modules/
│   │   ├── user.ts
│   │   └── product.ts
│   ├── request.ts       # axios 封装
│   └── types.ts         # API 类型定义
├── assets/              # 静态资源
│   ├── images/
│   ├── fonts/
│   └── styles/
│       ├── variables.scss
│       ├── mixins.scss
│       └── global.scss
├── components/          # 通用组件
│   ├── common/          # 基础组件
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   └── business/        # 业务组件
│       ├── UserCard/
│       └── ProductList/
├── composables/         # 组合式函数
│   ├── useUser.ts
│   ├── useAuth.ts
│   └── usePagination.ts
├── directives/          # 自定义指令
│   ├── loading.ts
│   ├── permission.ts
│   └── index.ts
├── hooks/               # 钩子函数
│   └── useRequest.ts
├── layouts/             # 布局组件
│   ├── DefaultLayout.vue
│   ├── BlankLayout.vue
│   └── AdminLayout.vue
├── plugins/             # 插件
│   ├── element-plus.ts
│   └── pinia-persist.ts
├── router/              # 路由
│   ├── routes/
│   │   ├── index.ts
│   │   ├── modules/
│   │   │   ├── user.ts
│   │   │   └── admin.ts
│   ├── guards.ts
│   └── index.ts
├── stores/              # 状态管理
│   ├── modules/
│   │   ├── user.ts
│   │   ├── app.ts
│   │   └── permission.ts
│   └── index.ts
├── types/               # TypeScript 类型
│   ├── global.d.ts
│   ├── api.d.ts
│   └── components.d.ts
├── utils/               # 工具函数
│   ├── format.ts
│   ├── validate.ts
│   ├── storage.ts
│   └── index.ts
├── views/               # 页面组件
│   ├── home/
│   │   ├── index.vue
│   │   └── components/
│   ├── user/
│   └── admin/
├── App.vue
├── main.ts
└── env.d.ts
```

---

## 分层架构

### API 层

```typescript
// api/request.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class Request {
  private instance: AxiosInstance
  
  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }
  
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
    
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // 跳转登录
        }
        return Promise.reject(error)
      }
    )
  }
  
  request<T>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config)
  }
  
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET', url })
  }
  
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data })
  }
}

export const request = new Request({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
})

// api/modules/user.ts
import { request } from '../request'
import type { User, LoginParams, LoginResponse } from '../types'

export const userApi = {
  login(params: LoginParams) {
    return request.post<LoginResponse>('/auth/login', params)
  },
  
  getUserInfo() {
    return request.get<User>('/user/info')
  },
  
  updateUser(data: Partial<User>) {
    return request.post<User>('/user/update', data)
  }
}
```

### Store 层

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { userApi } from '@/api/modules/user'
import type { User } from '@/api/types'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || '')
  
  // Actions
  async function login(params: LoginParams) {
    const response = await userApi.login(params)
    token.value = response.token
    user.value = response.user
    localStorage.setItem('token', response.token)
  }
  
  async function fetchUserInfo() {
    if (!token.value) return
    user.value = await userApi.getUserInfo()
  }
  
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }
  
  return {
    user,
    token,
    isLoggedIn,
    userName,
    login,
    fetchUserInfo,
    logout
  }
})
```

### Composable 层

```typescript
// composables/useUser.ts
import { useUserStore } from '@/stores/modules/user'

export function useUser() {
  const userStore = useUserStore()
  
  const { user, isLoggedIn, userName } = storeToRefs(userStore)
  const { login, logout, fetchUserInfo } = userStore
  
  return {
    user,
    isLoggedIn,
    userName,
    login,
    logout,
    fetchUserInfo
  }
}

// 使用
<script setup>
const { user, isLoggedIn, login, logout } = useUser()
</script>
```

---

## 模块化设计

### 功能模块

```typescript
// modules/user/
├── api/
│   └── index.ts         # 用户相关 API
├── components/
│   ├── UserCard.vue
│   └── UserList.vue
├── composables/
│   └── useUser.ts
├── store/
│   └── index.ts
├── types/
│   └── index.ts
├── views/
│   ├── Profile.vue
│   └── Settings.vue
└── index.ts             # 模块导出
```

```typescript
// modules/user/index.ts
export * from './api'
export * from './composables'
export * from './store'
export * from './types'
```

### 动态模块加载

```typescript
// plugins/modules.ts
export async function setupModules(app: App) {
  const modules = import.meta.glob('../modules/*/index.ts')
  
  for (const path in modules) {
    const module = await modules[path]()
    
    // 注册模块
    if (module.install) {
      app.use(module)
    }
  }
}
```

---

## 路由设计

### 模块化路由

```typescript
// router/routes/modules/user.ts
import type { RouteRecordRaw } from 'vue-router'

export const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: {
          title: '个人资料',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/user/Settings.vue'),
        meta: {
          title: '账户设置',
          requiresAuth: true
        }
      }
    ]
  }
]

// router/routes/index.ts
import { userRoutes } from './modules/user'
import { adminRoutes } from './modules/admin'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  ...userRoutes,
  ...adminRoutes
]
```

### 路由守卫

```typescript
// router/guards.ts
import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'

export function setupGuards(router: Router) {
  // 权限验证
  router.beforeEach((to, from) => {
    const userStore = useUserStore()
    
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
    
    if (to.meta.roles) {
      const hasRole = (to.meta.roles as string[]).some(role =>
        userStore.user?.roles.includes(role)
      )
      
      if (!hasRole) {
        return { name: 'Forbidden' }
      }
    }
  })
  
  // 页面标题
  router.afterEach((to) => {
    document.title = to.meta.title as string || 'App'
  })
}
```

---

## 状态管理

### 模块化 Store

```typescript
// stores/index.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// stores/modules/app.ts
export const useAppStore = defineStore('app', () => {
  const sidebar = reactive({
    opened: true,
    withoutAnimation: false
  })
  
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')
  
  function toggleSidebar() {
    sidebar.opened = !sidebar.opened
  }
  
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  return {
    sidebar,
    theme,
    language,
    toggleSidebar,
    toggleTheme
  }
}, {
  persist: true
})
```

---

## 工具函数

### 通用工具

```typescript
// utils/format.ts
export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  // 格式化日期
}

export function formatMoney(value: number): string {
  return `¥${value.toFixed(2)}`
}

// utils/validate.ts
export const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string) => /^1[3-9]\d{9}$/.test(value),
  password: (value: string) => value.length >= 8
}

// utils/storage.ts
export const storage = {
  get<T>(key: string): T | null {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },
  
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  
  remove(key: string) {
    localStorage.removeItem(key)
  },
  
  clear() {
    localStorage.clear()
  }
}
```

---

## 组件设计

### 组件规范

```vue
<!-- components/common/Button/index.vue -->
<script setup lang="ts">
interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(e: MouseEvent) {
  if (props.disabled || props.loading) {
    e.preventDefault()
    return
  }
  emit('click', e)
}
</script>

<template>
  <button
    :class="['btn', `btn-${type}`, `btn-${size}`, { disabled, loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-icon">⏳</span>
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &-primary {
    background: #42b983;
    color: white;
  }
  
  &-small {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  &-medium {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  &-large {
    padding: 12px 24px;
    font-size: 16px;
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
```

### 组件文档

```markdown
<!-- components/common/Button/README.md -->
# Button 按钮

## 基础用法

\`\`\`vue
<Button type="primary" @click="handleClick">按钮</Button>
\`\`\`

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 类型 | primary / success / warning / danger | primary |
| size | 尺寸 | small / medium / large | medium |
| disabled | 禁用 | boolean | false |
| loading | 加载中 | boolean | false |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击事件 | (event: MouseEvent) |

### Slots

| 名称 | 说明 |
|------|------|
| default | 按钮内容 |
```

---

## 环境配置

### 多环境管理

```bash
# .env.development
VITE_APP_ENV=development
VITE_API_URL=http://localhost:8080
VITE_MOCK=true

# .env.staging
VITE_APP_ENV=staging
VITE_API_URL=https://staging-api.example.com
VITE_MOCK=false

# .env.production
VITE_APP_ENV=production
VITE_API_URL=https://api.example.com
VITE_MOCK=false
```

### 配置管理

```typescript
// config/index.ts
interface AppConfig {
  env: string
  apiUrl: string
  mock: boolean
  title: string
}

export const config: AppConfig = {
  env: import.meta.env.VITE_APP_ENV,
  apiUrl: import.meta.env.VITE_API_URL,
  mock: import.meta.env.VITE_MOCK === 'true',
  title: import.meta.env.VITE_APP_TITLE
}
```

---

## 错误处理

### 全局错误处理

```typescript
// plugins/error-handler.ts
export function setupErrorHandler(app: App) {
  app.config.errorHandler = (err, instance, info) => {
    console.error('Global error:', err, info)
    
    // 发送到错误监控平台
    if (import.meta.env.PROD) {
      sendToSentry(err, info)
    }
  }
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason)
  })
}
```

---

## 最佳实践

1. **模块化**：按功能划分模块
2. **分层架构**：API、Store、Composable 分层
3. **类型安全**：使用 TypeScript
4. **代码规范**：统一的命名和格式
5. **组件设计**：可复用、可配置
6. **文档完善**：注释和 README
7. **测试覆盖**：单元测试和集成测试
8. **性能优化**：懒加载、代码分割
9. **错误处理**：全局和局部错误处理
10. **持续优化**：定期重构和优化

---

## 参考资料

- [Vue 3 风格指南](https://vuejs.org/style-guide/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD 领域驱动设计](https://martinfowler.com/bliki/DomainDrivenDesign.html)
