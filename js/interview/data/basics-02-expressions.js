window.quizData_Basics02Expressions = {
  "config": {
    "title": "表达式",
    "icon": "📊",
    "description": "各种表达式的求值与应用",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    // 第1题：简单 - 单选题
    {
      "difficulty": "easy",
      "tags": ["基础概念"],
      "question": "表达式和语句的区别是什么？",
      "options": [
        "表达式有返回值，语句执行操作",
        "表达式和语句完全相同",
        "表达式不能单独使用",
        "语句总是有返回值"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "表达式 vs 语句",
        "sections": [
          {
            "title": "表达式（Expression）",
            "points": [
              "会产生一个值",
              "可以写在任何需要值的地方",
              "例如：1 + 2、函数调用、三元运算符"
            ],
            "code": "// 表达式示例\n1 + 2;              // 3\ngetValue();         // 返回值\nx > 0 ? 'yes' : 'no'; // 'yes' 或 'no'\n[1, 2, 3];          // 数组\n{ a: 1 };           // 对象（需要括号包裹）"
          },
          {
            "title": "语句（Statement）",
            "points": [
              "执行操作",
              "不产生值",
              "例如：if、for、while、声明语句"
            ],
            "code": "// 语句示例\nif (x > 0) { }      // 条件语句\nfor (let i = 0; i < 10; i++) { }  // 循环语句\nlet x = 1;          // 声明语句\nbreak;              // 跳转语句"
          },
          {
            "title": "区别演示",
            "code": "// 表达式可以赋值\nconst a = 1 + 2;  // ✓\nconst b = x > 0 ? 1 : 0;  // ✓\n\n// 语句不能赋值\nconst c = if (x > 0) { 1 };  // ✗ 语法错误\n\n// 表达式可以作为参数\nfunc(1 + 2);  // ✓\nfunc(if (x > 0) { });  // ✗"
          }
        ]
      },
      "source": "表达式与语句"
    },

    // 第2题：简单 - 判断题
    {
      "difficulty": "easy",
      "type": "true-false",
      "tags": ["短路求值"],
      "question": "&&运算符会对右侧表达式进行求值，即使左侧为false。",
      "options": ["正确", "错误"],
      "correctAnswer": "B",
      "explanation": {
        "title": "短路求值（Short-circuit Evaluation）",
        "content": "这是错误的。&&运算符采用短路求值，左侧为false时不会执行右侧。",
        "sections": [
          {
            "title": "&&短路求值",
            "code": "// 左侧为false，右侧不执行\nfalse && console.log('不会输出');  // 没有输出\n\n// 左侧为true，继续执行右侧\ntrue && console.log('会输出');  // 输出：会输出\n\n// 实际应用\nuser && user.getName();  // 安全调用\nlogged && redirectToHome();  // 条件执行"
          },
          {
            "title": "||短路求值",
            "code": "// 左侧为true，右侧不执行\ntrue || console.log('不会输出');  // 没有输出\n\n// 左侧为false，继续执行右侧\nfalse || console.log('会输出');  // 输出：会输出\n\n// 实际应用\nconst name = input || 'default';  // 默认值\nconst value = cache || fetchData();  // 优先使用缓存"
          },
          {
            "title": "性能优化",
            "code": "// 利用短路避免不必要的计算\nif (cheapCheck() && expensiveCheck()) {\n  // 先执行便宜的检查\n}\n\n// 避免错误\nif (obj && obj.method()) {\n  // 先检查obj是否存在\n}"
          }
        ]
      },
      "source": "短路求值"
    },

    // 第3题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["函数表达式"],
      "question": "以下哪些是函数表达式？",
      "options": [
        "const fn = function() {}",
        "const fn = () => {}",
        "(function() {})",
        "function fn() {}"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "函数表达式 vs 函数声明",
        "sections": [
          {
            "title": "函数表达式（选项A、B、C）",
            "code": "// 1. 匿名函数表达式\nconst fn = function() {};\n\n// 2. 箭头函数表达式\nconst fn = () => {};\n\n// 3. 立即执行函数表达式(IIFE)\n(function() {\n  console.log('立即执行');\n})();\n\n// 4. 命名函数表达式\nconst fn = function myFunc() {};\n\n// 特点：\n// - 函数是值，可以赋值\n// - 不会提升\n// - 可以作为参数传递"
          },
          {
            "title": "函数声明（选项D）",
            "code": "// 函数声明\nfunction fn() {}\n\n// 特点：\n// - 会提升到作用域顶部\n// - 必须有名字\n// - 可以在声明前调用\n\nfn();  // ✓ 可以调用\nfunction fn() {\n  console.log('提升了');\n}"
          },
          {
            "title": "区别演示",
            "code": "// 函数声明：提升\nsayHello();  // ✓ 'Hello'\nfunction sayHello() {\n  console.log('Hello');\n}\n\n// 函数表达式：不提升\nsayBye();  // ✗ ReferenceError\nconst sayBye = function() {\n  console.log('Bye');\n};"
          }
        ]
      },
      "source": "函数表达式"
    },

    // 第4题：中等 - 代码输出题
    {
      "difficulty": "medium",
      "type": "code-output",
      "tags": ["逗号表达式"],
      "question": "以下代码的输出是什么？",
      "code": "let x = 0;\nlet y = (x++, x++, x);\n\nconsole.log(x, y);",
      "options": [
        "2, 2",
        "1, 1",
        "2, 1",
        "3, 2"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "逗号表达式求值",
        "sections": [
          {
            "title": "执行过程",
            "code": "let x = 0;\nlet y = (x++, x++, x);\n\n// 1. x++ → x变为1，返回0\n// 2. x++ → x变为2，返回1\n// 3. x → 返回2\n// y = 2（最后一个表达式的值）\n\nconsole.log(x, y);  // 2, 2"
          },
          {
            "title": "关键点",
            "points": [
              "逗号表达式从左到右执行",
              "每个表达式都会求值",
              "返回最后一个表达式的值",
              "x++先返回值，再自增"
            ]
          },
          {
            "title": "对比++x",
            "code": "let a = 0;\nlet b = (++a, ++a, a);\n// 1. ++a → a变为1，返回1\n// 2. ++a → a变为2，返回2\n// 3. a → 返回2\nconsole.log(a, b);  // 2, 2"
          }
        ]
      },
      "source": "逗号表达式"
    },

    // 第5题：中等 - 代码补全题
    {
      "difficulty": "medium",
      "type": "code-completion",
      "tags": ["IIFE"],
      "question": "如何创建一个立即执行函数表达式(IIFE)？",
      "code": "______function() {\n  console.log('立即执行');\n})();",
      "options": [
        "(",
        "[",
        "{",
        "!"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "立即执行函数表达式(IIFE)",
        "sections": [
          {
            "title": "标准写法",
            "code": "// 方式1：括号包裹函数（推荐）\n(function() {\n  console.log('IIFE');\n})();\n\n// 方式2：括号包裹整体\n(function() {\n  console.log('IIFE');\n}());\n\n// 方式3：使用一元运算符\n!function() { }();\n+function() { }();\n-function() { }();\n~function() { }();\n\n// 方式4：使用void\nvoid function() { }();"
          },
          {
            "title": "IIFE的作用",
            "code": "// 1. 创建独立作用域\n(function() {\n  var secret = '私有变量';\n  // secret只在这里可见\n})();\nconsole.log(secret);  // ReferenceError\n\n// 2. 避免全局污染\n(function() {\n  var $ = 'my library';\n  // 不会影响全局的$\n})();\n\n// 3. 模块模式\nconst module = (function() {\n  let privateVar = 0;\n  return {\n    get: () => privateVar,\n    increment: () => privateVar++\n  };\n})();"
          },
          {
            "title": "现代替代方案",
            "code": "// ES6块级作用域\n{\n  let secret = '私有';\n}\n\n// ES6模块\n// module.js\nlet privateVar = 0;\nexport function increment() {\n  privateVar++;\n}"
          }
        ]
      },
      "source": "IIFE"
    },

    // 第6题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["对象字面量"],
      "question": "关于对象字面量表达式，以下说法正确的是？",
      "options": [
        "可以使用计算属性名",
        "可以使用方法简写",
        "可以使用属性简写",
        "属性名只能是字符串"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "对象字面量增强（ES6）",
        "sections": [
          {
            "title": "选项A - 计算属性名",
            "code": "// 使用[]包裹表达式作为属性名\nconst key = 'name';\nconst obj = {\n  [key]: 'Tom',\n  ['age' + '1']: 18,\n  [Symbol('id')]: 123\n};\n\nconsole.log(obj.name);  // 'Tom'\nconsole.log(obj.age1);  // 18"
          },
          {
            "title": "选项B - 方法简写",
            "code": "// ES6简写\nconst obj = {\n  sayHello() {\n    console.log('Hello');\n  }\n};\n\n// 等价于ES5\nconst obj = {\n  sayHello: function() {\n    console.log('Hello');\n  }\n};"
          },
          {
            "title": "选项C - 属性简写",
            "code": "const name = 'Tom';\nconst age = 18;\n\n// ES6简写\nconst user = { name, age };\n\n// 等价于ES5\nconst user = {\n  name: name,\n  age: age\n};\n\nconsole.log(user);  // { name: 'Tom', age: 18 }"
          },
          {
            "title": "选项D - 错误",
            "content": "属性名可以是字符串、数字或Symbol。",
            "code": "const obj = {\n  name: 'string key',\n  123: 'number key',\n  [Symbol('id')]: 'symbol key'\n};\n\nconsole.log(obj[123]);  // 'number key'\nconsole.log(obj['123']); // 'number key'（数字会转为字符串）"
          },
          {
            "title": "组合使用",
            "code": "const key = 'dynamic';\nconst value = 42;\n\nconst obj = {\n  // 普通属性\n  name: 'Tom',\n  // 属性简写\n  value,\n  // 计算属性\n  [key]: 'value',\n  // 方法简写\n  getValue() {\n    return this.value;\n  },\n  // getter/setter\n  get doubled() {\n    return this.value * 2;\n  }\n};"
          }
        ]
      },
      "source": "对象字面量"
    },

    // 第7题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["函数表达式", "提升"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(typeof fn1);\nconsole.log(typeof fn2);\n\nvar fn1 = function() {};\nfunction fn2() {}",
      "options": [
        "'undefined', 'function'",
        "'function', 'function'",
        "'undefined', 'undefined'",
        "'function', 'undefined'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "函数提升vs变量提升",
        "sections": [
          {
            "title": "代码等效于",
            "code": "// 函数声明提升到顶部\nfunction fn2() {}\n\n// var变量声明提升，但赋值不提升\nvar fn1;\n\nconsole.log(typeof fn1);  // 'undefined'（已声明未赋值）\nconsole.log(typeof fn2);  // 'function'（已定义）\n\n// 赋值在原位置\nfn1 = function() {};"
          },
          {
            "title": "关键区别",
            "points": [
              "函数声明：整体提升（包括函数体）",
              "函数表达式：只提升变量声明",
              "let/const：不会提升（暂时性死区）"
            ]
          },
          {
            "title": "各种情况对比",
            "code": "// 1. 函数声明：可以在声明前调用\nfn1();  // ✓ 'Hello'\nfunction fn1() {\n  console.log('Hello');\n}\n\n// 2. var函数表达式：不能在赋值前调用\nfn2();  // ✗ TypeError: fn2 is not a function\nvar fn2 = function() {\n  console.log('Hello');\n};\n\n// 3. let/const函数表达式：暂时性死区\nfn3();  // ✗ ReferenceError\nconst fn3 = function() {\n  console.log('Hello');\n};"
          },
          {
            "title": "最佳实践",
            "code": "// 推荐：使用const声明函数表达式\nconst greet = function() {\n  console.log('Hello');\n};\n\n// 或者：箭头函数\nconst greet = () => {\n  console.log('Hello');\n};\n\n// 函数声明用于需要提升的场景\nfunction init() {\n  // 初始化逻辑\n}"
          }
        ]
      },
      "source": "函数提升"
    },

    // 第8题：困难 - 多选题
    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["箭头函数"],
      "question": "箭头函数相比普通函数有哪些特点？",
      "options": [
        "没有自己的this，继承外层this",
        "没有arguments对象",
        "不能作为构造函数",
        "没有prototype属性"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "箭头函数的特点",
        "content": "所有选项都正确！箭头函数有多个重要限制。",
        "sections": [
          {
            "title": "选项A - 没有this",
            "code": "const obj = {\n  name: 'Tom',\n  // 普通函数：this指向obj\n  sayHello: function() {\n    console.log(this.name);  // 'Tom'\n  },\n  // 箭头函数：this继承外层\n  sayBye: () => {\n    console.log(this.name);  // undefined（this是全局对象）\n  }\n};\n\n// 回调函数中的应用\nclass Timer {\n  constructor() {\n    this.seconds = 0;\n    // 箭头函数保持this\n    setInterval(() => {\n      this.seconds++;  // this是Timer实例\n    }, 1000);\n  }\n}"
          },
          {
            "title": "选项B - 没有arguments",
            "code": "// 普通函数：有arguments\nfunction foo() {\n  console.log(arguments);  // [1, 2, 3]\n}\nfoo(1, 2, 3);\n\n// 箭头函数：没有arguments\nconst bar = () => {\n  console.log(arguments);  // ReferenceError\n};\n\n// 使用剩余参数代替\nconst bar = (...args) => {\n  console.log(args);  // [1, 2, 3]\n};\nbar(1, 2, 3);"
          },
          {
            "title": "选项C - 不能作为构造函数",
            "code": "// 普通函数：可以new\nfunction Person(name) {\n  this.name = name;\n}\nconst p = new Person('Tom');  // ✓\n\n// 箭头函数：不能new\nconst Person = (name) => {\n  this.name = name;\n};\nconst p = new Person('Tom');  // ✗ TypeError"
          },
          {
            "title": "选项D - 没有prototype",
            "code": "// 普通函数：有prototype\nfunction foo() {}\nconsole.log(foo.prototype);  // { constructor: foo }\n\n// 箭头函数：没有prototype\nconst bar = () => {};\nconsole.log(bar.prototype);  // undefined"
          },
          {
            "title": "使用场景",
            "code": "// ✓ 适合：简短的回调函数\n[1, 2, 3].map(x => x * 2);\n\n// ✓ 适合：需要保持this的场景\nsetTimeout(() => this.method(), 1000);\n\n// ✗ 不适合：对象方法\nconst obj = {\n  name: 'Tom',\n  sayHello: () => {\n    console.log(this.name);  // undefined\n  }\n};\n\n// ✗ 不适合：构造函数\nconst Person = (name) => {\n  this.name = name;  // 箭头函数没有this\n};"
          }
        ]
      },
      "source": "箭头函数"
    },

    // 第9题：困难 - 代码补全题
    {
      "difficulty": "hard",
      "type": "code-completion",
      "tags": ["void运算符"],
      "question": "void运算符的作用是什么？请补全代码。",
      "code": "const fn = () => ______  42;\n\nconsole.log(fn());  // undefined",
      "options": [
        "void",
        "return",
        "delete",
        "typeof"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "void运算符",
        "content": "void运算符会执行表达式，但总是返回undefined。",
        "sections": [
          {
            "title": "基本用法",
            "code": "void 0;           // undefined\nvoid 1 + 1;       // undefined\nvoid (1 + 1);     // undefined\nvoid function(){}(); // undefined\n\n// 箭头函数中\nconst fn = () => void 42;\nfn();  // undefined"
          },
          {
            "title": "实际应用",
            "code": "// 1. 确保返回undefined\nfunction foo() {\n  return void bar();  // 无论bar返回什么，foo都返回undefined\n}\n\n// 2. IIFE（不推荐）\nvoid function() {\n  console.log('IIFE');\n}();\n\n// 3. 阻止链接跳转（已过时）\n<a href=\"javascript:void(0)\">点击</a>\n\n// 现代写法：\n<a href=\"#\" onclick=\"handler(); return false;\">点击</a>"
          },
          {
            "title": "获取undefined",
            "code": "// void 0 是最短的获取undefined的方式\nconst undef = void 0;\n\n// 为什么不直接用undefined？\n// 因为undefined可以被重写（在旧浏览器中）\n(function() {\n  var undefined = 'not undefined';\n  console.log(undefined);  // 'not undefined'\n  console.log(void 0);     // undefined（可靠）\n})();"
          },
          {
            "title": "现代替代",
            "code": "// 现代JavaScript中，直接使用undefined\nconst value = undefined;\n\n// 或者不返回任何值\nfunction foo() {\n  // 不写return，默认返回undefined\n}"
          }
        ]
      },
      "source": "void运算符"
    },

    // 第10题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["表达式求值"],
      "question": "以下代码的输出是什么？",
      "code": "let a = 1;\nlet b = 2;\nlet c = (a++, b++, a + b);\n\nconsole.log(a, b, c);",
      "options": [
        "2, 3, 5",
        "1, 2, 3",
        "2, 3, 3",
        "1, 2, 5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "复杂的表达式求值",
        "sections": [
          {
            "title": "执行过程",
            "code": "let a = 1;\nlet b = 2;\nlet c = (a++, b++, a + b);\n\n// 逗号表达式从左到右执行：\n// 1. a++ → a变为2，返回1（后置++先返回再自增）\n// 2. b++ → b变为3，返回2\n// 3. a + b → 2 + 3 = 5\n// c = 5（最后一个表达式的值）\n\nconsole.log(a, b, c);  // 2, 3, 5"
          },
          {
            "title": "关键点",
            "points": [
              "逗号表达式：执行所有，返回最后一个",
              "a++：后置自增，先返回原值，再自增",
              "++a：前置自增，先自增，再返回新值",
              "最终a=2, b=3, c=5"
            ]
          },
          {
            "title": "对比前置自增",
            "code": "let a = 1;\nlet b = 2;\nlet c = (++a, ++b, a + b);\n// 1. ++a → a变为2，返回2\n// 2. ++b → b变为3，返回3\n// 3. a + b → 2 + 3 = 5\nconsole.log(a, b, c);  // 2, 3, 5（结果相同）"
          },
          {
            "title": "避免混淆",
            "code": "// 不推荐：逗号表达式容易混淆\nlet c = (a++, b++, a + b);\n\n// 推荐：分步执行\na++;\nb++;\nlet c = a + b;"
          }
        ]
      },
      "source": "表达式求值"
    }
  ],
  "navigation": {
    "prev": {
      "title": "运算符",
      "url": "02-operators.html"
    },
    "next": {
      "title": "条件语句",
      "url": "03-conditionals.html"
    }
  }
};
