# Reflect API 详解

## 概述

Reflect 是 ES6 引入的内置对象，提供了一组操作对象的方法。

理解 Reflect 的关键在于：

- **与 Proxy 一一对应**：Reflect 方法对应 Proxy 的 13 个 trap
- **返回值更合理**：失败返回 `false` 而非抛出错误
- **函数式操作**：把对象操作变成函数调用

---

## 一、Reflect 简介

### 1.1 设计目的

- **规范化**：将 Object 上的一些方法移到 Reflect
- **函数式**：操作对象变成函数调用
- **返回值合理**：失败返回 false 而非抛出错误
- **配合 Proxy**：Reflect 方法与 Proxy 陷阱一一对应

### 1.2 与 Object 方法对比

```js
// 传统方式
try {
  Object.defineProperty(obj, name, desc);
  // 成功
} catch (e) {
  // 失败
}

// Reflect 方式
if (Reflect.defineProperty(obj, name, desc)) {
  // 成功
} else {
  // 失败
}
```

---

## 二、Reflect 方法

### 2.1 Reflect.get()

```js
const obj = { name: 'Alice', age: 25 };

// 传统方式
obj.name;  // "Alice"

// Reflect 方式
Reflect.get(obj, 'name');  // "Alice"

// 指定 receiver（this 值）
const proxy = new Proxy(obj, {
  get(target, property, receiver) {
    console.log('Reading:', property);
    return Reflect.get(target, property, receiver);
  }
});

proxy.name;  // Reading: name → "Alice"
```

### 2.2 Reflect.set()

```js
const obj = { name: 'Alice' };

// Reflect 方式
Reflect.set(obj, 'age', 25);  // true（成功）

// 返回 false 表示失败
const frozen = Object.freeze({ x: 1 });
Reflect.set(frozen, 'x', 2);  // false
```

### 2.3 Reflect.has()

```js
const obj = { name: 'Alice' };

// 传统方式
'name' in obj;  // true

// Reflect 方式
Reflect.has(obj, 'name');  // true
```

### 2.4 Reflect.deleteProperty()

```js
const obj = { name: 'Alice', age: 25 };

// Reflect 方式
Reflect.deleteProperty(obj, 'age');  // true（成功）

// 不可删除时返回 false
Object.defineProperty(obj, 'id', {
  value: 123,
  configurable: false
});

Reflect.deleteProperty(obj, 'id');  // false
```

### 2.5 Reflect.ownKeys()

```js
const obj = {
  name: 'Alice',
  [Symbol('id')]: 123
};

// Reflect.ownKeys 包含所有类型的键
Reflect.ownKeys(obj);
// ['name', Symbol(id)]

// 对比其他方法
Object.keys(obj);                     // ['name']
Object.getOwnPropertyNames(obj);      // ['name']
Object.getOwnPropertySymbols(obj);    // [Symbol(id)]
```

### 2.6 Reflect.apply()

```js
function sum(a, b) {
  return a + b;
}

// 传统方式
sum.apply(null, [1, 2]);

// Reflect 方式
Reflect.apply(sum, null, [1, 2]);  // 3

// 优势：避免 Function.prototype.apply 被覆盖
Reflect.apply(Array.prototype.slice, [1, 2, 3], [1]);  // [2, 3]
```

### 2.7 Reflect.construct()

```js
function Person(name) {
  this.name = name;
}

// 传统方式
new Person('Alice');

// Reflect 方式
Reflect.construct(Person, ['Alice']);

// 指定不同的原型
function Animal(name) {
  this.name = name;
}

const person = Reflect.construct(Person, ['Alice'], Animal);
person instanceof Animal;  // true
person.name;               // "Alice"
```

---

## 三、配合 Proxy 使用

### 3.1 标准用法

```js
const handler = {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return Reflect.get(target, property, receiver);
  },

  set(target, property, value, receiver) {
    console.log(`Setting ${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  }
};

const obj = new Proxy({ name: 'Alice' }, handler);

obj.name;      // Getting name
obj.age = 25;  // Setting age = 25
```

### 3.2 为什么使用 Reflect

```js
// 问题：直接操作可能导致 this 不正确
const parent = {
  get value() {
    return this.name;
  }
};

const child = {
  name: 'Child',
  __proto__: parent
};

// ❌ 错误做法
const handler1 = {
  get(target, property) {
    return target[property];  // this 指向 target
  }
};

const proxy1 = new Proxy(child, handler1);
proxy1.value;  // undefined（this 是 child 的原型）

// ✅ 正确做法
const handler2 = {
  get(target, property, receiver) {
    return Reflect.get(target, property, receiver);  // this 指向 receiver
  }
};

const proxy2 = new Proxy(child, handler2);
proxy2.value;  // "Child"
```

---

## 四、实际应用

### 4.1 观察者模式

```js
const observers = new Set();

function observe(fn) {
  observers.add(fn);
}

function observable(obj) {
  return new Proxy(obj, {
    set(target, property, value, receiver) {
      const result = Reflect.set(target, property, value, receiver);

      if (result) {
        observers.forEach(fn => fn(property, value));
      }

      return result;
    }
  });
}

// 使用
const state = observable({ count: 0 });

observe((prop, value) => {
  console.log(`${prop} changed to ${value}`);
});

state.count = 1;  // count changed to 1
state.count = 2;  // count changed to 2
```

---

## 五、最佳实践

1. **Proxy 中优先使用 Reflect**：保证正确的 `this` 和返回值。
2. **返回值检查**：Reflect 返回布尔值，不抛出错误。
3. **避免直接操作 target**：用 Reflect 保证语义正确。
4. **receiver 参数很重要**：涉及继承时必须传递 receiver。

---

## 参考资料

- [ECMAScript - Reflect](https://tc39.es/ecma262/#sec-reflect-object)
- [MDN - Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
