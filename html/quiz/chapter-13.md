# 第 13 章：表单基础 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 表单元素

### 题目

HTML 表单的基本结构是什么？

**选项：**
- A. `<form>` → `<input>` → `<button>`
- B. `<form>` → `<fieldset>` → `<input>`
- C. `<form>` 包含表单控件和提交按钮
- D. `<input>` 可以独立使用，不需要 `<form>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**表单的基本结构**

```html
<form action="/submit" method="POST">
  <!-- 表单控件 -->
  <label for="username">用户名：</label>
  <input type="text" id="username" name="username">
  
  <label for="password">密码：</label>
  <input type="password" id="password" name="password">
  
  <!-- 提交按钮 -->
  <button type="submit">登录</button>
</form>
```

**form 元素的重要属性：**

```html
<form 
  action="/api/submit"    <!-- 提交的 URL -->
  method="POST"           <!-- 提交方法：GET 或 POST -->
  enctype="application/x-www-form-urlencoded"  <!-- 编码类型 -->
  name="loginForm"        <!-- 表单名称 -->
  novalidate              <!-- 禁用 HTML5 验证 -->
  autocomplete="off"      <!-- 禁用自动完成 -->
  target="_blank">        <!-- 提交后打开方式 -->
  
  <!-- 表单内容 -->
</form>
```

**常见的表单控件：**
- `<input>` - 输入框
- `<textarea>` - 多行文本
- `<select>` - 下拉选择
- `<button>` - 按钮
- `<label>` - 标签
- `<fieldset>` + `<legend>` - 分组

**完整示例：**

```html
<form action="/register" method="POST">
  <fieldset>
    <legend>账户信息</legend>
    
    <div>
      <label for="email">邮箱：</label>
      <input type="email" id="email" name="email" required>
    </div>
    
    <div>
      <label for="password">密码：</label>
      <input type="password" id="password" name="password" required>
    </div>
  </fieldset>
  
  <fieldset>
    <legend>个人信息</legend>
    
    <div>
      <label for="name">姓名：</label>
      <input type="text" id="name" name="name">
    </div>
    
    <div>
      <label>性别：</label>
      <label>
        <input type="radio" name="gender" value="male"> 男
      </label>
      <label>
        <input type="radio" name="gender" value="female"> 女
      </label>
    </div>
  </fieldset>
  
  <button type="submit">注册</button>
  <button type="reset">重置</button>
</form>
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** GET vs POST

### 题目

GET 方法会将表单数据显示在 URL 中，POST 方法则不会。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**GET vs POST 的区别**

**GET 方法：**

```html
<form action="/search" method="GET">
  <input type="text" name="q" value="HTML">
  <button type="submit">搜索</button>
</form>

<!-- 提交后 URL：
https://example.com/search?q=HTML
-->
```

**POST 方法：**

```html
<form action="/login" method="POST">
  <input type="text" name="username" value="admin">
  <input type="password" name="password" value="123456">
  <button type="submit">登录</button>
</form>

<!-- 提交后 URL：
https://example.com/login
（数据在请求体中，不显示在 URL）
-->
```

**详细对比：**

| 特性 | GET | POST |
|------|-----|------|
| **数据位置** | URL 查询字符串 | 请求体 |
| **可见性** | 地址栏可见 | 不可见 |
| **安全性** | 低（密码等敏感信息不要用） | 相对高 |
| **长度限制** | 有限制（~2048字符） | 无限制 |
| **缓存** | 可以缓存 | 不缓存 |
| **书签** | 可以收藏 | 不能收藏 |
| **历史记录** | 保留在浏览器历史 | 不保留参数 |
| **幂等性** | 幂等（多次请求结果相同） | 非幂等 |
| **用途** | 查询、搜索 | 提交、修改数据 |

**使用场景：**

```html
<!-- ✅ GET：搜索、筛选 -->
<form action="/products" method="GET">
  <input type="text" name="keyword" placeholder="搜索商品">
  <select name="category">
    <option value="">全部分类</option>
    <option value="electronics">电子产品</option>
  </select>
  <button type="submit">搜索</button>
</form>

<!-- ✅ POST：登录、注册、提交数据 -->
<form action="/login" method="POST">
  <input type="email" name="email">
  <input type="password" name="password">
  <button type="submit">登录</button>
</form>

<!-- ❌ 错误：密码用 GET -->
<form action="/login" method="GET">
  <input type="password" name="password">
  <!-- URL 会显示：/login?password=123456 -->
</form>
```

**RESTful API 中的使用：**
- GET - 获取资源
- POST - 创建资源
- PUT - 更新资源
- DELETE - 删除资源

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** label 标签

### 题目

如何正确关联 `<label>` 和 `<input>`？

**选项：**
- A. 使用 `for` 属性
- B. 将 `<input>` 包裹在 `<label>` 内
- C. A 或 B 都可以
- D. 使用 `name` 属性

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**label 的两种关联方式**

**方式1：使用 `for` 属性（推荐）**

```html
<label for="username">用户名：</label>
<input type="text" id="username" name="username">
```

**方式2：包裹 input**

```html
<label>
  用户名：
  <input type="text" name="username">
</label>
```

**为什么需要 label？**

1. **可访问性**：屏幕阅读器会读取 label 文本
2. **用户体验**：点击 label 文本也能聚焦 input
3. **语义化**：明确标签和输入框的关系

**完整示例：**

```html
<form>
  <!-- 文本输入 -->
  <div class="form-group">
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <!-- 单选按钮 -->
  <div class="form-group">
    <label>性别：</label>
    <label>
      <input type="radio" name="gender" value="male"> 男
    </label>
    <label>
      <input type="radio" name="gender" value="female"> 女
    </label>
  </div>
  
  <!-- 复选框 -->
  <div class="form-group">
    <label>
      <input type="checkbox" name="agree" required>
      我同意<a href="/terms">服务条款</a>
    </label>
  </div>
  
  <!-- 下拉选择 -->
  <div class="form-group">
    <label for="country">国家：</label>
    <select id="country" name="country">
      <option value="cn">中国</option>
      <option value="us">美国</option>
    </select>
  </div>
</form>
```

**样式优化：**

```css
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* 行内 label */
label input[type="radio"],
label input[type="checkbox"] {
  margin-right: 0.5rem;
}

/* 聚焦效果 */
input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

**可访问性增强：**

```html
<!-- 必填标记 -->
<label for="email">
  邮箱 <span aria-label="必填" class="required">*</span>
</label>
<input type="email" id="email" name="email" required>

<!-- 辅助说明 -->
<label for="password">密码：</label>
<input 
  type="password" 
  id="password" 
  name="password"
  aria-describedby="password-help">
<small id="password-help">至少8个字符，包含字母和数字</small>
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 输入类型

### 题目

HTML5 新增了哪些输入类型？

**选项：**
- A. `email`, `url`, `tel`
- B. `date`, `time`, `datetime-local`
- C. `number`, `range`, `color`
- D. `search`, `password`, `text`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**HTML5 新增的输入类型（A, B, C 正确）**

**1. 文本类型（A 正确）**

```html
<!-- 邮箱 -->
<input type="email" name="email" placeholder="user@example.com">

<!-- URL -->
<input type="url" name="website" placeholder="https://example.com">

<!-- 电话 -->
<input type="tel" name="phone" placeholder="+86 138-0013-8000">

<!-- 搜索 -->
<input type="search" name="q" placeholder="搜索...">
```

**2. 日期时间（B 正确）**

```html
<!-- 日期 -->
<input type="date" name="birthday" min="1900-01-01" max="2024-12-31">

<!-- 时间 -->
<input type="time" name="time" step="1">

<!-- 日期时间（本地） -->
<input type="datetime-local" name="appointment">

<!-- 月份 -->
<input type="month" name="month">

<!-- 周 -->
<input type="week" name="week">
```

**3. 数值和颜色（C 正确）**

```html
<!-- 数字 -->
<input type="number" name="age" min="0" max="120" step="1">

<!-- 范围滑块 -->
<input type="range" name="volume" min="0" max="100" value="50">

<!-- 颜色选择器 -->
<input type="color" name="color" value="#3b82f6">
```

**4. 传统类型（D 部分正确）**

```html
<!-- HTML4 就有的类型 -->
<input type="text" name="username">
<input type="password" name="password">
<input type="radio" name="gender" value="male">
<input type="checkbox" name="agree">
<input type="file" name="avatar">
<input type="hidden" name="csrf_token">
<input type="submit" value="提交">
<input type="reset" value="重置">
<input type="button" value="按钮">
```

**完整示例：**

```html
<form action="/profile" method="POST">
  <h2>个人信息</h2>
  
  <!-- 文本类型 -->
  <label for="email">邮箱：</label>
  <input type="email" id="email" name="email" required>
  
  <label for="website">个人网站：</label>
  <input type="url" id="website" name="website">
  
  <label for="phone">电话：</label>
  <input type="tel" id="phone" name="phone">
  
  <!-- 日期时间 -->
  <label for="birthday">生日：</label>
  <input type="date" id="birthday" name="birthday">
  
  <label for="meeting">会议时间：</label>
  <input type="datetime-local" id="meeting" name="meeting">
  
  <!-- 数值 -->
  <label for="age">年龄：</label>
  <input type="number" id="age" name="age" min="18" max="100">
  
  <label for="salary">期望薪资（千元）：</label>
  <input type="range" id="salary" name="salary" min="5" max="50" step="5">
  <output for="salary">25</output>
  
  <!-- 颜色 -->
  <label for="theme">主题色：</label>
  <input type="color" id="theme" name="theme" value="#3b82f6">
  
  <button type="submit">保存</button>
</form>

<script>
// 范围滑块实时显示
const salaryInput = document.getElementById('salary');
const salaryOutput = document.querySelector('output[for="salary"]');

salaryInput.addEventListener('input', () => {
  salaryOutput.value = salaryInput.value + 'k';
});
</script>
```

**移动端优化：**

```html
<!-- 邮箱输入会显示 @ 键盘 -->
<input type="email" inputmode="email">

<!-- 电话输入会显示数字键盘 -->
<input type="tel" inputmode="tel">

<!-- URL 输入会显示 .com 等快捷键 -->
<input type="url" inputmode="url">

<!-- 数字输入显示数字键盘 -->
<input type="number" inputmode="numeric">
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 必填验证

### 题目

以下哪些输入框会触发浏览器的必填验证？

```html
<input type="text" name="name" required>
<input type="email" name="email">
<input type="number" name="age" min="18">
<input type="text" name="city" pattern="[A-Za-z]+">
```

**选项：**
- A. 只有第一个
- B. 第一个和第二个
- C. 第一个和第四个
- D. 全部都会

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**HTML5 表单验证**

只有带 `required` 属性的输入框才会触发必填验证。

```html
<!-- ✅ 必填：提交时会验证 -->
<input type="text" name="name" required>

<!-- ❌ 非必填：可以为空 -->
<input type="email" name="email">

<!-- ❌ 有 min 但非必填 -->
<input type="number" name="age" min="18">

<!-- ❌ 有 pattern 但非必填 -->
<input type="text" name="city" pattern="[A-Za-z]+">
```

**完整的验证属性：**

```html
<form>
  <!-- 1. required - 必填 -->
  <input type="text" name="username" required>
  
  <!-- 2. minlength/maxlength - 长度限制 -->
  <input type="text" name="password" minlength="8" maxlength="20" required>
  
  <!-- 3. min/max - 数值范围 -->
  <input type="number" name="age" min="18" max="100" required>
  
  <!-- 4. pattern - 正则验证 -->
  <input type="text" name="phone" pattern="[0-9]{11}" required>
  
  <!-- 5. type 自动验证 -->
  <input type="email" name="email" required>
  <input type="url" name="website" required>
  
  <!-- 6. step - 步长 -->
  <input type="number" name="price" step="0.01" required>
  
  <button type="submit">提交</button>
</form>
```

**验证示例：**

```html
<form novalidate>  <!-- 禁用浏览器默认验证 -->
  <label for="email">邮箱：</label>
  <input 
    type="email" 
    id="email" 
    name="email"
    required
    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
    aria-describedby="email-error">
  <span id="email-error" class="error" role="alert"></span>
  
  <label for="password">密码：</label>
  <input 
    type="password" 
    id="password" 
    name="password"
    required
    minlength="8"
    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
    aria-describedby="password-help">
  <small id="password-help">至少8位，包含大小写字母和数字</small>
  
  <button type="submit">提交</button>
</form>

<script>
const form = document.querySelector('form');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');

form.addEventListener('submit', (e) => {
  // 自定义验证
  if (!emailInput.validity.valid) {
    e.preventDefault();
    
    if (emailInput.validity.valueMissing) {
      emailError.textContent = '请输入邮箱';
    } else if (emailInput.validity.typeMismatch) {
      emailError.textContent = '请输入有效的邮箱地址';
    } else if (emailInput.validity.patternMismatch) {
      emailError.textContent = '邮箱格式不正确';
    }
  }
});

// 实时验证
emailInput.addEventListener('input', () => {
  if (emailInput.validity.valid) {
    emailError.textContent = '';
    emailInput.classList.remove('invalid');
    emailInput.classList.add('valid');
  } else {
    emailInput.classList.remove('valid');
    emailInput.classList.add('invalid');
  }
});
</script>

<style>
input.valid {
  border-color: #22c55e;
}

input.invalid {
  border-color: #ef4444;
}

.error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** fieldset

### 题目

`<fieldset>` 和 `<legend>` 的作用是什么？

**选项：**
- A. 美化表单样式
- B. 分组相关表单控件
- C. 提交表单数据
- D. 验证表单输入

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**fieldset 和 legend 用于分组表单控件**

```html
<form>
  <fieldset>
    <legend>账户信息</legend>
    
    <label for="username">用户名：</label>
    <input type="text" id="username" name="username">
    
    <label for="password">密码：</label>
    <input type="password" id="password" name="password">
  </fieldset>
  
  <fieldset>
    <legend>个人信息</legend>
    
    <label for="name">姓名：</label>
    <input type="text" id="name" name="name">
    
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email">
  </fieldset>
  
  <button type="submit">提交</button>
</form>
```

**优点：**

1. **语义化**：明确表单的逻辑分组
2. **可访问性**：屏幕阅读器会识别分组
3. **批量禁用**：可以禁用整个 fieldset

**批量禁用示例：**

```html
<fieldset disabled>
  <legend>付款信息（暂不可用）</legend>
  
  <label for="card">卡号：</label>
  <input type="text" id="card" name="card">
  
  <label for="cvv">CVV：</label>
  <input type="text" id="cvv" name="cvv">
</fieldset>
```

**样式化：**

```css
fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

legend {
  padding: 0 0.5rem;
  font-weight: bold;
  color: #333;
}

/* 禁用状态 */
fieldset:disabled {
  opacity: 0.6;
  background-color: #f5f5f5;
}
```

**完整示例：**

```html
<form>
  <fieldset>
    <legend>配送信息</legend>
    
    <div class="form-row">
      <div class="form-group">
        <label for="recipient">收件人：</label>
        <input type="text" id="recipient" name="recipient" required>
      </div>
      
      <div class="form-group">
        <label for="phone">电话：</label>
        <input type="tel" id="phone" name="phone" required>
      </div>
    </div>
    
    <div class="form-group">
      <label for="address">地址：</label>
      <textarea id="address" name="address" rows="3" required></textarea>
    </div>
  </fieldset>
  
  <fieldset>
    <legend>配送方式</legend>
    
    <label>
      <input type="radio" name="shipping" value="standard" checked>
      标准配送（3-5天）
    </label>
    
    <label>
      <input type="radio" name="shipping" value="express">
      快速配送（1-2天）
    </label>
  </fieldset>
  
  <button type="submit">确认订单</button>
</form>
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** button 类型

### 题目

`<button>` 元素的 `type` 属性有哪些值？

**选项：**
- A. `submit`
- B. `reset`
- C. `button`
- D. `cancel`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**button 的三种类型（A, B, C 正确）**

```html
<form>
  <!-- 1. submit - 提交表单（默认） -->
  <button type="submit">提交</button>
  
  <!-- 2. reset - 重置表单 -->
  <button type="reset">重置</button>
  
  <!-- 3. button - 普通按钮，不提交 -->
  <button type="button" onclick="doSomething()">操作</button>
</form>
```

**注意事项：**

```html
<!-- ❌ 默认是 submit，会提交表单 -->
<form>
  <button>点击</button>  <!-- 等同于 type="submit" -->
</form>

<!-- ✅ 普通按钮必须显式指定 type="button" -->
<form>
  <button type="button" onclick="alert('Hello')">点击</button>
</form>
```

**完整示例：**

```html
<form id="myForm">
  <label for="name">姓名：</label>
  <input type="text" id="name" name="name" value="张三">
  
  <label for="email">邮箱：</label>
  <input type="email" id="email" name="email" value="test@example.com">
  
  <!-- 提交按钮 -->
  <button type="submit">
    <svg><!-- 图标 --></svg>
    提交
  </button>
  
  <!-- 重置按钮 -->
  <button type="reset">
    重置
  </button>
  
  <!-- 普通按钮 -->
  <button type="button" onclick="preview()">
    预览
  </button>
  
  <!-- 取消按钮（通常是 type="button"） -->
  <button type="button" onclick="cancel()">
    取消
  </button>
</form>

<script>
function preview() {
  const formData = new FormData(document.getElementById('myForm'));
  console.log('表单数据预览：', Object.fromEntries(formData));
}

function cancel() {
  if (confirm('确定要取消吗？')) {
    history.back();
  }
}
</script>
```

**vs `<input>` 按钮：**

```html
<!-- button 元素（推荐） -->
<button type="submit">
  <img src="icon.png" alt=""> 提交
</button>

<!-- input 元素（功能有限） -->
<input type="submit" value="提交">
<input type="reset" value="重置">
<input type="button" value="按钮" onclick="...">
```

**样式化：**

```css
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button[type="submit"] {
  background-color: #3b82f6;
  color: white;
}

button[type="submit"]:hover {
  background-color: #2563eb;
}

button[type="reset"] {
  background-color: #6b7280;
  color: white;
}

button[type="button"] {
  background-color: #e5e7eb;
  color: #374151;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 文件上传

### 题目

创建一个支持多文件上传，且只允许上传图片的表单。

<details>
<summary>查看答案</summary>

### ✅ 正确答案

```html
<form action="/upload" method="POST" enctype="multipart/form-data">
  <label for="images">选择图片：</label>
  <input 
    type="file" 
    id="images" 
    name="images"
    accept="image/*"
    multiple
    required>
  
  <button type="submit">上传</button>
</form>
```

### 📖 解析

**文件上传的关键点**

**1. 必需的 form 属性**

```html
<form 
  action="/upload" 
  method="POST"                              <!-- 必须是 POST -->
  enctype="multipart/form-data">             <!-- 必需！ -->
  
  <input type="file" name="file">
  <button type="submit">上传</button>
</form>
```

**2. input 属性**

```html
<input 
  type="file"
  name="avatar"
  accept="image/*"          <!-- 限制文件类型 -->
  multiple                  <!-- 允许多选 -->
  capture="user"            <!-- 移动端直接调用摄像头 -->
  required>
```

**accept 属性值：**

```html
<!-- 图片 -->
<input type="file" accept="image/*">
<input type="file" accept="image/png, image/jpeg">

<!-- 视频 -->
<input type="file" accept="video/*">

<!-- 音频 -->
<input type="file" accept="audio/*">

<!-- PDF -->
<input type="file" accept="application/pdf">

<!-- 文档 -->
<input type="file" accept=".doc,.docx,.pdf">

<!-- 多种类型 -->
<input type="file" accept="image/*,video/*">
```

**完整示例：**

```html
<form id="uploadForm" enctype="multipart/form-data">
  <div class="upload-area">
    <input 
      type="file" 
      id="fileInput" 
      name="files"
      accept="image/png, image/jpeg, image/gif"
      multiple
      hidden>
    
    <label for="fileInput" class="upload-btn">
      <svg><!-- 上传图标 --></svg>
      选择图片
    </label>
    
    <p class="upload-hint">支持 PNG、JPG、GIF 格式，最多 5 张</p>
  </div>
  
  <!-- 预览区域 -->
  <div id="preview" class="preview-grid"></div>
  
  <button type="submit" disabled>上传</button>
</form>

<script>
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const submitBtn = document.querySelector('button[type="submit"]');

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  
  // 验证文件数量
  if (files.length > 5) {
    alert('最多只能上传 5 张图片');
    fileInput.value = '';
    return;
  }
  
  // 清空预览
  preview.innerHTML = '';
  
  // 显示预览
  files.forEach((file, index) => {
    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} 超过 5MB`);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" alt="${file.name}">
        <p>${file.name}</p>
        <button type="button" onclick="removeFile(${index})">删除</button>
      `;
      preview.appendChild(div);
    };
    
    reader.readAsDataURL(file);
  });
  
  // 启用提交按钮
  submitBtn.disabled = files.length === 0;
});

// 表单提交
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  const files = fileInput.files;
  
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('上传成功！');
      fileInput.value = '';
      preview.innerHTML = '';
    }
  } catch (error) {
    alert('上传失败：' + error.message);
  }
});
</script>

<style>
.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.upload-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.upload-hint {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.preview-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
```

**拖拽上传：**

```html
<div id="dropZone" class="drop-zone">
  拖拽图片到这里上传
  <input type="file" id="fileInput" accept="image/*" multiple hidden>
</div>

<script>
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  
  const files = Array.from(e.dataTransfer.files);
  handleFiles(files);
});

function handleFiles(files) {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      // 处理图片
    }
  });
}
</script>
```

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 表单安全

### 题目

关于表单安全，以下说法正确的是？

**选项：**
- A. 使用 HTTPS 加密传输
- B. 服务器端必须验证数据
- C. 使用 CSRF Token 防止跨站请求伪造
- D. HTML5 验证可以替代服务器验证

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**表单安全最佳实践（A, B, C 正确，D 错误）**

**1. HTTPS 加密（A 正确）**

```html
<!-- ❌ HTTP：数据明文传输 -->
<form action="http://example.com/login" method="POST">

<!-- ✅ HTTPS：加密传输 -->
<form action="https://example.com/login" method="POST">
```

**2. 服务器端验证（B 正确）**

```javascript
// ❌ 仅客户端验证（可绕过）
<input type="email" required>

// ✅ 服务器端也要验证
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  // 验证邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }
  
  // 验证密码强度
  if (password.length < 8) {
    return res.status(400).json({ error: '密码至少8位' });
  }
  
  // 保存数据...
});
```

**3. CSRF Token（C 正确）**

```html
<form action="/update-profile" method="POST">
  <!-- CSRF Token -->
  <input type="hidden" name="csrf_token" value="random_token_here">
  
  <input type="text" name="username">
  <button type="submit">更新</button>
</form>
```

```javascript
// 服务器端验证
app.post('/update-profile', (req, res) => {
  const token = req.body.csrf_token;
  const sessionToken = req.session.csrf_token;
  
  if (token !== sessionToken) {
    return res.status(403).json({ error: 'CSRF token 无效' });
  }
  
  // 处理请求...
});
```

**4. HTML5 验证不能替代服务器验证（D 错误）**

```html
<!-- 客户端验证可以被绕过 -->
<input type="email" required>

<!-- 用户可以：
1. 禁用 JavaScript
2. 使用浏览器开发工具修改 HTML
3. 直接发送 HTTP 请求绕过表单
-->
```

**完整安全实践：**

```html
<form id="loginForm" action="/login" method="POST">
  <!-- CSRF Token -->
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  
  <label for="email">邮箱：</label>
  <input 
    type="email" 
    id="email" 
    name="email"
    required
    autocomplete="email">
  
  <label for="password">密码：</label>
  <input 
    type="password" 
    id="password" 
    name="password"
    required
    minlength="8"
    autocomplete="current-password">
  
  <button type="submit">登录</button>
</form>

<script>
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch('/login', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'  // 包含 Cookie
    });
    
    if (response.ok) {
      window.location.href = '/dashboard';
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    alert('登录失败');
  }
});
</script>
```

**服务器端安全措施：**

```javascript
const express = require('express');
const csrf = require('csurf');
const helmet = require('helmet');

const app = express();

// 安全头部
app.use(helmet());

// CSRF 保护
app.use(csrf({ cookie: true }));

// 限流
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 最多 100 次请求
});
app.use('/login', limiter);

// 输入验证
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // 1. 验证格式
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }
  
  // 2. SQL 注入防护（使用参数化查询）
  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],  // 参数化
    (err, results) => {
      // 处理...
    }
  );
  
  // 3. XSS 防护（转义输出）
  const safeEmail = escapeHtml(email);
});
```

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** 最佳实践

### 题目

设计一个用户注册表单，要求包含：
1. 邮箱、密码、确认密码、同意条款
2. HTML5 验证
3. 可访问性
4. 安全性

<details>
<summary>查看答案</summary>

### 📖 解析

**完整的注册表单实现**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>用户注册</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
    }
    
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    h1 {
      margin-bottom: 1.5rem;
      color: #333;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    
    label .required {
      color: #ef4444;
    }
    
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    input:valid {
      border-color: #22c55e;
    }
    
    input:invalid:not(:placeholder-shown) {
      border-color: #ef4444;
    }
    
    .help-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #666;
    }
    
    .error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: none;
    }
    
    .error.show {
      display: block;
    }
    
    .checkbox-group {
      display: flex;
      align-items: start;
    }
    
    .checkbox-group input {
      margin-right: 0.5rem;
      margin-top: 0.25rem;
    }
    
    button {
      width: 100%;
      padding: 0.75rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    button:hover {
      background: #2563eb;
    }
    
    button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    
    .password-strength {
      margin-top: 0.5rem;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .password-strength-bar {
      height: 100%;
      width: 0;
      transition: width 0.3s, background 0.3s;
    }
    
    .password-strength-bar.weak { background: #ef4444; width: 33%; }
    .password-strength-bar.medium { background: #f59e0b; width: 66%; }
    .password-strength-bar.strong { background: #22c55e; width: 100%; }
  </style>
</head>
<body>
  <div class="container">
    <h1>用户注册</h1>
    
    <form id="registerForm" novalidate>
      <!-- CSRF Token -->
      <input type="hidden" name="_csrf" value="random_csrf_token">
      
      <!-- 邮箱 -->
      <div class="form-group">
        <label for="email">
          邮箱 <span class="required" aria-label="必填">*</span>
        </label>
        <input 
          type="email" 
          id="email" 
          name="email"
          placeholder="user@example.com"
          required
          autocomplete="email"
          aria-describedby="email-error"
          aria-required="true">
        <span id="email-error" class="error" role="alert"></span>
      </div>
      
      <!-- 密码 -->
      <div class="form-group">
        <label for="password">
          密码 <span class="required" aria-label="必填">*</span>
        </label>
        <input 
          type="password" 
          id="password" 
          name="password"
          placeholder="至少8位，包含字母和数字"
          required
          minlength="8"
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          autocomplete="new-password"
          aria-describedby="password-help password-error"
          aria-required="true">
        <small id="password-help" class="help-text">
          至少8位，包含大小写字母和数字
        </small>
        <div class="password-strength">
          <div class="password-strength-bar"></div>
        </div>
        <span id="password-error" class="error" role="alert"></span>
      </div>
      
      <!-- 确认密码 -->
      <div class="form-group">
        <label for="confirm-password">
          确认密码 <span class="required" aria-label="必填">*</span>
        </label>
        <input 
          type="password" 
          id="confirm-password" 
          name="confirmPassword"
          placeholder="再次输入密码"
          required
          autocomplete="new-password"
          aria-describedby="confirm-error"
          aria-required="true">
        <span id="confirm-error" class="error" role="alert"></span>
      </div>
      
      <!-- 同意条款 -->
      <div class="form-group">
        <div class="checkbox-group">
          <input 
            type="checkbox" 
            id="agree" 
            name="agree"
            required
            aria-describedby="agree-error">
          <label for="agree">
            我已阅读并同意<a href="/terms" target="_blank">服务条款</a>和<a href="/privacy" target="_blank">隐私政策</a>
            <span class="required" aria-label="必填">*</span>
          </label>
        </div>
        <span id="agree-error" class="error" role="alert"></span>
      </div>
      
      <button type="submit">注册</button>
    </form>
  </div>

  <script>
    const form = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const agreeInput = document.getElementById('agree');
    
    // 邮箱验证
    emailInput.addEventListener('blur', () => {
      const emailError = document.getElementById('email-error');
      
      if (emailInput.validity.valueMissing) {
        emailError.textContent = '请输入邮箱';
        emailError.classList.add('show');
      } else if (emailInput.validity.typeMismatch) {
        emailError.textContent = '请输入有效的邮箱地址';
        emailError.classList.add('show');
      } else {
        emailError.classList.remove('show');
      }
    });
    
    // 密码强度检测
    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      const strengthBar = document.querySelector('.password-strength-bar');
      const passwordError = document.getElementById('password-error');
      
      let strength = 0;
      
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      
      strengthBar.className = 'password-strength-bar';
      
      if (strength === 1) {
        strengthBar.classList.add('weak');
      } else if (strength === 2) {
        strengthBar.classList.add('medium');
      } else if (strength === 3) {
        strengthBar.classList.add('strong');
      }
      
      // 验证
      if (password.length > 0 && password.length < 8) {
        passwordError.textContent = '密码至少8位';
        passwordError.classList.add('show');
      } else if (password.length >= 8 && !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
        passwordError.textContent = '密码必须包含大小写字母和数字';
        passwordError.classList.add('show');
      } else {
        passwordError.classList.remove('show');
      }
    });
    
    // 确认密码验证
    confirmInput.addEventListener('input', () => {
      const confirmError = document.getElementById('confirm-error');
      
      if (confirmInput.value !== passwordInput.value) {
        confirmError.textContent = '两次密码不一致';
        confirmError.classList.add('show');
      } else {
        confirmError.classList.remove('show');
      }
    });
    
    // 表单提交
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // 验证所有字段
      let isValid = true;
      
      if (!emailInput.validity.valid) {
        document.getElementById('email-error').textContent = '请输入有效的邮箱';
        document.getElementById('email-error').classList.add('show');
        isValid = false;
      }
      
      if (!passwordInput.validity.valid) {
        document.getElementById('password-error').textContent = '密码格式不正确';
        document.getElementById('password-error').classList.add('show');
        isValid = false;
      }
      
      if (confirmInput.value !== passwordInput.value) {
        document.getElementById('confirm-error').textContent = '两次密码不一致';
        document.getElementById('confirm-error').classList.add('show');
        isValid = false;
      }
      
      if (!agreeInput.checked) {
        document.getElementById('agree-error').textContent = '请同意服务条款';
        document.getElementById('agree-error').classList.add('show');
        isValid = false;
      }
      
      if (!isValid) return;
      
      // 提交数据
      const formData = new FormData(form);
      
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        });
        
        if (response.ok) {
          alert('注册成功！');
          window.location.href = '/login';
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (error) {
        alert('注册失败，请稍后重试');
      }
    });
  </script>
</body>
</html>
```

**关键特性总结：**

**1. HTML5 验证：**
- `required` - 必填
- `type="email"` - 邮箱格式
- `minlength` - 最小长度
- `pattern` - 正则验证

**2. 可访问性：**
- `<label>` 关联 `<input>`
- `aria-describedby` - 关联说明文字
- `aria-required` - 标记必填
- `role="alert"` - 错误提示

**3. 安全性：**
- CSRF Token
- HTTPS 传输
- 密码强度检测
- 服务器端验证

**4. 用户体验：**
- 实时验证
- 密码强度指示
- 清晰的错误提示
- 自动完成提示

</details>

---

**📌 本章总结**

- 表单基本结构：`<form>` + `action` + `method`
- GET vs POST：查询用 GET，提交用 POST
- `<label>` 关联 input：`for` 或包裹
- HTML5 输入类型：email, url, tel, date, number, color 等
- 验证属性：required, minlength, pattern, min, max
- `<fieldset>` 和 `<legend>` 分组表单
- button 类型：submit, reset, button
- 文件上传：`enctype="multipart/form-data"` + `type="file"`
- 安全：HTTPS、服务器验证、CSRF Token

**上一章** ← [第 12 章：表格基础](./chapter-12.md)  
**下一章** → [第 14 章：表单高级控件](./chapter-14.md)
