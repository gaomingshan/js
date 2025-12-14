# 本地存储方案

## 概述

浏览器提供多种本地存储机制，用于在客户端保存数据。它们的核心差异在于：

- 生命周期：临时/持久
- 容量：KB/MB/百MB+
- 是否随请求自动发送到服务器
- 同步/异步 API（是否可能阻塞主线程）
- 安全属性（是否可被 JS 读取、是否可防 CSRF）

常见方案：

- `localStorage`：持久化、同步、字符串键值
- `sessionStorage`：会话级、同步、字符串键值
- Cookie：容量小、会随请求发送、可配置安全属性
- IndexedDB：大容量、异步、事务型数据库

---

## 一、localStorage

### 1.1 基本使用

```js
// 写入
localStorage.setItem('name', 'Alice');

// 读取
const name = localStorage.getItem('name');

// 删除
localStorage.removeItem('name');

// 清空
localStorage.clear();

// 元信息
localStorage.length;
localStorage.key(0);
```

### 1.2 存对象：序列化与反序列化

`localStorage` 只存字符串：

```js
const user = { name: 'Alice', age: 25 };
localStorage.setItem('user', JSON.stringify(user));

const stored = JSON.parse(localStorage.getItem('user'));
```

### 1.3 特性与限制

- **持久化**：默认永久保存（除非用户清理）
- **同源隔离**：协议/域名/端口一致才共享
- **容量**：通常 5-10MB（视浏览器而定）
- **同步 API**：可能阻塞主线程（不要频繁、大量写入）

---

## 二、sessionStorage

### 2.1 API 与 localStorage 相同

```js
sessionStorage.setItem('temp', 'value');
const v = sessionStorage.getItem('temp');
sessionStorage.removeItem('temp');
sessionStorage.clear();
```

### 2.2 特性

- **会话级**：标签页关闭即清除
- **同源 + 同标签页**：同源下不同标签页数据互不影响
- **同步 API**：同样可能阻塞

---

## 三、Cookie

### 3.1 读写 Cookie

```js
// 写入
document.cookie = 'name=Alice';
document.cookie = 'age=25; max-age=3600';

// 读取（返回 "k=v; k2=v2"）
console.log(document.cookie);
```

解析 Cookie（示意）：

```js
function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
```

### 3.2 常用属性（安全相关高频）

```js
document.cookie =
  'token=abc; ' +
  'max-age=3600; ' +
  'path=/; ' +
  'secure; ' +
  'samesite=strict';
```

- `max-age` / `expires`：过期策略
- `path` / `domain`：作用域
- `secure`：仅 HTTPS
- `samesite`：降低 CSRF 风险（`lax/strict/none`）
- `HttpOnly`：**只能由服务端设置**，JS 无法读取（降低 XSS 风险）

### 3.3 特性

- **容量小**：单个约 4KB；每域名数量也有限
- **自动发送**：每次请求会带上（有性能成本）
- **安全属性丰富**：更适合与认证/会话相关的需求（配合 HttpOnly/SameSite/Secure）

---

## 四、IndexedDB

### 4.1 适用场景

IndexedDB 是浏览器内置的客户端数据库：

- **大容量**（通常远大于 localStorage）
- **异步**（不阻塞主线程）
- **事务**（更可靠的数据一致性）
- 支持索引与结构化数据

### 4.2 基本流程（最小示意）

```js
const req = indexedDB.open('myDB', 1);

req.onupgradeneeded = (e) => {
  const db = e.target.result;
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('name', 'name', { unique: false });
};

req.onsuccess = (e) => {
  const db = e.target.result;

  const tx = db.transaction('users', 'readwrite');
  const store = tx.objectStore('users');

  store.add({ id: 1, name: 'Alice', age: 25 });

  const getReq = store.get(1);
  getReq.onsuccess = () => {
    console.log(getReq.result);
  };
};
```

> **工程建议**
>
> IndexedDB API 较繁琐，真实项目中常用封装库（例如 idb）简化。

---

## 五、存储方案对比（速查）

| 方案 | 容量 | 生命周期 | 是否自动随请求发送 | API | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| Cookie | KB 级 | 可配置 | 是 | 同步 | 会话/认证、少量数据 |
| localStorage | MB 级 | 持久 | 否 | 同步 | 轻量持久化配置、缓存 |
| sessionStorage | MB 级 | 会话 | 否 | 同步 | 临时状态、一次性流程 |
| IndexedDB | 百MB+ | 持久 | 否 | 异步 | 大量结构化数据、离线 |

---

## 六、storage 事件（跨标签页同步）

```js
window.addEventListener('storage', (e) => {
  console.log('key:', e.key);
  console.log('oldValue:', e.oldValue);
  console.log('newValue:', e.newValue);
  console.log('url:', e.url);
});
```

> **关键点**
>
> `storage` 事件只会在“其他标签页”触发；当前写入的标签页不会触发。

---

## 七、实用封装（示意）

### 7.1 带过期时间的 localStorage

```js
const storage = {
  set(key, value, expire = null) {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    };
    localStorage.setItem(key, JSON.stringify(data));
  },

  get(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (data.expire && Date.now() > data.expire) {
      this.remove(key);
      return null;
    }
    return data.value;
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};
```

### 7.2 Cookie 工具（示意）

```js
const cookie = {
  set(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  },

  get(name) {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  },

  remove(name) {
    this.set(name, '', -1);
  }
};
```

---

## 八、最佳实践

1. **敏感数据不要放在 localStorage/sessionStorage**：它们可被 JS 直接读取，XSS 风险很高。
2. **能用 HttpOnly Cookie 就别用 localStorage 存 token**：认证优先考虑更安全的会话方案。
3. **控制写入频率与数据量**：同步存储会阻塞主线程。
4. **加命名空间前缀**：避免 key 冲突（例如 `app:user`）。
5. **处理异常**：隐私模式/配额超限可能导致写入失败。

---

## 参考资料

- [HTML Standard - Web Storage](https://html.spec.whatwg.org/#webstorage)
- [MDN - Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API)
- [MDN - IndexedDB API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
