# 路由实战案例

> 通过实际案例掌握 Vue Router 在真实项目中的应用。

## 完整的后台管理系统

### 路由架构设计

```typescript
// router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { setupGuards } from './guards'

// 公开路由（无需登录）
export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { layout: 'blank', title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { layout: 'blank', title: '注册' }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { layout: 'blank' }
  }
]

// 基础路由（登录后可访问）
export const basicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Index.vue'),
    meta: {
      title: '仪表盘',
      icon: 'dashboard',
      requiresAuth: true
    }
  }
]

// 动态路由（根据权限加载）
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'system',
      requiresAuth: true,
      roles: ['admin']
    },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/Index.vue'),
        meta: {
          title: '用户管理',
          icon: 'user',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/Index.vue'),
        meta: {
          title: '角色管理',
          icon: 'role',
          requiresAuth: true,
          roles: ['admin']
        }
      },
      {
        path: 'menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/menu/Index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'menu',
          requiresAuth: true,
          roles: ['admin']
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...publicRoutes, ...basicRoutes],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 设置路由守卫
setupGuards(router)

export default router
```

### 路由守卫配置

```typescript
// router/guards.ts
import { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import NProgress from 'nprogress'

export function setupGuards(router: Router) {
  // 进度条
  router.beforeEach(() => {
    NProgress.start()
  })
  
  router.afterEach(() => {
    NProgress.done()
  })
  
  // 白名单
  const whiteList = ['/login', '/register', '/404']
  
  // 权限验证
  router.beforeEach(async (to, from) => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    
    // 已登录
    if (userStore.token) {
      // 访问登录页则重定向到首页
      if (to.path === '/login') {
        return '/'
      }
      
      // 动态路由未加载
      if (!permissionStore.routesLoaded) {
        try {
          // 获取用户信息
          await userStore.getUserInfo()
          
          // 生成动态路由
          const accessRoutes = await permissionStore.generateRoutes(userStore.roles)
          
          // 添加动态路由
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          
          // 添加 404 路由
          router.addRoute({
            path: '/:pathMatch(.*)*',
            redirect: '/404'
          })
          
          permissionStore.routesLoaded = true
          
          // 重新进入目标路由
          return { ...to, replace: true }
        } catch (error) {
          // 清除token并重定向到登录页
          await userStore.logout()
          return `/login?redirect=${to.path}`
        }
      }
      
      return true
    }
    
    // 未登录
    if (whiteList.includes(to.path)) {
      return true
    }
    
    return `/login?redirect=${to.path}`
  })
  
  // 页面标题
  router.afterEach((to) => {
    document.title = to.meta.title 
      ? `${to.meta.title} - 后台管理系统`
      : '后台管理系统'
  })
}
```

### 权限路由管理

```typescript
// stores/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { asyncRoutes } from '@/router'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    routesLoaded: false
  }),
  
  actions: {
    generateRoutes(roles: string[]) {
      return new Promise<RouteRecordRaw[]>((resolve) => {
        let accessedRoutes: RouteRecordRaw[]
        
        if (roles.includes('admin')) {
          // 管理员拥有所有权限
          accessedRoutes = asyncRoutes
        } else {
          // 根据角色过滤路由
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        }
        
        this.routes = accessedRoutes
        resolve(accessedRoutes)
      })
    },
    
    resetRoutes() {
      this.routes = []
      this.routesLoaded = false
    }
  }
})

function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []
  
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

function hasPermission(roles: string[], route: RouteRecordRaw): boolean {
  if (route.meta?.roles) {
    return roles.some(role => (route.meta!.roles as string[]).includes(role))
  }
  return true
}
```

---

## 多标签页系统

### 标签页管理

```typescript
// stores/tabs.ts
import { defineStore } from 'pinia'
import { RouteLocationNormalized } from 'vue-router'

export interface Tab {
  name: string
  path: string
  title: string
  closable: boolean
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    visitedTabs: [] as Tab[],
    cachedViews: [] as string[]
  }),
  
  actions: {
    addTab(route: RouteLocationNormalized) {
      const tab: Tab = {
        name: route.name as string,
        path: route.path,
        title: route.meta.title as string || route.name as string,
        closable: route.name !== 'Dashboard'
      }
      
      if (this.visitedTabs.some(v => v.path === tab.path)) return
      
      this.visitedTabs.push(tab)
      
      if (route.meta.cache) {
        this.cachedViews.push(route.name as string)
      }
    },
    
    closeTab(path: string) {
      const index = this.visitedTabs.findIndex(v => v.path === path)
      if (index > -1) {
        this.visitedTabs.splice(index, 1)
      }
    },
    
    closeOtherTabs(path: string) {
      this.visitedTabs = this.visitedTabs.filter(
        v => v.path === path || !v.closable
      )
    },
    
    closeAllTabs() {
      this.visitedTabs = this.visitedTabs.filter(v => !v.closable)
    },
    
    updateCache(name: string) {
      if (!this.cachedViews.includes(name)) {
        this.cachedViews.push(name)
      }
    },
    
    removeCache(name: string) {
      const index = this.cachedViews.indexOf(name)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    }
  }
})
```

### 标签页组件

```vue
<!-- components/TabsView.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.visitedTabs)
const isActive = (path: string) => route.path === path

function handleClose(tab: Tab, index: number) {
  tabsStore.closeTab(tab.path)
  
  // 如果关闭的是当前标签
  if (route.path === tab.path) {
    const nextTab = tabs.value[index] || tabs.value[index - 1]
    if (nextTab) {
      router.push(nextTab.path)
    }
  }
}

function handleContextMenu(e: MouseEvent, tab: Tab) {
  e.preventDefault()
  // 显示右键菜单
}

// 监听路由变化
watch(() => route.path, () => {
  tabsStore.addTab(route)
}, { immediate: true })
</script>

<template>
  <div class="tabs-view">
    <div class="tabs-wrapper">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.path"
        :class="['tab-item', { active: isActive(tab.path) }]"
        @click="router.push(tab.path)"
        @contextmenu="handleContextMenu($event, tab)"
      >
        <span>{{ tab.title }}</span>
        <button
          v-if="tab.closable"
          class="close-btn"
          @click.stop="handleClose(tab, index)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-view {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.tabs-wrapper {
  display: flex;
  padding: 5px 10px;
  gap: 5px;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.tab-item:hover {
  background: #e8e8e8;
}

.tab-item.active {
  background: #42b983;
  color: white;
}

.close-btn {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
}
</style>
```

---

## 面包屑导航

```vue
<!-- components/Breadcrumb.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(
    r => r.meta?.title && r.meta?.breadcrumb !== false
  )
  
  return matched.map(r => ({
    title: r.meta.title,
    path: r.path,
    redirect: r.redirect
  }))
})

const isLink = (item: any) => {
  return !item.redirect && item.path !== route.path
}
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="item.path"
    >
      <router-link v-if="isLink(item)" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
```

---

## 侧边栏菜单

```vue
<!-- components/SidebarMenu.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const permissionStore = usePermissionStore()

const menuRoutes = computed(() => permissionStore.routes)

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const hasChildren = (item: any) => {
  return item.children && item.children.length > 0
}
</script>

<template>
  <el-menu
    :default-active="route.path"
    :collapse="collapsed"
    router
  >
    <template v-for="item in menuRoutes" :key="item.path">
      <!-- 有子菜单 -->
      <el-sub-menu v-if="hasChildren(item)" :index="item.path">
        <template #title>
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <span>{{ item.meta.title }}</span>
        </template>
        
        <el-menu-item
          v-for="child in item.children"
          :key="child.path"
          :index="child.path"
        >
          <el-icon><component :is="child.meta.icon" /></el-icon>
          <span>{{ child.meta.title }}</span>
        </el-menu-item>
      </el-sub-menu>
      
      <!-- 无子菜单 -->
      <el-menu-item v-else :index="item.path">
        <el-icon><component :is="item.meta.icon" /></el-icon>
        <span>{{ item.meta.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>
```

---

## 路由级代码分割

### Webpack 配置

```javascript
// vue.config.js
module.exports = {
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // 第三方库
          vendor: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          // Element Plus
          elementUI: {
            name: 'chunk-element-plus',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-plus(.*)/
          },
          // 公共组件
          commons: {
            name: 'chunk-commons',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      }
    }
  }
}
```

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts']
        }
      }
    }
  }
})
```

---

## 路由过渡效果

```vue
<!-- App.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('fade')

// 根据路由层级决定过渡方向
watch(
  () => route.path,
  (to, from) => {
    const toDepth = to.split('/').length
    const fromDepth = from?.split('/').length || 0
    transitionName.value = toDepth < fromDepth ? 'slide-right' : 'slide-left'
  }
)
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 左滑 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 右滑 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

---

## 路由性能监控

```typescript
// plugins/router-performance.ts
import { Router } from 'vue-router'

export function setupPerformanceMonitor(router: Router) {
  let startTime: number
  
  router.beforeEach((to, from) => {
    startTime = performance.now()
  })
  
  router.afterEach((to) => {
    const duration = performance.now() - startTime
    
    // 发送到分析服务
    if (duration > 1000) {
      console.warn(`路由 ${to.path} 加载耗时 ${duration}ms`)
      
      // 发送到监控平台
      sendToMonitor({
        route: to.path,
        duration,
        timestamp: Date.now()
      })
    }
  })
}
```

---

## 最佳实践总结

### 1. 路由设计

- 扁平化路由结构
- 语义化路由命名
- 合理的嵌套层级
- 统一的命名规范

### 2. 权限控制

- 路由级权限控制
- 菜单权限过滤
- 按钮级权限控制
- 动态路由加载

### 3. 性能优化

- 路由懒加载
- 代码分割
- 预加载策略
- 组件缓存

### 4. 用户体验

- 加载进度提示
- 页面过渡动画
- 面包屑导航
- 多标签页管理

### 5. 错误处理

- 404 页面
- 权限错误页
- 网络错误处理
- 路由错误捕获

### 6. 开发规范

- TypeScript 类型定义
- 路由元信息规范
- 守卫逻辑分离
- 单元测试覆盖

---

## 完整项目结构

```
src/
├── router/
│   ├── index.ts              # 路由配置
│   ├── guards.ts             # 路由守卫
│   ├── routes/
│   │   ├── public.ts         # 公开路由
│   │   ├── basic.ts          # 基础路由
│   │   └── async.ts          # 动态路由
│   └── types.ts              # 类型定义
├── stores/
│   ├── user.ts               # 用户状态
│   ├── permission.ts         # 权限状态
│   └── tabs.ts               # 标签页状态
├── views/
│   ├── auth/
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── dashboard/
│   │   └── Index.vue
│   ├── system/
│   │   ├── user/
│   │   ├── role/
│   │   └── menu/
│   └── error/
│       ├── 404.vue
│       └── 403.vue
├── layouts/
│   ├── DefaultLayout.vue     # 默认布局
│   ├── BlankLayout.vue       # 空白布局
│   └── components/
│       ├── Sidebar.vue       # 侧边栏
│       ├── Header.vue        # 头部
│       ├── TabsView.vue      # 标签页
│       └── Breadcrumb.vue    # 面包屑
└── App.vue
```

---

## 参考资料

- [Vue Router 官方文档](https://router.vuejs.org/)
- [Vue 3 后台管理系统最佳实践](https://github.com/vbenjs/vue-vben-admin)
- [Element Plus Admin](https://github.com/element-plus/element-plus-admin)
