# 第 13 章：表单基础

## 概述

表单是网页与用户交互的核心。掌握表单元素和属性，是开发完整 Web 应用的必备技能。

## 一、表单基本结构

### 1.1 `<form>` 元素

```html
<form action="/submit" method="POST">
  <label for="username">用户名：</label>
  <input type="text" id="username" name="username">
  
  <button type="submit">提交</button>
</form>
```

**form 属性：**

| 属性 | 说明 | 值 |
|-----|------|---|
| `action` | 提交地址 | URL |
| `method` | 提交方式 | GET/POST |
| `enctype` | 编码类型 | application/x-www-form-urlencoded（默认）<br>multipart/form-data（文件上传）<br>text/plain |
| `target` | 打开方式 | _self/_blank/_parent/_top |
| `autocomplete` | 自动完成 | on/off |
| `novalidate` | 禁用验证 | 布尔值 |

### 1.2 GET vs POST

```html
<!-- GET：数据在 URL 中 -->
<form action="/search" method="GET">
  <input type="text" name="q">
  <button>搜索</button>
</form>
<!-- 提交后URL：/search?q=关键词 -->

<!-- POST：数据在请求体中 -->
<form action="/login" method="POST">
  <input type="text" name="username">
  <input type="password" name="password">
  <button>登录</button>
</form>
```

**选择原则：**
- **GET**：搜索、筛选（数据可见、可分享）
- **POST**：登录、注册、提交（数据敏感、不可缓存）

## 二、输入元素 `<input>`

### 2.1 文本输入

```html
<!-- 单行文本 -->
<input type="text" name="username" placeholder="请输入用户名">

<!-- 密码 -->
<input type="password" name="password" placeholder="请输入密码">

<!-- 邮箱 -->
<input type="email" name="email" placeholder="example@email.com">

<!-- URL -->
<input type="url" name="website" placeholder="https://example.com">

<!-- 电话 -->
<input type="tel" name="phone" placeholder="13800138000">

<!-- 搜索 -->
<input type="search" name="q" placeholder="搜索...">
```

### 2.2 数字输入

```html
<!-- 数字 -->
<input type="number" name="age" min="0" max="120" step="1">

<!-- 范围滑块 -->
<input type="range" name="volume" min="0" max="100" value="50">

<!-- 颜色选择 -->
<input type="color" name="color" value="#ff0000">
```

### 2.3 日期时间

```html
<!-- 日期 -->
<input type="date" name="birthday">

<!-- 时间 -->
<input type="time" name="meeting-time">

<!-- 日期时间 -->
<input type="datetime-local" name="appointment">

<!-- 月份 -->
<input type="month" name="start-month">

<!-- 周 -->
<input type="week" name="week">
```

### 2.4 选择输入

```html
<!-- 单选框 -->
<input type="radio" name="gender" value="male" id="male">
<label for="male">男</label>

<input type="radio" name="gender" value="female" id="female">
<label for="female">女</label>

<!-- 复选框 -->
<input type="checkbox" name="hobby" value="reading" id="reading">
<label for="reading">阅读</label>

<input type="checkbox" name="hobby" value="sports" id="sports">
<label for="sports">运动</label>
```

### 2.5 文件上传

```html
<!-- 单文件 -->
<input type="file" name="avatar" accept="image/*">

<!-- 多文件 -->
<input type="file" name="photos" multiple accept="image/png, image/jpeg">

<!-- 指定文件类型 -->
<input type="file" name="document" accept=".pdf,.doc,.docx">
```

### 2.6 隐藏字段

```html
<input type="hidden" name="csrf_token" value="abc123">
```

### 2.7 按钮

```html
<!-- 提交按钮 -->
<input type="submit" value="提交">

<!-- 重置按钮 -->
<input type="reset" value="重置">

<!-- 普通按钮 -->
<input type="button" value="点击" onclick="alert('clicked')">

<!-- 图片按钮 -->
<input type="image" src="submit.png" alt="提交">
```

## 三、其他表单元素

### 3.1 `<textarea>` 多行文本

```html
<textarea name="comment" 
          rows="5" 
          cols="50" 
          placeholder="请输入评论...">
</textarea>
```

### 3.2 `<select>` 下拉列表

```html
<!-- 单选下拉 -->
<select name="city">
  <option value="">请选择城市</option>
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
  <option value="guangzhou" selected>广州</option>
</select>

<!-- 多选下拉 -->
<select name="skills" multiple>
  <option value="html">HTML</option>
  <option value="css">CSS</option>
  <option value="js">JavaScript</option>
</select>

<!-- 分组 -->
<select name="country">
  <optgroup label="亚洲">
    <option value="cn">中国</option>
    <option value="jp">日本</option>
  </optgroup>
  <optgroup label="欧洲">
    <option value="uk">英国</option>
    <option value="fr">法国</option>
  </optgroup>
</select>
```

### 3.3 `<button>` 按钮

```html
<!-- 提交按钮（默认） -->
<button type="submit">提交</button>

<!-- 重置按钮 -->
<button type="reset">重置</button>

<!-- 普通按钮 -->
<button type="button" onclick="handleClick()">点击</button>

<!-- 带内容的按钮 -->
<button type="submit">
  <img src="icon.png" alt=""> 提交表单
</button>
```

> **💡 `<button>` vs `<input type="button">`**  
> `<button>` 更灵活，可包含 HTML 内容（图标、图片）。

### 3.4 `<label>` 标签

```html
<!-- 关联方式1：for + id -->
<label for="username">用户名：</label>
<input type="text" id="username" name="username">

<!-- 关联方式2：嵌套 -->
<label>
  用户名：
  <input type="text" name="username">
</label>
```

> **✅ 好处**  
> 点击 label 会聚焦输入框，提升可用性和可访问性。

### 3.5 `<fieldset>` 和 `<legend>`

```html
<form>
  <fieldset>
    <legend>个人信息</legend>
    
    <label for="name">姓名：</label>
    <input type="text" id="name" name="name">
    
    <label for="age">年龄：</label>
    <input type="number" id="age" name="age">
  </fieldset>
  
  <fieldset>
    <legend>联系方式</legend>
    
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email">
    
    <label for="phone">电话：</label>
    <input type="tel" id="phone" name="phone">
  </fieldset>
</form>
```

## 四、输入属性

### 4.1 通用属性

```html
<input type="text" 
       name="username"           <!-- 表单字段名 -->
       value="默认值"            <!-- 默认值 -->
       placeholder="请输入..."   <!-- 占位符 -->
       required                  <!-- 必填 -->
       readonly                  <!-- 只读 -->
       disabled                  <!-- 禁用 -->
       autofocus                 <!-- 自动聚焦 -->
       autocomplete="off">       <!-- 禁用自动完成 -->
```

### 4.2 验证属性

```html
<!-- 必填 -->
<input type="text" name="username" required>

<!-- 最小/最大长度 -->
<input type="text" name="password" minlength="6" maxlength="20">

<!-- 数字范围 -->
<input type="number" name="age" min="18" max="65">

<!-- 正则验证 -->
<input type="text" name="phone" pattern="[0-9]{11}">

<!-- 自定义错误消息（通过 JS） -->
<input type="text" id="username" required>
<script>
document.getElementById('username').setCustomValidity('请输入用户名');
</script>
```

### 4.3 文件上传属性

```html
<input type="file" 
       name="file"
       accept="image/*"        <!-- 接受的文件类型 -->
       multiple                <!-- 多文件 -->
       capture="camera">       <!-- 移动端调用相机 -->
```

## 五、表单验证

### 5.1 HTML5 内置验证

```html
<form>
  <!-- 邮箱验证 -->
  <input type="email" required>
  
  <!-- URL 验证 -->
  <input type="url" required>
  
  <!-- 数字验证 -->
  <input type="number" min="0" max="100" required>
  
  <!-- 模式验证 -->
  <input type="text" pattern="[A-Za-z]{3,}" title="至少3个字母">
  
  <button>提交</button>
</form>
```

### 5.2 自定义验证

```html
<form id="myForm">
  <input type="text" id="username" required>
  <span id="error"></span>
  <button>提交</button>
</form>

<script>
const form = document.getElementById('myForm');
const username = document.getElementById('username');
const error = document.getElementById('error');

form.addEventListener('submit', (e) => {
  if (username.value.length < 3) {
    e.preventDefault();
    error.textContent = '用户名至少3个字符';
    username.focus();
  }
});

username.addEventListener('input', () => {
  if (username.validity.valid) {
    error.textContent = '';
  }
});
</script>
```

### 5.3 禁用验证

```html
<!-- 表单级别 -->
<form novalidate>
  <input type="email" required>
  <button>提交</button>
</form>

<!-- 按钮级别 -->
<form>
  <input type="email" required>
  <button type="submit" formnovalidate>跳过验证提交</button>
</form>
```

## 六、实战示例

### 6.1 登录表单

```html
<form action="/login" method="POST" class="login-form">
  <h2>用户登录</h2>
  
  <div class="form-group">
    <label for="email">邮箱：</label>
    <input type="email" 
           id="email" 
           name="email" 
           placeholder="example@email.com"
           required>
  </div>
  
  <div class="form-group">
    <label for="password">密码：</label>
    <input type="password" 
           id="password" 
           name="password" 
           minlength="6"
           required>
  </div>
  
  <div class="form-group">
    <label>
      <input type="checkbox" name="remember"> 记住我
    </label>
  </div>
  
  <button type="submit">登录</button>
  <a href="/forgot-password">忘记密码？</a>
</form>
```

### 6.2 注册表单

```html
<form action="/register" method="POST" enctype="multipart/form-data">
  <fieldset>
    <legend>账号信息</legend>
    
    <label for="username">用户名：</label>
    <input type="text" id="username" name="username" 
           pattern="[A-Za-z0-9_]{3,}" 
           title="3-20位字母数字下划线"
           required>
    
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email" required>
    
    <label for="password">密码：</label>
    <input type="password" id="password" name="password" 
           minlength="6" required>
  </fieldset>
  
  <fieldset>
    <legend>个人信息</legend>
    
    <label>性别：</label>
    <label><input type="radio" name="gender" value="male"> 男</label>
    <label><input type="radio" name="gender" value="female"> 女</label>
    
    <label for="birthday">生日：</label>
    <input type="date" id="birthday" name="birthday">
    
    <label for="avatar">头像：</label>
    <input type="file" id="avatar" name="avatar" accept="image/*">
  </fieldset>
  
  <label>
    <input type="checkbox" name="agree" required>
    我同意用户协议
  </label>
  
  <button type="submit">注册</button>
</form>
```

## 参考资料

- [MDN - `<form>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/form)
- [MDN - `<input>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input)
- [MDN - 表单数据验证](https://developer.mozilla.org/zh-CN/docs/Learn/Forms/Form_validation)

---

**上一章** ← [第 12 章：表格基础](./12-tables-basic.md)  
**下一章** → [第 14 章：表单控件详解](./14-form-controls.md)
