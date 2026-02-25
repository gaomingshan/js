# 第 2 章：路由模式原理

## 概述

前端路由有三种主要模式：Hash 模式、History 模式和 Memory 模式。理解它们的原理和差异，是选择合适路由模式的基础。

## Hash 模式原理与实现

### 核心原理

Hash 模式利用 URL 的 hash 部分（`#` 后面的内容）来模拟路由：

```
http://example.com/#/user/123
                    ↑
                  hash 部分
```

**关键特性：**
- Hash 值的变化不会导致浏览器向服务器发送请求
- Hash 值的变化会触发 `hashchange` 事件
- Hash 值会被记录到浏览器历史中

### 手写 Hash 路由

```javascript
class HashRouter {
  constructor() {
    this.routes = {}
    this.currentUrl = ''
    
    // 监听 hash 变化
    window.addEventListener('hashchange', () => {
      this.currentUrl = location.hash.slice(1) || '/'
      this.render()
    })
    
    // 监听页面加载
    window.addEventListener('load', () => {
      this.currentUrl = location.hash.slice(1) || '/'
      this.render()
    })
  }
  
  // 注册路由
  route(path, callback) {
    this.routes[path] = callback
  }
  
  // 渲染视图
  render() {
    const handler = this.routes[this.currentUrl]
    if (handler) {
      handler()
    }
  }
}

// 使用示例
const router = new HashRouter()

router.route('/', () => {
  document.getElementById('app').innerHTML = '<h1>首页</h1>'
})

router.route('/user', () => {
  document.getElementById('app').innerHTML = '<h1>用户页</h1>'
})
```

### Vue Router 中的 Hash 模式

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/user', component: User }
  ]
})
```

访问 `http://localhost:3000/#/user` 时：
- URL hash 部分：`#/user`
- 不会向服务器请求 `/user` 路径
- 完全由前端 JS 处理

## History 模式原理与实现

### 核心原理

History 模式利用 HTML5 History API 来管理路由：

```javascript
// 主要 API
history.pushState(state, title, url)    // 添加历史记录
history.replaceState(state, title, url) // 替换历史记录
window.addEventListener('popstate', handler) // 监听前进/后退
```

**关键特性：**
- URL 无 `#` 号，更美观
- `pushState` 和 `replaceState` 不会触发页面刷新
- 前进/后退会触发 `popstate` 事件
- **刷新页面会向服务器发送请求**（需要服务器配置）

### 手写 History 路由

```javascript
class HistoryRouter {
  constructor() {
    this.routes = {}
    this.currentUrl = ''
    
    // 监听前进/后退
    window.addEventListener('popstate', () => {
      this.currentUrl = location.pathname
      this.render()
    })
    
    // 初始化
    window.addEventListener('load', () => {
      this.currentUrl = location.pathname
      this.render()
    })
  }
  
  // 注册路由
  route(path, callback) {
    this.routes[path] = callback
  }
  
  // 渲染视图
  render() {
    const handler = this.routes[this.currentUrl]
    if (handler) {
      handler()
    }
  }
  
  // 导航到新路由
  push(path) {
    history.pushState(null, '', path)
    this.currentUrl = path
    this.render()
  }
  
  // 替换当前路由
  replace(path) {
    history.replaceState(null, '', path)
    this.currentUrl = path
    this.render()
  }
}

// 使用示例
const router = new HistoryRouter()

router.route('/', () => {
  document.getElementById('app').innerHTML = '<h1>首页</h1>'
})

router.route('/user', () => {
  document.getElementById('app').innerHTML = '<h1>用户页</h1>'
})

// 拦截 <a> 标签点击
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    e.preventDefault()
    const path = e.target.getAttribute('href')
    router.push(path)
  }
})
```

### Vue Router 中的 History 模式

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/user', component: User }
  ]
})
```

## Memory 模式（Vue Router 4.x）

### 核心原理

Memory 模式不依赖浏览器 URL，完全在内存中管理路由历史：

```javascript
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [...]
})
```

**特点：**
- URL 不会改变
- 不依赖浏览器环境
- 主要用于 SSR 或非浏览器环境（如 Electron）

### 使用场景

```javascript
// Node.js SSR 环境
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory } from 'vue-router'

app.get('*', async (req, res) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [...]
  })
  
  // 设置当前路由
  await router.push(req.url)
  await router.isReady()
  
  const html = await renderToString(app)
  res.send(html)
})
```

## 三种模式的对比与选择

| 特性 | Hash 模式 | History 模式 | Memory 模式 |
|------|-----------|-------------|-------------|
| **URL 格式** | `#/user` | `/user` | 不改变 URL |
| **美观度** | ⭐⭐ | ⭐⭐⭐⭐⭐ | N/A |
| **兼容性** | IE8+ | IE10+ | 全兼容 |
| **服务器配置** | 不需要 | **必须** | 不需要 |
| **SEO** | 较差 | 较好 | N/A |
| **使用场景** | 旧项目/兼容性要求 | 现代 Web 应用 | SSR/Electron |

### 选择建议

```javascript
// 1. 新项目默认选择 History 模式
const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})

// 2. 需要兼容老浏览器或无法配置服务器时选择 Hash 模式
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...]
})

// 3. SSR 或非浏览器环境选择 Memory 模式
const router = createRouter({
  history: createMemoryHistory(),
  routes: [...]
})
```

## History 模式的服务器配置

**核心问题：** 用户直接访问 `http://example.com/user/123` 时，浏览器会向服务器请求 `/user/123` 路径，但服务器上并没有这个文件，会返回 404。

**解决方案：** 配置服务器将所有路由都指向 `index.html`，让前端路由接管。

### Nginx 配置

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**原理：**
1. 尝试查找文件 `$uri`（如 `/user/123` 文件）
2. 尝试查找目录 `$uri/`（如 `/user/123/` 目录）
3. 都找不到则返回 `/index.html`
4. 前端 JS 加载后，Vue Router 解析 URL 并渲染对应组件

### Apache 配置

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Node.js (Express) 配置

```javascript
const express = require('express')
const path = require('path')
const app = express()

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')))

// 所有路由都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(3000)
```

### Vite 开发环境

```javascript
// vite.config.js
export default {
  server: {
    // Vite 已自动处理，无需额外配置
  }
}
```

## 关键点总结

1. **Hash 模式**：通过 `hashchange` 事件监听，兼容性好但 URL 不美观
2. **History 模式**：通过 `popstate` 事件监听，URL 美观但需要服务器配置
3. **Memory 模式**：内存路由，适用于 SSR 和非浏览器环境
4. **服务器配置是关键**：History 模式必须配置服务器将所有请求重定向到 `index.html`

## 深入一点：pushState vs replaceState

```javascript
// pushState：添加新的历史记录
history.pushState({ page: 1 }, '', '/page/1')
history.pushState({ page: 2 }, '', '/page/2')
history.pushState({ page: 3 }, '', '/page/3')
// 历史栈：[page1, page2, page3]
// 点击后退会回到 page2

// replaceState：替换当前历史记录
history.replaceState({ page: 1 }, '', '/page/1')
history.replaceState({ page: 2 }, '', '/page/2')
// 历史栈：[page2]
// 点击后退会回到进入应用前的页面

// 实际应用
router.push('/user')    // 使用 pushState，可回退
router.replace('/home') // 使用 replaceState，不可回退到上一页
```

**使用场景：**
- `push`：正常页面跳转
- `replace`：登录跳转、重定向（不希望用户回退到登录页）

## 参考资料

- [MDN - History.pushState()](https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState)
- [MDN - Window: hashchange event](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/hashchange_event)
- [Vue Router - 不同的历史模式](https://router.vuejs.org/zh/guide/essentials/history-mode.html)
