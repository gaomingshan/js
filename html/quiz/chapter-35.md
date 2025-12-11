# 第 35 章：测试 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢 | 测试类型
### 题目
前端测试的类型？**（多选）**

**A.** 单元测试 | **B.** 集成测试 | **C.** E2E测试 | **D.** 性能测试

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
**来源：** 测试金字塔
</details>

---

## 第 2 题 🟢 | 测试框架
### 题目
常见的测试框架？**（多选）**

**A.** Jest | **B.** Vitest | **C.** Cypress | **D.** Playwright

<details><summary>查看答案</summary>
### ✅ 答案：A, B, C, D
**来源：** 测试工具
</details>

---

## 第 3 题 🟢 | Jest 基础
### 题目
基本的 Jest 测试。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

describe('sum function', () => {
  it('should add two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
  
  it('should handle negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3);
  });
});
```
**来源：** Jest
</details>

---

## 第 4 题 🟡 | DOM 测试
### 题目
测试 DOM 操作。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// button.js
function createButton(text) {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', () => {
    button.classList.toggle('active');
  });
  return button;
}

// button.test.js
import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

test('button toggles active class on click', () => {
  const button = createButton('Click me');
  document.body.appendChild(button);
  
  expect(button).not.toHaveClass('active');
  
  fireEvent.click(button);
  expect(button).toHaveClass('active');
  
  fireEvent.click(button);
  expect(button).not.toHaveClass('active');
});
```
**来源：** DOM Testing
</details>

---

## 第 5 题 🟡 | 异步测试
### 题目
测试异步代码。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// api.js
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// api.test.js
test('fetches user data', async () => {
  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ id: 1, name: 'John' })
    })
  );
  
  const user = await fetchUser(1);
  
  expect(user).toEqual({ id: 1, name: 'John' });
  expect(fetch).toHaveBeenCalledWith('/api/users/1');
});

// 使用 done 回调
test('callback test', (done) => {
  setTimeout(() => {
    expect(1 + 1).toBe(2);
    done();
  }, 100);
});
```
**来源：** Async Testing
</details>

---

## 第 6 题 🟡 | Mock
### 题目
使用 Mock 隔离依赖。

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// userService.js
import api from './api';

export async function getUser(id) {
  const data = await api.fetchUser(id);
  return data;
}

// userService.test.js
import { getUser } from './userService';
import api from './api';

jest.mock('./api');

test('getUser fetches user from api', async () => {
  api.fetchUser.mockResolvedValue({ id: 1, name: 'Alice' });
  
  const user = await getUser(1);
  
  expect(user).toEqual({ id: 1, name: 'Alice' });
  expect(api.fetchUser).toHaveBeenCalledWith(1);
});
```
**来源：** Jest Mock
</details>

---

## 第 7 题 🟡 | 覆盖率
### 题目
测试覆盖率配置。

<details><summary>查看答案</summary>
### ✅ 答案
```json
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```
```bash
npm test -- --coverage
```
**来源：** Code Coverage
</details>

---

## 第 8 题 🔴 | E2E 测试
### 题目
使用 Playwright 进行 E2E 测试。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// tests/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });
  
  test('should login successfully', async ({ page }) => {
    // 填写表单
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    
    // 点击登录
    await page.click('button[type="submit"]');
    
    // 等待跳转
    await page.waitForURL('**/dashboard');
    
    // 断言
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });
  
  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error')).toBeVisible();
    await expect(page.locator('.error')).toHaveText('Invalid credentials');
  });
  
  test('should take screenshot on failure', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    
    await page.screenshot({ path: 'tests/screenshots/login-error.png' });
  });
});

// playwright.config.js
module.exports = {
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ]
};
```
**来源：** Playwright
</details>

---

## 第 9 题 🔴 | 视觉回归测试
### 题目
实现视觉回归测试。**（代码题）**

<details><summary>查看答案</summary>
### ✅ 答案
```javascript
// visual.test.js
import { test, expect } from '@playwright/test';

test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  
  // 全页截图
  await expect(page).toHaveScreenshot('homepage.png');
  
  // 元素截图
  const header = page.locator('header');
  await expect(header).toHaveScreenshot('header.png');
});

// 使用 percy
import percySnapshot from '@percy/playwright';

test('visual test with percy', async ({ page }) => {
  await page.goto('/');
  await percySnapshot(page, 'Homepage');
});
```

**配置：**
```javascript
// playwright.config.js
module.exports = {
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100
    }
  }
};
```
**来源：** Visual Regression
</details>

---

## 第 10 题 🔴 | TDD
### 题目
测试驱动开发流程？

<details><summary>查看答案</summary>
### ✅ 答案

**TDD 流程：**
1. 写测试（红）
2. 写代码（绿）
3. 重构（蓝）

```javascript
// 1. 写测试
test('Calculator adds two numbers', () => {
  const calc = new Calculator();
  expect(calc.add(2, 3)).toBe(5);
});

// 运行：❌ 失败（Calculator 不存在）

// 2. 写最少代码让测试通过
class Calculator {
  add(a, b) {
    return a + b;
  }
}

// 运行：✅ 通过

// 3. 重构
class Calculator {
  add(...numbers) {
    return numbers.reduce((sum, n) => sum + n, 0);
  }
}

// 运行：✅ 仍然通过

// 4. 添加更多测试
test('Calculator handles multiple numbers', () => {
  const calc = new Calculator();
  expect(calc.add(1, 2, 3, 4)).toBe(10);
});
```

**优点：**
- 保证代码可测试
- 防止过度设计
- 文档化代码行为

**来源：** TDD
</details>

---

**📌 本章总结**
- 测试类型：单元、集成、E2E
- 框架：Jest, Vitest, Cypress, Playwright
- DOM 测试：@testing-library
- 异步测试：async/await, done
- Mock：隔离依赖
- 覆盖率：代码质量指标
- E2E：用户流程测试
- 视觉回归：UI 变化检测
- TDD：测试驱动开发

**上一章** ← [第 34 章：构建工具](./chapter-34.md)  
**下一章** → [第 36 章：最佳实践](./chapter-36.md)
