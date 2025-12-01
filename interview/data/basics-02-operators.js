window.quizData_Basics02Operators = {
  "config": {
    "title": "运算符",
    "icon": "➕",
    "description": "掌握JavaScript各种运算符的使用与优先级",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["算术运算符"],
      "question": "JavaScript有哪些算术运算符？",
      "options": [
        "+、-、*、/、%、**（幂运算）",
        "只有+、-、*、/",
        "没有幂运算",
        "只有+和-"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "算术运算符：",
        "sections": [
          {
            "title": "基本运算符",
            "code": "// 加减乘除\n5 + 3; // 8\n5 - 3; // 2\n5 * 3; // 15\n5 / 3; // 1.666...\n\n// 取模（余数）\n5 % 3; // 2\n-5 % 3; // -2\n\n// 幂运算（ES7）\n2 ** 3; // 8\n2 ** 0.5; // 1.414... (平方根)"
          },
          {
            "title": "一元运算符",
            "code": "+x;  // 转数字\n-x;  // 取负\n++x; // 前置递增\nx++; // 后置递增\n--x; // 前置递减\nx--; // 后置递减"
          }
        ]
      },
      "source": "算术运算符"
    },
    {
      "difficulty": "easy",
      "tags": ["比较运算符"],
      "question": "==和===有什么区别？",
      "options": [
        "==会进行类型转换，===不会（严格相等）",
        "完全相同",
        "===会类型转换",
        "没有区别"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "相等性比较：",
        "sections": [
          {
            "title": "==（宽松相等）",
            "code": "1 == '1'; // true\n0 == false; // true\nnull == undefined; // true\n[] == 0; // true"
          },
          {
            "title": "===（严格相等）",
            "code": "1 === '1'; // false\n0 === false; // false\nnull === undefined; // false\nNaN === NaN; // false"
          },
          {
            "title": "最佳实践",
            "content": "总是使用===和!==，避免==和!=的隐式转换陷阱。"
          }
        ]
      },
      "source": "比较运算符"
    },
    {
      "difficulty": "medium",
      "tags": ["逻辑运算符"],
      "question": "&&和||运算符的返回值是什么？",
      "options": [
        "返回第一个能确定结果的操作数的值，不一定是布尔值",
        "总是返回true或false",
        "只能用于布尔值",
        "只返回最后一个操作数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "逻辑运算符的返回值：",
        "sections": [
          {
            "title": "&&（逻辑与）",
            "code": "// 返回第一个假值，或最后一个真值\ntrue && 'hello'; // 'hello'\n'hello' && 0; // 0\n0 && 'hello'; // 0\n'a' && 'b' && 'c'; // 'c'\n\n// 短路求值\nconst user = null;\nconst name = user && user.name; // null"
          },
          {
            "title": "||（逻辑或）",
            "code": "// 返回第一个真值，或最后一个假值\ntrue || 'hello'; // true\n0 || 'hello'; // 'hello'\n'' || 0; // 0\n'a' || 'b'; // 'a'\n\n// 默认值\nconst count = userCount || 0;"
          },
          {
            "title": "??（空值合并，ES2020）",
            "code": "// 只在null/undefined时取右值\n0 ?? 10; // 0\n'' ?? 'default'; // ''\nnull ?? 'default'; // 'default'\nundefined ?? 'default'; // 'default'"
          }
        ]
      },
      "source": "逻辑运算符"
    },
    {
      "difficulty": "medium",
      "tags": ["位运算符"],
      "question": "位运算符有什么实际应用？",
      "options": [
        "权限管理、颜色处理、性能优化、取整等",
        "没有实际用途",
        "只能处理二进制",
        "已经被废弃"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "位运算符应用：",
        "sections": [
          {
            "title": "1. 快速取整",
            "code": "~~3.14; // 3\n3.14 | 0; // 3\n3.14 >> 0; // 3\n\n// 比Math.floor快"
          },
          {
            "title": "2. 奇偶判断",
            "code": "n & 1; // 1为奇数，0为偶数\n5 & 1; // 1\n4 & 1; // 0"
          },
          {
            "title": "3. 权限管理",
            "code": "const READ = 1;    // 0001\nconst WRITE = 2;   // 0010\nconst DELETE = 4;  // 0100\n\n// 添加权限\nlet perm = READ | WRITE; // 0011\n\n// 检查权限\nperm & READ;  // 真\nperm & DELETE; // 假\n\n// 移除权限\nperm = perm & ~WRITE; // 0001"
          },
          {
            "title": "4. 交换变量",
            "code": "let a = 5, b = 3;\na ^= b;\nb ^= a;\na ^= b;\nconsole.log(a, b); // 3, 5"
          }
        ]
      },
      "source": "位运算符"
    },
    {
      "difficulty": "medium",
      "tags": ["条件运算符"],
      "question": "三元运算符可以嵌套使用吗？有什么建议？",
      "options": [
        "可以嵌套，但建议不超过一层，否则用if/else",
        "不能嵌套",
        "可以无限嵌套",
        "必须使用括号"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "三元运算符：",
        "sections": [
          {
            "title": "基本使用",
            "code": "const age = 18;\nconst type = age >= 18 ? '成年' : '未成年';\n\n// 等价于\nlet type;\nif (age >= 18) {\n  type = '成年';\n} else {\n  type = '未成年';\n}"
          },
          {
            "title": "嵌套（不推荐）",
            "code": "// 可读性差\nconst level = score > 90 ? 'A' :\n              score > 80 ? 'B' :\n              score > 60 ? 'C' : 'D';\n\n// 推荐用if/else或switch\nlet level;\nif (score > 90) level = 'A';\nelse if (score > 80) level = 'B';\nelse if (score > 60) level = 'C';\nelse level = 'D';"
          },
          {
            "title": "最佳实践",
            "points": [
              "简单条件使用三元运算符",
              "复杂逻辑用if/else",
              "避免嵌套超过一层",
              "注意运算符优先级"
            ]
          }
        ]
      },
      "source": "三元运算符"
    },
    {
      "difficulty": "medium",
      "tags": ["赋值运算符"],
      "question": "复合赋值运算符（+=、-=等）有什么优势？",
      "options": [
        "简洁、避免重复计算、提高可读性",
        "没有优势",
        "性能更差",
        "只是语法糖"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "复合赋值运算符：",
        "sections": [
          {
            "title": "所有复合赋值",
            "code": "let x = 10;\nx += 5;  // x = x + 5\nx -= 3;  // x = x - 3\nx *= 2;  // x = x * 2\nx /= 4;  // x = x / 4\nx %= 3;  // x = x % 3\nx **= 2; // x = x ** 2\n\n// 位运算\nx &= 0xFF;\nx |= 0x01;\nx ^= 0x0F;\nx <<= 2;\nx >>= 1;\nx >>>= 1;\n\n// 逻辑赋值（ES2021）\nx &&= value;  // x = x && value\nx ||= value;  // x = x || value\nx ??= value;  // x = x ?? value"
          },
          {
            "title": "避免重复计算",
            "code": "// 不好\nobj.prop.subprop = obj.prop.subprop + 1;\n\n// 好\nobj.prop.subprop += 1;\n\n// 只计算一次路径"
          }
        ]
      },
      "source": "赋值运算符"
    },
    {
      "difficulty": "hard",
      "tags": ["运算符优先级"],
      "question": "以下表达式的执行顺序是什么？",
      "options": [
        "先++x，再*，最后+",
        "从左到右",
        "从右到左",
        "随机"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "运算符优先级：",
        "code": "let x = 5;\nlet result = 2 + 3 * ++x;\n\n// 执行顺序：\n// 1. ++x (优先级最高) -> x = 6\n// 2. 3 * 6 -> 18\n// 3. 2 + 18 -> 20\n\nconsole.log(result); // 20\nconsole.log(x); // 6",
        "sections": [
          {
            "title": "优先级表（高到低）",
            "points": [
              "()、[]、.：成员访问",
              "++、--：递增递减（前置）",
              "!、~、+、-：一元运算符",
              "**：幂运算",
              "*、/、%：乘除模",
              "+、-：加减",
              "<<、>>、>>>：位移",
              "<、<=、>、>=：关系",
              "==、===、!=、!==：相等",
              "&、^、|：位运算",
              "&&：逻辑与",
              "||：逻辑或",
              "??：空值合并",
              "?:：条件",
              "=、+=等：赋值",
              ",：逗号"
            ]
          },
          {
            "title": "使用括号明确",
            "code": "// 不清楚\nlet a = b + c * d;\n\n// 清楚\nlet a = b + (c * d);"
          }
        ]
      },
      "source": "优先级"
    },
    {
      "difficulty": "hard",
      "tags": ["++和--"],
      "question": "前置++和后置++有什么区别？",
      "options": [
        "前置先自增再返回值，后置先返回值再自增",
        "完全相同",
        "后置更快",
        "前置不能用于表达式"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "递增递减运算符：",
        "sections": [
          {
            "title": "前置++",
            "code": "let x = 5;\nlet y = ++x;\nconsole.log(x, y); // 6, 6\n\n// 先自增，再返回"
          },
          {
            "title": "后置++",
            "code": "let x = 5;\nlet y = x++;\nconsole.log(x, y); // 6, 5\n\n// 先返回，再自增"
          },
          {
            "title": "复杂示例",
            "code": "let a = 1;\nlet b = a++ + ++a + a++;\n// a++ -> 返回1，a变2\n// ++a -> a变3，返回3\n// a++ -> 返回3，a变4\n// b = 1 + 3 + 3 = 7\nconsole.log(a, b); // 4, 7"
          },
          {
            "title": "最佳实践",
            "points": [
              "尽量单独使用，不混入表达式",
              "优先使用+=1，更清晰",
              "避免在同一表达式中多次使用"
            ]
          }
        ]
      },
      "source": "递增递减"
    },
    {
      "difficulty": "hard",
      "tags": ["逗号运算符"],
      "question": "逗号运算符的作用是什么？",
      "options": [
        "从左到右求值，返回最后一个表达式的值",
        "同时返回所有值",
        "连接字符串",
        "没有作用"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "逗号运算符：",
        "sections": [
          {
            "title": "基本用法",
            "code": "let x = (1, 2, 3);\nconsole.log(x); // 3\n\nlet a = (console.log('a'), console.log('b'), 5);\n// 输出：a\n// 输出：b\nconsole.log(a); // 5"
          },
          {
            "title": "for循环中使用",
            "code": "for (let i = 0, j = 10; i < j; i++, j--) {\n  console.log(i, j);\n}\n// 0 10\n// 1 9\n// 2 8\n// ..."
          },
          {
            "title": "注意优先级",
            "code": "let a = 1, 2, 3;  // SyntaxError\nlet a = (1, 2, 3); // 3\n\n// 逗号运算符优先级最低\nlet x = (y = 1, z = 2);\nconsole.log(x); // 2"
          },
          {
            "title": "实际应用",
            "code": "// 返回函数同时执行操作\nreturn (cleanup(), result);\n\n// 简化代码\nif (condition) {\n  doA(), doB(), doC();\n}"
          }
        ]
      },
      "source": "逗号运算符"
    },
    {
      "difficulty": "hard",
      "tags": ["void运算符"],
      "question": "void运算符的作用是什么？",
      "options": [
        "对表达式求值并返回undefined",
        "阻止代码执行",
        "返回null",
        "抛出错误"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "void运算符：",
        "sections": [
          {
            "title": "基本用法",
            "code": "void 0; // undefined\nvoid (1 + 1); // undefined\nvoid function test() {}(); // undefined"
          },
          {
            "title": "获取undefined",
            "code": "// undefined可被重写（ES5之前）\nconst undefined = 'not undefined';\n\n// void 0永远返回真正的undefined\nconst undef = void 0;"
          },
          {
            "title": "阻止默认行为",
            "code": "// HTML中阻止链接跳转\n// <a href=\"javascript:void(0)\">点击</a>\n\n// 等价于\n// <a href=\"#\" onclick=\"return false\">点击</a>"
          },
          {
            "title": "立即执行函数",
            "code": "void function() {\n  console.log('IIFE');\n}();\n\n// 等价于\n(function() {\n  console.log('IIFE');\n})();"
          }
        ]
      },
      "source": "void运算符"
    }
  ],
  "navigation": {
    "prev": {
      "title": "类型转换",
      "url": "01-type-conversion.html"
    },
    "next": {
      "title": "表达式",
      "url": "02-expressions.html"
    }
  }
};
