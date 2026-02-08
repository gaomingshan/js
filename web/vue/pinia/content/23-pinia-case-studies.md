# 第 23 节：实战案例

## 概述

本节通过具体的项目案例，展示如何在真实场景中应用 Pinia 进行状态管理。包括电商应用、内容管理系统、实时聊天应用等典型场景。

## 一、电商应用案例

### 1.1 项目结构

```
stores/
├── auth.js          # 用户认证
├── cart.js          # 购物车
├── products.js      # 商品管理
├── orders.js        # 订单管理
├── ui.js           # UI 状态
└── notifications.js # 通知系统
```

### 1.2 用户认证 Store

```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref('')
  const permissions = ref([])
  const loading = ref(false)

  // 登录
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await authAPI.login(credentials)
      user.value = response.user
      token.value = response.token
      permissions.value = response.permissions
      
      // 保存到本地存储
      localStorage.setItem('auth-token', response.token)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 注销
  const logout = () => {
    user.value = null
    token.value = ''
    permissions.value = []
    localStorage.removeItem('auth-token')
    
    // 清理其他 Store 状态
    const cartStore = useCartStore()
    cartStore.$reset()
  }

  // 权限检查
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  return {
    user: readonly(user),
    loading: readonly(loading),
    isLoggedIn,
    isAdmin,
    login,
    logout,
    hasPermission
  }
})
```

### 1.3 购物车 Store

```javascript
// stores/cart.js
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  // 添加商品
  const addItem = (product, quantity = 1) => {
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity
      })
    }
    
    // 触发通知
    const notificationStore = useNotificationStore()
    notificationStore.add({
      type: 'success',
      message: `已添加 ${product.name} 到购物车`
    })
  }

  // 更新数量
  const updateQuantity = (itemId, quantity) => {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(itemId)
      } else {
        item.quantity = quantity
      }
    }
  }

  // 移除商品
  const removeItem = (itemId) => {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  // 清空购物车
  const clear = () => {
    items.value = []
  }

  // 计算属性
  const itemCount = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  
  const totalPrice = computed(() => 
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  )
  
  const isEmpty = computed(() => items.value.length === 0)

  // 结算
  const checkout = async () => {
    const orderStore = useOrderStore()
    const authStore = useAuthStore()

    if (!authStore.isLoggedIn) {
      throw new Error('请先登录')
    }

    loading.value = true
    try {
      const order = await orderStore.createOrder({
        items: items.value,
        total: totalPrice.value
      })
      
      clear()
      return order
    } finally {
      loading.value = false
    }
  }

  return {
    items: readonly(items),
    loading: readonly(loading),
    itemCount,
    totalPrice,
    isEmpty,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    checkout
  }
})
```

### 1.4 商品管理 Store

```javascript
// stores/products.js
export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const categories = ref([])
  const filters = reactive({
    category: '',
    priceRange: [0, 1000],
    searchQuery: '',
    sortBy: 'name'
  })
  const loading = ref(false)

  // 获取商品列表
  const fetchProducts = async (options = {}) => {
    loading.value = true
    try {
      const response = await productAPI.getProducts({
        ...filters,
        ...options
      })
      products.value = response.products
      categories.value = response.categories
    } finally {
      loading.value = false
    }
  }

  // 过滤商品
  const filteredProducts = computed(() => {
    let result = products.value

    if (filters.category) {
      result = result.filter(p => p.category === filters.category)
    }

    if (filters.searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    }

    result = result.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    // 排序
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return result
  })

  // 更新过滤器
  const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters)
  }

  // 重置过滤器
  const resetFilters = () => {
    filters.category = ''
    filters.priceRange = [0, 1000]
    filters.searchQuery = ''
    filters.sortBy = 'name'
  }

  return {
    products: readonly(products),
    categories: readonly(categories),
    filters,
    filteredProducts,
    loading: readonly(loading),
    fetchProducts,
    updateFilters,
    resetFilters
  }
})
```

## 二、内容管理系统案例

### 2.1 文章管理 Store

```javascript
// stores/articles.js
export const useArticleStore = defineStore('articles', () => {
  const articles = ref([])
  const currentArticle = ref(null)
  const loading = ref(false)
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // 获取文章列表
  const fetchArticles = async (params = {}) => {
    loading.value = true
    try {
      const response = await articleAPI.getArticles({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...params
      })
      
      articles.value = response.articles
      pagination.total = response.total
    } finally {
      loading.value = false
    }
  }

  // 创建文章
  const createArticle = async (articleData) => {
    const response = await articleAPI.create(articleData)
    articles.value.unshift(response)
    return response
  }

  // 更新文章
  const updateArticle = async (id, updates) => {
    const response = await articleAPI.update(id, updates)
    const index = articles.value.findIndex(a => a.id === id)
    if (index > -1) {
      articles.value[index] = response
    }
    if (currentArticle.value?.id === id) {
      currentArticle.value = response
    }
    return response
  }

  // 删除文章
  const deleteArticle = async (id) => {
    await articleAPI.delete(id)
    const index = articles.value.findIndex(a => a.id === id)
    if (index > -1) {
      articles.value.splice(index, 1)
    }
  }

  // 发布/取消发布
  const togglePublish = async (id) => {
    const article = articles.value.find(a => a.id === id)
    if (article) {
      const newStatus = article.status === 'published' ? 'draft' : 'published'
      await updateArticle(id, { status: newStatus })
    }
  }

  return {
    articles: readonly(articles),
    currentArticle: readonly(currentArticle),
    loading: readonly(loading),
    pagination,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    togglePublish
  }
})
```

### 2.2 编辑器状态 Store

```javascript
// stores/editor.js
export const useEditorStore = defineStore('editor', () => {
  const content = ref('')
  const title = ref('')
  const isDirty = ref(false)
  const autosaving = ref(false)
  const lastSaved = ref(null)

  // 自动保存
  const autoSave = debounce(async () => {
    if (!isDirty.value) return
    
    autosaving.value = true
    try {
      await articleAPI.autosave({
        title: title.value,
        content: content.value
      })
      lastSaved.value = new Date()
      isDirty.value = false
    } finally {
      autosaving.value = false
    }
  }, 2000)

  // 设置内容
  const setContent = (newContent) => {
    content.value = newContent
    isDirty.value = true
    autoSave()
  }

  const setTitle = (newTitle) => {
    title.value = newTitle
    isDirty.value = true
    autoSave()
  }

  // 插入图片
  const insertImage = async (file) => {
    const uploadedImage = await uploadAPI.uploadImage(file)
    const imageMarkdown = `![${uploadedImage.name}](${uploadedImage.url})`
    content.value += imageMarkdown
    isDirty.value = true
  }

  // 清空编辑器
  const clear = () => {
    content.value = ''
    title.value = ''
    isDirty.value = false
    lastSaved.value = null
  }

  return {
    content,
    title,
    isDirty: readonly(isDirty),
    autosaving: readonly(autosaving),
    lastSaved: readonly(lastSaved),
    setContent,
    setTitle,
    insertImage,
    clear
  }
})
```

## 三、实时聊天应用案例

### 3.1 聊天室 Store

```javascript
// stores/chat.js
export const useChatStore = defineStore('chat', () => {
  const rooms = ref([])
  const currentRoom = ref(null)
  const messages = ref([])
  const onlineUsers = ref([])
  const typing = ref([])
  const connected = ref(false)

  let socket = null

  // 连接 WebSocket
  const connect = () => {
    socket = new WebSocket(WS_URL)
    
    socket.onopen = () => {
      connected.value = true
    }
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleSocketMessage(data)
    }
    
    socket.onclose = () => {
      connected.value = false
      // 重连逻辑
      setTimeout(connect, 3000)
    }
  }

  // 处理 Socket 消息
  const handleSocketMessage = (data) => {
    switch (data.type) {
      case 'message':
        messages.value.push(data.payload)
        break
      case 'user-joined':
        onlineUsers.value.push(data.payload.user)
        break
      case 'user-left':
        const index = onlineUsers.value.findIndex(u => u.id === data.payload.userId)
        if (index > -1) {
          onlineUsers.value.splice(index, 1)
        }
        break
      case 'typing':
        updateTyping(data.payload)
        break
    }
  }

  // 发送消息
  const sendMessage = (text) => {
    if (!connected.value || !currentRoom.value) return
    
    const message = {
      type: 'message',
      payload: {
        text,
        roomId: currentRoom.value.id,
        userId: useAuthStore().user.id
      }
    }
    
    socket.send(JSON.stringify(message))
  }

  // 加入房间
  const joinRoom = (roomId) => {
    if (!connected.value) return
    
    socket.send(JSON.stringify({
      type: 'join-room',
      payload: { roomId }
    }))
    
    const room = rooms.value.find(r => r.id === roomId)
    currentRoom.value = room
    messages.value = []
  }

  // 输入状态
  const startTyping = () => {
    if (!connected.value || !currentRoom.value) return
    
    socket.send(JSON.stringify({
      type: 'typing',
      payload: {
        roomId: currentRoom.value.id,
        typing: true
      }
    }))
  }

  const stopTyping = () => {
    if (!connected.value || !currentRoom.value) return
    
    socket.send(JSON.stringify({
      type: 'typing',
      payload: {
        roomId: currentRoom.value.id,
        typing: false
      }
    }))
  }

  const updateTyping = (data) => {
    const { userId, typing: isTyping } = data
    const index = typing.value.indexOf(userId)
    
    if (isTyping && index === -1) {
      typing.value.push(userId)
    } else if (!isTyping && index > -1) {
      typing.value.splice(index, 1)
    }
  }

  return {
    rooms: readonly(rooms),
    currentRoom: readonly(currentRoom),
    messages: readonly(messages),
    onlineUsers: readonly(onlineUsers),
    typing: readonly(typing),
    connected: readonly(connected),
    connect,
    sendMessage,
    joinRoom,
    startTyping,
    stopTyping
  }
})
```

## 四、数据可视化应用案例

### 4.1 图表数据 Store

```javascript
// stores/charts.js
export const useChartStore = defineStore('charts', () => {
  const rawData = ref([])
  const chartConfigs = ref([])
  const activeChart = ref(null)
  const loading = ref(false)

  // 数据处理
  const processedData = computed(() => {
    if (!activeChart.value) return []
    
    const config = activeChart.value
    return rawData.value.map(item => {
      const processed = {}
      
      config.dimensions.forEach(dim => {
        processed[dim.key] = processValue(item[dim.source], dim.type)
      })
      
      config.metrics.forEach(metric => {
        processed[metric.key] = calculateMetric(item, metric)
      })
      
      return processed
    })
  })

  // 图表选项
  const chartOptions = computed(() => {
    if (!activeChart.value || !processedData.value.length) return {}
    
    const config = activeChart.value
    return {
      title: { text: config.title },
      xAxis: {
        type: 'category',
        data: processedData.value.map(item => item[config.xAxis])
      },
      yAxis: { type: 'value' },
      series: config.series.map(s => ({
        name: s.name,
        type: s.type,
        data: processedData.value.map(item => item[s.dataKey])
      }))
    }
  })

  // 数据处理函数
  const processValue = (value, type) => {
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'number':
        return Number(value)
      case 'currency':
        return (Number(value) / 100).toFixed(2)
      default:
        return String(value)
    }
  }

  const calculateMetric = (item, metric) => {
    switch (metric.type) {
      case 'sum':
        return metric.fields.reduce((sum, field) => sum + (item[field] || 0), 0)
      case 'average':
        const values = metric.fields.map(field => item[field] || 0)
        return values.reduce((sum, val) => sum + val, 0) / values.length
      case 'count':
        return metric.fields.filter(field => item[field]).length
      default:
        return item[metric.field] || 0
    }
  }

  return {
    rawData: readonly(rawData),
    processedData,
    chartOptions,
    activeChart: readonly(activeChart),
    loading: readonly(loading)
  }
})
```

## 五、移动端应用案例

### 5.1 离线数据同步 Store

```javascript
// stores/offline.js
export const useOfflineStore = defineStore('offline', () => {
  const isOnline = ref(navigator.onLine)
  const syncQueue = ref([])
  const lastSync = ref(null)

  // 监听网络状态
  const setupNetworkListeners = () => {
    window.addEventListener('online', () => {
      isOnline.value = true
      processSyncQueue()
    })
    
    window.addEventListener('offline', () => {
      isOnline.value = false
    })
  }

  // 添加到同步队列
  const queueSync = (operation) => {
    syncQueue.value.push({
      id: Date.now(),
      operation,
      timestamp: new Date(),
      retries: 0
    })
    
    if (isOnline.value) {
      processSyncQueue()
    }
  }

  // 处理同步队列
  const processSyncQueue = async () => {
    if (!isOnline.value || syncQueue.value.length === 0) return
    
    const item = syncQueue.value[0]
    
    try {
      await item.operation()
      syncQueue.value.shift()
      lastSync.value = new Date()
      
      // 继续处理下一个
      if (syncQueue.value.length > 0) {
        processSyncQueue()
      }
    } catch (error) {
      item.retries++
      
      if (item.retries >= 3) {
        syncQueue.value.shift() // 移除失败的项目
      }
    }
  }

  return {
    isOnline: readonly(isOnline),
    syncQueue: readonly(syncQueue),
    lastSync: readonly(lastSync),
    setupNetworkListeners,
    queueSync
  }
})
```

## 六、性能优化案例

### 6.1 虚拟滚动 Store

```javascript
// stores/virtualScroll.js
export const useVirtualScrollStore = defineStore('virtualScroll', () => {
  const items = ref([])
  const visibleItems = ref([])
  const scrollTop = ref(0)
  const containerHeight = ref(0)
  const itemHeight = ref(50)

  // 计算可见区域
  const visibleRange = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight.value)
    const visibleCount = Math.ceil(containerHeight.value / itemHeight.value)
    const end = Math.min(start + visibleCount + 5, items.value.length) // 预渲染5个
    
    return { start, end }
  })

  // 更新可见项目
  const updateVisibleItems = () => {
    const { start, end } = visibleRange.value
    visibleItems.value = items.value.slice(start, end).map((item, index) => ({
      ...item,
      index: start + index,
      top: (start + index) * itemHeight.value
    }))
  }

  // 滚动处理
  const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop
    updateVisibleItems()
  }

  // 设置容器高度
  const setContainerHeight = (height) => {
    containerHeight.value = height
    updateVisibleItems()
  }

  // 总高度
  const totalHeight = computed(() => items.value.length * itemHeight.value)

  watch([scrollTop, containerHeight, items], updateVisibleItems)

  return {
    items,
    visibleItems: readonly(visibleItems),
    totalHeight,
    handleScroll,
    setContainerHeight
  }
})
```

## 参考资料

- [Pinia 实战教程](https://pinia.vuejs.org/cookbook/)
- [Vue 3 项目实战](https://vuejs.org/examples/)
- [现代前端架构设计](https://web.dev/architecture/)

**下一节** → [第 24 节：核心原理](./24-pinia-internals.md)
