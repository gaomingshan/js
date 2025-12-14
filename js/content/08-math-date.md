# Math 与 Date

## 概述

- `Math`：一组数学常量与静态函数（不需要实例化）
- `Date`：处理时间点（timestamp）的内置对象，本质是一个“包着毫秒时间戳的对象”

本章重点：掌握常用 API，并理解 Date 的时区/解析/精度陷阱。

---

## 一、Math

### 1.1 常用常量

- `Math.PI`、`Math.E`

### 1.2 取整函数（含负数差异）

```js
Math.floor(1.9); // 1
Math.ceil(1.1);  // 2
Math.trunc(1.9); // 1

Math.floor(-1.1); // -2
Math.trunc(-1.9); // -1

Math.round(-1.5); // -1（注意：round 的“0.5”规则不对称）
```

> **提示**
>
> `floor/ceil/trunc/round` 的差异在负数上最容易出错，建议关键业务（如金额）避免浮点四舍五入。

### 1.3 随机数：`Math.random()` 不是安全随机

`Math.random()` 适合 UI/简单模拟，不适合安全场景。

安全随机（浏览器）：

```js
crypto.getRandomValues(new Uint32Array(1))[0];
```

---

## 二、Date 的本质

### 2.1 Date 存的是什么

- Date 内部保存一个 Number：**自 Unix Epoch（1970-01-01T00:00:00Z）以来的毫秒数**。

```js
Date.now(); // 当前毫秒时间戳
```

### 2.2 Date 是“时间点”，不是“日历日期”

同一个 timestamp 在不同 timezone 下显示不同。

---

## 三、创建 Date（高频坑位）

### 3.1 推荐：数值构造（本地时区）

```js
new Date(2024, 0, 15, 10, 30, 0); // 月份从 0 开始
```

### 3.2 字符串解析要谨慎

```js
new Date('2024-01-15T10:30:00Z'); // 明确 UTC
```

> **警告**
>
> 非标准/不完整的日期字符串在不同环境解析可能不同。建议只用标准 ISO 字符串并带时区，或用数值构造。

---

## 四、读取与格式化

- 本地：`getFullYear/getMonth/getDate/getHours...`
- UTC：`getUTCFullYear/getUTCMonth...`

输出：

- `toISOString()`：稳定、UTC
- `toLocaleString()`：展示用、受环境影响

---

## 五、时间计算（务实版）

### 5.1 时间差

```js
const d1 = new Date('2024-01-01T00:00:00Z');
const d2 = new Date('2024-01-02T00:00:00Z');

const diffMs = d2 - d1; // 86400000
```

### 5.2 加减天数

```js
const d = new Date();
d.setDate(d.getDate() + 7);
```

> **提示**
>
> Date 是可变对象（mutable），`setXxx` 会修改原对象。

---

## 六、深入一点：性能与时间源

- `Date.now()`：墙上时间（可能受系统时间调整影响）
- `performance.now()`：单调递增（更适合测量耗时）

---

## 七、最佳实践

1. 存储与传输优先用 **timestamp/ISO 字符串（带 Z 或 offset）**。
2. 展示层再做本地化（`Intl.DateTimeFormat`）。
3. 复杂日期运算用库（date-fns/Day.js），或关注未来 `Temporal`。

---

## 参考资料

- [MDN - Math](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math)
- [MDN - Date](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [ECMA-262 - Date Objects](https://tc39.es/ecma262/#sec-date-objects)
- [MDN - performance.now](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now)
