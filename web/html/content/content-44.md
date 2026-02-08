# 链接与导航模式

## 核心概念

`<a>`（anchor）是 HTML 中最基础也最重要的交互元素——它定义了文档之间的**超链接关系**，是 Web 之所以叫"网"的根基。

**后端类比**：
- `<a href>` ≈ API 响应中的 `Link` 头或 HATEOAS 链接
- 锚点导航 ≈ 数据库中的主键定位
- `target="_blank"` ≈ 新建线程处理请求
- SPA 路由拦截 ≈ 中间件重写请求

## `<a>` 标签完整属性

```html
<a
  href="https://example.com/page"
  target="_blank"
  rel="noopener noreferrer"
  download="filename.pdf"
  hreflang="en"
  type="application/pdf"
  referrerpolicy="no-referrer"
  ping="/api/track-click"
>
  链接文本
</a>
```

| 属性 | 作用 | 常用值 |
|------|------|-------|
| `href` | 链接目标 | URL / `#id` / `mailto:` / `tel:` |
| `target` | 打开方式 | `_self` / `_blank` / `_parent` / `_top` |
| `rel` | 与目标的关系 | `noopener` / `noreferrer` / `nofollow` |
| `download` | 触发下载 | 文件名（可选） |
| `hreflang` | 目标语言 | 语言代码 |
| `type` | 目标 MIME 类型 | 提示性 |
| `referrerpolicy` | Referer 策略 | `no-referrer` 等 |
| `ping` | 点击追踪 URL | 异步 POST 请求 |

## href 协议类型

### HTTP / HTTPS 链接

```html
<!-- 绝对 URL -->
<a href="https://example.com/about">关于我们</a>

<!-- 协议相对 URL（已不推荐，全站 HTTPS 后无必要） -->
<a href="//example.com/about">关于我们</a>

<!-- 相对 URL -->
<a href="/about">关于我们</a>        <!-- 相对于根路径 -->
<a href="about.html">关于我们</a>    <!-- 相对于当前路径 -->
<a href="../index.html">首页</a>     <!-- 上级目录 -->
```

### 锚点链接（页内定位）

```html
<!-- 定义锚点 -->
<h2 id="chapter-1">第一章</h2>
<h2 id="chapter-2">第二章</h2>

<!-- 跳转到锚点 -->
<a href="#chapter-1">跳到第一章</a>
<a href="#chapter-2">跳到第二章</a>

<!-- 回到顶部 -->
<a href="#">回到顶部</a>
<!-- 或更语义化 -->
<a href="#top">回到顶部</a>  <!-- 浏览器默认 #top 跳转到页面顶部 -->

<!-- 跨页面锚点 -->
<a href="/docs/guide.html#installation">安装指南</a>
```

平滑滚动：

```css
html {
  scroll-behavior: smooth;  /* 锚点跳转时平滑滚动 */
}

/* 或仅对特定容器 */
.scroll-container {
  scroll-behavior: smooth;
}
```

锚点偏移（避免被固定导航栏遮挡）：

```css
/* 方式 1：scroll-margin */
[id] {
  scroll-margin-top: 80px;  /* 导航栏高度 */
}

/* 方式 2：scroll-padding（应用于滚动容器） */
html {
  scroll-padding-top: 80px;
}
```

### mailto 协议

```html
<!-- 基础 -->
<a href="mailto:support@example.com">联系我们</a>

<!-- 带预填信息 -->
<a href="mailto:support@example.com?subject=Bug%20Report&body=描述问题...&cc=team@example.com">
  发送 Bug 报告
</a>

<!-- 多收件人 -->
<a href="mailto:a@example.com,b@example.com">发送给多人</a>
```

参数：
- `subject`：邮件主题
- `body`：邮件正文
- `cc`：抄送
- `bcc`：密送

所有参数值需要 URL 编码。

### tel 协议

```html
<!-- 基础 -->
<a href="tel:+8613800138000">拨打电话</a>

<!-- 国际格式 -->
<a href="tel:+86-138-0013-8000">+86 138 0013 8000</a>

<!-- 分机号 -->
<a href="tel:+862112345678;ext=123">总机（分机 123）</a>
```

在移动端点击会直接调起拨号界面，桌面端通常调起系统默认通信应用。

### javascript: 协议（不推荐）

```html
<!-- ❌ 不推荐：可访问性差、安全风险 -->
<a href="javascript:void(0)" onclick="doSomething()">点击</a>
<a href="javascript:alert('hello')">点击</a>

<!-- ✅ 如果是导航行为，用正常 href -->
<a href="/target-page">跳转</a>

<!-- ✅ 如果是交互行为，用 button -->
<button type="button" onclick="doSomething()">点击</button>
```

**原则**：
- 如果点击后**跳转页面** → 用 `<a href>`
- 如果点击后**执行操作**（不跳转） → 用 `<button>`

## download 属性

```html
<!-- 点击时下载而非打开 -->
<a href="/files/report.pdf" download>下载报告</a>

<!-- 指定下载文件名 -->
<a href="/api/export?format=csv" download="monthly-report.csv">导出 CSV</a>

<!-- 配合 Blob URL 实现前端生成文件下载 -->
```

```javascript
// 前端生成文件并触发下载
function downloadCSV(data) {
  const csvContent = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'export.csv';
  a.click();

  URL.revokeObjectURL(url);
}
```

**限制**：
- `download` 只对**同源 URL** 或 `blob:` / `data:` URL 有效
- 跨域资源的 `download` 属性会被忽略（浏览器安全限制）

## target 属性与窗口控制

```html
<!-- 当前窗口打开（默认） -->
<a href="/about" target="_self">关于</a>

<!-- 新窗口/标签页打开 -->
<a href="https://external.com" target="_blank" rel="noopener noreferrer">外部链接</a>

<!-- 父框架打开（iframe 场景） -->
<a href="/page" target="_parent">在父框架打开</a>

<!-- 顶层窗口打开（跳出所有 iframe） -->
<a href="/page" target="_top">在顶层打开</a>

<!-- 命名窗口（同名 target 复用同一窗口） -->
<a href="/preview" target="preview-window">预览</a>
```

### 何时使用 target="_blank"

**应该使用**：
- 外部网站链接（用户不应离开当前流程）
- 文档/PDF 预览
- 帮助文档链接

**不应使用**：
- 站内导航（破坏浏览器后退按钮）
- 表单提交后的跳转

**必须配合 `rel="noopener noreferrer"`**（安全原因，详见附录 G）。

## rel 属性详解

### 常用 rel 值

```html
<!-- 安全相关 -->
<a href="..." rel="noopener">      <!-- 阻止 window.opener 反向访问 -->
<a href="..." rel="noreferrer">    <!-- 不发送 Referer + noopener -->
<a href="..." rel="nofollow">      <!-- 告诉搜索引擎不传递权重 -->

<!-- SEO 相关 -->
<a href="..." rel="sponsored">     <!-- 付费/广告链接 -->
<a href="..." rel="ugc">           <!-- 用户生成内容中的链接 -->

<!-- 导航相关 -->
<a href="..." rel="prev">          <!-- 上一页 -->
<a href="..." rel="next">          <!-- 下一页 -->
<a href="..." rel="author">        <!-- 作者页面 -->
<a href="..." rel="help">          <!-- 帮助页面 -->
<a href="..." rel="license">       <!-- 版权许可 -->

<!-- 多个值用空格分隔 -->
<a href="..." rel="noopener noreferrer nofollow">外部链接</a>
```

### 工程实践：链接策略

```javascript
// 统一处理外部链接
document.querySelectorAll('a[href^="http"]').forEach(link => {
  // 非本站链接
  if (link.hostname !== location.hostname) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // 可选：添加外部链接图标
    link.classList.add('external-link');
  }
});
```

## 导航模式实战

### 主导航

```html
<header>
  <nav aria-label="主导航">
    <ul>
      <li><a href="/" aria-current="page">首页</a></li>
      <li><a href="/products">产品</a></li>
      <li><a href="/docs">文档</a></li>
      <li><a href="/blog">博客</a></li>
      <li><a href="/contact">联系我们</a></li>
    </ul>
  </nav>
</header>
```

**关键**：
- `aria-current="page"` 标记当前所在页面
- 使用 `<ul>` + `<li>` 构建列表语义
- `aria-label="主导航"` 区分多个 `<nav>`

### 面包屑导航

```html
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/docs">文档</a></li>
    <li><a href="/docs/html">HTML</a></li>
    <li><a href="/docs/html/forms" aria-current="page">表单</a></li>
  </ol>
</nav>
```

面包屑使用 `<ol>`（有序列表），因为层级有明确的顺序关系。

### 结构化面包屑（SEO）

```html
<nav aria-label="面包屑">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/"><span itemprop="name">首页</span></a>
      <meta itemprop="position" content="1">
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/docs"><span itemprop="name">文档</span></a>
      <meta itemprop="position" content="2">
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">表单</span>
      <meta itemprop="position" content="3">
    </li>
  </ol>
</nav>
```

### 分页导航

```html
<nav aria-label="分页导航">
  <ul class="pagination">
    <li>
      <a href="/posts?page=2" rel="prev" aria-label="上一页">←</a>
    </li>
    <li><a href="/posts?page=1">1</a></li>
    <li><a href="/posts?page=2">2</a></li>
    <li>
      <a href="/posts?page=3" aria-current="page" aria-label="第 3 页，当前页">3</a>
    </li>
    <li><a href="/posts?page=4">4</a></li>
    <li><a href="/posts?page=5">5</a></li>
    <li>
      <a href="/posts?page=4" rel="next" aria-label="下一页">→</a>
    </li>
  </ul>
</nav>
```

配合 `<head>` 中的 `<link>` 声明：

```html
<head>
  <link rel="prev" href="/posts?page=2">
  <link rel="next" href="/posts?page=4">
</head>
```

### 侧边导航（目录）

```html
<aside>
  <nav aria-label="页面目录">
    <h2>目录</h2>
    <ul>
      <li>
        <a href="#overview">概述</a>
      </li>
      <li>
        <a href="#installation">安装</a>
        <ul>
          <li><a href="#install-npm">npm 安装</a></li>
          <li><a href="#install-cdn">CDN 引入</a></li>
        </ul>
      </li>
      <li>
        <a href="#usage">使用指南</a>
      </li>
    </ul>
  </nav>
</aside>
```

### 跳过导航链接（Skip Link）

```html
<!-- 页面最前面的隐藏链接，键盘用户按 Tab 时出现 -->
<a href="#main-content" class="skip-link">跳到主要内容</a>

<header>
  <nav><!-- 长导航菜单 --></nav>
</header>

<main id="main-content">
  <!-- 主要内容 -->
</main>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 100;
  padding: 0.5rem 1rem;
  background: #1f2937;
  color: white;
}

.skip-link:focus {
  left: 0;  /* Tab 聚焦时显示 */
}
```

键盘用户每次 Tab 都要经过完整导航菜单才能到内容区，Skip Link 提供了快捷跳过方式。

## SPA 路由中的链接

### 问题

SPA（单页应用）的路由由 JavaScript 控制，页面不会真正刷新。但 HTML 中的 `<a>` 默认会触发浏览器导航（全页刷新）。

### 框架处理方式

```jsx
// React Router
import { Link } from 'react-router-dom';

<Link to="/about">关于</Link>
// 渲染为 <a href="/about">关于</a>
// 点击时拦截默认行为，使用 History API 导航
```

```html
<!-- Vue Router -->
<router-link to="/about">关于</router-link>
<!-- 渲染为 <a href="/about" class="router-link-active">关于</a> -->
```

### 原理

```javascript
// SPA 路由的核心拦截逻辑
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;

  // 判断是否应该拦截
  const href = link.getAttribute('href');
  if (
    link.target === '_blank' ||      // 新窗口
    link.hasAttribute('download') ||  // 下载链接
    e.metaKey || e.ctrlKey ||         // Cmd/Ctrl+Click（新标签打开）
    !href.startsWith('/')             // 外部链接
  ) {
    return;  // 不拦截，走浏览器默认行为
  }

  // 拦截导航
  e.preventDefault();
  history.pushState(null, '', href);
  // 触发框架的路由更新...
});
```

### 关键注意

```html
<!-- ✅ SPA 内部导航：用框架提供的 Link 组件 -->
<Link to="/about">关于</Link>

<!-- ✅ 外部链接：用原生 <a>，不拦截 -->
<a href="https://external.com" target="_blank" rel="noopener noreferrer">
  外部链接
</a>

<!-- ❌ 用 div/span + onClick 模拟链接 -->
<span onClick={() => navigate('/about')}>关于</span>
<!-- 问题：不可右键新标签打开、不可访问、无 SEO 价值 -->
```

**原则**：即使在 SPA 中，也应保持 `<a>` 标签的语义，让链接可被右键、可被搜索引擎爬取、可被屏幕阅读器识别。

## 常见误区

### 误区 1：用 div/span 做链接

```html
<!-- ❌ -->
<div class="link" onclick="location.href='/about'">关于我们</div>

<!-- ✅ -->
<a href="/about">关于我们</a>
```

`<a>` 的原生能力：可聚焦、可键盘操作（Enter）、可右键、有 visited 状态、可被爬虫识别。`<div>` 没有任何这些能力。

### 误区 2：链接和按钮混用

```html
<!-- ❌ 用链接做按钮 -->
<a href="#" onclick="submitForm()">提交</a>

<!-- ❌ 用按钮做导航 -->
<button onclick="location.href='/about'">关于我们</button>

<!-- ✅ 导航用链接 -->
<a href="/about">关于我们</a>

<!-- ✅ 操作用按钮 -->
<button type="button" onclick="submitForm()">提交</button>
```

### 误区 3：空 href

```html
<!-- ❌ 空 href 会刷新当前页面 -->
<a href="">点击</a>

<!-- ❌ # 会跳到页面顶部并改变 URL -->
<a href="#">点击</a>

<!-- ✅ 如果不是导航，用 button -->
<button type="button">点击</button>
```

### 误区 4：忘记标记当前页面

```html
<!-- ❌ 导航中不标记当前页 -->
<nav>
  <a href="/" class="active">首页</a>
</nav>

<!-- ✅ 使用 aria-current -->
<nav>
  <a href="/" aria-current="page">首页</a>
</nav>
```

`aria-current="page"` 同时服务于可访问性和 CSS 样式：

```css
a[aria-current="page"] {
  font-weight: bold;
  color: #3b82f6;
}
```

## 参考资源

- [HTML Living Standard - Links](https://html.spec.whatwg.org/multipage/links.html)
- [MDN - `<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a)
- [MDN - Link Types](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel)
- [Web.dev - Links and Buttons](https://web.dev/learn/html/links/)
- [W3C - ARIA `aria-current`](https://www.w3.org/TR/wai-aria-1.1/#aria-current)
