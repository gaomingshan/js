# this 绑定机制

> 彻底理解 this 的绑定规则，避免 this 丢失

---

## 概述

`this` 是 JavaScript 中最容易混淆的概念之一。与其他语言不同，JavaScript 的 `this` 不是在编译时确定，而是在运行时根据调用方式动态绑定。

本章将深入：
- this 的四种绑定规则
- 绑定优先级
- 箭头函数的 this 特性
- call、apply、bind 的原理与实现
- 工程中的 this 陷阱与最佳实践

---

## 1. this 的本质

### 1.1 this 不是什么

**误解 1**：this 指向函数本身 ❌

```javascript
function foo() {
  this.count = 0;  // this 不是指向 foo
}

foo.count = 0;
foo();
console.log(foo.count);  // 0（未改变）
```

**误解 2**：this 指向函数的作用域 ❌

```javascript
function foo() {
  var a = 2;
  this.bar();  // this 不是指向 foo 的作用域
}

function bar() {
  console.log(this.a);
}

foo();  // undefined 或报错
```

### 1.2 this 是什么

**定义**：this 是函数执行时的上下文对象，由调用位置决定。

```javascript
function identify() {
  return this.name;
}

const obj1 = { name: "obj1" };
const obj2 = { name: "obj2" };

console.log(identify.call(obj1));  // "obj1"
console.log(identify.call(obj2));  // "obj2"
```

**关键点**：
- this 在**运行时**绑定
- 取决于**调用方式**，而非定义位置
- 与词法作用域（静态）相反，是动态作用域

---

## 2. 四种绑定规则

### 2.1 默认绑定

**规则**：独立函数调用，this 绑定到全局对象（非严格模式）或 undefined（严格模式）。

```javascript
// 非严格模式
function foo() {
  console.log(this.a);
}

var a = 2;
foo();  // 2（this 指向 window，window.a = 2）

// 严格模式
function bar() {
  "use strict";
  console.log(this.a);
}

bar();  // TypeError: Cannot read property 'a' of undefined
```

**判断标准**：无任何修饰的函数引用调用。

```javascript
function foo() {
  console.log(this.a);
}

var a = 2;

(function() {
  "use strict";
  foo();  // 2（foo 内部不是严格模式）
})();

function bar() {
  console.log(this.a);
}

(function() {
  bar();  // 2（bar 的调用位置不在严格模式中）
})();
```

### 2.2 隐式绑定

**规则**：函数作为对象方法调用，this 绑定到该对象。

```javascript
function foo() {
  console.log(this.a);
}

const obj = {
  a: 2,
  foo: foo
};

obj.foo();  // 2（this 指向 obj）
```

**多层嵌套**

```javascript
function foo() {
  console.log(this.a);
}

const obj2 = {
  a: 42,
  foo: foo
};

const obj1 = {
  a: 2,
  obj2: obj2
};

obj1.obj2.foo();  // 42（this 指向最后一层对象 obj2）
```

**隐式丢失**

```javascript
function foo() {
  console.log(this.a);
}

const obj = {
  a: 2,
  foo: foo
};

// 丢失 1：赋值
const bar = obj.foo;  // 函数引用
var a = "global";
bar();  // "global"（this 指向全局）

// 丢失 2：回调
setTimeout(obj.foo, 100);  // "global"（this 指向全局）

// 丢失 3：传参
function doFoo(fn) {
  fn();  // 独立调用
}
doFoo(obj.foo);  // "global"
```

### 2.3 显式绑定

**规则**：使用 `call`、`apply`、`bind` 显式指定 this。

**call**

```javascript
function foo() {
  console.log(this.a);
}

const obj = { a: 2 };

foo.call(obj);  // 2（this 显式绑定到 obj）

// 语法：fn.call(thisArg, arg1, arg2, ...)
function sum(b, c) {
  return this.a + b + c;
}

const obj = { a: 1 };
console.log(sum.call(obj, 2, 3));  // 6
```

**apply**

```javascript
// 语法：fn.apply(thisArg, [argsArray])
function sum(b, c) {
  return this.a + b + c;
}

const obj = { a: 1 };
console.log(sum.apply(obj, [2, 3]));  // 6
```

**bind**

```javascript
// 语法：fn.bind(thisArg, arg1, arg2, ...)
// 返回新函数，this 永久绑定

function foo() {
  console.log(this.a);
}

const obj = { a: 2 };
const bar = foo.bind(obj);

bar();  // 2
setTimeout(bar, 100);  // 2（不会丢失）
```

**硬绑定模式**

```javascript
// 手动实现硬绑定
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}

const obj = { a: 2 };

const bar = function() {
  return foo.apply(obj, arguments);
};

const result = bar(3);  // 2, 3
console.log(result);    // 5
```

### 2.4 new 绑定

**规则**：使用 new 调用函数，this 绑定到新创建的对象。

```javascript
function Foo(a) {
  this.a = a;
}

const bar = new Foo(2);
console.log(bar.a);  // 2（this 绑定到 bar）
```

**new 的执行过程**

```javascript
function myNew(constructor, ...args) {
  // 1. 创建新对象
  const obj = Object.create(constructor.prototype);
  
  // 2. 绑定 this 并执行构造函数
  const result = constructor.apply(obj, args);
  
  // 3. 返回对象
  return result instanceof Object ? result : obj;
}

function Foo(a) {
  this.a = a;
}

const bar = myNew(Foo, 2);
console.log(bar.a);  // 2
```

---

## 3. 绑定优先级

### 3.1 优先级顺序

**new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定**

### 3.2 测试优先级

**显式绑定 vs 隐式绑定**

```javascript
function foo() {
  console.log(this.a);
}

const obj1 = { a: 2, foo: foo };
const obj2 = { a: 3, foo: foo };

obj1.foo();  // 2（隐式绑定）
obj1.foo.call(obj2);  // 3（显式绑定优先）
```

**new 绑定 vs 隐式绑定**

```javascript
function foo(something) {
  this.a = something;
}

const obj1 = { foo: foo };
obj1.foo(2);
console.log(obj1.a);  // 2

const bar = new obj1.foo(4);
console.log(obj1.a);  // 2（obj1 不变）
console.log(bar.a);   // 4（new 绑定优先）
```

**new 绑定 vs 显式绑定（bind）**

```javascript
function foo(something) {
  this.a = something;
}

const obj1 = { a: 1 };

const bar = foo.bind(obj1);
bar(2);
console.log(obj1.a);  // 2

const baz = new bar(3);
console.log(obj1.a);  // 2（obj1 不变）
console.log(baz.a);   // 3（new 绑定优先于 bind）
```

### 3.3 判断 this 的流程

```
1. 函数是否在 new 中调用？
   → 是：this 绑定到新对象
   
2. 函数是否通过 call、apply、bind 调用？
   → 是：this 绑定到指定对象
   
3. 函数是否在某个上下文对象中调用（隐式绑定）？
   → 是：this 绑定到该上下文对象
   
4. 都不是：
   → 严格模式：this = undefined
   → 非严格模式：this = 全局对象
```

---

## 4. 箭头函数的 this

### 4.1 箭头函数的特性

**不绑定 this**：箭头函数没有自己的 this，继承外层作用域的 this。

```javascript
function foo() {
  return () => {
    console.log(this.a);
  };
}

const obj1 = { a: 2 };
const obj2 = { a: 3 };

const bar = foo.call(obj1);
bar.call(obj2);  // 2（而非 3，this 继承 foo 的 this）
```

### 4.2 常见用途

**解决回调中的 this 丢失**

```javascript
// ❌ 传统方法
function Timer() {
  this.seconds = 0;
  
  setInterval(function() {
    this.seconds++;  // this 指向 window/undefined
  }, 1000);
}

// ✅ 箭头函数
function Timer() {
  this.seconds = 0;
  
  setInterval(() => {
    this.seconds++;  // this 继承 Timer 的 this
  }, 1000);
}

// ✅ bind 方案
function Timer() {
  this.seconds = 0;
  
  setInterval(function() {
    this.seconds++;
  }.bind(this), 1000);
}

// ✅ self/that 方案
function Timer() {
  this.seconds = 0;
  const self = this;
  
  setInterval(function() {
    self.seconds++;
  }, 1000);
}
```

**对象方法中的回调**

```javascript
const obj = {
  items: [1, 2, 3],
  multiplier: 2,
  
  // ❌ 传统方法
  processItems: function() {
    return this.items.map(function(item) {
      return item * this.multiplier;  // this 丢失
    });
  },
  
  // ✅ 箭头函数
  processItems: function() {
    return this.items.map(item => item * this.multiplier);
  }
};
```

### 4.3 箭头函数的限制

**不能用作构造函数**

```javascript
const Foo = () => {};
new Foo();  // TypeError: Foo is not a constructor
```

**没有 arguments**

```javascript
const foo = () => {
  console.log(arguments);  // ReferenceError
};

// 使用剩余参数代替
const bar = (...args) => {
  console.log(args);  // [1, 2, 3]
};
bar(1, 2, 3);
```

**不能用作对象方法（慎用）**

```javascript
const obj = {
  a: 1,
  // ❌ 箭头函数作为方法
  foo: () => {
    console.log(this.a);  // this 是外层作用域（全局）
  }
};

obj.foo();  // undefined

// ✅ 普通方法
const obj = {
  a: 1,
  foo() {
    console.log(this.a);
  }
};

obj.foo();  // 1
```

---

## 5. call、apply、bind 的实现

### 5.1 手写 call

```javascript
Function.prototype.myCall = function(context, ...args) {
  // 1. 处理 context（null/undefined → 全局对象）
  context = context || globalThis;
  
  // 2. 将函数设为 context 的属性
  const fn = Symbol('fn');  // 使用 Symbol 避免属性名冲突
  context[fn] = this;
  
  // 3. 执行函数
  const result = context[fn](...args);
  
  // 4. 删除临时属性
  delete context[fn];
  
  // 5. 返回结果
  return result;
};

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const obj = { name: "Alice" };
console.log(greet.myCall(obj, "Hello", "!"));  // "Hello, Alice!"
```

### 5.2 手写 apply

```javascript
Function.prototype.myApply = function(context, args = []) {
  context = context || globalThis;
  
  const fn = Symbol('fn');
  context[fn] = this;
  
  const result = context[fn](...args);
  
  delete context[fn];
  
  return result;
};

// 测试
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, this.initial);
}

const obj = { initial: 10 };
console.log(sum.myApply(obj, [1, 2, 3]));  // 16
```

### 5.3 手写 bind

```javascript
Function.prototype.myBind = function(context, ...bindArgs) {
  const fn = this;
  
  return function boundFn(...callArgs) {
    // 处理 new 调用
    if (new.target) {
      return new fn(...bindArgs, ...callArgs);
    }
    
    // 普通调用
    return fn.apply(context, [...bindArgs, ...callArgs]);
  };
};

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const obj = { name: "Alice" };
const boundGreet = greet.myBind(obj, "Hello");
console.log(boundGreet("!"));  // "Hello, Alice!"

// 作为构造函数
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const BoundPoint = Point.myBind(null, 10);
const point = new BoundPoint(20);
console.log(point.x, point.y);  // 10, 20
```

### 5.4 更完善的 bind 实现

```javascript
Function.prototype.myBind = function(context, ...bindArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }
  
  const fn = this;
  
  function boundFn(...callArgs) {
    // 判断是否通过 new 调用
    const isNew = this instanceof boundFn;
    
    return fn.apply(
      isNew ? this : context,
      [...bindArgs, ...callArgs]
    );
  }
  
  // 维护原型链
  if (fn.prototype) {
    boundFn.prototype = Object.create(fn.prototype);
  }
  
  return boundFn;
};
```

---

## 6. 软绑定

### 6.1 问题场景

```javascript
// bind 的问题：无法修改 this
function foo() {
  console.log(this.name);
}

const obj1 = { name: "obj1" };
const obj2 = { name: "obj2" };

const bar = foo.bind(obj1);
bar.call(obj2);  // "obj1"（bind 的 this 无法改变）
```

### 6.2 软绑定实现

```javascript
Function.prototype.softBind = function(context, ...bindArgs) {
  const fn = this;
  
  return function(...callArgs) {
    // 如果 this 是全局对象或 undefined，使用绑定的 context
    // 否则使用当前 this
    const finalContext = (!this || this === globalThis) ? context : this;
    
    return fn.apply(finalContext, [...bindArgs, ...callArgs]);
  };
};

// 测试
function foo() {
  console.log(this.name);
}

const obj1 = { name: "obj1" };
const obj2 = { name: "obj2" };
const obj3 = { name: "obj3" };

const bar = foo.softBind(obj1);
bar();  // "obj1"（默认绑定）
obj2.foo = bar;
obj2.foo();  // "obj2"（隐式绑定）
bar.call(obj3);  // "obj3"（显式绑定）
```

---

## 7. 工程实践中的 this

### 7.1 事件处理器

```javascript
// ❌ this 丢失
class Button {
  constructor() {
    this.count = 0;
    document.getElementById('btn').addEventListener('click', this.handleClick);
  }
  
  handleClick() {
    this.count++;  // this 指向 button 元素
  }
}

// ✅ 方案 1：箭头函数
class Button {
  constructor() {
    this.count = 0;
    document.getElementById('btn').addEventListener('click', () => {
      this.handleClick();
    });
  }
  
  handleClick() {
    this.count++;
  }
}

// ✅ 方案 2：bind
class Button {
  constructor() {
    this.count = 0;
    this.handleClick = this.handleClick.bind(this);
    document.getElementById('btn').addEventListener('click', this.handleClick);
  }
  
  handleClick() {
    this.count++;
  }
}

// ✅ 方案 3：类字段（箭头函数）
class Button {
  count = 0;
  
  constructor() {
    document.getElementById('btn').addEventListener('click', this.handleClick);
  }
  
  handleClick = () => {
    this.count++;
  }
}
```

### 7.2 React 组件

```javascript
// React 类组件
class Counter extends React.Component {
  state = { count: 0 };
  
  // ✅ 方案 1：箭头函数属性
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  }
  
  // ✅ 方案 2：render 中绑定（性能差）
  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        Count: {this.state.count}
      </button>
    );
  }
  
  // ✅ 方案 3：构造函数绑定
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }
}

// React Hooks（推荐）
function Counter() {
  const [count, setCount] = useState(0);
  
  // 无需担心 this
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 7.3 Vue 组件

```javascript
// Vue 2
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() {
      this.count++;  // Vue 自动绑定 this
    }
  },
  mounted() {
    // ❌ 箭头函数不行
    setTimeout(() => {
      this.count++;  // ✅ 箭头函数继承 this
    }, 1000);
    
    // ❌ 普通函数丢失 this
    setTimeout(function() {
      this.count++;  // ❌ this 丢失
    }, 1000);
  }
};

// Vue 3 Composition API
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);
    
    function increment() {
      count.value++;  // 无需 this
    }
    
    return { count, increment };
  }
};
```

---

## 8. 易错点与最佳实践

### 8.1 对象方法的简写

```javascript
// ✅ 简写语法
const obj = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

// ❌ 箭头函数（this 丢失）
const obj = {
  name: "Alice",
  greet: () => {
    console.log(this.name);  // undefined（this 是外层作用域）
  }
};
```

### 8.2 定时器中的 this

```javascript
const obj = {
  name: "Alice",
  
  // ❌ 传统方法
  delayedGreet1() {
    setTimeout(function() {
      console.log(this.name);  // undefined（this 丢失）
    }, 1000);
  },
  
  // ✅ 箭头函数
  delayedGreet2() {
    setTimeout(() => {
      console.log(this.name);  // "Alice"
    }, 1000);
  },
  
  // ✅ bind
  delayedGreet3() {
    setTimeout(function() {
      console.log(this.name);  // "Alice"
    }.bind(this), 1000);
  }
};
```

### 8.3 链式调用中的 this

```javascript
class Calculator {
  constructor() {
    this.value = 0;
  }
  
  add(num) {
    this.value += num;
    return this;  // 返回 this 支持链式调用
  }
  
  subtract(num) {
    this.value -= num;
    return this;
  }
  
  multiply(num) {
    this.value *= num;
    return this;
  }
  
  getResult() {
    return this.value;
  }
}

const calc = new Calculator();
const result = calc.add(5).multiply(2).subtract(3).getResult();
console.log(result);  // 7
```

---

## 关键要点

1. **四种绑定规则**
   - 默认绑定：独立调用，this → 全局/undefined
   - 隐式绑定：对象方法调用，this → 对象
   - 显式绑定：call/apply/bind，this → 指定对象
   - new 绑定：构造函数调用，this → 新对象

2. **绑定优先级**
   - new > 显式 > 隐式 > 默认
   - 使用判断流程确定 this

3. **箭头函数**
   - 没有自己的 this，继承外层作用域
   - 无法通过 call/apply/bind 改变 this
   - 适合回调函数，不适合对象方法

4. **call/apply/bind 区别**
   - call：立即执行，参数列表
   - apply：立即执行，参数数组
   - bind：返回新函数，支持偏函数

5. **最佳实践**
   - 事件处理器：使用箭头函数或 bind
   - React：类字段箭头函数或 Hooks
   - Vue：methods 自动绑定，回调用箭头函数
   - 链式调用：return this

---

## 深入一点

### this 绑定的内部实现

在执行上下文创建时，this 的绑定过程：

```
1. 如果是 new 调用：
   - 创建新对象
   - this 绑定到新对象

2. 如果是 call/apply/bind：
   - this 绑定到指定对象

3. 如果是隐式绑定：
   - this 绑定到上下文对象

4. 默认绑定：
   - 严格模式：this = undefined
   - 非严格模式：this = 全局对象
```

### 严格模式对 this 的影响

```javascript
// 非严格模式
function foo() {
  console.log(this);  // window/global
}

// 严格模式
function bar() {
  "use strict";
  console.log(this);  // undefined
}

// 注意：调用位置的模式决定 this
function foo() {
  console.log(this);
}

(function() {
  "use strict";
  foo();  // window（foo 内部不是严格模式）
})();
```

---

## 参考资料

- [MDN: this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [You Don't Know JS: this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed/this%20%26%20object%20prototypes)
- [JavaScript深入之从ECMAScript规范解读this](https://github.com/mqyqingfeng/Blog/issues/7)

---

**上一章**：[闭包原理与应用](./content-8.md)  
**下一章**：[调用栈与执行流程](./content-10.md)
