/**
 * Symbol详解
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep2002Symbol = {
  "config": {
    "title": "Symbol详解",
    "icon": "🔣",
    "description": "深入理解Symbol的特性和内置Symbol",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["Symbol基础"],
      "question": "Symbol的主要用途是什么？",
      "options": [
        "创建唯一的属性键",
        "加密数据",
        "提高性能",
        "替代字符串"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol唯一性",
        "code": "// Symbol创建唯一值\nconst sym1 = Symbol('desc');\nconst sym2 = Symbol('desc');\n\nconsole.log(sym1 === sym2); // false\n\n// 作为对象属性键\nconst obj = {\n  [sym1]: 'value1',\n  [sym2]: 'value2'\n};\n\nconsole.log(obj[sym1]); // 'value1'\nconsole.log(obj[sym2]); // 'value2'\n\n// 避免属性名冲突\nconst ID = Symbol('id');\nconst user = {\n  name: 'John',\n  [ID]: 12345  // 不会与其他属性冲突\n};"
      },
      "source": "Symbol"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Symbol遍历"],
      "question": "以下代码的输出是什么？",
      "code": "const sym = Symbol('test');\nconst obj = {\n  name: 'John',\n  [sym]: 'symbol value'\n};\n\nconsole.log(Object.keys(obj));\nconsole.log(Object.getOwnPropertySymbols(obj));",
      "options": [
        "['name'], [Symbol(test)]",
        "['name', Symbol(test)], []",
        "['name'], []",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol属性不可枚举",
        "code": "const sym = Symbol('test');\nconst obj = {\n  name: 'John',\n  [sym]: 'symbol value'\n};\n\n// Symbol属性不出现在常规遍历中\nObject.keys(obj);           // ['name']\nObject.getOwnPropertyNames(obj); // ['name']\nfor (let key in obj) {}     // 只有'name'\n\n// 需要专门的方法获取\nObject.getOwnPropertySymbols(obj); // [Symbol(test)]\n\n// 获取所有属性（包括Symbol）\nReflect.ownKeys(obj); // ['name', Symbol(test)]\n\n// 应用：实现真正的私有属性\nconst _private = Symbol('private');\nclass MyClass {\n  constructor() {\n    this[_private] = 'secret';\n  }\n}"
      },
      "source": "Symbol遍历"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["内置Symbol"],
      "question": "JavaScript内置了哪些知名Symbol？",
      "options": [
        "Symbol.iterator",
        "Symbol.toStringTag",
        "Symbol.hasInstance",
        "Symbol.private",
        "Symbol.toPrimitive",
        "Symbol.species"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "内置Symbol（Well-known Symbols）",
        "code": "// 1. Symbol.iterator - 迭代器\nconst obj = {\n  *[Symbol.iterator]() {\n    yield 1;\n    yield 2;\n  }\n};\n\n// 2. Symbol.toStringTag - 类型标签\nclass MyClass {\n  get [Symbol.toStringTag]() {\n    return 'MyClass';\n  }\n}\nObject.prototype.toString.call(new MyClass()); // '[object MyClass]'\n\n// 3. Symbol.hasInstance - instanceof行为\nclass MyArray {\n  static [Symbol.hasInstance](instance) {\n    return Array.isArray(instance);\n  }\n}\n[] instanceof MyArray; // true\n\n// 4. Symbol.toPrimitive - 类型转换\nconst obj2 = {\n  [Symbol.toPrimitive](hint) {\n    if (hint === 'number') return 42;\n    if (hint === 'string') return 'hello';\n    return 'default';\n  }\n};\n+obj2; // 42\n\n// 5. Symbol.species - 派生对象类型\nclass MyArray extends Array {\n  static get [Symbol.species]() {\n    return Array;\n  }\n}"
      },
      "source": "内置Symbol"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["Symbol.for"],
      "question": "Symbol.for()创建的Symbol可以在全局共享",
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol.for全局注册",
        "code": "// Symbol.for()在全局Symbol注册表中查找/创建\nconst sym1 = Symbol.for('app.id');\nconst sym2 = Symbol.for('app.id');\n\nconsole.log(sym1 === sym2); // true（共享）\n\n// 普通Symbol不共享\nconst sym3 = Symbol('app.id');\nconst sym4 = Symbol('app.id');\n\nconsole.log(sym3 === sym4); // false\n\n// Symbol.keyFor()获取注册的key\nSymbol.keyFor(sym1); // 'app.id'\nSymbol.keyFor(sym3); // undefined（未注册）\n\n// 跨iframe/worker共享\n// iframe1\nconst id = Symbol.for('shared.id');\n\n// iframe2\nconst sameId = Symbol.for('shared.id');\nconsole.log(id === sameId); // true"
      },
      "source": "Symbol.for"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Symbol.toStringTag"],
      "question": "自定义toString标签，空白处填什么？",
      "code": "class Person {\n  get ______() {\n    return 'Person';\n  }\n}\n\nObject.prototype.toString.call(new Person()); // '[object Person]'",
      "options": [
        "[Symbol.toStringTag]",
        "toStringTag",
        "Symbol.toStringTag",
        "'Symbol.toStringTag'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol.toStringTag应用",
        "code": "// 自定义类型标签\nclass Person {\n  get [Symbol.toStringTag]() {\n    return 'Person';\n  }\n}\n\nconst p = new Person();\nObject.prototype.toString.call(p); // '[object Person]'\n\n// 内置类型的标签\nObject.prototype.toString.call([]); // '[object Array]'\nObject.prototype.toString.call({}); // '[object Object]'\nObject.prototype.toString.call(new Map()); // '[object Map]'\nObject.prototype.toString.call(new Set()); // '[object Set]'\n\n// 用于类型检测\nfunction getType(value) {\n  return Object.prototype.toString.call(value).slice(8, -1);\n}\n\ngetType(new Person()); // 'Person'\ngetType([]);           // 'Array'\ngetType({});           // 'Object'"
      },
      "source": "toStringTag"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Symbol.iterator"],
      "question": "自定义迭代器的输出？",
      "code": "const range = {\n  from: 1,\n  to: 3,\n  *[Symbol.iterator]() {\n    for (let i = this.from; i <= this.to; i++) {\n      yield i;\n    }\n  }\n};\n\nconsole.log([...range]);",
      "options": [
        "[1, 2, 3]",
        "[range]",
        "报错",
        "[]"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol.iterator自定义",
        "code": "// Symbol.iterator定义对象的迭代行为\nconst range = {\n  from: 1,\n  to: 3,\n  \n  *[Symbol.iterator]() {\n    for (let i = this.from; i <= this.to; i++) {\n      yield i;\n    }\n  }\n};\n\n// 展开运算符会调用迭代器\nconsole.log([...range]); // [1, 2, 3]\n\n// for...of也会调用\nfor (let num of range) {\n  console.log(num); // 1, 2, 3\n}\n\n// 字符串、数组、Map、Set都有默认迭代器\nconst str = 'hello';\nstr[Symbol.iterator]; // ƒ [Symbol.iterator]() { [native code] }\n\n// 普通对象没有迭代器\nconst obj = { a: 1 };\nobj[Symbol.iterator]; // undefined"
      },
      "source": "iterator"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Symbol应用"],
      "question": "Symbol的典型应用场景？",
      "options": [
        "定义私有属性",
        "避免属性名冲突",
        "实现协议和接口",
        "数据加密",
        "定义常量",
        "元编程"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "Symbol应用场景",
        "code": "// 1. 私有属性\nconst _private = Symbol('private');\nclass MyClass {\n  constructor() {\n    this[_private] = 'secret';\n  }\n  \n  getPrivate() {\n    return this[_private];\n  }\n}\n\n// 2. 避免冲突\nconst COLOR_RED = Symbol('red');\nconst COLOR_GREEN = Symbol('green');\n\nconst colors = {\n  [COLOR_RED]: '#ff0000',\n  [COLOR_GREEN]: '#00ff00'\n};\n\n// 3. 实现协议\nconst Comparable = {\n  [Symbol.for('compare')]: function(other) {\n    return this.value - other.value;\n  }\n};\n\nclass Point {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n  \n  [Symbol.for('compare')](other) {\n    return this.x - other.x;\n  }\n}\n\n// 4. 常量\nconst STATUS = {\n  PENDING: Symbol('pending'),\n  FULFILLED: Symbol('fulfilled'),\n  REJECTED: Symbol('rejected')\n};\n\n// 5. 元编程\nclass Collection {\n  [Symbol.iterator]() { /* ... */ }\n  [Symbol.toStringTag]() { return 'Collection'; }\n  [Symbol.toPrimitive](hint) { /* ... */ }\n}"
      },
      "source": "应用场景"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["Symbol类型"],
      "question": "Symbol不能使用new操作符",
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol不是构造函数",
        "code": "// Symbol不能用new\ntry {\n  const sym = new Symbol(); // TypeError\n} catch (e) {\n  console.log('Symbol不是构造函数');\n}\n\n// 只能直接调用\nconst sym = Symbol('description');\n\n// Symbol是原始类型\ntypeof Symbol(); // 'symbol'\n\n// 不能转换为数字\nNumber(Symbol()); // TypeError\n\n// 可以转换为字符串\nString(Symbol('test')); // 'Symbol(test)'\nSymbol('test').toString(); // 'Symbol(test)'\n\n// 可以转换为布尔值\nBoolean(Symbol()); // true\n\n// Symbol包装对象（很少使用）\nconst symObj = Object(Symbol('test'));\ntypeof symObj; // 'object'\nsymObj instanceof Symbol; // true"
      },
      "source": "Symbol类型"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Symbol.hasInstance"],
      "question": "自定义instanceof行为，空白处填什么？",
      "code": "class MyClass {\n  static ________(instance) {\n    return Array.isArray(instance);\n  }\n}\n\n[] instanceof MyClass; // true",
      "options": [
        "[Symbol.hasInstance]",
        "hasInstance",
        "instanceof",
        "Symbol.hasInstance"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Symbol.hasInstance",
        "code": "// 自定义instanceof行为\nclass MyArray {\n  static [Symbol.hasInstance](instance) {\n    return Array.isArray(instance);\n  }\n}\n\nconsole.log([] instanceof MyArray); // true\nconsole.log({} instanceof MyArray); // false\n\n// 实现类型检查工具\nclass PrimitiveNumber {\n  static [Symbol.hasInstance](instance) {\n    return typeof instance === 'number';\n  }\n}\n\n123 instanceof PrimitiveNumber; // true\n'123' instanceof PrimitiveNumber; // false\n\n// 注意：箭头函数无法重写\nconst NotConstructor = () => {};\nNotConstructor[Symbol.hasInstance] = function() {\n  return true;\n};\n// 无效，因为箭头函数没有prototype"
      },
      "source": "hasInstance"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "Symbol使用的最佳实践？",
      "options": [
        "用Symbol定义常量避免冲突",
        "使用Symbol.for共享Symbol",
        "避免将Symbol转为数字",
        "所有属性都用Symbol",
        "用Symbol实现私有属性",
        "记录Symbol的描述信息"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "Symbol最佳实践",
        "code": "// 1. 定义常量\nconst STATUS = {\n  LOADING: Symbol('loading'),\n  SUCCESS: Symbol('success'),\n  ERROR: Symbol('error')\n};\n\n// 2. 共享Symbol用Symbol.for\nconst SHARED_KEY = Symbol.for('app.key');\n\n// 其他模块可以访问\nconst sameKey = Symbol.for('app.key');\n\n// 3. 避免数字转换\n// ❌ 不要这样\nNumber(Symbol()); // TypeError\n\n// 4. 私有属性\nconst _private = Symbol('private');\nclass MyClass {\n  constructor() {\n    this[_private] = 'secret';\n  }\n}\n\n// 5. 添加描述\n// ✅ 好：有描述\nconst sym = Symbol('userId');\nconsole.log(sym.description); // 'userId'\n\n// ❌ 不好：无描述\nconst sym2 = Symbol();\nconsole.log(sym2.description); // undefined\n\n// 6. 用于元编程\nclass Collection {\n  [Symbol.iterator]() { /* 迭代器 */ }\n  [Symbol.toStringTag]() { return 'Collection'; }\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "Proxy与Reflect",
      "url": "20-01-proxy-reflect.html"
    },
    "next": {
      "title": "装饰器模式",
      "url": "20-03-decorator.html"
    }
  }
};
