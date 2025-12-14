# TypedArray（类型化数组）

## 概述

TypedArray 用于高效处理二进制/数值数据：

- 元素类型固定（`Int8/Uint8/Float32/...`）
- 长度固定
- 底层基于 `ArrayBuffer` 的连续内存

常见场景：WebGL、Canvas 图像像素、文件与网络二进制协议。

---

## 一、三件套：ArrayBuffer / TypedArray / DataView

### 1.1 ArrayBuffer：一段原始字节

```js
const buf = new ArrayBuffer(16);
console.log(buf.byteLength); // 16
```

ArrayBuffer 本身不能直接读写。

### 1.2 TypedArray：对 buffer 的“类型视图”

```js
const buf = new ArrayBuffer(8);
const u8 = new Uint8Array(buf);
const i32 = new Int32Array(buf);
```

### 1.3 DataView：更灵活（可控字节序）

```js
const view = new DataView(buf);
view.setInt32(0, 0x12345678, false); // big-endian
```

---

## 二、创建 TypedArray

- 指定长度：`new Int16Array(10)`
- 从数组：`new Uint8Array([1,2,3])`
- 从 buffer：`new Float32Array(buffer, byteOffset, length)`

---

## 三、共享内存：多个视图同一块 buffer

```js
const buf = new ArrayBuffer(4);
const u8 = new Uint8Array(buf);
const u32 = new Uint32Array(buf);

u32[0] = 0xffffffff;
console.log(u8); // 4 个字节都变了
```

> **提示**
>
> 这就是“视图（view）”的含义：数据只有一份，不同方式解释。

---

## 四、与普通数组的关键差异

1. **长度固定**：没有 `push/pop`。
2. **类型固定**：写入会发生截断/溢出（或 clamped）。
3. **更接近底层内存**：适合数值计算与二进制协议。

`Uint8ClampedArray` 会把值夹到 `[0,255]`，常用于像素数据。

---

## 五、常用方法

### 5.1 `set`（批量写入）

```js
const a = new Uint8Array([1, 2, 3, 4]);
a.set([9, 9], 1);
// [1, 9, 9, 4]
```

### 5.2 `subarray`（共享内存的子视图）

```js
const a = new Uint8Array([1, 2, 3, 4]);
const sub = a.subarray(1, 3);
sub[0] = 99;
console.log(a); // [1, 99, 3, 4]
```

> **注意**
>
> `subarray` 不复制数据；如果要拷贝，通常用 `slice`（不同类型支持略有差异）。

---

## 六、深入原理：为什么 TypedArray 更快

- 连续内存布局，元素大小固定
- 引擎可以做更激进的优化（避免装箱、类型检查更少）

但它也有代价：灵活性降低（不能存任意类型）。

---

## 参考资料

- [MDN - TypedArray](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
- [MDN - ArrayBuffer](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
- [MDN - DataView](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)
