# Thenable 协议

## 概述

Thenable 是 Promise/A+ 规范的核心概念：**一个具有 `then` 方法的对象或函数**。

理解 Thenable 的价值在于：

- Promise 是 Thenable，但 Thenable 不一定是 Promise
- Promise 能识别并"同化"任意 Thenable（互操作性）
- 自定义 Thenable 可以实现特殊的异步逻辑

---

## 一、Thenable 定义

### 1.1 什么是 Thenable

```js
// Thenable 接口
interface Thenable {
  then(onFulfilled?, onRejected?): any;
}
```

只要对象有 `then` 方法，就是 Thenable。

### 1.2 最简单的 Thenable

```js
const thenable = {
  then(onFulfilled) {
    setTimeout(() => {
      onFulfilled('Hello');
    }, 100);
  }
};

// Promise 会识别并处理它
Promise.resolve(thenable).then(value => {
  console.log(value); // "Hello"
});
```

---

## 二、Thenable 检测

### 2.1 鸭子类型

Promise 使用**鸭子类型**检测 Thenable：只要有 `then` 方法就认为是 Thenable。

```js
function isThenable(value) {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof value.then === 'function'
  );
}
```

### 2.2 陷阱：伪 Thenable

```js
const fakeThen = {
  then: 'I am not a function'
};

Promise.resolve(fakeThen)
  .catch(err => console.error(err));
// TypeError: fakeThen.then is not a function
```

---

## 三、Promise Resolution Procedure

Promise 解析 Thenable 的过程（简化）：

1. **循环检测**：promise 不能 resolve 自己
2. **Promise 类型**：如果 `x` 是 Promise，采用其状态
3. **Thenable 类型**：尝试调用 `x.then`
4. **异常安全**：捕获 `then` 访问和调用中的异常
5. **只调用一次**：onFulfilled/onRejected 只能调用一次

### 3.1 防御性设计

```js
// Promise 实现必须防御恶意 thenable
const evilThenable = {
  then(onFulfilled, onRejected) {
    onFulfilled(1);
    onFulfilled(2); // 违反规范：多次调用
    onRejected(new Error()); // 违反规范：同时调用
  }
};

Promise.resolve(evilThenable).then(
  value => console.log(value), // 只输出一次
  error => console.log(error)  // 不会被调用
);
```

---

## 四、自定义 Thenable

### 4.1 延迟 Thenable

```js
class DelayedThenable {
  constructor(value, delay) {
    this.value = value;
    this.delay = delay;
  }

  then(onFulfilled) {
    setTimeout(() => {
      onFulfilled(this.value);
    }, this.delay);
  }
}

// 使用
const delayed = new DelayedThenable('Hello', 1000);
Promise.resolve(delayed).then(console.log); // 1秒后输出
```

### 4.2 与 Promise 互操作

```js
const customThenable = {
  then(onFulfilled) {
    setTimeout(() => {
      onFulfilled(42);
    }, 100);
  }
};

Promise.resolve(5)
  .then(x => customThenable) // 返回 thenable
  .then(x => {
    console.log(x); // 42
    return x + 10;
  })
  .then(console.log); // 52
```

---

## 五、Thenable 陷阱

### 5.1 访问 then 的副作用

```js
const trickyThenable = {
  get then() {
    console.log('访问 then 属性');
    return function(onFulfilled) {
      onFulfilled(42);
    };
  }
};

// Promise 只会访问 then 一次（根据规范）
Promise.resolve(trickyThenable).then(console.log);
// 输出：访问 then 属性 → 42
```

### 5.2 then 抛出异常

```js
const throwingThenable = {
  get then() {
    throw new Error('Cannot access then');
  }
};

Promise.resolve(throwingThenable)
  .catch(error => console.log(error.message));
// 输出：Cannot access then
```

---

## 六、实际应用

### 6.1 jQuery Deferred

```js
// jQuery Deferred 是 thenable
const deferred = $.Deferred();

Promise.resolve(deferred.promise()).then(value => {
  console.log(value);
});

deferred.resolve('Hello from jQuery');
```

### 6.2 async/await 与 Thenable

```js
const thenable = {
  then(resolve) {
    setTimeout(() => resolve('Result'), 100);
  }
};

async function test() {
  const result = await thenable; // 等待 thenable
  console.log(result); // "Result"
}

test();
```

---

## 七、最佳实践

1. **实现完整的 then**：包含 onFulfilled 和 onRejected。
2. **遵守规范**：只调用一次回调，处理异常。
3. **小心副作用**：访问 `then` 可能有副作用。
4. **使用 Promise.resolve**：标准化 thenable。
5. **优先 Promise**：新代码使用原生 Promise。

---

## 参考资料

- [Promise/A+ 规范](https://promisesaplus.com/)
- [ECMAScript - Promise Resolve](https://tc39.es/ecma262/#sec-promise-resolve-functions)
