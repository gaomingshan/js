// 第17章：表单最佳实践 - 内容数据
window.htmlContentData_17 = {
    section: {
        title: "表单最佳实践",
        icon: "⭐"
    },
    topics: [
        {
            type: "concept",
            title: "表单设计原则",
            content: {
                description: "优秀的表单设计能够显著提升用户体验和转化率。表单应该简洁、清晰、易于使用。",
                keyPoints: [
                    "最小化字段数量，只收集必要信息",
                    "提供清晰的标签和说明",
                    "合理的字段顺序和分组",
                    "即时反馈和友好的错误提示",
                    "移动端友好的设计",
                    "保护用户隐私和数据安全"
                ]
            }
        },
        {
            type: "best-practice",
            title: "表单可用性设计",
            content: {
                description: "提升表单可用性的关键实践：",
                practices: [
                    {
                        title: "每个字段都有标签",
                        description: "label提高可访问性和点击区域。",
                        example: `<!-- ✅ 好：清晰的label -->
<label for="email">邮箱地址：</label>
<input type="email" id="email" name="email">

<!-- ❌ 不好：只有placeholder -->
<input type="email" placeholder="邮箱地址">`
                    },
                    {
                        title: "合理的字段宽度",
                        description: "字段宽度应该与预期输入长度匹配。",
                        example: `<style>
    /* 邮政编码 - 短 */
    input[name="zipcode"] {
        width: 100px;
    }
    
    /* 电话号码 - 中 */
    input[name="phone"] {
        width: 200px;
    }
    
    /* 邮箱地址 - 长 */
    input[name="email"] {
        width: 300px;
    }
</style>`
                    },
                    {
                        title: "分组相关字段",
                        description: "使用fieldset逻辑分组。",
                        example: `<form>
    <fieldset>
        <legend>个人信息</legend>
        <label>姓名: <input type="text" name="name"></label>
        <label>生日: <input type="date" name="birthday"></label>
    </fieldset>
    
    <fieldset>
        <legend>联系方式</legend>
        <label>邮箱: <input type="email" name="email"></label>
        <label>电话: <input type="tel" name="phone"></label>
    </fieldset>
</form>`
                    },
                    {
                        title: "提供输入格式示例",
                        description: "用placeholder或说明文字展示格式。",
                        example: `<label for="phone">电话号码：</label>
<input type="tel" 
       id="phone" 
       name="phone"
       placeholder="138-0013-8000"
       pattern="1[3-9][0-9]-[0-9]{4}-[0-9]{4}">
<small>格式：138-0013-8000</small>`
                    },
                    {
                        title: "智能默认值",
                        description: "为字段提供合理的默认值。",
                        example: `<!-- 默认国家 -->
<select name="country">
    <option value="CN" selected>中国</option>
    <option value="US">美国</option>
</select>

<!-- 默认当前日期 -->
<input type="date" 
       name="date"
       value="<?php echo date('Y-m-d'); ?>">`
                    },
                    {
                        title: "避免重复输入",
                        description: "合理使用autocomplete。",
                        example: `<!-- 浏览器可以自动填充 -->
<input type="text" name="name" autocomplete="name">
<input type="email" name="email" autocomplete="email">
<input type="tel" name="phone" autocomplete="tel">
<input type="text" name="address" autocomplete="street-address">`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "表单验证和反馈",
            content: {
                description: "提供及时、清晰的反馈：",
                practices: [
                    {
                        title: "即时验证",
                        description: "在用户输入时提供反馈。",
                        example: `<input type="email" id="email" name="email">
<span id="email-feedback"></span>

<script>
const email = document.getElementById('email');
const feedback = document.getElementById('email-feedback');

email.addEventListener('blur', () => {
    if (email.validity.valid) {
        feedback.textContent = '✓';
        feedback.style.color = 'green';
    } else {
        feedback.textContent = '✗ 请输入有效的邮箱';
        feedback.style.color = 'red';
    }
});
</script>`
                    },
                    {
                        title: "清晰的错误消息",
                        description: "告诉用户具体问题和解决方法。",
                        example: `<!-- ❌ 不好：模糊的错误 -->
<span class="error">输入错误</span>

<!-- ✅ 好：具体的错误 -->
<span class="error">
    密码必须至少8位，包含大小写字母和数字
</span>`
                    },
                    {
                        title: "成功状态提示",
                        description: "也要显示成功的反馈。",
                        example: `<input type="text" id="username" name="username">
<span id="username-status"></span>

<script>
async function checkUsername() {
    const available = await isAvailable(username.value);
    const status = document.getElementById('username-status');
    
    if (available) {
        status.innerHTML = '✓ 用户名可用';
        status.className = 'success';
    } else {
        status.innerHTML = '✗ 用户名已被使用';
        status.className = 'error';
    }
}
</script>

<style>
    .success { color: green; }
    .error { color: red; }
</style>`
                    },
                    {
                        title: "提交状态反馈",
                        description: "禁用按钮并显示加载状态。",
                        example: `<form id="myForm">
    <!-- 表单字段 -->
    <button type="submit" id="submitBtn">提交</button>
</form>

<script>
const form = document.getElementById('myForm');
const btn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 禁用按钮
    btn.disabled = true;
    btn.textContent = '提交中...';
    
    try {
        await submitForm(new FormData(form));
        btn.textContent = '提交成功 ✓';
        btn.style.backgroundColor = 'green';
    } catch (error) {
        btn.disabled = false;
        btn.textContent = '提交失败，请重试';
        btn.style.backgroundColor = 'red';
    }
});
</script>`
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "移动端表单优化",
            content: {
                description: "针对移动设备优化表单体验：",
                practices: [
                    {
                        title: "使用合适的input类型",
                        description: "触发正确的虚拟键盘。",
                        example: `<!-- 邮箱键盘 -->
<input type="email" name="email">

<!-- 数字键盘 -->
<input type="number" name="age">

<!-- 电话键盘 -->
<input type="tel" name="phone">

<!-- URL键盘 -->
<input type="url" name="website">`
                    },
                    {
                        title: "足够大的点击区域",
                        description: "按钮和输入框应该易于点击。",
                        example: `<style>
    /* 移动端最小点击区域44x44px */
    input, button {
        min-height: 44px;
        padding: 12px;
        font-size: 16px; /* 防止iOS自动缩放 */
    }
    
    button {
        min-width: 44px;
        padding: 12px 24px;
    }
</style>`
                    },
                    {
                        title: "防止缩放",
                        description: "iOS中16px以下的input会自动缩放。",
                        example: `<style>
    /* iOS防止缩放 */
    input, select, textarea {
        font-size: 16px; /* 至少16px */
    }
</style>

<meta name="viewport" content="width=device-width, initial-scale=1.0">`
                    },
                    {
                        title: "简化移动端表单",
                        description: "减少字段，分步骤填写。",
                        example: `<!-- 多步骤表单 -->
<form id="multiStep">
    <!-- 步骤1 -->
    <div class="step active" data-step="1">
        <h3>第1步：基本信息</h3>
        <input type="text" name="name" required>
        <button type="button" onclick="nextStep()">下一步</button>
    </div>
    
    <!-- 步骤2 -->
    <div class="step" data-step="2">
        <h3>第2步：联系方式</h3>
        <input type="email" name="email" required>
        <button type="button" onclick="prevStep()">上一步</button>
        <button type="submit">提交</button>
    </div>
</form>`
                    }
                ]
            }
        },
        {
            type: "security",
            title: "表单安全性",
            content: {
                description: "保护表单免受攻击和滥用：",
                risks: [
                    "CSRF（跨站请求伪造）攻击",
                    "XSS（跨站脚本）攻击",
                    "SQL注入攻击",
                    "暴力破解",
                    "垃圾信息提交"
                ],
                solutions: [
                    "使用CSRF令牌",
                    "服务器端验证所有输入",
                    "对输出进行HTML转义",
                    "使用HTTPS传输敏感数据",
                    "实现速率限制",
                    "添加验证码（必要时）"
                ],
                examples: [
                    {
                        title: "CSRF保护",
                        code: `<!-- 添加CSRF令牌 -->
<form method="post" action="/submit">
    <input type="hidden" 
           name="csrf_token" 
           value="<?php echo generate_csrf_token(); ?>">
    
    <input type="text" name="username">
    <button type="submit">提交</button>
</form>

<!-- 服务器端验证令牌 -->
<?php
if ($_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    die('Invalid CSRF token');
}
?>`,
                        explanation: "CSRF令牌防止跨站请求伪造"
                    },
                    {
                        title: "输入验证和清理",
                        code: `<!-- 客户端验证 -->
<input type="email" 
       name="email"
       pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
       required>

<!-- 服务器端验证（PHP示例） -->
<?php
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
if (!$email) {
    die('Invalid email');
}

// 清理输入
$name = htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');

// 预处理语句防止SQL注入
$stmt = $pdo->prepare('INSERT INTO users (name, email) VALUES (?, ?)');
$stmt->execute([$name, $email]);
?>`,
                        explanation: "永远不要信任客户端输入"
                    },
                    {
                        title: "速率限制",
                        code: `<!-- 防止暴力破解 -->
<form id="loginForm">
    <input type="text" name="username" required>
    <input type="password" name="password" required>
    <button type="submit" id="submitBtn">登录</button>
</form>

<script>
let attempts = 0;
const maxAttempts = 3;
const lockoutTime = 5 * 60 * 1000; // 5分钟

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (attempts >= maxAttempts) {
        alert('尝试次数过多，请5分钟后再试');
        return;
    }
    
    const success = await login(formData);
    
    if (!success) {
        attempts++;
        if (attempts >= maxAttempts) {
            setTimeout(() => attempts = 0, lockoutTime);
        }
    }
});
</script>`,
                        explanation: "限制登录尝试次数"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "表单可访问性",
            content: {
                description: "确保表单对所有用户可访问：",
                practices: [
                    {
                        title: "使用语义化HTML",
                        description: "正确使用label、fieldset等元素。",
                        example: `<form>
    <fieldset>
        <legend>个人信息</legend>
        <label for="name">姓名：</label>
        <input type="text" id="name" name="name" required>
    </fieldset>
</form>`
                    },
                    {
                        title: "键盘导航",
                        description: "确保所有功能可通过键盘操作。",
                        example: `<!-- 使用tabindex控制顺序 -->
<input type="text" name="field1" tabindex="1">
<input type="text" name="field2" tabindex="2">
<button type="submit" tabindex="3">提交</button>

<!-- tabindex="-1"：不可通过Tab访问 -->
<!-- tabindex="0"：按自然顺序 -->
<!-- tabindex="1+"：自定义顺序 -->`
                    },
                    {
                        title: "ARIA属性",
                        description: "为屏幕阅读器提供额外信息。",
                        example: `<label for="password">密码：</label>
<input type="password" 
       id="password" 
       name="password"
       aria-required="true"
       aria-describedby="password-help"
       aria-invalid="false">
<small id="password-help">
    至少8位，包含字母和数字
</small>

<!-- 错误状态 -->
<input type="email" 
       aria-invalid="true"
       aria-errormessage="email-error">
<span id="email-error" role="alert">
    请输入有效的邮箱地址
</span>`
                    },
                    {
                        title: "错误提示的可访问性",
                        description: "使用role='alert'通知屏幕阅读器。",
                        example: `<form id="myForm">
    <label for="email">邮箱：</label>
    <input type="email" 
           id="email" 
           name="email"
           aria-describedby="email-error">
    <span id="email-error" 
          role="alert" 
          aria-live="polite"
          style="display: none;">
    </span>
</form>

<script>
input.addEventListener('invalid', () => {
    const error = document.getElementById('email-error');
    error.textContent = '请输入有效的邮箱地址';
    error.style.display = 'block';
});
</script>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "表单最佳实践检查清单",
            content: {
                description: "确保表单符合最佳实践：",
                items: [
                    { id: "check17-1", text: "所有字段都有清晰的label" },
                    { id: "check17-2", text: "使用了合适的input类型" },
                    { id: "check17-3", text: "提供了清晰的placeholder和帮助文本" },
                    { id: "check17-4", text: "实现了客户端和服务器端验证" },
                    { id: "check17-5", text: "错误消息清晰具体" },
                    { id: "check17-6", text: "移动端体验良好" },
                    { id: "check17-7", text: "使用了CSRF保护" },
                    { id: "check17-8", text: "实现了速率限制" },
                    { id: "check17-9", text: "支持键盘导航" },
                    { id: "check17-10", text: "通过了可访问性测试" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "HTML5表单新特性", url: "content.html?chapter=16" },
        next: { title: "HTML5语义化标签", url: "content.html?chapter=18" }
    }
};
