# 输入类组件

## 概述

Input、InputNumber 和 Autocomplete 是表单中最常用的输入组件。掌握这些组件的高级用法对于提升用户体验至关重要。

---

## Input 输入框

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 类型 | string (text/textarea/password/number等) | text |
| modelValue / v-model | 绑定值 | string/number | - |
| maxlength | 最大输入长度 | number | - |
| minlength | 最小输入长度 | number | - |
| show-word-limit | 显示字数统计 | boolean | false |
| placeholder | 占位文本 | string | - |
| clearable | 是否可清空 | boolean | false |
| show-password | 是否显示密码切换按钮 | boolean | false |
| disabled | 是否禁用 | boolean | false |
| size | 尺寸 | string (large/default/small) | default |
| prefix-icon | 前缀图标 | Component | - |
| suffix-icon | 后缀图标 | Component | - |
| rows | textarea 行数 | number | 2 |
| autosize | textarea 自适应高度 | boolean/object | false |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| input | 输入时触发 | (value: string \| number) |
| change | 值改变时触发 | (value: string \| number) |
| blur | 失去焦点时触发 | (event: FocusEvent) |
| focus | 获得焦点时触发 | (event: FocusEvent) |
| clear | 点击清空按钮时触发 | - |

---

## InputNumber 数字输入框

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | number | - |
| min | 最小值 | number | -Infinity |
| max | 最大值 | number | Infinity |
| step | 步长 | number | 1 |
| precision | 数值精度 | number | - |
| controls | 是否显示控制按钮 | boolean | true |
| controls-position | 控制按钮位置 | string (right) | - |

---

## Autocomplete 自动补全

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | string | - |
| fetch-suggestions | 返回建议列表的方法 | Function(queryString, callback) | - |
| trigger-on-focus | 获得焦点时是否触发建议 | boolean | true |
| select-when-unmatched | 输入框为空时选中建议 | boolean | false |

---

## 完整样例一：搜索框与防抖

### 效果描述
实现一个搜索框，支持实时搜索、防抖优化、搜索历史等功能。

### 完整代码

```vue
<template>
  <div class="search-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">智能搜索框</h3>
      </template>
      
      <!-- 基础搜索框 -->
      <el-input
        v-model="searchText"
        placeholder="请输入关键词搜索"
        clearable
        :prefix-icon="Search"
        @input="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearchClick">搜索</el-button>
        </template>
      </el-input>
      
      <el-divider />
      
      <!-- 带自动补全的搜索框 -->
      <el-autocomplete
        v-model="autoSearchText"
        :fetch-suggestions="querySearch"
        placeholder="请输入关键词（支持自动补全）"
        clearable
        :prefix-icon="Search"
        @select="handleSelect"
        style="width: 100%;"
      >
        <template #default="{ item }">
          <div class="autocomplete-item">
            <el-icon><Document /></el-icon>
            <span class="name">{{ item.value }}</span>
            <span class="count">约 {{ item.count }} 个结果</span>
          </div>
        </template>
      </el-autocomplete>
      
      <el-divider />
      
      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="search-history">
        <div class="history-header">
          <el-text type="info" size="small">搜索历史</el-text>
          <el-button text size="small" @click="clearHistory">清空</el-button>
        </div>
        <el-space wrap>
          <el-tag
            v-for="(item, index) in searchHistory"
            :key="index"
            closable
            @close="removeHistory(index)"
            @click="searchText = item"
            style="cursor: pointer;"
          >
            {{ item }}
          </el-tag>
        </el-space>
      </div>
      
      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <el-divider content-position="left">搜索结果</el-divider>
        <div v-for="result in searchResults" :key="result.id" class="result-item">
          <el-text type="primary">{{ result.title }}</el-text>
          <el-text type="info" size="small" tag="div" style="margin-top: 5px;">
            {{ result.description }}
          </el-text>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'

interface SearchResult {
  id: number
  title: string
  description: string
}

interface Suggestion {
  value: string
  count: number
}

const searchText = ref('')
const autoSearchText = ref('')
const searchHistory = ref<string[]>([])
const searchResults = ref<SearchResult[]>([])

// 模拟搜索建议数据
const suggestions: Suggestion[] = [
  { value: 'Element Plus', count: 12000 },
  { value: 'Element UI', count: 8000 },
  { value: 'Vue 3', count: 15000 },
  { value: 'Vue Router', count: 9000 },
  { value: 'Vite', count: 11000 },
  { value: 'TypeScript', count: 20000 },
]

// 模拟搜索结果数据
const mockResults: SearchResult[] = [
  { id: 1, title: 'Element Plus 官方文档', description: 'Element Plus 是基于 Vue 3 的组件库...' },
  { id: 2, title: 'Element Plus 快速上手', description: '本文介绍如何快速使用 Element Plus...' },
  { id: 3, title: 'Element Plus 组件详解', description: '深入学习 Element Plus 各个组件的使用...' },
]

// 防抖搜索
const handleSearch = debounce((value: string) => {
  if (value.trim()) {
    console.log('正在搜索:', value)
    // 模拟搜索
    searchResults.value = mockResults.filter(item =>
      item.title.toLowerCase().includes(value.toLowerCase())
    )
  } else {
    searchResults.value = []
  }
}, 500)

// 点击搜索按钮
const handleSearchClick = () => {
  if (!searchText.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  // 添加到搜索历史
  if (!searchHistory.value.includes(searchText.value)) {
    searchHistory.value.unshift(searchText.value)
    if (searchHistory.value.length > 5) {
      searchHistory.value.pop()
    }
  }
  
  ElMessage.success(`搜索: ${searchText.value}`)
  handleSearch(searchText.value)
}

// 自动补全查询
const querySearch = (queryString: string, cb: (suggestions: Suggestion[]) => void) => {
  const results = queryString
    ? suggestions.filter(item =>
        item.value.toLowerCase().includes(queryString.toLowerCase())
      )
    : suggestions
  
  cb(results)
}

// 选择建议
const handleSelect = (item: Suggestion) => {
  ElMessage.success(`选择: ${item.value}`)
  searchResults.value = mockResults
}

// 清空历史
const clearHistory = () => {
  searchHistory.value = []
  ElMessage.info('已清空搜索历史')
}

// 删除历史项
const removeHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
}
</script>

<style scoped>
.search-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.autocomplete-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.autocomplete-item .name {
  flex: 1;
}

.autocomplete-item .count {
  font-size: 12px;
  color: #909399;
}

.search-history {
  margin-top: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.search-results {
  margin-top: 20px;
}

.result-item {
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.result-item:hover {
  background-color: #e6e8eb;
}
</style>
```

---

## 完整样例二：金额输入框

### 效果描述
实现一个专业的金额输入框，支持千分位格式化、小数精度控制等。

### 完整代码

```vue
<template>
  <div class="money-input-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">金额输入框</h3>
      </template>
      
      <el-form :model="moneyForm" label-width="120px">
        <!-- 基础数字输入 -->
        <el-form-item label="基础金额">
          <el-input-number
            v-model="moneyForm.basicAmount"
            :min="0"
            :max="999999"
            :precision="2"
            :step="100"
            controls-position="right"
          />
        </el-form-item>
        
        <!-- 格式化金额输入 -->
        <el-form-item label="格式化金额">
          <el-input
            v-model="formattedAmount"
            placeholder="请输入金额"
            @input="handleAmountInput"
            @blur="handleAmountBlur"
          >
            <template #prepend>¥</template>
          </el-input>
          <el-text type="info" size="small" style="margin-top: 5px; display: block;">
            实际值: {{ moneyForm.amount }}
          </el-text>
        </el-form-item>
        
        <!-- 范围金额输入 -->
        <el-form-item label="价格区间">
          <el-space>
            <el-input-number
              v-model="moneyForm.minPrice"
              :min="0"
              :precision="2"
              placeholder="最低价"
            />
            <span>-</span>
            <el-input-number
              v-model="moneyForm.maxPrice"
              :min="moneyForm.minPrice"
              :precision="2"
              placeholder="最高价"
            />
          </el-space>
        </el-form-item>
        
        <!-- 百分比输入 -->
        <el-form-item label="折扣率">
          <el-input-number
            v-model="moneyForm.discount"
            :min="0"
            :max="100"
            :precision="1"
            :step="0.1"
          >
            <template #suffix>%</template>
          </el-input-number>
        </el-form-item>
        
        <!-- 计算结果 -->
        <el-form-item label="折后价">
          <el-text type="danger" size="large">
            ¥{{ discountedPrice }}
          </el-text>
        </el-form-item>
        
        <el-divider />
        
        <!-- 商品价格表单 -->
        <el-form-item label="商品名称">
          <el-input v-model="moneyForm.productName" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="原价">
          <el-input-number
            v-model="moneyForm.originalPrice"
            :min="0"
            :precision="2"
            :step="10"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="数量">
          <el-input-number
            v-model="moneyForm.quantity"
            :min="1"
            :max="9999"
            :step="1"
          />
        </el-form-item>
        
        <el-form-item label="总价">
          <el-text type="danger" size="large">
            ¥{{ totalPrice }}
          </el-text>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const moneyForm = reactive({
  basicAmount: 100,
  amount: 0,
  minPrice: 0,
  maxPrice: 1000,
  discount: 8.5,
  productName: '',
  originalPrice: 999,
  quantity: 1,
})

const formattedAmount = ref('')

// 格式化金额（添加千分位）
const formatMoney = (value: number): string => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 解析金额（移除千分位）
const parseMoney = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0
}

// 处理金额输入
const handleAmountInput = (value: string) => {
  // 只允许数字、小数点和逗号
  const cleaned = value.replace(/[^\d.,]/g, '')
  formattedAmount.value = cleaned
}

// 失去焦点时格式化
const handleAmountBlur = () => {
  const value = parseMoney(formattedAmount.value)
  moneyForm.amount = value
  formattedAmount.value = formatMoney(value)
}

// 计算折后价
const discountedPrice = computed(() => {
  const price = moneyForm.basicAmount * (moneyForm.discount / 100)
  return formatMoney(price)
})

// 计算总价
const totalPrice = computed(() => {
  const total = moneyForm.originalPrice * moneyForm.quantity
  return formatMoney(total)
})
</script>

<style scoped>
.money-input-demo {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.el-input-number {
  width: 100%;
}
</style>
```

---

## 完整样例三：文本域与字数统计

### 效果描述
实现多行文本输入，支持字数统计、自适应高度、表情输入等功能。

### 完整代码

```vue
<template>
  <div class="textarea-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">文本域示例</h3>
      </template>
      
      <el-form :model="textForm" label-width="100px">
        <!-- 基础文本域 -->
        <el-form-item label="简介">
          <el-input
            v-model="textForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入简介"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 自适应高度 -->
        <el-form-item label="详细描述">
          <el-input
            v-model="textForm.detail"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="请输入详细描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 评论输入框 -->
        <el-form-item label="发表评论">
          <el-input
            v-model="textForm.comment"
            type="textarea"
            :rows="4"
            placeholder="说点什么吧..."
            maxlength="300"
            show-word-limit
          >
          </el-input>
          <div class="comment-actions">
            <el-space>
              <el-button size="small" :icon="PictureFilled">图片</el-button>
              <el-button size="small" :icon="VideoCamera">视频</el-button>
              <el-button size="small">@提及</el-button>
            </el-space>
            <el-button type="primary" size="small" @click="handleSubmitComment">
              发表
            </el-button>
          </div>
        </el-form-item>
        
        <el-divider />
        
        <!-- 富文本输入（简化版） -->
        <el-form-item label="文章内容">
          <div class="rich-text-editor">
            <div class="editor-toolbar">
              <el-space>
                <el-button size="small" text>粗体</el-button>
                <el-button size="small" text>斜体</el-button>
                <el-button size="small" text>下划线</el-button>
                <el-divider direction="vertical" />
                <el-button size="small" text>标题</el-button>
                <el-button size="small" text>列表</el-button>
                <el-button size="small" text>链接</el-button>
              </el-space>
            </div>
            <el-input
              v-model="textForm.article"
              type="textarea"
              :autosize="{ minRows: 8 }"
              placeholder="开始创作..."
            />
          </div>
        </el-form-item>
        
        <!-- 预览 -->
        <el-form-item label="内容预览" v-if="textForm.article">
          <el-card>
            <pre style="white-space: pre-wrap; word-wrap: break-word;">{{ textForm.article }}</pre>
          </el-card>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { PictureFilled, VideoCamera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const textForm = reactive({
  description: '',
  detail: '',
  comment: '',
  article: '',
})

const handleSubmitComment = () => {
  if (!textForm.comment.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  ElMessage.success('评论发表成功')
  textForm.comment = ''
}
</script>

<style scoped>
.textarea-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 10px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

.rich-text-editor :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
}
</style>
```

---

## 常见踩坑

### 1. InputNumber 精度问题

**问题**：输入 0.1 + 0.2 显示 0.30000000000000004

**解决方案**：
```vue
<el-input-number
  v-model="value"
  :precision="2"  <!-- 设置精度 -->
/>
```

### 2. Input 双向绑定失效

**问题**：使用 number 类型时 v-model 不更新

**解决方案**：
```vue
<!-- ❌ 错误 -->
<el-input v-model="form.age" type="number" />

<!-- ✅ 正确：使用 v-model.number -->
<el-input v-model.number="form.age" type="number" />

<!-- ✅ 或使用 InputNumber -->
<el-input-number v-model="form.age" />
```

### 3. 防抖导致最后一次输入丢失

**问题**：使用防抖后最后一次输入未触发

**解决方案**：
```ts
import { debounce } from 'lodash-es'

// 在 blur 事件中立即触发
const debouncedSearch = debounce((value) => {
  doSearch(value)
}, 500)

const handleInput = (value: string) => {
  debouncedSearch(value)
}

const handleBlur = () => {
  debouncedSearch.flush() // 立即执行
}
```

### 4. Textarea 高度计算不准确

**问题**：autosize 高度计算错误

**解决方案**：
```ts
// 延迟初始化或强制更新
import { nextTick } from 'vue'

nextTick(() => {
  // DOM 更新后再设置值
  textForm.value = '...'
})
```

---

## 最佳实践

### 1. 输入框防抖

```ts
import { debounce } from 'lodash-es'

const handleInput = debounce((value: string) => {
  // 处理逻辑
}, 300)
```

### 2. 金额格式化

```ts
// 格式化显示
const formatMoney = (value: number) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 解析输入
const parseMoney = (value: string) => {
  return parseFloat(value.replace(/,/g, '')) || 0
}
```

### 3. 表单验证集成

```vue
<el-form-item label="金额" prop="amount">
  <el-input-number
    v-model="form.amount"
    :min="0"
    :precision="2"
  />
</el-form-item>
```

### 4. 自动聚焦

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const inputRef = ref()

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <el-input ref="inputRef" />
</template>
```

---

## 参考资料

- [Element Plus Input 输入框](https://element-plus.org/zh-CN/component/input.html)
- [Element Plus InputNumber 数字输入框](https://element-plus.org/zh-CN/component/input-number.html)
- [Element Plus Autocomplete 自动补全](https://element-plus.org/zh-CN/component/autocomplete.html)

---

## 下一步

继续学习选择类组件：[选择类组件](./content-8.md)
