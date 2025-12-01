window.quizData_Basics03Conditionals = {
  "config": {
    "title": "条件语句",
    "icon": "🔀",
    "description": "掌握if/else、switch等条件控制结构",
    "primaryColor": "#ec4899",
    "bgGradient": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["if语句"],
      "question": "if语句的条件会被如何处理？",
      "options": [
        "转换为布尔值，假值有7个：false、0、-0、NaN、''、null、undefined",
        "必须是布尔值",
        "只有false为假",
        "任何值都为真"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "if条件求值：",
        "sections": [
          {
            "title": "自动转换为布尔值",
            "code": "if (1) { }          // true\nif ('0') { }        // true\nif ([]) { }         // true\nif ({}) { }         // true\n\nif (0) { }          // false\nif ('') { }         // false\nif (null) { }       // false\nif (undefined) { } // false"
          },
          {
            "title": "常见陷阱",
            "code": "// 空数组和空对象是真值\nif ([]) {\n  console.log('执行'); // 会执行\n}\n\n// 字符串'0'和'false'也是真值\nif ('0') {\n  console.log('执行'); // 会执行\n}\nif ('false') {\n  console.log('执行'); // 会执行\n}"
          }
        ]
      },
      "source": "if语句"
    },
    {
      "difficulty": "easy",
      "tags": ["else if"],
      "question": "else if的本质是什么？",
      "options": [
        "else后面跟着一个新的if语句，不是独立的关键字",
        "独立的关键字",
        "与else相同",
        "特殊的语法"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "else if的本质：",
        "sections": [
          {
            "title": "实际结构",
            "code": "// 我们写的\nif (x > 10) {\n  console.log('大于10');\n} else if (x > 5) {\n  console.log('大于5');\n} else {\n  console.log('小于等于5');\n}\n\n// 实际等价于\nif (x > 10) {\n  console.log('大于10');\n} else {\n  if (x > 5) {\n    console.log('大于5');\n  } else {\n    console.log('小于等于5');\n  }\n}"
          }
        ]
      },
      "source": "else if"
    },
    {
      "difficulty": "medium",
      "tags": ["switch语句"],
      "question": "switch语句使用什么方式比较？",
      "options": [
        "严格相等（===），不会进行类型转换",
        "宽松相等（==）",
        "只能比较数字",
        "只能比较字符串"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "switch比较规则：",
        "sections": [
          {
            "title": "严格相等",
            "code": "const x = '1';\n\nswitch (x) {\n  case 1:\n    console.log('数字1'); // 不执行\n    break;\n  case '1':\n    console.log('字符串1'); // 执行\n    break;\n}\n\n// 使用 === 比较，不进行类型转换"
          },
          {
            "title": "fall-through特性",
            "code": "const day = 2;\n\nswitch (day) {\n  case 1:\n  case 2:\n  case 3:\n  case 4:\n  case 5:\n    console.log('工作日');\n    break;\n  case 6:\n  case 7:\n    console.log('周末');\n    break;\n}\n// 输出：工作日"
          },
          {
            "title": "任何类型都可以",
            "code": "switch (obj) {\n  case null:\n    break;\n  case undefined:\n    break;\n  case myObj:\n    break;\n  default:\n    break;\n}"
          }
        ]
      },
      "source": "switch"
    },
    {
      "difficulty": "medium",
      "tags": ["switch陷阱"],
      "question": "switch语句中忘记break会怎样？",
      "options": [
        "会继续执行下一个case（fall-through），直到遇到break或结束",
        "自动停止",
        "报错",
        "跳到default"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Fall-through陷阱：",
        "sections": [
          {
            "title": "忘记break",
            "code": "const x = 1;\n\nswitch (x) {\n  case 1:\n    console.log('one');\n    // 忘记break\n  case 2:\n    console.log('two');\n    break;\n  case 3:\n    console.log('three');\n    break;\n}\n// 输出：one\n// 输出：two"
          },
          {
            "title": "有意利用fall-through",
            "code": "const month = 2;\nlet days;\n\nswitch (month) {\n  case 1: case 3: case 5:\n  case 7: case 8: case 10: case 12:\n    days = 31;\n    break;\n  case 4: case 6: case 9: case 11:\n    days = 30;\n    break;\n  case 2:\n    days = 28;\n    break;\n}"
          },
          {
            "title": "最佳实践",
            "code": "// 总是写break（除非有意fall-through）\nswitch (x) {\n  case 1:\n    doSomething();\n    break; // 明确写出\n  default:\n    doDefault();\n    // 最后一个可以省略break\n}"
          }
        ]
      },
      "source": "switch陷阱"
    },
    {
      "difficulty": "medium",
      "tags": ["条件表达式"],
      "question": "何时使用if/else，何时使用三元运算符或switch？",
      "options": [
        "简单条件用三元，多分支用switch，复杂逻辑用if/else",
        "总是用if/else",
        "总是用switch",
        "随意选择"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "条件语句选择：",
        "sections": [
          {
            "title": "三元运算符",
            "code": "// 适合：简单的二选一赋值\nconst type = age >= 18 ? 'adult' : 'minor';\nconst max = a > b ? a : b;\n\n// 不适合：复杂逻辑\n// 可读性差\nconst result = condition1 ? (\n  condition2 ? value1 : value2\n) : (\n  condition3 ? value3 : value4\n);"
          },
          {
            "title": "switch语句",
            "code": "// 适合：多个离散值的判断\nswitch (status) {\n  case 'pending':\n    return '待处理';\n  case 'processing':\n    return '处理中';\n  case 'completed':\n    return '已完成';\n  case 'failed':\n    return '失败';\n  default:\n    return '未知';\n}"
          },
          {
            "title": "if/else",
            "code": "// 适合：范围判断、复杂条件\nif (score >= 90) {\n  grade = 'A';\n} else if (score >= 80) {\n  grade = 'B';\n} else if (score >= 60) {\n  grade = 'C';\n} else {\n  grade = 'D';\n}\n\n// 复杂逻辑\nif (user && user.age >= 18 && user.verified) {\n  allowAccess();\n}"
          },
          {
            "title": "对象映射（更优雅）",
            "code": "// 替代switch的现代做法\nconst statusMap = {\n  'pending': '待处理',\n  'processing': '处理中',\n  'completed': '已完成',\n  'failed': '失败'\n};\n\nconst text = statusMap[status] || '未知';"
          }
        ]
      },
      "source": "条件选择"
    },
    {
      "difficulty": "medium",
      "tags": ["块级作用域"],
      "question": "if语句的花括号{}可以省略吗？有什么风险？",
      "options": [
        "可以省略，但只影响紧随的一条语句，容易引起错误",
        "不能省略",
        "可以省略且没有风险",
        "必须省略"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "花括号的重要性：",
        "sections": [
          {
            "title": "省略花括号",
            "code": "// 可以省略\nif (condition)\n  doSomething();\n\n// 但容易出错\nif (condition)\n  doSomething();\n  doSomethingElse(); // 总是执行！"
          },
          {
            "title": "经典Bug",
            "code": "// Apple的SSL/TLS Bug\nif (error)\n  goto fail;\n  goto fail; // 总是执行！导致安全漏洞\n\nfail:\n  // 错误处理"
          },
          {
            "title": "最佳实践",
            "code": "// 总是使用花括号\nif (condition) {\n  doSomething();\n}\n\n// 即使只有一行\nif (condition) {\n  return value;\n}\n\n// 避免歧义和未来的bug"
          }
        ]
      },
      "source": "花括号"
    },
    {
      "difficulty": "hard",
      "tags": ["逻辑短路"],
      "question": "如何利用逻辑运算符实现条件执行？",
      "options": [
        "&&用于条件为真时执行，||用于提供默认值",
        "不能实现",
        "只能用if/else",
        "没有区别"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "逻辑短路技巧：",
        "sections": [
          {
            "title": "&&替代if",
            "code": "// 传统if\nif (user) {\n  console.log(user.name);\n}\n\n// 短路写法\nuser && console.log(user.name);\n\n// 可选链更好\nuser?.name && console.log(user.name);"
          },
          {
            "title": "||提供默认值",
            "code": "// 传统写法\nlet value;\nif (userValue) {\n  value = userValue;\n} else {\n  value = defaultValue;\n}\n\n// 短路写法\nconst value = userValue || defaultValue;\n\n// 但注意：0、''也会用默认值\nconst count = userCount || 10; // userCount=0时，count=10\n\n// ES2020空值合并更准确\nconst count = userCount ?? 10; // userCount=0时，count=0"
          },
          {
            "title": "组合使用",
            "code": "// 条件渲染\nconst element = isLoggedIn && <UserPanel />;\n\n// 条件调用\nisAdmin && deleteUser(userId);\n\n// 链式默认值\nconst name = user.nickname || user.name || 'Anonymous';"
          },
          {
            "title": "逻辑赋值（ES2021）",
            "code": "// 等价于 x = x || value\nx ||= value;\n\n// 等价于 x = x && value\nx &&= value;\n\n// 等价于 x = x ?? value\nx ??= value;"
          }
        ]
      },
      "source": "逻辑短路"
    },
    {
      "difficulty": "hard",
      "tags": ["switch优化"],
      "question": "如何优化多个case的switch语句？",
      "options": [
        "使用对象映射、Map或策略模式",
        "无法优化",
        "只能用if/else",
        "增加更多case"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "switch优化策略：",
        "sections": [
          {
            "title": "1. 对象映射",
            "code": "// 传统switch\nfunction getPrice(type) {\n  switch (type) {\n    case 'apple': return 5;\n    case 'banana': return 3;\n    case 'orange': return 4;\n    default: return 0;\n  }\n}\n\n// 对象映射\nconst prices = {\n  apple: 5,\n  banana: 3,\n  orange: 4\n};\n\nfunction getPrice(type) {\n  return prices[type] || 0;\n}"
          },
          {
            "title": "2. Map对象",
            "code": "const actions = new Map([\n  ['add', (a, b) => a + b],\n  ['subtract', (a, b) => a - b],\n  ['multiply', (a, b) => a * b],\n  ['divide', (a, b) => a / b]\n]);\n\nfunction calculate(op, a, b) {\n  const action = actions.get(op);\n  return action ? action(a, b) : NaN;\n}"
          },
          {
            "title": "3. 策略模式",
            "code": "class Calculator {\n  constructor() {\n    this.strategies = {\n      add: (a, b) => a + b,\n      subtract: (a, b) => a - b,\n      multiply: (a, b) => a * b,\n      divide: (a, b) => a / b\n    };\n  }\n  \n  calculate(op, a, b) {\n    const strategy = this.strategies[op];\n    return strategy ? strategy(a, b) : NaN;\n  }\n  \n  addStrategy(name, fn) {\n    this.strategies[name] = fn;\n  }\n}\n\nconst calc = new Calculator();\ncalc.addStrategy('power', (a, b) => a ** b);\ncalc.calculate('power', 2, 3); // 8"
          },
          {
            "title": "4. 函数映射（高级）",
            "code": "const handlers = {\n  'user:create': async (data) => {\n    // 创建用户\n  },\n  'user:update': async (data) => {\n    // 更新用户\n  },\n  'user:delete': async (data) => {\n    // 删除用户\n  }\n};\n\nasync function handleAction(type, data) {\n  const handler = handlers[type];\n  if (!handler) throw new Error(`Unknown action: ${type}`);\n  return await handler(data);\n}"
          }
        ]
      },
      "source": "switch优化"
    },
    {
      "difficulty": "hard",
      "tags": ["条件链"],
      "question": "如何优雅地处理多层嵌套的条件判断？",
      "options": [
        "提前返回（Guard Clauses）、提取函数、使用策略模式",
        "无法优化",
        "继续嵌套",
        "用更多if"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "优化嵌套条件：",
        "sections": [
          {
            "title": "问题代码",
            "code": "function processUser(user) {\n  if (user) {\n    if (user.age >= 18) {\n      if (user.verified) {\n        if (user.active) {\n          // 处理逻辑\n          return '处理成功';\n        } else {\n          return '用户未激活';\n        }\n      } else {\n        return '用户未验证';\n      }\n    } else {\n      return '未成年';\n    }\n  } else {\n    return '用户不存在';\n  }\n}"
          },
          {
            "title": "1. 提前返回（卫语句）",
            "code": "function processUser(user) {\n  if (!user) return '用户不存在';\n  if (user.age < 18) return '未成年';\n  if (!user.verified) return '用户未验证';\n  if (!user.active) return '用户未激活';\n  \n  // 处理逻辑\n  return '处理成功';\n}"
          },
          {
            "title": "2. 提取验证函数",
            "code": "function isValidUser(user) {\n  return user &&\n         user.age >= 18 &&\n         user.verified &&\n         user.active;\n}\n\nfunction processUser(user) {\n  if (!isValidUser(user)) {\n    return getErrorMessage(user);\n  }\n  \n  // 处理逻辑\n  return '处理成功';\n}"
          },
          {
            "title": "3. 组合条件",
            "code": "function processUser(user) {\n  // 组合所有条件\n  const isValid = user?.age >= 18 &&\n                  user?.verified &&\n                  user?.active;\n  \n  if (!isValid) {\n    return getErrorMessage(user);\n  }\n  \n  return '处理成功';\n}"
          }
        ]
      },
      "source": "条件优化"
    },
    {
      "difficulty": "hard",
      "tags": ["模式匹配"],
      "question": "JavaScript有类似其他语言的模式匹配（Pattern Matching）吗？",
      "options": [
        "没有原生支持，但可用解构、switch和第三方库模拟",
        "有完整支持",
        "完全不支持",
        "只在TypeScript中"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "模式匹配模拟：",
        "sections": [
          {
            "title": "解构模拟",
            "code": "// 匹配对象结构\nfunction handleResponse(response) {\n  const { status, data, error } = response;\n  \n  if (status === 'success' && data) {\n    return processData(data);\n  }\n  if (status === 'error' && error) {\n    return handleError(error);\n  }\n  return null;\n}"
          },
          {
            "title": "类型检查模拟",
            "code": "function process(value) {\n  if (typeof value === 'number') {\n    return value * 2;\n  }\n  if (typeof value === 'string') {\n    return value.toUpperCase();\n  }\n  if (Array.isArray(value)) {\n    return value.map(process);\n  }\n  return value;\n}"
          },
          {
            "title": "提案中的模式匹配",
            "code": "// TC39 提案（未来可能支持）\nmatch (value) {\n  when (Number) -> value * 2,\n  when (String) -> value.toUpperCase(),\n  when ([]) -> 'empty array',\n  when ({ x, y }) -> x + y,\n  when _ -> 'default'\n}"
          },
          {
            "title": "第三方库",
            "code": "// 使用 ts-pattern 库\nimport { match } from 'ts-pattern';\n\nconst result = match(value)\n  .with({ type: 'user' }, (v) => handleUser(v))\n  .with({ type: 'admin' }, (v) => handleAdmin(v))\n  .with({ type: 'guest' }, (v) => handleGuest(v))\n  .otherwise(() => handleUnknown());"
          }
        ]
      },
      "source": "模式匹配"
    }
  ],
  "navigation": {
    "prev": {
      "title": "表达式",
      "url": "02-expressions.html"
    },
    "next": {
      "title": "循环语句",
      "url": "03-loops.html"
    }
  }
};
