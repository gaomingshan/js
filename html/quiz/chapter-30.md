# 第 30 章：离线应用 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | Service Worker
### 题目
Service Worker 的作用？**（多选）**

**A.** 离线缓存 | **B.** 推送通知 | **C.** 后台同步 | **D.** 直接操作DOM

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C
Service Worker 是独立线程，**不能**直接操作 DOM
**来源：** Service Worker
</details>

---

## 第 2 题 🟢 | 注册
### 题目
如何注册 Service Worker？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('注册成功', reg))
    .catch(err => console.error('注册失败', err));
}
```
**来源：** Service Worker Registration
</details>

---

## 第 3 题 🟢 | 生命周期
### 题目
Service Worker 的生命周期？**（多选）**

**A.** install | **B.** activate | **C.** fetch | **D.** update

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C
```javascript
self.addEventListener('install', e => {});
self.addEventListener('activate', e => {});
self.addEventListener('fetch', e => {});
```
**来源：** Service Worker Lifecycle
</details>

---

## 第 4 题 🟡 | 缓存策略
### 题目
常见的缓存策略？**（多选）**

**A.** Cache First | **B.** Network First | **C.** Stale While Revalidate | **D.** Cache Only

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D

**1. Cache First**
```javascript
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
```

**2. Network First**
```javascript
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
```

**来源：** Caching Strategies
</details>

---

## 第 5 题 🟡 | 更新机制
### 题目
Service Worker 如何更新？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// sw.js
const CACHE_VERSION = 'v2'; // 修改版本触发更新

self.addEventListener('install', e => {
  self.skipWaiting(); // 跳过等待，立即激活
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // 立即接管所有页面
});
```
**来源：** Service Worker Update
</details>

---

## 第 6 题 🟡 | 推送通知
### 题目
实现 Push Notification。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 请求权限
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // 订阅推送
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'PUBLIC_KEY'
      });
    });
  }
});

// sw.js - 接收推送
self.addEventListener('push', e => {
  const data = e.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icon.png'
  });
});
```
**来源：** Push API
</details>

---

## 第 7 题 🟡 | 后台同步
### 题目
Background Sync 的用途？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 注册同步
navigator.serviceWorker.ready.then(reg => {
  reg.sync.register('sync-messages');
});

// sw.js - 处理同步
self.addEventListener('sync', e => {
  if (e.tag === 'sync-messages') {
    e.waitUntil(
      sendMessages() // 发送离线时未发送的消息
    );
  }
});
```
**来源：** Background Sync
</details>

---

## 第 8 题 🔴 | 完整 PWA
### 题目
实现完整的离线应用。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// sw.js
const CACHE_NAME = 'my-app-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html'
];

// 安装
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// 拦截请求
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      // 缓存优先
      if (response) return response;
      
      // 网络请求
      return fetch(e.request).then(response => {
        // 缓存新资源
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // 离线页面
        return caches.match('/offline.html');
      });
    })
  );
});
```
**来源：** PWA 实践
</details>

---

## 第 9 题 🔴 | Workbox
### 题目
使用 Workbox 简化开发。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.0/workbox-sw.js');

// 预缓存
workbox.precaching.precacheAndRoute([
  {url: '/', revision: '1'},
  {url: '/styles.css', revision: '1'},
  {url: '/app.js', revision: '1'}
]);

// 缓存策略
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30天
      })
    ]
  })
);

workbox.routing.registerRoute(
  /\.(?:js|css)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);

workbox.routing.registerRoute(
  /^https:\/\/api\.example\.com/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);
```
**来源：** Workbox
</details>

---

## 第 10 题 🔴 | 调试
### 题目
如何调试 Service Worker？

<details><summary>查看答案</summary>
### ✅ 答案

**1. Chrome DevTools**
- Application → Service Workers
- 查看状态、日志
- 手动更新、注销

**2. 常用命令**
```javascript
// 注销所有 Service Worker
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));

// 清除所有缓存
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

**3. 测试工具**
- Lighthouse：PWA 审计
- Workbox CLI：生成配置

**4. 调试技巧**
```javascript
// sw.js
self.addEventListener('install', e => {
  console.log('[SW] Install');
});

self.addEventListener('activate', e => {
  console.log('[SW] Activate');
});

self.addEventListener('fetch', e => {
  console.log('[SW] Fetch:', e.request.url);
});
```

**来源：** Service Worker 调试
</details>

---

**📌 本章总结**
- Service Worker：离线缓存核心
- 生命周期：install → activate → fetch
- 缓存策略：Cache First, Network First, Stale While Revalidate
- 推送通知：Push API
- 后台同步：Background Sync
- Workbox：简化开发
- 调试：Chrome DevTools

**上一章** ← [第 29 章：HTML5 API](./chapter-29.md)  
**下一章** → [第 31 章：PWA](./chapter-31.md)
