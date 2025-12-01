window.quizData_Basics04Closure = {
  "config": {
    "title": "闭包",
    "icon": "🔒",
    "description": "深入理解JavaScript闭包的原理与应用",
    "primaryColor": "#ec4899",
    "bgGradient": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["闭包概念"],
      "question": "什么是闭包？",
      "options": [
        "函数能够访问其外部作用域变量的能力",
        "函数嵌套",
        "匿名函数",
        "回调函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包定义：",
        "content": "闭包是指函数可以记住并访问其词法作用域，即使函数在其词法作用域之外执行。",
        "sections": [
          {
            "title": "基本示例",
            "code": "function outer() {\n  const name = 'John';\n  \n  function inner() {\n    console.log(name); // 访问外部变量\n  }\n  \n  return inner;\n}\n\nconst fn = outer();\nfn(); // 'John'\n// inner函数形成闭包，保持对name的引用"
          },
          {
            "title": "闭包的三个条件",
            "points": [
              "1. 函数嵌套",
              "2. 内部函数引用外部函数的变量",
              "3. 内部函数被返回或传递到外部"
            ]
          }
        ]
      },
      "source": "闭包"
    },
    {
      "difficulty": "easy",
      "tags": ["闭包应用"],
      "question": "闭包最常见的应用场景是什么？",
      "options": [
        "数据私有化、回调函数、模块模式",
        "提高性能",
        "减少内存",
        "没有用途"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包应用：",
        "sections": [
          {
            "title": "1. 数据私有化",
            "code": "function createCounter() {\n  let count = 0; // 私有变量\n  \n  return {\n    increment() { return ++count; },\n    decrement() { return --count; },\n    getCount() { return count; }\n  };\n}\n\nconst counter = createCounter();\ncounter.increment(); // 1\ncounter.increment(); // 2\nconsole.log(counter.count); // undefined (无法直接访问)"
          },
          {
            "title": "2. 回调函数",
            "code": "function fetchData(url) {\n  const startTime = Date.now();\n  \n  fetch(url).then(data => {\n    // 闭包：访问startTime\n    console.log(`耗时: ${Date.now() - startTime}ms`);\n  });\n}"
          },
          {
            "title": "3. 事件处理",
            "code": "function setupHandler(id) {\n  const element = document.getElementById(id);\n  \n  element.addEventListener('click', function() {\n    // 闭包：访问element和id\n    console.log(`点击了 ${id}`);\n  });\n}"
          }
        ]
      },
      "source": "闭包应用"
    },
    {
      "difficulty": "medium",
      "tags": ["循环闭包"],
      "question": "如何解决循环中的闭包问题？",
      "options": [
        "使用let、IIFE或forEach",
        "无法解决",
        "使用var",
        "不需要解决"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "循环闭包问题：",
        "sections": [
          {
            "title": "问题代码",
            "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);\n  }, 100);\n}\n// 输出: 3 3 3"
          },
          {
            "title": "解决1：let",
            "code": "for (let i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);\n  }, 100);\n}\n// 输出: 0 1 2"
          },
          {
            "title": "解决2：IIFE",
            "code": "for (var i = 0; i < 3; i++) {\n  (function(j) {\n    setTimeout(() => {\n      console.log(j);\n    }, 100);\n  })(i);\n}\n// 输出: 0 1 2"
          },
          {
            "title": "解决3：forEach",
            "code": "[0, 1, 2].forEach(i => {\n  setTimeout(() => {\n    console.log(i);\n  }, 100);\n});\n// 输出: 0 1 2"
          }
        ]
      },
      "source": "循环闭包"
    },
    {
      "difficulty": "medium",
      "tags": ["闭包与this"],
      "question": "闭包中的this指向什么？",
      "options": [
        "取决于函数调用方式，箭头函数继承外层this",
        "总是window",
        "总是undefined",
        "总是外层函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包中的this：",
        "sections": [
          {
            "title": "普通函数",
            "code": "const obj = {\n  name: 'obj',\n  getName() {\n    return function() {\n      return this.name;\n    };\n  }\n};\n\nconst fn = obj.getName();\nconsole.log(fn()); // undefined\n// this指向调用者（window）"
          },
          {
            "title": "箭头函数",
            "code": "const obj = {\n  name: 'obj',\n  getName() {\n    return () => {\n      return this.name;\n    };\n  }\n};\n\nconst fn = obj.getName();\nconsole.log(fn()); // 'obj'\n// 箭头函数继承外层this"
          },
          {
            "title": "保存this",
            "code": "const obj = {\n  name: 'obj',\n  getName() {\n    const self = this;\n    return function() {\n      return self.name;\n    };\n  }\n};"
          }
        ]
      },
      "source": "闭包this"
    },
    {
      "difficulty": "medium",
      "tags": ["内存泄漏"],
      "question": "闭包会导致内存泄漏吗？如何避免？",
      "options": [
        "不当使用会泄漏，应及时解除引用、避免循环引用",
        "总会泄漏",
        "不会泄漏",
        "无法避免"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包与内存：",
        "sections": [
          {
            "title": "潜在问题",
            "code": "function create() {\n  const bigData = new Array(1000000).fill('data');\n  \n  return function() {\n    console.log(bigData[0]);\n  };\n}\n\nconst fn = create();\n// bigData一直被引用，无法释放"
          },
          {
            "title": "解决：及时释放",
            "code": "let fn = create();\nfn();\nfn = null; // 解除引用，允许GC"
          },
          {
            "title": "避免循环引用",
            "code": "function setup() {\n  const element = document.getElementById('btn');\n  \n  element.addEventListener('click', function() {\n    console.log(element.id);\n  });\n  \n  // element和回调互相引用\n}\n\n// 改进\nfunction setup() {\n  const element = document.getElementById('btn');\n  const id = element.id;\n  \n  element.addEventListener('click', function() {\n    console.log(id); // 只引用必要的值\n  });\n}"
          }
        ]
      },
      "source": "内存管理"
    },
    {
      "difficulty": "medium",
      "tags": ["模块模式"],
      "question": "如何使用闭包实现模块模式？",
      "options": [
        "IIFE返回公共接口，私有变量在闭包中",
        "不能实现",
        "使用class",
        "使用对象"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "模块模式：",
        "sections": [
          {
            "title": "基本模块",
            "code": "const MyModule = (function() {\n  // 私有\n  let privateVar = 0;\n  function privateFunc() {\n    return privateVar++;\n  }\n  \n  // 公共接口\n  return {\n    increment() {\n      return privateFunc();\n    },\n    getValue() {\n      return privateVar;\n    }\n  };\n})();\n\nMyModule.increment(); // 0\nMyModule.getValue();   // 1"
          },
          {
            "title": "带参数的模块",
            "code": "const MyModule = (function(config) {\n  const name = config.name;\n  \n  return {\n    getName() { return name; }\n  };\n})({ name: 'Module' });"
          }
        ]
      },
      "source": "模块模式"
    },
    {
      "difficulty": "hard",
      "tags": ["闭包陷阱"],
      "question": "以下代码的输出是什么？",
      "options": [
        "5 5 5 5 5",
        "0 1 2 3 4",
        "0 0 0 0 0",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "代码分析：",
        "code": "var funcs = [];\nfor (var i = 0; i < 5; i++) {\n  funcs.push(function() {\n    console.log(i);\n  });\n}\n\nfuncs.forEach(f => f());",
        "sections": [
          {
            "title": "原因",
            "content": "所有函数共享同一个i变量，循环结束时i=5，所以输出都是5。"
          },
          {
            "title": "解决方案",
            "code": "// 1. 使用let\nfor (let i = 0; i < 5; i++) {\n  funcs.push(() => console.log(i));\n}\n\n// 2. IIFE\nfor (var i = 0; i < 5; i++) {\n  funcs.push((function(j) {\n    return function() {\n      console.log(j);\n    };\n  })(i));\n}\n\n// 3. bind\nfor (var i = 0; i < 5; i++) {\n  funcs.push(console.log.bind(null, i));\n}"
          }
        ]
      },
      "source": "闭包陷阱"
    },
    {
      "difficulty": "hard",
      "tags": ["闭包性能"],
      "question": "闭包对性能有什么影响？如何优化？",
      "options": [
        "增加内存占用和查找时间，应避免过度使用、及时释放",
        "没有影响",
        "提高性能",
        "无法优化"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包性能：",
        "sections": [
          {
            "title": "性能影响",
            "points": [
              "内存：保持外部变量引用",
              "查找：延长作用域链",
              "GC：增加垃圾回收压力"
            ]
          },
          {
            "title": "优化1：避免不必要的闭包",
            "code": "// 不好\nfunction fn() {\n  return function() {\n    return 42;\n  };\n}\n\n// 好（不需要闭包）\nfunction fn() {\n  return 42;\n}"
          },
          {
            "title": "优化2：及时释放",
            "code": "function setup() {\n  const data = loadBigData();\n  \n  return function process() {\n    // 使用data\n  };\n}\n\nlet processor = setup();\nprocessor();\nprocessor = null; // 释放"
          },
          {
            "title": "优化3：最小化闭包范围",
            "code": "// 不好：整个bigData都在闭包中\nfunction fn() {\n  const bigData = {/*大对象*/};\n  return () => bigData.value;\n}\n\n// 好：只保留需要的\nfunction fn() {\n  const bigData = {/*大对象*/};\n  const value = bigData.value;\n  return () => value;\n}"
          }
        ]
      },
      "source": "性能优化"
    },
    {
      "difficulty": "hard",
      "tags": ["柯里化"],
      "question": "如何使用闭包实现函数柯里化？",
      "options": [
        "返回接受剩余参数的新函数，直到参数够了才执行",
        "不能实现",
        "只能手动实现",
        "需要特殊语法"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "柯里化实现：",
        "sections": [
          {
            "title": "简单柯里化",
            "code": "function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) {\n      return fn.apply(this, args);\n    }\n    return function(...args2) {\n      return curried.apply(this, args.concat(args2));\n    };\n  };\n}\n\nfunction add(a, b, c) {\n  return a + b + c;\n}\n\nconst curriedAdd = curry(add);\ncurriedAdd(1)(2)(3); // 6\ncurriedAdd(1, 2)(3); // 6\ncurriedAdd(1)(2, 3); // 6"
          },
          {
            "title": "应用",
            "code": "const log = curry((level, time, message) => {\n  console.log(`[${level}] ${time}: ${message}`);\n});\n\nconst errorLog = log('ERROR');\nconst errorNow = errorLog(Date.now());\n\nerrorNow('Something went wrong');"
          }
        ]
      },
      "source": "柯里化"
    },
    {
      "difficulty": "hard",
      "tags": ["偏函数"],
      "question": "偏函数（Partial Application）与柯里化有什么区别？",
      "options": [
        "偏函数固定部分参数返回新函数，柯里化转换为单参数函数链",
        "完全相同",
        "偏函数是柯里化的别名",
        "没有区别"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "偏函数 vs 柯里化：",
        "sections": [
          {
            "title": "偏函数",
            "code": "function partial(fn, ...fixedArgs) {\n  return function(...remainingArgs) {\n    return fn(...fixedArgs, ...remainingArgs);\n  };\n}\n\nfunction add(a, b, c) {\n  return a + b + c;\n}\n\nconst add5 = partial(add, 5);\nadd5(3, 2); // 10\n\n// 或用bind\nconst add5 = add.bind(null, 5);\nadd5(3, 2); // 10"
          },
          {
            "title": "柯里化",
            "code": "const curriedAdd = curry(add);\ncurriedAdd(5)(3)(2); // 10\n// 必须一个个传参"
          },
          {
            "title": "区别",
            "points": [
              "偏函数：固定N个参数，剩余一次传入",
              "柯里化：转换为N个单参数函数",
              "偏函数更灵活，柯里化更规范"
            ]
          }
        ]
      },
      "source": "偏函数"
    }
  ],
  "navigation": {
    "prev": {
      "title": "作用域",
      "url": "04-scope.html"
    },
    "next": {
      "title": "this关键字",
      "url": "04-this.html"
    }
  }
};
