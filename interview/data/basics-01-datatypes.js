window.quizData_Basics01Datatypes = {
  "config": {
    "title": "数据类型",
    "icon": "🎲",
    "description": "掌握JavaScript的基本数据类型与引用类型",
    "primaryColor": "#4facfe",
    "bgGradient": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["基本类型"],
      "question": "JavaScript有哪些基本数据类型（原始类型）？",
      "options": [
        "Number、String、Boolean、Null、Undefined、Symbol、BigInt",
        "Number、String、Boolean、Object、Array",
        "只有Number、String、Boolean",
        "Int、Float、String、Boolean"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript 7种基本类型：",
        "sections": [
          {
            "title": "基本类型（Primitive Types）",
            "points": [
              "Number：数字（包括整数和浮点数）",
              "String：字符串",
              "Boolean：布尔值（true/false）",
              "Null：空值",
              "Undefined：未定义",
              "Symbol：唯一标识符（ES6）",
              "BigInt：大整数（ES2020）"
            ]
          },
          {
            "title": "引用类型",
            "points": [
              "Object：对象（包括普通对象、数组、函数、日期等）"
            ]
          },
          {
            "title": "示例",
            "code": "// 基本类型\nconst num = 42;\nconst str = 'hello';\nconst bool = true;\nconst n = null;\nconst u = undefined;\nconst sym = Symbol('id');\nconst big = 9007199254740991n;\n\n// 引用类型\nconst obj = {};\nconst arr = [];\nconst func = function() {};"
          }
        ]
      },
      "source": "数据类型"
    },
    {
      "difficulty": "easy",
      "tags": ["typeof"],
      "question": "typeof操作符有哪些返回值？",
      "options": [
        "'undefined'、'boolean'、'number'、'string'、'symbol'、'bigint'、'function'、'object'",
        "只返回'object'",
        "返回具体的类型名",
        "返回类的构造函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "typeof返回值：",
        "sections": [
          {
            "title": "所有可能的返回值",
            "code": "typeof undefined; // 'undefined'\ntypeof true; // 'boolean'\ntypeof 42; // 'number'\ntypeof 'hello'; // 'string'\ntypeof Symbol(); // 'symbol'\ntypeof 123n; // 'bigint'\ntypeof function(){}; // 'function'\ntypeof {}; // 'object'\ntypeof []; // 'object'\ntypeof null; // 'object' (历史遗留bug)"
          },
          {
            "title": "特殊情况",
            "points": [
              "typeof null返回'object'是JavaScript的bug",
              "typeof数组返回'object'",
              "typeof函数返回'function'而非'object'"
            ]
          }
        ]
      },
      "source": "typeof"
    },
    {
      "difficulty": "medium",
      "tags": ["Number类型"],
      "question": "JavaScript中的Number类型有哪些特殊值？",
      "options": [
        "Infinity、-Infinity、NaN",
        "只有NaN",
        "Null、Undefined",
        "MAX_VALUE、MIN_VALUE"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Number特殊值：",
        "sections": [
          {
            "title": "1. Infinity（无穷大）",
            "code": "console.log(1 / 0); // Infinity\nconsole.log(-1 / 0); // -Infinity\nconsole.log(Infinity > 1000000); // true\nconsole.log(typeof Infinity); // 'number'"
          },
          {
            "title": "2. NaN（Not a Number）",
            "code": "console.log(0 / 0); // NaN\nconsole.log('abc' - 1); // NaN\nconsole.log(NaN === NaN); // false\nconsole.log(isNaN(NaN)); // true\nconsole.log(Number.isNaN(NaN)); // true"
          },
          {
            "title": "3. 安全整数范围",
            "code": "console.log(Number.MAX_SAFE_INTEGER); // 2^53 - 1\nconsole.log(Number.MIN_SAFE_INTEGER); // -(2^53 - 1)\nconsole.log(Number.isSafeInteger(9007199254740991)); // true"
          }
        ]
      },
      "source": "Number特殊值"
    },
    {
      "difficulty": "medium",
      "tags": ["Null vs Undefined"],
      "question": "Null和Undefined有什么区别？",
      "options": [
        "Undefined表示未定义，Null表示空对象指针，都表示'没有值'但含义不同",
        "完全相同",
        "Null是对象，Undefined不是",
        "没有区别"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Null vs Undefined：",
        "sections": [
          {
            "title": "Undefined",
            "points": [
              "变量声明但未赋值",
              "访问对象不存在的属性",
              "函数没有返回值",
              "函数参数未传值"
            ],
            "code": "let x;\nconsole.log(x); // undefined\n\nconst obj = {};\nconsole.log(obj.name); // undefined\n\nfunction fn() {}\nconsole.log(fn()); // undefined"
          },
          {
            "title": "Null",
            "points": [
              "表示空对象指针",
              "需要显式赋值",
              "表示'没有对象'",
              "常用于释放对象引用"
            ],
            "code": "let obj = null; // 显式赋值\nconsole.log(typeof null); // 'object' (bug)\n\n// 释放引用\nlet data = { large: 'data' };\ndata = null; // 帮助垃圾回收"
          },
          {
            "title": "比较",
            "code": "console.log(null == undefined); // true\nconsole.log(null === undefined); // false\n\nconsole.log(typeof null); // 'object'\nconsole.log(typeof undefined); // 'undefined'"
          }
        ]
      },
      "source": "Null vs Undefined"
    },
    {
      "difficulty": "medium",
      "tags": ["Symbol"],
      "question": "Symbol类型有什么特点和用途？",
      "options": [
        "创建唯一标识符，即使描述相同也不相等，可作为对象私有属性",
        "与String类型相同",
        "可以被隐式转换",
        "主要用于数字计算"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol特性：",
        "sections": [
          {
            "title": "1. 唯一性",
            "code": "const s1 = Symbol('desc');\nconst s2 = Symbol('desc');\nconsole.log(s1 === s2); // false\n\n// 全局Symbol\nconst s3 = Symbol.for('global');\nconst s4 = Symbol.for('global');\nconsole.log(s3 === s4); // true"
          },
          {
            "title": "2. 作为对象属性",
            "code": "const id = Symbol('id');\nconst user = {\n  name: 'John',\n  [id]: 123\n};\n\nconsole.log(user[id]); // 123\nconsole.log(Object.keys(user)); // ['name']\n// Symbol属性不会被枚举"
          },
          {
            "title": "3. 内置Symbol",
            "code": "// Symbol.iterator\nconst arr = [1, 2, 3];\nconsole.log(arr[Symbol.iterator]);\n\n// Symbol.toStringTag\nclass MyClass {}\nMyClass.prototype[Symbol.toStringTag] = 'MyClass';\nconsole.log(Object.prototype.toString.call(new MyClass()));\n// '[object MyClass]'"
          }
        ]
      },
      "source": "Symbol"
    },
    {
      "difficulty": "medium",
      "tags": ["BigInt"],
      "question": "BigInt用于解决什么问题？如何使用？",
      "options": [
        "解决Number类型整数精度限制，可表示任意大整数",
        "用于浮点数计算",
        "用于字符串操作",
        "没有实际用途"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "BigInt使用：",
        "sections": [
          {
            "title": "1. Number的限制",
            "code": "console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991\nconsole.log(9007199254740992 === 9007199254740993); // true (精度丢失)"
          },
          {
            "title": "2. BigInt声明",
            "code": "const big1 = 1234567890123456789012345678901234567890n;\nconst big2 = BigInt('1234567890123456789012345678901234567890');\nconst big3 = BigInt(123); // 从Number转换"
          },
          {
            "title": "3. BigInt运算",
            "code": "const a = 10n;\nconst b = 20n;\n\nconsole.log(a + b); // 30n\nconsole.log(a * b); // 200n\nconsole.log(b / a); // 2n (整数除法)\n\n// 不能与Number混用\nconsole.log(10n + 20); // TypeError"
          },
          {
            "title": "4. 注意事项",
            "points": [
              "不能与Number类型混合运算",
              "不支持Math对象方法",
              "JSON.stringify不支持BigInt",
              "除法会舍弃小数部分"
            ]
          }
        ]
      },
      "source": "BigInt"
    },
    {
      "difficulty": "hard",
      "tags": ["值传递vs引用传递"],
      "question": "JavaScript中基本类型和引用类型的传递方式有什么区别？",
      "options": [
        "基本类型按值传递，引用类型按共享传递（传递引用的副本）",
        "都是按值传递",
        "都是按引用传递",
        "基本类型按引用，引用类型按值"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "传递机制：",
        "sections": [
          {
            "title": "1. 基本类型（按值传递）",
            "code": "let a = 10;\nlet b = a; // 复制值\nb = 20;\nconsole.log(a); // 10 (不受影响)\n\nfunction change(x) {\n  x = 100;\n}\nlet num = 50;\nchange(num);\nconsole.log(num); // 50 (不受影响)"
          },
          {
            "title": "2. 引用类型（按共享传递）",
            "code": "let obj1 = { value: 10 };\nlet obj2 = obj1; // 复制引用\nobj2.value = 20;\nconsole.log(obj1.value); // 20 (受影响)\n\nfunction change(obj) {\n  obj.value = 100; // 修改属性\n}\nlet myObj = { value: 50 };\nchange(myObj);\nconsole.log(myObj.value); // 100 (受影响)"
          },
          {
            "title": "3. 重新赋值不影响原对象",
            "code": "function change(obj) {\n  obj = { value: 100 }; // 重新赋值\n}\nlet myObj = { value: 50 };\nchange(myObj);\nconsole.log(myObj.value); // 50 (不受影响)"
          }
        ]
      },
      "source": "传递机制"
    },
    {
      "difficulty": "hard",
      "tags": ["包装对象"],
      "question": "什么是包装对象？基本类型为什么可以调用方法？",
      "options": [
        "基本类型会临时转换为对应的包装对象（Number/String/Boolean），调用完方法后销毁",
        "基本类型本身就有方法",
        "基本类型不能调用方法",
        "需要手动创建包装对象"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "包装对象机制：",
        "sections": [
          {
            "title": "1. 自动装箱",
            "code": "const str = 'hello';\nconst result = str.toUpperCase(); // 'HELLO'\n\n// 实际过程：\n// 1. 创建String包装对象: new String('hello')\n// 2. 调用方法: temp.toUpperCase()\n// 3. 返回结果，销毁包装对象"
          },
          {
            "title": "2. 包装对象类型",
            "points": [
              "Number：数字包装对象",
              "String：字符串包装对象",
              "Boolean：布尔包装对象",
              "Symbol和BigInt没有包装对象"
            ]
          },
          {
            "title": "3. 显式创建包装对象",
            "code": "const num = 123;\nconst numObj = new Number(123);\n\nconsole.log(typeof num); // 'number'\nconsole.log(typeof numObj); // 'object'\n\nconsole.log(num === 123); // true\nconsole.log(numObj === 123); // false"
          },
          {
            "title": "4. 注意事项",
            "code": "const str = 'test';\nstr.prop = 'value';\nconsole.log(str.prop); // undefined\n// 包装对象是临时的，属性不会保留"
          }
        ]
      },
      "source": "包装对象"
    },
    {
      "difficulty": "hard",
      "tags": ["类型检测"],
      "question": "如何准确判断一个值的类型？",
      "options": [
        "typeof判断基本类型，instanceof判断对象类型，Object.prototype.toString最准确",
        "只用typeof",
        "只用instanceof",
        "只用constructor"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "类型检测方法：",
        "sections": [
          {
            "title": "1. typeof",
            "code": "typeof 123; // 'number'\ntypeof 'str'; // 'string'\ntypeof true; // 'boolean'\ntypeof undefined; // 'undefined'\ntypeof null; // 'object' (bug)\ntypeof {}; // 'object'\ntypeof []; // 'object'\ntypeof function(){}; // 'function'"
          },
          {
            "title": "2. instanceof",
            "code": "[] instanceof Array; // true\n({}) instanceof Object; // true\nfunction fn(){}\nfn instanceof Function; // true\n\n// 原型链检测\nfunction Person(){}\nconst p = new Person();\np instanceof Person; // true"
          },
          {
            "title": "3. Object.prototype.toString",
            "code": "Object.prototype.toString.call(123); // '[object Number]'\nObject.prototype.toString.call('str'); // '[object String]'\nObject.prototype.toString.call(true); // '[object Boolean]'\nObject.prototype.toString.call(null); // '[object Null]'\nObject.prototype.toString.call(undefined); // '[object Undefined]'\nObject.prototype.toString.call([]); // '[object Array]'\nObject.prototype.toString.call({}); // '[object Object]'\nObject.prototype.toString.call(function(){}); // '[object Function]'"
          },
          {
            "title": "4. 特定类型检测",
            "code": "Array.isArray([]); // true\nNumber.isNaN(NaN); // true\nNumber.isFinite(123); // true"
          }
        ]
      },
      "source": "类型检测"
    },
    {
      "difficulty": "hard",
      "tags": ["浮点数精度"],
      "question": "为什么0.1 + 0.2 !== 0.3？如何解决浮点数精度问题？",
      "options": [
        "IEEE 754标准导致精度丢失，可用toFixed()或第三方库",
        "JavaScript的bug",
        "无法解决",
        "只有JavaScript有这个问题"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "浮点数精度问题：",
        "sections": [
          {
            "title": "问题演示",
            "code": "console.log(0.1 + 0.2); // 0.30000000000000004\nconsole.log(0.1 + 0.2 === 0.3); // false\n\nconsole.log(0.1); // 0.1 (显示时四舍五入)\nconsole.log((0.1).toPrecision(21)); // 0.100000000000000005551"
          },
          {
            "title": "原因",
            "content": "JavaScript使用IEEE 754双精度浮点数标准，某些十进制小数无法精确表示为二进制。"
          },
          {
            "title": "解决方案",
            "code": "// 1. toFixed()\nconst result = (0.1 + 0.2).toFixed(2);\nconsole.log(result); // '0.30' (字符串)\n\n// 2. 误差比较\nconst equal = Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;\nconsole.log(equal); // true\n\n// 3. 转整数计算\nconst a = 0.1 * 10;\nconst b = 0.2 * 10;\nconst c = (a + b) / 10;\nconsole.log(c); // 0.3\n\n// 4. 使用第三方库\n// decimal.js, big.js, bignumber.js"
          }
        ]
      },
      "source": "浮点数精度"
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
