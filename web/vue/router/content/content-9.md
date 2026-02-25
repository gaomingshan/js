# 第 9 章：声明式导航

## 概述

声明式导航通过 `<router-link>` 组件实现，是 Vue Router 中最常用的导航方式。它不仅提供了基础的链接功能，还具有激活状态、预加载、阻止默认行为等高级特性。

## RouterLink 组件详解

### 基础用法

```vue
<template>
  <nav>
    <!-- 字符串路径 -->
    <router-link to="/">首页</router-link>
    
    <!-- 对象形式 -->
    <router-link :to="{ path: '/about' }">关于</router-link>
    
    <!-- 命名路由 -->
    <router-link :to="{ name: 'User', params: { id: 123 } }">
      用户详情
    </router-link>
    
    <!-- 带查询参数 -->
    <router-link :to="{ path: '/search', query: { q: 'vue' } }">
      搜索
    </router-link>
  </nav>
</template>
```

### 渲染结果

```html
<!-- 默认渲染为 <a> 标签 -->
<a href="/" class="router-link-active router-link-exact-active">首页</a>
<a href="/about">关于</a>
<a href="/user/123">用户详情</a>
<a href="/search?q=vue">搜索</a>
```

## to 属性的多种形式

### 1. 字符串路径

```vue
<router-link to="/user/123">用户</router-link>
```

### 2. 对象 - 路径

```vue
<router-link :to="{ path: '/user/123' }">用户</router-link>
```

### 3. 对象 - 命名路由（推荐）

```vue
<router-link :to="{ name: 'User', params: { id: 123 } }">
  用户
</router-link>
```

### 4. 对象 - 完整配置

```vue
<router-link :to="{
  name: 'User',
  params: { id: 123 },
  query: { tab: 'posts' },
  hash: '#comments'
}">
  用户帖子
</router-link>
<!-- 结果：/user/123?tab=posts#comments -->
```

### 5. 动态绑定

```vue
<template>
  <div>
    <router-link 
      v-for="user in users" 
      :key="user.id"
      :to="{ name: 'User', params: { id: user.id } }"
    >
      {{ user.name }}
    </router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
    }
  }
}
</script>
```

### 6. 计算属性

```vue
<template>
  <router-link :to="userLink">查看用户</router-link>
</template>

<script>
export default {
  props: ['userId'],
  computed: {
    userLink() {
      return {
        name: 'User',
        params: { id: this.userId },
        query: { from: this.$route.path }
      }
    }
  }
}
</script>
```

## active-class 与 exact-active-class

### 默认激活类名

```vue
<router-link to="/user">用户</router-link>
```

**当前路由 `/user/123` 时：**
```html
<!-- 包含匹配：添加 router-link-active -->
<a href="/user" class="router-link-active">用户</a>
```

**当前路由 `/user` 时：**
```html
<!-- 精确匹配：添加 router-link-exact-active -->
<a href="/user" class="router-link-active router-link-exact-active">用户</a>
```

### 自定义激活类名

```vue
<router-link 
  to="/user"
  active-class="is-active"
  exact-active-class="is-exact-active"
>
  用户
</router-link>
```

**CSS 样式：**

```css
.router-link-active {
  color: #42b983;
}

.router-link-exact-active {
  font-weight: bold;
  background: #f0f0f0;
}
```

### 全局配置

```javascript
const router = createRouter({
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  routes: [...]
})
```

### 实际应用：导航菜单

```vue
<template>
  <nav class="main-nav">
    <router-link 
      to="/" 
      exact-active-class="active"
    >
      首页
    </router-link>
    
    <router-link 
      to="/products"
      active-class="active"
    >
      产品
    </router-link>
    
    <router-link 
      to="/about"
      active-class="active"
    >
      关于
    </router-link>
  </nav>
</template>

<style scoped>
.main-nav a {
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.main-nav a.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.main-nav a:hover {
  background: #f5f5f5;
}
</style>
```

## 自定义导航组件

### 使用插槽

```vue
<template>
  <router-link to="/user" custom v-slot="{ navigate, isActive }">
    <button 
      @click="navigate"
      :class="{ active: isActive }"
    >
      <icon name="user" />
      <span>用户中心</span>
    </button>
  </router-link>
</template>

<style>
button.active {
  background: #1890ff;
  color: white;
}
</style>
```

### v-slot 提供的属性

```vue
<router-link to="/user" custom v-slot="navProps">
  {{ navProps }}
</router-link>
```

**navProps 包含：**

```javascript
{
  href: '/user',              // 解析后的 URL
  route: {...},               // 路由对象
  navigate: Function,         // 导航函数
  isActive: Boolean,          // 是否激活（包含匹配）
  isExactActive: Boolean      // 是否精确激活
}
```

### 自定义按钮导航

```vue
<template>
  <router-link 
    :to="{ name: 'User', params: { id } }"
    custom
    v-slot="{ navigate, isActive }"
  >
    <button 
      @click="handleClick(navigate)"
      :class="['nav-button', { active: isActive }]"
    >
      <span class="icon">👤</span>
      <span class="text">{{ username }}</span>
      <span v-if="hasNotification" class="badge">3</span>
    </button>
  </router-link>
</template>

<script>
export default {
  props: ['id', 'username', 'hasNotification'],
  methods: {
    handleClick(navigate) {
      // 导航前的逻辑
      if (this.needConfirm) {
        if (confirm('确定要离开当前页面吗？')) {
          navigate()
        }
      } else {
        navigate()
      }
    }
  }
}
</script>
```

### 自定义列表项

```vue
<template>
  <ul class="user-list">
    <li v-for="user in users" :key="user.id">
      <router-link 
        :to="{ name: 'User', params: { id: user.id } }"
        custom
        v-slot="{ href, navigate, isExactActive }"
      >
        <a 
          :href="href"
          @click="navigate"
          :class="{ selected: isExactActive }"
        >
          <img :src="user.avatar" />
          <div class="info">
            <h4>{{ user.name }}</h4>
            <p>{{ user.bio }}</p>
          </div>
          <span v-if="isExactActive" class="check">✓</span>
        </a>
      </router-link>
    </li>
  </ul>
</template>

<style scoped>
.user-list a {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e8e8e8;
  margin-bottom: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
}

.user-list a:hover {
  background: #f5f5f5;
}

.user-list a.selected {
  background: #e6f7ff;
  border-color: #1890ff;
}

.check {
  margin-left: auto;
  color: #1890ff;
  font-size: 20px;
}
</style>
```

## RouterLink 的插槽用法

### 默认插槽

```vue
<router-link to="/user">
  <!-- 默认插槽内容 -->
  <span class="icon">👤</span>
  <span>用户中心</span>
</router-link>
```

### 作用域插槽

```vue
<router-link to="/user" v-slot="{ href, navigate, isActive }">
  <a 
    :href="href" 
    @click="navigate"
    :class="{ active: isActive }"
  >
    自定义内容
  </a>
</router-link>
```

### 复杂示例：带图标和徽章的导航

```vue
<template>
  <nav class="tab-nav">
    <router-link 
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.path"
      v-slot="{ isExactActive }"
    >
      <div :class="['tab-item', { active: isExactActive }]">
        <component :is="tab.icon" class="icon" />
        <span class="label">{{ tab.label }}</span>
        <span v-if="tab.count" class="badge">{{ tab.count }}</span>
      </div>
    </router-link>
  </nav>
</template>

<script>
import HomeIcon from '@/icons/HomeIcon.vue'
import MessageIcon from '@/icons/MessageIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'

export default {
  data() {
    return {
      tabs: [
        { name: 'home', path: '/', label: '首页', icon: HomeIcon },
        { name: 'messages', path: '/messages', label: '消息', icon: MessageIcon, count: 5 },
        { name: 'profile', path: '/profile', label: '我的', icon: UserIcon }
      ]
    }
  }
}
</script>

<style scoped>
.tab-nav {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
}

.tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.tab-item.active {
  color: #1890ff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #1890ff;
}

.icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 1;
}
</style>
```

## 关键点总结

1. **RouterLink 组件**：声明式导航，默认渲染为 `<a>` 标签
2. **to 属性**：支持字符串、对象、动态绑定等多种形式
3. **激活类名**：`router-link-active`（包含匹配）、`router-link-exact-active`（精确匹配）
4. **custom 模式**：完全自定义渲染，获得导航控制权
5. **插槽用法**：通过作用域插槽实现复杂的自定义导航

## 深入一点：RouterLink vs 原生 a 标签

```vue
<!-- RouterLink -->
<router-link to="/user">用户</router-link>

<!-- 原生 a 标签 -->
<a href="/user" @click.prevent="$router.push('/user')">用户</a>
```

**RouterLink 的优势：**

1. **自动激活状态**：无需手动判断和添加类名
2. **阻止默认行为**：自动阻止页面刷新
3. **History 模式兼容**：自动处理 `pushState`
4. **右键菜单支持**：支持"在新标签页中打开"等原生功能
5. **无障碍支持**：自动添加 `aria` 属性

**何时使用原生 a 标签：**

```vue
<!-- 外部链接 -->
<a href="https://example.com" target="_blank">外部链接</a>

<!-- 下载链接 -->
<a href="/files/document.pdf" download>下载文件</a>

<!-- 锚点链接（同页面） -->
<a href="#section-2">跳转到第二部分</a>
```

## 参考资料

- [Vue Router - RouterLink](https://router.vuejs.org/zh/api/#router-link)
- [Vue Router - RouterLink Props](https://router.vuejs.org/zh/api/#router-link-props)
- [Vue Router - RouterLink 插槽](https://router.vuejs.org/zh/api/#router-link-slots)
