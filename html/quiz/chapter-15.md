# 第 15 章：表单验证 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | HTML5 验证

### 题目

HTML5 提供了哪些内置验证属性？

**A.** `required, pattern, min, max` | **B.** `validate, check, test` | **C.** `verify, confirm` | **D.** 以上都不对

<details><summary>查看答案</summary>

### ✅ 答案：A

### 解析

HTML5 内置验证属性：
- `required` - 必填
- `pattern` - 正则表达式
- `min/max` - 数值/日期范围
- `minlength/maxlength` - 字符长度
- `type` - 类型验证（email, url, tel等）

```html
<input type="email" required>
<input type="password" minlength="8" maxlength="20">
<input type="number" min="18" max="100">
<input type="tel" pattern="[0-9]{11}">
```

**来源：** MDN - HTML5 表单验证
</details>

---

## 第 2 题 🟢 | required 属性

### 题目

`required` 属性可以用于哪些表单元素？

**A.** 只有 `<input>` | **B.** `<input>`, `<select>`, `<textarea>` | **C.** 所有表单元素 | **D.** 只有文本输入框

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析

`required` 可用于：
```html
<input type="text" required>
<select required><option value="">请选择</option></select>
<textarea required></textarea>

<!-- ❌ 不能用于 button, fieldset, label 等 -->
```

**来源：** HTML5 规范
</details>

---

## 第 3 题 🟢 | pattern 属性

### 题目

`pattern` 属性使用什么语法？

**A.** SQL 语法 | **B.** 正则表达式 | **C.** 通配符 | **D.** CSS 选择器

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析

```html
<!-- 11位手机号 -->
<input type="tel" pattern="[0-9]{11}">

<!-- 6位数字验证码 -->
<input type="text" pattern="\d{6}">

<!-- 邮政编码 -->
<input type="text" pattern="[0-9]{6}">
```

**来源：** MDN - pattern 属性
</details>

---

## 第 4 题 🟡 | Validity State

### 题目

`validity` 对象包含哪些验证状态？**（多选）**

**A.** `valueMissing` | **B.** `typeMismatch` | **C.** `patternMismatch` | **D.** `tooShort/tooLong`

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析

```javascript
const input = document.getElementById('email');

input.validity.valueMissing    // required 为空
input.validity.typeMismatch     // type 不匹配
input.validity.patternMismatch  // pattern 不匹配
input.validity.tooShort         // < minlength
input.validity.tooLong          // > maxlength
input.validity.rangeUnderflow   // < min
input.validity.rangeOverflow    // > max
input.validity.stepMismatch     // 不符合 step
input.validity.valid            // 全部验证通过
```

**来源：** Constraint Validation API
</details>

---

## 第 5 题 🟡 | 自定义错误

### 题目

如何设置自定义验证错误消息？

**A.** `setError()` | **B.** `setCustomValidity()` | **C.** `setMessage()` | **D.** `showError()`

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析

```javascript
const password = document.getElementById('password');

password.addEventListener('input', () => {
  if (password.value.length < 8) {
    password.setCustomValidity('密码至少8位');
  } else {
    password.setCustomValidity(''); // 清除错误
  }
});
```

**来源：** MDN - setCustomValidity()
</details>

---

## 第 6 题 🟡 | novalidate

### 题目

`novalidate` 属性的作用是什么？

**A.** 禁用所有验证 | **B.** 只禁用HTML5验证 | **C.** 禁用单个输入验证 | **D.** 启用验证

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析

```html
<!-- 禁用整个表单的HTML5验证 -->
<form novalidate>
  <input type="email" required> <!-- 不会自动验证 -->
</form>

<!-- 单个按钮禁用验证 -->
<button type="submit" formnovalidate>跳过验证提交</button>
```

**来源：** HTML5 规范
</details>

---

## 第 7 题 🟡 | 实时验证

### 题目

实现实时验证的最佳事件是？**（多选）**

**A.** `input` | **B.** `change` | **C.** `blur` | **D.** `focus`

<details><summary>查看答案</summary>

### ✅ 答案：A, C

### 解析

```javascript
// input - 实时验证（输入时）
input.addEventListener('input', () => {
  if (input.validity.valid) {
    showSuccess();
  }
});

// blur - 失焦验证（离开时）
input.addEventListener('blur', () => {
  if (!input.validity.valid) {
    showError(input.validationMessage);
  }
});
```

**来源：** Web 开发最佳实践
</details>

---

## 第 8 题 🔴 | 复杂验证逻辑

### 题目

实现密码确认验证的最佳方式？**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案

```html
<form id="form">
  <input type="password" id="password" required minlength="8">
  <input type="password" id="confirm" required>
  <button type="submit">提交</button>
</form>

<script>
const password = document.getElementById('password');
const confirm = document.getElementById('confirm');

confirm.addEventListener('input', () => {
  if (confirm.value !== password.value) {
    confirm.setCustomValidity('两次密码不一致');
  } else {
    confirm.setCustomValidity('');
  }
});

password.addEventListener('input', () => {
  if (confirm.value) {
    confirm.dispatchEvent(new Event('input'));
  }
});
</script>
```

**来源：** 表单验证最佳实践
</details>

---

## 第 9 题 🔴 | 异步验证

### 题目

如何实现用户名唯一性验证？**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案

```html
<input type="text" id="username" required>
<span id="error"></span>

<script>
const username = document.getElementById('username');
const error = document.getElementById('error');
let timer;

username.addEventListener('input', () => {
  clearTimeout(timer);
  
  timer = setTimeout(async () => {
    const value = username.value;
    
    if (value.length < 3) return;
    
    try {
      const response = await fetch(`/api/check-username?username=${value}`);
      const data = await response.json();
      
      if (data.exists) {
        username.setCustomValidity('用户名已存在');
        error.textContent = '用户名已存在';
      } else {
        username.setCustomValidity('');
        error.textContent = '';
      }
    } catch (err) {
      console.error('验证失败', err);
    }
  }, 500); // 防抖 500ms
});
</script>
```

**来源：** 异步验证实践
</details>

---

## 第 10 题 🔴 | 完整验证系统

### 题目

设计一个完整的表单验证系统，包括HTML5验证、自定义验证、实时反馈和错误提示。

<details><summary>查看答案</summary>

### ✅ 答案

```html
<form id="form" novalidate>
  <div class="field">
    <label for="email">邮箱：</label>
    <input type="email" id="email" required>
    <span class="error" data-for="email"></span>
  </div>
  
  <div class="field">
    <label for="password">密码：</label>
    <input type="password" id="password" required minlength="8">
    <span class="error" data-for="password"></span>
  </div>
  
  <button type="submit">提交</button>
</form>

<script>
class FormValidator {
  constructor(formEl) {
    this.form = formEl;
    this.init();
  }
  
  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    this.form.querySelectorAll('input').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }
  
  validateField(input) {
    const error = this.form.querySelector(`[data-for="${input.id}"]`);
    
    if (!input.validity.valid) {
      this.showError(input, error);
      return false;
    }
    
    this.clearError(input);
    return true;
  }
  
  showError(input, errorEl) {
    let message = '';
    
    if (input.validity.valueMissing) {
      message = '此字段为必填项';
    } else if (input.validity.typeMismatch) {
      message = `请输入有效的${input.type}`;
    } else if (input.validity.tooShort) {
      message = `至少${input.minLength}个字符`;
    } else if (input.validity.patternMismatch) {
      message = input.title || '格式不正确';
    } else {
      message = input.validationMessage;
    }
    
    errorEl.textContent = message;
    input.classList.add('invalid');
  }
  
  clearError(input) {
    const error = this.form.querySelector(`[data-for="${input.id}"]`);
    error.textContent = '';
    input.classList.remove('invalid');
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    let isValid = true;
    
    this.form.querySelectorAll('input').forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    if (isValid) {
      console.log('表单验证通过');
      // 提交数据
    }
  }
}

new FormValidator(document.getElementById('form'));
</script>
```

**来源：** 表单验证框架设计
</details>

---

**📌 本章总结**
- HTML5验证：required, pattern, min/max, type
- Validity API：检查验证状态
- 自定义验证：setCustomValidity()
- 实时验证：input/blur 事件
- 异步验证：防抖 + fetch
- novalidate：禁用原生验证

**上一章** ← [第 14 章：表单高级控件](./chapter-14.md)  
**下一章** → [第 16 章：表单样式](./chapter-16.md)
