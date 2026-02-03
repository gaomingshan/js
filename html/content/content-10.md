# HTML 解析器工作原理

## 核心概念

HTML 解析器是浏览器的核心组件，负责将 HTML 字符串转换为 DOM 树。理解解析过程对于优化性能、处理 SSR、调试渲染问题至关重要。

```
输入：HTML 字符串
<!DOCTYPE html><html><body><h1>Hello</h1></body></html>

输出：DOM 树
Document
└── html
    └── body
        └── h1
            └── "Hello"
```

**后端类比**：
- HTML 解析 ≈ JSON 反序列化
- DOM 树 ≈ 内存对象图
- 解析器 ≈ 编译器前端

## 字节流 → Token → DOM Tree 的转换过程

### 阶段 1：字节流 → 字符流

```
原始数据（网络传输）：
3C 21 44 4F 43 54 59 50 45 20 68 74 6D 6C 3E

↓ 字符编码解码（UTF-8）

字符流：
<!DOCTYPE html>
```

**关键点**：
- `<meta charset="UTF-8">` 必须在前 1024 字节
- 编码错误导致乱码

**后端类比**：类似于从网络字节流解码为字符串。

### 阶段 2：字符流 → Token 流

**词法分析**（Tokenization）：

```html
输入：<html><head><title>页面</title></head></html>

Token 流：
1. StartTag: html
2. StartTag: head
3. StartTag: title
4. Character: 页面
5. EndTag: title
6. EndTag: head
7. EndTag: html
```

**Token 类型**：
- StartTag：`<tagname>`
- EndTag：`</tagname>`
- Character：文本内容
- Comment：`<!-- -->`
- DOCTYPE：`<!DOCTYPE>`

**后端类比**：类似于编译器的词法分析（Lexer）。

### 阶段 3：Token 流 → DOM 树

**语法分析**（Parsing）：

```javascript
// 简化的解析逻辑
function parseHTML(tokens) {
  const root = document.createElement('html');
  let current = root;
  const stack = [root];
  
  for (const token of tokens) {
    if (token.type === 'StartTag') {
      const element = document.createElement(token.name);
      current.appendChild(element);
      stack.push(element);
      current = element;
    } else if (token.type === 'EndTag') {
      stack.pop();
      current = stack[stack.length - 1];
    } else if (token.type === 'Character') {
      const textNode = document.createTextNode(token.data);
      current.appendChild(textNode);
    }
  }
  
  return root;
}
```

**后端类比**：类似于语法树（AST）构建。

## 解析器的容错机制

### 自动修复常见错误

#### 1. 缺少闭合标签

```html
<!-- 输入 -->
<p>段落 1
<p>段落 2

<!-- 解析为 -->
<p>段落 1</p>
<p>段落 2</p>
```

#### 2. 错误的嵌套

```html
<!-- 输入：p 中嵌套 div -->
<p>文字<div>块级</div>继续</p>

<!-- 解析为 -->
<p>文字</p>
<div>块级</div>
<p>继续</p>
```

#### 3. 缺少必需标签

```html
<!-- 输入 -->
<html>
<body>内容</body>
</html>

<!-- 解析为（自动添加 head） -->
<html>
<head></head>
<body>内容</body>
</html>
```

### 容错规则

**原则**：尽最大努力渲染内容

```html
<!-- 极端错误的 HTML -->
<html>
<body>
<h1>标题
<p>段落
<div>
<span>文字

<!-- 浏览器仍能解析并显示 -->
```

**后端类比**：类似于 JSON 解析器的宽松模式。

## 解析阻塞：script 与 link 的影响

### script 标签的阻塞行为

#### 1. 同步脚本（默认）

```html
<body>
  <h1>标题</h1>
  
  <script src="app.js"></script>
  <!-- 解析暂停，等待下载和执行 -->
  
  <p>段落</p>
  <!-- 脚本执行完才能看到 -->
</body>
```

**执行流程**：
```
1. 解析 <h1>，添加到 DOM
2. 遇到 <script>
3. 暂停 HTML 解析
4. 下载 app.js
5. 执行 app.js
6. 恢复 HTML 解析
7. 解析 <p>，添加到 DOM
```

**为什么阻塞**：JavaScript 可能修改 DOM（如 `document.write()`）

#### 2. async 脚本

```html
<script src="app.js" async></script>
<!-- 不阻塞解析，下载完立即执行 -->
```

**特点**：
- 异步下载
- 下载完立即执行（此时可能阻塞）
- 执行顺序不确定

**使用场景**：独立的脚本（如统计代码）

#### 3. defer 脚本

```html
<script src="app.js" defer></script>
<!-- 不阻塞解析，DOMContentLoaded 前执行 -->
```

**特点**：
- 异步下载
- DOM 解析完成后执行
- 保持顺序

**使用场景**：依赖 DOM 的脚本

#### 对比表

| 类型 | 下载 | 执行时机 | 阻塞解析 | 执行顺序 |
|------|------|---------|---------|---------|
| 同步 | 阻塞 | 立即 | 是 | 顺序 |
| async | 并行 | 下载完 | 执行时阻塞 | 不确定 |
| defer | 并行 | DOM完成后 | 否 | 顺序 |

**后端类比**：
- 同步 ≈ 同步 I/O
- async ≈ 异步非阻塞 I/O
- defer ≈ 延迟任务队列

### link 标签的阻塞行为

#### CSS 的阻塞特性

```html
<head>
  <link rel="stylesheet" href="style.css">
  <!-- 不阻塞 HTML 解析 -->
  <!-- 但阻塞渲染 -->
</head>
```

**关键点**：
- CSS **不阻塞** HTML 解析
- CSS **阻塞**渲染（避免 FOUC）
- CSS **阻塞**后续 `<script>` 执行

**执行流程**：
```
1. 解析 HTML（继续）
2. 下载 CSS（并行）
3. 构建 DOM（继续）
4. 等待 CSS 下载完成
5. 构建 CSSOM
6. 合并生成渲染树
7. 渲染页面
```

#### preload 优化

```html
<link rel="preload" href="style.css" as="style">
<!-- 提前告知浏览器需要该资源 -->
```

**后端类比**：类似于数据库连接池预热。

## 工程实践示例

### 场景 1：优化脚本加载

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>优化示例</title>
  
  <!-- 关键 CSS 内联 -->
  <style>
    body { margin: 0; }
    .header { background: #333; }
  </style>
  
  <!-- 非关键 CSS 延迟加载 -->
  <link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
</head>
<body>
  <header class="header">头部</header>
  <main>内容</main>
  
  <!-- JavaScript 放底部或使用 defer -->
  <script src="app.js" defer></script>
</body>
</html>
```

### 场景 2：SSR 流式渲染

```javascript
// Node.js
app.get('/page', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  
  // 立即发送头部
  res.write(`
    <!DOCTYPE html>
    <html>
    <head><title>页面</title></head>
    <body>
      <header>网站头部</header>
  `);
  
  // 异步查询数据
  fetchData().then(data => {
    res.write(`
      <main>${data}</main>
    `);
    
    res.write(`
      <footer>页脚</footer>
    </body>
    </html>
    `);
    
    res.end();
  });
});
```

**优势**：用户快速看到头部，减少感知延迟。

### 场景 3：监控解析性能

```javascript
// 使用 Performance API
window.addEventListener('load', () => {
  const perfData = performance.timing;
  
  const metrics = {
    // HTML 解析时间
    domParsing: perfData.domInteractive - perfData.domLoading,
    
    // DOM 构建完成
    domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
    
    // 完全加载
    load: perfData.loadEventEnd - perfData.navigationStart
  };
  
  console.table(metrics);
});
```

## 常见误区

### 误区 1：认为 HTML 必须完全下载才能解析

**错误理解**：浏览器等待整个 HTML 下载完成再解析。

**正确认知**：浏览器**流式解析**，边下载边解析。

### 误区 2：script 放在 head 不影响性能

**错误做法**：

```html
<head>
  <script src="huge.js"></script>
  <!-- 阻塞整个页面渲染 -->
</head>
```

**正确做法**：

```html
<head>
  <script src="app.js" defer></script>
  <!-- 或放在 body 底部 -->
</head>
```

### 误区 3：CSS 不影响页面加载

**错误理解**：CSS 只影响样式，不影响加载。

**正确认知**：CSS **阻塞渲染**，影响首屏时间。

## 深入一点：浏览器的多进程架构

### Chrome 的进程模型

```
浏览器主进程
├── 网络进程（下载资源）
├── 渲染进程（解析 HTML、执行 JS）
│   ├── 主线程：HTML 解析、JS 执行
│   ├── 合成线程：图层合成
│   └── 光栅化线程池：生成位图
└── GPU 进程（硬件加速）
```

### 解析在主线程

**为什么在同一线程**：
- JavaScript 可以修改 DOM
- 避免竞态条件

**后端类比**：类似于单线程的事件循环（Node.js）。

## 参考资源

- [HTML Living Standard - Parsing](https://html.spec.whatwg.org/multipage/parsing.html)
- [Chrome - How Blink Works](https://docs.google.com/document/d/1aitSOucL0VHZa9Z2vbRJSyAIsAz24kX8LFByQ5xQnUg)
- [Web.dev - Critical Rendering Path](https://web.dev/critical-rendering-path/)
