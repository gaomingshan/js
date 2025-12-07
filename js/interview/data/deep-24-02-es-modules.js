/**
 * ES Modules
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2402ESModules = {
  "config": {
    "title": "ES Modules",
    "icon": "📜",
    "description": "深入理解ES6模块系统的特性和使用",
    "primaryColor": "#ef4444",
    "bgGradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["ES Modules"],
      "question": "ES Modules使用什么关键字导入模块？",
      "options": [
        "import",
        "require",
        "load",
        "include"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES Modules语法",
        "code": "// ES Modules导入导出语法\n\n// 导出\n// 命名导出\nexport const PI = 3.14;\nexport function add(a, b) {\n  return a + b;\n}\n\n// 默认导出\nexport default class Calculator {\n  // ...\n}\n\n// 批量导出\nconst x = 1;\nconst y = 2;\nexport { x, y };\n\n// 导入\n// 命名导入\nimport { PI, add } from './math.js';\n\n// 默认导入\nimport Calculator from './calculator.js';\n\n// 混合导入\nimport Calculator, { PI, add } from './math.js';\n\n// 全部导入\nimport * as math from './math.js';\n\n// 重命名\nimport { add as sum } from './math.js';\n\n// 特点：\n// 1. 静态导入（编译时）\n// 2. 自动严格模式\n// 3. 顶层this是undefined\n// 4. 只能在模块顶层使用import/export"
      },
      "source": "ES Modules"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["动态绑定"],
      "question": "ES Modules的动态绑定？",
      "code": "// counter.js\nexport let count = 0;\n\nexport function increment() {\n  count++;\n}\n\n// main.js\nimport { count, increment } from './counter.js';\n\nconsole.log(count);  // ?\nincrement();\nconsole.log(count);  // ?",
      "options": [
        "0, 1",
        "0, 0",
        "报错",
        "undefined, 1"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES Modules动态绑定",
        "code": "// ES Modules是动态绑定（引用）\n\n// counter.js\nexport let count = 0;\n\nexport function increment() {\n  count++;\n}\n\n// main.js\nimport { count, increment } from './counter.js';\n\nconsole.log(count);  // 0\nincrement();         // 修改count\nconsole.log(count);  // 1（动态绑定，看到最新值）\n\n// ❌ 导入的绑定是只读的\n// count = 10;  // TypeError: Assignment to constant variable\n\n// vs CommonJS（值拷贝）\n// counter.js (CommonJS)\nlet count = 0;\nfunction increment() { count++; }\nmodule.exports = { count, increment };\n\n// main.js (CommonJS)\nconst { count, increment } = require('./counter');\nconsole.log(count);  // 0\nincrement();\nconsole.log(count);  // 0（值拷贝，不变）\n\n// ES Modules的优势：\n// 1. 总是获取最新值\n// 2. 支持循环依赖\n// 3. 可以做静态分析\n\n// 实际应用\n// store.js\nexport let state = { count: 0 };\n\nexport function setState(newState) {\n  state = { ...state, ...newState };\n}\n\n// component.js\nimport { state } from './store.js';\nconsole.log(state.count);  // 总是最新值"
      },
      "source": "动态绑定"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["import特性"],
      "question": "import语句的特点？",
      "options": [
        "会提升到模块顶部",
        "必须在模块顶层",
        "支持动态路径",
        "可以条件导入",
        "静态分析",
        "严格模式"
      ],
      "correctAnswer": ["A", "B", "E", "F"],
      "explanation": {
        "title": "import语句特性",
        "code": "// 1. import提升（Hoisting）\nconsole.log(PI);  // 可以使用\nimport { PI } from './math.js';\n// import会提升到顶部\n\n// 2. 必须在顶层\n// ❌ 不能在块中\nif (condition) {\n  import { x } from './module.js';  // SyntaxError\n}\n\n// ❌ 不能在函数中\nfunction load() {\n  import { y } from './module.js';  // SyntaxError\n}\n\n// ✅ 使用动态import()\nif (condition) {\n  const module = await import('./module.js');\n}\n\n// 3. 不支持动态路径\nconst moduleName = 'math';\n// import { x } from `./${moduleName}.js`;  // SyntaxError\n\n// ✅ 使用动态import()\nconst module = await import(`./${moduleName}.js`);\n\n// 4. 静态分析\n// 编译时就能确定依赖关系\n// 支持Tree Shaking\n// Webpack等工具可以优化\n\n// 5. 自动严格模式\n// ES Module自动启用严格模式\n// 不需要'use strict'\n\n// 6. 顶层this是undefined\nconsole.log(this);  // undefined（模块中）\n// vs 脚本中：window/global\n\n// 7. 执行顺序\nimport './a.js';  // 先执行\nimport './b.js';  // 后执行\nconsole.log('main');  // 最后执行\n\n// 8. 单例\n// 模块只执行一次\nimport './init.js';\nimport './init.js';  // 不会重复执行"
      },
      "source": "import特性"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["export default"],
      "question": "一个模块只能有一个默认导出",
      "correctAnswer": "A",
      "explanation": {
        "title": "默认导出",
        "code": "// 一个模块只能有一个export default\n\n// ✅ 正确\nexport default class MyClass {}\n\n// ❌ 错误：只能有一个默认导出\nexport default function() {}  // SyntaxError\n\n// 默认导出的方式：\n\n// 1. 导出声明\nexport default class Calculator {}\nexport default function add() {}\n\n// 2. 导出值\nconst config = { /* ... */ };\nexport default config;\n\n// 3. 匿名导出\nexport default {\n  add() {},\n  subtract() {}\n};\n\n// 导入默认导出\nimport MyClass from './module.js';\nimport Whatever from './module.js';  // 可以任意命名\n\n// 混合导入\nimport Calculator, { PI, add } from './math.js';\n// 等价于：\nimport { default as Calculator, PI, add } from './math.js';\n\n// 默认导出 vs 命名导出\n\n// 默认导出：\n// - 一个模块一个\n// - 导入时可任意命名\n// - 适合主要导出\n\n// 命名导出：\n// - 一个模块多个\n// - 导入时必须匹配名称\n// - 适合工具函数\n\n// 最佳实践：\n// ✅ 优先使用命名导出\nexport { add, subtract, multiply };\n\n// ✅ 默认导出用于主类/组件\nexport default class App {}"
      },
      "source": "默认导出"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["重导出"],
      "question": "重新导出模块，空白处填什么？",
      "code": "// utils/index.js\n// 重新导出其他模块\n______ * from './string.js';\n______ * from './number.js';\n______ { default as math } from './math.js';",
      "options": [
        "export, export, export",
        "import, import, import",
        "module, module, module",
        "re-export, re-export, re-export"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "重导出（Re-export）",
        "code": "// 重导出：聚合多个模块\n\n// utils/index.js\n// 1. 导出所有命名导出\nexport * from './string.js';\nexport * from './number.js';\n\n// 2. 导出特定内容\nexport { trim, split } from './string.js';\nexport { random } from './number.js';\n\n// 3. 重命名导出\nexport { trim as trimString } from './string.js';\n\n// 4. 导出默认为命名\nexport { default as math } from './math.js';\n\n// 5. 混合导入导出\nimport { helper } from './helper.js';\nexport { helper };\n\n// 使用\nimport * as utils from './utils/index.js';\nutils.trim(' hello ');\nutils.random();\n\n// 应用场景：\n\n// 1. 创建索引文件\n// components/index.js\nexport { Button } from './Button.js';\nexport { Input } from './Input.js';\nexport { Select } from './Select.js';\n\n// 使用\nimport { Button, Input } from './components';\n\n// 2. 命名空间\n// math/index.js\nexport * as geometry from './geometry.js';\nexport * as algebra from './algebra.js';\n\n// 使用\nimport * as math from './math';\nmath.geometry.area();\nmath.algebra.solve();\n\n// 3. 兼容性层\n// v2/index.js\nexport * from './v1';\nexport { newFeature } from './v2';"
      },
      "source": "重导出"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["循环依赖"],
      "question": "ES Modules循环依赖的处理？",
      "code": "// a.js\nimport { b } from './b.js';\nexport const a = 'a';\nconsole.log('a:', b);\n\n// b.js\nimport { a } from './a.js';\nexport const b = 'b';\nconsole.log('b:', a);\n\n// main.js\nimport './a.js';\n\n// 输出什么？",
      "options": [
        "b: undefined, a: b",
        "报错",
        "b: a, a: b",
        "无输出"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES Modules循环依赖",
        "code": "// ES Modules可以处理循环依赖\n\n// a.js\nimport { b } from './b.js';\nexport const a = 'a';\nconsole.log('a:', b);\n\n// b.js\nimport { a } from './a.js';\nexport const b = 'b';\nconsole.log('b:', a);\n\n// main.js\nimport './a.js';\n\n// 执行流程：\n// 1. main导入a\n// 2. a导入b\n// 3. b导入a（循环！）\n// 4. a还未执行完，a是undefined\n// 5. b继续执行：console.log('b:', undefined)\n// 6. b执行完成，导出b = 'b'\n// 7. a继续执行：console.log('a:', 'b')\n\n// 输出：\n// b: undefined\n// a: b\n\n// 解决循环依赖：\n\n// 1. 重构代码结构\n// a.js → shared.js ← b.js\n\n// 2. 延迟访问\n// a.js\nimport { getB } from './b.js';\nexport const a = 'a';\nexport function getA() {\n  return a;\n}\nconsole.log('a:', getB());  // 函数调用时已初始化\n\n// 3. 使用动态import\n// a.js\nexport const a = 'a';\n\nexport async function useB() {\n  const { b } = await import('./b.js');\n  return b;\n}\n\n// CommonJS vs ES Modules\n// CommonJS: 返回部分导出\n// ES Modules: 返回undefined（还未执行）"
      },
      "source": "循环依赖"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["浏览器使用"],
      "question": "在浏览器中使用ES Modules？",
      "options": [
        "使用type=\"module\"",
        "自动启用严格模式",
        "支持defer",
        "可以直接运行",
        "需要HTTP(S)协议",
        "IE11支持"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "浏览器中的ES Modules",
        "code": "// 浏览器使用ES Modules\n\n// 1. 使用type=\"module\"\n<script type=\"module\">\n  import { add } from './math.js';\n  console.log(add(1, 2));\n</script>\n\n// 2. 外部模块\n<script type=\"module\" src=\"./main.js\"></script>\n\n// 3. 特性\n// - 自动defer（延迟执行）\n// - 自动严格模式\n// - 模块作用域\n// - 可以使用import/export\n\n// 4. 导入路径要求\n// ✅ 相对路径\nimport { x } from './module.js';\nimport { y } from '../utils.js';\n\n// ✅ 绝对路径\nimport { z } from 'https://cdn.com/lib.js';\n\n// ✅ 相对URL\nimport { a } from '/js/module.js';\n\n// ❌ 裸导入（需要import maps）\nimport { b } from 'lodash';  // 不支持\n\n// 5. Import Maps（解决裸导入）\n<script type=\"importmap\">\n{\n  \"imports\": {\n    \"lodash\": \"https://cdn.com/lodash/4.17.21/lodash.js\",\n    \"vue\": \"/node_modules/vue/dist/vue.esm.js\"\n  }\n}\n</script>\n\n<script type=\"module\">\n  import _ from 'lodash';  // ✅ 现在可以用\n  import Vue from 'vue';\n</script>\n\n// 6. 动态导入\n<button id=\"btn\">加载</button>\n<script type=\"module\">\n  btn.onclick = async () => {\n    const { showModal } = await import('./modal.js');\n    showModal();\n  };\n</script>\n\n// 7. CORS限制\n// 需要HTTP(S)协议，不能file://\n// 跨域需要CORS头\n\n// 8. 兼容性检测\n<script type=\"module\">\n  // 支持ES Modules的浏览器\n  console.log('Modern browser');\n</script>\n<script nomodule>\n  // 不支持ES Modules的浏览器（IE11）\n  console.log('Legacy browser');\n</script>"
      },
      "source": "浏览器使用"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Tree Shaking"],
      "question": "ES Modules支持Tree Shaking优化",
      "correctAnswer": "A",
      "explanation": {
        "title": "Tree Shaking",
        "code": "// ES Modules支持Tree Shaking\n// 移除未使用的代码\n\n// utils.js\nexport function used() {\n  console.log('used');\n}\n\nexport function unused() {\n  console.log('unused');\n}\n\nexport function alsoUnused() {\n  console.log('also unused');\n}\n\n// main.js\nimport { used } from './utils.js';\n\nused();\n\n// 打包后（Webpack/Rollup）\n// 只包含used函数\n// unused和alsoUnused被移除\n\n// 为什么ES Modules可以Tree Shaking？\n// 1. 静态结构（编译时确定）\n// 2. 只能在顶层import/export\n// 3. 导入导出是常量\n\n// vs CommonJS（难以Tree Shaking）\n// utils.js\nmodule.exports = {\n  used() {},\n  unused() {}\n};\n\n// main.js\nconst { used } = require('./utils');\n// 运行时才知道导入什么，难以静态分析\n\n// Tree Shaking条件：\n// 1. 使用ES Modules\n// 2. 使用支持的打包工具\n// 3. 生产模式\n// 4. 没有副作用\n\n// 标记副作用\n// package.json\n{\n  \"sideEffects\": false  // 所有文件无副作用\n}\n\n// 或指定有副作用的文件\n{\n  \"sideEffects\": [\n    \"*.css\",\n    \"./src/polyfills.js\"\n  ]\n}"
      },
      "source": "Tree Shaking"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["动态导入"],
      "question": "动态导入模块，空白处填什么？",
      "code": "button.onclick = async () => {\n  const module = ______ import('./modal.js');\n  module.showModal();\n};",
      "options": [
        "await",
        "require",
        "load",
        "fetch"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "动态import()",
        "code": "// 动态import()（ES2020）\n\n// 基本用法\nconst module = await import('./module.js');\nmodule.default();  // 默认导出\nmodule.namedExport();  // 命名导出\n\n// Promise形式\nimport('./module.js')\n  .then(module => {\n    module.default();\n  })\n  .catch(err => {\n    console.error('加载失败');\n  });\n\n// 应用场景：\n\n// 1. 按需加载\nbutton.onclick = async () => {\n  const { showModal } = await import('./modal.js');\n  showModal();\n};\n\n// 2. 条件加载\nif (isAdmin) {\n  const admin = await import('./admin.js');\n  admin.init();\n}\n\n// 3. 动态路径\nconst language = 'zh';\nconst messages = await import(`./i18n/${language}.js`);\n\n// 4. 并行加载\nconst [module1, module2] = await Promise.all([\n  import('./module1.js'),\n  import('./module2.js')\n]);\n\n// 5. 路由懒加载（Vue/React）\nconst routes = [\n  {\n    path: '/home',\n    component: () => import('./Home.vue')\n  },\n  {\n    path: '/about',\n    component: () => import('./About.vue')\n  }\n];\n\n// 6. 特性检测\nif ('IntersectionObserver' in window) {\n  // 浏览器支持\n} else {\n  // 加载polyfill\n  await import('./intersection-observer-polyfill.js');\n}\n\n// 7. Webpack魔法注释\nimport(\n  /* webpackChunkName: \"modal\" */\n  /* webpackPrefetch: true */\n  './modal.js'\n);\n\n// 8. 错误处理\ntry {\n  const module = await import('./module.js');\n} catch (err) {\n  console.error('导入失败:', err);\n  // 加载fallback\n  const fallback = await import('./fallback.js');\n}"
      },
      "source": "动态导入"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "ES Modules最佳实践？",
      "options": [
        "优先使用命名导出",
        "避免循环依赖",
        "使用绝对导入路径",
        "所有导出都用default",
        "利用Tree Shaking",
        "动态导入减少初始加载"
      ],
      "correctAnswer": ["A", "B", "E", "F"],
      "explanation": {
        "title": "ES Modules最佳实践",
        "code": "// 1. 优先命名导出\n// ✅ 命名导出（可Tree Shaking）\nexport { add, subtract, multiply };\n\n// ❌ 默认导出对象（难以Tree Shake）\nexport default { add, subtract, multiply };\n\n// 2. 避免循环依赖\n// ✅ 提取共享代码\n// a.js → shared.js ← b.js\n\n// ❌ 循环依赖\n// a.js ⇄ b.js\n\n// 3. 使用相对路径\n// ✅\nimport { x } from './utils.js';\nimport { y } from '../helpers.js';\n\n// 4. 统一导出\n// utils/index.js\nexport { trim } from './string.js';\nexport { random } from './number.js';\n\n// 使用\nimport { trim, random } from './utils';\n\n// 5. 动态导入优化\n// ✅ 代码分割\nconst HeavyComponent = lazy(() => \n  import('./HeavyComponent')\n);\n\n// 6. 类型导入（TypeScript）\nimport type { User } from './types';\nimport { fetchUser } from './api';\n\n// 7. 副作用导入\nimport './polyfills.js';  // 只执行，不导入\n\n// 8. 避免导入整个库\n// ❌\nimport _ from 'lodash';\n\n// ✅\nimport { debounce } from 'lodash-es';\n\n// 9. 使用import.meta\nconst imageUrl = new URL('./image.png', import.meta.url);\n\n// 10. 文件扩展名\n// Node.js要求.js扩展名\nimport { x } from './module.js';  // ✅\nimport { y } from './module';     // ❌ Node.js不支持"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "CommonJS模块",
      "url": "24-01-commonjs.html"
    },
    "next": {
      "title": "模块化对比",
      "url": "24-03-module-comparison.html"
    }
  }
};
