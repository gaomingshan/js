# JavaScript 系统化学习大纲

> 本大纲面向有编程经验但未系统学习 JavaScript 的开发者，帮助你建立完整的 JS 心智模型，掌握语言核心机制与工程实践。

---

## 学习路径

**基础 → 类型与执行 → 对象与函数 → 异步编程 → 引擎优化 → 宿主环境 → 现代特性 → 工程实践**

---

## 第一部分：JavaScript 语言基础

### 1. [JavaScript 语言特性与设计理念](./content/content-1.md)
**解决问题**：理解 JS 的诞生背景、语言特性及与其他语言的本质差异

- JS 的历史演进：从浏览器脚本到全栈语言
- 核心特性：动态类型、弱类型、单线程、事件驱动
- 与 Java、Python、TypeScript 的对比
- ECMAScript 标准与 TC39 提案流程
- 运行环境：浏览器 vs Node.js

### 2. [变量声明与作用域基础](./content/content-2.md)
**解决问题**：掌握变量声明机制，避免作用域陷阱

- var、let、const 的区别与使用场景
- 变量提升（Hoisting）的本质
- 暂时性死区（TDZ）
- 全局对象与全局变量的关系
- 块级作用域的引入与影响

### 3. [数据类型概览](./content/content-3.md)
**解决问题**：建立 JS 类型系统的整体认知

- 7 种原始类型：Undefined、Null、Boolean、Number、String、Symbol、BigInt
- 对象类型（Object）与引用传递
- 包装对象机制：原始值如何调用方法
- Symbol 的应用场景
- BigInt 的引入与大整数处理

---

## 第二部分：类型系统与转换

### 4. [类型系统深入](./content/content-4.md)
**解决问题**：理解类型的内部表示与行为差异

- 类型的内部表示（Type Tag）
- 原始值 vs 引用值的本质区别
- 值的不可变性与引用传递
- 类型与内存布局
- 后端开发者常见的类型误解

### 5. [类型判断方法](./content/content-5.md)
**解决问题**：准确判断各种类型，避免判断陷阱

- typeof 运算符的原理与局限
- instanceof 的原理与边界情况
- Object.prototype.toString 的通用判断法
- Array.isArray 与类数组判断
- 自定义类型判断函数的实现

### 6. [类型转换规则](./content/content-6.md)
**解决问题**：掌握类型转换的完整规则，避免转换陷阱

- 显式转换：Number()、String()、Boolean()
- ToPrimitive 抽象操作
- Symbol.toPrimitive 的自定义转换
- == vs === 的转换逻辑详解
- JSON.stringify 的转换规则
- 常见类型转换陷阱与工程实践

---

## 第三部分：执行模型核心

### 7. [执行上下文与作用域链](./content/content-7.md)
**解决问题**：理解 JS 代码的执行过程与变量查找机制

- 执行上下文的创建阶段与执行阶段
- 词法环境（Lexical Environment）与变量环境
- 变量对象（VO）与活动对象（AO）
- 作用域链的构建与查找机制
- [[Scope]] 内部属性
- with 与 eval 对作用域链的影响

### 8. [闭包原理与应用](./content/content-8.md)
**解决问题**：掌握闭包的本质、应用场景与性能影响

- 闭包的形成条件与本质
- 闭包的内存模型
- 典型应用场景：模块模式、私有变量、柯里化
- 循环中的闭包陷阱
- 闭包与内存泄漏
- 工程实践中的闭包优化

### 9. [this 绑定机制](./content/content-9.md)
**解决问题**：彻底理解 this 的绑定规则，避免 this 丢失

- this 的四种绑定规则：默认、隐式、显式、new
- 绑定优先级
- 箭头函数的 this 特性
- call、apply、bind 的原理与手写实现
- 严格模式下的 this
- 工程中的 this 陷阱与最佳实践

### 10. [调用栈与执行流程](./content/content-10.md)
**解决问题**：理解函数调用的底层机制与栈管理

- 调用栈的工作原理
- 栈帧（Stack Frame）的结构
- 栈溢出（Stack Overflow）的原因与解决
- 尾调用优化（TCO）
- 递归与迭代的选择
- 调用栈的调试技巧

### 11. [错误处理机制](./content/content-11.md)
**解决问题**：建立完善的错误处理体系

- Error 对象与错误类型体系
- try-catch-finally 的执行顺序
- 错误冒泡与捕获机制
- 全局错误处理：window.onerror、unhandledrejection
- 自定义错误类
- 工程化错误处理实践

---

## 第四部分：对象与原型系统

### 12. [对象模型深入](./content/content-12.md)
**解决问题**：理解对象的内部结构与属性特性

- 对象的内部结构与内部插槽
- 属性描述符：数据属性 vs 访问器属性
- Object.defineProperty 的使用
- 对象的可扩展性、密封、冻结
- 属性遍历的多种方式
- 对象的创建模式

### 13. [原型链机制](./content/content-13.md)
**解决问题**：掌握原型链的查找规则与对象关系

- prototype 与 __proto__ 的区别
- 原型链的查找规则
- Function 与 Object 的关系
- constructor 属性的作用
- instanceof 的原理与实现
- 原型污染风险与防范

### 14. [继承模式演进](./content/content-14.md)
**解决问题**：理解 JS 继承的演进历程与最佳实践

- 原型链继承及其问题
- 构造函数继承（借用构造函数）
- 组合继承的优缺点
- 原型式继承与寄生式继承
- 寄生组合式继承（最优方案）
- ES6 Class 继承的本质
- 继承模式的选择建议

### 15. [类与构造函数](./content/content-15.md)
**解决问题**：理解构造函数与 Class 的本质

- 构造函数的执行过程
- new 运算符的原理与手写实现
- ES6 Class 语法糖的本质
- 静态方法与实例方法
- 私有字段（Private Fields）
- Class 与构造函数的对比

---

## 第五部分：函数深入

### 16. [函数类型与特性](./content/content-16.md)
**解决问题**：掌握函数的多种形式与特性差异

- 函数声明 vs 函数表达式
- 箭头函数的特性与限制
- IIFE（立即执行函数表达式）
- 函数参数：默认值、剩余参数、解构
- 函数的 length、name、arguments 属性

### 17. [高阶函数与函数式编程](./content/content-17.md)
**解决问题**：掌握函数式编程思想与实践

- 高阶函数的概念与应用
- 柯里化（Currying）的原理与实现
- 偏函数（Partial Application）
- 函数组合（Compose）与管道（Pipe）
- 纯函数与副作用
- 不可变数据与函数式实践

### 18. [迭代器与生成器](./content/content-18.md)
**解决问题**：理解迭代协议与生成器的应用

- 迭代协议（Iterator Protocol）
- 可迭代对象与 for...of 循环
- 生成器函数（Generator）的语法
- yield 表达式与双向通信
- 生成器的实际应用场景
- 迭代器与生成器的手写实现

---

## 第六部分：异步编程模型

### 19. [异步基础与回调模式](./content/content-19.md)
**解决问题**：理解异步的本质与回调模式的问题

- 同步 vs 异步的本质区别
- 回调函数模式
- 回调地狱（Callback Hell）
- 控制反转问题
- 错误优先回调（Error-First Callback）
- Thunk 函数

### 20. [Promise 原理与实践](./content/content-20.md)
**解决问题**：掌握 Promise 的状态机模型与应用

- Promise 的状态机：pending、fulfilled、rejected
- Promise 的创建与链式调用
- then、catch、finally 的执行顺序
- Promise 静态方法：all、race、allSettled、any
- Promise 的错误处理
- 手写 Promise 实现（符合 Promises/A+）

### 21. [async/await 深入](./content/content-21.md)
**解决问题**：掌握 async/await 的本质与最佳实践

- async 函数的本质（Promise + Generator）
- await 的执行机制与暂停恢复
- 错误处理：try-catch vs .catch()
- 并发控制：顺序执行 vs 并行执行
- 顶层 await（Top-Level Await）
- async/await 最佳实践

### 22. [事件循环机制](./content/content-22.md)
**解决问题**：理解事件循环的完整机制

- 宏任务（Macro Task）vs 微任务（Micro Task）
- 事件循环的执行顺序
- 浏览器事件循环 vs Node.js 事件循环
- requestAnimationFrame 与渲染时机
- queueMicrotask 的使用
- 事件循环与性能优化

### 23. [异步迭代器](./content/content-23.md)
**解决问题**：处理异步数据流

- 异步迭代协议（Async Iterator Protocol）
- for await...of 循环
- 异步生成器（Async Generator）
- 流式数据处理
- 异步迭代器的实际应用
- 与 Promise 的结合使用

---

## 第七部分：引擎优化与内存管理

### 24. [V8 引擎原理](./content/content-24.md)
**解决问题**：理解 JS 代码的编译与优化过程

- V8 引擎架构概览
- Parser：解析与 AST 生成
- Ignition 解释器
- TurboFan 优化编译器
- 隐藏类（Hidden Class）机制
- 内联缓存（Inline Cache）

### 25. [JIT 编译优化](./content/content-25.md)
**解决问题**：编写引擎友好的高性能代码

- JIT 编译的基本策略
- 热点代码识别
- 优化触发条件
- 去优化（Deoptimization）的原因
- 单态、多态、超态调用
- 编写引擎友好的代码

### 26. [垃圾回收机制](./content/content-26.md)
**解决问题**：理解内存管理，避免内存泄漏

- 内存分代策略：新生代 vs 老生代
- Scavenge 算法（新生代）
- Mark-Sweep 与 Mark-Compact（老生代）
- 增量标记与三色标记
- 写屏障（Write Barrier）
- 内存泄漏的常见场景与检测

---

## 第八部分：宿主环境与 Web API

### 27. [DOM 操作与性能优化](./content/content-27.md)
**解决问题**：高效操作 DOM，优化渲染性能

- DOM 树结构与节点类型
- 节点查询与操作 API
- DocumentFragment 批量操作
- 重排（Reflow）与重绘（Repaint）
- 关键渲染路径
- 虚拟 DOM 的思想

### 28. [事件系统深入](./content/content-28.md)
**解决问题**：掌握事件机制与优化模式

- 事件流：捕获阶段、目标阶段、冒泡阶段
- 事件委托模式
- 自定义事件（CustomEvent）
- 事件循环与事件队列的关系
- 防抖（Debounce）与节流（Throttle）
- 事件性能优化

### 29. [BOM 与浏览器 API](./content/content-29.md)
**解决问题**：掌握浏览器提供的核心 API

- Window 对象与全局作用域
- 浏览器导航与历史管理（History API）
- 定时器：setTimeout 与 setInterval 的陷阱
- requestIdleCallback 与任务调度
- Web Workers 多线程
- Service Worker 与离线应用

### 30. [网络请求与通信](./content/content-30.md)
**解决问题**：掌握前端网络通信方式

- XMLHttpRequest 的原理
- Fetch API 的使用与封装
- CORS 跨域机制详解
- WebSocket 实时通信
- SSE（Server-Sent Events）
- 请求取消与超时处理

---

## 第九部分：现代 JavaScript 特性

### 31. [ES6+ 核心特性](./content/content-31.md)
**解决问题**：掌握现代 JS 的语法糖与新特性

- 解构赋值的深入用法
- 模板字符串与标签模板
- 扩展运算符与剩余运算符
- 可选链（Optional Chaining）
- 空值合并运算符（Nullish Coalescing）
- 装饰器（Decorator）提案

### 32. [模块系统](./content/content-32.md)
**解决问题**：理解模块化规范与工程实践

- CommonJS vs ES Module 的本质区别
- import 与 export 语法详解
- 动态导入（Dynamic Import）
- 循环依赖的处理
- Tree Shaking 原理
- 模块的最佳实践

### 33. [Proxy 与 Reflect](./content/content-33.md)
**解决问题**：掌握元编程能力

- Proxy 的 13 种拦截操作
- Reflect API 的设计目的
- 响应式系统原理（Vue 3 Reactivity）
- Proxy vs Object.defineProperty
- 性能考量与应用场景
- 实战：实现简单的响应式系统

### 34. [并发与并行](./content/content-34.md)
**解决问题**：理解 JS 的并发模型与多线程

- SharedArrayBuffer 与内存共享
- Atomics 原子操作
- 内存模型与竞态条件
- Futex 锁机制
- Web Workers 的通信模式
- 并发编程的最佳实践

---

## 第十部分：工程实践与最佳实践

### 35. [错误处理与调试](./content/content-35.md)
**解决问题**：建立完善的错误处理与调试体系

- 错误边界与降级策略
- Source Map 原理与使用
- Chrome DevTools 调试技巧
- 性能分析工具：Performance、Memory
- 日志系统设计
- 错误监控与上报

### 36. [测试与质量保证](./content/content-36.md)
**解决问题**：建立测试体系，保证代码质量

- 单元测试 vs 集成测试 vs E2E 测试
- Jest 测试框架
- Mock、Stub、Spy 的使用
- 测试覆盖率的意义
- TDD 与 BDD 实践
- 测试的最佳实践

### 37. [性能优化综合实践](./content/content-37.md)
**解决问题**：系统性地优化前端性能

- 加载性能优化：代码分割、懒加载、预加载
- 运行时性能优化：防抖节流、虚拟滚动
- 内存优化：避免泄漏、优化数据结构
- 渲染性能优化：减少重排重绘
- 性能监控与分析
- 性能优化的完整方法论

---

## 附录：面试题汇总

### [JavaScript 面试题精选（100 题）](./quiz/quiz.md)

**题型分布**：
- 基础题（30 题）：语法、类型、作用域、原型基础
- 原理题（40 题）：执行上下文、闭包、this、事件循环、原型链
- 综合题（30 题）：代码输出、手写实现、场景分析

**难度递进**：
- 简单（30 题）：考查基础概念理解
- 中等（40 题）：考查原理掌握与应用
- 困难（30 题）：考查深度理解与综合运用

---

## 学习建议

1. **按顺序学习**：大纲按难度递进设计，建议顺序学习
2. **动手实践**：每个章节的示例代码都应该自己敲一遍
3. **深入思考**：理解"为什么"比记住"是什么"更重要
4. **对比学习**：结合你熟悉的语言进行对比思考
5. **工程视角**：学习时思考如何应用到实际项目中
6. **查漏补缺**：完成面试题后，针对薄弱环节重点学习

---

## 学习路径图

```
入门阶段（第 1-3 章）
  ↓ 理解语言特性与类型系统
  
类型与执行（第 4-11 章）
  ↓ 建立执行模型心智
  
对象与函数（第 12-18 章）
  ↓ 掌握面向对象与函数式编程
  
异步编程（第 19-23 章）
  ↓ 理解异步模型与事件循环
  
引擎优化（第 24-26 章）
  ↓ 编写高性能代码
  
宿主环境（第 27-30 章）
  ↓ 掌握浏览器 API
  
现代特性（第 31-34 章）
  ↓ 使用现代 JS 特性
  
工程实践（第 35-37 章）
  ↓ 建立工程化思维
  
面试准备（quiz.md）
  ↓ 检验学习成果
```

---

**预计学习时间**：40-60 小时（取决于基础与学习深度）

**适合人群**：
- ✅ 有其他语言编程经验的开发者
- ✅ 使用过 JS 但理解碎片化的前端开发者
- ✅ 希望系统掌握 JS 底层原理的学习者
- ✅ 准备前端面试的候选人

**不适合人群**：
- ❌ 完全没有编程经验的初学者
- ❌ 只想快速上手框架的学习者

---

© 2024 JavaScript 系统化学习 | 本内容专注于 JavaScript 语言本身，不涉及具体框架
