# pnpm-lock.yaml 设计

## lockfile 格式与字段

### YAML 格式优势

**pnpm 选择 YAML 的原因**：

**1. 可读性**：
```yaml
# pnpm-lock.yaml
lodash@4.17.21:
  resolution: {integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...}
  engines: {node: '>=4'}
```

vs JSON：
```json
{
  "lodash@4.17.21": {
    "resolution": {
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+..."
    },
    "engines": {
      "node": ">=4"
    }
  }
}
```

**2. 注释支持**：
```yaml
# pnpm-lock.yaml
lockfileVersion: '6.0'

# 依赖清单
packages:
  /lodash@4.17.21:
    # 修复了 CVE-2020-8203
    resolution: {integrity: sha512-...}
```

**3. 合并友好**：
- 缩进明确
- 冲突易定位
- Git diff 清晰

### 核心字段

**lockfileVersion**：
```yaml
lockfileVersion: '6.0'
```

版本演进：
- `5.3`：pnpm 6.x
- `5.4`：pnpm 7.x
- `6.0`：pnpm 8.x

**importers**（项目入口）：
```yaml
importers:
  .:
    dependencies:
      express:
        specifier: ^4.18.0
        version: 4.18.0
      lodash:
        specifier: ^4.17.0
        version: 4.17.21
    devDependencies:
      typescript:
        specifier: ^5.0.0
        version: 5.0.2
```

**packages**（依赖详情）：
```yaml
packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...}
    engines: {node: '>=4'}
    dev: false

  /express@4.18.0:
    resolution: {integrity: sha512-...}
    dependencies:
      body-parser: 1.20.0
      cookie: 0.5.0
    engines: {node: '>= 0.10.0'}
    dev: false
```

---

## 依赖树的紧凑表达

### 去重表示

**问题**：同一个包被多处引用

**传统表示**（冗余）：
```yaml
# 每次都完整记录
/pkg-a@1.0.0:
  dependencies:
    lodash: 4.17.21
    
/pkg-b@1.0.0:
  dependencies:
    lodash: 4.17.21  # 重复
```

**pnpm 表示**（引用）：
```yaml
packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-...}

  /pkg-a@1.0.0:
    dependencies:
      lodash: 4.17.21  # 引用

  /pkg-b@1.0.0:
    dependencies:
      lodash: 4.17.21  # 引用
```

### peer dependency 表示

**复杂场景**：同一个包在不同 peer dependency 下
```yaml
packages:
  /react-router@6.0.0(react@17.0.0):
    resolution: {integrity: sha512-...}
    peerDependencies:
      react: '>=16.8.0'
    dependencies:
      react: 17.0.0
    dev: false

  /react-router@6.0.0(react@18.0.0):
    resolution: {integrity: sha512-...}
    peerDependencies:
      react: '>=16.8.0'
    dependencies:
      react: 18.0.0
    dev: false
```

**关键**：`(react@17.0.0)` 后缀区分不同变体

### 依赖路径压缩

**扁平表示**：
```yaml
packages:
  /express@4.18.0:
    dependencies:
      body-parser: 1.20.0
      cookie: 0.5.0

  /body-parser@1.20.0:
    dependencies:
      bytes: 3.1.2

  /bytes@3.1.2:
    # 无依赖
```

vs **嵌套表示**（npm）：
```json
{
  "express": {
    "dependencies": {
      "body-parser": {
        "dependencies": {
          "bytes": {}
        }
      }
    }
  }
}
```

**pnpm 优势**：
- 文件更小（约 50%）
- 解析更快
- 可读性更好

---

## 版本解析记录

### resolution 字段

**完整信息**：
```yaml
/lodash@4.17.21:
  resolution: {
    integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...,
    tarball: https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz
  }
```

**字段含义**：
- `integrity`：SHA-512 checksum
- `tarball`：下载 URL（可选）

### 版本范围到精确版本的映射

**package.json**：
```json
{
  "dependencies": {
    "lodash": "^4.17.0"
  }
}
```

**pnpm-lock.yaml**：
```yaml
importers:
  .:
    dependencies:
      lodash:
        specifier: ^4.17.0  # 原始范围
        version: 4.17.21     # 解析版本
```

**保证**：
- `specifier`：记录原始声明
- `version`：精确锁定版本
- 下次安装必然是 4.17.21

### 可选依赖标记

```yaml
packages:
  /fsevents@2.3.2:
    resolution: {integrity: sha512-...}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]
    requiresBuild: true
    optional: true
```

**字段**：
- `optional: true`：安装失败不影响整体
- `requiresBuild: true`：需要编译原生模块
- `os: [darwin]`：仅 macOS 适用

---

## 与 npm/yarn 锁文件对比

### 格式对比

**package-lock.json（npm）**：
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "my-app",
      "version": "1.0.0",
      "dependencies": {
        "lodash": "^4.17.0"
      }
    },
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+..."
    }
  }
}
```

**yarn.lock（Yarn Classic）**：
```yaml
lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz#..."
  integrity sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...
```

**pnpm-lock.yaml**：
```yaml
lockfileVersion: '6.0'

importers:
  .:
    dependencies:
      lodash:
        specifier: ^4.17.0
        version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution: {integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...}
```

### 文件大小对比

**典型 React 项目**（200 个依赖）：

| 锁文件 | 大小 | 行数 |
|--------|------|------|
| package-lock.json (v3) | 800 KB | 8,000 |
| yarn.lock | 400 KB | 5,000 |
| pnpm-lock.yaml | 200 KB | 2,500 |

**pnpm 优势**：
- 紧凑表示
- 无冗余信息
- YAML 格式

### 合并冲突对比

**冲突示例**：
```
<<<<<<< HEAD
lodash@^4.17.0:
  version "4.17.20"
=======
lodash@^4.17.0:
  version "4.17.21"
>>>>>>> feature
```

**解决复杂度**：

**package-lock.json**：
- JSON 格式，嵌套深
- 冲突标记不明显
- 需要手动修复后验证 JSON 合法性

**yarn.lock**：
- YAML 格式，易读
- 但可能有多处冲突

**pnpm-lock.yaml**：
- YAML 格式，易读
- importers 和 packages 分离
- 冲突通常集中在 importers 部分

**最佳实践**：
```bash
# 删除锁文件后重新生成
git checkout --theirs pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
```

---

## 常见误区

### 误区 1：可以手动编辑锁文件

**危险操作**：
```yaml
# 手动修改版本
/lodash@4.17.21:
  resolution: {integrity: sha512-abc...}
  # 改为
  resolution: {integrity: sha512-xyz...}  # ❌ 错误的 hash
```

**后果**：
```bash
pnpm install
# Error: Integrity check failed for lodash@4.17.21
```

**正确做法**：
```bash
pnpm update lodash@4.17.21
```

### 误区 2：锁文件可以省略

**错误理解**：有 package.json 就够了

**真相**：
```bash
# 删除锁文件
rm pnpm-lock.yaml

# 安装（可能得到不同版本）
pnpm install
# lodash@4.17.22（新版本发布）

# CI 构建可能失败
```

### 误区 3：不同包管理器的锁文件可以共存

**危险**：
```bash
ls
# package-lock.json
# yarn.lock
# pnpm-lock.yaml  ← 三个锁文件同时存在
```

**问题**：
- 版本可能不一致
- 团队成员使用不同工具
- CI 环境混乱

**解决**：
```bash
# 选择一个包管理器
rm package-lock.json yarn.lock
git add pnpm-lock.yaml

# package.json 强制
{
  "packageManager": "pnpm@8.0.0"
}
```

---

## 工程实践

### 场景 1：锁文件验证

**CI 检查**：
```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

# --frozen-lockfile 确保：
# 1. 锁文件必须存在
# 2. 与 package.json 一致
# 3. 不会修改锁文件
```

**本地验证**：
```bash
# 检查锁文件是否同步
pnpm install --frozen-lockfile

# 如果不同步
# Error: The lockfile needs to be updated, but it is frozen
```

### 场景 2：锁文件升级

**lockfileVersion 升级**：
```bash
# pnpm 7 → pnpm 8
pnpm install

# 自动升级 lockfileVersion
# 5.4 → 6.0
```

**查看变更**：
```bash
git diff pnpm-lock.yaml

# 主要变化：
# - lockfileVersion 字段
# - 格式微调
```

### 场景 3：依赖审计

**使用锁文件审计**：
```bash
pnpm audit

# 输出示例：
# ┌──────────────────────────────────────────────────────┐
# │                                                      │
# │       Security audit for lodash@4.17.20              │
# │                                                      │
# ├──────────────────────────────────────────────────────┤
# │  Severity: moderate                                  │
# │  Package: lodash                                     │
# │  Vulnerable versions: <4.17.21                       │
# │  Patched versions: >=4.17.21                         │
# └──────────────────────────────────────────────────────┘
```

**自动修复**：
```bash
pnpm audit --fix
# 更新 pnpm-lock.yaml
```

---

## 深入一点

### lockfileVersion 的演进

**版本历史**：
```
5.3: pnpm 6.0-6.x
├─ 引入 importers 概念
├─ peer dependency 变体支持
└─ 紧凑表示

5.4: pnpm 7.x
├─ 优化 peer dependency 表示
└─ 性能改进

6.0: pnpm 8.x
├─ 更紧凑的格式
├─ 移除冗余字段
└─ 解析速度提升 30%
```

**兼容性**：
```bash
# pnpm 8 可以读取 lockfileVersion 5.3/5.4
# 但会自动升级到 6.0

pnpm install
# lockfileVersion: '5.4' → '6.0'
```

### 锁文件的 hash 验证

**完整性保障**：
```yaml
packages:
  /lodash@4.17.21:
    resolution:
      integrity: sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+...
                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                 SHA-512 hash
```

**验证流程**：
```javascript
async function verifyPackage(pkg, expectedIntegrity) {
  // 1. 下载 tarball
  const tarball = await downloadPackage(pkg);
  
  // 2. 计算实际 hash
  const actualHash = crypto.createHash('sha512')
    .update(tarball)
    .digest('base64');
  
  const actualIntegrity = `sha512-${actualHash}`;
  
  // 3. 对比
  if (actualIntegrity !== expectedIntegrity) {
    throw new Error('Integrity check failed!');
  }
}
```

### 锁文件的性能影响

**解析时间**：
```
package-lock.json (v3, 800 KB): 150ms
yarn.lock (400 KB):             100ms
pnpm-lock.yaml (200 KB):        50ms
```

**内存占用**：
```
package-lock.json: 8 MB
yarn.lock:         4 MB
pnpm-lock.yaml:    2 MB
```

**pnpm 优势**：
- YAML 解析器高效
- 紧凑格式减少 I/O
- 无冗余数据

---

## 参考资料

- [pnpm-lock.yaml 规范](https://pnpm.io/pnpm-lock.yaml)
- [lockfileVersion 演进](https://github.com/pnpm/pnpm/blob/main/packages/lockfile-types/src/index.ts)
- [锁文件格式对比](https://pnpm.io/feature-comparison#lockfile-format)
