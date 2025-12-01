window.quizData_Basics04This = {
  "config": {
    "title": "this关键字",
    "icon": "👉",
    "description": "掌握JavaScript中this的指向规则",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["this基础"],
      "question": "this的值由什么决定？",
      "options": [
        "函数的调用方式",
        "函数的定义位置",
        "函数的参数",
        "固定不变"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "this绑定规则：",
        "sections": [
          {
            "title": "4种绑定规则",
            "points": [
              "1. 默认绑定：独立函数调用",
              "2. 隐式绑定：对象方法调用",
              "3. 显式绑定：call/apply/bind",
              "4. new绑定：构造函数调用"
            ]
          },
          {
            "title": "示例",
            "code": "function fn() { console.log(this); }\n\nfn(); // window (默认)\nobj.fn(); // obj (隐式)\nfn.call(ctx); // ctx (显式)\nnew fn(); // 新对象 (new)"
          }
        ]
      },
      "source": "this绑定"
    },
    {
      "difficulty": "easy",
      "tags": ["默认绑定"],
      "question": "独立函数调用时this指向什么？",
      "options": [
        "非严格模式指向window，严格模式为undefined",
        "总是window",
        "总是undefined",
        "总是null"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "默认绑定：",
        "sections": [
          {
            "title": "非严格模式",
            "code": "function fn() {\n  console.log(this);\n}\n\nfn(); // window"
          },
          {
            "title": "严格模式",
            "code": "'use strict';\nfunction fn() {\n  console.log(this);\n}\n\nfn(); // undefined"
          }
        ]
      },
      "source": "默认绑定"
    },
    {
      "difficulty": "medium",
      "tags": ["隐式绑定"],
      "question": "对象方法中的this指向什么？",
      "options": [
        "调用该方法的对象",
        "定义该方法的对象",
        "总是window",
        "总是undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "隐式绑定：",
        "sections": [
          {
            "title": "基本用法",
            "code": "const obj = {\n  name: 'obj',\n  getName() {\n    return this.name;\n  }\n};\n\nobj.getName(); // 'obj'"
          },
          {
            "title": "隐式丢失",
            "code": "const obj = {\n  name: 'obj',\n  getName() {\n    return this.name;\n  }\n};\n\nconst fn = obj.getName;\nfn(); // undefined\n// this变成window\n\nsetTimeout(obj.getName, 100);\n// 也会丢失"
          }
        ]
      },
      "source": "隐式绑定"
    },
    {
      "difficulty": "medium",
      "tags": ["箭头函数"],
      "question": "箭头函数的this有什么特点？",
      "options": [
        "继承外层作用域的this，无法改变",
        "与普通函数相同",
        "总是window",
        "没有this"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "箭头函数this：",
        "sections": [
          {
            "title": "继承外层this",
            "code": "const obj = {\n  name: 'obj',\n  getName() {\n    return () => this.name;\n  }\n};\n\nconst fn = obj.getName();\nfn(); // 'obj'\n// 箭头函数继承getName的this"
          },
          {
            "title": "无法改变",
            "code": "const fn = () => {\n  console.log(this);\n};\n\nfn.call({ x: 1 }); // window\n// call无效"
          }
        ]
      },
      "source": "箭头函数"
    },
    {
      "difficulty": "medium",
      "tags": ["new绑定"],
      "question": "new操作符如何影响this？",
      "options": [
        "this指向新创建的对象",
        "this指向构造函数",
        "this指向window",
        "没有this"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "new绑定：",
        "sections": [
          {
            "title": "new的步骤",
            "points": [
              "1. 创建新对象",
              "2. this指向新对象",
              "3. 执行构造函数",
              "4. 返回新对象（除非显式返回对象）"
            ]
          },
          {
            "title": "示例",
            "code": "function Person(name) {\n  this.name = name;\n}\n\nconst p = new Person('John');\nconsole.log(p.name); // 'John'"
          }
        ]
      },
      "source": "new绑定"
    },
    {
      "difficulty": "medium",
      "tags": ["绑定优先级"],
      "question": "不同this绑定的优先级是什么？",
      "options": [
        "new > 显式绑定 > 隐式绑定 > 默认绑定",
        "都相同",
        "默认优先级最高",
        "没有优先级"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "绑定优先级：",
        "sections": [
          {
            "title": "优先级测试",
            "code": "function fn() {\n  console.log(this.name);\n}\n\nconst obj1 = { name: 'obj1', fn };\nconst obj2 = { name: 'obj2' };\n\n// 隐式 vs 显式\nobj1.fn.call(obj2); // 'obj2'\n// 显式胜出\n\n// 显式 vs new\nconst boundFn = fn.bind(obj1);\nconst instance = new boundFn();\n// new胜出，this是新对象"
          }
        ]
      },
      "source": "优先级"
    },
    {
      "difficulty": "hard",
      "tags": ["this陷阱"],
      "question": "以下代码输出什么？",
      "options": [
        "undefined",
        "'obj'",
        "报错",
        "null"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "代码分析：",
        "code": "const obj = {\n  name: 'obj',\n  getName() {\n    return this.name;\n  }\n};\n\nconst { getName } = obj;\nconsole.log(getName());",
        "sections": [
          {
            "title": "原因",
            "content": "解构赋值后getName变成独立函数，this指向window（或严格模式下undefined）。"
          },
          {
            "title": "解决方案",
            "code": "// 1. 箭头函数\nconst obj = {\n  name: 'obj',\n  getName: () => obj.name\n};\n\n// 2. bind\nconst getName = obj.getName.bind(obj);\n\n// 3. 包装\nconst getName = () => obj.getName();"
          }
        ]
      },
      "source": "this陷阱"
    },
    {
      "difficulty": "hard",
      "tags": ["class中的this"],
      "question": "class中的this有什么特点？",
      "options": [
        "方法默认严格模式，需要绑定或使用箭头函数",
        "与普通对象相同",
        "自动绑定",
        "没有this"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "class中的this：",
        "sections": [
          {
            "title": "问题",
            "code": "class Component {\n  constructor() {\n    this.state = 0;\n  }\n  \n  handleClick() {\n    this.state++;\n  }\n}\n\nconst c = new Component();\nconst handler = c.handleClick;\nhandler(); // TypeError\n// this是undefined"
          },
          {
            "title": "解决1：构造函数绑定",
            "code": "class Component {\n  constructor() {\n    this.state = 0;\n    this.handleClick = this.handleClick.bind(this);\n  }\n  \n  handleClick() {\n    this.state++;\n  }\n}"
          },
          {
            "title": "解决2：箭头函数",
            "code": "class Component {\n  state = 0;\n  \n  handleClick = () => {\n    this.state++;\n  }\n}"
          }
        ]
      },
      "source": "class this"
    },
    {
      "difficulty": "hard",
      "tags": ["this最佳实践"],
      "question": "如何避免this相关的问题？",
      "options": [
        "使用箭头函数、bind、或避免依赖this",
        "总是用this",
        "不用this",
        "无法避免"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "最佳实践：",
        "sections": [
          {
            "title": "1. 优先箭头函数",
            "code": "// 事件处理\nclass Component {\n  handleClick = () => {\n    // this稳定\n  }\n}"
          },
          {
            "title": "2. bind绑定",
            "code": "constructor() {\n  this.handleClick = this.handleClick.bind(this);\n}"
          },
          {
            "title": "3. 避免依赖this",
            "code": "// 函数式风格\nconst createCounter = () => {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    getCount: () => count\n  };\n};"
          },
          {
            "title": "4. 明确传参",
            "code": "// 不依赖this\nfunction process(obj) {\n  return obj.value * 2;\n}\n\n// 而不是\nfunction process() {\n  return this.value * 2;\n}"
          }
        ]
      },
      "source": "最佳实践"
    },
    {
      "difficulty": "hard",
      "tags": ["DOM事件this"],
      "question": "DOM事件处理函数中的this指向什么？",
      "options": [
        "触发事件的DOM元素",
        "window",
        "事件对象",
        "undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "DOM事件this：",
        "sections": [
          {
            "title": "普通函数",
            "code": "button.addEventListener('click', function() {\n  console.log(this); // button元素\n});"
          },
          {
            "title": "箭头函数",
            "code": "button.addEventListener('click', () => {\n  console.log(this); // 外层this\n});"
          },
          {
            "title": "最佳实践",
            "code": "button.addEventListener('click', function(event) {\n  const element = event.currentTarget;\n  // 明确使用event.currentTarget\n});"
          }
        ]
      },
      "source": "DOM事件"
    }
  ],
  "navigation": {
    "prev": {
      "title": "闭包",
      "url": "04-closure.html"
    },
    "next": {
      "title": "call/apply/bind",
      "url": "04-call-apply-bind.html"
    }
  }
};
