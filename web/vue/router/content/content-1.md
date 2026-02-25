# 第 1 章：前端路由基础

## 概述

前端路由是单页应用（SPA）的核心基础设施，它使得应用能够在不刷新页面的情况下实现视图切换。理解前端路由的本质和职责，是掌握 Vue Router 的第一步。

## 什么是前端路由

**前端路由是一种将 URL 与视图组件映射起来的机制**。当 URL 发生变化时，前端路由系统会：
1. 监听 URL 变化
2. 解析 URL 信息
3. 匹配对应的组件
4. 渲染组件到页面

```javascript
// 简化的路由概念
const routes = {
  '/home': HomeComponent,
  '/about': AboutComponent,
  '/user/:id': UserComponent
}

// 当 URL 变化时
window.addEventListener('hashchange', () => {
  const currentPath = location.hash.slice(1)
  const component = routes[currentPath]
  render(component)
})
```

## SPA 应用的路由需求

### 传统多页应用的问题

```
用户点击链接 → 浏览器发送请求 → 服务器返回新页面 → 页面刷新
```

**痛点：**
- 页面刷新导致状态丢失
- 网络延迟影响用户体验
- 重复加载公共资源（CSS、JS）
- 无法实现流畅的页面过渡动画

### SPA 的解决方案

```
用户点击链接 → 前端路由拦截 → JS 切换组件 → 视图更新
```

**优势：**
- 无页面刷新，用户体验流畅
- 状态可持续保存（Vuex/Pinia）
- 资源按需加载
- 可实现复杂的页面过渡效果

## 前端路由 vs 后端路由

| 特性 | 前端路由 | 后端路由 |
|------|---------|---------|
| **URL 变化** | 不发送 HTTP 请求 | 发送 HTTP 请求 |
| **页面刷新** | 无刷新 | 整页刷新 |
| **状态保持** | 可保持应用状态 | 状态重置 |
| **首屏加载** | 较慢（需加载完整 SPA） | 较快（服务器直出） |
| **SEO** | 需额外处理（SSR/预渲染） | 天然友好 |
| **实现位置** | 浏览器端 JavaScript | 服务器端 |

### 实际场景

```javascript
// 后端路由（传统方式）
app.get('/user/:id', (req, res) => {
  const user = getUserById(req.params.id)
  res.render('user.html', { user })
})
// 每次访问都是完整的 HTTP 请求-响应周期

// 前端路由（SPA 方式）
const routes = [
  { path: '/user/:id', component: UserProfile }
]
// URL 变化时仅更新组件，无需请求服务器
```

## 路由的核心职责

### 1. URL 管理

```javascript
// 监听 URL 变化
window.addEventListener('popstate', handleUrlChange)
window.addEventListener('hashchange', handleUrlChange)

// 编程式修改 URL
router.push('/about')  // 添加历史记录
router.replace('/home') // 替换当前记录
```

### 2. 路径匹配

```javascript
// 精确匹配
'/user' → UserList

// 动态匹配
'/user/123' → UserProfile (params: { id: '123' })

// 通配符匹配
'/docs/*' → Documentation
```

### 3. 组件渲染

```vue
<template>
  <div id="app">
    <!-- 路由出口：渲染匹配的组件 -->
    <router-view />
  </div>
</template>
```

### 4. 导航控制

```javascript
// 声明式导航
<router-link to="/about">关于</router-link>

// 编程式导航
router.push({ name: 'user', params: { id: 123 } })

// 导航守卫
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }
})
```

### 5. 状态同步

```javascript
// URL 与应用状态保持同步
'/user/123?tab=posts' 
↓
{
  path: '/user/123',
  params: { id: '123' },
  query: { tab: 'posts' }
}
```

## 关键点总结

1. **前端路由的本质**：URL 与组件的映射关系，通过监听 URL 变化来切换视图
2. **核心价值**：无刷新页面切换，提升用户体验
3. **职责边界**：前端路由只负责视图切换，不处理数据请求（应由 API 层处理）
4. **权衡取舍**：SPA 提升了体验但牺牲了首屏性能和 SEO，需要针对场景选择

## 深入一点：前端路由的实现原理

前端路由有两种主要实现方式：

### Hash 模式
```javascript
// URL: http://example.com/#/user/123
location.hash = '#/user/123'

window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1) // '/user/123'
  // 匹配路由并渲染组件
})
```

**特点：**
- 兼容性好（IE8+）
- URL 带 `#` 符号，不美观
- 不会向服务器发送请求

### History 模式
```javascript
// URL: http://example.com/user/123
history.pushState(null, '', '/user/123')

window.addEventListener('popstate', () => {
  const path = location.pathname // '/user/123'
  // 匹配路由并渲染组件
})
```

**特点：**
- URL 干净美观
- 需要服务器配置支持
- 使用 HTML5 History API

下一章将详细讲解这两种模式的原理和实现。

## 参考资料

- [MDN - History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)
- [Vue Router 官方文档](https://router.vuejs.org/zh/)
- [单页应用的前端路由实现原理](https://github.com/youngwind/blog/issues/109)
