# 第 33 章：HTML 模板引擎 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 模板引擎定义
### 题目
模板引擎的作用？

**A.** 样式美化 | **B.** 数据与视图分离 | **C.** 性能优化 | **D.** 数据验证

<details><summary>查看答案</summary>
### ✅ 答案：B
**来源：** 模板引擎概念
</details>

---

## 第 2 题 🟢 | 常见模板引擎
### 题目
常见的 HTML 模板引擎？**（多选）**

**A.** Handlebars | **B.** EJS | **C.** Pug | **D.** Mustache

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
**来源：** 模板引擎对比
</details>

---

## 第 3 题 🟢 | 模板语法
### 题目
Mustache 的基本语法？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!-- 变量 -->
<h1>{{title}}</h1>

<!-- 循环 -->
{{#items}}
  <li>{{name}}</li>
{{/items}}

<!-- 条件 -->
{{#isActive}}
  <p>激活</p>
{{/isActive}}
```
**来源：** Mustache
</details>

---

## 第 4 题 🟡 | Handlebars
### 题目
Handlebars 的使用。

<details><summary>查看答案</summary>
### ✅ 答案
```html
<script id="template" type="text/x-handlebars-template">
  <div class="entry">
    <h1>{{title}}</h1>
    <p>{{body}}</p>
    
    {{#if author}}
      <p>作者：{{author}}</p>
    {{/if}}
    
    <ul>
      {{#each comments}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
</script>

<script>
const source = document.getElementById('template').innerHTML;
const template = Handlebars.compile(source);

const data = {
  title: '标题',
  body: '内容',
  author: '张三',
  comments: ['评论1', '评论2']
};

document.getElementById('output').innerHTML = template(data);
</script>
```
**来源：** Handlebars
</details>

---

## 第 5 题 🟡 | EJS
### 题目
EJS 的语法特点？

<details><summary>查看答案</summary>
### ✅ 答案
```ejs
<% // JavaScript 代码 %>
<%= value %> <!-- 输出转义 -->
<%- htmlValue %> <!-- 输出原始 HTML -->

<ul>
  <% for(let i = 0; i < items.length; i++) { %>
    <li><%= items[i] %></li>
  <% } %>
</ul>

<% if (user) { %>
  <p>欢迎，<%= user.name %></p>
<% } else { %>
  <p>请登录</p>
<% } %>
```
**来源：** EJS
</details>

---

## 第 6 题 🟡 | Pug
### 题目
Pug (Jade) 的缩进语法。

<details><summary>查看答案</summary>
### ✅ 答案
```pug
doctype html
html(lang="zh-CN")
  head
    title= pageTitle
  body
    h1= title
    #container.col
      if user
        p 欢迎，#{user.name}
      else
        p 请登录
      
      ul
        each item in items
          li= item
```

编译为：
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head><title>页面标题</title></head>
  <body>
    <h1>标题</h1>
    <div id="container" class="col">
      <p>欢迎，张三</p>
      <ul>
        <li>项目1</li>
        <li>项目2</li>
      </ul>
    </div>
  </body>
</html>
```
**来源：** Pug
</details>

---

## 第 7 题 🟡 | 模板继承
### 题目
实现模板继承。

<details><summary>查看答案</summary>
### ✅ 答案
```pug
// layout.pug
doctype html
html
  head
    title #{title}
    block styles
  body
    block header
      header 默认头部
    
    block content
    
    block footer
      footer 默认页脚

// page.pug
extends layout

block styles
  link(rel="stylesheet", href="page.css")

block header
  header 自定义头部

block content
  h1 页面内容
  p 这是内容
```
**来源：** 模板继承
</details>

---

## 第 8 题 🔴 | 自定义模板引擎
### 题目
实现简单的模板引擎。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
class SimpleTemplate {
  constructor(template) {
    this.template = template;
  }
  
  render(data) {
    let html = this.template;
    
    // 替换变量 {{name}}
    html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : '';
    });
    
    // 循环 {{#each items}}...{{/each}}
    html = html.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, 
      (match, key, content) => {
        const items = data[key] || [];
        return items.map(item => {
          return content.replace(/\{\{(\w+)\}\}/g, (m, k) => item[k] || '');
        }).join('');
      });
    
    // 条件 {{#if condition}}...{{/if}}
    html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, key, content) => {
        return data[key] ? content : '';
      });
    
    return html;
  }
}

// 使用
const template = new SimpleTemplate(`
  <h1>{{title}}</h1>
  {{#if author}}
    <p>作者：{{author}}</p>
  {{/if}}
  <ul>
    {{#each items}}
      <li>{{name}}: {{value}}</li>
    {{/each}}
  </ul>
`);

const html = template.render({
  title: '我的文章',
  author: '张三',
  items: [
    {name: '项目1', value: '100'},
    {name: '项目2', value: '200'}
  ]
});

console.log(html);
```
**来源：** 模板引擎原理
</details>

---

## 第 9 题 🔴 | 性能优化
### 题目
模板引擎的性能优化？

<details><summary>查看答案</summary>
### ✅ 答案

**1. 预编译**
```javascript
// ❌ 每次编译
function render(data) {
  const template = Handlebars.compile(source);
  return template(data);
}

// ✅ 预编译
const template = Handlebars.compile(source);
function render(data) {
  return template(data);
}
```

**2. 缓存**
```javascript
const templateCache = new Map();

function getTemplate(name) {
  if (!templateCache.has(name)) {
    const source = document.getElementById(name).innerHTML;
    templateCache.set(name, Handlebars.compile(source));
  }
  return templateCache.get(name);
}
```

**3. 虚拟 DOM（现代框架）**
```javascript
// React、Vue 等使用虚拟 DOM 减少真实 DOM 操作
```

**来源：** 模板性能优化
</details>

---

## 第 10 题 🔴 | 安全性
### 题目
模板引擎的安全问题？

<details><summary>查看答案</summary>
### ✅ 答案

**XSS 防护：**
```javascript
// ❌ 危险：不转义
<%- userInput %>

// ✅ 安全：转义
<%= userInput %>

// Handlebars
{{userInput}}  <!-- 自动转义 -->
{{{userInput}}} <!-- 不转义（危险） -->
```

**自定义转义函数：**
```javascript
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 使用
const safe = escapeHtml(userInput);
```

**内容安全策略：**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

**来源：** 模板安全
</details>

---

**📌 本章总结**
- 模板引擎：数据与视图分离
- 常见引擎：Handlebars, EJS, Pug, Mustache
- 基本语法：变量、循环、条件
- 模板继承：代码复用
- 性能优化：预编译、缓存
- 安全：XSS 防护、转义输出

**上一章** ← [第 32 章：WebAssembly](./chapter-32.md)  
**下一章** → [第 34 章：构建工具](./chapter-34.md)
