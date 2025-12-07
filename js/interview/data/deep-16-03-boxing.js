/**
 * 装箱与拆箱
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1603Boxing = {
  "config": {
    "title": "装箱与拆箱",
    "icon": "📦",
    "description": "深入理解原始值与包装对象的转换机制",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["装箱"],
      "question": "装箱（Boxing）是指什么？",
      "options": [
        "将原始值转换为对应的包装对象",
        "将对象转换为原始值",
        "将数字转换为字符串",
        "将undefined转换为null"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "装箱操作",
        "code": "// 装箱：原始值 → 包装对象\nconst str = 'hello';\nconst strObj = new String('hello');\n\ntypeof str;    // 'string' (原始值)\ntypeof strObj; // 'object' (包装对象)\n\n// 自动装箱\nstr.toUpperCase();  // JavaScript自动装箱\n// 等价于\nnew String(str).toUpperCase();\n\n// 包装类型\nnew Number(123);\nnew String('text');\nnew Boolean(true);"
      },
      "source": "装箱"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["自动装箱"],
      "question": "以下代码的输出是什么？",
      "code": "const str = 'hello';\nstr.x = 10;\nconsole.log(str.x);",
      "options": [
        "undefined",
        "10",
        "报错",
        "null"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "临时包装对象",
        "code": "const str = 'hello';\n\n// 赋值时自动装箱\nstr.x = 10;\n// 等价于\n// const temp = new String(str);\n// temp.x = 10;\n// temp被丢弃\n\n// 读取时又创建新的临时对象\nconsole.log(str.x);  // undefined\n// 等价于\n// const temp2 = new String(str);\n// console.log(temp2.x);  // undefined\n\n// 每次都是新对象！\nstr.x = 10;\nstr.y = 20;\nconsole.log(str.x);  // undefined\nconsole.log(str.y);  // undefined"
      },
      "source": "临时对象"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["包装对象"],
      "question": "关于包装对象说法正确的是？",
      "options": [
        "可以通过new创建",
        "原始值可以调用包装对象的方法",
        "包装对象转布尔值都是true",
        "不推荐显式创建包装对象",
        "Symbol没有包装对象",
        "BigInt有包装对象"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "包装对象特性",
        "code": "// 1. 显式创建\nconst numObj = new Number(123);\ntypeof numObj;  // 'object'\n\n// 2. 原始值调用方法（自动装箱）\n(123).toFixed(2);  // '123.00'\n'hello'.toUpperCase();  // 'HELLO'\n\n// 3. 包装对象都是truthy\nBoolean(new Boolean(false));  // true ⚠️\nif (new Boolean(false)) {     // 会执行\n  console.log('执行');\n}\n\n// 4. 不推荐显式创建\n// ❌ 不好\nconst x = new Number(123);\n// ✅ 好\nconst x = 123;\n\n// 5. Symbol和BigInt\nnew Symbol();   // TypeError (不能用new)\nnew BigInt(1);  // TypeError (不能用new)\nSymbol();       // ✅ 返回symbol值\nBigInt(1);      // ✅ 返回bigint值"
      },
      "source": "包装对象"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["拆箱"],
      "question": "拆箱操作会调用valueOf()或toString()方法",
      "correctAnswer": "A",
      "explanation": {
        "title": "拆箱操作",
        "code": "// 拆箱：包装对象 → 原始值\nconst numObj = new Number(123);\nconst num = numObj.valueOf();  // 123\n\n// 自动拆箱（ToPrimitive）\nconst str = new String('hello');\nconsole.log(str + ' world');  // 'hello world'\n\n// 拆箱顺序：\n// 数值上下文: valueOf() → toString()\nconst obj1 = new Number(123);\n+obj1;  // 调用valueOf() → 123\n\n// 字符串上下文: toString() → valueOf()\nconst obj2 = new String('hello');\n`${obj2}`;  // 调用toString() → 'hello'\n\n// 自定义拆箱\nconst obj3 = {\n  valueOf() { return 42; },\n  toString() { return 'obj'; }\n};\n+obj3;     // 42 (valueOf)\n`${obj3}`;  // 'obj' (toString)"
      },
      "source": "拆箱"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["valueOf"],
      "question": "自定义valueOf，空白处填什么？",
      "code": "const obj = {\n  value: 100,\n  valueOf() {\n    return ______;\n  }\n};\n\nconsole.log(+obj);  // 100",
      "options": [
        "this.value",
        "this",
        "100",
        "obj.value"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "valueOf实现",
        "code": "const obj = {\n  value: 100,\n  valueOf() {\n    return this.value;\n  },\n  toString() {\n    return `Value: ${this.value}`;\n  }\n};\n\n// 数值上下文\nconsole.log(+obj);      // 100 (valueOf)\nconsole.log(obj - 0);   // 100 (valueOf)\n\n// 字符串上下文\nconsole.log(`${obj}`);  // 'Value: 100' (toString)\nconsole.log(String(obj)); // 'Value: 100'\n\n// 内置类型的valueOf\n(new Number(42)).valueOf();    // 42\n(new String('hi')).valueOf();  // 'hi'\n(new Boolean(true)).valueOf(); // true\n(new Date()).valueOf();        // 时间戳\n([1,2,3]).valueOf();           // [1,2,3] (返回自身)"
      },
      "source": "valueOf"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["比较陷阱"],
      "question": "以下代码的输出是什么？",
      "code": "const a = new String('hello');\nconst b = new String('hello');\n\nconsole.log(a == b);\nconsole.log(a === b);\nconsole.log(a.valueOf() === b.valueOf());",
      "options": [
        "false, false, true",
        "true, false, true",
        "true, true, true",
        "false, false, false"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "包装对象比较",
        "code": "const a = new String('hello');\nconst b = new String('hello');\n\n// 对象比较引用\nconsole.log(a == b);   // false (不同对象)\nconsole.log(a === b);  // false\n\n// 拆箱后比较\nconsole.log(a.valueOf() === b.valueOf());  // true\n\n// 原始值比较\nconst c = 'hello';\nconst d = 'hello';\nconsole.log(c === d);  // true\n\n// 混合比较\nconsole.log(a == c);   // true (a自动拆箱)\nconsole.log(a === c);  // false (类型不同)"
      },
      "source": "包装对象比较"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["typeof"],
      "question": "typeof对包装对象的返回值是？",
      "options": [
        "new Number() 返回 'object'",
        "new String() 返回 'string'",
        "new Boolean() 返回 'object'",
        "Number() 返回 'number'",
        "String() 返回 'string'",
        "Boolean() 返回 'boolean'"
      ],
      "correctAnswer": ["A", "C", "D", "E", "F"],
      "explanation": {
        "title": "typeof与包装对象",
        "code": "// 包装对象：返回'object'\ntypeof new Number(123);   // 'object'\ntypeof new String('hi');  // 'object'\ntypeof new Boolean(true); // 'object'\n\n// 转换函数：返回原始类型\ntypeof Number('123');     // 'number'\ntypeof String(123);       // 'string'\ntypeof Boolean(1);        // 'boolean'\n\n// 原始值\ntypeof 123;               // 'number'\ntypeof 'hi';              // 'string'\ntypeof true;              // 'boolean'\n\n// 判断是否为包装对象\nfunction isWrapped(value) {\n  return value instanceof Number ||\n         value instanceof String ||\n         value instanceof Boolean;\n}"
      },
      "source": "typeof"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Object()"],
      "question": "Object(原始值)会返回对应的包装对象",
      "correctAnswer": "A",
      "explanation": {
        "title": "Object()装箱",
        "code": "// Object()可以装箱任何原始值\nconst num = Object(123);\ntypeof num;  // 'object'\nnum instanceof Number;  // true\n\nconst str = Object('hello');\nstr instanceof String;  // true\n\nconst bool = Object(true);\nbool instanceof Boolean;  // true\n\n// 对象直接返回\nconst obj = {};\nObject(obj) === obj;  // true\n\n// null和undefined\nconst n = Object(null);\nn instanceof Object;  // true (空对象)\n\nconst u = Object(undefined);\nu instanceof Object;  // true (空对象)"
      },
      "source": "Object()"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["拆箱优先级"],
      "question": "Symbol.toPrimitive优先级，空白处填什么？",
      "code": "const obj = {\n  [Symbol.toPrimitive](hint) {\n    return 'primitive';\n  },\n  valueOf() { return 1; },\n  toString() { return '2'; }\n};\n\nconsole.log(______);  // 'primitive'",
      "options": [
        "+obj",
        "obj.valueOf()",
        "obj.toString()",
        "String(obj)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "拆箱优先级",
        "code": "// 拆箱方法调用顺序：\n// 1. Symbol.toPrimitive (最高优先级)\n// 2. valueOf() / toString() (根据hint)\n\nconst obj = {\n  [Symbol.toPrimitive](hint) {\n    console.log('toPrimitive:', hint);\n    return 'primitive';\n  },\n  valueOf() {\n    console.log('valueOf');\n    return 1;\n  },\n  toString() {\n    console.log('toString');\n    return '2';\n  }\n};\n\n// Symbol.toPrimitive优先\nconsole.log(+obj);     // 'primitive' (不调用valueOf)\nconsole.log(`${obj}`); // 'primitive' (不调用toString)\n\n// 没有Symbol.toPrimitive时：\nconst obj2 = {\n  valueOf() { return 1; },\n  toString() { return '2'; }\n};\n\n+obj2;      // 1 (valueOf)\n`${obj2}`;  // '2' (toString)"
      },
      "source": "拆箱优先级"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "关于装箱拆箱的最佳实践？",
      "options": [
        "避免显式创建包装对象",
        "使用valueOf()手动拆箱",
        "利用自动装箱调用方法",
        "包装对象转布尔值需注意",
        "总是用new创建对象",
        "用Object()统一装箱"
      ],
      "correctAnswer": ["A", "C", "D"],
      "explanation": {
        "title": "装箱拆箱最佳实践",
        "code": "// 1. 避免显式创建包装对象\n// ❌ 不好\nconst num = new Number(123);\n// ✅ 好\nconst num = 123;\n\n// 2. 利用自动装箱\n// ✅ 直接调用方法\nconst str = 'hello';\nstr.toUpperCase();  // JavaScript自动装箱\n\n// 3. 注意包装对象的布尔值\n// ❌ 陷阱\nif (new Boolean(false)) {  // true!\n  console.log('执行');\n}\n\n// ✅ 正确\nif (Boolean(false)) {  // false\n  console.log('不执行');\n}\n\n// 4. 类型判断\n// ❌ typeof对包装对象不准确\ntypeof new Number(123);  // 'object'\n\n// ✅ 使用instanceof\nconst x = new Number(123);\nx instanceof Number;  // true\n\n// 5. 比较时注意\nconst a = new String('hi');\nconst b = 'hi';\na == b;   // true (自动拆箱)\na === b;  // false (类型不同)"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "相等性比较算法",
      "url": "16-02-equality.html"
    },
    "next": {
      "title": "迭代器协议",
      "url": "17-01-iterator-protocol.html"
    }
  }
};
