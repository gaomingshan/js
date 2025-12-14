# SharedArrayBuffer

## 概述

SharedArrayBuffer 允许在多个 Worker 之间共享内存，实现真正的并行计算。

理解 SharedArrayBuffer 的关键在于：

- **共享内存**：多个线程可以访问同一块内存
- **需要同步**：必须使用 Atomics 进行同步操作
- **安全性要求**：需要特定的 HTTP 头

---

## 一、基础用法

### 1.1 创建共享内存

```js
// 创建 1024 字节的共享内存
const sab = new SharedArrayBuffer(1024);

console.log(sab.byteLength);  // 1024

// 在多个 Worker 中共享
const worker = new Worker('worker.js');
worker.postMessage({ buffer: sab });
```

### 1.2 与 TypedArray 配合

```js
// 创建共享内存
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100);

// 创建视图
const view = new Int32Array(sab);

// 主线程写入
view[0] = 42;
view[1] = 100;

// 所有 Worker 都能看到这些值
```

---

## 二、多线程共享

### 2.1 主线程

```js
// main.js
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 10);
const sharedArray = new Int32Array(sab);

// 创建两个 Worker
const worker1 = new Worker('worker1.js');
const worker2 = new Worker('worker2.js');

// 将共享内存传递给 Worker
worker1.postMessage({ sharedArray: sab });
worker2.postMessage({ sharedArray: sab });

// 主线程也可以访问
sharedArray[0] = 1;
```

### 2.2 Worker 线程

```js
// worker1.js
onmessage = function(e) {
  const sharedArray = new Int32Array(e.data.sharedArray);

  // 读取主线程写入的值
  console.log(sharedArray[0]);  // 1

  // 写入值，worker2 也能看到
  sharedArray[1] = 2;
};
```

---

## 三、安全性考虑

### 3.1 COOP 和 COEP 头

SharedArrayBuffer 需要网站设置特定的安全头：

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

**原因**：防止 Spectre 等侧信道攻击。

### 3.2 检查可用性

```js
if (typeof SharedArrayBuffer !== 'undefined') {
  console.log('SharedArrayBuffer 可用');
} else {
  console.log('SharedArrayBuffer 不可用');
  console.log('请检查安全头配置');
}
```

---

## 四、与普通 ArrayBuffer 的区别

```js
// 普通 ArrayBuffer（不能共享）
const ab = new ArrayBuffer(1024);
const view1 = new Int32Array(ab);

// 传递给 Worker 时会被复制
worker.postMessage({ buffer: ab });

// SharedArrayBuffer（可以共享）
const sab = new SharedArrayBuffer(1024);
const view2 = new Int32Array(sab);

// 传递给 Worker 时是同一块内存
worker.postMessage({ buffer: sab });
```

---

## 五、应用场景

### 5.1 并行计算

```js
// 主线程：分配任务
const sab = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * 1000000);
const data = new Float64Array(sab);

// 填充数据
for (let i = 0; i < data.length; i++) {
  data[i] = Math.random();
}

// 创建多个 Worker 并行处理
const workers = [];
const chunkSize = Math.floor(data.length / 4);

for (let i = 0; i < 4; i++) {
  const worker = new Worker('compute.js');
  worker.postMessage({
    sharedArray: sab,
    start: i * chunkSize,
    end: (i + 1) * chunkSize
  });
  workers.push(worker);
}
```

### 5.2 生产者-消费者模式

```js
// 使用共享内存实现消息队列
const sab = new SharedArrayBuffer(1024);
const queue = new Int32Array(sab);

// queue[0]: 写指针
// queue[1]: 读指针
// queue[2...]: 数据
```

---

## 六、最佳实践

1. **必须使用 Atomics**：避免数据竞争。
2. **检查浏览器支持**：不是所有环境都支持。
3. **设置正确的安全头**：COOP 和 COEP。
4. **合理划分任务**：避免过度同步开销。
5. **错误处理**：处理 Worker 失败的情况。

---

## 参考资料

- [MDN - SharedArrayBuffer](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- [ECMAScript - SharedArrayBuffer](https://tc39.es/ecma262/#sec-sharedarraybuffer-objects)
