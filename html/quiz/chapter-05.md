# 第 5 章：列表与定义 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 列表类型

### 题目

HTML 中有哪三种列表类型？

**选项：**
- A. 有序列表、无序列表、定义列表
- B. 数字列表、符号列表、描述列表
- C. 排序列表、未排序列表、术语列表
- D. ol 列表、ul 列表、dl 列表

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**HTML 三种列表**

**1. 有序列表（Ordered List）**
```html
<ol>
  <li>第一项</li>
  <li>第二项</li>
  <li>第三项</li>
</ol>
```

**2. 无序列表（Unordered List）**
```html
<ul>
  <li>项目A</li>
  <li>项目B</li>
  <li>项目C</li>
</ul>
```

**3. 定义列表（Definition List）**
```html
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言</dd>
  
  <dt>CSS</dt>
  <dd>层叠样式表</dd>
</dl>
```

**标签说明：**
- `<ol>` - Ordered List（有序列表）
- `<ul>` - Unordered List（无序列表）
- `<dl>` - Definition/Description List（定义列表）
- `<li>` - List Item（列表项）
- `<dt>` - Definition Term（定义术语）
- `<dd>` - Definition Description（定义描述）

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 列表嵌套

### 题目

列表可以嵌套，即在 `<li>` 内部可以再放置 `<ul>` 或 `<ol>`。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**列表可以嵌套**

```html
<ul>
  <li>前端技术
    <ul>
      <li>HTML</li>
      <li>CSS
        <ul>
          <li>Sass</li>
          <li>Less</li>
        </ul>
      </li>
      <li>JavaScript</li>
    </ul>
  </li>
  <li>后端技术
    <ul>
      <li>Node.js</li>
      <li>Python</li>
    </ul>
  </li>
</ul>
```

**嵌套规则：**

```html
<!-- ✅ 正确：嵌套列表在 li 内 -->
<ul>
  <li>项目1
    <ul>
      <li>子项目1.1</li>
      <li>子项目1.2</li>
    </ul>
  </li>
  <li>项目2</li>
</ul>

<!-- ❌ 错误：直接嵌套在 ul 内 -->
<ul>
  <li>项目1</li>
  <ul>  <!-- 错误位置 -->
    <li>子项目</li>
  </ul>
</ul>
```

**样式示例：**
```css
ul {
  list-style-type: disc;  /* 实心圆 */
}

ul ul {
  list-style-type: circle;  /* 空心圆 */
}

ul ul ul {
  list-style-type: square;  /* 方块 */
}
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 有序列表属性

### 题目

如何让有序列表从 5 开始编号？

**选项：**
- A. `<ol start="5">`
- B. `<ol begin="5">`
- C. `<ol value="5">`
- D. `<ol number="5">`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**有序列表的 `start` 属性**

```html
<ol start="5">
  <li>第五项</li>
  <li>第六项</li>
  <li>第七项</li>
</ol>
```

**有序列表属性：**

**1. `type` - 编号类型**
```html
<ol type="1">  <!-- 数字（默认）：1, 2, 3 -->
  <li>项目</li>
</ol>

<ol type="A">  <!-- 大写字母：A, B, C -->
  <li>项目</li>
</ol>

<ol type="a">  <!-- 小写字母：a, b, c -->
  <li>项目</li>
</ol>

<ol type="I">  <!-- 大写罗马数字：I, II, III -->
  <li>项目</li>
</ol>

<ol type="i">  <!-- 小写罗马数字：i, ii, iii -->
  <li>项目</li>
</ol>
```

**2. `start` - 起始数字**
```html
<ol start="10">
  <li>第10项</li>
  <li>第11项</li>
</ol>

<ol type="A" start="3">
  <li>C</li>
  <li>D</li>
</ol>
```

**3. `reversed` - 倒序**
```html
<ol reversed>
  <li>第三名</li>
  <li>第二名</li>
  <li>第一名</li>
</ol>
<!-- 显示：3. 第三名  2. 第二名  1. 第一名 -->
```

**4. `<li>` 的 `value` 属性**
```html
<ol>
  <li value="1">第一项</li>
  <li value="5">第五项</li>
  <li>第六项（继续递增）</li>
</ol>
```

**完整示例：**
```html
<!-- 排行榜倒序 -->
<h2>编程语言排行榜</h2>
<ol reversed>
  <li value="10">TypeScript</li>
  <li>Go</li>
  <li>Rust</li>
  <li>Java</li>
  <li>Python</li>
  <li>JavaScript</li>
</ol>
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 定义列表

### 题目

关于定义列表 `<dl>`，以下说法正确的是？

**选项：**
- A. 一个 `<dt>` 可以对应多个 `<dd>`
- B. 多个 `<dt>` 可以共享一个 `<dd>`
- C. `<dl>` 仅用于术语定义
- D. `<dl>` 可以用于键值对展示

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

**定义列表的灵活用法**

**1. 一个术语，多个定义（A 正确）**
```html
<dl>
  <dt>Firefox</dt>
  <dd>Mozilla 开发的浏览器</dd>
  <dd>开源、跨平台</dd>
  <dd>支持扩展插件</dd>
</dl>
```

**2. 多个术语，一个定义（B 正确）**
```html
<dl>
  <dt>HTML</dt>
  <dt>CSS</dt>
  <dt>JavaScript</dt>
  <dd>前端三大核心技术</dd>
</dl>
```

**3. 不仅限于术语定义（C 错误，D 正确）**

```html
<!-- 元数据 / 键值对 -->
<dl>
  <dt>姓名</dt>
  <dd>张三</dd>
  
  <dt>职位</dt>
  <dd>前端工程师</dd>
  
  <dt>邮箱</dt>
  <dd>zhangsan@example.com</dd>
</dl>

<!-- FAQ -->
<dl>
  <dt>什么是 HTML？</dt>
  <dd>HTML 是超文本标记语言，用于构建网页结构。</dd>
  
  <dt>如何学习 HTML？</dt>
  <dd>可以通过在线教程、书籍和实践项目来学习。</dd>
</dl>

<!-- 对话 -->
<dl>
  <dt>张三</dt>
  <dd>你好！</dd>
  
  <dt>李四</dt>
  <dd>你好，很高兴见到你。</dd>
</dl>
```

**样式示例：**
```css
dl {
  display: grid;
  grid-template-columns: max-content auto;
  gap: 0.5rem 1rem;
}

dt {
  font-weight: bold;
  grid-column: 1;
}

dd {
  grid-column: 2;
  margin: 0;
}
```

**HTML5 规范：**
- `<dl>` 表示关联列表（association list）
- 不限于术语定义
- 适用于任何名称-值组

**实际应用：**
```html
<!-- 产品规格 -->
<section>
  <h2>iPhone 15 Pro Max</h2>
  <dl>
    <dt>屏幕</dt>
    <dd>6.7英寸 OLED</dd>
    
    <dt>芯片</dt>
    <dd>A17 Pro</dd>
    
    <dt>存储</dt>
    <dd>256GB</dd>
    <dd>512GB</dd>
    <dd>1TB</dd>
    
    <dt>颜色</dt>
    <dd>原色钛金属</dd>
    <dd>蓝色钛金属</dd>
  </dl>
</section>
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 无序列表样式

### 题目

如何移除列表的默认样式（圆点/数字）？

**选项：**
- A. `list-style: none;`
- B. `list-style-type: none;`
- C. `marker: none;`
- D. A 或 B 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**移除列表样式**

**方法 1：`list-style: none`**
```css
ul {
  list-style: none;
}
```

**方法 2：`list-style-type: none`**
```css
ul {
  list-style-type: none;
}
```

两种方法效果相同，`list-style` 是简写属性。

**list-style 完整语法：**
```css
ul {
  /* 简写 */
  list-style: square inside url('marker.png');
  
  /* 等同于 */
  list-style-type: square;      /* 标记类型 */
  list-style-position: inside;  /* 标记位置 */
  list-style-image: url('marker.png'); /* 自定义图标 */
}
```

**list-style-type 值：**
```css
/* 无序列表 */
ul {
  list-style-type: disc;    /* 实心圆（默认） */
  list-style-type: circle;  /* 空心圆 */
  list-style-type: square;  /* 方块 */
  list-style-type: none;    /* 无标记 */
}

/* 有序列表 */
ol {
  list-style-type: decimal;       /* 数字：1, 2, 3 */
  list-style-type: decimal-leading-zero; /* 01, 02, 03 */
  list-style-type: lower-alpha;   /* a, b, c */
  list-style-type: upper-alpha;   /* A, B, C */
  list-style-type: lower-roman;   /* i, ii, iii */
  list-style-type: upper-roman;   /* I, II, III */
}
```

**自定义标记：**
```css
/* 使用图片 */
ul {
  list-style-image: url('check.png');
}

/* 使用伪元素（更灵活） */
ul {
  list-style: none;
  padding-left: 0;
}

ul li {
  padding-left: 1.5rem;
  position: relative;
}

ul li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: green;
}
```

**导航菜单示例：**
```html
<style>
.nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
}

.nav li {
  display: inline;
}
</style>

<ul class="nav">
  <li><a href="/">首页</a></li>
  <li><a href="/about">关于</a></li>
  <li><a href="/contact">联系</a></li>
</ul>
```

**完整重置样式：**
```css
ul, ol {
  list-style: none;
  padding: 0;
  margin: 0;
}
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 列表语义

### 题目

以下哪种情况**不应该**使用列表？

**选项：**
- A. 导航菜单
- B. 步骤说明
- C. 产品特性
- D. 段落文本

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**列表的适用场景**

**✅ 应该使用列表：**

**1. 导航菜单**
```html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

**2. 步骤说明**
```html
<h2>注册步骤</h2>
<ol>
  <li>填写个人信息</li>
  <li>验证邮箱</li>
  <li>设置密码</li>
  <li>完成注册</li>
</ol>
```

**3. 产品特性**
```html
<h2>产品特点</h2>
<ul>
  <li>高性能处理器</li>
  <li>超长续航</li>
  <li>轻薄便携</li>
</ul>
```

**❌ 不应该使用列表：**

**段落文本（连续的叙述性内容）**
```html
<!-- ❌ 错误：用列表 -->
<ul>
  <li>HTML 是超文本标记语言。</li>
  <li>它用于构建网页结构。</li>
  <li>HTML5 是最新版本。</li>
</ul>

<!-- ✅ 正确：用段落 -->
<p>HTML 是超文本标记语言，用于构建网页结构。HTML5 是最新版本。</p>
```

**其他适用场景：**

```html
<!-- 文章目录 -->
<nav>
  <ol>
    <li><a href="#intro">简介</a></li>
    <li><a href="#usage">用法</a></li>
    <li><a href="#examples">示例</a></li>
  </ol>
</nav>

<!-- 标签云 -->
<ul class="tags">
  <li><a href="/tag/html">HTML</a></li>
  <li><a href="/tag/css">CSS</a></li>
  <li><a href="/tag/js">JavaScript</a></li>
</ul>

<!-- 面包屑导航 -->
<ol class="breadcrumb">
  <li><a href="/">首页</a></li>
  <li><a href="/category">分类</a></li>
  <li>当前页</li>
</ol>

<!-- 时间线 -->
<ol class="timeline">
  <li>2020年：成立</li>
  <li>2021年：A轮融资</li>
  <li>2022年：产品上线</li>
</ol>
```

**判断标准：**
- ✅ 多个并列或有序的项目 → 使用列表
- ❌ 连续叙述的段落 → 使用 `<p>`

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 列表最佳实践

### 题目

关于列表的最佳实践，以下说法正确的是？

**选项：**
- A. 导航菜单应该使用 `<nav>` + `<ul>` + `<li>`
- B. 面包屑导航推荐使用 `<ol>`
- C. `<li>` 必须是 `<ul>` 或 `<ol>` 的直接子元素
- D. 可以在 `<li>` 中放置任何内容

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**列表最佳实践（全部正确）**

**1. 导航菜单（A 正确）**
```html
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

**2. 面包屑导航（B 正确）**
```html
<!-- 使用 ol，因为有顺序 -->
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li aria-current="page">当前页</li>
  </ol>
</nav>
```

**3. li 必须是直接子元素（C 正确）**
```html
<!-- ✅ 正确 -->
<ul>
  <li>项目1</li>
  <li>项目2</li>
</ul>

<!-- ❌ 错误 -->
<ul>
  <div>
    <li>项目</li>  <!-- li 不是 ul 的直接子元素 -->
  </div>
</ul>
```

**4. li 可以包含任何内容（D 正确）**
```html
<ul>
  <!-- 文本 -->
  <li>简单文本</li>
  
  <!-- 链接 -->
  <li><a href="/page">链接</a></li>
  
  <!-- 多个元素 -->
  <li>
    <h3>标题</h3>
    <p>描述文本</p>
    <img src="image.jpg" alt="图片">
  </li>
  
  <!-- 嵌套列表 -->
  <li>
    父项目
    <ul>
      <li>子项目1</li>
      <li>子项目2</li>
    </ul>
  </li>
  
  <!-- 表单 -->
  <li>
    <label>姓名：<input type="text"></label>
  </li>
</ul>
```

**完整示例：**

```html
<!-- 产品列表 -->
<ul class="products">
  <li class="product-card">
    <img src="product1.jpg" alt="产品图片">
    <h3>产品名称</h3>
    <p>产品描述文字...</p>
    <div class="price">¥99.00</div>
    <button>加入购物车</button>
  </li>
  
  <li class="product-card">
    <img src="product2.jpg" alt="产品图片">
    <h3>产品名称</h3>
    <p>产品描述文字...</p>
    <div class="price">¥199.00</div>
    <button>加入购物车</button>
  </li>
</ul>

<!-- 带图片的步骤 -->
<ol class="steps">
  <li>
    <div class="step-number">1</div>
    <img src="step1.jpg" alt="步骤1">
    <h4>注册账号</h4>
    <p>填写个人信息完成注册</p>
  </li>
  
  <li>
    <div class="step-number">2</div>
    <img src="step2.jpg" alt="步骤2">
    <h4>验证邮箱</h4>
    <p>点击邮件中的验证链接</p>
  </li>
</ol>
```

**可访问性：**
```html
<!-- 使用 aria-label -->
<nav aria-label="主导航">
  <ul>
    <li><a href="/" aria-current="page">首页</a></li>
    <li><a href="/products">产品</a></li>
  </ul>
</nav>

<!-- 面包屑 -->
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li aria-current="page">当前页</li>
  </ol>
</nav>
```

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 复杂列表

### 题目

创建一个包含嵌套的导航菜单结构。

```
首页
产品
  - 手机
  - 电脑
  - 配件
关于
  - 公司介绍
  - 联系我们
```

<details>
<summary>查看答案</summary>

### ✅ 正确答案

```html
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    
    <li>
      <a href="/products">产品</a>
      <ul>
        <li><a href="/products/phones">手机</a></li>
        <li><a href="/products/computers">电脑</a></li>
        <li><a href="/products/accessories">配件</a></li>
      </ul>
    </li>
    
    <li>
      <a href="/about">关于</a>
      <ul>
        <li><a href="/about/company">公司介绍</a></li>
        <li><a href="/about/contact">联系我们</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### 📖 解析

**嵌套导航菜单**

**基础结构：**
```html
<nav aria-label="主导航">
  <ul>
    <li><a href="/">一级菜单</a></li>
    
    <li>
      <a href="/page">一级菜单（有子菜单）</a>
      <ul>  <!-- 嵌套列表 -->
        <li><a href="/page/sub1">二级菜单1</a></li>
        <li><a href="/page/sub2">二级菜单2</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

**增强版（带 ARIA）：**
```html
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    
    <li>
      <a href="/products" aria-haspopup="true" aria-expanded="false">
        产品
      </a>
      <ul aria-label="产品子菜单">
        <li><a href="/products/phones">手机</a></li>
        <li><a href="/products/computers">电脑</a></li>
        <li><a href="/products/accessories">配件</a></li>
      </ul>
    </li>
    
    <li>
      <a href="/about" aria-haspopup="true" aria-expanded="false">
        关于
      </a>
      <ul aria-label="关于子菜单">
        <li><a href="/about/company">公司介绍</a></li>
        <li><a href="/about/contact">联系我们</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

**CSS 样式：**
```css
nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav > ul {
  display: flex;
  gap: 1rem;
}

nav li {
  position: relative;
}

/* 隐藏子菜单 */
nav ul ul {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 200px;
}

/* 悬停显示子菜单 */
nav li:hover > ul {
  display: block;
}

nav ul ul li {
  display: block;
}

nav a {
  display: block;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #333;
}

nav a:hover {
  background: #f0f0f0;
}
```

**JavaScript 交互：**
```javascript
document.querySelectorAll('nav li > a[aria-haspopup]').forEach(link => {
  link.addEventListener('click', (e) => {
    const submenu = link.nextElementSibling;
    if (submenu && submenu.tagName === 'UL') {
      e.preventDefault();
      const expanded = link.getAttribute('aria-expanded') === 'true';
      link.setAttribute('aria-expanded', !expanded);
      submenu.style.display = expanded ? 'none' : 'block';
    }
  });
});
```

**响应式移动端：**
```css
@media (max-width: 768px) {
  nav > ul {
    flex-direction: column;
  }
  
  nav ul ul {
    position: static;
    box-shadow: none;
    padding-left: 1rem;
  }
}
```

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 列表可访问性

### 题目

为了提升列表的可访问性，应该采取哪些措施？

**选项：**
- A. 使用 `aria-label` 描述列表用途
- B. 为当前页面的导航项添加 `aria-current="page"`
- C. 确保键盘可以导航所有列表项
- D. 使用语义化的列表标签而不是 `<div>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**列表可访问性（全部正确）**

**1. 使用 aria-label（A 正确）**
```html
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
  </ul>
</nav>

<nav aria-label="页脚链接">
  <ul>
    <li><a href="/privacy">隐私政策</a></li>
  </ul>
</nav>

<ul aria-label="产品特性列表">
  <li>高性能</li>
  <li>低功耗</li>
</ul>
```

**2. aria-current（B 正确）**
```html
<nav aria-label="主导航">
  <ul>
    <li><a href="/" aria-current="page">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>

<!-- 面包屑 -->
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li aria-current="page">当前页</li>
  </ol>
</nav>
```

**3. 键盘导航（C 正确）**
```html
<!-- 确保链接可聚焦 -->
<ul>
  <li><a href="/page1" tabindex="0">页面1</a></li>
  <li><a href="/page2" tabindex="0">页面2</a></li>
</ul>

<!-- JavaScript 增强键盘导航 -->
<script>
const navItems = document.querySelectorAll('nav a');

navItems.forEach((item, index) => {
  item.addEventListener('keydown', (e) => {
    let newIndex;
    
    // 上下箭头导航
    if (e.key === 'ArrowDown') {
      newIndex = (index + 1) % navItems.length;
      navItems[newIndex].focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      newIndex = (index - 1 + navItems.length) % navItems.length;
      navItems[newIndex].focus();
      e.preventDefault();
    }
  });
});
</script>
```

**4. 语义化标签（D 正确）**
```html
<!-- ❌ 不可访问 -->
<div class="menu">
  <div class="item">首页</div>
  <div class="item">产品</div>
</div>

<!-- ✅ 可访问 -->
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
  </ul>
</nav>
```

**完整可访问导航示例：**
```html
<nav aria-label="主导航" role="navigation">
  <ul role="menubar">
    <li role="none">
      <a href="/" 
         role="menuitem"
         aria-current="page"
         tabindex="0">
        首页
      </a>
    </li>
    
    <li role="none">
      <a href="/products"
         role="menuitem"
         aria-haspopup="true"
         aria-expanded="false"
         tabindex="-1">
        产品
      </a>
      <ul role="menu" aria-label="产品子菜单">
        <li role="none">
          <a href="/products/phones" role="menuitem" tabindex="-1">
            手机
          </a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

**屏幕阅读器友好：**
```html
<!-- 跳转链接 -->
<a href="#main-content" class="skip-link">
  跳转到主要内容
</a>

<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
  </ul>
</nav>

<main id="main-content">
  <!-- 主要内容 -->
</main>
```

**CSS 隐藏（屏幕阅读器仍可读）：**
```css
.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  left: 0;
  top: 0;
  z-index: 9999;
  padding: 1rem;
  background: #000;
  color: #fff;
}
```

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** 列表vs其他元素

### 题目

对比以下两种实现导航的方式，说明哪种更好，为什么？

```html
<!-- 方式 A -->
<div class="nav">
  <a href="/">首页</a>
  <a href="/products">产品</a>
  <a href="/about">关于</a>
</div>

<!-- 方式 B -->
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

<details>
<summary>查看答案</summary>

### 📖 解析

**方式 B 明显更优**

**对比分析：**

| 特性 | 方式A | 方式B |
|------|-------|-------|
| **语义化** | ❌ 无 | ✅ `<nav>` + `<ul>` |
| **可访问性** | ❌ 差 | ✅ 好 |
| **SEO** | ❌ 一般 | ✅ 更好 |
| **屏幕阅读器** | ❌ 无结构信息 | ✅ 识别为导航 |
| **键盘导航** | ⚠️ 需要额外工作 | ✅ 更容易实现 |

**1. 语义化**
```html
<!-- 方式 A：无语义 -->
<div class="nav">  <!-- 仅是通用容器 -->
  <a>...</a>
</div>

<!-- 方式 B：清晰的语义 -->
<nav>  <!-- 明确是导航区域 -->
  <ul>  <!-- 列表结构 -->
    <li>  <!-- 列表项 -->
```

**2. 可访问性**
```html
<!-- 方式 A：屏幕阅读器读取 -->
"链接：首页，链接：产品，链接：关于"

<!-- 方式 B：屏幕阅读器读取 -->
"导航，主导航
列表，3个项目
项目1，链接：首页
项目2，链接：产品
项目3，链接：关于
列表结束"
```

**3. 样式化**
```css
/* 方式 A：需要特殊处理间距 */
.nav a {
  margin-right: 1rem;
}

/* 方式 B：列表天然适合布局 */
nav ul {
  display: flex;
  gap: 1rem;  /* 自动间距 */
  list-style: none;
}
```

**4. 扩展性**
```html
<!-- 方式 A：难以添加子菜单 -->
<div class="nav">
  <a href="/products">产品</a>
  <div class="submenu">  <!-- 嵌套困难 -->
    <a href="/phones">手机</a>
  </div>
</div>

<!-- 方式 B：嵌套自然 -->
<nav>
  <ul>
    <li>
      <a href="/products">产品</a>
      <ul>  <!-- 嵌套列表 -->
        <li><a href="/phones">手机</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

**最佳实践：**
```html
<nav aria-label="主导航" role="navigation">
  <ul>
    <li>
      <a href="/" aria-current="page">首页</a>
    </li>
    <li>
      <a href="/products" aria-haspopup="true">产品</a>
      <ul aria-label="产品子菜单">
        <li><a href="/phones">手机</a></li>
        <li><a href="/computers">电脑</a></li>
      </ul>
    </li>
    <li>
      <a href="/about">关于</a>
    </li>
  </ul>
</nav>

<style>
nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
}

nav ul ul {
  display: none;
  position: absolute;
  flex-direction: column;
}

nav li:hover > ul {
  display: flex;
}

nav a {
  display: block;
  padding: 0.5rem 1rem;
  text-decoration: none;
}
</style>
```

**总结：**
- ✅ **语义化**：使用 `<nav>` 和 `<ul>`
- ✅ **可访问性**：添加 `aria-label` 和 `aria-current`
- ✅ **结构清晰**：列表天然适合导航
- ✅ **易于维护**：标签本身说明用途
- ✅ **SEO 友好**：搜索引擎更好理解

</details>

---

**📌 本章总结**

- HTML 有三种列表：有序列表 `<ol>`、无序列表 `<ul>`、定义列表 `<dl>`
- 列表可以嵌套，嵌套列表应放在 `<li>` 内
- 有序列表支持 `start`、`type`、`reversed` 属性
- 定义列表适用于键值对、FAQ、对话等场景
- 导航菜单应该使用 `<nav>` + `<ul>` + `<li>`
- 移除列表样式：`list-style: none`
- 可访问性：使用 `aria-label`、`aria-current`、确保键盘导航

**上一章** ← [第 4 章：文本内容标签](./chapter-04.md)  
**下一章** → [第 6 章：链接与导航](./chapter-06.md)
