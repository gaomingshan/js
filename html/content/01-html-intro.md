# 第 1 章：HTML 简介与历史

## 概述

HTML（HyperText Markup Language）是构建网页的基础语言。理解 HTML 的历史和演进，有助于我们更好地把握现代 Web 开发的方向。

## 一、什么是 HTML

### 1.1 HTML 的定义

HTML 是一种**标记语言**（Markup Language），用于创建网页的结构和内容。

```html
<!-- HTML 的基本示例 -->
<h1>这是标题</h1>
<p>这是段落内容</p>
```

**关键特点：**
- 使用**标签**（tags）来描述内容
- 不是编程语言，没有逻辑控制
- 负责页面的**结构**和**语义**

### 1.2 HTML vs 编程语言

| 特性 | HTML（标记语言） | JavaScript（编程语言） |
|------|-----------------|---------------------|
| 用途 | 描述内容结构 | 实现逻辑和交互 |
| 语法 | 标签 `<tag>` | 变量、函数、控制流 |
| 执行 | 直接渲染 | 解释执行 |

> **💡 提示**  
> HTML 定义"是什么"，CSS 定义"怎么看"，JavaScript 定义"怎么做"。

## 二、HTML 的历史与演进

### 2.1 版本演进

```
HTML 1.0 (1991) → HTML 2.0 (1995) → HTML 3.2 (1997) → HTML 4.01 (1999)
    ↓
XHTML 1.0 (2000) → XHTML 2.0 (草案，已废弃)
    ↓
HTML5 (2014) → Living Standard (持续更新)
```

### 2.2 关键时间节点

#### **1991 - HTML 诞生**
- Tim Berners-Lee 发明 HTML
- 只有 18 个标签
- 主要用于学术文档

```html
<!-- HTML 1.0 时代 -->
<h1>标题</h1>
<p>段落</p>
<a href="page.html">链接</a>
```

#### **1995 - HTML 2.0**
- 第一个官方标准
- 增加表单元素

#### **1997 - HTML 3.2**
- W3C 推荐标准
- 增加表格、样式等

#### **1999 - HTML 4.01**
- 分离样式和结构
- 引入 CSS 概念
- 长期主流版本

```html
<!-- HTML 4.01 DOCTYPE -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
  "http://www.w3.org/TR/html4/strict.dtd">
```

#### **2000 - XHTML 1.0**
- 基于 XML 的 HTML
- 语法更严格
- 标签必须小写、必须闭合

```html
<!-- XHTML 严格语法 -->
<img src="image.jpg" alt="图片" />  <!-- 必须自闭合 -->
<p>段落</p>                         <!-- 必须闭合 -->
```

> **⚠️ 注意**  
> XHTML 2.0 因过于理想化，未能推广，最终被废弃。

#### **2014 - HTML5**
- WHATWG 和 W3C 合作成果
- 新增语义化标签
- 原生支持音视频
- 强大的 API

```html
<!-- HTML5 简化的 DOCTYPE -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HTML5</title>
</head>
<body>
  <header>头部</header>
  <nav>导航</nav>
  <main>主内容</main>
  <footer>底部</footer>
</body>
</html>
```

## 三、W3C 与 WHATWG

### 3.1 两大标准组织

**W3C（World Wide Web Consortium）**
- 由 Tim Berners-Lee 创立
- 制定 Web 标准
- 发布正式规范

**WHATWG（Web Hypertext Application Technology Working Group）**
- 2004 年由浏览器厂商创立（Apple、Mozilla、Opera）
- 推动 HTML5 发展
- 采用"Living Standard"（活标准）

### 3.2 标准之争与统一

```
2004 - WHATWG 成立，开始开发 HTML5
2007 - W3C 采纳 WHATWG 的 HTML5 工作
2014 - W3C 发布 HTML5 正式推荐标准
2019 - W3C 和 WHATWG 达成协议，WHATWG 主导 HTML 标准
```

> **📌 现状**  
> 目前 HTML 由 WHATWG 维护，采用"Living Standard"模式，持续更新。

## 四、HTML5 的核心特性

### 4.1 新增语义化标签

```html
<!-- HTML4 时代 -->
<div id="header">...</div>
<div id="nav">...</div>
<div id="content">...</div>

<!-- HTML5 时代 -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<article>...</article>
<section>...</section>
<aside>...</aside>
<footer>...</footer>
```

### 4.2 多媒体支持

```html
<!-- 原生音视频 -->
<video src="movie.mp4" controls></video>
<audio src="music.mp3" controls></audio>

<!-- Canvas 绘图 -->
<canvas id="myCanvas"></canvas>

<!-- SVG 矢量图 -->
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" />
</svg>
```

### 4.3 增强的表单

```html
<!-- 新的输入类型 -->
<input type="email">
<input type="url">
<input type="date">
<input type="number">
<input type="range">
<input type="color">

<!-- 表单验证 -->
<input type="email" required>
<input type="text" pattern="[0-9]{6}">
```

### 4.4 强大的 API

| API | 功能 |
|-----|------|
| Geolocation | 地理定位 |
| Local Storage | 本地存储 |
| Web Worker | 多线程 |
| WebSocket | 实时通信 |
| Drag and Drop | 拖放 |
| History API | 历史记录管理 |

## 五、HTML 的设计理念

### 5.1 渐进增强

```html
<!-- 基础功能：所有浏览器都支持 -->
<a href="page.html">链接</a>

<!-- 增强功能：现代浏览器支持 -->
<a href="page.html" download>下载</a>
```

### 5.2 向后兼容

```html
<!-- 旧浏览器忽略不认识的标签 -->
<video src="movie.mp4">
  您的浏览器不支持 video 标签
</video>
```

### 5.3 语义化优先

```html
<!-- ❌ 不好：无语义 -->
<div class="navigation">...</div>

<!-- ✅ 好：有语义 -->
<nav>...</nav>
```

## 六、现代 HTML 最佳实践

### 6.1 使用 HTML5 DOCTYPE

```html
<!-- ✅ 推荐 -->
<!DOCTYPE html>

<!-- ❌ 过时 -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">
```

### 6.2 语义化标签

```html
<!-- ✅ 语义化 -->
<article>
  <header>
    <h1>文章标题</h1>
  </header>
  <p>文章内容...</p>
  <footer>
    <time datetime="2024-01-01">2024年1月1日</time>
  </footer>
</article>
```

### 6.3 可访问性（Accessibility）

```html
<!-- 图片必须有 alt -->
<img src="photo.jpg" alt="描述性文字">

<!-- 表单标签关联 -->
<label for="email">邮箱：</label>
<input type="email" id="email">

<!-- ARIA 属性 -->
<button aria-label="关闭对话框">×</button>
```

### 6.4 性能优化

```html
<!-- 异步加载脚本 -->
<script src="script.js" async></script>
<script src="script.js" defer></script>

<!-- 预加载资源 -->
<link rel="preload" href="font.woff2" as="font">

<!-- 响应式图片 -->
<img src="small.jpg" 
     srcset="medium.jpg 768w, large.jpg 1200w"
     sizes="(max-width: 768px) 100vw, 50vw"
     alt="响应式图片">
```

## 七、学习建议

> **📚 学习路径**
> 
> 1. **掌握基础标签**：从常用标签开始
> 2. **理解语义化**：选择合适的标签
> 3. **关注可访问性**：让所有人都能使用你的网页
> 4. **学习表单**：表单是交互的核心
> 5. **结合 CSS/JS**：HTML 不是孤立的
> 6. **实践项目**：做真实的网页项目

> **⚠️ 常见误区**
> 
> - 不要使用过时的标签（如 `<font>`, `<center>`）
> - 不要用 HTML 实现样式（用 CSS）
> - 不要忽视可访问性
> - 不要过度使用 `<div>` 和 `<span>`

## 参考资料

- [HTML Living Standard](https://html.spec.whatwg.org/) - WHATWG 官方标准
- [MDN Web Docs - HTML](https://developer.mozilla.org/zh-CN/docs/Web/HTML) - 最佳学习资源
- [Can I Use](https://caniuse.com/) - 查询浏览器兼容性
- [HTML5 Doctor](http://html5doctor.com/) - HTML5 元素指南

---

**下一章** → [第 2 章：文档结构与语法](./02-document-structure.md)
