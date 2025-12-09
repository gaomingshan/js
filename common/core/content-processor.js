/**
 * 通用内容处理器
 * 专注解决各种代码/配置的转义显示问题
 * 
 * 核心功能：
 * 1. 智能识别代码语言类型
 * 2. 恢复数据文件中的转义字符供显示
 * 3. HTML安全转义防止XSS
 * 
 * @version 1.0.0
 */

class ContentProcessor {
    constructor(options = {}) {
        this.options = {
            // 是否启用HTML安全过滤
            sanitize: options.sanitize !== false,
            // 自定义处理器
            customProcessors: options.customProcessors || {},
            ...options
        };
        
        // 初始化处理器映射
        this.processors = this._initProcessors();
    }
    
    /**
     * 初始化内置处理器
     */
    _initProcessors() {
        return {
            javascript: (content) => this._processJavaScript(content),
            js: (content) => this._processJavaScript(content),
            bash: (content) => this._processBash(content),
            shell: (content) => this._processBash(content),
            sh: (content) => this._processBash(content),
            yaml: (content) => this._processYAML(content),
            yml: (content) => this._processYAML(content),
            json: (content) => this._processJSON(content),
            html: (content) => this._processHTML(content),
            css: (content) => this._processCSS(content),
            text: (content) => this._processText(content),
            default: (content) => this._processDefault(content)
        };
    }
    
    /**
     * 主处理入口
     * @param {string} content - 原始内容
     * @param {string} type - 内容类型（js/bash/yaml等）
     */
    process(content, type = 'default') {
        if (!content) return '';
        
        const processor = this.processors[type] || 
                         this.options.customProcessors[type] || 
                         this.processors.default;
        
        try {
            return processor.call(this, content);
        } catch (error) {
            console.error(`[ContentProcessor] 处理失败 (type: ${type}):`, error);
            return this._escapeHTML(content);
        }
    }
    
    /**
     * 批量处理数据对象
     * 自动识别code/html字段并处理
     */
    processObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.processObject(item));
        }
        
        const processed = {};
        for (const key in obj) {
            if (key === 'code' && typeof obj[key] === 'string') {
                // 自动检测或使用指定的语言
                const language = obj.language || this._detectLanguage(obj[key]);
                processed[key] = this.process(obj[key], language);
            } else if (key === 'html' && typeof obj[key] === 'string') {
                processed[key] = this.process(obj[key], 'html');
            } else if (typeof obj[key] === 'object') {
                processed[key] = this.processObject(obj[key]);
            } else {
                processed[key] = obj[key];
            }
        }
        return processed;
    }
    
    // ==================== 具体语言处理器 ====================
    
    /**
     * JavaScript代码处理
     * 恢复模板字符串中的变量显示（兼容旧数据）
     */
    _processJavaScript(content) {
        // 如果使用String.raw，这些转义不会存在
        // 但为了兼容旧数据，仍然处理
        content = content.replace(/\\\${/g, '${');           // \${ → ${
        content = content.replace(/\\\\\\\${/g, '\\${');    // \\\${ → \${ (嵌套)
        
        // HTML转义（防止<>被浏览器解析）
        return this._escapeHTML(content);
    }
    
    /**
     * Bash脚本处理
     * 恢复bash变量和特殊语法（兼容旧数据）
     */
    _processBash(content) {
        // 如果使用String.raw，这些转义不会存在
        // 但为了兼容旧数据，仍然处理
        
        // 1. 恢复bash变量
        content = content.replace(/\\\$([A-Z_][A-Z0-9_]*)/g, '$$$1');  // \$VAR → $VAR
        content = content.replace(/\\\$\{([^}]+)\}/g, '${$1}');       // \${VAR} → ${VAR}
        
        // 2. 恢复GitHub Actions/CI语法
        content = content.replace(/\\\$\{\{/g, '${{');                // \${{ → ${{
        
        // 3. HTML转义
        return this._escapeHTML(content);
    }
    
    /**
     * YAML配置处理
     * 恢复YAML中的变量语法（兼容旧数据）
     */
    _processYAML(content) {
        content = content.replace(/\\\$\{\{/g, '${{');  // GitHub Actions
        content = content.replace(/\\\${/g, '${');      // 普通变量
        return this._escapeHTML(content);
    }
    
    /**
     * JSON数据处理
     * 验证并美化JSON
     */
    _processJSON(content) {
        try {
            const obj = JSON.parse(content);
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return this._escapeHTML(content);
        }
    }
    
    /**
     * HTML内容处理
     */
    _processHTML(content) {
        if (this.options.sanitize && typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(content);
        }
        return this._escapeHTML(content);
    }
    
    /**
     * CSS内容处理
     */
    _processCSS(content) {
        if (this.options.sanitize) {
            content = content.replace(/<script/gi, '&lt;script');
            content = content.replace(/javascript:/gi, '');
        }
        return content;
    }
    
    /**
     * 纯文本处理
     */
    _processText(content) {
        return this._escapeHTML(content);
    }
    
    /**
     * 默认处理器
     * 智能检测类型后处理
     */
    _processDefault(content) {
        const detectedType = this._detectLanguage(content);
        if (detectedType !== 'default') {
            return this.process(content, detectedType);
        }
        
        // 应用通用转义规则（兼容旧数据）
        return this._applyUniversalEscapes(content);
    }
    
    // ==================== 辅助方法 ====================
    
    /**
     * HTML转义
     */
    _escapeHTML(str) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return str.replace(/[&<>"']/g, c => map[c]);
    }
    
    /**
     * 智能检测代码语言
     */
    _detectLanguage(content) {
        const patterns = {
            bash: /^(#!\/bin\/(ba)?sh|npm |pnpm |yarn |apt-get |sudo |echo )/m,
            javascript: /(function |const |let |var |=>|console\.log|import |export )/,
            yaml: /^[a-z_-]+:\s*$/m,
            json: /^\s*[{\[]/,
            html: /<[a-z][\s\S]*>/i,
            css: /{[\s\S]*:[^}]+}/
        };
        
        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(content)) {
                return lang;
            }
        }
        
        return 'default';
    }
    
    /**
     * 通用转义规则（兼容旧数据）
     * 按优先级应用所有常见转义
     */
    _applyUniversalEscapes(content) {
        // 1. Bash变量
        content = content.replace(/\\\$([A-Z_][A-Z0-9_]*)/g, '$$$1');
        
        // 2. GitHub Actions/YAML变量
        content = content.replace(/\\\$\{\{/g, '${{');
        
        // 3. 简单模板字符串
        content = content.replace(/\\\${/g, '${');
        
        // 4. 嵌套模板字符串
        content = content.replace(/\\\\\\\${/g, '\\${');
        
        // 5. HTML转义
        return this._escapeHTML(content);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentProcessor;
} else if (typeof window !== 'undefined') {
    window.ContentProcessor = ContentProcessor;
}
