/**
 * CSS内容渲染引擎
 * 负责根据JSON数据动态渲染学习内容
 */
const ContentRenderer = {
    data: null,

    /**
     * 初始化渲染器
     * @param {Object} sectionData - 章节数据对象
     */
    init(sectionData) {
        try {
            if (!sectionData) {
                throw new Error('章节数据为空');
            }
            
            this.data = sectionData;
            this.render();
            this.attachDemoListeners();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('加载内容失败，请刷新页面重试');
        }
    },

    /**
     * 渲染整个页面
     */
    render() {
        const { section } = this.data;
        
        // 设置页面标题
        document.title = section.title + ' - CSS 学习';
        document.getElementById('section-title').textContent = section.icon + ' ' + section.title;
        
        // 渲染主题内容
        const container = document.getElementById('content-container');
        container.innerHTML = section.topics.map(topic => this.renderTopic(topic)).join('');
        
        // 渲染导航
        if (this.data.navigation) {
            this.renderNavigation(this.data.navigation);
        }
    },

    /**
     * 渲染单个主题
     */
    renderTopic(topic) {
        const typeRenderers = {
            'concept': this.renderConcept.bind(this),
            'interactive-demo': this.renderDemo.bind(this),
            'comparison': this.renderComparison.bind(this),
            'principle': this.renderPrinciple.bind(this),
            'code-example': this.renderCodeExample.bind(this)
        };

        const renderer = typeRenderers[topic.type] || this.renderConcept.bind(this);
        return renderer(topic);
    },

    /**
     * 渲染概念解释型内容
     */
    renderConcept(topic) {
        const { content } = topic;
        return `
            <section class="topic-section" id="${topic.id}">
                <h2 class="topic-title">${topic.title}</h2>
                <div class="topic-content">
                    <p class="description">${content.description}</p>
                    ${content.keyPoints ? `
                        <div class="key-points">
                            <h3>🎯 核心要点</h3>
                            <ul>
                                ${content.keyPoints.map(point => `<li>${point}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${content.mdn ? `
                        <a href="${content.mdn}" target="_blank" class="mdn-link">
                            📖 查看 MDN 文档
                        </a>
                    ` : ''}
                </div>
            </section>
        `;
    },

    /**
     * 渲染交互演示型内容
     */
    renderDemo(topic) {
        const { content } = topic;
        const demoId = `demo-${topic.id}`;
        
        return `
            <section class="topic-section" id="${topic.id}">
                <h2 class="topic-title">${topic.title}</h2>
                <div class="topic-content">
                    <p class="description">${content.description}</p>
                    
                    <div class="live-demo">
                        <div class="demo-tabs">
                            <button class="tab-btn active" data-tab="preview">预览</button>
                            <button class="tab-btn" data-tab="html">HTML</button>
                            <button class="tab-btn" data-tab="css">CSS</button>
                            ${content.demo.js ? '<button class="tab-btn" data-tab="js">JavaScript</button>' : ''}
                        </div>
                        
                        <div class="demo-content">
                            <div class="tab-panel active" data-panel="preview">
                                <iframe class="demo-preview" id="${demoId}-preview"></iframe>
                            </div>
                            <div class="tab-panel" data-panel="html">
                                <textarea class="code-editor" data-lang="html" data-demo="${demoId}" ${content.demo.editable ? '' : 'readonly'}>${this.escapeHtml(content.demo.html)}</textarea>
                            </div>
                            <div class="tab-panel" data-panel="css">
                                <textarea class="code-editor" data-lang="css" data-demo="${demoId}" ${content.demo.editable ? '' : 'readonly'}>${this.escapeHtml(content.demo.css || '')}</textarea>
                            </div>
                            ${content.demo.js ? `
                                <div class="tab-panel" data-panel="js">
                                    <textarea class="code-editor" data-lang="js" data-demo="${demoId}" ${content.demo.editable ? '' : 'readonly'}>${this.escapeHtml(content.demo.js)}</textarea>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${content.demo.editable ? `
                            <button class="btn-run" data-demo="${demoId}">▶️ 运行代码</button>
                        ` : ''}
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * 渲染对比分析型内容
     */
    renderComparison(topic) {
        const { content } = topic;
        return `
            <section class="topic-section" id="${topic.id}">
                <h2 class="topic-title">${topic.title}</h2>
                <div class="topic-content">
                    ${content.description ? `<p class="description">${content.description}</p>` : ''}
                    
                    <div class="comparison-grid">
                        ${content.items.map(item => `
                            <div class="comparison-item">
                                <h3 class="item-title">${item.name}</h3>
                                ${item.code ? `<pre class="code-block"><code>${this.escapeHtml(item.code)}</code></pre>` : ''}
                                ${item.pros ? `
                                    <div class="pros">
                                        <h4>✅ 优点</h4>
                                        <ul>
                                            ${item.pros.map(pro => `<li>${pro}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                ${item.cons ? `
                                    <div class="cons">
                                        <h4>❌ 缺点</h4>
                                        <ul>
                                            ${item.cons.map(con => `<li>${con}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * 渲染原理解析型内容
     */
    renderPrinciple(topic) {
        const { content } = topic;
        return `
            <section class="topic-section" id="${topic.id}">
                <h2 class="topic-title">${topic.title}</h2>
                <div class="topic-content">
                    ${content.description ? `<p class="description">${content.description}</p>` : ''}
                    
                    ${content.mechanism ? `
                        <div class="mechanism">
                            <h3>⚙️ 工作机制</h3>
                            <p>${content.mechanism}</p>
                        </div>
                    ` : ''}
                    
                    ${content.steps ? `
                        <div class="steps">
                            <h3>📋 执行步骤</h3>
                            <ol>
                                ${content.steps.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </div>
                    ` : ''}
                    
                    ${content.diagram ? `
                        <div class="diagram">
                            <img src="${content.diagram}" alt="${topic.title}示意图">
                        </div>
                    ` : ''}
                    
                    ${content.code ? `
                        <pre class="code-block"><code>${this.escapeHtml(content.code)}</code></pre>
                    ` : ''}
                </div>
            </section>
        `;
    },

    /**
     * 渲染代码示例型内容
     */
    renderCodeExample(topic) {
        const { content } = topic;
        return `
            <section class="topic-section" id="${topic.id}">
                <h2 class="topic-title">${topic.title}</h2>
                <div class="topic-content">
                    ${content.description ? `<p class="description">${content.description}</p>` : ''}
                    
                    <div class="examples">
                        ${content.examples.map((example, index) => `
                            <div class="example-item">
                                <h3 class="example-title">${example.title || `示例 ${index + 1}`}</h3>
                                <pre class="code-block"><code>${this.escapeHtml(example.code)}</code></pre>
                                ${example.result ? `<p class="example-result">💡 ${example.result}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * 渲染导航链接
     */
    renderNavigation(navigation) {
        const navContainer = document.getElementById('nav-links');
        let html = '';
        
        if (navigation.prev) {
            html += `<a href="${navigation.prev.url}" class="nav-link prev">⬅️ 上一节：${navigation.prev.title}</a>`;
        }
        
        html += `<a href="index.html" class="nav-link home">📋 内容导航</a>`;
        
        if (navigation.next) {
            html += `<a href="${navigation.next.url}" class="nav-link next">下一节：${navigation.next.title} ➡️</a>`;
        }
        
        navContainer.innerHTML = html;
    },

    /**
     * 附加演示相关的事件监听器
     */
    attachDemoListeners() {
        // Tab切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.dataset.tab;
                const demoContainer = this.closest('.live-demo');
                
                // 切换按钮状态
                demoContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // 切换面板
                demoContainer.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                demoContainer.querySelector(`[data-panel="${tab}"]`).classList.add('active');
            });
        });

        // 运行代码
        document.querySelectorAll('.btn-run').forEach(btn => {
            btn.addEventListener('click', function() {
                const demoId = this.dataset.demo;
                ContentRenderer.runDemo(demoId);
            });
        });

        // 初始化所有demo的预览
        document.querySelectorAll('.demo-preview').forEach(iframe => {
            const demoId = iframe.id.replace('-preview', '');
            this.runDemo(demoId);
        });
    },

    /**
     * 运行演示代码
     */
    runDemo(demoId) {
        const htmlEditor = document.querySelector(`textarea[data-demo="${demoId}"][data-lang="html"]`);
        const cssEditor = document.querySelector(`textarea[data-demo="${demoId}"][data-lang="css"]`);
        const jsEditor = document.querySelector(`textarea[data-demo="${demoId}"][data-lang="js"]`);
        const iframe = document.getElementById(`${demoId}-preview`);

        if (!iframe) return;

        const html = htmlEditor ? htmlEditor.value : '';
        const css = cssEditor ? cssEditor.value : '';
        const js = jsEditor ? jsEditor.value : '';

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 20px; font-family: sans-serif; }
                    ${css}
                </style>
            </head>
            <body>
                ${html}
                <script>
                    try {
                        ${js}
                    } catch(e) {
                        document.body.innerHTML += '<div style="color:red;padding:10px;border:1px solid red;margin-top:10px;">错误：' + e.message + '</div>';
                    }
                </script>
            </body>
            </html>
        `;

        iframe.srcdoc = content;
    },

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 显示错误信息
     */
    showError(message) {
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #e53e3e;">
                <h3>❌ ${message}</h3>
            </div>
        `;
    }
};

// 全局访问
if (typeof window !== 'undefined') {
    window.ContentRenderer = ContentRenderer;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContentRenderer };
}
