# 第 32 章：WebAssembly - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 定义
### 题目
WebAssembly 是什么？

**A.** 新的 JavaScript 框架 | **B.** 二进制指令格式 | **C.** 汇编语言 | **D.** 编译器

<details><summary>查看答案</summary>
### ✅ 答案：B
WebAssembly (Wasm) = 可在浏览器运行的二进制指令格式
**来源：** WebAssembly 规范
</details>

---

## 第 2 题 🟢 | 优势
### 题目
WebAssembly 的优势？**（多选）**

**A.** 接近原生性能 | **B.** 多语言支持 | **C.** 体积小 | **D.** 安全

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
- 性能：接近原生
- 语言：C/C++/Rust 等
- 体积：紧凑二进制
- 安全：沙箱环境
**来源：** WebAssembly 特性
</details>

---

## 第 3 题 🟢 | 加载方式
### 题目
如何加载 WebAssembly 模块？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 方式1：fetch + instantiate
fetch('module.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes))
  .then(result => {
    const exports = result.instance.exports;
    console.log(exports.add(1, 2));
  });

// 方式2：instantiateStreaming（推荐）
WebAssembly.instantiateStreaming(fetch('module.wasm'))
  .then(result => {
    const {add} = result.instance.exports;
    console.log(add(1, 2));
  });
```
**来源：** WebAssembly API
</details>

---

## 第 4 题 🟡 | 与 JS 交互
### 题目
WebAssembly 与 JavaScript 交互。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 导入 JS 函数到 Wasm
const importObject = {
  env: {
    log: (num) => console.log('来自 Wasm：', num),
    add: (a, b) => a + b
  }
};

WebAssembly.instantiateStreaming(fetch('module.wasm'), importObject)
  .then(result => {
    const {multiply} = result.instance.exports;
    console.log(multiply(3, 4)); // 调用 Wasm 函数
  });
```

```c
// module.c
extern void log(int num);
extern int add(int a, int b);

int multiply(int a, int b) {
  int result = a * b;
  log(result);
  return result;
}
```
**来源：** Wasm-JS Interop
</details>

---

## 第 5 题 🟡 | 内存管理
### 题目
WebAssembly 的内存模型？

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// 创建内存
const memory = new WebAssembly.Memory({
  initial: 1,  // 初始 1 页（64KB）
  maximum: 10  // 最大 10 页
});

// 访问内存
const buffer = new Uint8Array(memory.buffer);
buffer[0] = 42;

// 传递内存给 Wasm
const importObject = {
  env: { memory }
};

WebAssembly.instantiateStreaming(fetch('module.wasm'), importObject);
```
**来源：** WebAssembly Memory
</details>

---

## 第 6 题 🟡 | 编译 C 到 Wasm
### 题目
使用 Emscripten 编译 C。

<details><summary>查看答案</summary>
### ✅ 答案
```c
// add.c
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
int add(int a, int b) {
  return a + b;
}
```

```bash
# 编译
emcc add.c -o add.js -s EXPORTED_FUNCTIONS='["_add"]' -s EXPORTED_RUNTIME_METHODS='["ccall"]'
```

```html
<script src="add.js"></script>
<script>
  Module.onRuntimeInitialized = () => {
    const result = Module.ccall(
      'add',      // 函数名
      'number',   // 返回类型
      ['number', 'number'], // 参数类型
      [5, 3]      // 参数值
    );
    console.log(result); // 8
  };
</script>
```
**来源：** Emscripten
</details>

---

## 第 7 题 🟡 | 性能对比
### 题目
何时使用 WebAssembly？

<details><summary>查看答案</summary>
### ✅ 答案

**适合场景：**
- 计算密集型任务（图像处理、视频编码）
- 游戏引擎
- 物理模拟
- 密码学
- 遗留代码移植（C/C++）

**不适合场景：**
- DOM 操作（需通过 JS）
- 简单逻辑
- 小型项目

**性能对比：**
```javascript
// JavaScript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// WebAssembly (快 5-10 倍)
// 编译自 C/Rust
```
**来源：** Wasm Use Cases
</details>

---

## 第 8 题 🔴 | Rust + Wasm
### 题目
使用 Rust 编写 WebAssembly。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```rust
// lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

```bash
# 安装 wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 编译
wasm-pack build --target web
```

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rust + Wasm</title>
</head>
<body>
  <script type="module">
    import init, { greet, add } from './pkg/my_project.js';
    
    async function run() {
      await init();
      
      console.log(greet('World'));  // "Hello, World!"
      console.log(add(5, 3));        // 8
    }
    
    run();
  </script>
</body>
</html>
```
**来源：** Rust and WebAssembly
</details>

---

## 第 9 题 🔴 | 图像处理
### 题目
使用 Wasm 处理图像。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```rust
// image_processing.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn grayscale(data: &mut [u8]) {
    for i in (0..data.len()).step_by(4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // 灰度公式
        let gray = (0.299 * r as f32 + 0.587 * g as f32 + 0.114 * b as f32) as u8;
        
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
}
```

```javascript
import init, { grayscale } from './pkg/image_processing.js';

async function processImage() {
  await init();
  
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // 使用 Wasm 处理
    grayscale(imageData.data);
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  img.src = 'image.jpg';
}
```
**来源：** Wasm 图像处理
</details>

---

## 第 10 题 🔴 | 最佳实践
### 题目
WebAssembly 开发最佳实践？

<details><summary>查看答案</summary>
### ✅ 答案

**1. 异步加载**
```javascript
// ✅ 推荐：流式编译
WebAssembly.instantiateStreaming(fetch('module.wasm'));

// ❌ 避免：同步加载
const response = await fetch('module.wasm');
const bytes = await response.arrayBuffer();
await WebAssembly.instantiate(bytes);
```

**2. 最小化 JS-Wasm 调用**
```javascript
// ❌ 频繁跨界
for (let i = 0; i < 1000000; i++) {
  wasmAdd(i, 1);
}

// ✅ 批量处理
const result = wasmProcessArray(array);
```

**3. 内存管理**
```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ImageProcessor {
    data: Vec<u8>,
}

#[wasm_bindgen]
impl ImageProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(size: usize) -> Self {
        Self {
            data: vec![0; size],
        }
    }
    
    pub fn process(&mut self) {
        // 处理数据
    }
}
```

**4. 错误处理**
```javascript
try {
  const result = await WebAssembly.instantiateStreaming(fetch('module.wasm'));
} catch (err) {
  console.error('Wasm 加载失败：', err);
  // 降级到 JS 实现
}
```

**5. 调试**
```javascript
// Source Maps
// wasm-pack build --dev

// Chrome DevTools
// Sources → wasm://
```

**来源：** Wasm 最佳实践
</details>

---

**📌 本章总结**
- WebAssembly：二进制指令格式
- 优势：性能、多语言、体积小、安全
- 加载：instantiateStreaming
- 交互：导入 JS 函数、导出 Wasm 函数
- 编译：Emscripten (C/C++)、wasm-pack (Rust)
- 应用：计算密集、图像处理、游戏
- 最佳实践：异步加载、减少跨界调用

**上一章** ← [第 31 章：PWA](./chapter-31.md)  
**下一章** → [第 33 章：HTML模板引擎](./chapter-33.md)
