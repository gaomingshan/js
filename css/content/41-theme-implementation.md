# 第 41 章：动态主题实现

## 概述

使用CSS变量实现动态主题切换。

---

## 一、主题定义

### 1.1 CSS变量

```css
:root {
  --primary: #3b82f6;
  --bg: white;
  --text: #1a1a1a;
}

[data-theme="dark"] {
  --primary: #60a5fa;
  --bg: #1a1a1a;
  --text: white;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

---

## 二、JavaScript切换

### 2.1 主题切换

```javascript
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// 加载保存的主题
const saved = localStorage.getItem('theme');
if (saved) {
  document.documentElement.setAttribute('data-theme', saved);
}
```

---

## 三、完整示例

### 3.1 主题系统

```css
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;
  --bg-primary: white;
  --bg-secondary: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
}

[data-theme="dark"] {
  --primary-50: #1e3a8a;
  --primary-500: #60a5fa;
  --primary-900: #eff6ff;
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
}
```

---

## 参考资料

- [CSS Custom Properties for Theming](https://css-tricks.com/a-complete-guide-to-custom-properties/)

---

**导航**  
[上一章：第 40 章 - 自定义属性](./40-custom-properties.md)  
[返回目录](../README.md)  
[下一章：第 42 章 - 计算函数](./42-calc-functions.md)
