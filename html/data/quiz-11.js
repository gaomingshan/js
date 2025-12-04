// 第11章：表单高级 - 面试题
window.htmlQuizData_11 = {
    config: {
        title: "表单高级",
        icon: "🚀",
        description: "测试你对HTML表单高级特性的掌握",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "medium",
            tags: ["autocomplete", "自动填充"],
            question: "autocomplete属性的作用和值有哪些？",
            type: "multiple-choice",
            options: [
                "控制浏览器自动填充",
                "可以设置为on或off",
                "支持细粒度控制（name、email等）",
                "提升用户体验"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "autocomplete属性",
                description: "控制浏览器的自动填充行为。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- 启用自动填充（默认） -->\n<input type="text" name="name" autocomplete="on">\n\n<!-- 禁用自动填充 -->\n<input type="password" name="pwd" autocomplete="off">\n\n<!-- 表单级别控制 -->\n<form autocomplete="off">\n  <input type="text" name="search">\n</form>',
                        points: [
                            "on：启用（默认）",
                            "off：禁用",
                            "可在form或input级别设置",
                            "input会覆盖form的设置"
                        ]
                    },
                    {
                        title: "细粒度控制（HTML5.2）",
                        code: '<!-- 姓名 -->\n<input type="text" name="name" autocomplete="name">\n\n<!-- 邮箱 -->\n<input type="email" name="email" autocomplete="email">\n\n<!-- 电话 -->\n<input type="tel" name="phone" autocomplete="tel">\n\n<!-- 地址 -->\n<input type="text" name="address" autocomplete="street-address">\n<input type="text" name="city" autocomplete="address-level2">\n<input type="text" name="zipcode" autocomplete="postal-code">\n<input type="text" name="country" autocomplete="country-name">',
                        points: [
                            "指定具体的自动填充类型",
                            "浏览器会从已保存的数据填充",
                            "提升表单填写速度",
                            "标准化的值名称"
                        ]
                    },
                    {
                        title: "常用autocomplete值",
                        code: '<!-- 个人信息 -->\nautocomplete="name"          // 姓名\nautocomplete="given-name"    // 名\nautocomplete="family-name"   // 姓\nautocomplete="email"         // 邮箱\nautocomplete="tel"           // 电话\nautocomplete="bday"          // 生日\n\n<!-- 地址 -->\nautocomplete="street-address"   // 街道地址\nautocomplete="address-level1"   // 省/州\nautocomplete="address-level2"   // 市\nautocomplete="postal-code"      // 邮编\nautocomplete="country"          // 国家代码\nautocomplete="country-name"     // 国家名称\n\n<!-- 支付信息 -->\nautocomplete="cc-name"       // 持卡人\nautocomplete="cc-number"     // 卡号\nautocomplete="cc-exp"        // 过期日期\nautocomplete="cc-csc"        // 安全码\n\n<!-- 账号 -->\nautocomplete="username"      // 用户名\nautocomplete="new-password"  // 新密码\nautocomplete="current-password"  // 当前密码',
                        content: "完整的autocomplete值列表见HTML规范。"
                    },
                    {
                        title: "新密码 vs 当前密码",
                        code: '<!-- 注册表单 -->\n<form>\n  <input type="text" autocomplete="username">\n  <input type="password" autocomplete="new-password">\n</form>\n\n<!-- 登录表单 -->\n<form>\n  <input type="text" autocomplete="username">\n  <input type="password" autocomplete="current-password">\n</form>\n\n<!-- 修改密码 -->\n<form>\n  <input type="password" autocomplete="current-password" placeholder="当前密码">\n  <input type="password" autocomplete="new-password" placeholder="新密码">\n</form>',
                        points: [
                            "new-password：注册、重置密码",
                            "current-password：登录",
                            "帮助密码管理器识别",
                            "提供更好的用户体验"
                        ]
                    },
                    {
                        title: "组合使用",
                        code: '<!-- 收货地址 -->\n<input autocomplete="shipping name">\n<input autocomplete="shipping street-address">\n<input autocomplete="shipping postal-code">\n\n<!-- 账单地址 -->\n<input autocomplete="billing name">\n<input autocomplete="billing street-address">\n<input autocomplete="billing postal-code">',
                        content: "使用前缀区分不同用途的相同字段。"
                    },
                    {
                        title: "注意事项",
                        points: [
                            "敏感信息考虑禁用",
                            "某些浏览器可能忽略off",
                            "移动浏览器更重视自动填充",
                            "配合适当的input type",
                            "提供更好的用户体验"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["form属性", "关联"],
            question: "form属性的作用是什么？",
            options: [
                "将控件关联到表单",
                "控件可以在form外部",
                "支持多个控件关联同一个form",
                "提交时会包含这些控件"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "form属性",
                description: "HTML5允许表单控件在form元素外部。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<!-- 表单 -->\n<form id="myForm" action="/submit">\n  <input type="text" name="username">\n</form>\n\n<!-- 表单外的控件 -->\n<input type="email" name="email" form="myForm">\n<input type="tel" name="phone" form="myForm">\n<button type="submit" form="myForm">提交</button>',
                        points: [
                            "form属性引用表单的id",
                            "控件可以在DOM的任何位置",
                            "提交时会包含这些控件",
                            "灵活的布局"
                        ]
                    },
                    {
                        title: "使用场景",
                        code: '<!-- 场景1：固定的提交按钮 -->\n<header>\n  <button type="submit" form="editForm">保存</button>\n</header>\n\n<main>\n  <form id="editForm">\n    <!-- 很长的表单 -->\n  </form>\n</main>\n\n<footer>\n  <button type="submit" form="editForm">保存</button>\n</footer>',
                        content: "提交按钮可以在表单外，方便固定定位。"
                    },
                    {
                        title: "场景2：多列布局",
                        code: '<div class="container">\n  <div class="column">\n    <form id="signupForm">\n      <input type="text" name="username">\n    </form>\n  </div>\n  \n  <div class="column">\n    <input type="email" name="email" form="signupForm">\n    <input type="tel" name="phone" form="signupForm">\n  </div>\n</div>',
                        content: "控件可以分布在不同的布局区域。"
                    },
                    {
                        title: "场景3：Dialog中的表单",
                        code: '<form id="contactForm" action="/contact">\n  <input type="text" name="name">\n</form>\n\n<dialog id="myDialog">\n  <h2>更多信息</h2>\n  <input type="email" name="email" form="contactForm">\n  <button type="submit" form="contactForm">提交</button>\n  <button type="button" onclick="myDialog.close()">关闭</button>\n</dialog>',
                        content: "dialog内的控件可以关联外部表单。"
                    },
                    {
                        title: "支持的元素",
                        points: [
                            "<input>",
                            "<button>",
                            "<select>",
                            "<textarea>",
                            "<output>",
                            "基本上所有表单控件"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["Constraint Validation API", "JavaScript"],
            question: "Constraint Validation API提供了哪些功能？",
            type: "multiple-choice",
            options: [
                "checkValidity()检查有效性",
                "setCustomValidity()自定义错误",
                "validity对象包含详细信息",
                "reportValidity()显示错误"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "Constraint Validation API",
                description: "JavaScript API用于控制和自定义表单验证。",
                sections: [
                    {
                        title: "checkValidity()",
                        code: 'const form = document.querySelector("form");\nconst input = document.querySelector("input");\n\n// 检查单个input\nif (input.checkValidity()) {\n  console.log("输入有效");\n} else {\n  console.log("输入无效");\n}\n\n// 检查整个表单\nif (form.checkValidity()) {\n  console.log("表单有效");\n} else {\n  console.log("表单无效");\n}',
                        points: [
                            "返回true/false",
                            "不会显示错误提示",
                            "可用于提交前验证"
                        ]
                    },
                    {
                        title: "reportValidity()",
                        code: 'const form = document.querySelector("form");\n\n// 验证并显示错误\nif (!form.reportValidity()) {\n  console.log("表单验证失败，浏览器已显示错误");\n  return;\n}\n\n// 验证通过，继续处理\nsubmitForm();',
                        points: [
                            "类似checkValidity()",
                            "但会显示浏览器错误提示",
                            "聚焦到第一个错误字段"
                        ]
                    },
                    {
                        title: "validity对象",
                        code: 'const input = document.querySelector("input");\nconst validity = input.validity;\n\nconsole.log(validity.valid);         // 是否有效\nconsole.log(validity.valueMissing);  // 必填但为空\nconsole.log(validity.typeMismatch);  // 类型不匹配\nconsole.log(validity.patternMismatch); // 不符合pattern\nconsole.log(validity.tooLong);       // 超过maxlength\nconsole.log(validity.tooShort);      // 小于minlength\nconsole.log(validity.rangeUnderflow); // 小于min\nconsole.log(validity.rangeOverflow);  // 大于max\nconsole.log(validity.stepMismatch);   // 不符合step\nconsole.log(validity.badInput);       // 无效输入\nconsole.log(validity.customError);    // 自定义错误',
                        content: "validity对象提供详细的验证状态。"
                    },
                    {
                        title: "setCustomValidity()",
                        code: 'const password = document.getElementById("password");\nconst confirm = document.getElementById("confirm");\n\nconfirm.addEventListener("input", function() {\n  if (this.value !== password.value) {\n    this.setCustomValidity("两次密码不一致");\n  } else {\n    this.setCustomValidity("");  // 清除错误\n  }\n});',
                        points: [
                            "设置自定义错误消息",
                            "空字符串清除错误",
                            "只要有自定义错误，字段就无效",
                            "浏览器会显示此消息"
                        ]
                    },
                    {
                        title: "validationMessage",
                        code: 'const input = document.querySelector("input");\n\n// 获取错误消息\nconsole.log(input.validationMessage);\n\n// 显示自定义错误提示\nif (!input.checkValidity()) {\n  const error = document.createElement("span");\n  error.textContent = input.validationMessage;\n  error.className = "error";\n  input.parentNode.appendChild(error);\n}',
                        content: "validationMessage包含浏览器的错误消息。"
                    },
                    {
                        title: "完整示例",
                        code: 'const form = document.getElementById("myForm");\nconst email = document.getElementById("email");\nconst phone = document.getElementById("phone");\n\n// 自定义邮箱验证\nemail.addEventListener("input", function() {\n  if (this.value && !/@company\\.com$/.test(this.value)) {\n    this.setCustomValidity("必须使用公司邮箱");\n  } else {\n    this.setCustomValidity("");\n  }\n});\n\n// 表单提交\nform.addEventListener("submit", function(e) {\n  e.preventDefault();\n  \n  // 验证\n  if (!this.reportValidity()) {\n    return;\n  }\n  \n  // 显示所有错误\n  const inputs = this.querySelectorAll("input");\n  inputs.forEach(input => {\n    if (!input.validity.valid) {\n      console.log(`${input.name}: ${input.validationMessage}`);\n    }\n  });\n  \n  // 提交\n  submitFormData(new FormData(this));\n});',
                        content: "组合使用API实现完整的表单验证。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["FormData", "API"],
            question: "FormData API的用途和用法？",
            type: "multiple-choice",
            options: [
                "收集表单数据",
                "支持文件上传",
                "配合fetch发送",
                "可以动态添加字段"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "FormData API",
                description: "JavaScript API用于处理表单数据。",
                sections: [
                    {
                        title: "基本用法",
                        code: 'const form = document.querySelector("form");\n\n// 从表单创建FormData\nconst formData = new FormData(form);\n\n// 或手动创建\nconst formData = new FormData();\nformData.append("username", "张三");\nformData.append("email", "zhang@example.com");',
                        points: [
                            "从表单自动收集数据",
                            "或手动创建",
                            "支持所有表单字段",
                            "包括文件"
                        ]
                    },
                    {
                        title: "添加和修改数据",
                        code: 'const formData = new FormData();\n\n// append: 添加（允许重复键）\nformData.append("hobby", "reading");\nformData.append("hobby", "music");\n\n// set: 设置（替换已有值）\nformData.set("username", "张三");\nformData.set("username", "李四");  // 替换\n\n// delete: 删除\nformData.delete("hobby");\n\n// has: 检查是否存在\nif (formData.has("username")) {\n  console.log("存在username");\n}\n\n// get: 获取单个值\nconsole.log(formData.get("username"));\n\n// getAll: 获取所有值（重复键）\nconsole.log(formData.getAll("hobby"));',
                        content: "提供丰富的方法操作数据。"
                    },
                    {
                        title: "遍历数据",
                        code: 'const formData = new FormData(form);\n\n// 遍历所有键值对\nfor (const [key, value] of formData.entries()) {\n  console.log(key, value);\n}\n\n// 只遍历键\nfor (const key of formData.keys()) {\n  console.log(key);\n}\n\n// 只遍历值\nfor (const value of formData.values()) {\n  console.log(value);\n}\n\n// forEach\nformData.forEach((value, key) => {\n  console.log(key, value);\n});',
                        content: "支持迭代器和forEach。"
                    },
                    {
                        title: "文件上传",
                        code: '<input type="file" id="avatar" name="avatar">\n\n<script>\nconst input = document.getElementById("avatar");\nconst formData = new FormData();\n\n// 添加文件\ninput.addEventListener("change", function() {\n  const file = this.files[0];\n  formData.append("avatar", file);\n  \n  // 自定义文件名\n  formData.append("avatar", file, "custom-name.jpg");\n});\n\n// 多文件\nconst files = input.files;\nfor (const file of files) {\n  formData.append("files[]", file);\n}\n</script>',
                        content: "支持单个和多个文件上传。"
                    },
                    {
                        title: "配合fetch使用",
                        code: 'const form = document.querySelector("form");\n\nform.addEventListener("submit", async (e) => {\n  e.preventDefault();\n  \n  const formData = new FormData(form);\n  \n  // 添加额外字段\n  formData.append("timestamp", Date.now());\n  \n  try {\n    const response = await fetch("/api/submit", {\n      method: "POST",\n      body: formData  // 不需要设置Content-Type\n    });\n    \n    const result = await response.json();\n    console.log("成功:", result);\n  } catch (error) {\n    console.error("失败:", error);\n  }\n});',
                        points: [
                            "直接作为fetch的body",
                            "浏览器自动设置Content-Type",
                            "multipart/form-data",
                            "支持文件上传"
                        ]
                    },
                    {
                        title: "转换为其他格式",
                        code: '// FormData -> URLSearchParams\nconst formData = new FormData(form);\nconst params = new URLSearchParams(formData);\nconsole.log(params.toString());\n// username=zhang&email=zhang@example.com\n\n// FormData -> JSON\nconst formData = new FormData(form);\nconst obj = Object.fromEntries(formData.entries());\nconst json = JSON.stringify(obj);\n\n// 注意：文件不能直接转JSON\n// 需要先上传或转base64',
                        content: "可以转换为其他数据格式。"
                    },
                    {
                        title: "复杂数据结构",
                        code: '// 嵌套对象\nconst formData = new FormData();\nformData.append("user[name]", "张三");\nformData.append("user[age]", "25");\nformData.append("user[email]", "zhang@example.com");\n\n// 数组\nformData.append("hobbies[]", "reading");\nformData.append("hobbies[]", "music");\nformData.append("hobbies[]", "sports");\n\n// 服务端需要解析这些格式',
                        content: "支持复杂的数据结构。"
                    }
                ]
            },
            source: "XMLHttpRequest规范"
        },
        {
            difficulty: "hard",
            tags: ["文件上传", "高级"],
            question: "文件上传的高级用法和优化？",
            type: "multiple-choice",
            options: [
                "限制文件类型",
                "显示预览",
                "显示上传进度",
                "分片上传大文件"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "文件上传详解",
                description: "文件上传的各种高级技巧。",
                sections: [
                    {
                        title: "限制文件类型",
                        code: '<!-- accept属性 -->\n<input type="file" accept="image/*">  <!-- 所有图片 -->\n<input type="file" accept="image/png, image/jpeg">  <!-- PNG和JPEG -->\n<input type="file" accept=".pdf,.doc,.docx">  <!-- 特定扩展名 -->\n<input type="file" accept="video/*">  <!-- 所有视频 -->\n\n<!-- JavaScript验证 -->\n<script>\ninput.addEventListener("change", function() {\n  const file = this.files[0];\n  const allowedTypes = ["image/png", "image/jpeg"];\n  \n  if (!allowedTypes.includes(file.type)) {\n    alert("只允许PNG和JPEG格式");\n    this.value = "";  // 清空\n    return;\n  }\n  \n  // 文件大小限制（5MB）\n  const maxSize = 5 * 1024 * 1024;\n  if (file.size > maxSize) {\n    alert("文件不能超过5MB");\n    this.value = "";\n    return;\n  }\n});\n</script>',
                        content: "使用accept属性和JavaScript双重验证。"
                    },
                    {
                        title: "图片预览",
                        code: '<input type="file" id="imageInput" accept="image/*">\n<img id="preview" style="max-width: 300px;">\n\n<script>\nconst input = document.getElementById("imageInput");\nconst preview = document.getElementById("preview");\n\ninput.addEventListener("change", function() {\n  const file = this.files[0];\n  if (!file) return;\n  \n  // 方法1：FileReader\n  const reader = new FileReader();\n  reader.onload = function(e) {\n    preview.src = e.target.result;\n  };\n  reader.readAsDataURL(file);\n  \n  // 方法2：URL.createObjectURL（更快）\n  preview.src = URL.createObjectURL(file);\n  \n  // 清理（防止内存泄漏）\n  preview.onload = function() {\n    URL.revokeObjectURL(this.src);\n  };\n});\n</script>',
                        content: "使用FileReader或URL.createObjectURL预览。"
                    },
                    {
                        title: "多文件上传",
                        code: '<input type="file" id="files" multiple>\n<div id="fileList"></div>\n\n<script>\ninput.addEventListener("change", function() {\n  const files = Array.from(this.files);\n  \n  fileList.innerHTML = files.map((file, index) => `\n    <div>\n      <span>${file.name}</span>\n      <span>${(file.size / 1024).toFixed(2)} KB</span>\n      <button onclick="removeFile(${index})">删除</button>\n    </div>\n  `).join("");\n});\n\nfunction removeFile(index) {\n  const dt = new DataTransfer();\n  const files = Array.from(input.files);\n  \n  files.forEach((file, i) => {\n    if (i !== index) dt.items.add(file);\n  });\n  \n  input.files = dt.files;\n  input.dispatchEvent(new Event("change"));\n}\n</script>',
                        content: "multiple属性支持多文件选择。"
                    },
                    {
                        title: "上传进度",
                        code: '<input type="file" id="fileInput">\n<progress id="progress" max="100" value="0"></progress>\n<span id="percent">0%</span>\n\n<script>\nconst fileInput = document.getElementById("fileInput");\nconst progress = document.getElementById("progress");\nconst percent = document.getElementById("percent");\n\nfileInput.addEventListener("change", async function() {\n  const file = this.files[0];\n  if (!file) return;\n  \n  const xhr = new XMLHttpRequest();\n  \n  // 监听上传进度\n  xhr.upload.addEventListener("progress", (e) => {\n    if (e.lengthComputable) {\n      const percentage = (e.loaded / e.total) * 100;\n      progress.value = percentage;\n      percent.textContent = percentage.toFixed(0) + "%";\n    }\n  });\n  \n  // 上传完成\n  xhr.addEventListener("load", () => {\n    console.log("上传成功:", xhr.responseText);\n  });\n  \n  // 上传\n  const formData = new FormData();\n  formData.append("file", file);\n  \n  xhr.open("POST", "/upload");\n  xhr.send(formData);\n});\n</script>',
                        content: "使用XMLHttpRequest监听上传进度。"
                    },
                    {
                        title: "分片上传",
                        code: '// 大文件分片上传\nasync function uploadLargeFile(file) {\n  const chunkSize = 1024 * 1024;  // 1MB per chunk\n  const chunks = Math.ceil(file.size / chunkSize);\n  \n  for (let i = 0; i < chunks; i++) {\n    const start = i * chunkSize;\n    const end = Math.min(start + chunkSize, file.size);\n    const chunk = file.slice(start, end);\n    \n    const formData = new FormData();\n    formData.append("file", chunk);\n    formData.append("filename", file.name);\n    formData.append("chunkIndex", i);\n    formData.append("totalChunks", chunks);\n    \n    await fetch("/upload-chunk", {\n      method: "POST",\n      body: formData\n    });\n    \n    // 更新进度\n    const progress = ((i + 1) / chunks) * 100;\n    console.log(`进度: ${progress.toFixed(0)}%`);\n  }\n  \n  // 通知服务器合并\n  await fetch("/merge-chunks", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({\n      filename: file.name,\n      totalChunks: chunks\n    })\n  });\n  \n  console.log("上传完成");\n}',
                        content: "大文件分片上传，支持断点续传。"
                    },
                    {
                        title: "拖拽上传",
                        code: '<div id="dropZone" style="border: 2px dashed #ccc; padding: 50px;">\n  拖拽文件到这里\n</div>\n\n<script>\nconst dropZone = document.getElementById("dropZone");\n\n// 阻止默认行为\n["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {\n  dropZone.addEventListener(eventName, (e) => {\n    e.preventDefault();\n    e.stopPropagation();\n  });\n});\n\n// 高亮\n["dragenter", "dragover"].forEach(eventName => {\n  dropZone.addEventListener(eventName, () => {\n    dropZone.classList.add("highlight");\n  });\n});\n\n["dragleave", "drop"].forEach(eventName => {\n  dropZone.addEventListener(eventName, () => {\n    dropZone.classList.remove("highlight");\n  });\n});\n\n// 处理文件\ndropZone.addEventListener("drop", (e) => {\n  const files = e.dataTransfer.files;\n  handleFiles(files);\n});\n\nfunction handleFiles(files) {\n  Array.from(files).forEach(uploadFile);\n}\n</script>',
                        content: "支持拖拽上传文件。"
                    }
                ]
            },
            source: "File API"
        },
        {
            difficulty: "medium",
            tags: ["输入模式", "inputmode"],
            question: "inputmode属性的作用？",
            options: [
                "控制移动设备的虚拟键盘",
                "提供更精确的键盘类型",
                "比type属性更细粒度",
                "不影响桌面浏览器"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "inputmode属性",
                description: "控制移动设备上显示的键盘类型。",
                sections: [
                    {
                        title: "inputmode值",
                        code: '<!-- 文本键盘（默认） -->\n<input type="text" inputmode="text">\n\n<!-- 数字键盘 -->\n<input type="text" inputmode="numeric">\n\n<!-- 电话键盘 -->\n<input type="text" inputmode="tel">\n\n<!-- 小数键盘 -->\n<input type="text" inputmode="decimal">\n\n<!-- 邮箱键盘（有@键） -->\n<input type="text" inputmode="email">\n\n<!-- URL键盘（有.com键） -->\n<input type="text" inputmode="url">\n\n<!-- 搜索键盘（回车键显示为"搜索"） -->\n<input type="text" inputmode="search">\n\n<!-- 无键盘 -->\n<input type="text" inputmode="none">',
                        content: "不同的inputmode显示不同的键盘。"
                    },
                    {
                        title: "vs type属性",
                        code: '<!-- type=number：数字输入，有增减按钮，验证 -->\n<input type="number">\n\n<!-- inputmode=numeric：只是键盘，无验证 -->\n<input type="text" inputmode="numeric">\n\n<!-- 实际场景：信用卡号 -->\n<input type="text" \n       inputmode="numeric"\n       pattern="[0-9]{16}"\n       placeholder="1234 5678 9012 3456">',
                        points: [
                            "type：定义输入类型和验证",
                            "inputmode：只控制键盘",
                            "inputmode更灵活",
                            "可以组合使用"
                        ]
                    },
                    {
                        title: "使用场景",
                        code: '<!-- 验证码：纯数字，无增减按钮 -->\n<input type="text" \n       inputmode="numeric" \n       pattern="[0-9]{6}"\n       maxlength="6"\n       placeholder="6位验证码">\n\n<!-- 身份证号：字母+数字 -->\n<input type="text"\n       inputmode="text"\n       pattern="[0-9]{17}[0-9Xx]"\n       maxlength="18">\n\n<!-- 金额：小数点 -->\n<input type="text"\n       inputmode="decimal"\n       pattern="[0-9]+(\\\\.[0-9]{1,2})?"\n       placeholder="0.00">',
                        content: "根据实际需求选择合适的inputmode。"
                    },
                    {
                        title: "浏览器支持",
                        points: [
                            "iOS Safari 12.2+",
                            "Android Chrome 全版本",
                            "桌面浏览器：忽略（无影响）",
                            "提升移动端体验",
                            "渐进增强"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["output", "计算结果"],
            question: "<output>标签的用途？",
            options: [
                "显示计算结果",
                "与表单关联",
                "可以关联多个input",
                "有for属性"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<output>标签",
                description: "output用于显示计算或操作的结果。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">\n  <input type="number" id="a" value="0"> +\n  <input type="number" id="b" value="0"> =\n  <output name="result" for="a b">0</output>\n</form>',
                        points: [
                            "显示计算结果",
                            "for属性关联输入",
                            "name属性可提交",
                            "语义化标签"
                        ]
                    },
                    {
                        title: "滑块示例",
                        code: '<form>\n  <label for="volume">音量：</label>\n  <input type="range" \n         id="volume" \n         min="0" \n         max="100" \n         value="50"\n         oninput="volumeOutput.value = this.value">\n  <output id="volumeOutput" for="volume">50</output>\n</form>',
                        content: "常用于显示range的当前值。"
                    },
                    {
                        title: "JavaScript操作",
                        code: 'const form = document.querySelector("form");\nconst a = document.getElementById("a");\nconst b = document.getElementById("b");\nconst output = document.getElementById("result");\n\nfunction calculate() {\n  const sum = parseInt(a.value) + parseInt(b.value);\n  output.value = sum;\n  output.textContent = sum;  // 两种方式都可以\n}\n\na.addEventListener("input", calculate);\nb.addEventListener("input", calculate);',
                        content: "可以用JavaScript动态更新output。"
                    },
                    {
                        title: "复杂计算",
                        code: '<form id="loanCalculator">\n  <label>贷款金额：\n    <input type="number" id="amount" value="100000">\n  </label>\n  \n  <label>年利率(%)：\n    <input type="number" id="rate" value="5" step="0.1">\n  </label>\n  \n  <label>贷款年限：\n    <input type="number" id="years" value="20">\n  </label>\n  \n  <p>\n    月供：<output id="payment" for="amount rate years">0</output> 元\n  </p>\n</form>\n\n<script>\nfunction calculatePayment() {\n  const P = parseFloat(amount.value);\n  const r = parseFloat(rate.value) / 100 / 12;\n  const n = parseInt(years.value) * 12;\n  \n  const M = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);\n  payment.value = M.toFixed(2);\n}\n\n["amount", "rate", "years"].forEach(id => {\n  document.getElementById(id).addEventListener("input", calculatePayment);\n});\n\ncalculatePayment();\n</script>',
                        content: "适用于各种计算场景。"
                    },
                    {
                        title: "vs span/div",
                        code: '<!-- 好：使用output -->\n<output for="price quantity">0</output>\n\n<!-- 不够好：使用span -->\n<span id="total">0</span>',
                        points: [
                            "output有明确的语义",
                            "表示这是计算结果",
                            "与表单的关系更清晰",
                            "可访问性更好"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["meter", "progress", "进度"],
            question: "<meter>和<progress>的区别？",
            options: [
                "<progress>表示进度",
                "<meter>表示度量",
                "progress有确定和不确定状态",
                "meter有最优、最差值"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<meter> vs <progress>",
                description: "两个表示数值的语义标签。",
                sections: [
                    {
                        title: "<progress>标签",
                        code: '<!-- 确定的进度 -->\n<progress value="70" max="100">70%</progress>\n\n<!-- 不确定的进度（无value） -->\n<progress></progress>\n\n<!-- JavaScript更新 -->\n<progress id="uploadProgress" max="100" value="0"></progress>\n<script>\nlet progress = 0;\nconst interval = setInterval(() => {\n  progress += 10;\n  uploadProgress.value = progress;\n  if (progress >= 100) clearInterval(interval);\n}, 500);\n</script>',
                        points: [
                            "表示任务完成进度",
                            "value：当前值",
                            "max：最大值（默认1.0）",
                            "无value：不确定状态",
                            "用于：下载、上传、加载"
                        ]
                    },
                    {
                        title: "<meter>标签",
                        code: '<!-- 基本用法 -->\n<meter value="0.6">60%</meter>\n\n<!-- 带范围 -->\n<meter min="0" max="100" value="75">75/100</meter>\n\n<!-- 带阈值 -->\n<meter min="0" max="100"\n       low="25"    <!-- 低阈值 -->\n       high="75"   <!-- 高阈值 -->\n       optimum="50"  <!-- 最优值 -->\n       value="80">\n  80/100\n</meter>',
                        points: [
                            "表示已知范围内的标量测量",
                            "min/max：范围",
                            "low/high：阈值",
                            "optimum：最优值",
                            "用于：磁盘使用、投票结果、分数"
                        ]
                    },
                    {
                        title: "meter的颜色语义",
                        code: '<!-- 低于low：红色 -->\n<meter min="0" max="100" low="30" value="20">差</meter>\n\n<!-- low和high之间：黄色 -->\n<meter min="0" max="100" low="30" high="70" value="50">中</meter>\n\n<!-- 高于high：绿色 -->\n<meter min="0" max="100" high="70" value="90">好</meter>\n\n<!-- optimum的影响 -->\n<meter min="0" max="100" optimum="100" value="90">接近最优</meter>\n<meter min="0" max="100" optimum="0" value="90">远离最优</meter>',
                        content: "浏览器会根据值和阈值显示不同颜色。"
                    },
                    {
                        title: "使用场景",
                        code: '<!-- progress：进度任务 -->\n<p>下载进度：<progress value="45" max="100">45%</progress></p>\n<p>加载中：<progress></progress></p>\n\n<!-- meter：测量值 -->\n<p>磁盘使用：\n  <meter min="0" max="1000" low="800" high="950" value="850">\n    850GB / 1000GB\n  </meter>\n</p>\n\n<p>学生成绩：\n  <meter min="0" max="100" low="60" high="90" optimum="100" value="85">\n    85分\n  </meter>\n</p>\n\n<p>满意度：\n  <meter min="1" max="5" value="4">4星</meter>\n</p>',
                        content: "根据语义选择合适的标签。"
                    },
                    {
                        title: "区别总结",
                        points: [
                            "progress：动态任务进度（0% → 100%）",
                            "meter：静态测量值（在范围内）",
                            "progress：有方向性（向前推进）",
                            "meter：无方向性（只是当前状态）",
                            "progress：简单的min/max/value",
                            "meter：复杂的阈值系统"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["表单可访问性", "ARIA"],
            question: "如何提升表单的可访问性？",
            type: "multiple-choice",
            options: [
                "所有input都有label",
                "提供清晰的错误提示",
                "支持键盘导航",
                "使用ARIA属性"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表单可访问性最佳实践",
                description: "让所有用户都能轻松使用表单。",
                sections: [
                    {
                        title: "必须有label",
                        code: '<!-- 好 -->\n<label for="email">邮箱地址</label>\n<input type="email" id="email" name="email">\n\n<!-- 或 -->\n<label>\n  邮箱地址\n  <input type="email" name="email">\n</label>\n\n<!-- 不好 -->\n<input type="email" placeholder="邮箱地址">  <!-- 只有placeholder -->',
                        points: [
                            "所有input必须有label",
                            "placeholder不能替代label",
                            "屏幕阅读器需要label",
                            "label扩大点击区域"
                        ]
                    },
                    {
                        title: "错误提示",
                        code: '<!-- 使用aria-describedby -->\n<label for="password">密码</label>\n<input type="password" \n       id="password"\n       aria-describedby="pwd-error pwd-help"\n       aria-invalid="true">\n<span id="pwd-help">至少8个字符</span>\n<span id="pwd-error" role="alert">密码太短</span>\n\n<style>\n[aria-invalid="true"] {\n  border-color: red;\n}\n</style>',
                        points: [
                            "使用aria-invalid标记错误",
                            "aria-describedby关联错误信息",
                            "role='alert'通知屏幕阅读器",
                            "视觉提示（颜色、图标）"
                        ]
                    },
                    {
                        title: "键盘导航",
                        code: '<!-- 确保tabindex正确 -->\n<form>\n  <input type="text" tabindex="1">\n  <input type="email" tabindex="2">\n  <button type="submit" tabindex="3">提交</button>\n  <button type="button" tabindex="4">取消</button>\n</form>\n\n<!-- 跳过导航 -->\n<a href="#main-form" class="skip-link">跳到表单</a>\n\n<style>\n.skip-link {\n  position: absolute;\n  left: -9999px;\n}\n\n.skip-link:focus {\n  left: 0;\n  z-index: 9999;\n}\n</style>',
                        points: [
                            "支持Tab键导航",
                            "合理的tabindex顺序",
                            "焦点可见",
                            "提供跳过链接"
                        ]
                    },
                    {
                        title: "必填标记",
                        code: '<!-- 方式1：required属性 -->\n<label for="name">\n  姓名 <span aria-label="必填">*</span>\n</label>\n<input type="text" id="name" required>\n\n<!-- 方式2：aria-required -->\n<label for="email">邮箱（必填）</label>\n<input type="email" id="email" aria-required="true">\n\n<!-- 说明必填标记 -->\n<p>\n  <span aria-hidden="true">*</span> \n  表示必填项\n</p>',
                        content: "明确标识必填字段。"
                    },
                    {
                        title: "分组和fieldset",
                        code: '<form>\n  <fieldset>\n    <legend>个人信息</legend>\n    <label>姓名：<input type="text"></label>\n    <label>年龄：<input type="number"></label>\n  </fieldset>\n  \n  <fieldset>\n    <legend>性别</legend>\n    <label><input type="radio" name="gender" value="male"> 男</label>\n    <label><input type="radio" name="gender" value="female"> 女</label>\n  </fieldset>\n</form>',
                        content: "使用fieldset分组相关字段。"
                    },
                    {
                        title: "状态提示",
                        code: '<!-- 加载状态 -->\n<button type="submit" aria-busy="true" disabled>\n  <span aria-hidden="true">⏳</span>\n  提交中...\n</button>\n\n<!-- 成功提示 -->\n<div role="status" aria-live="polite">\n  表单提交成功！\n</div>\n\n<!-- 错误提示 -->\n<div role="alert" aria-live="assertive">\n  提交失败，请重试。\n</div>',
                        points: [
                            "aria-busy：加载状态",
                            "aria-live：动态更新通知",
                            "polite：完成当前后通知",
                            "assertive：立即通知"
                        ]
                    },
                    {
                        title: "WCAG检查清单",
                        points: [
                            "✓ 所有表单控件有label",
                            "✓ 支持键盘操作",
                            "✓ 焦点可见",
                            "✓ 错误提示清晰",
                            "✓ 颜色对比度足够",
                            "✓ 不只用颜色传达信息",
                            "✓ 提供帮助文本",
                            "✓ 合理的time limit",
                            "✓ 测试屏幕阅读器"
                        ]
                    }
                ]
            },
            source: "WCAG 2.1"
        },
        {
            difficulty: "hard",
            tags: ["表单状态", "disabled readonly"],
            question: "disabled和readonly的区别？",
            options: [
                "disabled完全禁用",
                "readonly只读但可聚焦",
                "disabled不会提交",
                "readonly会提交"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "disabled vs readonly",
                description: "两个属性都限制用户输入，但有重要区别。",
                sections: [
                    {
                        title: "disabled属性",
                        code: '<input type="text" name="username" value="张三" disabled>\n<button type="submit" disabled>提交</button>',
                        points: [
                            "完全禁用控件",
                            "不能聚焦",
                            "不能编辑",
                            "不会提交到服务器",
                            "灰色显示（默认样式）",
                            "不触发事件"
                        ]
                    },
                    {
                        title: "readonly属性",
                        code: '<input type="text" name="username" value="张三" readonly>\n<textarea name="bio" readonly>个人简介</textarea>',
                        points: [
                            "只读，不能编辑",
                            "可以聚焦",
                            "可以选择和复制",
                            "会提交到服务器",
                            "可以触发事件",
                            "只适用于input和textarea"
                        ]
                    },
                    {
                        title: "适用元素",
                        code: '<!-- disabled：几乎所有表单元素 -->\n<input disabled>\n<button disabled>\n<select disabled>\n<textarea disabled>\n<fieldset disabled>  <!-- 禁用整组 -->\n\n<!-- readonly：仅input和textarea -->\n<input type="text" readonly>\n<textarea readonly></textarea>\n\n<!-- readonly不适用于 -->\n<select readonly>  <!-- 无效 -->\n<button readonly>  <!-- 无效 -->',
                        content: "readonly只适用于文本输入控件。"
                    },
                    {
                        title: "表单提交",
                        code: '<form>\n  <input name="a" value="1" disabled>  <!-- 不提交 -->\n  <input name="b" value="2" readonly>  <!-- 提交 -->\n  <button type="submit">提交</button>\n</form>\n\n<!-- 提交的数据：b=2 -->\n<!-- disabled的字段不会包含在FormData中 -->',
                        content: "readonly字段会提交，disabled不会。"
                    },
                    {
                        title: "使用场景",
                        code: '<!-- disabled：条件性禁用 -->\n<label>\n  <input type="checkbox" id="agree">\n  同意条款\n</label>\n<button type="submit" id="submit" disabled>提交</button>\n\n<script>\nagree.addEventListener("change", function() {\n  submit.disabled = !this.checked;\n});\n</script>\n\n<!-- readonly：显示但不可编辑 -->\n<label>订单号：\n  <input type="text" name="orderId" value="12345" readonly>\n</label>\n\n<!-- readonly：需要提交但不可修改 -->\n<label>用户名（不可修改）：\n  <input type="text" name="username" value="zhangsan" readonly>\n</label>',
                        content: "根据需求选择合适的属性。"
                    },
                    {
                        title: "JavaScript操作",
                        code: 'const input = document.querySelector("input");\n\n// 禁用\ninput.disabled = true;\ninput.readOnly = true;  // 注意：JavaScript中是readOnly\n\n// 检查状态\nif (input.disabled) {\n  console.log("已禁用");\n}\n\nif (input.readOnly) {\n  console.log("只读");\n}',
                        content: "可以通过JavaScript动态控制。"
                    },
                    {
                        title: "样式",
                        code: '<style>\n/* disabled样式 */\ninput:disabled {\n  background-color: #f0f0f0;\n  color: #999;\n  cursor: not-allowed;\n}\n\n/* readonly样式 */\ninput:read-only {\n  background-color: #fafafa;\n  border-color: #ddd;\n}\n\n/* 可写样式 */\ninput:read-write {\n  border-color: #4CAF50;\n}\n</style>',
                        content: "使用CSS伪类设置不同状态的样式。"
                    }
                ]
            },
            source: "HTML规范"
        }
    ],
    navigation: {
        prev: { title: "表单基础", url: "10-forms-basic-quiz.html" },
        next: { title: "语义化标签", url: "12-semantic-html-quiz.html" }
    }
};
