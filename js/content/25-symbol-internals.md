# Symbol 内部槽位

## 概述

Symbol 是 ES6 引入的原始数据类型，用于创建唯一标识符。

理解 Symbol 的关键在于：

- **唯一性**：每个 Symbol 都是唯一的（除非通过 `Symbol.for()` 共享）
- **内部槽位**：`[[Description]]` 和 `[[SymbolData]]`
- **全局注册表**：`Symbol.for()` 和 `Symbol.keyFor()` 使用全局注册表

---

## 一、Symbol 基础

### 1.1 创建与特性

```js
// 每个 Symbol 都是唯一的
const sym1 = Symbol();
const sym2 = Symbol();
console.log(sym1 === sym2);  // false

// 带描述
const sym = Symbol('mySymbol');
console.log(sym.description);  // "mySymbol"

// ❌ Symbol 不能使用 new
// const sym = new Symbol();  // TypeError
```

### 1.2 全局注册表

```js
// Symbol.for() - 全局共享
const sym1 = Symbol.for('app.id');
const sym2 = Symbol.for('app.id');
console.log(sym1 === sym2);  // true

// Symbol.keyFor() - 获取 key
console.log(Symbol.keyFor(sym1));  // "app.id"

// 本地 Symbol 没有 key
const local = Symbol('local');
console.log(Symbol.keyFor(local));  // undefined
```

---

## 二、内部槽位

### 2.1 [[Description]]

```js
// Symbol 的描述信息
const sym = Symbol('test');

// 内部槽位：
// [[Description]]: "test"
// [[SymbolData]]: 唯一标识符

console.log(sym.description);  // 访问 [[Description]]
console.log(sym.toString());   // "Symbol(test)"
```

### 2.2 Symbol 注册表

```js
// 全局 Symbol 注册表结构（简化）
GlobalSymbolRegistry = Map {
  "app.id" => Symbol(app.id),
  "shared.key" => Symbol(shared.key)
}

// Symbol.for() 实现（伪代码）
function SymbolFor(key) {
  const stringKey = ToString(key);
  if (GlobalSymbolRegistry.has(stringKey)) {
    return GlobalSymbolRegistry.get(stringKey);
  }
  const newSymbol = Symbol(stringKey);
  GlobalSymbolRegistry.set(stringKey, newSymbol);
  return newSymbol;
}
```

---

## 三、Symbol 作为属性键

### 3.1 属性访问

```js
const sym = Symbol('key');
const obj = { [sym]: 'value' };

// Symbol 属性不出现在：
// - Object.keys()
// - Object.getOwnPropertyNames()
// - for...in
// - JSON.stringify()

console.log(Object.keys(obj));              // []
console.log(Object.getOwnPropertyNames(obj)); // []
console.log(JSON.stringify(obj));            // "{}"

// 只能通过以下方式访问：
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(key)]
console.log(Reflect.ownKeys(obj));              // [Symbol(key)]
```

### 3.2 属性描述符

```js
const sym = Symbol('key');
const obj = {
  [sym]: 'value'
};

// Symbol 属性也有描述符
const descriptor = Object.getOwnPropertyDescriptor(obj, sym);
console.log(descriptor);
// {
//   value: 'value',
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
```

---

## 四、实际应用

### 4.1 避免命名冲突

```js
// 第三方库 A
const libraryA = {
  [Symbol('id')]: 'A',
  getData() {
    return this[Symbol('id')];
  }
};

// 第三方库 B
const libraryB = {
  [Symbol('id')]: 'B',
  getData() {
    return this[Symbol('id')];
  }
};

// 不会冲突
```

### 4.2 元数据存储

```js
const metadataKey = Symbol('metadata');

class Component {
  constructor() {
    this[metadataKey] = {
      createdAt: Date.now(),
      version: '1.0.0'
    };
  }

  getMetadata() {
    return this[metadataKey];
  }
}

const comp = new Component();
console.log(comp.getMetadata());
// { createdAt: ..., version: '1.0.0' }

// 元数据不会出现在普通枚举中
console.log(Object.keys(comp));  // []
```

### 4.3 私有属性模拟

```js
const _private = Symbol('private');

class MyClass {
  constructor() {
    this[_private] = 'private data';
    this.public = 'public data';
  }

  getPrivate() {
    return this[_private];
  }
}

const obj = new MyClass();
console.log(obj.public);        // "public data"
console.log(obj.getPrivate());  // "private data"

// 但仍可以通过反射访问
const symbols = Object.getOwnPropertySymbols(obj);
console.log(obj[symbols[0]]);   // "private data"
```

---

## 五、Symbol 与其他类型的区别

### 5.1 类型转换

```js
const sym = Symbol('test');

// ❌ 不能转换为字符串（直接）
// '' + sym;  // TypeError
// `${sym}`;  // TypeError

// ✅ 显式转换
String(sym);      // "Symbol(test)"
sym.toString();   // "Symbol(test)"

// ✅ 转换为布尔值
Boolean(sym);     // true
!!sym;            // true

// ❌ 不能转换为数字
// +sym;  // TypeError
```

### 5.2 Symbol vs String

```js
// 字符串可以重复
const str1 = 'key';
const str2 = 'key';
console.log(str1 === str2);  // true

// Symbol 总是唯一（除非用 Symbol.for）
const sym1 = Symbol('key');
const sym2 = Symbol('key');
console.log(sym1 === sym2);  // false
```

---

## 六、最佳实践

1. **使用描述**：便于调试，`Symbol('description')`。
2. **全局 Symbol**：跨模块共享用 `Symbol.for()`。
3. **元数据存储**：避免命名冲突。
4. **不要用于加密**：Symbol 不提供安全性。
5. **文档化**：记录 Symbol 的用途和含义。

---

## 参考资料

- [ECMAScript - Symbol Objects](https://tc39.es/ecma262/#sec-symbol-objects)
- [MDN - Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
