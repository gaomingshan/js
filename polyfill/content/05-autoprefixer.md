# 第 5 章：autoprefixer 自动前缀

## 概述

autoprefixer 是最常用的 PostCSS 插件，自动为 CSS 添加浏览器厂商前缀。它根据 Can I Use 数据和 browserslist 配置，智能添加必要的前缀。

## 一、为什么需要浏览器前缀

### 1.1 前缀的历史

```css
/* 历史原因：各浏览器实现不同 */
-webkit-transform: rotate(45deg);  /* Chrome, Safari */
-moz-transform: rotate(45deg);     /* Firefox */
-ms-transform: rotate(45deg);      /* IE */
-o-transform: rotate(45deg);       /* Opera */
transform: rotate(45deg);          /* 标准 */
```

### 1.2 现状

| 前缀 | 浏览器 | 现状 |
|------|--------|------|
| `-webkit-` | Chrome, Safari, 新 Edge | 仍需要部分属性 |
| `-moz-` | Firefox | 很少需要 |
| `-ms-` | IE, 旧 Edge | 逐渐淘汰 |
| `-o-` | 旧 Opera | 几乎不需要 |

> **💡 关键理解**  
> 现代浏览器已支持大多数 CSS 属性，但某些新特性仍需要前缀。  
> 手动添加前缀容易遗漏或添加冗余，autoprefixer 自动处理。

## 二、工作原理

### 2.1 数据来源

```
Can I Use 数据库
      ↓
autoprefixer 内置数据
      ↓
结合 browserslist 配置
      ↓
计算需要哪些前缀
```

### 2.2 智能添加

```css
/* 输入 */
.box {
  display: flex;
  user-select: none;
}

/* 输出（假设需要支持旧浏览器）*/
.box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}
```

### 2.3 自动移除过时前缀

```css
/* 输入：包含不需要的前缀 */
.box {
  -webkit-border-radius: 5px;  /* 现代浏览器不需要 */
  border-radius: 5px;
}

/* 输出：自动移除 */
.box {
  border-radius: 5px;
}
```

## 三、基础配置

### 3.1 安装

```bash
npm install -D autoprefixer postcss
```

### 3.2 配置文件

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')
  ]
};
```

### 3.3 browserslist 配置

```json
// package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

或单独文件：

```ini
# .browserslistrc
> 1%
last 2 versions
not dead
```

## 四、配置选项

### 4.1 常用选项

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    ['autoprefixer', {
      // 覆盖 browserslist（不推荐，建议统一配置）
      overrideBrowserslist: ['last 2 versions'],
      
      // 是否添加前缀到 @supports
      supports: true,
      
      // 是否添加前缀到 flexbox
      flexbox: true,
      
      // 是否添加 grid 前缀
      grid: 'autoplace',
      
      // 移除过时前缀
      remove: true
    }]
  ]
};
```

### 4.2 Grid 布局选项

```javascript
// Grid 前缀选项
{
  grid: false,        // 不处理 grid
  grid: true,         // 添加基础 grid 前缀
  grid: 'autoplace',  // 完整 grid 支持（包括 IE）
  grid: 'no-autoplace' // 不处理 auto-placement
}
```

### 4.3 Flexbox 选项

```javascript
{
  flexbox: true,       // 完整 flexbox 前缀
  flexbox: false,      // 不处理
  flexbox: 'no-2009'   // 不添加 2009 规范前缀
}
```

## 五、与构建工具集成

### 5.1 Vite

```javascript
// vite.config.js
import autoprefixer from 'autoprefixer';

export default {
  css: {
    postcss: {
      plugins: [autoprefixer()]
    }
  }
};
```

### 5.2 webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: ['autoprefixer']
            }
          }
        }
      ]
    }]
  }
};
```

### 5.3 Vue CLI / Create React App

这些脚手架**内置**了 autoprefixer，无需额外配置。  
只需配置 browserslist 即可。

## 六、调试与检查

### 6.1 查看添加的前缀

```bash
# 命令行检查
npx autoprefixer --info
```

输出示例：
```
Browsers:
  Chrome: 90, 89
  Edge: 90, 89
  Firefox: 88, 87
  Safari: 14, 13.1

These browsers account for 91.2% of all users globally

At-Rules:
  @keyframes: webkit

Selectors:
  ::placeholder: webkit, ms

Properties:
  appearance: webkit
  backdrop-filter: webkit
  user-select: webkit, moz, ms
```

### 6.2 在线工具

- [Autoprefixer CSS online](https://autoprefixer.github.io/)
- 可以直接测试输入输出

## 七、常见场景

### 7.1 Flexbox 兼容

```css
/* 输入 */
.container {
  display: flex;
  justify-content: space-between;
}

/* 输出（支持 IE 10-11）*/
.container {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
```

### 7.2 CSS Grid 兼容

```css
/* 输入 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 输出（grid: 'autoplace'）*/
.grid {
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: 1fr 20px 1fr 20px 1fr;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

### 7.3 Sticky 定位

```css
/* 输入 */
.header {
  position: sticky;
  top: 0;
}

/* 输出 */
.header {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
```

## 八、控制注释

### 8.1 禁用某段代码

```css
/* autoprefixer: off */
.no-prefix {
  appearance: none;  /* 不添加前缀 */
}
/* autoprefixer: on */

.with-prefix {
  appearance: none;  /* 添加前缀 */
}
```

### 8.2 忽略下一行

```css
.box {
  /* autoprefixer: ignore next */
  -webkit-mask: url(mask.png);  /* 保留手写前缀 */
}
```

## 九、最佳实践

| 实践 | 说明 |
|------|------|
| 统一用 browserslist | 不要在 autoprefixer 中单独配置 |
| 不要手写前缀 | 让工具自动处理 |
| 检查输出 | 使用 `--info` 或在线工具验证 |
| 定期更新 | 更新 autoprefixer 获取最新数据 |

## 十、常见问题

### 10.1 前缀没有添加？

```javascript
// 检查 browserslist 配置
npx browserslist

// 确保目标浏览器确实需要前缀
```

### 10.2 添加了不需要的前缀？

```javascript
// 检查是否目标浏览器设置过宽
// 或手动移除
{
  remove: true  // 移除不需要的前缀
}
```

## 参考资料

- [autoprefixer GitHub](https://github.com/postcss/autoprefixer)
- [Can I Use](https://caniuse.com/)
- [browserslist](https://github.com/browserslist/browserslist)

---

**下一章** → [第 6 章：browserslist 入门](./06-browserslist.md)
