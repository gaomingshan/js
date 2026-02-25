# Pinia 实战案例

> 通过真实项目案例，掌握 Pinia 在实际开发中的应用。

## 电商系统状态管理

### 用户模块

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import { useOrderStore } from './order'

interface User {
  id: number
  username: string
  email: string
  avatar: string
  phone: string
  addresses: Address[]
}

interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const defaultAddress = computed(() => {
    return user.value?.addresses.find(addr => addr.isDefault)
  })
  
  // Actions
  async function login(credentials: { username: string; password: string }) {
    loading.value = true
    try {
      const response = await api.login(credentials)
      token.value = response.token
      user.value = response.user
      
      localStorage.setItem('token', response.token)
      
      // 登录后同步购物车
      const cartStore = useCartStore()
      await cartStore.syncCart()
    } finally {
      loading.value = false
    }
  }
  
  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    
    // 清空购物车和订单
    const cartStore = useCartStore()
    const orderStore = useOrderStore()
    cartStore.$reset()
    orderStore.$reset()
  }
  
  async function fetchUserInfo() {
    if (!token.value) return
    
    try {
      const response = await api.getUserInfo()
      user.value = response.data
    } catch (error) {
      await logout()
    }
  }
  
  async function updateProfile(data: Partial<User>) {
    loading.value = true
    try {
      const response = await api.updateProfile(data)
      user.value = { ...user.value!, ...response.data }
    } finally {
      loading.value = false
    }
  }
  
  async function addAddress(address: Omit<Address, 'id'>) {
    const response = await api.addAddress(address)
    user.value!.addresses.push(response.data)
  }
  
  async function updateAddress(id: number, data: Partial<Address>) {
    await api.updateAddress(id, data)
    const index = user.value!.addresses.findIndex(addr => addr.id === id)
    if (index > -1) {
      user.value!.addresses[index] = {
        ...user.value!.addresses[index],
        ...data
      }
    }
  }
  
  async function deleteAddress(id: number) {
    await api.deleteAddress(id)
    user.value!.addresses = user.value!.addresses.filter(addr => addr.id !== id)
  }
  
  async function setDefaultAddress(id: number) {
    await api.setDefaultAddress(id)
    user.value!.addresses.forEach(addr => {
      addr.isDefault = addr.id === id
    })
  }
  
  return {
    user,
    token,
    loading,
    isLoggedIn,
    defaultAddress,
    login,
    logout,
    fetchUserInfo,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  }
})
```

### 购物车模块

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'

interface Product {
  id: number
  name: string
  price: number
  image: string
  stock: number
}

interface CartItem extends Product {
  quantity: number
  selected: boolean
}

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()
  
  // State
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  
  // Getters
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const selectedItems = computed(() => {
    return items.value.filter(item => item.selected)
  })
  
  const selectedCount = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const totalPrice = computed(() => {
    return selectedItems.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  })
  
  const allSelected = computed(() => {
    return items.value.length > 0 && items.value.every(item => item.selected)
  })
  
  // Actions
  async function fetchCart() {
    if (!userStore.isLoggedIn) {
      loadLocalCart()
      return
    }
    
    loading.value = true
    try {
      const response = await api.getCart()
      items.value = response.data
    } finally {
      loading.value = false
    }
  }
  
  async function addItem(product: Product, quantity = 1) {
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      await updateQuantity(product.id, existingItem.quantity + quantity)
    } else {
      const newItem: CartItem = {
        ...product,
        quantity,
        selected: true
      }
      
      if (userStore.isLoggedIn) {
        await api.addToCart(newItem)
      }
      
      items.value.push(newItem)
      saveLocalCart()
    }
  }
  
  async function removeItem(productId: number) {
    if (userStore.isLoggedIn) {
      await api.removeFromCart(productId)
    }
    
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveLocalCart()
    }
  }
  
  async function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find(item => item.id === productId)
    if (!item) return
    
    if (quantity <= 0) {
      await removeItem(productId)
      return
    }
    
    if (quantity > item.stock) {
      throw new Error('库存不足')
    }
    
    if (userStore.isLoggedIn) {
      await api.updateCartItem(productId, { quantity })
    }
    
    item.quantity = quantity
    saveLocalCart()
  }
  
  function toggleSelect(productId: number) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.selected = !item.selected
      saveLocalCart()
    }
  }
  
  function toggleSelectAll() {
    const newSelected = !allSelected.value
    items.value.forEach(item => {
      item.selected = newSelected
    })
    saveLocalCart()
  }
  
  async function syncCart() {
    if (!userStore.isLoggedIn) return
    
    const localItems = loadLocalCart()
    if (localItems.length === 0) return
    
    try {
      await api.syncCart(localItems)
      await fetchCart()
      clearLocalCart()
    } catch (error) {
      console.error('同步购物车失败:', error)
    }
  }
  
  function loadLocalCart() {
    const saved = localStorage.getItem('cart')
    if (saved) {
      items.value = JSON.parse(saved)
    }
    return items.value
  }
  
  function saveLocalCart() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }
  
  function clearLocalCart() {
    localStorage.removeItem('cart')
  }
  
  function clear() {
    items.value = []
    clearLocalCart()
  }
  
  return {
    items,
    loading,
    totalItems,
    selectedItems,
    selectedCount,
    totalPrice,
    allSelected,
    fetchCart,
    addItem,
    removeItem,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    syncCart,
    clear
  }
})
```

### 订单模块

```typescript
// stores/order.ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useCartStore } from './cart'

interface OrderItem {
  productId: number
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: number
  orderNo: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  items: OrderItem[]
  totalAmount: number
  address: Address
  createdAt: string
}

export const useOrderStore = defineStore('order', () => {
  const userStore = useUserStore()
  const cartStore = useCartStore()
  
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  
  // Getters
  const pendingOrders = computed(() => {
    return orders.value.filter(order => order.status === 'pending')
  })
  
  const completedOrders = computed(() => {
    return orders.value.filter(order => order.status === 'completed')
  })
  
  // Actions
  async function fetchOrders() {
    loading.value = true
    try {
      const response = await api.getOrders()
      orders.value = response.data
    } finally {
      loading.value = false
    }
  }
  
  async function fetchOrder(orderId: number) {
    loading.value = true
    try {
      const response = await api.getOrder(orderId)
      currentOrder.value = response.data
      return response.data
    } finally {
      loading.value = false
    }
  }
  
  async function createOrder(data: {
    addressId: number
    items: OrderItem[]
    remark?: string
  }) {
    loading.value = true
    try {
      const response = await api.createOrder(data)
      const order = response.data
      
      orders.value.unshift(order)
      currentOrder.value = order
      
      // 清空购物车中的已选商品
      cartStore.items = cartStore.items.filter(item => !item.selected)
      
      return order
    } finally {
      loading.value = false
    }
  }
  
  async function payOrder(orderId: number, paymentMethod: string) {
    loading.value = true
    try {
      const response = await api.payOrder(orderId, paymentMethod)
      
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.status = 'paid'
      }
      
      return response.data
    } finally {
      loading.value = false
    }
  }
  
  async function cancelOrder(orderId: number) {
    await api.cancelOrder(orderId)
    
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'cancelled'
    }
  }
  
  async function confirmReceipt(orderId: number) {
    await api.confirmReceipt(orderId)
    
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'completed'
    }
  }
  
  return {
    orders,
    currentOrder,
    loading,
    pendingOrders,
    completedOrders,
    fetchOrders,
    fetchOrder,
    createOrder,
    payOrder,
    cancelOrder,
    confirmReceipt
  }
})
```

---

## 后台管理系统

### 权限管理

```typescript
// stores/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { constantRoutes, asyncRoutes } from '@/router/routes'

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])
  
  function setRoutes(newRoutes: RouteRecordRaw[]) {
    addRoutes.value = newRoutes
    routes.value = constantRoutes.concat(newRoutes)
  }
  
  function generateRoutes(roles: string[]) {
    return new Promise<RouteRecordRaw[]>((resolve) => {
      let accessedRoutes: RouteRecordRaw[]
      
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      
      setRoutes(accessedRoutes)
      resolve(accessedRoutes)
    })
  }
  
  return {
    routes,
    addRoutes,
    generateRoutes
  }
})

function hasPermission(roles: string[], route: RouteRecordRaw): boolean {
  if (route.meta?.roles) {
    return roles.some(role => (route.meta!.roles as string[]).includes(role))
  }
  return true
}

function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  
  return res
}
```

### 标签页管理

```typescript
// stores/tagsView.ts
import { defineStore } from 'pinia'
import { RouteLocationNormalized } from 'vue-router'

interface TagView extends Partial<RouteLocationNormalized> {
  title?: string
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])
  
  function addView(view: RouteLocationNormalized) {
    addVisitedView(view)
    addCachedView(view)
  }
  
  function addVisitedView(view: RouteLocationNormalized) {
    if (visitedViews.value.some(v => v.path === view.path)) return
    
    visitedViews.value.push({
      name: view.name,
      path: view.path,
      title: view.meta.title || 'no-name',
      meta: { ...view.meta }
    })
  }
  
  function addCachedView(view: RouteLocationNormalized) {
    if (cachedViews.value.includes(view.name as string)) return
    if (!view.meta.noCache) {
      cachedViews.value.push(view.name as string)
    }
  }
  
  function delView(view: TagView) {
    return new Promise<{
      visitedViews: TagView[]
      cachedViews: string[]
    }>((resolve) => {
      delVisitedView(view)
      delCachedView(view)
      resolve({
        visitedViews: visitedViews.value,
        cachedViews: cachedViews.value
      })
    })
  }
  
  function delVisitedView(view: TagView) {
    return new Promise<TagView[]>((resolve) => {
      for (const [i, v] of visitedViews.value.entries()) {
        if (v.path === view.path) {
          visitedViews.value.splice(i, 1)
          break
        }
      }
      resolve([...visitedViews.value])
    })
  }
  
  function delCachedView(view: TagView) {
    return new Promise<string[]>((resolve) => {
      const index = cachedViews.value.indexOf(view.name as string)
      index > -1 && cachedViews.value.splice(index, 1)
      resolve([...cachedViews.value])
    })
  }
  
  function delOthersViews(view: TagView) {
    return new Promise<{
      visitedViews: TagView[]
      cachedViews: string[]
    }>((resolve) => {
      visitedViews.value = visitedViews.value.filter(v => {
        return v.meta?.affix || v.path === view.path
      })
      
      cachedViews.value = cachedViews.value.filter(name => {
        return name === view.name
      })
      
      resolve({
        visitedViews: visitedViews.value,
        cachedViews: cachedViews.value
      })
    })
  }
  
  function delAllViews() {
    return new Promise<{
      visitedViews: TagView[]
      cachedViews: string[]
    }>((resolve) => {
      visitedViews.value = visitedViews.value.filter(tag => tag.meta?.affix)
      cachedViews.value = []
      
      resolve({
        visitedViews: visitedViews.value,
        cachedViews: cachedViews.value
      })
    })
  }
  
  function updateVisitedView(view: TagView) {
    for (let v of visitedViews.value) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
  }
  
  return {
    visitedViews,
    cachedViews,
    addView,
    addVisitedView,
    addCachedView,
    delView,
    delVisitedView,
    delCachedView,
    delOthersViews,
    delAllViews,
    updateVisitedView
  }
})
```

---

## 实时通讯系统

### WebSocket 状态管理

```typescript
// stores/websocket.ts
import { defineStore } from 'pinia'

interface Message {
  id: string
  type: 'text' | 'image' | 'file'
  content: string
  senderId: number
  receiverId: number
  timestamp: number
  status: 'sending' | 'sent' | 'failed'
}

export const useWebSocketStore = defineStore('websocket', () => {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const messages = ref<Message[]>([])
  const unreadCount = ref(0)
  
  function connect(url: string) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      return
    }
    
    ws.value = new WebSocket(url)
    
    ws.value.onopen = () => {
      connected.value = true
      console.log('WebSocket connected')
    }
    
    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message
      handleMessage(message)
    }
    
    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    ws.value.onclose = () => {
      connected.value = false
      console.log('WebSocket disconnected')
      
      // 重连
      setTimeout(() => {
        connect(url)
      }, 3000)
    }
  }
  
  function disconnect() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      connected.value = false
    }
  }
  
  function sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>) {
    if (!connected.value || !ws.value) {
      throw new Error('WebSocket not connected')
    }
    
    const fullMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
      status: 'sending'
    }
    
    messages.value.push(fullMessage)
    
    try {
      ws.value.send(JSON.stringify(fullMessage))
      fullMessage.status = 'sent'
    } catch (error) {
      fullMessage.status = 'failed'
      throw error
    }
  }
  
  function handleMessage(message: Message) {
    messages.value.push(message)
    unreadCount.value++
  }
  
  function markAsRead() {
    unreadCount.value = 0
  }
  
  function clearMessages() {
    messages.value = []
    unreadCount.value = 0
  }
  
  return {
    connected,
    messages,
    unreadCount,
    connect,
    disconnect,
    sendMessage,
    markAsRead,
    clearMessages
  }
})

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

---

## 多语言系统

```typescript
// stores/i18n.ts
import { defineStore } from 'pinia'
import zhCN from '@/locales/zh-CN'
import enUS from '@/locales/en-US'

type Locale = 'zh-CN' | 'en-US'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref<Locale>('zh-CN')
  const messages = reactive(messages)
  
  function t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.')
    let value: any = messages[locale.value]
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // 替换参数
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match
      })
    }
    
    return value
  }
  
  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
    document.documentElement.lang = newLocale
  }
  
  function loadLocaleMessages(locale: Locale, messages: any) {
    messages[locale] = messages
  }
  
  // 初始化
  const savedLocale = localStorage.getItem('locale') as Locale
  if (savedLocale && messages[savedLocale]) {
    locale.value = savedLocale
  }
  
  return {
    locale,
    t,
    setLocale,
    loadLocaleMessages
  }
})
```

---

## 主题系统

```typescript
// stores/theme.ts
import { defineStore } from 'pinia'

type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeColors {
  primary: string
  success: string
  warning: string
  danger: string
  info: string
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')
  const colors = reactive<ThemeColors>({
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    info: '#909399'
  })
  
  const isDark = computed(() => {
    if (mode.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return mode.value === 'dark'
  })
  
  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    applyTheme()
    localStorage.setItem('theme-mode', newMode)
  }
  
  function setColors(newColors: Partial<ThemeColors>) {
    Object.assign(colors, newColors)
    applyTheme()
    localStorage.setItem('theme-colors', JSON.stringify(colors))
  }
  
  function applyTheme() {
    const root = document.documentElement
    
    // 应用主题模式
    if (isDark.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // 应用主题颜色
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }
  
  function toggleMode() {
    setMode(isDark.value ? 'light' : 'dark')
  }
  
  // 监听系统主题变化
  if (mode.value === 'auto') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', applyTheme)
  }
  
  // 初始化
  const savedMode = localStorage.getItem('theme-mode') as ThemeMode
  if (savedMode) {
    mode.value = savedMode
  }
  
  const savedColors = localStorage.getItem('theme-colors')
  if (savedColors) {
    Object.assign(colors, JSON.parse(savedColors))
  }
  
  applyTheme()
  
  return {
    mode,
    colors,
    isDark,
    setMode,
    setColors,
    toggleMode
  }
})
```

---

## 最佳实践总结

### 1. Store 设计原则

- **单一职责**：每个 store 只管理相关的状态
- **模块化**：按功能拆分 store
- **命名规范**：使用清晰的命名
- **类型安全**：提供完整的 TypeScript 类型

### 2. 性能优化

- 使用 `$patch` 批量更新
- 避免不必要的响应式
- 合理使用 computed
- 惰性加载数据

### 3. 错误处理

- 在 action 中捕获错误
- 提供友好的错误提示
- 记录错误日志
- 实现错误重试机制

### 4. 数据持久化

- 敏感数据加密存储
- 合理设置过期时间
- 选择合适的存储方式
- 处理存储失败情况

### 5. 测试覆盖

- 为关键 action 编写测试
- 测试 getter 的计算逻辑
- 测试 store 之间的交互
- 使用 Mock 数据

---

## 参考资料

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Pinia 示例](https://github.com/vuejs/pinia/tree/v2/packages/playground)
- [Vue 3 + Pinia 最佳实践](https://pinia.vuejs.org/cookbook/)
