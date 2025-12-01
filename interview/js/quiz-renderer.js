/**
 * 面试题渲染引擎
 * 负责根据JSON数据动态渲染题目页面
 */
const QuizRenderer = {
    data: null,

    /**
     * 初始化渲染器
     * @param {Object} quizData - 题目数据对象
     */
    init(quizData) {
        try {
            if (!quizData) {
                throw new Error('题目数据为空');
            }
            
            this.data = quizData;
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('加载题目数据失败，请刷新页面重试');
        }
    },

    /**
     * 渲染整个页面
     */
    render() {
        const { config, questions, navigation } = this.data;
        
        // 设置页面标题和描述
        document.title = config.title + ' - JavaScript 面试题';
        document.getElementById('chapter-title').textContent = config.icon + ' ' + config.title;
        document.getElementById('chapter-desc').textContent = config.description;
        
        // 设置主题色
        if (config.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', config.primaryColor);
        }
        if (config.bgGradient) {
            document.documentElement.style.setProperty('--bg-gradient', config.bgGradient);
        }
        
        // 渲染题目
        const container = document.getElementById('quiz-container');
        container.innerHTML = questions.map((q, index) => this.renderQuestion(q, index + 1)).join('');
        
        // 渲染导航
        this.renderNavigation(navigation);
    },

    /**
     * 渲染单个题目
     */
    renderQuestion(question, number) {
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        
        const diff = difficultyMap[question.difficulty] || difficultyMap.medium;
        
        return `
            <div class="quiz-item" data-question="${number}">
                <div class="quiz-item-header">
                    <span class="difficulty ${diff.class}">${diff.icon} ${diff.text}</span>
                    ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="question">Q${number}: ${question.question}</div>
                <div class="options">
                    ${question.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i); // A, B, C, D
                        return `<div class="option" data-answer="${letter}">
                            <strong>${letter}.</strong> ${opt}
                        </div>`;
                    }).join('')}
                </div>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="QuizRenderer.checkAnswer(${number}, '${question.correctAnswer}')">提交答案</button>
                    <button class="btn btn-secondary" onclick="QuizRenderer.showAnswer(${number})">查看解析</button>
                </div>
                <div class="answer-section" id="answer-${number}">
                    <div class="answer-label">✅ 正确答案：${question.correctAnswer}</div>
                    <div class="explanation">
                        ${this.renderExplanation(question.explanation)}
                    </div>
                    ${question.source ? `<span class="source-tag">📌 来源：${question.source}</span>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * 渲染解析内容
     */
    renderExplanation(explanation) {
        if (typeof explanation === 'string') {
            return `<p>${explanation}</p>`;
        }
        
        let html = '';
        
        if (explanation.title) {
            html += `<h4>${explanation.title}</h4>`;
        }
        
        if (explanation.description) {
            html += `<p>${explanation.description}</p>`;
        }
        
        if (explanation.points) {
            html += '<ul>';
            explanation.points.forEach(point => {
                html += `<li>${point}</li>`;
            });
            html += '</ul>';
        }
        
        if (explanation.code) {
            html += `<div class="code-block">${this.escapeHtml(explanation.code)}</div>`;
        }
        
        if (explanation.sections) {
            explanation.sections.forEach(section => {
                html += `<h4>${section.title}</h4>`;
                if (section.content) {
                    html += `<p>${section.content}</p>`;
                }
                if (section.code) {
                    html += `<div class="code-block">${this.escapeHtml(section.code)}</div>`;
                }
                if (section.points) {
                    html += '<ul>';
                    section.points.forEach(point => {
                        html += `<li>${point}</li>`;
                    });
                    html += '</ul>';
                }
            });
        }
        
        return html;
    },

    /**
     * 渲染导航链接
     */
    renderNavigation(navigation) {
        if (!navigation) return;
        
        const navContainer = document.getElementById('nav-links');
        let html = '';
        
        if (navigation.prev) {
            html += `<a href="${navigation.prev.url}" class="nav-link prev">⬅️ 上一节：${navigation.prev.title}</a>`;
        }
        
        html += `<a href="../index.html" class="nav-link home">📋 面试题导航</a>`;
        
        if (navigation.next) {
            html += `<a href="${navigation.next.url}" class="nav-link next">下一节：${navigation.next.title} ➡️</a>`;
        }
        
        navContainer.innerHTML = html;
    },

    /**
     * 附加事件监听器
     */
    attachEventListeners() {
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                const parent = this.closest('.quiz-item');
                parent.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    },

    /**
     * 检查答案
     */
    checkAnswer(questionNum, correctAnswer) {
        const quizItem = document.querySelector(`[data-question="${questionNum}"]`);
        const selectedOption = quizItem.querySelector('.option.selected');
        
        if (!selectedOption) {
            alert('请先选择一个答案！');
            return;
        }
        
        const userAnswer = selectedOption.dataset.answer;
        
        // 禁用所有选项
        quizItem.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
            if (opt.dataset.answer === correctAnswer) {
                opt.classList.add('correct');
            } else if (opt === selectedOption) {
                opt.classList.add('wrong');
            }
        });
        
        // 显示结果
        const isCorrect = userAnswer === correctAnswer;
        alert(isCorrect ? '✅ 回答正确！' : '❌ 回答错误，正确答案是 ' + correctAnswer);
        
        // 自动显示解析
        this.showAnswer(questionNum);
    },

    /**
     * 显示答案解析
     */
    showAnswer(questionNum) {
        const answerSection = document.getElementById(`answer-${questionNum}`);
        if (answerSection) {
            answerSection.classList.add('show');
        }
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
        const container = document.getElementById('quiz-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #e53e3e;">
                <h3>❌ ${message}</h3>
            </div>
        `;
    }
};

// 同时支持模块导出和全局访问
if (typeof window !== 'undefined') {
    window.QuizRenderer = QuizRenderer;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizRenderer };
}
