# 第 2 章：文档结构与语法 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 文档结构

### 题目

一个标准的 HTML5 文档必须包含哪三个基本部分？

**选项：**
- A. `<!DOCTYPE>`, `<html>`, `<body>`
- B. `<!DOCTYPE>`, `<head>`, `<body>`
- C. `<html>`, `<head>`, `<body>`
- D. `<!DOCTYPE>`, `<html>`, `<meta>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**HTML5 文档的三个基本部分**

```html
<!DOCTYPE html>  <!-- 不是 HTML 元素，是文档类型声明 -->
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <title>标题</title>
  </head>
  <body>
    <h1>内容</h1>
  </body>
</html>
```

**关键点：**
- `<!DOCTYPE html>` 是**文档类型声明**，不是 HTML 元素
- `<html>` 是**根元素**，包含所有内容
- `<head>` 包含**元数据**（不显示在页面上）
- `<body>` 包含**可见内容**

**必须的三个元素：** `<html>`, `<head>`, `<body>`

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** HTML 注释

### 题目

HTML 注释可以嵌套使用。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**HTML 注释不能嵌套**

```html
<!-- 正确的注释 -->
<p>内容</p>

<!-- ❌ 错误：嵌套注释 -->
<!-- 外层注释
  <!-- 内层注释 -->
结束 -->

<!-- ✅ 正确：分开注释 -->
<!-- 第一段注释 -->
<!-- 第二段注释 -->
```

**注释语法规则：**
- 以 `<!--` 开始
- 以 `-->` 结束
- 不能嵌套
- 不能在标签内使用

```html
<!-- ❌ 错误用法 -->
<div <!-- 注释 --> class="box">

<!-- ✅ 正确用法 -->
<!-- 这是一个容器 -->
<div class="box">
```

**实际应用：**
```html
<!-- TODO: 待完成的功能 -->
<!-- <div>临时禁用的代码</div> -->
<!-- BUG FIX: 修复了某个问题 -->
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 标签规则

### 题目

在 HTML5 中，以下哪种写法是**正确的**？

**选项：**
- A. `<IMG SRC="photo.jpg">`
- B. `<img src="photo.jpg">`
- C. `<Img Src="photo.jpg">`
- D. 以上都正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**HTML5 标签大小写不敏感**

```html
<!-- 以下写法在 HTML5 中都有效 -->
<IMG SRC="photo.jpg" ALT="图片">
<img src="photo.jpg" alt="图片">
<Img Src="photo.jpg" Alt="图片">
```

**但是，推荐使用小写：**

```html
<!-- ✅ 推荐：全部小写 -->
<img src="photo.jpg" alt="图片">
<div class="container">
  <p>段落</p>
</div>

<!-- ❌ 不推荐：大写或混合 -->
<IMG SRC="photo.jpg">
<Div Class="container">
```

**为什么推荐小写？**
- ✅ 可读性更好
- ✅ 符合现代编码规范
- ✅ 与 XHTML 兼容
- ✅ 代码风格统一

**HTML5 vs XHTML：**
```html
<!-- XHTML：严格要求小写 -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>xhtml</title>
</head>
<body>
  <img src="photo.jpg" alt="图片" />  <!-- 必须小写和自闭合 -->
</body>
</html>

<!-- HTML5：灵活但推荐小写 -->
<!DOCTYPE html>
<html>
<head>
  <title>html5</title>
</head>
<body>
  <img src="photo.jpg" alt="图片">  <!-- 推荐小写 -->
</body>
</html>
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 特殊字符

### 题目

在 HTML 中，以下哪些字符需要使用实体编码？

**选项：**
- A. `<` 和 `>`
- B. `&`
- C. 空格
- D. `"` 和 `'`（在属性值中）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, D

### 📖 解析

**HTML 特殊字符实体编码**

**1. 必须转义的字符**

```html
<!-- ❌ 错误：直接使用 -->
<p>3 < 5 && 5 > 3</p>
<p>A & B</p>

<!-- ✅ 正确：使用实体 -->
<p>3 &lt; 5 &amp;&amp; 5 &gt; 3</p>
<p>A &amp; B</p>
```

**常用实体表：**

| 字符 | 实体名称 | 实体编号 | 说明 |
|------|---------|---------|------|
| `<` | `&lt;` | `&#60;` | 小于号 |
| `>` | `&gt;` | `&#62;` | 大于号 |
| `&` | `&amp;` | `&#38;` | 和号 |
| `"` | `&quot;` | `&#34;` | 双引号 |
| `'` | `&apos;` | `&#39;` | 单引号 |
| ` ` | `&nbsp;` | `&#160;` | 不间断空格 |

**2. 属性值中的引号**

```html
<!-- 属性值中的引号需要转义 -->
<button title="Click &quot;OK&quot; to continue">按钮</button>
<a href="#" data-msg='She said &apos;Hello&apos;'>链接</a>

<!-- 或使用不同的引号 -->
<button title='Click "OK" to continue'>按钮</button>
```

**3. 空格的处理**

```html
<!-- 普通空格：会被压缩 -->
<p>多个    空格    会被    压缩</p>
<!-- 显示：多个 空格 会被 压缩 -->

<!-- 不间断空格：不会压缩 -->
<p>多个&nbsp;&nbsp;&nbsp;&nbsp;空格</p>
<!-- 显示：多个    空格 -->

<!-- 预格式化：保留所有空格 -->
<pre>多个    空格    保留</pre>
```

**4. 其他常用实体**

```html
<!-- 版权符号 -->
&copy; 2024

<!-- 商标 -->
&reg; &trade;

<!-- 货币 -->
&yen; &euro; &pound;

<!-- 数学符号 -->
&times; &divide; &plusmn;

<!-- 箭头 -->
&larr; &rarr; &uarr; &darr;
```

**5. Unicode 字符**

```html
<!-- 使用十进制 -->
&#128512; <!-- 😀 -->

<!-- 使用十六进制 -->
&#x1F600; <!-- 😀 -->
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 语法规则

### 题目

以下代码有什么问题？

```html
<div class="container">
  <p>段落1
  <p>段落2</p>
  <span>文本
</div>
```

**选项：**
- A. 缺少 `</p>` 闭合标签
- B. 缺少 `</span>` 闭合标签
- C. `<span>` 不能在 `<div>` 内
- D. 以上都正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D（实际应该是 A 和 B）

### 📖 解析

**HTML 标签闭合规则**

**问题代码分析：**

```html
<div class="container">
  <p>段落1      <!-- ❌ 缺少 </p> -->
  <p>段落2</p>  <!-- ✅ 正确闭合 -->
  <span>文本    <!-- ❌ 缺少 </span> -->
</div>
```

**修正后：**

```html
<!-- ✅ 正确写法 -->
<div class="container">
  <p>段落1</p>
  <p>段落2</p>
  <span>文本</span>
</div>
```

**可选闭合标签（HTML5）**

某些标签的闭合标签是可选的：

```html
<!-- <p> 的闭合标签可选 -->
<p>段落1
<p>段落2
<!-- 浏览器会自动补全，但不推荐 -->

<!-- <li> 的闭合标签可选 -->
<ul>
  <li>项目1
  <li>项目2
</ul>

<!-- ✅ 推荐：始终闭合 -->
<ul>
  <li>项目1</li>
  <li>项目2</li>
</ul>
```

**嵌套规则：**

```html
<!-- ❌ 错误：标签交叉 -->
<p><strong>粗体<em>斜体</strong></em></p>

<!-- ✅ 正确：正确嵌套 -->
<p><strong>粗体<em>斜体</em></strong></p>

<!-- ❌ 错误：块级元素在行内元素内 -->
<span>
  <div>内容</div>
</span>

<!-- ✅ 正确 -->
<div>
  <span>内容</span>
</div>
```

**最佳实践：**
- ✅ 始终闭合标签
- ✅ 保持正确嵌套
- ✅ 使用代码格式化工具
- ✅ 使用 HTML 验证器

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 空白字符

### 题目

HTML 如何处理多个连续的空格、换行和制表符？

**选项：**
- A. 保留所有空白字符
- B. 将多个空白字符压缩为一个空格
- C. 删除所有空白字符
- D. 保留换行，压缩空格

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**HTML 空白字符处理规则**

**默认行为：压缩空白**

```html
<!-- 源代码 -->
<p>这是    一段
   有很多
      空白字符的    文本</p>

<!-- 浏览器显示 -->
这是 一段 有很多 空白字符的 文本
```

**空白字符包括：**
- 空格（Space）
- 制表符（Tab）
- 换行符（Line Feed）
- 回车符（Carriage Return）

**保留空白的方法：**

**1. `<pre>` 标签**
```html
<pre>
这是    一段
   有很多
      空白字符的    文本
</pre>
```

**2. CSS `white-space` 属性**
```html
<p style="white-space: pre;">这是    一段
   有很多空白的文本</p>

<style>
.preserve {
  white-space: pre;      /* 保留所有空白 */
  white-space: pre-wrap; /* 保留空白，允许换行 */
  white-space: pre-line; /* 保留换行，压缩空格 */
  white-space: nowrap;   /* 不换行 */
}
</style>
```

**3. 使用 `&nbsp;`（不间断空格）**
```html
<p>多个&nbsp;&nbsp;&nbsp;&nbsp;空格</p>
```

**实际示例：**

```html
<!-- 源代码格式化 -->
<div class="card">
  <h2>标题</h2>
  <p>内容</p>
</div>

<!-- 浏览器会忽略缩进和换行 -->
<div class="card"><h2>标题</h2><p>内容</p></div>

<!-- 两种写法显示效果相同 -->
```

**代码块显示：**
```html
<!-- 显示代码，需要保留空白 -->
<pre><code>function hello() {
  console.log('Hello');
}</code></pre>
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 属性规则

### 题目

关于 HTML 属性，以下说法正确的是？

**选项：**
- A. 属性名不区分大小写
- B. 属性值推荐使用双引号
- C. 布尔属性可以省略值
- D. 属性可以没有值

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**HTML 属性规则（全部正确）**

**1. 属性名不区分大小写**

```html
<!-- 以下写法都有效 -->
<input TYPE="text" CLASS="input">
<input type="text" class="input">
<input Type="text" Class="input">

<!-- ✅ 推荐：全部小写 -->
<input type="text" class="input">
```

**2. 属性值的引号**

```html
<!-- 双引号（推荐） -->
<div class="container">

<!-- 单引号 -->
<div class='container'>

<!-- 无引号（某些情况可以） -->
<div class=container>

<!-- ❌ 有空格必须用引号 -->
<div class=my container>  <!-- 错误 -->
<div class="my container"> <!-- 正确 -->
```

**3. 布尔属性**

```html
<!-- 完整写法 -->
<input type="checkbox" checked="checked">
<input type="text" disabled="disabled">
<button autofocus="autofocus">

<!-- 简写（推荐） -->
<input type="checkbox" checked>
<input type="text" disabled>
<button autofocus>

<!-- 空字符串也表示 true -->
<input type="checkbox" checked="">
```

**常见布尔属性：**
- `checked` - 复选框/单选框选中
- `disabled` - 禁用
- `readonly` - 只读
- `required` - 必填
- `selected` - 下拉选项选中
- `autofocus` - 自动聚焦
- `multiple` - 多选
- `hidden` - 隐藏

**4. 自定义属性**

```html
<!-- HTML5 data-* 属性 -->
<div data-id="123" data-name="John" data-role="admin">

<!-- 访问 -->
<script>
const el = document.querySelector('div');
console.log(el.dataset.id);   // "123"
console.log(el.dataset.name); // "John"
console.log(el.dataset.role); // "admin"
</script>
```

**5. 属性顺序（推荐）**

```html
<!-- 推荐顺序 -->
<input 
  type="text"           <!-- 类型 -->
  id="username"         <!-- ID -->
  class="form-control"  <!-- Class -->
  name="username"       <!-- 名称 -->
  value=""              <!-- 值 -->
  placeholder="用户名"  <!-- 占位符 -->
  required              <!-- 验证 -->
  disabled              <!-- 状态 -->
>
```

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 字符编码

### 题目

如何正确设置 HTML 文档的字符编码？请补全代码。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  ______
  <title>网页</title>
</head>
<body>
  <p>中文内容</p>
</body>
</html>
```

**选项：**
- A. `<meta charset="UTF-8">`
- B. `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">`
- C. `<charset>UTF-8</charset>`
- D. A 或 B

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**字符编码设置方法**

**方法1：HTML5 简写（推荐）**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>网页</title>
</head>
<body>
  <p>中文内容</p>
</body>
</html>
```

**方法2：HTML4 写法**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>网页</title>
</head>
<body>
  <p>中文内容</p>
</body>
</html>
```

**两种方法都有效，但 HTML5 简写更推荐**

**重要规则：**

**1. 位置：必须在 `<title>` 之前**

```html
<!-- ❌ 错误：charset 在 title 之后 -->
<head>
  <title>网页</title>
  <meta charset="UTF-8">
</head>

<!-- ✅ 正确：charset 在 title 之前 -->
<head>
  <meta charset="UTF-8">
  <title>网页</title>
</head>
```

**2. 必须在前 1024 字节内**

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 不要在 <meta charset> 之前有太多内容 -->
  <meta charset="UTF-8">
  ...
```

**3. 文件保存编码要匹配**

```
声明 UTF-8 → 文件也要用 UTF-8 保存
声明 GBK   → 文件也要用 GBK 保存
```

**4. 服务器响应头**

```http
Content-Type: text/html; charset=UTF-8
```

**优先级：**
```
HTTP Header > <meta charset> > 浏览器默认
```

**完整最佳实践：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>网页标题</title>
</head>
<body>
  <h1>内容</h1>
</body>
</html>
```

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 语义化

### 题目

关于 HTML 语义化，以下说法正确的是？

**选项：**
- A. 使用正确的标签描述内容的含义和结构
- B. 有利于 SEO（搜索引擎优化）
- C. 提升可访问性（辅助技术可以更好地理解）
- D. 代码更易维护和理解

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**HTML 语义化的重要性（全部正确）**

**1. 正确使用语义标签**

```html
<!-- ❌ 不语义化 -->
<div class="header">
  <div class="nav">
    <div class="menu">菜单</div>
  </div>
</div>
<div class="content">
  <div class="article">
    <div class="title">标题</div>
    <div class="text">内容</div>
  </div>
</div>

<!-- ✅ 语义化 -->
<header>
  <nav>
    <ul>
      <li>菜单</li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>标题</h1>
    <p>内容</p>
  </article>
</main>
```

**2. SEO 优势**

```html
<!-- 搜索引擎可以更好地理解页面结构 -->
<article>
  <header>
    <h1>文章标题</h1>  <!-- 搜索引擎知道这是主标题 -->
    <time datetime="2024-01-15">2024年1月15日</time>
  </header>
  
  <section>
    <h2>第一部分</h2>
    <p>内容...</p>
  </section>
  
  <footer>
    <p>作者：张三</p>
  </footer>
</article>
```

**3. 可访问性（Accessibility）**

```html
<!-- 屏幕阅读器可以识别页面结构 -->
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>

<main>
  <h1>页面主标题</h1>
  <article>
    <h2>文章标题</h2>
    <p>内容</p>
  </article>
</main>

<aside aria-label="侧边栏">
  <h2>相关链接</h2>
  <ul>...</ul>
</aside>
```

**4. 代码可维护性**

```html
<!-- ❌ 难以维护 -->
<div class="box1">
  <div class="box2">
    <div class="box3">内容</div>
  </div>
</div>

<!-- ✅ 易于理解 -->
<article>
  <header>
    <h1>文章标题</h1>
  </header>
  <section>
    <p>内容</p>
  </section>
</article>
```

**常用语义标签：**

| 标签 | 含义 |
|------|------|
| `<header>` | 页眉/头部 |
| `<nav>` | 导航 |
| `<main>` | 主内容 |
| `<article>` | 独立文章 |
| `<section>` | 章节 |
| `<aside>` | 侧边栏 |
| `<footer>` | 页脚 |
| `<figure>` | 图表 |
| `<time>` | 时间 |
| `<mark>` | 高亮 |

**语义化的好处总结：**
- ✅ 提升 SEO 排名
- ✅ 增强可访问性
- ✅ 代码更清晰易读
- ✅ 团队协作更高效
- ✅ 便于维护和重构

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** 文档结构

### 题目

请指出以下 HTML 文档的所有问题，并给出正确的写法。

```html
<html>
<head>
  <title>网页标题</title>
  <meta charset="UTF-8">
</head>
<BODY>
  <H1>欢迎</h1>
  <p>这是一段文本
  <img src="photo.jpg">
</BODY>
</html>
```

<details>
<summary>查看答案</summary>

### 📖 解析

**问题分析：**

1. ❌ 缺少 `<!DOCTYPE html>` 声明
2. ❌ `<html>` 缺少 `lang` 属性
3. ❌ `<meta charset>` 应该在 `<title>` 之前
4. ❌ `<BODY>` 和 `<H1>` 使用大写（不推荐）
5. ❌ `<H1>` 和 `</h1>` 大小写不匹配
6. ❌ `<p>` 标签未闭合
7. ❌ `<img>` 缺少 `alt` 属性

**正确写法：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>网页标题</title>
</head>
<body>
  <h1>欢迎</h1>
  <p>这是一段文本</p>
  <img src="photo.jpg" alt="照片描述">
</body>
</html>
```

**详细说明：**

**1. DOCTYPE 声明**
```html
<!DOCTYPE html>  <!-- 必须在第一行 -->
```

**2. lang 属性**
```html
<html lang="zh-CN">  <!-- 中文网站 -->
<html lang="en">     <!-- 英文网站 -->
```
作用：
- 帮助搜索引擎识别语言
- 辅助屏幕阅读器正确发音
- 浏览器可以提供翻译功能

**3. meta 标签顺序**
```html
<head>
  <meta charset="UTF-8">              <!-- 1. 字符编码 -->
  <meta name="viewport" content="..."> <!-- 2. 视口设置 -->
  <title>标题</title>                 <!-- 3. 标题 -->
</head>
```

**4. 标签规范**
```html
<!-- ✅ 推荐：全部小写 -->
<body>
  <h1>标题</h1>
</body>

<!-- ❌ 避免：大写或混合 -->
<BODY>
  <H1>标题</h1>  <!-- 开闭标签不匹配 -->
</BODY>
```

**5. 标签闭合**
```html
<!-- ❌ 错误 -->
<p>段落

<!-- ✅ 正确 -->
<p>段落</p>
```

**6. 图片 alt 属性**
```html
<!-- alt 是必需的，提升可访问性 -->
<img src="photo.jpg" alt="产品照片">
<img src="logo.png" alt="公司Logo">
<img src="decoration.png" alt="">  <!-- 装饰性图片可以为空 -->
```

**完整的 HTML5 模板：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="页面描述">
  <meta name="keywords" content="关键词">
  <title>页面标题 - 网站名称</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>网站标题</h1>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      <h2>文章标题</h2>
      <p>内容...</p>
    </article>
  </main>
  
  <footer>
    <p>&copy; 2024 网站名称</p>
  </footer>
  
  <script src="app.js"></script>
</body>
</html>
```

</details>

---

**📌 本章总结**

- HTML 文档由 `<html>`, `<head>`, `<body>` 三部分组成
- 推荐使用小写标签和属性
- 多个空白字符会被压缩为一个空格
- 特殊字符需要使用实体编码
- 始终添加 `<!DOCTYPE html>` 和 `lang` 属性
- 语义化标签提升可访问性和 SEO

**上一章** ← [第 1 章：HTML 简介与历史](./chapter-01.md)  
**下一章** → [第 3 章：头部元素详解](./chapter-03.md)
