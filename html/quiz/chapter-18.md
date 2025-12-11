# 第 18 章：HTML5 语义化标签 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 语义化定义

### 题目
什么是 HTML 语义化？

**A.** 使用有意义的标签 | **B.** 美化页面 | **C.** 提升性能 | **D.** 加快加载

<details><summary>查看答案</summary>

### ✅ 答案：A

### 解析
语义化 = 用正确的标签描述内容含义

```html
<!-- ❌ 非语义化 -->
<div class="header">
  <div class="nav">
    <div class="article">

<!-- ✅ 语义化 -->
<header>
  <nav>
    <article>
```

**优点：**
- 可读性更好
- SEO 友好
- 可访问性提升
- 团队协作更容易

**来源：** HTML5 规范
</details>

---

## 第 2 题 🟢 | 结构标签

### 题目
HTML5 新增了哪些结构标签？**（多选）**

**A.** `<header>`, `<footer>` | **B.** `<nav>`, `<aside>` | **C.** `<section>`, `<article>` | **D.** `<main>`, `<figure>`

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析
```html
<header>页头</header>
<nav>导航</nav>
<main>
  <section>章节</section>
  <article>文章</article>
  <aside>侧边栏</aside>
</main>
<footer>页脚</footer>
<figure>
  <img src="pic.jpg">
  <figcaption>图片说明</figcaption>
</figure>
```

**来源：** HTML5 语义元素
</details>

---

## 第 3 题 🟢 | header vs head

### 题目
`<header>` 和 `<head>` 的区别？

**A.** 完全相同 | **B.** header 是内容，head 是元数据 | **C.** 只是名称不同 | **D.** 可以互换

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 元数据：不显示在页面 -->
  <title>标题</title>
  <meta charset="UTF-8">
</head>
<body>
  <header>
    <!-- 页面内容：页头区域 -->
    <h1>网站标题</h1>
    <nav>导航</nav>
  </header>
</body>
</html>
```

**来源：** HTML 基础
</details>

---

## 第 4 题 🟡 | section vs article

### 题目
`<section>` 和 `<article>` 的区别？

<details><summary>查看答案</summary>

### ✅ 答案

**section：** 章节、分组内容  
**article：** 独立完整的内容

```html
<!-- article：独立文章 -->
<article>
  <h2>文章标题</h2>
  <p>文章内容...</p>
</article>

<!-- section：分组相关内容 -->
<section>
  <h2>新闻列表</h2>
  <article>新闻1</article>
  <article>新闻2</article>
</section>

<!-- article 可以包含 section -->
<article>
  <h1>完整指南</h1>
  <section>
    <h2>第一章</h2>
  </section>
  <section>
    <h2>第二章</h2>
  </section>
</article>
```

**判断标准：** 内容能否独立分发？能 = article，否 = section

**来源：** HTML5 Doctor
</details>

---

## 第 5 题 🟡 | main 标签

### 题目
`<main>` 标签的使用规则？**（多选）**

**A.** 每页只能有一个 | **B.** 不能是后代元素 | **C.** 包含主要内容 | **D.** 可以多个

<details><summary>查看答案</summary>

### ✅ 答案：A, C

### 解析
```html
<!-- ✅ 正确 -->
<body>
  <header>页头</header>
  <main>
    <article>主要内容</article>
  </main>
  <footer>页脚</footer>
</body>

<!-- ❌ 错误：多个 main -->
<main>内容1</main>
<main>内容2</main>

<!-- ❌ 错误：main 在 article 内 -->
<article>
  <main>...</main>
</article>

<!-- ✅ 可以在 article/section 内包含多个，但只显示一个 -->
<main>
  <article hidden>...</article>
  <article>显示的内容</article>
</main>
```

**规则：**
- 每页只有一个可见 `<main>`
- 不能是 `<article>`, `<aside>`, `<footer>`, `<header>`, `<nav>` 的后代
- 代表文档的主要内容

**来源：** MDN - main 元素
</details>

---

## 第 6 题 🟡 | aside 用途

### 题目
`<aside>` 适合放什么内容？**（多选）**

**A.** 侧边栏 | **B.** 广告 | **C.** 相关链接 | **D.** 主要内容

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C

### 解析
```html
<!-- 页面级侧边栏 -->
<aside class="sidebar">
  <section>
    <h3>分类</h3>
    <ul>...</ul>
  </section>
  <section>
    <h3>广告</h3>
  </section>
</aside>

<!-- 文章内的附加信息 -->
<article>
  <h1>主要内容</h1>
  <p>正文...</p>
  
  <aside>
    <h4>相关阅读</h4>
    <ul>...</ul>
  </aside>
</article>
```

**用途：** 与主内容相关但不是核心的内容

**来源：** HTML5 规范
</details>

---

## 第 7 题 🟡 | nav 标签

### 题目
所有链接都应该放在 `<nav>` 中吗？

**A.** 是 | **B.** 否

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
```html
<!-- ✅ 主要导航 -->
<nav>
  <a href="/">首页</a>
  <a href="/about">关于</a>
</nav>

<!-- ✅ 面包屑 -->
<nav aria-label="面包屑">
  <a href="/">首页</a> &gt;
  <a href="/category">分类</a>
</nav>

<!-- ✅ 分页 -->
<nav aria-label="分页">
  <a href="?page=1">上一页</a>
  <a href="?page=3">下一页</a>
</nav>

<!-- ❌ 普通链接不需要 nav -->
<article>
  <p>查看<a href="/details">详情</a></p>
</article>

<!-- ❌ 页脚链接（可选） -->
<footer>
  <a href="/privacy">隐私政策</a>
  <a href="/terms">服务条款</a>
</footer>
```

**规则：** 只用于主要导航区域

**来源：** W3C 可访问性指南
</details>

---

## 第 8 题 🔴 | 完整语义结构

### 题目
创建一个语义化的博客文章页面。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>文章标题 - 博客名称</title>
</head>
<body>
  <header>
    <h1>我的博客</h1>
    <nav aria-label="主导航">
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/archive">归档</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      <header>
        <h1>文章标题</h1>
        <p>
          <time datetime="2024-01-15">2024年1月15日</time>
          作者：<span>张三</span>
        </p>
      </header>
      
      <section>
        <h2>第一部分</h2>
        <p>内容...</p>
        
        <figure>
          <img src="image.jpg" alt="图片描述">
          <figcaption>图1：示例图片</figcaption>
        </figure>
      </section>
      
      <section>
        <h2>第二部分</h2>
        <p>内容...</p>
      </section>
      
      <aside>
        <h3>相关文章</h3>
        <ul>
          <li><a href="/post1">相关文章1</a></li>
          <li><a href="/post2">相关文章2</a></li>
        </ul>
      </aside>
      
      <footer>
        <p>标签：<a href="/tag/html">HTML</a></p>
      </footer>
    </article>
    
    <section id="comments">
      <h2>评论</h2>
      <article>
        <header>
          <p><strong>用户A</strong> - <time>2小时前</time></p>
        </header>
        <p>评论内容...</p>
      </article>
    </section>
  </main>
  
  <aside class="sidebar">
    <section>
      <h3>分类</h3>
      <ul>...</ul>
    </section>
    <section>
      <h3>标签云</h3>
      <ul>...</ul>
    </section>
  </aside>
  
  <footer>
    <p>&copy; 2024 我的博客</p>
    <nav aria-label="页脚导航">
      <a href="/privacy">隐私政策</a>
      <a href="/contact">联系我们</a>
    </nav>
  </footer>
</body>
</html>
```

**来源：** HTML5 最佳实践
</details>

---

## 第 9 题 🔴 | 可访问性增强

### 题目
为语义化标签添加 ARIA 属性。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<header role="banner">
  <nav role="navigation" aria-label="主导航">
    <ul>...</ul>
  </nav>
</header>

<main role="main" aria-label="主要内容">
  <article role="article" aria-labelledby="article-title">
    <h1 id="article-title">文章标题</h1>
  </article>
</main>

<aside role="complementary" aria-label="侧边栏">
  <section aria-labelledby="categories">
    <h2 id="categories">分类</h2>
  </section>
</aside>

<footer role="contentinfo">
  <p>版权信息</p>
</footer>

<!-- 跳转链接（可访问性） -->
<a href="#main-content" class="skip-link">跳转到主要内容</a>

<main id="main-content">
  ...
</main>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

**来源：** WAI-ARIA 规范
</details>

---

## 第 10 题 🔴 | 语义化 vs div

### 题目
对比语义化标签和 div 的区别，说明语义化的优势。

<details><summary>查看答案</summary>

### ✅ 答案

```html
<!-- ❌ 全部使用 div -->
<div class="header">
  <div class="logo">Logo</div>
  <div class="menu">
    <div class="menu-item">首页</div>
    <div class="menu-item">关于</div>
  </div>
</div>
<div class="content">
  <div class="article">
    <div class="title">标题</div>
    <div class="text">正文</div>
  </div>
  <div class="sidebar">
    <div class="widget">侧边栏</div>
  </div>
</div>
<div class="footer">页脚</div>

<!-- ✅ 语义化标签 -->
<header>
  <h1>Logo</h1>
  <nav>
    <a href="/">首页</a>
    <a href="/about">关于</a>
  </nav>
</header>
<main>
  <article>
    <h2>标题</h2>
    <p>正文</p>
  </article>
  <aside>
    <section>侧边栏</section>
  </aside>
</main>
<footer>页脚</footer>
```

**语义化优势：**

| 方面 | div | 语义化标签 |
|------|-----|-----------|
| **可读性** | 需要class识别 | 标签名即含义 |
| **SEO** | 搜索引擎难理解 | 明确内容结构 |
| **可访问性** | 需要额外ARIA | 原生支持 |
| **维护性** | 依赖class | 结构清晰 |
| **团队协作** | 需要文档 | 自解释 |

**来源：** 语义化最佳实践
</details>

---

**📌 本章总结**
- 语义化 = 用正确的标签描述内容
- 结构标签：header, nav, main, article, section, aside, footer
- section vs article：分组 vs 独立内容
- main：每页一个，主要内容
- 配合 ARIA：提升可访问性
- 优势：可读、SEO、可访问、维护

**上一章** ← [第 17 章：表单提交](./chapter-17.md)  
**下一章** → [第 19 章：文档大纲](./chapter-19.md)
