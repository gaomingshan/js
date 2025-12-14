# 模块依赖图

## 概述

模块依赖图（Module Dependency Graph）描述了模块之间的依赖关系。

理解依赖图的关键在于：

- **图的遍历**：DFS 和 BFS 用于分析依赖关系
- **循环依赖检测**：使用栈检测循环
- **拓扑排序**：确定模块加载顺序

---

## 一、依赖图基础

### 1.1 图的结构

```js
// 示例模块结构
// app.js
import { utilA } from './utilA.js';
import { utilB } from './utilB.js';

// utilA.js
import { helper } from './helper.js';

// utilB.js
import { helper } from './helper.js';

// helper.js
export function helper() {}

// 依赖图：
//     app.js
//    /      \
// utilA    utilB
//    \      /
//    helper
```

### 1.2 图的遍历

```js
// 深度优先遍历（DFS）
function dfs(module, visited = new Set()) {
  if (visited.has(module)) return;
  visited.add(module);

  console.log('访问:', module.id);

  for (const dep of module.dependencies) {
    dfs(dep, visited);
  }
}

// 广度优先遍历（BFS）
function bfs(module) {
  const queue = [module];
  const visited = new Set([module]);

  while (queue.length > 0) {
    const current = queue.shift();
    console.log('访问:', current.id);

    for (const dep of current.dependencies) {
      if (!visited.has(dep)) {
        visited.add(dep);
        queue.push(dep);
      }
    }
  }
}
```

---

## 二、循环依赖检测

### 2.1 检测算法

```js
// 使用 DFS 检测循环依赖
function detectCycle(module, visited = new Set(), stack = new Set()) {
  if (stack.has(module)) {
    return true;  // 发现循环
  }

  if (visited.has(module)) {
    return false;  // 已访问，无循环
  }

  visited.add(module);
  stack.add(module);

  for (const dep of module.dependencies) {
    if (detectCycle(dep, visited, stack)) {
      console.log('循环依赖:', module.id, '->', dep.id);
      return true;
    }
  }

  stack.delete(module);
  return false;
}
```

### 2.2 解决循环依赖

```js
// ❌ 方法 1：重构代码（不好）
// a.js
import { b } from './b.js';
export const a = 'A' + b;

// b.js
import { a } from './a.js';
export const b = 'B' + a;

// ✅ 方法 1：重构代码（好）
// a.js
export const a = 'A';

// b.js
export const b = 'B';

// combined.js
import { a } from './a.js';
import { b } from './b.js';
export const combined = a + b;

// ✅ 方法 2：延迟导入
// a.js
export const a = 'A';
export function getB() {
  return require('./b.js').b;
}
```

---

## 三、拓扑排序

### 3.1 Kahn 算法

```js
// 拓扑排序：确定模块加载顺序
function topologicalSort(modules) {
  const inDegree = new Map();
  const result = [];

  // 计算入度
  for (const module of modules) {
    if (!inDegree.has(module)) {
      inDegree.set(module, 0);
    }
    for (const dep of module.dependencies) {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    }
  }

  // 找到所有入度为 0 的节点
  const queue = modules.filter(m => inDegree.get(m) === 0);

  while (queue.length > 0) {
    const module = queue.shift();
    result.push(module);

    for (const dep of module.dependencies) {
      inDegree.set(dep, inDegree.get(dep) - 1);
      if (inDegree.get(dep) === 0) {
        queue.push(dep);
      }
    }
  }

  return result;
}
```

---

## 四、代码分割

### 4.1 动态导入点

```js
// 识别代码分割点
// app.js
import { common } from './common.js';

// 路由懒加载
const routes = {
  '/home': () => import('./pages/home.js'),
  '/about': () => import('./pages/about.js'),
  '/contact': () => import('./pages/contact.js')
};

// 依赖图中的分割点
//      app.js
//         |
//      common.js
//      /  |  \
//   home about contact（动态导入）
```

### 4.2 Chunk 划分

```js
// Webpack 配置示例
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // 提取公共代码
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5
        }
      }
    }
  }
};
```

---

## 五、依赖图可视化

### 5.1 生成 DOT 格式

```js
// 生成 Graphviz DOT 格式
function generateDOT(modules) {
  let dot = 'digraph Dependencies {\n';

  const visited = new Set();

  function addNode(module) {
    if (visited.has(module.id)) return;
    visited.add(module.id);

    for (const dep of module.dependencies) {
      dot += `  "${module.id}" -> "${dep.id}";\n`;
      addNode(dep);
    }
  }

  for (const module of modules) {
    addNode(module);
  }

  dot += '}';
  return dot;
}

// 使用 Graphviz 可视化：
// dot -Tpng dependencies.dot -o dependencies.png
```

---

## 六、最佳实践

1. **定期检测循环依赖**：使用工具自动检测。
2. **优化依赖图**：减少不必要的依赖。
3. **合理代码分割**：按路由或功能分割。
4. **可视化依赖**：使用工具理解项目结构。
5. **Tree Shaking**：移除未使用的代码。

---

## 参考资料

- [Webpack Module Graph](https://webpack.js.org/concepts/dependency-graph/)
- [Madge - Module Dependency Graph](https://github.com/pahen/madge)
