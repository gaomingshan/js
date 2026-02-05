# 闭包原理与应用

> 掌握闭包的本质、应用场景与性能影响

---

## 概述

闭包（Closure）是 JavaScript 最重要也最容易被误解的概念之一。理解闭包，是掌握作用域、内存管理、模块模式的关键。

本章将深入：
- 闭包的形成条件与本质
- 闭包的内存模型
- 典型应用场景
- 闭包与内存泄漏
- 工程实践中的优化

---

## 1. 闭包的定义

### 1.1 理论定义

**闭包 = 函数 + 函数能够访问的自由变量**

```javascript
function outer() {
  let count = 0;  // 自由变量（相对于 inner）
  
  function inner() {
    count++;  // 访问外层变量
    return count;
  }
  
  return inner;
}

const counter = outer();
console.log(counter());  // 1
console.log(counter());  // 2
// inner 函数 + count 变量 = 闭包
```

**ECMAScript 规范定义**：
> 闭包是指那些能够访问自由变量的函数

**自由变量**：在函数中使用，但既不是参数也不是局部变量的变量。

### 1.2 实践定义

**更常用的定义**：

> 闭包是指有权访问另一个函数作用域中变量的函数

```javascript
function createGreeting(greeting) {
  // 外层函数的变量
  return function(name) {
    // 内层函数访问外层变量
    return `${greeting}, ${name}!`;
  };
}

const sayHello = createGreeting("Hello");
console.log(sayHello("Alice"));  // "Hello, Alice!"
console.log(sayHello("Bob"));    // "Hello, Bob!"
```

### 1.3 形成条件

闭包形成需要满足：

1. **函数嵌套**：内部函数
2. **访问外层变量**：内部函数引用外层函数的变量
3. **外层函数返回内部函数**（或传递内部函数）

```javascript
// ✅ 形成闭包
function outer() {
  let x = 1;
  return function inner() {
    console.log(x);  // 访问外层变量
  };
}

// ❌ 不是闭包（没有访问外层变量）
function outer() {
  let x = 1;
  return function inner() {
    let y = 2;
    console.log(y);  // 只访问自己的变量
  };
}

// ✅ 也是闭包（通过回调传递）
function outer() {
  let x = 1;
  setTimeout(function() {
    console.log(x);  // 访问外层变量
  }, 1000);
}
```

---

## 2. 闭包的工作原理

### 2.1 [[Scope]] 属性

**关键机制**：函数的 `[[Scope]]` 属性保存了其定义时的作用域链。

```javascript
function outer() {
  let count = 0;
  
  function inner() {
    return ++count;
  }
  
  return inner;
}

const counter = outer();

// counter.[[Scope]] 包含：
// 1. outer 的 AO（包含 count）
// 2. 全局 VO
```

**执行过程**：

```javascript
// 1. 执行 outer()
//    - 创建 outer 的 AO：{ count: 0, inner: <function> }
//    - inner.[[Scope]] = [outer AO, 全局 VO]
//    - 返回 inner

// 2. outer 执行完毕，但 AO 不被销毁
//    - 因为 inner.[[Scope]] 仍引用它

// 3. 执行 counter()
//    - 创建 inner 的 AO
//    - Scope Chain: [inner AO, outer AO, 全局 VO]
//    - 能访问 count 变量
```

### 2.2 内存模型

```
堆内存
┌─────────────────────────────────┐
│  outer 的 AO                    │
│  { count: 0 }                   │
│    ↑                            │
│    │ 引用                        │
│    │                            │
│  inner 函数对象                  │
│  [[Scope]]: [outer AO, 全局]    │
└─────────────────────────────────┘
      ↑
      │ 引用
      │
栈内存
┌─────────────────┐
│ counter: 指针   │
└─────────────────┘
```

**关键点**：
- outer 执行完毕后，其 AO 不会被销毁
- 因为 inner 的 [[Scope]] 仍然引用它
- 这就是闭包能"记住"外层变量的原因

---

## 3. 闭包的典型应用

### 3.1 数据私有化

```javascript
function createPerson(name) {
  // 私有变量
  let _name = name;
  let _age = 0;
  
  // 公共接口
  return {
    getName() {
      return _name;
    },
    setAge(age) {
      if (age >= 0) {
        _age = age;
      }
    },
    getAge() {
      return _age;
    }
  };
}

const person = createPerson("Alice");
console.log(person.getName());  // "Alice"
person.setAge(25);
console.log(person.getAge());   // 25
console.log(person._name);      // undefined（无法直接访问）
```

### 3.2 模块模式

```javascript
const Calculator = (function() {
  // 私有变量和方法
  let result = 0;
  
  function validate(num) {
    return typeof num === 'number';
  }
  
  // 公共 API
  return {
    add(num) {
      if (!validate(num)) throw new TypeError('Invalid number');
      result += num;
      return this;
    },
    subtract(num) {
      if (!validate(num)) throw new TypeError('Invalid number');
      result -= num;
      return this;
    },
    getResult() {
      return result;
    },
    reset() {
      result = 0;
      return this;
    }
  };
})();

Calculator.add(5).add(3).subtract(2);
console.log(Calculator.getResult());  // 6
console.log(Calculator.result);       // undefined（私有）
```

### 3.3 函数工厂

```javascript
// 创建特定功能的函数
function makeMultiplier(factor) {
  return function(num) {
    return num * factor;
  };
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// 实际应用：创建验证器
function makeValidator(regex, message) {
  return function(input) {
    if (!regex.test(input)) {
      throw new Error(message);
    }
    return true;
  };
}

const validateEmail = makeValidator(
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  'Invalid email format'
);

validateEmail('user@example.com');  // true
validateEmail('invalid');           // Error: Invalid email format
```

### 3.4 偏函数与柯里化

```javascript
// 偏函数：固定部分参数
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = partial(greet, "Hello");
console.log(sayHello("Alice"));  // "Hello, Alice!"

// 柯里化：将多参数函数转为单参数函数链
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...moreArgs) {
        return curried.apply(this, args.concat(moreArgs));
      };
    }
  };
}

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));    // 6
console.log(curriedAdd(1, 2)(3));    // 6
console.log(curriedAdd(1)(2, 3));    // 6
```

### 3.5 缓存/记忆化

```javascript
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('从缓存返回');
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 斐波那契数列（性能优化）
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40));  // 第一次计算
console.log(fibonacci(40));  // 从缓存返回，速度极快
```

### 3.6 延迟执行

```javascript
function delay(fn, ms) {
  return function(...args) {
    setTimeout(() => {
      fn.apply(this, args);
    }, ms);
  };
}

const delayedLog = delay(console.log, 1000);
delayedLog("Hello");  // 1秒后输出

// 防抖
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流
function throttle(fn, interval) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

---

## 4. 循环中的闭包陷阱

### 4.1 经典问题

```javascript
// ❌ 问题代码
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
// 输出：3, 3, 3

// 原因：
// 1. var 是函数作用域，i 在整个函数中只有一个
// 2. 三个 setTimeout 的回调函数共享同一个 i
// 3. 循环结束时 i = 3
// 4. 回调执行时，访问的都是同一个 i（值为 3）
```

### 4.2 解决方案

**方案 1：使用 let（推荐）**

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
// 输出：0, 1, 2

// let 是块级作用域，每次迭代创建新的 i
```

**方案 2：IIFE**

```javascript
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j);
    }, 100);
  })(i);
}
// 输出：0, 1, 2

// IIFE 创建新作用域，j 是参数，每次调用都是新的
```

**方案 3：bind**

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(null, i), 100);
}
// 输出：0, 1, 2

// bind 创建新函数，将 i 的当前值绑定到参数
```

**方案 4：传递额外参数**

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function(j) {
    console.log(j);
  }, 100, i);
}
// 输出：0, 1, 2

// setTimeout 的第三个参数会传递给回调函数
```

---

## 5. 闭包与内存管理

### 5.1 内存泄漏风险

```javascript
// ❌ 潜在内存泄漏
function createLeak() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    // 即使不使用 largeData，它也会被保留
    console.log('Hello');
  };
}

const fn = createLeak();
// largeData 无法被回收，因为闭包引用了整个作用域
```

**原因**：
- 闭包保留整个外层作用域
- 即使只使用一个变量，其他变量也会被保留

### 5.2 解决内存泄漏

**方案 1：及时释放引用**

```javascript
function createSafe() {
  const largeData = new Array(1000000).fill('data');
  const needed = largeData[0];  // 提取需要的数据
  
  return function() {
    console.log(needed);  // 只引用需要的变量
  };
}
// largeData 可以被垃圾回收
```

**方案 2：手动清理**

```javascript
function createCleanable() {
  let largeData = new Array(1000000).fill('data');
  
  const fn = function() {
    console.log(largeData[0]);
  };
  
  fn.destroy = function() {
    largeData = null;  // 清理引用
  };
  
  return fn;
}

const fn = createCleanable();
fn();
fn.destroy();  // 清理内存
```

**方案 3：使用 WeakMap**

```javascript
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  
  const result = heavyComputation(obj);
  cache.set(obj, result);
  return result;
}

// obj 被回收时，cache 中的条目也会自动清理
```

### 5.3 DOM 事件中的闭包泄漏

```javascript
// ❌ 内存泄漏
function attachEvent() {
  const element = document.getElementById('button');
  const data = new Array(1000000).fill('data');
  
  element.onclick = function() {
    console.log(data[0]);
  };
}

// ✅ 解决方案：移除事件监听
function attachEventSafe() {
  const element = document.getElementById('button');
  const data = new Array(1000000).fill('data');
  
  const handler = function() {
    console.log(data[0]);
  };
  
  element.onclick = handler;
  
  // 清理函数
  return function cleanup() {
    element.onclick = null;
    // 或 element.removeEventListener('click', handler);
  };
}

const cleanup = attachEventSafe();
// 稍后清理
cleanup();
```

---

## 6. 闭包的性能影响

### 6.1 内存开销

```javascript
// ❌ 创建大量闭包
function createManyClosures() {
  const closures = [];
  for (let i = 0; i < 100000; i++) {
    closures.push(function() {
      return i;
    });
  }
  return closures;
}

// 每个闭包都保留对外层作用域的引用，内存开销大
```

### 6.2 访问速度

```javascript
// 闭包访问外层变量比访问局部变量慢
function outer() {
  let outerVar = 1;
  
  return function inner() {
    let innerVar = 2;
    
    // 访问 innerVar 快（局部变量）
    // 访问 outerVar 慢（作用域链查找）
    return innerVar + outerVar;
  };
}
```

### 6.3 优化建议

**优化 1：缓存外层变量**

```javascript
// ❌ 频繁访问外层变量
function outer() {
  const config = { /*大对象*/ };
  
  return function inner(items) {
    return items.map(item => {
      // 每次都查找 config
      return process(item, config.setting);
    });
  };
}

// ✅ 缓存
function outer() {
  const config = { /*大对象*/ };
  const setting = config.setting;  // 提取常用数据
  
  return function inner(items) {
    return items.map(item => process(item, setting));
  };
}
```

**优化 2：避免过度使用闭包**

```javascript
// ❌ 不必要的闭包
class Counter {
  constructor() {
    this.count = 0;
    this.increment = function() {  // 每个实例创建新函数
      this.count++;
    };
  }
}

// ✅ 原型方法
class Counter {
  constructor() {
    this.count = 0;
  }
  
  increment() {  // 所有实例共享
    this.count++;
  }
}
```

---

## 7. 前端工程实践

### 7.1 React Hooks 中的闭包

```javascript
// 闭包陷阱：stale closure
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);  // 始终是 0（闭包捕获初始值）
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // 空依赖数组
  
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}

// ✅ 解决方案：依赖数组或函数式更新
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);  // 函数式更新
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return <button>Count: {count}</button>;
}
```

### 7.2 Vue 3 中的闭包

```javascript
import { ref, watch } from 'vue';

export default {
  setup() {
    const count = ref(0);
    
    // watch 中的闭包
    watch(count, (newValue) => {
      console.log(`Count changed to ${newValue}`);
    });
    
    return { count };
  }
}
```

### 7.3 状态管理中的闭包

```javascript
// Redux middleware（闭包应用）
function createLogger() {
  return store => next => action => {
    console.log('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    return result;
  };
}

// Zustand（闭包状态管理）
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));
```

---

## 8. 易错点与最佳实践

### 8.1 this 绑定问题

```javascript
const obj = {
  value: 42,
  getValue: function() {
    return function() {
      return this.value;  // this 指向 window/undefined
    };
  }
};

const fn = obj.getValue();
console.log(fn());  // undefined

// ✅ 解决方案 1：箭头函数
const obj = {
  value: 42,
  getValue: function() {
    return () => this.value;  // 箭头函数继承 this
  }
};

// ✅ 解决方案 2：保存 this
const obj = {
  value: 42,
  getValue: function() {
    const self = this;
    return function() {
      return self.value;
    };
  }
};
```

### 8.2 避免过早优化

```javascript
// ❌ 过度担心闭包性能
function process(items) {
  return items.map(item => item * 2);  // 简单清晰
}

// ❌ 不必要的优化
function process(items) {
  const multiply = (x) => x * 2;  // 提取函数反而复杂
  return items.map(multiply);
}

// ✅ 在性能瓶颈处优化
function process(items) {
  // 只在确认性能问题后再优化
  return items.map(item => item * 2);
}
```

### 8.3 闭包与模块化

```javascript
// ✅ 使用 ES6 模块替代 IIFE
// counter.js
let count = 0;

export function increment() {
  return ++count;
}

export function getCount() {
  return count;
}

// main.js
import { increment, getCount } from './counter.js';
```

---

## 关键要点

1. **闭包的本质**
   - 函数 + 其能访问的外层作用域
   - 通过 [[Scope]] 属性实现
   - 外层函数执行完毕，AO 仍可能存活

2. **闭包的应用**
   - 数据私有化
   - 模块模式
   - 函数工厂
   - 柯里化与偏函数
   - 缓存与记忆化

3. **循环中的闭包**
   - var：共享变量
   - let：每次迭代新变量
   - IIFE：创建新作用域

4. **内存管理**
   - 闭包保留整个外层作用域
   - 及时释放不需要的引用
   - 注意 DOM 事件的内存泄漏
   - 使用 WeakMap 处理缓存

5. **性能优化**
   - 避免创建大量闭包
   - 缓存频繁访问的外层变量
   - 原型方法优于实例方法
   - 不要过早优化

---

## 深入一点

### 闭包与垃圾回收

**标记清除算法**

```javascript
function outer() {
  let data = "some data";
  
  return function inner() {
    console.log(data);
  };
}

const fn = outer();
// data 被 fn 引用，无法回收

fn = null;
// fn 被清除，data 可以被回收
```

**V8 的闭包优化**

V8 引擎会分析闭包，只保留实际使用的变量：

```javascript
function outer() {
  let used = 1;
  let unused = 2;
  
  return function() {
    console.log(used);
    // unused 可能被优化掉（不保证）
  };
}
```

---

## 参考资料

- [MDN: 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [JavaScript深入之闭包](https://github.com/mqyqingfeng/Blog/issues/9)
- [Understanding JavaScript Closures](https://javascriptweblog.wordpress.com/2010/10/25/understanding-javascript-closures/)
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures)

---

**上一章**：[执行上下文与作用域链](./content-7.md)  
**下一章**：[this 绑定机制](./content-9.md)
