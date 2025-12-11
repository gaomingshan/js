# 第 1 章：HTML 简介与历史 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 基础概念

### 题目

HTML 的全称是什么？

**选项：**
- A. Hyper Text Markup Language
- B. High Text Markup Language
- C. Hyperlinks and Text Markup Language
- D. Home Tool Markup Language

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**HTML (HyperText Markup Language)**

- **Hyper Text**：超文本，支持链接到其他文档
- **Markup**：标记，使用标签描述内容结构
- **Language**：语言，一套规则和语法

**关键特性：**
- 不是编程语言，而是标记语言
- 描述网页的结构和内容
- 通过标签（tags）定义元素

```html
<!-- HTML 示例 -->
<!DOCTYPE html>
<html>
<head>
  <title>网页标题</title>
</head>
<body>
  <h1>这是标题</h1>
  <p>这是段落</p>
</body>
</html>
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 版本演进

### 题目

HTML5 是 W3C 制定的最新 HTML 标准。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**HTML5 由 WHATWG 主导**

HTML5 的发展历史：
- **2004年**：WHATWG（Web Hypertext Application Technology Working Group）成立
- **2007年**：W3C 采纳 WHATWG 的工作
- **2019年**：W3C 和 WHATWG 达成协议，**WHATWG 的 HTML Living Standard 成为唯一标准**

**关键点：**
- WHATWG：持续更新的"活标准"（Living Standard）
- W3C：已停止发布独立的 HTML 版本
- 当前标准：https://html.spec.whatwg.org/

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** DOCTYPE

### 题目

HTML5 的 DOCTYPE 声明是什么？

**选项：**
- A. `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">`
- B. `<!DOCTYPE html>`
- C. `<html5>`
- D. `<!DOCTYPE HTML5>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**HTML5 DOCTYPE 声明非常简洁**

```html
<!DOCTYPE html>
```

**对比旧版本：**

```html
<!-- HTML 4.01 Strict -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" 
  "http://www.w3.org/TR/html4/strict.dtd">

<!-- XHTML 1.0 Strict -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<!-- HTML5 -->
<!DOCTYPE html>
```

**为什么这么简洁？**
- HTML5 不基于 SGML，不需要引用 DTD
- 只是触发浏览器的标准模式
- 大小写不敏感（推荐小写）

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** HTML5 新特性

### 题目

以下哪些是 HTML5 引入的新特性？

**选项：**
- A. 语义化标签（如 `<header>`, `<nav>`, `<article>`）
- B. 本地存储（localStorage 和 sessionStorage）
- C. Canvas 绘图
- D. 表单验证（如 required 属性）

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**HTML5 的主要新特性（全部正确）**

**1. 语义化标签**
```html
<header>头部</header>
<nav>导航</nav>
<main>主内容</main>
<article>文章</article>
<aside>侧边栏</aside>
<footer>底部</footer>
```

**2. 本地存储**
```javascript
// localStorage（永久存储）
localStorage.setItem('user', 'John');

// sessionStorage（会话存储）
sessionStorage.setItem('token', 'abc123');
```

**3. Canvas 绘图**
```html
<canvas id="myCanvas" width="200" height="100"></canvas>
<script>
const ctx = canvas.getContext('2d');
ctx.fillRect(10, 10, 50, 50);
</script>
```

**4. 表单增强**
```html
<input type="email" required>
<input type="date">
<input type="range" min="0" max="100">
```

**其他重要特性：**
- 音频和视频（`<audio>`, `<video>`）
- SVG 和 MathML 支持
- Geolocation API
- Web Workers
- WebSocket

</details>

---

## 第 5 题 🟡

**类型：** 单选题  
**标签：** 字符编码

### 题目

HTML5 推荐使用哪种字符编码？

**选项：**
- A. GB2312
- B. GBK
- C. UTF-8
- D. ISO-8859-1

<details>
<summary>查看答案</summary>

### ✅ 正确答案：C

### 📖 解析

**UTF-8 是 HTML5 的默认和推荐编码**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>UTF-8 编码</title>
</head>
<body>
  <p>支持中文、English、日本語、한국어 等多种语言</p>
</body>
</html>
```

**为什么选择 UTF-8？**
- ✅ **国际化支持**：涵盖几乎所有语言字符
- ✅ **向后兼容**：兼容 ASCII
- ✅ **Web 标准**：W3C 和 WHATWG 推荐
- ✅ **节省空间**：变长编码，英文字符只占1字节

**对比其他编码：**
- **GB2312/GBK**：仅支持简体中文
- **ISO-8859-1**：仅支持西欧语言
- **UTF-16**：空间占用大

**注意事项：**
```html
<!-- ❌ 错误：在 <title> 之后 -->
<head>
  <title>网页</title>
  <meta charset="UTF-8">
</head>

<!-- ✅ 正确：charset 应该尽早声明 -->
<head>
  <meta charset="UTF-8">
  <title>网页</title>
</head>
```

</details>

---

## 第 6 题 🟡

**类型：** 代码输出题  
**标签：** 标签闭合

### 题目

以下哪些 HTML5 标签是自闭合标签（void elements）？

**选项：**
- A. `<img>`, `<br>`, `<input>`
- B. `<div>`, `<span>`, `<p>`
- C. `<article>`, `<section>`, `<nav>`
- D. `<script>`, `<style>`, `<link>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**自闭合标签（Void Elements）**

HTML5 定义了以下自闭合标签，它们不能包含内容：

```html
<!-- 常用自闭合标签 -->
<img src="photo.jpg" alt="图片">
<br>
<hr>
<input type="text">
<meta charset="UTF-8">
<link rel="stylesheet" href="style.css">

<!-- ❌ 错误写法 -->
<img src="photo.jpg">内容</img>
<br>文本</br>

<!-- ✅ 正确写法 -->
<img src="photo.jpg" alt="图片">
<br>
```

**完整的自闭合标签列表：**
- `<area>`
- `<base>`
- `<br>`
- `<col>`
- `<embed>`
- `<hr>`
- `<img>`
- `<input>`
- `<link>`
- `<meta>`
- `<param>`
- `<source>`
- `<track>`
- `<wbr>`

**HTML5 vs XHTML：**
```html
<!-- HTML5：可以不写 / -->
<img src="photo.jpg" alt="图片">
<br>

<!-- XHTML：必须自闭合 -->
<img src="photo.jpg" alt="图片" />
<br />
```

**选项分析：**
- **A 正确**：`<img>`, `<br>`, `<input>` 都是自闭合标签
- **B 错误**：需要闭合标签 `</div>`, `</span>`, `</p>`
- **C 错误**：需要闭合标签
- **D 错误**：`<script>` 和 `<style>` 需要闭合，`<link>` 是自闭合

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 浏览器兼容

### 题目

为了确保旧版 IE 浏览器支持 HTML5 语义标签，可以采用哪些方法？

**选项：**
- A. 使用 html5shiv.js
- B. 使用 JavaScript 创建这些元素
- C. 设置元素为 `display: block`
- D. 使用 Polyfill

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**让旧版 IE 支持 HTML5 语义标签**

**1. 使用 html5shiv.js（推荐）**
```html
<!--[if lt IE 9]>
  <script src="https://cdn.jsdelivr.net/npm/html5shiv@3.7.3/dist/html5shiv.min.js"></script>
<![endif]-->
```

**2. JavaScript 手动创建**
```javascript
// IE8 及以下不识别新标签，需要先创建
document.createElement('header');
document.createElement('nav');
document.createElement('article');
document.createElement('section');
document.createElement('aside');
document.createElement('footer');
```

**3. CSS 设置 display**
```css
/* 旧版 IE 默认将未知元素设为 inline */
header, nav, article, section, aside, footer {
  display: block;
}
```

**4. 使用 Modernizr（全功能 Polyfill）**
```html
<script src="modernizr.js"></script>
```

**注意事项：**
- IE9+ 原生支持 HTML5
- 现代开发通常不再考虑 IE8 及以下
- 条件注释 `<!--[if lt IE 9]>` 仅 IE 识别

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 完整文档结构

### 题目

请补全一个完整的 HTML5 文档结构。

```html
______ html>
<html ______>
<head>
  ______ charset="UTF-8">
  ______ name="viewport" content="width=device-width, initial-scale=1.0">
  <title>网页标题</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

**选项：**
- A. `<!DOCTYPE` / `lang="zh-CN"` / `<meta` / `<meta`
- B. `<DOCTYPE` / `language="zh"` / `<charset` / `<viewport`
- C. `<!doctype` / `xml:lang="zh"` / `<encoding` / `<meta`
- D. `<html5` / `lang="cn"` / `<meta` / `<meta`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**完整的 HTML5 文档结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>网页标题</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

**关键要素解析：**

**1. DOCTYPE 声明**
```html
<!DOCTYPE html>
```
- 必须是文档第一行
- 触发标准模式（Standards Mode）
- 大小写不敏感

**2. lang 属性**
```html
<html lang="zh-CN">
```
- `zh-CN`：简体中文
- `en`：英语
- `ja`：日语
- 帮助搜索引擎和屏幕阅读器

**3. 字符编码**
```html
<meta charset="UTF-8">
```
- 必须在 `<title>` 之前
- 必须在前 1024 字节内
- 推荐使用 UTF-8

**4. 视口设置（移动端必备）**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
- `width=device-width`：宽度等于设备宽度
- `initial-scale=1.0`：初始缩放比例
- 响应式设计必需

**完整最佳实践模板：**
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
  <h1>内容</h1>
  <script src="app.js"></script>
</body>
</html>
```

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 渲染模式

### 题目

关于浏览器的渲染模式，以下说法正确的是？

**选项：**
- A. 没有 DOCTYPE 声明会触发怪异模式（Quirks Mode）
- B. `<!DOCTYPE html>` 会触发标准模式（Standards Mode）
- C. 怪异模式下，盒模型计算方式不同
- D. 可以通过 `document.compatMode` 检测当前模式

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**浏览器渲染模式（全部正确）**

**1. 三种渲染模式**

| 模式 | 触发条件 | 特点 |
|------|---------|------|
| **怪异模式** | 无 DOCTYPE | 模拟旧浏览器行为 |
| **标准模式** | `<!DOCTYPE html>` | 遵循 W3C 标准 |
| **准标准模式** | 部分 DOCTYPE | 介于两者之间 |

**2. 怪异模式 vs 标准模式**

```html
<!-- ❌ 怪异模式 -->
<html>
<head>
  <title>无 DOCTYPE</title>
</head>
<body>
  <!-- 盒模型：width 包含 padding 和 border -->
  <div style="width: 100px; padding: 10px; border: 5px solid;">
    实际宽度 = 100px
  </div>
</body>
</html>

<!-- ✅ 标准模式 -->
<!DOCTYPE html>
<html>
<head>
  <title>有 DOCTYPE</title>
</head>
<body>
  <!-- 盒模型：width 仅内容区 -->
  <div style="width: 100px; padding: 10px; border: 5px solid;">
    实际宽度 = 100px + 10px×2 + 5px×2 = 130px
  </div>
</body>
</html>
```

**3. 检测当前模式**

```javascript
// 检测文档模式
console.log(document.compatMode);
// "CSS1Compat" - 标准模式
// "BackCompat" - 怪异模式

// 检测示例
if (document.compatMode === 'BackCompat') {
  console.warn('⚠️ 页面处于怪异模式！请添加 DOCTYPE');
}
```

**4. 主要差异**

| 特性 | 怪异模式 | 标准模式 |
|------|---------|---------|
| **盒模型** | IE 盒模型 | W3C 盒模型 |
| **行内元素** | 可设置宽高 | 不可设置宽高 |
| **表格字体** | 不继承 | 继承 body |
| **图片间距** | 有间距 | 无间距 |

**最佳实践：**
```html
<!-- 始终添加 DOCTYPE，确保标准模式 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>标准模式</title>
</head>
<body>
  <!-- 内容 -->
</body>
</html>
```

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** HTML 历史与演进

### 题目

简述 HTML 从 HTML4 到 HTML5 的主要演进，包括设计理念的变化。

<details>
<summary>查看答案</summary>

### 📖 解析

**HTML 的演进历程**

**1. HTML4（1997年）→ XHTML（2000年）**

```html
<!-- HTML4：宽松 -->
<P>段落
<IMG SRC="photo.jpg">

<!-- XHTML：严格的 XML 语法 -->
<p>段落</p>
<img src="photo.jpg" alt="图片" />
```

**XHTML 的问题：**
- 过于严格，一个小错误导致整页白屏
- 开发效率低
- 浏览器支持不佳

**2. HTML5（2014年正式发布）**

**设计理念变化：**

| 方面 | HTML4/XHTML | HTML5 |
|------|-------------|-------|
| **兼容性** | 严格或宽松 | 向后兼容 |
| **错误处理** | 严格报错 | 容错性强 |
| **语义化** | 有限 | 丰富的语义标签 |
| **多媒体** | 依赖插件 | 原生支持 |
| **API** | 简单 | 丰富的 JavaScript API |

**3. 主要新特性**

```html
<!-- 语义化标签 -->
<header>
  <nav>
    <ul>
      <li><a href="/">首页</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>文章标题</h1>
    <p>内容...</p>
  </article>
</main>

<footer>
  <p>&copy; 2024</p>
</footer>

<!-- 原生多媒体 -->
<video controls>
  <source src="video.mp4" type="video/mp4">
</video>

<!-- 增强的表单 -->
<form>
  <input type="email" required>
  <input type="date">
  <input type="range" min="0" max="100">
</form>

<!-- Canvas 绘图 -->
<canvas id="canvas"></canvas>

<!-- 本地存储 -->
<script>
localStorage.setItem('data', 'value');
</script>
```

**4. 设计原则**

HTML5 的八大设计原则：
1. **兼容性**：不破坏现有内容
2. **实用性**：解决现实问题
3. **互操作性**：跨浏览器一致
4. **通用访问**：所有人都能访问
5. **媒体独立**：适用各种设备
6. **内容与表现分离**：HTML 管结构，CSS 管样式
7. **安全**：防止恶意内容
8. **性能**：优化加载和渲染

**5. Living Standard（活标准）**

```
HTML4 (1997) → XHTML (2000) → HTML5 (2014) → Living Standard (持续更新)
```

- 不再有版本号
- 持续演进和更新
- 由 WHATWG 维护
- 浏览器逐步实现新特性

**关键里程碑：**
- **1991**：HTML 诞生（Tim Berners-Lee）
- **1997**：HTML 4.0
- **2000**：XHTML 1.0
- **2004**：WHATWG 成立
- **2014**：HTML5 正式发布
- **2019**：WHATWG Living Standard 成为唯一标准

</details>

---

**📌 本章总结**

- HTML 是超文本标记语言，描述网页结构
- HTML5 由 WHATWG 维护，采用 Living Standard
- 推荐使用 UTF-8 编码
- 始终添加 `<!DOCTYPE html>` 确保标准模式
- HTML5 引入了语义化标签、多媒体、表单增强等特性

**下一章** → [第 2 章：文档结构与语法](./chapter-02.md)
