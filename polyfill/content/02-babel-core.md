# 第 2 章：Babel 核心原理

## 概述

Babel 的工作流程分为三个阶段：解析（Parse）→ 转换（Transform）→ 生成（Generate）。理解这个流程，有助于理解 Babel 配置和插件的工作方式。

## 一、编译三阶段

### 1.1 整体流程

```
源代码 (Source Code)
    ↓
┌─────────────────┐
│  1. 解析 Parse  │  将代码字符串转换为 AST
└─────────────────┘
    ↓
┌─────────────────┐
│ 2. 转换 Transform│  遍历 AST，应用插件修改
└─────────────────┘
    ↓
┌─────────────────┐
│ 3. 生成 Generate│  将 AST 转换回代码字符串
└─────────────────┘
    ↓
目标代码 (Output Code)
```

### 1.2 各阶段职责

| 阶段 | 输入 | 输出 | 核心工具 |
|------|------|------|----------|
| 解析 | 代码字符串 | AST | @babel/parser |
| 转换 | AST | 修改后的 AST | @babel/traverse |
| 生成 | AST | 代码字符串 | @babel/generator |

## 二、AST 抽象语法树

### 2.1 什么是 AST

AST（Abstract Syntax Tree）是代码的结构化表示：

```javascript
// 源代码
const sum = (a, b) => a + b;

// 对应的 AST（简化）
{
  "type": "VariableDeclaration",
  "kind": "const",
  "declarations": [{
    "type": "VariableDeclarator",
    "id": { "type": "Identifier", "name": "sum" },
    "init": {
      "type": "ArrowFunctionExpression",
      "params": [
        { "type": "Identifier", "name": "a" },
        { "type": "Identifier", "name": "b" }
      ],
      "body": {
        "type": "BinaryExpression",
        "operator": "+",
        "left": { "type": "Identifier", "name": "a" },
        "right": { "type": "Identifier", "name": "b" }
      }
    }
  }]
}
```

### 2.2 AST 的直觉理解

```
const sum = (a, b) => a + b;
  │     │     │  │    │
  │     │     │  │    └── BinaryExpression (a + b)
  │     │     │  └─────── ArrowFunctionExpression
  │     │     └────────── Parameters [a, b]
  │     └──────────────── Identifier (sum)
  └────────────────────── VariableDeclaration (const)
```

> **💡 提示**  
> 使用 [AST Explorer](https://astexplorer.net/) 可以可视化查看任意代码的 AST 结构。

### 2.3 为什么需要 AST

```
字符串操作        vs        AST 操作
─────────────────────────────────────────
用正则替换代码              结构化分析
容易出错                    精准修改
无法理解上下文              理解语义
```

## 三、解析阶段（Parse）

### 3.1 词法分析 + 语法分析

```javascript
// 源代码
const x = 1;

// 1. 词法分析：拆分为 Tokens
['const', 'x', '=', '1', ';']

// 2. 语法分析：构建 AST
{
  type: 'VariableDeclaration',
  kind: 'const',
  declarations: [...]
}
```

### 3.2 @babel/parser

```javascript
const parser = require('@babel/parser');

const code = 'const x = 1;';
const ast = parser.parse(code, {
  sourceType: 'module',  // 'script' | 'module'
  plugins: ['jsx', 'typescript']  // 启用额外语法支持
});
```

## 四、转换阶段（Transform）

### 4.1 遍历与访问者模式

```javascript
const traverse = require('@babel/traverse').default;

traverse(ast, {
  // 访问者：当遇到特定节点类型时调用
  ArrowFunctionExpression(path) {
    // path 包含节点信息和操作方法
    console.log('Found arrow function');
  },
  Identifier(path) {
    console.log('Found identifier:', path.node.name);
  }
});
```

### 4.2 Path 对象

```javascript
// path 提供的能力
path.node        // 当前 AST 节点
path.parent      // 父节点
path.scope       // 作用域信息
path.replaceWith()   // 替换节点
path.remove()        // 删除节点
path.insertBefore()  // 在前面插入
```

### 4.3 插件的本质

Babel 插件就是一个返回访问者对象的函数：

```javascript
// 一个简单的插件：将 const 转换为 var
module.exports = function() {
  return {
    visitor: {
      VariableDeclaration(path) {
        if (path.node.kind === 'const') {
          path.node.kind = 'var';
        }
      }
    }
  };
};
```

## 五、生成阶段（Generate）

### 5.1 @babel/generator

```javascript
const generate = require('@babel/generator').default;

// 将 AST 转回代码字符串
const output = generate(ast, {
  comments: true,     // 保留注释
  compact: false,     // 不压缩
  sourceMaps: true    // 生成 source map
});

console.log(output.code);
console.log(output.map);
```

### 5.2 Source Map

```javascript
// Source Map 作用：调试时映射回源代码
// 转换后代码 → Source Map → 源代码

{
  "version": 3,
  "sources": ["src/index.js"],
  "mappings": "AAAA,IAAMA,GAAG..."
}
```

## 六、完整示例

### 6.1 手动执行编译流程

```javascript
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// 1. 解析
const code = 'const add = (a, b) => a + b;';
const ast = parser.parse(code);

// 2. 转换：箭头函数 → 普通函数
traverse(ast, {
  ArrowFunctionExpression(path) {
    const { params, body } = path.node;
    
    // 如果 body 是表达式，包装成 return 语句
    const newBody = t.isExpression(body)
      ? t.blockStatement([t.returnStatement(body)])
      : body;
    
    // 创建普通函数表达式
    const funcExpr = t.functionExpression(null, params, newBody);
    path.replaceWith(funcExpr);
  }
});

// 3. 生成
const output = generate(ast);
console.log(output.code);
// 输出: const add = function (a, b) { return a + b; };
```

## 七、@babel/types 工具库

### 7.1 节点创建

```javascript
const t = require('@babel/types');

// 创建标识符
t.identifier('name');

// 创建字符串字面量
t.stringLiteral('hello');

// 创建函数声明
t.functionDeclaration(
  t.identifier('myFunc'),  // id
  [],                       // params
  t.blockStatement([])      // body
);
```

### 7.2 节点判断

```javascript
t.isIdentifier(node);
t.isArrowFunctionExpression(node);
t.isVariableDeclaration(node, { kind: 'const' });
```

## 八、Babel 包结构

```
@babel/core        ← 核心编译逻辑，整合各模块
@babel/parser      ← 解析器
@babel/traverse    ← AST 遍历
@babel/generator   ← 代码生成
@babel/types       ← AST 节点工具
@babel/template    ← 代码模板
@babel/preset-env  ← 预设插件集合
```

### 8.1 @babel/core 的作用

```javascript
const babel = require('@babel/core');

// @babel/core 封装了完整流程
const result = babel.transformSync(code, {
  presets: ['@babel/preset-env']
});

console.log(result.code);
```

## 九、设计理念

### 9.1 插件化架构

```
Babel Core（不做任何转换）
    ↓
Plugin 1: 箭头函数转换
Plugin 2: class 转换
Plugin 3: 解构转换
    ↓
Preset（插件集合）: preset-env
```

> **📌 关键理解**  
> Babel 核心本身不做任何转换，所有转换都由插件完成。  
> Preset 是一组插件的集合，方便统一管理。

### 9.2 为什么这样设计

| 设计选择 | 好处 |
|----------|------|
| 插件化 | 按需加载，减少体积 |
| AST 操作 | 精准、可靠的代码转换 |
| 分离各阶段 | 各模块可独立使用 |

## 参考资料

- [Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)
- [AST Explorer](https://astexplorer.net/)
- [@babel/types 文档](https://babeljs.io/docs/babel-types)

---

**下一章** → [第 3 章：Babel 配置详解](./03-babel-config.md)
