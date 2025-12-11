# 第 20 章：ARIA 基础 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | ARIA 定义

### 题目
ARIA 是什么？

**A.** CSS 框架 | **B.** 可访问性规范 | **C.** JavaScript 库 | **D.** HTML 标签

<details><summary>查看答案</summary>

### ✅ 答案：B

### 解析
**ARIA** = Accessible Rich Internet Applications  
**作用：** 提升 Web 应用的可访问性

```html
<!-- 原生语义 -->
<button>点击</button>

<!-- ARIA 增强 -->
<div role="button" aria-label="关闭" tabindex="0">×</div>
```

**来源：** WAI-ARIA 规范
</details>

---

## 第 2 题 🟢 | ARIA 三要素

### 题目
ARIA 的三大组成部分？**（多选）**

**A.** Roles | **B.** States | **C.** Properties | **D.** Methods

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C

### 解析
```html
<!-- 1. Role（角色） -->
<div role="button">

<!-- 2. States（状态） -->
<button aria-pressed="true">

<!-- 3. Properties（属性） -->
<button aria-label="关闭">
```

**来源：** ARIA 规范
</details>

---

## 第 3 题 🟢 | role 属性

### 题目
`role` 属性的作用？

**A.** 定义元素角色 | **B.** 样式化 | **C.** 验证 | **D.** 提交表单

<details><summary>查看答案</summary>

### ✅ 答案：A

### 解析
```html
<!-- 地标角色 -->
<div role="banner">页头</div>
<div role="navigation">导航</div>
<div role="main">主内容</div>

<!-- 组件角色 -->
<div role="button">按钮</div>
<div role="tab">选项卡</div>
<div role="dialog">对话框</div>
```

**来源：** ARIA Roles
</details>

---

## 第 4 题 🟡 | aria-label vs aria-labelledby

### 题目
两者的区别？

<details><summary>查看答案</summary>

### ✅ 答案

```html
<!-- aria-label：直接提供文本 -->
<button aria-label="关闭对话框">×</button>

<!-- aria-labelledby：引用其他元素 -->
<h2 id="dialog-title">确认删除</h2>
<div role="dialog" aria-labelledby="dialog-title">
  <p>确定要删除吗？</p>
</div>

<!-- 优先级：aria-labelledby > aria-label > 元素文本 -->
```

**来源：** ARIA Labeling
</details>

---

## 第 5 题 🟡 | aria-hidden

### 题目
`aria-hidden` 的作用？

<details><summary>查看答案</summary>

### ✅ 答案

隐藏内容，屏幕阅读器跳过：

```html
<!-- 装饰性图标 -->
<button>
  <span aria-hidden="true">🔍</span>
  搜索
</button>

<!-- ❌ 错误：隐藏但可见 -->
<button aria-hidden="true">
  点击 <!-- 视觉可见但屏幕阅读器跳过 -->
</button>

<!-- ✅ 正确：完全隐藏 -->
<div aria-hidden="true" style="display:none">
  不重要的内容
</div>
```

**来源：** ARIA States
</details>

---

## 第 6 题 🟡 | aria-live

### 题目
`aria-live` 用于什么场景？

<details><summary>查看答案</summary>

### ✅ 答案

动态更新内容的实时通知：

```html
<!-- 礼貌通知（等待当前完成） -->
<div aria-live="polite">
  表单提交成功！
</div>

<!-- 强制通知（立即打断） -->
<div aria-live="assertive" role="alert">
  错误：密码不正确
</div>

<!-- 不通知 -->
<div aria-live="off">
  实时数据（不打扰）
</div>
```

**值：**
- `off` - 不通知
- `polite` - 礼貌通知
- `assertive` - 强制通知

**来源：** ARIA Live Regions
</details>

---

## 第 7 题 🟡 | 常用地标角色

### 题目
列出常用的地标角色。**（多选）**

**A.** banner, navigation | **B.** main, complementary | **C.** contentinfo, search | **D.** form, region

<details><summary>查看答案</summary>

### ✅ 答案：A, B, C, D

### 解析
```html
<div role="banner">        <!-- 页头 -->
<div role="navigation">    <!-- 导航 -->
<div role="search">        <!-- 搜索 -->
<div role="main">          <!-- 主内容 -->
<div role="complementary"> <!-- 补充内容 -->
<div role="contentinfo">   <!-- 页脚 -->
<div role="form">          <!-- 表单 -->
<div role="region">        <!-- 区域 -->
```

**HTML5 等价：**
```html
<header>     → role="banner"
<nav>        → role="navigation"
<main>       → role="main"
<aside>      → role="complementary"
<footer>     → role="contentinfo"
<form>       → role="form"
<section>    → role="region"
```

**来源：** ARIA Landmarks
</details>

---

## 第 8 题 🔴 | 自定义下拉菜单

### 题目
实现符合 ARIA 规范的下拉菜单。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<div class="dropdown">
  <button 
    id="menu-button"
    aria-haspopup="true"
    aria-expanded="false"
    aria-controls="menu">
    菜单
  </button>
  
  <ul 
    id="menu"
    role="menu"
    aria-labelledby="menu-button"
    hidden>
    <li role="menuitem">
      <a href="/profile">个人中心</a>
    </li>
    <li role="menuitem">
      <a href="/settings">设置</a>
    </li>
    <li role="separator"></li>
    <li role="menuitem">
      <a href="/logout">退出</a>
    </li>
  </ul>
</div>

<script>
const button = document.getElementById('menu-button');
const menu = document.getElementById('menu');

button.addEventListener('click', () => {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  
  button.setAttribute('aria-expanded', !isExpanded);
  menu.hidden = isExpanded;
  
  if (!isExpanded) {
    menu.querySelector('[role="menuitem"]').focus();
  }
});

// 键盘支持
menu.addEventListener('keydown', (e) => {
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  const current = document.activeElement;
  const index = items.indexOf(current);
  
  switch(e.key) {
    case 'ArrowDown':
      e.preventDefault();
      items[(index + 1) % items.length].focus();
      break;
    case 'ArrowUp':
      e.preventDefault();
      items[(index - 1 + items.length) % items.length].focus();
      break;
    case 'Escape':
      button.click();
      button.focus();
      break;
  }
});
</script>
```

**来源：** ARIA Authoring Practices
</details>

---

## 第 9 题 🔴 | 模态对话框

### 题目
实现符合 ARIA 的模态对话框。**（代码题）**

<details><summary>查看答案</summary>

### ✅ 答案
```html
<button id="open-dialog">打开对话框</button>

<div 
  id="dialog"
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
  hidden>
  
  <h2 id="dialog-title">确认操作</h2>
  <p id="dialog-desc">确定要删除这条记录吗？</p>
  
  <button id="confirm">确认</button>
  <button id="cancel">取消</button>
</div>

<div id="backdrop" hidden></div>

<script>
class Dialog {
  constructor(dialogEl) {
    this.dialog = dialogEl;
    this.backdrop = document.getElementById('backdrop');
    this.previousFocus = null;
    
    this.init();
  }
  
  init() {
    document.getElementById('open-dialog').addEventListener('click', () => this.open());
    document.getElementById('cancel').addEventListener('click', () => this.close());
    
    // ESC 关闭
    this.dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
    
    // 焦点陷阱
    this.dialog.addEventListener('keydown', (e) => this.trapFocus(e));
  }
  
  open() {
    this.previousFocus = document.activeElement;
    
    this.dialog.hidden = false;
    this.backdrop.hidden = false;
    
    // 聚焦第一个按钮
    this.dialog.querySelector('button').focus();
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.dialog.hidden = true;
    this.backdrop.hidden = true;
    
    document.body.style.overflow = '';
    
    // 恢复焦点
    this.previousFocus?.focus();
  }
  
  trapFocus(e) {
    if (e.key !== 'Tab') return;
    
    const focusable = this.dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

new Dialog(document.getElementById('dialog'));
</script>
```

**来源：** ARIA Dialog Pattern
</details>

---

## 第 10 题 🔴 | ARIA 最佳实践

### 题目
总结 ARIA 使用的最佳实践。

<details><summary>查看答案</summary>

### ✅ 答案

**1. 优先使用原生 HTML**
```html
<!-- ❌ 不必要的 ARIA -->
<div role="button" tabindex="0">点击</div>

<!-- ✅ 原生元素 -->
<button>点击</button>
```

**2. ARIA 五原则**
1. 能用原生就用原生
2. 不改变原生语义
3. 键盘可操作
4. 不隐藏焦点
5. 可访问的名称

**3. 常见错误**
```html
<!-- ❌ 错误：role覆盖原生 -->
<button role="link">按钮</button>

<!-- ❌ 错误：aria-label在div上无效 -->
<div aria-label="内容">文本</div>

<!-- ❌ 错误：隐藏但可见 -->
<button aria-hidden="true">可见按钮</button>
```

**4. 正确示例**
```html
<!-- ✅ 增强原生元素 -->
<button aria-pressed="true">收藏</button>

<!-- ✅ 自定义组件 -->
<div 
  role="button"
  tabindex="0"
  aria-label="关闭"
  onkeydown="handleKeyboard(event)">
  ×
</div>

<!-- ✅ 动态内容 -->
<div role="status" aria-live="polite">
  加载中...
</div>
```

**5. 测试工具**
- 屏幕阅读器：NVDA, JAWS, VoiceOver
- 浏览器扩展：axe DevTools, WAVE
- 自动化测试：Pa11y, axe-core

**来源：** ARIA 最佳实践指南
</details>

---

**📌 本章总结**
- ARIA = 可访问性增强
- 三要素：Roles, States, Properties
- 优先原生HTML，ARIA作为补充
- 常用：aria-label, aria-hidden, aria-live
- 地标角色：banner, navigation, main, contentinfo
- 键盘支持：焦点管理、快捷键
- 测试：屏幕阅读器 + 自动化工具

**上一章** ← [第 19 章：文档大纲](./chapter-19.md)  
**下一章** → [第 21 章：微数据](./chapter-21.md)
