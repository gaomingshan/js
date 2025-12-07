// 第32章：Slots与组合 - 内容数据
window.htmlContentData_32 = {
    section: {
        title: "Slots与组合",
        icon: "🎰"
    },
    topics: [
        {
            type: "concept",
            title: "Slots概述",
            content: {
                description: "Slot（插槽）是Web Components的内容分发机制，允许在组件中插入外部内容。类似于Vue和React的插槽/children概念，但是浏览器原生支持。",
                keyPoints: [
                    "实现内容分发",
                    "组件更加灵活可复用",
                    "支持默认内容",
                    "支持命名插槽",
                    "可以监听slotchange事件",
                    "Light DOM和Shadow DOM的桥梁"
                ]
            }
        },
        {
            type: "code-example",
            title: "基本Slot使用",
            content: {
                description: "理解slot的基本用法。",
                examples: [
                    {
                        title: "默认slot",
                        code: `<script>
class SimpleCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    display: block;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 16px;
                    background: white;
                }
                .card-content {
                    color: #333;
                }
            </style>
            
            <div class="card-content">
                <!-- 默认slot -->
                <slot>默认内容（没有插入内容时显示）</slot>
            </div>
        \`;
    }
}

customElements.define('simple-card', SimpleCard);
</script>

<!-- 使用：没有内容 -->
<simple-card></simple-card>
<!-- 显示：默认内容（没有插入内容时显示） -->

<!-- 使用：插入内容 -->
<simple-card>
    <p>这是插入的内容</p>
    <button>点击按钮</button>
</simple-card>
<!-- 显示：插入的内容和按钮 -->`,
                        notes: "slot提供默认内容，可被覆盖"
                    },
                    {
                        title: "命名slot",
                        code: `<script>
class UserCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    display: block;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background: #f5f5f5;
                    padding: 16px;
                    border-bottom: 1px solid #ddd;
                }
                .body {
                    padding: 16px;
                }
                .footer {
                    background: #fafafa;
                    padding: 12px 16px;
                    border-top: 1px solid #ddd;
                    text-align: right;
                }
            </style>
            
            <div class="header">
                <slot name="header">默认标题</slot>
            </div>
            <div class="body">
                <slot>默认内容</slot>
            </div>
            <div class="footer">
                <slot name="footer">默认页脚</slot>
            </div>
        \`;
    }
}

customElements.define('user-card', UserCard);
</script>

<!-- 使用命名slot -->
<user-card>
    <!-- 使用slot属性指定插槽 -->
    <h3 slot="header">张三的资料</h3>
    
    <!-- 没有slot属性的内容进入默认slot -->
    <p>职位：前端开发工程师</p>
    <p>邮箱：zhangsan@example.com</p>
    
    <div slot="footer">
        <button>编辑</button>
        <button>删除</button>
    </div>
</user-card>`,
                        notes: "命名slot实现精确的内容分发"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "Slot样式化",
            content: {
                description: "使用::slotted选择器样式化slot内容。",
                examples: [
                    {
                        title: "::slotted选择器",
                        code: `<script>
class StyledList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                :host {
                    display: block;
                    padding: 16px;
                    background: #f9f9f9;
                }
                
                /* ::slotted选择slot中的元素 */
                ::slotted(*) {
                    margin: 8px 0;
                }
                
                ::slotted(li) {
                    list-style: none;
                    padding: 12px;
                    background: white;
                    border-radius: 4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                
                ::slotted(li:hover) {
                    background: #f5f5f5;
                }
                
                ::slotted(.highlight) {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                }
                
                /* 注意：不能选择嵌套元素 */
                /* ::slotted(li span) 不工作 */
            </style>
            
            <ul>
                <slot></slot>
            </ul>
        \`;
    }
}

customElements.define('styled-list', StyledList);
</script>

<!-- 使用 -->
<styled-list>
    <li>普通项目1</li>
    <li>普通项目2</li>
    <li class="highlight">高亮项目</li>
    <li>普通项目3</li>
</styled-list>`,
                        notes: "::slotted只能选择slot的直接子元素"
                    },
                    {
                        title: "全局样式 vs Slot样式",
                        code: `<!-- 全局样式 -->
<style>
    /* 这会影响Light DOM中的元素 */
    styled-list li {
        color: blue;
    }
</style>

<script>
class StyledList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                /* 这会影响slot中的元素 */
                ::slotted(li) {
                    background: yellow;
                }
            </style>
            
            <slot></slot>
        \`;
    }
}

customElements.define('styled-list', StyledList);
</script>

<styled-list>
    <li>这个元素同时受到全局样式和::slotted样式的影响</li>
    <li>颜色来自全局样式（蓝色），背景来自::slotted（黄色）</li>
</styled-list>

<!-- 
样式优先级：
1. 全局样式 > ::slotted样式
2. 内联样式 > 全局样式
-->`,
                        notes: "全局样式优先级高于::slotted"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "Slot事件和API",
            content: {
                description: "使用slotchange事件和Slot API。",
                examples: [
                    {
                        title: "slotchange事件",
                        code: `<script>
class DynamicSlot extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                .info { color: #666; margin-bottom: 8px; }
            </style>
            
            <div class="info">插槽内容数量：<span id="count">0</span></div>
            <slot id="mySlot"></slot>
        \`;
        
        // 监听slot变化
        const slot = this.shadowRoot.getElementById('mySlot');
        slot.addEventListener('slotchange', (e) => {
            console.log('Slot内容变化');
            this.updateCount();
        });
    }
    
    connectedCallback() {
        this.updateCount();
    }
    
    updateCount() {
        const slot = this.shadowRoot.getElementById('mySlot');
        const nodes = slot.assignedNodes();
        const elements = slot.assignedElements();
        
        console.log('分配的节点:', nodes);
        console.log('分配的元素:', elements);
        
        this.shadowRoot.getElementById('count').textContent = elements.length;
    }
}

customElements.define('dynamic-slot', DynamicSlot);
</script>

<dynamic-slot id="container">
    <p>段落1</p>
    <p>段落2</p>
</dynamic-slot>

<script>
const container = document.getElementById('container');

// 动态添加内容（触发slotchange）
setTimeout(() => {
    const p = document.createElement('p');
    p.textContent = '段落3';
    container.appendChild(p);
}, 2000);

// 动态移除内容（触发slotchange）
setTimeout(() => {
    container.firstElementChild.remove();
}, 4000);
</script>`,
                        notes: "slotchange事件在slot内容变化时触发"
                    },
                    {
                        title: "Slot API",
                        code: `<script>
class SlotAPI extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <slot name="header"></slot>
            <slot></slot>
            <slot name="footer"></slot>
        \`;
    }
    
    connectedCallback() {
        // 获取所有slot
        const slots = this.shadowRoot.querySelectorAll('slot');
        
        slots.forEach(slot => {
            // assignedNodes() - 获取分配的所有节点（包括文本节点）
            const nodes = slot.assignedNodes();
            console.log('Nodes:', nodes);
            
            // assignedNodes({ flatten: true }) - 包括嵌套slot
            const flattenNodes = slot.assignedNodes({ flatten: true });
            
            // assignedElements() - 只获取元素节点
            const elements = slot.assignedElements();
            console.log('Elements:', elements);
            
            // name属性
            console.log('Slot name:', slot.name || '(default)');
        });
    }
    
    // 公共方法：获取slot内容
    getSlotContent(slotName = '') {
        const selector = slotName ? \`slot[name="\${slotName}"]\` : 'slot:not([name])';
        const slot = this.shadowRoot.querySelector(selector);
        return slot ? slot.assignedElements() : [];
    }
}

customElements.define('slot-api', SlotAPI);
</script>

<slot-api id="demo">
    <h1 slot="header">标题</h1>
    <p>内容段落1</p>
    <p>内容段落2</p>
    <div slot="footer">页脚</div>
</slot-api>

<script>
const demo = document.getElementById('demo');

// 使用公共方法
console.log('Header:', demo.getSlotContent('header'));
console.log('Default:', demo.getSlotContent());
console.log('Footer:', demo.getSlotContent('footer'));
</script>`,
                        notes: "Slot API提供访问slot内容的方法"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "复杂组合模式",
            content: {
                description: "实现复杂的组件组合。",
                examples: [
                    {
                        title: "多级slot组合",
                        code: `<!-- 布局组件 -->
<script>
class AppLayout extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                :host { display: flex; flex-direction: column; min-height: 100vh; }
                header { background: #333; color: white; padding: 16px; }
                main { flex: 1; padding: 16px; }
                aside { width: 250px; background: #f5f5f5; padding: 16px; }
                footer { background: #333; color: white; padding: 16px; text-align: center; }
                .content-wrapper { display: flex; flex: 1; }
            </style>
            
            <header><slot name="header"></slot></header>
            <div class="content-wrapper">
                <main><slot></slot></main>
                <aside><slot name="sidebar"></slot></aside>
            </div>
            <footer><slot name="footer"></slot></footer>
        \`;
    }
}

customElements.define('app-layout', AppLayout);

// 卡片组件
class CardComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.shadowRoot.innerHTML = \`
            <style>
                :host { display: block; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 16px; }
                .card-header { padding: 16px; background: #f9f9f9; border-bottom: 1px solid #ddd; }
                .card-body { padding: 16px; }
                .card-footer { padding: 12px 16px; background: #fafafa; border-top: 1px solid #ddd; }
            </style>
            
            <div class="card-header"><slot name="header"></slot></div>
            <div class="card-body"><slot></slot></div>
            <div class="card-footer"><slot name="footer"></slot></div>
        \`;
    }
}

customElements.define('card-component', CardComponent);
</script>

<!-- 使用：组合多个组件 -->
<app-layout>
    <h1 slot="header">我的应用</h1>
    
    <!-- 主内容区 -->
    <card-component>
        <h2 slot="header">文章标题</h2>
        <p>文章内容...</p>
        <div slot="footer">
            <button>编辑</button>
            <button>删除</button>
        </div>
    </card-component>
    
    <card-component>
        <h2 slot="header">另一篇文章</h2>
        <p>更多内容...</p>
    </card-component>
    
    <!-- 侧边栏 -->
    <nav slot="sidebar">
        <h3>导航</h3>
        <ul>
            <li><a href="/">首页</a></li>
            <li><a href="/about">关于</a></li>
        </ul>
    </nav>
    
    <p slot="footer">&copy; 2024 我的应用</p>
</app-layout>`,
                        notes: "slot支持复杂的组件嵌套和组合"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "Slots最佳实践",
            content: {
                description: "正确使用Slots：",
                practices: [
                    {
                        title: "提供默认内容",
                        description: "为slot提供有意义的默认内容。",
                        example: `<slot name="title">
    <h2>默认标题</h2>
</slot>

<slot>
    <p>暂无内容</p>
</slot>`
                    },
                    {
                        title: "语义化命名",
                        description: "使用清晰的slot名称。",
                        example: `// ✅ 好的命名
<slot name="header"></slot>
<slot name="footer"></slot>
<slot name="sidebar"></slot>

// ❌ 不好的命名
<slot name="slot1"></slot>
<slot name="content"></slot>`
                    },
                    {
                        title: "监听变化",
                        description: "使用slotchange事件响应内容变化。",
                        example: `const slot = this.shadowRoot.querySelector('slot');
slot.addEventListener('slotchange', () => {
    this.updateLayout();
});`
                    },
                    {
                        title: "提供fallback",
                        description: "为空slot提供友好的回退内容。",
                        example: `<slot name="items">
    <div class="empty-state">
        <p>暂无数据</p>
    </div>
</slot>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "Slots检查清单",
            content: {
                description: "确保Slots正确使用：",
                items: [
                    { id: "check32-1", text: "为slot提供默认内容" },
                    { id: "check32-2", text: "使用语义化的slot名称" },
                    { id: "check32-3", text: "使用::slotted样式化" },
                    { id: "check32-4", text: "监听slotchange事件" },
                    { id: "check32-5", text: "提供获取slot内容的API" },
                    { id: "check32-6", text: "考虑slot的可访问性" },
                    { id: "check32-7", text: "测试没有内容时的显示" },
                    { id: "check32-8", text: "文档化所有slot" },
                    { id: "check32-9", text: "避免过多的嵌套slot" },
                    { id: "check32-10", text: "提供slot使用示例" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "HTML Templates", url: "content.html?chapter=31" },
        next: { title: "HTML最佳实践", url: "content.html?chapter=33" }
    }
};
