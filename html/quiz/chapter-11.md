# 第 11 章：iframe 与嵌入 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1-10 题：核心知识点

### 1️⃣ iframe 基础 🟢
**Q:** iframe 的作用是什么？  
**A:** 在当前页面中嵌入另一个 HTML 文档

```html
<iframe src="https://example.com" width="800" height="600"></iframe>
```

### 2️⃣ iframe 属性 🟢
**Q:** iframe 常用属性有哪些？  
**A:** `src`, `width`, `height`, `frameborder`, `sandbox`, `allow`

```html
<iframe 
  src="page.html"
  width="100%"
  height="500"
  frameborder="0"
  sandbox="allow-scripts allow-same-origin">
</iframe>
```

### 3️⃣ sandbox 🟢
**Q:** `sandbox` 属性的作用？  
**A:** 限制 iframe 的权限，增强安全性

```html
<!-- 完全沙箱（最严格） -->
<iframe src="untrusted.html" sandbox></iframe>

<!-- 允许脚本 -->
<iframe src="page.html" sandbox="allow-scripts"></iframe>

<!-- 多个权限 -->
<iframe 
  src="page.html" 
  sandbox="allow-scripts allow-same-origin allow-forms">
</iframe>
```

**常用值：**
- `allow-scripts`：允许 JavaScript
- `allow-same-origin`：允许同源
- `allow-forms`：允许表单提交
- `allow-popups`：允许弹窗
- `allow-top-navigation`：允许顶层导航

### 4️⃣ 跨域通信 🟡
**Q:** iframe 与父页面如何跨域通信？  
**A:** 使用 `postMessage` API

```javascript
// 父页面发送消息
iframe.contentWindow.postMessage('Hello', 'https://example.com');

// iframe 接收消息
window.addEventListener('message', (event) => {
  if (event.origin === 'https://trusted-site.com') {
    console.log('收到消息:', event.data);
  }
});

// iframe 向父页面发送
window.parent.postMessage('Response', '*');
```

### 5️⃣ 响应式 iframe 🟡
**Q:** 如何实现响应式 iframe？  
**A:** 使用 padding-bottom 技巧或 aspect-ratio

```html
<!-- 方法1：padding-bottom -->
<div class="iframe-container">
  <iframe src="https://youtube.com/embed/..."></iframe>
</div>

<style>
.iframe-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
}

.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

<!-- 方法2：aspect-ratio -->
<style>
iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
}
</style>
```

### 6️⃣ 安全问题 🟡
**Q:** iframe 有哪些安全风险？  
**A:** 点击劫持、内容注入、跨站脚本

**防御措施：**

```html
<!-- 1. 使用 sandbox -->
<iframe src="untrusted.html" sandbox="allow-scripts"></iframe>

<!-- 2. CSP 头部 -->
<!-- Content-Security-Policy: frame-ancestors 'self' -->

<!-- 3. X-Frame-Options -->
<!-- X-Frame-Options: DENY -->
<!-- X-Frame-Options: SAMEORIGIN -->
```

```javascript
// 4. 验证消息来源
window.addEventListener('message', (event) => {
  // ✅ 验证来源
  if (event.origin !== 'https://trusted-site.com') {
    return;
  }
  
  // 处理消息
  console.log(event.data);
});
```

### 7️⃣ srcdoc 🟡
**Q:** `srcdoc` 属性的作用？  
**A:** 直接在 iframe 中嵌入 HTML 内容

```html
<iframe srcdoc="<h1>Hello World</h1><p>This is inline HTML</p>">
</iframe>

<!-- 优先级：srcdoc > src -->
<iframe 
  src="fallback.html"
  srcdoc="<h1>This will display</h1>">
</iframe>
```

### 8️⃣ 嵌入第三方内容 🔴
**Q:** 嵌入 YouTube 视频的最佳实践？  
**A:** 使用懒加载、添加 title、设置 allow 属性

```html
<div class="video-wrapper">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="YouTube 视频播放器"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    loading="lazy">
  </iframe>
</div>

<style>
.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
```

**懒加载实现：**

```html
<div class="video-container" data-src="https://youtube.com/embed/VIDEO_ID">
  <img src="thumbnail.jpg" alt="点击播放">
  <button class="play-btn">▶️</button>
</div>

<script>
document.querySelectorAll('.video-container').forEach(container => {
  container.addEventListener('click', function() {
    const iframe = document.createElement('iframe');
    iframe.src = this.dataset.src;
    iframe.setAttribute('allowfullscreen', '');
    this.innerHTML = '';
    this.appendChild(iframe);
  });
});
</script>
```

### 9️⃣ iframe vs object vs embed 🔴
**Q:** iframe、object、embed 的区别？  
**A:** 

| 标签 | 用途 | 推荐场景 |
|------|------|---------|
| `<iframe>` | 嵌入 HTML 文档 | 网页、视频 |
| `<object>` | 嵌入多媒体 | PDF、Flash（已淘汰） |
| `<embed>` | 嵌入插件内容 | 不推荐使用 |

```html
<!-- iframe：推荐 -->
<iframe src="page.html"></iframe>

<!-- object：PDF -->
<object data="document.pdf" type="application/pdf" width="800" height="600">
  <p>您的浏览器不支持 PDF 显示。<a href="document.pdf">下载 PDF</a></p>
</object>

<!-- embed：不推荐 -->
<embed src="file.swf" type="application/x-shockwave-flash">
```

### 🔟 iframe 替代方案 🔴
**Q:** 何时应避免使用 iframe？  
**A:** SEO 不友好、性能问题、可访问性问题

**替代方案：**

```html
<!-- 1. 使用 AJAX -->
<div id="content"></div>
<script>
fetch('content.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('content').innerHTML = html;
  });
</script>

<!-- 2. Web Components -->
<template id="my-template">
  <div class="card">
    <h2>Title</h2>
    <p>Content</p>
  </div>
</template>

<!-- 3. 服务端包含（SSI） -->
<!--#include virtual="header.html" -->
```

**iframe 问题：**
- ❌ SEO 不友好
- ❌ 影响页面加载性能
- ❌ 可访问性问题
- ❌ 响应式实现复杂
- ❌ 浏览器后退/前进问题

**合理使用场景：**
- ✅ 嵌入第三方内容（YouTube、Google Maps）
- ✅ 沙箱隔离不信任内容
- ✅ 跨域组件通信

---

**📌 完整示例：安全的 iframe**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>安全的 iframe 示例</title>
</head>
<body>
  <div class="iframe-wrapper">
    <iframe
      id="myFrame"
      src="https://example.com/content"
      title="嵌入内容"
      sandbox="allow-scripts allow-same-origin"
      allow="fullscreen"
      loading="lazy"
      referrerpolicy="no-referrer">
    </iframe>
  </div>

  <script>
  const iframe = document.getElementById('myFrame');
  
  // 等待加载完成
  iframe.addEventListener('load', () => {
    console.log('iframe 加载完成');
    
    // 发送消息
    iframe.contentWindow.postMessage({
      type: 'init',
      data: 'Hello from parent'
    }, 'https://example.com');
  });
  
  // 接收消息
  window.addEventListener('message', (event) => {
    // 验证来源
    if (event.origin !== 'https://example.com') {
      return;
    }
    
    console.log('收到消息:', event.data);
    
    // 处理消息
    if (event.data.type === 'resize') {
      iframe.style.height = event.data.height + 'px';
    }
  });
  </script>

  <style>
  .iframe-wrapper {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  iframe {
    width: 100%;
    min-height: 400px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  </style>
</body>
</html>
```

---

**📌 本章总结**

- iframe 用于嵌入外部内容
- `sandbox` 属性增强安全性
- `postMessage` 实现跨域通信
- 使用 padding-bottom 或 aspect-ratio 实现响应式
- 注意安全风险：点击劫持、XSS
- 合理使用场景：第三方内容、沙箱隔离
- 优先考虑替代方案：AJAX、Web Components

**上一章** ← [第 10 章：SVG 矢量图](./chapter-10.md)  
**下一章** → [第 12 章：表格基础](./chapter-12.md)

---

✅ **第二部分：媒体与嵌入（7-11章）面试题已完成！**
