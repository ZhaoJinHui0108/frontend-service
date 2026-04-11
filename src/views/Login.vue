<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="login-logo">
          <rect width="24" height="24" rx="6" fill="#3b82f6"/>
          <path d="M7 12L10 15L17 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1>Code Learning</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <UiInput
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            id="username"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <UiInput
            v-model="password"
            type="password"
            placeholder="请输入密码"
            id="password"
          />
        </div>

        <UiAlert v-if="error" type="error">{{ error }}</UiAlert>

        <UiButton type="submit" :loading="loading" class="login-btn">
          登录
        </UiButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiInput, UiButton, UiAlert } from '@/components/ui'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, isAuthenticated } = useAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

if (isAuthenticated()) {
  router.push('/')
}

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await login(username.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.detail || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>
