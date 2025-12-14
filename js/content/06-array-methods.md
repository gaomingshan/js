# 数组高阶方法

## 概述

数组高阶方法（如 `map/filter/reduce`）是 JavaScript “函数式风格”的核心：它们接受回调函数，用更声明式的方式描述“对集合做什么”。

掌握这些方法的关键是：

- 回调签名（`(value, index, array)`）与 `thisArg`
- 哪些方法会返回新数组 / 哪些会修改原数组
- 稀疏数组（holes）与迭代行为

---

## 一、遍历与映射

### 1.1 `forEach`

- 只遍历，不返回新数组（返回 `undefined`）
- 不能 `break/continue`

### 1.2 `map`

- 返回新数组（长度与原数组一致）

```js
[1, 2, 3].map((x) => x * 2); // [2, 4, 6]
```

### 1.3 `flatMap`

- 等价于 `map` 后 `flat(1)`

---

## 二、过滤与查找

### 2.1 `filter`

```js
[1, 2, 3, 4].filter((x) => x % 2 === 0); // [2, 4]
```

### 2.2 `find` / `findIndex`

- 找到第一个满足条件的元素/索引
- 找不到返回 `undefined / -1`

### 2.3 `includes`

- 使用 SameValueZero：能正确判断 `NaN`

```js
[NaN].includes(NaN); // true
```

---

## 三、检测：`some` / `every`

- `some`：至少一个为真（可提前结束）
- `every`：全部为真（可提前结束）

---

## 四、归约：`reduce` / `reduceRight`

`reduce` 把数组归并成一个值：

```js
[1, 2, 3].reduce((acc, x) => acc + x, 0); // 6
```

> **提示**
>
> `reduce` 不仅能求和，还能做分组、计数、扁平化。但复杂 reduce 容易难读，必要时拆函数。

---

## 五、排序与反转

### 5.1 `sort`（会修改原数组）

```js
[10, 2, 1].sort(); // [1, 10, 2]（默认按字符串）
[10, 2, 1].sort((a, b) => a - b); // [1, 2, 10]
```

### 5.2 `toSorted` / `toReversed`（ES2023，不改原数组）

更符合不可变数据思路。

---

## 六、深入原理：稀疏数组（holes）与回调调用

多数高阶方法只会对“存在的索引”调用回调（会跳过 holes）：

```js
const a = new Array(3);

let called = 0;
a.forEach(() => called++);

called; // 0
```

> **注意**
>
> holes 与 `undefined` 不同：`[undefined]` 是有元素的，holes 是“没有这个索引”。

---

## 七、最佳实践

1. **能早停就早停**：查找优先 `find/some/every` 而不是 `filter` 后取第一个。
2. **性能与可读性平衡**：链式 `filter().map().reduce()` 可读性好，但大数组可考虑单次遍历。
3. **避免在回调里改原数组结构**：容易引入难以预测的行为。

---

## 参考资料

- [MDN - Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [ECMA-262 - Array Objects](https://tc39.es/ecma262/#sec-array-objects)
