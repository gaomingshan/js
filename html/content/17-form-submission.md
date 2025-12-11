# 第 17 章：表单提交与处理

## 概述

表单提交是前后端交互的关键环节。本章介绍多种表单提交方式和数据处理技术。

## 一、传统表单提交

### 1.1 GET 提交

```html
<form action="/search" method="GET">
  <input type="text" name="q" placeholder="搜索关键词">
  <input type="text" name="category" value="all">
  <button type="submit">搜索</button>
</form>

<!-- 提交后跳转：/search?q=关键词&category=all -->
```

**特点：**
- ✅ 数据在 URL 中，可分享、可收藏
- ✅ 适合搜索、筛选
- ❌ 数据可见，不安全
- ❌ 有长度限制

### 1.2 POST 提交

```html
<form action="/login" method="POST">
  <input type="text" name="username">
  <input type="password" name="password">
  <button type="submit">登录</button>
</form>
```

**特点：**
- ✅ 数据在请求体中，相对安全
- ✅ 无长度限制
- ✅ 适合敏感数据
- ❌ 不可收藏

### 1.3 文件上传

```html
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar">
  <button type="submit">上传</button>
</form>
```

> **⚠️ 注意**  
> 文件上传必须：
> - `method="POST"`
> - `enctype="multipart/form-data"`

## 二、Ajax 提交

### 2.1 使用 FormData

```html
<form id="myForm">
  <input type="text" name="username">
  <input type="email" name="email">
  <input type="file" name="avatar">
  <button type="submit">提交</button>
</form>

<script>
const form = document.getElementById('myForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 创建 FormData
  const formData = new FormData(form);
  
  // 可以添加额外数据
  formData.append('timestamp', Date.now());
  
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('成功:', data);
  } catch (error) {
    console.error('失败:', error);
  }
});
</script>
```

### 2.2 发送 JSON 数据

```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 获取表单数据
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('成功:', result);
  } catch (error) {
    console.error('失败:', error);
  }
});
```

### 2.3 带进度的文件上传

```html
<input type="file" id="fileInput">
<progress id="progress" value="0" max="100"></progress>
<span id="percent">0%</span>

<script>
const fileInput = document.getElementById('fileInput');
const progress = document.getElementById('progress');
const percent = document.getElementById('percent');

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  const xhr = new XMLHttpRequest();
  
  // 上传进度
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      progress.value = percentComplete;
      percent.textContent = Math.round(percentComplete) + '%';
    }
  });
  
  // 完成
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      console.log('上传成功');
    }
  });
  
  xhr.open('POST', '/api/upload');
  xhr.send(formData);
});
</script>
```

## 三、FormData API

### 3.1 基本操作

```javascript
const formData = new FormData();

// 添加数据
formData.append('username', 'zhangsan');
formData.append('age', 25);
formData.append('file', fileInput.files[0]);

// 设置数据（覆盖）
formData.set('username', 'lisi');

// 获取数据
const username = formData.get('username');

// 获取所有值
const ages = formData.getAll('age');

// 检查是否存在
if (formData.has('username')) {
  console.log('存在 username');
}

// 删除
formData.delete('age');

// 遍历
for (let [key, value] of formData.entries()) {
  console.log(key, value);
}
```

### 3.2 从表单创建

```javascript
const form = document.getElementById('myForm');
const formData = new FormData(form);

// 转为对象
const data = Object.fromEntries(formData);
console.log(data);

// 转为 URLSearchParams
const params = new URLSearchParams(formData);
console.log(params.toString());
```

## 四、表单状态管理

### 4.1 禁用提交按钮

```html
<form id="form">
  <input type="text" name="username" required>
  <button type="submit" id="submitBtn">提交</button>
</form>

<script>
const form = document.getElementById('form');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 禁用按钮
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';
  
  try {
    await submitForm();
    submitBtn.textContent = '提交成功';
  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = '提交失败，重试';
  }
});

async function submitForm() {
  const formData = new FormData(form);
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData
  });
  return response.json();
}
</script>
```

### 4.2 加载状态

```html
<style>
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin: -8px 0 0 -8px;
  border: 2px solid white;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

<button type="submit" id="btn" class="btn">提交</button>

<script>
btn.addEventListener('click', async () => {
  btn.classList.add('btn-loading');
  btn.disabled = true;
  
  await submitForm();
  
  btn.classList.remove('btn-loading');
  btn.disabled = false;
});
</script>
```

## 五、表单重置

### 5.1 重置按钮

```html
<form id="form">
  <input type="text" name="username">
  <button type="reset">重置</button>
  <button type="submit">提交</button>
</form>

<script>
const form = document.getElementById('form');

form.addEventListener('reset', (e) => {
  if (!confirm('确定要重置表单吗？')) {
    e.preventDefault();
  }
});
</script>
```

### 5.2 JavaScript 重置

```javascript
// 重置表单
form.reset();

// 清空特定字段
document.getElementById('username').value = '';

// 恢复到初始值
form.querySelectorAll('input').forEach(input => {
  input.value = input.defaultValue;
});
```

## 六、跨域提交

### 6.1 CORS 请求

```javascript
fetch('https://api.example.com/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data),
  credentials: 'include'  // 发送 cookie
})
.then(response => response.json())
.then(data => console.log(data));
```

### 6.2 JSONP（已过时）

```html
<script>
function handleResponse(data) {
  console.log(data);
}
</script>
<script src="https://api.example.com/data?callback=handleResponse"></script>
```

## 七、实战示例

### 7.1 完整的登录表单

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>登录</title>
  <style>
    .form-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 30px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
    }
    
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .btn {
      width: 100%;
      padding: 12px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    
    .error {
      color: #ef4444;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .success {
      color: #10b981;
      font-size: 14px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <h2>用户登录</h2>
    <form id="loginForm">
      <div class="form-group">
        <label for="email">邮箱：</label>
        <input type="email" id="email" name="email" required>
        <div class="error" id="emailError"></div>
      </div>
      
      <div class="form-group">
        <label for="password">密码：</label>
        <input type="password" id="password" name="password" required>
        <div class="error" id="passwordError"></div>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" name="remember"> 记住我
        </label>
      </div>
      
      <button type="submit" class="btn" id="submitBtn">登录</button>
      
      <div class="success" id="successMsg" style="display:none;"></div>
    </form>
  </div>
  
  <script>
    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const successMsg = document.getElementById('successMsg');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // 清除之前的错误
      emailError.textContent = '';
      passwordError.textContent = '';
      successMsg.style.display = 'none';
      
      // 禁用按钮
      submitBtn.disabled = true;
      submitBtn.textContent = '登录中...';
      
      try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          // 成功
          successMsg.textContent = '登录成功！';
          successMsg.style.display = 'block';
          
          // 跳转
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          // 失败
          if (result.errors) {
            if (result.errors.email) {
              emailError.textContent = result.errors.email;
            }
            if (result.errors.password) {
              passwordError.textContent = result.errors.password;
            }
          } else {
            alert(result.message || '登录失败');
          }
        }
      } catch (error) {
        console.error('错误:', error);
        alert('网络错误，请稍后重试');
      } finally {
        // 恢复按钮
        submitBtn.disabled = false;
        submitBtn.textContent = '登录';
      }
    });
  </script>
</body>
</html>
```

### 7.2 多步骤表单

```html
<div class="multi-step-form">
  <div class="steps">
    <div class="step active">步骤 1</div>
    <div class="step">步骤 2</div>
    <div class="step">步骤 3</div>
  </div>
  
  <form id="multiStepForm">
    <!-- 步骤 1 -->
    <div class="step-content active" data-step="1">
      <h3>基本信息</h3>
      <input type="text" name="name" placeholder="姓名" required>
      <input type="email" name="email" placeholder="邮箱" required>
      <button type="button" onclick="nextStep()">下一步</button>
    </div>
    
    <!-- 步骤 2 -->
    <div class="step-content" data-step="2">
      <h3>详细信息</h3>
      <input type="tel" name="phone" placeholder="电话" required>
      <input type="text" name="address" placeholder="地址" required>
      <button type="button" onclick="prevStep()">上一步</button>
      <button type="button" onclick="nextStep()">下一步</button>
    </div>
    
    <!-- 步骤 3 -->
    <div class="step-content" data-step="3">
      <h3>确认信息</h3>
      <div id="preview"></div>
      <button type="button" onclick="prevStep()">上一步</button>
      <button type="submit">提交</button>
    </div>
  </form>
</div>

<script>
let currentStep = 1;

function showStep(step) {
  document.querySelectorAll('.step-content').forEach((content, index) => {
    content.classList.toggle('active', index + 1 === step);
  });
  
  document.querySelectorAll('.step').forEach((el, index) => {
    el.classList.toggle('active', index + 1 <= step);
  });
  
  if (step === 3) {
    showPreview();
  }
}

function nextStep() {
  if (validateStep(currentStep)) {
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep() {
  currentStep--;
  showStep(currentStep);
}

function validateStep(step) {
  const content = document.querySelector(`.step-content[data-step="${step}"]`);
  const inputs = content.querySelectorAll('input[required]');
  
  for (let input of inputs) {
    if (!input.value) {
      alert('请填写所有必填项');
      input.focus();
      return false;
    }
  }
  
  return true;
}

function showPreview() {
  const formData = new FormData(document.getElementById('multiStepForm'));
  const data = Object.fromEntries(formData);
  
  const preview = document.getElementById('preview');
  preview.innerHTML = `
    <p>姓名：${data.name}</p>
    <p>邮箱：${data.email}</p>
    <p>电话：${data.phone}</p>
    <p>地址：${data.address}</p>
  `;
}

document.getElementById('multiStepForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  console.log('提交数据:', data);
  // 实际提交逻辑
});
</script>
```

## 参考资料

- [MDN - FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData)
- [MDN - Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
- [MDN - 发送表单数据](https://developer.mozilla.org/zh-CN/docs/Learn/Forms/Sending_and_retrieving_form_data)

---

**上一章** ← [第 16 章：表单样式](./16-form-styling.md)  
**下一章** → [第 18 章：语义化标签](./18-semantic-tags.md)

---

✅ **第三部分：表格与表单（12-17章）已完成！**
