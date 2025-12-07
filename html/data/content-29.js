// 第29章：Shadow DOM - 内容数据
window.htmlContentData_29 = {
    section: {
        title: "Shadow DOM",
        icon: "👻"
    },
    topics: [
        {
            type: "concept",
            title: "Shadow DOM详解",
            content: {
                description: "Shadow DOM提供了DOM和样式的封装机制，创建一个隔离的DOM树（Shadow Tree），与主文档DOM（Light DOM）分离，实现真正的组件封装。",
                keyPoints: [
                    "DOM结构封装和隔离",
                    "样式封装，避免冲突",
                    "提供真正的组件边界",
                    "性能优化（局部重绘）",
                    "两种模式：open和closed",
                    "Shadow Root是Shadow Tree的根节点"
                ]
            }
        },
        {
            type: "code-example",
            title: "创建Shadow DOM",
            content: {
                description: "attachShadow()方法创建Shadow DOM。",
                examples: [
                    {
                        title: "基本用法",
                        code: `<div id="host"></div>

<script>
const host = document.getElementById('host');

// 创建Shadow DOM（open模式）
const shadowRoot = host.attachShadow({ mode: 'open' });

// 向Shadow DOM添加内容
shadowRoot.innerHTML = \`
    <style>
        p { color: blue; }
    </style>
    <p>这是Shadow DOM中的内容</p>
\`;

// open模式：可以访问shadowRoot
console.log(host.shadowRoot); // Shadow Root对象

// closed模式
const closedHost = document.createElement('div');
const closedShadow = closedHost.attachShadow({ mode: 'closed' });
console.log(closedHost.shadowRoot); // null
</script>

<!-- 外部样式不影响Shadow DOM -->
<style>
    p { color: red !important; } /* 不会影响Shadow DOM中的p */
</style>`,
                        notes: "open模式可访问shadowRoot，closed不可访问"
                    },
                    {
                        title: "mode对比",
                        code: `<script>
// Open模式（推荐）
class OpenComponent extends HTMLElement {
    constructor() {
        super();
        // 外部可以访问shadowRoot
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '<p>Open Shadow DOM</p>';
    }
}

// Closed模式
class ClosedComponent extends HTMLElement {
    constructor() {
        super();
        // 保存shadowRoot引用（否则无法访问）
        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        this._shadowRoot.innerHTML = '<p>Closed Shadow DOM</p>';
    }
    
    // 提供方法访问内部元素
    getText() {
        return this._shadowRoot.querySelector('p').textContent;
    }
}

customElements.define('open-component', OpenComponent);
customElements.define('closed-component', ClosedComponent);

// 使用
const open = document.querySelector('open-component');
console.log(open.shadowRoot); // Shadow Root对象

const closed = document.querySelector('closed-component');
console.log(closed.shadowRoot); // null
console.log(closed.getText()); // 通过方法访问
</script>

<!-- 
mode选择建议：
- open: 大多数情况（推荐）
- closed: 需要严格封装（少用）
-->`,
                        notes: "推荐使用open模式"
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
                        code: `<!-- 全局样式 -->
<style>
    p { color: red; font-size: 20px; }
    .title { color: green; }
</style>

<p>外部段落（红色，20px）</p>
<p class="title">外部标题（绿色）</p>

<div id="host"></div>

<script>
const host = document.getElementById('host');
const shadow = host.attachShadow({ mode: 'open' });

shadow.innerHTML = \`
    <style>
        /* Shadow DOM内的样式 */
        p {
            color: blue;
            font-size: 14px;
        }
        .title {
            color: purple;
        }
    </style>
    
    <p>Shadow DOM段落（蓝色，14px）</p>
    <p class="title">Shadow DOM标题（紫色）</p>
\`;

// 结果：
// 1. 外部样式不影响Shadow DOM
// 2. Shadow DOM样式不影响外部
// 3. 完全隔离
</script>`,
                        notes: "样式完全隔离，互不影响"
                    },
                    {
                        title: ":host选择器",
                        code: `<script>
class StyledComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                /* :host 选择宿主元素 */
                :host {
                    display: block;
                    padding: 16px;
                    border: 2px solid #ddd;
                }
                
                /* :host(.class) 条件选择 */
                :host(.primary) {
                    border-color: blue;
                    background: #e3f2fd;
                }
                
                :host(.danger) {
                    border-color: red;
                    background: #ffebee;
                }
                
                /* :host([attr]) 属性选择 */
                :host([disabled]) {
                    opacity: 0.5;
                    pointer-events: none;
                }
                
                /* :host-context() 根据祖先 */
                :host-context(.dark-theme) {
                    background: #333;
                    color: white;
                    border-color: #555;
                }
                
                p { margin: 0; }
            </style>
            
            <p><slot></slot></p>
        \`;
    }
}

customElements.define('styled-component', StyledComponent);
</script>

<!-- 使用 -->
<styled-component>默认样式</styled-component>
<styled-component class="primary">主要样式</styled-component>
<styled-component class="danger">危险样式</styled-component>
<styled-component disabled>禁用状态</styled-component>

<div class="dark-theme">
    <styled-component>深色主题</styled-component>
</div>`,
                        notes: ":host选择器提供灵活的样式控制"
                    },
                    {
                        title: "::slotted选择器",
                        code: `<script>
class SlottedStyles extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                /* ::slotted() 选择插槽内容 */
                ::slotted(*) {
                    font-family: monospace;
                }
                
                ::slotted(p) {
                    color: blue;
                    margin: 8px 0;
                }
                
                ::slotted(.highlight) {
                    background: yellow;
                    padding: 4px;
                }
                
                /* 注意：只能选择直接子元素 */
                /* ::slotted(p span) 不工作 */
            </style>
            
            <div class="container">
                <slot></slot>
            </div>
        \`;
    }
}

customElements.define('slotted-styles', SlottedStyles);
</script>

<!-- 使用 -->
<slotted-styles>
    <p>段落（蓝色）</p>
    <p class="highlight">高亮段落</p>
    <span>Span元素（等宽字体）</span>
</slotted-styles>`,
                        notes: "::slotted只能选择slot的直接子元素"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "CSS变量穿透",
            content: {
                description: "CSS变量可以穿透Shadow DOM边界。",
                examples: [
                    {
                        title: "使用CSS变量",
                        code: `<script>
class ThemedBox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    /* 使用外部定义的CSS变量 */
                    --box-bg: var(--theme-bg, white);
                    --box-color: var(--theme-color, black);
                    --box-border: var(--theme-border, #ddd);
                    
                    display: block;
                    padding: 16px;
                    background: var(--box-bg);
                    color: var(--box-color);
                    border: 2px solid var(--box-border);
                    border-radius: 8px;
                }
            </style>
            
            <slot></slot>
        \`;
    }
}

customElements.define('themed-box', ThemedBox);
</script>

<!-- 外部定义主题 -->
<style>
    .blue-theme {
        --theme-bg: #e3f2fd;
        --theme-color: #1976d2;
        --theme-border: #2196f3;
    }
    
    .green-theme {
        --theme-bg: #e8f5e9;
        --theme-color: #388e3c;
        --theme-border: #4caf50;
    }
</style>

<!-- 使用 -->
<themed-box>默认主题</themed-box>

<div class="blue-theme">
    <themed-box>蓝色主题</themed-box>
</div>

<div class="green-theme">
    <themed-box>绿色主题</themed-box>
</div>

<!-- 直接设置CSS变量 -->
<themed-box style="--theme-bg: #fff3e0; --theme-color: #f57c00;">
    橙色主题
</themed-box>`,
                        notes: "CSS变量是实现主题化的最佳方式"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "事件处理",
            content: {
                description: "理解Shadow DOM中的事件传播。",
                examples: [
                    {
                        title: "事件重定向",
                        code: `<script>
class EventComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                button { padding: 10px 20px; }
            </style>
            <button id="inner">点击我</button>
        \`;
        
        // Shadow DOM内部监听
        this.shadowRoot.getElementById('inner').addEventListener('click', (e) => {
            console.log('内部监听:');
            console.log('  target:', e.target); // button
            console.log('  currentTarget:', e.currentTarget); // button
        });
    }
}

customElements.define('event-component', EventComponent);
</script>

<event-component id="host"></event-component>

<script>
// 外部监听
document.getElementById('host').addEventListener('click', (e) => {
    console.log('外部监听:');
    console.log('  target:', e.target); // event-component（重定向）
    console.log('  currentTarget:', e.currentTarget); // event-component
    console.log('  composed:', e.composed); // true（可穿透）
    console.log('  composedPath:', e.composedPath()); // 完整路径
});

// 结果：
// 1. 事件会冒泡到外部
// 2. target被重定向为宿主元素
// 3. composedPath()显示真实路径
</script>`,
                        notes: "事件target会被重定向为宿主元素"
                    },
                    {
                        title: "自定义事件穿透",
                        code: `<script>
class CustomEventComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <button id="btn">触发事件</button>
        \`;
        
        this.shadowRoot.getElementById('btn').addEventListener('click', () => {
            // composed: true 允许穿透Shadow DOM
            this.dispatchEvent(new CustomEvent('custom-click', {
                detail: { message: '自定义数据' },
                bubbles: true,
                composed: true // 必须设置为true
            }));
        });
    }
}

customElements.define('custom-event-component', CustomEventComponent);
</script>

<custom-event-component id="comp"></custom-event-component>

<script>
document.getElementById('comp').addEventListener('custom-click', (e) => {
    console.log('接收到自定义事件:', e.detail);
});

// composed: false 的事件不会穿透
// composed: true 的事件可以穿透
</script>`,
                        notes: "自定义事件需要composed:true才能穿透"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "Shadow DOM最佳实践",
            content: {
                description: "正确使用Shadow DOM：",
                practices: [
                    {
                        title: "选择合适的mode",
                        description: "大多数情况使用open。",
                        example: `// ✅ 推荐：open模式
this.attachShadow({ mode: 'open' });

// ⚠️ 谨慎使用：closed模式
this.attachShadow({ mode: 'closed' });`
                    },
                    {
                        title: "使用CSS变量",
                        description: "通过CSS变量实现主题化。",
                        example: `:host {
    background: var(--component-bg, white);
    color: var(--component-color, black);
}`
                    },
                    {
                        title: "事件composed",
                        description: "自定义事件需要穿透时设置composed。",
                        example: `this.dispatchEvent(new CustomEvent('change', {
    bubbles: true,
    composed: true
}));`
                    },
                    {
                        title: "样式组织",
                        description: "将样式和模板分离。",
                        example: `const styles = \`
    :host { /* ... */ }
\`;

const template = \`
    <style>\${styles}</style>
    <div>...</div>
\`;`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "Shadow DOM检查清单",
            content: {
                description: "确保Shadow DOM正确使用：",
                items: [
                    { id: "check29-1", text: "使用open模式（除非有特殊需求）" },
                    { id: "check29-2", text: "正确使用:host选择器" },
                    { id: "check29-3", text: "使用::slotted样式化插槽内容" },
                    { id: "check29-4", text: "提供CSS变量支持主题化" },
                    { id: "check29-5", text: "自定义事件设置composed:true" },
                    { id: "check29-6", text: "理解事件重定向机制" },
                    { id: "check29-7", text: "避免过度封装" },
                    { id: "check29-8", text: "测试样式隔离" },
                    { id: "check29-9", text: "考虑可访问性" },
                    { id: "check29-10", text: "提供足够的样式钩子" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "Web Components", url: "content.html?chapter=28" },
        next: { title: "Custom Elements", url: "content.html?chapter=30" }
    }
};
