# 内存序与同步

## 概述

理解内存序对于编写正确的并发程序至关重要。

理解内存序的关键在于：

- **可见性问题**：一个线程的写入何时对其他线程可见
- **重排序**：编译器和 CPU 可能重排指令
- **Atomics 的保证**：提供顺序一致性（Sequential Consistency）

---

## 一、内存序问题

### 1.1 数据竞争

```js
// ❌ 没有同步的错误示例
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
const sharedArray = new Int32Array(sab);

// Worker 1
sharedArray[0] = 42;     // 写入数据
sharedArray[1] = 1;      // 设置标志位

// Worker 2
while (sharedArray[1] !== 1) {}   // 等待标志位
console.log(sharedArray[0]);       // 可能不是 42！
```

**问题**：
1. 指令可能被重排序
2. 写入可能不立即对其他线程可见
3. 没有内存屏障

### 1.2 重排序示例

```js
// 原始代码
sharedArray[0] = 42;
sharedArray[1] = 1;

// 可能被重排为
sharedArray[1] = 1;
sharedArray[0] = 42;

// 导致 Worker 2 看到 sharedArray[1] === 1 但 sharedArray[0] 还是旧值
```

---

## 二、使用 Atomics 同步

### 2.1 正确的同步

```js
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
const sharedArray = new Int32Array(sab);

// Worker 1
Atomics.store(sharedArray, 0, 42);  // 原子存储
Atomics.store(sharedArray, 1, 1);   // 原子存储（释放语义）

// Worker 2
while (Atomics.load(sharedArray, 1) !== 1) {}  // 原子加载（获取语义）
const value = Atomics.load(sharedArray, 0);    // 保证是 42
console.log(value);  // 42
```

**保证**：
- `Atomics.store()` 提供释放语义（Release）
- `Atomics.load()` 提供获取语义（Acquire）
- 建立 happens-before 关系

---

## 三、Happens-Before 关系

### 3.1 定义

如果操作 A happens-before 操作 B，则：
- A 的效果对 B 可见
- A 在 B 之前执行（逻辑顺序）

### 3.2 Atomics 保证

```js
// Worker 1
Atomics.store(arr, 0, 1);   // A
Atomics.store(arr, 1, 2);   // B

// Worker 2
while (Atomics.load(arr, 1) !== 2) {}  // C
const x = Atomics.load(arr, 0);        // D

// 关系：A happens-before B happens-before C happens-before D
// 因此 D 能看到 A 的效果
```

---

## 四、内存屏障

### 4.1 Atomics 提供的屏障

```js
// Atomics.store() 相当于：
//   正常写入
//   释放屏障（确保之前的写入对其他线程可见）

// Atomics.load() 相当于：
//   获取屏障（确保之后的读取能看到最新值）
//   正常读取
```

### 4.2 Fence（栅栏）

JavaScript 没有显式的内存栅栏函数，但可以用 Atomics 实现：

```js
// 等价于 SequentiallyConsistent Fence
function fence(arr, index) {
  Atomics.add(arr, index, 0);  // 无操作但有内存序保证
}
```

---

## 五、wait/notify 的内存序

### 5.1 同步保证

```js
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 10);
const arr = new Int32Array(sab);

// Worker 1
for (let i = 0; i < 9; i++) {
  arr[i] = i * 10;  // 普通写入
}
Atomics.store(arr, 9, 1);     // 释放
Atomics.notify(arr, 9, 1);     // 唤醒

// Worker 2
Atomics.wait(arr, 9, 0);       // 等待（获取）
// 此时能看到 arr[0...8] 的所有写入
for (let i = 0; i < 9; i++) {
  console.log(arr[i]);  // 保证看到正确的值
}
```

**保证**：
- `notify` 之前的写入对 `wait` 返回后可见
- 建立 happens-before 关系

---

## 六、常见陷阱

### 6.1 混用普通读写和原子操作

```js
// ❌ 错误：混用
sharedArray[0] = 42;                  // 普通写入
Atomics.store(sharedArray, 1, 1);     // 原子写入

while (Atomics.load(sharedArray, 1) !== 1) {}
console.log(sharedArray[0]);          // 仍可能有问题！
```

**正确做法**：
```js
// ✅ 全部使用 Atomics
Atomics.store(sharedArray, 0, 42);
Atomics.store(sharedArray, 1, 1);

while (Atomics.load(sharedArray, 1) !== 1) {}
console.log(Atomics.load(sharedArray, 0));  // 正确
```

### 6.2 不同索引的同步

```js
// ❌ 错误：不同索引不同步
Atomics.store(arr, 0, 42);
arr[1] = 1;  // 普通写入，没有同步

// ✅ 正确：使用 Atomics
Atomics.store(arr, 0, 42);
Atomics.store(arr, 1, 1);
```

---

## 七、最佳实践

1. **始终使用 Atomics**：访问共享内存时。
2. **建立明确的同步点**：使用标志位协调。
3. **避免数据竞争**：同一位置不能同时读写。
4. **使用 wait/notify**：避免忙等。
5. **理解内存序**：确保正确性。

---

## 参考资料

- [ECMAScript - Memory Model](https://tc39.es/ecma262/#sec-memory-model)
- [Atomics and SharedArrayBuffer](https://github.com/tc39/ecmascript_sharedmem)
