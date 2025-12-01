window.quizData_Deep02 = {
  "config": {
    "title": "作用域链",
    "icon": "🔗",
    "description": "深入理解JavaScript作用域链机制",
    "primaryColor": "#4facfe",
    "bgGradient": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["基础概念"],
      "question": "什么是作用域链（Scope Chain）？",
      "options": [
        "当前执行上下文的变量对象和所有父级执行上下文的变量对象组成的链表",
        "只是变量查找",
        "函数调用链",
        "原型链的别名"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "作用域链定义：",
        "content": "作用域链是由当前执行上下文的变量对象和所有父级执行上下文的变量对象组成的链表结构，用于变量查找。",
        "sections": [
          {
            "title": "组成",
            "points": [
              "当前执行上下文的活动对象（AO）",
              "父级执行上下文的变量对象",
              "一直到全局执行上下文的变量对象"
            ]
          },
          {
            "title": "作用",
            "points": [
              "变量查找：从作用域链前端开始查找",
              "标识符解析：逐级向上查找",
              "如果找不到，抛出ReferenceError"
            ]
          },
          {
            "title": "示例",
            "code": "var a = 1;\n\nfunction outer() {\n  var b = 2;\n  \n  function inner() {\n    var c = 3;\n    console.log(a + b + c); // 6\n  }\n  \n  inner();\n}\n\nouter();\n\n// inner的作用域链：\n// [innerAO, outerAO, globalVO]\n// innerAO = { c: 3 }\n// outerAO = { b: 2, inner: function }\n// globalVO = { a: 1, outer: function }"
          }
        ]
      },
      "source": "作用域链"
    },
    {
      "difficulty": "easy",
      "tags": ["词法作用域"],
      "question": "JavaScript采用的是词法作用域还是动态作用域？",
      "options": [
        "词法作用域（静态作用域），函数作用域在定义时确定",
        "动态作用域",
        "两者都不是",
        "取决于调用方式"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "词法作用域（Lexical Scope）：",
        "content": "JavaScript采用词法作用域，函数的作用域在函数定义时就确定了，而不是在调用时确定。",
        "sections": [
          {
            "title": "词法作用域特点",
            "points": [
              "作用域由函数声明的位置决定",
              "作用域链在函数定义时就建立",
              "与函数如何调用无关"
            ]
          },
          {
            "title": "对比动态作用域",
            "code": "var value = 1;\n\nfunction foo() {\n  console.log(value);\n}\n\nfunction bar() {\n  var value = 2;\n  foo();\n}\n\nbar();\n\n// 词法作用域（JavaScript）：输出 1\n// 因为foo在全局定义，作用域链是[fooAO, globalVO]\n\n// 动态作用域（假设）：输出 2\n// 因为foo在bar中调用，会查找bar的value"
          }
        ]
      },
      "source": "词法作用域"
    },
    {
      "difficulty": "medium",
      "tags": ["[[Scope]]属性"],
      "question": "函数的[[Scope]]属性是什么？",
      "options": [
        "函数创建时保存的所有父级变量对象的层级链，用于创建作用域链",
        "函数的参数",
        "函数的返回值",
        "函数的this值"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "[[Scope]]属性：",
        "content": "[[Scope]]是函数对象的内部属性，在函数创建时就确定了，保存了所有父级变量对象。",
        "sections": [
          {
            "title": "创建时机",
            "points": [
              "函数定义时创建",
              "保存父级作用域链",
              "作为函数对象的内部属性"
            ]
          },
          {
            "title": "使用时机",
            "points": [
              "函数执行时，复制[[Scope]]创建作用域链",
              "将当前活动对象添加到作用域链前端"
            ]
          },
          {
            "title": "示例",
            "code": "var x = 10;\n\nfunction foo() {\n  var y = 20;\n  \n  function bar() {\n    var z = 30;\n    console.log(x + y + z);\n  }\n  \n  return bar;\n}\n\nvar fn = foo();\n\n// bar定义时：\n// bar.[[Scope]] = [fooAO, globalVO]\n\n// bar执行时：\n// barScopeChain = [barAO, ...bar.[[Scope]]]\n// = [barAO, fooAO, globalVO]"
          }
        ]
      },
      "source": "[[Scope]]属性"
    },
    {
      "difficulty": "medium",
      "tags": ["作用域类型"],
      "question": "ES6之前JavaScript有哪些作用域类型？",
      "options": [
        "全局作用域、函数作用域",
        "全局作用域、函数作用域、块级作用域",
        "只有全局作用域",
        "只有函数作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ES6之前的作用域：",
        "sections": [
          {
            "title": "1. 全局作用域",
            "points": [
              "最外层声明的变量",
              "window对象的属性",
              "在任何地方都可访问"
            ]
          },
          {
            "title": "2. 函数作用域",
            "points": [
              "函数内部声明的变量",
              "只在函数内部可访问",
              "var声明的变量具有函数作用域"
            ]
          },
          {
            "title": "ES6块级作用域",
            "code": "// ES6之前没有块级作用域\nif (true) {\n  var a = 1;\n}\nconsole.log(a); // 1\n\n// ES6 let/const有块级作用域\nif (true) {\n  let b = 2;\n}\nconsole.log(b); // ReferenceError"
          }
        ]
      },
      "source": "作用域类型"
    },
    {
      "difficulty": "medium",
      "tags": ["块级作用域"],
      "question": "ES6的let/const如何实现块级作用域？",
      "options": [
        "通过词法环境的环境记录实现，每个块都有独立的词法环境",
        "通过var实现",
        "通过闭包实现",
        "没有块级作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "块级作用域实现：",
        "sections": [
          {
            "title": "实现机制",
            "points": [
              "每个代码块（{}）创建新的词法环境",
              "let/const声明存储在块级词法环境中",
              "块执行完毕，词法环境销毁"
            ]
          },
          {
            "title": "示例",
            "code": "{\n  let a = 1;\n  const b = 2;\n  var c = 3;\n  console.log(a, b, c); // 1 2 3\n}\n\nconsole.log(c); // 3\nconsole.log(a); // ReferenceError\nconsole.log(b); // ReferenceError"
          },
          {
            "title": "常见应用",
            "code": "// 循环中的块级作用域\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// 输出: 0 1 2\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// 输出: 3 3 3"
          }
        ]
      },
      "source": "块级作用域"
    },
    {
      "difficulty": "medium",
      "tags": ["全局污染"],
      "question": "如何避免全局作用域污染？",
      "options": [
        "使用IIFE、模块化、let/const、命名空间",
        "使用var",
        "无法避免",
        "不需要避免"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "避免全局污染的方法：",
        "sections": [
          {
            "title": "1. IIFE（立即执行函数）",
            "code": "(function() {\n  var privateVar = 'private';\n  // privateVar不会污染全局\n})();"
          },
          {
            "title": "2. 模块化",
            "code": "// ES6模块\nexport const myVar = 'value';\n\n// CommonJS\nmodule.exports = { myVar: 'value' };"
          },
          {
            "title": "3. 使用let/const",
            "code": "// 块级作用域\n{\n  let temp = 'temp';\n}\n// temp不会污染全局"
          },
          {
            "title": "4. 命名空间",
            "code": "var MyApp = MyApp || {};\nMyApp.utils = {\n  helper: function() {}\n};"
          }
        ]
      },
      "source": "全局污染"
    },
    {
      "difficulty": "hard",
      "tags": ["性能优化"],
      "question": "作用域链对性能有什么影响？如何优化？",
      "options": [
        "作用域链越长查找越慢，应缓存外部变量、减少嵌套、使用局部变量",
        "没有影响",
        "越长越快",
        "无法优化"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "作用域链性能优化：",
        "sections": [
          {
            "title": "性能影响",
            "points": [
              "查找变量需要遍历作用域链",
              "嵌套越深，链越长，查找越慢",
              "局部变量查找最快"
            ]
          },
          {
            "title": "优化方法",
            "code": "// 不优化\nfunction process() {\n  for (let i = 0; i < 1000; i++) {\n    document.getElementById('result').innerHTML += i;\n  }\n}\n\n// 优化：缓存外部变量\nfunction processOptimized() {\n  const result = document.getElementById('result');\n  for (let i = 0; i < 1000; i++) {\n    result.innerHTML += i;\n  }\n}"
          },
          {
            "title": "最佳实践",
            "points": [
              "将常用的全局变量缓存为局部变量",
              "减少函数嵌套层级",
              "避免with语句（会延长作用域链）",
              "避免try-catch的catch块中定义变量"
            ]
          }
        ]
      },
      "source": "性能优化"
    },
    {
      "difficulty": "hard",
      "tags": ["with语句"],
      "question": "with语句对作用域链有什么影响？为什么不推荐使用？",
      "options": [
        "with会在作用域链前端添加指定对象，降低性能且易引起混淆",
        "没有影响",
        "会优化性能",
        "非常推荐使用"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "with语句的问题：",
        "sections": [
          {
            "title": "工作原理",
            "points": [
              "将指定对象添加到作用域链前端",
              "延长了作用域链",
              "查找性能下降"
            ]
          },
          {
            "title": "问题示例",
            "code": "var obj = { a: 1 };\nvar a = 2;\n\nwith(obj) {\n  console.log(a); // 1\n  b = 3; // 意外创建全局变量！\n}\n\nconsole.log(b); // 3\nconsole.log(obj.b); // undefined"
          },
          {
            "title": "为什么不推荐",
            "points": [
              "性能问题：延长作用域链",
              "语义不明：难以判断变量来源",
              "安全问题：可能意外创建全局变量",
              "严格模式禁用"
            ]
          },
          {
            "title": "替代方案",
            "code": "// 不用with\nconst { x, y, z } = obj;\nconsole.log(x + y + z);\n\n// 或\nconst temp = obj;\nconsole.log(temp.x + temp.y + temp.z);"
          }
        ]
      },
      "source": "with语句"
    },
    {
      "difficulty": "hard",
      "tags": ["eval函数"],
      "question": "eval()对作用域有什么影响？",
      "options": [
        "eval会在当前作用域中动态执行代码，可能污染作用域且影响优化",
        "没有影响",
        "会优化性能",
        "非常安全"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "eval的作用域问题：",
        "sections": [
          {
            "title": "直接调用eval",
            "code": "function foo() {\n  var a = 1;\n  eval('var b = 2;');\n  console.log(b); // 2\n}\n\nfoo();\n// eval在当前作用域执行，b成为foo的局部变量"
          },
          {
            "title": "间接调用eval",
            "code": "var geval = eval;\nfunction bar() {\n  var a = 1;\n  geval('var b = 2;');\n  console.log(b); // ReferenceError\n}\n// 间接调用在全局作用域执行"
          },
          {
            "title": "问题",
            "points": [
              "安全风险：可执行任意代码",
              "性能问题：阻止引擎优化",
              "作用域污染：可能修改当前作用域",
              "调试困难"
            ]
          },
          {
            "title": "替代方案",
            "code": "// 使用Function构造函数（全局作用域）\nconst fn = new Function('a', 'b', 'return a + b');\n\n// 使用JSON.parse解析数据\nconst data = JSON.parse('{\"key\": \"value\"}');"
          }
        ]
      },
      "source": "eval函数"
    },
    {
      "difficulty": "hard",
      "tags": ["综合分析"],
      "question": "分析以下代码的作用域链：",
      "options": [
        "bar的作用域链：[barAO, fooAO, globalVO]",
        "[barAO]",
        "[barAO, globalVO]",
        "[fooAO, globalVO]"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "作用域链分析：",
        "code": "var x = 10;\n\nfunction foo() {\n  var y = 20;\n  \n  function bar() {\n    var z = 30;\n    console.log(x + y + z); // 60\n  }\n  \n  return bar;\n}\n\nvar fn = foo();\nfn();",
        "sections": [
          {
            "title": "定义阶段",
            "points": [
              "foo定义：foo.[[Scope]] = [globalVO]",
              "bar定义：bar.[[Scope]] = [fooAO, globalVO]"
            ]
          },
          {
            "title": "执行阶段",
            "code": "// 1. foo执行\n// fooContext = {\n//   AO: { y: 20, bar: function },\n//   Scope: [fooAO, globalVO]\n// }\n\n// 2. bar执行\n// barContext = {\n//   AO: { z: 30 },\n//   Scope: [barAO, fooAO, globalVO]\n// }\n\n// 3. 查找变量\n// z: 在barAO中找到\n// y: 在fooAO中找到\n// x: 在globalVO中找到"
          }
        ]
      },
      "source": "综合分析"
    }
  ],
  "navigation": {
    "prev": {
      "title": "执行上下文",
      "url": "01-execution-context.html"
    },
    "next": {
      "title": "闭包深入",
      "url": "03-closure-deep.html"
    }
  }
};
