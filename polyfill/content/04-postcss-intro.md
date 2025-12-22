# 第 4 章：PostCSS 工作原理

## 概述

PostCSS 被称为"CSS 的 Babel"，它是一个用 JavaScript 插件转换 CSS 的工具。理解 PostCSS 的插件化架构，是配置 CSS 兼容性处理的基础。

## 一、PostCSS 是什么

### 1.1 定位：CSS 转换平台

```
PostCSS 本身不做任何事情
      ↓
PostCSS + 插件 = CSS 转换能力
      ↓
autoprefixer     → 自动添加浏览器前缀
postcss-preset-env → 使用未来 CSS 语法
cssnano          → 压缩 CSS
```

### 1.2 与预处理器的区别

| 工具 | 类型 | 作用 |
|------|------|------|
| Sass/Less | 预处理器 | 扩展 CSS 语法（变量、嵌套） |
| PostCSS | 后处理器 | 转换标准 CSS |

```
Sass → CSS → PostCSS → 最终 CSS
 ↑           ↑
扩展语法    标准转换
```

> **💡 理解**  
> Sass 在 CSS **之前**工作，PostCSS 在 CSS **之后**工作。  
> 但现代 PostCSS 插件也能实现类似预处理器的功能。

## 二、工作原理

### 2.1 处理流程

```
CSS 源码
    ↓
┌─────────────────┐
│  1. 解析 Parse  │  CSS → AST
└─────────────────┘
    ↓
┌─────────────────┐
│  2. 插件处理    │  修改 AST
└─────────────────┘
    ↓
┌─────────────────┐
│  3. 字符串化    │  AST → CSS
└─────────────────┘
    ↓
目标 CSS
```

### 2.2 CSS AST 示例

```css
/* 源 CSS */
.button {
  display: flex;
}
```

```javascript
// 对应的 AST（简化）
{
  type: 'root',
  nodes: [{
    type: 'rule',
    selector: '.button',
    nodes: [{
      type: 'decl',
      prop: 'display',
      value: 'flex'
    }]
  }]
}
```

## 三、核心插件生态

### 3.1 常用插件分类

| 类别 | 插件 | 作用 |
|------|------|------|
| 兼容性 | autoprefixer | 自动添加浏览器前缀 |
| 未来语法 | postcss-preset-env | 使用 CSS 新特性 |
| 优化 | cssnano | 压缩 CSS |
| 工具 | postcss-import | 处理 @import |
| 工具 | postcss-url | 处理资源路径 |

### 3.2 插件执行顺序

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-import'),      // 1. 先合并文件
    require('postcss-preset-env'),  // 2. 转换新语法
    require('autoprefixer'),        // 3. 添加前缀
    require('cssnano')              // 4. 最后压缩
  ]
};
```

> **⚠️ 注意**  
> 插件顺序很重要！压缩应该放在最后。

## 四、基础配置

### 4.1 配置文件

```javascript
// postcss.config.js（推荐）
module.exports = {
  plugins: [
    require('autoprefixer')
  ]
};
```

```javascript
// postcss.config.js（现代语法）
module.exports = {
  plugins: {
    autoprefixer: {}
  }
};
```

### 4.2 安装依赖

```bash
npm install -D postcss autoprefixer
```

### 4.3 与构建工具集成

**Vite**：内置 PostCSS 支持
```javascript
// vite.config.js
export default {
  css: {
    postcss: './postcss.config.js'
  }
};
```

**webpack**：需要 postcss-loader
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader']
    }]
  }
};
```

## 五、postcss-preset-env

### 5.1 CSS 的 preset-env

类似 `@babel/preset-env`，可以使用未来的 CSS 语法：

```bash
npm install -D postcss-preset-env
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    ['postcss-preset-env', {
      stage: 2,  // 默认值，较稳定的特性
      features: {
        'nesting-rules': true  // 启用嵌套
      }
    }]
  ]
};
```

### 5.2 Stage 级别

| Stage | 稳定性 | 示例特性 |
|-------|--------|----------|
| 0 | 实验性 | 各种新提案 |
| 1 | 草案 | 颜色函数 |
| 2 | 默认 | 嵌套、自定义媒体查询 |
| 3 | 候选 | 大部分现代特性 |
| 4 | 标准 | 已被浏览器实现 |

### 5.3 使用示例

```css
/* 源 CSS：使用未来语法 */
.button {
  /* 嵌套 */
  & .icon {
    color: blue;
  }
  
  /* 自定义媒体查询 */
  @media (--mobile) {
    padding: 10px;
  }
}

/* 转换后：标准 CSS */
.button .icon {
  color: blue;
}
@media (max-width: 768px) {
  .button {
    padding: 10px;
  }
}
```

## 六、编写 PostCSS 插件

### 6.1 插件结构

```javascript
// my-plugin.js
module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'my-plugin',
    
    // 访问规则节点
    Rule(rule) {
      console.log(rule.selector);
    },
    
    // 访问声明节点
    Declaration(decl) {
      console.log(decl.prop, decl.value);
    }
  };
};

module.exports.postcss = true;
```

### 6.2 实用示例：px 转 rem

```javascript
// postcss-px-to-rem.js
module.exports = (opts = { baseSize: 16 }) => {
  return {
    postcssPlugin: 'postcss-px-to-rem',
    Declaration(decl) {
      if (decl.value.includes('px')) {
        decl.value = decl.value.replace(
          /(\d+)px/g,
          (match, num) => `${num / opts.baseSize}rem`
        );
      }
    }
  };
};
module.exports.postcss = true;
```

## 七、CLI 使用

### 7.1 命令行处理

```bash
# 安装 CLI
npm install -D postcss-cli

# 处理单个文件
npx postcss src/style.css -o dist/style.css

# 处理目录
npx postcss src/**/*.css --dir dist/

# 监听模式
npx postcss src/**/*.css --dir dist/ --watch
```

### 7.2 package.json 脚本

```json
{
  "scripts": {
    "css:build": "postcss src/**/*.css --dir dist/",
    "css:watch": "postcss src/**/*.css --dir dist/ --watch"
  }
}
```

## 八、最佳实践

| 实践 | 说明 |
|------|------|
| 使用配置文件 | `postcss.config.js` 统一管理 |
| 合理的插件顺序 | import → 转换 → 前缀 → 压缩 |
| 配合 browserslist | 统一目标浏览器 |
| 按需启用特性 | 不要启用不需要的转换 |

## 参考资料

- [PostCSS 官方文档](https://postcss.org/)
- [postcss-preset-env](https://preset-env.cssdb.org/)
- [PostCSS 插件列表](https://www.postcss.parts/)

---

**下一章** → [第 5 章：autoprefixer 自动前缀](./05-autoprefixer.md)
