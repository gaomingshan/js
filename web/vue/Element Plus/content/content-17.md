# 树形与描述组件

## 概述

本章介绍 `el-tree` 树形组件和 `el-descriptions` 描述列表组件。树形组件用于展示层级结构数据（如菜单、组织架构、文件目录），描述列表组件用于展示详细信息的键值对。

## 核心属性与事件

### Tree 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `data` | 展示数据 | `Array` | - |
| `node-key` | 每个节点的唯一标识 | `string` | - |
| `props` | 配置选项 | `Object` | `{ children: 'children', label: 'label' }` |
| `show-checkbox` | 是否显示复选框 | `boolean` | `false` |
| `check-strictly` | 父子节点不互相关联 | `boolean` | `false` |
| `default-expand-all` | 是否默认展开所有节点 | `boolean` | `false` |
| `expand-on-click-node` | 是否在点击节点时展开 | `boolean` | `true` |
| `lazy` | 是否懒加载子节点 | `boolean` | `false` |
| `load` | 加载子节点数据的方法 | `Function` | - |
| `filter-node-method` | 过滤节点的方法 | `Function` | - |

### Tree 核心方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| `getCheckedNodes` | 获取选中节点 | `(leafOnly, includeHalfChecked)` |
| `setCheckedKeys` | 设置选中节点 | `(keys)` |
| `getCheckedKeys` | 获取选中节点的 key | `(leafOnly)` |
| `filter` | 过滤树节点 | `(value)` |

### Descriptions 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 标题文本 | `string` | - |
| `column` | 一行显示几列 | `number` | `3` |
| `border` | 是否带边框 | `boolean` | `false` |
| `direction` | 排列方向 | `'vertical' / 'horizontal'` | `'horizontal'` |
| `size` | 列表尺寸 | `'large' / 'default' / 'small'` | `'default'` |

## 完整实战样例

### 示例 1：权限树 - 角色权限管理

使用树形组件管理角色权限。

```vue
<template>
  <div class="permission-tree-demo">
    <el-card>
      <template #header>
        <span>角色权限配置</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <span>角色列表</span>
            </template>
            <el-menu
              :default-active="currentRole"
              @select="handleSelectRole"
            >
              <el-menu-item
                v-for="role in roles"
                :key="role.id"
                :index="role.id"
              >
                <el-icon><User /></el-icon>
                <span>{{ role.name }}</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <el-col :span="16">
          <el-card shadow="never">
            <template #header>
              <div class="permission-header">
                <span>{{ currentRoleName }} - 权限配置</span>
                <el-space>
                  <el-button size="small" @click="handleExpandAll">
                    全部展开
                  </el-button>
                  <el-button size="small" @click="handleCollapseAll">
                    全部折叠
                  </el-button>
                  <el-button size="small" @click="handleCheckAll">
                    全选
                  </el-button>
                  <el-button size="small" @click="handleUncheckAll">
                    取消全选
                  </el-button>
                </el-space>
              </div>
            </template>

            <el-input
              v-model="filterText"
              placeholder="搜索权限"
              clearable
              style="margin-bottom: 16px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-tree
              ref="treeRef"
              :data="permissions"
              :props="treeProps"
              node-key="id"
              show-checkbox
              :default-expand-all="false"
              :filter-node-method="filterNode"
              @check="handleCheckChange"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <el-icon v-if="data.icon" style="margin-right: 4px">
                    <component :is="data.icon" />
                  </el-icon>
                  <span>{{ node.label }}</span>
                  <el-tag v-if="data.type" size="small" style="margin-left: 8px">
                    {{ data.type }}
                  </el-tag>
                </div>
              </template>
            </el-tree>

            <div style="margin-top: 16px">
              <el-button type="primary" @click="handleSave">
                保存权限配置
              </el-button>
              <el-button @click="handleReset">
                重置
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Search, Menu, Document, Setting, User as UserIcon } from '@element-plus/icons-vue'

interface Permission {
  id: string
  label: string
  icon?: any
  type?: string
  children?: Permission[]
}

interface Role {
  id: string
  name: string
  permissions: string[]
}

const treeRef = ref()
const filterText = ref('')
const currentRole = ref('admin')

const roles = ref<Role[]>([
  { id: 'admin', name: '管理员', permissions: ['1', '1-1', '1-2', '2', '2-1', '3'] },
  { id: 'editor', name: '编辑', permissions: ['1', '1-1', '2', '2-1'] },
  { id: 'viewer', name: '访客', permissions: ['1', '1-1'] }
])

const permissions = ref<Permission[]>([
  {
    id: '1',
    label: '系统管理',
    icon: Setting,
    children: [
      { id: '1-1', label: '用户管理', icon: UserIcon, type: '页面' },
      { id: '1-2', label: '角色管理', icon: UserIcon, type: '页面' },
      { id: '1-3', label: '菜单管理', icon: Menu, type: '页面' }
    ]
  },
  {
    id: '2',
    label: '内容管理',
    icon: Document,
    children: [
      { id: '2-1', label: '文章列表', type: '页面' },
      { id: '2-2', label: '发布文章', type: '操作' },
      { id: '2-3', label: '删除文章', type: '操作' }
    ]
  },
  {
    id: '3',
    label: '数据统计',
    icon: Document,
    children: [
      { id: '3-1', label: '访问统计', type: '页面' },
      { id: '3-2', label: '用户统计', type: '页面' }
    ]
  }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

const currentRoleName = computed(() => {
  return roles.value.find(r => r.id === currentRole.value)?.name || ''
})

watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value: string, data: Permission) => {
  if (!value) return true
  return data.label.includes(value)
}

const handleSelectRole = (roleId: string) => {
  currentRole.value = roleId
  loadRolePermissions()
}

const loadRolePermissions = () => {
  const role = roles.value.find(r => r.id === currentRole.value)
  if (role) {
    treeRef.value?.setCheckedKeys(role.permissions)
  }
}

const handleExpandAll = () => {
  expandAllNodes(permissions.value, true)
}

const handleCollapseAll = () => {
  expandAllNodes(permissions.value, false)
}

const expandAllNodes = (nodes: Permission[], expand: boolean) => {
  nodes.forEach(node => {
    const treeNode = treeRef.value?.getNode(node.id)
    if (treeNode) {
      treeNode.expanded = expand
    }
    if (node.children) {
      expandAllNodes(node.children, expand)
    }
  })
}

const handleCheckAll = () => {
  const allKeys = getAllNodeKeys(permissions.value)
  treeRef.value?.setCheckedKeys(allKeys)
}

const handleUncheckAll = () => {
  treeRef.value?.setCheckedKeys([])
}

const getAllNodeKeys = (nodes: Permission[]): string[] => {
  let keys: string[] = []
  nodes.forEach(node => {
    keys.push(node.id)
    if (node.children) {
      keys = keys.concat(getAllNodeKeys(node.children))
    }
  })
  return keys
}

const handleCheckChange = () => {
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  console.log('选中的权限:', checkedKeys)
}

const handleSave = () => {
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  const role = roles.value.find(r => r.id === currentRole.value)
  if (role) {
    role.permissions = checkedKeys
    ElMessage.success(`${role.name} 权限配置已保存`)
  }
}

const handleReset = () => {
  loadRolePermissions()
  ElMessage.info('已重置为原始配置')
}

// 初始化
loadRolePermissions()
</script>

<style scoped>
.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-node {
  display: flex;
  align-items: center;
}
</style>
```

**运行效果：**
- 左侧角色列表，右侧权限树
- 支持搜索过滤权限节点
- 全部展开/折叠、全选/取消全选
- 保存角色权限配置

---

### 示例 2：文件目录树 - 懒加载

模拟文件系统，支持懒加载子目录。

```vue
<template>
  <div class="file-tree-demo">
    <el-card>
      <template #header>
        <div class="header">
          <span>文件管理器</span>
          <el-button type="primary" size="small" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-tree
        ref="treeRef"
        :data="fileTree"
        :props="treeProps"
        node-key="id"
        lazy
        :load="loadNode"
        :expand-on-click-node="false"
      >
        <template #default="{ node, data }">
          <div class="file-node">
            <el-icon :size="16" style="margin-right: 6px">
              <component :is="getFileIcon(data)" />
            </el-icon>
            <span>{{ node.label }}</span>
            <span v-if="data.size" class="file-size">
              {{ formatSize(data.size) }}
            </span>
            <el-space class="file-actions">
              <el-button
                v-if="data.type === 'folder'"
                type="primary"
                size="small"
                link
                @click.stop="handleAddFolder(data)"
              >
                新建文件夹
              </el-button>
              <el-button
                type="info"
                size="small"
                link
                @click.stop="handleRename(data)"
              >
                重命名
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                @click.stop="handleDelete(data)"
              >
                删除
              </el-button>
            </el-space>
          </div>
        </template>
      </el-tree>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Folder, Document, Refresh } from '@element-plus/icons-vue'

interface FileNode {
  id: string
  name: string
  type: 'folder' | 'file'
  size?: number
  children?: FileNode[]
  hasChildren?: boolean
}

const treeRef = ref()

const fileTree = ref<FileNode[]>([
  {
    id: '1',
    name: 'src',
    type: 'folder',
    hasChildren: true
  },
  {
    id: '2',
    name: 'public',
    type: 'folder',
    hasChildren: true
  },
  {
    id: '3',
    name: 'package.json',
    type: 'file',
    size: 1024
  }
])

const treeProps = {
  children: 'children',
  label: 'name',
  isLeaf: (data: FileNode) => data.type === 'file'
}

const getFileIcon = (data: FileNode) => {
  return data.type === 'folder' ? Folder : Document
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// 懒加载子节点
const loadNode = (node: any, resolve: Function) => {
  if (node.level === 0) {
    return resolve(fileTree.value)
  }
  
  // 模拟异步加载
  setTimeout(() => {
    const data: FileNode = node.data
    let children: FileNode[] = []
    
    if (data.id === '1') {
      // src 目录
      children = [
        { id: '1-1', name: 'components', type: 'folder', hasChildren: true },
        { id: '1-2', name: 'views', type: 'folder', hasChildren: true },
        { id: '1-3', name: 'utils', type: 'folder', hasChildren: true },
        { id: '1-4', name: 'App.vue', type: 'file', size: 2048 },
        { id: '1-5', name: 'main.ts', type: 'file', size: 512 }
      ]
    } else if (data.id === '2') {
      // public 目录
      children = [
        { id: '2-1', name: 'favicon.ico', type: 'file', size: 4096 },
        { id: '2-2', name: 'index.html', type: 'file', size: 1536 }
      ]
    } else if (data.id === '1-1') {
      // components 目录
      children = [
        { id: '1-1-1', name: 'Header.vue', type: 'file', size: 3072 },
        { id: '1-1-2', name: 'Footer.vue', type: 'file', size: 2560 },
        { id: '1-1-3', name: 'Sidebar.vue', type: 'file', size: 4096 }
      ]
    } else if (data.id === '1-2') {
      // views 目录
      children = [
        { id: '1-2-1', name: 'Home.vue', type: 'file', size: 5120 },
        { id: '1-2-2', name: 'About.vue', type: 'file', size: 3584 }
      ]
    } else if (data.id === '1-3') {
      // utils 目录
      children = [
        { id: '1-3-1', name: 'request.ts', type: 'file', size: 2048 },
        { id: '1-3-2', name: 'utils.ts', type: 'file', size: 1536 }
      ]
    }
    
    resolve(children)
  }, 500)
}

const handleAddFolder = (data: FileNode) => {
  ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (value) {
      ElMessage.success(`在 ${data.name} 下创建文件夹：${value}`)
      // 实际项目中这里需要刷新树节点
    }
  }).catch(() => {})
}

const handleRename = (data: FileNode) => {
  ElMessageBox.prompt('请输入新名称', '重命名', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: data.name
  }).then(({ value }) => {
    if (value) {
      data.name = value
      ElMessage.success('重命名成功')
    }
  }).catch(() => {})
}

const handleDelete = (data: FileNode) => {
  ElMessageBox.confirm(`确定要删除 ${data.name} 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    // 实际项目中这里需要从树中移除节点
  }).catch(() => {})
}

const handleRefresh = () => {
  ElMessage.info('刷新文件树')
  // 实际项目中重新加载数据
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-node {
  display: flex;
  align-items: center;
  width: 100%;
}

.file-size {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.file-actions {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.3s;
}

.file-node:hover .file-actions {
  opacity: 1;
}
</style>
```

**运行效果：**
- 懒加载文件目录结构
- 文件和文件夹显示不同图标
- 文件显示大小
- 鼠标悬停显示操作按钮
- 支持新建、重命名、删除操作

---

### 示例 3：描述列表 - 用户详情

使用描述列表展示用户详细信息。

```vue
<template>
  <div class="descriptions-demo">
    <el-card>
      <template #header>
        <div class="header">
          <span>用户详情</span>
          <el-button type="primary" @click="handleEdit">
            编辑
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions
            title="个人信息"
            :column="2"
            border
            size="default"
          >
            <el-descriptions-item label="用户名">
              {{ userInfo.username }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userInfo.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userInfo.email }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              <el-tag :type="userInfo.gender === '男' ? '' : 'danger'">
                {{ userInfo.gender }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="出生日期">
              {{ userInfo.birthday }}
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">
              {{ userInfo.idCard }}
            </el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">
              {{ userInfo.address }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-descriptions
            title="账户信息"
            :column="3"
            border
          >
            <el-descriptions-item label="用户ID">
              {{ userInfo.id }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag type="danger">{{ userInfo.role }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="userInfo.status === '正常' ? 'success' : 'danger'">
                {{ userInfo.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ userInfo.createTime }}
            </el-descriptions-item>
            <el-descriptions-item label="最后登录">
              {{ userInfo.lastLoginTime }}
            </el-descriptions-item>
            <el-descriptions-item label="登录次数">
              {{ userInfo.loginCount }} 次
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="扩展信息" name="extra">
          <el-descriptions
            title="教育背景"
            :column="1"
            border
            direction="vertical"
          >
            <el-descriptions-item label="学历">
              {{ userInfo.education }}
            </el-descriptions-item>
            <el-descriptions-item label="毕业院校">
              {{ userInfo.school }}
            </el-descriptions-item>
            <el-descriptions-item label="专业">
              {{ userInfo.major }}
            </el-descriptions-item>
            <el-descriptions-item label="毕业时间">
              {{ userInfo.graduationDate }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-descriptions
            title="工作信息"
            :column="2"
            border
          >
            <el-descriptions-item label="公司">
              {{ userInfo.company }}
            </el-descriptions-item>
            <el-descriptions-item label="职位">
              {{ userInfo.position }}
            </el-descriptions-item>
            <el-descriptions-item label="部门">
              {{ userInfo.department }}
            </el-descriptions-item>
            <el-descriptions-item label="入职时间">
              {{ userInfo.joinDate }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="权限信息" name="permission">
          <el-descriptions
            title="权限配置"
            :column="1"
            border
          >
            <el-descriptions-item label="所属角色">
              <el-space wrap>
                <el-tag
                  v-for="role in userInfo.roles"
                  :key="role"
                  type="primary"
                >
                  {{ role }}
                </el-tag>
              </el-space>
            </el-descriptions-item>
            <el-descriptions-item label="拥有权限">
              <el-space wrap>
                <el-tag
                  v-for="permission in userInfo.permissions"
                  :key="permission"
                  size="small"
                >
                  {{ permission }}
                </el-tag>
              </el-space>
            </el-descriptions-item>
            <el-descriptions-item label="数据权限">
              <el-tag type="warning">{{ userInfo.dataScope }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')

const userInfo = ref({
  id: 10001,
  username: '张三',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  gender: '男',
  birthday: '1990-01-15',
  idCard: '110101199001150012',
  address: '北京市朝阳区建国路88号SOHO现代城A座1001室',
  role: '系统管理员',
  status: '正常',
  createTime: '2023-01-15 10:30:00',
  lastLoginTime: '2024-01-20 14:25:30',
  loginCount: 156,
  education: '本科',
  school: '北京大学',
  major: '计算机科学与技术',
  graduationDate: '2012-06',
  company: 'XX科技有限公司',
  position: '技术总监',
  department: '研发部',
  joinDate: '2015-03-01',
  roles: ['系统管理员', '超级管理员'],
  permissions: ['用户管理', '角色管理', '菜单管理', '系统设置', '数据统计'],
  dataScope: '全部数据权限'
})

const handleEdit = () => {
  ElMessage.info('打开编辑对话框')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-divider) {
  margin: 24px 0;
}
</style>
```

**运行效果：**
- 使用标签页分组展示不同类别信息
- 带边框的描述列表
- 支持跨列显示
- 不同方向的布局（horizontal/vertical）
- 使用标签显示状态和权限

---

## 常见踩坑

### 1. 树节点选中状态不同步

**问题：** 使用 `setCheckedKeys` 后视图未更新。

**解决：** 确保设置了 `node-key` 属性。

```vue
<el-tree
  :data="data"
  node-key="id"
  show-checkbox
>
```

---

### 2. 懒加载无限循环

**问题：** `hasChildren` 判断错误导致重复加载。

**解决：** 使用 `isLeaf` 函数明确指定叶子节点。

```ts
const treeProps = {
  isLeaf: (data: Node) => data.type === 'file'
}
```

---

### 3. 描述列表布局错乱

**问题：** 使用 `span` 后布局异常。

**解决：** 确保所有项的 `span` 总和等于 `column` 的倍数。

```vue
<!-- column=2 -->
<el-descriptions :column="2">
  <el-descriptions-item :span="1">...</el-descriptions-item>
  <el-descriptions-item :span="1">...</el-descriptions-item>
  <!-- 总和为 2 -->
</el-descriptions>
```

---

## 最佳实践

### 1. 树节点数据结构统一

定义标准的节点接口：

```ts
interface TreeNode {
  id: string | number
  label: string
  children?: TreeNode[]
  [key: string]: any
}
```

### 2. 树操作方法封装

封装常用的树操作方法：

```ts
const treeUtils = {
  findNode: (tree: TreeNode[], id: string) => { /* ... */ },
  getAllKeys: (tree: TreeNode[]) => { /* ... */ },
  filterTree: (tree: TreeNode[], keyword: string) => { /* ... */ }
}
```

### 3. 描述列表响应式布局

根据屏幕大小动态调整列数：

```ts
const column = computed(() => {
  if (windowWidth.value < 768) return 1
  if (windowWidth.value < 1200) return 2
  return 3
})
```

---

## 参考资料

- [Element Plus Tree 文档](https://element-plus.org/zh-CN/component/tree.html)
- [Element Plus Descriptions 文档](https://element-plus.org/zh-CN/component/descriptions.html)
