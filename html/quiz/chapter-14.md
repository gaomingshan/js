# 第 14 章：表单高级控件 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 下拉选择

### 题目

如何创建一个下拉选择框？

**选项：**
- A. `<select>` + `<option>`
- B. `<dropdown>` + `<item>`
- C. `<menu>` + `<item>`
- D. `<list>` + `<option>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**下拉选择框的基本结构**

```html
<label for="country">选择国家：</label>
<select id="country" name="country">
  <option value="">请选择</option>
  <option value="cn">中国</option>
  <option value="us">美国</option>
  <option value="jp">日本</option>
</select>
```

**常用属性：**

```html
<select 
  name="city"
  required              <!-- 必选 -->
  multiple              <!-- 多选 -->
  size="5"              <!-- 显示行数 -->
  disabled>             <!-- 禁用 -->
  
  <option value="bj">北京</option>
  <option value="sh" selected>上海</option>  <!-- 默认选中 -->
  <option value="gz" disabled>广州（暂不可选）</option>
</select>
```

**分组选项：**

```html
<label for="car">选择汽车品牌：</label>
<select id="car" name="car">
  <optgroup label="德系">
    <option value="bmw">宝马</option>
    <option value="benz">奔驰</option>
    <option value="audi">奥迪</option>
  </optgroup>
  
  <optgroup label="日系">
    <option value="toyota">丰田</option>
    <option value="honda">本田</option>
    <option value="nissan">日产</option>
  </optgroup>
  
  <optgroup label="美系" disabled>
    <option value="ford">福特</option>
    <option value="gm">通用</option>
  </optgroup>
</select>
```

**多选模式：**

```html
<label for="hobbies">选择爱好（可多选）：</label>
<select id="hobbies" name="hobbies" multiple size="5">
  <option value="reading">阅读</option>
  <option value="sports">运动</option>
  <option value="music">音乐</option>
  <option value="travel">旅游</option>
  <option value="coding">编程</option>
</select>
```

**JavaScript 操作：**

```javascript
const select = document.getElementById('country');

// 获取选中值
console.log(select.value);

// 获取选中文本
console.log(select.options[select.selectedIndex].text);

// 设置选中
select.value = 'us';

// 监听变化
select.addEventListener('change', () => {
  console.log('选择了：', select.value);
});

// 动态添加选项
const option = document.createElement('option');
option.value = 'uk';
option.textContent = '英国';
select.appendChild(option);
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** textarea

### 题目

`<textarea>` 的值应该写在 `value` 属性中。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**textarea 的值写在标签内容中，不是 value 属性**

```html
<!-- ❌ 错误：textarea 没有 value 属性 -->
<textarea value="默认文本"></textarea>

<!-- ✅ 正确：值写在标签之间 -->
<textarea>默认文本</textarea>
```

**完整示例：**

```html
<label for="comment">评论：</label>
<textarea 
  id="comment" 
  name="comment"
  rows="5"              <!-- 行数 -->
  cols="50"             <!-- 列数 -->
  maxlength="500"       <!-- 最大长度 -->
  placeholder="请输入评论..."
  required>默认内容</textarea>
```

**常用属性：**

```html
<textarea
  name="description"
  rows="10"             <!-- 可见行数 -->
  cols="80"             <!-- 可见列数 -->
  minlength="10"        <!-- 最小长度 -->
  maxlength="1000"      <!-- 最大长度 -->
  placeholder="请输入..."
  required
  readonly              <!-- 只读 -->
  disabled              <!-- 禁用 -->
  wrap="soft"           <!-- 换行方式：soft（不提交）/hard（提交） -->
  spellcheck="true">    <!-- 拼写检查 -->
</textarea>
```

**自动调整高度：**

```html
<textarea id="autoResize" rows="3"></textarea>

<script>
const textarea = document.getElementById('autoResize');

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
});
</script>

<style>
textarea {
  resize: vertical;  /* 只允许垂直调整 */
  overflow: hidden;  /* 隐藏滚动条 */
}
</style>
```

**字符计数：**

```html
<textarea id="message" maxlength="200"></textarea>
<p>
  <span id="count">0</span> / 200
</p>

<script>
const textarea = document.getElementById('message');
const count = document.getElementById('count');

textarea.addEventListener('input', () => {
  count.textContent = textarea.value.length;
});
</script>
```

**vs input[type="text"]：**

| 特性 | textarea | input |
|------|----------|-------|
| **多行** | ✅ | ❌ |
| **换行** | ✅ | ❌ |
| **默认值** | 标签内容 | value 属性 |
| **调整大小** | 可以 | 不可以 |

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** datalist

### 题目

`<datalist>` 的作用是什么？

**选项：**
- A. 创建下拉列表
- B. 提供输入建议
- C. 验证输入
- D. 存储数据

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**datalist 提供输入建议（自动完成）**

```html
<label for="browser">选择浏览器：</label>
<input 
  type="text" 
  id="browser" 
  name="browser"
  list="browsers"
  placeholder="输入或选择...">

<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
  <option value="Edge">
  <option value="Opera">
</datalist>
```

**vs select 的区别：**

| 特性 | datalist | select |
|------|----------|--------|
| **可输入** | ✅ | ❌ |
| **可选择** | ✅ | ✅ |
| **必须从列表选** | ❌ | ✅ |
| **用途** | 建议 | 固定选项 |

**完整示例：**

```html
<form>
  <!-- 城市建议 -->
  <label for="city">城市：</label>
  <input type="text" id="city" list="cities">
  <datalist id="cities">
    <option value="北京">
    <option value="上海">
    <option value="广州">
    <option value="深圳">
  </datalist>
  
  <!-- 带描述的建议 -->
  <label for="color">颜色：</label>
  <input type="text" id="color" list="colors">
  <datalist id="colors">
    <option value="#FF0000" label="红色">
    <option value="#00FF00" label="绿色">
    <option value="#0000FF" label="蓝色">
  </datalist>
  
  <!-- URL 建议 -->
  <label for="website">网站：</label>
  <input type="url" id="website" list="websites">
  <datalist id="websites">
    <option value="https://google.com">
    <option value="https://github.com">
    <option value="https://stackoverflow.com">
  </datalist>
</form>
```

**动态 datalist：**

```html
<input type="text" id="search" list="suggestions">
<datalist id="suggestions"></datalist>

<script>
const input = document.getElementById('search');
const datalist = document.getElementById('suggestions');

input.addEventListener('input', async () => {
  const query = input.value;
  
  if (query.length < 2) return;
  
  // 从服务器获取建议
  const response = await fetch(`/api/search?q=${query}`);
  const suggestions = await response.json();
  
  // 更新 datalist
  datalist.innerHTML = suggestions
    .map(item => `<option value="${item}">`)
    .join('');
});
</script>
```

**浏览器兼容性检测：**

```javascript
if ('list' in document.createElement('input')) {
  console.log('支持 datalist');
} else {
  // 降级方案
  console.log('不支持 datalist，使用其他方案');
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 单选和复选

### 题目

关于单选按钮和复选框，以下说法正确的是？

**选项：**
- A. 单选按钮同组的 `name` 必须相同
- B. 复选框可以有相同的 `name`
- C. `checked` 属性表示默认选中
- D. 单选按钮不能取消选择

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**单选按钮 vs 复选框（A, B, C 正确）**

**1. 单选按钮（name 必须相同，A 正确）**

```html
<fieldset>
  <legend>性别：</legend>
  
  <!-- 同组 name 必须相同 -->
  <label>
    <input type="radio" name="gender" value="male" checked>
    男
  </label>
  
  <label>
    <input type="radio" name="gender" value="female">
    女
  </label>
  
  <label>
    <input type="radio" name="gender" value="other">
    其他
  </label>
</fieldset>
```

**2. 复选框（name 可以相同，B 正确）**

```html
<fieldset>
  <legend>爱好：</legend>
  
  <!-- 相同 name，提交为数组 -->
  <label>
    <input type="checkbox" name="hobbies" value="reading">
    阅读
  </label>
  
  <label>
    <input type="checkbox" name="hobbies" value="sports" checked>
    运动
  </label>
  
  <label>
    <input type="checkbox" name="hobbies" value="music">
    音乐
  </label>
</fieldset>
```

**3. checked 属性（C 正确）**

```html
<!-- 默认选中 -->
<input type="radio" name="plan" value="basic" checked>
<input type="checkbox" name="agree" checked>
```

**4. 单选按钮可以取消选择（D 错误）**

虽然用户点击后不能直接取消，但可以通过 JavaScript 实现：

```html
<label>
  <input type="radio" name="option" value="yes" id="yes">
  是
</label>
<label>
  <input type="radio" name="option" value="no" id="no">
  否
</label>

<script>
let lastChecked = null;

document.querySelectorAll('input[name="option"]').forEach(radio => {
  radio.addEventListener('click', () => {
    if (radio === lastChecked) {
      radio.checked = false;
      lastChecked = null;
    } else {
      lastChecked = radio;
    }
  });
});
</script>
```

**完整示例：**

```html
<form>
  <!-- 单选：会员等级 -->
  <fieldset>
    <legend>会员等级：</legend>
    
    <label>
      <input type="radio" name="level" value="basic" checked>
      基础版（免费）
    </label>
    
    <label>
      <input type="radio" name="level" value="pro">
      专业版（¥99/月）
    </label>
    
    <label>
      <input type="radio" name="level" value="enterprise">
      企业版（¥999/月）
    </label>
  </fieldset>
  
  <!-- 复选：功能选择 -->
  <fieldset>
    <legend>附加功能：</legend>
    
    <label>
      <input type="checkbox" name="features" value="backup">
      自动备份
    </label>
    
    <label>
      <input type="checkbox" name="features" value="support">
      优先支持
    </label>
    
    <label>
      <input type="checkbox" name="features" value="analytics">
      数据分析
    </label>
  </fieldset>
  
  <!-- 单个复选框：同意条款 -->
  <label>
    <input type="checkbox" name="agree" required>
    我同意服务条款
  </label>
  
  <button type="submit">提交</button>
</form>

<script>
// 获取选中的单选按钮
const level = document.querySelector('input[name="level"]:checked').value;

// 获取选中的复选框
const features = Array.from(
  document.querySelectorAll('input[name="features"]:checked')
).map(cb => cb.value);

console.log('会员等级：', level);
console.log('附加功能：', features);
</script>
```

**样式优化：**

```css
/* 隐藏原生单选/复选框 */
input[type="radio"],
input[type="checkbox"] {
  position: absolute;
  opacity: 0;
}

/* 自定义样式 */
input[type="radio"] + label,
input[type="checkbox"] + label {
  position: relative;
  padding-left: 2rem;
  cursor: pointer;
}

/* 自定义单选按钮 */
input[type="radio"] + label::before {
  content: '';
  position: absolute;
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #ddd;
  border-radius: 50%;
  background: white;
}

input[type="radio"]:checked + label::before {
  border-color: #3b82f6;
  background: #3b82f6;
  box-shadow: inset 0 0 0 4px white;
}

/* 自定义复选框 */
input[type="checkbox"] + label::before {
  content: '';
  position: absolute;
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: white;
}

input[type="checkbox"]:checked + label::before {
  border-color: #3b82f6;
  background: #3b82f6;
}

input[type="checkbox"]:checked + label::after {
  content: '✓';
  position: absolute;
  left: 0.4rem;
  top: 0.1rem;
  color: white;
  font-size: 1rem;
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** range

### 题目

以下代码创建的范围滑块的默认值是多少？

```html
<input type="range" min="0" max="100" step="5">
```

**选项：**
- A. 0
- B. 50
- C. 100
- D. 未定义

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（50）

### 📖 解析

**range 的默认值是中间值**

```html
<!-- 默认值 = (min + max) / 2 = (0 + 100) / 2 = 50 -->
<input type="range" min="0" max="100" step="5">

<!-- 指定默认值 -->
<input type="range" min="0" max="100" value="75" step="5">
```

**完整的 range 属性：**

```html
<label for="volume">音量：</label>
<input 
  type="range" 
  id="volume"
  name="volume"
  min="0"           <!-- 最小值 -->
  max="100"         <!-- 最大值 -->
  value="50"        <!-- 当前值 -->
  step="10"         <!-- 步长 -->
  list="markers">   <!-- 刻度标记 -->

<datalist id="markers">
  <option value="0" label="静音">
  <option value="50" label="中">
  <option value="100" label="最大">
</datalist>

<output for="volume" id="volumeOutput">50</output>
```

**实时显示值：**

```html
<label for="slider">选择：<span id="value">50</span></label>
<input 
  type="range" 
  id="slider" 
  min="0" 
  max="100" 
  value="50">

<script>
const slider = document.getElementById('slider');
const value = document.getElementById('value');

slider.addEventListener('input', () => {
  value.textContent = slider.value;
});
</script>
```

**多个滑块（范围选择）：**

```html
<label>价格范围：</label>
<input type="range" id="minPrice" min="0" max="1000" value="200">
<input type="range" id="maxPrice" min="0" max="1000" value="800">
<p>
  ¥<span id="min">200</span> - ¥<span id="max">800</span>
</p>

<script>
const minSlider = document.getElementById('minPrice');
const maxSlider = document.getElementById('maxPrice');
const minDisplay = document.getElementById('min');
const maxDisplay = document.getElementById('max');

minSlider.addEventListener('input', () => {
  if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
    minSlider.value = maxSlider.value;
  }
  minDisplay.textContent = minSlider.value;
});

maxSlider.addEventListener('input', () => {
  if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
    maxSlider.value = minSlider.value;
  }
  maxDisplay.textContent = maxSlider.value;
});
</script>
```

**样式美化：**

```css
input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(
    to right,
    #3b82f6 0%,
    #3b82f6 var(--value),
    #e5e7eb var(--value),
    #e5e7eb 100%
  );
  outline: none;
  -webkit-appearance: none;
}

/* 滑块 */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

/* 动态背景 */
<script>
slider.addEventListener('input', () => {
  const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.setProperty('--value', percent + '%');
});
</script>
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** output

### 题目

`<output>` 元素的作用是什么？

**选项：**
- A. 输出计算结果
- B. 显示错误信息
- C. 提交数据
- D. 验证输入

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**output 用于显示计算结果**

```html
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
  <input type="number" id="a" value="10"> +
  <input type="number" id="b" value="20"> =
  <output name="result" for="a b">30</output>
</form>
```

**完整示例：**

```html
<form>
  <label for="price">商品价格：</label>
  <input type="number" id="price" value="100" min="0">
  
  <label for="quantity">数量：</label>
  <input type="number" id="quantity" value="1" min="1">
  
  <p>
    总价：<output id="total" for="price quantity">100</output> 元
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

**范围滑块示例：**

```html
<label>音量：</label>
<input 
  type="range" 
  id="volume" 
  min="0" 
  max="100" 
  value="50"
  oninput="volumeOutput.value = this.value">
<output id="volumeOutput" for="volume">50</output>%

<!-- 或使用 JavaScript -->
<script>
volume.addEventListener('input', () => {
  volumeOutput.value = volume.value;
});
</script>
```

**贷款计算器：**

```html
<form>
  <div>
    <label for="principal">贷款金额（万元）：</label>
    <input type="number" id="principal" value="100" min="1">
  </div>
  
  <div>
    <label for="rate">年利率（%）：</label>
    <input type="number" id="rate" value="4.5" min="0" step="0.1">
  </div>
  
  <div>
    <label for="years">贷款年限：</label>
    <input type="number" id="years" value="20" min="1" max="30">
  </div>
  
  <div>
    <strong>月供：</strong>
    <output id="payment" for="principal rate years">0</output> 元
  </div>
</form>

<script>
const principal = document.getElementById('principal');
const rate = document.getElementById('rate');
const years = document.getElementById('years');
const payment = document.getElementById('payment');

function calculate() {
  const P = principal.value * 10000;
  const r = rate.value / 100 / 12;
  const n = years.value * 12;
  
  const monthly = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  
  payment.value = monthly.toFixed(2);
}

[principal, rate, years].forEach(input => {
  input.addEventListener('input', calculate);
});

calculate();
</script>
```

**for 属性：**

```html
<!-- for 属性关联相关输入 -->
<output for="input1 input2 input3"></output>

<!-- 语义化表示计算依赖这些输入 -->
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 高级属性

### 题目

HTML5 表单新增了哪些属性？

**选项：**
- A. `autocomplete`, `autofocus`
- B. `placeholder`, `required`
- C. `pattern`, `novalidate`
- D. `value`, `name`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**HTML5 新增的表单属性（A, B, C 正确）**

**1. autocomplete 和 autofocus（A 正确）**

```html
<!-- 自动完成 -->
<input type="email" name="email" autocomplete="email">
<input type="password" name="password" autocomplete="current-password">

<!-- 自动聚焦 -->
<input type="text" name="search" autofocus>
```

**2. placeholder 和 required（B 正确）**

```html
<!-- 占位符 -->
<input type="text" placeholder="请输入用户名">

<!-- 必填 -->
<input type="email" required>
```

**3. pattern 和 novalidate（C 正确）**

```html
<!-- 正则验证 -->
<input type="text" pattern="[0-9]{11}" title="请输入11位手机号">

<!-- 禁用验证 -->
<form novalidate>
  <input type="email" required>
</form>
```

**4. value 和 name（D 是 HTML4 的属性）**

```html
<!-- HTML4 就有的属性 -->
<input type="text" name="username" value="默认值">
```

**所有 HTML5 新增属性：**

```html
<form autocomplete="on" novalidate>
  <!-- 文本输入 -->
  <input 
    type="text"
    name="username"
    placeholder="用户名"
    autofocus
    required
    minlength="3"
    maxlength="20"
    pattern="[a-zA-Z0-9_]+"
    autocomplete="username"
    spellcheck="false"
    inputmode="text">
  
  <!-- 邮箱 -->
  <input 
    type="email"
    name="email"
    placeholder="user@example.com"
    required
    autocomplete="email"
    multiple>  <!-- 允许多个邮箱 -->
  
  <!-- 数字 -->
  <input 
    type="number"
    name="age"
    min="18"
    max="100"
    step="1"
    placeholder="年龄">
  
  <!-- 日期 -->
  <input 
    type="date"
    name="birthday"
    min="1900-01-01"
    max="2024-12-31">
  
  <!-- 范围 -->
  <input 
    type="range"
    name="volume"
    min="0"
    max="100"
    step="10"
    list="volumes">
  
  <datalist id="volumes">
    <option value="0">
    <option value="50">
    <option value="100">
  </datalist>
  
  <!-- 文件 -->
  <input 
    type="file"
    name="avatar"
    accept="image/*"
    multiple
    capture="user">  <!-- 移动端调用摄像头 -->
  
  <!-- 提交 -->
  <button 
    type="submit"
    formaction="/submit"     <!-- 覆盖 form action -->
    formmethod="POST"        <!-- 覆盖 form method -->
    formnovalidate>          <!-- 跳过验证 -->
    提交
  </button>
</form>
```

**autocomplete 的值：**

```html
<!-- 个人信息 -->
<input autocomplete="name">
<input autocomplete="given-name">   <!-- 名 -->
<input autocomplete="family-name">  <!-- 姓 -->
<input autocomplete="email">
<input autocomplete="tel">
<input autocomplete="street-address">
<input autocomplete="postal-code">
<input autocomplete="country">

<!-- 账户 -->
<input autocomplete="username">
<input autocomplete="new-password">
<input autocomplete="current-password">

<!-- 信用卡 -->
<input autocomplete="cc-name">
<input autocomplete="cc-number">
<input autocomplete="cc-exp">
<input autocomplete="cc-csc">
```

**inputmode 属性：**

```html
<!-- 移动端键盘类型 -->
<input inputmode="none">      <!-- 不显示键盘 -->
<input inputmode="text">      <!-- 标准键盘 -->
<input inputmode="numeric">   <!-- 数字键盘 -->
<input inputmode="decimal">   <!-- 带小数点的数字键盘 -->
<input inputmode="tel">       <!-- 电话键盘 -->
<input inputmode="email">     <!-- 邮箱键盘（带@） -->
<input inputmode="url">       <!-- URL键盘（带.com） -->
<input inputmode="search">    <!-- 搜索键盘 -->
```

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 复杂表单

### 题目

创建一个包含级联选择的地址表单（省-市-区）。

<details>
<summary>查看答案</summary>

### ✅ 正确答案

```html
<form>
  <div>
    <label for="province">省份：</label>
    <select id="province" name="province" required>
      <option value="">请选择省份</option>
    </select>
  </div>
  
  <div>
    <label for="city">城市：</label>
    <select id="city" name="city" required disabled>
      <option value="">请先选择省份</option>
    </select>
  </div>
  
  <div>
    <label for="district">区县：</label>
    <select id="district" name="district" required disabled>
      <option value="">请先选择城市</option>
    </select>
  </div>
  
  <button type="submit">提交</button>
</form>

<script>
// 地址数据
const addressData = {
  '北京': {
    '北京市': ['东城区', '西城区', '朝阳区', '海淀区']
  },
  '上海': {
    '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区']
  },
  '广东': {
    '广州市': ['天河区', '越秀区', '海珠区'],
    '深圳市': ['福田区', '南山区', '宝安区']
  }
};

const province = document.getElementById('province');
const city = document.getElementById('city');
const district = document.getElementById('district');

// 初始化省份
Object.keys(addressData).forEach(p => {
  const option = document.createElement('option');
  option.value = p;
  option.textContent = p;
  province.appendChild(option);
});

// 省份变化
province.addEventListener('change', () => {
  city.innerHTML = '<option value="">请选择城市</option>';
  district.innerHTML = '<option value="">请先选择城市</option>';
  district.disabled = true;
  
  if (province.value) {
    city.disabled = false;
    const cities = Object.keys(addressData[province.value]);
    
    cities.forEach(c => {
      const option = document.createElement('option');
      option.value = c;
      option.textContent = c;
      city.appendChild(option);
    });
  } else {
    city.disabled = true;
  }
});

// 城市变化
city.addEventListener('change', () => {
  district.innerHTML = '<option value="">请选择区县</option>';
  
  if (city.value) {
    district.disabled = false;
    const districts = addressData[province.value][city.value];
    
    districts.forEach(d => {
      const option = document.createElement('option');
      option.value = d;
      option.textContent = d;
      district.appendChild(option);
    });
  } else {
    district.disabled = true;
  }
});
</script>
```

### 📖 解析

**级联选择的关键点**

**1. 数据结构**

```javascript
// 嵌套对象
const data = {
  '省': {
    '市': ['区1', '区2']
  }
};

// 或从服务器获取
async function loadProvinces() {
  const response = await fetch('/api/provinces');
  return await response.json();
}
```

**2. 动态更新选项**

```javascript
function updateCities(provinceId) {
  // 清空
  citySelect.innerHTML = '<option value="">请选择</option>';
  
  // 禁用下级
  districtSelect.disabled = true;
  
  if (!provinceId) {
    citySelect.disabled = true;
    return;
  }
  
  // 加载城市
  const cities = getCities(provinceId);
  
  cities.forEach(city => {
    const option = new Option(city.name, city.id);
    citySelect.add(option);
  });
  
  citySelect.disabled = false;
}
```

**3. 完整示例（从服务器加载）**

```html
<form id="addressForm">
  <select id="province" name="province" required>
    <option value="">加载中...</option>
  </select>
  
  <select id="city" name="city" required disabled>
    <option value="">请先选择省份</option>
  </select>
  
  <select id="district" name="district" required disabled>
    <option value="">请先选择城市</option>
  </select>
</form>

<script>
class AddressSelector {
  constructor(provinceEl, cityEl, districtEl) {
    this.province = provinceEl;
    this.city = cityEl;
    this.district = districtEl;
    
    this.init();
  }
  
  async init() {
    // 加载省份
    await this.loadProvinces();
    
    // 绑定事件
    this.province.addEventListener('change', () => this.onProvinceChange());
    this.city.addEventListener('change', () => this.onCityChange());
  }
  
  async loadProvinces() {
    try {
      const response = await fetch('/api/provinces');
      const provinces = await response.json();
      
      this.province.innerHTML = '<option value="">请选择省份</option>';
      
      provinces.forEach(p => {
        const option = new Option(p.name, p.id);
        this.province.add(option);
      });
    } catch (error) {
      console.error('加载省份失败', error);
      this.province.innerHTML = '<option value="">加载失败</option>';
    }
  }
  
  async onProvinceChange() {
    const provinceId = this.province.value;
    
    // 重置城市和区县
    this.city.innerHTML = '<option value="">请选择城市</option>';
    this.district.innerHTML = '<option value="">请先选择城市</option>';
    this.district.disabled = true;
    
    if (!provinceId) {
      this.city.disabled = true;
      return;
    }
    
    try {
      const response = await fetch(`/api/cities?province=${provinceId}`);
      const cities = await response.json();
      
      cities.forEach(c => {
        const option = new Option(c.name, c.id);
        this.city.add(option);
      });
      
      this.city.disabled = false;
    } catch (error) {
      console.error('加载城市失败', error);
    }
  }
  
  async onCityChange() {
    const cityId = this.city.value;
    
    // 重置区县
    this.district.innerHTML = '<option value="">请选择区县</option>';
    
    if (!cityId) {
      this.district.disabled = true;
      return;
    }
    
    try {
      const response = await fetch(`/api/districts?city=${cityId}`);
      const districts = await response.json();
      
      districts.forEach(d => {
        const option = new Option(d.name, d.id);
        this.district.add(option);
      });
      
      this.district.disabled = false;
    } catch (error) {
      console.error('加载区县失败', error);
    }
  }
  
  // 获取选中的值
  getValue() {
    return {
      province: this.province.value,
      city: this.city.value,
      district: this.district.value
    };
  }
  
  // 设置值
  async setValue(province, city, district) {
    // 设置省份
    this.province.value = province;
    await this.onProvinceChange();
    
    // 设置城市
    await new Promise(resolve => setTimeout(resolve, 100));
    this.city.value = city;
    await this.onCityChange();
    
    // 设置区县
    await new Promise(resolve => setTimeout(resolve, 100));
    this.district.value = district;
  }
}

// 使用
const selector = new AddressSelector(
  document.getElementById('province'),
  document.getElementById('city'),
  document.getElementById('district')
);

// 设置默认值
// selector.setValue('110000', '110100', '110101');
</script>
```

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 可访问性

### 题目

如何提升表单控件的可访问性？

**选项：**
- A. 使用 `<label>` 关联控件
- B. 使用 `aria-*` 属性
- C. 提供错误提示
- D. 使用 `tabindex` 控制焦点顺序

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**表单可访问性的完整实践（全部正确）**

**1. 使用 label（A 正确）**

```html
<!-- ✅ 显式关联 -->
<label for="email">邮箱：</label>
<input type="email" id="email">

<!-- ✅ 隐式关联 -->
<label>
  用户名：
  <input type="text" name="username">
</label>

<!-- ❌ 没有 label -->
<input type="text" placeholder="请输入用户名">
```

**2. 使用 ARIA 属性（B 正确）**

```html
<label for="password">密码：</label>
<input 
  type="password" 
  id="password"
  aria-required="true"
  aria-invalid="false"
  aria-describedby="password-help password-error">

<small id="password-help">至少8位</small>
<span id="password-error" role="alert"></span>
```

**3. 错误提示（C 正确）**

```html
<label for="email">邮箱：</label>
<input 
  type="email" 
  id="email"
  aria-describedby="email-error"
  aria-invalid="true">
<span id="email-error" role="alert" class="error">
  请输入有效的邮箱地址
</span>
```

**4. tabindex（D 正确）**

```html
<!-- 自然顺序 -->
<input type="text" name="field1">  <!-- tab 顺序：1 -->
<input type="text" name="field2">  <!-- tab 顺序：2 -->

<!-- 自定义顺序 -->
<input type="text" tabindex="3">
<input type="text" tabindex="1">
<input type="text" tabindex="2">

<!-- 不可 tab -->
<button tabindex="-1">不可聚焦</button>
```

**完整的可访问表单：**

```html
<form aria-labelledby="form-title">
  <h2 id="form-title">用户注册</h2>
  
  <!-- 必填说明 -->
  <p>
    <span aria-hidden="true">*</span> 
    表示必填项
  </p>
  
  <!-- 文本输入 -->
  <div class="form-group">
    <label for="username">
      用户名 
      <span aria-label="必填" class="required">*</span>
    </label>
    <input 
      type="text" 
      id="username" 
      name="username"
      required
      aria-required="true"
      aria-describedby="username-help username-error"
      aria-invalid="false">
    <small id="username-help">3-20个字符</small>
    <span id="username-error" role="alert" aria-live="polite"></span>
  </div>
  
  <!-- 密码 -->
  <div class="form-group">
    <label for="password">
      密码 
      <span aria-label="必填" class="required">*</span>
    </label>
    <input 
      type="password" 
      id="password" 
      name="password"
      required
      aria-required="true"
      aria-describedby="password-help">
    <small id="password-help">至少8位，包含字母和数字</small>
    
    <!-- 显示/隐藏密码 -->
    <button 
      type="button" 
      aria-label="显示密码"
      onclick="togglePassword()">
      👁️
    </button>
  </div>
  
  <!-- 单选 -->
  <fieldset>
    <legend>性别</legend>
    <label>
      <input type="radio" name="gender" value="male">
      男
    </label>
    <label>
      <input type="radio" name="gender" value="female">
      女
    </label>
  </fieldset>
  
  <!-- 复选 -->
  <div class="form-group">
    <label>
      <input 
        type="checkbox" 
        name="agree" 
        required
        aria-required="true"
        aria-describedby="agree-error">
      我同意<a href="/terms">服务条款</a>
    </label>
    <span id="agree-error" role="alert"></span>
  </div>
  
  <!-- 提交 -->
  <button type="submit" aria-label="提交注册表单">
    注册
  </button>
</form>

<script>
// 实时验证
const username = document.getElementById('username');
const error = document.getElementById('username-error');

username.addEventListener('blur', () => {
  if (username.validity.valueMissing) {
    error.textContent = '请输入用户名';
    username.setAttribute('aria-invalid', 'true');
  } else if (username.value.length < 3) {
    error.textContent = '用户名至少3个字符';
    username.setAttribute('aria-invalid', 'true');
  } else {
    error.textContent = '';
    username.setAttribute('aria-invalid', 'false');
  }
});

// 显示/隐藏密码
function togglePassword() {
  const pwd = document.getElementById('password');
  const btn = event.target;
  
  if (pwd.type === 'password') {
    pwd.type = 'text';
    btn.setAttribute('aria-label', '隐藏密码');
    btn.textContent = '🙈';
  } else {
    pwd.type = 'password';
    btn.setAttribute('aria-label', '显示密码');
    btn.textContent = '👁️';
  }
}
</script>
```

**常用 ARIA 属性：**

- `aria-label` - 标签文本
- `aria-labelledby` - 引用标签元素
- `aria-describedby` - 引用描述元素
- `aria-required` - 必填
- `aria-invalid` - 验证状态
- `aria-live` - 实时更新区域
- `role` - 元素角色

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** 最佳实践

### 题目

对比以下两种创建评分控件的方式，说明哪种更好，为什么？

```html
<!-- 方式 A：使用 div -->
<div class="rating">
  <span data-value="1">★</span>
  <span data-value="2">★</span>
  <span data-value="3">★</span>
  <span data-value="4">★</span>
  <span data-value="5">★</span>
</div>

<!-- 方式 B：使用 radio -->
<fieldset class="rating">
  <legend>评分：</legend>
  <input type="radio" id="star5" name="rating" value="5">
  <label for="star5">★</label>
  <input type="radio" id="star4" name="rating" value="4">
  <label for="star4">★</label>
  <input type="radio" id="star3" name="rating" value="3">
  <label for="star3">★</label>
  <input type="radio" id="star2" name="rating" value="2">
  <label for="star2">★</label>
  <input type="radio" id="star1" name="rating" value="1">
  <label for="star1">★</label>
</fieldset>
```

<details>
<summary>查看答案</summary>

### 📖 解析

**方式 B（radio）明显更优**

| 特性 | 方式 A（div） | 方式 B（radio） |
|------|--------------|----------------|
| **语义化** | ❌ 无 | ✅ 表单控件 |
| **可访问性** | ❌ 差 | ✅ 好 |
| **键盘操作** | ❌ 需手动实现 | ✅ 原生支持 |
| **表单提交** | ❌ 需 JS | ✅ 自动提交 |
| **屏幕阅读器** | ❌ 不友好 | ✅ 友好 |
| **实现复杂度** | 🟡 较高 | 🟢 较低 |

**完整的评分组件实现：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>评分组件</title>
  <style>
    .rating {
      border: none;
      padding: 0;
      display: inline-flex;
      flex-direction: row-reverse;
      justify-content: flex-end;
    }
    
    .rating legend {
      float: left;
      padding-right: 0.5rem;
    }
    
    .rating input {
      display: none;
    }
    
    .rating label {
      cursor: pointer;
      font-size: 2rem;
      color: #ddd;
      transition: color 0.3s;
    }
    
    /* 悬停时及之前的星星高亮 */
    .rating label:hover,
    .rating label:hover ~ label {
      color: #ffc107;
    }
    
    /* 选中时及之前的星星高亮 */
    .rating input:checked ~ label {
      color: #ffc107;
    }
    
    /* 聚焦样式 */
    .rating input:focus + label {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <form id="reviewForm">
    <fieldset class="rating">
      <legend>评分：</legend>
      
      <input type="radio" id="star5" name="rating" value="5">
      <label for="star5" title="5星">★</label>
      
      <input type="radio" id="star4" name="rating" value="4">
      <label for="star4" title="4星">★</label>
      
      <input type="radio" id="star3" name="rating" value="3">
      <label for="star3" title="3星">★</label>
      
      <input type="radio" id="star2" name="rating" value="2">
      <label for="star2" title="2星">★</label>
      
      <input type="radio" id="star1" name="rating" value="1">
      <label for="star1" title="1星">★</label>
    </fieldset>
    
    <p>
      当前评分：<output id="ratingOutput">未评分</output>
    </p>
    
    <button type="submit">提交</button>
  </form>

  <script>
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const output = document.getElementById('ratingOutput');
    
    ratingInputs.forEach(input => {
      input.addEventListener('change', () => {
        output.value = `${input.value} 星`;
      });
    });
    
    document.getElementById('reviewForm').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const rating = document.querySelector('input[name="rating"]:checked');
      
      if (!rating) {
        alert('请选择评分');
        return;
      }
      
      console.log('评分：', rating.value);
    });
  </script>
</body>
</html>
```

**可访问性增强版：**

```html
<fieldset class="rating" role="radiogroup" aria-labelledby="rating-label">
  <legend id="rating-label">
    请为这次服务评分
    <span class="sr-only">（使用方向键选择1-5星）</span>
  </legend>
  
  <input 
    type="radio" 
    id="star5" 
    name="rating" 
    value="5"
    aria-label="5星，非常满意">
  <label for="star5">★</label>
  
  <!-- 其他星星... -->
</fieldset>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

**为什么方式 B 更好：**

1. **语义化**：使用表单控件表达"选择"的语义
2. **可访问性**：屏幕阅读器能正确识别
3. **键盘支持**：方向键自动切换选项
4. **表单集成**：自动包含在表单数据中
5. **无需 JavaScript**：基本功能不依赖 JS
6. **浏览器验证**：可以使用 `required` 属性

</details>

---

**📌 本章总结**

- `<select>` + `<option>` - 下拉选择
- `<optgroup>` - 选项分组
- `<textarea>` - 多行文本，值写在标签内
- `<datalist>` - 输入建议
- 单选按钮 - 同组 name 相同
- 复选框 - name 可相同（提交为数组）
- `<output>` - 显示计算结果
- 范围滑块 - 默认值是中间值
- HTML5 新属性 - autocomplete, autofocus, placeholder, pattern
- 可访问性 - label, ARIA, 错误提示, tabindex

**上一章** ← [第 13 章：表单基础](./chapter-13.md)  
**下一章** → [第 15 章：表单验证](./chapter-15.md)
