# 条件语句（if / switch / 三元 / 逻辑判断）

## 概述

条件语句用于根据不同条件选择执行路径。写好条件判断的关键不是“会用 if”，而是：

- 正确理解 truthy/falsy（本质是 `ToBoolean`）
- 减少嵌套，提高可读性（提前返回、拆分条件）
- 在合适场景选择 `if` / `switch` / 映射表

---

## 一、if 语句

### 1.1 基本形态

```js
if (cond) {
  // ...
} else if (cond2) {
  // ...
} else {
  // ...
}
```

### 1.2 深入原理：条件如何被判断

`if (cond)` 并不要求 `cond` 是布尔值，规范会执行 `ToBoolean(cond)`。

> **提示**
>
> 只有少数值为 falsy：`false/0/-0/0n/''/null/undefined/NaN`。

---

## 二、switch 语句

### 2.1 匹配规则

`switch` 的 case 匹配使用 **严格相等（===）**。

```js
switch (x) {
  case 1:
    break;
  default:
    break;
}
```

### 2.2 穿透（fall-through）与 break

忘记 `break` 是高频 bug：

```js
switch (x) {
  case 1:
    console.log('1');
  case 2:
    console.log('2');
}
// x=1 时会打印 1 和 2
```

> **建议**
>
> 如果你“故意穿透”，请写清楚注释或采用更清晰的写法（合并 case）。

### 2.3 case 内的块级作用域

`switch` 里混用 `let/const` 容易遇到作用域/TDZ问题，推荐用 `{}` 包起来：

```js
switch (type) {
  case 'a': {
    const x = 1;
    break;
  }
  case 'b': {
    const x = 2;
    break;
  }
}
```

---

## 三、三元运算符（?:）

适合做“简单的条件取值”：

```js
const label = ok ? 'success' : 'fail';
```

> **警告**
>
> 三元嵌套会快速降低可读性，复杂分支请用 `if` 或表驱动。

---

## 四、用逻辑运算符做条件判断

### 4.1 `&&`：条件执行

```js
isAdmin && doAdminWork();
```

### 4.2 `||`：默认值（但会吃掉 0/''）

```js
const name = userName || 'Guest';
```

### 4.3 `??`：更安全的默认值

```js
const retries = config.retries ?? 3;
```

---

## 五、最佳实践：减少嵌套

### 5.1 提前返回（Early Return）

```js
function handle(user) {
  if (!user) return 'no user';
  if (!user.isValid) return 'invalid';
  return 'ok';
}
```

### 5.2 用映射表代替多重 if

```js
const messages = {
  success: '成功',
  error: '错误',
  warning: '警告'
};

const msg = messages[type] ?? '未知';
```

---

## 参考资料

- [ECMA-262 - if Statement](https://tc39.es/ecma262/#sec-if-statement)
- [ECMA-262 - switch Statement](https://tc39.es/ecma262/#sec-switch-statement)
- [MDN - if...else](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/if...else)
