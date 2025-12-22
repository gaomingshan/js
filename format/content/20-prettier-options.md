# 第 20 章：Prettier 配置选项详解

## 概述

Prettier 以"固执己见"著称，配置选项极少。这种设计减少了团队争议，但理解每个选项的作用仍然重要。本章详细解析所有配置选项及其适用场景。

## 一、配置文件

### 1.1 支持的配置文件格式

按优先级排序：

```
1. package.json 中的 "prettier" 字段
2. .prettierrc（JSON 或 YAML）
3. .prettierrc.json
4. .prettierrc.yaml / .prettierrc.yml
5. .prettierrc.js / .prettierrc.cjs
6. .prettierrc.mjs
7. prettier.config.js / prettier.config.cjs / prettier.config.mjs
8. .prettierrc.toml
```

### 1.2 配置文件示例

```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

```javascript
// prettier.config.js
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5'
};
```

```yaml
# .prettierrc.yaml
semi: true
singleQuote: true
tabWidth: 2
trailingComma: es5
```

## 二、核心格式选项

### 2.1 printWidth（行宽）

```javascript
// 默认值：80
printWidth: 80
```

**说明：** 指定每行代码的最大字符数，Prettier 会尽量将代码控制在此宽度内。

```javascript
// printWidth: 80（默认）
const result = someFunction(argument1, argument2, argument3);

// printWidth: 40（会换行）
const result = someFunction(
  argument1,
  argument2,
  argument3
);
```

> **💡 提示**  
> `printWidth` 不是硬限制，某些结构无法换行时会超出。推荐值：80-120。

### 2.2 tabWidth（缩进宽度）

```javascript
// 默认值：2
tabWidth: 2
```

**说明：** 指定每个缩进级别的空格数。

```javascript
// tabWidth: 2
function foo() {
  if (true) {
    return 'bar';
  }
}

// tabWidth: 4
function foo() {
    if (true) {
        return 'bar';
    }
}
```

### 2.3 useTabs（使用制表符）

```javascript
// 默认值：false
useTabs: false
```

**说明：** 使用制表符而非空格进行缩进。

```javascript
// useTabs: false（默认）
function foo() {
  return 'bar';  // 空格缩进
}

// useTabs: true
function foo() {
	return 'bar';  // Tab缩进
}
```

### 2.4 semi（分号）

```javascript
// 默认值：true
semi: true
```

**说明：** 在语句末尾添加分号。

```javascript
// semi: true（默认）
const foo = 'bar';
function baz() {
  return 'qux';
}

// semi: false
const foo = 'bar'
function baz() {
  return 'qux'
}
```

> **⚠️ 注意**  
> 无分号风格下，Prettier 会在必要处（如行首是 `[` 或 `(`）自动添加分号防止语法错误。

### 2.5 singleQuote（单引号）

```javascript
// 默认值：false
singleQuote: false
```

**说明：** 使用单引号而非双引号（JSX 中始终使用双引号）。

```javascript
// singleQuote: false（默认）
const greeting = "Hello, World!";

// singleQuote: true
const greeting = 'Hello, World!';
```

### 2.6 jsxSingleQuote（JSX 引号）

```javascript
// 默认值：false
jsxSingleQuote: false
```

**说明：** 在 JSX 中使用单引号而非双引号。

```jsx
// jsxSingleQuote: false（默认）
<div className="container" />

// jsxSingleQuote: true
<div className='container' />
```

### 2.7 quoteProps（对象属性引号）

```javascript
// 默认值："as-needed"
quoteProps: "as-needed"
```

**可选值：**
- `"as-needed"`：仅在需要时添加引号
- `"consistent"`：如果有一个属性需要引号，则全部添加
- `"preserve"`：保持输入的引号风格

```javascript
// quoteProps: "as-needed"（默认）
const obj = {
  foo: 'bar',
  'foo-bar': 'baz'
};

// quoteProps: "consistent"
const obj = {
  'foo': 'bar',
  'foo-bar': 'baz'
};
```

## 三、尾随逗号选项

### 3.1 trailingComma（尾逗号）

```javascript
// 默认值："all"（Prettier 3.0+）
trailingComma: "all"
```

**可选值：**
- `"all"`：尽可能添加尾逗号（包括函数参数）
- `"es5"`：在 ES5 有效的地方添加（对象、数组）
- `"none"`：不添加尾逗号

```javascript
// trailingComma: "all"
const arr = [
  1,
  2,
  3,  // 尾逗号
];

function foo(
  a,
  b,
  c,  // 函数参数也有尾逗号
) {}

// trailingComma: "es5"
const arr = [
  1,
  2,
  3,  // 有尾逗号
];

function foo(
  a,
  b,
  c  // 函数参数无尾逗号
) {}

// trailingComma: "none"
const arr = [
  1,
  2,
  3  // 无尾逗号
];
```

> **💡 建议**  
> 推荐使用 `"all"` 或 `"es5"`，尾逗号便于 git diff 更清晰。

## 四、括号与空格选项

### 4.1 bracketSpacing（对象括号空格）

```javascript
// 默认值：true
bracketSpacing: true
```

**说明：** 在对象字面量的括号之间添加空格。

```javascript
// bracketSpacing: true（默认）
const obj = { foo: 'bar' };

// bracketSpacing: false
const obj = {foo: 'bar'};
```

### 4.2 bracketSameLine（JSX 括号位置）

```javascript
// 默认值：false
bracketSameLine: false
```

**说明：** 将多行 JSX 元素的 `>` 放在最后一行末尾。

```jsx
// bracketSameLine: false（默认）
<button
  className="btn"
  onClick={handleClick}
>
  Click
</button>

// bracketSameLine: true
<button
  className="btn"
  onClick={handleClick}>
  Click
</button>
```

### 4.3 arrowParens（箭头函数括号）

```javascript
// 默认值："always"
arrowParens: "always"
```

**可选值：**
- `"always"`：始终添加括号
- `"avoid"`：单参数时省略括号

```javascript
// arrowParens: "always"（默认）
const fn = (x) => x * 2;
const fn2 = (x, y) => x + y;

// arrowParens: "avoid"
const fn = x => x * 2;
const fn2 = (x, y) => x + y;  // 多参数仍需括号
```

## 五、特殊语法选项

### 5.1 proseWrap（Markdown 换行）

```javascript
// 默认值："preserve"
proseWrap: "preserve"
```

**可选值：**
- `"always"`：超出 printWidth 时换行
- `"never"`：不换行
- `"preserve"`：保持原样

### 5.2 htmlWhitespaceSensitivity（HTML 空白敏感度）

```javascript
// 默认值："css"
htmlWhitespaceSensitivity: "css"
```

**可选值：**
- `"css"`：根据 CSS `display` 属性决定
- `"strict"`：所有标签的空白都敏感
- `"ignore"`：所有标签的空白都不敏感

```html
<!-- htmlWhitespaceSensitivity: "css"（默认） -->
<span>inline</span>
<div>
  block
</div>

<!-- htmlWhitespaceSensitivity: "ignore" -->
<span>
  inline
</span>
<div>
  block
</div>
```

### 5.3 vueIndentScriptAndStyle（Vue 缩进）

```javascript
// 默认值：false
vueIndentScriptAndStyle: false
```

**说明：** 是否缩进 Vue 文件中的 `<script>` 和 `<style>` 标签内容。

```vue
<!-- vueIndentScriptAndStyle: false（默认） -->
<script>
export default {
  name: 'App'
}
</script>

<!-- vueIndentScriptAndStyle: true -->
<script>
  export default {
    name: 'App'
  }
</script>
```

### 5.4 singleAttributePerLine（单属性换行）

```javascript
// 默认值：false
singleAttributePerLine: false
```

**说明：** HTML/JSX 中每个属性单独一行。

```jsx
// singleAttributePerLine: false（默认）
<div className="container" id="main" data-testid="app">

// singleAttributePerLine: true
<div
  className="container"
  id="main"
  data-testid="app"
>
```

## 六、其他选项

### 6.1 endOfLine（行尾）

```javascript
// 默认值："lf"
endOfLine: "lf"
```

**可选值：**
- `"lf"`：Unix 风格 (`\n`)
- `"crlf"`：Windows 风格 (`\r\n`)
- `"cr"`：经典 Mac 风格 (`\r`)
- `"auto"`：保持现有风格

> **💡 建议**  
> 跨平台项目使用 `"lf"`，配合 `.gitattributes` 确保一致性。

### 6.2 embeddedLanguageFormatting（嵌入语言格式化）

```javascript
// 默认值："auto"
embeddedLanguageFormatting: "auto"
```

**可选值：**
- `"auto"`：格式化嵌入代码（如模板字符串中的 CSS）
- `"off"`：不格式化嵌入代码

## 七、覆盖配置

### 7.1 overrides 语法

针对特定文件使用不同配置：

```json
{
  "semi": true,
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always"
      }
    },
    {
      "files": ["*.json", "*.jsonc"],
      "options": {
        "tabWidth": 4
      }
    },
    {
      "files": "legacy/**/*.js",
      "options": {
        "tabWidth": 4,
        "semi": false
      }
    }
  ]
}
```

### 7.2 排除文件

```gitignore
# .prettierignore
dist/
build/
coverage/
*.min.js
*.min.css
package-lock.json
yarn.lock
pnpm-lock.yaml
```

## 八、推荐配置

### 8.1 通用推荐配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 8.2 React 项目配置

```json
{
  "semi": true,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSameLine": false,
  "arrowParens": "always"
}
```

### 8.3 Vue 项目配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": true
}
```

## 九、配置验证

### 9.1 查看生效配置

```bash
# 查看特定文件的配置
npx prettier --find-config-path src/index.js

# 查看解析后的配置
npx prettier --config-precedence file-override src/index.js
```

### 9.2 检查格式

```bash
# 检查文件是否符合格式（不修改）
npx prettier --check src/

# 列出需要格式化的文件
npx prettier --list-different src/
```

## 十、选项对比表

| 选项 | 默认值 | Airbnb 风格 | Standard 风格 |
|------|--------|-------------|---------------|
| semi | true | true | false |
| singleQuote | false | true | true |
| tabWidth | 2 | 2 | 2 |
| trailingComma | all | all | none |
| printWidth | 80 | 100 | 80 |
| arrowParens | always | always | avoid |

## 参考资料

- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Configuration File](https://prettier.io/docs/en/configuration.html)
- [Ignoring Code](https://prettier.io/docs/en/ignore.html)
