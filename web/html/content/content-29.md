# HTML 模板系统

## 核心概念

模板系统将 HTML 结构与数据分离，实现动态内容生成。

## 模板引擎的设计原理

### EJS

```javascript
// template.ejs
<h1><%= title %></h1>
<ul>
  <% users.forEach(user => { %>
    <li><%= user.name %></li>
  <% }) %>
</ul>

// 渲染
const ejs = require('ejs');
const html = ejs.render(template, {
  title: '用户列表',
  users: [{ name: 'Alice' }, { name: 'Bob' }]
});
```

### Pug (Jade)

```pug
h1= title
ul
  each user in users
    li= user.name
```

### Handlebars

```handlebars
<h1>{{title}}</h1>
<ul>
  {{#each users}}
    <li>{{name}}</li>
  {{/each}}
</ul>
```

## JSX：HTML 的 JavaScript 化

```jsx
function UserList({ users }) {
  return (
    <div>
      <h1>用户列表</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**特点**：
- JavaScript 表达式
- 组件化
- 类型检查

## Vue Template

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: '用户列表',
      users: []
    }
  }
}
</script>
```

## 模板编译

```javascript
// 模板字符串
const template = '<h1>{{title}}</h1>';

// 编译为函数
function render(data) {
  return `<h1>${data.title}</h1>`;
}

// 执行
const html = render({ title: 'Hello' });
```

**后端类比**：模板引擎 ≈ ORM 的查询构建器。

## 参考资源

- [EJS](https://ejs.co/)
- [Pug](https://pugjs.org/)
- [Handlebars](https://handlebarsjs.com/)
