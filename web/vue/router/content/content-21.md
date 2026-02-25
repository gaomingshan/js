# 第 21 章：权限路由设计

## 概述

权限路由系统是企业级应用的核心功能，涉及用户认证、角色管理、权限验证、动态路由生成等多个方面。本章将介绍完整的权限路由设计方案及其实现细节。

## 基于角色的路由控制

### RBAC 模型实现

```javascript
// stores/user.js
import { defineStore } from 'pinia'
import { login, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
    roles: []
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    hasRole: (state) => (role) => state.roles.includes(role),
    hasAnyRole: (state) => (roles) => roles.some(role => state.roles.includes(role))
  },
  
  actions: {
    async login(credentials) {
      const { token } = await login(credentials)
      this.token = token
      localStorage.setItem('token', token)
    },
    
    async getUserInfo() {
      const { user, roles } = await getUserInfo()
      this.user = user
      this.roles = roles
    },
    
    logout() {
      this.token = ''
      this.user = null
      this.roles = []
      localStorage.removeItem('token')
    }
  }
})
```

### 路由配置

```javascript
// router/routes.js

// 基础路由（所有用户）
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  }
]

// 异步路由（根据角色动态加载）
export const asyncRoutes = [
  {
    path: '/system',
    component: Layout,
    meta: {
      title: '系统管理',
      icon: 'system',
      roles: ['admin']  // 仅管理员可见
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/User.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      },
      {
        path: 'role',
        component: () => import('@/views/system/Role.vue'),
        meta: { title: '角色管理', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/content',
    component: Layout,
    meta: {
      title: '内容管理',
      icon: 'content',
      roles: ['admin', 'editor']  // 管理员和编辑
    },
    children: [
      {
        path: 'article',
        component: () => import('@/views/content/Article.vue'),
        meta: { title: '文章管理', roles: ['admin', 'editor'] }
      },
      {
        path: 'category',
        component: () => import('@/views/content/Category.vue'),
        meta: { title: '分类管理', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404.vue'),
    meta: { hidden: true }
  }
]
```

### 权限过滤逻辑

```javascript
// stores/permission.js
import { defineStore } from 'pinia'
import { constantRoutes, asyncRoutes } from '@/router/routes'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: []
  }),
  
  actions: {
    generateRoutes(roles) {
      return new Promise(resolve => {
        let accessedRoutes
        
        // 管理员拥有所有权限
        if (roles.includes('admin')) {
          accessedRoutes = asyncRoutes
        } else {
          // 根据角色过滤路由
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        }
        
        this.addRoutes = accessedRoutes
        this.routes = constantRoutes.concat(accessedRoutes)
        
        resolve(accessedRoutes)
      })
    }
  }
})

/**
 * 递归过滤异步路由
 * @param {Array} routes 待过滤的路由
 * @param {Array} roles 用户角色
 */
function filterAsyncRoutes(routes, roles) {
  const res = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  
  return res
}

/**
 * 判断是否有权限
 * @param {Array} roles 用户角色
 * @param {Object} route 路由对象
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  }
  // 没有设置角色限制则默认可访问
  return true
}
```

## 动态权限路由方案

### 前端方案（路由配置在前端）

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

const whiteList = ['/login', '/register', '/404']

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  // 已登录
  if (userStore.token) {
    if (to.path === '/login') {
      return '/'
    }
    
    // 检查是否已生成动态路由
    if (permissionStore.routes.length === 0) {
      try {
        // 获取用户信息（包含角色）
        await userStore.getUserInfo()
        
        // 生成可访问的路由
        const accessRoutes = await permissionStore.generateRoutes(userStore.roles)
        
        // 动态添加路由
        accessRoutes.forEach(route => {
          router.addRoute(route)
        })
        
        // 重新导航
        return { ...to, replace: true }
      } catch (error) {
        // 获取用户信息失败
        await userStore.logout()
        return `/login?redirect=${to.path}`
      }
    }
  } else {
    // 未登录
    if (!whiteList.includes(to.path)) {
      return `/login?redirect=${to.path}`
    }
  }
})

export default router
```

### 后端方案（路由配置从后端获取）

```javascript
// api/routes.js
export function getRoutes() {
  return request({
    url: '/api/user/routes',
    method: 'get'
  })
}
```

```javascript
// stores/permission.js
import { getRoutes } from '@/api/routes'
import Layout from '@/layouts/Layout.vue'

// 组件映射表
const componentMap = {
  Layout: Layout,
  Dashboard: () => import('@/views/Dashboard.vue'),
  UserList: () => import('@/views/system/UserList.vue'),
  // ... 其他组件
}

export const usePermissionStore = defineStore('permission', {
  actions: {
    async generateRoutes() {
      // 从后端获取路由配置
      const routesData = await getRoutes()
      
      // 转换为前端路由格式
      const accessRoutes = convertToRoutes(routesData)
      
      this.addRoutes = accessRoutes
      this.routes = constantRoutes.concat(accessRoutes)
      
      return accessRoutes
    }
  }
})

/**
 * 将后端路由数据转换为前端路由格式
 */
function convertToRoutes(routesData) {
  return routesData.map(item => {
    const route = {
      path: item.path,
      name: item.name,
      component: componentMap[item.component],
      meta: {
        title: item.title,
        icon: item.icon,
        hidden: item.hidden,
        ...item.meta
      }
    }
    
    if (item.children && item.children.length > 0) {
      route.children = convertToRoutes(item.children)
    }
    
    return route
  })
}
```

## 菜单与路由的关联

### 自动生成菜单

```vue
<!-- components/Menu/index.vue -->
<template>
  <el-menu
    :default-active="activeMenu"
    mode="vertical"
    @select="handleSelect"
  >
    <menu-item
      v-for="route in routes"
      :key="route.path"
      :item="route"
    />
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import MenuItem from './MenuItem.vue'

const route = useRoute()
const permissionStore = usePermissionStore()

// 过滤隐藏的路由
const routes = computed(() => {
  return permissionStore.routes.filter(route => !route.meta?.hidden)
})

const activeMenu = computed(() => {
  const { meta, path } = route
  // 如果设置了 activeMenu，使用 activeMenu
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

function handleSelect(index) {
  router.push(index)
}
</script>
```

```vue
<!-- components/Menu/MenuItem.vue -->
<template>
  <template v-if="!item.meta?.hidden">
    <!-- 有子菜单 -->
    <el-sub-menu
      v-if="item.children && item.children.length > 0"
      :index="item.path"
    >
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      
      <menu-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
      />
    </el-sub-menu>
    
    <!-- 无子菜单 -->
    <el-menu-item v-else :index="resolvePath(item.path)">
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </el-menu-item>
  </template>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  }
})

function resolvePath(routePath) {
  if (routePath.startsWith('/')) {
    return routePath
  }
  return `${props.basePath}/${routePath}`.replace(/\/+/g, '/')
}
</script>
```

## 权限路由的缓存策略

### LocalStorage 缓存

```javascript
// utils/cache.js
const CACHE_KEY = 'user_routes'
const CACHE_EXPIRE = 24 * 60 * 60 * 1000 // 24小时

export function cacheRoutes(routes) {
  const data = {
    routes,
    timestamp: Date.now()
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

export function getCachedRoutes() {
  const cached = localStorage.getItem(CACHE_KEY)
  
  if (!cached) return null
  
  try {
    const { routes, timestamp } = JSON.parse(cached)
    
    // 检查是否过期
    if (Date.now() - timestamp > CACHE_EXPIRE) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    
    return routes
  } catch (error) {
    return null
  }
}

export function clearCachedRoutes() {
  localStorage.removeItem(CACHE_KEY)
}
```

```javascript
// stores/permission.js
import { cacheRoutes, getCachedRoutes } from '@/utils/cache'

export const usePermissionStore = defineStore('permission', {
  actions: {
    async generateRoutes(roles) {
      // 尝试从缓存读取
      const cached = getCachedRoutes()
      if (cached) {
        this.addRoutes = cached
        this.routes = constantRoutes.concat(cached)
        return cached
      }
      
      // 生成路由
      const accessRoutes = filterAsyncRoutes(asyncRoutes, roles)
      
      // 缓存路由
      cacheRoutes(accessRoutes)
      
      this.addRoutes = accessRoutes
      this.routes = constantRoutes.concat(accessRoutes)
      
      return accessRoutes
    }
  }
})
```

### 版本控制

```javascript
// 路由版本管理
const ROUTES_VERSION = '1.0.0'

export function cacheRoutes(routes) {
  const data = {
    version: ROUTES_VERSION,
    routes,
    timestamp: Date.now()
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

export function getCachedRoutes() {
  const cached = localStorage.getItem(CACHE_KEY)
  
  if (!cached) return null
  
  try {
    const data = JSON.parse(cached)
    
    // 版本不匹配，清除缓存
    if (data.version !== ROUTES_VERSION) {
      clearCachedRoutes()
      return null
    }
    
    // ... 其他检查
    
    return data.routes
  } catch (error) {
    return null
  }
}
```

## 完整权限系统实现

### 权限指令

```javascript
// directives/permission.js
import { useUserStore } from '@/stores/user'

export default {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = userStore.permissions.some(permission => {
        return value.includes(permission)
      })
      
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
}

// 注册
app.directive('permission', permission)

// 使用
<template>
  <button v-permission="['admin']">删除</button>
  <button v-permission="['user:create']">创建用户</button>
</template>
```

### 权限检查函数

```javascript
// composables/usePermission.js
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()
  
  function hasPermission(permissions) {
    if (!permissions || permissions.length === 0) {
      return true
    }
    
    return userStore.permissions.some(permission => {
      return permissions.includes(permission)
    })
  }
  
  function hasRole(roles) {
    if (!roles || roles.length === 0) {
      return true
    }
    
    return userStore.roles.some(role => {
      return roles.includes(role)
    })
  }
  
  function hasAnyPermission(permissions) {
    return permissions.some(permission => {
      return userStore.permissions.includes(permission)
    })
  }
  
  function hasAllPermissions(permissions) {
    return permissions.every(permission => {
      return userStore.permissions.includes(permission)
    })
  }
  
  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions
  }
}

// 使用
<script setup>
import { usePermission } from '@/composables/usePermission'

const { hasPermission, hasRole } = usePermission()

const canDelete = computed(() => hasPermission(['user:delete']))
const isAdmin = computed(() => hasRole(['admin']))
</script>

<template>
  <button v-if="canDelete" @click="deleteUser">删除</button>
  <div v-if="isAdmin">管理员专属内容</div>
</template>
```

## 关键点总结

1. **RBAC 模型**：基于角色的访问控制，动态生成路由
2. **前后端方案**：前端配置（灵活）vs 后端配置（安全）
3. **菜单关联**：根据权限路由自动生成菜单
4. **缓存策略**：使用 LocalStorage 缓存，提升性能
5. **权限指令**：v-permission 指令控制元素显示

## 深入一点：细粒度权限控制

```javascript
// 按钮级权限
const buttonPermissions = {
  'user:create': '创建用户',
  'user:update': '编辑用户',
  'user:delete': '删除用户',
  'user:export': '导出用户'
}

// 字段级权限
const fieldPermissions = {
  'user:view:salary': '查看薪资',
  'user:view:phone': '查看手机号'
}

// 数据级权限（行级）
function canAccessData(data, user) {
  // 管理员可以访问所有数据
  if (user.role === 'admin') {
    return true
  }
  
  // 普通用户只能访问自己的数据
  return data.userId === user.id
}
```

## 参考资料

- [Vue Router - 导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
- [RBAC 权限设计](https://en.wikipedia.org/wiki/Role-based_access_control)
