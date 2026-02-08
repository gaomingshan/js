# 表单系统：HTML 的交互模型

## 核心概念

HTML 表单是用户与服务器交互的**主要接口**，类似于后端的 API 端点。表单系统包含：
- 数据收集（表单控件）
- 数据验证（约束规则）
- 数据提交（序列化与传输）

```html
<form action="/submit" method="POST">
  <input type="text" name="username" required>
  <input type="password" name="password" required>
  <button type="submit">登录</button>
</form>
```

**后端类比**：
- `<form>` ≈ API 端点定义
- 表单控件 ≈ 请求参数
- 表单验证 ≈ 参数校验
- 表单提交 ≈ HTTP 请求

## 表单元素的完整生命周期

### 阶段 1：定义与渲染

```html
<form id="loginForm" action="/api/login" method="POST" enctype="application/x-www-form-urlencoded">
  <label for="username">用户名：</label>
  <input type="text" id="username" name="username" required minlength="3">
  
  <label for="password">密码：</label>
  <input type="password" id="password" name="password" required minlength="6">
  
  <button type="submit">登录</button>
</form>
```

**关键属性**：
- `action`：提交 URL（类似 API 路由）
- `method`：HTTP 方法（GET/POST）
- `enctype`：数据编码格式
- `name`：字段名（对应后端参数）

### 阶段 2：用户输入

```javascript
// 监听输入事件
const input = document.querySelector('#username');

input.addEventListener('input', (e) => {
  console.log('输入中:', e.target.value);
});

input.addEventListener('change', (e) => {
  console.log('输入完成:', e.target.value);
});
```

**事件触发顺序**：
```
用户输入 → input 事件（每次输入触发）
失去焦点 → change 事件（值改变才触发）
```

### 阶段 3：验证

**HTML5 原生验证**：

```html
<input type="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$">
<!-- 浏览器自动验证邮箱格式 -->
```

**JavaScript 自定义验证**：

```javascript
form.addEventListener('submit', (e) => {
  const username = form.username.value;
  
  if (username.length < 3) {
    e.preventDefault();  // 阻止提交
    alert('用户名至少 3 个字符');
  }
});
```

### 阶段 4：提交

```html
<form action="/submit" method="POST">
  <!-- 表单字段 -->
</form>
```

**提交触发**：
1. 点击 `<button type="submit">`
2. 点击 `<input type="submit">`
3. 在输入框按 Enter 键
4. JavaScript 调用 `form.submit()`

**提交过程**：
```
1. 触发 submit 事件
2. 执行原生验证
3. 序列化表单数据
4. 发送 HTTP 请求
5. 页面跳转（或 AJAX）
```

**后端类比**：类似于 RPC 调用流程：参数验证 → 序列化 → 网络传输 → 服务端处理。

## 表单验证：HTML5 原生约束 vs JS 验证

### HTML5 原生验证

#### 1. required（必填）

```html
<input type="text" name="username" required>
<!-- 提交时自动检查非空 -->
```

#### 2. type（类型验证）

```html
<!-- 邮箱验证 -->
<input type="email" name="email">
<!-- 自动检查格式：xxx@xxx.xxx -->

<!-- URL 验证 -->
<input type="url" name="website">
<!-- 自动检查格式：http://... 或 https://... -->

<!-- 数字验证 -->
<input type="number" name="age" min="18" max="100">
<!-- 限制范围 -->

<!-- 日期验证 -->
<input type="date" name="birthday" min="1900-01-01" max="2024-12-31">
```

#### 3. pattern（正则表达式）

```html
<!-- 手机号验证 -->
<input type="tel" name="phone" pattern="1[3-9]\d{9}" title="请输入正确的手机号">

<!-- 邮政编码 -->
<input type="text" name="zipcode" pattern="\d{6}" title="请输入 6 位数字">

<!-- 用户名（字母数字） -->
<input type="text" name="username" pattern="[a-zA-Z0-9]{3,20}" title="3-20位字母数字">
```

#### 4. minlength / maxlength（长度限制）

```html
<input type="text" name="username" minlength="3" maxlength="20">
<textarea name="bio" minlength="10" maxlength="500"></textarea>
```

#### 5. min / max（数值范围）

```html
<input type="number" name="quantity" min="1" max="999">
<input type="range" name="volume" min="0" max="100" step="10">
```

#### 6. step（步进值）

```html
<input type="number" name="price" step="0.01" min="0">
<!-- 只能输入小数点后两位 -->
```

### 验证状态的 CSS 伪类

```css
/* 必填字段 */
input:required {
  border-left: 3px solid red;
}

/* 可选字段 */
input:optional {
  border-left: 3px solid gray;
}

/* 验证通过 */
input:valid {
  border-color: green;
}

/* 验证失败 */
input:invalid {
  border-color: red;
}

/* 值在范围内 */
input:in-range {
  background: lightgreen;
}

/* 值超出范围 */
input:out-of-range {
  background: lightcoral;
}
```

**使用示例**：

```html
<style>
input:invalid {
  border: 2px solid red;
}

input:valid {
  border: 2px solid green;
}

input:invalid:focus {
  box-shadow: 0 0 5px red;
}
</style>

<input type="email" required placeholder="请输入邮箱">
<!-- 输入非法邮箱时显示红色边框 -->
```

### JavaScript 自定义验证

#### Constraint Validation API

```javascript
const input = document.querySelector('#email');

// 检查有效性
if (!input.validity.valid) {
  console.log('验证失败');
  
  // 详细错误信息
  if (input.validity.valueMissing) {
    console.log('必填项为空');
  }
  if (input.validity.typeMismatch) {
    console.log('类型不匹配');
  }
  if (input.validity.patternMismatch) {
    console.log('格式不正确');
  }
}

// 设置自定义错误
if (input.value === 'admin') {
  input.setCustomValidity('用户名"admin"已被占用');
} else {
  input.setCustomValidity('');  // 清除错误
}

// 显示验证消息
input.reportValidity();
```

#### validity 对象的属性

```javascript
input.validity = {
  valid: false,              // 是否有效
  valueMissing: true,        // 必填项为空
  typeMismatch: false,       // 类型不匹配
  patternMismatch: false,    // 正则不匹配
  tooLong: false,            // 超过 maxlength
  tooShort: false,           // 小于 minlength
  rangeUnderflow: false,     // 小于 min
  rangeOverflow: false,      // 大于 max
  stepMismatch: false,       // 不符合 step
  badInput: false,           // 浏览器无法转换的输入
  customError: false         // 自定义错误
};
```

#### 完整的表单验证示例

```javascript
const form = document.querySelector('#registrationForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // 清除之前的错误
  clearErrors();
  
  // 自定义验证规则
  const username = form.username.value;
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  
  let isValid = true;
  
  // 用户名唯一性检查（异步）
  if (!checkUsernameAvailable(username)) {
    showError(form.username, '用户名已存在');
    isValid = false;
  }
  
  // 密码一致性检查
  if (password !== confirmPassword) {
    showError(form.confirmPassword, '两次密码不一致');
    isValid = false;
  }
  
  // 通过验证，提交表单
  if (isValid && form.checkValidity()) {
    submitForm(new FormData(form));
  }
});

function showError(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();
}

function clearErrors() {
  form.querySelectorAll('input').forEach(input => {
    input.setCustomValidity('');
  });
}
```

**后端类比**：
- HTML5 验证 ≈ 数据库约束（NOT NULL, CHECK）
- JavaScript 验证 ≈ 业务逻辑验证

## 表单提交的数据序列化机制

### enctype 属性

决定表单数据的编码方式：

#### 1. application/x-www-form-urlencoded（默认）

```html
<form action="/submit" method="POST">
  <input name="username" value="admin">
  <input name="password" value="123456">
</form>
```

**序列化结果**：
```
POST /submit HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=admin&password=123456
```

**特点**：
- 键值对格式
- 特殊字符 URL 编码
- 适合简单表单

**后端解析**：
```javascript
// Express
app.use(express.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
  console.log(req.body);
  // { username: 'admin', password: '123456' }
});
```

#### 2. multipart/form-data（文件上传）

```html
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar">
  <input type="text" name="description">
</form>
```

**序列化结果**：
```
POST /upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

(binary data)
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="description"

个人照片
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**特点**：
- 支持二进制数据
- 每个字段一个部分
- 必须用于文件上传

**后端解析**：
```javascript
// Express + multer
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('avatar'), (req, res) => {
  console.log(req.file);  // 文件信息
  console.log(req.body);  // 其他字段
});
```

#### 3. text/plain（纯文本）

```html
<form action="/submit" method="POST" enctype="text/plain">
  <input name="username" value="admin">
  <input name="password" value="123456">
</form>
```

**序列化结果**：
```
POST /submit HTTP/1.1
Content-Type: text/plain

username=admin
password=123456
```

**特点**：
- 每行一个字段
- 不适合生产环境
- 主要用于调试

### FormData API

```javascript
const form = document.querySelector('#myForm');
const formData = new FormData(form);

// 添加字段
formData.append('extra', 'value');

// 读取字段
console.log(formData.get('username'));

// 遍历所有字段
for (let [key, value] of formData.entries()) {
  console.log(key, value);
}

// AJAX 提交
fetch('/submit', {
  method: 'POST',
  body: formData  // 自动设置 Content-Type
});
```

**手动创建 FormData**：

```javascript
const formData = new FormData();
formData.append('username', 'admin');
formData.append('password', '123456');
formData.append('avatar', fileInput.files[0]);

// 提交
fetch('/submit', {
  method: 'POST',
  body: formData
});
```

### 序列化为 JSON

```javascript
function formToJSON(form) {
  const formData = new FormData(form);
  const json = {};
  
  for (let [key, value] of formData.entries()) {
    json[key] = value;
  }
  
  return json;
}

// 使用
const json = formToJSON(form);
fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(json)
});
```

**后端类比**：
- URL 编码 ≈ 查询字符串
- multipart ≈ 流式上传
- JSON ≈ RESTful API

## 后端视角：表单 ≈ API 请求体

### HTTP 方法的对应

```html
<!-- GET：查询操作 -->
<form action="/search" method="GET">
  <input name="q" placeholder="搜索">
</form>
<!-- URL: /search?q=keyword -->

<!-- POST：创建操作 -->
<form action="/users" method="POST">
  <input name="username">
  <input name="email">
</form>
<!-- 请求体: username=...&email=... -->
```

**RESTful 映射**：

| HTTP 方法 | 表单 method | 操作 |
|-----------|-------------|------|
| GET | GET | 查询 |
| POST | POST | 创建 |
| PUT | POST + `<input name="_method" value="PUT">` | 更新 |
| DELETE | POST + `<input name="_method" value="DELETE">` | 删除 |

**后端路由**：

```javascript
// Express
app.get('/search', (req, res) => {
  const keyword = req.query.q;  // GET 参数
  // 执行搜索
});

app.post('/users', (req, res) => {
  const { username, email } = req.body;  // POST 数据
  // 创建用户
});
```

### 表单与 API 设计的对应关系

```html
<!-- 表单定义 -->
<form action="/api/articles" method="POST">
  <input name="title" required>
  <textarea name="content" required></textarea>
  <select name="category">
    <option value="tech">技术</option>
    <option value="life">生活</option>
  </select>
  <input type="checkbox" name="tags" value="html"> HTML
  <input type="checkbox" name="tags" value="css"> CSS
</form>
```

**对应的 API Schema**：

```typescript
// TypeScript 接口定义
interface CreateArticleRequest {
  title: string;      // 对应 input[name="title"]
  content: string;    // 对应 textarea[name="content"]
  category: 'tech' | 'life';  // 对应 select[name="category"]
  tags: string[];     // 对应 input[name="tags"]（多选）
}

// 后端处理
app.post('/api/articles', (req, res) => {
  const article: CreateArticleRequest = req.body;
  
  // 验证（类似前端验证）
  if (!article.title || article.title.length < 3) {
    return res.status(400).json({ error: 'Title too short' });
  }
  
  // 保存到数据库
  db.articles.insert(article);
  res.json({ success: true });
});
```

## 常见误区

### 误区 1：所有提交都用 JavaScript

**错误做法**：

```html
<form onsubmit="return false;">
  <input id="username">
  <button onclick="submitForm()">提交</button>
</form>

<script>
function submitForm() {
  const username = document.getElementById('username').value;
  fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify({ username })
  });
}
</script>
```

**问题**：
- 失去原生表单功能（验证、自动完成）
- 增加代码复杂度
- 可访问性下降

**正确做法**：

```html
<form action="/submit" method="POST">
  <input name="username" required>
  <button type="submit">提交</button>
</form>

<script>
// 渐进式增强
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // AJAX 提交
  fetch(form.action, {
    method: form.method,
    body: new FormData(form)
  });
});
</script>
```

### 误区 2：忽略表单验证

**错误做法**：

```html
<form action="/submit">
  <input name="email">  <!-- 无验证 -->
  <button>提交</button>
</form>
```

**问题**：
- 用户输入错误数据
- 后端需要处理无效请求
- 用户体验差

**正确做法**：

```html
<form action="/submit">
  <input type="email" name="email" required>
  <!-- 浏览器自动验证邮箱格式 -->
  <button>提交</button>
</form>
```

### 误区 3：button 不指定 type

**错误做法**：

```html
<form>
  <button>提交</button>  <!-- type 默认是 submit -->
  <button>取消</button>  <!-- 也会提交表单！ -->
</form>
```

**正确做法**：

```html
<form>
  <button type="submit">提交</button>
  <button type="button" onclick="cancel()">取消</button>
  <button type="reset">重置</button>
</form>
```

## 工程实践示例

### 场景 1：注册表单（完整示例）

```html
<form id="registrationForm" action="/api/register" method="POST" novalidate>
  <div>
    <label for="username">用户名：</label>
    <input 
      type="text" 
      id="username" 
      name="username" 
      required 
      minlength="3" 
      maxlength="20"
      pattern="[a-zA-Z0-9_]+"
      title="3-20位字母数字下划线"
    >
    <span class="error"></span>
  </div>
  
  <div>
    <label for="email">邮箱：</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required
    >
    <span class="error"></span>
  </div>
  
  <div>
    <label for="password">密码：</label>
    <input 
      type="password" 
      id="password" 
      name="password" 
      required 
      minlength="6"
    >
    <span class="error"></span>
  </div>
  
  <div>
    <label for="confirmPassword">确认密码：</label>
    <input 
      type="password" 
      id="confirmPassword" 
      name="confirmPassword" 
      required
    >
    <span class="error"></span>
  </div>
  
  <div>
    <label>
      <input type="checkbox" name="agree" required>
      我同意服务条款
    </label>
  </div>
  
  <button type="submit">注册</button>
</form>

<script>
const form = document.getElementById('registrationForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 清除错误
  form.querySelectorAll('.error').forEach(el => el.textContent = '');
  
  // 密码一致性验证
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  
  if (password !== confirmPassword) {
    showError(form.confirmPassword, '两次密码不一致');
    return;
  }
  
  // 原生验证
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // 提交
  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: new FormData(form)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('注册成功');
      location.href = '/login';
    } else {
      showError(form.username, result.error);
    }
  } catch (error) {
    alert('网络错误');
  }
});

function showError(input, message) {
  const errorSpan = input.parentElement.querySelector('.error');
  errorSpan.textContent = message;
  input.focus();
}
</script>
```

### 场景 2：文件上传表单

```html
<form id="uploadForm" action="/api/upload" method="POST" enctype="multipart/form-data">
  <div>
    <label for="file">选择文件：</label>
    <input type="file" id="file" name="file" accept="image/*" required>
  </div>
  
  <div>
    <label for="description">描述：</label>
    <textarea id="description" name="description" maxlength="200"></textarea>
  </div>
  
  <div id="preview"></div>
  
  <div id="progress" style="display: none;">
    <progress value="0" max="100"></progress>
    <span id="percent">0%</span>
  </div>
  
  <button type="submit">上传</button>
</form>

<script>
const fileInput = document.getElementById('file');
const preview = document.getElementById('preview');
const progressBar = document.querySelector('progress');
const percent = document.getElementById('percent');

// 文件预览
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // 验证文件大小
  if (file.size > 5 * 1024 * 1024) {
    alert('文件大小不能超过 5MB');
    fileInput.value = '';
    return;
  }
  
  // 预览图片
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px;">`;
  };
  reader.readAsDataURL(file);
});

// 上传
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(uploadForm);
  
  // 显示进度条
  document.getElementById('progress').style.display = 'block';
  
  // XMLHttpRequest 支持进度事件
  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      progressBar.value = percentComplete;
      percent.textContent = Math.round(percentComplete) + '%';
    }
  });
  
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      const result = JSON.parse(xhr.responseText);
      alert('上传成功：' + result.url);
    } else {
      alert('上传失败');
    }
  });
  
  xhr.open('POST', uploadForm.action);
  xhr.send(formData);
});
</script>
```

### 场景 3：后端表单验证

```javascript
// Express + express-validator
const { body, validationResult } = require('express-validator');

app.post('/api/register',
  // 验证规则（对应前端表单）
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度为 3-20 位')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母数字下划线')
    .custom(async (value) => {
      const user = await db.users.findOne({ username: value });
      if (user) {
        throw new Error('用户名已存在');
      }
    }),
  
  body('email')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少 6 位'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('两次密码不一致');
      }
      return true;
    }),
  
  // 处理函数
  async (req, res) => {
    // 检查验证结果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // 创建用户
    const user = await db.users.create({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword(req.body.password)
    });
    
    res.json({ success: true, userId: user.id });
  }
);
```

## 深入一点：表单的可访问性

### ARIA 属性增强

```html
<form>
  <div role="group" aria-labelledby="address-label">
    <span id="address-label">地址信息</span>
    
    <label for="street">街道：</label>
    <input 
      id="street" 
      name="street" 
      aria-required="true"
      aria-describedby="street-help"
    >
    <span id="street-help" class="help-text">
      请输入详细地址
    </span>
  </div>
  
  <div role="alert" aria-live="polite" id="error-message"></div>
</form>
```

### 键盘导航

```javascript
// 确保表单可以完全通过键盘操作
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    // 移动到下一个输入框
    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    const index = inputs.indexOf(e.target);
    if (index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  }
});
```

## 参考资源

- [HTML Living Standard - Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [MDN - HTML Forms](https://developer.mozilla.org/en-US/docs/Learn/Forms)
- [MDN - Form Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
- [W3C - WCAG Forms](https://www.w3.org/WAI/tutorials/forms/)
