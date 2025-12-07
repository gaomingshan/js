/**
 * 宏任务与微任务
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1902MacroMicroTasks = {
  "config": {
    "title": "宏任务与微任务",
    "icon": "⚙️",
    "description": "深入理解宏任务和微任务的执行机制和应用场景",
    "primaryColor": "#ef4444",
    "bgGradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["任务优先级"],
      "question": "微任务和宏任务的执行优先级？",
      "options": [
        "微任务优先级高于宏任务",
        "宏任务优先级高于微任务",
        "优先级相同",
        "取决于创建顺序"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "任务优先级",
        "code": "// 微任务优先于宏任务\nconsole.log('同步');\n\nsetTimeout(() => console.log('宏任务'), 0);\n\nPromise.resolve().then(() => console.log('微任务'));\n\n// 输出: 同步, 微任务, 宏任务\n\n// 执行顺序：\n// 1. 同步代码\n// 2. 清空微任务队列\n// 3. 执行一个宏任务\n// 4. 再清空微任务队列\n// 5. 重复3-4"
      },
      "source": "优先级"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["任务嵌套"],
      "question": "以下代码的输出顺序是什么？",
      "code": "Promise.resolve().then(() => {\n  console.log('1');\n  setTimeout(() => console.log('2'), 0);\n});\n\nsetTimeout(() => {\n  console.log('3');\n  Promise.resolve().then(() => console.log('4'));\n}, 0);\n\nPromise.resolve().then(() => console.log('5'));",
      "options": [
        "1, 5, 3, 4, 2",
        "1, 3, 5, 4, 2",
        "3, 4, 1, 5, 2",
        "1, 5, 2, 3, 4"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "任务嵌套执行",
        "code": "Promise.resolve().then(() => {\n  console.log('1');  // 微1\n  setTimeout(() => console.log('2'), 0); // 产生宏2\n});\n\nsetTimeout(() => {\n  console.log('3');  // 宏1\n  Promise.resolve().then(() => console.log('4')); // 产生微2\n}, 0);\n\nPromise.resolve().then(() => console.log('5')); // 微1\n\n// 第1轮：\n// - 微任务队列: [微1(输出1), 微1(输出5)]\n// - 执行后产生宏2\n// - 输出: 1, 5\n\n// 第2轮（宏1）：\n// - 执行宏1: 3\n// - 产生微2\n// - 清空微任务: 4\n// - 输出: 3, 4\n\n// 第3轮（宏2）：\n// - 执行宏2: 2\n\n// 最终输出: 1, 5, 3, 4, 2"
      },
      "source": "任务嵌套"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["微任务特点"],
      "question": "微任务的特点有哪些？",
      "options": [
        "在当前宏任务后立即执行",
        "可以阻止渲染",
        "执行时产生的微任务也在本轮执行",
        "总是异步执行",
        "不会阻塞主线程",
        "优先级高于所有宏任务"
      ],
      "correctAnswer": ["A", "B", "C", "F"],
      "explanation": {
        "title": "微任务特性",
        "code": "// 1. 当前宏任务后立即执行\nsetTimeout(() => {\n  console.log('宏');\n  Promise.resolve().then(() => console.log('微'));\n}, 0);\n// 输出: 宏, 微\n\n// 2. 阻止渲染\nbutton.onclick = () => {\n  div.style.background = 'red';\n  \n  Promise.resolve().then(() => {\n    // 还没渲染red\n    div.style.background = 'blue';\n  });\n  \n  // 最终渲染blue\n};\n\n// 3. 微任务产生微任务\nPromise.resolve().then(() => {\n  console.log('1');\n  Promise.resolve().then(() => console.log('2'));\n  Promise.resolve().then(() => console.log('3'));\n});\n// 输出: 1, 2, 3（都在本轮）\n\n// 4. 会阻塞主线程\nfunction deadloop() {\n  Promise.resolve().then(deadloop); // 死循环\n}\n// 页面卡死"
      },
      "source": "微任务特点"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["任务队列"],
      "question": "每种宏任务都有独立的任务队列",
      "correctAnswer": "A",
      "explanation": {
        "title": "任务队列机制",
        "code": "// 不同宏任务有不同队列\n// 1. setTimeout队列\nsetTimeout(() => console.log('timeout1'), 0);\nsetTimeout(() => console.log('timeout2'), 0);\n\n// 2. setImmediate队列（Node.js）\nsetImmediate(() => console.log('immediate1'));\nsetImmediate(() => console.log('immediate2'));\n\n// 3. I/O队列\nfs.readFile('file', () => console.log('io'));\n\n// 4. requestAnimationFrame队列（浏览器）\nrequestAnimationFrame(() => console.log('raf'));\n\n// 微任务只有一个队列\nPromise.resolve().then(() => console.log('micro1'));\nqueueMicrotask(() => console.log('micro2'));\n\n// 执行顺序取决于事件循环实现\n// 但微任务总是在宏任务之间执行"
      },
      "source": "任务队列"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["任务调度"],
      "question": "实现任务调度器，空白处填什么？",
      "code": "class TaskScheduler {\n  constructor() {\n    this.macroTasks = [];\n    this.microTasks = [];\n  }\n  \n  addMacro(task) {\n    this.macroTasks.push(task);\n    ______(() => this.flushMacro(), 0);\n  }\n  \n  addMicro(task) {\n    this.microTasks.push(task);\n    ______().then(() => this.flushMicro());\n  }\n}",
      "options": [
        "setTimeout, Promise.resolve",
        "setImmediate, queueMicrotask",
        "requestAnimationFrame, Promise.resolve",
        "setTimeout, setTimeout"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "任务调度实现",
        "code": "class TaskScheduler {\n  constructor() {\n    this.macroTasks = [];\n    this.microTasks = [];\n    this.macroScheduled = false;\n    this.microScheduled = false;\n  }\n  \n  addMacro(task) {\n    this.macroTasks.push(task);\n    if (!this.macroScheduled) {\n      this.macroScheduled = true;\n      setTimeout(() => this.flushMacro(), 0);\n    }\n  }\n  \n  addMicro(task) {\n    this.microTasks.push(task);\n    if (!this.microScheduled) {\n      this.microScheduled = true;\n      Promise.resolve().then(() => this.flushMicro());\n    }\n  }\n  \n  flushMacro() {\n    const tasks = this.macroTasks;\n    this.macroTasks = [];\n    this.macroScheduled = false;\n    tasks.forEach(task => task());\n  }\n  \n  flushMicro() {\n    const tasks = this.microTasks;\n    this.microTasks = [];\n    this.microScheduled = false;\n    tasks.forEach(task => task());\n  }\n}\n\n// 使用\nconst scheduler = new TaskScheduler();\nscheduler.addMicro(() => console.log('micro'));\nscheduler.addMacro(() => console.log('macro'));"
      },
      "source": "任务调度"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["混合任务"],
      "question": "复杂任务执行顺序？",
      "code": "console.log('1');\n\nsetTimeout(() => {\n  console.log('2');\n  Promise.resolve().then(() => {\n    console.log('3');\n    setTimeout(() => console.log('4'), 0);\n  });\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('5');\n}).then(() => {\n  console.log('6');\n});\n\nconsole.log('7');",
      "options": [
        "1, 7, 5, 6, 2, 3, 4",
        "1, 7, 2, 5, 6, 3, 4",
        "1, 5, 6, 7, 2, 3, 4",
        "1, 7, 5, 2, 6, 3, 4"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "复杂任务分析",
        "code": "console.log('1'); // 同步\n\nsetTimeout(() => {\n  console.log('2');  // 宏1\n  Promise.resolve().then(() => {\n    console.log('3');  // 微2\n    setTimeout(() => console.log('4'), 0); // 宏2\n  });\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('5');  // 微1-1\n}).then(() => {\n  console.log('6');  // 微1-2\n});\n\nconsole.log('7'); // 同步\n\n// 第1轮：\n// - 同步: 1, 7\n// - 微任务: 5, 6\n\n// 第2轮（宏1）：\n// - 执行: 2\n// - 微任务: 3\n// - 产生宏2\n\n// 第3轮（宏2）：\n// - 执行: 4\n\n// 输出: 1, 7, 5, 6, 2, 3, 4"
      },
      "source": "复杂任务"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["宏任务应用"],
      "question": "适合使用宏任务的场景？",
      "options": [
        "分片执行大任务",
        "定时器功能",
        "UI渲染更新",
        "批量DOM更新",
        "事件处理",
        "数据同步"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "宏任务应用场景",
        "code": "// 1. 分片执行（让出主线程）\nfunction processLargeData(data) {\n  let index = 0;\n  \n  function chunk() {\n    const end = Math.min(index + 1000, data.length);\n    \n    for (; index < end; index++) {\n      // 处理数据\n      data[index] *= 2;\n    }\n    \n    if (index < data.length) {\n      setTimeout(chunk, 0); // 宏任务：让出控制权\n    }\n  }\n  \n  chunk();\n}\n\n// 2. 定时器\nsetTimeout(() => {\n  console.log('延迟执行');\n}, 1000);\n\nsetInterval(() => {\n  console.log('周期执行');\n}, 1000);\n\n// 3. UI渲染更新\nfunction updateUI() {\n  element.style.color = 'red';\n  \n  setTimeout(() => {\n    // 确保上次渲染完成\n    element.style.color = 'blue';\n  }, 0);\n}\n\n// 4. 事件处理\nbutton.onclick = () => {\n  // 宏任务中执行\n  console.log('clicked');\n};"
      },
      "source": "宏任务应用"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["requestIdleCallback"],
      "question": "requestIdleCallback在浏览器空闲时执行",
      "correctAnswer": "A",
      "explanation": {
        "title": "requestIdleCallback",
        "code": "// requestIdleCallback：在空闲时执行\nrequestIdleCallback((deadline) => {\n  // deadline.timeRemaining(): 剩余时间\n  while (deadline.timeRemaining() > 0 && tasks.length > 0) {\n    const task = tasks.shift();\n    task();\n  }\n  \n  // 还有任务，继续调度\n  if (tasks.length > 0) {\n    requestIdleCallback(processTask);\n  }\n});\n\n// 优先级（从高到低）：\n// 1. 同步代码\n// 2. 微任务\n// 3. requestAnimationFrame（帧前）\n// 4. 宏任务\n// 5. requestIdleCallback（空闲时）\n\n// React Fiber使用类似机制\nfunction workLoop(deadline) {\n  while (nextUnitOfWork && deadline.timeRemaining() > 1) {\n    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);\n  }\n  \n  if (nextUnitOfWork) {\n    requestIdleCallback(workLoop);\n  }\n}"
      },
      "source": "空闲回调"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["批处理"],
      "question": "实现批处理更新，空白处填什么？",
      "code": "class BatchUpdater {\n  constructor() {\n    this.pendingUpdates = [];\n    this.scheduled = false;\n  }\n  \n  update(fn) {\n    this.pendingUpdates.push(fn);\n    \n    if (!this.scheduled) {\n      this.scheduled = true;\n      ______;\n    }\n  }\n  \n  flush() {\n    const updates = this.pendingUpdates;\n    this.pendingUpdates = [];\n    this.scheduled = false;\n    updates.forEach(fn => fn());\n  }\n}",
      "options": [
        "queueMicrotask(() => this.flush())",
        "setTimeout(() => this.flush(), 0)",
        "requestAnimationFrame(() => this.flush())",
        "this.flush()"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "批处理实现",
        "code": "// 微任务批处理（推荐）\nclass BatchUpdater {\n  constructor() {\n    this.pendingUpdates = [];\n    this.scheduled = false;\n  }\n  \n  update(fn) {\n    this.pendingUpdates.push(fn);\n    \n    if (!this.scheduled) {\n      this.scheduled = true;\n      // 使用微任务：在当前任务后立即执行\n      queueMicrotask(() => this.flush());\n    }\n  }\n  \n  flush() {\n    const updates = this.pendingUpdates;\n    this.pendingUpdates = [];\n    this.scheduled = false;\n    \n    // 批量执行\n    updates.forEach(fn => fn());\n  }\n}\n\n// 使用\nconst updater = new BatchUpdater();\n\n// 多次调用\nupdater.update(() => console.log('1'));\nupdater.update(() => console.log('2'));\nupdater.update(() => console.log('3'));\n\n// 批量执行：1, 2, 3\n\n// Vue3的批处理类似实现\nfunction queueJob(job) {\n  if (!queue.includes(job)) {\n    queue.push(job);\n  }\n  queueFlush();\n}\n\nfunction queueFlush() {\n  if (!isFlushing && !isFlushPending) {\n    isFlushPending = true;\n    Promise.resolve().then(flushJobs);\n  }\n}"
      },
      "source": "批处理"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "任务调度的最佳实践？",
      "options": [
        "优先使用微任务批处理",
        "长任务拆分成宏任务",
        "避免微任务死循环",
        "所有异步都用微任务",
        "合理使用requestIdleCallback",
        "动画用requestAnimationFrame"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "任务调度最佳实践",
        "code": "// 1. 微任务批处理\nlet updates = [];\nfunction batchUpdate(fn) {\n  updates.push(fn);\n  if (updates.length === 1) {\n    queueMicrotask(() => {\n      updates.forEach(f => f());\n      updates = [];\n    });\n  }\n}\n\n// 2. 长任务拆分\nfunction* processData(data) {\n  for (let item of data) {\n    yield process(item);\n  }\n}\n\nfunction runWithYield(generator) {\n  const gen = generator;\n  \n  function step() {\n    const result = gen.next();\n    if (!result.done) {\n      setTimeout(step, 0); // 宏任务：让出控制\n    }\n  }\n  \n  step();\n}\n\n// 3. 避免死循环\n// ❌ 微任务死循环\nfunction bad() {\n  Promise.resolve().then(bad);\n}\n\n// ✅ 给渲染机会\nfunction good() {\n  setTimeout(good, 0);\n}\n\n// 4. 空闲时处理\nrequestIdleCallback((deadline) => {\n  while (deadline.timeRemaining() > 0) {\n    doBackgroundWork();\n  }\n});\n\n// 5. 动画优化\nfunction animate() {\n  requestAnimationFrame(() => {\n    updatePosition();\n    animate();\n  });\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "事件循环机制",
      "url": "19-01-event-loop.html"
    },
    "next": {
      "title": "并发模型",
      "url": "19-03-concurrency-model.html"
    }
  }
};
