window.quizData_Basics03Conditionals = {
  "config": {
    "title": "条件语句",
    "icon": "🔀",
    "description": "if、switch与条件判断",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    // 第1题：简单
    {
      "difficulty": "easy",
      "tags": ["if语句"],
      "question": "if语句的基本语法是什么？",
      "options": [
        "if (condition) { } else { }",
        "if condition then else",
        "if (condition) then { }",
        "when (condition) { }"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "if语句语法",
        "sections": [
          {
            "title": "基本结构",
            "code": "// 单分支\nif (condition) {\n  // 代码\n}\n\n// 双分支\nif (condition) {\n  // true时执行\n} else {\n  // false时执行\n}\n\n// 多分支\nif (condition1) {\n  // condition1为true\n} else if (condition2) {\n  // condition2为true\n} else {\n  // 都为false\n}"
          }
        ]
      },
      "source": "if语句"
    },

    // 第2题：简单 - 判断题
    {
      "difficulty": "easy",
      "type": "true-false",
      "tags": ["switch"],
      "question": "switch语句的case必须使用break，否则会继续执行下一个case。",
      "options": ["正确", "错误"],
      "correctAnswer": "A",
      "explanation": {
        "title": "switch穿透（fall-through）",
        "content": "正确！这叫做case穿透，不加break会继续执行。",
        "sections": [
          {
            "title": "示例",
            "code": "const day = 1;\nswitch (day) {\n  case 1:\n    console.log('Monday');\n    // 没有break，继续执行\n  case 2:\n    console.log('Tuesday');\n    break;\n  default:\n    console.log('Other');\n}\n// 输出：Monday\n//      Tuesday"
          }
        ]
      },
      "source": "switch"
    },

    // 第3题：中等 - 多选
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["条件判断"],
      "question": "以下哪些值在if中会被视为false？",
      "options": [
        "0",
        "''（空字符串）",
        "null",
        "undefined"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "Falsy值",
        "content": "所有选项都是falsy值！",
        "sections": [
          {
            "title": "8个falsy值",
            "code": "if (false) { }  // false\nif (0) { }      // false\nif ('') { }     // false\nif (null) { }   // false\nif (undefined) { } // false\nif (NaN) { }    // false\nif (0n) { }     // false\nif (document.all) { } // false（历史遗留）"
          }
        ]
      },
      "source": "Falsy值"
    },

    // 第4题：中等 - 代码输出
    {
      "difficulty": "medium",
      "type": "code-output",
      "tags": ["switch"],
      "question": "以下代码的输出是什么？",
      "code": "const x = '1';\nswitch (x) {\n  case 1:\n    console.log('Number 1');\n    break;\n  case '1':\n    console.log('String 1');\n    break;\n  default:\n    console.log('Default');\n}",
      "options": [
        "String 1",
        "Number 1",
        "Default",
        "Number 1 和 String 1"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "switch使用严格相等（===）",
        "sections": [
          {
            "title": "关键点",
            "code": "const x = '1';  // 字符串\nswitch (x) {\n  case 1:    // 数字1，'1' !== 1\n    console.log('Number 1');\n    break;\n  case '1':  // 字符串'1'，'1' === '1' ✓\n    console.log('String 1');\n    break;\n}\n// 输出：String 1"
          }
        ]
      },
      "source": "switch"
    },

    // 第5题：中等 - 代码补全
    {
      "difficulty": "medium",
      "type": "code-completion",
      "tags": ["三元运算符"],
      "question": "请用三元运算符简化if-else",
      "code": "const age = 18;\nconst result = ______;\nconsole.log(result);  // 'adult'",
      "options": [
        "age >= 18 ? 'adult' : 'minor'",
        "if age >= 18 'adult' else 'minor'",
        "age >= 18 && 'adult'",
        "age >= 18 : 'adult'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "三元运算符",
        "sections": [
          {
            "title": "语法",
            "code": "// 条件 ? 值1 : 值2\nconst result = age >= 18 ? 'adult' : 'minor';\n\n// 等价于\nlet result;\nif (age >= 18) {\n  result = 'adult';\n} else {\n  result = 'minor';\n}"
          }
        ]
      },
      "source": "三元运算符"
    },

    // 第6题：中等 - 多选
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["switch vs if"],
      "question": "switch相比if-else有什么特点？",
      "options": [
        "使用严格相等（===）比较",
        "适合多个等值判断",
        "可以使用范围判断",
        "性能可能更好"
      ],
      "correctAnswer": ["A", "B", "D"],
      "explanation": {
        "title": "switch vs if-else",
        "sections": [
          {
            "title": "选项A、B - 正确",
            "code": "// switch：等值判断\nswitch (value) {\n  case 1: break;\n  case 2: break;\n  case 3: break;\n}\n\n// if：可以范围判断\nif (value > 0 && value < 10) {\n  // 范围判断\n}"
          }
        ]
      },
      "source": "switch"
    },

    // 第7-10题：困难题型
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["条件判断"],
      "question": "以下代码的输出是什么？",
      "code": "if ('0') {\n  console.log('A');\n}\nif (0) {\n  console.log('B');\n}\nif ({}) {\n  console.log('C');\n}",
      "options": [
        "A, C",
        "B",
        "A, B, C",
        "C"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Truthy vs Falsy",
        "sections": [
          {
            "title": "分析",
            "code": "// '0' 是非空字符串，truthy\nif ('0') { console.log('A'); }  // 输出A\n\n// 0 是数字0，falsy\nif (0) { console.log('B'); }  // 不输出\n\n// {} 是对象，truthy\nif ({}) { console.log('C'); }  // 输出C"
          }
        ]
      },
      "source": "条件判断"
    },

    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["最佳实践"],
      "question": "条件语句的最佳实践包括哪些？",
      "options": [
        "避免过深的嵌套",
        "使用卫语句提前返回",
        "复杂条件提取为变量",
        "总是使用大括号"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "条件语句最佳实践",
        "content": "所有选项都正确！",
        "sections": [
          {
            "title": "示例",
            "code": "// ✓ 卫语句\nif (!user) return;\nif (!user.isActive) return;\nprocessUser(user);\n\n// ✓ 提取条件\nconst isValid = user && user.isActive && user.age >= 18;\nif (isValid) { }"
          }
        ]
      },
      "source": "最佳实践"
    },

    {
      "difficulty": "hard",
      "type": "code-completion",
      "tags": ["空值合并"],
      "question": "请使用??运算符设置默认值",
      "code": "const value = input ______ 'default';\n// 只在null/undefined时使用默认值",
      "options": [
        "??",
        "||",
        "&&",
        "?:"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "??空值合并运算符",
        "sections": [
          {
            "title": "vs ||",
            "code": "// ?? 只处理null/undefined\n0 ?? 'default';  // 0\n'' ?? 'default'; // ''\n\n// || 处理所有falsy值\n0 || 'default';  // 'default'\n'' || 'default'; // 'default'"
          }
        ]
      },
      "source": "空值合并"
    },

    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["逻辑运算符"],
      "question": "以下代码的输出是什么？",
      "code": "const a = null && 'value';\nconst b = null || 'value';\nconst c = null ?? 'value';\n\nconsole.log(a, b, c);",
      "options": [
        "null, 'value', 'value'",
        "'value', 'value', 'value'",
        "null, null, null",
        "undefined, 'value', 'value'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "逻辑运算符对比",
        "sections": [
          {
            "title": "分析",
            "code": "// && 返回第一个falsy值\nconst a = null && 'value';  // null\n\n// || 返回第一个truthy值\nconst b = null || 'value';  // 'value'\n\n// ?? 只在null/undefined时返回右侧\nconst c = null ?? 'value';  // 'value'"
          }
        ]
      },
      "source": "逻辑运算符"
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
