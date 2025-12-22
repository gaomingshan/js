# 第 16 章：自定义规则开发

## 概述

当现有规则无法满足团队特定需求时，可以开发自定义 ESLint 规则。理解规则的工作原理，能让你针对项目特点创建精准的代码检查逻辑。

## 一、规则工作原理

### 1.1 AST 基础

ESLint 规则基于抽象语法树（AST）工作：

```javascript
// 源代码
const name = "Alice";

// 对应的 AST 结构（简化）
{
  "type": "VariableDeclaration",
  "kind": "const",
  "declarations": [{
    "type": "VariableDeclarator",
    "id": { "type": "Identifier", "name": "name" },
    "init": { "type": "Literal", "value": "Alice" }
  }]
}
```

> **💡 提示**  
> 使用 [AST Explorer](https://astexplorer.net/) 可视化查看代码的 AST 结构，选择 `@typescript-eslint/parser` 解析 TypeScript。

### 1.2 规则执行流程

```
源代码 → 解析器(Parser) → AST → 规则遍历(Visitor) → 问题报告 → 输出/修复
```

规则通过访问者模式遍历 AST 节点：

```javascript
// 规则访问特定节点类型
create(context) {
  return {
    Identifier(node) {
      // 访问每个标识符节点
    },
    CallExpression(node) {
      // 访问每个函数调用节点
    }
  };
}
```

## 二、规则结构

### 2.1 基本结构

```javascript
// rules/no-foo.js
module.exports = {
  meta: {
    type: "problem",           // 规则类型
    docs: {
      description: "禁止使用 foo 函数",
      category: "Best Practices",
      recommended: true
    },
    fixable: "code",           // 是否可修复
    schema: [],                // 配置参数schema
    messages: {
      noFoo: "禁止使用 foo 函数，请使用 bar 替代"
    }
  },
  create(context) {
    return {
      // 访问者方法
    };
  }
};
```

### 2.2 meta 属性详解

```javascript
meta: {
  // 规则类型
  type: "problem",      // 代码错误
  // type: "suggestion", // 改进建议
  // type: "layout",     // 格式问题
  
  // 文档信息
  docs: {
    description: "规则描述",
    category: "分类",
    url: "规则文档URL",
    recommended: false
  },
  
  // 修复能力
  fixable: "code",      // 可修复代码
  // fixable: "whitespace", // 可修复空白
  // fixable: null,      // 不可修复
  
  // 是否有建议修复
  hasSuggestions: true,
  
  // 配置schema（JSON Schema格式）
  schema: [
    {
      "type": "object",
      "properties": {
        "allowFoo": { "type": "boolean" }
      },
      "additionalProperties": false
    }
  ],
  
  // 消息模板
  messages: {
    errorId: "错误消息，支持 {{placeholder}} 占位符"
  },
  
  // 废弃信息
  deprecated: false,
  replacedBy: []
}
```

### 2.3 context 对象

`create` 函数接收的 `context` 提供了关键方法：

```javascript
create(context) {
  // 获取配置选项
  const options = context.options[0] || {};
  
  // 获取源代码对象
  const sourceCode = context.getSourceCode();
  
  // 获取文件名
  const filename = context.getFilename();
  
  // 获取作用域管理器
  const scopeManager = context.getScope();
  
  return {
    Identifier(node) {
      // 报告问题
      context.report({
        node,
        messageId: "errorId",
        data: { name: node.name },
        fix(fixer) {
          return fixer.replaceText(node, "newText");
        }
      });
    }
  };
}
```

## 三、开发实例

### 3.1 禁止 console.log

```javascript
// rules/no-console-log.js
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "禁止使用 console.log",
    },
    fixable: "code",
    messages: {
      noConsoleLog: "禁止使用 console.log，请使用 logger 替代"
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        // 检查是否是 console.log 调用
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "console" &&
          node.callee.property.name === "log"
        ) {
          context.report({
            node,
            messageId: "noConsoleLog",
            fix(fixer) {
              // 将 console.log 替换为 logger.info
              return fixer.replaceText(node.callee, "logger.info");
            }
          });
        }
      }
    };
  }
};
```

### 3.2 强制函数命名规范

```javascript
// rules/function-naming.js
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "强制事件处理函数使用 handle 前缀"
    },
    messages: {
      invalidName: "事件处理函数应以 handle 开头，如 handleClick"
    },
    schema: [{
      type: "object",
      properties: {
        eventProps: {
          type: "array",
          items: { type: "string" }
        }
      }
    }]
  },
  create(context) {
    const options = context.options[0] || {};
    const eventProps = options.eventProps || ["onClick", "onChange", "onSubmit"];
    
    return {
      JSXAttribute(node) {
        const propName = node.name.name;
        
        // 检查是否是事件属性
        if (!eventProps.includes(propName)) return;
        
        // 检查值是否是标识符
        if (
          node.value?.expression?.type === "Identifier" &&
          !node.value.expression.name.startsWith("handle")
        ) {
          context.report({
            node,
            messageId: "invalidName"
          });
        }
      }
    };
  }
};
```

### 3.3 检测魔法数字

```javascript
// rules/no-magic-numbers.js
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "禁止使用魔法数字"
    },
    messages: {
      noMagicNumber: "避免使用魔法数字 {{value}}，请提取为常量"
    },
    schema: [{
      type: "object",
      properties: {
        ignore: {
          type: "array",
          items: { type: "number" }
        }
      }
    }]
  },
  create(context) {
    const options = context.options[0] || {};
    const ignoreNumbers = new Set(options.ignore || [0, 1, -1]);
    
    return {
      Literal(node) {
        // 只检查数字
        if (typeof node.value !== "number") return;
        
        // 忽略的数字
        if (ignoreNumbers.has(node.value)) return;
        
        // 忽略常量声明中的数字
        const parent = node.parent;
        if (
          parent.type === "VariableDeclarator" &&
          parent.parent.kind === "const"
        ) {
          return;
        }
        
        context.report({
          node,
          messageId: "noMagicNumber",
          data: { value: node.value }
        });
      }
    };
  }
};
```

## 四、修复功能

### 4.1 fixer API

```javascript
fix(fixer) {
  // 替换节点
  fixer.replaceText(node, "newText");
  
  // 替换范围
  fixer.replaceTextRange([start, end], "newText");
  
  // 插入文本
  fixer.insertTextBefore(node, "text");
  fixer.insertTextAfter(node, "text");
  fixer.insertTextBeforeRange([start, end], "text");
  fixer.insertTextAfterRange([start, end], "text");
  
  // 删除
  fixer.remove(node);
  fixer.removeRange([start, end]);
}
```

### 4.2 多个修复操作

```javascript
fix(fixer) {
  // 返回数组执行多个操作
  return [
    fixer.insertTextBefore(node, "/* fixed */ "),
    fixer.replaceText(node.callee, "newFunc")
  ];
}
```

### 4.3 建议修复

对于不确定的修复，使用 `suggest`：

```javascript
context.report({
  node,
  messageId: "possibleError",
  suggest: [
    {
      messageId: "suggestFix1",
      fix(fixer) {
        return fixer.replaceText(node, "option1");
      }
    },
    {
      messageId: "suggestFix2",
      fix(fixer) {
        return fixer.replaceText(node, "option2");
      }
    }
  ]
});
```

## 五、创建插件

### 5.1 插件结构

```
eslint-plugin-myteam/
├── package.json
├── index.js
├── rules/
│   ├── no-console-log.js
│   └── function-naming.js
└── configs/
    └── recommended.js
```

### 5.2 package.json

```json
{
  "name": "eslint-plugin-myteam",
  "version": "1.0.0",
  "main": "index.js",
  "peerDependencies": {
    "eslint": ">=8.0.0"
  }
}
```

### 5.3 入口文件

```javascript
// index.js
module.exports = {
  rules: {
    "no-console-log": require("./rules/no-console-log"),
    "function-naming": require("./rules/function-naming")
  },
  configs: {
    recommended: require("./configs/recommended")
  }
};
```

### 5.4 预设配置

```javascript
// configs/recommended.js
module.exports = {
  plugins: ["myteam"],
  rules: {
    "myteam/no-console-log": "error",
    "myteam/function-naming": "warn"
  }
};
```

### 5.5 使用插件

```javascript
// .eslintrc.js
module.exports = {
  plugins: ["myteam"],
  extends: ["plugin:myteam/recommended"],
  // 或单独配置规则
  rules: {
    "myteam/no-console-log": "error"
  }
};
```

## 六、测试规则

### 6.1 使用 RuleTester

```javascript
// tests/no-console-log.test.js
const { RuleTester } = require("eslint");
const rule = require("../rules/no-console-log");

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020 }
});

ruleTester.run("no-console-log", rule, {
  valid: [
    // 有效代码
    "console.error('error')",
    "logger.info('info')",
    "log('message')"
  ],
  invalid: [
    {
      code: "console.log('test')",
      errors: [{ messageId: "noConsoleLog" }],
      output: "logger.info('test')"  // 修复后的代码
    }
  ]
});
```

### 6.2 TypeScript 规则测试

```javascript
const { RuleTester } = require("@typescript-eslint/rule-tester");
const rule = require("../rules/ts-rule");

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser"
});

ruleTester.run("ts-rule", rule, {
  valid: [
    {
      code: "const x: string = 'hello';"
    }
  ],
  invalid: [
    {
      code: "const x: any = 'hello';",
      errors: [{ messageId: "noAny" }]
    }
  ]
});
```

## 七、高级技巧

### 7.1 获取作用域信息

```javascript
create(context) {
  return {
    Identifier(node) {
      // 获取当前作用域
      const scope = context.getScope();
      
      // 查找变量
      const variable = scope.set.get(node.name);
      
      // 检查是否是全局变量
      const isGlobal = scope.type === "global";
    }
  };
}
```

### 7.2 获取注释

```javascript
create(context) {
  const sourceCode = context.getSourceCode();
  
  return {
    Program() {
      // 获取所有注释
      const comments = sourceCode.getAllComments();
      
      // 检查特定节点的注释
      // sourceCode.getCommentsBefore(node);
      // sourceCode.getCommentsAfter(node);
    }
  };
}
```

### 7.3 跨文件信息

```javascript
// 使用 settings 传递配置
// .eslintrc.js
{
  settings: {
    myPlugin: {
      allowedFunctions: ["foo", "bar"]
    }
  }
}

// 规则中读取
create(context) {
  const allowed = context.settings.myPlugin?.allowedFunctions || [];
}
```

## 八、常用 AST 节点类型

| 节点类型 | 说明 | 代码示例 |
|----------|------|----------|
| `Identifier` | 标识符 | `foo` |
| `Literal` | 字面量 | `"string"`, `42` |
| `CallExpression` | 函数调用 | `foo()` |
| `MemberExpression` | 成员访问 | `obj.prop` |
| `FunctionDeclaration` | 函数声明 | `function foo() {}` |
| `ArrowFunctionExpression` | 箭头函数 | `() => {}` |
| `VariableDeclaration` | 变量声明 | `const x = 1` |
| `IfStatement` | if语句 | `if (a) {}` |
| `ImportDeclaration` | import语句 | `import x from 'y'` |
| `ExportNamedDeclaration` | 命名导出 | `export { x }` |
| `JSXElement` | JSX元素 | `<div />` |
| `JSXAttribute` | JSX属性 | `prop="value"` |

## 九、最佳实践

### 9.1 规则设计原则

- **单一职责**：每个规则只检查一类问题
- **可配置**：通过 schema 提供配置选项
- **提供修复**：尽可能实现自动修复
- **清晰消息**：错误信息要明确指出问题和解决方案

### 9.2 性能考虑

```javascript
// ✅ 好：只访问需要的节点
return {
  CallExpression(node) { /* 只在调用时执行 */ }
};

// ❌ 差：访问所有节点
return {
  "*"(node) { /* 每个节点都执行 */ }
};
```

### 9.3 发布检查清单

- [ ] 规则有完整的 meta 信息
- [ ] 规则有充分的测试用例
- [ ] 规则有清晰的文档
- [ ] 自动修复不会破坏代码
- [ ] 配置 schema 正确

## 参考资料

- [ESLint 开发者指南](https://eslint.org/docs/developer-guide/)
- [AST Explorer](https://astexplorer.net/)
- [ESTree 规范](https://github.com/estree/estree)
- [typescript-eslint 自定义规则](https://typescript-eslint.io/developers/custom-rules)
