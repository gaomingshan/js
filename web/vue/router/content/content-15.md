# 第 15 章：路由懒加载

## 概述

路由懒加载是前端性能优化的重要手段，通过按需加载路由组件，可以显著减少首屏加载时间。Vue Router 结合 Webpack/Vite 的代码分割功能，让懒加载变得简单高效。

## 路由懒加载的原理

### 传统方式 vs 懒加载

```javascript
// ❌ 传统方式：同步导入
import Home from './views/Home.vue'
import About from './views/About.vue'
import User from './views/User.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user', component: User }
]

// 打包结果：
// app.js (包含所有组件代码，体积大)
```

```javascript
// ✅ 懒加载方式：异步导入
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')
  },
  {
    path: '/user',
    component: () => import('./views/User.vue')
  }
]

// 打包结果：
// app.js (主入口，体积小)
// home.js (Home 组件)
// about.js (About 组件)
// user.js (User 组件)
```

### 工作原理

```javascript
// 1. 访问首页 /
// 浏览器加载：app.js + home.js

// 2. 导航到 /about
// 浏览器动态加载：about.js

// 3. 再次访问 /about
// 不需要重新加载（已缓存）
```

## import() 动态导入

### ES6 动态导入语法

```javascript
// 静态导入（编译时）
import Home from './Home.vue'

// 动态导入（运行时）
const Home = () => import('./Home.vue')

// 返回 Promise
import('./Home.vue').then(module => {
  console.log(module.default)  // 组件定义
})
```

### 在路由中使用

```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    // 箭头函数返回 import()
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('./views/About.vue')
  }
]
```

### TypeScript 支持

```typescript
import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./views/Home.vue')
  }
]
```

## 路由级代码分割

### Webpack 魔法注释

```javascript
const routes = [
  {
    path: '/user',
    // webpackChunkName: 指定打包后的文件名
    component: () => import(/* webpackChunkName: "user" */ './views/User.vue')
  },
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue')
  }
]

// 打包结果：
// user.js
// admin.js
```

### 预加载与预获取

```javascript
// webpackPrefetch: 浏览器空闲时预加载
{
  path: '/dashboard',
  component: () => import(
    /* webpackChunkName: "dashboard" */
    /* webpackPrefetch: true */
    './views/Dashboard.vue'
  )
}

// webpackPreload: 与父 chunk 并行加载（慎用）
{
  path: '/critical',
  component: () => import(
    /* webpackChunkName: "critical" */
    /* webpackPreload: true */
    './views/Critical.vue'
  )
}
```

### Vite 动态导入

```javascript
// Vite 自动处理代码分割
const routes = [
  {
    path: '/user',
    component: () => import('./views/User.vue')
  }
]

// 打包结果：
// User-[hash].js
```

## 分组打包策略

### 按功能模块分组

```javascript
const routes = [
  // 用户相关（打包到 user chunk）
  {
    path: '/user/profile',
    component: () => import(/* webpackChunkName: "user" */ './views/user/Profile.vue')
  },
  {
    path: '/user/settings',
    component: () => import(/* webpackChunkName: "user" */ './views/user/Settings.vue')
  },
  
  // 管理员相关（打包到 admin chunk）
  {
    path: '/admin/users',
    component: () => import(/* webpackChunkName: "admin" */ './views/admin/Users.vue')
  },
  {
    path: '/admin/settings',
    component: () => import(/* webpackChunkName: "admin" */ './views/admin/Settings.vue')
  }
]

// 打包结果：
// user.js (包含 Profile 和 Settings)
// admin.js (包含 Users 和 Settings)
```

### 按访问频率分组

```javascript
const routes = [
  // 高频页面：合并到主包
  {
    path: '/',
    component: Home  // 同步导入
  },
  
  // 中频页面：单独分组
  {
    path: '/products',
    component: () => import(/* webpackChunkName: "common" */ './views/Products.vue')
  },
  {
    path: '/cart',
    component: () => import(/* webpackChunkName: "common" */ './views/Cart.vue')
  },
  
  // 低频页面：单独打包
  {
    path: '/privacy',
    component: () => import('./views/Privacy.vue')
  },
  {
    path: '/terms',
    component: () => import('./views/Terms.vue')
  }
]
```

### 按权限级别分组

```javascript
const routes = [
  // 公开页面
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "public" */ './views/Login.vue')
  },
  {
    path: '/register',
    component: () => import(/* webpackChunkName: "public" */ './views/Register.vue')
  },
  
  // 普通用户页面
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "user" */ './views/Dashboard.vue')
  },
  
  // 管理员页面
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue')
  }
]
```

## 懒加载失败处理

### 错误捕获

```javascript
// 方式 1: 在路由守卫中处理
router.onError((error) => {
  if (/ChunkLoadError|Loading chunk/.test(error.message)) {
    console.error('路由组件加载失败:', error)
    
    // 提示用户刷新页面
    if (confirm('页面加载失败，是否刷新页面？')) {
      window.location.reload()
    }
  }
})

// 方式 2: 全局错误处理
window.addEventListener('error', (event) => {
  if (event.message.includes('Loading chunk')) {
    console.error('Chunk 加载失败')
    // 处理逻辑
  }
})
```

### 重试机制

```javascript
// 创建带重试的动态导入函数
function lazyLoadView(importFunc, retries = 3, delay = 1000) {
  return () => {
    return new Promise((resolve, reject) => {
      const attemptLoad = (remainingRetries) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (remainingRetries === 0) {
              reject(error)
            } else {
              console.log(`加载失败，${delay}ms 后重试，剩余次数：${remainingRetries}`)
              setTimeout(() => {
                attemptLoad(remainingRetries - 1)
              }, delay)
            }
          })
      }
      attemptLoad(retries)
    })
  }
}

// 使用
const routes = [
  {
    path: '/user',
    component: lazyLoadView(() => import('./views/User.vue'))
  }
]
```

### 降级方案

```javascript
// 加载失败时显示降级组件
function lazyLoadWithFallback(importFunc, fallbackComponent) {
  return () => {
    return importFunc()
      .catch(() => {
        console.warn('组件加载失败，使用降级组件')
        return fallbackComponent
      })
  }
}

// 降级组件
const ErrorFallback = {
  template: `
    <div class="error-fallback">
      <h1>页面加载失败</h1>
      <button @click="reload">重新加载</button>
    </div>
  `,
  methods: {
    reload() {
      window.location.reload()
    }
  }
}

// 使用
const routes = [
  {
    path: '/user',
    component: lazyLoadWithFallback(
      () => import('./views/User.vue'),
      ErrorFallback
    )
  }
]
```

### Loading 状态

```javascript
// 使用 Suspense（Vue 3）
// App.vue
<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <template #default>
        <component :is="Component" />
      </template>
      <template #fallback>
        <div class="loading">加载中...</div>
      </template>
    </Suspense>
  </router-view>
</template>

// 或使用导航守卫
import NProgress from 'nprogress'

router.beforeEach(() => {
  NProgress.start()
})

router.afterEach(() => {
  NProgress.done()
})
```

## 懒加载的最佳实践

### 1. 首屏关键路由同步加载

```javascript
import Home from './views/Home.vue'  // 同步

const routes = [
  {
    path: '/',
    component: Home  // 首屏关键组件
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')  // 其他页面懒加载
  }
]
```

### 2. 合理的 Chunk 大小

```javascript
// ❌ 过度拆分：每个组件一个文件
{
  path: '/user/profile',
  component: () => import('./views/user/Profile.vue')  // user-profile.js (10KB)
},
{
  path: '/user/settings',
  component: () => import('./views/user/Settings.vue')  // user-settings.js (8KB)
}
// 问题：HTTP 请求过多

// ✅ 合理分组：相关组件打包到一起
{
  path: '/user/profile',
  component: () => import(/* webpackChunkName: "user" */ './views/user/Profile.vue')
},
{
  path: '/user/settings',
  component: () => import(/* webpackChunkName: "user" */ './views/user/Settings.vue')
}
// user.js (18KB) 一次请求
```

### 3. 预加载高概率访问的路由

```javascript
// 在首页预加载可能访问的页面
{
  path: '/',
  component: Home
},
{
  path: '/products',
  // 用户很可能从首页进入产品页，使用 prefetch
  component: () => import(
    /* webpackChunkName: "products" */
    /* webpackPrefetch: true */
    './views/Products.vue'
  )
}
```

### 4. 嵌套路由的懒加载

```javascript
const routes = [
  {
    path: '/admin',
    // 父组件懒加载
    component: () => import('./layouts/AdminLayout.vue'),
    children: [
      {
        path: 'dashboard',
        // 子组件也懒加载
        component: () => import('./views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        component: () => import('./views/admin/Users.vue')
      }
    ]
  }
]
```

### 5. 监控和分析

```javascript
// Webpack Bundle Analyzer
// npm install --save-dev webpack-bundle-analyzer

// vue.config.js (Vue CLI)
module.exports = {
  chainWebpack: config => {
    if (process.env.ANALYZE) {
      config
        .plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
  }
}

// 运行分析
// ANALYZE=true npm run build
```

## 关键点总结

1. **懒加载原理**：使用 `import()` 动态导入，实现代码分割
2. **魔法注释**：使用 `webpackChunkName` 指定文件名，`webpackPrefetch` 预加载
3. **分组策略**：按功能模块、访问频率、权限级别分组
4. **错误处理**：实现重试机制和降级方案
5. **最佳实践**：首屏关键路由同步加载，合理控制 Chunk 大小

## 深入一点：懒加载的性能影响

```javascript
// 性能指标对比

// 同步加载
首屏加载时间：3s
首次可交互时间：3.5s
总 JS 体积：500KB

// 懒加载（合理分割）
首屏加载时间：1s
首次可交互时间：1.2s
首屏 JS 体积：150KB
路由切换时间：+200ms（首次加载 chunk）

// 懒加载的权衡
优势：
- 首屏加载快 50-70%
- 按需加载，节省带宽
- 用户可能永远不访问某些页面

劣势：
- 路由切换时需要加载组件（首次）
- HTTP 请求增多（可通过 HTTP/2 缓解）
- 构建配置稍复杂
```

## 参考资料

- [Vue Router - 路由懒加载](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html)
- [Webpack - Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Vite - Dynamic Import](https://vitejs.dev/guide/features.html#dynamic-import)
