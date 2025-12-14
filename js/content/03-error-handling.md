# 异常处理机制（try/catch/finally/throw）

## 概述

异常处理的目标不是“把错误吞掉”，而是：

- 在合适层级捕获
- 生成足够可定位的错误信息
- 保证资源释放与系统处于一致状态

JavaScript 的异常处理还需要特别注意：**同步 try/catch 无法捕获异步回调里的错误**（这与调用栈/事件循环有关）。

---

## 一、try...catch

### 1.1 基本用法

```js
try {
  risky();
} catch (err) {
  console.error(err);
}
```

### 1.2 捕获范围

- `try/catch` 只能捕获 **try 块同步执行期间**抛出的异常。

> **深入原理（关键）**
>
> 异步回调执行时已经不在原来的调用栈里，原 try 块早就结束了。

```js
try {
  setTimeout(() => {
    throw new Error('async');
  }, 0);
} catch (e) {
  // 不会执行
}
```

---

## 二、finally：保证清理

`finally` 无论是否发生异常都会执行（除非进程直接崩溃）。

```js
let resource;
try {
  resource = open();
  work(resource);
} finally {
  resource?.close?.();
}
```

---

## 三、throw 与错误类型

### 3.1 建议抛 Error

你可以 `throw` 任意值，但**建议只抛 Error（或其子类）**，否则堆栈与语义会变差。

```js
throw new Error('something wrong');
```

### 3.2 常见错误类型

- `ReferenceError`：引用不存在
- `TypeError`：类型不符合预期
- `SyntaxError`：语法错误（多在解析阶段）
- `RangeError`：越界

---

## 四、自定义错误与错误分层

```js
class ValidationError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ValidationError';
  }
}
```

> **建议**
>
> - 业务校验错误（Validation）与系统错误（Network/IO）要分开处理。
> - 只在“你能处理的地方”捕获；处理不了就向上抛。

---

## 五、错误包装：保留原始 cause（ES2022）

```js
try {
  doLowLevel();
} catch (e) {
  throw new Error('高层操作失败', { cause: e });
}
```

这能保留原始错误信息与堆栈，便于定位。

---

## 六、异步错误处理

### 6.1 Promise/async 的错误捕获

```js
fetch('/api')
  .then((r) => r.json())
  .catch((e) => console.error(e));

async function run() {
  try {
    const r = await fetch('/api');
    return await r.json();
  } catch (e) {
    console.error(e);
    throw e;
  }
}
```

### 6.2 未处理拒绝（unhandled rejection）

- 浏览器：`unhandledrejection`
- Node：`unhandledRejection`

需要统一上报/兜底，避免错误悄悄丢失。

---

## 七、最佳实践（高信噪比版）

1. **不要空 catch**：至少记录/上报。
2. **错误信息要可行动**：包含上下文（参数、状态、阶段）。
3. **只捕获你能处理的错误**：处理不了就 rethrow。
4. **finally 做清理**：连接、锁、订阅、监听器等。

---

## 参考资料

- [ECMA-262 - try Statement](https://tc39.es/ecma262/#sec-try-statement)
- [MDN - try...catch](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/try...catch)
- [MDN - Error](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error)
