# 第 41 章：动态主题实现 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 主题定义

### 题目

定义主题的最佳方式？

**选项：**
- A. 多个CSS文件
- B. CSS变量
- C. JavaScript对象
- D. B正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
:root {
  --theme-bg: #ffffff;
  --theme-text: #000000;
}

[data-theme="dark"] {
  --theme-bg: #000000;
  --theme-text: #ffffff;
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** 主题切换

### 题目

切换主题的方法？

**选项：**
- A. 修改CSS文件
- B. 切换data-theme属性
- C. 重新加载页面
- D. B正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```javascript
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

setTheme('dark');
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** 持久化

### 题目

应该使用localStorage保存用户的主题选择。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

```javascript
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

// 初始化
setTheme(getTheme());
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 主题系统组成

### 题目

完整的主题系统包含？

**选项：**
- A. CSS变量定义
- B. JavaScript切换逻辑
- C. localStorage持久化
- D. 系统主题检测

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**完整主题系统**

**✅ A. CSS变量**
```css
:root {
  --bg: white;
  --text: black;
}

[data-theme="dark"] {
  --bg: black;
  --text: white;
}
```

**✅ B. 切换逻辑**
```javascript
function toggleTheme() {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}
```

**✅ C. 持久化**
```javascript
localStorage.setItem('theme', theme);
```

**✅ D. 系统主题检测**
```javascript
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** 过渡动画

### 题目

如何为主题切换添加平滑过渡？

**选项：**
- A. transition: all
- B. transition: background-color, color
- C. 使用class控制过渡
- D. B和C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* ✅ 方案1：只过渡必要属性 */
body {
  background: var(--bg);
  color: var(--text);
  transition: background-color 0.3s, color 0.3s;
}

/* ✅ 方案2：使用class控制 */
body.theme-transitioning {
  transition: background-color 0.3s, color 0.3s;
}
```

```javascript
function setTheme(theme) {
  // 添加过渡class
  document.body.classList.add('theme-transitioning');
  
  // 切换主题
  document.documentElement.setAttribute('data-theme', theme);
  
  // 移除过渡class
  setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
  }, 300);
}
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** 多主题支持

### 题目

如何支持多个主题（不只是亮/暗）？

**选项：**
- A. 多个data-theme值
- B. CSS变量配置
- C. 主题配置对象
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* 亮色主题 */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #000000;
}

/* 暗色主题 */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}

/* 蓝色主题 */
[data-theme="blue"] {
  --bg-primary: #001f3f;
  --text-primary: #7fdbff;
}

/* 高对比度主题 */
[data-theme="high-contrast"] {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --border-width: 2px;
}
```

```javascript
const themes = {
  light: { name: '亮色', icon: '☀️' },
  dark: { name: '暗色', icon: '🌙' },
  blue: { name: '蓝色', icon: '🌊' },
  'high-contrast': { name: '高对比度', icon: '◐' }
};

function renderThemeSelector() {
  const selector = document.getElementById('theme-selector');
  
  Object.keys(themes).forEach(themeKey => {
    const button = document.createElement('button');
    button.textContent = `${themes[themeKey].icon} ${themes[themeKey].name}`;
    button.onclick = () => setTheme(themeKey);
    selector.appendChild(button);
  });
}
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 闪烁问题

### 题目

如何避免页面加载时的主题闪烁？

**选项：**
- A. 在head中内联脚本
- B. 使用SSR
- C. 预设默认主题
- D. A正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ✅ 在head中立即执行 -->
  <script>
    (function() {
      const theme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>
  
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- 内容 -->
</body>
</html>
```

**完整方案：**
```html
<script>
  // 立即执行，避免闪烁
  (function() {
    function getPreferredTheme() {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', getPreferredTheme());
  })();
</script>
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 完整实现

### 题目

实现一个完整的主题管理类？

**选项：**
- A. 只用函数
- B. 使用class封装
- C. 使用模块
- D. B或C

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```javascript
class ThemeManager {
  constructor(options = {}) {
    this.themes = options.themes || ['light', 'dark'];
    this.default = options.default || 'light';
    this.storageKey = options.storageKey || 'theme';
    
    this.init();
  }
  
  init() {
    // 初始化主题
    const theme = this.getTheme();
    this.setTheme(theme, false);
    
    // 监听系统主题变化
    this.watchSystemTheme();
  }
  
  getTheme() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored && this.themes.includes(stored)) {
      return stored;
    }
    
    // 使用系统主题
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return this.default;
  }
  
  setTheme(theme, save = true) {
    if (!this.themes.includes(theme)) {
      console.warn(`Theme "${theme}" not found`);
      return;
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    
    if (save) {
      localStorage.setItem(this.storageKey, theme);
    }
    
    this.emit('themeChange', theme);
  }
  
  toggleTheme() {
    const current = this.getTheme();
    const currentIndex = this.themes.indexOf(current);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex]);
  }
  
  watchSystemTheme() {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem(this.storageKey)) {
          this.setTheme(e.matches ? 'dark' : 'light', false);
        }
      });
  }
  
  // 事件系统
  listeners = {};
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

// 使用
const themeManager = new ThemeManager({
  themes: ['light', 'dark', 'blue'],
  default: 'light'
});

themeManager.on('themeChange', (theme) => {
  console.log('Theme changed to:', theme);
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  themeManager.toggleTheme();
});
```

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

主题切换的性能优化策略？

**选项：**
- A. 减少变量数量
- B. 使用CSS containment
- C. 批量修改样式
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**✅ A. 精简变量**
```css
/* ❌ 过多变量 */
:root {
  --color-1: #000;
  --color-2: #111;
  /* ... 100个变量 */
}

/* ✅ 合理组织 */
:root {
  --primary: #007bff;
  --secondary: #6c757d;
  /* 只定义必要的变量 */
}
```

**✅ B. CSS containment**
```css
.theme-container {
  contain: layout style paint;
  /* 限制重绘范围 */
}
```

**✅ C. 批量修改**
```javascript
// ❌ 逐个修改
root.style.setProperty('--color-1', value1);
root.style.setProperty('--color-2', value2);
root.style.setProperty('--color-3', value3);

// ✅ 切换class/attribute
document.documentElement.setAttribute('data-theme', 'dark');
```

**完整优化：**
```javascript
class OptimizedThemeManager {
  setTheme(theme) {
    // 1. 使用requestAnimationFrame
    requestAnimationFrame(() => {
      // 2. 批量修改（一次attribute变更）
      document.documentElement.setAttribute('data-theme', theme);
      
      // 3. 保存到localStorage
      localStorage.setItem('theme', theme);
    });
  }
}
```

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 最佳实践

### 题目

主题系统的最佳实践？

**选项：**
- A. 提供系统主题跟随
- B. 持久化用户选择
- C. 避免加载闪烁
- D. 提供多主题选择

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**完整主题系统示例**

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // ✅ C. 避免闪烁
    (function() {
      const theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>
  
  <style>
    /* CSS变量定义 */
    :root {
      --bg: white;
      --text: black;
    }
    
    /* ✅ D. 多主题支持 */
    [data-theme="dark"] { --bg: black; --text: white; }
    [data-theme="blue"] { --bg: #001f3f; --text: #7fdbff; }
  </style>
</head>
<body>
  <script>
    class ThemeSystem {
      constructor() {
        this.init();
        this.watchSystemTheme();  // ✅ A. 系统主题跟随
      }
      
      init() {
        const theme = this.getSavedTheme();
        this.setTheme(theme);
      }
      
      getSavedTheme() {
        // ✅ B. 读取持久化
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        
        // ✅ A. 使用系统主题
        return this.getSystemTheme();
      }
      
      getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' : 'light';
      }
      
      setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);  // ✅ B. 持久化
      }
      
      watchSystemTheme() {
        // ✅ A. 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
              this.setTheme(e.matches ? 'dark' : 'light');
            }
          });
      }
    }
    
    new ThemeSystem();
  </script>
</body>
</html>
```

</details>

---

**导航**  
[上一章：第 40 章 - 自定义属性](./chapter-40.md) | [返回目录](../README.md) | [下一章：第 42 章 - 计算函数](./chapter-42.md)
