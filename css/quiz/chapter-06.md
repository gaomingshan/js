# 第 6 章：样式表加载与阻塞 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 渲染阻塞

### 题目

CSS 加载会阻塞什么？

**选项：**
- A. HTML 解析
- B. 页面渲染
- C. JavaScript 执行
- D. 图片加载

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CSS 阻塞行为**

**CSS 会阻塞渲染，但不阻塞 HTML 解析**

```
HTML 解析 → DOM 树（不阻塞 ✅）
  ↓
CSS 加载 → CSSOM 树
  ↓
DOM + CSSOM → 渲染树（阻塞 ❌）
  ↓
布局 + 绘制
```

**为什么阻塞渲染？**
- 避免 FOUC（Flash of Unstyled Content）
- 确保首次渲染时样式正确
- 防止页面闪烁

**示例：**
```html
<head>
  <link rel="stylesheet" href="style.css">  <!-- 阻塞渲染 -->
</head>
<body>
  <div>内容</div>  <!-- HTML 继续解析，但不渲染 -->
</body>
```

**JavaScript 执行：**
- CSS 会阻塞后续 JavaScript 执行
- 因为 JS 可能访问样式信息

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 加载方式

### 题目

以下哪种方式加载 CSS 不会阻塞渲染？

**选项：**
- A. `<link rel="stylesheet">`
- B. `<style>` 标签
- C. `@import`
- D. 都会阻塞

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**所有 CSS 加载方式都会阻塞渲染**

**1. link 标签**
```html
<link rel="stylesheet" href="style.css">
<!-- 阻塞渲染 ❌ -->
```

**2. style 标签**
```html
<style>
  .box { color: red; }
</style>
<!-- 阻塞渲染 ❌ -->
```

**3. @import**
```css
@import url("base.css");
<!-- 阻塞渲染 ❌ -->
```

**为什么都阻塞？**
- 浏览器需要完整的 CSSOM
- 避免样式闪烁

**异步加载 CSS（不阻塞）：**
```html
<!-- 方法1：media 属性技巧 -->
<link rel="stylesheet" href="style.css" 
      media="print" onload="this.media='all'">

<!-- 方法2：JavaScript 动态插入 -->
<script>
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'style.css';
  document.head.appendChild(link);
</script>

<!-- 方法3：preload -->
<link rel="preload" href="style.css" as="style">
<link rel="stylesheet" href="style.css">
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 关键 CSS

### 题目

关键 CSS（Critical CSS）应该内联在 HTML 中。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

**关键 CSS 最佳实践**

**定义：**
- 首屏渲染所需的最小 CSS
- 用户首次看到的内容的样式

**为什么要内联？**
```html
<head>
  <style>
    /* 关键 CSS - 内联 */
    body { font-family: sans-serif; }
    .hero { display: block; }
    .header { background: #fff; }
  </style>
  
  <!-- 非关键 CSS - 异步加载 -->
  <link rel="preload" href="main.css" as="style" 
        onload="this.rel='stylesheet'">
</head>
```

**好处：**
- 减少渲染阻塞
- 加快首屏显示
- 改善 FCP（First Contentful Paint）

**提取关键 CSS 工具：**
```bash
# Critical CSS 提取工具
npm install critical

# Penthouse
npm install penthouse

# UnCSS
npm install uncss
```

**注意事项：**
- 控制大小（建议 < 14KB）
- 定期更新
- 结合构建工具自动化

</details>

---

## 第 4 题 🟡

**类型：** 代码题  
**标签：** 加载顺序

### 题目

以下代码中，JavaScript 何时执行？

```html
<head>
  <link rel="stylesheet" href="style.css">
  <script src="app.js"></script>
</head>
```

**选项：**
- A. 立即执行
- B. 等 style.css 加载完成后执行
- C. 与 CSS 并行执行
- D. 页面加载完成后执行

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CSS 阻塞 JavaScript 执行**

**执行顺序：**
```
1. 开始加载 style.css
2. 等待 style.css 下载和解析
3. 执行 app.js
4. 继续解析 HTML
```

**为什么 CSS 阻塞 JS？**
```javascript
// JavaScript 可能访问样式
const box = document.querySelector('.box');
const width = getComputedStyle(box).width;  // 需要 CSSOM
```

**解决方案：**

**方法1：async 属性**
```html
<link rel="stylesheet" href="style.css">
<script src="app.js" async></script>
<!-- async：不等待 CSS -->
```

**方法2：defer 属性**
```html
<link rel="stylesheet" href="style.css">
<script src="app.js" defer></script>
<!-- defer：DOMContentLoaded 前执行 -->
```

**方法3：移到底部**
```html
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- 内容 -->
  <script src="app.js"></script>
</body>
```

**对比：**
```
无属性：阻塞 HTML 解析，等待 CSS
async：  不阻塞解析，不等待 CSS，下载后立即执行
defer：  不阻塞解析，等待 HTML 解析完成后执行
```

</details>

---

## 第 5 题 🟡

**类型：** 多选题  
**标签：** 性能优化

### 题目

以下哪些方法可以优化 CSS 加载性能？

**选项：**
- A. 压缩 CSS 文件
- B. 使用 CDN
- C. 内联关键 CSS
- D. 合并多个 CSS 文件

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**CSS 加载优化方法（全部正确）**

**✅ A. 压缩 CSS**
```css
/* 压缩前：1000字节 */
.box {
  color: red;
  background: blue;
}

/* 压缩后：50字节 */
.box{color:red;background:blue}
```

**工具：**
- cssnano
- clean-css
- webpack/vite 自动压缩

**✅ B. 使用 CDN**
```html
<!-- CDN 加速 -->
<link rel="stylesheet" 
      href="https://cdn.example.com/style.css">
```

**好处：**
- 更快的下载速度
- 减轻服务器负载
- 利用浏览器缓存

**✅ C. 内联关键 CSS**
```html
<style>
  /* 首屏关键样式 */
  .hero { display: block; }
</style>
```

**✅ D. 合并文件**
```html
<!-- 合并前：多次请求 -->
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="layout.css">

<!-- 合并后：单次请求 -->
<link rel="stylesheet" href="bundle.css">
```

**其他优化：**

**1. 预加载**
```html
<link rel="preload" href="style.css" as="style">
```

**2. 异步加载**
```html
<link rel="stylesheet" href="non-critical.css" 
      media="print" onload="this.media='all'">
```

**3. 移除未使用的 CSS**
```bash
npm install purgecss
```

**4. 拆分 CSS**
```html
<!-- 首屏 -->
<style>/* Critical CSS */</style>

<!-- 其他 -->
<link rel="stylesheet" href="other.css">
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** preload

### 题目

`<link rel="preload">` 的作用是？

**选项：**
- A. 预解析 DNS
- B. 提前加载资源但不执行
- C. 预连接服务器
- D. 预渲染页面

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**preload 详解**

**定义：**
- 提前加载资源
- 不阻塞渲染
- 不立即执行/应用

**语法：**
```html
<link rel="preload" href="style.css" as="style">
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="image.jpg" as="image">
```

**工作流程：**
```
1. 浏览器提前下载资源
2. 存入缓存
3. 等待实际使用时从缓存读取
```

**实用场景：**

**1. 字体预加载**
```html
<link rel="preload" href="font.woff2" 
      as="font" type="font/woff2" crossorigin>
```

**2. CSS 预加载**
```html
<link rel="preload" href="style.css" as="style">
<link rel="stylesheet" href="style.css">
```

**3. 关键图片**
```html
<link rel="preload" href="hero.jpg" as="image">
```

**对比其他资源提示：**

**preconnect**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<!-- 提前建立连接 -->
```

**dns-prefetch**
```html
<link rel="dns-prefetch" href="https://api.example.com">
<!-- 提前解析 DNS -->
```

**prefetch**
```html
<link rel="prefetch" href="next-page.css">
<!-- 预加载未来可能用到的资源 -->
```

**prerender**
```html
<link rel="prerender" href="next-page.html">
<!-- 预渲染整个页面 -->
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** media 查询

### 题目

以下代码的加载行为是什么？

```html
<link rel="stylesheet" href="print.css" media="print">
```

**选项：**
- A. 立即加载，立即应用
- B. 立即加载，打印时应用
- C. 打印时才加载
- D. 不加载

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**media 属性行为**

**加载行为：**
- 所有 CSS 都会立即下载（不管 media 条件）
- 但只有匹配条件时才应用

```html
<link rel="stylesheet" href="print.css" media="print">
<!-- 
  1. 立即下载 print.css ✅
  2. 屏幕显示时：不应用样式
  3. 打印时：应用样式 ✅
-->
```

**常见 media 查询：**
```html
<!-- 打印样式 -->
<link rel="stylesheet" href="print.css" media="print">

<!-- 响应式 -->
<link rel="stylesheet" href="mobile.css" 
      media="(max-width: 768px)">

<!-- 横屏 -->
<link rel="stylesheet" href="landscape.css" 
      media="(orientation: landscape)">

<!-- 高分屏 -->
<link rel="stylesheet" href="retina.css" 
      media="(min-resolution: 2dppx)">
```

**异步加载技巧：**
```html
<!-- 初始：不匹配，不阻塞渲染 -->
<link rel="stylesheet" href="non-critical.css" 
      media="print" onload="this.media='all'">
<!-- 加载完成后改为 all，应用样式 -->
```

**原理：**
```
1. media="print" → 不匹配当前环境
2. CSS 在后台加载（不阻塞渲染）
3. onload → 改为 media="all"
4. 应用样式
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 阻塞分析

### 题目

分析以下代码的渲染阻塞情况：

```html
<head>
  <link rel="stylesheet" href="a.css">
  <script src="b.js"></script>
  <link rel="stylesheet" href="c.css">
</head>
```

**选项：**
- A. a.css 阻塞，b.js 阻塞，c.css 阻塞
- B. 只有 a.css 阻塞渲染
- C. a.css 和 c.css 阻塞渲染
- D. 全部阻塞渲染和解析

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**详细阻塞分析**

**执行流程：**
```
1. 加载 a.css
   ├─ 阻塞渲染 ❌
   └─ 不阻塞 HTML 解析 ✅

2. 遇到 b.js
   ├─ 等待 a.css 加载完成
   ├─ 阻塞 HTML 解析 ❌
   └─ 执行 b.js

3. 加载 c.css
   ├─ 阻塞渲染 ❌
   └─ 不阻塞 HTML 解析 ✅

4. 完成所有加载后才渲染
```

**关键点：**

**CSS 阻塞：**
- 阻塞渲染
- 不阻塞 HTML 解析

**Script 阻塞：**
- 阻塞 HTML 解析
- 等待前面的 CSS

**优化方案：**

**方案1：async/defer**
```html
<link rel="stylesheet" href="a.css">
<script src="b.js" defer></script>  <!-- 不阻塞解析 -->
<link rel="stylesheet" href="c.css">
```

**方案2：移动 script**
```html
<head>
  <link rel="stylesheet" href="a.css">
  <link rel="stylesheet" href="c.css">
</head>
<body>
  <!-- 内容 -->
  <script src="b.js"></script>  <!-- 底部加载 -->
</body>
```

**方案3：异步 CSS**
```html
<head>
  <link rel="preload" href="a.css" as="style">
  <link rel="preload" href="c.css" as="style">
  <script src="b.js" async></script>
</head>
```

**最佳实践：**
```html
<head>
  <!-- 关键 CSS 内联 -->
  <style>/* Critical CSS */</style>
  
  <!-- 异步加载其他 CSS -->
  <link rel="preload" href="main.css" as="style">
  
  <!-- defer 脚本 -->
  <script src="app.js" defer></script>
</head>
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

如何实现 CSS 的懒加载？

**选项：**
- A. 使用 `lazy` 属性
- B. JavaScript 动态插入
- C. 使用 `loading="lazy"`
- D. CSS 不支持懒加载

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**CSS 懒加载实现**

**方法1：JavaScript 动态插入**
```javascript
// 监听滚动
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'component.css';
      document.head.appendChild(link);
      
      observer.unobserve(entry.target);
    }
  });
});

// 观察目标元素
observer.observe(document.querySelector('.lazy-section'));
```

**方法2：media 技巧**
```html
<link rel="stylesheet" href="below-fold.css" 
      media="print" onload="this.media='all'">
```

**方法3：条件加载**
```javascript
function loadCSS(href) {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    document.head.appendChild(link);
  });
}

// 路由切换时加载
router.on('page2', () => {
  loadCSS('page2.css');
});
```

**方法4：模块化（Webpack/Vite）**
```javascript
// 动态导入（自动拆分 CSS）
import('./component.js').then(module => {
  // component.css 也会被动态加载
});
```

**实用场景：**

**1. 首屏优化**
```html
<!-- 首屏 CSS -->
<style>/* Critical CSS */</style>

<!-- 延迟加载其他 -->
<script>
  window.addEventListener('load', () => {
    loadCSS('non-critical.css');
  });
</script>
```

**2. 条件加载**
```javascript
// 移动端加载不同样式
if (window.innerWidth < 768) {
  loadCSS('mobile.css');
} else {
  loadCSS('desktop.css');
}
```

**3. 路由懒加载**
```javascript
// SPA 路由切换
const routes = {
  home: () => loadCSS('home.css'),
  about: () => loadCSS('about.css')
};
```

**注意：**
- A, C 选项的属性不存在
- CSS 本身没有懒加载机制
- 需要通过 JavaScript 实现

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 综合应用

### 题目

关于关键渲染路径（Critical Rendering Path）优化，以下说法正确的是？

**选项：**
- A. 减少关键资源数量
- B. 减小关键资源体积
- C. 缩短关键路径长度
- D. 增加 HTTP 请求数

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**关键渲染路径优化（CRP）**

**✅ A. 减少关键资源**
```html
<!-- 优化前：3 个关键资源 -->
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="layout.css">

<!-- 优化后：1 个关键资源 -->
<link rel="stylesheet" href="bundle.css">
```

**✅ B. 减小资源体积**
```css
/* 压缩 + Tree Shaking */
/* 从 100KB → 20KB */
```

**方法：**
- 压缩 CSS
- 移除未使用的样式
- 使用现代语法

**✅ C. 缩短路径长度**
```html
<!-- 路径长：CSS → JS → CSS → Render -->
<link rel="stylesheet" href="a.css">
<script src="b.js"></script>
<link rel="stylesheet" href="c.css">

<!-- 路径短：CSS → Render -->
<style>/* Critical CSS */</style>
<script src="b.js" defer></script>
```

**❌ D. 增加请求（错误）**
- 应该减少请求数
- HTTP/2 下可适当增加（多路复用）

**完整优化策略：**

**1. 最小化关键资源**
```html
<head>
  <!-- 内联关键 CSS -->
  <style>/* 14KB 以内 */</style>
  
  <!-- 预加载字体 -->
  <link rel="preload" href="font.woff2" as="font">
  
  <!-- 异步非关键 CSS -->
  <link rel="stylesheet" href="other.css" 
        media="print" onload="this.media='all'">
</head>
```

**2. 优化加载顺序**
```html
<head>
  <!-- 1. 关键 CSS（内联）-->
  <style>/* Critical */</style>
  
  <!-- 2. 预连接 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- 3. 字体预加载 -->
  <link rel="preload" href="font.woff2" as="font">
  
  <!-- 4. 延迟脚本 -->
  <script src="app.js" defer></script>
</head>
```

**3. 性能指标**
```
优化目标：
- FCP (First Contentful Paint) < 1.8s
- LCP (Largest Contentful Paint) < 2.5s
- CLS (Cumulative Layout Shift) < 0.1
```

**4. 工具**
```bash
# Lighthouse
npm install -g lighthouse

# Critical CSS 提取
npm install critical

# 性能分析
Chrome DevTools → Performance
```

</details>

---

**导航**  
[上一章：第 5 章 - CSS解析机制](./chapter-05.md) | [返回目录](../README.md) | [下一章：第 7 章 - 层叠算法详解](./chapter-07.md)
