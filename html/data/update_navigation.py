#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量更新所有 quiz 文件的 navigation URL"""

import os
import re
from pathlib import Path

def update_file(filepath):
    """更新单个文件中的 URL"""
    try:
        # 读取文件内容
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 替换模式：将 "XX-name-quiz.html" 替换为 "quiz.html?chapter=XX"
        # 匹配格式：两位数字-任意单词字符和连字符-quiz.html
        pattern = r'"(\d{2})-[\w-]+-quiz\.html"'
        replacement = r'"quiz.html?chapter=\1"'
        
        # 执行替换
        new_content = re.sub(pattern, replacement, content)
        
        # 如果内容有变化，写回文件
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                f.write(new_content)
            return True
        return False
    except Exception as e:
        print(f"❌ 处理文件 {filepath} 时出错: {e}")
        return False

def main():
    """主函数"""
    # 获取当前目录
    current_dir = Path(__file__).parent
    
    # 查找所有 quiz-*.js 文件
    quiz_files = sorted(current_dir.glob('quiz-*.js'))
    
    if not quiz_files:
        print("❌ 未找到任何 quiz-*.js 文件")
        return
    
    print(f"📁 找到 {len(quiz_files)} 个文件")
    print("=" * 50)
    
    updated_count = 0
    skipped_count = 0
    
    for filepath in quiz_files:
        filename = filepath.name
        if update_file(filepath):
            print(f"✅ 已更新: {filename}")
            updated_count += 1
        else:
            print(f"⏭️  跳过: {filename} (无需更新)")
            skipped_count += 1
    
    print("=" * 50)
    print(f"✨ 完成！更新了 {updated_count} 个文件，跳过 {skipped_count} 个文件")

if __name__ == '__main__':
    main()
