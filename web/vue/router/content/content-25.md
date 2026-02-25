# 第 25 章：实战案例集

## 概述

本章通过 8 个完整的实战案例，展示 Vue Router 在真实项目中的应用，涵盖后台管理系统、多标签页、路由级 Loading、面包屑导航等常见需求。

## 后台管理系统路由设计

### 需求分析

- 多层级菜单导航
- 基于角色的权限控制
- 动态路由生成
- 菜单与路由联动

### 完整实现

```javascript
// router/modules/admin.js
export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: {
      title: '控制台',
      icon: 'dashboard'
    },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      },
      {
        path: 'system',
        meta: { title: '系统管理', icon: 'setting' },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('@/views/admin/system/User.vue'),
            meta: { 
              title: '用户管理',
              roles: ['admin'],
              permissions: ['user:read']
            }
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('@/views/admin/system/Role.vue'),
            meta: { 
              title: '角色管理',
              roles: ['admin']
            }
          }
        ]
      }
    ]
  }
]
```

```vue
<!-- layouts/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">Admin System</div>
      <admin-menu :routes="menuRoutes" />
    </aside>
    
    <div class="main-container">
      <header class="header">
        <breadcrumb />
        <user-dropdown />
      </header>
      
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'
import AdminMenu from './components/AdminMenu.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import UserDropdown from './components/UserDropdown.vue'

const permissionStore = usePermissionStore()

const menuRoutes = computed(() => {
  return permissionStore.routes.filter(route => !route.meta?.hidden)
})

const cachedViews = computed(() => {
  return permissionStore.routes
    .filter(route => route.meta?.keepAlive)
    .map(route => route.name)
})
</script>
```

## 多标签页路由管理

### 功能需求

- 打开的页面显示为标签页
- 可关闭、刷新标签页
- 记录访问历史
- 右键菜单（关闭其他、关闭所有）

### 实现方案

```javascript
// stores/tabs.js
import { defineStore } from 'pinia'

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    visitedViews: [],
    cachedViews: []
  }),
  
  actions: {
    addView(view) {
      // 添加到访问列表
      if (this.visitedViews.some(v => v.path === view.path)) {
        return
      }
      
      this.visitedViews.push({
        name: view.name,
        path: view.path,
        title: view.meta?.title || 'No Title',
        query: view.query,
        params: view.params
      })
      
      // 添加到缓存列表
      if (view.meta?.keepAlive) {
        this.cachedViews.push(view.name)
      }
    },
    
    closeView(view) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index > -1) {
        this.visitedViews.splice(index, 1)
      }
      
      const cacheIndex = this.cachedViews.indexOf(view.name)
      if (cacheIndex > -1) {
        this.cachedViews.splice(cacheIndex, 1)
      }
    },
    
    closeOthersViews(view) {
      this.visitedViews = this.visitedViews.filter(v => 
        v.path === view.path || v.meta?.affix
      )
    },
    
    closeAllViews() {
      this.visitedViews = this.visitedViews.filter(v => v.meta?.affix)
      this.cachedViews = []
    },
    
    refreshView(view) {
      const cacheIndex = this.cachedViews.indexOf(view.name)
      if (cacheIndex > -1) {
        this.cachedViews.splice(cacheIndex, 1)
        
        this.$nextTick(() => {
          this.cachedViews.push(view.name)
        })
      }
    }
  }
})
```

```vue
<!-- components/TabsView.vue -->
<template>
  <div class="tabs-view">
    <div class="tabs-container">
      <div
        v-for="tab in tabsStore.visitedViews"
        :key="tab.path"
        class="tab-item"
        :class="{ active: isActive(tab) }"
        @click="handleTabClick(tab)"
        @contextmenu.prevent="handleContextMenu($event, tab)"
      >
        <span>{{ tab.title }}</span>
        <icon-close
          v-if="!tab.meta?.affix"
          @click.stop="closeTab(tab)"
        />
      </div>
    </div>
    
    <context-menu
      v-model:show="contextMenuVisible"
      :style="{ left: menuLeft + 'px', top: menuTop + 'px' }"
    >
      <div @click="refreshTab">刷新</div>
      <div @click="closeCurrentTab">关闭</div>
      <div @click="closeOtherTabs">关闭其他</div>
      <div @click="closeAllTabs">关闭所有</div>
    </context-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

const contextMenuVisible = ref(false)
const menuLeft = ref(0)
const menuTop = ref(0)
const selectedTab = ref(null)

function isActive(tab) {
  return tab.path === route.path
}

function handleTabClick(tab) {
  router.push(tab.path)
}

function handleContextMenu(event, tab) {
  contextMenuVisible.value = true
  menuLeft.value = event.clientX
  menuTop.value = event.clientY
  selectedTab.value = tab
}

function closeTab(tab) {
  tabsStore.closeView(tab)
  
  if (isActive(tab)) {
    const lastView = tabsStore.visitedViews[tabsStore.visitedViews.length - 1]
    if (lastView) {
      router.push(lastView.path)
    } else {
      router.push('/')
    }
  }
}

function refreshTab() {
  tabsStore.refreshView(selectedTab.value)
  router.replace({ path: '/redirect' + selectedTab.value.path })
}

function closeCurrentTab() {
  closeTab(selectedTab.value)
}

function closeOtherTabs() {
  tabsStore.closeOthersViews(selectedTab.value)
  if (!isActive(selectedTab.value)) {
    router.push(selectedTab.value.path)
  }
}

function closeAllTabs() {
  tabsStore.closeAllViews()
  router.push('/')
}

// 监听路由变化，添加标签页
watch(() => route.path, () => {
  tabsStore.addView(route)
}, { immediate: true })
</script>
```

## 路由级 Loading 状态

### 实现方案

```javascript
// composables/useRouteLoading.js
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useRouteLoading() {
  const loading = ref(false)
  const router = useRouter()
  
  router.beforeEach(() => {
    loading.value = true
  })
  
  router.afterEach(() => {
    setTimeout(() => {
      loading.value = false
    }, 200)
  })
  
  return { loading }
}
```

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <transition name="loading">
      <div v-if="loading" class="global-loading">
        <div class="loading-spinner"></div>
      </div>
    </transition>
    
    <router-view />
  </div>
</template>

<script setup>
import { useRouteLoading } from '@/composables/useRouteLoading'

const { loading } = useRouteLoading()
</script>

<style>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>
```

## 面包屑导航实现

### 完整方案

```vue
<!-- components/Breadcrumb.vue -->
<template>
  <div class="breadcrumb">
    <transition-group name="breadcrumb">
      <span
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
        class="breadcrumb-item"
      >
        <router-link
          v-if="index < breadcrumbs.length - 1"
          :to="item.path"
        >
          {{ item.title }}
        </router-link>
        <span v-else class="current">{{ item.title }}</span>
        <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
      </span>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  
  return matched.map(item => {
    const breadcrumb = item.meta.breadcrumb
    
    return {
      path: item.path,
      title: typeof breadcrumb === 'function'
        ? breadcrumb(route)
        : breadcrumb || item.meta.title
    }
  })
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}

.breadcrumb-item a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-item a:hover {
  color: #1890ff;
}

.breadcrumb-item .current {
  color: #333;
  font-weight: 500;
}

.separator {
  color: #ccc;
  margin: 0 4px;
}

.breadcrumb-enter-active {
  transition: all 0.3s ease-out;
}

.breadcrumb-leave-active {
  transition: all 0.2s ease-in;
}

.breadcrumb-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
```

## 页面缓存与刷新

### Keep-Alive 缓存管理

```vue
<!-- layouts/Layout.vue -->
<template>
  <div class="layout">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="appStore.routerViewKey" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTabsStore } from '@/stores/tabs'
import { useAppStore } from '@/stores/app'

const tabsStore = useTabsStore()
const appStore = useAppStore()

const cachedViews = computed(() => {
  return tabsStore.cachedViews
})
</script>
```

### 轻量级页面刷新

**核心思路：** 通过递增 `key` 强制组件重新渲染，无需额外路由。

```javascript
// stores/app.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 单调递增的 key，用于强制刷新路由视图
  const routerViewKey = ref(0)

  // 刷新当前视图的方法
  function refreshRouterView() {
    routerViewKey.value++
  }

  return { routerViewKey, refreshRouterView }
})
```

```vue
<!-- 在需要刷新的地方使用 -->
<template>
  <div>
    <button @click="handleRefresh">刷新页面</button>
    <!-- 其他内容 -->
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

function handleRefresh() {
  appStore.refreshRouterView()
}
</script>
```

**优势对比：**

| 特性 | 重定向方案 | Key 递增方案（推荐） |
|------|-----------|---------------------|
| **代码量** | 需要 Redirect 组件和路由 | 只需 store 管理 key |
| **路由配置** | 需要额外路由 | 无需额外配置 |
| **URL 变化** | 临时跳转到 `/redirect` | 保持当前 URL 不变 |
| **浏览器历史** | 会留下历史记录 | 不影响历史记录 |
| **性能** | 涉及路由跳转 | 仅组件重新渲染 |
| **实现复杂度** | 中等 | 简单 |

## 路由错误边界

### 全局错误处理

```vue
<!-- components/RouteErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-container">
    <h1>页面加载失败</h1>
    <p>{{ error.message }}</p>
    <button @click="retry">重试</button>
    <button @click="goHome">返回首页</button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  return false
})

function retry() {
  error.value = null
  router.go(0)
}

function goHome() {
  error.value = null
  router.push('/')
}
</script>
```

## SEO 优化方案

### SSR 路由配置

```javascript
// server.js
import { createSSRApp } from 'vue'
import { createMemoryHistory } from 'vue-router'
import { createRouter } from './router'

app.get('*', async (req, res) => {
  const app = createSSRApp(App)
  
  const router = createRouter(createMemoryHistory())
  app.use(router)
  
  await router.push(req.url)
  await router.isReady()
  
  const ctx = {}
  const html = await renderToString(app, ctx)
  
  // 设置meta标签
  const meta = router.currentRoute.value.meta
  const title = meta.title || '默认标题'
  const description = meta.description || '默认描述'
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}">
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>
  `)
})
```

### 预渲染方案

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePluginPrerenderRoutes } from 'vite-plugin-prerender-routes'

export default defineConfig({
  plugins: [
    vue(),
    VitePluginPrerenderRoutes({
      routes: ['/', '/about', '/products'],
      rendererOptions: {
        renderAfterDocumentEvent: 'render-event'
      }
    })
  ]
})
```

## 路由埋点统计

### 页面访问统计

```javascript
// router/analytics.js
export function setupAnalytics(router) {
  router.afterEach((to, from) => {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: to.fullPath,
        page_title: to.meta.title
      })
    }
    
    // 百度统计
    if (window._hmt) {
      window._hmt.push(['_trackPageview', to.fullPath])
    }
    
    // 自定义埋点
    trackPageView({
      path: to.fullPath,
      title: to.meta.title,
      from: from.fullPath,
      timestamp: Date.now()
    })
  })
}

function trackPageView(data) {
  // 上报到自己的分析系统
  fetch('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}
```

## 参考资料

- [Vue Router - 最佳实践](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
- [Vue - 服务端渲染](https://cn.vuejs.org/guide/scaling-up/ssr.html)
- [Google Analytics](https://developers.google.com/analytics)
