# 第 6 章：链接与导航

## 概述

链接是 Web 的基础，让不同页面和资源相互连接。`<a>` 标签是创建超链接的核心元素，掌握其用法对构建良好的用户体验至关重要。

## 一、基本链接

### 1.1 `<a>` 标签

```html
<a href="https://example.com">访问网站</a>
```

### 1.2 必需属性：href

```html
<!-- 外部链接 -->
<a href="https://www.google.com">Google</a>

<!-- 相对路径 -->
<a href="about.html">关于我们</a>
<a href="./contact.html">联系我们</a>
<a href="../index.html">返回首页</a>

<!-- 绝对路径 -->
<a href="/products/list.html">产品列表</a>
```

### 1.3 链接文本

```html
<!-- ✅ 好的链接文本：描述性强 -->
<a href="report.pdf">下载2024年度报告（PDF，2MB）</a>

<!-- ❌ 差的链接文本：语义不明 -->
<a href="report.pdf">点击这里</a>
<a href="page.html">更多</a>
```

> **💡 可访问性提示**  
> 链接文本应该描述清楚，屏幕阅读器用户可能会单独浏览所有链接。

## 二、链接目标

### 2.1 target 属性

```html
<!-- _self：当前窗口打开（默认） -->
<a href="page.html" target="_self">当前窗口</a>

<!-- _blank：新窗口打开 -->
<a href="https://example.com" target="_blank">新窗口</a>

<!-- _parent：父框架 -->
<a href="page.html" target="_parent">父框架</a>

<!-- _top：顶层框架 -->
<a href="page.html" target="_top">顶层框架</a>
```

### 2.2 新窗口的安全性

```html
<!-- ❌ 不安全：可能被劫持 -->
<a href="https://external-site.com" target="_blank">外部链接</a>

<!-- ✅ 安全：添加 rel 属性 -->
<a href="https://external-site.com" 
   target="_blank" 
   rel="noopener noreferrer">
  外部链接
</a>
```

**rel 属性值：**

| 值 | 说明 |
|---|---|
| `noopener` | 防止新页面访问 `window.opener` |
| `noreferrer` | 不发送 Referer 头 |
| `nofollow` | 告诉搜索引擎不要跟踪此链接 |

## 三、锚点链接

### 3.1 页面内跳转

```html
<!-- 目标元素 -->
<h2 id="section1">第一节</h2>
<p>内容...</p>

<h2 id="section2">第二节</h2>
<p>内容...</p>

<!-- 锚点链接 -->
<nav>
  <a href="#section1">跳转到第一节</a>
  <a href="#section2">跳转到第二节</a>
</nav>
```

### 3.2 返回顶部

```html
<a href="#top">返回顶部</a>

<!-- 或者链接到 body 或 html -->
<a href="#" onclick="window.scrollTo(0,0); return false;">返回顶部</a>
```

### 3.3 跨页面锚点

```html
<a href="about.html#team">关于我们 - 团队介绍</a>
```

## 四、特殊链接

### 4.1 邮件链接

```html
<!-- 基本邮件链接 -->
<a href="mailto:contact@example.com">发送邮件</a>

<!-- 带主题和内容 -->
<a href="mailto:contact@example.com?subject=咨询&body=您好">发送邮件</a>

<!-- 多个收件人 -->
<a href="mailto:user1@example.com,user2@example.com">发送给多人</a>

<!-- 抄送和密送 -->
<a href="mailto:to@example.com?cc=cc@example.com&bcc=bcc@example.com">发送邮件</a>
```

### 4.2 电话链接

```html
<!-- 移动端点击拨号 -->
<a href="tel:+86-123-4567-8900">拨打电话：123-4567-8900</a>

<!-- 短信链接 -->
<a href="sms:+8613800138000">发送短信</a>
<a href="sms:+8613800138000?body=你好">发送短信（预填内容）</a>
```

### 4.3 其他协议

```html
<!-- FTP -->
<a href="ftp://ftp.example.com/file.zip">FTP下载</a>

<!-- 文件下载（本地） -->
<a href="file:///C:/Users/Documents/file.pdf">本地文件</a>
```

## 五、下载链接

### 5.1 download 属性

```html
<!-- 触发下载 -->
<a href="image.jpg" download>下载图片</a>

<!-- 指定下载文件名 -->
<a href="image.jpg" download="my-image.jpg">下载图片</a>

<!-- 下载 PDF -->
<a href="report.pdf" download="2024年度报告.pdf">下载报告</a>
```

> **⚠️ 注意**  
> `download` 属性仅对同源 URL 有效。跨域资源需要服务器支持 CORS。

### 5.2 实战示例

```html
<section>
  <h2>资源下载</h2>
  <ul>
    <li>
      <a href="files/manual.pdf" download="用户手册.pdf">
        📄 用户手册（PDF，1.5MB）
      </a>
    </li>
    <li>
      <a href="files/template.xlsx" download>
        📊 模板文件（Excel）
      </a>
    </li>
    <li>
      <a href="files/image.jpg" download="产品图.jpg">
        🖼️ 产品图片（JPG，800KB）
      </a>
    </li>
  </ul>
</section>
```

## 六、链接样式状态

CSS 可以为链接的不同状态设置样式：

```html
<style>
/* 默认状态 */
a:link {
  color: blue;
  text-decoration: none;
}

/* 访问过的链接 */
a:visited {
  color: purple;
}

/* 鼠标悬停 */
a:hover {
  color: red;
  text-decoration: underline;
}

/* 激活状态（点击时） */
a:active {
  color: orange;
}

/* 获得焦点（键盘导航） */
a:focus {
  outline: 2px solid blue;
}
</style>
```

> **📌 顺序很重要**  
> CSS 伪类顺序：`:link` → `:visited` → `:hover` → `:active`  
> 记忆口诀：**L**o**V**e **HA**te

## 七、链接包含块级元素

HTML5 允许 `<a>` 包含块级元素：

```html
<!-- HTML5：合法 -->
<a href="article.html">
  <article>
    <h2>文章标题</h2>
    <p>文章摘要...</p>
    <img src="thumbnail.jpg" alt="缩略图">
  </article>
</a>

<!-- 卡片式链接 -->
<a href="product.html" class="product-card">
  <div class="card">
    <img src="product.jpg" alt="产品">
    <h3>产品名称</h3>
    <p class="price">¥99.00</p>
  </div>
</a>
```

> **⚠️ 限制**  
> `<a>` 不能嵌套另一个 `<a>` 或交互元素（如 `<button>`）。

## 八、无障碍访问

### 8.1 有意义的链接文本

```html
<!-- ❌ 不好 -->
<a href="article.html">点击这里</a>阅读完整文章

<!-- ✅ 好 -->
<a href="article.html">阅读完整文章：HTML5 语义化指南</a>
```

### 8.2 title 属性

```html
<!-- 提供额外说明 -->
<a href="https://external-site.com" 
   target="_blank"
   rel="noopener"
   title="在新窗口打开外部网站">
  访问外部网站
</a>
```

### 8.3 aria-label

```html
<!-- 当链接只有图标时 -->
<a href="https://twitter.com" aria-label="访问我们的Twitter">
  <svg><!-- Twitter 图标 --></svg>
</a>
```

### 8.4 键盘导航

```html
<!-- 跳过导航链接（针对屏幕阅读器） -->
<a href="#main-content" class="skip-link">跳转到主内容</a>

<style>
.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  left: 0;
  top: 0;
  background: #000;
  color: #fff;
  padding: 10px;
  z-index: 1000;
}
</style>
```

## 九、导航最佳实践

### 9.1 导航结构

```html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
    <li><a href="/contact">联系</a></li>
  </ul>
</nav>
```

### 9.2 面包屑导航

```html
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li><a href="/category/subcategory">子分类</a></li>
    <li aria-current="page">当前页面</li>
  </ol>
</nav>
```

### 9.3 当前页面标识

```html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products" aria-current="page" class="active">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

## 十、实战示例

### 10.1 完整导航

```html
<header>
  <nav aria-label="主导航">
    <ul>
      <li><a href="/">首页</a></li>
      <li>
        <a href="/products">产品</a>
        <ul>
          <li><a href="/products/web">Web 开发</a></li>
          <li><a href="/products/mobile">移动开发</a></li>
        </ul>
      </li>
      <li><a href="/docs">文档</a></li>
      <li><a href="/blog">博客</a></li>
      <li><a href="/about">关于</a></li>
    </ul>
  </nav>
</header>
```

### 10.2 社交媒体链接

```html
<footer>
  <h3>关注我们</h3>
  <nav aria-label="社交媒体">
    <ul>
      <li>
        <a href="https://twitter.com/example" 
           target="_blank" 
           rel="noopener"
           aria-label="Twitter">
          <svg><!-- Twitter 图标 --></svg>
          Twitter
        </a>
      </li>
      <li>
        <a href="https://github.com/example"
           target="_blank"
           rel="noopener"
           aria-label="GitHub">
          <svg><!-- GitHub 图标 --></svg>
          GitHub
        </a>
      </li>
    </ul>
  </nav>
</footer>
```

## 参考资料

- [MDN - `<a>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a)
- [W3C - Links](https://html.spec.whatwg.org/#links)
- [WebAIM - Links and Hypertext](https://webaim.org/techniques/hypertext/)

---

**上一章** ← [第 5 章：列表与定义](./05-lists.md)  
**下一章** → [第 7 章：图片处理](./07-images.md)

---

✅ **第一部分：HTML 基础（1-6章）已完成！**
