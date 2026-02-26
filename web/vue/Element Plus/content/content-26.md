# 复杂表单处理

## 概述

本章介绍复杂表单场景的处理方案，包括动态表单、表单联动、多步骤表单、嵌套表单等。掌握这些技巧可以应对各种复杂的业务需求。

## 核心场景

### 1. 动态表单项

根据条件动态增删表单项。

### 2. 表单联动

字段之间相互影响，如级联选择、条件显示。

### 3. 复杂验证

跨字段验证、异步验证、自定义验证规则。

### 4. 表单回显

编辑场景下的数据回显和初始化。

## 完整实战样例

### 示例 1：动态表单 - 联系人管理

可添加删除的动态表单项。

```vue
<template>
  <div class="dynamic-form-demo">
    <el-card>
      <template #header>
        <span>动态表单 - 联系人管理</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>

        <el-divider content-position="left">联系人信息</el-divider>

        <div
          v-for="(contact, index) in form.contacts"
          :key="contact.key"
          class="contact-item"
        >
          <el-card shadow="never">
            <template #header>
              <div class="contact-header">
                <span>联系人 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  link
                  :disabled="form.contacts.length === 1"
                  @click="removeContact(index)"
                >
                  删除
                </el-button>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  :prop="`contacts.${index}.name`"
                  :rules="rules.contactName"
                  label="姓名"
                >
                  <el-input v-model="contact.name" placeholder="请输入姓名" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item
                  :prop="`contacts.${index}.phone`"
                  :rules="rules.contactPhone"
                  label="电话"
                >
                  <el-input v-model="contact.phone" placeholder="请输入电话" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item
                  :prop="`contacts.${index}.email`"
                  :rules="rules.contactEmail"
                  label="邮箱"
                >
                  <el-input v-model="contact.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item
                  :prop="`contacts.${index}.role`"
                  label="角色"
                >
                  <el-select v-model="contact.role" placeholder="请选择角色" style="width: 100%">
                    <el-option label="项目经理" value="pm" />
                    <el-option label="技术负责人" value="tech" />
                    <el-option label="产品经理" value="product" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item
                  :prop="`contacts.${index}.remark`"
                  label="备注"
                >
                  <el-input
                    v-model="contact.remark"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入备注"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </div>

        <el-form-item>
          <el-button type="primary" @click="addContact">
            <el-icon><Plus /></el-icon>
            添加联系人
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-space>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Contact {
  key: number
  name: string
  phone: string
  email: string
  role: string
  remark: string
}

interface FormData {
  projectName: string
  contacts: Contact[]
}

const formRef = ref<FormInstance>()
let contactKeyIndex = 1

const form = reactive<FormData>({
  projectName: '',
  contacts: [
    {
      key: contactKeyIndex++,
      name: '',
      phone: '',
      email: '',
      role: '',
      remark: ''
    }
  ]
})

const rules: FormRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const addContact = () => {
  form.contacts.push({
    key: contactKeyIndex++,
    name: '',
    phone: '',
    email: '',
    role: '',
    remark: ''
  })
}

const removeContact = (index: number) => {
  form.contacts.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交数据:', form)
      ElMessage.success('提交成功')
    } else {
      ElMessage.error('请检查表单填写')
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
  form.contacts = [
    {
      key: contactKeyIndex++,
      name: '',
      phone: '',
      email: '',
      role: '',
      remark: ''
    }
  ]
}
</script>

<style scoped>
.dynamic-form-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.contact-item {
  margin-bottom: 16px;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
```

---

### 示例 2：表单联动 - 地址选择

省市区三级联动选择。

```vue
<template>
  <div class="cascade-form-demo">
    <el-card>
      <template #header>
        <span>表单联动 - 地址信息</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="省份" prop="province">
              <el-select
                v-model="form.province"
                placeholder="请选择省份"
                style="width: 100%"
                @change="handleProvinceChange"
              >
                <el-option
                  v-for="province in provinces"
                  :key="province.code"
                  :label="province.name"
                  :value="province.code"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="城市" prop="city">
              <el-select
                v-model="form.city"
                placeholder="请选择城市"
                style="width: 100%"
                :disabled="!form.province"
                @change="handleCityChange"
              >
                <el-option
                  v-for="city in cities"
                  :key="city.code"
                  :label="city.name"
                  :value="city.code"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="区县" prop="district">
              <el-select
                v-model="form.district"
                placeholder="请选择区县"
                style="width: 100%"
                :disabled="!form.city"
              >
                <el-option
                  v-for="district in districts"
                  :key="district.code"
                  :label="district.name"
                  :value="district.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>

        <el-form-item label="地址类型" prop="addressType">
          <el-radio-group v-model="form.addressType">
            <el-radio label="home">家庭地址</el-radio>
            <el-radio label="company">公司地址</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.addressType === 'company'" label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称" />
        </el-form-item>

        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>

        <el-form-item>
          <el-space>
            <el-button type="primary" @click="handleSubmit">保存地址</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-space>
        </el-form-item>
      </el-form>

      <el-divider />

      <div>
        <h4>完整地址预览：</h4>
        <el-tag v-if="fullAddress" size="large">{{ fullAddress }}</el-tag>
        <span v-else style="color: #909399">请完整填写地址信息</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface AreaItem {
  code: string
  name: string
}

interface FormData {
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  addressType: string
  companyName: string
  isDefault: boolean
}

const formRef = ref<FormInstance>()

const form = reactive<FormData>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  addressType: 'home',
  companyName: '',
  isDefault: false
})

// 模拟地区数据
const provinces = ref<AreaItem[]>([
  { code: '110000', name: '北京市' },
  { code: '310000', name: '上海市' },
  { code: '440000', name: '广东省' }
])

const cityMap: Record<string, AreaItem[]> = {
  '110000': [
    { code: '110100', name: '北京市' }
  ],
  '310000': [
    { code: '310100', name: '上海市' }
  ],
  '440000': [
    { code: '440100', name: '广州市' },
    { code: '440300', name: '深圳市' }
  ]
}

const districtMap: Record<string, AreaItem[]> = {
  '110100': [
    { code: '110101', name: '东城区' },
    { code: '110102', name: '西城区' },
    { code: '110105', name: '朝阳区' }
  ],
  '440100': [
    { code: '440103', name: '荔湾区' },
    { code: '440104', name: '越秀区' }
  ],
  '440300': [
    { code: '440303', name: '罗湖区' },
    { code: '440304', name: '福田区' }
  ]
}

const cities = ref<AreaItem[]>([])
const districts = ref<AreaItem[]>([])

const handleProvinceChange = (value: string) => {
  form.city = ''
  form.district = ''
  cities.value = cityMap[value] || []
  districts.value = []
}

const handleCityChange = (value: string) => {
  form.district = ''
  districts.value = districtMap[value] || []
}

const fullAddress = computed(() => {
  if (!form.province || !form.city || !form.district || !form.address) {
    return ''
  }
  
  const provinceName = provinces.value.find(p => p.code === form.province)?.name || ''
  const cityName = cities.value.find(c => c.code === form.city)?.name || ''
  const districtName = districts.value.find(d => d.code === form.district)?.name || ''
  
  return `${provinceName} ${cityName} ${districtName} ${form.address}`
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  district: [
    { required: true, message: '请选择区县', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  companyName: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交数据:', { ...form, fullAddress: fullAddress.value })
      ElMessage.success('地址保存成功')
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
  cities.value = []
  districts.value = []
}
</script>

<style scoped>
.cascade-form-demo {
  max-width: 800px;
  margin: 0 auto;
}

h4 {
  margin: 0 0 12px 0;
}
</style>
```

---

### 示例 3：复杂验证 - 跨字段和异步验证

```vue
<template>
  <div class="complex-validation-demo">
    <el-card>
      <template #header>
        <span>复杂验证 - 用户注册</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名（3-20个字符）" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（至少8位，包含字母和数字）"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="form.age" :min="1" :max="150" />
        </el-form-item>

        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="form.birthDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="邀请码" prop="inviteCode">
          <el-input v-model="form.inviteCode" placeholder="请输入邀请码（选填）" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.agree">
            我已阅读并同意<el-link type="primary">《用户协议》</el-link>和<el-link type="primary">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-space>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
              注册
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface FormData {
  username: string
  password: string
  confirmPassword: string
  email: string
  phone: string
  age: number | null
  birthDate: string
  inviteCode: string
  agree: boolean
}

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive<FormData>({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  age: null,
  birthDate: '',
  inviteCode: '',
  agree: false
})

// 异步验证用户名是否已存在
const validateUsername = async (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('请输入用户名'))
  }
  
  // 模拟异步验证
  const checkUsername = async (username: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟已存在的用户名
        const existingUsernames = ['admin', 'test', 'user']
        resolve(!existingUsernames.includes(username))
      }, 500)
    })
  }
  
  const isAvailable = await checkUsername(value)
  if (!isAvailable) {
    return callback(new Error('用户名已存在'))
  }
  
  callback()
}

// 验证密码强度
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  
  if (value.length < 8) {
    return callback(new Error('密码长度至少8位'))
  }
  
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    return callback(new Error('密码必须包含字母和数字'))
  }
  
  callback()
}

// 验证确认密码
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('请再次输入密码'))
  }
  
  if (value !== form.password) {
    return callback(new Error('两次输入的密码不一致'))
  }
  
  callback()
}

// 验证年龄与出生日期的一致性
const validateAge = (rule: any, value: number, callback: any) => {
  if (!value) {
    return callback(new Error('请输入年龄'))
  }
  
  if (form.birthDate) {
    const birthYear = new Date(form.birthDate).getFullYear()
    const currentYear = new Date().getFullYear()
    const calculatedAge = currentYear - birthYear
    
    if (Math.abs(calculatedAge - value) > 1) {
      return callback(new Error('年龄与出生日期不符'))
    }
  }
  
  callback()
}

// 异步验证邀请码
const validateInviteCode = async (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback() // 邀请码可选
  }
  
  // 模拟异步验证
  const checkInviteCode = async (code: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(code === 'VALID2024')
      }, 300)
    })
  }
  
  const isValid = await checkInviteCode(value)
  if (!isValid) {
    return callback(new Error('邀请码无效'))
  }
  
  callback()
}

const rules: FormRules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  age: [
    { required: true, validator: validateAge, trigger: 'blur' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  inviteCode: [
    { validator: validateInviteCode, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!form.agree) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }
  
  if (!formRef.value) return
  
  submitLoading.value = true
  
  await formRef.value.validate((valid) => {
    submitLoading.value = false
    
    if (valid) {
      console.log('提交数据:', form)
      ElMessage.success('注册成功')
    } else {
      ElMessage.error('请检查表单填写')
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
  form.agree = false
}
</script>

<style scoped>
.complex-validation-demo {
  max-width: 600px;
  margin: 0 auto;
}
</style>
```

---

## 常见踩坑

### 1. 动态表单验证失效

**问题：** 动态添加的表单项验证不生效。

**解决：** 使用数组索引绑定 `prop`。

```vue
<el-form-item
  :prop="`contacts.${index}.name`"
  :rules="rules.contactName"
>
```

---

### 2. 表单联动清空值后验证残留

**问题：** 选择省份后清空城市，城市验证错误仍显示。

**解决：** 使用 `clearValidate` 清除验证。

```ts
const handleProvinceChange = () => {
  form.city = ''
  formRef.value?.clearValidate('city')
}
```

---

### 3. 异步验证死循环

**问题：** 异步验证重复触发。

**解决：** 使用防抖或缓存验证结果。

```ts
import { useDebounceFn } from '@vueuse/core'

const validateUsername = useDebounceFn(async (rule, value, callback) => {
  // 验证逻辑
}, 500)
```

---

## 最佳实践

### 1. 表单数据管理

```ts
// useForm.ts
export const useForm = <T>(initialData: T) => {
  const formRef = ref<FormInstance>()
  const formData = reactive<T>(initialData)
  const loading = ref(false)
  
  const validate = () => formRef.value?.validate()
  const resetFields = () => formRef.value?.resetFields()
  const clearValidate = () => formRef.value?.clearValidate()
  
  return {
    formRef,
    formData,
    loading,
    validate,
    resetFields,
    clearValidate
  }
}
```

### 2. 复杂验证规则封装

```ts
// validators.ts
export const passwordValidator = (rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入密码'))
  if (value.length < 8) return callback(new Error('密码长度至少8位'))
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    return callback(new Error('密码必须包含字母和数字'))
  }
  callback()
}
```

### 3. 表单数据持久化

```ts
import { useLocalStorage } from '@vueuse/core'

const formDraft = useLocalStorage('form-draft', initialFormData)

// 自动保存
watch(form, (newVal) => {
  formDraft.value = newVal
}, { deep: true })
```

---

## 参考资料

- [Element Plus Form 文档](https://element-plus.org/zh-CN/component/form.html)
- [Async Validator](https://github.com/yiminghe/async-validator)
