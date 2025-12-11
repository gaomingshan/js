# 第 14 章：表单控件详解

## 概述

深入理解各种表单控件的用法和特性，掌握现代表单开发技巧。

## 一、新增输入类型（HTML5）

### 1.1 email 类型

```html
<label for="email">邮箱：</label>
<input type="email" 
       id="email" 
       name="email"
       placeholder="user@example.com"
       required
       multiple>  <!-- 允许多个邮箱，逗号分隔 -->
```

**自动验证：**
- 格式：`xxx@xxx.xxx`
- 多邮箱：`email1@example.com, email2@example.com`

### 1.2 url 类型

```html
<label for="website">网站：</label>
<input type="url" 
       id="website" 
       name="website"
       placeholder="https://example.com"
       required>
```

**自动验证：**
- 必须包含协议：`https://`

### 1.3 tel 类型

```html
<label for="phone">电话：</label>
<input type="tel" 
       id="phone" 
       name="phone"
       pattern="[0-9]{11}"
       placeholder="13800138000">
```

> **💡 提示**  
> `tel` 在移动端会调起数字键盘，但不做格式验证。

### 1.4 search 类型

```html
<label for="search">搜索：</label>
<input type="search" 
       id="search" 
       name="q"
       placeholder="输入关键词...">
```

**特性：**
- 某些浏览器显示清除按钮 ×
- 移动端优化的键盘

### 1.5 number 类型

```html
<label for="quantity">数量：</label>
<input type="number" 
       id="quantity" 
       name="quantity"
       min="1"
       max="100"
       step="1"
       value="1">
```

**属性：**
- `min`：最小值
- `max`：最大值
- `step`：步进值（默认1）

```html
<!-- 小数 -->
<input type="number" min="0" max="1" step="0.01" value="0.5">

<!-- 禁止手动输入（只能用按钮调整） -->
<input type="number" readonly onclick="this.stepUp()">
```

### 1.6 range 类型

```html
<label for="volume">音量：</label>
<input type="range" 
       id="volume" 
       name="volume"
       min="0"
       max="100"
       value="50"
       step="5">
<output id="volumeValue">50</output>

<script>
const range = document.getElementById('volume');
const output = document.getElementById('volumeValue');

range.addEventListener('input', () => {
  output.textContent = range.value;
});
</script>
```

### 1.7 color 类型

```html
<label for="color">选择颜色：</label>
<input type="color" 
       id="color" 
       name="color"
       value="#ff0000">
```

**返回值：**
- 十六进制颜色码：`#rrggbb`

### 1.8 date/time 类型

```html
<!-- 日期 -->
<input type="date" name="birthday" min="1900-01-01" max="2024-12-31">

<!-- 时间 -->
<input type="time" name="time" min="09:00" max="18:00" step="900">  <!-- 15分钟间隔 -->

<!-- 日期时间 -->
<input type="datetime-local" name="meeting">

<!-- 月份 -->
<input type="month" name="month">

<!-- 周 -->
<input type="week" name="week">
```

## 二、文件上传详解

### 2.1 基本用法

```html
<label for="file">选择文件：</label>
<input type="file" 
       id="file" 
       name="file">
```

### 2.2 accept 属性

```html
<!-- 只接受图片 -->
<input type="file" accept="image/*">

<!-- 指定具体类型 -->
<input type="file" accept="image/png, image/jpeg">

<!-- 接受文档 -->
<input type="file" accept=".pdf,.doc,.docx">

<!-- 接受视频 -->
<input type="file" accept="video/*">
```

### 2.3 multiple 属性

```html
<!-- 多文件上传 -->
<input type="file" name="photos" multiple accept="image/*">
```

### 2.4 capture 属性（移动端）

```html
<!-- 调用相机 -->
<input type="file" accept="image/*" capture="camera">

<!-- 调用摄像头 -->
<input type="file" accept="video/*" capture="camcorder">

<!-- 调用录音 -->
<input type="file" accept="audio/*" capture="microphone">
```

### 2.5 JavaScript 处理

```html
<input type="file" id="fileInput" multiple>
<div id="preview"></div>

<script>
const input = document.getElementById('fileInput');
const preview = document.getElementById('preview');

input.addEventListener('change', (e) => {
  const files = e.target.files;
  
  // 清空预览
  preview.innerHTML = '';
  
  // 遍历文件
  Array.from(files).forEach(file => {
    // 文件信息
    console.log('文件名:', file.name);
    console.log('大小:', file.size, 'bytes');
    console.log('类型:', file.type);
    
    // 图片预览
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '200px';
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
});
</script>
```

## 三、datalist（数据列表）

### 3.1 基本用法

```html
<label for="browser">选择浏览器：</label>
<input type="text" 
       id="browser" 
       name="browser"
       list="browsers">

<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
  <option value="Edge">
  <option value="Opera">
</datalist>
```

**特性：**
- 可输入自定义值
- 显示建议列表
- 支持模糊搜索

### 3.2 实战应用

```html
<!-- 城市选择 -->
<label for="city">城市：</label>
<input type="text" id="city" list="cities" placeholder="输入城市名">
<datalist id="cities">
  <option value="北京">
  <option value="上海">
  <option value="广州">
  <option value="深圳">
</datalist>

<!-- 带描述的选项 -->
<input type="text" list="products">
<datalist id="products">
  <option value="iPhone 15 Pro" label="¥7999">
  <option value="MacBook Pro" label="¥12999">
  <option value="iPad Air" label="¥4799">
</datalist>
```

## 四、output 元素

### 4.1 计算结果显示

```html
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
  <input type="number" id="a" value="0"> +
  <input type="number" id="b" value="0"> =
  <output name="result" for="a b">0</output>
</form>
```

### 4.2 实战示例

```html
<form>
  <label for="price">单价：</label>
  <input type="number" id="price" value="100" min="0"> 元
  
  <label for="quantity">数量：</label>
  <input type="number" id="quantity" value="1" min="1">
  
  <p>
    总价：<output id="total">100</output> 元
  </p>
</form>

<script>
const price = document.getElementById('price');
const quantity = document.getElementById('quantity');
const total = document.getElementById('total');

function updateTotal() {
  total.value = price.value * quantity.value;
}

price.addEventListener('input', updateTotal);
quantity.addEventListener('input', updateTotal);
</script>
```

## 五、progress 和 meter

### 5.1 progress（进度条）

```html
<!-- 确定进度 -->
<label for="upload">上传进度：</label>
<progress id="upload" value="70" max="100">70%</progress>

<!-- 不确定进度 -->
<progress></progress>
```

```javascript
// 动态更新
const progress = document.getElementById('upload');
let value = 0;

const interval = setInterval(() => {
  value += 10;
  progress.value = value;
  
  if (value >= 100) {
    clearInterval(interval);
  }
}, 500);
```

### 5.2 meter（度量）

```html
<!-- 基本用法 -->
<label>磁盘使用：</label>
<meter value="60" min="0" max="100">60%</meter>

<!-- 带优化区间 -->
<meter value="0.6" 
       min="0" 
       max="1"
       low="0.3"      <!-- 低值阈值 -->
       high="0.8"     <!-- 高值阈值 -->
       optimum="0.5"  <!-- 最优值 -->
>60%</meter>
```

**颜色规则：**
- 绿色：值在最优区间
- 黄色：值在警告区间
- 红色：值在危险区间

## 六、contenteditable

### 6.1 可编辑内容

```html
<div contenteditable="true" style="border: 1px solid #ddd; padding: 10px;">
  这段文字可以编辑
</div>

<!-- 获取内容 -->
<button onclick="getContent()">获取内容</button>

<script>
function getContent() {
  const div = document.querySelector('[contenteditable]');
  console.log('HTML:', div.innerHTML);
  console.log('文本:', div.textContent);
}
</script>
```

### 6.2 富文本编辑

```html
<div class="editor">
  <div class="toolbar">
    <button onclick="document.execCommand('bold')">B</button>
    <button onclick="document.execCommand('italic')">I</button>
    <button onclick="document.execCommand('underline')">U</button>
  </div>
  
  <div contenteditable="true" 
       class="content"
       style="border: 1px solid #ddd; min-height: 200px; padding: 10px;">
    开始编辑...
  </div>
</div>
```

## 七、表单增强属性

### 7.1 autocomplete

```html
<!-- 禁用自动完成 -->
<input type="text" name="username" autocomplete="off">

<!-- 指定自动完成类型 -->
<input type="text" name="name" autocomplete="name">
<input type="email" name="email" autocomplete="email">
<input type="tel" name="phone" autocomplete="tel">
<input type="text" name="cc-number" autocomplete="cc-number">  <!-- 信用卡号 -->
```

**autocomplete 值：**
- `name`, `email`, `tel`, `organization`
- `street-address`, `postal-code`, `country`
- `cc-name`, `cc-number`, `cc-exp`, `cc-csc`

### 7.2 autofocus

```html
<!-- 页面加载时自动聚焦 -->
<input type="text" name="search" autofocus>
```

> **⚠️ 注意**  
> 每个页面只应该有一个 `autofocus`。

### 7.3 inputmode（移动端键盘）

```html
<!-- 数字键盘 -->
<input type="text" inputmode="numeric">

<!-- 小数键盘 -->
<input type="text" inputmode="decimal">

<!-- 电话键盘 -->
<input type="text" inputmode="tel">

<!-- 邮箱键盘 -->
<input type="text" inputmode="email">

<!-- URL 键盘 -->
<input type="text" inputmode="url">

<!-- 搜索键盘 -->
<input type="text" inputmode="search">
```

### 7.4 spellcheck

```html
<!-- 启用拼写检查 -->
<textarea spellcheck="true"></textarea>

<!-- 禁用拼写检查 -->
<input type="text" spellcheck="false">
```

## 八、实战示例

### 8.1 文件上传预览

```html
<div class="upload-container">
  <label for="images" class="upload-label">
    <span>选择图片</span>
    <input type="file" 
           id="images" 
           name="images"
           accept="image/*"
           multiple
           style="display: none;">
  </label>
  
  <div id="preview" class="preview-grid"></div>
</div>

<script>
const input = document.getElementById('images');
const preview = document.getElementById('preview');

input.addEventListener('change', (e) => {
  preview.innerHTML = '';
  
  Array.from(e.target.files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" alt="${file.name}">
        <div class="file-info">
          <div>${file.name}</div>
          <div>${(file.size / 1024).toFixed(2)} KB</div>
        </div>
      `;
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
});
</script>

<style>
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 20px;
}

.preview-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}
</style>
```

### 8.2 动态表单验证

```html
<form id="registerForm">
  <div class="form-group">
    <label for="username">用户名（3-20位）：</label>
    <input type="text" 
           id="username" 
           name="username"
           pattern="[A-Za-z0-9_]{3,20}"
           required>
    <span class="error"></span>
  </div>
  
  <div class="form-group">
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email" required>
    <span class="error"></span>
  </div>
  
  <div class="form-group">
    <label for="password">密码（至少6位）：</label>
    <input type="password" 
           id="password" 
           name="password"
           minlength="6"
           required>
    <span class="error"></span>
  </div>
  
  <button type="submit">注册</button>
</form>

<script>
const form = document.getElementById('registerForm');
const inputs = form.querySelectorAll('input');

inputs.forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.classList.contains('error')) {
      validateField(input);
    }
  });
});

function validateField(input) {
  const error = input.parentElement.querySelector('.error');
  
  if (!input.validity.valid) {
    input.classList.add('error');
    error.textContent = input.validationMessage;
  } else {
    input.classList.remove('error');
    error.textContent = '';
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  let isValid = true;
  inputs.forEach(input => {
    validateField(input);
    if (!input.validity.valid) {
      isValid = false;
    }
  });
  
  if (isValid) {
    console.log('表单验证通过');
    // 提交表单
  }
});
</script>
```

## 参考资料

- [MDN - HTML 表单元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element#%E8%A1%A8%E5%8D%95)
- [HTML5 Input Types](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input#input_types)

---

**上一章** ← [第 13 章：表单基础](./13-forms-basic.md)  
**下一章** → [第 15 章：表单验证](./15-form-validation.md)
