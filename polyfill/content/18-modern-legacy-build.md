# 第 18 章：现代/传统双构建

## 概述

现代/传统双构建（Modern/Legacy Build）是一种差异化交付策略：为现代浏览器提供精简的 ES6+ 代码，为旧浏览器提供完整转译的代码。本章介绍实现方案和最佳实践。

## 一、为什么需要双构建

### 1.1 问题：一刀切的代价

```
所有用户加载相同的 bundle
├── Chrome 100 用户：加载了不需要的 polyfill 和转译代码
├── Safari 14 用户：同上
└── IE 11 用户：确实需要这些代码

结果：95% 的现代浏览器用户承担了 5% 旧浏览器用户的成本
```

### 1.2 解决：差异化交付

```
现代浏览器 → app.modern.js  (50KB)
   ├── ES6+ 原生语法
   ├── 最小化 polyfill
   └── 更好的性能

旧浏览器 → app.legacy.js  (150KB)
   ├── ES5 转译代码
   ├── 完整 polyfill
   └── 保证兼容性
```

### 1.3 收益

| 指标 | 单构建 | 双构建现代版 |
|------|--------|-------------|
| 体积 | 150KB | 50KB |
| 解析时间 | 100ms | 40ms |
| 执行时间 | 80ms | 50ms |

## 二、module/nomodule 模式

### 2.1 原理

```html
<!-- 支持 ES Module 的浏览器（现代）执行 -->
<script type="module" src="app.modern.js"></script>

<!-- 不支持 ES Module 的浏览器（旧）执行 -->
<script nomodule src="app.legacy.js"></script>

<!-- 两者互斥：
     - Chrome 61+、Firefox 60+、Safari 11+ 执行 module
     - IE、旧浏览器执行 nomodule
-->
```

### 2.2 浏览器支持

| 浏览器 | type="module" | nomodule |
|--------|---------------|----------|
| Chrome 61+ | ✅ | ✅ |
| Firefox 60+ | ✅ | ✅ |
| Safari 11+ | ✅ | ✅ |
| Edge 79+ | ✅ | ✅ |
| IE 11 | ❌ | ❌（会执行） |

### 2.3 Safari 10 问题

```html
<!-- Safari 10.1 支持 module 但不支持 nomodule -->
<!-- 会同时加载两个脚本 -->

<!-- 解决方案：Safari 10 检测 -->
<script type="module">
  // Safari 10.1 polyfill
  !function(){var e=document,t=e.createElement("script");
  if(!("noModule"in t)&&"onbeforeload"in t){
    // Safari 10.1 执行这里
    // 可以动态加载 legacy 版本
  }}();
</script>
```

## 三、Vite 双构建配置

### 3.1 使用 @vitejs/plugin-legacy

```bash
npm install -D @vitejs/plugin-legacy
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      // 传统版目标浏览器
      targets: ['defaults', 'not IE 11'],
      
      // 现代版需要的 polyfill
      modernPolyfills: ['es.promise.finally'],
      
      // 是否生成传统版
      renderLegacyChunks: true
    })
  ]
});
```

### 3.2 产物结构

```
dist/
├── assets/
│   ├── index-[hash].js           # 现代版主文件
│   ├── index-legacy-[hash].js    # 传统版主文件
│   ├── polyfills-legacy-[hash].js # 传统版 polyfill
│   └── vendor-[hash].js          # 公共依赖
└── index.html
```

### 3.3 生成的 HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 现代版预加载 -->
  <link rel="modulepreload" href="/assets/index-abc123.js">
</head>
<body>
  <div id="app"></div>
  
  <!-- 传统版 polyfill -->
  <script nomodule src="/assets/polyfills-legacy-xyz789.js"></script>
  
  <!-- 现代版 -->
  <script type="module" src="/assets/index-abc123.js"></script>
  
  <!-- 传统版 -->
  <script nomodule src="/assets/index-legacy-def456.js"></script>
</body>
</html>
```

## 四、webpack 双构建配置

### 4.1 两份配置文件

```javascript
// webpack.modern.config.js
module.exports = {
  output: {
    filename: '[name].modern.[contenthash].js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              targets: { esmodules: true },  // 只针对支持 ESM 的浏览器
              bugfixes: true
            }]
          ]
        }
      }
    }]
  }
};
```

```javascript
// webpack.legacy.config.js
module.exports = {
  output: {
    filename: '[name].legacy.[contenthash].js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              targets: '> 0.5%, not dead',
              useBuiltIns: 'usage',
              corejs: 3
            }]
          ]
        }
      }
    }]
  }
};
```

### 4.2 构建脚本

```json
{
  "scripts": {
    "build:modern": "webpack --config webpack.modern.config.js",
    "build:legacy": "webpack --config webpack.legacy.config.js",
    "build": "npm run build:modern && npm run build:legacy"
  }
}
```

### 4.3 HTML 模板

```html
<!-- index.html 模板 -->
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script type="module" src="<%= modernBundle %>"></script>
  <script nomodule src="<%= legacyBundle %>"></script>
</body>
</html>
```

## 五、手动实现双构建

### 5.1 Babel 配置

```javascript
// babel.config.js
module.exports = api => {
  const isModern = api.env('modern');
  
  return {
    presets: [
      ['@babel/preset-env', {
        targets: isModern 
          ? { esmodules: true }
          : '> 0.5%, not dead',
        useBuiltIns: isModern ? false : 'usage',
        corejs: isModern ? undefined : 3,
        modules: false
      }]
    ]
  };
};
```

### 5.2 构建脚本

```bash
# 现代版
BABEL_ENV=modern webpack --config webpack.config.js --output-path dist/modern

# 传统版
BABEL_ENV=legacy webpack --config webpack.config.js --output-path dist/legacy
```

## 六、服务端差异化交付

### 6.1 基于 UA 的服务端渲染

```javascript
// server.js (Express)
app.get('/', (req, res) => {
  const ua = req.headers['user-agent'];
  const isModern = isModernBrowser(ua);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="app"></div>
      ${isModern 
        ? '<script type="module" src="/app.modern.js"></script>'
        : '<script src="/app.legacy.js"></script>'}
    </body>
    </html>
  `);
});

function isModernBrowser(ua) {
  // 简化的检测逻辑
  return /Chrome\/([6-9]\d|[1-9]\d{2})/.test(ua) ||
         /Firefox\/([6-9]\d|[1-9]\d{2})/.test(ua) ||
         /Safari\/([1-9]\d{2,})/.test(ua);
}
```

### 6.2 Nginx 配置

```nginx
# nginx.conf
map $http_user_agent $js_bundle {
    ~*Chrome/([6-9][0-9]|[1-9][0-9]{2})  /assets/app.modern.js;
    ~*Firefox/([6-9][0-9]|[1-9][0-9]{2}) /assets/app.modern.js;
    default                               /assets/app.legacy.js;
}

location /app.js {
    return 302 $js_bundle;
}
```

## 七、预加载优化

### 7.1 现代版预加载

```html
<head>
  <!-- 现代浏览器预加载 -->
  <link rel="modulepreload" href="/app.modern.js">
  <link rel="modulepreload" href="/vendor.modern.js">
</head>
```

### 7.2 条件预加载

```html
<script>
  // 动态添加预加载
  if ('noModule' in HTMLScriptElement.prototype) {
    // 现代浏览器
    var link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = '/app.modern.js';
    document.head.appendChild(link);
  }
</script>
```

## 八、测试策略

### 8.1 自动化测试

```javascript
// 使用 Playwright 测试两个版本
// playwright.config.js
module.exports = {
  projects: [
    {
      name: 'modern-chrome',
      use: { browserName: 'chromium' }
    },
    {
      name: 'legacy-ie',
      use: {
        browserName: 'chromium',
        // 模拟旧浏览器
        javaScriptEnabled: true
      }
    }
  ]
};
```

### 8.2 手动测试清单

```markdown
# 双构建测试清单

## 现代版（Chrome/Firefox/Safari）
- [ ] 功能正常
- [ ] 体积符合预期
- [ ] 无控制台错误

## 传统版（IE 11 / 旧 Safari）
- [ ] 功能正常
- [ ] Polyfill 加载正确
- [ ] 无语法错误

## 互斥性
- [ ] Chrome 只加载 modern
- [ ] IE 只加载 legacy
```

## 九、注意事项

### 9.1 Safari 10.1 问题

```javascript
// 检测并处理 Safari 10.1
(function() {
  var script = document.createElement('script');
  if (!('noModule' in script) && 'onbeforeload' in script) {
    // Safari 10.1：需要特殊处理
    var legacy = document.createElement('script');
    legacy.src = '/app.legacy.js';
    document.body.appendChild(legacy);
  }
})();
```

### 9.2 动态导入兼容

```javascript
// 现代版使用原生 import()
const module = await import('./chunk.js');

// 传统版需要 polyfill 或回退
// @babel/plugin-syntax-dynamic-import
```

### 9.3 CSS 差异

```html
<!-- 现代 CSS 也可以差异化 -->
<link rel="stylesheet" href="app.modern.css" media="screen and (min-width: 1px)">
<link rel="stylesheet" href="app.legacy.css" media="not all and (min-width: 1px)">
```

## 十、完整示例

### 10.1 Vite 项目

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: ['es.promise.finally']
    })
  ],
  build: {
    target: 'esnext'
  }
});
```

### 10.2 体积对比

```
构建产物：
├── Modern Build
│   ├── index.js      45KB
│   └── vendor.js     80KB
│   └── 总计          125KB
│
└── Legacy Build
    ├── index.js      85KB
    ├── vendor.js     120KB
    └── polyfills.js  45KB
    └── 总计          250KB

现代浏览器用户节省：125KB (50%)
```

## 十一、最佳实践

| 实践 | 说明 |
|------|------|
| 使用 Vite plugin-legacy | 最简单的双构建方案 |
| 测试两个版本 | 确保功能一致 |
| 监控加载情况 | 了解实际用户分布 |
| 考虑 Safari 10 | 处理边界情况 |
| 使用 modulepreload | 优化现代版加载 |

## 参考资料

- [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)
- [Deploying ES2015+ Code in Production Today](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)
- [module/nomodule pattern](https://jakearchibald.com/2017/es-modules-in-browsers/)

---

**完成！** 恭喜你学完了前端兼容性处理的完整内容。

返回 → [目录](../README.md)
