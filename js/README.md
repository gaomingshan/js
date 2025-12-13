# JavaScript 深度学习系统

> 从基础到原理，从应用到规范 —— 体系化掌握 JavaScript

## 📊 学习路线图

**总计：27 章节 + 附录**

```
基础篇 (8章) → 进阶篇 (5章)
    ↓
深入原理篇 (14章) → 附录 (6章)
```

---

## 📖 第一部分：基础篇（8 章）

**学习目标**：掌握 JavaScript 核心语法和常用 API

### 第 1 章：JavaScript 基础与语法

- [JavaScript 简介与发展史](./basics/01-intro.md)
- [变量声明（var/let/const）](./basics/01-variables.md)
- [数据类型详解](./basics/01-datatypes.md)
- [类型转换与判断](./basics/01-type-conversion.md)

**面试题**：[第 1 章面试题](./quiz/chapter-01.md)

### 第 2 章：运算符与表达式

- [运算符完全指南](./basics/02-operators.md)
- [表达式与优先级](./basics/02-expressions.md)

**面试题**：[第 2 章面试题](./quiz/chapter-02.md)

### 第 3 章：流程控制与异常处理

- [条件语句（if/switch）](./basics/03-conditionals.md)
- [循环语句详解](./basics/03-loops.md)
- [异常处理机制](./basics/03-error-handling.md)

**面试题**：[第 3 章面试题](./quiz/chapter-03.md)

### 第 4 章：函数与作用域

- [函数基础](./basics/04-function-basics.md)
- [闭包原理与应用](./basics/04-closure.md)
- [this 绑定规则](./basics/04-this.md)
- [箭头函数详解](./basics/04-arrow-function.md)
- [高阶函数与柯里化](./basics/04-function-advanced.md)

**面试题**：[第 4 章面试题](./quiz/chapter-04.md)

### 第 5 章：对象与原型

- [原型与原型链](./basics/05-prototype.md)
- [Class 语法详解](./basics/05-class.md)
- [对象常用方法](./basics/05-object-methods.md)

**面试题**：[第 5 章面试题](./quiz/chapter-05.md)

### 第 6 章：数组与常用方法

- [数组高阶方法](./basics/06-array-methods.md)
- [数组高级操作](./basics/06-array-advanced.md)
- [TypedArray](./basics/06-typed-array.md)

**面试题**：[第 6 章面试题](./quiz/chapter-06.md)

### 第 7 章：字符串与正则表达式

- [字符串操作详解](./basics/07-strings.md)
- [正则表达式完全指南](./basics/07-regex.md)

**面试题**：[第 7 章面试题](./quiz/chapter-07.md)

### 第 8 章：内置对象与数据结构

- [Math 与 Date](./basics/08-math-date.md)
- [Set 与 Map](./basics/08-set-map.md)
- [Symbol 与 BigInt](./basics/08-symbol-bigint.md)

**面试题**：[第 8 章面试题](./quiz/chapter-08.md)

---

## 🔧 第二部分：进阶篇（5 章）

**学习目标**：深入异步编程、模块化和工程实践

### 第 9 章：异步编程

- [回调函数模式](./advanced/09-callbacks.md)
- [Promise 详解](./advanced/09-promises.md)
- [async/await 语法](./advanced/09-async-await.md)
- [事件循环机制](./advanced/09-event-loop.md)

**面试题**：[第 9 章面试题](./quiz/chapter-09.md)

### 第 10 章：DOM 操作与事件

- [DOM 树与节点操作](./advanced/10-dom.md)
- [事件系统详解](./advanced/10-events.md)

**面试题**：[第 10 章面试题](./quiz/chapter-10.md)

### 第 11 章：BOM 与浏览器 API

- [浏览器对象模型](./advanced/11-bom.md)
- [本地存储方案](./advanced/11-storage.md)
- [网络请求（Fetch API）](./advanced/11-fetch.md)

**面试题**：[第 11 章面试题](./quiz/chapter-11.md)

### 第 12 章：模块化与包管理

- [ES6 模块系统](./advanced/12-modules.md)
- [CommonJS 规范](./advanced/12-commonjs.md)

**面试题**：[第 12 章面试题](./quiz/chapter-12.md)

### 第 13 章：工程化与构建

- [Babel 转译原理](./advanced/13-babel.md)
- [Webpack 构建流程](./advanced/13-webpack.md)

**面试题**：[第 13 章面试题](./quiz/chapter-13.md)

---

## 🔬 第三部分：深入原理篇（14 章）

**学习目标**：深入 ECMAScript 规范、引擎实现和语言设计思想

### 第 14 章：执行上下文与作用域链

- [执行上下文详解](./deep-dive/14-execution-context.md)
- [作用域链的本质](./deep-dive/14-scope-chain.md)
- [闭包的内存模型](./deep-dive/14-closure-memory.md)

**面试题**：[第 14 章面试题](./quiz/chapter-14.md)

### 第 15 章：原型系统深入

- [原型链的底层实现](./deep-dive/15-prototype-chain.md)
- [构造函数与 new 操作符](./deep-dive/15-constructor.md)
- [继承模式演进史](./deep-dive/15-inheritance.md)

**面试题**：[第 15 章面试题](./quiz/chapter-15.md)

### 第 16 章：类型系统与转换

- [类型强制转换规范](./deep-dive/16-type-coercion.md)
- [相等性比较算法](./deep-dive/16-equality.md)
- [装箱与拆箱](./deep-dive/16-boxing.md)

**面试题**：[第 16 章面试题](./quiz/chapter-16.md)

### 第 17 章：迭代器与生成器协议

- [迭代器协议（Iterator Protocol）](./deep-dive/17-iterator-protocol.md)
- [可迭代协议（Iterable Protocol）](./deep-dive/17-iterable-protocol.md)
- [生成器函数深入](./deep-dive/17-generator.md)
- [异步迭代器协议](./deep-dive/17-async-iterator.md)

**面试题**：[第 17 章面试题](./quiz/chapter-17.md)

### 第 18 章：Promise 规范与实现

- [Promise/A+ 规范](./deep-dive/18-promise-aplus.md)
- [Thenable 协议](./deep-dive/18-thenable.md)
- [微任务队列机制](./deep-dive/18-microtask.md)

**面试题**：[第 18 章面试题](./quiz/chapter-18.md)

### 第 19 章：事件循环与并发模型

- [事件循环规范详解](./deep-dive/19-event-loop-spec.md)
- [宏任务与微任务](./deep-dive/19-task-queue.md)
- [JavaScript 并发模型](./deep-dive/19-concurrency.md)

**面试题**：[第 19 章面试题](./quiz/chapter-19.md)

### 第 20 章：元编程与反射

- [Proxy 代理机制](./deep-dive/20-proxy.md)
- [Reflect API 详解](./deep-dive/20-reflect.md)
- [元编程实践](./deep-dive/20-metaprogramming.md)

**面试题**：[第 20 章面试题](./quiz/chapter-20.md)

### 第 21 章：内存管理与垃圾回收

- [JavaScript 内存模型](./deep-dive/21-memory-model.md)
- [垃圾回收算法](./deep-dive/21-gc.md)
- [内存泄漏分析](./deep-dive/21-memory-leak.md)

**面试题**：[第 21 章面试题](./quiz/chapter-21.md)

### 第 22 章：V8 引擎优化

- [V8 内部机制](./deep-dive/22-v8-internals.md)
- [JIT 编译优化](./deep-dive/22-jit.md)
- [隐藏类与内联缓存](./deep-dive/22-hidden-class.md)

**面试题**：[第 22 章面试题](./quiz/chapter-22.md)

### 第 23 章：ES6+ 新特性深入

- [解构赋值的底层实现](./deep-dive/23-destructuring.md)
- [扩展运算符与剩余参数](./deep-dive/23-spread-rest.md)
- [模板字符串标签函数](./deep-dive/23-template-literals.md)
- [可选链与空值合并](./deep-dive/23-optional-chaining.md)

**面试题**：[第 23 章面试题](./quiz/chapter-23.md)

### 第 24 章：模块加载机制

- [模块解析算法](./deep-dive/24-module-resolution.md)
- [模块依赖图](./deep-dive/24-module-graph.md)
- [动态导入机制](./deep-dive/24-dynamic-import.md)

**面试题**：[第 24 章面试题](./quiz/chapter-24.md)

### 第 25 章：高级类型特性

- [Symbol 内部槽位](./deep-dive/25-symbol-internals.md)
- [Well-Known Symbols](./deep-dive/25-well-known-symbols.md)
- [私有字段实现](./deep-dive/25-private-fields.md)

**面试题**：[第 25 章面试题](./quiz/chapter-25.md)

### 第 26 章：共享内存与原子操作

- [SharedArrayBuffer](./deep-dive/26-shared-array-buffer.md)
- [Atomics API](./deep-dive/26-atomics.md)
- [内存序与同步](./deep-dive/26-memory-ordering.md)

**面试题**：[第 26 章面试题](./quiz/chapter-26.md)

### 第 27 章：TC39 提案与未来特性

- [TC39 提案流程](./deep-dive/27-tc39-process.md)
- [各阶段特性概览](./deep-dive/27-stage-features.md)
- [模式匹配（提案）](./deep-dive/27-pattern-matching.md)

**面试题**：[第 27 章面试题](./quiz/chapter-27.md)

---

## 📋 附录

- [JavaScript 设计模式](./appendix/design-patterns.md)
- [最佳实践与代码规范](./appendix/best-practices.md)
- [性能优化指南](./appendix/performance.md)
- [安全防护实践](./appendix/security.md)
- [调试技巧大全](./appendix/debugging.md)
- [学习资源推荐](./appendix/resources.md)

---

## 📁 目录结构

```
js/
├── README.md              # 本文件：总大纲和导航
├── basics/                # 📖 基础篇内容
├── advanced/              # 🔧 进阶篇内容
├── deep-dive/             # 🔬 深入原理篇内容
├── appendix/              # 📋 附录内容
└── quiz/                  # 💯 面试题
```

---

## 🎯 学习建议

1. **夯实基础**：第一部分的基础语法是后续所有内容的基石，请务必扎实掌握。
2. **动手实践**：JavaScript 是一门实践性很强的语言，建议配合控制台或编辑器多写代码。
3. **深入原理**：第三部分会涉及引擎底层，理解这些原理有助于写出更高效、更安全的代码。
4. **关注规范**：JavaScript 发展迅速，保持对 TC39 提案的关注能让你把握语言的发展方向。

---

## 📝 使用说明

- **内容学习**：点击各章节下的链接查看详细知识点（Markdown 格式）。
- **面试刷题**：点击 `quiz/` 下的链接进行题目练习。
- **预览模式**：建议在 VS Code 中使用 `Ctrl+Shift+V` 预览本文件。

---

**开始学习** → [第 1 章：JavaScript 简介与发展史](./basics/01-intro.md)
