# 无障碍（Accessibility）实战

## 核心概念

无障碍（Accessibility，简称 A11y）是指让**所有人**——包括视觉、听觉、运动、认知障碍用户——都能使用 Web 内容。这不仅是道德要求，在许多国家也是法律要求。

**后端类比**：
- A11y ≈ API 的向后兼容性（确保所有客户端都能正常使用）
- ARIA 属性 ≈ API 文档注解（为消费方提供额外语义信息）
- 焦点管理 ≈ 请求路由（确保用户操作到达正确的处理器）
- 屏幕阅读器 ≈ API 的命令行客户端（只能处理结构化数据，无法"看到"界面）

## ARIA 属性体系

### 什么是 ARIA

ARIA（Accessible Rich Internet Applications）是 W3C 标准，为 HTML 元素添加额外的语义信息，帮助辅助技术理解页面内容。

**第一原则**：优先使用原生 HTML 语义，ARIA 是补充而非替代。

```html
<!-- ❌ 用 div + ARIA 模拟按钮 -->
<div role="button" tabindex="0" aria-label="提交">提交</div>

<!-- ✅ 直接用原生按钮 -->
<button type="submit">提交</button>
```

原生元素自带语义、键盘交互、焦点管理，ARIA 只提供语义标注，不提供行为。

### role：元素角色

当无法使用原生语义标签时，用 `role` 定义元素的角色：

```html
<!-- 地标角色（Landmark Roles） -->
<div role="banner">       <!-- 等价于 <header>（顶层） -->
<div role="navigation">   <!-- 等价于 <nav> -->
<div role="main">          <!-- 等价于 <main> -->
<div role="complementary"> <!-- 等价于 <aside> -->
<div role="contentinfo">   <!-- 等价于 <footer>（顶层） -->
<div role="search">        <!-- 搜索区域（HTML 无原生等价） -->

<!-- 组件角色 -->
<div role="button">        <!-- 按钮 -->
<div role="dialog">        <!-- 对话框 -->
<div role="alert">         <!-- 警告消息 -->
<div role="alertdialog">   <!-- 需要确认的警告 -->
<div role="tablist">       <!-- 标签页容器 -->
<div role="tab">           <!-- 标签页 -->
<div role="tabpanel">      <!-- 标签页内容 -->
<div role="tooltip">       <!-- 工具提示 -->
<div role="progressbar">   <!-- 进度条 -->
<div role="slider">        <!-- 滑块 -->
<div role="menu">          <!-- 菜单 -->
<div role="menuitem">      <!-- 菜单项 -->
```

### aria-label / aria-labelledby / aria-describedby

**aria-label**：直接提供标签文本（不可见）

```html
<!-- 图标按钮（无可见文本） -->
<button aria-label="关闭对话框">
  <svg><!-- X 图标 --></svg>
</button>

<!-- 搜索框 -->
<input type="search" aria-label="搜索文章">

<!-- 导航区分 -->
<nav aria-label="主导航">...</nav>
<nav aria-label="页脚导航">...</nav>
```

**aria-labelledby**：引用其他元素作为标签

```html
<h2 id="section-title">用户设置</h2>
<form aria-labelledby="section-title">
  <!-- 屏幕阅读器：表单"用户设置" -->
</form>

<!-- 多个标签组合 -->
<span id="prefix">删除用户</span>
<span id="username">张三</span>
<button aria-labelledby="prefix username">删除</button>
<!-- 屏幕阅读器：按钮"删除用户 张三" -->
```

**aria-describedby**：提供补充描述

```html
<label for="password">密码</label>
<input type="password" id="password" aria-describedby="pwd-help pwd-error">
<p id="pwd-help">至少 8 个字符，包含大小写和数字</p>
<p id="pwd-error" role="alert" hidden>密码不符合要求</p>
```

区别：`aria-labelledby` 是名称（"这是什么"），`aria-describedby` 是描述（"关于它的更多信息"）。

### aria-hidden：对辅助技术隐藏

```html
<!-- 装饰性图标：对屏幕阅读器隐藏 -->
<button>
  <svg aria-hidden="true"><!-- 图标 --></svg>
  提交
</button>

<!-- 装饰性分隔线 -->
<hr aria-hidden="true">

<!-- 背景装饰 -->
<div class="decorative-pattern" aria-hidden="true"></div>
```

**注意**：`aria-hidden="true"` 会隐藏元素及其**所有后代**。不要用在可聚焦元素上。

```html
<!-- ❌ 危险：隐藏了可聚焦元素 -->
<div aria-hidden="true">
  <button>这个按钮可聚焦但不可见，造成混乱</button>
</div>
```

### aria-live：动态内容通知

```html
<!-- 礼貌通知：等屏幕阅读器空闲时播报 -->
<div aria-live="polite" id="status">
  <!-- JS 动态更新内容时，屏幕阅读器会播报 -->
</div>

<!-- 紧急通知：立即打断播报 -->
<div aria-live="assertive" id="error">
  <!-- 错误消息 -->
</div>

<!-- 等价的快捷方式 -->
<div role="status">...</div>    <!-- 等价于 aria-live="polite" -->
<div role="alert">...</div>     <!-- 等价于 aria-live="assertive" -->
```

```javascript
// 表单提交后通知结果
const status = document.getElementById('status');
status.textContent = '保存成功！';  // 屏幕阅读器会播报此文本

// 搜索结果数量通知
const results = document.getElementById('search-status');
results.textContent = `找到 ${count} 个结果`;
```

### 常用 ARIA 状态属性

```html
<!-- 展开/收起 -->
<button aria-expanded="false" aria-controls="menu">菜单</button>
<ul id="menu" hidden>...</ul>

<!-- 选中状态 -->
<div role="option" aria-selected="true">选项 A</div>

<!-- 禁用状态 -->
<button aria-disabled="true">提交</button>

<!-- 当前项 -->
<a href="/" aria-current="page">首页</a>

<!-- 加载状态 -->
<button aria-busy="true">加载中...</button>

<!-- 必填 -->
<input aria-required="true">

<!-- 无效 -->
<input aria-invalid="true" aria-errormessage="err-msg">
<span id="err-msg">邮箱格式不正确</span>

<!-- 进度 -->
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  75%
</div>
```

## 焦点管理

### tabindex

```html
<!-- tabindex="0"：加入自然 Tab 顺序 -->
<div role="button" tabindex="0">自定义按钮</div>

<!-- tabindex="-1"：可用 JS 聚焦但不在 Tab 序列中 -->
<div id="modal" tabindex="-1" role="dialog">
  <!-- 模态框内容 -->
</div>

<!-- tabindex > 0：强制提前聚焦顺序（不推荐） -->
<input tabindex="1">  <!-- ❌ 破坏自然顺序，难以维护 -->
```

**原则**：
- 只使用 `0` 和 `-1`
- 避免正数 tabindex（破坏自然 DOM 顺序）
- 原生交互元素（button、a、input）自动可聚焦，无需 tabindex

### 焦点可见性

```css
/* ❌ 移除焦点轮廓（极差的做法） */
*:focus {
  outline: none;
}

/* ✅ 自定义焦点样式 */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* :focus-visible 只在键盘导航时显示焦点环 */
/* 鼠标点击时不显示（解决"点击后有蓝框"的抱怨） */
```

### 焦点陷阱（Focus Trap）

模态框打开时，Tab 键应只在模态框内循环，不跳到背景内容：

```html
<div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">确认操作</h2>
  <p>确定要删除此项目吗？</p>
  <button id="confirm">确认</button>
  <button id="cancel">取消</button>
</div>
```

```javascript
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstEl = focusableElements[0];
  const lastEl = focusableElements[focusableElements.length - 1];

  // 打开时聚焦第一个可聚焦元素
  firstEl.focus();

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift+Tab：从第一个元素跳到最后一个
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      // Tab：从最后一个元素跳到第一个
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  });
}

// 关闭时恢复焦点到触发元素
function closeModal(triggerElement) {
  modal.hidden = true;
  triggerElement.focus();  // 焦点回到打开模态框的按钮
}
```

### inert 属性（现代方案）

```html
<!-- 模态框打开时，背景内容加 inert -->
<main inert>
  <!-- 所有内容不可聚焦、不可交互、对屏幕阅读器隐藏 -->
</main>

<div role="dialog" aria-modal="true">
  <!-- 模态框内容 -->
</div>
```

`inert` 是原生属性，一行代码解决焦点陷阱 + 背景禁用 + 屏幕阅读器隔离。

## 键盘导航

### 常见键盘交互模式

| 组件 | 键盘操作 |
|------|---------|
| 按钮 | Enter / Space 触发 |
| 链接 | Enter 跟踪 |
| 复选框 | Space 切换 |
| 单选组 | 方向键切换选项 |
| 标签页 | 方向键切换 Tab，Enter 激活 |
| 下拉菜单 | 方向键导航，Enter 选择，Esc 关闭 |
| 模态框 | Esc 关闭，Tab 在内部循环 |

### 自定义标签页组件

```html
<div role="tablist" aria-label="产品信息">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1" tabindex="0">
    描述
  </button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">
    规格
  </button>
  <button role="tab" id="tab-3" aria-selected="false" aria-controls="panel-3" tabindex="-1">
    评价
  </button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">
  <p>产品描述内容...</p>
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden>
  <p>产品规格内容...</p>
</div>
<div role="tabpanel" id="panel-3" aria-labelledby="tab-3" tabindex="0" hidden>
  <p>用户评价内容...</p>
</div>
```

```javascript
const tablist = document.querySelector('[role="tablist"]');
const tabs = tablist.querySelectorAll('[role="tab"]');

tablist.addEventListener('keydown', (e) => {
  const currentIndex = [...tabs].indexOf(document.activeElement);
  let nextIndex;

  switch (e.key) {
    case 'ArrowRight':
      nextIndex = (currentIndex + 1) % tabs.length;
      break;
    case 'ArrowLeft':
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      break;
    case 'Home':
      nextIndex = 0;
      break;
    case 'End':
      nextIndex = tabs.length - 1;
      break;
    default:
      return;
  }

  e.preventDefault();
  activateTab(tabs[nextIndex]);
});

function activateTab(tab) {
  // 取消所有 tab 的选中
  tabs.forEach(t => {
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
    document.getElementById(t.getAttribute('aria-controls')).hidden = true;
  });

  // 激活当前 tab
  tab.setAttribute('aria-selected', 'true');
  tab.setAttribute('tabindex', '0');
  tab.focus();
  document.getElementById(tab.getAttribute('aria-controls')).hidden = false;
}
```

**关键设计**：
- 未选中的 tab 设为 `tabindex="-1"`，用户按 Tab 时跳过它们
- 方向键在 tab 组内移动
- 这样用户按一次 Tab 就能离开 tablist，而非逐个经过所有 tab

## 屏幕阅读器友好的标记模式

### 视觉隐藏但屏幕阅读器可读

```css
/* 通用 sr-only class */
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
```

```html
<!-- 为图标按钮添加隐藏文本 -->
<button>
  <svg aria-hidden="true"><!-- 删除图标 --></svg>
  <span class="sr-only">删除此项目</span>
</button>

<!-- 为表格添加隐藏说明 -->
<table>
  <caption class="sr-only">用户列表，共 5 行 3 列</caption>
  <!-- ... -->
</table>
```

### 跳过链接

```html
<body>
  <a href="#main" class="sr-only" style="position:absolute; left:-9999px;">
    跳到主要内容
  </a>
  <!-- 或用 :focus 时显示的方式，见附录 H -->

  <header><!-- 长导航 --></header>
  <main id="main"><!-- 主要内容 --></main>
</body>
```

### 表单错误通知

```html
<form>
  <!-- 错误摘要（提交后聚焦到此） -->
  <div role="alert" id="error-summary" tabindex="-1" hidden>
    <h2>请修正以下错误：</h2>
    <ul>
      <li><a href="#email">邮箱格式不正确</a></li>
      <li><a href="#password">密码至少 8 个字符</a></li>
    </ul>
  </div>

  <div class="form-group">
    <label for="email">邮箱</label>
    <input type="email" id="email" 
      aria-invalid="true" 
      aria-describedby="email-error">
    <p id="email-error" class="error">邮箱格式不正确</p>
  </div>
</form>
```

```javascript
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    const summary = document.getElementById('error-summary');
    summary.hidden = false;
    summary.focus();  // 聚焦到错误摘要，屏幕阅读器立即播报
  }
});
```

## 工程实践：A11y 检测与 CI 集成

### 自动化检测工具

**axe-core**（最流行的 A11y 引擎）：

```javascript
// 浏览器中使用
import axe from 'axe-core';

axe.run(document, {
  rules: {
    'color-contrast': { enabled: true },
    'label': { enabled: true },
  }
}).then(results => {
  console.log('违规:', results.violations);
  console.log('通过:', results.passes);
});
```

**Playwright + axe（E2E 测试集成）**：

```javascript
// playwright.test.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('首页无障碍检测', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])  // WCAG 2.0 A + AA 级别
    .analyze();

  expect(results.violations).toEqual([]);
});
```

**Lighthouse**：

```bash
# CLI 运行
npx lighthouse https://example.com --only-categories=accessibility --output=json
```

### CI 集成

```yaml
# GitHub Actions
- name: A11y Audit
  run: |
    npx playwright test --grep "a11y"
    npx pa11y-ci --config .pa11yci.json
```

```json
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 10000
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/about",
    "http://localhost:3000/contact"
  ]
}
```

### 手动检测清单

```
□ 仅用键盘操作所有功能（Tab、Enter、Space、方向键、Esc）
□ 焦点顺序符合视觉逻辑
□ 焦点始终可见
□ 所有图片有 alt 属性
□ 所有表单控件有关联的 label
□ 颜色对比度达到 WCAG AA 标准（4.5:1 正文 / 3:1 大字）
□ 信息不仅通过颜色传达（如错误状态还有文本或图标）
□ 页面有合理的标题层级（h1→h2→h3，不跳级）
□ 模态框有焦点陷阱
□ 动态内容更新有 aria-live 通知
□ 页面在 200% 缩放下仍可使用
```

## 常见误区

### 误区 1：ARIA 越多越好

```html
<!-- ❌ 冗余 ARIA：原生元素已有语义 -->
<button role="button" aria-label="提交">提交</button>
<nav role="navigation">...</nav>
<main role="main">...</main>

<!-- ✅ 原生语义已足够 -->
<button>提交</button>
<nav>...</nav>
<main>...</main>
```

### 误区 2：用 CSS 隐藏替代正确的隐藏方式

```css
/* ❌ display:none 和 visibility:hidden 会同时对屏幕阅读器隐藏 */
.hidden { display: none; }          /* 屏幕阅读器读不到 */
.hidden { visibility: hidden; }     /* 屏幕阅读器读不到 */

/* ✅ 只对视觉隐藏，屏幕阅读器可读 → 用 sr-only */
/* ✅ 完全隐藏（包括屏幕阅读器） → 用 hidden 属性或 display:none */
/* ✅ 只对屏幕阅读器隐藏 → 用 aria-hidden="true" */
```

### 误区 3：忽略键盘交互

```html
<!-- ❌ 只处理 click，键盘用户无法操作 -->
<div class="card" onclick="openDetail()">卡片内容</div>

<!-- ✅ 添加键盘支持 -->
<div class="card" role="button" tabindex="0" 
     onclick="openDetail()" 
     onkeydown="if(event.key==='Enter'||event.key===' ')openDetail()">
  卡片内容
</div>

<!-- ✅✅ 最好的方案：用原生元素 -->
<button class="card" onclick="openDetail()">卡片内容</button>
```

### 误区 4：仅依赖颜色传达信息

```html
<!-- ❌ 红色/绿色区分状态，色盲用户无法区分 -->
<span style="color: red;">失败</span>
<span style="color: green;">成功</span>

<!-- ✅ 颜色 + 文字 + 图标 -->
<span style="color: red;">✗ 失败</span>
<span style="color: green;">✓ 成功</span>
```

## 参考资源

- [W3C - WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [W3C - ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [MDN - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [The A11y Project](https://www.a11yproject.com/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Deque University](https://dequeuniversity.com/)
