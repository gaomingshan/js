# 第 05 节：路由参数

## 概述

路由参数是 URL 中的动态部分，允许同一个路由匹配不同的 URL 模式。Vue Router 支持多种参数类型和匹配规则。

## 一、基础路径参数

### 1.1 简单参数

```javascript
// 路由配置
const routes = [
  {
    path: '/user/:id',
    component: User
  }
]

// 匹配的 URL：
// /user/123  → params: { id: '123' }
// /user/abc  → params: { id: 'abc' }
```

### 1.2 多个参数

```javascript
const routes = [
  {
    path: '/user/:id/post/:postId',
    component: UserPost
  }
]

// 匹配：/user/123/post/456
// params: { id: '123', postId: '456' }
```

### 1.3 参数访问

```vue
<template>
  <div>
    <h1>用户：{{ $route.params.id }}</h1>
    <h2>文章：{{ $route.params.postId }}</h2>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 访问参数
console.log(route.params.id)
console.log(route.params.postId)

// 所有参数
console.log(route.params) // { id: '123', postId: '456' }
</script>
```

## 二、参数约束

### 2.1 正则表达式约束

```javascript
const routes = [
  // 只匹配数字
  {
    path: '/user/:id(\\d+)',
    component: User
  },
  
  // 匹配 UUID 格式
  {
    path: '/article/:uuid([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
    component: Article
  },
  
  // 自定义模式
  {
    path: '/file/:filename([^/]+\\.(jpg|png|gif))',
    component: ImageViewer
  }
]
```

### 2.2 约束示例

```javascript
const routes = [
  // 用户 ID 必须是数字
  { path: '/user/:id(\\d+)', component: User },
  
  // 分页参数必须是正整数
  { path: '/posts/page/:page(\\d+)', component: PostList },
  
  // 语言代码格式：en-US, zh-CN
  { path: '/:lang([a-z]{2}-[A-Z]{2})/home', component: LocalizedHome },
  
  // 版本号格式：v1.2.3
  { path: '/api/:version(v\\d+\\.\\d+\\.\\d+)', component: ApiDocs }
]
```

### 2.3 参数验证

```vue
<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 验证 ID 参数
const userId = computed(() => {
  const id = route.params.id
  const numId = parseInt(id, 10)
  
  if (isNaN(numId) || numId <= 0) {
    router.replace('/404')
    return null
  }
  
  return numId
})

// 监听参数变化进行验证
watch(() => route.params.id, (newId) => {
  if (!/^\d+$/.test(newId)) {
    console.error('无效的用户 ID:', newId)
    router.replace('/error')
  }
})
</script>
```

## 三、可选参数

### 3.1 可选参数语法

```javascript
const routes = [
  // id 参数可选
  {
    path: '/posts/:id?',
    component: PostList
  }
]

// 匹配：
// /posts     → params: {}
// /posts/123 → params: { id: '123' }
```

### 3.2 处理可选参数

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 处理可选的 ID 参数
const postId = computed(() => route.params.id || null)

const isListView = computed(() => !postId.value)
const isDetailView = computed(() => !!postId.value)

// 根据参数显示不同内容
const fetchData = async () => {
  if (postId.value) {
    // 获取单个文章
    return await api.getPost(postId.value)
  } else {
    // 获取文章列表
    return await api.getPosts()
  }
}
</script>

<template>
  <div>
    <PostList v-if="isListView" />
    <PostDetail v-else :post-id="postId" />
  </div>
</template>
```

## 四、重复参数

### 4.1 一个或多个参数

```javascript
const routes = [
  // 至少一个 chapter
  {
    path: '/book/:chapters+',
    component: BookReader
  }
]

// 匹配：
// /book/chapter1               → params: { chapters: ['chapter1'] }
// /book/chapter1/chapter2      → params: { chapters: ['chapter1', 'chapter2'] }
// 不匹配：/book
```

### 4.2 零个或多个参数

```javascript
const routes = [
  // 零个或多个 tags
  {
    path: '/search/:tags*',
    component: SearchResults
  }
]

// 匹配：
// /search                      → params: { tags: [] }
// /search/vue                  → params: { tags: ['vue'] }
// /search/vue/router           → params: { tags: ['vue', 'router'] }
```

### 4.3 处理数组参数

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 确保 tags 始终是数组
const tags = computed(() => {
  const routeTags = route.params.tags
  if (!routeTags) return []
  return Array.isArray(routeTags) ? routeTags : [routeTags]
})

// 生成搜索查询
const searchQuery = computed(() => {
  return tags.value.join(' ')
})
</script>

<template>
  <div>
    <h1>搜索结果</h1>
    <p v-if="tags.length">搜索标签：{{ tags.join(', ') }}</p>
    <p v-else>显示所有内容</p>
  </div>
</template>
```

## 五、通配符参数

### 5.1 捕获所有路径

```javascript
const routes = [
  // 捕获所有路径
  {
    path: '/files/:pathMatch(.*)*',
    component: FileExplorer
  }
]

// 匹配：
// /files/documents/readme.txt  → params: { pathMatch: ['documents', 'readme.txt'] }
// /files/images/avatar.png     → params: { pathMatch: ['images', 'avatar.png'] }
```

### 5.2 404 路由

```javascript
const routes = [
  // 其他路由...
  
  // 捕获所有未匹配的路径
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]
```

### 5.3 处理文件路径

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 重建文件路径
const filePath = computed(() => {
  const pathSegments = route.params.pathMatch
  return Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments
})

// 解析文件信息
const fileInfo = computed(() => {
  const path = filePath.value
  const lastSlash = path.lastIndexOf('/')
  const fileName = lastSlash > -1 ? path.substring(lastSlash + 1) : path
  const directory = lastSlash > -1 ? path.substring(0, lastSlash) : ''
  const extension = fileName.includes('.') ? fileName.split('.').pop() : ''
  
  return { fileName, directory, extension, fullPath: path }
})
</script>
```

## 六、参数类型转换

### 6.1 自动类型转换

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 转换为数字
const pageNumber = computed(() => {
  const page = parseInt(route.params.page, 10)
  return isNaN(page) ? 1 : Math.max(1, page)
})

// 转换为布尔值
const isEnabled = computed(() => {
  return route.params.enabled === 'true'
})

// 解析 JSON 参数
const filters = computed(() => {
  try {
    return JSON.parse(decodeURIComponent(route.params.filters || '{}'))
  } catch {
    return {}
  }
})
</script>
```

### 6.2 参数解码

```javascript
// URL 编码的参数需要解码
const decodedParam = computed(() => {
  return decodeURIComponent(route.params.searchTerm || '')
})

// 处理特殊字符
const safeName = computed(() => {
  return route.params.name?.replace(/[<>]/g, '') || ''
})
```

## 七、参数传递给组件

### 7.1 Props 模式配置

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    props: true  // 将 params 作为 props 传递
  },
  
  {
    path: '/post/:id',
    component: Post,
    props: (route) => ({
      // 自定义 props 生成
      id: parseInt(route.params.id),
      showComments: route.query.comments === 'true'
    })
  }
]
```

### 7.2 组件中接收 Props

```vue
<!-- User.vue -->
<template>
  <div>
    <h1>用户 {{ id }}</h1>
  </div>
</template>

<script setup>
// 通过 props 接收参数，而不是 $route.params
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

// props.id 是响应式的
watch(() => props.id, (newId) => {
  fetchUserData(newId)
})
</script>
```

## 八、参数最佳实践

### 8.1 参数命名规范

```javascript
// ✅ 好的参数命名
const routes = [
  { path: '/user/:userId', component: User },
  { path: '/post/:postId', component: Post },
  { path: '/category/:categorySlug', component: Category }
]

// ❌ 避免的命名
const routes = [
  { path: '/user/:id', component: User },        // 太通用
  { path: '/post/:postID', component: Post },    // 大小写不一致
  { path: '/cat/:c', component: Category }       // 太简短
]
```

### 8.2 参数验证中间件

```javascript
// 参数验证函数
const validateParams = {
  userId: (value) => /^\d+$/.test(value),
  postSlug: (value) => /^[a-z0-9-]+$/.test(value),
  categoryId: (value) => Number.isInteger(parseInt(value, 10))
}

// 全局守卫中验证
router.beforeEach((to) => {
  for (const [key, value] of Object.entries(to.params)) {
    const validator = validateParams[key]
    if (validator && !validator(value)) {
      console.error(`Invalid parameter ${key}:`, value)
      return '/404'
    }
  }
})
```

### 8.3 参数缓存

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const cache = new Map()

// 缓存参数相关的数据
const getCachedData = async (key) => {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const data = await fetchData(key)
  cache.set(key, data)
  
  // 清理过期缓存
  if (cache.size > 50) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  
  return data
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    getCachedData(newId)
  }
})
</script>
```

## 九、总结

| 参数类型 | 语法 | 说明 |
|----------|------|------|
| 基础参数 | `:id` | 必需的动态参数 |
| 可选参数 | `:id?` | 可选的动态参数 |
| 重复参数 | `:tags+` | 一个或多个参数 |
| 零或多个 | `:tags*` | 零个或多个参数 |
| 通配符 | `:path(.*)` | 捕获所有路径 |
| 正则约束 | `:id(\\d+)` | 参数格式约束 |

## 参考资料

- [动态路由匹配](https://router.vuejs.org/guide/essentials/dynamic-matching.html)
- [路由匹配语法](https://router.vuejs.org/guide/essentials/route-matching-syntax.html)

---

**下一节** → [第 06 节：查询参数](./06-query-params.md)
