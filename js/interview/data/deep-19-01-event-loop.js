/**
 * 事件循环机制
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1901EventLoop = {
  "config": {
    "title": "事件循环机制",
    "icon": "🔄",
    "description": "深入理解JavaScript事件循环和任务队列",
    "primaryColor": "#10b981",
    "bgGradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["事件循环"],
      "question": "JavaScript事件循环的执行顺序是？",
      "options": [
        "同步代码 → 微任务 → 宏任务",
        "宏任务 → 微任务 → 同步代码",
        "同步代码 → 宏任务 → 微任务",
        "微任务 → 宏任务 → 同步代码"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "事件循环执行顺序",
        "code": "console.log('1'); // 同步\n\nsetTimeout(() => console.log('2'), 0); // 宏任务\n\nPromise.resolve().then(() => console.log('3')); // 微任务\n\nconsole.log('4'); // 同步\n\n// 输出: 1, 4, 3, 2\n\n// 执行流程：\n// 1. 执行同步代码 → 1, 4\n// 2. 清空微任务队列 → 3\n// 3. 取一个宏任务执行 → 2\n// 4. 再清空微任务队列\n// 5. 继续下一个宏任务..."
      },
      "source": "事件循环"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["宏任务微任务"],
      "question": "以下代码的输出顺序是什么？",
      "code": "setTimeout(() => {\n  console.log('1');\n  Promise.resolve().then(() => console.log('2'));\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');\n  setTimeout(() => console.log('4'), 0);\n});\n\nconsole.log('5');",
      "options": [
        "5, 3, 1, 2, 4",
        "5, 1, 2, 3, 4",
        "5, 3, 4, 1, 2",
        "1, 2, 3, 4, 5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "宏任务微任务执行",
        "code": "setTimeout(() => {\n  console.log('1');  // 宏2\n  Promise.resolve().then(() => console.log('2')); // 微2\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');  // 微1\n  setTimeout(() => console.log('4'), 0); // 宏3\n});\n\nconsole.log('5'); // 同步\n\n// 执行流程：\n// 第1轮：\n// - 同步: 5\n// - 微任务: 3（产生宏3）\n// - 宏任务队列: [宏2, 宏3]\n\n// 第2轮：\n// - 执行宏2: 1（产生微2）\n// - 微任务: 2\n\n// 第3轮：\n// - 执行宏3: 4\n\n// 输出: 5, 3, 1, 2, 4"
      },
      "source": "任务队列"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["任务类型"],
      "question": "哪些属于微任务？",
      "options": [
        "Promise.then",
        "setTimeout",
        "MutationObserver",
        "requestAnimationFrame",
        "process.nextTick（Node.js）",
        "setImmediate"
      ],
      "correctAnswer": ["A", "C", "E"],
      "explanation": {
        "title": "任务分类",
        "code": "// 微任务（Microtask）：\n// 1. Promise.then/catch/finally\nPromise.resolve().then(() => {});\n\n// 2. MutationObserver\nconst observer = new MutationObserver(() => {});\n\n// 3. queueMicrotask\nqueueMicrotask(() => {});\n\n// 4. process.nextTick (Node.js，优先级最高)\nprocess.nextTick(() => {});\n\n// 宏任务（Macrotask）：\n// 1. setTimeout/setInterval\nsetTimeout(() => {}, 0);\n\n// 2. setImmediate (Node.js)\nsetImmediate(() => {});\n\n// 3. I/O操作\n// 4. UI渲染\n// 5. requestAnimationFrame (浏览器)\nrequestAnimationFrame(() => {});\n\n// 6. script整体代码"
      },
      "source": "任务分类"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["微任务优先级"],
      "question": "一个宏任务执行完后会立即清空所有微任务",
      "correctAnswer": "A",
      "explanation": {
        "title": "微任务清空机制",
        "code": "setTimeout(() => {\n  console.log('宏1');\n  Promise.resolve().then(() => console.log('微1'));\n  Promise.resolve().then(() => console.log('微2'));\n}, 0);\n\nsetTimeout(() => {\n  console.log('宏2');\n}, 0);\n\n// 输出: 宏1, 微1, 微2, 宏2\n\n// 执行流程：\n// 1. 执行宏1 → 产生微1、微2\n// 2. 清空微任务队列 → 微1、微2\n// 3. 执行下一个宏任务 → 宏2\n\n// 关键：\n// - 每个宏任务后都会清空微任务\n// - 微任务中产生的微任务也在本轮执行\nPromise.resolve().then(() => {\n  console.log('微1');\n  Promise.resolve().then(() => console.log('微2'));\n});\n// 都在本轮执行"
      },
      "source": "微任务"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["queueMicrotask"],
      "question": "使用queueMicrotask添加微任务，空白处填什么？",
      "code": "console.log('1');\n\n______.then(() => console.log('2'));\n\nqueueMicrotask(() => console.log('3'));\n\nconsole.log('4');\n\n// 输出: 1, 4, 2, 3",
      "options": [
        "Promise.resolve()",
        "Promise.reject()",
        "new Promise()",
        "Promise"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "queueMicrotask vs Promise",
        "code": "console.log('1');\n\n// Promise.then是微任务\nPromise.resolve().then(() => console.log('2'));\n\n// queueMicrotask也是微任务\nqueueMicrotask(() => console.log('3'));\n\nconsole.log('4');\n\n// 输出: 1, 4, 2, 3\n\n// 执行顺序：\n// 1. 同步代码: 1, 4\n// 2. 微任务（按加入顺序）: 2, 3\n\n// queueMicrotask优势：\n// 1. 更直接，不需要Promise包装\n// 2. 语义更清晰\n// 3. 性能略好\n\n// 应用场景：\nfunction batchUpdate() {\n  queueMicrotask(() => {\n    // 批量更新DOM\n  });\n}"
      },
      "source": "queueMicrotask"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["async/await"],
      "question": "async/await与事件循环的交互？",
      "code": "console.log('1');\n\nasync function async1() {\n  console.log('2');\n  await async2();\n  console.log('3');\n}\n\nasync function async2() {\n  console.log('4');\n}\n\nasync1();\n\nconsole.log('5');",
      "options": [
        "1, 2, 4, 5, 3",
        "1, 2, 4, 3, 5",
        "1, 5, 2, 4, 3",
        "1, 2, 3, 4, 5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "async/await执行时机",
        "code": "console.log('1'); // 同步\n\nasync function async1() {\n  console.log('2'); // 同步\n  await async2();   // await后的代码变成微任务\n  console.log('3'); // 微任务\n}\n\nasync function async2() {\n  console.log('4'); // 同步\n}\n\nasync1();\n\nconsole.log('5'); // 同步\n\n// 执行流程：\n// 1. 同步: 1\n// 2. 调用async1: 2\n// 3. 调用async2: 4\n// 4. await后代码进微任务\n// 5. 继续同步: 5\n// 6. 执行微任务: 3\n\n// 输出: 1, 2, 4, 5, 3\n\n// await等价于\nPromise.resolve(async2()).then(() => {\n  console.log('3');\n});"
      },
      "source": "async/await"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["Node.js事件循环"],
      "question": "Node.js事件循环的阶段包括？",
      "options": [
        "timers（定时器）",
        "pending callbacks",
        "poll（轮询）",
        "check（setImmediate）",
        "close callbacks",
        "render（渲染）"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "Node.js事件循环阶段",
        "code": "// Node.js事件循环6个阶段：\n\n// 1. timers阶段\nsetTimeout(() => {\n  console.log('setTimeout');\n}, 0);\n\n// 2. pending callbacks阶段\n// 执行延迟到下一轮的I/O回调\n\n// 3. idle, prepare阶段\n// 仅内部使用\n\n// 4. poll阶段（最重要）\n// 获取新的I/O事件\n// 执行I/O回调\n\n// 5. check阶段\nsetImmediate(() => {\n  console.log('setImmediate');\n});\n\n// 6. close callbacks阶段\nsocket.on('close', () => {});\n\n// process.nextTick优先级最高\nprocess.nextTick(() => {\n  console.log('nextTick');\n});\n\n// 微任务在每个阶段后执行\nPromise.resolve().then(() => {\n  console.log('Promise');\n});"
      },
      "source": "Node事件循环"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["渲染时机"],
      "question": "浏览器在执行微任务前会进行页面渲染",
      "correctAnswer": "B",
      "explanation": {
        "title": "渲染时机",
        "code": "// 浏览器渲染时机：\n// 同步代码 → 微任务 → 渲染 → 宏任务\n\nbutton.onclick = () => {\n  // 1. 同步修改DOM\n  div.style.background = 'red';\n  \n  // 2. 微任务（不会触发渲染）\n  Promise.resolve().then(() => {\n    div.style.background = 'blue';\n  });\n  \n  // 3. 宏任务（会触发渲染）\n  setTimeout(() => {\n    div.style.background = 'green';\n  }, 0);\n};\n\n// 执行流程：\n// 1. red（不渲染）\n// 2. blue（不渲染）\n// 3. 渲染blue\n// 4. green\n// 5. 渲染green\n\n// requestAnimationFrame在渲染前执行\nrequestAnimationFrame(() => {\n  // 渲染前的最后机会\n});"
      },
      "source": "渲染时机"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["事件循环应用"],
      "question": "实现延迟执行函数，空白处填什么？",
      "code": "function defer(fn) {\n  ______.then(fn);\n}\n\ndefer(() => console.log('deferred'));",
      "options": [
        "Promise.resolve()",
        "new Promise(resolve => resolve())",
        "queueMicrotask",
        "setTimeout"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "延迟执行模式",
        "code": "// 方案1：使用Promise（推荐）\nfunction defer(fn) {\n  Promise.resolve().then(fn);\n}\n\n// 方案2：使用queueMicrotask\nfunction defer2(fn) {\n  queueMicrotask(fn);\n}\n\n// 方案3：setTimeout（宏任务，延迟更大）\nfunction defer3(fn) {\n  setTimeout(fn, 0);\n}\n\n// 应用场景：\n// 1. 批量更新\nlet pendingUpdates = [];\n\nfunction scheduleUpdate(update) {\n  pendingUpdates.push(update);\n  \n  Promise.resolve().then(() => {\n    const updates = pendingUpdates;\n    pendingUpdates = [];\n    updates.forEach(u => u());\n  });\n}\n\n// 2. 避免阻塞\nfunction processLargeArray(arr) {\n  function process(i) {\n    if (i >= arr.length) return;\n    \n    // 处理一批\n    for (let j = 0; j < 100 && i < arr.length; j++, i++) {\n      arr[i] *= 2;\n    }\n    \n    // 让出控制权\n    queueMicrotask(() => process(i));\n  }\n  \n  process(0);\n}"
      },
      "source": "延迟执行"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "事件循环相关的最佳实践？",
      "options": [
        "避免长时间占用主线程",
        "合理使用微任务批处理",
        "注意宏任务微任务顺序",
        "所有异步都用微任务",
        "使用Web Worker处理重任务",
        "requestAnimationFrame做动画"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "事件循环最佳实践",
        "code": "// 1. 避免长时间占用\n// ❌ 阻塞主线程\nfor (let i = 0; i < 1e9; i++) {}\n\n// ✅ 分批处理\nasync function processChunks(data) {\n  for (let i = 0; i < data.length; i += 1000) {\n    const chunk = data.slice(i, i + 1000);\n    await process(chunk);\n    await new Promise(r => setTimeout(r, 0));\n  }\n}\n\n// 2. 批处理更新\nlet updates = [];\nlet scheduled = false;\n\nfunction scheduleUpdate(update) {\n  updates.push(update);\n  \n  if (!scheduled) {\n    scheduled = true;\n    queueMicrotask(() => {\n      flush();\n      scheduled = false;\n    });\n  }\n}\n\n// 3. 使用Web Worker\nconst worker = new Worker('worker.js');\nworker.postMessage(heavyData);\n\n// 4. 动画用RAF\nfunction animate() {\n  requestAnimationFrame(() => {\n    // 更新动画\n    animate();\n  });\n}\n\n// 5. 避免微任务死循环\n// ❌ 永远不会渲染\nfunction recursiveMicrotask() {\n  Promise.resolve().then(recursiveMicrotask);\n}\n\n// ✅ 给渲染机会\nfunction recursiveWithBreak() {\n  setTimeout(() => {\n    // 处理\n    recursiveWithBreak();\n  }, 0);\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "Promise进阶应用",
      "url": "18-03-promise-advanced.html"
    },
    "next": {
      "title": "宏任务与微任务",
      "url": "19-02-macro-micro-tasks.html"
    }
  }
};
