window.quizData_Basics02Operators = {
  "config": {
    "title": "运算符",
    "icon": "➕",
    "description": "算术、比较、逻辑、位运算等操作符",
    "primaryColor": "#667eea",
    "bgGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    // 第1题：简单 - 单选题
    {
      "difficulty": "easy",
      "tags": ["基础概念"],
      "question": "JavaScript中有哪些算术运算符？",
      "options": [
        "+、-、*、/、%（取余）、**（幂运算）",
        "只有 +、-、*、/",
        "+、-、*、/、%、^",
        "+、-、*、/"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "JavaScript的算术运算符",
        "sections": [
          {
            "title": "基本运算符",
            "code": "// 加减乘除\n10 + 5;   // 15\n10 - 5;   // 5\n10 * 5;   // 50\n10 / 5;   // 2\n\n// 取余（模运算）\n10 % 3;   // 1\n-10 % 3;  // -1\n\n// 幂运算（ES2016）\n2 ** 3;   // 8（2的3次方）\n2 ** 10;  // 1024\nMath.pow(2, 3);  // 8（等价写法）"
          },
          {
            "title": "一元运算符",
            "code": "// 一元加/减\n+5;    // 5\n-5;    // -5\n+'42'; // 42（字符串转数字）\n\n// 递增/递减\nlet x = 5;\nx++;  // 返回5，x变为6（后置）\n++x;  // x变为7，返回7（前置）\nx--;  // 返回7，x变为6（后置）\n--x;  // x变为5，返回5（前置）"
          }
        ]
      },
      "source": "算术运算符"
    },

    // 第2题：简单 - 判断题
    {
      "difficulty": "easy",
      "type": "true-false",
      "tags": ["==="],
      "question": "=== 和 == 的区别是：=== 会先进行类型转换再比较。",
      "options": ["正确", "错误"],
      "correctAnswer": "B",
      "explanation": {
        "title": "=== vs ==",
        "content": "这是错误的。恰恰相反，===不会进行类型转换，而==会。",
        "sections": [
          {
            "title": "==（宽松相等）",
            "code": "// 会进行类型转换\n'5' == 5;    // true\n0 == false;  // true\nnull == undefined; // true\n[] == false; // true"
          },
          {
            "title": "===（严格相等）",
            "code": "// 不进行类型转换\n'5' === 5;   // false（类型不同）\n0 === false; // false\nnull === undefined; // false\n[] === false; // false\n\n// 只有类型和值都相同才返回true\n5 === 5;     // true\n'5' === '5'; // true"
          },
          {
            "title": "最佳实践",
            "code": "// 推荐：总是使用===\nif (value === null) { }\nif (count === 0) { }\n\n// 唯一使用==的场景：同时检查null和undefined\nif (value == null) {\n  // value是null或undefined\n}\n// 等价于：\nif (value === null || value === undefined) { }"
          }
        ]
      },
      "source": "比较运算符"
    },

    // 第3题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["逻辑运算符"],
      "question": "以下哪些是JavaScript的逻辑运算符？",
      "options": [
        "&&（逻辑与）",
        "||（逻辑或）",
        "!（逻辑非）",
        "??（空值合并）"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "JavaScript逻辑运算符",
        "content": "所有选项都正确！??是ES2020引入的新运算符。",
        "sections": [
          {
            "title": "&&（逻辑与）",
            "code": "// 短路求值：左侧为false时，不执行右侧\ntrue && true;   // true\ntrue && false;  // false\nfalse && true;  // false\n\n// 返回第一个falsy值，或最后一个truthy值\n0 && 1;         // 0\n1 && 2;         // 2\n'' && 'hello';  // ''\n'a' && 'b';     // 'b'\n\n// 实际应用\nuser && user.name;  // 安全访问\nlogged && redirect();  // 条件执行"
          },
          {
            "title": "||（逻辑或）",
            "code": "// 短路求值：左侧为true时，不执行右侧\ntrue || false;  // true\nfalse || true;  // true\n\n// 返回第一个truthy值，或最后一个falsy值\n0 || 1;         // 1\n1 || 2;         // 1\n'' || 'default'; // 'default'\n'a' || 'b';     // 'a'\n\n// 实际应用：默认值\nconst name = input || 'Guest';\nconst port = process.env.PORT || 3000;"
          },
          {
            "title": "!（逻辑非）",
            "code": "// 将值转为布尔值并取反\n!true;   // false\n!false;  // true\n!0;      // true\n!'';     // true\n!'hello'; // false\n\n// 双重否定转布尔值\n!!1;     // true\n!!0;     // false"
          },
          {
            "title": "??（空值合并）ES2020",
            "code": "// 只在null/undefined时使用默认值\nnull ?? 'default';      // 'default'\nundefined ?? 'default'; // 'default'\n0 ?? 'default';         // 0（不是null）\n'' ?? 'default';        // ''（不是null）\nfalse ?? 'default';     // false\n\n// vs ||运算符\n0 || 'default';   // 'default'（0是falsy）\n0 ?? 'default';   // 0（0不是null/undefined）\n\n'' || 'default';  // 'default'\n'' ?? 'default';  // ''"
          }
        ]
      },
      "source": "逻辑运算符"
    },

    // 第4题：中等 - 代码输出题
    {
      "difficulty": "medium",
      "type": "code-output",
      "tags": ["运算符优先级"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(2 + 3 * 4);\nconsole.log((2 + 3) * 4);\nconsole.log(10 > 5 > 2);",
      "options": [
        "14, 20, false",
        "20, 20, true",
        "14, 20, true",
        "20, 14, false"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "运算符优先级",
        "sections": [
          {
            "title": "第一个：2 + 3 * 4 → 14",
            "code": "2 + 3 * 4;\n// *的优先级高于+\n// 先计算 3 * 4 = 12\n// 再计算 2 + 12 = 14"
          },
          {
            "title": "第二个：(2 + 3) * 4 → 20",
            "code": "(2 + 3) * 4;\n// 括号优先级最高\n// 先计算 2 + 3 = 5\n// 再计算 5 * 4 = 20"
          },
          {
            "title": "第三个：10 > 5 > 2 → false",
            "code": "10 > 5 > 2;\n// 从左到右执行\n// 1. 10 > 5 → true\n// 2. true > 2\n//    true转为数字：Number(true) = 1\n//    1 > 2 → false\n\n// 正确写法：\n10 > 5 && 5 > 2;  // true"
          },
          {
            "title": "常见优先级顺序",
            "points": [
              "1. 括号 ()",
              "2. 成员访问 . []、new",
              "3. 一元运算 ! + - ++ --",
              "4. 乘除 * / %",
              "5. 加减 + -",
              "6. 比较 < > <= >=",
              "7. 相等 == === != !==",
              "8. 逻辑与 &&",
              "9. 逻辑或 ||",
              "10. 三元 ?:",
              "11. 赋值 = += -= 等"
            ]
          }
        ]
      },
      "source": "运算符优先级"
    },

    // 第5题：中等 - 代码补全题
    {
      "difficulty": "medium",
      "type": "code-completion",
      "tags": ["三元运算符"],
      "question": "如何使用三元运算符简化if-else？请补全代码。",
      "code": "const age = 18;\nconst status = ______;\n\nconsole.log(status);  // 'adult'",
      "options": [
        "age >= 18 ? 'adult' : 'minor'",
        "if (age >= 18) 'adult' else 'minor'",
        "age >= 18 && 'adult' || 'minor'",
        "age >= 18 : 'adult' ? 'minor'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "三元运算符",
        "sections": [
          {
            "title": "基本语法",
            "code": "// 条件 ? 值1 : 值2\nconst result = condition ? valueIfTrue : valueIfFalse;\n\n// 等价于：\nlet result;\nif (condition) {\n  result = valueIfTrue;\n} else {\n  result = valueIfFalse;\n}"
          },
          {
            "title": "实际应用",
            "code": "// 1. 简单条件\nconst status = age >= 18 ? 'adult' : 'minor';\n\n// 2. 默认值\nconst name = user ? user.name : 'Guest';\n\n// 3. 条件渲染（React）\nreturn <div>{isLoading ? <Spinner /> : <Content />}</div>;\n\n// 4. 条件属性\nconst className = isActive ? 'active' : 'inactive';"
          },
          {
            "title": "嵌套三元（不推荐）",
            "code": "// 可以嵌套，但影响可读性\nconst grade = score >= 90 ? 'A'\n            : score >= 80 ? 'B'\n            : score >= 70 ? 'C'\n            : 'D';\n\n// 推荐用if-else或switch\nlet grade;\nif (score >= 90) grade = 'A';\nelse if (score >= 80) grade = 'B';\nelse if (score >= 70) grade = 'C';\nelse grade = 'D';"
          },
          {
            "title": "注意陷阱",
            "code": "// 错误：不能用于语句\nconst x = condition ? console.log('yes') : console.log('no');\n// console.log返回undefined\n\n// 正确：使用表达式\ncondition ? console.log('yes') : console.log('no');\n\n// 或者改用if\nif (condition) {\n  console.log('yes');\n} else {\n  console.log('no');\n}"
          }
        ]
      },
      "source": "三元运算符"
    },

    // 第6题：中等 - 多选题
    {
      "difficulty": "medium",
      "type": "multiple",
      "tags": ["赋值运算符"],
      "question": "以下哪些是复合赋值运算符？",
      "options": [
        "+=（加后赋值）",
        "*=（乘后赋值）",
        "&&=（逻辑与赋值，ES2021）",
        "??=（空值赋值，ES2021）"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "复合赋值运算符",
        "content": "所有选项都正确！ES2021新增了逻辑赋值运算符。",
        "sections": [
          {
            "title": "算术赋值运算符",
            "code": "let x = 10;\n\nx += 5;  // x = x + 5;  → 15\nx -= 3;  // x = x - 3;  → 12\nx *= 2;  // x = x * 2;  → 24\nx /= 4;  // x = x / 4;  → 6\nx %= 5;  // x = x % 5;  → 1\nx **= 2; // x = x ** 2; → 1"
          },
          {
            "title": "逻辑赋值运算符（ES2021）",
            "code": "// &&= 只在truthy时赋值\nlet a = 1;\na &&= 2;  // a = 2（a是truthy）\n\nlet b = 0;\nb &&= 2;  // b = 0（b是falsy，不赋值）\n\n// 等价于：\na && (a = 2);\n\n// ||= 只在falsy时赋值\nlet x = 0;\nx ||= 10;  // x = 10（x是falsy）\n\nlet y = 5;\ny ||= 10;  // y = 5（y是truthy，不赋值）\n\n// ??= 只在null/undefined时赋值\nlet z = null;\nz ??= 10;  // z = 10\n\nlet w = 0;\nw ??= 10;  // w = 0（0不是null/undefined）"
          },
          {
            "title": "实际应用",
            "code": "// 1. 累加计数\nlet count = 0;\ncount += 1;  // 等同于 count++\n\n// 2. 默认值设置\nobj.prop ||= 'default';\n// 只在prop是falsy时设置\n\n// 3. 对象属性初始化\nconst config = {};\nconfig.timeout ??= 3000;\n// 只在timeout未定义时设置\n\n// 4. 条件更新\nlet score = 100;\nscore &&= score * 1.1;\n// 只在有分数时增加10%"
          }
        ]
      },
      "source": "赋值运算符"
    },

    // 第7题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["位运算符"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(5 & 3);\nconsole.log(5 | 3);\nconsole.log(5 ^ 3);\nconsole.log(~5);",
      "options": [
        "1, 7, 6, -6",
        "3, 5, 2, -5",
        "2, 6, 4, -6",
        "1, 7, 6, -5"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "位运算符",
        "sections": [
          {
            "title": "二进制表示",
            "code": "// 5的二进制：0101\n// 3的二进制：0011"
          },
          {
            "title": "& 按位与：1 ✓",
            "code": "5 & 3;\n//   0101  (5)\n// & 0011  (3)\n// ------\n//   0001  (1)"
          },
          {
            "title": "| 按位或：7 ✓",
            "code": "5 | 3;\n//   0101  (5)\n// | 0011  (3)\n// ------\n//   0111  (7)"
          },
          {
            "title": "^ 按位异或：6 ✓",
            "code": "5 ^ 3;\n//   0101  (5)\n// ^ 0011  (3)\n// ------\n//   0110  (6)\n// 相同为0，不同为1"
          },
          {
            "title": "~ 按位非：-6 ✓",
            "code": "~5;\n// 将每一位取反，然后加1取负\n// ~x = -(x + 1)\n// ~5 = -(5 + 1) = -6"
          },
          {
            "title": "实际应用",
            "code": "// 1. 快速取整\n~~3.14;    // 3\n3.14 | 0;  // 3\n\n// 2. 判断奇偶\nnum & 1;   // 1是奇数，0是偶数\n\n// 3. 交换变量（不推荐）\na ^= b;\nb ^= a;\na ^= b;\n\n// 4. 检查indexOf结果\nif (~str.indexOf('x')) {\n  // 找到了（~-1 = 0, ~0 = -1, ~1 = -2...）\n}\n// 现代写法：\nif (str.includes('x')) { }"
          }
        ]
      },
      "source": "位运算符"
    },

    // 第8题：困难 - 多选题
    {
      "difficulty": "hard",
      "type": "multiple",
      "tags": ["可选链", "空值合并"],
      "question": "关于?.（可选链）和??（空值合并）运算符，以下说法正确的是？",
      "options": [
        "?.用于安全地访问可能为null/undefined的属性",
        "?.会短路，如果左侧是null/undefined则不继续执行",
        "??只在左侧为null/undefined时返回右侧值",
        "??和||的行为完全相同"
      ],
      "correctAnswer": ["A", "B", "C"],
      "explanation": {
        "title": "ES2020新特性",
        "sections": [
          {
            "title": "选项A、B - ?.可选链（正确）",
            "code": "// 传统写法\nconst city = user && user.address && user.address.city;\n\n// 可选链写法\nconst city = user?.address?.city;\n\n// 如果任何一环节是null/undefined，返回undefined\nconst user = null;\nuser?.address?.city;  // undefined（不报错）\n\n// 可选链的应用\nobj?.prop          // 属性访问\nobj?.[expr]        // 计算属性\nfunc?.()           // 函数调用\narr?.[0]           // 数组访问"
          },
          {
            "title": "选项C - ??空值合并（正确）",
            "code": "// 只在null/undefined时使用默认值\nconst value = input ?? 'default';\n\n// vs ||运算符\n0 ?? 'default';      // 0\n0 || 'default';      // 'default'\n\n'' ?? 'default';     // ''\n'' || 'default';     // 'default'\n\nfalse ?? 'default';  // false\nfalse || 'default';  // 'default'\n\n// 适用场景\nconst port = config.port ?? 3000;  // port可以是0\nconst timeout = options.timeout ?? 0;  // timeout可以是0"
          },
          {
            "title": "选项D - 错误",
            "content": "??和||的行为不同，||会将所有falsy值都替换为默认值。",
            "code": "// ??：只替换null/undefined\nnull ?? 'default';      // 'default' ✓\nundefined ?? 'default'; // 'default' ✓\n0 ?? 'default';         // 0 ✓\n'' ?? 'default';        // '' ✓\nfalse ?? 'default';     // false ✓\n\n// ||：替换所有falsy值\nnull || 'default';      // 'default'\nundefined || 'default'; // 'default'\n0 || 'default';         // 'default' ✗\n'' || 'default';        // 'default' ✗\nfalse || 'default';     // 'default' ✗"
          },
          {
            "title": "组合使用",
            "code": "// ?.和??配合\nconst name = user?.profile?.name ?? 'Anonymous';\n\n// 等价于：\nlet name;\nif (user !== null && user !== undefined &&\n    user.profile !== null && user.profile !== undefined) {\n  name = user.profile.name;\n}\nif (name === null || name === undefined) {\n  name = 'Anonymous';\n}"
          }
        ]
      },
      "source": "ES2020特性"
    },

    // 第9题：困难 - 代码补全题
    {
      "difficulty": "hard",
      "type": "code-completion",
      "tags": ["逗号运算符"],
      "question": "逗号运算符会返回什么值？请补全代码。",
      "code": "const result = (1 + 2, 3 + 4, 5 + 6);\nconsole.log(result);  // ______",
      "options": [
        "11",
        "3",
        "7",
        "21"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "逗号运算符",
        "content": "逗号运算符会依次执行所有表达式，返回最后一个表达式的值。",
        "sections": [
          {
            "title": "基本用法",
            "code": "const result = (1 + 2, 3 + 4, 5 + 6);\n// 执行顺序：\n// 1. 1 + 2 = 3（计算但不返回）\n// 2. 3 + 4 = 7（计算但不返回）\n// 3. 5 + 6 = 11（返回）\nconsole.log(result);  // 11"
          },
          {
            "title": "实际应用",
            "code": "// 1. for循环中同时更新多个变量\nfor (let i = 0, j = 10; i < j; i++, j--) {\n  console.log(i, j);\n}\n\n// 2. 箭头函数返回前执行多个操作\nconst fn = x => (console.log(x), x * 2);\n// 先打印，再返回x*2\n\n// 3. 条件表达式中\nconst x = (doSomething(), getValue());\n// 先执行doSomething()，再返回getValue()的结果"
          },
          {
            "title": "注意陷阱",
            "code": "// 优先级很低，需要括号\nlet a = 1, 2, 3;  // SyntaxError\nlet a = (1, 2, 3); // a = 3 ✓\n\n// 数组中的逗号不是逗号运算符\nconst arr = [1, 2, 3];  // 数组字面量\nconst val = (1, 2, 3);  // 逗号运算符\n\n// 函数参数中的逗号不是逗号运算符\nfunc(1, 2, 3);  // 3个参数\nfunc((1, 2, 3)); // 1个参数，值为3"
          },
          {
            "title": "不推荐过度使用",
            "code": "// 不好：影响可读性\nconst x = (a = 1, b = 2, a + b);\n\n// 好：明确分开\nconst a = 1;\nconst b = 2;\nconst x = a + b;"
          }
        ]
      },
      "source": "逗号运算符"
    },

    // 第10题：困难 - 代码输出题
    {
      "difficulty": "hard",
      "type": "code-output",
      "tags": ["运算符陷阱"],
      "question": "以下代码的输出是什么？",
      "code": "console.log(typeof typeof 1);\nconsole.log(3 > 2 > 1);\nconsole.log([] + []);\nconsole.log([] + {});\nconsole.log({} + []);",
      "options": [
        "'string', false, '', '[object Object]', '0'",
        "'number', true, '[]', '[object Object]', '0'",
        "'string', false, '', '[object Object]', '[object Object]'",
        "'number', false, 'undefined', 'undefined', 'undefined'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "运算符的各种陷阱",
        "sections": [
          {
            "title": "1. typeof typeof 1 → 'string'",
            "code": "typeof 1;          // 'number'\ntypeof 'number';   // 'string'\n// typeof总是返回字符串"
          },
          {
            "title": "2. 3 > 2 > 1 → false",
            "code": "3 > 2 > 1;\n// 从左到右：\n// 1. 3 > 2 → true\n// 2. true > 1 → Number(true) > 1 → 1 > 1 → false\n\n// 正确写法：\n3 > 2 && 2 > 1;  // true"
          },
          {
            "title": "3. [] + [] → ''",
            "code": "[] + [];\n// [].toString() = ''\n// '' + '' = ''"
          },
          {
            "title": "4. [] + {} → '[object Object]'",
            "code": "[] + {};\n// [].toString() = ''\n// ({}).toString() = '[object Object]'\n// '' + '[object Object]' = '[object Object]'"
          },
          {
            "title": "5. {} + [] → '0'",
            "code": "{} + [];\n// {}被解释为代码块（不是对象）\n// 实际执行：+[]\n// +[].toString() = +'' = 0\n\n// 消除歧义：\n({}) + [];  // '[object Object]'"
          },
          {
            "title": "避免这些陷阱",
            "code": "// 1. 使用括号消除歧义\n({}) + [];  // 明确是对象\n\n// 2. 链式比较用逻辑运算符\na > b && b > c;\n\n// 3. typeof只需要一次\ntypeof value;\n\n// 4. 显式类型转换\nString([]);  // ''\nString({});  // '[object Object]'"
          }
        ]
      },
      "source": "运算符陷阱"
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
