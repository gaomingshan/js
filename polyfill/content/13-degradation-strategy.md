# 第 13 章：优雅降级 vs 渐进增强

## 概述

优雅降级和渐进增强是两种不同的兼容性设计理念。理解这两种策略，有助于在项目初期做出正确的架构决策。

## 一、两种策略对比

### 1.1 优雅降级（Graceful Degradation）

```
设计思路：先为现代浏览器构建完整功能，再处理旧浏览器

现代浏览器 ────────────────────────────► 完整体验
                 ↓
              检测能力
                 ↓
旧浏览器 ──────────────────────────────► 降级体验
```

### 1.2 渐进增强（Progressive Enhancement）

```
设计思路：先确保基础功能可用，再为现代浏览器添加增强

所有浏览器 ────────────────────────────► 基础功能
                 ↓
              检测能力
                 ↓
现代浏览器 ────────────────────────────► 增强体验
```

### 1.3 核心区别

| 维度 | 优雅降级 | 渐进增强 |
|------|----------|----------|
| 起点 | 完整功能 | 基础功能 |
| 方向 | 向下兼容 | 向上增强 |
| 默认体验 | 最佳 | 最基础 |
| 旧浏览器 | 被动处理 | 主动保障 |

## 二、实际示例

### 2.1 CSS 示例

**渐进增强**：
```css
/* 基础：所有浏览器都能用 */
.container {
  display: block;
  width: 100%;
}

/* 增强：支持 Flexbox 的浏览器 */
@supports (display: flex) {
  .container {
    display: flex;
    gap: 20px;
  }
}

/* 更进一步：支持 Grid 的浏览器 */
@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

**优雅降级**：
```css
/* 现代浏览器：使用 Grid */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 降级：不支持 Grid 时用 Flexbox */
@supports not (display: grid) {
  .container {
    display: flex;
    flex-wrap: wrap;
  }
  .container > * {
    flex: 0 0 calc(33.33% - 20px);
    margin: 10px;
  }
}
```

### 2.2 JavaScript 示例

**渐进增强**：
```javascript
// 基础：传统方式（所有浏览器）
function loadData(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/data');
  xhr.onload = function() {
    callback(JSON.parse(xhr.responseText));
  };
  xhr.send();
}

// 增强：现代浏览器用 fetch
if ('fetch' in window) {
  loadData = async function(callback) {
    const res = await fetch('/api/data');
    const data = await res.json();
    callback(data);
  };
}
```

**优雅降级**：
```javascript
// 现代浏览器：使用 fetch
async function loadData() {
  if ('fetch' in window) {
    const res = await fetch('/api/data');
    return res.json();
  }
  
  // 降级：使用 XMLHttpRequest
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/data');
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.send();
  });
}
```

### 2.3 HTML 示例

**渐进增强**：
```html
<!-- 基础：普通链接（所有浏览器可用） -->
<a href="/page" class="nav-link">导航</a>

<!-- 增强：JS 可用时变为 SPA 导航 -->
<script>
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // SPA 路由处理
      router.push(link.href);
    });
  });
</script>
```

## 三、选择策略的考量

### 3.1 选择渐进增强的场景

| 场景 | 原因 |
|------|------|
| 内容型网站 | 内容是核心，功能是辅助 |
| 广泛用户群 | 无法预测用户浏览器 |
| SEO 重要 | 搜索引擎爬虫能力有限 |
| 可访问性要求高 | 确保基础可用性 |

### 3.2 选择优雅降级的场景

| 场景 | 原因 |
|------|------|
| Web 应用 | 功能是核心 |
| 已知用户群 | 如企业内部应用 |
| 快速迭代 | 先实现再优化 |
| 现代特性依赖重 | 如 WebGL 应用 |

## 四、混合策略

### 4.1 核心功能渐进增强 + 次要功能优雅降级

```javascript
// 核心功能：渐进增强，确保可用
function submitForm(form) {
  // 基础：表单原生提交
  if (!('fetch' in window)) {
    form.submit();
    return;
  }
  
  // 增强：AJAX 提交
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form)
  }).then(handleResponse);
}

// 次要功能：优雅降级，不支持就隐藏
function initDragDrop() {
  if (!('draggable' in document.createElement('div'))) {
    // 隐藏拖放相关 UI
    document.querySelector('.drag-area').style.display = 'none';
    return;
  }
  // 初始化拖放功能...
}
```

### 4.2 分层体验

```javascript
// 体验分层
const experienceLevel = detectExperienceLevel();

function detectExperienceLevel() {
  if (!('Promise' in window)) return 'basic';
  if (!('IntersectionObserver' in window)) return 'standard';
  if (!('CSS' in window && CSS.supports('gap', '1px'))) return 'standard';
  return 'enhanced';
}

// 根据级别加载不同模块
switch (experienceLevel) {
  case 'enhanced':
    import('./enhanced-app.js');
    break;
  case 'standard':
    import('./standard-app.js');
    break;
  default:
    import('./basic-app.js');
}
```

## 五、CSS 降级技巧

### 5.1 属性覆盖

```css
/* 浏览器会忽略不认识的值，使用上一个有效值 */
.box {
  display: block;        /* 回退 */
  display: flex;         /* 现代浏览器 */
  
  background: #333;      /* 回退 */
  background: linear-gradient(#333, #111);  /* 现代 */
  
  width: 100%;           /* 回退 */
  width: calc(100% - 20px);  /* 现代 */
}
```

### 5.2 Feature Queries

```css
/* 基础样式 */
.card {
  float: left;
  width: 30%;
  margin: 1.66%;
}

/* 支持 Grid 时覆盖 */
@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .card {
    float: none;
    width: auto;
    margin: 0;
  }
}
```

## 六、JavaScript 降级模式

### 6.1 切点函数

```javascript
// 封装特性检测 + 降级逻辑
function animate(element, keyframes, options) {
  // 现代：Web Animations API
  if ('animate' in element) {
    return element.animate(keyframes, options);
  }
  
  // 降级：CSS 类切换
  element.classList.add('animate');
  return {
    finished: new Promise(resolve => {
      setTimeout(resolve, options.duration);
    })
  };
}

// 使用统一的 API
animate(box, [
  { opacity: 0 },
  { opacity: 1 }
], { duration: 300 });
```

### 6.2 能力对象

```javascript
// 集中管理能力和降级
const capabilities = {
  lazyLoad: 'IntersectionObserver' in window
    ? (el, callback) => {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => e.isIntersecting && callback(e.target));
        });
        io.observe(el);
        return () => io.disconnect();
      }
    : (el, callback) => {
        // 降级：立即加载
        callback(el);
        return () => {};
      }
};

// 使用
capabilities.lazyLoad(imageEl, loadImage);
```

## 七、测试策略

### 7.1 多浏览器测试

| 工具 | 用途 |
|------|------|
| BrowserStack | 真实设备云测试 |
| Sauce Labs | 自动化跨浏览器测试 |
| Playwright | 多浏览器自动化 |

### 7.2 模拟旧环境

```javascript
// 测试时模拟不支持某特性
beforeEach(() => {
  delete window.IntersectionObserver;
});

afterEach(() => {
  // 恢复
});
```

## 八、最佳实践

| 实践 | 说明 |
|------|------|
| 核心功能优先 | 确保基础功能在所有浏览器可用 |
| 渐进式加载 | 基础体验快速呈现，增强功能异步加载 |
| 明确边界 | 定义支持哪些浏览器的哪种体验 |
| 文档记录 | 记录降级策略，便于维护 |

## 九、总结

```
渐进增强 = 从基础开始，逐步添加
优雅降级 = 从完整开始，处理例外

实际项目：通常是混合使用
- 核心功能：渐进增强
- 次要功能：优雅降级
```

## 参考资料

- [Understanding Progressive Enhancement](https://alistapart.com/article/understandingprogressiveenhancement/)
- [Graceful Degradation vs Progressive Enhancement](https://www.w3.org/wiki/Graceful_degradation_versus_progressive_enhancement)

---

**下一章** → [第 14 章：错误边界与回退方案](./14-fallback-solutions.md)
