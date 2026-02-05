# Promise 基础

> 掌握 JavaScript 异步编程的核心工具

---

## 概述

Promise 是 JavaScript 异步编程的基础，它解决了回调地狱问题，提供了更优雅的异步代码组织方式。

本章将深入：
- Promise 的基本概念与状态
- Promise 的创建与使用
- Promise 链式调用
- Promise 静态方法
- Promise 的错误处理
- 实际应用场景

---

## 1. Promise 基本概念

### 1.1 什么是 Promise

**Promise**：代表一个异步操作的最终完成（或失败）及其结果值。

```javascript
// 传统回调方式
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { data: "Hello" });
  }, 1000);
}

fetchData((error, result) => {
  if (error) {
    console.error(error);
  } else {
    console.log(result.data);
  }
});

// Promise 方式
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: "Hello" });
    }, 1000);
  });
}

fetchData()
  .then(result => console.log(result.data))
  .catch(error => console.error(error));
```

### 1.2 Promise 的三种状态

```javascript
// Pending（待定）：初始状态
// Fulfilled（已兑现）：操作成功完成
// Rejected（已拒绝）：操作失败

const promise = new Promise((resolve, reject) => {
  // 初始状态：Pending
  
  setTimeout(() => {
    const success = true;
    
    if (success) {
      resolve("成功");  // 状态变为 Fulfilled
    } else {
      reject("失败");   // 状态变为 Rejected
    }
  }, 1000);
});

// 状态转换：
// Pending → Fulfilled（通过 resolve）
// Pending → Rejected（通过 reject）
// 状态一旦改变，就不会再变
```

### 1.3 Promise 的特点

```javascript
// 1. 状态不可逆
const promise = new Promise((resolve, reject) => {
  resolve("成功");
  reject("失败");   // 无效，状态已经是 Fulfilled
  resolve("再次成功");  // 无效，状态已经确定
});

promise.then(value => console.log(value));  // "成功"

// 2. 立即执行
console.log("1");

new Promise((resolve) => {
  console.log("2");  // 立即执行
  resolve();
}).then(() => {
  console.log("3");  // 异步执行
});

console.log("4");

// 输出顺序：1, 2, 4, 3
```

---

## 2. 创建 Promise

### 2.1 Promise 构造函数

```javascript
const promise = new Promise((resolve, reject) => {
  // executor 函数立即同步执行
  
  // 异步操作
  setTimeout(() => {
    const random = Math.random();
    
    if (random > 0.5) {
      resolve(random);  // 成功
    } else {
      reject(new Error("随机数太小"));  // 失败
    }
  }, 1000);
});

promise
  .then(value => {
    console.log("成功:", value);
  })
  .catch(error => {
    console.error("失败:", error.message);
  });
```

### 2.2 Promise.resolve()

```javascript
// 创建立即成功的 Promise
const promise1 = Promise.resolve("成功");

promise1.then(value => console.log(value));  // "成功"

// 包装 thenable 对象
const thenable = {
  then(resolve, reject) {
    resolve("thenable value");
  }
};

Promise.resolve(thenable).then(value => {
  console.log(value);  // "thenable value"
});

// 包装另一个 Promise
const original = new Promise(resolve => resolve("原始值"));
const wrapped = Promise.resolve(original);

console.log(wrapped === original);  // true（返回原 Promise）
```

### 2.3 Promise.reject()

```javascript
// 创建立即失败的 Promise
const promise = Promise.reject(new Error("失败原因"));

promise.catch(error => {
  console.error(error.message);  // "失败原因"
});

// 与 Promise.resolve 不同，总是创建新 Promise
const original = Promise.reject("error");
const wrapped = Promise.reject(original);

console.log(wrapped === original);  // false
```

---

## 3. Promise 的使用

### 3.1 then() 方法

```javascript
const promise = new Promise(resolve => {
  setTimeout(() => resolve("Hello"), 1000);
});

// 基本用法
promise.then(value => {
  console.log(value);  // "Hello"
});

// 完整签名
promise.then(
  value => {
    console.log("成功:", value);
  },
  error => {
    console.error("失败:", error);
  }
);

// 链式调用
promise
  .then(value => {
    console.log(value);  // "Hello"
    return value + " World";
  })
  .then(value => {
    console.log(value);  // "Hello World"
  });

// 返回 Promise
promise
  .then(value => {
    return new Promise(resolve => {
      setTimeout(() => resolve(value.toUpperCase()), 500);
    });
  })
  .then(value => {
    console.log(value);  // "HELLO"
  });
```

### 3.2 catch() 方法

```javascript
const promise = new Promise((resolve, reject) => {
  reject(new Error("Something went wrong"));
});

// 捕获错误
promise.catch(error => {
  console.error("捕获到错误:", error.message);
});

// 等价于 then(null, onRejected)
promise.then(null, error => {
  console.error("捕获到错误:", error.message);
});

// 链式错误处理
promise
  .then(value => {
    throw new Error("处理过程中出错");
  })
  .catch(error => {
    console.error("第一个 catch:", error.message);
    return "恢复值";
  })
  .then(value => {
    console.log("继续处理:", value);  // "继续处理: 恢复值"
  });
```

### 3.3 finally() 方法

```javascript
const promise = new Promise((resolve, reject) => {
  Math.random() > 0.5 ? resolve("成功") : reject("失败");
});

promise
  .then(value => {
    console.log("成功:", value);
  })
  .catch(error => {
    console.error("失败:", error);
  })
  .finally(() => {
    console.log("无论成功或失败都执行");
    // 清理工作：关闭连接、隐藏加载指示器等
  });

// finally 不接收参数
promise.finally(() => {
  // 无法知道 Promise 是成功还是失败
  // 但总会执行
});

// finally 返回原始值
promise
  .finally(() => {
    return "新值";  // 被忽略
  })
  .then(value => {
    console.log(value);  // 原始值（"成功" 或抛出 "失败"）
  });
```

---

## 4. Promise 链式调用

### 4.1 链式调用的原理

```javascript
// then() 返回新的 Promise
const promise1 = Promise.resolve(1);

const promise2 = promise1.then(value => {
  return value + 1;
});

const promise3 = promise2.then(value => {
  return value * 2;
});

promise3.then(value => {
  console.log(value);  // 4
});

// 简写
Promise.resolve(1)
  .then(value => value + 1)
  .then(value => value * 2)
  .then(value => console.log(value));  // 4
```

### 4.2 返回值的处理

```javascript
Promise.resolve(1)
  // 返回普通值
  .then(value => {
    return value + 1;  // 下一个 then 收到 2
  })
  // 返回 Promise
  .then(value => {
    return Promise.resolve(value * 2);  // 下一个 then 收到 4
  })
  // 不返回（undefined）
  .then(value => {
    console.log(value);  // 4
    // 没有 return
  })
  // 收到 undefined
  .then(value => {
    console.log(value);  // undefined
  });
```

### 4.3 错误传播

```javascript
Promise.resolve(1)
  .then(value => {
    throw new Error("出错了");
  })
  .then(value => {
    // 跳过（因为上一步出错）
    console.log("不会执行");
  })
  .then(value => {
    // 继续跳过
    console.log("也不会执行");
  })
  .catch(error => {
    // 捕获错误
    console.error("捕获到:", error.message);
    return "恢复";
  })
  .then(value => {
    // 恢复后继续
    console.log("继续:", value);  // "继续: 恢复"
  });
```

### 4.4 实际应用：数据处理管道

```javascript
// 模拟 API 调用
function fetchUser(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ id, name: "Alice", teamId: 1 });
    }, 100);
  });
}

function fetchTeam(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ id, name: "Engineering" });
    }, 100);
  });
}

function fetchProjects(teamId) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, name: "Project A" },
        { id: 2, name: "Project B" }
      ]);
    }, 100);
  });
}

// Promise 链
fetchUser(123)
  .then(user => {
    console.log("用户:", user.name);
    return fetchTeam(user.teamId);
  })
  .then(team => {
    console.log("团队:", team.name);
    return fetchProjects(team.id);
  })
  .then(projects => {
    console.log("项目:", projects.map(p => p.name).join(", "));
  })
  .catch(error => {
    console.error("出错:", error);
  });
```

---

## 5. Promise 静态方法

### 5.1 Promise.all()

```javascript
// 等待所有 Promise 完成
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
  .then(values => {
    console.log(values);  // [1, 2, 3]
  });

// 任一失败则失败
const p1 = Promise.resolve(1);
const p2 = Promise.reject(new Error("失败"));
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(values => {
    console.log("不会执行");
  })
  .catch(error => {
    console.error("有一个失败了:", error.message);
  });

// 实际应用：并行请求
Promise.all([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
])
  .then(responses => {
    return Promise.all(responses.map(r => r.json()));
  })
  .then(data => {
    const [users, posts, comments] = data;
    console.log({ users, posts, comments });
  });
```

### 5.2 Promise.race()

```javascript
// 返回最先完成的 Promise
const p1 = new Promise(resolve => setTimeout(() => resolve(1), 1000));
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 500));
const p3 = new Promise(resolve => setTimeout(() => resolve(3), 100));

Promise.race([p1, p2, p3])
  .then(value => {
    console.log(value);  // 3（最快）
  });

// 实际应用：超时控制
function fetchWithTimeout(url, timeout) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("请求超时")), timeout);
    })
  ]);
}

fetchWithTimeout('/api/data', 3000)
  .then(response => response.json())
  .catch(error => console.error(error.message));
```

### 5.3 Promise.allSettled()

```javascript
// 等待所有 Promise 完成（无论成功或失败）
const p1 = Promise.resolve(1);
const p2 = Promise.reject(new Error("失败"));
const p3 = Promise.resolve(3);

Promise.allSettled([p1, p2, p3])
  .then(results => {
    console.log(results);
    // [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'rejected', reason: Error: 失败 },
    //   { status: 'fulfilled', value: 3 }
    // ]
  });

// 实际应用：批量操作
const urls = ['/api/user/1', '/api/user/2', '/api/user/3'];

Promise.allSettled(urls.map(url => fetch(url)))
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`请求 ${index + 1} 成功`);
      } else {
        console.error(`请求 ${index + 1} 失败:`, result.reason);
      }
    });
  });
```

### 5.4 Promise.any()

```javascript
// 返回第一个成功的 Promise
const p1 = Promise.reject(new Error("错误 1"));
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 500));
const p3 = Promise.reject(new Error("错误 3"));

Promise.any([p1, p2, p3])
  .then(value => {
    console.log("第一个成功:", value);  // 2
  });

// 全部失败才失败
const p4 = Promise.reject(new Error("错误 1"));
const p5 = Promise.reject(new Error("错误 2"));
const p6 = Promise.reject(new Error("错误 3"));

Promise.any([p4, p5, p6])
  .catch(error => {
    console.log(error instanceof AggregateError);  // true
    console.log(error.errors);  // [Error: 错误 1, Error: 错误 2, Error: 错误 3]
  });

// 实际应用：尝试多个资源
Promise.any([
  fetch('https://cdn1.example.com/data.json'),
  fetch('https://cdn2.example.com/data.json'),
  fetch('https://cdn3.example.com/data.json')
])
  .then(response => response.json())
  .catch(error => console.error("所有 CDN 都失败了"));
```

### 5.5 对比总结

| 方法 | 描述 | 成功条件 | 失败条件 |
|------|------|----------|----------|
| `Promise.all()` | 全部完成 | 全部成功 | 任一失败 |
| `Promise.race()` | 竞速 | 第一个完成（成功或失败） | - |
| `Promise.allSettled()` | 全部结束 | 全部完成（无论成败） | 不会失败 |
| `Promise.any()` | 任一成功 | 任一成功 | 全部失败 |

---

## 6. Promise 错误处理

### 6.1 捕获同步错误

```javascript
const promise = new Promise((resolve, reject) => {
  throw new Error("同步错误");  // 会被自动捕获并 reject
});

promise.catch(error => {
  console.error("捕获到:", error.message);
});

// 等价于
const promise = new Promise((resolve, reject) => {
  try {
    throw new Error("同步错误");
  } catch (e) {
    reject(e);
  }
});
```

### 6.2 未捕获的 Promise 拒绝

```javascript
// ❌ 未捕获的拒绝
Promise.reject(new Error("未处理的错误"));
// 浏览器：UnhandledPromiseRejectionWarning
// Node.js：PromiseRejectionHandledWarning

// ✅ 正确处理
Promise.reject(new Error("已处理的错误"))
  .catch(error => {
    console.error("处理:", error.message);
  });

// 全局捕获（浏览器）
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  event.preventDefault();  // 阻止默认行为
});

// 全局捕获（Node.js）
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});
```

### 6.3 错误恢复

```javascript
Promise.reject(new Error("初始错误"))
  .catch(error => {
    console.error("捕获:", error.message);
    return "恢复值";  // 恢复
  })
  .then(value => {
    console.log("继续:", value);  // "继续: 恢复值"
  });

// 在 catch 中抛出新错误
Promise.reject(new Error("初始错误"))
  .catch(error => {
    console.error("捕获:", error.message);
    throw new Error("新错误");  // 抛出新错误
  })
  .catch(error => {
    console.error("第二次捕获:", error.message);  // "新错误"
  });
```

### 6.4 错误处理最佳实践

```javascript
// ✅ 总是以 catch 结尾
fetchData()
  .then(processData)
  .then(saveData)
  .catch(error => {
    console.error("出错:", error);
    // 错误处理逻辑
  });

// ✅ 链式错误处理
fetchData()
  .then(processData)
  .catch(error => {
    console.error("处理失败:", error);
    return fallbackData();  // 降级处理
  })
  .then(saveData)
  .catch(error => {
    console.error("保存失败:", error);
  });

// ❌ 错误被吞掉
fetchData()
  .then(processData, error => {
    // 这里的错误处理无法捕获 processData 中的错误
  });

// ✅ 使用 catch
fetchData()
  .then(processData)
  .catch(error => {
    // 能捕获 fetchData 和 processData 的错误
  });
```

---

## 7. Promise 的实际应用

### 7.1 封装异步操作

```javascript
// 封装 setTimeout
function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// 使用
delay(1000).then(() => {
  console.log("1秒后执行");
});

// 封装 XMLHttpRequest
function ajax(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url);
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(options.body);
  });
}

// 使用
ajax('/api/data')
  .then(response => JSON.parse(response))
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### 7.2 重试机制

```javascript
function retry(fn, times = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    function attempt(n) {
      fn()
        .then(resolve)
        .catch(error => {
          if (n <= 1) {
            reject(error);
          } else {
            console.log(`重试，剩余 ${n - 1} 次`);
            setTimeout(() => attempt(n - 1), delay);
          }
        });
    }
    
    attempt(times);
  });
}

// 使用
retry(() => fetch('/api/data'), 3, 1000)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("重试失败:", error));
```

### 7.3 顺序执行

```javascript
// 顺序执行多个异步任务
function sequence(promises) {
  return promises.reduce((prev, curr) => {
    return prev.then(() => curr());
  }, Promise.resolve());
}

// 使用
const tasks = [
  () => delay(1000).then(() => console.log("任务 1")),
  () => delay(500).then(() => console.log("任务 2")),
  () => delay(300).then(() => console.log("任务 3"))
];

sequence(tasks);
// 输出（每隔一段时间）：
// 任务 1
// 任务 2
// 任务 3
```

### 7.4 限流

```javascript
function promiseLimit(limit) {
  let queue = [];
  let running = 0;
  
  return function(fn) {
    return new Promise((resolve, reject) => {
      function run() {
        if (running < limit && queue.length > 0) {
          running++;
          const { fn, resolve, reject } = queue.shift();
          
          fn()
            .then(resolve)
            .catch(reject)
            .finally(() => {
              running--;
              run();
            });
        }
      }
      
      queue.push({ fn, resolve, reject });
      run();
    });
  };
}

// 使用
const limit = promiseLimit(2);  // 最多同时 2 个

const tasks = Array.from({ length: 10 }, (_, i) => {
  return () => delay(1000).then(() => console.log(`任务 ${i + 1} 完成`));
});

tasks.forEach(task => limit(task));
// 每次最多执行 2 个任务
```

---

## 关键要点

1. **Promise 状态**
   - Pending：待定
   - Fulfilled：已兑现
   - Rejected：已拒绝
   - 状态不可逆

2. **Promise 方法**
   - then()：处理成功
   - catch()：处理失败
   - finally()：无论成败都执行

3. **静态方法**
   - Promise.all()：全部成功
   - Promise.race()：竞速
   - Promise.allSettled()：全部完成
   - Promise.any()：任一成功

4. **链式调用**
   - 返回新 Promise
   - 可以传递值
   - 错误会传播

5. **错误处理**
   - 总是添加 catch
   - 同步错误会被捕获
   - 注意未处理的拒绝

---

## 深入一点

### Promise/A+ 规范

Promise 的行为由 Promise/A+ 规范定义，主要内容：

1. Promise 只有三种状态
2. then() 必须返回 Promise
3. 值穿透
4. 错误捕获

### 手写 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
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
    // 实现链式调用...
  }
}
```

---

## 参考资料

- [MDN: Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Promise/A+ 规范](https://promisesaplus.com/)
- [JavaScript Promise 迷你书](http://liubin.org/promises-book/)

---

**上一章**：[函数性能优化与最佳实践](./content-18.md)  
**下一章**：[async/await](./content-20.md)
