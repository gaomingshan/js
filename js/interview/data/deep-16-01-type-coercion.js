/**
 * 类型强制转换规范
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1601TypeCoercion = {
  "config": {
    "title": "类型强制转换规范",
    "icon": "🔄",
    "description": "深入理解JavaScript类型转换的规则和ToPrimitive算法",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "medium",
      "tags": ["ToPrimitive"],
      "question": "对象转换为原始值时，ToPrimitive的hint默认值是什么？",
      "options": [
        "number",
        "string",
        "default",
        "undefined"
      ],
      "correctAnswer": "C",
      "explanation": {
        "title": "ToPrimitive算法",
        "code": "// ToPrimitive(input, hint)\n// hint可以是: 'number', 'string', 'default'\n\n// hint = 'number'时（数学运算）\n// 调用顺序: valueOf() → toString()\n\n// hint = 'string'时（字符串拼接）\n// 调用顺序: toString() → valueOf()\n\n// hint = 'default'时（==比较）\n// Date: toString() → valueOf()\n// 其他: valueOf() → toString()\n\nconst obj = {\n  valueOf() { return 1; },\n  toString() { return '2'; }\n};\n\nconsole.log(+obj);        // 1 (hint='number')\nconsole.log(`${obj}`);    // '2' (hint='string')\nconsole.log(obj == 1);    // true (hint='default')"
      },
      "source": "ToPrimitive"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["类型转换"],
      "question": "以下代码的输出是什么？",
      "code": "console.log([] + []);\nconsole.log([] + {});\nconsole.log({} + []);\nconsole.log({} + {});",
      "options": [
        "'', '[object Object]', '[object Object]', '[object Object][object Object]'",
        "'', '[object Object]', '0', 'NaN'",
        "[], {}, {}, {}",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "+运算符的类型转换",
        "code": "// +运算符：如果有字符串则转字符串，否则转数字\n\n// [] + [] → '' + '' → ''\nconsole.log([] + []);  // ''\n\n// [] + {} → '' + '[object Object]' → '[object Object]'\nconsole.log([] + {});  // '[object Object]'\n\n// {} + [] → {} + [] → '[object Object]'\n// 注意：单独的{}可能被解析为代码块\nconsole.log({} + []);  // '[object Object]'\n\n// {} + {} → '[object Object][object Object]'\nconsole.log({} + {});  // '[object Object][object Object]'\n\n// 转换步骤：\n// [].valueOf() → [] (对象，继续)\n// [].toString() → ''\n// ({}).toString() → '[object Object]'"
      },
      "source": "+运算符"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["ToNumber"],
      "question": "ToNumber转换规则，哪些是正确的？",
      "options": [
        "undefined转换为NaN",
        "null转换为0",
        "true转换为1，false转换为0",
        "空字符串转换为NaN",
        "数字字符串转换为对应数字",
        "Symbol转换为0"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "ToNumber转换规则",
        "code": "// 原始值转数字\nNumber(undefined);  // NaN\nNumber(null);       // 0\nNumber(true);       // 1\nNumber(false);      // 0\nNumber('');         // 0 (空字符串！)\nNumber('123');      // 123\nNumber('12a');      // NaN\nNumber(Symbol());   // TypeError\n\n// 对象转数字\nNumber({});         // NaN\nNumber([]);         // 0\nNumber([1]);        // 1\nNumber([1,2]);      // NaN\n\n// 转换步骤（对象）：\n// 1. ToPrimitive(input, 'number')\n// 2. 调用valueOf()\n// 3. 如果不是原始值，调用toString()\n// 4. 转换为数字"
      },
      "source": "ToNumber"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["ToString"],
      "question": "所有对象调用toString()都返回'[object Object]'",
      "correctAnswer": "B",
      "explanation": {
        "title": "ToString转换",
        "code": "// Object.prototype.toString()\n({}).toString();              // '[object Object]'\n\n// 但可以重写\nconst obj = {\n  toString() {\n    return 'custom';\n  }\n};\nobj.toString();               // 'custom'\n\n// 内置对象都重写了toString\n[1,2,3].toString();           // '1,2,3'\n(function(){}).toString();    // 'function(){}'\n(/regex/).toString();         // '/regex/'\nnew Date().toString();        // 日期字符串\n\n// String()会调用toString()\nString({});                   // '[object Object]'\nString([1,2]);                // '1,2'"
      },
      "source": "ToString"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["自定义转换"],
      "question": "自定义对象转换行为，空白处填什么？",
      "code": "const obj = {\n  ______: function() {\n    return 'primitive';\n  }\n};\n\nconsole.log(String(obj));",
      "options": [
        "[Symbol.toPrimitive]",
        "toPrimitive",
        "valueOf",
        "toString"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol.toPrimitive",
        "code": "// Symbol.toPrimitive优先级最高\nconst obj = {\n  [Symbol.toPrimitive](hint) {\n    console.log('hint:', hint);\n    if (hint === 'number') return 42;\n    if (hint === 'string') return 'hello';\n    return 'default';\n  },\n  valueOf() { return 100; },\n  toString() { return 'world'; }\n};\n\nconsole.log(+obj);        // hint: number, 42\nconsole.log(`${obj}`);    // hint: string, 'hello'\nconsole.log(obj + '');    // hint: default, 'default'\n\n// 转换优先级：\n// 1. Symbol.toPrimitive\n// 2. valueOf() / toString() (根据hint)\n// 3. 报错"
      },
      "source": "Symbol.toPrimitive"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["一元+"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(+'123');\nconsole.log(+'12a');\nconsole.log(+[]);\nconsole.log(+[1,2]);",
      "options": [
        "123, NaN, 0, NaN",
        "123, 12, 0, 3",
        "'123', NaN, [], NaN",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "一元+转数字",
        "code": "// 一元+会转换为数字\nconsole.log(+'123');   // 123\nconsole.log(+'12a');   // NaN\nconsole.log(+[]);      // 0\nconsole.log(+[1,2]);   // NaN\nconsole.log(+true);    // 1\nconsole.log(+false);   // 0\nconsole.log(+null);    // 0\nconsole.log(+undefined); // NaN\n\n// 数组转换过程：\n// [].valueOf() → [] (对象)\n// [].toString() → ''\n// Number('') → 0\n\n// [1,2].toString() → '1,2'\n// Number('1,2') → NaN"
      },
      "source": "一元+"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["ToBoolean"],
      "question": "ToBoolean转换为false的有哪些？",
      "options": [
        "undefined",
        "null",
        "0, -0, NaN",
        "false",
        "空字符串''",
        "空数组[]"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "ToBoolean规则",
        "code": "// 假值（Falsy）：只有7个\nBoolean(undefined);  // false\nBoolean(null);       // false\nBoolean(0);          // false\nBoolean(-0);         // false\nBoolean(NaN);        // false\nBoolean(false);      // false\nBoolean('');         // false\n\n// 其他都是真值（Truthy）\nBoolean([]);         // true ✅\nBoolean({});         // true\nBoolean('0');        // true\nBoolean('false');    // true\nBoolean(function(){});  // true\n\n// 注意：\n// [] == false  // true (类型转换)\n// !![]         // true (布尔转换)"
      },
      "source": "ToBoolean"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["Number vs parseInt"],
      "question": "Number('123abc')和parseInt('123abc')结果相同",
      "correctAnswer": "B",
      "explanation": {
        "title": "Number vs parseInt",
        "code": "// Number：严格转换\nNumber('123abc');    // NaN\nNumber('123');       // 123\nNumber('');          // 0\nNumber('0x10');      // 16\n\n// parseInt：解析到非数字停止\nparseInt('123abc');  // 123\nparseInt('abc123');  // NaN\nparseInt('');        // NaN\nparseInt('0x10');    // 16\n\n// parseFloat\nparseFloat('12.5a'); // 12.5\nparseFloat('a12.5'); // NaN\n\n// 建议：\n// - 严格转换用Number()\n// - 解析字符串用parseInt/parseFloat"
      },
      "source": "Number vs parseInt"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["JSON.stringify"],
      "question": "JSON.stringify的特殊转换，空白处填什么？",
      "code": "const obj = {\n  a: undefined,\n  b: function() {},\n  c: Symbol('c'),\n  d: 1\n};\n\nJSON.stringify(obj); // 结果？",
      "options": [
        "'{\"d\":1}'",
        "'{\"a\":null,\"b\":null,\"c\":null,\"d\":1}'",
        "'{\"a\":undefined,\"b\":function(){},\"c\":Symbol(c),\"d\":1}'",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JSON.stringify转换规则",
        "code": "// undefined、函数、Symbol会被忽略\nconst obj = {\n  a: undefined,\n  b: function() {},\n  c: Symbol('c'),\n  d: 1\n};\n\nJSON.stringify(obj); // '{\"d\":1}'\n\n// 数组中会转为null\nJSON.stringify([1, undefined, function(){}, 4]);\n// '[1,null,null,4]'\n\n// 特殊值转换\nJSON.stringify(NaN);        // 'null'\nJSON.stringify(Infinity);   // 'null'\nJSON.stringify(null);       // 'null'\n\n// toJSON方法\nconst obj2 = {\n  x: 1,\n  toJSON() {\n    return { y: 2 };\n  }\n};\nJSON.stringify(obj2); // '{\"y\":2}'"
      },
      "source": "JSON.stringify"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "类型转换的最佳实践有哪些？",
      "options": [
        "使用===避免隐式转换",
        "显式转换优于隐式转换",
        "Number()优于+运算符",
        "使用!!转布尔值",
        "避免复杂的类型转换",
        "利用隐式转换简化代码"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "类型转换最佳实践",
        "code": "// 1. 使用===\nif (x === 0) {}  // ✅\nif (x == 0) {}   // ❌\n\n// 2. 显式转换\nconst num = Number(str);     // ✅ 清晰\nconst num2 = +str;           // ❌ 不直观\n\n// 3. 转布尔值\nconst bool = Boolean(value); // ✅\nconst bool2 = !!value;       // ✅ 也可以\n\n// 4. 转字符串\nconst str = String(value);   // ✅\nconst str2 = value + '';     // ❌ 不清晰\n\n// 5. 避免复杂转换\n// ❌ 不好\nif ([] == false) {}\nif ({} + [] === '[object Object]') {}\n\n// ✅ 好\nif (array.length === 0) {}\nif (typeof obj === 'object') {}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "继承模式演进史",
      "url": "15-03-inheritance.html"
    },
    "next": {
      "title": "相等性比较算法",
      "url": "16-02-equality.html"
    }
  }
};
