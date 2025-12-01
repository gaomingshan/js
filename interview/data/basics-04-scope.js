window.quizData_Basics04Scope = {
  "config": {
    "title": "作用域",
    "icon": "🔍",
    "description": "理解全局作用域、函数作用域与块级作用域",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["作用域类型"],
      "question": "JavaScript有哪几种作用域？",
      "options": [
        "全局作用域、函数作用域、块级作用域（ES6）",
        "只有全局作用域",
        "只有函数作用域",
        "没有作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "作用域类型：",
        "sections": [
          {
            "title": "1. 全局作用域",
            "code": "var globalVar = 'global';\nfunction fn() {\n  console.log(globalVar); // 可以访问\n}\n\n// 浏览器：window.globalVar\n// Node.js: global.globalVar"
          },
          {
            "title": "2. 函数作用域",
            "code": "function fn() {\n  var localVar = 'local';\n  console.log(localVar); // 可以访问\n}\n\nconsole.log(localVar); // ReferenceError"
          },
          {
            "title": "3. 块级作用域（ES6）",
            "code": "if (true) {\n  let blockVar = 'block';\n  const blockConst = 'const';\n  var functionVar = 'function';\n}\n\nconsole.log(blockVar); // ReferenceError\nconsole.log(blockConst); // ReferenceError\nconsole.log(functionVar); // 'function' (var没有块级作用域)"
          }
        ]
      },
      "source": "作用域类型"
    },
    {
      "difficulty": "easy",
      "tags": ["词法作用域"],
      "question": "JavaScript使用的是词法作用域还是动态作用域？",
      "options": [
        "词法作用域，作用域在函数定义时确定",
        "动态作用域",
        "两者混合",
        "没有作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "词法作用域（Lexical Scope）：",
        "sections": [
          {
            "title": "定义时确定",
            "code": "var value = 1;\n\nfunction foo() {\n  console.log(value);\n}\n\nfunction bar() {\n  var value = 2;\n  foo();\n}\n\nbar(); // 1\n// foo在定义时就确定了作用域链"
          },
          {
            "title": "对比动态作用域",
            "code": "// 如果是动态作用域（假设）\n// bar()会输出2，因为foo在bar中调用\n\n// JavaScript是词法作用域\n// bar()输出1，因为foo定义在全局"
          }
        ]
      },
      "source": "词法作用域"
    },
    {
      "difficulty": "medium",
      "tags": ["作用域链"],
      "question": "什么是作用域链？变量查找顺序是什么？",
      "options": [
        "当前作用域→外层作用域→...→全局作用域",
        "全局作用域→当前作用域",
        "随机查找",
        "只查找当前作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "作用域链：",
        "sections": [
          {
            "title": "变量查找",
            "code": "var a = 1;\n\nfunction outer() {\n  var b = 2;\n  \n  function inner() {\n    var c = 3;\n    console.log(a); // 1 (全局)\n    console.log(b); // 2 (outer)\n    console.log(c); // 3 (inner)\n  }\n  \n  inner();\n}\n\nouter();\n// 作用域链: inner → outer → global"
          },
          {
            "title": "遮蔽效应",
            "code": "var x = 'global';\n\nfunction fn() {\n  var x = 'local';\n  console.log(x); // 'local'\n  // 内层变量遮蔽外层同名变量\n}\n\nfn();\nconsole.log(x); // 'global'"
          }
        ]
      },
      "source": "作用域链"
    },
    {
      "difficulty": "medium",
      "tags": ["块级作用域"],
      "question": "let和const如何实现块级作用域？",
      "options": [
        "创建块级词法环境，变量只在块内可见",
        "与var相同",
        "没有实现",
        "使用闭包"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "块级作用域实现：",
        "sections": [
          {
            "title": "let/const块级作用域",
            "code": "{\n  let x = 1;\n  const y = 2;\n  var z = 3;\n}\n\nconsole.log(z); // 3\nconsole.log(x); // ReferenceError\nconsole.log(y); // ReferenceError"
          },
          {
            "title": "for循环",
            "code": "// let每次迭代创建新绑定\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// 输出: 0 1 2\n\n// var共享同一绑定\nfor (var j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 100);\n}\n// 输出: 3 3 3"
          }
        ]
      },
      "source": "块级作用域"
    },
    {
      "difficulty": "medium",
      "tags": ["暂时性死区"],
      "question": "什么是暂时性死区（TDZ）？",
      "options": [
        "let/const声明前无法访问变量的区域",
        "一种错误",
        "死循环",
        "内存泄漏"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "TDZ（Temporal Dead Zone）：",
        "sections": [
          {
            "title": "TDZ示例",
            "code": "console.log(x); // ReferenceError\nlet x = 1;\n\n// TDZ: 从块开始到声明之间的区域"
          },
          {
            "title": "typeof也受影响",
            "code": "typeof x; // ReferenceError\nlet x;\n\n// 但未声明的变量不报错\ntypeof y; // 'undefined'"
          },
          {
            "title": "函数参数的TDZ",
            "code": "function fn(a = b, b = 2) {\n  return [a, b];\n}\n\nfn(); // ReferenceError\n// b在使用时还未声明"
          }
        ]
      },
      "source": "TDZ"
    },
    {
      "difficulty": "medium",
      "tags": ["变量提升"],
      "question": "var和let/const的变量提升有什么区别？",
      "options": [
        "var提升并初始化为undefined，let/const提升但不初始化（TDZ）",
        "都不提升",
        "let/const不提升",
        "完全相同"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "变量提升对比：",
        "sections": [
          {
            "title": "var提升",
            "code": "console.log(x); // undefined\nvar x = 1;\n\n// 等价于\nvar x;\nconsole.log(x);\nx = 1;"
          },
          {
            "title": "let/const提升但不初始化",
            "code": "console.log(y); // ReferenceError\nlet y = 2;\n\n// let声明被提升，但存在TDZ"
          }
        ]
      },
      "source": "变量提升"
    },
    {
      "difficulty": "hard",
      "tags": ["作用域污染"],
      "question": "如何避免全局作用域污染？",
      "options": [
        "IIFE、模块化、let/const、命名空间",
        "使用var",
        "无法避免",
        "不需要避免"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "避免全局污染：",
        "sections": [
          {
            "title": "1. IIFE",
            "code": "(function() {\n  var privateVar = 'private';\n  // 不污染全局\n})();"
          },
          {
            "title": "2. ES6模块",
            "code": "// module.js\nexport const myVar = 'value';\n\n// 模块作用域，不污染全局"
          },
          {
            "title": "3. 命名空间",
            "code": "var MyApp = MyApp || {};\nMyApp.utils = {\n  helper: function() {}\n};"
          },
          {
            "title": "4. let/const",
            "code": "{\n  let temp = 'temp';\n  // 块级作用域\n}"
          }
        ]
      },
      "source": "避免污染"
    },
    {
      "difficulty": "hard",
      "tags": ["eval作用域"],
      "question": "eval()如何影响作用域？",
      "options": [
        "直接调用在当前作用域执行，间接调用在全局作用域",
        "总在全局作用域",
        "总在当前作用域",
        "不影响作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "eval与作用域：",
        "sections": [
          {
            "title": "直接调用",
            "code": "function fn() {\n  var x = 1;\n  eval('var y = 2;');\n  console.log(y); // 2\n}\n\nfn();\n// y在fn作用域内"
          },
          {
            "title": "间接调用",
            "code": "var geval = eval;\nfunction fn() {\n  var x = 1;\n  geval('var y = 2;');\n  console.log(y); // ReferenceError\n}\n\nfn();\nconsole.log(y); // 2 (全局)"
          },
          {
            "title": "严格模式",
            "code": "'use strict';\neval('var x = 1;');\nconsole.log(x); // ReferenceError\n// 严格模式下eval有自己的作用域"
          }
        ]
      },
      "source": "eval作用域"
    },
    {
      "difficulty": "hard",
      "tags": ["with语句"],
      "question": "with语句对作用域有什么影响？为什么不推荐？",
      "options": [
        "延长作用域链，性能差且易出错，严格模式禁用",
        "提高性能",
        "推荐使用",
        "没有影响"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "with语句：",
        "sections": [
          {
            "title": "with的作用",
            "code": "var obj = { x: 1, y: 2 };\n\nwith (obj) {\n  console.log(x); // 1\n  console.log(y); // 2\n}\n\n// 将obj添加到作用域链前端"
          },
          {
            "title": "问题1：性能",
            "code": "// 延长作用域链，变量查找变慢\nwith (obj) {\n  // 每次访问都要先查obj\n}"
          },
          {
            "title": "问题2：意外创建全局变量",
            "code": "var obj = { a: 1 };\n\nwith (obj) {\n  a = 2;  // obj.a = 2\n  b = 3;  // 创建全局变量！\n}\n\nconsole.log(b); // 3\nconsole.log(obj.b); // undefined"
          },
          {
            "title": "替代方案",
            "code": "// 解构\nconst { x, y } = obj;\n\n// 临时变量\nconst temp = obj;\ntemp.x + temp.y;"
          }
        ]
      },
      "source": "with语句"
    },
    {
      "difficulty": "hard",
      "tags": ["模块作用域"],
      "question": "ES6模块的作用域特点是什么？",
      "options": [
        "模块有独立作用域，顶层this是undefined，默认严格模式",
        "与全局作用域相同",
        "与函数作用域相同",
        "没有作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES6模块作用域：",
        "sections": [
          {
            "title": "独立作用域",
            "code": "// module.js\nvar x = 1;\nfunction fn() {}\n\n// x和fn不会污染全局\n// 需要export才能被其他模块使用"
          },
          {
            "title": "顶层this",
            "code": "// module.js\nconsole.log(this); // undefined\n\n// script标签\nconsole.log(this); // window"
          },
          {
            "title": "自动严格模式",
            "code": "// module.js\n// 自动启用严格模式\nfunction fn() {\n  x = 1; // ReferenceError\n}"
          },
          {
            "title": "导入导出",
            "code": "// module.js\nexport const value = 1;\nexport function fn() {}\n\n// main.js\nimport { value, fn } from './module.js';\n// 导入的是绑定，不是值的拷贝"
          }
        ]
      },
      "source": "模块作用域"
    }
  ],
  "navigation": {
    "prev": {
      "title": "函数基础",
      "url": "04-function-basics.html"
    },
    "next": {
      "title": "闭包",
      "url": "04-closure.html"
    }
  }
};
