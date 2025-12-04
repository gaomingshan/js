// 第21章：事件系统 - 面试题
window.htmlQuizData_21 = {
    config: {
        title: "事件系统",
        icon: "⚡",
        description: "测试你对HTML事件系统的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["事件流", "基础"],
            question: "事件流的三个阶段是什么？",
            type: "single-choice",
            options: [
                "捕获阶段 → 目标阶段 → 冒泡阶段",
                "冒泡阶段 → 目标阶段 → 捕获阶段",
                "目标阶段 → 捕获阶段 → 冒泡阶段",
                "只有冒泡阶段"
            ],
            correctAnswer: "A",
            explanation: {
                title: "事件流（Event Flow）",
                description: "事件在DOM中的传播过程。",
                sections: [
                    {
                        title: "三个阶段",
                        code: '/* 事件流 */\n\n1. 捕获阶段（Capture Phase）\n   从window → document → ... → 目标元素的父元素\n   \n2. 目标阶段（Target Phase）\n   到达目标元素本身\n   \n3. 冒泡阶段（Bubble Phase）\n   从目标元素的父元素 → ... → document → window\n\n/* 示例DOM结构 */\n<div id="outer">\n  <div id="inner">\n    <button id="btn">点击</button>\n  </div>\n</div>\n\n/* 点击button，事件流： */\n\n【捕获阶段】\nwindow → document → html → body → #outer → #inner\n\n【目标阶段】\n#btn\n\n【冒泡阶段】\n#inner → #outer → body → html → document → window',
                        content: "事件传播的完整路径。"
                    },
                    {
                        title: "addEventListener",
                        code: '/* 语法 */\nelement.addEventListener(type, listener, useCapture);\nelement.addEventListener(type, listener, options);\n\n/* useCapture参数 */\nfalse - 冒泡阶段触发（默认）\ntrue  - 捕获阶段触发\n\n/* 示例 */\nconst outer = document.getElementById("outer");\nconst inner = document.getElementById("inner");\nconst btn = document.getElementById("btn");\n\n// 冒泡阶段（默认）\nouter.addEventListener("click", () => {\n  console.log("outer - 冒泡");\n});\n\ninner.addEventListener("click", () => {\n  console.log("inner - 冒泡");\n});\n\nbtn.addEventListener("click", () => {\n  console.log("btn - 目标");\n});\n\n/* 点击按钮，输出：\nbtn - 目标\ninner - 冒泡\nouter - 冒泡\n*/\n\n// 捕获阶段\nouter.addEventListener("click", () => {\n  console.log("outer - 捕获");\n}, true);\n\ninner.addEventListener("click", () => {\n  console.log("inner - 捕获");\n}, true);\n\n/* 点击按钮，输出：\nouter - 捕获\ninner - 捕获\nbtn - 目标\ninner - 冒泡\nouter - 冒泡\n*/',
                        content: "第三个参数控制捕获/冒泡。"
                    },
                    {
                        title: "options对象",
                        code: '/* addEventListener的options */\n\nelement.addEventListener("click", handler, {\n  capture: false,   // 捕获阶段\n  once: false,      // 只触发一次\n  passive: false,   // 不调用preventDefault\n  signal: null      // AbortSignal\n});\n\n/* 1. once - 只触发一次 */\nbtn.addEventListener("click", () => {\n  console.log("只执行一次");\n}, { once: true });\n\n// 等同于\nfunction handler() {\n  console.log("只执行一次");\n  btn.removeEventListener("click", handler);\n}\nbtn.addEventListener("click", handler);\n\n/* 2. passive - 提升滚动性能 */\ndocument.addEventListener("touchstart", (e) => {\n  // 不能调用e.preventDefault()\n  console.log("触摸开始");\n}, { passive: true });\n\n// 用途：告诉浏览器不会阻止默认行为\n// 浏览器可以立即滚动，不用等待事件处理完成\n\n/* 3. signal - 批量移除 */\nconst controller = new AbortController();\nconst { signal } = controller;\n\nbtn.addEventListener("click", handler1, { signal });\nbtn.addEventListener("mouseover", handler2, { signal });\nbtn.addEventListener("mouseout", handler3, { signal });\n\n// 一次性移除所有\ncontroller.abort();',
                        content: "options提供更多控制。"
                    },
                    {
                        title: "停止传播",
                        code: '/* stopPropagation - 停止传播 */\n\ninner.addEventListener("click", (e) => {\n  console.log("inner");\n  e.stopPropagation();  // 停止冒泡\n});\n\nouter.addEventListener("click", () => {\n  console.log("outer");  // 不会执行\n});\n\n/* stopImmediatePropagation - 立即停止 */\n\ninner.addEventListener("click", (e) => {\n  console.log("handler 1");\n  e.stopImmediatePropagation();\n});\n\ninner.addEventListener("click", () => {\n  console.log("handler 2");  // 不会执行\n});\n\nouter.addEventListener("click", () => {\n  console.log("outer");  // 不会执行\n});\n\n/* 区别 */\nstopPropagation()          - 阻止向上传播，但当前元素的其他监听器仍会执行\nstopImmediatePropagation() - 立即停止，当前元素的其他监听器也不执行',
                        content: "控制事件传播。"
                    },
                    {
                        title: "阻止默认行为",
                        code: '/* preventDefault - 阻止默认行为 */\n\n// 1. 阻止链接跳转\nconst link = document.querySelector("a");\nlink.addEventListener("click", (e) => {\n  e.preventDefault();\n  console.log("不会跳转");\n});\n\n// 2. 阻止表单提交\nconst form = document.querySelector("form");\nform.addEventListener("submit", (e) => {\n  e.preventDefault();\n  console.log("不会提交");\n  // 自定义提交逻辑\n});\n\n// 3. 阻止右键菜单\ndocument.addEventListener("contextmenu", (e) => {\n  e.preventDefault();\n  // 显示自定义菜单\n});\n\n// 4. 阻止文本选择\ndocument.addEventListener("selectstart", (e) => {\n  e.preventDefault();\n});\n\n/* 检查是否可取消 */\nif (event.cancelable) {\n  event.preventDefault();\n}\n\n/* 检查是否已阻止 */\nif (event.defaultPrevented) {\n  console.log("默认行为已被阻止");\n}',
                        content: "阻止浏览器默认行为。"
                    },
                    {
                        title: "事件委托",
                        code: '/* 事件委托（利用冒泡）*/\n\n// ❌ 不好：每个li都绑定\nconst items = document.querySelectorAll("li");\nitems.forEach(item => {\n  item.addEventListener("click", handleClick);\n});\n\n// ✅ 好：委托给ul\nconst ul = document.querySelector("ul");\nul.addEventListener("click", (e) => {\n  if (e.target.tagName === "LI") {\n    handleClick(e);\n  }\n});\n\n/* 优点 */\n1. 减少内存占用\n2. 动态元素自动绑定\n3. 代码更简洁\n\n/* 完整示例 */\n<ul id="list">\n  <li data-id="1">项目1</li>\n  <li data-id="2">项目2</li>\n  <li data-id="3">项目3</li>\n</ul>\n\n<script>\nconst list = document.getElementById("list");\n\nlist.addEventListener("click", (e) => {\n  const li = e.target.closest("li");\n  if (li && list.contains(li)) {\n    const id = li.dataset.id;\n    console.log(`点击了项目 ${id}`);\n  }\n});\n\n// 动态添加的li也会响应\nconst newLi = document.createElement("li");\nnewLi.dataset.id = "4";\nnewLi.textContent = "项目4";\nlist.appendChild(newLi);\n</script>',
                        content: "利用冒泡实现事件委托。"
                    }
                ]
            },
            source: "DOM事件规范"
        },
        {
            difficulty: "easy",
            tags: ["事件类型", "基础"],
            question: "常见的鼠标事件有哪些？",
            type: "multiple-choice",
            options: [
                "click",
                "dblclick",
                "mouseenter/mouseleave",
                "mouseover/mouseout"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "鼠标事件",
                description: "处理鼠标交互。",
                sections: [
                    {
                        title: "点击事件",
                        code: '/* click - 单击 */\nelement.addEventListener("click", (e) => {\n  console.log("单击");\n  console.log(`坐标: ${e.clientX}, ${e.clientY}`);\n});\n\n/* dblclick - 双击 */\nelement.addEventListener("dblclick", (e) => {\n  console.log("双击");\n});\n\n/* contextmenu - 右键 */\nelement.addEventListener("contextmenu", (e) => {\n  e.preventDefault();  // 阻止默认菜单\n  console.log("右键点击");\n  // 显示自定义菜单\n});\n\n/* 完整点击流程 */\nmousedown → mouseup → click\n\n/* 双击流程 */\nmousedown → mouseup → click → mousedown → mouseup → click → dblclick',
                        content: "点击相关事件。"
                    },
                    {
                        title: "鼠标移动",
                        code: '/* mousemove - 鼠标移动 */\nelement.addEventListener("mousemove", (e) => {\n  console.log(`位置: ${e.clientX}, ${e.clientY}`);\n});\n\n// 节流优化\nlet throttleTimer;\nelement.addEventListener("mousemove", (e) => {\n  if (throttleTimer) return;\n  throttleTimer = setTimeout(() => {\n    console.log(`位置: ${e.clientX}, ${e.clientY}`);\n    throttleTimer = null;\n  }, 100);\n});\n\n/* mousedown - 按下 */\nelement.addEventListener("mousedown", (e) => {\n  console.log("鼠标按下");\n  console.log(`按钮: ${e.button}`);\n  // 0: 左键, 1: 中键, 2: 右键\n});\n\n/* mouseup - 释放 */\nelement.addEventListener("mouseup", (e) => {\n  console.log("鼠标释放");\n});',
                        content: "鼠标移动和按下。"
                    },
                    {
                        title: "进入/离开",
                        code: '/* mouseenter/mouseleave - 不冒泡 */\nelement.addEventListener("mouseenter", () => {\n  console.log("鼠标进入");\n});\n\nelement.addEventListener("mouseleave", () => {\n  console.log("鼠标离开");\n});\n\n/* mouseover/mouseout - 冒泡 */\nelement.addEventListener("mouseover", () => {\n  console.log("鼠标经过");\n});\n\nelement.addEventListener("mouseout", () => {\n  console.log("鼠标移出");\n});\n\n/* 区别示例 */\n<div id="outer">\n  <div id="inner">内部</div>\n</div>\n\n// mouseenter/mouseleave\nouter.addEventListener("mouseenter", () => {\n  console.log("进入outer");  // 只触发一次\n});\n\n// mouseover/mouseout\nouter.addEventListener("mouseover", () => {\n  console.log("经过outer");  // 进入inner时也会触发\n});\n\n/* 选择 */\n不需要冒泡 → mouseenter/mouseleave\n需要冒泡   → mouseover/mouseout',
                        content: "进入离开事件的区别。"
                    },
                    {
                        title: "事件对象属性",
                        code: '/* 鼠标位置 */\nevent.clientX, event.clientY  - 相对于视口\nevent.pageX, event.pageY      - 相对于页面（包含滚动）\nevent.screenX, event.screenY  - 相对于屏幕\nevent.offsetX, event.offsetY  - 相对于目标元素\n\nelement.addEventListener("click", (e) => {\n  console.log(`视口: ${e.clientX}, ${e.clientY}`);\n  console.log(`页面: ${e.pageX}, ${e.pageY}`);\n  console.log(`屏幕: ${e.screenX}, ${e.screenY}`);\n  console.log(`元素: ${e.offsetX}, ${e.offsetY}`);\n});\n\n/* 按键状态 */\nevent.button       - 哪个按钮（0左，1中，2右）\nevent.buttons      - 按钮组合（位掩码）\nevent.ctrlKey      - Ctrl键\nevent.shiftKey     - Shift键\nevent.altKey       - Alt键\nevent.metaKey      - Meta键（Mac的Cmd）\n\nelement.addEventListener("click", (e) => {\n  if (e.ctrlKey) {\n    console.log("Ctrl + 点击");\n  }\n  if (e.shiftKey) {\n    console.log("Shift + 点击");\n  }\n});\n\n/* 目标元素 */\nevent.target       - 触发事件的元素\nevent.currentTarget - 绑定事件的元素\n\nouter.addEventListener("click", (e) => {\n  console.log(e.target);        // 可能是inner\n  console.log(e.currentTarget); // 总是outer\n});',
                        content: "事件对象的常用属性。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 1. 拖拽 */\nlet isDragging = false;\nlet startX, startY;\n\nelement.addEventListener("mousedown", (e) => {\n  isDragging = true;\n  startX = e.clientX - element.offsetLeft;\n  startY = e.clientY - element.offsetTop;\n});\n\ndocument.addEventListener("mousemove", (e) => {\n  if (!isDragging) return;\n  element.style.left = e.clientX - startX + "px";\n  element.style.top = e.clientY - startY + "px";\n});\n\ndocument.addEventListener("mouseup", () => {\n  isDragging = false;\n});\n\n/* 2. 悬停提示 */\nlet tooltip;\n\nelement.addEventListener("mouseenter", (e) => {\n  tooltip = document.createElement("div");\n  tooltip.textContent = "提示信息";\n  tooltip.className = "tooltip";\n  tooltip.style.left = e.clientX + "px";\n  tooltip.style.top = e.clientY + "px";\n  document.body.appendChild(tooltip);\n});\n\nelement.addEventListener("mouseleave", () => {\n  if (tooltip) {\n    tooltip.remove();\n  }\n});\n\n/* 3. 跟随鼠标 */\nconst cursor = document.querySelector(".custom-cursor");\n\ndocument.addEventListener("mousemove", (e) => {\n  cursor.style.left = e.clientX + "px";\n  cursor.style.top = e.clientY + "px";\n});',
                        content: "鼠标事件的实际应用。"
                    }
                ]
            },
            source: "DOM事件"
        },
        {
            difficulty: "medium",
            tags: ["键盘事件", "输入"],
            question: "键盘事件的触发顺序是什么？",
            type: "single-choice",
            options: [
                "keydown → keypress → keyup",
                "keypress → keydown → keyup",
                "keydown → keyup → keypress",
                "只有keydown和keyup"
            ],
            correctAnswer: "A",
            explanation: {
                title: "键盘事件",
                description: "处理键盘输入。",
                sections: [
                    {
                        title: "事件顺序",
                        code: '/* 键盘事件顺序 */\n\n按下键盘 → keydown → keypress → 松开 → keyup\n\n/* keydown - 按下任意键 */\ninput.addEventListener("keydown", (e) => {\n  console.log("按键按下");\n  console.log(e.key);      // 按键值 "a", "Enter"\n  console.log(e.code);     // 物理键 "KeyA", "Enter"\n  console.log(e.keyCode);  // 键码（已废弃）\n});\n\n/* keypress - 按下字符键（已废弃）*/\ninput.addEventListener("keypress", (e) => {\n  console.log("字符键按下");\n  // 只触发字符键，不触发Ctrl、Shift等\n});\n\n/* keyup - 松开键 */\ninput.addEventListener("keyup", (e) => {\n  console.log("按键松开");\n});\n\n/* 建议：使用keydown，不用keypress */\nkeypress已废弃，用keydown替代',
                        content: "三个键盘事件。"
                    },
                    {
                        title: "event.key vs event.code",
                        code: '/* event.key - 按键的值 */\ninput.addEventListener("keydown", (e) => {\n  console.log(e.key);\n});\n\n// 示例\na        → "a"\nA        → "A" (Shift + a)\nEnter    → "Enter"\nEscape   → "Escape"\nArrowUp  → "ArrowUp"\n空格      → " "\n\n/* event.code - 物理键位置 */\ninput.addEventListener("keydown", (e) => {\n  console.log(e.code);\n});\n\n// 示例（不受键盘布局影响）\na/A      → "KeyA"\nEnter    → "Enter"\nEscape   → "Escape"\nArrowUp  → "ArrowUp"\n空格      → "Space"\n\n/* 选择 */\n关心输入内容 → event.key\n关心键位置   → event.code\n\n// 例子：游戏控制用code\nif (e.code === "KeyW") {\n  moveForward();  // WASD控制，不受键盘布局影响\n}',
                        content: "key和code的区别。"
                    },
                    {
                        title: "修饰键",
                        code: '/* 检测组合键 */\ninput.addEventListener("keydown", (e) => {\n  // Ctrl + S\n  if (e.ctrlKey && e.key === "s") {\n    e.preventDefault();\n    console.log("保存");\n  }\n  \n  // Ctrl + Shift + K\n  if (e.ctrlKey && e.shiftKey && e.key === "K") {\n    e.preventDefault();\n    console.log("清空控制台");\n  }\n  \n  // Alt + 方向键\n  if (e.altKey && e.key === "ArrowLeft") {\n    console.log("后退");\n  }\n});\n\n/* 修饰键属性 */\ne.ctrlKey   - Ctrl键\ne.shiftKey  - Shift键\ne.altKey    - Alt键\ne.metaKey   - Meta键（Mac的Cmd，Windows的Win）\n\n/* 跨平台组合键 */\nconst isMac = navigator.platform.includes("Mac");\nconst modifierKey = isMac ? e.metaKey : e.ctrlKey;\n\nif (modifierKey && e.key === "s") {\n  // Mac: Cmd+S, Windows: Ctrl+S\n  save();\n}',
                        content: "处理组合键。"
                    },
                    {
                        title: "常用按键",
                        code: '/* 特殊键 */\nEnter      - 回车\nEscape     - 退出\nTab        - 制表符\nBackspace  - 退格\nDelete     - 删除\n\n/* 方向键 */\nArrowUp, ArrowDown, ArrowLeft, ArrowRight\n\n/* 功能键 */\nF1 - F12\n\n/* 实际应用 */\n\n// 1. 回车提交\ninput.addEventListener("keydown", (e) => {\n  if (e.key === "Enter") {\n    submitForm();\n  }\n});\n\n// 2. Esc关闭\nmodal.addEventListener("keydown", (e) => {\n  if (e.key === "Escape") {\n    closeModal();\n  }\n});\n\n// 3. 方向键导航\ndocument.addEventListener("keydown", (e) => {\n  switch (e.key) {\n    case "ArrowUp":\n      selectPrevious();\n      break;\n    case "ArrowDown":\n      selectNext();\n      break;\n    case "ArrowLeft":\n      goBack();\n      break;\n    case "ArrowRight":\n      goForward();\n      break;\n  }\n});\n\n// 4. 快捷键系统\nconst shortcuts = {\n  "ctrl+s": save,\n  "ctrl+o": open,\n  "ctrl+p": print,\n  "ctrl+z": undo,\n  "ctrl+shift+z": redo\n};\n\ndocument.addEventListener("keydown", (e) => {\n  const key = [\n    e.ctrlKey && "ctrl",\n    e.shiftKey && "shift",\n    e.altKey && "alt",\n    e.key.toLowerCase()\n  ].filter(Boolean).join("+");\n  \n  const handler = shortcuts[key];\n  if (handler) {\n    e.preventDefault();\n    handler();\n  }\n});',
                        content: "常用按键处理。"
                    },
                    {
                        title: "输入法问题",
                        code: '/* 输入法（IME）事件 */\n\n// compositionstart - 开始输入\ninput.addEventListener("compositionstart", () => {\n  console.log("开始输入中文");\n});\n\n// compositionupdate - 输入中\ninput.addEventListener("compositionupdate", (e) => {\n  console.log("输入中:", e.data);\n});\n\n// compositionend - 完成输入\ninput.addEventListener("compositionend", (e) => {\n  console.log("完成输入:", e.data);\n});\n\n/* 处理输入法 */\nlet isComposing = false;\n\ninput.addEventListener("compositionstart", () => {\n  isComposing = true;\n});\n\ninput.addEventListener("compositionend", () => {\n  isComposing = false;\n});\n\ninput.addEventListener("keydown", (e) => {\n  if (e.key === "Enter" && !isComposing) {\n    // 确保不是输入法确认\n    submitForm();\n  }\n});',
                        content: "处理输入法事件。"
                    }
                ]
            },
            source: "DOM事件"
        },
        {
            difficulty: "medium",
            tags: ["表单事件", "输入"],
            question: "input、change、blur事件的区别？",
            type: "multiple-choice",
            options: [
                "input每次输入都触发",
                "change失去焦点且值改变时触发",
                "blur失去焦点时触发",
                "三者触发时机不同"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表单事件",
                description: "处理表单交互。",
                sections: [
                    {
                        title: "input vs change",
                        code: '/* input - 每次输入都触发 */\ninput.addEventListener("input", (e) => {\n  console.log("输入:", e.target.value);\n  // 实时验证、搜索建议等\n});\n\n// 输入"abc"会触发3次：\n// "a"\n// "ab"\n// "abc"\n\n/* change - 值改变且失去焦点 */\ninput.addEventListener("change", (e) => {\n  console.log("改变:", e.target.value);\n});\n\n// 输入"abc"只在失去焦点时触发1次\n\n/* 不同类型的change */\n\n// text: 失去焦点且值变化\n<input type="text">\n\n// checkbox/radio: 点击时立即触发\n<input type="checkbox">\n\n// select: 选项改变时立即触发\n<select>\n  <option>选项1</option>\n</select>\n\n// file: 选择文件后立即触发\n<input type="file">',
                        content: "input实时，change在失焦后。"
                    },
                    {
                        title: "焦点事件",
                        code: '/* focus - 获得焦点 */\ninput.addEventListener("focus", () => {\n  console.log("获得焦点");\n  input.classList.add("focused");\n});\n\n/* blur - 失去焦点 */\ninput.addEventListener("blur", () => {\n  console.log("失去焦点");\n  input.classList.remove("focused");\n  validate(input);  // 验证输入\n});\n\n/* focusin/focusout - 冒泡版本 */\n// focus/blur不冒泡\n// focusin/focusout冒泡\n\nform.addEventListener("focusin", (e) => {\n  console.log("表单内元素获得焦点:", e.target);\n});\n\nform.addEventListener("focusout", (e) => {\n  console.log("表单内元素失去焦点:", e.target);\n});\n\n/* 程序触发焦点 */\ninput.focus();     // 获得焦点\ninput.blur();      // 失去焦点\ninput.select();    // 选中内容',
                        content: "焦点事件。"
                    },
                    {
                        title: "submit事件",
                        code: '/* submit - 表单提交 */\nform.addEventListener("submit", (e) => {\n  e.preventDefault();  // 阻止默认提交\n  \n  // 验证\n  if (!validate()) {\n    return;\n  }\n  \n  // 获取数据\n  const formData = new FormData(form);\n  \n  // Ajax提交\n  fetch("/api/submit", {\n    method: "POST",\n    body: formData\n  });\n});\n\n/* 触发submit的方式 */\n1. 点击<button type="submit">\n2. 点击<input type="submit">\n3. 在输入框按Enter\n4. 调用form.submit()（不触发submit事件）\n5. 调用form.requestSubmit()（触发submit事件）\n\n/* reset事件 */\nform.addEventListener("reset", (e) => {\n  if (!confirm("确定重置？")) {\n    e.preventDefault();\n  }\n});',
                        content: "表单提交事件。"
                    },
                    {
                        title: "实时验证",
                        code: '/* 实时验证示例 */\n\nconst emailInput = document.getElementById("email");\nconst emailError = document.getElementById("email-error");\n\n// 实时提示\nemailInput.addEventListener("input", (e) => {\n  const value = e.target.value;\n  if (value && !isValidEmail(value)) {\n    emailError.textContent = "邮箱格式不正确";\n    emailInput.classList.add("invalid");\n  } else {\n    emailError.textContent = "";\n    emailInput.classList.remove("invalid");\n  }\n});\n\n// 失焦验证\nemailInput.addEventListener("blur", () => {\n  const value = emailInput.value;\n  if (!value) {\n    emailError.textContent = "邮箱不能为空";\n  } else if (!isValidEmail(value)) {\n    emailError.textContent = "邮箱格式不正确";\n  }\n});\n\nfunction isValidEmail(email) {\n  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);\n}\n\n/* 密码强度 */\nconst passwordInput = document.getElementById("password");\nconst strengthMeter = document.getElementById("strength");\n\npasswordInput.addEventListener("input", (e) => {\n  const strength = calculateStrength(e.target.value);\n  strengthMeter.className = strength; // weak/medium/strong\n  strengthMeter.textContent = {\n    weak: "弱",\n    medium: "中",\n    strong: "强"\n  }[strength];\n});',
                        content: "表单实时验证。"
                    },
                    {
                        title: "其他表单事件",
                        code: '/* select - 文本选中 */\ninput.addEventListener("select", () => {\n  const selected = input.value.substring(\n    input.selectionStart,\n    input.selectionEnd\n  );\n  console.log("选中:", selected);\n});\n\n/* invalid - HTML5验证失败 */\ninput.addEventListener("invalid", (e) => {\n  e.preventDefault();\n  // 自定义错误提示\n  showError(input, input.validationMessage);\n});\n\n/* 示例：自定义验证 */\n<form>\n  <input type="email" required>\n  <button>提交</button>\n</form>\n\nconst emailInput = document.querySelector("[type=email]");\n\nemailInput.addEventListener("invalid", (e) => {\n  e.preventDefault();\n  \n  if (emailInput.validity.valueMissing) {\n    showError("邮箱不能为空");\n  } else if (emailInput.validity.typeMismatch) {\n    showError("邮箱格式不正确");\n  }\n});\n\n/* beforeinput - 输入前（可取消） */\ninput.addEventListener("beforeinput", (e) => {\n  // 只允许数字\n  if (!/\\d/.test(e.data)) {\n    e.preventDefault();\n  }\n});',
                        content: "其他有用的表单事件。"
                    }
                ]
            },
            source: "HTML表单"
        },
        {
            difficulty: "hard",
            tags: ["自定义事件", "高级"],
            question: "如何创建和触发自定义事件？",
            type: "multiple-choice",
            options: [
                "使用CustomEvent构造函数",
                "使用dispatchEvent触发",
                "可以传递自定义数据",
                "支持冒泡和捕获"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "自定义事件",
                description: "创建和使用自定义事件。",
                sections: [
                    {
                        title: "创建自定义事件",
                        code: '/* CustomEvent构造函数 */\n\nconst event = new CustomEvent("myEvent", {\n  detail: {          // 自定义数据\n    message: "Hello",\n    value: 123\n  },\n  bubbles: true,     // 是否冒泡\n  cancelable: true   // 是否可取消\n});\n\n// 触发事件\nelement.dispatchEvent(event);\n\n/* Event构造函数（不能传数据） */\nconst event = new Event("click", {\n  bubbles: true,\n  cancelable: true\n});\n\nelement.dispatchEvent(event);',
                        content: "使用CustomEvent创建。"
                    },
                    {
                        title: "监听和触发",
                        code: '/* 完整示例 */\n\n// 监听自定义事件\nconst button = document.querySelector("button");\n\nbutton.addEventListener("custom:click", (e) => {\n  console.log("收到自定义事件");\n  console.log("数据:", e.detail);\n});\n\n// 触发自定义事件\nfunction triggerCustomEvent() {\n  const event = new CustomEvent("custom:click", {\n    detail: {\n      timestamp: Date.now(),\n      user: "张三"\n    },\n    bubbles: true\n  });\n  \n  button.dispatchEvent(event);\n}\n\ntriggerCustomEvent();\n\n/* 事件命名建议 */\n使用命名空间，如：\napp:ready\nuser:login\ndata:loaded\nmodal:open',
                        content: "监听和触发自定义事件。"
                    },
                    {
                        title: "组件通信",
                        code: '/* 使用自定义事件实现组件通信 */\n\n// 子组件\nclass ChildComponent {\n  constructor(element) {\n    this.element = element;\n  }\n  \n  notify(data) {\n    const event = new CustomEvent("child:change", {\n      detail: data,\n      bubbles: true\n    });\n    this.element.dispatchEvent(event);\n  }\n}\n\n// 父组件\nclass ParentComponent {\n  constructor(element) {\n    this.element = element;\n    this.listen();\n  }\n  \n  listen() {\n    this.element.addEventListener("child:change", (e) => {\n      console.log("子组件通知:", e.detail);\n      this.handleChildChange(e.detail);\n    });\n  }\n  \n  handleChildChange(data) {\n    // 处理子组件事件\n  }\n}\n\n// 使用\nconst parent = new ParentComponent(document.getElementById("parent"));\nconst child = new ChildComponent(document.getElementById("child"));\n\nchild.notify({ value: 100 });',
                        content: "组件间通信。"
                    },
                    {
                        title: "事件总线",
                        code: '/* 简单的事件总线 */\n\nclass EventBus {\n  constructor() {\n    this.events = {};\n  }\n  \n  on(event, callback) {\n    if (!this.events[event]) {\n      this.events[event] = [];\n    }\n    this.events[event].push(callback);\n  }\n  \n  off(event, callback) {\n    if (!this.events[event]) return;\n    \n    this.events[event] = this.events[event].filter(\n      cb => cb !== callback\n    );\n  }\n  \n  emit(event, data) {\n    if (!this.events[event]) return;\n    \n    this.events[event].forEach(callback => {\n      callback(data);\n    });\n  }\n  \n  once(event, callback) {\n    const wrapper = (data) => {\n      callback(data);\n      this.off(event, wrapper);\n    };\n    this.on(event, wrapper);\n  }\n}\n\n// 使用\nconst bus = new EventBus();\n\n// 订阅\nbus.on("user:login", (user) => {\n  console.log("用户登录:", user);\n});\n\n// 发布\nbus.emit("user:login", { name: "张三", id: 1 });\n\n// 只监听一次\nbus.once("app:ready", () => {\n  console.log("应用就绪");\n});',
                        content: "实现事件总线。"
                    },
                    {
                        title: "取消事件",
                        code: '/* 可取消的自定义事件 */\n\nelement.addEventListener("before:delete", (e) => {\n  if (!confirm("确定删除？")) {\n    e.preventDefault();  // 取消事件\n  }\n});\n\nfunction deleteItem() {\n  const event = new CustomEvent("before:delete", {\n    cancelable: true\n  });\n  \n  const allowed = element.dispatchEvent(event);\n  \n  if (allowed) {\n    // 执行删除\n    console.log("删除");\n  } else {\n    console.log("取消删除");\n  }\n}\n\ndeleteItem();',
                        content: "可取消的自定义事件。"
                    },
                    {
                        title: "实际应用",
                        code: '/* 应用场景 */\n\n// 1. 表单验证\nform.addEventListener("form:validate", (e) => {\n  const errors = validateForm(form);\n  if (errors.length > 0) {\n    e.preventDefault();\n    e.detail.errors = errors;\n  }\n});\n\n// 2. 数据加载\nconst event = new CustomEvent("data:loaded", {\n  detail: { data: responseData }\n});\ndocument.dispatchEvent(event);\n\n// 3. 路由变化\nwindow.addEventListener("route:change", (e) => {\n  const { path } = e.detail;\n  loadPage(path);\n});\n\nfunction navigate(path) {\n  const event = new CustomEvent("route:change", {\n    detail: { path }\n  });\n  window.dispatchEvent(event);\n}\n\n// 4. 模态框\nconst modal = document.querySelector(".modal");\n\nmodal.addEventListener("modal:open", () => {\n  modal.classList.add("show");\n});\n\nmodal.addEventListener("modal:close", () => {\n  modal.classList.remove("show");\n});\n\nfunction openModal() {\n  modal.dispatchEvent(new Event("modal:open"));\n}\n\nfunction closeModal() {\n  modal.dispatchEvent(new Event("modal:close"));\n}',
                        content: "自定义事件的实际应用。"
                    }
                ]
            },
            source: "DOM事件规范"
        }
    ],
    navigation: {
        prev: { title: "浏览器渲染原理", url: "20-rendering-quiz.html" },
        next: { title: "Canvas基础", url: "22-canvas-quiz.html" }
    }
};
