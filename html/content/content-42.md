# 表单实战模式

## 核心概念

本节聚焦表单的**实际应用模式**，补充正文 content-8（表单系统）中未覆盖的控件细节、布局结构、文件上传和后端对接实践。

**后端类比**：表单 HTML 结构 ≈ API 请求体的 Schema 定义，每个控件 ≈ 一个请求参数。

## 表单控件完整参考

### input 类型速查

| type | 用途 | 示例值 | 后端对应 |
|------|------|--------|---------|
| `text` | 单行文本 | "张三" | String |
| `password` | 密码 | "••••" | String |
| `email` | 邮箱 | "a@b.com" | String（含格式校验） |
| `url` | URL | "https://..." | String（含格式校验） |
| `tel` | 电话 | "13800138000" | String |
| `number` | 数值 | "42" | Number |
| `range` | 滑块 | "50" | Number |
| `date` | 日期 | "2024-01-15" | Date / String |
| `time` | 时间 | "14:30" | Time / String |
| `datetime-local` | 日期时间 | "2024-01-15T14:30" | DateTime |
| `month` | 年月 | "2024-01" | String |
| `week` | 年周 | "2024-W03" | String |
| `color` | 颜色选择器 | "#3b82f6" | String |
| `search` | 搜索框 | "关键词" | String |
| `file` | 文件上传 | File 对象 | MultipartFile |
| `hidden` | 隐藏字段 | "token123" | String |
| `checkbox` | 复选框 | "on" / 多个值 | Boolean / List |
| `radio` | 单选 | 选中项的 value | String / Enum |

### text 类控件的关键属性

```html
<input type="text"
  name="username"
  id="username"
  value=""
  placeholder="请输入用户名"
  required                  
  minlength="3"             
  maxlength="20"            
  pattern="[a-zA-Z0-9_]+"  
  autocomplete="username"   
  spellcheck="false"        
  autofocus                 
  readonly                  
  disabled                  
>
```

**`name` vs `id`**：
- `name`：提交时的参数名（后端接收用）
- `id`：DOM 标识（`<label for="">` 关联用）
- 两者可以相同，但职责不同

### number 与 range

```html
<!-- 数值输入 -->
<label for="quantity">数量：</label>
<input type="number" id="quantity" name="quantity"
  min="1" max="99" step="1" value="1">

<!-- 滑块 -->
<label for="volume">音量：<output id="vol-output">50</output>%</label>
<input type="range" id="volume" name="volume"
  min="0" max="100" step="5" value="50"
  oninput="document.getElementById('vol-output').textContent = this.value">
```

### date 系列

```html
<!-- 日期 -->
<input type="date" name="birthday" min="1950-01-01" max="2010-12-31">

<!-- 日期时间 -->
<input type="datetime-local" name="meeting" 
  min="2024-01-01T08:00" max="2024-12-31T18:00">

<!-- 时间 -->
<input type="time" name="alarm" min="06:00" max="22:00" step="900">
<!-- step="900" 即 15 分钟间隔 -->

<!-- 月份 -->
<input type="month" name="expiry" min="2024-01" max="2030-12">
```

**注意**：日期控件的 UI 由浏览器原生渲染，各浏览器样式差异很大。生产环境中通常使用 JS 日期选择器库保证一致性，但 HTML 原生控件在移动端体验很好（调起系统日期选择器）。

### select 下拉选择

```html
<!-- 基础下拉 -->
<label for="city">城市：</label>
<select id="city" name="city" required>
  <option value="" disabled selected>请选择城市</option>
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
  <option value="shenzhen">深圳</option>
</select>

<!-- 分组下拉 -->
<select name="car">
  <optgroup label="德系">
    <option value="bmw">宝马</option>
    <option value="benz">奔驰</option>
  </optgroup>
  <optgroup label="日系">
    <option value="toyota">丰田</option>
    <option value="honda">本田</option>
  </optgroup>
</select>

<!-- 多选（按住 Ctrl/Cmd） -->
<select name="skills" multiple size="5">
  <option value="html">HTML</option>
  <option value="css">CSS</option>
  <option value="js">JavaScript</option>
  <option value="react">React</option>
  <option value="vue">Vue</option>
</select>
```

### datalist：输入建议

```html
<label for="browser">浏览器：</label>
<input type="text" id="browser" name="browser" list="browsers">
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
  <option value="Edge">
</datalist>
```

`<datalist>` 提供输入建议但不限制输入——用户可以选择建议项，也可以输入任意值。与 `<select>` 的区别是用户不受限于预设选项。

**后端类比**：`<select>` ≈ 枚举类型（Enum），`<datalist>` ≈ 带自动补全的自由文本。

### textarea 多行文本

```html
<label for="bio">个人简介：</label>
<textarea id="bio" name="bio"
  rows="5"
  cols="40"
  maxlength="500"
  placeholder="请介绍自己..."
  required
></textarea>
```

**注意**：`<textarea>` 的默认值写在标签内部，不是 `value` 属性：

```html
<!-- ❌ -->
<textarea value="默认内容"></textarea>

<!-- ✅ -->
<textarea>默认内容</textarea>
```

### checkbox 与 radio

```html
<!-- 复选框 -->
<fieldset>
  <legend>兴趣爱好</legend>
  <label>
    <input type="checkbox" name="hobbies" value="reading"> 阅读
  </label>
  <label>
    <input type="checkbox" name="hobbies" value="coding"> 编程
  </label>
  <label>
    <input type="checkbox" name="hobbies" value="music"> 音乐
  </label>
</fieldset>

<!-- 单选按钮 -->
<fieldset>
  <legend>性别</legend>
  <label>
    <input type="radio" name="gender" value="male" required> 男
  </label>
  <label>
    <input type="radio" name="gender" value="female"> 女
  </label>
  <label>
    <input type="radio" name="gender" value="other"> 其他
  </label>
</fieldset>
```

**关键**：
- 同名 `radio` 构成一组，只能选一个
- 同名 `checkbox` 可选多个，提交时为数组
- 用 `<fieldset>` + `<legend>` 分组，提供可访问性上下文

## 表单布局的典型 HTML 结构

### 垂直布局（最常见）

```html
<form action="/api/register" method="POST">
  <div class="form-group">
    <label for="name">姓名</label>
    <input type="text" id="name" name="name" required>
    <p class="help-text">请填写真实姓名</p>
  </div>

  <div class="form-group">
    <label for="email">邮箱</label>
    <input type="email" id="email" name="email" required
      aria-describedby="email-help">
    <p class="help-text" id="email-help">用于接收验证邮件</p>
  </div>

  <div class="form-group">
    <label for="password">密码</label>
    <input type="password" id="password" name="password" 
      required minlength="8"
      aria-describedby="pwd-rules">
    <ul class="help-text" id="pwd-rules">
      <li>至少 8 个字符</li>
      <li>包含大小写字母和数字</li>
    </ul>
  </div>

  <div class="form-actions">
    <button type="submit">注册</button>
    <button type="reset">重置</button>
  </div>
</form>
```

### label 与 input 的关联

```html
<!-- 方式 1：for/id 关联（推荐） -->
<label for="username">用户名</label>
<input type="text" id="username" name="username">

<!-- 方式 2：嵌套关联 -->
<label>
  用户名
  <input type="text" name="username">
</label>
```

**为什么 label 关联很重要**：
- 点击 label 时自动聚焦到对应 input（扩大点击区域）
- 屏幕阅读器读到 input 时会播报关联的 label 文本
- 没有关联的 input，屏幕阅读器只会读出"编辑框"

### 表单分区：fieldset + legend

```html
<form>
  <fieldset>
    <legend>基本信息</legend>
    <div class="form-group">
      <label for="name">姓名</label>
      <input type="text" id="name" name="name">
    </div>
    <div class="form-group">
      <label for="email">邮箱</label>
      <input type="email" id="email" name="email">
    </div>
  </fieldset>

  <fieldset>
    <legend>收货地址</legend>
    <div class="form-group">
      <label for="province">省份</label>
      <select id="province" name="province">
        <option value="">请选择</option>
      </select>
    </div>
    <div class="form-group">
      <label for="address">详细地址</label>
      <textarea id="address" name="address"></textarea>
    </div>
  </fieldset>

  <button type="submit">提交订单</button>
</form>
```

**后端类比**：`<fieldset>` ≈ 请求体中的嵌套对象。"基本信息" → `{ name, email }`，"收货地址" → `{ province, address }`。

## 文件上传

### 单文件上传

```html
<form action="/api/upload" method="POST" enctype="multipart/form-data">
  <label for="avatar">头像：</label>
  <input type="file" id="avatar" name="avatar"
    accept="image/png, image/jpeg, image/webp"
  >
  <button type="submit">上传</button>
</form>
```

**关键属性**：
- `enctype="multipart/form-data"`：文件上传**必须**使用此编码
- `accept`：限制文件类型（MIME 类型或扩展名）

### 多文件上传

```html
<input type="file" name="photos" multiple
  accept="image/*">
```

`multiple` 允许选择多个文件。`accept="image/*"` 接受所有图片类型。

### 拖拽上传的 HTML 结构

```html
<div class="upload-zone" 
     role="button" 
     tabindex="0"
     aria-label="拖拽文件到此处上传，或点击选择文件">
  <input type="file" id="file-input" name="files" multiple
    accept=".pdf,.doc,.docx" hidden>
  
  <div class="upload-placeholder">
    <p>拖拽文件到此处</p>
    <p>或 <label for="file-input" class="upload-link">点击选择文件</label></p>
    <p><small>支持 PDF、DOC 格式，单文件最大 10MB</small></p>
  </div>
  
  <ul class="file-list" aria-live="polite">
    <!-- JS 动态插入文件列表 -->
  </ul>
</div>
```

```javascript
const zone = document.querySelector('.upload-zone');
const input = document.getElementById('file-input');

// 拖拽事件
zone.addEventListener('dragover', (e) => {
  e.preventDefault();
  zone.classList.add('drag-over');
});

zone.addEventListener('dragleave', () => {
  zone.classList.remove('drag-over');
});

zone.addEventListener('drop', (e) => {
  e.preventDefault();
  zone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

// 点击选择
input.addEventListener('change', () => {
  handleFiles(input.files);
});

function handleFiles(files) {
  const formData = new FormData();
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} 超过 10MB 限制`);
      continue;
    }
    formData.append('files', file);
  }
  // 上传到后端
  fetch('/api/upload', { method: 'POST', body: formData });
}
```

### 文件上传预览

```javascript
function previewImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.alt = file.name;
    img.style.maxWidth = '200px';
    document.querySelector('.preview').appendChild(img);
  };
  reader.readAsDataURL(file);
}
```

## 表单验证

### HTML5 原生验证属性

```html
<input type="text" required>                    <!-- 必填 -->
<input type="text" minlength="3" maxlength="20"> <!-- 长度范围 -->
<input type="number" min="1" max="100">          <!-- 数值范围 -->
<input type="text" pattern="[A-Za-z]{3,}">       <!-- 正则 -->
<input type="email">                             <!-- 自带邮箱格式校验 -->
<input type="url">                               <!-- 自带 URL 格式校验 -->
```

### 自定义验证消息

```javascript
const input = document.getElementById('username');

input.addEventListener('invalid', (e) => {
  if (input.validity.valueMissing) {
    input.setCustomValidity('用户名不能为空');
  } else if (input.validity.tooShort) {
    input.setCustomValidity('用户名至少 3 个字符');
  } else if (input.validity.patternMismatch) {
    input.setCustomValidity('用户名只能包含字母、数字和下划线');
  }
});

input.addEventListener('input', () => {
  input.setCustomValidity('');  // 清除自定义消息，触发重新验证
});
```

### CSS 验证状态样式

```css
/* 有效输入 */
input:valid {
  border-color: #10b981;
}

/* 无效输入 */
input:invalid {
  border-color: #ef4444;
}

/* 仅在用户交互后显示状态（避免页面加载时全红） */
input:user-invalid {
  border-color: #ef4444;
}

/* 或使用 JS 添加 class */
input.touched:invalid {
  border-color: #ef4444;
}
```

### 禁用原生验证（使用 JS 验证时）

```html
<form novalidate>
  <!-- 完全由 JS 控制验证 -->
</form>
```

## FormData 与后端对接

### FormData 基本用法

```javascript
const form = document.getElementById('myForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // 方式 1：从 form 元素创建
  const formData = new FormData(form);

  // 方式 2：手动构建
  const formData2 = new FormData();
  formData2.append('username', 'zhangsan');
  formData2.append('avatar', fileInput.files[0]);

  // 读取 FormData
  console.log(formData.get('username'));
  console.log(formData.getAll('hobbies'));  // 多选值

  // 转为普通对象
  const data = Object.fromEntries(formData.entries());

  // 发送到后端
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData,  // 自动设置 Content-Type: multipart/form-data
  });
});
```

### 不同 Content-Type 的对接

```javascript
// 1. JSON 格式（最常用的 API 对接）
const data = Object.fromEntries(new FormData(form).entries());
fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// 2. FormData 格式（文件上传时用）
fetch('/api/upload', {
  method: 'POST',
  body: new FormData(form),
  // 注意：不要手动设置 Content-Type，浏览器会自动添加 boundary
});

// 3. URL 编码格式（传统表单）
fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams(new FormData(form)),
});
```

**后端对应**：

```java
// Spring Boot
@PostMapping("/api/submit")
// JSON → @RequestBody
public Result submit(@RequestBody UserDTO user) { }

// FormData → @RequestParam 或 @ModelAttribute
public Result upload(@RequestParam("avatar") MultipartFile file) { }

// URL 编码 → @RequestParam
public Result login(@RequestParam String username, @RequestParam String password) { }
```

## 表单联动与动态字段

### 省市区联动

```html
<fieldset>
  <legend>收货地址</legend>
  
  <div class="form-group">
    <label for="province">省份</label>
    <select id="province" name="province" required>
      <option value="">请选择省份</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="city">城市</label>
    <select id="city" name="city" required disabled>
      <option value="">请先选择省份</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="district">区县</label>
    <select id="district" name="district" required disabled>
      <option value="">请先选择城市</option>
    </select>
  </div>
</fieldset>
```

```javascript
document.getElementById('province').addEventListener('change', async (e) => {
  const citySelect = document.getElementById('city');
  const districtSelect = document.getElementById('district');
  
  if (!e.target.value) {
    citySelect.disabled = true;
    districtSelect.disabled = true;
    return;
  }

  const cities = await fetch(`/api/cities?province=${e.target.value}`).then(r => r.json());
  
  citySelect.innerHTML = '<option value="">请选择城市</option>' +
    cities.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
  citySelect.disabled = false;
  districtSelect.disabled = true;
  districtSelect.innerHTML = '<option value="">请先选择城市</option>';
});
```

### 条件显示字段

```html
<div class="form-group">
  <label for="contact-method">联系方式</label>
  <select id="contact-method" name="contactMethod">
    <option value="email">邮箱</option>
    <option value="phone">电话</option>
    <option value="wechat">微信</option>
  </select>
</div>

<!-- 根据选择动态显示 -->
<div class="form-group" id="email-field">
  <label for="email">邮箱地址</label>
  <input type="email" id="email" name="email">
</div>

<div class="form-group" id="phone-field" hidden>
  <label for="phone">手机号码</label>
  <input type="tel" id="phone" name="phone">
</div>

<div class="form-group" id="wechat-field" hidden>
  <label for="wechat">微信号</label>
  <input type="text" id="wechat" name="wechat">
</div>
```

```javascript
document.getElementById('contact-method').addEventListener('change', (e) => {
  const fields = ['email', 'phone', 'wechat'];
  fields.forEach(f => {
    const el = document.getElementById(`${f}-field`);
    const input = el.querySelector('input');
    if (f === e.target.value) {
      el.hidden = false;
      input.required = true;
    } else {
      el.hidden = true;
      input.required = false;
      input.value = '';
    }
  });
});
```

**关键**：隐藏字段时同时移除 `required`，否则隐藏的必填字段会阻止表单提交。

## 常见误区

### 误区 1：不关联 label

```html
<!-- ❌ label 与 input 无关联 -->
<label>用户名</label>
<input type="text" name="username">

<!-- ✅ 使用 for/id 关联 -->
<label for="username">用户名</label>
<input type="text" id="username" name="username">
```

### 误区 2：所有按钮都用 type="submit"

```html
<!-- ❌ 非提交按钮也用 submit，意外触发表单提交 -->
<form>
  <input type="text" name="search">
  <button>搜索</button>  <!-- 默认 type="submit" -->
  <button onclick="clearForm()">清除</button>  <!-- 也会触发提交！ -->
</form>

<!-- ✅ 非提交按钮显式声明 type="button" -->
<form>
  <input type="text" name="search">
  <button type="submit">搜索</button>
  <button type="button" onclick="clearForm()">清除</button>
</form>
```

`<button>` 在 `<form>` 内的默认 type 是 `submit`。这是后端开发者最常踩的坑之一。

### 误区 3：文件上传不设 enctype

```html
<!-- ❌ 默认 enctype 无法传输文件 -->
<form action="/upload" method="POST">
  <input type="file" name="doc">
  <button type="submit">上传</button>
</form>

<!-- ✅ 文件上传必须用 multipart/form-data -->
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="doc">
  <button type="submit">上传</button>
</form>
```

### 误区 4：忽略 autocomplete

```html
<!-- 登录表单应设置 autocomplete，帮助密码管理器识别 -->
<form>
  <input type="text" name="username" autocomplete="username">
  <input type="password" name="password" autocomplete="current-password">
</form>

<!-- 注册表单 -->
<form>
  <input type="password" name="new-password" autocomplete="new-password">
</form>

<!-- 支付表单 -->
<input type="text" name="cc-number" autocomplete="cc-number">
<input type="text" name="cc-exp" autocomplete="cc-exp">
```

## 参考资源

- [HTML Living Standard - Forms](https://html.spec.whatwg.org/multipage/forms.html)
- [MDN - `<input>` Types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
- [MDN - FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Web.dev - Learn Forms](https://web.dev/learn/forms/)
- [MDN - Autocomplete Values](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)
