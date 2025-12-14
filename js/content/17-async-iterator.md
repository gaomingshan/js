# 异步迭代器协议

## 概述

异步迭代器（Async Iterator）是 ES2018 引入的协议，用于“异步地产生值序列”。

它解决的典型场景：

- 分页 API / 流式读取 / 事件流
- 需要按顺序处理异步数据（逐条拉取、逐条消费）

配合 `for await...of`，可以把“异步数据流”写成同步遍历的样子。

---

## 一、异步迭代器与异步可迭代对象

### 1.1 AsyncIterator

异步迭代器必须实现：

```text
next(): Promise<IteratorResult>
```

也就是说：`next()` 返回的是一个 Promise，resolve 后得到 `{ value, done }`。

### 1.2 AsyncIterable

异步可迭代对象必须实现：

```text
obj[Symbol.asyncIterator](): AsyncIterator
```

---

## 二、`for await...of`

`for await...of` 会：

1. 获取异步迭代器（调用 `[Symbol.asyncIterator]()`）
2. 循环调用 `next()`
3. `await` 每次的 Promise 结果

### 2.1 基本示例

```js
const asyncIterable = {
  data: [1, 2, 3],
  [Symbol.asyncIterator]() {
    let i = 0;
    const data = this.data;

    return {
      async next() {
        await new Promise((r) => setTimeout(r, 100));
        if (i < data.length) return { value: data[i++], done: false };
        return { value: undefined, done: true };
      }
    };
  }
};

for await (const x of asyncIterable) {
  console.log(x);
}
```

### 2.2 处理 Promise 数组

`for await...of` 也能遍历“可迭代对象”，并把其中的 Promise 逐个 await（顺序等待）：

```js
for await (const v of [Promise.resolve(1), Promise.resolve(2)]) {
  console.log(v);
}
```

> **注意**
>
> 这不是并发等待，而是按迭代顺序逐个 await。并发要用 `Promise.all`。

---

## 三、异步生成器：`async function*`

异步生成器是实现异步迭代的最简单方式：

```js
async function* gen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

for await (const x of gen()) {
  console.log(x);
}
```

`yield*` 在异步生成器中也可用，用于委托给异步可迭代对象。

---

## 四、实际应用模式

### 4.1 分页 API：边拉边处理

```js
async function* fetchAllUsers(apiUrl) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`${apiUrl}?page=${page}`);
    const data = await res.json();

    for (const user of data.users) {
      yield user;
    }

    hasMore = data.hasMore;
    page++;
  }
}
```

### 4.2 事件流：把事件变成异步序列

可以把事件推入队列，再用 async iterator 拉取（实现时要注意解绑与清理）。

### 4.3 流式读取（Node.js / Web Streams）

很多流对象本身就是异步可迭代的，可以直接 `for await...of` 消费。

---

## 五、错误处理与清理

### 5.1 try/catch 捕获迭代错误

```js
async function* mayFail() {
  yield 1;
  throw new Error('fail');
}

try {
  for await (const x of mayFail()) {
    console.log(x);
  }
} catch (e) {
  console.error(e);
}
```

### 5.2 提前终止与 finally

`break` 会触发迭代器关闭语义，异步生成器常用 `try/finally` 做资源清理：

```js
async function* stream() {
  try {
    let i = 0;
    while (true) {
      yield i++;
    }
  } finally {
    // close / cleanup
  }
}
```

---

## 六、性能与并发控制

### 6.1 for await 是顺序的

当你需要并发（例如一次拉取 N 个请求），要显式做批处理：

```js
async function* fetchWithConcurrency(urls, concurrency) {
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const resList = await Promise.all(batch.map((u) => fetch(u)));
    for (const res of resList) {
      yield await res.json();
    }
  }
}
```

---

## 七、最佳实践

1. **异步生成器优先**：比手写 `[Symbol.asyncIterator]` 更简洁。
2. **明确顺序/并发语义**：`for await...of` 默认顺序等待。
3. **做好清理**：长连接/事件监听/流读取要在 `finally` 里关闭。
4. **控制并发与重试**：避免对服务端造成压力。

---

## 参考资料

- [ECMAScript - AsyncIterator](https://tc39.es/ecma262/#sec-asynciterator-interface)
- [MDN - for await...of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for-await...of)
