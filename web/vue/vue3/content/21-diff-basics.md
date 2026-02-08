# 第 21 节：Diff 算法基础

## 概述

Diff 算法是虚拟 DOM 的核心，用于对比新旧 VNode 树，找出最小变更。Vue 3 采用"快速 Diff"算法，在保证正确性的同时优化性能。

## 一、为什么需要 Diff

### 1.1 问题：完全重建的代价

```javascript
// 如果每次更新都完全重建 DOM
// 100 个节点，只有 1 个变化
// 也要销毁 100 个，重建 100 个

// Diff 算法的目标：
// 找出真正变化的部分，最小化 DOM 操作
```

### 1.2 Diff 的作用

```
旧 VNode 树          新 VNode 树
    div                 div
   / | \               / | \
  A  B  C   对比→     A  B  D
                      ↓
              只更新 C → D
```

## 二、Diff 的基本策略

### 2.1 同层比较

```
┌─────────────────────────────────────────────────────────────┐
│   Vue 只比较同一层级的节点，不跨层级比较                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   旧树:         新树:         比较方式:                     │
│     A             A           A-A (同层)                    │
│    / \           / \          B-B (同层)                    │
│   B   C         B   C         C-C (同层)                    │
│  / \           / \            D-D, E-E (同层)               │
│ D   E         D   E                                         │
│                                                             │
│   不会比较: B-C, D-A 等跨层级的节点                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 类型不同直接替换

```javascript
// 如果节点类型不同，不再深入比较
// 直接卸载旧节点，挂载新节点

// 旧: <div>...</div>
// 新: <span>...</span>
// 结果: 直接替换，不比较子节点
```

### 2.3 key 的作用

```javascript
// 没有 key：按索引比较
// 有 key：按 key 匹配，找到"相同"的节点

// 列表 [A, B, C] 变为 [C, A, B]

// 无 key（按索引）：
// A→C (更新), B→A (更新), C→B (更新)
// 3 次更新

// 有 key（按 key 匹配）：
// 移动 C 到最前面
// 1 次移动，0 次更新
```

## 三、简单 Diff 算法

### 3.1 基本流程

```javascript
function patchChildren(oldChildren, newChildren, container) {
  const oldLen = oldChildren.length
  const newLen = newChildren.length
  const minLen = Math.min(oldLen, newLen)
  
  // 1. 更新相同索引的节点
  for (let i = 0; i < minLen; i++) {
    patch(oldChildren[i], newChildren[i])
  }
  
  // 2. 新增节点
  if (newLen > oldLen) {
    for (let i = minLen; i < newLen; i++) {
      mount(newChildren[i], container)
    }
  }
  
  // 3. 移除节点
  if (oldLen > newLen) {
    for (let i = minLen; i < oldLen; i++) {
      unmount(oldChildren[i])
    }
  }
}
```

### 3.2 问题：无法复用节点

```javascript
// 旧: [A, B, C]
// 新: [C, A, B]

// 简单算法的处理：
// 索引0: A → C (更新内容)
// 索引1: B → A (更新内容)
// 索引2: C → B (更新内容)
// 实际进行了 3 次不必要的更新
```

## 四、带 key 的 Diff

### 4.1 key 的匹配

```javascript
function patchKeyedChildren(oldChildren, newChildren, container) {
  // 建立旧节点的 key → index 映射
  const keyToOldIdx = {}
  for (let i = 0; i < oldChildren.length; i++) {
    const key = oldChildren[i].key
    if (key != null) {
      keyToOldIdx[key] = i
    }
  }
  
  // 遍历新节点，查找可复用的旧节点
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]
    const oldIdx = keyToOldIdx[newChild.key]
    
    if (oldIdx !== undefined) {
      // 找到可复用节点，更新
      patch(oldChildren[oldIdx], newChild)
      // 可能需要移动
    } else {
      // 新增节点
      mount(newChild, container)
    }
  }
  
  // 移除不再存在的旧节点
}
```

### 4.2 移动判断

```javascript
// 如何判断节点是否需要移动？
// 使用"最大索引"策略

// 旧: [A, B, C, D]  索引: 0, 1, 2, 3
// 新: [D, A, B, C]

// 遍历新节点，记录在旧列表中的最大索引
// D 在旧列表索引 3，最大索引 = 3
// A 在旧列表索引 0，0 < 3，需要移动
// B 在旧列表索引 1，1 < 3，需要移动
// C 在旧列表索引 2，2 < 3，需要移动
```

## 五、Vue 3 快速 Diff

### 5.1 预处理优化

```javascript
// 先处理首尾相同的节点，减少需要 diff 的范围

// 旧: [A, B, C, D, E]
// 新: [A, B, X, Y, D, E]

// 步骤 1: 从头比较相同节点
// A-A ✓, B-B ✓, C-X ✗ 停止
// 头部相同: [A, B]

// 步骤 2: 从尾比较相同节点
// E-E ✓, D-D ✓, C-Y ✗ 停止
// 尾部相同: [D, E]

// 剩余需要 diff: 旧[C] vs 新[X, Y]
```

### 5.2 快速 Diff 流程

```javascript
function patchKeyedChildren(c1, c2, container) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1
  let e2 = l2 - 1
  
  // 1. 从头部开始，处理相同节点
  while (i <= e1 && i <= e2) {
    if (isSameVNode(c1[i], c2[i])) {
      patch(c1[i], c2[i])
      i++
    } else {
      break
    }
  }
  
  // 2. 从尾部开始，处理相同节点
  while (i <= e1 && i <= e2) {
    if (isSameVNode(c1[e1], c2[e2])) {
      patch(c1[e1], c2[e2])
      e1--
      e2--
    } else {
      break
    }
  }
  
  // 3. 处理仅有新增的情况
  if (i > e1 && i <= e2) {
    // 新增节点
    while (i <= e2) {
      mount(c2[i], container)
      i++
    }
  }
  
  // 4. 处理仅有删除的情况
  else if (i > e2 && i <= e1) {
    // 删除节点
    while (i <= e1) {
      unmount(c1[i])
      i++
    }
  }
  
  // 5. 处理中间乱序部分
  else {
    // 使用最长递增子序列优化移动
    patchUnkeyedPart(c1, c2, i, e1, e2, container)
  }
}
```

### 5.3 最长递增子序列（LIS）

```javascript
// 用于优化节点移动
// 找到不需要移动的最长序列

// 旧索引序列: [0, 1, 2, 3, 4]
// 新节点在旧列表的位置: [4, 0, 1, 2, 3]
// 最长递增子序列: [0, 1, 2, 3]
// 这些节点不需要移动，只移动 4

// 算法复杂度: O(n log n)
```

## 六、Diff 示例

### 6.1 新增节点

```javascript
// 旧: [A, B, C]
// 新: [A, B, C, D]

// 头部相同: A, B, C
// 尾部相同: 无
// 结果: 新增 D
```

### 6.2 删除节点

```javascript
// 旧: [A, B, C, D]
// 新: [A, B, C]

// 头部相同: A, B, C
// 尾部相同: 无
// 结果: 删除 D
```

### 6.3 移动节点

```javascript
// 旧: [A, B, C, D]
// 新: [A, C, B, D]

// 头部相同: A
// 尾部相同: D
// 中间: [B, C] vs [C, B]
// 结果: 移动 B 或 C
```

### 6.4 复杂情况

```javascript
// 旧: [A, B, C, D, E, F, G]
// 新: [A, B, E, C, D, H, F, G]

// 头部相同: A, B
// 尾部相同: F, G
// 中间: [C, D, E] vs [E, C, D, H]

// 建立映射，计算 LIS
// 最少移动操作
```

## 七、key 的最佳实践

### 7.1 使用稳定唯一的 key

```vue
<!-- ✅ 推荐：使用唯一 ID -->
<li v-for="item in items" :key="item.id">

<!-- ❌ 避免：使用索引（除非列表是静态的） -->
<li v-for="(item, index) in items" :key="index">
```

### 7.2 为什么索引作为 key 有问题

```javascript
// 列表: [{id:1, name:'A'}, {id:2, name:'B'}, {id:3, name:'C'}]
// 删除第一个后: [{id:2, name:'B'}, {id:3, name:'C'}]

// 使用索引作为 key:
// key:0 → A 变成 B (更新)
// key:1 → B 变成 C (更新)
// key:2 → C 被删除
// 实际上应该只删除 A

// 使用 id 作为 key:
// key:1 被删除
// key:2, key:3 不变
// 正确！
```

## 八、性能考虑

| 操作 | 复杂度 |
|------|--------|
| 同类型对比 | O(1) |
| 子节点 Diff | O(n) |
| LIS 计算 | O(n log n) |

## 九、总结

| 概念 | 说明 |
|------|------|
| 同层比较 | 不跨层级 |
| key | 节点身份标识 |
| 预处理 | 处理首尾相同节点 |
| LIS | 最小化移动操作 |

## 参考资料

- [Vue 3 Diff 算法](https://vuejs.org/guide/extras/rendering-mechanism.html#compiler-informed-virtual-dom)

---

**下一节** → [第 22 节：模板编译](./22-template-compile.md)
