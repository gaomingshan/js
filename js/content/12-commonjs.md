# CommonJS 规范

## 概述

CommonJS 是 Node.js 传统模块系统：

- 使用 `require()` 导入（运行时加载、同步）
- 使用 `module.exports` / `exports` 导出
- 模块执行结果会被缓存（天然单例）

它非常适合服务器端“文件系统可用、同步加载成本低”的场景；在浏览器端通常需要打包工具转换。

---

## 一、导出：module.exports 与 exports

### 1.1 module.exports（推荐理解为“真正导出”）

```js
module.exports = {
  name: 'Alice',
  greet() {
    return 'Hello';
  }
};
```

也可以直接导出函数/类：

```js
module.exports = function add(a, b) {
  return a + b;
};
```

### 1.2 exports 是快捷引用（易踩坑）

```js
exports.name = 'Alice';
exports.age = 25;
```

> **关键点**
>
> `exports` 初始指向 `module.exports`，但如果你直接给 `exports = ...` 赋值，会切断引用：
>
> ```js
> // 错误：不会影响最终导出
> exports = { name: 'Bob' };
>
> // 正确：改 module.exports
> module.exports = { name: 'Bob' };
> ```

---

## 二、导入：require()

```js
const utils = require('./utils');
const fs = require('fs');
const express = require('express');

const { name } = require('./user');
```

- 相对路径必须以 `./` 或 `../` 开头
- 不带路径的字符串优先解析核心模块，其次查找 `node_modules`

---

## 三、模块解析与加载机制（理解报错的关键）

### 3.1 查找顺序（概念版）

1. 核心模块（`fs`、`http`）
2. 当前目录 `node_modules`
3. 父目录 `node_modules`（逐级向上）

### 3.2 扩展名与目录解析

```js
require('./mod');
// 可能尝试：
// mod.js → mod.json → mod.node → mod/index.js
```

### 3.3 缓存机制

```js
const a = require('./mod');
const b = require('./mod');
console.log(a === b); // true

// 清缓存（调试用途，谨慎）
delete require.cache[require.resolve('./mod')];
```

---

## 四、module / require 对象

```js
console.log(module.id);
console.log(module.filename);
console.log(module.parent);
console.log(module.children);

if (require.main === module) {
  console.log('直接运行');
} else {
  console.log('被导入');
}
```

---

## 五、循环依赖（CommonJS 的典型行为）

CommonJS 在循环依赖时会返回“当前已经完成初始化的 exports（部分导出）”。

这意味着：

- 不要在模块初始化阶段强依赖对方的“最终状态”
- 必要时把依赖调用推迟到函数执行阶段

---

## 六、CommonJS vs ES Modules（选型）

| 特性 | CommonJS | ES Modules |
| --- | --- | --- |
| 语法 | require/exports | import/export |
| 加载时机 | 运行时 | 编译时可分析 |
| 加载方式 | 同步 | 浏览器更偏异步语义 |
| Tree Shaking | 不友好 | 支持 |
| 循环依赖 | 返回部分导出 | 通过 live binding 处理 |

> **提示**
>
> CommonJS 中你拿到的是 `module.exports` 对象引用；但如果你在导出时把“某个值的快照”塞进去，后续改内部变量并不会自动同步到导出对象。

---

## 七、实用模式

### 7.1 单例

```js
class Logger {
  log(msg) { console.log(msg); }
}

module.exports = new Logger();
```

### 7.2 工厂

```js
module.exports = function createLogger(name) {
  return {
    log(msg) { console.log(`[${name}] ${msg}`); }
  };
};
```

### 7.3 命名空间聚合

```js
// utils/index.js
module.exports = {
  string: require('./string'),
  array: require('./array')
};
```

---

## 八、最佳实践

1. **优先操作 `module.exports`**：减少 exports 引用陷阱。
2. **避免循环依赖**：或延迟依赖（lazy require）。
3. **保持模块边界清晰**：一个模块一个职责。
4. **新项目优先 ESM**：生态与工具链更统一。

---

## 参考资料

- [CommonJS](http://www.commonjs.org/)
- [Node.js Modules](https://nodejs.org/api/modules.html)
