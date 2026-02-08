# 文本语义与信息层级

## 核心概念

HTML 的文本标签不仅仅是"让文字显示出来"，而是**表达内容的语义层级和强调关系**。正确使用文本标签，可以让文档具有清晰的信息结构。

```html
<!-- 非语义化 -->
<div style="font-size: 24px; font-weight: bold;">标题</div>
<div>段落内容</div>

<!-- 语义化 -->
<h1>标题</h1>
<p>段落内容</p>
```

**后端类比**：
- 标题系统 ≈ 日志级别（ERROR > WARN > INFO）
- 文本标签 ≈ 数据类型（String、Number、Boolean）

## 标题系统：h1-h6 的层级规则

### 标题的语义层级

HTML 提供 6 级标题，形成**树形结构**：

```html
<h1>文档标题</h1>
  <h2>第一章</h2>
    <h3>1.1 小节</h3>
    <h3>1.2 小节</h3>
  <h2>第二章</h2>
    <h3>2.1 小节</h3>
      <h4>2.1.1 子小节</h4>
```

**层级关系**：

```
h1: 文档主标题（唯一）
└── h2: 章标题
    └── h3: 节标题
        └── h4: 小节标题
            └── h5: 段落标题
                └── h6: 细分标题
```

**后端类比**：类似于目录结构或组织架构：

```
公司（h1）
├── 技术部（h2）
│   ├── 前端组（h3）
│   └── 后端组（h3）
└── 产品部（h2）
    └── 设计组（h3）
```

### h1 的唯一性原则

**每个页面应该只有一个 h1**：

```html
<!-- ✅ 正确：一个页面一个 h1 -->
<body>
  <h1>网站首页</h1>
  <section>
    <h2>最新文章</h2>
  </section>
</body>

<!-- ❌ 错误：多个 h1 -->
<body>
  <h1>网站名称</h1>
  <main>
    <h1>文章标题</h1>  ← 应该用 h2
  </main>
</body>
```

**原因**：
1. SEO：搜索引擎将 h1 视为页面主题
2. 可访问性：屏幕阅读器用 h1 识别页面主旨
3. 信息架构：h1 是文档的根节点

**后端类比**：类似于数据库主键，唯一标识一条记录。

### 标题的递进规则

**不能跳级**：

```html
<!-- ❌ 错误：h1 直接跳到 h3 -->
<h1>标题 1</h1>
<h3>标题 3</h3>  ← 跳过 h2

<!-- ✅ 正确：逐级递进 -->
<h1>标题 1</h1>
<h2>标题 2</h2>
<h3>标题 3</h3>
```

**原因**：破坏文档大纲（Document Outline），影响可访问性和 SEO。

### 标题与 section 的配合

```html
<article>
  <h1>文章标题</h1>
  
  <section>
    <h2>第一章</h2>
    <p>内容...</p>
    
    <section>
      <h3>1.1 小节</h3>
      <p>内容...</p>
    </section>
  </section>
  
  <section>
    <h2>第二章</h2>
    <p>内容...</p>
  </section>
</article>
```

**后端类比**：类似于 XML/JSON 的层级结构。

## 段落与列表的语义差异

### p：段落

**语义**：表示一段**完整的文本块**。

```html
<p>这是第一段。包含多个句子，表达一个完整的意思。</p>
<p>这是第二段。另一个独立的主题。</p>
```

**嵌套限制**：

```html
<!-- ❌ 错误：p 内不能嵌套块级元素 -->
<p>
  段落文字
  <div>块级元素</div>  ← 自动闭合 p
</p>

<!-- ✅ 正确：p 内只能有内联元素 -->
<p>
  段落文字 <strong>加粗</strong> <em>斜体</em>
</p>
```

**后端类比**：p 标签类似于函数的作用域，内部不能定义另一个函数（块级）。

### ul：无序列表

**语义**：表示**没有顺序要求**的项目集合。

```html
<h3>购物清单</h3>
<ul>
  <li>牛奶</li>
  <li>面包</li>
  <li>鸡蛋</li>
</ul>
<!-- 顺序可以任意调换 -->
```

**使用场景**：
- ✅ 导航菜单
- ✅ 标签列表
- ✅ 功能特性
- ❌ 操作步骤（应该用 ol）

### ol：有序列表

**语义**：表示**有明确顺序**的项目集合。

```html
<h3>操作步骤</h3>
<ol>
  <li>打开应用</li>
  <li>点击登录</li>
  <li>输入账号密码</li>
</ol>
<!-- 顺序不能颠倒 -->
```

**高级用法**：

```html
<!-- 指定起始序号 -->
<ol start="5">
  <li>第 5 步</li>
  <li>第 6 步</li>
</ol>

<!-- 反向编号 -->
<ol reversed>
  <li>第 3 步</li>
  <li>第 2 步</li>
  <li>第 1 步</li>
</ol>

<!-- 自定义编号类型 -->
<ol type="a">  <!-- a, b, c -->
  <li>选项 A</li>
  <li>选项 B</li>
</ol>

<ol type="I">  <!-- I, II, III -->
  <li>第一章</li>
  <li>第二章</li>
</ol>
```

**后端类比**：
- ul ≈ Set（无序集合）
- ol ≈ Array（有序数组）

### dl：描述列表

**语义**：表示**术语及其描述**的配对关系。

```html
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言</dd>
  
  <dt>CSS</dt>
  <dd>层叠样式表</dd>
  
  <dt>JavaScript</dt>
  <dd>编程语言</dd>
  <dd>用于网页交互</dd>  <!-- 一个术语可以有多个描述 -->
</dl>
```

**使用场景**：
- ✅ 术语表、词汇表
- ✅ 元数据（键值对）
- ✅ FAQ（问题-答案）

```html
<!-- FAQ 示例 -->
<dl>
  <dt>如何注册账号？</dt>
  <dd>点击右上角的"注册"按钮...</dd>
  
  <dt>如何找回密码？</dt>
  <dd>点击"忘记密码"链接...</dd>
</dl>
```

**后端类比**：
- dl ≈ Map/Dictionary（键值对）
- dt ≈ Key
- dd ≈ Value

### 列表的嵌套

```html
<ul>
  <li>水果
    <ul>
      <li>苹果</li>
      <li>香蕉</li>
    </ul>
  </li>
  <li>蔬菜
    <ul>
      <li>西红柿</li>
      <li>黄瓜</li>
    </ul>
  </li>
</ul>
```

**后端类比**：类似于树形结构的递归定义。

## 强调与引用标签

### strong：重要性强调

**语义**：表示**内容的重要性**。

```html
<p>这是一段文字，<strong>这部分很重要</strong>，请注意。</p>
```

**效果**：
- 默认样式：粗体
- 语义：强调重要性（会影响 SEO 权重）
- 辅助技术：会以更强的语气朗读

### em：强调语气

**语义**：表示**语气或情感上的强调**。

```html
<p>我<em>真的</em>很喜欢这本书。</p>
<!-- 强调"真的" -->
```

**效果**：
- 默认样式：斜体
- 语义：语气强调
- 辅助技术：会改变语调朗读

### strong vs b，em vs i

```html
<!-- strong：语义强调（推荐） -->
<p><strong>警告：</strong>操作不可逆</p>

<!-- b：视觉加粗（不推荐，除非纯样式需求） -->
<p><b>产品名称</b></p>

<!-- em：语气强调（推荐） -->
<p>我<em>非常</em>喜欢</p>

<!-- i：视觉斜体（不推荐，除非术语、外语） -->
<p>这是 <i>de facto</i> 标准</p>
```

**后端类比**：
- strong/em ≈ 业务逻辑层（有语义）
- b/i ≈ 表示层（纯样式）

### mark：高亮标记

**语义**：表示**相关性或参考价值**的文本。

```html
<p>搜索结果：HTML 是<mark>超文本</mark>标记语言</p>
<!-- 高亮搜索关键词 -->
```

**使用场景**：
- ✅ 搜索结果高亮
- ✅ 代码差异对比
- ❌ 强调重要性（用 strong）

### blockquote：块级引用

**语义**：表示**引用的大段内容**。

```html
<blockquote cite="https://example.com/source">
  <p>引用的内容...</p>
  <footer>
    —— <cite>出处</cite>
  </footer>
</blockquote>
```

**属性**：
- `cite`：引用源 URL（机器可读）

### q：行内引用

**语义**：表示**行内的短引用**。

```html
<p>爱因斯坦说过：<q>想象力比知识更重要</q>。</p>
<!-- 浏览器会自动添加引号 -->
```

### cite：引用标题

**语义**：表示**作品标题**。

```html
<p>我最喜欢的书是 <cite>《三体》</cite>。</p>
```

**使用场景**：
- ✅ 书名、文章标题
- ✅ 电影、音乐作品
- ❌ 人名（不是作品标题）

### code：代码片段

**语义**：表示**计算机代码**。

```html
<p>使用 <code>console.log()</code> 输出日志。</p>
```

**与 pre 配合（多行代码）**：

```html
<pre><code>function hello() {
  console.log('Hello');
}
</code></pre>
```

### kbd：键盘输入

**语义**：表示**用户输入**的内容。

```html
<p>按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制。</p>
```

### samp：程序输出

**语义**：表示**程序输出**的示例。

```html
<p>运行后输出：<samp>Hello, World!</samp></p>
```

### var：变量

**语义**：表示**数学或编程变量**。

```html
<p>公式：<var>a</var> + <var>b</var> = <var>c</var></p>
```

## 对比后端：日志级别、数据分类

### HTML 层级 ≈ 日志级别

```
日志系统：
ERROR   > WARN    > INFO    > DEBUG
严重错误   警告      普通信息   调试信息

HTML 标题：
h1      > h2      > h3      > h4
最重要    次重要    再次重要   更细分
```

### 文本标签 ≈ 数据注解

```javascript
// 后端：数据注解
class User {
  @Required
  @MaxLength(50)
  name: string;
  
  @Email
  email: string;
}

// HTML：语义标签
<dl>
  <dt><strong>姓名</strong></dt>
  <dd><em>必填</em></dd>
  
  <dt><strong>邮箱</strong></dt>
  <dd><code>user@example.com</code></dd>
</dl>
```

## 常见误区

### 误区 1：用标题控制字体大小

**错误理解**：h1-h6 是用来设置字体大小的。

```html
<!-- ❌ 错误：为了大字体而用 h1 -->
<h1>这不是标题，只是想要大字</h1>

<!-- ✅ 正确：用 CSS 控制大小 -->
<p style="font-size: 2em; font-weight: bold;">
  这不是标题，只是大字
</p>
```

**原则**：标题表达**语义层级**，字体大小由 CSS 控制。

### 误区 2：strong 和 b 可以互换

**错误理解**：strong 和 b 效果相同，随便用哪个。

```html
<!-- ❌ 错误：用 b 表示重要性 -->
<p><b>重要提示：</b>请保存您的工作。</p>

<!-- ✅ 正确：用 strong 表示重要性 -->
<p><strong>重要提示：</strong>请保存您的工作。</p>

<!-- ✅ 正确：b 用于纯样式需求 -->
<p><b class="product-name">产品A</b> vs <b class="product-name">产品B</b></p>
```

### 误区 3：所有列表都用 ul

**错误理解**：列表就用 ul，不需要区分。

```html
<!-- ❌ 错误：步骤用 ul -->
<h3>安装步骤</h3>
<ul>
  <li>下载安装包</li>
  <li>解压文件</li>
  <li>运行安装程序</li>
</ul>

<!-- ✅ 正确：步骤用 ol -->
<h3>安装步骤</h3>
<ol>
  <li>下载安装包</li>
  <li>解压文件</li>
  <li>运行安装程序</li>
</ol>
```

## 工程实践示例

### 场景 1：文档大纲结构

```html
<article>
  <h1>前端开发指南</h1>
  
  <section>
    <h2>第一章：HTML</h2>
    <p>HTML 是...</p>
    
    <section>
      <h3>1.1 基础语法</h3>
      <p>语法规则...</p>
    </section>
    
    <section>
      <h3>1.2 语义化</h3>
      <p>语义化标签...</p>
    </section>
  </section>
  
  <section>
    <h2>第二章：CSS</h2>
    <p>CSS 是...</p>
  </section>
</article>
```

### 场景 2：产品特性列表

```html
<section>
  <h2>产品特性</h2>
  <ul>
    <li><strong>高性能：</strong>响应时间 < 100ms</li>
    <li><strong>高可用：</strong>99.9% 可用性保证</li>
    <li><strong>易扩展：</strong>支持水平扩展</li>
  </ul>
</section>
```

### 场景 3：API 文档

```html
<section>
  <h2>API 参考</h2>
  
  <article>
    <h3><code>getUserInfo(userId)</code></h3>
    
    <p>获取用户信息。</p>
    
    <h4>参数</h4>
    <dl>
      <dt><var>userId</var></dt>
      <dd>类型：<code>string</code></dd>
      <dd>必需：<strong>是</strong></dd>
      <dd>说明：用户 ID</dd>
    </dl>
    
    <h4>返回值</h4>
    <p>类型：<code>Promise&lt;User&gt;</code></p>
    
    <h4>示例</h4>
    <pre><code>const user = await getUserInfo('123');
console.log(user.name);
</code></pre>
    
    <h4>错误处理</h4>
    <ul>
      <li><code>404</code> - 用户不存在</li>
      <li><code>500</code> - 服务器错误</li>
    </ul>
  </article>
</section>
```

### 场景 4：后端生成结构化内容

```javascript
// Node.js 生成文档大纲
function generateOutline(sections) {
  let html = '<nav><ol>';
  
  sections.forEach((section, index) => {
    html += `
      <li>
        <a href="#section-${index + 1}">
          ${section.title}
        </a>
    `;
    
    if (section.subsections) {
      html += '<ol>';
      section.subsections.forEach((sub, subIndex) => {
        html += `
          <li>
            <a href="#section-${index + 1}-${subIndex + 1}">
              ${sub.title}
            </a>
          </li>
        `;
      });
      html += '</ol>';
    }
    
    html += '</li>';
  });
  
  html += '</ol></nav>';
  return html;
}
```

## 深入一点：文档大纲算法

### HTML5 大纲（Outline）

浏览器根据标题和分节元素生成文档大纲：

```html
<body>
  <h1>网站标题</h1>
  
  <section>
    <h2>第一章</h2>
    <h3>1.1 节</h3>
  </section>
  
  <section>
    <h2>第二章</h2>
  </section>
</body>
```

**生成的大纲**：

```
1. 网站标题
   1.1 第一章
       1.1.1 1.1 节
   1.2 第二章
```

### 使用 JavaScript 提取大纲

```javascript
function generateTableOfContents() {
  const headings = document.querySelectorAll('h2, h3, h4, h5, h6');
  const toc = document.createElement('nav');
  toc.innerHTML = '<h2>目录</h2><ul></ul>';
  const list = toc.querySelector('ul');
  
  let currentLevel = 2;
  let currentList = list;
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    const item = document.createElement('li');
    const link = document.createElement('a');
    
    // 生成唯一 ID
    const id = heading.textContent.toLowerCase().replace(/\s+/g, '-');
    heading.id = id;
    
    link.href = `#${id}`;
    link.textContent = heading.textContent;
    item.appendChild(link);
    
    // 处理层级
    if (level > currentLevel) {
      const sublist = document.createElement('ul');
      currentList.lastElementChild.appendChild(sublist);
      currentList = sublist;
    } else if (level < currentLevel) {
      // 返回上级
      for (let i = 0; i < currentLevel - level; i++) {
        currentList = currentList.parentElement.parentElement;
      }
    }
    
    currentList.appendChild(item);
    currentLevel = level;
  });
  
  return toc;
}
```

## 参考资源

- [HTML Living Standard - Text-level Semantics](https://html.spec.whatwg.org/multipage/text-level-semantics.html)
- [MDN - HTML Text Fundamentals](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals)
- [W3C - Headings and Sections](https://www.w3.org/TR/html52/sections.html)
