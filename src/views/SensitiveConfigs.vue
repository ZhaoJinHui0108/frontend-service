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
        <UiButton @click="showAddModal = true">添加配置</UiButton>
      </div>
    </UiCard>

    <UiModal :show="showAddModal" title="添加配置" @close="showAddModal = false">
      <form @submit.prevent="handleAdd">
        <div class="form-group">
          <label>配置名称</label>
          <UiInput v-model="newConfig.key" placeholder="配置名称" />
        </div>
        <div class="form-group">
          <label>配置值</label>
          <UiInput v-model="newConfig.value" placeholder="配置值" />
        </div>
        <div class="modal-footer">
          <UiButton variant="secondary" type="button" @click="showAddModal = false">取消</UiButton>
          <UiButton type="submit">保存</UiButton>
        </div>
      </form>
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
