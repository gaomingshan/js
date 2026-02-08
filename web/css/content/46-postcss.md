# 第 46 章：PostCSS 与工程化

## 概述

PostCSS是现代CSS工程化的核心工具，通过插件系统转换CSS。

---

## 一、PostCSS

### 1.1 基本配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')
  ]
};
```

---

## 二、常用插件

### 2.1 Autoprefixer

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

### 2.2 cssnano

```css
/* 压缩CSS */
```

### 2.3 postcss-preset-env

```css
/* 使用未来CSS特性 */
.box {
  color: color-mod(blue alpha(50%));
}
```

---

## 三、CSS Modules

### 3.1 模块化CSS

```css
/* button.module.css */
.button {
  padding: 10px 20px;
}
```

```javascript
import styles from './button.module.css';

<button className={styles.button}>Click</button>
```

---

## 四、CSS-in-JS

### 4.1 Styled Components

```javascript
import styled from 'styled-components';

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.primary ? 'blue' : 'gray'};
`;
```

---

## 五、工程化最佳实践

### 5.1 工作流

```
1. Sass/Less编写
2. PostCSS处理（autoprefixer、cssnano）
3. 输出优化后的CSS
```

### 5.2 配置示例

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      }
    ]
  }
};
```

---

## 参考资料

- [PostCSS](https://postcss.org/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [Styled Components](https://styled-components.com/)

---

**导航**  
[上一章：第 45 章 - Sass/Less原理](./45-sass-less.md)  
[返回目录](../README.md)  
**完成** → 所有46章已完成！🎉
