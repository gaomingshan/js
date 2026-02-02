# 目标环境与转换策略

## 核心概念

目标环境（targets）决定了**需要转换哪些语法、注入哪些 Polyfill**，直接影响包体积、性能和兼容性范围。

核心权衡：**兼容范围 vs 包体积 vs 性能**

---

## 如何选择目标环境

### 决策因素

1. **用户浏览器分布数据**
2. **业务场景特点**（To B vs To C）
3. **性能要求**
4. **开发维护成本**

---

### 数据来源

#### 1. Google Analytics

**查看路径**：
```
受众群体 → 技术 → 浏览器和操作系统
```

**示例数据**：
```
Chrome 108:  45%
Safari 16:   20%
Edge 108:    15%
Firefox 107: 10%
Chrome 107:  5%
IE 11:       2%
其他:        3%
```

**决策**：
- IE 11 仅 2%，是否支持？
- 前 5 名覆盖 95%，其他可忽略

---

#### 2. 百度统计/友盟等

**优势**：
- 国内用户数据更准确
- 移动端数据详细

---

#### 3. 服务端日志分析

```javascript
// 服务端记录 User-Agent
app.use((req, res, next) => {
  const ua = req.headers['user-agent'];
  logUserAgent(ua);
  next();
});

// 定期分析
// Chrome 90+: 70%
// Safari 13+: 20%
// Firefox 80+: 8%
// IE 11: 2%
```

---

## 不同目标对包体积的影响

### 实验：同一份代码，不同 targets

**源码**：ES6+ 语法（1000 行）
```javascript
class User {
  constructor(name) {
    this.name = name;
  }
  
  async fetchData() {
    const response = await fetch('/api/user');
    return response.json();
  }
}

const users = [1, 2, 3].map(id => new User(id));
```

---

### targets: "chrome >= 80"（现代浏览器）

**配置**：
```javascript
{
  "targets": "chrome >= 80, firefox >= 75, safari >= 13"
}
```

**转换结果**：
- 语法几乎不转换（原生支持）
- Polyfill 几乎不注入
- **包体积**：50 KB
- **编译时间**：1 秒

---

### targets: "> 0.5%, last 2 versions"（广泛兼容）

**配置**：
```javascript
{
  "targets": "> 0.5%, last 2 versions, not dead"
}
```

**转换结果**：
- 部分语法转换
- 部分 Polyfill 注入
- **包体积**：80 KB
- **编译时间**：2 秒

---

### targets: "ie 11"（完全兼容）

**配置**：
```javascript
{
  "targets": "> 0.5%, ie 11"
}
```

**转换结果**：
- 所有 ES6+ 语法转换为 ES5
- 大量 Polyfill 注入
- **包体积**：150 KB
- **编译时间**：4 秒

---

### 对比总结

| targets | 包体积 | 编译时间 | 兼容范围 |
|---------|--------|---------|----------|
| **chrome >= 80** | 50 KB | 1s | Chrome 80+, Safari 13+ |
| **> 0.5%, last 2** | 80 KB | 2s | 95% 用户 |
| **ie 11** | 150 KB | 4s | 99% 用户（含 IE11） |

**包体积差异**：3 倍
**性能差异**：原生 vs 转换后，可能 2-5 倍差异

---

## Modern vs Legacy 双构建策略

### 原理

生成**两份代码**：
1. **Modern**：现代浏览器，体积小，性能好
2. **Legacy**：旧浏览器，体积大，兼容性好

浏览器根据自身能力选择加载哪份代码。

---

### 实现方式

#### 1. 使用 type="module" 和 nomodule

```html
<!-- 现代浏览器加载（支持 ESM） -->
<script type="module" src="app.modern.js"></script>

<!-- 旧浏览器加载（不支持 ESM） -->
<script nomodule src="app.legacy.js"></script>
```

**效果**：
- Chrome 80+：加载 app.modern.js（50 KB）
- IE 11：加载 app.legacy.js（150 KB）

---

#### 2. Vite 自动实现

**配置**：
```javascript
// vite.config.js
export default {
  build: {
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14']
  }
};
```

**构建结果**：
```
dist/
├── assets/
│   ├── index.modern.js      (50 KB)
│   └── index.legacy.js      (150 KB)
└── index.html
```

**index.html**：
```html
<script type="module" crossorigin src="/assets/index.modern.js"></script>
<script nomodule crossorigin src="/assets/index.legacy.js"></script>
```

---

#### 3. Webpack 配置

```javascript
// webpack.config.js
const path = require('path');

module.exports = [
  // Modern 构建
  {
    name: 'modern',
    entry: './src/index.js',
    output: {
      filename: 'app.modern.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [{
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: 'chrome >= 80, firefox >= 75, safari >= 13',
                modules: false
              }]
            ]
          }
        }
      }]
    }
  },
  
  // Legacy 构建
  {
    name: 'legacy',
    entry: './src/index.js',
    output: {
      filename: 'app.legacy.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [{
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 0.5%, ie 11',
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      }]
    }
  }
];
```

---

### 双构建的优势与劣势

**优势**：
- ✅ 现代浏览器：体积小（减少 50-70%），性能好
- ✅ 旧浏览器：仍能正常运行
- ✅ 用户体验最优

**劣势**：
- ❌ 构建时间增加（构建两次）
- ❌ CI/CD 复杂度提升
- ❌ 需要额外配置

---

## ESM 与 Nomodule 方案

### 浏览器支持检测

**原理**：
```html
<!-- 支持 ESM 的浏览器 -->
<script type="module">
  console.log('Modern browser');
</script>

<!-- 不支持 ESM 的浏览器 -->
<script nomodule>
  console.log('Legacy browser');
</script>
```

---

### 支持情况

| 浏览器 | type="module" | nomodule |
|--------|---------------|----------|
| Chrome 61+ | ✅ | ❌ 忽略 |
| Firefox 60+ | ✅ | ❌ 忽略 |
| Safari 10.1+ | ✅ | ❌ 忽略 |
| Edge 16+ | ✅ | ❌ 忽略 |
| IE 11 | ❌ 忽略 | ✅ 执行 |

---

### 实战示例

**构建配置**：
```javascript
// babel.config.modern.js（Modern）
{
  "targets": { "esmodules": true }
}

// babel.config.legacy.js（Legacy）
{
  "targets": "> 0.5%, ie 11",
  "useBuiltIns": "usage",
  "corejs": 3
}
```

**HTML**：
```html
<!DOCTYPE html>
<html>
<head>
  <title>App</title>
</head>
<body>
  <div id="app"></div>
  
  <!-- Modern 浏览器 -->
  <script type="module" src="app.modern.js"></script>
  
  <!-- Legacy 浏览器 -->
  <script nomodule src="app.legacy.js"></script>
</body>
</html>
```

---

## 动态 Polyfill 加载

### 原理

运行时检测浏览器能力，按需加载 Polyfill。

---

### 实现方式

```javascript
// polyfill-loader.js
async function loadPolyfills() {
  const polyfills = [];
  
  // 检测 Promise
  if (typeof Promise === 'undefined') {
    polyfills.push(import('core-js/features/promise'));
  }
  
  // 检测 fetch
  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }
  
  // 检测 IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }
  
  await Promise.all(polyfills);
}

// 启动应用前加载
loadPolyfills().then(() => {
  import('./app.js').then(({ init }) => {
    init();
  });
});
```

---

### Webpack 动态导入

```javascript
// main.js
async function bootstrap() {
  // 检测并加载 Polyfill
  const polyfillTasks = [];
  
  if (!window.Promise) {
    polyfillTasks.push(import(/* webpackChunkName: "polyfill-promise" */ 'core-js/features/promise'));
  }
  
  if (!window.fetch) {
    polyfillTasks.push(import(/* webpackChunkName: "polyfill-fetch" */ 'whatwg-fetch'));
  }
  
  await Promise.all(polyfillTasks);
  
  // 启动应用
  const { App } = await import('./App');
  new App().mount('#app');
}

bootstrap();
```

**优势**：
- 现代浏览器：不加载任何 Polyfill
- 旧浏览器：仅加载需要的 Polyfill

---

## 实战案例：性能优化

### 项目背景

- **用户分布**：Chrome 80+ (70%), Safari 13+ (20%), IE 11 (3%), 其他 (7%)
- **现状**：为了兼容 IE 11，所有用户都加载大量 Polyfill
- **问题**：包体积 500 KB，首屏加载 3 秒

---

### 优化方案：双构建

**配置**：
```javascript
// Modern（90% 用户）
{
  "targets": "chrome >= 80, safari >= 13, firefox >= 75"
}

// Legacy（10% 用户）
{
  "targets": "> 0.5%, ie 11",
  "useBuiltIns": "usage",
  "corejs": 3
}
```

---

### 优化效果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| **Modern 包体积** | 500 KB | 300 KB | 40% |
| **Legacy 包体积** | 500 KB | 550 KB | -10% |
| **90% 用户加载时间** | 3s | 1.5s | 50% |
| **10% 用户加载时间** | 3s | 3.2s | -6% |

**结论**：
- 90% 用户体验大幅提升
- 10% 用户体验略微下降（可接受）

---

## 决策模型

### 兼容范围 vs 性能损失

**场景 1**：技术博客（开发者群体）
```
targets: last 1 chrome version, last 1 firefox version
覆盖率: 80%
性能: 极致
决策: ✅ 不兼容旧浏览器，显示升级提示
```

---

**场景 2**：电商网站（大众用户）
```
targets: > 0.5%, last 2 versions, not dead
覆盖率: 95%
性能: 良好
决策: ✅ 广泛兼容，但不支持 IE 11（仅 3%）
```

---

**场景 3**：政务系统（强制兼容 IE）
```
targets: > 0.5%, ie 11
覆盖率: 99%
性能: 较差（但必须）
决策: ✅ 全面兼容，牺牲性能
```

---

**场景 4**：企业内部系统（可控环境）
```
targets: chrome >= 90
覆盖率: 100%（统一安装）
性能: 极致
决策: ✅ 不做任何兼容处理
```

---

## 常见陷阱

### ❌ 陷阱 1：过度兼容

```javascript
// ❌ 兼容所有浏览器（包括已停止维护的）
{
  "targets": "> 0.1%"
}

// 结果：包体积增大 3 倍，但只为 0.5% 用户服务
```

**建议**：
```javascript
// ✅ 排除已停止维护的浏览器
{
  "targets": "> 0.5%, not dead"
}
```

---

### ❌ 陷阱 2：开发环境配置过重

```javascript
// ❌ 开发环境也兼容 IE 11
{
  "targets": "ie 11"
}

// 结果：编译慢，热更新慢，开发效率低
```

**建议**：
```javascript
// ✅ 开发环境仅现代浏览器
[development]
last 1 chrome version

[production]
> 0.5%, ie 11
```

---

### ❌ 陷阱 3：忽略移动端

```javascript
// ❌ 仅配置桌面浏览器
{
  "targets": "chrome >= 80, firefox >= 75"
}

// 问题：移动端可能不兼容
```

**建议**：
```javascript
// ✅ 包含移动端
{
  "targets": "chrome >= 80, ios_saf >= 13, and_chr >= 80"
}
```

---

## 关键要点

1. **数据驱动**：基于实际用户分布选择 targets
2. **双构建**：Modern + Legacy，兼顾性能与兼容性
3. **动态加载**：运行时按需加载 Polyfill
4. **环境区分**：开发环境追求速度，生产环境追求兼容
5. **权衡决策**：兼容范围 vs 包体积 vs 性能，没有完美方案

---

## 下一步

下一章节将学习 **按需加载与体积优化**，掌握包体积优化的核心技巧。
