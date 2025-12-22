# 第 2 章：规范分类与范围

## 概述

前端代码规范涵盖多个维度，从语法规则到架构约定。理解这些不同类型的规范以及它们的适用范围，对于构建全面而有效的代码规范体系至关重要。

## 一、规范的基本分类

### 1.1 按领域划分

前端开发中，规范可以按技术领域划分为几个主要类别：

**JavaScript/TypeScript 规范**
```javascript
// 变量声明规范
const userName = 'John';  // 使用 camelCase 命名变量
const DAYS_IN_WEEK = 7;   // 使用 UPPER_CASE 命名常量

// 函数声明规范
function calculateTotal(items) {
  // 函数体应当有适当的复杂度
}
```

**HTML 规范**
```html
<!-- 语义化标签使用 -->
<article>
  <h1>文章标题</h1>
  <p>文章内容...</p>
</article>

<!-- 属性顺序规范 -->
<a href="https://example.com" class="link" id="main-link" target="_blank">链接文本</a>
```

**CSS/SCSS/Less 规范**
```css
/* 选择器命名规范 */
.user-profile {
  /* 属性排序规范 */
  display: flex;
  width: 100%;
  background-color: #f5f5f5;
}

/* 媒体查询规范 */
@media (max-width: 768px) {
  .user-profile {
    flex-direction: column;
  }
}
```

**工具配置规范**
```json
// package.json 依赖版本规范
{
  "dependencies": {
    "react": "^17.0.2",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "eslint": "^8.0.0"
  }
}
```

### 1.2 按约束级别划分

规范可以根据其强制程度分为不同级别：

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│  必须遵守的规则   │     │  建议遵守的规则   │     │  可选的风格指南   │
│  (Must-follow)    │ ──► │  (Should-follow)  │ ──► │  (Nice-to-have)   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
       严格度高                                             严格度低
```

**必须遵守的规则 (Error)**
```javascript
// ❌ 禁止使用 var（错误级别）
var name = 'John';  // 违反规则

// ✅ 正确做法
let name = 'John';  // 或使用 const
```

**建议遵守的规则 (Warning)**
```javascript
// ⚠️ 不建议使用 console.log（警告级别）
console.log('Debug info');  // 不推荐，但允许

// ✅ 推荐做法
logger.debug('Debug info');  // 使用日志系统
```

**可选的风格指南 (Suggestion)**
```javascript
// 😐 函数参数最好不超过3个（建议级别）
function process(param1, param2, param3, param4) {
  // 允许，但不推荐
}

// ✅ 推荐做法
function process({ param1, param2, param3, param4 }) {
  // 使用对象解构
}
```

> **💡 提示**  
> 不同级别的规则通常在 ESLint 等工具中对应不同的错误级别：`error`、`warn` 和 `off`。团队应明确定义哪些规则属于哪个级别。

## 二、语法与格式规范

### 2.1 语法规则

语法规则关注代码的编写方式和语言特性使用：

**变量声明与使用**
```javascript
// ❌ 不推荐
if(true){
  var x=1;
  x=x+1;
}

// ✅ 推荐
if (true) {
  const x = 1;
  const result = x + 1;
}
```

**控制流结构**
```javascript
// ❌ 不推荐
if (condition)
  doSomething();
else
  doSomethingElse();

// ✅ 推荐
if (condition) {
  doSomething();
} else {
  doSomethingElse();
}
```

**函数定义**
```javascript
// ❌ 不推荐
function calc (x,y) { return x+y }

// ✅ 推荐
function calculate(x, y) {
  return x + y;
}
```

### 2.2 格式规则

格式规则专注于代码的视觉呈现：

**缩进与空格**
```javascript
// ❌ 不一致的缩进
function example() {
    const a = 1;
  const b = 2;
      return a + b;
}

// ✅ 一致的缩进（2空格）
function example() {
  const a = 1;
  const b = 2;
  return a + b;
}
```

**换行与空行**
```javascript
// ❌ 缺少适当的分隔
function process(data) {
  const result = {};
  const keys = Object.keys(data);
  for (const key of keys) {
    result[key] = transform(data[key]);
  }
  return result;
}

// ✅ 使用空行分隔逻辑块
function process(data) {
  const result = {};
  const keys = Object.keys(data);
  
  for (const key of keys) {
    result[key] = transform(data[key]);
  }
  
  return result;
}
```

**行长度**
```javascript
// ❌ 过长的行
const longString = 'This is a very long string that exceeds the recommended line length limit and makes horizontal scrolling necessary which reduces code readability significantly.';

// ✅ 适当换行
const longString = 
  'This is a very long string that has been broken into ' +
  'multiple lines to improve readability and avoid ' + 
  'horizontal scrolling.';
```

## 三、命名与结构规范

### 3.1 命名约定

命名约定是代码可读性的关键要素：

**通用命名原则**
- **描述性**：名称应清晰描述用途
- **准确性**：名称应准确反映含义
- **一致性**：遵循统一的命名风格

**常见命名风格**

| 风格 | 示例 | 适用场景 |
|------|-----|---------|
| camelCase | `userName`, `calculateTotal` | JS 变量、函数 |
| PascalCase | `UserProfile`, `ButtonComponent` | JS 类、组件 |
| kebab-case | `user-profile`, `nav-item` | HTML 元素、CSS 类 |
| SNAKE_CASE | `MAX_RETRY_COUNT`, `API_URL` | JS 常量 |

**前缀和后缀约定**
```javascript
// 布尔值前缀
const isActive = true;
const hasPermission = false;

// 私有成员前缀
class User {
  #privateField = 'private';  // 使用私有字段语法
  _internalState = {};        // 约定前缀（旧方式）
}

// 类型后缀
const userList = ['John', 'Jane'];  // 集合
const userMap = new Map();          // 映射
```

### 3.2 文件与目录组织

代码的物理结构同样需要规范：

**文件命名**
```
# 常见文件命名规范
user-profile.component.ts    # 特性.类型.扩展名
UserProfileComponent.tsx     # PascalCase 组件文件
_variables.scss              # 下划线前缀表示部分文件
index.js                     # 模块入口文件
```

**目录结构**
```
src/
├── components/             # 组件目录
│   ├── common/             # 通用组件
│   └── feature/            # 特性组件
├── hooks/                  # React Hooks
├── services/               # API 服务
├── utils/                  # 工具函数
├── styles/                 # 全局样式
└── pages/                  # 页面组件
```

**模块组织**
```javascript
// ❌ 混乱的导入顺序
import { useState } from 'react';
import styles from './styles.css';
import axios from 'axios';
import { Button } from '../components';
import { API_URL } from '../../constants';

// ✅ 分组的导入顺序
// 1. 第三方库
import { useState } from 'react';
import axios from 'axios';
// 2. 项目模块
import { Button } from '../components';
import { API_URL } from '../../constants';
// 3. 样式和资源
import styles from './styles.css';
```

## 四、编码实践规范

### 4.1 语言特性使用规范

规定哪些语言特性推荐使用，哪些应当避免：

**JavaScript 特性规范**
```javascript
// ❌ 避免使用 eval
eval('console.log("Hello")');

// ❌ 避免使用 with 语句
with (object) {
  property = value;
}

// ✅ 推荐使用 ES6+ 特性
// 解构赋值
const { name, age } = user;

// 扩展运算符
const newArray = [...oldArray];

// 可选链和空值合并
const username = user?.profile?.name ?? 'Anonymous';
```

**TypeScript 特性规范**
```typescript
// ❌ 避免使用 any
function process(data: any) {
  return data.value;
}

// ✅ 使用适当的类型
function process(data: { value: string }): string {
  return data.value;
}

// ✅ 合理使用泛型
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}
```

### 4.2 项目实践规范

针对特定项目类型的最佳实践：

**React 项目规范**
```jsx
// ❌ 不推荐
function Component() {
  const [count, setCount] = React.useState(0);
  const increment = () => { setCount(count + 1); };
  return <div onClick={increment}>{count}</div>;
}

// ✅ 推荐
function Counter() {
  const [count, setCount] = React.useState(0);
  
  // 使用函数式更新
  const handleIncrement = React.useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}
```

**Vue 项目规范**
```vue
<!-- 组件文件结构 -->
<template>
  <div class="component">
    {{ message }}
    <button @click="onClick">Click me</button>
  </div>
</template>

<script>
export default {
  name: 'ExampleComponent',
  props: {
    initialValue: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      message: this.initialValue
    }
  },
  methods: {
    onClick() {
      this.$emit('button-clicked')
    }
  }
}
</script>

<style scoped>
.component {
  margin: 20px;
}
</style>
```

## 五、工程与构建规范

### 5.1 依赖管理规范

规范化项目依赖管理：

**依赖版本控制**
```json
// ❌ 不确定的版本
{
  "dependencies": {
    "react": "*",
    "lodash": "latest"
  }
}

// ✅ 精确的版本控制
{
  "dependencies": {
    "react": "17.0.2",             // 精确版本
    "lodash": "^4.17.21",          // 兼容版本
    "@company/ui": "~2.3.0"        // 修订版本
  }
}
```

**依赖分类**
```json
{
  "dependencies": {
    "react": "^17.0.2",            // 运行时依赖
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "eslint": "^8.0.0",            // 开发时依赖
    "typescript": "^4.4.3"
  },
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0"  // 宿主环境依赖
  }
}
```

### 5.2 构建与部署规范

确保项目构建和部署过程的一致性：

**环境变量处理**
```
# .env.example
API_URL=https://api.example.com
FEATURE_FLAG_NEW_UI=false

# .env.development
API_URL=http://localhost:3001
FEATURE_FLAG_NEW_UI=true
```

**构建配置**
```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  },
  // 其他配置...
};
```

**脚本命名**
```json
// package.json
{
  "scripts": {
    "start": "webpack serve --mode development",
    "build": "webpack --mode production",
    "build:staging": "webpack --mode production --env staging",
    "test": "jest",
    "lint": "eslint src",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,scss}\""
  }
}
```

## 六、规范覆盖的范围

### 6.1 通用规范与特定规范

规范应同时包含通用规则和特定领域规则：

**通用规范**
- 变量命名约定
- 缩进和格式
- 注释规范
- Git 提交信息

**特定规范**
- React 组件结构
- CSS 模块命名
- API 调用模式
- 状态管理模式

> **📊 最佳实践**  
> 研究表明，最有效的团队规范由 70-80% 的通用规则和 20-30% 的项目特定规则组成，实现了标准化和灵活性的平衡。

### 6.2 不同项目类型的规范调整

不同类型的项目需要不同的规范侧重点：

| 项目类型 | 规范重点 | 特殊考虑 |
|--------|----------|---------|
| 企业应用 | 一致性、可维护性 | 大型团队协作、长期维护 |
| 开源库 | API 设计、兼容性 | 外部消费、向后兼容 |
| 移动 Web | 性能、响应式 | 触摸交互、网络条件 |
| 小型项目 | 启动速度、灵活性 | 避免过度规范 |

**企业级规范示例**
```javascript
/**
 * @module UserService
 * @description 处理用户相关的业务逻辑
 * @author Team Auth
 * @version 1.2.0
 */
export class UserService {
  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<User>} 创建的用户
   * @throws {ValidationError} 数据验证失败
   */
  async createUser(userData) {
    // 实现...
  }
}
```

**开源库规范示例**
```typescript
// 公共 API 使用 JSDoc 注释
/**
 * Format a date using the specified format string.
 * 
 * @param date - The date to format
 * @param format - The format string
 * @returns The formatted date string
 * 
 * @example
 * ```
 * formatDate(new Date(), 'YYYY-MM-DD')
 * // => '2025-12-25'
 * ```
 */
export function formatDate(date: Date, format: string): string {
  // 实现...
}

// 内部实现使用简洁注释
// 解析格式令牌为正则表达式片段
function tokenToRegex(token: string): string {
  // 实现...
}
```

## 学习建议

> **📚 进阶路径**
> 
> 1. **从通用规范开始**：先掌握通用的编码规范
> 2. **逐渐深入技术栈规范**：针对所用框架学习特定规范
> 3. **参考知名项目**：研究 Airbnb, Google 等的开源规范
> 4. **理解规范背后的原因**：了解为什么规则被制定
> 5. **实践与调整**：将规范应用到实际项目中并持续优化

> **⚠️ 常见误区**
> 
> - **照搬规范**：未经消化就套用其他项目的规范
> - **过度规范**：制定太多规则导致团队负担
> - **规则无解释**：未说明规则背后的原理和目的
> - **缺少工具支持**：规则无法通过自动化工具检查
> - **不考虑团队实际**：忽略团队技术栈和成熟度

## 参考资料

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) - 业界最受欢迎的 JavaScript 规范之一
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) - Google 的 JavaScript 编码规范
- [Microsoft TypeScript Coding Guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines) - TypeScript 项目的编码指南
- [CSS Guidelines by Harry Roberts](https://cssguidelin.es/) - CSS 编写的最佳实践
- [React Patterns](https://reactpatterns.com/) - React 开发模式与最佳实践

---

**下一章** → [第 3 章：规范执行策略](./03-enforcement-strategies.md)
