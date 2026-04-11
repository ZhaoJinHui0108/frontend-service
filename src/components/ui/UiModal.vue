<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="handleOverlayClick">
      <div :class="['modal', `modal-${size}`]" :style="{ minWidth: minWidth }">
        <div v-if="showHeader" class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" @click="$emit('close')">×</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="showFooter" class="modal-footer">
          <slot name="footer">
            <UiButton variant="secondary" @click="$emit('close')">取消</UiButton>
            <UiButton variant="primary" @click="$emit('confirm')">确定</UiButton>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import UiButton from './UiButton.vue'

interface Props {
  show: boolean
  title?: string
  size?: 'small' | 'medium' | 'large'
  minWidth?: string
  showHeader?: boolean
  showFooter?: boolean
  closeOnOverlay?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  size: 'medium',
  minWidth: '400px',
  showHeader: true,
  showFooter: true,
  closeOnOverlay: true
})

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.2s ease;
}

.modal-small {
  width: 400px;
}

.modal-medium {
  width: 560px;
}

.modal-large {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f2f3f5;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #18181b;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #8e8e93;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.modal-close:hover {
  color: #18181b;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f2f3f5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
