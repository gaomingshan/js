# 第 18 章：Promise 规范与实现 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Promise 状态

### 题目

Promise 有几种状态？状态转换是否可逆？

**选项：**
- A. 2 种，可逆
- B. 3 种，不可逆
- C. 3 种，可逆
- D. 4 种，不可逆

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Promise 的三种状态**

```javascript
// 1. pending（进行中）
// 2. fulfilled（已成功）
// 3. rejected（已失败）

const promise = new Promise((resolve, reject) => {
  // 初始状态：pending
  console.log('pending');
  
  resolve('success');  // → fulfilled
  reject('error');     // 无效，状态不可逆
});
```

**状态转换图：**
```
pending (进行中)
   ↓
   ├─→ fulfilled (已成功) [不可逆]
   └─→ rejected (已失败)  [不可逆]
```

**状态不可逆示例：**
```javascript
new Promise((resolve, reject) => {
  resolve(1);
  reject(2);   // 忽略
  resolve(3);  // 忽略
}).then(
  v => console.log('fulfilled:', v),  // fulfilled: 1
  e => console.log('rejected:', e)
);
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** then 链式调用

### 题目

Promise 的 `then` 方法返回什么？

**选项：**
- A. 原 Promise
- B. 新的 Promise
- C. undefined
- D. 回调函数的返回值

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**then 返回新 Promise**

```javascript
const p1 = Promise.resolve(1);
const p2 = p1.then(v => v + 1);
const p3 = p2.then(v => v * 2);

console.log(p1 === p2);  // false
console.log(p2 === p3);  // false

// 每次 then 都返回新的 Promise，支持链式调用
```

**返回值规则：**

**普通值 → 包装为 Promise**
```javascript
Promise.resolve(1)
  .then(v => 2)  // 返回 Promise.resolve(2)
  .then(v => console.log(v));  // 2
```

**Promise → 展开**
```javascript
Promise.resolve(1)
  .then(v => Promise.resolve(2))
  .then(v => console.log(v));  // 2
```

**抛出错误 → rejected Promise**
```javascript
Promise.resolve(1)
  .then(v => { throw new Error('error'); })
  .catch(e => console.log(e.message));  // "error"
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Promise 执行时机

### 题目

Promise 构造函数中的代码是同步执行的。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Promise 构造函数同步执行**

```javascript
console.log('1');

const promise = new Promise((resolve) => {
  console.log('2');  // 同步执行
  resolve();
  console.log('3');  // 同步执行
});

console.log('4');

promise.then(() => {
  console.log('5');  // 异步执行（微任务）
});

console.log('6');

// 输出：1, 2, 3, 4, 6, 5
```

**执行流程：**
```
1. 同步代码：1
2. 创建 Promise，执行 executor：2, 3
3. 同步代码：4, 6
4. 微任务队列：5
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** Promise 微任务

### 题目

以下代码的输出顺序是什么？

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
  Promise.resolve().then(() => {
    console.log('4');
  });
});

Promise.resolve().then(() => {
  console.log('5');
});

console.log('6');
```

**选项：**
- A. `1, 6, 3, 5, 4, 2`
- B. `1, 6, 3, 4, 5, 2`
- C. `1, 6, 2, 3, 5, 4`
- D. `1, 6, 5, 3, 4, 2`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**宏任务与微任务执行顺序**

```javascript
// 同步代码
console.log('1');  // → 1

// 宏任务
setTimeout(() => {
  console.log('2');
}, 0);

// 微任务 1
Promise.resolve().then(() => {
  console.log('3');  // 第一个微任务
  // 微任务 3
  Promise.resolve().then(() => {
    console.log('4');  // 嵌套的微任务
  });
});

// 微任务 2
Promise.resolve().then(() => {
  console.log('5');  // 第二个微任务
});

// 同步代码
console.log('6');  // → 6

// 执行顺序：
// 1. 同步：1, 6
// 2. 微任务队列：[微1, 微2]
//    执行微1 → 3，添加微3
//    执行微2 → 5
//    执行微3 → 4
// 3. 宏任务：2
```

**执行流程图：**
```
【同步】 1, 6
  ↓
【微任务队列】[微1, 微2]
  → 微1: 3 [添加微3]
  → 微2: 5
  → 微3: 4
  ↓
【宏任务队列】[定时器]
  → 2
```

</details>

---

## 第 5 题 🟡

**类型：** 代码输出题  
**标签：** then 参数透传

### 题目

以下代码的输出是什么？

```javascript
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log);
```

**选项：**
- A. `1`
- B. `2`
- C. `3`
- D. `undefined`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**then 参数必须是函数**

```javascript
Promise.resolve(1)
  .then(2)                    // 非函数，忽略
  .then(Promise.resolve(3))   // 非函数，忽略
  .then(console.log);         // 输出 1

// 值透传：1 → (忽略) → (忽略) → console.log(1)
```

**正确写法：**
```javascript
// ✅ 使用函数
Promise.resolve(1)
  .then(v => 2)
  .then(v => Promise.resolve(3))
  .then(console.log);  // 3
```

**透传机制：**
```javascript
// 成功值透传
Promise.resolve(1)
  .then()  // 无回调，值透传
  .then(v => console.log(v));  // 1

// 错误透传
Promise.reject('error')
  .then(v => v)  // 无错误处理
  .catch(e => console.log(e));  // "error"
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** Promise.all

### 题目

`Promise.all()` 的特点是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**Promise.all 的四个特点**

**1. 全部成功才成功**
```javascript
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results);  // [1, 2, 3]
});
```

**2. 一个失败就失败**
```javascript
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(err => {
  console.log(err);  // "error"
});
```

**3. 保持顺序**
```javascript
Promise.all([
  delay(100).then(() => 1),
  delay(50).then(() => 2),
  delay(150).then(() => 3)
]).then(results => {
  console.log(results);  // [1, 2, 3]（按原始顺序）
});
```

**4. 空数组立即 resolve**
```javascript
Promise.all([]).then(results => {
  console.log(results);  // []
});
```

**实际应用：**
```javascript
// 并行请求
async function fetchAllData() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  return { users, posts, comments };
}
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** Promise 静态方法

### 题目

关于 `Promise.race()`，以下说法正确的是？

**选项：**
- A. 返回最快完成的 Promise 结果
- B. 失败的 Promise 也算完成
- C. 空数组会永远 pending
- D. 可以用于超时控制

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**A 正确：返回最快完成的**
```javascript
Promise.race([
  delay(100).then(() => 1),
  delay(50).then(() => 2),
  delay(150).then(() => 3)
]).then(result => {
  console.log(result);  // 2
});
```

**B 正确：失败也算完成**
```javascript
Promise.race([
  delay(100).then(() => 1),
  delay(50).then(() => Promise.reject('error'))
]).catch(err => {
  console.log(err);  // "error"
});
```

**C 正确：空数组永远 pending**
```javascript
const promise = Promise.race([]);
// 永远不会 settle
```

**D 正确：超时控制**
```javascript
function fetchWithTimeout(url, timeout) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** Promise 实现

### 题目

手写实现一个简化版的 Promise。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' 
      ? onFulfilled 
      : value => value;
    onRejected = typeof onRejected === 'function' 
      ? onRejected 
      : reason => { throw reason; };
    
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
      }
      
      if (this.state === REJECTED) {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        });
      }
      
      if (this.state === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          });
        });
        
        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });
    
    return promise2;
  }
  
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  
  finally(onFinally) {
    return this.then(
      value => MyPromise.resolve(onFinally()).then(() => value),
      reason => MyPromise.resolve(onFinally()).then(() => { throw reason; })
    );
  }
  
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise(resolve => resolve(value));
  }
  
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
  
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let completed = 0;
      
      if (promises.length === 0) {
        resolve(results);
        return;
      }
      
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value;
            completed++;
            if (completed === promises.length) {
              resolve(results);
            }
          },
          reject
        );
      });
    });
  }
  
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// 测试
const p = new MyPromise((resolve) => {
  setTimeout(() => resolve(1), 100);
});

p.then(v => {
  console.log(v);  // 1
  return v + 1;
}).then(v => {
  console.log(v);  // 2
});
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** Promise 错误处理

### 题目

分析以下 Promise 错误处理的区别。

```javascript
// 方式 1
promise.then(onFulfilled, onRejected);

// 方式 2
promise.then(onFulfilled).catch(onRejected);
```

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**两种方式的区别**

**方式 1：第二个参数**
```javascript
Promise.reject('error')
  .then(
    value => console.log('success:', value),
    error => console.log('error:', error)  // 捕获
  );
// 输出：error: error
```

**方式 2：catch 方法**
```javascript
Promise.reject('error')
  .then(value => console.log('success:', value))
  .catch(error => console.log('error:', error));  // 捕获
// 输出：error: error
```

**关键区别：**

**1. then 回调中的错误**
```javascript
// 方式 1：无法捕获 then 中的错误
Promise.resolve(1)
  .then(
    value => {
      throw new Error('error in then');
    },
    error => console.log('caught:', error)  // 不会执行
  );
// Uncaught Error

// 方式 2：可以捕获
Promise.resolve(1)
  .then(value => {
    throw new Error('error in then');
  })
  .catch(error => console.log('caught:', error.message));
// caught: error in then
```

**2. 错误传播**
```javascript
// 方式 1：错误在当前 then 处理
Promise.reject('error')
  .then(
    value => value,
    error => 'handled'  // 处理错误，返回正常值
  )
  .then(value => console.log(value));  // "handled"

// 方式 2：错误可以继续传播
Promise.reject('error')
  .then(value => value)  // 跳过
  .then(value => value)  // 跳过
  .catch(error => console.log(error));  // "error"
```

**最佳实践：**
```javascript
// ✅ 推荐：使用 catch
promise
  .then(handleSuccess)
  .catch(handleError)
  .finally(cleanup);

// ✅ 或者：在最后统一处理
promise
  .then(step1)
  .then(step2)
  .then(step3)
  .catch(handleError);
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** Promise 高级应用

### 题目

实现 Promise 的串行执行、并发控制和重试机制。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

**1. 串行执行**
```javascript
function serial(promises) {
  return promises.reduce(
    (prev, curr) => prev.then(curr),
    Promise.resolve()
  );
}

// 使用
serial([
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3')
]).then(() => console.log('All done'));
```

**2. 并发控制**
```javascript
class PromisePool {
  constructor(limit) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }
  
  async add(fn) {
    while (this.running >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.running++;
    
    try {
      return await fn();
    } finally {
      this.running--;
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

// 使用
const pool = new PromisePool(3);  // 最多 3 个并发

const tasks = Array.from({ length: 10 }, (_, i) => 
  () => pool.add(() => fetch(`/api/${i}`))
);

Promise.all(tasks.map(task => task()))
  .then(() => console.log('All done'));
```

**3. 重试机制**
```javascript
function retry(fn, maxAttempts = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    function attempt() {
      attempts++;
      
      fn()
        .then(resolve)
        .catch(error => {
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            console.log(`Retry ${attempts}/${maxAttempts}`);
            setTimeout(attempt, delay * attempts);
          }
        });
    }
    
    attempt();
  });
}

// 使用
retry(() => fetch('/api/data'), 3, 1000)
  .then(response => response.json())
  .catch(error => console.error('Failed after 3 attempts'));
```

**4. 综合应用**
```javascript
class AdvancedPromise {
  // 超时控制
  static timeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      )
    ]);
  }
  
  // 延迟执行
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // map 操作
  static map(items, fn, concurrency = Infinity) {
    const results = [];
    let index = 0;
    
    return new Promise((resolve, reject) => {
      function next() {
        if (index >= items.length) {
          if (results.length === items.length) {
            resolve(results);
          }
          return;
        }
        
        const currentIndex = index++;
        
        fn(items[currentIndex], currentIndex)
          .then(result => {
            results[currentIndex] = result;
            next();
          })
          .catch(reject);
      }
      
      const workers = Math.min(concurrency, items.length);
      for (let i = 0; i < workers; i++) {
        next();
      }
    });
  }
}

// 使用
AdvancedPromise.map(
  [1, 2, 3, 4, 5],
  async (item) => {
    await AdvancedPromise.delay(100);
    return item * 2;
  },
  2  // 最多 2 个并发
).then(results => console.log(results));  // [2, 4, 6, 8, 10]
```

</details>

---

**本章总结：**
- ✅ Promise 状态管理
- ✅ then 链式调用
- ✅ Promise 执行时机
- ✅ 微任务队列
- ✅ then 参数透传
- ✅ Promise.all 特性
- ✅ Promise.race 应用
- ✅ Promise 手写实现
- ✅ 错误处理机制
- ✅ 高级应用模式

**下一章：** [第 19 章：事件循环与并发模型](./chapter-19.md)
