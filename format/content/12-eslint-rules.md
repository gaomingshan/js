# 第 12 章：ESLint 规则系统详解

## 概述

规则是 ESLint 的核心，每条规则负责检测特定类型的代码问题。深入理解规则系统的工作方式，能让你更精确地配置检查策略，平衡严格性与开发效率。

## 一、规则级别与配置语法

### 1.1 三种错误级别

ESLint 规则有三种严重级别：

| 级别 | 数值 | 字符串 | 行为 |
|------|------|--------|------|
| 关闭 | `0` | `"off"` | 禁用此规则 |
| 警告 | `1` | `"warn"` | 报告问题但不影响退出码 |
| 错误 | `2` | `"error"` | 报告问题并使进程以非零退出码退出 |

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // 使用数字
    "no-console": 0,
    "semi": 1,
    "quotes": 2,
    
    // 使用字符串（推荐，可读性更好）
    "no-debugger": "off",
    "eqeqeq": "warn",
    "no-unused-vars": "error"
  }
};
```

> **💡 提示**  
> 在 CI 环境中，`warn` 级别的规则不会导致构建失败，适合用于渐进式推广新规则。

### 1.2 带参数的规则配置

许多规则支持额外配置参数，使用数组语法：

```javascript
rules: {
  // [级别, ...参数]
  "quotes": ["error", "single"],                    // 强制单引号
  "indent": ["error", 2],                           // 2空格缩进
  "max-len": ["warn", { "code": 100 }],             // 行宽100字符
  "no-unused-vars": ["error", { 
    "argsIgnorePattern": "^_",                      // 忽略_开头参数
    "varsIgnorePattern": "^_"
  }]
}
```

**参数类型：**
- **字符串参数**：`"quotes": ["error", "single"]`
- **数值参数**：`"indent": ["error", 4]`
- **对象参数**：`"max-len": ["error", { "code": 80, "ignoreUrls": true }]`
- **混合参数**：`"indent": ["error", 2, { "SwitchCase": 1 }]`

### 1.3 查看规则文档

每条规则都有详细文档，包含配置选项和示例：

```bash
# 查看规则详情
npx eslint --print-config file.js | grep "规则名"

# 官方文档地址格式
# https://eslint.org/docs/rules/[规则名]
```

## 二、规则分类体系

### 2.1 按功能分类

ESLint 内置规则分为多个类别：

**Possible Problems（可能的问题）**
```javascript
rules: {
  "no-debugger": "error",           // 禁止debugger
  "no-dupe-keys": "error",          // 禁止对象重复键
  "no-unreachable": "error",        // 禁止不可达代码
  "no-unsafe-negation": "error",    // 禁止不安全的否定
  "use-isnan": "error"              // 强制使用isNaN()
}
```

**Suggestions（建议）**
```javascript
rules: {
  "eqeqeq": "error",                // 强制===
  "no-eval": "error",               // 禁止eval
  "no-var": "error",                // 禁止var
  "prefer-const": "warn",           // 优先const
  "curly": ["error", "all"]         // 强制大括号
}
```

**Layout & Formatting（格式）**
```javascript
rules: {
  "indent": ["error", 2],           // 缩进
  "semi": ["error", "always"],      // 分号
  "quotes": ["error", "single"],    // 引号
  "comma-dangle": ["error", "always-multiline"]  // 尾逗号
}
```

> **⚠️ 注意**  
> 格式类规则通常建议交给 Prettier 处理，避免 ESLint 与 Prettier 冲突。

### 2.2 按严重程度分类

```javascript
// 错误级：必须修复
const criticalRules = {
  "no-debugger": "error",
  "no-unused-vars": "error",
  "no-undef": "error"
};

// 警告级：建议修复
const warningRules = {
  "prefer-const": "warn",
  "no-console": "warn",
  "complexity": ["warn", 10]
};

// 关闭级：不适用当前项目
const disabledRules = {
  "no-underscore-dangle": "off",    // 允许下划线命名
  "class-methods-use-this": "off"   // 允许不使用this的类方法
};
```

## 三、自动修复机制

### 3.1 可修复规则

部分规则支持 `--fix` 自动修复：

```bash
# 修复单个文件
npx eslint --fix src/index.js

# 修复目录
npx eslint --fix src/

# 仅报告可修复问题（不实际修复）
npx eslint --fix-dry-run src/
```

**常见可修复规则：**

| 规则 | 修复行为 |
|------|----------|
| `semi` | 添加/移除分号 |
| `quotes` | 转换引号类型 |
| `indent` | 调整缩进 |
| `no-extra-semi` | 移除多余分号 |
| `prefer-const` | `let` 改为 `const` |
| `no-var` | `var` 改为 `let/const` |
| `object-shorthand` | 转为简写语法 |
| `arrow-body-style` | 调整箭头函数体 |

### 3.2 修复的局限性

```javascript
// ❌ 不可自动修复的规则
"no-unused-vars"     // 需要人工判断是否删除
"no-undef"           // 需要人工添加定义或导入
"complexity"         // 需要重构代码逻辑

// ⚠️ 可能导致语义变化的修复
"prefer-template"    // 字符串拼接改模板字符串
"no-useless-concat"  // 合并字符串字面量
```

> **💡 提示**  
> 自动修复后应进行代码审查，确保修复没有改变代码逻辑。

### 3.3 安全修复与建议修复

ESLint 8+ 引入了建议修复（suggestions）：

```javascript
// 规则可以提供多个建议修复方案
// 例如 no-unsafe-negation 可能建议：
// 1. 添加括号: if (!(key in object))
// 2. 移除否定: if (key in object)
```

```bash
# 查看建议但不自动应用
npx eslint src/ --format stylish
```

## 四、内联规则控制

### 4.1 禁用规则

```javascript
/* eslint-disable */
// 此块内所有规则被禁用
console.log('debug');
/* eslint-enable */

/* eslint-disable no-console */
console.log('allowed');  // 仅禁用no-console
/* eslint-enable no-console */

// 单行禁用
console.log('debug'); // eslint-disable-line
console.log('debug'); // eslint-disable-line no-console

// 下一行禁用
// eslint-disable-next-line
console.log('debug');
// eslint-disable-next-line no-console, no-debugger
console.log('debug');
```

### 4.2 配置规则

```javascript
/* eslint quotes: ["error", "double"] */
// 此文件使用双引号

/* eslint-env node */
// 启用Node.js环境

/* global myGlobal:readonly */
// 声明全局变量
```

### 4.3 最佳实践

```javascript
// ✅ 好的做法：说明禁用原因
// eslint-disable-next-line no-console -- 开发调试需要
console.log('Development only');

// ✅ 好的做法：最小范围禁用
// eslint-disable-next-line no-await-in-loop -- 顺序执行必需
for (const item of items) {
  await processItem(item);
}

// ❌ 避免：大范围禁用所有规则
/* eslint-disable */
// 大量代码...
/* eslint-enable */
```

## 五、常用规则配置示例

### 5.1 代码质量规则

```javascript
rules: {
  // 变量相关
  "no-unused-vars": ["error", { 
    "args": "after-used",
    "ignoreRestSiblings": true 
  }],
  "no-use-before-define": ["error", { 
    "functions": false  // 允许函数声明提升
  }],
  
  // 最佳实践
  "eqeqeq": ["error", "always", { "null": "ignore" }],
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  "radix": "error",
  
  // 复杂度控制
  "complexity": ["warn", 15],
  "max-depth": ["warn", 4],
  "max-params": ["warn", 4],
  "max-lines-per-function": ["warn", { "max": 50 }]
}
```

### 5.2 ES6+ 规则

```javascript
rules: {
  // 变量声明
  "no-var": "error",
  "prefer-const": "error",
  
  // 函数
  "prefer-arrow-callback": "error",
  "arrow-body-style": ["error", "as-needed"],
  "prefer-rest-params": "error",
  "prefer-spread": "error",
  
  // 对象与类
  "object-shorthand": "error",
  "prefer-destructuring": ["warn", {
    "array": false,
    "object": true
  }],
  "no-useless-constructor": "error",
  
  // 模板与字符串
  "prefer-template": "error",
  "template-curly-spacing": ["error", "never"]
}
```

### 5.3 针对特定场景

```javascript
// Node.js 后端
rules: {
  "no-console": "off",              // 允许console
  "global-require": "error",        // require放顶部
  "no-process-exit": "error",       // 禁止process.exit
  "callback-return": "error"        // 回调后return
}

// React 前端
rules: {
  "no-console": "warn",
  "jsx-quotes": ["error", "prefer-double"],
  "react/prop-types": "off",        // 使用TS时关闭
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn"
}
```

## 六、规则冲突处理

### 6.1 与 Prettier 冲突

使用 `eslint-config-prettier` 关闭冲突规则：

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    "eslint:recommended",
    "prettier"  // 放最后，关闭冲突规则
  ]
};
```

**常见冲突规则：**
```javascript
// 这些规则会被 eslint-config-prettier 关闭
"indent", "quotes", "semi", "comma-dangle",
"max-len", "arrow-parens", "brace-style"
```

### 6.2 规则优先级

```javascript
// 后面的配置覆盖前面的
module.exports = {
  extends: [
    "eslint:recommended",     // 基础规则
    "plugin:react/recommended", // React规则
    "prettier"                // 最后关闭格式规则
  ],
  rules: {
    // 这里的规则优先级最高
    "no-console": "warn"      // 覆盖extends中的配置
  }
};
```

## 七、规则系统原理

### 7.1 规则的工作流程

```
源代码 → 解析器 → AST → 规则遍历 → 问题收集 → 报告/修复
```

每条规则本质是一个函数，接收 AST 节点并检查是否符合要求：

```javascript
// 规则基本结构（简化）
module.exports = {
  meta: {
    type: "problem",           // 规则类型
    fixable: "code",           // 是否可修复
    schema: [/* 参数定义 */]
  },
  create(context) {
    return {
      // 访问特定AST节点
      Identifier(node) {
        if (/* 检测到问题 */) {
          context.report({
            node,
            message: "问题描述",
            fix(fixer) {
              return fixer.replaceText(node, "修复后的代码");
            }
          });
        }
      }
    };
  }
};
```

### 7.2 AST 节点类型

常见的 AST 节点类型：

| 节点类型 | 说明 | 示例代码 |
|----------|------|----------|
| `Identifier` | 标识符 | `foo` |
| `Literal` | 字面量 | `"string"`, `42` |
| `CallExpression` | 函数调用 | `foo()` |
| `FunctionDeclaration` | 函数声明 | `function foo() {}` |
| `VariableDeclaration` | 变量声明 | `const x = 1` |
| `IfStatement` | if语句 | `if (a) {}` |
| `BinaryExpression` | 二元表达式 | `a + b` |

> **💡 深入理解**  
> 可以通过 [AST Explorer](https://astexplorer.net/) 查看代码的 AST 结构，这对理解规则工作原理非常有帮助。

## 八、实践建议

### 8.1 规则选择策略

```
1. 从 recommended 开始
   ↓
2. 根据项目需求调整
   ↓
3. 团队讨论争议规则
   ↓
4. 新规则先用 warn
   ↓
5. 稳定后改为 error
```

### 8.2 渐进式严格化

```javascript
// 阶段1：基础规则
extends: ["eslint:recommended"]

// 阶段2：添加风格规则（warn级别）
rules: {
  "prefer-const": "warn",
  "no-var": "warn"
}

// 阶段3：提升为error
rules: {
  "prefer-const": "error",
  "no-var": "error"
}
```

### 8.3 团队共识

- **明确规则目的**：每条规则应有清晰的价值说明
- **记录例外情况**：哪些场景可以禁用规则
- **定期复审规则**：根据实践调整配置

## 参考资料

- [ESLint Rules Reference](https://eslint.org/docs/rules/)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [AST Explorer](https://astexplorer.net/)
- [Understanding AST](https://esprima.readthedocs.io/en/latest/syntactic-analysis.html)
