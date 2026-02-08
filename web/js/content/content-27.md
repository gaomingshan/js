# 浏览器对象模型 BOM

> 理解浏览器提供的核心 API

---

## 概述

BOM（Browser Object Model）提供了与浏览器窗口交互的对象和方法。理解 BOM 是开发 Web 应用的基础。

本章将深入：
- window 对象
- location 对象
- navigator 对象
- history 对象
- screen 对象

---

## 1. window 对象

### 1.1 全局作用域

```javascript
// window 是浏览器的全局对象
var globalVar = "全局变量";
console.log(window.globalVar);  // "全局变量"

// 全局函数也是 window 的方法
function globalFunc() {
  console.log("全局函数");
}
window.globalFunc();  // "全局函数"

// let/const 不会成为 window 属性
let letVar = "let变量";
console.log(window.letVar);  // undefined
```

### 1.2 窗口尺寸

```javascript
// 视口尺寸（不含滚动条）
console.log(window.innerWidth, window.innerHeight);

// 浏览器窗口尺寸（含工具栏等）
console.log(window.outerWidth, window.outerHeight);

// 屏幕可用尺寸
console.log(screen.availWidth, screen.availHeight);

// 监听窗口大小变化
window.addEventListener('resize', () => {
  console.log('窗口大小:', window.innerWidth, window.innerHeight);
});
```

### 1.3 定时器

```javascript
// setTimeout
const timeoutId = setTimeout(() => {
  console.log('延迟执行');
}, 1000);

clearTimeout(timeoutId);  // 取消

// setInterval
const intervalId = setInterval(() => {
  console.log('重复执行');
}, 1000);

clearInterval(intervalId);  // 取消

// requestAnimationFrame（推荐用于动画）
function animate() {
  // 动画逻辑
  requestAnimationFrame(animate);
}
animate();
```

### 1.4 对话框

```javascript
// alert
alert('提示信息');

// confirm
const result = confirm('确认操作？');
if (result) {
  console.log('用户点击确认');
}

// prompt
const input = prompt('请输入名字:', '默认值');
console.log('用户输入:', input);
```

---

## 2. location 对象

### 2.1 URL 信息

```javascript
// 完整 URL
console.log(location.href);
// "https://example.com:8080/path?query=1#hash"

// 协议
console.log(location.protocol);  // "https:"

// 主机名
console.log(location.hostname);  // "example.com"

// 端口
console.log(location.port);  // "8080"

// 路径
console.log(location.pathname);  // "/path"

// 查询参数
console.log(location.search);  // "?query=1"

// 哈希
console.log(location.hash);  // "#hash"

// 源（协议+主机+端口）
console.log(location.origin);  // "https://example.com:8080"
```

### 2.2 页面导航

```javascript
// 跳转到新页面（有历史记录）
location.href = 'https://example.com';
location.assign('https://example.com');

// 替换当前页面（无历史记录）
location.replace('https://example.com');

// 刷新页面
location.reload();
location.reload(true);  // 强制从服务器重新加载
```

### 2.3 URLSearchParams

```javascript
// 解析查询参数
const params = new URLSearchParams(location.search);

console.log(params.get('id'));  // 获取参数
console.log(params.has('name'));  // 检查参数
params.set('page', '2');  // 设置参数
params.delete('old');  // 删除参数

// 遍历参数
for (const [key, value] of params) {
  console.log(key, value);
}

// 更新 URL
const newUrl = `${location.pathname}?${params.toString()}`;
history.pushState(null, '', newUrl);
```

---

## 3. navigator 对象

### 3.1 浏览器信息

```javascript
// 用户代理字符串
console.log(navigator.userAgent);

// 平台
console.log(navigator.platform);  // "Win32", "MacIntel"

// 语言
console.log(navigator.language);  // "zh-CN"

// 是否在线
console.log(navigator.onLine);

// 监听在线状态
window.addEventListener('online', () => {
  console.log('网络已连接');
});

window.addEventListener('offline', () => {
  console.log('网络已断开');
});
```

### 3.2 地理位置

```javascript
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      console.log('纬度:', position.coords.latitude);
      console.log('经度:', position.coords.longitude);
    },
    error => {
      console.error('获取位置失败:', error.message);
    }
  );
}
```

### 3.3 剪贴板 API

```javascript
// 写入剪贴板
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('复制成功');
  } catch (err) {
    console.error('复制失败:', err);
  }
}

// 读取剪贴板
async function readFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    console.log('剪贴板内容:', text);
  } catch (err) {
    console.error('读取失败:', err);
  }
}
```

---

## 4. history 对象

### 4.1 历史导航

```javascript
// 后退
history.back();
history.go(-1);

// 前进
history.forward();
history.go(1);

// 跳转到特定页面
history.go(-2);  // 后退两页
history.go(0);   // 刷新页面

// 历史记录长度
console.log(history.length);
```

### 4.2 History API

```javascript
// pushState：添加历史记录（不刷新页面）
history.pushState(
  { page: 1 },  // state 对象
  'Title',      // 标题（大多数浏览器忽略）
  '/page/1'     // URL
);

// replaceState：替换当前历史记录
history.replaceState(
  { page: 2 },
  'Title',
  '/page/2'
);

// 监听历史记录变化
window.addEventListener('popstate', (event) => {
  console.log('state:', event.state);
  console.log('location:', location.pathname);
  
  // 根据 state 更新页面内容
  loadPage(event.state.page);
});
```

### 4.3 单页应用路由

```javascript
class Router {
  constructor(routes) {
    this.routes = routes;
    
    // 监听链接点击
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.href);
      }
    });
    
    // 监听浏览器前进后退
    window.addEventListener('popstate', () => {
      this.render();
    });
    
    this.render();
  }
  
  navigate(url) {
    history.pushState(null, '', url);
    this.render();
  }
  
  render() {
    const path = location.pathname;
    const route = this.routes[path] || this.routes['/404'];
    
    document.getElementById('app').innerHTML = route();
  }
}

// 使用
const router = new Router({
  '/': () => '<h1>首页</h1>',
  '/about': () => '<h1>关于</h1>',
  '/404': () => '<h1>404</h1>'
});
```

---

## 5. screen 对象

```javascript
// 屏幕分辨率
console.log(screen.width, screen.height);

// 可用屏幕空间（去除任务栏等）
console.log(screen.availWidth, screen.availHeight);

// 色彩深度
console.log(screen.colorDepth);

// 像素深度
console.log(screen.pixelDepth);

// 屏幕方向
console.log(screen.orientation.type);
// "portrait-primary", "landscape-primary"

// 监听方向变化
screen.orientation.addEventListener('change', () => {
  console.log('屏幕方向:', screen.orientation.type);
});
```

---

## 6. 存储 API

### 6.1 localStorage

```javascript
// 存储（永久保存，除非手动删除）
localStorage.setItem('key', 'value');
localStorage.key = 'value';  // 不推荐

// 读取
const value = localStorage.getItem('key');
console.log(localStorage.key);  // 不推荐

// 删除
localStorage.removeItem('key');

// 清空
localStorage.clear();

// 存储对象
const user = { name: 'Alice', age: 25 };
localStorage.setItem('user', JSON.stringify(user));

const savedUser = JSON.parse(localStorage.getItem('user'));
```

### 6.2 sessionStorage

```javascript
// 会话存储（关闭标签页后清除）
sessionStorage.setItem('sessionKey', 'sessionValue');

const value = sessionStorage.getItem('sessionKey');

sessionStorage.removeItem('sessionKey');
sessionStorage.clear();
```

### 6.3 监听存储变化

```javascript
// 监听其他标签页的存储变化
window.addEventListener('storage', (e) => {
  console.log('key:', e.key);
  console.log('oldValue:', e.oldValue);
  console.log('newValue:', e.newValue);
  console.log('url:', e.url);
});

// 注意：当前标签页修改不会触发 storage 事件
```

---

## 7. 实用技巧

### 7.1 检测浏览器特性

```javascript
// 检测功能支持
const features = {
  localStorage: typeof localStorage !== 'undefined',
  geolocation: 'geolocation' in navigator,
  webWorker: typeof Worker !== 'undefined',
  webSocket: typeof WebSocket !== 'undefined',
  serviceWorker: 'serviceWorker' in navigator
};

console.log(features);
```

### 7.2 页面可见性

```javascript
// 检测页面是否可见
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('页面隐藏');
    // 暂停视频、停止轮询等
  } else {
    console.log('页面可见');
    // 恢复操作
  }
});
```

### 7.3 全屏 API

```javascript
// 进入全屏
async function enterFullscreen(element = document.documentElement) {
  try {
    await element.requestFullscreen();
  } catch (err) {
    console.error('无法进入全屏:', err);
  }
}

// 退出全屏
async function exitFullscreen() {
  try {
    await document.exitFullscreen();
  } catch (err) {
    console.error('无法退出全屏:', err);
  }
}

// 检测全屏状态
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    console.log('已进入全屏');
  } else {
    console.log('已退出全屏');
  }
});
```

---

## 关键要点

1. **window 对象**
   - 全局对象
   - 定时器
   - 窗口尺寸

2. **location 对象**
   - URL 信息
   - 页面导航
   - URLSearchParams

3. **navigator 对象**
   - 浏览器信息
   - 地理位置
   - 剪贴板

4. **history 对象**
   - 历史导航
   - pushState/replaceState
   - 单页应用路由

5. **存储 API**
   - localStorage（永久）
   - sessionStorage（会话）
   - storage 事件

---

## 参考资料

- [MDN: Window](https://developer.mozilla.org/zh-CN/docs/Web/API/Window)
- [MDN: History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)
- [MDN: Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API)

---

**上一章**：[内存管理与优化](./content-26.md)  
**下一章**：[DOM 操作详解](./content-28.md)
