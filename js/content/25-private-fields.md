# 私有字段实现

## 概述

JavaScript 提供多种方式实现私有字段，从 Symbol 到真正的私有字段（`#`）。

理解私有字段的关键在于：

- **Symbol 模拟**：不是真正私有，可以通过反射访问
- **# 私有字段**：真正的私有，外部无法访问
- **WeakMap 方案**：将私有数据存储在外部

---

## 一、Symbol 模拟私有

### 1.1 基本用法

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

// ⚠️ 但可以通过反射访问
const symbols = Object.getOwnPropertySymbols(obj);
console.log(obj[symbols[0]]);   // "private data"
```

### 1.2 优缺点

**优点**：
- 简单易用
- 不会出现在普通枚举中
- 适合元数据存储

**缺点**：
- 不是真正私有
- 可以通过 `Object.getOwnPropertySymbols()` 访问

---

## 二、真正的私有字段（# 语法）

### 2.1 私有实例字段

```js
class MyClass {
  #privateField = 'private';
  publicField = 'public';

  #privateMethod() {
    return 'private method';
  }

  getPrivate() {
    return this.#privateField;
  }

  callPrivateMethod() {
    return this.#privateMethod();
  }
}

const obj = new MyClass();
console.log(obj.publicField);   // "public"
console.log(obj.getPrivate());  // "private"

// ❌ 外部无法访问
// obj.#privateField;  // SyntaxError
```

### 2.2 私有静态字段

```js
class MyClass {
  static #privateStatic = 'static private';
  static publicStatic = 'static public';

  static #privateStaticMethod() {
    return 'private static method';
  }

  static getPrivate() {
    return MyClass.#privateStatic;
  }

  static callPrivateMethod() {
    return MyClass.#privateStaticMethod();
  }
}

console.log(MyClass.publicStatic);      // "static public"
console.log(MyClass.getPrivate());      // "static private"
console.log(MyClass.callPrivateMethod()); // "private static method"

// ❌ 外部无法访问
// MyClass.#privateStatic;  // SyntaxError
```

### 2.3 私有字段的特性

```js
class Counter {
  #count = 0;

  increment() {
    this.#count++;
  }

  getCount() {
    return this.#count;
  }
}

const counter = new Counter();
counter.increment();
console.log(counter.getCount());  // 1

// ❌ 完全无法从外部访问
console.log(Object.keys(counter));                 // []
console.log(Object.getOwnPropertyNames(counter));  // []
console.log(Object.getOwnPropertySymbols(counter)); // []
console.log(Reflect.ownKeys(counter));             // []
```

---

## 三、WeakMap 方案

### 3.1 基本实现

```js
const privateData = new WeakMap();

class MyClass {
  constructor() {
    privateData.set(this, {
      secret: 'private data',
      count: 0
    });
    this.public = 'public data';
  }

  getSecret() {
    return privateData.get(this).secret;
  }

  increment() {
    const data = privateData.get(this);
    data.count++;
  }

  getCount() {
    return privateData.get(this).count;
  }
}

const obj = new MyClass();
console.log(obj.public);       // "public data"
console.log(obj.getSecret());  // "private data"
obj.increment();
console.log(obj.getCount());   // 1
```

### 3.2 多个私有字段

```js
const _name = new WeakMap();
const _age = new WeakMap();
const _email = new WeakMap();

class User {
  constructor(name, age, email) {
    _name.set(this, name);
    _age.set(this, age);
    _email.set(this, email);
  }

  getName() {
    return _name.get(this);
  }

  getAge() {
    return _age.get(this);
  }

  getEmail() {
    return _email.get(this);
  }
}

const user = new User('Alice', 25, 'alice@example.com');
console.log(user.getName());   // "Alice"
console.log(user.getAge());    // 25
console.log(user.getEmail());  // "alice@example.com"
```

### 3.3 WeakMap 优势

**优点**：
- 真正私有
- 自动垃圾回收（对象销毁时，WeakMap 条目自动清除）
- 适合外部存储私有数据

**缺点**：
- 需要额外的 WeakMap 对象
- 代码稍微复杂

---

## 四、闭包方案

### 4.1 基本实现

```js
function createCounter() {
  let count = 0;  // 私有变量

  return {
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getCount());  // 2

// 无法直接访问 count
console.log(counter.count);  // undefined
```

### 4.2 类与闭包结合

```js
const Counter = (function() {
  const _count = new WeakMap();

  return class Counter {
    constructor() {
      _count.set(this, 0);
    }

    increment() {
      _count.set(this, _count.get(this) + 1);
    }

    getCount() {
      return _count.get(this);
    }
  };
})();

const counter = new Counter();
counter.increment();
console.log(counter.getCount());  // 1
```

---

## 五、方案对比

| 方案 | 真正私有 | 性能 | 兼容性 | 使用场景 |
|------|---------|------|--------|---------|
| Symbol | ❌ | ✅ | ✅ | 元数据、非严格私有 |
| # 私有字段 | ✅ | ✅ | ⚠️ ES2022 | 现代项目、严格私有 |
| WeakMap | ✅ | ✅ | ✅ | 需要兼容的严格私有 |
| 闭包 | ✅ | ⚠️ | ✅ | 单个实例、函数式 |

---

## 六、最佳实践

1. **优先使用 # 私有字段**：现代项目的首选。
2. **Symbol 适合元数据**：不需要严格私有时使用。
3. **WeakMap 适合兼容性**：需要严格私有但要兼容旧环境。
4. **不要过度私有化**：只有真正需要私有的才私有化。
5. **命名约定**：如果无法使用私有字段，用 `_` 前缀表示"内部"。

---

## 参考资料

- [TC39 - Class Fields](https://tc39.es/proposal-class-fields/)
- [MDN - Private class features](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
