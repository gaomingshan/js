# 第 31 章：PWA

## 概述

PWA（Progressive Web App）渐进式 Web 应用，结合了 Web 和原生应用的优势。

## 一、PWA 核心技术

### 1.1 Service Worker

```javascript
// 注册
navigator.serviceWorker.register('/sw.js');

// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/app.js',
        '/style.css'
      ]);
    })
  );
});
```

### 1.2 Web App Manifest

```json
{
  "name": "我的 PWA",
  "short_name": "PWA",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#fff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 二、离线功能

### 2.1 缓存优先

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
  );
});
```

### 2.2 网络优先

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
```

## 三、Push 通知

```javascript
// 请求权限
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('Hello!', {
      body: '这是一条通知',
      icon: '/icon.png'
    });
  }
});

// Push
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicKey
  });
});
```

## 四、安装提示

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // 显示安装按钮
  document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', () => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    console.log('用户选择:', choice.outcome);
  });
});
```

## 参考资料

- [MDN - Progressive Web Apps](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)

---

**上一章** ← [第 30 章：离线应用](./30-offline-apps.md)  
**下一章** → [第 32 章：WebAssembly](./32-webassembly.md)
