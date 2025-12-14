# Babel 转译原理

## 概述

Babel 是 JavaScript 编译器，常用于：

- **语法转换**：把 ES6+ 转成更低版本语法
- **源码转换**：JSX、TypeScript 等
- **配合 Polyfill**：为目标环境补齐缺失能力

理解 Babel 的关键是区分两件事：

- **语法转换（syntax transform）**：例如箭头函数、class
- **运行时能力补齐（polyfill/runtime）**：例如 `Promise`、`Array.prototype.includes`

---

## 一、编译流程（Parse → Transform → Generate）

### 1.1 解析（Parse）

- 词法分析：源码 → Tokens
- 语法分析：Tokens → AST（抽象语法树）

### 1.2 转换（Transform）

- 插件（plugin）遍历/修改 AST
- 产生新的 AST

### 1.3 生成（Generate）

- AST → 目标代码
- 可同时生成 source map

---

## 二、AST（抽象语法树）为什么重要

AST 是“代码的结构化表示”。Babel 的本质就是：

- 把代码解析成 AST
- 插件在 AST 上做改写
- 再生成新的代码

工程上的意义：

- 解释了为什么“插件可以做很精确的语法变换”
- 解释了为什么 Tree Shaking、Lint、格式化工具都离不开 AST

---

## 三、插件（Plugins）与预设（Presets）

### 3.1 Plugins

插件通常只负责一个语法点：

```json
{
  "plugins": [
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-transform-classes"
  ]
}
```

### 3.2 Presets

Preset 是插件集合：

```json
{
  "presets": [
    ["@babel/preset-env", { "targets": "> 0.25%, not dead" }]
  ]
}
```

`@babel/preset-env` 会根据 targets 自动选择需要的转换。

---

## 四、Polyfill：Babel 做不到的部分

### 4.1 语法转换 vs 内置 API

- Babel 能把 `async/await` 转换成 generator 形式
- 但它无法“凭空让旧环境拥有 Promise / Map”等能力

因此需要 polyfill：

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### 4.2 useBuiltIns（按需引入 polyfill）

```json
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}
```

- `usage`：根据代码用到的能力自动注入 polyfill
- `entry`：从入口显式引入，按 targets 裁剪

---

## 五、配置文件

常见两类：

- `.babelrc`：更偏“包内配置”（适合单包）
- `babel.config.js`：更偏“项目根配置”（monorepo 更常用）

示例：

```js
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { browsers: ['last 2 versions'] }
    }]
  ],
  plugins: []
};
```

---

## 六、常见转换示例（直觉理解）

### 6.1 箭头函数

```js
// 输入
const add = (a, b) => a + b;

// 输出（示意）
var add = function (a, b) {
  return a + b;
};
```

### 6.2 class

class 会被转换成构造函数 + prototype 方法（通常还会加辅助函数处理继承等）。

### 6.3 async/await

通常会被转换为 generator + runtime（`regeneratorRuntime`）。

---

## 七、自定义插件（Visitor 模式）

Babel 插件本质：提供 visitor，在遍历 AST 时对特定节点做处理。

```js
module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: 'my-plugin',
    visitor: {
      Identifier(path) {
        if (path.node.name === 'foo') {
          path.node.name = 'bar';
        }
      }
    }
  };
};
```

---

## 八、性能优化（够用版）

1. **精确 targets**：targets 太宽会导致过度转译与更多 polyfill。
2. **开启缓存**：例如在 loader 中使用 `cacheDirectory`。
3. **排除 node_modules**：第三方包通常不需要再次转译。
4. **减少插件数量**：能用 preset 就别堆很多散插件。

---

## 九、最佳实践

1. **Babel 只管语法转换，polyfill 另算**：两者不要混淆。
2. **使用 browserslist 统一 targets**：让 Babel/Autoprefixer 等共用一套目标环境。
3. **线上构建关注体积**：尽量按需注入 polyfill。
4. **配合 Source Map**：便于生产问题定位。

---

## 参考资料

- [Babel 官网](https://babeljs.io/)
- [Babel Handbook](https://github.com/jamiebuilds/babel-handbook)
- [AST Explorer](https://astexplorer.net/)
