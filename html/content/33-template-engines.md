# 第 33 章：HTML 模板引擎

## 概述

模板引擎将数据和模板结合生成 HTML，提高开发效率。

## 一、模板字面量

```javascript
const user = {name: '张三', age: 25};

const html = `
  <div class="user">
    <h2>${user.name}</h2>
    <p>年龄：${user.age}</p>
  </div>
`;

document.body.innerHTML = html;
```

## 二、常见模板引擎

### 2.1 Handlebars

```html
<script id="template" type="text/x-handlebars-template">
  <div class="user">
    <h2>{{name}}</h2>
    <p>年龄：{{age}}</p>
  </div>
</script>

<script>
const source = document.getElementById('template').innerHTML;
const template = Handlebars.compile(source);
const html = template({name: '张三', age: 25});
document.body.innerHTML = html;
</script>
```

### 2.2 Mustache

```javascript
const template = `
  <div class="user">
    <h2>{{name}}</h2>
    <p>年龄：{{age}}</p>
  </div>
`;

const html = Mustache.render(template, {name: '张三', age: 25});
```

### 2.3 EJS

```javascript
const template = `
  <% users.forEach(function(user){ %>
    <div>
      <h2><%= user.name %></h2>
    </div>
  <% }); %>
`;

const html = ejs.render(template, {
  users: [{name: '张三'}, {name: '李四'}]
});
```

## 三、现代框架

- **React**: JSX
- **Vue**: Template Syntax
- **Angular**: Template Syntax

## 参考资料

- [Handlebars](https://handlebarsjs.com/)
- [Mustache](https://mustache.github.io/)

---

**上一章** ← [第 32 章：WebAssembly](./32-webassembly.md)  
**下一章** → [第 34 章：构建工具](./34-build-tools.md)
