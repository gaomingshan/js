# 第 11 节：组件守卫

## 概述

组件守卫是定义在路由组件内部的导航钩子，用于处理组件级别的导航逻辑，如离开确认、数据保存、状态清理等。Vue Router 提供了三个组件内的守卫钩子。

## 一、beforeRouteEnter

### 1.1 基础用法

```vue
<script>
export default {
  name: 'UserProfile',
  
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不能获取组件实例 `this`，因为当守卫执行前，组件实例还没被创建
    
    console.log('即将进入 UserProfile 组件')
    
    // 必须调用 next
    next()
  }
}
</script>
```

### 1.2 访问组件实例

```vue
<script>
export default {
  name: 'UserProfile',
  
  beforeRouteEnter(to, from, next) {
    // 通过 next 回调访问组件实例
    next(vm => {
      // 通过 `vm` 访问组件实例
      vm.loadUserData(to.params.id)
    })
  },
  
  methods: {
    loadUserData(userId) {
      console.log('加载用户数据:', userId)
      // 组件数据加载逻辑
    }
  }
}
</script>
```

### 1.3 Composition API 语法

```vue
<script setup>
import { onBeforeRouteEnter } from 'vue-router'

onBeforeRouteEnter((to, from) => {
  console.log('即将进入组件')
  
  // 在 Composition API 中，可以直接访问当前作用域
  // 但要注意组件还未挂载
  
  // 进行路由进入前的逻辑
  if (to.params.id) {
    // 预处理逻辑
    console.log('用户ID:', to.params.id)
  }
})
</script>
```

## 二、beforeRouteUpdate

### 2.1 处理路由参数变化

```vue
<script setup>
import { onBeforeRouteUpdate } from 'vue-router'
import { ref, watch } from 'vue'

const userData = ref(null)
const loading = ref(false)

// 处理路由参数变化
onBeforeRouteUpdate(async (to, from) => {
  // 当路由参数发生变化，但组件被复用时调用
  console.log('路由参数变化:', from.params, '->', to.params)
  
  if (to.params.id !== from.params.id) {
    loading.value = true
    try {
      userData.value = await fetchUserData(to.params.id)
    } catch (error) {
      console.error('加载用户数据失败:', error)
      return false // 阻止导航
    } finally {
      loading.value = false
    }
  }
})

async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) {
    throw new Error('用户不存在')
  }
  return response.json()
}
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="userData">
      <h1>{{ userData.name }}</h1>
      <p>{{ userData.email }}</p>
    </div>
    <div v-else>用户数据加载失败</div>
  </div>
</template>
```

### 2.2 Options API 示例

```vue
<script>
export default {
  data() {
    return {
      user: null,
      loading: false
    }
  },
  
  async beforeRouteUpdate(to, from, next) {
    // 检查是否需要重新加载数据
    if (to.params.id !== from.params.id) {
      this.loading = true
      
      try {
        this.user = await this.fetchUser(to.params.id)
        next()
      } catch (error) {
        console.error('用户加载失败:', error)
        next(false) // 取消导航
      } finally {
        this.loading = false
      }
    } else {
      next()
    }
  },
  
  methods: {
    async fetchUser(id) {
      const response = await fetch(`/api/users/${id}`)
      return response.json()
    }
  }
}
</script>
```

### 2.3 查询参数变化处理

```vue
<script setup>
import { onBeforeRouteUpdate } from 'vue-router'
import { ref, computed } from 'vue'

const searchResults = ref([])
const currentPage = ref(1)
const sortOrder = ref('date')

onBeforeRouteUpdate(async (to, from) => {
  // 处理查询参数变化
  const queryChanged = (
    to.query.q !== from.query.q ||
    to.query.page !== from.query.page ||
    to.query.sort !== from.query.sort
  )
  
  if (queryChanged) {
    console.log('搜索参数变化，重新加载数据')
    
    // 更新本地状态
    currentPage.value = parseInt(to.query.page) || 1
    sortOrder.value = to.query.sort || 'date'
    
    // 重新搜索
    await performSearch(to.query)
  }
})

async function performSearch(query) {
  try {
    const response = await fetch(`/api/search?${new URLSearchParams(query)}`)
    searchResults.value = await response.json()
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  }
}
</script>
```

## 三、beforeRouteLeave

### 3.1 离开确认

```vue
<script setup>
import { onBeforeRouteLeave } from 'vue-router'
import { ref, computed } from 'vue'

const formData = ref({
  title: '',
  content: '',
  tags: []
})

const originalData = ref({})
const hasUnsavedChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// 离开路由前的确认
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('有未保存的更改，确定要离开吗？')
    
    if (!answer) {
      return false // 取消导航
    }
  }
})

// 页面刷新前的确认
const beforeUnload = (e) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
  // 保存原始数据
  originalData.value = { ...formData.value }
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<template>
  <form @submit.prevent="saveForm">
    <input v-model="formData.title" placeholder="标题" />
    <textarea v-model="formData.content" placeholder="内容"></textarea>
    <button type="submit">保存</button>
  </form>
</template>
```

### 3.2 自动保存

```vue
<script setup>
import { onBeforeRouteLeave } from 'vue-router'
import { ref, watch } from 'vue'

const draftData = ref({
  title: '',
  content: ''
})

const isDraft = ref(false)

// 监听数据变化，自动保存草稿
watch(
  draftData,
  (newData) => {
    if (newData.title || newData.content) {
      saveDraft(newData)
      isDraft.value = true
    }
  },
  { deep: true, debounce: 1000 }
)

// 离开时处理草稿
onBeforeRouteLeave(async (to, from) => {
  if (isDraft.value) {
    const shouldSave = window.confirm('是否保存当前草稿？')
    
    if (shouldSave) {
      try {
        await saveDraft(draftData.value)
        console.log('草稿已保存')
      } catch (error) {
        console.error('草稿保存失败:', error)
        return false // 阻止导航
      }
    } else {
      // 清除草稿
      await clearDraft()
    }
  }
})

async function saveDraft(data) {
  await fetch('/api/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

async function clearDraft() {
  await fetch('/api/drafts/current', {
    method: 'DELETE'
  })
}
</script>
```

### 3.3 数据清理

```vue
<script setup>
import { onBeforeRouteLeave, onUnmounted } from 'vue-router'
import { ref } from 'vue'

const timers = ref([])
const eventListeners = ref([])
const subscriptions = ref([])

// 离开路由时清理资源
onBeforeRouteLeave(() => {
  cleanup()
})

// 组件卸载时也要清理
onUnmounted(() => {
  cleanup()
})

function cleanup() {
  // 清理定时器
  timers.value.forEach(timer => clearTimeout(timer))
  timers.value = []
  
  // 移除事件监听器
  eventListeners.value.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler)
  })
  eventListeners.value = []
  
  // 取消订阅
  subscriptions.value.forEach(unsubscribe => unsubscribe())
  subscriptions.value = []
  
  console.log('资源清理完成')
}

function addTimer(callback, delay) {
  const timer = setTimeout(callback, delay)
  timers.value.push(timer)
  return timer
}

function addEventListener(element, event, handler) {
  element.addEventListener(event, handler)
  eventListeners.value.push({ element, event, handler })
}

function addSubscription(unsubscribeFn) {
  subscriptions.value.push(unsubscribeFn)
}
</script>
```

## 四、守卫组合使用

### 4.1 完整的组件生命周期

```vue
<script setup>
import { 
  onBeforeRouteEnter, 
  onBeforeRouteUpdate, 
  onBeforeRouteLeave 
} from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const componentData = ref(null)
const loading = ref(false)
const error = ref(null)

// 进入组件前
onBeforeRouteEnter(async (to, from) => {
  console.log('准备进入组件')
  
  // 可以在这里做预检查
  if (!to.params.id) {
    return { name: 'NotFound' }
  }
})

// 组件挂载后加载数据
onMounted(async () => {
  await loadComponentData()
})

// 路由更新时
onBeforeRouteUpdate(async (to, from) => {
  console.log('路由参数更新')
  
  if (to.params.id !== from.params.id) {
    await loadComponentData(to.params.id)
  }
})

// 离开组件前
onBeforeRouteLeave((to, from) => {
  console.log('即将离开组件')
  
  // 清理工作
  cleanup()
  
  // 检查未保存的更改
  if (hasUnsavedChanges()) {
    return confirm('确定要离开吗？')
  }
})

async function loadComponentData(id) {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`/api/data/${id || route.params.id}`)
    componentData.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function hasUnsavedChanges() {
  // 检查是否有未保存的更改
  return false
}

function cleanup() {
  // 清理逻辑
}
</script>
```

### 4.2 表单组件示例

```vue
<script setup>
import { 
  onBeforeRouteLeave, 
  onBeforeRouteUpdate 
} from 'vue-router'
import { ref, computed, watch } from 'vue'

// 表单数据
const formData = ref({
  name: '',
  email: '',
  bio: ''
})

const originalData = ref({})
const saving = ref(false)

// 计算是否有更改
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// 监听表单变化，显示未保存提示
watch(hasChanges, (hasChanges) => {
  if (hasChanges) {
    showUnsavedIndicator()
  } else {
    hideUnsavedIndicator()
  }
})

// 路由参数变化时重新加载数据
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    if (hasChanges.value) {
      const shouldSave = confirm('当前有未保存的更改，是否保存？')
      if (shouldSave) {
        await saveForm()
      }
    }
    
    await loadFormData(to.params.id)
  }
})

// 离开前检查未保存的更改
onBeforeRouteLeave(async (to, from) => {
  if (hasChanges.value) {
    const action = await showSaveDialog()
    
    switch (action) {
      case 'save':
        try {
          await saveForm()
          return true
        } catch (error) {
          showError('保存失败')
          return false
        }
        
      case 'discard':
        return true
        
      case 'cancel':
        return false
    }
  }
})

async function loadFormData(id) {
  try {
    const response = await fetch(`/api/forms/${id}`)
    const data = await response.json()
    
    formData.value = { ...data }
    originalData.value = { ...data }
  } catch (error) {
    showError('数据加载失败')
  }
}

async function saveForm() {
  saving.value = true
  
  try {
    const response = await fetch(`/api/forms/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    
    if (response.ok) {
      originalData.value = { ...formData.value }
      showSuccess('保存成功')
    } else {
      throw new Error('保存失败')
    }
  } catch (error) {
    showError(error.message)
    throw error
  } finally {
    saving.value = false
  }
}

function showSaveDialog() {
  return new Promise(resolve => {
    // 显示自定义对话框
    const dialog = createSaveDialog({
      onSave: () => resolve('save'),
      onDiscard: () => resolve('discard'),
      onCancel: () => resolve('cancel')
    })
    
    dialog.show()
  })
}
</script>

<template>
  <form @submit.prevent="saveForm">
    <div class="form-group">
      <label>姓名：</label>
      <input v-model="formData.name" required />
    </div>
    
    <div class="form-group">
      <label>邮箱：</label>
      <input v-model="formData.email" type="email" required />
    </div>
    
    <div class="form-group">
      <label>简介：</label>
      <textarea v-model="formData.bio"></textarea>
    </div>
    
    <div class="form-actions">
      <button type="submit" :disabled="saving || !hasChanges">
        {{ saving ? '保存中...' : '保存' }}
      </button>
      
      <span v-if="hasChanges" class="unsaved-indicator">
        有未保存的更改
      </span>
    </div>
  </form>
</template>
```

## 五、最佳实践

### 5.1 守卫职责分离

```vue
<script setup>
// ✅ 好的实践：分离不同职责的守卫逻辑

// 权限检查
onBeforeRouteEnter((to, from) => {
  if (!hasPermission(to.meta.permission)) {
    return { name: 'AccessDenied' }
  }
})

// 数据验证
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    const isValid = await validateId(to.params.id)
    if (!isValid) {
      return { name: 'NotFound' }
    }
  }
})

// 状态清理
onBeforeRouteLeave(() => {
  cleanupResources()
})

// ❌ 避免：在一个守卫中处理所有逻辑
onBeforeRouteLeave((to, from) => {
  // 权限检查、数据验证、状态清理...
  // 逻辑过于复杂
})
</script>
```

### 5.2 错误处理

```vue
<script setup>
import { onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteUpdate(async (to, from) => {
  try {
    await updateComponentData(to.params)
  } catch (error) {
    console.error('组件更新失败:', error)
    
    // 根据错误类型决定处理策略
    if (error.status === 404) {
      return { name: 'NotFound' }
    } else if (error.status === 403) {
      return { name: 'Forbidden' }
    } else {
      // 显示错误信息但继续导航
      showErrorMessage('数据加载失败，请稍后重试')
    }
  }
})
</script>
```

### 5.3 性能优化

```vue
<script setup>
// 缓存和防抖
const dataCache = new Map()
let updateTimeout = null

onBeforeRouteUpdate(async (to, from) => {
  // 防抖：避免快速切换时的重复请求
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
  
  updateTimeout = setTimeout(async () => {
    const cacheKey = to.fullPath
    
    // 检查缓存
    if (dataCache.has(cacheKey)) {
      const cached = dataCache.get(cacheKey)
      if (Date.now() - cached.timestamp < 60000) { // 1分钟缓存
        setComponentData(cached.data)
        return
      }
    }
    
    // 加载新数据
    try {
      const data = await loadData(to.params)
      dataCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
      setComponentData(data)
    } catch (error) {
      handleError(error)
    }
  }, 100)
})
</script>
```

## 六、调试技巧

### 6.1 守卫日志

```vue
<script setup>
import { onBeforeRouteEnter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'

const componentName = 'UserProfile'

onBeforeRouteEnter((to, from) => {
  console.log(`[${componentName}] beforeRouteEnter:`, {
    to: to.path,
    from: from.path,
    params: to.params
  })
})

onBeforeRouteUpdate((to, from) => {
  console.log(`[${componentName}] beforeRouteUpdate:`, {
    to: to.path,
    from: from.path,
    paramsChanged: JSON.stringify(to.params) !== JSON.stringify(from.params),
    queryChanged: JSON.stringify(to.query) !== JSON.stringify(from.query)
  })
})

onBeforeRouteLeave((to, from) => {
  console.log(`[${componentName}] beforeRouteLeave:`, {
    to: to.path,
    from: from.path,
    hasUnsavedChanges: hasUnsavedChanges.value
  })
})
</script>
```

### 6.2 性能监控

```vue
<script setup>
onBeforeRouteUpdate(async (to, from) => {
  const startTime = performance.now()
  
  try {
    await loadComponentData(to.params.id)
    
    const duration = performance.now() - startTime
    console.log(`数据加载耗时: ${duration.toFixed(2)}ms`)
    
    // 性能警告
    if (duration > 1000) {
      console.warn('数据加载时间过长:', duration)
    }
    
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`数据加载失败 (${duration.toFixed(2)}ms):`, error)
  }
})
</script>
```

## 七、总结

| 守卫 | 调用时机 | this 访问 | 主要用途 |
|------|----------|-----------|----------|
| beforeRouteEnter | 路由确认前 | 无（通过next回调） | 进入前验证 |
| beforeRouteUpdate | 路由参数变化 | 有 | 处理参数变化 |
| beforeRouteLeave | 离开路由前 | 有 | 离开确认、清理 |

## 参考资料

- [组件内的守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html#in-component-guards)
- [Composition API 路由守卫](https://router.vuejs.org/guide/advanced/composition-api.html#navigation-guards)

---

**下一节** → [第 12 节：路由懒加载](./12-lazy-loading.md)
