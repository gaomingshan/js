# 第 35 章：测试

## 概述

测试确保 HTML 结构正确、可访问性良好、功能正常。

## 一、HTML 验证

### 1.1 W3C Validator

```bash
# 在线验证
https://validator.w3.org/

# 命令行
npm install -g html-validator-cli
html-validator --file=index.html
```

### 1.2 HTMLHint

```javascript
// .htmlhintrc
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "doctype-first": true,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "alt-require": true
}
```

## 二、可访问性测试

### 2.1 axe-core

```javascript
import { axe } from 'axe-core';

axe.run(document, (err, results) => {
  if (err) throw err;
  console.log(results.violations);
});
```

### 2.2 Pa11y

```bash
npx pa11y https://example.com
```

## 三、端到端测试

### 3.1 Playwright

```javascript
const { test, expect } = require('@playwright/test');

test('页面标题正确', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle('网站标题');
});

test('表单提交', async ({ page }) => {
  await page.goto('https://example.com/form');
  await page.fill('input[name="username"]', 'test');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success')).toBeVisible();
});
```

### 3.2 Cypress

```javascript
describe('首页', () => {
  it('显示正确的标题', () => {
    cy.visit('https://example.com');
    cy.get('h1').should('contain', '欢迎');
  });
  
  it('导航链接正常', () => {
    cy.get('nav a').first().click();
    cy.url().should('include', '/about');
  });
});
```

## 四、性能测试

### 4.1 Lighthouse

```bash
# CLI
npm install -g lighthouse
lighthouse https://example.com --output html --output-path ./report.html

# 编程方式
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const chrome = await chromeLauncher.launch();
const results = await lighthouse(url, {port: chrome.port});
```

### 4.2 WebPageTest

```bash
# 在线测试
https://www.webpagetest.org/
```

## 五、视觉回归测试

### 5.1 Percy

```javascript
const percySnapshot = require('@percy/puppeteer');

await page.goto('https://example.com');
await percySnapshot(page, '首页');
```

### 5.2 Chromatic

```bash
npx chromatic --project-token=<token>
```

## 六、测试清单

> **✅ HTML 测试清单**
> 
> **结构**
> - [ ] HTML 验证通过
> - [ ] DOCTYPE 正确
> - [ ] 语义化标签使用正确
> - [ ] 标题层级正确
> 
> **可访问性**
> - [ ] 所有图片有 alt
> - [ ] 表单标签正确关联
> - [ ] ARIA 属性正确
> - [ ] 键盘可操作
> 
> **SEO**
> - [ ] title 和 description
> - [ ] 结构化数据
> - [ ] 语义化标签
> 
> **性能**
> - [ ] 图片优化
> - [ ] 资源压缩
> - [ ] 懒加载
> 
> **兼容性**
> - [ ] 跨浏览器测试
> - [ ] 移动端测试
> - [ ] 响应式设计

## 参考资料

- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)
- [axe-core](https://github.com/dequelabs/axe-core)

---

**上一章** ← [第 34 章：构建工具](./34-build-tools.md)  
**下一章** → [第 36 章：最佳实践](./36-best-practices.md)
