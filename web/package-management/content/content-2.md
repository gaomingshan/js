# 依赖模型与依赖图

## 依赖关系的图结构表达

依赖关系本质上是一个**有向无环图（DAG，Directed Acyclic Graph）**，节点是包，边是依赖关系。

### 依赖树示例

```
my-app
├── react@18.2.0
│   ├── loose-envify@1.4.0
│   │   └── js-tokens@4.0.0
│   └── scheduler@0.23.0
├── react-dom@18.2.0
│   ├── react@18.2.0 (已存在，去重)
│   ├── loose-envify@1.4.0 (已存在，去重)
│   └── scheduler@0.23.0 (已存在，去重)
└── lodash@4.17.21
```

**关键概念**：
- **根节点**：项目本身（my-app）
- **边的方向**：从依赖者指向被依赖者
- **去重**：同一个包的同一版本只保留一份

---

## 直接依赖 vs 间接依赖

### 定义

**直接依赖（Direct Dependencies）**：
```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```
- 项目代码直接 `import`/`require` 的包
- 显式声明在 package.json

**间接依赖（Transitive Dependencies）**：
```
express@4.18.0
└── body-parser@1.20.1  ← 间接依赖
    └── bytes@3.1.2      ← 间接依赖
```
- 直接依赖的依赖（递归）
- 开发者通常不感知，但影响最终产物

### 为什么需要区分？

**版本控制策略不同**：
```json
{
  "dependencies": {
    "react": "18.2.0"  // 直接依赖，严格控制版本
  },
  "devDependencies": {
    "eslint": "^8.0.0"  // 开发依赖，允许自动升级
  }
}
```

**安全审计范围**：
```bash
# npm audit 会扫描所有依赖（包括间接）
npm audit

# 修复直接依赖的漏洞
npm audit fix

# 修复间接依赖需要 --force
npm audit fix --force
```

---

## 依赖图的构建与遍历算法

### 构建流程

**输入**：package.json 中的 dependencies
**输出**：完整的依赖图

```javascript
// 伪代码
function buildDependencyGraph(rootPackage) {
  const graph = new Map();
  const queue = [rootPackage];
  
  while (queue.length > 0) {
    const pkg = queue.shift();
    
    // 查询 registry 获取 package.json
    const metadata = await fetchPackageMetadata(pkg.name, pkg.version);
    
    // 解析依赖
    for (const [depName, depRange] of Object.entries(metadata.dependencies)) {
      const resolvedVersion = resolveVersion(depName, depRange);
      
      // 添加到图中
      graph.set(`${pkg.name}@${pkg.version}`, {
        dependencies: [...(graph.get(pkg.name)?.dependencies || []), 
                       `${depName}@${resolvedVersion}`]
      });
      
      // 继续遍历
      if (!visited.has(`${depName}@${resolvedVersion}`)) {
        queue.push({ name: depName, version: resolvedVersion });
      }
    }
  }
  
  return graph;
}
```

### 遍历策略

**深度优先（DFS）**：
```
react
├── loose-envify (先访问)
│   └── js-tokens (再访问)
└── scheduler (最后访问)
```
- 适用场景：检测循环依赖
- npm 使用此策略

**广度优先（BFS）**：
```
react
├── loose-envify (先访问)
└── scheduler (先访问)
    └── js-tokens (后访问)
```
- 适用场景：并行下载依赖
- Yarn 使用此策略

---

## 循环依赖检测

### 什么是循环依赖？

```
package-a
└── package-b
    └── package-a  ← 形成环！
```

**真实案例**：
```
babel-core@6.x
└── babel-runtime
    └── core-js
        └── babel-runtime (循环)
```

### 检测算法

**DFS + 访问标记**：
```javascript
function detectCycle(graph, node, visiting = new Set(), visited = new Set()) {
  if (visiting.has(node)) {
    throw new Error(`Circular dependency detected: ${node}`);
  }
  
  if (visited.has(node)) {
    return false;
  }
  
  visiting.add(node);
  
  for (const dep of graph.get(node).dependencies) {
    detectCycle(graph, dep, visiting, visited);
  }
  
  visiting.delete(node);
  visited.add(node);
  
  return false;
}
```

### 包管理器的处理策略

**npm/Yarn**：
- 允许循环依赖（Node.js require 支持）
- 通过缓存模块对象避免无限递归

**Deno**：
- 严格禁止循环依赖
- 编译时报错

---

## 常见误区

### 误区 1：依赖树是固定的

**真相**：同一个 package.json 在不同时间安装可能产生不同的依赖树。

**原因**：
```json
{
  "dependencies": {
    "lodash": "^4.17.0"  // ^ 允许自动升级
  }
}
```

**时间 T1**（2022-01-01）：
```
lodash@4.17.20
```

**时间 T2**（2023-01-01）：
```
lodash@4.17.21  ← 自动升级到最新的 4.x 版本
```

**解决方案**：锁文件（下一章详解）

### 误区 2：删除间接依赖无影响

**危险操作**：
```bash
# 手动删除 node_modules 中的间接依赖
rm -rf node_modules/js-tokens
```

**后果**：
```javascript
// react 内部代码会报错
const jsTokens = require('js-tokens');  // Error: Cannot find module
```

### 误区 3：依赖树越小越好

**过度优化**：
```json
{
  "dependencies": {
    "lodash.debounce": "^4.0.8"  // 只安装 debounce
  }
}
```

**问题**：
- lodash 模块化包维护停滞
- tree-shaking 可以实现相同效果
- 增加依赖管理复杂度

**正确做法**：
```javascript
// 使用完整 lodash + tree-shaking
import debounce from 'lodash/debounce';
```

---

## 工程实践

### 场景 1：依赖可视化

**工具**：npm-dependency-graph
```bash
npm install -g npm-dependency-graph
npm-dependency-graph > graph.dot
dot -Tpng graph.dot -o graph.png
```

**分析重点**：
- 识别过深的依赖链（超过 5 层）
- 发现冗余依赖（同一个包的多个版本）
- 定位巨型依赖（体积超过 1MB）

### 场景 2：优化依赖树深度

**问题**：
```
my-app
└── package-a
    └── package-b
        └── package-c
            └── package-d (深度 = 4)
```

**优化**：提升到直接依赖
```json
{
  "dependencies": {
    "package-a": "^1.0.0",
    "package-d": "^2.0.0"  // 提升为直接依赖
  }
}
```

**效果**：
- 减少依赖解析时间
- 便于版本控制
- 但增加维护成本

### 场景 3：Monorepo 依赖共享

**问题**：多个子包依赖同一个库的不同版本
```
packages/
├── app-a/
│   └── react@17.0.0
└── app-b/
    └── react@18.0.0
```

**优化策略**：
```json
// 根目录 package.json
{
  "devDependencies": {
    "react": "18.0.0"  // 统一版本
  }
}
```

**配合 pnpm workspace**：
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

---

## 深入一点

### 依赖图的数学性质

**DAG 的拓扑排序**：
```
输入：react → scheduler → js-tokens
输出：[js-tokens, scheduler, react]
```
- 用于确定安装顺序
- 保证依赖先于依赖者安装

**传递闭包**：
```
如果 A → B 且 B → C，则 A 传递依赖 C
```
- 用于计算完整的依赖集合
- npm ls 的实现基础

### 依赖提升（Hoisting）的副作用

**扁平化前**（npm v2）：
```
node_modules/
├── express/
│   └── node_modules/
│       └── body-parser/
│           └── node_modules/
│               └── bytes/
```

**扁平化后**（npm v3+）：
```
node_modules/
├── express/
├── body-parser/  ← 提升
└── bytes/        ← 提升
```

**副作用**：幽灵依赖
```javascript
// 项目代码可以直接 require，但 package.json 未声明
const bodyParser = require('body-parser');  // 危险！
```

### 不同语言的依赖模型对比

| 语言 | 依赖模型 | 版本策略 | 安装位置 |
|------|----------|----------|----------|
| JavaScript (npm) | 扁平化树 | 允许多版本 | node_modules |
| Python (pip) | 扁平化列表 | 全局唯一版本 | site-packages |
| Go (modules) | 扁平化树 | MVS（最小版本选择）| $GOPATH/pkg/mod |
| Rust (Cargo) | 依赖图 | 语义化范围 | target/debug/deps |

**JavaScript 的特殊性**：
- 允许同一个包的多个版本共存
- 依赖解析复杂度最高
- 但提供了最大的灵活性

---

## 参考资料

- [npm 依赖解析算法](https://npm.github.io/how-npm-works-docs/npm3/how-npm3-works.html)
- [理解 npm 依赖树](https://lexi-lambda.github.io/blog/2016/08/24/understanding-the-npm-dependency-model/)
- [DAG 与拓扑排序](https://en.wikipedia.org/wiki/Topological_sorting)
