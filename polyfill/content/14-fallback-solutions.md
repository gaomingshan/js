# 第 14 章：错误边界与回退方案

## 概述

当浏览器不支持某些特性时，如何提供合理的回退体验？本章介绍常见的错误处理和回退方案设计。

## 一、错误边界思想

### 1.1 隔离故障

```javascript
// 将可能失败的功能隔离
class FeatureModule {
  constructor() {
    this.supported = this.checkSupport();
  }
  
  checkSupport() {
    return 'IntersectionObserver' in window;
  }
  
  init() {
    if (!this.supported) {
      console.warn('Feature not supported, using fallback');
      return this.initFallback();
    }
    return this.initFeature();
  }
  
  initFeature() { /* 正常实现 */ }
  initFallback() { /* 降级实现 */ }
}
```

### 1.2 React 错误边界

```jsx
// ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Feature error:', error);
    // 上报错误
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>功能暂不可用</div>;
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary fallback={<SimpleFallback />}>
  <AdvancedFeature />
</ErrorBoundary>
```

## 二、常见回退方案

### 2.1 图片回退

```html
<!-- picture 元素回退 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="描述">
</picture>

<!-- 响应式图片回退 -->
<img 
  src="small.jpg"
  srcset="medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="描述"
>
<!-- 不支持 srcset 的浏览器使用 src -->
```

### 2.2 视频回退

```html
<video controls>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
  <!-- 完全不支持 video 时显示 -->
  <p>您的浏览器不支持视频播放，<a href="video.mp4">下载视频</a></p>
</video>
```

### 2.3 CSS 回退

```css
/* 渐变回退 */
.banner {
  background: #667eea;  /* 回退颜色 */
  background: linear-gradient(135deg, #667eea, #764ba2);
}

/* 现代布局回退 */
.grid {
  /* Flexbox 回退 */
  display: flex;
  flex-wrap: wrap;
  
  /* Grid 覆盖 */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* 单位回退 */
.container {
  width: 100%;  /* 回退 */
  width: min(100%, 1200px);  /* 现代 */
}
```

### 2.4 JavaScript API 回退

```javascript
// LocalStorage 回退到内存
const storage = {
  _data: {},
  
  setItem(key, value) {
    if (this._isSupported()) {
      localStorage.setItem(key, value);
    } else {
      this._data[key] = value;
    }
  },
  
  getItem(key) {
    if (this._isSupported()) {
      return localStorage.getItem(key);
    }
    return this._data[key] ?? null;
  },
  
  _isSupported() {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch {
      return false;
    }
  }
};
```

## 三、懒加载回退

### 3.1 IntersectionObserver 回退

```javascript
function lazyLoad(images) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });
    
    images.forEach(img => observer.observe(img));
  } else {
    // 回退：立即加载所有图片
    images.forEach(loadImage);
    // 或者使用滚动事件（性能较差）
  }
}

function loadImage(img) {
  img.src = img.dataset.src;
}
```

### 3.2 原生懒加载 + 回退

```html
<!-- 原生懒加载 -->
<img src="image.jpg" loading="lazy" alt="描述">

<!-- JS 检测和回退 -->
<script>
if (!('loading' in HTMLImageElement.prototype)) {
  // 不支持原生懒加载，使用 JS 方案
  import('lazysizes');
}
</script>
```

## 四、动画回退

### 4.1 CSS 动画回退

```css
/* 基础：无动画 */
.element {
  opacity: 1;
}

/* 支持动画时 */
@supports (animation: fadeIn 1s) {
  .element {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}

/* 尊重用户偏好 */
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none;
  }
}
```

### 4.2 Web Animations API 回退

```javascript
function fadeIn(element, duration = 300) {
  // 现代：Web Animations API
  if ('animate' in element) {
    return element.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration, fill: 'forwards' }
    ).finished;
  }
  
  // 回退：CSS transition
  element.style.transition = `opacity ${duration}ms`;
  element.style.opacity = 0;
  
  // 强制重排
  element.offsetHeight;
  
  element.style.opacity = 1;
  
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
```

## 五、表单回退

### 5.1 表单验证回退

```html
<!-- HTML5 验证 + JS 回退 -->
<form id="form">
  <input type="email" required id="email">
  <button type="submit">提交</button>
</form>

<script>
const form = document.getElementById('form');

// 检测是否支持 HTML5 验证
if (!('checkValidity' in form)) {
  form.addEventListener('submit', function(e) {
    const email = document.getElementById('email');
    if (!validateEmail(email.value)) {
      e.preventDefault();
      showError('请输入有效的邮箱地址');
    }
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
</script>
```

### 5.2 日期输入回退

```html
<input type="date" id="dateInput">

<script>
const dateInput = document.getElementById('dateInput');

// 检测是否支持 type="date"
if (dateInput.type !== 'date') {
  // 回退：使用日期选择器库
  import('flatpickr').then(({ default: flatpickr }) => {
    flatpickr(dateInput, {
      dateFormat: 'Y-m-d'
    });
  });
}
</script>
```

## 六、网络请求回退

### 6.1 Fetch 回退

```javascript
// 统一的请求函数
async function request(url, options = {}) {
  if ('fetch' in window) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  
  // XMLHttpRequest 回退
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url);
    
    // 设置请求头
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(options.body);
  });
}
```

## 七、用户提示

### 7.1 功能不可用提示

```javascript
function showFeatureUnavailable(featureName, reason) {
  const message = document.createElement('div');
  message.className = 'feature-notice';
  message.innerHTML = `
    <p>${featureName} 在当前浏览器不可用</p>
    <p class="hint">${reason || '建议使用最新版 Chrome/Firefox/Edge'}</p>
  `;
  document.body.appendChild(message);
}

// 使用
if (!('geolocation' in navigator)) {
  showFeatureUnavailable('位置服务', '您的浏览器不支持地理定位');
}
```

### 7.2 浏览器升级提示

```html
<!-- 针对非常旧的浏览器 -->
<!--[if lt IE 11]>
<div class="browser-upgrade">
  您正在使用过时的浏览器。请 <a href="https://browsehappy.com/">升级您的浏览器</a> 以获得更好的体验。
</div>
<![endif]-->
```

## 八、监控与上报

### 8.1 特性使用统计

```javascript
// 统计特性支持情况
function reportFeatureSupport() {
  const features = {
    promise: 'Promise' in window,
    fetch: 'fetch' in window,
    intersectionObserver: 'IntersectionObserver' in window,
    webgl: (() => {
      try {
        return !!document.createElement('canvas').getContext('webgl');
      } catch { return false; }
    })()
  };
  
  // 上报到分析服务
  analytics.track('feature_support', features);
}
```

### 8.2 降级事件上报

```javascript
function trackFallback(feature, reason) {
  analytics.track('feature_fallback', {
    feature,
    reason,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  });
}

// 使用
if (!('IntersectionObserver' in window)) {
  trackFallback('lazy_load', 'IntersectionObserver not supported');
  // 使用回退方案
}
```

## 九、最佳实践

| 实践 | 说明 |
|------|------|
| 始终提供回退 | 不要让功能完全失效 |
| 用户告知 | 让用户知道体验受限 |
| 监控上报 | 了解实际降级情况 |
| 定期评估 | 评估是否还需要某些回退 |

## 参考资料

- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [CSS Feature Queries](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@supports)

---

**下一章** → [第 15 章：Babel + core-js 最佳配置](./15-babel-corejs-setup.md)
