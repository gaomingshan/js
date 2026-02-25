# 5.1 性能优化技巧

## 概述

虽然 Pinia 本身已经很轻量高效，但在大型应用中仍需注意性能优化。本节介绍常见的性能优化技巧和最佳实践。

## 避免不必要的响应式

### 使用 markRaw

对于不需要响应式的数据，使用 `markRaw` 标记：

```javascript
import { markRaw } from 'vue'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
  state: () => ({
    // ❌ 不好：地图实例被转为响应式（大量性能开销）
    mapInstance: null,
    
    // ✅ 好：使用 markRaw 避免响应式
    mapInstance: markRaw(null)
  }),
  
  actions: {
    initMap() {
      // 第三方库实例不需要响应式
      this.mapInstance = markRaw(new MapLibrary())
    }
  }
})
```

### 常见的非响应式数据

```javascript
export const useEditorStore = defineStore('editor', {
  state: () => ({
    // 编辑器实例
    editor: markRaw(null),
    
    // Chart 实例
    charts: markRaw([]),
    
    // 复杂的类实例
    validator: markRaw(new Validator()),
    
    // 大型配置对象（只读）
    config: markRaw({
      // 大量配置...
    }),
    
    // 需要响应式的数据
    content: '',
    isDirty: false
  }),
  
  actions: {
    initEditor(element) {
      // Monaco Editor 等第三方库
      this.editor = markRaw(new Editor(element))
    }
  }
})
```

### shallowRef 和 shallowReactive

```javascript
import { shallowRef, shallowReactive } from 'vue'
import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', () => {
  // 只有根层级响应式，内部属性不响应
  const largeArray = shallowRef([])
  
  // 浅层响应式对象
  const config = shallowReactive({
    nested: {
      // 这里不是响应式的
      deepProperty: 'value'
    }
  })
  
  // 更新整个数组（触发响应）
  function updateArray(newArray) {
    largeArray.value = newArray
  }
  
  // ❌ 不会触发响应
  function updateItem(index, value) {
    largeArray.value[index] = value
  }
  
  return {
    largeArray,
    config,
    updateArray,
    updateItem
  }
})
```

## 合理使用 Getters 缓存

### 利用缓存机制

```javascript
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    filter: 'all'
  }),
  
  getters: {
    // ✅ 好：getter 会缓存结果
    filteredProducts: (state) => {
      console.log('计算 filteredProducts') // 只在依赖变化时执行
      
      if (state.filter === 'all') {
        return state.products
      }
      
      return state.products.filter(p => p.category === state.filter)
    },
    
    // ✅ 好：基于其他 getter 的缓存
    sortedProducts() {
      console.log('计算 sortedProducts')
      return [...this.filteredProducts].sort((a, b) => a.price - b.price)
    },
    
    // ❌ 不好：返回函数，没有缓存
    getProductById: (state) => {
      return (id) => {
        console.log('查找产品', id) // 每次调用都执行
        return state.products.find(p => p.id === id)
      }
    }
  }
})

// 使用
const store = useProductStore()

// 多次访问，只计算一次
console.log(store.filteredProducts) // 打印 "计算 filteredProducts"
console.log(store.filteredProducts) // 不打印，使用缓存
console.log(store.filteredProducts) // 不打印，使用缓存

// 每次调用都计算
const p1 = store.getProductById(1) // 打印 "查找产品 1"
const p2 = store.getProductById(1) // 打印 "查找产品 1"（没有缓存）
```

### 避免在 Getter 中进行昂贵操作

```javascript
// ❌ 不好：每次访问都执行复杂计算
getters: {
  expensiveData: (state) => {
    return state.items.map(item => {
      // 复杂的转换逻辑
      return heavyTransform(item)
    })
  }
}

// ✅ 好：在 action 中计算并缓存结果
state: () => ({
  items: [],
  processedItems: []
}),

actions: {
  processItems() {
    this.processedItems = this.items.map(item => heavyTransform(item))
  }
}
```

## 大数据量的处理策略

### 虚拟滚动

对于大列表，使用虚拟滚动而不是全部渲染：

```javascript
export const useListStore = defineStore('list', {
  state: () => ({
    allItems: [], // 所有数据
    visibleRange: { start: 0, end: 50 }
  }),
  
  getters: {
    // 只返回可见部分
    visibleItems: (state) => {
      return state.allItems.slice(
        state.visibleRange.start,
        state.visibleRange.end
      )
    }
  },
  
  actions: {
    updateVisibleRange(start, end) {
      this.visibleRange = { start, end }
    }
  }
})
```

### 分页加载

```javascript
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    currentPage: 1,
    pageSize: 20,
    total: 0
  }),
  
  getters: {
    totalPages: (state) => Math.ceil(state.total / state.pageSize)
  },
  
  actions: {
    async fetchPage(page) {
      const response = await fetch(
        `/api/products?page=${page}&size=${this.pageSize}`
      )
      const data = await response.json()
      
      this.products = data.items
      this.total = data.total
      this.currentPage = page
    }
  }
})
```

### 数据分块处理

```javascript
export const useDataStore = defineStore('data', {
  state: () => ({
    chunks: new Map() // 按块存储数据
  }),
  
  getters: {
    getChunk: (state) => {
      return (chunkId) => state.chunks.get(chunkId)
    }
  },
  
  actions: {
    async loadChunk(chunkId) {
      if (this.chunks.has(chunkId)) {
        return this.chunks.get(chunkId)
      }
      
      const data = await fetch(`/api/data/chunk/${chunkId}`).then(r => r.json())
      this.chunks.set(chunkId, data)
      return data
    },
    
    unloadChunk(chunkId) {
      this.chunks.delete(chunkId)
    }
  }
})
```

## 按需加载 Store

### 动态导入 Store

```javascript
// router/index.js
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: async (to, from, next) => {
      // 只在访问管理页面时加载管理员 Store
      const { useAdminStore } = await import('@/stores/admin')
      const adminStore = useAdminStore()
      
      if (!adminStore.hasPermission) {
        next('/forbidden')
      } else {
        next()
      }
    }
  }
]
```

### 懒加载组合 Store

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 懒加载组件及其 Store
const HeavyComponent = defineAsyncComponent(async () => {
  // 并行加载组件和 Store
  const [component, { useHeavyStore }] = await Promise.all([
    import('./HeavyComponent.vue'),
    import('@/stores/heavy')
  ])
  
  // 初始化 Store
  const store = useHeavyStore()
  await store.init()
  
  return component
})
</script>
```

### Store 代码分割

```javascript
// stores/index.js
export const useUserStore = () => import('./user').then(m => m.useUserStore())
export const useCartStore = () => import('./cart').then(m => m.useCartStore())
export const useAdminStore = () => import('./admin').then(m => m.useAdminStore())

// 使用
async function loadUserData() {
  const userStore = await useUserStore()
  await userStore.fetchUser()
}
```

## 批量更新优化

### 使用 $patch 批量修改

```javascript
const store = useCartStore()

// ❌ 不好：多次触发响应式更新
items.forEach(item => {
  store.items.push(item)
  store.total += item.price
  store.count++
})

// ✅ 好：只触发一次更新
store.$patch((state) => {
  items.forEach(item => {
    state.items.push(item)
    state.total += item.price
    state.count++
  })
})
```

### 防抖更新

```javascript
import { debounce } from 'lodash-es'

export const useSearchStore = defineStore('search', {
  state: () => ({
    keyword: '',
    results: []
  }),
  
  actions: {
    // 防抖搜索
    search: debounce(async function(keyword) {
      this.keyword = keyword
      const results = await fetch(`/api/search?q=${keyword}`).then(r => r.json())
      this.results = results
    }, 300)
  }
})
```

### 节流更新

```javascript
import { throttle } from 'lodash-es'

export const useScrollStore = defineStore('scroll', {
  state: () => ({
    scrollY: 0
  }),
  
  actions: {
    // 节流更新滚动位置
    updateScrollY: throttle(function(y) {
      this.scrollY = y
    }, 100)
  }
})
```

## 内存优化

### 清理不用的数据

```javascript
export const useCacheStore = defineStore('cache', {
  state: () => ({
    cache: new Map(),
    maxSize: 100
  }),
  
  actions: {
    set(key, value) {
      // 超过最大容量时清理最旧的数据
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value
        this.cache.delete(firstKey)
      }
      
      this.cache.set(key, value)
    },
    
    clear() {
      this.cache.clear()
    }
  }
})
```

### 使用 WeakMap 自动回收

```javascript
export const useWeakCacheStore = defineStore('weakCache', {
  state: () => ({
    cache: new WeakMap()
  }),
  
  actions: {
    set(obj, value) {
      // obj 被垃圾回收时，对应的缓存也会自动清除
      this.cache.set(obj, value)
    },
    
    get(obj) {
      return this.cache.get(obj)
    }
  }
})
```

### 定期清理过期数据

```javascript
export const useDataStore = defineStore('data', {
  state: () => ({
    items: new Map()
  }),
  
  actions: {
    add(key, value, ttl = 5 * 60 * 1000) {
      this.items.set(key, {
        value,
        expires: Date.now() + ttl
      })
    },
    
    get(key) {
      const item = this.items.get(key)
      
      if (!item) return null
      
      if (Date.now() > item.expires) {
        this.items.delete(key)
        return null
      }
      
      return item.value
    },
    
    // 定期清理过期数据
    cleanup() {
      const now = Date.now()
      
      for (const [key, item] of this.items.entries()) {
        if (now > item.expires) {
          this.items.delete(key)
        }
      }
    }
  }
})

// 定期执行清理
setInterval(() => {
  const store = useDataStore()
  store.cleanup()
}, 60 * 1000) // 每分钟清理一次
```

## 关键点总结

1. **markRaw**：第三方库实例、大型对象不需要响应式
2. **Getter 缓存**：利用缓存，避免重复计算
3. **大数据处理**：虚拟滚动、分页、分块加载
4. **按需加载**：动态导入 Store，减少初始包体积
5. **批量更新**：使用 `$patch`，减少响应式触发次数

## 深入一点

### 性能监控

```javascript
// plugins/performance.js
export function performancePlugin({ store }) {
  const metrics = {
    stateChanges: 0,
    actionCalls: {}
  }
  
  // 监控 state 变化
  store.$subscribe(() => {
    metrics.stateChanges++
  })
  
  // 监控 action 性能
  store.$onAction(({ name, after }) => {
    const start = performance.now()
    
    after(() => {
      const duration = performance.now() - start
      
      if (!metrics.actionCalls[name]) {
        metrics.actionCalls[name] = []
      }
      metrics.actionCalls[name].push(duration)
      
      // 警告慢操作
      if (duration > 1000) {
        console.warn(`Action ${name} took ${duration.toFixed(2)}ms`)
      }
    })
  })
  
  // 暴露性能数据
  store.$performance = metrics
}
```

### 使用 computed 优化

```vue
<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/product'

const store = useProductStore()
const { products } = storeToRefs(store)

// ❌ 不好：在模板中进行复杂计算
</script>

<template>
  <div v-for="product in products.filter(p => p.price > 100)" :key="product.id">
    {{ product.name }}
  </div>
</template>

<script setup>
// ✅ 好：使用 computed 缓存计算结果
const expensiveProducts = computed(() => {
  return products.value.filter(p => p.price > 100)
})
</script>

<template>
  <div v-for="product in expensiveProducts" :key="product.id">
    {{ product.name }}
  </div>
</template>
```

### 选择性响应式更新

```javascript
export const useFormStore = defineStore('form', {
  state: () => ({
    formData: {},
    errors: {},
    touched: {}
  }),
  
  actions: {
    // 只更新变化的字段
    updateField(field, value) {
      if (this.formData[field] !== value) {
        this.formData[field] = value
        this.validateField(field)
      }
    },
    
    // 批量更新
    updateFields(updates) {
      const changes = Object.entries(updates).filter(
        ([key, value]) => this.formData[key] !== value
      )
      
      if (changes.length > 0) {
        this.$patch((state) => {
          changes.forEach(([key, value]) => {
            state.formData[key] = value
          })
        })
      }
    }
  }
})
```

## 参考资料

- [Vue 3 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [markRaw API](https://vuejs.org/api/reactivity-advanced.html#markraw)
- [虚拟滚动库](https://github.com/tangbc/vue-virtual-scroll-list)
- [Lodash 工具函数](https://lodash.com/)
