/**
 * DOM 基础操作
 * 包含多种题型：单选、代码输出、多选、判断、代码补全
 */
window.quizData_Advanced10DOMBasics = {
  "config": {
    "title": "DOM 基础操作",
    "icon": "🌳",
    "description": "掌握DOM查询、操作、属性处理和文档结构",
    "primaryColor": "#3b82f6",
    "bgGradient": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
  },
  "questions": [
    // ========== 1. 单选题：DOM节点类型 ==========
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["节点类型"],
      "question": "元素节点的nodeType值是多少？",
      "options": [
        "1",
        "3",
        "8",
        "9"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "DOM节点类型：",
        "sections": [
          {
            "title": "常用节点类型",
            "points": [
              "Node.ELEMENT_NODE = 1 （元素节点）",
              "Node.TEXT_NODE = 3 （文本节点）",
              "Node.COMMENT_NODE = 8 （注释节点）",
              "Node.DOCUMENT_NODE = 9 （文档节点）",
              "Node.DOCUMENT_FRAGMENT_NODE = 11 （文档片段）"
            ],
            "code": "const div = document.querySelector('div');\nconsole.log(div.nodeType); // 1\nconsole.log(div.nodeName); // 'DIV'\n\nconst text = div.firstChild;\nif (text.nodeType === Node.TEXT_NODE) {\n  console.log('这是文本节点');\n}"
          },
          {
            "title": "检查节点类型",
            "code": "function isElement(node) {\n  return node.nodeType === 1;\n}\n\nfunction isTextNode(node) {\n  return node.nodeType === 3;\n}\n\n// 或使用instanceof\nnode instanceof Element\nnode instanceof Text\nnode instanceof Comment"
          }
        ]
      },
      "source": "节点类型"
    },

    // ========== 2. 多选题：DOM查询方法 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["DOM查询"],
      "question": "以下哪些方法返回的是实时更新的NodeList或HTMLCollection？",
      "options": [
        "document.getElementsByClassName()",
        "document.querySelectorAll()",
        "element.getElementsByTagName()",
        "document.getElementById()",
        "element.children",
        "document.getElementsByName()"
      ],
      "correctAnswer": ["A", "C", "E", "F"],
      "explanation": {
        "title": "实时集合 vs 静态集合：",
        "sections": [
          {
            "title": "实时集合（Live Collection）",
            "content": "DOM变化时自动更新",
            "points": [
              "getElementsByClassName() - HTMLCollection",
              "getElementsByTagName() - HTMLCollection",
              "getElementsByName() - NodeList",
              "element.children - HTMLCollection",
              "element.childNodes - NodeList"
            ],
            "code": "const divs = document.getElementsByTagName('div');\nconsole.log(divs.length); // 假设10个\n\n// 添加新div\ndocument.body.appendChild(document.createElement('div'));\nconsole.log(divs.length); // 11，自动更新！"
          },
          {
            "title": "静态集合（Static Collection）",
            "content": "返回时的快照，不会自动更新",
            "points": [
              "querySelectorAll() - 静态NodeList",
              "getElementById() - 单个元素"
            ],
            "code": "const divs = document.querySelectorAll('div');\nconsole.log(divs.length); // 10\n\n// 添加新div\ndocument.body.appendChild(document.createElement('div'));\nconsole.log(divs.length); // 仍然是10！"
          },
          {
            "title": "实时集合的陷阱",
            "code": "// ❌ 死循环\nconst divs = document.getElementsByTagName('div');\nfor (let i = 0; i < divs.length; i++) {\n  document.body.appendChild(document.createElement('div'));\n  // divs.length不断增加，永不结束\n}\n\n// ✅ 转为数组\nconst divsArray = Array.from(divs);\nfor (let div of divsArray) {\n  // 安全操作\n}"
          }
        ]
      },
      "source": "DOM查询"
    },

    // ========== 3. 代码输出题：文档片段性能 ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["DocumentFragment"],
      "question": "使用DocumentFragment添加100个元素会触发几次重排？",
      "code": "// 方法1：直接添加\nfor (let i = 0; i < 100; i++) {\n  const div = document.createElement('div');\n  document.body.appendChild(div);\n}\n\n// 方法2：使用DocumentFragment\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 100; i++) {\n  const div = document.createElement('div');\n  fragment.appendChild(div);\n}\ndocument.body.appendChild(fragment);",
      "options": [
        "方法1触发100次，方法2触发1次",
        "两种方法都触发100次",
        "两种方法都触发1次",
        "方法1触发1次，方法2触发100次"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "DocumentFragment性能优化：",
        "sections": [
          {
            "title": "DocumentFragment特点",
            "points": [
              "轻量级文档对象，不是真实DOM的一部分",
              "插入文档时只插入子节点，自身不插入",
              "减少DOM操作次数，提升性能",
              "常用于批量操作"
            ],
            "code": "// ❌ 低效：每次插入都触发重排\nfor (let i = 0; i < 100; i++) {\n  const li = document.createElement('li');\n  li.textContent = i;\n  ul.appendChild(li); // 触发100次重排\n}\n\n// ✅ 高效：只触发1次重排\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 100; i++) {\n  const li = document.createElement('li');\n  li.textContent = i;\n  fragment.appendChild(li);\n}\nul.appendChild(fragment); // 触发1次重排"
          },
          {
            "title": "其他批量操作方法",
            "code": "// 方法1：innerHTML（最快，但有XSS风险）\nul.innerHTML = Array.from({length: 100}, (_, i) => \n  `<li>${i}</li>`\n).join('');\n\n// 方法2：insertAdjacentHTML\nArray.from({length: 100}, (_, i) => \n  ul.insertAdjacentHTML('beforeend', `<li>${i}</li>`)\n);\n\n// 方法3：DocumentFragment（推荐）\nconst fragment = document.createDocumentFragment();\nArray.from({length: 100}, (_, i) => {\n  const li = document.createElement('li');\n  li.textContent = i;\n  fragment.appendChild(li);\n});\nul.appendChild(fragment);"
          }
        ]
      },
      "source": "DOM性能"
    },

    // ========== 4. 判断题：innerHTML安全性 ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["安全性"],
      "question": "直接使用innerHTML插入用户输入的内容是安全的",
      "correctAnswer": "B",
      "explanation": {
        "title": "innerHTML的XSS风险：",
        "sections": [
          {
            "title": "错误！存在XSS攻击风险",
            "content": "innerHTML会执行插入的脚本代码，如果内容来自用户输入，可能导致XSS攻击",
            "code": "// ❌ 危险\nconst userInput = '<img src=x onerror=\"alert(document.cookie)\">';\ndiv.innerHTML = userInput; // 执行恶意脚本！\n\n// ❌ 危险\nconst name = '<script>alert(\"XSS\")</script>';\ndiv.innerHTML = `<p>Hello ${name}</p>`; // 虽然script不执行，但onerror会"
          },
          {
            "title": "安全的替代方案",
            "code": "// ✅ 方案1：textContent（纯文本）\ndiv.textContent = userInput; // 不解析HTML\n\n// ✅ 方案2：createElement + textContent\nconst p = document.createElement('p');\np.textContent = userInput;\ndiv.appendChild(p);\n\n// ✅ 方案3：DOMPurify库\nimport DOMPurify from 'dompurify';\nconst clean = DOMPurify.sanitize(userInput);\ndiv.innerHTML = clean;\n\n// ✅ 方案4：设置属性而不是innerHTML\nconst img = document.createElement('img');\nimg.src = userInput; // 浏览器会验证URL"
          },
          {
            "title": "innerHTML的其他问题",
            "points": [
              "覆盖所有内容，包括事件监听器",
              "不能精确控制插入位置",
              "性能开销大（解析+渲染）"
            ]
          }
        ]
      },
      "source": "XSS防护"
    },

    // ========== 5. 代码补全题：查找最近的父元素 ==========
    {
      "type": "code-completion",
      "difficulty": "medium",
      "tags": ["DOM遍历"],
      "question": "查找元素最近的具有指定class的父元素，空白处填什么？",
      "code": "function findParent(element, className) {\n  while (element && !element.classList.contains(className)) {\n    ______;\n  }\n  return element;\n}",
      "options": [
        "element = element.parentElement",
        "element = element.parentNode",
        "element = element.parent",
        "element = element.offsetParent"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "DOM遍历方法：",
        "sections": [
          {
            "title": "parentElement vs parentNode",
            "code": "// parentElement：只返回元素节点，到达顶层返回null\nelement.parentElement\n\n// parentNode：返回任何节点，document的父节点是null\nelement.parentNode\n\n// 示例\nconst html = document.documentElement;\nconsole.log(html.parentElement); // null\nconsole.log(html.parentNode);    // #document\n\n// 大多数情况下可以互换\n// 推荐用parentElement（语义更清晰）"
          },
          {
            "title": "完整实现",
            "code": "function findParent(element, className) {\n  while (element && !element.classList.contains(className)) {\n    element = element.parentElement;\n  }\n  return element; // 找到返回元素，否则返回null\n}\n\n// 使用\nconst button = document.querySelector('.btn');\nconst card = findParent(button, 'card');\n\n// 或使用closest（现代浏览器）\nconst card = button.closest('.card'); // 更简洁！"
          },
          {
            "title": "其他选项说明",
            "code": "// ❌ element.parent - 不存在\n\n// ❌ element.offsetParent\n// 返回最近的定位父元素（position不是static）\n// 用于计算偏移，不适合遍历\nconst positioned = element.offsetParent;"
          },
          {
            "title": "现代方法：closest()",
            "code": "// closest()会向上查找（包括自己）\nelement.closest('.card');\nelement.closest('#app');\nelement.closest('[data-role=\"button\"]');\n\n// 等价于\nfunction closest(element, selector) {\n  while (element) {\n    if (element.matches(selector)) {\n      return element;\n    }\n    element = element.parentElement;\n  }\n  return null;\n}"
          }
        ]
      },
      "source": "DOM遍历"
    },

    // ========== 6. 多选题：元素尺寸属性 ==========
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["元素尺寸"],
      "question": "以下哪些属性包含了元素的padding？",
      "options": [
        "clientWidth",
        "offsetWidth",
        "scrollWidth",
        "getBoundingClientRect().width",
        "element.style.width"
      ],
      "correctAnswer": ["A", "B", "C", "D"],
      "explanation": {
        "title": "元素尺寸属性对比：",
        "sections": [
          {
            "title": "clientWidth/Height",
            "content": "内容 + padding（不含滚动条、边框）",
            "code": "// clientWidth = width + padding\nconst client = element.clientWidth;\n// 可见区域宽度，不包括滚动条和border"
          },
          {
            "title": "offsetWidth/Height",
            "content": "内容 + padding + border + 滚动条",
            "code": "// offsetWidth = width + padding + border + scrollbar\nconst offset = element.offsetWidth;\n// 元素占据的总宽度"
          },
          {
            "title": "scrollWidth/Height",
            "content": "内容实际宽度（包括溢出的不可见部分）+ padding",
            "code": "// scrollWidth = 实际内容宽度 + padding\nconst scroll = element.scrollWidth;\n// 判断是否有滚动条\nif (element.scrollWidth > element.clientWidth) {\n  console.log('有横向滚动条');\n}"
          },
          {
            "title": "getBoundingClientRect()",
            "content": "相对于视口的位置和尺寸，包含border、padding",
            "code": "const rect = element.getBoundingClientRect();\n// rect.width = offsetWidth（包含border）\n// rect.height = offsetHeight\n// rect.top, rect.left, rect.right, rect.bottom"
          },
          {
            "title": "style.width",
            "content": "只读取内联样式，不包含padding",
            "code": "// ❌ 获取计算后的样式\nelement.style.width; // 只有内联样式才有值\n\n// ✅ 获取计算后的样式\ngetComputedStyle(element).width; // '200px'"
          },
          {
            "title": "图解对比",
            "code": "/*\n┌─────────────────────────── offsetWidth ───────────────────────────┐\n│ ┌────────────────────────── clientWidth ────────────────────────┐ │\n│ │ ┌──────────────────────── scrollWidth ──────────────────────┐ │ │\n│ │ │                                                            │ │ │\n│ │ │            content (可能超出clientWidth)                   │ │ │\n│ │ │                                                            │ │ │\n│ │ └────────────────────────────────────────────────────────────┘ │ │\n│ │                                                                │ │\n│ └────────────────────────────────────────────────────────────────┘ │\n│                                                                      │\n└──────────────────────────────────────────────────────────────────────┘\n   border  padding          content            padding  scrollbar  border\n*/"
          }
        ]
      },
      "source": "元素尺寸"
    },

    // ========== 7. 代码输出题：classList操作 ==========
    {
      "type": "code-output",
      "difficulty": "easy",
      "tags": ["classList"],
      "question": "以下代码执行后，div的className是什么？",
      "code": "const div = document.createElement('div');\ndiv.classList.add('foo', 'bar');\ndiv.classList.remove('bar');\ndiv.classList.toggle('baz');\ndiv.classList.toggle('baz');\nconsole.log(div.className);",
      "options": [
        "'foo'",
        "'foo bar'",
        "'foo baz'",
        "'foo bar baz'"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "classList API：",
        "sections": [
          {
            "title": "执行流程",
            "code": "const div = document.createElement('div');\n\n// 添加多个class\ndiv.classList.add('foo', 'bar'); // 'foo bar'\n\n// 删除class\ndiv.classList.remove('bar'); // 'foo'\n\n// 切换class（没有则添加）\ndiv.classList.toggle('baz'); // 'foo baz'\n\n// 再次切换（有则删除）\ndiv.classList.toggle('baz'); // 'foo'\n\nconsole.log(div.className); // 'foo'"
          },
          {
            "title": "classList方法",
            "code": "// add - 添加class\nelement.classList.add('active', 'highlight');\n\n// remove - 删除class\nelement.classList.remove('active');\n\n// toggle - 切换class\nelement.classList.toggle('active'); // 有则删，无则加\nelement.classList.toggle('active', true); // 强制添加\nelement.classList.toggle('active', false); // 强制删除\n\n// contains - 检查是否包含\nif (element.classList.contains('active')) {\n  console.log('包含active类');\n}\n\n// replace - 替换class\nelement.classList.replace('old', 'new');"
          },
          {
            "title": "classList vs className",
            "code": "// ❌ className（字符串操作，容易出错）\nelement.className += ' active'; // 注意空格\nelement.className = element.className.replace('active', '');\n\n// ✅ classList（更安全、更方便）\nelement.classList.add('active');\nelement.classList.remove('active');"
          }
        ]
      },
      "source": "classList"
    },

    // ========== 8. 判断题：setAttribute ==========
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["属性操作"],
      "question": "使用setAttribute设置的属性都会反映在元素的property上",
      "correctAnswer": "B",
      "explanation": {
        "title": "attribute vs property：",
        "sections": [
          {
            "title": "错误！attribute和property不总是同步",
            "content": "HTML属性(attribute)和DOM属性(property)是两个不同的概念",
            "code": "const input = document.querySelector('input');\n\n// 设置attribute\ninput.setAttribute('value', 'hello');\nconsole.log(input.getAttribute('value')); // 'hello'\nconsole.log(input.value); // 'hello'（初始同步）\n\n// 用户输入修改value\ninput.value = 'world';\nconsole.log(input.getAttribute('value')); // 'hello'（不变）\nconsole.log(input.value); // 'world'（property已改变）"
          },
          {
            "title": "attribute特点",
            "points": [
              "HTML标记中的属性",
              "始终是字符串",
              "对应HTML源码",
              "getAttribute/setAttribute操作"
            ],
            "code": "// attribute操作\nelement.setAttribute('data-id', '123');\nelement.getAttribute('data-id'); // '123'（字符串）\nelement.removeAttribute('data-id');\nelement.hasAttribute('data-id'); // false"
          },
          {
            "title": "property特点",
            "points": [
              "DOM对象的属性",
              "可以是任何类型",
              "不一定反映HTML源码",
              "直接访问：element.property"
            ],
            "code": "// property操作\nelement.id = 'myId';\nelement.className = 'myClass';\nelement.disabled = true; // 布尔值\ninput.value = 123; // 数字\n\n// 自定义property（不会出现在HTML中）\nelement.customData = { foo: 'bar' };"
          },
          {
            "title": "特殊情况",
            "code": "// 1. class\nelement.setAttribute('class', 'foo'); // attribute\nelement.className = 'foo'; // property\n\n// 2. for\nlabel.setAttribute('for', 'inputId'); // attribute\nlabel.htmlFor = 'inputId'; // property\n\n// 3. 布尔属性\ninput.setAttribute('disabled', ''); // attribute\ninput.disabled = true; // property\n\n// 4. dataset\nelement.setAttribute('data-user-id', '123'); // attribute\nelement.dataset.userId = '123'; // property（推荐）"
          }
        ]
      },
      "source": "属性操作"
    },

    // ========== 9. 代码补全题：批量设置属性 ==========
    {
      "type": "code-completion",
      "difficulty": "medium",
      "tags": ["DOM操作"],
      "question": "实现一个函数批量设置元素属性，空白处填什么？",
      "code": "function setAttributes(element, attrs) {\n  Object.entries(attrs).forEach(([key, value]) => {\n    ______;\n  });\n}\n\n// 使用\nsetAttributes(img, {\n  src: 'image.jpg',\n  alt: 'description',\n  width: 300\n});",
      "options": [
        "element.setAttribute(key, value)",
        "element[key] = value",
        "element.attr(key, value)",
        "element.set(key, value)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "批量设置属性：",
        "sections": [
          {
            "title": "完整实现",
            "code": "function setAttributes(element, attrs) {\n  Object.entries(attrs).forEach(([key, value]) => {\n    element.setAttribute(key, value);\n  });\n}\n\n// 使用示例\nconst img = document.createElement('img');\nsetAttributes(img, {\n  src: 'avatar.jpg',\n  alt: '用户头像',\n  width: 100,\n  height: 100,\n  'data-user-id': '123'\n});"
          },
          {
            "title": "为什么选择setAttribute",
            "points": [
              "统一的API，处理所有属性",
              "支持data-*等自定义属性",
              "与HTML属性名称保持一致",
              "选项B（element[key]）对某些属性无效"
            ],
            "code": "// ❌ 直接赋值的问题\nelement['data-id'] = '123'; // 无效，不能用-\nelement.class = 'foo'; // 无效，应该用className\n\n// ✅ setAttribute统一处理\nelement.setAttribute('data-id', '123'); // ✅\nelement.setAttribute('class', 'foo'); // ✅"
          },
          {
            "title": "进阶：支持属性移除",
            "code": "function setAttributes(element, attrs) {\n  Object.entries(attrs).forEach(([key, value]) => {\n    if (value === null || value === undefined) {\n      element.removeAttribute(key);\n    } else {\n      element.setAttribute(key, value);\n    }\n  });\n}\n\n// 使用\nsetAttributes(button, {\n  disabled: true,\n  'aria-label': 'Close',\n  title: null // 移除title属性\n});"
          }
        ]
      },
      "source": "批量操作"
    },

    // ========== 10. 多选题：性能优化 ==========
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["性能优化"],
      "question": "以下哪些是DOM操作的性能优化方法？",
      "options": [
        "使用DocumentFragment批量插入",
        "先display:none再操作，完成后显示",
        "使用事件委托减少监听器数量",
        "用innerHTML代替createElement",
        "缓存DOM查询结果",
        "频繁读取offsetHeight等触发重排的属性"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "DOM性能优化策略：",
        "sections": [
          {
            "title": "✅ 推荐做法",
            "points": [
              "批量操作用DocumentFragment",
              "隐藏元素后操作（减少重排）",
              "事件委托（减少监听器）",
              "缓存查询结果",
              "读写分离（先读后写）",
              "使用classList代替className"
            ]
          },
          {
            "title": "1. DocumentFragment",
            "code": "// ✅ 批量插入\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 1000; i++) {\n  const li = document.createElement('li');\n  fragment.appendChild(li);\n}\nul.appendChild(fragment); // 只触发1次重排"
          },
          {
            "title": "2. 隐藏后操作",
            "code": "// ✅ 减少重排\nelement.style.display = 'none';\n// 进行大量DOM操作\nelement.style.width = '100px';\nelement.style.height = '100px';\n// ...\nelement.style.display = 'block'; // 只触发1次重排"
          },
          {
            "title": "3. 事件委托",
            "code": "// ❌ 为每个item添加监听器\nitems.forEach(item => {\n  item.addEventListener('click', handleClick); // 1000个监听器\n});\n\n// ✅ 委托给父元素\nparent.addEventListener('click', (e) => {\n  if (e.target.matches('.item')) {\n    handleClick(e);\n  }\n}); // 只有1个监听器"
          },
          {
            "title": "4. 缓存查询",
            "code": "// ❌ 重复查询\nfor (let i = 0; i < 1000; i++) {\n  document.querySelector('.container').appendChild(li);\n}\n\n// ✅ 缓存结果\nconst container = document.querySelector('.container');\nfor (let i = 0; i < 1000; i++) {\n  container.appendChild(li);\n}"
          },
          {
            "title": "5. 读写分离",
            "code": "// ❌ 读写交替（触发多次重排）\nelement.style.width = element.offsetWidth + 10 + 'px';\nelement.style.height = element.offsetHeight + 10 + 'px';\n\n// ✅ 先读后写\nconst width = element.offsetWidth;\nconst height = element.offsetHeight;\nelement.style.width = width + 10 + 'px';\nelement.style.height = height + 10 + 'px';"
          },
          {
            "title": "❌ 避免的做法",
            "code": "// innerHTML有安全风险，且重新创建所有子元素\nelement.innerHTML += '<div>new</div>'; // 重新解析所有内容\n\n// 频繁读取触发重排的属性\nfor (let i = 0; i < 100; i++) {\n  console.log(element.offsetHeight); // 每次都触发重排\n}"
          }
        ]
      },
      "source": "性能优化"
    }
  ],
  "navigation": {
    "prev": {
      "title": "async/await",
      "url": "09-async-await.html"
    },
    "next": {
      "title": "事件处理",
      "url": "10-event-handling.html"
    }
  }
};
