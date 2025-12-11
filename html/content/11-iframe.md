# 第 11 章：iframe 与嵌入

## 概述

`<iframe>` 允许在当前页面中嵌入另一个 HTML 页面。虽然现代开发中使用较少，但在某些场景下仍然很有用。

## 一、iframe 基础

### 1.1 基本用法

```html
<iframe src="page.html" width="600" height="400"></iframe>
```

### 1.2 常用属性

```html
<iframe src="page.html"
        width="800"
        height="600"
        name="myFrame"
        title="嵌入的页面"
        frameborder="0"
        scrolling="auto"
        loading="lazy">
</iframe>
```

**属性说明：**

| 属性 | 说明 | 值 |
|-----|------|---|
| `src` | 嵌入页面的 URL | URL |
| `width/height` | 宽度/高度 | 像素或百分比 |
| `name` | 框架名称 | 字符串 |
| `title` | 框架标题（可访问性） | 字符串 |
| `frameborder` | 边框（已废弃，用 CSS） | 0/1 |
| `scrolling` | 滚动条 | auto/yes/no |
| `loading` | 加载方式 | eager/lazy |

## 二、iframe 的应用场景

### 2.1 嵌入第三方内容

```html
<!-- YouTube 视频 -->
<iframe width="560" height="315" 
        src="https://www.youtube.com/embed/VIDEO_ID"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
</iframe>

<!-- Google 地图 -->
<iframe src="https://www.google.com/maps/embed?pb=..."
        width="600"
        height="450"
        style="border:0;"
        allowfullscreen=""
        loading="lazy">
</iframe>

<!-- Twitter 嵌入 -->
<iframe src="https://platform.twitter.com/embed/..."
        width="550"
        height="400">
</iframe>
```

### 2.2 广告位

```html
<iframe src="ad.html" 
        width="300" 
        height="250"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin">
</iframe>
```

### 2.3 内容预览

```html
<iframe src="preview.html" 
        width="100%" 
        height="500"
        title="内容预览">
</iframe>
```

## 三、sandbox 属性（安全）

### 3.1 基本用法

```html
<!-- 最严格限制 -->
<iframe src="untrusted.html" sandbox></iframe>

<!-- 允许特定权限 -->
<iframe src="page.html" 
        sandbox="allow-scripts allow-forms">
</iframe>
```

### 3.2 sandbox 值

| 值 | 说明 |
|---|---|
| `allow-scripts` | 允许脚本执行 |
| `allow-forms` | 允许表单提交 |
| `allow-same-origin` | 允许同源访问 |
| `allow-popups` | 允许弹窗 |
| `allow-top-navigation` | 允许跳转顶层窗口 |
| `allow-downloads` | 允许下载 |
| `allow-modals` | 允许模态对话框 |

> **⚠️ 安全提示**  
> `allow-scripts` + `allow-same-origin` 组合会移除大部分安全限制，慎用。

### 3.3 实战示例

```html
<!-- 嵌入不受信任的内容 -->
<iframe src="user-content.html"
        sandbox="allow-scripts">
  <!-- 允许脚本，但不允许表单、弹窗等 -->
</iframe>

<!-- 嵌入广告 -->
<iframe src="ad.html"
        sandbox="allow-scripts allow-same-origin allow-popups">
</iframe>
```

## 四、响应式 iframe

### 4.1 固定宽高比

```html
<div class="iframe-container">
  <iframe src="page.html"></iframe>
</div>

<style>
.iframe-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 比例 */
  height: 0;
  overflow: hidden;
}

.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
```

### 4.2 常见宽高比

```css
/* 16:9 (视频) */
.ratio-16-9 {
  padding-bottom: 56.25%;
}

/* 4:3 */
.ratio-4-3 {
  padding-bottom: 75%;
}

/* 1:1 (正方形) */
.ratio-1-1 {
  padding-bottom: 100%;
}
```

## 五、iframe 通信

### 5.1 父页面访问 iframe

```html
<!-- 父页面 -->
<iframe id="myFrame" src="child.html"></iframe>

<script>
const iframe = document.getElementById('myFrame');

// 访问 iframe 的 window
iframe.contentWindow.postMessage('Hello from parent', '*');

// 访问 iframe 的 document（同源）
iframe.contentDocument.body.style.backgroundColor = 'lightblue';
</script>
```

### 5.2 iframe 访问父页面

```html
<!-- iframe 内部 -->
<script>
// 向父页面发送消息
window.parent.postMessage('Hello from iframe', '*');

// 接收父页面消息
window.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
});
</script>
```

### 5.3 postMessage API

```javascript
// 发送消息
targetWindow.postMessage(message, targetOrigin);

// 接收消息
window.addEventListener('message', (event) => {
  // 验证来源
  if (event.origin !== 'https://trusted-site.com') {
    return;
  }
  
  console.log('消息:', event.data);
  console.log('来源:', event.origin);
  console.log('source:', event.source);
  
  // 回复消息
  event.source.postMessage('收到', event.origin);
});
```

### 5.4 实战示例

```html
<!-- 父页面 -->
<!DOCTYPE html>
<html>
<head>
  <title>父页面</title>
</head>
<body>
  <iframe id="child" src="child.html"></iframe>
  <button onclick="sendToChild()">发送消息到 iframe</button>
  
  <script>
  function sendToChild() {
    const iframe = document.getElementById('child');
    iframe.contentWindow.postMessage({
      type: 'greeting',
      text: 'Hello from parent'
    }, '*');
  }
  
  window.addEventListener('message', (event) => {
    console.log('父页面收到消息:', event.data);
  });
  </script>
</body>
</html>

<!-- 子页面 (child.html) -->
<!DOCTYPE html>
<html>
<body>
  <button onclick="sendToParent()">发送消息到父页面</button>
  
  <script>
  function sendToParent() {
    window.parent.postMessage({
      type: 'response',
      text: 'Hello from iframe'
    }, '*');
  }
  
  window.addEventListener('message', (event) => {
    console.log('iframe 收到消息:', event.data);
  });
  </script>
</body>
</html>
```

## 六、srcdoc 属性

### 6.1 内联 HTML

```html
<iframe srcdoc="<h1>Hello</h1><p>这是内联HTML</p>">
</iframe>
```

### 6.2 动态内容

```html
<iframe id="preview"></iframe>

<script>
const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>body { font-family: Arial; }</style>
  </head>
  <body>
    <h1>动态内容</h1>
    <p>这是通过 JavaScript 生成的内容</p>
  </body>
  </html>
`;

document.getElementById('preview').srcdoc = html;
</script>
```

## 七、iframe 的问题和替代方案

### 7.1 iframe 的缺点

> **⚠️ iframe 的问题**
> 
> 1. **SEO 不友好**：搜索引擎难以索引
> 2. **性能问题**：每个 iframe 是独立的页面
> 3. **可访问性**：屏幕阅读器处理困难
> 4. **安全风险**：容易受到攻击
> 5. **移动端问题**：在移动设备上表现不佳

### 7.2 现代替代方案

```html
<!-- ❌ 不推荐：iframe 嵌入内容 -->
<iframe src="content.html"></iframe>

<!-- ✅ 推荐：Ajax 加载 -->
<div id="content"></div>
<script>
fetch('content.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('content').innerHTML = html;
  });
</script>

<!-- ✅ 推荐：Web Components -->
<custom-element></custom-element>
```

## 八、CSP 和 iframe

### 8.1 Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-src 'self' https://trusted-site.com;">
```

**CSP 指令：**

| 指令 | 说明 |
|-----|------|
| `frame-src` | 限制 iframe 来源 |
| `frame-ancestors` | 限制谁可以嵌入此页面 |
| `sandbox` | 应用 sandbox 限制 |

### 8.2 X-Frame-Options

```html
<!-- 服务器响应头 -->
X-Frame-Options: DENY            <!-- 禁止被嵌入 -->
X-Frame-Options: SAMEORIGIN      <!-- 只允许同源嵌入 -->
X-Frame-Options: ALLOW-FROM url  <!-- 允许特定来源 -->
```

## 九、最佳实践

> **📌 iframe 使用建议**
> 
> 1. **必要时才用**：优先考虑其他方案
> 2. **设置 title**：提升可访问性
> 3. **使用 sandbox**：限制不受信任的内容
> 4. **懒加载**：使用 `loading="lazy"`
> 5. **响应式**：使用 CSS 保持宽高比
> 6. **安全通信**：验证 postMessage 来源
> 7. **CSP 保护**：限制 iframe 来源

```html
<!-- ✅ 良好的 iframe 示例 -->
<div class="video-container">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID"
          title="视频标题"
          loading="lazy"
          allow="accelerometer; autoplay; encrypted-media"
          allowfullscreen
          sandbox="allow-scripts allow-same-origin allow-presentation">
  </iframe>
</div>

<style>
.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
```

## 十、实战示例

### 10.1 嵌入代码编辑器

```html
<iframe src="https://codepen.io/embed/..."
        width="100%"
        height="500"
        scrolling="no"
        frameborder="no"
        loading="lazy"
        allowtransparency="true"
        allowfullscreen="true"
        sandbox="allow-scripts allow-same-origin allow-popups">
</iframe>
```

### 10.2 实时预览

```html
<textarea id="code"></textarea>
<iframe id="preview" sandbox="allow-scripts"></iframe>

<script>
const textarea = document.getElementById('code');
const preview = document.getElementById('preview');

textarea.addEventListener('input', () => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      ${textarea.value}
    </body>
    </html>
  `;
  preview.srcdoc = html;
});
</script>
```

## 参考资料

- [MDN - `<iframe>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe)
- [MDN - postMessage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)
- [CSP 指南](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)

---

**上一章** ← [第 10 章：SVG 矢量图](./10-svg.md)  
**下一章** → [第 12 章：表格基础](./12-tables-basic.md)

---

✅ **第二部分：媒体与嵌入（7-11章）已完成！**
