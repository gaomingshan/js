# 菜单与标签页

## 概述

`el-menu`（菜单）和 `el-tabs`（标签页）是导航组件的核心，用于构建多级菜单导航和标签页切换。菜单常用于侧边栏或顶部导航栏，标签页用于多视图切换。

## 核心属性与事件

### Menu 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `mode` | 菜单模式 | `'horizontal' / 'vertical'` | `'vertical'` |
| `default-active` | 当前激活菜单的 index | `string` | - |
| `default-openeds` | 默认打开的子菜单 index 数组 | `Array` | `[]` |
| `unique-opened` | 是否只保持一个子菜单展开 | `boolean` | `false` |
| `router` | 是否启用路由模式 | `boolean` | `false` |
| `collapse` | 是否水平折叠收起菜单 | `boolean` | `false` |

### Tabs 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `v-model` | 绑定值，选中选项卡的 name | `string / number` | - |
| `type` | 风格类型 | `'card' / 'border-card'` | - |
| `closable` | 标签是否可关闭 | `boolean` | `false` |
| `addable` | 标签是否可增加 | `boolean` | `false` |
| `editable` | 标签是否同时可增加和关闭 | `boolean` | `false` |
| `tab-position` | 选项卡所在位置 | `'top' / 'right' / 'bottom' / 'left'` | `'top'` |

## 完整实战样例

### 示例 1：侧边栏菜单 - 后台管理系统

经典的后台管理系统侧边栏菜单。

```vue
<template>
  <div class="menu-demo">
    <el-container style="height: 600px">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" style="background-color: #304156; transition: width 0.3s">
        <div class="sidebar-header">
          <h3 v-show="!isCollapse">管理系统</h3>
          <el-button
            type="primary"
            :icon="isCollapse ? Expand : Fold"
            size="small"
            style="margin-top: 12px"
            @click="toggleCollapse"
          />
        </div>

        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          router
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/user">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/system/role">
              <el-icon><User /></el-icon>
              <template #title>角色管理</template>
            </el-menu-item>
            <el-menu-item index="/system/menu">
              <el-icon><Menu /></el-icon>
              <template #title>菜单管理</template>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="content">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/content/article">文章列表</el-menu-item>
            <el-menu-item index="/content/category">分类管理</el-menu-item>
            <el-menu-item index="/content/tag">标签管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="data">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>数据统计</span>
            </template>
            <el-menu-item index="/data/visit">访问统计</el-menu-item>
            <el-menu-item index="/data/user">用户统计</el-menu-item>
            <el-menu-item index="/data/sales">销售统计</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/settings">
            <el-icon><Tools /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header style="background-color: #fff; box-shadow: 0 1px 4px rgba(0,21,41,.08)">
          <div class="header-content">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentBreadcrumb }}</el-breadcrumb-item>
            </el-breadcrumb>

            <el-space>
              <el-badge :value="5">
                <el-icon :size="20"><Bell /></el-icon>
              </el-badge>
              <el-dropdown>
                <el-avatar :size="32">Admin</el-avatar>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人中心</el-dropdown-item>
                    <el-dropdown-item>修改密码</el-dropdown-item>
                    <el-dropdown-item divided>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </div>
        </el-header>

        <el-main>
          <el-card>
            <h2>{{ currentPage }}</h2>
            <p>当前选中的菜单：{{ activeMenu }}</p>
            <p>折叠状态：{{ isCollapse ? '已折叠' : '展开' }}</p>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  Setting,
  User,
  Menu,
  Document,
  DataAnalysis,
  Tools,
  Bell,
  Expand,
  Fold
} from '@element-plus/icons-vue'

const activeMenu = ref('/dashboard')
const isCollapse = ref(false)

const currentPage = computed(() => {
  const menuMap: Record<string, string> = {
    '/dashboard': '首页',
    '/system/user': '用户管理',
    '/system/role': '角色管理',
    '/system/menu': '菜单管理',
    '/content/article': '文章列表',
    '/content/category': '分类管理',
    '/content/tag': '标签管理',
    '/data/visit': '访问统计',
    '/data/user': '用户统计',
    '/data/sales': '销售统计',
    '/settings': '系统设置'
  }
  return menuMap[activeMenu.value] || '首页'
})

const currentBreadcrumb = computed(() => currentPage.value)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  ElMessage.info(`切换到：${currentPage.value}`)
}
</script>

<style scoped>
.menu-demo {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.sidebar-header {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1f2d3d;
}

.sidebar-header h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}

.header-content {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu--collapse) {
  width: 64px;
}
</style>
```

**运行效果：**
- 经典的后台管理系统布局
- 侧边栏支持折叠/展开
- 多级菜单导航
- 只保持一个子菜单展开
- 集成面包屑和头部导航

---

### 示例 2：标签页 - 多视图切换

各种类型的标签页展示。

```vue
<template>
  <div class="tabs-demo">
    <el-card>
      <template #header>
        <span>Tabs 标签页示例</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 基础标签页 -->
        <el-card shadow="never">
          <template #header>
            <span>基础标签页</span>
          </template>

          <el-tabs v-model="activeTab1">
            <el-tab-pane label="用户管理" name="user">
              <div class="tab-content">
                <h4>用户管理</h4>
                <p>这是用户管理的内容</p>
              </div>
            </el-tab-pane>
            <el-tab-pane label="配置管理" name="config">
              <div class="tab-content">
                <h4>配置管理</h4>
                <p>这是配置管理的内容</p>
              </div>
            </el-tab-pane>
            <el-tab-pane label="角色管理" name="role">
              <div class="tab-content">
                <h4>角色管理</h4>
                <p>这是角色管理的内容</p>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 卡片式标签页 -->
        <el-card shadow="never">
          <template #header>
            <span>卡片式标签页</span>
          </template>

          <el-tabs v-model="activeTab2" type="card">
            <el-tab-pane label="全部订单" name="all">
              <el-table :data="allOrders" border>
                <el-table-column prop="orderNo" label="订单号" />
                <el-table-column prop="amount" label="金额" />
                <el-table-column prop="status" label="状态" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="待付款" name="pending">
              <el-empty description="暂无待付款订单" />
            </el-tab-pane>
            <el-tab-pane label="已完成" name="completed">
              <el-empty description="暂无已完成订单" />
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 可关闭标签页 -->
        <el-card shadow="never">
          <template #header>
            <span>可增加/关闭标签页</span>
          </template>

          <el-tabs
            v-model="editableTabsValue"
            type="card"
            editable
            @edit="handleTabsEdit"
            @tab-click="handleTabClick"
          >
            <el-tab-pane
              v-for="item in editableTabs"
              :key="item.name"
              :label="item.title"
              :name="item.name"
            >
              <div class="tab-content">
                {{ item.content }}
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 自定义标签页 -->
        <el-card shadow="never">
          <template #header>
            <span>自定义标签页</span>
          </template>

          <el-tabs v-model="activeTab3" type="border-card">
            <el-tab-pane name="stats">
              <template #label>
                <span style="display: flex; align-items: center; gap: 4px">
                  <el-icon><DataAnalysis /></el-icon>
                  数据统计
                  <el-badge :value="12" />
                </span>
              </template>
              <div class="tab-content">
                <el-row :gutter="20">
                  <el-col :span="6" v-for="i in 4" :key="i">
                    <el-statistic
                      :title="`指标 ${i}`"
                      :value="Math.floor(Math.random() * 10000)"
                    />
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>

            <el-tab-pane name="messages">
              <template #label>
                <span style="display: flex; align-items: center; gap: 4px">
                  <el-icon><Message /></el-icon>
                  消息中心
                  <el-badge :value="5" type="danger" />
                </span>
              </template>
              <div class="tab-content">
                <el-timeline>
                  <el-timeline-item
                    v-for="(item, index) in messages"
                    :key="index"
                    :timestamp="item.time"
                  >
                    {{ item.content }}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>

            <el-tab-pane name="tasks">
              <template #label>
                <span style="display: flex; align-items: center; gap: 4px">
                  <el-icon><List /></el-icon>
                  待办任务
                  <el-tag size="small" type="warning">3</el-tag>
                </span>
              </template>
              <div class="tab-content">
                <el-checkbox-group v-model="checkedTasks">
                  <div v-for="task in tasks" :key="task.id" style="margin-bottom: 12px">
                    <el-checkbox :label="task.id">{{ task.title }}</el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 位置设置 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>不同位置的标签页</span>
              <el-radio-group v-model="tabPosition" size="small">
                <el-radio-button label="top">上</el-radio-button>
                <el-radio-button label="right">右</el-radio-button>
                <el-radio-button label="bottom">下</el-radio-button>
                <el-radio-button label="left">左</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-tabs v-model="activeTab4" :tab-position="tabPosition as any">
            <el-tab-pane label="Tab 1" name="1">Tab 1 content</el-tab-pane>
            <el-tab-pane label="Tab 2" name="2">Tab 2 content</el-tab-pane>
            <el-tab-pane label="Tab 3" name="3">Tab 3 content</el-tab-pane>
          </el-tabs>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { DataAnalysis, Message, List } from '@element-plus/icons-vue'

// 基础标签页
const activeTab1 = ref('user')

// 卡片式标签页
const activeTab2 = ref('all')
const allOrders = ref([
  { orderNo: 'ORD001', amount: 299, status: '已完成' },
  { orderNo: 'ORD002', amount: 599, status: '待发货' }
])

// 可编辑标签页
const editableTabsValue = ref('1')
let tabIndex = 3
const editableTabs = ref([
  { title: 'Tab 1', name: '1', content: 'Tab 1 content' },
  { title: 'Tab 2', name: '2', content: 'Tab 2 content' }
])

const handleTabsEdit = (targetName: string | number, action: 'add' | 'remove') => {
  if (action === 'add') {
    const newTabName = `${++tabIndex}`
    editableTabs.value.push({
      title: `New Tab ${tabIndex}`,
      name: newTabName,
      content: `New Tab ${tabIndex} content`
    })
    editableTabsValue.value = newTabName
  } else if (action === 'remove') {
    const tabs = editableTabs.value
    let activeName = editableTabsValue.value
    
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            activeName = nextTab.name
          }
        }
      })
    }
    
    editableTabsValue.value = activeName
    editableTabs.value = tabs.filter(tab => tab.name !== targetName)
  }
}

const handleTabClick = (tab: any) => {
  console.log('Tab clicked:', tab)
}

// 自定义标签页
const activeTab3 = ref('stats')
const messages = ref([
  { time: '2024-01-20 10:30', content: '用户张三提交了新订单' },
  { time: '2024-01-20 11:15', content: '系统更新完成' },
  { time: '2024-01-20 14:20', content: '收到新的客户反馈' }
])

const tasks = ref([
  { id: 1, title: '完成项目文档' },
  { id: 2, title: '审核用户申请' },
  { id: 3, title: '更新系统配置' }
])
const checkedTasks = ref<number[]>([])

// 位置设置
const activeTab4 = ref('1')
const tabPosition = ref('top')
</script>

<style scoped>
.tabs-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.tab-content {
  padding: 20px;
  min-height: 200px;
}

.tab-content h4 {
  margin: 0 0 12px 0;
}
</style>
```

**运行效果：**
- 基础标签页切换
- 卡片式标签页显示订单列表
- 可动态增加和关闭标签页
- 自定义标签页内容，带徽章提示
- 支持上下左右四个位置

---

### 示例 3：顶部导航菜单

水平菜单用于顶部导航。

```vue
<template>
  <div class="horizontal-menu-demo">
    <div class="navbar">
      <div class="navbar-left">
        <h2 class="logo">My Website</h2>
      </div>

      <el-menu
        mode="horizontal"
        :default-active="activeIndex"
        @select="handleSelect"
        class="navbar-menu"
      >
        <el-menu-item index="home">
          <el-icon><HomeFilled /></el-icon>
          首页
        </el-menu-item>

        <el-sub-menu index="products">
          <template #title>
            <el-icon><Box /></el-icon>
            产品中心
          </template>
          <el-menu-item index="product-1">产品 A</el-menu-item>
          <el-menu-item index="product-2">产品 B</el-menu-item>
          <el-menu-item index="product-3">产品 C</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="solutions">
          <template #title>
            <el-icon><Management /></el-icon>
            解决方案
          </template>
          <el-menu-item-group title="行业方案">
            <el-menu-item index="solution-1">电商行业</el-menu-item>
            <el-menu-item index="solution-2">教育行业</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="技术方案">
            <el-menu-item index="solution-3">云计算</el-menu-item>
            <el-menu-item index="solution-4">大数据</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-menu-item index="about">
          <el-icon><InfoFilled /></el-icon>
          关于我们
        </el-menu-item>

        <el-menu-item index="contact">
          <el-icon><Phone /></el-icon>
          联系我们
        </el-menu-item>
      </el-menu>

      <div class="navbar-right">
        <el-button type="primary" size="small">登录</el-button>
      </div>
    </div>

    <div class="content">
      <el-card>
        <h3>当前页面：{{ pageName }}</h3>
        <p>这是 {{ pageName }} 的内容区域</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { HomeFilled, Box, Management, InfoFilled, Phone } from '@element-plus/icons-vue'

const activeIndex = ref('home')

const pageMap: Record<string, string> = {
  home: '首页',
  'product-1': '产品 A',
  'product-2': '产品 B',
  'product-3': '产品 C',
  'solution-1': '电商行业解决方案',
  'solution-2': '教育行业解决方案',
  'solution-3': '云计算方案',
  'solution-4': '大数据方案',
  about: '关于我们',
  contact: '联系我们'
}

const pageName = computed(() => pageMap[activeIndex.value] || '首页')

const handleSelect = (index: string) => {
  activeIndex.value = index
  ElMessage.info(`切换到：${pageName.value}`)
}
</script>

<style scoped>
.horizontal-menu-demo {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.navbar {
  display: flex;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.navbar-left {
  padding: 0 20px;
}

.logo {
  margin: 0;
  font-size: 24px;
  color: #409eff;
}

.navbar-menu {
  flex: 1;
  border-bottom: none;
}

.navbar-right {
  padding: 0 20px;
}

.content {
  padding: 20px;
}
</style>
```

**运行效果：**
- 水平导航菜单
- 多级下拉菜单
- 菜单项分组
- 集成Logo和登录按钮
- 响应式切换内容

---

## 常见踩坑

### 1. 菜单路由模式不跳转

**问题：** 设置 `router="true"` 后点击菜单无反应。

**解决：** 确保 `index` 值为有效路由路径，且已配置路由。

```vue
<el-menu router>
  <!-- ✅ 正确 -->
  <el-menu-item index="/dashboard">首页</el-menu-item>
  
  <!-- ❌ 错误 -->
  <el-menu-item index="dashboard">首页</el-menu-item>
</el-menu>
```

---

### 2. Tabs 切换内容不销毁

**问题：** 切换标签页后，之前的组件状态仍保留。

**解决：** 使用 `v-if` 或 `:key` 强制重新渲染。

```vue
<el-tab-pane name="tab1">
  <component :is="Tab1Component" :key="activeTab" />
</el-tab-pane>
```

---

### 3. 菜单折叠后子菜单无法打开

**问题：** 菜单折叠后，子菜单项无法正常显示。

**解决：** 折叠时子菜单会以 Popover 形式展示，确保没有 CSS 遮挡。

---

### 4. 标签页内容高度不一致

**问题：** 不同标签页内容高度不同，导致布局抖动。

**解决：** 给标签页内容容器设置固定高度。

```vue
<el-tab-pane>
  <div style="min-height: 400px">
    {{ content }}
  </div>
</el-tab-pane>
```

---

## 最佳实践

### 1. 菜单数据驱动

```ts
interface MenuItem {
  index: string
  title: string
  icon?: any
  children?: MenuItem[]
}

const menuData: MenuItem[] = [
  {
    index: '/dashboard',
    title: '首页',
    icon: HomeFilled
  },
  {
    index: 'system',
    title: '系统管理',
    icon: Setting,
    children: [
      { index: '/system/user', title: '用户管理' },
      { index: '/system/role', title: '角色管理' }
    ]
  }
]
```

### 2. 标签页状态持久化

```ts
import { useLocalStorage } from '@vueuse/core'

const activeTab = useLocalStorage('active-tab', 'tab1')
```

### 3. 动态标签页管理

```ts
// useTabsStore.ts
export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([])
  const activeTab = ref('')
  
  const addTab = (tab: Tab) => {
    if (!tabs.value.find(t => t.name === tab.name)) {
      tabs.value.push(tab)
    }
    activeTab.value = tab.name
  }
  
  const removeTab = (name: string) => {
    // ...
  }
  
  return { tabs, activeTab, addTab, removeTab }
})
```

---

## 参考资料

- [Element Plus Menu 文档](https://element-plus.org/zh-CN/component/menu.html)
- [Element Plus Tabs 文档](https://element-plus.org/zh-CN/component/tabs.html)
