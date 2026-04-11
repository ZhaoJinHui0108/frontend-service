<template>
  <button
    :type="type"
    :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false,
  loading: false
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-medium {
  padding: 10px 20px;
  font-size: 14px;
}

.btn-large {
  padding: 12px 24px;
  font-size: 16px;
}

/* Variants */
.btn-primary {
  background: #18181b;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #222222;
}

.btn-primary:active:not(:disabled) {
  background: #0f0f10;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e5e5;
}

.btn-secondary:active:not(:disabled) {
  background: #d9d9d9;
}

.btn-danger {
  background: #ff4d4f;
  color: #ffffff;
}

.btn-danger:hover:not(:disabled) {
  background: #ff6970;
}

.btn-danger:active:not(:disabled) {
  background: #e62e33;
}

.btn-ghost {
  background: transparent;
  color: #45515e;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

/* Loading */
.btn-loading {
  position: relative;
  color: transparent !important;
}

.loading-spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
