# 第 18 章：语义化标签

## 概述

语义化标签让 HTML 更具表达力，不仅提升代码可读性，还有利于 SEO 和可访问性。

## 一、什么是语义化

### 1.1 语义化的定义

```html
<!-- ❌ 无语义 -->
<div class="header">
  <div class="nav">
    <div class="link">首页</div>
  </div>
</div>

<!-- ✅ 语义化 -->
<header>
  <nav>
    <a href="/">首页</a>
  </nav>
</header>
```

**语义化的好处：**
- 🤖 **SEO 优化**：搜索引擎更好理解页面结构
- ♿ **可访问性**：屏幕阅读器更准确地传达内容
- 👨‍💻 **代码可读性**：团队协作更高效
- 🔧 **维护性**：结构清晰，易于维护

## 二、文档结构标签

### 2.1 `<header>` 头部

```html
<!-- 页面头部 -->
<header>
  <h1>网站名称</h1>
  <nav>
    <ul>
      <li><a href="/">首页</a></li>
      <li><a href="/about">关于</a></li>
    </ul>
  </nav>
</header>

<!-- 文章头部 -->
<article>
  <header>
    <h2>文章标题</h2>
    <p>作者：张三 | 发布时间：2024-01-01</p>
  </header>
  <p>文章内容...</p>
</article>
```

### 2.2 `<nav>` 导航

```html
<!-- 主导航 -->
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>

<!-- 面包屑导航 -->
<nav aria-label="breadcrumb">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li aria-current="page">当前页</li>
  </ol>
</nav>

<!-- 目录导航 -->
<nav aria-label="目录">
  <h2>本文目录</h2>
  <ul>
    <li><a href="#section1">第一节</a></li>
    <li><a href="#section2">第二节</a></li>
  </ul>
</nav>
```

### 2.3 `<main>` 主内容

```html
<!DOCTYPE html>
<html>
<body>
  <header>头部</header>
  <nav>导航</nav>
  
  <!-- 页面主要内容 -->
  <main>
    <h1>页面标题</h1>
    <p>这是页面的主要内容区域</p>
  </main>
  
  <aside>侧边栏</aside>
  <footer>底部</footer>
</body>
</html>
```

> **⚠️ 注意**  
> 每个页面只能有一个 `<main>` 元素，且不能是 `<article>`, `<aside>`, `<footer>`, `<header>`, `<nav>` 的后代。

### 2.4 `<aside>` 侧边栏

```html
<!-- 页面侧边栏 -->
<main>
  <article>文章内容</article>
</main>
<aside>
  <h2>相关文章</h2>
  <ul>
    <li><a href="#">文章1</a></li>
    <li><a href="#">文章2</a></li>
  </ul>
</aside>

<!-- 文章内的侧边内容 -->
<article>
  <h1>主要内容</h1>
  <p>正文...</p>
  
  <aside>
    <h3>提示</h3>
    <p>这是补充说明</p>
  </aside>
</article>
```

### 2.5 `<footer>` 底部

```html
<!-- 页面底部 -->
<footer>
  <p>&copy; 2024 公司名称</p>
  <nav>
    <a href="/privacy">隐私政策</a>
    <a href="/terms">服务条款</a>
  </nav>
</footer>

<!-- 文章底部 -->
<article>
  <h2>文章标题</h2>
  <p>文章内容...</p>
  
  <footer>
    <p>作者：张三</p>
    <p>发布于：2024-01-01</p>
  </footer>
</article>
```

## 三、内容分区标签

### 3.1 `<section>` 章节

```html
<article>
  <h1>HTML 教程</h1>
  
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

**使用原则：**
- 有明确的标题
- 内容主题相关
- 独立的内容区块

### 3.2 `<article>` 文章

```html
<!-- 博客文章 -->
<article>
  <header>
    <h2>文章标题</h2>
    <time datetime="2024-01-01">2024年1月1日</time>
  </header>
  
  <p>文章内容...</p>
  
  <footer>
    <p>标签：<a href="#">HTML</a>, <a href="#">CSS</a></p>
  </footer>
</article>

<!-- 新闻列表 -->
<main>
  <article>
    <h2>新闻1</h2>
    <p>内容...</p>
  </article>
  
  <article>
    <h2>新闻2</h2>
    <p>内容...</p>
  </article>
</main>
```

**特点：**
- 独立完整的内容
- 可以单独发布或重用
- 通常有标题

### 3.3 `<section>` vs `<article>` vs `<div>`

| 标签 | 用途 | 示例 |
|-----|------|-----|
| `<article>` | 独立完整的内容 | 博客文章、新闻、评论 |
| `<section>` | 相关内容的分组 | 章节、选项卡内容 |
| `<div>` | 无语义的容器 | 纯布局、样式包装 |

```html
<!-- ✅ 正确使用 -->
<article>
  <h1>旅游攻略</h1>
  
  <section>
    <h2>准备工作</h2>
    <p>...</p>
  </section>
  
  <section>
    <h2>行程安排</h2>
    <div class="flex-container">
      <!-- 纯布局用 div -->
      <div class="day">第1天</div>
      <div class="day">第2天</div>
    </div>
  </section>
</article>
```

## 四、文本语义标签

### 4.1 `<mark>` 标记

```html
<p>搜索结果中的<mark>关键词</mark>会被高亮显示</p>
```

### 4.2 `<time>` 时间

```html
<!-- 日期 -->
<time datetime="2024-01-01">2024年1月1日</time>

<!-- 日期时间 -->
<time datetime="2024-01-01T14:30:00">2024年1月1日 14:30</time>

<!-- 文章发布时间 -->
<article>
  <h2>文章标题</h2>
  <p>发布于 <time datetime="2024-01-01" pubdate>2024年1月1日</time></p>
</article>
```

### 4.3 `<address>` 联系信息

```html
<address>
  <p>联系我们：</p>
  <p>邮箱：<a href="mailto:contact@example.com">contact@example.com</a></p>
  <p>地址：北京市朝阳区xxx路xxx号</p>
  <p>电话：<a href="tel:+8613800138000">138-0013-8000</a></p>
</address>
```

### 4.4 `<figure>` 和 `<figcaption>`

```html
<!-- 图片说明 -->
<figure>
  <img src="chart.jpg" alt="销售数据图表">
  <figcaption>图1：2024年销售数据统计</figcaption>
</figure>

<!-- 代码示例 -->
<figure>
  <pre><code>
function hello() {
  console.log('Hello');
}
  </code></pre>
  <figcaption>示例1：Hello函数</figcaption>
</figure>

<!-- 引用 -->
<figure>
  <blockquote>
    <p>路漫漫其修远兮，吾将上下而求索。</p>
  </blockquote>
  <figcaption>——屈原《离骚》</figcaption>
</figure>
```

### 4.5 `<details>` 和 `<summary>`

```html
<details>
  <summary>点击查看详情</summary>
  <p>这里是详细内容，默认是隐藏的。</p>
</details>

<!-- 默认展开 -->
<details open>
  <summary>FAQ：什么是HTML？</summary>
  <p>HTML 是超文本标记语言...</p>
</details>

<!-- 复杂示例 -->
<details>
  <summary>系统要求</summary>
  <ul>
    <li>Windows 10 或更高版本</li>
    <li>4GB RAM 最低</li>
    <li>10GB 可用空间</li>
  </ul>
</details>
```

## 五、完整页面结构

### 5.1 标准布局

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>语义化HTML示例</title>
</head>
<body>
  <!-- 页面头部 -->
  <header>
    <h1>网站名称</h1>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/blog">博客</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>
  
  <!-- 主要内容 -->
  <main>
    <!-- 文章 -->
    <article>
      <header>
        <h2>文章标题</h2>
        <p>
          作者：张三 | 
          发布时间：<time datetime="2024-01-01">2024年1月1日</time>
        </p>
      </header>
      
      <section>
        <h3>第一部分</h3>
        <p>内容...</p>
      </section>
      
      <section>
        <h3>第二部分</h3>
        <p>内容...</p>
        
        <figure>
          <img src="image.jpg" alt="示例图">
          <figcaption>图1：示例图片</figcaption>
        </figure>
      </section>
      
      <footer>
        <p>标签：
          <a href="#">HTML</a>, 
          <a href="#">语义化</a>
        </p>
      </footer>
    </article>
  </main>
  
  <!-- 侧边栏 -->
  <aside>
    <section>
      <h3>热门文章</h3>
      <ul>
        <li><a href="#">文章1</a></li>
        <li><a href="#">文章2</a></li>
      </ul>
    </section>
    
    <section>
      <h3>分类</h3>
      <ul>
        <li><a href="#">前端</a></li>
        <li><a href="#">后端</a></li>
      </ul>
    </section>
  </aside>
  
  <!-- 页面底部 -->
  <footer>
    <nav>
      <a href="/privacy">隐私政策</a> | 
      <a href="/terms">服务条款</a>
    </nav>
    
    <address>
      联系邮箱：<a href="mailto:contact@example.com">contact@example.com</a>
    </address>
    
    <p>&copy; 2024 网站名称. 保留所有权利。</p>
  </footer>
</body>
</html>
```

### 5.2 博客页面

```html
<body>
  <header>
    <h1>我的博客</h1>
    <nav>
      <a href="/">首页</a>
      <a href="/archive">归档</a>
      <a href="/about">关于我</a>
    </nav>
  </header>
  
  <main>
    <article>
      <header>
        <h2>深入理解 JavaScript 闭包</h2>
        <p>
          <time datetime="2024-01-15">2024年1月15日</time>
          <span>阅读时间：5分钟</span>
        </p>
      </header>
      
      <p>闭包是 JavaScript 的核心概念...</p>
      
      <section>
        <h3>什么是闭包</h3>
        <p>闭包是指...</p>
      </section>
      
      <section>
        <h3>闭包的应用</h3>
        <p>闭包常用于...</p>
        
        <figure>
          <pre><code>
function outer() {
  let count = 0;
  return function inner() {
    count++;
    console.log(count);
  }
}
          </code></pre>
          <figcaption>示例：闭包计数器</figcaption>
        </figure>
      </section>
      
      <footer>
        <p>
          标签：
          <a href="/tag/javascript">JavaScript</a>, 
          <a href="/tag/closure">闭包</a>
        </p>
        
        <details>
          <summary>参考资料</summary>
          <ul>
            <li><a href="#">MDN - Closures</a></li>
            <li><a href="#">You Don't Know JS</a></li>
          </ul>
        </details>
      </footer>
    </article>
    
    <section>
      <h3>相关文章</h3>
      <article>
        <h4><a href="#">理解 JavaScript 作用域</a></h4>
        <p>作用域是理解闭包的基础...</p>
      </article>
    </section>
  </main>
  
  <aside>
    <section>
      <h3>关于作者</h3>
      <p>前端开发工程师，专注于 JavaScript...</p>
    </section>
  </aside>
  
  <footer>
    <p>&copy; 2024 博客名称</p>
  </footer>
</body>
```

## 六、语义化最佳实践

> **📌 语义化原则**
> 
> 1. **选择合适的标签**：根据内容含义选择
> 2. **保持层级清晰**：合理使用标题层级
> 3. **避免过度使用 div**：能用语义标签就不用 div
> 4. **结合 ARIA**：增强可访问性
> 5. **保持一致性**：团队统一规范

```html
<!-- ❌ 不好 -->
<div class="article">
  <div class="title">标题</div>
  <div class="content">内容</div>
</div>

<!-- ✅ 好 -->
<article>
  <h2>标题</h2>
  <p>内容</p>
</article>

<!-- ❌ 不好：过度语义化 -->
<article>
  <section>
    <section>
      <section>内容</section>
    </section>
  </section>
</article>

<!-- ✅ 好：适度语义化 -->
<article>
  <p>内容</p>
</article>
```

## 七、语义化与SEO

### 7.1 搜索引擎优化

```html
<!-- ✅ SEO 友好 -->
<article>
  <header>
    <h1>完整的HTML教程</h1>
    <p>
      <time datetime="2024-01-01" pubdate>2024年1月1日</time>
    </p>
  </header>
  
  <section>
    <h2>什么是HTML</h2>
    <p>HTML 是超文本标记语言...</p>
  </section>
  
  <footer>
    <address>
      作者：<a href="/author/zhangsan">张三</a>
    </address>
  </footer>
</article>
```

### 7.2 结构化数据

```html
<article itemscope itemtype="http://schema.org/Article">
  <h1 itemprop="headline">文章标题</h1>
  
  <div itemprop="author" itemscope itemtype="http://schema.org/Person">
    <span itemprop="name">张三</span>
  </div>
  
  <time itemprop="datePublished" datetime="2024-01-01">2024年1月1日</time>
  
  <div itemprop="articleBody">
    <p>文章内容...</p>
  </div>
</article>
```

## 参考资料

- [MDN - HTML 元素参考](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element)
- [HTML5 Doctor](http://html5doctor.com/)
- [Schema.org](https://schema.org/)

---

**上一章** ← [第 17 章：表单提交与处理](./17-form-submission.md)  
**下一章** → [第 19 章：文档大纲](./19-document-outline.md)
