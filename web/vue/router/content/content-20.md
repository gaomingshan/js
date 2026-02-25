# 第 20 章：路由模块化组织

## 概述

随着项目规模增长，路由配置会变得越来越庞大。合理的路由模块化组织能够提升代码可维护性、可读性和协作效率。本章将介绍多种路由模块化策略及其最佳实践。

## 路由表的拆分策略

### 按功能模块拆分

```
router/
├── index.js           # 路由主文件
├── routes/
│   ├── home.js        # 首页相关路由
│   ├── user.js        # 用户相关路由
│   ├── product.js     # 产品相关路由
│   ├── order.js       # 订单相关路由
│   └── admin.js       # 管理后台路由
└── guards/
    ├── auth.js        # 权限守卫
    └── permission.js  # 权限验证
```

```javascript
// router/routes/user.js
export default [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人资料' }
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/user/Settings.vue'),
        meta: { title: '账号设置' }
      }
    ]
  }
]
```

```javascript
// router/routes/product.js
export default [
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('@/views/product/List.vue'),
    meta: { title: '产品列表' }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('@/views/product/Detail.vue'),
    meta: { title: '产品详情' }
  }
]
```

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import homeRoutes from './routes/home'
import userRoutes from './routes/user'
import productRoutes from './routes/product'
import orderRoutes from './routes/order'
import adminRoutes from './routes/admin'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  ...homeRoutes,
  ...userRoutes,
  ...productRoutes,
  ...orderRoutes,
  ...adminRoutes,
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 按权限级别拆分

```javascript
// router/routes/public.js - 公开路由
export const publicRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  }
]

// router/routes/auth.js - 需要登录的路由
export const authRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  }
]

// router/routes/admin.js - 管理员路由
export const adminRoutes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  }
]

// router/index.js
import { publicRoutes, authRoutes, adminRoutes } from './routes'

const routes = [
  ...publicRoutes,
  ...authRoutes,
  ...adminRoutes
]
```

### 按业务线拆分

```
router/
├── index.js
└── modules/
    ├── mall/          # 商城业务
    │   ├── index.js
    │   ├── product.js
    │   └── order.js
    ├── cms/           # 内容管理
    │   ├── index.js
    │   ├── article.js
    │   └── category.js
    └── crm/           # 客户管理
        ├── index.js
        └── customer.js
```

```javascript
// router/modules/mall/index.js
import productRoutes from './product'
import orderRoutes from './order'

export default {
  path: '/mall',
  component: () => import('@/layouts/MallLayout.vue'),
  children: [
    ...productRoutes,
    ...orderRoutes
  ]
}
```

## 自动化路由注册

### 使用 Vite 的 import.meta.glob

```javascript
// router/index.js
const routeModules = import.meta.glob('./routes/*.js', { eager: true })

const routes = Object.values(routeModules)
  .flatMap(module => module.default || [])

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

### 使用 Webpack 的 require.context

```javascript
// router/index.js
const routeFiles = require.context('./routes', false, /\.js$/)

const routes = routeFiles.keys()
  .reduce((routes, modulePath) => {
    const moduleRoutes = routeFiles(modulePath).default
    return routes.concat(moduleRoutes)
  }, [])

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

### 约定式路由（基于文件结构）

```
views/
├── index.vue          → /
├── about.vue          → /about
├── user/
│   ├── index.vue      → /user
│   ├── [id].vue       → /user/:id
│   └── settings.vue   → /user/settings
└── admin/
    └── [...slug].vue  → /admin/:slug(.*)
```

```javascript
// router/auto-routes.js
function generateRoutes(pages) {
  return Object.entries(pages).map(([path, component]) => {
    // 移除 /src/views 前缀和 .vue 后缀
    const routePath = path
      .replace(/^\.\.\/views/, '')
      .replace(/\.vue$/, '')
      .replace(/\/index$/, '')
      // 动态路由 [id] → :id
      .replace(/\[([^\]]+)\]/g, ':$1')
      // 通配符 [...slug] → :slug(.*)
      .replace(/\[\.\.\.([^\]]+)\]/g, ':$1(.*)')
      .toLowerCase() || '/'
    
    return {
      path: routePath,
      component: component.default
    }
  })
}

const pages = import.meta.glob('../views/**/*.vue', { eager: true })
const autoRoutes = generateRoutes(pages)

export default autoRoutes
```

## 路由配置的类型安全

### TypeScript 路由定义

```typescript
// router/types.ts
import { RouteRecordRaw } from 'vue-router'

export interface AppRouteMeta {
  title?: string
  icon?: string
  requiresAuth?: boolean
  roles?: string[]
  permissions?: string[]
  keepAlive?: boolean
  hidden?: boolean
}

export type AppRouteRecord = RouteRecordRaw & {
  meta?: AppRouteMeta
  children?: AppRouteRecord[]
}
```

```typescript
// router/routes/user.ts
import type { AppRouteRecord } from '../types'

const userRoutes: AppRouteRecord[] = [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    meta: {
      title: '用户中心',
      requiresAuth: true,
      icon: 'user'
    },
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: {
          title: '个人资料',
          keepAlive: true
        }
      }
    ]
  }
]

export default userRoutes
```

### 路由名称类型安全

```typescript
// router/route-names.ts
export const RouteNames = {
  Home: 'Home',
  About: 'About',
  UserProfile: 'UserProfile',
  UserSettings: 'UserSettings',
  ProductList: 'ProductList',
  ProductDetail: 'ProductDetail'
} as const

export type RouteName = typeof RouteNames[keyof typeof RouteNames]
```

```typescript
// 使用
import { RouteNames } from './route-names'

router.push({ name: RouteNames.UserProfile })  // 类型安全

router.push({ name: 'UserProfiles' })  // ❌ 类型错误
```

### 路由参数类型推导

```typescript
// router/typed-routes.ts
import type { RouteLocationNamedRaw } from 'vue-router'

interface RouteParamsMap {
  ProductDetail: { id: string }
  UserProfile: { id: string }
  ArticleEdit: { id: string; category: string }
}

type TypedRoute<T extends keyof RouteParamsMap> = {
  name: T
  params: RouteParamsMap[T]
}

// 使用
const route: TypedRoute<'ProductDetail'> = {
  name: 'ProductDetail',
  params: { id: '123' }
}

router.push(route)  // 类型安全
```

## 大型项目的路由架构

### 微前端路由设计

```javascript
// 主应用路由
const mainRoutes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'home',
        component: Home
      }
    ]
  },
  // 子应用容器路由
  {
    path: '/app-user/:pathMatch(.*)*',
    component: () => import('@/layouts/MicroAppContainer.vue'),
    meta: { microApp: 'user-app' }
  },
  {
    path: '/app-admin/:pathMatch(.*)*',
    component: () => import('@/layouts/MicroAppContainer.vue'),
    meta: { microApp: 'admin-app' }
  }
]

// 子应用路由（独立的 Vue Router 实例）
// user-app/router/index.js
const userAppRouter = createRouter({
  history: createWebHistory('/app-user'),
  routes: [
    {
      path: '/profile',
      component: Profile
    }
  ]
})
```

### 路由懒加载策略

```javascript
// 按优先级分组
const routes = [
  // P0: 首屏关键路由（同步加载）
  {
    path: '/',
    component: Home
  },
  
  // P1: 高频访问路由（预加载）
  {
    path: '/products',
    component: () => import(
      /* webpackChunkName: "products" */
      /* webpackPrefetch: true */
      '@/views/Products.vue'
    )
  },
  
  // P2: 一般路由（按需加载）
  {
    path: '/about',
    component: () => import(
      /* webpackChunkName: "about" */
      '@/views/About.vue'
    )
  },
  
  // P3: 低频路由（延迟加载）
  {
    path: '/help',
    component: () => import(
      /* webpackChunkName: "help" */
      '@/views/Help.vue'
    )
  }
]
```

### 路由配置验证

```javascript
// router/validator.js
function validateRoutes(routes, parentPath = '') {
  const errors = []
  const names = new Set()
  
  routes.forEach(route => {
    const fullPath = parentPath + route.path
    
    // 检查必需字段
    if (!route.path) {
      errors.push(`路由缺少 path: ${JSON.stringify(route)}`)
    }
    
    if (!route.component && !route.redirect && !route.children) {
      errors.push(`路由 ${fullPath} 缺少 component、redirect 或 children`)
    }
    
    // 检查路由名称唯一性
    if (route.name) {
      if (names.has(route.name)) {
        errors.push(`重复的路由名称: ${route.name}`)
      }
      names.add(route.name)
    }
    
    // 检查路径格式
    if (route.path !== '/' && route.path.endsWith('/')) {
      errors.push(`路径不应以 / 结尾: ${fullPath}`)
    }
    
    // 递归检查子路由
    if (route.children) {
      const childErrors = validateRoutes(route.children, fullPath)
      errors.push(...childErrors)
    }
  })
  
  return errors
}

// 使用
if (process.env.NODE_ENV === 'development') {
  const errors = validateRoutes(routes)
  if (errors.length > 0) {
    console.error('路由配置错误：')
    errors.forEach(error => console.error(`  - ${error}`))
  }
}
```

## 路由配置文档化

### 自动生成路由文档

```javascript
// scripts/generate-route-docs.js
import fs from 'fs'
import { routes } from '../router/index.js'

function generateRouteDocs(routes, level = 0) {
  let docs = ''
  
  routes.forEach(route => {
    const indent = '  '.repeat(level)
    const meta = route.meta || {}
    
    docs += `${indent}- **${route.path}**\n`
    if (route.name) docs += `${indent}  - 名称: \`${route.name}\`\n`
    if (meta.title) docs += `${indent}  - 标题: ${meta.title}\n`
    if (meta.requiresAuth) docs += `${indent}  - 需要登录: 是\n`
    if (meta.roles) docs += `${indent}  - 角色: ${meta.roles.join(', ')}\n`
    
    if (route.children) {
      docs += generateRouteDocs(route.children, level + 1)
    }
    
    docs += '\n'
  })
  
  return docs
}

const markdown = `# 路由文档

## 路由列表

${generateRouteDocs(routes)}

---

生成时间: ${new Date().toLocaleString()}
`

fs.writeFileSync('docs/ROUTES.md', markdown)
console.log('路由文档已生成: docs/ROUTES.md')
```

## 关键点总结

1. **按功能拆分**：将路由按业务模块拆分到独立文件
2. **自动化注册**：使用 glob 模式自动导入路由文件
3. **类型安全**：使用 TypeScript 定义路由类型
4. **约定式路由**：基于文件结构自动生成路由
5. **配置验证**：开发环境下验证路由配置的正确性

## 深入一点：路由配置的动态加载

```javascript
// 从远程服务器加载路由配置
async function loadRemoteRoutes() {
  const response = await fetch('/api/routes/config')
  const config = await response.json()
  
  return config.map(item => ({
    path: item.path,
    name: item.name,
    component: () => import(`@/views/${item.component}.vue`),
    meta: item.meta,
    children: item.children ? loadChildRoutes(item.children) : undefined
  }))
}

function loadChildRoutes(children) {
  return children.map(child => ({
    path: child.path,
    component: () => import(`@/views/${child.component}.vue`),
    meta: child.meta
  }))
}

// 应用远程路由
const remoteRoutes = await loadRemoteRoutes()
remoteRoutes.forEach(route => {
  router.addRoute(route)
})
```

## 参考资料

- [Vite - Glob Import](https://vitejs.dev/guide/features.html#glob-import)
- [Webpack - require.context](https://webpack.js.org/guides/dependency-management/#requirecontext)
- [Vue Router - TypeScript](https://router.vuejs.org/zh/guide/advanced/typed-routes.html)
