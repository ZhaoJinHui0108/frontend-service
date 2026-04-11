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
