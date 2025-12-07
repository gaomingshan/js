// 第28章：Web Components - 内容数据
window.htmlContentData_28 = {
    section: {
        title: "Web Components",
        icon: "🧩"
    },
    topics: [
        {
            type: "concept",
            title: "Web Components概述",
            content: {
                description: "Web Components是一套浏览器原生API，允许创建可重用的自定义元素。它由三个主要技术组成：Custom Elements、Shadow DOM和HTML Templates。",
                keyPoints: [
                    "创建可重用的自定义HTML元素",
                    "封装样式和行为",
                    "框架无关，可在任何项目中使用",
                    "浏览器原生支持，无需额外依赖",
                    "三大核心：Custom Elements、Shadow DOM、Templates",
                    "提供真正的组件化解决方案"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/Web_Components"
            }
        },
        {
            type: "comparison",
            title: "Web Components三大技术",
            content: {
                description: "理解Web Components的核心技术。",
                items: [
                    {
                        name: "Custom Elements",
                        pros: [
                            "定义自定义HTML标签",
                            "扩展现有HTML元素",
                            "生命周期回调",
                            "完全的JavaScript控制",
                            "可以继承内置元素"
                        ],
                        cons: []
                    },
                    {
                        name: "Shadow DOM",
                        pros: [
                            "封装DOM结构",
                            "样式隔离",
                            "避免命名冲突",
                            "真正的组件封装",
                            "性能优化"
                        ],
                        cons: []
                    },
                    {
                        name: "HTML Templates",
                        pros: [
                            "定义可复用的HTML结构",
                            "惰性加载，不会立即渲染",
                            "可克隆使用",
                            "与slot配合实现内容分发",
                            "提升性能"
                        ],
                        cons: []
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "创建简单的Web Component",
            content: {
                description: "从零开始创建一个Web Component。",
                examples: [
                    {
                        title: "基础自定义元素",
                        code: `<!-- HTML使用 -->
<user-card 
    name="张三" 
    email="zhangsan@example.com"
    avatar="/images/avatar.jpg">
</user-card>

<!-- JavaScript定义 -->
<script>
class UserCard extends HTMLElement {
    constructor() {
        super();
        
        // 创建Shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // 渲染组件
        this.render();
    }
    
    render() {
        const name = this.getAttribute('name') || '未知';
        const email = this.getAttribute('email') || '';
        const avatar = this.getAttribute('avatar') || '/default-avatar.jpg';
        
        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    display: block;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 16px;
                    max-width: 300px;
                }
                
                .card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                
                .info {
                    flex: 1;
                }
                
                .name {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 0 0 4px;
                }
                
                .email {
                    color: #666;
                    font-size: 14px;
                    margin: 0;
                }
            </style>
            
            <div class="card">
                <img class="avatar" src="\${avatar}" alt="\${name}">
                <div class="info">
                    <h3 class="name">\${name}</h3>
                    <p class="email">\${email}</p>
                </div>
            </div>
        \`;
    }
}

// 注册自定义元素
customElements.define('user-card', UserCard);
</script>`,
                        notes: "这是一个完整的Web Component示例"
                    },
                    {
                        title: "带交互的组件",
                        code: `<!-- 可展开/折叠的手风琴组件 -->
<my-accordion>
    <div slot="header">点击展开</div>
    <div slot="content">
        这是可以展开和折叠的内容。
    </div>
</my-accordion>

<script>
class MyAccordion extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
    }
    
    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    display: block;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    margin-bottom: 8px;
                }
                
                .header {
                    padding: 12px 16px;
                    background: #f5f5f5;
                    cursor: pointer;
                    user-select: none;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header:hover {
                    background: #ebebeb;
                }
                
                .icon {
                    transition: transform 0.3s;
                }
                
                .icon.open {
                    transform: rotate(180deg);
                }
                
                .content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                }
                
                .content.open {
                    max-height: 500px;
                    padding: 16px;
                }
            </style>
            
            <div class="header">
                <slot name="header"></slot>
                <span class="icon">▼</span>
            </div>
            <div class="content">
                <slot name="content"></slot>
            </div>
        \`;
    }
    
    attachEventListeners() {
        const header = this.shadowRoot.querySelector('.header');
        const content = this.shadowRoot.querySelector('.content');
        const icon = this.shadowRoot.querySelector('.icon');
        
        header.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            content.classList.toggle('open', this.isOpen);
            icon.classList.toggle('open', this.isOpen);
            
            // 触发自定义事件
            this.dispatchEvent(new CustomEvent('toggle', {
                detail: { isOpen: this.isOpen }
            }));
        });
    }
}

customElements.define('my-accordion', MyAccordion);

// 监听事件
document.querySelector('my-accordion').addEventListener('toggle', (e) => {
    console.log('Accordion toggled:', e.detail.isOpen);
});
</script>`,
                        notes: "带交互和自定义事件的组件"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "生命周期回调",
            content: {
                description: "Custom Elements提供了生命周期回调方法。",
                examples: [
                    {
                        title: "生命周期方法",
                        code: `<script>
class MyElement extends HTMLElement {
    // 构造函数
    constructor() {
        super();
        console.log('1. constructor - 元素创建');
        
        // 在构造函数中：
        // - 创建Shadow DOM
        // - 设置初始状态
        // - 不要访问属性或子元素
        this.attachShadow({ mode: 'open' });
    }
    
    // 元素插入到文档
    connectedCallback() {
        console.log('2. connectedCallback - 元素插入DOM');
        
        // 在这里：
        // - 渲染内容
        // - 添加事件监听
        // - 获取属性
        // - 访问子元素
        this.render();
        this.addEventListeners();
    }
    
    // 元素从文档移除
    disconnectedCallback() {
        console.log('3. disconnectedCallback - 元素移除');
        
        // 在这里：
        // - 清理事件监听
        // - 取消定时器
        // - 释放资源
        this.removeEventListeners();
    }
    
    // 元素移动到新文档
    adoptedCallback() {
        console.log('4. adoptedCallback - 元素被移动');
        // 很少使用
    }
    
    // 属性变化
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(\`5. attributeChangedCallback - \${name}: \${oldValue} → \${newValue}\`);
        
        // 在这里：
        // - 响应属性变化
        // - 更新UI
        if (oldValue !== newValue) {
            this.render();
        }
    }
    
    // 声明要监听的属性
    static get observedAttributes() {
        return ['name', 'value', 'disabled'];
    }
    
    render() {
        this.shadowRoot.innerHTML = \`
            <p>Name: \${this.getAttribute('name')}</p>
        \`;
    }
    
    addEventListeners() {
        // 添加事件监听
    }
    
    removeEventListeners() {
        // 移除事件监听
    }
}

customElements.define('my-element', MyElement);
</script>

<!-- 使用 -->
<my-element name="test"></my-element>

<script>
// 动态修改属性
const el = document.querySelector('my-element');
el.setAttribute('name', 'updated'); // 触发attributeChangedCallback

// 移除元素
el.remove(); // 触发disconnectedCallback
</script>`,
                        notes: "生命周期方法按特定顺序调用"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "属性和方法",
            content: {
                description: "定义组件的属性和方法。",
                examples: [
                    {
                        title: "属性访问器",
                        code: `<script>
class MyInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.render();
    }
    
    // 定义属性的getter和setter
    get value() {
        return this.getAttribute('value') || '';
    }
    
    set value(val) {
        this.setAttribute('value', val);
    }
    
    get disabled() {
        return this.hasAttribute('disabled');
    }
    
    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }
    
    // 监听属性变化
    static get observedAttributes() {
        return ['value', 'disabled', 'placeholder'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            const input = this.shadowRoot.querySelector('input');
            if (input && input.value !== newValue) {
                input.value = newValue;
            }
        }
    }
    
    // 公共方法
    focus() {
        this.shadowRoot.querySelector('input').focus();
    }
    
    clear() {
        this.value = '';
    }
    
    render() {
        const placeholder = this.getAttribute('placeholder') || '';
        const disabled = this.hasAttribute('disabled');
        
        this.shadowRoot.innerHTML = \`
            <style>
                input {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                
                input:focus {
                    outline: none;
                    border-color: #4CAF50;
                }
            </style>
            
            <input 
                type="text"
                value="\${this.value}"
                placeholder="\${placeholder}"
                \${disabled ? 'disabled' : ''}
            >
        \`;
        
        // 监听输入事件
        const input = this.shadowRoot.querySelector('input');
        input.addEventListener('input', (e) => {
            this.setAttribute('value', e.target.value);
            
            // 触发自定义事件
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value: e.target.value },
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('my-input', MyInput);
</script>

<!-- 使用 -->
<my-input 
    value="初始值" 
    placeholder="请输入..."
    disabled>
</my-input>

<script>
const input = document.querySelector('my-input');

// 使用属性
console.log(input.value); // 获取值
input.value = '新值'; // 设置值
input.disabled = false; // 启用

// 使用方法
input.focus();
input.clear();

// 监听事件
input.addEventListener('change', (e) => {
    console.log('Value changed:', e.detail.value);
});
</script>`,
                        notes: "使用getter/setter定义属性接口"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "样式封装",
            content: {
                description: "Shadow DOM提供样式隔离。",
                examples: [
                    {
                        title: "样式隔离",
                        code: `<script>
class StyledButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.shadowRoot.innerHTML = \`
            <style>
                /* :host 选择器指向自定义元素本身 */
                :host {
                    display: inline-block;
                }
                
                /* :host() 条件选择 */
                :host(.primary) button {
                    background: #4CAF50;
                    color: white;
                }
                
                :host(.secondary) button {
                    background: #2196F3;
                    color: white;
                }
                
                /* :host-context() 根据祖先元素 */
                :host-context(.dark-theme) button {
                    background: #333;
                    color: white;
                }
                
                button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    cursor: pointer;
                    background: #e0e0e0;
                    transition: all 0.3s;
                }
                
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                
                button:active {
                    transform: translateY(0);
                }
                
                /* 这些样式不会影响外部 */
            </style>
            
            <button>
                <slot></slot>
            </button>
        \`;
    }
}

customElements.define('styled-button', StyledButton);
</script>

<!-- 全局样式 -->
<style>
    /* 这个样式不会影响Shadow DOM内的button */
    button {
        background: red !important;
    }
</style>

<!-- 使用 -->
<styled-button class="primary">主按钮</styled-button>
<styled-button class="secondary">次要按钮</styled-button>

<div class="dark-theme">
    <styled-button>深色主题按钮</styled-button>
</div>`,
                        notes: "Shadow DOM内的样式完全隔离"
                    },
                    {
                        title: "CSS自定义属性",
                        code: `<script>
class ThemedCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    /* 定义默认值 */
                    --card-bg: white;
                    --card-border: #ddd;
                    --card-text: #333;
                    --card-padding: 16px;
                    
                    display: block;
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    color: var(--card-text);
                    padding: var(--card-padding);
                    border-radius: 8px;
                }
                
                h3 {
                    margin: 0 0 8px;
                    color: var(--card-title-color, var(--card-text));
                }
            </style>
            
            <h3><slot name="title"></slot></h3>
            <div><slot></slot></div>
        \`;
    }
}

customElements.define('themed-card', ThemedCard);
</script>

<!-- 通过CSS变量自定义样式 -->
<style>
    .dark themed-card {
        --card-bg: #333;
        --card-border: #555;
        --card-text: white;
    }
    
    .custom themed-card {
        --card-bg: #e3f2fd;
        --card-border: #2196F3;
        --card-padding: 24px;
        --card-title-color: #1976D2;
    }
</style>

<themed-card>
    <span slot="title">默认卡片</span>
    内容
</themed-card>

<div class="dark">
    <themed-card>
        <span slot="title">深色卡片</span>
        内容
    </themed-card>
</div>

<div class="custom">
    <themed-card>
        <span slot="title">自定义卡片</span>
        内容
    </themed-card>
</div>`,
                        notes: "使用CSS变量实现主题定制"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "Web Components最佳实践",
            content: {
                description: "开发Web Components的关键实践：",
                practices: [
                    {
                        title: "命名规范",
                        description: "自定义元素名必须包含连字符。",
                        example: `// ✅ 正确
customElements.define('user-card', UserCard);
customElements.define('my-button', MyButton);

// ❌ 错误
customElements.define('usercard', UserCard); // 没有连字符
customElements.define('User-Card', UserCard); // 大写字母`
                    },
                    {
                        title: "使用Shadow DOM",
                        description: "封装样式和DOM结构。",
                        example: `constructor() {
    super();
    // 推荐使用Shadow DOM
    this.attachShadow({ mode: 'open' });
}`
                    },
                    {
                        title: "响应属性变化",
                        description: "实现observedAttributes和attributeChangedCallback。",
                        example: `static get observedAttributes() {
    return ['value', 'disabled'];
}

attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
        this.render();
    }
}`
                    },
                    {
                        title: "提供公共API",
                        description: "定义清晰的属性和方法。",
                        example: `// 属性
get value() { return this.getAttribute('value'); }
set value(val) { this.setAttribute('value', val); }

// 方法
focus() { /* ... */ }
reset() { /* ... */ }`
                    },
                    {
                        title: "触发自定义事件",
                        description: "使用CustomEvent通信。",
                        example: `this.dispatchEvent(new CustomEvent('change', {
    detail: { value: this.value },
    bubbles: true,
    composed: true // 穿透Shadow DOM
}));`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "Web Components检查清单",
            content: {
                description: "确保Web Component开发规范：",
                items: [
                    { id: "check28-1", text: "元素名包含连字符" },
                    { id: "check28-2", text: "使用Shadow DOM封装" },
                    { id: "check28-3", text: "实现必要的生命周期回调" },
                    { id: "check28-4", text: "声明observedAttributes" },
                    { id: "check28-5", text: "提供getter/setter属性访问" },
                    { id: "check28-6", text: "提供公共方法" },
                    { id: "check28-7", text: "使用CustomEvent通信" },
                    { id: "check28-8", text: "清理事件监听器（disconnectedCallback）" },
                    { id: "check28-9", text: "支持CSS变量自定义样式" },
                    { id: "check28-10", text: "提供默认slot" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "资源加载优化", url: "content.html?chapter=27" },
        next: { title: "Shadow DOM", url: "content.html?chapter=29" }
    }
};
