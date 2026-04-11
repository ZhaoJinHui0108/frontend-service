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
