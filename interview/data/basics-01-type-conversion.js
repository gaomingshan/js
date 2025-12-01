window.quizData_Basics01TypeConversion = {
  "config": {
    "title": "类型转换",
    "icon": "🔄",
    "description": "理解JavaScript的显式和隐式类型转换机制",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["String转换"],
      "question": "如何将其他类型转换为字符串？",
      "options": [
        "String()、toString()、字符串拼接",
        "只能用String()",
        "只能用toString()",
        "不能转换"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "转换为字符串的方法：",
        "sections": [
          {
            "title": "1. String()函数",
            "code": "String(123); // '123'\nString(true); // 'true'\nString(null); // 'null'\nString(undefined); // 'undefined'\nString({x: 1}); // '[object Object]'"
          },
          {
            "title": "2. toString()方法",
            "code": "(123).toString(); // '123'\ntrue.toString(); // 'true'\n[1,2,3].toString(); // '1,2,3'\n\n// 注意：null和undefined没有toString方法\nnull.toString(); // TypeError"
          },
          {
            "title": "3. 字符串拼接",
            "code": "123 + ''; // '123'\ntrue + ''; // 'true'\nnull + ''; // 'null'"
          }
        ]
      },
      "source": "String转换"
    },
    {
      "difficulty": "easy",
      "tags": ["Number转换"],
      "question": "如何将其他类型转换为数字？",
      "options": [
        "Number()、parseInt()、parseFloat()、一元+运算符",
        "只能用Number()",
        "只能用parseInt()",
        "不能转换"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "转换为数字的方法：",
        "sections": [
          {
            "title": "1. Number()函数",
            "code": "Number('123'); // 123\nNumber('12.5'); // 12.5\nNumber(''); // 0\nNumber('  '); // 0\nNumber(true); // 1\nNumber(false); // 0\nNumber(null); // 0\nNumber(undefined); // NaN\nNumber('abc'); // NaN"
          },
          {
            "title": "2. parseInt()和parseFloat()",
            "code": "parseInt('123'); // 123\nparseInt('12.5'); // 12\nparseInt('123abc'); // 123\nparseInt('abc'); // NaN\n\nparseFloat('12.5'); // 12.5\nparseFloat('12.5.6'); // 12.5\n\n// 指定进制\nparseInt('10', 2); // 2\nparseInt('10', 16); // 16"
          },
          {
            "title": "3. 一元+运算符",
            "code": "+'123'; // 123\n+'12.5'; // 12.5\n+true; // 1\n+false; // 0\n+''; // 0"
          }
        ]
      },
      "source": "Number转换"
    },
    {
      "difficulty": "medium",
      "tags": ["Boolean转换"],
      "question": "哪些值转换为Boolean时为false？",
      "options": [
        "0、-0、NaN、''、null、undefined、false",
        "只有false",
        "0、null、undefined",
        "所有空值"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "假值（Falsy）：",
        "sections": [
          {
            "title": "7个假值",
            "code": "Boolean(false); // false\nBoolean(0); // false\nBoolean(-0); // false\nBoolean(NaN); // false\nBoolean(''); // false\nBoolean(null); // false\nBoolean(undefined); // false"
          },
          {
            "title": "其他都是真值",
            "code": "Boolean('0'); // true\nBoolean('false'); // true\nBoolean([]); // true\nBoolean({}); // true\nBoolean(function(){}); // true"
          },
          {
            "title": "隐式转换",
            "code": "if ('') { } // 不执行\nif ('0') { } // 执行\nif ([]) { } // 执行\n\n!!''; // false\n!!'0'; // true"
          }
        ]
      },
      "source": "Boolean转换"
    },
    {
      "difficulty": "medium",
      "tags": ["对象转原始值"],
      "question": "对象转换为原始值的规则是什么？",
      "options": [
        "先调用valueOf()，如果返回原始值则使用；否则调用toString()；都不行则报错",
        "只调用toString()",
        "只调用valueOf()",
        "随机调用"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "ToPrimitive抽象操作：",
        "sections": [
          {
            "title": "转换流程",
            "points": [
              "如果对象有[Symbol.toPrimitive]方法，优先调用",
              "否则，根据hint类型：",
              "  - hint='string': 先toString()，再valueOf()",
              "  - hint='number': 先valueOf()，再toString()",
              "  - hint='default': 先valueOf()，再toString()"
            ]
          },
          {
            "title": "示例",
            "code": "const obj = {\n  valueOf() {\n    console.log('valueOf');\n    return 42;\n  },\n  toString() {\n    console.log('toString');\n    return 'obj';\n  }\n};\n\n+obj; // valueOf -> 42\nString(obj); // toString -> 'obj'\nobj + ''; // valueOf -> '42'\nobj + 0; // valueOf -> 42"
          },
          {
            "title": "Symbol.toPrimitive",
            "code": "const obj = {\n  [Symbol.toPrimitive](hint) {\n    console.log('hint:', hint);\n    if (hint === 'number') return 42;\n    if (hint === 'string') return 'obj';\n    return 'default';\n  }\n};\n\n+obj; // hint: number -> 42\nString(obj); // hint: string -> 'obj'\nobj + ''; // hint: default -> 'default'"
          }
        ]
      },
      "source": "ToPrimitive"
    },
    {
      "difficulty": "medium",
      "tags": ["数组转换"],
      "question": "数组转换为字符串和数字的规则是什么？",
      "options": [
        "toString()返回逗号分隔的元素，valueOf()返回数组本身",
        "直接返回'Array'",
        "返回长度",
        "抛出错误"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "数组转换：",
        "sections": [
          {
            "title": "转字符串",
            "code": "[1, 2, 3].toString(); // '1,2,3'\n[].toString(); // ''\n[[1, 2], [3, 4]].toString(); // '1,2,3,4'\n\nString([1, 2, 3]); // '1,2,3'\n[1, 2, 3] + ''; // '1,2,3'"
          },
          {
            "title": "转数字",
            "code": "Number([]); // 0\nNumber([5]); // 5\nNumber([1, 2]); // NaN\n\n+[]; // 0\n+[5]; // 5\n+[1, 2]; // NaN"
          },
          {
            "title": "原理",
            "code": "// 数组的valueOf返回自身\n[1, 2].valueOf(); // [1, 2]\n\n// 所以转数字时会调用toString\n// [] -> '' -> 0\n// [5] -> '5' -> 5\n// [1,2] -> '1,2' -> NaN"
          }
        ]
      },
      "source": "数组转换"
    },
    {
      "difficulty": "medium",
      "tags": ["==比较"],
      "question": "使用==比较时的类型转换规则是什么？",
      "options": [
        "如果类型相同直接比较；类型不同则尝试转换为相同类型再比较",
        "总是返回false",
        "总是转为字符串比较",
        "总是转为数字比较"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "==比较规则：",
        "sections": [
          {
            "title": "核心规则",
            "points": [
              "null == undefined 为true",
              "数字与字符串：字符串转数字",
              "布尔值：先转数字（true->1, false->0）",
              "对象与原始值：对象转原始值",
              "其他情况：返回false"
            ]
          },
          {
            "title": "示例",
            "code": "// null和undefined\nnull == undefined; // true\nnull == 0; // false\n\n// 数字与字符串\n1 == '1'; // true (字符串转数字)\n\n// 布尔值\ntrue == 1; // true\nfalse == 0; // true\ntrue == '1'; // true\n\n// 对象\n[] == 0; // true ([] -> '' -> 0)\n[''] == 0; // true\n[2] == 2; // true"
          },
          {
            "title": "陷阱",
            "code": "[] == ![]; // true\n// ![] -> false -> 0\n// [] -> '' -> 0\n// 0 == 0 -> true\n\n'' == 0; // true\n' ' == 0; // true\n'0' == 0; // true"
          }
        ]
      },
      "source": "==比较"
    },
    {
      "difficulty": "hard",
      "tags": ["+运算符"],
      "question": "+运算符的类型转换规则是什么？",
      "options": [
        "如果有字符串则拼接，否则数字相加",
        "总是数字相加",
        "总是字符串拼接",
        "随机选择"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "+运算符规则：",
        "sections": [
          {
            "title": "字符串拼接",
            "code": "1 + '2'; // '12'\n'1' + 2; // '12'\n'1' + '2'; // '12'\n\n// 只要有一个是字符串\n1 + 2 + '3'; // '33'\n'1' + 2 + 3; // '123'"
          },
          {
            "title": "数字相加",
            "code": "1 + 2; // 3\ntrue + 1; // 2\nfalse + 1; // 1\nnull + 1; // 1\nundefined + 1; // NaN"
          },
          {
            "title": "对象参与",
            "code": "{} + {}; // '[object Object][object Object]'\n[] + []; // ''\n[] + {}; // '[object Object]'\n{} + []; // 0 ({}被当作代码块)\n\n[1, 2] + [3, 4]; // '1,23,4'"
          },
          {
            "title": "陷阱",
            "code": "1 + + '2'; // 3 (一元+转数字)\n1 + - '2'; // -1\n\n'1' + + '2'; // '12'\n'1' - - '2'; // 3"
          }
        ]
      },
      "source": "+运算符"
    },
    {
      "difficulty": "hard",
      "tags": ["parseInt陷阱"],
      "question": "parseInt的陷阱有哪些？",
      "options": [
        "会忽略前导空格、遇到非数字停止、默认按十进制解析",
        "完全安全",
        "总是返回整数",
        "没有陷阱"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "parseInt陷阱：",
        "sections": [
          {
            "title": "1. 自动停止解析",
            "code": "parseInt('123abc'); // 123\nparseInt('12.5'); // 12\nparseInt('  123  '); // 123"
          },
          {
            "title": "2. 进制问题",
            "code": "// 没指定进制，默认10\nparseInt('08'); // 8\nparseInt('0x10'); // 16 (自动识别16进制)\n\n// 指定进制\nparseInt('10', 2); // 2\nparseInt('10', 8); // 8\nparseInt('10', 16); // 16"
          },
          {
            "title": "3. map陷阱",
            "code": "['1', '2', '3'].map(parseInt);\n// 期望: [1, 2, 3]\n// 实际: [1, NaN, NaN]\n\n// 原因：\n// parseInt('1', 0) -> 1\n// parseInt('2', 1) -> NaN (1进制不存在)\n// parseInt('3', 2) -> NaN (2进制没有3)\n\n// 正确写法：\n['1', '2', '3'].map(s => parseInt(s, 10));\n['1', '2', '3'].map(Number);"
          },
          {
            "title": "4. 其他情况",
            "code": "parseInt(0.0000005); // 5\n// 因为：0.0000005 -> '5e-7' -> 5\n\nparseInt(null); // NaN\nparseInt(true); // NaN\nparseInt(undefined); // NaN"
          }
        ]
      },
      "source": "parseInt"
    },
    {
      "difficulty": "hard",
      "tags": ["JSON.stringify"],
      "question": "JSON.stringify的转换规则是什么？",
      "options": [
        "undefined、函数、Symbol会被忽略或转为null，Date转为ISO字符串",
        "所有值都能正确转换",
        "只能转换对象",
        "不能转换数组"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JSON.stringify规则：",
        "sections": [
          {
            "title": "1. 特殊值处理",
            "code": "// 对象中：忽略\nJSON.stringify({\n  a: undefined,\n  b: function(){},\n  c: Symbol('s')\n}); // '{}'\n\n// 数组中：转为null\nJSON.stringify([undefined, function(){}, Symbol('s')]);\n// '[null,null,null]'\n\n// 单独转换：返回undefined\nJSON.stringify(undefined); // undefined\nJSON.stringify(function(){}); // undefined"
          },
          {
            "title": "2. Date和RegExp",
            "code": "JSON.stringify(new Date());\n// '\"2024-01-01T00:00:00.000Z\"'\n\nJSON.stringify(/test/);\n// '{}'"
          },
          {
            "title": "3. toJSON方法",
            "code": "const obj = {\n  x: 1,\n  toJSON() {\n    return { x: 2 };\n  }\n};\nJSON.stringify(obj); // '{\"x\":2}'"
          },
          {
            "title": "4. 循环引用",
            "code": "const obj = { a: 1 };\nobj.self = obj;\nJSON.stringify(obj); // TypeError: Converting circular structure"
          },
          {
            "title": "5. 第二、第三参数",
            "code": "// replacer\nJSON.stringify({a:1, b:2}, ['a']); // '{\"a\":1}'\n\n// space\nJSON.stringify({a:1}, null, 2);\n// '{\n//   \"a\": 1\n// }'"
          }
        ]
      },
      "source": "JSON.stringify"
    },
    {
      "difficulty": "hard",
      "tags": ["综合应用"],
      "question": "以下代码输出什么？",
      "options": [
        "'1' + 2 + 3 = '123', 1 + 2 + '3' = '33'",
        "都是'123'",
        "都是'33'",
        "都是6"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "运算符优先级和结合性：",
        "sections": [
          {
            "title": "第一个表达式",
            "code": "'1' + 2 + 3\n// 从左到右\n// '1' + 2 -> '12'\n// '12' + 3 -> '123'"
          },
          {
            "title": "第二个表达式",
            "code": "1 + 2 + '3'\n// 从左到右\n// 1 + 2 -> 3\n// 3 + '3' -> '33'"
          },
          {
            "title": "更多示例",
            "code": "1 + '1' - 1; // 10\n// '1' + '1' -> '11'\n// '11' - 1 -> 10\n\n'5' + 3 - 2; // 51\n// '5' + 3 -> '53'\n// '53' - 2 -> 51\n\n[] + [] + 'foo'; // 'foo'\n{} + []; // 0\n[] + {}; // '[object Object]'"
          }
        ]
      },
      "source": "综合应用"
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
