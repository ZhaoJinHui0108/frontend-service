<template>
  <span :class="['badge', `badge-${variant}`, className]">
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'
  className?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  className: ''
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}

/* Variants */
.badge-primary {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.badge-secondary {
  background: #f0f0f0;
  color: #45515e;
}

.badge-success {
  background: #e8ffea;
  color: #52c41a;
}

.badge-warning {
  background: #fffbe6;
  color: #faad14;
}

.badge-error {
  background: #fff2f0;
  color: #ff4d4f;
}

.badge-muted {
  background: #f0f0f0;
  color: #8e8e93;
}
</style>
