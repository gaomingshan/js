window.quizData_Basics01Datatypes = {
  "config": {
    "title": "数据类型",
    "icon": "🔢",
    "description": "JavaScript的8种数据类型详解",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    // 第1题：简单 - 单选题
    {
      "difficulty": "easy",
      "tags": ["基础概念"],
      "question": "JavaScript有多少种数据类型？",
      "options": [
        "8种（7种基本类型 + Object）",
        "6种",
        "5种",
        "9种"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript的8种数据类型",
        "sections": [
          {
            "title": "7种基本类型（Primitive）",
            "points": [
              "String（字符串）",
              "Number（数字）",
              "Boolean（布尔值）",
              "Undefined",
              "Null",
              "Symbol（ES6新增）",
              "BigInt（ES2020新增）"
            ]
          },
          {
            "title": "1种引用类型",
            "points": [
              "Object（对象）",
              "包括：Object、Array、Function、Date、RegExp等"
            ]
          },
          {
            "title": "示例",
            "code": "// 基本类型\nconst str = 'hello';        // String\nconst num = 42;             // Number\nconst bool = true;          // Boolean\nconst undef = undefined;    // Undefined\nconst nul = null;           // Null\nconst sym = Symbol('id');   // Symbol\nconst big = 9007199254740991n; // BigInt\n\n// 引用类型\nconst obj = {};             // Object\nconst arr = [];             // Array（是Object的子类型）\nconst fn = function() {};   // Function（也是Object）"
          }
        ]
      },
      "source": "数据类型"
    },

    // 第2题：简单 - 判断题
    {
      "difficulty": "easy",
      "type": "true-false",
      "tags": ["typeof"],
      "question": "typeof null 的结果是 'null'。",
      "options": ["正确", "错误"],
      "correctAnswer": "B",
      "explanation": {
        "title": "typeof null的历史bug",
        "content": "这是错误的。typeof null 返回 'object'，这是JavaScript的一个历史遗留bug。",
        "sections": [
          {
            "title": "typeof的结果",
            "code": "typeof null          // 'object' ❌（bug）\ntypeof undefined     // 'undefined'\ntypeof true          // 'boolean'\ntypeof 42            // 'number'\ntypeof 'hello'       // 'string'\ntypeof Symbol()      // 'symbol'\ntypeof 10n           // 'bigint'\ntypeof {}            // 'object'\ntypeof []            // 'object'\ntypeof function(){}  // 'function'"
          },
          {
            "title": "为什么是bug？",
            "content": "在JavaScript的早期版本中，值的类型标签存储在32位单元的低位。null被表示为全0（0x00），而对象的类型标签也是0，导致typeof null返回'object'。"
          },
          {
            "title": "正确检测null",
            "code": "// 方法1：直接比较\nif (value === null) {\n  console.log('是null');\n}\n\n// 方法2：组合判断\nif (typeof value === 'object' && value === null) {\n  console.log('是null');\n}"
          }
        ]
      },
      "source": "typeof"
    },

    // 第3题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["基本类型", "引用类型"],
      "question": "以下哪些是基本类型（Primitive Type）？",
      "options": [
        "String",
        "Number",
        "Array",
        "Symbol"
      ],
      "correctAnswer": ["A", "B", "D"],
      "explanation": {
        "title": "基本类型 vs 引用类型",
        "sections": [
          {
            "title": "基本类型（选项A、B、D正确）",
            "points": [
              "String、Number、Boolean、Undefined、Null、Symbol、BigInt",
              "存储在栈内存",
              "按值访问",
              "不可变（immutable）"
            ]
          },
          {
            "title": "Array是引用类型（选项C错误）",
            "content": "Array是Object的子类型，属于引用类型。",
            "code": "const arr = [1, 2, 3];\ntypeof arr;  // 'object'\nArray.isArray(arr);  // true\narr instanceof Object;  // true"
          },
          {
            "title": "区别演示",
            "code": "// 基本类型：按值传递\nlet a = 10;\nlet b = a;\nb = 20;\nconsole.log(a);  // 10（不受影响）\n\n// 引用类型：按引用传递\nlet obj1 = { x: 10 };\nlet obj2 = obj1;\nobj2.x = 20;\nconsole.log(obj1.x);  // 20（受影响）"
          }
        ]
      },
      "source": "数据类型分类"
    },

    // 第4题：中等 - 代码输出题
    {
      "difficulty": "medium",
      "type": "code-output",
      "tags": ["类型判断"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(typeof typeof 1);",
      "options": [
        "'string'",
        "'number'",
        "'undefined'",
        "'object'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "typeof的嵌套使用",
        "sections": [
          {
            "title": "执行顺序",
            "code": "// 从内向外执行\ntypeof 1          // 'number'\ntypeof 'number'   // 'string'\n\n// 所以结果是 'string'"
          },
          {
            "title": "原理",
            "content": "typeof操作符返回的结果总是一个字符串，表示数据类型的名称。所以typeof typeof x的结果一定是'string'。"
          },
          {
            "title": "更多示例",
            "code": "typeof typeof true;      // 'string'\ntypeof typeof {};        // 'string'\ntypeof typeof null;      // 'string'\ntypeof typeof undefined; // 'string'\n\n// 因为：\ntypeof true === 'boolean'  // 第一层\ntypeof 'boolean' === 'string'  // 第二层"
          }
        ]
      },
      "source": "typeof"
    },

    // 第5题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["Symbol"],
      "question": "关于Symbol，以下说法正确的是？",
      "options": [
        "Symbol是ES6引入的新的基本类型",
        "每个Symbol值都是唯一的",
        "Symbol可以用作对象的属性名",
        "Symbol可以被隐式转换为字符串"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "Symbol类型详解",
        "sections": [
          {
            "title": "选项A、B - 正确",
            "code": "// 每个Symbol都是唯一的\nconst sym1 = Symbol('desc');\nconst sym2 = Symbol('desc');\n\nconsole.log(sym1 === sym2);  // false\nconsole.log(typeof sym1);    // 'symbol'"
          },
          {
            "title": "选项C - 正确",
            "code": "// Symbol作为属性名\nconst id = Symbol('id');\nconst obj = {\n  [id]: 123,\n  name: 'Tom'\n};\n\nconsole.log(obj[id]);  // 123\n\n// Symbol属性不会被常规方法遍历\nfor (let key in obj) {\n  console.log(key);  // 只输出 'name'\n}\n\nObject.keys(obj);  // ['name']\nObject.getOwnPropertySymbols(obj);  // [Symbol(id)]"
          },
          {
            "title": "选项D - 错误",
            "content": "Symbol不能被隐式转换为字符串，必须显式调用toString()。",
            "code": "const sym = Symbol('test');\n\n// 错误：不能隐式转换\nconsole.log('Symbol: ' + sym);  // TypeError\n\n// 正确：显式转换\nconsole.log('Symbol: ' + sym.toString());  // 'Symbol: Symbol(test)'\nconsole.log('Symbol: ' + String(sym));     // 'Symbol: Symbol(test)'"
          },
          {
            "title": "Symbol的应用",
            "code": "// 1. 防止属性名冲突\nconst id = Symbol('id');\nobj[id] = 123;\n\n// 2. 定义类的私有属性\nconst _count = Symbol('count');\nclass Counter {\n  constructor() {\n    this[_count] = 0;\n  }\n  increment() {\n    this[_count]++;\n  }\n}\n\n// 3. 定义常量\nconst Color = {\n  RED: Symbol('red'),\n  GREEN: Symbol('green'),\n  BLUE: Symbol('blue')\n};"
          }
        ]
      },
      "source": "Symbol"
    },

    // 第6题：中等 - 代码补全题
    {
      "difficulty": "medium",
      "type": "code-completion",
      "tags": ["BigInt"],
      "question": "如何创建一个BigInt类型的数？请补全代码。",
      "code": "const big1 = ______;\nconst big2 = BigInt(9007199254740991);\n\nconsole.log(typeof big1);  // 'bigint'",
      "options": [
        "9007199254740991n",
        "9007199254740991",
        "BigInt('9007199254740991')",
        "Number(9007199254740991)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "BigInt的创建方式",
        "sections": [
          {
            "title": "两种创建方式",
            "code": "// 方式1：数字字面量后加n（推荐）\nconst big1 = 9007199254740991n;\n\n// 方式2：使用BigInt()函数\nconst big2 = BigInt(9007199254740991);\nconst big3 = BigInt('9007199254740991');\n\nconsole.log(typeof big1);  // 'bigint'"
          },
          {
            "title": "为什么需要BigInt？",
            "content": "Number类型只能安全表示-(2^53-1)到2^53-1之间的整数，超出范围会丢失精度。",
            "code": "// Number的精度限制\nconst maxSafeInt = Number.MAX_SAFE_INTEGER;  // 9007199254740991\nconsole.log(maxSafeInt + 1);  // 9007199254740992 ✓\nconsole.log(maxSafeInt + 2);  // 9007199254740992 ✗（应该是993）\n\n// BigInt可以表示任意大的整数\nconst bigInt = 9007199254740991n;\nconsole.log(bigInt + 1n);  // 9007199254740992n ✓\nconsole.log(bigInt + 2n);  // 9007199254740993n ✓"
          },
          {
            "title": "注意事项",
            "code": "// 1. BigInt不能与Number混合运算\nconst big = 10n;\nconst num = 10;\nconsole.log(big + num);  // TypeError\nconsole.log(big + BigInt(num));  // 20n ✓\n\n// 2. BigInt不能使用Math对象的方法\nMath.sqrt(4n);  // TypeError\n\n// 3. BigInt不能用于JSON.stringify\nJSON.stringify({ value: 10n });  // TypeError\n\n// 4. 比较运算可以跨类型\n10n === 10;   // false（严格相等）\n10n == 10;    // true（宽松相等）\n10n < 20;     // true"
          }
        ]
      },
      "source": "BigInt"
    },

    // 第7题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["类型转换", "隐式转换"],
      "question": "以下代码的输出是什么？",
      "code": "console.log([] + []);\nconsole.log([] + {});\nconsole.log({} + []);\nconsole.log({} + {});",
      "options": [
        "'', '[object Object]', '[object Object]', '[object Object][object Object]'",
        "'', '[object Object]', '0', 'NaN'",
        "'[]', '[object Object]', '0', '[object Object][object Object]'",
        "'undefined', 'undefined', 'undefined', 'undefined'"
      ],
      "correctAnswer": "B",
      "explanation": {
        "title": "对象和数组的加法运算",
        "sections": [
          {
            "title": "转换规则",
            "points": [
              "+ 运算符会将操作数转换为基本类型",
              "对象转换：先调用valueOf()，如果结果仍是对象，再调用toString()",
              "数组的toString()：等同于join(',')",
              "对象的toString()：返回'[object Object]'"
            ]
          },
          {
            "title": "逐个分析",
            "code": "// [] + []\n[].toString();  // ''\n'' + '';        // '' ✓\n\n// [] + {}\n[].toString();  // ''\n({}).toString(); // '[object Object]'\n'' + '[object Object]';  // '[object Object]' ✓\n\n// {} + []\n// 这里{}被解释为代码块，而不是对象！\n// 实际执行的是：+[]\n+[];  // 0 ✓\n\n// {} + {}\n// 同理，第一个{}是代码块\n// 实际执行：+{}\n+{};  // NaN ✓"
          },
          {
            "title": "避免歧义",
            "code": "// 使用括号消除歧义\nconsole.log(({}) + []);   // '[object Object]'\nconsole.log(({}) + ({})); // '[object Object][object Object]'\n\n// 或者赋值后再运算\nconst obj = {};\nconst arr = [];\nconsole.log(obj + arr);   // '[object Object]'"
          },
          {
            "title": "实际应用",
            "code": "// 数组转字符串\n[1, 2, 3] + '';  // '1,2,3'\n\n// 对象转字符串\nconst obj = { toString() { return 'custom'; } };\nobj + '';  // 'custom'\n\n// 快速转换为数字\n+'42';   // 42\n+[];     // 0\n+[5];    // 5\n+[1,2];  // NaN"
          }
        ]
      },
      "source": "类型转换"
    },

    // 第8题：困难 - 多选题
    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["包装对象", "自动装箱"],
      "question": "关于包装对象，以下说法正确的是？",
      "options": [
        "基本类型值可以调用方法，是因为自动装箱",
        "String、Number、Boolean都有对应的包装对象",
        "包装对象和基本类型值是完全等价的",
        "使用new String()创建的是包装对象"
      ],
      "correctAnswer": ["A", "B", "D"],
      "explanation": {
        "title": "包装对象与自动装箱",
        "sections": [
          {
            "title": "选项A、B - 正确",
            "content": "基本类型没有属性和方法，但可以调用方法，是因为JavaScript引擎会自动装箱。",
            "code": "// 自动装箱\nconst str = 'hello';\nstr.toUpperCase();  // 'HELLO'\n\n// 等价于：\nconst temp = new String('hello');  // 临时创建包装对象\ntemp.toUpperCase();  // 调用方法\n// temp被销毁\n\n// 所以无法给基本类型添加属性\nstr.foo = 'bar';\nconsole.log(str.foo);  // undefined（临时对象已销毁）"
          },
          {
            "title": "选项C - 错误",
            "content": "包装对象和基本类型值不是完全等价的。",
            "code": "const str = 'hello';           // 基本类型\nconst obj = new String('hello'); // 包装对象\n\nconsole.log(typeof str);  // 'string'\nconsole.log(typeof obj);  // 'object'\n\nconsole.log(str == obj);   // true（值相等）\nconsole.log(str === obj);  // false（类型不同）\n\n// 布尔值转换\nif (str) { }  // true（非空字符串）\nif (obj) { }  // true（对象总是true）\n\nconst falsy = new Boolean(false);\nif (falsy) {\n  console.log('执行');  // 会执行！对象总是truthy\n}"
          },
          {
            "title": "选项D - 正确",
            "code": "// 使用new创建包装对象\nconst str1 = new String('hello');  // 对象\nconst str2 = String('hello');      // 基本类型（类型转换）\n\nconsole.log(typeof str1);  // 'object'\nconsole.log(typeof str2);  // 'string'\n\n// 推荐：不要使用new创建包装对象\nconst num = new Number(42);  // ✗ 不推荐\nconst num = 42;              // ✓ 推荐"
          },
          {
            "title": "自动装箱的三种包装类型",
            "code": "// String包装对象\nconst str = 'test';\nstr.length;  // 4（自动装箱）\nstr.substring(0, 2);  // 'te'\n\n// Number包装对象\nconst num = 42;\nnum.toFixed(2);  // '42.00'\nnum.toString(2);  // '101010'（二进制）\n\n// Boolean包装对象\nconst bool = true;\nbool.toString();  // 'true'\n\n// 注意：null和undefined没有包装对象\nnull.toString();  // TypeError\nundefined.toString();  // TypeError"
          }
        ]
      },
      "source": "包装对象"
    },

    // 第9题：困难 - 代码补全题
    {
      "difficulty": "hard",
      "type": "code-completion",
      "tags": ["类型检测"],
      "question": "如何准确判断一个值的类型？请补全最可靠的方法。",
      "code": "function getType(value) {\n  return ______.call(value).slice(8, -1).toLowerCase();\n}\n\ngetType([]);        // 'array'\ngetType({});        // 'object'\ngetType(null);      // 'null'\ngetType(undefined); // 'undefined'",
      "options": [
        "Object.prototype.toString",
        "typeof",
        "value.constructor",
        "value.toString"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "准确的类型检测",
        "sections": [
          {
            "title": "Object.prototype.toString（最准确）",
            "code": "// 这是最可靠的类型检测方法\nfunction getType(value) {\n  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();\n}\n\ngetType([]);           // 'array'\ngetType({});           // 'object'\ngetType(null);         // 'null'\ngetType(undefined);    // 'undefined'\ngetType(42);           // 'number'\ngetType('hello');      // 'string'\ngetType(true);         // 'boolean'\ngetType(Symbol());     // 'symbol'\ngetType(10n);          // 'bigint'\ngetType(new Date());   // 'date'\ngetType(/regex/);      // 'regexp'\ngetType(function(){}); // 'function'"
          },
          {
            "title": "为什么要用call？",
            "code": "// Object.prototype.toString 返回 [object Type]\nObject.prototype.toString.call([]);  // '[object Array]'\n\n// 如果直接调用，会被覆盖\n[].toString();  // '' （Array重写了toString）\n\n// 必须用call指定this\nconst toString = Object.prototype.toString;\ntoString.call([]);  // '[object Array]' ✓"
          },
          {
            "title": "其他方法的局限性",
            "code": "// 1. typeof的局限\ntypeof null;  // 'object' ❌\ntypeof [];    // 'object' ❌（无法区分数组）\n\n// 2. instanceof的局限\n[] instanceof Array;  // true ✓\n// 但跨iframe会失效\n\n// 3. constructor的局限\n[].constructor === Array;  // true\nnull.constructor;  // TypeError ❌\n// 可以被修改\n\n// 4. Array.isArray（专门检测数组）\nArray.isArray([]);  // true ✓\nArray.isArray({});  // false"
          },
          {
            "title": "封装工具函数",
            "code": "// 完整的类型检测工具\nconst typeUtils = {\n  getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();\n  },\n  isArray(value) {\n    return this.getType(value) === 'array';\n  },\n  isObject(value) {\n    return this.getType(value) === 'object';\n  },\n  isNull(value) {\n    return value === null;\n  },\n  isUndefined(value) {\n    return value === undefined;\n  },\n  isFunction(value) {\n    return typeof value === 'function';\n  }\n};"
          }
        ]
      },
      "source": "类型检测"
    },

    // 第10题：困难 - 多选题
    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["null vs undefined"],
      "question": "关于null和undefined的区别，以下说法正确的是？",
      "options": [
        "undefined表示变量未定义，null表示空值",
        "undefined是基本类型，null也是基本类型",
        "undefined == null 为true，undefined === null 为false",
        "Number(undefined)为NaN，Number(null)为0"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "null vs undefined详解",
        "content": "所有选项都正确！这是两个容易混淆的特殊值。",
        "sections": [
          {
            "title": "语义区别（选项A）",
            "points": [
              "undefined：变量已声明但未赋值，或对象属性不存在",
              "null：表示\"空对象指针\"，是一个明确的空值",
              "undefined是系统级的，null是程序级的"
            ]
          },
          {
            "title": "类型（选项B）",
            "code": "typeof undefined;  // 'undefined'\ntypeof null;       // 'object'（历史bug）\n\n// 但它们都是基本类型\nundefined instanceof Object;  // false\nnull instanceof Object;       // false"
          },
          {
            "title": "相等性比较（选项C）",
            "code": "undefined == null;   // true（宽松相等）\nundefined === null;  // false（严格相等）\n\n// undefined和null只与自身和对方相等\nundefined == undefined;  // true\nundefined == null;       // true\nundefined == 0;          // false\nundefined == false;      // false\nundefined == '';         // false"
          },
          {
            "title": "数值转换（选项D）",
            "code": "Number(undefined);  // NaN\nNumber(null);       // 0\n\n+undefined;  // NaN\n+null;       // 0\n\n// 在算术运算中\n1 + undefined;  // NaN\n1 + null;       // 1"
          },
          {
            "title": "使用场景",
            "code": "// undefined的出现场景\nlet x;  // 声明但未赋值\nconsole.log(x);  // undefined\n\nconst obj = {};\nconsole.log(obj.foo);  // undefined\n\nfunction test() {}\nconst result = test();  // undefined\n\nfunction foo(a) {\n  console.log(a);  // undefined（参数未传）\n}\nfoo();\n\n// null的使用场景\nlet data = null;  // 明确表示空值\nconst element = document.getElementById('notexist');  // null\n\n// 最佳实践\nlet user = null;  // 准备保存用户对象，现在为空\nif (user === null) {\n  user = { name: 'Tom' };  // 赋值\n}"
          }
        ]
      },
      "source": "null vs undefined"
    }
  ],
  "navigation": {
    "prev": {
      "title": "变量声明",
      "url": "01-variables.html"
    },
    "next": {
      "title": "类型转换",
      "url": "01-type-conversion.html"
    }
  }
};
