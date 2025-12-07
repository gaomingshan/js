/**
 * 构造函数与new操作符
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1502ConstructorNew = {
  "config": {
    "title": "构造函数与new操作符",
    "icon": "🏗️",
    "description": "深入理解new操作符的实现原理和构造函数的工作机制",
    "primaryColor": "#ef4444",
    "bgGradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["new操作符"],
      "question": "new操作符做了几件事？",
      "options": [
        "4件：创建对象、绑定原型、绑定this、返回对象",
        "2件：创建对象、调用函数",
        "3件：创建对象、绑定this、返回对象",
        "只是调用构造函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "new操作符的4个步骤",
        "code": "function Person(name) {\n  this.name = name;\n}\n\nconst p = new Person('Alice');\n\n// new的4个步骤：\n// 1. 创建一个新对象\n// 2. 将对象的__proto__指向构造函数的prototype\n// 3. 将构造函数的this绑定到新对象\n// 4. 返回新对象（如果构造函数返回对象则返回该对象）"
      },
      "source": "new操作符"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["new返回值"],
      "question": "以下代码的输出是什么？",
      "code": "function Person(name) {\n  this.name = name;\n  return { age: 20 };\n}\n\nconst p = new Person('Alice');\nconsole.log(p.name);\nconsole.log(p.age);",
      "options": [
        "undefined, 20",
        "Alice, 20",
        "Alice, undefined",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "构造函数返回值规则",
        "code": "// 如果构造函数返回对象，使用返回的对象\nfunction Person1(name) {\n  this.name = name;\n  return { age: 20 }; // 返回对象\n}\n\nconst p1 = new Person1('Alice');\nconsole.log(p1.name); // undefined\nconsole.log(p1.age);  // 20\n\n// 如果返回基本类型，忽略返回值\nfunction Person2(name) {\n  this.name = name;\n  return 'ignored'; // 返回基本类型\n}\n\nconst p2 = new Person2('Bob');\nconsole.log(p2.name); // 'Bob'\n\n// 不返回，默认返回this\nfunction Person3(name) {\n  this.name = name;\n}\n\nconst p3 = new Person3('Charlie');\nconsole.log(p3.name); // 'Charlie'"
      },
      "source": "返回值"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["手写new"],
      "question": "实现new操作符，空白处填什么？",
      "code": "function myNew(Constructor, ...args) {\n  const obj = Object.create(Constructor.prototype);\n  const result = Constructor.apply(obj, args);\n  return ______ ? result : obj;\n}",
      "options": [
        "result instanceof Object",
        "typeof result === 'object'",
        "result !== null",
        "result !== undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "new操作符完整实现",
        "code": "function myNew(Constructor, ...args) {\n  // 1. 创建对象，原型指向构造函数prototype\n  const obj = Object.create(Constructor.prototype);\n  \n  // 2 & 3. 绑定this并执行构造函数\n  const result = Constructor.apply(obj, args);\n  \n  // 4. 返回对象\n  // 如果构造函数返回对象，则返回该对象\n  // 否则返回新创建的对象\n  return result instanceof Object ? result : obj;\n}\n\n// 测试\nfunction Person(name) {\n  this.name = name;\n}\n\nPerson.prototype.say = function() {\n  console.log(this.name);\n};\n\nconst p = myNew(Person, 'Alice');\np.say(); // 'Alice'"
      },
      "source": "手写new"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["箭头函数"],
      "question": "箭头函数可以作为构造函数使用",
      "correctAnswer": "B",
      "explanation": {
        "title": "箭头函数不能作为构造函数",
        "code": "// ❌ 箭头函数不能用new\nconst Person = (name) => {\n  this.name = name;\n};\n\ntry {\n  const p = new Person('Alice');\n} catch (e) {\n  console.log(e); // TypeError: Person is not a constructor\n}\n\n// 箭头函数的限制：\n// 1. 没有prototype属性\n// 2. 没有自己的this\n// 3. 不能用new\n// 4. 没有arguments\n// 5. 没有super\n\nconsole.log(Person.prototype); // undefined"
      },
      "source": "箭头函数"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["instanceof"],
      "question": "instanceof的判断依据是什么？",
      "options": [
        "检查原型链",
        "检查constructor属性",
        "检查对象类型",
        "查找Constructor.prototype",
        "一直查到null",
        "检查__proto__"
      ],
      "correctAnswer": ["A", "D", "E", "F"],
      "explanation": {
        "title": "instanceof原理",
        "code": "function myInstanceof(obj, Constructor) {\n  let proto = Object.getPrototypeOf(obj);\n  \n  while (proto) {\n    if (proto === Constructor.prototype) {\n      return true;\n    }\n    proto = Object.getPrototypeOf(proto);\n  }\n  \n  return false;\n}\n\n// 测试\nfunction Person() {}\nconst p = new Person();\n\nmyInstanceof(p, Person);  // true\nmyInstanceof(p, Object);  // true\nmyInstanceof(p, Array);   // false\n\n// instanceof不可靠的情况：\n// 1. 可以修改prototype\nPerson.prototype = {};\nconsole.log(p instanceof Person); // false\n\n// 2. 跨iframe对象\n// iframe中的Array !== 主窗口的Array"
      },
      "source": "instanceof"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["constructor调用"],
      "question": "以下代码的输出是什么？",
      "code": "function Person(name) {\n  this.name = name;\n}\n\nconst p1 = new Person('Alice');\nconst p2 = Person('Bob');\n\nconsole.log(p1.name);\nconsole.log(p2);\nconsole.log(window.name);",
      "options": [
        "Alice, undefined, Bob",
        "Alice, Bob, undefined",
        "Alice, undefined, undefined",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "构造函数vs普通函数",
        "code": "function Person(name) {\n  this.name = name;\n}\n\n// 使用new：this指向新对象\nconst p1 = new Person('Alice');\nconsole.log(p1.name); // 'Alice'\n\n// 不使用new：this指向全局\nconst p2 = Person('Bob');\nconsole.log(p2); // undefined (没有返回值)\nconsole.log(window.name); // 'Bob' (设置到全局)\n\n// 防御性构造函数\nfunction SafePerson(name) {\n  if (!(this instanceof SafePerson)) {\n    return new SafePerson(name);\n  }\n  this.name = name;\n}\n\n// 无论是否使用new都正常工作\nconst p3 = SafePerson('Charlie');\nconst p4 = new SafePerson('David');"
      },
      "source": "构造函数调用"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["new.target"],
      "question": "new.target可以用来检测函数是否通过new调用",
      "correctAnswer": "A",
      "explanation": {
        "title": "new.target元属性",
        "code": "function Person(name) {\n  console.log(new.target);\n  \n  if (!new.target) {\n    throw new Error('必须使用new调用');\n  }\n  \n  this.name = name;\n}\n\n// 使用new\nnew Person('Alice'); // [Function: Person]\n\n// 不使用new\ntry {\n  Person('Bob'); // undefined, 然后报错\n} catch (e) {\n  console.log(e.message); // '必须使用new调用'\n}\n\n// ES6 Class默认必须用new\nclass MyClass {\n  constructor() {\n    console.log(new.target);\n  }\n}\n\ntry {\n  MyClass(); // TypeError\n} catch (e) {}"
      },
      "source": "new.target"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["工厂函数"],
      "question": "不使用new创建对象，空白处填什么？",
      "code": "function createPerson(name) {\n  return ______;\n}\n\nconst p = createPerson('Alice');",
      "options": [
        "{ name: name, say() { console.log(this.name); } }",
        "new Person(name)",
        "Object.create({ name })",
        "this"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "工厂模式vs构造函数",
        "code": "// 工厂模式：不使用new\nfunction createPerson(name) {\n  return {\n    name: name,\n    say() {\n      console.log(this.name);\n    }\n  };\n}\n\nconst p1 = createPerson('Alice');\n\n// 优点：\n// - 不需要new\n// - 灵活\n\n// 缺点：\n// - 每个对象都创建新方法\n// - 无法识别对象类型\n\n// 构造函数模式：使用new\nfunction Person(name) {\n  this.name = name;\n}\n\nPerson.prototype.say = function() {\n  console.log(this.name);\n};\n\nconst p2 = new Person('Bob');\n\n// 优点：\n// - 方法共享（在原型上）\n// - instanceof可识别\n\n// 缺点：\n// - 必须使用new"
      },
      "source": "工厂模式"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["静态方法"],
      "question": "关于构造函数的静态方法说法正确的是？",
      "options": [
        "直接添加到构造函数上",
        "不能被实例访问",
        "可以通过prototype访问",
        "用于工具方法",
        "ES6 Class用static定义",
        "继承时会被继承"
      ],
      "correctAnswer": ["A", "B", "D", "E"],
      "explanation": {
        "title": "静态方法vs实例方法",
        "code": "// ES5静态方法\nfunction Person(name) {\n  this.name = name;\n}\n\n// 静态方法：添加到构造函数\nPerson.create = function(name) {\n  return new Person(name);\n};\n\n// 实例方法：添加到prototype\nPerson.prototype.say = function() {\n  console.log(this.name);\n};\n\n// 使用\nconst p = Person.create('Alice');\np.say(); // ✅\np.create(); // ❌ TypeError\n\n// ES6 Class\nclass MyClass {\n  static staticMethod() {\n    return 'static';\n  }\n  \n  instanceMethod() {\n    return 'instance';\n  }\n}\n\nMyClass.staticMethod(); // ✅\nconst obj = new MyClass();\nobj.instanceMethod(); // ✅\nobj.staticMethod(); // ❌"
      },
      "source": "静态方法"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "构造函数的最佳实践有哪些？",
      "options": [
        "构造函数首字母大写",
        "使用new.target检测调用方式",
        "方法定义在prototype上",
        "使用ES6 Class",
        "所有属性都用this",
        "避免在构造函数中返回对象"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "构造函数最佳实践",
        "code": "// 1. 首字母大写（约定）\nfunction Person() {}  // ✅\nfunction person() {}  // ❌\n\n// 2. 检测调用方式\nfunction SafePerson(name) {\n  if (!new.target) {\n    return new SafePerson(name);\n  }\n  this.name = name;\n}\n\n// 3. 方法在prototype上\nPerson.prototype.say = function() {  // ✅ 共享\n  console.log(this.name);\n};\n\n// ❌ 不要在构造函数中定义\nfunction BadPerson() {\n  this.say = function() {};  // 每个实例都创建\n}\n\n// 4. 使用ES6 Class\nclass ModernPerson {\n  constructor(name) {\n    this.name = name;\n  }\n  say() {\n    console.log(this.name);\n  }\n}\n\n// 5. 避免返回对象\nfunction Person() {\n  this.name = 'Alice';\n  // return {};  // ❌ 不要这样\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "原型链的底层实现",
      "url": "15-01-prototype-chain.html"
    },
    "next": {
      "title": "继承模式演进史",
      "url": "15-03-inheritance.html"
    }
  }
};
