# package-lock.json 的设计与作用

## 锁文件的诞生背景

### 问题场景

**2016 年之前**，没有锁文件时：

```json
// package.json
{
  "dependencies": {
    "lodash": "^4.17.0"
  }
}
```

**时间点 T1**（2020-01-01）：
```
npm install
→ 安装 lodash@4.17.15
```

**时间点 T2**（2020-06-01）：
```
npm install  (同一个 package.json)
→ 安装 lodash@4.17.19  (新版本发布)
```

**后果**：
- 团队成员的依赖版本不一致
- CI 环境每次构建结果不同
- "在我机器上可以运行"

### Yarn 的创新（2016）

**yarn.lock 率先引入**：
```yaml
lodash@^4.17.0:
  version "4.17.15"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.15.tgz"
  integrity sha512-...
```

**npm 的跟进**（npm 5, 2017）：
```json
// package-lock.json
{
  "lodash": {
    "version": "4.17.15",
    "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.15.tgz",
    "integrity": "sha512-..."
  }
}
```

---

## lockfileVersion 演进

### lockfileVersion 1（npm 5-6）

**结构**：
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 1,
  "dependencies": {
    "express": {
      "version": "4.18.0",
      "resolved": "https://...",
      "integrity": "sha512-...",
      "requires": {
        "body-parser": "1.20.0"
      }
    },
    "body-parser": {
      "version": "1.20.0",
      "resolved": "https://...",
      "integrity": "sha512-..."
    }
  }
}
```

**特点**：
- 扁平化表示
- 所有包在同一层级
- 无法表达嵌套依赖的实际位置

### lockfileVersion 2（npm 7-8）

**结构**：
```json
{
  "lockfileVersion": 2,
  "packages": {
    "": {
      "dependencies": {
        "express": "^4.18.0"
      }
    },
    "node_modules/express": {
      "version": "4.18.0",
      "resolved": "https://...",
      "integrity": "sha512-...",
      "dependencies": {
        "body-parser": "1.20.0"
      }
    },
    "node_modules/body-parser": {
      "version": "1.20.0",
      "resolved": "https://...",
      "integrity": "sha512-..."
    }
  }
}
```

**改进**：
- **精确映射 node_modules 结构**
- 支持嵌套依赖的准确表示
- 同时保留 v1 格式（向后兼容）

### lockfileVersion 3（npm 9+）

**优化**：
```json
{
  "lockfileVersion": 3,
  "packages": {
    "node_modules/express": {
      "version": "4.18.0",
      "resolved": "https://...",
      "integrity": "sha512-..."
    }
  }
}
```

**变化**：
- 移除冗余的 v1 格式
- 文件体积减少约 50%
- 解析速度提升

---

## 确定性安装的保障机制

### integrity 字段

**SHA-512 校验和**：
```json
{
  "integrity": "sha512-abc123...xyz789"
}
```

**验证流程**：
```javascript
function verifyPackage(tarball, expectedIntegrity) {
  const actualHash = crypto.createHash('sha512')
    .update(tarball)
    .digest('base64');
  
  const actual = `sha512-${actualHash}`;
  
  if (actual !== expectedIntegrity) {
    throw new Error('Integrity check failed!');
  }
}
```

**防护**：
- 防止中间人攻击
- 检测 tarball 损坏
- 确保缓存有效性

### resolved 字段

**完整 URL**：
```json
{
  "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz"
}
```

**作用**：
- 精确指定下载源
- 支持私有 registry
- 避免 registry 切换导致的差异

### version 精确锁定

**package.json**：
```json
{
  "dependencies": {
    "react": "^18.2.0"  // 范围
  }
}
```

**package-lock.json**：
```json
{
  "node_modules/react": {
    "version": "18.2.0"  // 精确版本
  }
}
```

**保证**：
- 无论何时安装，都是 18.2.0
- 不会自动升级到 18.2.1

---

## 锁文件冲突的解决策略

### 冲突产生原因

**场景**：
```bash
# 分支 A
git checkout feature-a
npm install axios@1.2.0
git add package-lock.json
git commit -m "Add axios"

# 分支 B
git checkout feature-b
npm install axios@1.3.0
git add package-lock.json
git commit -m "Add axios"

# 合并
git merge feature-a
# CONFLICT in package-lock.json
```

### 解决方案 1：重新安装

**步骤**：
```bash
# 1. 接受某一方的 package.json
git checkout --theirs package.json

# 2. 删除锁文件
rm package-lock.json

# 3. 重新生成
npm install

# 4. 提交
git add package.json package-lock.json
git commit -m "Resolve conflict"
```

**适用**：简单冲突

### 解决方案 2：手动合并

**工具**：
```bash
# 使用 npm 的合并工具
npx npm-merge-driver install

# Git 配置
git config merge.npm-merge-driver.name "npm lockfile merge driver"
git config merge.npm-merge-driver.driver "npx npm-merge-driver merge %A %O %B %P"
```

**.gitattributes**：
```
package-lock.json merge=npm-merge-driver
```

**效果**：自动合并锁文件

### 解决方案 3：使用 Yarn

**优势**：
```yaml
# yarn.lock 的合并友好设计
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://..."

lodash@^4.16.0:
  version "4.17.21"  # 多个约束指向同一版本
  resolved "https://..."
```

**冲突更少，更易合并**

---

## 常见误区

### 误区 1：锁文件应该加入 .gitignore

**错误做法**：
```bash
# .gitignore
package-lock.json  # ❌
```

**后果**：
- 失去确定性安装的保障
- 团队成员依赖版本不一致
- CI 构建结果不可预测

**正确做法**：
```bash
# 提交锁文件
git add package-lock.json
git commit -m "Update dependencies"
```

### 误区 2：手动修改锁文件

**危险操作**：
```json
// 直接编辑 package-lock.json
{
  "node_modules/react": {
    "version": "18.2.0"  // 手动改为 18.3.0
  }
}
```

**问题**：
- integrity 不匹配
- 依赖关系错乱
- 下次 npm install 可能覆盖

**正确方式**：
```bash
# 更新依赖
npm update react

# 或安装特定版本
npm install react@18.3.0
```

### 误区 3：package-lock.json 和 package.json 不同步

**检测不同步**：
```bash
npm install

# 如果输出以下信息，说明不同步
npm WARN package-lock.json: updated lockfile
```

**解决**：
```bash
# 强制同步
npm install --package-lock-only
```

---

## 工程实践

### 场景 1：强制使用锁文件（CI）

**npm ci**：
```bash
# package-lock.json 不存在 → 报错
# package-lock.json 与 package.json 不匹配 → 报错
npm ci
```

**package.json 配置**：
```json
{
  "scripts": {
    "ci": "npm ci",
    "preinstall": "if [ \"$CI\" = \"true\" ]; then npm ci; fi"
  }
}
```

### 场景 2：锁文件版本升级

**npm 5 → npm 7**：
```bash
# 自动升级 lockfileVersion
npm install

# package-lock.json 从 v1 升级到 v2
```

**npm 8 → npm 9**：
```bash
npm install --lockfile-version=3
```

### 场景 3：验证锁文件完整性

**工具**：
```bash
# 检查锁文件是否有效
npm ls

# 验证 integrity
npm audit signatures
```

**CI 检查**：
```yaml
# .github/workflows/ci.yml
- name: Verify lockfile
  run: |
    npm ci
    git diff --exit-code package-lock.json
```

---

## 深入一点

### lockfile 的哈希算法选择

**SHA-512 vs SHA-256**：
```javascript
// npm 使用 SHA-512
integrity: "sha512-abc..."  // 更安全

// Yarn 使用 SHA-1（早期）
integrity: "sha1-xyz..."  // 已过时，不推荐
```

**碰撞概率**：
```
SHA-1:   2^80   (已被攻破)
SHA-256: 2^128
SHA-512: 2^256  (npm 选择)
```

### lockfile 的序列化格式

**JSON vs YAML**：

**npm（JSON）**：
- 解析速度快
- 文件较大
- 合并冲突多

**Yarn（YAML）**：
- 可读性好
- 文件紧凑
- 合并友好

**pnpm（YAML）**：
- 紧凑表示
- 支持注释
- 更易 diff

### package-lock.json 的性能影响

**解析时间**：
```
lockfileVersion 1: 500ms  (大型项目)
lockfileVersion 2: 400ms
lockfileVersion 3: 250ms  (优化 50%)
```

**文件大小**：
```
v1: 2.5 MB
v2: 3.0 MB  (包含 v1 兼容数据)
v3: 1.5 MB  (移除冗余)
```

---

## 参考资料

- [package-lock.json 规范](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json)
- [npm-merge-driver](https://github.com/npm/npm-merge-driver)
- [Yarn lock 文件格式](https://yarnpkg.com/advanced/lexicon#lockfile)
