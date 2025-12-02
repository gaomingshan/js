/**
 * 模块化对比
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2403ModuleComparison = {
  "config": {
    "title": "模块化对比",
    "icon": "⚖️",
    "description": "对比CommonJS和ES Modules的差异和使用场景",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["加载方式"],
      "question": "CommonJS和ES Modules的加载方式有什么区别？",
      "options": [
        "CommonJS同步加载，ES Modules异步加载",
        "CommonJS异步加载，ES Modules同步加载",
        "都是同步加载",
        "都是异步加载"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "加载方式对比",
        "code": "// CommonJS：同步加载\nconst fs = require('fs');  // 阻塞，等待加载完成\nconst data = fs.readFileSync('file.txt');\nconsole.log('loaded');\n\n// 适合Node.js（服务器）：\n// - 文件在本地\n// - 启动时加载\n// - 加载快\n\n// ES Modules：异步加载（浏览器）\nimport { readFile } from 'fs';\n// 静态import在模块解析阶段异步加载\n// 执行时已经加载完成\n\n// 动态import明确异步\nconst module = await import('./module.js');\n\n// 对比总结：\n/*\n特性          | CommonJS | ES Modules\n-------------|----------|------------\n加载方式      | 同步     | 异步（静态分析）\n加载时机      | 运行时   | 编译时\n输出          | 值拷贝   | 引用绑定\n环境          | Node.js  | 浏览器+Node.js\n动态导入      | 天然支持 | import()\nTree Shaking | 不支持   | 支持\n*/\n\n// 实际影响：\n// CommonJS在浏览器需要打包\n// ES Modules可以直接在浏览器使用"
      },
      "source": "加载方式"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["导出差异"],
      "question": "以下代码的行为差异？",
      "code": "// CommonJS\n// counter.js\nlet count = 0;\nexports.count = count;\nexports.increment = () => count++;\n\n// main.js\nconst { count, increment } = require('./counter');\nincrement();\nconsole.log(count);  // ?\n\n// ES Modules\n// counter.mjs\nexport let count = 0;\nexport const increment = () => count++;\n\n// main.mjs\nimport { count, increment } from './counter.mjs';\nincrement();\nconsole.log(count);  // ?",
      "options": [
        "CommonJS输出0，ES Modules输出1",
        "都输出0",
        "都输出1",
        "CommonJS输出1，ES Modules输出0"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "值拷贝 vs 引用绑定",
        "code": "// CommonJS：值拷贝\n// counter.js\nlet count = 0;\nexports.count = count;  // 导出count的值（0）\nexports.increment = () => count++;\n\n// main.js\nconst { count, increment } = require('./counter');\nconsole.log(count);  // 0（拷贝的值）\nincrement();         // 内部count变为1\nconsole.log(count);  // 0（拷贝不变）\n\n// ES Modules：引用绑定\n// counter.mjs\nexport let count = 0;  // 导出count的引用\nexport const increment = () => count++;\n\n// main.mjs\nimport { count, increment } from './counter.mjs';\nconsole.log(count);  // 0（引用）\nincrement();         // 修改count\nconsole.log(count);  // 1（动态绑定，看到最新值）\n\n// 关键区别：\n// CommonJS: exports.x = value（拷贝值）\n// ES Modules: export let x（绑定引用）\n\n// CommonJS导出对象可以共享\n// counter.js\nconst state = { count: 0 };\nexports.state = state;  // 导出对象引用\nexports.increment = () => state.count++;\n\n// main.js\nconst { state, increment } = require('./counter');\nincrement();\nconsole.log(state.count);  // 1（对象引用）"
      },
      "source": "导出差异"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["兼容性"],
      "question": "关于模块兼容性说法正确的是？",
      "options": [
        "Node.js同时支持两种模块",
        ".mjs文件使用ES Modules",
        ".cjs文件使用CommonJS",
        "package.json可以指定模块类型",
        "可以混用两种模块",
        "ES Modules不能导入CommonJS"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "模块兼容性",
        "code": "// Node.js模块支持\n\n// 1. 文件扩展名\n// .mjs - ES Modules\n// .cjs - CommonJS\n// .js - 取决于package.json\n\n// 2. package.json配置\n{\n  \"type\": \"module\"  // .js使用ES Modules\n}\n\n{\n  \"type\": \"commonjs\"  // .js使用CommonJS（默认）\n}\n\n// 3. ES Modules导入CommonJS\n// math.cjs (CommonJS)\nmodule.exports = {\n  add: (a, b) => a + b\n};\n\n// main.mjs (ES Modules)\nimport math from './math.cjs';  // ✅ 默认导入\nimport { add } from './math.cjs';  // ❌ 不支持命名导入\n\nmath.add(1, 2);  // ✅\n\n// 4. CommonJS导入ES Modules\n// utils.mjs (ES Modules)\nexport const util = () => {};\n\n// main.cjs (CommonJS)\n// const { util } = require('./utils.mjs');  // ❌ 不支持\n\n// ✅ 使用动态import\n(async () => {\n  const { util } = await import('./utils.mjs');\n  util();\n})();\n\n// 5. 双模式包\n// package.json\n{\n  \"main\": \"./dist/index.cjs\",      // CommonJS入口\n  \"module\": \"./dist/index.mjs\",    // ES Modules入口\n  \"exports\": {\n    \"require\": \"./dist/index.cjs\",  // CommonJS\n    \"import\": \"./dist/index.mjs\"    // ES Modules\n  }\n}\n\n// 6. 条件导出\n{\n  \"exports\": {\n    \"node\": \"./node.js\",\n    \"browser\": \"./browser.js\",\n    \"default\": \"./index.js\"\n  }\n}"
      },
      "source": "兼容性"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["静态分析"],
      "question": "ES Modules支持静态分析，CommonJS不支持",
      "correctAnswer": "A",
      "explanation": {
        "title": "静态分析对比",
        "code": "// ES Modules：静态结构\n// 编译时就能确定依赖关系\n\n// ✅ 编译时分析\nimport { x } from './module.js';\n// 工具可以分析：\n// - 导入了什么\n// - 从哪里导入\n// - 哪些代码未使用（Tree Shaking）\n\n// CommonJS：动态结构\n// 运行时才能确定\n\n// ❌ 难以静态分析\nconst moduleName = process.env.MODULE;\nconst module = require(`./${moduleName}`);\n// 工具无法分析：模块路径是运行时确定的\n\n// ❌ 条件导入\nif (condition) {\n  module.exports = require('./a');\n} else {\n  module.exports = require('./b');\n}\n// 工具不知道会导入哪个\n\n// 静态分析的优势：\n\n// 1. Tree Shaking\n// utils.js\nexport const used = () => {};\nexport const unused = () => {};  // 会被移除\n\n// main.js\nimport { used } from './utils.js';\n\n// 2. 循环依赖检测\n// 工具可以在编译时发现\n\n// 3. 类型检查（TypeScript）\nimport { User } from './types';\n// 编译时验证类型\n\n// 4. 代码分割\n// Webpack可以分析依赖树，智能分割\n\n// 5. 预加载提示\n<link rel=\"modulepreload\" href=\"./module.js\">\n// 浏览器可以预加载"
      },
      "source": "静态分析"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["互操作"],
      "question": "ES Modules导入CommonJS，空白处填什么？",
      "code": "// math.cjs (CommonJS)\nmodule.exports = {\n  add: (a, b) => a + b,\n  subtract: (a, b) => a - b\n};\n\n// main.mjs (ES Modules)\nimport ______ from './math.cjs';\n\nconsole.log(math.add(1, 2));",
      "options": [
        "math",
        "{ add, subtract }",
        "* as math",
        "default"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "CommonJS与ES Modules互操作",
        "code": "// ES Modules导入CommonJS\n\n// 1. 默认导入（推荐）\n// math.cjs\nmodule.exports = {\n  add: (a, b) => a + b\n};\n\n// main.mjs\nimport math from './math.cjs';  // ✅ 默认导入\nmath.add(1, 2);\n\n// ❌ 命名导入不支持\n// import { add } from './math.cjs';  // 错误\n\n// 2. 命名空间导入\nimport * as math from './math.cjs';  // ✅\nmath.default.add(1, 2);\n\n// 3. CommonJS的exports\n// utils.cjs\nexports.x = 1;\nexports.y = 2;\n\n// main.mjs\nimport utils from './utils.cjs';\nconsole.log(utils);  // { x: 1, y: 2 }\n\n// 4. CommonJS导入ES Modules\n// 只能用动态import\n\n// module.mjs\nexport const x = 1;\n\n// main.cjs\n(async () => {\n  const { x } = await import('./module.mjs');\n  console.log(x);\n})();\n\n// 5. 创建兼容包\n// 同时导出CommonJS和ES Modules\n\n// index.cjs (CommonJS)\nmodule.exports = {\n  add: (a, b) => a + b\n};\n\n// index.mjs (ES Modules)\nexport { add } from './index.cjs';\n\n// package.json\n{\n  \"main\": \"./index.cjs\",\n  \"module\": \"./index.mjs\",\n  \"exports\": {\n    \"require\": \"./index.cjs\",\n    \"import\": \"./index.mjs\"\n  }\n}"
      },
      "source": "互操作"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["this绑定"],
      "question": "顶层this的区别？",
      "code": "// CommonJS\n// a.js\nconsole.log(this === exports);  // ?\n\n// ES Modules\n// b.mjs\nconsole.log(this);  // ?",
      "options": [
        "true, undefined",
        "false, undefined",
        "true, window",
        "false, global"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "this绑定差异",
        "code": "// CommonJS：顶层this指向exports\n// module.js\nconsole.log(this === exports);  // true\nconsole.log(this === module.exports);  // true\n\nthis.x = 1;\nconsole.log(exports.x);  // 1\n\n// 原因：模块包装函数\n(function(exports, require, module, __filename, __dirname) {\n  // 模块代码\n  console.log(this);  // exports\n}).call(module.exports, ...);\n\n// ES Modules：顶层this是undefined\n// module.mjs\nconsole.log(this);  // undefined\n\n// 原因：模块自动严格模式\n// 'use strict' 下，顶层this是undefined\n\n// 函数中的this\n// CommonJS\nfunction test() {\n  console.log(this);  // undefined（严格模式）\n}\n\n// ES Modules\nfunction test() {\n  console.log(this);  // undefined（自动严格模式）\n}\n\n// 获取全局对象\n// CommonJS\nconst global = this;  // module.exports\nconst actualGlobal = globalThis;  // ✅\n\n// ES Modules\nconst global = globalThis;  // ✅ 唯一方式\n\n// 实际影响\n// CommonJS可以用this导出\nthis.myFunc = function() {};\n\n// ES Modules必须用export\nexport function myFunc() {}"
      },
      "source": "this绑定"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["使用场景"],
      "question": "选择模块系统的考虑因素？",
      "options": [
        "目标环境（Node.js/浏览器）",
        "是否需要Tree Shaking",
        "团队技术栈",
        "总是用CommonJS",
        "打包工具支持",
        "向后兼容性"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "模块选择指南",
        "code": "// 选择CommonJS的场景：\n\n// 1. 纯Node.js项目\n// server.js\nconst express = require('express');\nconst app = express();\n\n// 2. 旧项目维护\n// 已有大量CommonJS代码\n\n// 3. 需要动态require\nconst config = require(`./${env}.config`);\n\n// 4. npm包向后兼容\nmodule.exports = { /* ... */ };\n\n// 选择ES Modules的场景：\n\n// 1. 现代Web应用\nimport React from 'react';\nimport { useState } from 'react';\n\n// 2. 需要Tree Shaking\n// 减少打包体积\nimport { debounce } from 'lodash-es';\n\n// 3. 浏览器原生支持\n<script type=\"module\" src=\"./app.js\"></script>\n\n// 4. TypeScript项目\nimport type { User } from './types';\n\n// 5. 现代Node.js（v14+）\n// package.json\n{ \"type\": \"module\" }\n\n// 混合方案：\n\n// 1. 双模式包\n{\n  \"main\": \"./dist/index.cjs\",\n  \"module\": \"./dist/index.mjs\"\n}\n\n// 2. 渐进迁移\n// 新代码用ES Modules\n// 旧代码保持CommonJS\n\n// 3. 打包工具桥接\n// Webpack/Rollup支持两种\n\n// 决策树：\n/*\n浏览器环境？\n├─ 是 → ES Modules\n└─ 否 → Node.js版本？\n    ├─ v14+ → ES Modules（推荐）\n    └─ 旧版本 → CommonJS\n\n需要Tree Shaking？\n├─ 是 → ES Modules\n└─ 否 → 都可以\n\n需要动态导入路径？\n├─ 是 → CommonJS或import()\n└─ 否 → ES Modules\n*/"
      },
      "source": "使用场景"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["未来趋势"],
      "question": "ES Modules是JavaScript模块化的未来标准",
      "correctAnswer": "A",
      "explanation": {
        "title": "模块化发展趋势",
        "code": "// ES Modules是官方标准\n// ECMAScript规范的一部分\n\n// 趋势：\n\n// 1. Node.js全面支持\n// Node.js v12+原生支持\n// Node.js v14+稳定\n\n// 2. 浏览器原生支持\n// Chrome, Firefox, Safari, Edge都支持\n<script type=\"module\">\n  import { x } from './module.js';\n</script>\n\n// 3. 工具链支持\n// - TypeScript默认ES Modules\n// - Webpack/Rollup/Vite优先支持\n// - Babel转译支持\n\n// 4. npm包趋势\n// 越来越多包提供ES Modules版本\n{\n  \"exports\": {\n    \"import\": \"./esm/index.js\",\n    \"require\": \"./cjs/index.js\"\n  }\n}\n\n// 5. Deno只支持ES Modules\nimport { serve } from 'https://deno.land/std/http/server.ts';\n\n// CommonJS的位置：\n// - Node.js生态系统\n// - 向后兼容\n// - 渐进式退出\n\n// 迁移建议：\n\n// 1. 新项目用ES Modules\n{\n  \"type\": \"module\"\n}\n\n// 2. 库同时提供两种格式\n// 使用工具（如Rollup）生成\n\n// 3. 旧项目渐进迁移\n// .mjs文件使用ES Modules\n// .cjs文件保持CommonJS\n\n// 4. 使用最新Node.js\n// 更好的ES Modules支持"
      },
      "source": "未来趋势"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["性能对比"],
      "question": "优化模块加载性能，空白处填什么？",
      "code": "// 浏览器中预加载模块\n<link rel=\"______\" href=\"./heavy-module.js\">",
      "options": [
        "modulepreload",
        "preload",
        "prefetch",
        "preconnect"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "模块性能优化",
        "code": "// 1. modulepreload（ES Modules专用）\n<link rel=\"modulepreload\" href=\"./module.js\">\n// 预加载模块及其依赖\n// 优先级高，立即加载\n\n// vs preload\n<link rel=\"preload\" href=\"./script.js\" as=\"script\">\n// 预加载单个资源\n// 不会预加载依赖\n\n// 2. 动态import优化\n// 路由懒加载\nconst routes = {\n  '/home': () => import('./Home.js'),\n  '/about': () => import(\n    /* webpackChunkName: \"about\" */\n    /* webpackPrefetch: true */\n    './About.js'\n  )\n};\n\n// 3. CommonJS性能\n// 同步加载，启动慢\nconst heavy = require('./heavy');  // 阻塞\n\n// 优化：延迟加载\nlet heavy;\nfunction useHeavy() {\n  if (!heavy) {\n    heavy = require('./heavy');\n  }\n  return heavy;\n}\n\n// 4. ES Modules性能\n// HTTP/2多路复用\n// 可以并行加载多个模块\n\n// 5. 打包优化\n// Webpack代码分割\nentry: {\n  main: './src/main.js',\n  vendor: './src/vendor.js'\n}\n\n// 6. Tree Shaking\n// ES Modules天然支持\n// 减少打包体积\n\n// 7. 缓存策略\n// 模块文件名包含hash\n// output: 'bundle.[contenthash].js'\n\n// 性能对比：\n/*\n场景          | CommonJS | ES Modules\n-------------|----------|------------\n浏览器        | 需要打包 | 原生支持\n启动速度      | 慢（同步）| 快（异步）\nTree Shaking | 不支持   | 支持\n代码分割      | 复杂     | 简单\n缓存          | 粗粒度   | 细粒度\n*/"
      },
      "source": "性能对比"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "模块化最佳实践？",
      "options": [
        "新项目优先ES Modules",
        "库提供双格式支持",
        "避免循环依赖",
        "混用两种模块系统",
        "使用package.json配置",
        "利用Tree Shaking"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "模块化最佳实践总结",
        "code": "// 1. 新项目用ES Modules\n// package.json\n{\n  \"type\": \"module\"\n}\n\n// 2. 库提供双格式\n// package.json\n{\n  \"main\": \"./dist/index.cjs\",\n  \"module\": \"./dist/index.mjs\",\n  \"exports\": {\n    \"require\": \"./dist/index.cjs\",\n    \"import\": \"./dist/index.mjs\"\n  }\n}\n\n// 3. 避免循环依赖\n// ✅ 提取共享代码\n// a.js → shared.js ← b.js\n\n// 4. 不要混用\n// ❌ 一个文件中混用\nexport const x = 1;\nmodule.exports = { y: 2 };  // 冲突\n\n// 5. 明确文件扩展名\nimport { x } from './module.js';  // ✅\nimport { y } from './module';     // ❌ Node.js\n\n// 6. 使用命名导出（Tree Shaking）\n// ✅\nexport { add, subtract };\n\n// ❌\nexport default { add, subtract };\n\n// 7. 动态导入优化\nconst module = await import('./heavy.js');\n\n// 8. 条件导出\n{\n  \"exports\": {\n    \"node\": \"./node.js\",\n    \"browser\": \"./browser.js\"\n  }\n}\n\n// 9. 文档化依赖\n// 使用JSDoc或TypeScript\nimport type { User } from './types';\n\n// 10. 测试兼容性\n// 确保CommonJS和ES Modules都能用"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "ES Modules",
      "url": "24-02-es-modules.html"
    },
    "next": {
      "title": "开始学习第25章",
      "url": "../index.html"
    }
  }
};
