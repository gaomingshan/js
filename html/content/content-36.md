# 未来的 HTML

## 核心概念

HTML 标准持续演进，新特性不断涌现，适应 Web 平台的发展需求。

## HTML 标准的演进方向

### 1. 更强的语义化

```html
<!-- 新提案：更细粒度的语义 -->
<article>
  <h1>文章标题</h1>
  <byline>作者：张三</byline>
  <dateline>2024-01-01</dateline>
  <p>内容...</p>
</article>
```

### 2. 原生组件增强

```html
<!-- Popover API -->
<button popovertarget="mypopover">打开弹窗</button>
<div popover id="mypopover">
  <p>弹窗内容</p>
  <button popovertarget="mypopover" popovertargetaction="hide">关闭</button>
</div>

<!-- Dialog 元素 -->
<dialog id="dialog">
  <form method="dialog">
    <p>对话框内容</p>
    <button>关闭</button>
  </form>
</dialog>

<script>
document.querySelector('#dialog').showModal();
</script>
```

### 3. 性能优化特性

```html
<!-- Content Visibility -->
<div style="content-visibility: auto; contain-intrinsic-size: 0 500px;">
  <!-- 视口外不渲染，性能优化 -->
</div>

<!-- Loading 优先级 -->
<img src="hero.jpg" loading="eager" fetchpriority="high">
<img src="thumbnail.jpg" loading="lazy" fetchpriority="low">
```

## Declarative Shadow DOM

```html
<!-- 服务端渲染的 Shadow DOM -->
<my-component>
  <template shadowrootmode="open">
    <style>
      /* 封装的样式 */
      p { color: blue; }
    </style>
    <p>Shadow DOM 内容</p>
  </template>
</my-component>
```

**优势**：
- SSR 支持 Web Components
- 无需 JavaScript 初始化
- 更好的首屏性能

## Container Queries

```html
<div class="container">
  <div class="card">
    <h3>卡片标题</h3>
  </div>
</div>

<style>
.container {
  container-type: inline-size;
}

/* 根据容器宽度调整样式，而非视口 */
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
```

**对比媒体查询**：
```css
/* 媒体查询：基于视口 */
@media (min-width: 768px) { }

/* 容器查询：基于父容器 */
@container (min-width: 400px) { }
```

## HTML 与 WebAssembly 的协作

```html
<!DOCTYPE html>
<html>
<head>
  <title>WASM + HTML</title>
</head>
<body>
  <canvas id="canvas"></canvas>
  
  <script type="module">
    // 加载 WASM 模块
    const { instance } = await WebAssembly.instantiateStreaming(
      fetch('module.wasm')
    );
    
    // WASM 处理计算密集任务
    const result = instance.exports.calculate(100);
    
    // HTML/JS 处理 UI
    document.body.innerHTML += `<p>结果: ${result}</p>`;
  </script>
</body>
</html>
```

**分工**：
- HTML：结构和布局
- JavaScript：DOM 操作和交互
- WebAssembly：计算密集任务

## 新兴技术方向

### 1. View Transitions API

```html
<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}
</style>

<script>
// 页面切换动画
document.startViewTransition(() => {
  // 更新 DOM
  updateContent();
});
</script>
```

### 2. Speculation Rules

```html
<script type="speculationrules">
{
  "prerender": [
    {"source": "list", "urls": ["/page2.html"]}
  ],
  "prefetch": [
    {"source": "document", "where": {"selector_matches": "a[href]"}}
  ]
}
</script>
```

### 3. Import Maps

```html
<script type="importmap">
{
  "imports": {
    "react": "https://cdn.skypack.dev/react",
    "lodash": "/js/lodash.js"
  }
}
</script>

<script type="module">
import React from 'react';
import _ from 'lodash';
</script>
```

## 趋势总结

**1. 更智能的浏览器**：
- 自动优化资源加载
- 预测性预取
- 智能懒加载

**2. 更强大的原生功能**：
- 减少对 JavaScript 框架的依赖
- 更多原生组件
- 更好的性能

**3. 更好的开发体验**：
- 声明式 API
- 类型安全（通过 TypeScript）
- 更好的调试工具

**4. 更紧密的跨平台集成**：
- PWA 持续增强
- WebAssembly 深度整合
- 与原生 App 的界限模糊

**后端类比**：HTML 演进 ≈ API 标准演进（GraphQL、gRPC）。

## 参考资源

- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/)
- [Chrome Platform Status](https://chromestatus.com/)
- [Can I Use](https://caniuse.com/)
- [MDN - Experimental Features](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Experimental_features)
- [Web.dev - New to the Web Platform](https://web.dev/blog/)
