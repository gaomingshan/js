window.quizData_Basics01Variables = {
  "config": {
    "title": "变量声明",
    "icon": "📦",
    "description": "var、let、const的区别与使用",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    // 第1题：简单 - 单选题
    {
      "difficulty": "easy",
      "tags": ["基础概念"],
      "question": "JavaScript中有哪几种声明变量的方式？",
      "options": [
        "var、let、const",
        "只有var",
        "只有let和const",
        "var、let、const、function"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript变量声明",
        "sections": [
          {
            "title": "三种声明方式",
            "points": [
              "var：ES5及之前的变量声明，函数作用域",
              "let：ES6引入，块级作用域，可以修改",
              "const：ES6引入，块级作用域，不可重新赋值"
            ]
          },
          {
            "title": "基本使用",
            "code": "var x = 1;     // 函数作用域\nlet y = 2;     // 块级作用域，可修改\nconst z = 3;   // 块级作用域，不可修改\n\ny = 4;  // ✓ 可以\nz = 5;  // ✗ TypeError: Assignment to constant variable"
          }
        ]
      },
      "source": "变量声明"
    },

    // 第2题：简单 - 判断题
    {
      "difficulty": "easy",
      "type": "true-false",
      "tags": ["const"],
      "question": "const声明的变量完全不能改变，包括对象的属性也不能修改。",
      "options": ["正确", "错误"],
      "correctAnswer": "B",
      "explanation": {
        "title": "const的含义",
        "content": "这个说法是错误的。const保证的是变量指向的内存地址不变，而不是值不变。",
        "sections": [
          {
            "title": "基本类型",
            "code": "const x = 1;\nx = 2;  // ✗ TypeError\n// 基本类型的值就保存在变量指向的内存地址"
          },
          {
            "title": "引用类型",
            "code": "const obj = { name: 'Tom' };\nobj.name = 'Jerry';  // ✓ 可以修改属性\nobj.age = 20;        // ✓ 可以添加属性\n\nobj = {};  // ✗ TypeError，不能改变引用\n// const保证的是obj指向的内存地址不变"
          },
          {
            "title": "冻结对象",
            "code": "const obj = Object.freeze({ name: 'Tom' });\nobj.name = 'Jerry';  // 严格模式下报错，非严格模式静默失败\n// 使用Object.freeze()才能真正冻结对象"
          }
        ]
      },
      "source": "const特性"
    },

    // 第3题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["作用域", "let vs var"],
      "question": "let相比var有哪些重要区别？",
      "options": [
        "let是块级作用域，var是函数作用域",
        "let不存在变量提升",
        "let不允许重复声明",
        "let声明的全局变量不会成为window对象的属性"
      ],
      "correctAnswer": ["A", "C", "D"],
      "explanation": {
        "title": "let vs var的区别",
        "sections": [
          {
            "title": "1. 作用域不同（选项A - 正确）",
            "code": "// var：函数作用域\nfunction test1() {\n  if (true) {\n    var x = 1;\n  }\n  console.log(x);  // 1，可以访问\n}\n\n// let：块级作用域\nfunction test2() {\n  if (true) {\n    let y = 2;\n  }\n  console.log(y);  // ReferenceError\n}"
          },
          {
            "title": "2. 变量提升（选项B - 错误）",
            "content": "let也存在提升，但处于\"暂时性死区\"（TDZ），在声明前不可访问。",
            "code": "console.log(x);  // undefined（var提升）\nvar x = 1;\n\nconsole.log(y);  // ReferenceError（TDZ）\nlet y = 2;"
          },
          {
            "title": "3. 重复声明（选项C - 正确）",
            "code": "var x = 1;\nvar x = 2;  // ✓ 允许\n\nlet y = 1;\nlet y = 2;  // ✗ SyntaxError: Identifier 'y' has already been declared"
          },
          {
            "title": "4. 全局对象属性（选项D - 正确）",
            "code": "var x = 1;\nconsole.log(window.x);  // 1\n\nlet y = 2;\nconsole.log(window.y);  // undefined"
          }
        ]
      },
      "source": "let vs var"
    },

    // 第4题：中等 - 代码输出题
    {
      "difficulty": "medium",
      "type": "code-output",
      "tags": ["暂时性死区", "TDZ"],
      "question": "以下代码的输出结果是什么？",
      "code": "var x = 1;\n\nfunction test() {\n  console.log(x);\n  let x = 2;\n}\n\ntest();",
      "options": [
        "ReferenceError",
        "1",
        "undefined",
        "2"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "暂时性死区（Temporal Dead Zone）",
        "sections": [
          {
            "title": "TDZ概念",
            "content": "在块级作用域内，let/const声明的变量在声明之前都处于\"暂时性死区\"，访问会报错。",
            "code": "var x = 1;\n\nfunction test() {\n  // 进入函数后，let x声明被提升\n  // 但x处于TDZ，不可访问\n  console.log(x);  // ReferenceError\n  let x = 2;  // 声明后才能访问\n}"
          },
          {
            "title": "关键点",
            "points": [
              "let/const也会提升，但不会初始化",
              "从块级作用域开始到声明之前是TDZ",
              "在TDZ中访问变量会抛出ReferenceError",
              "即使外部有同名变量，也不能访问"
            ]
          },
          {
            "title": "var的对比",
            "code": "var x = 1;\n\nfunction test() {\n  console.log(x);  // undefined（var提升并初始化为undefined）\n  var x = 2;\n}"
          }
        ]
      },
      "source": "暂时性死区"
    },

    // 第5题：中等 - 代码补全题
    {
      "difficulty": "medium",
      "type": "code-completion",
      "tags": ["块级作用域"],
      "question": "如何使用let创建块级作用域？请补全代码。",
      "code": "for (______ i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);\n  }, 100);\n}\n// 期望输出：0 1 2",
      "options": [
        "let",
        "var",
        "const",
        "function"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "let在循环中的应用",
        "sections": [
          {
            "title": "let的块级作用域",
            "code": "// 使用let：每次循环都创建新的i\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);  // 0 1 2\n  }, 100);\n}\n// let为每次迭代创建独立的作用域"
          },
          {
            "title": "var的问题",
            "code": "// 使用var：所有回调共享同一个i\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);  // 3 3 3\n  }, 100);\n}\n// 循环结束后i为3，所有回调访问的是同一个i"
          },
          {
            "title": "原理",
            "content": "let声明在for循环中会创建块级作用域，每次迭代都会创建一个新的绑定，类似于：",
            "code": "{\n  let i = 0;\n  setTimeout(() => console.log(i), 100);\n}\n{\n  let i = 1;\n  setTimeout(() => console.log(i), 100);\n}\n{\n  let i = 2;\n  setTimeout(() => console.log(i), 100);\n}"
          }
        ]
      },
      "source": "块级作用域"
    },

    // 第6题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["const", "最佳实践"],
      "question": "关于const的最佳实践，以下说法正确的是？",
      "options": [
        "优先使用const，只在需要重新赋值时使用let",
        "const声明必须同时初始化",
        "const可以防止对象属性被修改",
        "const声明的数组不能使用push、pop等方法"
      ],
      "correctAnswer": ["A", "B"],
      "explanation": {
        "title": "const最佳实践",
        "sections": [
          {
            "title": "选项A - 正确",
            "content": "优先使用const可以让代码更安全，明确表达\"不可变\"的意图。",
            "code": "// 推荐\nconst PI = 3.14;\nconst users = [];\n\n// 只在需要重新赋值时用let\nlet count = 0;\ncount++;"
          },
          {
            "title": "选项B - 正确",
            "code": "const x;  // ✗ SyntaxError: Missing initializer in const declaration\nconst y = 1;  // ✓ 必须初始化"
          },
          {
            "title": "选项C - 错误",
            "content": "const不能防止对象属性被修改，只能防止重新赋值。",
            "code": "const obj = { name: 'Tom' };\nobj.name = 'Jerry';  // ✓ 可以修改\nobj = {};  // ✗ 不能重新赋值"
          },
          {
            "title": "选项D - 错误",
            "content": "const声明的数组可以使用所有修改方法，因为引用不变。",
            "code": "const arr = [1, 2];\narr.push(3);  // ✓ 可以\narr = [];  // ✗ 不能重新赋值"
          }
        ]
      },
      "source": "const最佳实践"
    },

    // 第7题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["变量提升", "作用域"],
      "question": "以下代码的输出结果是什么？",
      "code": "var a = 1;\n\nfunction foo() {\n  console.log(a);\n  if (false) {\n    var a = 2;\n  }\n}\n\nfoo();",
      "options": [
        "undefined",
        "1",
        "2",
        "ReferenceError"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "var的函数作用域提升",
        "sections": [
          {
            "title": "代码等效于",
            "code": "var a = 1;\n\nfunction foo() {\n  var a;  // var声明被提升到函数顶部\n  console.log(a);  // undefined\n  if (false) {\n    a = 2;  // 这行不会执行\n  }\n}"
          },
          {
            "title": "关键点",
            "points": [
              "var声明会被提升到函数作用域顶部",
              "即使在if(false)块中，声明仍然会被提升",
              "只是赋值操作不会执行",
              "提升后的变量初始值为undefined"
            ]
          },
          {
            "title": "let的对比",
            "code": "let a = 1;\n\nfunction foo() {\n  console.log(a);  // 1（访问外部变量）\n  if (false) {\n    let a = 2;  // 这个声明不会影响上面的输出\n  }\n}"
          }
        ]
      },
      "source": "变量提升"
    },

    // 第8题：困难 - 多选题
    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["作用域链", "闭包"],
      "question": "以下代码中，哪些变量会形成闭包？",
      "code": "function outer() {\n  var a = 1;\n  let b = 2;\n  const c = 3;\n  \n  return function inner() {\n    console.log(a);\n    console.log(b);\n  };\n}",
      "options": [
        "变量a",
        "变量b",
        "变量c",
        "都不会形成闭包"
      ],
      "correctAnswer": ["A", "B"],
      "explanation": {
        "title": "闭包与作用域",
        "sections": [
          {
            "title": "闭包形成条件",
            "points": [
              "内部函数引用了外部函数的变量",
              "外部函数返回了内部函数",
              "被引用的变量会保存在闭包中"
            ]
          },
          {
            "title": "分析",
            "code": "function outer() {\n  var a = 1;    // 被inner引用 ✓\n  let b = 2;    // 被inner引用 ✓\n  const c = 3;  // 未被inner引用 ✗\n  \n  return function inner() {\n    console.log(a);  // 引用a\n    console.log(b);  // 引用b\n    // 没有使用c\n  };\n}\n\nconst fn = outer();\n// fn的闭包中保存了a和b"
          },
          {
            "title": "查看闭包",
            "code": "const fn = outer();\nconsole.dir(fn);\n// 在浏览器控制台可以看到：\n// [[Scopes]]: Scopes[2]\n//   0: Closure (outer)\n//     a: 1\n//     b: 2\n//     // 注意：c不在闭包中"
          },
          {
            "title": "内存优化",
            "content": "JavaScript引擎会优化闭包，只保存实际被引用的变量，未使用的变量（如c）不会保存在闭包中。"
          }
        ]
      },
      "source": "闭包"
    },

    // 第9题：困难 - 代码补全题
    {
      "difficulty": "hard",
      "type": "code-completion",
      "tags": ["解构赋值", "ES6"],
      "question": "如何使用const和解构赋值交换两个变量的值？",
      "code": "let a = 1;\nlet b = 2;\n\n______ = [b, a];\n\nconsole.log(a, b);  // 2 1",
      "options": [
        "[a, b]",
        "{a, b}",
        "(a, b)",
        "a, b"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "数组解构交换变量",
        "sections": [
          {
            "title": "ES6解构赋值",
            "code": "let a = 1;\nlet b = 2;\n\n[a, b] = [b, a];  // 一行代码交换\n\nconsole.log(a, b);  // 2 1"
          },
          {
            "title": "原理",
            "points": [
              "右侧创建临时数组 [b, a]，即 [2, 1]",
              "左侧解构赋值：a = 2, b = 1",
              "不需要临时变量"
            ]
          },
          {
            "title": "传统方法对比",
            "code": "// ES5：需要临时变量\nlet a = 1;\nlet b = 2;\nlet temp = a;\na = b;\nb = temp;\n\n// ES6：一行搞定\nlet a = 1;\nlet b = 2;\n[a, b] = [b, a];"
          },
          {
            "title": "更多应用",
            "code": "// 交换数组元素\nconst arr = [1, 2, 3];\n[arr[0], arr[2]] = [arr[2], arr[0]];\n// arr: [3, 2, 1]\n\n// 解构对象\nconst {x, y} = {x: 1, y: 2};\n\n// 函数参数解构\nfunction sum([a, b]) {\n  return a + b;\n}\nsum([1, 2]);  // 3"
          }
        ]
      },
      "source": "解构赋值"
    },

    // 第10题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["循环", "闭包", "let vs var"],
      "question": "以下两段代码的输出有什么区别？",
      "code": "// 代码A\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n\n// 代码B\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
      "options": [
        "代码A输出 3 3 3，代码B输出 0 1 2",
        "两者输出相同，都是 0 1 2",
        "两者输出相同，都是 3 3 3",
        "代码A输出 0 1 2，代码B输出 3 3 3"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "循环中的var vs let",
        "sections": [
          {
            "title": "代码A：var的问题",
            "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 输出：3 3 3\n\n// 等效于：\nvar i;\nfor (i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 循环结束后i=3，所有回调访问同一个i"
          },
          {
            "title": "代码B：let的块级作用域",
            "code": "for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 输出：0 1 2\n\n// 每次迭代都创建新的i\n{ let i = 0; setTimeout(() => console.log(i), 0); }\n{ let i = 1; setTimeout(() => console.log(i), 0); }\n{ let i = 2; setTimeout(() => console.log(i), 0); }"
          },
          {
            "title": "var的解决方案",
            "code": "// 方案1：使用IIFE创建作用域\nfor (var i = 0; i < 3; i++) {\n  (function(j) {\n    setTimeout(() => console.log(j), 0);\n  })(i);\n}\n\n// 方案2：直接使用let（推荐）\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}"
          },
          {
            "title": "实际应用",
            "code": "// 常见错误：事件监听\nconst buttons = document.querySelectorAll('button');\nfor (var i = 0; i < buttons.length; i++) {\n  buttons[i].onclick = () => {\n    alert(i);  // 总是显示最后一个i\n  };\n}\n\n// 正确做法\nfor (let i = 0; i < buttons.length; i++) {\n  buttons[i].onclick = () => {\n    alert(i);  // 显示正确的索引\n  };\n}"
          }
        ]
      },
      "source": "循环闭包"
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
