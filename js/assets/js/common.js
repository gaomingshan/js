// 公共功能模块

// 代码执行器
class CodeRunner {
    constructor(outputElement) {
        this.output = outputElement;
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };
    }

    // 重写console方法
    captureConsole() {
        const self = this;
        
        console.log = function(...args) {
            self.addOutput('log', args);
            self.originalConsole.log.apply(console, args);
        };
        
        console.error = function(...args) {
            self.addOutput('error', args);
            self.originalConsole.error.apply(console, args);
        };
        
        console.warn = function(...args) {
            self.addOutput('warn', args);
            self.originalConsole.warn.apply(console, args);
        };
        
        console.info = function(...args) {
            self.addOutput('info', args);
            self.originalConsole.info.apply(console, args);
        };
    }

    // 恢复console
    restoreConsole() {
        console.log = this.originalConsole.log;
        console.error = this.originalConsole.error;
        console.warn = this.originalConsole.warn;
        console.info = this.originalConsole.info;
    }

    // 添加输出
    addOutput(type, args) {
        const line = document.createElement('div');
        line.className = `output-line ${type}`;
        
        const formatted = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
        
        line.textContent = formatted;
        this.output.appendChild(line);
    }

    // 清空输出
    clear() {
        this.output.innerHTML = '';
    }

    // 执行代码
    run(code) {
        this.clear();
        this.captureConsole();
        
        try {
            // 使用Function构造器执行代码
            const fn = new Function(code);
            const result = fn();
            
            // 如果有返回值，显示它
            if (result !== undefined) {
                this.addOutput('log', ['返回值:', result]);
            }
        } catch (error) {
            this.addOutput('error', [error.message]);
            console.error(error);
        } finally {
            this.restoreConsole();
        }
    }
}

// 初始化所有代码示例
function initCodeExamples() {
    const examples = document.querySelectorAll('.code-example');
    
    examples.forEach((example, index) => {
        const runBtn = example.querySelector('.run-btn');
        const codeBlock = example.querySelector('.code-block code');
        const output = example.querySelector('.output');
        
        if (runBtn && codeBlock && output) {
            const runner = new CodeRunner(output);
            
            runBtn.addEventListener('click', () => {
                const code = codeBlock.textContent;
                runner.run(code);
            });
        }
    });
}

// 代码高亮（简单实现）
function highlightCode() {
    const codeBlocks = document.querySelectorAll('.code-block code');
    
    codeBlocks.forEach(block => {
        let html = block.textContent;
        
        // 关键字
        const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 
                         'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
                         'class', 'extends', 'constructor', 'new', 'this', 'super',
                         'async', 'await', 'try', 'catch', 'finally', 'throw',
                         'import', 'export', 'default', 'from', 'typeof', 'instanceof'];
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            html = html.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        
        // 字符串
        html = html.replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>');
        
        // 注释
        html = html.replace(/\/\/(.*?)$/gm, '<span class="comment">//$1</span>');
        html = html.replace(/\/\*(.*?)\*\//gs, '<span class="comment">/*$1*/</span>');
        
        // 数字
        html = html.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        
        block.innerHTML = html;
    });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initCodeExamples();
        // highlightCode(); // 暂时禁用，因为会影响代码执行
    });
} else {
    initCodeExamples();
    // highlightCode();
}
