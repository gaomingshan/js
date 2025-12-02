/**
 * 闭包的内存模型
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1403ClosureMemory = {
  "config": {
    "title": "闭包的内存模型",
    "icon": "🔒",
    "description": "深入理解闭包的内存结构、生命周期和性能优化",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["闭包定义"],
      "question": "闭包产生的本质是什么？",
      "options": [
        "函数嵌套且内部函数引用外部变量",
        "函数作为返回值",
        "使用var声明变量",
        "使用匿名函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包的本质",
        "code": "// 闭包 = 函数 + 函数能访问的自由变量\n\nfunction outer() {\n  let count = 0; // 自由变量\n  \n  return function inner() {\n    count++; // 引用外部变量\n    return count;\n  };\n}\n\nconst counter = outer();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2"
      },
      "source": "闭包"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["闭包内存"],
      "question": "闭包的内存模型包含哪些部分？",
      "options": [
        "函数对象",
        "[[Scope]]属性",
        "被引用的外部变量",
        "所有外部变量",
        "原型链",
        "this绑定"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "闭包内存结构",
        "code": "function createCounter() {\n  let count = 0;     // 被引用\n  let unused = 999;  // 未被引用\n  \n  return function() {\n    return ++count;\n  };\n}\n\nconst counter = createCounter();\n\n// counter的内存结构：\n// {\n//   code: <函数代码>,\n//   [[Scope]]: [\n//     {\n//       count: 0  // 只保存被引用的变量\n//       // unused被垃圾回收\n//     },\n//     globalVO\n//   ]\n// }"
      },
      "source": "内存模型"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["循环闭包"],
      "question": "以下代码的输出是什么？",
      "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
      "options": [
        "3, 3, 3",
        "0, 1, 2",
        "0, 0, 0",
        "undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "循环闭包陷阱",
        "code": "// 问题：所有回调共享同一个i\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 输出: 3, 3, 3\n\n// 解决方案1：使用let\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 输出: 0, 1, 2\n\n// 解决方案2：IIFE\nfor (var i = 0; i < 3; i++) {\n  (function(j) {\n    setTimeout(() => console.log(j), 0);\n  })(i);\n}\n// 输出: 0, 1, 2\n\n// 解决方案3：bind\nfor (var i = 0; i < 3; i++) {\n  setTimeout(console.log.bind(null, i), 0);\n}\n// 输出: 0, 1, 2"
      },
      "source": "循环闭包"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["内存泄漏"],
      "question": "闭包一定会导致内存泄漏",
      "correctAnswer": "B",
      "explanation": {
        "title": "闭包与内存泄漏",
        "code": "// 闭包本身不会泄漏，只要及时释放\n\nlet handler = createHandler();\n// 使用handler\nhandler = null; // 释放引用，允许GC\n\n// ❌ 真正的内存泄漏\nfunction leak() {\n  const bigData = new Array(1000000);\n  return function() {\n    console.log(bigData.length); // 持有大对象\n  };\n}\n\n// ✅ 正确使用\nfunction good() {\n  const bigData = new Array(1000000);\n  const length = bigData.length; // 只保存需要的\n  return function() {\n    console.log(length);\n  };\n}"
      },
      "source": "内存泄漏"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["单例模式"],
      "question": "实现单例模式，空白处填什么？",
      "code": "const Singleton = (function() {\n  let instance;\n  \n  return {\n    getInstance: function() {\n      if (!instance) {\n        instance = ______;\n      }\n      return instance;\n    }\n  };\n})();",
      "options": [
        "{ name: 'singleton' }",
        "new Object()",
        "this",
        "Singleton"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "单例模式实现",
        "code": "const Singleton = (function() {\n  let instance;\n  \n  function createInstance() {\n    return {\n      name: 'singleton',\n      id: Math.random()\n    };\n  }\n  \n  return {\n    getInstance: function() {\n      if (!instance) {\n        instance = createInstance();\n      }\n      return instance;\n    }\n  };\n})();\n\n// 使用\nconst a = Singleton.getInstance();\nconst b = Singleton.getInstance();\nconsole.log(a === b); // true"
      },
      "source": "单例模式"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["闭包应用"],
      "question": "闭包的常见应用场景有哪些？",
      "options": [
        "模块化封装",
        "实现私有变量",
        "函数柯里化",
        "防抖节流",
        "数组排序",
        "事件处理"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "闭包应用场景",
        "code": "// 1. 私有变量\nfunction createPerson(name) {\n  let _name = name; // 私有\n  return {\n    getName: () => _name,\n    setName: (n) => _name = n\n  };\n}\n\n// 2. 模块化\nconst module = (function() {\n  let private = 'secret';\n  return {\n    getPrivate: () => private\n  };\n})();\n\n// 3. 柯里化\nfunction curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) {\n      return fn(...args);\n    }\n    return (...args2) => curried(...args, ...args2);\n  };\n}\n\n// 4. 防抖\nfunction debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\n\n// 5. 事件处理\nfunction createHandler(data) {\n  return function(event) {\n    console.log(data, event);\n  };\n}\n\nbutton.onclick = createHandler('button clicked');"
      },
      "source": "闭包应用"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["this指向"],
      "question": "以下代码的输出是什么？",
      "code": "const obj = {\n  name: 'obj',\n  getName: function() {\n    return function() {\n      return this.name;\n    };\n  }\n};\n\nconsole.log(obj.getName()());",
      "options": [
        "undefined（严格模式报错）",
        "'obj'",
        "null",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包中的this",
        "code": "const obj = {\n  name: 'obj',\n  getName: function() {\n    return function() {\n      return this.name; // this指向全局\n    };\n  }\n};\n\nconsole.log(obj.getName()()); // undefined\n\n// 解决方案1：保存this\ngetName: function() {\n  const self = this;\n  return function() {\n    return self.name;\n  };\n}\n\n// 解决方案2：箭头函数\ngetName: function() {\n  return () => this.name;\n}\n\n// 解决方案3：bind\ngetName: function() {\n  return function() {\n    return this.name;\n  }.bind(this);\n}"
      },
      "source": "this指向"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["垃圾回收"],
      "question": "只要存在对闭包的引用，闭包引用的外部变量就不会被垃圾回收",
      "correctAnswer": "A",
      "explanation": {
        "title": "闭包与垃圾回收",
        "code": "function outer() {\n  let data = { large: 'object' };\n  \n  return function inner() {\n    console.log(data);\n  };\n}\n\nlet fn = outer();\n// data不会被回收，因为fn引用它\n\nfn = null; // 释放fn\n// 现在data可以被回收了\n\n// V8优化：\n// 只保留被引用的变量\nfunction outer2() {\n  let used = 1;\n  let unused = 2;\n  \n  return function() {\n    console.log(used); // 只引用used\n  };\n}\n// unused会被回收"
      },
      "source": "垃圾回收"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["函数工厂"],
      "question": "实现计数器工厂，空白处填什么？",
      "code": "function createCounter(init = 0) {\n  let count = init;\n  \n  return {\n    increment: () => ______,\n    decrement: () => --count,\n    get: () => count\n  };\n}",
      "options": [
        "++count",
        "count++",
        "count + 1",
        "return count++"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "函数工厂模式",
        "code": "function createCounter(init = 0) {\n  let count = init; // 私有变量\n  \n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    get: () => count,\n    reset: () => count = init\n  };\n}\n\n// 使用\nconst counter1 = createCounter(0);\nconst counter2 = createCounter(10);\n\ncounter1.increment(); // 1\ncounter1.increment(); // 2\n\ncounter2.increment(); // 11\n\n// 每个计数器有独立的count"
      },
      "source": "函数工厂"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "闭包使用的最佳实践有哪些？",
      "options": [
        "明确闭包的生命周期",
        "避免在循环中创建闭包",
        "及时释放不需要的引用",
        "使用WeakMap存储数据",
        "所有函数都用闭包",
        "避免闭包持有大对象"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "闭包最佳实践",
        "code": "// 1. 明确生命周期\nfunction createHandler() {\n  const handler = function() {};\n  element.addEventListener('click', handler);\n  \n  return function cleanup() {\n    element.removeEventListener('click', handler);\n  };\n}\n\n// 2. 避免循环中创建\n// ❌ 不好\nfor (var i = 0; i < items.length; i++) {\n  items[i].onclick = function() {\n    console.log(i);\n  };\n}\n\n// ✅ 好\nitems.forEach((item, i) => {\n  item.onclick = () => console.log(i);\n});\n\n// 3. 使用WeakMap\nconst privateData = new WeakMap();\nclass MyClass {\n  constructor() {\n    privateData.set(this, { secret: 'data' });\n  }\n}\n\n// 4. 避免持有大对象\n// ❌ 不好\nfunction bad() {\n  const bigData = new Array(1000000);\n  return () => console.log(bigData);\n}\n\n// ✅ 好\nfunction good() {\n  const bigData = new Array(1000000);\n  const length = bigData.length;\n  return () => console.log(length);\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "作用域链的本质",
      "url": "14-02-scope-chain.html"
    },
    "next": {
      "title": "原型链的底层实现",
      "url": "15-01-prototype-chain.html"
    }
  }
};
