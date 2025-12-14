# 数组高级操作

## 概述

本章聚焦“数组的进阶能力与工程实践”，包括：

- 解构与扩展运算符
- `Array.from` / `Array.of` 与创建陷阱
- 新增不可变方法（如 `at`、`with`、`toSpliced`）
- 多维数组的正确创建
- 性能与内存的关键点

---

## 一、数组解构

```js
const arr = [1, 2, 3, 4];
const [a, b, ...rest] = arr;
```

常用技巧：

- 默认值：`const [x = 10] = []`
- 交换：`[x, y] = [y, x]`

---

## 二、扩展运算符（...）

### 2.1 浅拷贝

```js
const copy = [...arr];
```

> **注意**
>
> 这是浅拷贝：数组元素如果是对象，仍然共享引用。

### 2.2 合并与插入

```js
const merged = [...a, ...b];
const inserted = [...arr.slice(0, 2), 'X', ...arr.slice(2)];
```

---

## 三、数组创建与坑

### 3.1 `new Array(n)` 的“空位”陷阱

```js
new Array(3); // holes
```

holes 会影响 `map/forEach` 等（它们会跳过）。

### 3.2 推荐：`Array.from`

```js
Array.from({ length: 5 }, (_, i) => i); // [0,1,2,3,4]
```

### 3.3 `Array.of`

```js
Array.of(7);     // [7]
new Array(7);    // holes
```

---

## 四、新方法：`at` / `with`（与不可变更新）

### 4.1 `at`（ES2022）

```js
const arr = [1, 2, 3];
arr.at(-1); // 3
```

### 4.2 `with`（ES2023）

```js
const arr = [1, 2, 3];
const next = arr.with(1, 99);
// arr 不变，next 为 [1, 99, 3]
```

> **提示**
>
> `with` 更适合不可变数据结构思路（React/状态管理常见）。

---

## 五、多维数组：不要用 fill([])

```js
const wrong = new Array(3).fill([]);
wrong[0].push(1);
// 三行都会被修改（同一个引用）
```

正确写法：

```js
const matrix = Array.from({ length: 3 }, () => []);
```

---

## 六、性能与引擎层提示（精简版）

1. **尽量避免稀疏数组（holes）**：很多引擎会把 holes 数组降级为更慢的内部表示。
2. **已知长度时可预分配**：减少扩容与复制。
3. **大数组多次链式遍历可能昂贵**：必要时合并为一次循环。

---

## 参考资料

- [MDN - Array.from](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
- [MDN - Array.at](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
- [MDN - Array.with](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/with)
