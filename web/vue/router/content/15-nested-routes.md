# 第 15 节：嵌套路由

## 概述

嵌套路由允许在路由组件内部定义子路由，实现复杂的页面结构。通过嵌套路由，可以构建具有多级导航的应用，如用户中心、管理后台等场景。

## 一、嵌套路由基础

### 1.1 基本概念

```
URL 结构：
/user/123/profile      → 用户详情页的个人资料标签
/user/123/posts        → 用户详情页的文章标签
/user/123/settings     → 用户详情页的设置标签

组件结构：
App
└── UserLayout        ← 父路由组件
    ├── UserProfile   ← 子路由组件
    ├── UserPosts     ← 子路由组件  
    └── UserSettings  ← 子路由组件
```

### 1.2 路由配置

```javascript
const routes = [
  {
    path: '/user/:id',
    component: UserLayout,
    children: [
      // 空路径表示默认子路由
      { path: '', component: UserProfile },
      
      // 子路由路径不需要前导斜杠
      { path: 'profile', component: UserProfile },
      { path: 'posts', component: UserPosts },
      { path: 'settings', component: UserSettings }
    ]
  }
]
```

### 1.3 父组件实现

```vue
<!-- UserLayout.vue -->
<template>
  <div class="user-layout">
    <header class="user-header">
      <h1>用户：{{ $route.params.id }}</h1>
      <nav class="user-nav">
        <router-link :to="`/user/${$route.params.id}/profile`">
          个人资料
        </router-link>
        <router-link :to="`/user/${$route.params.id}/posts`">
          文章列表
        </router-link>
        <router-link :to="`/user/${$route.params.id}/settings`">
          设置
        </router-link>
      </nav>
    </header>
    
    <!-- 子路由出口 -->
    <main class="user-content">
      <router-view />
    </main>
  </div>
</template>

<style>
.user-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.user-header {
  background: #f5f5f5;
  padding: 1rem;
}

.user-nav a {
  margin-right: 1rem;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.user-nav a.router-link-active {
  background: #007bff;
  color: white;
}

.user-content {
  flex: 1;
  padding: 1rem;
}
</style>
```

## 二、多级嵌套

### 2.1 深层嵌套结构

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'users',
        component: UserManagement,
        children: [
          { path: '', component: UserList },
          { path: ':id', component: UserDetail },
          { path: ':id/edit', component: UserEdit },
          {
            path: ':id/permissions',
            component: UserPermissions,
            children: [
              { path: '', component: PermissionList },
              { path: 'roles', component: RoleAssignment },
              { path: 'custom', component: CustomPermissions }
            ]
          }
        ]
      },
      {
        path: 'settings',
        component: SystemSettings,
        children: [
          { path: '', redirect: 'general' },
          { path: 'general', component: GeneralSettings },
          { path: 'security', component: SecuritySettings },
          { path: 'notifications', component: NotificationSettings }
        ]
      }
    ]
  }
]
```

### 2.2 嵌套组件实现

```vue
<!-- AdminLayout.vue 第一层 -->
<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <nav>
        <router-link to="/admin/users">用户管理</router-link>
        <router-link to="/admin/settings">系统设置</router-link>
      </nav>
    </aside>
    
    <main class="content">
      <!-- 第二层路由出口 -->
      <router-view />
    </main>
  </div>
</template>

<!-- UserManagement.vue 第二层 -->
<template>
  <div class="user-management">
    <header class="section-header">
      <h2>用户管理</h2>
      <nav class="sub-nav">
        <router-link to="/admin/users">用户列表</router-link>
        <router-link to="/admin/users/new">新增用户</router-link>
      </nav>
    </header>
    
    <!-- 第三层路由出口 -->
    <div class="section-content">
      <router-view />
    </div>
  </div>
</template>

<!-- UserPermissions.vue 第三层 -->
<template>
  <div class="user-permissions">
    <div class="permission-tabs">
      <router-link :to="`/admin/users/${userId}/permissions`">
        权限概览
      </router-link>
      <router-link :to="`/admin/users/${userId}/permissions/roles`">
        角色分配
      </router-link>
      <router-link :to="`/admin/users/${userId}/permissions/custom`">
        自定义权限
      </router-link>
    </div>
    
    <!-- 第四层路由出口 -->
    <div class="permission-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = computed(() => route.params.id)
</script>
```

## 三、默认子路由

### 3.1 空路径子路由

```javascript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      // 当访问 /dashboard 时，默认显示 Overview
      { path: '', component: Overview },
      { path: 'analytics', component: Analytics },
      { path: 'reports', component: Reports }
    ]
  }
]
```

### 3.2 重定向默认路由

```javascript
const routes = [
  {
    path: '/settings',
    component: Settings,
    children: [
      // 重定向到具体的子路由
      { path: '', redirect: 'profile' },
      { path: 'profile', component: ProfileSettings },
      { path: 'account', component: AccountSettings },
      { path: 'privacy', component: PrivacySettings }
    ]
  }
]
```

### 3.3 条件默认路由

```javascript
const routes = [
  {
    path: '/user/:id',
    component: UserLayout,
    beforeEnter: (to, from) => {
      // 根据用户权限决定默认子路由
      const userRole = getUserRole(to.params.id)
      
      if (to.path === `/user/${to.params.id}`) {
        if (userRole === 'admin') {
          return { path: `/user/${to.params.id}/manage` }
        } else {
          return { path: `/user/${to.params.id}/profile` }
        }
      }
    },
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'manage', component: UserManage }
    ]
  }
]
```

## 四、动态嵌套路由

### 4.1 基于数据的路由生成

```javascript
// 动态生成嵌套路由
const createUserRoutes = (userData) => {
  const baseRoute = {
    path: '/user/:id',
    component: UserLayout,
    children: [
      { path: '', component: UserProfile },
      { path: 'profile', component: UserProfile }
    ]
  }
  
  // 根据用户类型添加不同的子路由
  if (userData.type === 'premium') {
    baseRoute.children.push(
      { path: 'premium', component: PremiumFeatures },
      { path: 'analytics', component: UserAnalytics }
    )
  }
  
  if (userData.role === 'admin') {
    baseRoute.children.push(
      { path: 'admin', component: AdminPanel },
      { path: 'manage', component: UserManagement }
    )
  }
  
  return baseRoute
}

// 在路由守卫中动态添加路由
router.beforeEach(async (to, from) => {
  if (to.path.startsWith('/user/') && to.params.id) {
    const userData = await fetchUserData(to.params.id)
    const userRoute = createUserRoutes(userData)
    
    // 动态添加路由
    router.addRoute(userRoute)
  }
})
```

### 4.2 模块化嵌套路由

```javascript
// modules/user.js
export const userRoutes = {
  path: '/user/:id',
  component: () => import('@/layouts/UserLayout.vue'),
  children: [
    {
      path: '',
      name: 'UserHome',
      component: () => import('@/views/user/UserHome.vue')
    },
    {
      path: 'profile',
      name: 'UserProfile', 
      component: () => import('@/views/user/UserProfile.vue')
    }
  ]
}

// modules/admin.js
export const adminRoutes = {
  path: '/admin',
  component: () => import('@/layouts/AdminLayout.vue'),
  meta: { requiresAuth: true, roles: ['admin'] },
  children: [
    {
      path: '',
      redirect: 'dashboard'
    },
    {
      path: 'dashboard',
      component: () => import('@/views/admin/Dashboard.vue')
    }
  ]
}

// router/index.js
import { userRoutes } from './modules/user'
import { adminRoutes } from './modules/admin'

const routes = [
  {
    path: '/',
    component: HomeLayout,
    children: [
      { path: '', component: Home }
    ]
  },
  userRoutes,
  adminRoutes
]
```

## 五、嵌套路由守卫

### 5.1 父子路由守卫执行顺序

```javascript
const routes = [
  {
    path: '/protected',
    component: ProtectedLayout,
    beforeEnter: (to, from) => {
      console.log('1. 父路由 beforeEnter')
      return checkAuth()
    },
    children: [
      {
        path: 'admin',
        component: AdminPanel,
        beforeEnter: (to, from) => {
          console.log('2. 子路由 beforeEnter')
          return checkAdminRole()
        }
      }
    ]
  }
]

// 执行顺序：
// 1. 全局 beforeEach
// 2. 父路由 beforeEnter
// 3. 子路由 beforeEnter  
// 4. 组件内 beforeRouteEnter
// 5. 全局 beforeResolve
// 6. 全局 afterEach
```

### 5.2 嵌套路由权限控制

```javascript
// 分层权限检查
const routes = [
  {
    path: '/company/:companyId',
    component: CompanyLayout,
    beforeEnter: async (to, from) => {
      // 检查公司访问权限
      const hasCompanyAccess = await checkCompanyAccess(to.params.companyId)
      
      if (!hasCompanyAccess) {
        return { name: 'AccessDenied' }
      }
    },
    children: [
      {
        path: 'projects/:projectId',
        component: ProjectLayout,
        beforeEnter: async (to, from) => {
          // 检查项目访问权限
          const hasProjectAccess = await checkProjectAccess(
            to.params.companyId,
            to.params.projectId
          )
          
          if (!hasProjectAccess) {
            return { name: 'ProjectAccessDenied' }
          }
        },
        children: [
          {
            path: 'tasks',
            component: TaskList,
            beforeEnter: async (to, from) => {
              // 检查任务查看权限
              return checkTaskPermission(to.params, 'read')
            }
          },
          {
            path: 'settings',
            component: ProjectSettings,
            beforeEnter: async (to, from) => {
              // 检查设置权限
              return checkTaskPermission(to.params, 'admin')
            }
          }
        ]
      }
    ]
  }
]
```

## 六、嵌套路由数据共享

### 6.1 Provide/Inject 模式

```vue
<!-- 父组件：UserLayout.vue -->
<script setup>
import { provide, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userData = ref(null)
const loading = ref(false)

// 提供用户数据给子组件
provide('userData', computed(() => userData.value))
provide('userLoading', computed(() => loading.value))

// 提供用户操作方法
const updateUser = async (updates) => {
  try {
    loading.value = true
    const updated = await api.updateUser(route.params.id, updates)
    userData.value = { ...userData.value, ...updated }
  } finally {
    loading.value = false
  }
}

provide('updateUser', updateUser)

// 初始加载用户数据
onMounted(async () => {
  loading.value = true
  try {
    userData.value = await api.getUser(route.params.id)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="user-layout">
    <header>用户：{{ userData?.name }}</header>
    <nav><!-- 导航 --></nav>
    <router-view />
  </div>
</template>
```

```vue
<!-- 子组件：UserProfile.vue -->
<script setup>
import { inject } from 'vue'

// 注入父组件提供的数据和方法
const userData = inject('userData')
const userLoading = inject('userLoading')
const updateUser = inject('updateUser')

const handleSave = async (formData) => {
  await updateUser(formData)
}
</script>

<template>
  <div v-if="userLoading">加载中...</div>
  <div v-else-if="userData">
    <h2>个人资料</h2>
    <form @submit.prevent="handleSave">
      <input v-model="userData.name" />
      <button type="submit">保存</button>
    </form>
  </div>
</template>
```

### 6.2 状态管理集成

```javascript
// store/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    userProjects: [],
    loading: false
  }),
  
  actions: {
    async loadUser(userId) {
      this.loading = true
      try {
        this.currentUser = await api.getUser(userId)
        this.userProjects = await api.getUserProjects(userId)
      } finally {
        this.loading = false
      }
    },
    
    async updateUser(updates) {
      const updated = await api.updateUser(this.currentUser.id, updates)
      this.currentUser = { ...this.currentUser, ...updated }
    }
  }
})
```

```vue
<!-- UserLayout.vue -->
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

// 监听路由参数变化，加载用户数据
watch(
  () => route.params.id,
  (userId) => {
    if (userId) {
      userStore.loadUser(userId)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="user-layout">
    <div v-if="userStore.loading">加载中...</div>
    <div v-else-if="userStore.currentUser">
      <header>{{ userStore.currentUser.name }}</header>
      <router-view />
    </div>
  </div>
</template>
```

## 七、嵌套路由性能优化

### 7.1 懒加载嵌套组件

```javascript
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/layouts/Dashboard.vue'),
    children: [
      {
        path: '',
        component: () => import(
          /* webpackChunkName: "dashboard-overview" */
          '@/views/dashboard/Overview.vue'
        )
      },
      {
        path: 'analytics',
        component: () => import(
          /* webpackChunkName: "dashboard-analytics" */
          '@/views/dashboard/Analytics.vue'
        )
      },
      {
        path: 'reports',
        component: () => import(
          /* webpackChunkName: "dashboard-reports" */
          '@/views/dashboard/Reports.vue'
        )
      }
    ]
  }
]
```

### 7.2 缓存策略

```vue
<!-- 父组件中的缓存控制 -->
<template>
  <div class="layout">
    <nav><!-- 导航 --></nav>
    
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedComponents">
        <component :is="Component" :key="getCacheKey(route)" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 需要缓存的组件
const cachedComponents = ref([
  'DashboardOverview',
  'UserProfile', 
  'ProjectList'
])

// 生成缓存键
const getCacheKey = (currentRoute) => {
  // 对于需要基于参数缓存的路由，生成唯一键
  if (currentRoute.name === 'UserProfile') {
    return `${currentRoute.name}-${currentRoute.params.id}`
  }
  
  return currentRoute.name
}
</script>
```

## 八、嵌套路由测试

### 8.1 路由结构测试

```javascript
// tests/router.spec.js
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'

describe('嵌套路由', () => {
  let router
  
  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes
    })
  })
  
  test('用户路由嵌套结构', async () => {
    await router.push('/user/123/profile')
    
    expect(router.currentRoute.value.path).toBe('/user/123/profile')
    expect(router.currentRoute.value.params.id).toBe('123')
    
    // 检查匹配的路由记录层级
    const matched = router.currentRoute.value.matched
    expect(matched).toHaveLength(2) // 父路由 + 子路由
    expect(matched[0].path).toBe('/user/:id')
    expect(matched[1].path).toBe('profile')
  })
  
  test('默认子路由重定向', async () => {
    await router.push('/user/123')
    
    // 应该重定向到默认子路由
    expect(router.currentRoute.value.path).toBe('/user/123/profile')
  })
})
```

### 8.2 组件集成测试

```javascript
// tests/UserLayout.spec.js
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import UserLayout from '@/layouts/UserLayout.vue'
import UserProfile from '@/views/UserProfile.vue'

describe('UserLayout 嵌套组件', () => {
  test('渲染子路由组件', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/user/:id',
          component: UserLayout,
          children: [
            { path: 'profile', component: UserProfile }
          ]
        }
      ]
    })
    
    await router.push('/user/123/profile')
    
    const wrapper = mount(UserLayout, {
      global: {
        plugins: [router]
      }
    })
    
    // 验证父组件渲染
    expect(wrapper.find('.user-layout').exists()).toBe(true)
    
    // 验证子组件渲染
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(UserProfile).exists()).toBe(true)
  })
})
```

## 九、常见问题与解决

### 9.1 路径解析问题

```javascript
// ❌ 错误：子路由路径以 / 开头
const routes = [
  {
    path: '/user/:id',
    component: UserLayout,
    children: [
      { path: '/profile', component: UserProfile } // 错误！
    ]
  }
]

// ✅ 正确：子路由路径不要以 / 开头
const routes = [
  {
    path: '/user/:id', 
    component: UserLayout,
    children: [
      { path: 'profile', component: UserProfile } // 正确
    ]
  }
]
```

### 9.2 router-view 缺失

```vue
<!-- ❌ 错误：父组件没有 router-view -->
<template>
  <div class="user-layout">
    <h1>用户页面</h1>
    <!-- 缺少 router-view，子路由不会渲染 -->
  </div>
</template>

<!-- ✅ 正确：父组件包含 router-view -->
<template>
  <div class="user-layout">
    <h1>用户页面</h1>
    <router-view /> <!-- 子路由渲染出口 -->
  </div>
</template>
```

### 9.3 参数传递问题

```vue
<!-- 解决方案：确保参数正确传递给子组件 -->
<template>
  <div class="user-layout">
    <router-view :user-id="$route.params.id" />
  </div>
</template>
```

## 十、最佳实践

### 10.1 目录结构组织

```
src/
├── layouts/           # 布局组件
│   ├── UserLayout.vue
│   ├── AdminLayout.vue
│   └── DefaultLayout.vue
├── views/             # 页面组件
│   ├── user/
│   │   ├── UserProfile.vue
│   │   ├── UserPosts.vue
│   │   └── UserSettings.vue
│   └── admin/
│       ├── Dashboard.vue
│       └── UserManagement.vue
└── router/
    ├── index.js       # 主路由文件
    └── modules/       # 模块化路由
        ├── user.js
        └── admin.js
```

### 10.2 命名约定

```javascript
// ✅ 清晰的路由命名
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: UserLayout,
    children: [
      { 
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile 
      },
      { 
        path: 'settings',
        name: 'UserSettings', 
        component: UserSettings
      }
    ]
  }
]

// 导航时使用名称
router.push({ 
  name: 'UserProfile',
  params: { id: '123' }
})
```

## 十一、总结

| 特性 | 说明 |
|------|------|
| 嵌套结构 | 子路由在父路由组件内渲染 |
| 路径拼接 | 子路径自动拼接到父路径后 |
| 参数继承 | 子路由可访问父路由参数 |
| 多层嵌套 | 支持任意层级的路由嵌套 |
| 默认路由 | 空路径或重定向设置默认子路由 |
| 独立守卫 | 父子路由可有独立的导航守卫 |

## 参考资料

- [嵌套路由](https://router.vuejs.org/guide/essentials/nested-routes.html)
- [命名路由](https://router.vuejs.org/guide/essentials/named-routes.html)

---

**下一节** → [第 16 节：命名路由与视图](./16-named-routes-views.md)
