# 第 29 章：HTML5 API - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | localStorage
### 题目
localStorage 的特点？**（多选）**

**A.** 持久化存储 | **B.** 同源限制 | **C.** 5-10MB容量 | **D.** 自动过期

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C
```javascript
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();
```
**来源：** Web Storage API
</details>

---

## 第 2 题 🟢 | Geolocation
### 题目
获取地理位置。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  },
  (error) => console.error(error)
);
```
**来源：** Geolocation API
</details>

---

## 第 3 题 🟢 | History API
### 题目
History API 的方法？**（多选）**

**A.** pushState | **B.** replaceState | **C.** back/forward | **D.** reset

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C
```javascript
history.pushState({page: 1}, 'title', '/page1');
history.replaceState({page: 2}, 'title', '/page2');
history.back();
history.forward();
history.go(-2);
```
**来源：** History API
</details>

---

## 第 4 题 🟡 | Drag and Drop
### 题目
实现拖放功能。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```html
<div id="drag" draggable="true">拖我</div>
<div id="drop">放这里</div>

<script>
const drag = document.getElementById('drag');
const drop = document.getElementById('drop');

drag.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text', e.target.id);
});

drop.addEventListener('dragover', (e) => {
  e.preventDefault();
});

drop.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text');
  drop.appendChild(document.getElementById(id));
});
</script>
```
**来源：** Drag and Drop API
</details>

---

## 第 5 题 🟡 | Notification
### 题目
发送浏览器通知。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('标题', {
      body: '通知内容',
      icon: 'icon.png',
      tag: 'unique-tag'
    });
  }
});
```
**来源：** Notifications API
</details>

---

## 第 6 题 🟡 | File API
### 题目
读取文件内容。

<details><summary>查看答案</summary>
### ✅ 答案
```html
<input type="file" id="file">

<script>
document.getElementById('file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    console.log(e.target.result);
  };
  
  reader.readAsText(file);
  // reader.readAsDataURL(file); // 图片预览
});
</script>
```
**来源：** File API
</details>

---

## 第 7 题 🟡 | IndexedDB
### 题目
IndexedDB 的基本用法。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
const request = indexedDB.open('myDB', 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  const store = db.createObjectStore('users', {keyPath: 'id'});
  store.createIndex('name', 'name', {unique: false});
};

request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('users', 'readwrite');
  const store = tx.objectStore('users');
  
  store.add({id: 1, name: '张三'});
  store.get(1).onsuccess = (e) => console.log(e.target.result);
};
```
**来源：** IndexedDB API
</details>

---

## 第 8 题 🔴 | Web Workers
### 题目
使用 Web Worker 处理计算。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({numbers: [1, 2, 3, 4, 5]});

worker.onmessage = (e) => {
  console.log('结果：', e.data);
};

// worker.js
self.onmessage = (e) => {
  const {numbers} = e.data;
  const sum = numbers.reduce((a, b) => a + b, 0);
  self.postMessage(sum);
};
```
**来源：** Web Workers
</details>

---

## 第 9 题 🔴 | WebSocket
### 题目
WebSocket 实时通信。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('连接成功');
  ws.send('Hello Server');
};

ws.onmessage = (e) => {
  console.log('收到消息：', e.data);
};

ws.onerror = (error) => {
  console.error('错误：', error);
};

ws.onclose = () => {
  console.log('连接关闭');
};
```
**来源：** WebSocket API
</details>

---

## 第 10 题 🔴 | Intersection Observer
### 题目
实现懒加载和无限滚动。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 懒加载
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));

// 无限滚动
const sentinel = document.getElementById('sentinel');

const scrollObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMore();
  }
}, {rootMargin: '100px'});

scrollObserver.observe(sentinel);
```
**来源：** Intersection Observer API
</details>

---

**📌 本章总结**
- localStorage/sessionStorage：客户端存储
- Geolocation：地理位置
- History API：单页应用路由
- Drag and Drop：拖放功能
- Notification：浏览器通知
- File API：文件读取
- IndexedDB：本地数据库
- Web Workers：多线程
- WebSocket：实时通信
- Intersection Observer：视口交叉检测

**上一章** ← [第 28 章：Web Components](./chapter-28.md)  
**下一章** → [第 30 章：离线应用](./chapter-30.md)
