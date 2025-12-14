# 对象常用方法

## 概述

`Object` 提供了大量“对象元操作（meta operations）”能力：

- 复制/合并
- 枚举与反射
- 属性描述符
- 对象不可变与扩展控制
- 原型相关操作

写业务时常见的坑几乎都来自两点：

- **浅拷贝 vs 深拷贝**
- **可枚举/可配置/可写 的差异**

---

## 一、创建与复制

### 1.1 `Object.create(proto)`

```js
const proto = { greet() { return 'hi'; } };
const obj = Object.create(proto);
```

### 1.2 `Object.assign(target, ...sources)`（浅拷贝）

```js
const a = { nested: { x: 1 } };
const b = Object.assign({}, a);

b.nested.x = 2;
console.log(a.nested.x); // 2（浅拷贝）
```

### 1.3 扩展运算符 `{...obj}`（也是浅拷贝）

```js
const copy = { ...a };
```

### 1.4 深拷贝：`structuredClone`

现代环境可用：

```js
const deep = structuredClone(a);
```

> **提示**
>
> `JSON.parse(JSON.stringify(x))` 会丢失 `undefined`、函数、Symbol、循环引用等，不是可靠深拷贝。

---

## 二、枚举与反射

### 2.1 常用三件套

- `Object.keys(obj)`：可枚举自有键
- `Object.values(obj)`：可枚举自有值
- `Object.entries(obj)`：键值对

### 2.2 反向：`Object.fromEntries`

```js
Object.fromEntries([['a', 1], ['b', 2]]);
```

### 2.3 更完整：`Reflect.ownKeys`

- 包含不可枚举键
- 包含 Symbol 键

```js
Reflect.ownKeys(obj);
```

---

## 三、属性描述符（深入原理高频）

### 3.1 数据属性 vs 访问器属性

- 数据属性：`value / writable`
- 访问器属性：`get / set`

### 3.2 `Object.defineProperty`

```js
const obj = {};
Object.defineProperty(obj, 'x', {
  value: 1,
  writable: false,
  enumerable: true,
  configurable: false
});
```

> **提示**
>
> 不可配置（`configurable: false`）的属性基本不可再被“重新定义”，在库设计时要谨慎。

---

## 四、对象状态控制

### 4.1 三种“收紧”程度

- `Object.preventExtensions(obj)`：不能新增属性
- `Object.seal(obj)`：不能新增/删除属性
- `Object.freeze(obj)`：不能新增/删除/修改（但**冻结是浅层的**）

### 4.2 深冻结（示意）

```js
function deepFreeze(obj) {
  for (const key of Reflect.ownKeys(obj)) {
    const v = obj[key];
    if (v && typeof v === 'object') deepFreeze(v);
  }
  return Object.freeze(obj);
}
```

---

## 五、原型与“自有属性”判断

### 5.1 原型相关

- `Object.getPrototypeOf(obj)`
- `Object.setPrototypeOf(obj, proto)`（不推荐频繁调用，可能影响性能）

### 5.2 `hasOwnProperty` 的坑

对象可能覆盖 `hasOwnProperty`：

```js
const obj = Object.create(null);
// obj.hasOwnProperty 不存在
```

推荐：

```js
Object.hasOwn(obj, 'x');
```

---

## 六、相等比较：`Object.is`

`Object.is` 采用更严格的 SameValue：

- `Object.is(NaN, NaN) === true`
- `Object.is(+0, -0) === false`

---

## 参考资料

- [MDN - Object](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
- [ECMA-262 - Object Objects](https://tc39.es/ecma262/#sec-object-objects)
- [MDN - structuredClone](https://developer.mozilla.org/zh-CN/docs/Web/API/structuredClone)
