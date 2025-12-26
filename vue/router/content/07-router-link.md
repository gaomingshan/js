# 第 07 节：router-link 详解

## 概述

`<router-link>` 是 Vue Router 提供的导航组件，用于创建路由链接。它会渲染为 `<a>` 标签，并提供了丰富的导航功能和样式控制。

## 一、基础用法

### 1.1 简单链接

```vue
<template>
  <!-- 字符串路径 -->
  <router-link to="/home">首页</router-link>
  
  <!-- 对象形式 -->
  <router-link :to="{ path: '/about' }">关于</router-link>
  
  <!-- 命名路由 -->
  <router-link :to="{ name: 'User', params: { id: 123 } }">用户</router-link>
</template>
```

### 1.2 渲染结果

```html
<!-- 默认渲染为 a 标签 -->
<a href="/home" class="">首页</a>
<a href="/about" class="">关于</a>
<a href="/user/123" class="">用户</a>
```

## 二、to 属性详解

### 2.1 字符串路径

```vue
<template>
  <!-- 绝对路径 -->
  <router-link to="/user/profile">个人资料</router-link>
  
  <!-- 相对路径 -->
  <router-link to="profile">个人资料</router-link>
  
  <!-- 带查询参数 -->
  <router-link to="/search?q=vue">搜索</router-link>
  
  <!-- 带锚点 -->
  <router-link to="/page#section1">章节1</router-link>
</template>
```

### 2.2 对象形式

```vue
<template>
  <!-- 路径对象 -->
  <router-link :to="{ path: '/user/123' }">用户</router-link>
  
  <!-- 命名路由 -->
  <router-link :to="{ 
    name: 'UserProfile', 
    params: { id: 123 } 
  }">
    个人资料
  </router-link>
  
  <!-- 查询参数 -->
  <router-link :to="{ 
    path: '/search', 
    query: { q: 'vue', page: 1 } 
  }">
    搜索结果
  </router-link>
  
  <!-- 完整配置 -->
  <router-link :to="{
    name: 'PostDetail',
    params: { id: 456 },
    query: { comment: 'true' },
    hash: '#comments'
  }">
    文章详情
  </router-link>
</template>
```

### 2.3 动态 to 属性

```vue
<script setup>
import { ref, computed } from 'vue'

const userId = ref(123)
const showComments = ref(true)

// 计算属性
const userLink = computed(() => ({
  name: 'UserProfile',
  params: { id: userId.value }
}))

// 条件链接
const postLink = computed(() => ({
  name: 'PostDetail',
  params: { id: 456 },
  query: showComments.value ? { comments: 'true' } : {}
}))
</script>

<template>
  <router-link :to="userLink">用户资料</router-link>
  <router-link :to="postLink">文章详情</router-link>
</template>
```

## 三、导航行为

### 3.1 replace 属性

```vue
<template>
  <!-- 默认：push 模式（添加历史记录） -->
  <router-link to="/page1">页面1</router-link>
  
  <!-- replace 模式（替换当前记录） -->
  <router-link to="/page2" replace>页面2</router-link>
  
  <!-- 对象形式 -->
  <router-link :to="{ path: '/page3', replace: true }">页面3</router-link>
</template>
```

### 3.2 active-class 和 exact-active-class

```vue
<template>
  <!-- 自定义激活样式 -->
  <router-link 
    to="/home" 
    active-class="link-active"
    exact-active-class="link-exact-active"
  >
    首页
  </router-link>
</template>

<style>
.link-active {
  color: blue;
}

.link-exact-active {
  color: red;
  font-weight: bold;
}
</style>
```

### 3.3 全局样式配置

```javascript
// 路由器配置
const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active'
})
```

## 四、自定义渲染

### 4.1 custom 属性和 v-slot

```vue
<template>
  <!-- 自定义渲染 -->
  <router-link to="/home" custom v-slot="{ href, navigate, isActive }">
    <li :class="{ active: isActive }">
      <a :href="href" @click="navigate">首页</a>
    </li>
  </router-link>
  
  <!-- 按钮形式 -->
  <router-link to="/profile" custom v-slot="{ navigate, isActive }">
    <button 
      @click="navigate"
      :class="{ 'btn-active': isActive }"
      class="nav-btn"
    >
      个人资料
    </button>
  </router-link>
</template>
```

### 4.2 插槽参数详解

```vue
<template>
  <router-link to="/user/123" custom v-slot="slotProps">
    <div class="custom-link">
      <!-- href: 解析后的 URL -->
      <p>链接地址：{{ slotProps.href }}</p>
      
      <!-- navigate: 导航函数 -->
      <button @click="slotProps.navigate">导航到用户页</button>
      
      <!-- isActive: 是否激活 -->
      <span v-if="slotProps.isActive">当前页面</span>
      
      <!-- isExactActive: 是否精确激活 -->
      <span v-if="slotProps.isExactActive">精确匹配</span>
    </div>
  </router-link>
</template>
```

## 五、样式控制

### 5.1 激活状态判断

```css
/* 默认激活类名 */
.router-link-active {
  color: #42b983;
}

.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
}

/* 自定义激活类名 */
.nav-active {
  background-color: #f0f0f0;
  border-left: 3px solid #42b983;
}
```

### 5.2 条件样式

```vue
<template>
  <!-- 使用 CSS 类 -->
  <router-link 
    to="/dashboard" 
    :class="[
      'nav-link',
      { 'nav-link--primary': isPrimary }
    ]"
  >
    仪表板
  </router-link>
  
  <!-- 使用内联样式 -->
  <router-link 
    to="/settings"
    :style="{
      color: isActive ? 'red' : 'blue',
      fontWeight: isExactActive ? 'bold' : 'normal'
    }"
  >
    设置
  </router-link>
</template>
```

## 六、高级用法

### 6.1 导航菜单组件

```vue
<template>
  <nav class="navigation">
    <ul class="nav-list">
      <li v-for="item in menuItems" :key="item.name" class="nav-item">
        <router-link 
          :to="item.to"
          custom 
          v-slot="{ href, navigate, isActive, isExactActive }"
        >
          <a 
            :href="href"
            @click="navigate"
            :class="{
              'nav-link': true,
              'nav-link--active': isActive,
              'nav-link--exact': isExactActive
            }"
          >
            <icon :name="item.icon" />
            <span>{{ item.label }}</span>
            <badge v-if="item.badge" :count="item.badge" />
          </a>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const menuItems = [
  { name: 'home', label: '首页', to: '/home', icon: 'home' },
  { name: 'posts', label: '文章', to: '/posts', icon: 'document', badge: 5 },
  { name: 'profile', label: '个人', to: '/profile', icon: 'user' }
]
</script>
```

### 6.2 面包屑导航

```vue
<template>
  <nav class="breadcrumb">
    <router-link 
      v-for="(crumb, index) in breadcrumbs"
      :key="index"
      :to="crumb.to"
      :class="{
        'breadcrumb-item': true,
        'breadcrumb-item--current': index === breadcrumbs.length - 1
      }"
    >
      {{ crumb.label }}
      <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(record => record.meta?.breadcrumb)
  
  return matched.map(record => ({
    label: record.meta.breadcrumb,
    to: record.path
  }))
})
</script>
```

### 6.3 条件导航

```vue
<template>
  <!-- 权限控制 -->
  <router-link 
    v-if="hasPermission('admin')"
    to="/admin"
    class="admin-link"
  >
    管理后台
  </router-link>
  
  <!-- 登录状态 -->
  <router-link 
    v-if="isLoggedIn"
    to="/profile"
  >
    个人中心
  </router-link>
  <router-link 
    v-else
    to="/login"
  >
    登录
  </router-link>
  
  <!-- 功能开关 -->
  <router-link 
    v-if="featureFlags.newFeature"
    to="/new-feature"
  >
    新功能
  </router-link>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isAuthenticated)
const hasPermission = (role) => userStore.hasRole(role)
const featureFlags = computed(() => userStore.featureFlags)
</script>
```

## 七、事件处理

### 7.1 点击事件

```vue
<template>
  <!-- 阻止默认行为 -->
  <router-link 
    to="/page" 
    @click.prevent="handleClick"
  >
    自定义点击
  </router-link>
  
  <!-- 条件导航 -->
  <router-link 
    to="/protected" 
    @click="checkPermission"
  >
    受保护页面
  </router-link>
</template>

<script setup>
const handleClick = (event) => {
  // 自定义逻辑
  console.log('链接被点击')
  
  // 手动导航
  router.push('/custom-page')
}

const checkPermission = (event) => {
  if (!hasPermission()) {
    event.preventDefault()
    showLoginModal()
  }
}
</script>
```

### 7.2 外部链接处理

```vue
<template>
  <!-- 外部链接 -->
  <a 
    v-if="isExternalUrl(url)"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
  >
    {{ label }}
  </a>
  
  <!-- 内部链接 -->
  <router-link 
    v-else
    :to="url"
  >
    {{ label }}
  </router-link>
</template>

<script setup>
const props = defineProps({
  url: String,
  label: String
})

const isExternalUrl = (url) => {
  return /^https?:\/\//.test(url)
}
</script>
```

## 八、性能优化

### 8.1 懒加载提示

```vue
<template>
  <router-link 
    to="/heavy-page"
    @mouseenter="preloadHeavyPage"
    class="preload-link"
  >
    重型页面（悬停预加载）
  </router-link>
</template>

<script setup>
let preloadPromise = null

const preloadHeavyPage = () => {
  if (!preloadPromise) {
    // 预加载组件
    preloadPromise = import('@/views/HeavyPage.vue')
  }
}
</script>
```

### 8.2 链接缓存

```vue
<script setup>
// 缓存已解析的链接
const linkCache = new Map()

const getCachedLink = (to) => {
  const key = JSON.stringify(to)
  
  if (!linkCache.has(key)) {
    const resolved = router.resolve(to)
    linkCache.set(key, resolved)
  }
  
  return linkCache.get(key)
}
</script>
```

## 九、可访问性

### 9.1 无障碍属性

```vue
<template>
  <!-- ARIA 属性 -->
  <router-link 
    to="/page"
    :aria-current="isCurrentPage ? 'page' : null"
    role="menuitem"
  >
    页面链接
  </router-link>
  
  <!-- 屏幕阅读器支持 -->
  <router-link 
    to="/search"
    aria-label="搜索页面"
  >
    <icon name="search" aria-hidden="true" />
    <span class="sr-only">搜索</span>
  </router-link>
</template>
```

### 9.2 键盘导航

```vue
<template>
  <router-link 
    to="/page"
    @keydown.enter="handleEnterKey"
    @keydown.space="handleSpaceKey"
    tabindex="0"
  >
    可键盘访问的链接
  </router-link>
</template>

<script setup>
const handleEnterKey = (event) => {
  // Enter 键处理
  event.preventDefault()
  router.push('/page')
}

const handleSpaceKey = (event) => {
  // 空格键处理
  event.preventDefault()
  router.push('/page')
}
</script>
```

## 十、最佳实践

### 10.1 链接组织

```vue
<template>
  <!-- ✅ 好的实践 -->
  <nav class="main-nav">
    <router-link to="/home">首页</router-link>
    <router-link to="/products">产品</router-link>
    <router-link to="/about">关于</router-link>
  </nav>
  
  <!-- ❌ 避免的做法 -->
  <div>
    <router-link to="/page1">页面1</router-link>
    <router-link to="/page2">页面2</router-link>
    <!-- 缺乏语义结构 -->
  </div>
</template>
```

### 10.2 条件渲染

```vue
<script setup>
// ✅ 使用 v-if 控制显示
const showAdminLink = computed(() => {
  return user.value?.role === 'admin'
})

// ❌ 避免空链接
const emptyTo = computed(() => {
  return user.value ? '/profile' : ''
})
</script>

<template>
  <!-- ✅ 条件渲染 -->
  <router-link v-if="showAdminLink" to="/admin">
    管理后台
  </router-link>
  
  <!-- ❌ 空链接 -->
  <router-link :to="emptyTo">个人中心</router-link>
</template>
```

## 十一、总结

| 属性 | 说明 |
|------|------|
| to | 目标路由，支持字符串和对象 |
| replace | 替换当前历史记录 |
| active-class | 激活时的 CSS 类名 |
| exact-active-class | 精确匹配时的 CSS 类名 |
| custom | 自定义渲染模式 |
| v-slot | 访问导航状态和方法 |

## 参考资料

- [router-link API](https://router.vuejs.org/api/#router-link)
- [自定义 router-link](https://router.vuejs.org/guide/advanced/extending-router-link.html)

---

**下一节** → [第 08 节：router-view 详解](./08-router-view.md)
