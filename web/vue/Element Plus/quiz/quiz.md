# Element Plus 面试题 50 道

> 本面试题涵盖 Element Plus 的基础使用、高级配置和实战场景，分为基础题（15 题）、高级题（15 题）和实战题（20 题）。

---

## 一、基础使用题（15 题）

### 1. Element Plus 的安装和引入方式有哪些？

**答案：**
1. 完整引入
2. 按需引入（手动）
3. 自动按需引入（推荐）

**解析：**

完整引入适合快速开发，但打包体积大：
```ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
app.use(ElementPlus)
```

自动按需引入是生产环境推荐方案：
```ts
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default {
  plugins: [
    AutoImport({ resolvers: [ElementPlusResolver()] }),
    Components({ resolvers: [ElementPlusResolver()] }),
  ],
}
```

**易错点：** 忘记引入样式文件导致组件无样式。

---

### 2. 如何配置 Element Plus 的国际化？

**答案：**
```ts
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

app.use(ElementPlus, { locale: zhCn })
```

**解析：**

Element Plus 支持多种语言，通过 locale 属性配置。常用语言包：
- zh-cn（简体中文）
- en（英语）
- ja（日语）

与 Vue I18n 集成：
```ts
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'zh-cn',
  messages: {
    'zh-cn': { el: zhCn.el },
    'en': { el: en.el },
  },
})

app.use(ElementPlus, {
  locale: i18n.global.messages.value[i18n.global.locale.value].el,
})
```

**易错点：** 动态切换语言时未更新 Element Plus 的 locale。

---

### 3. Form 表单的校验规则如何配置？

**答案：**
```vue
<el-form :model="form" :rules="rules">
  <el-form-item prop="email" label="邮箱">
    <el-input v-model="form.email" />
  </el-form-item>
</el-form>

<script setup>
const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}
</script>
```

**解析：**

校验规则的关键属性：
- `required`: 是否必填
- `message`: 错误提示
- `trigger`: 触发方式（blur/change）
- `validator`: 自定义校验函数
- `pattern`: 正则表达式

**易错点：** FormItem 未设置 `prop` 属性导致校验不生效。

---

### 4. Select 组件如何实现远程搜索？

**答案：**
```vue
<el-select
  v-model="value"
  filterable
  remote
  :remote-method="remoteSearch"
  :loading="loading"
>
  <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>

<script setup>
import { debounce } from 'lodash-es'

const remoteSearch = debounce((query) => {
  if (query) {
    loading.value = true
    api.search(query).then(data => {
      options.value = data
      loading.value = false
    })
  }
}, 300)
</script>
```

**易错点：** 未使用防抖导致频繁请求，影响性能。

---

### 5. Table 组件如何实现分页？

**答案：**
```vue
<el-table :data="tableData">
  <el-table-column prop="name" label="姓名" />
</el-table>

<el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :total="total"
  @current-change="handlePageChange"
/>

<script setup>
const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const fetchData = () => {
  api.getList({
    page: currentPage.value,
    size: pageSize.value
  }).then(res => {
    tableData.value = res.data
    total.value = res.total
  })
}
</script>
```

**易错点：** 切换页码后未重新请求数据。

---

### 6. DatePicker 如何禁用特定日期？

**答案：**
```vue
<el-date-picker
  v-model="date"
  :disabled-date="disabledDate"
/>

<script setup>
const disabledDate = (time) => {
  // 禁用今天之前的日期
  return time.getTime() < Date.now() - 8.64e7
}
</script>
```

**解析：**

`disabled-date` 接收一个函数，返回 true 表示禁用该日期。

常见场景：
- 禁用过去日期
- 禁用周末
- 禁用特定日期范围

**易错点：** 时区问题导致日期判断错误。

---

### 7. Upload 组件如何限制文件类型和大小？

**答案：**
```vue
<el-upload
  :before-upload="beforeUpload"
  accept=".jpg,.png"
>
  <el-button>上传文件</el-button>
</el-upload>

<script setup>
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}
</script>
```

**易错点：** 只依赖 `accept` 属性，未在 `before-upload` 中校验。

---

### 8. Dialog 对话框关闭后如何重置表单？

**答案：**
```vue
<el-dialog v-model="visible" @close="handleClose">
  <el-form ref="formRef" :model="form">
    <!-- 表单内容 -->
  </el-form>
</el-dialog>

<script setup>
const formRef = ref()

const handleClose = () => {
  formRef.value?.resetFields()
}
</script>
```

**易错点：** 未在 `@close` 事件中重置表单，导致下次打开时仍有旧数据。

---

### 9. 如何自定义 Table 列的显示内容？

**答案：**
```vue
<el-table :data="tableData">
  <el-table-column label="状态">
    <template #default="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </el-table-column>
</el-table>
```

**解析：**

使用插槽可以完全自定义列内容，常用于：
- 状态标签
- 操作按钮
- 图片展示
- 复杂格式化

---

### 10. Switch 组件如何绑定非布尔值？

**答案：**
```vue
<el-switch
  v-model="status"
  :active-value="1"
  :inactive-value="0"
/>

<script setup>
const status = ref(1) // 数字类型
</script>
```

**解析：**

使用 `active-value` 和 `inactive-value` 可以绑定任意类型的值。

**易错点：** 忘记设置这两个属性，导致值类型错误。

---

### 11. Cascader 级联选择器如何只选择最后一级？

**答案：**
```vue
<el-cascader
  v-model="value"
  :options="options"
  :props="{ checkStrictly: true }"
/>
```

**解析：**

设置 `checkStrictly: true` 后可以选择任意一级。

---

### 12. Message 消息提示如何避免重复弹出？

**答案：**
```ts
let messageInstance = null

const showMessage = (message) => {
  if (messageInstance) {
    messageInstance.close()
  }
  messageInstance = ElMessage.success(message)
}
```

**易错点：** 短时间内多次触发导致消息堆叠。

---

### 13. Table 如何实现多选功能？

**答案：**
```vue
<el-table
  :data="tableData"
  @selection-change="handleSelectionChange"
>
  <el-table-column type="selection" />
  <el-table-column prop="name" label="姓名" />
</el-table>

<script setup>
const handleSelectionChange = (selection) => {
  console.log('已选择：', selection)
}
</script>
```

---

### 14. 如何动态改变组件的尺寸？

**答案：**
```vue
<el-config-provider :size="size">
  <el-button>按钮</el-button>
  <el-input />
</el-config-provider>

<script setup>
const size = ref('default') // large/default/small
</script>
```

**解析：**

使用 `el-config-provider` 可以全局设置组件尺寸。

---

### 15. 如何获取 Table 当前选中的行？

**答案：**
```vue
<el-table ref="tableRef" :data="tableData">
  <el-table-column type="selection" />
</el-table>

<script setup>
const tableRef = ref()

const getSelection = () => {
  return tableRef.value?.getSelectionRows()
}
</script>
```

---

## 二、高级配置题（15 题）

### 16. 如何实现 Form 表单的动态校验规则？

**答案：**
```vue
<el-form :model="form" :rules="dynamicRules">
  <el-form-item prop="password">
    <el-input v-model="form.password" type="password" />
  </el-form-item>
  <el-form-item prop="confirmPassword">
    <el-input v-model="form.confirmPassword" type="password" />
  </el-form-item>
</el-form>

<script setup>
const validatePass = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const dynamicRules = computed(() => ({
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ]
}))
</script>
```

**实战建议：** 使用 computed 创建动态规则，可以根据表单状态调整校验逻辑。

---

### 17. Table 如何实现虚拟滚动优化大数据量渲染？

**答案：**

Element Plus 本身不直接支持虚拟滚动，需要配合第三方库：

```vue
<el-table
  :data="visibleData"
  height="400"
  @scroll="handleScroll"
>
  <el-table-column prop="name" />
</el-table>

<script setup>
import { useVirtualList } from '@vueuse/core'

const { list: visibleData } = useVirtualList(
  allData,
  { itemHeight: 50, overscan: 10 }
)
</script>
```

**实战建议：** 数据量超过 1000 条时考虑虚拟滚动。

---

### 18. 如何自定义 Upload 的上传逻辑？

**答案：**
```vue
<el-upload
  action="#"
  :http-request="customUpload"
  :before-upload="beforeUpload"
>
  <el-button>上传文件</el-button>
</el-upload>

<script setup>
const customUpload = async (options) => {
  const { file, onProgress, onSuccess, onError } = options
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await axios.post('/api/upload', formData, {
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / e.total)
        onProgress({ percent })
      }
    })
    onSuccess(response.data)
  } catch (error) {
    onError(error)
  }
}
</script>
```

**实战建议：** OSS 直传、分片上传都需要自定义上传逻辑。

---

### 19. Select 下拉框选项过多如何优化性能？

**答案：**

1. 使用虚拟滚动
2. 远程搜索+分页加载
3. 限制显示数量

```vue
<el-select
  v-model="value"
  filterable
  remote
  :remote-method="remoteSearch"
  :loading="loading"
>
  <el-option
    v-for="item in visibleOptions"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>

<script setup>
const visibleOptions = computed(() => {
  return allOptions.value.slice(0, 50) // 只显示前50个
})
</script>
```

**易错点：** 一次性渲染上千个选项导致页面卡顿。

---

### 20. Table 如何实现树形数据展示？

**答案：**
```vue
<el-table
  :data="treeData"
  row-key="id"
  :tree-props="{ children: 'children' }"
>
  <el-table-column prop="name" label="名称" />
</el-table>

<script setup>
const treeData = ref([
  {
    id: 1,
    name: '一级',
    children: [
      { id: 2, name: '二级' }
    ]
  }
])
</script>
```

**实战建议：** 树形数据需要指定 `row-key` 和 `tree-props`。

---

### 21. 如何实现 Table 列的拖拽排序？

**答案：**

需要配合 Sortable.js：

```vue
<el-table ref="tableRef" :data="tableData">
  <el-table-column prop="name" />
</el-table>

<script setup>
import Sortable from 'sortablejs'

onMounted(() => {
  const el = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody')
  Sortable.create(el, {
    onEnd: ({ oldIndex, newIndex }) => {
      const movedItem = tableData.value.splice(oldIndex, 1)[0]
      tableData.value.splice(newIndex, 0, movedItem)
    }
  })
})
</script>
```

---

### 22. Form 表单如何实现字段联动？

**答案：**
```vue
<el-form :model="form">
  <el-form-item label="国家">
    <el-select v-model="form.country" @change="handleCountryChange">
      <el-option label="中国" value="china" />
      <el-option label="美国" value="usa" />
    </el-select>
  </el-form-item>
  
  <el-form-item label="城市">
    <el-select v-model="form.city">
      <el-option
        v-for="city in cities"
        :key="city"
        :label="city"
        :value="city"
      />
    </el-select>
  </el-form-item>
</el-form>

<script setup>
const cities = ref([])

const handleCountryChange = (country) => {
  form.city = ''
  cities.value = country === 'china' 
    ? ['北京', '上海', '广州']
    : ['纽约', '洛杉矶', '芝加哥']
}
</script>
```

**易错点：** 联动时忘记清空下级字段的值。

---

### 23. 如何实现 Dialog 拖拽功能？

**答案：**
```vue
<el-dialog
  v-model="visible"
  draggable
  title="可拖拽对话框"
>
  内容
</el-dialog>
```

**解析：**

Element Plus 2.2.0+ 版本支持 `draggable` 属性。

早期版本需要自定义指令实现。

---

### 24. Table 如何实现单元格编辑？

**答案：**
```vue
<el-table :data="tableData">
  <el-table-column label="姓名">
    <template #default="{ row }">
      <el-input
        v-if="row.editing"
        v-model="row.name"
        @blur="row.editing = false"
      />
      <span v-else @dblclick="row.editing = true">
        {{ row.name }}
      </span>
    </template>
  </el-table-column>
</el-table>
```

**实战建议：** 双击进入编辑，失焦保存。

---

### 25. 如何实现 DatePicker 的快捷选项？

**答案：**
```vue
<el-date-picker
  v-model="date"
  type="daterange"
  :shortcuts="shortcuts"
/>

<script setup>
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]
</script>
```

---

### 26. Upload 如何实现大文件分片上传？

**答案：**
```ts
const chunkSize = 2 * 1024 * 1024 // 2MB

const uploadChunks = async (file) => {
  const chunks = Math.ceil(file.size / chunkSize)
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('index', i)
    formData.append('total', chunks)
    
    await axios.post('/api/upload-chunk', formData)
  }
  
  // 合并分片
  await axios.post('/api/merge-chunks', {
    filename: file.name,
    total: chunks
  })
}
```

**实战建议：** 大于 100MB 的文件建议分片上传。

---

### 27. 如何实现 Cascader 的懒加载？

**答案：**
```vue
<el-cascader
  :props="{
    lazy: true,
    lazyLoad: loadData
  }"
/>

<script setup>
const loadData = (node, resolve) => {
  const { level } = node
  
  setTimeout(() => {
    const nodes = Array.from({ length: level + 1 })
      .map((_, index) => ({
        value: index,
        label: `选项${index}`,
        leaf: level >= 2
      }))
    resolve(nodes)
  }, 500)
}
</script>
```

**实战建议：** 地区选择等层级深的数据适合懒加载。

---

### 28. Table 如何实现自定义筛选？

**答案：**
```vue
<el-table :data="tableData">
  <el-table-column
    prop="status"
    label="状态"
    :filters="[
      { text: '启用', value: 1 },
      { text: '禁用', value: 0 }
    ]"
    :filter-method="filterStatus"
  />
</el-table>

<script setup>
const filterStatus = (value, row) => {
  return row.status === value
}
</script>
```

---

### 29. 如何实现 Form 的异步校验？

**答案：**
```ts
const validateUsername = async (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
    return
  }
  
  try {
    const exists = await api.checkUsername(value)
    if (exists) {
      callback(new Error('用户名已存在'))
    } else {
      callback()
    }
  } catch {
    callback(new Error('校验失败'))
  }
}

const rules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ]
}
```

**易错点：** 频繁触发异步校验，需要加防抖。

---

### 30. 如何自定义 Table 的展开行内容？

**答案：**
```vue
<el-table :data="tableData">
  <el-table-column type="expand">
    <template #default="{ row }">
      <div class="expand-content">
        <p>详细信息：{{ row.detail }}</p>
      </div>
    </template>
  </el-table-column>
  <el-table-column prop="name" label="姓名" />
</el-table>
```

---

## 三、实战场景题（20 题）

### 31. 如何实现一个完整的 CRUD 表格页面？

**答案：**

```vue
<template>
  <div class="crud-page">
    <!-- 查询表单 -->
    <el-form :model="queryForm" inline>
      <el-form-item label="关键词">
        <el-input v-model="queryForm.keyword" placeholder="请输入" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 操作按钮 -->
    <el-button type="primary" @click="handleAdd">新增</el-button>
    <el-button type="danger" :disabled="!selection.length" @click="handleBatchDelete">
      批量删除
    </el-button>
    
    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      @selection-change="handleSelectionChange"
      v-loading="loading"
    >
      <el-table-column type="selection" />
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryForm.page"
      v-model:page-size="queryForm.size"
      :total="total"
      @current-change="fetchData"
    />
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selection = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const queryForm = reactive({
  keyword: '',
  page: 1,
  size: 10
})

const form = reactive({
  id: null,
  name: ''
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.getList(queryForm)
    tableData.value = res.data
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryForm.page = 1
  fetchData()
}

const handleReset = () => {
  queryForm.keyword = ''
  handleQuery()
}

const handleAdd = () => {
  dialogTitle.value = '新增'
  form.id = null
  form.name = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' })
    await api.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 项吗？`)
    await api.batchDelete(selection.value.map(item => item.id))
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

const handleSubmit = async () => {
  await formRef.value.validate()
  
  if (form.id) {
    await api.update(form)
  } else {
    await api.create(form)
  }
  
  ElMessage.success('保存成功')
  dialogVisible.value = false
  fetchData()
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

const handleSelectionChange = (val) => {
  selection.value = val
}

onMounted(() => {
  fetchData()
})
</script>
```

**关键点：**
1. 查询、重置、新增、编辑、删除功能齐全
2. 表格选择、分页、加载状态
3. 表单校验、对话框关闭重置

---

### 32. 如何实现一个复杂的筛选表单？

**答案：**

使用级联选择、日期范围、多选等组件组合：

```vue
<el-form :model="filters" inline>
  <el-form-item label="地区">
    <el-cascader
      v-model="filters.area"
      :options="areaOptions"
      clearable
    />
  </el-form-item>
  
  <el-form-item label="时间范围">
    <el-date-picker
      v-model="filters.dateRange"
      type="daterange"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    />
  </el-form-item>
  
  <el-form-item label="状态">
    <el-select v-model="filters.status" multiple clearable>
      <el-option label="启用" :value="1" />
      <el-option label="禁用" :value="0" />
    </el-select>
  </el-form-item>
  
  <el-form-item>
    <el-button type="primary" @click="handleSearch">搜索</el-button>
    <el-button @click="handleReset">重置</el-button>
  </el-form-item>
</el-form>
```

---

### 33. 多步骤表单如何实现？

**答案：**

使用 Steps 组件配合表单：

```vue
<el-steps :active="active" finish-status="success">
  <el-step title="基本信息" />
  <el-step title="详细信息" />
  <el-step title="确认提交" />
</el-steps>

<el-form v-show="active === 0" :model="form1">
  <!-- 第一步表单 -->
</el-form>

<el-form v-show="active === 1" :model="form2">
  <!-- 第二步表单 -->
</el-form>

<div v-show="active === 2">
  <!-- 确认信息 -->
</div>

<el-button v-if="active > 0" @click="active--">上一步</el-button>
<el-button v-if="active < 2" type="primary" @click="handleNext">下一步</el-button>
<el-button v-if="active === 2" type="success" @click="handleSubmit">提交</el-button>
```

**易错点：** 每一步都要校验表单，不能直接跳到下一步。

---

### 34. 如何实现权限管理的树形选择？

**答案：**

使用 Tree 组件：

```vue
<el-tree
  ref="treeRef"
  :data="permissions"
  show-checkbox
  node-key="id"
  :props="{ label: 'name', children: 'children' }"
  @check="handleCheck"
/>

<script setup>
const handleCheck = (data, checked) => {
  const checkedKeys = treeRef.value.getCheckedKeys()
  console.log('选中的权限：', checkedKeys)
}

const getCheckedPermissions = () => {
  return treeRef.value.getCheckedKeys(true) // true 表示只返回叶子节点
}
</script>
```

---

### 35. 如何实现表格数据导出 Excel？

**答案：**

使用 xlsx 库：

```ts
import * as XLSX from 'xlsx'

const exportExcel = () => {
  const data = tableData.value.map(row => ({
    '姓名': row.name,
    '年龄': row.age,
    '邮箱': row.email
  }))
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, '数据导出.xlsx')
}
```

**实战建议：** 大数据量导出需要后端处理。

---

### 36. 如何实现图片裁剪上传？

**答案：**

配合 cropperjs：

```vue
<el-upload
  :before-upload="beforeUpload"
  :show-file-list="false"
>
  <el-button>选择图片</el-button>
</el-upload>

<el-dialog v-model="cropperVisible">
  <div>
    <img ref="imageRef" :src="imageSrc" />
  </div>
  <template #footer>
    <el-button @click="cropperVisible = false">取消</el-button>
    <el-button type="primary" @click="handleCrop">确定</el-button>
  </template>
</el-dialog>

<script setup>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

let cropper = null
const imageRef = ref()
const imageSrc = ref('')
const cropperVisible = ref(false)

const beforeUpload = (file) => {
  imageSrc.value = URL.createObjectURL(file)
  cropperVisible.value = true
  
  nextTick(() => {
    cropper = new Cropper(imageRef.value, {
      aspectRatio: 1,
      viewMode: 1
    })
  })
  
  return false
}

const handleCrop = () => {
  cropper.getCroppedCanvas().toBlob(blob => {
    // 上传裁剪后的图片
    const formData = new FormData()
    formData.append('file', blob)
    api.upload(formData)
  })
  cropperVisible.value = false
}
</script>
```

---

### 37. 如何实现表格行拖拽排序？

**答案：**

使用 Sortable.js：

```vue
<el-table ref="tableRef" :data="tableData" row-key="id">
  <el-table-column label="排序" width="60">
    <template #default="{ $index }">
      {{ $index + 1 }}
    </template>
  </el-table-column>
  <el-table-column prop="name" label="名称" />
</el-table>

<script setup>
import Sortable from 'sortablejs'

onMounted(() => {
  const tbody = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody')
  
  Sortable.create(tbody, {
    handle: '.el-table__row',
    onEnd: ({ oldIndex, newIndex }) => {
      const row = tableData.value.splice(oldIndex, 1)[0]
      tableData.value.splice(newIndex, 0, row)
      
      // 保存新顺序到后端
      api.updateOrder(tableData.value.map((item, index) => ({
        id: item.id,
        sort: index
      })))
    }
  })
})
</script>
```

---

### 38. 如何实现动态表单？

**答案：**

```vue
<el-form :model="dynamicForm">
  <div v-for="(item, index) in dynamicForm.items" :key="index">
    <el-form-item
      :label="`联系人${index + 1}`"
      :prop="`items.${index}.name`"
      :rules="[{ required: true, message: '请输入姓名' }]"
    >
      <el-input v-model="item.name" style="width: 200px;" />
      <el-button @click="removeItem(index)" style="margin-left: 10px;">
        删除
      </el-button>
    </el-form-item>
  </div>
  
  <el-button @click="addItem">添加联系人</el-button>
</el-form>

<script setup>
const dynamicForm = reactive({
  items: [{ name: '' }]
})

const addItem = () => {
  dynamicForm.items.push({ name: '' })
}

const removeItem = (index) => {
  dynamicForm.items.splice(index, 1)
}
</script>
```

**易错点：** 动态表单项的校验规则要使用数组索引。

---

### 39. 如何实现表格合并单元格？

**答案：**

```vue
<el-table :data="tableData" :span-method="spanMethod">
  <el-table-column prop="name" label="姓名" />
  <el-table-column prop="department" label="部门" />
</el-table>

<script setup>
const spanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 1) {
    // 部门列合并
    if (rowIndex % 2 === 0) {
      return {
        rowspan: 2,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }
}
</script>
```

---

### 40. 如何实现表单的自动保存草稿？

**答案：**

使用 watch 和 debounce：

```vue
<el-form :model="form">
  <el-form-item label="标题">
    <el-input v-model="form.title" />
  </el-form-item>
  <el-form-item label="内容">
    <el-input v-model="form.content" type="textarea" />
  </el-form-item>
</el-form>

<script setup>
import { watchDebounced } from '@vueuse/core'

const form = reactive({
  title: '',
  content: ''
})

// 从本地存储恢复草稿
onMounted(() => {
  const draft = localStorage.getItem('form-draft')
  if (draft) {
    Object.assign(form, JSON.parse(draft))
  }
})

// 自动保存草稿（防抖）
watchDebounced(
  form,
  (value) => {
    localStorage.setItem('form-draft', JSON.stringify(value))
    ElMessage.success('草稿已自动保存')
  },
  { debounce: 1000, deep: true }
)
</script>
```

---

### 41. 如何实现 Table 的列可见性控制？

**答案：**

```vue
<el-dropdown>
  <el-button>列设置</el-button>
  <template #dropdown>
    <el-dropdown-menu>
      <el-dropdown-item v-for="col in columns" :key="col.prop">
        <el-checkbox v-model="col.visible">{{ col.label }}</el-checkbox>
      </el-dropdown-item>
    </el-dropdown-menu>
  </template>
</el-dropdown>

<el-table :data="tableData">
  <el-table-column
    v-for="col in visibleColumns"
    :key="col.prop"
    :prop="col.prop"
    :label="col.label"
  />
</el-table>

<script setup>
const columns = reactive([
  { prop: 'name', label: '姓名', visible: true },
  { prop: 'age', label: '年龄', visible: true },
  { prop: 'email', label: '邮箱', visible: false }
])

const visibleColumns = computed(() => {
  return columns.filter(col => col.visible)
})
</script>
```

---

### 42. 如何实现表单联动校验？

**答案：**

```vue
<el-form :model="form" :rules="rules" ref="formRef">
  <el-form-item label="最小值" prop="min">
    <el-input-number v-model="form.min" />
  </el-form-item>
  
  <el-form-item label="最大值" prop="max">
    <el-input-number v-model="form.max" />
  </el-form-item>
</el-form>

<script setup>
const validateMax = (rule, value, callback) => {
  if (value < form.min) {
    callback(new Error('最大值不能小于最小值'))
  } else {
    callback()
  }
}

const rules = {
  min: [{ required: true, message: '请输入最小值' }],
  max: [
    { required: true, message: '请输入最大值' },
    { validator: validateMax, trigger: 'blur' }
  ]
}

// 最小值改变时重新校验最大值
watch(() => form.min, () => {
  formRef.value?.validateField('max')
})
</script>
```

---

### 43. 如何实现 Upload 的断点续传？

**答案：**

```ts
interface UploadState {
  file: File
  uploadedChunks: Set<number>
}

const uploadStates = new Map<string, UploadState>()

const resumableUpload = async (file: File) => {
  const fileId = generateFileId(file)
  
  // 恢复上传状态
  let state = uploadStates.get(fileId)
  if (!state) {
    state = {
      file,
      uploadedChunks: new Set()
    }
    uploadStates.set(fileId, state)
  }
  
  const chunkSize = 2 * 1024 * 1024
  const totalChunks = Math.ceil(file.size / chunkSize)
  
  for (let i = 0; i < totalChunks; i++) {
    if (state.uploadedChunks.has(i)) continue
    
    const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize)
    
    try {
      await uploadChunk(fileId, i, chunk)
      state.uploadedChunks.add(i)
    } catch (error) {
      console.error(`分片 ${i} 上传失败`)
      break
    }
  }
  
  if (state.uploadedChunks.size === totalChunks) {
    await mergeChunks(fileId)
    uploadStates.delete(fileId)
  }
}

const generateFileId = (file: File) => {
  return `${file.name}_${file.size}_${file.lastModified}`
}
```

---

### 44. 如何实现表格的固定表头和列？

**答案：**

```vue
<el-table
  :data="tableData"
  height="400"
  style="width: 100%"
>
  <!-- 固定左侧列 -->
  <el-table-column
    prop="id"
    label="ID"
    width="80"
    fixed="left"
  />
  
  <!-- 普通列 -->
  <el-table-column prop="name" label="姓名" width="120" />
  <el-table-column prop="description" label="描述" width="300" />
  
  <!-- 固定右侧列（操作列） -->
  <el-table-column
    label="操作"
    width="150"
    fixed="right"
  >
    <template #default="{ row }">
      <el-button size="small">编辑</el-button>
      <el-button size="small" type="danger">删除</el-button>
    </template>
  </el-table-column>
</el-table>
```

**关键点：** 设置 `height` 属性启用固定表头，使用 `fixed` 属性固定列。

---

### 45. 如何实现 Select 的全选功能？

**答案：**

```vue
<el-select v-model="selected" multiple>
  <el-option label="全选" value="all" @click="handleSelectAll" />
  <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>

<script setup>
const selected = ref([])
const options = ref([
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' }
])

const handleSelectAll = () => {
  if (selected.value.length === options.value.length) {
    selected.value = []
  } else {
    selected.value = options.value.map(item => item.value)
  }
}

watch(selected, (val) => {
  // 移除"全选"选项
  if (val.includes('all')) {
    selected.value = val.filter(v => v !== 'all')
  }
})
</script>
```

---

### 46. 如何实现表单的条件显示？

**答案：**

```vue
<el-form :model="form">
  <el-form-item label="用户类型">
    <el-radio-group v-model="form.userType">
      <el-radio label="个人">个人</el-radio>
      <el-radio label="企业">企业</el-radio>
    </el-radio-group>
  </el-form-item>
  
  <!-- 个人用户显示 -->
  <el-form-item v-if="form.userType === '个人'" label="身份证号">
    <el-input v-model="form.idCard" />
  </el-form-item>
  
  <!-- 企业用户显示 -->
  <template v-if="form.userType === '企业'">
    <el-form-item label="企业名称">
      <el-input v-model="form.companyName" />
    </el-form-item>
    <el-form-item label="统一社会信用代码">
      <el-input v-model="form.creditCode" />
    </el-form-item>
  </template>
</el-form>
```

**易错点：** 切换类型时要清空隐藏字段的值。

---

### 47. 如何实现 Table 的汇总行？

**答案：**

```vue
<el-table
  :data="tableData"
  show-summary
  :summary-method="getSummaries"
>
  <el-table-column prop="name" label="商品" />
  <el-table-column prop="quantity" label="数量" />
  <el-table-column prop="price" label="单价" />
  <el-table-column prop="amount" label="金额" />
</el-table>

<script setup>
const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []
  
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    
    const values = data.map(item => Number(item[column.property]))
    
    if (!values.every(value => Number.isNaN(value))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!Number.isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)
    } else {
      sums[index] = '-'
    }
  })
  
  return sums
}
</script>
```

---

### 48. 如何实现上传进度条？

**答案：**

```vue
<el-upload
  :action="uploadUrl"
  :on-progress="handleProgress"
  :file-list="fileList"
>
  <el-button>上传文件</el-button>
</el-upload>

<div v-for="file in fileList" :key="file.uid" class="file-item">
  <span>{{ file.name }}</span>
  <el-progress
    :percentage="file.percentage"
    :status="file.status === 'success' ? 'success' : undefined"
  />
</div>

<script setup>
const handleProgress = (event, file, fileList) => {
  file.percentage = Math.round(event.percent)
}
</script>
```

---

### 49. 如何实现 Table 的行内编辑并保存？

**答案：**

```vue
<el-table :data="tableData">
  <el-table-column label="姓名">
    <template #default="{ row }">
      <el-input
        v-if="row.editing"
        v-model="row.name"
        @keyup.enter="handleSave(row)"
        @blur="handleCancel(row)"
      />
      <span v-else @dblclick="handleEdit(row)">{{ row.name }}</span>
    </template>
  </el-table-column>
  
  <el-table-column label="操作">
    <template #default="{ row }">
      <el-button v-if="row.editing" size="small" @click="handleSave(row)">
        保存
      </el-button>
      <el-button v-if="row.editing" size="small" @click="handleCancel(row)">
        取消
      </el-button>
      <el-button v-else size="small" @click="handleEdit(row)">
        编辑
      </el-button>
    </template>
  </el-table-column>
</el-table>

<script setup>
const handleEdit = (row) => {
  row.originalName = row.name // 保存原始值
  row.editing = true
}

const handleSave = async (row) => {
  await api.update(row)
  row.editing = false
  delete row.originalName
  ElMessage.success('保存成功')
}

const handleCancel = (row) => {
  row.name = row.originalName // 恢复原始值
  row.editing = false
  delete row.originalName
}
</script>
```

---

### 50. 如何优化大表单的性能？

**答案：**

1. **使用虚拟滚动**（表单项过多时）
2. **分步加载**（使用 Steps 组件）
3. **懒加载校验**（只校验可见字段）
4. **防抖处理**（异步校验加防抖）

```vue
<el-form :model="form" :rules="rules">
  <!-- 使用 v-show 而不是 v-if，避免重新渲染 -->
  <div v-show="currentStep === 0">
    <el-form-item prop="field1">
      <el-input v-model="form.field1" />
    </el-form-item>
    <!-- 更多字段 -->
  </div>
  
  <div v-show="currentStep === 1">
    <el-form-item prop="field2">
      <el-input v-model="form.field2" />
    </el-form-item>
    <!-- 更多字段 -->
  </div>
</el-form>

<script setup>
// 只校验当前步骤的字段
const validateStep = async (step) => {
  const fieldsToValidate = stepFields[step]
  await formRef.value.validateField(fieldsToValidate)
}
</script>
```

**优化建议：**
- 表单项超过 50 个考虑分步
- 异步校验必须加防抖
- 使用 `v-show` 而不是 `v-if` 保留 DOM
- 大数据量的 Select 使用远程搜索

---

## 总结

Element Plus 面试题涵盖了从基础使用到高级配置再到实战场景的全方位内容。重点掌握：

**基础篇：**
- 安装配置、国际化
- 表单校验、组件基础用法

**高级篇：**
- 自定义上传、虚拟滚动
- 动态表单、异步校验
- 组件性能优化

**实战篇：**
- CRUD 页面完整实现
- 复杂业务场景处理
- 性能优化最佳实践

记住：实际开发中要结合业务场景，不要为了使用组件而使用，选择最合适的方案才是最优解。
