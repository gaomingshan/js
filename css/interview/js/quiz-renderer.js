/**
 * CSS面试题渲染引擎
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
        document.title = config.title + ' - CSS 面试题';
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
     * 渲染单个题目 - 支持多种题型
     */
    renderQuestion(question, number) {
        const type = question.type || 'single-choice'; // 默认单选题
        
        // 根据题型渲染
        switch(type) {
            case 'multiple-choice':
                return this.renderMultipleChoice(question, number);
            case 'code-output':
                return this.renderCodeOutput(question, number);
            case 'true-false':
                return this.renderTrueFalse(question, number);
            case 'code-completion':
                return this.renderCodeCompletion(question, number);
            case 'single-choice':
            default:
                return this.renderSingleChoice(question, number);
        }
    },

    /**
     * 渲染单选题
     */
    renderSingleChoice(question, number) {
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        
        const diff = difficultyMap[question.difficulty] || difficultyMap.medium;
        
        return `
            <div class="quiz-item" data-question="${number}" data-type="single-choice">
                <div class="quiz-item-header">
                    <span class="difficulty ${diff.class}">${diff.icon} ${diff.text}</span>
                    <span class="tag">📝 单选题</span>
                    ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="question">Q${number}: ${question.question}</div>
                <div class="options">
                    ${question.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        return `<div class="option" data-answer="${letter}">
                            <strong>${letter}.</strong> ${opt}
                        </div>`;
                    }).join('')}
                </div>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="QuizRenderer.checkAnswer(${number})">提交答案</button>
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
     * 渲染多选题
     */
    renderMultipleChoice(question, number) {
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        
        const diff = difficultyMap[question.difficulty] || difficultyMap.medium;
        const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
        
        return `
            <div class="quiz-item" data-question="${number}" data-type="multiple-choice">
                <div class="quiz-item-header">
                    <span class="difficulty ${diff.class}">${diff.icon} ${diff.text}</span>
                    <span class="tag">☑️ 多选题</span>
                    ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="question">Q${number}: ${question.question}</div>
                <div class="tip" style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">💡 提示：请选择所有正确答案</div>
                <div class="options" data-multiple="true">
                    ${question.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        return `<div class="option" data-answer="${letter}">
                            <input type="checkbox" id="q${number}-${letter}" style="margin-right: 8px;">
                            <label for="q${number}-${letter}"><strong>${letter}.</strong> ${opt}</label>
                        </div>`;
                    }).join('')}
                </div>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="QuizRenderer.checkAnswer(${number})">提交答案</button>
                    <button class="btn btn-secondary" onclick="QuizRenderer.showAnswer(${number})">查看解析</button>
                </div>
                <div class="answer-section" id="answer-${number}">
                    <div class="answer-label">✅ 正确答案：${correctAnswers.join(', ')}</div>
                    <div class="explanation">
                        ${this.renderExplanation(question.explanation)}
                    </div>
                    ${question.source ? `<span class="source-tag">📌 来源：${question.source}</span>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * 渲染代码输出题
     */
    renderCodeOutput(question, number) {
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        
        const diff = difficultyMap[question.difficulty] || difficultyMap.medium;
        
        return `
            <div class="quiz-item" data-question="${number}" data-type="code-output">
                <div class="quiz-item-header">
                    <span class="difficulty ${diff.class}">${diff.icon} ${diff.text}</span>
                    <span class="tag">💻 代码输出题</span>
                    ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="question">Q${number}: ${question.question}</div>
                ${question.code ? `<div class="code-block">${this.escapeHtml(question.code)}</div>` : ''}
                <div class="options">
                    ${question.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        return `<div class="option" data-answer="${letter}">
                            <strong>${letter}.</strong> <code>${opt}</code>
                        </div>`;
                    }).join('')}
                </div>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="QuizRenderer.checkAnswer(${number})">提交答案</button>
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
     * 渲染判断题
     */
    renderTrueFalse(question, number) {
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        
        const diff = difficultyMap[question.difficulty] || difficultyMap.medium;
        
        return `
            <div class="quiz-item" data-question="${number}" data-type="true-false">
                <div class="quiz-item-header">
                    <span class="difficulty ${diff.class}">${diff.icon} ${diff.text}</span>
                    <span class="tag">✔️ 判断题</span>
                    ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="question">Q${number}: ${question.question}</div>
                ${question.code ? `<div class="code-block">${this.escapeHtml(question.code)}</div>` : ''}
                <div class="options">
                    <div class="option" data-answer="A">
                        <strong>A.</strong> ✅ 正确
                    </div>
                    <div class="option" data-answer="B">
                        <strong>B.</strong> ❌ 错误
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="QuizRenderer.checkAnswer(${number})">提交答案</button>
                    <button class="btn btn-secondary" onclick="QuizRenderer.showAnswer(${number})">查看解析</button>
                </div>
                <div class="answer-section" id="answer-${number}">
                    <div class="answer-label">✅ 正确答案：${question.correctAnswer === 'A' ? '✅ 正确' : '❌ 错误'}</div>
                    <div class="explanation">
                        ${this.renderExplanation(question.explanation)}
                    </div>
                    ${question.source ? `<span class="source-tag">📌 来源：${question.source}</span>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * 渲染代码补全题
     */
    renderCodeCompletion(question, number) {
        const difficultyMap = {
            'easy': { class: 'easy', icon: '🟢', text: '简单' },
            'medium': { class: 'medium', icon: '🟡', text: '中等' },
            'hard': { class: 'hard', icon: '🔴', text: '困难' }
        };
        
        const diff = difficultyMap[question.difficulty] || difficultyMap.medium;
        
        return `
            <div class="quiz-item" data-question="${number}" data-type="code-completion">
                <div class="quiz-item-header">
                    <span class="difficulty ${diff.class}">${diff.icon} ${diff.text}</span>
                    <span class="tag">🔧 代码补全题</span>
                    ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <div class="question">Q${number}: ${question.question}</div>
                ${question.code ? `<div class="code-block">${this.escapeHtml(question.code)}</div>` : ''}
                <div class="options">
                    ${question.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        return `<div class="option" data-answer="${letter}">
                            <strong>${letter}.</strong> <code>${opt}</code>
                        </div>`;
                    }).join('')}
                </div>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="QuizRenderer.checkAnswer(${number})">提交答案</button>
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
        
        html += `<a href="index.html" class="nav-link home">📋 面试题导航</a>`;
        
        if (navigation.next) {
            html += `<a href="${navigation.next.url}" class="nav-link next">下一节：${navigation.next.title} ➡️</a>`;
        }
        
        navContainer.innerHTML = html;
    },

    /**
     * 附加事件监听器 - 支持单选和多选
     */
    attachEventListeners() {
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                const parent = this.closest('.quiz-item');
                const isMultiple = parent.dataset.type === 'multiple-choice';
                
                if (isMultiple) {
                    // 多选题：切换checkbox
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        this.classList.toggle('selected', checkbox.checked);
                    }
                } else {
                    // 单选题：互斥选择
                    parent.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                }
            });
        });
    },

    /**
     * 检查答案 - 支持单选和多选
     */
    checkAnswer(questionNum) {
        const quizItem = document.querySelector(`[data-question="${questionNum}"]`);
        const type = quizItem.dataset.type || 'single-choice';
        const question = this.data.questions[questionNum - 1];
        const correctAnswer = question.correctAnswer;
        
        let userAnswer;
        let isCorrect = false;
        
        if (type === 'multiple-choice') {
            // 多选题
            const selectedOptions = quizItem.querySelectorAll('.option input:checked');
            if (selectedOptions.length === 0) {
                alert('请至少选择一个答案！');
                return;
            }
            
            userAnswer = Array.from(selectedOptions).map(input => 
                input.closest('.option').dataset.answer
            ).sort();
            
            const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer.sort() : [correctAnswer].sort();
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswers);
            
            // 标记正确和错误的选项
            quizItem.querySelectorAll('.option').forEach(opt => {
                opt.style.pointerEvents = 'none';
                const answer = opt.dataset.answer;
                if (correctAnswers.includes(answer)) {
                    opt.classList.add('correct');
                }
                if (userAnswer.includes(answer) && !correctAnswers.includes(answer)) {
                    opt.classList.add('wrong');
                }
            });
            
            alert(isCorrect ? '✅ 回答正确！' : `❌ 回答错误，正确答案是 ${correctAnswers.join(', ')}`);
            
        } else {
            // 单选题
            const selectedOption = quizItem.querySelector('.option.selected');
            
            if (!selectedOption) {
                alert('请先选择一个答案！');
                return;
            }
            
            userAnswer = selectedOption.dataset.answer;
            isCorrect = userAnswer === correctAnswer;
            
            // 禁用所有选项
            quizItem.querySelectorAll('.option').forEach(opt => {
                opt.style.pointerEvents = 'none';
                if (opt.dataset.answer === correctAnswer) {
                    opt.classList.add('correct');
                } else if (opt === selectedOption) {
                    opt.classList.add('wrong');
                }
            });
            
            alert(isCorrect ? '✅ 回答正确！' : '❌ 回答错误，正确答案是 ' + correctAnswer);
        }
        
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
