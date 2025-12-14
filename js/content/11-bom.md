# 浏览器对象模型（BOM）

## 概述

BOM（Browser Object Model）是浏览器提供的一组“与浏览器环境交互”的对象体系。与 DOM（操作文档结构）不同，BOM 更关注：

- 窗口与屏幕：尺寸、滚动、打开/关闭
- URL 与导航：`location`、`history`
- 设备与环境：`navigator`、在线状态、地理位置
- 定时器与动画：`setTimeout` / `setInterval` / `requestAnimationFrame`

---

## 一、window：浏览器全局对象

### 1.1 全局变量与 window

```js
var x = 1;
console.log(window.x); // 1

function f() {}
console.log(window.f); // function
```

> **注意**
>
> `let/const` 声明的全局变量不会挂到 `window` 上。

### 1.2 窗口尺寸与屏幕信息

```js
window.innerWidth;
window.innerHeight;

window.outerWidth;
window.outerHeight;

window.screen.width;
window.screen.height;
window.screen.availWidth;
window.screen.availHeight;
```

### 1.3 位置与滚动

```js
window.screenX;
window.screenY;

window.scrollX; // pageXOffset
window.scrollY; // pageYOffset
```

滚动控制：

```js
window.scrollTo({ top: 0, behavior: 'smooth' });
window.scrollBy(0, 100);

el.scrollIntoView({ behavior: 'smooth', block: 'start' });
```

### 1.4 常见窗口方法

```js
window.open('https://example.com', 'name', 'width=800,height=600');
window.close();

window.alert('提示');
window.confirm('确认吗？');
window.prompt('请输入：', '默认值');
```

> **提示**
>
> `window.open` 可能被浏览器的弹窗拦截策略限制（通常要求由用户手势触发）。

---

## 二、location：URL 与导航

### 2.1 URL 组成

```js
location.href;
location.protocol;
location.hostname;
location.port;
location.pathname;
location.search;
location.hash;
```

### 2.2 跳转与刷新

```js
location.assign('https://example.com');
location.replace('https://example.com');

location.reload();
```

- `assign`：生成新的历史记录
- `replace`：替换当前记录（不允许回退到旧页面）

### 2.3 URLSearchParams

```js
const params = new URLSearchParams(location.search);
params.get('q');
params.has('q');

for (const [k, v] of params) {
  console.log(k, v);
}
```

> **建议**
>
> 处理 URL 优先使用 `URL` / `URLSearchParams`，而不是手写字符串拆分。

---

## 三、navigator：浏览器与设备信息

### 3.1 常用字段

```js
navigator.userAgent;
navigator.platform;
navigator.language;
navigator.languages;
```

### 3.2 在线状态

```js
navigator.onLine;

window.addEventListener('online', () => {
  console.log('网络连接');
});

window.addEventListener('offline', () => {
  console.log('网络断开');
});
```

### 3.3 地理位置

```js
navigator.geolocation.getCurrentPosition(
  (pos) => {
    console.log(pos.coords.latitude, pos.coords.longitude);
  },
  (err) => {
    console.error(err);
  }
);
```

> **注意**
>
> 地理位置 API 通常需要 HTTPS，且会触发权限弹窗。

---

## 四、history：历史记录与 SPA 路由

### 4.1 基础导航

```js
history.back();
history.forward();
history.go(-1);

history.length;
```

### 4.2 History API

```js
history.pushState({ page: 1 }, 'title', '/page1');
history.replaceState({ page: 2 }, '', '/page2');

window.addEventListener('popstate', (e) => {
  console.log(e.state);
});
```

> **实践建议**
>
> SPA 路由的核心就是：
>
> - 用 `pushState/replaceState` 改 URL 但不刷新
> - 监听 `popstate` 处理回退/前进

---

## 五、screen：屏幕信息

```js
screen.width;
screen.height;
screen.availWidth;
screen.availHeight;

screen.colorDepth;
screen.pixelDepth;
```

---

## 六、定时器与动画帧

### 6.1 `setTimeout` / `setInterval`

```js
const t = setTimeout(() => {}, 1000);
clearTimeout(t);

const i = setInterval(() => {}, 1000);
clearInterval(i);
```

> **提示**
>
> 对于“周期性但要避免重叠”的任务，常用“递归 setTimeout”替代 `setInterval`。

### 6.2 `requestAnimationFrame`

```js
let id;
function tick() {
  // 更新动画
  id = requestAnimationFrame(tick);
}

id = requestAnimationFrame(tick);
cancelAnimationFrame(id);
```

`requestAnimationFrame` 的优势：

- 与浏览器刷新节奏对齐
- 页面不可见时会被降频/暂停（更省电）

---

## 七、实用技巧（谨慎使用）

### 7.1 浏览器检测 vs 特性检测

```js
const supportsClipboard = !!navigator.clipboard;
```

> **建议**
>
> 绝大多数情况下用“特性检测”而不是 userAgent 正则。

### 7.2 matchMedia

```js
const isMobile = window.matchMedia('(max-width: 768px)').matches;
```

---

## 八、最佳实践

1. **避免污染全局**：使用模块化或 IIFE。
2. **清理副作用**：组件卸载时清理定时器、事件监听。
3. **URL 解析用 URL API**：避免手写解析 bug。
4. **动画使用 RAF**：不要用 setInterval 模拟动画。

---

## 参考资料

- [HTML Standard - Window](https://html.spec.whatwg.org/#window)
- [MDN - Window](https://developer.mozilla.org/zh-CN/docs/Web/API/Window)
- [MDN - History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History)
