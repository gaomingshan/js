# 微任务队列机制

## 概述

微任务（Microtask）是事件循环的核心概念，Promise 回调就是通过微任务队列执行的。

理解微任务的关键在于：

- **宏任务 vs 微任务**：执行优先级不同
- **微任务必须清空**：每个宏任务后，微任务队列会被完全清空
- **微任务可以产生微任务**：新的微任务会在当前队列执行完前加入

---

## 一、任务分类

### 1.1 宏任务（Macro Task）

- `setTimeout / setInterval`
- `setImmediate`（Node.js）
- I/O 操作
- UI 渲染
- `script`（整体代码）

### 1.2 微任务（Micro Task）

- `Promise.then / catch / finally`
- `queueMicrotask()`
- `MutationObserver`
- `process.nextTick`（Node.js，优先级更高）

---

## 二、执行顺序

```js
console.log('1: script start');

setTimeout(() => {
  console.log('2: setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3: promise1');
}).then(() => {
  console.log('4: promise2');
});

console.log('5: script end');

// 输出：
// 1: script start
// 5: script end
// 3: promise1
// 4: promise2
// 2: setTimeout
```

执行流程：

1. 同步代码：1, 5
2. 微任务队列：3, 4
3. 宏任务队列：2

---

## 三、事件循环机制

```text
while (true) {
  // 1. 执行一个宏任务
  task = macroTaskQueue.shift();
  execute(task);

  // 2. 执行所有微任务
  while (microTaskQueue.length > 0) {
    microTask = microTaskQueue.shift();
    execute(microTask);
  }

  // 3. 渲染（如果需要）
  if (shouldRender()) {
    render();
  }

  // 4. 继续下一个宏任务
}
```

关键点：

- **微任务优先**：每个宏任务后执行所有微任务
- **清空队列**：微任务队列必须清空才能执行下一个宏任务
- **微任务产生微任务**：新的微任务会在当前队列执行完前加入

---

## 四、微任务创建方式

### 4.1 Promise

```js
Promise.resolve().then(() => {
  console.log('微任务1');
});

Promise.resolve().then(() => {
  console.log('微任务2');
});

console.log('同步代码');

// 输出：同步代码 → 微任务1 → 微任务2
```

### 4.2 queueMicrotask（ES2020）

```js
queueMicrotask(() => {
  console.log('微任务');
});

console.log('同步代码');

// 输出：同步代码 → 微任务
```

### 4.3 async/await

```js
async function test() {
  console.log('1');
  await Promise.resolve();
  console.log('2'); // 微任务
}

test();
console.log('3');

// 输出：1 → 3 → 2
```

`await` 后的代码相当于 `.then()`。

---

## 五、执行顺序详解

### 5.1 混合示例

```js
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => {
    console.log('5');
  }, 0);
});

console.log('6');

// 输出：1 → 6 → 4 → 2 → 3 → 5

// 分析：
// 同步：1, 6
// 第一轮微任务：4
// 第一个宏任务：2
// 第二轮微任务：3
// 第二个宏任务：5
```

### 5.2 微任务嵌套

```js
Promise.resolve().then(() => {
  console.log('then1');

  Promise.resolve().then(() => {
    console.log('then2');
  }).then(() => {
    console.log('then3');
  });
}).then(() => {
  console.log('then4');
});

// 输出：then1 → then2 → then4 → then3
```

---

## 六、常见陷阱

### 6.1 微任务队列阻塞

```js
// 无限产生微任务会阻塞宏任务
function recursiveMicrotask() {
  Promise.resolve().then(() => {
    console.log('微任务');
    recursiveMicrotask(); // 持续产生微任务
  });
}

setTimeout(() => {
  console.log('这个可能永远不会执行');
}, 0);

// recursiveMicrotask(); // 会导致阻塞
```

### 6.2 Promise 构造函数同步

```js
console.log('1');

new Promise((resolve) => {
  console.log('2'); // 同步执行
  resolve();
}).then(() => {
  console.log('3'); // 微任务
});

console.log('4');

// 输出：1 → 2 → 4 → 3
```

---

## 七、Node.js 特殊性

### 7.1 process.nextTick

```js
Promise.resolve().then(() => {
  console.log('promise');
});

process.nextTick(() => {
  console.log('nextTick');
});

console.log('sync');

// Node.js 输出：sync → nextTick → promise

// nextTick 在微任务之前执行
```

---

## 八、最佳实践

1. **理解执行顺序**：微任务在宏任务之间。
2. **避免阻塞**：不要无限产生微任务。
3. **使用 queueMicrotask**：需要微任务时的标准方式。
4. **注意 async/await**：await 后是微任务。
5. **性能考虑**：微任务过多影响渲染。

---

## 参考资料

- [HTML Standard - Microtask Queue](https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue)
- [MDN - 微任务指南](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide)
