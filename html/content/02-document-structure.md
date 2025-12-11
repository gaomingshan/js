# 第 2 章：文档结构与语法

## 概述

HTML 文档有明确的结构和语法规则。掌握正确的文档结构是编写规范 HTML 的基础。

## 一、HTML 文档的基本结构

### 1.1 最小 HTML 文档

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>页面标题</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

### 1.2 结构层次

```
<!DOCTYPE html>           ← 文档类型声明
└── <html>                ← 根元素
    ├── <head>            ← 头部（元数据）
    │   ├── <meta>        ← 字符编码
    │   └── <title>       ← 页面标题
    └── <body>            ← 主体（可见内容）
        └── 内容标签
```

## 二、DOCTYPE 声明

### 2.1 什么是 DOCTYPE

DOCTYPE 告诉浏览器使用哪种 HTML 标准解析文档。

```html
<!-- HTML5（推荐） -->
<!DOCTYPE html>

<!-- HTML4（过时） -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
  "http://www.w3.org/TR/html4/strict.dtd">

<!-- XHTML（过时） -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

### 2.2 标准模式 vs 怪异模式

| 模式 | 触发条件 | 特点 |
|------|---------|------|
| **标准模式** | 有正确的 DOCTYPE | 按 W3C 标准渲染 |
| **怪异模式** | 没有 DOCTYPE | 模拟旧浏览器行为 |

```html
<!-- ✅ 标准模式 -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .box { width: 100px; padding: 20px; border: 5px solid; }
    /* 总宽度 = 100 + 20*2 + 5*2 = 150px */
  </style>
</head>

<!-- ❌ 怪异模式（无 DOCTYPE） -->
<html>
<head>
  <style>
    .box { width: 100px; padding: 20px; border: 5px solid; }
    /* 总宽度 = 100px（padding 和 border 包含在内） */
  </style>
</head>
```

> **💡 最佳实践**  
> 始终使用 `<!DOCTYPE html>`，确保浏览器使用标准模式。

## 三、`<html>` 根元素

### 3.1 基本用法

```html
<html lang="zh-CN">
  <!-- 所有内容 -->
</html>
```

### 3.2 lang 属性

**作用：**
- 帮助搜索引擎识别页面语言
- 屏幕阅读器使用正确发音
- 浏览器自动翻译功能

**常用语言代码：**

```html
<html lang="zh-CN">    <!-- 中文（简体） -->
<html lang="zh-TW">    <!-- 中文（繁体） -->
<html lang="en">       <!-- 英语 -->
<html lang="en-US">    <!-- 英语（美国） -->
<html lang="ja">       <!-- 日语 -->
<html lang="ko">       <!-- 韩语 -->
```

### 3.3 多语言页面

```html
<html lang="zh-CN">
<body>
  <p>这是中文内容</p>
  <p lang="en">This is English content</p>
  <p lang="ja">これは日本語です</p>
</body>
</html>
```

## 四、`<head>` 头部元素

### 4.1 必需元素

```html
<head>
  <!-- 1. 字符编码（必须在前 1024 字节） -->
  <meta charset="UTF-8">
  
  <!-- 2. 页面标题（必需） -->
  <title>页面标题</title>
</head>
```

### 4.2 常用元素

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="页面描述">
  <title>页面标题</title>
  
  <!-- 样式 -->
  <link rel="stylesheet" href="style.css">
  <style>/* 内联样式 */</style>
  
  <!-- 脚本 -->
  <script src="script.js"></script>
  
  <!-- 图标 -->
  <link rel="icon" href="favicon.ico">
</head>
```

> **⚠️ 注意**  
> `<meta charset="UTF-8">` 必须在 `<head>` 的前 1024 字节内，确保浏览器正确识别编码。

## 五、`<body>` 主体元素

### 5.1 作用

`<body>` 包含页面的所有可见内容。

```html
<body>
  <header>头部</header>
  <nav>导航</nav>
  <main>
    <h1>标题</h1>
    <p>段落</p>
  </main>
  <footer>底部</footer>
</body>
```

### 5.2 废弃的属性

```html
<!-- ❌ 不推荐：使用 HTML 属性控制样式 -->
<body bgcolor="#ffffff" text="#000000">

<!-- ✅ 推荐：使用 CSS -->
<body>
<style>
body {
  background-color: #ffffff;
  color: #000000;
}
</style>
```

## 六、HTML 语法规则

### 6.1 标签规则

**双标签（成对出现）**

```html
<p>段落内容</p>
<div>容器内容</div>
<h1>标题内容</h1>
```

**单标签（自闭合）**

```html
<br>
<hr>
<img src="image.jpg" alt="图片">
<input type="text">
<meta charset="UTF-8">
<link rel="stylesheet" href="style.css">
```

**大小写**

```html
<!-- HTML5：不区分大小写，但推荐小写 -->
<div>内容</div>        ✅ 推荐
<DIV>内容</DIV>        ✅ 有效但不推荐
<Div>内容</Div>        ✅ 有效但不推荐
```

### 6.2 嵌套规则

```html
<!-- ✅ 正确：先开后闭 -->
<div>
  <p>段落</p>
</div>

<!-- ❌ 错误：交叉嵌套 -->
<div>
  <p>段落</div>
</p>
```

**块级 vs 行内元素**

```html
<!-- ✅ 块级包含行内 -->
<div>
  <span>行内内容</span>
</div>

<!-- ✅ 块级包含块级 -->
<div>
  <p>段落</p>
</div>

<!-- ❌ 行内包含块级（通常不允许） -->
<span>
  <div>块级内容</div>
</span>

<!-- ✅ 例外：<a> 在 HTML5 中可以包含块级 -->
<a href="#">
  <div>可点击的块</div>
</a>
```

**特殊嵌套规则**

```html
<!-- ❌ <p> 不能包含块级元素 -->
<p>
  <div>错误</div>
</p>

<!-- ✅ <p> 可以包含行内元素 -->
<p>
  <span>正确</span>
  <strong>正确</strong>
</p>

<!-- ❌ <ul>/<ol> 的直接子元素只能是 <li> -->
<ul>
  <div>错误</div>
  <li>正确</li>
</ul>
```

### 6.3 属性规则

**基本语法**

```html
<tag attribute="value">内容</tag>
```

**属性值引号**

```html
<!-- ✅ 推荐：双引号 -->
<img src="image.jpg" alt="图片">

<!-- ✅ 可以：单引号 -->
<img src='image.jpg' alt='图片'>

<!-- ⚠️ 不推荐：无引号 -->
<img src=image.jpg alt=图片>
```

**布尔属性**

```html
<!-- 存在即为 true -->
<input type="checkbox" checked>
<input type="text" disabled>
<script src="script.js" defer></script>

<!-- 等价写法 -->
<input type="checkbox" checked="checked">
<input type="checkbox" checked="">

<!-- false：不写该属性 -->
<input type="checkbox">
```

**全局属性**

```html
<!-- id：唯一标识符 -->
<div id="header">头部</div>

<!-- class：类名 -->
<div class="container main-content">内容</div>

<!-- style：内联样式 -->
<div style="color: red;">红色文字</div>

<!-- title：提示文本 -->
<abbr title="HyperText Markup Language">HTML</abbr>

<!-- data-*：自定义数据 -->
<div data-user-id="123" data-role="admin">用户</div>

<!-- lang：语言 -->
<p lang="en">English content</p>

<!-- hidden：隐藏元素 -->
<div hidden>隐藏的内容</div>
```

### 6.4 注释

```html
<!-- 这是单行注释 -->

<!--
  这是多行注释
  可以跨越多行
-->

<!-- 注释的用途 -->

<!-- 1. 说明代码 -->
<!-- 导航栏开始 -->
<nav>...</nav>
<!-- 导航栏结束 -->

<!-- 2. 临时禁用代码 -->
<!--
<div class="old-feature">
  旧功能
</div>
-->
```

### 6.5 空白字符处理

```html
<!-- HTML 会合并连续空白为一个空格 -->
<p>这是    多个    空格</p>
<!-- 显示为：这是 多个 空格 -->

<p>这是
换行
符</p>
<!-- 显示为：这是 换行 符 -->

<!-- 保留空白：使用 <pre> -->
<pre>
这是    多个    空格
这是
换行
符
</pre>
```

### 6.6 特殊字符转义

```html
<!-- HTML 实体 -->
<p>&lt;div&gt; 标签</p>        <!-- 显示：<div> 标签 -->
<p>版权 &copy; 2024</p>        <!-- 显示：版权 © 2024 -->
<p>3 &lt; 5 &amp;&amp; 5 &gt; 3</p>  <!-- 显示：3 < 5 && 5 > 3 -->
```

**常用 HTML 实体：**

| 字符 | 实体 | 说明 |
|------|------|------|
| `<` | `&lt;` | 小于号 |
| `>` | `&gt;` | 大于号 |
| `&` | `&amp;` | 和号 |
| `"` | `&quot;` | 双引号 |
| ` ` | `&nbsp;` | 不换行空格 |
| `©` | `&copy;` | 版权符号 |
| `®` | `&reg;` | 注册商标 |

## 七、代码规范

> **📌 推荐的代码风格**
> 
> 1. **使用小写**：标签和属性名使用小写
> 2. **双引号**：属性值使用双引号
> 3. **缩进**：使用 2 或 4 个空格
> 4. **闭合标签**：始终闭合标签
> 5. **语义化**：选择合适的标签
> 6. **注释**：为复杂结构添加注释

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>规范示例</title>
</head>
<body>
  <!-- 导航栏 -->
  <nav>
    <ul>
      <li><a href="#home">首页</a></li>
      <li><a href="#about">关于</a></li>
    </ul>
  </nav>
  
  <!-- 主内容 -->
  <main>
    <article>
      <h1>文章标题</h1>
      <p>文章内容...</p>
    </article>
  </main>
  
  <!-- 底部 -->
  <footer>
    <p>&copy; 2024 网站名称</p>
  </footer>
</body>
</html>
```

## 参考资料

- [HTML Standard - Document](https://html.spec.whatwg.org/#the-html-element)
- [MDN - HTML 文档结构](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure)

---

**上一章** ← [第 1 章：HTML 简介与历史](./01-html-intro.md)  
**下一章** → [第 3 章：头部元素详解](./03-head-elements.md)
