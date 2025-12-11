# 第 30 章：离线应用

## 概述

通过 Service Worker 和 Cache API，可以创建离线可用的 Web 应用。

## 一、Service Worker

### 1.1 注册

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('注册成功:', registration);
    })
    .catch(error => {
      console.error('注册失败:', error);
    });
}
```

### 1.2 缓存策略

```javascript
// sw.js
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/style.css',
  '/script.js',
  '/image.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

## 二、Cache API

```javascript
// 打开缓存
const cache = await caches.open('my-cache');

// 添加资源
await cache.add('/style.css');
await cache.addAll(['/script.js', '/image.jpg']);

// 匹配资源
const response = await cache.match('/style.css');

// 删除缓存
await caches.delete('old-cache');
```

## 三、App Manifest

```json
{
  "name": "我的应用",
  "short_name": "应用",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

```html
<link rel="manifest" href="/manifest.json">
```

## 参考资料

- [MDN - Service Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [MDN - Web App Manifest](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)

---

**上一章** ← [第 29 章：HTML5 API](./29-html5-api.md)  
**下一章** → [第 31 章：PWA](./31-pwa.md)
