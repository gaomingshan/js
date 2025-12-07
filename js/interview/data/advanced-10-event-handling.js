/**
 * 事件处理机制
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced10EventHandling = {
  "config": {
    "title": "事件处理机制",
    "icon": "⚡",
    "description": "深入理解事件流、事件委托、自定义事件和最佳实践",
    "primaryColor": "#ef4444",
    "bgGradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  "questions": [
    // ========== 1. 单选题：事件流 ==========
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["事件流"],
      "question": "事件流的三个阶段按顺序是？",
      "options": [
        "捕获阶段 → 目标阶段 → 冒泡阶段",
        "冒泡阶段 → 目标阶段 → 捕获阶段",
        "目标阶段 → 捕获阶段 → 冒泡阶段",
        "捕获阶段 → 冒泡阶段 → 目标阶段"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "事件流三个阶段：",
        "sections": [
          {
            "title": "1. 捕获阶段（Capture Phase）",
            "content": "事件从Window开始，逐层向下传播到目标元素",
            "code": "document.addEventListener('click', handler, true);\n//                                          ^^^^\n//                                   第三个参数为true表示捕获阶段"
          },
          {
            "title": "2. 目标阶段（Target Phase）",
            "content": "事件到达目标元素",
            "code": "// 事件的target属性指向触发事件的元素\nevent.target === targetElement"
          },
          {
            "title": "3. 冒泡阶段（Bubble Phase）",
            "content": "事件从目标元素向上冒泡到Window",
            "code": "document.addEventListener('click', handler);\n// 或\ndocument.addEventListener('click', handler, false);\n// 默认在冒泡阶段触发"
          },
          {
            "title": "事件流图解",
            "code": "// HTML结构\n// <div id=\"outer\">\n//   <div id=\"inner\">\n//     <button id=\"btn\">Click</button>\n//   </div>\n// </div>\n\n// 点击button后的事件流：\n// 1. 捕获：window → document → html → body → outer → inner → btn\n// 2. 目标：btn（目标阶段）\n// 3. 冒泡：btn → inner → outer → body → html → document → window"
          }
        ]
      },
      "source": "事件流"
    },

    // ========== 2. 代码输出题：事件传播顺序 ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["事件传播"],
      "question": "点击button后，控制台的输出顺序是什么？",
      "code": "<div id=\"outer\">\n  <button id=\"btn\">Click</button>\n</div>\n\n<script>\nconst outer = document.getElementById('outer');\nconst btn = document.getElementById('btn');\n\nouter.addEventListener('click', () => console.log('outer-capture'), true);\nbtn.addEventListener('click', () => console.log('btn-capture'), true);\nbtn.addEventListener('click', () => console.log('btn-bubble'), false);\nouter.addEventListener('click', () => console.log('outer-bubble'), false);\n</script>",
      "options": [
        "outer-capture, btn-capture, btn-bubble, outer-bubble",
        "btn-capture, btn-bubble, outer-capture, outer-bubble",
        "outer-capture, outer-bubble, btn-capture, btn-bubble",
        "btn-capture, outer-capture, btn-bubble, outer-bubble"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "事件传播详细流程：",
        "sections": [
          {
            "title": "执行顺序",
            "code": "// 1. 捕获阶段（从外到内）\nouter-capture  // outer的捕获监听器\nbtn-capture    // btn的捕获监听器\n\n// 2. 目标阶段\n// btn上的监听器按注册顺序执行\n// btn-capture已在捕获阶段执行\nbtn-bubble     // btn的冒泡监听器\n\n// 3. 冒泡阶段（从内到外）\nouter-bubble   // outer的冒泡监听器"
          },
          {
            "title": "关键点",
            "points": [
              "捕获阶段从外向内",
              "目标阶段按注册顺序",
              "冒泡阶段从内向外",
              "同一元素上，捕获监听器先于冒泡监听器"
            ]
          },
          {
            "title": "完整示例",
            "code": "// 完整的事件流示例\nwindow.addEventListener('click', () => console.log('1-window-capture'), true);\ndocument.addEventListener('click', () => console.log('2-document-capture'), true);\nouter.addEventListener('click', () => console.log('3-outer-capture'), true);\nbtn.addEventListener('click', () => console.log('4-btn-capture'), true);\nbtn.addEventListener('click', () => console.log('5-btn-bubble'));\nouter.addEventListener('click', () => console.log('6-outer-bubble'));\ndocument.addEventListener('click', () => console.log('7-document-bubble'));\nwindow.addEventListener('click', () => console.log('8-window-bubble'));\n\n// 点击btn输出：1,2,3,4,5,6,7,8"
          }
        ]
      },
      "source": "事件传播"
    },

    // ========== 3. 多选题：阻止事件传播 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["事件控制"],
      "question": "以下哪些方法可以影响事件传播？",
      "options": [
        "event.stopPropagation()",
        "event.preventDefault()",
        "event.stopImmediatePropagation()",
        "return false",
        "event.cancelBubble = true",
        "event.stopDefault()"
      ],
      "correctAnswer": ["A", "B", "C", "D", "E"],
      "explanation": {
        "title": "事件控制方法：",
        "sections": [
          {
            "title": "stopPropagation()",
            "content": "阻止事件继续传播（捕获或冒泡），但不阻止同一元素上的其他监听器",
            "code": "btn.addEventListener('click', (e) => {\n  e.stopPropagation(); // 阻止冒泡到父元素\n  console.log('btn clicked');\n});\n\nbtn.addEventListener('click', () => {\n  console.log('仍会执行'); // ✅ 仍会执行\n});\n\nouter.addEventListener('click', () => {\n  console.log('不会执行'); // ❌ 不会执行\n});"
          },
          {
            "title": "stopImmediatePropagation()",
            "content": "阻止事件传播，并且阻止同一元素上的其他监听器",
            "code": "btn.addEventListener('click', (e) => {\n  e.stopImmediatePropagation(); // 立即停止\n  console.log('btn clicked');\n});\n\nbtn.addEventListener('click', () => {\n  console.log('不会执行'); // ❌ 不会执行\n});"
          },
          {
            "title": "preventDefault()",
            "content": "阻止默认行为，不影响事件传播",
            "code": "link.addEventListener('click', (e) => {\n  e.preventDefault(); // 阻止链接跳转\n  // 事件仍会冒泡\n});\n\nform.addEventListener('submit', (e) => {\n  e.preventDefault(); // 阻止表单提交\n  // 自定义提交逻辑\n});"
          },
          {
            "title": "return false（jQuery风格）",
            "content": "在DOM0级事件中相当于preventDefault + stopPropagation",
            "code": "// DOM0级\nbtn.onclick = function(e) {\n  // 做一些事情\n  return false; // 阻止默认行为 + 停止冒泡\n};\n\n// addEventListener中return false无效\nbtn.addEventListener('click', () => {\n  return false; // ❌ 无效\n});"
          },
          {
            "title": "cancelBubble（已废弃）",
            "content": "IE的旧属性，等同于stopPropagation()，已标准化但不推荐使用",
            "code": "// ❌ 不推荐\nevent.cancelBubble = true;\n\n// ✅ 推荐\nevent.stopPropagation();"
          }
        ]
      },
      "source": "事件控制"
    },

    // ========== 4. 判断题：事件委托 ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["事件委托"],
      "question": "事件委托利用了事件冒泡机制",
      "correctAnswer": "A",
      "explanation": {
        "title": "事件委托原理：",
        "sections": [
          {
            "title": "正确！",
            "content": "事件委托利用事件冒泡，将子元素的事件监听器绑定到父元素上，通过判断event.target来处理不同的子元素。",
            "code": "// ❌ 为每个item添加监听器\nconst items = document.querySelectorAll('.item');\nitems.forEach(item => {\n  item.addEventListener('click', handleClick); // 100个监听器\n});\n\n// ✅ 事件委托\nconst list = document.querySelector('.list');\nlist.addEventListener('click', (e) => {\n  if (e.target.classList.contains('item')) {\n    handleClick(e); // 只有1个监听器\n  }\n});"
          },
          {
            "title": "事件委托的优势",
            "points": [
              "减少内存占用（少量监听器）",
              "动态元素无需重新绑定",
              "简化事件管理",
              "提升性能"
            ],
            "code": "// 动态添加的元素自动有事件\nlist.addEventListener('click', (e) => {\n  if (e.target.matches('.delete-btn')) {\n    deleteItem(e.target.closest('.item'));\n  }\n});\n\n// 新增的item也会响应事件\nconst newItem = document.createElement('div');\nnewItem.className = 'item';\nnewItem.innerHTML = '<button class=\"delete-btn\">删除</button>';\nlist.appendChild(newItem); // 自动有删除功能"
          },
          {
            "title": "注意事项",
            "code": "// 1. 使用matches()或closest()判断目标\nlist.addEventListener('click', (e) => {\n  // matches - 精确匹配\n  if (e.target.matches('.item')) { }\n  \n  // closest - 查找最近的祖先\n  const item = e.target.closest('.item');\n  if (item) { }\n});\n\n// 2. 某些事件不冒泡\n// focus, blur, load, unload, scroll（在某些元素上）\n// 需要用focusin/focusout代替focus/blur"
          }
        ]
      },
      "source": "事件委托"
    },

    // ========== 5. 代码补全题：实现事件委托 ==========
    {
      "type": "code-completion",
      "difficulty": "medium",
      "tags": ["事件委托"],
      "question": "实现一个事件委托函数，空白处填什么？",
      "code": "function delegate(parent, selector, eventType, handler) {\n  parent.addEventListener(eventType, (e) => {\n    const target = ______;\n    if (target) {\n      handler.call(target, e);\n    }\n  });\n}\n\n// 使用\ndelegate(document.body, '.delete-btn', 'click', function(e) {\n  this.closest('.item').remove();\n});",
      "options": [
        "e.target.closest(selector)",
        "e.target.matches(selector) ? e.target : null",
        "parent.querySelector(selector)",
        "e.currentTarget.querySelector(selector)"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "事件委托实现：",
        "sections": [
          {
            "title": "完整实现",
            "code": "function delegate(parent, selector, eventType, handler) {\n  parent.addEventListener(eventType, (e) => {\n    // closest会向上查找匹配的元素（包括自己）\n    const target = e.target.closest(selector);\n    \n    // 确保target在parent内部\n    if (target && parent.contains(target)) {\n      handler.call(target, e);\n    }\n  });\n}\n\n// 使用示例\ndelegate(document.body, '.delete-btn', 'click', function(e) {\n  console.log(this); // 指向.delete-btn元素\n  this.closest('.item').remove();\n});"
          },
          {
            "title": "为什么用closest",
            "points": [
              "closest会向上查找，包括自己",
              "即使点击子元素也能找到",
              "返回最近的匹配元素",
              "没有匹配返回null"
            ],
            "code": "// HTML: <button class=\"delete-btn\"><span>删除</span></button>\n\n// 点击span时\ne.target // <span>删除</span>\ne.target.matches('.delete-btn') // false ❌\ne.target.closest('.delete-btn') // <button> ✅"
          },
          {
            "title": "其他选项问题",
            "code": "// ❌ 选项B：只检查target本身\ne.target.matches(selector) ? e.target : null\n// 点击子元素时会失效\n\n// ❌ 选项C：查找parent下的第一个匹配元素\nparent.querySelector(selector)\n// 总是返回同一个元素\n\n// ❌ 选项D：currentTarget是绑定事件的元素\ne.currentTarget.querySelector(selector)"
          },
          {
            "title": "进阶：支持多个事件",
            "code": "function delegate(parent, selector, events, handler) {\n  const eventList = events.split(' ');\n  \n  eventList.forEach(eventType => {\n    parent.addEventListener(eventType, (e) => {\n      const target = e.target.closest(selector);\n      if (target && parent.contains(target)) {\n        handler.call(target, e);\n      }\n    });\n  });\n}\n\n// 使用\ndelegate(document.body, '.input', 'focus blur', function(e) {\n  console.log(`${e.type}: ${this.value}`);\n});"
          }
        ]
      },
      "source": "事件委托"
    },

    // ========== 6. 代码输出题：event.target vs event.currentTarget ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["事件对象"],
      "question": "点击<span>后，输出是什么？",
      "code": "<div id=\"outer\">\n  <button id=\"btn\">\n    <span>Click me</span>\n  </button>\n</div>\n\n<script>\nconst outer = document.getElementById('outer');\nouter.addEventListener('click', (e) => {\n  console.log(e.target.tagName);\n  console.log(e.currentTarget.tagName);\n});\n</script>",
      "options": [
        "SPAN, DIV",
        "DIV, SPAN",
        "SPAN, SPAN",
        "DIV, DIV"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "target vs currentTarget：",
        "sections": [
          {
            "title": "核心区别",
            "points": [
              "event.target - 触发事件的元素（实际点击的元素）",
              "event.currentTarget - 绑定事件监听器的元素（事件处理程序所在的元素）",
              "target会随着事件冒泡改变，currentTarget始终不变"
            ],
            "code": "// 点击<span>时\ne.target         // <span>（实际点击的）\ne.currentTarget  // <div id=\"outer\">（绑定监听器的）\n\n// 点击<button>时\ne.target         // <button>\ne.currentTarget  // <div id=\"outer\">"
          },
          {
            "title": "使用场景",
            "code": "// 1. target - 判断点击的具体元素\nouter.addEventListener('click', (e) => {\n  if (e.target.tagName === 'BUTTON') {\n    console.log('点击了按钮');\n  } else if (e.target.tagName === 'SPAN') {\n    console.log('点击了span');\n  }\n});\n\n// 2. currentTarget - 访问当前处理事件的元素\nouter.addEventListener('click', function(e) {\n  console.log(this === e.currentTarget); // true\n  this.classList.add('clicked'); // 给outer添加类\n});\n\n// 3. 事件委托中结合使用\nlist.addEventListener('click', (e) => {\n  // target: 实际点击的元素\n  // currentTarget: list元素\n  const item = e.target.closest('.item');\n  if (item && e.currentTarget.contains(item)) {\n    // 处理item点击\n  }\n});"
          },
          {
            "title": "注意：箭头函数中的this",
            "code": "// 箭头函数\nouter.addEventListener('click', (e) => {\n  console.log(this); // window（箭头函数没有自己的this）\n  console.log(e.currentTarget); // <div id=\"outer\">\n});\n\n// 普通函数\nouter.addEventListener('click', function(e) {\n  console.log(this); // <div id=\"outer\">\n  console.log(e.currentTarget); // <div id=\"outer\">\n  console.log(this === e.currentTarget); // true\n});"
          }
        ]
      },
      "source": "事件对象"
    },

    // ========== 7. 多选题：自定义事件 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["自定义事件"],
      "question": "以下哪些是创建和触发自定义事件的正确方式？",
      "options": [
        "new CustomEvent('eventName', { detail: data })",
        "new Event('eventName')",
        "element.dispatchEvent(event)",
        "element.trigger('eventName')",
        "document.createEvent('CustomEvent')",
        "element.fireEvent('oneventname', event)"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "自定义事件创建与触发：",
        "sections": [
          {
            "title": "1. CustomEvent（推荐）",
            "content": "可以传递自定义数据",
            "code": "// 创建自定义事件\nconst event = new CustomEvent('userLogin', {\n  detail: {\n    userId: 123,\n    userName: 'John'\n  },\n  bubbles: true,      // 是否冒泡\n  cancelable: true,   // 是否可取消\n  composed: false     // 是否穿透Shadow DOM\n});\n\n// 触发事件\nelement.dispatchEvent(event);\n\n// 监听事件\nelement.addEventListener('userLogin', (e) => {\n  console.log(e.detail.userId);   // 123\n  console.log(e.detail.userName); // 'John'\n});"
          },
          {
            "title": "2. Event",
            "content": "简单事件，无法传递数据",
            "code": "// 创建简单事件\nconst event = new Event('myEvent', {\n  bubbles: true,\n  cancelable: true\n});\n\n// 触发\nelement.dispatchEvent(event);"
          },
          {
            "title": "3. createEvent（传统方式）",
            "content": "兼容旧浏览器，但已不推荐",
            "code": "// 传统方式\nconst event = document.createEvent('CustomEvent');\nevent.initCustomEvent('myEvent', true, true, { data: 'value' });\nelement.dispatchEvent(event);\n\n// ✅ 现代方式（推荐）\nconst event = new CustomEvent('myEvent', {\n  detail: { data: 'value' }\n});\nelement.dispatchEvent(event);"
          },
          {
            "title": "完整示例：组件通信",
            "code": "// 组件A：触发事件\nclass ComponentA {\n  submit(data) {\n    const event = new CustomEvent('dataSubmit', {\n      detail: data,\n      bubbles: true\n    });\n    this.element.dispatchEvent(event);\n  }\n}\n\n// 组件B：监听事件\nclass ComponentB {\n  init() {\n    document.addEventListener('dataSubmit', (e) => {\n      console.log('收到数据:', e.detail);\n      this.handleData(e.detail);\n    });\n  }\n}\n\n// 使用\nconst compA = new ComponentA();\nconst compB = new ComponentB();\ncompB.init();\n\ncompA.submit({ userId: 123 }); // ComponentB会收到"
          },
          {
            "title": "❌ 错误方式",
            "code": "// ❌ trigger() 是jQuery方法，原生JS没有\nelement.trigger('eventName');\n\n// ❌ fireEvent() 是IE旧方法\nelement.fireEvent('onclick', event);"
          }
        ]
      },
      "source": "自定义事件"
    },

    // ========== 8. 判断题：once选项 ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["事件选项"],
      "question": "addEventListener的once选项设为true，监听器只会触发一次后自动移除",
      "correctAnswer": "A",
      "explanation": {
        "title": "addEventListener选项：",
        "sections": [
          {
            "title": "正确！once选项",
            "content": "once为true时，事件监听器在触发一次后会自动移除",
            "code": "// ✅ 使用once\nbutton.addEventListener('click', () => {\n  console.log('只执行一次');\n}, { once: true });\n\n// 等价于手动移除\nfunction handleClick() {\n  console.log('只执行一次');\n  button.removeEventListener('click', handleClick);\n}\nbutton.addEventListener('click', handleClick);"
          },
          {
            "title": "所有选项",
            "code": "element.addEventListener('click', handler, {\n  capture: false,  // 是否在捕获阶段触发\n  once: false,     // 是否只触发一次\n  passive: false,  // 是否永不调用preventDefault()\n  signal: abortSignal // AbortSignal用于移除监听器\n});"
          },
          {
            "title": "passive选项",
            "content": "优化滚动性能，告诉浏览器不会调用preventDefault()",
            "code": "// ✅ 滚动事件性能优化\ndocument.addEventListener('touchmove', handler, {\n  passive: true // 浏览器可以立即滚动，不等待handler执行\n});\n\n// 如果在passive:true中调用preventDefault()\nfunction handler(e) {\n  e.preventDefault(); // ⚠️ 会被忽略，控制台警告\n}"
          },
          {
            "title": "signal选项（AbortController）",
            "code": "// ✅ 批量移除监听器\nconst controller = new AbortController();\nconst { signal } = controller;\n\nelement.addEventListener('click', handler1, { signal });\nelement.addEventListener('mouseover', handler2, { signal });\nelement.addEventListener('focus', handler3, { signal });\n\n// 一次性移除所有监听器\ncontroller.abort();\n\n// 使用场景：组件销毁\nclass Component {\n  constructor() {\n    this.controller = new AbortController();\n    this.signal = this.controller.signal;\n  }\n  \n  mount() {\n    document.addEventListener('click', this.handleClick, {\n      signal: this.signal\n    });\n    window.addEventListener('resize', this.handleResize, {\n      signal: this.signal\n    });\n  }\n  \n  destroy() {\n    this.controller.abort(); // 移除所有监听器\n  }\n}"
          }
        ]
      },
      "source": "事件选项"
    },

    // ========== 9. 代码补全题：节流函数 ==========
    {
      "type": "code-completion",
      "difficulty": "hard",
      "tags": ["性能优化"],
      "question": "实现一个节流函数，限制函数执行频率，空白处填什么？",
      "code": "function throttle(fn, delay) {\n  let lastTime = 0;\n  return function(...args) {\n    const now = Date.now();\n    if (______) {\n      fn.apply(this, args);\n      lastTime = now;\n    }\n  };\n}\n\n// 使用\nwindow.addEventListener('scroll', throttle(() => {\n  console.log('滚动事件');\n}, 200));",
      "options": [
        "now - lastTime >= delay",
        "now - lastTime < delay",
        "lastTime - now >= delay",
        "Date.now() - lastTime > delay"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "节流（Throttle）实现：",
        "sections": [
          {
            "title": "节流原理",
            "content": "在指定时间内只执行一次函数，类似技能CD",
            "code": "function throttle(fn, delay) {\n  let lastTime = 0;\n  \n  return function(...args) {\n    const now = Date.now();\n    \n    // 距离上次执行超过delay才执行\n    if (now - lastTime >= delay) {\n      fn.apply(this, args);\n      lastTime = now;\n    }\n  };\n}\n\n// 使用场景\n// 1. 滚动事件\nwindow.addEventListener('scroll', throttle(() => {\n  console.log('处理滚动');\n}, 200)); // 200ms执行一次\n\n// 2. 鼠标移动\ndocument.addEventListener('mousemove', throttle((e) => {\n  console.log(e.clientX, e.clientY);\n}, 100));\n\n// 3. 窗口缩放\nwindow.addEventListener('resize', throttle(() => {\n  console.log('窗口大小:', window.innerWidth);\n}, 300));"
          },
          {
            "title": "节流 vs 防抖",
            "code": "// 节流（Throttle）：固定频率执行\n// 场景：滚动、鼠标移动、窗口缩放\nfunction throttle(fn, delay) {\n  let lastTime = 0;\n  return function(...args) {\n    const now = Date.now();\n    if (now - lastTime >= delay) {\n      fn.apply(this, args);\n      lastTime = now;\n    }\n  };\n}\n\n// 防抖（Debounce）：延迟执行，重复触发重新计时\n// 场景：搜索输入、表单验证\nfunction debounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      fn.apply(this, args);\n    }, delay);\n  };\n}"
          },
          {
            "title": "进阶：支持立即执行和尾调用",
            "code": "function throttle(fn, delay, options = {}) {\n  let lastTime = 0;\n  let timer = null;\n  const { leading = true, trailing = false } = options;\n  \n  return function(...args) {\n    const now = Date.now();\n    \n    // leading: 首次立即执行\n    if (!lastTime && !leading) {\n      lastTime = now;\n    }\n    \n    const remaining = delay - (now - lastTime);\n    \n    if (remaining <= 0) {\n      if (timer) {\n        clearTimeout(timer);\n        timer = null;\n      }\n      lastTime = now;\n      fn.apply(this, args);\n    } else if (!timer && trailing) {\n      // trailing: 最后一次延迟执行\n      timer = setTimeout(() => {\n        lastTime = Date.now();\n        timer = null;\n        fn.apply(this, args);\n      }, remaining);\n    }\n  };\n}\n\n// 使用\nconst throttled = throttle(fn, 1000, {\n  leading: true,  // 首次立即执行\n  trailing: true  // 最后一次延迟执行\n});"
          }
        ]
      },
      "source": "节流函数"
    },

    // ========== 10. 多选题：事件最佳实践 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["最佳实践"],
      "question": "以下哪些是事件处理的最佳实践？",
      "options": [
        "使用事件委托减少监听器数量",
        "及时移除不需要的事件监听器",
        "使用passive优化滚动性能",
        "在所有事件中都调用preventDefault()",
        "使用once选项处理一次性事件",
        "在forEach中为每个元素添加监听器"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "事件处理最佳实践：",
        "sections": [
          {
            "title": "✅ 推荐做法",
            "points": [
              "使用事件委托（减少监听器）",
              "及时移除监听器（防止内存泄漏）",
              "passive优化滚动性能",
              "once处理一次性事件",
              "使用AbortController批量管理",
              "合理使用节流/防抖"
            ]
          },
          {
            "title": "1. 事件委托",
            "code": "// ✅ 推荐\nlist.addEventListener('click', (e) => {\n  if (e.target.matches('.item')) {\n    handleItemClick(e);\n  }\n});\n\n// ❌ 避免\nitems.forEach(item => {\n  item.addEventListener('click', handleItemClick);\n});"
          },
          {
            "title": "2. 移除监听器",
            "code": "// ✅ 使用AbortController\nconst controller = new AbortController();\nelement.addEventListener('click', handler, {\n  signal: controller.signal\n});\n// 销毁时\ncontroller.abort();\n\n// ✅ 使用once\nelement.addEventListener('click', handler, { once: true });\n\n// ✅ 手动移除\nfunction handler() { }\nelement.addEventListener('click', handler);\nelement.removeEventListener('click', handler);"
          },
          {
            "title": "3. passive优化",
            "code": "// ✅ 滚动和触摸事件\ndocument.addEventListener('touchstart', handler, {\n  passive: true // 提升滚动性能\n});\n\ndocument.addEventListener('wheel', handler, {\n  passive: true\n});"
          },
          {
            "title": "4. 节流/防抖",
            "code": "// ✅ 高频事件使用节流\nwindow.addEventListener('scroll', throttle(handler, 200));\nwindow.addEventListener('resize', throttle(handler, 300));\ndocument.addEventListener('mousemove', throttle(handler, 50));\n\n// ✅ 用户输入使用防抖\ninput.addEventListener('input', debounce(handler, 500));"
          },
          {
            "title": "❌ 避免的做法",
            "code": "// ❌ 滥用preventDefault\nelement.addEventListener('click', (e) => {\n  e.preventDefault(); // 不是所有事件都需要\n});\n\n// ❌ 忘记移除监听器\nsetInterval(() => {\n  const btn = document.querySelector('.btn');\n  btn.addEventListener('click', handler); // 内存泄漏\n}, 1000);\n\n// ❌ 箭头函数无法移除\nelement.addEventListener('click', () => { });\nelement.removeEventListener('click', () => { }); // ❌ 无效"
          }
        ]
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "DOM基础",
      "url": "10-dom-basics.html"
    },
    "next": {
      "title": "浏览器存储",
      "url": "../advanced/11-browser-storage.html"
    }
  }
};
