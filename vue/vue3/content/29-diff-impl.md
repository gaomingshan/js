# 第 29 节：Diff 算法实现

## 概述

Vue 3 采用"快速 Diff"算法，通过预处理、最长递增子序列等优化，实现高效的节点对比和最小化 DOM 操作。

## 一、快速 Diff 算法流程

```
┌─────────────────────────────────────────────────────────────┐
│                   快速 Diff 流程                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 预处理：从头部开始，处理相同节点                        │
│   2. 预处理：从尾部开始，处理相同节点                        │
│   3. 处理仅有新增的情况                                     │
│   4. 处理仅有删除的情况                                     │
│   5. 处理中间乱序部分（使用 LIS 优化移动）                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 二、完整实现

### 2.1 patchKeyedChildren

```javascript
function patchKeyedChildren(c1, c2, container, parentAnchor) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1  // 旧列表末尾索引
  let e2 = l2 - 1         // 新列表末尾索引
  
  // 1. 从头部开始同步
  // (a b) c
  // (a b) d e
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = c2[i]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    i++
  }
  
  // 2. 从尾部开始同步
  // a (b c)
  // d e (b c)
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = c2[e2]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    e1--
    e2--
  }
  
  // 3. 旧节点遍历完，新节点有剩余 → 新增
  // (a b)
  // (a b) c d
  if (i > e1) {
    if (i <= e2) {
      const nextPos = e2 + 1
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
      while (i <= e2) {
        patch(null, c2[i], container, anchor)
        i++
      }
    }
  }
  
  // 4. 新节点遍历完，旧节点有剩余 → 删除
  // (a b) c d
  // (a b)
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i])
      i++
    }
  }
  
  // 5. 中间乱序部分
  else {
    const s1 = i  // 旧列表起始
    const s2 = i  // 新列表起始
    
    // 5.1 建立新节点 key → index 映射
    const keyToNewIndexMap = new Map()
    for (i = s2; i <= e2; i++) {
      const nextChild = c2[i]
      if (nextChild.key != null) {
        keyToNewIndexMap.set(nextChild.key, i)
      }
    }
    
    // 5.2 遍历旧节点，找到可复用的
    let j
    let patched = 0
    const toBePatched = e2 - s2 + 1  // 待处理的新节点数量
    let moved = false
    let maxNewIndexSoFar = 0
    
    // 用于记录新节点对应的旧节点索引
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
    
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i]
      
      // 已处理的数量超过待处理数量，删除剩余旧节点
      if (patched >= toBePatched) {
        unmount(prevChild)
        continue
      }
      
      let newIndex
      if (prevChild.key != null) {
        // 有 key，从映射中查找
        newIndex = keyToNewIndexMap.get(prevChild.key)
      } else {
        // 无 key，遍历查找
        for (j = s2; j <= e2; j++) {
          if (
            newIndexToOldIndexMap[j - s2] === 0 &&
            isSameVNodeType(prevChild, c2[j])
          ) {
            newIndex = j
            break
          }
        }
      }
      
      if (newIndex === undefined) {
        // 找不到对应的新节点，删除
        unmount(prevChild)
      } else {
        // 记录新节点对应的旧节点索引（+1 避免与 0 混淆）
        newIndexToOldIndexMap[newIndex - s2] = i + 1
        
        // 判断是否需要移动
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }
        
        // patch 复用节点
        patch(prevChild, c2[newIndex], container)
        patched++
      }
    }
    
    // 5.3 移动和挂载
    // 计算最长递增子序列
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : []
    
    j = increasingNewIndexSequence.length - 1
    
    // 从后向前遍历，确保锚点正确
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i
      const nextChild = c2[nextIndex]
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor
      
      if (newIndexToOldIndexMap[i] === 0) {
        // 新增节点
        patch(null, nextChild, container, anchor)
      } else if (moved) {
        // 需要移动
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          // 不在 LIS 中，需要移动
          move(nextChild, container, anchor)
        } else {
          // 在 LIS 中，不需要移动
          j--
        }
      }
    }
  }
}
```

## 三、最长递增子序列（LIS）

### 3.1 为什么需要 LIS

```javascript
// 旧: [a, b, c, d]  索引: [0, 1, 2, 3]
// 新: [d, a, b, c]

// newIndexToOldIndexMap = [4, 1, 2, 3]
// 表示新列表中各节点在旧列表的位置

// LIS = [1, 2, 3] 索引为 [1, 2, 3]
// 意味着 a, b, c 不需要移动
// 只需要移动 d 到最前面
```

### 3.2 LIS 算法实现

```javascript
// 返回最长递增子序列的索引数组
function getSequence(arr) {
  const p = arr.slice()  // 前驱索引
  const result = [0]     // 结果数组（存储索引）
  let i, j, u, v, c
  const len = arr.length
  
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {  // 0 表示新增节点，跳过
      j = result[result.length - 1]
      
      if (arr[j] < arrI) {
        // 当前值大于结果最后一个，追加
        p[i] = j
        result.push(i)
        continue
      }
      
      // 二分查找，找到第一个大于 arrI 的位置
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      
      // 替换
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  
  // 回溯，构建最终结果
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  
  return result
}
```

### 3.3 示例

```javascript
// 输入: [3, 1, 2, 4, 6, 5]
// 最长递增子序列: [1, 2, 4, 5] 或 [1, 2, 4, 6]
// 返回索引: [1, 2, 3, 5] 或 [1, 2, 3, 4]

getSequence([3, 1, 2, 4, 6, 5])
// 返回: [1, 2, 3, 5]
```

## 四、移动判断

### 4.1 最大索引法

```javascript
let maxNewIndexSoFar = 0

for (i = s1; i <= e1; i++) {
  // ... 找到 newIndex
  
  if (newIndex >= maxNewIndexSoFar) {
    // 递增，不需要移动
    maxNewIndexSoFar = newIndex
  } else {
    // 不是递增，说明有节点需要移动
    moved = true
  }
}
```

### 4.2 为什么有效

```javascript
// 遍历旧节点，记录它们在新列表中的位置
// 旧: [a, b, c, d]
// 新: [d, a, b, c]

// 遍历旧节点：
// a 在新列表位置 1，maxIndex = 1
// b 在新列表位置 2，2 > 1，maxIndex = 2
// c 在新列表位置 3，3 > 2，maxIndex = 3
// d 在新列表位置 0，0 < 3，需要移动！

// 如果位置一直递增，说明相对顺序没变，不需要移动
```

## 五、Diff 示例分析

### 5.1 简单新增

```javascript
// 旧: [a, b, c]
// 新: [a, b, c, d, e]

// 步骤 1：头部同步
// i=0: a-a patch
// i=1: b-b patch
// i=2: c-c patch
// i=3: 超出旧列表

// 步骤 3：i > e1 && i <= e2
// 新增 d, e
```

### 5.2 简单删除

```javascript
// 旧: [a, b, c, d, e]
// 新: [a, b, c]

// 步骤 1：头部同步
// i=0,1,2: a,b,c patch
// i=3: c-空，停止

// 步骤 4：i > e2 && i <= e1
// 删除 d, e
```

### 5.3 复杂乱序

```javascript
// 旧: [a, b, c, d, e, f, g]
// 新: [a, b, e, c, d, h, f, g]

// 步骤 1：头部同步 a, b
// 步骤 2：尾部同步 f, g
// 中间：旧[c,d,e] vs 新[e,c,d,h]

// keyToNewIndexMap: {e:2, c:3, d:4, h:5}
// newIndexToOldIndexMap: [5, 3, 4, 0]
//                         e  c  d  h
// LIS: [3, 4] → 索引 [1, 2] → c, d 不动

// 从后向前：
// h: 0 → 新增
// d: 在 LIS → 不动
// c: 在 LIS → 不动
// e: 不在 LIS → 移动
```

## 六、性能优化

### 6.1 key 的重要性

```javascript
// 有 key：O(n) 查找
keyToNewIndexMap.get(prevChild.key)

// 无 key：O(n²) 查找
for (j = s2; j <= e2; j++) {
  if (isSameVNodeType(prevChild, c2[j])) { }
}
```

### 6.2 LIS 复杂度

```javascript
// 时间复杂度：O(n log n)
// 空间复杂度：O(n)

// 相比简单移动（可能 O(n) 次 DOM 操作）
// LIS 找出最少移动次数
```

## 七、总结

| 步骤 | 作用 | 复杂度 |
|------|------|--------|
| 头部同步 | 处理相同前缀 | O(n) |
| 尾部同步 | 处理相同后缀 | O(n) |
| 新增/删除 | 简单情况快速处理 | O(n) |
| 乱序处理 | LIS 优化移动 | O(n log n) |

## 参考资料

- [Vue 3 Diff 源码](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)
- [最长递增子序列](https://en.wikipedia.org/wiki/Longest_increasing_subsequence)

---

**下一节** → [第 30 节：组件更新机制](./30-component-update.md)
