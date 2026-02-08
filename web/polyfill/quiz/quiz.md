# 前端兼容性处理面试题汇总

> 涵盖基础概念、Babel原理、Polyfill策略、工程实践四个部分，共100题。

---

## 第一部分：基础概念（1-25题）

### 1. 前端兼容性问题的本质是什么？

**答案**：前端兼容性问题的本质是**标准演进速度 > 浏览器实现速度 > 用户升级速度**导致的代码在不同浏览器中表现不一致。

**详细解析**：
- **标准演进**：ECMAScript 每年发布新标准
- **浏览器实现**：不同浏览器实现进度不同，存在时间差
- **用户升级**：部分用户使用旧版本浏览器

**易错点**：误以为兼容性问题仅由浏览器差异引起，忽略了标准演进的时间因素。

---

### 2. 语法特性和 API 特性的兼容性处理有何不同？

**答案**：
- **语法特性**：需要**编译时转换**（Transpilation），工具是 Babel
- **API 特性**：需要**运行时填充**（Polyfill），工具是 core-js

**示例**：
```javascript
// 语法特性：箭头函数
const add = (a, b) => a + b; // 需要 Babel 转换

// API 特性：Promise
Promise.resolve(42); // 需要 Polyfill 填充
```

**易错点**：以为 Babel 能解决所有兼容性问题，实际上 Babel 无法添加 API。

---

### 3. Babel 和 Polyfill 的关系是什么？

**答案**：
- **Babel**：编译器，负责**语法转换**
- **Polyfill**：运行时库，负责**API 填充**
- **配合使用**：Babel 可以自动注入 Polyfill（配置 `useBuiltIns: 'usage'`）

**工作流程**：
1. Babel 转换语法（箭头函数 → 普通函数）
2. Babel 扫描代码，识别使用的 API
3. Babel 自动注入缺失的 Polyfill（如 Promise）

---

### 4. 类型擦除对兼容性处理有什么影响？

**答案**：TypeScript 的类型擦除意味着**类型信息在运行时不存在**，因此：
- TypeScript 编译器只能转换语法，不能添加 API
- Polyfill 仍需要 Babel + core-js 处理
- TypeScript 的 `target` 配置决定语法输出版本，但不影响 Polyfill

**配置建议**：
```json
// tsconfig.json
{
  "target": "ES2015" // 控制语法输出
}

// babel.config.js
{
  "useBuiltIns": "usage", // 控制 Polyfill 注入
  "corejs": 3
}
```

---

### 5. 什么是渐进增强和优雅降级？如何选择？

**答案**：

**渐进增强**（推荐）：
- 从基础功能开始，逐步增强
- 所有浏览器都能使用核心功能
- 现代浏览器获得更好体验

**优雅降级**：
- 先实现完整功能，再为旧浏览器降级
- 可能忽略降级逻辑，导致旧浏览器崩溃

**选择**：优先使用渐进增强，确保基础功能可用。

---

### 6. UA 检测和特性检测的优劣是什么？

**答案**：

**特性检测**（推荐）：
```javascript
if ('fetch' in window) {
  // 使用 fetch
} else {
  // 使用 XMLHttpRequest
}
```
- ✅ 准确可靠
- ✅ 面向未来
- ✅ 不受 UA 伪装影响

**UA 检测**（不推荐）：
```javascript
const isIE = /MSIE|Trident/.test(navigator.userAgent);
```
- ❌ UA 可被伪造
- ❌ 新浏览器可能不被识别
- ❌ 维护成本高

**唯一适用场景**：修复特定浏览器的 Bug

---

### 7. browserslist 的作用是什么？

**答案**：browserslist 是**统一的目标浏览器配置工具**，让 Babel、Autoprefixer、ESLint 等工具共享同一份配置。

**优势**：
- 一次配置，全局生效
- 避免配置重复和不一致
- 维护简单

**示例**：
```
> 0.5%
last 2 versions
not dead
```

---

### 8. 常用的 browserslist 查询语法有哪些？

**答案**：
```
> 1%                   全球使用率 > 1%
last 2 versions        每个浏览器最新2个版本
chrome >= 80           Chrome 80及以上
not dead               排除已停止维护的浏览器
> 0.5% in CN           中国使用率 > 0.5%
```

**查看结果**：
```bash
npx browserslist
```

---

### 9. Polyfill 的实现原理是什么？

**答案**：通用模式是**检测 + 模拟实现**：
```javascript
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    // JavaScript 实现
    for (var i = 0; i < this.length; i++) {
      if (this[i] === searchElement) {
        return true;
      }
    }
    return false;
  };
}
```

**关键点**：
1. 检测特性是否存在
2. 如果不存在，提供 JavaScript 实现
3. 遵循 ECMAScript 规范

---

### 10. 哪些特性无法 Polyfill？

**答案**：
1. **Proxy**：无法完美模拟拦截机制
2. **WeakMap/WeakSet**：无法模拟弱引用
3. **Private Fields**（`#field`）：语法特性，非 API
4. **Tail Call Optimization**：引擎优化，无法 JS 实现

**原因**：这些特性依赖引擎底层机制，JavaScript 层面无法完美实现。

---

### 11. core-js@2 和 core-js@3 的主要区别是什么？

**答案**：

| 特性 | core-js@2 | core-js@3 |
|------|-----------|-----------|
| 维护状态 | ❌ 已停止（2018） | ✅ 持续更新 |
| ECMAScript 支持 | ES5-ES2017 | ES5-ES2023+ |
| 模块化 | 较差 | ✅ 完全模块化 |
| 提案支持 | 部分 | ✅ 完整 Stage 3+ |

**推荐**：使用 core-js@3

---

### 12. useBuiltIns 的三个选项有什么区别？

**答案**：

**false**：不自动注入 Polyfill
**entry**：根据 targets 全量导入（~50-100 KB）
**usage**（推荐）：根据代码实际使用按需注入（~5-20 KB）

**示例**：
```javascript
// useBuiltIns: 'usage'
Promise.resolve(42);
[1,2,3].includes(2);

// 自动注入
import "core-js/modules/es.promise.js";
import "core-js/modules/es.array.includes.js";
```

---

### 13. Babel 的编译流程是什么？

**答案**：**Parse → Transform → Generate**

1. **Parse**（解析）：代码 → AST
   - 词法分析：代码 → Tokens
   - 语法分析：Tokens → AST

2. **Transform**（转换）：遍历 AST，修改节点

3. **Generate**（生成）：AST → 目标代码

---

### 14. AST 的作用是什么？

**答案**：AST（抽象语法树）是代码的**树形结构表示**，作用：
- 理解代码语法结构
- 准确识别语法元素
- 保持语义正确
- 支持复杂转换

**优势**：比字符串替换更准确、可靠。

---

### 15. Plugin 和 Preset 的关系是什么？

**答案**：
- **Plugin**：单个转换规则（如转换箭头函数）
- **Preset**：Plugin 的集合（如 @babel/preset-env 包含数十个 Plugin）

**执行顺序**：
- Plugin：从前往后
- Preset：从后往前（注意反向！）

---

### 16. @babel/preset-env 的核心功能是什么？

**答案**：根据目标环境**智能选择需要转换的语法和需要注入的 Polyfill**。

**工作原理**：
1. 读取 `targets` 配置
2. 查询特性支持情况（compat-table）
3. 仅转换目标环境不支持的特性
4. 按需注入 Polyfill

**优势**：避免不必要的转换，体积最优。

---

### 17. Polyfill.io 的工作原理是什么？

**答案**：根据用户浏览器的 User-Agent **动态返回所需的 Polyfill**。

**流程**：
1. 浏览器请求 `https://polyfill.io/v3/polyfill.min.js`
2. 服务器解析 UA，判断浏览器类型和版本
3. 查询该浏览器缺失的 API
4. 返回相应的 Polyfill

**优势**：现代浏览器几乎不下载 Polyfill，体积最优。

---

### 18. 全局污染和局部导入的区别是什么？

**答案**：

**全局污染**（默认）：
```javascript
import 'core-js/features/array/includes';
[1,2,3].includes(2); // 修改 Array.prototype
```
- 适用：应用开发

**局部导入**（pure 版本）：
```javascript
import includes from 'core-js-pure/features/array/includes';
includes([1,2,3], 2); // 不修改全局
```
- 适用：库开发，避免污染用户环境

---

### 19. 什么是 Tree Shaking？Polyfill 能被 Tree Shaking 吗？

**答案**：

**Tree Shaking**：移除未使用的代码

**Polyfill 的局限**：
```javascript
// Polyfill 有副作用（修改全局）
if (!Array.prototype.includes) {
  Array.prototype.includes = function() {};
}
// 即使未使用，也不会被 Tree Shaking 移除
```

**解决方案**：使用 core-js-pure（无副作用）

---

### 20. 如何查看 Babel 转换后的代码？

**答案**：

**方法1**：Babel REPL（在线）
- https://babeljs.io/repl

**方法2**：CLI 命令
```bash
npx babel src/index.js --out-file dist/index.js
```

**方法3**：Webpack 构建后查看 `dist/` 目录

---

### 21. targets 配置对包体积的影响有多大？

**答案**：

| targets | 包体积 | 对比 |
|---------|--------|------|
| chrome >= 90 | 50 KB | 基准 |
| > 0.5%, last 2 versions | 80 KB | +60% |
| ie 11 | 150 KB | +200% |

**结论**：targets 配置直接决定转换范围，对体积影响巨大。

---

### 22. 什么是双构建策略？

**答案**：生成**两份代码**：
- **Modern**：现代浏览器（体积小，性能好）
- **Legacy**：旧浏览器（体积大，兼容性好）

**实现**：
```html
<script type="module" src="app.modern.js"></script>
<script nomodule src="app.legacy.js"></script>
```

**效果**：现代浏览器加载 Modern 版本，旧浏览器加载 Legacy 版本。

---

### 23. 如何检测 Polyfill 是否加载成功？

**答案**：
```javascript
const polyfillScript = document.querySelector('script[src*="polyfill"]');

polyfillScript.addEventListener('load', () => {
  console.log('Polyfill loaded successfully');
});

polyfillScript.addEventListener('error', () => {
  console.error('Polyfill load failed');
  // 加载备用方案
  loadBackupPolyfill();
});
```

---

### 24. 开发环境和生产环境的 targets 配置应该如何区分？

**答案**：

**开发环境**：仅现代浏览器（编译快）
```
last 1 chrome version
```

**生产环境**：广泛兼容
```
> 0.5%, last 2 versions, not dead
```

**配置**：
```
# .browserslistrc
[production]
> 0.5%, last 2 versions, not dead

[development]
last 1 chrome version
```

---

### 25. 兼容性处理的三大代价是什么？

**答案**：
1. **包体积增加**：全量 Polyfill 可达 100+ KB
2. **运行时性能损失**：Polyfill 比原生慢 2-10 倍
3. **开发维护成本**：调试、测试、修复 Bug 时间增加 30-50%

**权衡**：需要基于用户分布和收益做决策。

---

## 第二部分：Babel 与 Polyfill（26-50题）

### 26. @babel/plugin-transform-runtime 的作用是什么？

**答案**：复用 Babel 辅助函数，避免重复。

**问题**：
```javascript
// 多个文件使用 async/await
// 每个文件都包含 _asyncToGenerator 辅助函数（重复）
```

**解决**：
```javascript
{
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      "helpers": true, // 复用辅助函数
      "regenerator": true
    }]
  ]
}
```

**效果**：辅助函数从重复变为引用，减少 10-30 KB

---

### 27. 如何为全局变量添加类型声明（TypeScript）？

**答案**：
```typescript
// global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
      init(): void;
    };
  }
  
  var ENV: 'development' | 'production';
}

export {};
```

---

### 28. 第三方库缺少类型声明怎么办？

**答案**：

**方案1**：安装 @types 包
```bash
npm install --save-dev @types/lodash
```

**方案2**：编写最小声明
```typescript
declare module 'some-lib' {
  export function doSomething(arg: string): void;
}
```

**方案3**：使用 any（不推荐）

---

### 29. Babel 能转换哪些语法特性？

**答案**：

**✅ 可以转换**：
- 箭头函数、class、解构赋值
- async/await、生成器函数
- 模板字符串、扩展运算符
- 可选链、空值合并

**❌ 无法完美转换**：
- Proxy（功能无法完全模拟）
- Generator（需要 regenerator-runtime）
- WeakMap/WeakSet（无法模拟弱引用）

---

### 30. 如何实现按需加载 Polyfill？

**答案**：

**方式1**：Babel 自动注入
```javascript
{
  "useBuiltIns": "usage",
  "corejs": 3
}
```

**方式2**：动态导入
```javascript
async function loadPolyfills() {
  if (typeof Promise === 'undefined') {
    await import('core-js/features/promise');
  }
}
```

---

### 31. webpack-bundle-analyzer 的作用是什么？

**答案**：可视化展示包体积组成，帮助识别优化点。

**安装**：
```bash
npm install --save-dev webpack-bundle-analyzer
```

**使用**：
```javascript
new BundleAnalyzerPlugin()
```

**效果**：生成交互式树状图，显示每个模块的大小。

---

### 32. 如何优化 Babel 编译速度？

**答案**：

**1. 启用缓存**
```javascript
{
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true
    }
  }
}
```

**2. 缩小转换范围**
```javascript
{
  test: /\.js$/,
  exclude: /node_modules/
}
```

**3. 使用 thread-loader**（大型项目）

---

### 33. Polyfill 的性能开销有多大？

**答案**：

**测试**：Promise.all 执行 100万次
- 原生 Promise：~800ms
- Polyfill Promise：~3200ms（慢4倍）

**原因**：
- 原生由 C++ 实现，深度优化
- Polyfill 是纯 JavaScript，性能必然较差

**建议**：优先支持现代浏览器，减少 Polyfill 使用。

---

### 34. 如何测试代码在 IE 11 中的兼容性？

**答案**：

**方法1**：BrowserStack 云测试
**方法2**：本地 Windows 虚拟机
**方法3**：Playwright 自动化测试（但仅模拟，非真实 IE）

**推荐**：BrowserStack（最接近真实环境）

---

### 35. Sentry 如何帮助兼容性监控？

**答案**：

**配置**：
```javascript
Sentry.init({
  beforeSend(event) {
    event.contexts = {
      browser: {
        name: navigator.userAgent,
        version: navigator.appVersion
      }
    };
    return event;
  }
});
```

**效果**：自动捕获兼容性错误，按浏览器分类统计。

---

### 36. Modern 和 Legacy 双构建的优势是什么？

**答案**：

**优势**：
- 现代浏览器：体积小（减少50-70%），性能好
- 旧浏览器：仍能正常运行
- 用户体验最优

**劣势**：
- 构建时间增加（构建两次）
- 配置复杂度提升

---

### 37. 如何在 Vite 中配置兼容性？

**答案**：

**安装**：
```bash
npm install --save-dev @vitejs/plugin-legacy
```

**配置**：
```javascript
import legacy from '@vitejs/plugin-legacy';

export default {
  plugins: [
    legacy({
      targets: ['> 0.5%', 'last 2 versions', 'not dead']
    })
  ]
};
```

**效果**：自动生成 Modern + Legacy 双构建。

---

### 38. 如何处理 CSS 兼容性？

**答案**：

**Autoprefixer**：自动添加 CSS 前缀
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {} // 自动读取 browserslist
  }
};
```

**效果**：
```css
/* 输入 */
.container {
  display: flex;
}

/* 输出 */
.container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

---

### 39. 组件库应该如何处理 Polyfill？

**答案**：

**原则**：库不应包含 Polyfill，避免污染用户环境

**推荐**：
```javascript
// 使用 core-js-pure
import includes from 'core-js-pure/features/array/includes';

export function hasItem(arr, item) {
  return includes(arr, item); // 不污染全局
}
```

---

### 40. 如何实现类型安全的 Polyfill 加载？

**答案**：
```typescript
async function loadPolyfills(): Promise<void> {
  const tasks: Promise<any>[] = [];
  
  if (typeof Promise === 'undefined') {
    tasks.push(import('core-js/features/promise'));
  }
  
  if (!('fetch' in window)) {
    tasks.push(import('whatwg-fetch'));
  }
  
  await Promise.all(tasks);
}
```

---

### 41. 微前端场景下的 Polyfill 如何处理？

**答案**：

**问题**：子应用的 Polyfill 可能冲突

**解决方案**：主应用统一加载
```javascript
// 主应用
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 子应用不打包 Polyfill
{
  "useBuiltIns": false
}
```

---

### 42. 如何查看 browserslist 的匹配结果？

**答案**：
```bash
# 查看匹配的浏览器
npx browserslist

# 查看覆盖率
npx browserslist --coverage

# 查看特定查询
npx browserslist "> 1%"
```

---

### 43. Monorepo 如何统一 Babel 配置？

**答案**：

**根目录**：
```javascript
// babel.config.js
module.exports = {
  presets: ['@babel/preset-env']
};
```

**子项目继承**：
```javascript
// packages/app1/babel.config.js
module.exports = {
  extends: '../../babel.config.js'
};
```

---

### 44. 如何监控包体积变化？

**答案**：

**CI/CD 检查**：
```yaml
- name: Check bundle size
  run: |
    SIZE=$(wc -c < dist/app.js)
    if [ $SIZE -gt 500000 ]; then
      echo "Bundle too large"
      exit 1
    fi
```

**工具**：
- bundlesize
- size-limit

---

### 45. Lighthouse CI 如何帮助性能优化？

**答案**：

**配置**：
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "total-byte-weight": ["error", {"maxNumericValue": 500000}]
      }
    }
  }
}
```

**效果**：超过阈值时 CI 失败，强制优化。

---

### 46. 如何处理 node_modules 中的 ES6+ 代码？

**答案**：

**问题**：第三方库未转换，导致旧浏览器报错

**解决**：
```javascript
{
  test: /\.js$/,
  include: [
    path.resolve('src'),
    path.resolve('node_modules/some-lib') // 指定需要转换的库
  ],
  use: 'babel-loader'
}
```

---

### 47. 性能预算的作用是什么？

**答案**：设置包体积和性能指标的阈值，超过时构建失败。

**Webpack 配置**：
```javascript
{
  performance: {
    maxAssetSize: 300000,      // 单文件最大 300KB
    maxEntrypointSize: 500000, // 入口最大 500KB
    hints: 'error'
  }
}
```

---

### 48. 如何实现渐进式 Web 应用（PWA）的兼容性？

**答案**：

**核心功能**：所有浏览器都能使用基础功能

**增强功能**：
```javascript
if ('serviceWorker' in navigator) {
  // 注册 Service Worker
  navigator.serviceWorker.register('/sw.js');
} else {
  // 降级：无离线功能
  console.log('Service Worker not supported');
}
```

---

### 49. 如何优化首屏加载时间？

**答案**：

**1. 代码分割**
```javascript
const Home = () => import('./Home.vue');
```

**2. 动态加载非核心 Polyfill**

**3. 使用 CDN**

**4. 启用 gzip/brotli 压缩**

---

### 50. 兼容性处理的最佳实践清单是什么？

**答案**：
```
✓ 使用 .browserslistrc 统一目标环境
✓ 配置 useBuiltIns: 'usage' 按需注入
✓ 开发环境仅现代浏览器（提升速度）
✓ 生产环境双构建（Modern + Legacy）
✓ 集成自动化测试（Playwright）
✓ 监控线上错误（Sentry）
✓ 设置性能预算（Lighthouse CI）
✓ 定期审查包体积（webpack-bundle-analyzer）
```

---

## 第三部分：工程实践（51-75题）

### 51. Webpack 中如何配置 Babel？

**答案**：
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true, // 启用缓存
            cacheCompression: false // 开发环境不压缩缓存
          }
        }
      }
    ]
  }
};

// babel.config.js（独立配置更清晰）
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
};
```

**关键点**：
- `cacheDirectory: true` 可提升二次构建速度 80%+
- 配置分离更易维护

---

### 52. Vite 中的 Polyfill 配置有什么特殊之处？

**答案**：

**Vite 默认行为**：
- 开发环境：不转换（使用现代浏览器）
- 生产环境：需手动配置 @vitejs/plugin-legacy

**配置**：
```javascript
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['> 0.5%', 'last 2 versions', 'not dead'],
      modernPolyfills: true, // 为现代浏览器也提供必要的 Polyfill
      renderLegacyChunks: true // 生成 Legacy 版本
    })
  ]
});
```

**工作原理**：
1. 生成 Modern 版本（ES2015+）
2. 生成 Legacy 版本（ES5）
3. 自动注入 `<script type="module">` 和 `<script nomodule>`

---

### 53. Rollup 库打包时如何处理 Polyfill？

**答案**：

**原则**：库不应打包 Polyfill，由使用者决定

**配置**：
```javascript
// rollup.config.js
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs'
    }
  ],
  external: ['core-js'], // Polyfill 标记为外部依赖
  plugins: [
    babel({
      babelHelpers: 'runtime', // 使用 runtime 避免污染全局
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          useBuiltIns: false, // 库不自动注入 Polyfill
          modules: false // 保留 ES Module
        }]
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', {
          corejs: false, // 不使用 core-js
          helpers: true,
          regenerator: true,
          useESModules: true
        }]
      ]
    })
  ]
};
```

**文档说明**：
```markdown
## Installation
npm install your-lib

## Polyfill Requirements
This library requires the following polyfills:
- Promise
- Array.prototype.includes

Please include them in your build configuration.
```

---

### 54. TypeScript 项目的兼容性配置流程是什么？

**答案**：

**1. tsconfig.json**（语法输出）
```json
{
  "compilerOptions": {
    "target": "ES2015", // 控制语法转换级别
    "module": "ESNext",
    "lib": ["ES2015", "DOM"]
  }
}
```

**2. babel.config.js**（Polyfill）
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }],
    '@babel/preset-typescript' // 处理 TS 语法
  ]
};
```

**3. 构建流程**
```
TypeScript → JavaScript (tsc)
    ↓
JavaScript → ES5 + Polyfill (Babel)
```

**或直接使用 Babel**：
```
TypeScript → ES5 + Polyfill (Babel)
```
注意：Babel 不进行类型检查，需配合 `tsc --noEmit`

---

### 55. 如何在 Next.js 中配置兼容性？

**答案**：

**next.config.js**：
```javascript
module.exports = {
  // Next.js 12+ 使用 SWC，无需 Babel
  swcMinify: true,
  
  // 自定义目标浏览器
  target: 'serverless',
  
  // Polyfill 配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false
      };
    }
    return config;
  }
};
```

**如需使用 Babel**（Next.js 11-）：
```javascript
// .babelrc
{
  "presets": [
    ["next/babel", {
      "preset-env": {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    }]
  ]
}
```

---

### 56. Create React App（CRA）如何自定义 Babel 配置？

**答案**：

**问题**：CRA 隐藏了配置

**解决方案1**：使用 CRACO
```bash
npm install @craco/craco
```

```javascript
// craco.config.js
module.exports = {
  babel: {
    presets: [
      ['@babel/preset-env', {
        useBuiltIns: 'usage',
        corejs: 3,
        targets: '> 0.5%, last 2 versions, not dead'
      }]
    ]
  }
};
```

**解决方案2**：eject（不推荐，不可逆）
```bash
npm run eject
```

---

### 57. Vue CLI 项目如何配置兼容性？

**答案**：

**vue.config.js**：
```javascript
module.exports = {
  transpileDependencies: [
    // 指定需要转换的 node_modules
    'vue-echarts',
    'resize-detector'
  ],
  
  // Babel 配置
  chainWebpack: config => {
    config.module
      .rule('js')
      .use('babel-loader')
      .tap(options => ({
        ...options,
        cacheDirectory: true
      }));
  }
};
```

**browserslist**（package.json）：
```json
{
  "browserslist": {
    "production": [
      "> 1%",
      "last 2 versions",
      "not dead"
    ],
    "development": [
      "last 1 chrome version"
    ]
  }
}
```

---

### 58. 如何处理动态导入（import()）的兼容性？

**答案**：

**语法转换**：Babel 自动转换为 `require.ensure`（Webpack）

**Polyfill**：
```javascript
// 如果浏览器不支持 Promise，需先加载 Promise Polyfill
if (typeof Promise === 'undefined') {
  require('core-js/features/promise');
}

// 动态导入
import('./module.js').then(module => {
  module.default();
});
```

**Webpack 配置**：
```javascript
output: {
  chunkFilename: '[name].[contenthash].js'
}
```

---

### 59. Service Worker 的兼容性如何处理？

**答案**：

**特性检测 + 渐进增强**：
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
} else {
  console.log('Service Worker not supported');
  // 应用仍可正常使用，只是没有离线功能
}
```

**注意**：
- Safari 11.1+ 才支持
- 需 HTTPS（localhost 除外）

---

### 60. 如何测试代码在不同浏览器中的兼容性？

**答案**：

**本地测试**：
```javascript
// playwright.config.js
module.exports = {
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ]
};
```

**云测试**：
- BrowserStack
- Sauce Labs
- LambdaTest

**真机测试**：
- iOS Safari：使用真实 iPhone
- Android Chrome：使用真实 Android 设备

---

### 61. Sentry 如何按浏览器分析错误？

**答案**：

**配置**：
```javascript
Sentry.init({
  dsn: 'YOUR_DSN',
  beforeSend(event, hint) {
    // 添加浏览器信息
    event.contexts = {
      ...event.contexts,
      browser: {
        name: bowser.getBrowserName(),
        version: bowser.getBrowserVersion()
      }
    };
    return event;
  }
});
```

**分析**：
1. 打开 Sentry 控制台
2. 按 Browser 字段筛选
3. 识别特定浏览器的高频错误

---

### 62. 如何实现 Polyfill 的按需动态加载？

**答案**：

**Polyfill.io**（推荐）：
```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=Promise,fetch,Array.prototype.includes"></script>
```

**自建方案**：
```javascript
async function loadPolyfills() {
  const polyfills = [];
  
  if (typeof Promise === 'undefined') {
    polyfills.push(import('core-js/features/promise'));
  }
  
  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }
  
  if (!Array.prototype.includes) {
    polyfills.push(import('core-js/features/array/includes'));
  }
  
  await Promise.all(polyfills);
  console.log('Polyfills loaded');
}

loadPolyfills().then(() => {
  // 启动应用
  import('./app.js');
});
```

---

### 63. 如何优化 Polyfill 的加载性能？

**答案**：

**1. 预加载**
```html
<link rel="preload" href="https://polyfill.io/v3/polyfill.min.js" as="script">
```

**2. 异步加载**
```html
<script src="polyfill.js" async></script>
```

**3. 使用 CDN**（减少服务器压力）

**4. 设置缓存**
```
Cache-Control: public, max-age=31536000
```

---

### 64. 微前端架构下的 Polyfill 最佳实践是什么？

**答案**：

**方案1**：主应用统一加载（推荐）
```javascript
// 主应用
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 子应用不打包 Polyfill
// webpack.config.js
externals: {
  'core-js': 'core-js',
  'regenerator-runtime': 'regenerator-runtime'
}
```

**方案2**：沙箱隔离
```javascript
// qiankun 自动处理全局变量隔离
import { registerMicroApps } from 'qiankun';
```

**避免**：每个子应用独立加载 Polyfill（冲突 + 冗余）

---

### 65. 如何监控包体积变化趋势？

**答案**：

**CI/CD 集成**：
```yaml
# .github/workflows/size-check.yml
- name: Build
  run: npm run build

- name: Check size
  run: |
    SIZE=$(wc -c < dist/app.js)
    echo "Bundle size: $SIZE bytes"
    
    # 与上次对比
    if [ $SIZE -gt ${{ secrets.MAX_SIZE }} ]; then
      echo "::error::Bundle size exceeded!"
      exit 1
    fi
```

**工具**：
- bundlesize
- size-limit
- Lighthouse CI

**可视化**：
- 记录每次构建的体积
- 生成趋势图表
- 设置阈值告警

---

### 66. 组件库发布时的 Polyfill 处理策略是什么？

**答案**：

**原则**：不打包 Polyfill，提供清晰的依赖说明

**package.json**：
```json
{
  "peerDependencies": {
    "core-js": "^3.0.0"
  },
  "peerDependenciesMeta": {
    "core-js": {
      "optional": true
    }
  }
}
```

**README.md**：
```markdown
## Polyfill Requirements

This library uses the following modern JavaScript features:
- Promise
- Array.prototype.includes
- Object.assign

### Option 1: Use core-js
\`\`\`bash
npm install core-js
\`\`\`

\`\`\`javascript
import 'core-js/features/promise';
import 'core-js/features/array/includes';
import 'core-js/features/object/assign';
\`\`\`

### Option 2: Configure Babel
\`\`\`javascript
{
  "useBuiltIns": "usage",
  "corejs": 3
}
\`\`\`
```

**构建输出**：
```
dist/
  index.esm.js    # ES Module（保留 ES6+ 语法）
  index.cjs.js    # CommonJS（保留 ES6+ 语法）
  index.umd.js    # UMD（转换为 ES5，不含 Polyfill）
```

---

### 67. 如何实现按浏览器类型的条件加载？

**答案**：

**方式1**：module/nomodule 模式
```html
<!-- 现代浏览器 -->
<script type="module" src="app.modern.js"></script>

<!-- 旧浏览器 -->
<script nomodule src="app.legacy.js"></script>
```

**方式2**：UA 检测（不推荐）
```javascript
const isModernBrowser = (() => {
  try {
    new Function('async () => {}');
    return true;
  } catch {
    return false;
  }
})();

if (isModernBrowser) {
  import('./app.modern.js');
} else {
  import('./app.legacy.js');
}
```

---

### 68. Lighthouse 性能审计如何帮助优化兼容性？

**答案**：

**指标关注**：
- **First Contentful Paint（FCP）**：Polyfill 会延迟首屏
- **Time to Interactive（TTI）**：Polyfill 解析和执行时间
- **Total Blocking Time（TBT）**：主线程阻塞时间

**优化建议**：
```javascript
// 延迟加载非关键 Polyfill
requestIdleCallback(() => {
  import('core-js/features/intl');
});
```

**CI 集成**：
```yaml
- name: Lighthouse CI
  run: lhci autorun
```

---

### 69. 如何处理第三方库的兼容性问题？

**答案**：

**问题**：第三方库可能使用 ES6+ 语法但未转换

**解决方案1**：配置 Babel 转换特定库
```javascript
{
  test: /\.js$/,
  include: [
    path.resolve('src'),
    path.resolve('node_modules/problematic-lib')
  ],
  use: 'babel-loader'
}
```

**解决方案2**：使用库的 ES5 版本
```javascript
// 使用 lodash-es 代替 lodash
import { debounce } from 'lodash-es';
```

**解决方案3**：提 Issue 或提交 PR

---

### 70. 如何设置性能预算？

**答案**：

**Webpack 配置**：
```javascript
module.exports = {
  performance: {
    maxAssetSize: 300000, // 单文件最大 300 KB
    maxEntrypointSize: 500000, // 入口点最大 500 KB
    hints: 'error' // 超出时报错
  }
};
```

**Lighthouse CI**：
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "interactive": ["error", {"maxNumericValue": 5000}],
        "total-byte-weight": ["error", {"maxNumericValue": 500000}]
      }
    }
  }
}
```

**效果**：超过预算时 CI 失败，强制优化

---

### 71. 如何实现渐进式降级方案？

**答案**：

**示例**：图片懒加载
```javascript
if ('IntersectionObserver' in window) {
  // 现代浏览器：使用 IntersectionObserver
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => observer.observe(img));
} else {
  // 旧浏览器：直接加载所有图片
  images.forEach(img => {
    img.src = img.dataset.src;
  });
}
```

---

### 72. 如何处理 ES Module 和 CommonJS 的兼容性？

**答案**：

**库打包**：同时提供两种格式
```javascript
// package.json
{
  "main": "dist/index.cjs.js",     // CommonJS
  "module": "dist/index.esm.js",   // ES Module
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js"
    }
  }
}
```

**Rollup 配置**：
```javascript
export default {
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.esm.js', format: 'esm' }
  ]
};
```

---

### 73. 如何在 Monorepo 中统一兼容性配置？

**答案**：

**根目录配置**：
```javascript
// babel.config.js（根目录）
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
};

// .browserslistrc（根目录）
> 0.5%
last 2 versions
not dead
```

**子包继承**：
```javascript
// packages/app1/babel.config.js
module.exports = {
  extends: '../../babel.config.js',
  // 可覆盖特定配置
};
```

**工具**：
- Lerna
- pnpm workspace
- Yarn workspace

---

### 74. 如何自动化兼容性测试？

**答案**：

**Playwright 跨浏览器测试**：
```javascript
// tests/compatibility.spec.js
import { test, expect } from '@playwright/test';

test.describe('Compatibility Tests', () => {
  test('Promise should work', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
      return Promise.resolve(42);
    });
    expect(result).toBe(42);
  });
  
  test('Array.includes should work', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
      return [1, 2, 3].includes(2);
    });
    expect(result).toBe(true);
  });
});
```

**CI 集成**：
```yaml
- name: Install Playwright
  run: npx playwright install

- name: Run compatibility tests
  run: npm run test:compat
```

---

### 75. 如何记录和跟踪兼容性问题？

**答案**：

**1. 错误监控**（Sentry）
```javascript
Sentry.init({
  beforeSend(event) {
    // 标记兼容性错误
    if (event.exception?.values?.[0]?.value?.includes('not supported')) {
      event.tags = { ...event.tags, type: 'compatibility' };
    }
    return event;
  }
});
```

**2. 建立兼容性清单**
```markdown
# Compatibility Issues Log

## 2024-01-15: Promise.allSettled not supported in iOS 12
- **Impact**: 5% users
- **Solution**: Added polyfill
- **Status**: Fixed
```

**3. 定期审查**
- 每月检查浏览器使用率
- 淘汰支持率 < 0.5% 的旧浏览器
- 更新 browserslist 配置

---

## 第四部分：综合应用与高级话题（76-100题）

### 76. 如何平衡兼容性和性能？

**答案**：

**决策框架**：
1. **分析用户数据**：统计浏览器分布
2. **计算收益**：旧浏览器用户占比 vs 包体积增加
3. **分级策略**：核心功能全兼容，增强功能渐进式

**示例**：
```
用户分布：
- Chrome 90+: 80%
- Chrome 70-89: 15%
- IE 11: 5%

决策：
✓ 为 Chrome 70+ 优化（覆盖 95%）
✓ IE 11 提供基础功能（降级方案）
✗ 不为 IE 11 打包完整 Polyfill（成本过高）
```

**量化指标**：
- 每增加 1% 用户覆盖，包体积增加多少？
- 包体积每增加 10 KB，首屏时间增加多少？

---

### 77. 如何实现真正的按需 Polyfill？

**答案**：

**Polyfill.io 服务端按需**：
```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es2015,es2016,es2017"></script>
```
- 服务器根据 UA 判断浏览器
- 只返回该浏览器缺失的 Polyfill
- Chrome 90 可能只返回空文件

**自建方案**：
```javascript
// 特性检测 + 动态加载
const polyfills = [];

if (!window.Promise) polyfills.push('promise');
if (!Array.prototype.includes) polyfills.push('array-includes');
if (!Object.assign) polyfills.push('object-assign');

if (polyfills.length > 0) {
  const script = document.createElement('script');
  script.src = `/polyfills/${polyfills.join(',')}.js`;
  document.head.appendChild(script);
}
```

---

### 78. Babel 7 和 Babel 8 的主要区别是什么？

**答案**：

**Babel 8 新特性**（预览版）：
1. **完全 ES Module**：配置文件支持 `.mjs`
2. **移除 Stage 预设**：不再支持实验性提案
3. **更好的 TypeScript 支持**
4. **性能提升**：编译速度提升 20-30%

**迁移建议**：
- 检查是否使用 Stage 预设
- 更新所有 `@babel/*` 包到同一版本
- 测试构建流程

---

### 79. 如何处理 Web Components 的兼容性？

**答案**：

**核心技术**：
- Custom Elements
- Shadow DOM
- HTML Templates

**Polyfill**：
```bash
npm install @webcomponents/webcomponentsjs
```

```html
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
```

**特性检测**：
```javascript
if ('customElements' in window && 'attachShadow' in Element.prototype) {
  // 原生支持
  class MyElement extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' });
    }
  }
  customElements.define('my-element', MyElement);
} else {
  // 加载 Polyfill
  import('@webcomponents/webcomponentsjs');
}
```

---

### 80. CSS-in-JS 库的兼容性如何处理？

**答案**：

**styled-components 配置**：
```javascript
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-styled-components', {
      ssr: true,
      displayName: true,
      preprocess: false
    }]
  ]
};
```

**Emotion 配置**：
```javascript
{
  plugins: [
    ['@emotion/babel-plugin', {
      sourceMap: true,
      autoLabel: 'dev-only'
    }]
  ]
}
```

**关键点**：CSS-in-JS 生成的是运行时 CSS，不需要 Autoprefixer，但需确保使用的 JS API 有 Polyfill。

---

### 81. 如何优雅处理 BigInt 的兼容性？

**答案**：

**问题**：BigInt 无法完美 Polyfill（需要原生支持）

**检测**：
```javascript
const supportsBigInt = typeof BigInt !== 'undefined';
```

**降级方案**：
```javascript
function safeBigInt(value) {
  if (typeof BigInt !== 'undefined') {
    return BigInt(value);
  } else {
    // 降级为普通 Number（精度可能损失）
    console.warn('BigInt not supported, using Number');
    return Number(value);
  }
}

// 或使用第三方库
import BN from 'bn.js';
const bigNumber = new BN('12345678901234567890');
```

---

### 82. 如何处理 Intl API 的兼容性？

**答案**：

**Intl API**：国际化 API（日期、数字、货币格式化）

**Polyfill**：
```bash
npm install @formatjs/intl-numberformat
npm install @formatjs/intl-datetimeformat
```

```javascript
// 按需加载
if (!Intl.NumberFormat) {
  await import('@formatjs/intl-numberformat/polyfill');
  await import('@formatjs/intl-numberformat/locale-data/zh');
}

// 使用
const formatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY'
});
console.log(formatter.format(1234.56)); // ¥1,234.56
```

---

### 83. WebAssembly 的兼容性如何处理？

**答案**：

**检测**：
```javascript
const supportsWebAssembly = (() => {
  try {
    if (typeof WebAssembly === 'object' &&
        typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      return module instanceof WebAssembly.Module;
    }
  } catch (e) {}
  return false;
})();
```

**降级方案**：
```javascript
if (supportsWebAssembly) {
  import('./compute.wasm').then(module => {
    // 使用 WASM
  });
} else {
  import('./compute.js').then(module => {
    // 使用纯 JS 实现
  });
}
```

---

### 84. 如何处理 CSS Grid 和 Flexbox 的兼容性？

**答案**：

**CSS Grid**：
- IE 11 部分支持（旧语法）
- 需要 Autoprefixer 转换

**配置**：
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {
      grid: 'autoplace' // 自动添加 IE 11 Grid 前缀
    }
  }
};
```

**降级方案**：
```css
/* 优先使用 Grid */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

/* Flexbox 降级 */
@supports not (display: grid) {
  .container {
    display: flex;
    flex-wrap: wrap;
  }
  .container > * {
    flex: 0 0 33.333%;
  }
}
```

---

### 85. 如何实现 CSS 变量的 Polyfill？

**答案**：

**库**：css-vars-ponyfill
```bash
npm install css-vars-ponyfill
```

```javascript
import cssVars from 'css-vars-ponyfill';

cssVars({
  watch: true, // 监听样式变化
  variables: {
    '--primary-color': '#007bff'
  },
  onlyLegacy: true // 仅为不支持的浏览器加载
});
```

**注意**：Polyfill 有性能开销，优先考虑 Sass 变量作为降级方案。

---

### 86. 如何处理 Proxy 的兼容性？

**答案**：

**核心问题**：Proxy 无法完美 Polyfill

**解决方案**：
1. **使用 Vue 2 风格的响应式**（Object.defineProperty）
2. **提供 Polyfill（proxy-polyfill）**，但功能受限

**proxy-polyfill 限制**：
```javascript
// ✓ 支持：get/set/has
const proxy = new Proxy(target, {
  get(target, prop) {},
  set(target, prop, value) {}
});

// ✗ 不支持：deleteProperty, ownKeys 等
```

**建议**：如果必须支持 IE 11，避免使用 Proxy，改用 Object.defineProperty。

---

### 87. 如何在服务端渲染（SSR）中处理 Polyfill？

**答案**：

**关键原则**：服务端不需要 Polyfill（Node.js 已支持）

**Next.js 配置**：
```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 仅客户端打包 Polyfill
      config.entry = async () => {
        const entries = await config.entry();
        if (entries['main.js'] && !entries['main.js'].includes('./polyfills.js')) {
          entries['main.js'].unshift('./polyfills.js');
        }
        return entries;
      };
    }
    return config;
  }
};
```

**polyfills.js**：
```javascript
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

---

### 88. 如何处理 ES2020+ 的 Optional Chaining 和 Nullish Coalescing？

**答案**：

**语法**：
```javascript
// Optional Chaining
const name = user?.profile?.name;

// Nullish Coalescing
const age = user.age ?? 18;
```

**Babel 插件**：
```bash
npm install @babel/plugin-proposal-optional-chaining
npm install @babel/plugin-proposal-nullish-coalescing-operator
```

**配置**：
```javascript
{
  "plugins": [
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-nullish-coalescing-operator"
  ]
}
```

**或使用 preset-env**（自动包含）：
```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.5%, last 2 versions, not dead"
    }]
  ]
}
```

---

### 89. 如何优化构建性能？

**答案**：

**1. 启用缓存**
```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem'
  }
};
```

**2. 使用 SWC 代替 Babel**（快 20 倍）
```bash
npm install @swc/core swc-loader
```

```javascript
{
  test: /\.js$/,
  use: {
    loader: 'swc-loader',
    options: {
      jsc: {
        parser: { syntax: 'ecmascript' },
        target: 'es5'
      }
    }
  }
}
```

**3. 并行编译**
```bash
npm install thread-loader
```

```javascript
{
  test: /\.js$/,
  use: ['thread-loader', 'babel-loader']
}
```

---

### 90. 如何处理动态 import() 的 Polyfill？

**答案**：

**语法转换**：Babel 自动转换

**Promise Polyfill**：
```javascript
// 确保 Promise 已加载
if (typeof Promise === 'undefined') {
  require('core-js/features/promise');
}

// 使用动态导入
import('./module.js').then(module => {
  module.default();
});
```

**注意**：Webpack/Vite 会将 `import()` 转换为 chunk 加载，不需要额外 Polyfill。

---

### 91. 如何监控和分析真实用户的兼容性数据？

**答案**：

**Google Analytics**：
```javascript
// 发送浏览器信息
gtag('event', 'browser_info', {
  browser: navigator.userAgent,
  supports_promise: typeof Promise !== 'undefined',
  supports_fetch: typeof fetch !== 'undefined'
});
```

**自定义上报**：
```javascript
// 收集特性支持情况
const features = {
  promise: typeof Promise !== 'undefined',
  fetch: 'fetch' in window,
  intersectionObserver: 'IntersectionObserver' in window,
  customElements: 'customElements' in window
};

fetch('/api/analytics/features', {
  method: 'POST',
  body: JSON.stringify({
    features,
    userAgent: navigator.userAgent
  })
});
```

**Sentry 集成**：
```javascript
Sentry.setContext('browser_features', features);
```

---

### 92. 如何实现国际化（i18n）的 Polyfill？

**答案**：

**formatjs 方案**：
```bash
npm install @formatjs/intl
```

```javascript
import { IntlProvider, FormattedMessage } from 'react-intl';

// 按需加载 Polyfill
async function loadPolyfills(locale) {
  const polyfills = [];
  
  if (!Intl.PluralRules) {
    polyfills.push(import('@formatjs/intl-pluralrules/polyfill'));
    polyfills.push(import(`@formatjs/intl-pluralrules/locale-data/${locale}`));
  }
  
  if (!Intl.RelativeTimeFormat) {
    polyfills.push(import('@formatjs/intl-relativetimeformat/polyfill'));
    polyfills.push(import(`@formatjs/intl-relativetimeformat/locale-data/${locale}`));
  }
  
  await Promise.all(polyfills);
}

// 使用
loadPolyfills('zh').then(() => {
  ReactDOM.render(
    <IntlProvider locale="zh" messages={messages}>
      <App />
    </IntlProvider>,
    document.getElementById('root')
  );
});
```

---

### 93. 如何处理 Symbol 和 Iterator 的兼容性？

**答案**：

**Symbol Polyfill**（core-js 自动提供）：
```javascript
// 自动注入
import 'core-js/features/symbol';

// 使用
const mySymbol = Symbol('description');
```

**Iterator Polyfill**：
```javascript
// 为不支持的对象添加 Iterator
if (!String.prototype[Symbol.iterator]) {
  String.prototype[Symbol.iterator] = function*() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  };
}

// 使用
for (const char of 'hello') {
  console.log(char);
}
```

---

### 94. 如何实现 PWA 的兼容性方案？

**答案**：

**渐进增强策略**：
```javascript
// 1. Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// 2. Web App Manifest
const link = document.createElement('link');
link.rel = 'manifest';
link.href = '/manifest.json';
document.head.appendChild(link);

// 3. 通知权限
if ('Notification' in window && 'serviceWorker' in navigator) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('PWA Ready!');
      });
    }
  });
}

// 4. 离线降级
window.addEventListener('online', () => {
  console.log('Back online');
});

window.addEventListener('offline', () => {
  console.log('Offline mode');
});
```

---

### 95. 如何处理性能 API 的兼容性？

**答案**：

**Performance API**：
```javascript
// 检测支持
const supportsPerformanceNow = 'performance' in window && 'now' in performance;

// 降级方案
const now = supportsPerformanceNow
  ? () => performance.now()
  : () => Date.now();

// 使用
const start = now();
// 执行操作
const duration = now() - start;
```

**PerformanceObserver**：
```javascript
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        console.log('Page load time:', entry.loadEventEnd - entry.fetchStart);
      }
    }
  });
  observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
} else {
  // 降级：使用 window.performance.timing
  window.addEventListener('load', () => {
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.fetchStart;
    console.log('Page load time:', loadTime);
  });
}
```

---

### 96. 如何处理跨域资源的兼容性？

**答案**：

**CORS Polyfill**（fetch）：
```javascript
if (!window.fetch) {
  import('whatwg-fetch').then(() => {
    // fetch 已加载
  });
}

// 使用
fetch('https://api.example.com/data', {
  mode: 'cors',
  credentials: 'include'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    // 降级为 JSONP
    loadJSONP('https://api.example.com/data?callback=handleData');
  });

function loadJSONP(url) {
  const script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);
}
```

---

### 97. 如何实现渐进式图片加载的兼容性？

**答案**：

**现代浏览器**：IntersectionObserver + Native Lazy Loading
```html
<img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy" alt="Image">
```

```javascript
if ('loading' in HTMLImageElement.prototype && 'IntersectionObserver' in window) {
  // 原生支持
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.src = img.dataset.src;
  });
} else {
  // Polyfill：使用 IntersectionObserver
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}
```

---

### 98. 如何处理 TypedArray 的兼容性？

**答案**：

**TypedArray**（Uint8Array, Int32Array 等）：
```javascript
// 检测
const supportsTypedArrays = typeof Uint8Array !== 'undefined';

// Polyfill（部分支持）
if (!supportsTypedArrays) {
  // 加载 core-js
  import('core-js/features/typed-array');
}

// 使用
const buffer = new ArrayBuffer(16);
const view = new Uint8Array(buffer);
view[0] = 255;
```

**注意**：IE 10+ 支持 TypedArray，IE 9- 需 Polyfill 但性能较差。

---

### 99. 完整的兼容性配置清单是什么？

**答案**：

**1. 项目配置文件**
```
├── .browserslistrc         # 目标浏览器
├── babel.config.js         # Babel 配置
├── postcss.config.js       # CSS 兼容性
├── tsconfig.json           # TypeScript 配置
└── webpack.config.js       # 构建配置
```

**2. .browserslistrc**
```
> 0.5%
last 2 versions
not dead
not ie <= 10
```

**3. babel.config.js**
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: false,
      helpers: true,
      regenerator: true
    }]
  ]
};
```

**4. postcss.config.js**
```javascript
module.exports = {
  plugins: {
    autoprefixer: {
      grid: 'autoplace'
    }
  }
};
```

**5. package.json**
```json
{
  "dependencies": {
    "core-js": "^3.30.0",
    "regenerator-runtime": "^0.13.11"
  },
  "devDependencies": {
    "@babel/core": "^7.21.0",
    "@babel/preset-env": "^7.21.0",
    "autoprefixer": "^10.4.14",
    "webpack": "^5.80.0",
    "babel-loader": "^9.1.2"
  }
}
```

---

### 100. 兼容性处理的终极最佳实践是什么？

**答案**：

**核心原则**：
```
1. 用户优先：基于真实数据决策
2. 渐进增强：核心功能全兼容，增强功能渐进式
3. 性能至上：避免过度 Polyfill
4. 自动化：CI/CD 集成测试和监控
5. 持续优化：定期审查和更新
```

**实施步骤**：

**Phase 1：数据收集**
- 接入 Google Analytics
- 收集用户浏览器分布
- 分析真实兼容性错误

**Phase 2：配置优化**
```javascript
// 基于数据调整 targets
> 0.5% in CN        // 关注中国市场
last 2 versions     // 覆盖主流版本
not dead            // 排除停止维护的浏览器
chrome >= 70        // 明确最低版本
```

**Phase 3：构建策略**
- 开发环境：仅现代浏览器（快速迭代）
- 生产环境：Modern + Legacy 双构建
- 组件库：不打包 Polyfill（交给使用者）

**Phase 4：测试验证**
```yaml
# CI/CD
- 单元测试（Jest）
- 跨浏览器测试（Playwright）
- 真机测试（BrowserStack）
- 性能测试（Lighthouse CI）
- 包体积检查（size-limit）
```

**Phase 5：监控反馈**
- Sentry 错误监控（按浏览器分类）
- 性能监控（FCP, TTI, TBT）
- 包体积趋势（每次构建记录）

**Phase 6：持续迭代**
```markdown
每月审查：
□ 检查浏览器使用率变化
□ 评估是否可以淘汰旧浏览器支持
□ 更新 browserslist 配置
□ 运行完整测试套件
□ 优化包体积
□ 更新依赖包
```

**最终目标**：
- ✅ 95%+ 用户获得完整体验
- ✅ 剩余 5% 用户获得基础功能
- ✅ 包体积 < 500 KB（gzip 后）
- ✅ FCP < 2s，TTI < 5s
- ✅ 零兼容性相关的生产事故

**记住**：兼容性不是一次性任务，而是持续的工程实践。

---

## 总结

本面试题汇总涵盖了前端兼容性处理的四大核心领域：

1. **基础概念**（1-25题）：兼容性问题本质、检测策略、browserslist 配置
2. **Babel 与 Polyfill**（26-50题）：编译原理、配置实战、core-js 详解
3. **工程实践**（51-75题）：构建工具配置、测试方案、性能优化
4. **综合应用**（76-100题）：高级话题、最佳实践、完整方案

**学习建议**：
- 从基础概念入手，理解兼容性问题的本质
- 深入掌握 Babel 和 Polyfill 的工作原理
- 在实际项目中应用工程实践
- 建立持续优化的意识和流程

**参考资源**：
- Babel 官方文档：https://babeljs.io/docs/
- core-js GitHub：https://github.com/zloirock/core-js
- browserslist：https://github.com/browserslist/browserslist
- Can I Use：https://caniuse.com/
- MDN 兼容性表格：https://developer.mozilla.org/
