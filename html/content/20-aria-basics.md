# 第 20 章：WAI-ARIA 基础

## 概述

WAI-ARIA（Accessible Rich Internet Applications）是一套增强 Web 可访问性的规范，帮助屏幕阅读器更好地理解动态内容。

## 一、ARIA 简介

### 1.1 什么是 ARIA

ARIA 通过添加属性来增强 HTML 的可访问性：

```html
<!-- 无 ARIA -->
<div onclick="handleClick()">按钮</div>

<!-- 有 ARIA -->
<div role="button" 
     tabindex="0" 
     onclick="handleClick()"
     onkeypress="handleKeyPress()">
  按钮
</div>

<!-- 更好：使用原生语义 -->
<button onclick="handleClick()">按钮</button>
```

> **💡 第一原则**  
> 优先使用原生 HTML 元素，只在必要时使用 ARIA。

### 1.2 ARIA 的三大组成

1. **Roles（角色）**：元素的类型
2. **Properties（属性）**：元素的特征
3. **States（状态）**：元素的当前状态

## 二、ARIA Roles

### 2.1 Landmark Roles（地标角色）

```html
<!-- 原生语义优先 -->
<header>头部</header>              <!-- 相当于 role="banner" -->
<nav>导航</nav>                    <!-- 相当于 role="navigation" -->
<main>主内容</main>                <!-- 相当于 role="main" -->
<aside>侧边栏</aside>              <!-- 相当于 role="complementary" -->
<footer>底部</footer>              <!-- 相当于 role="contentinfo" -->

<!-- 只在必要时使用 ARIA -->
<div role="banner">头部</div>
<div role="navigation">导航</div>
<div role="main">主内容</div>
<div role="complementary">侧边栏</div>
<div role="contentinfo">底部</div>
<div role="search">搜索</div>
<div role="form">表单</div>
```

### 2.2 Widget Roles（组件角色）

```html
<!-- 按钮 -->
<div role="button" tabindex="0">点击</div>

<!-- 标签页 -->
<div role="tablist">
  <button role="tab" aria-selected="true">标签1</button>
  <button role="tab" aria-selected="false">标签2</button>
</div>
<div role="tabpanel">标签1内容</div>

<!-- 对话框 -->
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">对话框标题</h2>
  <p>对话框内容</p>
</div>

<!-- 警告 -->
<div role="alert">这是重要提示</div>
```

### 2.3 Document Roles（文档角色）

```html
<!-- 文章 -->
<div role="article">文章内容</div>

<!-- 定义 -->
<div role="definition">定义内容</div>

<!-- 列表 -->
<div role="list">
  <div role="listitem">项目1</div>
  <div role="listitem">项目2</div>
</div>
```

## 三、ARIA States 和 Properties

### 3.1 aria-label 和 aria-labelledby

```html
<!-- aria-label：直接提供标签 -->
<button aria-label="关闭对话框">×</button>

<nav aria-label="主导航">
  <ul>...</ul>
</nav>

<!-- aria-labelledby：引用已有元素 -->
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">确认删除</h2>
  <p>确定要删除这项内容吗？</p>
</div>

<!-- aria-describedby：提供详细描述 -->
<input type="text" 
       aria-describedby="username-hint">
<span id="username-hint">用户名必须是3-20位字母或数字</span>
```

### 3.2 aria-hidden

```html
<!-- 对屏幕阅读器隐藏装饰性内容 -->
<button>
  <span aria-hidden="true">🔍</span>
  搜索
</button>

<!-- 隐藏动态加载的内容 -->
<div class="loading" aria-hidden="true">
  加载中...
</div>
```

### 3.3 aria-live（动态更新）

```html
<!-- 重要：立即通知 -->
<div aria-live="assertive">
  错误：网络连接失败
</div>

<!-- 礼貌：等待用户操作完成后通知 -->
<div aria-live="polite">
  已添加到购物车
</div>

<!-- 关闭：不通知 -->
<div aria-live="off">
  时钟：10:30
</div>
```

### 3.4 aria-expanded（展开状态）

```html
<button aria-expanded="false" aria-controls="menu">
  菜单
</button>
<ul id="menu" hidden>
  <li>选项1</li>
  <li>选项2</li>
</ul>

<script>
button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', !expanded);
  menu.hidden = expanded;
});
</script>
```

### 3.5 aria-selected（选中状态）

```html
<div role="tablist">
  <button role="tab" aria-selected="true">标签1</button>
  <button role="tab" aria-selected="false">标签2</button>
  <button role="tab" aria-selected="false">标签3</button>
</div>
```

### 3.6 aria-disabled 和 aria-readonly

```html
<!-- 禁用 -->
<button aria-disabled="true">禁用按钮</button>

<!-- 只读 -->
<div role="textbox" aria-readonly="true">只读文本</div>
```

### 3.7 aria-checked（复选状态）

```html
<div role="checkbox" 
     aria-checked="true" 
     tabindex="0">
  已选中
</div>

<!-- 三态复选框 -->
<div role="checkbox" 
     aria-checked="mixed" 
     tabindex="0">
  部分选中
</div>
```

## 四、实战示例

### 4.1 可访问的模态框

```html
<button id="openDialog">打开对话框</button>

<div id="dialog" 
     role="dialog" 
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc"
     aria-modal="true"
     hidden>
  
  <h2 id="dialog-title">确认操作</h2>
  <p id="dialog-desc">确定要执行此操作吗？</p>
  
  <button id="confirmBtn">确定</button>
  <button id="cancelBtn">取消</button>
</div>

<script>
const openBtn = document.getElementById('openDialog');
const dialog = document.getElementById('dialog');
const cancelBtn = document.getElementById('cancelBtn');

openBtn.addEventListener('click', () => {
  dialog.hidden = false;
  dialog.querySelector('button').focus();
});

cancelBtn.addEventListener('click', () => {
  dialog.hidden = true;
  openBtn.focus();
});

// ESC 关闭
dialog.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dialog.hidden = true;
    openBtn.focus();
  }
});
</script>
```

### 4.2 可访问的标签页

```html
<div class="tabs">
  <div role="tablist" aria-label="产品信息">
    <button role="tab" 
            aria-selected="true" 
            aria-controls="tab1"
            id="tab-1">
      描述
    </button>
    <button role="tab" 
            aria-selected="false" 
            aria-controls="tab2"
            id="tab-2">
      规格
    </button>
    <button role="tab" 
            aria-selected="false" 
            aria-controls="tab3"
            id="tab-3">
      评价
    </button>
  </div>
  
  <div role="tabpanel" 
       id="tab1" 
       aria-labelledby="tab-1">
    产品描述内容...
  </div>
  
  <div role="tabpanel" 
       id="tab2" 
       aria-labelledby="tab-2"
       hidden>
    产品规格内容...
  </div>
  
  <div role="tabpanel" 
       id="tab3" 
       aria-labelledby="tab-3"
       hidden>
    用户评价内容...
  </div>
</div>

<script>
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    // 重置所有标签
    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    panels.forEach(p => p.hidden = true);
    
    // 激活当前标签
    tab.setAttribute('aria-selected', 'true');
    panels[index].hidden = false;
  });
  
  // 键盘导航
  tab.addEventListener('keydown', (e) => {
    let newIndex = index;
    
    if (e.key === 'ArrowLeft') {
      newIndex = index > 0 ? index - 1 : tabs.length - 1;
    } else if (e.key === 'ArrowRight') {
      newIndex = index < tabs.length - 1 ? index + 1 : 0;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }
    
    tabs[newIndex].click();
    tabs[newIndex].focus();
    e.preventDefault();
  });
});
</script>
```

### 4.3 可访问的下拉菜单

```html
<div class="dropdown">
  <button aria-haspopup="true" 
          aria-expanded="false"
          aria-controls="menu"
          id="menuButton">
    菜单
  </button>
  
  <ul role="menu" id="menu" hidden>
    <li role="menuitem">
      <a href="/profile">个人资料</a>
    </li>
    <li role="menuitem">
      <a href="/settings">设置</a>
    </li>
    <li role="separator"></li>
    <li role="menuitem">
      <a href="/logout">退出登录</a>
    </li>
  </ul>
</div>

<script>
const button = document.getElementById('menuButton');
const menu = document.getElementById('menu');

button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', !expanded);
  menu.hidden = expanded;
  
  if (!expanded) {
    menu.querySelector('[role="menuitem"]').focus();
  }
});
</script>
```

### 4.4 实时通知

```html
<div aria-live="polite" 
     aria-atomic="true"
     class="notification"
     role="status">
</div>

<script>
function showNotification(message) {
  const notification = document.querySelector('[aria-live]');
  notification.textContent = message;
  
  setTimeout(() => {
    notification.textContent = '';
  }, 5000);
}

// 使用
showNotification('操作成功');
</script>
```

## 五、常见模式

### 5.1 手风琴（Accordion）

```html
<div class="accordion">
  <h3>
    <button aria-expanded="false" 
            aria-controls="panel1"
            id="accordion1">
      第一项
    </button>
  </h3>
  <div id="panel1" 
       role="region" 
       aria-labelledby="accordion1"
       hidden>
    内容1...
  </div>
  
  <h3>
    <button aria-expanded="false" 
            aria-controls="panel2"
            id="accordion2">
      第二项
    </button>
  </h3>
  <div id="panel2" 
       role="region" 
       aria-labelledby="accordion2"
       hidden>
    内容2...
  </div>
</div>
```

### 5.2 工具提示（Tooltip）

```html
<button aria-describedby="tooltip">
  帮助
</button>
<div role="tooltip" id="tooltip" hidden>
  这是帮助信息
</div>
```

### 5.3 进度条

```html
<div role="progressbar" 
     aria-valuenow="60" 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-label="上传进度">
  <div class="progress-fill" style="width: 60%"></div>
</div>
```

## 六、ARIA 最佳实践

> **📌 ARIA 使用原则**
> 
> 1. **原生优先**：能用 HTML 就不用 ARIA
> 2. **不要改变语义**：不要覆盖原生语义
> 3. **所有交互元素可聚焦**：使用 `tabindex`
> 4. **键盘可操作**：实现键盘事件
> 5. **提供反馈**：使用 `aria-live`
> 6. **测试**：使用屏幕阅读器测试

```html
<!-- ❌ 不好：改变原生语义 -->
<h1 role="button">这不是标题</h1>

<!-- ✅ 好：保持原生语义 -->
<button>按钮</button>

<!-- ❌ 不好：缺少焦点管理 -->
<div role="button" onclick="handleClick()">点击</div>

<!-- ✅ 好：可聚焦且可键盘操作 -->
<div role="button" 
     tabindex="0"
     onclick="handleClick()"
     onkeypress="handleKeyPress()">
  点击
</div>
```

## 七、测试工具

### 7.1 浏览器工具

- Chrome DevTools - Accessibility
- Firefox Accessibility Inspector
- WAVE Browser Extension

### 7.2 屏幕阅读器

- **Windows**: NVDA, JAWS
- **macOS**: VoiceOver
- **Linux**: Orca

### 7.3 自动化测试

```javascript
// 使用 axe-core
const axe = require('axe-core');

axe.run(document, (err, results) => {
  if (err) throw err;
  console.log(results.violations);
});
```

## 参考资料

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN - ARIA](https://developer.mozilla.org/zh-CN/docs/Web/Accessibility/ARIA)
- [A11y Project](https://www.a11yproject.com/)

---

**上一章** ← [第 19 章：文档大纲](./19-document-outline.md)  
**下一章** → [第 21 章：微数据](./21-microdata.md)
