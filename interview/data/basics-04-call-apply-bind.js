window.quizData_Basics04CallApplyBind = {
  "config": {
    "title": "call/apply/bind",
    "icon": "🔧",
    "description": "掌握改变this指向的三种方法",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["call基础"],
      "question": "call方法的作用是什么？",
      "options": [
        "改变this指向并立即调用函数",
        "只改变this",
        "只调用函数",
        "复制函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "call方法：",
        "code": "function greet(greeting) {\n  return `${greeting}, ${this.name}`;\n}\n\nconst user = { name: 'John' };\nconst result = greet.call(user, 'Hello');\nconsole.log(result); // 'Hello, John'"
      },
      "source": "call"
    },
    {
      "difficulty": "easy",
      "tags": ["call vs apply"],
      "question": "call和apply的区别是什么？",
      "options": [
        "参数传递方式不同：call逐个传递，apply用数组",
        "完全相同",
        "call更快",
        "apply已废弃"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "call vs apply：",
        "sections": [
          {
            "title": "call",
            "code": "fn.call(thisArg, arg1, arg2, arg3);"
          },
          {
            "title": "apply",
            "code": "fn.apply(thisArg, [arg1, arg2, arg3]);"
          },
          {
            "title": "使用场景",
            "code": "// apply适合数组\nMath.max.apply(null, [1, 2, 3]); // 3\n\n// ES6更好的方式\nMath.max(...[1, 2, 3]);"
          }
        ]
      },
      "source": "call vs apply"
    },
    {
      "difficulty": "medium",
      "tags": ["bind基础"],
      "question": "bind与call/apply的区别是什么？",
      "options": [
        "bind返回新函数不立即执行，call/apply立即执行",
        "完全相同",
        "bind性能更差",
        "bind已废弃"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "bind特点：",
        "sections": [
          {
            "title": "bind返回新函数",
            "code": "function greet() {\n  return this.name;\n}\n\nconst user = { name: 'John' };\nconst boundGreet = greet.bind(user);\n\nboundGreet(); // 'John'\n// 可以多次调用"
          },
          {
            "title": "预设参数",
            "code": "function add(a, b) {\n  return a + b;\n}\n\nconst add5 = add.bind(null, 5);\nadd5(3); // 8"
          }
        ]
      },
      "source": "bind"
    },
    {
      "difficulty": "medium",
      "tags": ["手写call"],
      "question": "如何实现call方法？",
      "options": [
        "在context上临时添加函数并调用",
        "无法实现",
        "使用eval",
        "使用new"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "实现call：",
        "code": "Function.prototype.myCall = function(context, ...args) {\n  context = context || window;\n  const fn = Symbol();\n  context[fn] = this;\n  const result = context[fn](...args);\n  delete context[fn];\n  return result;\n};\n\n// 使用\nfunction greet(greeting) {\n  return `${greeting}, ${this.name}`;\n}\ngreet.myCall({ name: 'John' }, 'Hi'); // 'Hi, John'"
      },
      "source": "手写call"
    },
    {
      "difficulty": "medium",
      "tags": ["手写apply"],
      "question": "如何实现apply方法？",
      "options": [
        "与call类似，但参数是数组",
        "无法实现",
        "完全不同",
        "已有原生实现"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "实现apply：",
        "code": "Function.prototype.myApply = function(context, args = []) {\n  context = context || window;\n  const fn = Symbol();\n  context[fn] = this;\n  const result = context[fn](...args);\n  delete context[fn];\n  return result;\n};"
      },
      "source": "手写apply"
    },
    {
      "difficulty": "medium",
      "tags": ["手写bind"],
      "question": "如何实现bind方法？",
      "options": [
        "返回新函数，保存this和参数",
        "无法实现",
        "使用call",
        "使用apply"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "实现bind：",
        "code": "Function.prototype.myBind = function(context, ...args1) {\n  const fn = this;\n  return function(...args2) {\n    return fn.apply(context, args1.concat(args2));\n  };\n};\n\n// 使用\nfunction add(a, b, c) {\n  return a + b + c;\n}\nconst add5 = add.myBind(null, 5);\nadd5(3, 2); // 10"
      },
      "source": "手写bind"
    },
    {
      "difficulty": "hard",
      "tags": ["bind与new"],
      "question": "bind的函数能被new调用吗？",
      "options": [
        "可以，new会忽略bind的this",
        "不可以",
        "会报错",
        "完全相同"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "bind与new：",
        "sections": [
          {
            "title": "new优先级更高",
            "code": "function Person(name) {\n  this.name = name;\n}\n\nconst obj = { name: 'obj' };\nconst BoundPerson = Person.bind(obj);\n\nconst p = new BoundPerson('John');\nconsole.log(p.name); // 'John'\nconsole.log(obj.name); // 'obj'\n// new绑定优先于bind"
          },
          {
            "title": "完整bind实现",
            "code": "Function.prototype.myBind = function(context, ...args1) {\n  const fn = this;\n  \n  function bound(...args2) {\n    return fn.apply(\n      this instanceof bound ? this : context,\n      args1.concat(args2)\n    );\n  }\n  \n  bound.prototype = Object.create(fn.prototype);\n  return bound;\n};"
          }
        ]
      },
      "source": "bind与new"
    },
    {
      "difficulty": "hard",
      "tags": ["应用场景"],
      "question": "call/apply/bind的常见应用场景有哪些？",
      "options": [
        "类数组转数组、继承、防抖节流、柯里化",
        "没有用途",
        "已过时",
        "只用于调试"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "应用场景：",
        "sections": [
          {
            "title": "1. 类数组转数组",
            "code": "function fn() {\n  const args = Array.prototype.slice.call(arguments);\n  return args;\n}\n\n// ES6更好\nconst args = Array.from(arguments);\nconst args = [...arguments];"
          },
          {
            "title": "2. 继承",
            "code": "function Parent(name) {\n  this.name = name;\n}\n\nfunction Child(name, age) {\n  Parent.call(this, name);\n  this.age = age;\n}"
          },
          {
            "title": "3. 找最大值",
            "code": "const arr = [1, 2, 3, 4, 5];\nconst max = Math.max.apply(null, arr);\n// 或 Math.max(...arr)"
          },
          {
            "title": "4. 事件处理",
            "code": "class Component {\n  constructor() {\n    this.handleClick = this.handleClick.bind(this);\n  }\n  \n  handleClick() {\n    console.log(this);\n  }\n}"
          }
        ]
      },
      "source": "应用场景"
    },
    {
      "difficulty": "hard",
      "tags": ["多次bind"],
      "question": "多次bind会怎样？",
      "options": [
        "只有第一次bind有效",
        "最后一次有效",
        "全部有效",
        "会报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "多次bind：",
        "code": "function fn() {\n  return this.name;\n}\n\nconst obj1 = { name: 'obj1' };\nconst obj2 = { name: 'obj2' };\nconst obj3 = { name: 'obj3' };\n\nconst bound1 = fn.bind(obj1);\nconst bound2 = bound1.bind(obj2);\nconst bound3 = bound2.bind(obj3);\n\nconsole.log(bound3()); // 'obj1'\n// 第一次bind后this固定"
      },
      "source": "多次bind"
    },
    {
      "difficulty": "hard",
      "tags": ["箭头函数bind"],
      "question": "箭头函数可以使用call/apply/bind吗？",
      "options": [
        "可以调用但无法改变this",
        "不可以调用",
        "可以改变this",
        "会报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "箭头函数与bind：",
        "code": "const obj1 = { name: 'obj1' };\nconst obj2 = { name: 'obj2' };\n\nconst fn = () => this;\n\nfn.call(obj1); // window/global\nfn.apply(obj2); // window/global\nconst bound = fn.bind(obj1);\nbound(); // window/global\n\n// 箭头函数的this无法改变"
      },
      "source": "箭头函数bind"
    }
  ],
  "navigation": {
    "prev": {
      "title": "this关键字",
      "url": "04-this.html"
    },
    "next": {
      "title": "对象基础",
      "url": "05-object-basics.html"
    }
  }
};
