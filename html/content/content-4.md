# 语义化标签体系

## 核心概念

**语义化**（Semantic）是 HTML5 的核心设计理念，指使用**具有明确含义的标签**来描述内容，而非仅关注视觉呈现。

```html
<!-- 非语义化（只关注样式） -->
<div class="header">
  <div class="nav">
    <div class="nav-item">首页</div>
  </div>
</div>

<!-- 语义化（明确表达结构） -->
<header>
  <nav>
    <a href="/">首页</a>
  </nav>
</header>
```

**后端类比**：
- 非语义化 ≈ 所有字段都用 `VARCHAR` 存储
- 语义化 ≈ 使用正确的数据类型（INT、DATETIME、BOOLEAN）

## 语义化的真实价值

### 1. 可访问性（Accessibility）

**辅助技术依赖语义**：

```html
<!-- 屏幕阅读器能理解这是导航 -->
<nav>
  <a href="/about">关于我们</a>
</nav>
<!-- 读出："导航区域，链接：关于我们" -->

<!-- 屏幕阅读器只能读出文本 -->
<div class="nav">
  <div onclick="goTo('/about')">关于我们</div>
</div>
<!-- 读出："关于我们"（不知道这是导航，也不知道可点击） -->
```

**后端类比**：类似于 API 的 Schema 定义，让客户端理解数据含义。

### 2. SEO（搜索引擎优化）

**搜索引擎根据语义判断内容重要性**：

```html
<!-- 搜索引擎知道这是主要内容 -->
<article>
  <h1>文章标题</h1>
  <p>文章内容...</p>
</article>

<!-- 搜索引擎不确定这是什么 -->
<div class="article">
  <div class="title">文章标题</div>
  <div class="content">文章内容...</div>
</div>
```

**权重差异**：
- `<h1>` > `<h2>` > `<div class="title">`
- `<article>` > `<div class="article">`
- `<nav>` 中的链接被识别为导航，权重降低

**后端类比**：类似于数据库索引，帮助查询优化器选择执行计划。

### 3. 维护性

**自文档化代码**：

```html
<!-- 一眼看出文档结构 -->
<header>页头</header>
<nav>导航</nav>
<main>
  <article>文章</article>
  <aside>侧边栏</aside>
</main>
<footer>页脚</footer>

<!-- 需要读 CSS 才能理解结构 -->
<div class="top">页头</div>
<div class="menu">导航</div>
<div class="container">
  <div class="content">文章</div>
  <div class="sidebar">侧边栏</div>
</div>
<div class="bottom">页脚</div>
```

**后端类比**：类似于使用有意义的变量名 vs 使用 `a`, `b`, `c`。

## 内容分区标签详解

### header：页头/章节头

**语义**：表示页面或章节的**引导内容**，通常包含标题、Logo、导航。

```html
<!-- 页面级 header -->
<body>
  <header>
    <h1>网站名称</h1>
    <nav>
      <a href="/">首页</a>
      <a href="/about">关于</a>
    </nav>
  </header>
</body>

<!-- 章节级 header -->
<article>
  <header>
    <h2>文章标题</h2>
    <p>发布时间：2024-01-01</p>
  </header>
  <p>文章内容...</p>
</article>
```

**嵌套规则**：
- ✅ 可以包含标题、导航、搜索框
- ❌ 不能包含另一个 `<header>` 或 `<footer>`

**后端类比**：类似于请求的 Headers 部分。

### nav：导航

**语义**：表示**主要导航链接**的集合。

```html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

**使用场景**：
- ✅ 主导航菜单
- ✅ 目录（Table of Contents）
- ✅ 面包屑导航
- ❌ 页脚的友情链接（不是主要导航）
- ❌ 社交媒体链接（不是站内导航）

**常见误区**：

```html
<!-- 错误：不是所有链接都需要 nav -->
<footer>
  <nav>  ← 过度使用
    <a href="https://twitter.com">Twitter</a>
    <a href="https://facebook.com">Facebook</a>
  </nav>
</footer>

<!-- 正确：普通链接集合 -->
<footer>
  <p>关注我们：</p>
  <a href="https://twitter.com">Twitter</a>
  <a href="https://facebook.com">Facebook</a>
</footer>
```

### main：主要内容

**语义**：表示文档的**主体内容**，每个页面只能有一个。

```html
<body>
  <header>页头</header>
  <nav>导航</nav>
  
  <main>
    <!-- 页面的核心内容 -->
    <h1>页面标题</h1>
    <p>主要内容...</p>
  </main>
  
  <footer>页脚</footer>
</body>
```

**唯一性约束**：
- ✅ 每个文档只能有一个 `<main>`
- ❌ 不能是 `<article>`、`<aside>`、`<header>`、`<footer>`、`<nav>` 的后代

**后端类比**：类似于 HTTP 响应的 Body（核心数据）。

### article：独立文章

**语义**：表示**独立完整**的内容单元，可以单独分发或复用。

```html
<!-- 博客文章 -->
<article>
  <header>
    <h2>文章标题</h2>
    <p>作者：张三 | 时间：2024-01-01</p>
  </header>
  <p>文章内容...</p>
  <footer>
    <p>标签：HTML, 前端</p>
  </footer>
</article>

<!-- 用户评论 -->
<article class="comment">
  <header>
    <h3>用户 A</h3>
    <time datetime="2024-01-01">2024-01-01</time>
  </header>
  <p>评论内容...</p>
</article>
```

**判断标准**：
- ✅ 可以单独分发（RSS feed、推荐算法）
- ✅ 具有完整的上下文
- ✅ 可以被聚合到其他页面

**后端类比**：类似于数据库的**实体**（Entity），有完整的属性和关系。

### section：章节/区块

**语义**：表示文档中的**主题性分组**，通常有标题。

```html
<article>
  <h1>完整指南</h1>
  
  <section>
    <h2>第一章：基础</h2>
    <p>基础内容...</p>
  </section>
  
  <section>
    <h2>第二章：进阶</h2>
    <p>进阶内容...</p>
  </section>
</article>
```

**与 div 的区别**：

```html
<!-- section：有明确主题 -->
<section>
  <h2>产品特性</h2>
  <p>特性描述...</p>
</section>

<!-- div：仅为样式分组 -->
<div class="product-features">
  <h2>产品特性</h2>
  <p>特性描述...</p>
</div>
```

**后端类比**：
- `<section>` ≈ 业务模块
- `<div>` ≈ 工具类/辅助函数

### aside：附属内容

**语义**：表示与主内容**相关但独立**的内容。

```html
<main>
  <article>
    <h1>文章标题</h1>
    <p>文章内容...</p>
  </article>
  
  <aside>
    <h3>相关文章</h3>
    <ul>
      <li><a href="/related1">相关文章 1</a></li>
      <li><a href="/related2">相关文章 2</a></li>
    </ul>
  </aside>
</main>
```

**使用场景**：
- ✅ 侧边栏（广告、推荐、热门文章）
- ✅ 引用说明
- ✅ 术语表
- ❌ 页脚（使用 `<footer>`）

### footer：页脚/章节脚

**语义**：表示页面或章节的**补充信息**。

```html
<!-- 页面级 footer -->
<body>
  <main>...</main>
  
  <footer>
    <p>&copy; 2024 公司名称</p>
    <nav>
      <a href="/privacy">隐私政策</a>
      <a href="/terms">服务条款</a>
    </nav>
  </footer>
</body>

<!-- 文章级 footer -->
<article>
  <h2>文章标题</h2>
  <p>文章内容...</p>
  <footer>
    <p>作者：张三</p>
    <p>许可：CC BY 4.0</p>
  </footer>
</article>
```

## 后端类比：领域模型的边界与职责

### HTML 语义结构 ≈ DDD 领域模型

```
后端领域模型（DDD）：
OrderAggregate（订单聚合根）
├── OrderHeader（订单头）
├── OrderItems（订单项）
└── OrderFooter（订单汇总）

HTML 文档结构：
<article>（文章聚合）
├── <header>（文章头）
├── <section>（文章章节）
└── <footer>（文章脚注）
```

### 职责边界清晰

```html
<!-- 职责分离 -->
<body>
  <header>
    <!-- 职责：展示网站标识和主导航 -->
    <h1>网站名称</h1>
    <nav>主导航</nav>
  </header>
  
  <main>
    <!-- 职责：展示页面核心内容 -->
    <article>文章内容</article>
  </main>
  
  <aside>
    <!-- 职责：展示相关但非核心内容 -->
    <p>广告</p>
  </aside>
  
  <footer>
    <!-- 职责：展示版权和次要链接 -->
    <p>版权信息</p>
  </footer>
</body>
```

**后端类比**：类似于分层架构（Controller、Service、Repository）。

## 常见误区

### 误区 1：所有容器都用 div

**错误理解**：div 是万能容器，可以替代所有标签。

```html
<!-- 错误：div 泛滥 -->
<div class="page">
  <div class="header">
    <div class="title">网站名称</div>
    <div class="nav">
      <div class="nav-item">首页</div>
    </div>
  </div>
  <div class="main">
    <div class="article">
      <div class="article-title">标题</div>
      <div class="article-content">内容</div>
    </div>
  </div>
</div>

<!-- 正确：使用语义化标签 -->
<body>
  <header>
    <h1>网站名称</h1>
    <nav>
      <a href="/">首页</a>
    </nav>
  </header>
  <main>
    <article>
      <h2>标题</h2>
      <p>内容</p>
    </article>
  </main>
</body>
```

### 误区 2：过度使用语义标签

**错误理解**：必须使用所有语义标签。

```html
<!-- 错误：强行使用 section -->
<article>
  <section>  ← 不需要
    <h2>标题</h2>
    <p>内容</p>
  </section>
</article>

<!-- 正确：直接使用 -->
<article>
  <h2>标题</h2>
  <p>内容</p>
</article>
```

**原则**：有明确语义时才使用，否则用 `<div>`。

### 误区 3：header 只能在顶部

**错误理解**：header 必须是页面最顶部的元素。

**正确认知**：header 可以用于任何需要**引导内容**的地方。

```html
<!-- 页面 header -->
<body>
  <header>页面头部</header>
</body>

<!-- 文章 header -->
<article>
  <header>
    <h2>文章标题</h2>
    <p>元信息</p>
  </header>
  <p>正文...</p>
</article>

<!-- 章节 header -->
<section>
  <header>
    <h3>章节标题</h3>
  </header>
  <p>章节内容...</p>
</section>
```

## 工程实践示例

### 场景 1：博客文章页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>文章标题 - 我的博客</title>
</head>
<body>
  <!-- 网站头部 -->
  <header>
    <h1>我的博客</h1>
    <nav>
      <a href="/">首页</a>
      <a href="/about">关于</a>
    </nav>
  </header>
  
  <!-- 主要内容 -->
  <main>
    <!-- 文章 -->
    <article>
      <header>
        <h2>如何学习 HTML</h2>
        <p>
          <time datetime="2024-01-01">2024年1月1日</time>
          | 作者：<span>张三</span>
        </p>
      </header>
      
      <section>
        <h3>第一章：基础</h3>
        <p>基础内容...</p>
      </section>
      
      <section>
        <h3>第二章：进阶</h3>
        <p>进阶内容...</p>
      </section>
      
      <footer>
        <p>标签：<a href="/tag/html">HTML</a></p>
      </footer>
    </article>
    
    <!-- 评论区 -->
    <section>
      <h3>评论</h3>
      <article class="comment">
        <header>
          <h4>用户 A</h4>
          <time datetime="2024-01-02">2024-01-02</time>
        </header>
        <p>很好的文章！</p>
      </article>
    </section>
  </main>
  
  <!-- 侧边栏 -->
  <aside>
    <section>
      <h3>热门文章</h3>
      <ul>
        <li><a href="/popular1">文章 1</a></li>
        <li><a href="/popular2">文章 2</a></li>
      </ul>
    </section>
  </aside>
  
  <!-- 页脚 -->
  <footer>
    <p>&copy; 2024 我的博客</p>
    <nav>
      <a href="/privacy">隐私政策</a>
      <a href="/terms">服务条款</a>
    </nav>
  </footer>
</body>
</html>
```

### 场景 2：电商产品页

```html
<main>
  <article itemscope itemtype="https://schema.org/Product">
    <header>
      <h1 itemprop="name">产品名称</h1>
      <p itemprop="price">¥999</p>
    </header>
    
    <section>
      <h2>产品详情</h2>
      <p itemprop="description">产品描述...</p>
    </section>
    
    <section>
      <h2>规格参数</h2>
      <table>
        <tr>
          <th>尺寸</th>
          <td>10cm × 20cm</td>
        </tr>
      </table>
    </section>
    
    <footer>
      <p>品牌：<span itemprop="brand">品牌名</span></p>
    </footer>
  </article>
  
  <aside>
    <section>
      <h3>相关产品</h3>
      <ul>
        <li><a href="/product/1">产品 1</a></li>
        <li><a href="/product/2">产品 2</a></li>
      </ul>
    </section>
  </aside>
</main>
```

### 场景 3：后端生成语义化 HTML

```javascript
// Node.js SSR
function renderArticlePage(article) {
  return `
    <main>
      <article>
        <header>
          <h1>${escapeHtml(article.title)}</h1>
          <p>
            <time datetime="${article.publishDate}">
              ${formatDate(article.publishDate)}
            </time>
            | 作者：${escapeHtml(article.author)}
          </p>
        </header>
        
        ${article.sections.map(section => `
          <section>
            <h2>${escapeHtml(section.title)}</h2>
            <p>${escapeHtml(section.content)}</p>
          </section>
        `).join('')}
        
        <footer>
          <p>标签：${article.tags.map(tag => 
            `<a href="/tag/${tag}">${tag}</a>`
          ).join(', ')}</p>
        </footer>
      </article>
    </main>
  `;
}
```

**后端视角**：
- 数据模型（Article）→ HTML 语义结构
- 关系映射（sections、tags）→ 嵌套标签

## 深入一点：语义化与 ARIA

### ARIA（Accessible Rich Internet Applications）

当 HTML 语义不足时，使用 **ARIA 属性**增强可访问性：

```html
<!-- HTML 原生语义 -->
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>

<!-- ARIA 增强（当无法使用 nav 时） -->
<div role="navigation">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</div>
```

### ARIA 属性类型

```html
<!-- role：定义元素角色 -->
<div role="button" tabindex="0">点击</div>

<!-- aria-label：提供标签 -->
<button aria-label="关闭对话框">×</button>

<!-- aria-describedby：关联描述 -->
<input id="email" aria-describedby="email-help">
<p id="email-help">请输入有效的邮箱地址</p>

<!-- aria-expanded：展开/收起状态 -->
<button aria-expanded="false" aria-controls="menu">
  菜单
</button>
<ul id="menu" hidden>
  <li>选项 1</li>
</ul>
```

### 黄金法则：优先使用 HTML 语义

```html
<!-- ❌ 不推荐：用 div + ARIA -->
<div role="button" tabindex="0" onclick="submit()">
  提交
</div>

<!-- ✅ 推荐：用原生 button -->
<button type="submit">提交</button>
```

**原因**：
- 原生标签有默认行为（键盘、焦点、事件）
- ARIA 只提供语义，不提供行为

**后端类比**：类似于使用数据库原生功能 vs 手写 SQL 模拟。

## 参考资源

- [HTML Living Standard - Sections](https://html.spec.whatwg.org/multipage/sections.html)
- [MDN - HTML5 Semantic Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element#content_sectioning)
- [W3C - ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Google - Semantic HTML](https://web.dev/learn/html/semantic-html/)
