# 第 3 章：头部元素详解 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** meta 标签

### 题目

以下哪个 meta 标签用于设置移动端视口？

**选项：**
- A. `<meta name="description" content="...">`
- B. `<meta name="viewport" content="width=device-width">`
- C. `<meta charset="UTF-8">`
- D. `<meta name="keywords" content="...">`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**viewport meta 标签**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**常用属性：**
- `width=device-width`：宽度等于设备宽度
- `initial-scale=1.0`：初始缩放比例
- `maximum-scale=1.0`：最大缩放比例
- `minimum-scale=1.0`：最小缩放比例
- `user-scalable=no`：禁止用户缩放（不推荐）

**完整示例：**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>响应式网页</title>
</head>
<body>
  <h1>移动端适配</h1>
</body>
</html>
```

**为什么需要 viewport？**
- 移动浏览器默认视口宽度是 980px
- 导致页面缩小显示
- 设置 viewport 后，页面按设备实际宽度显示

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** title 标签

### 题目

一个 HTML 文档可以有多个 `<title>` 标签。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**`<title>` 标签规则**

```html
<!-- ❌ 错误：多个 title -->
<head>
  <title>标题1</title>
  <title>标题2</title>
</head>

<!-- ✅ 正确：只有一个 title -->
<head>
  <meta charset="UTF-8">
  <title>网页标题</title>
</head>
```

**`<title>` 的作用：**
1. 显示在浏览器标签页
2. 收藏夹显示的名称
3. 搜索引擎结果的标题
4. 社交媒体分享的标题

**最佳实践：**
```html
<!-- SEO 友好的标题 -->
<title>文章标题 - 分类 - 网站名称</title>
<title>产品名称 - 品牌名称</title>

<!-- 长度：50-60 字符 -->
<title>深入理解 JavaScript 闭包 - 前端教程 - 技术博客</title>
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** link 标签

### 题目

以下哪个 `<link>` 标签用于引入外部 CSS 样式表？

**选项：**
- A. `<link src="style.css">`
- B. `<link href="style.css" rel="stylesheet">`
- C. `<link type="text/css" href="style.css">`
- D. `<style src="style.css"></style>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**引入外部 CSS**

```html
<head>
  <link rel="stylesheet" href="style.css">
</head>
```

**`<link>` 标签属性：**
- `rel="stylesheet"`：关系类型（必需）
- `href="..."`：资源路径（必需）
- `type="text/css"`：MIME 类型（HTML5 中可选）

**其他常用 rel 值：**
```html
<!-- 网站图标 -->
<link rel="icon" href="favicon.ico">
<link rel="apple-touch-icon" href="icon.png">

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 预加载 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 规范链接 -->
<link rel="canonical" href="https://example.com/page">

<!-- RSS 订阅 -->
<link rel="alternate" type="application/rss+xml" href="feed.xml">
```

**条件加载：**
```html
<!-- 打印样式 -->
<link rel="stylesheet" href="print.css" media="print">

<!-- 移动端样式 -->
<link rel="stylesheet" href="mobile.css" media="screen and (max-width: 768px)">
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** meta SEO

### 题目

以下哪些 meta 标签对 SEO 有帮助？

**选项：**
- A. `<meta name="description" content="...">`
- B. `<meta name="keywords" content="...">`
- C. `<meta name="robots" content="index,follow">`
- D. `<meta charset="UTF-8">`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, C

### 📖 解析

**SEO 相关的 meta 标签**

**1. description（重要）**
```html
<meta name="description" content="这是一段150-160字符的页面描述，会显示在搜索结果中。">
```
- 显示在搜索结果摘要
- 长度：150-160 字符
- 包含关键词，吸引点击

**2. robots（重要）**
```html
<!-- 允许索引和跟踪链接 -->
<meta name="robots" content="index, follow">

<!-- 禁止索引 -->
<meta name="robots" content="noindex, nofollow">

<!-- 不缓存 -->
<meta name="robots" content="noarchive">
```

**3. keywords（已不重要）**
```html
<meta name="keywords" content="HTML, CSS, JavaScript">
```
- Google 已不使用 keywords
- 其他搜索引擎也基本忽略
- 原因：过度滥用导致失效

**4. charset（不影响 SEO）**
```html
<meta charset="UTF-8">
```
- 用于字符编码
- 不直接影响 SEO

**其他重要的 SEO 元素：**

```html
<!-- Open Graph（社交媒体） -->
<meta property="og:title" content="页面标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/page">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="页面标题">

<!-- 规范链接 -->
<link rel="canonical" href="https://example.com/page">
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** script 标签

### 题目

以下三种引入 JavaScript 的方式有什么区别？

```html
<!-- 方式1 -->
<script src="app.js"></script>

<!-- 方式2 -->
<script src="app.js" defer></script>

<!-- 方式3 -->
<script src="app.js" async></script>
```

**选项：**
- A. 三种方式完全相同
- B. defer 延迟执行，async 异步执行
- C. defer 按顺序执行，async 不保证顺序
- D. B 和 C 都正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**script 加载方式对比**

**1. 默认方式（阻塞）**
```html
<script src="app.js"></script>
```
- 立即下载并执行
- **阻塞** HTML 解析
- 按顺序执行

**2. defer（延迟）**
```html
<script src="app.js" defer></script>
```
- 并行下载，**不阻塞** HTML 解析
- **等待** HTML 解析完成后执行
- **按顺序**执行多个 defer 脚本
- 在 `DOMContentLoaded` 之前执行

**3. async（异步）**
```html
<script src="app.js" async></script>
```
- 并行下载，**不阻塞** HTML 解析
- 下载完成后**立即执行**
- **不保证**执行顺序
- 适合独立脚本（如统计代码）

**执行时间轴：**

```
HTML 解析: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                          ↓
                                    DOMContentLoaded

默认 script:
  下载 ▓▓▓ → 执行 ▓ (阻塞解析)

defer script:
  下载 ▓▓▓ (并行)
                执行顺序: 1 → 2 → 3 (DOMContentLoaded 前)

async script:
  下载 ▓▓▓ (并行)
      执行 ▓ (下载完就执行，顺序不定)
```

**使用建议：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Script 加载</title>
  
  <!-- 独立脚本：使用 async -->
  <script src="analytics.js" async></script>
</head>
<body>
  <h1>内容</h1>
  
  <!-- 依赖 DOM 的脚本：使用 defer 或放底部 -->
  <script src="app.js" defer></script>
  
  <!-- 或者放在 </body> 前 -->
  <script src="app.js"></script>
</body>
</html>
```

**多个脚本：**
```html
<!-- defer：保证顺序 -->
<script src="jquery.js" defer></script>
<script src="plugin.js" defer></script>  <!-- 依赖 jquery -->
<script src="app.js" defer></script>     <!-- 依赖 plugin -->

<!-- async：不保证顺序 -->
<script src="ga.js" async></script>
<script src="fb.js" async></script>
<!-- ga.js 和 fb.js 执行顺序不确定 -->
```

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** base 标签

### 题目

`<base>` 标签的作用是什么？

**选项：**
- A. 设置页面的基础字体大小
- B. 设置页面中所有相对 URL 的基准地址
- C. 设置页面的背景颜色
- D. 设置页面的默认语言

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**`<base>` 标签**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <base href="https://example.com/" target="_blank">
  <title>Base 标签</title>
</head>
<body>
  <!-- 相对 URL 会基于 base href -->
  <a href="about">关于</a>
  <!-- 实际链接：https://example.com/about -->
  
  <img src="images/logo.png" alt="Logo">
  <!-- 实际路径：https://example.com/images/logo.png -->
</body>
</html>
```

**属性：**
- `href`：基准 URL
- `target`：默认打开方式（`_blank`, `_self`, `_parent`, `_top`）

**注意事项：**

```html
<!-- ✅ 正确：base 在所有 URL 之前 -->
<head>
  <base href="https://example.com/">
  <link rel="stylesheet" href="css/style.css">
</head>

<!-- ❌ 错误：base 在 URL 之后 -->
<head>
  <link rel="stylesheet" href="css/style.css">
  <base href="https://example.com/">
</head>
```

**使用场景：**
1. 单页应用（SPA）
2. 静态站点生成器
3. 文档站点

**限制：**
- 一个文档只能有一个 `<base>`
- 锚点链接（`#section`）不受影响
- JavaScript `location.href` 不受影响

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 资源提示

### 题目

以下哪些是 HTML5 的资源提示（Resource Hints）？

**选项：**
- A. `<link rel="preconnect">`
- B. `<link rel="prefetch">`
- C. `<link rel="preload">`
- D. `<link rel="dns-prefetch">`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**资源提示（全部正确）**

**1. dns-prefetch（DNS 预解析）**
```html
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
```
- 提前解析域名的 DNS
- 减少 DNS 查询时间
- 适用于第三方资源

**2. preconnect（预连接）**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
```
- DNS 解析 + TCP 握手 + TLS 协商
- 比 dns-prefetch 更进一步
- 适用于关键第三方资源

**3. prefetch（预获取）**
```html
<link rel="prefetch" href="next-page.html">
<link rel="prefetch" href="large-image.jpg">
```
- 低优先级下载未来可能用到的资源
- 浏览器空闲时下载
- 适用于下一页面的资源

**4. preload（预加载）**
```html
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="style.css" as="style">
<link rel="preload" href="script.js" as="script">
```
- 高优先级加载当前页面需要的资源
- 必须指定 `as` 属性
- 适用于关键资源

**5. prerender（预渲染）**
```html
<link rel="prerender" href="next-page.html">
```
- 在后台渲染整个页面
- 消耗资源较大
- 浏览器支持有限

**完整示例：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="https://cdn.example.com">
  
  <!-- 预连接关键资源 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="font.woff2" as="font" crossorigin>
  <link rel="preload" href="hero-image.jpg" as="image">
  
  <!-- 预获取下一页资源 -->
  <link rel="prefetch" href="/page2.html">
  
  <title>资源提示</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>页面内容</h1>
</body>
</html>
```

**性能对比：**

| 提示 | 时机 | 优先级 | 用途 |
|------|------|--------|------|
| dns-prefetch | 提前 | 低 | 第三方域名 |
| preconnect | 提前 | 中 | 关键第三方 |
| preload | 当前页 | 高 | 关键资源 |
| prefetch | 未来 | 低 | 下一页资源 |

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 完整 head

### 题目

请补全一个完整的 `<head>` 部分，包含 SEO、移动端适配、社交媒体分享等必要元素。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  ______  <!-- 字符编码 -->
  ______  <!-- 视口设置 -->
  ______  <!-- 页面标题 -->
  ______  <!-- 页面描述 -->
  ______  <!-- Open Graph -->
  ______  <!-- 样式表 -->
</head>
```

**选项：**
- A. 按照最佳实践补全所有元素
- B. 只需要 charset 和 title
- C. 只需要 viewport 和 description
- D. 以上都不对

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**完整的 `<head>` 最佳实践**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 必需：字符编码 -->
  <meta charset="UTF-8">
  
  <!-- 必需：移动端适配 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 必需：页面标题 -->
  <title>页面标题 - 网站名称</title>
  
  <!-- SEO：页面描述 -->
  <meta name="description" content="页面描述，150-160字符，显示在搜索结果中">
  
  <!-- SEO：搜索引擎 -->
  <meta name="robots" content="index, follow">
  
  <!-- 规范链接 -->
  <link rel="canonical" href="https://example.com/page">
  
  <!-- Open Graph：社交媒体 -->
  <meta property="og:title" content="页面标题">
  <meta property="og:description" content="页面描述">
  <meta property="og:image" content="https://example.com/share-image.jpg">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:type" content="website">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="页面标题">
  <meta name="twitter:description" content="页面描述">
  <meta name="twitter:image" content="https://example.com/share-image.jpg">
  
  <!-- 网站图标 -->
  <link rel="icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  
  <!-- 主题颜色 -->
  <meta name="theme-color" content="#3b82f6">
  
  <!-- 资源提示 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://cdn.example.com">
  
  <!-- 样式表 -->
  <link rel="stylesheet" href="/css/style.css">
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

**按重要性分级：**

**🔴 必需（Level 1）**
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>页面标题</title>
```

**🟡 推荐（Level 2）**
```html
<meta name="description" content="...">
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="style.css">
```

**🟢 最佳实践（Level 3）**
```html
<!-- SEO -->
<link rel="canonical" href="...">
<meta name="robots" content="index, follow">

<!-- 社交媒体 -->
<meta property="og:title" content="...">
<meta property="og:image" content="...">

<!-- 性能优化 -->
<link rel="preconnect" href="...">
<link rel="preload" href="..." as="...">
```

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 性能优化

### 题目

关于 `<head>` 部分的性能优化，以下说法正确的是？

**选项：**
- A. CSS 应该在 `<head>` 中引入
- B. JavaScript 应该放在 `</body>` 前或使用 defer
- C. 关键 CSS 可以内联在 `<style>` 中
- D. 字体文件应该使用 preload

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**`<head>` 性能优化（全部正确）**

**1. CSS 在 head 中**
```html
<head>
  <!-- ✅ CSS 放在 head，避免 FOUC -->
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>内容</h1>
</body>
```

**FOUC（Flash of Unstyled Content）**：
- CSS 在底部会导致页面先显示无样式内容
- 然后突然应用样式，造成闪烁

**2. JavaScript 位置**
```html
<!-- 方案1：defer -->
<head>
  <script src="app.js" defer></script>
</head>

<!-- 方案2：放底部 -->
<body>
  <h1>内容</h1>
  <script src="app.js"></script>
</body>

<!-- 方案3：async（独立脚本） -->
<head>
  <script src="analytics.js" async></script>
</head>
```

**3. 关键 CSS 内联**
```html
<head>
  <!-- 内联首屏关键样式 -->
  <style>
    /* 关键 CSS：首屏可见元素 */
    body { margin: 0; font-family: sans-serif; }
    .header { background: #333; color: #fff; }
    .hero { min-height: 100vh; }
  </style>
  
  <!-- 非关键 CSS 延迟加载 -->
  <link rel="preload" href="style.css" as="style" 
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="style.css"></noscript>
</head>
```

**4. 字体预加载**
```html
<head>
  <!-- 预加载字体 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" 
        type="font/woff2" crossorigin>
  
  <!-- 预连接字体服务 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
</head>
```

**完整性能优化示例：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 1. 预连接关键域名 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://cdn.example.com">
  
  <!-- 2. 预加载关键资源 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
  <link rel="preload" href="/images/hero.jpg" as="image">
  
  <title>高性能网页</title>
  
  <!-- 3. 内联关键 CSS -->
  <style>
    /* 首屏关键样式 */
    body { margin: 0; }
    .hero { min-height: 100vh; background: url('/images/hero.jpg'); }
  </style>
  
  <!-- 4. 异步加载非关键 CSS -->
  <link rel="preload" href="/css/style.css" as="style" 
        onload="this.onload=null;this.rel='stylesheet'">
  
  <!-- 5. defer 脚本 -->
  <script src="/js/app.js" defer></script>
  
  <!-- 6. async 独立脚本 -->
  <script src="/js/analytics.js" async></script>
</head>
<body>
  <div class="hero">
    <h1>欢迎</h1>
  </div>
  
  <!-- 懒加载图片 -->
  <img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy" alt="图片">
</body>
</html>
```

**性能检查清单：**
- ✅ 字符编码在前 1024 字节
- ✅ CSS 在 head 中
- ✅ JavaScript 使用 defer/async 或放底部
- ✅ 关键 CSS 内联
- ✅ 字体预加载
- ✅ 第三方资源预连接
- ✅ 图片懒加载

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** 元数据最佳实践

### 题目

对比以下两个 `<head>` 部分，指出哪个更优，为什么？

```html
<!-- 版本 A -->
<head>
  <title>网站</title>
  <link rel="stylesheet" href="style.css">
  <script src="app.js"></script>
</head>

<!-- 版本 B -->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="网站描述">
  <title>页面标题 - 网站名称</title>
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="style.css">
  <script src="app.js" defer></script>
</head>
```

<details>
<summary>查看答案</summary>

### 📖 解析

**版本 B 明显更优**

**版本 A 的问题：**

1. ❌ 缺少字符编码声明
2. ❌ 缺少 viewport（移动端显示异常）
3. ❌ 标题不够描述性
4. ❌ 缺少 description（影响 SEO）
5. ❌ 缺少 favicon
6. ❌ script 阻塞渲染

**版本 B 的优势：**

1. ✅ 完整的字符编码
2. ✅ 移动端适配
3. ✅ SEO 友好的标题和描述
4. ✅ 有网站图标
5. ✅ script 使用 defer

**更优的版本（完整最佳实践）：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- === 基础必需 === -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- === SEO === -->
  <title>页面标题 - 分类 - 网站名称</title>
  <meta name="description" content="准确的页面描述，150-160字符，包含关键词">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/page">
  
  <!-- === 社交媒体 === -->
  <meta property="og:title" content="页面标题">
  <meta property="og:description" content="页面描述">
  <meta property="og:image" content="https://example.com/share.jpg">
  <meta property="og:url" content="https://example.com/page">
  
  <!-- === 图标 === -->
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#3b82f6">
  
  <!-- === 性能优化 === -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
  
  <!-- === 样式 === -->
  <style>
    /* 关键 CSS 内联 */
    body { margin: 0; font-family: sans-serif; }
  </style>
  <link rel="stylesheet" href="/css/style.css">
  
  <!-- === 脚本 === -->
  <script src="/js/app.js" defer></script>
  <script src="/js/analytics.js" async></script>
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

**检查清单：**

| 项目 | 版本A | 版本B | 最佳实践 |
|------|-------|-------|---------|
| charset | ❌ | ✅ | ✅ |
| viewport | ❌ | ✅ | ✅ |
| 描述性title | ❌ | ✅ | ✅ |
| description | ❌ | ✅ | ✅ |
| favicon | ❌ | ✅ | ✅ |
| script优化 | ❌ | ✅ | ✅ |
| 社交媒体 | ❌ | ❌ | ✅ |
| 性能优化 | ❌ | ❌ | ✅ |

</details>

---

**📌 本章总结**

- `<meta charset="UTF-8">` 必须在 `<title>` 之前
- viewport 是移动端必备
- description 对 SEO 很重要，keywords 已不重要
- 使用 defer/async 优化 script 加载
- preconnect/preload 提升性能
- 完整的 head 包含：基础、SEO、社交媒体、性能优化

**上一章** ← [第 2 章：文档结构与语法](./chapter-02.md)  
**下一章** → [第 4 章：文本内容标签](./chapter-04.md)
