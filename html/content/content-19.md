# HTML5 表单增强

## 核心概念

HTML5 大幅增强了表单功能，新增多种输入类型和验证属性，减少对 JavaScript 的依赖。

## 新增输入类型

```html
<!-- 邮箱 -->
<input type="email" required>

<!-- URL -->
<input type="url" placeholder="https://">

<!-- 数字 -->
<input type="number" min="1" max="100" step="1">

<!-- 日期 -->
<input type="date" min="2024-01-01">

<!-- 颜色 -->
<input type="color" value="#ff0000">

<!-- 滑块 -->
<input type="range" min="0" max="100" value="50">

<!-- 搜索 -->
<input type="search" placeholder="搜索...">
```

## 表单属性

```html
<!-- placeholder -->
<input type="text" placeholder="请输入用户名">

<!-- required -->
<input type="email" required>

<!-- pattern -->
<input type="tel" pattern="[0-9]{11}" title="请输入11位手机号">

<!-- autofocus -->
<input type="text" autofocus>

<!-- autocomplete -->
<input type="email" autocomplete="email">
```

## 自定义验证

```javascript
const input = document.querySelector('input');

input.addEventListener('invalid', (e) => {
  e.preventDefault();
  if (input.validity.valueMissing) {
    input.setCustomValidity('此字段为必填项');
  }
});

input.addEventListener('input', () => {
  input.setCustomValidity('');
});
```

**后端类比**：类似于数据库约束和业务规则验证。

## 参考资源

- [MDN - HTML5 Forms](https://developer.mozilla.org/en-US/docs/Learn/Forms/HTML5_input_types)
