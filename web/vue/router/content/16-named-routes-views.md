# 第 16 节：命名路由与视图

## 概述

命名路由和命名视图是 Vue Router 的高级功能，命名路由提供了路由引用的便捷方式，命名视图则允许在同一级路由中同时显示多个组件。这些功能让路由系统更加灵活和强大。

## 一、命名路由

### 1.1 基本使用

```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfile
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail
  }
]
```

### 1.2 声明式导航

```vue
<template>
  <!-- 使用路径 -->
  <router-link to="/user/123">用户资料</router-link>
  
  <!-- 使用命名路由 -->
  <router-link :to="{ name: 'UserProfile', params: { id: '123' } }">
    用户资料
  </router-link>
  
  <!-- 带查询参数的命名路由 -->
  <router-link :to="{ 
    name: 'ProductDetail', 
    params: { id: '456' },
    query: { tab: 'reviews' }
  }">
    产品详情
  </router-link>
</template>
```

### 1.3 编程式导航

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 使用命名路由导航
const navigateToUser = (userId) => {
  router.push({ 
    name: 'UserProfile', 
    params: { id: userId }
  })
}

// 替换当前路由
const replaceRoute = () => {
  router.replace({ 
    name: 'Home' 
  })
}

// 带查询参数导航
const searchProducts = (keyword) => {
  router.push({
    name: 'ProductSearch',
    query: { q: keyword, page: 1 }
  })
}
</script>
```

## 二、命名路由优势

### 2.1 可维护性

```javascript
// ❌ 使用硬编码路径
const routes = [
  { path: '/very/long/path/to/user/:id/profile/:section', component: UserProfile }
]

// 模板中使用
<router-link to="/very/long/path/to/user/123/profile/settings">设置</router-link>

// ✅ 使用命名路由
const routes = [
  { 
    path: '/very/long/path/to/user/:id/profile/:section',
    name: 'UserProfileSection',
    component: UserProfile 
  }
]

// 模板中使用
<router-link :to="{ 
  name: 'UserProfileSection', 
  params: { id: '123', section: 'settings' }
}">
  设置
</router-link>
```

### 2.2 类型安全

```typescript
// TypeScript 中的路由类型定义
interface RouteNames {
  Home: undefined
  UserProfile: { id: string }
  ProductDetail: { id: string }
  Search: { category?: string }
}

// 类型安全的导航函数
const navigateTo = <T extends keyof RouteNames>(
  name: T,
  params: RouteNames[T]
) => {
  router.push({ name, params })
}

// 使用时会有类型检查
navigateTo('UserProfile', { id: '123' })  // ✅ 正确
navigateTo('UserProfile', { name: 'test' })  // ❌ 类型错误
```

### 2.3 重构友好

```javascript
// 路径变更时，只需要修改路由定义
const routes = [
  {
    // path: '/user/:id',           // 旧路径
    path: '/profile/:id',           // 新路径
    name: 'UserProfile',            // 名称保持不变
    component: UserProfile
  }
]

// 所有使用命名路由的地方无需修改
router.push({ name: 'UserProfile', params: { id: '123' } })
```

## 三、命名视图基础

### 3.1 多个 router-view

```vue
<template>
  <div class="layout">
    <!-- 默认视图 -->
    <router-view />
    
    <!-- 命名视图 -->
    <router-view name="sidebar" />
    <router-view name="footer" />
  </div>
</template>
```

### 3.2 路由配置

```javascript
const routes = [
  {
    path: '/dashboard',
    components: {  // 注意：这里是 components 复数
      default: Dashboard,
      sidebar: DashboardSidebar,
      footer: DashboardFooter
    }
  },
  {
    path: '/profile',
    components: {
      default: UserProfile,
      sidebar: ProfileSidebar
      // footer 视图不指定，会显示空白
    }
  }
]
```

### 3.3 懒加载命名视图

```javascript
const routes = [
  {
    path: '/admin',
    components: {
      default: () => import('@/views/AdminDashboard.vue'),
      sidebar: () => import('@/components/AdminSidebar.vue'),
      toolbar: () => import('@/components/AdminToolbar.vue')
    }
  }
]
```

## 四、复杂布局实现

### 4.1 多栏布局

```vue
<template>
  <div class="complex-layout">
    <!-- 顶部导航 -->
    <header class="header">
      <router-view name="header" />
    </header>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <router-view name="sidebar" />
      </aside>
      
      <!-- 中间内容 -->
      <main class="content">
        <router-view />
      </main>
      
      <!-- 右侧面板 -->
      <aside class="panel">
        <router-view name="panel" />
      </aside>
    </div>
    
    <!-- 底部 -->
    <footer class="footer">
      <router-view name="footer" />
    </footer>
  </div>
</template>

<style>
.complex-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 250px 1fr 300px;
  grid-template-areas:
    "header header header"
    "sidebar content panel"
    "footer footer footer";
  height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.panel { grid-area: panel; }
.footer { grid-area: footer; }
</style>
```

### 4.2 对应的路由配置

```javascript
const routes = [
  {
    path: '/workspace',
    components: {
      default: WorkspaceMain,
      header: WorkspaceHeader,
      sidebar: WorkspaceNav,
      panel: WorkspacePanel,
      footer: WorkspaceFooter
    },
    meta: {
      layout: 'workspace'
    }
  },
  {
    path: '/editor/:id',
    components: {
      default: CodeEditor,
      header: EditorHeader,
      sidebar: FileExplorer,
      panel: EditorPanel
      // footer 不指定，该区域为空
    }
  }
]
```

## 五、嵌套命名视图

### 5.1 嵌套结构

```javascript
const routes = [
  {
    path: '/app',
    component: AppLayout,
    children: [
      {
        path: 'dashboard',
        components: {
          default: Dashboard,
          sidebar: DashboardSidebar,
          quickActions: QuickActions
        }
      },
      {
        path: 'settings',
        components: {
          default: Settings,
          sidebar: SettingsSidebar
          // quickActions 不指定
        }
      }
    ]
  }
]
```

### 5.2 父级布局组件

```vue
<!-- AppLayout.vue -->
<template>
  <div class="app-layout">
    <nav class="top-nav">
      <router-link to="/app/dashboard">仪表板</router-link>
      <router-link to="/app/settings">设置</router-link>
    </nav>
    
    <div class="app-body">
      <!-- 主内容 -->
      <main class="main">
        <router-view />
      </main>
      
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <router-view name="sidebar" />
      </aside>
      
      <!-- 快捷操作 -->
      <div class="quick-actions">
        <router-view name="quickActions" />
      </div>
    </div>
  </div>
</template>
```

## 六、动态命名视图

### 6.1 基于条件的视图切换

```javascript
// 动态生成命名视图配置
const createRouteComponents = (userRole) => {
  const components = {
    default: Dashboard
  }
  
  // 根据用户角色添加不同的侧边栏
  if (userRole === 'admin') {
    components.sidebar = AdminSidebar
    components.toolbar = AdminToolbar
  } else if (userRole === 'manager') {
    components.sidebar = ManagerSidebar
    components.toolbar = ManagerToolbar
  } else {
    components.sidebar = UserSidebar
  }
  
  return components
}

// 在路由守卫中动态设置
router.beforeEach(async (to, from) => {
  if (to.path === '/dashboard') {
    const userRole = await getCurrentUserRole()
    const components = createRouteComponents(userRole)
    
    // 动态更新路由配置
    router.removeRoute('Dashboard')
    router.addRoute({
      path: '/dashboard',
      name: 'Dashboard',
      components
    })
  }
})
```

### 6.2 响应式视图配置

```vue
<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const screenSize = ref('desktop')

// 根据屏幕大小决定视图布局
const viewComponents = computed(() => {
  const base = { default: route.matched[0].components.default }
  
  if (screenSize.value === 'mobile') {
    // 移动端只显示主视图
    return base
  } else if (screenSize.value === 'tablet') {
    // 平板显示主视图和侧边栏
    return {
      ...base,
      sidebar: route.matched[0].components.sidebar
    }
  } else {
    // 桌面显示所有视图
    return route.matched[0].components
  }
})

// 监听屏幕尺寸变化
const updateScreenSize = () => {
  const width = window.innerWidth
  if (width < 768) {
    screenSize.value = 'mobile'
  } else if (width < 1024) {
    screenSize.value = 'tablet'
  } else {
    screenSize.value = 'desktop'
  }
}

onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>
```

## 七、命名视图数据传递

### 7.1 Props 传递

```javascript
const routes = [
  {
    path: '/product/:id',
    components: {
      default: ProductDetail,
      sidebar: ProductSidebar,
      reviews: ProductReviews
    },
    props: {
      default: true,        // 将 route.params 作为 props 传递给 ProductDetail
      sidebar: true,        // 将 route.params 作为 props 传递给 ProductSidebar
      reviews: (route) => ({ // 自定义 props 生成函数
        productId: route.params.id,
        page: parseInt(route.query.page) || 1
      })
    }
  }
]
```

### 7.2 共享状态管理

```javascript
// store/product.js
import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    currentProduct: null,
    reviews: [],
    loading: false
  }),
  
  actions: {
    async loadProduct(id) {
      this.loading = true
      try {
        this.currentProduct = await api.getProduct(id)
        this.reviews = await api.getProductReviews(id)
      } finally {
        this.loading = false
      }
    }
  }
})
```

```vue
<!-- ProductDetail.vue -->
<script setup>
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
// 使用共享的产品数据
</script>

<!-- ProductSidebar.vue -->
<script setup>
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
// 访问同样的产品数据
</script>
```

## 八、性能优化

### 8.1 视图懒加载

```javascript
const routes = [
  {
    path: '/heavy-page',
    components: {
      default: () => import(
        /* webpackChunkName: "heavy-main" */
        '@/views/HeavyMain.vue'
      ),
      sidebar: () => import(
        /* webpackChunkName: "heavy-sidebar" */
        '@/components/HeavySidebar.vue'
      ),
      panel: () => import(
        /* webpackChunkName: "heavy-panel" */
        '@/components/HeavyPanel.vue'
      )
    }
  }
]
```

### 8.2 条件加载

```javascript
// 只在需要时加载特定视图
const routes = [
  {
    path: '/conditional',
    components: {
      default: MainView,
      // 根据权限条件加载
      admin: () => {
        if (hasAdminRole()) {
          return import('@/components/AdminPanel.vue')
        }
        return Promise.resolve(null)
      }
    }
  }
]
```

### 8.3 预加载策略

```javascript
// 预加载相关视图组件
const preloadComponents = () => {
  // 预加载可能用到的组件
  import('@/components/ProductSidebar.vue')
  import('@/components/UserPanel.vue')
}

// 在合适的时机预加载
router.afterEach((to) => {
  if (to.name === 'Home') {
    // 在首页时预加载其他组件
    setTimeout(preloadComponents, 1000)
  }
})
```

## 九、测试策略

### 9.1 命名路由测试

```javascript
// tests/router.spec.js
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'

describe('命名路由', () => {
  let router
  
  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes
    })
  })
  
  test('命名路由导航', async () => {
    await router.push({ 
      name: 'UserProfile', 
      params: { id: '123' }
    })
    
    expect(router.currentRoute.value.name).toBe('UserProfile')
    expect(router.currentRoute.value.params.id).toBe('123')
  })
  
  test('路由解析', () => {
    const resolved = router.resolve({
      name: 'ProductDetail',
      params: { id: '456' },
      query: { tab: 'reviews' }
    })
    
    expect(resolved.path).toBe('/product/456')
    expect(resolved.query.tab).toBe('reviews')
  })
})
```

### 9.2 命名视图测试

```javascript
// tests/NamedViews.spec.js
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

describe('命名视图', () => {
  test('多视图渲染', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/dashboard',
          components: {
            default: { template: '<div>Main</div>' },
            sidebar: { template: '<div>Sidebar</div>' }
          }
        }
      ]
    })
    
    await router.push('/dashboard')
    
    const wrapper = mount({
      template: `
        <div>
          <router-view />
          <router-view name="sidebar" />
        </div>
      `
    }, {
      global: { plugins: [router] }
    })
    
    expect(wrapper.text()).toContain('Main')
    expect(wrapper.text()).toContain('Sidebar')
  })
})
```

## 十、最佳实践

### 10.1 命名约定

```javascript
// ✅ 好的命名约定
const routes = [
  {
    name: 'Home',                    // 简洁明了
    path: '/',
    component: Home
  },
  {
    name: 'UserProfile',             // 描述性强
    path: '/user/:id',
    component: UserProfile
  },
  {
    name: 'ProductDetail',           // 一致的命名风格
    path: '/product/:id',
    component: ProductDetail
  },
  {
    name: 'AdminUserManagement',     // 层级清晰
    path: '/admin/users',
    component: AdminUserManagement
  }
]

// ❌ 避免的命名
const badRoutes = [
  { name: 'page1', path: '/', component: Home },           // 不描述
  { name: 'user_profile', path: '/user/:id' },            // 不一致的风格
  { name: 'ProductDetailPageComponent', path: '/product' } // 冗余
]
```

### 10.2 视图组织

```javascript
// ✅ 清晰的视图组织
const routes = [
  {
    path: '/workspace',
    components: {
      default: WorkspaceMain,      // 主要内容
      navigation: WorkspaceNav,    // 导航
      toolbar: WorkspaceToolbar,   // 工具栏
      status: WorkspaceStatus      // 状态栏
    }
  }
]

// 对应的模板结构
<template>
  <div class="workspace-layout">
    <header><router-view name="toolbar" /></header>
    <nav><router-view name="navigation" /></nav>
    <main><router-view /></main>
    <footer><router-view name="status" /></footer>
  </div>
</template>
```

### 10.3 错误处理

```javascript
// 处理命名路由不存在的情况
const safeNavigate = (name, params = {}) => {
  try {
    const resolved = router.resolve({ name, params })
    
    if (resolved.matched.length === 0) {
      console.error(`路由 "${name}" 不存在`)
      router.push({ name: 'NotFound' })
      return
    }
    
    router.push({ name, params })
  } catch (error) {
    console.error('导航失败:', error)
    router.push({ name: 'Error' })
  }
}
```

## 十一、总结

| 特性 | 优势 | 使用场景 |
|------|------|----------|
| 命名路由 | 可维护、类型安全、重构友好 | 复杂路径、频繁导航 |
| 命名视图 | 灵活布局、组件分离 | 多栏布局、仪表板 |
| 嵌套命名视图 | 层级清晰、结构化 | 复杂应用、管理后台 |
| 动态视图 | 响应式布局、条件显示 | 权限控制、响应式设计 |

## 参考资料

- [命名路由](https://router.vuejs.org/guide/essentials/named-routes.html)
- [命名视图](https://router.vuejs.org/guide/essentials/named-views.html)

---

**下一节** → [第 17 节：路由匹配算法](./17-route-matching.md)
