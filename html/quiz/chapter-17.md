# 第 17 章：表单提交 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 表单提交方法

### 题目
表单有哪些提交方法？**（多选）**

**A.** 用户点击提交按钮 | **B.** JavaScript `form.submit()` | **C.** 回车键 | **D.** Ajax/Fetch

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

**来源：** HTML 表单规范
</details>

---

## 第 2 题 🟢 | FormData API

### 题目
`FormData` 的作用是什么？

**A.** 验证表单 | **B.** 收集表单数据 | **C.** 样式化表单 | **D.** 重置表单

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
```javascript
const form = document.getElementById('myForm');
const formData = new FormData(form);

// 获取值
formData.get('username');

// 添加字段
formData.append('extra', 'value');

// 提交
fetch('/api/submit', {
  method: 'POST',
  body: formData
});
```

**来源：** FormData API
</details>

---

## 第 3 题 🟢 | 阻止默认提交

### 题目
如何阻止表单默认提交？

**A.** `return false` | **B.** `e.preventDefault()` | **C.** `e.stopPropagation()` | **D.** A 或 B

<details><summary>查看答案</summary>

### ✅ 答案：D

### 解析
```javascript
// 方法1：preventDefault
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // 自定义处理
});

// 方法2：return false（jQuery风格）
form.onsubmit = function() {
  // 处理逻辑
  return false; // 阻止提交
};
```

**来源：** DOM 事件处理
</details>

---

## 第 4 题 🟡 | Ajax 提交

### 题目
使用 Fetch API 提交表单数据。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('成功', data);
    } else {
      console.error('失败', response.status);
    }
  } catch (error) {
    console.error('错误', error);
  }
});
```

**来源：** Fetch API 规范
</details>

---

## 第 5 题 🟡 | JSON 提交

### 题目
如何将表单数据转为 JSON 提交？

<details><summary>查看答案</summary>

### ✅ 答案
```javascript
const formData = new FormData(form);
const data = Object.fromEntries(formData);

await fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

**来源：** Web API 实践
</details>

---

## 第 6 题 🟡 | 文件上传

### 题目
如何上传文件并显示进度？**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const xhr = new XMLHttpRequest();

xhr.upload.addEventListener('progress', (e) => {
  const percent = (e.loaded / e.total) * 100;
  progressBar.style.width = percent + '%';
});

xhr.addEventListener('load', () => {
  if (xhr.status === 200) {
    console.log('上传成功');
  }
});

xhr.open('POST', '/upload');
xhr.send(formData);
```

**来源：** XMLHttpRequest API
</details>

---

## 第 7 题 🟡 | 表单序列化

### 题目
实现表单序列化函数。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```javascript
function serializeForm(form) {
  const formData = new FormData(form);
  const params = new URLSearchParams();
  
  for (const [key, value] of formData) {
    params.append(key, value);
  }
  
  return params.toString();
}

// 使用
const queryString = serializeForm(form);
// 输出: "name=John&age=25&city=Beijing"
```

**来源：** 表单处理技术
</details>

---

## 第 8 题 🔴 | 多步骤表单

### 题目
实现多步骤表单提交。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```javascript
class MultiStepForm {
  constructor(formEl) {
    this.form = formEl;
    this.steps = formEl.querySelectorAll('.step');
    this.currentStep = 0;
    this.data = {};
    
    this.init();
  }
  
  init() {
    this.showStep(0);
    
    this.form.addEventListener('click', (e) => {
      if (e.target.matches('.next-btn')) {
        this.nextStep();
      }
      if (e.target.matches('.prev-btn')) {
        this.prevStep();
      }
    });
    
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
  }
  
  showStep(index) {
    this.steps.forEach((step, i) => {
      step.style.display = i === index ? 'block' : 'none';
    });
    this.currentStep = index;
  }
  
  nextStep() {
    if (this.validateStep()) {
      this.saveStepData();
      if (this.currentStep < this.steps.length - 1) {
        this.showStep(this.currentStep + 1);
      }
    }
  }
  
  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }
  
  validateStep() {
    const inputs = this.steps[this.currentStep].querySelectorAll('input');
    return Array.from(inputs).every(input => input.checkValidity());
  }
  
  saveStepData() {
    const inputs = this.steps[this.currentStep].querySelectorAll('input');
    inputs.forEach(input => {
      this.data[input.name] = input.value;
    });
  }
  
  async submit() {
    this.saveStepData();
    
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.data)
    });
    
    if (response.ok) {
      alert('提交成功！');
    }
  }
}
```

**来源：** 表单交互设计
</details>

---

## 第 9 题 🔴 | 防重复提交

### 题目
如何防止表单重复提交？

<details><summary>查看答案</summary>

### ✅ 答案
```javascript
let isSubmitting = false;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 防止重复提交
  if (isSubmitting) return;
  
  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';
  
  try {
    await fetch('/api/submit', {
      method: 'POST',
      body: new FormData(form)
    });
    
    alert('提交成功');
  } catch (error) {
    alert('提交失败');
  } finally {
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = '提交';
  }
});
```

**来源：** 表单安全实践
</details>

---

## 第 10 题 🔴 | 完整提交流程

### 题目
设计完整的表单提交系统，包括验证、提交、错误处理、成功反馈。

<details><summary>查看答案</summary>

### ✅ 答案
```javascript
class FormSubmitter {
  constructor(formEl) {
    this.form = formEl;
    this.submitBtn = formEl.querySelector('[type="submit"]');
    this.isSubmitting = false;
    
    this.init();
  }
  
  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    // 1. 防止重复提交
    if (this.isSubmitting) return;
    
    // 2. 验证
    if (!this.validate()) {
      this.showError('请填写所有必填项');
      return;
    }
    
    // 3. 开始提交
    this.startSubmit();
    
    try {
      // 4. 收集数据
      const data = this.collectData();
      
      // 5. 发送请求
      const response = await this.submit(data);
      
      // 6. 处理响应
      if (response.ok) {
        const result = await response.json();
        this.handleSuccess(result);
      } else {
        const error = await response.json();
        this.handleError(error);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.endSubmit();
    }
  }
  
  validate() {
    return this.form.checkValidity();
  }
  
  collectData() {
    const formData = new FormData(this.form);
    return Object.fromEntries(formData);
  }
  
  async submit(data) {
    return await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.getCsrfToken()
      },
      body: JSON.stringify(data)
    });
  }
  
  getCsrfToken() {
    return document.querySelector('[name="_csrf"]')?.value;
  }
  
  startSubmit() {
    this.isSubmitting = true;
    this.submitBtn.disabled = true;
    this.submitBtn.textContent = '提交中...';
    this.showLoading();
  }
  
  endSubmit() {
    this.isSubmitting = false;
    this.submitBtn.disabled = false;
    this.submitBtn.textContent = '提交';
    this.hideLoading();
  }
  
  handleSuccess(data) {
    this.showSuccess('提交成功！');
    this.form.reset();
    
    // 可选：跳转
    if (data.redirectUrl) {
      setTimeout(() => {
        window.location.href = data.redirectUrl;
      }, 1000);
    }
  }
  
  handleError(error) {
    const message = error.message || '提交失败，请重试';
    this.showError(message);
  }
  
  showSuccess(message) {
    alert(message); // 实际应使用更好的通知组件
  }
  
  showError(message) {
    alert(message);
  }
  
  showLoading() {
    // 显示加载动画
  }
  
  hideLoading() {
    // 隐藏加载动画
  }
}

new FormSubmitter(document.getElementById('myForm'));
```

**来源：** 企业级表单系统设计
</details>

---

**📌 本章总结**
- 提交方法：按钮、回车、JS、Ajax
- FormData：收集表单数据
- Fetch/Ajax：异步提交
- 文件上传：进度监听
- 防重复提交：标志位 + 禁用按钮
- 错误处理：try-catch + 用户反馈

**上一章** ← [第 16 章：表单样式](./chapter-16.md)  
**下一章** → [第 18 章：语义化标签](./chapter-18.md)
