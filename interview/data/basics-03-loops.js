window.quizData_Basics03Loops = {
  "config": {
    "title": "循环语句",
    "icon": "🔁",
    "description": "for、while、do-while循环",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["for循环"],
      "question": "for循环的基本语法包括哪几部分？",
      "options": [
        "初始化、条件判断、递增表达式",
        "只有条件判断",
        "初始化和条件判断",
        "条件判断和递增"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "for循环语法",
        "sections": [
          {
            "title": "基本结构",
            "code": "for (初始化; 条件判断; 递增) {\n  // 循环体\n}\n\n// 示例\nfor (let i = 0; i < 5; i++) {\n  console.log(i);  // 0 1 2 3 4\n}"
          }
        ]
      },
      "source": "for循环"
    },

    {
      "difficulty": "easy",
      "type": "true-false",
      "tags": ["while"],
      "question": "do-while循环至少执行一次循环体。",
      "options": ["正确", "错误"],
      "correctAnswer": "A",
      "explanation": {
        "title": "do-while特点",
        "content": "正确！do-while先执行后判断，至少执行一次。",
        "sections": [
          {
            "title": "对比",
            "code": "// while：先判断后执行\nlet i = 10;\nwhile (i < 5) {\n  console.log(i);  // 不执行\n}\n\n// do-while：先执行后判断\nlet j = 10;\ndo {\n  console.log(j);  // 执行一次，输出10\n} while (j < 5);"
          }
        ]
      },
      "source": "do-while"
    },

    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["循环控制"],
      "question": "以下哪些可以控制循环流程？",
      "options": [
        "break（跳出循环）",
        "continue（跳过本次迭代）",
        "return（返回函数）",
        "throw（抛出异常）"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "循环控制语句",
        "content": "所有选项都可以控制循环！",
        "sections": [
          {
            "title": "示例",
            "code": "for (let i = 0; i < 10; i++) {\n  if (i === 5) break;  // 跳出循环\n  if (i % 2 === 0) continue;  // 跳过偶数\n  console.log(i);  // 1 3\n}"
          }
        ]
      },
      "source": "循环控制"
    },

    {
      "difficulty": "medium",
      "type": "code-output",
      "tags": ["for循环"],
      "question": "以下代码的输出是什么？",
      "code": "for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
      "options": [
        "0 1 2",
        "3 3 3",
        "0 0 0",
        "undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "let的块级作用域",
        "sections": [
          {
            "title": "分析",
            "code": "// let在每次迭代都创建新的变量\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 输出：0 1 2\n\n// 如果用var\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 输出：3 3 3（共享同一个i）"
          }
        ]
      },
      "source": "循环作用域"
    },

    {
      "difficulty": "medium",
      "type": "code-completion",
      "tags": ["for-of"],
      "question": "如何遍历数组的值？",
      "code": "const arr = [1, 2, 3];\nfor (______ value of arr) {\n  console.log(value);\n}",
      "options": [
        "const",
        "var",
        "let",
        "不需要关键字"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "for-of循环",
        "sections": [
          {
            "title": "语法",
            "code": "// for-of遍历值\nfor (const value of arr) {\n  console.log(value);  // 1 2 3\n}\n\n// for-in遍历键\nfor (const key in arr) {\n  console.log(key);  // '0' '1' '2'\n}"
          }
        ]
      },
      "source": "for-of"
    },

    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["循环方法"],
      "question": "数组有哪些循环方法？",
      "options": [
        "forEach",
        "map",
        "filter",
        "reduce"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "数组循环方法",
        "content": "所有选项都是！",
        "sections": [
          {
            "title": "示例",
            "code": "const arr = [1, 2, 3];\n\n// forEach：遍历\narr.forEach(x => console.log(x));\n\n// map：映射\nconst doubled = arr.map(x => x * 2);\n\n// filter：过滤\nconst evens = arr.filter(x => x % 2 === 0);\n\n// reduce：归约\nconst sum = arr.reduce((acc, x) => acc + x, 0);"
          }
        ]
      },
      "source": "数组方法"
    },

    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["循环陷阱"],
      "question": "以下代码的输出是什么？",
      "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
      "options": [
        "3 3 3",
        "0 1 2",
        "undefined undefined undefined",
        "0 0 0"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "var的函数作用域陷阱",
        "sections": [
          {
            "title": "分析",
            "code": "// var是函数作用域，所有回调共享同一个i\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// 循环结束后i=3，所有回调输出3\n// 输出：3 3 3"
          }
        ]
      },
      "source": "var陷阱"
    },

    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["循环优化"],
      "question": "循环优化技巧包括哪些？",
      "options": [
        "缓存数组长度",
        "减少循环内的DOM操作",
        "使用break提前退出",
        "避免在循环中创建函数"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "循环优化",
        "content": "所有选项都是优化技巧！",
        "sections": [
          {
            "title": "示例",
            "code": "// ✓ 缓存长度\nconst len = arr.length;\nfor (let i = 0; i < len; i++) { }\n\n// ✓ 提前退出\nfor (let i = 0; i < arr.length; i++) {\n  if (found) break;\n}"
          }
        ]
      },
      "source": "优化"
    },

    {
      "difficulty": "hard",
      "type": "code-completion",
      "tags": ["标签语句"],
      "question": "如何跳出嵌套循环？",
      "code": "outer: for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (i === 1 && j === 1) ______ outer;\n  }\n}",
      "options": [
        "break",
        "continue",
        "return",
        "exit"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "标签语句",
        "sections": [
          {
            "title": "用法",
            "code": "outer: for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (i === 1 && j === 1) break outer;\n    console.log(i, j);\n  }\n}\n// 输出：0 0, 0 1, 0 2, 1 0"
          }
        ]
      },
      "source": "标签"
    },

    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["无限循环"],
      "question": "以下哪个是无限循环？",
      "code": "// A\nfor (;;) { }\n\n// B\nwhile (true) { }\n\n// C\ndo { } while (true);",
      "options": [
        "都是无限循环",
        "只有A",
        "只有B",
        "A和B"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "无限循环",
        "sections": [
          {
            "title": "三种写法",
            "code": "// 方式1：for\nfor (;;) {\n  // 无限循环\n}\n\n// 方式2：while\nwhile (true) {\n  // 无限循环\n}\n\n// 方式3：do-while\ndo {\n  // 无限循环\n} while (true);"
          }
        ]
      },
      "source": "无限循环"
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
