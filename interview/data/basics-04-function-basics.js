window.quizData_Basics04FunctionBasics = {
  "config": {
    "title": "函数基础",
    "icon": "⚡",
    "description": "掌握JavaScript函数的定义、调用与基本概念",
    "primaryColor": "#3b82f6",
    "bgGradient": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["函数定义"],
      "question": "JavaScript有哪几种定义函数的方式？",
      "options": [
        "函数声明、函数表达式、箭头函数、Function构造函数",
        "只有函数声明",
        "只有函数表达式",
        "只有两种"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "函数定义方式：",
        "sections": [
          {
            "title": "1. 函数声明",
            "code": "function add(a, b) {\n  return a + b;\n}\n// 会提升"
          },
          {
            "title": "2. 函数表达式",
            "code": "const add = function(a, b) {\n  return a + b;\n};\n// 不会提升"
          },
          {
            "title": "3. 箭头函数（ES6）",
            "code": "const add = (a, b) => a + b;\n// 简洁语法，没有自己的this"
          },
          {
            "title": "4. Function构造函数",
            "code": "const add = new Function('a', 'b', 'return a + b');\n// 不推荐，性能差且不安全"
          },
          {
            "title": "5. 方法定义（对象/类中）",
            "code": "const obj = {\n  add(a, b) {\n    return a + b;\n  }\n};\n\nclass Calculator {\n  add(a, b) {\n    return a + b;\n  }\n}"
          }
        ]
      },
      "source": "函数定义"
    },
    {
      "difficulty": "easy",
      "tags": ["参数"],
      "question": "函数参数的默认值如何设置？",
      "options": [
        "ES6使用参数=默认值语法，ES5使用||或条件判断",
        "不能设置默认值",
        "只能在函数体内设置",
        "自动为undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "参数默认值：",
        "sections": [
          {
            "title": "ES6默认参数",
            "code": "function greet(name = 'Guest') {\n  return `Hello, ${name}`;\n}\n\ngreet();        // 'Hello, Guest'\ngreet('John');  // 'Hello, John'\ngreet(undefined); // 'Hello, Guest'\ngreet(null);    // 'Hello, null'"
          },
          {
            "title": "ES5写法",
            "code": "function greet(name) {\n  name = name || 'Guest';\n  return 'Hello, ' + name;\n}\n\n// 或更严格\nfunction greet(name) {\n  if (name === undefined) {\n    name = 'Guest';\n  }\n  return 'Hello, ' + name;\n}"
          },
          {
            "title": "复杂默认值",
            "code": "// 可以是表达式\nfunction fn(a = 1 + 2) { }\n\n// 可以引用前面的参数\nfunction fn(a, b = a * 2) {\n  console.log(b);\n}\nfn(5); // 10\n\n// 可以调用函数\nfunction fn(a = getValue()) { }"
          },
          {
            "title": "解构默认值",
            "code": "function fn({ x = 0, y = 0 } = {}) {\n  return x + y;\n}\n\nfn();              // 0\nfn({ x: 1 });      // 1\nfn({ x: 1, y: 2 }); // 3"
          }
        ]
      },
      "source": "默认参数"
    },
    {
      "difficulty": "medium",
      "tags": ["arguments"],
      "question": "arguments对象有什么特点？",
      "options": [
        "类数组对象，包含所有实参，箭头函数中不可用",
        "是真正的数组",
        "所有函数都有",
        "只在严格模式"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "arguments对象：",
        "sections": [
          {
            "title": "基本使用",
            "code": "function sum() {\n  console.log(arguments.length);\n  console.log(arguments[0]);\n  console.log(Array.isArray(arguments)); // false\n}\n\nsum(1, 2, 3);\n// 输出: 3, 1, false"
          },
          {
            "title": "转换为数组",
            "code": "function fn() {\n  // ES5\n  const args = Array.prototype.slice.call(arguments);\n  \n  // ES6\n  const args = Array.from(arguments);\n  const args = [...arguments];\n  \n  return args;\n}"
          },
          {
            "title": "箭头函数无arguments",
            "code": "const fn = () => {\n  console.log(arguments); // ReferenceError\n};\n\n// 使用剩余参数\nconst fn = (...args) => {\n  console.log(args); // 真正的数组\n};"
          },
          {
            "title": "与形参的关系",
            "code": "// 非严格模式：同步\nfunction fn(a) {\n  arguments[0] = 10;\n  console.log(a); // 10\n}\n\n// 严格模式：不同步\n'use strict';\nfunction fn(a) {\n  arguments[0] = 10;\n  console.log(a); // 原值\n}"
          }
        ]
      },
      "source": "arguments"
    },
    {
      "difficulty": "medium",
      "tags": ["剩余参数"],
      "question": "剩余参数（...rest）与arguments有什么区别？",
      "options": [
        "剩余参数是真数组，只包含未命名参数，箭头函数可用",
        "完全相同",
        "剩余参数性能更差",
        "arguments更好"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "剩余参数 vs arguments：",
        "sections": [
          {
            "title": "剩余参数",
            "code": "function sum(...numbers) {\n  console.log(Array.isArray(numbers)); // true\n  return numbers.reduce((a, b) => a + b, 0);\n}\n\nsum(1, 2, 3); // 6"
          },
          {
            "title": "只包含剩余参数",
            "code": "function fn(a, b, ...rest) {\n  console.log(a);    // 1\n  console.log(b);    // 2\n  console.log(rest); // [3, 4, 5]\n}\n\nfn(1, 2, 3, 4, 5);"
          },
          {
            "title": "箭头函数中使用",
            "code": "const sum = (...args) => {\n  return args.reduce((a, b) => a + b);\n};\n\nsum(1, 2, 3); // 6"
          },
          {
            "title": "对比",
            "points": [
              "剩余参数是真数组，arguments是类数组",
              "剩余参数只包含未命名参数",
              "剩余参数可在箭头函数中使用",
              "剩余参数必须是最后一个参数"
            ]
          }
        ]
      },
      "source": "剩余参数"
    },
    {
      "difficulty": "medium",
      "tags": ["返回值"],
      "question": "函数没有return语句时返回什么？",
      "options": [
        "返回undefined",
        "返回null",
        "报错",
        "返回0"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "函数返回值：",
        "sections": [
          {
            "title": "默认返回undefined",
            "code": "function fn() {\n  // 没有return\n}\n\nconsole.log(fn()); // undefined\n\n// 空return也返回undefined\nfunction fn2() {\n  return;\n}\n\nconsole.log(fn2()); // undefined"
          },
          {
            "title": "多个return",
            "code": "function abs(x) {\n  if (x >= 0) {\n    return x;\n  }\n  return -x;\n}\n\n// 执行到第一个return就结束"
          },
          {
            "title": "return后的代码不执行",
            "code": "function fn() {\n  return 1;\n  console.log('不会执行');\n}\n\nfn(); // 1"
          },
          {
            "title": "构造函数的特殊性",
            "code": "function Person(name) {\n  this.name = name;\n  // 没有return，返回this\n}\n\nconst p = new Person('John');\nconsole.log(p.name); // 'John'\n\n// 显式返回对象\nfunction Person2(name) {\n  this.name = name;\n  return { age: 18 }; // 返回这个对象\n}\n\nconst p2 = new Person2('John');\nconsole.log(p2.name); // undefined\nconsole.log(p2.age);  // 18"
          }
        ]
      },
      "source": "返回值"
    },
    {
      "difficulty": "medium",
      "tags": ["函数提升"],
      "question": "函数声明和函数表达式的提升有什么区别？",
      "options": [
        "函数声明整体提升，函数表达式只提升变量不提升赋值",
        "都会提升",
        "都不提升",
        "没有区别"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "函数提升：",
        "sections": [
          {
            "title": "函数声明提升",
            "code": "console.log(add(1, 2)); // 3\n\nfunction add(a, b) {\n  return a + b;\n}\n\n// 等价于\nfunction add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(1, 2)); // 3"
          },
          {
            "title": "函数表达式不提升",
            "code": "console.log(add(1, 2)); // TypeError: add is not a function\n\nvar add = function(a, b) {\n  return a + b;\n};\n\n// 等价于\nvar add; // 提升\nconsole.log(add(1, 2)); // add是undefined\nadd = function(a, b) {\n  return a + b;\n};"
          },
          {
            "title": "let/const函数表达式",
            "code": "console.log(add(1, 2)); // ReferenceError\n\nconst add = function(a, b) {\n  return a + b;\n};\n\n// 存在TDZ"
          },
          {
            "title": "函数声明优先级更高",
            "code": "var foo = 1;\nfunction foo() {}\nconsole.log(typeof foo); // 'number'\n\n// 函数声明先提升，后被变量赋值覆盖"
          }
        ]
      },
      "source": "函数提升"
    },
    {
      "difficulty": "hard",
      "tags": ["高阶函数"],
      "question": "什么是高阶函数？有什么应用？",
      "options": [
        "接受函数作为参数或返回函数的函数，用于回调、柯里化、函数组合等",
        "复杂的函数",
        "嵌套函数",
        "性能更好的函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "高阶函数：",
        "sections": [
          {
            "title": "接受函数作为参数",
            "code": "// 数组方法\n[1, 2, 3].map(x => x * 2);\n[1, 2, 3].filter(x => x > 1);\n\n// 自定义高阶函数\nfunction repeat(n, action) {\n  for (let i = 0; i < n; i++) {\n    action(i);\n  }\n}\n\nrepeat(3, console.log);\n// 输出: 0, 1, 2"
          },
          {
            "title": "返回函数",
            "code": "// 函数工厂\nfunction multiplier(factor) {\n  return function(x) {\n    return x * factor;\n  };\n}\n\nconst double = multiplier(2);\nconst triple = multiplier(3);\n\nconsole.log(double(5)); // 10\nconsole.log(triple(5)); // 15"
          },
          {
            "title": "柯里化",
            "code": "function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) {\n      return fn.apply(this, args);\n    }\n    return function(...args2) {\n      return curried.apply(this, args.concat(args2));\n    };\n  };\n}\n\nfunction add(a, b, c) {\n  return a + b + c;\n}\n\nconst curriedAdd = curry(add);\nconsole.log(curriedAdd(1)(2)(3)); // 6\nconsole.log(curriedAdd(1, 2)(3)); // 6"
          },
          {
            "title": "函数组合",
            "code": "const compose = (...fns) => x => \n  fns.reduceRight((v, f) => f(v), x);\n\nconst addOne = x => x + 1;\nconst double = x => x * 2;\nconst square = x => x * x;\n\nconst calc = compose(square, double, addOne);\nconsole.log(calc(2)); // ((2+1)*2)^2 = 36"
          }
        ]
      },
      "source": "高阶函数"
    },
    {
      "difficulty": "hard",
      "tags": ["纯函数"],
      "question": "什么是纯函数？有什么优势？",
      "options": [
        "相同输入总是返回相同输出，无副作用，便于测试和优化",
        "没有return的函数",
        "只能有一个参数",
        "性能更好的函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "纯函数（Pure Function）：",
        "sections": [
          {
            "title": "纯函数特征",
            "points": [
              "相同输入总是返回相同输出",
              "不产生副作用（不修改外部状态）",
              "不依赖外部状态"
            ]
          },
          {
            "title": "纯函数示例",
            "code": "// 纯函数\nfunction add(a, b) {\n  return a + b;\n}\n\nfunction double(arr) {\n  return arr.map(x => x * 2);\n}\n\n// 不是纯函数\nlet count = 0;\nfunction increment() {\n  count++; // 修改外部状态\n  return count;\n}\n\nfunction addToArray(arr, item) {\n  arr.push(item); // 修改参数\n  return arr;\n}"
          },
          {
            "title": "纯函数的优势",
            "code": "// 1. 易于测试\nfunction add(a, b) {\n  return a + b;\n}\nassert(add(1, 2) === 3);\n\n// 2. 可缓存（记忆化）\nfunction memoize(fn) {\n  const cache = {};\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (!(key in cache)) {\n      cache[key] = fn(...args);\n    }\n    return cache[key];\n  };\n}\n\nconst expensiveCalc = memoize((n) => {\n  // 复杂计算\n  return n * n;\n});\n\n// 3. 并行执行\n// 纯函数没有竞态条件，可安全并行\n\n// 4. 易于推理和调试\n// 不依赖外部状态，行为可预测"
          },
          {
            "title": "转换为纯函数",
            "code": "// 不纯\nconst cart = [];\nfunction addToCart(item) {\n  cart.push(item);\n  return cart;\n}\n\n// 纯函数版本\nfunction addToCart(cart, item) {\n  return [...cart, item];\n}\n\nconst cart = [];\nconst newCart = addToCart(cart, 'apple');\n// cart仍是[]，newCart是['apple']"
          }
        ]
      },
      "source": "纯函数"
    },
    {
      "difficulty": "hard",
      "tags": ["递归"],
      "question": "递归函数的关键要素是什么？如何优化？",
      "options": [
        "基准条件（终止条件）和递归调用，可用尾递归优化",
        "只需要调用自己",
        "不需要终止条件",
        "无法优化"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "递归函数：",
        "sections": [
          {
            "title": "基本递归",
            "code": "function factorial(n) {\n  // 基准条件\n  if (n <= 1) return 1;\n  \n  // 递归调用\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5)); // 120\n\n// 执行过程：\n// factorial(5)\n// 5 * factorial(4)\n// 5 * (4 * factorial(3))\n// 5 * (4 * (3 * factorial(2)))\n// 5 * (4 * (3 * (2 * factorial(1))))\n// 5 * (4 * (3 * (2 * 1)))\n// 120"
          },
          {
            "title": "尾递归优化",
            "code": "// 非尾递归\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1); // 乘法在递归之后\n}\n\n// 尾递归（递归是最后一个操作）\nfunction factorial(n, acc = 1) {\n  if (n <= 1) return acc;\n  return factorial(n - 1, n * acc); // 递归是最后操作\n}\n\n// 尾递归可以被优化为循环，节省栈空间\n// 注意：JavaScript引擎不一定实现了尾调用优化"
          },
          {
            "title": "递归转循环",
            "code": "// 递归版本\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\n// 循环版本（更安全）\nfunction factorial(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}"
          },
          {
            "title": "递归的问题",
            "code": "// 栈溢出\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nfactorial(100000); // RangeError: Maximum call stack size exceeded\n\n// 解决：\n// 1. 使用尾递归\n// 2. 转换为循环\n// 3. 使用蹦床函数（trampoline）"
          }
        ]
      },
      "source": "递归"
    },
    {
      "difficulty": "hard",
      "tags": ["IIFE"],
      "question": "立即执行函数表达式（IIFE）的作用是什么？",
      "options": [
        "创建私有作用域，避免污染全局，模块化封装",
        "提高性能",
        "没有作用",
        "只是语法糖"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "IIFE（Immediately Invoked Function Expression）：",
        "sections": [
          {
            "title": "基本语法",
            "code": "// 方式1\n(function() {\n  console.log('IIFE');\n})();\n\n// 方式2\n(function() {\n  console.log('IIFE');\n}());\n\n// 箭头函数\n(() => {\n  console.log('IIFE');\n})();\n\n// 其他写法\n!function(){}();\n+function(){}();\nvoid function(){}();"
          },
          {
            "title": "1. 创建私有作用域",
            "code": "(function() {\n  var privateVar = 'private';\n  function privateFunc() {}\n  \n  // privateVar和privateFunc只在函数内可见\n})();\n\nconsole.log(privateVar); // ReferenceError"
          },
          {
            "title": "2. 避免全局污染",
            "code": "// 不好\nvar name = 'Module';\nvar age = 18;\nfunction getName() {}\n\n// 好：使用IIFE\n(function() {\n  var name = 'Module';\n  var age = 18;\n  function getName() {}\n  \n  // 只暴露需要的部分\n  window.MyModule = {\n    getName: getName\n  };\n})();"
          },
          {
            "title": "3. 模块模式",
            "code": "const MyModule = (function() {\n  // 私有变量\n  let privateData = 0;\n  \n  // 私有函数\n  function privateMethod() {\n    return privateData++;\n  }\n  \n  // 公共接口\n  return {\n    increment() {\n      return privateMethod();\n    },\n    getValue() {\n      return privateData;\n    }\n  };\n})();\n\nMyModule.increment(); // 0\nMyModule.increment(); // 1\nMyModule.getValue();   // 2\nconsole.log(MyModule.privateData); // undefined"
          },
          {
            "title": "4. 解决循环闭包",
            "code": "// 问题\nfor (var i = 0; i < 3; i++) {\n  setTimeout(function() {\n    console.log(i);\n  }, 100);\n}\n// 输出: 3 3 3\n\n// IIFE解决\nfor (var i = 0; i < 3; i++) {\n  (function(j) {\n    setTimeout(function() {\n      console.log(j);\n    }, 100);\n  })(i);\n}\n// 输出: 0 1 2\n\n// ES6：用let更简单\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}"
          }
        ]
      },
      "source": "IIFE"
    }
  ],
  "navigation": {
    "prev": {
      "title": "错误处理",
      "url": "03-error-handling.html"
    },
    "next": {
      "title": "作用域",
      "url": "04-scope.html"
    }
  }
};
