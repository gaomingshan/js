# 循环语句详解

## 概述

循环用于重复执行逻辑、遍历集合。写循环时最常见的问题不是“语法不会”，而是：

- 选错循环方式（例如用 `for...in` 遍历数组）
- 忽略可迭代协议（`for...of` 的底层机制）
- 在循环里产生隐藏的性能/副作用（比如重复创建函数、频繁访问属性）

---

## 一、for / while / do...while

### 1.1 for：已知次数

```js
for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

### 1.2 while：由条件决定

```js
let i = 0;
while (i < 3) {
  i++;
}
```

### 1.3 do...while：至少执行一次

```js
let i = 0;
do {
  i++;
} while (i < 3);
```

---

## 二、for...in：遍历可枚举属性（不推荐遍历数组）

```js
for (const key in obj) {
  // key 是属性名
}
```

注意点：

- 会遍历可枚举属性
- 可能包含原型链上的属性
- 顺序不应依赖（即使现代引擎做了定义，也不建议把它当业务保证）

---

## 三、for...of：遍历可迭代对象（推荐遍历数组）

```js
for (const v of [1, 2, 3]) {
  console.log(v);
}
```

### 3.1 深入原理：for...of 与迭代器协议

`for...of` 本质上会：

1. 读取 `iterable[Symbol.iterator]()`
2. 得到 iterator
3. 循环调用 `iterator.next()`

这解释了它为什么能遍历：Array / String / Map / Set / TypedArray 等。

---

## 四、break / continue / label

- `break`：终止循环
- `continue`：跳过当前迭代
- `label`：跳出多层循环（慎用）

```js
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
  }
}
```

---

## 五、数组遍历方法（forEach/map/filter/reduce）

### 5.1 `forEach` 的限制

`forEach` 不能被 `break/continue` 中断。

需要“提前结束”时，用：

- `for...of` + `break`
- `some` / `every`

---

## 六、循环性能与可维护性建议

1. **避免在循环里创建大量函数**（尤其是事件绑定）。
2. **避免每次迭代重复做昂贵计算**（如反复读取深层属性）。
3. **优先可读性**：除非瓶颈明确，否则不要为了“微优化”牺牲清晰。

---

## 参考资料

- [ECMA-262 - Iteration Statements](https://tc39.es/ecma262/#sec-iteration-statements)
- [MDN - Loops and iteration](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [MDN - for...of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of)
