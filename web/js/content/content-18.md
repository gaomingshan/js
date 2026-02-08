# 函数性能优化与最佳实践

> 编写高性能、可维护的函数代码

---

## 概述

函数是 JavaScript 的核心构建块。编写高性能、可维护的函数代码需要理解性能优化技巧、避免常见陷阱、遵循最佳实践。

本章将深入：
- 函数调用的性能影响
- 避免常见性能陷阱
- 记忆化与缓存
- 函数节流与防抖
- 代码复用与抽象
- 函数式编程最佳实践

---

## 1. 函数调用性能

### 1.1 函数调用开销

```javascript
// 函数调用有开销：创建执行上下文、参数传递、返回值
function add(a, b) {
  return a + b;
}

// 内联代码（无函数调用开销）
let result = 1 + 2;

// 但：函数提供了更好的抽象和复用
// 性能差异在大部分场景下可以忽略

// ❌ 过度优化
for (let i = 0; i < 1000000; i++) {
  result += i;  // 内联
}

// ✅ 合理抽象
function sum(n) {
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += i;
  }
  return result;
}
```

### 1.2 递归 vs 迭代

```javascript
// 递归：优雅但可能栈溢出
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.time('递归');
factorial(10000);  // 可能栈溢出
console.timeEnd('递归');

// 迭代：性能更好
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

console.time('迭代');
factorial(10000);  // 快速完成
console.timeEnd('迭代');

// 尾递归优化（理论上，大部分引擎不支持）
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);
}
```

### 1.3 函数内联（引擎优化）

```javascript
// 简单函数可能被引擎内联
function double(x) {
  return x * 2;
}

// 引擎可能优化为：
// for (let i = 0; i < 1000; i++) {
//   result = i * 2;  // 内联
// }
for (let i = 0; i < 1000; i++) {
  result = double(i);
}

// 复杂函数不会内联
function complex(x) {
  // 大量代码
  for (let i = 0; i < 100; i++) {
    x += Math.sqrt(i);
  }
  return x;
}
```

---

## 2. 记忆化（Memoization）

### 2.1 基本实现

```javascript
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 斐波那契数列（性能对比）
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFibonacci = memoize(fibonacci);

console.time('未记忆化');
console.log(fibonacci(40));  // 约 1000ms
console.timeEnd('未记忆化');

console.time('记忆化');
console.log(memoizedFibonacci(40));  // < 1ms
console.timeEnd('记忆化');
```

### 2.2 带限制的记忆化

```javascript
function memoizeWithLimit(fn, limit = 100) {
  const cache = new Map();
  const keys = [];
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    
    // 限制缓存大小
    if (keys.length >= limit) {
      const oldestKey = keys.shift();
      cache.delete(oldestKey);
    }
    
    keys.push(key);
    cache.set(key, result);
    return result;
  };
}

// LRU 缓存
function memoizeLRU(fn, maxSize = 100) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      // 移到最后（最近使用）
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    
    const result = fn.apply(this, args);
    
    if (cache.size >= maxSize) {
      // 删除最旧的（第一个）
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  };
}
```

### 2.3 适用场景

```javascript
// ✅ 适合记忆化：纯函数、计算密集
const expensiveCalculation = memoize((n) => {
  console.log(`Calculating for ${n}`);
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
});

// ❌ 不适合记忆化：有副作用
const fetchData = memoize(async (url) => {
  return fetch(url);  // 副作用，可能获取过期数据
});

// ❌ 不适合记忆化：参数范围广
const generateUUID = memoize(() => {
  return Math.random().toString(36);  // 缓存无意义
});
```

---

## 3. 防抖（Debounce）

### 3.1 基本实现

```javascript
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用场景：搜索框输入
const searchInput = document.getElementById('search');

const search = (keyword) => {
  console.log(`Searching for: ${keyword}`);
  // 发送 API 请求
};

const debouncedSearch = debounce(search, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
// 用户停止输入 300ms 后才执行搜索
```

### 3.2 立即执行版本

```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null;
  
  return function(...args) {
    const callNow = immediate && !timer;
    
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);
    
    if (callNow) {
      fn.apply(this, args);
    }
  };
}

// 立即执行一次，之后防抖
const handleClick = debounce(() => {
  console.log('Button clicked');
}, 1000, true);

// 第一次点击立即执行
// 1秒内的后续点击被忽略
```

### 3.3 取消防抖

```javascript
function debounce(fn, delay) {
  let timer = null;
  
  const debounced = function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
  
  debounced.cancel = function() {
    clearTimeout(timer);
    timer = null;
  };
  
  return debounced;
}

const debouncedFn = debounce(() => {
  console.log('Executed');
}, 1000);

debouncedFn();
debouncedFn.cancel();  // 取消执行
```

---

## 4. 节流（Throttle）

### 4.1 基本实现

```javascript
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

// 使用场景：滚动事件
const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 200);

window.addEventListener('scroll', handleScroll);
// 每 200ms 最多执行一次
```

### 4.2 时间戳 vs 定时器

```javascript
// 时间戳版本：首次立即执行
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

// 定时器版本：首次延迟执行
function throttle(fn, interval) {
  let timer = null;
  
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, interval);
    }
  };
}

// 结合版本：首尾都执行
function throttle(fn, interval) {
  let timer = null;
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    
    clearTimeout(timer);
    
    if (remaining <= 0) {
      lastTime = now;
      fn.apply(this, args);
    } else {
      timer = setTimeout(() => {
        lastTime = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}
```

### 4.3 实际应用

```javascript
// 窗口调整大小
const handleResize = throttle(() => {
  console.log('Window resized:', window.innerWidth);
  // 重新计算布局
}, 200);

window.addEventListener('resize', handleResize);

// 鼠标移动
const handleMouseMove = throttle((e) => {
  console.log(`Mouse position: ${e.clientX}, ${e.clientY}`);
}, 100);

document.addEventListener('mousemove', handleMouseMove);

// 无限滚动加载
const loadMore = throttle(() => {
  const scrollTop = window.pageYOffset;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  if (scrollTop + windowHeight >= documentHeight - 100) {
    console.log('Loading more items...');
    // 加载更多数据
  }
}, 300);

window.addEventListener('scroll', loadMore);
```

---

## 5. 防抖 vs 节流

### 5.1 对比

```javascript
// 防抖：等待用户停止操作
// 适用场景：搜索框输入、表单验证、窗口调整完成后的操作

// 节流：限制执行频率
// 适用场景：滚动加载、鼠标移动、窗口调整过程中的操作

// 形象比喻：
// 防抖：电梯，等所有人进来后再关门
// 节流：地铁，每隔固定时间发一班车
```

### 5.2 选择指南

```javascript
// ✅ 使用防抖
const searchBox = debounce((keyword) => {
  // 搜索 API 调用
}, 300);

const validateForm = debounce((data) => {
  // 表单验证
}, 500);

// ✅ 使用节流
const handleScroll = throttle(() => {
  // 滚动处理
}, 200);

const trackMousePosition = throttle((e) => {
  // 追踪鼠标位置
}, 100);
```

---

## 6. 函数复用与抽象

### 6.1 DRY 原则

```javascript
// ❌ 重复代码
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  const regex = /^\d{3}-\d{3}-\d{4}$/;
  return regex.test(phone);
}

function validateZipCode(zip) {
  const regex = /^\d{5}$/;
  return regex.test(zip);
}

// ✅ 提取通用逻辑
function createValidator(regex) {
  return function(value) {
    return regex.test(value);
  };
}

const validateEmail = createValidator(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const validatePhone = createValidator(/^\d{3}-\d{3}-\d{4}$/);
const validateZipCode = createValidator(/^\d{5}$/);
```

### 6.2 单一职责原则

```javascript
// ❌ 函数做太多事
function processUser(user) {
  // 验证
  if (!user.email || !user.name) {
    throw new Error('Invalid user');
  }
  
  // 转换
  user.email = user.email.toLowerCase();
  user.name = user.name.trim();
  
  // 保存
  database.save(user);
  
  // 发送邮件
  sendWelcomeEmail(user.email);
  
  // 记录日志
  logger.log(`User created: ${user.email}`);
}

// ✅ 拆分职责
function validateUser(user) {
  if (!user.email || !user.name) {
    throw new Error('Invalid user');
  }
}

function normalizeUser(user) {
  return {
    ...user,
    email: user.email.toLowerCase(),
    name: user.name.trim()
  };
}

function saveUser(user) {
  return database.save(user);
}

function notifyUser(user) {
  sendWelcomeEmail(user.email);
  logger.log(`User created: ${user.email}`);
}

function processUser(user) {
  validateUser(user);
  const normalized = normalizeUser(user);
  const saved = saveUser(normalized);
  notifyUser(saved);
  return saved;
}
```

### 6.3 参数对象化

```javascript
// ❌ 参数过多
function createUser(firstName, lastName, email, age, country, city, zipCode) {
  // ...
}

createUser("John", "Doe", "john@example.com", 30, "USA", "New York", "10001");

// ✅ 使用对象参数
function createUser({ firstName, lastName, email, age, address }) {
  // ...
}

createUser({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  age: 30,
  address: {
    country: "USA",
    city: "New York",
    zipCode: "10001"
  }
});

// 优点：
// 1. 参数顺序无关
// 2. 可选参数明确
// 3. 易于扩展
// 4. 更好的可读性
```

---

## 7. 错误处理最佳实践

### 7.1 明确的错误信息

```javascript
// ❌ 模糊的错误
function divide(a, b) {
  if (b === 0) {
    throw new Error('Error');  // 不明确
  }
  return a / b;
}

// ✅ 清晰的错误
function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both arguments must be numbers');
  }
  
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  
  return a / b;
}
```

### 7.2 提前返回

```javascript
// ❌ 嵌套过深
function processUser(user) {
  if (user) {
    if (user.email) {
      if (user.age >= 18) {
        // 处理逻辑
        return result;
      } else {
        throw new Error('User must be 18+');
      }
    } else {
      throw new Error('Email required');
    }
  } else {
    throw new Error('User required');
  }
}

// ✅ 提前返回（Guard Clauses）
function processUser(user) {
  if (!user) {
    throw new Error('User required');
  }
  
  if (!user.email) {
    throw new Error('Email required');
  }
  
  if (user.age < 18) {
    throw new Error('User must be 18+');
  }
  
  // 处理逻辑
  return result;
}
```

### 7.3 错误传播

```javascript
// ❌ 吞掉错误
function fetchUserData(id) {
  try {
    return api.getUser(id);
  } catch (e) {
    console.log('Error occurred');  // 只记录，不传播
    return null;  // 调用者无法知道出错
  }
}

// ✅ 传播错误
function fetchUserData(id) {
  try {
    return api.getUser(id);
  } catch (e) {
    console.error('Failed to fetch user:', e);
    throw new Error(`Failed to fetch user ${id}: ${e.message}`);
  }
}

// ✅ 使用 Result 模式
function fetchUserData(id) {
  try {
    const user = api.getUser(id);
    return { success: true, data: user };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
```

---

## 8. 性能优化技巧

### 8.1 避免在循环中创建函数

```javascript
// ❌ 每次循环创建新函数
const items = [1, 2, 3, 4, 5];

items.forEach(function(item) {
  setTimeout(function() {  // 每次创建新函数
    console.log(item);
  }, 100);
});

// ✅ 函数复用
function logItem(item) {
  console.log(item);
}

items.forEach(function(item) {
  setTimeout(logItem.bind(null, item), 100);
});

// 或使用箭头函数（更好）
items.forEach(item => {
  setTimeout(() => console.log(item), 100);
});
```

### 8.2 缓存计算结果

```javascript
// ❌ 重复计算
function processItems(items) {
  return items.filter(item => item.price > calculateThreshold())
              .map(item => item.price * calculateTax());
}

// ✅ 缓存结果
function processItems(items) {
  const threshold = calculateThreshold();  // 只计算一次
  const tax = calculateTax();              // 只计算一次
  
  return items.filter(item => item.price > threshold)
              .map(item => item.price * tax);
}
```

### 8.3 使用合适的数据结构

```javascript
// ❌ 数组查找（O(n)）
const users = [/* 大量用户 */];

function getUserById(id) {
  return users.find(user => user.id === id);  // 线性查找
}

// ✅ Map 查找（O(1)）
const usersMap = new Map(users.map(user => [user.id, user]));

function getUserById(id) {
  return usersMap.get(id);  // 常数时间
}
```

---

## 9. 代码可读性

### 9.1 命名规范

```javascript
// ❌ 糟糕的命名
function f(x, y) {
  return x + y;
}

const d = new Date();
const arr = [1, 2, 3];

// ✅ 清晰的命名
function calculateTotal(price, tax) {
  return price + tax;
}

const currentDate = new Date();
const userIds = [1, 2, 3];

// 布尔值使用 is/has/should 前缀
const isActive = true;
const hasPermission = false;
const shouldUpdate = true;

// 函数使用动词
function validateEmail(email) { }
function fetchUserData(id) { }
function createNewUser(data) { }
```

### 9.2 注释的使用

```javascript
// ❌ 无用的注释
// 增加 1
x = x + 1;

// ✅ 有价值的注释
// 使用二分查找而非线性查找（性能优化）
const index = binarySearch(sortedArray, target);

// 解释复杂的业务逻辑
// 根据用户等级计算折扣：
// VIP: 20% 折扣
// 普通会员: 10% 折扣
// 新用户: 5% 折扣
function calculateDiscount(userLevel) {
  // ...
}

// ✅ JSDoc 注释
/**
 * 计算两个数的和
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @returns {number} 两数之和
 * @throws {TypeError} 如果参数不是数字
 */
function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both arguments must be numbers');
  }
  return a + b;
}
```

### 9.3 魔法数字

```javascript
// ❌ 魔法数字
function calculatePrice(quantity) {
  if (quantity > 100) {
    return quantity * 9.99 * 0.9;
  }
  return quantity * 9.99;
}

// ✅ 命名常量
const UNIT_PRICE = 9.99;
const BULK_DISCOUNT = 0.9;
const BULK_THRESHOLD = 100;

function calculatePrice(quantity) {
  const basePrice = quantity * UNIT_PRICE;
  
  if (quantity > BULK_THRESHOLD) {
    return basePrice * BULK_DISCOUNT;
  }
  
  return basePrice;
}
```

---

## 10. 测试友好的函数

### 10.1 纯函数优先

```javascript
// ✅ 纯函数（易于测试）
function calculateTax(price, taxRate) {
  return price * taxRate;
}

// 测试简单
console.assert(calculateTax(100, 0.1) === 10);
console.assert(calculateTax(200, 0.15) === 30);

// ❌ 有副作用（难以测试）
let totalTax = 0;

function addTax(price, taxRate) {
  totalTax += price * taxRate;  // 副作用
  return totalTax;
}
```

### 10.2 依赖注入

```javascript
// ❌ 硬编码依赖
function saveUser(user) {
  const db = new Database();  // 硬编码
  return db.save(user);
}

// ✅ 依赖注入
function saveUser(user, db) {
  return db.save(user);
}

// 测试时可以传入 mock
const mockDb = {
  save: (user) => Promise.resolve(user)
};

saveUser({ name: "Alice" }, mockDb);
```

### 10.3 小函数原则

```javascript
// ❌ 大函数（难以测试）
function processOrder(order) {
  // 100+ 行代码
  // 验证、计算、保存、通知...
}

// ✅ 拆分为小函数
function validateOrder(order) { }
function calculateTotal(order) { }
function saveOrder(order) { }
function notifyCustomer(order) { }

function processOrder(order) {
  validateOrder(order);
  const total = calculateTotal(order);
  saveOrder({ ...order, total });
  notifyCustomer(order);
}

// 每个小函数都易于测试
```

---

## 关键要点

1. **性能优化**
   - 迭代优于递归（大数据）
   - 记忆化适用于纯函数
   - 避免循环中创建函数
   - 缓存计算结果

2. **防抖与节流**
   - 防抖：等待停止操作
   - 节流：限制执行频率
   - 根据场景选择

3. **代码复用**
   - DRY 原则
   - 单一职责
   - 参数对象化
   - 提取通用逻辑

4. **错误处理**
   - 明确的错误信息
   - 提前返回
   - 传播错误
   - 使用自定义错误类型

5. **最佳实践**
   - 清晰的命名
   - 有价值的注释
   - 避免魔法数字
   - 编写可测试的代码

---

## 深入一点

### 函数式编程的性能

```javascript
// 链式调用可能创建中间数组
const result = array
  .filter(x => x > 0)     // 创建新数组
  .map(x => x * 2)        // 创建新数组
  .reduce((a, b) => a + b, 0);

// Transducer 优化（只遍历一次）
const transducer = compose(
  filter(x => x > 0),
  map(x => x * 2)
);

const result = transduce(transducer, sum, 0, array);
```

### V8 优化提示

```javascript
// V8 优化建议：
// 1. 保持函数单态（相同类型的参数）
function add(a, b) {
  return a + b;
}

add(1, 2);      // 优化为整数加法
add(1.5, 2.5);  // 去优化（混合类型）

// 2. 避免 try-catch 在热代码路径
// ❌
function hotPath(x) {
  try {
    return process(x);
  } catch (e) {
    return fallback;
  }
}

// ✅
function hotPath(x) {
  return process(x);
}

function safeHotPath(x) {
  try {
    return hotPath(x);
  } catch (e) {
    return fallback;
  }
}
```

---

## 参考资料

- [JavaScript Performance](https://developers.google.com/web/fundamentals/performance/why-performance-matters)
- [Functional Programming Design Patterns](https://fsharpforfunandprofit.com/fppatterns/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**上一章**：[高阶函数与函数式编程](./content-17.md)  
**下一章**：[Promise 基础](./content-19.md)
