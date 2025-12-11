# 第 19 章：文档大纲 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 标题层级

### 题目
HTML 标题标签有几个层级？

**A.** 3个 | **B.** 5个 | **C.** 6个 | **D.** 无限制

<details><summary>查看答案</summary>

### ✅ 答案：C

### 解析
```html
<h1>一级标题</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>
<h4>四级标题</h4>
<h5>五级标题</h5>
<h6>六级标题</h6>
```

**来源：** HTML 规范
</details>

---

## 第 2 题 🟢 | h1 使用

### 题目
每个页面应该有几个 `<h1>`？

**A.** 只能1个 | **B.** 可以多个 | **C.** 根据SEO需要 | **D.** 没有限制

<details><summary>查看答案</summary>

### ✅ 答案：B（HTML5允许多个）

### 解析
```html
<!-- HTML5：每个section可以有h1 -->
<h1>页面主标题</h1>
<section>
  <h1>章节1标题</h1>
</section>
<section>
  <h1>章节2标题</h1>
</section>

<!-- 但SEO最佳实践：每页一个h1 -->
<h1>唯一的主标题</h1>
<h2>子标题</h2>
```

**来源：** HTML5 规范 + SEO最佳实践
</details>

---

## 第 3 题 🟢 | 标题顺序

### 题目
标题应该按什么顺序使用？

**A.** 可以跳级 | **B.** 必须连续 | **C.** 随意使用 | **D.** 只用h1和h2

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
```html
<!-- ❌ 错误：跳级 -->
<h1>主标题</h1>
<h3>跳过了h2</h3>

<!-- ✅ 正确：连续 -->
<h1>主标题</h1>
  <h2>子标题</h2>
    <h3>三级标题</h3>
  <h2>另一个子标题</h2>
```

**来源：** 可访问性指南
</details>

---

## 第 4 题 🟡 | 文档大纲算法

### 题目
HTML5 的文档大纲算法是什么？

<details><summary>查看答案</summary>

### ✅ 答案

每个章节元素创建新的大纲层级：

```html
<body>
  <h1>页面标题</h1>              <!-- 层级1 -->
  
  <section>
    <h1>章节1</h1>               <!-- 层级2 -->
    <h2>章节1.1</h2>             <!-- 层级3 -->
  </section>
  
  <section>
    <h1>章节2</h1>               <!-- 层级2（重置） -->
  </section>
</body>
```

**章节元素：** section, article, aside, nav

**来源：** HTML5 大纲算法
</details>

---

## 第 5 题 🟡 | hgroup 标签

### 题目
`<hgroup>` 的作用是什么？

<details><summary>查看答案</summary>

### ✅ 答案

分组标题和副标题：

```html
<hgroup>
  <h1>主标题</h1>
  <h2>副标题</h2>
</hgroup>

<!-- 或使用 p -->
<h1>主标题</h1>
<p class="subtitle">副标题</p>
```

**注意：** hgroup 在 HTML5.1 中被移除，但 HTML5.2 又加回来了

**来源：** HTML 规范演变
</details>

---

## 第 6 题 🟡 | 无障碍大纲

### 题目
如何让屏幕阅读器正确理解文档结构？**（多选）**

**A.** 正确的标题层级 | **B.** 使用地标角色 | **C.** aria-label | **D.** 跳转链接

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析
```html
<!-- 1. 标题层级 -->
<h1>主标题</h1>
<h2>子标题</h2>

<!-- 2. 地标角色 -->
<header role="banner">
<nav role="navigation">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">

<!-- 3. aria-label -->
<nav aria-label="主导航">
<section aria-labelledby="title">
  <h2 id="title">标题</h2>
</section>

<!-- 4. 跳转链接 -->
<a href="#main" class="skip-link">跳到主内容</a>
```

**来源：** WCAG 无障碍指南
</details>

---

## 第 7 题 🟡 | 面包屑导航

### 题目
实现语义化的面包屑导航。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li aria-current="page">当前页</li>
  </ol>
</nav>

<!-- 或使用 Schema.org 微数据 -->
<nav aria-label="面包屑">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/">
        <span itemprop="name">首页</span>
      </a>
      <meta itemprop="position" content="1" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/category">
        <span itemprop="name">分类</span>
      </a>
      <meta itemprop="position" content="2" />
    </li>
  </ol>
</nav>
```

**来源：** Schema.org
</details>

---

## 第 8 题 🔴 | 复杂文档结构

### 题目
创建一个多层嵌套的文档大纲。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<body>
  <header>
    <h1>网站标题</h1>              <!-- 1 -->
    <nav>
      <h2>主导航</h2>               <!-- 2 -->
    </nav>
  </header>
  
  <main>
    <article>
      <h1>文章标题</h1>             <!-- 2 -->
      
      <section>
        <h2>第一章</h2>             <!-- 3 -->
        
        <section>
          <h3>1.1 小节</h3>         <!-- 4 -->
        </section>
        
        <section>
          <h3>1.2 小节</h3>         <!-- 4 -->
        </section>
      </section>
      
      <section>
        <h2>第二章</h2>             <!-- 3 -->
      </section>
    </article>
  </main>
  
  <aside>
    <h2>相关内容</h2>               <!-- 2 -->
  </aside>
  
  <footer>
    <h2>页脚</h2>                   <!-- 2 -->
  </footer>
</body>
```

**来源：** HTML5 文档大纲
</details>

---

## 第 9 题 🔴 | 大纲工具

### 题目
如何检查文档大纲是否正确？

<details><summary>查看答案</summary>

### ✅ 答案

**1. 浏览器扩展**
- HTML5 Outliner (Chrome)
- HeadingsMap (Firefox)

**2. 在线工具**
- https://gsnedders.html5.org/outliner/

**3. 代码检查**
```javascript
// 提取标题结构
function getOutline() {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headings.forEach(h => {
    const level = h.tagName[1];
    const indent = '  '.repeat(level - 1);
    console.log(indent + h.textContent);
  });
}
```

**4. 验证规则**
- h1 应该是页面主标题
- 标题不跳级
- 每个 section/article 有标题
- 标题层级正确反映内容结构

**来源：** 开发者工具
</details>

---

## 第 10 题 🔴 | 最佳实践

### 题目
总结文档大纲的最佳实践。

<details><summary>查看答案</summary>

### ✅ 答案

**1. 标题使用**
```html
<!-- ✅ 每页一个h1 -->
<h1>页面主标题</h1>

<!-- ✅ 标题连续不跳级 -->
<h1>主标题</h1>
<h2>子标题</h2>
<h3>三级标题</h3>

<!-- ❌ 避免跳级 -->
<h1>标题</h1>
<h4>跳过h2、h3</h4>
```

**2. 语义化结构**
```html
<header>
  <h1>网站名</h1>
</header>
<main>
  <article>
    <h2>文章标题</h2>
    <section>
      <h3>章节</h3>
    </section>
  </article>
</main>
```

**3. 可访问性**
```html
<!-- 隐藏标题（视觉隐藏，屏幕阅读器可读） -->
<h2 class="sr-only">导航菜单</h2>
<nav>...</nav>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}
</style>
```

**4. SEO优化**
```html
<!-- h1包含主要关键词 -->
<h1>HTML5 语义化标签完整指南</h1>

<!-- 标题层级清晰 -->
<h2>什么是语义化</h2>
<h2>为什么要语义化</h2>
<h2>如何实现语义化</h2>
```

**来源：** Web 开发最佳实践
</details>

---

**📌 本章总结**
- 6个标题层级：h1-h6
- 标题连续不跳级
- HTML5：每个section可以有h1，但SEO建议每页一个
- 文档大纲算法：章节元素创建新层级
- 可访问性：正确标题 + ARIA + 跳转链接
- 检查工具：浏览器扩展、在线工具

**上一章** ← [第 18 章：HTML5语义化标签](./chapter-18.md)  
**下一章** → [第 20 章：ARIA基础](./chapter-20.md)
