# 第 9 章：异步编程 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 回调函数

### 题目

以下关于回调函数的说法，哪个是错误的？

**选项：**
- A. 回调函数是作为参数传递给另一个函数的函数
- B. 回调地狱（Callback Hell）是指嵌套过深的回调导致代码难以维护
- C. 所有回调函数都是异步执行的
- D. 回调函数可以是匿名函数或具名函数

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**C 错误：不是所有回调都是异步的**

```javascript
// 同步回调
const arr = [1, 2, 3];
arr.forEach(item => {
  console.log(item);  // 同步执行
});
console.log('done');
// 输出：1, 2, 3, done

// 异步回调
setTimeout(() => {
  console.log('timeout');  // 异步执行
}, 0);
console.log('done');
// 输出：done, timeout
```

**回调函数分类：**

**1. 同步回调**
```javascript
// 数组方法
[1, 2, 3].map(x => x * 2);
[1, 2, 3].filter(x => x > 1);
[1, 2, 3].reduce((sum, x) => sum + x, 0);

// 立即执行
function process(callback) {
  callback();  // 立即调用
}
process(() => console.log('sync'));
```

**2. 异步回调**
```javascript
// 定时器
setTimeout(() => console.log('async'), 1000);

// 事件监听
button.addEventListener('click', () => {
  console.log('clicked');
});

// 网络请求
fetch('/api').then(res => res.json());
```

**回调地狱示例：**
```javascript
// ❌ 回调地狱
getUserInfo(userId, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0].id, (details) => {
      getPaymentInfo(details.paymentId, (payment) => {
        console.log(payment);
      });
    });
  });
});

// ✅ Promise 解决
getUserInfo(userId)
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => getPaymentInfo(details.paymentId))
  .then(payment => console.log(payment));
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Promise 状态

### 题目

Promise 有几种状态？

**选项：**
- A. 2 种：pending 和 resolved
- B. 3 种：pending、fulfilled 和 rejected
- C. 3 种：pending、resolved 和 rejected
- D. 4 种：pending、fulfilled、rejected 和 settled

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Promise 的三种状态**

```javascript
// 1. pending（进行中）
const p1 = new Promise((resolve, reject) => {
  // 尚未 resolve 或 reject
});

// 2. fulfilled（已成功）
const p2 = new Promise((resolve, reject) => {
  resolve('success');
});

// 3. rejected（已失败）
const p3 = new Promise((resolve, reject) => {
  reject('error');
});
```

**状态转换规则：**
- 初始状态：`pending`
- 成功：`pending` → `fulfilled`
- 失败：`pending` → `rejected`
- **状态一旦改变，就不会再变**

```javascript
const promise = new Promise((resolve, reject) => {
  resolve('first');
  resolve('second');  // 无效
  reject('error');    // 无效
});

promise.then(value => {
  console.log(value);  // "first"（只执行第一次）
});
```

**术语说明：**
- `resolved`：通常指 `fulfilled`，但有时泛指已确定状态（fulfilled 或 rejected）
- `settled`：非标准术语，表示 Promise 已确定（fulfilled 或 rejected）

**检查 Promise 状态：**
```javascript
// Promise 没有直接获取状态的 API
// 但可以通过技巧检测
function getPromiseState(promise) {
  const pending = Symbol('pending');
  return Promise.race([promise, Promise.resolve(pending)])
    .then(
      value => value === pending ? 'pending' : 'fulfilled',
      () => 'rejected'
    );
}

const p = Promise.resolve(42);
getPromiseState(p).then(state => console.log(state));  // "fulfilled"
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** async/await

### 题目

`async` 函数总是返回一个 Promise。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**async 函数总是返回 Promise**

```javascript
// 返回普通值
async function foo() {
  return 42;
}
console.log(foo());  // Promise { 42 }
foo().then(value => console.log(value));  // 42

// 返回 Promise
async function bar() {
  return Promise.resolve(100);
}
bar().then(value => console.log(value));  // 100（不会嵌套）

// 抛出错误
async function baz() {
  throw new Error('error');
}
baz().catch(err => console.log(err.message));  // "error"

// 没有返回值
async function qux() {
  console.log('no return');
}
qux().then(value => console.log(value));  // undefined
```

**async/await 等价写法：**
```javascript
// async 函数
async function getData() {
  return 42;
}

// 等价于
function getData() {
  return Promise.resolve(42);
}

// await 等价于 then
async function process() {
  const result = await getData();
  console.log(result);
}

// 等价于
function process() {
  return getData().then(result => {
    console.log(result);
  });
}
```

**注意事项：**
```javascript
// ❌ 返回 Promise 不会嵌套
async function test() {
  return Promise.resolve(Promise.resolve(42));
}
test().then(value => {
  console.log(value);  // 42（不是 Promise）
});

// ✅ async 函数自动展开一层 Promise
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** 事件循环

### 题目

以下代码的输出顺序是什么？

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');
```

**选项：**
- A. 1, 2, 3, 4
- B. 1, 4, 2, 3
- C. 1, 4, 3, 2
- D. 1, 3, 4, 2

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**事件循环执行顺序**

```javascript
console.log('1');  // 同步，立即执行

setTimeout(() => {
  console.log('2');  // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3');  // 微任务
});

console.log('4');  // 同步，立即执行

// 输出：1, 4, 3, 2
```

**执行流程：**

**1. 同步代码**
- 执行 `console.log('1')`  → 输出 `1`
- 注册 `setTimeout` 宏任务
- 注册 `Promise.then` 微任务
- 执行 `console.log('4')`  → 输出 `4`

**2. 微任务队列**
- 执行 Promise 的 then 回调  → 输出 `3`

**3. 宏任务队列**
- 执行 setTimeout 回调  → 输出 `2`

**宏任务 vs 微任务：**

| 类型 | 示例 |
|------|------|
| 宏任务 | setTimeout, setInterval, setImmediate, I/O, UI 渲染 |
| 微任务 | Promise.then, MutationObserver, queueMicrotask |

**执行规则：**
```
1. 执行同步代码
2. 执行所有微任务
3. 执行一个宏任务
4. 执行所有微任务
5. 重复 3-4
```

**更复杂的例子：**
```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => {
    console.log('5');
  }, 0);
});

console.log('6');

// 输出：1, 6, 4, 2, 3, 5
```

**执行分析：**
1. 同步：`1`, `6`
2. 微任务：`4`（注册 setTimeout-5）
3. 宏任务：`2`（注册微任务-3）
4. 微任务：`3`
5. 宏任务：`5`

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** Promise 链式调用

### 题目

以下代码的输出是什么？

```javascript
Promise.resolve(1)
  .then(x => x + 1)
  .then(x => { x + 1; })
  .then(x => console.log(x));
```

**选项：**
- A. 3
- B. 2
- C. undefined
- D. 报错

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**Promise 链式调用的返回值**

```javascript
Promise.resolve(1)
  .then(x => x + 1)              // 返回 2
  .then(x => { x + 1; })         // 没有 return，返回 undefined
  .then(x => console.log(x));    // undefined
```

**关键点：**
- 箭头函数如果有 `{}`，必须显式 `return`
- 没有 return 语句，默认返回 `undefined`

**常见错误：**
```javascript
// ❌ 忘记 return
Promise.resolve(1)
  .then(x => {
    x + 1;  // 没有 return
  })
  .then(x => console.log(x));  // undefined

// ✅ 显式 return
Promise.resolve(1)
  .then(x => {
    return x + 1;
  })
  .then(x => console.log(x));  // 2

// ✅ 隐式 return（无花括号）
Promise.resolve(1)
  .then(x => x + 1)
  .then(x => console.log(x));  // 2
```

**Promise 链式调用规则：**

**1. 返回普通值**
```javascript
Promise.resolve(1)
  .then(x => x + 1)     // 返回 2
  .then(x => x * 2)     // 返回 4
  .then(x => console.log(x));  // 4
```

**2. 返回 Promise**
```javascript
Promise.resolve(1)
  .then(x => Promise.resolve(x + 1))  // 返回 Promise
  .then(x => console.log(x));         // 2（自动展开）
```

**3. 抛出错误**
```javascript
Promise.resolve(1)
  .then(x => {
    throw new Error('error');
  })
  .catch(err => console.log(err.message));  // "error"
```

**4. 没有返回值**
```javascript
Promise.resolve(1)
  .then(x => {
    console.log(x);  // 1
    // 没有 return
  })
  .then(x => console.log(x));  // undefined
```

**链式调用的展开：**
```javascript
// 链式调用
Promise.resolve(1)
  .then(x => x + 1)
  .then(x => x * 2)
  .then(x => console.log(x));

// 等价于
const p1 = Promise.resolve(1);
const p2 = p1.then(x => x + 1);
const p3 = p2.then(x => x * 2);
const p4 = p3.then(x => console.log(x));
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** async/await 错误处理

### 题目

以下代码的输出是什么？

```javascript
async function test() {
  try {
    await Promise.reject('error');
    console.log('A');
  } catch (e) {
    console.log('B', e);
  }
  console.log('C');
}

test();
console.log('D');
```

**选项：**
- A. D, B error, C
- B. B error, C, D
- C. B error, D, C
- D. D, C, B error

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**async/await 错误处理**

```javascript
async function test() {
  try {
    await Promise.reject('error');  // 抛出错误
    console.log('A');               // 不执行
  } catch (e) {
    console.log('B', e);            // 捕获错误
  }
  console.log('C');                 // 继续执行
}

test();              // 异步执行
console.log('D');    // 同步执行

// 输出：D, B error, C
```

**执行流程：**
1. 调用 `test()`，返回 Promise（异步）
2. 执行同步代码 `console.log('D')`  → 输出 `D`
3. 微任务：执行 `test()` 内部
   - `await Promise.reject('error')` 抛出错误
   - `catch` 捕获  → 输出 `B error`
   - 继续执行  → 输出 `C`

**try/catch 与 Promise：**
```javascript
// ✅ 可以捕获 await 的错误
async function test1() {
  try {
    await Promise.reject('error');
  } catch (e) {
    console.log('caught:', e);  // caught: error
  }
}

// ❌ 无法捕获异步回调中的错误
async function test2() {
  try {
    setTimeout(() => {
      throw new Error('error');  // 无法捕获
    }, 0);
  } catch (e) {
    console.log('caught:', e);  // 不执行
  }
}

// ✅ 正确方式
async function test3() {
  try {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('error');
      }, 0);
    });
  } catch (e) {
    console.log('caught:', e);  // caught: error
  }
}
```

**错误处理最佳实践：**
```javascript
// 方式 1：try/catch
async function fetchData() {
  try {
    const res = await fetch('/api');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;  // 继续抛出
  }
}

// 方式 2：.catch()
async function fetchData() {
  const res = await fetch('/api').catch(err => {
    console.error('Fetch error:', err);
    throw err;
  });
  const data = await res.json().catch(err => {
    console.error('Parse error:', err);
    throw err;
  });
  return data;
}

// 方式 3：混合方式
async function fetchData() {
  try {
    const res = await fetch('/api');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;  // 返回默认值
  }
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** Promise 静态方法

### 题目

以下关于 Promise 静态方法的说法，哪些是正确的？

**选项：**
- A. `Promise.all()` 全部成功才成功，有一个失败就失败
- B. `Promise.race()` 返回最快完成的 Promise 结果（无论成功或失败）
- C. `Promise.allSettled()` 等待所有 Promise 完成，返回所有结果
- D. `Promise.any()` 有一个成功就成功，全部失败才失败

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**Promise 静态方法对比**

**A 正确：Promise.all()**
```javascript
// 全部成功才成功
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results);  // [1, 2, 3]
});

// 有一个失败就失败
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(err => {
  console.log(err);  // "error"（第一个失败的）
});
```

**B 正确：Promise.race()**
```javascript
// 返回最快完成的
Promise.race([
  new Promise(resolve => setTimeout(() => resolve(1), 100)),
  new Promise(resolve => setTimeout(() => resolve(2), 50)),
  new Promise(resolve => setTimeout(() => resolve(3), 150))
]).then(result => {
  console.log(result);  // 2（最快）
});

// 失败也算完成
Promise.race([
  new Promise((resolve, reject) => setTimeout(() => reject('error'), 50)),
  new Promise(resolve => setTimeout(() => resolve(1), 100))
]).catch(err => {
  console.log(err);  // "error"（最快）
});
```

**C 正确：Promise.allSettled()**
```javascript
// 等待所有 Promise 完成
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(results => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
```

**D 正确：Promise.any()**
```javascript
// 有一个成功就成功
Promise.any([
  Promise.reject('error1'),
  Promise.resolve(2),
  Promise.reject('error2')
]).then(result => {
  console.log(result);  // 2（第一个成功的）
});

// 全部失败才失败
Promise.any([
  Promise.reject('error1'),
  Promise.reject('error2'),
  Promise.reject('error3')
]).catch(err => {
  console.log(err);  // AggregateError: All promises were rejected
});
```

**方法对比表：**

| 方法 | 成功条件 | 失败条件 | 返回值 |
|------|----------|----------|--------|
| `all` | 全部成功 | 有一个失败 | 结果数组 |
| `allSettled` | 全部完成 | 不会失败 | 状态数组 |
| `race` | 第一个完成 | 第一个失败 | 单个结果 |
| `any` | 有一个成功 | 全部失败 | 单个结果 |

**实际应用：**
```javascript
// 并行请求多个接口
const fetchUserData = () => Promise.all([
  fetch('/api/user'),
  fetch('/api/orders'),
  fetch('/api/settings')
]).then(responses => Promise.all(responses.map(r => r.json())));

// 超时控制
const fetchWithTimeout = (url, timeout) => Promise.race([
  fetch(url),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), timeout)
  )
]);

// 批量操作（不中断）
const batchProcess = (items) => Promise.allSettled(
  items.map(item => processItem(item))
).then(results => {
  const succeeded = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  console.log(`成功: ${succeeded.length}, 失败: ${failed.length}`);
});

// 快速失败降级
const fetchWithFallback = (urls) => Promise.any(
  urls.map(url => fetch(url))
).catch(() => {
  return fetch('/fallback');
});
```

</details>

---

## 第 8 题 🔴

**类型：** 代码分析题  
**标签：** Promise 执行顺序

### 题目

以下代码的输出顺序是什么？

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');
```

**选项：**
- A. script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout
- B. script start, async1 start, async2, promise1, script end, promise2, async1 end, setTimeout
- C. script start, promise1, async1 start, async2, script end, async1 end, promise2, setTimeout
- D. script start, async1 start, promise1, async2, script end, async1 end, promise2, setTimeout

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**详细执行流程**

```javascript
// 1. 同步代码开始
console.log('script start');  // → script start

// 2. 注册宏任务
setTimeout(() => {
  console.log('setTimeout');
}, 0);

// 3. 调用 async1
async1();
  console.log('async1 start');  // → async1 start
  await async2();
    console.log('async2');      // → async2
  // await 后面的代码进入微任务队列

// 4. 创建 Promise
new Promise(resolve => {
  console.log('promise1');      // → promise1（同步）
  resolve();
}).then(() => {
  console.log('promise2');      // 进入微任务队列
});

// 5. 同步代码结束
console.log('script end');      // → script end

// 6. 执行微任务队列
// → async1 end
// → promise2

// 7. 执行宏任务队列
// → setTimeout

// 完整输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

**await 的执行机制：**
```javascript
// await 等价转换
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

// 等价于
function async1() {
  console.log('async1 start');
  return Promise.resolve(async2()).then(() => {
    console.log('async1 end');
  });
}
```

**关键点：**
1. `await` 之前的代码同步执行
2. `await` 的表达式立即执行
3. `await` 之后的代码进入微任务队列
4. Promise 构造函数中的代码同步执行
5. `.then()` 回调进入微任务队列

**更复杂的例子：**
```javascript
async function async1() {
  console.log('1');
  await async2();
  console.log('2');
  await async3();
  console.log('3');
}

async function async2() {
  console.log('4');
}

async function async3() {
  console.log('5');
}

console.log('6');
async1();
console.log('7');

// 输出：6, 1, 4, 7, 2, 5, 3
```

**执行分析：**
1. 同步：`6`
2. 调用 async1：`1`, `4`（await async2 同步）
3. 同步：`7`
4. 微任务：`2`（await 后），`5`（await async3 同步）
5. 微任务：`3`（await 后）

</details>

---

## 第 9 题 🔴

**类型：** 代码实现题  
**标签：** Promise 实现

### 题目

实现一个简化版的 `Promise.all()`。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**Promise.all() 实现**

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // 边界处理
    if (!Array.isArray(promises)) {
      return reject(new TypeError('参数必须是数组'));
    }
    
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = [];
    let completedCount = 0;
    
    promises.forEach((promise, index) => {
      // 将非 Promise 值转为 Promise
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completedCount++;
          
          // 所有 Promise 都成功
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(error => {
          // 任意一个失败就 reject
          reject(error);
        });
    });
  });
}
```

**测试用例：**
```javascript
// 测试 1：全部成功
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results);  // [1, 2, 3]
});

// 测试 2：包含失败
promiseAll([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(err => {
  console.log(err);  // "error"
});

// 测试 3：包含非 Promise
promiseAll([
  1,
  Promise.resolve(2),
  3
]).then(results => {
  console.log(results);  // [1, 2, 3]
});

// 测试 4：空数组
promiseAll([]).then(results => {
  console.log(results);  // []
});

// 测试 5：保持顺序
promiseAll([
  new Promise(resolve => setTimeout(() => resolve(1), 100)),
  new Promise(resolve => setTimeout(() => resolve(2), 50)),
  new Promise(resolve => setTimeout(() => resolve(3), 150))
]).then(results => {
  console.log(results);  // [1, 2, 3]（按原始顺序）
});
```

**其他方法实现：**

**Promise.race()**
```javascript
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('参数必须是数组'));
    }
    
    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)
        .catch(reject);
    });
  });
}
```

**Promise.allSettled()**
```javascript
function promiseAllSettled(promises) {
  return new Promise(resolve => {
    if (!Array.isArray(promises)) {
      return resolve([]);
    }
    
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = [];
    let completedCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = {
            status: 'fulfilled',
            value
          };
        })
        .catch(reason => {
          results[index] = {
            status: 'rejected',
            reason
          };
        })
        .finally(() => {
          completedCount++;
          if (completedCount === promises.length) {
            resolve(results);
          }
        });
    });
  });
}
```

**Promise.any()**
```javascript
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('参数必须是数组'));
    }
    
    if (promises.length === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }
    
    const errors = [];
    let rejectedCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(resolve)  // 任意一个成功就 resolve
        .catch(error => {
          errors[index] = error;
          rejectedCount++;
          
          // 全部失败才 reject
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        });
    });
  });
}
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 事件循环进阶

### 题目

以下代码的输出顺序是什么？

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

new Promise((resolve) => {
  console.log('4');
  resolve();
}).then(() => {
  console.log('5');
  setTimeout(() => {
    console.log('6');
  }, 0);
}).then(() => {
  console.log('7');
});

setTimeout(() => {
  console.log('8');
}, 0);

console.log('9');
```

<details>
<summary>查看答案</summary>

### ✅ 正确答案：1, 4, 9, 5, 7, 2, 3, 8, 6

### 📖 解析

**详细执行流程**

**第一轮事件循环：**

**同步代码：**
```javascript
console.log('1');        // → 1
// 注册宏任务 setTimeout-2
new Promise((resolve) => {
  console.log('4');      // → 4（同步）
  resolve();
// 注册微任务 then-5
// 注册宏任务 setTimeout-8
console.log('9');        // → 9
```

**微任务队列：**
```javascript
// 执行 then-5
console.log('5');        // → 5
// 注册宏任务 setTimeout-6
// 链式 then-7 进入微任务队列

// 执行 then-7
console.log('7');        // → 7
```

**第二轮事件循环：**

**宏任务队列（第一个）：**
```javascript
// 执行 setTimeout-2
console.log('2');        // → 2
// 注册微任务 then-3
```

**微任务队列：**
```javascript
// 执行 then-3
console.log('3');        // → 3
```

**第三轮事件循环：**

**宏任务队列（第二个）：**
```javascript
// 执行 setTimeout-8
console.log('8');        // → 8
```

**第四轮事件循环：**

**宏任务队列（第三个）：**
```javascript
// 执行 setTimeout-6
console.log('6');        // → 6
```

**完整输出：1, 4, 9, 5, 7, 2, 3, 8, 6**

**关键点总结：**

1. **同步代码最先执行**
2. **微任务优先于宏任务**
3. **Promise 构造函数中的代码是同步的**
4. **每执行完一个宏任务，会清空所有微任务**
5. **链式 then 会按顺序加入微任务队列**

**可视化执行过程：**
```
[同步] 1 → 4 → 9
  ↓
[微任务] 5 → 7
  ↓
[宏任务] 2
  ↓
[微任务] 3
  ↓
[宏任务] 8
  ↓
[宏任务] 6
```

</details>

---

**本章总结：**
- ✅ 回调函数（同步 vs 异步）
- ✅ Promise 三种状态
- ✅ async/await 特性
- ✅ 事件循环机制
- ✅ Promise 链式调用
- ✅ 错误处理
- ✅ Promise 静态方法
- ✅ 执行顺序分析
- ✅ Promise.all 实现
- ✅ 事件循环进阶

**下一章：** [第 10 章：DOM 操作与事件](./chapter-10.md)
