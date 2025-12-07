/**
 * ES6+新特性
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2301ES6Features = {
  "config": {
    "title": "ES6+新特性",
    "icon": "✨",
    "description": "深入理解ES6及后续版本的重要新特性",
    "primaryColor": "#ec4899",
    "bgGradient": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["解构赋值"],
      "question": "解构赋值可以设置默认值吗？",
      "options": [
        "可以",
        "不可以",
        "只有数组可以",
        "只有对象可以"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "解构默认值",
        "code": "// 数组解构默认值\nconst [a = 1, b = 2] = [10];\nconsole.log(a, b);  // 10, 2\n\n// 对象解构默认值\nconst { x = 1, y = 2 } = { x: 10 };\nconsole.log(x, y);  // 10, 2\n\n// 注意：只有undefined触发默认值\nconst [c = 1] = [null];\nconsole.log(c);  // null（不是undefined）\n\nconst [d = 1] = [undefined];\nconsole.log(d);  // 1\n\n// 默认值表达式\nfunction getDefault() {\n  console.log('计算默认值');\n  return 100;\n}\n\nconst [e = getDefault()] = [10];\n// 不输出'计算默认值'（不需要默认值）\n\nconst [f = getDefault()] = [];\n// 输出'计算默认值'，f = 100\n\n// 解构+重命名+默认值\nconst { name: userName = 'Guest' } = {};\nconsole.log(userName);  // 'Guest'"
      },
      "source": "解构赋值"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["展开运算符"],
      "question": "以下代码的输出是什么？",
      "code": "const obj1 = { a: 1, b: 2 };\nconst obj2 = { b: 3, c: 4 };\nconst result = { ...obj1, ...obj2, b: 5 };\nconsole.log(result);",
      "options": [
        "{ a: 1, b: 5, c: 4 }",
        "{ a: 1, b: 3, c: 4 }",
        "{ a: 1, b: 2, c: 4 }",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "对象展开运算符",
        "code": "const obj1 = { a: 1, b: 2 };\nconst obj2 = { b: 3, c: 4 };\n\n// 后面的属性会覆盖前面的\nconst result = { ...obj1, ...obj2, b: 5 };\n// 等价于：\n// { a: 1, b: 2, b: 3, c: 4, b: 5 }\n// 最终：{ a: 1, b: 5, c: 4 }\n\nconsole.log(result);  // { a: 1, b: 5, c: 4 }\n\n// 展开顺序很重要\nconst r1 = { a: 1, ...obj1 };  // { a: 1, b: 2 }\nconst r2 = { ...obj1, a: 1 };  // { a: 1, b: 2 }\n\n// 浅拷贝\nconst original = { a: { b: 1 } };\nconst copy = { ...original };\n\ncopy.a.b = 2;\nconsole.log(original.a.b);  // 2（浅拷贝）\n\n// 数组展开\nconst arr1 = [1, 2];\nconst arr2 = [3, 4];\nconst arr3 = [...arr1, ...arr2];  // [1, 2, 3, 4]\n\n// 函数参数展开\nconst numbers = [1, 2, 3];\nMath.max(...numbers);  // 3"
      },
      "source": "展开运算符"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Optional Chaining"],
      "question": "可选链操作符（?.）的特点？",
      "options": [
        "避免深层属性访问报错",
        "左侧为null/undefined时返回undefined",
        "可用于函数调用",
        "可用于数组索引",
        "总是返回true/false",
        "可以赋值"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "可选链操作符",
        "code": "// 1. 属性访问\nconst user = null;\nconst name = user?.name;  // undefined（不报错）\n\n// vs 传统方式\nconst name2 = user && user.name;\n\n// 2. 深层访问\nconst city = user?.address?.city;\n// 等价于：\nconst city2 = user && user.address && user.address.city;\n\n// 3. 函数调用\nconst result = obj.method?.();\n// 如果method存在则调用，否则返回undefined\n\n// 4. 数组索引\nconst first = arr?.[0];\n\n// 5. 组合使用\nconst value = obj?.prop?.[0]?.method?.();\n\n// 注意：不能用于赋值\n// obj?.prop = 1;  // SyntaxError\n\n// 短路求值\nconst a = null;\nconst b = a?.b.c.d;  // undefined\n// a是null，短路，不会访问b.c.d\n\n// 与空值合并\nconst port = config?.port ?? 8080;\n// 如果config或port是null/undefined，使用8080"
      },
      "source": "Optional Chaining"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["Nullish Coalescing"],
      "question": "空值合并运算符（??）只在左侧为null或undefined时返回右侧",
      "correctAnswer": "A",
      "explanation": {
        "title": "空值合并运算符",
        "code": "// ?? 只判断 null 和 undefined\n\nconst a = 0 ?? 'default';        // 0\nconst b = '' ?? 'default';       // ''\nconst c = false ?? 'default';    // false\nconst d = null ?? 'default';     // 'default'\nconst e = undefined ?? 'default'; // 'default'\n\n// vs || 运算符\nconst a2 = 0 || 'default';        // 'default'\nconst b2 = '' || 'default';       // 'default'\nconst c2 = false || 'default';    // 'default'\n\n// 实际应用\nfunction setPort(config) {\n  // ❌ 使用 ||，0 会被当作假值\n  const port = config.port || 8080;\n  // config.port = 0 时，port = 8080（错误！）\n  \n  // ✅ 使用 ??\n  const port2 = config.port ?? 8080;\n  // config.port = 0 时，port2 = 0（正确）\n}\n\n// 链式使用\nconst value = a ?? b ?? c ?? 'default';\n\n// 不能与 && 或 || 直接混用\n// const x = a || b ?? c;  // SyntaxError\nconst x = (a || b) ?? c;  // ✅ 需要括号"
      },
      "source": "Nullish Coalescing"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Class私有字段"],
      "question": "定义私有字段，空白处填什么？",
      "code": "class Counter {\n  ______count = 0;\n  \n  increment() {\n    this.______count++;\n  }\n  \n  getCount() {\n    return this.______count;\n  }\n}",
      "options": [
        "#, #, #",
        "private, private, private",
        "_, _, _",
        "@, @, @"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "私有字段（Private Fields）",
        "code": "// # 定义私有字段（ES2022）\nclass Counter {\n  #count = 0;  // 私有字段\n  \n  increment() {\n    this.#count++;  // 类内部访问\n  }\n  \n  getCount() {\n    return this.#count;\n  }\n}\n\nconst counter = new Counter();\ncounter.increment();\nconsole.log(counter.getCount());  // 1\n\n// ❌ 外部无法访问\nconsole.log(counter.#count);  // SyntaxError\n\n// 私有方法\nclass MyClass {\n  #privateMethod() {\n    return 'private';\n  }\n  \n  publicMethod() {\n    return this.#privateMethod();\n  }\n}\n\n// 静态私有字段\nclass Database {\n  static #instance;\n  \n  static getInstance() {\n    if (!Database.#instance) {\n      Database.#instance = new Database();\n    }\n    return Database.#instance;\n  }\n}\n\n// 私有getter/setter\nclass Person {\n  #age;\n  \n  get #privateAge() {\n    return this.#age;\n  }\n  \n  set #privateAge(value) {\n    if (value < 0) throw new Error('Invalid age');\n    this.#age = value;\n  }\n}\n\n// 注意：# 是字段名的一部分\nclass Test {\n  #x = 1;\n  x = 2;\n  \n  getX() {\n    return this.#x;  // 1（不同字段）\n  }\n}"
      },
      "source": "私有字段"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["逻辑赋值"],
      "question": "逻辑赋值运算符的输出？",
      "code": "let a = 0;\nlet b = null;\nlet c = 5;\n\na ||= 10;\nb ??= 20;\nc &&= 30;\n\nconsole.log(a, b, c);",
      "options": [
        "10, 20, 30",
        "0, 20, 30",
        "10, null, 5",
        "0, null, 30"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "逻辑赋值运算符",
        "code": "// ES2021引入三种逻辑赋值运算符\n\n// 1. ||= (逻辑或赋值)\nlet a = 0;\na ||= 10;  // a = a || 10\nconsole.log(a);  // 10（0是假值）\n\na = 5;\na ||= 10;\nconsole.log(a);  // 5（已有值）\n\n// 2. ??= (空值合并赋值)\nlet b = null;\nb ??= 20;  // b = b ?? 20\nconsole.log(b);  // 20（null）\n\nb = 0;\nb ??= 30;\nconsole.log(b);  // 0（不是null/undefined）\n\n// 3. &&= (逻辑与赋值)\nlet c = 5;\nc &&= 30;  // c = c && 30\nconsole.log(c);  // 30（c是真值）\n\nc = 0;\nc &&= 40;\nconsole.log(c);  // 0（c是假值）\n\n// 实际应用\nclass Config {\n  constructor(options = {}) {\n    this.port ??= 8080;  // 默认值\n    this.host ||= 'localhost';  // 默认值\n  }\n}\n\n// 条件赋值\nfunction updateUser(user, updates) {\n  user.name &&= updates.name;  // 只在已有name时更新\n  user.email ||= updates.email;  // 提供默认email\n  user.age ??= updates.age;  // null/undefined时设置\n}"
      },
      "source": "逻辑赋值"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["数值分隔符"],
      "question": "数值分隔符（Numeric Separators）的特点？",
      "options": [
        "使用下划线分隔数字",
        "提高大数字可读性",
        "不影响数值大小",
        "可用于二进制/八进制/十六进制",
        "可以在任意位置",
        "编译时会被移除"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "数值分隔符",
        "code": "// 数值分隔符（ES2021）\n\n// 十进制\nconst billion = 1_000_000_000;\nconst price = 123_456.78;\n\n// 二进制\nconst binary = 0b1010_0001_1000_0101;\n\n// 八进制\nconst octal = 0o123_456;\n\n// 十六进制\nconst hex = 0xFF_EC_DE_5E;\n\n// BigInt\nconst huge = 1_000_000_000_000n;\n\n// 不影响值\nconsole.log(1_000 === 1000);  // true\n\n// ❌ 限制\n// 不能在开头/结尾\n// const x = _123;  // SyntaxError\n// const y = 123_;  // SyntaxError\n\n// 不能连续使用\n// const z = 1__000;  // SyntaxError\n\n// 不能在小数点旁边\n// const w = 3._14;  // SyntaxError\n// const v = 3_.14;  // SyntaxError\n\n// ✅ 正确用法\nconst million = 1_000_000;\nconst card = 1234_5678_9012_3456;\nconst bytes = 0b1111_1010_1011_1100;\nconst address = 0xDEAD_BEEF;\n\n// 编译后移除\n// 源码: const x = 1_000;\n// 编译: const x = 1000;"
      },
      "source": "数值分隔符"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Promise.allSettled"],
      "question": "Promise.allSettled等待所有Promise完成，不管成功还是失败",
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise.allSettled",
        "code": "// Promise.allSettled（ES2020）\n// 等待所有Promise完成，返回所有结果\n\nconst promises = [\n  Promise.resolve(1),\n  Promise.reject('error'),\n  Promise.resolve(3)\n];\n\nconst results = await Promise.allSettled(promises);\nconsole.log(results);\n/*\n[\n  { status: 'fulfilled', value: 1 },\n  { status: 'rejected', reason: 'error' },\n  { status: 'fulfilled', value: 3 }\n]\n*/\n\n// vs Promise.all（一个失败就失败）\ntry {\n  await Promise.all(promises);\n} catch (e) {\n  console.log(e);  // 'error'\n  // 其他结果丢失！\n}\n\n// 应用：批量操作允许部分失败\nconst uploadResults = await Promise.allSettled(\n  files.map(file => uploadFile(file))\n);\n\nconst succeeded = uploadResults.filter(\n  r => r.status === 'fulfilled'\n);\n\nconst failed = uploadResults.filter(\n  r => r.status === 'rejected'\n);\n\nconsole.log(`成功: ${succeeded.length}, 失败: ${failed.length}`);"
      },
      "source": "allSettled"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Object.hasOwn"],
      "question": "检查自有属性，空白处填什么？",
      "code": "const obj = { x: 1 };\n\n// ES2022新方法\nif (______.hasOwn(obj, 'x')) {\n  console.log('有x属性');\n}",
      "options": [
        "Object",
        "obj",
        "Reflect",
        "this"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Object.hasOwn",
        "code": "// Object.hasOwn（ES2022）\n// 更安全的hasOwnProperty\n\nconst obj = { x: 1 };\n\n// ✅ 新方法\nObject.hasOwn(obj, 'x');  // true\n\n// vs 旧方法\nobj.hasOwnProperty('x');  // true\nObject.prototype.hasOwnProperty.call(obj, 'x');  // true\n\n// 为什么需要Object.hasOwn？\n\n// 1. obj可能没有hasOwnProperty\nconst obj2 = Object.create(null);\n// obj2.hasOwnProperty('x');  // TypeError\nObject.hasOwn(obj2, 'x');  // ✅ false\n\n// 2. hasOwnProperty可能被覆盖\nconst obj3 = {\n  x: 1,\n  hasOwnProperty: () => false  // 被覆盖\n};\n\nobj3.hasOwnProperty('x');  // false（错误）\nObject.hasOwn(obj3, 'x');  // true（正确）\n\n// 3. 更简洁\nconst has = Object.hasOwn;  // 可以提取\nif (has(obj, 'x')) {}\n\n// vs\nconst has2 = Object.prototype.hasOwnProperty;\nif (has2.call(obj, 'x')) {}  // 需要call"
      },
      "source": "Object.hasOwn"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "ES6+特性的最佳实践？",
      "options": [
        "优先使用const/let",
        "使用解构简化代码",
        "可选链避免深层检查",
        "所有变量都用var",
        "使用模板字符串",
        "善用展开运算符"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "ES6+最佳实践",
        "code": "// 1. const/let替代var\n// ✅\nconst PI = 3.14;\nlet count = 0;\n\n// ❌\nvar old = 1;\n\n// 2. 解构简化\n// ✅\nconst { name, age } = user;\nconst [first, second] = arr;\n\n// ❌\nconst name = user.name;\nconst age = user.age;\n\n// 3. 可选链\n// ✅\nconst city = user?.address?.city;\n\n// ❌\nconst city2 = user && user.address && user.address.city;\n\n// 4. 模板字符串\n// ✅\nconst msg = `Hello ${name}, you are ${age} years old`;\n\n// ❌\nconst msg2 = 'Hello ' + name + ', you are ' + age + ' years old';\n\n// 5. 展开运算符\n// ✅ 拷贝\nconst copy = { ...original };\nconst arr2 = [...arr1];\n\n// ✅ 合并\nconst merged = { ...obj1, ...obj2 };\n\n// 6. 箭头函数\n// ✅\nconst double = x => x * 2;\narr.map(x => x * 2);\n\n// 7. 默认参数\n// ✅\nfunction greet(name = 'Guest') {\n  return `Hello ${name}`;\n}\n\n// 8. 私有字段\n// ✅\nclass Counter {\n  #count = 0;\n  increment() { this.#count++; }\n}\n\n// 9. 空值合并\n// ✅\nconst port = config.port ?? 8080;\n\n// 10. Promise方法\n// ✅\nconst results = await Promise.allSettled(promises);\nconst first = await Promise.any(promises);"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "V8内存管理",
      "url": "22-03-v8-memory.html"
    },
    "next": {
      "title": "ES2020+特性",
      "url": "23-02-es2020-plus.html"
    }
  }
};
