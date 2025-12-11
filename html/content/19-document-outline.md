# 第 19 章：文档大纲

## 概述

文档大纲（Document Outline）是页面的层级结构，合理的大纲有利于 SEO、可访问性和代码维护。

## 一、标题层级

### 1.1 标题的重要性

```html
<!-- ✅ 正确的层级 -->
<h1>网站标题</h1>
  <h2>第一部分</h2>
    <h3>1.1 小节</h3>
    <h3>1.2 小节</h3>
  <h2>第二部分</h2>
    <h3>2.1 小节</h3>
```

**层级原则：**
- 每页一个 `<h1>`
- 不要跳级（h1 → h3）
- 保持逻辑顺序
- 反映内容层级

### 1.2 错误示例

```html
<!-- ❌ 错误：多个 h1 -->
<h1>网站标题</h1>
<h1>页面标题</h1>

<!-- ❌ 错误：跳级 -->
<h1>标题</h1>
<h3>跳过了h2</h3>

<!-- ❌ 错误：用标题实现样式 -->
<h4>这里需要大字体</h4>

<!-- ✅ 正确：用CSS -->
<p class="large-text">这里需要大字体</p>
```

## 二、分区元素的大纲

### 2.1 分区根元素

以下元素创建独立的大纲上下文：
- `<article>`
- `<aside>`
- `<nav>`
- `<section>`

```html
<body>
  <h1>网站标题</h1>
  
  <!-- article 有独立的标题层级 -->
  <article>
    <h1>文章标题</h1>  <!-- 在article内部，这是最高级 -->
    <h2>章节1</h2>
    <h2>章节2</h2>
  </article>
  
  <aside>
    <h2>侧边栏</h2>  <!-- 基于body的h1 -->
  </aside>
</body>
```

### 2.2 理想的大纲

```html
<body>
  <header>
    <h1>博客名称</h1>
    <nav>
      <h2>主导航</h2>
      <ul>...</ul>
    </nav>
  </header>
  
  <main>
    <article>
      <h2>文章标题</h2>
      <section>
        <h3>第一部分</h3>
        <p>内容...</p>
      </section>
      <section>
        <h3>第二部分</h3>
        <p>内容...</p>
      </section>
    </article>
  </main>
  
  <aside>
    <h2>相关文章</h2>
    <ul>...</ul>
  </aside>
  
  <footer>
    <h2>页脚信息</h2>
    <p>...</p>
  </footer>
</body>
```

**生成的大纲：**
```
1. 博客名称
   1.1 主导航
   1.2 文章标题
       1.2.1 第一部分
       1.2.2 第二部分
   1.3 相关文章
   1.4 页脚信息
```

## 三、section 元素

### 3.1 何时使用 section

```html
<!-- ✅ 适合使用 section -->
<article>
  <h1>HTML教程</h1>
  
  <section>
    <h2>基础部分</h2>
    <p>...</p>
  </section>
  
  <section>
    <h2>进阶部分</h2>
    <p>...</p>
  </section>
</article>

<!-- ❌ 不适合：内容无明确主题 -->
<section>
  <p>随机内容1</p>
  <p>随机内容2</p>
</section>
```

**使用原则：**
- 有明确的标题
- 内容主题相关
- 可以独立成章节

### 3.2 section vs div

```html
<!-- ✅ 有语义：用 section -->
<section>
  <h2>产品特性</h2>
  <ul>
    <li>特性1</li>
    <li>特性2</li>
  </ul>
</section>

<!-- ✅ 无语义：用 div -->
<div class="flex-container">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
</div>
```

## 四、article 元素

### 4.1 独立完整的内容

```html
<!-- 博客文章 -->
<article>
  <h2>文章标题</h2>
  <p>这是一篇完整的文章...</p>
</article>

<!-- 评论 -->
<article>
  <h2>评论</h2>
  <article>
    <h3>用户A的评论</h3>
    <p>评论内容...</p>
  </article>
  <article>
    <h3>用户B的评论</h3>
    <p>评论内容...</p>
  </article>
</article>

<!-- 产品卡片 -->
<article>
  <h3>产品名称</h3>
  <p>产品描述...</p>
  <p>价格：¥99</p>
</article>
```

### 4.2 article 嵌套

```html
<article>
  <h1>博客文章</h1>
  <p>文章内容...</p>
  
  <section>
    <h2>评论区</h2>
    
    <article>
      <h3>评论1</h3>
      <p>评论内容...</p>
    </article>
    
    <article>
      <h3>评论2</h3>
      <p>评论内容...</p>
    </article>
  </section>
</article>
```

## 五、实战示例

### 5.1 博客首页

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <title>我的博客</title>
</head>
<body>
  <!-- 网站头部 -->
  <header>
    <h1>我的技术博客</h1>
    <p>分享前端开发经验</p>
    
    <nav aria-label="主导航">
      <h2 class="sr-only">主导航</h2>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/archive">归档</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>
  
  <!-- 主内容 -->
  <main>
    <h2>最新文章</h2>
    
    <!-- 文章列表 -->
    <article>
      <h3><a href="/post/1">深入理解JavaScript闭包</a></h3>
      <p>
        <time datetime="2024-01-15">2024年1月15日</time>
      </p>
      <p>闭包是JavaScript的核心概念...</p>
    </article>
    
    <article>
      <h3><a href="/post/2">CSS Grid 完全指南</a></h3>
      <p>
        <time datetime="2024-01-10">2024年1月10日</time>
      </p>
      <p>Grid布局是现代CSS的强大工具...</p>
    </article>
    
    <article>
      <h3><a href="/post/3">React Hooks 最佳实践</a></h3>
      <p>
        <time datetime="2024-01-05">2024年1月5日</time>
      </p>
      <p>Hooks改变了React组件的写法...</p>
    </article>
  </main>
  
  <!-- 侧边栏 -->
  <aside aria-label="侧边栏">
    <section>
      <h2>分类</h2>
      <nav aria-label="文章分类">
        <ul>
          <li><a href="/category/javascript">JavaScript (15)</a></li>
          <li><a href="/category/css">CSS (10)</a></li>
          <li><a href="/category/react">React (8)</a></li>
        </ul>
      </nav>
    </section>
    
    <section>
      <h2>标签云</h2>
      <ul>
        <li><a href="/tag/closure">闭包</a></li>
        <li><a href="/tag/grid">Grid</a></li>
        <li><a href="/tag/hooks">Hooks</a></li>
      </ul>
    </section>
  </aside>
  
  <!-- 页脚 -->
  <footer>
    <h2 class="sr-only">页脚信息</h2>
    
    <nav aria-label="页脚导航">
      <a href="/privacy">隐私政策</a> |
      <a href="/terms">服务条款</a>
    </nav>
    
    <p>&copy; 2024 博客名称. 保留所有权利。</p>
  </footer>
</body>
</html>
```

**大纲结构：**
```
1. 我的技术博客
   1.1 主导航
   1.2 最新文章
       1.2.1 深入理解JavaScript闭包
       1.2.2 CSS Grid 完全指南
       1.2.3 React Hooks 最佳实践
   1.3 分类
   1.4 标签云
   1.5 页脚信息
```

### 5.2 文章详情页

```html
<body>
  <header>
    <h1>博客名称</h1>
    <nav>...</nav>
  </header>
  
  <main>
    <article>
      <header>
        <h2>深入理解JavaScript闭包</h2>
        <p>
          作者：张三 |
          <time datetime="2024-01-15">2024年1月15日</time> |
          阅读时间：10分钟
        </p>
      </header>
      
      <section>
        <h3>什么是闭包</h3>
        <p>闭包是指...</p>
      </section>
      
      <section>
        <h3>闭包的原理</h3>
        <p>从作用域链的角度...</p>
        
        <section>
          <h4>词法作用域</h4>
          <p>JavaScript采用词法作用域...</p>
        </section>
        
        <section>
          <h4>执行上下文</h4>
          <p>理解执行上下文...</p>
        </section>
      </section>
      
      <section>
        <h3>闭包的应用</h3>
        <p>闭包有很多实际应用...</p>
      </section>
      
      <section>
        <h3>常见陷阱</h3>
        <p>使用闭包要注意...</p>
      </section>
      
      <footer>
        <p>
          标签：
          <a href="/tag/javascript">JavaScript</a>,
          <a href="/tag/closure">闭包</a>
        </p>
      </footer>
    </article>
    
    <!-- 评论区 -->
    <section>
      <h2>评论</h2>
      
      <article>
        <h3>用户A</h3>
        <time datetime="2024-01-16T10:30:00">2024年1月16日 10:30</time>
        <p>写得很好，学习了！</p>
      </article>
      
      <article>
        <h3>用户B</h3>
        <time datetime="2024-01-16T14:20:00">2024年1月16日 14:20</time>
        <p>例子很清晰，感谢分享！</p>
      </article>
    </section>
  </main>
  
  <aside>
    <h2>相关文章</h2>
    <ul>
      <li><a href="#">理解作用域链</a></li>
      <li><a href="#">JavaScript执行上下文</a></li>
    </ul>
  </aside>
  
  <footer>
    <p>&copy; 2024 博客名称</p>
  </footer>
</body>
```

## 六、可访问性

### 6.1 屏幕阅读器

```html
<!-- ✅ 为屏幕阅读器隐藏的标题 -->
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

<nav>
  <h2 class="sr-only">主导航</h2>
  <ul>...</ul>
</nav>
```

### 6.2 跳转链接

```html
<a href="#main-content" class="skip-link">跳转到主内容</a>

<header>...</header>

<main id="main-content">
  <h1>页面标题</h1>
  ...
</main>
```

## 七、检查工具

### 7.1 浏览器开发工具

```javascript
// 生成文档大纲
function generateOutline() {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const outline = [];
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    const text = heading.textContent;
    const indent = '  '.repeat(level - 1);
    outline.push(`${indent}${text}`);
  });
  
  console.log(outline.join('\n'));
}

generateOutline();
```

### 7.2 在线工具

- [HTML5 Outliner](https://gsnedders.html5.org/outliner/)
- [HeadingsMap 浏览器扩展](https://chrome.google.com/webstore/detail/headingsmap/)

## 八、最佳实践

> **📌 大纲原则**
> 
> 1. **每页一个 h1**：表示页面主题
> 2. **不要跳级**：保持层级连续
> 3. **标题要有内容**：不要空标题
> 4. **section 要有标题**：明确主题
> 5. **合理使用 article**：独立完整的内容
> 6. **考虑可访问性**：屏幕阅读器友好

```html
<!-- ✅ 良好的大纲 -->
<body>
  <h1>网站名称</h1>
  
  <nav>
    <h2>导航</h2>
  </nav>
  
  <main>
    <article>
      <h2>文章标题</h2>
      <section>
        <h3>第一部分</h3>
      </section>
    </article>
  </main>
  
  <aside>
    <h2>侧边栏</h2>
  </aside>
  
  <footer>
    <h2>页脚</h2>
  </footer>
</body>
```

## 参考资料

- [MDN - 使用 HTML 区段和大纲](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Heading_Elements)
- [W3C - Document Outline](https://www.w3.org/TR/html5/sections.html)

---

**上一章** ← [第 18 章：语义化标签](./18-semantic-tags.md)  
**下一章** → [第 20 章：WAI-ARIA 基础](./20-aria-basics.md)
