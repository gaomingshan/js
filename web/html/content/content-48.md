# data-* 属性与 HTML/JS 数据桥接

## 核心概念

`data-*` 是 HTML5 引入的**自定义数据属性**机制，允许在 HTML 元素上存储任意键值对数据，通过 JavaScript 的 `dataset` API 读写。它是 HTML 与 JS 之间最轻量的数据传递通道。

**后端类比**：
- `data-*` 属性 ≈ HTTP 响应头中的自定义头（`X-*`）
- SSR 中的 `data-*` ≈ 响应体内嵌的元数据
- `dataset` API ≈ 从请求/响应中提取自定义字段的工具方法

## 命名规范与 dataset API

### 命名规则

```html
<!-- HTML 属性：小写字母 + 连字符 -->
<div
  data-user-id="42"
  data-role="admin"
  data-is-active="true"
  data-created-at="2024-01-15"
  data-api-endpoint="/api/users"
>
</div>
```

**规则**：
- 前缀必须是 `data-`
- 后面的名称只能包含小写字母、数字、连字符（`-`）、点（`.`）、冒号（`:`）、下划线（`_`）
- 不能以 `xml` 开头

### dataset API：连字符到驼峰的映射

```javascript
const el = document.querySelector('[data-user-id]');

// 读取：连字符命名 → 驼峰命名
el.dataset.userId;        // "42"       ← data-user-id
el.dataset.role;          // "admin"    ← data-role
el.dataset.isActive;      // "true"     ← data-is-active
el.dataset.createdAt;     // "2024-01-15" ← data-created-at
el.dataset.apiEndpoint;   // "/api/users" ← data-api-endpoint

// 写入
el.dataset.userId = "100";
// HTML 变为：data-user-id="100"

// 删除
delete el.dataset.role;
// data-role 属性被移除

// 检查是否存在
'userId' in el.dataset;  // true
```

**映射规则**：
- HTML `data-user-id` → JS `dataset.userId`
- HTML `data-api-endpoint` → JS `dataset.apiEndpoint`
- 每个连字符后的字母大写，连字符本身移除

### 与 getAttribute 的对比

```javascript
// 方式 1：dataset API（推荐）
el.dataset.userId;              // "42"
el.dataset.userId = "100";

// 方式 2：getAttribute / setAttribute
el.getAttribute('data-user-id');          // "42"
el.setAttribute('data-user-id', '100');

// 方式 3：CSS 中使用
// [data-role="admin"] { color: red; }
```

`dataset` 更简洁，但**值始终是字符串**，需要手动类型转换：

```javascript
// ❌ dataset 返回的都是字符串
el.dataset.isActive;          // "true"（字符串，非布尔值）
el.dataset.userId;            // "42"（字符串，非数字）

// ✅ 手动转换
const isActive = el.dataset.isActive === 'true';
const userId = Number(el.dataset.userId);
const config = JSON.parse(el.dataset.config);
```

## 典型应用模式

### 模式 1：SSR 数据注入

后端渲染 HTML 时，将数据嵌入到元素的 `data-*` 属性中，前端 JS 读取使用。

```html
<!-- 后端模板输出 -->
<div id="app"
  data-user='{"id":42,"name":"张三","role":"admin"}'
  data-csrf-token="abc123"
  data-api-base="https://api.example.com"
  data-feature-flags='{"newDashboard":true,"darkMode":false}'
>
  <!-- 前端应用挂载点 -->
</div>
```

```javascript
// 前端读取
const app = document.getElementById('app');
const user = JSON.parse(app.dataset.user);
const csrfToken = app.dataset.csrfToken;
const apiBase = app.dataset.apiBase;
const features = JSON.parse(app.dataset.featureFlags);

console.log(user.name);           // "张三"
console.log(features.newDashboard); // true
```

**后端代码**：

```javascript
// Express + EJS
app.get('/', (req, res) => {
  res.render('index', {
    userData: JSON.stringify(req.user),
    csrfToken: req.csrfToken(),
    apiBase: process.env.API_BASE,
    featureFlags: JSON.stringify(getFeatureFlags(req.user)),
  });
});
```

```html
<!-- EJS 模板 -->
<div id="app"
  data-user="<%= userData %>"
  data-csrf-token="<%= csrfToken %>"
  data-api-base="<%= apiBase %>"
  data-feature-flags="<%= featureFlags %>"
>
</div>
```

**安全注意**：JSON 数据写入 HTML 属性时，必须转义 HTML 特殊字符（`<`、`>`、`&`、`"`），否则可能引发 XSS。

### 模式 2：配置传递

```html
<!-- 轮播图组件配置 -->
<div class="carousel"
  data-autoplay="true"
  data-interval="5000"
  data-pause-on-hover="true"
  data-slides-per-view="3"
>
  <div class="slide">...</div>
  <div class="slide">...</div>
</div>
```

```javascript
// 通用组件初始化
document.querySelectorAll('.carousel').forEach(el => {
  new Carousel(el, {
    autoplay: el.dataset.autoplay === 'true',
    interval: Number(el.dataset.interval) || 3000,
    pauseOnHover: el.dataset.pauseOnHover !== 'false',
    slidesPerView: Number(el.dataset.slidesPerView) || 1,
  });
});
```

这种模式常见于 jQuery 插件和非 SPA 项目中，HTML 作为配置载体，JavaScript 读取配置并初始化组件。

### 模式 3：事件委托与上下文传递

```html
<ul class="user-list">
  <li data-user-id="1" data-user-name="张三">
    <span>张三</span>
    <button class="edit-btn">编辑</button>
    <button class="delete-btn">删除</button>
  </li>
  <li data-user-id="2" data-user-name="李四">
    <span>李四</span>
    <button class="edit-btn">编辑</button>
    <button class="delete-btn">删除</button>
  </li>
</ul>
```

```javascript
// 事件委托：在父元素上监听，通过 data-* 获取上下文
document.querySelector('.user-list').addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  const userId = li.dataset.userId;
  const userName = li.dataset.userName;

  if (e.target.matches('.edit-btn')) {
    editUser(userId, userName);
  } else if (e.target.matches('.delete-btn')) {
    deleteUser(userId, userName);
  }
});
```

**优势**：不需要为每个按钮单独绑定事件和传参，数据存储在 DOM 结构中，通过冒泡机制向上查找。

### 模式 4：CSS 驱动的条件样式

```html
<div class="card" data-status="active">激活中</div>
<div class="card" data-status="pending">待审核</div>
<div class="card" data-status="disabled">已禁用</div>

<div class="badge" data-priority="high">紧急</div>
<div class="badge" data-priority="medium">中等</div>
<div class="badge" data-priority="low">普通</div>
```

```css
/* CSS 属性选择器 */
.card[data-status="active"]   { border-color: #10b981; }
.card[data-status="pending"]  { border-color: #f59e0b; }
.card[data-status="disabled"] { border-color: #6b7280; }

.badge[data-priority="high"]   { background: #ef4444; color: white; }
.badge[data-priority="medium"] { background: #f59e0b; color: white; }
.badge[data-priority="low"]    { background: #e5e7eb; color: #374151; }

/* 使用 attr() 在 CSS 中读取 data 值（有限支持） */
.tooltip::after {
  content: attr(data-tooltip);
}
```

```html
<!-- CSS 工具提示 -->
<span class="tooltip" data-tooltip="这是一段提示文本">悬停查看</span>
```

### 模式 5：埋点与数据追踪

```html
<!-- 点击追踪 -->
<button data-track="click" data-track-event="signup" data-track-source="header">
  注册
</button>

<a href="/pricing" data-track="click" data-track-event="view_pricing" data-track-source="homepage">
  查看价格
</a>

<!-- 曝光追踪 -->
<section data-track="impression" data-track-event="banner_viewed" data-track-banner-id="summer-sale">
  促销横幅
</section>
```

```javascript
// 通用追踪器
document.addEventListener('click', (e) => {
  const trackEl = e.target.closest('[data-track="click"]');
  if (!trackEl) return;

  analytics.track(trackEl.dataset.trackEvent, {
    source: trackEl.dataset.trackSource,
    ...extractTrackData(trackEl.dataset),
  });
});

// 提取所有 data-track-* 属性
function extractTrackData(dataset) {
  const data = {};
  for (const [key, value] of Object.entries(dataset)) {
    if (key.startsWith('track') && key !== 'track' && key !== 'trackEvent') {
      const cleanKey = key.replace('track', '').replace(/^./, c => c.toLowerCase());
      data[cleanKey] = value;
    }
  }
  return data;
}
```

## 在框架中的使用

### React

```jsx
function UserCard({ user }) {
  return (
    // React 支持 data-* 属性直接透传到 DOM
    <div
      className="user-card"
      data-user-id={user.id}
      data-role={user.role}
      data-testid="user-card"  // 测试用
    >
      <h3>{user.name}</h3>
    </div>
  );
}

// 读取
function handleClick(e) {
  const userId = e.currentTarget.dataset.userId;
}
```

**`data-testid`**：React Testing Library 推荐使用 `data-testid` 属性定位测试元素，不依赖 CSS 类名或 DOM 结构。

```javascript
// React Testing Library
const card = screen.getByTestId('user-card');
```

### Vue

```html
<!-- Vue 模板 -->
<template>
  <div
    class="user-card"
    :data-user-id="user.id"
    :data-role="user.role"
  >
    {{ user.name }}
  </div>
</template>

<!-- 读取 -->
<script setup>
function handleClick(event) {
  const userId = event.currentTarget.dataset.userId;
}
</script>
```

### 框架中的使用建议

- **组件间数据传递** → 用 props / state / context，不要用 data-*
- **DOM 层面的标记**（测试、追踪、CSS 钩子） → 用 data-*
- **SSR 初始数据注入** → 用 data-* 或 `<script type="application/json">`

## `<script type="application/json">` 替代方案

对于大量数据，data-* 属性不如内联 JSON 方便：

```html
<!-- 大量配置数据：用 script 标签嵌入 -->
<script id="page-data" type="application/json">
{
  "user": { "id": 42, "name": "张三" },
  "permissions": ["read", "write", "admin"],
  "config": {
    "theme": "dark",
    "language": "zh-CN",
    "pageSize": 20
  }
}
</script>
```

```javascript
const pageData = JSON.parse(
  document.getElementById('page-data').textContent
);
```

**对比**：

| 方式 | 适用场景 | 优势 | 劣势 |
|------|---------|------|------|
| `data-*` | 单个元素的少量属性 | 与 DOM 绑定、CSS 可读 | 只能存字符串、大数据不方便 |
| `<script type="json">` | 页面级大量数据 | 支持复杂结构、无需转义 | 与 DOM 元素无关联 |
| `window.__DATA__` | SSR 框架常用 | 直接可用 JS 对象 | 全局污染、XSS 风险 |

## 微数据（Microdata）

### 与 data-* 的区别

`data-*` 是自定义数据，仅供自己的 JS 使用。**微数据**（Microdata）是标准化的语义标注，供搜索引擎等外部消费方使用。

```html
<!-- data-*：自定义，仅内部使用 -->
<div data-product-id="123">...</div>

<!-- Microdata：标准化，搜索引擎可识别 -->
<div itemscope itemtype="https://schema.org/Product">
  <span itemprop="name">机械键盘</span>
  <span itemprop="price">599</span>
</div>
```

### 微数据属性

| 属性 | 作用 |
|------|------|
| `itemscope` | 定义一个数据项的作用域 |
| `itemtype` | 数据项的类型（Schema.org URL） |
| `itemprop` | 属性名 |
| `itemid` | 全局标识符 |

### 示例：产品信息

```html
<article itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Cherry MX Board 3.0S</h1>
  
  <img itemprop="image" src="keyboard.jpg" alt="键盘产品图">
  
  <p itemprop="description">
    87 键红轴机械键盘，USB-C 接口，PBT 键帽
  </p>
  
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price" content="599">¥599</span>
    <meta itemprop="priceCurrency" content="CNY">
    <link itemprop="availability" href="https://schema.org/InStock">
    <span>有货</span>
  </div>
  
  <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
    评分：<span itemprop="ratingValue">4.8</span> / 5
    （<span itemprop="reviewCount">256</span> 条评价）
  </div>
</article>
```

**注意**：现代项目更推荐使用 JSON-LD（详见附录 I），因为 JSON-LD 与 HTML 结构解耦，维护更方便。微数据适用于标记与 HTML 结构紧密耦合的场景。

## 常见误区

### 误区 1：用 data-* 存储大量数据

```html
<!-- ❌ 数据量大时属性值过长，影响可读性和性能 -->
<div data-items='[{"id":1,"name":"...","desc":"..."},{"id":2,...},...]'>
</div>

<!-- ✅ 大量数据用 script 标签 -->
<script id="items-data" type="application/json">
[{"id":1,"name":"..."},{"id":2,...}]
</script>
```

### 误区 2：用 data-* 替代语义属性

```html
<!-- ❌ 应该用原生语义属性 -->
<img data-alt="照片描述" src="photo.jpg">
<a data-href="/about">关于</a>
<input data-required="true">

<!-- ✅ 使用原生属性 -->
<img alt="照片描述" src="photo.jpg">
<a href="/about">关于</a>
<input required>
```

### 误区 3：忽略类型转换

```javascript
// ❌ dataset 值是字符串，直接比较
if (el.dataset.count > 10) { }       // "5" > 10 → false（字符串比较）
if (el.dataset.isActive) { }          // "false" 是 truthy！

// ✅ 显式转换
if (Number(el.dataset.count) > 10) { }
if (el.dataset.isActive === 'true') { }
```

### 误区 4：在 data-* 中存储敏感信息

```html
<!-- ❌ 用户可通过开发者工具查看 -->
<div data-api-key="sk-abc123" data-user-token="jwt-xyz">
</div>

<!-- ✅ 敏感信息通过 HTTP-only Cookie 或服务端 API 传递 -->
```

**原则**：`data-*` 属性在 DOM 中完全可见，不要存储密钥、Token 等敏感数据。

### 误区 5：data-* 命名使用大写

```html
<!-- ❌ 大写字母在 HTML 中会被转为小写 -->
<div data-userId="42"></div>
<!-- 实际变为 data-userid="42" -->
<!-- el.dataset.userid → "42"（不是 userId） -->

<!-- ✅ 使用连字符分隔 -->
<div data-user-id="42"></div>
<!-- el.dataset.userId → "42" -->
```

## 深入一点：性能考量

### data-* vs Map / WeakMap

```javascript
// 方式 1：data-* 存储在 DOM 上
element.dataset.state = 'active';
// 每次读写都是 DOM 操作，有序列化/反序列化开销

// 方式 2：WeakMap 存储在 JS 内存中
const elementData = new WeakMap();
elementData.set(element, { state: 'active', count: 42 });
// 纯 JS 对象操作，无类型转换，元素被 GC 时数据自动回收
```

**选型**：
- 需要 CSS 选择器访问 / HTML 可见 → `data-*`
- 纯 JS 内部使用、频繁读写、复杂数据 → `WeakMap`
- 测试定位 → `data-testid`（始终用 `data-*`）

### DOM 属性 vs JS 变量的性能差异

频繁读写场景下，`dataset` 的性能远低于普通 JS 变量，因为每次操作都涉及 DOM 属性的序列化。对于动画帧、高频事件等场景，应将 data-* 读取结果缓存到 JS 变量中。

```javascript
// ❌ 每帧都读 DOM
function animate() {
  const speed = Number(el.dataset.speed);  // 每帧 DOM 读取
  // ...
  requestAnimationFrame(animate);
}

// ✅ 缓存到变量
const speed = Number(el.dataset.speed);  // 只读一次
function animate() {
  // 使用 speed 变量
  requestAnimationFrame(animate);
}
```

## 参考资源

- [HTML Living Standard - Custom data attributes](https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
- [MDN - Using data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)
- [MDN - HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)
- [Schema.org - Microdata](https://schema.org/docs/gs.html)
- [Google - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
