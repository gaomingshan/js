# 第 16 章：表单样式

## 概述

美观、易用的表单样式能提升用户体验。本章介绍表单样式的最佳实践。

## 一、基础样式重置

### 1.1 去除默认样式

```css
/* 重置所有表单元素 */
input, textarea, select, button {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

/* 去除焦点轮廓（需自定义） */
input:focus, textarea:focus, select:focus {
  outline: none;
}

/* 去除数字输入框的上下箭头 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

/* 去除搜索框的清除按钮 */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
```

## 二、输入框样式

### 2.1 基础输入框

```html
<style>
.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input::placeholder {
  color: #9ca3af;
}
</style>

<input type="text" class="input" placeholder="请输入内容">
```

### 2.2 带图标的输入框

```html
<style>
.input-group {
  position: relative;
}

.input-group .input {
  padding-left: 40px;
}

.input-group .icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.input-group .input:focus + .icon {
  color: #3b82f6;
}
</style>

<div class="input-group">
  <input type="text" class="input" placeholder="搜索...">
  <span class="icon">🔍</span>
</div>
```

### 2.3 不同状态的输入框

```html
<style>
.input-success {
  border-color: #10b981;
}

.input-error {
  border-color: #ef4444;
}

.input-disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>

<input type="text" class="input input-success" value="验证通过">
<input type="text" class="input input-error" value="验证失败">
<input type="text" class="input input-disabled" disabled value="禁用状态">
```

## 三、选择框样式

### 3.1 单选框（Radio）

```html
<style>
.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.radio-label input[type="radio"]:checked {
  border-color: #3b82f6;
  background-color: #3b82f6;
  box-shadow: inset 0 0 0 3px white;
}
</style>

<div class="radio-group">
  <label class="radio-label">
    <input type="radio" name="gender" value="male">
    <span>男</span>
  </label>
  <label class="radio-label">
    <input type="radio" name="gender" value="female">
    <span>女</span>
  </label>
</div>
```

### 3.2 复选框（Checkbox）

```html
<style>
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.checkbox-label input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
}
</style>

<label class="checkbox-label">
  <input type="checkbox" name="agree">
  <span>我同意用户协议</span>
</label>
```

### 3.3 下拉选择框

```html
<style>
.select-wrapper {
  position: relative;
  display: inline-block;
  width: 200px;
}

.select-wrapper select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  appearance: none;
  cursor: pointer;
  background-color: white;
}

.select-wrapper::after {
  content: '▼';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 12px;
}

.select-wrapper select:focus {
  border-color: #3b82f6;
}
</style>

<div class="select-wrapper">
  <select>
    <option>请选择城市</option>
    <option>北京</option>
    <option>上海</option>
    <option>广州</option>
  </select>
</div>
```

## 四、按钮样式

### 4.1 基础按钮

```html
<style>
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline:hover {
  background-color: #3b82f6;
  color: white;
}
</style>

<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-outline">边框按钮</button>
```

### 4.2 按钮尺寸

```html
<style>
.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-md {
  padding: 12px 24px;
  font-size: 16px;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 18px;
}
</style>

<button class="btn btn-primary btn-sm">小按钮</button>
<button class="btn btn-primary btn-md">中按钮</button>
<button class="btn btn-primary btn-lg">大按钮</button>
```

### 4.3 加载状态

```html
<style>
.btn-loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid white;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

<button class="btn btn-primary btn-loading">加载中</button>
```

## 五、文本域样式

```html
<style>
.textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  transition: all 0.3s;
}

.textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
</style>

<textarea class="textarea" placeholder="请输入评论..."></textarea>
```

## 六、表单布局

### 6.1 垂直布局

```html
<style>
.form-vertical {
  max-width: 400px;
}

.form-vertical .form-group {
  margin-bottom: 20px;
}

.form-vertical label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}
</style>

<form class="form-vertical">
  <div class="form-group">
    <label>用户名</label>
    <input type="text" class="input">
  </div>
  <div class="form-group">
    <label>密码</label>
    <input type="password" class="input">
  </div>
  <button class="btn btn-primary">登录</button>
</form>
```

### 6.2 水平布局

```html
<style>
.form-horizontal .form-group {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-horizontal label {
  width: 100px;
  margin-right: 16px;
}

.form-horizontal .input {
  flex: 1;
}
</style>

<form class="form-horizontal">
  <div class="form-group">
    <label>用户名</label>
    <input type="text" class="input">
  </div>
  <div class="form-group">
    <label>密码</label>
    <input type="password" class="input">
  </div>
</form>
```

### 6.3 网格布局

```html
<style>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-grid .form-group-full {
  grid-column: 1 / -1;
}
</style>

<form class="form-grid">
  <div class="form-group">
    <label>姓</label>
    <input type="text" class="input">
  </div>
  <div class="form-group">
    <label>名</label>
    <input type="text" class="input">
  </div>
  <div class="form-group form-group-full">
    <label>邮箱</label>
    <input type="email" class="input">
  </div>
</form>
```

## 七、验证反馈样式

```html
<style>
.form-group {
  margin-bottom: 20px;
}

.input.is-valid {
  border-color: #10b981;
}

.input.is-invalid {
  border-color: #ef4444;
}

.valid-feedback {
  color: #10b981;
  font-size: 14px;
  margin-top: 4px;
  display: none;
}

.invalid-feedback {
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
  display: none;
}

.input.is-valid ~ .valid-feedback {
  display: block;
}

.input.is-invalid ~ .invalid-feedback {
  display: block;
}
</style>

<div class="form-group">
  <input type="email" class="input is-valid" value="user@example.com">
  <div class="valid-feedback">✓ 邮箱格式正确</div>
</div>

<div class="form-group">
  <input type="email" class="input is-invalid" value="invalid-email">
  <div class="invalid-feedback">✗ 请输入有效的邮箱地址</div>
</div>
```

## 八、现代表单组件

### 8.1 开关按钮（Switch）

```html
<style>
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 28px;
}

.switch-slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch input:checked + .switch-slider {
  background-color: #3b82f6;
}

.switch input:checked + .switch-slider:before {
  transform: translateX(22px);
}
</style>

<label class="switch">
  <input type="checkbox">
  <span class="switch-slider"></span>
</label>
```

### 8.2 步进器（Stepper）

```html
<style>
.stepper {
  display: inline-flex;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.stepper button {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #f3f4f6;
  cursor: pointer;
}

.stepper button:hover {
  background-color: #e5e7eb;
}

.stepper input {
  width: 60px;
  border: none;
  text-align: center;
  font-size: 16px;
}
</style>

<div class="stepper">
  <button onclick="decrement()">-</button>
  <input type="number" id="quantity" value="1" readonly>
  <button onclick="increment()">+</button>
</div>

<script>
function increment() {
  const input = document.getElementById('quantity');
  input.value = parseInt(input.value) + 1;
}

function decrement() {
  const input = document.getElementById('quantity');
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}
</script>
```

## 九、响应式表单

```html
<style>
.responsive-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row .col-full {
    grid-column: 1 / -1;
  }
}
</style>

<form class="responsive-form">
  <div class="form-row">
    <div class="form-group">
      <label>姓</label>
      <input type="text" class="input">
    </div>
    <div class="form-group">
      <label>名</label>
      <input type="text" class="input">
    </div>
  </div>
  
  <div class="form-row">
    <div class="form-group col-full">
      <label>邮箱</label>
      <input type="email" class="input">
    </div>
  </div>
</form>
```

## 十、完整示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>现代表单</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .form-container {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 450px;
      width: 100%;
    }
    
    h2 {
      margin-bottom: 30px;
      color: #1f2937;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      color: #374151;
      font-weight: 500;
    }
    
    .input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s;
    }
    
    .input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
    
    .btn {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    
    .checkbox-label input {
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <h2>创建账户</h2>
    <form>
      <div class="form-group">
        <label for="name">姓名</label>
        <input type="text" id="name" class="input" placeholder="请输入姓名" required>
      </div>
      
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" class="input" placeholder="your@email.com" required>
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" class="input" placeholder="至少8位" required>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" required>
          <span>我同意用户协议和隐私政策</span>
        </label>
      </div>
      
      <button type="submit" class="btn">注册</button>
    </form>
  </div>
</body>
</html>
```

## 参考资料

- [MDN - CSS 表单样式](https://developer.mozilla.org/zh-CN/docs/Learn/Forms/Styling_web_forms)
- [A Complete Guide to CSS Form Styling](https://www.smashingmagazine.com/2018/10/form-design-patterns-release/)

---

**上一章** ← [第 15 章：表单验证](./15-form-validation.md)  
**下一章** → [第 17 章：表单提交与处理](./17-form-submission.md)
