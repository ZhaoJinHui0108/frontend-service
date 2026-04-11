<template>
  <div :class="['card', className]" :style="style">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  className?: string
  style?: Record<string, string | number>
}

withDefaults(defineProps<Props>(), {
  className: '',
  style: () => ({})
})
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}
</style>
