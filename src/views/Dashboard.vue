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
