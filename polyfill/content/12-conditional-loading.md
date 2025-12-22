# 第 12 章：条件加载实践

## 概述

条件加载是指根据浏览器能力动态加载所需的 Polyfill，避免现代浏览器加载不必要的代码。本章介绍几种条件加载方案。

## 一、为什么需要条件加载

### 1.1 问题：一刀切的 polyfill

```html
<!-- 所有用户都加载同样的 polyfill -->
<script src="polyfills.js"></script>  <!-- 100KB -->
<script src="app.js"></script>

<!-- 问题：
     Chrome 100 用户：不需要 polyfill，但也加载了 100KB
     IE 11 用户：确实需要这些 polyfill
-->
```

### 1.2 解决：按需加载

```html
<!-- 只在需要时加载 -->
<script>
  if (!('Promise' in window)) {
    document.write('<script src="polyfills.js"><\/script>');
  }
</script>
<script src="app.js"></script>
```

## 二、Polyfill.io 服务

### 2.1 工作原理

```
浏览器请求 → Polyfill.io 服务器
                   ↓
            分析 User-Agent
                   ↓
            返回该浏览器需要的 polyfill
                   ↓
Chrome 100：几乎空文件
IE 11：完整 polyfill 集合
```

### 2.2 基本使用

```html
<!-- 引入 Polyfill.io -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>

<!-- 指定需要的特性 -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=Promise,fetch,Array.prototype.includes"></script>
```

### 2.3 常用参数

```html
<!-- features：指定特性 -->
?features=Promise,fetch,IntersectionObserver

<!-- flags：控制行为 -->
?flags=gated  <!-- 只在需要时返回 -->

<!-- callback：加载完成回调 -->
?callback=polyfillsLoaded

<!-- 组合使用 -->
?features=default,fetch&flags=gated
```

### 2.4 自托管

```bash
# 克隆 polyfill-library
git clone https://github.com/ArcTeryx/polyfill-library

# 自行部署，避免依赖第三方服务
```

### 2.5 注意事项

| 考量 | 说明 |
|------|------|
| 服务可用性 | 第三方服务可能宕机 |
| 隐私 | UA 信息发送到第三方 |
| 性能 | 额外的 DNS 和连接开销 |
| 安全 | 第三方脚本的安全风险 |

## 三、动态 import() 加载

### 3.1 基本模式

```javascript
// loadPolyfills.js
async function loadPolyfills() {
  const polyfills = [];
  
  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }
  
  if (!('Promise' in window)) {
    polyfills.push(import('promise-polyfill'));
  }
  
  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }
  
  return Promise.all(polyfills);
}

// main.js
loadPolyfills().then(() => {
  import('./app.js');
});
```

### 3.2 HTML 入口

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { loadPolyfills } from './loadPolyfills.js';
    await loadPolyfills();
    import('./app.js');
  </script>
  
  <!-- 不支持 ES Module 的浏览器回退 -->
  <script nomodule src="legacy-bundle.js"></script>
</head>
</html>
```

## 四、module/nomodule 模式

### 4.1 原理

```html
<!-- 现代浏览器加载（支持 ES Module） -->
<script type="module" src="app.modern.js"></script>

<!-- 旧浏览器加载（不支持 ES Module） -->
<script nomodule src="app.legacy.js"></script>

<!-- 两者互斥：
     Chrome 61+：只加载 module
     IE 11：只加载 nomodule
-->
```

### 4.2 构建两份产物

```javascript
// vite.config.js
export default {
  build: {
    target: 'esnext',  // 现代版本
  }
};

// 额外构建传统版本
// vite build --config vite.legacy.config.js
```

### 4.3 @vitejs/plugin-legacy

```javascript
// vite.config.js
import legacy from '@vitejs/plugin-legacy';

export default {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      // 自动生成 modern + legacy 两份产物
      // 自动注入 module/nomodule
    })
  ]
};
```

生成的 HTML：
```html
<script type="module" src="/assets/index.abc123.js"></script>
<script nomodule src="/assets/index-legacy.def456.js"></script>
```

## 五、内联检测脚本

### 5.1 同步加载模式

```html
<script>
(function() {
  var features = [];
  
  if (!('Promise' in window)) features.push('Promise');
  if (!('fetch' in window)) features.push('fetch');
  if (!('Symbol' in window)) features.push('Symbol');
  
  if (features.length) {
    var script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=' + features.join(',');
    script.async = false;
    document.head.appendChild(script);
  }
})();
</script>
<script src="app.js"></script>
```

### 5.2 异步加载模式

```html
<script>
(function() {
  function loadApp() {
    var script = document.createElement('script');
    script.src = 'app.js';
    document.body.appendChild(script);
  }
  
  if (!('Promise' in window) || !('fetch' in window)) {
    var polyfill = document.createElement('script');
    polyfill.src = 'polyfills.js';
    polyfill.onload = loadApp;
    document.head.appendChild(polyfill);
  } else {
    loadApp();
  }
})();
</script>
```

## 六、Webpack 动态导入

### 6.1 配置

```javascript
// webpack.config.js
module.exports = {
  entry: {
    main: './src/index.js',
    polyfills: './src/polyfills.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        polyfills: {
          test: /[\\/]node_modules[\\/](core-js|regenerator-runtime)[\\/]/,
          name: 'polyfills',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 6.2 条件引入

```javascript
// src/index.js
async function bootstrap() {
  // 检测并加载 polyfill
  if (!('IntersectionObserver' in window)) {
    await import('intersection-observer');
  }
  
  // 启动应用
  const { App } = await import('./App');
  App.init();
}

bootstrap();
```

## 七、Service Worker 缓存策略

### 7.1 预缓存 polyfill

```javascript
// service-worker.js
const POLYFILL_CACHE = 'polyfills-v1';
const POLYFILL_URLS = [
  '/polyfills/promise.js',
  '/polyfills/fetch.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(POLYFILL_CACHE)
      .then(cache => cache.addAll(POLYFILL_URLS))
  );
});

self.addEventListener('fetch', event => {
  if (POLYFILL_URLS.includes(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
    );
  }
});
```

## 八、性能对比

### 8.1 不同策略的体积

| 策略 | 现代浏览器 | 旧浏览器 |
|------|------------|----------|
| 全量加载 | 150KB | 150KB |
| Polyfill.io | ~5KB | ~100KB |
| module/nomodule | 50KB | 150KB |
| 动态 import | ~10KB | ~100KB |

### 8.2 选择建议

| 场景 | 推荐方案 |
|------|----------|
| 快速实现 | Polyfill.io |
| 最佳性能 | module/nomodule |
| 灵活控制 | 动态 import |
| 自托管 | 内联检测 + 本地 polyfill |

## 九、完整示例

### 9.1 Vite + Legacy 插件

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: ['es.promise.finally']
    })
  ]
});
```

### 9.2 纯手动方案

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // 检测核心特性
    var needsPolyfill = !window.Promise || !window.fetch || !Array.prototype.includes;
    
    if (needsPolyfill) {
      // 同步加载 polyfill
      document.write('<script src="/polyfills.js"><\/script>');
    }
  </script>
</head>
<body>
  <div id="app"></div>
  <script src="/app.js"></script>
</body>
</html>
```

## 十、最佳实践

| 实践 | 说明 |
|------|------|
| 使用 module/nomodule | 最简单的现代/传统分离 |
| 减少检测代码 | 检测脚本本身也有体积 |
| 考虑缓存 | polyfill 变化少，可长期缓存 |
| 监控加载 | 统计不同浏览器的加载情况 |

## 参考资料

- [Polyfill.io](https://polyfill.io/)
- [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)
- [Differential Serving](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)

---

**下一章** → [第 13 章：优雅降级 vs 渐进增强](./13-degradation-strategy.md)
