# HTML 的测试与验证

## 核心概念

HTML 测试确保结构正确、语义合理、可访问性良好。

## HTML 结构的单元测试

```javascript
// Jest + Testing Library
import { render, screen } from '@testing-library/react';

test('渲染文章组件', () => {
  render(<Article title="标题" content="内容" />);
  
  // 测试语义结构
  expect(screen.getByRole('article')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('标题');
});

// 测试 DOM 结构
test('导航包含正确链接', () => {
  render(<Nav />);
  
  const nav = screen.getByRole('navigation');
  const links = within(nav).getAllByRole('link');
  
  expect(links).toHaveLength(3);
  expect(links[0]).toHaveAttribute('href', '/');
});
```

## 语义化验证工具

### HTML Validator

```bash
# W3C HTML Validator
npm install -g html-validator-cli
html-validator --file=index.html --format=text

# 输出示例
# Error: Element div not allowed as child of element p
# Warning: Section lacks heading
```

### axe-core（可访问性）

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('无可访问性问题', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  
  expect(results).toHaveNoViolations();
});
```

## 可访问性测试

```javascript
// ARIA 属性测试
test('按钮有正确的 ARIA 标签', () => {
  render(<button aria-label="关闭对话框">×</button>);
  
  expect(screen.getByLabelText('关闭对话框')).toBeInTheDocument();
});

// 键盘导航测试
test('支持键盘操作', () => {
  render(<Menu />);
  
  const firstItem = screen.getByRole('menuitem', { name: '首页' });
  firstItem.focus();
  
  userEvent.keyboard('{ArrowDown}');
  
  expect(screen.getByRole('menuitem', { name: '关于' })).toHaveFocus();
});

// 屏幕阅读器测试
test('图片有替代文本', () => {
  render(<img src="photo.jpg" alt="用户头像" />);
  
  expect(screen.getByAltText('用户头像')).toBeInTheDocument();
});
```

## SEO 检测

```javascript
// React Helmet 测试
test('页面有正确的 meta 标签', () => {
  render(<Page />);
  
  expect(document.title).toBe('页面标题 - 网站名');
  
  const description = document.querySelector('meta[name="description"]');
  expect(description.content).toBe('页面描述');
  
  const ogTitle = document.querySelector('meta[property="og:title"]');
  expect(ogTitle.content).toBe('页面标题');
});

// Lighthouse CI
// lighthouse https://example.com --output=json
```

**后端类比**：HTML 测试 ≈ API 集成测试。

## 参考资源

- [Testing Library](https://testing-library.com/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
