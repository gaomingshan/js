/**
 * 通用目录渲染器
 * 用于渲染学科的目录/大纲页面
 * 
 * @version 1.0.0
 */

class IndexRenderer {
    constructor(config) {
        this.config = {
            subject: config.subject || 'unknown',
            title: config.title || '学习系统',
            subtitle: config.subtitle || '系统化学习',
            icon: config.icon || '📚',
            theme: config.theme || {
                primary: '#667eea',
                secondary: '#764ba2',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            tabs: config.tabs || [],
            footer: config.footer || null
        };
        
        this.currentTab = this.config.tabs.length > 0 ? this.config.tabs[0].id : '';
    }

    /**
     * 渲染页面
     */
    render() {
        this._injectStyles();
        this._renderStructure();
        this._renderHeader();
        this._renderTabs();
        this._renderContent();
        this._renderFooter();
        this._initEvents();
    }

    /**
     * 注入CSS变量
     */
    _injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --index-primary: ${this.config.theme.primary};
                --index-secondary: ${this.config.theme.secondary};
                --index-gradient: ${this.config.theme.gradient};
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 渲染基础结构
     */
    _renderStructure() {
        document.body.innerHTML = `
            <div class="index-container">
                <div class="index-header" id="index-header"></div>
                <div class="index-tabs" id="index-tabs"></div>
                <div class="index-content" id="index-content"></div>
                <div class="index-footer" id="index-footer"></div>
            </div>
        `;
    }

    /**
     * 渲染头部
     */
    _renderHeader() {
        const header = document.getElementById('index-header');
        header.innerHTML = `
            <h1>${this.config.icon} ${this.escape(this.config.title)}</h1>
            <p>${this.escape(this.config.subtitle)}</p>
        `;
    }

    /**
     * 渲染标签页
     */
    _renderTabs() {
        const tabsContainer = document.getElementById('index-tabs');
        
        if (this.config.tabs.length === 0) {
            tabsContainer.style.display = 'none';
            return;
        }
        
        let html = '<div class="tab-buttons">';
        
        this.config.tabs.forEach((tab, index) => {
            const isActive = index === 0 ? 'active' : '';
            html += `
                <button class="tab-btn ${isActive}" data-tab="${tab.id}">
                    ${tab.icon || ''} ${this.escape(tab.name)}
                </button>
            `;
        });
        
        html += '</div>';
        tabsContainer.innerHTML = html;
    }

    /**
     * 渲染内容区
     */
    _renderContent() {
        const contentContainer = document.getElementById('index-content');
        let html = '';
        
        this.config.tabs.forEach((tab, index) => {
            const isActive = index === 0 ? 'active' : '';
            html += `
                <div class="tab-content ${isActive}" data-tab="${tab.id}">
                    ${this._renderSections(tab.sections, tab.urlTemplate)}
                </div>
            `;
        });
        
        contentContainer.innerHTML = html;
    }

    /**
     * 渲染章节组
     */
    _renderSections(sections, urlTemplate) {
        if (!sections || sections.length === 0) {
            return '<p style="text-align: center; color: #718096;">暂无内容</p>';
        }
        
        let html = '';
        
        sections.forEach(section => {
            html += `
                <div class="section-group">
                    <h2 class="section-title">
                        ${section.icon || ''} ${this.escape(section.name)}
                        ${section.count ? ` (${section.count}章)` : ''}
                    </h2>
                    <div class="topics-grid">
                        ${this._renderTopics(section.topics, urlTemplate)}
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    /**
     * 渲染主题卡片
     */
    _renderTopics(topics, urlTemplate) {
        if (!topics || topics.length === 0) return '';
        
        return topics.map(topic => {
            const url = urlTemplate
                .replace('{chapter}', this._padChapter(topic.chapter))
                .replace('{id}', topic.id || '');
            
            const disabledClass = topic.disabled ? 'disabled' : '';
            const description = topic.description || topic.desc || '点击查看详情';
            
            return `
                <a href="${this.escape(url)}" class="topic-card ${disabledClass}">
                    <div class="card-number">${topic.chapter}</div>
                    <h3>${this.escape(topic.title)}</h3>
                    <p>${this.escape(description)}</p>
                    <span class="card-arrow">→</span>
                </a>
            `;
        }).join('');
    }

    /**
     * 渲染页脚
     */
    _renderFooter() {
        const footer = document.getElementById('index-footer');
        
        if (!this.config.footer) {
            footer.style.display = 'none';
            return;
        }
        
        footer.innerHTML = `
            <p>${this.escape(this.config.footer.text || '')}</p>
            ${this.config.footer.links ? `
                <div class="footer-links">
                    ${this.config.footer.links.map(link => `
                        <a href="${this.escape(link.url)}" target="_blank" rel="noopener">
                            ${this.escape(link.text)}
                        </a>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    /**
     * 初始化事件
     */
    _initEvents() {
        // Tab切换事件
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.target.dataset.tab;
                this._switchTab(tabId, true); // 支持路由
            });
        });
        
        // 浏览器前进后退事件
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tab) {
                this._switchTab(e.state.tab, false);
            }
        });
        
        // 初始化时根据URL参数设置tab
        const urlParams = new URLSearchParams(window.location.search);
        const initialTab = urlParams.get('tab');
        if (initialTab && this._isValidTab(initialTab)) {
            this._switchTab(initialTab, false);
        }
    }

    /**
     * 切换标签页
     * @param {string} tabId - tab ID
     * @param {boolean} updateHistory - 是否更新浏览器历史
     */
    _switchTab(tabId, updateHistory = true) {
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // 更新内容区域
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabId);
        });
        
        this.currentTab = tabId;
        
        // 更新URL（支持前进后退）
        if (updateHistory) {
            const url = new URL(window.location);
            url.searchParams.set('tab', tabId);
            window.history.pushState({ tab: tabId }, '', url);
        }
    }
    
    /**
     * 检查tab是否有效
     */
    _isValidTab(tabId) {
        return this.config.tabs.some(tab => tab.id === tabId);
    }

    /**
     * 补齐章节号（01, 02, ...）
     */
    _padChapter(num) {
        return String(num).padStart(2, '0');
    }

    /**
     * HTML转义
     */
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

    /**
     * 获取统计信息
     */
    getStatistics() {
        let totalChapters = 0;
        let totalSections = 0;
        
        this.config.tabs.forEach(tab => {
            totalSections += tab.sections.length;
            tab.sections.forEach(section => {
                totalChapters += section.topics.length;
            });
        });
        
        return {
            subject: this.config.subject,
            tabs: this.config.tabs.length,
            sections: totalSections,
            chapters: totalChapters
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexRenderer;
} else {
    window.IndexRenderer = IndexRenderer;
}
