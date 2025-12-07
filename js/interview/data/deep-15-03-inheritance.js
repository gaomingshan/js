/**
 * 继承模式演进史
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1503Inheritance = {
  "config": {
    "title": "继承模式演进史",
    "icon": "🎯",
    "description": "深入理解JavaScript继承模式的演变和最佳实践",
    "primaryColor": "#06b6d4",
    "bgGradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "medium",
      "tags": ["继承模式"],
      "question": "JavaScript中最优的继承模式是？",
      "options": [
        "寄生组合继承",
        "原型链继承",
        "构造函数继承",
        "组合继承"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "寄生组合继承",
        "code": "// 寄生组合继承（最优）\nfunction Parent(name) {\n  this.name = name;\n}\n\nParent.prototype.sayName = function() {\n  console.log(this.name);\n};\n\nfunction Child(name, age) {\n  Parent.call(this, name);  // 继承属性\n  this.age = age;\n}\n\n// 继承方法\nChild.prototype = Object.create(Parent.prototype);\nChild.prototype.constructor = Child;\n\n// 优点：\n// 1. 只调用一次父类构造函数\n// 2. 原型链正常\n// 3. instanceof和isPrototypeOf正常"
      },
      "source": "继承"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["原型链继承"],
      "question": "原型链继承的缺点有哪些？",
      "options": [
        "引用类型属性被共享",
        "无法向父类传参",
        "方法无法复用",
        "子类实例互相影响",
        "无法实现多继承",
        "性能差"
      ],
      "correctAnswer": ["A", "B", "D"],
      "explanation": {
        "title": "原型链继承的问题",
        "code": "// 原型链继承\nfunction Parent() {\n  this.colors = ['red', 'blue'];\n}\n\nfunction Child() {}\nChild.prototype = new Parent();\n\n// 问题1：引用类型共享\nconst child1 = new Child();\nconst child2 = new Child();\n\nchild1.colors.push('green');\nconsole.log(child2.colors); // ['red', 'blue', 'green']\n\n// 问题2：无法传参\nfunction Parent2(name) {\n  this.name = name;\n}\n\nChild.prototype = new Parent2(); // 无法传name"
      },
      "source": "原型链继承"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["组合继承"],
      "question": "以下代码调用了几次Parent构造函数？",
      "code": "function Parent(name) {\n  console.log('Parent called');\n  this.name = name;\n}\n\nfunction Child(name) {\n  Parent.call(this, name);\n}\n\nChild.prototype = new Parent();\n\nconst child = new Child('Alice');",
      "options": [
        "2次",
        "1次",
        "3次",
        "0次"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "组合继承的问题",
        "code": "// 组合继承：调用两次父类构造函数\n\nfunction Parent(name) {\n  console.log('Parent called');\n  this.name = name;\n}\n\nfunction Child(name) {\n  Parent.call(this, name);  // 第1次调用\n}\n\nChild.prototype = new Parent();  // 第2次调用\n\nconst child = new Child('Alice');\n// 输出: Parent called (两次)\n\n// 问题：\n// 1. 父类构造函数执行两次\n// 2. 子类prototype上有多余属性\n\n// 解决：使用寄生组合继承\nChild.prototype = Object.create(Parent.prototype);\n// 只调用一次Parent.call"
      },
      "source": "组合继承"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["寄生组合继承"],
      "question": "实现寄生组合继承，空白处填什么？",
      "code": "function inheritPrototype(Child, Parent) {\n  Child.prototype = ______;\n  Child.prototype.constructor = Child;\n}",
      "options": [
        "Object.create(Parent.prototype)",
        "new Parent()",
        "Parent.prototype",
        "Object.assign({}, Parent.prototype)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "寄生组合继承实现",
        "code": "function inheritPrototype(Child, Parent) {\n  // 创建父类原型的副本\n  Child.prototype = Object.create(Parent.prototype);\n  // 修复constructor\n  Child.prototype.constructor = Child;\n}\n\n// 使用\nfunction Parent(name) {\n  this.name = name;\n}\n\nParent.prototype.sayName = function() {\n  console.log(this.name);\n};\n\nfunction Child(name, age) {\n  Parent.call(this, name);  // 继承属性\n  this.age = age;\n}\n\ninheritPrototype(Child, Parent);  // 继承方法\n\nChild.prototype.sayAge = function() {\n  console.log(this.age);\n};\n\n// 测试\nconst child = new Child('Alice', 20);\nchild.sayName(); // 'Alice'\nchild.sayAge();  // 20"
      },
      "source": "寄生组合继承"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["ES6 Class"],
      "question": "ES6的Class继承本质上是寄生组合继承的语法糖",
      "correctAnswer": "A",
      "explanation": {
        "title": "Class继承原理",
        "code": "// ES6 Class\nclass Parent {\n  constructor(name) {\n    this.name = name;\n  }\n  sayName() {\n    console.log(this.name);\n  }\n}\n\nclass Child extends Parent {\n  constructor(name, age) {\n    super(name);  // 相当于Parent.call(this, name)\n    this.age = age;\n  }\n}\n\n// 等价于寄生组合继承\nfunction Parent(name) {\n  this.name = name;\n}\n\nParent.prototype.sayName = function() {\n  console.log(this.name);\n};\n\nfunction Child(name, age) {\n  Parent.call(this, name);\n  this.age = age;\n}\n\nChild.prototype = Object.create(Parent.prototype);\nChild.prototype.constructor = Child;"
      },
      "source": "Class"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["继承对比"],
      "question": "以下哪些继承模式可以实现方法复用？",
      "options": [
        "原型链继承",
        "构造函数继承",
        "组合继承",
        "寄生组合继承",
        "原型式继承",
        "ES6 Class"
      ],
      "correctAnswer": ["A", "C", "D", "E", "F"],
      "explanation": {
        "title": "继承模式对比",
        "code": "// 1. 原型链继承 ✅ 方法在原型上\nChild.prototype = new Parent();\n\n// 2. 构造函数继承 ❌ 每个实例都复制方法\nfunction Child() {\n  Parent.call(this);\n}\n\n// 3. 组合继承 ✅ 方法在原型上\nfunction Child() {\n  Parent.call(this);\n}\nChild.prototype = new Parent();\n\n// 4. 寄生组合继承 ✅ 方法在原型上\nChild.prototype = Object.create(Parent.prototype);\n\n// 5. 原型式继承 ✅ 共享原型\nconst child = Object.create(parent);\n\n// 6. ES6 Class ✅ 方法在原型上\nclass Child extends Parent {}"
      },
      "source": "继承对比"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["super关键字"],
      "question": "以下代码的输出是什么？",
      "code": "class Parent {\n  constructor() {\n    this.name = 'parent';\n  }\n}\n\nclass Child extends Parent {\n  constructor() {\n    console.log(this.name);\n  }\n}\n\nnew Child();",
      "options": [
        "报错：Must call super",
        "'parent'",
        "undefined",
        "'child'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "super必须先调用",
        "code": "class Parent {\n  constructor() {\n    this.name = 'parent';\n  }\n}\n\nclass Child extends Parent {\n  constructor() {\n    // 必须先调用super\n    // console.log(this.name); // ❌ ReferenceError\n    super();  // ✅ 先调用\n    console.log(this.name); // 'parent'\n  }\n}\n\nnew Child();\n\n// 规则：\n// 1. 子类必须在constructor中调用super()\n// 2. 调用super()前不能使用this\n// 3. 不写constructor会自动调用super()"
      },
      "source": "super"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["多继承"],
      "question": "JavaScript原生支持多继承",
      "correctAnswer": "B",
      "explanation": {
        "title": "多继承与Mixin",
        "code": "// JavaScript不支持多继承\n// 但可以通过Mixin模拟\n\n// Mixin模式\nconst FlyMixin = {\n  fly() {\n    console.log('flying');\n  }\n};\n\nconst SwimMixin = {\n  swim() {\n    console.log('swimming');\n  }\n};\n\nclass Animal {\n  constructor(name) {\n    this.name = name;\n  }\n}\n\nclass Duck extends Animal {}\n\n// 混入多个能力\nObject.assign(Duck.prototype, FlyMixin, SwimMixin);\n\nconst duck = new Duck('Donald');\nduck.fly();  // 'flying'\nduck.swim(); // 'swimming'"
      },
      "source": "多继承"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["原型式继承"],
      "question": "实现Object.create，空白处填什么？",
      "code": "function create(proto) {\n  function F() {}\n  F.prototype = proto;\n  return ______;\n}",
      "options": [
        "new F()",
        "F()",
        "F.prototype",
        "proto"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "原型式继承",
        "code": "// Object.create的简化实现\nfunction create(proto) {\n  function F() {}\n  F.prototype = proto;\n  return new F();\n}\n\n// 使用\nconst parent = {\n  name: 'parent',\n  say() {\n    console.log(this.name);\n  }\n};\n\nconst child = create(parent);\nchild.name = 'child';\nchild.say(); // 'child'\n\n// 原型式继承：\n// - 基于现有对象创建新对象\n// - 新对象的原型是现有对象\n// - 适合对象间的浅拷贝和继承"
      },
      "source": "原型式继承"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "继承的最佳实践有哪些？",
      "options": [
        "优先使用ES6 Class",
        "使用寄生组合继承",
        "避免修改原生原型",
        "使用Mixin实现多继承",
        "所有类都要继承",
        "组合优于继承"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "继承最佳实践",
        "code": "// 1. 优先使用ES6 Class\nclass Animal {\n  constructor(name) {\n    this.name = name;\n  }\n}\n\nclass Dog extends Animal {}\n\n// 2. 如果用ES5，使用寄生组合继承\nChild.prototype = Object.create(Parent.prototype);\nChild.prototype.constructor = Child;\n\n// 3. 不要修改原生原型\n// ❌ 不好\nArray.prototype.myMethod = function() {};\n\n// 4. 组合优于继承\n// ❌ 不好：过度继承\nclass Animal {}\nclass Mammal extends Animal {}\nclass Carnivore extends Mammal {}\nclass Feline extends Carnivore {}\nclass Cat extends Feline {}\n\n// ✅ 好：使用组合\nclass Cat {\n  constructor() {\n    this.locomotion = new Walk();\n    this.diet = new Carnivore();\n  }\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "构造函数与new操作符",
      "url": "15-02-constructor-new.html"
    },
    "next": {
      "title": "类型强制转换规范",
      "url": "16-01-type-coercion.html"
    }
  }
};
