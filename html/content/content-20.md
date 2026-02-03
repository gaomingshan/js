# Web API 与 HTML 的集成

## 核心概念

HTML5 不仅是标记语言的更新，更是浏览器 API 的革命。新增了大量 JavaScript API，扩展了浏览器的能力。

## 本地存储

```javascript
// localStorage（持久化）
localStorage.setItem('username', 'admin');
localStorage.getItem('username');
localStorage.removeItem('username');

// sessionStorage（会话级）
sessionStorage.setItem('token', 'abc123');

// 存储限制：通常 5-10MB
```

**后端类比**：localStorage ≈ 数据库，sessionStorage ≈ 会话状态。

## 离线应用

### Service Worker

```javascript
// 注册 Service Worker
navigator.serviceWorker.register('/sw.js');

// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/style.css',
        '/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## 拖放 API

```html
<div 
  draggable="true" 
  ondragstart="handleDragStart(event)"
>
  拖动我
</div>

<div 
  ondrop="handleDrop(event)" 
  ondragover="handleDragOver(event)"
>
  放置区域
</div>

<script>
function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDrop(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData('text/plain');
  e.target.appendChild(document.getElementById(data));
}

function handleDragOver(e) {
  e.preventDefault();
}
</script>
```

## 文件 API

```html
<input type="file" id="fileInput" multiple>

<script>
document.getElementById('fileInput').addEventListener('change', (e) => {
  const files = e.target.files;
  
  for (let file of files) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log('文件内容:', e.target.result);
    };
    
    // 读取为文本
    reader.readAsText(file);
    
    // 读取为 DataURL（图片预览）
    // reader.readAsDataURL(file);
  }
});
</script>
```

## Geolocation API

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('纬度:', position.coords.latitude);
    console.log('经度:', position.coords.longitude);
  },
  (error) => {
    console.error('定位失败:', error);
  }
);
```

**后端类比**：浏览器作为运行时环境，提供丰富的系统 API。

## 参考资源

- [MDN - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [HTML5 Rocks](https://www.html5rocks.com/)
