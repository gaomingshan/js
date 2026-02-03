# HTML/CSS 与样式规范

## 概述

HTML/CSS 规范是前端工程化的重要组成部分。理解样式规范的核心在于掌握 HTML 语义化、CSS 架构方法论、Stylelint 配置，以及样式与逻辑的职责边界。

**核心认知**：
- HTML 语义化不仅是可访问性，更是代码可维护性
- CSS 架构方法论（BEM、OOCSS）解决样式混乱问题
- Stylelint 是 CSS 的 ESLint，提供样式约束

**后端类比**：
- HTML 语义化 ≈ 数据库表结构设计
- CSS 架构 ≈ 代码分层架构
- Stylelint ≈ 代码规范检查器

---

## HTML 语义化规范

### 语义化标签的工程意义

**非语义化**：
```html
<!-- ❌ div 滥用 -->
<div class="header">
  <div class="nav">
    <div class="nav-item">首页</div>
    <div class="nav-item">关于</div>
  </div>
</div>
<div class="main">
  <div class="article">
    <div class="title">文章标题</div>
    <div class="content">文章内容</div>
  </div>
</div>
<div class="footer">版权信息</div>
```

**语义化**：
```html
<!-- ✅ 语义化标签 -->
<header>
  <nav>
    <a href="/">首页</a>
    <a href="/about">关于</a>
  </nav>
</header>
<main>
  <article>
    <h1>文章标题</h1>
    <p>文章内容</p>
  </article>
</main>
<footer>版权信息</footer>
```

**工程价值**：
1. **可读性**：标签本身表达结构
2. **可维护性**：结构清晰，易于修改
3. **SEO**：搜索引擎更好理解内容
4. **可访问性**：屏幕阅读器友好

**后端类比**：使用明确的类名而非 `Object` 或 `Map`。

---

### 可访问性规范（A11y）

**ARIA 属性**：
```html
<!-- 按钮 -->
<button aria-label="关闭对话框">×</button>

<!-- 表单 -->
<form role="search">
  <input type="text" aria-label="搜索" />
  <button type="submit">搜索</button>
</form>

<!-- 导航 -->
<nav aria-label="主导航">
  <ul role="list">
    <li><a href="/">首页</a></li>
  </ul>
</nav>
```

**可访问性最佳实践**：
1. 所有图片必须有 `alt` 属性
2. 表单元素必须有 `label`
3. 按钮必须有明确的文本或 `aria-label`
4. 使用语义化标签（`nav`、`main`、`aside`）

**后端类比**：API 接口的文档完整性。

---

### HTMLHint 使用

**安装**：
```bash
npm install --save-dev htmlhint
```

**配置**（.htmlhintrc）：
```json
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "doctype-first": true,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-no-duplication": true,
  "title-require": true,
  "alt-require": true
}
```

**常见规则**：
```html
<!-- ❌ tagname-lowercase -->
<DIV>内容</DIV>

<!-- ✅ -->
<div>内容</div>

<!-- ❌ alt-require -->
<img src="logo.png">

<!-- ✅ -->
<img src="logo.png" alt="公司 Logo">
```

---

## CSS 架构规范

### BEM 方法论

**BEM**：Block（块）、Element（元素）、Modifier（修饰符）

**命名规则**：
```
.block__element--modifier
```

**示例**：
```html
<!-- 卡片组件 -->
<div class="card">
  <div class="card__header">
    <h3 class="card__title">标题</h3>
  </div>
  <div class="card__body">
    <p class="card__text">内容</p>
  </div>
  <div class="card__footer">
    <button class="card__button card__button--primary">确定</button>
    <button class="card__button card__button--secondary">取消</button>
  </div>
</div>
```

**CSS**：
```css
.card {
  border: 1px solid #ddd;
}

.card__header {
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.card__title {
  font-size: 18px;
  font-weight: bold;
}

.card__button {
  padding: 8px 16px;
}

.card__button--primary {
  background-color: #007bff;
  color: white;
}

.card__button--secondary {
  background-color: #6c757d;
  color: white;
}
```

**优势**：
- 命名冲突少
- 结构清晰
- 易于维护

**后端类比**：包命名规范（com.company.module）。

---

### OOCSS（面向对象的 CSS）

**原则**：
1. **结构与皮肤分离**
2. **容器与内容分离**

**示例**：
```css
/* ❌ 耦合 */
.sidebar .button {
  padding: 8px 16px;
  background-color: #007bff;
}

/* ✅ 分离 */
.button {
  padding: 8px 16px;
}

.button--primary {
  background-color: #007bff;
}
```

**后端类比**：面向对象的单一职责原则。

---

### SMACSS（可扩展和模块化架构）

**分类**：
```
styles/
  ├── base/        # 基础样式（reset、typography）
  ├── layout/      # 布局样式（header、footer）
  ├── modules/     # 模块样式（button、card）
  ├── state/       # 状态样式（is-active、is-hidden）
  └── theme/       # 主题样式（dark、light）
```

---

## CSS Modules vs CSS-in-JS

### CSS Modules

**特点**：局部作用域，避免命名冲突

**使用**：
```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  background-color: #007bff;
}

.primary {
  background-color: #007bff;
}
```

```javascript
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>按钮</button>;
}
```

**编译后**：
```html
<button class="Button_button__2x3kl">按钮</button>
```

**优势**：
- 局部作用域
- 避免命名冲突
- 支持组合

---

### CSS-in-JS

**styled-components 示例**：
```javascript
import styled from 'styled-components';

const Button = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
`;

function App() {
  return <Button primary>主要按钮</Button>;
}
```

**优势**：
- 动态样式
- 与组件绑定
- TypeScript 支持

**劣势**：
- 性能开销
- 调试困难
- 学习成本

---

### 选择策略

| 方案 | 适用场景 | 优势 | 劣势 |
|------|---------|------|------|
| BEM | 传统项目 | 简单、兼容性好 | 命名冗长 |
| CSS Modules | React 项目 | 局部作用域 | 需要构建工具 |
| CSS-in-JS | 动态主题 | 动态样式 | 性能开销 |

---

## Stylelint 配置与使用

### 安装配置

```bash
npm install --save-dev stylelint stylelint-config-standard
```

**配置**（.stylelintrc.json）：
```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "indentation": 2,
    "string-quotes": "single",
    "color-hex-case": "lower",
    "color-hex-length": "short",
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]+$",
    "declaration-block-trailing-semicolon": "always",
    "at-rule-no-unknown": [true, {
      "ignoreAtRules": ["tailwind", "apply", "variants", "responsive"]
    }]
  }
}
```

---

### 常见规则

**color-hex-case**（颜色大小写）：
```css
/* ❌ */
color: #FFF;

/* ✅ */
color: #fff;
```

**selector-class-pattern**（类名规范）：
```css
/* ❌ */
.MyClass {}
.my_class {}

/* ✅ */
.myClass {}
.my-class {}
```

**declaration-block-trailing-semicolon**（分号）：
```css
/* ❌ */
.button {
  color: red
}

/* ✅ */
.button {
  color: red;
}
```

---

### 自动修复

```bash
stylelint "src/**/*.css" --fix
```

---

## 样式与逻辑的职责边界

### 内联样式 vs 外部样式

**内联样式（不推荐）**：
```html
<div style="color: red; font-size: 16px;">内容</div>
```

**问题**：
- 样式与结构耦合
- 难以复用
- 优先级过高

---

**外部样式（推荐）**：
```html
<div class="text-primary">内容</div>
```

```css
.text-primary {
  color: red;
  font-size: 16px;
}
```

**优势**：
- 样式与结构分离
- 易于复用
- 易于维护

---

### 例外场景

**动态样式**：
```javascript
// 可接受的内联样式
<div style={{ width: `${progress}%` }}>进度条</div>
```

**第三方库限制**：
```javascript
// 某些库要求内联样式
<Chart style={{ height: 300 }} />
```

---

### 样式文件的组织

**按组件组织**：
```
components/
  ├── Button/
  │   ├── index.jsx
  │   └── Button.module.css
  ├── Card/
  │   ├── index.jsx
  │   └── Card.module.css
```

**按类型组织**：
```
styles/
  ├── base/
  ├── components/
  ├── layout/
  └── utils/
```

**后端类比**：代码文件的目录结构组织。

---

## 深入一点：CSS 规范的演进

### 从全局样式到模块化

**演进路径**：
```
全局样式（命名冲突）
  ↓
BEM（命名规范）
  ↓
CSS Modules（局部作用域）
  ↓
CSS-in-JS（动态样式）
  ↓
Atomic CSS（Tailwind）
```

**核心趋势**：
1. 局部作用域
2. 组件化
3. 工具化

**后端类比**：从全局变量到模块化的演进。

---

## 工程实践案例

### 案例：某团队的 CSS 架构演进

**背景**：
- 项目 2 年
- 全局样式混乱
- 命名冲突频繁

**问题**：
```
1. 类名冲突（.button 被多次定义）
2. 样式覆盖混乱（!important 滥用）
3. 难以删除（不知道样式是否被使用）
```

**改进方案**：

**阶段 1：引入 BEM**
```
1. 制定 BEM 命名规范
2. 新组件使用 BEM
3. 渐进式改造旧组件
```

**阶段 2：引入 CSS Modules**
```
1. 配置 Webpack
2. 新组件使用 CSS Modules
3. 历史组件保持 BEM
```

**阶段 3：引入 Stylelint**
```
1. 配置 Stylelint
2. Git Hooks 检查
3. CI 门禁
```

**效果**：
```
命名冲突：减少 90%
!important 使用：减少 80%
样式文件大小：减少 30%
开发效率：提升 40%
```

---

## 参考资料

- [BEM Methodology](https://en.bem.info/)
- [OOCSS](https://github.com/stubbornella/oocss/wiki)
- [SMACSS](http://smacss.com/)
- [Stylelint](https://stylelint.io/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [styled-components](https://styled-components.com/)
