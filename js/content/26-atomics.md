# Atomics API

## 概述

Atomics 提供原子操作，确保多线程环境下的数据一致性。

理解 Atomics 的关键在于：

- **原子操作**：不可中断的操作，保证线程安全
- **同步原语**：`wait()` 和 `notify()` 实现线程同步
- **内存序保证**：确保操作的可见性

---

## 一、原子操作

### 1.1 基本操作

```js
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 10);
const view = new Int32Array(sab);

// 原子加载
const value = Atomics.load(view, 0);

// 原子存储
Atomics.store(view, 0, 42);

// 原子加法
Atomics.add(view, 0, 5);  // view[0] += 5

// 原子减法
Atomics.sub(view, 0, 3);  // view[0] -= 3

// 原子与
Atomics.and(view, 0, 0b1010);

// 原子或
Atomics.or(view, 0, 0b0101);

// 原子异或
Atomics.xor(view, 0, 0b1111);
```

### 1.2 返回值

```js
const view = new Int32Array(sab);
Atomics.store(view, 0, 10);

// 所有操作返回旧值
const oldValue = Atomics.add(view, 0, 5);  // 返回 10
const newValue = Atomics.load(view, 0);     // 15
```

---

## 二、比较交换（CAS）

### 2.1 compareExchange

```js
const view = new Int32Array(sab);
Atomics.store(view, 0, 10);

// 只有当前值 == 期望值时，才更新为新值
const oldValue = Atomics.compareExchange(
  view,      // TypedArray
  0,         // 索引
  10,        // 期望值
  20         // 新值
);

console.log(oldValue);  // 10（旧值）
console.log(Atomics.load(view, 0));  // 20（已更新）

// 如果期望值不匹配，不更新
const result = Atomics.compareExchange(view, 0, 10, 30);
console.log(result);  // 20（当前值，未更新）
console.log(Atomics.load(view, 0));  // 20（未改变）
```

### 2.2 实现自旋锁

```js
const UNLOCKED = 0;
const LOCKED = 1;

function lock(lock, index) {
  while (true) {
    const oldValue = Atomics.compareExchange(lock, index, UNLOCKED, LOCKED);
    if (oldValue === UNLOCKED) {
      return;  // 获得锁
    }
    // 否则继续尝试
  }
}

function unlock(lock, index) {
  Atomics.store(lock, index, UNLOCKED);
}

// 使用
const lockArray = new Int32Array(sab);
lock(lockArray, 0);
// 临界区
unlock(lockArray, 0);
```

---

## 三、同步原语

### 3.1 wait 和 notify

```js
// Worker 1：等待
const view = new Int32Array(sab);

// 等待 view[0] 的值变化
const result = Atomics.wait(
  view,    // Int32Array 或 BigInt64Array
  0,       // 索引
  0,       // 期望值
  1000     // 超时（毫秒，可选）
);

// result: "ok" | "not-equal" | "timed-out"

// Worker 2：通知
Atomics.store(view, 0, 1);
Atomics.notify(view, 0, 1);  // 唤醒 1 个等待的线程
```

### 3.2 生产者-消费者

```js
// 共享队列
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100);
const queue = new Int32Array(sab);

// queue[0]: 数据
// queue[1]: 标志位（0=空，1=有数据）

// 生产者
function produce(value) {
  Atomics.store(queue, 0, value);
  Atomics.store(queue, 1, 1);
  Atomics.notify(queue, 1, 1);  // 通知消费者
}

// 消费者
function consume() {
  while (Atomics.load(queue, 1) === 0) {
    Atomics.wait(queue, 1, 0);  // 等待数据
  }
  const value = Atomics.load(queue, 0);
  Atomics.store(queue, 1, 0);
  return value;
}
```

---

## 四、Exchange

### 4.1 原子交换

```js
const view = new Int32Array(sab);
Atomics.store(view, 0, 10);

// 原子交换：设置新值并返回旧值
const oldValue = Atomics.exchange(view, 0, 20);

console.log(oldValue);  // 10
console.log(Atomics.load(view, 0));  // 20
```

---

## 五、isLockFree

### 5.1 检查原子操作的效率

```js
// 检查指定字节大小的操作是否是无锁的
console.log(Atomics.isLockFree(1));  // 通常 true
console.log(Atomics.isLockFree(2));  // 通常 true
console.log(Atomics.isLockFree(4));  // 通常 true
console.log(Atomics.isLockFree(8));  // 通常 true

// 如果返回 false，操作可能使用锁，性能较差
```

---

## 六、实际应用

### 6.1 计数器

```js
// 线程安全的计数器
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
const counter = new Int32Array(sab);

function increment() {
  Atomics.add(counter, 0, 1);
}

function getCount() {
  return Atomics.load(counter, 0);
}
```

### 6.2 信号量

```js
class Semaphore {
  constructor(sab, index, initialValue) {
    this.array = new Int32Array(sab);
    this.index = index;
    Atomics.store(this.array, index, initialValue);
  }

  acquire() {
    while (true) {
      const current = Atomics.load(this.array, this.index);
      if (current > 0) {
        const old = Atomics.compareExchange(
          this.array,
          this.index,
          current,
          current - 1
        );
        if (old === current) {
          return;
        }
      }
    }
  }

  release() {
    Atomics.add(this.array, this.index, 1);
  }
}
```

---

## 七、最佳实践

1. **优先使用高级抽象**：如锁、信号量等。
2. **避免自旋等待**：使用 `wait/notify` 而不是忙等。
3. **最小化临界区**：减少锁持有时间。
4. **避免死锁**：按相同顺序获取多个锁。
5. **性能测试**：并发代码需要充分测试。

---

## 参考资料

- [MDN - Atomics](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [ECMAScript - Atomics](https://tc39.es/ecma262/#sec-atomics-object)
