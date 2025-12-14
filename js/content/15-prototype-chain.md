# 原型链的底层实现

## 概述

原型链是 JavaScript 的“对象委托模型”：当对象访问属性失败时，会沿着 `[[Prototype]]` 指针向上查找。

本章重点放在**规范层面的对象内部结构**与**属性查找算法**，并补充引擎实现中的常见优化点（为什么“乱改原型/乱改对象形状”会变慢）。

---

## 一、原型的本质：`[[Prototype]]` 内部槽位

每个普通对象都有内部槽位 `[[Prototype]]`：

- 值为另一个对象或 `null`
- 不同于普通属性，不能用 `obj['[[Prototype]]']` 直接访问

### 1.1 访问原型的方式

- `Object.getPrototypeOf(obj)`（推荐）
- `Reflect.getPrototypeOf(obj)`
- `Object.setPrototypeOf(obj, proto)`（不推荐频繁使用）
- `__proto__`（历史访问器属性，不建议作为核心依赖）

> **性能警告**
>
> 运行时动态修改原型（`setPrototypeOf` / `__proto__ = ...`）会破坏引擎对对象的优化，通常会显著变慢。

---

## 二、原型链如何工作：属性查找（`[[Get]]`）

当你访问 `obj.x` 时，查找过程可以简化为：

1. 在 `obj` 自身的“自有属性”中查找 `x`
2. 找不到则取 `obj.[[Prototype]]`
3. 若为 `null` 返回 `undefined`，否则重复步骤 1

### 2.1 原型链终点

```text
对象 → Object.prototype → null
数组 → Array.prototype → Object.prototype → null
函数 → Function.prototype → Object.prototype → null
```

### 2.2 属性遮蔽（shadowing）

对象自有属性会遮蔽原型上的同名属性：

```js
const parent = { name: 'Parent' };
const child = Object.create(parent);

child.name = 'Child';

console.log(child.name);  // 'Child'
delete child.name;
console.log(child.name);  // 'Parent'
```

---

## 三、构造函数与原型的连接

### 3.1 三个关系（必须牢记）

```text
Ctor.prototype             → 原型对象
instance.[[Prototype]]     → Ctor.prototype
Ctor.prototype.constructor → Ctor
```

### 3.2 `new` 的关键点（更完整在下一章）

`new Ctor()` 的关键动作之一是：

```text
instance.[[Prototype]] = Ctor.prototype
```

这也是为什么把方法放在 `Ctor.prototype` 上可以被实例共享。

---

## 四、`instanceof` 的原理

`obj instanceof Ctor` 本质上检查：

> `Ctor.prototype` 是否出现在 `obj` 的原型链上

简化实现：

```js
function myInstanceof(obj, Ctor) {
  const p = Ctor.prototype;
  let cur = Object.getPrototypeOf(obj);
  while (cur) {
    if (cur === p) return true;
    cur = Object.getPrototypeOf(cur);
  }
  return false;
}
```

> **延伸**
>
> `instanceof` 还可以被 `Symbol.hasInstance` 自定义，这属于元编程能力。

---

## 五、`Object.create(proto)`：显式指定原型

```js
const proto = { greet() { return 'hi'; } };
const obj = Object.create(proto);
```

- 适合做“纯委托对象”
- `Object.create(null)` 可以创建**无原型对象**，适合做字典（避免 `toString`/`constructor` 等原型键冲突）

---

## 六、安全：原型污染（Prototype Pollution）

原型污染指攻击者通过写入类似 `__proto__` / `constructor.prototype` 的路径，污染全局原型，影响所有对象。

危险示例（概念演示）：

```js
Object.prototype.isAdmin = true;
const user = {};
console.log(user.isAdmin); // true
```

防护思路：

1. 合并对象时过滤 `__proto__` / `prototype` / `constructor`
2. 字典结构使用 `Object.create(null)`
3. 不要修改内置对象原型

---

## 七、引擎优化视角：为什么“对象形状”很重要

现代引擎（例如 V8）会通过一些机制加速属性访问：

- **隐藏类（Hidden Classes）**：相同属性集合与创建顺序的对象可共享结构
- **内联缓存（Inline Caching）**：缓存属性查找路径
- **原型链缓存**：避免每次都完整遍历

实践建议（高性价比）：

- 以相同顺序初始化对象属性
- 避免频繁 `delete` 属性
- 避免频繁改变对象原型

---

## 八、原型 vs Class

`class` 的本质仍是原型系统的语法糖：

- 实例方法存在于 `Ctor.prototype`
- `extends` 连接原型链
- `#privateField` 是 class 带来的语法级封装能力

---

## 九、最佳实践

1. **用标准 API 操作原型**：`Object.getPrototypeOf`。
2. **不要动态改原型**：对性能与可维护性都不友好。
3. **不要修改内置原型**：风险高（兼容/安全/污染）。
4. **字典对象用 `Object.create(null)`**：避免原型键冲突。

---

## 参考资料

- [ECMAScript - Ordinary Object Internal Methods](https://tc39.es/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots)
- [ECMAScript - Object Behaviors](https://tc39.es/ecma262/#sec-ordinary-and-exotic-objects-behaviours)
- [V8 - Fast Properties](https://v8.dev/blog/fast-properties)
- [MDN - 继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
