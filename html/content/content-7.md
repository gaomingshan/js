# 块级元素与内联元素

## 核心概念

**块级元素**（Block-level）和**内联元素**（Inline）是 HTML 的两种基本**显示类型**，它们决定了元素在页面中的布局方式。

```html
<!-- 块级元素：独占一行 -->
<div>块级容器</div>
<p>段落</p>

<!-- 内联元素：在文本流中 -->
<span>内联容器</span> <strong>加粗</strong>
```

**关键认知**：
- 块级/内联是**显示特性**，由 CSS `display` 属性控制
- 与内容模型（Flow/Phrasing）是**正交的概念**

**后端类比**：
- 块级元素 ≈ 独立的函数/方法
- 内联元素 ≈ 表达式/变量

## 块级与内联的本质：布局容器 vs 文本流

### 块级元素的特性

**定义**：独占一行，可以设置宽度、高度、内外边距。

```html
<div style="width: 300px; height: 100px; margin: 20px; padding: 10px; background: #f0f0f0;">
  块级元素
</div>
<p>下一个块级元素</p>
```

**默认行为**：
```
┌────────────────────────┐
│ 块级元素 1             │
└────────────────────────┘
┌────────────────────────┐
│ 块级元素 2             │
└────────────────────────┘
```

**特点**：
1. **独占一行**：后续内容会换行
2. **可设置宽高**：默认宽度 100%
3. **垂直排列**：多个块级元素纵向堆叠
4. **可包含块级和内联**：内容模型灵活

**常见块级元素**：
- 容器：`<div>`, `<section>`, `<article>`
- 文本：`<p>`, `<h1>`-`<h6>`, `<blockquote>`
- 列表：`<ul>`, `<ol>`, `<li>`, `<dl>`
- 表格：`<table>`, `<tr>`, `<td>`
- 表单：`<form>`, `<fieldset>`

### 内联元素的特性

**定义**：在文本流中，只占据内容所需的空间。

```html
<p>
  这是一段文字，包含
  <span style="background: yellow;">内联元素</span>
  和 <strong>加粗文字</strong>。
</p>
```

**默认行为**：
```
这是一段文字，包含[内联元素]和[加粗文字]。
文字会自动换行，内联元素随文字流动。
```

**特点**：
1. **不独占一行**：与其他内联元素并排
2. **宽高受限**：`width`/`height` 无效（除非设置 `display: inline-block`）
3. **水平排列**：多个内联元素横向排列
4. **只能包含内联**：不能包含块级元素（部分例外）

**常见内联元素**：
- 容器：`<span>`
- 文本：`<a>`, `<strong>`, `<em>`, `<code>`
- 多媒体：`<img>`, `<svg>`
- 表单：`<input>`, `<button>`, `<select>`

### 块级 vs 内联对比表

| 特性 | 块级元素 | 内联元素 |
|------|---------|---------|
| 占用空间 | 独占一行 | 只占内容宽度 |
| 默认宽度 | 100%（父容器） | 内容宽度 |
| 高度 | 可设置 | 不可设置（由内容决定） |
| 内外边距 | 四个方向都有效 | 水平有效，垂直无效 |
| 可包含 | 块级 + 内联 | 仅内联 |
| 排列方式 | 垂直堆叠 | 水平排列 |

**后端类比**：
- 块级 ≈ 类定义（独立、完整）
- 内联 ≈ 变量引用（嵌入在代码流中）

## display 属性与标签默认行为

### display 属性的作用

**display** 属性控制元素的显示类型，可以改变默认行为：

```css
/* 块级变内联 */
div { display: inline; }

/* 内联变块级 */
span { display: block; }

/* 混合：inline-block */
span { display: inline-block; }

/* 隐藏元素 */
div { display: none; }
```

### display 的常用值

#### 1. block（块级）

```html
<span style="display: block; width: 200px; height: 50px; background: #f0f0f0;">
  内联元素变块级
</span>
```

**效果**：
- 独占一行
- 可设置宽高
- 垂直排列

#### 2. inline（内联）

```html
<div style="display: inline; background: yellow;">
  块级元素变内联
</div>
<div style="display: inline; background: lightblue;">
  第二个内联
</div>
```

**效果**：
- 不独占一行
- 宽高无效
- 水平排列

**注意**：`width`, `height`, `margin-top`, `margin-bottom` 会失效。

#### 3. inline-block（内联块级）

```html
<span style="display: inline-block; width: 100px; height: 50px; background: #f0f0f0;">
  内联块
</span>
<span style="display: inline-block; width: 100px; height: 50px; background: #e0e0e0;">
  内联块
</span>
```

**效果**：
- 水平排列（像 inline）
- 可设置宽高（像 block）
- **最佳实践**：用于导航菜单、按钮组

**典型场景**：

```css
/* 导航菜单 */
nav a {
  display: inline-block;
  padding: 10px 20px;
  background: #333;
  color: white;
}

/* 图片排列 */
.gallery img {
  display: inline-block;
  width: 200px;
  height: 200px;
  margin: 5px;
}
```

#### 4. none（隐藏）

```html
<div style="display: none;">
  这个元素不显示，也不占空间
</div>
```

**对比 visibility: hidden**：

```html
<!-- display: none - 不占空间 -->
<div style="display: none;">元素 1</div>
<div>元素 2</div>  <!-- 紧贴上方 -->

<!-- visibility: hidden - 占空间 -->
<div style="visibility: hidden;">元素 1</div>
<div>元素 2</div>  <!-- 元素 1 的空间被保留 -->
```

**后端类比**：
- `display: none` ≈ 条件编译（代码不存在）
- `visibility: hidden` ≈ 注释（代码存在但不执行）

#### 5. flex / grid（现代布局）

```html
<div style="display: flex; gap: 10px;">
  <div>项目 1</div>
  <div>项目 2</div>
  <div>项目 3</div>
</div>
```

**特点**：
- 容器变为弹性/网格布局
- 子元素成为 flex/grid 项目
- 强大的布局能力

### 标签的默认 display 值

```javascript
// 查看元素的默认 display
const div = document.createElement('div');
console.log(getComputedStyle(div).display);  // "block"

const span = document.createElement('span');
console.log(getComputedStyle(span).display);  // "inline"
```

**默认值列表**：

```
block:
  div, p, h1-h6, ul, ol, li, section, article, 
  header, footer, nav, aside, main, form, table

inline:
  span, a, strong, em, code, img, input, button

inline-block:
  img (在某些浏览器)

table:
  table

table-row:
  tr

table-cell:
  td, th
```

## 常见误区：div/span 滥用与语义缺失

### 误区 1：所有容器都用 div

**错误做法**：

```html
<div class="header">
  <div class="title">网站名称</div>
  <div class="nav">
    <div class="nav-item">首页</div>
    <div class="nav-item">关于</div>
  </div>
</div>
<div class="main">
  <div class="article">
    <div class="article-title">文章标题</div>
    <div class="article-content">文章内容</div>
  </div>
</div>
```

**问题**：
1. **语义缺失**：无法理解文档结构
2. **可访问性差**：屏幕阅读器无法识别
3. **SEO 受损**：搜索引擎无法正确解析
4. **维护困难**：需要读 CSS 才能理解结构

**正确做法**：

```html
<header>
  <h1>网站名称</h1>
  <nav>
    <a href="/">首页</a>
    <a href="/about">关于</a>
  </nav>
</header>
<main>
  <article>
    <h2>文章标题</h2>
    <p>文章内容</p>
  </article>
</main>
```

**后端类比**：类似于所有字段都用 `VARCHAR` vs 使用正确的数据类型。

### 误区 2：用 span 包裹所有文字

**错误做法**：

```html
<p>
  <span>这</span>
  <span>是</span>
  <span>一</span>
  <span>段</span>
  <span>文</span>
  <span>字</span>
</p>
```

**问题**：
- 无意义的标签嵌套
- 增加 DOM 节点，影响性能
- 代码冗余

**正确做法**：

```html
<!-- 只在需要样式或脚本钩子时使用 span -->
<p>
  这是一段文字，其中 <span class="highlight">这部分</span> 需要高亮。
</p>
```

### 误区 3：用 div 模拟所有元素

**错误做法**：

```html
<!-- 用 div 模拟按钮 -->
<div class="button" onclick="submit()">提交</div>

<!-- 用 div 模拟链接 -->
<div class="link" onclick="navigate()">链接</div>

<!-- 用 div 模拟列表 -->
<div class="list">
  <div class="item">项目 1</div>
  <div class="item">项目 2</div>
</div>
```

**问题**：
1. **失去原生功能**：键盘导航、焦点管理
2. **可访问性差**：屏幕阅读器无法识别
3. **需要手动实现**：事件处理、状态管理

**正确做法**：

```html
<!-- 使用原生元素 -->
<button type="submit">提交</button>
<a href="/page">链接</a>
<ul>
  <li>项目 1</li>
  <li>项目 2</li>
</ul>
```

### 何时使用 div 和 span

**div 的合理使用**：

```html
<!-- 1. 纯布局容器（无语义） -->
<div class="container">
  <div class="row">
    <div class="col">列 1</div>
    <div class="col">列 2</div>
  </div>
</div>

<!-- 2. 样式包装器 -->
<div class="card">
  <h3>卡片标题</h3>
  <p>卡片内容</p>
</div>

<!-- 3. JavaScript 钩子 -->
<div id="app"></div>
```

**span 的合理使用**：

```html
<!-- 1. 局部样式应用 -->
<p>这是 <span class="highlight">重点</span> 内容。</p>

<!-- 2. 内联图标包装 -->
<button>
  <span class="icon">📁</span>
  <span class="text">保存</span>
</button>

<!-- 3. JavaScript 操作 -->
<p>价格：<span id="price">$99</span></p>
```

**原则**：
- 有语义 → 用语义标签
- 纯布局/样式 → 用 div/span

**后端类比**：
- 语义标签 ≈ 业务模型类
- div/span ≈ 工具类/辅助方法

## 工程实践示例

### 场景 1：响应式导航菜单

```html
<nav class="main-nav">
  <a href="/" class="nav-item">首页</a>
  <a href="/products" class="nav-item">产品</a>
  <a href="/about" class="nav-item">关于</a>
</nav>

<style>
.main-nav {
  display: flex;
  gap: 20px;
  padding: 10px;
  background: #333;
}

.nav-item {
  /* inline-block 允许设置 padding */
  display: inline-block;
  padding: 10px 20px;
  color: white;
  text-decoration: none;
}

.nav-item:hover {
  background: #555;
}

/* 移动端：垂直排列 */
@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
  }
  
  .nav-item {
    display: block;  /* 独占一行 */
  }
}
</style>
```

### 场景 2：卡片列表布局

```html
<div class="card-grid">
  <article class="card">
    <h3>卡片 1</h3>
    <p>内容...</p>
  </article>
  <article class="card">
    <h3>卡片 2</h3>
    <p>内容...</p>
  </article>
  <article class="card">
    <h3>卡片 3</h3>
    <p>内容...</p>
  </article>
</div>

<style>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  /* 语义标签 article，但表现为块级 */
  display: block;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
```

### 场景 3：行内图标与文字

```html
<button class="icon-button">
  <span class="icon">🔍</span>
  <span class="text">搜索</span>
</button>

<style>
.icon-button {
  display: inline-flex;  /* 内联 + flex 布局 */
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.icon {
  /* 内联元素，随文字流动 */
  display: inline;
  font-size: 16px;
}

.text {
  display: inline;
}
</style>
```

### 场景 4：后端渲染不同显示类型

```javascript
// Node.js 服务端
function renderList(items, layout = 'vertical') {
  const displayType = layout === 'horizontal' ? 'inline-block' : 'block';
  
  const html = `
    <ul style="list-style: none; padding: 0;">
      ${items.map(item => `
        <li style="display: ${displayType}; margin: 10px;">
          ${item}
        </li>
      `).join('')}
    </ul>
  `;
  
  return html;
}

// 使用
app.get('/menu', (req, res) => {
  const menuItems = ['首页', '产品', '关于'];
  const isMobile = req.headers['user-agent'].includes('Mobile');
  
  const html = renderList(menuItems, isMobile ? 'vertical' : 'horizontal');
  res.send(html);
});
```

## 深入一点：块级格式化上下文（BFC）

### BFC 的概念

**块级格式化上下文**（Block Formatting Context）是页面中独立的渲染区域，内部元素的布局不影响外部。

**创建 BFC 的方式**：

```css
/* 1. 根元素 */
html { /* 自动创建 BFC */ }

/* 2. float */
.float-box { float: left; }

/* 3. position: absolute/fixed */
.absolute-box { position: absolute; }

/* 4. display: inline-block */
.inline-block-box { display: inline-block; }

/* 5. overflow 非 visible */
.overflow-box { overflow: hidden; }

/* 6. display: flex/grid */
.flex-box { display: flex; }
```

### BFC 的特性

**1. 包含浮动元素**：

```html
<div class="container" style="overflow: hidden;">
  <!-- 创建 BFC -->
  <div style="float: left; width: 100px; height: 100px; background: red;"></div>
  <p>文字</p>
</div>
```

**2. 阻止外边距折叠**：

```html
<div style="overflow: hidden;">  <!-- BFC 容器 -->
  <p style="margin: 20px;">段落 1</p>
  <p style="margin: 20px;">段落 2</p>
  <!-- 外边距不折叠，间距为 40px -->
</div>
```

**3. 阻止元素被浮动元素覆盖**：

```html
<div style="float: left; width: 100px; height: 100px; background: red;"></div>
<div style="overflow: hidden; background: blue;">
  <!-- 创建 BFC，不会被浮动元素覆盖 -->
  内容
</div>
```

**后端类比**：BFC 类似于作用域（Scope），内部变量不会泄漏到外部。

### 常见应用场景

**清除浮动**：

```html
<div class="clearfix">
  <div style="float: left;">浮动元素</div>
</div>

<style>
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

/* 或者使用 BFC */
.clearfix {
  overflow: hidden;
}
</style>
```

## 参考资源

- [HTML Living Standard - Flow Content](https://html.spec.whatwg.org/multipage/dom.html#flow-content)
- [MDN - Block-level Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements)
- [MDN - Inline Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements)
- [CSS - Display Property](https://developer.mozilla.org/en-US/docs/Web/CSS/display)
- [CSS - Block Formatting Context](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context)
