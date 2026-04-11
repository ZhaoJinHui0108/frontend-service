<template>
  <select
    :value="modelValue"
    :class="['select', className]"
    :disabled="disabled"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
export interface SelectOption {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  className: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #222222;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
</style>
