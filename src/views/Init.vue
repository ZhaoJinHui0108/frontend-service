<template>
  <div class="page-container">
    <h1>系统初始化</h1>
    <UiCard>
      <div class="init-section">
        <h3>数据库操作</h3>
        <p class="text-muted">更新数据库表结构</p>
        <UiButton @click="updateTables" :loading="loading.updateTables">
          更新表结构
        </UiButton>
      </div>

      <div class="init-section">
        <h3>初始化数据</h3>
        <p class="text-muted">创建默认角色和权限</p>
        <div class="form-row">
          <UiInput v-model="adminUsername" placeholder="管理员用户名" />
          <UiInput v-model="adminPassword" type="password" placeholder="管理员密码" />
        </div>
        <UiButton @click="initData" :loading="loading.initData">
          初始化数据
        </UiButton>
      </div>

      <div class="init-section danger">
        <h3>危险操作</h3>
        <p class="text-error">删除所有数据表，此操作不可恢复！</p>
        <UiButton variant="danger" @click="dropTables" :loading="loading.dropTables">
          删除所有表
        </UiButton>
      </div>

      <UiAlert v-if="message" :type="messageType">{{ message }}</UiAlert>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UiCard, UiButton, UiInput, UiAlert } from '@/components/ui'
import { initApi } from '@/services/authService'

const adminUsername = ref('')
const adminPassword = ref('')
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('info')

const loading = ref({
  updateTables: false,
  initData: false,
  dropTables: false
})

const updateTables = async () => {
  loading.value.updateTables = true
  message.value = ''
  try {
    const { data } = await initApi.updateTables()
    message.value = data.message
    messageType.value = 'success'
  } catch (err: any) {
    message.value = err.response?.data?.detail || '更新失败'
    messageType.value = 'error'
  } finally {
    loading.value.updateTables = false
  }
}

const initData = async () => {
  loading.value.initData = true
  message.value = ''
  try {
    const { data } = await initApi.initData(adminUsername.value || undefined, adminPassword.value || undefined)
    message.value = data.message || '数据初始化成功'
    messageType.value = 'success'
  } catch (err: any) {
    message.value = err.response?.data?.detail || '初始化失败'
    messageType.value = 'error'
  } finally {
    loading.value.initData = false
  }
}

const dropTables = async () => {
  if (!confirm('确定要删除所有数据表吗？此操作不可恢复！')) return
  loading.value.dropTables = true
  message.value = ''
  try {
    const { data } = await initApi.dropTables()
    message.value = data.message
    messageType.value = 'success'
  } catch (err: any) {
    message.value = err.response?.data?.detail || '删除失败'
    messageType.value = 'error'
  } finally {
    loading.value.dropTables = false
  }
}
</script>
