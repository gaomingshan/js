# 第 6 章：嵌套路由

## 概述

嵌套路由允许我们构建具有层级结构的页面，是实现复杂布局（如后台管理系统）的核心功能。通过嵌套路由，可以在父组件内部渲染子路由组件。

## 嵌套路由的概念

**应用场景：** 一个页面包含多个层级的视图，且子视图的切换不影响父视图。

```
/user/profile       → User 组件 + Profile 子组件
/user/posts         → User 组件 + Posts 子组件
/user/settings      → User 组件 + Settings 子组件
```

**视图层级：**

```
App.vue
└── <router-view>        (渲染 User 组件)
    └── User.vue
        └── <router-view>  (渲染 Profile/Posts/Settings)
```

## children 配置

### 基础用法

```javascript
const routes = [
  {
    path: '/user',
    component: User,
    children: [
      {
        // 空路径：匹配 /user
        path: '',
        component: UserHome
      },
      {
        // 匹配 /user/profile
        path: 'profile',
        component: UserProfile
      },
      {
        // 匹配 /user/posts
        path: 'posts',
        component: UserPosts
      }
    ]
  }
]
```

**注意：** 子路由的 `path` 不要以 `/` 开头（除非想使用绝对路径）。

```javascript
// ✅ 正确
{ path: 'profile', component: UserProfile }  // 匹配 /user/profile

// ❌ 错误（会被视为根路径）
{ path: '/profile', component: UserProfile }  // 匹配 /profile
```

### 父组件模板

```vue
<!-- User.vue -->
<template>
  <div class="user-layout">
    <aside class="sidebar">
      <h2>用户中心</h2>
      <nav>
        <router-link to="/user">首页</router-link>
        <router-link to="/user/profile">个人资料</router-link>
        <router-link to="/user/posts">我的帖子</router-link>
        <router-link to="/user/settings">设置</router-link>
      </nav>
    </aside>
    
    <main class="content">
      <!-- 子路由的渲染出口 -->
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.user-layout {
  display: flex;
}

.sidebar {
  width: 200px;
  background: #f5f5f5;
  padding: 20px;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
```

### 带参数的嵌套路由

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: '',
        component: UserHome
      },
      {
        path: 'profile',
        component: UserProfile
      },
      {
        // 子路由也可以有参数
        path: 'posts/:postId',
        component: PostDetail
      }
    ]
  }
]

// 路径示例
// /user/123              → User + UserHome
// /user/123/profile      → User + UserProfile
// /user/123/posts/456    → User + PostDetail
```

## 嵌套路由的渲染

### 渲染流程

```javascript
// 访问 /user/123/profile
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      { path: 'profile', component: UserProfile }
    ]
  }
]
```

1. 匹配父路由 `/user/:id` → 渲染 `User` 组件到根 `<router-view>`
2. 匹配子路由 `profile` → 渲染 `UserProfile` 组件到 `User` 内的 `<router-view>`

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <router-view />  <!-- 渲染 User 组件 -->
  </div>
</template>

<!-- User.vue -->
<template>
  <div class="user">
    <h1>用户 {{ $route.params.id }}</h1>
    <router-view />  <!-- 渲染 UserProfile 组件 -->
  </div>
</template>
```

### 多层嵌套

```javascript
const routes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: 'admin',
        component: AdminLayout,
        children: [
          {
            path: 'users',
            component: UserManagement
          },
          {
            path: 'roles',
            component: RoleManagement
          }
        ]
      }
    ]
  }
]

// /dashboard/admin/users
// 渲染层级：
// App
// └── DashboardLayout
//     └── AdminLayout
//         └── UserManagement
```

```vue
<!-- App.vue -->
<router-view />

<!-- DashboardLayout.vue -->
<template>
  <div class="dashboard">
    <header>顶部导航</header>
    <router-view />  <!-- 第二层 -->
  </div>
</template>

<!-- AdminLayout.vue -->
<template>
  <div class="admin">
    <aside>侧边栏</aside>
    <router-view />  <!-- 第三层 -->
  </div>
</template>
```

## 相对路径与绝对路径

### 相对路径（推荐）

```javascript
const routes = [
  {
    path: '/user',
    component: User,
    children: [
      { path: 'profile', component: UserProfile },     // /user/profile
      { path: 'posts', component: UserPosts },         // /user/posts
      { path: 'settings', component: UserSettings }    // /user/settings
    ]
  }
]
```

**优势：**
- 路径清晰，易于理解
- 父路径修改时，子路径自动更新

### 绝对路径

```javascript
const routes = [
  {
    path: '/user',
    component: User,
    children: [
      { path: '/profile', component: UserProfile },     // /profile（不推荐）
      { path: '/admin/users', component: AdminUsers }   // /admin/users
    ]
  }
]
```

**使用场景：** 子路由需要使用与父路由完全不同的路径。

### 导航路径

```vue
<template>
  <nav>
    <!-- 绝对路径 -->
    <router-link to="/user/profile">个人资料</router-link>
    
    <!-- 相对路径（推荐在嵌套路由中使用） -->
    <router-link to="profile">个人资料</router-link>
    
    <!-- 命名路由（最推荐） -->
    <router-link :to="{ name: 'UserProfile' }">个人资料</router-link>
  </nav>
</template>
```

## 多层嵌套的实践

### 后台管理系统示例

```javascript
const routes = [
  {
    path: '/',
    component: HomeLayout,
    children: [
      { path: '', component: Home }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: Dashboard
      },
      {
        path: 'users',
        component: UserManagement,
        children: [
          {
            path: '',
            name: 'UserList',
            component: UserList
          },
          {
            path: ':id',
            name: 'UserDetail',
            component: UserDetail
          },
          {
            path: ':id/edit',
            name: 'UserEdit',
            component: UserEdit
          }
        ]
      }
    ]
  }
]
```

```vue
<!-- AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <header class="admin-header">
      <h1>管理后台</h1>
      <div class="user-info">
        <span>{{ username }}</span>
        <button @click="logout">退出</button>
      </div>
    </header>
    
    <div class="admin-body">
      <aside class="admin-sidebar">
        <ul class="menu">
          <li>
            <router-link to="/admin/dashboard">
              仪表盘
            </router-link>
          </li>
          <li>
            <router-link to="/admin/users">
              用户管理
            </router-link>
          </li>
        </ul>
      </aside>
      
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

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
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
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

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.menu a {
  display: block;
  padding: 12px 20px;
  color: #333;
  text-decoration: none;
}

.menu a.router-link-active {
  background: #1890ff;
  color: white;
}
</style>
```

### 空路径子路由

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      // 当访问 /user/:id 时，默认显示 UserHome
      { path: '', component: UserHome },
      { path: 'profile', component: UserProfile },
      { path: 'posts', component: UserPosts }
    ]
  }
]
```

**重定向方式（效果相同）：**

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    redirect: to => `/user/${to.params.id}/home`,
    children: [
      { path: 'home', component: UserHome },
      { path: 'profile', component: UserProfile }
    ]
  }
]
```

## 关键点总结

1. **children 配置**：在父路由中使用 `children` 数组定义子路由
2. **路径规则**：子路由 `path` 不以 `/` 开头表示相对路径
3. **RouterView 嵌套**：每一级路由都需要对应的 `<router-view>`
4. **空路径子路由**：`path: ''` 匹配父路由本身
5. **多层嵌套**：可以无限层级嵌套，但建议不超过 3 层

## 深入一点：嵌套路由的参数传递

```javascript
const routes = [
  {
    path: '/user/:userId',
    component: User,
    props: true,  // 父组件接收 userId
    children: [
      {
        path: 'posts/:postId',
        component: PostDetail,
        props: true  // 子组件接收 userId 和 postId
      }
    ]
  }
]
```

```vue
<!-- User.vue -->
<template>
  <div>
    <h1>用户 {{ userId }}</h1>
    <router-view :user-id="userId" />
  </div>
</template>

<script>
export default {
  props: ['userId']
}
</script>

<!-- PostDetail.vue -->
<template>
  <div>
    <h2>用户 {{ userId }} 的帖子 {{ postId }}</h2>
  </div>
</template>

<script>
export default {
  props: ['userId', 'postId'],
  
  mounted() {
    // 可以同时访问父路由和子路由的参数
    console.log('用户ID:', this.userId)
    console.log('帖子ID:', this.postId)
  }
}
</script>
```

**注意：** 使用 `props: true` 时，子组件会接收到所有路径参数（包括父路由的参数）。

## 参考资料

- [Vue Router - 嵌套路由](https://router.vuejs.org/zh/guide/essentials/nested-routes.html)
- [Vue Router - 命名视图](https://router.vuejs.org/zh/guide/essentials/named-views.html)
