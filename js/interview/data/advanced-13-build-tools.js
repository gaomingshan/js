/**
 * 构建工具
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced13BuildTools = {
  "config": {
    "title": "构建工具",
    "icon": "🛠️",
    "description": "掌握Webpack、Vite、Rollup、Babel等现代构建工具",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["Webpack基础"],
      "question": "Webpack的核心概念不包括哪个？",
      "options": [
        "Compiler",
        "Entry",
        "Loader",
        "Plugin"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Webpack核心概念：",
        "points": [
          "Entry - 入口起点",
          "Output - 输出配置",
          "Loader - 转换器",
          "Plugin - 插件",
          "Mode - 模式（development/production）",
          "Module - 模块"
        ],
        "code": "module.exports = {\n  entry: './src/index.js',\n  output: {\n    path: path.resolve(__dirname, 'dist'),\n    filename: 'bundle.js'\n  },\n  module: {\n    rules: [\n      { test: /\\.css$/, use: ['style-loader', 'css-loader'] }\n    ]\n  },\n  plugins: [\n    new HtmlWebpackPlugin()\n  ],\n  mode: 'production'\n};"
      },
      "source": "Webpack"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["Loader vs Plugin"],
      "question": "以下哪些是Webpack Loader的特点？",
      "options": [
        "处理非JavaScript文件",
        "链式调用",
        "从右到左执行",
        "可以访问webpack编译流程",
        "返回转换后的代码",
        "可以修改输出文件"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "Loader vs Plugin：",
        "code": "// Loader：转换器\n// - 处理文件转换\n// - 链式调用\n// - 从右到左执行\nmodule: {\n  rules: [\n    {\n      test: /\\.scss$/,\n      use: [\n        'style-loader',  // 3. 插入<style>\n        'css-loader',    // 2. 转CSS\n        'sass-loader'    // 1. 编译Sass\n      ]\n    }\n  ]\n}\n\n// Plugin：插件\n// - 扩展webpack功能\n// - 访问编译生命周期\n// - 可以修改输出\nplugins: [\n  new HtmlWebpackPlugin({ template: './index.html' }),\n  new MiniCssExtractPlugin({ filename: 'styles.css' }),\n  new webpack.DefinePlugin({ 'process.env.NODE_ENV': '\"production\"' })\n]"
      },
      "source": "Loader Plugin"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Tree Shaking"],
      "question": "以下代码经过Tree Shaking后会保留哪些？",
      "code": "// utils.js\nexport function usedFunction() { return 'used'; }\nexport function unusedFunction() { return 'unused'; }\n\n// main.js\nimport { usedFunction } from './utils';\nconsole.log(usedFunction());",
      "options": [
        "只保留usedFunction",
        "两个函数都保留",
        "两个函数都删除",
        "取决于配置"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Tree Shaking原理：",
        "code": "// 条件\n// 1. ES6 Module\n// 2. production模式\n// 3. 无副作用\n\n// webpack.config.js\nmodule.exports = {\n  mode: 'production',\n  optimization: {\n    usedExports: true, // 标记未使用导出\n    sideEffects: false // 删除无副作用代码\n  }\n};\n\n// package.json\n{\n  \"sideEffects\": false // 或指定有副作用的文件\n}"
      },
      "source": "Tree Shaking"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Vite"],
      "question": "Vite在开发环境使用ES Module，生产环境使用Rollup打包",
      "correctAnswer": "A",
      "explanation": {
        "title": "Vite工作原理：",
        "code": "// 开发环境\n// - 基于ES Module\n// - 按需编译\n// - 快速HMR\n\n// 生产环境\n// - 使用Rollup打包\n// - Tree Shaking\n// - 代码分割\n\n// vite.config.js\nexport default {\n  build: {\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          'vendor': ['react', 'react-dom']\n        }\n      }\n    }\n  }\n}"
      },
      "source": "Vite"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["代码分割"],
      "question": "实现路由懒加载，空白处填什么？",
      "code": "const routes = [\n  {\n    path: '/home',\n    component: ______\n  }\n];",
      "options": [
        "() => import('./views/Home.vue')",
        "require('./views/Home.vue')",
        "import('./views/Home.vue')",
        "lazy(() => import('./views/Home.vue'))"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "代码分割方式：",
        "code": "// 1. 动态import（推荐）\nconst Home = () => import('./views/Home.vue');\n\n// 2. 命名chunk\nconst Home = () => import(\n  /* webpackChunkName: \"home\" */ './views/Home.vue'\n);\n\n// 3. 魔法注释\nconst Home = () => import(\n  /* webpackChunkName: \"home\" */\n  /* webpackPrefetch: true */\n  './views/Home.vue'\n);\n\n// webpack自动分割\nmodule.exports = {\n  optimization: {\n    splitChunks: {\n      chunks: 'all',\n      cacheGroups: {\n        vendor: {\n          test: /node_modules/,\n          name: 'vendors'\n        }\n      }\n    }\n  }\n}"
      },
      "source": "代码分割"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Babel"],
      "question": "以下哪些是Babel的功能？",
      "options": [
        "转译ES6+语法",
        "Polyfill API",
        "JSX转换",
        "TypeScript编译",
        "代码压缩",
        "Tree Shaking"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "Babel功能：",
        "code": "// .babelrc\n{\n  \"presets\": [\n    [\"@babel/preset-env\", {\n      \"targets\": \"> 0.25%, not dead\",\n      \"useBuiltIns\": \"usage\",\n      \"corejs\": 3\n    }],\n    \"@babel/preset-react\",\n    \"@babel/preset-typescript\"\n  ],\n  \"plugins\": [\n    \"@babel/plugin-transform-runtime\"\n  ]\n}\n\n// 转译示例\n// 输入\nconst fn = () => {};\nconst arr = [1, 2, 3];\n\n// 输出\nvar fn = function fn() {};\nvar arr = [1, 2, 3];"
      },
      "source": "Babel"
    },
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["HMR"],
      "question": "HMR（热模块替换）会刷新整个页面吗？",
      "options": [
        "不会，只更新修改的模块",
        "会刷新",
        "取决于配置",
        "只在开发环境刷新"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "HMR原理：",
        "code": "// webpack配置\nmodule.exports = {\n  devServer: {\n    hot: true\n  }\n};\n\n// 代码中接受HMR\nif (module.hot) {\n  module.hot.accept('./module.js', () => {\n    // 模块更新时执行\n    console.log('模块已更新');\n  });\n}\n\n// Vite自动HMR\n// React Fast Refresh\n// Vue HMR"
      },
      "source": "HMR"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["性能优化"],
      "question": "source map应该在生产环境启用以便调试",
      "correctAnswer": "B",
      "explanation": {
        "title": "source map配置：",
        "code": "// 开发环境：详细映射\nmodule.exports = {\n  mode: 'development',\n  devtool: 'eval-source-map' // 快速重建\n};\n\n// 生产环境：不生成或隐藏\nmodule.exports = {\n  mode: 'production',\n  devtool: false // 或 'hidden-source-map'\n};\n\n// 原因\n// - 暴露源码\n// - 增大文件体积\n// - 可用错误监控服务"
      },
      "source": "source map"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["自定义Loader"],
      "question": "实现简单的Loader，空白处填什么？",
      "code": "module.exports = function(source) {\n  const result = source.replace(/console\\.log/g, '');\n  return ______;\n};",
      "options": [
        "result",
        "JSON.stringify(result)",
        "this.callback(null, result)",
        "{ code: result }"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "自定义Loader：",
        "code": "// 简单Loader\nmodule.exports = function(source) {\n  const result = transform(source);\n  return result;\n};\n\n// 使用callback\nmodule.exports = function(source) {\n  const callback = this.callback;\n  const result = transform(source);\n  callback(null, result, sourceMap);\n};\n\n// 异步Loader\nmodule.exports = function(source) {\n  const callback = this.async();\n  \n  someAsyncOperation(source, (err, result) => {\n    callback(err, result);\n  });\n};\n\n// 使用\nmodule: {\n  rules: [\n    {\n      test: /\\.js$/,\n      use: [\n        { loader: path.resolve('./my-loader.js') }\n      ]\n    }\n  ]\n}"
      },
      "source": "自定义Loader"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["构建优化"],
      "question": "以下哪些是构建性能优化方法？",
      "options": [
        "使用缓存",
        "多进程构建",
        "减少resolve范围",
        "使用DllPlugin",
        "删除所有注释",
        "externals排除第三方库"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "构建优化策略：",
        "code": "module.exports = {\n  // 1. 缓存\n  cache: {\n    type: 'filesystem'\n  },\n  \n  // 2. 多进程\n  module: {\n    rules: [\n      {\n        test: /\\.js$/,\n        use: 'thread-loader'\n      }\n    ]\n  },\n  \n  // 3. 缩小范围\n  resolve: {\n    modules: [path.resolve('node_modules')],\n    extensions: ['.js', '.jsx']\n  },\n  \n  // 4. externals\n  externals: {\n    'react': 'React',\n    'react-dom': 'ReactDOM'\n  },\n  \n  // 5. Tree Shaking\n  optimization: {\n    usedExports: true,\n    sideEffects: false\n  }\n}"
      },
      "source": "构建优化"
    }
  ],
  "navigation": {
    "prev": {
      "title": "包管理",
      "url": "../advanced/12-package-management.html"
    },
    "next": {
      "title": "工程化实践",
      "url": "13-engineering.html"
    }
  }
};
