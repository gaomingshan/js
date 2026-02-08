# ESLint 规则定制与性能优化

## 概述

深入掌握 ESLint 需要理解框架特定规则、自定义规则开发、性能优化策略，以及错误抑制的合理管理。

**核心认知**：
- 框架规则反映最佳实践（React Hooks、Vue 响应式）
- 自定义规则通过 AST 分析实现团队特定约束
- 性能优化是大型项目与 Monorepo 的必要手段

**后端类比**：
- 框架规则 ≈ 框架最佳实践（Spring Boot 规范）
- 自定义规则 ≈ 自定义静态分析规则
- 性能优化 ≈ 编译优化（增量编译、并行编译）

---

## 框架特定规则

### React Hooks 规则

**react-hooks/rules-of-hooks**：
```javascript
// ❌ 错误：在条件中使用 Hook
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(0);  // 违反 Hooks 规则
  }
}

// ✅ 正确：Hooks 在顶层调用
function Component({ condition }) {
  const [state, setState] = useState(0);
  if (condition) {
    // 使用 state
  }
}
```

**工程意义**：
- Hook 必须在每次渲染时以相同顺序调用
- 违反规则会导致运行时错误
- ESLint 在编译期就能发现问题

**配置**：
```json
{
  "extends": [
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

### Vue 模板语法规则

**vue/no-mutating-props**：
```vue
<!-- ❌ 错误：直接修改 props -->
<template>
  <button @click="count++">{{ count }}</button>
</template>

<script>
export default {
  props: ['count']
}
</script>

<!-- ✅ 正确：通过事件通知父组件 -->
<template>
  <button @click="$emit('increment')">{{ count }}</button>
</template>
```

**配置**：
```json
{
  "extends": [
    "plugin:vue/vue3-recommended"
  ],
  "rules": {
    "vue/no-mutating-props": "error",
    "vue/require-default-prop": "warn"
  }
}
```

---

### TypeScript 集成

**@typescript-eslint 规则**：
```typescript
// ❌ no-explicit-any
function process(data: any) {  // any 类型不安全
  return data.value;
}

// ✅ 明确类型
function process(data: { value: string }) {
  return data.value;
}
```

**配置**：
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

**后端类比**：强类型语言的编译器检查。

---

## 自定义规则开发

### AST 分析基础

**代码转 AST**：
```javascript
const name = 'Alice';
```

**AST 表示**：
```json
{
  "type": "VariableDeclaration",
  "kind": "const",
  "declarations": [{
    "type": "VariableDeclarator",
    "id": {
      "type": "Identifier",
      "name": "name"
    },
    "init": {
      "type": "Literal",
      "value": "Alice"
    }
  }]
}
```

**工具**：[AST Explorer](https://astexplorer.net/)

---

### 自定义规则实现

**场景**：禁止直接使用 localStorage

```javascript
// custom-rules/no-direct-localstorage.js
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "禁止直接使用 localStorage",
      category: "Best Practices"
    },
    messages: {
      noDirectLocalStorage: "禁止直接使用 localStorage，请使用封装的 storage 工具"
    }
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.name === 'localStorage' ||
          node.object.name === 'sessionStorage'
        ) {
          context.report({
            node,
            messageId: 'noDirectLocalStorage'
          });
        }
      }
    };
  }
};
```

**使用**：
```json
{
  "plugins": ["custom-rules"],
  "rules": {
    "custom-rules/no-direct-localstorage": "error"
  }
}
```

---

### 团队特定场景

**场景 1：强制错误处理**

```javascript
// 检查异步函数是否有 try-catch
module.exports = {
  create(context) {
    return {
      FunctionDeclaration(node) {
        if (node.async) {
          const hasTryCatch = node.body.body.some(
            stmt => stmt.type === 'TryStatement'
          );
          if (!hasTryCatch) {
            context.report({
              node,
              message: 'async 函数必须包含 try-catch'
            });
          }
        }
      }
    };
  }
};
```

**场景 2：禁止特定 API**

```javascript
// 禁止使用 eval
module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.name === 'eval') {
          context.report({
            node,
            message: '禁止使用 eval，存在安全风险'
          });
        }
      }
    };
  }
};
```

**后端类比**：自定义 Checkstyle 规则。

---

## 性能优化策略

### 缓存机制

**启用缓存**：
```bash
eslint --cache src/**/*.js
```

**缓存文件**：`.eslintcache`

**效果**：
- 只检查变更文件
- 速度提升 50%+

**清除缓存**：
```bash
rm .eslintcache
```

**后端类比**：增量编译。

---

### 增量检查

**只检查变更文件**：
```bash
# Git 变更文件
eslint $(git diff --name-only --diff-filter=ACM HEAD | grep -E '\\.(js|jsx|ts|tsx)$')
```

**lint-staged 配置**：
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```

**效果**：
- 提交时只检查暂存文件
- 大幅提升速度

---

### 并行处理

**ESLint 并行执行**：
```bash
# 使用多核 CPU
eslint --cache --max-warnings 0 src/**/*.js
```

**CI 并行策略**：
```yaml
jobs:
  lint:
    strategy:
      matrix:
        task: [eslint, prettier, typescript]
    steps:
      - run: npm run ${{ matrix.task }}
```

---

### Monorepo 优化

**问题**：Monorepo 项目 ESLint 检查耗时过长

**解决方案 1：配置 ignorePatterns**

```json
{
  "ignorePatterns": [
    "node_modules/",
    "dist/",
    "packages/*/dist/"
  ]
}
```

**解决方案 2：只检查变更子包**

```bash
# 检测变更的子包
CHANGED_PACKAGES=$(lerna changed --all)

# 只检查变更包
for pkg in $CHANGED_PACKAGES; do
  eslint packages/$pkg/src
done
```

**解决方案 3：使用 Nx 缓存**

```bash
# Nx 自动缓存未变更任务
nx run-many --target=lint --all
```

**后端类比**：Maven 多模块增量编译。

---

## 错误抑制管理

### eslint-disable 的滥用问题

**问题场景**：
```javascript
// ❌ 全局禁用
/* eslint-disable */
function messy() {
  var a=1,b=2
  if(a==b)return true
}
/* eslint-enable */
```

**影响**：
- 规范形同虚设
- 技术债累积
- 代码质量下降

---

### 合理使用 eslint-disable

**原则**：
1. 只在必要时使用
2. 最小化禁用范围
3. 添加注释说明原因

**推荐做法**：
```javascript
// ✅ 禁用单条规则，说明原因
// eslint-disable-next-line no-console -- 调试代码，上线前需删除
console.log('debug info');

// ✅ 禁用单行，多条规则
// eslint-disable-next-line no-unused-vars, no-undef
const temp = externalVar;

// ❌ 避免全局禁用
/* eslint-disable */
```

---

### 例外场景判断

**合理的例外场景**：

**1. 第三方库限制**
```javascript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyApi: any = externalLib.getApi();  // 第三方库无类型定义
```

**2. 性能关键代码**
```javascript
// eslint-disable-next-line no-plusplus
for (let i = 0; i < 1000000; i++) {}  // 性能敏感循环
```

**3. 兼容性代码**
```javascript
// eslint-disable-next-line no-var
var isIE = document.all;  // IE 兼容性检测
```

---

### 技术债追踪

**审计 eslint-disable**：
```bash
# 查找所有禁用规则的代码
grep -r "eslint-disable" src/

# 统计数量
grep -r "eslint-disable" src/ | wc -l
```

**限制禁用规则**：
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Program > BlockComment[value=/eslint-disable/]",
        "message": "禁止全局禁用 ESLint，请使用 eslint-disable-next-line"
      }
    ]
  }
}
```

**Code Review 检查**：
- 要求说明禁用原因
- 定期清理临时禁用
- 追踪技术债

**后端类比**：TODO 注释的管理与追踪。

---

## 深入一点：规则定制的边界

### 何时需要自定义规则

**需要**：
1. 团队特定约定（禁止某个 API）
2. 安全规则（禁止 eval、innerHTML）
3. 业务规则（必须有错误处理）

**不需要**：
1. 已有主流规则覆盖
2. 过于细节的格式问题（交给 Prettier）
3. 运行时才能判断的逻辑

---

### 自定义规则的成本

**开发成本**：
- AST 学习曲线
- 规则测试
- 文档编写

**维护成本**：
- 规则更新
- Bug 修复
- 团队培训

**原则**：
> 优先使用主流规则，最小化定制。

**后端类比**：优先使用框架能力，而非自己造轮子。

---

## 参考资料

- [ESLint Plugin React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [ESLint Plugin Vue](https://eslint.vuejs.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [AST Explorer](https://astexplorer.net/)
- [ESLint Developer Guide](https://eslint.org/docs/developer-guide/)
