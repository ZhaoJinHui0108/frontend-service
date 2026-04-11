<template>
  <Teleport to="body">
    <div v-if="isOpen" class="chat-sidebar">
      <div class="chat-header">
        <div class="chat-title">
          <span style="font-size: 20px">🤖</span>
          <span style="font-weight: 600; font-size: 16px">AI 助手</span>
        </div>
        <button class="chat-close" @click="$emit('close')">×</button>
      </div>

      <div class="chat-settings">
        <div class="setting-row">
          <div class="setting-label">
            <span style="font-size: 12px; color: var(--text-secondary)">API Key:</span>
            <router-link to="/sensitive-configs" target="_blank" class="add-key-link" @click="$emit('close')">
              + 配置新的 Key
            </router-link>
          </div>
          <select v-if="apiKeys.length > 0" v-model="selectedApiKey" class="chat-select">
            <option v-for="ak in apiKeys" :key="ak.key" :value="ak.key">{{ ak.key }}</option>
          </select>
          <div v-else class="no-api-key">
            未配置 API Key，请先
            <router-link to="/sensitive-configs" class="add-key-link">添加配置</router-link>
          </div>
        </div>

        <div class="setting-row">
          <span style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: block">模型:</span>
          <select v-model="selectedModel" class="chat-select" :disabled="apiKeys.length === 0">
            <option v-for="model in models" :key="model.id" :value="model.id">{{ model.name }}</option>
          </select>
        </div>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages.slice(1)"
          :key="index"
          class="message-wrapper"
          :class="message.role"
        >
          <div class="message-bubble">{{ message.content }}</div>
        </div>

        <div v-if="isLoading" class="message-wrapper assistant">
          <div class="message-bubble loading">
            <div class="loading-spinner"></div>
            <span>{{ currentModel ? `${currentModel} 思考中...` : '思考中...' }}</span>
          </div>
        </div>

        <div ref="messagesEnd"></div>
      </div>

      <div class="chat-input">
        <div class="input-row">
          <textarea
            v-model="input"
            class="chat-textarea"
            :placeholder="apiKeys.length === 0 ? '请先配置 API Key' : '输入消息...'"
            :disabled="isLoading || apiKeys.length === 0"
            @keydown="handleKeyDown"
            rows="1"
          ></textarea>
          <button
            class="send-btn"
            :disabled="!input.trim() || isLoading || apiKeys.length === 0"
            @click="handleSend"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ApiKeyInfo {
  key: string
}

interface ModelInfo {
  id: string
  name: string
}

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
}>()

const messages = ref<ChatMessage[]>([{ role: 'assistant', content: '你好！有什么可以帮助你的吗？' }])
const input = ref('')
const isLoading = ref(false)
const apiKeys = ref<ApiKeyInfo[]>([])
const models = ref<ModelInfo[]>([])
const selectedApiKey = ref('')
const selectedModel = ref('MiniMax-M2.7')
const currentModel = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const messagesEnd = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEnd.value) {
      messagesEnd.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

watch(() => messages.value.length, scrollToBottom)

const fetchApiKeys = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const res = await axios.get('/services/user/api/v1/chat/api-keys', {
      headers: { Authorization: `Bearer ${token}` }
    })
    apiKeys.value = res.data.api_keys || []
    if (res.data.api_keys?.length > 0) {
      selectedApiKey.value = res.data.api_keys[0].key
    }
  } catch (err) {
    console.error('Failed to fetch API keys:', err)
  }
}

const fetchModels = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const res = await axios.get('/services/user/api/v1/chat/models', {
      headers: { Authorization: `Bearer ${token}` }
    })
    models.value = res.data.models || []
  } catch (err) {
    console.error('Failed to fetch models:', err)
  }
}

onMounted(() => {
  fetchApiKeys()
  fetchModels()
})

const handleSend = async () => {
  if (!input.value.trim() || isLoading.value || !selectedApiKey.value) return

  const userMessage: ChatMessage = { role: 'user', content: input.value.trim() }
  messages.value.push(userMessage)
  const newMessages = [...messages.value]
  input.value = ''
  isLoading.value = true
  currentModel.value = selectedModel.value

  try {
    const token = localStorage.getItem('access_token')
    const res = await axios.post('/services/user/api/v1/chat',
      {
        messages: newMessages,
        api_key_name: selectedApiKey.value,
        model: selectedModel.value
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    messages.value.push({ role: 'assistant', content: res.data.content })
  } catch (err: any) {
    const errorMsg = err.response?.data?.detail || '抱歉，发生了错误，请稍后重试。'
    messages.value.push({ role: 'assistant', content: `错误: ${errorMsg}` })
  } finally {
    isLoading.value = false
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>
