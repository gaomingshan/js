# 2.2 Getters 计算属性

## 概述

Getters 是 Store 的计算属性，类似于 Vue 组件的 `computed`。它们可以基于 State 派生新数据，具有缓存特性，只在依赖变化时重新计算。

## Getters 定义与使用

### 基本定义

Getters 接收 `state` 作为第一个参数：

```javascript
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [
      { id: 1, name: '商品A', price: 100, quantity: 2 },
      { id: 2, name: '商品B', price: 200, quantity: 1 }
    ],
    discount: 0.9 // 9折
  }),
  
  getters: {
    // 商品总数
    totalItems: (state) => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    
    // 原始总价
    subtotal: (state) => {
      return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    
    // 最终总价（应用折扣）
    total: (state) => {
      const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      return subtotal * state.discount
    }
  }
})
```

### 使用 Getters

```vue
<script setup>
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <div>
    <p>商品数量: {{ cart.totalItems }}</p>
    <p>小计: ¥{{ cart.subtotal }}</p>
    <p>折扣后: ¥{{ cart.total }}</p>
  </div>
</template>
```

## Getters 中的 this 指向

### 使用 this 访问 Store

普通函数语法中，`this` 指向 Store 实例：

```javascript
getters: {
  // 使用箭头函数：只能访问 state
  doubleCount: (state) => state.count * 2,
  
  // 使用普通函数：可以访问整个 Store
  message() {
    return `Count: ${this.count}, Double: ${this.doubleCount}`
  },
  
  // 访问 state 和其他 getters
  summary() {
    return {
      items: this.totalItems,
      subtotal: this.subtotal,
      total: this.total,
      savings: this.subtotal - this.total
    }
  }
}
```

### TypeScript 类型推导

```typescript
getters: {
  // ✅ 箭头函数：自动推导返回类型
  totalItems: (state): number => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0)
  },
  
  // ✅ 普通函数：手动标注返回类型
  message(): string {
    return `Total: ${this.total}`
  }
}
```

## 访问其他 Getters

### 在当前 Store 中访问

```javascript
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [
      { id: 1, name: 'A', price: 100, inStock: true },
      { id: 2, name: 'B', price: 200, inStock: false },
      { id: 3, name: 'C', price: 150, inStock: true }
    ]
  }),
  
  getters: {
    // Getter 1：库存商品
    inStockProducts: (state) => {
      return state.products.filter(p => p.inStock)
    },
    
    // Getter 2：访问其他 getter
    inStockCount() {
      return this.inStockProducts.length
    },
    
    // Getter 3：链式访问
    inStockMessage() {
      return `有 ${this.inStockCount} 件商品库存`
    },
    
    // Getter 4：组合多个 getters
    affordableInStock() {
      return this.inStockProducts.filter(p => p.price < 180)
    }
  }
})
```

### 访问其他 Store 的 Getters

```javascript
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  
  getters: {
    // 根据用户等级计算折扣
    discount() {
      const userStore = useUserStore()
      
      if (userStore.isVip) {
        return 0.8 // VIP 8折
      } else if (userStore.isMember) {
        return 0.9 // 会员 9折
      }
      return 1.0 // 无折扣
    },
    
    total() {
      const subtotal = this.items.reduce((sum, item) => sum + item.price, 0)
      return subtotal * this.discount
    }
  }
})
```

## 传递参数给 Getters

### 返回函数的 Getter

Getters 本身不接受参数，但可以返回一个函数来接受参数：

```javascript
export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [
      { id: 1, text: 'Task 1', done: false },
      { id: 2, text: 'Task 2', done: true },
      { id: 3, text: 'Task 3', done: false }
    ]
  }),
  
  getters: {
    // 返回函数：根据 ID 查找
    getTodoById: (state) => {
      return (id) => state.todos.find(todo => todo.id === id)
    },
    
    // 返回函数：根据状态过滤
    getTodosByStatus: (state) => {
      return (done) => state.todos.filter(todo => todo.done === done)
    },
    
    // 返回函数：组合查询
    searchTodos: (state) => {
      return (keyword) => {
        return state.todos.filter(todo => 
          todo.text.toLowerCase().includes(keyword.toLowerCase())
        )
      }
    }
  }
})

// 使用
const todo = todoStore.getTodoById(1)
const activeTodos = todoStore.getTodosByStatus(false)
const results = todoStore.searchTodos('Task')
```

### 参数化 Getter 的注意事项

⚠️ 返回函数的 Getter **不会缓存**：

```javascript
getters: {
  // ✅ 有缓存：只在 todos 变化时重新计算
  activeTodos: (state) => state.todos.filter(t => !t.done),
  
  // ❌ 无缓存：每次调用都会执行
  getTodoById: (state) => {
    return (id) => {
      console.log('查找中...') // 每次调用都会打印
      return state.todos.find(t => t.id === id)
    }
  }
}
```

## Getters 的缓存机制

### 缓存原理

Getters 类似 Vue 的 `computed`，基于响应式依赖缓存：

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    expensiveGetter: (state) => {
      console.log('计算中...')
      // 模拟复杂计算
      let result = 0
      for (let i = 0; i < state.count * 1000000; i++) {
        result += i
      }
      return result
    }
  }
})

// 使用
const store = useCounterStore()

console.log(store.expensiveGetter) // 打印 "计算中..."，返回结果
console.log(store.expensiveGetter) // 直接返回缓存结果，不打印
console.log(store.expensiveGetter) // 直接返回缓存结果，不打印

store.count++ // 修改依赖

console.log(store.expensiveGetter) // 再次打印 "计算中..."，重新计算
```

### 缓存失效条件

缓存会在以下情况失效：

1. **依赖的 State 变化**
2. **依赖的其他 Getters 变化**
3. **依赖的外部响应式数据变化**

```javascript
getters: {
  // 依赖 state.count
  double: (state) => state.count * 2,
  
  // 依赖 double getter
  quadruple() {
    return this.double * 2
  }
}

// count 变化 → double 重新计算 → quadruple 重新计算
```

### 手动控制缓存

对于需要手动控制的场景，可以结合 Actions：

```javascript
export const useDataStore = defineStore('data', {
  state: () => ({
    rawData: [],
    cacheVersion: 0 // 缓存版本号
  }),
  
  getters: {
    processedData: (state) => {
      // 依赖 cacheVersion，手动控制缓存失效
      return state.rawData.map(item => ({
        ...item,
        processed: true,
        version: state.cacheVersion
      }))
    }
  },
  
  actions: {
    invalidateCache() {
      this.cacheVersion++ // 强制重新计算 getter
    }
  }
})
```

## 关键点总结

1. **Getters 类似 computed**：基于 State 派生数据，自动缓存
2. **访问 State**：第一个参数是 `state`
3. **访问其他 Getters**：使用 `this.otherGetter`（普通函数）
4. **传递参数**：返回函数（但会失去缓存）
5. **缓存机制**：只在依赖变化时重新计算

## 深入一点

### Getters 组合模式

```javascript
export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    pageViews: [
      { page: '/home', views: 1000 },
      { page: '/about', views: 500 },
      { page: '/contact', views: 300 }
    ]
  }),
  
  getters: {
    // 基础 getter
    totalViews: (state) => {
      return state.pageViews.reduce((sum, item) => sum + item.views, 0)
    },
    
    // 组合 getter
    averageViews() {
      return this.totalViews / this.pageViewCount
    },
    
    // 辅助 getter
    pageViewCount: (state) => state.pageViews.length,
    
    // 高级组合
    topPages() {
      return [...this.sortedPages].slice(0, 3)
    },
    
    sortedPages: (state) => {
      return [...state.pageViews].sort((a, b) => b.views - a.views)
    }
  }
})
```

### 性能优化技巧

```javascript
getters: {
  // ❌ 性能差：每次都创建新数组
  filteredItems: (state) => {
    return state.items.filter(item => item.active).map(item => ({
      ...item,
      formatted: true
    }))
  },
  
  // ✅ 性能好：利用缓存，分步处理
  activeItems: (state) => state.items.filter(item => item.active),
  
  formattedItems() {
    return this.activeItems.map(item => ({
      ...item,
      formatted: true
    }))
  }
}
```

### TypeScript 完整示例

```typescript
interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
}

interface ProductState {
  products: Product[]
  selectedCategory: string | null
}

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    selectedCategory: null
  }),
  
  getters: {
    // 自动推导返回类型为 Product[]
    inStockProducts: (state) => {
      return state.products.filter(p => p.inStock)
    },
    
    // 手动标注返回类型
    productsByCategory(): Product[] {
      if (!this.selectedCategory) return this.products
      return this.products.filter(p => p.category === this.selectedCategory)
    },
    
    // 返回函数的 getter
    getProductById: (state) => {
      return (id: number): Product | undefined => {
        return state.products.find(p => p.id === id)
      }
    }
  }
})
```

## 参考资料

- [Pinia Getters 文档](https://pinia.vuejs.org/core-concepts/getters.html)
- [Vue 3 Computed 文档](https://vuejs.org/guide/essentials/computed.html)
- [JavaScript Array Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
