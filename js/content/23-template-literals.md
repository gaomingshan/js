# 模板字符串标签函数

## 概述

标签函数（Tagged Template）是模板字符串的高级用法，允许自定义模板字符串的处理逻辑。

理解标签函数的关键在于：

- **参数分离**：字符串部分和插值部分分别传递
- **自定义处理**：可以完全控制输出格式
- **实用场景**：HTML 转义、国际化、SQL 查询、CSS-in-JS

---

## 一、基础模板字符串

### 1.1 基本用法

```js
// 普通字符串
const name = 'Alice';
const str1 = 'Hello, ' + name + '!';

// 模板字符串
const str2 = `Hello, ${name}!`;

// 多行
const multiline = `
  Line 1
  Line 2
  Line 3
`;

// 表达式
const a = 5;
const b = 10;
const str3 = `Sum: ${a + b}`;  // "Sum: 15"
```

---

## 二、标签函数

### 2.1 基本概念

```js
// 标签函数：处理模板字符串的函数
function tag(strings, ...values) {
  console.log(strings);  // 字符串数组
  console.log(values);   // 值数组
}

const name = 'Alice';
const age = 25;

tag`Hello, ${name}! You are ${age} years old.`;

// 输出：
// strings: ['Hello, ', '! You are ', ' years old.']
// values: ['Alice', 25]
```

### 2.2 参数说明

```js
function myTag(strings, ...values) {
  // strings: 模板字符串的字符串部分
  // - 总是比 values 多一个元素
  // - strings[0] 在第一个插值前
  // - strings[strings.length - 1] 在最后一个插值后

  // values: 所有插值表达式的值

  // strings.raw: 原始字符串（不处理转义）
}

myTag`a${1}b${2}c`;
// strings: ['a', 'b', 'c']
// values: [1, 2]
```

---

## 三、实际应用

### 3.1 HTML 转义

```js
// 自动转义 HTML 特殊字符
function html(strings, ...values) {
  const escape = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return strings.reduce((result, str, i) => {
    const value = values[i - 1];
    return result + escape(value) + str;
  });
}

const userInput = '<script>alert("XSS")</script>';
const safe = html`<div>${userInput}</div>`;
// <div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>
```

### 3.2 SQL 查询（防注入）

```js
// 防止 SQL 注入
function sql(strings, ...values) {
  const escape = (value) => {
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  };

  let query = strings[0];
  for (let i = 0; i < values.length; i++) {
    query += escape(values[i]) + strings[i + 1];
  }

  return query;
}

const username = "admin";
const query = sql`SELECT * FROM users WHERE name = ${username}`;
// SELECT * FROM users WHERE name = 'admin'
```

### 3.3 国际化（i18n）

```js
// 多语言支持
const translations = {
  en: {
    greeting: (name) => `Hello, ${name}!`,
    farewell: (name) => `Goodbye, ${name}!`
  },
  zh: {
    greeting: (name) => `你好，${name}！`,
    farewell: (name) => `再见，${name}！`
  }
};

function i18n(lang) {
  return function(strings, ...values) {
    const key = strings.join('$');
    const template = translations[lang][key];

    if (!template) {
      return strings.reduce((result, str, i) => {
        return result + str + (values[i] || '');
      }, '');
    }

    return template(...values);
  };
}

const t = i18n('zh');
const message = t`greeting${'Alice'}`;
// "你好，Alice！"
```

### 3.4 样式化输出

```js
// 控制台样式输出
function styled(strings, ...values) {
  const styles = [];
  const text = strings.reduce((result, str, i) => {
    if (values[i] && values[i].style) {
      styles.push(values[i].style);
      return result + str + '%c' + values[i].text + '%c';
    }
    return result + str + (values[i] || '');
  }, '');

  const allStyles = styles.flatMap(s => [s, '']);
  console.log(text, ...allStyles);
}

styled`Hello, ${{
  text: 'Alice',
  style: 'color: red; font-weight: bold'
}}!`;
// 在控制台输出彩色文本
```

---

## 四、高级用法

### 4.1 Raw 字符串

```js
// 访问原始字符串
function tag(strings, ...values) {
  console.log(strings[0]);      // 处理过的字符串
  console.log(strings.raw[0]);  // 原始字符串
}

tag`Line 1\nLine 2`;
// strings[0]: "Line 1
//              Line 2"
// strings.raw[0]: "Line 1\\nLine 2"

// String.raw：内置标签函数
const path = String.raw`C:\Users\Alice\Documents`;
// "C:\Users\Alice\Documents"
```

### 4.2 嵌套标签

```js
// 标签函数可以嵌套
function upper(strings, ...values) {
  return String.raw(strings, ...values).toUpperCase();
}

function repeat(n) {
  return function(strings, ...values) {
    const text = String.raw(strings, ...values);
    return text.repeat(n);
  };
}

const text = upper`hello ${'world'}`;
// "HELLO WORLD"

const repeated = repeat(3)`abc`;
// "abcabcabc"
```

---

## 五、实用库示例

### 5.1 CSS-in-JS

```js
// 类似 styled-components
function css(strings, ...values) {
  const styles = strings.reduce((result, str, i) => {
    return result + str + (values[i] || '');
  }, '');

  return {
    toString() { return styles; },
    styles
  };
}

const color = 'blue';
const buttonStyles = css`
  background-color: ${color};
  padding: 10px 20px;
  border-radius: 4px;
`;

console.log(buttonStyles.styles);
```

### 5.2 GraphQL

```js
// GraphQL 查询
function gql(strings, ...values) {
  return {
    kind: 'Document',
    query: String.raw(strings, ...values).trim()
  };
}

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
    }
  }
`;

console.log(GET_USER.query);
```

---

## 六、最佳实践

1. **安全性**：始终转义用户输入。
2. **性能**：避免在循环中使用复杂标签函数。
3. **类型检查**：验证插值类型。
4. **错误处理**：提供清晰的错误信息。
5. **文档化**：标签函数要有清晰文档。

---

## 参考资料

- [ECMAScript - Template Literals](https://tc39.es/ecma262/#sec-template-literals)
- [MDN - 模板字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals)
