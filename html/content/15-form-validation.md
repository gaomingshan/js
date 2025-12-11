# 第 15 章：表单验证

## 概述

表单验证是确保数据质量的重要环节。HTML5 提供了内置验证，JavaScript 提供了更灵活的自定义验证。

## 一、HTML5 内置验证

### 1.1 required（必填）

```html
<input type="text" name="username" required>
<textarea name="comment" required></textarea>
<select name="city" required>
  <option value="">请选择</option>
  <option value="beijing">北京</option>
</select>
```

### 1.2 minlength / maxlength（长度限制）

```html
<!-- 用户名：3-20位 -->
<input type="text" 
       name="username" 
       minlength="3" 
       maxlength="20"
       required>

<!-- 评论：最少10字 -->
<textarea name="comment" minlength="10" required></textarea>
```

### 1.3 min / max（数值范围）

```html
<!-- 年龄：18-65 -->
<input type="number" 
       name="age" 
       min="18" 
       max="65"
       required>

<!-- 评分：1-5 -->
<input type="range" name="rating" min="1" max="5" value="3">

<!-- 日期范围 -->
<input type="date" 
       name="startDate" 
       min="2024-01-01" 
       max="2024-12-31">
```

### 1.4 pattern（正则验证）

```html
<!-- 手机号：11位数字 -->
<input type="tel" 
       name="phone" 
       pattern="[0-9]{11}"
       title="请输入11位手机号"
       required>

<!-- 邮政编码：6位数字 -->
<input type="text" 
       name="zipcode" 
       pattern="[0-9]{6}"
       title="请输入6位邮政编码">

<!-- 用户名：字母数字下划线 -->
<input type="text" 
       name="username" 
       pattern="[A-Za-z0-9_]{3,20}"
       title="3-20位字母、数字或下划线">

<!-- 强密码：至少8位，包含大小写字母和数字 -->
<input type="password" 
       name="password" 
       pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
       title="至少8位，包含大小写字母和数字">
```

### 1.5 type 自带验证

```html
<!-- 邮箱验证 -->
<input type="email" name="email" required>

<!-- URL 验证 -->
<input type="url" name="website" required>

<!-- 数字验证 -->
<input type="number" name="quantity" required>
```

## 二、验证状态

### 2.1 validity 属性

```javascript
const input = document.getElementById('username');

// 验证状态对象
console.log(input.validity);

// 常用属性
input.validity.valid          // 是否有效
input.validity.valueMissing   // 必填但为空
input.validity.typeMismatch   // 类型不匹配（如email格式错误）
input.validity.patternMismatch // 不符合pattern
input.validity.tooShort       // 小于minlength
input.validity.tooLong        // 大于maxlength
input.validity.rangeUnderflow // 小于min
input.validity.rangeOverflow  // 大于max
input.validity.stepMismatch   // 不符合step
input.validity.badInput       // 浏览器无法识别的输入
input.validity.customError    // 自定义错误
```

### 2.2 验证方法

```javascript
// 检查是否有效
input.checkValidity()        // 返回 true/false，不显示错误
input.reportValidity()       // 返回 true/false，显示错误

// 设置自定义错误
input.setCustomValidity('用户名已存在')
input.setCustomValidity('')  // 清除错误

// 获取错误消息
input.validationMessage
```

## 三、自定义验证

### 3.1 实时验证

```html
<form id="registerForm">
  <div class="form-group">
    <label for="username">用户名：</label>
    <input type="text" 
           id="username" 
           name="username"
           minlength="3"
           required>
    <span class="error-message"></span>
  </div>
  
  <button type="submit">注册</button>
</form>

<script>
const username = document.getElementById('username');
const errorMsg = username.parentElement.querySelector('.error-message');

// 输入时验证
username.addEventListener('input', () => {
  if (username.validity.valid) {
    errorMsg.textContent = '';
    username.classList.remove('invalid');
  }
});

// 失焦时验证
username.addEventListener('blur', () => {
  if (!username.validity.valid) {
    showError(username, errorMsg);
  }
});

function showError(input, errorElement) {
  input.classList.add('invalid');
  
  if (input.validity.valueMissing) {
    errorElement.textContent = '请输入用户名';
  } else if (input.validity.tooShort) {
    errorElement.textContent = `至少${input.minLength}个字符`;
  } else {
    errorElement.textContent = input.validationMessage;
  }
}
</script>

<style>
.form-group {
  margin-bottom: 15px;
}

input.invalid {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  display: block;
  margin-top: 5px;
}
</style>
```

### 3.2 异步验证（检查用户名是否存在）

```javascript
const username = document.getElementById('username');
let checkTimeout;

username.addEventListener('input', () => {
  clearTimeout(checkTimeout);
  
  // 防抖：500ms后检查
  checkTimeout = setTimeout(async () => {
    if (username.value.length < 3) return;
    
    // 模拟API调用
    const exists = await checkUsernameExists(username.value);
    
    if (exists) {
      username.setCustomValidity('用户名已存在');
      showError(username, '用户名已存在');
    } else {
      username.setCustomValidity('');
      clearError(username);
    }
  }, 500);
});

async function checkUsernameExists(username) {
  // 实际应该调用API
  const response = await fetch(`/api/check-username?name=${username}`);
  const data = await response.json();
  return data.exists;
}
```

### 3.3 密码确认验证

```html
<form>
  <div>
    <label for="password">密码：</label>
    <input type="password" 
           id="password" 
           name="password"
           minlength="6"
           required>
  </div>
  
  <div>
    <label for="confirmPassword">确认密码：</label>
    <input type="password" 
           id="confirmPassword" 
           name="confirmPassword"
           required>
    <span class="error-message"></span>
  </div>
  
  <button>提交</button>
</form>

<script>
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const errorMsg = confirmPassword.parentElement.querySelector('.error-message');

function validatePasswordMatch() {
  if (confirmPassword.value !== password.value) {
    confirmPassword.setCustomValidity('两次密码不一致');
    errorMsg.textContent = '两次密码不一致';
    return false;
  } else {
    confirmPassword.setCustomValidity('');
    errorMsg.textContent = '';
    return true;
  }
}

password.addEventListener('input', () => {
  if (confirmPassword.value) {
    validatePasswordMatch();
  }
});

confirmPassword.addEventListener('input', validatePasswordMatch);
</script>
```

## 四、表单提交验证

### 4.1 阻止默认提交

```javascript
const form = document.getElementById('myForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // 验证所有字段
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // 自定义验证
  if (!customValidation()) {
    return;
  }
  
  // 提交数据
  submitForm();
});

function customValidation() {
  // 自定义验证逻辑
  return true;
}

function submitForm() {
  const formData = new FormData(form);
  
  fetch('/api/submit', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('提交成功', data);
  })
  .catch(error => {
    console.error('提交失败', error);
  });
}
```

### 4.2 禁用 HTML5 验证

```html
<!-- 表单级别 -->
<form novalidate>
  <!-- 使用JavaScript验证 -->
</form>

<!-- 按钮级别 -->
<button type="submit" formnovalidate>跳过验证提交</button>
```

## 五、CSS 验证样式

### 5.1 伪类选择器

```css
/* 必填字段 */
input:required {
  border-left: 3px solid #3498db;
}

/* 可选字段 */
input:optional {
  border-left: 3px solid #95a5a6;
}

/* 有效状态 */
input:valid {
  border-color: #27ae60;
}

/* 无效状态 */
input:invalid {
  border-color: #e74c3c;
}

/* 范围内 */
input:in-range {
  border-color: #27ae60;
}

/* 超出范围 */
input:out-of-range {
  border-color: #e74c3c;
}

/* 只读 */
input:read-only {
  background-color: #ecf0f1;
}

/* 可读写 */
input:read-write {
  background-color: white;
}
```

### 5.2 实战样式

```html
<style>
.form-control {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

/* 聚焦状态 */
.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* 有效状态（已输入且有效） */
.form-control:valid:not(:placeholder-shown) {
  border-color: #27ae60;
}

.form-control:valid:not(:placeholder-shown) + .icon {
  color: #27ae60;
}

/* 无效状态（已输入但无效） */
.form-control:invalid:not(:placeholder-shown) {
  border-color: #e74c3c;
}

.form-control:invalid:not(:placeholder-shown) + .error {
  display: block;
}
</style>

<div class="form-group">
  <input type="email" 
         class="form-control" 
         placeholder="请输入邮箱"
         required>
  <span class="icon">✓</span>
  <span class="error">请输入有效的邮箱地址</span>
</div>
```

## 六、完整验证示例

### 6.1 注册表单

```html
<form id="registerForm" class="form" novalidate>
  <h2>用户注册</h2>
  
  <!-- 用户名 -->
  <div class="form-group">
    <label for="username">用户名*</label>
    <input type="text" 
           id="username" 
           name="username"
           class="form-control"
           pattern="[A-Za-z0-9_]{3,20}"
           required>
    <small class="form-text">3-20位字母、数字或下划线</small>
    <span class="error-message"></span>
  </div>
  
  <!-- 邮箱 -->
  <div class="form-group">
    <label for="email">邮箱*</label>
    <input type="email" 
           id="email" 
           name="email"
           class="form-control"
           required>
    <span class="error-message"></span>
  </div>
  
  <!-- 密码 -->
  <div class="form-group">
    <label for="password">密码*</label>
    <input type="password" 
           id="password" 
           name="password"
           class="form-control"
           minlength="8"
           pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
           required>
    <small class="form-text">至少8位，包含大小写字母和数字</small>
    <span class="error-message"></span>
  </div>
  
  <!-- 确认密码 -->
  <div class="form-group">
    <label for="confirmPassword">确认密码*</label>
    <input type="password" 
           id="confirmPassword" 
           name="confirmPassword"
           class="form-control"
           required>
    <span class="error-message"></span>
  </div>
  
  <!-- 手机号 -->
  <div class="form-group">
    <label for="phone">手机号*</label>
    <input type="tel" 
           id="phone" 
           name="phone"
           class="form-control"
           pattern="1[3-9][0-9]{9}"
           required>
    <span class="error-message"></span>
  </div>
  
  <!-- 同意协议 -->
  <div class="form-group">
    <label class="checkbox">
      <input type="checkbox" id="agree" required>
      我已阅读并同意<a href="#">用户协议</a>
    </label>
    <span class="error-message"></span>
  </div>
  
  <button type="submit" class="btn btn-primary">注册</button>
</form>

<script>
const form = document.getElementById('registerForm');
const inputs = form.querySelectorAll('input:not([type="checkbox"])');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

// 为每个输入框添加验证
inputs.forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.classList.contains('is-invalid')) {
      validateField(input);
    }
  });
});

// 密码确认验证
confirmPassword.addEventListener('input', validatePasswordMatch);
password.addEventListener('input', () => {
  if (confirmPassword.value) {
    validatePasswordMatch();
  }
});

function validateField(input) {
  const errorElement = input.parentElement.querySelector('.error-message');
  
  if (!input.validity.valid) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    // 自定义错误消息
    if (input.validity.valueMissing) {
      errorElement.textContent = '此字段为必填项';
    } else if (input.validity.typeMismatch) {
      errorElement.textContent = '格式不正确';
    } else if (input.validity.patternMismatch) {
      if (input.name === 'username') {
        errorElement.textContent = '用户名格式不正确';
      } else if (input.name === 'phone') {
        errorElement.textContent = '请输入正确的手机号';
      } else if (input.name === 'password') {
        errorElement.textContent = '密码必须包含大小写字母和数字';
      }
    } else if (input.validity.tooShort) {
      errorElement.textContent = `至少${input.minLength}个字符`;
    } else {
      errorElement.textContent = input.validationMessage;
    }
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    errorElement.textContent = '';
  }
}

function validatePasswordMatch() {
  const errorElement = confirmPassword.parentElement.querySelector('.error-message');
  
  if (confirmPassword.value !== password.value) {
    confirmPassword.setCustomValidity('两次密码不一致');
    confirmPassword.classList.add('is-invalid');
    errorElement.textContent = '两次密码不一致';
  } else {
    confirmPassword.setCustomValidity('');
    confirmPassword.classList.remove('is-invalid');
    confirmPassword.classList.add('is-valid');
    errorElement.textContent = '';
  }
}

// 表单提交
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // 验证所有字段
  let isValid = true;
  inputs.forEach(input => {
    validateField(input);
    if (!input.validity.valid) {
      isValid = false;
    }
  });
  
  // 验证密码确认
  validatePasswordMatch();
  if (!confirmPassword.validity.valid) {
    isValid = false;
  }
  
  // 验证协议
  const agree = document.getElementById('agree');
  if (!agree.checked) {
    isValid = false;
    const errorElement = agree.parentElement.querySelector('.error-message');
    errorElement.textContent = '请同意用户协议';
  }
  
  if (isValid) {
    console.log('表单验证通过，准备提交');
    // 实际提交逻辑
    submitForm();
  } else {
    // 聚焦到第一个错误字段
    const firstError = form.querySelector('.is-invalid');
    if (firstError) {
      firstError.focus();
    }
  }
});

function submitForm() {
  const formData = new FormData(form);
  console.log('提交数据:', Object.fromEntries(formData));
  
  // 这里应该发送到服务器
  // fetch('/api/register', { method: 'POST', body: formData })
}
</script>

<style>
.form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
}

.form-control.is-valid {
  border-color: #27ae60;
}

.form-control.is-invalid {
  border-color: #e74c3c;
}

.form-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #7f8c8d;
}

.error-message {
  display: block;
  margin-top: 5px;
  font-size: 14px;
  color: #e74c3c;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}
</style>
```

## 参考资料

- [MDN - 表单数据验证](https://developer.mozilla.org/zh-CN/docs/Learn/Forms/Form_validation)
- [MDN - Constraint Validation API](https://developer.mozilla.org/zh-CN/docs/Web/API/Constraint_validation)

---

**上一章** ← [第 14 章：表单控件详解](./14-form-controls.md)  
**下一章** → [第 16 章：表单样式](./16-form-styling.md)
