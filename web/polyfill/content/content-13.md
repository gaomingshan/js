# 兼容性测试与验证

## 核心概念

兼容性测试是确保代码在不同浏览器、不同版本中**正常运行**的过程。

核心目标：**尽早发现兼容性问题，避免线上事故**

---

## 真机测试的重要性

### 模拟器 vs 真机

**模拟器的局限性**：
```
Chrome DevTools 模拟 iPhone
  ↓
✅ 可以模拟：屏幕尺寸、触摸事件、UA
❌ 无法模拟：Safari 引擎、iOS 系统特性、实际性能
```

**真机的必要性**：
- Safari 的特殊行为（iOS WebView）
- 实际网络环境
- 真实设备性能
- 系统级兼容性问题

---

### 常见真机专属问题

**iOS Safari**：
```javascript
// 问题 1：Date 解析差异
new Date('2023-1-1'); // Chrome: ✓, iOS Safari: Invalid Date

// 问题 2：100vh 视口高度
.container {
  height: 100vh; // iOS Safari 包含地址栏高度，有 Bug
}

// 问题 3：音频自动播放限制
audio.play(); // iOS Safari 必须用户交互触发
```

---

## BrowserStack、Sauce Labs 云测试平台

### BrowserStack

**特点**：
- 提供真实设备和浏览器
- 支持 3000+ 浏览器/设备组合
- 实时交互测试
- 自动化测试支持

---

### 使用方式

**1. 手动测试**：
```
1. 访问 https://www.browserstack.com/
2. 选择浏览器/设备：IE 11, iPhone 12, Android 10
3. 输入测试 URL：https://your-app.com
4. 实时操作，检查功能
```

**2. 本地测试**：
```bash
# 安装 BrowserStack Local
npm install -g browserstack-local

# 启动本地隧道
browserstack-local --key YOUR_ACCESS_KEY

# 现在可以测试 localhost:3000
```

---

### 自动化测试集成

**配置**：
```javascript
// wdio.conf.js（WebdriverIO + BrowserStack）
exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  
  capabilities: [
    {
      browserName: 'Chrome',
      browser_version: '80.0',
      os: 'Windows',
      os_version: '10'
    },
    {
      browserName: 'Safari',
      browser_version: '13.1',
      os: 'OS X',
      os_version: 'Catalina'
    },
    {
      browserName: 'IE',
      browser_version: '11.0',
      os: 'Windows',
      os_version: '10'
    }
  ],
  
  services: ['browserstack'],
  
  specs: ['./test/specs/**/*.js']
};
```

---

### Sauce Labs

**对比**：

| 特性 | BrowserStack | Sauce Labs |
|------|--------------|------------|
| **真机数量** | 3000+ | 2000+ |
| **价格** | $39/月起 | $49/月起 |
| **集成** | Selenium, Playwright | Selenium, Appium |
| **录屏** | ✅ | ✅ |
| **日志** | ✅ | ✅ |

---

## 本地虚拟机测试环境

### Windows 虚拟机（测试 IE11）

**工具**：VirtualBox + Windows 10 镜像

**步骤**：
```
1. 下载 VirtualBox
   https://www.virtualbox.org/

2. 下载 Windows 10 虚拟机（免费）
   https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/

3. 导入虚拟机
   VirtualBox → 文件 → 导入虚拟电器

4. 启动虚拟机，打开 IE 11

5. 访问宿主机 IP：
   http://192.168.1.100:3000
```

---

### macOS 测试 Safari

**方案 1**：真实 Mac 设备

**方案 2**：macOS 虚拟机（复杂，性能差）

**方案 3**：BrowserStack 云服务（推荐）

---

### Docker 容器测试

**限制**：
- 无法运行真实浏览器（GUI）
- 适合无头浏览器测试（Puppeteer、Playwright）

**配置**：
```dockerfile
FROM node:16

# 安装 Puppeteer 依赖
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libnss3

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "test"]
```

---

## 自动化兼容性测试

### Playwright

**特点**：
- 支持 Chromium、Firefox、WebKit
- 跨浏览器测试
- 现代 API

---

### 配置示例

**安装**：
```bash
npm install --save-dev @playwright/test
```

**配置**：
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
    }
  ]
};
```

---

### 测试用例

```javascript
// tests/compatibility.spec.js
const { test, expect } = require('@playwright/test');

test('Promise 兼容性测试', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 测试 Promise
  const result = await page.evaluate(() => {
    return Promise.resolve(42);
  });
  
  expect(result).toBe(42);
});

test('Array.prototype.includes 兼容性测试', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const result = await page.evaluate(() => {
    return [1, 2, 3].includes(2);
  });
  
  expect(result).toBe(true);
});

test('fetch 兼容性测试', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const hasFetch = await page.evaluate(() => {
    return typeof fetch !== 'undefined';
  });
  
  expect(hasFetch).toBe(true);
});
```

---

### 运行测试

```bash
# 在所有浏览器中运行
npx playwright test

# 仅 Chromium
npx playwright test --project=chromium

# 仅 WebKit（类似 Safari）
npx playwright test --project=webkit
```

---

## Puppeteer 兼容性测试

**限制**：仅支持 Chromium

**适用场景**：
- Chrome/Edge 兼容性测试
- 截图对比测试

**示例**：
```javascript
// test/compat.test.js
const puppeteer = require('puppeteer');

test('ES6 特性兼容性', async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  // 测试箭头函数
  const result = await page.evaluate(() => {
    const add = (a, b) => a + b;
    return add(1, 2);
  });
  
  expect(result).toBe(3);
  
  await browser.close();
});
```

---

## 线上监控：错误上报与分析

### Sentry 错误监控

**安装**：
```bash
npm install @sentry/browser
```

**配置**：
```javascript
// main.js
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  
  // 捕获未处理的 Promise 拒绝
  integrations: [
    new Sentry.Integrations.TryCatch({
      setTimeout: true,
      setInterval: true
    })
  ],
  
  // 环境标识
  environment: process.env.NODE_ENV,
  
  // 上报用户浏览器信息
  beforeSend(event) {
    event.contexts = {
      ...event.contexts,
      browser: {
        name: navigator.userAgent,
        version: navigator.appVersion
      }
    };
    return event;
  }
});
```

---

### 监控 Polyfill 加载失败

```javascript
// 监控 Polyfill.io 加载
const polyfillScript = document.querySelector('script[src*="polyfill.io"]');

polyfillScript.addEventListener('error', (error) => {
  // 上报 Sentry
  Sentry.captureException(new Error('Polyfill load failed'), {
    tags: {
      type: 'polyfill_error'
    },
    extra: {
      src: polyfillScript.src,
      userAgent: navigator.userAgent
    }
  });
  
  // 加载备用方案
  loadBackupPolyfill();
});
```

---

### 监控 API 不兼容错误

```javascript
// 全局错误捕获
window.addEventListener('error', (event) => {
  const error = event.error;
  
  // 识别兼容性错误
  if (
    error.message.includes('is not defined') ||
    error.message.includes('is not a function')
  ) {
    Sentry.captureException(error, {
      tags: {
        type: 'compatibility_error',
        browser: getBrowserInfo()
      }
    });
  }
});

// 未捕获的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason, {
    tags: {
      type: 'promise_rejection'
    }
  });
});
```

---

## 兼容性回归测试策略

### 1. 建立测试套件

**测试矩阵**：
```
浏览器：
  ✓ Chrome 80+
  ✓ Firefox 75+
  ✓ Safari 13+
  ✓ Edge 18+
  ✓ IE 11

关键功能：
  ✓ 用户登录
  ✓ 数据加载
  ✓ 表单提交
  ✓ 支付流程
  ✓ 文件上传
```

---

### 2. 自动化测试流程

**CI/CD 集成**：
```yaml
# .github/workflows/compat-test.yml
name: Compatibility Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Playwright tests
        run: npx playwright test
      
      - name: BrowserStack tests
        env:
          BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
          BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
        run: npm run test:browserstack
```

---

### 3. 回归测试检查清单

**每次发布前**：
```
□ 运行 Playwright 测试（Chromium, Firefox, WebKit）
□ 运行 BrowserStack 测试（IE 11, Safari 13）
□ 检查 Sentry 错误日志（最近 7 天）
□ 手动测试关键路径（登录、支付）
□ 检查包体积变化（是否超过阈值）
□ 验证 Polyfill 加载（Chrome DevTools Network）
```

---

## 兼容性问题调试技巧

### 1. 使用 BrowserStack 实时调试

**步骤**：
```
1. 在 BrowserStack 打开 IE 11
2. 访问测试页面
3. 打开开发者工具（F12）
4. 查看 Console 错误
5. 断点调试
```

---

### 2. Source Map 定位问题

**配置**：
```javascript
// webpack.config.js
module.exports = {
  devtool: 'source-map', // 生成 Source Map
  
  output: {
    filename: 'app.js',
    sourceMapFilename: 'app.js.map'
  }
};
```

**效果**：
- 浏览器显示原始源码
- 错误堆栈指向源文件

---

### 3. 远程调试移动设备

**Android（Chrome）**：
```
1. 手机开启 USB 调试
2. 电脑打开 chrome://inspect
3. 连接手机
4. 点击 "inspect" 调试页面
```

**iOS（Safari）**：
```
1. iPhone 开启 Web Inspector
   设置 → Safari → 高级 → Web Inspector
2. Mac 打开 Safari → 开发 → [设备名]
3. 选择页面，开始调试
```

---

## 视觉回归测试

### Percy.io

**作用**：自动化截图对比

**配置**：
```bash
npm install --save-dev @percy/cli @percy/puppeteer
```

**测试**：
```javascript
// test/visual.test.js
const puppeteer = require('puppeteer');
const percySnapshot = require('@percy/puppeteer');

test('视觉回归测试', async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  // 截图上传 Percy
  await percySnapshot(page, 'Homepage');
  
  await browser.close();
});
```

**效果**：
- 自动截图
- 对比基准版本
- 高亮差异部分

---

## 性能测试

### Lighthouse CI

**配置**：
```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

**运行**：
```bash
npx lhci autorun
```

---

## 常见陷阱

### ❌ 陷阱 1：仅在 Chrome 测试

**问题**：忽略其他浏览器的差异

**建议**：至少测试 Chrome + Firefox + Safari

---

### ❌ 陷阱 2：忽略移动端

**问题**：PC 端正常，移动端崩溃

**建议**：
- 测试 iOS Safari
- 测试 Android Chrome
- 测试不同屏幕尺寸

---

### ❌ 陷阱 3：测试环境与生产不一致

**问题**：
```
测试环境：localhost（HTTP）
生产环境：example.com（HTTPS）
```

**差异**：
- Service Worker 限制
- 混合内容阻止
- Cookie SameSite 策略

**建议**：测试环境尽量模拟生产

---

## 实战检查清单

### 发布前检查

```
□ 本地测试：Chrome, Firefox, Safari
□ 云测试：BrowserStack（IE 11, Safari 13）
□ 自动化测试：Playwright 全部通过
□ 错误监控：Sentry 无新增错误
□ 性能测试：Lighthouse 分数 > 90
□ 包体积：< 500 KB（gzip 后）
□ Polyfill 加载：验证降级方案
```

---

## 关键要点

1. **真机测试**：模拟器无法替代真实设备
2. **云测试平台**：BrowserStack、Sauce Labs 覆盖大量设备
3. **自动化测试**：Playwright、Puppeteer 集成 CI/CD
4. **错误监控**：Sentry 实时捕获线上兼容性问题
5. **回归测试**：建立测试套件，每次发布前验证

---

## 下一步

下一章节将学习 **性能与兼容性权衡**，理解如何在性能和兼容性之间找到平衡点。
