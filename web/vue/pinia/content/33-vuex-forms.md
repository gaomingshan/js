# 第 33 节：表单处理

## 概述

在 Vuex 应用中处理表单数据需要特别注意严格模式的限制。本节介绍如何正确地在 Vuex 中管理表单状态，包括双向绑定、验证和提交。

## 一、基本表单处理

### 1.1 表单状态管理

```javascript
// store/modules/form.js
const formModule = {
  namespaced: true,
  
  state() {
    return {
      userForm: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      errors: {},
      loading: false,
      submitted: false
    }
  },
  
  mutations: {
    UPDATE_FIELD(state, { field, value }) {
      state.userForm[field] = value
    },
    
    SET_FORM_DATA(state, formData) {
      state.userForm = { ...state.userForm, ...formData }
    },
    
    SET_ERRORS(state, errors) {
      state.errors = errors
    },
    
    CLEAR_ERRORS(state) {
      state.errors = {}
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    RESET_FORM(state) {
      state.userForm = {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
      state.errors = {}
      state.submitted = false
    }
  },
  
  getters: {
    hasErrors: (state) => Object.keys(state.errors).length > 0,
    
    isValid: (state, getters) => !getters.hasErrors && 
      state.userForm.name && 
      state.userForm.email && 
      state.userForm.password,
    
    getFieldError: (state) => (field) => state.errors[field]
  },
  
  actions: {
    updateField({ commit }, payload) {
      commit('UPDATE_FIELD', payload)
      commit('CLEAR_ERRORS')
    },
    
    async submitForm({ state, commit, dispatch }) {
      commit('SET_LOADING', true)
      
      try {
        // 验证表单
        const validationResult = await dispatch('validateForm')
        if (!validationResult.isValid) {
          commit('SET_ERRORS', validationResult.errors)
          return false
        }
        
        // 提交表单
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.userForm)
        })
        
        if (!response.ok) {
          throw new Error('提交失败')
        }
        
        commit('RESET_FORM')
        return true
        
      } catch (error) {
        commit('SET_ERRORS', { submit: error.message })
        return false
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    validateForm({ state }) {
      const errors = {}
      const { name, email, password, confirmPassword } = state.userForm
      
      if (!name.trim()) errors.name = '姓名不能为空'
      if (!email.trim()) errors.email = '邮箱不能为空'
      else if (!/\S+@\S+\.\S+/.test(email)) errors.email = '邮箱格式不正确'
      
      if (!password) errors.password = '密码不能为空'
      else if (password.length < 6) errors.password = '密码至少6位'
      
      if (password !== confirmPassword) errors.confirmPassword = '密码不匹配'
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      }
    }
  }
}

export default formModule
```

## 二、表单双向绑定解决方案

### 2.1 使用计算属性

```vue
<template>
  <form @submit.prevent="handleSubmit" class="user-form">
    <div class="form-group">
      <label>姓名</label>
      <input 
        v-model="userName" 
        :class="{ error: hasError('name') }"
        placeholder="请输入姓名"
      />
      <span v-if="hasError('name')" class="error-message">
        {{ getError('name') }}
      </span>
    </div>
    
    <div class="form-group">
      <label>邮箱</label>
      <input 
        v-model="userEmail" 
        type="email"
        :class="{ error: hasError('email') }"
        placeholder="请输入邮箱"
      />
      <span v-if="hasError('email')" class="error-message">
        {{ getError('email') }}
      </span>
    </div>
    
    <div class="form-group">
      <label>密码</label>
      <input 
        v-model="userPassword" 
        type="password"
        :class="{ error: hasError('password') }"
        placeholder="请输入密码"
      />
      <span v-if="hasError('password')" class="error-message">
        {{ getError('password') }}
      </span>
    </div>
    
    <button 
      type="submit" 
      :disabled="!isFormValid || loading"
      class="submit-btn"
    >
      {{ loading ? '提交中...' : '提交' }}
    </button>
  </form>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'UserForm',
  
  computed: {
    ...mapState('form', ['loading', 'submitted']),
    ...mapGetters('form', ['hasErrors', 'isValid', 'getFieldError']),
    
    userName: {
      get() {
        return this.$store.state.form.userForm.name
      },
      set(value) {
        this.$store.dispatch('form/updateField', { field: 'name', value })
      }
    },
    
    userEmail: {
      get() {
        return this.$store.state.form.userForm.email
      },
      set(value) {
        this.$store.dispatch('form/updateField', { field: 'email', value })
      }
    },
    
    userPassword: {
      get() {
        return this.$store.state.form.userForm.password
      },
      set(value) {
        this.$store.dispatch('form/updateField', { field: 'password', value })
      }
    },
    
    isFormValid() {
      return this.isValid && !this.loading
    }
  },
  
  methods: {
    ...mapActions('form', ['submitForm']),
    
    hasError(field) {
      return this.getFieldError(field)
    },
    
    getError(field) {
      return this.getFieldError(field)
    },
    
    async handleSubmit() {
      const success = await this.submitForm()
      if (success) {
        this.$message.success('提交成功！')
      }
    }
  }
}
</script>
```

### 2.2 使用事件处理

```vue
<template>
  <form class="simple-form">
    <input 
      :value="formData.title"
      @input="updateTitle"
      placeholder="标题"
    />
    
    <textarea 
      :value="formData.content"
      @input="updateContent"
      placeholder="内容"
    />
    
    <button @click="save">保存</button>
  </form>
</template>

<script>
export default {
  computed: {
    formData() {
      return this.$store.state.form.postForm
    }
  },
  
  methods: {
    updateTitle(event) {
      this.$store.commit('form/UPDATE_POST_FIELD', {
        field: 'title',
        value: event.target.value
      })
    },
    
    updateContent(event) {
      this.$store.commit('form/UPDATE_POST_FIELD', {
        field: 'content',
        value: event.target.value
      })
    },
    
    save() {
      this.$store.dispatch('form/savePost')
    }
  }
}
</script>
```

## 三、动态表单处理

### 3.1 动态字段表单

```javascript
// 动态表单状态管理
const dynamicFormModule = {
  namespaced: true,
  
  state() {
    return {
      formConfig: [],
      formData: {},
      validationRules: {}
    }
  },
  
  mutations: {
    SET_FORM_CONFIG(state, config) {
      state.formConfig = config
      // 初始化表单数据
      state.formData = config.reduce((data, field) => {
        data[field.name] = field.defaultValue || ''
        return data
      }, {})
    },
    
    UPDATE_FIELD(state, { fieldName, value }) {
      state.formData[fieldName] = value
    }
  },
  
  actions: {
    async loadFormConfig({ commit }, formType) {
      const response = await fetch(`/api/forms/${formType}`)
      const config = await response.json()
      commit('SET_FORM_CONFIG', config)
    }
  }
}
```

### 3.2 动态表单组件

```vue
<template>
  <div class="dynamic-form">
    <div 
      v-for="field in formConfig" 
      :key="field.name"
      class="form-field"
    >
      <label>{{ field.label }}</label>
      
      <!-- 文本输入 -->
      <input 
        v-if="field.type === 'text'"
        :value="formData[field.name]"
        @input="updateField(field.name, $event.target.value)"
      />
      
      <!-- 下拉选择 -->
      <select 
        v-else-if="field.type === 'select'"
        :value="formData[field.name]"
        @change="updateField(field.name, $event.target.value)"
      >
        <option 
          v-for="option in field.options" 
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- 复选框 -->
      <input 
        v-else-if="field.type === 'checkbox'"
        type="checkbox"
        :checked="formData[field.name]"
        @change="updateField(field.name, $event.target.checked)"
      />
    </div>
    
    <button @click="submitForm">提交</button>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('dynamicForm', ['formConfig', 'formData'])
  },
  
  methods: {
    ...mapMutations('dynamicForm', ['UPDATE_FIELD']),
    ...mapActions('dynamicForm', ['loadFormConfig']),
    
    updateField(fieldName, value) {
      this.UPDATE_FIELD({ fieldName, value })
    },
    
    submitForm() {
      console.log('提交表单:', this.formData)
    }
  },
  
  async created() {
    await this.loadFormConfig('user-registration')
  }
}
</script>
```

## 四、表单验证

### 4.1 实时验证

```javascript
// 实时验证的表单模块
const validatingFormModule = {
  namespaced: true,
  
  state() {
    return {
      form: {
        username: '',
        email: '',
        phone: ''
      },
      fieldErrors: {},
      fieldTouched: {}
    }
  },
  
  mutations: {
    UPDATE_FIELD(state, { field, value }) {
      state.form[field] = value
    },
    
    SET_FIELD_ERROR(state, { field, error }) {
      if (error) {
        state.fieldErrors[field] = error
      } else {
        delete state.fieldErrors[field]
      }
    },
    
    SET_FIELD_TOUCHED(state, field) {
      state.fieldTouched[field] = true
    }
  },
  
  getters: {
    getFieldError: (state) => (field) => state.fieldErrors[field],
    isFieldTouched: (state) => (field) => state.fieldTouched[field],
    hasErrors: (state) => Object.keys(state.fieldErrors).length > 0
  },
  
  actions: {
    updateField({ commit, dispatch }, { field, value }) {
      commit('UPDATE_FIELD', { field, value })
      dispatch('validateField', { field, value })
    },
    
    touchField({ commit, dispatch, state }, field) {
      commit('SET_FIELD_TOUCHED', field)
      dispatch('validateField', { field, value: state.form[field] })
    },
    
    validateField({ commit }, { field, value }) {
      let error = null
      
      switch (field) {
        case 'username':
          if (!value) error = '用户名不能为空'
          else if (value.length < 3) error = '用户名至少3个字符'
          break
        case 'email':
          if (!value) error = '邮箱不能为空'
          else if (!/\S+@\S+\.\S+/.test(value)) error = '邮箱格式不正确'
          break
        case 'phone':
          if (!value) error = '手机号不能为空'
          else if (!/^1[3-9]\d{9}$/.test(value)) error = '手机号格式不正确'
          break
      }
      
      commit('SET_FIELD_ERROR', { field, error })
    }
  }
}
```

## 五、复杂表单场景

### 5.1 多步骤表单

```javascript
// 多步骤表单状态管理
const wizardFormModule = {
  namespaced: true,
  
  state() {
    return {
      currentStep: 0,
      steps: [
        { name: '基本信息', component: 'BasicInfo' },
        { name: '联系方式', component: 'ContactInfo' },
        { name: '确认信息', component: 'Confirmation' }
      ],
      formData: {
        basicInfo: {},
        contactInfo: {},
        confirmation: {}
      },
      stepValidation: {}
    }
  },
  
  mutations: {
    SET_CURRENT_STEP(state, step) {
      state.currentStep = step
    },
    
    UPDATE_STEP_DATA(state, { step, data }) {
      state.formData[step] = { ...state.formData[step], ...data }
    },
    
    SET_STEP_VALIDATION(state, { step, isValid }) {
      state.stepValidation[step] = isValid
    }
  },
  
  getters: {
    canGoNext: (state) => {
      return state.currentStep < state.steps.length - 1 && 
             state.stepValidation[state.currentStep]
    },
    
    canGoPrev: (state) => state.currentStep > 0,
    
    currentStepData: (state) => {
      const stepKeys = Object.keys(state.formData)
      return state.formData[stepKeys[state.currentStep]] || {}
    }
  },
  
  actions: {
    nextStep({ commit, getters }) {
      if (getters.canGoNext) {
        commit('SET_CURRENT_STEP', getters.currentStep + 1)
      }
    },
    
    prevStep({ commit, getters }) {
      if (getters.canGoPrev) {
        commit('SET_CURRENT_STEP', getters.currentStep - 1)
      }
    },
    
    async submitWizard({ state }) {
      const response = await fetch('/api/wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.formData)
      })
      
      return response.ok
    }
  }
}
```

## 参考资料

- [Vuex 表单处理](https://vuex.vuejs.org/guide/forms.html)
- [Vue.js 表单输入绑定](https://vuejs.org/guide/essentials/forms.html)
- [表单验证最佳实践](https://vuejs.org/guide/best-practices/forms.html)

**下一节** → [第 34 节：测试](./34-vuex-testing.md)
