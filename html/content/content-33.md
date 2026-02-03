# 移动端 HTML

## 核心概念

移动端 HTML 需要针对触摸交互、小屏幕、性能限制进行优化。

## Viewport 与响应式设计

```html
<!-- 基础 viewport 设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 禁止缩放（慎用） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- iOS Safari 特定设置 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

**响应式布局**：

```css
/* 移动优先 */
.container {
  padding: 10px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    padding: 40px;
  }
}
```

## 触摸事件

```html
<div id="touchArea">触摸区域</div>

<script>
const area = document.getElementById('touchArea');

// 触摸开始
area.addEventListener('touchstart', (e) => {
  e.preventDefault();
  console.log('触摸开始', e.touches[0]);
});

// 触摸移动
area.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  console.log('位置', touch.pageX, touch.pageY);
});

// 触摸结束
area.addEventListener('touchend', (e) => {
  console.log('触摸结束');
});

// 手势识别
let startX, startY;

area.addEventListener('touchstart', (e) => {
  startX = e.touches[0].pageX;
  startY = e.touches[0].pageY;
});

area.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].pageX;
  const endY = e.changedTouches[0].pageY;
  
  const diffX = endX - startX;
  const diffY = endY - startY;
  
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 50) console.log('右滑');
    if (diffX < -50) console.log('左滑');
  }
});
</script>
```

## PWA 优化

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PWA App</title>
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- iOS 图标 -->
  <link rel="apple-touch-icon" href="/icon-192.png">
  
  <!-- 主题色 -->
  <meta name="theme-color" content="#3498db">
</head>
<body>
  <div id="app"></div>
  
  <script>
  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
  </script>
</body>
</html>
```

```json
// manifest.json
{
  "name": "My PWA App",
  "short_name": "PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3498db",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## WebView 中的 HTML

```java
// Android WebView
WebView webView = findViewById(R.id.webview);
WebSettings settings = webView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setDomStorageEnabled(true);

webView.loadUrl("https://example.com");
```

```swift
// iOS WKWebView
let webView = WKWebView()
let request = URLRequest(url: URL(string: "https://example.com")!)
webView.load(request)
```

**后端类比**：移动端优化 ≈ 微服务的轻量化部署。

## 参考资源

- [MDN - Mobile Web Development](https://developer.mozilla.org/en-US/docs/Web/Guide/Mobile)
- [PWA](https://web.dev/progressive-web-apps/)
