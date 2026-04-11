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
