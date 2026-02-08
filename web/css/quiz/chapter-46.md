# 第 46 章：PostCSS与工程化 - 面试题

**难度分布：** 🟢 简单 x3 | 🟡 中等 x4 | 🔴 困难 x3

---

## 第 1 题 🟢

**类型：** 单选题  
**标签：** PostCSS基础

### 题目

PostCSS是什么？

**选项：**
- A. CSS预处理器
- B. CSS后处理器，基于插件的CSS转换工具
- C. CSS框架
- D. CSS压缩工具

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

PostCSS是一个用JavaScript插件转换CSS的工具。

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')
  ]
}
```

</details>

---

## 第 2 题 🟢

**类型：** 单选题  
**标签：** Autoprefixer

### 题目

Autoprefixer的作用？

**选项：**
- A. 压缩CSS
- B. 自动添加浏览器前缀
- C. 转换语法
- D. 优化性能

<details>
<summary>查看答案</summary>

### ✅ 正确答案：B

### 📖 解析

```css
/* 输入 */
.box {
  display: flex;
}

/* 输出 */
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

</details>

---

## 第 3 题 🟢

**类型：** 判断题  
**标签：** CSS Modules

### 题目

CSS Modules可以实现样式的局部作用域。

**选项：**
- A. ✅ 正确
- B. ❌ 错误

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A（正确）

### 📖 解析

```css
/* Button.module.css */
.button {
  padding: 10px;
}
```

```jsx
import styles from './Button.module.css';

<button className={styles.button}>Click</button>
// 编译后: <button class="Button_button_1a2b3c">
```

</details>

---

## 第 4 题 🟡

**类型：** 多选题  
**标签：** PostCSS插件

### 题目

常用的PostCSS插件有？

**选项：**
- A. autoprefixer
- B. cssnano
- C. postcss-preset-env
- D. postcss-import

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

```javascript
module.exports = {
  plugins: [
    require('postcss-import'),           // 合并@import
    require('postcss-preset-env'),       // 现代CSS特性
    require('autoprefixer'),             // 浏览器前缀
    require('cssnano')                   // 压缩
  ]
}
```

</details>

---

## 第 5 题 🟡

**类型：** 代码题  
**标签：** postcss-preset-env

### 题目

postcss-preset-env的作用？

**选项：**
- A. 添加前缀
- B. 让你使用未来的CSS特性
- C. 压缩代码
- D. B正确

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```css
/* 输入（未来CSS）*/
:root {
  --main-color: #333;
}

.title {
  color: var(--main-color);
}

/* 自动转换为兼容代码 */
```

</details>

---

## 第 6 题 🟡

**类型：** 代码题  
**标签：** CSS-in-JS

### 题目

CSS-in-JS的优势？

**选项：**
- A. 组件化、动态样式
- B. 类型安全
- C. 自动删除未使用样式
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'gray'};
  padding: 10px 20px;
`;

<Button primary>Click</Button>
```

</details>

---

## 第 7 题 🟡

**类型：** 代码题  
**标签：** 工程化配置

### 题目

完整的CSS工程化包含？

**选项：**
- A. 预处理、后处理
- B. 模块化、组件化
- C. 构建优化、代码分割
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
        'sass-loader'
      ]
    }]
  }
}
```

</details>

---

## 第 8 题 🔴

**类型：** 代码题  
**标签：** 性能优化

### 题目

CSS工程化的性能优化策略？

**选项：**
- A. 代码分割、按需加载
- B. 压缩、Tree-shaking
- C. Critical CSS
- D. 以上都是

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

**优化策略：**
1. 代码分割：按路由分割CSS
2. 压缩：cssnano
3. Tree-shaking：PurgeCSS
4. Critical CSS：提取首屏CSS内联

</details>

---

## 第 9 题 🔴

**类型：** 代码题  
**标签：** 方案选择

### 题目

不同项目如何选择CSS方案？

**选项：**
- A. React: CSS Modules/styled-components
- B. Vue: Scoped CSS
- C. 传统项目: Sass/Less + PostCSS
- D. 以上都对

<details>
<summary>查看答案</summary>

### ✅ 正确答案：D

### 📖 解析

| 项目类型 | 推荐方案 |
|---------|---------|
| React | CSS Modules, styled-components |
| Vue | Scoped CSS, CSS Modules |
| 传统项目 | Sass + PostCSS |
| 快速原型 | Tailwind CSS |

</details>

---

## 第 10 题 🔴

**类型：** 多选题  
**标签：** 最佳实践

### 题目

CSS工程化的最佳实践？

**选项：**
- A. 使用预处理器
- B. 配置PostCSS
- C. 模块化组织
- D. 性能监控

<details>
<summary>查看答案</summary>

### ✅ 正确答案：A, B, C, D

### 📖 解析

**完整工程化方案：**
- 预处理：Sass/Less
- 后处理：PostCSS
- 模块化：CSS Modules
- 构建：Webpack/Vite
- 优化：压缩、分割、Critical CSS
- 规范：Stylelint、Prettier
- 监控：性能分析、Bundle分析

</details>

---

**导航**  
[上一章：第 45 章 - Sass/Less原理](./chapter-45.md) | [返回目录](../README.md)
