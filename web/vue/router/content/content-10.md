# 第 10 章：路由传参方式

## 概述

路由传参是前端应用中常见的需求，Vue Router 提供了多种传参方式：params、query、state 和 props。理解它们的特点和适用场景，是构建健壮应用的关键。

## params 传参与接收

### 动态路径参数

```javascript
// 路由配置
{
  path: '/user/:id',
  name: 'User',
  component: User
}

// 传参
router.push({ name: 'User', params: { id: 123 } })
// URL: /user/123

// 接收
this.$route.params.id  // '123'（字符串）
```

### 多个参数

```javascript
// 路由配置
{
  path: '/post/:category/:year/:slug',
  name: 'Post',
  component: Post
}

// 传参
router.push({
  name: 'Post',
  params: {
    category: 'tech',
    year: '2024',
    slug: 'vue-router-guide'
  }
})
// URL: /post/tech/2024/vue-router-guide

// 接收
this.$route.params.category  // 'tech'
this.$route.params.year      // '2024'
this.$route.params.slug      // 'vue-router-guide'
```

### 可选参数

```javascript
// 路由配置
{
  path: '/user/:id?',
  name: 'User',
  component: User
}

// 传参 1：带参数
router.push({ name: 'User', params: { id: 123 } })
// URL: /user/123

// 传参 2：不带参数
router.push({ name: 'User' })
// URL: /user

// 接收
const id = this.$route.params.id || 'default'
```

### params 的特点

**优点：**
- URL 简洁美观
- 符合 RESTful 风格
- 刷新页面参数不会丢失

**缺点：**
- 必须在路由中定义参数
- 必须使用命名路由
- 参数都是字符串，需要手动转换类型

**注意事项：**

```javascript
// ❌ 错误：使用 path 时 params 会被忽略
router.push({ path: '/user', params: { id: 123 } })
// URL: /user（params 丢失！）

// ✅ 正确：使用 name
router.push({ name: 'User', params: { id: 123 } })
// URL: /user/123

// ✅ 正确：path 中手动拼接
router.push({ path: `/user/${id}` })
// URL: /user/123
```

## query 传参与接收

### 基础用法

```javascript
// 传参
router.push({
  path: '/search',
  query: {
    q: 'vue router',
    page: 1,
    sort: 'date'
  }
})
// URL: /search?q=vue%20router&page=1&sort=date

// 接收
this.$route.query.q      // 'vue router'
this.$route.query.page   // '1'（字符串）
this.$route.query.sort   // 'date'
```

### 类型转换

```javascript
// query 参数都是字符串
const page = Number(this.$route.query.page) || 1
const pageSize = Number(this.$route.query.pageSize) || 10
const isActive = this.$route.query.active === 'true'
const tags = this.$route.query.tags?.split(',') || []

// 更健壮的转换
const parseQueryInt = (value, defaultValue = 0) => {
  const num = parseInt(value, 10)
  return isNaN(num) ? defaultValue : num
}

const page = parseQueryInt(this.$route.query.page, 1)
```

### 数组参数

```javascript
// 传参
router.push({
  path: '/products',
  query: {
    category: ['electronics', 'books'],
    price: [100, 500]
  }
})
// URL: /products?category=electronics&category=books&price=100&price=500

// 接收
this.$route.query.category  // ['electronics', 'books']
this.$route.query.price     // ['100', '500']
```

### query 的特点

**优点：**
- 不需要在路由中定义
- 可以在任何路由中使用
- 适合可选参数和过滤条件
- 刷新页面参数不会丢失

**缺点：**
- URL 较长，不够美观
- 参数全部显示在 URL 中
- 参数都是字符串

**适用场景：**

```javascript
// ✅ 搜索、筛选、分页
router.push({ 
  path: '/products', 
  query: { category: 'tech', page: 2, sort: 'price' } 
})

// ✅ 标签页切换
router.push({ 
  path: '/user/123', 
  query: { tab: 'posts' } 
})

// ✅ 来源追踪
router.push({ 
  path: '/article/456', 
  query: { from: 'search-results' } 
})
```

## state 传参（History API）

### 基础用法

```javascript
// 传参（不会显示在 URL 中）
router.push({
  name: 'User',
  params: { id: 123 },
  state: {
    from: 'search-results',
    searchQuery: 'vue developer',
    scrollPosition: 300
  }
})
// URL: /user/123（state 不显示在 URL 中）

// 接收（Vue Router 4.x）
this.$route.params.state  // undefined（不推荐）
window.history.state      // { from: 'search-results', ... }
```

### 实际应用

```vue
<!-- SearchResults.vue -->
<template>
  <div>
    <div v-for="user in users" :key="user.id">
      <button @click="viewUser(user)">查看详情</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: 'vue developer',
      scrollPosition: 0
    }
  },
  
  methods: {
    viewUser(user) {
      // 保存当前状态
      this.scrollPosition = window.scrollY
      
      // 跳转时传递 state
      this.$router.push({
        name: 'UserProfile',
        params: { id: user.id },
        state: {
          from: 'search',
          query: this.searchQuery,
          scrollPosition: this.scrollPosition
        }
      })
    }
  }
}
</script>

<!-- UserProfile.vue -->
<script>
export default {
  mounted() {
    const state = window.history.state
    
    if (state?.from === 'search') {
      console.log('来自搜索页')
      console.log('搜索关键词:', state.query)
      
      // 返回时恢复滚动位置
      this.returnScroll = state.scrollPosition
    }
  },
  
  methods: {
    goBack() {
      this.$router.back()
      // 浏览器会自动恢复滚动位置（通过 state）
    }
  }
}
</script>
```

### state 的特点

**优点：**
- 不显示在 URL 中
- 适合传递敏感或临时数据
- 不污染 URL

**缺点：**
- 刷新页面后**丢失**
- 不能通过 `$route` 直接访问
- 兼容性要求 HTML5 History API

**适用场景：**

```javascript
// ✅ 页面状态（滚动位置、表单数据）
router.push({ 
  path: '/detail', 
  state: { scrollY: window.scrollY } 
})

// ✅ 来源信息
router.push({ 
  path: '/article', 
  state: { referrer: 'homepage' } 
})

// ❌ 不适合需要刷新后保留的数据
router.push({ 
  path: '/user', 
  state: { userId: 123 }  // 刷新后丢失！
})
```

## props 解耦路由参数

### 布尔模式

```javascript
// 路由配置
{
  path: '/user/:id',
  component: User,
  props: true  // 将 params 作为 props 传递
}

// User.vue
export default {
  props: ['id'],  // 接收 props
  
  mounted() {
    console.log(this.id)  // 无需访问 $route.params
  }
}
```

### 对象模式

```javascript
// 路由配置
{
  path: '/promotion',
  component: Promotion,
  props: { type: 'special', discount: 0.2 }  // 静态 props
}

// Promotion.vue
export default {
  props: ['type', 'discount']
}
```

### 函数模式（最灵活）

```javascript
// 路由配置
{
  path: '/search',
  component: Search,
  props: route => ({
    query: route.query.q,
    page: Number(route.query.page) || 1,
    pageSize: Number(route.query.pageSize) || 10,
    category: route.query.category || 'all'
  })
}

// Search.vue
export default {
  props: {
    query: String,
    page: Number,
    pageSize: Number,
    category: String
  },
  
  watch: {
    page() {
      this.fetchData()
    }
  },
  
  methods: {
    async fetchData() {
      const res = await api.search({
        q: this.query,
        page: this.page,
        pageSize: this.pageSize,
        category: this.category
      })
      this.results = res.data
    }
  }
}
```

### 命名视图的 props

```javascript
{
  path: '/user/:id',
  components: {
    default: UserProfile,
    sidebar: UserSidebar
  },
  props: {
    default: true,                    // 布尔模式
    sidebar: { theme: 'dark' }        // 对象模式
  }
}
```

### props 的优势

**1. 组件解耦**

```vue
<!-- 不使用 props：组件依赖路由 -->
<template>
  <div>用户 ID: {{ $route.params.id }}</div>
</template>

<!-- 使用 props：组件独立 -->
<template>
  <div>用户 ID: {{ id }}</div>
</template>

<script>
export default {
  props: ['id']
}
</script>

<!-- 可以在任何地方使用，不依赖路由 -->
<User :id="123" />
```

**2. 类型转换**

```javascript
{
  path: '/article/:id',
  props: route => ({
    id: Number(route.params.id),           // 转为数字
    showComments: route.query.comments === 'true',  // 转为布尔
    tags: route.query.tags?.split(',') || []        // 转为数组
  })
}
```

**3. 默认值**

```javascript
export default {
  props: {
    id: {
      type: Number,
      required: true
    },
    page: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    }
  }
}
```

**4. 便于测试**

```javascript
// 测试时无需路由
import { mount } from '@vue/test-utils'
import User from '@/views/User.vue'

test('User component', () => {
  const wrapper = mount(User, {
    props: { id: 123 }
  })
  
  expect(wrapper.text()).toContain('123')
})
```

## 传参方式的选择与对比

| 特性 | params | query | state | props |
|------|--------|-------|-------|-------|
| **显示在 URL** | ✅ | ✅ | ❌ | - |
| **刷新保留** | ✅ | ✅ | ❌ | - |
| **需要定义路由** | ✅ | ❌ | ❌ | ✅ |
| **类型** | 字符串 | 字符串 | 任意 | 任意 |
| **适合资源标识** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | - |
| **适合过滤条件** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | - |
| **适合临时数据** | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ | - |
| **组件解耦** | ⭐ | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ |

### 选择建议

```javascript
// 1. 资源标识 → params
router.push({ name: 'User', params: { id: 123 } })
router.push({ name: 'Post', params: { slug: 'vue-router-guide' } })

// 2. 过滤、搜索、分页 → query
router.push({ 
  path: '/products', 
  query: { category: 'tech', page: 2, sort: 'price' } 
})

// 3. 临时状态、来源信息 → state
router.push({ 
  path: '/detail', 
  state: { scrollY: 300, from: 'search' } 
})

// 4. 组件解耦、类型转换 → props
{
  path: '/search',
  props: route => ({
    query: route.query.q,
    page: Number(route.query.page) || 1
  })
}
```

### 组合使用

```javascript
// 实际项目中通常组合使用
router.push({
  name: 'ArticleDetail',      // 命名路由
  params: { id: 456 },        // 文章 ID
  query: { 
    comment: 123,             // 定位到评论
    highlight: 'true'         // 高亮显示
  },
  state: { 
    from: 'timeline',         // 来源页面
    scrollY: 500              // 滚动位置
  },
  hash: '#comment-123'        // 锚点
})
// URL: /article/456?comment=123&highlight=true#comment-123
```

## 关键点总结

1. **params**：适合资源标识，必须使用命名路由
2. **query**：适合过滤条件，可用于任何路由
3. **state**：适合临时数据，刷新后丢失
4. **props**：解耦组件与路由，便于测试和复用
5. **组合使用**：实际项目中根据需求灵活组合

## 深入一点：参数变化的响应

```vue
<template>
  <div>
    <h1>文章 {{ articleId }}</h1>
    <div v-html="content"></div>
  </div>
</template>

<script>
export default {
  props: ['id'],
  
  data() {
    return {
      articleId: null,
      content: ''
    }
  },
  
  // 方式 1: watch props
  watch: {
    id: {
      immediate: true,
      async handler(newId) {
        this.articleId = newId
        await this.fetchArticle(newId)
      }
    }
  },
  
  // 方式 2: beforeRouteUpdate
  async beforeRouteUpdate(to, from) {
    this.articleId = to.params.id
    await this.fetchArticle(to.params.id)
  },
  
  methods: {
    async fetchArticle(id) {
      const res = await api.getArticle(id)
      this.content = res.data.content
    }
  }
}
</script>
```

## 参考资料

- [Vue Router - 路由组件传参](https://router.vuejs.org/zh/guide/essentials/passing-props.html)
- [Vue Router - 动态路由匹配](https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html)
- [MDN - History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)
