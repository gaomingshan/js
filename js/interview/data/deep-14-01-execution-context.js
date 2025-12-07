/**
 * 执行上下文详解
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1401ExecutionContext = {
  "config": {
    "title": "执行上下文详解",
    "icon": "📚",
    "description": "深入理解JavaScript执行上下文的创建、组成和生命周期",
    "primaryColor": "#3b82f6",
    "bgGradient": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["执行上下文"],
      "question": "JavaScript有几种执行上下文类型？",
      "options": [
        "3种：全局、函数、Eval",
        "2种：全局、函数",
        "4种：全局、函数、模块、Eval",
        "只有1种"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "执行上下文类型",
        "code": "// 1. 全局执行上下文\n// - 全局对象（window/global）\n// - this指向全局对象\n// - 只有一个\n\n// 2. 函数执行上下文\nfunction foo() {\n  // 每次调用创建新的执行上下文\n  console.log(this);\n}\n\n// 3. Eval执行上下文（不推荐）\neval('var x = 1');"
      },
      "source": "执行上下文"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["执行上下文组成"],
      "question": "执行上下文包含哪些组件？",
      "options": [
        "变量对象（VO/AO）",
        "作用域链",
        "this指向",
        "原型链",
        "词法环境",
        "闭包"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "执行上下文的组成",
        "code": "// 执行上下文（ES3规范）\nExecutionContext = {\n  VariableObject: {},  // 变量对象\n  ScopeChain: [],     // 作用域链\n  this: {}            // this指向\n}\n\n// 执行上下文（ES6规范）\nExecutionContext = {\n  LexicalEnvironment: {},    // 词法环境\n  VariableEnvironment: {},   // 变量环境\n  ThisBinding: {}            // this绑定\n}"
      },
      "source": "执行上下文组成"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["变量提升"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(a);\nvar a = 1;\n\nconsole.log(b);\nlet b = 2;\n\nconsole.log(c);\nfunction c() {}",
      "options": [
        "undefined, ReferenceError, [Function: c]",
        "undefined, undefined, [Function: c]",
        "ReferenceError × 3",
        "undefined, 2, [Function: c]"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "变量提升与TDZ",
        "code": "// 创建阶段（变量提升）\n// 1. var声明提升，初始化为undefined\n// 2. let/const声明提升，但不初始化（TDZ）\n// 3. 函数声明整体提升\n\n// 等价于：\nvar a = undefined;\nfunction c() {}\n\nconsole.log(a);    // undefined\na = 1;\n\nconsole.log(b);    // ReferenceError (TDZ)\nlet b = 2;\n\nconsole.log(c);    // [Function: c]"
      },
      "source": "变量提升"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["执行阶段"],
      "question": "执行上下文的创建阶段和执行阶段是同时进行的",
      "correctAnswer": "B",
      "explanation": {
        "title": "执行上下文的两个阶段",
        "code": "// 1. 创建阶段（Creation Phase）\n// - 创建变量对象\n// - 建立作用域链\n// - 确定this指向\n// - 变量和函数声明提升\n\n// 2. 执行阶段（Execution Phase）\n// - 变量赋值\n// - 函数引用\n// - 执行代码\n\nfunction foo(a) {\n  var b = 2;\n  function c() {}\n  var d = function() {};\n}\n\nfoo(1);\n\n// 创建阶段的AO:\n// AO = {\n//   arguments: {0: 1, length: 1},\n//   a: 1,\n//   b: undefined,\n//   c: reference to function c(){},\n//   d: undefined\n// }\n\n// 执行阶段后的AO:\n// AO = {\n//   arguments: {0: 1, length: 1},\n//   a: 1,\n//   b: 2,\n//   c: reference to function c(){},\n//   d: reference to function expression\n// }"
      },
      "source": "执行阶段"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["执行上下文栈"],
      "question": "执行上下文栈的操作，空白处填什么？",
      "code": "function a() {\n  function b() {\n    function c() {}\n    c();\n  }\n  b();\n}\na();\n\n// 执行c()时，栈的顺序是？",
      "options": [
        "c, b, a, global",
        "global, a, b, c",
        "a, b, c",
        "c, global"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "执行上下文栈（调用栈）",
        "code": "// 执行过程：\n\n// 1. 初始\nECStack = [globalContext];\n\n// 2. 调用a()\nECStack = [globalContext, aContext];\n\n// 3. 调用b()\nECStack = [globalContext, aContext, bContext];\n\n// 4. 调用c()（此时栈顶到栈底）\nECStack = [\n  globalContext,  // 栈底\n  aContext,\n  bContext,\n  cContext        // 栈顶\n];\n\n// 5. c()执行完，出栈\nECStack = [globalContext, aContext, bContext];\n\n// 6. b()执行完，出栈\nECStack = [globalContext, aContext];\n\n// 7. a()执行完，出栈\nECStack = [globalContext];"
      },
      "source": "执行栈"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["变量对象"],
      "question": "变量对象（VO）和活动对象（AO）的区别是什么？",
      "options": [
        "VO是全局上下文的",
        "AO是函数上下文的",
        "AO包含arguments对象",
        "VO和AO完全相同",
        "进入执行阶段VO变成AO",
        "AO是VO的特殊形式"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "VO vs AO",
        "code": "// 全局上下文的VO\nglobalContext.VO = {\n  Math: {...},\n  String: {...},\n  window: global\n};\n\n// 函数上下文\n// 创建阶段：VO（不可访问）\n// 执行阶段：AO（可访问）\n\nfunction foo(a, b) {\n  var c = 10;\n  function d() {}\n}\n\nfoo(1, 2);\n\n// 创建阶段的VO:\nVO = {\n  arguments: {0: 1, 1: 2, length: 2},\n  a: 1,\n  b: 2,\n  c: undefined,\n  d: reference to function d()\n};\n\n// 进入执行阶段，VO → AO\nAO = {\n  arguments: {0: 1, 1: 2, length: 2},\n  a: 1,\n  b: 2,\n  c: 10,  // 赋值\n  d: reference to function d()\n};"
      },
      "source": "VO vs AO"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["函数表达式"],
      "question": "函数声明和函数表达式的提升区别？",
      "code": "console.log(foo);\nconsole.log(bar);\n\nfunction foo() {}\nvar bar = function() {};",
      "options": [
        "[Function: foo], undefined",
        "[Function: foo], [Function: bar]",
        "undefined, undefined",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "函数声明 vs 函数表达式",
        "code": "// 函数声明：整体提升\nconsole.log(foo); // [Function: foo]\nfunction foo() {}\n\n// 函数表达式：只提升变量\nconsole.log(bar); // undefined\nvar bar = function() {};\n\n// 等价于：\nfunction foo() {}  // 函数声明提升\nvar bar = undefined;  // 变量提升\n\nconsole.log(foo);  // [Function: foo]\nconsole.log(bar);  // undefined\n\nbar = function() {};  // 赋值"
      },
      "source": "函数提升"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["全局对象"],
      "question": "在浏览器中，全局执行上下文的this指向window对象",
      "correctAnswer": "A",
      "explanation": {
        "title": "全局上下文的this",
        "code": "// 浏览器环境\nconsole.log(this === window); // true\n\n// Node.js环境\nconsole.log(this === global); // true (非严格模式)\n\n// 全局上下文\nvar a = 1;\nconsole.log(window.a); // 1\nconsole.log(this.a);   // 1"
      },
      "source": "全局上下文"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["词法环境"],
      "question": "ES6的词法环境包含哪两部分？",
      "code": "LexicalEnvironment = {\n  ______: {},\n  outer: <parent lexical environment>\n}",
      "options": [
        "EnvironmentRecord",
        "VariableObject",
        "ActivationObject",
        "ScopeChain"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "词法环境结构",
        "code": "// 词法环境（Lexical Environment）\nLexicalEnvironment = {\n  // 环境记录（存储变量和函数声明）\n  EnvironmentRecord: {\n    Type: 'Declarative',\n    // let, const, class声明\n    name: 'value'\n  },\n  // 外部环境引用\n  outer: <parent lexical environment>\n};\n\n// 变量环境（Variable Environment）\nVariableEnvironment = {\n  EnvironmentRecord: {\n    Type: 'Object',\n    // var, function声明\n    name: 'value'\n  },\n  outer: <parent variable environment>\n};\n\n// 执行上下文（ES6）\nExecutionContext = {\n  LexicalEnvironment: {...},\n  VariableEnvironment: {...},\n  ThisBinding: <this value>\n};"
      },
      "source": "词法环境"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "关于执行上下文的最佳实践有哪些？",
      "options": [
        "避免使用eval",
        "减少全局变量",
        "使用let/const代替var",
        "避免过深的函数嵌套",
        "所有变量都提前声明",
        "使用严格模式"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "最佳实践",
        "code": "// 1. 避免eval（破坏词法作用域）\n// ❌ 不好\neval('var x = 1');\n\n// 2. 减少全局变量\n// ❌ 不好\nvar global1 = 1;\nvar global2 = 2;\n\n// ✅ 好\nconst App = {\n  data1: 1,\n  data2: 2\n};\n\n// 3. 使用let/const\n// ✅ 好\nfor (let i = 0; i < 5; i++) {}\n\n// 4. 避免深层嵌套\n// ❌ 不好\nfunction a() {\n  function b() {\n    function c() {\n      function d() {}\n    }\n  }\n}\n\n// 5. 使用严格模式\n'use strict';\n// 防止意外创建全局变量"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "隐式转换",
      "url": "../basics/08-implicit-conversion.html"
    },
    "next": {
      "title": "作用域链的本质",
      "url": "14-02-scope-chain.html"
    }
  }
};
