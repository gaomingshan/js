# 错误处理机制

> 建立完善的错误处理体系

---

## 概述

错误处理是构建健壮应用的关键。JavaScript 提供了完整的错误处理机制，包括错误对象、try-catch 语句、错误冒泡等。

本章将深入：
- Error 对象与错误类型体系
- try-catch-finally 的执行顺序
- 错误冒泡与捕获机制
- 全局错误处理
- 工程化错误处理实践

---

## 1. Error 对象

### 1.1 Error 的基本结构

```javascript
const error = new Error("Something went wrong");

console.log(error.message);  // "Something went wrong"
console.log(error.name);     // "Error"
console.log(error.stack);    // 调用栈信息

// 手动抛出错误
throw error;
```

### 1.2 Error 对象的属性

```javascript
const error = new Error("Test error");

// 标准属性
console.log(error.message);  // 错误消息
console.log(error.name);     // 错误类型名称
console.log(error.stack);    // 调用栈（非标准但广泛支持）

// 调用栈格式
// Error: Test error
//   at Object.<anonymous> (file.js:1:15)
//   at Module._compile (internal/modules/cjs/loader.js:...)
//   ...
```

---

## 2. 错误类型

### 2.1 内置错误类型

**Error**：通用错误

```javascript
throw new Error("General error");
```

**SyntaxError**：语法错误

```javascript
// 编译时自动抛出
eval("foo bar");  // SyntaxError: Unexpected identifier

JSON.parse("{invalid}");  // SyntaxError: Unexpected token i
```

**ReferenceError**：引用错误

```javascript
console.log(undefinedVariable);  // ReferenceError: undefinedVariable is not defined

let x;
console.log(y);  // ReferenceError: y is not defined（TDZ）
let y = 1;
```

**TypeError**：类型错误

```javascript
null.foo();  // TypeError: Cannot read property 'foo' of null

const x = 1;
x = 2;  // TypeError: Assignment to constant variable

(123).toUpperCase();  // TypeError: 123.toUpperCase is not a function
```

**RangeError**：范围错误

```javascript
new Array(-1);  // RangeError: Invalid array length

function recurse() {
  recurse();
}
recurse();  // RangeError: Maximum call stack size exceeded
```

**URIError**：URI 错误

```javascript
decodeURIComponent('%');  // URIError: URI malformed
```

**EvalError**：eval 错误（已废弃）

```javascript
// 现代 JavaScript 中基本不使用
```

### 2.2 自定义错误类型

```javascript
// ES6 Class 方式
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = statusCode;
  }
}

// 使用
function validateUser(user) {
  if (!user.name) {
    throw new ValidationError("Name is required");
  }
  if (!user.email) {
    throw new ValidationError("Email is required");
  }
}

try {
  validateUser({ name: "Alice" });
} catch (e) {
  if (e instanceof ValidationError) {
    console.error("Validation failed:", e.message);
  }
}
```

**更完善的自定义错误**

```javascript
class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    
    // 维护正确的原型链
    this.name = this.constructor.name;
    
    // 捕获调用栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // 自定义属性
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.isOperational = options.isOperational !== false;
    this.timestamp = new Date().toISOString();
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
  }
}

// 业务错误类型
class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, { statusCode: 404 });
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, { statusCode: 401 });
  }
}

// 使用
function getUser(id) {
  if (!userExists(id)) {
    throw new NotFoundError(`User ${id} not found`);
  }
  return user;
}
```

---

## 3. try-catch-finally

### 3.1 基本语法

```javascript
try {
  // 可能抛出错误的代码
  const result = riskyOperation();
} catch (error) {
  // 错误处理
  console.error("Error occurred:", error);
} finally {
  // 无论是否发生错误都会执行
  cleanup();
}
```

### 3.2 执行顺序

```javascript
function testOrder() {
  try {
    console.log("1: try block");
    return "from try";
  } catch (error) {
    console.log("2: catch block");
    return "from catch";
  } finally {
    console.log("3: finally block");
    // finally 中的 return 会覆盖 try/catch 的 return
    // return "from finally";
  }
}

console.log(testOrder());
// 输出：
// 1: try block
// 3: finally block
// from try
```

**finally 的特殊性**

```javascript
function testFinally() {
  try {
    return 1;
  } finally {
    return 2;  // 覆盖 try 的返回值
  }
}

console.log(testFinally());  // 2

// 实际执行顺序：
// 1. try 块执行，准备返回 1
// 2. finally 块执行，返回 2
// 3. finally 的返回值覆盖 try 的返回值
```

### 3.3 catch 绑定的省略（ES2019）

```javascript
// ES2019 前：必须指定错误变量
try {
  JSON.parse(invalidJSON);
} catch (error) {  // 即使不使用也要写
  console.log("Parse failed");
}

// ES2019+：可以省略
try {
  JSON.parse(invalidJSON);
} catch {
  console.log("Parse failed");
}
```

### 3.4 嵌套 try-catch

```javascript
try {
  console.log("Outer try");
  
  try {
    console.log("Inner try");
    throw new Error("Inner error");
  } catch (e) {
    console.log("Inner catch:", e.message);
    throw new Error("Re-throw from inner");
  }
  
  console.log("After inner try-catch");  // 不会执行
} catch (e) {
  console.log("Outer catch:", e.message);
}

// 输出：
// Outer try
// Inner try
// Inner catch: Inner error
// Outer catch: Re-throw from inner
```

---

## 4. 错误传播

### 4.1 错误冒泡

```javascript
function level3() {
  throw new Error("Level 3 error");
}

function level2() {
  level3();  // 未捕获，向上传播
}

function level1() {
  level2();  // 未捕获，向上传播
}

try {
  level1();
} catch (e) {
  console.error("Caught at top level:", e.message);
}
// Caught at top level: Level 3 error
```

### 4.2 重新抛出错误

```javascript
function processData(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    // 记录错误
    console.error("JSON parse failed:", e);
    
    // 重新抛出（可能包装成新错误）
    throw new Error(`Failed to process data: ${e.message}`);
  }
}

try {
  processData("invalid json");
} catch (e) {
  console.error("Final error:", e.message);
}
```

### 4.3 错误包装

```javascript
class ParseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = "ParseError";
    this.originalError = originalError;
  }
}

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new ParseError(
      "Failed to parse JSON",
      e  // 保留原始错误
    );
  }
}

try {
  parseJSON("{invalid}");
} catch (e) {
  console.error(e.message);  // "Failed to parse JSON"
  console.error(e.originalError);  // 原始 SyntaxError
}
```

---

## 5. 全局错误处理

### 5.1 浏览器环境

**window.onerror**

```javascript
// 捕获同步错误
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global error:", {
    message,
    source,
    lineno,
    colno,
    error
  });
  
  // 返回 true 阻止默认错误处理
  return true;
};

// 触发
throw new Error("Test error");
```

**addEventListener('error')**

```javascript
window.addEventListener('error', (event) => {
  console.error("Error event:", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  // 阻止默认行为
  event.preventDefault();
});
```

**unhandledrejection（Promise）**

```javascript
// 捕获未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  console.error("Unhandled promise rejection:", {
    reason: event.reason,  // 拒绝原因
    promise: event.promise  // Promise 对象
  });
  
  // 阻止默认警告
  event.preventDefault();
});

// 触发
Promise.reject("Unhandled rejection");

// 或
async function test() {
  throw new Error("Async error");
}
test();  // 未 await 或 .catch()
```

**rejectionhandled（延迟处理）**

```javascript
window.addEventListener('rejectionhandled', (event) => {
  console.log("Promise rejection handled:", event.reason);
});

// 场景：Promise 拒绝后延迟处理
const promise = Promise.reject("Error");
setTimeout(() => {
  promise.catch(e => console.log("Handled:", e));
}, 1000);
```

### 5.2 Node.js 环境

**process.on('uncaughtException')**

```javascript
// 捕获未捕获的同步错误
process.on('uncaughtException', (error, origin) => {
  console.error("Uncaught exception:", error);
  console.error("Origin:", origin);
  
  // 记录错误后退出进程
  logError(error);
  process.exit(1);
});

// 触发
throw new Error("Uncaught error");
```

**process.on('unhandledRejection')**

```javascript
// 捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  console.error("Promise:", promise);
  
  // 记录并退出
  logError(reason);
  process.exit(1);
});

// 触发
Promise.reject("Unhandled rejection");
```

---

## 6. 异步错误处理

### 6.1 回调函数

```javascript
// Node.js 错误优先回调
fs.readFile('/path/to/file', (err, data) => {
  if (err) {
    console.error("Read error:", err);
    return;
  }
  
  console.log(data);
});

// 自定义错误优先回调
function asyncOperation(callback) {
  setTimeout(() => {
    const error = null;  // 或 new Error("Something wrong")
    const result = "success";
    callback(error, result);
  }, 1000);
}

asyncOperation((err, result) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("Result:", result);
});
```

### 6.2 Promise

```javascript
// .catch() 方法
fetchData()
  .then(data => processData(data))
  .then(result => saveResult(result))
  .catch(error => {
    console.error("Error in chain:", error);
  });

// try-catch 在 Promise 中无效
try {
  Promise.reject("Error");  // 不会被捕获
} catch (e) {
  console.error("This won't run");
}

// 正确方式
Promise.reject("Error")
  .catch(e => console.error("Caught:", e));
```

### 6.3 async/await

```javascript
// ✅ try-catch 可以捕获 async 错误
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;  // 重新抛出或处理
  }
}

// ✅ 顶层 await 错误处理
try {
  const user = await fetchUser(123);
} catch (error) {
  console.error("User fetch failed:", error);
}

// ✅ Promise.all 错误处理
try {
  const [user, posts, comments] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
    fetchComments(1)
  ]);
} catch (error) {
  // 任一 Promise 拒绝都会进入这里
  console.error("Parallel fetch error:", error);
}

// ✅ Promise.allSettled（获取所有结果）
const results = await Promise.allSettled([
  fetchUser(1),
  fetchPosts(1),
  fetchComments(1)
]);

results.forEach((result, index) => {
  if (result.status === 'rejected') {
    console.error(`Request ${index} failed:`, result.reason);
  } else {
    console.log(`Request ${index} succeeded:`, result.value);
  }
});
```

---

## 7. 错误处理模式

### 7.1 错误优先回调

```javascript
function readFileAsync(path, callback) {
  // 错误优先：第一个参数是错误
  fs.readFile(path, (err, data) => {
    if (err) return callback(err);
    callback(null, data);
  });
}
```

### 7.2 Result 模式

```javascript
// 类似 Rust 的 Result<T, E>
class Result {
  constructor(value, error) {
    this.value = value;
    this.error = error;
  }
  
  static ok(value) {
    return new Result(value, null);
  }
  
  static err(error) {
    return new Result(null, error);
  }
  
  isOk() {
    return this.error === null;
  }
  
  isErr() {
    return this.error !== null;
  }
  
  unwrap() {
    if (this.isErr()) {
      throw this.error;
    }
    return this.value;
  }
  
  unwrapOr(defaultValue) {
    return this.isOk() ? this.value : defaultValue;
  }
}

// 使用
function divide(a, b) {
  if (b === 0) {
    return Result.err(new Error("Division by zero"));
  }
  return Result.ok(a / b);
}

const result = divide(10, 2);
if (result.isOk()) {
  console.log("Result:", result.unwrap());  // 5
} else {
  console.error("Error:", result.error);
}
```

### 7.3 Either 模式

```javascript
// 函数式编程中的 Either
class Either {
  constructor(value) {
    this.value = value;
  }
  
  static left(value) {
    return new Left(value);
  }
  
  static right(value) {
    return new Right(value);
  }
  
  static of(value) {
    return new Right(value);
  }
}

class Left extends Either {
  map() { return this; }
  flatMap() { return this; }
  fold(leftFn, rightFn) {
    return leftFn(this.value);
  }
}

class Right extends Either {
  map(fn) {
    return new Right(fn(this.value));
  }
  flatMap(fn) {
    return fn(this.value);
  }
  fold(leftFn, rightFn) {
    return rightFn(this.value);
  }
}

// 使用
function parseJSON(text) {
  try {
    return Either.right(JSON.parse(text));
  } catch (e) {
    return Either.left(e);
  }
}

const result = parseJSON('{"name":"Alice"}');
result.fold(
  error => console.error("Parse error:", error),
  data => console.log("Parsed:", data)
);
```

---

## 8. 工程化错误处理

### 8.1 统一错误处理中间件（Express）

```javascript
// 错误处理中间件
function errorHandler(err, req, res, next) {
  // 记录错误
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // 区分操作错误和程序错误
  if (err.isOperational) {
    // 操作错误：可预期的错误（如验证失败）
    res.status(err.statusCode || 500).json({
      error: {
        message: err.message,
        code: err.code
      }
    });
  } else {
    // 程序错误：bug，不暴露细节
    res.status(500).json({
      error: {
        message: "Internal server error"
      }
    });
  }
}

// 使用
app.use(errorHandler);
```

### 8.2 错误边界（React）

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // 记录错误
    logErrorToService(error, errorInfo.componentStack);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 8.3 错误上报

```javascript
class ErrorReporter {
  constructor(options) {
    this.endpoint = options.endpoint;
    this.appName = options.appName;
    this.environment = options.environment;
  }
  
  report(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      appName: this.appName,
      environment: this.environment,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    };
    
    // 发送到错误追踪服务
    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(err => {
      console.error("Failed to report error:", err);
    });
  }
}

// 使用
const reporter = new ErrorReporter({
  endpoint: 'https://errors.example.com/api/report',
  appName: 'my-app',
  environment: process.env.NODE_ENV
});

window.addEventListener('error', (event) => {
  reporter.report(event.error, {
    type: 'uncaught',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  reporter.report(
    event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason)),
    { type: 'unhandled-promise' }
  );
});
```

---

## 9. 易错点与最佳实践

### 9.1 不要吞掉错误

```javascript
// ❌ 静默失败
try {
  riskyOperation();
} catch (e) {
  // 什么都不做
}

// ✅ 至少记录错误
try {
  riskyOperation();
} catch (e) {
  console.error("Operation failed:", e);
  // 或上报错误
}
```

### 9.2 区分操作错误和程序错误

```javascript
// 操作错误：可预期的（如用户输入错误、网络超时）
class OperationalError extends Error {
  constructor(message) {
    super(message);
    this.isOperational = true;
  }
}

// 程序错误：bug（如空指针、类型错误）
// 使用标准 Error

// 处理
if (err.isOperational) {
  // 可以恢复，向用户展示友好消息
  res.status(400).json({ error: err.message });
} else {
  // 程序错误，记录并重启进程
  logger.error(err);
  process.exit(1);
}
```

### 9.3 Promise 错误处理

```javascript
// ❌ 忘记 catch
fetchData().then(data => process(data));

// ✅ 添加 catch
fetchData()
  .then(data => process(data))
  .catch(err => console.error(err));

// ✅ 使用 async/await
async function main() {
  try {
    const data = await fetchData();
    process(data);
  } catch (err) {
    console.error(err);
  }
}
```

### 9.4 finally 的陷阱

```javascript
// ❌ finally 中返回值会覆盖
function getData() {
  try {
    return fetchData();
  } finally {
    return null;  // 覆盖了 try 的返回值
  }
}

// ✅ finally 只用于清理
function getData() {
  try {
    return fetchData();
  } finally {
    cleanup();  // 不要 return
  }
}
```

---

## 关键要点

1. **Error 对象**
   - 标准属性：message、name、stack
   - 内置类型：SyntaxError、TypeError、ReferenceError 等
   - 自定义错误继承 Error

2. **try-catch-finally**
   - try：可能抛错的代码
   - catch：错误处理
   - finally：无论如何都执行（清理资源）
   - 执行顺序：try → catch（如果有错）→ finally

3. **全局错误处理**
   - 浏览器：window.onerror、unhandledrejection
   - Node.js：uncaughtException、unhandledRejection
   - 用于兜底，不应依赖

4. **异步错误处理**
   - 回调：错误优先回调
   - Promise：.catch() 或 try-catch（await）
   - async/await：try-catch 可以捕获

5. **最佳实践**
   - 不要吞掉错误
   - 区分操作错误和程序错误
   - 自定义错误类型
   - 统一错误处理
   - 错误上报与监控

---

## 深入一点

### 错误栈的生成

```javascript
// Error.captureStackTrace（V8）
function MyError(message) {
  this.message = message;
  
  // 捕获栈，排除 MyError 本身
  Error.captureStackTrace(this, MyError);
}

MyError.prototype = Object.create(Error.prototype);
MyError.prototype.name = "MyError";
```

### 错误的性能影响

```javascript
// 创建 Error 对象开销较大（需要捕获栈）
console.time("create error");
for (let i = 0; i < 1000; i++) {
  new Error("test");
}
console.timeEnd("create error");  // 约 50ms

// 抛出并捕获错误开销更大
console.time("throw error");
for (let i = 0; i < 1000; i++) {
  try {
    throw new Error("test");
  } catch (e) {}
}
console.timeEnd("throw error");  // 约 100ms

// 建议：不要用异常控制正常流程
```

---

## 参考资料

- [MDN: Error](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: try...catch](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/try...catch)
- [Error Handling in Node.js](https://nodejs.org/en/docs/guides/error-handling/)
- [Joyent's Best Practices for Error Handling](https://www.joyent.com/node-js/production/design/errors)

---

**上一章**：[调用栈与执行流程](./content-10.md)  
**下一章**：[对象模型深入](./content-12.md)
