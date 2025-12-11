# 第 29 章：HTML5 API

## 概述

HTML5 引入了许多强大的 JavaScript API，增强了 Web 应用的能力。

## 一、Geolocation API

```javascript
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('纬度:', position.coords.latitude);
      console.log('经度:', position.coords.longitude);
    },
    (error) => {
      console.error('获取位置失败:', error);
    }
  );
}
```

## 二、Web Storage

### 2.1 localStorage

```javascript
// 存储
localStorage.setItem('user', JSON.stringify({name: 'Zhang San'}));

// 读取
const user = JSON.parse(localStorage.getItem('user'));

// 删除
localStorage.removeItem('user');

// 清空
localStorage.clear();
```

### 2.2 sessionStorage

```javascript
sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token');
```

## 三、Web Workers

```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({data: [1, 2, 3]});

worker.onmessage = (e) => {
  console.log('结果:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = e.data.data.reduce((a, b) => a + b, 0);
  self.postMessage(result);
};
```

## 四、Drag and Drop

```html
<div draggable="true" ondragstart="handleDragStart(event)">
  拖动我
</div>

<div ondrop="handleDrop(event)" ondragover="handleDragOver(event)">
  放置区域
</div>

<script>
function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.textContent);
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData('text');
  console.log('拖放的数据:', data);
}
</script>
```

## 五、History API

```javascript
// 添加历史记录
history.pushState({page: 1}, 'title', '/page1');

// 监听返回
window.addEventListener('popstate', (e) => {
  console.log('状态:', e.state);
});
```

## 参考资料

- [MDN - Web APIs](https://developer.mozilla.org/zh-CN/docs/Web/API)

---

**上一章** ← [第 28 章：Web Components](./28-web-components.md)  
**下一章** → [第 30 章：离线应用](./30-offline-apps.md)
