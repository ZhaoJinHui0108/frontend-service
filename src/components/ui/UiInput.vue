<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="['input', className]"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'datetime-local'
  placeholder?: string
  disabled?: boolean
  className?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  className: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #222222;
  background: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.input::placeholder {
  color: #8e8e93;
}
</style>
