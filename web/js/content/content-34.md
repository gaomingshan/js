# 装饰器提案

> 了解 JavaScript 装饰器的最新进展

---

## 概述

装饰器（Decorator）是一种特殊的声明，可以附加到类、方法、访问器、属性或参数上，用于修改其行为。装饰器目前处于 Stage 3 提案阶段。

本章将深入：
- 装饰器基础
- 类装饰器
- 方法装饰器
- 访问器装饰器
- 实际应用

---

## 1. 装饰器基础

### 1.1 基本概念

```javascript
// 装饰器是一个函数，接收被装饰的目标
function log(target, context) {
  console.log('装饰:', target, context.name);
}

class MyClass {
  @log
  method() {}
}

// 注意：装饰器语法需要 Babel 或 TypeScript 转译
```

### 1.2 装饰器签名

```javascript
// 类装饰器
function classDecorator(target, context) {
  // target: 类构造函数
  // context: { kind: 'class', name: string }
}

// 方法装饰器
function methodDecorator(target, context) {
  // target: 原方法
  // context: { kind: 'method', name: string, access, static, private }
}

// 访问器装饰器
function accessorDecorator(target, context) {
  // target: { get, set }
  // context: { kind: 'getter'/'setter', ... }
}

// 字段装饰器
function fieldDecorator(target, context) {
  // target: undefined（初始化时）
  // context: { kind: 'field', ... }
}
```

---

## 2. 类装饰器

### 2.1 基本用法

```javascript
function logged(target, context) {
  console.log(`类 ${context.name} 被创建`);
}

@logged
class User {
  constructor(name) {
    this.name = name;
  }
}

// 输出：类 User 被创建
```

### 2.2 添加属性和方法

```javascript
function timestamped(target, context) {
  target.prototype.createdAt = Date.now();
  
  target.prototype.getAge = function() {
    return Date.now() - this.createdAt;
  };
}

@timestamped
class User {
  constructor(name) {
    this.name = name;
  }
}

const user = new User('Alice');
setTimeout(() => {
  console.log('创建于', user.getAge(), 'ms前');
}, 100);
```

### 2.3 类混入

```javascript
function mixin(...mixins) {
  return function(target, context) {
    Object.assign(target.prototype, ...mixins);
  };
}

const LoggableMixin = {
  log(message) {
    console.log(`[${this.constructor.name}]`, message);
  }
};

const EventEmitterMixin = {
  emit(event, data) {
    console.log('事件:', event, data);
  }
};

@mixin(LoggableMixin, EventEmitterMixin)
class Component {
  constructor(name) {
    this.name = name;
  }
}

const comp = new Component('MyComponent');
comp.log('初始化');  // [Component] 初始化
comp.emit('click', { x: 10 });  // 事件: click { x: 10 }
```

---

## 3. 方法装饰器

### 3.1 日志装饰器

```javascript
function log(target, context) {
  const methodName = context.name;
  
  return function(...args) {
    console.log(`调用 ${methodName}(${args.join(', ')})`);
    const result = target.apply(this, args);
    console.log(`返回 ${result}`);
    return result;
  };
}

class Calculator {
  @log
  add(a, b) {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
// 调用 add(2, 3)
// 返回 5
```

### 3.2 性能监控

```javascript
function measure(target, context) {
  return function(...args) {
    const start = performance.now();
    const result = target.apply(this, args);
    const end = performance.now();
    console.log(`${context.name} 耗时 ${end - start}ms`);
    return result;
  };
}

class DataProcessor {
  @measure
  process(data) {
    // 耗时操作
    return data.map(x => x * 2);
  }
}
```

### 3.3 防抖装饰器

```javascript
function debounce(delay) {
  return function(target, context) {
    let timer;
    
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        target.apply(this, args);
      }, delay);
    };
  };
}

class SearchBox {
  @debounce(300)
  search(query) {
    console.log('搜索:', query);
    // 发送请求
  }
}
```

### 3.4 权限检查

```javascript
function requireAuth(target, context) {
  return function(...args) {
    if (!this.isAuthenticated) {
      throw new Error('需要登录');
    }
    return target.apply(this, args);
  };
}

class UserService {
  constructor() {
    this.isAuthenticated = false;
  }
  
  @requireAuth
  deleteAccount() {
    console.log('删除账户');
  }
}

const service = new UserService();
service.deleteAccount();  // Error: 需要登录
```

---

## 4. 访问器装饰器

### 4.1 getter/setter 装饰器

```javascript
function validate(target, context) {
  if (context.kind === 'setter') {
    return function(value) {
      if (typeof value !== 'number') {
        throw new TypeError('必须是数字');
      }
      target.call(this, value);
    };
  }
  return target;
}

class Person {
  #age = 0;
  
  get age() {
    return this.#age;
  }
  
  @validate
  set age(value) {
    this.#age = value;
  }
}

const person = new Person();
person.age = 25;     // ✅
person.age = '25';   // ❌ TypeError
```

### 4.2 只读属性

```javascript
function readonly(target, context) {
  if (context.kind === 'setter') {
    return function() {
      throw new Error('属性是只读的');
    };
  }
  return target;
}

class Config {
  #apiUrl = 'https://api.example.com';
  
  get apiUrl() {
    return this.#apiUrl;
  }
  
  @readonly
  set apiUrl(value) {
    this.#apiUrl = value;
  }
}

const config = new Config();
console.log(config.apiUrl);  // "https://api.example.com"
config.apiUrl = 'new-url';   // Error: 属性是只读的
```

---

## 5. 字段装饰器

### 5.1 默认值

```javascript
function defaultValue(value) {
  return function(target, context) {
    return function(initialValue) {
      return initialValue ?? value;
    };
  };
}

class User {
  @defaultValue('Guest')
  name;
  
  @defaultValue(0)
  age;
}

const user = new User();
console.log(user.name);  // "Guest"
console.log(user.age);   // 0
```

### 5.2 类型检查

```javascript
function type(expectedType) {
  return function(target, context) {
    return function(initialValue) {
      if (initialValue !== undefined && typeof initialValue !== expectedType) {
        throw new TypeError(`${context.name} 必须是 ${expectedType}`);
      }
      return initialValue;
    };
  };
}

class Product {
  @type('string')
  name;
  
  @type('number')
  price;
}

const product = new Product();
product.name = 'Book';    // ✅
product.price = 29.99;    // ✅
product.price = 'free';   // ❌ TypeError
```

---

## 6. 装饰器组合

### 6.1 多个装饰器

```javascript
function first(target, context) {
  console.log('第一个装饰器');
  return target;
}

function second(target, context) {
  console.log('第二个装饰器');
  return target;
}

class MyClass {
  @first
  @second
  method() {}
}

// 执行顺序：从下到上
// 输出：
// 第二个装饰器
// 第一个装饰器
```

### 6.2 装饰器工厂

```javascript
function repeat(times) {
  return function(target, context) {
    return function(...args) {
      for (let i = 0; i < times; i++) {
        target.apply(this, args);
      }
    };
  };
}

function delay(ms) {
  return function(target, context) {
    return async function(...args) {
      await new Promise(resolve => setTimeout(resolve, ms));
      return target.apply(this, args);
    };
  };
}

class Animation {
  @delay(1000)
  @repeat(3)
  flash() {
    console.log('Flash!');
  }
}
```

---

## 7. 实际应用

### 7.1 依赖注入

```javascript
const services = new Map();

function injectable(target, context) {
  services.set(context.name, target);
}

function inject(serviceName) {
  return function(target, context) {
    return function() {
      return services.get(serviceName);
    };
  };
}

@injectable
class UserService {
  getUsers() {
    return ['Alice', 'Bob'];
  }
}

class UserController {
  @inject('UserService')
  userService;
  
  list() {
    return this.userService.getUsers();
  }
}
```

### 7.2 缓存装饰器

```javascript
function cached(target, context) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('从缓存返回');
      return cache.get(key);
    }
    
    const result = target.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

class API {
  @cached
  async fetchUser(id) {
    console.log('从服务器获取:', id);
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
}
```

### 7.3 事件监听

```javascript
function on(event) {
  return function(target, context) {
    return function(...args) {
      console.log(`事件 ${event} 触发`);
      return target.apply(this, args);
    };
  };
}

class Button {
  @on('click')
  handleClick(e) {
    console.log('按钮被点击');
  }
  
  @on('hover')
  handleHover(e) {
    console.log('鼠标悬停');
  }
}
```

---

## 8. 使用装饰器

### 8.1 Babel 配置

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", {
      "version": "2023-05"
    }]
  ]
}
```

### 8.2 TypeScript 配置

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## 关键要点

1. **装饰器类型**
   - 类装饰器
   - 方法装饰器
   - 访问器装饰器
   - 字段装饰器

2. **常用场景**
   - 日志记录
   - 性能监控
   - 权限检查
   - 缓存

3. **装饰器组合**
   - 多个装饰器
   - 装饰器工厂
   - 执行顺序

4. **实际应用**
   - 依赖注入
   - 事件监听
   - 数据验证
   - 缓存

5. **注意事项**
   - 目前是提案阶段
   - 需要转译器支持
   - 执行顺序很重要

---

## 参考资料

- [TC39 Decorator Proposal](https://github.com/tc39/proposal-decorators)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)

---

**上一章**：[Symbol 与元编程](./content-33.md)  
**下一章**：[模块化与工程实践](./content-35.md)
