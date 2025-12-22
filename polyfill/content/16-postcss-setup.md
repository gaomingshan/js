# 第 16 章：PostCSS 工程配置

## 概述

本章提供现代前端项目中 PostCSS 的完整配置方案，包括 autoprefixer、postcss-preset-env 等常用插件的最佳实践。

## 一、基础配置

### 1.1 依赖安装

```bash
npm install -D postcss autoprefixer postcss-preset-env
```

### 1.2 最小配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    'autoprefixer'
  ]
};
```

### 1.3 推荐配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    ['postcss-preset-env', {
      stage: 2,
      autoprefixer: { grid: true }
    }]
  ]
};
```

> **💡 提示**  
> postcss-preset-env 已包含 autoprefixer，无需重复添加。

## 二、browserslist 集成

### 2.1 统一配置

```json
// package.json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead"
  ]
}
```

PostCSS 和 autoprefixer 会自动读取 browserslist 配置。

### 2.2 验证配置

```bash
# 查看 autoprefixer 将添加的前缀
npx autoprefixer --info
```

## 三、postcss-preset-env 详解

### 3.1 Stage 配置

```javascript
{
  plugins: [
    ['postcss-preset-env', {
      stage: 2,  // 0-4，数字越小越激进
      // stage 0: 实验性提案
      // stage 1: 草案
      // stage 2: 默认，较稳定
      // stage 3: 候选推荐
      // stage 4: 已标准化
    }]
  ]
}
```

### 3.2 启用特定特性

```javascript
{
  plugins: [
    ['postcss-preset-env', {
      stage: 2,
      features: {
        'nesting-rules': true,          // CSS 嵌套
        'custom-properties': true,      // CSS 变量
        'custom-media-queries': true,   // 自定义媒体查询
        'color-functional-notation': true // 颜色函数
      }
    }]
  ]
}
```

### 3.3 使用示例

```css
/* 源 CSS */
:root {
  --primary: #3b82f6;
}

.button {
  background: var(--primary);
  
  &:hover {
    background: color-mix(in srgb, var(--primary), black 20%);
  }
  
  & .icon {
    margin-right: 8px;
  }
}

/* 转换后 */
:root {
  --primary: #3b82f6;
}

.button {
  background: var(--primary);
}

.button:hover {
  background: #2563eb;
}

.button .icon {
  margin-right: 8px;
}
```

## 四、完整配置示例

### 4.1 现代项目配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    // 处理 @import
    'postcss-import',
    
    // 使用未来 CSS 语法
    ['postcss-preset-env', {
      stage: 2,
      features: {
        'nesting-rules': true,
        'custom-media-queries': true
      },
      autoprefixer: {
        flexbox: 'no-2009',
        grid: 'autoplace'
      }
    }],
    
    // 生产环境压缩
    process.env.NODE_ENV === 'production' && 'cssnano'
  ].filter(Boolean)
};
```

### 4.2 兼容旧浏览器配置

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    'postcss-import',
    ['postcss-preset-env', {
      stage: 3,  // 更保守
      autoprefixer: {
        flexbox: true,
        grid: 'autoplace'  // IE Grid 支持
      },
      preserve: false  // 不保留原始语法
    }],
    'cssnano'
  ]
};
```

## 五、与构建工具集成

### 5.1 Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: './postcss.config.js'
    // 或内联配置
    // postcss: {
    //   plugins: [autoprefixer()]
    // }
  }
});
```

### 5.2 webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'  // 自动读取 postcss.config.js
        ]
      }
    ]
  }
};
```

### 5.3 Sass/Less + PostCSS

```javascript
// webpack.config.js
{
  test: /\.scss$/,
  use: [
    'style-loader',
    'css-loader',
    'postcss-loader',  // PostCSS 在 Sass 之后
    'sass-loader'      // Sass 先编译
  ]
}
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    'autoprefixer'
    // Sass 已处理嵌套，不需要 postcss-preset-env 的嵌套
  ]
};
```

## 六、常用插件

### 6.1 postcss-import

```javascript
// 处理 @import，合并 CSS 文件
plugins: ['postcss-import']
```

```css
/* 源 */
@import 'normalize.css';
@import './components/button.css';

/* 转换后：内容被合并 */
```

### 6.2 cssnano

```javascript
// CSS 压缩优化
plugins: [
  ['cssnano', {
    preset: ['default', {
      discardComments: { removeAll: true },
      normalizeWhitespace: true
    }]
  }]
]
```

### 6.3 postcss-pxtorem

```javascript
// px 转 rem
plugins: [
  ['postcss-pxtorem', {
    rootValue: 16,
    propList: ['*'],
    selectorBlackList: ['.ignore']
  }]
]
```

### 6.4 postcss-px-to-viewport

```javascript
// px 转 vw（移动端）
plugins: [
  ['postcss-px-to-viewport', {
    viewportWidth: 375,
    unitPrecision: 5,
    viewportUnit: 'vw'
  }]
]
```

## 七、插件执行顺序

### 7.1 推荐顺序

```javascript
plugins: [
  'postcss-import',       // 1. 先合并文件
  'postcss-preset-env',   // 2. 转换语法（含 autoprefixer）
  'cssnano'               // 3. 最后压缩
]
```

### 7.2 与预处理器配合

```
Sass/Less → CSS → postcss-import → postcss-preset-env → cssnano
    ↑                                      ↑
 预处理器                              后处理器
```

## 八、调试技巧

### 8.1 查看转换结果

```bash
# 命令行处理单个文件
npx postcss src/style.css -o dist/style.css

# 查看处理过程
npx postcss src/style.css -o dist/style.css --verbose
```

### 8.2 Source Map

```javascript
// postcss.config.js
module.exports = {
  map: {
    inline: false,      // 独立 source map 文件
    annotation: true    // 添加注释指向 source map
  },
  plugins: [/* ... */]
};
```

### 8.3 配置文件位置

```
项目根目录/
├── postcss.config.js    ← 推荐
├── .postcssrc
├── .postcssrc.js
├── .postcssrc.json
└── package.json 中的 postcss 字段
```

## 九、常见问题

### 9.1 前缀未添加

```bash
# 检查 browserslist 配置
npx browserslist

# 检查 autoprefixer 信息
npx autoprefixer --info
```

### 9.2 与 Tailwind CSS 配合

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    'tailwindcss',
    'autoprefixer'
  ]
};
```

### 9.3 CSS Modules

```javascript
// webpack
{
  test: /\.module\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: { modules: true }
    },
    'postcss-loader'
  ]
}
```

## 十、配置模板

### 10.1 通用项目

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    'postcss-import',
    ['postcss-preset-env', {
      stage: 2,
      features: { 'nesting-rules': true }
    }],
    process.env.NODE_ENV === 'production' && 'cssnano'
  ].filter(Boolean)
};
```

### 10.2 移动端项目

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    'postcss-import',
    ['postcss-preset-env', { stage: 2 }],
    ['postcss-px-to-viewport', {
      viewportWidth: 375
    }],
    'cssnano'
  ]
};
```

## 十一、最佳实践

| 实践 | 说明 |
|------|------|
| 使用 postcss-preset-env | 比单独配置多个插件更方便 |
| 统一 browserslist | 与 Babel 共享配置 |
| 合理的 stage | 不要过于激进 |
| 生产环境压缩 | 使用 cssnano |

## 参考资料

- [PostCSS 官网](https://postcss.org/)
- [postcss-preset-env](https://preset-env.cssdb.org/)
- [autoprefixer](https://github.com/postcss/autoprefixer)
- [cssnano](https://cssnano.co/)

---

**下一章** → [第 17 章：减少 Polyfill 体积](./17-bundle-optimization.md)
