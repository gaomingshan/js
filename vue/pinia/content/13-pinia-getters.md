# 第 13 节：Getters 计算属性

## 概述

Getters 是 Pinia Store 中的计算属性，用于从状态中派生出新的数据。它们具有缓存特性，只有当依赖的状态发生变化时才会重新计算，是构建复杂应用状态逻辑的重要工具。

## 一、Getters 基础

### 1.1 Options API 中定义 Getters

```javascript
import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [
      { id: 1, name: 'iPhone', price: 999, category: 'phone', inStock: true },
      { id: 2, name: 'iPad', price: 599, category: 'tablet', inStock: false },
      { id: 3, name: 'MacBook', price: 1299, category: 'laptop', inStock: true }
    ],
    selectedCategory: 'all',
    searchQuery: ''
  }),
  
  getters: {
    // 简单的 getter - 箭头函数形式
    productCount: (state) => state.products.length,
    
    // 复杂的 getter - 普通函数形式，可以访问其他 getters
    expensiveProducts() {
      return this.products.filter(product => product.price > 800)
    },
    
    // 带参数的 getter
    productsByCategory: (state) => {
      return (category) => {
        if (category === 'all') return state.products
        return state.products.filter(product => product.category === category)
      }
    },
    
    // 组合多个条件
    filteredProducts() {
      let products = this.products
      
      // 按分类过滤
      if (this.selectedCategory !== 'all') {
        products = products.filter(p => p.category === this.selectedCategory)
      }
      
      // 按搜索关键词过滤
      if (this.searchQuery) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      return products
    },
    
    // 统计信息
    productStats() {
      const products = this.products
      return {
        total: products.length,
        inStock: products.filter(p => p.inStock).length,
        outOfStock: products.filter(p => !p.inStock).length,
        averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
        categories: [...new Set(products.map(p => p.category))],
        totalValue: products.reduce((sum, p) => sum + p.price, 0)
      }
    }
  }
})
```

### 1.2 Setup API 中定义 Getters

```javascript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', () => {
  // 状态
  const products = ref([
    { id: 1, name: 'iPhone', price: 999, category: 'phone', inStock: true },
    { id: 2, name: 'iPad', price: 599, category: 'tablet', inStock: false },
    { id: 3, name: 'MacBook', price: 1299, category: 'laptop', inStock: true }
  ])
  const selectedCategory = ref('all')
  const searchQuery = ref('')
  
  // Getters (使用 computed)
  const productCount = computed(() => products.value.length)
  
  const expensiveProducts = computed(() =>
    products.value.filter(product => product.price > 800)
  )
  
  // 带参数的 getter 函数
  const productsByCategory = computed(() => {
    return (category) => {
      if (category === 'all') return products.value
      return products.value.filter(product => product.category === category)
    }
  })
  
  const filteredProducts = computed(() => {
    let result = products.value
    
    if (selectedCategory.value !== 'all') {
      result = result.filter(p => p.category === selectedCategory.value)
    }
    
    if (searchQuery.value) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    return result
  })
  
  const productStats = computed(() => {
    const prods = products.value
    return {
      total: prods.length,
      inStock: prods.filter(p => p.inStock).length,
      outOfStock: prods.filter(p => !p.inStock).length,
      averagePrice: prods.reduce((sum, p) => sum + p.price, 0) / prods.length || 0,
      categories: [...new Set(prods.map(p => p.category))],
      totalValue: prods.reduce((sum, p) => sum + p.price, 0)
    }
  })
  
  return {
    products, selectedCategory, searchQuery,
    productCount, expensiveProducts, productsByCategory,
    filteredProducts, productStats
  }
})
```

## 二、Getters 高级用法

### 2.1 跨 Store 的 Getters

```javascript
// 用户 Store
export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: { id: 1, role: 'admin', vipLevel: 'gold' }
  }),
  
  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    vipDiscount: (state) => {
      const discounts = { bronze: 0.05, silver: 0.1, gold: 0.15, platinum: 0.2 }
      return discounts[state.currentUser?.vipLevel] || 0
    }
  }
})

// 商品 Store - 使用其他 Store 的 getters
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [
      { id: 1, name: 'iPhone', price: 999, adminOnly: false },
      { id: 2, name: 'Dev Tools', price: 299, adminOnly: true }
    ]
  }),
  
  getters: {
    // 在 getter 中使用其他 Store
    availableProducts() {
      const userStore = useUserStore()
      
      if (userStore.isAdmin) {
        return this.products // 管理员可以看到所有产品
      }
      
      return this.products.filter(p => !p.adminOnly)
    },
    
    // 根据用户等级计算折扣价格
    productsWithDiscount() {
      const userStore = useUserStore()
      const discount = userStore.vipDiscount
      
      return this.products.map(product => ({
        ...product,
        originalPrice: product.price,
        discountedPrice: product.price * (1 - discount),
        savings: product.price * discount
      }))
    }
  }
})
```

### 2.2 复杂计算和缓存

```javascript
export const useAnalyticsStore = defineStore('analytics', () => {
  const orders = ref([])
  const products = ref([])
  
  // 复杂的销售统计计算
  const salesAnalytics = computed(() => {
    console.log('Computing sales analytics...') // 只在依赖变化时执行
    
    const analytics = {
      totalRevenue: 0,
      totalOrders: orders.value.length,
      averageOrderValue: 0,
      topSellingProducts: [],
      revenueByMonth: {},
      revenueByCategory: {}
    }
    
    // 计算总收入
    analytics.totalRevenue = orders.value.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        return itemSum + (item.price * item.quantity)
      }, 0)
    }, 0)
    
    // 平均订单金额
    analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders || 0
    
    // 按月份统计收入
    orders.value.forEach(order => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7)
      const orderValue = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      analytics.revenueByMonth[month] = (analytics.revenueByMonth[month] || 0) + orderValue
    })
    
    // 热销商品统计
    const productSales = {}
    orders.value.forEach(order => {
      order.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity
      })
    })
    
    analytics.topSellingProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([productId, quantity]) => ({
        product: products.value.find(p => p.id === parseInt(productId)),
        quantity
      }))
    
    return analytics
  })
  
  // 用于图表的数据格式
  const chartData = computed(() => ({
    revenueChart: {
      labels: Object.keys(salesAnalytics.value.revenueByMonth),
      datasets: [{
        label: '月收入',
        data: Object.values(salesAnalytics.value.revenueByMonth)
      }]
    },
    
    topProductsChart: {
      labels: salesAnalytics.value.topSellingProducts.map(item => item.product?.name),
      datasets: [{
        label: '销量',
        data: salesAnalytics.value.topSellingProducts.map(item => item.quantity)
      }]
    }
  }))
  
  return {
    orders, products,
    salesAnalytics, chartData
  }
})
```

### 2.3 带参数的 Getters

```javascript
export const useSearchStore = defineStore('search', () => {
  const items = ref([])
  const searchHistory = ref([])
  
  // 基本搜索 getter
  const searchItems = computed(() => {
    return (query, options = {}) => {
      if (!query) return items.value
      
      let results = items.value.filter(item => {
        const searchText = item.name.toLowerCase() + ' ' + (item.description || '').toLowerCase()
        return searchText.includes(query.toLowerCase())
      })
      
      // 排序选项
      if (options.sortBy) {
        results.sort((a, b) => {
          if (options.sortOrder === 'desc') {
            return b[options.sortBy] > a[options.sortBy] ? 1 : -1
          }
          return a[options.sortBy] > b[options.sortBy] ? 1 : -1
        })
      }
      
      // 分页
      if (options.page && options.pageSize) {
        const start = (options.page - 1) * options.pageSize
        results = results.slice(start, start + options.pageSize)
      }
      
      return results
    }
  })
  
  // 高级搜索 getter
  const advancedSearch = computed(() => {
    return (criteria) => {
      return items.value.filter(item => {
        // 价格范围
        if (criteria.priceRange) {
          const [min, max] = criteria.priceRange
          if (item.price < min || item.price > max) return false
        }
        
        // 分类过滤
        if (criteria.categories && criteria.categories.length > 0) {
          if (!criteria.categories.includes(item.category)) return false
        }
        
        // 标签匹配
        if (criteria.tags && criteria.tags.length > 0) {
          const hasMatchingTag = criteria.tags.some(tag => 
            item.tags?.includes(tag)
          )
          if (!hasMatchingTag) return false
        }
        
        // 文本搜索
        if (criteria.query) {
          const searchText = [item.name, item.description, ...(item.tags || [])]
            .join(' ').toLowerCase()
          if (!searchText.includes(criteria.query.toLowerCase())) return false
        }
        
        return true
      })
    }
  })
  
  // 搜索建议
  const searchSuggestions = computed(() => {
    return (query) => {
      if (!query || query.length < 2) return []
      
      const suggestions = new Set()
      
      items.value.forEach(item => {
        // 商品名称匹配
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(item.name)
        }
        
        // 标签匹配
        item.tags?.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(tag)
          }
        })
      })
      
      // 历史搜索匹配
      searchHistory.value.forEach(historyItem => {
        if (historyItem.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(historyItem)
        }
      })
      
      return Array.from(suggestions).slice(0, 10)
    }
  })
  
  return {
    items, searchHistory,
    searchItems, advancedSearch, searchSuggestions
  }
})
```

## 三、组件中使用 Getters

### 3.1 基本使用方式

```vue
<template>
  <div class="product-list">
    <!-- 显示统计信息 -->
    <div class="stats">
      <p>总商品数: {{ productStore.productCount }}</p>
      <p>库存商品: {{ productStore.productStats.inStock }}</p>
      <p>平均价格: ${{ productStore.productStats.averagePrice.toFixed(2) }}</p>
    </div>
    
    <!-- 过滤控制 -->
    <div class="filters">
      <select v-model="productStore.selectedCategory">
        <option value="all">所有分类</option>
        <option 
          v-for="category in productStore.productStats.categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
      
      <input 
        v-model="productStore.searchQuery"
        placeholder="搜索商品..."
      />
    </div>
    
    <!-- 商品列表 -->
    <div class="products">
      <ProductCard 
        v-for="product in productStore.filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
    
    <!-- 高价商品 -->
    <div class="expensive-products">
      <h3>高价商品</h3>
      <ProductCard 
        v-for="product in productStore.expensiveProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup>
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'

const productStore = useProductStore()
</script>
```

### 3.2 响应式解构使用

```vue
<template>
  <div>
    <h2>商品统计: {{ productCount }}</h2>
    
    <div class="analytics">
      <div class="stat-card">
        <h3>库存状态</h3>
        <p>有库存: {{ productStats.inStock }}</p>
        <p>缺货: {{ productStats.outOfStock }}</p>
      </div>
      
      <div class="stat-card">
        <h3>价格信息</h3>
        <p>平均价格: ${{ productStats.averagePrice.toFixed(2) }}</p>
        <p>总价值: ${{ productStats.totalValue }}</p>
      </div>
    </div>
    
    <ProductGrid :products="filteredProducts" />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()

// 解构 getters 保持响应性
const { 
  productCount, 
  productStats, 
  filteredProducts, 
  expensiveProducts 
} = storeToRefs(productStore)
</script>
```

### 3.3 带参数的 Getters 使用

```vue
<template>
  <div>
    <!-- 分类选择 -->
    <div class="category-tabs">
      <button 
        v-for="category in categories"
        :key="category"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category"
      >
        {{ category }} ({{ getProductsByCategory(category).length }})
      </button>
    </div>
    
    <!-- 搜索功能 -->
    <div class="search-section">
      <input 
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="搜索商品..."
      />
      
      <!-- 搜索建议 -->
      <div v-if="suggestions.length > 0" class="suggestions">
        <div 
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="searchQuery = suggestion"
          class="suggestion-item"
        >
          {{ suggestion }}
        </div>
      </div>
    </div>
    
    <!-- 搜索结果 -->
    <div class="search-results">
      <ProductCard 
        v-for="product in searchResults"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/product'
import { useSearchStore } from '@/stores/search'

const productStore = useProductStore()
const searchStore = useSearchStore()

const selectedCategory = ref('all')
const searchQuery = ref('')

// 获取分类列表
const { productStats } = storeToRefs(productStore)
const categories = computed(() => ['all', ...productStats.value.categories])

// 使用带参数的 getter
const getProductsByCategory = (category) => {
  return productStore.productsByCategory(category)
}

// 搜索相关
const handleSearch = () => {
  // 可以添加防抖处理
}

const suggestions = computed(() => {
  return searchStore.searchSuggestions(searchQuery.value)
})

const searchResults = computed(() => {
  return searchStore.searchItems(searchQuery.value, {
    sortBy: 'name',
    sortOrder: 'asc'
  })
})
</script>
```

## 四、Getters 最佳实践

### 4.1 性能优化

```javascript
export const useOptimizedStore = defineStore('optimized', () => {
  const largeDataset = ref([])
  const filters = ref({ category: '', minPrice: 0, maxPrice: 1000 })
  
  // 使用 computed 缓存昂贵的计算
  const expensiveCalculation = computed(() => {
    console.log('Performing expensive calculation...')
    
    return largeDataset.value
      .filter(item => item.price >= filters.value.minPrice)
      .filter(item => item.price <= filters.value.maxPrice)
      .map(item => ({
        ...item,
        // 复杂的计算
        score: calculateComplexScore(item),
        ranking: calculateRanking(item)
      }))
      .sort((a, b) => b.score - a.score)
  })
  
  // 分步骤计算，提高可读性和调试能力
  const filteredByPrice = computed(() => {
    return largeDataset.value.filter(item => 
      item.price >= filters.value.minPrice && 
      item.price <= filters.value.maxPrice
    )
  })
  
  const enrichedItems = computed(() => {
    return filteredByPrice.value.map(item => ({
      ...item,
      score: calculateComplexScore(item),
      ranking: calculateRanking(item)
    }))
  })
  
  const sortedItems = computed(() => {
    return enrichedItems.value.sort((a, b) => b.score - a.score)
  })
  
  return {
    largeDataset, filters,
    expensiveCalculation,
    filteredByPrice, enrichedItems, sortedItems
  }
})

function calculateComplexScore(item) {
  // 模拟复杂计算
  return item.rating * item.popularity * Math.log(item.price)
}

function calculateRanking(item) {
  // 模拟复杂排名计算
  return item.sales * 0.7 + item.rating * 0.3
}
```

### 4.2 错误处理和边界情况

```javascript
export const useSafeGettersStore = defineStore('safeGetters', () => {
  const users = ref([])
  const orders = ref([])
  
  // 安全的 getters，处理边界情况
  const userStats = computed(() => {
    try {
      if (!users.value || users.value.length === 0) {
        return {
          total: 0,
          active: 0,
          averageAge: 0,
          topUser: null
        }
      }
      
      const activeUsers = users.value.filter(user => user.isActive)
      const ages = users.value.map(user => user.age).filter(age => age > 0)
      
      return {
        total: users.value.length,
        active: activeUsers.length,
        averageAge: ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0,
        topUser: users.value.reduce((top, user) => 
          !top || user.score > top.score ? user : top, null
        )
      }
    } catch (error) {
      console.error('Error calculating user stats:', error)
      return {
        total: 0,
        active: 0,
        averageAge: 0,
        topUser: null
      }
    }
  })
  
  // 处理关联数据的 getter
  const ordersWithUserInfo = computed(() => {
    if (!orders.value || !users.value) return []
    
    return orders.value.map(order => {
      const user = users.value.find(u => u.id === order.userId)
      
      return {
        ...order,
        user: user || { id: order.userId, name: 'Unknown User' },
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'No Email'
      }
    })
  })
  
  return {
    users, orders,
    userStats, ordersWithUserInfo
  }
})
```

### 4.3 TypeScript 支持

```typescript
interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
  tags?: string[]
}

interface ProductStats {
  total: number
  inStock: number
  outOfStock: number
  averagePrice: number
  categories: string[]
  totalValue: number
}

export const useTypedProductStore = defineStore('typedProduct', () => {
  const products = ref<Product[]>([])
  const selectedCategory = ref<string>('all')
  
  // 明确的类型定义
  const productStats = computed((): ProductStats => {
    const prods = products.value
    return {
      total: prods.length,
      inStock: prods.filter(p => p.inStock).length,
      outOfStock: prods.filter(p => !p.inStock).length,
      averagePrice: prods.reduce((sum, p) => sum + p.price, 0) / prods.length || 0,
      categories: [...new Set(prods.map(p => p.category))],
      totalValue: prods.reduce((sum, p) => sum + p.price, 0)
    }
  })
  
  // 带参数的 getter 类型
  const productsByCategory = computed(() => {
    return (category: string): Product[] => {
      if (category === 'all') return products.value
      return products.value.filter(product => product.category === category)
    }
  })
  
  // 泛型 getter
  const filterProducts = computed(() => {
    return <T extends keyof Product>(
      field: T, 
      value: Product[T]
    ): Product[] => {
      return products.value.filter(product => product[field] === value)
    }
  })
  
  return {
    products,
    selectedCategory,
    productStats,
    productsByCategory,
    filterProducts
  }
})
```

## 参考资料

- [Pinia Getters](https://pinia.vuejs.org/core-concepts/getters.html)
- [Vue Computed Properties](https://vuejs.org/guide/essentials/computed.html)
- [JavaScript Performance Best Practices](https://developer.mozilla.org/en-US/docs/Web/Performance)

**下一节** → [第 14 节：Actions 方法](./14-pinia-actions.md)
