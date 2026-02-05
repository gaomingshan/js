# async/await

> 掌握最优雅的异步编程方式

---

## 概述

async/await 是基于 Promise 的语法糖，让异步代码看起来像同步代码，极大提升了代码的可读性和可维护性。

本章将深入：
- async 函数的特性
- await 表达式的使用
- 错误处理
- 并发控制
- 与 Promise 的关系
- 实际应用场景

---

## 1. async 函数

### 1.1 基本语法

```javascript
// async 函数声明
async function fetchData() {
  return "Hello";
}

// async 函数表达式
const fetchData = async function() {
  return "Hello";
};

// async 箭头函数
const fetchData = async () => {
  return "Hello";
};

// async 方法
const obj = {
  async fetchData() {
    return "Hello";
  }
};

// Class 中的 async 方法
class API {
  async fetchData() {
    return "Hello";
  }
}
```

### 1.2 async 函数的特性

```javascript
// 1. 总是返回 Promise
async function test() {
  return "Hello";
}

const result = test();
console.log(result);  // Promise { 'Hello' }

result.then(value => console.log(value));  // "Hello"

// 2. 返回 Promise 会被解包
async function test() {
  return Promise.resolve("Hello");
}

test().then(value => console.log(value));  // "Hello"（而非 Promise）

// 3. 抛出错误会返回 rejected Promise
async function test() {
  throw new Error("Something wrong");
}

test().catch(error => console.error(error.message));  // "Something wrong"

// 4. 返回 undefined
async function test() {
  // 没有 return
}

test().then(value => console.log(value));  // undefined
```

---

## 2. await 表达式

### 2.1 基本用法

```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log("开始");
  
  await delay(1000);  // 等待 1 秒
  console.log("1 秒后");
  
  await delay(1000);  // 再等待 1 秒
  console.log("2 秒后");
}

demo();
// 输出：
// 开始
// （1秒后）1 秒后
// （再过1秒）2 秒后
```

### 2.2 await 的特性

```javascript
// 1. await 只能在 async 函数中使用
function test() {
  await Promise.resolve();  // ❌ SyntaxError
}

async function test() {
  await Promise.resolve();  // ✅
}

// 2. await 暂停函数执行
async function demo() {
  console.log("1");
  await delay(1000);
  console.log("2");  // 1秒后执行
}

// 3. await 等待 Promise resolve
async function demo() {
  const result = await Promise.resolve("Hello");
  console.log(result);  // "Hello"
}

// 4. await 非 Promise 值会被转为 resolved Promise
async function demo() {
  const result = await "Hello";  // 等价于 await Promise.resolve("Hello")
  console.log(result);  // "Hello"
}

// 5. await 可以等待 thenable 对象
async function demo() {
  const thenable = {
    then(resolve) {
      setTimeout(() => resolve("Hello"), 1000);
    }
  };
  
  const result = await thenable;
  console.log(result);  // "Hello"
}
```

### 2.3 顶层 await（ES2022）

```javascript
// 模块顶层可以使用 await（ESM）
// data.js
export const data = await fetch('/api/data').then(r => r.json());

// main.js
import { data } from './data.js';
console.log(data);

// 注意：只在 ES 模块中可用
// package.json 需要 "type": "module"
// 或文件扩展名为 .mjs
```

---

## 3. async/await vs Promise

### 3.1 代码对比

```javascript
// Promise 链
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/teams/${user.teamId}`);
    })
    .then(response => response.json())
    .then(team => {
      return fetch(`/api/projects/${team.id}`);
    })
    .then(response => response.json())
    .then(projects => {
      return { user, team, projects };  // ❌ user 不在作用域内
    });
}

// async/await
async function fetchUserData(userId) {
  const userResponse = await fetch(`/api/users/${userId}`);
  const user = await userResponse.json();
  
  const teamResponse = await fetch(`/api/teams/${user.teamId}`);
  const team = await teamResponse.json();
  
  const projectsResponse = await fetch(`/api/projects/${team.id}`);
  const projects = await projectsResponse.json();
  
  return { user, team, projects };  // ✅ 所有变量都在作用域内
}
```

### 3.2 何时使用 async/await

```javascript
// ✅ 适合 async/await：顺序操作
async function processData() {
  const data = await fetchData();
  const processed = await processData(data);
  const saved = await saveData(processed);
  return saved;
}

// ✅ 适合 Promise.all：并行操作
async function fetchAllData() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  
  return { users, posts, comments };
}

// ❌ 不必要的顺序（性能差）
async function fetchAllData() {
  const users = await fetch('/api/users').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());     // 等待 users 完成
  const comments = await fetch('/api/comments').then(r => r.json()); // 等待 posts 完成
  
  return { users, posts, comments };
}
```

---

## 4. 错误处理

### 4.1 try-catch

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("获取数据失败:", error);
    throw error;  // 重新抛出或处理
  }
}

// 使用
fetchData()
  .then(data => console.log(data))
  .catch(error => console.error("最终错误:", error));
```

### 4.2 多个 await 的错误处理

```javascript
async function processUser(userId) {
  try {
    const user = await fetchUser(userId);
    const team = await fetchTeam(user.teamId);
    const projects = await fetchProjects(team.id);
    
    return { user, team, projects };
  } catch (error) {
    // 任何一步出错都会被捕获
    console.error("处理用户数据失败:", error);
    throw error;
  }
}

// 分步错误处理
async function processUser(userId) {
  let user, team, projects;
  
  try {
    user = await fetchUser(userId);
  } catch (error) {
    console.error("获取用户失败:", error);
    throw new Error(`无法找到用户 ${userId}`);
  }
  
  try {
    team = await fetchTeam(user.teamId);
  } catch (error) {
    console.error("获取团队失败:", error);
    team = getDefaultTeam();  // 使用默认值
  }
  
  try {
    projects = await fetchProjects(team.id);
  } catch (error) {
    console.error("获取项目失败:", error);
    projects = [];  // 使用空数组
  }
  
  return { user, team, projects };
}
```

### 4.3 错误恢复

```javascript
async function fetchDataWithFallback() {
  try {
    return await fetch('/api/primary').then(r => r.json());
  } catch (error) {
    console.warn("主数据源失败，尝试备用:", error);
    
    try {
      return await fetch('/api/backup').then(r => r.json());
    } catch (backupError) {
      console.error("备用数据源也失败:", backupError);
      return getDefaultData();  // 使用默认数据
    }
  }
}
```

### 4.4 finally 清理

```javascript
async function processFile(filename) {
  let file;
  
  try {
    file = await openFile(filename);
    const content = await readFile(file);
    const processed = await processContent(content);
    await saveResult(processed);
  } catch (error) {
    console.error("处理文件失败:", error);
    throw error;
  } finally {
    // 无论成功或失败都关闭文件
    if (file) {
      await closeFile(file);
    }
  }
}
```

---

## 5. 并发控制

### 5.1 并行执行

```javascript
// ❌ 顺序执行（慢）
async function fetchAll() {
  const user = await fetchUser();      // 等待 1 秒
  const posts = await fetchPosts();    // 等待 1 秒
  const comments = await fetchComments(); // 等待 1 秒
  // 总共 3 秒
  
  return { user, posts, comments };
}

// ✅ 并行执行（快）
async function fetchAll() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  // 总共 1 秒（并行）
  
  return { user, posts, comments };
}

// 或者
async function fetchAll() {
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  const commentsPromise = fetchComments();
  
  const user = await userPromise;
  const posts = await postsPromise;
  const comments = await commentsPromise;
  
  return { user, posts, comments };
}
```

### 5.2 顺序与并行的选择

```javascript
// 有依赖：必须顺序
async function processOrder(orderId) {
  const order = await fetchOrder(orderId);        // 必须先获取订单
  const user = await fetchUser(order.userId);     // 再获取用户（依赖订单）
  const products = await fetchProducts(order.items); // 再获取产品（依赖订单）
  
  return { order, user, products };
}

// 无依赖：可以并行
async function fetchDashboardData(userId) {
  const [user, stats, notifications] = await Promise.all([
    fetchUser(userId),
    fetchStats(userId),
    fetchNotifications(userId)
  ]);
  
  return { user, stats, notifications };
}

// 部分依赖：混合
async function processOrder(orderId) {
  // 第一步：获取订单
  const order = await fetchOrder(orderId);
  
  // 第二步：并行获取用户和产品（都依赖订单）
  const [user, products] = await Promise.all([
    fetchUser(order.userId),
    fetchProducts(order.items)
  ]);
  
  return { order, user, products };
}
```

### 5.3 限制并发数

```javascript
async function processInBatches(items, batchSize, processFn) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processFn(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}

// 使用
const urls = [/* 100 个 URL */];

const data = await processInBatches(urls, 10, async (url) => {
  const response = await fetch(url);
  return response.json();
});
// 每次处理 10 个，避免并发过高
```

### 5.4 竞速与超时

```javascript
// 超时控制
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    throw error;
  }
}

// Promise.race 实现超时
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('超时')), ms);
  });
}

async function fetchWithTimeout(url, ms) {
  return Promise.race([
    fetch(url).then(r => r.json()),
    timeout(ms)
  ]);
}

// 使用
try {
  const data = await fetchWithTimeout('/api/data', 3000);
  console.log(data);
} catch (error) {
  console.error('获取数据失败:', error.message);
}
```

---

## 6. 循环中的 async/await

### 6.1 for 循环（顺序）

```javascript
async function processItems(items) {
  const results = [];
  
  for (const item of items) {
    const result = await processItem(item);  // 顺序执行
    results.push(result);
  }
  
  return results;
}

// 使用
const items = [1, 2, 3, 4, 5];
const results = await processItems(items);
// 每个 item 依次处理，总时间 = 单个时间 × 数量
```

### 6.2 map + Promise.all（并行）

```javascript
async function processItems(items) {
  const promises = items.map(item => processItem(item));
  return Promise.all(promises);
}

// 使用
const items = [1, 2, 3, 4, 5];
const results = await processItems(items);
// 所有 item 并行处理，总时间 = 单个时间
```

### 6.3 forEach 的陷阱

```javascript
// ❌ forEach 不会等待
async function processItems(items) {
  items.forEach(async (item) => {
    await processItem(item);
  });
  console.log("完成");  // 立即执行，不会等待
}

// ✅ 使用 for...of
async function processItems(items) {
  for (const item of items) {
    await processItem(item);
  }
  console.log("完成");  // 等待所有处理完成
}

// ✅ 使用 map + Promise.all
async function processItems(items) {
  await Promise.all(items.map(item => processItem(item)));
  console.log("完成");  // 等待所有处理完成
}
```

### 6.4 reduce 实现顺序执行

```javascript
async function processItemsInSequence(items) {
  return items.reduce(async (prevPromise, item) => {
    await prevPromise;  // 等待前一个完成
    return processItem(item);
  }, Promise.resolve());
}

// 或者带结果收集
async function processItemsInSequence(items) {
  return items.reduce(async (prevPromise, item) => {
    const results = await prevPromise;
    const result = await processItem(item);
    return [...results, result];
  }, Promise.resolve([]));
}
```

---

## 7. 实际应用场景

### 7.1 API 请求

```javascript
class API {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API 请求失败:', error);
      throw error;
    }
  }
  
  async get(endpoint) {
    return this.request(endpoint);
  }
  
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// 使用
const api = new API('https://api.example.com');

async function getUserData(userId) {
  const user = await api.get(`/users/${userId}`);
  const posts = await api.get(`/users/${userId}/posts`);
  return { user, posts };
}
```

### 7.2 数据加载器

```javascript
class DataLoader {
  constructor() {
    this.cache = new Map();
  }
  
  async load(key, fetchFn) {
    // 检查缓存
    if (this.cache.has(key)) {
      console.log(`从缓存返回: ${key}`);
      return this.cache.get(key);
    }
    
    // 加载数据
    console.log(`加载数据: ${key}`);
    const data = await fetchFn(key);
    
    // 存入缓存
    this.cache.set(key, data);
    
    return data;
  }
  
  async loadMany(keys, fetchFn) {
    return Promise.all(keys.map(key => this.load(key, fetchFn)));
  }
  
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// 使用
const loader = new DataLoader();

async function getUser(id) {
  return loader.load(`user:${id}`, async (key) => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  });
}

const user1 = await getUser(1);  // 从 API 加载
const user2 = await getUser(1);  // 从缓存返回
```

### 7.3 重试机制

```javascript
async function retry(fn, options = {}) {
  const {
    times = 3,
    delay = 1000,
    onRetry = () => {}
  } = options;
  
  let lastError;
  
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < times - 1) {
        onRetry(error, i + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// 使用
async function fetchData() {
  return retry(
    () => fetch('/api/data').then(r => r.json()),
    {
      times: 3,
      delay: 1000,
      onRetry: (error, attempt) => {
        console.log(`重试第 ${attempt} 次:`, error.message);
      }
    }
  );
}
```

### 7.4 轮询

```javascript
async function poll(fn, options = {}) {
  const {
    interval = 1000,
    maxAttempts = 10,
    validate = () => true
  } = options;
  
  for (let i = 0; i < maxAttempts; i++) {
    const result = await fn();
    
    if (validate(result)) {
      return result;
    }
    
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error('轮询超时');
}

// 使用
async function waitForJobCompletion(jobId) {
  return poll(
    () => fetch(`/api/jobs/${jobId}`).then(r => r.json()),
    {
      interval: 2000,
      maxAttempts: 30,
      validate: (job) => job.status === 'completed'
    }
  );
}

const job = await waitForJobCompletion('job-123');
console.log('任务完成:', job);
```

---

## 8. 性能优化

### 8.1 避免不必要的 await

```javascript
// ❌ 不必要的 await
async function getData() {
  return await fetch('/api/data').then(r => r.json());
}

// ✅ 直接返回 Promise
async function getData() {
  return fetch('/api/data').then(r => r.json());
}

// 或者
function getData() {
  return fetch('/api/data').then(r => r.json());
}
```

### 8.2 并行优化

```javascript
// ❌ 顺序执行（3秒）
async function loadPage() {
  const header = await loadHeader();   // 1秒
  const sidebar = await loadSidebar(); // 1秒
  const content = await loadContent(); // 1秒
  
  return { header, sidebar, content };
}

// ✅ 并行执行（1秒）
async function loadPage() {
  const [header, sidebar, content] = await Promise.all([
    loadHeader(),
    loadSidebar(),
    loadContent()
  ]);
  
  return { header, sidebar, content };
}
```

### 8.3 提前启动 Promise

```javascript
// ❌ 延迟启动
async function process() {
  const data1 = await fetchData1();
  const data2 = await fetchData2();  // fetchData2 在 fetchData1 完成后才开始
  
  return combineData(data1, data2);
}

// ✅ 提前启动
async function process() {
  const promise1 = fetchData1();  // 立即开始
  const promise2 = fetchData2();  // 立即开始
  
  const data1 = await promise1;
  const data2 = await promise2;
  
  return combineData(data1, data2);
}
```

---

## 9. 调试技巧

### 9.1 async 函数的调试

```javascript
// 使用 debugger
async function fetchData() {
  debugger;  // 暂停
  
  const response = await fetch('/api/data');
  debugger;  // 再次暂停
  
  const data = await response.json();
  return data;
}

// 使用 console.log 追踪
async function processData() {
  console.log('开始处理');
  
  const data = await fetchData();
  console.log('获取数据:', data);
  
  const processed = await processStep(data);
  console.log('处理完成:', processed);
  
  return processed;
}
```

### 9.2 Promise 状态检查

```javascript
async function checkPromiseState() {
  const promise = fetch('/api/data');
  
  console.log('Promise 创建');
  
  const result = await promise;
  
  console.log('Promise 完成');
  
  return result;
}
```

---

## 关键要点

1. **async/await 基础**
   - async 函数总是返回 Promise
   - await 暂停函数执行
   - 只能在 async 函数中使用 await

2. **错误处理**
   - 使用 try-catch
   - 错误会传播
   - finally 用于清理

3. **并发控制**
   - Promise.all 并行执行
   - 避免不必要的顺序执行
   - 控制并发数量

4. **循环处理**
   - for...of 顺序执行
   - map + Promise.all 并行执行
   - 避免在 forEach 中使用 await

5. **性能优化**
   - 避免不必要的 await
   - 提前启动 Promise
   - 合理使用并行

---

## 深入一点

### async/await 的转换

```javascript
// async/await 代码
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}

// 大致等价于
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => data);
}
```

### Generator 实现 async/await

```javascript
// async/await 是 Generator + Promise 的语法糖
function* fetchDataGenerator() {
  const response = yield fetch('/api/data');
  const data = yield response.json();
  return data;
}

// 执行器
function async(generatorFn) {
  return function(...args) {
    const generator = generatorFn(...args);
    
    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let result;
        try {
          result = generator[key](arg);
        } catch (error) {
          return reject(error);
        }
        
        const { value, done } = result;
        
        if (done) {
          return resolve(value);
        }
        
        return Promise.resolve(value).then(
          val => step('next', val),
          err => step('throw', err)
        );
      }
      
      step('next');
    });
  };
}

// 使用
const fetchData = async(fetchDataGenerator);
```

---

## 参考资料

- [MDN: async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await)
- [Async/Await Best Practices](https://blog.bitsrc.io/javascript-async-await-best-practices-d5bb28f6c0cf)

---

**上一章**：[Promise 基础](./content-19.md)  
**下一章**：[事件循环机制](./content-21.md)
