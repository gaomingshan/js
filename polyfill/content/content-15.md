# 现代前端工程实践

## 核心概念

现代前端工程中的兼容性处理需要考虑**构建工具、框架、工程化流程**的整体配合。

核心目标：**建立标准化、可维护、高性能的兼容性方案**

---

## Webpack 兼容性配置

### 基础配置

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true // 启用缓存
          }
        }
      }
    ]
  }
};
```

---

### 多入口配置（Modern + Legacy）

```javascript
// webpack.config.js
const path = require('path');

module.exports = [
  // Modern 构建
  {
    name: 'modern',
    entry: './src/index.js',
    output: {
      filename: 'app.modern.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: { esmodules: true },
                modules: false
              }]
            ]
          }
        }
      }]
    }
  },
  
  // Legacy 构建
  {
    name: 'legacy',
    entry: './src/index.js',
    output: {
      filename: 'app.legacy.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 0.5%, ie 11',
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      }]
    }
  }
];
```

---

### HTML 自动注入

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      scriptLoading: 'defer'
    })
  ]
};
```

**生成的 HTML**：
```html
<!DOCTYPE html>
<html>
<head>
  <title>App</title>
</head>
<body>
  <div id="app"></div>
  <script defer src="app.modern.js" type="module"></script>
  <script defer src="app.legacy.js" nomodule></script>
</body>
</html>
```

---

## Vite 兼容性配置

### 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  
  build: {
    // 目标浏览器
    target: 'es2015',
    
    // Polyfill 注入
    polyfillModulePreload: true,
    
    // CSS 前缀
    cssTarget: 'chrome61'
  }
});
```

---

### Legacy 插件（兼容旧浏览器）

```bash
npm install --save-dev @vitejs/plugin-legacy
```

```javascript
// vite.config.js
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['> 0.5%', 'last 2 versions', 'not dead'],
      polyfills: ['es.promise', 'es.array.includes'],
      modernPolyfills: true
    })
  ]
});
```

**效果**：
- 自动生成 Modern + Legacy 两份构建
- 自动注入 Polyfill
- 自动生成 type="module" 和 nomodule 标签

---

## Rollup 配置

```javascript
// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-env', {
          targets: '> 0.5%, last 2 versions',
          modules: false
        }]
      ]
    })
  ]
};
```

---

## TypeScript 与 Polyfill 的配合

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "lib": ["ES2015", "DOM"],
    "moduleResolution": "node",
    "skipLibCheck": true,
    "strict": true
  }
}
```

**关键点**：
- `target`: 控制 TS 编译输出的语法版本
- `lib`: 指定可用的 API（编译时检查）
- Polyfill 由 Babel 处理（运行时填充）

---

### TS + Babel 配合

**推荐方案**：TS 仅做类型检查，Babel 做转换

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  useBuiltIns: 'usage',
                  corejs: 3
                }]
              ]
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true // 仅类型检查
            }
          }
        ]
      }
    ]
  }
};
```

---

## 微前端场景的兼容性

### qiankun 配置

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8081',
    container: '#container',
    activeRule: '/app1'
  }
]);

start();
```

**兼容性问题**：
1. 子应用的 Polyfill 可能冲突
2. 不同子应用可能有不同的兼容性要求

---

### 解决方案：统一 Polyfill

**主应用负责加载 Polyfill**：
```javascript
// 主应用 main.js
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 启动微前端
import { start } from 'qiankun';
start();
```

**子应用不打包 Polyfill**：
```javascript
// 子应用 babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": false // 不注入 Polyfill
    }]
  ]
}
```

---

## 组件库的兼容性策略

### 发布多种格式

```json
// package.json
{
  "name": "my-component-lib",
  "main": "dist/index.cjs.js",      // CommonJS
  "module": "dist/index.esm.js",    // ES Module
  "unpkg": "dist/index.umd.js",     // UMD（浏览器）
  "types": "dist/index.d.ts"        // TypeScript 类型
}
```

---

### Rollup 多格式打包

```javascript
// rollup.config.js
export default [
  // ES Module（现代浏览器/Bundler）
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm'
    },
    external: ['react', 'vue']
  },
  
  // CommonJS（Node.js）
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs'
    },
    external: ['react', 'vue']
  },
  
  // UMD（浏览器）
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MyLib',
      globals: {
        react: 'React',
        vue: 'Vue'
      }
    },
    external: ['react', 'vue'],
    plugins: [
      babel({
        presets: [
          ['@babel/preset-env', {
            targets: '> 0.5%, ie 11',
            useBuiltIns: false // 库不应包含 Polyfill
          }]
        ]
      })
    ]
  }
];
```

---

### 使用 core-js-pure（避免污染全局）

```javascript
// ❌ 库开发错误
import 'core-js/features/array/includes';
export function hasItem(arr, item) {
  return arr.includes(item); // 修改了全局 Array.prototype
}

// ✅ 库开发正确
import includes from 'core-js-pure/features/array/includes';
export function hasItem(arr, item) {
  return includes(arr, item); // 不污染全局
}
```

---

## Monorepo 统一配置

### 项目结构

```
monorepo/
├── packages/
│   ├── app1/
│   │   ├── src/
│   │   ├── package.json
│   │   └── babel.config.js
│   ├── app2/
│   │   ├── src/
│   │   ├── package.json
│   │   └── babel.config.js
│   └── shared/
│       ├── src/
│       └── package.json
├── babel.config.js          # 根配置
├── .browserslistrc          # 统一 targets
└── package.json
```

---

### 根目录统一配置

**.browserslistrc**：
```
> 0.5%
last 2 versions
not dead
```

**babel.config.js**（根目录）：
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      // 自动读取 .browserslistrc
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
};
```

**子项目继承配置**：
```javascript
// packages/app1/babel.config.js
module.exports = {
  extends: '../../babel.config.js'
};
```

---

## 最佳实践清单

### 1. 配置管理

```
✓ 使用 .browserslistrc 统一目标环境
✓ 使用 babel.config.js 而非 .babelrc（支持 Monorepo）
✓ 配置文件版本控制
✓ 文档化配置选择的原因
```

---

### 2. 构建优化

```
✓ 启用 Babel 缓存（cacheDirectory: true）
✓ 使用 @babel/plugin-transform-runtime 避免辅助函数重复
✓ 设置 webpack performance 预算
✓ 使用 webpack-bundle-analyzer 定期检查
```

---

### 3. 开发体验

```
✓ 开发环境仅支持现代浏览器（提升编译速度）
✓ 生产环境配置广泛兼容
✓ 使用 ESLint 检查浏览器 API 兼容性
✓ Git pre-commit hook 检查包体积
```

---

### 4. 测试验证

```
✓ Playwright 跨浏览器自动化测试
✓ BrowserStack 真机测试
✓ CI/CD 集成兼容性测试
✓ Sentry 监控线上兼容性错误
```

---

### 5. 性能监控

```
✓ Lighthouse CI 性能预算
✓ Real User Monitoring（RUM）
✓ 包体积监控（CI 失败阈值）
✓ 定期审查 Polyfill 占比
```

---

## 常见陷阱与解决方案

### ❌ 陷阱 1：node_modules 未转换

**问题**：第三方库使用了 ES6+ 语法，但未转换

**解决**：
```javascript
// webpack.config.js
{
  test: /\.js$/,
  include: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules/some-lib') // 指定需要转换的库
  ],
  use: 'babel-loader'
}
```

---

### ❌ 陷阱 2：CSS 前缀缺失

**问题**：忘记配置 Autoprefixer

**解决**：
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {
      // 自动读取 browserslist
    }
  }
};
```

---

### ❌ 陷阱 3：环境变量未区分

**问题**：开发和生产使用相同配置

**解决**：
```javascript
// babel.config.js
module.exports = function(api) {
  const isDev = api.env('development');
  
  return {
    presets: [
      ['@babel/preset-env', {
        targets: isDev
          ? 'last 1 chrome version'
          : '> 0.5%, last 2 versions, not dead'
      }]
    ]
  };
};
```

---

## 实战配置模板

### React + Webpack 项目

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  
  return {
    entry: './src/index.js',
    output: {
      filename: isDev ? '[name].js' : '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        }
      ]
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html'
      }),
      !isDev && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
        openAnalyzer: false
      })
    ].filter(Boolean),
    
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    
    performance: {
      maxAssetSize: 300000,
      maxEntrypointSize: 500000,
      hints: 'warning'
    }
  };
};
```

**babel.config.js**：
```javascript
module.exports = function(api) {
  const isDev = api.env('development');
  
  return {
    presets: [
      ['@babel/preset-env', {
        targets: isDev
          ? 'last 1 chrome version'
          : '> 0.5%, last 2 versions, not dead',
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false
      }],
      '@babel/preset-react'
    ],
    plugins: [
      ['@babel/plugin-transform-runtime', {
        corejs: false,
        helpers: true,
        regenerator: true
      }]
    ]
  };
};
```

---

### Vue 3 + Vite 项目

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['> 0.5%', 'last 2 versions', 'not dead'],
      modernPolyfills: true
    })
  ],
  
  build: {
    target: 'es2015',
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },
  
  server: {
    port: 3000
  }
});
```

---

## CI/CD 集成

### GitHub Actions 示例

```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist | awk '{print $1}')
          if [ $SIZE -gt 500000 ]; then
            echo "Bundle too large: $SIZE bytes"
            exit 1
          fi
      
      - name: Playwright tests
        run: npx playwright test
      
      - name: Lighthouse CI
        run: npx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

## 关键要点

1. **工具配合**：Webpack/Vite + Babel + browserslist 统一配置
2. **TypeScript**：仅做类型检查，Babel 负责转换和 Polyfill
3. **微前端**：主应用统一 Polyfill，子应用不重复打包
4. **组件库**：使用 core-js-pure，避免污染全局
5. **Monorepo**：根目录统一配置，子项目继承

---

## 总结

前端兼容性处理是一个**系统工程**，需要：

**技术层面**：
- 理解语法转换 vs API 垫片
- 掌握 Babel、core-js、browserslist
- 熟悉现代构建工具配置

**工程层面**：
- 建立标准化配置流程
- 集成自动化测试
- 监控线上兼容性问题

**决策层面**：
- 基于数据选择目标环境
- 权衡兼容性与性能
- 持续优化包体积

**最终目标**：
- ✅ 覆盖目标用户群体
- ✅ 最小化包体积和性能损失
- ✅ 可维护、可扩展的方案

---

## 参考资源

- **Babel 官方文档**：https://babeljs.io/docs/
- **core-js GitHub**：https://github.com/zloirock/core-js
- **browserslist**：https://github.com/browserslist/browserslist
- **Can I Use**：https://caniuse.com/
- **Webpack 官方文档**：https://webpack.js.org/
- **Vite 官方文档**：https://vitejs.dev/
- **MDN 兼容性表格**：https://developer.mozilla.org/
