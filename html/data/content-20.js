// 第20章：ARIA可访问性 - 内容数据
window.htmlContentData_20 = {
    section: {
        title: "ARIA可访问性",
        icon: "♿"
    },
    topics: [
        {
            type: "concept",
            title: "ARIA概述",
            content: {
                description: "ARIA（Accessible Rich Internet Applications）是一套属性，用于使Web内容和应用对残障人士更加可访问，特别是使用辅助技术（如屏幕阅读器）的用户。",
                keyPoints: [
                    "ARIA定义了角色、状态和属性",
                    "增强HTML元素的语义和可访问性",
                    "主要服务于屏幕阅读器用户",
                    "不影响元素的外观和行为",
                    "优先使用语义化HTML，ARIA作为补充",
                    "三大核心：role、state、property"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/Accessibility/ARIA"
            }
        },
        {
            type: "principle",
            title: "ARIA五大原则",
            content: {
                description: "使用ARIA时应遵循的核心原则：",
                principles: [
                    {
                        title: "1. 优先使用语义化HTML",
                        description: "如果HTML元素已经有语义，不需要额外的ARIA。",
                        example: `<!-- ❌ 不好：多余的ARIA -->
<button role="button">点击</button>

<!-- ✅ 好：button已经有语义 -->
<button>点击</button>

<!-- ❌ 不好 -->
<div role="heading" aria-level="1">标题</div>

<!-- ✅ 好 -->
<h1>标题</h1>`
                    },
                    {
                        title: "2. 不改变原生语义",
                        description: "除非绝对必要，不要用role改变元素的语义。",
                        example: `<!-- ❌ 错误：改变语义 -->
<h1 role="button">这不是标题</h1>

<!-- ✅ 正确：使用正确的元素 -->
<button>按钮</button>`
                    },
                    {
                        title: "3. 键盘可访问",
                        description: "所有交互元素必须支持键盘操作。",
                        example: `<!-- ❌ 不好：不可键盘访问 -->
<div role="button" onclick="submit()">提交</div>

<!-- ✅ 好：可键盘访问 -->
<div role="button" 
     tabindex="0"
     onclick="submit()"
     onkeydown="if(event.key==='Enter')submit()">
    提交
</div>

<!-- ✅ 更好：使用原生button -->
<button onclick="submit()">提交</button>`
                    },
                    {
                        title: "4. 不隐藏焦点",
                        description: "可获焦点元素必须有可见的焦点状态。",
                        example: `/* ❌ 不好：隐藏焦点 */
button:focus {
    outline: none;
}

/* ✅ 好：自定义焦点样式 */
button:focus {
    outline: 2px solid blue;
    outline-offset: 2px;
}

/* ✅ 好：使用focus-visible */
button:focus-visible {
    outline: 2px solid blue;
}`
                    },
                    {
                        title: "5. 为交互元素添加标签",
                        description: "所有交互元素都应该有可访问的名称。",
                        example: `<!-- ❌ 不好：无标签 -->
<button><svg>...</svg></button>

<!-- ✅ 好：使用aria-label -->
<button aria-label="关闭">
    <svg>...</svg>
</button>

<!-- ✅ 好：使用可见文本 -->
<button>
    <svg>...</svg>
    关闭
</button>`
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "ARIA角色（role）",
            content: {
                description: "role属性定义元素的角色或用途。",
                examples: [
                    {
                        title: "地标角色",
                        code: `<!-- 横幅 -->
<header role="banner">
    <h1>网站标题</h1>
</header>

<!-- 导航 -->
<nav role="navigation" aria-label="主导航">
    <ul>
        <li><a href="/">首页</a></li>
    </ul>
</nav>

<!-- 主内容 -->
<main role="main">
    <h1>页面主标题</h1>
</main>

<!-- 补充内容 -->
<aside role="complementary">
    <h2>相关链接</h2>
</aside>

<!-- 内容信息 -->
<footer role="contentinfo">
    <p>&copy; 2024</p>
</footer>

<!-- 搜索 -->
<form role="search">
    <input type="search">
</form>

<!-- 注意：HTML5语义标签已经有隐式角色，
     通常不需要显式添加role -->`,
                        notes: "地标角色帮助屏幕阅读器快速导航"
                    },
                    {
                        title: "组件角色",
                        code: `<!-- 标签页 -->
<div role="tablist">
    <button role="tab" 
            aria-selected="true" 
            aria-controls="panel1"
            id="tab1">
        标签1
    </button>
    <button role="tab" 
            aria-selected="false"
            aria-controls="panel2"
            id="tab2">
        标签2
    </button>
</div>

<div role="tabpanel" 
     id="panel1" 
     aria-labelledby="tab1">
    面板1内容
</div>

<div role="tabpanel" 
     id="panel2" 
     aria-labelledby="tab2"
     hidden>
    面板2内容
</div>

<!-- 对话框 -->
<div role="dialog" 
     aria-labelledby="dialog-title"
     aria-modal="true">
    <h2 id="dialog-title">确认操作</h2>
    <p>确定要删除吗？</p>
    <button>确定</button>
    <button>取消</button>
</div>

<!-- 警告 -->
<div role="alert">
    操作成功！
</div>

<!-- 进度条 -->
<div role="progressbar" 
     aria-valuenow="75" 
     aria-valuemin="0" 
     aria-valuemax="100">
    75%
</div>`,
                        notes: "为自定义组件添加合适的角色"
                    },
                    {
                        title: "常用角色",
                        code: `<!-- 按钮 -->
<div role="button" tabindex="0">
    点击我
</div>

<!-- 复选框 -->
<div role="checkbox" 
     aria-checked="true"
     tabindex="0">
    选项
</div>

<!-- 单选按钮 -->
<div role="radio" 
     aria-checked="false"
     tabindex="0">
    选项
</div>

<!-- 菜单 -->
<div role="menu">
    <div role="menuitem">选项1</div>
    <div role="menuitem">选项2</div>
</div>

<!-- 列表 -->
<div role="list">
    <div role="listitem">项目1</div>
    <div role="listitem">项目2</div>
</div>

<!-- 注意：能用原生HTML就不要用role -->`,
                        notes: "优先使用语义化HTML元素"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "ARIA属性",
            content: {
                description: "ARIA属性提供元素的额外信息和状态。",
                examples: [
                    {
                        title: "标签属性",
                        code: `<!-- aria-label：直接提供标签 -->
<button aria-label="关闭对话框">
    <svg>×</svg>
</button>

<!-- aria-labelledby：引用元素作为标签 -->
<section aria-labelledby="section-title">
    <h2 id="section-title">章节标题</h2>
    <p>内容...</p>
</section>

<!-- aria-describedby：引用描述 -->
<input type="password" 
       id="password"
       aria-describedby="password-help">
<small id="password-help">
    至少8位，包含字母和数字
</small>

<!-- 多个引用 -->
<input aria-labelledby="label1 label2"
       aria-describedby="help1 help2">`,
                        notes: "确保所有元素都有可访问的名称"
                    },
                    {
                        title: "状态属性",
                        code: `<!-- aria-checked：选中状态 -->
<div role="checkbox" 
     aria-checked="true"
     tabindex="0">
    已选中
</div>

<!-- aria-selected：选择状态 -->
<div role="option" aria-selected="true">
    选项A
</div>

<!-- aria-expanded：展开状态 -->
<button aria-expanded="false" 
        aria-controls="menu">
    菜单
</button>
<div id="menu" hidden>
    菜单内容
</div>

<!-- aria-pressed：按压状态 -->
<button aria-pressed="true">
    静音
</button>

<!-- aria-disabled：禁用状态 -->
<button aria-disabled="true">
    提交
</button>

<!-- aria-hidden：隐藏状态 -->
<div aria-hidden="true">
    对屏幕阅读器隐藏
</div>`,
                        notes: "状态属性需要用JS动态更新"
                    },
                    {
                        title: "关系属性",
                        code: `<!-- aria-controls：控制关系 -->
<button aria-expanded="false"
        aria-controls="dropdown">
    下拉菜单
</button>
<div id="dropdown" hidden>
    菜单项
</div>

<!-- aria-owns：所有权 -->
<div role="listbox" aria-owns="option1 option2">
    <div role="option" id="option1">选项1</div>
</div>
<div role="option" id="option2">选项2</div>

<!-- aria-activedescendant：活动后代 -->
<div role="combobox" 
     aria-activedescendant="option2">
    <input type="text">
    <div role="listbox">
        <div role="option" id="option1">A</div>
        <div role="option" id="option2">B</div>
    </div>
</div>`,
                        notes: "关系属性连接相关元素"
                    },
                    {
                        title: "实时区域",
                        code: `<!-- aria-live：实时更新 -->
<div aria-live="polite">
    <!-- 内容变化时通知用户 -->
</div>

<!-- aria-live取值：
     - off: 不通知（默认）
     - polite: 等待用户空闲时通知
     - assertive: 立即通知
-->

<!-- aria-atomic：整体朗读 -->
<div aria-live="polite" aria-atomic="true">
    <span>剩余</span>
    <span id="time">5</span>
    <span>秒</span>
</div>

<!-- 状态消息 -->
<div role="status" aria-live="polite">
    保存成功
</div>

<!-- 警告 -->
<div role="alert" aria-live="assertive">
    错误：操作失败
</div>`,
                        notes: "实时区域用于动态内容更新"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "常见组件的ARIA实现",
            content: {
                description: "使用ARIA实现常见交互组件的可访问性。",
                examples: [
                    {
                        title: "模态对话框",
                        code: `<div class="modal" 
     role="dialog" 
     aria-modal="true"
     aria-labelledby="modal-title"
     aria-describedby="modal-desc">
    
    <h2 id="modal-title">确认删除</h2>
    <p id="modal-desc">此操作不可恢复，确定继续吗？</p>
    
    <button>确定</button>
    <button aria-label="取消并关闭对话框">取消</button>
</div>

<script>
// 打开对话框时
function openModal() {
    const modal = document.querySelector('.modal');
    
    // 保存之前的焦点
    previousFocus = document.activeElement;
    
    // 显示对话框
    modal.removeAttribute('hidden');
    
    // 聚焦到对话框
    modal.focus();
    
    // 锁定焦点在对话框内
    trapFocus(modal);
}

// 关闭对话框时
function closeModal() {
    const modal = document.querySelector('.modal');
    modal.setAttribute('hidden', '');
    
    // 恢复焦点
    if (previousFocus) {
        previousFocus.focus();
    }
}
</script>`,
                        notes: "模态对话框需要管理焦点"
                    },
                    {
                        title: "下拉菜单",
                        code: `<div class="dropdown">
    <button id="menu-button"
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="menu">
        菜单
    </button>
    
    <div id="menu"
         role="menu"
         aria-labelledby="menu-button"
         hidden>
        <a href="#" role="menuitem">选项1</a>
        <a href="#" role="menuitem">选项2</a>
        <a href="#" role="menuitem">选项3</a>
    </div>
</div>

<script>
const button = document.getElementById('menu-button');
const menu = document.getElementById('menu');

button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    
    button.setAttribute('aria-expanded', !isOpen);
    menu.hidden = isOpen;
    
    if (!isOpen) {
        menu.querySelector('[role="menuitem"]').focus();
    }
});

// 键盘导航
menu.addEventListener('keydown', (e) => {
    const items = menu.querySelectorAll('[role="menuitem"]');
    const current = document.activeElement;
    const index = Array.from(items).indexOf(current);
    
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            items[(index + 1) % items.length].focus();
            break;
        case 'ArrowUp':
            e.preventDefault();
            items[(index - 1 + items.length) % items.length].focus();
            break;
        case 'Escape':
            button.click();
            button.focus();
            break;
    }
});
</script>`,
                        notes: "下拉菜单需要键盘导航支持"
                    },
                    {
                        title: "工具提示",
                        code: `<button aria-describedby="tooltip">
    帮助
</button>

<div id="tooltip" 
     role="tooltip"
     hidden>
    这是帮助信息
</div>

<script>
const button = document.querySelector('button');
const tooltip = document.getElementById('tooltip');

button.addEventListener('mouseenter', showTooltip);
button.addEventListener('focus', showTooltip);
button.addEventListener('mouseleave', hideTooltip);
button.addEventListener('blur', hideTooltip);

function showTooltip() {
    tooltip.hidden = false;
}

function hideTooltip() {
    tooltip.hidden = true;
}
</script>`,
                        notes: "工具提示要响应鼠标和键盘"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "ARIA最佳实践",
            content: {
                description: "正确使用ARIA的关键原则：",
                practices: [
                    {
                        title: "能用HTML就不用ARIA",
                        description: "原生HTML元素已经有良好的可访问性。",
                        example: `<!-- ❌ 不必要的ARIA -->
<div role="button" tabindex="0" onclick="...">
    点击
</div>

<!-- ✅ 使用原生元素 -->
<button onclick="...">
    点击
</button>`
                    },
                    {
                        title: "保持状态同步",
                        description: "ARIA属性要与实际状态一致。",
                        example: `// ✅ 正确同步状态
button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    
    // 同时更新ARIA和实际状态
    button.setAttribute('aria-expanded', !expanded);
    panel.hidden = expanded;
});`
                    },
                    {
                        title: "测试可访问性",
                        description: "使用屏幕阅读器测试。",
                        example: `<!-- 测试工具：
     - NVDA（Windows）
     - JAWS（Windows）
     - VoiceOver（macOS/iOS）
     - TalkBack（Android）
     - Chrome的Lighthouse
     - axe DevTools
-->`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "ARIA可访问性检查清单",
            content: {
                description: "确保正确实现ARIA：",
                items: [
                    { id: "check20-1", text: "优先使用语义化HTML" },
                    { id: "check20-2", text: "所有交互元素可键盘访问" },
                    { id: "check20-3", text: "焦点状态清晰可见" },
                    { id: "check20-4", text: "所有元素有可访问的名称" },
                    { id: "check20-5", text: "role使用正确" },
                    { id: "check20-6", text: "状态属性与实际状态同步" },
                    { id: "check20-7", text: "实时区域设置合理" },
                    { id: "check20-8", text: "模态对话框管理焦点" },
                    { id: "check20-9", text: "通过屏幕阅读器测试" },
                    { id: "check20-10", text: "通过自动化测试工具检查" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "微格式与微数据", url: "content.html?chapter=19" },
        next: { title: "语义化实战", url: "content.html?chapter=21" }
    }
};
