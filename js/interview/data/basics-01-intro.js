window.quizData_Basics01Intro = {
  "config": {
    "title": "JavaScript 简介",
    "icon": "📝",
    "description": "了解JavaScript的起源、特性与应用",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    // 第1题：简单 - 单选题
    {
      "difficulty": "easy",
      "tags": ["基础概念"],
      "question": "JavaScript是什么类型的语言？",
      "options": [
        "解释型、动态类型、弱类型的脚本语言",
        "编译型、静态类型、强类型语言",
        "解释型、静态类型、强类型语言",
        "编译型、动态类型、弱类型语言"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript语言特性",
        "sections": [
          {
            "title": "解释型语言",
            "points": [
              "代码无需预编译，由JavaScript引擎逐行执行",
              "现代引擎使用JIT（Just-In-Time）编译优化性能"
            ]
          },
          {
            "title": "动态类型",
            "code": "let x = 42;        // number\nx = 'hello';    // string，同一变量可以是不同类型\nx = true;       // boolean"
          },
          {
            "title": "弱类型",
            "code": "'5' + 3  // '53' - 字符串拼接\n'5' - 3  // 2 - 算术运算，自动转换类型"
          }
        ]
      },
      "source": "JavaScript特性"
    },

    // 第2题：简单 - 判断题
    {
      "difficulty": "easy",
      "type": "true-false",
      "tags": ["ECMAScript"],
      "question": "ECMAScript和JavaScript是完全相同的东西。",
      "correctAnswer": false,
      "explanation": {
        "title": "ECMAScript与JavaScript的关系",
        "content": "这个说法是错误的。ECMAScript是标准规范，JavaScript是其最著名的实现。",
        "sections": [
          {
            "title": "完整的JavaScript包含",
            "points": [
              "核心（ECMAScript）：语法、类型、语句、关键字等",
              "DOM（文档对象模型）：操作HTML文档的API",
              "BOM（浏览器对象模型）：与浏览器交互的API"
            ]
          },
          {
            "title": "其他ECMAScript实现",
            "points": [
              "JScript（微软，已废弃）",
              "ActionScript（Adobe，用于Flash）"
            ]
          }
        ]
      },
      "source": "ECMAScript标准"
    },

    // 第3题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["ES6特性"],
      "question": "以下哪些是ES6（ES2015）引入的新特性？",
      "options": [
        "let和const关键字",
        "箭头函数",
        "Promise",
        "async/await"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "ES6核心特性（2015年发布）",
        "sections": [
          {
            "title": "ES6引入的特性（选项A、B、C）",
            "points": [
              "let/const：块级作用域变量声明",
              "箭头函数：更简洁的函数语法",
              "Promise：异步编程解决方案",
              "class：类语法糖",
              "模板字符串、解构赋值、展开运算符等"
            ]
          },
          {
            "title": "async/await（选项D - 错误）",
            "content": "async/await是ES2017（ES8）引入的特性，不是ES6的一部分。"
          },
          {
            "title": "代码示例",
            "code": "// ES6特性组合使用\nconst add = (a, b) => a + b;\n\nconst getData = () => {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve([1, 2, 3]), 1000);\n  });\n};\n\ngetData().then(data => console.log(data));"
          }
        ]
      },
      "source": "ES6"
    },

    // 第4题：中等 - 代码输出题
    {
      "difficulty": "medium",
      "type": "code-output",
      "tags": ["事件循环", "异步编程"],
      "question": "以下代码的输出顺序是什么？",
      "code": "console.log('1');\n\nsetTimeout(() => {\n  console.log('2');\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');\n});\n\nconsole.log('4');",
      "options": [
        "1, 4, 3, 2",
        "1, 2, 3, 4",
        "1, 3, 4, 2",
        "1, 4, 2, 3"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript事件循环机制",
        "sections": [
          {
            "title": "执行顺序分析",
            "points": [
              "① 同步代码先执行：输出 '1'",
              "② setTimeout加入宏任务队列",
              "③ Promise.then加入微任务队列",
              "④ 继续同步代码：输出 '4'",
              "⑤ 执行微任务队列：输出 '3'",
              "⑥ 执行宏任务队列：输出 '2'"
            ]
          },
          {
            "title": "事件循环原则",
            "points": [
              "同步代码最先执行",
              "微任务（Microtask）在本轮事件循环结束前执行",
              "宏任务（Macrotask）在下一轮事件循环执行",
              "微任务包括：Promise.then、MutationObserver",
              "宏任务包括：setTimeout、setInterval、I/O"
            ]
          }
        ]
      },
      "source": "事件循环"
    },

    // 第5题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["运行环境"],
      "question": "JavaScript可以在哪些环境中运行？",
      "options": [
        "浏览器（如Chrome、Firefox、Safari）",
        "Node.js服务器端",
        "移动端（React Native、Ionic等）",
        "桌面应用（Electron等）"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "JavaScript的广泛应用",
        "content": "所有选项都正确！JavaScript已经成为全栈开发语言。",
        "sections": [
          {
            "title": "浏览器环境",
            "points": [
              "Chrome（V8引擎）",
              "Firefox（SpiderMonkey）",
              "Safari（JavaScriptCore）",
              "提供DOM和BOM API"
            ]
          },
          {
            "title": "服务器端",
            "points": [
              "Node.js：基于V8引擎，高性能异步I/O",
              "Deno：安全的TypeScript运行时",
              "Bun：新一代极速运行时"
            ]
          },
          {
            "title": "跨平台应用",
            "points": [
              "移动端：React Native、Ionic、NativeScript",
              "桌面应用：Electron（VS Code就是用它开发的）",
              "物联网：Johnny-Five",
              "游戏开发：Cocos2d-x、Phaser"
            ]
          }
        ]
      },
      "source": "运行环境"
    },

    // 第6题：中等 - 代码补全题
    {
      "difficulty": "medium",
      "type": "code-completion",
      "tags": ["严格模式"],
      "question": "如何在JavaScript文件或函数中启用严格模式？请补全代码。",
      "code": "// 全局严格模式\n______;\n\nfunction test() {\n  // 函数严格模式\n  ______;\n  x = 1;  // 在严格模式下会报错\n}",
      "options": [
        "'use strict'",
        "\"use strict\"",
        "use strict",
        "strict mode"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "严格模式的使用",
        "sections": [
          {
            "title": "启用方式",
            "code": "// 全局严格模式（影响整个脚本）\n'use strict';\nvar x = 1;\n\n// 函数严格模式（只影响函数内部）\nfunction foo() {\n  'use strict';\n  // 函数内代码严格\n}"
          },
          {
            "title": "严格模式的主要限制",
            "points": [
              "禁止使用未声明的变量",
              "禁止删除变量、函数或函数参数",
              "禁止函数参数重名",
              "禁止八进制语法（如 var x = 010）",
              "this在普通函数中指向undefined而非window",
              "禁止with语句"
            ]
          },
          {
            "title": "实际效果",
            "code": "// 非严格模式\nfunction test() {\n  x = 1;  // 创建全局变量（不推荐）\n}\n\n// 严格模式\n'use strict';\nfunction test() {\n  x = 1;  // ReferenceError: x is not defined\n}"
          }
        ]
      },
      "source": "严格模式"
    },

    // 第7题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["变量提升", "作用域"],
      "question": "以下代码的输出结果是什么？",
      "code": "var a = 1;\n\nfunction foo() {\n  console.log(a);\n  var a = 2;\n  console.log(a);\n}\n\nfoo();\nconsole.log(a);",
      "options": [
        "undefined, 2, 1",
        "1, 2, 1",
        "undefined, 2, 2",
        "1, 2, 2"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "变量提升（Hoisting）机制",
        "sections": [
          {
            "title": "代码等效于",
            "code": "var a = 1;\n\nfunction foo() {\n  var a;  // 变量声明被提升\n  console.log(a);  // undefined\n  a = 2;  // 赋值留在原处\n  console.log(a);  // 2\n}\n\nfoo();\nconsole.log(a);  // 1（全局变量a）"
          },
          {
            "title": "关键点",
            "points": [
              "var声明的变量会被提升到函数作用域顶部",
              "提升的只是声明，不是赋值",
              "函数内部的var a创建了局部变量，遮蔽了全局变量",
              "第一个console.log(a)访问的是局部变量（此时未赋值）",
              "最后的console.log(a)访问的是全局变量"
            ]
          },
          {
            "title": "避免提升陷阱",
            "code": "// 推荐使用let/const，没有提升\nconst a = 1;\n\nfunction foo() {\n  // console.log(a);  // ReferenceError（暂时性死区）\n  const a = 2;\n  console.log(a);  // 2\n}"
          }
        ]
      },
      "source": "变量提升"
    },

    // 第8题：困难 - 多选题
    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["JavaScript引擎", "性能优化"],
      "question": "现代JavaScript引擎（如V8）使用了哪些优化技术？",
      "options": [
        "JIT（Just-In-Time）编译",
        "内联缓存（Inline Caching）",
        "隐藏类（Hidden Classes）",
        "垃圾回收优化（GC Optimization）"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "V8引擎的优化技术",
        "content": "所有选项都正确！V8使用多种技术来提升性能。",
        "sections": [
          {
            "title": "1. JIT编译",
            "points": [
              "解释器（Ignition）：快速生成字节码",
              "编译器（TurboFan）：优化热代码（频繁执行的代码）",
              "自适应优化：根据运行时信息动态优化"
            ]
          },
          {
            "title": "2. 内联缓存",
            "code": "function getX(obj) {\n  return obj.x;\n}\n\n// V8会缓存obj的结构（形状）\n// 后续访问相同结构的对象会直接使用缓存，非常快"
          },
          {
            "title": "3. 隐藏类",
            "code": "// 推荐：相同的属性添加顺序\nfunction Point(x, y) {\n  this.x = x;  // 隐藏类C0\n  this.y = y;  // 隐藏类C1\n}\n\n// 不推荐：不同的属性添加顺序\nconst p1 = {};\np1.x = 1; p1.y = 2;  // 隐藏类不同\nconst p2 = {};\np2.y = 2; p2.x = 1;  // 隐藏类不同，无法共享优化"
          },
          {
            "title": "4. 垃圾回收优化",
            "points": [
              "分代回收：新生代（年轻对象）、老生代（长期对象）",
              "增量标记：分步执行，减少停顿时间",
              "并发标记：在后台线程执行标记",
              "Scavenge算法：快速清理新生代",
              "Mark-Sweep & Mark-Compact：清理老生代"
            ]
          }
        ]
      },
      "source": "V8引擎"
    },

    // 第9题：困难 - 代码补全题
    {
      "difficulty": "hard",
      "type": "code-completion",
      "tags": ["模块化", "ES Module"],
      "question": "如何使用ES Module导出和导入模块？请补全代码。",
      "code": "// math.js - 导出模块\n______ const PI = 3.14;\n\nexport function add(a, b) {\n  return a + b;\n}\n\n______ function multiply(a, b) {\n  return a * b;\n}\n\n// main.js - 导入模块\n______ multiply, { PI, add } from './math.js';\n\nconsole.log(PI);  // 3.14\nconsole.log(add(1, 2));  // 3\nconsole.log(multiply(2, 3));  // 6",
      "options": [
        "export / export default / import",
        "module.exports / require / import",
        "export default / export / require",
        "exports / default / import from"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES Module导入导出",
        "sections": [
          {
            "title": "命名导出（Named Export）",
            "code": "// 导出\nexport const PI = 3.14;\nexport function add(a, b) { return a + b; }\n\n// 或者统一导出\nconst PI = 3.14;\nfunction add(a, b) { return a + b; }\nexport { PI, add };\n\n// 导入\nimport { PI, add } from './math.js';\nimport { PI as pi } from './math.js';  // 重命名"
          },
          {
            "title": "默认导出（Default Export）",
            "code": "// 导出（每个模块只能有一个默认导出）\nexport default function multiply(a, b) {\n  return a * b;\n}\n\n// 导入（可以任意命名）\nimport multiply from './math.js';\nimport calc from './math.js';  // 同样有效"
          },
          {
            "title": "混合导入",
            "code": "// 同时导入默认和命名导出\nimport multiply, { PI, add } from './math.js';\n\n// 导入所有\nimport * as math from './math.js';\nconsole.log(math.PI, math.add(1, 2), math.default(2, 3));"
          },
          {
            "title": "ES Module vs CommonJS",
            "points": [
              "ES Module是静态的，编译时确定依赖",
              "支持Tree Shaking（删除未使用的代码）",
              "异步加载",
              "输出的是值的引用（live binding）",
              "浏览器和Node.js都支持"
            ]
          }
        ]
      },
      "source": "ES Module"
    },

    // 第10题：困难 - 多选题
    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["性能优化", "最佳实践"],
      "question": "以下哪些是JavaScript性能优化的最佳实践？",
      "options": [
        "避免频繁的DOM操作，使用DocumentFragment或虚拟DOM",
        "使用事件委托减少事件监听器数量",
        "使用Web Workers处理耗时计算",
        "使用防抖（Debounce）和节流（Throttle）优化高频事件"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "JavaScript性能优化策略",
        "content": "所有选项都是正确的性能优化实践！",
        "sections": [
          {
            "title": "1. 减少DOM操作",
            "code": "// 不好：频繁操作DOM\nfor (let i = 0; i < 1000; i++) {\n  document.body.innerHTML += `<div>${i}</div>`;\n}\n\n// 好：批量操作\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 1000; i++) {\n  const div = document.createElement('div');\n  div.textContent = i;\n  fragment.appendChild(div);\n}\ndocument.body.appendChild(fragment);"
          },
          {
            "title": "2. 事件委托",
            "code": "// 不好：为每个元素添加监听器\nitems.forEach(item => {\n  item.addEventListener('click', handleClick);\n});\n\n// 好：使用事件委托\ncontainer.addEventListener('click', (e) => {\n  if (e.target.matches('.item')) {\n    handleClick(e);\n  }\n});"
          },
          {
            "title": "3. Web Workers",
            "code": "// 主线程\nconst worker = new Worker('worker.js');\nworker.postMessage({ data: largeArray });\nworker.onmessage = (e) => {\n  console.log('计算结果:', e.data);\n};\n\n// worker.js\nself.onmessage = (e) => {\n  const result = heavyComputation(e.data.data);\n  self.postMessage(result);\n};"
          },
          {
            "title": "4. 防抖和节流",
            "code": "// 防抖：等待用户停止操作后再执行\nfunction debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n\n// 节流：固定时间间隔执行一次\nfunction throttle(fn, delay) {\n  let last = 0;\n  return function(...args) {\n    const now = Date.now();\n    if (now - last >= delay) {\n      last = now;\n      fn.apply(this, args);\n    }\n  };\n}\n\n// 使用\nwindow.addEventListener('scroll', throttle(handleScroll, 100));"
          },
          {
            "title": "其他优化技巧",
            "points": [
              "使用requestAnimationFrame优化动画",
              "避免强制同步布局（Layout Thrashing）",
              "使用CSS transform代替position",
              "图片懒加载和代码分割",
              "缓存计算结果（Memoization）"
            ]
          }
        ]
      },
      "source": "性能优化"
    }
  ],
  "navigation": {
    "prev": null,
    "next": {
      "title": "变量声明",
      "url": "01-variables.html"
    }
  }
};
