/**
 * 迭代器协议
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Deep1701IteratorProtocol = {
  "config": {
    "title": "迭代器协议",
    "icon": "🔄",
    "description": "深入理解迭代器协议和可迭代对象的实现",
    "primaryColor": "#ec4899",
    "bgGradient": "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
  },
  "questions": [
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["迭代器协议"],
      "question": "迭代器对象必须实现什么方法？",
      "options": [
        "next()方法",
        "Symbol.iterator方法",
        "forEach()方法",
        "map()方法"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "迭代器协议",
        "code": "// 迭代器协议：对象必须有next()方法\nconst iterator = {\n  next() {\n    return {\n      value: 1,     // 当前值\n      done: false   // 是否完成\n    };\n  }\n};\n\n// next()返回结果对象\nconst result = iterator.next();\nconsole.log(result.value);  // 1\nconsole.log(result.done);   // false"
      },
      "source": "迭代器"
    },
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["可迭代协议"],
      "question": "关于可迭代协议说法正确的是？",
      "options": [
        "必须实现Symbol.iterator方法",
        "Symbol.iterator返回迭代器对象",
        "数组是可迭代对象",
        "字符串是可迭代对象",
        "对象默认是可迭代的",
        "Set和Map是可迭代的"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "可迭代协议",
        "code": "// 可迭代协议：对象有Symbol.iterator方法\nconst iterable = {\n  [Symbol.iterator]() {\n    return {  // 返回迭代器\n      next() {\n        return { value: 1, done: false };\n      }\n    };\n  }\n};\n\n// 内置可迭代对象\n// 1. Array\nconst arr = [1, 2, 3];\narr[Symbol.iterator];  // ✅\n\n// 2. String\nconst str = 'hello';\nstr[Symbol.iterator];  // ✅\n\n// 3. Set/Map\nconst set = new Set([1, 2]);\nset[Symbol.iterator];  // ✅\n\n// 4. 普通对象不可迭代\nconst obj = { x: 1 };\nobj[Symbol.iterator];  // undefined ❌"
      },
      "source": "可迭代协议"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["自定义迭代器"],
      "question": "以下代码的输出是什么？",
      "code": "const range = {\n  from: 1,\n  to: 3,\n  [Symbol.iterator]() {\n    return {\n      current: this.from,\n      last: this.to,\n      next() {\n        if (this.current <= this.last) {\n          return { value: this.current++, done: false };\n        }\n        return { done: true };\n      }\n    };\n  }\n};\n\nconsole.log([...range]);",
      "options": [
        "[1, 2, 3]",
        "[1, 2]",
        "[]",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "自定义迭代器",
        "code": "const range = {\n  from: 1,\n  to: 3,\n  [Symbol.iterator]() {\n    return {\n      current: this.from,\n      last: this.to,\n      next() {\n        if (this.current <= this.last) {\n          return { \n            value: this.current++, \n            done: false \n          };\n        }\n        return { done: true };\n      }\n    };\n  }\n};\n\n// 展开运算符会调用迭代器\nconsole.log([...range]);  // [1, 2, 3]\n\n// 也可以用for...of\nfor (let num of range) {\n  console.log(num);  // 1, 2, 3\n}"
      },
      "source": "自定义迭代器"
    },
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["for...of"],
      "question": "for...of循环可以遍历任何对象",
      "correctAnswer": "B",
      "explanation": {
        "title": "for...of要求可迭代",
        "code": "// for...of只能遍历可迭代对象\n\n// ✅ 可以遍历\nfor (let item of [1, 2, 3]) {}     // 数组\nfor (let char of 'hello') {}       // 字符串\nfor (let item of new Set()) {}     // Set\nfor (let [k,v] of new Map()) {}    // Map\n\n// ❌ 不能遍历普通对象\nconst obj = { x: 1, y: 2 };\nfor (let value of obj) {}  // TypeError\n\n// 解决方法：\n// 1. Object.keys/values/entries\nfor (let key of Object.keys(obj)) {}\nfor (let value of Object.values(obj)) {}\nfor (let [k,v] of Object.entries(obj)) {}\n\n// 2. 自定义Symbol.iterator\nobj[Symbol.iterator] = function* () {\n  for (let key in this) {\n    yield this[key];\n  }\n};\nfor (let value of obj) {}  // ✅"
      },
      "source": "for...of"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["迭代器实现"],
      "question": "实现计数器迭代器，空白处填什么？",
      "code": "function createCounter(max) {\n  let count = 0;\n  return {\n    next() {\n      if (count < max) {\n        return { value: ______, done: false };\n      }\n      return { done: true };\n    }\n  };\n}",
      "options": [
        "count++",
        "++count",
        "count",
        "max"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "迭代器状态管理",
        "code": "function createCounter(max) {\n  let count = 0;\n  return {\n    next() {\n      if (count < max) {\n        return { \n          value: count++,  // 先返回再自增\n          done: false \n        };\n      }\n      return { done: true };\n    }\n  };\n}\n\n// 使用\nconst counter = createCounter(3);\nconsole.log(counter.next());  // {value: 0, done: false}\nconsole.log(counter.next());  // {value: 1, done: false}\nconsole.log(counter.next());  // {value: 2, done: false}\nconsole.log(counter.next());  // {done: true}\n\n// 注意：迭代器是有状态的\nconst c2 = createCounter(2);\nc2.next();\nc2.next();\nc2.next();  // done: true\nc2.next();  // 仍然 done: true"
      },
      "source": "迭代器实现"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["展开运算符"],
      "question": "哪些操作会使用迭代器？",
      "options": [
        "展开运算符...",
        "for...of循环",
        "Array.from()",
        "解构赋值",
        "for...in循环",
        "Promise.all()"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "使用迭代器的操作",
        "code": "const iterable = new Set([1, 2, 3]);\n\n// 1. 展开运算符\nconst arr = [...iterable];  // [1, 2, 3]\n\n// 2. for...of\nfor (let item of iterable) {}\n\n// 3. Array.from()\nconst arr2 = Array.from(iterable);\n\n// 4. 解构赋值\nconst [a, b] = iterable;  // a=1, b=2\n\n// 5. Promise.all/race/allSettled\nPromise.all(iterable);\n\n// 6. new Set/Map\nnew Set(iterable);\nnew Map([[1,'a'], [2,'b']]);\n\n// ❌ for...in不使用迭代器\nfor (let key in obj) {}  // 遍历可枚举属性"
      },
      "source": "迭代器使用"
    },
    {
      "type": "code-output",
      "difficulty": "hard",
      "tags": ["迭代器返回"],
      "question": "以下代码的输出是什么？",
      "code": "const arr = [1, 2, 3];\nconst iter = arr[Symbol.iterator]();\n\nconsole.log(iter.next().value);\nconsole.log(iter.next().value);\nconsole.log([...iter]);",
      "options": [
        "1, 2, [3]",
        "1, 2, [1, 2, 3]",
        "1, 2, []",
        "报错"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "迭代器状态",
        "code": "const arr = [1, 2, 3];\nconst iter = arr[Symbol.iterator]();\n\n// 第一次调用\nconsole.log(iter.next().value);  // 1\n\n// 第二次调用\nconsole.log(iter.next().value);  // 2\n\n// 展开剩余元素\nconsole.log([...iter]);  // [3]\n\n// 迭代器已耗尽\nconsole.log([...iter]);  // []\n\n// 重新获取迭代器\nconst iter2 = arr[Symbol.iterator]();\nconsole.log([...iter2]);  // [1, 2, 3]"
      },
      "source": "迭代器状态"
    },
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["return方法"],
      "question": "迭代器可以有return()方法用于提前终止",
      "correctAnswer": "A",
      "explanation": {
        "title": "迭代器的return方法",
        "code": "const iterable = {\n  [Symbol.iterator]() {\n    let count = 0;\n    return {\n      next() {\n        return { \n          value: count++, \n          done: count > 3 \n        };\n      },\n      return() {\n        console.log('清理资源');\n        return { done: true };\n      }\n    };\n  }\n};\n\n// return()在提前退出时调用\nfor (let item of iterable) {\n  console.log(item);\n  if (item === 1) break;  // 触发return()\n}\n// 输出: 0, 1, '清理资源'\n\n// throw()方法用于错误处理\nconst iter = {\n  next() { return { value: 1, done: false }; },\n  throw(e) {\n    console.log('错误:', e);\n    return { done: true };\n  }\n};"
      },
      "source": "return方法"
    },
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["可迭代可迭代器"],
      "question": "实现既是可迭代对象又是迭代器，空白处填什么？",
      "code": "function createIterableIterator() {\n  let count = 0;\n  return {\n    next() {\n      return { value: count++, done: count > 3 };\n    },\n    [Symbol.iterator]() {\n      return ______;\n    }\n  };\n}",
      "options": [
        "this",
        "createIterableIterator()",
        "{ next: this.next }",
        "new Iterator()"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "可迭代的迭代器",
        "code": "// 对象既是迭代器，又是可迭代的\nfunction createIterableIterator() {\n  let count = 0;\n  return {\n    next() {\n      return { \n        value: count++, \n        done: count > 3 \n      };\n    },\n    [Symbol.iterator]() {\n      return this;  // 返回自身\n    }\n  };\n}\n\nconst iter = createIterableIterator();\n\n// 既可以直接调用next\niter.next();  // {value: 0, done: false}\n\n// 也可以用for...of\nfor (let value of iter) {\n  console.log(value);  // 1, 2\n}\n\n// 内置迭代器都是这样\nconst arrIter = [1,2,3][Symbol.iterator]();\narrIter[Symbol.iterator]() === arrIter;  // true"
      },
      "source": "可迭代迭代器"
    },
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["最佳实践"],
      "question": "迭代器的最佳实践有哪些？",
      "options": [
        "实现return()方法清理资源",
        "返回{done: true}后仍可继续调用next",
        "迭代器应该是幂等的",
        "Symbol.iterator应返回新迭代器",
        "避免修改迭代过程中的集合",
        "使用生成器简化实现"
      ],
      "correctAnswer": ["A", "D", "E", "F"],
      "explanation": {
        "title": "迭代器最佳实践",
        "code": "// 1. 实现return()清理资源\nconst iter1 = {\n  next() { /* ... */ },\n  return() {\n    // 关闭文件、释放资源等\n    return { done: true };\n  }\n};\n\n// 2. Symbol.iterator返回新迭代器\nconst iterable = {\n  [Symbol.iterator]() {\n    let count = 0;\n    return {  // 每次返回新的\n      next() {\n        return { value: count++, done: count > 3 };\n      }\n    };\n  }\n};\n\n// 可以多次迭代\n[...iterable];  // [0, 1, 2]\n[...iterable];  // [0, 1, 2]\n\n// 3. 避免在迭代中修改\nconst arr = [1, 2, 3];\nfor (let item of arr) {\n  // arr.push(4);  // ❌ 不好\n}\n\n// 4. 使用生成器\nfunction* simpleIterator() {\n  yield 1;\n  yield 2;\n  yield 3;\n}  // 比手写next简单得多"
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "装箱与拆箱",
      "url": "16-03-boxing.html"
    },
    "next": {
      "title": "生成器基础",
      "url": "17-02-generator-basic.html"
    }
  }
};
