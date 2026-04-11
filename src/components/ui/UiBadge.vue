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
