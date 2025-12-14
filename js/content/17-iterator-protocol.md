# 迭代器协议（Iterator Protocol）

## 概述

迭代器协议（Iterator Protocol）定义了“如何逐个产生值”的标准接口。它不是某个类或库，而是一套语言级约定：

- 一个对象只要实现 `next()` 并返回形如 `{ value, done }` 的结果，就可以被当作迭代器使用。

理解迭代器协议的价值在于：

- `for...of` 为什么能遍历数组、字符串、Set、Map
- 展开运算符、解构赋值为什么能“消费”任意数据结构
- 生成器（Generator）为什么天然可遍历

---

## 一、迭代器对象规范

一个迭代器对象必须实现：

```text
next(): IteratorResult

IteratorResult = {
  value: any,
  done: boolean
}
```

- `done: false` 表示还有值
- `done: true` 表示迭代结束

最小实现：

```js
function createRangeIterator(start, end) {
  let cur = start;

  return {
    next() {
      if (cur <= end) return { value: cur++, done: false };
      return { value: undefined, done: true };
    }
  };
}
```

---

## 二、迭代器的运行模型：状态机

你可以把迭代器理解为一个状态机：

- **Active / Suspended**：可以继续产出值
- **Completed**：产出结束

每次 `next()`：

- 读取当前状态
- 产生一个值（或结束）
- 推进内部状态

---

## 三、迭代器是如何被消费的

### 3.1 手动消费

```js
const it = createRangeIterator(1, 3);

it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { value: undefined, done: true }
```

### 3.2 被语法/内置方法消费

很多语法会自动“拉取”迭代器：

- `for...of`
- `...`（展开）
- 解构赋值
- `Array.from`
- `Promise.all / Promise.race`（接收可迭代对象）
- `yield*`

这些工具通常并不直接要“迭代器”，而是要“可迭代对象”（下一节），但底层最终都会反复调用 `next()`。

---

## 四、可选方法：return / throw（不要忽略）

迭代器除了 `next()`，还可以实现：

- `return(value?)`：用于提前终止并做清理
- `throw(err)`：用于向迭代器内部注入错误（生成器最常见）

### 4.1 return：提前终止与资源清理

`for...of` 遇到这些情况会尝试调用 `return()`：

- `break`
- `return`（从函数返回）
- `throw`
- 某些解构提前结束

示例：

```js
function createCleanupIterator() {
  let i = 0;

  return {
    next() {
      if (i < 5) return { value: i++, done: false };
      return { done: true };
    },
    return(v) {
      // 做清理：关闭文件/连接/释放锁...
      return { value: v, done: true };
    }
  };
}
```

> **工程意义**
>
> 如果你的迭代器背后持有资源（文件句柄、网络连接、锁），实现 `return()` 能保证“退出循环时也会释放资源”。

---

## 五、一次性迭代器与可复用遍历

一个“迭代器”通常是一次性的：

- `next()` 会推进状态
- 迭代结束后无法重置

如果你希望“同一个对象可以被反复遍历”，应该实现“可迭代协议”（`[Symbol.iterator]` 返回一个新的迭代器）。

---

## 六、无限迭代器

迭代器可以产生无限序列：

- 优点：惰性、内存友好
- 风险：不带终止条件就会死循环

注意：

- 不要对无限迭代器使用展开运算符（会一直尝试取完）
- 要配合“take N”一类的限制逻辑

---

## 七、迭代器与生成器

生成器返回的对象既是迭代器（有 `next/return/throw`），也是可迭代对象（有 `[Symbol.iterator]`）。

因此生成器是实现迭代器的最佳语法工具之一。

---

## 八、最佳实践

1. **能用生成器就用生成器**：避免手写状态机。
2. **需要资源清理时实现 `return()`**：让 break/throw 也能安全退出。
3. **无限序列要有边界**：不要让消费方意外进入死循环。
4. **迭代器只负责遍历**：不要在 `next()` 里混入过多业务副作用。

---

## 参考资料

- [ECMAScript - Iteration](https://tc39.es/ecma262/#sec-iteration)
- [ECMAScript - Iterator Interface](https://tc39.es/ecma262/#sec-iterator-interface)
- [MDN - 迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)
- [MDN - Symbol.iterator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator)
