# JavaScript 简介与发展史

## 概述

JavaScript 是 Web 端最核心的编程语言之一：从浏览器里的简单脚本，演进为覆盖前端、后端（Node.js）、跨端（Electron/React Native）乃至边缘计算的通用语言。

理解它的历史与标准化体系（ECMAScript/TC39）、运行时结构（引擎 + 宿主环境），能帮助你在后续学习中更精准地区分“语言特性”与“环境特性”，也更容易理解各种设计取舍。

---

## 一、JavaScript 的诞生

### 1.1 关键人物与时间线

- **1995**：Brendan Eich 在 Netscape 用很短时间设计出 JavaScript（早期名为 Mocha/LiveScript）。
- **命名误区**：JavaScript 与 Java 并非“同一体系”，更像历史营销因素。

> **提示**
>
> JavaScript 的设计目标之一是“让非专业开发者也能快速写出网页交互”，这解释了它早期语法上兼顾“易用”与“表达力”的折中。

### 1.2 早期设计目标

- 为网页提供交互能力（表单校验、简单动画、事件处理）
- 与 HTML/CSS 配合形成“可编程的文档”

---

## 二、ECMAScript 与标准化

### 2.1 ECMAScript 是什么

- **ECMAScript（ES）**：JavaScript 的**语言标准**（ECMA-262）。
- JavaScript = ECMAScript（语法与内置对象） + 宿主提供的 API（DOM、Fetch、Timers 等）。

> **关键区分**
>
> - `Promise`、`Map`、`Proxy` 属于 ECMAScript。
> - `setTimeout`、`document.querySelector`、`fetch` 属于宿主环境（浏览器/Node）。

### 2.2 TC39 与提案流程（深入原理必备）

TC39 负责推进 ECMAScript 演进，常见阶段：

- **Stage 0**：想法
- **Stage 1**：提案
- **Stage 2**：草案
- **Stage 3**：候选（基本定型，进入实现与反馈）
- **Stage 4**：完成，进入标准

理解阶段的意义：

- 你能判断某个“新特性”是否已经稳定、是否可在生产使用。

---

## 三、版本演进与里程碑

### 3.1 重要版本

- **ES3（1999）**：奠定早期现代 JS 基础
- **ES5（2009）**：严格模式、JSON、数组方法、`Object.defineProperty`
- **ES2015/ES6（2015）**：模块、`let/const`、箭头函数、Promise、Class、迭代器/生成器
- **2016+**：年度发布节奏（ES2016、ES2017...）

### 3.2 Node.js 的影响

- JS 从“浏览器脚本”扩展为“通用编程语言”。
- npm 生态推动了工程化与模块化的爆发。

---

## 四、运行时结构：引擎 + 宿主环境

### 4.1 引擎做什么

常见引擎：V8（Chrome/Node）、SpiderMonkey（Firefox）、JavaScriptCore（Safari）。

引擎通常包含：

- **解析/编译**：把源码变成可执行结构
- **执行**：解释执行 + JIT 优化（热点代码优化）
- **内存管理**：GC（垃圾回收）

### 4.2 宿主环境做什么

浏览器/Node 提供：

- I/O 能力、定时器、事件系统、网络请求
- 事件循环与任务队列调度

---

## 五、学习建议（精简版）

1. **先分清边界**：语言（ES） vs 环境（Web API/Node API）。
2. **写代码验证规则**：很多“坑”都是转换、作用域、任务队列带来的。
3. **走到规范层**：理解抽象操作（如 `ToPrimitive`）会让你在复杂场景更稳。

---

## 参考资料

- [ECMAScript 规范（ECMA-262）](https://tc39.es/ecma262/)
- [TC39 Proposals](https://github.com/tc39/proposals)
- [MDN Web Docs](https://developer.mozilla.org/zh-CN/)
- [V8 Blog](https://v8.dev/)
