#!/usr/bin/env node
/**
 * 批量更新所有 quiz 文件的 navigation URL
 */

const fs = require('fs');
const path = require('path');

/**
 * 更新单个文件
 */
function updateFile(filepath) {
    try {
        // 读取文件内容
        const content = fs.readFileSync(filepath, 'utf8');
        
        // 替换模式：将 "XX-name-quiz.html" 替换为 "quiz.html?chapter=XX"
        const pattern = /"(\d{2})-[\w-]+-quiz\.html"/g;
        const newContent = content.replace(pattern, '"quiz.html?chapter=$1"');
        
        // 如果内容有变化，写回文件
        if (newContent !== content) {
            fs.writeFileSync(filepath, newContent, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ 处理文件 ${filepath} 时出错:`, error.message);
        return false;
    }
}

/**
 * 主函数
 */
function main() {
    const currentDir = __dirname;
    
    // 查找所有 quiz-*.js 文件
    const files = fs.readdirSync(currentDir)
        .filter(file => /^quiz-\d{2}\.js$/.test(file))
        .sort();
    
    if (files.length === 0) {
        console.log('❌ 未找到任何 quiz-*.js 文件');
        return;
    }
    
    console.log(`📁 找到 ${files.length} 个文件`);
    console.log('='.repeat(50));
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    files.forEach(file => {
        const filepath = path.join(currentDir, file);
        if (updateFile(filepath)) {
            console.log(`✅ 已更新: ${file}`);
            updatedCount++;
        } else {
            console.log(`⏭️  跳过: ${file} (无需更新)`);
            skippedCount++;
        }
    });
    
    console.log('='.repeat(50));
    console.log(`✨ 完成！更新了 ${updatedCount} 个文件，跳过 ${skippedCount} 个文件`);
}

// 运行主函数
main();
