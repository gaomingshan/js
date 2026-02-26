# 分页与标签组件

## 概述

本章介绍 `el-pagination` 分页组件和 `el-tag` 标签组件，这两个组件在数据展示和状态标识中非常常用。分页组件用于大数据列表的分页导航，标签组件用于状态、分类等信息的可视化展示。

## 核心属性与事件

### Pagination 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `total` | 总条目数 | `number` | - |
| `page-size` | 每页显示条目数 | `number` | `10` |
| `current-page` | 当前页数，支持 v-model | `number` | `1` |
| `page-sizes` | 每页显示个数选择器的选项 | `number[]` | `[10, 20, 30, 50]` |
| `layout` | 组件布局 | `string` | `'prev, pager, next'` |
| `background` | 是否为分页按钮添加背景色 | `boolean` | `false` |
| `small` | 是否使用小型分页样式 | `boolean` | `false` |

### Pagination 核心事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `size-change` | pageSize 改变时触发 | `新的 pageSize` |
| `current-change` | currentPage 改变时触发 | `新的 currentPage` |

### Tag 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `type` | 类型 | `'success' / 'info' / 'warning' / 'danger'` | `'info'` |
| `closable` | 是否可关闭 | `boolean` | `false` |
| `size` | 尺寸 | `'large' / 'default' / 'small'` | `'default'` |
| `effect` | 主题 | `'dark' / 'light' / 'plain'` | `'light'` |
| `round` | 是否为圆形 | `boolean` | `false` |
| `color` | 背景色 | `string` | - |

## 完整实战样例

### 示例 1：完整分页功能 - 用户列表

包含跳转、切换每页条数、总数显示的完整分页。

```vue
<template>
  <div class="pagination-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-space>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户"
              clearable
              style="width: 200px"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleAdd">
              新增用户
            </el-button>
          </el-space>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        
        <el-table-column prop="name" label="姓名" width="120" />
        
        <el-table-column prop="email" label="邮箱" min-width="180" />
        
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="160" />
        
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createTime: string
}

const loading = ref(false)
const searchKeyword = ref('')
const tableData = ref<User[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 模拟后端数据
const mockData: User[] = Array.from({ length: 95 }, (_, index) => ({
  id: index + 1,
  name: `用户${index + 1}`,
  email: `user${index + 1}@example.com`,
  role: ['管理员', '编辑', '普通用户'][index % 3],
  status: index % 5 === 0 ? 'inactive' : 'active',
  createTime: `2024-01-${String((index % 28) + 1).padStart(2, '0')} 10:30:00`
}))

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  
  // 模拟 API 请求
  setTimeout(() => {
    let filteredData = mockData
    
    // 搜索过滤
    if (searchKeyword.value) {
      filteredData = mockData.filter(item =>
        item.name.includes(searchKeyword.value) ||
        item.email.includes(searchKeyword.value)
      )
    }
    
    pagination.total = filteredData.length
    
    // 分页
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
    
    loading.value = false
  }, 500)
}

const getRoleType = (role: string) => {
  const map: Record<string, any> = {
    '管理员': 'danger',
    '编辑': 'warning',
    '普通用户': 'info'
  }
  return map[role]
}

const handleSizeChange = (pageSize: number) => {
  console.log('每页条数:', pageSize)
  pagination.page = 1
  fetchData()
}

const handleCurrentChange = (page: number) => {
  console.log('当前页:', page)
  fetchData()
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleAdd = () => {
  ElMessage.info('打开新增对话框')
}

const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户：${row.name}`)
}

const handleDelete = (row: User) => {
  ElMessage.warning(`删除用户：${row.name}`)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

**运行效果：**
- 支持切换每页显示条数
- 支持跳转到指定页
- 显示总条目数
- 搜索后重置到第一页
- 分页按钮带背景色

---

### 示例 2：标签管理 - 动态添加删除标签

可添加、删除的标签列表，常用于标签管理功能。

```vue
<template>
  <div class="tag-manager-demo">
    <el-card>
      <template #header>
        <span>文章标签管理</span>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="文章标题">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>

        <el-form-item label="文章标签">
          <div class="tags-container">
            <el-tag
              v-for="tag in form.tags"
              :key="tag"
              closable
              :type="getRandomType()"
              @close="handleCloseTag(tag)"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ tag }}
            </el-tag>

            <el-input
              v-if="inputVisible"
              ref="inputRef"
              v-model="inputValue"
              size="small"
              style="width: 120px"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button
              v-else
              size="small"
              @click="showInput"
            >
              + 添加标签
            </el-button>
          </div>

          <div style="margin-top: 12px; color: #909399; font-size: 13px">
            已添加 {{ form.tags.length }} 个标签，最多可添加 10 个
          </div>
        </el-form-item>

        <el-form-item label="热门标签">
          <el-space wrap>
            <el-tag
              v-for="tag in hotTags"
              :key="tag"
              type="info"
              effect="plain"
              style="cursor: pointer"
              @click="handleSelectHotTag(tag)"
            >
              {{ tag }}
            </el-tag>
          </el-space>
          <div style="margin-top: 8px; color: #909399; font-size: 13px">
            点击热门标签快速添加
          </div>
        </el-form-item>

        <el-form-item label="分类标签">
          <el-space wrap>
            <el-check-tag
              v-for="category in categories"
              :key="category.value"
              :checked="form.category === category.value"
              @change="handleCategoryChange(category.value)"
            >
              {{ category.label }}
            </el-check-tag>
          </el-space>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">
            保存
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标签预览 -->
    <el-card style="margin-top: 16px">
      <template #header>
        <span>标签预览效果</span>
      </template>

      <el-space direction="vertical" style="width: 100%">
        <div>
          <div class="preview-label">不同类型：</div>
          <el-space wrap>
            <el-tag>默认标签</el-tag>
            <el-tag type="success">成功标签</el-tag>
            <el-tag type="info">信息标签</el-tag>
            <el-tag type="warning">警告标签</el-tag>
            <el-tag type="danger">危险标签</el-tag>
          </el-space>
        </div>

        <div>
          <div class="preview-label">不同主题：</div>
          <el-space wrap>
            <el-tag effect="dark">Dark</el-tag>
            <el-tag effect="light">Light</el-tag>
            <el-tag effect="plain">Plain</el-tag>
          </el-space>
        </div>

        <div>
          <div class="preview-label">不同尺寸：</div>
          <el-space wrap align="center">
            <el-tag size="large">大号标签</el-tag>
            <el-tag>默认标签</el-tag>
            <el-tag size="small">小号标签</el-tag>
          </el-space>
        </div>

        <div>
          <div class="preview-label">圆形标签：</div>
          <el-space wrap>
            <el-tag round>圆形标签</el-tag>
            <el-tag type="success" round>成功</el-tag>
            <el-tag type="danger" round>危险</el-tag>
          </el-space>
        </div>

        <div>
          <div class="preview-label">自定义颜色：</div>
          <el-space wrap>
            <el-tag color="#f50">红色</el-tag>
            <el-tag color="#2db7f5">蓝色</el-tag>
            <el-tag color="#87d068">绿色</el-tag>
            <el-tag color="#ff85c0">粉色</el-tag>
          </el-space>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const inputRef = ref()
const inputVisible = ref(false)
const inputValue = ref('')

const form = reactive({
  title: '',
  tags: ['Vue3', 'Element Plus', 'TypeScript'],
  category: 'frontend'
})

const hotTags = ['JavaScript', 'React', 'Angular', 'Node.js', 'Webpack', 'Vite', 'CSS3', 'HTML5']

const categories = [
  { label: '前端开发', value: 'frontend' },
  { label: '后端开发', value: 'backend' },
  { label: '移动开发', value: 'mobile' },
  { label: '数据库', value: 'database' },
  { label: '运维部署', value: 'devops' }
]

const tagTypes = ['', 'success', 'info', 'warning', 'danger']

const getRandomType = () => {
  return tagTypes[Math.floor(Math.random() * tagTypes.length)]
}

const handleCloseTag = (tag: string) => {
  form.tags = form.tags.filter(t => t !== tag)
  ElMessage.success(`已删除标签：${tag}`)
}

const showInput = () => {
  if (form.tags.length >= 10) {
    ElMessage.warning('最多只能添加 10 个标签')
    return
  }
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  const value = inputValue.value.trim()
  if (value) {
    if (form.tags.includes(value)) {
      ElMessage.warning('标签已存在')
    } else if (form.tags.length >= 10) {
      ElMessage.warning('最多只能添加 10 个标签')
    } else {
      form.tags.push(value)
      ElMessage.success(`已添加标签：${value}`)
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}

const handleSelectHotTag = (tag: string) => {
  if (form.tags.includes(tag)) {
    ElMessage.info('标签已存在')
  } else if (form.tags.length >= 10) {
    ElMessage.warning('最多只能添加 10 个标签')
  } else {
    form.tags.push(tag)
    ElMessage.success(`已添加标签：${tag}`)
  }
}

const handleCategoryChange = (value: string) => {
  form.category = value
}

const handleSubmit = () => {
  if (!form.title) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (form.tags.length === 0) {
    ElMessage.warning('请至少添加一个标签')
    return
  }
  console.log('提交数据:', form)
  ElMessage.success('保存成功')
}

const handleReset = () => {
  form.title = ''
  form.tags = []
  form.category = 'frontend'
  ElMessage.info('已重置')
}
</script>

<style scoped>
.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.preview-label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #606266;
}
</style>
```

**运行效果：**
- 动态添加和删除标签
- 点击热门标签快速添加
- 限制最多 10 个标签
- 使用 check-tag 实现分类选择
- 展示不同类型、主题、尺寸的标签效果

---

### 示例 3：前后端分页 - 实际 API 集成

与后端 API 集成的真实分页场景。

```vue
<template>
  <div class="api-pagination-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表（后端分页）</span>
          <el-space>
            <el-select
              v-model="filters.category"
              placeholder="选择分类"
              clearable
              style="width: 150px"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="手机" value="phone" />
              <el-option label="电脑" value="computer" />
              <el-option label="平板" value="tablet" />
            </el-select>
            <el-select
              v-model="filters.status"
              placeholder="选择状态"
              clearable
              style="width: 120px"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="上架" value="active" />
              <el-option label="下架" value="inactive" />
            </el-select>
          </el-space>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="name" label="商品名称" min-width="200" />
        
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ getCategoryName(row.category) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="price" label="价格" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="stock" label="库存" width="100" align="center" />
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive'
}

interface ApiResponse {
  data: Product[]
  total: number
}

const loading = ref(false)
const tableData = ref<Product[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  category: '',
  status: ''
})

onMounted(() => {
  fetchData()
})

// 模拟 API 请求
const fetchData = async () => {
  loading.value = true
  
  try {
    // 构建查询参数
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      category: filters.category,
      status: filters.status
    }
    
    // 实际项目中替换为真实 API
    // const response = await axios.get('/api/products', { params })
    const response = await mockApiRequest(params)
    
    tableData.value = response.data
    pagination.total = response.total
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 模拟后端 API
const mockApiRequest = (params: any): Promise<ApiResponse> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // 模拟数据
      const allData: Product[] = Array.from({ length: 48 }, (_, i) => ({
        id: i + 1,
        name: `商品${i + 1}`,
        category: ['phone', 'computer', 'tablet'][i % 3],
        price: 1000 + Math.random() * 9000,
        stock: Math.floor(Math.random() * 200),
        status: i % 5 === 0 ? 'inactive' : 'active'
      }))
      
      // 过滤
      let filtered = allData
      if (params.category) {
        filtered = filtered.filter(item => item.category === params.category)
      }
      if (params.status) {
        filtered = filtered.filter(item => item.status === params.status)
      }
      
      // 分页
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      const data = filtered.slice(start, end)
      
      resolve({
        data,
        total: filtered.length
      })
    }, 500)
  })
}

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    phone: '手机',
    computer: '电脑',
    tablet: '平板'
  }
  return map[category] || category
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchData()
}

const handleCurrentChange = () => {
  fetchData()
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchData()
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

**运行效果：**
- 与后端 API 集成的分页
- 支持按分类和状态筛选
- 筛选后重置到第一页
- 显示加载状态

---

## 常见踩坑

### 1. 分页参数不同步

**问题：** 切换页码或每页条数后，数据未更新。

**解决：** 使用 `v-model` 双向绑定。

```vue
<el-pagination
  v-model:current-page="pagination.page"
  v-model:page-size="pagination.pageSize"
/>
```

---

### 2. 总数据量计算错误

**问题：** 后端返回的 `total` 不正确，导致分页显示异常。

**解决：** 确保后端返回的是过滤后的总数，而不是原始总数。

---

### 3. 标签删除时闪烁

**问题：** 使用 `v-for` 渲染标签，删除时出现闪烁。

**解决：** 添加 `:key` 属性。

```vue
<el-tag
  v-for="tag in tags"
  :key="tag"
  closable
  @close="handleClose(tag)"
>
  {{ tag }}
</el-tag>
```

---

## 最佳实践

### 1. 分页参数统一管理

使用 `reactive` 统一管理分页参数：

```ts
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})
```

### 2. 筛选后重置页码

筛选条件变化时，重置到第一页：

```ts
const handleFilterChange = () => {
  pagination.page = 1
  fetchData()
}
```

### 3. 标签数量限制

添加标签时检查数量：

```ts
if (tags.length >= MAX_TAGS) {
  ElMessage.warning(`最多添加 ${MAX_TAGS} 个标签`)
  return
}
```

---

## 参考资料

- [Element Plus Pagination 文档](https://element-plus.org/zh-CN/component/pagination.html)
- [Element Plus Tag 文档](https://element-plus.org/zh-CN/component/tag.html)
