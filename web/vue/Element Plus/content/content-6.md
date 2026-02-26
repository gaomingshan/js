# 表单基础与校验

## 概述

Form 表单是 Element Plus 最核心的组件之一，用于数据收集、校验和提交。掌握表单组件的使用和校验规则是开发中后台系统的基础。

---

## Form 组件核心概念

### 基础属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model | 表单数据对象 | object | - |
| rules | 表单验证规则 | object | - |
| inline | 行内表单模式 | boolean | false |
| label-width | 标签宽度 | string/number | - |
| label-position | 标签位置 | string (left/right/top) | right |
| disabled | 是否禁用该表单内的所有组件 | boolean | false |
| size | 用于控制该表单内组件的尺寸 | string | - |

### FormItem 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| prop | 表单域 model 字段 | string | - |
| label | 标签文本 | string | - |
| rules | 表单验证规则 | object/array | - |
| required | 是否必填 | boolean | false |
| error | 表单域验证错误信息 | string | - |

### 表单方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate | 对整个表单进行校验 | (callback?: (valid: boolean) => void) |
| validateField | 对部分表单字段进行校验 | (props: string \| string[], callback?: (valid: boolean) => void) |
| resetFields | 重置表单项 | - |
| clearValidate | 清除验证信息 | (props?: string \| string[]) |
| scrollToField | 滚动到指定表单字段 | (prop: string) |

---

## 表单校验规则配置

### 内置校验器

```ts
interface Rule {
  required?: boolean           // 是否必填
  message?: string            // 错误提示信息
  trigger?: string | string[] // 触发方式：blur/change
  min?: number                // 最小长度
  max?: number                // 最大长度
  len?: number                // 精确长度
  pattern?: RegExp            // 正则表达式
  validator?: Function        // 自定义校验函数
  type?: string               // 数据类型：string/number/boolean/array等
}
```

### 常用校验规则

```ts
const rules = {
  // 必填
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  
  // 长度限制
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  
  // 正则校验
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  
  // 类型校验
  age: [
    { type: 'number', message: '年龄必须为数字值', trigger: 'blur' }
  ],
  
  // 数组校验
  hobbies: [
    { type: 'array', required: true, message: '请至少选择一个兴趣', trigger: 'change' }
  ]
}
```

---

## 完整样例一：用户注册表单

### 效果描述
实现一个完整的用户注册表单，包含用户名、密码、确认密码、邮箱、手机号等字段，带完整的表单校验。

### 完整代码

```vue
<template>
  <div class="register-form-demo">
    <el-card style="max-width: 600px; margin: 0 auto;">
      <template #header>
        <h3 style="margin: 0;">用户注册</h3>
      </template>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-width="100px"
        size="default"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
        
        <!-- 确认密码 -->
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
          />
        </el-form-item>
        
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            clearable
          />
        </el-form-item>
        
        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
            clearable
          />
        </el-form-item>
        
        <!-- 性别 -->
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="registerForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 兴趣爱好 -->
        <el-form-item label="兴趣爱好" prop="hobbies">
          <el-checkbox-group v-model="registerForm.hobbies">
            <el-checkbox label="reading">阅读</el-checkbox>
            <el-checkbox label="sports">运动</el-checkbox>
            <el-checkbox label="music">音乐</el-checkbox>
            <el-checkbox label="travel">旅行</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 用户协议 -->
        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <el-link type="primary" :underline="false">《用户协议》</el-link>
          </el-checkbox>
        </el-form-item>
        
        <!-- 按钮 -->
        <el-form-item>
          <el-space>
            <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
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
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

// 表单实例
const registerFormRef = ref<FormInstance>()

// 表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  gender: 1,
  hobbies: [] as string[],
  agreement: false,
})

// 自定义校验函数：确认密码
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 自定义校验函数：用户协议
const validateAgreement = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'))
  } else {
    callback()
  }
}

// 校验规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '必须包含大小写字母和数字', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' },
  ],
  hobbies: [
    { type: 'array', required: true, message: '请至少选择一个兴趣', trigger: 'change' },
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' },
  ],
}

// 提交状态
const isSubmitting = ref(false)

// 提交表单
const handleSubmit = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      isSubmitting.value = true
      
      // 模拟提交
      setTimeout(() => {
        isSubmitting.value = false
        ElMessage.success('注册成功！')
        console.log('表单数据:', registerForm)
      }, 1500)
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

// 重置表单
const handleReset = () => {
  registerFormRef.value?.resetFields()
  ElMessage.info('表单已重置')
}
</script>

<style scoped>
.register-form-demo {
  padding: 20px;
}
</style>
```

---

## 完整样例二：动态表单校验

### 效果描述
展示动态增删表单项的校验处理。

### 完整代码

```vue
<template>
  <div class="dynamic-form-demo">
    <el-card style="max-width: 800px; margin: 0 auto;">
      <template #header>
        <h3 style="margin: 0;">动态表单校验</h3>
      </template>
      
      <el-form
        ref="dynamicFormRef"
        :model="dynamicForm"
        :rules="dynamicRules"
        label-width="120px"
      >
        <!-- 基本信息 -->
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="dynamicForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        
        <!-- 动态联系人列表 -->
        <el-divider content-position="left">联系人信息</el-divider>
        
        <div v-for="(contact, index) in dynamicForm.contacts" :key="index" class="contact-item">
          <el-form-item
            :label="`联系人${index + 1}`"
            :prop="`contacts.${index}.name`"
            :rules="[
              { required: true, message: '请输入联系人姓名', trigger: 'blur' },
              { min: 2, message: '姓名至少2个字符', trigger: 'blur' }
            ]"
          >
            <el-input v-model="contact.name" placeholder="请输入姓名" />
          </el-form-item>
          
          <el-form-item
            :label="`电话${index + 1}`"
            :prop="`contacts.${index}.phone`"
            :rules="[
              { required: true, message: '请输入联系电话', trigger: 'blur' },
              { pattern: /^1[3-9]\d{9}$/, message: '电话格式不正确', trigger: 'blur' }
            ]"
          >
            <el-input v-model="contact.phone" placeholder="请输入电话" />
          </el-form-item>
          
          <el-form-item
            :label="`邮箱${index + 1}`"
            :prop="`contacts.${index}.email`"
            :rules="[
              { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
            ]"
          >
            <el-space>
              <el-input v-model="contact.email" placeholder="请输入邮箱（可选）" />
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="removeContact(index)"
                :disabled="dynamicForm.contacts.length === 1"
              />
            </el-space>
          </el-form-item>
        </div>
        
        <el-form-item>
          <el-button type="primary" :icon="Plus" @click="addContact">
            添加联系人
          </el-button>
        </el-form-item>
        
        <el-divider />
        
        <!-- 按钮 -->
        <el-form-item>
          <el-space>
            <el-button type="primary" @click="handleDynamicSubmit">提交</el-button>
            <el-button @click="handleDynamicReset">重置</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

interface Contact {
  name: string
  phone: string
  email: string
}

const dynamicFormRef = ref<FormInstance>()

const dynamicForm = reactive({
  projectName: '',
  contacts: [
    { name: '', phone: '', email: '' }
  ] as Contact[]
})

const dynamicRules: FormRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ]
}

const addContact = () => {
  dynamicForm.contacts.push({
    name: '',
    phone: '',
    email: ''
  })
}

const removeContact = (index: number) => {
  if (dynamicForm.contacts.length === 1) {
    ElMessage.warning('至少保留一个联系人')
    return
  }
  dynamicForm.contacts.splice(index, 1)
}

const handleDynamicSubmit = async () => {
  if (!dynamicFormRef.value) return
  
  await dynamicFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('提交成功')
      console.log('表单数据:', dynamicForm)
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

const handleDynamicReset = () => {
  dynamicFormRef.value?.resetFields()
  dynamicForm.contacts = [{ name: '', phone: '', email: '' }]
}
</script>

<style scoped>
.dynamic-form-demo {
  padding: 20px;
}

.contact-item {
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
```

---

## 完整样例三：异步校验

### 效果描述
实现异步校验用户名是否已存在的功能。

### 完整代码

```vue
<template>
  <div class="async-validate-demo">
    <el-card style="max-width: 600px; margin: 0 auto;">
      <template #header>
        <h3 style="margin: 0;">异步校验示例</h3>
      </template>
      
      <el-form
        ref="asyncFormRef"
        :model="asyncForm"
        :rules="asyncRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="asyncForm.username"
            placeholder="请输入用户名"
            clearable
          >
            <template #suffix>
              <el-icon v-if="isChecking" class="is-loading">
                <Loading />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="asyncForm.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleAsyncSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const asyncFormRef = ref<FormInstance>()
const isChecking = ref(false)

const asyncForm = reactive({
  username: '',
  email: ''
})

// 模拟检查用户名是否存在的 API
const checkUsernameExists = (username: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟已存在的用户名
      const existingUsernames = ['admin', 'test', 'user']
      resolve(existingUsernames.includes(username.toLowerCase()))
    }, 1000)
  })
}

// 异步校验用户名
const validateUsername = async (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'))
    return
  }
  
  if (value.length < 3) {
    callback(new Error('用户名至少3个字符'))
    return
  }
  
  isChecking.value = true
  try {
    const exists = await checkUsernameExists(value)
    isChecking.value = false
    
    if (exists) {
      callback(new Error('用户名已存在'))
    } else {
      callback()
    }
  } catch (error) {
    isChecking.value = false
    callback(new Error('校验失败，请重试'))
  }
}

const asyncRules: FormRules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const handleAsyncSubmit = async () => {
  if (!asyncFormRef.value) return
  
  await asyncFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('提交成功')
      console.log('表单数据:', asyncForm)
    }
  })
}
</script>

<style scoped>
.async-validate-demo {
  padding: 20px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

---

## 常见踩坑

### 1. 校验不生效

**问题**：设置了 rules 但校验不触发

**原因**：
- FormItem 未设置 `prop` 属性
- `prop` 值与 `model` 中的字段不匹配

**解决方案**：
```vue
<!-- ❌ 错误：未设置 prop -->
<el-form-item label="用户名">
  <el-input v-model="form.username" />
</el-form-item>

<!-- ✅ 正确：设置 prop -->
<el-form-item label="用户名" prop="username">
  <el-input v-model="form.username" />
</el-form-item>
```

### 2. 动态表单校验失败

**问题**：动态添加的表单项校验不生效

**解决方案**：
```vue
<!-- ✅ 正确：使用数组索引 -->
<el-form-item
  :prop="`items.${index}.name`"
  :rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
>
  <el-input v-model="items[index].name" />
</el-form-item>
```

### 3. 重置表单后校验信息未清除

**问题**：调用 `resetFields` 后仍显示校验错误

**解决方案**：
```ts
// 同时清除校验信息
formRef.value?.resetFields()
formRef.value?.clearValidate()
```

### 4. 异步校验导致表单卡顿

**问题**：每次输入都触发异步校验

**解决方案**：
```ts
// 使用防抖优化
import { debounce } from 'lodash-es'

const validateUsername = debounce(async (rule, value, callback) => {
  // 校验逻辑
}, 500)
```

---

## 最佳实践

### 1. 校验规则集中管理

```ts
// utils/validate.ts
export const validateRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}
```

### 2. 表单提交统一处理

```ts
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    isSubmitting.value = true
    await api.submit(formData.value)
    ElMessage.success('提交成功')
  } catch (error) {
    if (error !== false) { // validate 失败会返回 false
      ElMessage.error('提交失败')
    }
  } finally {
    isSubmitting.value = false
  }
}
```

### 3. TypeScript 类型定义

```ts
interface RegisterForm {
  username: string
  password: string
  email: string
  phone: string
}

const form = reactive<RegisterForm>({
  username: '',
  password: '',
  email: '',
  phone: ''
})
```

### 4. 自定义校验器复用

```ts
// utils/validators.ts
export const phoneValidator = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}
```

---

## 参考资料

- [Element Plus Form 表单](https://element-plus.org/zh-CN/component/form.html)
- [async-validator](https://github.com/yiminghe/async-validator)

---

## 下一步

继续学习输入类组件：[输入类组件](./content-7.md)
