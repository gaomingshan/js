# 第 31 章：PWA - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | PWA 定义
### 题目
PWA 是什么？

**A.** 原生应用 | **B.** 渐进式 Web 应用 | **C.** 桌面应用 | **D.** 混合应用

<details><summary>查看答案</summary>
### ✅ 答案：B
Progressive Web App = 具有原生应用体验的 Web 应用
**来源：** PWA 概念
</details>

---

## 第 2 题 🟢 | manifest.json
### 题目
Web App Manifest 的作用？

<details><summary>查看答案</summary>
### ✅ 答案
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
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
```html
<link rel="manifest" href="/manifest.json">
```
**来源：** Web App Manifest
</details>

---

## 第 3 题 🟢 | 安装条件
### 题目
PWA 安装的条件？**（多选）**

**A.** HTTPS | **B.** manifest.json | **C.** Service Worker | **D.** 图标

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
**来源：** PWA 安装要求
</details>

---

## 第 4 题 🟡 | 显示模式
### 题目
manifest 的 display 模式？

<details><summary>查看答案</summary>
### ✅ 答案
```json
{
  "display": "fullscreen",  // 全屏
  "display": "standalone",  // 独立应用（隐藏浏览器 UI）
  "display": "minimal-ui",  // 最小 UI
  "display": "browser"      // 浏览器模式
}
```
**推荐：** `standalone`
**来源：** Display Modes
</details>

---

## 第 5 题 🟡 | 添加到主屏幕
### 题目
引导用户安装 PWA。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止默认提示
  e.preventDefault();
  deferredPrompt = e;
  
  // 显示自定义安装按钮
  showInstallButton();
});

function showInstallButton() {
  const installBtn = document.getElementById('install-btn');
  installBtn.style.display = 'block';
  
  installBtn.addEventListener('click', async () => {
    deferredPrompt.prompt();
    
    const {outcome} = await deferredPrompt.userChoice;
    console.log(outcome === 'accepted' ? '已安装' : '取消安装');
    
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

// 检测是否已安装
window.addEventListener('appinstalled', () => {
  console.log('PWA 已安装');
});
```
**来源：** Add to Home Screen
</details>

---

## 第 6 题 🟡 | App Shell
### 题目
App Shell 架构？

<details><summary>查看答案</summary>
### ✅ 答案
**App Shell = 最小的 HTML/CSS/JS，提供即时加载**

```javascript
// sw.js
const SHELL_CACHE = 'app-shell-v1';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/styles/app.css',
  '/scripts/app.js',
  '/images/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      return cache.addAll(SHELL_FILES);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
```
**来源：** App Shell Model
</details>

---

## 第 7 题 🟡 | 离线体验
### 题目
优化离线体验。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 检测网络状态
window.addEventListener('online', () => {
  showOnlineBanner();
  syncData();
});

window.addEventListener('offline', () => {
  showOfflineBanner();
});

// 离线页面
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then(response => {
        return response || caches.match('/offline.html');
      });
    })
  );
});
```
**来源：** Offline Experience
</details>

---

## 第 8 题 🔴 | 完整 PWA
### 题目
创建完整的 PWA。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```json
// manifest.json
{
  "name": "我的 PWA 应用",
  "short_name": "PWA",
  "description": "一个渐进式 Web 应用示例",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/images/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/images/screenshot1.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ],
  "categories": ["productivity"],
  "shortcuts": [
    {
      "name": "新建文档",
      "url": "/new",
      "icons": [{"src": "/images/new.png", "sizes": "96x96"}]
    }
  ]
}
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#3b82f6">
  <meta name="description" content="我的 PWA 应用">
  
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="/images/icon-192.png">
  <link rel="apple-touch-icon" href="/images/icon-192.png">
  
  <title>我的 PWA</title>
</head>
<body>
  <div id="install-banner" style="display: none;">
    <button id="install-btn">安装应用</button>
  </div>
  
  <div id="app">
    <h1>我的 PWA 应用</h1>
  </div>
  
  <script>
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW 注册成功', reg))
        .catch(err => console.error('SW 注册失败', err));
    }
    
    // 安装提示
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      document.getElementById('install-banner').style.display = 'block';
    });
    
    document.getElementById('install-btn').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const {outcome} = await deferredPrompt.userChoice;
        console.log('安装结果：', outcome);
        deferredPrompt = null;
        document.getElementById('install-banner').style.display = 'none';
      }
    });
  </script>
</body>
</html>
```
**来源：** PWA 完整实现
</details>

---

## 第 9 题 🔴 | Lighthouse 审计
### 题目
PWA 的审计要点？

<details><summary>查看答案</summary>
### ✅ 答案

**Lighthouse PWA 检查项：**

1. **快速可靠**
   - Service Worker 注册
   - 离线可用
   - 页面加载速度

2. **可安装**
   - Web App Manifest
   - HTTPS
   - 适当的图标

3. **优化体验**
   - 响应式设计
   - 元标签
   - 主题色

**运行审计：**
```bash
# Chrome DevTools
Lighthouse → Progressive Web App

# CLI
npm install -g lighthouse
lighthouse https://example.com --view
```

**来源：** Lighthouse PWA
</details>

---

## 第 10 题 🔴 | 最佳实践
### 题目
PWA 开发最佳实践？

<details><summary>查看答案</summary>
### ✅ 答案

**1. 性能**
- App Shell 架构
- 预缓存关键资源
- 懒加载非关键资源

**2. 可靠性**
- 离线可用
- 网络状态提示
- 后台同步

**3. 安装体验**
- 自定义安装提示
- 引导用户安装
- 欢迎页面

**4. 更新策略**
```javascript
// sw.js
const VERSION = 'v1.0.1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => !key.includes(VERSION))
          .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// 通知用户更新
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
```

```javascript
// app.js
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (confirm('发现新版本，是否刷新？')) {
    window.location.reload();
  }
});
```

**来源：** PWA 最佳实践
</details>

---

**📌 本章总结**
- PWA = Web 应用 + 原生体验
- manifest.json：应用配置
- Service Worker：离线支持
- 安装条件：HTTPS + manifest + SW
- App Shell：快速加载架构
- beforeinstallprompt：自定义安装
- Lighthouse：PWA 审计工具

**上一章** ← [第 30 章：离线应用](./chapter-30.md)  
**下一章** → [第 32 章：WebAssembly](./chapter-32.md)
