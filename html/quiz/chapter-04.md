# 第 4 章：文本内容标签 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 标题标签

### 题目

一个 HTML 页面应该有几个 `<h1>` 标签？

**选项：**
- A. 必须有且只有一个
- B. 可以有多个
- C. 可以没有
- D. 根据需要，A 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**`<h1>` 使用规则**

HTML5 规范允许每个页面有 0 个或多个 `<h1>`，但**最佳实践是一个页面只有一个 `<h1>`**。

```html
<!-- ✅ 推荐：一个 h1 -->
<body>
  <h1>页面主标题</h1>
  <h2>第一部分</h2>
  <h3>1.1 小节</h3>
  <h2>第二部分</h2>
</body>

<!-- ⚠️ 允许但不推荐：多个 h1 -->
<body>
  <article>
    <h1>文章1标题</h1>
  </article>
  <article>
    <h1>文章2标题</h1>
  </article>
</body>

<!-- ⚠️ 允许：没有 h1 -->
<body>
  <h2>副标题</h2>
  <p>内容</p>
</body>
```

**为什么推荐一个 `<h1>`？**
- ✅ SEO 友好（搜索引擎更容易理解页面主题）
- ✅ 可访问性更好（屏幕阅读器）
- ✅ 清晰的文档大纲
- ✅ 最佳实践

**标题层级规则：**
```html
<!-- ✅ 正确的层级 -->
<h1>主标题</h1>
  <h2>第一部分</h2>
    <h3>1.1 小节</h3>
    <h3>1.2 小节</h3>
  <h2>第二部分</h2>
    <h3>2.1 小节</h3>

<!-- ❌ 错误：跳级 -->
<h1>主标题</h1>
  <h3>跳过了 h2</h3>
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** 文本格式化

### 题目

`<strong>` 和 `<b>` 标签的效果完全相同。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B（错误）

### 📖 解析

**`<strong>` vs `<b>`**

两者视觉效果相同（粗体），但**语义不同**：

```html
<!-- <strong>：强调，重要性 -->
<p><strong>警告：</strong>此操作不可撤销</p>

<!-- <b>：仅视觉加粗，无语义 -->
<p><b>关键词：</b>HTML, CSS, JavaScript</p>
```

**对比表：**

| 特性 | `<strong>` | `<b>` |
|------|-----------|-------|
| **语义** | 重要、强调 | 无特殊语义 |
| **SEO** | 有帮助 | 无帮助 |
| **屏幕阅读器** | 会加重语气 | 不会 |
| **推荐场景** | 重要内容 | 纯样式需求 |

**类似的对比：**

```html
<!-- <em> vs <i> -->
<em>强调的文本</em>  <!-- 语义：强调 -->
<i>斜体文本</i>      <!-- 无语义 -->

<!-- <mark> -->
<mark>高亮文本</mark>  <!-- 语义：标记/高亮 -->

<!-- <del> vs <s> -->
<del>删除的文本</del>  <!-- 语义：删除 -->
<s>不准确的文本</s>    <!-- 语义：不再准确 -->
```

**最佳实践：**
```html
<!-- ✅ 使用语义标签 -->
<p><strong>重要：</strong>请及时保存</p>
<p><em>强调：</em>这很关键</p>

<!-- ⚠️ 纯样式用 CSS -->
<p><span class="bold">粗体样式</span></p>
```

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 引用标签

### 题目

以下哪个标签用于表示短引用（行内引用）？

**选项：**
- A. `<blockquote>`
- B. `<q>`
- C. `<cite>`
- D. `<quote>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

**引用标签**

**1. `<q>` - 短引用（行内）**
```html
<p>孔子说：<q>学而时习之，不亦说乎</q></p>
<!-- 浏览器会自动添加引号 -->
```

**2. `<blockquote>` - 长引用（块级）**
```html
<blockquote cite="https://example.com/source">
  <p>这是一段较长的引用文本。</p>
  <p>可以包含多个段落。</p>
</blockquote>
```

**3. `<cite>` - 引用作品名称**
```html
<p>我最喜欢的电影是<cite>肖申克的救赎</cite></p>
```

**完整示例：**
```html
<article>
  <h2>文章标题</h2>
  
  <!-- 短引用 -->
  <p>正如爱因斯坦所说：<q>想象力比知识更重要</q></p>
  
  <!-- 长引用 -->
  <blockquote cite="https://example.com">
    <p>这是一段引用的内容...</p>
    <footer>
      —— <cite>来源作品名称</cite>
    </footer>
  </blockquote>
  
  <!-- 作品引用 -->
  <p>推荐阅读<cite>JavaScript高级程序设计</cite></p>
</article>
```

**样式示例：**
```css
q {
  quotes: "「" "」" "『" "』";  /* 自定义引号 */
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #666;
}

cite {
  font-style: italic;
}
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 代码展示

### 题目

在 HTML 中展示代码，应该使用哪些标签？

**选项：**
- A. `<code>` - 行内代码
- B. `<pre>` - 预格式化文本
- C. `<kbd>` - 键盘输入
- D. `<samp>` - 程序输出

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**代码相关标签（全部正确）**

**1. `<code>` - 行内代码**
```html
<p>使用 <code>console.log()</code> 打印信息</p>
```

**2. `<pre>` - 预格式化文本**
```html
<pre>
function hello() {
  console.log('Hello');
}
</pre>
```

**3. `<pre>` + `<code>` 组合（最佳实践）**
```html
<pre><code>function add(a, b) {
  return a + b;
}

console.log(add(1, 2));  // 3
</code></pre>
```

**4. `<kbd>` - 键盘输入**
```html
<p>按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制</p>
<p>保存：<kbd>Ctrl</kbd> + <kbd>S</kbd></p>
```

**5. `<samp>` - 程序输出**
```html
<p>程序输出：<samp>Error: File not found</samp></p>
```

**6. `<var>` - 变量**
```html
<p>方程式：<var>x</var> + <var>y</var> = 10</p>
```

**完整示例：**
```html
<article>
  <h2>JavaScript 示例</h2>
  
  <!-- 行内代码 -->
  <p>使用 <code>Array.map()</code> 方法遍历数组</p>
  
  <!-- 代码块 -->
  <pre><code class="language-javascript">const numbers = [1, 2, 3];
const doubled = numbers.map(x => x * 2);
console.log(doubled);  // [2, 4, 6]
</code></pre>
  
  <!-- 键盘输入 -->
  <p>快捷键：<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd></p>
  
  <!-- 程序输出 -->
  <p>输出结果：<samp>[2, 4, 6]</samp></p>
  
  <!-- 变量 -->
  <p>其中 <var>x</var> 是数组元素</p>
</article>
```

**CSS 样式：**
```css
code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

pre {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}

kbd {
  background: #333;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

samp {
  background: #e8f5e9;
  padding: 2px 6px;
  font-family: monospace;
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** 换行标签

### 题目

`<br>` 和 `<hr>` 标签有什么区别？

**选项：**
- A. `<br>` 换行，`<hr>` 水平线
- B. 两者完全相同
- C. `<br>` 是块级元素，`<hr>` 是行内元素
- D. `<hr>` 只是视觉上的线，没有语义

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**`<br>` vs `<hr>`**

**1. `<br>` - 换行**
```html
<p>
  第一行<br>
  第二行<br>
  第三行
</p>
```

**特点：**
- 行内元素
- 仅换行，无其他语义
- 不应滥用（多个换行应该用 CSS margin）

**2. `<hr>` - 主题分隔（水平线）**
```html
<section>
  <h2>第一部分</h2>
  <p>内容...</p>
</section>

<hr>

<section>
  <h2>第二部分</h2>
  <p>内容...</p>
</section>
```

**特点：**
- 块级元素
- 语义：主题转换、段落分隔
- 默认显示为水平线

**使用建议：**

```html
<!-- ✅ 合理使用 br -->
<address>
  张三<br>
  北京市朝阳区<br>
  电话：138-0013-8000
</address>

<p>
  诗歌第一行<br>
  诗歌第二行<br>
  诗歌第三行
</p>

<!-- ❌ 滥用 br -->
<p>段落1</p>
<br><br><br>  <!-- 应该用 CSS margin -->
<p>段落2</p>

<!-- ✅ 应该用 CSS -->
<p style="margin-bottom: 3rem;">段落1</p>
<p>段落2</p>
```

```html
<!-- ✅ 合理使用 hr -->
<article>
  <h1>文章标题</h1>
  <p>内容...</p>
  
  <hr>  <!-- 主题转换 -->
  
  <h2>另一个主题</h2>
  <p>内容...</p>
</article>

<!-- ⚠️ 可以用 CSS 样式化 -->
<style>
hr {
  border: none;
  border-top: 2px solid #ddd;
  margin: 2rem 0;
}
</style>
```

**HTML5 语义：**
- `<br>`：换行符，无特殊语义
- `<hr>`：**thematic break**（主题中断），有语义

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 缩写标签

### 题目

如何正确标记缩写词？

**选项：**
- A. `<abbr title="HyperText Markup Language">HTML</abbr>`
- B. `<acronym>HTML</acronym>`
- C. `<short>HTML</short>`
- D. `<abbr>HTML</abbr>`

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**`<abbr>` 标签**

```html
<!-- ✅ 正确用法 -->
<p><abbr title="HyperText Markup Language">HTML</abbr> 是网页的骨架</p>
<p><abbr title="Cascading Style Sheets">CSS</abbr> 负责样式</p>
<p><abbr title="World Wide Web Consortium">W3C</abbr> 制定标准</p>
```

**效果：**
- 鼠标悬停显示完整含义
- 浏览器通常显示下划线虚线
- 提升可访问性

**`<acronym>` 已废弃：**
```html
<!-- ❌ HTML5 中已废弃 -->
<acronym title="HyperText Markup Language">HTML</acronym>

<!-- ✅ 使用 abbr 代替 -->
<abbr title="HyperText Markup Language">HTML</abbr>
```

**样式示例：**
```html
<style>
abbr {
  cursor: help;
  text-decoration: underline dotted;
}

abbr[title] {
  border-bottom: 1px dotted #666;
  text-decoration: none;
}
</style>

<p>
  学习 <abbr title="HyperText Markup Language">HTML</abbr>、
  <abbr title="Cascading Style Sheets">CSS</abbr> 和
  <abbr title="JavaScript">JS</abbr>
</p>
```

**可访问性：**
```html
<!-- 首次出现时可以完整展示 -->
<p>
  HyperText Markup Language (<abbr>HTML</abbr>) 是网页的基础。
  <abbr title="HyperText Markup Language">HTML</abbr> 定义了网页的结构。
</p>
```

**其他缩写相关标签：**
```html
<!-- <dfn> - 定义术语 -->
<p>
  <dfn><abbr title="HyperText Markup Language">HTML</abbr></dfn>
  是一种标记语言。
</p>

<!-- <time> - 时间缩写 -->
<time datetime="2024-01-15">2024/1/15</time>
```

</details>

---

## 第 7 题 🟡

**类型：** 多选题  
**标签：** 文本语义

### 题目

以下哪些是 HTML5 新增的文本语义标签？

**选项：**
- A. `<mark>` - 标记/高亮
- B. `<time>` - 时间
- C. `<progress>` - 进度条
- D. `<meter>` - 度量

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**HTML5 新增文本语义标签（全部正确）**

**1. `<mark>` - 标记/高亮**
```html
<p>搜索结果：包含 <mark>HTML</mark> 的文章</p>
<p>重点：<mark>这部分很重要</mark></p>
```

**2. `<time>` - 时间**
```html
<p>发布时间：<time datetime="2024-01-15">2024年1月15日</time></p>
<p>会议时间：<time datetime="2024-01-15T14:00">下午2点</time></p>
<p>持续时间：<time datetime="PT2H30M">2小时30分钟</time></p>
```

**3. `<progress>` - 进度条**
```html
<label>下载进度：</label>
<progress value="70" max="100">70%</progress>

<label>加载中：</label>
<progress></progress>  <!-- 不确定进度 -->
```

**4. `<meter>` - 度量**
```html
<label>磁盘使用：</label>
<meter value="0.6">60%</meter>

<label>评分：</label>
<meter min="0" max="10" value="8" low="3" high="7" optimum="9">8/10</meter>
```

**完整示例：**
```html
<article>
  <h2>文章标题</h2>
  
  <!-- time -->
  <p>
    发布于 <time datetime="2024-01-15T10:00">2024年1月15日 10:00</time>
  </p>
  
  <!-- mark -->
  <p>本文介绍 <mark>HTML5</mark> 的新特性</p>
  
  <!-- progress -->
  <div>
    <label>阅读进度：</label>
    <progress value="30" max="100">30%</progress>
  </div>
  
  <!-- meter -->
  <div>
    <label>文章质量：</label>
    <meter min="0" max="5" value="4.5" optimum="5">4.5/5</meter>
  </div>
</article>
```

**样式示例：**
```css
mark {
  background-color: yellow;
  padding: 2px 4px;
}

time {
  color: #666;
  font-style: italic;
}

progress {
  width: 200px;
  height: 20px;
}

meter {
  width: 200px;
  height: 20px;
}

/* meter 根据值自动改变颜色 */
meter::-webkit-meter-optimum-value {
  background: green;
}
meter::-webkit-meter-suboptimum-value {
  background: orange;
}
meter::-webkit-meter-even-less-good-value {
  background: red;
}
```

**其他 HTML5 文本标签：**
```html
<!-- <wbr> - 换行机会 -->
<p>supercalifragilistic<wbr>expialidocious</p>

<!-- <ruby> - 注音 -->
<ruby>
  汉 <rt>hàn</rt>
  字 <rt>zì</rt>
</ruby>

<!-- <details> + <summary> -->
<details>
  <summary>点击展开</summary>
  <p>隐藏的内容</p>
</details>
```

</details>

---

## 第 8 题 🔴

**类型：** 代码补全题  
**标签：** 语义化文本

### 题目

请使用语义化标签标记以下内容：

```
文章标题：深入理解 HTML5
发布时间：2024年1月15日
作者：张三
摘要：本文介绍 HTML5 的核心特性...
重要提示：请务必使用最新浏览器
引用：HTML 是网页的基础 —— 《Web开发指南》
```

<details>
<summary>查看答案</summary>

### ✅ 正确答案

```html
<article>
  <!-- 文章标题 -->
  <h1>深入理解 HTML5</h1>
  
  <!-- 元信息 -->
  <p>
    发布时间：<time datetime="2024-01-15">2024年1月15日</time><br>
    作者：张三
  </p>
  
  <!-- 摘要 -->
  <p><strong>摘要：</strong>本文介绍 HTML5 的核心特性...</p>
  
  <!-- 重要提示 -->
  <p><strong>重要提示：</strong>请务必使用最新浏览器</p>
  
  <!-- 引用 -->
  <blockquote>
    <p>HTML 是网页的基础</p>
    <footer>
      —— <cite>《Web开发指南》</cite>
    </footer>
  </blockquote>
</article>
```

### 📖 解析

**语义化标签详解**

**1. 文档结构**
```html
<article>  <!-- 独立的文章内容 -->
  <header>  <!-- 可选：文章头部 -->
    <h1>标题</h1>
    <p>元信息</p>
  </header>
  
  <section>  <!-- 文章章节 -->
    <h2>第一部分</h2>
    <p>内容...</p>
  </section>
  
  <footer>  <!-- 可选：文章底部 -->
    <p>作者、版权等</p>
  </footer>
</article>
```

**2. 元信息标记**
```html
<!-- 时间 -->
<time datetime="2024-01-15">2024年1月15日</time>
<time datetime="2024-01-15T14:00+08:00">2024年1月15日 14:00</time>

<!-- 作者（可以更语义化） -->
<address>
  <a rel="author" href="/author/zhangsan">张三</a>
</address>

<!-- 或使用 microdata -->
<span itemprop="author">张三</span>
```

**3. 强调和重要性**
```html
<!-- 重要（语义） -->
<strong>重要提示</strong>

<!-- 强调（语义） -->
<em>请注意</em>

<!-- 仅样式加粗 -->
<b>粗体</b>

<!-- 仅样式斜体 -->
<i>斜体</i>
```

**4. 引用**
```html
<!-- 块引用 -->
<blockquote cite="https://example.com/source">
  <p>引用内容</p>
  <footer>
    —— <cite>作品名称</cite>，作者名
  </footer>
</blockquote>

<!-- 行内引用 -->
<p>如书中所说：<q>HTML 是网页的基础</q></p>
```

**完整语义化示例：**
```html
<article itemscope itemtype="http://schema.org/Article">
  <header>
    <h1 itemprop="headline">深入理解 HTML5</h1>
    
    <p class="meta">
      <time itemprop="datePublished" datetime="2024-01-15">
        2024年1月15日
      </time>
      
      <span itemprop="author" itemscope itemtype="http://schema.org/Person">
        作者：<span itemprop="name">张三</span>
      </span>
    </p>
  </header>
  
  <div itemprop="description">
    <p><strong>摘要：</strong>本文介绍 HTML5 的核心特性...</p>
  </div>
  
  <aside class="note">
    <p><strong>💡 重要提示：</strong>请务必使用最新浏览器</p>
  </aside>
  
  <div itemprop="articleBody">
    <p>正文内容...</p>
    
    <blockquote>
      <p>HTML 是网页的基础</p>
      <footer>
        —— <cite>《Web开发指南》</cite>
      </footer>
    </blockquote>
  </div>
  
  <footer>
    <p>标签：
      <a href="/tag/html5" rel="tag">HTML5</a>
      <a href="/tag/web" rel="tag">Web开发</a>
    </p>
  </footer>
</article>
```

</details>

---

## 第 9 题 🔴

**类型：** 多选题  
**标签：** 文本格式化

### 题目

关于 HTML 文本格式化标签，以下说法正确的是？

**选项：**
- A. `<small>` 用于法律声明、版权等附属细则
- B. `<del>` 表示删除的文本，`<ins>` 表示插入的文本
- C. `<sup>` 和 `<sub>` 用于上标和下标
- D. `<u>` 用于强调重要文本

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C

### 📖 解析

**文本格式化标签**

**1. `<small>` - 附属细则（正确）**
```html
<p>价格：¥99.00</p>
<p><small>* 价格不含运费</small></p>

<footer>
  <small>&copy; 2024 网站名称. 保留所有权利.</small>
</footer>
```

**2. `<del>` 和 `<ins>` - 删除和插入（正确）**
```html
<p>原价：<del>¥199</del></p>
<p>现价：<ins>¥99</ins></p>

<!-- 带时间和引用 -->
<p>
  <del cite="/edit/1" datetime="2024-01-15">旧内容</del>
  <ins cite="/edit/2" datetime="2024-01-16">新内容</ins>
</p>
```

**3. `<sup>` 和 `<sub>` - 上标和下标（正确）**
```html
<!-- 上标 -->
<p>面积：10m<sup>2</sup></p>
<p>E = mc<sup>2</sup></p>
<p>脚注<sup>1</sup></p>

<!-- 下标 -->
<p>H<sub>2</sub>O（水）</p>
<p>CO<sub>2</sub>（二氧化碳）</p>
```

**4. `<u>` - 不再推荐用于强调（错误）**
```html
<!-- ❌ 旧用法：强调 -->
<p><u>重要文本</u></p>

<!-- ✅ 新用法：专有名词、拼写错误标记 -->
<p>This is a <u class="spelling-error">mispeling</u></p>
<p>See <u class="proper-name">Beijing</u> on the map</p>

<!-- ✅ 强调应该用 strong 或 em -->
<p><strong>重要文本</strong></p>
<p><em>强调文本</em></p>
```

**完整对比：**

| 标签 | 语义 | 默认样式 | 推荐用途 |
|------|------|---------|---------|
| `<small>` | 附属细则 | 小字号 | 版权、法律声明 |
| `<del>` | 删除 | 删除线 | 文档修订 |
| `<ins>` | 插入 | 下划线 | 文档修订 |
| `<s>` | 不再准确 | 删除线 | 过时信息 |
| `<sup>` | 上标 | 上标 | 指数、脚注 |
| `<sub>` | 下标 | 下标 | 化学式 |
| `<u>` | 非文本注释 | 下划线 | 专有名词 |
| `<mark>` | 标记/高亮 | 黄色背景 | 搜索结果 |

**实际应用：**
```html
<article>
  <h1>产品更新日志</h1>
  
  <!-- 版本信息 -->
  <section>
    <h2>版本 2.0 <small>(2024-01-15)</small></h2>
    
    <!-- 更新内容 -->
    <ul>
      <li><ins>新增：深色模式</ins></li>
      <li><del>移除：旧版编辑器</del></li>
      <li>优化：性能提升 <mark>50%</mark></li>
    </ul>
  </section>
  
  <!-- 技术说明 -->
  <section>
    <h2>技术细节</h2>
    <p>算法复杂度：O(n<sup>2</sup>)</p>
    <p>化学式：C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></p>
  </section>
  
  <!-- 法律声明 -->
  <footer>
    <small>
      * 本产品受版权保护<br>
      * 最终解释权归公司所有
    </small>
  </footer>
</article>
```

</details>

---

## 第 10 题 🔴

**类型：** 综合分析题  
**标签：** 文本语义化

### 题目

对比以下两种写法，说明为什么版本 B 更好？

```html
<!-- 版本 A -->
<div class="article">
  <div class="title">深入理解闭包</div>
  <div class="date">2024-01-15</div>
  <div class="important">重要提示</div>
  <div class="content">
    闭包是 <span class="bold">JavaScript</span> 的核心概念
  </div>
</div>

<!-- 版本 B -->
<article>
  <h1>深入理解闭包</h1>
  <time datetime="2024-01-15">2024年1月15日</time>
  <p><strong>重要提示</strong></p>
  <p>闭包是 <strong>JavaScript</strong> 的核心概念</p>
</article>
```

<details>
<summary>查看答案</summary>

### 📖 解析

**版本 B 的优势**

**1. 语义化标签**

| 版本A | 版本B | 优势 |
|-------|-------|------|
| `<div class="article">` | `<article>` | ✅ 明确的文章语义 |
| `<div class="title">` | `<h1>` | ✅ 标题层级 |
| `<div class="date">` | `<time>` | ✅ 机器可读的时间 |
| `<span class="bold">` | `<strong>` | ✅ 强调语义 |

**2. SEO 优势**
```html
<!-- 版本 A：搜索引擎难以理解 -->
<div class="title">深入理解闭包</div>

<!-- 版本 B：搜索引擎知道这是标题 -->
<h1>深入理解闭包</h1>
```

**3. 可访问性**
```html
<!-- 版本 A：屏幕阅读器读取为普通文本 -->
<div class="important">重要提示</div>

<!-- 版本 B：屏幕阅读器会加重语气 -->
<strong>重要提示</strong>
```

**4. 机器可读**
```html
<!-- 版本 A：纯文本 -->
<div class="date">2024-01-15</div>

<!-- 版本 B：机器可解析 -->
<time datetime="2024-01-15">2024年1月15日</time>
```

**5. 维护性**
```html
<!-- 版本 A：需要记住 class 含义 -->
<div class="title">
<div class="subtitle">
<div class="section-title">

<!-- 版本 B：标签本身说明用途 -->
<h1>主标题</h1>
<h2>副标题</h2>
<h3>小节标题</h3>
```

**最佳实践版本：**
```html
<article itemscope itemtype="http://schema.org/Article">
  <header>
    <h1 itemprop="headline">深入理解闭包</h1>
    
    <p class="meta">
      <time itemprop="datePublished" datetime="2024-01-15">
        2024年1月15日
      </time>
      
      <span itemprop="author">张三</span>
    </p>
  </header>
  
  <aside class="notice">
    <p><strong>💡 重要提示：</strong>本文需要 JavaScript 基础</p>
  </aside>
  
  <div itemprop="articleBody">
    <p>
      闭包是 <strong>JavaScript</strong> 的核心概念之一。
      <mark>掌握闭包</mark>对于深入理解 JavaScript 至关重要。
    </p>
    
    <section>
      <h2>什么是闭包？</h2>
      <p>内容...</p>
    </section>
    
    <section>
      <h2>闭包的应用</h2>
      <p>内容...</p>
    </section>
  </div>
  
  <footer>
    <p>
      标签：
      <a href="/tag/javascript" rel="tag">JavaScript</a>
      <a href="/tag/closure" rel="tag">闭包</a>
    </p>
  </footer>
</article>
```

**语义化的好处总结：**
- ✅ **SEO**：搜索引擎更好地理解内容
- ✅ **可访问性**：屏幕阅读器正确解读
- ✅ **可维护性**：代码自解释，易于理解
- ✅ **机器可读**：爬虫、RSS 等工具易解析
- ✅ **标准化**：遵循 Web 标准
- ✅ **样式分离**：CSS 更容易编写

</details>

---

**📌 本章总结**

- 推荐一个页面只有一个 `<h1>`，标题层级要正确
- 使用语义标签：`<strong>` vs `<b>`，`<em>` vs `<i>`
- 引用标签：`<q>` 短引用，`<blockquote>` 长引用，`<cite>` 作品名
- 代码展示：`<code>` + `<pre>`，`<kbd>` 键盘，`<samp>` 输出
- HTML5 新标签：`<mark>`, `<time>`, `<progress>`, `<meter>`
- 语义化提升 SEO、可访问性和可维护性

**上一章** ← [第 3 章：头部元素详解](./chapter-03.md)  
**下一章** → [第 5 章：列表与定义](./chapter-05.md)
