# 第 5 章：动态路由匹配

## 概述

动态路由匹配允许我们将一定模式的 URL 映射到同一个组件，通过路径参数来区分不同的资源。这是构建 RESTful 风格应用的基础。

## 动态路由参数（params）

### 基础用法

```javascript
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: User
  }
]
```

**访问参数：**

```vue
<template>
  <div>
    <h1>用户 ID: {{ $route.params.id }}</h1>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log(this.$route.params.id)
  },
  
  // Composition API
  setup() {
    const route = useRoute()
    console.log(route.params.id)
  }
}
</script>
```

### 多个参数

```javascript
const routes = [
  {
    path: '/post/:category/:year/:month/:slug',
    component: Post
  }
]

// 访问: /post/tech/2024/03/vue-router-guide
// params: {
//   category: 'tech',
//   year: '2024',
//   month: '03',
//   slug: 'vue-router-guide'
// }
```

### 解耦路由参数（推荐）

```javascript
// 方式 1: props 布尔模式
{
  path: '/user/:id',
  component: User,
  props: true  // 将 params 作为 props 传递
}

// User.vue
export default {
  props: ['id'],  // 接收 props
  mounted() {
    console.log(this.id)  // 直接使用 props，无需 $route
  }
}

// 方式 2: props 对象模式
{
  path: '/user',
  component: User,
  props: { type: 'customer' }  // 静态 props
}

// 方式 3: props 函数模式
{
  path: '/search',
  component: Search,
  props: route => ({
    query: route.query.q,
    page: Number(route.query.page) || 1
  })
}
```

**解耦的优势：**

```vue
<!-- 不解耦：组件依赖 $route -->
<template>
  <div>用户: {{ $route.params.id }}</div>
</template>

<!-- 解耦：组件独立，便于测试和复用 -->
<template>
  <div>用户: {{ id }}</div>
</template>

<script>
export default {
  props: ['id']
}
</script>

<!-- 测试时无需路由 -->
<User :id="123" />
```

## 路径参数的高级匹配

### 1. 参数正则匹配

```javascript
const routes = [
  // 只匹配数字 ID
  {
    path: '/user/:id(\\d+)',
    component: User
  },
  // 匹配 4 位年份 + 2 位月份
  {
    path: '/archive/:year(\\d{4})/:month(\\d{2})',
    component: Archive
  },
  // 匹配枚举值
  {
    path: '/post/:type(article|video|image)',
    component: Post
  }
]

// 测试
'/user/123'        // ✅ 匹配
'/user/abc'        // ❌ 不匹配
'/archive/2024/03' // ✅ 匹配
'/archive/24/3'    // ❌ 不匹配
'/post/article'    // ✅ 匹配
'/post/music'      // ❌ 不匹配
```

### 2. 可选参数

```javascript
const routes = [
  // id 可选
  {
    path: '/user/:id?',
    component: User
  }
]

// 两个路径都匹配
'/user'      // params: {}
'/user/123'  // params: { id: '123' }
```

```vue
<!-- User.vue -->
<template>
  <div v-if="id">
    用户详情: {{ id }}
  </div>
  <div v-else>
    用户列表
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: ''
    }
  }
}
</script>
```

### 3. 重复参数

```javascript
// + 匹配一个或多个段
{
  path: '/files/:path+',
  component: FileExplorer
}

'/files/documents'              // params: { path: ['documents'] }
'/files/documents/2024'         // params: { path: ['documents', '2024'] }
'/files/documents/2024/report'  // params: { path: ['documents', '2024', 'report'] }
'/files'                        // ❌ 不匹配

// * 匹配零个或多个段
{
  path: '/files/:path*',
  component: FileExplorer
}

'/files'                        // ✅ params: { path: [] }
'/files/documents/2024/report'  // ✅ params: { path: ['documents', '2024', 'report'] }
```

**实际应用：**

```vue
<!-- FileExplorer.vue -->
<template>
  <div>
    <div class="breadcrumb">
      <span>根目录</span>
      <span v-for="(segment, index) in pathSegments" :key="index">
        / {{ segment }}
      </span>
    </div>
    <div class="file-list">
      <!-- 显示当前路径下的文件 -->
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    pathSegments() {
      const path = this.$route.params.path
      return Array.isArray(path) ? path : [path]
    },
    currentPath() {
      return this.pathSegments.join('/')
    }
  }
}
</script>
```

## 404 路由与通配符

### Vue Router 4.x

```javascript
const routes = [
  // 其他路由...
  
  // 404 路由（放在最后）
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]
```

```vue
<!-- NotFound.vue -->
<template>
  <div class="not-found">
    <h1>404 - 页面不存在</h1>
    <p>您访问的页面 <code>{{ $route.params.pathMatch }}</code> 不存在</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>
```

### 特定前缀的 404

```javascript
const routes = [
  {
    path: '/user/:id(\\d+)',
    component: User
  },
  // 匹配 /user/ 开头但不是数字 ID 的路径
  {
    path: '/user/:pathMatch(.*)*',
    component: UserNotFound
  }
]

// /user/123 → User 组件
// /user/abc → UserNotFound 组件
```

### Vue Router 3.x（兼容）

```javascript
const routes = [
  {
    path: '*',
    component: NotFound
  },
  {
    path: '/user-*',
    component: UserNotFound
  }
]
```

## 参数的响应式问题

### 问题场景

```javascript
const routes = [
  { path: '/user/:id', component: User }
]
```

```vue
<!-- User.vue -->
<template>
  <div>
    <h1>用户 ID: {{ userId }}</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: null
    }
  },
  
  mounted() {
    this.userId = this.$route.params.id
    console.log('mounted:', this.userId)
  }
}
</script>
```

**问题：** 从 `/user/1` 导航到 `/user/2` 时，组件会被**复用**，`mounted` 不会再次执行，`userId` 不会更新。

### 解决方案

#### 方案 1: 监听 $route（推荐）

```vue
<script>
export default {
  data() {
    return {
      userId: null,
      userInfo: null
    }
  },
  
  watch: {
    '$route.params.id': {
      immediate: true,  // 立即执行
      handler(newId) {
        this.userId = newId
        this.fetchUser(newId)
      }
    }
  },
  
  methods: {
    async fetchUser(id) {
      const res = await fetch(`/api/user/${id}`)
      this.userInfo = await res.json()
    }
  }
}
</script>
```

#### 方案 2: beforeRouteUpdate 守卫

```vue
<script>
export default {
  async beforeRouteUpdate(to, from) {
    // 参数变化时调用
    this.userId = to.params.id
    await this.fetchUser(to.params.id)
  },
  
  async mounted() {
    // 首次加载
    this.userId = this.$route.params.id
    await this.fetchUser(this.userId)
  }
}
</script>
```

#### 方案 3: 使用 key 强制刷新（不推荐）

```vue
<template>
  <router-view :key="$route.fullPath" />
</template>
```

**问题：** 组件会被完全销毁重建，丢失所有状态，性能较差。

#### 方案 4: Composition API（推荐）

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = ref(route.params.id)
const userInfo = ref(null)

const fetchUser = async (id) => {
  const res = await fetch(`/api/user/${id}`)
  userInfo.value = await res.json()
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    userId.value = newId
    fetchUser(newId)
  },
  { immediate: true }
)
</script>
```

## 关键点总结

1. **动态参数**：使用 `:paramName` 语法，通过 `$route.params` 访问
2. **参数解耦**：使用 `props: true` 解耦组件与路由，便于测试
3. **高级匹配**：支持正则、可选参数、重复参数
4. **404 处理**：使用 `/:pathMatch(.*)*` 捕获所有未匹配路由
5. **响应式问题**：组件复用时需要监听 `$route` 或使用 `beforeRouteUpdate`

## 深入一点：参数编码与解码

```javascript
// 自动编码
router.push({ name: 'User', params: { id: 'hello world' } })
// URL: /user/hello%20world

// 自动解码
// URL: /user/hello%20world
console.log(this.$route.params.id)  // 'hello world'

// 特殊字符
router.push({ name: 'Search', params: { query: 'vue/react' } })
// URL: /search/vue%2Freact

// 手动编码（不推荐）
router.push(`/user/${encodeURIComponent(userId)}`)
// 会被二次编码！

// 正确方式：使用对象形式
router.push({ name: 'User', params: { id: userId } })
```

**路径参数 vs 查询参数：**

```javascript
// 路径参数：资源标识
/user/123          // ✅ 用户 123
/post/vue-router   // ✅ slug 为 vue-router 的文章

// 查询参数：过滤、排序、分页
/posts?category=tech&page=2&sort=date  // ✅ 筛选条件

// 不推荐
/posts/tech/2/date  // ❌ 将过滤条件放在路径中
```

## 参考资料

- [Vue Router - 动态路由匹配](https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html)
- [Vue Router - 路由组件传参](https://router.vuejs.org/zh/guide/essentials/passing-props.html)
- [MDN - encodeURIComponent](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
