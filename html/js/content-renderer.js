// HTML内容渲染引擎
const ContentRenderer = {
    data: null,

    init(contentData) {
        this.data = contentData;
        this.render();
    },

    render() {
        this.renderTitle();
        this.renderContent();
        this.renderNavigation();
    },

    renderTitle() {
        const titleElement = document.getElementById('section-title');
        if (titleElement && this.data.section) {
            titleElement.textContent = `${this.data.section.icon} ${this.data.section.title}`;
        }
    },

    renderContent() {
        const container = document.getElementById('content-container');
        if (!container || !this.data.topics) return;

        let html = '';
        this.data.topics.forEach(topic => {
            html += this.renderTopic(topic);
        });

        container.innerHTML = html;
    },

    renderTopic(topic) {
        const typeMap = {
            'concept': this.renderConcept,
            'code-example': this.renderCodeExample,
            'principle': this.renderPrinciple,
            'comparison': this.renderComparison,
            'best-practice': this.renderBestPractice,
            'security': this.renderSecurity,
            'accessibility': this.renderAccessibility,
            'compatibility': this.renderCompatibility,
            'checklist': this.renderChecklist,
            'interactive-demo': this.renderInteractiveDemo
        };

        const renderFunc = typeMap[topic.type] || this.renderDefault;
        return renderFunc.call(this, topic);
    },

    renderConcept(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section concept-section">
                <h2 class="topic-title">${this.escapeHtml(title)}</h2>
                <div class="concept-content">
                    <p class="description">${this.escapeHtml(content.description)}</p>
                    ${content.keyPoints ? `
                        <div class="key-points">
                            <h3>核心要点</h3>
                            <ul>
                                ${content.keyPoints.map(point => `<li>${this.escapeHtml(point)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${content.mdn ? `
                        <div class="mdn-link">
                            <a href="${this.escapeHtml(content.mdn)}" target="_blank" rel="noopener">📖 MDN文档</a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderCodeExample(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section code-section">
                <h2 class="topic-title">${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                ${content.examples.map(example => `
                    <div class="example-block">
                        <h3 class="example-title">${this.escapeHtml(example.title)}</h3>
                        <div class="code-block">
                            <pre><code>${this.escapeHtml(example.code)}</code></pre>
                        </div>
                        ${example.result ? `
                            <div class="result-box">
                                <strong>效果：</strong>${this.escapeHtml(example.result)}
                            </div>
                        ` : ''}
                        ${example.notes ? `
                            <div class="notes-box">
                                <strong>说明：</strong>${this.escapeHtml(example.notes)}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderPrinciple(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section principle-section">
                <h2 class="topic-title">${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                ${content.mechanism ? `
                    <div class="mechanism-box">
                        <h3>工作机制</h3>
                        <p>${this.escapeHtml(content.mechanism)}</p>
                    </div>
                ` : ''}
                ${content.keyPoints ? `
                    <div class="key-points">
                        <h3>核心要点</h3>
                        <ul>
                            ${content.keyPoints.map(point => `<li>${this.escapeHtml(point)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderComparison(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section comparison-section">
                <h2 class="topic-title">${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                <div class="comparison-grid">
                    ${content.items.map(item => `
                        <div class="comparison-item">
                            <h3 class="item-name">${this.escapeHtml(item.name)}</h3>
                            ${item.pros ? `
                                <div class="pros">
                                    <h4>✅ 优势</h4>
                                    <ul>
                                        ${item.pros.map(pro => `<li>${this.escapeHtml(pro)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${item.cons ? `
                                <div class="cons">
                                    <h4>❌ 劣势</h4>
                                    <ul>
                                        ${item.cons.map(con => `<li>${this.escapeHtml(con)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderBestPractice(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section best-practice-section">
                <h2 class="topic-title">💡 ${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                ${content.practices ? `
                    <div class="practices-list">
                        ${content.practices.map((practice, index) => `
                            <div class="practice-item">
                                <h3>${index + 1}. ${this.escapeHtml(practice.title)}</h3>
                                <p>${this.escapeHtml(practice.description)}</p>
                                ${practice.example ? `
                                    <div class="code-block">
                                        <pre><code>${this.escapeHtml(practice.example)}</code></pre>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderSecurity(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section security-section">
                <h2 class="topic-title">🔒 ${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                ${content.risks ? `
                    <div class="risks-box">
                        <h3>⚠️ 安全风险</h3>
                        <ul>
                            ${content.risks.map(risk => `<li>${this.escapeHtml(risk)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${content.solutions ? `
                    <div class="solutions-box">
                        <h3>✅ 防护方案</h3>
                        <ul>
                            ${content.solutions.map(solution => `<li>${this.escapeHtml(solution)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${content.examples ? `
                    <div class="security-examples">
                        ${content.examples.map(example => `
                            <div class="example-block">
                                <h4>${this.escapeHtml(example.title)}</h4>
                                <div class="code-block">
                                    <pre><code>${this.escapeHtml(example.code)}</code></pre>
                                </div>
                                ${example.explanation ? `
                                    <p class="explanation">${this.escapeHtml(example.explanation)}</p>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderAccessibility(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section accessibility-section">
                <h2 class="topic-title">♿ ${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                ${content.guidelines ? `
                    <div class="guidelines-box">
                        <h3>可访问性指南</h3>
                        <ul>
                            ${content.guidelines.map(guide => `<li>${this.escapeHtml(guide)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${content.examples ? `
                    ${content.examples.map(example => `
                        <div class="example-block">
                            <h4>${this.escapeHtml(example.title)}</h4>
                            <div class="code-block">
                                <pre><code>${this.escapeHtml(example.good)}</code></pre>
                            </div>
                            ${example.bad ? `
                                <p class="bad-example">❌ 不推荐：</p>
                                <div class="code-block">
                                    <pre><code>${this.escapeHtml(example.bad)}</code></pre>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `;
    },

    renderCompatibility(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section compatibility-section">
                <h2 class="topic-title">🌐 ${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                ${content.support ? `
                    <div class="support-table">
                        <h3>浏览器支持</h3>
                        <ul>
                            ${Object.entries(content.support).map(([browser, version]) => 
                                `<li><strong>${this.escapeHtml(browser)}:</strong> ${this.escapeHtml(version)}</li>`
                            ).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${content.fallback ? `
                    <div class="fallback-box">
                        <h3>降级方案</h3>
                        <p>${this.escapeHtml(content.fallback)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderChecklist(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section checklist-section">
                <h2 class="topic-title">✓ ${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                ${content.items ? `
                    <div class="checklist">
                        ${content.items.map(item => `
                            <div class="checklist-item">
                                <input type="checkbox" id="${this.escapeHtml(item.id || '')}">
                                <label for="${this.escapeHtml(item.id || '')}">${this.escapeHtml(item.text)}</label>
                                ${item.description ? `<p class="item-desc">${this.escapeHtml(item.description)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderInteractiveDemo(topic) {
        const { title, content } = topic;
        return `
            <div class="topic-section demo-section">
                <h2 class="topic-title">🎮 ${this.escapeHtml(title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                ${content.demoUrl ? `
                    <div class="demo-container">
                        <iframe src="${this.escapeHtml(content.demoUrl)}" frameborder="0"></iframe>
                    </div>
                ` : ''}
                ${content.instructions ? `
                    <div class="instructions">
                        <h3>使用说明</h3>
                        <p>${this.escapeHtml(content.instructions)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderDefault(topic) {
        return `
            <div class="topic-section">
                <h2 class="topic-title">${topic.title}</h2>
                <p>${JSON.stringify(topic.content)}</p>
            </div>
        `;
    },

    renderNavigation() {
        const navContainer = document.getElementById('nav-links');
        if (!navContainer || !this.data.navigation) return;

        const { prev, next } = this.data.navigation;
        let html = '<div class="navigation">';

        if (prev) {
            html += `
                <a href="${this.escapeHtml(prev.url)}" class="nav-button prev-button">
                    <span class="nav-arrow">←</span>
                    <span class="nav-text">
                        <span class="nav-label">上一章</span>
                        <span class="nav-title">${this.escapeHtml(prev.title)}</span>
                    </span>
                </a>
            `;
        } else {
            html += '<div></div>';
        }

        if (next) {
            html += `
                <a href="${this.escapeHtml(next.url)}" class="nav-button next-button">
                    <span class="nav-text">
                        <span class="nav-label">下一章</span>
                        <span class="nav-title">${this.escapeHtml(next.title)}</span>
                    </span>
                    <span class="nav-arrow">→</span>
                </a>
            `;
        }

        html += '</div>';
        navContainer.innerHTML = html;
    },

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};
