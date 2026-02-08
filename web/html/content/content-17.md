# HTML 与 CSS/JS 的协作边界

## 核心概念

HTML、CSS、JavaScript 是前端的三大核心技术，各有明确的职责边界。**职责分离**是现代前端架构的基础原则。

```
HTML：结构与内容（What）
CSS：样式与布局（How to display）
JavaScript：行为与交互（How to interact）
```

**后端类比**：
- HTML ≈ 数据模型（Model）
- CSS ≈ 视图模板（View）
- JavaScript ≈ 控制器（Controller）

## HTML 负责结构，CSS 负责样式，JS 负责行为

### 正确的职责划分

```html
<!-- ✅ 正确：职责清晰 -->
<!-- HTML：结构 -->
<article class="post">
  <h2 class="post-title">文章标题</h2>
  <p class="post-content">文章内容</p>
  <button class="post-like" data-post-id="123">点赞</button>
</article>

<!-- CSS：样式 -->
<style>
.post {
  padding: 20px;
  border: 1px solid #ddd;
}
.post-title {
  font-size: 24px;
  color: #333;
}
.post-like {
  background: #007bff;
  color: white;
}
</style>

<!-- JavaScript：行为 -->
<script>
document.querySelector('.post-like').addEventListener('click', (e) => {
  const postId = e.target.dataset.postId;
  likePost(postId);
});
</script>
```

### 错误的职责混淆

```html
<!-- ❌ 错误：职责混乱 -->
<!-- 样式内联在 HTML -->
<div style="padding: 20px; border: 1px solid #ddd;">
  <h2 style="font-size: 24px; color: #333;">文章标题</h2>
  <!-- 行为内联在 HTML -->
  <button onclick="alert('点赞')">点赞</button>
</div>

<!-- JavaScript 直接操作样式 -->
<script>
element.style.fontSize = '24px';
element.style.color = '#333';
element.style.padding = '20px';
</script>
```

**问题**：
1. 可维护性差
2. 样式难以复用
3. 代码耦合严重

**后端类比**：类似于 MVC 模式的职责分离。

## 职责混乱的典型问题

### 问题 1：用 JavaScript 控制样式

```javascript
// ❌ 错误：JS 直接操作样式
element.style.width = '300px';
element.style.height = '200px';
element.style.backgroundColor = 'red';
element.style.border = '1px solid #000';

// ✅ 正确：JS 控制状态，CSS 控制样式
element.classList.add('active');
```

```css
/* CSS 定义样式 */
.active {
  width: 300px;
  height: 200px;
  background-color: red;
  border: 1px solid #000;
}
```

### 问题 2：用 HTML 属性控制样式

```html
<!-- ❌ 错误：HTML 属性控制样式 -->
<div width="300" height="200" bgcolor="red" border="1">
  内容
</div>

<!-- ✅ 正确：HTML 只负责结构，CSS 控制样式 -->
<div class="box">内容</div>
```

```css
.box {
  width: 300px;
  height: 200px;
  background-color: red;
  border: 1px solid #000;
}
```

### 问题 3：内联事件处理

```html
<!-- ❌ 错误：内联事件 -->
<button onclick="handleClick()">点击</button>
<a href="javascript:void(0)" onclick="doSomething()">链接</a>

<!-- ✅ 正确：分离事件处理 -->
<button class="btn" data-action="submit">点击</button>
<a href="#" class="link">链接</a>
```

```javascript
// JavaScript 中绑定事件
document.querySelector('.btn').addEventListener('click', handleClick);
document.querySelector('.link').addEventListener('click', (e) => {
  e.preventDefault();
  doSomething();
});
```

## 样式内联 vs 外部样式表的权衡

### 内联样式

```html
<div style="color: red; font-size: 16px;">内联样式</div>
```

**优点**：
- 优先级最高
- 立即生效
- 适合动态样式

**缺点**：
- 无法复用
- 难以维护
- 影响 HTML 可读性
- 不能使用伪类/伪元素

**使用场景**：
```javascript
// 动态计算的样式
element.style.left = x + 'px';
element.style.top = y + 'px';

// 临时样式（如拖拽）
element.style.transform = `translate(${dx}px, ${dy}px)`;
```

### 外部样式表

```html
<link rel="stylesheet" href="style.css">
```

**优点**：
- 可复用
- 易维护
- 可缓存
- 支持所有 CSS 特性

**缺点**：
- 网络请求
- 阻塞渲染

**使用场景**：大部分样式

### 内部样式表

```html
<style>
.box { color: red; }
</style>
```

**优点**：
- 无网络请求
- 可复用（页面内）

**缺点**：
- 增加 HTML 体积
- 无法跨页面复用

**使用场景**：关键 CSS（首屏）

### 权衡策略

```html
<head>
  <!-- 1. 关键 CSS 内联 -->
  <style>
    .header { background: #333; }
    .hero { min-height: 500px; }
  </style>
  
  <!-- 2. 完整样式表外部加载 -->
  <link rel="preload" href="main.css" as="style" onload="this.rel='stylesheet'">
</head>

<body>
  <!-- 3. 动态样式使用内联 -->
  <div id="draggable" style="position: absolute;"></div>
  
  <script>
  // JavaScript 控制动态样式
  draggable.style.left = '100px';
  draggable.style.top = '50px';
  </script>
</body>
```

**后端类比**：
- 内联样式 ≈ 硬编码
- 外部样式表 ≈ 配置文件
- 内部样式表 ≈ 局部配置

## 工程实践示例

### 场景 1：状态驱动的样式变化

```html
<!-- HTML：结构 + 状态 -->
<button class="btn" data-state="idle">提交</button>

<!-- CSS：状态样式 -->
<style>
.btn[data-state="idle"] {
  background: #007bff;
  cursor: pointer;
}

.btn[data-state="loading"] {
  background: #6c757d;
  cursor: wait;
}

.btn[data-state="success"] {
  background: #28a745;
  cursor: default;
}

.btn[data-state="error"] {
  background: #dc3545;
  cursor: default;
}
</style>

<!-- JavaScript：状态管理 -->
<script>
const btn = document.querySelector('.btn');

btn.addEventListener('click', async () => {
  btn.dataset.state = 'loading';
  btn.textContent = '提交中...';
  
  try {
    await submitForm();
    btn.dataset.state = 'success';
    btn.textContent = '提交成功';
  } catch (error) {
    btn.dataset.state = 'error';
    btn.textContent = '提交失败';
  }
});
</script>
```

### 场景 2：组件化开发

```html
<!-- 组件：卡片 -->
<article class="card" data-card-id="123">
  <header class="card-header">
    <h3 class="card-title">卡片标题</h3>
  </header>
  <div class="card-body">
    <p class="card-text">卡片内容</p>
  </div>
  <footer class="card-footer">
    <button class="card-action" data-action="like">点赞</button>
    <button class="card-action" data-action="share">分享</button>
  </footer>
</article>

<!-- CSS：组件样式 -->
<style>
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  padding: 16px;
  background: #f8f9fa;
}

.card-title {
  margin: 0;
  font-size: 18px;
}

.card-body {
  padding: 16px;
}

.card-footer {
  padding: 16px;
  border-top: 1px solid #ddd;
}

.card-action {
  margin-right: 8px;
}
</style>

<!-- JavaScript：组件逻辑 -->
<script>
class Card {
  constructor(element) {
    this.element = element;
    this.id = element.dataset.cardId;
    this.bindEvents();
  }
  
  bindEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target.matches('.card-action')) {
        const action = e.target.dataset.action;
        this.handleAction(action);
      }
    });
  }
  
  handleAction(action) {
    switch (action) {
      case 'like':
        this.like();
        break;
      case 'share':
        this.share();
        break;
    }
  }
  
  like() {
    console.log(`点赞卡片 ${this.id}`);
  }
  
  share() {
    console.log(`分享卡片 ${this.id}`);
  }
}

// 初始化所有卡片
document.querySelectorAll('.card').forEach(el => new Card(el));
</script>
```

### 场景 3：响应式设计

```html
<!-- HTML：语义结构 -->
<nav class="main-nav">
  <button class="nav-toggle" aria-label="切换菜单">☰</button>
  <ul class="nav-list">
    <li><a href="/">首页</a></li>
    <li><a href="/about">关于</a></li>
    <li><a href="/contact">联系</a></li>
  </ul>
</nav>

<!-- CSS：响应式样式 -->
<style>
/* 桌面端 */
.nav-toggle {
  display: none;
}

.nav-list {
  display: flex;
  gap: 20px;
}

/* 移动端 */
@media (max-width: 768px) {
  .nav-toggle {
    display: block;
  }
  
  .nav-list {
    display: none;
    flex-direction: column;
  }
  
  .nav-list.active {
    display: flex;
  }
}
</style>

<!-- JavaScript：交互逻辑 -->
<script>
const toggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

toggle.addEventListener('click', () => {
  navList.classList.toggle('active');
});
</script>
```

## 常见误区

### 误区 1：用 div + JS 模拟所有元素

```html
<!-- ❌ 错误：失去语义和原生功能 -->
<div class="button" onclick="submit()">提交</div>
<div class="link" onclick="navigate()">链接</div>

<!-- ✅ 正确：使用原生元素 -->
<button type="submit">提交</button>
<a href="/page">链接</a>
```

### 误区 2：JavaScript 操作大量样式

```javascript
// ❌ 错误：JS 操作样式
element.style.fontSize = '16px';
element.style.color = 'red';
element.style.padding = '10px';
element.style.margin = '5px';

// ✅ 正确：添加 class
element.classList.add('highlighted');
```

```css
.highlighted {
  font-size: 16px;
  color: red;
  padding: 10px;
  margin: 5px;
}
```

### 误区 3：过度使用内联样式

```html
<!-- ❌ 错误：每个元素都内联样式 -->
<div style="padding: 20px; margin: 10px; background: #f0f0f0;">
  <h1 style="font-size: 24px; color: #333;">标题</h1>
  <p style="font-size: 16px; line-height: 1.5;">内容</p>
</div>

<!-- ✅ 正确：使用 CSS 类 -->
<div class="container">
  <h1 class="title">标题</h1>
  <p class="content">内容</p>
</div>
```

## 深入一点：Shadow DOM 的职责边界

### Shadow DOM 封装

```javascript
// 创建 Web Component
class MyCard extends HTMLElement {
  constructor() {
    super();
    
    // 创建 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });
    
    // HTML 结构
    shadow.innerHTML = `
      <style>
        /* 样式封装在 Shadow DOM 内 */
        .card {
          border: 1px solid #ddd;
          padding: 16px;
        }
      </style>
      <div class="card">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('my-card', MyCard);
```

**使用**：
```html
<my-card>
  <h3>卡片标题</h3>
  <p>卡片内容</p>
</my-card>
```

**优势**：
- 样式封装（不影响全局）
- 结构封装（DOM 隔离）
- 行为封装（逻辑独立）

**后端类比**：类似于微服务的边界隔离。

## 参考资源

- [MDN - Separation of Concerns](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML)
- [Web.dev - Separation of Concerns](https://web.dev/separation-of-concerns/)
- [W3C - HTML Design Principles](https://www.w3.org/TR/html-design-principles/)
