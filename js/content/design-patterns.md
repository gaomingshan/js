# JavaScript 设计模式

## 概述

设计模式是解决常见问题的经典方案，掌握设计模式可以提升代码质量和可维护性。

---

## 一、创建型模式

### 1.1 单例模式（Singleton）

确保一个类只有一个实例，并提供全局访问点。

```js
class Database {
  static instance;

  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = 'connected';
    Database.instance = this;
  }

  query(sql) {
    return `Executing: ${sql}`;
  }
}

const db1 = new Database();
const db2 = new Database();
console.log(db1 === db2);  // true
```

### 1.2 工厂模式（Factory）

创建对象的接口，让子类决定实例化哪个类。

```js
class UserFactory {
  static createUser(type) {
    switch (type) {
      case 'admin':
        return new AdminUser();
      case 'guest':
        return new GuestUser();
      default:
        return new RegularUser();
    }
  }
}

class AdminUser {
  constructor() {
    this.role = 'admin';
    this.permissions = ['read', 'write', 'delete'];
  }
}

class GuestUser {
  constructor() {
    this.role = 'guest';
    this.permissions = ['read'];
  }
}

const admin = UserFactory.createUser('admin');
```

### 1.3 建造者模式（Builder）

分步骤创建复杂对象。

```js
class QueryBuilder {
  constructor() {
    this.query = {};
  }

  select(fields) {
    this.query.fields = fields;
    return this;
  }

  from(table) {
    this.query.table = table;
    return this;
  }

  where(conditions) {
    this.query.conditions = conditions;
    return this;
  }

  build() {
    return `SELECT ${this.query.fields} FROM ${this.query.table} WHERE ${this.query.conditions}`;
  }
}

const sql = new QueryBuilder()
  .select('name, age')
  .from('users')
  .where('age > 18')
  .build();
```

---

## 二、结构型模式

### 2.1 装饰器模式（Decorator）

动态地给对象添加职责。

```js
// 使用装饰器语法
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function log(target, key, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`Calling ${key} with`, args);
    return original.apply(this, args);
  };
  return descriptor;
}

class User {
  @readonly
  id = 1;

  @log
  setName(name) {
    this.name = name;
  }
}
```

### 2.2 代理模式（Proxy）

为对象提供代理以控制访问。

```js
const target = {
  name: 'Alice',
  age: 25
};

const proxy = new Proxy(target, {
  get(obj, prop) {
    console.log(`访问属性: ${prop}`);
    return obj[prop];
  },

  set(obj, prop, value) {
    console.log(`设置属性: ${prop} = ${value}`);
    obj[prop] = value;
    return true;
  }
});

proxy.name;  // 访问属性: name
proxy.age = 26;  // 设置属性: age = 26
```

### 2.3 适配器模式（Adapter）

将一个接口转换成客户希望的另一个接口。

```js
// 旧的 API
class OldAPI {
  getData() {
    return { data: [1, 2, 3] };
  }
}

// 适配器
class APIAdapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }

  fetchData() {
    const result = this.oldAPI.getData();
    return result.data;
  }
}

const adapter = new APIAdapter(new OldAPI());
const data = adapter.fetchData();  // [1, 2, 3]
```

---

## 三、行为型模式

### 3.1 观察者模式（Observer）

定义对象间的一对多依赖，当一个对象状态改变时，所有依赖者都会收到通知。

```js
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    (this.events[event] = this.events[event] || []).push(callback);
    return this;
  }

  emit(event, ...args) {
    (this.events[event] || []).forEach(cb => cb(...args));
    return this;
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    return this;
  }
}

const emitter = new EventEmitter();

emitter.on('login', (user) => {
  console.log(`用户 ${user} 登录`);
});

emitter.on('login', (user) => {
  console.log(`欢迎 ${user}！`);
});

emitter.emit('login', 'Alice');
```

### 3.2 策略模式（Strategy）

定义一系列算法，把它们封装起来，并且使它们可以相互替换。

```js
// 策略
const strategies = {
  credit: (amount) => amount * 1.05,
  debit: (amount) => amount,
  paypal: (amount) => amount * 1.03
};

class PaymentContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  pay(amount) {
    return strategies[this.strategy](amount);
  }
}

const payment = new PaymentContext('credit');
const total = payment.pay(100);  // 105
```

### 3.3 命令模式（Command）

将请求封装成对象，从而使你可用不同的请求对客户进行参数化。

```js
class Command {
  constructor(receiver) {
    this.receiver = receiver;
  }

  execute() {}
  undo() {}
}

class CopyCommand extends Command {
  execute() {
    this.receiver.copy();
  }

  undo() {
    this.receiver.paste();
  }
}

class Editor {
  copy() {
    console.log('复制');
  }

  paste() {
    console.log('粘贴');
  }
}

const editor = new Editor();
const copy = new CopyCommand(editor);
copy.execute();  // 复制
copy.undo();     // 粘贴
```

### 3.4 职责链模式（Chain of Responsibility）

为请求创建一个接收者对象链。

```js
class Handler {
  constructor() {
    this.next = null;
  }

  setNext(handler) {
    this.next = handler;
    return handler;
  }

  handle(request) {
    if (this.next) {
      return this.next.handle(request);
    }
    return null;
  }
}

class AuthHandler extends Handler {
  handle(request) {
    if (!request.auth) {
      return 'Unauthorized';
    }
    return super.handle(request);
  }
}

class ValidationHandler extends Handler {
  handle(request) {
    if (!request.valid) {
      return 'Invalid';
    }
    return super.handle(request);
  }
}

const auth = new AuthHandler();
const validation = new ValidationHandler();
auth.setNext(validation);

const result = auth.handle({ auth: true, valid: true });
```

---

## 四、JavaScript 特有模式

### 4.1 模块模式

使用闭包创建私有作用域。

```js
const counterModule = (function() {
  let count = 0;  // 私有变量

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getCount() {
      return count;
    }
  };
})();

counterModule.increment();  // 1
counterModule.getCount();   // 1
```

### 4.2 发布-订阅模式

更松耦合的观察者模式变体。

```js
class PubSub {
  constructor() {
    this.subscribers = {};
  }

  subscribe(event, callback) {
    (this.subscribers[event] = this.subscribers[event] || []).push(callback);
  }

  publish(event, data) {
    (this.subscribers[event] || []).forEach(cb => cb(data));
  }

  unsubscribe(event, callback) {
    if (!this.subscribers[event]) return;
    this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
  }
}

const pubsub = new PubSub();
pubsub.subscribe('update', (data) => console.log(data));
pubsub.publish('update', { message: 'Hello' });
```

### 4.3 Mixin 模式

将多个对象的功能混合到一个对象中。

```js
const canFly = {
  fly() {
    console.log('Flying');
  }
};

const canSwim = {
  swim() {
    console.log('Swimming');
  }
};

class Duck {}

Object.assign(Duck.prototype, canFly, canSwim);

const duck = new Duck();
duck.fly();   // Flying
duck.swim();  // Swimming
```

---

## 五、最佳实践

1. **选择合适的模式**：不要为了用模式而用模式。
2. **保持简单**：优先考虑代码的可读性和维护性。
3. **适应 JavaScript**：利用 JavaScript 的特性（闭包、原型等）。
4. **组合优于继承**：使用组合和 Mixin 而非深层继承。
5. **测试驱动**：设计模式应该使代码更易测试。

---

## 参考资料

- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [Learning JavaScript Design Patterns](https://www.patterns.dev/posts/classic-design-patterns/)
