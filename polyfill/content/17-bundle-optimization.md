# 第 17 章：减少 Polyfill 体积

## 概述

Polyfill 是打包体积的主要来源之一。本章介绍如何分析和优化 Polyfill 体积，在兼容性和性能之间找到平衡。

## 一、体积问题分析

### 1.1 Polyfill 体积占比

```
典型 SPA 应用打包体积分布：
├── 业务代码      30%
├── 框架代码      40%
├── Polyfill      20%  ← 可优化空间大
└── 其他依赖      10%
```

### 1.2 常见 Polyfill 体积

| Polyfill | 体积（压缩后） |
|----------|---------------|
| core-js 全量 | ~150KB |
| Promise | ~6KB |
| fetch | ~3KB |
| Array 方法 | ~10KB |
| Object 方法 | ~8KB |

### 1.3 体积分析工具

```bash
# webpack-bundle-analyzer
npm install -D webpack-bundle-analyzer
npx webpack --analyze

# source-map-explorer
npm install -D source-map-explorer
npx source-map-explorer dist/bundle.js

# Vite
npx vite-bundle-visualizer
```

## 二、优化策略

### 2.1 使用 usage 模式

```javascript
// ❌ entry 模式可能引入不需要的 polyfill
{
  useBuiltIns: 'entry',
  corejs: 3
}

// ✅ usage 模式按需引入
{
  useBuiltIns: 'usage',
  corejs: '3.30'
}
```

### 2.2 收窄 browserslist

```json
// ❌ 目标过宽
{
  "browserslist": ["> 0.1%"]
}

// ✅ 合理的目标
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead",
    "not IE 11"
  ]
}
```

### 2.3 排除不需要的 Polyfill

```javascript
// babel.config.js
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: '3.30',
      exclude: [
        // 确定不需要的 polyfill
        'es.array.iterator',
        'es.promise.finally'
      ]
    }]
  ]
}
```

### 2.4 单独引入需要的 Polyfill

```javascript
// 只引入确定需要的
import 'core-js/actual/promise';
import 'core-js/actual/array/includes';

// 而非全量
// import 'core-js/stable';
```

## 三、复用辅助函数

### 3.1 问题：重复的 helpers

```javascript
// 每个文件都有辅助函数副本
// a.js
function _classCallCheck() { /* ... */ }

// b.js
function _classCallCheck() { /* ... */ }  // 重复
```

### 3.2 解决：transform-runtime

```bash
npm install -D @babel/plugin-transform-runtime
npm install @babel/runtime
```

```javascript
// babel.config.js
{
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true  // 复用辅助函数
    }]
  ]
}
```

## 四、代码分割

### 4.1 分离 Polyfill chunk

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        polyfills: {
          test: /[\\/]node_modules[\\/](core-js|regenerator-runtime)[\\/]/,
          name: 'polyfills',
          chunks: 'all',
          priority: 10
        }
      }
    }
  }
};
```

### 4.2 Polyfill 长期缓存

```javascript
// 单独的 chunk 可以长期缓存
// polyfills.[contenthash].js 内容变化少
output: {
  filename: '[name].[contenthash].js'
}
```

## 五、条件加载

### 5.1 动态导入 Polyfill

```javascript
// 只在需要时加载
async function loadPolyfills() {
  const polyfills = [];
  
  if (!('Promise' in window)) {
    polyfills.push(import('core-js/actual/promise'));
  }
  
  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }
  
  await Promise.all(polyfills);
}
```

### 5.2 使用 Polyfill.io

```html
<!-- 服务端根据 UA 返回需要的 polyfill -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=Promise,fetch"></script>
```

### 5.3 module/nomodule 双构建

```html
<!-- 现代浏览器：小体积 -->
<script type="module" src="app.modern.js"></script>

<!-- 旧浏览器：包含 polyfill -->
<script nomodule src="app.legacy.js"></script>
```

## 六、Vite + Legacy 插件

### 6.1 配置

```javascript
// vite.config.js
import legacy from '@vitejs/plugin-legacy';

export default {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true,  // 只添加现代浏览器需要的少量 polyfill
      renderLegacyChunks: true  // 生成传统 chunk
    })
  ]
};
```

### 6.2 产物

```
dist/
├── assets/
│   ├── index.abc123.js          # 现代版（小）
│   ├── index-legacy.def456.js   # 传统版（大）
│   └── polyfills-legacy.ghi789.js
└── index.html  # 自动包含 module/nomodule
```

## 七、分析与监控

### 7.1 构建时分析

```javascript
// 添加到 webpack 配置
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

### 7.2 CI 体积监控

```yaml
# .github/workflows/size.yml
- name: Check bundle size
  run: |
    npm run build
    SIZE=$(du -sb dist | cut -f1)
    if [ $SIZE -gt 500000 ]; then
      echo "Bundle too large: $SIZE bytes"
      exit 1
    fi
```

### 7.3 使用 size-limit

```bash
npm install -D size-limit @size-limit/preset-app
```

```json
// package.json
{
  "size-limit": [
    {
      "path": "dist/assets/*.js",
      "limit": "200 KB"
    }
  ],
  "scripts": {
    "size": "size-limit"
  }
}
```

## 八、实际案例

### 8.1 优化前后对比

```
优化前：
├── main.js          450KB
│   └── core-js      150KB (33%)

优化后（usage + 收窄目标）：
├── main.js          280KB
│   └── core-js       50KB (18%)

节省：170KB (38%)
```

### 8.2 优化步骤

```javascript
// 1. 分析当前体积
npx webpack-bundle-analyzer

// 2. 检查 browserslist
npx browserslist

// 3. 调整 Babel 配置
{
  useBuiltIns: 'usage',
  corejs: '3.30',
  exclude: ['es.promise.finally']  // 分析后确定不需要
}

// 4. 使用 transform-runtime
{
  plugins: [['@babel/plugin-transform-runtime', { helpers: true }]]
}

// 5. 代码分割
optimization: {
  splitChunks: { /* ... */ }
}

// 6. 再次分析确认
```

## 九、检查清单

```markdown
# Polyfill 体积优化检查清单

## 配置检查
- [ ] 使用 useBuiltIns: 'usage'
- [ ] 指定 corejs 具体版本
- [ ] browserslist 是否合理
- [ ] 是否使用 transform-runtime

## 分析检查
- [ ] 运行 bundle analyzer
- [ ] 识别最大的 polyfill
- [ ] 确认是否真的需要这些 polyfill

## 优化措施
- [ ] 排除不需要的 polyfill
- [ ] 收窄 browserslist
- [ ] 代码分割 polyfill chunk
- [ ] 考虑条件加载

## 验证
- [ ] 优化后体积下降
- [ ] 功能在目标浏览器正常
- [ ] 设置体积监控
```

## 十、最佳实践

| 实践 | 说明 |
|------|------|
| usage 模式 | 按需加载，避免冗余 |
| 指定 corejs 版本 | 确保精确的 polyfill |
| 合理的目标 | 不要支持已淘汰的浏览器 |
| 复用 helpers | 减少重复代码 |
| 持续监控 | 防止体积回升 |

## 参考资料

- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [size-limit](https://github.com/ai/size-limit)
- [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

---

**下一章** → [第 18 章：现代/传统双构建](./18-modern-legacy-build.md)
