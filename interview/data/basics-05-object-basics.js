window.quizData_Basics05ObjectBasics = {
  "config": {
    "title": "对象基础",
    "icon": "📦",
    "description": "掌握JavaScript对象的创建、属性与方法",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["对象创建"],
      "question": "JavaScript有哪些创建对象的方式？",
      "options": ["字面量、new Object()、Object.create()、构造函数、class", "只有字面量", "只有new", "只有class"],
      "correctAnswer": "A",
      "explanation": {
        "title": "对象创建方式：",
        "sections": [
          {"title": "1. 字面量", "code": "const obj = { x: 1, y: 2 };"},
          {"title": "2. new Object()", "code": "const obj = new Object();\nobj.x = 1;"},
          {"title": "3. Object.create()", "code": "const proto = { x: 1 };\nconst obj = Object.create(proto);"},
          {"title": "4. 构造函数", "code": "function Person(name) {\n  this.name = name;\n}\nconst p = new Person('John');"},
          {"title": "5. class", "code": "class Person {\n  constructor(name) {\n    this.name = name;\n  }\n}"}
        ]
      },
      "source": "对象创建"
    },
    {
      "difficulty": "easy",
      "tags": ["属性访问"],
      "question": "访问对象属性有哪两种方式？",
      "options": ["点号和方括号", "只有点号", "只有方括号", "只能遍历"],
      "correctAnswer": "A",
      "explanation": {
        "title": "属性访问：",
        "sections": [
          {"title": "点号", "code": "obj.name;\nobj.age;"},
          {"title": "方括号", "code": "obj['name'];\nobj['my-prop'];\nconst key = 'age';\nobj[key];"}
        ]
      },
      "source": "属性访问"
    },
    {
      "difficulty": "medium",
      "tags": ["属性描述符"],
      "question": "属性描述符有哪些特性？",
      "options": ["value、writable、enumerable、configurable、get、set", "只有value", "只有get/set", "没有特性"],
      "correctAnswer": "A",
      "explanation": {
        "title": "属性描述符：",
        "sections": [
          {"title": "数据属性", "code": "Object.defineProperty(obj, 'prop', {\n  value: 42,\n  writable: true,\n  enumerable: true,\n  configurable: true\n});"},
          {"title": "访问器属性", "code": "Object.defineProperty(obj, 'prop', {\n  get() { return this._prop; },\n  set(val) { this._prop = val; },\n  enumerable: true,\n  configurable: true\n});"}
        ]
      },
      "source": "属性描述符"
    },
    {
      "difficulty": "medium",
      "tags": ["Object方法"],
      "question": "Object.keys、Object.values、Object.entries的区别？",
      "options": ["keys返回键数组，values返回值数组，entries返回键值对数组", "完全相同", "都返回对象", "都返回字符串"],
      "correctAnswer": "A",
      "explanation": {
        "title": "Object遍历方法：",
        "code": "const obj = { a: 1, b: 2, c: 3 };\n\nObject.keys(obj);    // ['a', 'b', 'c']\nObject.values(obj);  // [1, 2, 3]\nObject.entries(obj); // [['a',1], ['b',2], ['c',3]]\n\n// 只遍历可枚举的自有属性"
      },
      "source": "Object方法"
    },
    {
      "difficulty": "medium",
      "tags": ["对象合并"],
      "question": "如何合并多个对象？",
      "options": ["Object.assign()、展开运算符...", "concat", "merge", "无法合并"],
      "correctAnswer": "A",
      "explanation": {
        "title": "对象合并：",
        "sections": [
          {"title": "Object.assign", "code": "const obj1 = { a: 1 };\nconst obj2 = { b: 2 };\nconst obj3 = Object.assign({}, obj1, obj2);\n// { a: 1, b: 2 }"},
          {"title": "展开运算符", "code": "const obj3 = { ...obj1, ...obj2 };\n// 更简洁，推荐"}
        ]
      },
      "source": "对象合并"
    },
    {
      "difficulty": "medium",
      "tags": ["对象冻结"],
      "question": "Object.freeze和Object.seal的区别？",
      "options": ["freeze完全冻结，seal可修改值但不能增删属性", "完全相同", "freeze可修改", "seal完全冻结"],
      "correctAnswer": "A",
      "explanation": {
        "title": "对象冻结：",
        "sections": [
          {"title": "Object.freeze", "code": "const obj = Object.freeze({ x: 1 });\nobj.x = 2;  // 无效\nobj.y = 3;  // 无效\ndelete obj.x; // 无效"},
          {"title": "Object.seal", "code": "const obj = Object.seal({ x: 1 });\nobj.x = 2;  // 可以\nobj.y = 3;  // 无效\ndelete obj.x; // 无效"}
        ]
      },
      "source": "对象冻结"
    },
    {
      "difficulty": "hard",
      "tags": ["属性检测"],
      "question": "如何正确检测对象是否有某个属性？",
      "options": ["in、hasOwnProperty、Object.hasOwn", "只能用in", "只能用hasOwnProperty", "无法检测"],
      "correctAnswer": "A",
      "explanation": {
        "title": "属性检测：",
        "sections": [
          {"title": "in操作符", "code": "'prop' in obj; // 包括原型链"},
          {"title": "hasOwnProperty", "code": "obj.hasOwnProperty('prop'); // 只检测自有属性"},
          {"title": "Object.hasOwn (ES2022)", "code": "Object.hasOwn(obj, 'prop'); // 推荐"}
        ]
      },
      "source": "属性检测"
    },
    {
      "difficulty": "hard",
      "tags": ["getter/setter"],
      "question": "getter和setter的应用场景是什么？",
      "options": ["计算属性、属性验证、副作用控制", "没有用途", "已废弃", "只是语法糖"],
      "correctAnswer": "A",
      "explanation": {
        "title": "getter/setter应用：",
        "sections": [
          {"title": "计算属性", "code": "const obj = {\n  firstName: 'John',\n  lastName: 'Doe',\n  get fullName() {\n    return `${this.firstName} ${this.lastName}`;\n  }\n};"},
          {"title": "属性验证", "code": "const obj = {\n  _age: 0,\n  set age(val) {\n    if (val < 0) throw new Error('无效年龄');\n    this._age = val;\n  },\n  get age() {\n    return this._age;\n  }\n};"}
        ]
      },
      "source": "getter/setter"
    },
    {
      "difficulty": "hard",
      "tags": ["对象遍历"],
      "question": "for...in和Object.keys的区别？",
      "options": ["for...in遍历原型链，Object.keys只遍历自有属性", "完全相同", "性能不同", "没有区别"],
      "correctAnswer": "A",
      "explanation": {
        "title": "遍历方式对比：",
        "code": "function Parent() {}\nParent.prototype.inheritedProp = 'inherited';\n\nconst obj = Object.create(Parent.prototype);\nobj.ownProp = 'own';\n\n// for...in\nfor (const key in obj) {\n  console.log(key); // 'ownProp', 'inheritedProp'\n}\n\n// Object.keys\nObject.keys(obj); // ['ownProp']"
      },
      "source": "对象遍历"
    },
    {
      "difficulty": "hard",
      "tags": ["深拷贝"],
      "question": "如何实现对象深拷贝？",
      "options": ["递归、JSON、structuredClone、第三方库", "Object.assign", "展开运算符", "无法实现"],
      "correctAnswer": "A",
      "explanation": {
        "title": "深拷贝方法：",
        "sections": [
          {"title": "JSON方法", "code": "const copy = JSON.parse(JSON.stringify(obj));\n// 缺点：丢失函数、undefined、Symbol"},
          {"title": "structuredClone (现代)", "code": "const copy = structuredClone(obj);\n// 支持循环引用、多种类型"},
          {"title": "递归实现", "code": "function deepClone(obj) {\n  if (obj === null || typeof obj !== 'object') return obj;\n  const clone = Array.isArray(obj) ? [] : {};\n  for (const key in obj) {\n    if (obj.hasOwnProperty(key)) {\n      clone[key] = deepClone(obj[key]);\n    }\n  }\n  return clone;\n}"}
        ]
      },
      "source": "深拷贝"
    }
  ],
  "navigation": {
    "prev": {"title": "call/apply/bind", "url": "04-call-apply-bind.html"},
    "next": {"title": "数组", "url": "05-arrays.html"}
  }
};
