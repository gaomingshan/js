/**
 * Promise 基础与应用
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced09Promises = {
  "config": {
    "title": "Promise 基础与应用",
    "icon": "🤝",
    "description": "深入理解Promise的原理、使用方法和最佳实践",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    // ========== 1. 单选题：Promise基础概念 ==========
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["Promise状态"],
      "question": "Promise有哪三种状态？",
      "options": [
        "pending（进行中）、fulfilled（已成功）、rejected（已失败）",
        "waiting、success、error",
        "start、running、done",
        "idle、active、completed"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise三种状态：",
        "sections": [
          {
            "title": "1. pending（待定）",
            "content": "初始状态，既不是成功也不是失败",
            "code": "const p = new Promise((resolve, reject) => {\n  // 此时状态为pending\n});"
          },
          {
            "title": "2. fulfilled（已兑现）",
            "content": "操作成功完成",
            "code": "const p = Promise.resolve(42);\n// 状态变为fulfilled，值为42"
          },
          {
            "title": "3. rejected（已拒绝）",
            "content": "操作失败",
            "code": "const p = Promise.reject(new Error('失败'));\n// 状态变为rejected"
          },
          {
            "title": "关键特性",
            "points": [
              "状态一旦改变就不会再变（immutable）",
              "只能从pending变为fulfilled或rejected",
              "状态改变后会触发相应的回调"
            ]
          }
        ]
      },
      "source": "Promise状态"
    },

    // ========== 2. 代码输出题：Promise执行顺序 ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["执行顺序", "微任务"],
      "question": "以下代码的输出顺序是什么？",
      "code": "console.log('1');\n\nconst p = new Promise((resolve) => {\n  console.log('2');\n  resolve();\n  console.log('3');\n});\n\np.then(() => {\n  console.log('4');\n});\n\nconsole.log('5');",
      "options": [
        "1, 2, 3, 5, 4",
        "1, 2, 3, 4, 5",
        "1, 5, 2, 3, 4",
        "1, 2, 4, 3, 5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise执行顺序分析：",
        "sections": [
          {
            "title": "执行流程",
            "code": "// 同步代码\nconsole.log('1');  // 输出1\n\n// Promise构造函数内是同步执行的\nconst p = new Promise((resolve) => {\n  console.log('2');  // 输出2（同步）\n  resolve();         // 改变状态\n  console.log('3');  // 输出3（同步）\n});\n\n// then回调是微任务\np.then(() => {\n  console.log('4');  // 微任务队列\n});\n\n// 同步代码\nconsole.log('5');  // 输出5\n\n// 执行微任务\n// 输出4"
          },
          {
            "title": "关键点",
            "points": [
              "Promise构造函数内的代码是同步执行的",
              "resolve()后面的代码仍会继续执行",
              "then()回调进入微任务队列",
              "所有同步代码执行完后才执行微任务"
            ]
          }
        ]
      },
      "source": "Promise执行时机"
    },

    // ========== 3. 多选题：Promise方法 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["Promise API"],
      "question": "以下哪些是Promise的静态方法？",
      "options": [
        "Promise.all()",
        "Promise.prototype.then()",
        "Promise.race()",
        "Promise.prototype.catch()",
        "Promise.allSettled()",
        "Promise.any()"
      ],
      "correctAnswer": ["A", "C", "E", "F"],
      "explanation": {
        "title": "Promise方法分类：",
        "sections": [
          {
            "title": "静态方法（直接在Promise上调用）",
            "points": [
              "Promise.resolve() - 返回fulfilled的Promise",
              "Promise.reject() - 返回rejected的Promise",
              "Promise.all() - 所有都成功才成功",
              "Promise.race() - 第一个完成的结果",
              "Promise.allSettled() - 等待所有完成",
              "Promise.any() - 任意一个成功即成功"
            ],
            "code": "Promise.all([p1, p2, p3]).then(results => {\n  console.log(results); // [result1, result2, result3]\n});"
          },
          {
            "title": "实例方法（在Promise实例上调用）",
            "points": [
              "then() - 处理成功状态",
              "catch() - 处理失败状态",
              "finally() - 无论成功失败都执行"
            ],
            "code": "promise\n  .then(value => console.log(value))\n  .catch(error => console.error(error))\n  .finally(() => console.log('完成'));"
          }
        ]
      },
      "source": "Promise API"
    },

    // ========== 4. 代码输出题：Promise.all行为 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["Promise.all"],
      "question": "以下代码的输出是什么？",
      "code": "const p1 = Promise.resolve(1);\nconst p2 = Promise.reject(2);\nconst p3 = Promise.resolve(3);\n\nPromise.all([p1, p2, p3])\n  .then(results => console.log('success:', results))\n  .catch(error => console.log('error:', error));",
      "options": [
        "error: 2",
        "success: [1, undefined, 3]",
        "success: [1, 2, 3]",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise.all 短路行为：",
        "sections": [
          {
            "title": "Promise.all 特性",
            "points": [
              "只要有一个Promise被reject，立即返回reject",
              "不会等待其他Promise完成",
              "返回第一个reject的理由"
            ],
            "code": "Promise.all([p1, p2, p3])\n  .catch(error => {\n    console.log(error); // 2\n    // p2 rejected，立即短路\n  });"
          },
          {
            "title": "对比 Promise.allSettled",
            "content": "如果需要等待所有Promise完成，使用Promise.allSettled",
            "code": "Promise.allSettled([p1, p2, p3])\n  .then(results => {\n    console.log(results);\n    // [\n    //   {status: 'fulfilled', value: 1},\n    //   {status: 'rejected', reason: 2},\n    //   {status: 'fulfilled', value: 3}\n    // ]\n  });"
          }
        ]
      },
      "source": "Promise.all"
    },

    // ========== 5. 判断题：Promise链式调用 ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["链式调用"],
      "question": "Promise的then()方法总是返回一个新的Promise对象",
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise链式调用原理：",
        "sections": [
          {
            "title": "then() 返回新Promise",
            "content": "无论then()回调返回什么，then()方法本身总是返回一个新的Promise",
            "code": "const p1 = Promise.resolve(1);\nconst p2 = p1.then(value => value + 1);\n\nconsole.log(p1 === p2); // false，不是同一个Promise"
          },
          {
            "title": "返回值处理",
            "points": [
              "返回普通值 → 包装成fulfilled的Promise",
              "返回Promise → 直接使用该Promise",
              "抛出错误 → rejected的Promise",
              "不返回 → fulfilled的Promise，值为undefined"
            ],
            "code": "Promise.resolve(1)\n  .then(v => v + 1)        // 返回2，包装成Promise.resolve(2)\n  .then(v => Promise.resolve(v * 2)) // 返回Promise.resolve(4)\n  .then(v => console.log(v));        // 4"
          }
        ]
      },
      "source": "Promise链式调用"
    },

    // ========== 6. 代码补全题：实现Promise.all ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["手写Promise"],
      "question": "实现Promise.all方法，空白处应该填什么？",
      "code": "Promise.myAll = function(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let count = 0;\n    \n    promises.forEach((promise, index) => {\n      Promise.resolve(promise).then(\n        value => {\n          results[index] = value;\n          count++;\n          if (count === promises.length) {\n            ______;\n          }\n        },\n        reject  // 任意一个失败就reject\n      );\n    });\n  });\n};",
      "options": [
        "resolve(results)",
        "return results",
        "resolve(count)",
        "reject(results)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise.all 实现要点：",
        "sections": [
          {
            "title": "完整实现",
            "code": "Promise.myAll = function(promises) {\n  return new Promise((resolve, reject) => {\n    if (!Array.isArray(promises)) {\n      return reject(new TypeError('参数必须是数组'));\n    }\n    \n    const results = [];\n    let count = 0;\n    \n    // 空数组直接resolve\n    if (promises.length === 0) {\n      return resolve(results);\n    }\n    \n    promises.forEach((promise, index) => {\n      Promise.resolve(promise).then(\n        value => {\n          results[index] = value;  // 保持顺序\n          count++;\n          if (count === promises.length) {\n            resolve(results);  // ✅ 所有成功才resolve\n          }\n        },\n        reject  // 任意一个失败就reject\n      );\n    });\n  });\n};"
          },
          {
            "title": "关键点",
            "points": [
              "使用count计数而不是results.length",
              "results[index]保持结果顺序",
              "Promise.resolve()处理非Promise值",
              "任意一个reject都会导致整体reject"
            ]
          }
        ]
      },
      "source": "手写Promise.all"
    },

    // ========== 7. 代码输出题：Promise错误处理 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["错误处理"],
      "question": "以下代码的输出是什么？",
      "code": "Promise.resolve(1)\n  .then(value => {\n    console.log(value);\n    throw new Error('出错了');\n  })\n  .then(\n    value => console.log('success:', value),\n    error => console.log('error1:', error.message)\n  )\n  .catch(error => console.log('error2:', error.message));",
      "options": [
        "1, error1: 出错了",
        "1, error2: 出错了",
        "1, error1: 出错了, error2: 出错了",
        "1, success: undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise错误处理机制：",
        "sections": [
          {
            "title": "执行流程",
            "code": "Promise.resolve(1)\n  .then(value => {\n    console.log(value);  // 输出: 1\n    throw new Error('出错了');  // 抛出错误\n  })\n  .then(\n    value => console.log('success:', value),  // 不执行\n    error => console.log('error1:', error.message)  // 捕获到错误\n  )\n  .catch(error => console.log('error2:', error.message));  // 不执行"
          },
          {
            "title": "关键点",
            "points": [
              "then()的第二个参数可以捕获前一个then()的错误",
              "错误被捕获后，Promise链继续（状态变为fulfilled）",
              "后续的catch()不会再捕获已处理的错误",
              "catch()相当于then(null, onRejected)"
            ]
          },
          {
            "title": "错误传递",
            "code": "// 如果没有error参数，错误会继续传递\nPromise.reject('error')\n  .then(value => console.log(value))  // 没有error处理\n  .catch(error => console.log(error));  // 这里捕获"
          }
        ]
      },
      "source": "Promise错误处理"
    },

    // ========== 8. 多选题：Promise最佳实践 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["最佳实践"],
      "question": "以下哪些是Promise使用的最佳实践？",
      "options": [
        "总是返回Promise以保持链式调用",
        "在Promise链的末尾添加catch()处理错误",
        "避免在then()中嵌套Promise（Promise地狱）",
        "使用Promise.all()代替多个await",
        "在forEach中使用async/await",
        "使用finally()进行清理工作"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "Promise最佳实践：",
        "sections": [
          {
            "title": "✅ 推荐做法",
            "points": [
              "总是返回Promise保持链式调用",
              "末尾添加catch()捕获错误",
              "避免Promise嵌套，使用链式调用",
              "并行任务用Promise.all()而不是多个await",
              "用finally()做清理（如隐藏loading）"
            ],
            "code": "// ✅ 好的做法\nfetchUser()\n  .then(user => fetchOrders(user.id))  // 返回Promise\n  .then(orders => processOrders(orders))\n  .catch(error => handleError(error))\n  .finally(() => hideLoading());"
          },
          {
            "title": "❌ 避免的做法",
            "code": "// ❌ Promise地狱\nfetchUser().then(user => {\n  fetchOrders(user.id).then(orders => {\n    processOrders(orders).then(result => {\n      // 嵌套太深\n    });\n  });\n});\n\n// ❌ forEach + async/await（不会等待）\nitems.forEach(async (item) => {\n  await processItem(item);  // 不会真正等待\n});\n\n// ✅ 使用for...of或Promise.all\nfor (const item of items) {\n  await processItem(item);\n}\n// 或\nawait Promise.all(items.map(item => processItem(item)));"
          }
        ]
      },
      "source": "Promise最佳实践"
    },

    // ========== 9. 代码补全题：Promise重试机制 ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["Promise应用", "重试机制"],
      "question": "实现一个Promise重试函数，失败后自动重试，空白处应该填什么？",
      "code": "function retry(fn, maxAttempts) {\n  return new Promise((resolve, reject) => {\n    function attempt(remainingAttempts) {\n      fn()\n        .then(resolve)\n        .catch(error => {\n          if (remainingAttempts <= 1) {\n            ______;\n          } else {\n            attempt(remainingAttempts - 1);\n          }\n        });\n    }\n    attempt(maxAttempts);\n  });\n}",
      "options": [
        "reject(error)",
        "throw error",
        "return error",
        "resolve(error)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Promise重试机制实现：",
        "sections": [
          {
            "title": "完整实现",
            "code": "function retry(fn, maxAttempts, delay = 0) {\n  return new Promise((resolve, reject) => {\n    function attempt(remainingAttempts) {\n      fn()\n        .then(resolve)  // 成功直接resolve\n        .catch(error => {\n          if (remainingAttempts <= 1) {\n            reject(error);  // ✅ 重试次数用完，reject\n          } else {\n            console.log(`失败，剩余${remainingAttempts - 1}次重试`);\n            // 可选：延迟后重试\n            setTimeout(\n              () => attempt(remainingAttempts - 1),\n              delay\n            );\n          }\n        });\n    }\n    attempt(maxAttempts);\n  });\n}\n\n// 使用示例\nretry(\n  () => fetch('https://api.example.com/data'),\n  3,  // 最多重试3次\n  1000  // 每次间隔1秒\n)\n  .then(data => console.log('成功:', data))\n  .catch(error => console.error('最终失败:', error));"
          },
          {
            "title": "进阶：指数退避",
            "code": "function retryWithBackoff(fn, maxAttempts) {\n  return new Promise((resolve, reject) => {\n    function attempt(remainingAttempts) {\n      fn()\n        .then(resolve)\n        .catch(error => {\n          if (remainingAttempts <= 1) {\n            reject(error);\n          } else {\n            const delay = Math.pow(2, maxAttempts - remainingAttempts) * 1000;\n            setTimeout(\n              () => attempt(remainingAttempts - 1),\n              delay  // 1s, 2s, 4s, 8s...\n            );\n          }\n        });\n    }\n    attempt(maxAttempts);\n  });\n}"
          }
        ]
      },
      "source": "Promise重试"
    },

    // ========== 10. 代码输出题：Promise微任务队列 ==========
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["事件循环", "微任务"],
      "question": "以下代码的输出顺序是什么？",
      "code": "setTimeout(() => console.log('1'), 0);\n\nPromise.resolve()\n  .then(() => console.log('2'))\n  .then(() => console.log('3'));\n\nPromise.resolve()\n  .then(() => console.log('4'))\n  .then(() => console.log('5'));\n\nconsole.log('6');",
      "options": [
        "6, 2, 4, 3, 5, 1",
        "6, 2, 3, 4, 5, 1",
        "1, 2, 3, 4, 5, 6",
        "6, 1, 2, 4, 3, 5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "微任务队列执行机制：",
        "sections": [
          {
            "title": "执行流程分析",
            "code": "// 1. 同步代码\nconsole.log('6');  // 输出: 6\n\n// 2. 微任务队列第一轮\n// Promise 1 的第一个then → 输出: 2\n// Promise 2 的第一个then → 输出: 4\n\n// 3. 微任务队列第二轮\n// Promise 1 的第二个then → 输出: 3\n// Promise 2 的第二个then → 输出: 5\n\n// 4. 宏任务队列\n// setTimeout → 输出: 1"
          },
          {
            "title": "关键点",
            "points": [
              "同步代码最先执行",
              "微任务（Promise）在当前宏任务后立即执行",
              "多个Promise的第一个then都在同一轮微任务中",
              "链式then的后续回调需要等待前一个完成",
              "宏任务（setTimeout）在所有微任务后执行"
            ]
          },
          {
            "title": "事件循环",
            "code": "// 执行顺序\n// 1. 执行同步代码\n// 2. 执行微任务队列（全部清空）\n//    - Promise 1 then 1\n//    - Promise 2 then 1\n//    - Promise 1 then 2\n//    - Promise 2 then 2\n// 3. 执行一个宏任务\n// 4. 重复2-3"
          }
        ]
      },
      "source": "事件循环与微任务"
    }
  ],
  "navigation": {
    "prev": {
      "title": "对象创建模式",
      "url": "../deep/06-object-creation.html"
    },
    "next": {
      "title": "事件循环",
      "url": "09-event-loop.html"
    }
  }
};
