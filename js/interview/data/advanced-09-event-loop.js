/**
 * 事件循环机制
 * 包含多种题型：代码输出、多选、判断、单选
 */
window.quizData_Advanced09EventLoop = {
  "config": {
    "title": "事件循环机制",
    "icon": "🔄",
    "description": "深入理解JavaScript事件循环、宏任务与微任务的执行机制",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    // ========== 1. 单选题：事件循环基础 ==========
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["事件循环概念"],
      "question": "什么是事件循环（Event Loop）？",
      "options": [
        "JavaScript运行时处理异步任务的机制，不断检查任务队列并执行",
        "JavaScript的for循环语法糖",
        "浏览器的事件监听机制",
        "Node.js特有的并发模型"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "事件循环（Event Loop）：",
        "sections": [
          {
            "title": "基本概念",
            "content": "事件循环是JavaScript实现异步编程的核心机制。由于JavaScript是单线程的，事件循环负责协调代码执行、收集和处理事件以及执行队列中的子任务。",
            "points": [
              "单线程执行模型",
              "非阻塞I/O",
              "通过任务队列实现异步"
            ]
          },
          {
            "title": "执行流程",
            "code": "// 1. 执行同步代码（调用栈）\nconsole.log('start');\n\n// 2. 遇到异步任务，放入任务队列\nsetTimeout(() => console.log('timeout'), 0);\n\n// 3. 继续执行同步代码\nconsole.log('end');\n\n// 4. 调用栈清空后，从队列取任务执行\n// 输出: start → end → timeout"
          }
        ]
      },
      "source": "事件循环"
    },

    // ========== 2. 多选题：任务类型 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["宏任务", "微任务"],
      "question": "以下哪些是微任务（Microtask）？",
      "options": [
        "Promise.then()",
        "setTimeout()",
        "queueMicrotask()",
        "requestAnimationFrame()",
        "MutationObserver",
        "setImmediate()"
      ],
      "correctAnswer": ["A", "C", "E"],
      "explanation": {
        "title": "宏任务 vs 微任务：",
        "sections": [
          {
            "title": "微任务（Microtask）",
            "points": [
              "Promise.then/catch/finally",
              "queueMicrotask()",
              "MutationObserver",
              "process.nextTick（Node.js，优先级最高）"
            ],
            "content": "微任务在当前宏任务执行完后立即执行，优先级高于宏任务"
          },
          {
            "title": "宏任务（Macrotask/Task）",
            "points": [
              "setTimeout/setInterval",
              "setImmediate（Node.js）",
              "requestAnimationFrame（浏览器）",
              "I/O操作",
              "UI渲染",
              "script标签代码"
            ],
            "content": "每次事件循环只执行一个宏任务"
          },
          {
            "title": "执行顺序",
            "code": "console.log('1');  // 同步\n\nsetTimeout(() => console.log('2'), 0);  // 宏任务\n\nPromise.resolve().then(() => console.log('3'));  // 微任务\n\nconsole.log('4');  // 同步\n\n// 输出: 1 → 4 → 3 → 2"
          }
        ]
      },
      "source": "任务队列"
    },

    // ========== 3. 代码输出题：复杂执行顺序 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["执行顺序"],
      "question": "以下代码的输出顺序是什么？",
      "code": "console.log('1');\n\nsetTimeout(() => {\n  console.log('2');\n  Promise.resolve().then(() => console.log('3'));\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('4');\n  setTimeout(() => console.log('5'), 0);\n});\n\nconsole.log('6');",
      "options": [
        "1, 6, 4, 2, 3, 5",
        "1, 6, 2, 4, 3, 5",
        "1, 4, 6, 2, 3, 5",
        "1, 6, 4, 2, 5, 3"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "事件循环详细分析：",
        "sections": [
          {
            "title": "执行流程",
            "code": "// === 第一轮：执行同步代码 ===\nconsole.log('1');  // 输出: 1\n// setTimeout回调进入宏任务队列\n// Promise.then进入微任务队列\nconsole.log('6');  // 输出: 6\n\n// === 第二轮：执行微任务 ===\n// 执行Promise.then\nconsole.log('4');  // 输出: 4\n// 内部的setTimeout进入宏任务队列\n\n// === 第三轮：执行宏任务1 ===\n// 执行第一个setTimeout\nconsole.log('2');  // 输出: 2\n// 内部Promise.then进入微任务队列\n\n// === 第四轮：执行微任务 ===\nconsole.log('3');  // 输出: 3\n\n// === 第五轮：执行宏任务2 ===\nconsole.log('5');  // 输出: 5"
          },
          {
            "title": "关键规则",
            "points": [
              "同步代码优先执行",
              "每个宏任务后执行所有微任务",
              "微任务中产生的微任务本轮就执行",
              "宏任务中产生的微任务下一轮开始前执行"
            ]
          }
        ]
      },
      "source": "事件循环执行顺序"
    },

    // ========== 4. 判断题：微任务清空 ==========
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["微任务队列"],
      "question": "事件循环在执行下一个宏任务前，会清空所有微任务队列",
      "correctAnswer": "A",
      "explanation": {
        "title": "微任务清空机制：",
        "sections": [
          {
            "title": "正确！",
            "content": "每次执行完一个宏任务后，事件循环会检查微任务队列，并执行所有微任务，直到队列清空才会执行下一个宏任务。",
            "code": "setTimeout(() => console.log('宏1'), 0);\nsetTimeout(() => console.log('宏2'), 0);\n\nPromise.resolve()\n  .then(() => {\n    console.log('微1');\n    return Promise.resolve();\n  })\n  .then(() => console.log('微2'));\n\n// 输出: 微1 → 微2 → 宏1 → 宏2"
          },
          {
            "title": "微任务中产生的微任务",
            "content": "如果微任务中又产生新的微任务，新微任务会被添加到队列末尾，在本轮就被执行",
            "code": "Promise.resolve()\n  .then(() => {\n    console.log('微1');\n    Promise.resolve().then(() => console.log('微2'));\n  })\n  .then(() => console.log('微3'));\n\nsetTimeout(() => console.log('宏'), 0);\n\n// 输出: 微1 → 微3 → 微2 → 宏\n// 微2虽然后创建，但在同一轮微任务中"
          }
        ]
      },
      "source": "微任务队列"
    },

    // ========== 5. 代码输出题：async/await执行顺序 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["async/await"],
      "question": "以下代码的输出顺序是什么？",
      "code": "async function async1() {\n  console.log('1');\n  await async2();\n  console.log('2');\n}\n\nasync function async2() {\n  console.log('3');\n}\n\nconsole.log('4');\n\nsetTimeout(() => console.log('5'), 0);\n\nasync1();\n\nPromise.resolve().then(() => console.log('6'));\n\nconsole.log('7');",
      "options": [
        "4, 1, 3, 7, 2, 6, 5",
        "4, 1, 3, 7, 6, 2, 5",
        "4, 1, 3, 2, 7, 6, 5",
        "4, 7, 1, 3, 2, 6, 5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "async/await与事件循环：",
        "sections": [
          {
            "title": "async/await本质",
            "content": "await会暂停async函数的执行，await后面的代码会作为微任务执行",
            "code": "async function fn() {\n  console.log('1');\n  await something();\n  console.log('2');  // 相当于放入微任务\n}\n\n// 等价于\nfunction fn() {\n  console.log('1');\n  return something().then(() => {\n    console.log('2');\n  });\n}"
          },
          {
            "title": "执行流程",
            "code": "// 1. 同步代码\nconsole.log('4');  // 输出: 4\n// setTimeout进入宏任务队列\n\n// 2. 调用async1()\nconsole.log('1');  // 输出: 1（async函数同步执行到await）\n\n// 3. 调用async2()\nconsole.log('3');  // 输出: 3（同步）\n// await后的代码进入微任务: console.log('2')\n\n// 4. Promise.then进入微任务\n\n// 5. 继续同步代码\nconsole.log('7');  // 输出: 7\n\n// 6. 执行微任务队列\nconsole.log('2');  // 输出: 2（先入队）\nconsole.log('6');  // 输出: 6（后入队）\n\n// 7. 执行宏任务\nconsole.log('5');  // 输出: 5"
          }
        ]
      },
      "source": "async/await"
    },

    // ========== 6. 多选题：事件循环阶段 ==========
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Node.js事件循环"],
      "question": "Node.js事件循环包含哪些阶段？",
      "options": [
        "timers（定时器）",
        "pending callbacks",
        "poll（轮询）",
        "microtasks（微任务）",
        "check（检查）",
        "close callbacks"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "Node.js事件循环六个阶段：",
        "sections": [
          {
            "title": "事件循环阶段",
            "points": [
              "timers - 执行setTimeout/setInterval回调",
              "pending callbacks - 执行延迟到下一轮的I/O回调",
              "idle, prepare - 内部使用",
              "poll - 获取新的I/O事件，执行I/O回调",
              "check - 执行setImmediate回调",
              "close callbacks - 执行关闭事件回调"
            ],
            "code": "   ┌───────────────────────────┐\n┌─>│           timers          │\n│  └─────────────┬─────────────┘\n│  ┌─────────────┴─────────────┐\n│  │     pending callbacks     │\n│  └─────────────┬─────────────┘\n│  ┌─────────────┴─────────────┐\n│  │       idle, prepare       │\n│  └─────────────┬─────────────┘\n│  ┌─────────────┴─────────────┐\n│  │           poll            │\n│  └─────────────┬─────────────┘\n│  ┌─────────────┴─────────────┐\n│  │           check           │\n│  └─────────────┬─────────────┘\n│  ┌─────────────┴─────────────┐\n└──│      close callbacks      │\n   └───────────────────────────┘"
          },
          {
            "title": "微任务不是阶段",
            "content": "微任务在每个阶段之间执行，不属于事件循环的某个阶段",
            "code": "// Node.js微任务\nprocess.nextTick()  // 优先级最高\nPromise.then()      // 次之"
          }
        ]
      },
      "source": "Node.js事件循环"
    },

    // ========== 7. 代码输出题：process.nextTick ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Node.js", "process.nextTick"],
      "question": "Node.js中，以下代码的输出顺序是什么？",
      "code": "setTimeout(() => console.log('1'), 0);\n\nsetImmediate(() => console.log('2'));\n\nprocess.nextTick(() => console.log('3'));\n\nPromise.resolve().then(() => console.log('4'));\n\nconsole.log('5');",
      "options": [
        "5, 3, 4, 1, 2",
        "5, 3, 4, 2, 1",
        "5, 4, 3, 1, 2",
        "5, 1, 2, 3, 4"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Node.js微任务优先级：",
        "sections": [
          {
            "title": "执行顺序",
            "points": [
              "1. 同步代码",
              "2. process.nextTick（最高优先级）",
              "3. 其他微任务（Promise.then）",
              "4. 宏任务（setTimeout、setImmediate）"
            ],
            "code": "// 执行流程\nconsole.log('5');  // 同步，输出: 5\n\n// nextTick队列\nprocess.nextTick(() => console.log('3'));  // 输出: 3\n\n// Promise微任务队列\nPromise.resolve().then(() => console.log('4'));  // 输出: 4\n\n// timers阶段\nsetTimeout(() => console.log('1'), 0);  // 输出: 1\n\n// check阶段\nsetImmediate(() => console.log('2'));  // 输出: 2"
          },
          {
            "title": "setTimeout vs setImmediate",
            "content": "在timers阶段之外调用时，setImmediate总是比setTimeout先执行（因为check阶段在poll之后）",
            "code": "// 在I/O回调中\nconst fs = require('fs');\nfs.readFile(__filename, () => {\n  setTimeout(() => console.log('timeout'), 0);\n  setImmediate(() => console.log('immediate'));\n});\n// 输出: immediate → timeout"
          }
        ]
      },
      "source": "Node.js事件循环"
    },

    // ========== 8. 判断题：requestAnimationFrame ==========
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["浏览器API"],
      "question": "requestAnimationFrame的回调是在微任务队列中执行的",
      "correctAnswer": "B",
      "explanation": {
        "title": "requestAnimationFrame执行时机：",
        "sections": [
          {
            "title": "错误！",
            "content": "requestAnimationFrame不是微任务，它在浏览器重绘之前执行，是一个特殊的宏任务。",
            "points": [
              "在每次重绘前执行",
              "频率通常是60Hz（每16.7ms一次）",
              "自动节流，避免过度渲染",
              "页面不可见时会暂停"
            ]
          },
          {
            "title": "执行时机",
            "code": "console.log('1');\n\nsetTimeout(() => console.log('2'), 0);\n\nrequestAnimationFrame(() => console.log('3'));\n\nPromise.resolve().then(() => console.log('4'));\n\nconsole.log('5');\n\n// 输出: 1 → 5 → 4 → 3 → 2\n// 或: 1 → 5 → 4 → 2 → 3\n// （rAF和setTimeout顺序不确定）"
          },
          {
            "title": "使用场景",
            "code": "// ✅ 动画\nfunction animate() {\n  element.style.left = position + 'px';\n  position += 1;\n  if (position < 100) {\n    requestAnimationFrame(animate);\n  }\n}\nrequestAnimationFrame(animate);"
          }
        ]
      },
      "source": "requestAnimationFrame"
    },

    // ========== 9. 代码输出题：死循环微任务 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["微任务陷阱"],
      "question": "以下代码会输出什么？",
      "code": "let count = 0;\n\nfunction recursiveMicrotask() {\n  if (count < 3) {\n    count++;\n    console.log('micro', count);\n    Promise.resolve().then(recursiveMicrotask);\n  }\n}\n\nsetTimeout(() => console.log('macro'), 0);\n\nrecursiveMicrotask();\n\nconsole.log('sync');",
      "options": [
        "sync, micro 1, micro 2, micro 3, macro",
        "sync, micro 1, macro, micro 2, macro, micro 3, macro",
        "micro 1, micro 2, micro 3, sync, macro",
        "程序会卡死"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "递归微任务执行：",
        "sections": [
          {
            "title": "执行流程",
            "code": "// 1. 同步执行\nrecursiveMicrotask();  // count=1, 打印'micro 1'\n// 创建微任务\nconsole.log('sync');   // 打印'sync'\n\n// 2. 执行微任务队列\n// 微任务1: count=2, 打印'micro 2'，创建新微任务\n// 微任务2: count=3, 打印'micro 3'，创建新微任务\n// 微任务3: count=3，不执行（if条件不满足）\n\n// 3. 执行宏任务\n// 打印'macro'"
          },
          {
            "title": "无限递归的危险",
            "content": "如果没有终止条件，递归微任务会阻塞事件循环，导致页面卡死",
            "code": "// ❌ 危险：无限递归微任务\nfunction badRecursion() {\n  Promise.resolve().then(badRecursion);\n}\nbadRecursion();\n// 页面会卡死，setTimeout永远不执行\n\n// ✅ 安全：使用setTimeout\nfunction goodRecursion() {\n  setTimeout(goodRecursion, 0);\n}\ngoodRecursion();\n// 每次都会让出控制权，页面不会卡死"
          }
        ]
      },
      "source": "微任务陷阱"
    },

    // ========== 10. 多选题：事件循环优化 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["性能优化"],
      "question": "以下哪些做法有助于优化事件循环性能？",
      "options": [
        "避免在微任务中执行耗时操作",
        "使用requestIdleCallback处理低优先级任务",
        "将大任务拆分成小任务",
        "使用Web Worker处理密集计算",
        "用Promise.all替代顺序await",
        "在循环中使用await"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "事件循环性能优化：",
        "sections": [
          {
            "title": "✅ 推荐做法",
            "points": [
              "避免长时间阻塞主线程",
              "微任务保持轻量，耗时操作用宏任务",
              "requestIdleCallback处理非紧急任务",
              "大任务拆分（时间切片）",
              "Web Worker处理密集计算",
              "并行异步任务用Promise.all"
            ],
            "code": "// ✅ 并行执行\nconst [user, orders, products] = await Promise.all([\n  fetchUser(),\n  fetchOrders(),\n  fetchProducts()\n]);\n\n// ❌ 顺序执行（慢3倍）\nconst user = await fetchUser();\nconst orders = await fetchOrders();\nconst products = await fetchProducts();"
          },
          {
            "title": "时间切片示例",
            "code": "// 大任务拆分\nfunction processLargeArray(array) {\n  const chunkSize = 100;\n  let index = 0;\n  \n  function processChunk() {\n    const end = Math.min(index + chunkSize, array.length);\n    for (let i = index; i < end; i++) {\n      // 处理array[i]\n    }\n    index = end;\n    \n    if (index < array.length) {\n      setTimeout(processChunk, 0);  // 让出控制权\n    }\n  }\n  \n  processChunk();\n}"
          }
        ]
      },
      "source": "性能优化"
    }
  ],
  "navigation": {
    "prev": {
      "title": "Promise基础",
      "url": "09-promises.html"
    },
    "next": {
      "title": "async/await",
      "url": "09-async-await.html"
    }
  }
};
