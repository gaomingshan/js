# 执行上下文详解

## 概述

执行上下文（Execution Context）是“代码运行所处环境”的规范化抽象。你可以把它理解为：

- 当前这段代码**能访问哪些标识符**（变量/函数/类）
- 这些标识符**从哪里来、如何初始化**（提升、TDZ）
- `this` **当前绑定到谁**
- 代码执行时如何进入/退出（调用栈）

理解执行上下文，才能把下面这些现象讲清楚：

- 变量提升与函数提升
- `let/const` 的暂时性死区（TDZ）
- `this` 绑定规则
- 闭包为什么能“记住外部变量”

---

## 一、执行上下文类型

JavaScript 规范层面主要有三类：

- **全局执行上下文**：脚本加载后创建
- **函数执行上下文**：每次函数调用都会创建
- **Eval 执行上下文**：`eval()` 触发（不推荐）

---

## 二、调用栈（Execution Stack / Call Stack）

执行上下文通过栈结构管理：

- 进入函数调用：压栈
- 函数返回：出栈

```js
function first() {
  second();
}
function second() {
  third();
}
function third() {}

first();

// 栈变化（示意）：
// [Global]
// [Global, first]
// [Global, first, second]
// [Global, first, second, third]
// ... 逐层出栈
```

> **关键点**
>
> 同步代码“卡死”通常来自调用栈被长时间占用（例如死循环、递归过深）。

---

## 三、执行上下文的组成（ES5 vs ES6+）

### 3.1 ES5（理解历史概念）

```text
ExecutionContext = {
  VariableObject(VO/AO),
  ScopeChain,
  this
}
```

- VO：全局变量对象（浏览器里接近 `window`）
- AO：函数活动对象（函数调用时的“变量对象”）

### 3.2 ES6+（推荐理解）

规范将“变量存储”拆成两个环境：

- `LexicalEnvironment`：承载 `let/const/class` 等块级声明
- `VariableEnvironment`：承载 `var` 与部分函数声明

再加上：

- `ThisBinding`

你不用记住完整结构，但要记住：**块级作用域的出现，迫使规范把环境模型细化**。

---

## 四、创建阶段与执行阶段（你必须会讲）

执行上下文并不是“创建完立刻执行”，而是分两步：

### 4.1 创建阶段（Creation Phase）

会做三件事：

1. 创建环境（记录声明）
2. 建立作用域链/外部引用
3. 确定 `this`

提升现象本质发生在这里：

```js
function example() {
  console.log(x); // undefined
  var x = 10;

  console.log(fn); // function fn() {}
  function fn() {}
}
```

### 4.2 执行阶段（Execution Phase）

- 执行语句
- 对 `var x = 10` 这种声明+赋值：赋值发生在执行阶段

---

## 五、变量对象（VO/AO）与提升

### 5.1 全局上下文的变量对象

浏览器里（非模块脚本）通常可近似理解为：

```js
var a = 1;
window.a === 1; // true
```

> **注意**
>
> `let/const` 的全局声明不会挂到 `window` 上。

### 5.2 函数上下文的活动对象（AO）

函数调用时会有：

- `arguments`
- 形参绑定
- 函数声明
- `var` 声明（初始化为 `undefined`）

### 5.3 提升规则（务实版）

- `var`：声明提升、初始化为 `undefined`
- 函数声明：整体提升
- 函数表达式：只提升“变量声明部分”
- `let/const`：也会被“登记”，但在声明前处于 TDZ（访问报错）

```js
console.log(a); // undefined
var a = 1;

console.log(b); // ReferenceError
let b = 2;
```

---

## 六、词法环境 vs 变量环境（为什么要分开）

核心目的：支持块级作用域。

```js
{
  let x = 1;  // 块内有效
  var y = 2;  // 仍然是函数作用域
}

// console.log(x); // ReferenceError
console.log(y); // 2
```

你可以把它简单理解为：

- `let/const` 走“块级环境”
- `var` 走“函数环境”

---

## 七、this 绑定（与执行上下文绑定）

`this` 在上下文创建阶段确定，但规则取决于调用方式：

- 普通函数调用：严格模式 `undefined`，非严格模式可能是全局对象
- 方法调用：指向调用者对象
- 构造调用（`new`）：指向新创建对象
- 箭头函数：不创建自己的 `this`，继承外层 `this`

---

## 八、实例分析：串起来理解

```js
var global = 'G';

function outer(x) {
  var outerVar = 'O';

  function inner(y) {
    var innerVar = 'I';
    console.log(x, y, outerVar, innerVar, global);
  }

  inner(20);
}

outer(10);
```

你要能说明：

- `inner` 的查找顺序：`inner` 局部 → `outer` 局部 → 全局
- `outer` 结束后如果 `inner` 被返回并存活，就会形成闭包（下一节）

---

## 九、最佳实践

1. **优先 `let/const`**：减少提升带来的不确定性。
2. **避免全局污染**：模块化/IIFE。
3. **减少过深嵌套**：作用域链越长，查找越慢、也更难维护。
4. **明确 this 的 call-site**：尤其在回调、事件、定时器中。

---

## 参考资料

- [ECMAScript - Execution Contexts](https://tc39.es/ecma262/#sec-execution-contexts)
- [MDN - this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
