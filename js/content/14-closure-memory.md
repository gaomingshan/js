# 闭包的内存模型

## 概述

闭包（Closure）是 JavaScript 中“能力强、也容易出问题”的机制。

它解决的是：

- 函数返回后仍能访问外部变量（状态保持）

但也会带来：

- 外部作用域无法回收 → 内存占用上升
- 持有 DOM / 大对象 / 定时器回调 → 内存泄漏风险

本章重点不是“闭包是什么”，而是：**闭包在内存里到底保留了什么**，以及如何写出可控的闭包。

---

## 一、闭包的定义（务实版）

```text
闭包 = 函数 + 其可访问的外部环境引用
```

经典例子：

```js
function createCounter() {
  let count = 0;
  return function () {
    return ++count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
```

`createCounter` 返回后，`count` 仍然存在，因为返回的函数保持了对外部环境的引用。

---

## 二、闭包在内存里“保留什么”

### 2.1 外部环境不是按需保存

```js
function outer() {
  var a = 1;
  var b = 2;
  var c = 3;

  return function inner() {
    console.log(a); // 只用 a
  };
}

const fn = outer();
```

概念上：

- `fn` 有一个内部引用指向 `outer` 的环境
- `outer` 的环境里包含 `a/b/c`
- **即使 inner 只用到 a，b/c 也可能被保留**（实现细节上引擎可能做逃逸分析优化，但不要依赖）

### 2.2 多层嵌套：作用域链可能整体保留

```js
function level1() {
  var v1 = 1;
  function level2() {
    var v2 = 2;
    function level3() {
      var v3 = 3;
      console.log(v1, v2, v3);
    }
    return level3;
  }
  return level2();
}

const fn = level1();
```

---

## 三、闭包与垃圾回收（GC）

### 3.1 什么时候能回收

只要闭包函数还被引用，它捕获的外部环境就无法回收。

```js
function createClosure() {
  const data = new Array(1000000);
  return function () {
    console.log(data.length);
  };
}

let closure = createClosure();
// data 不能回收

closure = null;
// data 现在“有机会”被回收
```

### 3.2 多个内部函数共享同一外部环境

```js
function outer() {
  const largeData = new Array(1000000);

  function inner1() {
    console.log(largeData.length);
  }

  function inner2() {
    console.log('no data');
  }

  return { inner1, inner2 };
}

const obj = outer();
```

即使 `inner2` 不用 `largeData`，它也可能因为共享外部环境而“间接保留”大对象。

---

## 四、常见闭包场景（该用就用）

### 4.1 模块模式（封装私有状态）

```js
const Module = (() => {
  let privateVar = 0;
  function inc() { privateVar++; }

  return {
    inc,
    getCount() { return privateVar; }
  };
})();
```

### 4.2 工厂函数

```js
function createMultiplier(k) {
  return (x) => x * k;
}

const double = createMultiplier(2);
```

### 4.3 事件处理器

事件回调经常捕获外部变量，因此也容易把 DOM/大对象一起“带进闭包”。

---

## 五、常见内存泄漏场景（高频）

### 5.1 意外全局变量

```js
function createLeak() {
  leakedVar = 'I am global';
}
```

### 5.2 定时器里的闭包

```js
function startTimer() {
  const largeData = new Array(1000000);

  const timer = setInterval(() => {
    console.log(largeData.length);
  }, 1000);

  return () => clearInterval(timer);
}
```

如果不清理定时器，`largeData` 会长期无法释放。

### 5.3 闭包持有 DOM 引用

```js
function createDOMLeak() {
  let el = document.getElementById('myDiv');

  return function () {
    console.log(el.innerHTML);
  };
}
```

如果 `el` 被从页面移除但闭包还引用它，该 DOM 可能无法回收。

---

## 六、闭包优化技巧

### 6.1 最小化捕获范围

把大对象“留在外层”是危险的，尽量抽出你真正需要的数据：

```js
function good() {
  let large = new Array(1000000).fill(1);
  const first = large[0];
  large = null;

  return () => first;
}
```

### 6.2 及时解除引用

- 不再使用的闭包设为 `null`
- 事件监听器与定时器要清理

### 6.3 用 WeakMap/WeakSet 管理私有数据

```js
const priv = new WeakMap();

class MyClass {
  constructor() {
    priv.set(this, { secret: 'x' });
  }
  getSecret() {
    return priv.get(this).secret;
  }
}

let obj = new MyClass();
obj = null; // 弱引用不会阻止 GC
```

---

## 七、调试闭包

- 在 DevTools 断点处查看 Scope/Closure
- Memory 面板抓 Heap Snapshot，搜索 `closure` 或定位被保留的大对象

---

## 八、最佳实践

1. **闭包只捕获必要变量**：避免把大作用域“整锅端”。
2. **清理副作用**：移除监听器、清除定时器。
3. **避免把 DOM 节点直接塞进长期存活闭包**：提取必要数据后断开引用。
4. **长期私有数据用 WeakMap**：减少内存泄漏风险。

---

## 参考资料

- [MDN - 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [V8 - Trash talk (GC)](https://v8.dev/blog/trash-talk)
