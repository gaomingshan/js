# 第 06 节：查询参数

## 概述

查询参数（Query Parameters）是 URL 中 `?` 后面的键值对，用于传递额外信息而不影响路由匹配。Vue Router 提供了完整的查询参数支持。

## 一、查询参数基础

### 1.1 查询参数格式

```
URL 格式：/path?key1=value1&key2=value2&key3=value3

示例：
/search?q=vue&category=tutorial&page=2
/user/123?tab=posts&sort=date&order=desc
```

### 1.2 访问查询参数

```vue
<template>
  <div>
    <p>搜索词：{{ $route.query.q }}</p>
    <p>分类：{{ $route.query.category }}</p>
    <p>页码：{{ $route.query.page }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 访问单个查询参数
console.log(route.query.q)        // "vue"
console.log(route.query.category) // "tutorial"
console.log(route.query.page)     // "2"

// 所有查询参数
console.log(route.query) // { q: "vue", category: "tutorial", page: "2" }
</script>
```

## 二、设置查询参数

### 2.1 声明式导航

```vue
<template>
  <!-- 使用 query 属性 -->
  <router-link :to="{ path: '/search', query: { q: 'vue', page: 1 } }">
    搜索 Vue
  </router-link>
  
  <!-- 使用完整 URL -->
  <router-link to="/search?q=vue&page=1">
    搜索 Vue
  </router-link>
  
  <!-- 动态查询参数 -->
  <router-link :to="{ 
    path: '/products', 
    query: { 
      category: selectedCategory, 
      sort: sortOrder 
    } 
  }">
    查看产品
  </router-link>
</template>

<script setup>
import { ref } from 'vue'

const selectedCategory = ref('electronics')
const sortOrder = ref('price')
</script>
```

### 2.2 编程式导航

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 设置查询参数
const search = (keyword) => {
  router.push({
    path: '/search',
    query: { q: keyword, page: 1 }
  })
}

// 更新查询参数
const updateFilters = (filters) => {
  router.push({
    query: { ...route.query, ...filters }
  })
}

// 清除特定参数
const clearFilter = (filterKey) => {
  const query = { ...route.query }
  delete query[filterKey]
  router.push({ query })
}

// 重置所有查询参数
const resetFilters = () => {
  router.push({ query: {} })
}
</script>
```

## 三、查询参数类型处理

### 3.1 字符串类型

```javascript
// 查询参数默认都是字符串类型
// URL: /page?count=5
console.log(route.query.count)        // "5" (字符串)
console.log(typeof route.query.count) // "string"
```

### 3.2 数值转换

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 安全的数值转换
const page = computed(() => {
  const pageParam = route.query.page
  const pageNum = parseInt(pageParam, 10)
  return isNaN(pageNum) ? 1 : Math.max(1, pageNum)
})

const limit = computed(() => {
  const limitParam = route.query.limit
  const limitNum = parseInt(limitParam, 10)
  return isNaN(limitNum) ? 20 : Math.min(100, Math.max(1, limitNum))
})

// 浮点数转换
const price = computed(() => {
  const priceParam = route.query.price
  const priceNum = parseFloat(priceParam)
  return isNaN(priceNum) ? 0 : Math.max(0, priceNum)
})
</script>
```

### 3.3 布尔值处理

```vue
<script setup>
const route = useRoute()

// 布尔值转换的几种方式
const isActive = computed(() => {
  // 方式1：检查是否存在
  return 'active' in route.query
})

const showDetails = computed(() => {
  // 方式2：字符串比较
  return route.query.details === 'true'
})

const includeArchived = computed(() => {
  // 方式3：真值检查
  return Boolean(route.query.archived) && route.query.archived !== 'false'
})

// URL 示例：
// /items?active           → isActive = true
// /items?details=true     → showDetails = true
// /items?archived=1       → includeArchived = true
// /items?archived=false   → includeArchived = false
</script>
```

### 3.4 数组参数

```vue
<script setup>
// 数组参数处理
const tags = computed(() => {
  const tagParam = route.query.tags
  
  if (!tagParam) return []
  
  // 单个值转数组
  if (typeof tagParam === 'string') {
    return tagParam.split(',').filter(Boolean)
  }
  
  // 多个同名参数
  if (Array.isArray(tagParam)) {
    return tagParam.filter(Boolean)
  }
  
  return []
})

// URL 示例：
// /posts?tags=vue,router        → tags = ['vue', 'router']
// /posts?tags=vue&tags=router   → tags = ['vue', 'router']
</script>
```

## 四、查询参数更新

### 4.1 响应式查询参数

```vue
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 双向绑定的查询参数
const searchQuery = computed({
  get: () => route.query.q || '',
  set: (value) => {
    router.replace({
      query: { ...route.query, q: value || undefined }
    })
  }
})

const currentPage = computed({
  get: () => parseInt(route.query.page) || 1,
  set: (page) => {
    router.replace({
      query: { ...route.query, page: page > 1 ? page : undefined }
    })
  }
})

// 在模板中使用
</script>

<template>
  <input v-model="searchQuery" placeholder="搜索..." />
  <button @click="currentPage = currentPage + 1">下一页</button>
</template>
```

### 4.2 批量更新

```vue
<script setup>
const updateQuery = (updates) => {
  const newQuery = { ...route.query }
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      delete newQuery[key]
    } else {
      newQuery[key] = value
    }
  })
  
  router.replace({ query: newQuery })
}

// 使用示例
const applyFilters = () => {
  updateQuery({
    category: selectedCategory.value,
    minPrice: minPrice.value || undefined,
    maxPrice: maxPrice.value || undefined,
    inStock: showInStock.value ? 'true' : undefined
  })
}
</script>
```

### 4.3 防抖更新

```vue
<script setup>
import { debounce } from 'lodash-es'

// 防抖更新查询参数
const debouncedUpdateQuery = debounce((key, value) => {
  const query = { ...route.query }
  
  if (value) {
    query[key] = value
  } else {
    delete query[key]
  }
  
  router.replace({ query })
}, 300)

// 搜索输入处理
const handleSearchInput = (event) => {
  debouncedUpdateQuery('q', event.target.value)
}
</script>
```

## 五、查询参数验证

### 5.1 参数验证

```vue
<script setup>
import { computed, watch } from 'vue'

// 验证查询参数
const validatedQuery = computed(() => {
  const query = route.query
  
  return {
    page: Math.max(1, parseInt(query.page) || 1),
    limit: Math.min(100, Math.max(10, parseInt(query.limit) || 20)),
    sort: ['name', 'date', 'price'].includes(query.sort) ? query.sort : 'name',
    order: ['asc', 'desc'].includes(query.order) ? query.order : 'asc'
  }
})

// 监听并纠正无效参数
watch(
  () => route.query,
  (newQuery) => {
    const correctedQuery = {}
    let needsCorrection = false
    
    // 检查页码
    const page = parseInt(newQuery.page)
    if (newQuery.page && (isNaN(page) || page < 1)) {
      correctedQuery.page = '1'
      needsCorrection = true
    }
    
    // 检查排序
    if (newQuery.sort && !['name', 'date', 'price'].includes(newQuery.sort)) {
      correctedQuery.sort = 'name'
      needsCorrection = true
    }
    
    if (needsCorrection) {
      router.replace({
        query: { ...newQuery, ...correctedQuery }
      })
    }
  }
)
</script>
```

### 5.2 类型安全的查询参数

```typescript
// TypeScript 类型定义
interface SearchQuery {
  q?: string
  category?: string
  page?: number
  limit?: number
  sort?: 'name' | 'date' | 'price'
  order?: 'asc' | 'desc'
}

const parseQuery = (query: LocationQuery): SearchQuery => {
  return {
    q: typeof query.q === 'string' ? query.q : undefined,
    category: typeof query.category === 'string' ? query.category : undefined,
    page: query.page ? Math.max(1, parseInt(query.page as string)) : 1,
    limit: query.limit ? Math.min(100, parseInt(query.limit as string)) : 20,
    sort: ['name', 'date', 'price'].includes(query.sort as string) 
      ? query.sort as 'name' | 'date' | 'price' 
      : 'name',
    order: ['asc', 'desc'].includes(query.order as string)
      ? query.order as 'asc' | 'desc'
      : 'asc'
  }
}
```

## 六、查询参数持久化

### 6.1 URL 状态同步

```vue
<script setup>
// 组件状态与 URL 查询参数同步
const filters = ref({
  category: '',
  minPrice: null,
  maxPrice: null,
  inStock: false
})

// 从 URL 初始化状态
const initFromQuery = () => {
  const query = route.query
  filters.value = {
    category: query.category || '',
    minPrice: query.minPrice ? parseFloat(query.minPrice) : null,
    maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : null,
    inStock: query.inStock === 'true'
  }
}

// 将状态同步到 URL
const syncToQuery = () => {
  const query = {}
  
  if (filters.value.category) {
    query.category = filters.value.category
  }
  if (filters.value.minPrice !== null) {
    query.minPrice = filters.value.minPrice.toString()
  }
  if (filters.value.maxPrice !== null) {
    query.maxPrice = filters.value.maxPrice.toString()
  }
  if (filters.value.inStock) {
    query.inStock = 'true'
  }
  
  router.replace({ query })
}

// 初始化
onMounted(() => {
  initFromQuery()
})

// 监听状态变化
watch(filters, syncToQuery, { deep: true })

// 监听路由变化
watch(() => route.query, initFromQuery)
</script>
```

### 6.2 查询参数缓存

```javascript
// 查询参数缓存管理
class QueryCache {
  constructor() {
    this.cache = new Map()
    this.maxSize = 50
  }
  
  set(route, data) {
    const key = this.getKey(route)
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
    
    // 清理过期缓存
    this.cleanup()
  }
  
  get(route) {
    const key = this.getKey(route)
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data
    }
    
    return null
  }
  
  getKey(route) {
    return `${route.path}?${new URLSearchParams(route.query).toString()}`
  }
  
  cleanup() {
    if (this.cache.size <= this.maxSize) return
    
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    for (let i = 0; i < entries.length - this.maxSize; i++) {
      this.cache.delete(entries[i][0])
    }
  }
}
```

## 七、常见使用场景

### 7.1 分页组件

```vue
<template>
  <div class="pagination">
    <button 
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
    >
      上一页
    </button>
    
    <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
    
    <button 
      :disabled="currentPage >= totalPages"
      @click="goToPage(currentPage + 1)"
    >
      下一页
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  totalPages: Number
})

const currentPage = computed(() => {
  return Math.max(1, parseInt(route.query.page) || 1)
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    router.push({
      query: { ...route.query, page: page.toString() }
    })
  }
}
</script>
```

### 7.2 搜索过滤器

```vue
<template>
  <div class="search-filters">
    <input 
      v-model="searchTerm"
      placeholder="搜索..."
    />
    
    <select v-model="category">
      <option value="">所有分类</option>
      <option value="tech">技术</option>
      <option value="design">设计</option>
    </select>
    
    <label>
      <input 
        type="checkbox" 
        v-model="showFeatured"
      />
      仅显示推荐
    </label>
  </div>
</template>

<script setup>
// 搜索词
const searchTerm = computed({
  get: () => route.query.q || '',
  set: debounce((value) => {
    updateQuery({ q: value || undefined })
  }, 300)
})

// 分类
const category = computed({
  get: () => route.query.category || '',
  set: (value) => {
    updateQuery({ category: value || undefined, page: undefined })
  }
})

// 是否显示推荐
const showFeatured = computed({
  get: () => route.query.featured === 'true',
  set: (value) => {
    updateQuery({ featured: value ? 'true' : undefined })
  }
})

const updateQuery = (updates) => {
  router.replace({
    query: { ...route.query, ...updates }
  })
}
</script>
```

## 八、最佳实践

### 8.1 查询参数命名

```javascript
// ✅ 好的命名
const goodQuery = {
  q: 'search term',        // 简短但明确
  page: '2',              // 标准名称
  sort: 'name',           // 描述性
  order: 'asc',           // 简洁明了
  category: 'tech',       // 完整单词
  minPrice: '100',        // 驼峰命名
  maxPrice: '500'
}

// ❌ 避免的命名
const badQuery = {
  searchTerm: 'search',   // 太长
  p: '2',                 // 太短
  sortOrder: 'name_asc',  // 混合概念
  cat: 'tech',           // 缩写不明确
  min_price: '100'       // 下划线命名
}
```

### 8.2 默认值处理

```vue
<script setup>
// 定义默认值
const defaults = {
  page: 1,
  limit: 20,
  sort: 'name',
  order: 'asc'
}

// 合并默认值和查询参数
const getQueryWithDefaults = () => {
  return { ...defaults, ...route.query }
}

// 移除默认值（避免 URL 冗余）
const cleanQuery = computed(() => {
  const query = { ...route.query }
  
  Object.entries(defaults).forEach(([key, defaultValue]) => {
    if (query[key] === defaultValue.toString()) {
      delete query[key]
    }
  })
  
  return query
})
</script>
```

### 8.3 查询参数组合

```vue
<script setup>
// 查询参数组合类
class QueryBuilder {
  constructor(baseQuery = {}) {
    this.query = { ...baseQuery }
  }
  
  set(key, value) {
    if (value === null || value === undefined || value === '') {
      delete this.query[key]
    } else {
      this.query[key] = value.toString()
    }
    return this
  }
  
  setIf(condition, key, value) {
    if (condition) {
      this.set(key, value)
    }
    return this
  }
  
  remove(key) {
    delete this.query[key]
    return this
  }
  
  build() {
    return { ...this.query }
  }
}

// 使用示例
const buildSearchQuery = (filters) => {
  return new QueryBuilder(route.query)
    .set('q', filters.searchTerm)
    .set('category', filters.category)
    .setIf(filters.showFeatured, 'featured', 'true')
    .setIf(filters.page > 1, 'page', filters.page)
    .build()
}
</script>
```

## 九、总结

| 特性 | 说明 |
|------|------|
| 访问方式 | `$route.query` 或 `useRoute().query` |
| 数据类型 | 始终是字符串，需要手动类型转换 |
| 更新方法 | 通过路由导航更新整个 query 对象 |
| 响应性 | 查询参数变化会触发组件重新渲染 |
| URL 格式 | `?key1=value1&key2=value2` |

## 参考资料

- [查询参数](https://router.vuejs.org/guide/essentials/navigation.html)
- [Location Query](https://router.vuejs.org/api/#locationquery)

---

**下一节** → [第 07 节：router-link 详解](./07-router-link.md)
