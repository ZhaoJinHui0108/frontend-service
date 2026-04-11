<template>
  <div :class="['alert', `alert-${type}`]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'info' | 'success' | 'warning' | 'error'
}

withDefaults(defineProps<Props>(), {
  type: 'info'
})
</script>

<style scoped>
.alert {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid;
}

/* Variants */
.alert-info {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.alert-success {
  background: #e8ffea;
  border-color: #b7eb8f;
  color: #52c41a;
}

.alert-warning {
  background: #fffbe6;
  border-color: #ffe58f;
  color: #faad14;
}

.alert-error {
  background: #fff2f0;
  border-color: #ffccc7;
  color: #ff4d4f;
}
</style>
