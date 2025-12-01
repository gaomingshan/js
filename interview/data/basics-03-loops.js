window.quizData_Basics03Loops = {
  "config": {
    "title": "循环语句",
    "icon": "🔁",
    "description": "掌握for、while、do-while等循环控制",
    "primaryColor": "#06b6d4",
    "bgGradient": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["for循环"],
      "question": "for循环的三个表达式分别是什么？",
      "options": [
        "初始化、条件判断、迭代表达式",
        "开始、结束、步长",
        "变量、条件、递增",
        "都必须填写"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "for循环结构：",
        "sections": [
          {
            "title": "基本语法",
            "code": "for (初始化; 条件; 迭代) {\n  // 循环体\n}\n\n// 示例\nfor (let i = 0; i < 10; i++) {\n  console.log(i);\n}"
          },
          {
            "title": "执行顺序",
            "points": [
              "1. 执行初始化（只执行一次）",
              "2. 判断条件，false则退出",
              "3. 执行循环体",
              "4. 执行迭代表达式",
              "5. 回到步骤2"
            ]
          },
          {
            "title": "三个表达式都可省略",
            "code": "// 省略初始化\nlet i = 0;\nfor (; i < 10; i++) { }\n\n// 省略迭代\nfor (let i = 0; i < 10;) {\n  i++;\n}\n\n// 无限循环\nfor (;;) {\n  if (condition) break;\n}"
          }
        ]
      },
      "source": "for循环"
    },
    {
      "difficulty": "easy",
      "tags": ["while循环"],
      "question": "while和do-while的区别是什么？",
      "options": [
        "while先判断后执行，do-while先执行后判断（至少执行一次）",
        "完全相同",
        "do-while不判断条件",
        "while更快"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "while vs do-while：",
        "sections": [
          {
            "title": "while循环",
            "code": "let i = 0;\nwhile (i < 3) {\n  console.log(i);\n  i++;\n}\n\n// 条件不满足，一次都不执行\nwhile (false) {\n  console.log('不会执行');\n}"
          },
          {
            "title": "do-while循环",
            "code": "let i = 0;\ndo {\n  console.log(i);\n  i++;\n} while (i < 3);\n\n// 至少执行一次\ndo {\n  console.log('会执行一次');\n} while (false);"
          },
          {
            "title": "使用场景",
            "code": "// while：不确定循环次数，可能不执行\nwhile (hasMore()) {\n  processNext();\n}\n\n// do-while：至少需要执行一次\ndo {\n  userInput = prompt('请输入(输入q退出):');\n} while (userInput !== 'q');"
          }
        ]
      },
      "source": "while循环"
    },
    {
      "difficulty": "medium",
      "tags": ["for...in"],
      "question": "for...in循环遍历什么？有什么陷阱？",
      "options": [
        "遍历对象的可枚举属性（包括继承的），不建议用于数组",
        "只遍历自身属性",
        "遍历数组最好的方式",
        "只遍历数组"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "for...in详解：",
        "sections": [
          {
            "title": "基本用法",
            "code": "const obj = { a: 1, b: 2, c: 3 };\n\nfor (const key in obj) {\n  console.log(key, obj[key]);\n}\n// 输出：a 1, b 2, c 3"
          },
          {
            "title": "陷阱1：遍历原型链",
            "code": "function Person(name) {\n  this.name = name;\n}\nPerson.prototype.age = 18;\n\nconst p = new Person('John');\n\nfor (const key in p) {\n  console.log(key); // name, age（包括原型）\n}\n\n// 解决：使用hasOwnProperty\nfor (const key in p) {\n  if (p.hasOwnProperty(key)) {\n    console.log(key); // 只有name\n  }\n}"
          },
          {
            "title": "陷阱2：数组遍历",
            "code": "const arr = [1, 2, 3];\narr.foo = 'bar';\n\nfor (const i in arr) {\n  console.log(i); // '0', '1', '2', 'foo'\n}\n\n// 问题：\n// 1. 遍历所有可枚举属性（包括非索引）\n// 2. i是字符串，不是数字\n// 3. 顺序不保证\n\n// 应该用for...of\nfor (const val of arr) {\n  console.log(val); // 1, 2, 3\n}"
          }
        ]
      },
      "source": "for...in"
    },
    {
      "difficulty": "medium",
      "tags": ["for...of"],
      "question": "for...of可以遍历哪些对象？",
      "options": [
        "实现了Iterator接口的对象（数组、Set、Map、字符串等）",
        "所有对象",
        "只能遍历数组",
        "与for...in相同"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "for...of详解：",
        "sections": [
          {
            "title": "可遍历的对象",
            "code": "// 数组\nfor (const item of [1, 2, 3]) { }\n\n// 字符串\nfor (const char of 'hello') { }\n\n// Set\nfor (const val of new Set([1, 2, 3])) { }\n\n// Map\nfor (const [key, val] of new Map([['a', 1]])) { }\n\n// arguments\nfunction fn() {\n  for (const arg of arguments) { }\n}\n\n// NodeList\nfor (const el of document.querySelectorAll('div')) { }"
          },
          {
            "title": "普通对象不可遍历",
            "code": "const obj = { a: 1, b: 2 };\n\nfor (const val of obj) { } // TypeError\n\n// 解决方案：\n// 1. Object.keys\nfor (const key of Object.keys(obj)) { }\n\n// 2. Object.values\nfor (const val of Object.values(obj)) { }\n\n// 3. Object.entries\nfor (const [key, val] of Object.entries(obj)) { }"
          },
          {
            "title": "for...of vs for...in",
            "code": "const arr = [10, 20, 30];\n\n// for...in：遍历键（索引）\nfor (const i in arr) {\n  console.log(i, typeof i); // '0' string, '1' string\n}\n\n// for...of：遍历值\nfor (const val of arr) {\n  console.log(val, typeof val); // 10 number, 20 number\n}"
          }
        ]
      },
      "source": "for...of"
    },
    {
      "difficulty": "medium",
      "tags": ["break和continue"],
      "question": "break和continue的区别是什么？",
      "options": [
        "break终止整个循环，continue跳过当前迭代继续下一次",
        "完全相同",
        "continue终止循环",
        "break跳过当前"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "break vs continue：",
        "sections": [
          {
            "title": "break",
            "code": "for (let i = 0; i < 10; i++) {\n  if (i === 5) break;\n  console.log(i);\n}\n// 输出：0 1 2 3 4\n// 遇到5时终止循环"
          },
          {
            "title": "continue",
            "code": "for (let i = 0; i < 10; i++) {\n  if (i === 5) continue;\n  console.log(i);\n}\n// 输出：0 1 2 3 4 6 7 8 9\n// 跳过5，继续后续循环"
          },
          {
            "title": "嵌套循环",
            "code": "for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (j === 1) break; // 只跳出内层\n    console.log(i, j);\n  }\n}\n// 输出：0 0, 1 0, 2 0"
          },
          {
            "title": "标签跳出",
            "code": "outer: for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (i === 1 && j === 1) break outer;\n    console.log(i, j);\n  }\n}\n// 输出：0 0, 0 1, 0 2, 1 0\n// 跳出外层循环"
          }
        ]
      },
      "source": "break/continue"
    },
    {
      "difficulty": "medium",
      "tags": ["forEach"],
      "question": "forEach可以使用break或continue吗？如何提前终止？",
      "options": [
        "不能使用break/continue，可用return跳过当前，用抛异常终止",
        "可以使用break",
        "可以使用continue",
        "无法终止"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "forEach限制：",
        "sections": [
          {
            "title": "无法使用break/continue",
            "code": "// 错误\n[1, 2, 3].forEach(item => {\n  if (item === 2) break; // SyntaxError\n});\n\n[1, 2, 3].forEach(item => {\n  if (item === 2) continue; // SyntaxError\n});"
          },
          {
            "title": "return只跳过当前",
            "code": "[1, 2, 3, 4, 5].forEach(item => {\n  if (item === 3) return; // 跳过3\n  console.log(item);\n});\n// 输出：1 2 4 5"
          },
          {
            "title": "提前终止：抛异常",
            "code": "try {\n  [1, 2, 3, 4, 5].forEach(item => {\n    if (item === 3) throw new Error('break');\n    console.log(item);\n  });\n} catch (e) {\n  if (e.message !== 'break') throw e;\n}\n// 输出：1 2"
          },
          {
            "title": "更好的替代",
            "code": "// 使用for...of\nfor (const item of [1, 2, 3, 4, 5]) {\n  if (item === 3) break;\n  console.log(item);\n}\n\n// 使用some/every\n[1, 2, 3, 4, 5].some(item => {\n  if (item === 3) return true; // 终止\n  console.log(item);\n  return false;\n});"
          }
        ]
      },
      "source": "forEach"
    },
    {
      "difficulty": "hard",
      "tags": ["循环性能"],
      "question": "不同循环方式的性能如何？如何优化？",
      "options": [
        "传统for最快，for...of次之，forEach较慢；优化：缓存长度、减少查找",
        "forEach最快",
        "性能完全相同",
        "for...of最快"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "循环性能优化：",
        "sections": [
          {
            "title": "性能排序（大致）",
            "points": [
              "1. for循环（最快）",
              "2. while循环",
              "3. for...of",
              "4. forEach",
              "5. for...in（最慢，不建议用于数组）"
            ]
          },
          {
            "title": "优化1：缓存长度",
            "code": "// 不好\nfor (let i = 0; i < arr.length; i++) {\n  // 每次都访问length\n}\n\n// 好\nconst len = arr.length;\nfor (let i = 0; i < len; i++) {\n  // 只访问一次length\n}\n\n// 更好（倒序，减少比较）\nfor (let i = arr.length - 1; i >= 0; i--) {\n  // i-- 和比较0都更快\n}"
          },
          {
            "title": "优化2：减少作用域查找",
            "code": "// 不好\nfor (let i = 0; i < items.length; i++) {\n  document.getElementById('result').innerHTML += items[i];\n}\n\n// 好\nconst result = document.getElementById('result');\nconst len = items.length;\nlet html = '';\nfor (let i = 0; i < len; i++) {\n  html += items[i];\n}\nresult.innerHTML = html;"
          },
          {
            "title": "优化3：选择合适的循环",
            "code": "// 简单遍历：for...of（可读性好）\nfor (const item of items) {\n  process(item);\n}\n\n// 需要索引：forEach\nitems.forEach((item, index) => {\n  process(item, index);\n});\n\n// 性能关键：传统for\nfor (let i = 0, len = items.length; i < len; i++) {\n  process(items[i]);\n}"
          }
        ]
      },
      "source": "循环性能"
    },
    {
      "difficulty": "hard",
      "tags": ["循环变量"],
      "question": "var和let在for循环中有什么区别？",
      "options": [
        "let每次迭代创建新绑定，var共享同一变量",
        "完全相同",
        "let性能更差",
        "var更安全"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "循环中的变量声明：",
        "sections": [
          {
            "title": "var的问题",
            "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);\n  }, 100);\n}\n// 输出：3 3 3\n// 所有回调共享同一个i"
          },
          {
            "title": "let的解决",
            "code": "for (let i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);\n  }, 100);\n}\n// 输出：0 1 2\n// 每次迭代创建新的i"
          },
          {
            "title": "var的解决方案",
            "code": "// 使用IIFE\nfor (var i = 0; i < 3; i++) {\n  (function(j) {\n    setTimeout(() => {\n      console.log(j);\n    }, 100);\n  })(i);\n}\n// 输出：0 1 2"
          },
          {
            "title": "原理",
            "code": "// var：只有一个i\n{\n  var i;\n  for (i = 0; i < 3; i++) { }\n}\n\n// let：每次迭代新的i\nfor (let i = 0; i < 3; i++) {\n  // 每次循环相当于：\n  // {\n  //   let i = 上一次的i;\n  //   循环体\n  // }\n}"
          }
        ]
      },
      "source": "循环变量"
    },
    {
      "difficulty": "hard",
      "tags": ["无限循环"],
      "question": "如何避免和处理无限循环？",
      "options": [
        "确保循环条件能变为false、使用超时保护、监控迭代次数",
        "无法避免",
        "不需要处理",
        "浏览器会自动终止"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "无限循环处理：",
        "sections": [
          {
            "title": "常见原因",
            "code": "// 1. 忘记更新循环变量\nlet i = 0;\nwhile (i < 10) {\n  console.log(i);\n  // 忘记 i++\n}\n\n// 2. 条件永远为真\nwhile (true) {\n  // 没有break\n}\n\n// 3. 错误的条件\nfor (let i = 0; i >= 0; i++) {\n  // i永远>=0\n}"
          },
          {
            "title": "防护措施",
            "code": "// 1. 最大迭代次数\nconst MAX_ITERATIONS = 10000;\nlet count = 0;\n\nwhile (condition) {\n  if (count++ > MAX_ITERATIONS) {\n    console.error('超过最大迭代次数');\n    break;\n  }\n  // 循环体\n}\n\n// 2. 超时保护\nconst startTime = Date.now();\nconst TIMEOUT = 5000; // 5秒\n\nwhile (condition) {\n  if (Date.now() - startTime > TIMEOUT) {\n    console.error('循环超时');\n    break;\n  }\n  // 循环体\n}"
          },
          {
            "title": "开发时检测",
            "code": "// 使用断言\nfunction safeLoop(fn, maxIterations = 1000) {\n  let count = 0;\n  while (fn()) {\n    if (count++ > maxIterations) {\n      throw new Error('可能的无限循环');\n    }\n  }\n}\n\n// 使用\nsafeLoop(() => {\n  // 返回是否继续循环\n  return condition;\n});"
          }
        ]
      },
      "source": "无限循环"
    },
    {
      "difficulty": "hard",
      "tags": ["循环优化"],
      "question": "如何优化大数据量的循环处理？",
      "options": [
        "分批处理、使用Web Worker、requestAnimationFrame、虚拟化",
        "无法优化",
        "减少数据量",
        "使用更快的循环"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "大数据循环优化：",
        "sections": [
          {
            "title": "1. 分批处理",
            "code": "function processLargeArray(arr, batchSize = 1000) {\n  let index = 0;\n  \n  function processBatch() {\n    const end = Math.min(index + batchSize, arr.length);\n    \n    for (; index < end; index++) {\n      // 处理arr[index]\n    }\n    \n    if (index < arr.length) {\n      setTimeout(processBatch, 0); // 让出主线程\n    }\n  }\n  \n  processBatch();\n}"
          },
          {
            "title": "2. requestAnimationFrame",
            "code": "function processWithRAF(arr) {\n  let index = 0;\n  const chunkSize = 100;\n  \n  function processChunk() {\n    const end = Math.min(index + chunkSize, arr.length);\n    \n    while (index < end) {\n      // 处理arr[index]\n      index++;\n    }\n    \n    if (index < arr.length) {\n      requestAnimationFrame(processChunk);\n    }\n  }\n  \n  requestAnimationFrame(processChunk);\n}"
          },
          {
            "title": "3. Web Worker",
            "code": "// main.js\nconst worker = new Worker('worker.js');\nworker.postMessage(largeArray);\nworker.onmessage = (e) => {\n  console.log('处理完成', e.data);\n};\n\n// worker.js\nonmessage = (e) => {\n  const data = e.data;\n  const result = [];\n  \n  for (let i = 0; i < data.length; i++) {\n    result.push(process(data[i]));\n  }\n  \n  postMessage(result);\n};"
          },
          {
            "title": "4. 虚拟滚动",
            "code": "// 只渲染可见区域\nfunction virtualScroll(items, viewportHeight) {\n  const itemHeight = 50;\n  const visibleCount = Math.ceil(viewportHeight / itemHeight);\n  const scrollTop = container.scrollTop;\n  const startIndex = Math.floor(scrollTop / itemHeight);\n  const endIndex = startIndex + visibleCount;\n  \n  // 只处理可见项\n  const visibleItems = items.slice(startIndex, endIndex);\n  return visibleItems;\n}"
          }
        ]
      },
      "source": "循环优化"
    }
  ],
  "navigation": {
    "prev": {
      "title": "条件语句",
      "url": "03-conditionals.html"
    },
    "next": {
      "title": "错误处理",
      "url": "03-error-handling.html"
    }
  }
};
