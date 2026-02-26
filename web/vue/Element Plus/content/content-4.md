# 链接与文字组件

## 概述

Link 链接组件用于页面跳转和外部链接，Text 文字组件用于文本展示和排版。这两个组件虽然简单，但在实际项目中使用频率很高。

---

## Link 链接组件

### 核心属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 链接类型 | string | primary/success/warning/danger/info/default | default |
| underline | 是否下划线 | boolean | - | true |
| disabled | 是否禁用 | boolean | - | false |
| href | 原生 href 属性 | string | - | - |
| icon | 图标组件 | Component | - | - |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击事件 | (event: MouseEvent) |

---

## Text 文字组件

### 核心属性

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 文本类型 | string | primary/success/warning/danger/info | - |
| size | 文本大小 | string | large/default/small | default |
| tag | 自定义元素标签 | string | - | span |
| truncated | 是否显示省略号 | boolean | - | false |

---

## 完整样例一：文章详情页导航

### 效果描述
实现文章详情页的面包屑导航、相关链接、标签展示等功能。

### 完整代码

```vue
<template>
  <div class="article-detail">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <el-link type="primary" :underline="false" @click="goHome">
        首页
      </el-link>
      <span class="separator">/</span>
      <el-link type="primary" :underline="false" @click="goCategory">
        技术文章
      </el-link>
      <span class="separator">/</span>
      <el-text type="info">当前文章</el-text>
    </div>

    <!-- 文章标题 -->
    <h1 class="article-title">
      <el-text size="large" tag="div">Element Plus 组件库使用指南</el-text>
    </h1>

    <!-- 文章元信息 -->
    <div class="article-meta">
      <el-text type="info" size="small">
        作者：张三
      </el-text>
      <span class="separator">•</span>
      <el-text type="info" size="small">
        发布时间：2024-01-01
      </el-text>
      <span class="separator">•</span>
      <el-text type="info" size="small">
        阅读：1234
      </el-text>
    </div>

    <!-- 文章标签 -->
    <div class="article-tags">
      <el-text type="primary" size="small">#Vue3</el-text>
      <el-text type="success" size="small">#ElementPlus</el-text>
      <el-text type="warning" size="small">#前端</el-text>
    </div>

    <!-- 文章内容 -->
    <div class="article-content">
      <el-text tag="p">
        这是文章的正文内容，可以包含多个段落。Element Plus 提供了丰富的组件库，
        帮助开发者快速构建企业级应用。
      </el-text>
      <el-text tag="p">
        本文将详细介绍如何使用 Element Plus 组件库...
      </el-text>
    </div>

    <!-- 相关链接 -->
    <div class="related-links">
      <h3>相关文章</h3>
      <div class="link-list">
        <el-link 
          v-for="link in relatedArticles" 
          :key="link.id"
          type="primary"
          :href="link.url"
          target="_blank"
          :icon="Document"
        >
          {{ link.title }}
        </el-link>
      </div>
    </div>

    <!-- 外部链接 -->
    <div class="external-links">
      <h3>参考资料</h3>
      <div class="link-list">
        <el-link 
          href="https://element-plus.org/" 
          target="_blank"
          :icon="Link"
        >
          Element Plus 官方文档
        </el-link>
        <el-link 
          href="https://cn.vuejs.org/" 
          target="_blank"
          :icon="Link"
        >
          Vue 3 官方文档
        </el-link>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="article-actions">
      <el-link type="primary" :underline="false" @click="handleLike">
        <el-icon><Star /></el-icon>
        收藏 ({{ likeCount }})
      </el-link>
      <el-link type="success" :underline="false" @click="handleShare">
        <el-icon><Share /></el-icon>
        分享
      </el-link>
      <el-link type="warning" :underline="false" @click="handleComment">
        <el-icon><ChatDotRound /></el-icon>
        评论 ({{ commentCount }})
      </el-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Document, Link, Star, Share, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Article {
  id: number
  title: string
  url: string
}

const relatedArticles = ref<Article[]>([
  { id: 1, title: 'Vue 3 Composition API 详解', url: '#' },
  { id: 2, title: '前端工程化实践', url: '#' },
  { id: 3, title: 'TypeScript 最佳实践', url: '#' },
])

const likeCount = ref(123)
const commentCount = ref(45)

const goHome = () => {
  ElMessage.success('返回首页')
}

const goCategory = () => {
  ElMessage.success('返回分类')
}

const handleLike = () => {
  likeCount.value++
  ElMessage.success('收藏成功')
}

const handleShare = () => {
  ElMessage.success('分享成功')
}

const handleComment = () => {
  ElMessage.success('跳转到评论区')
}
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.separator {
  color: #dcdfe6;
}

.article-title {
  margin: 20px 0;
  font-size: 32px;
  color: #303133;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.article-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.article-content {
  line-height: 1.8;
  margin-bottom: 40px;
}

.article-content p {
  margin-bottom: 15px;
}

.related-links,
.external-links {
  margin-bottom: 30px;
}

.related-links h3,
.external-links h3 {
  margin-bottom: 15px;
  color: #303133;
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-actions {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
}

.article-actions .el-link {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
```

---

## 完整样例二：路由集成最佳实践

### 效果描述
展示如何将 Link 组件与 Vue Router 集成，实现 SPA 页面跳转。

### 完整代码

```vue
<template>
  <div class="router-link-demo">
    <el-card>
      <template #header>
        <span>使用 Link 组件进行路由跳转</span>
      </template>

      <!-- 方式一：使用 @click 事件 -->
      <div class="section">
        <h4>方式一：使用 @click 事件</h4>
        <el-link type="primary" @click="router.push('/home')">
          返回首页
        </el-link>
        <el-link type="success" @click="router.push('/user/123')">
          查看用户详情
        </el-link>
      </div>

      <!-- 方式二：封装路由 Link 组件 -->
      <div class="section">
        <h4>方式二：封装 RouterLink 组件</h4>
        <router-link-wrapper to="/home" type="primary">
          首页
        </router-link-wrapper>
        <router-link-wrapper to="/about" type="success">
          关于我们
        </router-link-wrapper>
      </div>

      <!-- 方式三：动态路由 -->
      <div class="section">
        <h4>方式三：动态路由跳转</h4>
        <el-link 
          v-for="item in menuItems" 
          :key="item.path"
          type="primary"
          @click="handleNavigate(item.path)"
        >
          {{ item.name }}
        </el-link>
      </div>

      <!-- 方式四：外部链接 -->
      <div class="section">
        <h4>方式四：外部链接（新窗口打开）</h4>
        <el-link 
          href="https://element-plus.org/" 
          target="_blank"
          type="primary"
          :icon="Link"
        >
          Element Plus 官网
        </el-link>
      </div>

      <!-- 禁用状态 -->
      <div class="section">
        <h4>禁用状态</h4>
        <el-link disabled>禁用的链接</el-link>
        <el-link type="primary" disabled>禁用的主要链接</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Link } from '@element-plus/icons-vue'

const router = useRouter()

interface MenuItem {
  name: string
  path: string
}

const menuItems = ref<MenuItem[]>([
  { name: '首页', path: '/home' },
  { name: '用户管理', path: '/users' },
  { name: '设置', path: '/settings' },
])

const handleNavigate = (path: string) => {
  router.push(path)
}
</script>

<script lang="ts">
// 封装的 RouterLink 组件
import { defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElLink } from 'element-plus'

export const RouterLinkWrapper = defineComponent({
  name: 'RouterLinkWrapper',
  props: {
    to: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'default',
    },
  },
  setup(props, { slots }) {
    const router = useRouter()
    
    const handleClick = () => {
      router.push(props.to)
    }
    
    return () => h(ElLink, {
      type: props.type,
      onClick: handleClick,
    }, slots)
  },
})
</script>

<style scoped>
.router-link-demo {
  padding: 20px;
}

.section {
  margin-bottom: 25px;
}

.section h4 {
  margin-bottom: 10px;
  color: #606266;
  font-weight: normal;
}

.el-link {
  margin-right: 15px;
}
</style>
```

---

## 完整样例三：文本展示与截断

### 效果描述
展示 Text 组件的各种使用场景，包括文本类型、大小、截断等。

### 完整代码

```vue
<template>
  <div class="text-demo">
    <el-card class="demo-card">
      <template #header>
        <span>文本类型</span>
      </template>
      <div class="text-row">
        <el-text>默认文本</el-text>
        <el-text type="primary">主要文本</el-text>
        <el-text type="success">成功文本</el-text>
        <el-text type="info">信息文本</el-text>
        <el-text type="warning">警告文本</el-text>
        <el-text type="danger">危险文本</el-text>
      </div>
    </el-card>

    <el-card class="demo-card">
      <template #header>
        <span>文本大小</span>
      </template>
      <div class="text-row">
        <el-text size="large">大号文本</el-text>
        <el-text size="default">默认文本</el-text>
        <el-text size="small">小号文本</el-text>
      </div>
    </el-card>

    <el-card class="demo-card">
      <template #header>
        <span>文本截断</span>
      </template>
      <div class="truncate-demo">
        <el-text truncated style="max-width: 200px;">
          这是一段很长的文本内容，超出部分会显示省略号，鼠标悬停可以查看完整内容
        </el-text>
      </div>
    </el-card>

    <el-card class="demo-card">
      <template #header>
        <span>自定义标签</span>
      </template>
      <div class="tag-demo">
        <el-text tag="h3" type="primary">这是 h3 标题</el-text>
        <el-text tag="p">这是段落文本</el-text>
        <el-text tag="span" type="warning">这是 span 文本</el-text>
      </div>
    </el-card>

    <el-card class="demo-card">
      <template #header>
        <span>实际应用：商品信息展示</span>
      </template>
      <div class="product-info">
        <el-text size="large" tag="h2">iPhone 15 Pro Max</el-text>
        <el-text type="danger" size="large" tag="div" class="price">
          ¥9999
        </el-text>
        <el-text type="info" tag="p" class="desc" truncated>
          全新设计，钛金属边框，A17 Pro 芯片，4800 万像素主摄，支持 5G
        </el-text>
        <div class="specs">
          <el-text type="info" size="small">库存：999</el-text>
          <el-text type="success" size="small">已售：1234</el-text>
        </div>
      </div>
    </el-card>

    <el-card class="demo-card">
      <template #header>
        <span>实际应用：评论列表</span>
      </template>
      <div class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <el-text type="primary">{{ comment.author }}</el-text>
            <el-text type="info" size="small">{{ comment.time }}</el-text>
          </div>
          <el-text tag="p" class="comment-content">
            {{ comment.content }}
          </el-text>
          <div class="comment-actions">
            <el-link type="info" :underline="false" size="small">
              回复
            </el-link>
            <el-link type="info" :underline="false" size="small">
              点赞 ({{ comment.likes }})
            </el-link>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Comment {
  id: number
  author: string
  time: string
  content: string
  likes: number
}

const comments = ref<Comment[]>([
  {
    id: 1,
    author: '张三',
    time: '2024-01-01 12:00',
    content: '这篇文章写得非常好，对我帮助很大！',
    likes: 12,
  },
  {
    id: 2,
    author: '李四',
    time: '2024-01-01 13:00',
    content: '感谢分享，期待更多优质内容。',
    likes: 8,
  },
])
</script>

<style scoped>
.text-demo {
  padding: 20px;
}

.demo-card {
  margin-bottom: 20px;
}

.text-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.truncate-demo {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.tag-demo {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-info {
  padding: 10px;
}

.product-info .price {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.product-info .desc {
  margin: 15px 0;
  max-width: 400px;
}

.specs {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.comment-content {
  margin: 10px 0;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}
</style>
```

---

## 常见踩坑

### 1. Link 点击后页面刷新

**问题**：使用 `href` 属性导致页面刷新

**解决方案**：
```vue
<!-- ❌ 错误：会导致页面刷新 -->
<el-link href="/home">首页</el-link>

<!-- ✅ 正确：使用 @click 事件 -->
<el-link @click="router.push('/home')">首页</el-link>

<!-- ✅ 或使用 vue-router 的 router-link -->
<router-link to="/home" custom v-slot="{ navigate }">
  <el-link @click="navigate">首页</el-link>
</router-link>
```

### 2. Text 组件截断不生效

**问题**：设置了 `truncated` 但文本仍然换行

**原因**：未设置容器宽度

**解决方案**：
```vue
<!-- ❌ 错误：未设置宽度 -->
<el-text truncated>很长的文本...</el-text>

<!-- ✅ 正确：设置最大宽度 -->
<el-text truncated style="max-width: 200px;">
  很长的文本...
</el-text>
```

### 3. Link 下划线显示问题

**问题**：Link 默认有下划线，影响美观

**解决方案**：
```vue
<!-- 全局去除下划线 -->
<el-link :underline="false">链接文本</el-link>

<!-- 或通过 CSS -->
<style>
.el-link {
  text-decoration: none !important;
}
</style>
```

---

## 最佳实践

### 1. 链接语义化

```vue
<!-- ✅ 推荐：根据用途选择类型 -->
<el-link type="primary">主要操作</el-link>
<el-link type="danger">删除操作</el-link>
<el-link type="info">查看详情</el-link>

<!-- 外部链接使用图标标识 -->
<el-link href="https://..." target="_blank" :icon="Link">
  外部链接
</el-link>
```

### 2. 路由跳转封装

```ts
// composables/useNavigation.ts
import { useRouter } from 'vue-router'

export const useNavigation = () => {
  const router = useRouter()
  
  const navigateTo = (path: string) => {
    router.push(path)
  }
  
  const navigateToExternal = (url: string) => {
    window.open(url, '_blank')
  }
  
  return {
    navigateTo,
    navigateToExternal,
  }
}
```

### 3. 文本展示规范

```vue
<!-- 标题使用 Text 组件 -->
<el-text tag="h1" size="large" type="primary">
  页面标题
</el-text>

<!-- 描述性文本 -->
<el-text type="info" size="small">
  这是描述文本
</el-text>

<!-- 长文本截断 -->
<el-text truncated style="max-width: 300px;" :title="fullText">
  {{ fullText }}
</el-text>
```

### 4. 无障碍支持

```vue
<!-- 为链接添加 aria-label -->
<el-link 
  :icon="Delete" 
  type="danger"
  aria-label="删除用户"
  @click="handleDelete"
>
  删除
</el-link>
```

---

## 参考资料

- [Element Plus Link 链接](https://element-plus.org/zh-CN/component/link.html)
- [Element Plus Text 文字](https://element-plus.org/zh-CN/component/text.html)
- [Vue Router 官方文档](https://router.vuejs.org/)

---

## 下一步

继续学习布局相关组件：[布局与空间组件](./content-5.md)
