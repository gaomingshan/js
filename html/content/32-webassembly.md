# 第 32 章：WebAssembly

## 概述

WebAssembly（Wasm）是一种可在浏览器中运行的低级字节码格式，提供接近原生的性能。

## 一、加载 WebAssembly

### 1.1 基本用法

```javascript
// 加载 wasm 文件
fetch('module.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes))
  .then(result => {
    const exports = result.instance.exports;
    console.log(exports.add(1, 2)); // 调用 wasm 函数
  });
```

### 1.2 流式编译

```javascript
WebAssembly.instantiateStreaming(fetch('module.wasm'))
  .then(result => {
    const {add} = result.instance.exports;
    console.log(add(5, 10));
  });
```

## 二、JavaScript 与 Wasm 交互

```javascript
const importObject = {
  env: {
    log: (arg) => console.log(arg)
  }
};

WebAssembly.instantiateStreaming(fetch('module.wasm'), importObject)
  .then(result => {
    result.instance.exports.myFunction();
  });
```

## 三、使用场景

- 🎮 游戏引擎
- 📊 数据处理
- 🖼️ 图像/视频编解码
- 🔐 加密算法
- 🧮 科学计算

## 参考资料

- [MDN - WebAssembly](https://developer.mozilla.org/zh-CN/docs/WebAssembly)
- [WebAssembly.org](https://webassembly.org/)

---

**上一章** ← [第 31 章：PWA](./31-pwa.md)  
**下一章** → [第 33 章：HTML 模板引擎](./33-template-engines.md)

---

✅ **第六部分：现代HTML特性（28-32章）已完成！**
