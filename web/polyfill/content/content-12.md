# 按需加载与体积优化

## 核心概念

**按需加载**指仅引入实际使用的 Polyfill，避免全量引入导致的体积膨胀。

核心目标：**最小化包体积，最大化兼容性**

---

## 按需加载的必要性

### 问题：全量引入 Polyfill

**示例**：
```javascript
// ❌ 全量引入 core-js
import 'core-js';

// 实际只使用了 Promise 和 fetch
Promise.resolve(42);
fetch('/api/data');
```

**结果**：
- 引入 core-js：~90 KB
- 实际需要：~16 KB（Promise 6KB + fetch 10KB）
- **浪费**：74 KB（82%）

---

### 包体积对性能的影响

**数据**：
```
包体积每增加 100 KB：
- 下载时间：+500ms（3G 网络）
- 解析时间：+200ms（中端手机）
- 总延迟：~700ms
```

**用户体验影响**：
- 首屏渲染延迟
- TTI（可交互时间）延迟
- 跳出率增加

---

## Babel 的 useBuiltIns: 'usage'

### 智能按需注入

**配置**：
```javascript
// babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}
```

---

### 工作原理

**1. 扫描源码**：
```javascript
// 源码
Promise.resolve(42);
[1, 2, 3].includes(2);
Object.assign({}, { a: 1 });
```

**2. 分析使用的 API**：
```
使用了：
- Promise
- Array.prototype.includes
- Object.assign
```

**3. 查询目标环境支持情况**：
```
targets: "ie 11"

Promise: ❌ 不支持
Array.prototype.includes: ❌ 不支持
Object.assign: ❌ 不支持
```

**4. 自动注入缺失的 Polyfill**：
```javascript
import "core-js/modules/es.promise.js";
import "core-js/modules/es.array.includes.js";
import "core-js/modules/es.object.assign.js";

Promise.resolve(42);
[1, 2, 3].includes(2);
Object.assign({}, { a: 1 });
```

---

### 效果对比

**useBuiltIns: 'entry'**（全量）：
```javascript
import 'core-js';
// 引入 90 KB
```

**useBuiltIns: 'usage'**（按需）：
```javascript
// 自动注入
import "core-js/modules/es.promise.js";        // 6 KB
import "core-js/modules/es.array.includes.js"; // 1 KB
import "core-js/modules/es.object.assign.js";  // 0.5 KB
// 总计：7.5 KB
```

**体积优化**：92%

---

## 动态导入与代码分割

### 场景：按需加载 Polyfill

**问题**：即使使用 `useBuiltIns: 'usage'`，现代浏览器仍会下载 Polyfill 代码（虽然不执行）

**解决方案**：动态加载

---

### 实现方式 1：运行时检测

```javascript
// polyfill-loader.js
async function loadPolyfills() {
  const tasks = [];
  
  // 检测 Promise
  if (typeof Promise === 'undefined') {
    tasks.push(
      import(/* webpackChunkName: "polyfill-promise" */ 
        'core-js/features/promise')
    );
  }
  
  // 检测 fetch
  if (!('fetch' in window)) {
    tasks.push(
      import(/* webpackChunkName: "polyfill-fetch" */ 
        'whatwg-fetch')
    );
  }
  
  // 检测 IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    tasks.push(
      import(/* webpackChunkName: "polyfill-intersection-observer" */ 
        'intersection-observer')
    );
  }
  
  await Promise.all(tasks);
}

// 主入口
async function bootstrap() {
  await loadPolyfills();
  
  // 启动应用
  const { App } = await import('./App');
  new App().mount('#app');
}

bootstrap();
```

**效果**：
- Chrome 90：不加载任何 Polyfill，节省 50 KB
- IE 11：加载所需 Polyfill，50 KB

---

### 实现方式 2：Polyfill.io 动态服务

```html
<!-- 动态加载 Polyfill -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>

<!-- 应用代码（已移除静态 Polyfill） -->
<script src="app.js"></script>
```

**效果**：
- Chrome 90：Polyfill.io 返回 ~2 KB
- IE 11：Polyfill.io 返回 ~50 KB

---

## Tree Shaking 与副作用

### Tree Shaking 原理

**定义**：移除未使用的代码

**前提**：
1. 使用 ES Module（`import`/`export`）
2. 代码无副作用（pure）

---

### Polyfill 的副作用

**问题**：Polyfill 通常有副作用

```javascript
// core-js/modules/es.promise.js
if (typeof Promise === 'undefined') {
  window.Promise = function() { /* ... */ };
}
// 修改全局对象，有副作用
```

**结果**：即使未使用，也不会被 Tree Shaking 移除

---

### 解决方案：使用 pure 版本

```javascript
// ❌ 有副作用（修改全局）
import 'core-js/features/promise';

// ✅ 无副作用（局部导入）
import Promise from 'core-js-pure/features/promise';

const p = Promise.resolve(42);
```

**适用场景**：库开发

---

## Polyfill 体积分析工具

### 1. webpack-bundle-analyzer

**安装**：
```bash
npm install --save-dev webpack-bundle-analyzer
```

**配置**：
```javascript
// webpack.config.js
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

**运行**：
```bash
npm run build
# 自动打开 bundle-report.html
```

---

### 可视化报告

**典型结果**：
```
总包体积：500 KB

├── 业务代码：300 KB (60%)
├── core-js：80 KB (16%)
│   ├── es.promise.js：6 KB
│   ├── es.array.includes.js：1 KB
│   ├── es.object.assign.js：0.5 KB
│   └── 其他：72.5 KB
├── Babel 辅助函数：50 KB (10%)
└── 其他依赖：70 KB (14%)
```

**优化方向**：
- core-js 占比 16%，可以进一步优化
- 识别不必要的 Polyfill

---

### 2. source-map-explorer

**安装**：
```bash
npm install --save-dev source-map-explorer
```

**运行**：
```bash
npx source-map-explorer dist/app.js
```

**输出**：
- 按文件大小排序
- 可视化展示每个模块占比

---

## 优化实战：从 200KB 到 20KB

### 项目背景

- **现状**：包含大量 Polyfill，总体积 200 KB
- **目标**：优化到 20 KB

---

### 第一步：分析现状

**工具**：webpack-bundle-analyzer

**结果**：
```
core-js：180 KB (90%)
业务代码：20 KB (10%)
```

**问题**：全量引入 core-js

---

### 第二步：切换为按需注入

**修改配置**：
```javascript
// ❌ 优化前
import 'core-js';

// ✅ 优化后
// babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}
```

**效果**：
- core-js：180 KB → 30 KB
- 总体积：200 KB → 50 KB
- **优化**：75%

---

### 第三步：调整 targets

**修改配置**：
```javascript
// ❌ 优化前
{
  "targets": "ie 11"
}

// ✅ 优化后
{
  "targets": "> 0.5%, last 2 versions, not dead"
}
```

**效果**：
- core-js：30 KB → 10 KB
- 总体积：50 KB → 30 KB
- **累计优化**：85%

---

### 第四步：使用 @babel/plugin-transform-runtime

**问题**：Babel 辅助函数重复

**配置**：
```bash
npm install --save @babel/runtime-corejs3
npm install --save-dev @babel/plugin-transform-runtime
```

```javascript
// babel.config.js
{
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      "corejs": false,
      "helpers": true,
      "regenerator": true
    }]
  ]
}
```

**效果**：
- Babel 辅助函数：10 KB → 2 KB
- 总体积：30 KB → 22 KB
- **累计优化**：89%

---

### 第五步：动态加载非核心 Polyfill

**实现**：
```javascript
// 核心 Polyfill：打包（Promise、fetch）
// 非核心：动态加载

async function loadNonCorePolyfills() {
  const tasks = [];
  
  if (!('IntersectionObserver' in window)) {
    tasks.push(import('intersection-observer'));
  }
  
  if (!('ResizeObserver' in window)) {
    tasks.push(import('resize-observer-polyfill'));
  }
  
  await Promise.all(tasks);
}
```

**效果**：
- 核心包：22 KB → 20 KB
- 非核心按需加载：2 KB
- **最终优化**：90%

---

### 优化总结

| 步骤 | 操作 | 体积 | 优化率 |
|------|------|------|--------|
| **原始** | 全量 core-js | 200 KB | - |
| **步骤1** | 按需注入 | 50 KB | 75% |
| **步骤2** | 调整 targets | 30 KB | 85% |
| **步骤3** | transform-runtime | 22 KB | 89% |
| **步骤4** | 动态加载 | 20 KB | 90% |

---

## 常见优化技巧

### 1. 使用 lodash-es 而非 lodash

**问题**：
```javascript
import _ from 'lodash'; // 引入整个 lodash（~70 KB）
```

**解决**：
```javascript
import { debounce, throttle } from 'lodash-es'; // 按需引入
// Webpack Tree Shaking 自动移除未使用部分
```

---

### 2. 避免不必要的 Polyfill

**检查代码**：
```javascript
// ❌ 不必要的 Polyfill
import 'core-js/features/array/from';
// 实际代码中没有使用 Array.from
```

**工具**：ESLint 插件检测未使用的导入

---

### 3. 使用 CDN 加载常用库

```html
<!-- 使用 CDN 加载 Polyfill.io -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>

<!-- 本地包不再包含 Polyfill -->
<script src="app.js"></script>
```

**优势**：
- CDN 缓存
- 并行下载
- 减少本地包体积

---

### 4. 代码分割

```javascript
// 路由懒加载
const Home = () => import('./views/Home.vue');
const About = () => import('./views/About.vue');

// 组件懒加载
const HeavyComponent = () => import('./components/Heavy.vue');
```

**效果**：
- 首屏仅加载必要代码
- 其他页面按需加载

---

## 监控与持续优化

### 1. 构建时监控

**配置**：
```javascript
// webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 300000, // 单文件最大 300 KB
    maxEntrypointSize: 500000, // 入口最大 500 KB
    hints: 'warning'
  }
};
```

**效果**：超过阈值时警告

---

### 2. CI/CD 检查

```yaml
# .github/workflows/build.yml
- name: Build
  run: npm run build

- name: Check bundle size
  run: |
    SIZE=$(wc -c < dist/app.js)
    if [ $SIZE -gt 500000 ]; then
      echo "Bundle too large: $SIZE bytes"
      exit 1
    fi
```

---

### 3. 性能预算

**工具**：Lighthouse CI

```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "total-byte-weight": ["error", { "maxNumericValue": 500000 }],
        "unused-javascript": ["error", { "maxNumericValue": 50000 }]
      }
    }
  }
}
```

---

## 实战建议

### 1. 建立基线

**首次优化前**：
- 记录当前包体积
- 分析各部分占比
- 确定优化目标

---

### 2. 逐步优化

**不要一次性大改**：
- 每次优化一个点
- 测试验证
- 记录效果

---

### 3. 定期审查

**每个版本发布前**：
- 检查包体积变化
- 分析新增依赖
- 移除无用代码

---

## 常见陷阱

### ❌ 陷阱 1：过度优化

**问题**：为了减少 1 KB 增加复杂度

**建议**：
- 优先优化大头（> 10 KB）
- 小体积优化注意投入产出比

---

### ❌ 陷阱 2：破坏缓存

**问题**：
```javascript
// ❌ 频繁修改 Polyfill 配置
// 导致用户缓存失效
```

**建议**：
- Polyfill 单独打包
- 设置长期缓存

---

### ❌ 陷阱 3：忽略 gzip 后体积

**提示**：
- 原始体积：200 KB
- gzip 后：60 KB（实际传输）

**建议**：
- 关注 gzip 后体积
- 文本类资源压缩率高

---

## 关键要点

1. **按需加载**：使用 `useBuiltIns: 'usage'` 自动按需注入
2. **动态导入**：运行时检测，按需加载 Polyfill
3. **体积分析**：使用 webpack-bundle-analyzer 定位问题
4. **持续优化**：建立基线、逐步优化、定期审查
5. **性能预算**：设置包体积阈值，CI/CD 自动检查

---

## 下一步

下一章节将学习 **兼容性测试与验证**，确保优化后的代码在各浏览器中正常运行。
