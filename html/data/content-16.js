// 第16章：HTML5表单新特性 - 内容数据
window.htmlContentData_16 = {
    section: {
        title: "HTML5表单新特性",
        icon: "✨"
    },
    topics: [
        {
            type: "concept",
            title: "HTML5表单增强",
            content: {
                description: "HTML5为表单引入了许多新特性，包括新的input类型、内置验证、新属性等，大大简化了表单开发和验证工作。",
                keyPoints: [
                    "新增多种input类型（email、url、date等）",
                    "内置表单验证功能",
                    "placeholder、autofocus等新属性",
                    "pattern属性支持正则验证",
                    "required、min、max等约束属性",
                    "自定义验证消息"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Learn/Forms/HTML5_input_types"
            }
        },
        {
            type: "code-example",
            title: "HTML5表单验证",
            content: {
                description: "HTML5提供了内置的表单验证功能。",
                examples: [
                    {
                        title: "必填字段",
                        code: `<form>
    <label for="username">用户名（必填）：</label>
    <input type="text" 
           id="username" 
           name="username"
           required>
    
    <label for="email">邮箱（必填）：</label>
    <input type="email" 
           id="email" 
           name="email"
           required>
    
    <button type="submit">提交</button>
</form>

<!-- required属性：
     - 字段不能为空
     - 提交时自动验证
     - 浏览器显示错误提示
-->`,
                        notes: "required标记必填字段"
                    },
                    {
                        title: "长度限制",
                        code: `<!-- 最小长度 -->
<label for="password">密码（至少6位）：</label>
<input type="password" 
       id="password" 
       name="password"
       minlength="6"
       required>

<!-- 最大长度 -->
<label for="username">用户名（最多20位）：</label>
<input type="text" 
       id="username" 
       name="username"
       maxlength="20">

<!-- 组合使用 -->
<label for="code">验证码（6位）：</label>
<input type="text" 
       id="code" 
       name="code"
       minlength="6"
       maxlength="6"
       pattern="[0-9]{6}"
       required>`,
                        notes: "minlength和maxlength限制字符数"
                    },
                    {
                        title: "数值范围",
                        code: `<!-- 数字范围 -->
<label for="age">年龄（18-100）：</label>
<input type="number" 
       id="age" 
       name="age"
       min="18"
       max="100"
       required>

<!-- 日期范围 -->
<label for="birthday">生日：</label>
<input type="date" 
       id="birthday" 
       name="birthday"
       min="1900-01-01"
       max="2024-12-31">

<!-- 步进值 -->
<label for="quantity">数量（5的倍数）：</label>
<input type="number" 
       id="quantity" 
       name="quantity"
       min="5"
       max="100"
       step="5"
       value="5">`,
                        notes: "min、max、step限制数值范围"
                    },
                    {
                        title: "正则表达式验证",
                        code: `<!-- 手机号 -->
<label for="phone">手机号：</label>
<input type="tel" 
       id="phone" 
       name="phone"
       pattern="1[3-9][0-9]{9}"
       placeholder="13800138000"
       title="请输入11位手机号"
       required>

<!-- 邮政编码 -->
<label for="zipcode">邮编：</label>
<input type="text" 
       id="zipcode" 
       name="zipcode"
       pattern="[0-9]{6}"
       placeholder="100000"
       title="请输入6位数字"
       required>

<!-- 用户名（字母数字下划线） -->
<label for="username">用户名：</label>
<input type="text" 
       id="username" 
       name="username"
       pattern="[a-zA-Z0-9_]{6,20}"
       placeholder="6-20个字符"
       title="只能包含字母、数字和下划线，长度6-20"
       required>

<!-- 密码强度 -->
<label for="password">密码：</label>
<input type="password" 
       id="password" 
       name="password"
       pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
       title="至少8位，包含大小写字母和数字"
       required>`,
                        notes: "pattern使用正则表达式验证"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "自定义验证",
            content: {
                description: "使用JavaScript实现更复杂的验证逻辑。",
                examples: [
                    {
                        title: "自定义验证消息",
                        code: `<form id="myForm">
    <label for="email">邮箱：</label>
    <input type="email" 
           id="email" 
           name="email"
           required>
    <button type="submit">提交</button>
</form>

<script>
const email = document.getElementById('email');

// 自定义必填消息
email.addEventListener('invalid', (e) => {
    if (email.validity.valueMissing) {
        email.setCustomValidity('请输入您的邮箱地址');
    } else if (email.validity.typeMismatch) {
        email.setCustomValidity('请输入有效的邮箱格式');
    }
});

// 输入时清除自定义消息
email.addEventListener('input', () => {
    email.setCustomValidity('');
});
</script>`,
                        notes: "setCustomValidity设置自定义消息"
                    },
                    {
                        title: "密码确认验证",
                        code: `<form>
    <label for="password">密码：</label>
    <input type="password" 
           id="password" 
           name="password"
           minlength="6"
           required>
    
    <label for="confirm">确认密码：</label>
    <input type="password" 
           id="confirm" 
           name="confirm"
           minlength="6"
           required>
    
    <button type="submit">提交</button>
</form>

<script>
const password = document.getElementById('password');
const confirm = document.getElementById('confirm');

function validatePassword() {
    if (password.value !== confirm.value) {
        confirm.setCustomValidity('两次密码输入不一致');
    } else {
        confirm.setCustomValidity('');
    }
}

password.addEventListener('change', validatePassword);
confirm.addEventListener('input', validatePassword);
</script>`,
                        notes: "比较两个字段的值"
                    },
                    {
                        title: "异步验证（用户名可用性）",
                        code: `<label for="username">用户名：</label>
<input type="text" 
       id="username" 
       name="username"
       required>
<span id="username-status"></span>

<script>
const username = document.getElementById('username');
const status = document.getElementById('username-status');
let timeout;

username.addEventListener('input', () => {
    clearTimeout(timeout);
    
    const value = username.value;
    if (value.length < 3) {
        status.textContent = '';
        return;
    }
    
    status.textContent = '检查中...';
    
    timeout = setTimeout(async () => {
        // 模拟API检查
        const available = await checkUsername(value);
        
        if (available) {
            status.textContent = '✓ 可用';
            status.style.color = 'green';
            username.setCustomValidity('');
        } else {
            status.textContent = '✗ 已被使用';
            status.style.color = 'red';
            username.setCustomValidity('用户名已被使用');
        }
    }, 500);
});

async function checkUsername(name) {
    // 模拟API调用
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(!['admin', 'test', 'user'].includes(name));
        }, 300);
    });
}
</script>`,
                        notes: "使用防抖进行异步验证"
                    },
                    {
                        title: "表单提交验证",
                        code: `<form id="registrationForm" novalidate>
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email" required>
    <span class="error" id="email-error"></span>
    
    <label for="age">年龄：</label>
    <input type="number" id="age" name="age" min="18" required>
    <span class="error" id="age-error"></span>
    
    <button type="submit">注册</button>
</form>

<script>
const form = document.getElementById('registrationForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 清除之前的错误
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    
    // 验证所有字段
    let isValid = true;
    const formData = new FormData(form);
    
    for (let [name, value] of formData) {
        const input = form.elements[name];
        const error = document.getElementById(\`\${name}-error\`);
        
        if (!input.checkValidity()) {
            isValid = false;
            error.textContent = input.validationMessage;
        }
    }
    
    if (isValid) {
        console.log('表单验证通过，提交数据');
        // 提交表单
    }
});
</script>

<style>
    .error {
        color: red;
        font-size: 0.9em;
        display: block;
        margin-top: 5px;
    }
</style>`,
                        notes: "novalidate禁用浏览器默认验证"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "表单自动功能",
            content: {
                description: "HTML5提供了多种自动功能提升用户体验。",
                examples: [
                    {
                        title: "autocomplete属性",
                        code: `<form autocomplete="on">
    <!-- 姓名 -->
    <input type="text" name="name" autocomplete="name">
    
    <!-- 邮箱 -->
    <input type="email" name="email" autocomplete="email">
    
    <!-- 电话 -->
    <input type="tel" name="phone" autocomplete="tel">
    
    <!-- 地址 -->
    <input type="text" name="address" autocomplete="street-address">
    <input type="text" name="city" autocomplete="address-level2">
    <input type="text" name="country" autocomplete="country-name">
    <input type="text" name="zip" autocomplete="postal-code">
    
    <!-- 信用卡 -->
    <input type="text" name="cc-name" autocomplete="cc-name">
    <input type="text" name="cc-number" autocomplete="cc-number">
    <input type="text" name="cc-exp" autocomplete="cc-exp">
    <input type="text" name="cc-csc" autocomplete="cc-csc">
    
    <!-- 密码 -->
    <input type="password" name="password" autocomplete="new-password">
    <input type="password" name="current-password" autocomplete="current-password">
</form>

<!-- 关闭自动完成 -->
<input type="text" autocomplete="off">`,
                        notes: "autocomplete帮助浏览器自动填充"
                    },
                    {
                        title: "autofocus属性",
                        code: `<form>
    <!-- 页面加载时自动聚焦 -->
    <label for="search">搜索：</label>
    <input type="search" 
           id="search" 
           name="search"
           autofocus>
    
    <button type="submit">搜索</button>
</form>

<!-- 注意：
     - 一个页面只应该有一个autofocus
     - 不要滥用，可能干扰用户
     - 可访问性：对屏幕阅读器用户要友好
-->`,
                        notes: "autofocus自动聚焦到字段"
                    },
                    {
                        title: "inputmode属性",
                        code: `<!-- 数字键盘 -->
<input type="text" 
       inputmode="numeric"
       pattern="[0-9]*"
       placeholder="输入数字">

<!-- 小数键盘 -->
<input type="text" 
       inputmode="decimal"
       placeholder="输入小数">

<!-- 电话键盘 -->
<input type="text" 
       inputmode="tel"
       placeholder="输入电话">

<!-- 邮箱键盘 -->
<input type="text" 
       inputmode="email"
       placeholder="输入邮箱">

<!-- URL键盘 -->
<input type="text" 
       inputmode="url"
       placeholder="输入网址">

<!-- inputmode值：
     - none: 无虚拟键盘
     - text: 标准键盘
     - decimal: 小数键盘
     - numeric: 数字键盘
     - tel: 电话键盘
     - search: 搜索键盘
     - email: 邮箱键盘
     - url: URL键盘
-->`,
                        notes: "inputmode控制移动端虚拟键盘类型"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "HTML5表单验证最佳实践",
            content: {
                description: "合理使用HTML5验证功能：",
                practices: [
                    {
                        title: "结合使用HTML和JavaScript验证",
                        description: "HTML验证提供基础，JS验证提供复杂逻辑。",
                        example: `<!-- HTML提供基础验证 -->
<input type="email" required minlength="5">

<!-- JavaScript提供复杂验证 -->
<script>
input.addEventListener('blur', () => {
    // 自定义验证逻辑
});
</script>`
                    },
                    {
                        title: "提供清晰的错误提示",
                        description: "告诉用户具体错误原因。",
                        example: `<input type="text" 
       pattern="[a-zA-Z0-9_]{6,20}"
       title="用户名只能包含字母、数字和下划线，长度6-20位"
       required>`
                    },
                    {
                        title: "实时反馈",
                        description: "在用户输入时提供即时反馈。",
                        example: `<input type="password" 
       id="password"
       pattern="(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}">
<div id="password-strength"></div>

<script>
input.addEventListener('input', () => {
    // 显示密码强度
    updateStrengthIndicator();
});
</script>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "HTML5表单特性检查清单",
            content: {
                description: "确保正确使用HTML5表单特性：",
                items: [
                    { id: "check16-1", text: "使用了合适的input type" },
                    { id: "check16-2", text: "必填字段添加了required属性" },
                    { id: "check16-3", text: "使用pattern进行格式验证" },
                    { id: "check16-4", text: "设置了min、max限制范围" },
                    { id: "check16-5", text: "提供了清晰的title提示" },
                    { id: "check16-6", text: "使用autocomplete帮助自动填充" },
                    { id: "check16-7", text: "自定义了验证消息" },
                    { id: "check16-8", text: "移动端设置了inputmode" },
                    { id: "check16-9", text: "测试了表单验证功能" },
                    { id: "check16-10", text: "提供了无JavaScript的降级方案" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "表单高级控件", url: "content.html?chapter=15" },
        next: { title: "表单最佳实践", url: "content.html?chapter=17" }
    }
};
