# async/await 语法

## 概述

`async/await` 是建立在 Promise 之上的语法糖：它让异步代码的控制流更接近同步代码（更易读、更易维护），同时保留 Promise 的组合能力。

你可以把它理解为：

- `async function`：永远返回 Promise
- `await expr`：等待一个 Promise（或可 then 的对象）完成，再继续往下执行

---

## 一、async 的语义：返回 Promise

```js
async function f() {
  return 1;
}

f().then(console.log); // 1
```

等价于：

- 返回普通值 → `Promise.resolve(value)`
- 抛出异常 → `Promise.reject(error)`

```js
async function g() {
  throw new Error('boom');
}

g().catch((e) => console.log(e.message)); // boom
```

---

## 二、await 的语义：暂停与恢复

`await` 会把函数“切开”：

- 在 `await` 处暂停当前 async 函数
- 等待 Promise settle
- 以微任务形式恢复执行

```js
async function run() {
  console.log('A');
  await Promise.resolve();
  console.log('B');
}

run();
console.log('C');
// A C B
```

---

## 三、错误处理：try/catch 与传播

async/await 下的错误处理更像同步：

```js
async function load() {
  try {
    const res = await fetch('/api');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    // 这里可以做降级/上报/重试
    throw e; // 继续向上抛
  }
}
```

> **注意**
>
> `await` 只会把 Promise 的 reject 转成 throw；但如果你没有 `try/catch`，异常仍然会变成返回 Promise 的 reject。

---

## 四、并发：await 不是并发关键字

很多性能问题来自“无意串行”。

### 4.1 错误写法（串行）

```js
const a = await fetchA();
const b = await fetchB();
```

### 4.2 推荐写法（并发）

```js
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

> **经验法则**
>
> - 有依赖关系 → 串行 `await`
> - 无依赖关系 → 并发 `Promise.all`

---

## 五、深入原理：async/await 与状态机

从编译器角度看，`async/await` 常被转换为“状态机 + Promise 链”。

- 每个 `await` 是一个“断点”
- 后续代码会包装成 `then` 回调

这就是为什么：

- `await` 后的代码总是异步恢复（微任务）
- `await` 不会阻塞线程，只是把控制权让回事件循环

---

## 六、最佳实践与常见坑

1. **入口要处理错误**：顶层调用 async 函数要 `await` 或 `.catch`。
2. **不要在循环里无脑 await**：能并发就并发（`Promise.all` / 批处理）。
3. **注意 try/catch 范围**：只包住需要捕获的部分，避免吞掉错误。
4. **与取消配合**：网络请求建议使用 `AbortController`，不要把“取消”寄托在 await 上。

---

## 参考资料

- [MDN - async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN - await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await)
- [ECMAScript 规范 - AsyncFunction](https://tc39.es/ecma262/#sec-async-function-definitions)
