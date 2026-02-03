# ESLint 核心机制与配置策略

## 概述

ESLint 不是"代码美化工具"，而是**代码质量防线**。理解 ESLint 的核心在于掌握规则系统、配置继承机制，以及如何为团队选择合适的预设。

**核心认知**：
- ESLint 通过 AST 分析发现潜在问题，避免运行时错误
- 规则级别（error/warn/off）反映问题严重程度与执行策略
- 配置继承机制支持 Monorepo 与多项目管理

**后端类比**：
- ESLint ≈ SonarQube（静态代码分析）
- 规则系统 ≈ 编码规范检查器
- 配置继承 ≈ Maven 多模块配置管理

---

## ESLint 的工程定位

### 设计目标

**1. 发现潜在错误**

```javascript
// no-unused-vars
const user = null;
console.log(user.name);  // TypeError: Cannot read property 'name' of null

// ESLint 规则
{
  "rules": {
    "no-unused-vars": "error",
    "no-undef": "error"
  }
}
```

**2. 强制代码一致性**

```javascript
// eqeqeq：强制使用 ===
if (value == null) {}  // ❌
if (value === null) {}  // ✅
```

**3. 降低维护成本**

```javascript
// complexity：限制函数复杂度
{
  "rules": {
    "complexity": ["error", 10]  // 圈复杂度不超过 10
  }
}
```

---

### 核心架构

```
ESLint 架构
├── Parser（解析器）
│   ├── 将代码转为 AST
│   └── 支持不同语法（Babel、TypeScript）
│
├── Rules（规则）
│   ├── 内置规则（300+）
│   └── 自定义规则
│
├── Plugins（插件）
│   ├── React、Vue、Node.js
│   └── 扩展规则集
│
└── Formatter（格式化器）
    └── 输出格式（stylish、json）
```

**后端类比**：编译器架构（词法分析 → 语法分析 → 语义分析）。

---

## 规则系统设计

### 规则级别

```json
{
  "rules": {
    "no-unused-vars": "error",  // 阻断提交
    "console.log": "warn",      // 提示但允许
    "max-len": "off"            // 禁用规则
  }
}
```

**级别对比**：

| 级别 | 含义 | ESLint 退出码 | CI 行为 | 使用场景 |
|------|------|--------------|---------|----------|
| `error` | 错误 | 1（失败） | 阻断构建 | 严重质量问题 |
| `warn` | 警告 | 0（成功） | 允许通过 | 建议改进 |
| `off` | 禁用 | - | 不检查 | 不适用规则 |

**后端类比**：日志级别（ERROR、WARN、INFO）。

---

### 规则参数配置

**基础参数**：
```json
{
  "rules": {
    // 无参数
    "no-var": "error",
    
    // 单个参数
    "quotes": ["error", "single"],
    
    // 对象参数
    "max-len": ["error", {
      "code": 100,
      "ignoreComments": true
    }]
  }
}
```

**复杂参数示例**：
```json
{
  "rules": {
    // no-console：允许 warn 和 error
    "no-console": ["warn", {
      "allow": ["warn", "error"]
    }],
    
    // complexity：圈复杂度不超过 10
    "complexity": ["error", 10]
  }
}
```

---

### 自动修复机制

**可自动修复的规则**：
```json
{
  "rules": {
    "quotes": ["error", "single"],      // 可修复
    "semi": ["error", "always"],        // 可修复
    "indent": ["error", 2],             // 可修复
    "no-unused-vars": "error"           // 不可修复
  }
}
```

**自动修复命令**：
```bash
eslint --fix src/**/*.js
```

**不可修复的规则**：需要人工判断逻辑
```javascript
// no-unused-vars（不可修复）
const name = 'Alice';  // 未使用
// 修复方案：删除？还是补充使用逻辑？需要人工判断
```

---

## 配置文件继承机制

### 配置查找顺序

ESLint 从当前文件所在目录向上查找，直到根目录：

```
project/
  ├── .eslintrc.json          # 根配置
  ├── src/
  │   ├── .eslintrc.json      # src 配置（继承根配置）
  │   └── components/
  │       ├── .eslintrc.json  # components 配置
  │       └── Button.js       # 应用 components 配置
```

**Button.js 的配置查找**：
```
1. src/components/.eslintrc.json
2. src/.eslintrc.json
3. .eslintrc.json
```

**合并规则**：就近优先，逐层合并。

**后端类比**：Maven 的 pom.xml 继承机制。

---

### extends 继承

**基础继承**：
```json
{
  "extends": "eslint:recommended"
}
```

**多重继承**：
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ]
}
```

**合并顺序**：后面的配置覆盖前面的。

**示例**：
```json
// airbnb: quotes: "single"
// prettier: 禁用 quotes 规则
{
  "extends": ["airbnb", "prettier"],
  // 最终：quotes 规则被禁用
}
```

---

### overrides 覆盖机制

**按文件类型覆盖**：
```json
{
  "rules": {
    "no-console": "error"  // 全局规则
  },
  "overrides": [
    {
      "files": ["**/*.test.js"],  // 测试文件
      "rules": {
        "no-console": "off"  // 测试文件允许 console
      }
    }
  ]
}
```

**多环境配置**：
```json
{
  "overrides": [
    {
      "files": ["src/client/**/*.js"],
      "env": {
        "browser": true,
        "node": false
      }
    },
    {
      "files": ["src/server/**/*.js"],
      "env": {
        "node": true,
        "browser": false
      },
      "rules": {
        "no-console": "off"  // 服务端允许
      }
    }
  ]
}
```

**后端类比**：Spring Profile（开发、测试、生产环境）。

---

## 主流配置预设选择

### Airbnb vs Standard vs Google

| 预设 | 特点 | 适用场景 | 严格程度 |
|------|------|---------|---------|
| Airbnb | 严格、工程化 | React 项目、大型团队 | 高 |
| Standard | 零配置、固执 | 小团队、快速上手 | 中 |
| Google | 简洁、实用 | Google 技术栈 | 中 |

---

### Airbnb 配置解析

**安装**：
```bash
npm install --save-dev eslint-config-airbnb
```

**配置**：
```json
{
  "extends": ["airbnb", "prettier"],
  "rules": {
    // 覆盖特定规则
    "react/prop-types": "off",  // 使用 TypeScript
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**设计思路**：
- 严格的代码质量要求
- 强制使用现代语法
- React 最佳实践

---

### Standard 配置解析

**安装**：
```bash
npm install --save-dev eslint-config-standard
```

**配置**：
```json
{
  "extends": "standard"
}
```

**设计思路**：
- 零配置，快速上手
- 固执己见（无分号、2 空格缩进）
- 适合小团队

---

### 选择策略

**决策维度**：

**1. 团队规模**
```
小团队（<5人）→ Standard（零配置）
中大团队 → Airbnb / Google（主流预设）
```

**2. 技术栈**
```
React 项目 → Airbnb
Vue 项目 → eslint-plugin-vue
TypeScript → @typescript-eslint
Node.js → eslint-plugin-node
```

**3. 历史代码量**
```
新项目 → 严格配置（Airbnb）
历史项目 → 宽松配置（Standard）+ 渐进式升级
```

---

### 自定义规则的必要性判断

**何时需要自定义规则**：
1. 团队特定约定（如禁止某个 API）
2. 业务规则检查（如必须有错误处理）
3. 主流预设未覆盖的场景

**示例**：
```javascript
// 禁止直接使用 localStorage
module.exports = {
  create(context) {
    return {
      MemberExpression(node) {
        if (node.object.name === 'localStorage') {
          context.report({
            node,
            message: '禁止直接使用 localStorage，请使用封装的 storage 工具'
          });
        }
      }
    };
  }
};
```

**原则**：最小化定制，优先使用主流预设。

---

## Monorepo 配置管理

### 根配置 + 子包继承

```
monorepo/
  ├── .eslintrc.json          # 根配置
  ├── packages/
  │   ├── app-a/.eslintrc.json
  │   └── app-b/.eslintrc.json
```

**根配置**：
```json
{
  "root": true,  // 停止向上查找
  "extends": ["eslint:recommended", "prettier"],
  "rules": {
    "no-unused-vars": "error"
  }
}
```

**子包配置**：
```json
{
  "extends": "../../.eslintrc.json",
  "rules": {
    // 子包特定规则
  }
}
```

---

### 共享配置包

**创建共享配置**：
```javascript
// @company/eslint-config/index.js
module.exports = {
  extends: ['airbnb', 'prettier'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

**使用**：
```json
{
  "extends": "@company/eslint-config"
}
```

**优势**：
- 组织级统一
- 版本管理
- 跨项目复用

**后端类比**：Maven Parent POM。

---

## 深入一点：配置调试

### 查看生效的配置

```bash
# 查看文件的完整配置
eslint --print-config src/index.js
```

**输出示例**：
```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "error"
  }
}
```

---

### 配置验证

```bash
# 验证配置文件语法
eslint --validate-config .eslintrc.json
```

---

## 参考资料

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Configuring ESLint](https://eslint.org/docs/user-guide/configuring/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [StandardJS](https://standardjs.com/)
