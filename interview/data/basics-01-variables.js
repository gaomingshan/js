window.quizData_Basics01Variables = {
  "config": {
    "title": "变量声明",
    "icon": "📦",
    "description": "掌握var、let、const的区别与使用",
    "primaryColor": "#f093fb",
    "bgGradient": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["var"],
      "question": "var声明的变量有什么特点？",
      "options": [
        "函数作用域、可以重复声明、存在变量提升",
        "块级作用域",
        "不能重复声明",
        "没有变量提升"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "var的特点：",
        "sections": [
          {
            "title": "1. 函数作用域",
            "code": "function test() {\n  if (true) {\n    var x = 1;\n  }\n  console.log(x); // 1，可以访问\n}\n\n// 块外也能访问\nif (true) {\n  var y = 2;\n}\nconsole.log(y); // 2"
          },
          {
            "title": "2. 可重复声明",
            "code": "var a = 1;\nvar a = 2; // 不报错\nconsole.log(a); // 2"
          },
          {
            "title": "3. 变量提升",
            "code": "console.log(x); // undefined\nvar x = 1;\n\n// 等价于\nvar x;\nconsole.log(x);\nx = 1;"
          }
        ]
      },
      "source": "var声明"
    },
    {
      "difficulty": "easy",
      "tags": ["let"],
      "question": "let相比var有哪些改进？",
      "options": [
        "块级作用域、不能重复声明、没有变量提升（存在TDZ）",
        "与var完全相同",
        "只能在函数中使用",
        "性能更差"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "let的特点：",
        "sections": [
          {
            "title": "1. 块级作用域",
            "code": "if (true) {\n  let x = 1;\n  console.log(x); // 1\n}\nconsole.log(x); // ReferenceError"
          },
          {
            "title": "2. 不能重复声明",
            "code": "let a = 1;\nlet a = 2; // SyntaxError"
          },
          {
            "title": "3. 暂时性死区（TDZ）",
            "code": "console.log(x); // ReferenceError\nlet x = 1;\n\n// let声明不会提升到作用域顶部"
          },
          {
            "title": "4. 不绑定全局对象",
            "code": "var a = 1;\nconsole.log(window.a); // 1\n\nlet b = 2;\nconsole.log(window.b); // undefined"
          }
        ]
      },
      "source": "let声明"
    },
    {
      "difficulty": "medium",
      "tags": ["const"],
      "question": "const声明的变量可以修改吗？",
      "options": [
        "基本类型不可修改，引用类型的属性可以修改",
        "完全不可修改",
        "可以随意修改",
        "只有对象可以修改"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "const的特性：",
        "sections": [
          {
            "title": "1. 基本类型",
            "code": "const num = 1;\nnum = 2; // TypeError: Assignment to constant variable"
          },
          {
            "title": "2. 引用类型",
            "code": "const obj = { x: 1 };\nobj.x = 2;  // 可以修改属性\nobj.y = 3;  // 可以添加属性\nconsole.log(obj); // { x: 2, y: 3 }\n\nobj = {};  // TypeError: 不能重新赋值"
          },
          {
            "title": "3. 数组",
            "code": "const arr = [1, 2, 3];\narr.push(4);  // 可以\narr[0] = 0;   // 可以\nconsole.log(arr); // [0, 2, 3, 4]\n\narr = [];  // TypeError: 不能重新赋值"
          },
          {
            "title": "4. 冻结对象",
            "code": "const obj = Object.freeze({ x: 1 });\nobj.x = 2;  // 严格模式下报错，非严格模式静默失败\nconsole.log(obj.x); // 1"
          }
        ]
      },
      "source": "const声明"
    },
    {
      "difficulty": "medium",
      "tags": ["暂时性死区"],
      "question": "什么是暂时性死区（TDZ）？",
      "options": [
        "let/const声明的变量在声明前无法访问的区域",
        "函数执行时的特殊状态",
        "只存在于严格模式",
        "是一种错误类型"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "暂时性死区（Temporal Dead Zone）：",
        "sections": [
          {
            "title": "TDZ示例",
            "code": "// TDZ开始\nfunction test() {\n  // 这里访问x会报错\n  console.log(x); // ReferenceError\n  let x = 1; // TDZ结束\n  console.log(x); // 1\n}"
          },
          {
            "title": "typeof也受影响",
            "code": "typeof x; // ReferenceError\nlet x;\n\n// 但未声明的变量不报错\ntypeof y; // 'undefined'"
          },
          {
            "title": "隐蔽的TDZ",
            "code": "function bar(x = y, y = 2) {\n  return [x, y];\n}\nbar(); // ReferenceError\n// y在默认参数中被使用时还未声明"
          }
        ]
      },
      "source": "TDZ"
    },
    {
      "difficulty": "medium",
      "tags": ["块级作用域"],
      "question": "块级作用域在哪些场景中创建？",
      "options": [
        "{}、for循环、if语句、while循环、switch语句",
        "只有函数创建作用域",
        "只有{}创建作用域",
        "不存在块级作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "块级作用域的创建：",
        "sections": [
          {
            "title": "1. 代码块",
            "code": "{\n  let x = 1;\n}\nconsole.log(x); // ReferenceError"
          },
          {
            "title": "2. for循环",
            "code": "for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// 输出: 0 1 2\n// 每次迭代都有独立的i"
          },
          {
            "title": "3. if语句",
            "code": "if (true) {\n  let x = 1;\n}\nconsole.log(x); // ReferenceError"
          },
          {
            "title": "4. switch语句",
            "code": "switch (x) {\n  case 1: {\n    let y = 1;\n    break;\n  }\n  case 2: {\n    let y = 2; // 不会冲突\n    break;\n  }\n}"
          }
        ]
      },
      "source": "块级作用域"
    },
    {
      "difficulty": "medium",
      "tags": ["循环绑定"],
      "question": "为什么在循环中使用let比var更好？",
      "options": [
        "let在每次迭代都创建新的绑定，var共享同一个变量",
        "let性能更好",
        "var不能在循环中使用",
        "没有区别"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "循环中的let vs var：",
        "sections": [
          {
            "title": "var的问题",
            "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// 输出: 3 3 3\n// 所有回调共享同一个i"
          },
          {
            "title": "let的解决",
            "code": "for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// 输出: 0 1 2\n// 每次迭代创建新的i"
          },
          {
            "title": "var的解决方案（IIFE）",
            "code": "for (var i = 0; i < 3; i++) {\n  (function(j) {\n    setTimeout(() => console.log(j), 100);\n  })(i);\n}\n// 输出: 0 1 2"
          }
        ]
      },
      "source": "循环绑定"
    },
    {
      "difficulty": "hard",
      "tags": ["全局对象属性"],
      "question": "var和let/const在全局作用域的区别是什么？",
      "options": [
        "var声明的全局变量会成为window属性，let/const不会",
        "没有区别",
        "let/const也会成为window属性",
        "var不会成为window属性"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "全局变量的差异：",
        "sections": [
          {
            "title": "var声明",
            "code": "var globalVar = 'hello';\nconsole.log(window.globalVar); // 'hello'\nconsole.log(globalVar); // 'hello'\n\n// 相当于\nwindow.globalVar = 'hello';"
          },
          {
            "title": "let/const声明",
            "code": "let globalLet = 'world';\nconst globalConst = 'test';\n\nconsole.log(window.globalLet); // undefined\nconsole.log(window.globalConst); // undefined\n\nconsole.log(globalLet); // 'world'\nconsole.log(globalConst); // 'test'"
          },
          {
            "title": "原因",
            "content": "let/const声明的全局变量存在于全局词法环境中，而不是全局对象（window）上。这避免了污染全局对象。"
          }
        ]
      },
      "source": "全局对象"
    },
    {
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "var、let、const应该如何选择使用？",
      "options": [
        "优先const，需要重新赋值用let，避免使用var",
        "优先var",
        "随意使用",
        "只用let"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "变量声明最佳实践：",
        "sections": [
          {
            "title": "1. 优先使用const",
            "points": [
              "表明变量不会被重新赋值",
              "提高代码可读性",
              "防止意外修改",
              "编译器可以做更多优化"
            ],
            "code": "const PI = 3.14;\nconst users = [];\nconst config = { api: '/api' };"
          },
          {
            "title": "2. 需要重新赋值用let",
            "code": "let count = 0;\ncount++;\n\nlet result;\nif (condition) {\n  result = value1;\n} else {\n  result = value2;\n}"
          },
          {
            "title": "3. 避免使用var",
            "points": [
              "函数作用域容易出错",
              "变量提升难以理解",
              "可能污染全局对象",
              "现代JavaScript应使用let/const"
            ]
          },
          {
            "title": "4. 特殊情况",
            "content": "只有在需要兼容非常旧的浏览器（ES5之前）或有特殊需求时才使用var。"
          }
        ]
      },
      "source": "最佳实践"
    },
    {
      "difficulty": "hard",
      "tags": ["变量提升"],
      "question": "以下代码输出什么？",
      "options": [
        "undefined, ReferenceError",
        "undefined, undefined",
        "ReferenceError, ReferenceError",
        "1, 2"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "代码分析：",
        "code": "console.log(a);\nvar a = 1;\n\nconsole.log(b);\nlet b = 2;",
        "sections": [
          {
            "title": "第一个console.log(a)",
            "points": [
              "var声明会提升",
              "变量a在声明前就存在，值为undefined",
              "输出：undefined"
            ]
          },
          {
            "title": "第二个console.log(b)",
            "points": [
              "let声明也会提升，但存在TDZ",
              "在声明前访问会报错",
              "输出：ReferenceError: Cannot access 'b' before initialization"
            ]
          },
          {
            "title": "实际执行过程",
            "code": "// var a; // 提升\nconsole.log(a); // undefined\na = 1;\n\n// let b; // 提升但不初始化\nconsole.log(b); // ReferenceError（TDZ）\nb = 2;"
          }
        ]
      },
      "source": "提升机制"
    },
    {
      "difficulty": "hard",
      "tags": ["解构声明"],
      "question": "解构赋值可以与var/let/const结合使用吗？有什么要注意的？",
      "options": [
        "可以结合使用，遵循各自的作用域规则",
        "只能用let",
        "不能使用解构",
        "只能用var"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "解构与变量声明：",
        "sections": [
          {
            "title": "对象解构",
            "code": "const obj = { x: 1, y: 2 };\n\n// const\nconst { x, y } = obj;\n\n// let\nlet { x: a, y: b } = obj;\n\n// var\nvar { x: c, y: d } = obj;"
          },
          {
            "title": "数组解构",
            "code": "const arr = [1, 2, 3];\n\nconst [first, second] = arr;\nlet [, , third] = arr;\nvar [one, ...rest] = arr;"
          },
          {
            "title": "默认值",
            "code": "const { x = 10, y = 20 } = { x: 1 };\nconsole.log(x, y); // 1 20\n\nconst [a = 5, b = 7] = [1];\nconsole.log(a, b); // 1 7"
          },
          {
            "title": "注意事项",
            "points": [
              "const解构后不能重新赋值",
              "let/var解构后可以重新赋值",
              "解构声明必须立即初始化",
              "遵循各自的作用域规则"
            ],
            "code": "const { x } = obj;\nx = 2; // TypeError\n\nlet { y } = obj;\ny = 3; // OK"
          }
        ]
      },
      "source": "解构声明"
    }
  ],
  "navigation": {
    "prev": {
      "title": "JavaScript 简介",
      "url": "01-intro.html"
    },
    "next": {
      "title": "数据类型",
      "url": "01-datatypes.html"
    }
  }
};
