/**
 * 生成器基础
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1702GeneratorBasic = {
  "config": {
    "title": "生成器基础",
    "icon": "⚡",
    "description": "深入理解生成器函数的语法和执行机制",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["生成器"],
      "question": "生成器函数的定义语法是什么？",
      "options": [
        "function* name() {}",
        "function name*() {}",
        "generator function name() {}",
        "function name() yield {}"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "生成器语法",
        "code": "// 生成器函数定义\nfunction* generatorFn() {\n  yield 1;\n  yield 2;\n  yield 3;\n}\n\n// 调用生成器函数返回生成器对象\nconst gen = generatorFn();\n\n// 生成器对象是迭代器\ngen.next();  // {value: 1, done: false}\ngen.next();  // {value: 2, done: false}\ngen.next();  // {value: 3, done: false}\ngen.next();  // {value: undefined, done: true}\n\n// 其他写法\nconst obj = {\n  *gen() { yield 1; }  // 方法简写\n};\n\nconst gen2 = function* () {};  // 函数表达式"
      },
      "source": "生成器"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["yield"],
      "question": "以下代码的输出是什么？",
      "code": "function* gen() {\n  console.log('1');\n  yield 'a';\n  console.log('2');\n  yield 'b';\n  console.log('3');\n}\n\nconst g = gen();\nconsole.log('start');\ng.next();\ng.next();",
      "options": [
        "start, 1, 2",
        "1, 2, 3, start",
        "start, 1, 2, 3",
        "1, start, 2"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "生成器执行流程",
        "code": "function* gen() {\n  console.log('1');  // 第1次next执行\n  yield 'a';         // 暂停\n  console.log('2');  // 第2次next执行\n  yield 'b';         // 暂停\n  console.log('3');  // 第3次next执行\n}\n\nconst g = gen();  // 不执行函数体\nconsole.log('start');  // 输出: start\n\ng.next();  // 输出: 1, 返回{value: 'a', done: false}\ng.next();  // 输出: 2, 返回{value: 'b', done: false}\ng.next();  // 输出: 3, 返回{value: undefined, done: true}\n\n// 执行顺序: start → 1 → 2"
      },
      "source": "执行流程"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["yield"],
      "question": "关于yield说法正确的是？",
      "options": [
        "yield会暂停函数执行",
        "yield可以返回值",
        "yield可以接收传入的值",
        "yield只能在生成器中使用",
        "yield后面可以跟表达式",
        "yield可以嵌套使用"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "yield特性",
        "code": "function* gen() {\n  // 1. yield返回值\n  yield 1;\n  \n  // 2. yield接收值\n  const x = yield 2;\n  console.log('received:', x);\n  \n  // 3. yield后跟表达式\n  yield 1 + 2;\n  \n  // 4. yield*委托\n  yield* [4, 5, 6];\n}\n\nconst g = gen();\ng.next();      // {value: 1, done: false}\ng.next();      // {value: 2, done: false}\ng.next(100);   // 输出: received: 100\n               // {value: 3, done: false}\ng.next();      // {value: 4, done: false}\n\n// ❌ yield只能在生成器中\nfunction normal() {\n  yield 1;  // SyntaxError\n}"
      },
      "source": "yield"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["生成器对象"],
      "question": "生成器函数调用后立即执行函数体",
      "correctAnswer": "B",
      "explanation": {
        "title": "惰性执行",
        "code": "function* gen() {\n  console.log('执行了');\n  yield 1;\n}\n\n// 调用生成器函数不执行函数体\nconst g = gen();  // 不输出任何东西\n\n// 第一次调用next()才执行\ng.next();  // 输出: 执行了\n\n// 生成器是惰性的\nfunction* lazy() {\n  console.log('第1段');\n  yield 1;\n  console.log('第2段');\n  yield 2;\n}\n\nconst l = lazy();  // 什么都不执行\nl.next();  // 输出: 第1段\nl.next();  // 输出: 第2段"
      },
      "source": "惰性执行"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["next传参"],
      "question": "通过next传值，空白处填什么？",
      "code": "function* gen() {\n  const a = yield 1;\n  const b = yield a + 2;\n  return a + b;\n}\n\nconst g = gen();\ng.next();\ng.next(10);\nconst result = g.next(20);\nconsole.log(result.value);  // ?",
      "options": [
        "30",
        "32",
        "22",
        "undefined"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "next()传参机制",
        "code": "function* gen() {\n  const a = yield 1;      // a接收第2次next的参数\n  const b = yield a + 2;  // b接收第3次next的参数\n  return a + b;\n}\n\nconst g = gen();\n\n// 第1次next：启动，不传参\ng.next();  // {value: 1, done: false}\n\n// 第2次next：传入10给a\ng.next(10);  // a=10, {value: 12, done: false}\n\n// 第3次next：传入20给b\nconst result = g.next(20);  // b=20\nconsole.log(result.value);  // 30 (a+b=10+20)\n\n// 注意：\n// 1. 第1次next的参数会被忽略\n// 2. 第n次next的参数是第n-1个yield的返回值"
      },
      "source": "next传参"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["yield*"],
      "question": "以下代码的输出是什么？",
      "code": "function* inner() {\n  yield 2;\n  yield 3;\n}\n\nfunction* outer() {\n  yield 1;\n  yield* inner();\n  yield 4;\n}\n\nconsole.log([...outer()]);",
      "options": [
        "[1, 2, 3, 4]",
        "[1, [2, 3], 4]",
        "[1, inner(), 4]",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "yield*委托",
        "code": "function* inner() {\n  yield 2;\n  yield 3;\n}\n\nfunction* outer() {\n  yield 1;\n  yield* inner();  // 委托给inner\n  yield 4;\n}\n\n// yield*会展开内部生成器\nconsole.log([...outer()]);  // [1, 2, 3, 4]\n\n// 等价于\nfunction* outer2() {\n  yield 1;\n  for (let value of inner()) {\n    yield value;\n  }\n  yield 4;\n}\n\n// yield*可以委托任何可迭代对象\nfunction* gen() {\n  yield* [1, 2, 3];    // 数组\n  yield* 'hi';         // 字符串\n  yield* new Set([4]); // Set\n}"
      },
      "source": "yield*"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["return方法"],
      "question": "生成器的return()方法会？",
      "options": [
        "终止生成器",
        "返回传入的值",
        "设置done为true",
        "可以在finally中执行清理",
        "删除生成器对象",
        "重置生成器状态"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "生成器的return方法",
        "code": "function* gen() {\n  try {\n    yield 1;\n    yield 2;\n    yield 3;\n  } finally {\n    console.log('清理');\n  }\n}\n\nconst g = gen();\ng.next();  // {value: 1, done: false}\n\n// 调用return终止生成器\nconst result = g.return('结束');\nconsole.log(result);  // {value: '结束', done: true}\n// 输出: 清理\n\n// 后续调用都返回done: true\ng.next();  // {value: undefined, done: true}\n\n// 没有参数时\ng.return();  // {value: undefined, done: true}"
      },
      "source": "return方法"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["throw方法"],
      "question": "生成器的throw()方法可以在暂停处抛出错误",
      "correctAnswer": "A",
      "explanation": {
        "title": "生成器的throw方法",
        "code": "function* gen() {\n  try {\n    yield 1;\n    yield 2;\n  } catch (e) {\n    console.log('捕获错误:', e);\n  }\n  yield 3;\n}\n\nconst g = gen();\ng.next();  // {value: 1, done: false}\n\n// 在yield处抛出错误\ng.throw(new Error('出错了'));\n// 输出: 捕获错误: Error: 出错了\n// 返回: {value: 3, done: false}\n\n// 如果没有try-catch\nfunction* gen2() {\n  yield 1;\n}\n\nconst g2 = gen2();\ng2.next();\ng2.throw(new Error('错误'));  // 未捕获的错误"
      },
      "source": "throw方法"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["生成器应用"],
      "question": "实现无限序列，空白处填什么？",
      "code": "function* fibonacci() {\n  let [a, b] = [0, 1];\n  while (true) {\n    yield a;\n    ______ = [b, a + b];\n  }\n}\n\nconst fib = fibonacci();\nfib.next().value;  // 0\nfib.next().value;  // 1\nfib.next().value;  // 1",
      "options": [
        "[a, b]",
        "[b, a]",
        "a, b",
        "b, a"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "生成器实现无限序列",
        "code": "// 斐波那契数列生成器\nfunction* fibonacci() {\n  let [a, b] = [0, 1];\n  while (true) {\n    yield a;\n    [a, b] = [b, a + b];  // 解构赋值\n  }\n}\n\nconst fib = fibonacci();\nfib.next().value;  // 0\nfib.next().value;  // 1\nfib.next().value;  // 1\nfib.next().value;  // 2\nfib.next().value;  // 3\n\n// 获取前n个\nfunction* take(n, iterable) {\n  let count = 0;\n  for (let value of iterable) {\n    if (count++ >= n) return;\n    yield value;\n  }\n}\n\nconst first10 = [...take(10, fibonacci())];\n// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]"
      },
      "source": "无限序列"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "生成器的最佳实践有哪些？",
      "options": [
        "用于惰性计算",
        "实现异步流程控制",
        "处理无限序列",
        "替代所有循环",
        "简化迭代器实现",
        "配合try-finally清理资源"
      ],
      "correctAnswer": ["A", "B", "C", "E", "F"],
      "explanation": {
        "title": "生成器最佳实践",
        "code": "// 1. 惰性计算\nfunction* range(start, end) {\n  for (let i = start; i < end; i++) {\n    yield i;  // 按需生成\n  }\n}\n\n// 2. 异步流程（配合co库）\nfunction* asyncFlow() {\n  const data = yield fetch('/api');\n  const result = yield process(data);\n  return result;\n}\n\n// 3. 无限序列\nfunction* randomNumbers() {\n  while (true) {\n    yield Math.random();\n  }\n}\n\n// 4. 简化迭代器\nconst obj = {\n  *[Symbol.iterator]() {\n    yield 1;\n    yield 2;\n  }\n};\n\n// 5. 资源清理\nfunction* withResource() {\n  const resource = acquire();\n  try {\n    yield resource;\n  } finally {\n    release(resource);  // 确保清理\n  }\n}"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "迭代器协议",
      "url": "17-01-iterator-protocol.html"
    },
    "next": {
      "title": "生成器高级应用",
      "url": "17-03-generator-advanced.html"
    }
  }
};
