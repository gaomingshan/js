# 对象模型深入

> 理解 JavaScript 对象的本质与操作

---

## 概述

对象是 JavaScript 的核心数据结构。理解对象的内部结构、属性特性、操作方法，是掌握 JavaScript 的基础。

本章将深入：
- 对象的创建方式
- 属性描述符与特性
- 对象的内部方法
- 属性的枚举与遍历
- 对象的密封与冻结

---

## 1. 对象的创建方式

### 1.1 字面量

```javascript
// 最常用的方式
const obj = {
  name: "Alice",
  age: 25,
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

// ES6 简写
const name = "Bob";
const age = 30;

const person = {
  name,      // 等同于 name: name
  age,       // 等同于 age: age
  greet() {  // 等同于 greet: function() {}
    console.log(this.name);
  }
};

// 计算属性名
const prop = "score";
const obj = {
  [prop]: 100,
  [`${prop}Double`]: 200
};
console.log(obj.score);       // 100
console.log(obj.scoreDouble); // 200
```

### 1.2 构造函数

```javascript
// 传统构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  console.log(`Hello, ${this.name}`);
};

const alice = new Person("Alice", 25);

// ES6 Class（本质仍是构造函数）
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`Hello, ${this.name}`);
  }
}

const bob = new Person("Bob", 30);
```

### 1.3 Object.create()

```javascript
// 指定原型创建对象
const proto = {
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

const obj = Object.create(proto);
obj.name = "Alice";
obj.greet();  // "Hello, Alice"

// 创建无原型对象
const pureObj = Object.create(null);
console.log(pureObj.toString);  // undefined（无原型链）

// 指定属性描述符
const obj = Object.create(proto, {
  name: {
    value: "Alice",
    writable: true,
    enumerable: true,
    configurable: true
  }
});
```

### 1.4 Object.assign() 与展开运算符

```javascript
// 合并对象
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };

const merged = Object.assign({}, obj1, obj2);
console.log(merged);  // { a: 1, b: 3, c: 4 }

// 展开运算符（推荐）
const merged = { ...obj1, ...obj2 };
console.log(merged);  // { a: 1, b: 3, c: 4 }

// 注意：都是浅拷贝
const obj = { a: { b: 1 } };
const copy = { ...obj };
copy.a.b = 2;
console.log(obj.a.b);  // 2（原对象也改变）
```

---

## 2. 属性描述符

### 2.1 数据属性

```javascript
const obj = { name: "Alice" };

// 获取属性描述符
const descriptor = Object.getOwnPropertyDescriptor(obj, "name");
console.log(descriptor);
// {
//   value: "Alice",
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
```

**四个特性**：

| 特性 | 说明 | 默认值 |
|------|------|--------|
| `value` | 属性值 | `undefined` |
| `writable` | 是否可修改 | `false` |
| `enumerable` | 是否可枚举 | `false` |
| `configurable` | 是否可配置/删除 | `false` |

### 2.2 访问器属性

```javascript
const obj = {
  _value: 0,  // 私有属性约定
  
  get value() {
    console.log("Getting value");
    return this._value;
  },
  
  set value(newValue) {
    console.log("Setting value");
    if (newValue >= 0) {
      this._value = newValue;
    }
  }
};

console.log(obj.value);  // "Getting value" → 0
obj.value = 10;          // "Setting value"
console.log(obj.value);  // "Getting value" → 10

// 访问器属性描述符
const descriptor = Object.getOwnPropertyDescriptor(obj, "value");
console.log(descriptor);
// {
//   get: [Function: get value],
//   set: [Function: set value],
//   enumerable: true,
//   configurable: true
// }
```

### 2.3 定义属性

**Object.defineProperty()**

```javascript
const obj = {};

Object.defineProperty(obj, "name", {
  value: "Alice",
  writable: false,      // 不可修改
  enumerable: true,     // 可枚举
  configurable: false   // 不可删除/重新配置
});

obj.name = "Bob";       // 静默失败（严格模式报错）
console.log(obj.name);  // "Alice"

delete obj.name;        // 静默失败
console.log(obj.name);  // "Alice"
```

**Object.defineProperties()**

```javascript
const obj = {};

Object.defineProperties(obj, {
  name: {
    value: "Alice",
    writable: true,
    enumerable: true
  },
  age: {
    value: 25,
    writable: true,
    enumerable: true
  },
  fullInfo: {
    get() {
      return `${this.name}, ${this.age}`;
    },
    enumerable: true
  }
});

console.log(obj.fullInfo);  // "Alice, 25"
```

### 2.4 特性的影响

**writable: false**

```javascript
const obj = {};
Object.defineProperty(obj, "name", {
  value: "Alice",
  writable: false
});

obj.name = "Bob";       // 静默失败
console.log(obj.name);  // "Alice"

// 严格模式报错
"use strict";
obj.name = "Bob";  // TypeError: Cannot assign to read only property
```

**enumerable: false**

```javascript
const obj = { a: 1 };
Object.defineProperty(obj, "b", {
  value: 2,
  enumerable: false
});

console.log(Object.keys(obj));      // ["a"]
console.log(Object.values(obj));    // [1]

for (let key in obj) {
  console.log(key);  // "a"（不包含 b）
}

console.log(obj.b);  // 2（仍可访问）
```

**configurable: false**

```javascript
const obj = {};
Object.defineProperty(obj, "name", {
  value: "Alice",
  configurable: false
});

// 无法删除
delete obj.name;
console.log(obj.name);  // "Alice"

// 无法重新配置
Object.defineProperty(obj, "name", {
  writable: true  // TypeError: Cannot redefine property
});

// 特例：writable 可以从 true 改为 false
Object.defineProperty(obj, "age", {
  value: 25,
  writable: true,
  configurable: false
});

Object.defineProperty(obj, "age", {
  writable: false  // ✅ 允许
});
```

---

## 3. 属性的枚举与遍历

### 3.1 for...in

```javascript
const parent = { a: 1 };
const child = Object.create(parent);
child.b = 2;

for (let key in child) {
  console.log(key);  // "b", "a"（包含继承属性）
}

// 只遍历自身属性
for (let key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key);  // "b"
  }
}
```

### 3.2 Object.keys()

```javascript
const obj = { a: 1, b: 2 };
Object.defineProperty(obj, "c", {
  value: 3,
  enumerable: false
});

console.log(Object.keys(obj));  // ["a", "b"]（只返回可枚举的自身属性）
```

### 3.3 Object.getOwnPropertyNames()

```javascript
const obj = { a: 1, b: 2 };
Object.defineProperty(obj, "c", {
  value: 3,
  enumerable: false
});

console.log(Object.getOwnPropertyNames(obj));  // ["a", "b", "c"]（包含不可枚举）
```

### 3.4 Object.getOwnPropertySymbols()

```javascript
const sym1 = Symbol("sym1");
const sym2 = Symbol("sym2");

const obj = {
  a: 1,
  [sym1]: "symbol1",
  [sym2]: "symbol2"
};

console.log(Object.keys(obj));  // ["a"]
console.log(Object.getOwnPropertySymbols(obj));  // [Symbol(sym1), Symbol(sym2)]
```

### 3.5 Reflect.ownKeys()

```javascript
const sym = Symbol("sym");

const obj = { a: 1 };
Object.defineProperty(obj, "b", {
  value: 2,
  enumerable: false
});
obj[sym] = 3;

console.log(Reflect.ownKeys(obj));  // ["a", "b", Symbol(sym)]
// 包含所有自身属性（可枚举+不可枚举+Symbol）
```

### 3.6 遍历方法总结

| 方法 | 自身 | 继承 | 可枚举 | 不可枚举 | Symbol |
|------|------|------|--------|----------|--------|
| `for...in` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `Object.keys()` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `Object.getOwnPropertyNames()` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `Object.getOwnPropertySymbols()` | ✅ | ❌ | ✅ | ✅ | ✅（仅Symbol）|
| `Reflect.ownKeys()` | ✅ | ❌ | ✅ | ✅ | ✅ |

---

## 4. 对象的保护级别

### 4.1 防止扩展（Prevent Extensions）

```javascript
const obj = { a: 1 };

// 禁止添加新属性
Object.preventExtensions(obj);

obj.b = 2;  // 静默失败（严格模式报错）
console.log(obj.b);  // undefined

obj.a = 10;  // ✅ 可以修改
delete obj.a;  // ✅ 可以删除

console.log(Object.isExtensible(obj));  // false
```

### 4.2 密封（Seal）

```javascript
const obj = { a: 1, b: 2 };

// 密封：不可扩展 + 所有属性 configurable: false
Object.seal(obj);

obj.c = 3;      // ❌ 不可添加
delete obj.a;   // ❌ 不可删除
obj.a = 10;     // ✅ 可以修改

console.log(Object.isSealed(obj));  // true
console.log(Object.isExtensible(obj));  // false
```

### 4.3 冻结（Freeze）

```javascript
const obj = { a: 1, b: 2 };

// 冻结：密封 + 所有属性 writable: false
Object.freeze(obj);

obj.c = 3;      // ❌ 不可添加
delete obj.a;   // ❌ 不可删除
obj.a = 10;     // ❌ 不可修改

console.log(Object.isFrozen(obj));  // true
console.log(Object.isSealed(obj));  // true
```

**浅冻结问题**

```javascript
const obj = {
  a: 1,
  nested: { b: 2 }
};

Object.freeze(obj);

obj.a = 10;           // ❌ 不可修改
obj.nested = {};      // ❌ 不可修改引用
obj.nested.b = 20;    // ✅ 可以修改嵌套对象

console.log(obj.nested.b);  // 20
```

**深冻结实现**

```javascript
function deepFreeze(obj) {
  // 冻结对象本身
  Object.freeze(obj);
  
  // 递归冻结所有属性
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (obj[prop] !== null 
        && typeof obj[prop] === 'object' 
        && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  
  return obj;
}

const obj = {
  a: 1,
  nested: { b: 2 }
};

deepFreeze(obj);
obj.nested.b = 20;  // ❌ 不可修改
console.log(obj.nested.b);  // 2
```

### 4.4 保护级别对比

| 特性 | preventExtensions | seal | freeze |
|------|-------------------|------|--------|
| 添加属性 | ❌ | ❌ | ❌ |
| 删除属性 | ✅ | ❌ | ❌ |
| 修改属性值 | ✅ | ✅ | ❌ |
| 修改属性描述符 | ✅ | ❌ | ❌ |

---

## 5. 对象的内部方法

### 5.1 [[Get]] 和 [[Set]]

```javascript
const obj = {
  _value: 0,
  
  get value() {
    console.log("[[Get]] triggered");
    return this._value;
  },
  
  set value(v) {
    console.log("[[Set]] triggered");
    this._value = v;
  }
};

// 触发 [[Get]]
console.log(obj.value);

// 触发 [[Set]]
obj.value = 10;
```

### 5.2 属性访问的完整流程

```javascript
// obj.prop 的查找过程：
// 1. 在 obj 自身查找 prop
// 2. 没找到，沿原型链向上查找
// 3. 找到后，检查是否有 getter
// 4. 有 getter，调用 getter
// 5. 没有 getter，返回 value

const proto = {
  get sharedProp() {
    return "from proto";
  }
};

const obj = Object.create(proto);
obj.ownProp = "own";

console.log(obj.ownProp);     // "own"（自身属性）
console.log(obj.sharedProp);  // "from proto"（原型属性，触发 getter）
```

### 5.3 in 操作符 vs hasOwnProperty

```javascript
const parent = { a: 1 };
const child = Object.create(parent);
child.b = 2;

console.log("a" in child);  // true（检查整个原型链）
console.log("b" in child);  // true

console.log(child.hasOwnProperty("a"));  // false（只检查自身）
console.log(child.hasOwnProperty("b"));  // true

// 注意：对于 Object.create(null)
const pureObj = Object.create(null);
pureObj.a = 1;

console.log(pureObj.hasOwnProperty("a"));  // ❌ TypeError（无原型链）

// 安全的检查方式
console.log(Object.prototype.hasOwnProperty.call(pureObj, "a"));  // true
```

---

## 6. 属性的存在性检查

### 6.1 多种检查方式

```javascript
const obj = {
  a: 1,
  b: undefined,
  c: null
};

// 方式 1：直接访问（无法区分不存在和 undefined）
console.log(obj.a !== undefined);  // true
console.log(obj.b !== undefined);  // false
console.log(obj.d !== undefined);  // false

// 方式 2：in 操作符（检查原型链）
console.log("a" in obj);  // true
console.log("b" in obj);  // true（存在但值为 undefined）
console.log("d" in obj);  // false

// 方式 3：hasOwnProperty（只检查自身）
console.log(obj.hasOwnProperty("a"));  // true
console.log(obj.hasOwnProperty("toString"));  // false（继承自 Object.prototype）

// 方式 4：Object.hasOwn（ES2022，推荐）
console.log(Object.hasOwn(obj, "a"));  // true
```

### 6.2 空值检查

```javascript
function hasValue(obj, key) {
  return key in obj && obj[key] != null;  // null 和 undefined 都返回 false
}

const obj = {
  a: 1,
  b: 0,
  c: "",
  d: null,
  e: undefined
};

console.log(hasValue(obj, "a"));  // true
console.log(hasValue(obj, "b"));  // true（0 是有效值）
console.log(hasValue(obj, "c"));  // true（空字符串是有效值）
console.log(hasValue(obj, "d"));  // false
console.log(hasValue(obj, "e"));  // false
console.log(hasValue(obj, "f"));  // false
```

---

## 7. 对象的比较

### 7.1 引用比较

```javascript
const obj1 = { a: 1 };
const obj2 = { a: 1 };
const obj3 = obj1;

console.log(obj1 === obj2);  // false（不同引用）
console.log(obj1 === obj3);  // true（同一引用）
```

### 7.2 浅比较

```javascript
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}

console.log(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 }));  // true
console.log(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 }));  // false

// 嵌套对象问题
const obj1 = { a: { b: 1 } };
const obj2 = { a: { b: 1 } };
console.log(shallowEqual(obj1, obj2));  // false（引用不同）
```

### 7.3 深比较

```javascript
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

const obj1 = { a: 1, b: { c: 2 } };
const obj2 = { a: 1, b: { c: 2 } };
console.log(deepEqual(obj1, obj2));  // true
```

---

## 8. 对象的复制

### 8.1 浅拷贝

```javascript
const obj = {
  a: 1,
  b: { c: 2 }
};

// 方式 1：展开运算符
const copy1 = { ...obj };

// 方式 2：Object.assign
const copy2 = Object.assign({}, obj);

// 方式 3：手动复制
const copy3 = {};
for (let key in obj) {
  if (obj.hasOwnProperty(key)) {
    copy3[key] = obj[key];
  }
}

// 问题：嵌套对象共享引用
copy1.b.c = 20;
console.log(obj.b.c);  // 20（原对象被修改）
```

### 8.2 深拷贝

**JSON 方法（有限制）**

```javascript
const obj = {
  a: 1,
  b: { c: 2 },
  d: [3, 4]
};

const copy = JSON.parse(JSON.stringify(obj));
copy.b.c = 20;
console.log(obj.b.c);  // 2（独立副本）

// 限制：
// 1. 无法复制函数
// 2. 无法复制 Symbol
// 3. 无法复制循环引用
// 4. Date 变为字符串
// 5. RegExp、Map、Set 变为空对象
const obj = {
  fn: function() {},
  date: new Date(),
  regex: /test/,
  [Symbol("key")]: "value"
};

const copy = JSON.parse(JSON.stringify(obj));
console.log(copy);
// { date: "2024-01-01T00:00:00.000Z", regex: {} }
```

**递归深拷贝**

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 和非对象
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    const arrCopy = [];
    hash.set(obj, arrCopy);
    obj.forEach((item, index) => {
      arrCopy[index] = deepClone(item, hash);
    });
    return arrCopy;
  }
  
  // 处理对象
  const objCopy = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, objCopy);
  
  // 复制所有属性（包括 Symbol）
  Reflect.ownKeys(obj).forEach(key => {
    objCopy[key] = deepClone(obj[key], hash);
  });
  
  return objCopy;
}

// 测试
const obj = {
  a: 1,
  b: { c: 2 },
  d: [3, 4],
  fn: function() { console.log("test"); },
  date: new Date(),
  regex: /test/i
};
obj.self = obj;  // 循环引用

const copy = deepClone(obj);
copy.b.c = 20;
console.log(obj.b.c);  // 2
console.log(copy.self === copy);  // true（循环引用保持）
```

**structuredClone（推荐，现代浏览器）**

```javascript
const obj = {
  a: 1,
  b: { c: 2 },
  d: [3, 4],
  date: new Date(),
  regex: /test/i,
  map: new Map([["key", "value"]]),
  set: new Set([1, 2, 3])
};
obj.self = obj;  // 循环引用

const copy = structuredClone(obj);
copy.b.c = 20;
console.log(obj.b.c);  // 2

// 限制：
// 1. 无法复制函数
// 2. 无法复制 Symbol
// 3. 无法复制原型链
```

---

## 9. 工程实践

### 9.1 不可变数据更新

```javascript
// ❌ 直接修改
function updateUser(user, updates) {
  Object.assign(user, updates);  // 修改原对象
  return user;
}

// ✅ 创建新对象
function updateUser(user, updates) {
  return { ...user, ...updates };
}

// ✅ 嵌套更新
function updateNestedUser(user, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  const result = { ...user };
  let current = result;
  
  for (let key of keys) {
    current[key] = { ...current[key] };
    current = current[key];
  }
  
  current[lastKey] = value;
  return result;
}

const user = {
  name: "Alice",
  address: {
    city: "Beijing",
    country: "China"
  }
};

const updated = updateNestedUser(user, "address.city", "Shanghai");
console.log(user.address.city);     // "Beijing"
console.log(updated.address.city);  // "Shanghai"
```

### 9.2 对象工厂模式

```javascript
function createUser(name, role) {
  const permissions = {
    admin: ["read", "write", "delete"],
    editor: ["read", "write"],
    viewer: ["read"]
  };
  
  return Object.freeze({
    name,
    role,
    permissions: permissions[role] || [],
    hasPermission(permission) {
      return this.permissions.includes(permission);
    }
  });
}

const admin = createUser("Alice", "admin");
console.log(admin.hasPermission("delete"));  // true

admin.role = "viewer";  // 无法修改（冻结）
console.log(admin.role);  // "admin"
```

### 9.3 属性代理/拦截

```javascript
function createObservable(target) {
  const listeners = [];
  
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;
      
      // 通知监听器
      listeners.forEach(listener => {
        listener(prop, oldValue, value);
      });
      
      return true;
    },
    
    get(obj, prop) {
      if (prop === 'observe') {
        return (fn) => listeners.push(fn);
      }
      return obj[prop];
    }
  });
}

const user = createObservable({ name: "Alice", age: 25 });

user.observe((prop, oldValue, newValue) => {
  console.log(`${prop} changed: ${oldValue} → ${newValue}`);
});

user.name = "Bob";  // "name changed: Alice → Bob"
user.age = 26;      // "age changed: 25 → 26"
```

---

## 关键要点

1. **对象创建**
   - 字面量：最常用
   - 构造函数/Class：可复用
   - Object.create()：指定原型
   - Object.assign/展开：合并对象

2. **属性描述符**
   - 数据属性：value、writable、enumerable、configurable
   - 访问器属性：get、set、enumerable、configurable
   - Object.defineProperty 定义特性

3. **属性遍历**
   - for...in：包含继承
   - Object.keys()：可枚举自身
   - Reflect.ownKeys()：所有自身属性

4. **对象保护**
   - preventExtensions：不可扩展
   - seal：不可扩展+不可删除
   - freeze：seal+不可修改

5. **对象复制**
   - 浅拷贝：展开/Object.assign
   - 深拷贝：递归/structuredClone
   - 注意循环引用

---

## 深入一点

### 属性的内部实现

```javascript
// V8 引擎中，对象属性可能存储在：
// 1. 内联属性（in-object properties）：直接存在对象中，快速访问
// 2. 快速属性（fast properties）：存在属性数组中
// 3. 慢属性（slow properties）：字典模式（哈希表）

// 避免触发慢属性：
// - 不要删除属性（使用 null 代替）
// - 不要添加过多属性
// - 保持属性添加顺序一致
```

---

## 参考资料

- [MDN: Object](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
- [MDN: 属性描述符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [You Don't Know JS: this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed/this%20%26%20object%20prototypes)

---

**上一章**：[错误处理机制](./content-11.md)  
**下一章**：[原型与原型链](./content-13.md)
