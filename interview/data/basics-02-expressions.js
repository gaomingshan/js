window.quizData_Basics02Expressions = {
  "config": {
    "title": "表达式",
    "icon": "📐",
    "description": "理解JavaScript表达式的求值与副作用",
    "primaryColor": "#8b5cf6",
    "bgGradient": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["表达式类型"],
      "question": "表达式和语句的区别是什么？",
      "options": [
        "表达式产生值，语句执行操作",
        "完全相同",
        "表达式不能赋值",
        "语句不能包含表达式"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "表达式 vs 语句：",
        "sections": [
          {
            "title": "表达式（Expression）",
            "points": [
              "产生一个值",
              "可以作为函数参数",
              "可以赋值给变量",
              "可以嵌套"
            ],
            "code": "// 表达式\n1 + 2\n'hello'\nfunc()\nx > 5 ? 'big' : 'small'\n[1, 2, 3]\n{ x: 1 }"
          },
          {
            "title": "语句（Statement）",
            "points": [
              "执行某个操作",
              "不产生值（或值为undefined）",
              "不能嵌套在表达式中"
            ],
            "code": "// 语句\nif (x > 5) { }\nfor (let i = 0; i < 10; i++) { }\nlet a = 1;\nreturn value;"
          },
          {
            "title": "表达式语句",
            "code": "// 表达式可以作为语句\nx = 5;  // 赋值表达式作为语句\nfunc(); // 函数调用表达式作为语句"
          }
        ]
      },
      "source": "表达式与语句"
    },
    {
      "difficulty": "easy",
      "tags": ["主要表达式"],
      "question": "以下哪些是JavaScript的主要表达式（Primary Expression）？",
      "options": [
        "字面量、this、变量、分组表达式()",
        "只有字面量",
        "只有变量",
        "只有函数"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "主要表达式：",
        "sections": [
          {
            "title": "1. 字面量",
            "code": "123           // 数字字面量\n'hello'       // 字符串字面量\ntrue          // 布尔字面量\nnull          // null字面量\n[1, 2, 3]     // 数组字面量\n{ x: 1 }      // 对象字面量\nfunction() {} // 函数字面量\n/abc/         // 正则字面量"
          },
          {
            "title": "2. 关键字",
            "code": "this          // this关键字\nsuper         // super关键字\nundefined     // undefined"
          },
          {
            "title": "3. 标识符",
            "code": "x             // 变量引用\nMyClass       // 类引用\nfunc          // 函数引用"
          },
          {
            "title": "4. 分组表达式",
            "code": "(1 + 2)       // 改变优先级\n(function() {})() // IIFE"
          }
        ]
      },
      "source": "主要表达式"
    },
    {
      "difficulty": "medium",
      "tags": ["左值表达式"],
      "question": "什么是左值（LHS）和右值（RHS）？",
      "options": [
        "左值是赋值目标（可被赋值），右值是赋值源（提供值）",
        "左右两边的值",
        "没有区别",
        "只是位置不同"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "左值与右值：",
        "sections": [
          {
            "title": "左值（LHS - Left Hand Side）",
            "points": [
              "可以出现在赋值运算符左边",
              "表示内存位置",
              "可以被赋值"
            ],
            "code": "// 左值\nx = 5;              // x是左值\nobj.prop = 10;      // obj.prop是左值\narr[0] = 'a';       // arr[0]是左值\n\n// 不是左值\n5 = x;              // 错误\n(x + 1) = 5;        // 错误\nfunc() = 10;        // 错误（除非返回引用）"
          },
          {
            "title": "右值（RHS - Right Hand Side）",
            "points": [
              "提供值",
              "任何表达式都可以是右值",
              "不能被赋值"
            ],
            "code": "// 右值\nlet a = 5;          // 5是右值\nlet b = x + 1;      // x+1是右值\nlet c = func();     // func()是右值"
          },
          {
            "title": "递增递减特殊性",
            "code": "// ++x 是左值表达式\nlet y = ++x;        // 先自增，返回左值\n\n// x++ 是右值表达式\nlet z = x++;        // 返回原值（右值）"
          }
        ]
      },
      "source": "左值右值"
    },
    {
      "difficulty": "medium",
      "tags": ["属性访问"],
      "question": "obj.prop和obj['prop']有什么区别？",
      "options": [
        "点号只能用于有效标识符，方括号可以用于任何字符串和动态属性",
        "完全相同",
        "方括号更慢",
        "点号功能更强"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "属性访问方式：",
        "sections": [
          {
            "title": "点号访问",
            "code": "obj.name\nobj.age\nobj.prop123\n\n// 限制：\n// 1. 属性名必须是有效标识符\n// 2. 不能包含特殊字符\n// 3. 不能以数字开头\nobj.my-prop  // 错误\nobj.123      // 错误"
          },
          {
            "title": "方括号访问",
            "code": "obj['name']\nobj['my-prop']  // 可以包含特殊字符\nobj['123']      // 可以数字开头\n\n// 动态属性\nconst key = 'age';\nobj[key]        // 'age'属性\n\nobj[getName()]  // 函数返回值作为属性名"
          },
          {
            "title": "性能对比",
            "code": "// 性能几乎相同\n// 现代JS引擎会优化\n\n// 但点号访问在代码压缩时更好\nobj.name  // 可以被压缩工具缩短\nobj['name'] // 字符串不会被压缩"
          }
        ]
      },
      "source": "属性访问"
    },
    {
      "difficulty": "medium",
      "tags": ["可选链"],
      "question": "可选链操作符（?.）的作用是什么？",
      "options": [
        "安全访问可能为null/undefined的属性，避免报错",
        "必须使用",
        "性能更好",
        "只是语法糖"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "可选链（Optional Chaining）：",
        "sections": [
          {
            "title": "基本用法",
            "code": "// 传统方式\nconst name = user && user.profile && user.profile.name;\n\n// 可选链（ES2020）\nconst name = user?.profile?.name;\n\n// 如果user或profile为null/undefined，返回undefined\n// 而不是抛出TypeError"
          },
          {
            "title": "三种形式",
            "code": "// 1. 属性访问\nobj?.prop\n\n// 2. 数组访问\narr?.[0]\n\n// 3. 函数调用\nfunc?.()\n\n// 组合使用\nuser?.getName?.()"
          },
          {
            "title": "短路求值",
            "code": "let count = 0;\nconst value = null?.prop[count++];\nconsole.log(count); // 0\n// null?. 短路，后面不执行"
          },
          {
            "title": "注意事项",
            "code": "// 只检查null/undefined\n0?.toString()    // '0'\nfalse?.toString() // 'false'\n''?.length       // 0\n\n// 不能用于赋值\nobj?.prop = 5;   // SyntaxError"
          }
        ]
      },
      "source": "可选链"
    },
    {
      "difficulty": "medium",
      "tags": ["函数表达式"],
      "question": "函数表达式和函数声明有什么区别？",
      "options": [
        "函数声明会提升，函数表达式不会；函数表达式可以匿名",
        "完全相同",
        "函数表达式性能更好",
        "函数声明不能有名字"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "函数表达式 vs 函数声明：",
        "sections": [
          {
            "title": "函数声明",
            "code": "// 会提升\nfoo(); // 可以调用\n\nfunction foo() {\n  console.log('foo');\n}\n\n// 必须有名字\nfunction () {} // SyntaxError"
          },
          {
            "title": "函数表达式",
            "code": "// 不会提升\nbar(); // ReferenceError\n\nconst bar = function() {\n  console.log('bar');\n};\n\n// 可以匿名\nconst fn = function() {};\n\n// 也可以命名（用于递归和调试）\nconst factorial = function fac(n) {\n  return n < 2 ? 1 : n * fac(n - 1);\n};"
          },
          {
            "title": "箭头函数表达式",
            "code": "const add = (a, b) => a + b;\n\n// 总是匿名\n// 没有自己的this\n// 不能用作构造函数"
          },
          {
            "title": "IIFE（立即执行函数表达式）",
            "code": "(function() {\n  console.log('IIFE');\n})();\n\n// 或\n(function() {\n  console.log('IIFE');\n}());"
          }
        ]
      },
      "source": "函数表达式"
    },
    {
      "difficulty": "hard",
      "tags": ["解构表达式"],
      "question": "解构赋值表达式的返回值是什么？",
      "options": [
        "返回右侧的完整对象/数组，而不是解构后的值",
        "返回解构后的值",
        "返回undefined",
        "返回第一个值"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "解构赋值的返回值：",
        "sections": [
          {
            "title": "返回右侧值",
            "code": "let a, b;\nconst result = { a, b } = { a: 1, b: 2 };\n\nconsole.log(result); // { a: 1, b: 2 }\nconsole.log(a);      // 1\nconsole.log(b);      // 2"
          },
          {
            "title": "链式解构",
            "code": "let a, b, c, d;\nconst obj = {\n  a: { c } = { c: 3 },\n  b: { d } = { d: 4 }\n} = { a: { c: 1 }, b: { d: 2 } };\n\nconsole.log(c); // 1\nconsole.log(d); // 2"
          },
          {
            "title": "实际应用",
            "code": "// 函数参数默认值\nfunction fn({ x, y } = { x: 0, y: 0 }) {\n  return x + y;\n}\n\n// 条件解构\nlet user;\nif ((user = getUser()) && user.name) {\n  console.log(user.name);\n}"
          }
        ]
      },
      "source": "解构表达式"
    },
    {
      "difficulty": "hard",
      "tags": ["表达式副作用"],
      "question": "哪些表达式有副作用（Side Effects）？",
      "options": [
        "赋值、函数调用、递增递减、delete等",
        "所有表达式都有副作用",
        "没有表达式有副作用",
        "只有赋值有副作用"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "表达式副作用：",
        "sections": [
          {
            "title": "有副作用的表达式",
            "code": "// 1. 赋值\nx = 5;              // 改变x的值\nobj.prop = 10;      // 改变obj\n\n// 2. 递增递减\nx++;                // 改变x\n++y;                // 改变y\n\n// 3. 函数调用\nfunc();             // 可能改变外部状态\nconsole.log(x);     // 输出\n\n// 4. delete\ndelete obj.prop;    // 删除属性\n\n// 5. new\nnew MyClass();      // 创建对象"
          },
          {
            "title": "无副作用的表达式（纯表达式）",
            "code": "1 + 2               // 纯计算\nx > 5               // 纯比较\n'hello'.length      // 纯访问\nMath.max(1, 2)      // 纯函数"
          },
          {
            "title": "副作用的影响",
            "code": "// 求值顺序很重要\nlet x = 1;\nconst result = (x++, x++, x);\nconsole.log(result); // 3\nconsole.log(x);      // 3\n\n// 短路求值避免副作用\nfalse && func();    // func不会执行\ntrue || func();     // func不会执行"
          }
        ]
      },
      "source": "副作用"
    },
    {
      "difficulty": "hard",
      "tags": ["模板字面量"],
      "question": "标签模板（Tagged Templates）的作用是什么？",
      "options": [
        "自定义模板字符串的处理逻辑，用于国际化、SQL查询等",
        "只是装饰",
        "性能优化",
        "没有实际用途"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "标签模板：",
        "sections": [
          {
            "title": "基本语法",
            "code": "function tag(strings, ...values) {\n  console.log(strings); // ['Hello ', ' world ', '']\n  console.log(values);  // ['beautiful', '!']\n  return 'processed';\n}\n\nconst result = tag`Hello ${'beautiful'} world ${'!'}`;\nconsole.log(result); // 'processed'"
          },
          {
            "title": "实际应用 - SQL查询",
            "code": "function sql(strings, ...values) {\n  // 防止SQL注入\n  const escaped = values.map(v => {\n    if (typeof v === 'string') {\n      return `'${v.replace(/'/g, \"''\")}'`;\n    }\n    return v;\n  });\n  \n  let query = strings[0];\n  escaped.forEach((val, i) => {\n    query += val + strings[i + 1];\n  });\n  \n  return query;\n}\n\nconst user = \"O'Brien\";\nconst query = sql`SELECT * FROM users WHERE name = ${user}`;\n// SELECT * FROM users WHERE name = 'O''Brien'"
          },
          {
            "title": "实际应用 - 国际化",
            "code": "function i18n(strings, ...values) {\n  const translations = {\n    'Hello {0}!': '你好 {0}！'\n  };\n  \n  const key = strings.join('{' + (strings.length - 2) + '}');\n  let result = translations[key] || key;\n  \n  values.forEach((val, i) => {\n    result = result.replace(`{${i}}`, val);\n  });\n  \n  return result;\n}\n\nconst name = 'John';\nconsole.log(i18n`Hello ${name}!`); // '你好 John！'"
          },
          {
            "title": "实际应用 - 样式化",
            "code": "// styled-components 原理\nfunction styled(strings, ...values) {\n  return function(props) {\n    let css = strings[0];\n    values.forEach((val, i) => {\n      css += (typeof val === 'function' ? val(props) : val);\n      css += strings[i + 1];\n    });\n    return css;\n  };\n}\n\nconst Button = styled`\n  color: ${props => props.primary ? 'blue' : 'gray'};\n  font-size: 16px;\n`;\n\nconsole.log(Button({ primary: true }));\n// 'color: blue; font-size: 16px;'"
          }
        ]
      },
      "source": "标签模板"
    },
    {
      "difficulty": "hard",
      "tags": ["表达式求值"],
      "question": "表达式求值的顺序是什么？",
      "options": [
        "先求值操作数（按从左到右），再应用运算符（按优先级）",
        "完全按优先级",
        "完全从左到右",
        "随机顺序"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "表达式求值顺序：",
        "sections": [
          {
            "title": "操作数求值（左到右）",
            "code": "function a() { console.log('a'); return 1; }\nfunction b() { console.log('b'); return 2; }\nfunction c() { console.log('c'); return 3; }\n\nconst result = a() + b() * c();\n// 输出顺序：a, b, c\n// 计算顺序：b() * c() = 6, a() + 6 = 7"
          },
          {
            "title": "短路求值",
            "code": "let called = false;\nfunction fn() {\n  called = true;\n  return true;\n}\n\nfalse && fn();  // fn不会执行\ntrue || fn();   // fn不会执行\n\nconsole.log(called); // false"
          },
          {
            "title": "逗号运算符",
            "code": "let x = (console.log('1'), console.log('2'), 3);\n// 输出：1, 2\n// x = 3\n\n// 从左到右求值，返回最后一个"
          },
          {
            "title": "函数参数",
            "code": "function log(...args) {\n  console.log(args);\n}\n\nfunction a() { console.log('a'); return 1; }\nfunction b() { console.log('b'); return 2; }\n\nlog(a(), b());\n// 输出：a, b, [1, 2]\n// 参数从左到右求值"
          }
        ]
      },
      "source": "求值顺序"
    }
  ],
  "navigation": {
    "prev": {
      "title": "运算符",
      "url": "02-operators.html"
    },
    "next": {
      "title": "条件语句",
      "url": "03-conditionals.html"
    }
  }
};
