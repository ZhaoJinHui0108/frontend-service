<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="handleOverlayClick">
      <div :class="['modal', size]" :style="{ minWidth: minWidth }">
        <div v-if="showHeader" class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" @click="$emit('close')">&times;</button>
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
