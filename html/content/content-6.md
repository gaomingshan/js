# 内容模型（Content Model）

## 核心概念

HTML 的**内容模型**（Content Model）定义了**每个标签可以包含什么类型的内容**，以及**可以被哪些标签包含**。这是 HTML 的核心约束系统，类似于编程语言的类型系统。

```html
<!-- ✅ 合法：p 可以包含 span -->
<p>文字 <span>内联内容</span></p>

<!-- ❌ 非法：p 不能包含 div -->
<p>文字 <div>块级内容</div></p>
<!-- 浏览器会自动修复为：-->
<p>文字</p>
<div>块级内容</div>
<p></p>
```

**后端类比**：
- 内容模型 ≈ 数据库的外键约束
- 嵌套规则 ≈ 类型检查（TypeScript、Java 泛型）

## 七大内容类别

HTML5 定义了 7 种内容类别，每个标签至少属于其中一种：

### 1. Metadata Content（元数据内容）

**定义**：设置文档呈现或行为的内容，不在页面中显示。

**标签**：`<base>`、`<link>`、`<meta>`、`<noscript>`、`<script>`、`<style>`、`<title>`

```html
<head>
  <meta charset="UTF-8">          <!-- 元数据 -->
  <title>页面标题</title>         <!-- 元数据 -->
  <link rel="stylesheet" href="style.css"> <!-- 元数据 -->
  <script src="app.js"></script>  <!-- 元数据 -->
</head>
```

**约束**：
- 只能放在 `<head>` 中（除了个别例外）
- 不可见，不影响布局

**后端类比**：类似于配置文件或注解（Annotation）。

### 2. Flow Content（流式内容）

**定义**：文档的主体内容，几乎所有在 `<body>` 中使用的标签。

**包含**：大部分标签，如 `<div>`、`<p>`、`<section>`、`<ul>`、`<table>` 等。

```html
<body>
  <!-- 以下都是 Flow Content -->
  <h1>标题</h1>
  <p>段落</p>
  <div>容器</div>
  <ul><li>列表</li></ul>
</body>
```

**特点**：
- 最宽泛的类别
- 几乎所有可见内容都属于 Flow Content

### 3. Sectioning Content（分节内容）

**定义**：定义文档结构的标签，创建新的**文档节点**。

**标签**：`<article>`、`<aside>`、`<nav>`、`<section>`

```html
<body>
  <nav>导航</nav>        <!-- 创建导航节点 -->
  <section>章节</section> <!-- 创建章节节点 -->
  <article>文章</article> <!-- 创建文章节点 -->
  <aside>侧边栏</aside>  <!-- 创建附属节点 -->
</body>
```

**特点**：
- 影响文档大纲（Outline）
- 每个都创建一个新的节点范围

**后端类比**：类似于命名空间（Namespace）或模块边界。

### 4. Heading Content（标题内容）

**定义**：定义节点标题的标签。

**标签**：`<h1>`、`<h2>`、`<h3>`、`<h4>`、`<h5>`、`<h6>`、`<hgroup>`

```html
<section>
  <h2>章节标题</h2>  <!-- Heading Content -->
  <p>章节内容</p>
</section>
```

**特点**：
- 总是属于其最近的 Sectioning Content
- 定义节点的主题

### 5. Phrasing Content（短语内容）

**定义**：文档中的文本和文本级标记。

**包含**：`<span>`、`<a>`、`<strong>`、`<em>`、`<code>`、`<img>` 等。

```html
<p>
  <!-- 以下都是 Phrasing Content -->
  这是 <strong>加粗</strong> 和 <em>斜体</em> 文本。
  这是 <a href="#">链接</a> 和 <code>代码</code>。
</p>
```

**约束**：
- 可以嵌套在大部分标签中
- 不能包含 Flow Content（除了特例）

**后端类比**：类似于基本数据类型（String、Number）。

### 6. Embedded Content（嵌入内容）

**定义**：从其他资源引入的内容。

**标签**：`<img>`、`<video>`、`<audio>`、`<canvas>`、`<svg>`、`<iframe>`、`<embed>`、`<object>`

```html
<!-- 嵌入图片 -->
<img src="photo.jpg" alt="照片">

<!-- 嵌入视频 -->
<video src="video.mp4" controls></video>

<!-- 嵌入 iframe -->
<iframe src="https://example.com"></iframe>
```

**特点**：
- 引用外部资源
- 可以是 Phrasing Content（如 `<img>`）

### 7. Interactive Content（交互内容）

**定义**：用户可以交互的内容。

**标签**：`<a>`、`<button>`、`<input>`、`<select>`、`<textarea>`、`<details>` 等。

```html
<!-- 以下都是 Interactive Content -->
<a href="#">链接</a>
<button>按钮</button>
<input type="text">
<select><option>选项</option></select>
```

**约束**：
- Interactive Content 不能嵌套（如按钮中不能有按钮）

```html
<!-- ❌ 错误：按钮嵌套链接 -->
<button>
  <a href="#">链接</a>
</button>

<!-- ✅ 正确：链接包含按钮样式 -->
<a href="#" class="button">链接按钮</a>
```

## 标签嵌套规则：为什么 p 不能包含 div

### 嵌套规则的本质

每个标签的内容模型定义了**可以包含的内容类别**：

```
<p> 的内容模型：Phrasing Content
→ 只能包含短语内容（span、a、strong 等）
→ 不能包含块级元素（div、p、section 等）

<div> 的内容模型：Flow Content
→ 可以包含几乎所有内容
→ 包括块级和内联元素
```

### 具体示例

#### p 标签的限制

```html
<!-- ✅ 正确：p 包含 Phrasing Content -->
<p>
  文本 <span>内联</span> <strong>加粗</strong> <a href="#">链接</a>
</p>

<!-- ❌ 错误：p 包含 div -->
<p>
  文本
  <div>块级内容</div>
</p>

<!-- 浏览器自动修复为： -->
<p>文本</p>
<div>块级内容</div>
<p></p>  <!-- 空的 p 标签 -->
```

**原因**：
1. `<p>` 代表段落，语义上不应包含块级结构
2. 历史兼容性：旧版 HTML 的解析规则

**后端类比**：类似于函数不能包含另一个函数定义（在某些语言中）。

#### ul/ol 的限制

```html
<!-- ✅ 正确：ul 只能直接包含 li -->
<ul>
  <li>项目 1</li>
  <li>项目 2</li>
</ul>

<!-- ❌ 错误：ul 直接包含其他元素 -->
<ul>
  <div>标题</div>  <!-- 非法 -->
  <li>项目</li>
</ul>

<!-- 浏览器修复为： -->
<div>标题</div>
<ul>
  <li>项目</li>
</ul>
```

**原因**：列表的结构约束，确保语义清晰。

#### table 的严格结构

```html
<!-- ✅ 正确：table 的结构 -->
<table>
  <thead>
    <tr>
      <th>表头</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>单元格</td>
    </tr>
  </tbody>
</table>

<!-- ❌ 错误：table 直接包含 div -->
<table>
  <div>内容</div>  <!-- 非法 -->
</table>
```

### 完整的嵌套规则表

| 父元素 | 可以包含 | 不能包含 |
|--------|---------|---------|
| `<html>` | `<head>`, `<body>` | 其他所有 |
| `<head>` | Metadata Content | Flow Content |
| `<body>` | Flow Content | Metadata Content |
| `<p>` | Phrasing Content | Flow Content（div、p 等） |
| `<a>` | Transparent（父级允许的） | Interactive Content |
| `<ul>`, `<ol>` | `<li>` | 直接包含其他元素 |
| `<table>` | `<caption>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>` | 其他 |
| `<tr>` | `<td>`, `<th>` | 其他 |

## 内容模型的验证与约束机制

### 浏览器的自动修复

浏览器会自动修复不合法的嵌套：

```html
<!-- 输入 -->
<p>段落 <div>块级</div> 继续</p>

<!-- 浏览器解析为 -->
<p>段落</p>
<div>块级</div>
<p>继续</p>
```

**修复规则**：
1. 遇到非法子元素时，关闭当前标签
2. 将非法元素提升为兄弟元素
3. 继续解析剩余内容

### HTML 验证工具

#### W3C Validator

```bash
# 在线验证
https://validator.w3.org/

# 上传文件或输入 URL
# 会报告所有违反内容模型的错误
```

**示例错误**：

```
Error: Element div not allowed as child of element p
<p>
  <div>...</div>  ← 此处报错
</p>
```

#### htmlhint

```bash
npm install -g htmlhint

htmlhint index.html
```

```javascript
// .htmlhintrc
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-no-duplication": true
}
```

### 编辑器集成

**VSCode 插件**：

```json
// settings.json
{
  "html.validate.scripts": true,
  "html.validate.styles": true,
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**实时提示**：

```html
<p>
  <div>  <!-- 波浪线提示：div 不能是 p 的子元素 -->
    内容
  </div>
</p>
```

## 常见误区

### 误区 1：认为所有标签都可以互相嵌套

**错误理解**：HTML 标签可以任意嵌套。

```html
<!-- ❌ 错误示例 -->
<a href="#">
  <button>点击</button>  <!-- a 不能包含 button -->
</a>

<button>
  <a href="#">链接</a>  <!-- button 不能包含 a -->
</button>

<!-- ✅ 正确方案 -->
<a href="#" class="button-link">点击</a>
<!-- 或 -->
<button onclick="location.href='#'">链接</button>
```

### 误区 2：所有块级元素都是 Flow Content

**错误理解**：块级 = Flow Content。

**正确认知**：
- 块级/内联是**显示特性**（由 CSS `display` 控制）
- Flow/Phrasing 是**内容类别**（由 HTML 规范定义）

```html
<!-- img 是 Phrasing Content，但可以通过 CSS 变成块级 -->
<img src="photo.jpg" style="display: block;">

<!-- span 是 Phrasing Content，但可以通过 CSS 变成块级 -->
<span style="display: block;">块级 span</span>
```

### 误区 3：依赖浏览器的自动修复

**错误理解**：浏览器会修复错误，所以不需要写规范的 HTML。

**问题**：
1. 不同浏览器的修复策略可能不同
2. 影响 SEO 和可访问性
3. 增加调试难度

```html
<!-- 错误的 HTML -->
<ul>
  <div>分类</div>
  <li>项目 1</li>
</ul>

<!-- Chrome 修复为： -->
<div>分类</div>
<ul>
  <li>项目 1</li>
</ul>

<!-- Firefox 可能修复为： -->
<ul>
  <li>
    <div>分类</div>
  </li>
  <li>项目 1</li>
</ul>
```

## 工程实践示例

### 场景 1：动态生成合法的 HTML

```javascript
// 后端生成 HTML 时验证内容模型
class HTMLBuilder {
  constructor() {
    this.contentModel = {
      'p': ['span', 'a', 'strong', 'em', 'code'],  // Phrasing
      'div': ['*'],  // Flow（几乎所有）
      'ul': ['li'],
      'ol': ['li'],
      'table': ['thead', 'tbody', 'tfoot', 'tr']
    };
  }
  
  createElement(tagName, children) {
    const allowedChildren = this.contentModel[tagName];
    
    if (!allowedChildren) {
      return `<${tagName}>${children}</${tagName}>`;
    }
    
    // 验证子元素
    const childTags = this.extractTags(children);
    const invalidChildren = childTags.filter(tag => 
      !allowedChildren.includes('*') && !allowedChildren.includes(tag)
    );
    
    if (invalidChildren.length > 0) {
      throw new Error(
        `Invalid children for <${tagName}>: ${invalidChildren.join(', ')}`
      );
    }
    
    return `<${tagName}>${children}</${tagName}>`;
  }
  
  extractTags(html) {
    const regex = /<(\w+)/g;
    const tags = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }
}

// 使用
const builder = new HTMLBuilder();

try {
  // ✅ 合法
  const html1 = builder.createElement('p', 
    '文本 <span>内联</span>'
  );
  
  // ❌ 抛出错误
  const html2 = builder.createElement('p', 
    '<div>块级</div>'
  );
} catch (error) {
  console.error(error.message);
  // "Invalid children for <p>: div"
}
```

### 场景 2：模板引擎的内容验证

```javascript
// EJS 模板的验证插件
function validateEJSTemplate(template) {
  const errors = [];
  const stack = [];
  
  // 简化的解析逻辑
  const tagRegex = /<\/?(\w+)/g;
  let match;
  
  while ((match = tagRegex.exec(template)) !== null) {
    const isClosing = template[match.index + 1] === '/';
    const tagName = match[1];
    
    if (!isClosing) {
      stack.push(tagName);
      
      // 检查嵌套
      if (stack.length >= 2) {
        const parent = stack[stack.length - 2];
        if (!isValidNesting(parent, tagName)) {
          errors.push({
            message: `<${tagName}> cannot be nested in <${parent}>`,
            line: getLineNumber(template, match.index)
          });
        }
      }
    } else {
      stack.pop();
    }
  }
  
  return errors;
}

function isValidNesting(parent, child) {
  const rules = {
    'p': ['span', 'a', 'strong', 'em'],
    'ul': ['li'],
    'ol': ['li']
  };
  
  const allowed = rules[parent];
  if (!allowed) return true;  // 无限制
  return allowed.includes(child);
}
```

### 场景 3：React 组件的 prop 验证

```jsx
// 使用 PropTypes 验证内容模型
import PropTypes from 'prop-types';

function Paragraph({ children }) {
  // 运行时验证：children 不能包含块级元素
  React.useEffect(() => {
    const div = document.createElement('div');
    div.innerHTML = children;
    
    const blockElements = div.querySelectorAll('div, p, section');
    if (blockElements.length > 0) {
      console.error('Paragraph cannot contain block-level elements');
    }
  }, [children]);
  
  return <p>{children}</p>;
}

Paragraph.propTypes = {
  children: PropTypes.node.isRequired
};

// 使用
<Paragraph>
  文本 <span>内联</span>  {/* ✅ 合法 */}
</Paragraph>

<Paragraph>
  <div>块级</div>  {/* ❌ 运行时警告 */}
</Paragraph>
```

## 深入一点：内容模型的演进

### HTML4 vs HTML5

**HTML4**：
- 只有**块级**和**内联**两种分类
- 规则简单但不够精确

```
HTML4 分类：
- 块级：div, p, h1, ul, table
- 内联：span, a, strong, em
```

**HTML5**：
- 七种内容类别
- 更精确的嵌套规则
- 支持复杂的内容结构

```
HTML5 分类：
- Metadata Content
- Flow Content
- Sectioning Content
- Heading Content
- Phrasing Content
- Embedded Content
- Interactive Content
```

### Transparent Content Model

某些标签有**透明内容模型**，继承父级的内容模型：

```html
<!-- a 标签的内容模型是透明的 -->
<p>
  <a href="#">
    <span>内联</span>  <!-- ✅ p 允许 span，a 透明，所以合法 -->
  </a>
</p>

<div>
  <a href="#">
    <div>块级</div>  <!-- ✅ div 允许 div，a 透明，所以合法 -->
  </a>
</div>

<!-- 但 a 不能包含交互元素 -->
<a href="#">
  <button>按钮</button>  <!-- ❌ a 禁止 Interactive Content -->
</a>
```

**后端类比**：类似于泛型约束的传递。

## 参考资源

- [HTML Living Standard - Content Models](https://html.spec.whatwg.org/multipage/dom.html#content-models)
- [MDN - Content Categories](https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories)
- [W3C HTML Validator](https://validator.w3.org/)
- [HTML5 Doctor - Content Models](http://html5doctor.com/element-index/)
