// 第25章：拖放API - 面试题
window.htmlQuizData_25 = {
    config: {
        title: "拖放API",
        icon: "🖱️",
        description: "测试你对HTML5拖放API的理解",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["拖放", "基础"],
            question: "如何使元素可拖动？",
            type: "single-choice",
            options: [
                "添加draggable=\"true\"属性",
                "添加ondrag事件",
                "使用CSS drag属性",
                "元素默认可拖动"
            ],
            correctAnswer: "A",
            explanation: {
                title: "可拖动元素",
                description: "设置元素的拖动属性。",
                sections: [
                    {
                        title: "draggable属性",
                        code: '<!-- 可拖动元素 -->\n<div draggable="true">可以拖动我</div>\n\n<!-- 不可拖动（默认）-->\n<div draggable="false">不能拖动</div>\n\n<!-- 默认可拖动的元素 -->\n<img src="image.jpg" alt="图片默认可拖动">\n<a href="#">链接默认可拖动</a>\n<input type="text" value="文本默认可拖动选中内容">',
                        content: "draggable属性控制拖动。"
                    },
                    {
                        title: "基本示例",
                        code: '<!-- HTML -->\n<div id="dragItem" draggable="true">\n  拖动我\n</div>\n\n<div id="dropZone">\n  放置区域\n</div>\n\n<script>\nconst dragItem = document.getElementById("dragItem");\n\ndragItem.addEventListener("dragstart", (e) => {\n  console.log("开始拖动");\n});\n</script>',
                        content: "简单的拖动示例。"
                    }
                ]
            },
            source: "HTML5 Drag and Drop"
        },
        {
            difficulty: "medium",
            tags: ["拖放", "事件"],
            question: "拖放API的事件顺序是什么？",
            type: "single-choice",
            options: [
                "dragstart → drag → dragenter → dragover → drop → dragend",
                "drag → dragstart → drop → dragend",
                "dragstart → dragend",
                "dragover → drop"
            ],
            correctAnswer: "A",
            explanation: {
                title: "拖放事件流程",
                description: "完整的拖放事件顺序。",
                sections: [
                    {
                        title: "拖动源事件",
                        code: '/* 被拖动元素上的事件 */\n\n1. dragstart  - 开始拖动\n2. drag       - 拖动中（持续触发）\n3. dragend    - 拖动结束\n\nelement.addEventListener("dragstart", (e) => {\n  console.log("开始拖动");\n  e.dataTransfer.effectAllowed = "move";\n});\n\nelement.addEventListener("drag", (e) => {\n  console.log("拖动中...");\n});\n\nelement.addEventListener("dragend", (e) => {\n  console.log("拖动结束");\n});',
                        content: "拖动源的三个事件。"
                    },
                    {
                        title: "放置目标事件",
                        code: '/* 放置区域上的事件 */\n\n1. dragenter  - 拖入区域\n2. dragover   - 在区域上方（持续触发）\n3. dragleave  - 离开区域\n4. drop       - 放置到区域\n\ndropZone.addEventListener("dragenter", (e) => {\n  console.log("进入放置区");\n  e.preventDefault();\n});\n\ndropZone.addEventListener("dragover", (e) => {\n  e.preventDefault(); // 必须！允许drop\n  e.dataTransfer.dropEffect = "move";\n});\n\ndropZone.addEventListener("dragleave", (e) => {\n  console.log("离开放置区");\n});\n\ndropZone.addEventListener("drop", (e) => {\n  e.preventDefault();\n  console.log("放置成功");\n});',
                        content: "放置目标的四个事件。"
                    },
                    {
                        title: "完整流程",
                        code: '/* 拖动流程示例 */\n\n用户拖动元素A到区域B：\n\nA: dragstart\nA: drag (多次)\nB: dragenter\nB: dragover (多次)\nA: drag (多次)\nB: drop\nA: dragend\n\n如果拖出区域B：\nB: dragleave',
                        content: "完整的事件顺序。"
                    }
                ]
            },
            source: "Drag and Drop Events"
        },
        {
            difficulty: "medium",
            tags: ["DataTransfer", "数据传递"],
            question: "DataTransfer对象的作用？",
            type: "multiple-choice",
            options: [
                "存储拖动数据",
                "设置拖动效果",
                "传递文件",
                "设置拖动图像"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "DataTransfer对象",
                description: "拖放操作中的数据传输对象。",
                sections: [
                    {
                        title: "存储和获取数据",
                        code: '/* 在dragstart中设置数据 */\nelement.addEventListener("dragstart", (e) => {\n  // 存储文本数据\n  e.dataTransfer.setData("text/plain", "Hello");\n  \n  // 存储HTML\n  e.dataTransfer.setData("text/html", "<b>Bold</b>");\n  \n  // 存储JSON\n  const data = { id: 1, name: "Item" };\n  e.dataTransfer.setData("application/json", JSON.stringify(data));\n});\n\n/* 在drop中获取数据 */\ndropZone.addEventListener("drop", (e) => {\n  e.preventDefault();\n  \n  const text = e.dataTransfer.getData("text/plain");\n  const html = e.dataTransfer.getData("text/html");\n  const json = JSON.parse(e.dataTransfer.getData("application/json"));\n  \n  console.log(text, html, json);\n});',
                        content: "存储和传递数据。"
                    },
                    {
                        title: "拖动效果",
                        code: '/* effectAllowed - 允许的效果 */\nelement.addEventListener("dragstart", (e) => {\n  e.dataTransfer.effectAllowed = "move";\n  // 可选值:\n  // "none", "copy", "link", "move", \n  // "copyMove", "linkMove", "all"\n});\n\n/* dropEffect - 实际效果 */\ndropZone.addEventListener("dragover", (e) => {\n  e.preventDefault();\n  e.dataTransfer.dropEffect = "move";\n  // 可选值: "none", "copy", "link", "move"\n});\n\n/* 效果对应的鼠标图标 */\ncopy - 加号\nmove - 默认箭头\nlink - 链接图标\nnone - 禁止图标',
                        content: "设置拖动效果。"
                    },
                    {
                        title: "拖动文件",
                        code: '/* 拖放文件 */\ndropZone.addEventListener("drop", (e) => {\n  e.preventDefault();\n  \n  const files = e.dataTransfer.files;\n  \n  for (let file of files) {\n    console.log("文件名:", file.name);\n    console.log("类型:", file.type);\n    console.log("大小:", file.size);\n    \n    // 读取文件\n    const reader = new FileReader();\n    reader.onload = (e) => {\n      console.log("内容:", e.target.result);\n    };\n    reader.readAsText(file);\n  }\n});',
                        content: "处理文件拖放。"
                    },
                    {
                        title: "自定义拖动图像",
                        code: '/* setDragImage() */\nelement.addEventListener("dragstart", (e) => {\n  // 使用现有元素\n  const dragIcon = document.getElementById("dragIcon");\n  e.dataTransfer.setDragImage(dragIcon, 0, 0);\n  \n  // 创建临时元素\n  const ghost = document.createElement("div");\n  ghost.textContent = "拖动中...";\n  ghost.style.position = "absolute";\n  ghost.style.top = "-1000px";\n  document.body.appendChild(ghost);\n  e.dataTransfer.setDragImage(ghost, 0, 0);\n});',
                        content: "自定义拖动图标。"
                    }
                ]
            },
            source: "DataTransfer API"
        },
        {
            difficulty: "hard",
            tags: ["拖放", "排序"],
            question: "如何实现可拖动排序的列表？",
            type: "multiple-choice",
            options: [
                "监听dragstart和drop",
                "使用insertBefore",
                "判断拖动位置",
                "更新DOM顺序"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "拖动排序列表",
                description: "实现列表项的拖动排序。",
                sections: [
                    {
                        title: "HTML结构",
                        code: '<!-- 可排序列表 -->\n<ul id="sortable">\n  <li draggable="true" data-id="1">项目 1</li>\n  <li draggable="true" data-id="2">项目 2</li>\n  <li draggable="true" data-id="3">项目 3</li>\n  <li draggable="true" data-id="4">项目 4</li>\n</ul>\n\n<style>\nli {\n  padding: 10px;\n  margin: 5px 0;\n  background: #f0f0f0;\n  cursor: move;\n  user-select: none;\n}\n\nli.dragging {\n  opacity: 0.5;\n}\n\nli.drag-over {\n  border-top: 2px solid blue;\n}\n</style>',
                        content: "基本HTML结构。"
                    },
                    {
                        title: "JavaScript实现",
                        code: 'const sortable = document.getElementById("sortable");\nlet draggedItem = null;\n\n// 开始拖动\nsortable.addEventListener("dragstart", (e) => {\n  draggedItem = e.target;\n  e.target.classList.add("dragging");\n  e.dataTransfer.effectAllowed = "move";\n});\n\n// 结束拖动\nsortable.addEventListener("dragend", (e) => {\n  e.target.classList.remove("dragging");\n  \n  // 清除所有高亮\n  document.querySelectorAll("li").forEach(item => {\n    item.classList.remove("drag-over");\n  });\n});\n\n// 拖动经过\nsortable.addEventListener("dragover", (e) => {\n  e.preventDefault();\n  \n  const target = e.target.closest("li");\n  if (!target || target === draggedItem) return;\n  \n  // 判断插入位置\n  const rect = target.getBoundingClientRect();\n  const midpoint = rect.top + rect.height / 2;\n  \n  // 移除所有高亮\n  document.querySelectorAll("li").forEach(item => {\n    item.classList.remove("drag-over");\n  });\n  \n  if (e.clientY < midpoint) {\n    // 插入到目标前面\n    target.parentNode.insertBefore(draggedItem, target);\n  } else {\n    // 插入到目标后面\n    target.parentNode.insertBefore(draggedItem, target.nextSibling);\n  }\n  \n  target.classList.add("drag-over");\n});',
                        content: "核心排序逻辑。"
                    },
                    {
                        title: "优化版本",
                        code: 'class SortableList {\n  constructor(listId) {\n    this.list = document.getElementById(listId);\n    this.draggedItem = null;\n    this.init();\n  }\n  \n  init() {\n    this.list.addEventListener("dragstart", this.handleDragStart.bind(this));\n    this.list.addEventListener("dragover", this.handleDragOver.bind(this));\n    this.list.addEventListener("dragend", this.handleDragEnd.bind(this));\n    this.list.addEventListener("drop", this.handleDrop.bind(this));\n  }\n  \n  handleDragStart(e) {\n    this.draggedItem = e.target;\n    e.target.style.opacity = "0.5";\n    e.dataTransfer.effectAllowed = "move";\n  }\n  \n  handleDragOver(e) {\n    e.preventDefault();\n    e.dataTransfer.dropEffect = "move";\n    \n    const target = e.target.closest("li");\n    if (!target || target === this.draggedItem) return;\n    \n    const rect = target.getBoundingClientRect();\n    const midpoint = rect.top + rect.height / 2;\n    \n    if (e.clientY < midpoint) {\n      target.parentNode.insertBefore(this.draggedItem, target);\n    } else {\n      target.parentNode.insertBefore(this.draggedItem, target.nextSibling);\n    }\n  }\n  \n  handleDrop(e) {\n    e.stopPropagation();\n    return false;\n  }\n  \n  handleDragEnd(e) {\n    e.target.style.opacity = "1";\n    this.saveOrder();\n  }\n  \n  saveOrder() {\n    const items = Array.from(this.list.querySelectorAll("li"));\n    const order = items.map(item => item.dataset.id);\n    console.log("新顺序:", order);\n    // 发送到服务器保存\n  }\n}\n\nconst sortable = new SortableList("sortable");',
                        content: "面向对象的实现。"
                    }
                ]
            },
            source: "Sortable List"
        },
        {
            difficulty: "medium",
            tags: ["文件", "上传"],
            question: "如何实现文件拖放上传？",
            type: "multiple-choice",
            options: [
                "监听drop事件",
                "获取dataTransfer.files",
                "使用FileReader",
                "FormData上传"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "文件拖放上传",
                description: "实现拖放文件上传功能。",
                sections: [
                    {
                        title: "基本实现",
                        code: '<!-- HTML -->\n<div id="dropArea">\n  <p>拖放文件到这里</p>\n</div>\n<div id="preview"></div>\n\n<style>\n#dropArea {\n  border: 2px dashed #ccc;\n  padding: 50px;\n  text-align: center;\n  transition: all 0.3s;\n}\n\n#dropArea.highlight {\n  background: #e3f2fd;\n  border-color: #2196f3;\n}\n</style>\n\n<script>\nconst dropArea = document.getElementById("dropArea");\nconst preview = document.getElementById("preview");\n\n// 阻止默认行为\n["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {\n  dropArea.addEventListener(eventName, (e) => {\n    e.preventDefault();\n    e.stopPropagation();\n  });\n});\n\n// 视觉反馈\n["dragenter", "dragover"].forEach(eventName => {\n  dropArea.addEventListener(eventName, () => {\n    dropArea.classList.add("highlight");\n  });\n});\n\n["dragleave", "drop"].forEach(eventName => {\n  dropArea.addEventListener(eventName, () => {\n    dropArea.classList.remove("highlight");\n  });\n});\n\n// 处理文件\ndropArea.addEventListener("drop", (e) => {\n  const files = e.dataTransfer.files;\n  handleFiles(files);\n});\n</script>',
                        content: "拖放区域设置。"
                    },
                    {
                        title: "文件处理",
                        code: 'function handleFiles(files) {\n  [...files].forEach(file => {\n    // 验证文件类型\n    if (!file.type.startsWith("image/")) {\n      alert("只能上传图片");\n      return;\n    }\n    \n    // 验证文件大小（5MB）\n    if (file.size > 5 * 1024 * 1024) {\n      alert("文件太大，最大5MB");\n      return;\n    }\n    \n    // 预览图片\n    previewFile(file);\n    \n    // 上传文件\n    uploadFile(file);\n  });\n}\n\nfunction previewFile(file) {\n  const reader = new FileReader();\n  \n  reader.onload = (e) => {\n    const img = document.createElement("img");\n    img.src = e.target.result;\n    img.style.maxWidth = "200px";\n    img.style.margin = "10px";\n    preview.appendChild(img);\n  };\n  \n  reader.readAsDataURL(file);\n}\n\nfunction uploadFile(file) {\n  const formData = new FormData();\n  formData.append("file", file);\n  \n  fetch("/upload", {\n    method: "POST",\n    body: formData\n  })\n  .then(response => response.json())\n  .then(data => {\n    console.log("上传成功", data);\n  })\n  .catch(error => {\n    console.error("上传失败", error);\n  });\n}',
                        content: "文件验证和上传。"
                    },
                    {
                        title: "进度显示",
                        code: 'function uploadFile(file) {\n  const formData = new FormData();\n  formData.append("file", file);\n  \n  const xhr = new XMLHttpRequest();\n  \n  // 上传进度\n  xhr.upload.addEventListener("progress", (e) => {\n    if (e.lengthComputable) {\n      const percent = (e.loaded / e.total) * 100;\n      console.log(`上传进度: ${percent.toFixed(2)}%`);\n      updateProgressBar(percent);\n    }\n  });\n  \n  // 完成\n  xhr.addEventListener("load", () => {\n    if (xhr.status === 200) {\n      console.log("上传成功");\n    }\n  });\n  \n  // 错误\n  xhr.addEventListener("error", () => {\n    console.error("上传失败");\n  });\n  \n  xhr.open("POST", "/upload");\n  xhr.send(formData);\n}\n\nfunction updateProgressBar(percent) {\n  const progress = document.getElementById("progress");\n  progress.style.width = percent + "%";\n  progress.textContent = percent.toFixed(0) + "%";\n}',
                        content: "显示上传进度。"
                    }
                ]
            },
            source: "File Upload"
        },
        {
            difficulty: "easy",
            tags: ["拖放", "视觉反馈"],
            question: "如何给拖放操作添加视觉反馈？",
            type: "multiple-choice",
            options: [
                "dragover时添加样式",
                "dragleave时移除样式",
                "dragstart时改变透明度",
                "dragend时恢复样式"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "拖放视觉反馈",
                description: "提升用户体验的视觉提示。",
                sections: [
                    {
                        title: "拖动源反馈",
                        code: '/* 拖动时的样式 */\nelement.addEventListener("dragstart", (e) => {\n  e.target.style.opacity = "0.5";\n  e.target.classList.add("dragging");\n});\n\nelement.addEventListener("dragend", (e) => {\n  e.target.style.opacity = "1";\n  e.target.classList.remove("dragging");\n});\n\n/* CSS */\n.dragging {\n  opacity: 0.5;\n  cursor: move;\n  transform: scale(0.95);\n}',
                        content: "拖动元素的样式变化。"
                    },
                    {
                        title: "放置区反馈",
                        code: '/* 拖入时的样式 */\ndropZone.addEventListener("dragenter", (e) => {\n  e.preventDefault();\n  dropZone.classList.add("drag-over");\n});\n\ndropZone.addEventListener("dragleave", (e) => {\n  dropZone.classList.remove("drag-over");\n});\n\ndropZone.addEventListener("drop", (e) => {\n  e.preventDefault();\n  dropZone.classList.remove("drag-over");\n  dropZone.classList.add("dropped");\n});\n\n/* CSS */\n.drop-zone {\n  border: 2px dashed #ccc;\n  transition: all 0.3s;\n}\n\n.drop-zone.drag-over {\n  background: #e3f2fd;\n  border-color: #2196f3;\n  transform: scale(1.02);\n}\n\n.drop-zone.dropped {\n  background: #c8e6c9;\n  border-color: #4caf50;\n}',
                        content: "放置区的样式变化。"
                    },
                    {
                        title: "动画效果",
                        code: '/* 放置动画 */\ndropZone.addEventListener("drop", (e) => {\n  e.preventDefault();\n  \n  // 添加放置动画\n  const ripple = document.createElement("div");\n  ripple.className = "ripple";\n  ripple.style.left = e.clientX + "px";\n  ripple.style.top = e.clientY + "px";\n  dropZone.appendChild(ripple);\n  \n  setTimeout(() => ripple.remove(), 600);\n});\n\n/* CSS动画 */\n.ripple {\n  position: absolute;\n  width: 20px;\n  height: 20px;\n  background: rgba(33, 150, 243, 0.5);\n  border-radius: 50%;\n  transform: translate(-50%, -50%);\n  animation: ripple 0.6s ease-out;\n}\n\n@keyframes ripple {\n  to {\n    width: 200px;\n    height: 200px;\n    opacity: 0;\n  }\n}',
                        content: "添加动画效果。"
                    }
                ]
            },
            source: "UX Design"
        },
        {
            difficulty: "medium",
            tags: ["拖放", "看板"],
            question: "如何实现看板（Kanban）拖放功能？",
            type: "multiple-choice",
            options: [
                "多个放置区",
                "数据传递",
                "状态更新",
                "服务器同步"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "看板拖放",
                description: "实现任务看板的拖放功能。",
                sections: [
                    {
                        title: "HTML结构",
                        code: '<!-- 看板 -->\n<div class="board">\n  <!-- 待办列 -->\n  <div class="column" data-status="todo">\n    <h3>待办</h3>\n    <div class="task" draggable="true" data-id="1">\n      任务 1\n    </div>\n    <div class="task" draggable="true" data-id="2">\n      任务 2\n    </div>\n  </div>\n  \n  <!-- 进行中列 -->\n  <div class="column" data-status="doing">\n    <h3>进行中</h3>\n  </div>\n  \n  <!-- 完成列 -->\n  <div class="column" data-status="done">\n    <h3>完成</h3>\n  </div>\n</div>\n\n<style>\n.board {\n  display: flex;\n  gap: 20px;\n}\n\n.column {\n  flex: 1;\n  background: #f5f5f5;\n  padding: 10px;\n  min-height: 400px;\n  border-radius: 4px;\n}\n\n.task {\n  background: white;\n  padding: 10px;\n  margin: 5px 0;\n  border-radius: 4px;\n  cursor: move;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n}\n</style>',
                        content: "看板布局。"
                    },
                    {
                        title: "JavaScript实现",
                        code: 'let draggedTask = null;\n\n// 任务拖动\ndocument.addEventListener("dragstart", (e) => {\n  if (e.target.classList.contains("task")) {\n    draggedTask = e.target;\n    e.dataTransfer.effectAllowed = "move";\n    e.target.style.opacity = "0.5";\n  }\n});\n\ndocument.addEventListener("dragend", (e) => {\n  if (e.target.classList.contains("task")) {\n    e.target.style.opacity = "1";\n  }\n});\n\n// 列接收\ndocument.querySelectorAll(".column").forEach(column => {\n  column.addEventListener("dragover", (e) => {\n    e.preventDefault();\n    e.dataTransfer.dropEffect = "move";\n  });\n  \n  column.addEventListener("drop", (e) => {\n    e.preventDefault();\n    \n    if (draggedTask) {\n      column.appendChild(draggedTask);\n      \n      // 更新任务状态\n      const taskId = draggedTask.dataset.id;\n      const newStatus = column.dataset.status;\n      updateTaskStatus(taskId, newStatus);\n    }\n  });\n});\n\nfunction updateTaskStatus(taskId, status) {\n  console.log(`任务 ${taskId} → ${status}`);\n  \n  // 发送到服务器\n  fetch(`/api/tasks/${taskId}`, {\n    method: "PATCH",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({ status })\n  })\n  .then(response => response.json())\n  .then(data => {\n    console.log("更新成功", data);\n  });\n}',
                        content: "拖放逻辑实现。"
                    },
                    {
                        title: "优化插入位置",
                        code: '/* 在任务之间插入 */\ncolumn.addEventListener("dragover", (e) => {\n  e.preventDefault();\n  \n  const afterElement = getDragAfterElement(column, e.clientY);\n  \n  if (afterElement == null) {\n    column.appendChild(draggedTask);\n  } else {\n    column.insertBefore(draggedTask, afterElement);\n  }\n});\n\nfunction getDragAfterElement(container, y) {\n  const draggableElements = [\n    ...container.querySelectorAll(".task:not(.dragging)")\n  ];\n  \n  return draggableElements.reduce((closest, child) => {\n    const box = child.getBoundingClientRect();\n    const offset = y - box.top - box.height / 2;\n    \n    if (offset < 0 && offset > closest.offset) {\n      return { offset: offset, element: child };\n    } else {\n      return closest;\n    }\n  }, { offset: Number.NEGATIVE_INFINITY }).element;\n}',
                        content: "精确控制插入位置。"
                    }
                ]
            },
            source: "Kanban Board"
        },
        {
            difficulty: "hard",
            tags: ["拖放", "多选"],
            question: "如何实现多个元素同时拖动？",
            type: "single-choice",
            options: [
                "选中多个元素，拖动时一起移动",
                "每次只能拖一个",
                "使用Shift键多选",
                "API不支持"
            ],
            correctAnswer: "A",
            explanation: {
                title: "多选拖动",
                description: "同时拖动多个元素。",
                sections: [
                    {
                        title: "选择元素",
                        code: '/* HTML */\n<div class="container">\n  <div class="item" draggable="true">项目 1</div>\n  <div class="item" draggable="true">项目 2</div>\n  <div class="item" draggable="true">项目 3</div>\n</div>\n\n/* 点击选择 */\nconst selected = new Set();\n\ndocument.querySelectorAll(".item").forEach(item => {\n  item.addEventListener("click", (e) => {\n    if (e.ctrlKey || e.metaKey) {\n      // Ctrl/Cmd + 点击多选\n      if (selected.has(item)) {\n        selected.delete(item);\n        item.classList.remove("selected");\n      } else {\n        selected.add(item);\n        item.classList.add("selected");\n      }\n    } else {\n      // 单选\n      selected.forEach(i => i.classList.remove("selected"));\n      selected.clear();\n      selected.add(item);\n      item.classList.add("selected");\n    }\n  });\n});',
                        content: "多选机制。"
                    },
                    {
                        title: "拖动多个元素",
                        code: '/* 开始拖动 */\ndocument.addEventListener("dragstart", (e) => {\n  if (!e.target.classList.contains("item")) return;\n  \n  // 如果拖动的元素未选中，只拖动它\n  if (!selected.has(e.target)) {\n    selected.forEach(i => i.classList.remove("selected"));\n    selected.clear();\n    selected.add(e.target);\n    e.target.classList.add("selected");\n  }\n  \n  // 存储所有选中元素的ID\n  const ids = Array.from(selected).map(item => item.dataset.id);\n  e.dataTransfer.setData("application/json", JSON.stringify(ids));\n  \n  // 创建拖动图像\n  const ghost = document.createElement("div");\n  ghost.textContent = `${selected.size} 个项目`;\n  ghost.style.position = "absolute";\n  ghost.style.top = "-1000px";\n  ghost.style.background = "#2196f3";\n  ghost.style.color = "white";\n  ghost.style.padding = "10px";\n  ghost.style.borderRadius = "4px";\n  document.body.appendChild(ghost);\n  e.dataTransfer.setDragImage(ghost, 0, 0);\n  \n  setTimeout(() => ghost.remove(), 0);\n});',
                        content: "拖动选中的元素。"
                    },
                    {
                        title: "放置多个元素",
                        code: '/* 放置 */\ndropZone.addEventListener("drop", (e) => {\n  e.preventDefault();\n  \n  const ids = JSON.parse(e.dataTransfer.getData("application/json"));\n  \n  // 移动所有选中的元素\n  ids.forEach(id => {\n    const item = document.querySelector(`[data-id="${id}"]`);\n    if (item) {\n      dropZone.appendChild(item);\n    }\n  });\n  \n  // 清除选择\n  selected.forEach(item => item.classList.remove("selected"));\n  selected.clear();\n  \n  console.log(`移动了 ${ids.length} 个元素`);\n});',
                        content: "批量移动元素。"
                    }
                ]
            },
            source: "Multi-Select Drag"
        },
        {
            difficulty: "medium",
            tags: ["拖放", "兼容性"],
            question: "移动端如何实现拖放功能？",
            type: "single-choice",
            options: [
                "使用触摸事件模拟",
                "原生支持不好",
                "需要polyfill",
                "使用第三方库"
            ],
            correctAnswer: "A",
            explanation: {
                title: "移动端拖放",
                description: "移动设备的拖放实现。",
                sections: [
                    {
                        title: "问题",
                        code: '/* 移动端拖放API支持差 */\n\n- iOS Safari: 部分支持\n- Android Chrome: 部分支持\n- 触摸和拖放冲突\n- 体验不佳\n\n因此需要使用触摸事件实现',
                        content: "原生支持不完善。"
                    },
                    {
                        title: "触摸事件实现",
                        code: '/* 使用touchstart, touchmove, touchend */\n\nlet draggedElement = null;\nlet offsetX, offsetY;\n\nelement.addEventListener("touchstart", (e) => {\n  draggedElement = e.target;\n  const touch = e.touches[0];\n  const rect = draggedElement.getBoundingClientRect();\n  \n  offsetX = touch.clientX - rect.left;\n  offsetY = touch.clientY - rect.top;\n  \n  draggedElement.style.opacity = "0.5";\n});\n\ndocument.addEventListener("touchmove", (e) => {\n  if (!draggedElement) return;\n  \n  e.preventDefault();\n  const touch = e.touches[0];\n  \n  draggedElement.style.position = "fixed";\n  draggedElement.style.left = touch.clientX - offsetX + "px";\n  draggedElement.style.top = touch.clientY - offsetY + "px";\n  draggedElement.style.zIndex = "1000";\n});\n\ndocument.addEventListener("touchend", (e) => {\n  if (!draggedElement) return;\n  \n  const touch = e.changedTouches[0];\n  const dropTarget = document.elementFromPoint(\n    touch.clientX,\n    touch.clientY\n  );\n  \n  // 检查是否在放置区\n  const dropZone = dropTarget.closest(".drop-zone");\n  if (dropZone) {\n    dropZone.appendChild(draggedElement);\n  }\n  \n  // 重置样式\n  draggedElement.style.opacity = "1";\n  draggedElement.style.position = "";\n  draggedElement.style.left = "";\n  draggedElement.style.top = "";\n  draggedElement.style.zIndex = "";\n  \n  draggedElement = null;\n});',
                        content: "使用触摸事件。"
                    },
                    {
                        title: "统一API",
                        code: '/* 同时支持桌面和移动端 */\n\nclass DragDrop {\n  constructor(element) {\n    this.element = element;\n    this.isMobile = "ontouchstart" in window;\n    \n    if (this.isMobile) {\n      this.initTouch();\n    } else {\n      this.initDrag();\n    }\n  }\n  \n  initDrag() {\n    this.element.draggable = true;\n    this.element.addEventListener("dragstart", this.onDragStart);\n    this.element.addEventListener("dragend", this.onDragEnd);\n  }\n  \n  initTouch() {\n    this.element.addEventListener("touchstart", this.onTouchStart);\n    this.element.addEventListener("touchmove", this.onTouchMove);\n    this.element.addEventListener("touchend", this.onTouchEnd);\n  }\n  \n  onDragStart(e) { /* ... */ }\n  onDragEnd(e) { /* ... */ }\n  onTouchStart(e) { /* ... */ }\n  onTouchMove(e) { /* ... */ }\n  onTouchEnd(e) { /* ... */ }\n}\n\n// 使用\nnew DragDrop(document.querySelector(".draggable"));',
                        content: "兼容桌面和移动端。"
                    }
                ]
            },
            source: "Mobile Drag Drop"
        },
        {
            difficulty: "easy",
            tags: ["拖放", "库"],
            question: "常用的拖放库有哪些？",
            type: "multiple-choice",
            options: [
                "Sortable.js",
                "Drag Drop Touch",
                "interact.js",
                "dnd-kit"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "拖放库",
                description: "简化拖放实现的第三方库。",
                sections: [
                    {
                        title: "Sortable.js",
                        code: '/* Sortable.js - 最流行的排序库 */\nimport Sortable from "sortablejs";\n\nconst el = document.getElementById("items");\nconst sortable = Sortable.create(el, {\n  animation: 150,\n  ghostClass: "sortable-ghost",\n  onEnd: function(evt) {\n    console.log("旧索引:", evt.oldIndex);\n    console.log("新索引:", evt.newIndex);\n  }\n});\n\n/* 特性 */\n- 支持触摸设备\n- 多种动画\n- 拖动手柄\n- 禁用某些项\n- 克隆模式',
                        content: "Sortable.js使用简单。"
                    },
                    {
                        title: "interact.js",
                        code: '/* interact.js - 功能强大 */\nimport interact from "interactjs";\n\ninteract(".draggable")\n  .draggable({\n    inertia: true,\n    modifiers: [\n      interact.modifiers.restrictRect({\n        restriction: "parent"\n      })\n    ],\n    autoScroll: true,\n    onmove: dragMoveListener\n  });\n\nfunction dragMoveListener(event) {\n  const target = event.target;\n  const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;\n  const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;\n  \n  target.style.transform = `translate(${x}px, ${y}px)`;\n  target.setAttribute("data-x", x);\n  target.setAttribute("data-y", y);\n}\n\n/* 特性 */\n- 拖动、缩放、旋转\n- 手势支持\n- 边界限制\n- 自动滚动',
                        content: "interact.js功能丰富。"
                    },
                    {
                        title: "dnd-kit (React)",
                        code: '/* dnd-kit - React拖放库 */\nimport { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";\n\nfunction Draggable({ id, children }) {\n  const { attributes, listeners, setNodeRef } = useDraggable({ id });\n  \n  return (\n    <div ref={setNodeRef} {...listeners} {...attributes}>\n      {children}\n    </div>\n  );\n}\n\nfunction Droppable({ id, children }) {\n  const { setNodeRef } = useDroppable({ id });\n  \n  return (\n    <div ref={setNodeRef}>\n      {children}\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <DndContext>\n      <Draggable id="draggable">拖动我</Draggable>\n      <Droppable id="droppable">放置区</Droppable>\n    </DndContext>\n  );\n}\n\n/* 特性 */\n- React Hooks\n- 无障碍支持\n- 传感器API\n- 模块化',
                        content: "React生态的最佳选择。"
                    }
                ]
            },
            source: "Drag Drop Libraries"
        }
    ],
    navigation: {
        prev: { title: "Web存储", url: "24-storage-quiz.html" },
        next: { title: "地理定位", url: "26-geolocation-quiz.html" }
    }
};
