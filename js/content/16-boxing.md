# 装箱与拆箱

## 概述

装箱（Boxing）/拆箱（Unboxing）描述的是：

- 原始值（primitive）与其“包装对象”（wrapper object）之间的转换

它解释了一个经典问题：

> 为什么 `'hello'.toUpperCase()` 能工作？字符串不是对象啊。

---

## 一、基本概念

### 1.1 装箱（Boxing）

把原始值转换成对应的包装对象：

- `string` → `String`
- `number` → `Number`
- `boolean` → `Boolean`
- `symbol` → `Symbol`（注意：Symbol 不能 `new`）
- `bigint` → `BigInt`（注意：BigInt 不能 `new`）

### 1.2 拆箱（Unboxing）

把包装对象转换回原始值，通常通过：

- `valueOf()`
- `toString()`
- `Symbol.toPrimitive`

本质对应规范抽象操作 `ToPrimitive`。

---

## 二、自动装箱：原始值为什么能“调用方法”

```js
const str = 'hello';
str.toUpperCase();
```

概念上等价于：

1. 创建临时包装对象 `new String('hello')`
2. 调用方法
3. 丢弃临时对象

因此你无法给原始值永久挂属性：

```js
const s = 'hi';
s.x = 1;
console.log(s.x); // undefined
```

---

## 三、显式装箱（一般不建议）

```js
const strObj = new String('hello');
const numObj = new Number(123);
const boolObj = new Boolean(false);

typeof strObj;  // 'object'
```

### 3.1 与原始值比较

```js
const a = 'hello';
const b = new String('hello');

a == b;  // true（拆箱后比较）
a === b; // false（类型不同）
```

### 3.2 最危险的坑：Boolean 对象永远 truthy

```js
const f = new Boolean(false);
if (f) {
  // 会执行！因为对象永远 truthy
}
```

> **结论**
>
> 业务代码中不要 `new Boolean/Number/String`。

---

## 四、拆箱过程（ToPrimitive）

```js
const numObj = new Number(123);

+numObj;        // 123
String(numObj); // '123'
```

- 数字语境：倾向 `valueOf()`
- 字符串语境：倾向 `toString()`

```js
const obj = {
  valueOf() { return 100; },
  toString() { return 'custom'; }
};

+obj;        // 100
String(obj); // 'custom'
```

### 4.1 `Symbol.toPrimitive` 精确控制

```js
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 1;
    if (hint === 'string') return 'one';
    return 'default';
  }
};

+obj;        // 1
String(obj); // 'one'
obj + '';    // 'default'
```

---

## 五、特殊值：null 与 undefined

`null/undefined` 没有包装对象，直接访问方法会抛错：

```js
// null.toString();      // TypeError
// undefined.toString(); // TypeError
```

但你可以显式转换：

```js
String(null);      // 'null'
String(undefined); // 'undefined'
```

---

## 六、`Object()`：一个“装箱函数”

```js
Object('hello'); // String {'hello'}
Object(123);     // Number {123}
Object(true);    // Boolean {true}

Object(null);      // {}
Object(undefined); // {}

const o = {};
Object(o) === o; // true
```

---

## 七、类型检查的坑与正确姿势

包装对象会让 `typeof` 与 `instanceof` 表现差异很大：

```js
typeof 'a';            // 'string'
typeof new String('a'); // 'object'

'a' instanceof String;            // false
new String('a') instanceof String; // true
```

比较通用的“类型标签”方式：

```js
Object.prototype.toString.call('a');            // [object String]
Object.prototype.toString.call(new String('a')); // [object String]
```

---

## 八、最佳实践

1. **不要显式装箱**：不要 `new Boolean/Number/String`。
2. **理解自动装箱即可**：它只是为了让原始值能调用方法。
3. **拆箱相关 bug 多出在隐式转换**：遇到诡异比较/拼接优先排查 ToPrimitive。
4. **类型判断要考虑包装对象**：必要时用 `Object.prototype.toString`。

---

## 参考资料

- [ECMAScript - ToPrimitive](https://tc39.es/ecma262/#sec-toprimitive)
- [MDN - Primitive](https://developer.mozilla.org/zh-CN/docs/Glossary/Primitive)
