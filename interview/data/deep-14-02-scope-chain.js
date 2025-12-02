/**
 * 作用域链的本质
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1402ScopeChain = {
  "config": {
    "title": "作用域链的本质",
    "icon": "🔗",
    "description": "深入理解作用域链的形成、查找机制和性能优化",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["作用域"],
      "question": "JavaScript使用什么类型的作用域？",
      "options": [
        "词法作用域（静态作用域）",
        "动态作用域",
        "块级作用域",
        "函数作用域"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "词法作用域",
        "code": "// 词法作用域：函数的作用域在定义时确定\n\nvar value = 1;\n\nfunction foo() {\n  console.log(value);\n}\n\nfunction bar() {\n  var value = 2;\n  foo(); // 输出1，不是2\n}\n\nbar();\n\n// foo的作用域链在定义时确定：\n// foo.[[Scope]] = [globalContext.VO]\n// 所以访问的是全局的value"
      },
      "source": "作用域类型"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["作用域链组成"],
      "question": "函数的作用域链包含哪些部分？",
      "options": [
        "自身的活动对象（AO）",
        "父函数的AO",
        "全局变量对象（VO）",
        "原型链",
        "[[Scope]]属性",
        "arguments对象"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "作用域链的组成",
        "code": "var global = 'global';\n\nfunction outer() {\n  var outerVar = 'outer';\n  \n  function inner() {\n    var innerVar = 'inner';\n    \n    // 访问顺序：\n    console.log(innerVar);  // 1. 自身AO\n    console.log(outerVar);  // 2. outer的AO\n    console.log(global);    // 3. 全局VO\n  }\n  \n  return inner;\n}\n\n// inner的作用域链：\n// inner.[[Scope]] = [\n//   innerContext.AO,   // 自身\n//   outerContext.AO,   // 父级\n//   globalContext.VO   // 全局\n// ]"
      },
      "source": "作用域链"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["作用域链查找"],
      "question": "以下代码的输出是什么？",
      "code": "var a = 1;\n\nfunction fn1() {\n  var a = 2;\n  function fn2() {\n    var a = 3;\n    function fn3() {\n      console.log(a);\n    }\n    fn3();\n  }\n  fn2();\n}\n\nfn1();",
      "options": [
        "3",
        "2",
        "1",
        "undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "作用域链查找过程",
        "code": "var a = 1;\n\nfunction fn1() {\n  var a = 2;\n  function fn2() {\n    var a = 3;  // fn3在这里定义\n    function fn3() {\n      console.log(a);  // 查找a\n    }\n    fn3();\n  }\n  fn2();\n}\n\nfn1(); // 输出3\n\n// fn3的作用域链查找：\n// 1. fn3的AO：没有a\n// 2. fn2的AO：找到a=3 ✅\n// 3. 停止查找\n\n// fn3.[[Scope]] = [\n//   fn3Context.AO,\n//   fn2Context.AO,  // 找到a=3\n//   fn1Context.AO,\n//   globalContext.VO\n// ]"
      },
      "source": "作用域查找"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["[[Scope]]"],
      "question": "函数的[[Scope]]属性在函数创建时就已经确定",
      "correctAnswer": "A",
      "explanation": {
        "title": "[[Scope]]属性",
        "code": "// [[Scope]]在函数创建时保存\n\nfunction outer() {\n  var x = 1;\n  \n  function inner() {\n    console.log(x);\n  }\n  \n  // inner创建时，[[Scope]]就确定了\n  // inner.[[Scope]] = [outerContext.AO]\n  \n  return inner;\n}\n\nvar fn = outer();\n\n// 即使outer执行完毕，inner仍保留对outer的AO引用\nfn(); // 1"
      },
      "source": "[[Scope]]"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["with语句"],
      "question": "with语句对作用域链的影响，空白处填什么？",
      "code": "var obj = { x: 10 };\nvar x = 20;\n\nwith (obj) {\n  console.log(______);\n}",
      "options": [
        "x",
        "obj.x",
        "this.x",
        "window.x"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "with语句（不推荐）",
        "code": "var obj = { x: 10 };\nvar x = 20;\n\nwith (obj) {\n  console.log(x); // 10\n}\n\n// with会将obj添加到作用域链顶端\n// 作用域链变成：\n// [obj, globalContext.VO]\n\n// 查找x时：\n// 1. 先在obj中找：找到x=10 ✅\n// 2. 停止查找\n\n// ❌ with的问题：\n// 1. 性能差（无法优化）\n// 2. 语义不清晰\n// 3. 严格模式禁止\n\n// 不要使用with！"
      },
      "source": "with"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["作用域类型"],
      "question": "JavaScript中有哪些类型的作用域？",
      "options": [
        "全局作用域",
        "函数作用域",
        "块级作用域（ES6+）",
        "模块作用域",
        "eval作用域",
        "类作用域"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "作用域类型",
        "code": "// 1. 全局作用域\nvar global = 1;\n\n// 2. 函数作用域\nfunction fn() {\n  var local = 2;\n}\n\n// 3. 块级作用域（ES6）\nif (true) {\n  let block = 3;\n  const block2 = 4;\n}\n\n// 4. 模块作用域（ES6）\n// module.js\nexport const moduleVar = 5;\n\n// 5. eval作用域（不推荐）\neval('var evalVar = 6');\n\n// var: 函数作用域\n// let/const: 块级作用域"
      },
      "source": "作用域类型"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["块级作用域"],
      "question": "以下代码的输出是什么？",
      "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 0);\n}",
      "options": [
        "3 3 3, 0 1 2",
        "0 1 2, 0 1 2",
        "3 3 3, 3 3 3",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "var vs let 作用域",
        "code": "// var：函数作用域\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 3个setTimeout共享同一个i\n// 循环结束后i=3\n// 输出：3 3 3\n\n// let：块级作用域\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 0);\n}\n// 每次循环创建新的j\n// 每个setTimeout捕获不同的j\n// 输出：0 1 2\n\n// let等价于：\nfor (var j = 0; j < 3; j++) {\n  (function(j) {\n    setTimeout(() => console.log(j), 0);\n  })(j);\n}"
      },
      "source": "块级作用域"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["作用域链"],
      "question": "作用域链是单向的，只能从内向外查找",
      "correctAnswer": "A",
      "explanation": {
        "title": "作用域链方向",
        "code": "function outer() {\n  var outerVar = 'outer';\n  \n  function inner() {\n    var innerVar = 'inner';\n    console.log(outerVar); // ✅ 可以访问外层\n  }\n  \n  console.log(innerVar); // ❌ 不能访问内层\n}\n\n// 作用域链只能从内向外：\n// inner → outer → global ✅\n// outer → inner ❌"
      },
      "source": "作用域链方向"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["性能优化"],
      "question": "优化作用域链查找，空白处填什么？",
      "code": "function process() {\n  for (let i = 0; i < 1000; i++) {\n    // 频繁访问document.body\n    document.body.style.color = 'red';\n  }\n}\n\n// 优化后：\nfunction processOptimized() {\n  ______ = document.body;\n  for (let i = 0; i < 1000; i++) {\n    body.style.color = 'red';\n  }\n}",
      "options": [
        "const body",
        "var body",
        "let body",
        "body"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "作用域链性能优化",
        "code": "// ❌ 不好：每次都查找全局变量\nfunction bad() {\n  for (let i = 0; i < 1000; i++) {\n    document.body.style.color = 'red';\n  }\n}\n\n// ✅ 好：缓存到局部变量\nfunction good() {\n  const body = document.body;\n  for (let i = 0; i < 1000; i++) {\n    body.style.color = 'red';\n  }\n}\n\n// 优化原理：\n// 1. 减少作用域链查找\n// 2. 局部变量访问更快\n// 3. 避免重复DOM查询\n\n// 其他优化技巧：\n// 1. 避免with和eval\n// 2. 减少嵌套层级\n// 3. 使用局部变量缓存"
      },
      "source": "性能优化"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "作用域链相关的最佳实践有哪些？",
      "options": [
        "避免使用with和eval",
        "缓存外层变量到局部",
        "减少全局变量",
        "使用块级作用域",
        "所有变量都用var",
        "避免过深的嵌套"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "作用域链最佳实践",
        "code": "// 1. 避免with/eval\n// ❌ 不好\nwith (obj) { x = 1; }\neval('var x = 1');\n\n// 2. 缓存外层变量\n// ✅ 好\nconst len = arr.length;\nfor (let i = 0; i < len; i++) {}\n\n// 3. 减少全局变量\n// ❌ 不好\nvar global1 = 1;\nvar global2 = 2;\n\n// ✅ 好\nconst App = { data1: 1, data2: 2 };\n\n// 4. 使用块级作用域\n// ✅ 好\nif (true) {\n  let temp = getData();\n  process(temp);\n}\n// temp不污染外层\n\n// 5. 避免深层嵌套\n// ❌ 不好（5层）\nfunction a() {\n  function b() {\n    function c() {\n      function d() {\n        function e() {}\n      }\n    }\n  }\n}\n\n// ✅ 好（扁平化）\nfunction processA() {}\nfunction processB() {}\nfunction processC() {}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "执行上下文详解",
      "url": "14-01-execution-context.html"
    },
    "next": {
      "title": "闭包的内存模型",
      "url": "14-03-closure-memory.html"
    }
  }
};
