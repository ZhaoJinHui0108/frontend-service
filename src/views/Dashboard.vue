<template>
  <div class="page-container">
    <h1>Dashboard</h1>
    <div class="dashboard-grid">
      <UiCard class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">用户总数</div>
        </div>
      </UiCard>
      <UiCard class="stat-card">
        <div class="stat-icon">🤖</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.tasks }}</div>
          <div class="stat-label">AI任务</div>
        </div>
      </UiCard>
      <UiCard class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.scheduledTasks }}</div>
          <div class="stat-label">定时任务</div>
        </div>
      </UiCard>
      <UiCard class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.trainingJobs }}</div>
          <div class="stat-label">训练任务</div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UiCard } from '@/components/ui'

const stats = ref({
  users: 0,
  tasks: 0,
  scheduledTasks: 0,
  trainingJobs: 0
})

onMounted(async () => {
  // Fetch stats from APIs
})
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  border-radius: 16px;
  border: 1px solid #f2f3f5;
}

.stat-icon {
  font-size: 40px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #18181b;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #8e8e93;
  margin-top: 4px;
}
</style>
