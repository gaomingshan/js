window.quizData_Deep01 = {
  "config": {
    "title": "执行上下文",
    "icon": "🔥",
    "description": "深入理解JavaScript执行机制的核心",
    "primaryColor": "#f5576c",
    "bgGradient": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["基础概念"],
      "question": "什么是执行上下文（Execution Context）？",
      "options": [
        "JavaScript代码执行的环境，包含变量对象、作用域链、this值",
        "只是函数调用",
        "代码的执行顺序",
        "变量声明"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "执行上下文（Execution Context）：",
        "content": "执行上下文是JavaScript代码执行的环境抽象概念，包含三个重要组成部分：",
        "sections": [
          {
            "title": "1. 变量对象（Variable Object，VO）",
            "points": [
              "存储变量、函数声明、函数参数",
              "函数上下文中称为活动对象（Activation Object，AO）"
            ]
          },
          {
            "title": "2. 作用域链（Scope Chain）",
            "points": [
              "保存当前上下文和父级上下文的变量对象",
              "用于变量查找"
            ]
          },
          {
            "title": "3. this值",
            "points": [
              "函数调用时确定",
              "取决于调用方式"
            ]
          },
          {
            "title": "示例",
            "code": "// 执行上下文示例\nfunction example(a) {\n  var b = 20;\n  function inner() { }\n  return b;\n}\n\nexample(10);\n\n// 创建的执行上下文包含：\n// 1. 变量对象：{ a: 10, b: undefined, inner: function }\n// 2. 作用域链：[AO, globalVO]\n// 3. this：全局对象（非严格模式）"
          }
        ]
      },
      "source": "ECMAScript规范"
    },
    {
      "difficulty": "easy",
      "tags": ["类型"],
      "question": "JavaScript中有哪几种执行上下文？",
      "options": [
        "全局执行上下文、函数执行上下文、Eval执行上下文",
        "只有全局上下文",
        "只有函数上下文",
        "没有区分"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "三种执行上下文：",
        "sections": [
          {
            "title": "1. 全局执行上下文（Global EC）",
            "points": [
              "程序启动时创建",
              "只有一个",
              "创建全局对象（window/global）",
              "this指向全局对象"
            ]
          },
          {
            "title": "2. 函数执行上下文（Function EC）",
            "points": [
              "每次函数调用时创建",
              "可以有多个",
              "创建活动对象（AO）",
              "this取决于调用方式"
            ]
          },
          {
            "title": "3. Eval执行上下文",
            "points": [
              "eval()函数内的代码",
              "不推荐使用"
            ]
          },
          {
            "title": "示例",
            "code": "// 1. 全局执行上下文\nvar x = 10;\n\n// 2. 函数执行上下文\nfunction foo() {\n  var y = 20;\n  \n  // 又一个函数执行上下文\n  function bar() {\n    var z = 30;\n  }\n  \n  bar();\n}\n\nfoo();"
          }
        ]
      },
      "source": "执行上下文类型"
    },
    {
      "difficulty": "medium",
      "tags": ["执行栈"],
      "question": "什么是执行栈（Execution Stack）？",
      "options": [
        "LIFO栈结构，用于管理执行上下文，函数调用入栈、返回出栈",
        "队列结构",
        "数组",
        "链表"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "执行栈（调用栈、Call Stack）：",
        "content": "LIFO（后进先出）栈结构，用于管理代码执行期间创建的所有执行上下文。",
        "sections": [
          {
            "title": "工作流程",
            "points": [
              "JavaScript引擎首次执行脚本时，创建全局执行上下文并压入栈底",
              "每次函数调用，创建新的函数执行上下文并压入栈顶",
              "当前函数执行完毕，其执行上下文从栈顶弹出",
              "所有代码执行完毕，全局上下文从栈中弹出"
            ]
          },
          {
            "title": "示例",
            "code": "function first() {\n  console.log('第一个函数');\n  second();\n  console.log('第一个函数结束');\n}\n\nfunction second() {\n  console.log('第二个函数');\n  third();\n  console.log('第二个函数结束');\n}\n\nfunction third() {\n  console.log('第三个函数');\n}\n\nfirst();\n\n// 执行栈变化：\n// 1. [Global]\n// 2. [Global, first]\n// 3. [Global, first, second]\n// 4. [Global, first, second, third]\n// 5. [Global, first, second]\n// 6. [Global, first]\n// 7. [Global]"
          }
        ]
      },
      "source": "执行栈"
    },
    {
      "difficulty": "medium",
      "tags": ["创建阶段"],
      "question": "执行上下文的创建阶段做了什么？",
      "options": [
        "创建变量对象、建立作用域链、确定this值",
        "只是执行代码",
        "只是声明变量",
        "没有创建阶段"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "执行上下文创建阶段：",
        "sections": [
          {
            "title": "1. 创建变量对象（VO/AO）",
            "points": [
              "建立arguments对象（函数上下文）",
              "扫描函数声明，创建属性（函数优先）",
              "扫描变量声明，创建属性（初始值undefined）"
            ]
          },
          {
            "title": "2. 建立作用域链",
            "points": [
              "复制函数[[Scope]]属性创建作用域链",
              "将活动对象添加到作用域链顶端"
            ]
          },
          {
            "title": "3. 确定this值",
            "points": [
              "根据函数调用方式确定"
            ]
          },
          {
            "title": "示例",
            "code": "function foo(a) {\n  var b = 2;\n  function c() {}\n  var d = function() {};\n  b = 3;\n}\n\nfoo(1);\n\n// 创建阶段AO：\n// AO = {\n//   arguments: { 0: 1, length: 1 },\n//   a: 1,\n//   b: undefined,\n//   c: reference to function c(){},\n//   d: undefined\n// }"
          }
        ]
      },
      "source": "执行上下文创建"
    },
    {
      "difficulty": "medium",
      "tags": ["执行阶段"],
      "question": "执行上下文的执行阶段做了什么？",
      "options": [
        "变量赋值、函数引用、执行代码",
        "只是创建变量",
        "什么都不做",
        "只是声明函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "执行上下文执行阶段：",
        "content": "按照代码顺序执行，进行变量赋值、函数调用等操作。",
        "sections": [
          {
            "title": "执行阶段操作",
            "points": [
              "变量赋值",
              "函数引用",
              "执行其他代码"
            ]
          },
          {
            "title": "示例",
            "code": "function foo(a) {\n  var b = 2;\n  function c() {}\n  var d = function() {};\n  b = 3;\n}\n\nfoo(1);\n\n// 执行阶段AO：\n// AO = {\n//   arguments: { 0: 1, length: 1 },\n//   a: 1,\n//   b: 3,  // 已赋值\n//   c: reference to function c(){},\n//   d: reference to FunctionExpression \"d\"  // 已赋值\n// }"
          }
        ]
      },
      "source": "执行阶段"
    },
    {
      "difficulty": "medium",
      "tags": ["VO与AO"],
      "question": "变量对象（VO）和活动对象（AO）有什么区别？",
      "options": [
        "VO是抽象概念，函数执行时VO被激活成为AO",
        "完全相同",
        "没有关系",
        "AO不存在"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "VO与AO的关系：",
        "sections": [
          {
            "title": "变量对象（Variable Object，VO）",
            "points": [
              "抽象概念",
              "不可直接访问",
              "全局上下文的VO就是全局对象"
            ]
          },
          {
            "title": "活动对象（Activation Object，AO）",
            "points": [
              "函数执行时，VO被激活成为AO",
              "可以访问（通过arguments等）",
              "AO = VO + function parameters + arguments"
            ]
          },
          {
            "title": "关系",
            "code": "// 全局上下文\nvar a = 1;\n// VO(global) = { a: 1 }\n\nfunction foo(x) {\n  var b = 2;\n  // 进入函数时\n  // VO(foo) = { x: undefined, b: undefined }\n  // 激活后\n  // AO(foo) = {\n  //   arguments: { 0: 10, length: 1 },\n  //   x: 10,\n  //   b: 2\n  // }\n}\n\nfoo(10);"
          }
        ]
      },
      "source": "VO与AO"
    },
    {
      "difficulty": "hard",
      "tags": ["变量提升"],
      "question": "为什么会出现变量提升（Hoisting）？",
      "options": [
        "因为执行上下文创建阶段会扫描并创建变量和函数声明",
        "JavaScript的Bug",
        "只是语法糖",
        "没有变量提升"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "变量提升的本质：",
        "content": "变量提升不是将声明移动到顶部，而是在执行上下文创建阶段就已经处理了声明。",
        "sections": [
          {
            "title": "函数提升",
            "points": [
              "函数声明会被完整提升",
              "可以在声明前调用"
            ]
          },
          {
            "title": "变量提升",
            "points": [
              "var声明的变量会提升",
              "但赋值不会提升",
              "提升后值为undefined"
            ]
          },
          {
            "title": "示例",
            "code": "console.log(a); // undefined\nvar a = 1;\n\nfoo(); // 'foo函数'\nfunction foo() {\n  console.log('foo函数');\n}\n\n// 实际执行过程：\n// 创建阶段：\n// VO = {\n//   a: undefined,\n//   foo: reference to function\n// }\n// 执行阶段：\n// console.log(a); // undefined\n// a = 1;\n// foo(); // 'foo函数'"
          }
        ]
      },
      "source": "变量提升"
    },
    {
      "difficulty": "hard",
      "tags": ["暂时性死区"],
      "question": "什么是暂时性死区（Temporal Dead Zone，TDZ）？",
      "options": [
        "let/const声明的变量在声明前不可访问的区域",
        "一种错误",
        "只存在于严格模式",
        "不存在这个概念"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "暂时性死区（TDZ）：",
        "content": "let/const声明的变量从块级作用域开始到声明语句之间的区域称为TDZ，在此区域访问变量会抛出ReferenceError。",
        "sections": [
          {
            "title": "TDZ特点",
            "points": [
              "let/const声明不会提升（实际上会提升，但不会初始化）",
              "在声明前访问会报错",
              "typeof检测也会报错"
            ]
          },
          {
            "title": "var vs let",
            "code": "// var声明\nconsole.log(a); // undefined\nvar a = 1;\n\n// let声明\nconsole.log(b); // ReferenceError: Cannot access 'b' before initialization\nlet b = 2;\n\n// TDZ区域\n{\n  // TDZ开始\n  console.log(c); // ReferenceError\n  let c = 3; // TDZ结束\n}"
          }
        ]
      },
      "source": "TDZ"
    },
    {
      "difficulty": "hard",
      "tags": ["词法环境"],
      "question": "ES6中的词法环境（Lexical Environment）是什么？",
      "options": [
        "由环境记录和外部词法环境引用组成，用于管理标识符绑定",
        "就是作用域",
        "只是变量对象的别名",
        "不存在这个概念"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "词法环境（Lexical Environment）：",
        "content": "ES6规范用词法环境替代了变量对象的概念，更加规范和统一。",
        "sections": [
          {
            "title": "组成部分",
            "points": [
              "环境记录（Environment Record）：存储变量和函数声明",
              "外部词法环境引用（outer）：指向外部词法环境"
            ]
          },
          {
            "title": "类型",
            "points": [
              "全局词法环境：环境记录是全局环境记录",
              "函数词法环境：环境记录是声明式环境记录",
              "模块词法环境：用于ES6模块"
            ]
          },
          {
            "title": "示例",
            "code": "let a = 1;\nconst b = 2;\n\nfunction foo() {\n  let c = 3;\n  var d = 4;\n}\n\n// 全局词法环境：\n// GlobalLexicalEnvironment = {\n//   EnvironmentRecord: {\n//     Type: \"Object\",\n//     a: 1,\n//     b: 2,\n//     foo: <function>\n//   },\n//   outer: null\n// }\n\n// foo函数词法环境：\n// FooLexicalEnvironment = {\n//   EnvironmentRecord: {\n//     Type: \"Declarative\",\n//     c: 3,\n//     d: 4\n//   },\n//   outer: GlobalLexicalEnvironment\n// }"
          }
        ]
      },
      "source": "词法环境"
    },
    {
      "difficulty": "hard",
      "tags": ["综合分析"],
      "question": "分析以下代码的执行上下文变化：",
      "options": [
        "全局上下文→foo上下文→bar上下文→foo上下文→全局上下文",
        "只有全局上下文",
        "全局上下文→foo上下文→全局上下文",
        "无法确定"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "执行上下文分析：",
        "code": "var x = 1;\n\nfunction foo() {\n  var y = 2;\n  function bar() {\n    var z = 3;\n    console.log(x + y + z);\n  }\n  bar();\n}\n\nfoo();",
        "sections": [
          {
            "title": "执行流程",
            "points": [
              "1. 创建全局执行上下文，压入执行栈",
              "2. 执行全局代码，x = 1",
              "3. 调用foo()，创建foo执行上下文，压入栈",
              "4. 执行foo代码，y = 2",
              "5. 调用bar()，创建bar执行上下文，压入栈",
              "6. 执行bar代码，z = 3，输出6",
              "7. bar执行完毕，bar上下文出栈",
              "8. foo执行完毕，foo上下文出栈",
              "9. 全局代码执行完毕，全局上下文出栈"
            ]
          },
          {
            "title": "执行栈变化",
            "code": "// 初始\n[GlobalContext]\n\n// 调用foo\n[GlobalContext, FooContext]\n\n// 调用bar\n[GlobalContext, FooContext, BarContext]\n\n// bar返回\n[GlobalContext, FooContext]\n\n// foo返回\n[GlobalContext]\n\n// 程序结束\n[]"
          }
        ]
      },
      "source": "综合分析"
    }
  ],
  "navigation": {
    "prev": null,
    "next": {
      "title": "作用域链",
      "url": "02-scope-chain.html"
    }
  }
};
