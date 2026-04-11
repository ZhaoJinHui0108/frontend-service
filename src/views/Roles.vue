<template>
  <div class="page-container">
    <h1>角色管理</h1>
    <UiCard>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td>{{ role.id }}</td>
              <td>{{ role.name }}</td>
              <td>{{ role.description }}</td>
              <td>{{ formatDate(role.created_at) }}</td>
              <td>
                <UiButton variant="secondary" size="small">编辑</UiButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UiCard, UiButton } from '@/components/ui'
import { roleApi, type Role } from '@/services/authService'

const roles = ref<Role[]>([])

const loadRoles = async () => {
  const { data } = await roleApi.list()
  roles.value = data
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(loadRoles)
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

.table-wrapper {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  color: #45515e;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
  font-size: 14px;
  color: #222222;
}

.data-table tr:hover td {
  background: #fafafa;
}
</style>
