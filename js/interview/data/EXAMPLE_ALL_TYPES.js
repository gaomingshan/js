/**
 * 多题型示例数据文件
 * 展示所有5种题型的使用方法
 */
window.quizData_ExampleAllTypes = {
  "config": {
    "title": "多题型示例",
    "icon": "🎯",
    "description": "展示单选、多选、代码输出、判断题、代码补全等所有题型",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    // ========== 1. 单选题示例 ==========
    {
      "type": "single-choice",
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
        "content": "闭包是指函数能够记住并访问其词法作用域，即使函数在词法作用域之外执行。",
        "code": "function outer() {\n  let count = 0;\n  return function inner() {\n    return ++count; // inner访问outer的变量\n  };\n}\n\nconst counter = outer();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2",
        "points": [
          "闭包 = 函数 + 词法环境",
          "可以访问外部函数的变量",
          "形成私有作用域"
        ]
      },
      "source": "闭包原理"
    },

    // ========== 2. 多选题示例 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["数组方法"],
      "question": "以下哪些数组方法会改变原数组？",
      "options": [
        "push()",
        "map()",
        "splice()",
        "filter()",
        "sort()",
        "slice()"
      ],
      "correctAnswer": ["A", "C", "E"],
      "explanation": {
        "title": "数组方法分类：",
        "sections": [
          {
            "title": "会改变原数组（Mutating Methods）",
            "points": [
              "push() - 添加元素到末尾",
              "pop() - 删除末尾元素",
              "shift() - 删除开头元素",
              "unshift() - 添加元素到开头",
              "splice() - 添加/删除元素",
              "sort() - 排序",
              "reverse() - 反转"
            ],
            "code": "const arr = [1, 2, 3];\narr.push(4);  // arr变为[1,2,3,4]\narr.sort();   // arr被排序"
          },
          {
            "title": "不改变原数组（Non-Mutating Methods）",
            "points": [
              "map() - 映射",
              "filter() - 过滤",
              "slice() - 切片",
              "concat() - 合并",
              "reduce() - 归约"
            ],
            "code": "const arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);\n// arr仍是[1,2,3]，doubled是[2,4,6]"
          }
        ]
      },
      "source": "数组方法"
    },

    // ========== 3. 代码输出题示例 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["类型转换", "运算符"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(1 + '1');\nconsole.log('1' + 1);\nconsole.log(1 - '1');\nconsole.log('1' - 1);",
      "options": [
        "'11', '11', 0, 0",
        "2, 2, 0, 0",
        "'11', '11', NaN, NaN",
        "2, '11', 0, NaN"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "类型转换规则：",
        "sections": [
          {
            "title": "1. 1 + '1' = '11'",
            "content": "+ 运算符遇到字符串会进行字符串拼接",
            "code": "1 + '1'  // 1转为'1'，然后'1' + '1' = '11'"
          },
          {
            "title": "2. '1' + 1 = '11'",
            "content": "顺序不影响，依然是字符串拼接",
            "code": "'1' + 1  // 1转为'1'，然后'1' + '1' = '11'"
          },
          {
            "title": "3. 1 - '1' = 0",
            "content": "- 运算符只能进行数值运算，字符串会转为数字",
            "code": "1 - '1'  // '1'转为1，然后1 - 1 = 0"
          },
          {
            "title": "4. '1' - 1 = 0",
            "content": "同理，字符串转为数字后相减",
            "code": "'1' - 1  // '1'转为1，然后1 - 1 = 0"
          },
          {
            "title": "核心规则",
            "points": [
              "+ 遇到字符串 → 字符串拼接",
              "- 只能数值运算 → 转为数字",
              "* 和 / 也会转为数字运算"
            ]
          }
        ]
      },
      "source": "类型转换"
    },

    // ========== 4. 代码输出题（复杂）==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["this绑定", "箭头函数"],
      "question": "以下代码的输出是什么？",
      "code": "const obj = {\n  name: 'obj',\n  fn1: function() {\n    console.log(this.name);\n  },\n  fn2: () => {\n    console.log(this.name);\n  }\n};\n\nobj.fn1();\nobj.fn2();",
      "options": [
        "'obj', undefined",
        "'obj', 'obj'",
        "undefined, undefined",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "普通函数 vs 箭头函数的this：",
        "sections": [
          {
            "title": "普通函数的this",
            "content": "谁调用指向谁，obj.fn1()中this指向obj",
            "code": "obj.fn1();  // this = obj，输出'obj'"
          },
          {
            "title": "箭头函数的this",
            "content": "继承外层作用域的this，这里是全局作用域",
            "code": "obj.fn2();  // this继承自外层（window/global）\n// window.name通常是undefined"
          },
          {
            "title": "关键区别",
            "points": [
              "普通函数：动态this，取决于调用方式",
              "箭头函数：静态this，定义时确定",
              "对象字面量不形成作用域"
            ]
          }
        ]
      },
      "source": "this绑定"
    },

    // ========== 5. 判断题示例 ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["类型判断"],
      "question": "typeof null 的结果是 'object'",
      "code": "console.log(typeof null);",
      "correctAnswer": "A",
      "explanation": {
        "title": "typeof null 的历史问题：",
        "content": "这是JavaScript的一个著名bug，在最初实现时，null被错误地标记为object类型。由于兼容性原因，这个bug一直保留至今。",
        "code": "typeof null          // 'object' ❌\ntypeof undefined     // 'undefined' ✅\nnull instanceof Object  // false",
        "points": [
          "这是JavaScript公认的设计缺陷",
          "由于兼容性无法修复",
          "判断null应使用 === null 或 Object.is(value, null)"
        ]
      },
      "source": "类型判断"
    },

    // ========== 6. 判断题（复杂）==========
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["原型链"],
      "question": "所有对象都继承自Object.prototype",
      "correctAnswer": "B",
      "explanation": {
        "title": "原型链的终点：",
        "content": "大部分对象确实继承自Object.prototype，但可以通过Object.create(null)创建没有原型的对象。",
        "sections": [
          {
            "title": "正常对象",
            "code": "const obj = {};\nobj.__proto__ === Object.prototype;  // true\nObject.prototype.__proto__ === null; // 原型链终点"
          },
          {
            "title": "无原型对象",
            "code": "const obj = Object.create(null);\nobj.__proto__;  // undefined\nobj.toString(); // 报错，没有继承任何方法"
          },
          {
            "title": "应用场景",
            "points": [
              "Object.create(null)创建纯净对象",
              "常用作Map替代品",
              "避免原型污染"
            ]
          }
        ]
      },
      "source": "原型链"
    },

    // ========== 7. 代码补全题示例 ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["防抖", "闭包", "this"],
      "question": "下面的防抖函数中，setTimeout的回调应该如何调用fn？",
      "code": "function debounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      // 这里应该填什么？\n    }, delay);\n  };\n}",
      "options": [
        "fn.apply(this, args)",
        "fn(...args)",
        "fn.call(this, ...args)",
        "fn.bind(this)(...args)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "防抖函数的this和参数传递：",
        "sections": [
          {
            "title": "为什么要用apply？",
            "points": [
              "需要保持原函数的this上下文",
              "需要传递所有参数args",
              "apply(thisArg, argsArray)恰好满足需求"
            ]
          },
          {
            "title": "其他选项的问题",
            "code": "// B. fn(...args) - 丢失了this\n// C. fn.call(this, ...args) - 也可以，但apply更简洁\n// D. fn.bind(this)(...args) - 多余的bind调用"
          },
          {
            "title": "完整实现",
            "code": "function debounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      fn.apply(this, args);  // ✅ 正确\n    }, delay);\n  };\n}\n\n// 使用示例\nconst obj = {\n  name: 'test',\n  log: debounce(function(msg) {\n    console.log(this.name, msg);\n  }, 1000)\n};\n\nobj.log('hello');  // 1秒后输出: test hello"
          }
        ]
      },
      "source": "防抖实现"
    },

    // ========== 8. 代码补全题（数组去重）==========
    {
      "type": "code-completion",
      "difficulty": "medium",
      "tags": ["数组去重", "Set"],
      "question": "下面的数组去重函数，空白处应该填什么？",
      "code": "function unique(arr) {\n  return Array.from(______);\n}",
      "options": [
        "new Set(arr)",
        "new Map(arr)",
        "arr.filter((item, index) => arr.indexOf(item) === index)",
        "arr.reduce((acc, cur) => acc.includes(cur) ? acc : [...acc, cur], [])"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "数组去重方法对比：",
        "sections": [
          {
            "title": "方法1：Set（推荐）",
            "code": "function unique(arr) {\n  return Array.from(new Set(arr));\n}\n// 或\nfunction unique(arr) {\n  return [...new Set(arr)];\n}\n\nunique([1, 2, 2, 3, 3]);  // [1, 2, 3]",
            "points": ["最简洁", "性能好O(n)", "ES6标准"]
          },
          {
            "title": "方法2：filter + indexOf",
            "code": "function unique(arr) {\n  return arr.filter((item, index) => arr.indexOf(item) === index);\n}\n// 性能O(n²)，不推荐大数组"
          },
          {
            "title": "方法3：reduce",
            "code": "function unique(arr) {\n  return arr.reduce((acc, cur) => \n    acc.includes(cur) ? acc : [...acc, cur], []);\n}\n// 性能O(n²)，代码冗长"
          }
        ]
      },
      "source": "数组去重"
    },

    // ========== 9. 多选题（进阶）==========
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["事件循环", "宏任务", "微任务"],
      "question": "以下哪些是微任务（Microtask）？",
      "options": [
        "Promise.then()",
        "setTimeout()",
        "MutationObserver",
        "setInterval()",
        "queueMicrotask()",
        "requestAnimationFrame()"
      ],
      "correctAnswer": ["A", "C", "E"],
      "explanation": {
        "title": "任务队列分类：",
        "sections": [
          {
            "title": "微任务（Microtask）",
            "points": [
              "Promise.then/catch/finally",
              "MutationObserver",
              "queueMicrotask()",
              "process.nextTick（Node.js）"
            ],
            "content": "微任务在当前任务结束后立即执行，优先级高于宏任务"
          },
          {
            "title": "宏任务（Macrotask）",
            "points": [
              "setTimeout/setInterval",
              "setImmediate（Node.js）",
              "I/O",
              "requestAnimationFrame",
              "UI渲染"
            ],
            "content": "宏任务在下一轮事件循环执行"
          },
          {
            "title": "执行顺序",
            "code": "console.log('1');\n\nsetTimeout(() => {\n  console.log('2');  // 宏任务\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');  // 微任务\n});\n\nconsole.log('4');\n\n// 输出: 1 4 3 2"
          }
        ]
      },
      "source": "事件循环"
    },

    // ========== 10. 代码输出题（异步）==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["事件循环", "异步"],
      "question": "以下代码的输出顺序是什么？",
      "code": "console.log('1');\n\nsetTimeout(() => {\n  console.log('2');\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');\n}).then(() => {\n  console.log('4');\n});\n\nconsole.log('5');",
      "options": [
        "1, 5, 3, 4, 2",
        "1, 2, 3, 4, 5",
        "1, 3, 4, 5, 2",
        "1, 5, 2, 3, 4"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "事件循环执行流程：",
        "sections": [
          {
            "title": "执行顺序分析",
            "code": "// 1. 同步代码\nconsole.log('1');  // 立即输出\nconsole.log('5');  // 立即输出\n\n// 2. 微任务队列\n// Promise.then → 输出'3'\n// 链式then → 输出'4'\n\n// 3. 宏任务队列\n// setTimeout → 输出'2'"
          },
          {
            "title": "事件循环机制",
            "points": [
              "1. 执行同步代码",
              "2. 执行所有微任务",
              "3. 渲染（如果需要）",
              "4. 执行一个宏任务",
              "5. 重复2-4"
            ]
          },
          {
            "title": "关键点",
            "content": "即使setTimeout延迟为0，它也是宏任务，会在所有微任务之后执行"
          }
        ]
      },
      "source": "事件循环"
    }
  ],
  "navigation": {
    "prev": {"title": "返回首页", "url": "../index.html"},
    "next": {"title": "返回首页", "url": "../index.html"}
  }
};
