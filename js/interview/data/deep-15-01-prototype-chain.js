/**
 * 原型链的底层实现
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1501PrototypeChain = {
  "config": {
    "title": "原型链的底层实现",
    "icon": "🔗",
    "description": "深入理解原型链的底层机制、属性查找和性能影响",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["原型"],
      "question": "__proto__和prototype的区别是什么？",
      "options": [
        "__proto__是实例的原型指针，prototype是构造函数的原型对象",
        "两者完全相同",
        "__proto__是ES6的，prototype是ES5的",
        "prototype是实例属性"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "__proto__ vs prototype",
        "code": "function Person(name) {\n  this.name = name;\n}\n\nPerson.prototype.say = function() {\n  console.log(this.name);\n};\n\nconst p = new Person('Alice');\n\n// prototype: 构造函数的属性\nconsole.log(Person.prototype); // {say: f, constructor: f}\n\n// __proto__: 实例的原型指针\nconsole.log(p.__proto__ === Person.prototype); // true\n\n// 原型链\np.__proto__ === Person.prototype\nPerson.prototype.__proto__ === Object.prototype\nObject.prototype.__proto__ === null"
      },
      "source": "原型"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["原型链"],
      "question": "原型链的查找过程涉及哪些？",
      "options": [
        "对象自身属性",
        "原型对象属性",
        "原型的原型",
        "构造函数属性",
        "一直到Object.prototype",
        "最终到null"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "原型链查找",
        "code": "function Person(name) {\n  this.name = name;\n}\n\nPerson.prototype.sayName = function() {\n  console.log(this.name);\n};\n\nconst p = new Person('Alice');\n\n// 查找p.sayName()的过程：\n// 1. p自身 → 没有\n// 2. p.__proto__ (Person.prototype) → 找到 ✅\n\n// 查找p.toString()的过程：\n// 1. p自身 → 没有\n// 2. Person.prototype → 没有\n// 3. Object.prototype → 找到 ✅\n\n// 查找p.nonExist的过程：\n// 1. p自身 → 没有\n// 2. Person.prototype → 没有\n// 3. Object.prototype → 没有\n// 4. null → 返回undefined"
      },
      "source": "原型链查找"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["原型链"],
      "question": "以下代码的输出是什么？",
      "code": "function Person() {}\nPerson.prototype.name = 'prototype';\n\nconst p = new Person();\np.name = 'instance';\n\nconsole.log(p.name);\ndelete p.name;\nconsole.log(p.name);",
      "options": [
        "instance, prototype",
        "instance, undefined",
        "prototype, prototype",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "属性查找顺序",
        "code": "function Person() {}\nPerson.prototype.name = 'prototype';\n\nconst p = new Person();\np.name = 'instance'; // 在实例上设置\n\nconsole.log(p.name); // 'instance' (实例属性)\n\ndelete p.name; // 删除实例属性\n\nconsole.log(p.name); // 'prototype' (原型属性)\n\n// 查找顺序：\n// 1. 先查找实例自身属性\n// 2. 再查找原型链\n\n// 设置属性：\n// - 总是在实例上设置\n// - 不会影响原型"
      },
      "source": "属性查找"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["原型链终点"],
      "question": "所有对象的原型链最终都指向Object.prototype",
      "correctAnswer": "B",
      "explanation": {
        "title": "原型链终点",
        "code": "// 大部分对象的原型链终点是Object.prototype\nconst obj = {};\nobj.__proto__ === Object.prototype; // true\nObject.prototype.__proto__ === null; // true\n\n// 但可以创建没有原型的对象\nconst noProto = Object.create(null);\nconsole.log(noProto.__proto__); // undefined\nconsole.log(noProto.toString); // undefined\n\n// Object.prototype本身\nObject.prototype.__proto__ === null; // true"
      },
      "source": "原型链终点"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["hasOwnProperty"],
      "question": "判断对象自身属性，空白处填什么？",
      "code": "function Person() {}\nPerson.prototype.name = 'prototype';\n\nconst p = new Person();\np.age = 20;\n\n// 如何判断age是自身属性？\nif (______) {\n  console.log('own property');\n}",
      "options": [
        "p.hasOwnProperty('age')",
        "'age' in p",
        "p.age !== undefined",
        "p.__proto__.age === undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "hasOwnProperty vs in",
        "code": "function Person() {}\nPerson.prototype.name = 'prototype';\n\nconst p = new Person();\np.age = 20;\n\n// hasOwnProperty: 只检查自身\nconsole.log(p.hasOwnProperty('age')); // true\nconsole.log(p.hasOwnProperty('name')); // false\n\n// in操作符: 检查自身+原型链\nconsole.log('age' in p); // true\nconsole.log('name' in p); // true\n\n// 判断是否为原型属性\nfunction isPrototypeProperty(obj, prop) {\n  return (prop in obj) && !obj.hasOwnProperty(prop);\n}\n\nconsole.log(isPrototypeProperty(p, 'name')); // true"
      },
      "source": "属性检测"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["原型污染"],
      "question": "关于原型污染的说法正确的是？",
      "options": [
        "修改Object.prototype会影响所有对象",
        "可以通过Object.create(null)防御",
        "hasOwnProperty可以避免原型污染",
        "原型污染是安全漏洞",
        "所有原型都可以被污染",
        "Object.freeze可以防止污染"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "原型污染防御",
        "code": "// ❌ 原型污染\nObject.prototype.isAdmin = true;\nconsole.log({}.isAdmin); // true (所有对象都受影响)\n\n// ✅ 防御方法1: Object.create(null)\nconst safe = Object.create(null);\nsafe.isAdmin; // undefined\n\n// ✅ 防御方法2: hasOwnProperty\nif (obj.hasOwnProperty('isAdmin')) {\n  // 只处理自身属性\n}\n\n// ✅ 防御方法3: Object.freeze\nObject.freeze(Object.prototype);\nObject.prototype.hack = 'hacked'; // 静默失败\n\n// ✅ 防御方法4: Map代替普通对象\nconst map = new Map();\nmap.set('isAdmin', true);\n\n// 安全漏洞示例\nfunction merge(target, source) {\n  for (let key in source) {\n    if (key === '__proto__') continue; // 过滤\n    target[key] = source[key];\n  }\n}"
      },
      "source": "原型污染"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Function原型"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(Function.prototype === Function.__proto__);\nconsole.log(Object.__proto__ === Function.prototype);",
      "options": [
        "true, true",
        "true, false",
        "false, true",
        "false, false"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Function与Object的关系",
        "code": "// Function是所有函数的构造函数\n// Function.prototype是所有函数的原型\n\n// Function自己也是函数\nFunction.__proto__ === Function.prototype; // true\n\n// Object是函数\nObject.__proto__ === Function.prototype; // true\n\n// 原型链关系：\n// Function → Function.prototype → Object.prototype → null\n// Object → Function.prototype → Object.prototype → null\n\n// 特殊情况：\nFunction.prototype.__proto__ === Object.prototype; // true\nObject.prototype.__proto__ === null; // true"
      },
      "source": "Function原型"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["prototype.constructor"],
      "question": "prototype.constructor总是指向构造函数本身",
      "correctAnswer": "B",
      "explanation": {
        "title": "constructor属性",
        "code": "function Person() {}\n\n// 默认情况\nPerson.prototype.constructor === Person; // true\n\n// 重写prototype后\nPerson.prototype = {\n  say() {}\n};\n\nPerson.prototype.constructor === Person; // false\nPerson.prototype.constructor === Object; // true\n\n// 需要手动修复\nPerson.prototype.constructor = Person;\n\n// 最佳实践\nPerson.prototype = Object.create(Parent.prototype, {\n  constructor: {\n    value: Person,\n    writable: true,\n    enumerable: false,\n    configurable: true\n  }\n});"
      },
      "source": "constructor"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Object.create"],
      "question": "Object.create的polyfill，空白处填什么？",
      "code": "if (!Object.create) {\n  Object.create = function(proto) {\n    function F() {}\n    ______ = proto;\n    return new F();\n  };\n}",
      "options": [
        "F.prototype",
        "F.__proto__",
        "F.constructor",
        "this.prototype"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Object.create实现",
        "code": "// Object.create的简化polyfill\nif (!Object.create) {\n  Object.create = function(proto, properties) {\n    // 参数检查\n    if (typeof proto !== 'object' && typeof proto !== 'function') {\n      throw new TypeError('Object prototype may only be an Object or null');\n    }\n    \n    // 创建临时构造函数\n    function F() {}\n    F.prototype = proto;\n    \n    const obj = new F();\n    \n    // 处理第二个参数\n    if (properties !== undefined) {\n      Object.defineProperties(obj, properties);\n    }\n    \n    return obj;\n  };\n}\n\n// 使用\nconst proto = { x: 10 };\nconst obj = Object.create(proto);\nconsole.log(obj.x); // 10\nconsole.log(obj.__proto__ === proto); // true"
      },
      "source": "Object.create"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "原型链相关的最佳实践有哪些？",
      "options": [
        "不要直接修改__proto__",
        "使用Object.create设置原型",
        "避免原型链过长",
        "使用Object.freeze保护原型",
        "所有方法都放原型上",
        "重写prototype后修复constructor"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "原型链最佳实践",
        "code": "// 1. 使用Object.setPrototypeOf而非__proto__\n// ❌ 不好\nobj.__proto__ = proto;\n\n// ✅ 好\nObject.setPrototypeOf(obj, proto);\n// 或创建时指定\nconst obj = Object.create(proto);\n\n// 2. 避免原型链过长\n// ❌ 不好: A → B → C → D → E\n// ✅ 好: A → B → Object.prototype\n\n// 3. 保护原型\nObject.freeze(Object.prototype);\nObject.freeze(Array.prototype);\n\n// 4. 实例属性vs原型方法\nfunction Person(name) {\n  this.name = name;  // 实例属性\n}\nPerson.prototype.say = function() {  // 原型方法\n  console.log(this.name);\n};\n\n// 5. 修复constructor\nChild.prototype = Object.create(Parent.prototype);\nChild.prototype.constructor = Child;"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "闭包的内存模型",
      "url": "14-03-closure-memory.html"
    },
    "next": {
      "title": "构造函数与new操作符",
      "url": "15-02-constructor-new.html"
    }
  }
};
