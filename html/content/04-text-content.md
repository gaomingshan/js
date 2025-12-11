# 第 4 章：文本内容标签

## 概述

文本是网页的核心内容。HTML 提供了丰富的标签来组织和格式化文本，选择合适的标签能提升页面的语义化和可访问性。

## 一、标题标签

### 1.1 六级标题

```html
<h1>一级标题</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>
<h4>四级标题</h4>
<h5>五级标题</h5>
<h6>六级标题</h6>
```

### 1.2 标题层级

```html
<article>
  <h1>文章标题</h1>
  
  <section>
    <h2>第一部分</h2>
    <h3>1.1 小节</h3>
    <h3>1.2 小节</h3>
  </section>
  
  <section>
    <h2>第二部分</h2>
    <h3>2.1 小节</h3>
  </section>
</article>
```

> **📌 最佳实践**
> 
> - 每个页面只有一个 `<h1>`
> - 不要跳级（如 `<h1>` 直接到 `<h3>`）
> - 标题用于结构，不用于样式
> - SEO 重要：合理使用标题提升搜索排名

```html
<!-- ❌ 错误：用标题实现大字体 -->
<h1>正常段落（想要大字体）</h1>

<!-- ✅ 正确：用 CSS 控制样式 -->
<p class="large-text">正常段落</p>
```

## 二、段落与换行

### 2.1 段落 `<p>`

```html
<p>这是第一个段落。</p>
<p>这是第二个段落。</p>
```

### 2.2 换行 `<br>`

```html
<p>
  第一行<br>
  第二行<br>
  第三行
</p>
```

### 2.3 水平线 `<hr>`

```html
<p>第一部分内容</p>
<hr>
<p>第二部分内容</p>
```

> **⚠️ 注意**  
> `<br>` 用于换行，不要连续使用多个 `<br>` 来增加间距，应该用 CSS `margin`。

## 三、文本格式化

### 3.1 强调标签

```html
<!-- 强调（语义上重要） -->
<strong>重要文本</strong>
<em>强调文本</em>

<!-- 视觉上的加粗和斜体（无语义） -->
<b>加粗文本</b>
<i>斜体文本</i>
```

**对比：**

| 标签 | 语义 | 默认样式 | SEO |
|------|------|---------|-----|
| `<strong>` | 重要 | 加粗 | ✅ 有利 |
| `<em>` | 强调 | 斜体 | ✅ 有利 |
| `<b>` | 无 | 加粗 | ❌ 无影响 |
| `<i>` | 无 | 斜体 | ❌ 无影响 |

```html
<!-- ✅ 推荐：使用语义化标签 -->
<p>这是<strong>重要</strong>的内容。</p>
<p>请<em>注意</em>这一点。</p>

<!-- ⚠️ 适用场景 -->
<p>产品型号：<b>iPhone 15</b></p>  <!-- 视觉突出，无特殊语义 -->
<p>书名：<i>红楼梦</i></p>          <!-- 斜体，无特殊语义 -->
```

### 3.2 其他格式化标签

```html
<!-- 下划线 -->
<u>下划线文本</u>

<!-- 删除线 -->
<s>删除的文本</s>
<del>已删除的文本</del>  <!-- 有语义：表示删除 -->

<!-- 插入的文本 -->
<ins>新插入的文本</ins>

<!-- 标记/高亮 -->
<mark>高亮文本</mark>

<!-- 上标和下标 -->
H<sub>2</sub>O          <!-- H₂O -->
E = mc<sup>2</sup>      <!-- E = mc² -->

<!-- 小号文本 -->
<small>版权声明或免责声明</small>
```

## 四、引用标签

### 4.1 短引用 `<q>`

```html
<p>孔子说：<q>学而时习之，不亦说乎</q></p>
<!-- 浏览器会自动添加引号 -->
```

### 4.2 块引用 `<blockquote>`

```html
<blockquote cite="https://example.com/source">
  <p>长篇引用内容...</p>
  <p>可以包含多个段落。</p>
</blockquote>
```

### 4.3 引用来源 `<cite>`

```html
<p>根据<cite>红楼梦</cite>记载...</p>

<blockquote>
  <p>路漫漫其修远兮，吾将上下而求索。</p>
  <footer>——<cite>离骚</cite></footer>
</blockquote>
```

### 4.4 缩写 `<abbr>`

```html
<p>
  <abbr title="HyperText Markup Language">HTML</abbr>
  是网页的基础语言。
</p>
<!-- 鼠标悬停显示完整名称 -->
```

## 五、代码与预格式化

### 5.1 行内代码 `<code>`

```html
<p>使用 <code>console.log()</code> 输出日志。</p>
```

### 5.2 代码块 `<pre>`

```html
<pre><code>function greet(name) {
  console.log('Hello, ' + name);
}

greet('World');</code></pre>
```

> **💡 提示**  
> `<pre>` 保留空白和换行，适合展示代码。

### 5.3 键盘输入 `<kbd>`

```html
<p>按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制</p>
```

### 5.4 计算机输出 `<samp>`

```html
<p>运行结果：<samp>Hello, World!</samp></p>
```

### 5.5 变量 `<var>`

```html
<p>斜边长度 <var>c</var> = √(<var>a</var>² + <var>b</var>²)</p>
```

## 六、特殊文本标签

### 6.1 地址 `<address>`

```html
<address>
  联系我们：<br>
  邮箱：<a href="mailto:contact@example.com">contact@example.com</a><br>
  地址：北京市朝阳区xxx路xxx号
</address>
```

### 6.2 时间 `<time>`

```html
<!-- 机器可读的日期时间 -->
<time datetime="2024-01-01">2024年1月1日</time>
<time datetime="2024-01-01T14:30:00">2024年1月1日 14:30</time>

<!-- 文章发布时间 -->
<article>
  <h1>文章标题</h1>
  <p>发布时间：<time datetime="2024-01-01" pubdate>2024年1月1日</time></p>
</article>
```

### 6.3 定义 `<dfn>`

```html
<p>
  <dfn>HTML</dfn> 是超文本标记语言（HyperText Markup Language）的缩写。
</p>
```

### 6.4 双向文本 `<bdi>` 和 `<bdo>`

```html
<!-- bdi：隔离双向文本 -->
<p>用户 <bdi>مرحبا</bdi> 的评分：5分</p>

<!-- bdo：覆盖双向算法 -->
<p><bdo dir="rtl">This text will go right to left</bdo></p>
```

## 七、语义化选择指南

| 场景 | 推荐标签 | 说明 |
|------|---------|------|
| 文章标题 | `<h1>`-`<h6>` | 按层级使用 |
| 段落 | `<p>` | 文本段落 |
| 重要文本 | `<strong>` | 语义上重要 |
| 强调文本 | `<em>` | 语气强调 |
| 引用 | `<q>`, `<blockquote>` | 引用他人内容 |
| 代码 | `<code>`, `<pre>` | 代码展示 |
| 时间 | `<time>` | 日期时间 |
| 缩写 | `<abbr>` | 缩写词 |

> **📌 语义化原则**
> 
> 1. 根据内容含义选择标签，而不是样式
> 2. 提升可访问性（屏幕阅读器）
> 3. 有利于 SEO
> 4. 代码更易维护

## 八、实战示例

```html
<article>
  <header>
    <h1>HTML5 语义化最佳实践</h1>
    <p>
      作者：<cite>张三</cite> |
      发布时间：<time datetime="2024-01-01">2024年1月1日</time>
    </p>
  </header>
  
  <section>
    <h2>什么是语义化</h2>
    <p>
      <dfn>语义化</dfn>是指使用<strong>有意义</strong>的HTML标签来描述内容，
      而不是仅仅为了样式。
    </p>
    
    <blockquote>
      <p>语义化标签让机器更好地理解网页内容。</p>
      <footer>——<cite>MDN Web Docs</cite></footer>
    </blockquote>
  </section>
  
  <section>
    <h2>代码示例</h2>
    <p>使用 <code>&lt;strong&gt;</code> 标签：</p>
    <pre><code>&lt;p&gt;这是&lt;strong&gt;重要&lt;/strong&gt;的内容&lt;/p&gt;</code></pre>
  </section>
  
  <footer>
    <address>
      联系作者：<a href="mailto:zhangsan@example.com">zhangsan@example.com</a>
    </address>
  </footer>
</article>
```

## 参考资料

- [MDN - HTML 文本内容元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element#%E6%96%87%E6%9C%AC%E5%86%85%E5%AE%B9)
- [W3C - Text-level semantics](https://html.spec.whatwg.org/#text-level-semantics)

---

**上一章** ← [第 3 章：头部元素详解](./03-head-elements.md)  
**下一章** → [第 5 章：列表与定义](./05-lists.md)
