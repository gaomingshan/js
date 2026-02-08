# Script 标签的执行模型

## 核心概念

`<script>` 标签的执行时机和方式直接影响页面性能和用户体验。理解脚本的执行模型是优化首屏加载的关键。

```html
<!-- 同步脚本：阻塞解析 -->
<script src="app.js"></script>

<!-- 异步脚本：不阻塞解析 -->
<script src="app.js" async></script>

<!-- 延迟脚本：DOM 完成后执行 -->
<script src="app.js" defer></script>
```

**后端类比**：
- 同步脚本 ≈ 同步 I/O（阻塞）
- async ≈ 异步非阻塞 I/O
- defer ≈ 延迟任务队列

## 同步脚本：阻塞解析的原因

### 执行流程

```html
<body>
  <h1>标题</h1>
  
  <script src="app.js"></script>
  <!-- 解析暂停，等待脚本下载和执行 -->
  
  <p>段落</p>
  <!-- 脚本执行完才解析 -->
</body>
```

**时间线**：
```
0ms    - 解析 <h1>，添加到 DOM
10ms   - 遇到 <script>，暂停解析
10ms   - 开始下载 app.js
110ms  - 下载完成（100ms）
110ms  - 执行 app.js（假设耗时 50ms）
160ms  - 脚本执行完成，恢复解析
160ms  - 解析 <p>，添加到 DOM
```

**为什么必须阻塞**：

```javascript
// app.js 可能修改 DOM
document.write('<p>动态插入的段落</p>');

// 如果不阻塞，后续的 <p> 可能被覆盖
```

**后端类比**：类似于事务的串行执行，确保数据一致性。

### 内联脚本 vs 外部脚本

```html
<!-- 内联脚本：立即执行 -->
<script>
  console.log('立即执行');
</script>

<!-- 外部脚本：需要下载 -->
<script src="app.js"></script>
```

**性能对比**：
```
内联脚本：
  无网络延迟
  但增加 HTML 体积
  无法缓存

外部脚本：
  网络延迟
  可以缓存
  适合大型脚本
```

## defer vs async：执行时机的差异

### defer：延迟到 DOM 完成

```html
<head>
  <script src="app.js" defer></script>
  <script src="utils.js" defer></script>
</head>
<body>
  <h1>标题</h1>
  <p>段落</p>
</body>
```

**执行时机**：
```
1. HTML 开始解析
2. 遇到 defer 脚本，开始后台下载（不阻塞）
3. 继续解析 HTML
4. DOM 构建完成
5. DOMContentLoaded 前执行所有 defer 脚本（按顺序）
6. 触发 DOMContentLoaded 事件
```

**特点**：
- ✅ 不阻塞 HTML 解析
- ✅ 保证执行顺序
- ✅ DOM 可用时执行
- ❌ 只对外部脚本有效

**使用场景**：
```javascript
// app.js 需要操作 DOM
document.querySelector('h1').textContent = '修改标题';
// 使用 defer 确保 DOM 已就绪
```

### async：下载完立即执行

```html
<head>
  <script src="analytics.js" async></script>
  <script src="ads.js" async></script>
</head>
<body>
  <h1>标题</h1>
  <p>段落</p>
</body>
```

**执行时机**：
```
1. HTML 开始解析
2. 遇到 async 脚本，开始后台下载
3. 继续解析 HTML
4. 某个脚本下载完成，暂停解析，执行脚本
5. 恢复解析
6. 其他脚本下载完成，重复 4-5
```

**特点**：
- ✅ 不阻塞 HTML 解析（下载时）
- ✅ 快速执行（下载完立即执行）
- ❌ 执行顺序不确定
- ❌ 可能在 DOM 未完成时执行

**使用场景**：
```javascript
// analytics.js 独立运行，不依赖 DOM
(function() {
  window.ga = function() { /* ... */ };
})();
// 使用 async 尽快开始统计
```

### 对比表

| 属性 | 下载 | 执行时机 | 阻塞解析 | 执行顺序 | DOM 可用 |
|------|------|---------|---------|---------|---------|
| 无 | 阻塞 | 立即 | 是 | 顺序 | 取决于位置 |
| defer | 并行 | DOM完成后 | 否 | 顺序 | 是 |
| async | 并行 | 下载完 | 执行时阻塞 | 不确定 | 不确定 |

### 流程图

```
时间轴（无属性）：
|--- HTML 解析 ---|暂停|--- 下载 + 执行 script ---|恢复|--- HTML 解析 ---|

时间轴（defer）：
|--- HTML 解析（script 后台下载）---|DOM 完成|--- 执行 script ---|

时间轴（async）：
|--- HTML 解析（script 后台下载）---|script 下载完|暂停|执行|恢复|--- HTML 解析 ---|
```

## module 脚本的加载与执行

### ES Module 的特性

```html
<!-- type="module" -->
<script type="module">
  import { sum } from './math.js';
  console.log(sum(1, 2));
</script>

<!-- 默认 defer 行为 -->
<script type="module" src="app.js"></script>
```

**特点**：
1. **默认 defer**：不阻塞解析，DOM 完成后执行
2. **自动严格模式**：`'use strict'` 自动应用
3. **作用域隔离**：顶层变量不污染全局
4. **支持 import/export**

### module vs 普通脚本

```html
<!-- 普通脚本 -->
<script>
  var x = 10;  // 全局变量
  console.log(this === window);  // true
</script>

<!-- module 脚本 -->
<script type="module">
  var x = 10;  // 模块私有
  console.log(this === undefined);  // true
</script>
```

### 动态 import

```javascript
// 条件加载
if (condition) {
  import('./module.js')
    .then(module => {
      module.doSomething();
    });
}

// 按需加载
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js');
  module.initialize();
});
```

**后端类比**：类似于懒加载（Lazy Loading）或动态类加载。

## 工程实践：如何优化首屏加载

### 策略 1：脚本放置位置

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>优化示例</title>
  
  <!-- ❌ 错误：同步脚本在 head -->
  <!-- <script src="app.js"></script> -->
  
  <!-- ✅ 正确：defer 脚本在 head -->
  <script src="app.js" defer></script>
</head>
<body>
  <h1>标题</h1>
  <p>内容</p>
  
  <!-- ❌ 或放在 body 底部（次优） -->
  <!-- <script src="app.js"></script> -->
</body>
</html>
```

### 策略 2：关键路径优化

```html
<head>
  <!-- 1. 内联关键 JS（首屏必需） -->
  <script>
    // 页面加载指示器
    document.documentElement.className += ' js-loading';
  </script>
  
  <!-- 2. defer 加载主应用 -->
  <script src="/js/app.js" defer></script>
  
  <!-- 3. async 加载分析脚本 -->
  <script src="/js/analytics.js" async></script>
  
  <!-- 4. prefetch 下一页脚本 -->
  <link rel="prefetch" href="/js/page2.js">
</head>
```

### 策略 3：代码分割

```javascript
// webpack 配置
module.exports = {
  entry: {
    main: './src/main.js',
    vendor: './src/vendor.js'
  },
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10
        },
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5
        }
      }
    }
  }
};
```

**生成的 HTML**：
```html
<script src="/js/vendor.abc123.js" defer></script>
<script src="/js/common.def456.js" defer></script>
<script src="/js/main.ghi789.js" defer></script>
```

### 策略 4：资源提示

```html
<!-- 预连接到 CDN -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- 预加载关键脚本 -->
<link rel="preload" href="/js/critical.js" as="script">

<!-- 实际使用 -->
<script src="/js/critical.js" defer></script>
```

### 策略 5：SSR + Hydration

```html
<!-- 服务端渲染的 HTML -->
<div id="app">
  <h1>标题</h1>
  <p>服务端渲染的内容</p>
</div>

<!-- 注入初始状态 -->
<script>
  window.__INITIAL_STATE__ = {
    title: '标题',
    content: '服务端渲染的内容'
  };
</script>

<!-- 客户端 hydration -->
<script src="/js/app.js" defer></script>
```

**后端类比**：
- SSR ≈ 服务端生成完整 HTML
- Hydration ≈ 客户端接管交互逻辑

## 常见误区

### 误区 1：所有脚本都用 async

**错误做法**：
```html
<script src="jquery.js" async></script>
<script src="app.js" async></script>
<!-- app.js 可能在 jquery.js 前执行，报错！ -->
```

**正确做法**：
```html
<script src="jquery.js" defer></script>
<script src="app.js" defer></script>
<!-- defer 保证顺序 -->
```

### 误区 2：defer 用于内联脚本

**错误做法**：
```html
<script defer>
  console.log('这不会延迟执行');
</script>
<!-- defer 对内联脚本无效 -->
```

**正确做法**：
```html
<script>
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 完成后执行');
  });
</script>
```

### 误区 3：脚本放 head 没影响

**错误理解**：脚本位置不影响性能。

**实际影响**：
```html
<!-- ❌ 阻塞渲染 -->
<head>
  <script src="huge.js"></script>
</head>
<body>
  <h1>用户等待 huge.js 下载完才能看到这里</h1>
</body>

<!-- ✅ 不阻塞 -->
<head>
  <script src="huge.js" defer></script>
</head>
<body>
  <h1>用户立即看到内容</h1>
</body>
```

## 工程实践示例

### 场景 1：React SPA 的脚本加载

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>React App</title>
  
  <!-- 预连接到 CDN -->
  <link rel="preconnect" href="https://cdn.example.com">
  
  <!-- 预加载关键 chunk -->
  <link rel="preload" href="/static/js/runtime.js" as="script">
  <link rel="preload" href="/static/js/main.chunk.js" as="script">
</head>
<body>
  <div id="root"></div>
  
  <!-- 注入初始状态 -->
  <script>
    window.__INITIAL_STATE__ = <%= JSON.stringify(initialState) %>;
  </script>
  
  <!-- 加载 React 运行时 -->
  <script src="/static/js/runtime.js"></script>
  <script src="/static/js/vendor.chunk.js" defer></script>
  <script src="/static/js/main.chunk.js" defer></script>
  
  <!-- 分析脚本（低优先级） -->
  <script src="/static/js/analytics.js" async></script>
</body>
</html>
```

### 场景 2：多页应用的脚本策略

```html
<!-- 页面 1 -->
<head>
  <!-- 公共库（所有页面共享，可缓存） -->
  <script src="/js/vendor.js" defer></script>
  
  <!-- 当前页面脚本 -->
  <script src="/js/page1.js" defer></script>
  
  <!-- 预取下一页脚本 -->
  <link rel="prefetch" href="/js/page2.js">
</head>
```

### 场景 3：条件加载脚本

```html
<script>
// 根据设备类型加载不同脚本
(function() {
  const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
  const script = document.createElement('script');
  script.src = isMobile ? '/js/mobile.js' : '/js/desktop.js';
  script.defer = true;
  document.head.appendChild(script);
})();
</script>
```

### 场景 4：后端动态生成脚本标签

```javascript
// Express 中间件
app.use((req, res, next) => {
  // 检测客户端支持
  const supportsModules = req.headers['user-agent'].includes('Chrome/6');
  
  res.locals.scriptTag = supportsModules
    ? '<script type="module" src="/js/app.mjs"></script>'
    : '<script src="/js/app.js" defer></script>';
  
  next();
});

// 模板中使用
// <%= scriptTag %>
```

## 深入一点：脚本执行与事件循环

### JavaScript 的执行模型

```javascript
// 同步任务
console.log('1');

// 宏任务
setTimeout(() => {
  console.log('2');
}, 0);

// 微任务
Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 输出：1, 4, 3, 2
```

### 脚本执行在事件循环中的位置

```
事件循环：
1. 执行同步代码（包括脚本）
2. 执行所有微任务（Promise、MutationObserver）
3. 渲染（如果需要）
4. 执行一个宏任务（setTimeout、setInterval）
5. 回到步骤 2
```

### DOMContentLoaded vs load

```javascript
// DOM 构建完成（不等待图片、样式表）
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 完成');
  console.log(document.querySelector('h1'));  // 可访问
});

// 所有资源加载完成（包括图片、样式表）
window.addEventListener('load', () => {
  console.log('完全加载');
  console.log(document.images[0].complete);  // true
});
```

**后端类比**：
- DOMContentLoaded ≈ 数据库连接建立
- load ≈ 所有数据预加载完成

## 参考资源

- [HTML Living Standard - Scripting](https://html.spec.whatwg.org/multipage/scripting.html)
- [MDN - script Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)
- [Web.dev - Efficiently Load JavaScript](https://web.dev/efficiently-load-third-party-javascript/)
