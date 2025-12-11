# 第 21 章：微数据 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 微数据定义

### 题目
什么是 HTML 微数据？

**A.** 小型数据库 | **B.** 结构化数据标记 | **C.** 压缩数据 | **D.** 加密数据

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
微数据通过HTML属性为内容添加机器可读的语义：
```html
<div itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">张三</span>
</div>
```

**来源：** Schema.org
</details>

---

## 第 2 题 🟢 | 微数据属性

### 题目
微数据的核心属性？**（多选）**

**A.** itemscope | **B.** itemtype | **C.** itemprop | **D.** itemid

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析
```html
<div 
  itemscope                           <!-- 创建项目 -->
  itemtype="https://schema.org/Book"  <!-- 类型 -->
  itemid="isbn:978-0-123456-78-9">    <!-- ID -->
  
  <span itemprop="name">书名</span>    <!-- 属性 -->
</div>
```

**来源：** Microdata 规范
</details>

---

## 第 3 题 🟢 | Schema.org

### 题目
Schema.org 是什么？

**A.** 数据库 | **B.** 结构化数据词汇表 | **C.** 搜索引擎 | **D.** 网站

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
Schema.org 定义了常见实体类型：
- Person（人物）
- Organization（组织）
- Product（产品）
- Event（事件）
- Article（文章）

**来源：** Schema.org
</details>

---

## 第 4 题 🟡 | Person 标记

### 题目
标记个人信息。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<div itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">李明</span>
  <span itemprop="jobTitle">前端工程师</span>
  <span itemprop="email">liming@example.com</span>
  <span itemprop="telephone">+86 138-0000-0000</span>
  
  <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="addressLocality">北京</span>
    <span itemprop="addressCountry">中国</span>
  </div>
</div>
```

**来源：** Schema.org Person
</details>

---

## 第 5 题 🟡 | Product 标记

### 题目
标记产品信息。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<div itemscope itemtype="https://schema.org/Product">
  <span itemprop="name">iPhone 15 Pro</span>
  <img itemprop="image" src="iphone.jpg">
  
  <span itemprop="description">最新款智能手机</span>
  
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price">7999</span>
    <span itemprop="priceCurrency">CNY</span>
    <link itemprop="availability" href="https://schema.org/InStock">
  </div>
  
  <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
    <span itemprop="ratingValue">4.5</span>
    <span itemprop="reviewCount">1000</span>
  </div>
</div>
```

**来源：** Schema.org Product
</details>

---

## 第 6 题 🟡 | Article 标记

### 题目
标记文章信息。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<article itemscope itemtype="https://schema.org/Article">
  <h1 itemprop="headline">HTML5 完整指南</h1>
  
  <div itemprop="author" itemscope itemtype="https://schema.org/Person">
    <span itemprop="name">张三</span>
  </div>
  
  <time itemprop="datePublished" datetime="2024-01-15">2024年1月15日</time>
  <time itemprop="dateModified" datetime="2024-01-20">更新于2024年1月20日</time>
  
  <img itemprop="image" src="cover.jpg">
  
  <div itemprop="publisher" itemscope itemtype="https://schema.org/Organization">
    <span itemprop="name">技术博客</span>
    <div itemprop="logo" itemscope itemtype="https://schema.org/ImageObject">
      <img itemprop="url" src="logo.png">
    </div>
  </div>
  
  <div itemprop="articleBody">
    <p>文章内容...</p>
  </div>
</article>
```

**来源：** Schema.org Article
</details>

---

## 第 7 题 🟡 | BreadcrumbList

### 题目
标记面包屑导航。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<nav>
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/">
        <span itemprop="name">首页</span>
      </a>
      <meta itemprop="position" content="1">
    </li>
    
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/category">
        <span itemprop="name">分类</span>
      </a>
      <meta itemprop="position" content="2">
    </li>
    
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">当前页</span>
      <meta itemprop="position" content="3">
    </li>
  </ol>
</nav>
```

**来源：** Schema.org BreadcrumbList
</details>

---

## 第 8 题 🔴 | Event 标记

### 题目
标记活动信息。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<div itemscope itemtype="https://schema.org/Event">
  <h1 itemprop="name">前端技术分享会</h1>
  
  <div itemprop="description">探讨最新前端技术趋势</div>
  
  <div itemprop="location" itemscope itemtype="https://schema.org/Place">
    <span itemprop="name">北京国际会议中心</span>
    <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
      <span itemprop="streetAddress">朝阳区建国门外大街1号</span>
      <span itemprop="addressLocality">北京</span>
    </div>
  </div>
  
  <time itemprop="startDate" datetime="2024-03-15T14:00">2024年3月15日 14:00</time>
  <time itemprop="endDate" datetime="2024-03-15T17:00">17:00</time>
  
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price">0</span>
    <span itemprop="priceCurrency">CNY</span>
    <link itemprop="availability" href="https://schema.org/InStock">
    <a itemprop="url" href="/register">立即报名</a>
  </div>
  
  <div itemprop="organizer" itemscope itemtype="https://schema.org/Organization">
    <span itemprop="name">技术社区</span>
  </div>
</div>
```

**来源：** Schema.org Event
</details>

---

## 第 9 题 🔴 | 测试微数据

### 题目
如何测试微数据是否正确？

<details><summary>查看答案</summary>

### ✅ 答案

**1. Google 富媒体测试工具**
https://search.google.com/test/rich-results

**2. Schema.org 验证器**
https://validator.schema.org/

**3. 浏览器扩展**
- Structured Data Testing Tool
- Schema.org Validator

**4. 代码提取**
```javascript
// 提取微数据
function extractMicrodata() {
  const items = document.querySelectorAll('[itemscope]');
  
  items.forEach(item => {
    const type = item.getAttribute('itemtype');
    const props = item.querySelectorAll('[itemprop]');
    
    console.log('Type:', type);
    props.forEach(prop => {
      console.log(prop.getAttribute('itemprop'), ':', prop.textContent);
    });
  });
}
```

**来源：** 开发者工具
</details>

---

## 第 10 题 🔴 | JSON-LD vs 微数据

### 题目
对比 JSON-LD 和微数据。

<details><summary>查看答案</summary>

### ✅ 答案

**微数据：**
```html
<div itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">张三</span>
  <span itemprop="jobTitle">工程师</span>
</div>
```

**JSON-LD：**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "张三",
  "jobTitle": "工程师"
}
</script>
```

**对比：**

| 特性 | 微数据 | JSON-LD |
|------|--------|---------|
| **位置** | HTML中 | script标签 |
| **可读性** | 较差 | 很好 |
| **维护性** | 困难 | 容易 |
| **SEO** | 支持 | 支持 |
| **Google推荐** | ❌ | ✅ |

**推荐：** 新项目使用 JSON-LD

**来源：** Google 结构化数据指南
</details>

---

**📌 本章总结**
- 微数据：结构化数据标记
- 核心属性：itemscope, itemtype, itemprop
- Schema.org：词汇表标准
- 常用类型：Person, Product, Article, Event
- 测试：Google富媒体工具
- 趋势：JSON-LD逐渐替代微数据

**上一章** ← [第 20 章：ARIA基础](./chapter-20.md)  
**下一章** → [第 22 章：SEO优化](./chapter-22.md)
