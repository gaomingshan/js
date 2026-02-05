# Proxy 与 Reflect

> 掌握 JavaScript 的元编程能力

---

## 概述

Proxy 和 Reflect 是 ES6 引入的元编程特性，允许拦截和自定义对象的基本操作。Vue 3 的响应式系统就是基于 Proxy 实现的。

本章将深入：
- Proxy 拦截器
- Reflect 反射 API
- 实际应用场景
- 与 Object.defineProperty 的区别

---

## 1. Proxy 基础

### 1.1 基本用法

```javascript
const target = { name: 'Alice', age: 25 };

const handler = {
  get(target, property) {
    console.log(`读取: ${property}`);
    return target[property];
  },
  
  set(target, property, value) {
    console.log(`设置: ${property} = ${value}`);
    target[property] = value;
    return true;  // 表示设置成功
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name);  // 读取: name, "Alice"
proxy.age = 30;           // 设置: age = 30
```

### 1.2 可拦截的操作

```javascript
const handler = {
  // 读取属性
  get(target, property, receiver) {},
  
  // 设置属性
  set(target, property, value, receiver) {},
  
  // 检查属性
  has(target, property) {},
  
  // 删除属性
  deleteProperty(target, property) {},
  
  // 函数调用
  apply(target, thisArg, args) {},
  
  // new 操作符
  construct(target, args) {},
  
  // 获取原型
  getPrototypeOf(target) {},
  
  // 设置原型
  setPrototypeOf(target, proto) {},
  
  // Object.keys/for...in
  ownKeys(target) {},
  
  // Object.getOwnPropertyDescriptor
  getOwnPropertyDescriptor(target, property) {},
  
  // Object.defineProperty
  defineProperty(target, property, descriptor) {},
  
  // Object.preventExtensions
  preventExtensions(target) {},
  
  // Object.isExtensible
  isExtensible(target) {}
};
```

---

## 2. 常用拦截器

### 2.1 get 拦截

```javascript
const handler = {
  get(target, property) {
    // 私有属性
    if (property.startsWith('_')) {
      throw new Error('不能访问私有属性');
    }
    
    // 默认值
    return property in target ? target[property] : 'default';
  }
};

const obj = new Proxy({ name: 'Alice', _secret: 'xxx' }, handler);

console.log(obj.name);      // "Alice"
console.log(obj.unknown);   // "default"
console.log(obj._secret);   // Error: 不能访问私有属性
```

### 2.2 set 拦截

```javascript
const handler = {
  set(target, property, value) {
    // 类型验证
    if (property === 'age' && typeof value !== 'number') {
      throw new TypeError('age 必须是数字');
    }
    
    // 范围验证
    if (property === 'age' && (value < 0 || value > 150)) {
      throw new RangeError('age 必须在 0-150 之间');
    }
    
    target[property] = value;
    return true;
  }
};

const person = new Proxy({}, handler);

person.age = 25;     // ✅
person.age = '25';   // ❌ TypeError
person.age = 200;    // ❌ RangeError
```

### 2.3 has 拦截

```javascript
const handler = {
  has(target, property) {
    // 隐藏私有属性
    if (property.startsWith('_')) {
      return false;
    }
    return property in target;
  }
};

const obj = new Proxy({ name: 'Alice', _secret: 'xxx' }, handler);

console.log('name' in obj);     // true
console.log('_secret' in obj);  // false（隐藏）
```

### 2.4 deleteProperty 拦截

```javascript
const handler = {
  deleteProperty(target, property) {
    // 保护属性
    if (property.startsWith('_')) {
      throw new Error('不能删除私有属性');
    }
    delete target[property];
    return true;
  }
};

const obj = new Proxy({ name: 'Alice', _id: 123 }, handler);

delete obj.name;   // ✅
delete obj._id;    // ❌ Error
```

---

## 3. Reflect API

### 3.1 基本用法

```javascript
// Reflect 提供了与 Proxy 拦截器对应的方法

const obj = { name: 'Alice' };

// 读取属性
Reflect.get(obj, 'name');  // "Alice"

// 设置属性
Reflect.set(obj, 'age', 25);  // true

// 检查属性
Reflect.has(obj, 'name');  // true

// 删除属性
Reflect.deleteProperty(obj, 'name');  // true

// 获取原型
Reflect.getPrototypeOf(obj);

// 设置原型
Reflect.setPrototypeOf(obj, proto);
```

### 3.2 Proxy + Reflect

```javascript
const handler = {
  get(target, property, receiver) {
    console.log(`读取: ${property}`);
    // 使用 Reflect 完成默认操作
    return Reflect.get(target, property, receiver);
  },
  
  set(target, property, value, receiver) {
    console.log(`设置: ${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  }
};

const proxy = new Proxy({ name: 'Alice' }, handler);
```

### 3.3 receiver 参数

```javascript
const parent = {
  get value() {
    return this.name;
  }
};

const child = {
  name: 'Child'
};

Object.setPrototypeOf(child, parent);

const proxy = new Proxy(child, {
  get(target, property, receiver) {
    console.log('receiver:', receiver === proxy);
    // 必须传递 receiver，确保 this 正确
    return Reflect.get(target, property, receiver);
  }
});

console.log(proxy.value);  // "Child"（正确的 this）
```

---

## 4. 实际应用

### 4.1 数据验证

```javascript
function createValidator(schema) {
  return new Proxy({}, {
    set(target, property, value) {
      const validator = schema[property];
      
      if (validator && !validator(value)) {
        throw new Error(`${property} 验证失败`);
      }
      
      target[property] = value;
      return true;
    }
  });
}

const userSchema = {
  name: value => typeof value === 'string' && value.length > 0,
  age: value => typeof value === 'number' && value >= 0,
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
};

const user = createValidator(userSchema);

user.name = 'Alice';             // ✅
user.age = 25;                   // ✅
user.email = 'alice@example.com'; // ✅

user.age = -1;                   // ❌ Error
user.email = 'invalid';          // ❌ Error
```

### 4.2 响应式系统（类 Vue 3）

```javascript
const reactive = (target) => {
  const handlers = new Set();
  
  const handler = {
    get(target, property, receiver) {
      // 依赖收集
      if (currentEffect) {
        handlers.add(currentEffect);
      }
      return Reflect.get(target, property, receiver);
    },
    
    set(target, property, value, receiver) {
      const result = Reflect.set(target, property, value, receiver);
      // 触发更新
      handlers.forEach(handler => handler());
      return result;
    }
  };
  
  return new Proxy(target, handler);
};

let currentEffect = null;

function watchEffect(fn) {
  currentEffect = fn;
  fn();
  currentEffect = null;
}

// 使用
const state = reactive({ count: 0 });

watchEffect(() => {
  console.log('count:', state.count);
});

state.count++;  // 自动触发：count: 1
state.count++;  // 自动触发：count: 2
```

### 4.3 负数组索引

```javascript
function createArray(arr) {
  return new Proxy(arr, {
    get(target, property) {
      let index = parseInt(property);
      
      if (index < 0) {
        index = target.length + index;
      }
      
      return target[index];
    }
  });
}

const arr = createArray([1, 2, 3, 4, 5]);

console.log(arr[-1]);  // 5
console.log(arr[-2]);  // 4
```

### 4.4 只读对象

```javascript
function readonly(target) {
  return new Proxy(target, {
    set() {
      throw new Error('对象是只读的');
    },
    deleteProperty() {
      throw new Error('对象是只读的');
    }
  });
}

const obj = readonly({ name: 'Alice' });

console.log(obj.name);  // "Alice"
obj.name = 'Bob';       // ❌ Error
delete obj.name;        // ❌ Error
```

### 4.5 函数缓存

```javascript
function memoize(fn) {
  const cache = new Map();
  
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        console.log('从缓存返回');
        return cache.get(key);
      }
      
      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
}

const fibonacci = memoize(function(n) {
  console.log('计算:', n);
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(10);  // 计算多次
fibonacci(10);  // 从缓存返回
```

---

## 5. Proxy vs Object.defineProperty

```javascript
// Object.defineProperty（Vue 2）
const obj = {};

Object.defineProperty(obj, 'name', {
  get() {
    console.log('读取 name');
    return this._name;
  },
  set(value) {
    console.log('设置 name');
    this._name = value;
  }
});

// 缺点：
// 1. 需要遍历每个属性
// 2. 无法监听属性添加/删除
// 3. 无法监听数组索引和 length

// Proxy（Vue 3）
const proxy = new Proxy({}, {
  get(target, property) {
    console.log('读取:', property);
    return target[property];
  },
  set(target, property, value) {
    console.log('设置:', property);
    target[property] = value;
    return true;
  }
});

// 优点：
// 1. 可以监听整个对象
// 2. 可以监听属性添加/删除
// 3. 可以监听数组变化
// 4. 性能更好
```

---

## 6. 注意事项

### 6.1 this 绑定

```javascript
const target = {
  name: 'Alice',
  greet() {
    return `Hello, ${this.name}`;
  }
};

const proxy = new Proxy(target, {
  get(target, property, receiver) {
    const value = Reflect.get(target, property, receiver);
    
    // 绑定函数的 this 为 proxy
    if (typeof value === 'function') {
      return value.bind(receiver);
    }
    
    return value;
  }
});

console.log(proxy.greet());  // "Hello, Alice"
```

### 6.2 内部槽位

```javascript
// Date、Map、Set 等内置对象有内部槽位，Proxy 无法代理

const map = new Map();
const proxy = new Proxy(map, {});

proxy.set('key', 'value');  // ❌ TypeError

// 解决方法：手动绑定
const proxy = new Proxy(map, {
  get(target, property) {
    const value = Reflect.get(target, property);
    if (typeof value === 'function') {
      return value.bind(target);  // 绑定到原始对象
    }
    return value;
  }
});
```

---

## 关键要点

1. **Proxy 拦截器**
   - get/set：属性读写
   - has：in 操作符
   - deleteProperty：delete
   - apply：函数调用

2. **Reflect API**
   - 与 Proxy 对应
   - 返回值明确
   - receiver 参数

3. **实际应用**
   - 数据验证
   - 响应式系统
   - 只读对象
   - 函数缓存

4. **优势**
   - 比 Object.defineProperty 更强大
   - 可以监听整个对象
   - 支持数组监听

5. **注意事项**
   - this 绑定
   - 内部槽位问题
   - 性能影响

---

## 参考资料

- [MDN: Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [MDN: Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

---

**上一章**：[ES6+ 模块系统](./content-31.md)  
**下一章**：[Symbol 与元编程](./content-33.md)
