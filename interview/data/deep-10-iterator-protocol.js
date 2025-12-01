window.quizData_Deep10 = {
  "config": {
    "title": "迭代器协议",
    "icon": "🔄",
    "description": "深入理解JavaScript迭代器协议的原理与应用",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    {
      "difficulty": "easy",
      "tags": ["迭代器协议"],
      "question": "什么是迭代器协议（Iterator Protocol）？一个对象需要实现什么才能成为迭代器？",
      "options": [
        "必须有next()方法，返回{value, done}对象；done为true表示迭代结束",
        "必须有forEach()方法",
        "必须是数组或类数组对象",
        "必须继承自Iterator类"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "迭代器协议核心要求：",
        "sections": [
          {
            "title": "1. 必须实现next()方法",
            "code": "const iterator = {\n  current: 0,\n  next() {\n    if (this.current < 3) {\n      return { value: this.current++, done: false };\n    }\n    return { value: undefined, done: true };\n  }\n};\n\nconsole.log(iterator.next()); // {value: 0, done: false}\nconsole.log(iterator.next()); // {value: 1, done: false}\nconsole.log(iterator.next()); // {value: 2, done: false}\nconsole.log(iterator.next()); // {value: undefined, done: true}"
          },
          {
            "title": "2. 返回值规范",
            "points": [
              "value：当前迭代值",
              "done：布尔值，true表示迭代完成",
              "done为true时，value通常为undefined"
            ]
          }
        ]
      },
      "source": "迭代器协议"
    },
    {
      "difficulty": "easy",
      "tags": ["可迭代协议"],
      "question": "什么是可迭代协议（Iterable Protocol）？对象如何实现可迭代？",
      "options": [
        "必须实现[Symbol.iterator]方法，返回一个迭代器对象",
        "必须实现iterator()方法",
        "必须是数组类型",
        "必须有length属性"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "可迭代协议实现：",
        "sections": [
          {
            "title": "实现[Symbol.iterator]方法",
            "code": "const iterable = {\n  data: [1, 2, 3],\n  [Symbol.iterator]() {\n    let index = 0;\n    const data = this.data;\n    return {\n      next() {\n        if (index < data.length) {\n          return { value: data[index++], done: false };\n        }\n        return { value: undefined, done: true };\n      }\n    };\n  }\n};\n\n// 可用于for...of\nfor (const item of iterable) {\n  console.log(item); // 1, 2, 3\n}\n\n// 可用于展开运算符\nconsole.log([...iterable]); // [1, 2, 3]"
          },
          {
            "title": "内置可迭代对象",
            "points": [
              "Array、String、Map、Set、arguments",
              "NodeList、HTMLCollection",
              "TypedArray"
            ]
          }
        ]
      },
      "source": "可迭代协议"
    },
    {
      "difficulty": "medium",
      "tags": ["迭代器实现"],
      "question": "如何手动实现一个Range迭代器，生成指定范围的数字序列？",
      "options": [
        "实现[Symbol.iterator]方法，返回包含next()的对象，通过闭包维护状态",
        "使用Array.from()生成数组",
        "必须使用生成器函数",
        "无法手动实现"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "Range迭代器实现：",
        "code": "function range(start, end, step = 1) {\n  return {\n    [Symbol.iterator]() {\n      let current = start;\n      return {\n        next() {\n          if (current < end) {\n            const value = current;\n            current += step;\n            return { value, done: false };\n          }\n          return { value: undefined, done: true };\n        }\n      };\n    }\n  };\n}\n\n// 使用示例\nfor (const num of range(1, 5)) {\n  console.log(num); // 1, 2, 3, 4\n}\n\nconsole.log([...range(0, 10, 2)]); // [0, 2, 4, 6, 8]\n\n// 无限迭代器\nfunction infiniteRange(start = 0, step = 1) {\n  return {\n    [Symbol.iterator]() {\n      let current = start;\n      return {\n        next() {\n          const value = current;\n          current += step;\n          return { value, done: false }; // 永不结束\n        }\n      };\n    }\n  };\n}"
      },
      "source": "迭代器实现"
    },
    {
      "difficulty": "medium",
      "tags": ["迭代器与for...of"],
      "question": "for...of循环与迭代器的关系是什么？它如何工作？",
      "options": [
        "for...of自动调用对象的[Symbol.iterator]()获取迭代器，然后循环调用next()直到done为true",
        "for...of只能用于数组",
        "for...of与迭代器无关",
        "for...of使用索引访问"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "for...of工作原理：",
        "sections": [
          {
            "title": "1. 内部执行流程",
            "code": "// for...of循环\nfor (const item of iterable) {\n  console.log(item);\n}\n\n// 等价于\nconst iterator = iterable[Symbol.iterator]();\nlet result = iterator.next();\nwhile (!result.done) {\n  const item = result.value;\n  console.log(item);\n  result = iterator.next();\n}"
          },
          {
            "title": "2. 提前终止",
            "code": "for (const item of [1, 2, 3, 4, 5]) {\n  if (item === 3) break; // 可以提前终止\n  console.log(item); // 1, 2\n}\n\n// 迭代器会被正确关闭"
          },
          {
            "title": "3. 与其他循环对比",
            "points": [
              "for...in：遍历对象的可枚举属性",
              "for...of：遍历可迭代对象的值",
              "forEach：数组方法，无法break/continue"
            ]
          }
        ]
      },
      "source": "for...of循环"
    },
    {
      "difficulty": "medium",
      "tags": ["迭代器应用"],
      "question": "哪些JavaScript特性和API依赖迭代器协议？",
      "options": [
        "for...of、展开运算符、解构赋值、Array.from()、Promise.all()、yield*等",
        "只有for...of循环",
        "只有数组方法",
        "所有循环语句"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "依赖迭代器协议的特性：",
        "sections": [
          {
            "title": "1. 展开运算符",
            "code": "const set = new Set([1, 2, 3]);\nconsole.log([...set]); // [1, 2, 3]\n\nconst str = 'hello';\nconsole.log([...str]); // ['h','e','l','l','o']"
          },
          {
            "title": "2. 解构赋值",
            "code": "const map = new Map([['a', 1], ['b', 2]]);\nconst [[key1, val1], [key2, val2]] = map;\nconsole.log(key1, val1); // 'a', 1"
          },
          {
            "title": "3. Array.from()",
            "code": "const set = new Set([1, 2, 3]);\nconst arr = Array.from(set);\nconsole.log(arr); // [1, 2, 3]"
          },
          {
            "title": "4. yield*委托",
            "code": "function* generator() {\n  yield* [1, 2, 3]; // 委托给数组的迭代器\n}\nconsole.log([...generator()]); // [1, 2, 3]"
          }
        ]
      },
      "source": "迭代器应用"
    },
    {
      "difficulty": "medium",
      "tags": ["返回迭代器"],
      "question": "迭代器的return()方法有什么作用？什么时候会被调用？",
      "options": [
        "用于提前终止迭代并清理资源；在break、return、throw时自动调用",
        "用于返回迭代器对象",
        "用于重置迭代器",
        "没有实际作用"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "return()方法详解：",
        "sections": [
          {
            "title": "1. 基本用法",
            "code": "const iterable = {\n  [Symbol.iterator]() {\n    let count = 0;\n    return {\n      next() {\n        return { value: count++, done: count > 5 };\n      },\n      return() {\n        console.log('迭代器被提前关闭');\n        return { done: true };\n      }\n    };\n  }\n};\n\nfor (const num of iterable) {\n  console.log(num);\n  if (num === 2) break; // 触发return()\n}\n// 输出：0, 1, 2, '迭代器被提前关闭'"
          },
          {
            "title": "2. 触发时机",
            "points": [
              "for...of中使用break、return、throw",
              "解构赋值未完全展开",
              "展开运算符遇到错误"
            ]
          },
          {
            "title": "3. 资源清理示例",
            "code": "function* fileReader(filename) {\n  const file = openFile(filename);\n  try {\n    while (true) {\n      yield readLine(file);\n    }\n  } finally {\n    closeFile(file); // return()触发时执行清理\n  }\n}"
          }
        ]
      },
      "source": "return()方法"
    },
    {
      "difficulty": "hard",
      "tags": ["迭代器复用"],
      "question": "迭代器对象可以被多次遍历吗？如何实现可重复遍历？",
      "options": [
        "迭代器本身不可重复遍历；可迭代对象每次调用[Symbol.iterator]()返回新迭代器实现重复遍历",
        "迭代器可以无限次重复使用",
        "使用reset()方法重置",
        "所有迭代器都自动支持重复遍历"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "迭代器复用机制：",
        "sections": [
          {
            "title": "1. 迭代器不可复用",
            "code": "const arr = [1, 2, 3];\nconst iterator = arr[Symbol.iterator]();\n\n// 第一次遍历\nfor (const item of iterator) {\n  console.log(item); // 1, 2, 3\n}\n\n// 第二次遍历（无输出，已耗尽）\nfor (const item of iterator) {\n  console.log(item); // 无输出\n}"
          },
          {
            "title": "2. 可迭代对象可复用",
            "code": "const arr = [1, 2, 3];\n\n// 第一次遍历\nfor (const item of arr) {\n  console.log(item); // 1, 2, 3\n}\n\n// 第二次遍历（正常）\nfor (const item of arr) {\n  console.log(item); // 1, 2, 3\n}\n\n// 因为每次都创建新迭代器"
          },
          {
            "title": "3. 实现可重复遍历的迭代器",
            "code": "function createReusableIterator(data) {\n  return {\n    [Symbol.iterator]() {\n      let index = 0;\n      return {\n        next() {\n          if (index < data.length) {\n            return { value: data[index++], done: false };\n          }\n          return { value: undefined, done: true };\n        }\n      };\n    }\n  };\n}\n\nconst reusable = createReusableIterator([1, 2, 3]);\nconsole.log([...reusable]); // [1, 2, 3]\nconsole.log([...reusable]); // [1, 2, 3]"
          }
        ]
      },
      "source": "迭代器复用"
    },
    {
      "difficulty": "hard",
      "tags": ["自定义迭代器"],
      "question": "如何实现一个链表（LinkedList）的迭代器？",
      "options": [
        "通过[Symbol.iterator]返回迭代器，使用指针遍历节点，next()返回当前节点值并移动指针",
        "直接使用数组的迭代器",
        "链表无法实现迭代器",
        "必须先转换为数组"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "链表迭代器实现：",
        "code": "class LinkedListNode {\n  constructor(value) {\n    this.value = value;\n    this.next = null;\n  }\n}\n\nclass LinkedList {\n  constructor() {\n    this.head = null;\n    this.tail = null;\n  }\n\n  append(value) {\n    const node = new LinkedListNode(value);\n    if (!this.head) {\n      this.head = node;\n      this.tail = node;\n    } else {\n      this.tail.next = node;\n      this.tail = node;\n    }\n    return this;\n  }\n\n  // 实现迭代器协议\n  [Symbol.iterator]() {\n    let current = this.head;\n    return {\n      next() {\n        if (current) {\n          const value = current.value;\n          current = current.next;\n          return { value, done: false };\n        }\n        return { value: undefined, done: true };\n      }\n    };\n  }\n}\n\n// 使用示例\nconst list = new LinkedList();\nlist.append(1).append(2).append(3);\n\nfor (const item of list) {\n  console.log(item); // 1, 2, 3\n}\n\nconsole.log([...list]); // [1, 2, 3]\n\n// 解构\nconst [first, second] = list;\nconsole.log(first, second); // 1, 2"
      },
      "source": "自定义迭代器"
    },
    {
      "difficulty": "hard",
      "tags": ["迭代器组合"],
      "question": "如何实现迭代器的组合和转换（map、filter等）？",
      "options": [
        "创建新迭代器包装原迭代器，在next()中应用转换逻辑",
        "必须先转为数组再操作",
        "无法实现",
        "使用Array.prototype方法"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "迭代器组合实现：",
        "sections": [
          {
            "title": "1. map实现",
            "code": "function map(iterable, mapFn) {\n  return {\n    [Symbol.iterator]() {\n      const iterator = iterable[Symbol.iterator]();\n      return {\n        next() {\n          const { value, done } = iterator.next();\n          if (done) return { done: true };\n          return {\n            value: mapFn(value),\n            done: false\n          };\n        }\n      };\n    }\n  };\n}\n\nconst numbers = [1, 2, 3];\nconst doubled = map(numbers, x => x * 2);\nconsole.log([...doubled]); // [2, 4, 6]"
          },
          {
            "title": "2. filter实现",
            "code": "function filter(iterable, predicate) {\n  return {\n    [Symbol.iterator]() {\n      const iterator = iterable[Symbol.iterator]();\n      return {\n        next() {\n          while (true) {\n            const { value, done } = iterator.next();\n            if (done) return { done: true };\n            if (predicate(value)) {\n              return { value, done: false };\n            }\n          }\n        }\n      };\n    }\n  };\n}\n\nconst numbers = [1, 2, 3, 4, 5];\nconst evens = filter(numbers, x => x % 2 === 0);\nconsole.log([...evens]); // [2, 4]"
          },
          {
            "title": "3. 链式调用",
            "code": "const result = map(\n  filter([1, 2, 3, 4, 5], x => x % 2 === 0),\n  x => x * 2\n);\nconsole.log([...result]); // [4, 8]"
          }
        ]
      },
      "source": "迭代器组合"
    },
    {
      "difficulty": "hard",
      "tags": ["异步迭代器"],
      "question": "什么是异步迭代器（Async Iterator）？与普通迭代器有何区别？",
      "options": [
        "使用[Symbol.asyncIterator]和async next()，返回Promise<{value,done}>；用for await...of遍历",
        "与普通迭代器完全相同",
        "只能在async函数中使用",
        "不存在异步迭代器"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "异步迭代器详解：",
        "sections": [
          {
            "title": "1. 异步迭代器实现",
            "code": "const asyncIterable = {\n  async *[Symbol.asyncIterator]() {\n    yield await Promise.resolve(1);\n    yield await Promise.resolve(2);\n    yield await Promise.resolve(3);\n  }\n};\n\n// 使用for await...of\nasync function consume() {\n  for await (const num of asyncIterable) {\n    console.log(num); // 1, 2, 3\n  }\n}\n\nconsume();"
          },
          {
            "title": "2. 手动实现",
            "code": "const asyncRange = {\n  [Symbol.asyncIterator]() {\n    let i = 0;\n    return {\n      async next() {\n        if (i < 3) {\n          await new Promise(resolve => setTimeout(resolve, 1000));\n          return { value: i++, done: false };\n        }\n        return { done: true };\n      }\n    };\n  }\n};"
          },
          {
            "title": "3. 实际应用场景",
            "points": [
              "分页数据获取",
              "流式数据处理",
              "WebSocket消息",
              "数据库游标"
            ]
          }
        ]
      },
      "source": "异步迭代器"
    }
  ],
  "navigation": {
    "prev": {
      "title": "隐式转换",
      "url": "09-implicit-conversion.html"
    },
    "next": {
      "title": "生成器函数",
      "url": "11-generator-function.html"
    }
  }
};
