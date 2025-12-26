# 第 13 节：路由元信息

## 概述

路由元信息（Route Meta Fields）是附加在路由记录上的自定义数据，用于存储页面标题、权限要求、布局信息等额外配置。通过元信息，可以实现灵活的路由行为控制。

## 一、基础用法

### 1.1 定义元信息

```javascript
const routes = [
  {
    path: '/',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: false,
      layout: 'default'
    }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      title: '仪表板',
      requiresAuth: true,
      roles: ['admin', 'user'],
      breadcrumb: '仪表板'
    }
  }
]
```

### 1.2 访问元信息

```vue
<template>
  <div>
    <h1>{{ pageTitle }}</h1>
    <p v-if="$route.meta.description">{{ $route.meta.description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取页面标题
const pageTitle = computed(() => {
  return route.meta?.title || '默认标题'
})

// 检查权限要求
const requiresAuth = computed(() => {
  return route.meta?.requiresAuth || false
})

// 获取所需角色
const requiredRoles = computed(() => {
  return route.meta?.roles || []
})
</script>
```

### 1.3 嵌套路由的元信息

```javascript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    meta: {
      title: '用户中心',
      requiresAuth: true
    },
    children: [
      {
        path: 'profile',
        component: UserProfile,
        meta: {
          title: '个人资料',
          breadcrumb: '个人资料'
        }
      },
      {
        path: 'settings',
        component: UserSettings,
        meta: {
          title: '账户设置',
          breadcrumb: '设置'
        }
      }
    ]
  }
]
```

## 二、常用元信息字段

### 2.1 页面信息

```javascript
const routes = [
  {
    path: '/article/:id',
    component: Article,
    meta: {
      // 页面标题
      title: '文章详情',
      
      // 页面描述
      description: '查看文章详细内容',
      
      // 关键词
      keywords: ['文章', '详情', '内容'],
      
      // 作者
      author: 'Vue Team',
      
      // 页面类型
      pageType: 'article'
    }
  }
]
```

### 2.2 权限控制

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminDashboard,
    meta: {
      // 需要登录
      requiresAuth: true,
      
      // 需要的角色
      roles: ['admin'],
      
      // 需要的权限
      permissions: ['admin:read', 'admin:write'],
      
      // 权限级别
      level: 5,
      
      // 是否为敏感页面
      sensitive: true
    }
  }
]
```

### 2.3 布局配置

```javascript
const routes = [
  {
    path: '/login',
    component: Login,
    meta: {
      // 使用的布局
      layout: 'auth',
      
      // 隐藏导航
      hideNavigation: true,
      
      // 隐藏页脚
      hideFooter: true,
      
      // 全屏显示
      fullscreen: true
    }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      layout: 'admin',
      sidebar: true,
      breadcrumb: true
    }
  }
]
```

### 2.4 行为控制

```javascript
const routes = [
  {
    path: '/form',
    component: FormPage,
    meta: {
      // 离开时确认
      confirmLeave: true,
      
      // 缓存组件
      keepAlive: true,
      
      // 滚动到顶部
      scrollToTop: false,
      
      // 过渡动画
      transition: 'slide-left',
      
      // 预加载数据
      preload: true
    }
  }
]
```

## 三、动态页面标题

### 3.1 全局标题管理

```javascript
// 在全局后置守卫中设置页面标题
router.afterEach((to, from) => {
  // 设置页面标题
  const title = getPageTitle(to)
  document.title = title
  
  // 更新其他 meta 标签
  updateMetaTags(to.meta)
})

function getPageTitle(route) {
  const baseTitle = 'My App'
  
  if (route.meta?.title) {
    return `${route.meta.title} - ${baseTitle}`
  }
  
  return baseTitle
}

function updateMetaTags(meta) {
  // 更新描述
  if (meta?.description) {
    updateOrCreateMeta('description', meta.description)
  }
  
  // 更新关键词
  if (meta?.keywords) {
    const keywords = Array.isArray(meta.keywords) 
      ? meta.keywords.join(', ') 
      : meta.keywords
    updateOrCreateMeta('keywords', keywords)
  }
  
  // 更新 Open Graph 标签
  if (meta?.og) {
    Object.entries(meta.og).forEach(([key, value]) => {
      updateOrCreateMeta(`og:${key}`, value, 'property')
    })
  }
}

function updateOrCreateMeta(name, content, attributeName = 'name') {
  let meta = document.querySelector(`meta[${attributeName}="${name}"]`)
  
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attributeName, name)
    document.head.appendChild(meta)
  }
  
  meta.setAttribute('content', content)
}
```

### 3.2 组件内标题更新

```vue
<script setup>
import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 动态更新页面标题
const updateTitle = () => {
  let title = route.meta?.title || '页面'
  
  // 如果有参数，可以动态生成标题
  if (route.params.id) {
    title = `${title} - ${route.params.id}`
  }
  
  document.title = `${title} - My App`
}

// 监听路由变化
watch(() => route.fullPath, updateTitle, { immediate: true })

onMounted(() => {
  updateTitle()
})
</script>
```

### 3.3 基于数据的动态标题

```vue
<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userData = ref(null)

// 基于数据生成标题
const dynamicTitle = computed(() => {
  const baseTitle = route.meta?.title || '用户'
  
  if (userData.value) {
    return `${userData.value.name} - ${baseTitle}`
  }
  
  return baseTitle
})

// 监听标题变化并更新
watch(dynamicTitle, (newTitle) => {
  document.title = `${newTitle} - My App`
}, { immediate: true })

// 加载用户数据
onMounted(async () => {
  if (route.params.userId) {
    try {
      const response = await fetch(`/api/users/${route.params.userId}`)
      userData.value = await response.json()
    } catch (error) {
      console.error('用户数据加载失败:', error)
    }
  }
})
</script>
```

## 四、权限系统集成

### 4.1 权限检查守卫

```javascript
// 基于元信息的权限检查
router.beforeEach(async (to, from) => {
  const { meta } = to
  
  // 检查登录要求
  if (meta.requiresAuth) {
    const isAuthenticated = await checkAuthentication()
    
    if (!isAuthenticated) {
      return {
        name: 'Login',
        query: { redirect: to.fullPath }
      }
    }
  }
  
  // 检查角色要求
  if (meta.roles && meta.roles.length > 0) {
    const userRoles = await getUserRoles()
    const hasRequiredRole = meta.roles.some(role => userRoles.includes(role))
    
    if (!hasRequiredRole) {
      return { name: 'Forbidden' }
    }
  }
  
  // 检查权限要求
  if (meta.permissions) {
    const userPermissions = await getUserPermissions()
    const hasAllPermissions = meta.permissions.every(permission =>
      userPermissions.includes(permission)
    )
    
    if (!hasAllPermissions) {
      return { name: 'AccessDenied' }
    }
  }
  
  // 检查权限级别
  if (meta.level) {
    const userLevel = await getUserLevel()
    
    if (userLevel < meta.level) {
      return { name: 'InsufficientLevel' }
    }
  }
})
```

### 4.2 权限验证工具

```javascript
// 权限验证工具类
class PermissionChecker {
  constructor() {
    this.currentUser = null
    this.permissions = []
    this.roles = []
  }
  
  async initialize() {
    try {
      this.currentUser = await getCurrentUser()
      this.permissions = await getUserPermissions(this.currentUser.id)
      this.roles = this.currentUser.roles || []
    } catch (error) {
      console.error('权限初始化失败:', error)
      this.reset()
    }
  }
  
  reset() {
    this.currentUser = null
    this.permissions = []
    this.roles = []
  }
  
  checkRouteMeta(meta) {
    // 检查登录状态
    if (meta.requiresAuth && !this.currentUser) {
      return { allowed: false, reason: 'not_authenticated' }
    }
    
    // 检查角色
    if (meta.roles && meta.roles.length > 0) {
      const hasRole = meta.roles.some(role => this.roles.includes(role))
      if (!hasRole) {
        return { allowed: false, reason: 'insufficient_role' }
      }
    }
    
    // 检查权限
    if (meta.permissions && meta.permissions.length > 0) {
      const hasPermission = meta.permissions.every(permission =>
        this.permissions.includes(permission)
      )
      if (!hasPermission) {
        return { allowed: false, reason: 'insufficient_permission' }
      }
    }
    
    // 检查级别
    if (meta.level && this.currentUser.level < meta.level) {
      return { allowed: false, reason: 'insufficient_level' }
    }
    
    return { allowed: true }
  }
}

const permissionChecker = new PermissionChecker()

// 在应用启动时初始化
permissionChecker.initialize()

// 在守卫中使用
router.beforeEach((to, from) => {
  const check = permissionChecker.checkRouteMeta(to.meta)
  
  if (!check.allowed) {
    switch (check.reason) {
      case 'not_authenticated':
        return { name: 'Login' }
      case 'insufficient_role':
      case 'insufficient_permission':
      case 'insufficient_level':
        return { name: 'AccessDenied' }
      default:
        return { name: 'Error' }
    }
  }
})
```

## 五、布局系统

### 5.1 动态布局选择

```vue
<!-- App.vue -->
<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 导入布局组件
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import FullscreenLayout from '@/layouts/FullscreenLayout.vue'

const route = useRoute()

// 布局映射
const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
  admin: AdminLayout,
  fullscreen: FullscreenLayout
}

// 根据路由元信息选择布局
const layoutComponent = computed(() => {
  const layoutName = route.meta?.layout || 'default'
  return layouts[layoutName] || layouts.default
})
</script>
```

### 5.2 布局配置

```javascript
const routes = [
  {
    path: '/login',
    component: Login,
    meta: {
      layout: 'auth',
      hideNavigation: true,
      hideFooter: true,
      containerClass: 'auth-container'
    }
  },
  {
    path: '/admin',
    component: AdminDashboard,
    meta: {
      layout: 'admin',
      sidebar: {
        collapsed: false,
        theme: 'dark'
      },
      header: {
        showUser: true,
        showNotifications: true
      }
    }
  }
]
```

### 5.3 布局组件实现

```vue
<!-- AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <header v-if="showHeader" class="admin-header">
      <div class="logo">Admin Panel</div>
      <div class="header-actions">
        <notifications v-if="headerConfig.showNotifications" />
        <user-menu v-if="headerConfig.showUser" />
      </div>
    </header>
    
    <div class="admin-body">
      <aside 
        v-if="showSidebar" 
        :class="[
          'admin-sidebar',
          { 'collapsed': sidebarConfig.collapsed }
        ]"
      >
        <navigation-menu :theme="sidebarConfig.theme" />
      </aside>
      
      <main class="admin-main">
        <breadcrumb v-if="showBreadcrumb" />
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const showHeader = computed(() => route.meta?.header !== false)
const showSidebar = computed(() => route.meta?.sidebar !== false)
const showBreadcrumb = computed(() => route.meta?.breadcrumb === true)

const headerConfig = computed(() => ({
  showUser: true,
  showNotifications: true,
  ...route.meta?.header
}))

const sidebarConfig = computed(() => ({
  collapsed: false,
  theme: 'light',
  ...route.meta?.sidebar
}))
</script>
```

## 六、面包屑导航

### 6.1 基于路由层级的面包屑

```vue
<template>
  <nav class="breadcrumb">
    <router-link
      v-for="(crumb, index) in breadcrumbs"
      :key="index"
      :to="crumb.path"
      :class="{
        'breadcrumb-item': true,
        'current': index === breadcrumbs.length - 1
      }"
    >
      {{ crumb.title }}
      <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  // 获取匹配的路由记录
  const matched = route.matched.filter(record => record.meta?.breadcrumb)
  
  return matched.map((record, index) => {
    // 构建路径
    let path = record.path
    
    // 替换动态参数
    Object.keys(route.params).forEach(key => {
      path = path.replace(`:${key}`, route.params[key])
    })
    
    return {
      title: record.meta.breadcrumb,
      path: path,
      isLast: index === matched.length - 1
    }
  })
})
</script>
```

### 6.2 自定义面包屑

```javascript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    meta: {
      breadcrumb: '用户中心'
    },
    children: [
      {
        path: ':id',
        component: UserDetail,
        meta: {
          breadcrumb: (route) => {
            // 动态生成面包屑标题
            return `用户 ${route.params.id}`
          }
        }
      },
      {
        path: ':id/edit',
        component: UserEdit,
        meta: {
          breadcrumb: '编辑用户'
        }
      }
    ]
  }
]
```

```vue
<script setup>
const breadcrumbs = computed(() => {
  return route.matched
    .filter(record => record.meta?.breadcrumb)
    .map(record => {
      let title = record.meta.breadcrumb
      
      // 如果是函数，调用获取标题
      if (typeof title === 'function') {
        title = title(route)
      }
      
      return {
        title,
        path: generatePath(record, route)
      }
    })
})
</script>
```

## 七、SEO 优化

### 7.1 meta 标签管理

```javascript
// SEO 元信息管理器
class SEOManager {
  constructor() {
    this.defaultMeta = {
      title: 'My App',
      description: 'A Vue.js application',
      keywords: 'vue, javascript, spa',
      author: 'Vue Team',
      robots: 'index,follow'
    }
  }
  
  updateSEOMeta(routeMeta) {
    const meta = { ...this.defaultMeta, ...routeMeta }
    
    // 更新页面标题
    document.title = meta.title
    
    // 更新基础 meta 标签
    this.updateMeta('description', meta.description)
    this.updateMeta('keywords', meta.keywords)
    this.updateMeta('author', meta.author)
    this.updateMeta('robots', meta.robots)
    
    // 更新 Open Graph 标签
    this.updateOpenGraph(meta)
    
    // 更新 Twitter Card 标签
    this.updateTwitterCard(meta)
  }
  
  updateMeta(name, content) {
    if (!content) return
    
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = name
      document.head.appendChild(meta)
    }
    meta.content = content
  }
  
  updateOpenGraph(meta) {
    const ogMeta = {
      'og:title': meta.title,
      'og:description': meta.description,
      'og:type': meta.type || 'website',
      'og:url': window.location.href,
      'og:image': meta.image,
      'og:site_name': meta.siteName || this.defaultMeta.title
    }
    
    Object.entries(ogMeta).forEach(([property, content]) => {
      if (content) {
        this.updateMetaProperty(property, content)
      }
    })
  }
  
  updateTwitterCard(meta) {
    const twitterMeta = {
      'twitter:card': meta.twitterCard || 'summary',
      'twitter:title': meta.title,
      'twitter:description': meta.description,
      'twitter:image': meta.image,
      'twitter:site': meta.twitterSite
    }
    
    Object.entries(twitterMeta).forEach(([name, content]) => {
      if (content) {
        this.updateMeta(name, content)
      }
    })
  }
  
  updateMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('property', property)
      document.head.appendChild(meta)
    }
    meta.content = content
  }
}

const seoManager = new SEOManager()

// 在路由守卫中使用
router.afterEach((to) => {
  seoManager.updateSEOMeta(to.meta)
})
```

### 7.2 结构化数据

```javascript
// 结构化数据管理
const addStructuredData = (data) => {
  // 移除旧的结构化数据
  const oldScript = document.querySelector('script[type="application/ld+json"]')
  if (oldScript) {
    document.head.removeChild(oldScript)
  }
  
  // 添加新的结构化数据
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

// 在路由中使用
const routes = [
  {
    path: '/article/:id',
    component: Article,
    meta: {
      title: '文章详情',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': '文章标题',
        'author': {
          '@type': 'Person',
          'name': '作者姓名'
        }
      }
    }
  }
]

router.afterEach((to) => {
  if (to.meta.structuredData) {
    addStructuredData(to.meta.structuredData)
  }
})
```

## 八、TypeScript 支持

### 8.1 类型定义

```typescript
// 扩展 RouteMeta 接口
declare module 'vue-router' {
  interface RouteMeta {
    // 页面信息
    title?: string
    description?: string
    keywords?: string | string[]
    
    // 权限控制
    requiresAuth?: boolean
    roles?: string[]
    permissions?: string[]
    level?: number
    
    // 布局配置
    layout?: 'default' | 'auth' | 'admin' | 'fullscreen'
    hideNavigation?: boolean
    hideFooter?: boolean
    sidebar?: boolean | {
      collapsed?: boolean
      theme?: 'light' | 'dark'
    }
    
    // 行为控制
    keepAlive?: boolean
    transition?: string
    scrollToTop?: boolean
    breadcrumb?: string | ((route: RouteLocationNormalized) => string)
    
    // SEO
    robots?: string
    canonical?: string
    
    // 自定义数据
    [key: string]: any
  }
}
```

### 8.2 类型安全的路由配置

```typescript
import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: {
      title: '管理后台',
      requiresAuth: true,
      roles: ['admin'],
      layout: 'admin',
      sidebar: {
        collapsed: false,
        theme: 'dark'
      }
    }
  }
]
```

## 九、最佳实践

### 9.1 元信息组织

```javascript
// ✅ 好的实践：结构化组织元信息
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      // 页面信息
      page: {
        title: '仪表板',
        description: '数据总览',
        keywords: ['dashboard', 'analytics']
      },
      
      // 权限配置
      auth: {
        required: true,
        roles: ['user', 'admin'],
        level: 1
      },
      
      // 布局配置
      layout: {
        name: 'admin',
        sidebar: true,
        breadcrumb: true
      },
      
      // SEO 配置
      seo: {
        robots: 'noindex',
        canonical: '/dashboard'
      }
    }
  }
]

// ❌ 避免的做法：扁平化所有配置
const routes = [
  {
    path: '/dashboard',
    meta: {
      title: '仪表板',
      requiresAuth: true,
      roles: ['user', 'admin'],
      level: 1,
      layout: 'admin',
      sidebar: true,
      breadcrumb: true,
      robots: 'noindex'
      // 所有配置混在一起，难以管理
    }
  }
]
```

### 9.2 默认值处理

```javascript
// 创建带默认值的元信息处理器
const createMetaProcessor = (defaults) => {
  return (routeMeta) => {
    return {
      ...defaults,
      ...routeMeta
    }
  }
}

const defaultMeta = {
  requiresAuth: false,
  layout: 'default',
  keepAlive: false,
  scrollToTop: true
}

const processMeta = createMetaProcessor(defaultMeta)

// 在守卫中使用
router.beforeEach((to) => {
  const meta = processMeta(to.meta)
  // 使用处理后的元信息
})
```

## 十、总结

| 用途 | 元信息字段 | 说明 |
|------|-----------|------|
| 页面信息 | title, description | SEO 和显示 |
| 权限控制 | requiresAuth, roles | 访问控制 |
| 布局配置 | layout, sidebar | UI 布局 |
| 行为控制 | keepAlive, transition | 页面行为 |
| 导航辅助 | breadcrumb | 面包屑导航 |

## 参考资料

- [路由元信息](https://router.vuejs.org/guide/advanced/meta.html)
- [导航守卫中的元信息](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards)

---

**下一节** → [第 14 节：过渡动画](./14-transitions.md)
