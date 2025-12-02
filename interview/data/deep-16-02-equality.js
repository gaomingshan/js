/**
 * 相等性比较算法
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1602Equality = {
  "config": {
    "title": "相等性比较算法",
    "icon": "⚖️",
    "description": "深入理解==和===的区别以及SameValue算法",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["==vs==="],
      "question": "==和===的主要区别是什么？",
      "options": [
        "==会进行类型转换，===不会",
        "==比===快",
        "===可以比较对象，==不行",
        "没有区别"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "==vs===",
        "code": "// ===: 严格相等（不转换类型）\n1 === 1;       // true\n1 === '1';     // false\nnull === undefined;  // false\n\n// ==: 宽松相等（会转换类型）\n1 == '1';      // true\nnull == undefined;   // true\n0 == false;    // true\n'' == false;   // true\n\n// 推荐使用===\n// 只有一个例外：检查null/undefined\nif (x == null) {}  // 等价于 x === null || x === undefined"
      },
      "source": "相等比较"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["==转换规则"],
      "question": "以下代码的输出是什么？",
      "code": "console.log([] == ![]);\nconsole.log([] == false);\nconsole.log({} == false);",
      "options": [
        "true, true, false",
        "false, false, false",
        "true, false, false",
        "false, true, false"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "==转换步骤",
        "code": "// [] == ![]\n// 1. ![] → false (布尔转换)\n// 2. [] == false\n// 3. ToPrimitive([]) → '' (空字符串)\n// 4. '' == false\n// 5. ToNumber('') → 0, ToNumber(false) → 0\n// 6. 0 == 0 → true\n\nconsole.log([] == ![]);    // true\n\n// [] == false\n// ToPrimitive([]) → ''\n// '' == false\n// 0 == 0 → true\nconsole.log([] == false);  // true\n\n// {} == false\n// ToPrimitive({}) → '[object Object]'\n// '[object Object]' == false\n// NaN == 0 → false\nconsole.log({} == false);  // false"
      },
      "source": "==转换"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["==规则"],
      "question": "关于==比较规则，哪些是正确的？",
      "options": [
        "null == undefined为true",
        "NaN == NaN为false",
        "对象==对象比较引用",
        "字符串==数字时，字符串转数字",
        "布尔值==任意值时，布尔值转数字",
        "对象==字符串时，对象转字符串"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "==比较规则",
        "code": "// 1. null == undefined\nnull == undefined;  // true\nnull == 0;          // false\n\n// 2. NaN不等于任何值（包括自己）\nNaN == NaN;  // false\n\n// 3. 对象比较引用\nconst obj = {};\nobj == obj;  // true\n{} == {};    // false\n\n// 4. 字符串==数字\n'1' == 1;    // true (字符串转数字)\n\n// 5. 布尔值==任意值\ntrue == 1;   // true (true转1)\nfalse == 0;  // true (false转0)\n'1' == true; // true\n\n// 6. 对象==原始值\nconst obj = {\n  valueOf() { return 1; }\n};\nobj == 1;    // true"
      },
      "source": "==规则"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["Object.is"],
      "question": "Object.is(NaN, NaN)返回true",
      "correctAnswer": "A",
      "explanation": {
        "title": "Object.is vs ===",
        "code": "// Object.is使用SameValue算法\n\n// 与===的区别1：NaN\nNaN === NaN;          // false\nObject.is(NaN, NaN);  // true\n\n// 与===的区别2：+0和-0\n+0 === -0;            // true\nObject.is(+0, -0);    // false\n\n// 其他情况相同\nObject.is(1, 1);      // true\nObject.is('a', 'a');  // true\nObject.is({}, {});    // false\n\n// polyfill\nif (!Object.is) {\n  Object.is = function(x, y) {\n    if (x === y) {\n      // 处理+0和-0\n      return x !== 0 || 1 / x === 1 / y;\n    }\n    // 处理NaN\n    return x !== x && y !== y;\n  };\n}"
      },
      "source": "Object.is"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["SameValueZero"],
      "question": "Array.prototype.includes使用什么算法？",
      "code": "const arr = [NaN];\narr.includes(NaN);  // ?\narr.indexOf(NaN);   // ?",
      "options": [
        "true, -1",
        "false, -1",
        "true, 0",
        "false, 0"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "SameValueZero算法",
        "code": "// includes使用SameValueZero算法\n// - NaN等于NaN\n// - +0等于-0\n\nconst arr = [NaN];\narr.includes(NaN);   // true\narr.indexOf(NaN);    // -1 (indexOf用===)\n\n// Set也使用SameValueZero\nconst set = new Set([NaN, NaN]);\nset.size;  // 1 (NaN被认为相等)\n\n// Map的键也使用SameValueZero\nconst map = new Map();\nmap.set(NaN, 'value');\nmap.get(NaN);  // 'value'\n\n// 三种算法对比：\n// ===:            NaN !== NaN, +0 === -0\n// Object.is:      NaN === NaN, +0 !== -0\n// SameValueZero:  NaN === NaN, +0 === -0"
      },
      "source": "SameValueZero"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["特殊情况"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(null == 0);\nconsole.log(null >= 0);\nconsole.log(null <= 0);",
      "options": [
        "false, true, true",
        "true, true, true",
        "false, false, false",
        "true, false, false"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "null的特殊规则",
        "code": "// ==比较：null只等于undefined\nnull == 0;        // false\nnull == undefined; // true\n\n// 关系比较：null转为0\nnull >= 0;        // true (0 >= 0)\nnull <= 0;        // true (0 <= 0)\nnull > 0;         // false (0 > 0)\nnull < 0;         // false (0 < 0)\n\n// 这是规范的特殊规定！\n// ==和关系比较使用不同的转换规则\n\n// undefined的行为\nundefined == 0;   // false\nundefined >= 0;   // false (转为NaN)\nundefined <= 0;   // false"
      },
      "source": "null比较"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["字符串比较"],
      "question": "字符串比较规则正确的是？",
      "options": [
        "按字典序比较",
        "逐字符比较Unicode码点",
        "'a' < 'b'为true",
        "'10' < '9'为true",
        "大写字母 < 小写字母",
        "中文按拼音比较"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "字符串比较规则",
        "code": "// 字符串按Unicode码点比较\n'a' < 'b';   // true (97 < 98)\n'A' < 'a';   // true (65 < 97)\n\n// 字典序比较\n'10' < '9';  // true ('1' < '9')\n'abc' < 'abd';  // true\n\n// 中文也按Unicode\n'啊' < '吧';  // true (U+554A < U+5427)\n\n// 注意：不是拼音顺序！\n\n// 数字字符串比较\n'100' < '20';  // true (字符串比较)\nNumber('100') < Number('20');  // false (数字比较)\n\n// localeCompare：考虑地区规则\n'ä'.localeCompare('z', 'de');  // -1 (德语中ä < z)\n'ä'.localeCompare('z', 'sv');  // 1  (瑞典语中ä > z)"
      },
      "source": "字符串比较"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["对象比较"],
      "question": "两个内容相同的对象用==比较会返回true",
      "correctAnswer": "B",
      "explanation": {
        "title": "对象比较引用",
        "code": "// 对象比较引用，不比较内容\nconst obj1 = { x: 1 };\nconst obj2 = { x: 1 };\n\nobj1 == obj2;   // false (不同引用)\nobj1 === obj2;  // false\n\n// 同一引用\nconst obj3 = obj1;\nobj1 == obj3;   // true\nobj1 === obj3;  // true\n\n// 数组也是对象\n[] == [];       // false\n[1] == [1];     // false\n\n// 比较对象内容需要深度比较\nfunction deepEqual(a, b) {\n  if (a === b) return true;\n  if (typeof a !== 'object' || typeof b !== 'object') {\n    return false;\n  }\n  const keysA = Object.keys(a);\n  const keysB = Object.keys(b);\n  if (keysA.length !== keysB.length) return false;\n  return keysA.every(key => deepEqual(a[key], b[key]));\n}"
      },
      "source": "对象比较"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["自定义比较"],
      "question": "实现值相等判断，空白处填什么？",
      "code": "function equals(a, b) {\n  // 处理NaN\n  if (______ && ______) {\n    return true;\n  }\n  return a === b;\n}",
      "options": [
        "a !== a, b !== b",
        "isNaN(a), isNaN(b)",
        "typeof a === 'number', typeof b === 'number'",
        "Number.isNaN(a), Number.isNaN(b)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "NaN判断技巧",
        "code": "// NaN是唯一不等于自己的值\nfunction equals(a, b) {\n  // 处理NaN\n  if (a !== a && b !== b) {\n    return true;\n  }\n  return a === b;\n}\n\nequals(NaN, NaN);  // true\nequals(1, 1);      // true\nequals(1, 2);      // false\n\n// 更完整的实现\nfunction deepEquals(a, b) {\n  // 1. 严格相等\n  if (a === b) return true;\n  \n  // 2. NaN\n  if (a !== a && b !== b) return true;\n  \n  // 3. 类型不同\n  if (typeof a !== typeof b) return false;\n  \n  // 4. null\n  if (a === null || b === null) return false;\n  \n  // 5. 对象\n  if (typeof a === 'object') {\n    // 递归比较\n  }\n  \n  return false;\n}"
      },
      "source": "自定义比较"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "相等性比较的最佳实践有哪些？",
      "options": [
        "优先使用===",
        "检查null/undefined时可用==",
        "避免与true/false比较",
        "使用Object.is处理特殊值",
        "对象比较用JSON.stringify",
        "数字比较注意NaN"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "相等性比较最佳实践",
        "code": "// 1. 默认使用===\nif (x === 1) {}  // ✅\n\n// 2. null/undefined检查可用==\nif (x == null) {}  // ✅ 等价于 x === null || x === undefined\n\n// 3. 避免与布尔值比较\n// ❌ 不好\nif (x == true) {}\nif (x == false) {}\n\n// ✅ 好\nif (x) {}\nif (!x) {}\n\n// 4. 特殊值用Object.is\nif (Object.is(x, NaN)) {}  // ✅\n\n// 5. 不要用JSON.stringify比较对象\n// ❌ 不好：键顺序、undefined等问题\nJSON.stringify({a:1,b:2}) === JSON.stringify({b:2,a:1});  // false\n\n// ✅ 好：使用深度比较\nfunction deepEqual(a, b) { /* ... */ }\n\n// 6. 数组查找\n[1,2,NaN].indexOf(NaN);   // -1 ❌\n[1,2,NaN].includes(NaN);  // true ✅"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "类型强制转换规范",
      "url": "16-01-type-coercion.html"
    },
    "next": {
      "title": "装箱与拆箱",
      "url": "16-03-boxing.html"
    }
  }
};
