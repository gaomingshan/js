# Proxy 代理机制

## 概述

Proxy 是 ES6 引入的元编程特性，可以拦截并自定义对象的基本操作。

理解 Proxy 的关键在于：

- **拦截器（Trap）**：对应 13 种内部方法（`[[Get]]`、`[[Set]]` 等）
- **透明代理**：默认行为是转发给目标对象
- **不可变约束**：必须遵守对象不变量（如不可配置属性不能返回不同值）

---

## 一、Proxy 基础

### 1.1 创建代理

```js
const proxy = new Proxy(target, handler);

// target: 被代理的对象
// handler: 拦截器对象，定义拦截行为
```

最简示例：

```js
const target = { name: 'Alice', age: 25 };

const handler = {
  get(target, property) {
    console.log(`读取属性: ${property}`);
    return target[property];
  },

  set(target, property, value) {
    console.log(`设置属性: ${property} = ${value}`);
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);

proxy.name;      // 读取属性: name
proxy.age = 26;  // 设置属性: age = 26
```

### 1.2 拦截器方法（Traps）

常用的 13 个拦截器：

- `get(target, property, receiver)`
- `set(target, property, value, receiver)`
- `has(target, property)`
- `deleteProperty(target, property)`
- `ownKeys(target)`
- `getOwnPropertyDescriptor(target, prop)`
- `defineProperty(target, property, descriptor)`
- `preventExtensions(target)`
- `getPrototypeOf(target)`
- `isExtensible(target)`
- `setPrototypeOf(target, proto)`
- `apply(target, thisArg, args)`
- `construct(target, args)`

---

## 二、常用拦截器

### 2.1 get：属性读取

```js
const handler = {
  get(target, property) {
    // 属性不存在时返回默认值
    if (!(property in target)) {
      return 'default value';
    }
    return target[property];
  }
};

const obj = new Proxy({ name: 'Alice' }, handler);

obj.name;  // "Alice"
obj.age;   // "default value"
```

### 2.2 set：属性设置与验证

```js
const handler = {
  set(target, property, value) {
    if (property === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('Age must be an integer');
      }
      if (value < 0 || value > 150) {
        throw new RangeError('Age must be between 0 and 150');
      }
    }

    target[property] = value;
    return true; // 必须返回 true 表示成功
  }
};

const person = new Proxy({}, handler);

person.age = 25;    // 成功
// person.age = '25';  // TypeError
// person.age = 200;   // RangeError
```

### 2.3 has：拦截 in 操作符

```js
const handler = {
  has(target, property) {
    if (property.startsWith('_')) {
      return false; // 隐藏私有属性
    }
    return property in target;
  }
};

const obj = new Proxy({
  name: 'Alice',
  _secret: 'password'
}, handler);

'name' in obj;     // true
'_secret' in obj;  // false（被隐藏）
```

### 2.4 apply：拦截函数调用

```js
function sum(a, b) {
  return a + b;
}

const handler = {
  apply(target, thisArg, args) {
    console.log(`调用函数，参数: ${args}`);
    return target.apply(thisArg, args);
  }
};

const proxySum = new Proxy(sum, handler);

proxySum(1, 2);
// 调用函数，参数: 1,2
// → 3
```

---

## 三、实际应用

### 3.1 数据验证

```js
function createValidator(validations) {
  return new Proxy({}, {
    set(target, property, value) {
      if (property in validations) {
        const validator = validations[property];
        if (!validator(value)) {
          throw new Error(`Invalid value for ${property}`);
        }
      }
      target[property] = value;
      return true;
    }
  });
}

// 使用
const user = createValidator({
  name: value => typeof value === 'string' && value.length > 0,
  age: value => Number.isInteger(value) && value >= 0,
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
});

user.name = 'Alice';            // 成功
user.age = 25;                  // 成功
user.email = 'alice@email.com'; // 成功
// user.age = -1;               // Error
// user.email = 'invalid';      // Error
```

### 3.2 响应式数据（类似 Vue）

```js
function reactive(target, callback) {
  return new Proxy(target, {
    set(obj, property, value) {
      const oldValue = obj[property];
      obj[property] = value;

      if (oldValue !== value) {
        callback(property, value, oldValue);
      }

      return true;
    }
  });
}

// 使用
const state = reactive({ count: 0 }, (prop, newVal, oldVal) => {
  console.log(`${prop} changed: ${oldVal} → ${newVal}`);
});

state.count = 1;  // count changed: 0 → 1
state.count = 2;  // count changed: 1 → 2
```

### 3.3 负数索引（类似 Python）

```js
function createArray(arr) {
  return new Proxy(arr, {
    get(target, property) {
      let index = Number(property);

      if (Number.isInteger(index) && index < 0) {
        index = target.length + index;
      }

      return target[index];
    }
  });
}

// 使用
const arr = createArray([1, 2, 3, 4, 5]);

arr[0];   // 1
arr[-1];  // 5
arr[-2];  // 4
```

### 3.4 只读对象

```js
function readonly(target) {
  return new Proxy(target, {
    set() {
      throw new Error('Cannot modify readonly object');
    },
    deleteProperty() {
      throw new Error('Cannot delete property from readonly object');
    }
  });
}

const obj = readonly({ name: 'Alice' });

obj.name;  // "Alice"
// obj.name = 'Bob';  // Error
// delete obj.name;   // Error
```

---

## 四、陷阱与限制

### 4.1 不可变约束

Proxy 必须遵守对象不变量：

```js
const obj = {};
Object.defineProperty(obj, 'x', {
  value: 1,
  configurable: false
});

const proxy = new Proxy(obj, {
  get(target, property) {
    return 999; // 违反不变量
  }
});

// proxy.x;  // TypeError
```

### 4.2 代理不能代理所有对象

某些内置对象有"内部槽位"（如 Date、Map、Set），代理后会失效：

```js
const map = new Map();
const proxyMap = new Proxy(map, {});

// proxyMap.set('key', 'value');  // TypeError
```

---

## 五、最佳实践

1. **配合 Reflect 使用**：保证正确的 `this` 绑定。
2. **返回值要正确**：`set/deleteProperty` 必须返回布尔值。
3. **遵守不变量**：不能违反对象的不可配置属性。
4. **性能考虑**：Proxy 有一定性能开销。
5. **优先验证层**：把 Proxy 用在验证、日志等横切关注点。

---

## 参考资料

- [ECMAScript - Proxy Objects](https://tc39.es/ecma262/#sec-proxy-objects)
- [MDN - Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
