# Web API 实践

> 掌握现代浏览器提供的强大 API

---

## 概述

现代浏览器提供了丰富的 Web API，涵盖网络请求、文件处理、多媒体、存储等领域。掌握这些 API 能够构建功能强大的 Web 应用。

本章将深入：
- Fetch API
- File API
- Intersection Observer
- Mutation Observer
- Web Workers
- 其他实用 API

---

## 1. Fetch API

### 1.1 基本用法

```javascript
// GET 请求
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// async/await
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取失败:', error);
  }
}
```

### 1.2 POST 请求

```javascript
async function postData(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
}

// 使用
await postData('https://api.example.com/users', {
  name: 'Alice',
  email: 'alice@example.com'
});
```

### 1.3 请求配置

```javascript
const response = await fetch(url, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  mode: 'cors',  // cors, no-cors, same-origin
  credentials: 'include',  // include, same-origin, omit
  cache: 'no-cache',
  redirect: 'follow',
  referrerPolicy: 'no-referrer'
});
```

### 1.4 处理响应

```javascript
const response = await fetch(url);

// 状态检查
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

// 不同格式
const json = await response.json();
const text = await response.text();
const blob = await response.blob();
const buffer = await response.arrayBuffer();

// 响应头
console.log(response.headers.get('Content-Type'));
```

---

## 2. File API

### 2.1 文件选择

```javascript
const input = document.querySelector('input[type="file"]');

input.addEventListener('change', (event) => {
  const files = event.target.files;
  
  for (const file of files) {
    console.log('文件名:', file.name);
    console.log('大小:', file.size);
    console.log('类型:', file.type);
    console.log('修改时间:', file.lastModified);
  }
});
```

### 2.2 读取文件

```javascript
function readFile(file) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    console.log('文件内容:', event.target.result);
  };
  
  reader.onerror = (error) => {
    console.error('读取失败:', error);
  };
  
  // 不同读取方式
  reader.readAsText(file);          // 文本
  reader.readAsDataURL(file);       // Data URL
  reader.readAsArrayBuffer(file);   // ArrayBuffer
}
```

### 2.3 图片预览

```javascript
input.addEventListener('change', (event) => {
  const file = event.target.files[0];
  
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      document.body.appendChild(img);
    };
    
    reader.readAsDataURL(file);
  }
});
```

### 2.4 文件上传

```javascript
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', file.name);
  
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

// 进度监控
function uploadWithProgress(file) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        console.log(`上传进度: ${percent}%`);
      }
    });
    
    xhr.addEventListener('load', () => {
      resolve(JSON.parse(xhr.responseText));
    });
    
    xhr.addEventListener('error', reject);
    
    const formData = new FormData();
    formData.append('file', file);
    
    xhr.open('POST', '/upload');
    xhr.send(formData);
  });
}
```

---

## 3. Intersection Observer

### 3.1 基本用法

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('元素进入视口:', entry.target);
    } else {
      console.log('元素离开视口:', entry.target);
    }
  });
}, {
  root: null,  // 视口
  rootMargin: '0px',
  threshold: 0.5  // 50% 可见时触发
});

// 观察元素
const targets = document.querySelectorAll('.observe');
targets.forEach(target => observer.observe(target));

// 停止观察
observer.unobserve(target);
observer.disconnect();
```

### 3.2 图片懒加载

```javascript
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

### 3.3 无限滚动

```javascript
const sentinel = document.querySelector('.sentinel');

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMoreContent();
  }
});

observer.observe(sentinel);

async function loadMoreContent() {
  const data = await fetchMoreData();
  renderData(data);
}
```

---

## 4. Mutation Observer

### 4.1 监听 DOM 变化

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    console.log('类型:', mutation.type);
    console.log('目标:', mutation.target);
    
    if (mutation.type === 'childList') {
      console.log('添加的节点:', mutation.addedNodes);
      console.log('删除的节点:', mutation.removedNodes);
    } else if (mutation.type === 'attributes') {
      console.log('属性名:', mutation.attributeName);
      console.log('旧值:', mutation.oldValue);
    }
  });
});

observer.observe(document.body, {
  childList: true,      // 监听子节点
  attributes: true,     // 监听属性
  subtree: true,        // 监听所有后代
  attributeOldValue: true,
  characterData: true   // 监听文本内容
});

// 停止观察
observer.disconnect();
```

### 4.2 实用示例

```javascript
// 监听动态插入的元素
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && node.matches('.dynamic')) {
        console.log('检测到动态元素:', node);
        initDynamicElement(node);
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

---

## 5. Web Workers

### 5.1 创建 Worker

```javascript
// main.js
const worker = new Worker('worker.js');

// 发送消息
worker.postMessage({ type: 'start', data: [1, 2, 3] });

// 接收消息
worker.onmessage = (event) => {
  console.log('Worker 返回:', event.data);
};

// 错误处理
worker.onerror = (error) => {
  console.error('Worker 错误:', error.message);
};

// 终止 Worker
worker.terminate();
```

```javascript
// worker.js
self.onmessage = (event) => {
  const { type, data } = event.data;
  
  if (type === 'start') {
    const result = heavyComputation(data);
    self.postMessage(result);
  }
};

function heavyComputation(data) {
  // 耗时计算
  return data.map(x => x * 2);
}
```

### 5.2 共享 Worker

```javascript
// Shared Worker 可被多个页面共享
const worker = new SharedWorker('shared-worker.js');

worker.port.onmessage = (event) => {
  console.log('消息:', event.data);
};

worker.port.postMessage('Hello');
```

---

## 6. 其他实用 API

### 6.1 Page Visibility API

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('页面隐藏');
    pauseVideo();
  } else {
    console.log('页面可见');
    playVideo();
  }
});
```

### 6.2 Notification API

```javascript
async function showNotification() {
  // 请求权限
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    new Notification('标题', {
      body: '通知内容',
      icon: '/icon.png',
      badge: '/badge.png'
    });
  }
}
```

### 6.3 Clipboard API

```javascript
// 复制
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('复制成功');
  } catch (err) {
    console.error('复制失败:', err);
  }
}

// 粘贴
async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    console.log('粘贴内容:', text);
  } catch (err) {
    console.error('粘贴失败:', err);
  }
}
```

### 6.4 Web Storage

```javascript
// localStorage（永久存储）
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// sessionStorage（会话存储）
sessionStorage.setItem('key', 'value');

// 存储对象
const user = { name: 'Alice', age: 25 };
localStorage.setItem('user', JSON.stringify(user));
const savedUser = JSON.parse(localStorage.getItem('user'));
```

### 6.5 IndexedDB

```javascript
// 打开数据库
const request = indexedDB.open('MyDatabase', 1);

request.onerror = () => {
  console.error('数据库打开失败');
};

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('数据库打开成功');
};

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // 创建对象存储
  const objectStore = db.createObjectStore('users', {
    keyPath: 'id',
    autoIncrement: true
  });
  
  // 创建索引
  objectStore.createIndex('name', 'name', { unique: false });
};
```

---

## 关键要点

1. **Fetch API**
   - 现代网络请求
   - Promise 接口
   - 支持流式处理

2. **File API**
   - 文件读取
   - 图片预览
   - 文件上传

3. **Observer API**
   - IntersectionObserver（可见性）
   - MutationObserver（DOM 变化）
   - ResizeObserver（尺寸变化）

4. **Web Workers**
   - 多线程计算
   - 不阻塞主线程
   - 数据传递

5. **实用 API**
   - Page Visibility
   - Notification
   - Clipboard
   - Storage

---

## 参考资料

- [MDN: Web APIs](https://developer.mozilla.org/zh-CN/docs/Web/API)
- [Web.dev: Capabilities](https://web.dev/fugu-status/)

---

**上一章**：[事件机制深入](./content-29.md)  
**下一章**：[ES6+ 模块系统](./content-31.md)
