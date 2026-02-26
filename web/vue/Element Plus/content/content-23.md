# 面包屑与下拉菜单

## 概述

`el-breadcrumb`（面包屑）和 `el-dropdown`（下拉菜单）用于辅助导航。面包屑显示当前页面的路径层级，下拉菜单用于收纳更多操作选项。

## 核心属性与事件

### Breadcrumb 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `separator` | 分隔符 | `string` | `'/'` |
| `separator-icon` | 图标分隔符 | `Component` | - |

### Dropdown 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `trigger` | 触发方式 | `'hover' / 'click' / 'contextmenu'` | `'hover'` |
| `placement` | 菜单弹出位置 | `string` | `'bottom'` |
| `split-button` | 下拉触发元素是否为按钮组 | `boolean` | `false` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `max-height` | 菜单最大高度 | `string / number` | - |

## 完整实战样例

### 示例 1：面包屑导航

动态面包屑和路由集成。

```vue
<template>
  <div class="breadcrumb-demo">
    <el-card>
      <template #header>
        <span>Breadcrumb 面包屑导航</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 基础用法 -->
        <el-card shadow="never">
          <template #header>
            <span>基础面包屑</span>
          </template>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>活动管理</el-breadcrumb-item>
            <el-breadcrumb-item>活动列表</el-breadcrumb-item>
            <el-breadcrumb-item>活动详情</el-breadcrumb-item>
          </el-breadcrumb>
        </el-card>

        <!-- 图标分隔符 -->
        <el-card shadow="never">
          <template #header>
            <span>图标分隔符</span>
          </template>

          <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>系统管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          </el-breadcrumb>
        </el-card>

        <!-- 动态面包屑 -->
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>动态面包屑（点击菜单切换）</span>
              <el-select v-model="currentPage" placeholder="选择页面" style="width: 200px">
                <el-option label="首页" value="home" />
                <el-option label="用户管理" value="user" />
                <el-option label="角色管理" value="role" />
                <el-option label="订单列表" value="order" />
                <el-option label="订单详情" value="orderDetail" />
              </el-select>
            </div>
          </template>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbList"
              :key="index"
              :to="item.path ? { path: item.path } : undefined"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </el-card>

        <!-- 完整的页面导航 -->
        <el-card shadow="never">
          <template #header>
            <span>完整页面导航</span>
          </template>

          <div class="page-header">
            <div class="page-header-breadcrumb">
              <el-breadcrumb :separator-icon="ArrowRight">
                <el-breadcrumb-item :to="{ path: '/' }">
                  <el-icon><HomeFilled /></el-icon>
                  首页
                </el-breadcrumb-item>
                <el-breadcrumb-item>系统管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户管理</el-breadcrumb-item>
              </el-breadcrumb>
            </div>

            <div class="page-header-content">
              <h2>用户管理</h2>
              <p>管理系统用户，包括创建、编辑、删除等操作</p>
            </div>

            <div class="page-header-actions">
              <el-space>
                <el-button type="primary">
                  <el-icon><Plus /></el-icon>
                  新增用户
                </el-button>
                <el-button>
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </el-space>
            </div>
          </div>
        </el-card>

        <!-- 面包屑与返回按钮 -->
        <el-card shadow="never">
          <template #header>
            <span>带返回按钮的面包屑</span>
          </template>

          <div style="display: flex; align-items: center; gap: 16px">
            <el-button @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <el-divider direction="vertical" />
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>订单管理</el-breadcrumb-item>
              <el-breadcrumb-item>订单列表</el-breadcrumb-item>
              <el-breadcrumb-item>订单详情</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  HomeFilled,
  Plus,
  Download,
  ArrowLeft
} from '@element-plus/icons-vue'

const currentPage = ref('home')

interface BreadcrumbItem {
  title: string
  path?: string
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  home: [
    { title: '首页', path: '/' }
  ],
  user: [
    { title: '首页', path: '/' },
    { title: '系统管理' },
    { title: '用户管理' }
  ],
  role: [
    { title: '首页', path: '/' },
    { title: '系统管理' },
    { title: '角色管理' }
  ],
  order: [
    { title: '首页', path: '/' },
    { title: '订单管理' },
    { title: '订单列表' }
  ],
  orderDetail: [
    { title: '首页', path: '/' },
    { title: '订单管理' },
    { title: '订单列表', path: '/order' },
    { title: '订单详情' }
  ]
}

const breadcrumbList = computed(() => {
  return breadcrumbMap[currentPage.value] || []
})

const handleBack = () => {
  ElMessage.info('返回上一页')
}
</script>

<style scoped>
.breadcrumb-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #fff;
}

.page-header-breadcrumb {
  margin-bottom: 16px;
}

.page-header-breadcrumb :deep(.el-breadcrumb__inner),
.page-header-breadcrumb :deep(.el-breadcrumb__separator) {
  color: rgba(255, 255, 255, 0.8);
}

.page-header-breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: #fff;
}

.page-header-content h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.page-header-content p {
  margin: 0;
  opacity: 0.9;
}

.page-header-actions {
  margin-top: 16px;
}
</style>
```

**运行效果：**
- 基础面包屑导航
- 图标分隔符
- 动态面包屑，根据当前页面变化
- 完整页面导航，集成标题和操作按钮
- 带返回按钮的面包屑

---

### 示例 2：下拉菜单 - 各种触发方式

不同场景下的下拉菜单使用。

```vue
<template>
  <div class="dropdown-demo">
    <el-card>
      <template #header>
        <span>Dropdown 下拉菜单</span>
      </template>

      <el-space direction="vertical" style="width: 100%" :size="20">
        <!-- 基础用法 -->
        <el-card shadow="never">
          <template #header>
            <span>基础下拉菜单</span>
          </template>

          <el-space wrap :size="20">
            <el-dropdown @command="handleCommand">
              <el-button>
                更多操作
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown trigger="click" @command="handleCommand">
              <el-button type="primary">
                点击触发
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="option1">选项1</el-dropdown-item>
                  <el-dropdown-item command="option2">选项2</el-dropdown-item>
                  <el-dropdown-item command="option3">选项3</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown trigger="contextmenu" @command="handleCommand">
              <span style="cursor: pointer; color: #409eff">右键菜单</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="refresh">刷新</el-dropdown-item>
                  <el-dropdown-item command="close">关闭</el-dropdown-item>
                  <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </el-card>

        <!-- 按钮组下拉菜单 -->
        <el-card shadow="never">
          <template #header>
            <span>按钮组下拉菜单</span>
          </template>

          <el-space wrap :size="20">
            <el-dropdown split-button type="primary" @click="handleMainAction" @command="handleCommand">
              保存
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="saveAndNew">保存并新建</el-dropdown-item>
                  <el-dropdown-item command="saveAndClose">保存并关闭</el-dropdown-item>
                  <el-dropdown-item command="saveAsDraft">保存为草稿</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown split-button type="success" @click="handleExport" @command="handleCommand">
              导出
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="exportExcel">导出为 Excel</el-dropdown-item>
                  <el-dropdown-item command="exportPdf">导出为 PDF</el-dropdown-item>
                  <el-dropdown-item command="exportCsv">导出为 CSV</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </el-card>

        <!-- 不同尺寸 -->
        <el-card shadow="never">
          <template #header>
            <span>不同尺寸</span>
          </template>

          <el-space wrap :size="20">
            <el-dropdown size="large" @command="handleCommand">
              <el-button size="large">
                大型下拉菜单
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">选项1</el-dropdown-item>
                  <el-dropdown-item command="2">选项2</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown @command="handleCommand">
              <el-button>
                默认大小
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">选项1</el-dropdown-item>
                  <el-dropdown-item command="2">选项2</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown size="small" @command="handleCommand">
              <el-button size="small">
                小型下拉菜单
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">选项1</el-dropdown-item>
                  <el-dropdown-item command="2">选项2</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </el-card>

        <!-- 实际场景 -->
        <el-card shadow="never">
          <template #header>
            <span>实际应用场景</span>
          </template>

          <!-- 用户头像下拉菜单 -->
          <div style="margin-bottom: 20px">
            <span style="margin-right: 8px">用户菜单：</span>
            <el-dropdown @command="handleUserCommand">
              <span class="user-dropdown">
                <el-avatar :size="32">User</el-avatar>
                <span style="margin-left: 8px">张三</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    设置
                  </el-dropdown-item>
                  <el-dropdown-item command="help">
                    <el-icon><QuestionFilled /></el-icon>
                    帮助中心
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- 表格操作列下拉菜单 -->
          <el-table :data="tableData" border>
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-dropdown @command="(command) => handleTableCommand(command, row)">
                  <el-button type="primary" link>
                    更多
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="view">
                        <el-icon><View /></el-icon>
                        查看
                      </el-dropdown-item>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item command="disable">
                        <el-icon><Lock /></el-icon>
                        禁用
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 多级下拉菜单 -->
        <el-card shadow="never">
          <template #header>
            <span>多级下拉菜单</span>
          </template>

          <el-dropdown @command="handleCommand">
            <el-button>
              选择操作
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="action1">操作1</el-dropdown-item>
                <el-dropdown-item command="action2">操作2</el-dropdown-item>
                <el-dropdown-item divided>
                  <el-dropdown placement="right-start" @command="handleCommand">
                    <span style="display: flex; align-items: center; justify-content: space-between; width: 100%">
                      更多操作
                      <el-icon><arrow-right /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="sub1">子操作1</el-dropdown-item>
                        <el-dropdown-item command="sub2">子操作2</el-dropdown-item>
                        <el-dropdown-item command="sub3">子操作3</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  ArrowRight,
  User,
  Setting,
  QuestionFilled,
  SwitchButton,
  View,
  Edit,
  Lock,
  Delete
} from '@element-plus/icons-vue'

const tableData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' }
])

const handleCommand = (command: string) => {
  ElMessage.info(`点击了：${command}`)
}

const handleMainAction = () => {
  ElMessage.success('执行主要操作')
}

const handleExport = () => {
  ElMessage.info('导出数据')
}

const handleUserCommand = (command: string) => {
  const commandMap: Record<string, string> = {
    profile: '个人中心',
    settings: '设置',
    help: '帮助中心',
    logout: '退出登录'
  }
  ElMessage.info(`点击了：${commandMap[command]}`)
}

const handleTableCommand = (command: string, row: any) => {
  ElMessage.info(`对 ${row.name} 执行：${command}`)
}
</script>

<style scoped>
.dropdown-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.user-dropdown {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.user-dropdown:hover {
  color: #409eff;
}
</style>
```

**运行效果：**
- 基础下拉菜单，支持悬停、点击、右键触发
- 按钮组下拉菜单
- 不同尺寸的下拉菜单
- 用户头像下拉菜单
- 表格操作列下拉菜单
- 多级下拉菜单

---

## 常见踩坑

### 1. 面包屑路由跳转失效

**问题：** 设置了 `:to` 但点击无反应。

**解决：** 确保路由已配置且格式正确。

```vue
<!-- ✅ 正确 -->
<el-breadcrumb-item :to="{ path: '/home' }">
  首页
</el-breadcrumb-item>

<!-- ❌ 错误 -->
<el-breadcrumb-item to="/home">
  首页
</el-breadcrumb-item>
```

---

### 2. Dropdown 菜单被遮挡

**问题：** 下拉菜单被父容器遮挡。

**解决：** 调整父容器的 `overflow` 或使用 `teleported` 属性。

```vue
<el-dropdown :teleported="true">
```

---

### 3. Dropdown command 未触发

**问题：** 点击菜单项，`@command` 事件未触发。

**解决：** 确保设置了 `command` 属性。

```vue
<el-dropdown @command="handleCommand">
  <template #dropdown>
    <el-dropdown-menu>
      <!-- ✅ 正确 -->
      <el-dropdown-item command="edit">编辑</el-dropdown-item>
      
      <!-- ❌ 错误 -->
      <el-dropdown-item>编辑</el-dropdown-item>
    </el-dropdown-menu>
  </template>
</el-dropdown>
```

---

### 4. 面包屑最后一项可点击

**问题：** 最后一项不应该是链接，但设置了 `:to`。

**解决：** 最后一项不设置 `:to` 属性。

```vue
<el-breadcrumb>
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item :to="{ path: '/user' }">用户管理</el-breadcrumb-item>
  <el-breadcrumb-item>用户详情</el-breadcrumb-item> <!-- 不设置 :to -->
</el-breadcrumb>
```

---

## 最佳实践

### 1. 动态面包屑生成

```ts
// useBreadcrumb.ts
export const useBreadcrumb = () => {
  const route = useRoute()
  
  const breadcrumbList = computed(() => {
    const matched = route.matched.filter(item => item.meta?.title)
    return matched.map(item => ({
      title: item.meta.title,
      path: item.path
    }))
  })
  
  return { breadcrumbList }
}
```

### 2. 下拉菜单权限控制

```vue
<el-dropdown-menu>
  <el-dropdown-item v-if="hasPermission('edit')" command="edit">
    编辑
  </el-dropdown-item>
  <el-dropdown-item v-if="hasPermission('delete')" command="delete">
    删除
  </el-dropdown-item>
</el-dropdown-menu>
```

### 3. 下拉菜单统一处理

```ts
const dropdownCommands = {
  edit: (row: any) => { /* 编辑逻辑 */ },
  delete: (row: any) => { /* 删除逻辑 */ },
  view: (row: any) => { /* 查看逻辑 */ }
}

const handleCommand = (command: string, row: any) => {
  dropdownCommands[command]?.(row)
}
```

---

## 参考资料

- [Element Plus Breadcrumb 文档](https://element-plus.org/zh-CN/component/breadcrumb.html)
- [Element Plus Dropdown 文档](https://element-plus.org/zh-CN/component/dropdown.html)
