# String.raw 使用指南

## 🎯 核心优势

使用 `String.raw` 可以让你在 `.js` 数据文件中**零转义**地编写代码示例，无需担心 `${}` 被解析。

---

## 📝 基础用法

### ❌ 旧方式（需要转义）

```javascript
window.content = {
    code: `echo "Size: \${SIZE}MB"`  // 麻烦！需要转义
}
```

### ✅ 新方式（零转义）

```javascript
window.content = {
    code: String.raw`echo "Size: ${SIZE}MB"`  // 完美！直接写
}
```

---

## 🔥 实战示例

### 1. Bash脚本

```javascript
{
    type: "quiz",
    content: {
        code: String.raw`#!/bin/bash

# 性能监控脚本
TIME=$(pnpm install --reporter=json | jq .time)
SIZE=$(du -sm $(pnpm store path) | cut -f1)

if [ $TIME -gt 60 ]; then
    echo "⚠️ Install took ${TIME}s"
fi

if [ $SIZE -gt 5000 ]; then
    echo "⚠️ Store size: ${SIZE}MB"
fi`,
        language: "bash"
    }
}
```

### 2. GitHub Actions YAML

```javascript
{
    type: "quiz",
    content: {
        code: String.raw`name: CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/cache@v3
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          
      - run: pnpm install --frozen-lockfile`,
        language: "yaml"
    }
}
```

### 3. JavaScript模板字符串

```javascript
{
    type: "quiz",
    content: {
        code: String.raw`// 依赖分析脚本
const stats = analyzeDeps();

Object.entries(stats.duplicates)
  .filter(([_, versions]) => versions.length > 1)
  .forEach(([name, versions]) => {
    console.log(\`  ${name}: ${versions.join(', ')}\`)
  })

stats.largest.forEach(({ name, size }) => {
  console.log(\`  ${name}: ${(size / 1024 / 1024).toFixed(2)}MB\`)
})`,
        language: "javascript"
    }
}
```

### 4. 多行复杂脚本

```javascript
{
    type: "quiz",
    content: {
        code: String.raw`#!/bin/bash
# deploy.sh

set -e

APP_NAME=${1:-app}
DEPLOY_DIR=${2:-dist}

echo "🚀 Deploying $APP_NAME..."

# 1. 清理
rm -rf $DEPLOY_DIR

# 2. 构建
pnpm --filter=$APP_NAME run build

# 3. Deploy
pnpm deploy --filter=$APP_NAME --prod $DEPLOY_DIR

# 4. 打包
tar -czf $APP_NAME-$(date +%Y%m%d%H%M%S).tar.gz $DEPLOY_DIR

# 5. 上传
scp $APP_NAME-*.tar.gz server:/opt/deploy/

echo "✅ Deployment complete!"`,
        language: "bash"
    }
}
```

---

## 🔄 迁移步骤

### 步骤1：识别需要迁移的代码块

查找所有包含转义的代码：
- `\${VAR}` → bash变量
- `\${{}}` → GitHub Actions
- `\\\${` → 嵌套模板字符串

### 步骤2：替换为String.raw

```javascript
// 旧代码
code: `echo "Size: \${SIZE}MB"`

// 新代码
code: String.raw`echo "Size: ${SIZE}MB"`
```

### 步骤3：移除所有转义符

```javascript
// 旧代码（quiz-25.js）
code: `#!/bin/bash
TIME=$(pnpm install --reporter=json | jq .time)
if [ $TIME -gt 60 ]; then
  curl -X POST $SLACK_WEBHOOK \
    -d "{'text': '\u26a0\ufe0f  pnpm install took \${TIME}s'}"
fi`

// 新代码（使用String.raw）
code: String.raw`#!/bin/bash
TIME=$(pnpm install --reporter=json | jq .time)
if [ $TIME -gt 60 ]; then
  curl -X POST $SLACK_WEBHOOK \
    -d "{'text': '⚠️  pnpm install took ${TIME}s'}"
fi`
```

---

## ⚠️ 注意事项

### 1. String.raw不处理转义序列

```javascript
// ✅ 正确：保留原始字符
String.raw`C:\Users\path`  // "C:\Users\path"

// ❌ 错误：普通模板字符串会转义
`C:\Users\path`  // "C:Userspath" (错误！)
```

### 2. 仍需HTML转义

ContentProcessor会自动处理HTML转义，你无需担心：

```javascript
code: String.raw`<div>Hello</div>`
// ContentProcessor自动转为: &lt;div&gt;Hello&lt;/div&gt;
```

### 3. 多行字符串

```javascript
// ✅ 推荐：String.raw支持多行
code: String.raw`
line 1
line 2
line 3
`

// ⚠️ 替代方案：数组拼接（简单场景）
code: [
    'line 1',
    'line 2',
    'line 3'
].join('\n')
```

---

## 📊 对比总结

| 特性 | 普通模板字符串 | String.raw | 普通字符串 |
|------|--------------|-----------|----------|
| 多行支持 | ✅ | ✅ | ❌ |
| 变量插值 | ✅ (会解析) | ❌ (保留原样) | ❌ |
| 转义序列 | ✅ (会处理) | ❌ (保留原样) | ✅ (会处理) |
| 适用场景 | 动态内容 | 代码示例 | 简单文本 |

---

## 🎯 最佳实践

### 1. 新内容统一使用String.raw

```javascript
// 所有代码块都用String.raw
{
    topics: [
        {
            content: {
                code: String.raw`...`,
                language: "bash"
            }
        }
    ]
}
```

### 2. 旧内容保持兼容

ContentProcessor会自动处理旧数据的转义，无需立即迁移。

### 3. 添加language字段

```javascript
{
    code: String.raw`...`,
    language: "bash"  // 帮助ContentProcessor识别类型
}
```

---

## 🚀 快速开始

### 创建新quiz文件模板

```javascript
// quiz-XX.js
window.content = {
    section: {
        title: "章节标题",
        icon: "📝"
    },
    topics: [
        {
            type: "quiz",
            title: "题目标题",
            content: {
                questionType: "single",
                difficulty: "medium",
                tags: ["标签1", "标签2"],
                question: "问题描述",
                options: ["选项A", "选项B", "选项C", "选项D"],
                correctAnswer: 0,
                explanation: {
                    title: "解析标题",
                    description: "解析内容",
                    sections: [
                        {
                            title: "代码示例",
                            code: String.raw`#!/bin/bash
# 直接写，零转义！
echo "Value: ${VAR}"
if [ $COUNT -gt 10 ]; then
    echo "Large: $COUNT"
fi`,
                            language: "bash"
                        }
                    ]
                }
            }
        }
    ],
    navigation: {
        prev: { title: "上一章", url: "..." },
        next: { title: "下一章", url: "..." }
    }
};
```

---

## ✅ 总结

使用 `String.raw` 的优势：
- ✅ **零转义**：直接复制粘贴代码
- ✅ **可读性强**：代码保持原始格式
- ✅ **易维护**：无需记忆复杂的转义规则
- ✅ **兼容性好**：ContentProcessor自动处理旧数据
- ✅ **编辑器友好**：语法高亮正常工作

**建议**：所有新内容都使用 `String.raw`，旧内容可选择性迁移。
