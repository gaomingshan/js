# CommonJS vs ESM 对比

## 概述

很多构建工具相关的问题，追根溯源都绕不开 CommonJS（CJS）与 ES Modules（ESM）的差异。

它们的区别不仅是语法：

- CJS 更像“运行时调用函数拿结果”（`require()`）
- ESM 更像“先建立依赖关系，再按规则执行”（静态 `import/export`）

这会直接影响：

- 构建工具能否做 **Tree Shaking**
- 代码分割与预加载策略是否稳定
- 循环依赖的表现与可预测性
- 在浏览器/Node.js 下的兼容与互操作

---

## 一、语法与导出形态

### 1.1 CommonJS

```js
// a.cjs
module.exports = { x: 1 };

// b.cjs
const a = require('./a.cjs');
console.log(a.x);
```

- `require()` 返回的是 `module.exports` 的值
- 导出对象可被自由替换（`module.exports = ...`）

### 1.2 ESM

```js
// a.mjs
export const x = 1;

// b.mjs
import { x } from './a.mjs';
console.log(x);
```

- `import/export` 是语法级声明
- 导入导出关系在执行前可分析

> **关键点**
>
> ESM 的“导出”在语义上更接近“命名绑定”；CJS 的“导出”更接近“返回一个值”。

---

## 二、加载模型：运行时 vs 静态链接

### 2.1 CJS：运行时加载（更灵活）

```js
if (process.env.NODE_ENV === 'development') {
  require('./dev-only');
}
```

- `require()` 可以出现在条件、循环、函数里
- 依赖图需要在运行时才能完整确定

### 2.2 ESM：静态链接（更可分析）

```js
import './dev-only'; // 必须顶层
```

- `import` 必须出现在顶层（静态结构）
- 依赖图可在执行前确定

> **深入一点**
>
> ESM 通常可以理解为“两阶段”：
>
> ```text
> 1) Linking/Instantiation：建立模块环境、解析依赖、创建导入导出绑定
> 2) Evaluation：按依赖顺序执行模块代码
> ```
>
> 构建工具要做 Tree Shaking、稳定拆包，依赖的就是第一阶段能“提前知道结构”。

---

## 三、绑定语义：值拷贝 vs live binding

### 3.1 ESM：live binding（活绑定）

```js
// counter.mjs
export let n = 0;
export function inc() { n++; }

// main.mjs
import { n, inc } from './counter.mjs';
inc();
console.log(n); // 1
```

导入方读取的是“绑定”，不是拷贝出来的快照。

### 3.2 CJS：返回导出值（通常是对象引用）

```js
// counter.cjs
let n = 0;
function inc() { n++; }
module.exports = { getN: () => n, inc };

// main.cjs
const counter = require('./counter.cjs');
counter.inc();
console.log(counter.getN()); // 1
```

CJS 并没有“语言级 live binding”，你需要显式暴露 getter 才能模拟“读取最新值”。

---

## 四、对构建工具的影响：Tree Shaking 与代码分割

### 4.1 为什么 ESM 更利于 Tree Shaking

Tree Shaking 需要“静态可分析”的导入导出结构。

- ESM：`import { a } from 'x'` 是静态声明
- CJS：`const x = require(name)` 可能依赖运行时值

```js
// ESM：可被静态分析
import { a } from './lib.mjs';

// CJS：可能无法静态确定
const lib = require(getLibName());
```

> **关键点**
>
> “用 ESM 写代码”不等于“Tree Shaking 一定生效”。还需要：
>
> - 产物保持 ESM（或被 bundler 正确分析）
> - 标注副作用（`package.json` 的 `sideEffects`）
> - 避免会阻碍分析的动态行为

### 4.2 为什么 ESM 更利于稳定拆包

代码分割（`import()`）是 bundler 的拆包入口。

- 静态依赖：可做更稳定的 chunk 边界与预加载
- 动态依赖：可做按需 chunk

CJS 的动态 `require()` 在复杂情况下会让拆包策略变得不稳定或需要保守处理。

---

## 五、循环依赖：两者的典型表现不同

### 5.1 CJS：返回“部分导出”

- 模块执行到一半时就可能被 `require()` 到
- 此时拿到的是“未完全初始化”的 `exports`

### 5.2 ESM：存在 TDZ 与初始化顺序

- 模块先建立绑定，再执行
- 绑定是活的，但读取时机可能早于初始化（出现 `undefined` 或 TDZ 相关问题）

> **建议**
>
> 无论哪种模块系统，循环依赖都应该尽量通过“职责拆分/中间层/延迟调用”来消除。

---

## 六、互操作（现实世界必须面对）

### 6.1 Node.js 生态的常见形态

- 老包大量是 CJS
- 新包逐步转向 ESM
- 同时支持两者的包会使用 `package.json` 的 `exports` 条件导出

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

### 6.2 构建工具在做的“桥接”

- 将 CJS 依赖转换为 ESM 以便分析（常见于依赖预构建）
- 兼容 `default` 导入等互操作语义（不同工具细节不完全一致）

---

## 七、实践建议（面向工程）

1. **应用开发优先 ESM**：对 bundler/Dev Server 更友好。
2. **库开发尽量提供 ESM 产物**：利于下游 Tree Shaking。
3. **不要把“能跑”当作终点**：模块形态会影响性能、体积与可维护性。

---

## 参考资料

- [ECMA-262 - Modules](https://tc39.es/ecma262/#sec-modules)
- [Node.js - ESM 文档](https://nodejs.org/api/esm.html)
- [MDN - JavaScript modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
