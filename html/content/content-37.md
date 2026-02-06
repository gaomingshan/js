# 列表与数据展示

## 核心概念

HTML 提供三种原生列表结构，分别对应不同的数据语义：

| 列表类型 | 标签 | 语义 | 后端类比 |
|---------|------|------|---------|
| 无序列表 | `<ul>` | 项目间无顺序关系 | Set / HashSet |
| 有序列表 | `<ol>` | 项目间有顺序关系 | List / ArrayList |
| 定义列表 | `<dl>` | 键值对/术语-描述 | Map / HashMap |

**选型原则**：根据数据本身的语义选择列表类型，而非视觉效果。

## 无序列表 `<ul>`

### 基本用法

```html
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
```

### 典型应用场景

**导航菜单**：

```html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

为什么导航用 `<ul>` 而非纯 `<a>` 排列？
- 语义明确：这是一组**并列的导航项**
- 可访问性：屏幕阅读器会播报"列表，3 项"，帮助用户预判内容量
- CSS 控制：`<li>` 作为布局单元更灵活

**标签/徽章列表**：

```html
<ul class="tag-list">
  <li><span class="tag">前端</span></li>
  <li><span class="tag">HTML5</span></li>
  <li><span class="tag">语义化</span></li>
</ul>
```

**功能特性列表**：

```html
<section>
  <h2>产品特性</h2>
  <ul>
    <li>支持多语言国际化</li>
    <li>自动生成 API 文档</li>
    <li>实时数据同步</li>
  </ul>
</section>
```

## 有序列表 `<ol>`

### 基本用法与属性

```html
<!-- 基础 -->
<ol>
  <li>注册账号</li>
  <li>完善信息</li>
  <li>开始使用</li>
</ol>

<!-- start：指定起始编号 -->
<ol start="5">
  <li>第五步：部署</li>
  <li>第六步：验证</li>
</ol>

<!-- reversed：倒序 -->
<ol reversed>
  <li>第三名</li>
  <li>第二名</li>
  <li>第一名</li>
</ol>

<!-- type：编号类型 -->
<ol type="A">  <!-- A, a, I, i, 1 -->
  <li>方案 A</li>
  <li>方案 B</li>
</ol>

<!-- li 的 value 属性：指定单项编号 -->
<ol>
  <li>正常编号 1</li>
  <li value="5">跳到编号 5</li>
  <li>继续编号 6</li>
</ol>
```

### 典型应用场景

**步骤流程**：

```html
<section>
  <h2>部署指南</h2>
  <ol>
    <li>
      <h3>环境准备</h3>
      <p>安装 Node.js 18+ 和 npm</p>
    </li>
    <li>
      <h3>克隆仓库</h3>
      <pre><code>git clone https://github.com/example/app.git</code></pre>
    </li>
    <li>
      <h3>安装依赖</h3>
      <pre><code>npm install</code></pre>
    </li>
    <li>
      <h3>启动服务</h3>
      <pre><code>npm run start</code></pre>
    </li>
  </ol>
</section>
```

**排行榜**：

```html
<h2>热门文章</h2>
<ol>
  <li><a href="/post/1">深入理解 HTTP/2</a> — 阅读 12.3k</li>
  <li><a href="/post/2">Docker 实战指南</a> — 阅读 9.8k</li>
  <li><a href="/post/3">微服务架构设计</a> — 阅读 8.5k</li>
</ol>
```

**面包屑导航**（有序路径）：

```html
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/docs">文档</a></li>
    <li aria-current="page">快速开始</li>
  </ol>
</nav>
```

## 定义列表 `<dl>`

### 基本结构

```html
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言，用于构建网页文档结构</dd>

  <dt>CSS</dt>
  <dd>层叠样式表，用于控制文档的视觉表现</dd>
</dl>
```

`<dt>`（Definition Term）是术语/键，`<dd>`（Definition Description）是描述/值。一个 `<dt>` 可以对应多个 `<dd>`，反之亦然。

### 典型应用场景

**元数据展示**（最常见的实战场景）：

```html
<!-- 用户信息卡片 -->
<dl class="user-profile">
  <dt>用户名</dt>
  <dd>zhangsan</dd>

  <dt>邮箱</dt>
  <dd>zhangsan@example.com</dd>

  <dt>角色</dt>
  <dd>管理员</dd>
  <dd>编辑</dd>  <!-- 一个键对应多个值 -->

  <dt>注册时间</dt>
  <dd><time datetime="2024-01-01">2024 年 1 月 1 日</time></dd>
</dl>
```

**后端类比**：`<dl>` 完美对应 JSON 对象的键值对展示。

```
JSON 数据：                  HTML 展示：
{                            <dl>
  "username": "zhangsan",      <dt>用户名</dt>
  "email": "...",              <dd>zhangsan</dd>
  "roles": ["管理员","编辑"]    <dt>角色</dt>
}                              <dd>管理员</dd><dd>编辑</dd>
                             </dl>
```

**FAQ / 问答**：

```html
<section>
  <h2>常见问题</h2>
  <dl>
    <dt>如何重置密码？</dt>
    <dd>访问登录页面，点击"忘记密码"链接，按照邮件提示操作。</dd>

    <dt>支持哪些支付方式？</dt>
    <dd>支持微信支付、支付宝和银行卡。</dd>
  </dl>
</section>
```

**商品规格参数**：

```html
<dl class="product-specs">
  <dt>CPU</dt>
  <dd>Apple M3 Pro</dd>

  <dt>内存</dt>
  <dd>18GB 统一内存</dd>

  <dt>存储</dt>
  <dd>512GB SSD</dd>

  <dt>屏幕</dt>
  <dd>14.2 英寸 Liquid Retina XDR</dd>
</dl>
```

## 嵌套列表

### 多级导航菜单

```html
<nav>
  <ul>
    <li>
      <a href="/products">产品</a>
      <ul>
        <li><a href="/products/web">Web 应用</a></li>
        <li>
          <a href="/products/mobile">移动应用</a>
          <ul>
            <li><a href="/products/mobile/ios">iOS</a></li>
            <li><a href="/products/mobile/android">Android</a></li>
          </ul>
        </li>
      </ul>
    </li>
    <li><a href="/pricing">价格</a></li>
    <li><a href="/docs">文档</a></li>
  </ul>
</nav>
```

**嵌套规则**：子列表（`<ul>` / `<ol>`）必须放在 `<li>` 内部，不能直接放在父列表下。

```html
<!-- ❌ 错误 -->
<ul>
  <li>项目 A</li>
  <ul>
    <li>子项</li>
  </ul>
</ul>

<!-- ✅ 正确 -->
<ul>
  <li>
    项目 A
    <ul>
      <li>子项</li>
    </ul>
  </li>
</ul>
```

### 目录结构

```html
<nav aria-label="目录">
  <ol>
    <li>
      <a href="#ch1">第一章：基础概念</a>
      <ol>
        <li><a href="#ch1-1">1.1 什么是 HTML</a></li>
        <li><a href="#ch1-2">1.2 文档结构</a></li>
      </ol>
    </li>
    <li>
      <a href="#ch2">第二章：标签系统</a>
      <ol>
        <li><a href="#ch2-1">2.1 内容模型</a></li>
        <li><a href="#ch2-2">2.2 语义化标签</a></li>
      </ol>
    </li>
  </ol>
</nav>
```

## 列表的 CSS 样式控制

### 去除默认样式

```css
/* 导航菜单的通用重置 */
ul.nav-menu {
  list-style: none;   /* 去掉圆点 */
  padding: 0;          /* 去掉缩进 */
  margin: 0;
}
```

### 自定义列表标记

```css
/* CSS 计数器（自定义有序列表） */
ol.custom-counter {
  list-style: none;
  counter-reset: step;
}

ol.custom-counter li {
  counter-increment: step;
}

ol.custom-counter li::before {
  content: "Step " counter(step) ": ";
  font-weight: bold;
  color: #3b82f6;
}

/* 使用 ::marker 伪元素（现代方案） */
li::marker {
  color: #3b82f6;
  font-size: 1.2em;
}

/* 使用 @counter-style 自定义编号格式 */
@counter-style chinese {
  system: fixed;
  symbols: "一" "二" "三" "四" "五" "六" "七" "八" "九" "十";
  suffix: "、";
}
ol.chinese-list {
  list-style: chinese;
}
```

### 横向列表（水平排列）

```css
/* Flexbox 水平导航 */
ul.horizontal {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

/* Grid 标签列表 */
ul.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
}
```

## 常见误区与反模式

### 误区 1：用 div 模拟列表

```html
<!-- ❌ 反模式 -->
<div class="list">
  <div class="list-item">项目 A</div>
  <div class="list-item">项目 B</div>
  <div class="list-item">项目 C</div>
</div>

<!-- ✅ 正确 -->
<ul>
  <li>项目 A</li>
  <li>项目 B</li>
  <li>项目 C</li>
</ul>
```

**为什么不能用 div**：
- 屏幕阅读器无法识别为列表，不会播报"列表，3 项"
- 丢失键盘导航语义
- 搜索引擎无法理解内容结构

### 误区 2：列表内嵌套非法元素

```html
<!-- ❌ ul 的直接子元素只能是 li -->
<ul>
  <div>不合法的子元素</div>
  <li>合法</li>
</ul>

<!-- ❌ ol 同理 -->
<ol>
  <p>不合法</p>
  <li>合法</li>
</ol>

<!-- ✅ 额外内容应放在 li 内部 -->
<ul>
  <li>
    <div>这样是合法的</div>
  </li>
</ul>
```

### 误区 3：滥用列表

```html
<!-- ❌ 单个项目不需要列表 -->
<ul>
  <li>只有一个项目</li>
</ul>

<!-- ❌ 纯样式目的不需要列表 -->
<ul>
  <li>这不是列表数据，只是想要缩进效果</li>
</ul>

<!-- ✅ 判断标准：数据本身是否具有集合语义 -->
```

### 误区 4：有序与无序混淆

```html
<!-- ❌ 步骤有明确顺序，不应用 ul -->
<h2>安装步骤</h2>
<ul>
  <li>下载安装包</li>
  <li>运行安装程序</li>
  <li>配置参数</li>
</ul>

<!-- ✅ 有顺序的步骤用 ol -->
<h2>安装步骤</h2>
<ol>
  <li>下载安装包</li>
  <li>运行安装程序</li>
  <li>配置参数</li>
</ol>
```

## 工程实践

### 场景 1：后端数据渲染列表

```javascript
// Node.js / Express 模板渲染
function renderUserList(users) {
  if (users.length === 0) {
    return '<p>暂无用户数据</p>';
  }
  
  return `
    <ul class="user-list">
      ${users.map(user => `
        <li>
          <dl>
            <dt>用户名</dt>
            <dd>${escapeHtml(user.name)}</dd>
            <dt>邮箱</dt>
            <dd>${escapeHtml(user.email)}</dd>
          </dl>
        </li>
      `).join('')}
    </ul>
  `;
}
```

### 场景 2：Vue / React 中的列表渲染

```jsx
// React
function TodoList({ items }) {
  return (
    <ol>
      {items.map(item => (
        <li key={item.id}>
          {item.title}
        </li>
      ))}
    </ol>
  );
}
```

```html
<!-- Vue -->
<ol>
  <li v-for="item in items" :key="item.id">
    {{ item.title }}
  </li>
</ol>
```

**关键点**：框架中 `key` 用于虚拟 DOM diff，HTML 层面仍需保证正确的列表语义。

### 场景 3：响应式导航菜单

```html
<nav>
  <ul class="nav-menu">
    <li><a href="/" aria-current="page">首页</a></li>
    <li>
      <button aria-expanded="false" aria-controls="sub-products">
        产品
      </button>
      <ul id="sub-products" hidden>
        <li><a href="/products/a">产品 A</a></li>
        <li><a href="/products/b">产品 B</a></li>
      </ul>
    </li>
    <li><a href="/contact">联系我们</a></li>
  </ul>
</nav>
```

注意：下拉子菜单使用 `<button>` 触发而非 `<a>`，因为它不是导航链接，而是交互控件。配合 `aria-expanded` 和 `aria-controls` 保障可访问性。

## 深入一点：列表与可访问性

### 屏幕阅读器如何处理列表

| 元素 | 屏幕阅读器播报 |
|------|--------------|
| `<ul>` 开始 | "列表，X 项" |
| `<ol>` 开始 | "列表，X 项" |
| `<li>` | "第 N 项，内容..." |
| 嵌套 `<ul>` | "列表，嵌套，X 项" |
| `<dl>` | "定义列表" |
| `<dt>` | "术语：内容" |
| `<dd>` | "定义：内容" |

### role 属性与列表语义

```html
<!-- list-style: none 在部分浏览器（Safari）中会移除列表语义 -->
<!-- 需要显式恢复 -->
<ul role="list" style="list-style: none;">
  <li>项目 A</li>
  <li>项目 B</li>
</ul>
```

这是一个已知的 Safari 行为：当 `list-style: none` 时，VoiceOver 不再将其播报为列表。添加 `role="list"` 可以恢复语义。

## 参考资源

- [HTML Living Standard - Grouping Content](https://html.spec.whatwg.org/multipage/grouping-content.html)
- [MDN - `<ul>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul)
- [MDN - `<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol)
- [MDN - `<dl>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl)
- [Scott O'Hara - "Fixing" Lists](https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html)
