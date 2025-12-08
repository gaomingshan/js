/**
 * 通用内容渲染器 V2
 * 支持 HTML/CSS/Vue/React 等多学科内容学习和面试题
 * 
 * @version 2.0.0
 * @author Windsurf Cascade
 */

class UniversalRendererV2 {
    constructor(config = {}) {
        this.config = {
            subject: config.subject || 'default',
            namespace: config.namespace || 'contentData',
            theme: config.theme || {},
            layout: config.layout || {},
            features: {
                codeRunner: config.features?.codeRunner !== false,
                livePreview: config.features?.livePreview !== false,
                copyCode: config.features?.copyCode !== false,
                syntaxHighlight: config.features?.syntaxHighlight !== false
            },
            customTypes: config.customTypes || {},
            hooks: config.hooks || {}
        };
        
        this.data = null;
        this.typeRegistry = new Map();
        this._initBuiltInTypes();
    }

    /**
     * 初始化渲染器
     */
    init(contentData) {
        this.data = contentData;
        this._callHook('beforeRender', contentData);
        this.render();
        this._callHook('afterRender', contentData);
    }

    /**
     * 主渲染方法
     */
    render() {
        const layout = this.data.section?.layout?.type;
        
        if (layout === 'sidebar') {
            this.renderSidebarLayout();
        } else {
            this.renderStandardLayout();
        }
    }

    /**
     * 标准布局渲染
     */
    renderStandardLayout() {
        this.renderTitle();
        this.renderContent();
        this.renderNavigation();
        this._initInteractive();
    }

    /**
     * 侧边栏布局渲染
     */
    renderSidebarLayout() {
        const container = document.querySelector('.container');
        container.classList.add('layout-sidebar');
        
        this.renderTitle();
        this.renderContent();
        this.renderSidebar();
        this.renderNavigation();
        this._initInteractive();
    }

    /**
     * 渲染标题
     */
    renderTitle() {
        const titleEl = document.getElementById('section-title');
        if (titleEl && this.data.section) {
            const icon = this.data.section.icon || '';
            const title = this.data.section.title || '';
            titleEl.textContent = `${icon} ${title}`;
        }
    }

    /**
     * 渲染内容
     */
    renderContent() {
        const container = document.getElementById('content-container');
        if (!container || !this.data.topics) return;

        let html = '';
        this.data.topics.forEach(topic => {
            html += this.renderTopic(topic);
        });

        container.innerHTML = html;
    }

    /**
     * 渲染单个topic
     */
    renderTopic(topic) {
        this._callHook('beforeTopicRender', topic);
        
        let renderer = this.typeRegistry.get(topic.type);
        
        if (!renderer && this.config.customTypes[topic.type]) {
            renderer = this.config.customTypes[topic.type].bind(this);
        }
        
        const html = renderer ? renderer(topic) : this.renderDefault(topic);
        
        this._callHook('afterTopicRender', topic, html);
        
        return html;
    }

    /**
     * 渲染侧边栏
     */
    renderSidebar() {
        if (!this.data.sidebar) return;
        
        const sidebar = this.data.sidebar;
        const container = document.querySelector('.container');
        
        const aside = document.createElement('aside');
        aside.className = this.data.section.layout?.sidebarSticky 
            ? 'sidebar-panel sidebar-sticky' 
            : 'sidebar-panel';
        
        let html = `
            <div class="sidebar-header">
                <h3>${sidebar.icon || '📋'} ${this.escape(sidebar.title)}</h3>
            </div>
            <div class="sidebar-examples">
        `;
        
        sidebar.examples.forEach((example, index) => {
            html += this.renderSidebarExample(example, index);
        });
        
        html += '</div>';
        aside.innerHTML = html;
        container.appendChild(aside);
    }

    /**
     * 渲染侧边栏示例
     */
    renderSidebarExample(example, index) {
        const id = `sidebar-ex-${index}`;
        
        return `
            <div class="example-card" data-example-id="${id}">
                <div class="example-header">
                    <h4>${this.escape(example.title)}</h4>
                    ${example.description ? `
                        <p class="example-desc">${this.escape(example.description)}</p>
                    ` : ''}
                </div>
                
                <div class="code-block dark-theme">
                    <pre><code class="language-${example.language || 'javascript'}">${this.escape(example.code)}</code></pre>
                </div>
                
                ${example.runnable ? `
                    <button class="btn-run" data-target="${id}">▶ 运行代码</button>
                    <div class="output-panel" id="${id}-output"></div>
                ` : ''}
            </div>
        `;
    }

    /**
     * 渲染导航
     */
    renderNavigation() {
        const navContainer = document.getElementById('nav-links');
        if (!navContainer || !this.data.navigation) return;

        const { prev, next } = this.data.navigation;
        let html = '<div class="navigation">';

        if (prev) {
            html += `
                <a href="${this.escape(prev.url)}" class="nav-button prev-button">
                    <span class="nav-arrow">←</span>
                    <span class="nav-text">
                        <span class="nav-label">上一章</span>
                        <span class="nav-title">${this.escape(prev.title)}</span>
                    </span>
                </a>
            `;
        } else {
            html += '<div></div>';
        }

        if (next) {
            html += `
                <a href="${this.escape(next.url)}" class="nav-button next-button">
                    <span class="nav-text">
                        <span class="nav-label">下一章</span>
                        <span class="nav-title">${this.escape(next.title)}</span>
                    </span>
                    <span class="nav-arrow">→</span>
                </a>
            `;
        }

        html += '</div>';
        navContainer.innerHTML = html;
    }

    /**
     * 注册内置类型
     */
    _initBuiltInTypes() {
        // 基础内容类型
        this.typeRegistry.set('concept', this.renderConcept.bind(this));
        this.typeRegistry.set('code-example', this.renderCodeExample.bind(this));
        this.typeRegistry.set('principle', this.renderPrinciple.bind(this));
        this.typeRegistry.set('comparison', this.renderComparison.bind(this));
        this.typeRegistry.set('best-practice', this.renderBestPractice.bind(this));
        this.typeRegistry.set('checklist', this.renderChecklist.bind(this));
        
        // 交互类型
        this.typeRegistry.set('live-code', this.renderLiveCode.bind(this));
        this.typeRegistry.set('playground', this.renderPlayground.bind(this));
        this.typeRegistry.set('split-view', this.renderSplitView.bind(this));
        this.typeRegistry.set('tab-content', this.renderTabContent.bind(this));
        
        // 可视化类型
        this.typeRegistry.set('visual-demo', this.renderVisualDemo.bind(this));
        this.typeRegistry.set('color-palette', this.renderColorPalette.bind(this));
        
        // 组件类型
        this.typeRegistry.set('component-demo', this.renderComponentDemo.bind(this));
        this.typeRegistry.set('props-table', this.renderPropsTable.bind(this));
        
        // 测验类型
        this.typeRegistry.set('quiz', this.renderQuiz.bind(this));
        this.typeRegistry.set('quiz-multi', this.renderQuizMulti.bind(this));
        this.typeRegistry.set('quiz-bool', this.renderQuizBool.bind(this));
        this.typeRegistry.set('quiz-code', this.renderQuizCode.bind(this));
    }

    // ==================== 内容类型渲染方法 ====================

    renderConcept(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section concept-section">
                <h2 class="topic-title">${this.escape(title)}</h2>
                <div class="concept-content">
                    <p class="description">${this.escape(content.description)}</p>
                    ${content.keyPoints ? `
                        <div class="key-points">
                            <h3>核心要点</h3>
                            <ul>
                                ${content.keyPoints.map(point => `<li>${this.escape(point)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${content.mdn ? `
                        <div class="mdn-link">
                            <a href="${this.escape(content.mdn)}" target="_blank" rel="noopener">📖 MDN文档</a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderCodeExample(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section code-section">
                <h2 class="topic-title">${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                ${content.examples.map(example => `
                    <div class="example-block">
                        <h3 class="example-title">${this.escape(example.title)}</h3>
                        <div class="code-block">
                            <pre><code>${this.escape(example.code)}</code></pre>
                        </div>
                        ${example.result ? `
                            <div class="result-box">
                                <strong>效果：</strong>${this.escape(example.result)}
                            </div>
                        ` : ''}
                        ${example.notes ? `
                            <div class="notes-box">
                                <strong>说明：</strong>${this.escape(example.notes)}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPrinciple(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section principle-section">
                <h2 class="topic-title">${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                ${content.mechanism ? `
                    <div class="mechanism-box">
                        <h3>工作机制</h3>
                        <p>${this.escape(content.mechanism)}</p>
                    </div>
                ` : ''}
                ${content.keyPoints ? `
                    <div class="key-points">
                        <h3>核心要点</h3>
                        <ul>
                            ${content.keyPoints.map(point => `<li>${this.escape(point)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderComparison(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section comparison-section">
                <h2 class="topic-title">${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                <div class="comparison-grid">
                    ${content.items.map(item => `
                        <div class="comparison-item">
                            <h3 class="item-name">${this.escape(item.name)}</h3>
                            ${item.pros ? `
                                <div class="pros">
                                    <h4>✅ 优势</h4>
                                    <ul>
                                        ${item.pros.map(pro => `<li>${this.escape(pro)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${item.cons ? `
                                <div class="cons">
                                    <h4>❌ 劣势</h4>
                                    <ul>
                                        ${item.cons.map(con => `<li>${this.escape(con)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderBestPractice(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section best-practice-section">
                <h2 class="topic-title">💡 ${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                ${content.practices ? `
                    <div class="practices-list">
                        ${content.practices.map((practice, index) => `
                            <div class="practice-item">
                                <h3>${index + 1}. ${this.escape(practice.title)}</h3>
                                <p>${this.escape(practice.description)}</p>
                                ${practice.example ? `
                                    <div class="code-block">
                                        <pre><code>${this.escape(practice.example)}</code></pre>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderChecklist(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section checklist-section">
                <h2 class="topic-title">✓ ${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                ${content.items ? `
                    <div class="checklist">
                        ${content.items.map(item => `
                            <div class="checklist-item">
                                <input type="checkbox" id="${this.escape(item.id || '')}">
                                <label for="${this.escape(item.id || '')}">${this.escape(item.text)}</label>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderLiveCode(topic) {
        const { title, content } = topic;
        const id = this._generateId();
        
        return `
            <div class="topic-section live-code-section" data-topic-id="${id}">
                <h2 class="topic-title">⚡ ${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                
                <div class="live-code-container">
                    <div class="code-editors">
                        ${content.html ? `
                            <div class="editor-panel">
                                <div class="editor-header">HTML</div>
                                <textarea class="code-editor" data-lang="html">${this.escape(content.html)}</textarea>
                            </div>
                        ` : ''}
                        ${content.css ? `
                            <div class="editor-panel">
                                <div class="editor-header">CSS</div>
                                <textarea class="code-editor" data-lang="css">${this.escape(content.css)}</textarea>
                            </div>
                        ` : ''}
                        ${content.js ? `
                            <div class="editor-panel">
                                <div class="editor-header">JavaScript</div>
                                <textarea class="code-editor" data-lang="js">${this.escape(content.js)}</textarea>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="preview-panel">
                        <div class="preview-header">
                            <span>预览</span>
                            <button class="btn-run" data-target="${id}">▶ 运行</button>
                        </div>
                        <iframe class="preview-frame" sandbox="allow-scripts"></iframe>
                    </div>
                </div>
            </div>
        `;
    }

    renderPlayground(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section playground-section">
                <h2 class="topic-title">🎮 ${this.escape(title)}</h2>
                <div class="playground-notice">
                    <p>集成代码编辑器 - 可扩展集成Monaco Editor或CodeMirror</p>
                </div>
            </div>
        `;
    }

    renderSplitView(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section split-view-section">
                <h2 class="topic-title">⚡ ${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                
                <div class="split-container">
                    <div class="split-pane">
                        <div class="pane-header">${this.escape(content.left.title)}</div>
                        <div class="pane-content">
                            ${content.left.code ? `
                                <pre><code>${this.escape(content.left.code)}</code></pre>
                            ` : content.left.html || ''}
                        </div>
                    </div>
                    
                    <div class="split-pane">
                        <div class="pane-header">${this.escape(content.right.title)}</div>
                        <div class="pane-content">
                            ${content.right.code ? `
                                <pre><code>${this.escape(content.right.code)}</code></pre>
                            ` : content.right.html || ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTabContent(topic) {
        const { title, content } = topic;
        const id = this._generateId();
        
        return `
            <div class="topic-section tab-section">
                <h2 class="topic-title">${this.escape(title)}</h2>
                
                <div class="tab-container" data-tab-group="${id}">
                    <div class="tab-headers">
                        ${content.tabs.map((tab, i) => `
                            <button class="tab-header ${i === 0 ? 'active' : ''}" data-tab="${id}-${i}">
                                ${tab.icon || ''} ${this.escape(tab.title)}
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="tab-contents">
                        ${content.tabs.map((tab, i) => `
                            <div class="tab-content ${i === 0 ? 'active' : ''}" data-tab="${id}-${i}">
                                ${tab.content || tab.html || ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderVisualDemo(topic) {
        const { title, content } = topic;
        const id = this._generateId();
        
        return `
            <div class="topic-section visual-demo-section">
                <h2 class="topic-title">🎨 ${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                
                <div class="visual-demo-wrapper">
                    ${content.controls ? `
                        <div class="demo-controls">
                            ${content.controls.map(control => this._renderControl(control, id)).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="demo-preview" id="demo-${id}">
                        ${content.demoHtml || ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderColorPalette(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section color-palette-section">
                <h2 class="topic-title">🎨 ${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                
                <div class="color-palette-grid">
                    ${content.colors.map(color => `
                        <div class="color-item" data-color="${color.value}">
                            <div class="color-swatch" style="background: ${color.value}"></div>
                            <div class="color-info">
                                <div class="color-name">${this.escape(color.name)}</div>
                                <code class="color-value">${this.escape(color.value)}</code>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderComponentDemo(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section component-demo-section">
                <h2 class="topic-title">🧩 ${this.escape(title)}</h2>
                <p class="description">${this.escape(content.description)}</p>
                
                ${content.preview ? `
                    <div class="component-preview">
                        ${content.preview}
                    </div>
                ` : ''}
                
                <div class="component-code">
                    <div class="code-tabs">
                        ${content.template ? '<button class="active" data-code="template">Template</button>' : ''}
                        ${content.script ? '<button data-code="script">Script</button>' : ''}
                        ${content.style ? '<button data-code="style">Style</button>' : ''}
                    </div>
                    
                    ${content.template ? `
                        <pre class="code-panel active" data-code="template"><code>${this.escape(content.template)}</code></pre>
                    ` : ''}
                    ${content.script ? `
                        <pre class="code-panel" data-code="script"><code>${this.escape(content.script)}</code></pre>
                    ` : ''}
                    ${content.style ? `
                        <pre class="code-panel" data-code="style"><code>${this.escape(content.style)}</code></pre>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderPropsTable(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section props-table-section">
                <h2 class="topic-title">📋 ${this.escape(title)}</h2>
                
                <div class="props-table-wrapper">
                    <table class="props-table">
                        <thead>
                            <tr>
                                <th>属性名</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${content.props.map(prop => `
                                <tr>
                                    <td><code>${this.escape(prop.name)}</code></td>
                                    <td><code>${this.escape(prop.type)}</code></td>
                                    <td>${prop.default ? `<code>${this.escape(prop.default)}</code>` : '-'}</td>
                                    <td>${this.escape(prop.description)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ==================== 测验类型渲染方法 ====================

    renderQuiz(topic) {
        const { title, content } = topic;
        const id = this._generateId();
        
        // 自动判断是单选还是多选
        const isMulti = Array.isArray(content.correctAnswer);
        const quizType = isMulti ? 'multi' : 'single';
        const inputType = isMulti ? 'checkbox' : 'radio';
        
        // 难度标签映射
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        const diff = difficultyMap[content.difficulty] || difficultyMap.medium;
        
        return `
            <div class="topic-section quiz-section" data-quiz-id="${id}" data-quiz-type="${quizType}">
                <div class="quiz-header">
                    <h2 class="topic-title">❓ ${this.escape(title)}</h2>
                    <div class="quiz-meta">
                        ${content.difficulty ? `<span class="difficulty-badge ${diff.class}">${diff.icon} ${diff.text}</span>` : ''}
                        <span class="quiz-tag">${isMulti ? '☑️ 多选题' : '📝 单选题'}</span>
                        ${content.tags ? content.tags.map(tag => `<span class="quiz-tag">${this.escape(tag)}</span>`).join('') : ''}
                    </div>
                </div>
                
                <div class="quiz-question">
                    <p class="question-text">${this.escape(content.question)}</p>
                    ${isMulti ? '<p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">💡 提示：请选择所有正确答案</p>' : ''}
                    
                    <div class="quiz-options">
                        ${content.options.map((option, i) => {
                            const letter = String.fromCharCode(65 + i); // A, B, C, D
                            const isCorrect = isMulti 
                                ? content.correctAnswer.includes(i) 
                                : (i === content.correctAnswer);
                            return `
                            <label class="quiz-option" data-option="${letter}">
                                <input type="${inputType}" name="quiz-${id}" value="${i}" data-correct="${isCorrect}">
                                <span class="option-letter">${letter}</span>
                                <span class="option-text">${this.escape(option)}</span>
                            </label>
                        `}).join('')}
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn-check-answer" data-quiz="${id}">提交答案</button>
                        <button class="btn-show-answer" data-quiz="${id}">查看解析</button>
                    </div>
                    
                    <div class="quiz-feedback" style="display: none;">
                        <div class="feedback-content"></div>
                    </div>
                    
                    <div class="quiz-answer-section" style="display: none;">
                        ${this._renderExplanation(content)}
                    </div>
                </div>
            </div>
        `;
    }

    renderQuizMulti(topic) {
        const { title, content } = topic;
        const id = this._generateId();
        
        // 难度标签映射
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        const diff = difficultyMap[content.difficulty] || difficultyMap.medium;
        
        return `
            <div class="topic-section quiz-section" data-quiz-id="${id}" data-quiz-type="multi">
                <div class="quiz-header">
                    <h2 class="topic-title">❓ ${this.escape(title)}</h2>
                    <div class="quiz-meta">
                        ${content.difficulty ? `<span class="difficulty-badge ${diff.class}">${diff.icon} ${diff.text}</span>` : ''}
                        <span class="quiz-tag">☑️ 多选题</span>
                        ${content.tags ? content.tags.map(tag => `<span class="quiz-tag">${this.escape(tag)}</span>`).join('') : ''}
                    </div>
                </div>
                
                <div class="quiz-question">
                    <p class="question-text">${this.escape(content.question)}</p>
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">💡 提示：请选择所有正确答案</p>
                    
                    <div class="quiz-options">
                        ${content.options.map((option, i) => {
                            const letter = String.fromCharCode(65 + i); // A, B, C, D
                            const isCorrect = Array.isArray(content.correctAnswer) ? content.correctAnswer.includes(i) : content.correctAnswers?.includes(i);
                            return `
                            <label class="quiz-option" data-option="${letter}">
                                <input type="checkbox" name="quiz-${id}" value="${i}" data-correct="${isCorrect}">
                                <span class="option-letter">${letter}</span>
                                <span class="option-text">${this.escape(option)}</span>
                            </label>
                        `}).join('')}
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn-check-answer" data-quiz="${id}">提交答案</button>
                        <button class="btn-show-answer" data-quiz="${id}">查看解析</button>
                    </div>
                    
                    <div class="quiz-feedback" style="display: none;">
                        <div class="feedback-content"></div>
                    </div>
                    
                    <div class="quiz-answer-section" style="display: none;">
                        ${this._renderExplanation(content)}
                    </div>
                </div>
            </div>
        `;
    }

    renderQuizBool(topic) {
        const { title, content } = topic;
        const id = this._generateId();
        
        return `
            <div class="topic-section quiz-section" data-quiz-id="${id}" data-quiz-type="bool">
                <h2 class="topic-title">❓ ${this.escape(title)} (判断)</h2>
                
                <div class="quiz-question">
                    <p class="question-text">${this.escape(content.question)}</p>
                    
                    <div class="quiz-options">
                        <label class="quiz-option">
                            <input type="radio" name="quiz-${id}" value="true" data-correct="${content.correctAnswer === true}">
                            <span>✓ 正确</span>
                        </label>
                        <label class="quiz-option">
                            <input type="radio" name="quiz-${id}" value="false" data-correct="${content.correctAnswer === false}">
                            <span>✗ 错误</span>
                        </label>
                    </div>
                    
                    <button class="btn-check-answer" data-quiz="${id}">检查答案</button>
                    
                    <div class="quiz-feedback" style="display: none;">
                        <div class="feedback-content"></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuizCode(topic) {
        const { title, content } = topic;
        const id = this._generateId();
        
        // 自动判断是单选还是多选
        const isMulti = Array.isArray(content.correctAnswer);
        const quizType = isMulti ? 'multi' : 'single';
        const inputType = isMulti ? 'checkbox' : 'radio';
        
        // 难度标签映射
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        const diff = difficultyMap[content.difficulty] || difficultyMap.medium;
        
        return `
            <div class="topic-section quiz-section quiz-code-section" data-quiz-id="${id}" data-quiz-type="${quizType}">
                <div class="quiz-header">
                    <h2 class="topic-title">💻 ${this.escape(title)}</h2>
                    <div class="quiz-meta">
                        ${content.difficulty ? `<span class="difficulty-badge ${diff.class}">${diff.icon} ${diff.text}</span>` : ''}
                        <span class="quiz-tag">💻 代码题${isMulti ? '（多选）' : ''}</span>
                        ${content.tags ? content.tags.map(tag => `<span class="quiz-tag">${this.escape(tag)}</span>`).join('') : ''}
                    </div>
                </div>
                
                <div class="quiz-question">
                    <p class="question-text">${this.escape(content.question)}</p>
                    ${isMulti ? '<p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">💡 提示：请选择所有正确答案</p>' : ''}
                    
                    <div class="code-block">
                        <pre><code>${this.escape(content.code)}</code></pre>
                    </div>
                    
                    <div class="quiz-options">
                        ${content.options.map((option, i) => {
                            const letter = String.fromCharCode(65 + i); // A, B, C, D
                            const isCorrect = isMulti 
                                ? content.correctAnswer.includes(i) 
                                : (i === content.correctAnswer);
                            return `
                            <label class="quiz-option" data-option="${letter}">
                                <input type="${inputType}" name="quiz-${id}" value="${i}" data-correct="${isCorrect}">
                                <span class="option-letter">${letter}</span>
                                <span class="option-text">${this.escape(option)}</span>
                            </label>
                        `}).join('')}
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn-check-answer" data-quiz="${id}">提交答案</button>
                        <button class="btn-show-answer" data-quiz="${id}">查看解析</button>
                    </div>
                    
                    <div class="quiz-feedback" style="display: none;">
                        <div class="feedback-content"></div>
                    </div>
                    
                    <div class="quiz-answer-section" style="display: none;">
                        ${this._renderExplanation(content)}
                    </div>
                </div>
            </div>
        `;
    }

    _renderExplanation(content) {
        if (!content.explanation) return '';
        
        const exp = content.explanation;
        let html = '<div class="explanation">';
        
        // 显示正确答案
        html += '<div class="correct-answer-display">';
        html += '<strong>✅ 正确答案：</strong>';
        
        if (Array.isArray(content.correctAnswer)) {
            // 多选题
            const letters = content.correctAnswer.map(i => String.fromCharCode(65 + i));
            html += `<span class="answer-letters">${letters.join(', ')}</span>`;
        } else {
            // 单选题
            const letter = String.fromCharCode(65 + content.correctAnswer);
            html += `<span class="answer-letters">${letter}</span>`;
        }
        html += '</div>';
        
        // 标题
        if (exp.title) {
            html += `<div class="explanation-header">💡 ${this.escape(exp.title)}</div>`;
        }
        
        html += '<div class="explanation-content">';
        
        // 简单字符串格式
        if (typeof exp === 'string') {
            html += `<p style="white-space: pre-line;">${this.escape(exp)}</p>`;
        } else {
            // 描述或内容
            if (exp.description || exp.content) {
                html += `<p style="white-space: pre-line;">${this.escape(exp.description || exp.content)}</p>`;
            }
            
            // 要点列表
            if (exp.points) {
                html += '<ul style="margin-top: 1rem;">';
                exp.points.forEach(point => {
                    html += `<li style="margin-bottom: 0.5rem;">${this.escape(point)}</li>`;
                });
                html += '</ul>';
            }
            
            // 代码块
            if (exp.code) {
                html += `<pre style="margin-top: 1rem;"><code>${this.escape(exp.code)}</code></pre>`;
            }
            
            // 分节内容
            if (exp.sections) {
                exp.sections.forEach(section => {
                    html += '<div class="explanation-section">';
                    if (section.title || section.subtitle) {
                        html += `<h5>${this.escape(section.title || section.subtitle)}</h5>`;
                    }
                    if (section.content || section.text) {
                        html += `<p style="white-space: pre-line;">${this.escape(section.content || section.text)}</p>`;
                    }
                    if (section.points) {
                        html += '<ul>';
                        section.points.forEach(point => {
                            html += `<li>${this.escape(point)}</li>`;
                        });
                        html += '</ul>';
                    }
                    if (section.code) {
                        html += `<pre><code>${this.escape(section.code)}</code></pre>`;
                    }
                    html += '</div>';
                });
            }
        }
        
        html += '</div></div>';
        return html;
    }

    renderDefault(topic) {
        return `
            <div class="topic-section">
                <h2 class="topic-title">${this.escape(topic.title)}</h2>
                <p>未知类型: ${topic.type}</p>
            </div>
        `;
    }

    // ==================== 交互功能 ====================

    _initInteractive() {
        this._initLiveCode();
        this._initSidebarRunners();
        this._initTabs();
        this._initQuiz();
        this._initColorCopy();
        this._initCodeTabs();
    }

    _initLiveCode() {
        document.querySelectorAll('.btn-run').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                const section = document.querySelector(`[data-topic-id="${target}"]`);
                if (section) {
                    this._runCode(section);
                }
            });
        });
    }

    _runCode(section) {
        const html = section.querySelector('[data-lang="html"]')?.value || '';
        const css = section.querySelector('[data-lang="css"]')?.value || '';
        const js = section.querySelector('[data-lang="js"]')?.value || '';
        
        const iframe = section.querySelector('.preview-frame');
        const doc = iframe.contentDocument;
        
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}<\/script>
            </body>
            </html>
        `);
        doc.close();
    }

    _initSidebarRunners() {
        document.querySelectorAll('.sidebar-panel .btn-run').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                const card = document.querySelector(`[data-example-id="${target}"]`);
                const code = card.querySelector('code').textContent;
                const output = document.getElementById(`${target}-output`);
                
                try {
                    const logs = [];
                    const originalLog = console.log;
                    console.log = (...args) => {
                        logs.push(args.map(arg => 
                            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                        ).join(' '));
                        originalLog.apply(console, args);
                    };
                    
                    eval(code);
                    console.log = originalLog;
                    
                    output.innerHTML = logs.length > 0
                        ? `<div class="output-success"><strong>输出：</strong><pre>${logs.join('\n')}</pre></div>`
                        : '<div class="output-info">执行成功，无输出</div>';
                        
                } catch (error) {
                    output.innerHTML = `<div class="output-error"><strong>错误：</strong><pre>${this.escape(error.message)}</pre></div>`;
                }
            });
        });
    }

    _initTabs() {
        document.querySelectorAll('.tab-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                const container = e.target.closest('.tab-container');
                
                container.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
                container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                container.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
            });
        });
    }

    _initQuiz() {
        // 选项点击事件（支持单选和多选）
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', function(e) {
                // 如果点击的是input本身，不需要处理
                if (e.target.tagName === 'INPUT') return;
                
                const input = this.querySelector('input');
                if (!input || input.disabled) return;
                
                const section = this.closest('.quiz-section');
                const type = section.dataset.quizType;
                
                if (type === 'multi') {
                    // 多选题：切换checkbox
                    input.checked = !input.checked;
                    this.classList.toggle('selected', input.checked);
                } else {
                    // 单选题：互斥选择
                    section.querySelectorAll('.quiz-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    input.checked = true;
                }
            });
        });
        
        // 提交答案按钮
        document.querySelectorAll('.btn-check-answer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quizId = e.target.dataset.quiz;
                const section = document.querySelector(`[data-quiz-id="${quizId}"]`);
                const type = section.dataset.quizType;
                
                if (type === 'multi') {
                    this._checkMultiAnswer(section, quizId);
                } else {
                    this._checkSingleAnswer(section, quizId);
                }
            });
        });
        
        // 查看解析按钮
        document.querySelectorAll('.btn-show-answer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quizId = e.target.dataset.quiz;
                const section = document.querySelector(`[data-quiz-id="${quizId}"]`);
                const answerSection = section.querySelector('.quiz-answer-section');
                
                if (answerSection) {
                    answerSection.style.display = answerSection.style.display === 'none' ? 'block' : 'none';
                    e.target.textContent = answerSection.style.display === 'none' ? '查看解析' : '隐藏解析';
                }
            });
        });
    }

    _checkSingleAnswer(section, quizId) {
        const selected = section.querySelector(`input[name="quiz-${quizId}"]:checked`);
        
        if (!selected) {
            alert('请先选择一个答案');
            return;
        }
        
        const feedback = section.querySelector('.quiz-feedback');
        const feedbackContent = feedback.querySelector('.feedback-content');
        const isCorrect = selected.dataset.correct === 'true';
        
        // 禁用所有选项
        section.querySelectorAll('.quiz-option').forEach(opt => {
            const input = opt.querySelector('input');
            input.disabled = true;
            opt.style.cursor = 'default';
            
            // 标记正确/错误
            if (input.dataset.correct === 'true') {
                opt.classList.add('correct');
            } else if (input.checked) {
                opt.classList.add('wrong');
            }
        });
        
        // 显示反馈
        feedback.style.display = 'block';
        feedbackContent.innerHTML = isCorrect
            ? '✅ 回答正确！'
            : '❌ 回答错误，正确答案已标记为绿色';
        
        feedback.className = 'quiz-feedback show ' + (isCorrect ? 'correct' : 'incorrect');
        
        // 禁用提交按钮
        const btn = section.querySelector('.btn-check-answer');
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        }
        
        // 自动显示解析
        const answerSection = section.querySelector('.quiz-answer-section');
        if (answerSection) {
            answerSection.style.display = 'block';
            const showBtn = section.querySelector('.btn-show-answer');
            if (showBtn) {
                showBtn.textContent = '隐藏解析';
            }
        }
    }

    _checkMultiAnswer(section, quizId) {
        const selected = Array.from(section.querySelectorAll(`input[name="quiz-${quizId}"]:checked`));
        const correct = Array.from(section.querySelectorAll(`input[name="quiz-${quizId}"][data-correct="true"]`));
        
        const isCorrect = selected.length === correct.length && 
                         selected.every(s => s.dataset.correct === 'true');
        
        // 禁用所有选项
        section.querySelectorAll('.quiz-option').forEach(opt => {
            const input = opt.querySelector('input');
            input.disabled = true;
            opt.style.cursor = 'default';
            
            // 标记正确/错误
            if (input.dataset.correct === 'true') {
                opt.classList.add('correct');
            } else if (input.checked) {
                opt.classList.add('wrong');
            }
        });
        
        const feedback = section.querySelector('.quiz-feedback');
        const feedbackContent = feedback.querySelector('.feedback-content');
        
        feedback.style.display = 'block';
        feedbackContent.innerHTML = isCorrect
            ? '✅ 回答正确！'
            : `❌ 回答错误，正确答案有${correct.length}个选项，已标记为绿色`;
        
        feedback.className = 'quiz-feedback show ' + (isCorrect ? 'correct' : 'incorrect');
        
        // 禁用提交按钮
        const btn = section.querySelector('.btn-check-answer');
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        }
        
        // 自动显示解析
        const answerSection = section.querySelector('.quiz-answer-section');
        if (answerSection) {
            answerSection.style.display = 'block';
            const showBtn = section.querySelector('.btn-show-answer');
            if (showBtn) {
                showBtn.textContent = '隐藏解析';
            }
        }
    }

    _initColorCopy() {
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.target.closest('.color-item').dataset.color;
                navigator.clipboard.writeText(color).then(() => {
                    this._showToast(`已复制: ${color}`);
                });
            });
        });
    }

    _initCodeTabs() {
        document.querySelectorAll('.code-tabs button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codeType = e.target.dataset.code;
                const container = e.target.closest('.component-code');
                
                container.querySelectorAll('.code-tabs button').forEach(b => b.classList.remove('active'));
                container.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'));
                
                e.target.classList.add('active');
                container.querySelector(`.code-panel[data-code="${codeType}"]`).classList.add('active');
            });
        });
    }

    // ==================== 工具方法 ====================

    _renderControl(control, demoId) {
        const group = `
            <div class="control-group">
                <label>${this.escape(control.label)}</label>
                ${this._getControlInput(control, demoId)}
                <span class="control-value" id="value-${demoId}-${control.property}">${control.value}${control.unit || ''}</span>
            </div>
        `;
        return group;
    }

    _getControlInput(control, demoId) {
        switch (control.type) {
            case 'slider':
                return `<input type="range" min="${control.min}" max="${control.max}" value="${control.value}" data-demo="${demoId}" data-prop="${control.property}">`;
            case 'color':
                return `<input type="color" value="${control.value}" data-demo="${demoId}" data-prop="${control.property}">`;
            case 'select':
                return `<select data-demo="${demoId}" data-prop="${control.property}">
                    ${control.options.map(opt => `<option value="${opt.value}" ${opt.value === control.value ? 'selected' : ''}>${this.escape(opt.label)}</option>`).join('')}
                </select>`;
            default:
                return '';
        }
    }

    _showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }, 100);
    }

    _generateId() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }

    _callHook(name, ...args) {
        const hook = this.config.hooks[name];
        if (typeof hook === 'function') {
            hook.apply(this, args);
        }
    }

    escape(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalRendererV2;
} else {
    window.UniversalRendererV2 = UniversalRendererV2;
}
