# 调试技巧大全

## 概述

掌握调试技巧可以极大提高开发效率，快速定位和解决问题。

---

## 一、Console API

### 1.1 基本输出

```js
// 普通日志
console.log('Message');
console.log('Multiple', 'arguments', 123);

// 警告
console.warn('Warning message');

// 错误
console.error('Error message');

// 信息
console.info('Info message');

// 调试
console.debug('Debug message');
```

### 1.2 格式化输出

```js
// 字符串替换
console.log('User: %s, Age: %d', 'Alice', 25);

// CSS 样式
console.log(
  '%c大标题',
  'color: red; font-size: 20px; font-weight: bold'
);

// 对象
const user = { name: 'Alice', age: 25 };
console.log('%o', user);  // 对象
console.log('%O', user);  // 详细对象
```

### 1.3 表格显示

```js
const users = [
  { name: 'Alice', age: 25, role: 'admin' },
  { name: 'Bob', age: 30, role: 'user' },
  { name: 'Charlie', age: 35, role: 'user' }
];

console.table(users);

// 指定列
console.table(users, ['name', 'age']);
```

### 1.4 分组

```js
console.group('User Details');
console.log('Name: Alice');
console.log('Age: 25');
console.groupEnd();

// 默认折叠
console.groupCollapsed('Collapsed Group');
console.log('Hidden by default');
console.groupEnd();
```

### 1.5 计时

```js
console.time('loop');
for (let i = 0; i < 1000000; i++) {}
console.timeEnd('loop');
// loop: 2.5ms

// 多个计时器
console.time('fetch');
await fetch('/api/data');
console.timeEnd('fetch');

console.time('process');
processData();
console.timeEnd('process');
```

### 1.6 计数

```js
function clickHandler() {
  console.count('Click');
}

// 第 1 次：Click: 1
// 第 2 次：Click: 2
// 第 3 次：Click: 3

// 重置计数
console.countReset('Click');
```

### 1.7 断言

```js
const age = 15;
console.assert(age >= 18, 'Age must be 18 or older');
// Assertion failed: Age must be 18 or older

// 只在条件为 false 时输出
console.assert(true, 'This will not show');
```

### 1.8 堆栈追踪

```js
function outer() {
  inner();
}

function inner() {
  console.trace('Stack trace');
}

outer();
// Stack trace
//   at inner (...)
//   at outer (...)
//   at ...
```

---

## 二、断点调试

### 2.1 debugger 语句

```js
function complexFunction(data) {
  debugger;  // 程序在此暂停
  const result = transform(data);
  return result;
}
```

### 2.2 Chrome DevTools 断点

**类型**：
- **行断点**：点击行号
- **条件断点**：右键 → 添加条件断点
- **DOM 断点**：Elements 面板 → Break on
- **XHR/Fetch 断点**：Sources 面板 → XHR/fetch Breakpoints
- **事件监听断点**：Sources 面板 → Event Listener Breakpoints

```js
// 条件断点示例
for (let i = 0; i < 100; i++) {
  // 右键设置条件：i === 50
  processItem(i);
}
```

### 2.3 Logpoints

```js
// 不暂停执行，只输出日志
// Chrome DevTools → 右键行号 → Add logpoint
// 输入：'Value:', value
```

---

## 三、性能分析

### 3.1 Performance API

```js
// 标记时间点
performance.mark('start-render');
renderComponent();
performance.mark('end-render');

// 测量时间间隔
performance.measure('render-time', 'start-render', 'end-render');

// 获取测量结果
const measures = performance.getEntriesByType('measure');
console.log(measures[0].duration);

// 清理
performance.clearMarks();
performance.clearMeasures();
```

### 3.2 Performance 面板

```js
// 1. 打开 Chrome DevTools
// 2. 切换到 Performance 面板
// 3. 点击 Record
// 4. 执行操作
// 5. 点击 Stop
// 6. 分析火焰图
```

### 3.3 Coverage 工具

```bash
# 查看代码覆盖率
# Chrome DevTools → More tools → Coverage
# 点击 Record → 执行操作 → 停止
# 查看未使用的代码（红色部分）
```

---

## 四、内存分析

### 4.1 Memory 面板

```js
// 1. 打开 Chrome DevTools → Memory
// 2. 选择 Heap snapshot
// 3. Take snapshot
// 4. 执行操作
// 5. Take another snapshot
// 6. 对比快照查找内存泄漏
```

### 4.2 检测内存泄漏

```js
// 常见内存泄漏
// 1. 未清理的事件监听器
const handler = () => {};
element.addEventListener('click', handler);
// 记得：element.removeEventListener('click', handler);

// 2. 未清理的定时器
const timer = setInterval(() => {}, 1000);
// 记得：clearInterval(timer);

// 3. 闭包引用
function createClosure() {
  const largeData = new Array(1000000);
  return function() {
    console.log(largeData.length);
  };
}

// 4. DOM 引用
const element = document.getElementById('myElement');
document.body.removeChild(element);
// element 仍然保留引用
```

---

## 五、网络调试

### 5.1 Network 面板

```js
// 查看网络请求
// Chrome DevTools → Network
// - 查看请求/响应头
// - 查看请求/响应体
// - 查看时间线
// - 过滤请求类型
```

### 5.2 模拟网络条件

```js
// Chrome DevTools → Network → Throttling
// - Fast 3G
// - Slow 3G
// - Offline
```

### 5.3 拦截请求

```js
// 使用 Service Worker 拦截
self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  event.respondWith(fetch(event.request));
});
```

---

## 六、Source Maps

### 6.1 启用 Source Maps

```js
// webpack.config.js
module.exports = {
  devtool: 'source-map'  // 生产环境用 hidden-source-map
};
```

### 6.2 调试压缩代码

```js
// 有了 Source Map，可以在原始代码中设置断点
// Chrome DevTools 会自动映射到源代码
```

---

## 七、远程调试

### 7.1 Chrome Remote Debugging

```bash
# Android 设备
# 1. 启用 USB 调试
# 2. 连接设备
# 3. Chrome 访问 chrome://inspect
# 4. 选择设备和页面
```

### 7.2 Safari Web Inspector

```bash
# iOS 设备
# 1. 设置 → Safari → 高级 → Web 检查器
# 2. 连接设备
# 3. Safari → 开发 → 选择设备
```

---

## 八、调试技巧

### 8.1 快速定位问题

```js
// 二分法
// 注释掉一半代码，看问题是否还存在

// 日志大法
console.log('Checkpoint 1');
// ...
console.log('Checkpoint 2');
// ...
console.log('Checkpoint 3');

// 使用 try-catch
try {
  riskyOperation();
} catch (error) {
  console.error('Error:', error);
  console.trace();
}
```

### 8.2 监视变量

```js
// Chrome DevTools → Sources → Watch
// 添加表达式监视变量变化
```

### 8.3 调用堆栈

```js
// Chrome DevTools → Sources → Call Stack
// 查看函数调用链
```

### 8.4 Live Expressions

```js
// Chrome DevTools → Console → Live Expression
// 实时监视表达式的值
// 例如：document.querySelectorAll('div').length
```

---

## 九、常用调试命令

### 9.1 Chrome DevTools 快捷键

```
Ctrl+Shift+P (Cmd+Shift+P)  - 命令面板
Ctrl+Shift+C (Cmd+Shift+C)  - 选择元素
Ctrl+Shift+J (Cmd+Opt+J)    - 打开控制台
F8                          - 暂停/继续
F10                         - 单步跳过
F11                         - 单步进入
Shift+F11                   - 单步退出
```

### 9.2 Console 特殊变量

```js
$_          // 上一个表达式的结果
$0          // 当前选中的元素
$1          // 上一个选中的元素
$$('div')   // document.querySelectorAll('div')
$x('//p')   // XPath 查询
```

---

## 十、最佳实践

1. **善用断点**：比 console.log 更高效。
2. **使用 Source Maps**：调试压缩代码必备。
3. **性能分析**：定期检查性能瓶颈。
4. **内存监控**：及时发现内存泄漏。
5. **网络优化**：分析请求，减少加载时间。

---

## 参考资料

- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Firefox Developer Tools](https://firefox-source-docs.mozilla.org/devtools-user/)
- [Safari Web Inspector](https://webkit.org/web-inspector/)
