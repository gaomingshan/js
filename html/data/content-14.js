// 第14章：表单基础 - 内容数据
window.htmlContentData_14 = {
    section: {
        title: "表单基础",
        icon: "📝"
    },
    topics: [
        {
            type: "concept",
            title: "HTML表单概述",
            content: {
                description: "HTML表单是用户与网站交互的主要方式，用于收集和提交用户输入的数据。表单由<form>元素和各种表单控件组成。",
                keyPoints: [
                    "form元素定义表单的范围和提交行为",
                    "表单控件包括input、textarea、select等",
                    "label元素提高表单可访问性",
                    "表单可以通过HTTP GET或POST提交",
                    "HTML5增加了表单验证功能",
                    "正确的表单设计对用户体验至关重要"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/form"
            }
        },
        {
            type: "code-example",
            title: "<form>元素",
            content: {
                description: "form元素定义表单的属性和行为。",
                examples: [
                    {
                        title: "基本表单",
                        code: `<form action="/submit" method="post">
    <label for="username">用户名：</label>
    <input type="text" id="username" name="username">
    
    <label for="password">密码：</label>
    <input type="password" id="password" name="password">
    
    <button type="submit">提交</button>
</form>`,
                        notes: "action指定提交地址，method指定提交方式"
                    },
                    {
                        title: "form属性详解",
                        code: `<form 
    <!-- 提交地址 -->
    action="/api/submit"
    
    <!-- 提交方法 -->
    method="post"
    
    <!-- 编码类型 -->
    enctype="multipart/form-data"
    
    <!-- 字符编码 -->
    accept-charset="UTF-8"
    
    <!-- 自动完成 -->
    autocomplete="on"
    
    <!-- 不验证 -->
    novalidate
    
    <!-- 提交目标 -->
    target="_blank"
    
    <!-- 表单名称 -->
    name="myForm">
    
    <!-- 表单控件 -->
</form>

<!-- method取值：
     - get: 数据附加在URL中（默认）
     - post: 数据在请求体中
     - dialog: 关闭对话框
-->

<!-- enctype取值：
     - application/x-www-form-urlencoded（默认）
     - multipart/form-data（文件上传）
     - text/plain（纯文本）
-->`,
                        notes: "根据需求选择合适的属性"
                    },
                    {
                        title: "GET vs POST",
                        code: `<!-- GET：数据在URL中，适合搜索 -->
<form action="/search" method="get">
    <input type="text" name="q" placeholder="搜索...">
    <button type="submit">搜索</button>
</form>
<!-- 提交后URL: /search?q=关键词 -->

<!-- POST：数据在请求体，适合提交敏感数据 -->
<form action="/login" method="post">
    <input type="text" name="username">
    <input type="password" name="password">
    <button type="submit">登录</button>
</form>
<!-- 数据不显示在URL中 -->

<!-- 选择原则：
     GET: 搜索、过滤、分页等幂等操作
     POST: 登录、注册、提交等会改变数据的操作
-->`,
                        notes: "GET幂等且可缓存，POST用于修改数据"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<input>元素 - 文本输入",
            content: {
                description: "input元素是最常用的表单控件，type属性决定其类型。",
                examples: [
                    {
                        title: "基本文本输入",
                        code: `<!-- 文本 -->
<input type="text" 
       name="username" 
       placeholder="请输入用户名"
       value=""
       maxlength="20"
       required>

<!-- 密码 -->
<input type="password" 
       name="password"
       placeholder="请输入密码"
       minlength="6"
       required>

<!-- 邮箱 -->
<input type="email" 
       name="email"
       placeholder="example@email.com"
       required>

<!-- 电话 -->
<input type="tel" 
       name="phone"
       placeholder="13800138000"
       pattern="[0-9]{11}">

<!-- URL -->
<input type="url" 
       name="website"
       placeholder="https://example.com">

<!-- 搜索框 -->
<input type="search" 
       name="q"
       placeholder="搜索...">`,
                        notes: "不同type提供不同的验证和键盘"
                    },
                    {
                        title: "数字和日期输入",
                        code: `<!-- 数字 -->
<input type="number" 
       name="age"
       min="0"
       max="150"
       step="1"
       value="18">

<!-- 范围滑块 -->
<input type="range"
       name="volume"
       min="0"
       max="100"
       step="10"
       value="50">

<!-- 日期 -->
<input type="date" 
       name="birthday"
       min="1900-01-01"
       max="2024-12-31">

<!-- 时间 -->
<input type="time" 
       name="appointment"
       min="09:00"
       max="18:00">

<!-- 日期时间 -->
<input type="datetime-local" 
       name="meeting">

<!-- 月份 -->
<input type="month" 
       name="month">

<!-- 周 -->
<input type="week" 
       name="week">`,
                        notes: "HTML5新增的日期时间类型"
                    },
                    {
                        title: "其他input类型",
                        code: `<!-- 颜色选择器 -->
<input type="color" 
       name="color"
       value="#ff0000">

<!-- 文件上传 -->
<input type="file" 
       name="avatar"
       accept="image/*">

<!-- 多文件上传 -->
<input type="file" 
       name="files"
       multiple
       accept=".pdf,.doc,.docx">

<!-- 隐藏字段 -->
<input type="hidden" 
       name="csrf_token"
       value="abc123">

<!-- 复选框 -->
<input type="checkbox" 
       name="agree"
       id="agree"
       value="yes"
       checked>
<label for="agree">我同意条款</label>

<!-- 单选按钮 -->
<input type="radio" name="gender" value="male" id="male">
<label for="male">男</label>
<input type="radio" name="gender" value="female" id="female">
<label for="female">女</label>`,
                        notes: "checkbox和radio用于选择"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<label>元素",
            content: {
                description: "label为表单控件提供标签，提高可访问性和用户体验。",
                examples: [
                    {
                        title: "label的使用方式",
                        code: `<!-- 方式1：使用for属性 -->
<label for="email">邮箱地址：</label>
<input type="email" id="email" name="email">

<!-- 方式2：包裹input -->
<label>
    用户名：
    <input type="text" name="username">
</label>

<!-- 复选框和单选按钮 -->
<label>
    <input type="checkbox" name="subscribe" value="yes">
    订阅新闻邮件
</label>

<input type="radio" name="plan" value="free" id="plan-free">
<label for="plan-free">免费版</label>

<input type="radio" name="plan" value="pro" id="plan-pro">
<label for="plan-pro">专业版</label>`,
                        notes: "点击label会聚焦到关联的input"
                    },
                    {
                        title: "label最佳实践",
                        code: `<!-- ✅ 好：明确的label -->
<label for="password">密码（至少6位）：</label>
<input type="password" id="password" name="password">

<!-- ❌ 不好：无label -->
<input type="text" placeholder="用户名">

<!-- ✅ 好：必填标记 -->
<label for="email">
    邮箱地址 <span class="required">*</span>
</label>
<input type="email" id="email" name="email" required>

<!-- ✅ 好：帮助文本 -->
<label for="phone">手机号：</label>
<input type="tel" id="phone" name="phone">
<small>用于接收验证码</small>`,
                        notes: "label应该清晰描述输入内容"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<button>元素",
            content: {
                description: "button元素创建可点击的按钮，type属性决定其行为。",
                examples: [
                    {
                        title: "按钮类型",
                        code: `<form>
    <!-- 提交按钮 -->
    <button type="submit">提交</button>
    
    <!-- 重置按钮 -->
    <button type="reset">重置</button>
    
    <!-- 普通按钮 -->
    <button type="button" onclick="doSomething()">
        点击我
    </button>
</form>

<!-- 也可以使用input -->
<input type="submit" value="提交">
<input type="reset" value="重置">
<input type="button" value="按钮" onclick="doSomething()">

<!-- button vs input：
     button更灵活，可以包含HTML内容
     input只能是纯文本
-->`,
                        notes: "button默认type是submit，建议明确指定"
                    },
                    {
                        title: "按钮样式和内容",
                        code: `<!-- button可以包含HTML -->
<button type="submit">
    <svg>...</svg>
    提交表单
</button>

<button type="button">
    <img src="icon.png" alt="">
    保存草稿
</button>

<!-- 禁用按钮 -->
<button type="submit" disabled>提交中...</button>

<!-- 表单外的按钮 -->
<button type="submit" form="myForm">
    提交表单
</button>

<form id="myForm">
    <!-- 表单内容 -->
</form>`,
                        notes: "button内容更丰富，可以包含图标等"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "表单布局示例",
            content: {
                description: "常见的表单布局方式。",
                examples: [
                    {
                        title: "垂直布局",
                        code: `<style>
    .form-group {
        margin-bottom: 15px;
    }
    
    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    input, textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
</style>

<form>
    <div class="form-group">
        <label for="name">姓名：</label>
        <input type="text" id="name" name="name" required>
    </div>
    
    <div class="form-group">
        <label for="email">邮箱：</label>
        <input type="email" id="email" name="email" required>
    </div>
    
    <div class="form-group">
        <label for="message">留言：</label>
        <textarea id="message" name="message" rows="5"></textarea>
    </div>
    
    <button type="submit">提交</button>
</form>`,
                        notes: "最常见的表单布局"
                    },
                    {
                        title: "水平布局",
                        code: `<style>
    .form-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .form-row label {
        width: 100px;
        margin-right: 10px;
    }
    
    .form-row input {
        flex: 1;
        padding: 8px;
    }
</style>

<form>
    <div class="form-row">
        <label for="username">用户名：</label>
        <input type="text" id="username" name="username">
    </div>
    
    <div class="form-row">
        <label for="password">密码：</label>
        <input type="password" id="password" name="password">
    </div>
    
    <div class="form-row">
        <label></label>
        <button type="submit">登录</button>
    </div>
</form>`,
                        notes: "适合短表单"
                    },
                    {
                        title: "网格布局",
                        code: `<style>
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }
    
    .form-group.full {
        grid-column: 1 / -1;
    }
    
    label {
        display: block;
        margin-bottom: 5px;
    }
    
    input {
        width: 100%;
        padding: 8px;
    }
</style>

<form class="form-grid">
    <div class="form-group">
        <label for="firstName">名：</label>
        <input type="text" id="firstName" name="firstName">
    </div>
    
    <div class="form-group">
        <label for="lastName">姓：</label>
        <input type="text" id="lastName" name="lastName">
    </div>
    
    <div class="form-group full">
        <label for="email">邮箱：</label>
        <input type="email" id="email" name="email">
    </div>
    
    <div class="form-group full">
        <button type="submit">注册</button>
    </div>
</form>`,
                        notes: "CSS Grid提供灵活的布局"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "表单基础最佳实践",
            content: {
                description: "创建用户友好的表单：",
                practices: [
                    {
                        title: "每个input都有label",
                        description: "提高可访问性和用户体验。",
                        example: `<!-- ✅ 好 -->
<label for="email">邮箱：</label>
<input type="email" id="email" name="email">

<!-- ❌ 不好 -->
<input type="email" placeholder="邮箱">`
                    },
                    {
                        title: "使用合适的input类型",
                        description: "利用HTML5的input类型。",
                        example: `<!-- ✅ 好：正确的类型 -->
<input type="email" name="email">
<input type="tel" name="phone">
<input type="number" name="age">
<input type="date" name="birthday">

<!-- ❌ 不好：都用text -->
<input type="text" name="email">
<input type="text" name="phone">`
                    },
                    {
                        title: "提供清晰的提示",
                        description: "使用placeholder和帮助文本。",
                        example: `<label for="username">用户名：</label>
<input type="text" 
       id="username" 
       name="username"
       placeholder="6-20个字符"
       aria-describedby="username-help">
<small id="username-help">
    只能包含字母、数字和下划线
</small>`
                    },
                    {
                        title: "标记必填字段",
                        description: "明确哪些字段是必需的。",
                        example: `<label for="email">
    邮箱 <span class="required">*</span>
</label>
<input type="email" 
       id="email" 
       name="email"
       required
       aria-required="true">`
                    },
                    {
                        title: "使用autocomplete",
                        description: "帮助浏览器自动填充。",
                        example: `<input type="text" 
       name="name"
       autocomplete="name">
<input type="email" 
       name="email"
       autocomplete="email">
<input type="tel" 
       name="phone"
       autocomplete="tel">`
                    },
                    {
                        title: "禁用时说明原因",
                        description: "告诉用户为什么字段被禁用。",
                        example: `<label for="code">验证码：</label>
<input type="text" 
       id="code" 
       name="code"
       disabled
       aria-label="请先点击发送验证码">
<button type="button">发送验证码</button>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "表单基础检查清单",
            content: {
                description: "确保表单的基础设置正确：",
                items: [
                    { id: "check14-1", text: "form元素设置了action和method" },
                    { id: "check14-2", text: "所有input都有对应的label" },
                    { id: "check14-3", text: "使用了合适的input type" },
                    { id: "check14-4", text: "必填字段添加了required属性" },
                    { id: "check14-5", text: "使用了autocomplete帮助自动填充" },
                    { id: "check14-6", text: "提供了清晰的placeholder" },
                    { id: "check14-7", text: "按钮明确指定了type属性" },
                    { id: "check14-8", text: "表单布局清晰易读" },
                    { id: "check14-9", text: "文件上传设置了accept属性" },
                    { id: "check14-10", text: "测试了键盘导航" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "表格高级特性", url: "content.html?chapter=13" },
        next: { title: "表单高级控件", url: "content.html?chapter=15" }
    }
};
