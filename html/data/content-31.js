// 第31章：HTML Templates - 内容数据
window.htmlContentData_31 = {
    section: {
        title: "HTML Templates",
        icon: "📋"
    },
    topics: [
        {
            type: "concept",
            title: "Template元素概述",
            content: {
                description: "<template>元素用于声明可复用的HTML片段，内容不会立即渲染，可以被JavaScript克隆和使用。是Web Components的重要组成部分。",
                keyPoints: [
                    "内容不会立即渲染",
                    "可以包含任何HTML",
                    "可以被多次克隆使用",
                    "内容存储在DocumentFragment中",
                    "提升性能（避免重复创建）",
                    "与slot配合实现内容分发"
                ]
            }
        },
        {
            type: "code-example",
            title: "基本使用",
            content: {
                description: "使用template元素创建可复用的HTML结构。",
                examples: [
                    {
                        title: "简单template",
                        code: `<!-- 定义template -->
<template id="card-template">
    <style>
        .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin: 8px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .card-content {
            color: #666;
        }
    </style>
    
    <div class="card">
        <div class="card-title"></div>
        <div class="card-content"></div>
    </div>
</template>

<div id="container"></div>

<script>
// 获取template
const template = document.getElementById('card-template');

// 克隆template内容
const clone = template.content.cloneNode(true);

// 填充数据
clone.querySelector('.card-title').textContent = '卡片标题';
clone.querySelector('.card-content').textContent = '卡片内容';

// 添加到文档
document.getElementById('container').appendChild(clone);

// 可以多次克隆使用
const data = [
    { title: '卡片1', content: '内容1' },
    { title: '卡片2', content: '内容2' },
    { title: '卡片3', content: '内容3' }
];

data.forEach(item => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.card-title').textContent = item.title;
    clone.querySelector('.card-content').textContent = item.content;
    document.getElementById('container').appendChild(clone);
});
</script>`,
                        notes: "template内容不会立即渲染"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "与Web Components结合",
            content: {
                description: "template在Web Components中的应用。",
                examples: [
                    {
                        title: "使用template定义组件结构",
                        code: `<!-- 组件template -->
<template id="user-profile-template">
    <style>
        :host {
            display: block;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            max-width: 400px;
        }
        .profile {
            display: flex;
            gap: 16px;
            align-items: center;
        }
        .avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
        }
        .info {
            flex: 1;
        }
        .name {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 4px;
        }
        .bio {
            color: #666;
            margin: 0;
        }
    </style>
    
    <div class="profile">
        <img class="avatar" alt="用户头像">
        <div class="info">
            <h3 class="name"></h3>
            <p class="bio"></p>
        </div>
    </div>
</template>

<script>
class UserProfile extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // 使用template
        const template = document.getElementById('user-profile-template');
        const content = template.content.cloneNode(true);
        this.shadowRoot.appendChild(content);
    }
    
    connectedCallback() {
        this.updateProfile();
    }
    
    static get observedAttributes() {
        return ['name', 'bio', 'avatar'];
    }
    
    attributeChangedCallback() {
        this.updateProfile();
    }
    
    updateProfile() {
        const name = this.getAttribute('name') || '';
        const bio = this.getAttribute('bio') || '';
        const avatar = this.getAttribute('avatar') || '/default-avatar.jpg';
        
        this.shadowRoot.querySelector('.name').textContent = name;
        this.shadowRoot.querySelector('.bio').textContent = bio;
        this.shadowRoot.querySelector('.avatar').src = avatar;
    }
}

customElements.define('user-profile', UserProfile);
</script>

<!-- 使用 -->
<user-profile 
    name="张三"
    bio="前端开发工程师"
    avatar="/images/avatar.jpg">
</user-profile>`,
                        notes: "template提供可复用的组件结构"
                    },
                    {
                        title: "内联template",
                        code: `<script>
class InlineTemplateComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // 创建内联template
        const template = document.createElement('template');
        template.innerHTML = \`
            <style>
                :host {
                    display: block;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 4px;
                }
                h2 {
                    margin: 0 0 8px;
                    color: #333;
                }
                p {
                    margin: 0;
                    color: #666;
                }
            </style>
            
            <h2><slot name="title">默认标题</slot></h2>
            <p><slot>默认内容</slot></p>
        \`;
        
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('inline-template-component', InlineTemplateComponent);
</script>

<!-- 使用 -->
<inline-template-component>
    <span slot="title">自定义标题</span>
    自定义内容
</inline-template-component>`,
                        notes: "可以在JavaScript中创建template"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "Template与列表渲染",
            content: {
                description: "使用template高效渲染列表。",
                examples: [
                    {
                        title: "列表渲染",
                        code: `<!-- 列表项template -->
<template id="todo-item-template">
    <style>
        .todo-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        .todo-item:hover {
            background: #f5f5f5;
        }
        .checkbox {
            margin-right: 12px;
        }
        .text {
            flex: 1;
        }
        .text.completed {
            text-decoration: line-through;
            color: #999;
        }
        .delete-btn {
            padding: 4px 8px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
    
    <div class="todo-item">
        <input type="checkbox" class="checkbox">
        <span class="text"></span>
        <button class="delete-btn">删除</button>
    </div>
</template>

<div id="todo-list"></div>

<script>
class TodoList {
    constructor(containerId, templateId) {
        this.container = document.getElementById(containerId);
        this.template = document.getElementById(templateId);
        this.todos = [];
    }
    
    addTodo(text) {
        const todo = { id: Date.now(), text, completed: false };
        this.todos.push(todo);
        this.renderTodo(todo);
    }
    
    renderTodo(todo) {
        const clone = this.template.content.cloneNode(true);
        const item = clone.querySelector('.todo-item');
        const checkbox = clone.querySelector('.checkbox');
        const text = clone.querySelector('.text');
        const deleteBtn = clone.querySelector('.delete-btn');
        
        item.dataset.id = todo.id;
        checkbox.checked = todo.completed;
        text.textContent = todo.text;
        text.classList.toggle('completed', todo.completed);
        
        checkbox.addEventListener('change', () => {
            todo.completed = checkbox.checked;
            text.classList.toggle('completed', checkbox.checked);
        });
        
        deleteBtn.addEventListener('click', () => {
            this.deleteTodo(todo.id);
        });
        
        this.container.appendChild(clone);
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        const item = this.container.querySelector(\`[data-id="\${id}"]\`);
        item?.remove();
    }
    
    render() {
        this.container.innerHTML = '';
        this.todos.forEach(todo => this.renderTodo(todo));
    }
}

const todoList = new TodoList('todo-list', 'todo-item-template');
todoList.addTodo('学习Web Components');
todoList.addTodo('学习Template元素');
todoList.addTodo('实践项目');
</script>`,
                        notes: "template提高列表渲染性能"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "Template性能优化",
            content: {
                description: "使用template优化性能。",
                examples: [
                    {
                        title: "批量渲染",
                        code: `<template id="item-template">
    <div class="item">
        <img class="thumbnail">
        <div class="details">
            <h3 class="title"></h3>
            <p class="description"></p>
        </div>
    </div>
</template>

<div id="container"></div>

<script>
// ❌ 低效：逐个添加
function renderItemsSlow(items) {
    const template = document.getElementById('item-template');
    const container = document.getElementById('container');
    
    items.forEach(item => {
        const clone = template.content.cloneNode(true);
        // ... 填充数据
        container.appendChild(clone); // 每次都触发重排
    });
}

// ✅ 高效：使用DocumentFragment批量添加
function renderItemsFast(items) {
    const template = document.getElementById('item-template');
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.thumbnail').src = item.image;
        clone.querySelector('.title').textContent = item.title;
        clone.querySelector('.description').textContent = item.description;
        
        fragment.appendChild(clone);
    });
    
    // 一次性添加，只触发一次重排
    document.getElementById('container').appendChild(fragment);
}

// 模拟数据
const items = Array.from({ length: 100 }, (_, i) => ({
    image: \`/images/\${i}.jpg\`,
    title: \`项目 \${i + 1}\`,
    description: \`描述 \${i + 1}\`
}));

renderItemsFast(items);
</script>`,
                        notes: "使用DocumentFragment批量添加"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "Template最佳实践",
            content: {
                description: "正确使用Template：",
                practices: [
                    {
                        title: "复用template",
                        description: "同一结构使用同一template。",
                        example: `// ✅ 复用
const template = document.getElementById('my-template');
items.forEach(item => {
    const clone = template.content.cloneNode(true);
    // ...
});`
                    },
                    {
                        title: "深克隆",
                        description: "使用cloneNode(true)深克隆。",
                        example: `// ✅ 深克隆
const clone = template.content.cloneNode(true);

// ❌ 浅克隆
const clone = template.content.cloneNode();`
                    },
                    {
                        title: "批量操作",
                        description: "使用DocumentFragment批量添加。",
                        example: `const fragment = document.createDocumentFragment();
items.forEach(item => {
    const clone = template.content.cloneNode(true);
    fragment.appendChild(clone);
});
container.appendChild(fragment);`
                    },
                    {
                        title: "组织template",
                        description: "将template组织在文档顶部或专门文件。",
                        example: `<!-- templates.html -->
<template id="user-card">...</template>
<template id="product-card">...</template>
<template id="comment-item">...</template>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "Template检查清单",
            content: {
                description: "确保Template正确使用：",
                items: [
                    { id: "check31-1", text: "template有唯一ID" },
                    { id: "check31-2", text: "使用cloneNode(true)深克隆" },
                    { id: "check31-3", text: "批量操作使用DocumentFragment" },
                    { id: "check31-4", text: "template包含完整的样式和结构" },
                    { id: "check31-5", text: "避免在template中使用ID" },
                    { id: "check31-6", text: "复用template提高性能" },
                    { id: "check31-7", text: "正确组织template位置" },
                    { id: "check31-8", text: "考虑template的可维护性" },
                    { id: "check31-9", text: "测试template克隆性能" },
                    { id: "check31-10", text: "提供template文档" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "Custom Elements", url: "content.html?chapter=30" },
        next: { title: "Slots与组合", url: "content.html?chapter=32" }
    }
};
