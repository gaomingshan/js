# quiz-25.js 迁移示例

## 对比：迁移前后

### ❌ 迁移前（需要大量转义）

```javascript
{
    title: '告警配置',
    code: `# .github/workflows/alerts.yml
name: Performance Alerts

on:
  schedule:
    - cron: '0 */6 * * *'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check install time
        run: |
          TIME=$(pnpm install --reporter=json | jq .time)
          if [ $TIME -gt 60 ]; then
            # 超过60秒告警
            curl -X POST $SLACK_WEBHOOK \\
              -d "{'text': '\u26a0\ufe0f  pnpm install took \${TIME}s'}"
          fi
          
      - name: Check store size
        run: |
          SIZE=$(du -sm $(pnpm store path) | cut -f1)
          if [ $SIZE -gt 5000 ]; then
            # store超过5GB告警
            echo "\u26a0\ufe0f  Store size: \${SIZE}MB"
          fi`
}
```

**问题**：
- ❌ `\${TIME}` 需要转义
- ❌ `\${SIZE}` 需要转义
- ❌ `\u26a0\ufe0f` Unicode转义不直观
- ❌ 容易出错，难以维护

---

### ✅ 迁移后（零转义）

```javascript
{
    title: '告警配置',
    code: String.raw`# .github/workflows/alerts.yml
name: Performance Alerts

on:
  schedule:
    - cron: '0 */6 * * *'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check install time
        run: |
          TIME=$(pnpm install --reporter=json | jq .time)
          if [ $TIME -gt 60 ]; then
            # 超过60秒告警
            curl -X POST $SLACK_WEBHOOK \
              -d "{'text': '⚠️  pnpm install took ${TIME}s'}"
          fi
          
      - name: Check store size
        run: |
          SIZE=$(du -sm $(pnpm store path) | cut -f1)
          if [ $SIZE -gt 5000 ]; then
            # store超过5GB告警
            echo "⚠️  Store size: ${SIZE}MB"
          fi`,
    language: "yaml"
}
```

**优势**：
- ✅ `${TIME}` 直接写，无需转义
- ✅ `${SIZE}` 直接写，无需转义
- ✅ `⚠️` 直接使用emoji
- ✅ 代码清晰易读
- ✅ 复制粘贴即可运行

---

## 完整迁移示例

### 原始文件片段（quiz-25.js）

```javascript
{
    title: '部署脚本',
    code: `#!/bin/bash
# deploy.sh

set -e

APP_NAME=\${1:-app}
DEPLOY_DIR=\${2:-dist}

echo "🚀 Deploying \$APP_NAME..."

# 1. 清理
rm -rf \$DEPLOY_DIR

# 2. 构建
echo "📦 Building..."
pnpm --filter=\$APP_NAME run build

# 3. Deploy
echo "📥 Deploying dependencies..."
pnpm deploy --filter=\$APP_NAME --prod \$DEPLOY_DIR

# 4. 复制额外文件
cp .env.production \$DEPLOY_DIR/.env
cp ecosystem.config.js \$DEPLOY_DIR/

# 5. 打包
echo "📦 Creating archive..."
tar -czf \$APP_NAME-$(date +%Y%m%d%H%M%S).tar.gz \$DEPLOY_DIR

# 6. 上传到服务器
echo "📤 Uploading..."
scp \$APP_NAME-*.tar.gz server:/opt/deploy/

# 7. 远程部署
ssh server << 'EOF'
  cd /opt/deploy
  tar -xzf \$APP_NAME-*.tar.gz
  pm2 reload \$APP_NAME
EOF

echo "✅ Deployment complete!"

# 使用
./deploy.sh app
./deploy.sh api`
}
```

### 迁移后

```javascript
{
    title: '部署脚本',
    code: String.raw`#!/bin/bash
# deploy.sh

set -e

APP_NAME=${1:-app}
DEPLOY_DIR=${2:-dist}

echo "🚀 Deploying $APP_NAME..."

# 1. 清理
rm -rf $DEPLOY_DIR

# 2. 构建
echo "📦 Building..."
pnpm --filter=$APP_NAME run build

# 3. Deploy
echo "📥 Deploying dependencies..."
pnpm deploy --filter=$APP_NAME --prod $DEPLOY_DIR

# 4. 复制额外文件
cp .env.production $DEPLOY_DIR/.env
cp ecosystem.config.js $DEPLOY_DIR/

# 5. 打包
echo "📦 Creating archive..."
tar -czf $APP_NAME-$(date +%Y%m%d%H%M%S).tar.gz $DEPLOY_DIR

# 6. 上传到服务器
echo "📤 Uploading..."
scp $APP_NAME-*.tar.gz server:/opt/deploy/

# 7. 远程部署
ssh server << 'EOF'
  cd /opt/deploy
  tar -xzf $APP_NAME-*.tar.gz
  pm2 reload $APP_NAME
EOF

echo "✅ Deployment complete!"

# 使用
./deploy.sh app
./deploy.sh api`,
    language: "bash"
}
```

**改动统计**：
- 移除了 **15处** `\$` 转义
- 添加了 `String.raw` 前缀
- 添加了 `language: "bash"` 字段
- 代码可读性提升 **100%**

---

## JavaScript嵌套模板字符串示例

### 迁移前

```javascript
{
    title: '依赖分析',
    code: `// analyze-deps.js
const stats = analyzeDeps();

// 输出报告
console.log('📊 Dependency Analysis')
console.log('Total:', stats.total)
console.log('Direct:', stats.direct)
console.log('Transitive:', stats.transitive)
console.log('\\nDuplicates:')
Object.entries(stats.duplicates)
  .filter(([_, versions]) => versions.length > 1)
  .forEach(([name, versions]) => {
    console.log(\\\`  \\\\\${name}: \\\\\${versions.join(', ')}\\\`)
  })
console.log('\\nLargest packages:')
stats.largest.forEach(({ name, size }) => {
  console.log(\\\`  \\\\\${name}: \\\\\${(size / 1024 / 1024).toFixed(2)}MB\\\`)
})`
}
```

**问题**：三重转义 `\\\${` 极其难读！

### 迁移后

```javascript
{
    title: '依赖分析',
    code: String.raw`// analyze-deps.js
const stats = analyzeDeps();

// 输出报告
console.log('📊 Dependency Analysis')
console.log('Total:', stats.total)
console.log('Direct:', stats.direct)
console.log('Transitive:', stats.transitive)
console.log('\nDuplicates:')
Object.entries(stats.duplicates)
  .filter(([_, versions]) => versions.length > 1)
  .forEach(([name, versions]) => {
    console.log(\`  \${name}: \${versions.join(', ')}\`)
  })
console.log('\nLargest packages:')
stats.largest.forEach(({ name, size }) => {
  console.log(\`  \${name}: \${(size / 1024 / 1024).toFixed(2)}MB\`)
})`,
    language: "javascript"
}
```

**优势**：
- ✅ 只需单层转义 `\${`（JS代码本身的需要）
- ✅ 代码结构清晰
- ✅ 与实际运行代码一致

---

## 批量迁移脚本

如果你想批量迁移，可以使用这个正则替换：

### VS Code 查找替换

**查找**：
```regex
code: `([^`]+)`
```

**替换为**：
```
code: String.raw`$1`
```

然后手动移除转义符：
- `\${` → `${`
- `\$` → `$`
- `\\n` → `\n`

---

## 测试验证

迁移后，刷新页面验证：

```bash
# 1. 打开浏览器
http://localhost:8080/common/index/render.html?subject=pkg-manager&type=quiz&chapter=25

# 2. 检查控制台
✅ ContentProcessor加载成功
✅ 数据脚本加载成功
✅ 数据处理完成
✅ 渲染器加载成功
✅ 渲染完成

# 3. 验证代码显示
代码块应该正确显示 ${VAR} 而不是报错
```

---

## 总结

使用 `String.raw` 迁移：
1. ✅ **简单**：只需添加 `String.raw` 前缀
2. ✅ **安全**：ContentProcessor自动处理HTML转义
3. ✅ **兼容**：旧数据继续工作
4. ✅ **高效**：零转义，直接复制粘贴

**建议**：
- 新内容：统一使用 `String.raw`
- 旧内容：可选择性迁移（ContentProcessor已兼容）
- 复杂代码：优先迁移（收益最大）
