// 第30章：Custom Elements - 内容数据
window.htmlContentData_30 = {
    section: {
        title: "Custom Elements",
        icon: "🎨"
    },
    topics: [
        {
            type: "concept",
            title: "Custom Elements概述",
            content: {
                description: "Custom Elements API允许开发者定义自己的HTML元素，包括元素的行为、样式和API。分为自主自定义元素和自定义内置元素两种类型。",
                keyPoints: [
                    "定义全新的HTML元素",
                    "扩展现有HTML元素",
                    "完整的生命周期钩子",
                    "必须包含连字符的标签名",
                    "可以继承和扩展",
                    "浏览器原生支持"
                ]
            }
        },
        {
            type: "code-example",
            title: "自主自定义元素",
            content: {
                description: "从HTMLElement继承创建全新元素。",
                examples: [
                    {
                        title: "基础自定义元素",
                        code: `<!-- 定义自定义元素 -->
<script>
class MyCounter extends HTMLElement {
    constructor() {
        super();
        this._count = 0;
        this.attachShadow({ mode: 'open' });
        this.render();
    }
    
    connectedCallback() {
        this.setupEvents();
    }
    
    disconnectedCallback() {
        // 清理事件监听
    }
    
    // 公共方法
    increment() {
        this._count++;
        this.updateDisplay();
    }
    
    decrement() {
        this._count--;
        this.updateDisplay();
    }
    
    reset() {
        this._count = 0;
        this.updateDisplay();
    }
    
    get count() {
        return this._count;
    }
    
    set count(val) {
        this._count = parseInt(val) || 0;
        this.updateDisplay();
    }
    
    render() {
        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    display: inline-block;
                    padding: 16px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-family: sans-serif;
                }
                
                .display {
                    font-size: 48px;
                    font-weight: bold;
                    text-align: center;
                    margin: 16px 0;
                    color: #333;
                }
                
                .controls {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                }
                
                button {
                    padding: 8px 16px;
                    font-size: 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    background: #4CAF50;
                    color: white;
                }
                
                button:hover {
                    background: #45a049;
                }
                
                button:active {
                    transform: scale(0.95);
                }
            </style>
            
            <div class="display">0</div>
            <div class="controls">
                <button class="decrement">-</button>
                <button class="reset">Reset</button>
                <button class="increment">+</button>
            </div>
        \`;
    }
    
    setupEvents() {
        const shadow = this.shadowRoot;
        shadow.querySelector('.increment').onclick = () => this.increment();
        shadow.querySelector('.decrement').onclick = () => this.decrement();
        shadow.querySelector('.reset').onclick = () => this.reset();
    }
    
    updateDisplay() {
        this.shadowRoot.querySelector('.display').textContent = this._count;
        
        // 触发自定义事件
        this.dispatchEvent(new CustomEvent('count-changed', {
            detail: { count: this._count },
            bubbles: true,
            composed: true
        }));
    }
}

// 注册自定义元素
customElements.define('my-counter', MyCounter);
</script>

<!-- 使用 -->
<my-counter></my-counter>

<script>
const counter = document.querySelector('my-counter');

// 使用方法
counter.increment();
console.log(counter.count); // 1

// 监听事件
counter.addEventListener('count-changed', (e) => {
    console.log('Count:', e.detail.count);
});
</script>`,
                        notes: "自主自定义元素是全新的HTML元素"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "自定义内置元素",
            content: {
                description: "扩展现有HTML元素。",
                examples: [
                    {
                        title: "扩展button",
                        code: `<!-- 扩展button元素 -->
<script>
class FancyButton extends HTMLButtonElement {
    constructor() {
        super();
        this._ripple();
    }
    
    connectedCallback() {
        this.classList.add('fancy-button');
    }
    
    _ripple() {
        this.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
}

// 注册时指定extends
customElements.define('fancy-button', FancyButton, { extends: 'button' });
</script>

<style>
.fancy-button {
    position: relative;
    overflow: hidden;
    padding: 12px 24px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
}

.fancy-button:hover {
    background: #1976D2;
}

.fancy-button .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
</style>

<!-- 使用is属性 -->
<button is="fancy-button">点击我</button>

<script>
// JavaScript创建
const btn = document.createElement('button', { is: 'fancy-button' });
btn.textContent = '动态按钮';
document.body.appendChild(btn);
</script>`,
                        notes: "自定义内置元素扩展现有元素"
                    },
                    {
                        title: "扩展input",
                        code: `<script>
class ValidatedInput extends HTMLInputElement {
    constructor() {
        super();
    }
    
    connectedCallback() {
        this.addEventListener('input', () => this.validate());
        this.addEventListener('blur', () => this.showError());
    }
    
    validate() {
        const pattern = this.getAttribute('validation-pattern');
        const message = this.getAttribute('validation-message');
        
        if (pattern) {
            const regex = new RegExp(pattern);
            const isValid = regex.test(this.value);
            
            this.setCustomValidity(isValid ? '' : message || '格式不正确');
            this.classList.toggle('invalid', !isValid && this.value);
        }
        
        return this.checkValidity();
    }
    
    showError() {
        if (!this.checkValidity()) {
            const error = this.validationMessage;
            // 显示错误消息
            console.log(error);
        }
    }
}

customElements.define('validated-input', ValidatedInput, { extends: 'input' });
</script>

<style>
input.invalid {
    border-color: red;
}
</style>

<!-- 使用 -->
<input 
    is="validated-input"
    type="text"
    validation-pattern="^\\d{6}$"
    validation-message="请输入6位数字"
    placeholder="邮政编码">

<input 
    is="validated-input"
    type="email"
    required
    placeholder="邮箱地址">`,
                        notes: "扩展input添加自定义验证"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "生命周期详解",
            content: {
                description: "深入理解Custom Elements生命周期。",
                examples: [
                    {
                        title: "完整生命周期",
                        code: `<script>
class LifecycleDemo extends HTMLElement {
    constructor() {
        super();
        console.log('1. constructor');
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        console.log('2. connectedCallback - 插入DOM');
        this.render();
    }
    
    disconnectedCallback() {
        console.log('3. disconnectedCallback - 移除DOM');
        this.cleanup();
    }
    
    adoptedCallback() {
        console.log('4. adoptedCallback - 移动到新文档');
    }
    
    attributeChangedCallback(name, oldVal, newVal) {
        console.log(\`5. attributeChangedCallback: \${name}\`);
        console.log(\`   \${oldVal} → \${newVal}\`);
        
        if (oldVal !== newVal) {
            this.render();
        }
    }
    
    static get observedAttributes() {
        return ['title', 'color', 'size'];
    }
    
    render() {
        const title = this.getAttribute('title') || 'No Title';
        const color = this.getAttribute('color') || 'black';
        const size = this.getAttribute('size') || '16';
        
        this.shadowRoot.innerHTML = \`
            <style>
                p {
                    color: \${color};
                    font-size: \${size}px;
                }
            </style>
            <p>\${title}</p>
        \`;
    }
    
    cleanup() {
        // 清理工作
    }
}

customElements.define('lifecycle-demo', LifecycleDemo);
</script>

<!-- 测试生命周期 -->
<lifecycle-demo title="初始标题" color="blue"></lifecycle-demo>

<script>
const demo = document.querySelector('lifecycle-demo');

// 触发attributeChangedCallback
demo.setAttribute('title', '新标题');
demo.setAttribute('color', 'red');

// 触发disconnectedCallback
setTimeout(() => demo.remove(), 2000);
</script>`,
                        notes: "理解生命周期调用时机"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "元素升级",
            content: {
                description: "处理在定义之前使用的元素。",
                examples: [
                    {
                        title: "元素升级机制",
                        code: `<!-- 在定义之前使用 -->
<my-widget data="test"></my-widget>

<script>
// 检查元素是否已定义
console.log(customElements.get('my-widget')); // undefined

// whenDefined返回Promise
customElements.whenDefined('my-widget').then(() => {
    console.log('my-widget已定义');
    const widget = document.querySelector('my-widget');
    console.log(widget instanceof MyWidget); // true
});

// 延迟定义元素
setTimeout(() => {
    class MyWidget extends HTMLElement {
        constructor() {
            super();
            console.log('MyWidget构造');
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = \`
                <p>Data: \${this.getAttribute('data')}</p>
            \`;
        }
    }
    
    customElements.define('my-widget', MyWidget);
    // 元素自动升级
}, 1000);

// 手动升级
customElements.upgrade(document.querySelector('my-widget'));
</script>`,
                        notes: "元素会在定义时自动升级"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "Custom Elements最佳实践",
            content: {
                description: "开发Custom Elements的关键实践：",
                practices: [
                    {
                        title: "命名规范",
                        description: "必须包含连字符，避免与未来HTML元素冲突。",
                        example: `// ✅ 正确
customElements.define('my-button', MyButton);
customElements.define('user-card', UserCard);

// ❌ 错误
customElements.define('mybutton', MyButton); // 无连字符
customElements.define('MyButton', MyButton); // 大写`
                    },
                    {
                        title: "延迟渲染",
                        description: "在connectedCallback中渲染。",
                        example: `constructor() {
    super();
    // 只初始化状态
}

connectedCallback() {
    // 在这里渲染
    this.render();
}`
                    },
                    {
                        title: "清理资源",
                        description: "在disconnectedCallback中清理。",
                        example: `disconnectedCallback() {
    // 移除事件监听
    this.removeEventListeners();
    // 清理定时器
    clearInterval(this._timer);
    // 取消请求
    this._abortController?.abort();
}`
                    },
                    {
                        title: "属性反映",
                        description: "属性和property保持同步。",
                        example: `get value() {
    return this.getAttribute('value');
}

set value(val) {
    this.setAttribute('value', val);
}

attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'value') {
        this.updateDisplay();
    }
}`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "Custom Elements检查清单",
            content: {
                description: "确保Custom Elements开发规范：",
                items: [
                    { id: "check30-1", text: "元素名包含连字符" },
                    { id: "check30-2", text: "正确实现生命周期回调" },
                    { id: "check30-3", text: "声明observedAttributes" },
                    { id: "check30-4", text: "属性和property同步" },
                    { id: "check30-5", text: "在connectedCallback中渲染" },
                    { id: "check30-6", text: "在disconnectedCallback中清理" },
                    { id: "check30-7", text: "提供公共API" },
                    { id: "check30-8", text: "触发适当的自定义事件" },
                    { id: "check30-9", text: "考虑可访问性（ARIA）" },
                    { id: "check30-10", text: "提供完整文档" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "Shadow DOM", url: "content.html?chapter=29" },
        next: { title: "HTML Templates", url: "content.html?chapter=31" }
    }
};
