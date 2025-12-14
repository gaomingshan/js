# 可迭代协议（Iterable Protocol）

## 概述

可迭代协议（Iterable Protocol）解决的是“如何让一个对象能被统一遍历”。

核心约定只有一条：

> 对象实现 `[Symbol.iterator]()`，并返回一个迭代器（有 `next()`）。

因此：

- **Iterable（可迭代对象）**：有 `[Symbol.iterator]`
- **Iterator（迭代器）**：有 `next()`

---

## 一、可迭代对象是什么

可迭代对象必须实现：

```text
obj[Symbol.iterator](): Iterator
```

最小例子：

```js
const iterable = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let i = 0;
    const data = this.data;

    return {
      next() {
        if (i < data.length) return { value: data[i++], done: false };
        return { value: undefined, done: true };
      }
    };
  }
};

for (const x of iterable) {
  console.log(x);
}
```

---

## 二、内置可迭代对象（你经常在用）

原生支持 `[Symbol.iterator]` 的类型：

- `Array`
- `String`
- `Set`
- `Map`
- `TypedArray`
- `arguments`
- `NodeList`（很多 DOM 集合）

普通对象 `{}` 默认不可迭代。

---

## 三、for...of 的底层逻辑（理解语法糖）

```js
for (const item of iterable) {
  // ...
}
```

概念上等价于：

1. 调用 `iterable[Symbol.iterator]()` 得到迭代器
2. 不断调用 `next()`
3. 直到 `done === true`

---

## 四、自定义可迭代对象

### 4.1 Range：有边界的遍历

```js
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }

  [Symbol.iterator]() {
    let cur = this.start;
    const end = this.end;
    const step = this.step;

    return {
      next() {
        if (cur <= end) {
          const v = cur;
          cur += step;
          return { value: v, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}
```

### 4.2 无限序列：斐波那契（要注意消费方式）

```js
const fibonacci = {
  [Symbol.iterator]() {
    let prev = 0, cur = 1;
    return {
      next() {
        const v = cur;
        [prev, cur] = [cur, prev + cur];
        return { value: v, done: false };
      }
    };
  }
};
```

> **注意**
>
> 无限 iterable 不能用 `[...]` 或 `Array.from()` 直接转数组，会跑不完。

### 4.3 让普通对象可迭代（例如迭代 entries）

```js
const obj = {
  a: 1,
  b: 2,
  [Symbol.iterator]() {
    const keys = Object.keys(this);
    let i = 0;

    return {
      next: () => {
        if (i < keys.length) {
          const k = keys[i++];
          return { value: [k, this[k]], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (const [k, v] of obj) {
  console.log(k, v);
}
```

---

## 五、提前终止：return() 很重要

当 `for...of` 提前退出（break/throw/return 等），规范会尝试调用迭代器的 `return()` 做清理。

```js
const iterable = {
  [Symbol.iterator]() {
    let n = 0;

    return {
      next() {
        return { value: n++, done: false };
      },
      return() {
        // 清理资源
        return { done: true };
      }
    };
  }
};
```

触发 `return()` 的常见情况：

- `break`
- `return`
- `throw`
- 解构只取前几个元素：`const [a, b] = iterable`

---

## 六、最佳实践

1. **自定义遍历务必实现 `[Symbol.iterator]`**：让你的结构可以被 for...of / spread / 解构直接消费。
2. **需要清理资源时实现 `return()`**：避免 break 后资源泄漏。
3. **无限迭代一定要有“消费边界”**：不要暴露给会“取完”的 API。
4. **普通对象迭代要明确语义**：迭代 keys/values/entries 不同场景不同选择。

---

## 参考资料

- [ECMAScript - Iteration](https://tc39.es/ecma262/#sec-iteration)
- [MDN - 迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)
