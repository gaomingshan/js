/**
 * async/await 深入
 * 包含多种题型：代码输出、代码补全、判断、多选
 */
window.quizData_Advanced09AsyncAwait = {
  "config": {
    "title": "async/await 深入",
    "icon": "⏳",
    "description": "掌握async/await的原理、错误处理和最佳实践",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    // ========== 1. 单选题：async函数返回值 ==========
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["async函数"],
      "question": "async函数总是返回什么？",
      "options": [
        "Promise对象",
        "undefined",
        "函数内return的值",
        "取决于函数体"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "async函数返回值：",
        "sections": [
          {
            "title": "总是返回Promise",
            "content": "async函数无论返回什么值，都会被自动包装成Promise对象",
            "code": "async function fn1() {\n  return 42;\n}\n\nconsole.log(fn1()); // Promise {<fulfilled>: 42}\n\nfn1().then(value => console.log(value)); // 42"
          },
          {
            "title": "不同返回值的处理",
            "code": "// 1. 返回普通值\nasync function fn2() {\n  return 'hello';\n}\n// 等价于 Promise.resolve('hello')\n\n// 2. 不返回值\nasync function fn3() {\n  console.log('test');\n}\n// 等价于 Promise.resolve(undefined)\n\n// 3. 返回Promise\nasync function fn4() {\n  return Promise.resolve(1);\n}\n// 不会嵌套，直接返回该Promise\n\n// 4. 抛出错误\nasync function fn5() {\n  throw new Error('error');\n}\n// 等价于 Promise.reject(new Error('error'))"
          }
        ]
      },
      "source": "async函数"
    },

    // ========== 2. 代码输出题：await执行顺序 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["执行顺序"],
      "question": "以下代码的输出顺序是什么？",
      "code": "async function async1() {\n  console.log('1');\n  await async2();\n  console.log('2');\n}\n\nasync function async2() {\n  console.log('3');\n}\n\nconsole.log('4');\n\nsetTimeout(() => console.log('5'), 0);\n\nasync1();\n\nnew Promise(resolve => {\n  console.log('6');\n  resolve();\n}).then(() => console.log('7'));\n\nconsole.log('8');",
      "options": [
        "4, 1, 3, 6, 8, 2, 7, 5",
        "4, 1, 3, 6, 8, 7, 2, 5",
        "4, 6, 8, 1, 3, 2, 7, 5",
        "4, 1, 3, 2, 6, 7, 8, 5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "await的执行机制：",
        "sections": [
          {
            "title": "详细执行流程",
            "code": "// === 同步代码 ===\nconsole.log('4');  // 输出: 4\n\n// setTimeout进入宏任务队列\n\n// 调用async1()\nconsole.log('1');  // 输出: 1\n// await async2() 开始执行\n\n// async2()同步执行\nconsole.log('3');  // 输出: 3\n// await后的代码（console.log('2')）进入微任务队列\n\n// Promise构造函数同步执行\nconsole.log('6');  // 输出: 6\n// resolve()，then回调进入微任务队列\n\nconsole.log('8');  // 输出: 8\n\n// === 微任务队列 ===\n// 先进先出\nconsole.log('2');  // 输出: 2（await后的代码）\nconsole.log('7');  // 输出: 7（Promise.then）\n\n// === 宏任务队列 ===\nconsole.log('5');  // 输出: 5"
          },
          {
            "title": "await的本质",
            "code": "// await后的代码相当于放在then回调中\nasync function fn() {\n  console.log('1');\n  await something();\n  console.log('2');\n}\n\n// 等价于\nfunction fn() {\n  return Promise.resolve()\n    .then(() => {\n      console.log('1');\n      return something();\n    })\n    .then(() => {\n      console.log('2');\n    });\n}"
          }
        ]
      },
      "source": "await执行时机"
    },

    // ========== 3. 多选题：async/await错误处理 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["错误处理"],
      "question": "以下哪些是async/await错误处理的正确方式？",
      "options": [
        "使用try/catch捕获await的错误",
        "在async函数外用catch()捕获",
        "使用Promise.prototype.catch()",
        "让错误向上传播到调用者",
        "在forEach中使用try/catch",
        "使用.catch()处理特定Promise"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "async/await错误处理方式：",
        "sections": [
          {
            "title": "1. try/catch（推荐）",
            "code": "async function fetchData() {\n  try {\n    const data = await fetch(url);\n    const json = await data.json();\n    return json;\n  } catch (error) {\n    console.error('请求失败:', error);\n    // 处理错误或重新抛出\n    throw error;\n  }\n}"
          },
          {
            "title": "2. .catch()链式调用",
            "code": "async function fetchData() {\n  const data = await fetch(url)\n    .catch(error => {\n      console.error('fetch失败:', error);\n      return defaultValue; // 返回默认值\n    });\n  return data;\n}\n\n// 或在调用时处理\nfetchData()\n  .then(data => console.log(data))\n  .catch(error => console.error(error));"
          },
          {
            "title": "3. 错误向上传播",
            "code": "async function getData() {\n  // 不处理错误，让它传播\n  const user = await fetchUser();\n  const orders = await fetchOrders(user.id);\n  return orders;\n}\n\n// 在更高层统一处理\nasync function main() {\n  try {\n    const orders = await getData();\n    processOrders(orders);\n  } catch (error) {\n    handleError(error);\n  }\n}"
          },
          {
            "title": "❌ 错误做法",
            "code": "// ❌ forEach不会等待async函数\nitems.forEach(async (item) => {\n  try {\n    await processItem(item);\n  } catch (error) {\n    // 错误可能无法正确捕获\n  }\n});\n\n// ✅ 使用for...of或Promise.all\nfor (const item of items) {\n  try {\n    await processItem(item);\n  } catch (error) {\n    console.error(error);\n  }\n}"
          }
        ]
      },
      "source": "错误处理"
    },

    // ========== 4. 代码补全题：并行vs串行 ==========
    {
      "type": "code-completion",
      "difficulty": "medium",
      "tags": ["性能优化"],
      "question": "如何将以下串行执行改为并行执行？空白处填什么？",
      "code": "// 串行执行（慢）\nconst user = await fetchUser();\nconst posts = await fetchPosts();\nconst comments = await fetchComments();\n\n// 并行执行（快）\nconst [user, posts, comments] = ______;",
      "options": [
        "await Promise.all([fetchUser(), fetchPosts(), fetchComments()])",
        "Promise.all([await fetchUser(), await fetchPosts(), await fetchComments()])",
        "[await fetchUser(), await fetchPosts(), await fetchComments()]",
        "await [fetchUser(), fetchPosts(), fetchComments()]"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "串行 vs 并行执行：",
        "sections": [
          {
            "title": "串行执行（慢）",
            "content": "每个await会阻塞后续代码，总时间 = 各任务时间之和",
            "code": "// 假设每个请求1秒，总共3秒\nconst user = await fetchUser();      // 1秒\nconst posts = await fetchPosts();    // 1秒\nconst comments = await fetchComments(); // 1秒\n// 总耗时：3秒"
          },
          {
            "title": "并行执行（快）",
            "content": "Promise.all同时启动所有请求，总时间 = 最慢任务的时间",
            "code": "// Promise.all并行执行，总共1秒\nconst [user, posts, comments] = await Promise.all([\n  fetchUser(),\n  fetchPosts(),\n  fetchComments()\n]);\n// 总耗时：1秒（最慢的那个）"
          },
          {
            "title": "其他选项错误",
            "code": "// ❌ 选项B：仍然是串行\n// await会让每个请求依次执行\nPromise.all([await fetchUser(), await fetchPosts(), await fetchComments()])\n\n// ❌ 选项C：返回数组，但不是Promise\n[await fetchUser(), await fetchPosts(), await fetchComments()]\n\n// ❌ 选项D：语法错误\nawait [fetchUser(), fetchPosts(), fetchComments()]"
          },
          {
            "title": "有依赖的混合场景",
            "code": "// user依赖关系，posts和comments可并行\nconst user = await fetchUser();\nconst [posts, comments] = await Promise.all([\n  fetchPosts(user.id),\n  fetchComments(user.id)\n]);"
          }
        ]
      },
      "source": "并行执行"
    },

    // ========== 5. 判断题：await只能在async函数中使用 ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["语法规则"],
      "question": "await关键字只能在async函数内部使用",
      "correctAnswer": "B",
      "explanation": {
        "title": "await的使用场景：",
        "sections": [
          {
            "title": "错误！现代JavaScript支持顶层await",
            "content": "从ES2022开始，模块的顶层可以直接使用await，不需要包装在async函数中",
            "code": "// ✅ ES2022模块顶层await\n// module.js\nconst data = await fetch('https://api.example.com/data');\nexport default data;\n\n// ✅ 传统方式（仍然有效）\n(async () => {\n  const data = await fetch('https://api.example.com/data');\n  console.log(data);\n})();"
          },
          {
            "title": "注意事项",
            "points": [
              "顶层await只在ES模块中有效",
              "不能在CommonJS模块中使用",
              "浏览器中需要<script type=\"module\">",
              "会阻塞模块的执行"
            ],
            "code": "// ✅ ES模块\n// type=\"module\" 的脚本\nimport { fetchData } from './api.js';\nconst data = await fetchData();\n\n// ❌ 普通脚本\n// <script> 标签（非module）\nconst data = await fetchData(); // 语法错误"
          },
          {
            "title": "使用场景",
            "code": "// 1. 模块初始化\nconst config = await fetch('/config.json').then(r => r.json());\nexport { config };\n\n// 2. 动态导入\nconst module = await import('./dynamic-module.js');\n\n// 3. 条件导入\nconst translation = await import(\n  `./i18n/${language}.js`\n);"
          }
        ]
      },
      "source": "顶层await"
    },

    // ========== 6. 代码输出题：async函数中的return ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["返回值处理"],
      "question": "以下代码的输出是什么？",
      "code": "async function fn() {\n  return Promise.resolve(1)\n    .then(() => 2)\n    .then(() => 3);\n}\n\nfn().then(value => console.log(value));",
      "options": [
        "3",
        "Promise {<fulfilled>: 3}",
        "1",
        "undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "async函数中的Promise处理：",
        "sections": [
          {
            "title": "返回Promise时不会嵌套",
            "content": "async函数返回Promise时，不会包装成Promise的Promise，而是直接返回该Promise",
            "code": "async function fn() {\n  return Promise.resolve(1)\n    .then(() => 2)\n    .then(() => 3);\n}\n\n// 等价于\nfunction fn() {\n  return Promise.resolve(1)\n    .then(() => 2)\n    .then(() => 3);\n}\n\n// fn()返回的Promise最终resolve为3\nfn().then(value => console.log(value)); // 3"
          },
          {
            "title": "对比普通值",
            "code": "// 返回普通值\nasync function fn1() {\n  return 42;\n}\n// 等价于 Promise.resolve(42)\n\n// 返回Promise\nasync function fn2() {\n  return Promise.resolve(42);\n}\n// 不会嵌套，仍然是Promise.resolve(42)\n\nconsole.log(await fn1() === await fn2()); // true"
          },
          {
            "title": "使用await可以自动解包",
            "code": "async function fn() {\n  // 不需要await，return会自动处理\n  return Promise.resolve(1).then(() => 2);\n}\n\n// 或者使用await（效果相同）\nasync function fn2() {\n  const result = await Promise.resolve(1).then(() => 2);\n  return result;\n}"
          }
        ]
      },
      "source": "Promise返回值"
    },

    // ========== 7. 代码补全题：实现sleep函数 ==========
    {
      "type": "code-completion",
      "difficulty": "easy",
      "tags": ["工具函数"],
      "question": "实现一个sleep函数，可以暂停执行指定时间，空白处填什么？",
      "code": "function sleep(ms) {\n  return ______;\n}\n\n// 使用\nawait sleep(1000); // 暂停1秒\nconsole.log('1秒后执行');",
      "options": [
        "new Promise(resolve => setTimeout(resolve, ms))",
        "setTimeout(() => {}, ms)",
        "new Promise(resolve => setInterval(resolve, ms))",
        "Promise.resolve().then(() => setTimeout(() => {}, ms))"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "实现sleep函数：",
        "sections": [
          {
            "title": "完整实现",
            "code": "function sleep(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}\n\n// 使用示例\nasync function demo() {\n  console.log('开始');\n  await sleep(1000);\n  console.log('1秒后');\n  await sleep(2000);\n  console.log('再过2秒');\n}\n\ndemo();"
          },
          {
            "title": "为什么其他选项错误",
            "code": "// ❌ 选项B：没有返回Promise\nsetTimeout(() => {}, ms)\n// await不会等待\n\n// ❌ 选项C：setInterval会重复执行\nnew Promise(resolve => setInterval(resolve, ms))\n// resolve后interval不会停止\n\n// ❌ 选项D：没有真正延迟\nPromise.resolve().then(() => setTimeout(() => {}, ms))\n// setTimeout在then回调中，不会延迟Promise"
          },
          {
            "title": "进阶：可取消的sleep",
            "code": "function sleep(ms) {\n  let timeoutId;\n  const promise = new Promise(resolve => {\n    timeoutId = setTimeout(resolve, ms);\n  });\n  \n  promise.cancel = () => {\n    clearTimeout(timeoutId);\n  };\n  \n  return promise;\n}\n\n// 使用\nconst sleepPromise = sleep(5000);\nawait sleepPromise;\n\n// 或提前取消\nsleepPromise.cancel();"
          }
        ]
      },
      "source": "工具函数"
    },

    // ========== 8. 多选题：async/await最佳实践 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["最佳实践"],
      "question": "以下哪些是async/await的最佳实践？",
      "options": [
        "使用Promise.all()并行执行独立任务",
        "在顶层代码直接使用await",
        "总是用try/catch包裹await",
        "在map/filter等方法回调中使用async",
        "避免在循环中使用await（除非必须串行）",
        "使用Promise.allSettled()处理部分失败场景"
      ],
      "correctAnswer": ["A", "E", "F"],
      "explanation": {
        "title": "async/await最佳实践：",
        "sections": [
          {
            "title": "✅ 推荐做法",
            "points": [
              "并行任务用Promise.all()",
              "避免不必要的串行等待",
              "用Promise.allSettled()允许部分失败",
              "合理使用try/catch（不是每处都需要）",
              "错误可以向上传播到统一处理"
            ],
            "code": "// ✅ 好的做法\nasync function fetchData() {\n  // 并行执行\n  const [users, posts] = await Promise.all([\n    fetchUsers(),\n    fetchPosts()\n  ]);\n  \n  // 允许部分失败\n  const results = await Promise.allSettled([\n    fetchA(),\n    fetchB(),\n    fetchC()\n  ]);\n  \n  // 处理结果\n  const successful = results\n    .filter(r => r.status === 'fulfilled')\n    .map(r => r.value);\n}"
          },
          {
            "title": "❌ 避免的做法",
            "code": "// ❌ 顶层await在非模块环境\n// 会报语法错误\nconst data = await fetch('/api');\n\n// ❌ 不必要的串行\nconst a = await fetchA();\nconst b = await fetchB(); // b不依赖a，应并行\n\n// ❌ 循环中的await\nfor (let i = 0; i < 10; i++) {\n  await processItem(i); // 串行，很慢\n}\n// ✅ 改用Promise.all\nawait Promise.all(\n  Array.from({length: 10}, (_, i) => processItem(i))\n);\n\n// ❌ map中的async\nconst results = items.map(async item => {\n  return await process(item);\n}); // results是Promise数组！\n// ✅ 正确做法\nconst results = await Promise.all(\n  items.map(async item => await process(item))\n);"
          }
        ]
      },
      "source": "最佳实践"
    },

    // ========== 9. 代码输出题：async函数中的throw ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["错误处理"],
      "question": "以下代码的输出是什么？",
      "code": "async function fn1() {\n  throw new Error('error1');\n}\n\nasync function fn2() {\n  try {\n    await fn1();\n    console.log('1');\n  } catch (error) {\n    console.log('2');\n    throw error;\n  } finally {\n    console.log('3');\n  }\n}\n\nfn2()\n  .then(() => console.log('4'))\n  .catch(() => console.log('5'));",
      "options": [
        "2, 3, 5",
        "1, 3, 4",
        "2, 3, 4",
        "1, 2, 3, 5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "async/await错误处理流程：",
        "sections": [
          {
            "title": "执行流程",
            "code": "async function fn1() {\n  throw new Error('error1');  // 抛出错误\n}\n\nasync function fn2() {\n  try {\n    await fn1();  // 捕获到错误\n    console.log('1');  // 不执行\n  } catch (error) {\n    console.log('2');  // 输出: 2\n    throw error;       // 重新抛出\n  } finally {\n    console.log('3');  // 输出: 3（总是执行）\n  }\n}\n\nfn2()\n  .then(() => console.log('4'))   // 不执行（rejected）\n  .catch(() => console.log('5')); // 输出: 5"
          },
          {
            "title": "关键点",
            "points": [
              "try/catch可以捕获await的错误",
              "catch中重新throw会让Promise变为rejected",
              "finally总是执行，不影响Promise状态",
              "rejected的Promise不会进入then，会进入catch"
            ]
          },
          {
            "title": "如果不重新抛出",
            "code": "async function fn2() {\n  try {\n    await fn1();\n    console.log('1');\n  } catch (error) {\n    console.log('2');\n    // 不throw，错误被处理\n  } finally {\n    console.log('3');\n  }\n  // 返回Promise.resolve(undefined)\n}\n\nfn2()\n  .then(() => console.log('4'))   // 会执行\n  .catch(() => console.log('5')); // 不执行\n// 输出: 2 → 3 → 4"
          }
        ]
      },
      "source": "错误传播"
    },

    // ========== 10. 代码补全题：实现Promise队列 ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Promise应用"],
      "question": "实现一个Promise队列，依次执行任务，空白处填什么？",
      "code": "async function runQueue(tasks) {\n  const results = [];\n  for (const task of tasks) {\n    ______;\n  }\n  return results;\n}\n\n// 使用\nconst tasks = [\n  () => fetch('/api/1'),\n  () => fetch('/api/2'),\n  () => fetch('/api/3')\n];\nawait runQueue(tasks);",
      "options": [
        "const result = await task(); results.push(result)",
        "results.push(task())",
        "results.push(await Promise.all(tasks))",
        "const result = task(); results.push(result)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise队列实现：",
        "sections": [
          {
            "title": "完整实现",
            "code": "async function runQueue(tasks) {\n  const results = [];\n  for (const task of tasks) {\n    const result = await task();  // ✅ 串行执行\n    results.push(result);\n  }\n  return results;\n}\n\n// 使用示例\nconst tasks = [\n  () => fetch('/api/1').then(r => r.json()),\n  () => fetch('/api/2').then(r => r.json()),\n  () => fetch('/api/3').then(r => r.json())\n];\n\nconst results = await runQueue(tasks);\nconsole.log(results); // [data1, data2, data3]"
          },
          {
            "title": "为什么其他选项错误",
            "code": "// ❌ 选项B：不等待，results是Promise数组\nresults.push(task());\n\n// ❌ 选项C：Promise.all是并行，不是队列\nresults.push(await Promise.all(tasks));\n\n// ❌ 选项D：不await，result是Promise\nconst result = task();\nresults.push(result);"
          },
          {
            "title": "进阶：带并发控制的队列",
            "code": "async function runQueueWithLimit(tasks, limit = 2) {\n  const results = [];\n  const executing = [];\n  \n  for (const task of tasks) {\n    const promise = task().then(result => {\n      executing.splice(executing.indexOf(promise), 1);\n      return result;\n    });\n    \n    results.push(promise);\n    executing.push(promise);\n    \n    if (executing.length >= limit) {\n      await Promise.race(executing);\n    }\n  }\n  \n  return Promise.all(results);\n}\n\n// 最多同时执行2个任务\nawait runQueueWithLimit(tasks, 2);"
          }
        ]
      },
      "source": "Promise队列"
    }
  ],
  "navigation": {
    "prev": {
      "title": "事件循环",
      "url": "09-event-loop.html"
    },
    "next": {
      "title": "DOM基础",
      "url": "../advanced/10-dom-basics.html"
    }
  }
};
