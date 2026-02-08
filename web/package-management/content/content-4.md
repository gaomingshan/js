# 依赖解析算法

## 版本冲突的本质

### 什么是版本冲突？

```
项目依赖树：
my-app
├── package-a@1.0.0
│   └── lodash@^4.17.0  (需要 4.17.x)
└── package-b@2.0.0
    └── lodash@^4.16.0  (需要 4.16.x)
```

**问题**：lodash 应该安装哪个版本？
- 4.17.x 满足 package-a，但可能不满足 package-b
- 4.16.x 满足 package-b，但不满足 package-a

**根本矛盾**：不同依赖者对同一个包有不同的版本要求。

---

## 依赖解析策略

### 策略 1：最近依赖优先（Nearest Wins）

**Maven/Gradle 采用**

```
A → B@1.0 → C@2.0
A → D@1.0 → C@3.0

结果：C@3.0（距离根节点更近）
```

**优点**：
- 规则简单明确
- 性能好（O(n)）

**缺点**：
- 依赖顺序影响结果
- 可能选择不兼容的版本

### 策略 2：最高版本优先（Highest Version Wins）

**npm v3-6 采用**

```
A → B@1.0 → C@^2.0  (匹配 2.0-2.x)
A → D@1.0 → C@^3.0  (匹配 3.0-3.x)

可用版本：[2.5.0, 2.8.0, 3.1.0, 3.2.0]
结果：C@3.2.0（满足 ^3.0，是最高版本）
```

**优点**：
- 倾向于使用最新功能
- 减少重复安装

**缺点**：
- 可能引入未充分测试的新版本
- 不满足所有约束时需回溯

### 策略 3：最小版本选择（MVS，Minimal Version Selection）

**Go Modules 采用**

```
A → B@1.0 → C@>=2.0  (最低 2.0)
A → D@1.0 → C@>=3.0  (最低 3.0)

结果：C@3.0（满足所有约束的最低版本）
```

**优点**：
- 可预测性强（总是选择最低可用版本）
- 避免"惊喜升级"

**缺点**：
- 可能错过重要的 bug 修复
- 与 semver 的自动升级理念冲突

### npm 的混合策略

**npm v7+ 实际行为**：

```javascript
function resolveConflict(constraints) {
  // 1. 收集所有约束
  const ranges = constraints.map(c => c.versionRange);
  
  // 2. 找到交集
  const intersection = semver.intersects(...ranges);
  
  if (intersection) {
    // 3. 返回交集中的最高版本
    return semver.maxSatisfying(availableVersions, intersection);
  } else {
    // 4. 无交集，安装多个版本
    return installMultipleVersions(constraints);
  }
}
```

**示例**：
```
约束 1: ^4.17.0  →  4.17.0 - 4.x
约束 2: ^4.16.0  →  4.16.0 - 4.x
交集:   4.17.0 - 4.x
选择:   4.17.21（最高版本）
```

---

## 依赖提升（Hoisting）机制

### 为什么需要提升？

**npm v2 的问题**：
```
node_modules/
└── express/
    └── node_modules/
        └── body-parser/
            └── node_modules/
                └── bytes/
                    └── node_modules/
                        └── (无限嵌套...)
```

**Windows 路径长度限制**：260 字符
**实际路径**：
```
C:\Users\...\node_modules\a\node_modules\b\node_modules\c\...
                        ^^^^^^^^^^^^^^^^^  (超过限制)
```

### 提升算法

**扁平化策略**（npm v3+）：

```javascript
function hoist(dependencyTree) {
  const flattened = {};
  
  function traverse(node, depth = 0) {
    for (const [name, version] of Object.entries(node.dependencies)) {
      const key = `${name}@${version}`;
      
      // 尝试提升到顶层
      if (!flattened[name]) {
        flattened[name] = version;  // 提升成功
      } else if (flattened[name] !== version) {
        // 版本冲突，保持嵌套
        node.nested = node.nested || {};
        node.nested[name] = version;
      }
      
      traverse(node.dependencies[name], depth + 1);
    }
  }
  
  traverse(dependencyTree);
  return flattened;
}
```

**结果**：
```
node_modules/
├── express/         (顶层)
├── body-parser/     (提升)
├── bytes/           (提升)
└── koa/
    └── node_modules/
        └── bytes/   (冲突版本，保持嵌套)
```

### 提升顺序的影响

**package.json 中的声明顺序影响提升结果**：

```json
// 顺序 A
{
  "dependencies": {
    "pkg-a": "1.0.0",  // 依赖 lodash@^4.17.0
    "pkg-b": "1.0.0"   // 依赖 lodash@^4.16.0
  }
}
```

**结果**：
```
node_modules/
├── lodash@4.17.21  (pkg-a 的依赖先提升)
└── pkg-b/
    └── node_modules/
        └── lodash@4.16.6  (pkg-b 使用嵌套版本)
```

**顺序 B**：
```json
{
  "dependencies": {
    "pkg-b": "1.0.0",  // 先声明
    "pkg-a": "1.0.0"
  }
}
```

**结果可能不同**！

---

## 去重策略与权衡

### npm 的去重命令

```bash
npm dedupe
# 或
npm ddp
```

**工作原理**：
```
优化前：
node_modules/
├── lodash@4.17.21
├── pkg-a/
│   └── node_modules/
│       └── lodash@4.17.20
└── pkg-b/
    └── node_modules/
        └── lodash@4.17.21  (重复)

优化后：
node_modules/
├── lodash@4.17.21  (共享)
├── pkg-a/
│   └── node_modules/
│       └── lodash@4.17.20  (必须保留)
└── pkg-b/  (使用顶层的 lodash)
```

### pnpm 的激进去重

**内容寻址存储**：
```
.pnpm-store/
└── v3/
    └── files/
        └── 00/
            └── abc123...  (lodash@4.17.21 的实际内容)

node_modules/
└── lodash/  (符号链接 → .pnpm-store/v3/files/00/abc123)
```

**效果**：
- 磁盘占用减少 70%
- 所有项目共享同一份文件

### Yarn PnP 的零去重

**理念**：不安装 node_modules，直接记录映射关系

```javascript
// .pnp.cjs
{
  "packageRegistryData": [
    ["lodash", [
      ["npm:4.17.21", {
        "packageLocation": "./.yarn/cache/lodash-npm-4.17.21-...",
        "packageDependencies": [...]
      }]
    ]]
  ]
}
```

---

## 常见误区

### 误区 1：npm install 是确定性的

**真相**：没有锁文件时，结果不确定。

**实验**：
```bash
# 删除锁文件
rm package-lock.json

# 两次安装可能得到不同的依赖树
npm install  # 第一次
npm install  # 第二次（可能不同）
```

**原因**：
- registry 中的包版本随时间变化
- 依赖解析的非确定性（提升顺序）

### 误区 2：去重一定能减少依赖数量

**反例**：
```
优化前：10 个包，每个 1MB = 10MB
优化后：10 个包（版本不兼容，无法去重）= 10MB
```

**去重的前提**：存在可合并的版本。

### 误区 3：最新版本一定兼容

**危险假设**：
```json
{
  "dependencies": {
    "react": "^18.0.0"  // 假设 18.x 都兼容
  }
}
```

**现实**：
```
react@18.0.0 → 正常工作
react@18.2.0 → 引入了微妙的行为变化
react@18.3.0 → 破坏了你的代码
```

**即使遵循 semver，也可能出现兼容性问题。**

---

## 工程实践

### 场景 1：诊断依赖冲突

**工具**：
```bash
# 查看完整依赖树
npm ls lodash

# 查看为什么安装了某个包
npm explain lodash

# pnpm 的更好输出
pnpm why lodash
```

**输出示例**：
```
lodash@4.17.21
├── express > body-parser > lodash@4.17.21
└── koa > koa-bodyparser > lodash@4.16.6 (冲突)
```

### 场景 2：强制统一版本

**npm 8.3+ overrides**：
```json
{
  "overrides": {
    "lodash": "4.17.21"  // 强制所有依赖使用此版本
  }
}
```

**Yarn resolutions**：
```json
{
  "resolutions": {
    "lodash": "4.17.21"
  }
}
```

**pnpm pnpm.overrides**：
```json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    }
  }
}
```

### 场景 3：优化依赖树

**分析工具**：
```bash
# 生成依赖树报告
npm ls --all --json > tree.json

# 分析重复依赖
npx npm-check-duplicates
```

**优化策略**：
```json
{
  "dependencies": {
    "lodash": "4.17.21"  // 提升为直接依赖，统一版本
  }
}
```

---

## 深入一点

### SAT Solver 与依赖解析

**复杂依赖解析是 NP 完全问题**：
```
给定 N 个包，每个包有 M 个版本约束
找到满足所有约束的版本组合
复杂度：O(M^N)
```

**包管理器的优化**：
- 启发式算法（贪心 + 回溯）
- 缓存中间结果
- 并行解析

**Dart Pub 使用真正的 SAT Solver**：
```dart
// 将依赖约束转换为布尔可满足性问题
constraint: pkg_a@^1.0.0 AND pkg_b@^2.0.0
```

### 依赖地狱（Dependency Hell）

**经典场景**：
```
A 依赖 C@1.x
B 依赖 C@2.x
项目同时依赖 A 和 B

Python/Ruby: 冲突！只能选一个
JavaScript: 两个版本共存（嵌套 node_modules）
```

**JavaScript 的优势**：
- 允许多版本共存
- 避免了"依赖地狱"

**代价**：
- 包体积增大
- 潜在的行为不一致

### 不同语言的解决方案对比

| 语言 | 策略 | 优点 | 缺点 |
|------|------|------|------|
| JavaScript | 多版本共存 | 灵活 | 体积大 |
| Python | 虚拟环境隔离 | 清晰 | 管理复杂 |
| Go | MVS + 全局缓存 | 可预测 | 保守 |
| Rust | 精确锁定 | 确定性 | 升级困难 |

---

## 参考资料

- [npm 依赖解析源码](https://github.com/npm/cli/tree/latest/workspaces/arborist)
- [Go Modules MVS 设计](https://research.swtch.com/vgo-mvs)
- [SAT Solving 在包管理中的应用](https://www.microsoft.com/en-us/research/publication/opium-optimal-package-install-uninstall-manager/)
