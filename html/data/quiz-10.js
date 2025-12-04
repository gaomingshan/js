// 第10章：表单基础 - 面试题
window.htmlQuizData_10 = {
    config: {
        title: "表单基础",
        icon: "📝",
        description: "测试你对HTML表单的基础知识",
        primaryColor: "#e96443",
        bgGradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)"
    },
    questions: [
        {
            difficulty: "easy",
            tags: ["form标签", "基础"],
            question: "<form>标签的基本属性有哪些？",
            type: "multiple-choice",
            options: [
                "action - 提交地址",
                "method - 提交方式",
                "enctype - 编码类型",
                "target - 打开方式"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<form>标签属性",
                description: "form标签控制表单的提交行为。",
                sections: [
                    {
                        title: "基本结构",
                        code: '<form action="/submit" method="post">\n  <input type="text" name="username">\n  <button type="submit">提交</button>\n</form>',
                        points: [
                            "action：表单提交的URL",
                            "method：HTTP方法（GET/POST）",
                            "省略action：提交到当前页面"
                        ]
                    },
                    {
                        title: "method属性",
                        code: '<!-- GET方式（默认） -->\n<form action="/search" method="get">\n  <input type="text" name="q">\n  <button>搜索</button>\n</form>\n<!-- 提交到：/search?q=关键词 -->\n\n<!-- POST方式 -->\n<form action="/login" method="post">\n  <input type="text" name="username">\n  <input type="password" name="password">\n  <button>登录</button>\n</form>\n<!-- 数据在请求体中 -->',
                        points: [
                            "GET：数据在URL中，可见",
                            "GET：适合搜索、筛选",
                            "POST：数据在请求体，不可见",
                            "POST：适合登录、提交数据",
                            "默认是GET"
                        ]
                    },
                    {
                        title: "enctype属性",
                        code: '<!-- 默认：URL编码 -->\n<form method="post" enctype="application/x-www-form-urlencoded">\n  <input name="name">\n</form>\n\n<!-- 文件上传：multipart -->\n<form method="post" enctype="multipart/form-data">\n  <input type="file" name="avatar">\n</form>\n\n<!-- 纯文本（很少用） -->\n<form method="post" enctype="text/plain">\n  <input name="message">\n</form>',
                        points: [
                            "application/x-www-form-urlencoded：默认",
                            "multipart/form-data：文件上传必需",
                            "text/plain：纯文本（不推荐）"
                        ]
                    },
                    {
                        title: "target属性",
                        code: '<!-- 当前窗口 -->\n<form action="/submit" target="_self"></form>\n\n<!-- 新窗口 -->\n<form action="/submit" target="_blank"></form>\n\n<!-- iframe -->\n<form action="/submit" target="myframe"></form>\n<iframe name="myframe"></iframe>',
                        points: [
                            "_self：当前窗口（默认）",
                            "_blank：新窗口",
                            "_parent：父框架",
                            "_top：顶层框架",
                            "或iframe的name"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["input类型", "基础"],
            question: "HTML5新增了哪些input类型？",
            type: "multiple-choice",
            options: [
                "email、url、tel - 验证类型",
                "date、time、datetime-local - 日期时间",
                "number、range - 数字",
                "color - 颜色选择器"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML5 Input类型",
                description: "HTML5大幅扩展了input类型。",
                sections: [
                    {
                        title: "验证类型",
                        code: '<!-- 邮箱 -->\n<input type="email" name="email" placeholder="user@example.com">\n\n<!-- URL -->\n<input type="url" name="website" placeholder="https://example.com">\n\n<!-- 电话 -->\n<input type="tel" name="phone" placeholder="+86 138-0013-8000">',
                        points: [
                            "email：自动验证邮箱格式",
                            "url：验证URL格式",
                            "tel：电话号码（移动端显示数字键盘）",
                            "浏览器会进行基本验证"
                        ]
                    },
                    {
                        title: "日期和时间",
                        code: '<!-- 日期 -->\n<input type="date" name="birthday">\n\n<!-- 时间 -->\n<input type="time" name="appointment">\n\n<!-- 日期+时间 -->\n<input type="datetime-local" name="event">\n\n<!-- 月份 -->\n<input type="month" name="expiry">\n\n<!-- 周 -->\n<input type="week" name="week">',
                        points: [
                            "date：日期选择器",
                            "time：时间选择器",
                            "datetime-local：日期时间",
                            "month：月份",
                            "week：周",
                            "浏览器提供原生选择器"
                        ]
                    },
                    {
                        title: "数字类型",
                        code: '<!-- 数字输入 -->\n<input type="number" \n       name="age" \n       min="1" \n       max="120" \n       step="1">\n\n<!-- 滑块 -->\n<input type="range" \n       name="volume" \n       min="0" \n       max="100" \n       value="50">\n<output id="volumeValue">50</output>',
                        points: [
                            "number：数字输入框",
                            "range：滑块",
                            "支持min、max、step",
                            "移动端显示数字键盘"
                        ]
                    },
                    {
                        title: "其他类型",
                        code: '<!-- 颜色选择器 -->\n<input type="color" name="theme" value="#ff0000">\n\n<!-- 搜索框 -->\n<input type="search" name="q" placeholder="搜索...">\n\n<!-- 文件上传 -->\n<input type="file" name="document" accept=".pdf,.doc">',
                        points: [
                            "color：颜色选择器",
                            "search：搜索框（可清除）",
                            "file：文件上传"
                        ]
                    },
                    {
                        title: "传统类型",
                        code: '<!-- 文本 -->\n<input type="text" name="name">\n\n<!-- 密码 -->\n<input type="password" name="pwd">\n\n<!-- 单选 -->\n<input type="radio" name="gender" value="male"> 男\n<input type="radio" name="gender" value="female"> 女\n\n<!-- 复选 -->\n<input type="checkbox" name="agree" value="yes"> 同意\n\n<!-- 隐藏 -->\n<input type="hidden" name="token" value="abc123">\n\n<!-- 提交 -->\n<input type="submit" value="提交">\n<input type="reset" value="重置">\n<input type="button" value="按钮">',
                        content: "HTML4的传统类型仍然可用。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "medium",
            tags: ["label标签", "可访问性"],
            question: "<label>标签的正确用法是什么？",
            options: [
                "关联input提升可访问性",
                "可以使用for属性关联",
                "可以包裹input",
                "点击label会聚焦input"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<label>标签",
                description: "label为表单控件提供标签，提升可用性。",
                sections: [
                    {
                        title: "方式1：for属性",
                        code: '<label for="username">用户名：</label>\n<input type="text" id="username" name="username">',
                        points: [
                            "label的for对应input的id",
                            "label和input可以分开",
                            "点击label会聚焦input"
                        ]
                    },
                    {
                        title: "方式2：包裹input",
                        code: '<label>\n  用户名：\n  <input type="text" name="username">\n</label>',
                        points: [
                            "label直接包裹input",
                            "不需要id和for",
                            "代码更简洁"
                        ]
                    },
                    {
                        title: "单选和复选框",
                        code: '<!-- 单选框 -->\n<label>\n  <input type="radio" name="gender" value="male">\n  男\n</label>\n<label>\n  <input type="radio" name="gender" value="female">\n  女\n</label>\n\n<!-- 复选框 -->\n<label>\n  <input type="checkbox" name="agree">\n  我同意服务条款\n</label>',
                        content: "单选和复选框特别需要label，扩大点击区域。"
                    },
                    {
                        title: "可访问性优势",
                        points: [
                            "屏幕阅读器会读取label",
                            "明确input的用途",
                            "扩大点击区域",
                            "提升用户体验",
                            "所有input都应有label（除了hidden）"
                        ]
                    },
                    {
                        title: "多个label",
                        code: '<!-- 一个input可以有多个label -->\n<label for="email">邮箱</label>\n<input type="email" id="email">\n<label for="email">（必填）</label>',
                        content: "一个input可以关联多个label。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["required", "验证"],
            question: "HTML5表单验证属性有哪些？",
            type: "multiple-choice",
            options: [
                "required - 必填",
                "pattern - 正则验证",
                "min/max - 范围验证",
                "minlength/maxlength - 长度验证"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "HTML5原生验证",
                description: "HTML5提供了丰富的客户端验证功能。",
                sections: [
                    {
                        title: "required - 必填",
                        code: '<input type="text" name="username" required>\n<input type="email" name="email" required>\n<input type="checkbox" name="agree" required>',
                        points: [
                            "标记为必填项",
                            "提交时浏览器会验证",
                            "空值会提示错误",
                            "适用于大多数input类型"
                        ]
                    },
                    {
                        title: "pattern - 正则验证",
                        code: '<!-- 手机号 -->\n<input type="tel" \n       name="phone" \n       pattern="[0-9]{11}"\n       title="请输入11位手机号">\n\n<!-- 邮政编码 -->\n<input type="text"\n       name="zipcode"\n       pattern="[0-9]{6}"\n       title="请输入6位邮政编码">\n\n<!-- 用户名：字母数字下划线 -->\n<input type="text"\n       name="username"\n       pattern="[a-zA-Z0-9_]{3,16}"\n       title="3-16位字母数字下划线">',
                        points: [
                            "使用正则表达式验证",
                            "title属性提供错误提示",
                            "pattern是完全匹配（不需要^和$）"
                        ]
                    },
                    {
                        title: "长度验证",
                        code: '<!-- 最小长度 -->\n<input type="text"\n       name="username"\n       minlength="3"\n       maxlength="20">\n\n<!-- 文本域 -->\n<textarea name="bio"\n          minlength="10"\n          maxlength="500"></textarea>',
                        points: [
                            "minlength：最小长度",
                            "maxlength：最大长度",
                            "适用于text、email、password、tel、textarea等"
                        ]
                    },
                    {
                        title: "范围验证",
                        code: '<!-- 数字范围 -->\n<input type="number"\n       name="age"\n       min="18"\n       max="100">\n\n<!-- 日期范围 -->\n<input type="date"\n       name="birthday"\n       min="1900-01-01"\n       max="2024-12-31">\n\n<!-- 步长 -->\n<input type="number"\n       name="quantity"\n       min="1"\n       step="1">',
                        points: [
                            "min/max：数值、日期范围",
                            "step：步长",
                            "适用于number、range、date等"
                        ]
                    },
                    {
                        title: "禁用验证",
                        code: '<!-- 表单级别禁用 -->\n<form novalidate>\n  <input type="email" required>\n  <button>提交</button>\n</form>\n\n<!-- 按钮级别禁用 -->\n<form>\n  <input type="email" required>\n  <button type="submit">验证并提交</button>\n  <button type="submit" formnovalidate>跳过验证</button>\n</form>',
                        content: "novalidate和formnovalidate可以禁用验证。"
                    },
                    {
                        title: "自定义验证",
                        code: 'const input = document.querySelector("input");\n\ninput.addEventListener("input", function() {\n  if (this.value.includes("badword")) {\n    this.setCustomValidity("不能包含敏感词");\n  } else {\n    this.setCustomValidity("");  // 清除错误\n  }\n});\n\nform.addEventListener("submit", function(e) {\n  if (!form.checkValidity()) {\n    e.preventDefault();\n    // 显示错误\n  }\n});',
                        content: "使用JavaScript进行更复杂的验证。"
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["button", "submit"],
            question: "<button>和<input type='submit'>有什么区别？",
            options: [
                "<button>可以包含HTML内容",
                "<button>默认type是submit",
                "<input>只能显示纯文本",
                "<button>更灵活"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "button vs input[type=submit]",
                description: "两者都能提交表单，但button更灵活。",
                sections: [
                    {
                        title: "<input type='submit'>",
                        code: '<input type="submit" value="提交">\n<input type="reset" value="重置">\n<input type="button" value="按钮">',
                        points: [
                            "只能显示纯文本",
                            "value属性设置文本",
                            "不能包含HTML",
                            "样式受限"
                        ]
                    },
                    {
                        title: "<button>",
                        code: '<button type="submit">\n  <img src="icon.svg" alt="">\n  提交表单\n</button>\n\n<button type="button">\n  <span class="icon">🔍</span>\n  搜索\n</button>\n\n<button type="reset">\n  <strong>重置</strong>表单\n</button>',
                        points: [
                            "可以包含HTML（图标、强调等）",
                            "更灵活的样式",
                            "默认type是submit（注意！）",
                            "推荐使用button"
                        ]
                    },
                    {
                        title: "button的type属性",
                        code: '<!-- submit：提交表单（默认） -->\n<button type="submit">提交</button>\n\n<!-- button：普通按钮，不提交 -->\n<button type="button">点击</button>\n\n<!-- reset：重置表单 -->\n<button type="reset">重置</button>\n\n<!-- 危险：省略type会默认submit -->\n<button>危险！会提交表单</button>',
                        points: [
                            "submit：提交表单",
                            "button：普通按钮",
                            "reset：重置表单",
                            "默认是submit！",
                            "建议总是明确指定type"
                        ]
                    },
                    {
                        title: "表单外的button",
                        code: '<!-- button在form外 -->\n<form id="myForm">\n  <input type="text" name="name">\n</form>\n\n<!-- 通过form属性关联 -->\n<button type="submit" form="myForm">提交</button>',
                        content: "button可以通过form属性关联表单。"
                    },
                    {
                        title: "覆盖form属性",
                        code: '<form action="/default" method="post">\n  <input type="text" name="data">\n  \n  <!-- 使用表单默认设置 -->\n  <button type="submit">提交</button>\n  \n  <!-- 覆盖action -->\n  <button type="submit" formaction="/other">提交到其他地址</button>\n  \n  <!-- 覆盖method -->\n  <button type="submit" formmethod="get">GET提交</button>\n  \n  <!-- 禁用验证 -->\n  <button type="submit" formnovalidate>跳过验证</button>\n</form>',
                        content: "button可以覆盖form的属性。"
                    },
                    {
                        title: "最佳实践",
                        points: [
                            "优先使用<button>",
                            "总是指定type属性",
                            "提交按钮用type='submit'",
                            "普通按钮用type='button'",
                            "注意默认行为"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["textarea", "文本域"],
            question: "<textarea>的特点和属性？",
            options: [
                "用于多行文本输入",
                "不能用value设置值",
                "支持rows和cols属性",
                "可以设置最大长度"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<textarea>标签",
                description: "textarea用于多行文本输入。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<textarea name="bio" \n          rows="5" \n          cols="50"\n          placeholder="请输入个人简介...">\n</textarea>\n\n<!-- 或通过CSS控制尺寸 -->\n<textarea name="bio"\n          style="width: 100%; height: 150px;">\n</textarea>',
                        points: [
                            "rows：行数",
                            "cols：列数（字符数）",
                            "通常用CSS设置尺寸更好",
                            "闭合标签间的内容是默认值"
                        ]
                    },
                    {
                        title: "设置值",
                        code: '<!-- 错误：textarea没有value属性 -->\n<textarea value="内容"></textarea>\n\n<!-- 正确：在标签之间 -->\n<textarea name="bio">这是默认内容</textarea>\n\n<!-- JavaScript设置 -->\n<script>\ntextarea.value = "新内容";\n</script>',
                        points: [
                            "不能用value属性",
                            "默认值放在标签之间",
                            "JavaScript中可以用.value",
                            "注意空白和缩进会被保留"
                        ]
                    },
                    {
                        title: "常用属性",
                        code: '<textarea name="comment"\n          required\n          minlength="10"\n          maxlength="500"\n          placeholder="至少10个字符"\n          wrap="soft">\n</textarea>',
                        points: [
                            "required：必填",
                            "minlength/maxlength：长度限制",
                            "placeholder：占位符",
                            "wrap：换行方式（soft/hard）"
                        ]
                    },
                    {
                        title: "禁用调整大小",
                        code: '<style>\ntextarea {\n  resize: none;       /* 禁用 */\n  resize: vertical;   /* 仅垂直 */\n  resize: horizontal; /* 仅水平 */\n  resize: both;       /* 都可以（默认） */\n}\n</style>',
                        content: "使用CSS resize控制是否可调整大小。"
                    },
                    {
                        title: "自动高度",
                        code: '<textarea id="autoResize"></textarea>\n\n<script>\nconst textarea = document.getElementById("autoResize");\n\ntextarea.addEventListener("input", function() {\n  this.style.height = "auto";\n  this.style.height = this.scrollHeight + "px";\n});\n</script>\n\n<style>\n#autoResize {\n  overflow: hidden;\n  resize: none;\n}\n</style>',
                        content: "通过JavaScript实现自动调整高度。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["select", "下拉框"],
            question: "<select>和<option>的用法和特性？",
            type: "multiple-choice",
            options: [
                "用于创建下拉选择框",
                "可以多选",
                "支持分组",
                "可以禁用选项"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<select>下拉框",
                description: "select用于创建选择列表。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<select name="city">\n  <option value="">请选择城市</option>\n  <option value="beijing">北京</option>\n  <option value="shanghai">上海</option>\n  <option value="guangzhou">广州</option>\n</select>',
                        points: [
                            "<select>：容器",
                            "<option>：选项",
                            "value：提交的值",
                            "标签之间：显示的文本"
                        ]
                    },
                    {
                        title: "默认选中",
                        code: '<select name="city">\n  <option value="beijing">北京</option>\n  <option value="shanghai" selected>上海</option>\n  <option value="guangzhou">广州</option>\n</select>',
                        content: "selected属性标记默认选中项。"
                    },
                    {
                        title: "禁用选项",
                        code: '<select name="city">\n  <option value="">请选择</option>\n  <option value="beijing">北京</option>\n  <option value="shanghai" disabled>上海（已售罄）</option>\n  <option value="guangzhou">广州</option>\n</select>',
                        content: "disabled属性禁用选项。"
                    },
                    {
                        title: "选项分组",
                        code: '<select name="location">\n  <optgroup label="直辖市">\n    <option value="beijing">北京</option>\n    <option value="shanghai">上海</option>\n  </optgroup>\n  <optgroup label="省会城市">\n    <option value="guangzhou">广州</option>\n    <option value="chengdu">成都</option>\n  </optgroup>\n</select>',
                        points: [
                            "<optgroup>分组选项",
                            "label属性：组名",
                            "提升大列表可读性"
                        ]
                    },
                    {
                        title: "多选",
                        code: '<select name="hobbies" multiple size="5">\n  <option value="reading">阅读</option>\n  <option value="music">音乐</option>\n  <option value="sports">运动</option>\n  <option value="travel">旅行</option>\n  <option value="coding">编程</option>\n</select>',
                        points: [
                            "multiple：允许多选",
                            "size：显示的选项数量",
                            "Ctrl/Cmd+点击多选",
                            "提交时会有多个值"
                        ]
                    },
                    {
                        title: "JavaScript操作",
                        code: 'const select = document.querySelector("select");\n\n// 获取选中值\nconsole.log(select.value);\n\n// 获取选中的option\nconst selectedOption = select.options[select.selectedIndex];\nconsole.log(selectedOption.text);\n\n// 多选：获取所有选中项\nconst selected = Array.from(select.options)\n  .filter(option => option.selected)\n  .map(option => option.value);\n\n// 动态添加选项\nconst option = document.createElement("option");\noption.value = "new";\noption.text = "新选项";\nselect.add(option);\n\n// 移除选项\nselect.remove(2);  // 移除索引为2的选项',
                        content: "通过JavaScript动态操作select。"
                    },
                    {
                        title: "样式限制",
                        points: [
                            "select样式受限",
                            "不同浏览器渲染不同",
                            "难以完全自定义",
                            "复杂样式需要自定义组件",
                            "或使用第三方库（Select2、Choices.js等）"
                        ]
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "medium",
            tags: ["fieldset", "legend"],
            question: "<fieldset>和<legend>的用途？",
            options: [
                "对表单控件分组",
                "提供组标题",
                "可以禁用整组",
                "提升可访问性"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<fieldset>和<legend>",
                description: "对相关的表单控件进行分组。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<form>\n  <fieldset>\n    <legend>个人信息</legend>\n    <label>姓名：<input type="text" name="name"></label>\n    <label>年龄：<input type="number" name="age"></label>\n  </fieldset>\n  \n  <fieldset>\n    <legend>联系方式</legend>\n    <label>邮箱：<input type="email" name="email"></label>\n    <label>电话：<input type="tel" name="phone"></label>\n  </fieldset>\n</form>',
                        points: [
                            "<fieldset>：分组容器",
                            "<legend>：组标题",
                            "legend必须是fieldset的第一个子元素",
                            "默认有边框"
                        ]
                    },
                    {
                        title: "禁用整组",
                        code: '<fieldset disabled>\n  <legend>配送信息（已禁用）</legend>\n  <input type="text" name="address">\n  <input type="text" name="zipcode">\n</fieldset>',
                        points: [
                            "disabled属性禁用所有内部控件",
                            "无需逐个禁用",
                            "提交时不会包含这些字段",
                            "便于条件性禁用"
                        ]
                    },
                    {
                        title: "单选按钮组",
                        code: '<fieldset>\n  <legend>性别</legend>\n  <label>\n    <input type="radio" name="gender" value="male">\n    男\n  </label>\n  <label>\n    <input type="radio" name="gender" value="female">\n    女\n  </label>\n</fieldset>',
                        content: "单选按钮组特别适合用fieldset。"
                    },
                    {
                        title: "可访问性",
                        points: [
                            "屏幕阅读器会读取legend",
                            "明确字段之间的关系",
                            "帮助用户理解表单结构",
                            "WCAG推荐使用",
                            "特别是复杂表单"
                        ]
                    },
                    {
                        title: "CSS样式",
                        code: '<style>\nfieldset {\n  border: 2px solid #4CAF50;\n  border-radius: 5px;\n  padding: 20px;\n  margin: 20px 0;\n}\n\nlegend {\n  padding: 0 10px;\n  font-weight: bold;\n  color: #4CAF50;\n}\n\n/* 移除默认边框 */\nfieldset {\n  border: none;\n}\n</style>',
                        content: "可以用CSS自定义fieldset样式。"
                    }
                ]
            },
            source: "HTML规范"
        },
        {
            difficulty: "hard",
            tags: ["datalist", "自动完成"],
            question: "<datalist>的作用和用法？",
            options: [
                "提供输入建议",
                "配合input使用",
                "支持自动完成",
                "用户可以输入列表外的值"
            ],
            type: "multiple-choice",
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "<datalist>自动完成",
                description: "datalist为输入框提供预定义选项。",
                sections: [
                    {
                        title: "基本用法",
                        code: '<label>选择浏览器：</label>\n<input type="text" \n       name="browser" \n       list="browsers"\n       placeholder="输入或选择...">\n\n<datalist id="browsers">\n  <option value="Chrome">\n  <option value="Firefox">\n  <option value="Safari">\n  <option value="Edge">\n  <option value="Opera">\n</datalist>',
                        points: [
                            "input的list属性对应datalist的id",
                            "用户可以从列表选择",
                            "也可以输入其他值",
                            "会自动过滤匹配项"
                        ]
                    },
                    {
                        title: "带描述的选项",
                        code: '<input type="text" list="cities">\n\n<datalist id="cities">\n  <option value="Beijing">北京 - 直辖市</option>\n  <option value="Shanghai">上海 - 直辖市</option>\n  <option value="Guangzhou">广州 - 省会城市</option>\n</datalist>',
                        content: "option的文本会显示为描述。"
                    },
                    {
                        title: "数字范围",
                        code: '<input type="range" \n       min="0" \n       max="100" \n       list="marks">\n\n<datalist id="marks">\n  <option value="0" label="0%">\n  <option value="25" label="25%">\n  <option value="50" label="50%">\n  <option value="75" label="75%">\n  <option value="100" label="100%">\n</datalist>',
                        content: "配合range使用显示刻度。"
                    },
                    {
                        title: "颜色选择",
                        code: '<input type="color" list="colors">\n\n<datalist id="colors">\n  <option value="#ff0000">\n  <option value="#00ff00">\n  <option value="#0000ff">\n  <option value="#ffff00">\n</datalist>',
                        content: "为颜色选择器提供预设颜色。"
                    },
                    {
                        title: "动态datalist",
                        code: 'const input = document.querySelector("input");\nconst datalist = document.getElementById("suggestions");\n\ninput.addEventListener("input", async function() {\n  const query = this.value;\n  if (query.length < 2) return;\n  \n  // 从API获取建议\n  const results = await fetch(`/api/search?q=${query}`)\n    .then(r => r.json());\n  \n  // 清空并重新填充datalist\n  datalist.innerHTML = "";\n  results.forEach(item => {\n    const option = document.createElement("option");\n    option.value = item;\n    datalist.appendChild(option);\n  });\n});',
                        content: "可以动态更新datalist选项。"
                    },
                    {
                        title: "浏览器支持",
                        points: [
                            "现代浏览器都支持",
                            "不支持时退化为普通input",
                            "提供渐进增强",
                            "不同浏览器显示样式不同"
                        ]
                    }
                ]
            },
            source: "HTML5规范"
        },
        {
            difficulty: "hard",
            tags: ["表单提交", "安全"],
            question: "表单提交的安全问题和防护？",
            type: "multiple-choice",
            options: [
                "CSRF攻击风险",
                "XSS攻击风险",
                "使用CSRF Token防护",
                "服务端必须验证"
            ],
            correctAnswer: ["A", "B", "C", "D"],
            explanation: {
                title: "表单安全",
                description: "表单是常见的攻击目标，需要多重防护。",
                sections: [
                    {
                        title: "CSRF（跨站请求伪造）",
                        code: '<!-- 攻击者网站 -->\n<form action="https://bank.com/transfer" method="post">\n  <input type="hidden" name="to" value="attacker">\n  <input type="hidden" name="amount" value="10000">\n</form>\n<script>document.forms[0].submit();</script>\n<!-- 用户登录银行后访问此页，会被窃取资金 -->',
                        points: [
                            "利用用户的登录状态",
                            "从第三方网站发起请求",
                            "执行未授权操作",
                            "GET请求更危险"
                        ]
                    },
                    {
                        title: "CSRF防护：Token",
                        code: '<!-- 服务端生成token并存入session -->\n<form action="/transfer" method="post">\n  <input type="hidden" name="csrf_token" value="random_token_here">\n  <input type="text" name="amount">\n  <button>提交</button>\n</form>\n\n<!-- 服务端验证 -->\nif ($_POST["csrf_token"] !== $_SESSION["csrf_token"]) {\n  die("CSRF攻击！");\n}',
                        points: [
                            "生成随机token",
                            "存储在session",
                            "表单中包含token",
                            "服务端验证token",
                            "token应该是一次性的"
                        ]
                    },
                    {
                        title: "CSRF防护：SameSite Cookie",
                        code: '// 设置Cookie的SameSite属性\nSet-Cookie: sessionid=abc123; SameSite=Strict; Secure; HttpOnly\n\n// SameSite的值：\n// Strict: 完全禁止跨站发送\n// Lax: GET请求可以，POST不行（默认）\n// None: 允许跨站（需要Secure）',
                        content: "现代浏览器支持SameSite Cookie。"
                    },
                    {
                        title: "XSS（跨站脚本）",
                        code: '<!-- 危险：直接输出用户输入 -->\n<p>用户名：<?php echo $_GET["name"]; ?></p>\n<!-- 如果name是<script>alert(1)</script>，会执行！ -->\n\n<!-- 安全：转义输出 -->\n<p>用户名：<?php echo htmlspecialchars($_GET["name"]); ?></p>\n<!-- 脚本被转义为文本 -->',
                        points: [
                            "用户输入包含恶意脚本",
                            "未转义直接输出",
                            "脚本在其他用户浏览器执行",
                            "窃取Cookie、Session"
                        ]
                    },
                    {
                        title: "XSS防护",
                        code: '// 1. 转义输出\nfunction escapeHtml(text) {\n  const map = {\n    "&": "&amp;",\n    "<": "&lt;",\n    ">": "&gt;",\n    \'""\': "&quot;",\n    "\'": "&#039;"\n  };\n  return text.replace(/[&<>"\']/g, m => map[m]);\n}\n\n// 2. 使用textContent而不是innerHTML\nelement.textContent = userInput;  // 安全\nelement.innerHTML = userInput;    // 危险\n\n// 3. Content Security Policy\n// 在HTTP头中设置\nContent-Security-Policy: default-src \'self\'; script-src \'self\'\n\n// 或在HTML中\n<meta http-equiv="Content-Security-Policy" \n      content="default-src \'self\'; script-src \'self\'">',
                        content: "多层防护：转义、CSP、HttpOnly Cookie。"
                    },
                    {
                        title: "客户端验证 ≠ 安全",
                        points: [
                            "客户端验证只是用户体验",
                            "可以被绕过（禁用JavaScript）",
                            "可以直接发送HTTP请求",
                            "服务端必须重新验证",
                            "永远不要信任客户端数据"
                        ]
                    },
                    {
                        title: "其他安全实践",
                        points: [
                            "使用HTTPS（防中间人攻击）",
                            "限制请求频率（防暴力破解）",
                            "验证码（防机器人）",
                            "日志记录（审计）",
                            "最小权限原则",
                            "定期安全审计"
                        ]
                    }
                ]
            },
            source: "OWASP"
        }
    ],
    navigation: {
        prev: { title: "表格", url: "09-tables-quiz.html" },
        next: { title: "表单高级", url: "11-forms-advanced-quiz.html" }
    }
};
