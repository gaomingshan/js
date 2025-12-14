# 第 20 章：元编程与反射 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** Proxy 基础

### 题目

Proxy 可以拦截对象的哪些操作？

**选项：**
- A. 只能拦截属性读取
- B. 只能拦截属性设置
- C. 可以拦截 13 种基本操作
- D. 可以拦截所有操作

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**Proxy 的 13 种拦截操作**

```javascript
const handler = {
  // 1. get - 读取属性
  get(target, prop) {},
  
  // 2. set - 设置属性
  set(target, prop, value) {},
  
  // 3. has - in 操作符
  has(target, prop) {},
  
  // 4. deleteProperty - delete 操作
  deleteProperty(target, prop) {},
  
  // 5. ownKeys - Object.keys/getOwnPropertyNames/Symbols
  ownKeys(target) {},
  
  // 6. getOwnPropertyDescriptor
  getOwnPropertyDescriptor(target, prop) {},
  
  // 7. defineProperty
  defineProperty(target, prop, descriptor) {},
  
  // 8. preventExtensions
  preventExtensions(target) {},
  
  // 9. getPrototypeOf
  getPrototypeOf(target) {},
  
  // 10. setPrototypeOf
  setPrototypeOf(target, proto) {},
  
  // 11. isExtensible
  isExtensible(target) {},
  
  // 12. apply - 函数调用
  apply(target, thisArg, args) {},
  
  // 13. construct - new 操作符
  construct(target, args) {}
};

const proxy = new Proxy(target, handler);
```

**常用拦截示例：**

```javascript
const obj = { name: 'Alice' };

const proxy = new Proxy(obj, {
  get(target, prop) {
    console.log(`Reading ${prop}`);
    return target[prop];
  },
  
  set(target, prop, value) {
    console.log(`Setting ${prop} = ${value}`);
    target[prop] = value;
    return true;
  }
});

proxy.name;        // Reading name
proxy.age = 25;    // Setting age = 25
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Reflect API

### 题目

Reflect API 的主要作用是什么？

**选项：**
- A. 提供新的反射方法
- B. 规范化对象操作
- C. 替代 Object 的方法
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**Reflect API 的三个作用**

**1. 提供反射方法**
```javascript
// 检查属性是否存在
Reflect.has(obj, 'name');  // true/false

// 获取原型
Reflect.getPrototypeOf(obj);

// 设置原型
Reflect.setPrototypeOf(obj, proto);
```

**2. 规范化操作**
```javascript
// ❌ 旧方式：不一致
Object.defineProperty(obj, 'name', { value: 'Alice' });
delete obj.name;
'name' in obj;

// ✅ 新方式：统一的 Reflect API
Reflect.defineProperty(obj, 'name', { value: 'Alice' });
Reflect.deleteProperty(obj, 'name');
Reflect.has(obj, 'name');
```

**3. 返回布尔值**
```javascript
// Object 方法可能抛出错误
try {
  Object.defineProperty(obj, 'name', descriptor);
} catch (e) {
  // 处理错误
}

// Reflect 返回布尔值
if (Reflect.defineProperty(obj, 'name', descriptor)) {
  console.log('成功');
} else {
  console.log('失败');
}
```

**Reflect 与 Proxy 配合：**
```javascript
const proxy = new Proxy(obj, {
  get(target, prop, receiver) {
    console.log(`Getting ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  
  set(target, prop, value, receiver) {
    console.log(`Setting ${prop}`);
    return Reflect.set(target, prop, value, receiver);
  }
});
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** Proxy vs Object.defineProperty

### 题目

Proxy 可以直接监听数组的变化，而 Object.defineProperty 不行。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**Proxy 监听数组**

```javascript
const arr = [1, 2, 3];

const proxy = new Proxy(arr, {
  set(target, prop, value) {
    console.log(`Setting ${prop} = ${value}`);
    target[prop] = value;
    return true;
  }
});

proxy.push(4);  
// Setting 3 = 4
// Setting length = 4

proxy[0] = 10;
// Setting 0 = 10
```

**Object.defineProperty 的限制**

```javascript
const arr = [1, 2, 3];

// ❌ 无法监听数组方法
Object.defineProperty(arr, '0', {
  set(value) {
    console.log('Setting 0:', value);
  }
});

arr.push(4);  // 无法监听
arr[0] = 10;  // 可以监听

// Vue 2 的解决方案：重写数组方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
  .forEach(method => {
    arrayMethods[method] = function(...args) {
      console.log(`Array method ${method} called`);
      return arrayProto[method].apply(this, args);
    };
  });
```

**Proxy 的优势：**

```javascript
// 1. 监听数组所有操作
const arr = new Proxy([], {
  set(target, prop, value) {
    console.log(`Set ${prop} = ${value}`);
    target[prop] = value;
    return true;
  }
});

arr.push(1);     // Set 0 = 1, Set length = 1
arr[0] = 2;      // Set 0 = 2
arr.length = 0;  // Set length = 0

// 2. 监听新增属性
const obj = new Proxy({}, {
  set(target, prop, value) {
    console.log(`New property: ${prop}`);
    target[prop] = value;
    return true;
  }
});

obj.name = 'Alice';  // New property: name
obj.age = 25;        // New property: age
```

</details>

---

## 第 4 题 🟡

**类型：** 代码输出题  
**标签：** Proxy 陷阱

### 题目

以下代码的输出是什么？

```javascript
const obj = { count: 0 };

const proxy = new Proxy(obj, {
  get(target, prop) {
    return target[prop] + 1;
  }
});

console.log(proxy.count);
console.log(proxy.count);
```

**选项：**
- A. `0`, `0`
- B. `1`, `1`
- C. `1`, `2`
- D. `0`, `1`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**Proxy get 陷阱不修改原对象**

```javascript
const obj = { count: 0 };

const proxy = new Proxy(obj, {
  get(target, prop) {
    // 只是返回值 +1，不修改原对象
    return target[prop] + 1;
  }
});

console.log(proxy.count);  // 0 + 1 = 1
console.log(proxy.count);  // 0 + 1 = 1（count 仍是 0）

console.log(obj.count);    // 0（原对象未变）
```

**如果要递增：**

```javascript
const proxy = new Proxy(obj, {
  get(target, prop) {
    return target[prop]++;  // 先返回再递增
    // 或
    return ++target[prop];  // 先递增再返回
  }
});

console.log(proxy.count);  // 1
console.log(proxy.count);  // 2
console.log(obj.count);    // 2
```

**完整示例：**

```javascript
const obj = { count: 0 };

const proxy = new Proxy(obj, {
  get(target, prop) {
    console.log(`Getting ${prop}: ${target[prop]}`);
    return target[prop] + 1;
  },
  
  set(target, prop, value) {
    console.log(`Setting ${prop} = ${value}`);
    target[prop] = value;
    return true;
  }
});

console.log(proxy.count);  
// Getting count: 0
// 1

proxy.count = 5;
// Setting count = 5

console.log(proxy.count);
// Getting count: 5
// 6
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** Proxy 深层代理

### 题目

如何实现深层代理（嵌套对象的代理）？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**浅层代理的问题**

```javascript
const obj = {
  user: {
    name: 'Alice',
    address: {
      city: 'Beijing'
    }
  }
};

const proxy = new Proxy(obj, {
  get(target, prop) {
    console.log(`Get ${prop}`);
    return target[prop];
  }
});

proxy.user;             // Get user（触发）
proxy.user.name;        // Get user（不触发 name）
proxy.user.address.city; // Get user（不触发 address 和 city）
```

**深层代理实现**

```javascript
function deepProxy(obj, handler) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      
      // 如果是对象，递归代理
      if (typeof value === 'object' && value !== null) {
        return deepProxy(value, handler);
      }
      
      if (handler.get) {
        return handler.get(target, prop, receiver);
      }
      
      return value;
    },
    
    set(target, prop, value, receiver) {
      if (handler.set) {
        return handler.set(target, prop, value, receiver);
      }
      
      return Reflect.set(target, prop, value, receiver);
    }
  });
}

// 使用
const obj = {
  user: {
    name: 'Alice',
    address: {
      city: 'Beijing'
    }
  }
};

const proxy = deepProxy(obj, {
  get(target, prop) {
    console.log(`Get ${prop}`);
    return target[prop];
  },
  
  set(target, prop, value) {
    console.log(`Set ${prop} = ${value}`);
    target[prop] = value;
    return true;
  }
});

proxy.user.name;             // Get name
proxy.user.address.city;     // Get city
proxy.user.address.city = 'Shanghai';  // Set city = Shanghai
```

**优化：缓存代理对象**

```javascript
function deepProxy(obj, handler) {
  const proxyCache = new WeakMap();
  
  function createProxy(target) {
    if (typeof target !== 'object' || target === null) {
      return target;
    }
    
    if (proxyCache.has(target)) {
      return proxyCache.get(target);
    }
    
    const proxy = new Proxy(target, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        
        if (typeof value === 'object' && value !== null) {
          return createProxy(value);
        }
        
        if (handler.get) {
          return handler.get(target, prop, receiver);
        }
        
        return value;
      },
      
      set(target, prop, value, receiver) {
        if (handler.set) {
          return handler.set(target, prop, value, receiver);
        }
        
        return Reflect.set(target, prop, value, receiver);
      }
    });
    
    proxyCache.set(target, proxy);
    return proxy;
  }
  
  return createProxy(obj);
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码分析题  
**标签：** Proxy 撤销

### 题目

`Proxy.revocable()` 的作用是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**可撤销的代理**

```javascript
const target = { name: 'Alice' };

const { proxy, revoke } = Proxy.revocable(target, {
  get(target, prop) {
    return target[prop];
  }
});

console.log(proxy.name);  // "Alice"

// 撤销代理
revoke();

console.log(proxy.name);  // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

**实际应用：临时访问**

```javascript
class SecureData {
  constructor(data) {
    this.data = data;
  }
  
  // 创建临时访问
  createTemporaryAccess(duration = 5000) {
    const { proxy, revoke } = Proxy.revocable(this.data, {
      get(target, prop) {
        console.log(`Accessing ${prop}`);
        return target[prop];
      }
    });
    
    // 自动撤销
    setTimeout(revoke, duration);
    
    return proxy;
  }
}

// 使用
const secureData = new SecureData({ secret: 'password123' });
const temp = secureData.createTemporaryAccess(3000);

console.log(temp.secret);  // "password123"

setTimeout(() => {
  console.log(temp.secret);  // TypeError（已撤销）
}, 4000);
```

**应用：资源管理**

```javascript
class ResourceManager {
  constructor(resource) {
    this.resource = resource;
    this.proxies = new Set();
  }
  
  acquire() {
    const { proxy, revoke } = Proxy.revocable(this.resource, {});
    
    const handle = { proxy, revoke };
    this.proxies.add(handle);
    
    return handle;
  }
  
  release(handle) {
    handle.revoke();
    this.proxies.delete(handle);
  }
  
  releaseAll() {
    this.proxies.forEach(handle => handle.revoke());
    this.proxies.clear();
  }
}

// 使用
const manager = new ResourceManager({ data: 'sensitive' });

const handle1 = manager.acquire();
const handle2 = manager.acquire();

console.log(handle1.proxy.data);  // "sensitive"

manager.release(handle1);
// console.log(handle1.proxy.data);  // Error

manager.releaseAll();
// console.log(handle2.proxy.data);  // Error
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 元编程应用

### 题目

Proxy 可以用于以下哪些场景？

**选项：**
- A. 数据校验
- B. 属性访问日志
- C. 实现观察者模式
- D. 隐藏私有属性

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**A. 数据校验**

```javascript
function validate(obj, rules) {
  return new Proxy(obj, {
    set(target, prop, value) {
      if (prop in rules) {
        const rule = rules[prop];
        
        if (!rule(value)) {
          throw new Error(`Invalid value for ${prop}`);
        }
      }
      
      target[prop] = value;
      return true;
    }
  });
}

// 使用
const user = validate({}, {
  age: value => typeof value === 'number' && value >= 0,
  email: value => /^[\w.-]+@[\w.-]+\.\w+$/.test(value)
});

user.age = 25;      // ✅
user.age = -1;      // ❌ Error
user.email = 'a@b.c';  // ✅
user.email = 'invalid'; // ❌ Error
```

**B. 属性访问日志**

```javascript
function log(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      console.log(`[${new Date().toISOString()}] Read ${prop}`);
      return target[prop];
    },
    
    set(target, prop, value) {
      console.log(`[${new Date().toISOString()}] Write ${prop} = ${value}`);
      target[prop] = value;
      return true;
    }
  });
}

const user = log({ name: 'Alice' });
user.name;        // [2024-01-01T00:00:00.000Z] Read name
user.age = 25;    // [2024-01-01T00:00:00.001Z] Write age = 25
```

**C. 观察者模式**

```javascript
function observable(obj) {
  const observers = new Set();
  
  const proxy = new Proxy(obj, {
    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;
      
      // 通知观察者
      observers.forEach(observer => {
        observer(prop, value, oldValue);
      });
      
      return true;
    }
  });
  
  proxy.observe = (fn) => observers.add(fn);
  proxy.unobserve = (fn) => observers.delete(fn);
  
  return proxy;
}

// 使用
const user = observable({ name: 'Alice' });

user.observe((prop, newValue, oldValue) => {
  console.log(`${prop} changed from ${oldValue} to ${newValue}`);
});

user.name = 'Bob';  // name changed from Alice to Bob
```

**D. 隐藏私有属性**

```javascript
function hidePrivate(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop.startsWith('_')) {
        throw new Error(`Cannot access private property ${prop}`);
      }
      return target[prop];
    },
    
    set(target, prop, value) {
      if (prop.startsWith('_')) {
        throw new Error(`Cannot set private property ${prop}`);
      }
      target[prop] = value;
      return true;
    },
    
    has(target, prop) {
      if (prop.startsWith('_')) {
        return false;
      }
      return prop in target;
    },
    
    ownKeys(target) {
      return Object.keys(target).filter(key => !key.startsWith('_'));
    }
  });
}

// 使用
const obj = hidePrivate({
  name: 'Alice',
  _password: 'secret'
});

console.log(obj.name);      // "Alice"
console.log(obj._password); // Error
console.log('_password' in obj);  // false
console.log(Object.keys(obj));    // ['name']
```

</details>

---

## 第 8 题 🔴

**类型：** 代码实现题  
**标签：** Vue 响应式原理

### 题目

使用 Proxy 实现一个简化版的 Vue 3 响应式系统。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
// 依赖收集
let activeEffect = null;
const targetMap = new WeakMap();

function track(target, prop) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let deps = depsMap.get(prop);
  if (!deps) {
    depsMap.set(prop, (deps = new Set()));
  }
  
  deps.add(activeEffect);
}

function trigger(target, prop) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const deps = depsMap.get(prop);
  if (!deps) return;
  
  deps.forEach(effect => effect());
}

// 创建响应式对象
function reactive(target) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      
      // 收集依赖
      track(target, prop);
      
      // 嵌套对象递归代理
      if (typeof value === 'object' && value !== null) {
        return reactive(value);
      }
      
      return value;
    },
    
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      
      // 触发更新
      trigger(target, prop);
      
      return result;
    }
  });
}

// 副作用函数
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 计算属性
function computed(getter) {
  let value;
  let dirty = true;
  
  const effectFn = effect(() => {
    value = getter();
    dirty = false;
  });
  
  return {
    get value() {
      if (dirty) {
        effectFn();
      }
      return value;
    }
  };
}

// 使用示例
const state = reactive({
  count: 0,
  user: {
    name: 'Alice'
  }
});

// 自动追踪依赖
effect(() => {
  console.log('Count:', state.count);
});
// Count: 0

state.count++;
// Count: 1

// 计算属性
const double = computed(() => state.count * 2);
console.log(double.value);  // 2

state.count = 5;
console.log(double.value);  // 10

// 嵌套对象响应式
effect(() => {
  console.log('Name:', state.user.name);
});
// Name: Alice

state.user.name = 'Bob';
// Name: Bob
```

**完整版实现：**

```javascript
class ReactiveSystem {
  constructor() {
    this.activeEffect = null;
    this.targetMap = new WeakMap();
  }
  
  reactive(target) {
    if (typeof target !== 'object' || target === null) {
      return target;
    }
    
    return new Proxy(target, {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver);
        this.track(target, prop);
        
        if (typeof value === 'object' && value !== null) {
          return this.reactive(value);
        }
        
        return value;
      },
      
      set: (target, prop, value, receiver) => {
        const oldValue = target[prop];
        const result = Reflect.set(target, prop, value, receiver);
        
        if (oldValue !== value) {
          this.trigger(target, prop);
        }
        
        return result;
      }
    });
  }
  
  track(target, prop) {
    if (!this.activeEffect) return;
    
    let depsMap = this.targetMap.get(target);
    if (!depsMap) {
      this.targetMap.set(target, (depsMap = new Map()));
    }
    
    let deps = depsMap.get(prop);
    if (!deps) {
      depsMap.set(prop, (deps = new Set()));
    }
    
    deps.add(this.activeEffect);
  }
  
  trigger(target, prop) {
    const depsMap = this.targetMap.get(target);
    if (!depsMap) return;
    
    const deps = depsMap.get(prop);
    if (!deps) return;
    
    deps.forEach(effect => effect());
  }
  
  effect(fn) {
    this.activeEffect = fn;
    fn();
    this.activeEffect = null;
  }
  
  computed(getter) {
    let value;
    let dirty = true;
    
    const runner = () => {
      this.activeEffect = () => {
        value = getter();
        dirty = false;
      };
      this.activeEffect();
      this.activeEffect = null;
    };
    
    runner();
    
    return {
      get value() {
        if (dirty) {
          runner();
        }
        return value;
      }
    };
  }
  
  watch(source, callback) {
    this.effect(() => {
      const value = typeof source === 'function' ? source() : source;
      callback(value);
    });
  }
}

// 使用
const system = new ReactiveSystem();
const state = system.reactive({ count: 0 });

system.effect(() => {
  console.log('Count:', state.count);
});

state.count++;  // Count: 1
```

</details>

---

## 第 9 题 🔴

**类型：** 代码分析题  
**标签：** Reflect 接收器

### 题目

Reflect 方法的第三个参数 `receiver` 的作用是什么？

<details>
<summary>查看答案</summary>

### ✅ 答案与解析

**receiver 参数的作用**

`receiver` 指定访问器属性的 `this` 绑定。

```javascript
const obj = {
  _name: 'Alice',
  
  get name() {
    return this._name;
  },
  
  set name(value) {
    this._name = value;
  }
};

const proxy = new Proxy(obj, {
  get(target, prop, receiver) {
    console.log('Get:', prop);
    // 使用 receiver 作为 this
    return Reflect.get(target, prop, receiver);
  }
});

// 继承的情况
const child = Object.create(proxy);
child._name = 'Bob';

console.log(child.name);  
// Get: name
// "Bob"（而不是 "Alice"）
```

**不使用 receiver 的问题：**

```javascript
const proxy = new Proxy(obj, {
  get(target, prop) {
    console.log('Get:', prop);
    // 不传 receiver，this 指向 target
    return target[prop];
  }
});

const child = Object.create(proxy);
child._name = 'Bob';

console.log(child.name);
// Get: name
// "Alice"（错误！应该是 "Bob"）
```

**完整示例：**

```javascript
const parent = {
  _value: 'parent',
  
  get value() {
    console.log('Getter called, this._value:', this._value);
    return this._value;
  }
};

const proxy = new Proxy(parent, {
  get(target, prop, receiver) {
    console.log(`Proxy get: ${prop}`);
    
    // 传递 receiver，确保 this 正确
    return Reflect.get(target, prop, receiver);
  }
});

const child = Object.create(proxy);
child._value = 'child';

console.log(child.value);
// Proxy get: value
// Getter called, this._value: child
// "child"
```

**set 中的 receiver：**

```javascript
const obj = {
  _value: 0,
  
  set value(v) {
    console.log('Setter called, this:', this);
    this._value = v;
  }
};

const proxy = new Proxy(obj, {
  set(target, prop, value, receiver) {
    console.log('Proxy set:', prop);
    
    // 传递 receiver，确保 this 正确
    return Reflect.set(target, prop, value, receiver);
  }
});

const child = Object.create(proxy);

child.value = 10;
// Proxy set: value
// Setter called, this: child
// child._value = 10（而不是 obj._value）
```

</details>

---

## 第 10 题 🔴

**类型：** 综合题  
**标签：** 元编程实践

### 题目

实现一个支持链式调用的查询构建器（使用 Proxy）。

<details>
<summary>查看答案</summary>

### ✅ 实现方案

```javascript
class QueryBuilder {
  constructor() {
    this.conditions = [];
    this.selectFields = [];
    this.orderFields = [];
    this.limitValue = null;
    
    return new Proxy(this, {
      get(target, prop) {
        // 如果是已有方法，返回
        if (prop in target) {
          return target[prop];
        }
        
        // 动态生成 where 方法
        if (prop.startsWith('where')) {
          const field = prop.slice(5).toLowerCase();
          return (value) => {
            target.conditions.push({ field, value });
            return target;
          };
        }
        
        // 动态生成 orderBy 方法
        if (prop.startsWith('orderBy')) {
          const field = prop.slice(7).toLowerCase();
          return (direction = 'asc') => {
            target.orderFields.push({ field, direction });
            return target;
          };
        }
        
        return target[prop];
      }
    });
  }
  
  select(...fields) {
    this.selectFields = fields;
    return this;
  }
  
  limit(n) {
    this.limitValue = n;
    return this;
  }
  
  build() {
    let sql = 'SELECT ';
    
    // SELECT
    sql += this.selectFields.length > 0 
      ? this.selectFields.join(', ')
      : '*';
    
    sql += ' FROM table';
    
    // WHERE
    if (this.conditions.length > 0) {
      sql += ' WHERE ';
      sql += this.conditions
        .map(({ field, value }) => `${field} = '${value}'`)
        .join(' AND ');
    }
    
    // ORDER BY
    if (this.orderFields.length > 0) {
      sql += ' ORDER BY ';
      sql += this.orderFields
        .map(({ field, direction }) => `${field} ${direction.toUpperCase()}`)
        .join(', ');
    }
    
    // LIMIT
    if (this.limitValue !== null) {
      sql += ` LIMIT ${this.limitValue}`;
    }
    
    return sql;
  }
}

// 使用
const query = new QueryBuilder();

const sql = query
  .select('id', 'name', 'age')
  .whereName('Alice')
  .whereAge(25)
  .orderByName('desc')
  .orderByAge('asc')
  .limit(10)
  .build();

console.log(sql);
// SELECT id, name, age FROM table 
// WHERE name = 'Alice' AND age = '25' 
// ORDER BY name DESC, age ASC 
// LIMIT 10
```

**扩展：支持复杂查询**

```javascript
class AdvancedQueryBuilder {
  constructor(table) {
    this.table = table;
    this.query = {
      select: [],
      where: [],
      join: [],
      orderBy: [],
      groupBy: [],
      having: [],
      limit: null,
      offset: null
    };
    
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        
        // where{Field}
        if (prop.startsWith('where')) {
          const field = prop.slice(5);
          return target.createWhereMethod(field);
        }
        
        return undefined;
      }
    });
  }
  
  createWhereMethod(field) {
    return (operator, value) => {
      if (arguments.length === 1) {
        value = operator;
        operator = '=';
      }
      
      this.query.where.push({
        field: field.toLowerCase(),
        operator,
        value
      });
      
      return this;
    };
  }
  
  select(...fields) {
    this.query.select.push(...fields);
    return this;
  }
  
  join(table, condition) {
    this.query.join.push({ table, condition });
    return this;
  }
  
  orderBy(field, direction = 'asc') {
    this.query.orderBy.push({ field, direction });
    return this;
  }
  
  groupBy(...fields) {
    this.query.groupBy.push(...fields);
    return this;
  }
  
  having(condition) {
    this.query.having.push(condition);
    return this;
  }
  
  limit(n) {
    this.query.limit = n;
    return this;
  }
  
  offset(n) {
    this.query.offset = n;
    return this;
  }
  
  build() {
    const parts = [];
    
    // SELECT
    parts.push('SELECT');
    parts.push(this.query.select.length > 0 
      ? this.query.select.join(', ')
      : '*');
    
    // FROM
    parts.push('FROM', this.table);
    
    // JOIN
    if (this.query.join.length > 0) {
      this.query.join.forEach(({ table, condition }) => {
        parts.push(`JOIN ${table} ON ${condition}`);
      });
    }
    
    // WHERE
    if (this.query.where.length > 0) {
      parts.push('WHERE');
      parts.push(
        this.query.where
          .map(({ field, operator, value }) => 
            `${field} ${operator} '${value}'`
          )
          .join(' AND ')
      );
    }
    
    // GROUP BY
    if (this.query.groupBy.length > 0) {
      parts.push('GROUP BY', this.query.groupBy.join(', '));
    }
    
    // HAVING
    if (this.query.having.length > 0) {
      parts.push('HAVING', this.query.having.join(' AND '));
    }
    
    // ORDER BY
    if (this.query.orderBy.length > 0) {
      parts.push('ORDER BY');
      parts.push(
        this.query.orderBy
          .map(({ field, direction }) => `${field} ${direction.toUpperCase()}`)
          .join(', ')
      );
    }
    
    // LIMIT
    if (this.query.limit !== null) {
      parts.push('LIMIT', this.query.limit);
    }
    
    // OFFSET
    if (this.query.offset !== null) {
      parts.push('OFFSET', this.query.offset);
    }
    
    return parts.join(' ');
  }
}

// 使用
const query = new AdvancedQueryBuilder('users');

const sql = query
  .select('users.id', 'users.name', 'COUNT(orders.id) as order_count')
  .join('orders', 'users.id = orders.user_id')
  .whereName('Alice')
  .whereAge('>', 18)
  .groupBy('users.id')
  .having('COUNT(orders.id) > 5')
  .orderBy('order_count', 'desc')
  .limit(10)
  .offset(20)
  .build();

console.log(sql);
```

</details>

---

**本章总结：**
- ✅ Proxy 13 种拦截操作
- ✅ Reflect API 规范化
- ✅ Proxy vs defineProperty
- ✅ Proxy 陷阱机制
- ✅ 深层代理实现
- ✅ Proxy 撤销机制
- ✅ 元编程应用场景
- ✅ Vue 响应式原理
- ✅ Reflect receiver 参数
- ✅ 链式调用构建器

**下一章：** [第 21 章：内存管理与垃圾回收](./chapter-21.md)
