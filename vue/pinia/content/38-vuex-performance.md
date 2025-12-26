# 第 38 节：性能优化

## 概述

Vuex 应用的性能优化涉及状态管理、计算缓存、内存使用和渲染优化等多个方面。本节介绍如何识别性能瓶颈并进行针对性优化。

## 一、状态结构优化

### 1.1 数据归一化

```javascript
// ❌ 嵌套结构导致的性能问题
const badState = {
  posts: [
    {
      id: 1,
      title: 'Post 1',
      author: { id: 1, name: 'John', avatar: 'avatar1.jpg' },
      comments: [
        { id: 1, text: 'Comment 1', author: { id: 2, name: 'Jane' } },
        { id: 2, text: 'Comment 2', author: { id: 1, name: 'John' } }
      ]
    }
  ]
}

// ✅ 归一化结构
const optimizedState = {
  entities: {
    users: {
      byId: {
        1: { id: 1, name: 'John', avatar: 'avatar1.jpg' },
        2: { id: 2, name: 'Jane', avatar: 'avatar2.jpg' }
      },
      allIds: [1, 2]
    },
    posts: {
      byId: {
        1: { id: 1, title: 'Post 1', authorId: 1, commentIds: [1, 2] }
      },
      allIds: [1]
    },
    comments: {
      byId: {
        1: { id: 1, text: 'Comment 1', authorId: 2, postId: 1 },
        2: { id: 2, text: 'Comment 2', authorId: 1, postId: 1 }
      },
      allIds: [1, 2]
    }
  }
}

// 归一化辅助函数
const normalizeHelpers = {
  normalizeArray(entities, idField = 'id') {
    return {
      byId: entities.reduce((acc, entity) => {
        acc[entity[idField]] = entity
        return acc
      }, {}),
      allIds: entities.map(entity => entity[idField])
    }
  },
  
  denormalizeArray(normalizedData) {
    return normalizedData.allIds.map(id => normalizedData.byId[id])
  },
  
  addEntity(state, entity, idField = 'id') {
    const id = entity[idField]
    state.byId[id] = entity
    if (!state.allIds.includes(id)) {
      state.allIds.push(id)
    }
  },
  
  removeEntity(state, id) {
    delete state.byId[id]
    state.allIds = state.allIds.filter(entityId => entityId !== id)
  }
}
```

### 1.2 懒加载状态

```javascript
// 按需加载的模块状态
const lazyLoadingModule = {
  namespaced: true,
  
  state: () => ({
    loadedSections: new Set(),
    sections: {},
    loading: {}
  }),
  
  mutations: {
    SET_SECTION_LOADING(state, { section, loading }) {
      state.loading[section] = loading
    },
    
    SET_SECTION_DATA(state, { section, data }) {
      state.sections[section] = data
      state.loadedSections.add(section)
      state.loading[section] = false
    }
  },
  
  getters: {
    isSectionLoaded: (state) => (section) => {
      return state.loadedSections.has(section)
    },
    
    getSectionData: (state) => (section) => {
      return state.sections[section]
    }
  },
  
  actions: {
    async loadSection({ commit, getters }, section) {
      if (getters.isSectionLoaded(section)) {
        return getters.getSectionData(section)
      }
      
      commit('SET_SECTION_LOADING', { section, loading: true })
      
      try {
        const data = await import(`@/data/${section}.js`)
        commit('SET_SECTION_DATA', { section, data: data.default })
        return data.default
      } catch (error) {
        commit('SET_SECTION_LOADING', { section, loading: false })
        throw error
      }
    }
  }
}
```

## 二、Getter 性能优化

### 2.1 缓存策略

```javascript
// 高效的 getter 缓存实现
const createCachedGetters = () => {
  const cache = new Map()
  const dependencies = new Map()
  
  return {
    // 带缓存的计算属性
    cachedGetter(state, getters, rootState, rootGetters) {
      const cacheKey = 'expensiveCalculation'
      const deps = [state.items, state.filters, state.sortBy]
      
      // 检查依赖是否变化
      if (cache.has(cacheKey)) {
        const cachedDeps = dependencies.get(cacheKey)
        if (deps.every((dep, index) => dep === cachedDeps[index])) {
          return cache.get(cacheKey)
        }
      }
      
      // 执行计算
      const result = expensiveCalculation(state.items, state.filters, state.sortBy)
      
      // 更新缓存
      cache.set(cacheKey, result)
      dependencies.set(cacheKey, deps)
      
      return result
    },
    
    // 参数化 getter 的缓存版本
    getCachedItemsByFilter: (state) => {
      const filterCache = new Map()
      
      return (filter) => {
        if (filterCache.has(filter)) {
          return filterCache.get(filter)
        }
        
        const result = state.items.filter(item => 
          Object.keys(filter).every(key => item[key] === filter[key])
        )
        
        filterCache.set(filter, result)
        
        // 限制缓存大小
        if (filterCache.size > 100) {
          const firstKey = filterCache.keys().next().value
          filterCache.delete(firstKey)
        }
        
        return result
      }
    }
  }
}

// 使用缓存的 getter 示例
const optimizedGetters = {
  // 简单缓存
  expensiveData: (state) => {
    if (state._cachedData && !state._cacheInvalid) {
      return state._cachedData
    }
    
    const result = performHeavyCalculation(state.rawData)
    state._cachedData = result
    state._cacheInvalid = false
    
    return result
  },
  
  // 基于多个依赖的缓存
  derivedStats: (state, getters) => {
    const deps = [state.users.length, state.posts.length, state.lastUpdate]
    const depsKey = deps.join('|')
    
    if (state._statsCache && state._statsCacheKey === depsKey) {
      return state._statsCache
    }
    
    const stats = calculateComplexStats(state.users, state.posts)
    state._statsCache = stats
    state._statsCacheKey = depsKey
    
    return stats
  }
}
```

### 2.2 计算优化

```javascript
// 优化的计算逻辑
const performanceOptimizedGetters = {
  // 使用 memoization
  memoizedCalculation: (() => {
    let cache = new Map()
    let cacheSize = 0
    const maxCacheSize = 50
    
    return (state) => (params) => {
      const key = JSON.stringify(params)
      
      if (cache.has(key)) {
        return cache.get(key)
      }
      
      const result = expensiveOperation(state.data, params)
      
      // 缓存管理
      if (cacheSize >= maxCacheSize) {
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
        cacheSize--
      }
      
      cache.set(key, result)
      cacheSize++
      
      return result
    }
  })(),
  
  // 增量计算
  incrementallyUpdatedList: (state) => {
    if (!state._incrementalCache) {
      state._incrementalCache = {
        result: [],
        lastProcessedId: 0
      }
    }
    
    const cache = state._incrementalCache
    const newItems = state.items.filter(item => item.id > cache.lastProcessedId)
    
    if (newItems.length > 0) {
      const processedNewItems = newItems.map(processItem)
      cache.result = [...cache.result, ...processedNewItems]
      cache.lastProcessedId = Math.max(...newItems.map(item => item.id))
    }
    
    return cache.result
  }
}
```

## 三、Mutation 优化

### 3.1 批量更新

```javascript
// 批量更新的 mutations
const batchMutations = {
  // 批量设置多个字段
  BATCH_UPDATE_STATE(state, updates) {
    Object.keys(updates).forEach(key => {
      if (state.hasOwnProperty(key)) {
        state[key] = updates[key]
      }
    })
  },
  
  // 批量更新数组项
  BATCH_UPDATE_ITEMS(state, updates) {
    const updateMap = new Map(updates.map(item => [item.id, item]))
    
    state.items = state.items.map(item => {
      const update = updateMap.get(item.id)
      return update ? { ...item, ...update } : item
    })
  },
  
  // 高效的数组操作
  EFFICIENT_ARRAY_OPERATIONS(state, { operation, data }) {
    switch (operation) {
      case 'addMultiple':
        // 使用 push.apply 而不是多次 push
        state.items.push(...data)
        break
        
      case 'removeMultiple':
        // 使用 Set 进行快速查找
        const toRemove = new Set(data)
        state.items = state.items.filter(item => !toRemove.has(item.id))
        break
        
      case 'updateMultiple':
        // 预先构建查找表
        const updateMap = new Map(data.map(item => [item.id, item]))
        for (let i = 0; i < state.items.length; i++) {
          const update = updateMap.get(state.items[i].id)
          if (update) {
            state.items[i] = { ...state.items[i], ...update }
          }
        }
        break
    }
  }
}
```

### 3.2 避免不必要的响应式

```javascript
// 优化响应式性能
const responseOptimizedMutations = {
  // 使用 Object.freeze 防止不必要的响应式
  SET_STATIC_DATA(state, data) {
    state.staticData = Object.freeze(data)
  },
  
  // 大型对象的部分更新
  UPDATE_LARGE_OBJECT(state, { path, value }) {
    // 只更新需要的部分，避免整个对象的响应式更新
    const keys = path.split('.')
    let current = state.largeObject
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
  },
  
  // 使用 Object.assign 进行浅层合并
  SHALLOW_MERGE_CONFIG(state, newConfig) {
    state.config = Object.assign({}, state.config, newConfig)
  }
}
```

## 四、Action 优化

### 4.1 请求去重和缓存

```javascript
// 请求去重和缓存的 actions
const optimizedActions = {
  // 请求去重
  async fetchUserWithDeduplication({ state, commit }, userId) {
    const cacheKey = `user:${userId}`
    
    // 检查正在进行的请求
    if (state._pendingRequests && state._pendingRequests[cacheKey]) {
      return state._pendingRequests[cacheKey]
    }
    
    // 检查缓存
    const cachedUser = state._userCache && state._userCache[userId]
    const cacheAge = Date.now() - (state._cacheTimestamps?.[userId] || 0)
    
    if (cachedUser && cacheAge < 5 * 60 * 1000) { // 5分钟缓存
      return cachedUser
    }
    
    // 创建并缓存请求
    if (!state._pendingRequests) {
      state._pendingRequests = {}
    }
    
    const promise = fetch(`/api/users/${userId}`)
      .then(response => response.json())
      .then(user => {
        // 更新缓存
        if (!state._userCache) {
          state._userCache = {}
          state._cacheTimestamps = {}
        }
        
        state._userCache[userId] = user
        state._cacheTimestamps[userId] = Date.now()
        
        return user
      })
      .finally(() => {
        delete state._pendingRequests[cacheKey]
      })
    
    state._pendingRequests[cacheKey] = promise
    return promise
  },
  
  // 批量请求优化
  async fetchMultipleUsers({ dispatch }, userIds) {
    // 将请求分批处理
    const batchSize = 10
    const batches = []
    
    for (let i = 0; i < userIds.length; i += batchSize) {
      batches.push(userIds.slice(i, i + batchSize))
    }
    
    // 并行处理批次
    const results = await Promise.allSettled(
      batches.map(batch => 
        fetch('/api/users/batch', {
          method: 'POST',
          body: JSON.stringify({ ids: batch })
        }).then(r => r.json())
      )
    )
    
    return results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value)
  }
}
```

### 4.2 防抖和节流

```javascript
// 防抖和节流的实现
const createDebouncedAction = (action, delay = 300) => {
  let timeoutId = null
  
  return function({ commit, dispatch, state, getters }, ...args) {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(async () => {
        const result = await action.call(this, 
          { commit, dispatch, state, getters }, 
          ...args
        )
        resolve(result)
      }, delay)
    })
  }
}

const createThrottledAction = (action, delay = 300) => {
  let lastExecution = 0
  
  return async function({ commit, dispatch, state, getters }, ...args) {
    const now = Date.now()
    
    if (now - lastExecution >= delay) {
      lastExecution = now
      return await action.call(this, 
        { commit, dispatch, state, getters }, 
        ...args
      )
    }
  }
}

// 使用示例
const searchActions = {
  // 防抖搜索
  searchWithDebounce: createDebouncedAction(
    async ({ commit }, query) => {
      const results = await searchAPI(query)
      commit('SET_SEARCH_RESULTS', results)
      return results
    },
    500
  ),
  
  // 节流刷新
  refreshWithThrottle: createThrottledAction(
    async ({ dispatch }) => {
      await dispatch('fetchLatestData')
    },
    1000
  )
}
```

## 五、内存优化

### 5.1 内存泄漏预防

```javascript
// 内存管理最佳实践
const memoryOptimizedModule = {
  namespaced: true,
  
  state: () => ({
    data: null,
    subscriptions: [],
    timers: [],
    cache: new Map(),
    maxCacheSize: 100
  }),
  
  mutations: {
    ADD_SUBSCRIPTION(state, subscription) {
      state.subscriptions.push(subscription)
    },
    
    CLEANUP_SUBSCRIPTIONS(state) {
      // 清理订阅
      state.subscriptions.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      })
      state.subscriptions = []
    },
    
    ADD_TIMER(state, timerId) {
      state.timers.push(timerId)
    },
    
    CLEANUP_TIMERS(state) {
      // 清理定时器
      state.timers.forEach(timerId => {
        clearTimeout(timerId)
        clearInterval(timerId)
      })
      state.timers = []
    },
    
    CACHE_DATA(state, { key, data }) {
      // 限制缓存大小
      if (state.cache.size >= state.maxCacheSize) {
        const firstKey = state.cache.keys().next().value
        state.cache.delete(firstKey)
      }
      
      state.cache.set(key, {
        data,
        timestamp: Date.now()
      })
    },
    
    CLEAR_EXPIRED_CACHE(state, maxAge = 10 * 60 * 1000) {
      const now = Date.now()
      for (const [key, value] of state.cache.entries()) {
        if (now - value.timestamp > maxAge) {
          state.cache.delete(key)
        }
      }
    }
  },
  
  actions: {
    initialize({ commit, state }) {
      // 设置定期清理
      const cleanupInterval = setInterval(() => {
        commit('CLEAR_EXPIRED_CACHE')
      }, 60000) // 每分钟清理一次
      
      commit('ADD_TIMER', cleanupInterval)
    },
    
    cleanup({ commit }) {
      commit('CLEANUP_SUBSCRIPTIONS')
      commit('CLEANUP_TIMERS')
    }
  }
}
```

### 5.2 大数据集处理

```javascript
// 虚拟化和分页处理大数据集
const largeDataModule = {
  namespaced: true,
  
  state: () => ({
    allData: [],
    visibleData: [],
    pageSize: 50,
    currentPage: 0,
    virtualScrollOffset: 0,
    itemHeight: 40
  }),
  
  getters: {
    totalPages: (state) => Math.ceil(state.allData.length / state.pageSize),
    
    visibleItems: (state) => {
      const startIndex = Math.floor(state.virtualScrollOffset / state.itemHeight)
      const endIndex = startIndex + Math.ceil(window.innerHeight / state.itemHeight) + 5
      
      return state.allData.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        virtualIndex: startIndex + index,
        top: (startIndex + index) * state.itemHeight
      }))
    }
  },
  
  mutations: {
    SET_ALL_DATA(state, data) {
      state.allData = data
    },
    
    UPDATE_VIRTUAL_SCROLL(state, offset) {
      state.virtualScrollOffset = offset
    },
    
    LOAD_PAGE(state, page) {
      const startIndex = page * state.pageSize
      const endIndex = startIndex + state.pageSize
      state.visibleData = state.allData.slice(startIndex, endIndex)
      state.currentPage = page
    }
  },
  
  actions: {
    async loadLargeDataset({ commit }, { url, chunkSize = 1000 }) {
      const allData = []
      let offset = 0
      let hasMore = true
      
      while (hasMore) {
        const response = await fetch(`${url}?offset=${offset}&limit=${chunkSize}`)
        const chunk = await response.json()
        
        if (chunk.length === 0) {
          hasMore = false
        } else {
          allData.push(...chunk)
          offset += chunkSize
          
          // 逐步更新 UI
          if (allData.length % (chunkSize * 5) === 0) {
            commit('SET_ALL_DATA', [...allData])
          }
        }
      }
      
      commit('SET_ALL_DATA', allData)
    }
  }
}
```

## 六、渲染性能优化

### 6.1 避免不必要的重渲染

```vue
<template>
  <div class="optimized-list">
    <!-- 使用 v-memo 优化重复渲染 -->
    <div
      v-for="item in visibleItems"
      :key="item.id"
      v-memo="[item.id, item.updatedAt]"
      class="list-item"
    >
      <ExpensiveComponent :data="item" />
    </div>
  </div>
</template>

<script>
import { computed, shallowRef } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()
    
    // 使用 shallowRef 减少深度响应式开销
    const filters = shallowRef({
      category: '',
      status: ''
    })
    
    // 缓存计算结果
    const visibleItems = computed(() => {
      const items = store.getters['items/filteredItems'](filters.value)
      
      // 返回冻结的对象避免不必要的响应式
      return Object.freeze(items)
    })
    
    // 使用防抖更新过滤器
    const updateFilters = debounce((newFilters) => {
      filters.value = { ...filters.value, ...newFilters }
    }, 300)
    
    return {
      visibleItems,
      updateFilters
    }
  }
}
</script>
```

### 6.2 组件级优化

```vue
<!-- 高性能列表组件 -->
<template>
  <div class="virtual-list" @scroll="handleScroll">
    <div 
      class="list-content"
      :style="{ height: totalHeight + 'px' }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ 
          position: 'absolute',
          top: item.top + 'px',
          height: itemHeight + 'px'
        }"
        class="virtual-item"
      >
        <slot :item="item" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualList',
  
  props: {
    items: { type: Array, required: true },
    itemHeight: { type: Number, default: 50 },
    bufferSize: { type: Number, default: 5 }
  },
  
  data() {
    return {
      scrollTop: 0,
      containerHeight: 0
    }
  },
  
  computed: {
    totalHeight() {
      return this.items.length * this.itemHeight
    },
    
    startIndex() {
      return Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize)
    },
    
    endIndex() {
      const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
      return Math.min(
        this.items.length - 1,
        this.startIndex + visibleCount + this.bufferSize
      )
    },
    
    visibleItems() {
      return this.items
        .slice(this.startIndex, this.endIndex + 1)
        .map((item, index) => ({
          ...item,
          top: (this.startIndex + index) * this.itemHeight
        }))
    }
  },
  
  methods: {
    handleScroll(event) {
      this.scrollTop = event.target.scrollTop
    }
  },
  
  mounted() {
    this.containerHeight = this.$el.clientHeight
  }
}
</script>
```

## 七、监控和分析

### 7.1 性能监控插件

```javascript
// 性能监控插件
const createPerformanceMonitor = () => {
  const metrics = {
    mutations: new Map(),
    actions: new Map(),
    renders: []
  }
  
  return (store) => {
    // 监控 mutation 性能
    store.subscribe((mutation, state) => {
      const start = performance.now()
      
      requestAnimationFrame(() => {
        const duration = performance.now() - start
        
        if (!metrics.mutations.has(mutation.type)) {
          metrics.mutations.set(mutation.type, {
            count: 0,
            totalTime: 0,
            maxTime: 0
          })
        }
        
        const stat = metrics.mutations.get(mutation.type)
        stat.count++
        stat.totalTime += duration
        stat.maxTime = Math.max(stat.maxTime, duration)
        
        // 记录慢操作
        if (duration > 16) {
          console.warn(`Slow mutation: ${mutation.type} (${duration.toFixed(2)}ms)`)
        }
      })
    })
    
    // 监控 action 性能
    const actionTimes = new Map()
    store.subscribeAction({
      before: (action) => {
        actionTimes.set(action, performance.now())
      },
      after: (action) => {
        const startTime = actionTimes.get(action)
        if (startTime) {
          const duration = performance.now() - startTime
          
          if (!metrics.actions.has(action.type)) {
            metrics.actions.set(action.type, {
              count: 0,
              totalTime: 0,
              maxTime: 0
            })
          }
          
          const stat = metrics.actions.get(action.type)
          stat.count++
          stat.totalTime += duration
          stat.maxTime = Math.max(stat.maxTime, duration)
          
          actionTimes.delete(action)
        }
      }
    })
    
    // 暴露性能报告
    store.$performance = {
      getReport() {
        const report = {
          mutations: {},
          actions: {}
        }
        
        metrics.mutations.forEach((stat, type) => {
          report.mutations[type] = {
            ...stat,
            avgTime: stat.totalTime / stat.count
          }
        })
        
        metrics.actions.forEach((stat, type) => {
          report.actions[type] = {
            ...stat,
            avgTime: stat.totalTime / stat.count
          }
        })
        
        return report
      },
      
      getSlowestMutations(limit = 10) {
        return Array.from(metrics.mutations.entries())
          .map(([type, stat]) => ({ type, ...stat, avgTime: stat.totalTime / stat.count }))
          .sort((a, b) => b.avgTime - a.avgTime)
          .slice(0, limit)
      }
    }
  }
}
```

## 参考资料

- [Vue.js 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [JavaScript 性能优化](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

**下一节** → [第 39 节：迁移指南](./39-vuex-migration.md)
