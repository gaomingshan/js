# 第 27 章：响应式设计 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | viewport
### 题目
viewport meta 标签的作用？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
- `width=device-width`：宽度=设备宽度
- `initial-scale=1.0`：初始缩放1倍
- `maximum-scale`：最大缩放
- `user-scalable=no`：禁止缩放（不推荐）

**来源：** Viewport Meta
</details>

---

## 第 2 题 🟢 | 媒体查询
### 题目
常用的媒体查询断点？

<details><summary>查看答案</summary>
### ✅ 答案
```css
/* 移动端 */
@media (max-width: 767px) {}

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) {}

/* 桌面 */
@media (min-width: 1024px) {}
```
**来源：** 响应式断点
</details>

---

## 第 3 题 🟢 | picture 元素
### 题目
`<picture>` 的作用？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<picture>
  <source media="(max-width: 600px)" srcset="small.jpg">
  <source media="(max-width: 1200px)" srcset="medium.jpg">
  <img src="large.jpg" alt="Image">
</picture>
```
根据条件加载不同图片
**来源：** Picture Element
</details>

---

## 第 4 题 🟡 | 流式布局
### 题目
实现流式布局。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```css
/* 百分比宽度 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.col-half {
  width: 50%;
  float: left;
}

/* Flexbox */
.flex-container {
  display: flex;
  flex-wrap: wrap;
}

.flex-item {
  flex: 1 1 300px; /* 最小300px */
}

/* Grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
```
**来源：** 流式布局
</details>

---

## 第 5 题 🟡 | 响应式图片
### 题目
`srcset` 和 `sizes` 的用法？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<img 
  srcset="small.jpg 480w,
          medium.jpg 768w,
          large.jpg 1200w"
  sizes="(max-width: 600px) 480px,
         (max-width: 1000px) 768px,
         1200px"
  src="medium.jpg"
  alt="Responsive Image">
```
- `srcset`：图片源 + 宽度描述符
- `sizes`：在不同条件下图片显示宽度

**来源：** 响应式图片
</details>

---

## 第 6 题 🟡 | 移动优先
### 题目
移动优先的CSS写法？

<details><summary>查看答案</summary>
### ✅ 答案
```css
/* 基础样式（移动端） */
.container {
  padding: 10px;
}

.col {
  width: 100%;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
  
  .col {
    width: 50%;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    padding: 30px;
  }
  
  .col {
    width: 33.33%;
  }
}
```
**来源：** Mobile First
</details>

---

## 第 7 题 🟡 | 容器查询
### 题目
CSS 容器查询的用法？

<details><summary>查看答案</summary>
### ✅ 答案
```css
.container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-title {
    font-size: 2rem;
  }
}
```
根据容器大小而非视口大小调整样式
**来源：** Container Queries
</details>

---

## 第 8 题 🔴 | 完整响应式方案
### 题目
设计完整的响应式网页。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>响应式页面</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    /* 移动端优先 */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    
    .header {
      background: #333;
      color: white;
      padding: 1rem;
    }
    
    .nav {
      display: flex;
      flex-direction: column;
    }
    
    .nav a {
      padding: 10px;
      color: white;
      text-decoration: none;
    }
    
    .grid {
      display: grid;
      gap: 20px;
      grid-template-columns: 1fr;
    }
    
    .card {
      border: 1px solid #ddd;
      padding: 1rem;
    }
    
    /* 平板 */
    @media (min-width: 768px) {
      .nav {
        flex-direction: row;
      }
      
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* 桌面 */
    @media (min-width: 1024px) {
      .grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>网站标题</h1>
      <nav class="nav">
        <a href="/">首页</a>
        <a href="/about">关于</a>
        <a href="/contact">联系</a>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <div class="grid">
      <article class="card">
        <picture>
          <source media="(max-width: 600px)" srcset="small.jpg">
          <img src="large.jpg" alt="Card Image" style="width: 100%;">
        </picture>
        <h2>卡片标题</h2>
        <p>内容...</p>
      </article>
      <!-- 更多卡片 -->
    </div>
  </main>
</body>
</html>
```
**来源：** 响应式最佳实践
</details>

---

## 第 9 题 🔴 | 响应式表格
### 题目
移动端表格优化方案？

<details><summary>查看答案</summary>
### ✅ 答案
```html
<table class="responsive-table">
  <thead>
    <tr>
      <th>姓名</th>
      <th>职位</th>
      <th>邮箱</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="姓名">张三</td>
      <td data-label="职位">工程师</td>
      <td data-label="邮箱">zhang@example.com</td>
    </tr>
  </tbody>
</table>

<style>
@media (max-width: 768px) {
  .responsive-table thead {
    display: none;
  }
  
  .responsive-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
  }
  
  .responsive-table td {
    display: block;
    text-align: right;
    padding: 10px;
  }
  
  .responsive-table td::before {
    content: attr(data-label);
    float: left;
    font-weight: bold;
  }
}
</style>
```
**来源：** 响应式表格
</details>

---

## 第 10 题 🔴 | 性能优化
### 题目
响应式设计的性能优化？

<details><summary>查看答案</summary>
### ✅ 答案

**1. 响应式图片**
```html
<img 
  srcset="small.webp 480w, medium.webp 768w, large.webp 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
  src="medium.jpg"
  loading="lazy">
```

**2. 条件加载**
```javascript
// 移动端不加载大图
if (window.matchMedia('(min-width: 768px)').matches) {
  loadLargeImages();
}
```

**3. 媒体查询优化**
```css
/* 避免过多断点 */
/* ❌ 不好 */
@media (max-width: 400px) {}
@media (max-width: 500px) {}
@media (max-width: 600px) {}

/* ✅ 好 */
@media (max-width: 767px) {}  /* 移动 */
@media (min-width: 768px) {}  /* 平板+ */
```

**4. 字体优化**
```css
@font-face {
  font-family: 'Custom';
  src: url('font.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0-FF; /* 仅加载需要的字符 */
}
```

**来源：** 响应式性能
</details>

---

**📌 本章总结**
- viewport：控制移动端视口
- 媒体查询：根据屏幕大小应用样式
- 响应式图片：srcset, sizes, picture
- 布局：Flexbox, Grid, 流式布局
- 移动优先：从小屏开始设计
- 容器查询：根据容器大小调整
- 性能：条件加载、懒加载

**上一章** ← [第 26 章：资源加载优化](./chapter-26.md)  
**下一章** → [第 28 章：Web Components](./chapter-28.md)
