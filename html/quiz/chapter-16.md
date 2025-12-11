# 第 16 章：表单样式 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 表单伪类

### 题目

CSS 提供了哪些表单状态伪类？**（多选）**

**A.** `:focus`, `:hover` | **B.** `:valid`, `:invalid` | **C.** `:checked`, `:disabled` | **D.** `:required`, `:optional`

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析

```css
/* 交互状态 */
input:focus { border-color: blue; }
input:hover { background: #f0f0f0; }

/* 验证状态 */
input:valid { border-color: green; }
input:invalid { border-color: red; }

/* 选中状态 */
input:checked { background: blue; }
input:disabled { opacity: 0.5; }

/* 必填状态 */
input:required { border-left: 3px solid red; }
input:optional { border-left: 3px solid gray; }

/* 其他 */
input:read-only { background: #eee; }
input:placeholder-shown { font-style: italic; }
input:in-range { border-color: green; }
input:out-of-range { border-color: red; }
```

**来源：** CSS 选择器规范
</details>

---

## 第 2 题 🟢 | 自定义复选框

### 题目

如何隐藏原生复选框但保持功能？

**A.** `display: none` | **B.** `visibility: hidden` | **C.** `opacity: 0` + `position: absolute` | **D.** `height: 0`

<details><summary>查看答案</summary>

### ✅ 答案：C

### 解析

```css
/* ❌ display:none 会移除可访问性 */
input[type="checkbox"] {
  display: none;
}

/* ✅ 保持可访问性的隐藏 */
input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}

/* 自定义样式 */
input[type="checkbox"] + label::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  margin-right: 8px;
}

input[type="checkbox"]:checked + label::before {
  background: #3b82f6;
  border-color: #3b82f6;
}
```

**来源：** 可访问性最佳实践
</details>

---

## 第 3 题 🟢 | placeholder 样式

### 题目

如何修改 placeholder 的样式？

**A.** `::placeholder` | **B.** `:placeholder` | **C.** `placeholder-style` | **D.** 不能修改

<details><summary>查看答案</summary>

### ✅ 答案：A

### 解析

```css
/* 标准写法 */
input::placeholder {
  color: #999;
  font-style: italic;
  opacity: 0.7;
}

/* 兼容性写法 */
input::-webkit-input-placeholder {
  color: #999;
}

input::-moz-placeholder {
  color: #999;
}

input:-ms-input-placeholder {
  color: #999;
}
```

**来源：** CSS 伪元素规范
</details>

---

## 第 4 题 🟡 | 美化文件上传

### 题目

创建一个美观的文件上传按钮。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案

```html
<div class="file-upload">
  <input type="file" id="file" hidden>
  <label for="file" class="file-label">
    📁 选择文件
  </label>
  <span class="file-name">未选择文件</span>
</div>

<style>
.file-label {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.file-label:hover {
  background: #2563eb;
}

.file-name {
  margin-left: 1rem;
  color: #666;
}
</style>

<script>
document.getElementById('file').addEventListener('change', (e) => {
  const fileName = e.target.files[0]?.name || '未选择文件';
  document.querySelector('.file-name').textContent = fileName;
});
</script>
```

**来源：** UI 设计实践
</details>

---

## 第 5 题 🟡 | 表单布局

### 题目

实现响应式表单布局的最佳方法？

**A.** Float | **B.** Flexbox | **C.** Grid | **D.** B 或 C

<details><summary>查看答案</summary>

### ✅ 答案：D

### 解析

```css
/* Flexbox 方案 */
.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  flex: 1;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}

/* Grid 方案 */
.form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}
```

**来源：** CSS 布局技术
</details>

---

## 第 6 题 🟡 | 聚焦样式

### 题目

如何创建符合可访问性的聚焦样式？

**A.** `outline: none` | **B.** 自定义 outline | **C.** box-shadow | **D.** B 或 C

<details><summary>查看答案</summary>

### ✅ 答案：D

### 解析

```css
/* ❌ 不要移除 outline */
input:focus {
  outline: none; /* 影响可访问性 */
}

/* ✅ 自定义 outline */
input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* ✅ 使用 box-shadow */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* ✅ 组合使用 */
input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
```

**来源：** WCAG 可访问性指南
</details>

---

## 第 7 题 🟡 | 验证状态样式

### 题目

如何为验证状态添加图标？**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案

```css
.field {
  position: relative;
}

input {
  padding-right: 2.5rem;
}

input:valid {
  border-color: #22c55e;
}

input:valid::after {
  /* ❌ input 不支持伪元素 */
}

/* ✅ 使用包裹元素 */
.field::after {
  content: '';
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background-size: contain;
  pointer-events: none;
}

.field:has(input:valid)::after {
  content: '✓';
  color: #22c55e;
}

.field:has(input:invalid:not(:placeholder-shown))::after {
  content: '✗';
  color: #ef4444;
}
```

**来源：** CSS 伪元素技巧
</details>

---

## 第 8 题 🔴 | 自定义 range 滑块

### 题目

完全自定义 range 滑块样式。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案

```css
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(
    to right,
    #3b82f6 0%,
    #3b82f6 var(--value, 50%),
    #e5e7eb var(--value, 50%),
    #e5e7eb 100%
  );
  outline: none;
}

/* Webkit 滑块 */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Firefox 滑块 */
input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  border: none;
  cursor: pointer;
}

input[type="range"]::-moz-range-track {
  background: transparent;
}
```

```javascript
// 动态更新进度
const range = document.querySelector('input[type="range"]');

range.addEventListener('input', () => {
  const percent = (range.value - range.min) / (range.max - range.min) * 100;
  range.style.setProperty('--value', percent + '%');
});
```

**来源：** CSS 滑块样式指南
</details>

---

## 第 9 题 🔴 | Floating Label

### 题目

实现浮动标签效果。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案

```html
<div class="floating-label">
  <input type="text" id="email" placeholder=" " required>
  <label for="email">邮箱地址</label>
</div>

<style>
.floating-label {
  position: relative;
  margin-bottom: 1.5rem;
}

.floating-label input {
  width: 100%;
  padding: 1rem 0.75rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.floating-label label {
  position: absolute;
  left: 0.75rem;
  top: 1rem;
  font-size: 1rem;
  color: #666;
  pointer-events: none;
  transition: all 0.3s;
}

/* 聚焦或有值时 */
.floating-label input:focus + label,
.floating-label input:not(:placeholder-shown) + label {
  top: 0.25rem;
  font-size: 0.75rem;
  color: #3b82f6;
}

.floating-label input:focus {
  border-color: #3b82f6;
  outline: none;
}
</style>
```

**来源：** Material Design
</details>

---

## 第 10 题 🔴 | 完整表单主题

### 题目

创建一个完整的现代化表单样式系统。

<details><summary>查看答案</summary>

### ✅ 答案

```css
/* CSS 变量 */
:root {
  --primary: #3b82f6;
  --success: #22c55e;
  --error: #ef4444;
  --border: #e5e7eb;
  --text: #374151;
  --placeholder: #9ca3af;
}

/* 基础表单样式 */
.form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text);
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s;
}

/* 聚焦状态 */
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 验证状态 */
input:valid:not(:placeholder-shown) {
  border-color: var(--success);
}

input:invalid:not(:placeholder-shown) {
  border-color: var(--error);
}

/* 禁用状态 */
input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 按钮 */
button {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #2563eb;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* 错误提示 */
.error-message {
  display: block;
  margin-top: 0.25rem;
  color: var(--error);
  font-size: 0.875rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .form {
    padding: 1rem;
  }
}
```

**来源：** 现代表单设计系统
</details>

---

**📌 本章总结**
- 伪类：:focus, :valid, :invalid, :checked, :disabled
- 自定义控件：隐藏原生元素 + 自定义样式
- 响应式布局：Flexbox/Grid
- 可访问性：保留 outline，使用高对比度
- 动画过渡：提升用户体验

**上一章** ← [第 15 章：表单验证](./chapter-15.md)  
**下一章** → [第 17 章：表单提交](./chapter-17.md)
