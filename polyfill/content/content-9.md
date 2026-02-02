# Polyfill 服务化方案

## 核心概念

**Polyfill 服务化**指通过 CDN 服务根据用户浏览器**动态返回所需的 Polyfill**，而非在构建时打包所有 Polyfill。

代表：**Polyfill.io**

---

## Polyfill.io 原理

### 工作流程

```
1. 用户访问页面
   ↓
2. 浏览器请求：https://polyfill.io/v3/polyfill.min.js
   ↓
3. 服务器解析 User-Agent
   ↓
4. 判断浏览器类型和版本
   ↓
5. 返回该浏览器缺失的 Polyfill
   ↓
6. 浏览器执行并补齐 API
```

---

### 示例：不同浏览器返回不同内容

**Chrome 90 请求**：
```javascript
// 请求
GET https://polyfill.io/v3/polyfill.min.js

// 响应（几乎为空，现代浏览器不需要 Polyfill）
/* Polyfill service v3.111.0
 * For detailed credits and license, see https://github.com/financial-times/polyfill-service
 */
// 返回 ~2 KB
```

**IE 11 请求**：
```javascript
// 请求
GET https://polyfill.io/v3/polyfill.min.js

// 响应（包含大量 Polyfill）
/* Polyfill service v3.111.0 */
(function(self){
  // Promise Polyfill
  if (!self.Promise) { /* ... */ }
  
  // Array.prototype.includes
  if (!Array.prototype.includes) { /* ... */ }
  
  // ... 数十个 Polyfill
})();
// 返回 ~50 KB
```

---

## 根据 UA 返回差异化 Polyfill

### User-Agent 解析

**示例 UA**：
```
Chrome 90:
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36

IE 11:
Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko
```

**解析结果**：
```javascript
{
  browser: 'Chrome',
  version: '90.0.4430.93'
}

{
  browser: 'IE',
  version: '11.0'
}
```

---

### 特性支持查询

**数据来源**：compat-table 或内部维护的兼容性表

```javascript
// Chrome 90 支持情况
{
  'Promise': true,
  'fetch': true,
  'Array.prototype.includes': true,
  'Object.assign': true
}

// IE 11 支持情况
{
  'Promise': false,
  'fetch': false,
  'Array.prototype.includes': false,
  'Object.assign': false
}
```

---

### 动态生成响应

```javascript
// 伪代码
function generatePolyfill(userAgent) {
  const browser = parseUA(userAgent);
  const polyfills = [];
  
  if (!supports(browser, 'Promise')) {
    polyfills.push(promisePolyfill);
  }
  
  if (!supports(browser, 'fetch')) {
    polyfills.push(fetchPolyfill);
  }
  
  if (!supports(browser, 'Array.prototype.includes')) {
    polyfills.push(arrayIncludesPolyfill);
  }
  
  return polyfills.join('\n');
}
```

---

## 使用 Polyfill.io

### 基础用法

```html
<!-- 最简单的用法 -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>

<!-- 您的应用代码 -->
<script src="app.js"></script>
```

**效果**：
- 自动检测浏览器
- 返回必要的 Polyfill
- 无需构建配置

---

### 指定特性

```html
<!-- 只加载 Promise 和 fetch -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=Promise,fetch"></script>

<!-- 加载多个特性 -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=Array.prototype.includes,Object.assign,Symbol"></script>
```

---

### 高级参数

```html
<!-- flags=gated：仅在浏览器不支持时加载 -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=Promise&flags=gated"></script>

<!-- unknown=polyfill：对未知浏览器返回 Polyfill -->
<script src="https://polyfill.io/v3/polyfill.min.js?unknown=polyfill"></script>

<!-- excludes：排除某些特性 -->
<script src="https://polyfill.io/v3/polyfill.min.js?excludes=Promise"></script>
```

---

## 自建 Polyfill 服务

### 使用场景

1. **内网环境**：无法访问外部 CDN
2. **隐私要求**：不希望暴露用户 UA
3. **定制需求**：特殊 Polyfill 需求
4. **可靠性**：避免依赖第三方服务

---

### 技术方案：polyfill-service

**安装**：
```bash
npm install polyfill-service
```

**部署**：
```javascript
// server.js
const polyfillService = require('polyfill-service');
const express = require('express');

const app = express();

app.get('/polyfill.js', (req, res) => {
  const userAgent = req.headers['user-agent'];
  const features = req.query.features ? req.query.features.split(',') : [];
  
  polyfillService.getPolyfillString({
    uaString: userAgent,
    features: features.length ? features : { default: {} },
    minify: true
  }).then(polyfillCode => {
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'public, max-age=31536000'); // 缓存1年
    res.send(polyfillCode);
  });
});

app.listen(3000, () => {
  console.log('Polyfill service running on http://localhost:3000');
});
```

**使用**：
```html
<script src="http://your-domain.com/polyfill.js"></script>
```

---

## 优缺点分析

### 优势

#### 1. 体积最优化

**对比**：
```
构建时打包 Polyfill：
- Chrome 90：50 KB（不需要但打包了）
- IE 11：50 KB（正好需要）

Polyfill 服务：
- Chrome 90：2 KB（几乎为空）
- IE 11：50 KB（按需返回）
```

**结论**：现代浏览器节省 96% 体积

---

#### 2. 无需构建配置

**传统方式**：
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

**Polyfill 服务**：
```html
<!-- 一行搞定 -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```

---

#### 3. 自动更新

**优势**：
- 服务端更新 Polyfill，客户端自动获取
- 无需重新构建和部署

---

### 劣势

#### 1. 依赖外部服务

**风险**：
- CDN 宕机：页面无法使用
- 网络延迟：增加加载时间
- 跨域限制：某些场景不可用

---

#### 2. 首次加载阻塞

**问题**：
```html
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
<!-- 必须等待 Polyfill 加载完成 -->
<script src="app.js"></script>
```

**影响**：
- DNS 解析：~100ms
- 下载 Polyfill：~200ms
- 总延迟：~300ms

---

#### 3. UA 伪装风险

**问题**：部分用户伪造 UA

```javascript
// 用户伪装为 Chrome 90
navigator.userAgent = 'Chrome/90.0...';

// 实际浏览器：IE 11
// 结果：不返回 Polyfill，代码报错
```

---

#### 4. 隐私问题

**暴露信息**：
- 用户浏览器类型和版本
- 访问时间
- IP 地址

**对策**：自建服务

---

## 备用方案设计

### 方案 1：Fallback 机制

```html
<!-- 主方案：Polyfill.io -->
<script src="https://polyfill.io/v3/polyfill.min.js" onerror="loadBackup()"></script>

<!-- 备用方案：本地 Polyfill -->
<script>
  function loadBackup() {
    const script = document.createElement('script');
    script.src = '/static/polyfill.min.js';
    document.head.appendChild(script);
  }
</script>

<script src="app.js"></script>
```

---

### 方案 2：并行加载

```html
<!-- 同时加载 CDN 和本地 -->
<script src="https://polyfill.io/v3/polyfill.min.js" async></script>
<script src="/static/polyfill-backup.js" async></script>

<!-- 等待任一加载完成 -->
<script>
  Promise.race([
    loadCDN(),
    loadLocal()
  ]).then(() => {
    // 启动应用
  });
</script>
```

---

### 方案 3：混合模式

```javascript
// 核心 Polyfill 打包到本地（Promise、fetch）
import 'core-js/features/promise';
import 'whatwg-fetch';

// 非核心 Polyfill 使用 CDN
<script src="https://polyfill.io/v3/polyfill.min.js?features=Array.prototype.includes,Object.assign"></script>
```

---

## 实战案例：性能优化

### 优化前

**配置**：
```javascript
// webpack + Babel 打包所有 Polyfill
{
  "useBuiltIns": "entry",
  "corejs": 3
}
```

**结果**：
- 包体积：500 KB
- Chrome 90 加载：500 KB
- IE 11 加载：500 KB
- 加载时间：~1.5s

---

### 优化后

**配置**：
```html
<!-- 使用 Polyfill.io -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```

**结果**：
- 包体积：450 KB（移除 Polyfill）
- Chrome 90 加载：450 KB + 2 KB（Polyfill） = 452 KB
- IE 11 加载：450 KB + 50 KB（Polyfill） = 500 KB
- Chrome 90 加载时间：~1.2s（减少 20%）

---

## 性能对比

### 构建时打包 vs 运行时加载

| 方案 | Chrome 90 | IE 11 | 维护成本 |
|------|-----------|-------|----------|
| **构建打包** | 500 KB | 500 KB | 需配置 Babel |
| **Polyfill.io** | 452 KB | 500 KB | 一行代码 |
| **优化率** | 9.6% | 0% | - |

**结论**：
- 现代浏览器受益明显
- 旧浏览器无差异
- 维护成本大幅降低

---

## 最佳实践

### 1. 核心 + CDN 混合

```html
<!-- 核心 Polyfill 打包（防止 CDN 失败） -->
<script src="polyfill-core.js"></script>

<!-- 非核心使用 CDN -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver,ResizeObserver"></script>

<!-- 应用代码 -->
<script src="app.js"></script>
```

---

### 2. 设置缓存策略

```html
<script 
  src="https://polyfill.io/v3/polyfill.min.js" 
  crossorigin="anonymous"
></script>
```

**服务端响应头**：
```
Cache-Control: public, max-age=31536000
Vary: User-Agent
```

**效果**：
- 相同浏览器二次访问命中缓存
- 不同浏览器返回不同内容

---

### 3. 监控加载情况

```javascript
// 监控 Polyfill 加载
const polyfillScript = document.querySelector('script[src*="polyfill.io"]');

polyfillScript.addEventListener('load', () => {
  console.log('Polyfill loaded successfully');
  sendAnalytics('polyfill_load_success');
});

polyfillScript.addEventListener('error', () => {
  console.error('Polyfill load failed');
  sendAnalytics('polyfill_load_failed');
  // 加载备用方案
  loadBackupPolyfill();
});
```

---

## 常见陷阱

### ❌ 陷阱 1：过度依赖 CDN

**问题**：CDN 不可用时页面崩溃

**解决**：
```html
<script src="https://polyfill.io/v3/polyfill.min.js" onerror="loadBackup()"></script>
<script>
  function loadBackup() {
    document.write('<script src="/backup/polyfill.js"><\/script>');
  }
</script>
```

---

### ❌ 陷阱 2：忘记 crossorigin

**问题**：跨域错误无法捕获

```html
<!-- ❌ 错误 -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>

<!-- ✅ 正确 -->
<script src="https://polyfill.io/v3/polyfill.min.js" crossorigin="anonymous"></script>
```

---

### ❌ 陷阱 3：阻塞关键路径

**问题**：同步加载延迟首屏

```html
<!-- ❌ 阻塞渲染 -->
<head>
  <script src="https://polyfill.io/v3/polyfill.min.js"></script>
</head>

<!-- ✅ 异步加载（非关键 Polyfill） -->
<head>
  <script src="https://polyfill.io/v3/polyfill.min.js" async></script>
</head>
```

---

## 自建服务配置示例

### Docker 部署

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install polyfill-service
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
```

**部署**：
```bash
docker build -t polyfill-service .
docker run -d -p 3000:3000 polyfill-service
```

---

## 关键要点

1. **Polyfill.io 原理**：根据 UA 动态返回差异化 Polyfill
2. **优势**：体积最优、无需配置、自动更新
3. **劣势**：依赖外部、首次阻塞、隐私问题
4. **最佳实践**：核心打包 + CDN 混合，设置备用方案
5. **自建服务**：内网或隐私要求场景

---

## 下一步

下一章节将学习 **browserslist 配置**，统一管理目标环境。
