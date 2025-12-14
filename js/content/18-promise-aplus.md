# Promise/A+ 规范详解

## 概述

Promise/A+ 是一个开放标准，定义了 Promise 的核心行为。ES6 原生 Promise 就遵循这个规范。

理解 Promise 的价值不在"会用 `.then`"，而在理解：

- Promise 是一个**状态机**（pending → fulfilled/rejected，不可逆）
- `then` 的返回值决定了链式 Promise 的状态（Promise Resolution Procedure）
- 微任务队列保证回调的异步性

---

## 一、Promise 状态机

### 1.1 三种状态

- **Pending（等待态）**：初始状态，可转换为 fulfilled 或 rejected
- **Fulfilled（完成态）**：成功，有一个不可变的终值（value）
- **Rejected（拒绝态）**：失败，有一个不可变的原因（reason）

状态转换：

```text
pending → fulfilled (不可逆)
pending → rejected (不可逆)
```

一旦状态改变，就永远不会再变。

### 1.2 内部槽位（ECMAScript）

Promise 对象包含以下内部槽位：

- `[[PromiseState]]`：状态
- `[[PromiseResult]]`：值或原因
- `[[PromiseFulfillReactions]]`：完成回调队列
- `[[PromiseRejectReactions]]`：拒绝回调队列

---

## 二、then 方法规范

### 2.1 签名与要求

```js
promise.then(onFulfilled, onRejected)
```

- 参数可选（非函数则忽略）
- 必须返回一个**新的 Promise**
- 可以被同一个 Promise 多次调用
- 回调必须**异步执行**（微任务）

### 2.2 值穿透（非函数参数）

```js
Promise.resolve(42)
  .then('not a function')
  .then(null)
  .then(v => console.log(v)); // 42
```

非函数参数会被忽略，值会"穿透"到下一个 `then`。

### 2.3 Promise Resolution Procedure

`then` 回调的返回值决定新 Promise 的状态：

1. **返回普通值 `x`**：新 Promise 以 `x` 完成
2. **返回 Promise `p`**：新 Promise 采用 `p` 的状态
3. **返回 thenable**：尝试调用其 `then` 方法
4. **抛出异常**：新 Promise 以该异常拒绝
5. **返回自身**：抛出 TypeError（防止循环）

---

## 三、Promise 构造器

### 3.1 executor 的同步执行

```js
console.log('1');

new Promise((resolve) => {
  console.log('2'); // 同步执行
  resolve();
}).then(() => {
  console.log('3'); // 微任务
});

console.log('4');

// 输出：1, 2, 4, 3
```

executor 是**同步执行**的，只有 `.then` 回调才是微任务。

### 3.2 executor 抛出错误

```js
new Promise((resolve, reject) => {
  throw new Error('fail');
}).catch(err => {
  console.error(err);
});
```

executor 抛出的错误会自动被 catch 捕获。

---

## 四、Promise 静态方法

### 4.1 Promise.resolve()

- 参数是 Promise → 直接返回
- 参数是 thenable → 返回跟随该 thenable 的 Promise
- 其他 → 返回以该值完成的 Promise

### 4.2 Promise.all()

等待所有 Promise 完成，或任一 Promise 拒绝：

- 全部完成 → 返回值数组
- 任一拒绝 → 立即拒绝并返回第一个拒绝原因

### 4.3 Promise.race()

返回第一个完成或拒绝的 Promise 的结果。

### 4.4 Promise.allSettled()（ES2020）

等待所有 Promise 完成（无论成功或失败），返回状态数组。

### 4.5 Promise.any()（ES2021）

等待第一个 fulfilled 的 Promise，如果全部 rejected 则抛出 AggregateError。

---

## 五、微任务队列

Promise 回调通过 `HostEnqueuePromiseJob` 加入微任务队列。

执行顺序：

```text
同步代码 → 微任务队列 → 宏任务队列
```

微任务优先于宏任务执行。

---

## 六、常见陷阱

### 6.1 Promise 构造器反模式

```js
// ❌ 不要这样做
function getUserData(id) {
  return new Promise((resolve, reject) => {
    fetchUser(id) // 已经返回 Promise
      .then(user => resolve(user))
      .catch(err => reject(err));
  });
}

// ✅ 正确做法
function getUserData(id) {
  return fetchUser(id);
}
```

### 6.2 未捕获的拒绝

未捕获的 Promise 拒绝会导致：

- Node.js：`unhandledRejection` 事件
- 浏览器：控制台警告

---

## 七、最佳实践

1. **优先显式转换**：用 `Promise.resolve()` 标准化值。
2. **避免构造器反模式**：不要用 Promise 包装 Promise。
3. **总是处理拒绝**：用 `.catch()` 或 `try/catch`。
4. **利用 Promise.all 并发**：避免不必要的顺序等待。
5. **值穿透要谨慎**：确保 `then` 参数是函数。

---

## 参考资料

- [Promise/A+ 规范](https://promisesaplus.com/)
- [ECMAScript - Promise Objects](https://tc39.es/ecma262/#sec-promise-objects)
- [ECMAScript - Promise Jobs](https://tc39.es/ecma262/#sec-promise-jobs)
- [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
