/**
 * 执行上下文与作用域链
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep14ExecutionContextScope = {
  "config": {
    "title": "执行上下文与作用域链",
    "icon": "🔍",
    "description": "深入理解执行上下文详解、作用域链的本质、闭包的内存模型",
    "primaryColor": "#3b82f6",
    "bgGradient": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "medium",
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
        "code": "// 1. 全局执行上下文\n// - 全局对象（window/global）\n// - this指向全局对象\n\n// 2. 函数执行上下文\nfunction foo() {\n  // 每次调用创建新的执行上下文\n  console.log(this);\n}\n\n// 3. Eval执行上下文\neval('var x = 1'); // 不推荐使用\n\n// 执行上下文栈（调用栈）\n// ┌─────────────┐\n// │  foo()      │ ← 栈顶\n// ├─────────────┤\n// │  Global     │ ← 栈底\n// └─────────────┘"
      },
      "source": "执行上下文"
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
        "code": "// 执行上下文创建阶段\n// 1. var声明提升，初始化为undefined\n// 2. let/const声明提升，但不初始化（TDZ）\n// 3. 函数声明整体提升\n\nconsole.log(a); // undefined (var提升)\nvar a = 1;\n\nconsole.log(b); // ReferenceError (TDZ)\nlet b = 2;\n\nconsole.log(c); // [Function: c] (函数提升)\nfunction c() {}\n\n// 等价于\nvar a = undefined;\nfunction c() {}\n\nconsole.log(a);    // undefined\na = 1;\n\n// let b 在TDZ中，不可访问\nconsole.log(b);    // Error\nlet b = 2;\n\nconsole.log(c);    // [Function]"
      },
      "source": "变量提升"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["作用域链"],
      "question": "作用域链的查找过程涉及哪些内容？",
      "options": [
        "当前执行上下文的变量对象",
        "外层函数的变量对象",
        "全局变量对象",
        "原型链",
        "with作用域",
        "块级作用域"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "作用域链组成",
        "code": "// 作用域链 = [[Scope]] + 自身变量对象\n\nvar global = 'global';\n\nfunction outer() {\n  var outerVar = 'outer';\n  \n  function inner() {\n    var innerVar = 'inner';\n    console.log(innerVar);  // 1. 当前作用域\n    console.log(outerVar);  // 2. 外层作用域\n    console.log(global);    // 3. 全局作用域\n  }\n  \n  inner();\n}\n\n// inner的作用域链:\n// inner.[[Scope]] = [\n//   innerVO,    // 自身变量对象\n//   outerVO,    // 外层变量对象\n//   globalVO    // 全局变量对象\n// ]"
      },
      "source": "作用域链"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["闭包"],
      "question": "闭包会保存整个外部函数的作用域",
      "correctAnswer": "B",
      "explanation": {
        "title": "闭包只保存使用的变量",
        "code": "function outer() {\n  var used = 'I am used';\n  var unused = 'I am not used';\n  \n  return function inner() {\n    console.log(used); // 只引用了used\n  };\n}\n\nconst fn = outer();\n\n// 闭包的[[Scope]]只保存used\n// unused会被垃圾回收\n\n// V8优化:\n// 只保留被内部函数引用的变量\n// 未引用的变量可以被回收"
      },
      "source": "闭包优化"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["词法环境"],
      "question": "实现块级作用域，空白处填什么？",
      "code": "if (true) {\n  let x = 1;\n  const y = 2;\n  var z = 3;\n}\n\nconsole.log(______); // 可以访问",
      "options": [
        "z",
        "x",
        "y",
        "x, y, z"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "块级作用域",
        "code": "// let/const创建块级作用域\nif (true) {\n  let x = 1;    // 块级作用域\n  const y = 2;  // 块级作用域\n  var z = 3;    // 函数/全局作用域\n}\n\nconsole.log(z); // 3 ✅\nconsole.log(x); // ReferenceError ❌\nconsole.log(y); // ReferenceError ❌\n\n// 词法环境结构\n// BlockLexicalEnvironment {\n//   x: 1,\n//   y: 2,\n//   outer: FunctionLexicalEnvironment\n// }\n//\n// FunctionLexicalEnvironment {\n//   z: 3,\n//   outer: GlobalLexicalEnvironment\n// }"
      },
      "source": "块级作用域"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["this绑定"],
      "question": "以下代码的输出是什么？",
      "code": "var name = 'global';\n\nconst obj = {\n  name: 'obj',\n  fn1: function() {\n    console.log(this.name);\n  },\n  fn2: () => {\n    console.log(this.name);\n  }\n};\n\nobj.fn1();\nobj.fn2();\n\nconst fn1 = obj.fn1;\nconst fn2 = obj.fn2;\nfn1();\nfn2();",
      "options": [
        "obj, global, global, global",
        "obj, obj, global, global",
        "global, global, global, global",
        "obj, global, obj, global"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "this绑定规则",
        "code": "var name = 'global';\n\nconst obj = {\n  name: 'obj',\n  fn1: function() {\n    console.log(this.name);\n  },\n  fn2: () => {\n    console.log(this.name);\n  }\n};\n\nobj.fn1(); // 'obj' (隐式绑定)\nobj.fn2(); // 'global' (箭头函数继承外层this)\n\nconst fn1 = obj.fn1;\nconst fn2 = obj.fn2;\nfn1(); // 'global' (默认绑定)\nfn2(); // 'global' (箭头函数this)\n\n// this绑定优先级:\n// new > 显式绑定 > 隐式绑定 > 默认绑定\n// 箭头函数不遵循this规则，继承外层"
      },
      "source": "this绑定"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["内存模型"],
      "question": "闭包的内存模型包含哪些部分？",
      "options": [
        "函数对象",
        "[[Scope]]属性",
        "外层变量对象的引用",
        "全局对象",
        "被引用的自由变量",
        "this绑定"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "闭包内存模型",
        "code": "function createCounter() {\n  let count = 0; // 自由变量\n  \n  return function increment() {\n    return ++count;\n  };\n}\n\nconst counter = createCounter();\n\n// counter函数对象的内存结构:\n// {\n//   code: <函数代码>,\n//   [[Scope]]: [\n//     {\n//       count: 0  // 引用外层的count\n//     },\n//     globalVO\n//   ]\n// }\n\n// 特点:\n// 1. 保存外层函数的活动对象引用\n// 2. 只保存被引用的变量\n// 3. 形成独立的作用域链"
      },
      "source": "闭包内存"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["作用域"],
      "question": "JavaScript使用词法作用域（静态作用域），函数的作用域在定义时确定",
      "correctAnswer": "A",
      "explanation": {
        "title": "词法作用域 vs 动态作用域",
        "code": "var value = 1;\n\nfunction foo() {\n  console.log(value);\n}\n\nfunction bar() {\n  var value = 2;\n  foo();\n}\n\nbar(); // 输出: 1\n\n// JavaScript使用词法作用域:\n// foo的作用域在定义时确定\n// foo -> global\n\n// 如果是动态作用域:\n// foo的作用域在调用时确定\n// foo -> bar -> global\n// 输出会是: 2"
      },
      "source": "词法作用域"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["执行上下文栈"],
      "question": "函数调用时执行上下文栈的变化，空白处填什么？",
      "code": "function a() {\n  function b() {\n    function c() {\n      console.log('c');\n    }\n    c();\n  }\n  b();\n}\na();\n\n// 执行c()时，栈顶到栈底的顺序是？",
      "options": [
        "c, b, a, global",
        "global, a, b, c",
        "a, b, c, global",
        "c, global"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "执行上下文栈",
        "code": "// 执行过程:\n\n// 1. 初始状态\n// Stack: [global]\n\na();  // 调用a\n\n// 2. 进入a\n// Stack: [global, a]\n\nb();  // 调用b\n\n// 3. 进入b\n// Stack: [global, a, b]\n\nc();  // 调用c\n\n// 4. 进入c（栈顶）\n// Stack: [global, a, b, c]\nconsole.log('c');\n\n// 5. c执行完，出栈\n// Stack: [global, a, b]\n\n// 6. b执行完，出栈\n// Stack: [global, a]\n\n// 7. a执行完，出栈\n// Stack: [global]"
      },
      "source": "执行栈"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "基于执行上下文和作用域的最佳实践有哪些？",
      "options": [
        "避免使用eval和with",
        "减少作用域链查找",
        "合理使用闭包",
        "使用let/const代替var",
        "所有变量都声明为全局",
        "及时释放闭包引用"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "性能优化最佳实践",
        "code": "// 1. 避免eval和with（破坏作用域优化）\n// ❌ 不好\nwith (obj) {\n  console.log(prop);\n}\n\n// 2. 缓存作用域链查找\n// ❌ 不好\nfor (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}\n\n// ✅ 好\nconst len = arr.length;\nfor (let i = 0; i < len; i++) {\n  console.log(arr[i]);\n}\n\n// 3. 避免意外的闭包\n// ❌ 不好\nfunction attachHandlers() {\n  const bigData = new Array(1000000);\n  document.onclick = () => {\n    console.log(bigData.length); // 持有大对象\n  };\n}\n\n// ✅ 好\nfunction attachHandlers() {\n  const bigData = new Array(1000000);\n  const len = bigData.length; // 只保存需要的值\n  document.onclick = () => {\n    console.log(len);\n  };\n}\n\n// 4. 及时释放\nlet handler = createHandler();\n// 使用handler\nhandler = null; // 释放引用"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "类型系统与转换",
      "url": "../basics/08-type-conversion.html"
    },
    "next": {
      "title": "原型系统深入",
      "url": "15-prototype-system.html"
    }
  }
};
