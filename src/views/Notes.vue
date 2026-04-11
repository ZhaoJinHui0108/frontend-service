<template>
  <div class="page-container">
    <h1>笔记</h1>
    <UiCard>
      <div class="notes-content">
        <p class="text-muted">笔记功能开发中...</p>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { UiCard } from '@/components/ui'
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-container h1 {
  font-size: 32px;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 32px;
}

.notes-content {
  padding: 40px;
  text-align: center;
}

.text-muted {
  color: #8e8e93;
}
</style>
