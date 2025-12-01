window.quizData_Basics01Intro = {
  "config": {
    "title": "JavaScript 简介",
    "icon": "📝",
    "description": "了解JavaScript的起源、特性与应用",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["基础概念"],
      "question": "JavaScript是什么类型的语言？",
      "options": [
        "解释型、动态类型、弱类型的脚本语言",
        "编译型、静态类型语言",
        "强类型语言",
        "只能在浏览器中运行"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript语言特性：",
        "sections": [
          {
            "title": "解释型语言",
            "points": [
              "代码无需预编译，逐行执行",
              "由JavaScript引擎（如V8）解释执行",
              "现代引擎使用JIT编译优化"
            ]
          },
          {
            "title": "动态类型",
            "points": [
              "变量类型在运行时确定",
              "同一变量可以赋不同类型的值",
              "不需要显式声明变量类型"
            ]
          },
          {
            "title": "弱类型",
            "points": [
              "类型可以隐式转换",
              "如：'1' + 1 = '11'",
              "与强类型语言（如TypeScript）形成对比"
            ]
          }
        ]
      },
      "source": "JavaScript特性"
    },
    {
      "difficulty": "easy",
      "tags": ["ECMAScript"],
      "question": "ECMAScript与JavaScript是什么关系？",
      "options": [
        "ECMAScript是标准规范，JavaScript是其实现",
        "两者是完全相同的",
        "ECMAScript是JavaScript的升级版",
        "JavaScript包含ECMAScript"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ECMAScript标准：",
        "content": "1997年，ECMA国际制定了ECMAScript标准（ECMA-262）。JavaScript是ECMAScript标准的最著名实现，其他实现还包括JScript（微软）和ActionScript（Adobe）。",
        "sections": [
          {
            "title": "完整的JavaScript包含",
            "points": [
              "核心（ECMAScript）：语法、类型、语句、关键字等",
              "DOM（文档对象模型）：操作HTML文档的API",
              "BOM（浏览器对象模型）：与浏览器交互的API"
            ]
          }
        ]
      },
      "source": "ECMAScript标准"
    },
    {
      "difficulty": "medium",
      "tags": ["ES6特性"],
      "question": "ES6（ES2015）引入了哪些重要特性？",
      "options": [
        "let/const、箭头函数、Promise、class、模板字符串、解构赋值",
        "async/await、可选链",
        "BigInt、动态import",
        "装饰器、管道操作符"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES6核心特性：",
        "sections": [
          {
            "title": "变量声明",
            "code": "let x = 1;  // 块级作用域\nconst PI = 3.14;  // 常量"
          },
          {
            "title": "箭头函数",
            "code": "const add = (a, b) => a + b;\nconst arr = [1, 2, 3].map(x => x * 2);"
          },
          {
            "title": "Promise",
            "code": "fetch('/api/data')\n  .then(res => res.json())\n  .then(data => console.log(data));"
          },
          {
            "title": "类语法",
            "code": "class Person {\n  constructor(name) {\n    this.name = name;\n  }\n}"
          },
          {
            "title": "其他重要特性",
            "points": [
              "模板字符串：`Hello ${name}`",
              "解构赋值：const {x, y} = obj",
              "展开运算符：...arr",
              "模块化：import/export",
              "默认参数、剩余参数"
            ]
          }
        ]
      },
      "source": "ES6"
    },
    {
      "difficulty": "medium",
      "tags": ["运行环境"],
      "question": "JavaScript可以在哪些环境中运行？",
      "options": [
        "浏览器、Node.js、Deno、移动端、桌面应用等多种环境",
        "只能在浏览器中运行",
        "只能在服务器端运行",
        "只能在特定操作系统"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript运行环境：",
        "sections": [
          {
            "title": "浏览器环境",
            "points": [
              "Chrome（V8引擎）",
              "Firefox（SpiderMonkey）",
              "Safari（JavaScriptCore）",
              "可操作DOM和BOM"
            ]
          },
          {
            "title": "服务器端",
            "points": [
              "Node.js：基于V8引擎",
              "Deno：安全的运行时",
              "Bun：新一代运行时"
            ]
          },
          {
            "title": "其他环境",
            "points": [
              "移动端：React Native、Ionic",
              "桌面应用：Electron",
              "物联网：Johnny-Five",
              "游戏引擎：Cocos2d-x"
            ]
          }
        ]
      },
      "source": "运行环境"
    },
    {
      "difficulty": "medium",
      "tags": ["单线程"],
      "question": "JavaScript是单线程的，为什么还能处理异步操作？",
      "options": [
        "通过事件循环（Event Loop）和任务队列机制",
        "JavaScript实际上是多线程的",
        "浏览器会创建新线程",
        "不能处理异步操作"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript异步机制：",
        "sections": [
          {
            "title": "单线程特性",
            "points": [
              "JavaScript主线程是单线程的",
              "一次只能执行一个任务",
              "但可以通过异步机制实现并发"
            ]
          },
          {
            "title": "事件循环机制",
            "code": "console.log('1');\n\nsetTimeout(() => {\n  console.log('2');\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');\n});\n\nconsole.log('4');\n\n// 输出: 1 4 3 2\n// 同步代码 -> 微任务 -> 宏任务"
          },
          {
            "title": "关键组件",
            "points": [
              "调用栈（Call Stack）：执行同步代码",
              "任务队列（Task Queue）：存放异步任务",
              "微任务队列（Microtask Queue）：Promise等",
              "宏任务队列（Macrotask Queue）：setTimeout等"
            ]
          }
        ]
      },
      "source": "事件循环"
    },
    {
      "difficulty": "medium",
      "tags": ["严格模式"],
      "question": "严格模式（'use strict'）有什么作用？",
      "options": [
        "消除JavaScript语法的不合理之处，提高代码安全性和运行效率",
        "只是一个注释，没有实际作用",
        "使代码运行变慢",
        "只在旧浏览器中有效"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "严格模式的作用：",
        "sections": [
          {
            "title": "主要限制",
            "points": [
              "禁止使用未声明的变量",
              "禁止删除变量或函数",
              "禁止this指向全局对象",
              "禁止重复的参数名",
              "禁止八进制语法",
              "禁止with语句"
            ]
          },
          {
            "title": "使用方式",
            "code": "// 全局严格模式\n'use strict';\nvar x = 1;\n\n// 函数严格模式\nfunction foo() {\n  'use strict';\n  // 函数内严格\n}"
          },
          {
            "title": "示例",
            "code": "// 非严格模式\nfunction test() {\n  x = 1;  // 创建全局变量\n}\n\n// 严格模式\n'use strict';\nfunction test() {\n  x = 1;  // ReferenceError\n}"
          }
        ]
      },
      "source": "严格模式"
    },
    {
      "difficulty": "hard",
      "tags": ["JavaScript引擎"],
      "question": "现代JavaScript引擎（如V8）使用了哪些优化技术？",
      "options": [
        "JIT编译、内联缓存、隐藏类、垃圾回收优化",
        "只使用解释执行",
        "完全的AOT编译",
        "不进行任何优化"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "V8引擎优化技术：",
        "sections": [
          {
            "title": "1. JIT编译（Just-In-Time）",
            "points": [
              "解释器（Ignition）：快速生成字节码",
              "编译器（TurboFan）：优化热代码",
              "自适应优化：根据运行时信息优化"
            ]
          },
          {
            "title": "2. 内联缓存（Inline Caching）",
            "code": "function getX(obj) {\n  return obj.x;\n}\n\n// V8会缓存obj的结构\n// 后续访问相同结构的对象会更快"
          },
          {
            "title": "3. 隐藏类（Hidden Classes）",
            "code": "// 相同的属性添加顺序会共享隐藏类\nfunction Point(x, y) {\n  this.x = x;  // 隐藏类1\n  this.y = y;  // 隐藏类2\n}\n\n// 性能更好\nconst p1 = new Point(1, 2);\nconst p2 = new Point(3, 4);"
          },
          {
            "title": "4. 垃圾回收",
            "points": [
              "分代回收：新生代、老生代",
              "增量标记：避免长时间停顿",
              "并发标记：在后台线程执行"
            ]
          }
        ]
      },
      "source": "JavaScript引擎"
    },
    {
      "difficulty": "hard",
      "tags": ["模块化"],
      "question": "JavaScript有哪些模块化方案？它们的区别是什么？",
      "options": [
        "CommonJS（同步）、AMD（异步）、UMD（通用）、ES Module（官方标准）",
        "只有ES Module",
        "只有CommonJS",
        "没有模块化"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript模块化方案：",
        "sections": [
          {
            "title": "1. CommonJS（Node.js）",
            "code": "// 导出\nmodule.exports = { foo, bar };\n// 导入\nconst mod = require('./module');\n\n// 特点：同步加载，适合服务器端"
          },
          {
            "title": "2. AMD（Asynchronous Module Definition）",
            "code": "// RequireJS\ndefine(['dep1', 'dep2'], function(dep1, dep2) {\n  return { foo, bar };\n});\n\n// 特点：异步加载，适合浏览器"
          },
          {
            "title": "3. UMD（Universal Module Definition）",
            "content": "兼容CommonJS和AMD的通用模块定义，可以在多种环境中使用。"
          },
          {
            "title": "4. ES Module（官方标准）",
            "code": "// 导出\nexport const foo = 1;\nexport default bar;\n\n// 导入\nimport bar, { foo } from './module.js';\n\n// 特点：\n// - 编译时加载（静态分析）\n// - Tree Shaking支持\n// - 异步加载"
          },
          {
            "title": "主要区别",
            "points": [
              "加载时机：CommonJS运行时加载，ES Module编译时加载",
              "输出：CommonJS输出值的拷贝，ES Module输出值的引用",
              "this：CommonJS指向当前模块，ES Module指向undefined",
              "动态性：CommonJS可以动态导入，ES Module是静态的"
            ]
          }
        ]
      },
      "source": "模块化"
    },
    {
      "difficulty": "hard",
      "tags": ["性能优化"],
      "question": "编写高性能JavaScript代码有哪些最佳实践？",
      "options": [
        "避免全局查找、缓存DOM查询、使用事件委托、减少重绘重排、使用Web Workers",
        "尽可能使用全局变量",
        "频繁操作DOM",
        "不需要考虑性能"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript性能优化：",
        "sections": [
          {
            "title": "1. 作用域优化",
            "code": "// 不好\nfunction process() {\n  for (let i = 0; i < arr.length; i++) {\n    document.getElementById('container').innerHTML += arr[i];\n  }\n}\n\n// 好\nfunction process() {\n  const len = arr.length;\n  const container = document.getElementById('container');\n  let html = '';\n  for (let i = 0; i < len; i++) {\n    html += arr[i];\n  }\n  container.innerHTML = html;\n}"
          },
          {
            "title": "2. 事件委托",
            "code": "// 不好：为每个item添加事件\nitems.forEach(item => {\n  item.addEventListener('click', handler);\n});\n\n// 好：使用事件委托\ncontainer.addEventListener('click', (e) => {\n  if (e.target.matches('.item')) {\n    handler(e);\n  }\n});"
          },
          {
            "title": "3. 减少重绘重排",
            "code": "// 不好：每次修改都触发重排\nfor (let i = 0; i < 1000; i++) {\n  el.style.left = i + 'px';\n}\n\n// 好：批量修改或使用transform\nel.style.transform = `translateX(${i}px)`;"
          },
          {
            "title": "4. 使用Web Workers",
            "code": "// 主线程\nconst worker = new Worker('worker.js');\nworker.postMessage(largeData);\nworker.onmessage = (e) => {\n  console.log('Result:', e.data);\n};\n\n// 将耗时计算放到Worker中执行"
          },
          {
            "title": "其他优化",
            "points": [
              "防抖和节流",
              "使用requestAnimationFrame",
              "代码分割和懒加载",
              "使用虚拟列表",
              "避免内存泄漏"
            ]
          }
        ]
      },
      "source": "性能优化"
    },
    {
      "difficulty": "hard",
      "tags": ["TypeScript"],
      "question": "TypeScript相比JavaScript有什么优势？",
      "options": [
        "静态类型检查、更好的IDE支持、面向对象特性、编译时错误检测",
        "运行速度更快",
        "完全不同的语言",
        "只能在Node.js中使用"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "TypeScript的优势：",
        "sections": [
          {
            "title": "1. 静态类型系统",
            "code": "// TypeScript\nfunction add(a: number, b: number): number {\n  return a + b;\n}\n\nadd(1, '2');  // 编译错误\n\n// JavaScript\nfunction add(a, b) {\n  return a + b;\n}\n\nadd(1, '2');  // '12' 运行时才发现问题"
          },
          {
            "title": "2. 接口和类型别名",
            "code": "interface User {\n  id: number;\n  name: string;\n  email?: string;\n}\n\ntype ID = string | number;\n\nconst user: User = {\n  id: 1,\n  name: 'John'\n};"
          },
          {
            "title": "3. 高级类型",
            "code": "// 泛型\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// 联合类型\nlet value: string | number;\n\n// 交叉类型\ntype Combined = Type1 & Type2;"
          },
          {
            "title": "4. 更好的工具支持",
            "points": [
              "智能代码补全",
              "重构工具",
              "类型推导",
              "编译时错误检查",
              "更好的文档"
            ]
          },
          {
            "title": "5. 渐进式采用",
            "content": "TypeScript是JavaScript的超集，可以逐步将现有项目迁移到TypeScript，.js文件也可以在TS项目中使用。"
          }
        ]
      },
      "source": "TypeScript"
    }
  ],
  "navigation": {
    "prev": null,
    "next": {
      "title": "变量",
      "url": "01-variables.html"
    }
  }
};
