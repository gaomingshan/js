# 第 7 章：命名视图

## 概述

命名视图允许在同一个路由中同时渲染多个视图组件，而不是嵌套显示。这对于实现复杂的页面布局（如同时显示侧边栏、主内容、底部导航）非常有用。

## 命名视图的使用场景

### 典型布局需求

```
+------------------+------------------+
|                  |                  |
|    Sidebar       |   Main Content   |
|                  |                  |
+------------------+------------------+
|            Footer                   |
+-------------------------------------+
```

**传统方式（组件嵌套）：**
- 将 Sidebar 和 Footer 写在 MainContent 组件内部
- 缺点：组件耦合度高，不够灵活

**命名视图方式：**
- 三个区域独立为三个路由视图
- 优点：解耦，每个视图可独立控制

## components 配置

### 基础用法

```javascript
const routes = [
  {
    path: '/dashboard',
    components: {  // 注意：是 components 不是 component
      default: MainContent,
      sidebar: Sidebar,
      footer: Footer
    }
  }
]
```

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <router-view name="sidebar" class="sidebar" />
    <router-view class="main" />  <!-- 默认视图 -->
    <router-view name="footer" class="footer" />
  </div>
</template>

<style>
#app {
  display: grid;
  grid-template-areas:
    "sidebar main"
    "footer footer";
  grid-template-columns: 200px 1fr;
  grid-template-rows: 1fr auto;
  height: 100vh;
}

.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
</style>
```

### 不同路由渲染不同视图

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: HomeSidebar,
      footer: HomeFooter
    }
  },
  {
    path: '/dashboard',
    components: {
      default: Dashboard,
      sidebar: DashboardSidebar,
      footer: DashboardFooter
    }
  },
  {
    // 某些路由可以不渲染某些视图
    path: '/login',
    components: {
      default: Login
      // 不渲染 sidebar 和 footer
    }
  }
]
```

### 嵌套命名视图

```javascript
const routes = [
  {
    path: '/settings',
    components: {
      default: Settings,
      sidebar: SettingsSidebar
    },
    children: [
      {
        path: 'profile',
        component: UserProfile
      },
      {
        path: 'security',
        components: {  // 子路由也可以使用命名视图
          default: SecuritySettings,
          help: SecurityHelp
        }
      }
    ]
  }
]
```

```vue
<!-- Settings.vue -->
<template>
  <div class="settings-layout">
    <div class="settings-nav">
      <router-link to="/settings/profile">个人资料</router-link>
      <router-link to="/settings/security">安全设置</router-link>
    </div>
    
    <div class="settings-content">
      <router-view />  <!-- 默认视图 -->
      <router-view name="help" />  <!-- 帮助视图 -->
    </div>
  </div>
</template>
```

## 多个 RouterView 的协调

### 默认视图

```vue
<template>
  <div>
    <!-- 未命名的 router-view 为默认视图 -->
    <router-view />
    
    <!-- 等价于 -->
    <router-view name="default" />
  </div>
</template>
```

### 条件渲染视图

```vue
<template>
  <div id="app">
    <!-- 某些路由可能不需要侧边栏 -->
    <router-view name="sidebar" v-if="showSidebar" />
    
    <router-view />
    
    <router-view name="footer" />
  </div>
</template>

<script>
export default {
  computed: {
    showSidebar() {
      // 登录页不显示侧边栏
      return this.$route.path !== '/login'
    }
  }
}
</script>
```

### 视图间通信

```javascript
// 方式 1: 通过路由参数
const routes = [
  {
    path: '/product/:id',
    components: {
      default: ProductDetail,
      sidebar: ProductSidebar
    },
    props: {
      default: true,
      sidebar: true
    }
  }
]

// 方式 2: 通过 Vuex/Pinia 状态管理
// 方式 3: 通过 Provide/Inject
```

## 嵌套命名视图

### 复杂布局示例

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        components: {
          default: DashboardMain,
          statistics: DashboardStats,
          chart: DashboardChart
        }
      },
      {
        path: 'users',
        components: {
          default: UserList,
          filter: UserFilter
        }
      }
    ]
  }
]
```

```vue
<!-- AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <header>顶部导航</header>
    
    <aside class="sidebar">
      侧边栏菜单
    </aside>
    
    <main class="content">
      <div class="top-section">
        <router-view name="statistics" />
        <router-view name="chart" />
      </div>
      
      <div class="main-section">
        <router-view name="filter" />
        <router-view />  <!-- 默认视图 -->
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar content";
  grid-template-columns: 200px 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;
}

.content {
  grid-area: content;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.top-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
</style>
```

## 实战案例：后台布局系统

### 需求分析

后台管理系统通常需要：
1. **顶部导航**：固定，所有页面共享
2. **侧边栏**：不同模块显示不同内容
3. **主内容区**：根据路由变化
4. **面包屑**：根据路由显示导航路径

### 路由配置

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        components: {
          default: Dashboard,
          breadcrumb: DashboardBreadcrumb
        },
        meta: {
          title: '仪表盘',
          icon: 'dashboard'
        }
      },
      {
        path: 'users',
        components: {
          default: UserManagement,
          sidebar: UserSidebar,
          breadcrumb: UserBreadcrumb
        },
        meta: {
          title: '用户管理',
          icon: 'users'
        },
        children: [
          {
            path: '',
            component: UserList
          },
          {
            path: ':id',
            component: UserDetail,
            props: true
          }
        ]
      },
      {
        path: 'settings',
        components: {
          default: SystemSettings,
          sidebar: SettingsSidebar
        },
        meta: {
          title: '系统设置',
          icon: 'settings'
        }
      }
    ]
  }
]
```

### 布局组件

```vue
<!-- AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <!-- 顶部导航 -->
    <header class="admin-header">
      <div class="logo">管理后台</div>
      <nav class="top-nav">
        <router-link to="/admin/dashboard">首页</router-link>
        <router-link to="/admin/users">用户</router-link>
        <router-link to="/admin/settings">设置</router-link>
      </nav>
      <div class="user-menu">
        <span>管理员</span>
        <button @click="logout">退出</button>
      </div>
    </header>
    
    <div class="admin-body">
      <!-- 侧边栏（命名视图） -->
      <aside class="admin-sidebar">
        <router-view name="sidebar">
          <!-- 默认侧边栏内容 -->
          <DefaultSidebar />
        </router-view>
      </aside>
      
      <!-- 主内容区 -->
      <main class="admin-main">
        <!-- 面包屑（命名视图） -->
        <div class="breadcrumb-wrapper">
          <router-view name="breadcrumb">
            <!-- 默认面包屑 -->
            <DefaultBreadcrumb />
          </router-view>
        </div>
        
        <!-- 主内容（默认视图） -->
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      // 退出登录逻辑
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.admin-header {
  height: 60px;
  background: #001529;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.top-nav {
  flex: 1;
  display: flex;
  gap: 20px;
}

.top-nav a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  padding: 0 15px;
}

.top-nav a.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.admin-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.admin-sidebar {
  width: 200px;
  background: #f0f2f5;
  overflow-y: auto;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.breadcrumb-wrapper {
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
```

### 侧边栏组件示例

```vue
<!-- UserSidebar.vue -->
<template>
  <div class="user-sidebar">
    <div class="sidebar-title">用户管理</div>
    <ul class="sidebar-menu">
      <li>
        <router-link to="/admin/users" exact>
          全部用户
        </router-link>
      </li>
      <li>
        <router-link to="/admin/users/active">
          活跃用户
        </router-link>
      </li>
      <li>
        <router-link to="/admin/users/inactive">
          待激活用户
        </router-link>
      </li>
    </ul>
    
    <div class="sidebar-stats">
      <div>总用户数：{{ totalUsers }}</div>
      <div>今日新增：{{ todayNew }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      totalUsers: 1234,
      todayNew: 12
    }
  }
}
</script>

<style scoped>
.sidebar-title {
  padding: 15px;
  font-weight: bold;
  border-bottom: 1px solid #e8e8e8;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
}

.sidebar-menu li a {
  display: block;
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
}

.sidebar-menu li a.router-link-active {
  background: #1890ff;
  color: white;
}

.sidebar-stats {
  padding: 15px;
  border-top: 1px solid #e8e8e8;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.sidebar-stats > div {
  margin-bottom: 8px;
}
</style>
```

## 关键点总结

1. **components vs component**：多视图使用 `components` 对象，单视图使用 `component`
2. **命名 RouterView**：通过 `name` 属性区分不同的视图出口
3. **默认视图**：未命名的 `<router-view>` 对应 `default` 键
4. **灵活布局**：适用于需要同时显示多个独立区域的复杂布局
5. **独立控制**：每个命名视图可以独立配置组件、props、守卫等

## 深入一点：命名视图 + props

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
      default: true,                    // 布尔模式
      sidebar: { theme: 'dark' },       // 对象模式
      reviews: route => ({               // 函数模式
        productId: route.params.id,
        page: Number(route.query.page) || 1
      })
    }
  }
]
```

```vue
<!-- ProductDetail.vue -->
<script>
export default {
  props: ['id']  // 接收路由参数
}
</script>

<!-- ProductSidebar.vue -->
<script>
export default {
  props: ['theme']  // 接收静态 props
}
</script>

<!-- ProductReviews.vue -->
<script>
export default {
  props: ['productId', 'page']  // 接收计算后的 props
}
</script>
```

## 参考资料

- [Vue Router - 命名视图](https://router.vuejs.org/zh/guide/essentials/named-views.html)
- [CSS Grid Layout](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)
