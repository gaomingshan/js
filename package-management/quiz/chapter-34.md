# 第 34 章：性能优化实践 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** 依赖大小

### 题目

如何查看 npm 包的大小？

**选项：**
- A. npm size
- B. npm info <package>
- C. bundlephobia.com
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**查看包大小的方法**

#### 方法 B：npm info ✅

```bash
npm info lodash

# 输出包含：
# dist
#   .tarball: https://...
#   .shasum: ...
#   .integrity: ...
#   .unpackedSize: 1.4 MB  ← 解压后大小
```

#### 方法 C：bundlephobia ✅

访问 https://bundlephobia.com

**显示：**
- Minified size（压缩后）
- Gzipped size（gzip后）
- Download time（下载时间）
- Dependencies（依赖数量）

#### CLI 工具

```bash
# package-size
npx package-size lodash

# 输出：
# Publish size: 544 KB
# Install size: 1.4 MB
```

</details>

---

## 第 2 题 🟢

**类型：** 判断题  
**标签：** Tree Shaking

### 题目

使用 ES Modules 导入可以实现 Tree Shaking。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A

### 📖 解析

**Tree Shaking 原理**

#### ES Modules（可 Tree Shake）

```javascript
// utils.js
export function add(a, b) { return a + b; }
export function sub(a, b) { return a - b; }

// main.js
import { add } from './utils.js';  // 只导入 add

// 打包后：sub 被移除 ✅
```

#### CommonJS（不可 Tree Shake）

```javascript
// utils.js
module.exports = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b
};

// main.js
const { add } = require('./utils.js');

// 打包后：整个对象都包含 ❌
```

#### package.json 配置

```json
{
  "sideEffects": false  // 声明无副作用
}
```

**帮助打包工具优化**

</details>

---

## 第 3 题 🟢

**类型：** 单选题  
**标签：** 按需加载

### 题目

如何实现组件库的按需加载？

**选项：**
- A. 全量导入
- B. 手动导入单个组件
- C. babel-plugin-import
- D. B 和 C 都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**按需加载方案**

#### 方法 B：手动导入 ✅

```javascript
// ❌ 全量导入
import { Button } from 'antd';

// ✅ 按需导入
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
```

#### 方法 C：babel-plugin-import ✅

```javascript
// babel.config.js
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "lib",
      "style": true
    }]
  ]
}
```

**自动转换：**
```javascript
// 写法
import { Button } from 'antd';

// 转换为
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
```

#### 现代方案：exports

**package.json：**
```json
{
  "exports": {
    ".": "./dist/index.js",
    "./button": "./dist/button.js",
    "./input": "./dist/input.js"
  }
}
```

**使用：**
```javascript
import { Button } from 'my-ui/button';
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** 构建优化

### 题目

Webpack 构建优化的方法有哪些？

**选项：**
- A. 代码分割
- B. 压缩代码
- C. 缓存
- D. Tree Shaking

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A、B、C、D

### 📖 解析

**Webpack 构建优化**

#### A. 代码分割 ✅

```javascript
// webpack.config.js
{
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        }
      }
    }
  }
}
```

#### B. 压缩代码 ✅

```javascript
{
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
}
```

#### C. 缓存 ✅

```javascript
{
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache')
  }
}
```

#### D. Tree Shaking ✅

```javascript
{
  optimization: {
    usedExports: true,
    sideEffects: false
  }
}
```

#### 完整配置

```javascript
module.exports = {
  mode: 'production',
  
  optimization: {
    minimize: true,
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      maxSize: 244 * 1024  // 244KB
    }
  },
  
  cache: {
    type: 'filesystem'
  },
  
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
```

</details>

---

## 第 5 题 🟡

**类型：** 代码分析题  
**标签：** CDN优化

### 题目

如何使用 CDN 加速依赖加载？

<details>
<summary>查看答案</summary>

### ✅ 答案

**CDN 加速方案**

#### 方案 1：externals

**webpack.config.js：**
```javascript
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_'
  }
};
```

**index.html：**
```html
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4/lodash.min.js"></script>
```

#### 方案 2：importmap

**index.html：**
```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18",
    "react-dom": "https://esm.sh/react-dom@18"
  }
}
</script>

<script type="module">
import React from 'react';
// 从 CDN 加载
</script>
```

#### 方案 3：动态 CDN

```javascript
// vite.config.js
import { cdn } from 'vite-plugin-cdn-import';

export default {
  plugins: [
    cdn({
      modules: [
        {
          name: 'react',
          var: 'React',
          path: 'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js'
        },
        {
          name: 'react-dom',
          var: 'ReactDOM',
          path: 'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js'
        }
      ]
    })
  ]
};
```

#### 优缺点

**优势：**
- ✅ 减少构建体积
- ✅ 利用浏览器缓存
- ✅ 并行下载

**劣势：**
- ❌ CDN 可靠性
- ❌ 版本管理复杂
- ❌ 本地开发不一致

</details>

---

## 第 6 题 🟡

**类型：** 单选题  
**标签：** 懒加载

### 题目

React 中如何实现组件懒加载？

**选项：**
- A. import()
- B. React.lazy()
- C. loadable
- D. 以上都可以

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**React 懒加载方案**

#### A. import() ✅

```javascript
const Component = () => {
  const [Comp, setComp] = useState(null);
  
  useEffect(() => {
    import('./HeavyComponent').then(module => {
      setComp(() => module.default);
    });
  }, []);
  
  return Comp ? <Comp /> : <Loading />;
};
```

#### B. React.lazy() ✅

```javascript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### C. loadable ✅

```javascript
import loadable from '@loadable/component';

const HeavyComponent = loadable(() => import('./HeavyComponent'), {
  fallback: <Loading />
});

function App() {
  return <HeavyComponent />;
}
```

**支持 SSR**

#### 路由懒加载

```javascript
const routes = [
  {
    path: '/',
    component: React.lazy(() => import('./Home'))
  },
  {
    path: '/about',
    component: React.lazy(() => import('./About'))
  }
];
```

</details>

---

## 第 7 题 🟡

**类型：** 代码输出题  
**标签：** 预加载

### 题目

如何实现资源预加载（Preload/Prefetch）？

<details>
<summary>查看答案</summary>

### ✅ 答案

**资源预加载策略**

#### Preload（高优先级）

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="/main.js" as="script">
<link rel="preload" href="/style.css" as="style">
<link rel="preload" href="/font.woff2" as="font" crossorigin>
```

**立即下载，优先级高**

#### Prefetch（低优先级）

```html
<!-- 预获取未来需要的资源 -->
<link rel="prefetch" href="/next-page.js">
<link rel="prefetch" href="/user-profile.json">
```

**空闲时下载，优先级低**

#### Webpack Magic Comments

```javascript
// Preload
import(/* webpackPreload: true */ './critical');

// Prefetch
import(/* webpackPrefetch: true */ './future');
```

**自动生成 link 标签**

#### 动态预加载

```javascript
function preloadComponent(path) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}

// 鼠标悬停时预加载
<button onMouseEnter={() => preloadComponent('/heavy.js')}>
  加载
</button>
```

#### Vite 配置

```javascript
// vite.config.js
export default {
  build: {
    modulePreload: {
      polyfill: true
    }
  }
};
```

#### 对比

| 方式 | 时机 | 优先级 | 用途 |
|------|------|--------|------|
| **preload** | 立即 | 高 | 当前页关键资源 |
| **prefetch** | 空闲 | 低 | 未来可能需要 |
| **modulepreload** | 立即 | 高 | ES 模块 |

</details>

---

## 第 8 题 🔴

**类型：** 综合分析题  
**标签：** 性能监控

### 题目

如何监控前端性能指标？

<details>
<summary>查看答案</summary>

### ✅ 答案

**前端性能监控**

#### Core Web Vitals

```javascript
import { onCLS, onFID, onLCP } from 'web-vitals';

// LCP - 最大内容绘制
onLCP(metric => {
  console.log('LCP:', metric.value);
  // 目标：< 2.5s
});

// FID - 首次输入延迟
onFID(metric => {
  console.log('FID:', metric.value);
  // 目标：< 100ms
});

// CLS - 累积布局偏移
onCLS(metric => {
  console.log('CLS:', metric.value);
  // 目标：< 0.1
});
```

#### Performance API

```javascript
// 页面加载时间
window.addEventListener('load', () => {
  const perfData = performance.timing;
  const loadTime = perfData.loadEventEnd - perfData.navigationStart;
  
  console.log('页面加载时间:', loadTime);
});

// 资源加载
const resources = performance.getEntriesByType('resource');
resources.forEach(resource => {
  console.log(resource.name, resource.duration);
});
```

#### 自定义性能标记

```javascript
// 标记开始
performance.mark('component-render-start');

// 组件渲染
renderComponent();

// 标记结束
performance.mark('component-render-end');

// 测量
performance.measure(
  'component-render',
  'component-render-start',
  'component-render-end'
);

const measure = performance.getEntriesByName('component-render')[0];
console.log('渲染耗时:', measure.duration);
```

#### 上报系统

```javascript
class PerformanceMonitor {
  constructor(options) {
    this.endpoint = options.endpoint;
    this.metrics = {};
  }

  // 收集指标
  collect() {
    // Web Vitals
    onLCP(metric => this.metrics.lcp = metric.value);
    onFID(metric => this.metrics.fid = metric.value);
    onCLS(metric => this.metrics.cls = metric.value);

    // 自定义指标
    const perfData = performance.timing;
    this.metrics.loadTime = perfData.loadEventEnd - perfData.navigationStart;
    this.metrics.domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    this.metrics.firstPaint = perfData.responseEnd - perfData.fetchStart;
  }

  // 上报
  report() {
    const data = {
      url: location.href,
      ua: navigator.userAgent,
      metrics: this.metrics,
      timestamp: Date.now()
    };

    // Beacon API（可靠）
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, JSON.stringify(data));
    } else {
      fetch(this.endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        keepalive: true
      });
    }
  }

  // 初始化
  init() {
    this.collect();

    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.report();
    });
  }
}

// 使用
const monitor = new PerformanceMonitor({
  endpoint: 'https://api.example.com/metrics'
});

monitor.init();
```

#### 可视化面板

```javascript
// 性能面板
function showPerformancePanel() {
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
  `;

  // 实时更新
  setInterval(() => {
    panel.innerHTML = `
      <div>LCP: ${metrics.lcp}ms</div>
      <div>FID: ${metrics.fid}ms</div>
      <div>CLS: ${metrics.cls}</div>
    `;
  }, 1000);

  document.body.appendChild(panel);
}
```

### 📖 解析

**监控指标**

1. ✅ Core Web Vitals
2. ✅ 页面加载时间
3. ✅ 资源加载时间
4. ✅ 自定义业务指标
5. ✅ 错误监控

</details>

---

## 第 9 题 🔴

**类型：** 场景题  
**标签：** Bundle分析

### 题目

如何分析和优化 Bundle 体积？

<details>
<summary>查看答案</summary>

### ✅ 答案

**Bundle 分析优化**

#### 1. 可视化分析

**webpack-bundle-analyzer：**
```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

```bash
npm run build

# 自动打开可视化报告
# http://localhost:8888
```

#### 2. 识别大包

**从报告中识别：**
- 📦 moment.js (289KB) → 替换为 day.js (7KB)
- 📦 lodash (72KB) → 按需导入
- 📦 重复依赖 → 统一版本

#### 3. 优化策略

**A. 替换大包：**
```javascript
// ❌ 之前
import moment from 'moment';

// ✅ 之后
import dayjs from 'dayjs';
```

**B. 按需导入：**
```javascript
// ❌ 全量
import _ from 'lodash';

// ✅ 按需
import debounce from 'lodash/debounce';
```

**C. 动态导入：**
```javascript
// ❌ 静态
import HeavyChart from './HeavyChart';

// ✅ 动态
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**D. Tree Shaking：**
```javascript
// package.json
{
  "sideEffects": false
}
```

#### 4. 代码分割

```javascript
// webpack.config.js
{
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 分离 node_modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        // 分离公共代码
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
}
```

#### 5. 压缩优化

```javascript
{
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,  // 删除 console
            drop_debugger: true  // 删除 debugger
          }
        }
      })
    ]
  }
}
```

#### 6. 监控预算

**webpack.config.js：**
```javascript
{
  performance: {
    hints: 'error',
    maxEntrypointSize: 250000,  // 244KB
    maxAssetSize: 250000
  }
}
```

**超过预算时构建失败**

#### 完整优化流程

```
1. 分析 Bundle
   ↓
2. 识别大包
   ↓
3. 制定优化方案
   ├─ 替换大包
   ├─ 按需导入
   ├─ 代码分割
   └─ 动态加载
   ↓
4. 实施优化
   ↓
5. 验证效果
   ↓
6. 设置预算
```

### 📖 解析

**优化目标**

- 初始 Bundle < 250KB
- 总 Bundle < 1MB
- 首屏加载 < 3s

</details>

---

## 第 10 题 🔴

**类型：** 代码实现题  
**标签：** 性能优化方案

### 题目

实现一个完整的性能优化方案。

<details>
<summary>查看答案</summary>

### ✅ 答案

**性能优化完整方案**

```javascript
// scripts/performance-optimizer.js

class PerformanceOptimizer {
  constructor() {
    this.config = {
      targetBundleSize: 250 * 1024,  // 250KB
      targetLoadTime: 3000,          // 3s
      minCoverage: 80                // 80%
    };
  }

  // 1. 分析 Bundle
  async analyzeBundle() {
    const { execSync } = require('child_process');
    
    // 构建并分析
    execSync('npm run build -- --analyze', { stdio: 'inherit' });
    
    // 读取统计数据
    const stats = require('../dist/stats.json');
    
    const analysis = {
      totalSize: 0,
      chunks: [],
      modules: []
    };

    stats.assets.forEach(asset => {
      analysis.totalSize += asset.size;
      
      if (asset.name.endsWith('.js')) {
        analysis.chunks.push({
          name: asset.name,
          size: asset.size
        });
      }
    });

    // 找出大模块
    analysis.modules = stats.modules
      .filter(m => m.size > 50 * 1024)
      .map(m => ({
        name: m.name,
        size: m.size
      }))
      .sort((a, b) => b.size - a.size);

    return analysis;
  }

  // 2. 检测问题
  detectIssues(analysis) {
    const issues = [];

    // Bundle 过大
    if (analysis.totalSize > this.config.targetBundleSize) {
      issues.push({
        type: 'bundle-size',
        severity: 'high',
        message: `Bundle 过大: ${(analysis.totalSize / 1024).toFixed(0)}KB`,
        target: `${(this.config.targetBundleSize / 1024).toFixed(0)}KB`
      });
    }

    // 大模块
    analysis.modules.forEach(module => {
      if (module.size > 100 * 1024) {
        issues.push({
          type: 'large-module',
          severity: 'medium',
          message: `大模块: ${module.name}`,
          size: `${(module.size / 1024).toFixed(0)}KB`
        });
      }
    });

    return issues;
  }

  // 3. 生成优化建议
  generateSuggestions(issues) {
    const suggestions = [];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'bundle-size':
          suggestions.push({
            title: '减小 Bundle 体积',
            actions: [
              '使用代码分割',
              '启用 Tree Shaking',
              '按需导入第三方库',
              '使用动态导入'
            ]
          });
          break;

        case 'large-module':
          if (issue.message.includes('moment')) {
            suggestions.push({
              title: '替换 moment.js',
              actions: [
                '使用 day.js (7KB)',
                '或 date-fns (13KB)'
              ]
            });
          } else if (issue.message.includes('lodash')) {
            suggestions.push({
              title: '优化 lodash',
              actions: [
                '使用 lodash-es',
                '按需导入：import debounce from "lodash/debounce"'
              ]
            });
          }
          break;
      }
    });

    return suggestions;
  }

  // 4. 自动优化
  async autoOptimize() {
    console.log('🔧 开始自动优化...\n');

    // 代码分割
    this.enableCodeSplitting();

    // Tree Shaking
    this.enableTreeShaking();

    // 压缩
    this.enableMinification();

    // 缓存
    this.enableCaching();

    console.log('✅ 优化配置已更新\n');
  }

  enableCodeSplitting() {
    const config = `
// webpack.config.js
{
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          priority: -10
        }
      }
    }
  }
}
    `;

    console.log('✓ 代码分割配置');
  }

  enableTreeShaking() {
    const config = `
// package.json
{
  "sideEffects": false
}

// webpack.config.js
{
  optimization: {
    usedExports: true
  }
}
    `;

    console.log('✓ Tree Shaking 配置');
  }

  enableMinification() {
    console.log('✓ 代码压缩配置');
  }

  enableCaching() {
    console.log('✓ 缓存配置');
  }

  // 5. 生成报告
  generateReport(analysis, issues, suggestions) {
    console.log('='.repeat(60));
    console.log('📊 性能优化报告');
    console.log('='.repeat(60));

    // Bundle 信息
    console.log('\n📦 Bundle 分析:');
    console.log(`  总大小: ${(analysis.totalSize / 1024).toFixed(0)}KB`);
    console.log(`  目标: ${(this.config.targetBundleSize / 1024).toFixed(0)}KB`);
    
    if (analysis.totalSize > this.config.targetBundleSize) {
      const excess = analysis.totalSize - this.config.targetBundleSize;
      console.log(`  ⚠️  超出: ${(excess / 1024).toFixed(0)}KB`);
    } else {
      console.log(`  ✅ 符合目标`);
    }

    // Chunks
    console.log('\n📄 主要 Chunks:');
    analysis.chunks.slice(0, 5).forEach(chunk => {
      console.log(`  ${chunk.name}: ${(chunk.size / 1024).toFixed(0)}KB`);
    });

    // 大模块
    if (analysis.modules.length > 0) {
      console.log('\n📦 大模块:');
      analysis.modules.slice(0, 5).forEach(module => {
        console.log(`  ${module.name}: ${(module.size / 1024).toFixed(0)}KB`);
      });
    }

    // 问题
    if (issues.length > 0) {
      console.log('\n⚠️  发现的问题:');
      issues.forEach(issue => {
        console.log(`  [${issue.severity}] ${issue.message}`);
      });
    }

    // 建议
    if (suggestions.length > 0) {
      console.log('\n💡 优化建议:');
      suggestions.forEach((sug, i) => {
        console.log(`\n  ${i + 1}. ${sug.title}`);
        sug.actions.forEach(action => {
          console.log(`     - ${action}`);
        });
      });
    }

    console.log('\n');
  }

  // 主流程
  async run() {
    console.log('🚀 性能优化器\n');

    try {
      // 分析
      const analysis = await this.analyzeBundle();

      // 检测问题
      const issues = this.detectIssues(analysis);

      // 生成建议
      const suggestions = this.generateSuggestions(issues);

      // 生成报告
      this.generateReport(analysis, issues, suggestions);

      // 询问是否自动优化
      if (issues.length > 0) {
        // await this.autoOptimize();
        console.log('提示: 运行 npm run optimize:auto 应用优化');
      }

    } catch (error) {
      console.error('❌ 优化失败:', error);
      process.exit(1);
    }
  }
}

// 运行
const optimizer = new PerformanceOptimizer();
optimizer.run();
```

**package.json：**
```json
{
  "scripts": {
    "build:analyze": "webpack --mode production --analyze",
    "optimize": "node scripts/performance-optimizer.js",
    "optimize:auto": "node scripts/performance-optimizer.js --auto"
  }
}
```

### 📖 解析

**优化流程**

1. ✅ 分析 Bundle
2. ✅ 检测问题
3. ✅ 生成建议
4. ✅ 自动优化
5. ✅ 验证效果

**持续优化！**

</details>

---

**导航**  
[上一章：第 33 章面试题](./chapter-33.md) | [返回目录](../README.md) | [下一章：第 35 章面试题](./chapter-35.md)
