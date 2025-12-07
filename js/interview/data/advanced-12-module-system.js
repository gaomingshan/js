/**
 * JavaScript 模块系统
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced12ModuleSystem = {
  "config": {
    "title": "JavaScript 模块系统",
    "icon": "📦",
    "description": "掌握ES6 Module、CommonJS、AMD等模块系统的原理与使用",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    // ========== 1. 单选题：ES6 Module特点 ==========
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["ES6 Module"],
      "question": "ES6 Module的import语句在什么时候执行？",
      "options": [
        "编译时（静态加载）",
        "运行时（动态加载）",
        "取决于import的位置",
        "浏览器决定"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES6 Module静态特性：",
        "sections": [
          {
            "title": "编译时加载",
            "content": "ES6 Module在编译时就确定模块依赖关系，无法在运行时动态改变",
            "code": "// ✅ 静态import（顶层）\nimport { foo } from './module.js';\nimport * as utils from './utils.js';\nimport defaultExport from './default.js';\n\n// ❌ 不能在条件语句中\nif (condition) {\n  import { foo } from './module.js'; // 语法错误\n}\n\n// ❌ 不能在函数中\nfunction loadModule() {\n  import { foo } from './module.js'; // 语法错误\n}"
          },
          {
            "title": "动态import()",
            "content": "如需运行时加载，使用import()函数",
            "code": "// ✅ 动态加载\nif (condition) {\n  import('./module.js').then(module => {\n    module.foo();\n  });\n}\n\n// ✅ async/await\nasync function loadModule() {\n  const module = await import('./module.js');\n  module.foo();\n}\n\n// ✅ 条件加载\nconst modulePath = isDev ? './dev.js' : './prod.js';\nconst module = await import(modulePath);"
          },
          {
            "title": "静态加载的优势",
            "points": [
              "编译时优化（Tree Shaking）",
              "静态分析依赖关系",
              "循环依赖检测",
              "类型检查（TypeScript）",
              "更好的性能"
            ]
          }
        ]
      },
      "source": "ES6 Module"
    },

    // ========== 2. 多选题：模块导出方式 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["导出方式"],
      "question": "以下哪些是ES6 Module的合法导出方式？",
      "options": [
        "export const foo = 'bar';",
        "export default function() { }",
        "export { foo, bar };",
        "module.exports = { }",
        "export { foo as default };",
        "exports.foo = 'bar';"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "ES6 Module导出方式：",
        "sections": [
          {
            "title": "1. 命名导出（Named Export）",
            "code": "// 方式1：声明时导出\nexport const foo = 'bar';\nexport function test() { }\nexport class MyClass { }\n\n// 方式2：统一导出\nconst foo = 'bar';\nfunction test() { }\nclass MyClass { }\nexport { foo, test, MyClass };\n\n// 方式3：重命名导出\nexport { foo as myFoo, test as myTest };"
          },
          {
            "title": "2. 默认导出（Default Export）",
            "code": "// 方式1：直接默认导出\nexport default function() { }\nexport default class { }\nexport default 'some value';\n\n// 方式2：先声明后导出\nfunction myFunction() { }\nexport default myFunction;\n\n// 方式3：通过重命名导出\nconst foo = 'bar';\nexport { foo as default };"
          },
          {
            "title": "3. 混合导出",
            "code": "// 同时有默认导出和命名导出\nexport default function main() { }\nexport const helper = () => { };\nexport const config = { };\n\n// 导入\nimport main, { helper, config } from './module.js';"
          },
          {
            "title": "4. 重新导出",
            "code": "// 转发其他模块的导出\nexport { foo, bar } from './other.js';\nexport * from './other.js';\nexport { default } from './other.js';\nexport { foo as myFoo } from './other.js';"
          },
          {
            "title": "❌ CommonJS语法（非ES6 Module）",
            "code": "// ❌ 这些是CommonJS，不是ES6 Module\nmodule.exports = { };\nexports.foo = 'bar';\nmodule.exports.foo = 'bar';"
          }
        ]
      },
      "source": "导出方式"
    },

    // ========== 3. 代码输出题：import提升 ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["import提升"],
      "question": "以下代码的输出是什么？",
      "code": "// main.js\nconsole.log('1');\nimport { foo } from './module.js';\nconsole.log('2');\nconsole.log(foo);\n\n// module.js\nexport const foo = 'bar';\nconsole.log('module loaded');",
      "options": [
        "module loaded, 1, 2, bar",
        "1, 2, module loaded, bar",
        "1, module loaded, 2, bar",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "import语句提升：",
        "sections": [
          {
            "title": "import会提升到模块顶部",
            "content": "无论import写在哪里，都会在模块代码执行前先执行",
            "code": "// 实际执行顺序\n// 1. 先执行所有import，加载模块\n//    → module.js加载，输出'module loaded'\n// 2. 然后执行模块代码\nconsole.log('1');        // 输出: 1\n// import已经执行过了\nconsole.log('2');        // 输出: 2\nconsole.log(foo);        // 输出: bar"
          },
          {
            "title": "模块加载顺序",
            "code": "// main.js\nconsole.log('main start');\nimport './a.js';\nimport './b.js';\nconsole.log('main end');\n\n// a.js\nconsole.log('a');\n\n// b.js\nconsole.log('b');\n\n// 输出顺序：\n// a\n// b\n// main start\n// main end"
          },
          {
            "title": "与var提升的区别",
            "code": "// import提升：模块先加载\nimport { foo } from './module.js';\nconsole.log(foo); // ✅ 可以访问\n\n// var提升：只提升声明\nconsole.log(bar); // undefined\nvar bar = 'baz';\n\n// let/const不提升\nconsole.log(baz); // ReferenceError: TDZ\nconst baz = 'qux';"
          }
        ]
      },
      "source": "import提升"
    },

    // ========== 4. 判断题：模块单例 ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["模块特性"],
      "question": "ES6 Module会缓存模块，多次import同一个模块只会执行一次",
      "correctAnswer": "A",
      "explanation": {
        "title": "模块单例特性：",
        "sections": [
          {
            "title": "正确！模块是单例",
            "content": "模块代码只在第一次import时执行，之后import返回缓存的模块对象",
            "code": "// counter.js\nconsole.log('模块执行');\nlet count = 0;\nexport function increment() {\n  count++;\n}\nexport function getCount() {\n  return count;\n}\n\n// a.js\nimport { increment } from './counter.js';\n// 输出: 模块执行\nincrement();\n\n// b.js\nimport { getCount } from './counter.js';\n// 不会再次输出'模块执行'\nconsole.log(getCount()); // 1"
          },
          {
            "title": "模块共享状态",
            "code": "// store.js\nlet state = { count: 0 };\n\nexport function increment() {\n  state.count++;\n}\n\nexport function getState() {\n  return state;\n}\n\n// a.js\nimport { increment } from './store.js';\nincrement();\n\n// b.js\nimport { getState } from './store.js';\nconsole.log(getState().count); // 1（共享状态）"
          },
          {
            "title": "应用：实现单例模式",
            "code": "// singleton.js\nclass Singleton {\n  constructor() {\n    if (Singleton.instance) {\n      return Singleton.instance;\n    }\n    this.data = [];\n    Singleton.instance = this;\n  }\n}\n\n// 更简单的方式：利用模块缓存\nclass MyClass {\n  constructor() {\n    this.data = [];\n  }\n}\n\nconst instance = new MyClass();\nexport default instance; // 导出实例，保证单例"
          }
        ]
      },
      "source": "模块单例"
    },

    // ========== 5. 代码补全题：循环依赖 ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["循环依赖"],
      "question": "ES6 Module如何处理循环依赖？空白处填什么概念？",
      "code": "// a.js\nimport { b } from './b.js';\nexport const a = 'a';\nconsole.log(b);\n\n// b.js\nimport { a } from './a.js';\nexport const b = 'b';\nconsole.log(a);\n\n// ES6 Module使用______机制处理循环依赖",
      "options": [
        "动态绑定（live binding）",
        "值拷贝（value copy）",
        "延迟加载（lazy loading）",
        "深拷贝（deep copy）"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES6 Module循环依赖处理：",
        "sections": [
          {
            "title": "动态绑定（Live Binding）",
            "content": "ES6 Module的import是对原模块的引用，而不是值的拷贝，因此可以处理循环依赖",
            "code": "// a.js\nimport { b } from './b.js';\nexport let a = 'a-initial';\nconsole.log('a.js:', b); // 'b-initial'\n\nsetTimeout(() => {\n  a = 'a-updated';\n}, 100);\n\n// b.js\nimport { a } from './a.js';\nexport let b = 'b-initial';\nconsole.log('b.js:', a); // undefined（此时a还未初始化）\n\nsetTimeout(() => {\n  console.log('b.js later:', a); // 'a-updated'（动态绑定）\n  b = 'b-updated';\n}, 200);"
          },
          {
            "title": "CommonJS的值拷贝",
            "content": "CommonJS导出的是值的拷贝，无法动态更新",
            "code": "// CommonJS\n// a.js\nconst { b } = require('./b.js');\nlet a = 'a-initial';\nmodule.exports = { a };\n\nsetTimeout(() => {\n  a = 'a-updated';\n  module.exports.a = a; // 需要重新赋值\n}, 100);\n\n// b.js\nconst { a } = require('./a.js');\nconsole.log(a); // undefined或旧值"
          },
          {
            "title": "循环依赖最佳实践",
            "code": "// ❌ 避免循环依赖\n// a.js\nimport { b } from './b.js';\nexport const a = b + 1; // 依赖b\n\n// b.js\nimport { a } from './a.js';\nexport const b = a + 1; // 依赖a（循环）\n\n// ✅ 重构避免循环\n// shared.js\nexport const config = { };\n\n// a.js\nimport { config } from './shared.js';\nexport const a = config.value + 1;\n\n// b.js\nimport { config } from './shared.js';\nexport const b = config.value + 2;"
          },
          {
            "title": "解决循环依赖",
            "points": [
              "提取共享代码到第三个模块",
              "使用动态import()延迟加载",
              "重新设计模块结构",
              "使用依赖注入"
            ],
            "code": "// 使用动态import\n// a.js\nexport async function useB() {\n  const { b } = await import('./b.js');\n  return b();\n}\n\n// b.js\nexport async function useA() {\n  const { a } = await import('./a.js');\n  return a();\n}"
          }
        ]
      },
      "source": "循环依赖"
    },

    // ========== 6. 多选题：CommonJS vs ES6 Module ==========
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["模块对比"],
      "question": "以下哪些是CommonJS和ES6 Module的区别？",
      "options": [
        "CommonJS是值拷贝，ES6 Module是引用",
        "CommonJS运行时加载，ES6 Module编译时加载",
        "CommonJS是同步加载，ES6 Module是异步加载",
        "CommonJS可以动态require，ES6 Module的import必须在顶层",
        "CommonJS用于Node.js，ES6 Module用于浏览器",
        "CommonJS导出的是对象，ES6 Module可以导出任意值"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "CommonJS vs ES6 Module对比：",
        "sections": [
          {
            "title": "1. 加载方式",
            "code": "// CommonJS：运行时加载（整个对象）\nconst module = require('./module'); // 加载整个对象\nconst { foo } = require('./module'); // 解构赋值\n\n// ES6 Module：编译时加载（静态分析）\nimport { foo } from './module'; // 只加载foo（Tree Shaking）"
          },
          {
            "title": "2. 值拷贝 vs 引用",
            "code": "// CommonJS：值拷贝\n// counter.js\nlet count = 0;\nmodule.exports = {\n  count,\n  increment: () => count++\n};\n\n// main.js\nconst counter = require('./counter');\nconsole.log(counter.count); // 0\ncounter.increment();\nconsole.log(counter.count); // 0（没有更新）\n\n// ES6 Module：动态绑定\n// counter.js\nexport let count = 0;\nexport function increment() {\n  count++;\n}\n\n// main.js\nimport { count, increment } from './counter.js';\nconsole.log(count); // 0\nincrement();\nconsole.log(count); // 1（动态更新）"
          },
          {
            "title": "3. 同步 vs 异步",
            "code": "// CommonJS：同步加载（阻塞）\nconst fs = require('fs'); // 同步读取模块\nconst data = fs.readFileSync('./file.txt'); // 阻塞\n\n// ES6 Module：异步加载（在浏览器中）\nimport { foo } from './module.js'; // 异步获取\n// 但在Node.js中仍是同步的"
          },
          {
            "title": "4. 动态 vs 静态",
            "code": "// CommonJS：动态加载\nconst moduleName = condition ? './a' : './b';\nconst module = require(moduleName); // ✅ 可以\n\nif (condition) {\n  const module = require('./module'); // ✅ 可以\n}\n\n// ES6 Module：静态导入\nconst moduleName = condition ? './a' : './b';\nimport module from moduleName; // ❌ 语法错误\n\nif (condition) {\n  import module from './module'; // ❌ 语法错误\n}\n\n// 使用动态import()\nconst module = await import(moduleName); // ✅ 可以"
          },
          {
            "title": "5. this指向",
            "code": "// CommonJS：this指向module.exports\nconsole.log(this === module.exports); // true\n\n// ES6 Module：this为undefined\nconsole.log(this); // undefined（严格模式）"
          },
          {
            "title": "互操作性",
            "code": "// Node.js中使用ES6 Module\n// package.json\n{\n  \"type\": \"module\" // 启用ES6 Module\n}\n\n// 或使用.mjs扩展名\n// module.mjs\n\n// 在ES6 Module中导入CommonJS\nimport pkg from './commonjs-module.js';\nconst { foo } = pkg;\n\n// 在CommonJS中导入ES6 Module（Node.js 14+）\n(async () => {\n  const module = await import('./es6-module.mjs');\n  console.log(module.foo);\n})();"
          }
        ]
      },
      "source": "模块对比"
    },

    // ========== 7. 代码输出题：默认导出陷阱 ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["默认导出"],
      "question": "以下代码的输出是什么？",
      "code": "// module.js\nexport default function foo() {\n  return 'foo';\n}\n\nexport function bar() {\n  return 'bar';\n}\n\n// main.js\nimport foo, bar from './module.js';\nconsole.log(typeof foo);\nconsole.log(typeof bar);",
      "options": [
        "语法错误",
        "function, function",
        "function, undefined",
        "object, object"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "默认导出与命名导出混合：",
        "sections": [
          {
            "title": "正确的导入语法",
            "code": "// module.js\nexport default function foo() {\n  return 'foo';\n}\n\nexport function bar() {\n  return 'bar';\n}\n\n// ❌ 错误：缺少花括号\nimport foo, bar from './module.js';\n\n// ✅ 正确：命名导出需要花括号\nimport foo, { bar } from './module.js';\nconsole.log(foo()); // 'foo'\nconsole.log(bar()); // 'bar'"
          },
          {
            "title": "导入语法总结",
            "code": "// 1. 默认导出\nimport defaultExport from './module.js';\n\n// 2. 命名导出\nimport { namedExport } from './module.js';\n\n// 3. 混合导入\nimport defaultExport, { named1, named2 } from './module.js';\n\n// 4. 重命名\nimport { foo as myFoo } from './module.js';\n\n// 5. 导入所有\nimport * as module from './module.js';\n// module.default 是默认导出\n// module.foo 是命名导出\n\n// 6. 仅执行模块（副作用）\nimport './module.js';"
          },
          {
            "title": "常见错误",
            "code": "// ❌ 默认导出不能用花括号\nimport { default } from './module.js'; // 错误\n\n// ✅ 正确\nimport defaultExport from './module.js';\n// 或\nimport { default as defaultExport } from './module.js';\n\n// ❌ 命名导出必须用花括号\nimport namedExport from './module.js'; // 错误\n\n// ✅ 正确\nimport { namedExport } from './module.js';"
          }
        ]
      },
      "source": "导入语法"
    },

    // ========== 8. 判断题：Tree Shaking ==========
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["Tree Shaking"],
      "question": "Tree Shaking只对ES6 Module有效，对CommonJS无效",
      "correctAnswer": "A",
      "explanation": {
        "title": "Tree Shaking原理：",
        "sections": [
          {
            "title": "正确！",
            "content": "Tree Shaking依赖ES6 Module的静态结构，在编译时就能确定哪些代码未被使用",
            "code": "// utils.js（ES6 Module）\nexport function foo() { } // 使用\nexport function bar() { } // 未使用\nexport function baz() { } // 未使用\n\n// main.js\nimport { foo } from './utils.js';\nfoo();\n\n// 打包后bar和baz会被移除（Tree Shaking）"
          },
          {
            "title": "为什么CommonJS不支持",
            "content": "CommonJS是运行时加载，无法在编译时确定使用了哪些导出",
            "code": "// CommonJS\nconst utils = require('./utils');\n\n// 运行时才知道使用哪个\nconst methodName = Math.random() > 0.5 ? 'foo' : 'bar';\nutils[methodName]();\n\n// 打包工具无法确定bar是否会被使用\n// 必须保留所有导出"
          },
          {
            "title": "Tree Shaking条件",
            "points": [
              "使用ES6 Module语法",
              "使用支持Tree Shaking的打包工具（Webpack、Rollup）",
              "production模式",
              "避免副作用代码"
            ],
            "code": "// package.json\n{\n  \"sideEffects\": false // 告诉打包工具没有副作用\n}\n\n// 或指定有副作用的文件\n{\n  \"sideEffects\": [\n    \"*.css\",\n    \"*.scss\",\n    \"src/polyfills.js\"\n  ]\n}"
          },
          {
            "title": "副作用影响Tree Shaking",
            "code": "// ❌ 有副作用，无法Tree Shake\n// utils.js\nconsole.log('副作用代码'); // 全局副作用\n\nexport function foo() { }\nexport function bar() { }\n\n// ✅ 纯函数，可以Tree Shake\nexport function foo() {\n  return 'foo';\n}\n\nexport function bar() {\n  return 'bar';\n}"
          }
        ]
      },
      "source": "Tree Shaking"
    },

    // ========== 9. 代码补全题：实现简单的模块加载器 ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["模块加载器"],
      "question": "实现一个简单的模块加载器，空白处填什么？",
      "code": "const moduleCache = {};\n\nfunction require(modulePath) {\n  if (moduleCache[modulePath]) {\n    return moduleCache[modulePath].exports;\n  }\n  \n  const module = {\n    exports: {}\n  };\n  \n  moduleCache[modulePath] = module;\n  \n  ______;\n  \n  return module.exports;\n}",
      "options": [
        "moduleFunction(module, module.exports, require)",
        "moduleFunction()",
        "return moduleFunction()",
        "moduleFunction.call(module)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "模块加载器实现：",
        "sections": [
          {
            "title": "完整实现",
            "code": "// 简化版模块加载器\nconst moduleCache = {};\n\nfunction require(modulePath) {\n  // 1. 检查缓存\n  if (moduleCache[modulePath]) {\n    return moduleCache[modulePath].exports;\n  }\n  \n  // 2. 创建模块对象\n  const module = {\n    exports: {},\n    loaded: false\n  };\n  \n  // 3. 缓存模块\n  moduleCache[modulePath] = module;\n  \n  // 4. 加载模块（模拟）\n  const moduleFunction = loadModuleFunction(modulePath);\n  \n  // 5. 执行模块函数\n  // 传入module, exports, require\n  moduleFunction(module, module.exports, require);\n  \n  // 6. 标记为已加载\n  module.loaded = true;\n  \n  // 7. 返回导出\n  return module.exports;\n}\n\n// 模拟加载模块代码\nfunction loadModuleFunction(path) {\n  // 实际会读取文件并包装成函数\n  // (function(module, exports, require) {\n  //   // 模块代码\n  // })\n  return moduleRegistry[path];\n}"
          },
          {
            "title": "Node.js模块包装",
            "content": "Node.js会将每个模块包装在一个函数中",
            "code": "// 你的模块代码\nconst fs = require('fs');\nmodule.exports = { foo: 'bar' };\n\n// Node.js实际执行的代码\n(function(exports, require, module, __filename, __dirname) {\n  const fs = require('fs');\n  module.exports = { foo: 'bar' };\n});"
          },
          {
            "title": "使用示例",
            "code": "// 注册模块\nconst moduleRegistry = {};\n\nmoduleRegistry['./math.js'] = function(module, exports, require) {\n  exports.add = (a, b) => a + b;\n  exports.multiply = (a, b) => a * b;\n};\n\nmoduleRegistry['./utils.js'] = function(module, exports, require) {\n  const math = require('./math.js');\n  \n  module.exports = {\n    calculate: (a, b) => {\n      return math.add(a, b) * 2;\n    }\n  };\n};\n\n// 使用\nconst utils = require('./utils.js');\nconsole.log(utils.calculate(1, 2)); // 6\n\n// 再次require返回缓存\nconst utils2 = require('./utils.js');\nconsole.log(utils === utils2); // true"
          }
        ]
      },
      "source": "模块加载器"
    },

    // ========== 10. 多选题：模块化最佳实践 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["最佳实践"],
      "question": "以下哪些是模块化开发的最佳实践？",
      "options": [
        "每个模块只做一件事（单一职责）",
        "避免循环依赖",
        "使用命名导出而不是默认导出",
        "在模块中使用全局变量",
        "模块应该是无副作用的",
        "将所有代码都放在一个大模块中"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "模块化最佳实践：",
        "sections": [
          {
            "title": "1. 单一职责原则",
            "code": "// ✅ 好的模块：单一职责\n// auth.js\nexport function login(username, password) { }\nexport function logout() { }\nexport function checkAuth() { }\n\n// ❌ 不好的模块：职责过多\n// utils.js\nexport function login() { }\nexport function fetchData() { }\nexport function formatDate() { }\nexport function validateEmail() { }"
          },
          {
            "title": "2. 避免循环依赖",
            "code": "// ❌ 循环依赖\n// a.js\nimport { b } from './b.js';\nexport const a = b + 1;\n\n// b.js\nimport { a } from './a.js';\nexport const b = a + 1;\n\n// ✅ 重构\n// shared.js\nexport const config = { value: 10 };\n\n// a.js\nimport { config } from './shared.js';\nexport const a = config.value + 1;\n\n// b.js\nimport { config } from './shared.js';\nexport const b = config.value + 2;"
          },
          {
            "title": "3. 命名导出 vs 默认导出",
            "code": "// ✅ 命名导出（推荐）\n// 优点：编辑器自动补全、重构方便、可Tree Shaking\nexport function foo() { }\nexport function bar() { }\n\nimport { foo, bar } from './module';\n\n// ⚠️ 默认导出\n// 缺点：重命名随意、IDE支持差\nexport default function() { }\n\nimport whatever from './module'; // 可以取任何名字"
          },
          {
            "title": "4. 避免副作用",
            "code": "// ❌ 有副作用\n// module.js\nconsole.log('模块加载'); // 全局副作用\nwindow.globalVar = 'value'; // 污染全局\n\n// ajax请求\nfetch('/api').then(data => { }); // 导入时就发请求\n\nexport function foo() { }\n\n// ✅ 无副作用\n// module.js\nexport function foo() {\n  console.log('调用时才执行'); // 函数内的副作用可接受\n}\n\nexport function fetchData() {\n  return fetch('/api'); // 返回Promise，由调用者控制\n}"
          },
          {
            "title": "5. 清晰的导出接口",
            "code": "// ✅ 明确的公共API\n// index.js\nexport { foo, bar } from './internal/module1.js';\nexport { baz } from './internal/module2.js';\n// internal目录下的其他导出不对外暴露\n\n// 使用\nimport { foo, bar, baz } from './package';"
          },
          {
            "title": "6. 合理的模块大小",
            "points": [
              "一个文件通常200-400行代码",
              "过大则拆分，过小则合并",
              "按功能而不是文件类型组织",
              "相关代码放在一起"
            ],
            "code": "// ✅ 按功能组织\n/src\n  /auth\n    index.js\n    login.js\n    logout.js\n  /user\n    index.js\n    profile.js\n    settings.js\n\n// ❌ 按类型组织\n/src\n  /components\n  /services\n  /utils\n  /models"
          }
        ]
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "浏览器API",
      "url": "../advanced/11-browser-apis.html"
    },
    "next": {
      "title": "包管理",
      "url": "12-package-management.html"
    }
  }
};
