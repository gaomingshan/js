# 安装一致性保障

## 锁文件的强制使用

### 为什么需要锁文件？

**问题场景**：
```json
// package.json
{
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

**不同时间安装的结果**：
```
2023-01-01: react@18.2.0
2023-06-01: react@18.2.5 (新补丁)
2023-12-01: react@18.3.0 (新次版本)
```

**后果**：
- 开发环境与生产环境不一致
- 团队成员依赖版本不同
- CI 构建结果不可预测

### 锁文件的作用

**npm (package-lock.json)**：
```json
{
  "name": "my-app",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/react": {
      "version": "18.2.0",
      "resolved": "https://registry.npmjs.org/react/-/react-18.2.0.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

**保证**：
- 精确版本：18.2.0（不是 18.2.5）
- 精确 URL
- checksum 验证

---

## CI 环境的一致性检查

### npm ci 命令

**npm install vs npm ci**：

| 特性 | npm install | npm ci |
|------|------------|--------|
| 修改 lockfile | 可能 | 不会 |
| 使用 package.json | 优先 | 仅验证 |
| 删除 node_modules | 否 | 是 |
| 性能 | 较慢 | 更快 |
| 适用场景 | 开发环境 | CI/生产 |

**npm ci 工作流程**：
```bash
npm ci

# 1. 检查 package-lock.json 是否存在
# 如果不存在 → Error

# 2. 检查 package-lock.json 和 package.json 是否一致
# 如果不一致 → Error

# 3. 删除现有 node_modules
rm -rf node_modules

# 4. 严格按照 lockfile 安装
# 不会更新 lockfile

# 5. 如果 integrity 不匹配 → Error
```

### CI 配置示例

**GitHub Actions**：
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci  # ✅ 使用 npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

**GitLab CI**：
```yaml
test:
  image: node:18
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
  script:
    - npm ci
    - npm test
```

---

## frozen-lockfile 参数

### 不同包管理器的实现

**npm**：
```bash
npm ci  # 隐式 frozen
npm install --package-lock-only  # 只更新 lockfile，不安装
```

**Yarn**：
```bash
yarn install --frozen-lockfile

# 效果：
# 1. lockfile 必须存在
# 2. lockfile 与 package.json 必须一致
# 3. 不会修改 lockfile
# 4. 版本不匹配时报错
```

**pnpm**：
```bash
pnpm install --frozen-lockfile

# 等价于
pnpm install --lockfile-only  # 只更新 lockfile
```

### 错误处理

**版本不匹配错误**：
```bash
pnpm install --frozen-lockfile

# Error: 
# ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" 
# because pnpm-lock.yaml is not up to date with package.json
# 
# Note: your lockfile may contain invalid data. Run this command with 
# --no-frozen-lockfile to fix it.
```

**解决方案**：
```bash
# 本地开发（允许更新 lockfile）
pnpm install

# 提交更新后的 lockfile
git add pnpm-lock.yaml
git commit -m "Update lockfile"

# CI 再次运行（不会报错）
pnpm install --frozen-lockfile
```

---

## 跨团队协作规范

### package.json 规范

**强制引擎版本**：
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "engineStrict": true
}
```

**指定包管理器**：
```json
{
  "packageManager": "pnpm@8.6.0"
}
```

**效果**：
```bash
# 使用 npm 安装
npm install
# Warning: This project requires pnpm@8.6.0

# 使用正确版本
corepack enable
pnpm install  # ✅
```

### pre-commit 检查

**Husky 配置**：
```bash
# 安装 Husky
npm install --save-dev husky
npx husky install

# 添加 pre-commit 钩子
npx husky add .husky/pre-commit "npm run validate:deps"
```

**验证脚本**：
```json
// package.json
{
  "scripts": {
    "validate:deps": "npm run check:lockfile && npm run check:engines",
    "check:lockfile": "npx lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm",
    "check:engines": "npx check-engine"
  }
}
```

**lockfile-lint 配置**：
```bash
npx lockfile-lint \
  --path package-lock.json \
  --validate-https \
  --allowed-hosts npm registry.npmjs.org
```

### .npmrc 团队配置

**提交到 Git 的配置**：
```
# .npmrc
engine-strict=true
save-exact=true
package-lock=true
```

**不提交的配置**（.npmrc.local）：
```
# .npmrc.local
registry=https://registry.npmmirror.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

**.gitignore**：
```
.npmrc.local
```

---

## 常见误区

### 误区 1：lockfile 可以不提交

**错误做法**：
```bash
# .gitignore
package-lock.json  # ❌
```

**后果**：
```
开发者 A: lodash@4.17.20
开发者 B: lodash@4.17.21
CI:       lodash@4.17.22
```

**正确做法**：
```bash
# 提交 lockfile
git add package-lock.json
git commit -m "Add lockfile"
```

### 误区 2：锁文件冲突时删除重建

**错误处理**：
```bash
# Git 冲突
git merge feature
# CONFLICT in package-lock.json

# 错误做法
rm package-lock.json
npm install  # ❌ 可能产生不同结果
```

**正确处理**：
```bash
# 方案 1：接受一方的 package.json，重新生成
git checkout --theirs package.json
rm package-lock.json
npm install

# 方案 2：使用合并工具
npx npm-merge-driver install
git merge feature  # 自动合并

# 方案 3：手动解决冲突后
npm install --package-lock-only
```

### 误区 3：CI 使用 npm install

**错误配置**：
```yaml
# ❌ 错误
- run: npm install
```

**问题**：
- 可能更新依赖
- 忽略 lockfile 验证
- 不一致性

**正确配置**：
```yaml
# ✅ 正确
- run: npm ci

# 或（其他包管理器）
- run: yarn install --frozen-lockfile
- run: pnpm install --frozen-lockfile
```

---

## 工程实践

### 场景 1：新成员入职流程

**文档（README.md）**：
```markdown
## 开发环境设置

### 前置要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装步骤
\`\`\`bash
# 1. 克隆仓库
git clone https://github.com/my-org/my-app.git
cd my-app

# 2. 启用 Corepack（Node.js 16.9+）
corepack enable

# 3. 安装依赖（严格使用 lockfile）
pnpm install --frozen-lockfile

# 4. 验证
pnpm test
\`\`\`

### 常见问题
**Q: lockfile 过时错误？**
A: 不要修改 lockfile，请联系团队成员
```

**自动化检查**：
```bash
# 创建 setup 脚本
cat > setup.sh << 'EOF'
#!/bin/bash
set -e

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [ "$(printf '%s\n' "18.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "18.0.0" ]; then
  echo "Error: Node.js >= 18.0.0 required"
  exit 1
fi

# 检查包管理器
if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  corepack enable
fi

# 安装依赖
pnpm install --frozen-lockfile

echo "Setup complete!"
EOF

chmod +x setup.sh
```

### 场景 2：多环境部署

**开发环境**：
```bash
# 允许更新 lockfile
npm install
```

**测试环境**：
```bash
# 严格使用 lockfile
npm ci
```

**生产环境**：
```bash
# 严格使用 lockfile + 只安装生产依赖
npm ci --omit=dev

# 或
npm ci --production
```

**Docker 构建**：
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json ./

# 严格安装
RUN npm ci --omit=dev

# 复制源代码
COPY . .

# 构建
RUN npm run build

CMD ["npm", "start"]
```

### 场景 3：Monorepo 一致性

**问题**：多个子包的依赖版本不一致

**检测工具（syncpack）**：
```bash
# 安装
npm install -D syncpack

# 检查不一致
npx syncpack list-mismatches

# 输出示例：
# react
# ├─ 18.2.0 in packages/web
# └─ 18.1.0 in packages/admin

# 自动修复
npx syncpack fix-mismatches
```

**配置（.syncpackrc.json）**：
```json
{
  "source": ["package.json", "packages/*/package.json"],
  "semverGroups": [
    {
      "range": "",
      "dependencies": ["react", "react-dom"],
      "packages": ["**"]
    }
  ],
  "versionGroups": [
    {
      "label": "Use exact versions for core libraries",
      "dependencies": ["react", "next"],
      "pinVersion": "18.2.0"
    }
  ]
}
```

**CI 检查**：
```yaml
- name: Check dependency consistency
  run: npx syncpack list-mismatches
```

---

## 深入一点

### lockfile 的 determinism 保证

**决定性安装的数学定义**：
```
∀ t1, t2 ∈ Time, ∀ e1, e2 ∈ Environment,
  install(package.json, lockfile, t1, e1) = 
  install(package.json, lockfile, t2, e2)
```

**实现机制**：
```javascript
function deterministicInstall(packageJson, lockfile) {
  // 1. 验证 lockfile 完整性
  validateLockfile(lockfile);
  
  // 2. 严格按照 lockfile 安装
  for (const [name, spec] of Object.entries(lockfile.packages)) {
    const { version, resolved, integrity } = spec;
    
    // 3. 精确版本、URL、checksum
    const tarball = await download(resolved);
    
    if (calculateIntegrity(tarball) !== integrity) {
      throw new Error('Integrity mismatch');
    }
    
    install(name, version, tarball);
  }
}
```

### CI 环境的隔离性

**容器化保证**：
```dockerfile
# 每次 CI 都是全新环境
FROM node:18-alpine

# 无遗留文件
# 无缓存污染
# 完全可复现
```

**缓存策略**：
```yaml
# GitHub Actions
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    
# 缓存键基于 lockfile
# lockfile 变化 → 缓存失效 → 重新下载
```

### 不同包管理器的一致性对比

**npm**：
```
package-lock.json (lockfileVersion 3)
├─ 精确版本
├─ resolved URL
└─ integrity checksum

npm ci: 严格验证
```

**Yarn**：
```
yarn.lock
├─ 精确版本
├─ resolved URL
└─ integrity checksum

yarn install --frozen-lockfile: 严格验证
```

**pnpm**：
```
pnpm-lock.yaml
├─ 精确版本
├─ resolution (tarball + integrity)
└─ 依赖图

pnpm install --frozen-lockfile: 严格验证 + 严格隔离
```

**一致性保证强度**：
```
pnpm > Yarn Berry PnP > Yarn Classic ≈ npm
```

---

## 参考资料

- [npm ci 文档](https://docs.npmjs.com/cli/v9/commands/npm-ci)
- [lockfile-lint](https://github.com/lirantal/lockfile-lint)
- [syncpack](https://github.com/JamieMason/syncpack)
- [Corepack](https://nodejs.org/api/corepack.html)
