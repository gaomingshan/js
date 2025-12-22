# 第 21 章：支持的语言与解析

## 概述

Prettier 支持多种语言和文件格式，每种语言都有对应的解析器。理解解析器的工作方式和限制，有助于正确配置 Prettier 并处理特殊情况。

## 一、解析器概览

### 1.1 内置解析器

| 解析器 | 支持的语言 | 文件扩展名 |
|--------|-----------|-----------|
| `babel` | JavaScript | `.js`, `.jsx`, `.mjs`, `.cjs` |
| `babel-ts` | TypeScript (Babel) | `.ts`, `.tsx` |
| `typescript` | TypeScript | `.ts`, `.tsx` |
| `flow` | Flow | `.js`, `.jsx` |
| `json` | JSON | `.json` |
| `json5` | JSON5 | `.json5` |
| `jsonc` | JSON with Comments | `.jsonc` |
| `css` | CSS | `.css` |
| `scss` | SCSS | `.scss` |
| `less` | Less | `.less` |
| `html` | HTML | `.html`, `.htm` |
| `vue` | Vue | `.vue` |
| `angular` | Angular 模板 | `.component.html` |
| `markdown` | Markdown | `.md`, `.markdown` |
| `mdx` | MDX | `.mdx` |
| `yaml` | YAML | `.yaml`, `.yml` |
| `graphql` | GraphQL | `.graphql`, `.gql` |

### 1.2 自动解析器选择

Prettier 根据文件扩展名自动选择解析器：

```bash
# 自动使用 typescript 解析器
npx prettier --write src/index.ts

# 自动使用 css 解析器
npx prettier --write styles/main.css
```

### 1.3 手动指定解析器

```bash
# 命令行指定
npx prettier --parser typescript src/index.js

# 配置文件指定
```

```json
{
  "overrides": [
    {
      "files": "*.js",
      "options": {
        "parser": "babel"
      }
    }
  ]
}
```

## 二、JavaScript/TypeScript 解析

### 2.1 babel vs typescript 解析器

**babel 解析器：**
- 使用 `@babel/parser`
- 支持最新 ECMAScript 提案
- 更宽松，支持部分非标准语法
- 推荐用于纯 JavaScript

**typescript 解析器：**
- 使用 TypeScript 编译器
- 严格遵循 TypeScript 语法
- 更准确的类型语法处理
- 推荐用于 TypeScript 项目

```json
{
  "overrides": [
    {
      "files": "*.js",
      "options": { "parser": "babel" }
    },
    {
      "files": ["*.ts", "*.tsx"],
      "options": { "parser": "typescript" }
    }
  ]
}
```

### 2.2 JSX 支持

```javascript
// 自动识别 JSX 语法
const element = <div className="container">{content}</div>;

// 配置 JSX 相关选项
{
  "jsxSingleQuote": false,
  "bracketSameLine": false
}
```

### 2.3 Flow 支持

```javascript
// @flow
type Props = {
  name: string,
  age: number
};

function Greeting(props: Props): React$Element<'div'> {
  return <div>Hello, {props.name}</div>;
}
```

```json
{
  "overrides": [
    {
      "files": "*.js",
      "options": { "parser": "flow" }
    }
  ]
}
```

## 三、样式语言解析

### 3.1 CSS

```css
/* 格式化前 */
.container{display:flex;flex-direction:column;align-items:center;}

/* 格式化后 */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

### 3.2 SCSS

```scss
// 支持 SCSS 特有语法
$primary-color: #3498db;

.button {
  background: $primary-color;
  
  &:hover {
    background: darken($primary-color, 10%);
  }
  
  @include responsive(mobile) {
    width: 100%;
  }
}
```

### 3.3 Less

```less
@primary-color: #3498db;

.button {
  background: @primary-color;
  
  &:hover {
    background: darken(@primary-color, 10%);
  }
}
```

### 3.4 CSS-in-JS

Prettier 可以格式化模板字符串中的 CSS：

```javascript
// styled-components
const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
`;

// emotion
const styles = css`
  color: red;
  font-size: 16px;
`;
```

## 四、HTML 类解析

### 4.1 HTML

```html
<!-- 格式化前 -->
<div class="container"><p>Hello</p><span>World</span></div>

<!-- 格式化后 -->
<div class="container">
  <p>Hello</p>
  <span>World</span>
</div>
```

**HTML 相关配置：**
```json
{
  "htmlWhitespaceSensitivity": "css",
  "singleAttributePerLine": false,
  "bracketSameLine": false
}
```

### 4.2 Vue 单文件组件

```vue
<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      title: 'Hello Vue'
    };
  },
  methods: {
    handleClick() {
      console.log('clicked');
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
```

**Vue 配置：**
```json
{
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": true
}
```

### 4.3 Angular 模板

```html
<!-- Angular 模板 -->
<div *ngIf="isVisible" [class.active]="isActive">
  <app-header [title]="pageTitle"></app-header>
  <button (click)="handleClick($event)">Submit</button>
</div>
```

## 五、数据格式解析

### 5.1 JSON

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

### 5.2 JSON5

支持注释和尾逗号：

```json5
{
  // 项目名称
  name: 'my-project',
  version: '1.0.0',
  dependencies: {
    lodash: '^4.17.21',  // 尾逗号
  },
}
```

### 5.3 YAML

```yaml
name: my-project
version: 1.0.0

dependencies:
  lodash: ^4.17.21
  axios: ^1.0.0

scripts:
  - build
  - test
  - deploy
```

### 5.4 GraphQL

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      title
      content
    }
  }
}

mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}
```

## 六、Markdown 解析

### 6.1 基本格式化

```markdown
# Title

This is a paragraph with **bold** and _italic_ text.

- Item 1
- Item 2
- Item 3

| Column 1 | Column 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
```

### 6.2 proseWrap 配置

```json
{
  "proseWrap": "always"  // 自动换行
  // "proseWrap": "never"   // 不换行
  // "proseWrap": "preserve" // 保持原样
}
```

### 6.3 MDX 支持

```mdx
import { Button } from './components';

# Hello MDX

<Button onClick={() => alert('clicked')}>
  Click me
</Button>

This is regular markdown with **bold** text.
```

## 七、嵌入语言处理

### 7.1 模板字符串中的代码

```javascript
// CSS in JS
const styles = css`
  .container {
    display: flex;
    padding: 16px;
  }
`;

// GraphQL
const query = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
    }
  }
`;

// HTML
const template = html`
  <div class="container">
    <h1>Title</h1>
  </div>
`;
```

### 7.2 配置嵌入语言格式化

```json
{
  "embeddedLanguageFormatting": "auto"  // 格式化嵌入代码
  // "embeddedLanguageFormatting": "off" // 不格式化
}
```

### 7.3 Markdown 中的代码块

````markdown
```javascript
const foo = 'bar';
function baz() {
  return foo;
}
```

```css
.container {
  display: flex;
}
```
````

## 八、插件扩展解析器

### 8.1 社区插件

```bash
# PHP
npm install @prettier/plugin-php

# Ruby
npm install @prettier/plugin-ruby

# XML
npm install @prettier/plugin-xml

# Java
npm install prettier-plugin-java

# Svelte
npm install prettier-plugin-svelte

# Tailwind CSS（类名排序）
npm install prettier-plugin-tailwindcss
```

### 8.2 使用插件

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindConfig": "./tailwind.config.js"
}
```

```javascript
// prettier.config.js
module.exports = {
  plugins: [
    require('prettier-plugin-tailwindcss'),
    require('@prettier/plugin-xml')
  ]
};
```

### 8.3 Tailwind CSS 插件

自动排序 Tailwind 类名：

```jsx
// 格式化前
<div className="pt-4 text-center flex mb-2 items-center">

// 格式化后（按 Tailwind 推荐顺序）
<div className="mb-2 flex items-center pt-4 text-center">
```

## 九、解析器限制

### 9.1 无法格式化的情况

- **语法错误**：代码必须语法正确才能格式化
- **非标准语法**：某些实验性语法可能不支持
- **复杂模板字符串**：某些动态内容无法格式化

### 9.2 处理语法错误

```bash
# 检查文件是否可以格式化
npx prettier --check src/

# 跳过有错误的文件
npx prettier --write --ignore-unknown src/
```

### 9.3 禁用部分格式化

```javascript
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];

/* prettier-ignore */
const uglyButIntentional = {a:1,b:2,c:3};
```

```html
<!-- prettier-ignore -->
<div>保持    原样    格式</div>

<!-- prettier-ignore-attribute -->
<div data-custom="1,2,3,4,5">content</div>

<!-- prettier-ignore-attribute (src) -->
<img src="data:image/png;base64,..." />
```

```css
/* prettier-ignore */
.special { color:red;font-size:12px; }
```

```markdown
<!-- prettier-ignore -->
| 不要 | 格式化 | 这个 | 表格 |
```

## 十、最佳实践

### 10.1 文件类型覆盖

```json
{
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "tabWidth": 2
      }
    },
    {
      "files": ["*.yaml", "*.yml"],
      "options": {
        "tabWidth": 2,
        "singleQuote": false
      }
    },
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always",
        "printWidth": 80
      }
    }
  ]
}
```

### 10.2 忽略特定文件

```gitignore
# .prettierignore
# 构建产物
dist/
build/

# 依赖锁文件
package-lock.json
yarn.lock
pnpm-lock.yaml

# 压缩文件
*.min.js
*.min.css

# 第三方代码
vendor/
```

### 10.3 解析器选择建议

| 场景 | 推荐解析器 |
|------|-----------|
| 纯 JavaScript | `babel` |
| TypeScript 项目 | `typescript` |
| Flow 项目 | `flow` |
| Vue 2/3 | `vue` |
| Angular 模板 | `angular` |
| React JSX | `babel` 或 `typescript` |

## 参考资料

- [Prettier Parsers](https://prettier.io/docs/en/options.html#parser)
- [Prettier Plugins](https://prettier.io/docs/en/plugins.html)
- [Ignoring Code](https://prettier.io/docs/en/ignore.html)
