# 网络请求（Fetch API）

## 概述

Fetch API 是现代浏览器提供的网络请求接口：

- 基于 Promise
- 更接近“请求/响应”模型（`Request` / `Response`）
- 支持流式读取（Streams）等能力

但也有几个必须知道的行为差异：

- **HTTP 4xx/5xx 不会让 fetch Promise reject**（仍然 resolve，只是 `response.ok === false`）
- **响应体只能读取一次**（`response.json()` 之后不能再 `response.text()`）

---

## 一、基本使用

### 1.1 GET

```js
fetch('https://api.example.com/data')
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

async/await 写法：

```js
async function fetchData() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  return data;
}
```

### 1.2 POST（JSON）

```js
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', age: 25 })
}).then((res) => res.json());
```

---

## 二、Request 配置要点

### 2.1 method

```js
fetch(url, { method: 'GET' });
fetch(url, { method: 'POST', body: data });
fetch(url, { method: 'PUT', body: data });
fetch(url, { method: 'DELETE' });
fetch(url, { method: 'PATCH', body: data });
```

### 2.2 headers

```js
fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  }
});
```

### 2.3 body（常见三类）

- JSON：`JSON.stringify`
- 表单：`FormData`
- 查询参数：`URLSearchParams`

```js
// FormData（上传文件常用）
const form = new FormData();
form.append('file', fileInput.files[0]);

fetch('/upload', { method: 'POST', body: form });
```

> **注意**
>
> 使用 `FormData` 时不要手动设置 `Content-Type`，浏览器会自动带上 multipart boundary。

### 2.4 credentials / cache / redirect

```js
fetch(url, {
  credentials: 'include', // 'omit' | 'same-origin' | 'include'
  cache: 'no-cache',
  redirect: 'follow'
});
```

---

## 三、Response 对象

### 3.1 状态信息

```js
const res = await fetch(url);

res.ok;         // 200-299 为 true
res.status;     // 200/404/500...
res.statusText; // 'OK'
res.headers;    // Headers
res.url;        // 最终 URL（可能重定向后）
```

### 3.2 读取响应体（只能读一次）

```js
await res.json();
await res.text();
await res.blob();
await res.arrayBuffer();
await res.formData();
```

如果你需要读两次，通常用 `res.clone()`：

```js
const r1 = res.clone();
const a = await r1.text();
const b = await res.json();
```

---

## 四、错误处理（必须手写）

### 4.1 统一检查 `response.ok`

```js
async function request(url, options) {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }

  return res;
}
```

### 4.2 fetch reject 的场景

- 网络断开
- DNS/连接失败
- CORS 被拦截

HTTP 4xx/5xx **不是** reject。

---

## 五、取消与超时：AbortController

```js
const controller = new AbortController();

fetch(url, { signal: controller.signal })
  .catch((e) => {
    if (e.name === 'AbortError') console.log('aborted');
  });

controller.abort();
```

超时封装（示意）：

```js
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}
```

---

## 六、并发请求

### 6.1 `Promise.all`

```js
const [users, posts] = await Promise.all([
  fetch('/api/users').then((r) => r.json()),
  fetch('/api/posts').then((r) => r.json())
]);
```

### 6.2 `Promise.allSettled`

```js
const results = await Promise.allSettled([
  fetch('/api/users'),
  fetch('/api/posts')
]);

results.forEach((r) => {
  if (r.status === 'fulfilled') {
    console.log('ok');
  } else {
    console.log('fail', r.reason);
  }
});
```

---

## 七、文件上传

```js
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

> **限制**
>
> Fetch 原生不直接提供类似 XHR 的上传进度事件。需要进度时，常见方案是 XHR，或基于 Streams 的更复杂实现。

---

## 八、Fetch vs XMLHttpRequest

| 特性 | Fetch | XHR |
| --- | --- | --- |
| API 风格 | Promise | 回调/事件 |
| 语法 | 简洁 | 相对繁琐 |
| 流式读取 | 支持 | 不友好 |
| 超时/取消 | AbortController | abort/timeout |
| 上传进度 | 需额外方案 | 直接支持 |

---

## 九、最佳实践

1. **统一封装**：把 `ok` 检查、错误解析、超时、鉴权统一收口。
2. **明确 credentials**：是否携带 Cookie 要在调用层说清楚。
3. **请求可取消**：组件卸载/路由切换时取消未完成请求。
4. **区分网络错误与业务错误**：两类错误的提示与重试策略不同。

---

## 参考资料

- [Fetch Standard](https://fetch.spec.whatwg.org/)
- [MDN - Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
