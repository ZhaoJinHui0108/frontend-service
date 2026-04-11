<template>
  <Teleport to="body">
    <UiModal
      :show="show"
      :title="title"
      :show-footer="false"
      @close="handleCancel"
    >
      <div class="confirm-modal-content">
        <p>{{ message }}</p>
      </div>
      <template #footer>
        <UiButton variant="secondary" @click="handleCancel">取消</UiButton>
        <UiButton variant="danger" @click="handleConfirm">确定</UiButton>
      </template>
    </UiModal>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认',
  message: '确定要执行此操作吗？'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
