# 第 13 章：组件内守卫

## 概述

组件内守卫是定义在路由组件内部的导航守卫，包括 `beforeRouteEnter`、`beforeRouteUpdate` 和 `beforeRouteLeave`。它们可以直接访问组件实例，适合处理组件级别的导航逻辑。

## beforeRouteEnter 守卫

### 基础用法

```vue
<script>
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被验证前调用
    // 不能访问组件实例 `this`，因为组件还未创建
    console.log(this)  // undefined
  }
}
</script>
```

### 访问组件实例

```vue
<script>
export default {
  data() {
    return {
      user: null
    }
  },
  
  beforeRouteEnter(to, from, next) {
    // 通过 next 回调访问组件实例
    next(vm => {
      // 此时组件实例已创建
      console.log(vm)  // 组件实例
      vm.user = { name: 'Alice' }
    })
  }
}
</script>
```

### 预加载数据

```vue
<script>
export default {
  data() {
    return {
      post: null,
      loading: true,
      error: null
    }
  },
  
  async beforeRouteEnter(to, from, next) {
    try {
      // 在组件创建前预加载数据
      const postId = to.params.id
      const response = await fetch(`/api/posts/${postId}`)
      const post = await response.json()
      
      next(vm => {
        // 将数据设置到组件实例
        vm.post = post
        vm.loading = false
      })
    } catch (error) {
      next(vm => {
        vm.error = error.message
        vm.loading = false
      })
    }
  }
}
</script>
```

### Vue Router 4.x + Composition API

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { onBeforeRouteEnter } from 'vue-router'

const post = ref(null)
const loading = ref(true)

// 注意：setup 中的 onBeforeRouteEnter 有限制
onBeforeRouteEnter((to, from) => {
  // 无法访问组件实例
  console.log('进入路由前')
})

// 推荐：在 mounted 中加载数据
onMounted(async () => {
  const postId = route.params.id
  post.value = await fetchPost(postId)
  loading.value = false
})
</script>
```

## beforeRouteUpdate 守卫

### 基础用法

```vue
<script>
export default {
  beforeRouteUpdate(to, from) {
    // 在当前路由改变，但是该组件被复用时调用
    // 可以访问组件实例 `this`
    console.log(this)  // 组件实例
  }
}
</script>
```

### 参数变化时重新加载数据

```vue
<!-- User.vue -->
<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <h1>{{ user.name }}</h1>
    <p>{{ user.bio }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      loading: false,
      error: null
    }
  },
  
  async mounted() {
    // 首次加载
    await this.fetchUser(this.$route.params.id)
  },
  
  async beforeRouteUpdate(to, from) {
    // 从 /user/1 到 /user/2 时触发
    if (to.params.id !== from.params.id) {
      await this.fetchUser(to.params.id)
    }
  },
  
  methods: {
    async fetchUser(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/users/${id}`)
        this.user = await response.json()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
```

### query 参数变化

```vue
<script>
export default {
  data() {
    return {
      products: [],
      currentPage: 1,
      category: 'all'
    }
  },
  
  mounted() {
    this.loadProducts()
  },
  
  beforeRouteUpdate(to, from) {
    // query 参数变化时重新加载
    const pageChanged = to.query.page !== from.query.page
    const categoryChanged = to.query.category !== from.query.category
    
    if (pageChanged || categoryChanged) {
      this.currentPage = Number(to.query.page) || 1
      this.category = to.query.category || 'all'
      this.loadProducts()
    }
  },
  
  methods: {
    async loadProducts() {
      const response = await fetch(
        `/api/products?page=${this.currentPage}&category=${this.category}`
      )
      this.products = await response.json()
    }
  }
}
</script>
```

### Composition API 用法

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

const route = useRoute()
const user = ref(null)

// 方式 1: onBeforeRouteUpdate
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    user.value = await fetchUser(to.params.id)
  }
})

// 方式 2: watch route（推荐）
watch(
  () => route.params.id,
  async (newId) => {
    user.value = await fetchUser(newId)
  },
  { immediate: true }
)

async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
</script>
```

## beforeRouteLeave 守卫

### 基础用法

```vue
<script>
export default {
  beforeRouteLeave(to, from) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
  }
}
</script>
```

### 未保存数据提示

```vue
<template>
  <div>
    <h1>编辑文章</h1>
    <form @submit.prevent="save">
      <input v-model="form.title" placeholder="标题" />
      <textarea v-model="form.content" placeholder="内容"></textarea>
      <button type="submit">保存</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        title: '',
        content: ''
      },
      saved: false,
      originalData: null
    }
  },
  
  mounted() {
    // 保存原始数据
    this.originalData = { ...this.form }
  },
  
  computed: {
    hasUnsavedChanges() {
      return !this.saved && (
        this.form.title !== this.originalData.title ||
        this.form.content !== this.originalData.content
      )
    }
  },
  
  beforeRouteLeave(to, from) {
    if (this.hasUnsavedChanges) {
      const confirmed = window.confirm(
        '有未保存的更改，确定要离开吗？'
      )
      
      if (!confirmed) {
        return false  // 取消导航
      }
    }
  },
  
  methods: {
    async save() {
      await this.submitForm()
      this.saved = true
      this.originalData = { ...this.form }
    }
  }
}
</script>
```

### 自定义确认对话框

```vue
<template>
  <div>
    <FormEditor v-model="form" />
    
    <!-- 自定义确认对话框 -->
    <ConfirmDialog
      v-model:show="showLeaveConfirm"
      title="确认离开"
      message="有未保存的更改，确定要离开吗？"
      @confirm="handleLeaveConfirm"
      @cancel="handleLeaveCancel"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {},
      showLeaveConfirm: false,
      pendingNavigation: null
    }
  },
  
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      // 保存待处理的导航
      this.pendingNavigation = next
      
      // 显示自定义对话框
      this.showLeaveConfirm = true
      
      // 暂时取消导航
      return false
    }
    
    // 无未保存更改，允许导航
    next()
  },
  
  methods: {
    handleLeaveConfirm() {
      this.showLeaveConfirm = false
      // 确认离开，继续导航
      if (this.pendingNavigation) {
        this.pendingNavigation()
        this.pendingNavigation = null
      }
    },
    
    handleLeaveCancel() {
      this.showLeaveConfirm = false
      // 取消离开
      if (this.pendingNavigation) {
        this.pendingNavigation(false)
        this.pendingNavigation = null
      }
    }
  }
}
</script>
```

### 清理资源

```vue
<script>
export default {
  data() {
    return {
      ws: null,
      timer: null
    }
  },
  
  mounted() {
    // 建立 WebSocket 连接
    this.ws = new WebSocket('ws://example.com')
    
    // 启动定时器
    this.timer = setInterval(() => {
      this.heartbeat()
    }, 30000)
  },
  
  beforeRouteLeave(to, from) {
    // 离开时清理资源
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  
  // 注意：beforeUnmount 也会清理，但 beforeRouteLeave 更早
  beforeUnmount() {
    // 双重保险
    if (this.ws) {
      this.ws.close()
    }
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>
```

### Composition API 用法

```vue
<script setup>
import { ref, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const form = ref({ title: '', content: '' })
const saved = ref(false)

const hasUnsavedChanges = computed(() => {
  return !saved.value && (form.value.title || form.value.content)
})

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const confirmed = window.confirm('有未保存的更改，确定要离开吗？')
    if (!confirmed) {
      return false
    }
  }
})
</script>
```

## 守卫中的 this 访问

### beforeRouteEnter 的特殊性

```vue
<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  
  beforeRouteEnter(to, from, next) {
    // ❌ 不能访问 this（组件还未创建）
    console.log(this.message)  // undefined
    
    // ✅ 通过 next 回调访问
    next(vm => {
      console.log(vm.message)  // 'Hello'
      vm.loadData()
    })
  },
  
  beforeRouteUpdate(to, from) {
    // ✅ 可以访问 this
    console.log(this.message)  // 'Hello'
    this.loadData()
  },
  
  beforeRouteLeave(to, from) {
    // ✅ 可以访问 this
    console.log(this.message)  // 'Hello'
    return this.canLeave()
  }
}
</script>
```

### Options API vs Composition API

```vue
<!-- Options API -->
<script>
export default {
  data() {
    return { count: 0 }
  },
  
  beforeRouteUpdate(to, from) {
    console.log(this.count)  // 可以访问 this
  }
}
</script>

<!-- Composition API -->
<script setup>
import { ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

const count = ref(0)

onBeforeRouteUpdate((to, from) => {
  console.log(count.value)  // 直接访问 ref
})
</script>
```

## 组件复用场景的处理

### 问题场景

```javascript
// 路由配置
{
  path: '/user/:id',
  component: User
}

// 从 /user/1 导航到 /user/2
// User 组件会被复用，不会触发 mounted
```

### 解决方案汇总

```vue
<script>
export default {
  data() {
    return {
      userId: null,
      userData: null
    }
  },
  
  // 方案 1: beforeRouteUpdate（推荐）
  async beforeRouteUpdate(to, from) {
    if (to.params.id !== from.params.id) {
      await this.loadUser(to.params.id)
    }
  },
  
  // 方案 2: watch $route
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler(newId) {
        await this.loadUser(newId)
      }
    }
  },
  
  // 方案 3: 使用 key 强制刷新（不推荐）
  // <router-view :key="$route.fullPath" />
  
  methods: {
    async loadUser(id) {
      this.userId = id
      this.userData = await fetchUser(id)
    }
  }
}
</script>
```

### 完整示例

```vue
<template>
  <div class="user-profile">
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="retry">重试</button>
    </div>
    
    <div v-else class="content">
      <h1>{{ user.name }}</h1>
      <p>{{ user.bio }}</p>
      
      <div class="tabs">
        <router-link :to="`/user/${userId}/posts`">帖子</router-link>
        <router-link :to="`/user/${userId}/followers`">关注者</router-link>
      </div>
      
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: null,
      user: null,
      loading: false,
      error: null
    }
  },
  
  async beforeRouteEnter(to, from, next) {
    try {
      const user = await fetchUser(to.params.id)
      next(vm => {
        vm.userId = to.params.id
        vm.user = user
      })
    } catch (error) {
      next(vm => {
        vm.error = error.message
      })
    }
  },
  
  async beforeRouteUpdate(to, from) {
    // 用户 ID 变化
    if (to.params.id !== from.params.id) {
      await this.loadUser(to.params.id)
    }
    
    // 子路由变化（如 posts → followers）
    // 不需要重新加载用户数据
  },
  
  beforeRouteLeave(to, from) {
    // 清理状态
    this.user = null
    this.error = null
  },
  
  methods: {
    async loadUser(id) {
      this.loading = true
      this.error = null
      
      try {
        this.user = await fetchUser(id)
        this.userId = id
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    retry() {
      this.loadUser(this.userId)
    }
  }
}
</script>
```

## 关键点总结

1. **beforeRouteEnter**：组件创建前调用，不能访问 `this`，通过 `next` 回调访问
2. **beforeRouteUpdate**：组件复用时调用，可访问 `this`，适合处理参数变化
3. **beforeRouteLeave**：离开组件前调用，可访问 `this`，适合未保存数据提示
4. **this 访问**：只有 `beforeRouteEnter` 不能直接访问 `this`
5. **组件复用**：使用 `beforeRouteUpdate` 或 `watch` 处理参数变化

## 深入一点：异步组件与守卫

```javascript
// 路由配置
{
  path: '/lazy',
  component: () => import('./Lazy.vue')  // 异步组件
}

// 执行顺序
1. 触发导航
2. 全局 beforeEach
3. 路由 beforeEnter
4. 解析异步组件（import()）
5. 组件的 beforeRouteEnter  ← 此时组件代码已加载
6. 全局 beforeResolve
7. 导航确认
8. 创建组件实例
9. 执行 beforeRouteEnter 的 next 回调
```

## 参考资料

- [Vue Router - 组件内的守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E7%BB%84%E4%BB%B6%E5%86%85%E7%9A%84%E5%AE%88%E5%8D%AB)
- [Vue Router - Composition API](https://router.vuejs.org/zh/guide/advanced/composition-api.html)
