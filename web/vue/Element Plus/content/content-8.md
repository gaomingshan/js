# 选择类组件

## 概述

Select 和 Cascader 是表单中常用的选择组件。Select 用于单选或多选，Cascader 用于级联选择。掌握这些组件的高级用法对于处理复杂数据选择场景至关重要。

---

## Select 选择器

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | string/number/boolean/object/array | - |
| multiple | 是否多选 | boolean | false |
| disabled | 是否禁用 | boolean | false |
| clearable | 是否可清空 | boolean | false |
| filterable | 是否可搜索 | boolean | false |
| remote | 是否远程搜索 | boolean | false |
| remote-method | 远程搜索方法 | Function | - |
| loading | 是否加载中 | boolean | false |
| placeholder | 占位符 | string | 请选择 |
| multiple-limit | 多选时最多选择个数 | number | 0 (不限制) |
| collapse-tags | 多选时是否折叠标签 | boolean | false |
| collapse-tags-tooltip | 折叠标签时是否显示提示 | boolean | false |

### Option 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 选项值 | string/number/boolean/object | - |
| label | 选项标签 | string/number | - |
| disabled | 是否禁用 | boolean | false |

---

## Cascader 级联选择器

### 核心属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 绑定值 | array | - |
| options | 可选项数据源 | array | - |
| props | 配置选项 | object | - |
| clearable | 是否可清空 | boolean | false |
| filterable | 是否可搜索 | boolean | false |
| show-all-levels | 是否显示完整路径 | boolean | true |

### Props 配置

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 指定选项的值为选项对象的某个属性值 | string | 'value' |
| label | 指定选项标签为选项对象的某个属性值 | string | 'label' |
| children | 指定选项的子选项为选项对象的某个属性值 | string | 'children' |
| disabled | 指定选项的禁用为选项对象的某个属性值 | string | 'disabled' |
| multiple | 是否多选 | boolean | false |
| checkStrictly | 是否严格的遵守父子节点不互相关联 | boolean | false |

---

## 完整样例一：商品分类选择

### 效果描述
实现商品分类的单选、多选、分组选择等功能。

### 完整代码

```vue
<template>
  <div class="select-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">商品分类选择</h3>
      </template>
      
      <el-form :model="selectForm" label-width="120px">
        <!-- 基础单选 -->
        <el-form-item label="商品分类">
          <el-select
            v-model="selectForm.category"
            placeholder="请选择商品分类"
            clearable
          >
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 多选 -->
        <el-form-item label="商品标签">
          <el-select
            v-model="selectForm.tags"
            multiple
            placeholder="请选择标签（最多3个）"
            :multiple-limit="3"
            clearable
          >
            <el-option
              v-for="item in tags"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 多选折叠标签 -->
        <el-form-item label="商品属性">
          <el-select
            v-model="selectForm.attributes"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择商品属性"
            clearable
          >
            <el-option
              v-for="item in attributes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 分组选择 -->
        <el-form-item label="品牌">
          <el-select
            v-model="selectForm.brand"
            placeholder="请选择品牌"
            clearable
          >
            <el-option-group
              v-for="group in brandGroups"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        
        <!-- 可搜索 -->
        <el-form-item label="供应商">
          <el-select
            v-model="selectForm.supplier"
            filterable
            placeholder="请输入关键词搜索"
            clearable
          >
            <el-option
              v-for="item in suppliers"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span style="float: left">{{ item.label }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ item.address }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 禁用选项 -->
        <el-form-item label="配送方式">
          <el-select
            v-model="selectForm.delivery"
            placeholder="请选择配送方式"
          >
            <el-option
              v-for="item in deliveryMethods"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
        
        <!-- 选中值展示 -->
        <el-divider />
        <el-form-item label="选中结果">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="分类">
              {{ selectForm.category || '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="标签">
              {{ selectForm.tags.join(', ') || '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="属性">
              {{ selectForm.attributes.join(', ') || '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="品牌">
              {{ selectForm.brand || '未选择' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const selectForm = reactive({
  category: '',
  tags: [] as string[],
  attributes: [] as string[],
  brand: '',
  supplier: '',
  delivery: '',
})

const categories = [
  { value: 'electronics', label: '数码电器' },
  { value: 'clothing', label: '服装鞋包' },
  { value: 'food', label: '食品生鲜' },
  { value: 'books', label: '图书音像' },
  { value: 'sports', label: '运动户外' },
]

const tags = [
  { value: 'hot', label: '热销' },
  { value: 'new', label: '新品' },
  { value: 'discount', label: '促销' },
  { value: 'recommend', label: '推荐' },
  { value: 'limited', label: '限量' },
]

const attributes = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'bluetooth', label: '蓝牙' },
  { value: 'waterproof', label: '防水' },
  { value: 'dustproof', label: '防尘' },
  { value: 'shockproof', label: '防震' },
  { value: 'touchscreen', label: '触摸屏' },
]

const brandGroups = [
  {
    label: '国际品牌',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'samsung', label: 'Samsung' },
      { value: 'sony', label: 'Sony' },
    ],
  },
  {
    label: '国内品牌',
    options: [
      { value: 'huawei', label: '华为' },
      { value: 'xiaomi', label: '小米' },
      { value: 'oppo', label: 'OPPO' },
    ],
  },
]

const suppliers = [
  { value: 'supplier1', label: '供应商A', address: '北京' },
  { value: 'supplier2', label: '供应商B', address: '上海' },
  { value: 'supplier3', label: '供应商C', address: '广州' },
  { value: 'supplier4', label: '供应商D', address: '深圳' },
]

const deliveryMethods = [
  { value: 'express', label: '快递配送' },
  { value: 'pickup', label: '到店自提' },
  { value: 'same-day', label: '当日达', disabled: true },
  { value: 'next-day', label: '次日达', disabled: true },
]
</script>

<style scoped>
.select-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.el-select {
  width: 100%;
}
</style>
```

---

## 完整样例二：远程搜索优化

### 效果描述
实现远程搜索功能，支持防抖、加载状态、无数据提示等。

### 完整代码

```vue
<template>
  <div class="remote-search-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">远程搜索示例</h3>
      </template>
      
      <el-form :model="remoteForm" label-width="100px">
        <!-- 远程搜索用户 -->
        <el-form-item label="选择用户">
          <el-select
            v-model="remoteForm.userId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入用户名搜索"
            :remote-method="remoteSearchUser"
            :loading="userLoading"
            clearable
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="user-option">
                <el-avatar :size="30" :src="item.avatar" />
                <div class="user-info">
                  <div>{{ item.label }}</div>
                  <div class="user-email">{{ item.email }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 远程搜索商品 -->
        <el-form-item label="选择商品">
          <el-select
            v-model="remoteForm.productId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入商品名称搜索"
            :remote-method="remoteSearchProduct"
            :loading="productLoading"
            clearable
            @change="handleProductChange"
          >
            <template #empty>
              <div class="empty-state">
                <el-icon :size="40" color="#909399">
                  <Box />
                </el-icon>
                <div>暂无商品数据</div>
              </div>
            </template>
            <el-option
              v-for="item in productOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="product-option">
                <img :src="item.image" class="product-image" />
                <div class="product-info">
                  <div>{{ item.label }}</div>
                  <div class="product-price">¥{{ item.price }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 选中商品详情 -->
        <el-form-item label="商品详情" v-if="selectedProduct">
          <el-card>
            <div class="product-detail">
              <img :src="selectedProduct.image" class="detail-image" />
              <div class="detail-info">
                <h4>{{ selectedProduct.label }}</h4>
                <el-text type="danger" size="large">¥{{ selectedProduct.price }}</el-text>
                <el-text type="info" size="small" tag="div" style="margin-top: 10px;">
                  库存：{{ selectedProduct.stock }}
                </el-text>
              </div>
            </div>
          </el-card>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { debounce } from 'lodash-es'
import { Box } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface UserOption {
  value: string
  label: string
  email: string
  avatar: string
}

interface ProductOption {
  value: string
  label: string
  price: number
  image: string
  stock: number
}

const remoteForm = reactive({
  userId: '',
  productId: '',
})

const userLoading = ref(false)
const productLoading = ref(false)
const userOptions = ref<UserOption[]>([])
const productOptions = ref<ProductOption[]>([])
const selectedProduct = ref<ProductOption | null>(null)

// 模拟用户数据
const mockUsers: UserOption[] = [
  { value: '1', label: '张三', email: 'zhangsan@example.com', avatar: 'https://via.placeholder.com/30' },
  { value: '2', label: '李四', email: 'lisi@example.com', avatar: 'https://via.placeholder.com/30' },
  { value: '3', label: '王五', email: 'wangwu@example.com', avatar: 'https://via.placeholder.com/30' },
  { value: '4', label: '赵六', email: 'zhaoliu@example.com', avatar: 'https://via.placeholder.com/30' },
]

// 模拟商品数据
const mockProducts: ProductOption[] = [
  { value: '1', label: 'iPhone 15 Pro', price: 7999, stock: 100, image: 'https://via.placeholder.com/60' },
  { value: '2', label: 'MacBook Pro', price: 12999, stock: 50, image: 'https://via.placeholder.com/60' },
  { value: '3', label: 'AirPods Pro', price: 1999, stock: 200, image: 'https://via.placeholder.com/60' },
  { value: '4', label: 'iPad Air', price: 4599, stock: 80, image: 'https://via.placeholder.com/60' },
]

// 远程搜索用户（带防抖）
const remoteSearchUser = debounce((query: string) => {
  if (query) {
    userLoading.value = true
    
    // 模拟 API 请求
    setTimeout(() => {
      userOptions.value = mockUsers.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase())
      )
      userLoading.value = false
    }, 500)
  } else {
    userOptions.value = []
  }
}, 300)

// 远程搜索商品（带防抖）
const remoteSearchProduct = debounce((query: string) => {
  if (query) {
    productLoading.value = true
    
    // 模拟 API 请求
    setTimeout(() => {
      productOptions.value = mockProducts.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
      productLoading.value = false
    }, 500)
  } else {
    productOptions.value = []
  }
}, 300)

// 选择商品后显示详情
const handleProductChange = (value: string) => {
  selectedProduct.value = productOptions.value.find(item => item.value === value) || null
  if (selectedProduct.value) {
    ElMessage.success(`已选择：${selectedProduct.value.label}`)
  }
}
</script>

<style scoped>
.remote-search-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.el-select {
  width: 100%;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  flex: 1;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.product-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  flex: 1;
}

.product-price {
  color: #f56c6c;
  font-size: 14px;
  margin-top: 5px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.product-detail {
  display: flex;
  gap: 20px;
  align-items: center;
}

.detail-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.detail-info h4 {
  margin: 0 0 10px 0;
}
</style>
```

---

## 完整样例三：级联选择器（地区选择）

### 效果描述
实现省市区三级联动选择，支持搜索、懒加载等功能。

### 完整代码

```vue
<template>
  <div class="cascader-demo">
    <el-card>
      <template #header>
        <h3 style="margin: 0;">地区级联选择</h3>
      </template>
      
      <el-form :model="cascaderForm" label-width="120px">
        <!-- 基础级联选择 -->
        <el-form-item label="所在地区">
          <el-cascader
            v-model="cascaderForm.area"
            :options="areaOptions"
            placeholder="请选择省/市/区"
            clearable
          />
        </el-form-item>
        
        <!-- 可搜索 -->
        <el-form-item label="收货地址">
          <el-cascader
            v-model="cascaderForm.deliveryArea"
            :options="areaOptions"
            :props="{ 
              expandTrigger: 'hover',
              value: 'code',
              label: 'name'
            }"
            filterable
            placeholder="请选择或搜索地区"
            clearable
          />
        </el-form-item>
        
        <!-- 多选 -->
        <el-form-item label="覆盖区域">
          <el-cascader
            v-model="cascaderForm.coverageAreas"
            :options="areaOptions"
            :props="{ multiple: true }"
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择覆盖区域（多选）"
            clearable
          />
        </el-form-item>
        
        <!-- 只显示最后一级 -->
        <el-form-item label="目标城市">
          <el-cascader
            v-model="cascaderForm.targetCity"
            :options="areaOptions"
            :show-all-levels="false"
            placeholder="请选择城市"
            clearable
          />
        </el-form-item>
        
        <!-- 任意一级可选 -->
        <el-form-item label="业务区域">
          <el-cascader
            v-model="cascaderForm.businessArea"
            :options="areaOptions"
            :props="{ checkStrictly: true }"
            placeholder="可选择任意级别"
            clearable
          />
        </el-form-item>
        
        <!-- 选中值展示 -->
        <el-divider />
        <el-form-item label="选中结果">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="所在地区">
              {{ cascaderForm.area.join(' / ') || '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="收货地址">
              {{ cascaderForm.deliveryArea.join(' / ') || '未选择' }}
            </el-descriptions-item>
            <el-descriptions-item label="覆盖区域">
              {{ cascaderForm.coverageAreas.length }} 个区域
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface AreaOption {
  code: string
  name: string
  children?: AreaOption[]
}

const cascaderForm = reactive({
  area: [] as string[],
  deliveryArea: [] as string[],
  coverageAreas: [] as string[][],
  targetCity: [] as string[],
  businessArea: [] as string[],
})

// 地区数据（简化版）
const areaOptions: AreaOption[] = [
  {
    code: '110000',
    name: '北京市',
    children: [
      {
        code: '110100',
        name: '北京市',
        children: [
          { code: '110101', name: '东城区' },
          { code: '110102', name: '西城区' },
          { code: '110105', name: '朝阳区' },
          { code: '110106', name: '丰台区' },
        ],
      },
    ],
  },
  {
    code: '310000',
    name: '上海市',
    children: [
      {
        code: '310100',
        name: '上海市',
        children: [
          { code: '310101', name: '黄浦区' },
          { code: '310104', name: '徐汇区' },
          { code: '310105', name: '长宁区' },
          { code: '310106', name: '静安区' },
        ],
      },
    ],
  },
  {
    code: '440000',
    name: '广东省',
    children: [
      {
        code: '440100',
        name: '广州市',
        children: [
          { code: '440103', name: '荔湾区' },
          { code: '440104', name: '越秀区' },
          { code: '440105', name: '海珠区' },
          { code: '440106', name: '天河区' },
        ],
      },
      {
        code: '440300',
        name: '深圳市',
        children: [
          { code: '440303', name: '罗湖区' },
          { code: '440304', name: '福田区' },
          { code: '440305', name: '南山区' },
          { code: '440306', name: '宝安区' },
        ],
      },
    ],
  },
]
</script>

<style scoped>
.cascader-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.el-cascader {
  width: 100%;
}
</style>
```

---

## 常见踩坑

### 1. Select v-model 绑定对象失效

**问题**：v-model 绑定对象时无法正常工作

**解决方案**：
```vue
<!-- ❌ 错误：直接绑定对象 -->
<el-select v-model="selectedUser">
  <el-option :value="{ id: 1, name: '张三' }" label="张三" />
</el-select>

<!-- ✅ 正确：使用 value-key -->
<el-select v-model="selectedUser" value-key="id">
  <el-option 
    v-for="user in users" 
    :key="user.id"
    :value="user" 
    :label="user.name" 
  />
</el-select>
```

### 2. 远程搜索频繁请求

**问题**：每次输入都触发远程请求

**解决方案**：
```ts
import { debounce } from 'lodash-es'

const remoteMethod = debounce((query: string) => {
  // 搜索逻辑
}, 300)
```

### 3. Cascader 数据更新不生效

**问题**：动态更新 options 后不显示

**解决方案**：
```ts
// 确保数据是响应式的
const options = ref([])

// 更新时重新赋值
options.value = [...newOptions]
```

### 4. 多选 Select 标签过多

**问题**：多选时标签占据太多空间

**解决方案**：
```vue
<el-select
  v-model="value"
  multiple
  collapse-tags
  collapse-tags-tooltip
/>
```

---

## 最佳实践

### 1. 远程搜索防抖

```ts
import { debounce } from 'lodash-es'

const remoteMethod = debounce(async (query: string) => {
  if (!query) {
    options.value = []
    return
  }
  
  loading.value = true
  try {
    const data = await api.search(query)
    options.value = data
  } finally {
    loading.value = false
  }
}, 300)
```

### 2. 选项数据结构规范

```ts
interface Option {
  value: string | number
  label: string
  disabled?: boolean
  [key: string]: any
}

const options: Option[] = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2', disabled: true },
]
```

### 3. 级联选择器懒加载

```vue
<el-cascader
  :props="{
    lazy: true,
    lazyLoad: loadCascaderData
  }"
/>

<script setup lang="ts">
const loadCascaderData = (node: any, resolve: Function) => {
  const { level } = node
  
  setTimeout(() => {
    const nodes = Array.from({ length: 5 }).map((_, index) => ({
      value: `${level}-${index}`,
      label: `选项${index}`,
      leaf: level >= 2
    }))
    resolve(nodes)
  }, 500)
}
</script>
```

### 4. 自定义选项模板

```vue
<el-select v-model="value">
  <el-option
    v-for="item in options"
    :key="item.value"
    :value="item.value"
  >
    <div class="custom-option">
      <span>{{ item.label }}</span>
      <el-tag :type="item.status">{{ item.statusText }}</el-tag>
    </div>
  </el-option>
</el-select>
```

---

## 参考资料

- [Element Plus Select 选择器](https://element-plus.org/zh-CN/component/select.html)
- [Element Plus Cascader 级联选择器](https://element-plus.org/zh-CN/component/cascader.html)

---

## 下一步

继续学习日期时间组件：[日期时间组件](./content-9.md)
