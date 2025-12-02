window.quizData_Basics01TypeConversion = {
  "config": {
    "title": "类型转换",
    "icon": "🔄",
    "description": "显式转换与隐式转换机制",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    // 第1题：简单 - 单选题
    {
      "difficulty": "easy",
      "tags": ["显式转换"],
      "question": "以下哪个方法可以将字符串转换为数字？",
      "options": [
        "Number()、parseInt()、parseFloat()、一元+运算符",
        "只有Number()",
        "只有parseInt()",
        "toString()"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "字符串转数字的方法",
        "sections": [
          {
            "title": "四种方法",
            "code": "const str = '42';\n\n// 1. Number()：严格转换\nNumber('42');      // 42\nNumber('42.5');    // 42.5\nNumber('42px');    // NaN\nNumber('');        // 0\n\n// 2. parseInt()：解析整数\nparseInt('42');    // 42\nparseInt('42.5');  // 42（只取整数部分）\nparseInt('42px');  // 42（忽略非数字）\nparseInt('px42');  // NaN\n\n// 3. parseFloat()：解析浮点数\nparseFloat('42.5');   // 42.5\nparseFloat('42px');   // 42\nparseFloat('.5');     // 0.5\n\n// 4. 一元+运算符：等同于Number()\n+'42';     // 42\n+'42.5';   // 42.5\n+'42px';   // NaN"
          },
          {
            "title": "区别对比",
            "code": "// Number() vs parseInt()\nNumber('10px');     // NaN\nparseInt('10px');   // 10\n\n// parseFloat() vs parseInt()\nparseInt('3.14');   // 3\nparseFloat('3.14'); // 3.14\n\n// 进制解析\nparseInt('10', 10);  // 10（十进制）\nparseInt('10', 2);   // 2（二进制）\nparseInt('10', 16);  // 16（十六进制）"
          }
        ]
      },
      "source": "类型转换"
    },

    // 第2题：简单 - 判断题
    {
      "difficulty": "easy",
      "type": "true-false",
      "tags": ["布尔转换"],
      "question": "空字符串''转换为布尔值是true。",
      "options": ["正确", "错误"],
      "correctAnswer": "B",
      "explanation": {
        "title": "布尔值转换规则",
        "content": "这是错误的。空字符串''是falsy值，转换为false。",
        "sections": [
          {
            "title": "8个falsy值",
            "points": [
              "false",
              "0、-0、0n",
              "''（空字符串）",
              "null",
              "undefined",
              "NaN",
              "document.all（历史遗留）"
            ]
          },
          {
            "title": "转换示例",
            "code": "// falsy值\nBoolean('');         // false\nBoolean(0);          // false\nBoolean(null);       // false\nBoolean(undefined);  // false\nBoolean(NaN);        // false\n\n// truthy值\nBoolean('0');        // true（非空字符串）\nBoolean('false');    // true\nBoolean([]);         // true（空数组也是true）\nBoolean({});         // true（空对象也是true）\nBoolean(new Boolean(false)); // true（对象总是true）"
          },
          {
            "title": "实际应用",
            "code": "// 条件判断中的隐式转换\nif ('') {\n  console.log('不会执行');\n}\n\nif ('0') {\n  console.log('会执行');  // 非空字符串是truthy\n}\n\n// 默认值设置\nconst value = input || 'default';\n// 注意：0也会被替换为默认值\nconst count = userInput || 0;  // ✗ 错误\nconst count = userInput ?? 0;  // ✓ 使用??更准确"
          }
        ]
      },
      "source": "布尔转换"
    },

    // 第3题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["隐式转换"],
      "question": "以下哪些操作会触发隐式类型转换？",
      "options": [
        "'5' + 3",
        "'5' - 3",
        "[] == false",
        "+'42'"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "隐式转换的触发场景",
        "sections": [
          {
            "title": "选项A - 字符串拼接（正确）",
            "code": "'5' + 3;  // '53'\n// + 运算符遇到字符串时，将数字转为字符串"
          },
          {
            "title": "选项B - 算术运算（正确）",
            "code": "'5' - 3;  // 2\n'5' * 3;  // 15\n'5' / 3;  // 1.6666...\n// 算术运算符会将字符串转为数字"
          },
          {
            "title": "选项C - 宽松相等（正确）",
            "code": "[] == false;  // true\n// 转换过程：\n// [] -> '' -> 0\n// false -> 0\n// 0 == 0 -> true"
          },
          {
            "title": "选项D - 显式转换（错误）",
            "code": "+'42';  // 42\n// 一元+是显式转换，不是隐式转换"
          },
          {
            "title": "更多隐式转换",
            "code": "// 1. 逻辑运算\nif ([]) { }  // []转为true\n\n// 2. 比较运算\n'2' > '10';  // true（字符串比较）\n'2' > 10;    // false（转为数字比较）\n\n// 3. 算术运算\n[] + 1;      // '1'\n{} + 1;      // 1（{}被当作代码块）\n\n// 4. 模板字符串\n`value: ${[1,2,3]}`;  // 'value: 1,2,3'"
          }
        ]
      },
      "source": "隐式转换"
    },

    // 第4题：中等 - 代码输出题
    {
      "difficulty": "medium",
      "type": "code-output",
      "tags": ["ToPrimitive"],
      "question": "以下代码的输出是什么？",
      "code": "const obj = {\n  valueOf() { return 42; },\n  toString() { return '100'; }\n};\n\nconsole.log(obj + 1);\nconsole.log(String(obj));",
      "options": [
        "43, '100'",
        "1001, '100'",
        "43, '42'",
        "'1001', '42'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ToPrimitive转换规则",
        "sections": [
          {
            "title": "转换优先级",
            "points": [
              "数值运算：优先调用valueOf()",
              "字符串运算：优先调用toString()",
              "如果返回的仍是对象，则调用另一个方法",
              "如果两个都返回对象，抛出TypeError"
            ]
          },
          {
            "title": "第一个输出：43",
            "code": "obj + 1;\n// 1. +运算符触发ToPrimitive，hint为'number'\n// 2. 先调用valueOf()，返回42\n// 3. 42 + 1 = 43"
          },
          {
            "title": "第二个输出：'100'",
            "code": "String(obj);\n// 1. String()触发ToPrimitive，hint为'string'\n// 2. 先调用toString()，返回'100'\n// 3. 直接返回'100'"
          },
          {
            "title": "完整示例",
            "code": "const obj = {\n  valueOf() {\n    console.log('valueOf called');\n    return 42;\n  },\n  toString() {\n    console.log('toString called');\n    return '100';\n  }\n};\n\n// 数值上下文\nconsole.log(obj + 1);\n// 输出：valueOf called\n//      43\n\n// 字符串上下文\nconsole.log(String(obj));\n// 输出：toString called\n//      '100'\n\n// 模板字符串（字符串上下文）\nconsole.log(`${obj}`);\n// 输出：toString called\n//      '100'\n\n// ==比较（数值上下文）\nconsole.log(obj == 42);\n// 输出：valueOf called\n//      true"
          }
        ]
      },
      "source": "ToPrimitive"
    },

    // 第5题：中等 - 代码补全题
    {
      "difficulty": "medium",
      "type": "code-completion",
      "tags": ["强制转换"],
      "question": "如何将任意值转换为布尔值？请补全最简洁的方法。",
      "code": "const value = 'hello';\nconst bool = ______;\n\nconsole.log(bool);  // true",
      "options": [
        "!!value",
        "Boolean(value)",
        "value.toString()",
        "Number(value)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "转换为布尔值的方法",
        "sections": [
          {
            "title": "两种方法",
            "code": "// 方法1：双重否定（最简洁）\n!!value;\n!!'hello';   // true\n!!0;         // false\n!!null;      // false\n\n// 方法2：Boolean()函数\nBoolean(value);\nBoolean('hello');  // true\nBoolean(0);        // false"
          },
          {
            "title": "原理",
            "code": "// 单个!将值转为布尔值并取反\n!'hello';  // false\n!0;        // true\n\n// 双重!再取反一次，得到布尔值\n!!'hello'; // true\n!!0;       // false"
          },
          {
            "title": "实际应用",
            "code": "// 1. 判断变量是否有值\nconst hasValue = !!value;\n\n// 2. 过滤数组中的falsy值\nconst arr = [0, 1, '', 'hello', null, undefined, false];\nconst filtered = arr.filter(Boolean);\n// [1, 'hello']\n\n// 3. 对象属性转布尔\nconst user = {\n  name: 'Tom',\n  hasPermission: !!permissions.length\n};\n\n// 4. 函数返回布尔值\nfunction isValid(value) {\n  return !!value;\n}"
          }
        ]
      },
      "source": "布尔转换"
    },

    // 第6题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["字符串转换"],
      "question": "以下哪些方法可以将数字转换为字符串？",
      "options": [
        "String()",
        "toString()",
        "模板字符串",
        "与空字符串相加"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "数字转字符串的方法",
        "content": "所有选项都正确！JavaScript提供了多种转换方式。",
        "sections": [
          {
            "title": "方法对比",
            "code": "const num = 42;\n\n// 1. String()函数（推荐）\nString(42);           // '42'\nString(null);         // 'null'\nString(undefined);    // 'undefined'\n\n// 2. toString()方法\n(42).toString();      // '42'\n(42).toString(2);     // '101010'（二进制）\n(42).toString(16);    // '2a'（十六进制）\n// 注意：null和undefined没有toString方法\n\n// 3. 模板字符串\n`${42}`;              // '42'\n`${null}`;            // 'null'\n`${undefined}`;       // 'undefined'\n\n// 4. + 空字符串（最简洁）\n42 + '';              // '42'\nnull + '';            // 'null'\nundefined + '';       // 'undefined'"
          },
          {
            "title": "选择建议",
            "code": "// 显式转换：String()（最清晰）\nconst str = String(value);\n\n// 进制转换：toString(radix)\nconst binary = num.toString(2);\n\n// 快速转换：+ ''\nconst str = num + '';\n\n// 模板字符串：需要拼接时\nconst message = `The value is ${num}`;"
          },
          {
            "title": "特殊值处理",
            "code": "// null和undefined\nString(null);      // 'null'\nnull.toString();   // TypeError\n\nString(undefined); // 'undefined'\nundefined.toString(); // TypeError\n\n// NaN和Infinity\nString(NaN);       // 'NaN'\nString(Infinity);  // 'Infinity'\nString(-Infinity); // '-Infinity'\n\n// 对象\nString({});        // '[object Object]'\nString([1,2,3]);   // '1,2,3'\nString([]);        // ''"
          }
        ]
      },
      "source": "字符串转换"
    },

    // 第7题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["隐式转换", "运算符"],
      "question": "以下代码的输出是什么？",
      "code": "console.log([] == ![]);\nconsole.log([] == []);\nconsole.log({} == !{});\nconsole.log({} == {});",
      "options": [
        "true, false, false, false",
        "false, false, false, false",
        "true, true, false, false",
        "false, true, true, true"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "复杂的类型转换",
        "sections": [
          {
            "title": "第一个：[] == ![] → true",
            "code": "[] == ![];\n// 1. ![] 先执行\n//    !运算符将[]转为布尔值：!true = false\n// 2. [] == false\n//    [] 转为原始值：[].toString() = ''\n//    '' 转为数字：Number('') = 0\n//    false 转为数字：Number(false) = 0\n// 3. 0 == 0 → true"
          },
          {
            "title": "第二个：[] == [] → false",
            "code": "[] == [];\n// 两个不同的数组对象，引用不同\n// 对象比较是比较引用地址，不是值\n\nconst arr1 = [];\nconst arr2 = [];\narr1 == arr2;   // false\n\nconst arr3 = arr1;\narr1 == arr3;   // true（同一个引用）"
          },
          {
            "title": "第三个：{} == !{} → false",
            "code": "{} == !{};\n// 1. !{} 先执行\n//    对象转为布尔值是true：!true = false\n// 2. {} == false\n//    {} 转为原始值：{}.toString() = '[object Object]'\n//    '[object Object]' 转为数字：NaN\n//    false 转为数字：0\n// 3. NaN == 0 → false（NaN不等于任何值）"
          },
          {
            "title": "第四个：{} == {} → false",
            "code": "{} == {};\n// 两个不同的对象，引用不同\n\nconst obj1 = {};\nconst obj2 = {};\nobj1 == obj2;   // false\n\nconst obj3 = obj1;\nobj1 == obj3;   // true"
          },
          {
            "title": "关键规则",
            "points": [
              "对象之间的比较是比较引用",
              "!运算符会将值转为布尔值并取反",
              "==会触发复杂的类型转换",
              "NaN不等于任何值，包括它自己",
              "推荐使用===避免隐式转换"
            ]
          }
        ]
      },
      "source": "类型转换陷阱"
    },

    // 第8题：困难 - 多选题
    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["转换规则"],
      "question": "关于==运算符的类型转换规则，以下说法正确的是？",
      "options": [
        "null == undefined 返回true",
        "NaN == NaN 返回false",
        "如果一个是字符串，一个是数字，字符串会转为数字",
        "如果一个是布尔值，会转为数字再比较"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "==运算符的完整转换规则",
        "content": "所有选项都正确！这些是==的核心规则。",
        "sections": [
          {
            "title": "选项A - null和undefined",
            "code": "null == undefined;  // true\nnull === undefined; // false\n\n// null和undefined只与对方和自身相等\nnull == null;       // true\nundefined == undefined; // true\nnull == 0;          // false\nundefined == 0;     // false\nnull == false;      // false"
          },
          {
            "title": "选项B - NaN特性",
            "code": "NaN == NaN;   // false\nNaN === NaN;  // false\n\n// NaN不等于任何值，包括自己\n// 检测NaN的正确方法：\nNumber.isNaN(NaN);    // true\nisNaN(NaN);           // true\nObject.is(NaN, NaN);  // true"
          },
          {
            "title": "选项C - 字符串和数字",
            "code": "'42' == 42;   // true\n// 转换过程：\n// '42' -> Number('42') -> 42\n// 42 == 42 -> true\n\n'0' == 0;     // true\n'' == 0;      // true（空字符串转为0）\n' ' == 0;     // true（空白字符串转为0）"
          },
          {
            "title": "选项D - 布尔值转换",
            "code": "true == 1;    // true\nfalse == 0;   // true\n\n// 转换过程：\n// true -> Number(true) -> 1\n// 1 == 1 -> true\n\n// 陷阱\ntrue == '1';  // true\n// true -> 1, '1' -> 1\n\ntrue == '2';  // false\n// true -> 1, '2' -> 2\n\nfalse == '';  // true\n// false -> 0, '' -> 0"
          },
          {
            "title": "完整转换表",
            "code": "// 推荐记忆的转换\n'' == 0;          // true\n'0' == 0;         // true\n'0' == false;     // true\nfalse == 0;       // true\nnull == undefined; // true\n[] == false;      // true\n[] == ![];        // true\n\n// 推荐使用===避免这些陷阱\n'' === 0;         // false\n'0' === 0;        // false\nfalse === 0;      // false"
          }
        ]
      },
      "source": "==运算符"
    },

    // 第9题：困难 - 代码补全题
    {
      "difficulty": "hard",
      "type": "code-completion",
      "tags": ["Symbol.toPrimitive"],
      "question": "如何自定义对象的类型转换？请补全代码。",
      "code": "const obj = {\n  ______: function(hint) {\n    if (hint === 'number') {\n      return 42;\n    }\n    if (hint === 'string') {\n      return 'hello';\n    }\n    return null;\n  }\n};\n\nconsole.log(+obj);      // 42\nconsole.log(`${obj}`);  // 'hello'",
      "options": [
        "[Symbol.toPrimitive]",
        "toPrimitive",
        "valueOf",
        "toString"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol.toPrimitive",
        "content": "Symbol.toPrimitive是ES6引入的内置Symbol，用于自定义对象的类型转换。",
        "sections": [
          {
            "title": "基本用法",
            "code": "const obj = {\n  [Symbol.toPrimitive](hint) {\n    console.log('hint:', hint);\n    \n    if (hint === 'number') {\n      return 42;\n    }\n    if (hint === 'string') {\n      return 'hello';\n    }\n    return null;  // default\n  }\n};\n\n// 数值上下文：hint = 'number'\n+obj;           // hint: number, 返回42\nNumber(obj);    // hint: number, 返回42\n\n// 字符串上下文：hint = 'string'\n`${obj}`;       // hint: string, 返回'hello'\nString(obj);    // hint: string, 返回'hello'\n\n// 默认上下文：hint = 'default'\nobj + '';       // hint: default, 返回null\nobj == 42;      // hint: default"
          },
          {
            "title": "优先级",
            "code": "// Symbol.toPrimitive > valueOf > toString\nconst obj = {\n  [Symbol.toPrimitive]() {\n    return 'primitive';\n  },\n  valueOf() {\n    return 'value';\n  },\n  toString() {\n    return 'string';\n  }\n};\n\nString(obj);  // 'primitive'（Symbol.toPrimitive优先）\n\n// 如果没有Symbol.toPrimitive\nconst obj2 = {\n  valueOf() {\n    return 42;\n  },\n  toString() {\n    return '100';\n  }\n};\n\nNumber(obj2);  // 42（valueOf优先）\nString(obj2);  // '100'（toString优先）"
          },
          {
            "title": "实际应用",
            "code": "// 自定义数值对象\nclass Money {\n  constructor(amount, currency) {\n    this.amount = amount;\n    this.currency = currency;\n  }\n  \n  [Symbol.toPrimitive](hint) {\n    if (hint === 'number') {\n      return this.amount;\n    }\n    if (hint === 'string') {\n      return `${this.amount} ${this.currency}`;\n    }\n    return this.amount;\n  }\n}\n\nconst price = new Money(100, 'USD');\nconsole.log(+price);        // 100\nconsole.log(`${price}`);    // '100 USD'\nconsole.log(price + 50);    // 150"
          }
        ]
      },
      "source": "Symbol.toPrimitive"
    },

    // 第10题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["复杂转换"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(1 + '1' - 1);\nconsole.log('5' * '2');\nconsole.log([] + [] + 'foo'.split(''));\nconsole.log([1, 2] + [3, 4]);",
      "options": [
        "10, 10, 'f,o,o', '1,23,4'",
        "11, 10, 'f,o,o', '1,2,3,4'",
        "10, NaN, ['f','o','o'], [1,2,3,4]",
        "11, NaN, 'foo', '1,23,4'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "复杂运算符转换",
        "sections": [
          {
            "title": "第一个：1 + '1' - 1 → 10",
            "code": "1 + '1' - 1;\n// 1. 1 + '1'\n//    +遇到字符串，拼接：'1' + '1' = '11'\n// 2. '11' - 1\n//    -总是数值运算：Number('11') - 1 = 11 - 1 = 10"
          },
          {
            "title": "第二个：'5' * '2' → 10",
            "code": "'5' * '2';\n// *总是数值运算\n// Number('5') * Number('2') = 5 * 2 = 10\n\n// 类似的：\n'5' / '2';  // 2.5\n'5' - '2';  // 3\n'5' + '2';  // '52'（+特殊）"
          },
          {
            "title": "第三个：[] + [] + 'foo'.split('') → 'f,o,o'",
            "code": "[] + [] + 'foo'.split('');\n// 1. [] + []\n//    [].toString() = ''\n//    ''.toString() = ''\n//    '' + '' = ''\n// 2. '' + 'foo'.split('')\n//    'foo'.split('') = ['f', 'o', 'o']\n//    '' + ['f','o','o']\n//    ['f','o','o'].toString() = 'f,o,o'\n//    '' + 'f,o,o' = 'f,o,o'"
          },
          {
            "title": "第四个：[1, 2] + [3, 4] → '1,23,4'",
            "code": "[1, 2] + [3, 4];\n// +运算符会将数组转为字符串\n// [1,2].toString() = '1,2'\n// [3,4].toString() = '3,4'\n// '1,2' + '3,4' = '1,23,4'"
          },
          {
            "title": "关键规则总结",
            "points": [
              "+运算符：遇到字符串就拼接，否则数值相加",
              "-、*、/运算符：总是进行数值运算",
              "数组的toString()：等同于join(',')",
              "空数组转字符串：''",
              "空对象转字符串：'[object Object]'"
            ]
          },
          {
            "title": "避免陷阱",
            "code": "// 明确类型转换\nNumber('5') * Number('2');  // 10\n\n// 使用模板字符串拼接\n`${1}${1}`;  // '11'\n\n// 数组拼接用concat或展开运算符\n[1, 2].concat([3, 4]);  // [1, 2, 3, 4]\n[...[1, 2], ...[3, 4]]; // [1, 2, 3, 4]"
          }
        ]
      },
      "source": "运算符转换"
    }
  ],
  "navigation": {
    "prev": {
      "title": "数据类型",
      "url": "01-datatypes.html"
    },
    "next": {
      "title": "运算符",
      "url": "02-operators.html"
    }
  }
};
