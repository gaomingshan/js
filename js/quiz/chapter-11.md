# 第 11 章：BOM 与浏览器 API - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** localStorage vs sessionStorage

### 题目

localStorage 和 sessionStorage 的主要区别是什么？

**选项：**
- A. localStorage 存储容量更大
- B. sessionStorage 在页面关闭后数据会被清除
- C. localStorage 可以跨域访问
- D. sessionStorage 速度更快

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**localStorage vs sessionStorage**

| 特性 | localStorage | sessionStorage |
|------|--------------|----------------|
| 生命周期 | 永久（除非手动清除） | 页面会话期间 |
| 作用域 | 同源所有标签页 | 当前标签页 |
| 容量 | 5-10MB | 5-10MB |
| API | 相同 | 相同 |

**生命周期对比：**
```javascript
// localStorage：永久存储
localStorage.setItem('user', 'Alice');
// 关闭浏览器，重新打开
console.log(localStorage.getItem('user'));  // "Alice"（仍然存在）

// sessionStorage：会话存储
sessionStorage.setItem('temp', 'data');
// 关闭标签页，重新打开
console.log(sessionStorage.getItem('temp'));  // null（已清除）
```

**作用域对比：**
```javascript
// localStorage：同源所有标签页共享
// 标签页 A
localStorage.setItem('shared', 'value');

// 标签页 B（同源）
console.log(localStorage.getItem('shared'));  // "value"

// sessionStorage：仅当前标签页
// 标签页 A
sessionStorage.setItem('private', 'value');

// 标签页 B（即使同源）
console.log(sessionStorage.getItem('private'));  // null
```

**常用操作：**
```javascript
// 设置
localStorage.setItem('key', 'value');
sessionStorage.setItem('key', 'value');

// 获取
localStorage.getItem('key');
sessionStorage.getItem('key');

// 删除
localStorage.removeItem('key');
sessionStorage.removeItem('key');

// 清空
localStorage.clear();
sessionStorage.clear();

// 获取键名
localStorage.key(0);  // 第一个键

// 获取数量
localStorage.length;
```

**存储对象：**
```javascript
// ❌ 直接存储对象会转为字符串
const user = { name: 'Alice', age: 25 };
localStorage.setItem('user', user);
console.log(localStorage.getItem('user'));  // "[object Object]"

// ✅ 使用 JSON
localStorage.setItem('user', JSON.stringify(user));
const stored = JSON.parse(localStorage.getItem('user'));
console.log(stored.name);  // "Alice"
```

**监听存储变化：**
```javascript
// 只能监听其他标签页的 localStorage 变化
window.addEventListener('storage', (e) => {
  console.log('Key:', e.key);
  console.log('Old Value:', e.oldValue);
  console.log('New Value:', e.newValue);
  console.log('URL:', e.url);
  console.log('Storage:', e.storageArea);
});
```

**封装工具类：**
```javascript
class Storage {
  static set(key, value, expire = null) {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    };
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  static get(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const data = JSON.parse(item);
    
    // 检查过期
    if (data.expire && Date.now() > data.expire) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data.value;
  }
  
  static remove(key) {
    localStorage.removeItem(key);
  }
  
  static clear() {
    localStorage.clear();
  }
}

// 使用
Storage.set('token', 'abc123', 3600000);  // 1小时后过期
const token = Storage.get('token');
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** window 对象

### 题目

以下哪个不是 window 对象的方法？

**选项：**
- A. `alert()`
- B. `setTimeout()`
- C. `fetch()`
- D. `querySelector()`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**window 对象的方法**

**A、B、C 都是 window 的方法：**
```javascript
window.alert('message');
window.setTimeout(() => {}, 1000);
window.fetch('/api');

// 可以省略 window
alert('message');
setTimeout(() => {}, 1000);
fetch('/api');
```

**D 是 document 的方法：**
```javascript
// ❌ window 没有 querySelector
window.querySelector('.class');  // undefined

// ✅ document 有 querySelector
document.querySelector('.class');
```

**window 常用方法：**

**对话框**
```javascript
alert('提示');
confirm('确认吗?');  // 返回 true/false
prompt('请输入:', '默认值');  // 返回输入值或 null
```

**定时器**
```javascript
const timerId = setTimeout(() => {}, 1000);
clearTimeout(timerId);

const intervalId = setInterval(() => {}, 1000);
clearInterval(intervalId);
```

**窗口操作**
```javascript
window.open('url', '_blank');
window.close();
window.print();
window.focus();
window.blur();
```

**滚动**
```javascript
window.scrollTo(0, 100);
window.scrollBy(0, 10);
window.scroll({ top: 100, behavior: 'smooth' });
```

**尺寸和位置**
```javascript
window.innerWidth;   // 视口宽度
window.innerHeight;  // 视口高度
window.outerWidth;   // 浏览器窗口宽度
window.outerHeight;  // 浏览器窗口高度

window.screenX;      // 窗口相对屏幕 X
window.screenY;      // 窗口相对屏幕 Y

window.pageXOffset;  // 水平滚动距离（scrollX）
window.pageYOffset;  // 垂直滚动距离（scrollY）
```

**导航**
```javascript
window.location.href;      // 完整 URL
window.location.hostname;  // 主机名
window.location.pathname;  // 路径
window.location.search;    // 查询参数
window.location.hash;      // 哈希

window.location.reload();    // 刷新
window.location.replace(url); // 替换（不产生历史记录）
window.location.assign(url);  // 跳转（产生历史记录）
```

**其他**
```javascript
window.requestAnimationFrame(callback);
window.cancelAnimationFrame(id);

window.getComputedStyle(element);
window.matchMedia('(max-width: 768px)');

window.btoa('string');  // Base64 编码
window.atob('encoded'); // Base64 解码
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Cookie

### 题目

Cookie 可以通过 JavaScript 的 `document.cookie` 访问和设置。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Cookie 操作**

```javascript
// 设置 Cookie
document.cookie = 'username=Alice';
document.cookie = 'token=abc123; max-age=3600';  // 1小时后过期

// 读取 Cookie
console.log(document.cookie);  // "username=Alice; token=abc123"
```

**Cookie 属性：**
```javascript
// expires：过期时间（GMT 格式）
document.cookie = 'key=value; expires=' + new Date(2024, 11, 31).toUTCString();

// max-age：存活时间（秒）
document.cookie = 'key=value; max-age=3600';  // 1小时

// path：路径
document.cookie = 'key=value; path=/';  // 根路径下所有页面可访问

// domain：域名
document.cookie = 'key=value; domain=.example.com';  // 所有子域可访问

// secure：仅 HTTPS
document.cookie = 'key=value; secure';

// httpOnly：仅服务器访问（JavaScript 无法访问）
// 只能在服务器端设置
Set-Cookie: key=value; HttpOnly

// SameSite：跨站请求限制
document.cookie = 'key=value; SameSite=Strict';  // 严格模式
document.cookie = 'key=value; SameSite=Lax';     // 宽松模式
document.cookie = 'key=value; SameSite=None; Secure';  // 无限制（需 Secure）
```

**Cookie 工具函数：**
```javascript
const Cookie = {
  // 设置
  set(name, value, options = {}) {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (options.maxAge) {
      cookie += `; max-age=${options.maxAge}`;
    }
    
    if (options.expires) {
      cookie += `; expires=${options.expires.toUTCString()}`;
    }
    
    if (options.path) {
      cookie += `; path=${options.path}`;
    }
    
    if (options.domain) {
      cookie += `; domain=${options.domain}`;
    }
    
    if (options.secure) {
      cookie += '; secure';
    }
    
    if (options.sameSite) {
      cookie += `; SameSite=${options.sameSite}`;
    }
    
    document.cookie = cookie;
  },
  
  // 获取
  get(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (decodeURIComponent(key) === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },
  
  // 删除
  remove(name, options = {}) {
    this.set(name, '', {
      ...options,
      maxAge: -1
    });
  },
  
  // 获取所有
  getAll() {
    const cookies = {};
    document.cookie.split('; ').forEach(cookie => {
      const [key, value] = cookie.split('=');
      cookies[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return cookies;
  }
};

// 使用
Cookie.set('user', 'Alice', { maxAge: 3600, path: '/' });
console.log(Cookie.get('user'));  // "Alice"
Cookie.remove('user');
```

**Cookie vs Storage：**

| 特性 | Cookie | localStorage | sessionStorage |
|------|--------|--------------|----------------|
| 容量 | 4KB | 5-10MB | 5-10MB |
| 请求携带 | ✅ | ❌ | ❌ |
| API | 字符串操作 | 键值对 API | 键值对 API |
| 过期时间 | 可设置 | 永久 | 会话期间 |
| 跨域 | 可配置 | 同源 | 同源 |

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** location

### 题目

以下代码会发生什么？

```javascript
// 当前 URL: https://example.com/page?id=123#section

console.log(location.search);
console.log(location.hash);

location.hash = 'top';
```

**选项：**
- A. `"?id=123"`, `"#section"`，页面跳转到 `#top`
- B. `"?id=123"`, `"#section"`，页面不跳转
- C. `"id=123"`, `"section"`，页面跳转到 `#top`
- D. `"id=123"`, `"section"`，页面不跳转

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**location 对象**

```javascript
// URL: https://example.com:8080/path/page?id=123&name=test#section

location.href;      // "https://example.com:8080/path/page?id=123&name=test#section"
location.origin;    // "https://example.com:8080"
location.protocol;  // "https:"
location.host;      // "example.com:8080"
location.hostname;  // "example.com"
location.port;      // "8080"
location.pathname;  // "/path/page"
location.search;    // "?id=123&name=test"
location.hash;      // "#section"
```

**修改 location：**
```javascript
// 修改 hash（不刷新页面，不产生历史记录）
location.hash = 'top';  // URL 变为 #top

// 修改 search（刷新页面）
location.search = '?page=2';

// 跳转（产生历史记录）
location.href = 'https://example.com';
location.assign('https://example.com');

// 替换（不产生历史记录）
location.replace('https://example.com');

// 刷新
location.reload();       // 可能使用缓存
location.reload(true);   // 强制从服务器刷新
```

**解析 URL 参数：**
```javascript
// URL: ?id=123&name=Alice&tags=a&tags=b

// 方式 1：手动解析
function parseQuery(search) {
  const params = {};
  const query = search.substring(1);  // 移除 ?
  
  query.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);
    
    if (params[decodedKey]) {
      // 已存在，转为数组
      if (Array.isArray(params[decodedKey])) {
        params[decodedKey].push(decodedValue);
      } else {
        params[decodedKey] = [params[decodedKey], decodedValue];
      }
    } else {
      params[decodedKey] = decodedValue;
    }
  });
  
  return params;
}

const params = parseQuery(location.search);
// { id: '123', name: 'Alice', tags: ['a', 'b'] }

// 方式 2：URLSearchParams（推荐）
const params = new URLSearchParams(location.search);
params.get('id');        // "123"
params.get('name');      // "Alice"
params.getAll('tags');   // ["a", "b"]
params.has('id');        // true

// 遍历
params.forEach((value, key) => {
  console.log(key, value);
});

// 转为对象
Object.fromEntries(params);  // { id: '123', name: 'Alice', tags: 'b' }
```

**修改 URL 参数：**
```javascript
// 获取当前参数
const params = new URLSearchParams(location.search);

// 修改参数
params.set('page', '2');
params.delete('old');
params.append('tag', 'new');

// 更新 URL（不刷新页面）
const newUrl = `${location.pathname}?${params.toString()}`;
history.pushState(null, '', newUrl);
```

**URL 对象：**
```javascript
// 解析 URL
const url = new URL('https://example.com/path?id=123#section');

console.log(url.protocol);  // "https:"
console.log(url.hostname);  // "example.com"
console.log(url.pathname);  // "/path"
console.log(url.search);    // "?id=123"
console.log(url.hash);      // "#section"

// 修改
url.searchParams.set('page', '2');
console.log(url.href);  // 包含新参数的完整 URL

// 相对 URL
const relativeUrl = new URL('/api/users', location.origin);
console.log(relativeUrl.href);  // "https://example.com/api/users"
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** history

### 题目

以下代码会在浏览器历史记录中添加几条记录？

```javascript
history.pushState({ page: 1 }, '', '/page1');
history.pushState({ page: 2 }, '', '/page2');
history.replaceState({ page: 3 }, '', '/page3');
history.pushState({ page: 4 }, '', '/page4');
```

**选项：**
- A. 4 条
- B. 3 条
- C. 2 条
- D. 1 条

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**pushState vs replaceState**

```javascript
// pushState：添加新记录
history.pushState({ page: 1 }, '', '/page1');  // +1
history.pushState({ page: 2 }, '', '/page2');  // +1

// replaceState：替换当前记录（不增加）
history.replaceState({ page: 3 }, '', '/page3');  // 0

// pushState：添加新记录
history.pushState({ page: 4 }, '', '/page4');  // +1

// 总共：3 条新记录
```

**history API：**

**导航方法**
```javascript
history.back();     // 后退
history.forward();  // 前进
history.go(-2);     // 后退 2 步
history.go(1);      // 前进 1 步
history.go(0);      // 刷新
```

**状态管理**
```javascript
// pushState(state, title, url)
history.pushState(
  { id: 123 },      // 状态对象
  'Page Title',     // 标题（大多数浏览器忽略）
  '/new-page'       // URL（可选）
);

// 获取当前状态
console.log(history.state);  // { id: 123 }

// 监听状态变化
window.addEventListener('popstate', (e) => {
  console.log('State:', e.state);
  console.log('URL:', location.pathname);
});
```

**实现 SPA 路由：**
```javascript
class Router {
  constructor(routes) {
    this.routes = routes;
    this.init();
  }
  
  init() {
    // 监听前进/后退
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
    
    // 监听链接点击
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.href);
      }
    });
    
    // 初始路由
    this.handleRoute();
  }
  
  navigate(url) {
    history.pushState(null, '', url);
    this.handleRoute();
  }
  
  handleRoute() {
    const path = location.pathname;
    const route = this.routes[path] || this.routes['*'];
    
    if (route) {
      route();
    }
  }
}

// 使用
const router = new Router({
  '/': () => renderHome(),
  '/about': () => renderAbout(),
  '/user/:id': () => renderUser(),
  '*': () => render404()
});

// HTML
<a href="/" data-link>Home</a>
<a href="/about" data-link>About</a>
```

**状态对象注意事项：**
```javascript
// ❌ 状态对象大小有限制（通常 640KB）
const largeState = { data: new Array(1000000).fill('x') };
history.pushState(largeState, '', '/page');  // 可能失败

// ✅ 只存储必要数据
history.pushState({ id: 123 }, '', '/page');

// ❌ 状态对象会被序列化（不能包含函数）
history.pushState({ fn: () => {} }, '', '/page');  // 函数会丢失

// ✅ 只存储可序列化数据
history.pushState({ id: 123, name: 'Alice' }, '', '/page');
```

**检测是否支持：**
```javascript
if (window.history && history.pushState) {
  // 支持 History API
} else {
  // 降级方案：使用 hash
  location.hash = '#/page';
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** Fetch API

### 题目

以下代码会捕获到网络错误吗？

```javascript
fetch('/api/user')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('Error:', err));
```

**选项：**
- A. 会捕获所有错误（包括 404、500 等）
- B. 只捕获网络错误，不捕获 HTTP 错误（如 404、500）
- C. 只捕获 HTTP 错误，不捕获网络错误
- D. 不会捕获任何错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Fetch 的错误处理**

```javascript
fetch('/api/user')
  .then(res => {
    // ⚠️ HTTP 错误（404、500）不会进入 catch
    console.log(res.ok);      // false（HTTP 错误时）
    console.log(res.status);  // 404 或 500
    
    // 需要手动检查
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    
    return res.json();
  })
  .then(data => console.log(data))
  .catch(err => {
    // 只捕获：
    // 1. 网络错误（断网、DNS 失败等）
    // 2. 手动抛出的错误
    // 3. JSON 解析错误
    console.error('Error:', err);
  });
```

**正确的错误处理：**
```javascript
async function fetchData(url) {
  try {
    const res = await fetch(url);
    
    // 检查 HTTP 状态
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    // 处理所有错误
    console.error('Fetch error:', error);
    throw error;
  }
}

// 使用
fetchData('/api/user')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Fetch 配置选项：**
```javascript
fetch('/api/user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({ name: 'Alice' }),
  mode: 'cors',           // cors, no-cors, same-origin
  credentials: 'include', // include, same-origin, omit
  cache: 'no-cache',      // default, no-cache, reload, force-cache
  redirect: 'follow',     // follow, manual, error
  signal: abortController.signal  // 用于取消请求
});
```

**封装 Fetch：**
```javascript
class HTTP {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
  
  async request(url, options = {}) {
    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };
    
    try {
      const res = await fetch(this.baseURL + url, config);
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
  
  get(url, options) {
    return this.request(url, { ...options, method: 'GET' });
  }
  
  post(url, data, options) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  put(url, data, options) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  delete(url, options) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// 使用
const http = new HTTP('https://api.example.com');

http.get('/users')
  .then(users => console.log(users))
  .catch(err => console.error(err));

http.post('/users', { name: 'Alice' })
  .then(user => console.log(user))
  .catch(err => console.error(err));
```

**取消请求：**
```javascript
const controller = new AbortController();

fetch('/api/data', {
  signal: controller.signal
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求已取消');
    }
  });

// 取消请求
controller.abort();
```

**超时控制：**
```javascript
function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

// 使用
fetchWithTimeout('/api/data', 3000)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.error('请求超时');
    }
  });
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** navigator

### 题目

以下哪些可以通过 `navigator` 对象获取？

**选项：**
- A. 浏览器类型和版本
- B. 用户的地理位置
- C. 设备是否在线
- D. 用户的剪贴板内容

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**navigator 对象的属性和方法**

**A. 浏览器信息**
```javascript
navigator.userAgent;    // 用户代理字符串
navigator.appName;      // 浏览器名称
navigator.appVersion;   // 浏览器版本
navigator.platform;     // 操作系统平台
navigator.vendor;       // 浏览器厂商

// 检测浏览器
function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}
```

**B. 地理位置**
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('Latitude:', position.coords.latitude);
    console.log('Longitude:', position.coords.longitude);
    console.log('Accuracy:', position.coords.accuracy);
  },
  (error) => {
    console.error('Error:', error.message);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);

// 监听位置变化
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log('New position:', position.coords);
  }
);

// 停止监听
navigator.geolocation.clearWatch(watchId);
```

**C. 在线状态**
```javascript
console.log(navigator.onLine);  // true 或 false

// 监听状态变化
window.addEventListener('online', () => {
  console.log('网络已连接');
});

window.addEventListener('offline', () => {
  console.log('网络已断开');
});
```

**D. 剪贴板**
```javascript
// 读取剪贴板
navigator.clipboard.readText()
  .then(text => console.log('剪贴板内容:', text))
  .catch(err => console.error('读取失败:', err));

// 写入剪贴板
navigator.clipboard.writeText('Hello')
  .then(() => console.log('复制成功'))
  .catch(err => console.error('复制失败:', err));

// 复制图片
const blob = await fetch('image.png').then(r => r.blob());
await navigator.clipboard.write([
  new ClipboardItem({ 'image/png': blob })
]);
```

**其他常用功能：**

**语言**
```javascript
navigator.language;      // "zh-CN"
navigator.languages;     // ["zh-CN", "zh", "en"]
```

**设备信息**
```javascript
navigator.hardwareConcurrency;  // CPU 核心数
navigator.deviceMemory;         // 设备内存（GB）
navigator.maxTouchPoints;       // 支持的触摸点数
```

**电池状态**
```javascript
navigator.getBattery().then(battery => {
  console.log('电量:', battery.level * 100 + '%');
  console.log('充电中:', battery.charging);
  console.log('充电时间:', battery.chargingTime);
  console.log('放电时间:', battery.dischargingTime);
  
  battery.addEventListener('levelchange', () => {
    console.log('电量变化:', battery.level);
  });
});
```

**媒体设备**
```javascript
// 获取摄像头/麦克风权限
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
})
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => console.error('权限被拒绝:', err));

// 列出设备
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    devices.forEach(device => {
      console.log(device.kind, device.label);
    });
  });
```

**Service Worker**
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('注册成功:', reg))
    .catch(err => console.error('注册失败:', err));
}
```

**分享API**
```javascript
if (navigator.share) {
  navigator.share({
    title: '标题',
    text: '内容',
    url: 'https://example.com'
  })
    .then(() => console.log('分享成功'))
    .catch(err => console.error('分享失败:', err));
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** 请求队列

### 题目

实现一个并发请求控制函数，限制同时发送的请求数量。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**并发请求控制**

```javascript
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.currentCount = 0;
    this.queue = [];
  }
  
  async request(fn) {
    // 如果达到并发上限，加入队列等待
    if (this.currentCount >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.currentCount++;
    
    try {
      const result = await fn();
      return result;
    } finally {
      this.currentCount--;
      
      // 执行队列中的下一个请求
      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve();
      }
    }
  }
}

// 使用
const queue = new RequestQueue(3);  // 最多 3 个并发

const urls = [
  '/api/1',
  '/api/2',
  '/api/3',
  '/api/4',
  '/api/5'
];

const promises = urls.map(url => 
  queue.request(() => fetch(url).then(r => r.json()))
);

Promise.all(promises)
  .then(results => console.log('所有请求完成:', results))
  .catch(err => console.error('请求失败:', err));
```

**Promise.all 并发控制版本：**
```javascript
async function promiseAllWithLimit(tasks, limit) {
  const results = [];
  const executing = [];
  
  for (const [index, task] of tasks.entries()) {
    const promise = Promise.resolve().then(() => task());
    results[index] = promise;
    
    if (limit <= tasks.length) {
      const executing = promise.then(() => {
        executing.splice(executing.indexOf(e), 1);
      });
      executing.push(e);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  return Promise.all(results);
}

// 使用
const tasks = urls.map(url => () => fetch(url).then(r => r.json()));
const results = await promiseAllWithLimit(tasks, 3);
```

**更简洁的实现：**
```javascript
async function concurrentRequests(urls, limit) {
  const results = [];
  const pool = [];
  
  for (let i = 0; i < urls.length; i++) {
    const request = fetch(urls[i])
      .then(r => r.json())
      .then(data => {
        results[i] = data;
      });
    
    pool.push(request);
    
    if (pool.length >= limit) {
      await Promise.race(pool);
      pool.splice(pool.findIndex(p => p === request), 1);
    }
  }
  
  await Promise.all(pool);
  return results;
}

// 使用
const results = await concurrentRequests(urls, 3);
```

**带重试机制的版本：**
```javascript
class RequestQueue {
  constructor(maxConcurrent = 3, maxRetries = 3) {
    this.maxConcurrent = maxConcurrent;
    this.maxRetries = maxRetries;
    this.currentCount = 0;
    this.queue = [];
  }
  
  async request(fn, retries = 0) {
    if (this.currentCount >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.currentCount++;
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      // 重试
      if (retries < this.maxRetries) {
        console.log(`重试 ${retries + 1}/${this.maxRetries}`);
        return this.request(fn, retries + 1);
      }
      throw error;
    } finally {
      this.currentCount--;
      
      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve();
      }
    }
  }
}

// 使用
const queue = new RequestQueue(3, 3);

urls.forEach(url => {
  queue.request(() => fetch(url).then(r => r.json()))
    .then(data => console.log('成功:', data))
    .catch(err => console.error('失败:', err));
});
```

**实际应用：批量上传文件**
```javascript
class FileUploader {
  constructor(maxConcurrent = 3) {
    this.queue = new RequestQueue(maxConcurrent);
  }
  
  async uploadFiles(files) {
    const promises = files.map(file => 
      this.queue.request(() => this.uploadFile(file))
    );
    
    return Promise.allSettled(promises);
  }
  
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      throw new Error(`上传失败: ${file.name}`);
    }
    
    return res.json();
  }
}

// 使用
const uploader = new FileUploader(3);
const files = document.querySelector('input[type="file"]').files;

uploader.uploadFiles(Array.from(files))
  .then(results => {
    const succeeded = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');
    console.log(`成功: ${succeeded.length}, 失败: ${failed.length}`);
  });
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** IntersectionObserver

### 题目

`IntersectionObserver` 可以用于哪些场景？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**IntersectionObserver 应用场景**

**1. 图片懒加载**
```javascript
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      imageObserver.unobserve(img);
    }
  });
}, {
  rootMargin: '50px'  // 提前 50px 加载
});

// 观察所有图片
document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});

// HTML
<img data-src="image.jpg" alt="懒加载图片">
```

**2. 无限滚动**
```javascript
const sentinel = document.querySelector('.sentinel');

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMoreData();
    }
  });
});

scrollObserver.observe(sentinel);

async function loadMoreData() {
  const data = await fetch('/api/more').then(r => r.json());
  renderData(data);
}

// HTML
<div class="list">
  <!-- 列表项 -->
  <div class="sentinel"></div>  <!-- 哨兵元素 -->
</div>
```

**3. 曝光统计**
```javascript
const exposureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;
      const id = element.dataset.id;
      
      // 统计曝光
      trackExposure(id);
      
      // 只统计一次
      exposureObserver.unobserve(element);
    }
  });
}, {
  threshold: 0.5  // 50% 可见时触发
});

document.querySelectorAll('[data-track]').forEach(el => {
  exposureObserver.observe(el);
});
```

**4. 动画触发**
```javascript
const animateObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    } else {
      entry.target.classList.remove('animate-in');
    }
  });
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  animateObserver.observe(el);
});

// CSS
.animate-on-scroll {
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.6s;
}

.animate-in {
  opacity: 1;
  transform: translateY(0);
}
```

**5. 吸顶导航**
```javascript
const nav = document.querySelector('nav');
const sentinel = document.querySelector('.nav-sentinel');

const stickyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      nav.classList.add('sticky');
    } else {
      nav.classList.remove('sticky');
    }
  });
}, {
  threshold: 0
});

stickyObserver.observe(sentinel);

// HTML
<div class="nav-sentinel"></div>
<nav>导航栏</nav>
```

**配置选项：**
```javascript
const observer = new IntersectionObserver(callback, {
  // root：根元素（默认视口）
  root: document.querySelector('.container'),
  
  // rootMargin：根元素的边距
  rootMargin: '10px 20px 30px 40px',
  
  // threshold：触发回调的交叉比例
  threshold: [0, 0.25, 0.5, 0.75, 1]
});
```

**回调参数：**
```javascript
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    // 是否相交
    console.log(entry.isIntersecting);
    
    // 交叉比例
    console.log(entry.intersectionRatio);
    
    // 目标元素
    console.log(entry.target);
    
    // 时间戳
    console.log(entry.time);
    
    // 各种矩形信息
    console.log(entry.boundingClientRect);     // 目标元素的矩形
    console.log(entry.intersectionRect);       // 交叉区域的矩形
    console.log(entry.rootBounds);             // 根元素的矩形
  });
});
```

**性能优势：**
```javascript
// ❌ 传统滚动监听（性能差）
window.addEventListener('scroll', () => {
  const rect = element.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    loadImage();
  }
});

// ✅ IntersectionObserver（性能好）
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadImage();
    }
  });
});
observer.observe(element);
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** Service Worker

### 题目

Service Worker 的主要用途是什么？如何注册 Service Worker？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Service Worker 用途**

**1. 离线缓存（PWA）**
**2. 推送通知**
**3. 后台同步**
**4. 网络代理**

**注册 Service Worker：**
```javascript
// main.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('注册成功:', registration.scope);
      
      // 检查更新
      registration.update();
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('发现新版本');
      });
    })
    .catch(error => {
      console.error('注册失败:', error);
    });
}
```

**Service Worker 文件：**
```javascript
// sw.js
const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

// 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
  
  // 立即激活
  self.skipWaiting();
});

// 激活
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 删除旧缓存
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 立即控制所有页面
  self.clients.claim();
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中
        if (response) {
          return response;
        }
        
        // 网络请求
        return fetch(event.request)
          .then(response => {
            // 检查是否是有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应（Response 只能使用一次）
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});
```

**缓存策略：**

**1. Cache First（缓存优先）**
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

**2. Network First（网络优先）**
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
```

**3. Stale While Revalidate（缓存 + 更新）**
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});
```

**推送通知：**
```javascript
// 订阅推送
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'PUBLIC_KEY'
  })
    .then(subscription => {
      console.log('订阅成功:', subscription);
    });
});

// Service Worker 接收推送
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/badge.png'
    })
  );
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
```

**与页面通信：**
```javascript
// main.js
navigator.serviceWorker.controller.postMessage({
  type: 'MSG_TYPE',
  data: 'hello'
});

navigator.serviceWorker.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
});

// sw.js
self.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
  
  // 回复
  event.ports[0].postMessage('收到');
});
```

</details>

---

**本章总结：**
- ✅ localStorage vs sessionStorage
- ✅ window 对象方法
- ✅ Cookie 操作
- ✅ location 对象
- ✅ history API
- ✅ Fetch API 错误处理
- ✅ navigator 对象
- ✅ 并发请求控制
- ✅ IntersectionObserver
- ✅ Service Worker

**下一章：** [第 12 章：模块化与包管理](./chapter-12.md)
