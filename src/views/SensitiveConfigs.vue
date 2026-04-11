<template>
  <div class="page-container">
    <h1>敏感配置</h1>
    <UiCard>
      <div class="config-section">
        <h3>API Keys</h3>
        <p class="text-muted">管理您的API Keys</p>
        <div class="config-list">
          <div v-for="config in configs" :key="config.id" class="config-item">
            <span class="config-key">{{ config.key }}</span>
            <div class="config-actions">
              <UiButton variant="secondary" size="small">编辑</UiButton>
              <UiButton variant="danger" size="small" @click="deleteConfig(config.id)">删除</UiButton>
            </div>
          </div>
        </div>
        <UiButton @click="showAddModal = true" style="margin-top: 16px">添加配置</UiButton>
      </div>
    </UiCard>

    <UiModal :show="showAddModal" title="添加配置" @close="showAddModal = false">
      <form @submit.prevent="handleAdd" class="form">
        <div class="form-group">
          <label>配置名称</label>
          <UiInput v-model="newConfig.key" placeholder="配置名称" />
        </div>
        <div class="form-group">
          <label>配置值</label>
          <UiInput v-model="newConfig.value" placeholder="配置值" />
        </div>
      </form>
      <template #footer>
        <UiButton variant="secondary" @click="showAddModal = false">取消</UiButton>
        <UiButton @click="handleAdd">保存</UiButton>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UiCard, UiButton, UiInput, UiModal } from '@/components/ui'
import axios from 'axios'

interface SensitiveConfig {
  id: number
  key: string
  value: string
}

const configs = ref<SensitiveConfig[]>([])
const showAddModal = ref(false)
const newConfig = ref({ key: '', value: '' })

const loadConfigs = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const { data } = await axios.get<SensitiveConfig[]>('/services/user/api/v1/sensitive-configs', {
      headers: { Authorization: `Bearer ${token}` }
    })
    configs.value = data
  } catch (err) {
    console.error('Failed to load configs:', err)
  }
}

const handleAdd = async () => {
  try {
    const token = localStorage.getItem('access_token')
    await axios.post('/services/user/api/v1/sensitive-configs',
      newConfig.value,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    showAddModal.value = false
    newConfig.value = { key: '', value: '' }
    loadConfigs()
  } catch (err) {
    console.error('Failed to add config:', err)
  }
}

const deleteConfig = async (id: number) => {
  if (!confirm('确定要删除此配置吗？')) return
  try {
    const token = localStorage.getItem('access_token')
    await axios.delete(`/services/user/api/v1/sensitive-configs/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    loadConfigs()
  } catch (err) {
    console.error('Failed to delete config:', err)
  }
}

onMounted(loadConfigs)
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-container h1 {
  font-size: 32px;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 32px;
}

.config-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 8px;
}

.config-section p {
  margin-bottom: 16px;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
}

.config-key {
  font-weight: 500;
  color: #18181b;
}

.config-actions {
  display: flex;
  gap: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #45515e;
}

.text-muted {
  color: #8e8e93;
}
</style>
